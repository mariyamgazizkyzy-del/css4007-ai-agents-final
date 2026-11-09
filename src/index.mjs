import readline from "node:readline/promises";
import { chat, LLMError } from "./llm.mjs";

try { process.loadEnvFile(); } catch { /* .env optional if variables are exported */ }

const SYSTEM = "You are a university academic assistant. Answer briefly and clearly. " +
  "If you do not know a fact (dates, credits, policies), say so instead of guessing.";

export async function ask(question) {
  const q = (question ?? "").trim();
  if (!q) return "Please enter a question.";
  if (q.length > 2000) return "Question is too long (max 2000 characters).";
  try {
    const { content } = await chat([
      { role: "system", content: SYSTEM },
      { role: "user", content: q },
    ]);
    return content || "(empty answer)";
  } catch (e) {
    if (e instanceof LLMError) return `LLM error [${e.kind}]: ${e.message}`;
    throw e;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv.slice(2).join(" ");
  if (arg) console.log(await ask(arg));
  else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log(await ask(await rl.question("Question: ")));
    rl.close();
  }
}
