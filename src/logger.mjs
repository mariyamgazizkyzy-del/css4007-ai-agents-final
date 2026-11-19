import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_PATH = fileURLToPath(new URL("../logs/run.jsonl", import.meta.url));

function redact(value) {
  if (typeof value === "string") {
    return value
      .replace(/sk-[A-Za-z0-9_-]{8,}/g, "[REDACTED]")
      .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
      .slice(0, 500);
  }
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, redact(v)]));
  }
  return value;
}

/** Append one JSON line to the execution log. Secrets are redacted. */
export function appendLog(entry, path = DEFAULT_PATH) {
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, JSON.stringify(redact(entry)) + "\n", "utf8");
}