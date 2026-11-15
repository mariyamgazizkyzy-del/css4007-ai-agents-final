import { readFileSync } from "node:fs";

const DEFAULT_PATH = new URL("../data/courses.json", import.meta.url);

export function loadCourses(path = DEFAULT_PATH) {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  if (!raw || typeof raw.courses !== "object") throw new Error("courses.json has no 'courses' object");
  return raw.courses;
}

export function getCourseInfo(courseId, courses) {
  const c = courses[courseId];
  if (!c) return { error: `Course ${courseId} not found` };
  return { course_id: courseId, title: c.title, credits: c.credits, exam_date: c.exam_date };
}

export function getCourseDeadlines(courseId, courses) {
  const c = courses[courseId];
  if (!c) return { error: `Course ${courseId} not found` };
  const deadlines = [...c.deadlines].sort((a, b) => a.date.localeCompare(b.date));
  return { course_id: courseId, deadlines };
}

/** Whole days from today (UTC date) to an ISO date. Negative = in the past. */
export function daysUntil(isoDate, today = new Date()) {
  const t = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const [y, m, d] = isoDate.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - t) / 86400000);
}
