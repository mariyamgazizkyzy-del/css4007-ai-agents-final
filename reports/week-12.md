## Week 12 Progress Report

## Completed Work

Implemented the core functionality of the course assistant. Added a sample course dataset (`data/courses.json`) and data functions (`src/data.mjs`: course info, sorted deadlines, days until a date). Wrote the prompt with a strict JSON schema and examples (`src/prompts.mjs`). Added input validation, JSON parsing, and structured-output validation (`src/validate.mjs`): the model's reply must be a JSON object with an allowed intent, a valid course id, and no extra fields. Built the pipeline in `src/assistant.mjs`: validate input, call the LLM, validate its output (one repair retry), look up the data, and build the answer from real data. Added 16 tests with a mocked LLM.

## Important Commits

- Commit hash: TODO-fill-after-commit
- Description: Add dataset, prompts, structured output validation and core pipeline
- Link: TODO-fill-after-commit

## Current Functionality

`node src/index.mjs "When is the AI101 exam?"` sends the question to the LLM, which returns a structured intent; the answer (credits, exam date, deadlines, days left) is then built from the dataset, not from the model text. Unknown courses are reported as "no data". Empty or too long input is rejected before the LLM is called. Malformed model output is retried once, then rejected. LLM/API failures give a readable message. Tool selection by the LLM is not implemented yet (Week 13).

## Problems Encountered

LLMs sometimes wrap JSON in markdown or add extra text, and may return fields or intents that are not allowed. Date arithmetic by the model is unreliable.

## Solutions

Strict parsing that tolerates code fences, schema validation with an allowed-intent list and rejection of extra fields, one repair retry with the error message, and date arithmetic done in code. Answers use only dataset values.

## What I Learned

Structured output must be validated in code, not trusted. Separating "understand the request" (LLM) from "get the facts" (code) prevents invented data and makes the system testable with a mocked model.

## Next Week

Register tools with the LLM, let the model choose which tool to call, execute real tool calls with argument validation, and add tool execution logs.
