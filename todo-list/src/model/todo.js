/* =========================================================
   A todo, and the pure things you can ask about one.

   Todos are plain data made by a factory. Behaviour lives in
   modules rather than on the objects themselves, which means
   the serialisation problem the lesson warns about never
   arises: there are no methods for JSON.stringify to drop, so
   nothing has to be re-attached on the way back in.

   Nothing in this file touches the DOM.
   ========================================================= */

import { differenceInCalendarDays, isToday, isTomorrow, startOfDay } from "date-fns";

export const PRIORITIES = ["low", "normal", "high"];

export function createTodo({
  title,
  description = "",
  dueDate = null,
  priority = "normal",
  notes = "",
  checklist = [],
} = {}) {
  return {
    id: crypto.randomUUID(),
    title: String(title).trim(),
    description: String(description).trim(),
    dueDate: dueDate || null, // stored as "YYYY-MM-DD", the value an <input type=date> gives
    priority: PRIORITIES.includes(priority) ? priority : "normal",
    notes: String(notes).trim(),
    checklist: checklist.map((item) =>
      typeof item === "string" ? createChecklistItem(item) : item
    ),
    done: false,
    created: Date.now(),
  };
}

export function createChecklistItem(text) {
  return { id: crypto.randomUUID(), text: String(text).trim(), done: false };
}

/** "YYYY-MM-DD" to a Date at local midnight, so comparisons are by day. */
export function dueDateOf(todo) {
  if (!todo.dueDate) return null;
  const [year, month, day] = todo.dueDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isOverdue(todo) {
  if (todo.done) return false;
  const due = dueDateOf(todo);
  if (!due) return false;
  return due < startOfDay(new Date());
}

export function isDueToday(todo) {
  const due = dueDateOf(todo);
  return Boolean(due) && isToday(due);
}

export function isUpcoming(todo) {
  if (todo.done) return false;
  const due = dueDateOf(todo);
  if (!due) return false;
  return due > startOfDay(new Date());
}

/** A short, human way of saying when something is due. */
export function dueLabel(todo) {
  const due = dueDateOf(todo);
  if (!due) return "";
  if (isToday(due)) return "Today";
  if (isTomorrow(due)) return "Tomorrow";

  const days = differenceInCalendarDays(due, startOfDay(new Date()));
  if (days < 0) return days === -1 ? "Yesterday" : `${Math.abs(days)} days ago`;
  if (days < 7) return due.toLocaleDateString(undefined, { weekday: "long" });
  return due.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function checklistProgress(todo) {
  const total = todo.checklist.length;
  const done = todo.checklist.filter((item) => item.done).length;
  return { done, total };
}
