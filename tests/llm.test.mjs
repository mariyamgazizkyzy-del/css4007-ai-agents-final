import test from "node:test";
import assert from "node:assert/strict";
import { chat, loadConfig, LLMError } from "../src/llm.mjs";

const config = { apiKey: "k", model: "m", baseUrl: "http://x/v1" };
const ok = (content) => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }] }) });
const fail = (status) => ({ ok: false, status, json: async () => ({}) });

test("returns assistant text", async () => {
  const r = await chat([{ role: "user", content: "hi" }], { config, fetchImpl: async () => ok("hello") });
  assert.equal(r.content, "hello");
});
test("missing config is rejected", () => {
  assert.throws(() => loadConfig({}), (e) => e instanceof LLMError && e.kind === "config");
});
test("retries 429 then succeeds", async () => {
  let n = 0;
  const r = await chat([{ role: "user", content: "hi" }], { config, backoffMs: 1,
    fetchImpl: async () => (++n < 3 ? fail(429) : ok("done")) });
  assert.equal(r.content, "done"); assert.equal(n, 3);
});
test("auth error is not retried", async () => {
  let n = 0;
  await assert.rejects(chat([{ role: "user", content: "hi" }], { config, backoffMs: 1,
    fetchImpl: async () => (n++, fail(401)) }), (e) => e.kind === "auth");
  assert.equal(n, 1);
});
test("malformed response is rejected", async () => {
  await assert.rejects(chat([{ role: "user", content: "hi" }], { config,
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({}) }) }), (e) => e.kind === "bad_response");
});
