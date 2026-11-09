## Week 11 Progress Report

## Completed Work

Set up the development environment (Node 22, `.env` from `.env.example`). Implemented a provider-agnostic LLM client in `src/llm.mjs` (OpenAI-compatible chat completions) with timeout, retry with backoff for 429/5xx/network errors, and typed errors. Implemented the first working request in `src/index.mjs` (CLI question → LLM → answer) with basic input validation. Added 5 unit tests with a mocked API and documented usage.

## Important Commits

- Commit hash: 0e39b79
- Description: Add LLM client and first working request
- Link: https://github.com/mariyamgazizkyzy-del/css4007-ai-agents-final/commit/0e39b79

## Current Functionality

`node src/index.mjs "When is the AI101 exam?"` sends the question to the configured LLM and prints the answer. Empty or too long input is rejected. API failures give a readable error instead of a crash. No tools yet.

## Problems Encountered

Different providers use different endpoints and error formats; API failures such as rate limits need to be handled without crashing.

## Solutions

Used the OpenAI-compatible format so the provider can be changed via `LLM_BASE_URL`; added retry with exponential backoff for transient errors and no retry for auth errors; tested everything with a mocked `fetch`.

## What I Learned

How a chat-completions request is structured, how to separate transient from permanent API errors, and why API keys must stay in `.env` and out of the repository and logs.

## Next Week

Add prompts and structured output, validate inputs and outputs, and add the course dataset.
