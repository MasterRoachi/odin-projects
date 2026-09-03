/* =========================================================
   The store: everything the application knows, every way of
   changing it, and every question you can ask of it.

   This is the half the lesson cares about. It holds the data
   and the rules; it does not know a browser is displaying it.
   The interface subscribes and is told when something moved.

   Nothing in this file touches the DOM.
   ========================================================= */

import { createProject, nextTint, PALETTE } from "./project.js";
import {
  createChecklistItem,
  createTodo,
  isDueToday,
  isOverdue,
  isUpcoming,
} from "./todo.js";

const STORAGE_KEY = "odin-todo";

export const VIEWS = ["today", "upcoming", "overdue", "all"];

const state = {
  projects: [],
  /** either one of VIEWS, or a project id */
  selected: "today",
};

/* ---------------------------------------------------------
   Subscribers
   --------------------------------------------------------- */

const listeners = new Set();

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function changed() {
  save();
  listeners.forEach((listener) => listener());
}

/* ---------------------------------------------------------
   Persistence
   --------------------------------------------------------- */

function save() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ projects: state.projects, selected: state.selected })
    );
  } catch {
    /* private mode or a full quota — the list still works for this session */
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const stored = JSON.parse(raw);
    if (!stored || !Array.isArray(stored.projects) || stored.projects.length === 0) {
      return false;
    }

    // Anything could be in storage — a half-written value, an older shape, or
    // something a person typed into devtools. Everything is put back through
    // the same defaults the factories use rather than trusted as-is.
    state.projects = stored.projects.map((project) => ({
      id: project.id || crypto.randomUUID(),
      name: String(project.name ?? "Untitled"),
      tint: project.tint || PALETTE[0].tint,
      created: project.created || Date.now(),
      todos: Array.isArray(project.todos)
        ? project.todos.map((todo) => ({
            ...createTodo(todo),
            id: todo.id || crypto.randomUUID(),
            done: Boolean(todo.done),
            created: todo.created || Date.now(),
            checklist: Array.isArray(todo.checklist)
              ? todo.checklist.map((item) => ({
                  ...createChecklistItem(item.text ?? ""),
                  id: item.id || crypto.randomUUID(),
                  done: Boolean(item.done),
                }))
              : [],
          }))
        : [],
    }));

    state.selected = stored.selected || "today";
    return true;
  } catch {
    return false;
  }
}

/* ---------------------------------------------------------
   Reading
   --------------------------------------------------------- */

export const getProjects = () => state.projects;
export const getSelected = () => state.selected;
export const isView = (key) => VIEWS.includes(key);

export const findProject = (id) => state.projects.find((project) => project.id === id);

export function findTodo(id) {
  for (const project of state.projects) {
    const todo = project.todos.find((item) => item.id === id);
    if (todo) return { todo, project };
  }
  return null;
}

const everyTodo = () =>
  state.projects.flatMap((project) =>
    project.todos.map((todo) => ({ todo, project }))
  );

/** The todos belonging to the current view, in the order they should appear. */
export function visibleTodos() {
  const key = state.selected;

  if (key === "all") return everyTodo();
  if (key === "today") return everyTodo().filter(({ todo }) => isDueToday(todo));
  if (key === "upcoming") return everyTodo().filter(({ todo }) => isUpcoming(todo));
  if (key === "overdue") return everyTodo().filter(({ todo }) => isOverdue(todo));

  const project = findProject(key);
  return project ? project.todos.map((todo) => ({ todo, project })) : [];
}

export function counts() {
  const all = everyTodo();
  return {
    today: all.filter(({ todo }) => isDueToday(todo) && !todo.done).length,
    upcoming: all.filter(({ todo }) => isUpcoming(todo)).length,
    overdue: all.filter(({ todo }) => isOverdue(todo)).length,
    all: all.filter(({ todo }) => !todo.done).length,
  };
}

export const openCount = (project) => project.todos.filter((todo) => !todo.done).length;

/* ---------------------------------------------------------
   Writing
   --------------------------------------------------------- */

export function select(key) {
  state.selected = key;
  changed();
}

export function addProject(name) {
  const project = createProject(name, nextTint(state.projects));
  state.projects.push(project);
  state.selected = project.id;
  changed();
  return project;
}

export function renameProject(id, name) {
  const project = findProject(id);
  if (!project || !name.trim()) return;
  project.name = name.trim();
  changed();
}

export function removeProject(id) {
  // there is always somewhere for a todo to live
  if (state.projects.length <= 1) return;
  state.projects = state.projects.filter((project) => project.id !== id);
  if (state.selected === id) state.selected = "today";
  changed();
}

/** Where a new todo goes when the current view is a date rather than a project. */
export function defaultProjectId() {
  if (!isView(state.selected) && findProject(state.selected)) return state.selected;
  return state.projects[0]?.id;
}

export function addTodo(projectId, fields) {
  const project = findProject(projectId) || state.projects[0];
  if (!project) return null;
  const todo = createTodo(fields);
  project.todos.push(todo);
  changed();
  return todo;
}

export function updateTodo(id, fields) {
  const found = findTodo(id);
  if (!found) return;
  Object.assign(found.todo, fields);
  changed();
}

export function toggleDone(id) {
  const found = findTodo(id);
  if (!found) return;
  found.todo.done = !found.todo.done;
  changed();
}

export function removeTodo(id) {
  const found = findTodo(id);
  if (!found) return;
  found.project.todos = found.project.todos.filter((todo) => todo.id !== id);
  changed();
}

export function addChecklistItem(todoId, text) {
  const found = findTodo(todoId);
  if (!found || !text.trim()) return;
  found.todo.checklist.push(createChecklistItem(text));
  changed();
}

export function toggleChecklistItem(todoId, itemId) {
  const found = findTodo(todoId);
  if (!found) return;
  const item = found.todo.checklist.find((entry) => entry.id === itemId);
  if (!item) return;
  item.done = !item.done;
  changed();
}

export function removeChecklistItem(todoId, itemId) {
  const found = findTodo(todoId);
  if (!found) return;
  found.todo.checklist = found.todo.checklist.filter((entry) => entry.id !== itemId);
  changed();
}

/** Drops `draggedId` immediately before `targetId`, moving it between projects if needed. */
export function moveTodoBefore(draggedId, targetId) {
  const dragged = findTodo(draggedId);
  const target = findTodo(targetId);
  if (!dragged || !target || draggedId === targetId) return;

  dragged.project.todos = dragged.project.todos.filter((todo) => todo.id !== draggedId);
  const index = target.project.todos.findIndex((todo) => todo.id === targetId);
  target.project.todos.splice(index, 0, dragged.todo);
  changed();
}

/** Drops a todo into another project, at the end. */
export function moveTodoToProject(todoId, projectId) {
  const found = findTodo(todoId);
  const project = findProject(projectId);
  if (!found || !project || found.project.id === projectId) return;

  found.project.todos = found.project.todos.filter((todo) => todo.id !== todoId);
  project.todos.push(found.todo);
  changed();
}

/* ---------------------------------------------------------
   Start up
   --------------------------------------------------------- */

function seed() {
  const today = new Date();
  const iso = (offset) => {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
  };

  const house = createProject("The house", PALETTE[1].tint);
  const terrath = createProject("Terrath", PALETTE[3].tint);
  const admin = createProject("Admin", PALETTE[0].tint);

  house.todos.push(
    createTodo({
      title: "Rewire the porch light",
      description: "The switch works but the fitting is loose.",
      dueDate: iso(-2),
      priority: "high",
      checklist: ["Buy cable", "Kill the circuit", "Pull the old fitting", "Fit the new one"],
    }),
    createTodo({
      title: "Order the shelf brackets",
      dueDate: iso(0),
      priority: "normal",
    })
  );

  terrath.todos.push(
    createTodo({
      title: "Write the ashfall decision record",
      description: "Decide whether the ashfall predates the shepherds.",
      dueDate: iso(0),
      priority: "high",
      notes: "Check what the registry already implies before committing to a date.",
    }),
    createTodo({
      title: "Reconcile the entity registry",
      dueDate: iso(4),
      priority: "normal",
      checklist: ["Export current entities", "Diff against the canon", "Resolve conflicts"],
    }),
    createTodo({ title: "Name the third shepherd", priority: "low" })
  );

  admin.todos.push(
    createTodo({ title: "Renew the domain", dueDate: iso(9), priority: "normal" }),
    createTodo({ title: "Back up the world repo", dueDate: iso(1), priority: "low" })
  );

  state.projects = [house, terrath, admin];
  state.selected = "today";
}

export function start() {
  if (!load()) {
    seed();
    save();
  }
}
