# Project Proposal

## Project Title

UniPlan Agent — Academic Deadline and Course Information Assistant

## Problem Description

Students must look up course data (credits, exam dates, deadlines) in several places and then work out what to do first. A plain chatbot may invent dates. This application answers such questions using real tool results (a course/deadline data source) instead of guessing, and says clearly when information is unavailable.

## Target Users

University students who need quick, correct answers about their courses and deadlines.

## Selected Difficulty

C

## Expected Functionality

- Answer course questions (credits, exam date, title) by calling tools.
- List deadlines for a course, sorted chronologically.
- Answer general questions that need no tools directly.
- Report clearly when a course or data is not found.
- Validate tool arguments and log every tool call.

## Proposed Functions

| Name | Purpose | Input | Expected output | Dependencies |
|---|---|---|---|---|
| `get_course_info(course_id)` | Return title, credits, exam date | `course_id: string` (e.g. `AI101`) | `{title, credits, exam_date}` or `{error}` | local JSON dataset |
| `get_course_deadlines(course_id)` | Return deadlines for a course | `course_id: string` | sorted list of ISO dates or `{error}` | local JSON dataset |
| `days_until(date)` | Days from today to a date | `date: YYYY-MM-DD` | integer | Date API |
| `validate_args(schema, args)` | Reject malformed tool arguments before execution | schema, args object | `{ok}` or `{ok:false, reason}` | none |
| `chat(messages, tools)` | Call the LLM | messages, tool schemas | assistant message / tool calls | LLM provider API |
| `log_tool_call(entry)` | Record tool execution log (no secrets) | entry object | appended log line | file system |

## Proposed Agent Tools

Exposed to the LLM: `get_course_info`, `get_course_deadlines`, `days_until`.

- `get_course_info` — the agent must not invent credits or exam dates.
- `get_course_deadlines` — needed to answer deadline questions from real data.
- `days_until` — LLMs are unreliable at date arithmetic.

`validate_args`, `chat`, and `log_tool_call` are internal and not exposed to the LLM.

## Model Selection

An OpenAI-compatible chat-completions API with function calling, configured through `LLM_API_KEY`, `LLM_MODEL`, and `LLM_BASE_URL` in `.env` (model is swappable without code changes). Implemented in Node.js 22 with no external dependencies.

## Architecture

```
User request
    ↓
Input validation
    ↓
LLM (with registered tools)
    ↓
Tool call? ── no ──→ Answer
    │ yes
    ↓
Validate arguments → Execute tool → Log
    ↓
Tool result returned to LLM
    ↓
Final answer grounded in tool results
```

## Example Requests

1. "When is the AI101 exam?"
2. "How many credits does ML201 have and what are its deadlines?"
3. "What is the exam date for CS999?" (expected: not found, no invented answer)
4. "Explain what a deadline extension request usually contains." (no tool needed)

## Evaluation Plan

At least 8 automated tests: correct tool selection; correct arguments; answer uses tool result; no-tool question; unknown course; malformed arguments rejected; tool failure handled; API failure handled. Tests use a mocked LLM client for reproducibility plus a manual run with the real model. Results are recorded in `reports/week-16.md`.

## Weekly Milestones

- Week 10: proposal, repository setup.
- Week 11: environment, LLM client, first working request, tests with mocked API, basic documentation.
- Week 12: prompts, structured outputs, input/output validation, dataset.
- Week 13: tool schemas, LLM tool selection, real tool execution.
- Week 14: complete tool-calling workflow, tool error handling.
- Week 15: failure handling, validation, expanded tests, execution logs.
- Week 16: run full test suite, record results, fix failures, update docs.
- Week 17: final README, final commit hash, demo, defense.

## AI Assistance Disclosure

AI coding assistants were used for drafting boilerplate and documentation; I review, run, and can explain all code.
