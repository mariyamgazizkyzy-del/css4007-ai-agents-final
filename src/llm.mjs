// Provider-agnostic LLM client (OpenAI-compatible /chat/completions). No dependencies.
export class LLMError extends Error {
  constructor(message, { kind = "unknown", status } = {}) {
    super(message);
    this.name = "LLMError";
    this.kind = kind; // config | auth | rate_limit | server | timeout | network | bad_response
    this.status = status;
  }
}

export function loadConfig(env = process.env) {
  const apiKey = env.LLM_API_KEY?.trim();
  const model = env.LLM_MODEL?.trim();
  if (!apiKey || !model) {
    throw new LLMError("LLM_API_KEY and LLM_MODEL must be set in .env", { kind: "config" });
  }
  const baseUrl = (env.LLM_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/+$/, "");
  return { apiKey, model, baseUrl };
}

const RETRYABLE = new Set(["rate_limit", "server", "timeout", "network"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function once(messages, { config, tools, fetchImpl, timeoutMs }) {
  const body = { model: config.model, messages };
  if (tools?.length) body.tools = tools;
  let res;
  try {
    res = await fetchImpl(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    const kind = e.name === "TimeoutError" || e.name === "AbortError" ? "timeout" : "network";
    throw new LLMError(`Request failed: ${kind}`, { kind });
  }
  if (!res.ok) {
    const kind = res.status === 401 || res.status === 403 ? "auth"
      : res.status === 429 ? "rate_limit" : res.status >= 500 ? "server" : "bad_response";
    throw new LLMError(`HTTP ${res.status}`, { kind, status: res.status });
  }
  let data;
  try { data = await res.json(); } catch { throw new LLMError("Response is not JSON", { kind: "bad_response" }); }
  const msg = data?.choices?.[0]?.message;
  if (!msg) throw new LLMError("Response has no message", { kind: "bad_response" });
  return { content: msg.content ?? "", toolCalls: msg.tool_calls ?? [], message: msg };
}

/** Send chat messages; retries transient errors. Never logs the API key. */
export async function chat(messages, { config = loadConfig(), tools, fetchImpl = fetch,
  timeoutMs = 30000, maxRetries = 2, backoffMs = 500 } = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new LLMError("messages must be a non-empty array", { kind: "config" });
  }
  for (let attempt = 0; ; attempt++) {
    try {
      return await once(messages, { config, tools, fetchImpl, timeoutMs });
    } catch (e) {
      if (!(e instanceof LLMError) || !RETRYABLE.has(e.kind) || attempt >= maxRetries) throw e;
      await sleep(backoffMs * 2 ** attempt);
    }
  }
}
