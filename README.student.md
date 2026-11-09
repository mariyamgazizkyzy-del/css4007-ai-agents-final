# UniPlan Agent (CSS 4007 final project, level C)

## Setup
1. Rename `_env.example` → `.env.example`, copy it to `.env`, fill `LLM_API_KEY`, `LLM_MODEL` (optional `LLM_BASE_URL`).
2. Rename `_gitignore` → `.gitignore` (so `.env` is never committed).
3. Node.js 22+.

## Run
```
node src/index.mjs "When is the AI101 exam?"
npm test
```

## Status
Week 11: LLM client + first request + 5 tests. Tools come in Week 13.
