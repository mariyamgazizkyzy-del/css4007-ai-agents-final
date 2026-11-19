## Week 12 Progress Report

## Completed Work

The core pipeline of the course assistant was built early (end of week 11) and extended in week 12. Pipeline: input validation, LLM call with a strict JSON-schema prompt, validation of the model output (one repair retry), data lookup, and an answer built from the dataset instead of model text. In week 12 I added execution logging (`src/logger.mjs`, `logs/run.jsonl`) with redaction of API keys and tokens, fixed the CLI entry point for Windows, wrote additional tests, and added a guard that rejects a `general` intent when the question contains a course code, so the model cannot answer course questions without the dataset.

## Important Commits

- Commit hash: 3b4fd31
- Description: Fix CLI entry point on Windows and add execution logging
- Link: https://github.com/mariyamgazizkyzy-del/css4007-ai-agents-final/commit/3b4fd31

- Commit hash: 11ca424
- Description: Add logging and guard tests
- Link: https://github.com/mariyamgazizkyzy-del/css4007-ai-agents-final/commit/11ca424

- Commit hash: HASH4
- Description: Reject general intent for course-code questions
- Link: https://github.com/mariyamgazizkyzy-del/css4007-ai-agents-final/commit/HASH4

## Current Functionality

`node src/index.mjs "When is the AI101 exam?"` returns credits and exam date from the dataset. `"What is due in ML201?"` lists sorted deadlines, `"How many days until DB210 exam?"` computes days left in code, and `"Exam for CS999?"` answers that there is no data. Each request is written to `logs/run.jsonl` with the goal, status, and a trace of validation and lookup steps; secrets are redacted. Empty or too long input is rejected before the LLM call. Tool selection by the LLM is not implemented yet (week 13).

## Problems Encountered

The free OpenRouter model sometimes classified a course question as `general` and answered from its own knowledge, so the dataset was not used (for CS999 it gave a generic reply). Free models also vary between runs. LLMs may wrap JSON in markdown or return fields that are not allowed.

## Solutions

Added a validation rule: if the question contains a course code, a `general` intent is rejected and the model is asked again with an error message. Added a test for this case. Strict JSON parsing with schema validation and one repair retry. Logging is wrapped so that a logging failure never breaks the assistant. Date arithmetic is done in code.

## What I Learned

Model output must be validated in code, not trusted, and facts should come from data, not from the model. Execution logs make behavior checkable and need redaction so secrets never reach the repository.

## Next Week

Register the lookup functions as tools, let the LLM choose which tool to call, validate tool arguments, execute real tool calls, and log tool execution.