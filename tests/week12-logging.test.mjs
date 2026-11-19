import test from "node:test";
import assert from "node:assert/strict";
import { handle } from "../src/assistant.mjs";
import { loadCourses } from "../src/data.mjs";

const courses = loadCourses();
const today = new Date("2026-11-19T10:00:00Z");
const fake = (...c) => { let i = 0; return async () => ({ content: c[Math.min(i++, c.length - 1)] }); };

test("model cannot answer a course-code question as 'general'", async () => {
  const f = fake('{"intent":"general","answer":"I do not know."}', '{"intent":"course_info","course_id":"CS999"}');
  const r = await handle("Exam for CS999?", { chatFn: f, courses, today });
  assert.equal(r.status, "not_found");
  assert.match(r.answer, /no data for CS999/);
});
test("general questions without course codes still work", async () => {
  const r = await handle("What is a syllabus?", { chatFn: fake('{"intent":"general","answer":"A course outline."}'), courses, today });
  assert.equal(r.status, "ok");
});
test("logging failure never breaks the assistant", async () => {
  const r = await handle("AI101 exam?", { chatFn: fake('{"intent":"course_info","course_id":"AI101"}'), courses, today, logger: () => { throw new Error("x"); } });
  assert.equal(r.status, "ok");
});