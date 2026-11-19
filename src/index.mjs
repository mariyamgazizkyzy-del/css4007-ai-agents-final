import readline from "node:readline/promises";
import { handle } from "./assistant.mjs";

try { process.loadEnvFile(); } catch { /* .env optional if variables are exported */ }

export async function ask(question) {
  const r = await handle(question);
  return r.answer;
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
