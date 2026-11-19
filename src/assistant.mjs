import { chat, LLMError } from "./llm.mjs";
import { loadCourses, getCourseInfo, getCourseDeadlines, daysUntil } from "./data.mjs";
import { validateUserInput, parseJsonStrict, validateIntent, validateIsoDate } from "./validate.mjs";
import { buildIntentMessages, buildRepairMessages } from "./prompts.mjs";

/**
 * Week 12 pipeline: input validation -> LLM (structured JSON) -> output validation
 * -> data lookup -> answer built from real data. Week 13 replaces the fixed lookup
 * step with LLM-selected tool calls.
 */
async function run(question, { chatFn = chat, courses, today = new Date(), maxFormatRetries = 1 } = {}) {
  const trace = [];
  const inp = validateUserInput(question);
  if (!inp.ok) return { status: "invalid_input", answer: inp.reason, trace };
  courses ??= loadCourses();

  let messages = buildIntentMessages(inp.value);
  let intent;
  for (let attempt = 0; attempt <= maxFormatRetries; attempt++) {
    let reply;
    try {
      reply = await chatFn(messages);
    } catch (e) {
      if (e instanceof LLMError) {
        trace.push({ step: "llm", error: e.kind });
        return { status: "llm_error", answer: `The language model is unavailable (${e.kind}). Try again later.`, trace };
      }
      throw e;
    }
    const parsed = parseJsonStrict(reply.content);
    let checked = parsed.ok ? validateIntent(parsed.value) : parsed;
    if (checked.ok && checked.value.intent === "general" && /\b[A-Za-z]{2,4}\d{3}\b/.test(inp.value)) {
      checked = { ok: false, reason: "the question mentions a course code, so use course_info, deadlines or exam_countdown, not general" };
    }
    trace.push({ step: "llm_output", attempt, valid: checked.ok, reason: checked.ok ? undefined : checked.reason });
    if (checked.ok) { intent = checked.value; break; }
    messages = buildRepairMessages(inp.value, reply.content, checked.reason);
  }
  if (!intent) {
    return { status: "invalid_output", answer: "I could not understand the request. Please rephrase it.", trace };
  }

  if (intent.intent === "general") return { status: "ok", intent, answer: intent.answer, trace };

  if (intent.intent === "course_info") {
    const r = getCourseInfo(intent.course_id, courses);
    trace.push({ step: "lookup", intent: intent.intent, course_id: intent.course_id, found: !r.error });
    if (r.error) return { status: "not_found", intent, answer: `I have no data for ${intent.course_id}.`, trace };
    return { status: "ok", intent, trace,
      answer: `${r.course_id} — ${r.title}: ${r.credits} credits, exam on ${r.exam_date}.` };
  }

  if (intent.intent === "deadlines") {
    const r = getCourseDeadlines(intent.course_id, courses);
    trace.push({ step: "lookup", intent: intent.intent, course_id: intent.course_id, found: !r.error });
    if (r.error) return { status: "not_found", intent, answer: `I have no data for ${intent.course_id}.`, trace };
    const lines = r.deadlines.map((d) => `- ${d.name}: ${d.date}`).join("\n");
    return { status: "ok", intent, trace, answer: `Deadlines for ${r.course_id}:\n${lines}` };
  }

  // exam_countdown
  const info = getCourseInfo(intent.course_id, courses);
  trace.push({ step: "lookup", intent: intent.intent, course_id: intent.course_id, found: !info.error });
  if (info.error) return { status: "not_found", intent, answer: `I have no data for ${intent.course_id}.`, trace };
  const d = validateIsoDate(info.exam_date);
  if (!d.ok) return { status: "data_error", intent, answer: `Exam date for ${intent.course_id} is invalid in the dataset.`, trace };
  const n = daysUntil(info.exam_date, today);
  const when = n > 0 ? `${n} day(s) left` : n === 0 ? "the exam is today" : `the exam was ${-n} day(s) ago`;
  return { status: "ok", intent, trace, answer: `${info.course_id} exam is on ${info.exam_date}: ${when}.` };
}

/** Public entry point. Pass `logger` (e.g. appendLog) to record an execution trace. */
export async function handle(question, opts = {}) {
  const result = await run(question, opts);
  if (opts.logger) {
    try {
      opts.logger({
        ts: new Date().toISOString(),
        goal: typeof question === "string" ? question : String(question),
        status: result.status,
        intent: result.intent,
        trace: result.trace,
      });
    } catch { /* logging must never break the assistant */ }
  }
  return result;
}