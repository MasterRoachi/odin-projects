/* =========================================================
   Keyboard control.

   The point is to be able to run the whole list without
   reaching for the mouse, so the bindings are single keys —
   which means they have to stand aside the moment the caret
   is in a field, or typing "n" in a title would open a
   dialog instead of writing a letter.
   ========================================================= */

import * as store from "../model/store.js";
import { focusState, render } from "./app.js";
import { openAddDialog } from "./dialog.js";

const isTyping = () => {
  const node = document.activeElement;
  if (!node) return false;
  return (
    node.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(node.tagName)
  );
};

const dialogOpen = () => Boolean(document.querySelector("dialog[open]"));

function move(step) {
  const visible = store.visibleTodos();
  if (visible.length === 0) return;

  const next = focusState.index + step;
  focusState.index = Math.max(0, Math.min(visible.length - 1, next < 0 ? 0 : next));
  render();

  document.querySelector(".todo.is-focused")?.scrollIntoView({ block: "nearest" });
}

function focusedTodo() {
  const visible = store.visibleTodos();
  return visible[focusState.index]?.todo ?? null;
}

export function installKeyboard() {
  document.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (dialogOpen() || isTyping()) return;

    const key = event.key;

    // jump straight to a project by number
    if (/^[1-9]$/.test(key)) {
      const project = store.getProjects()[Number(key) - 1];
      if (project) {
        event.preventDefault();
        focusState.index = -1;
        store.select(project.id);
      }
      return;
    }

    switch (key) {
      case "n":
        event.preventDefault();
        openAddDialog();
        break;

      case "j":
      case "ArrowDown":
        event.preventDefault();
        move(1);
        break;

      case "k":
      case "ArrowUp":
        event.preventDefault();
        move(-1);
        break;

      case "x": {
        const todo = focusedTodo();
        if (!todo) return;
        event.preventDefault();
        store.toggleDone(todo.id);
        break;
      }

      case "e":
      case "Enter": {
        const todo = focusedTodo();
        if (!todo) return;
        event.preventDefault();
        focusState.openId = focusState.openId === todo.id ? null : todo.id;
        render();
        break;
      }

      case "Backspace":
      case "Delete": {
        const todo = focusedTodo();
        if (!todo) return;
        event.preventDefault();
        store.removeTodo(todo.id);
        break;
      }

      case "Escape":
        if (focusState.openId) {
          focusState.openId = null;
          render();
        } else {
          focusState.index = -1;
          render();
        }
        break;

      default:
        break;
    }
  });
}
