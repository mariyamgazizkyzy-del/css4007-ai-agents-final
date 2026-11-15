export const INTENTS = ["course_info", "deadlines", "exam_countdown", "general"];
const COURSE_INTENTS = new Set(["course_info", "deadlines", "exam_countdown"]);

export function validateUserInput(text) {
  if (typeof text !== "string") return { ok: false, reason: "Input must be text." };
  const value = text.trim();
  if (!value) return { ok: false, reason: "Please enter a question." };
  if (value.length > 2000) return { ok: false, reason: "Question is too long (max 2000 characters)." };
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)) return { ok: false, reason: "Input contains invalid characters." };
  return { ok: true, value };
}

export function validateCourseId(id) {
  if (typeof id !== "string") return { ok: false, reason: "course_id must be a string." };
  const value = id.trim().toUpperCase();
  if (!/^[A-Z]{2,4}\d{3}$/.test(value)) return { ok: false, reason: `Invalid course id format: ${id}` };
  return { ok: true, value };
}

export function validateIsoDate(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return { ok: false, reason: "Date must be YYYY-MM-DD." };
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    return { ok: false, reason: `Not a real calendar date: ${s}` };
  }
  return { ok: true, value: s };
}

/** Parse model output that should be a JSON object (tolerates ```json fences). */
export function parseJsonStrict(text) {
  if (typeof text !== "string") return { ok: false, reason: "Model output is not text." };
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const value = JSON.parse(cleaned);
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, reason: "Model output must be a JSON object." };
    }
    return { ok: true, value };
  } catch {
    return { ok: false, reason: "Model output is not valid JSON." };
  }
}

/** Validate the structured intent object produced by the LLM. */
export function validateIntent(obj) {
  const allowed = new Set(["intent", "course_id", "answer"]);
  for (const k of Object.keys(obj)) {
    if (!allowed.has(k)) return { ok: false, reason: `Unexpected field: ${k}` };
  }
  if (!INTENTS.includes(obj.intent)) return { ok: false, reason: `intent must be one of: ${INTENTS.join(", ")}` };
  if (COURSE_INTENTS.has(obj.intent)) {
    const c = validateCourseId(obj.course_id);
    if (!c.ok) return c;
    return { ok: true, value: { intent: obj.intent, course_id: c.value } };
  }
  if (typeof obj.answer !== "string" || !obj.answer.trim()) {
    return { ok: false, reason: "general intent requires a non-empty 'answer' string" };
  }
  return { ok: true, value: { intent: "general", answer: obj.answer.trim() } };
}
