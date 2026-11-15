# UniPlan Agent (CSS 4007 final project, level C)

## Setup
1. Node.js 22+.
2. Copy `.env.example` to `.env` and fill `LLM_API_KEY`, `LLM_MODEL` (optional `LLM_BASE_URL`). Never commit `.env`.

## Run
```
node src/index.mjs "When is the AI101 exam?"
node src/index.mjs "What is due in ML201?"
npm test
```

## Structure
- `src/llm.mjs` — LLM client (timeout, retries, typed errors)
- `src/prompts.mjs` — prompt with JSON schema
- `src/validate.mjs` — input and structured-output validation
- `src/data.mjs` — dataset access functions
- `src/assistant.mjs` — pipeline: validate → LLM → validate → lookup → answer
- `data/courses.json` — sample course data
- `tests/` — automated tests (mocked LLM)

## Status
- Week 11: LLM client, first request.
- Week 12: dataset, prompts, structured output, validation, core pipeline.
- Week 13 (planned): LLM-selected tool calls, argument validation, tool logs.
