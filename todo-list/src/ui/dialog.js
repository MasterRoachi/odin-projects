/* =========================================================
   The two dialogs: a new todo, and a new project.

   A <dialog> containing a <form> will happily try to submit
   itself to a server and reload the page, which is what
   event.preventDefault() is here to stop.
   ========================================================= */

import * as store from "../model/store.js";
import { PRIORITIES } from "../model/todo.js";
import { el } from "./dom.js";

function field(label, control) {
  return el("label", { class: "field" }, [el("span", { text: label }), control]);
}

function mountDialog(node) {
  document.body.append(node);
  node.addEventListener("close", () => node.remove());
  node.showModal();
  return node;
}

export function openAddDialog() {
  const title = el("input", { type: "text", required: true, autofocus: true });
  const description = el("textarea", { rows: 2 });
  const due = el("input", { type: "date" });

  const priority = el(
    "select",
    {},
    PRIORITIES.map((value) =>
      el("option", { value, selected: value === "normal", text: value })
    )
  );

  const project = el(
    "select",
    {},
    store.getProjects().map((entry) =>
      el("option", {
        value: entry.id,
        selected: entry.id === store.defaultProjectId(),
        text: entry.name,
      })
    )
  );

  const error = el("p", { class: "form-error" });
  const dialog = el("dialog", {});

  const form = el("form", {}, [
    el("div", { class: "dialog-body" }, [
      el("h2", { text: "New todo" }),
      field("Title", title),
      field("Description", description),
      el("div", { class: "field-row" }, [field("Due", due), field("Priority", priority)]),
      field("Project", project),
      error,
      el("div", { class: "dialog-actions" }, [
        el("button", {
          class: "quiet",
          type: "button",
          text: "Cancel",
          onClick: () => dialog.close(),
        }),
        el("button", { class: "primary", type: "submit", text: "Add todo" }),
      ]),
    ]),
  ]);

  form.addEventListener("submit", (event) => {
    // without this the form posts itself and the page reloads
    event.preventDefault();

    if (!title.value.trim()) {
      error.textContent = "It needs a title.";
      title.focus();
      return;
    }

    store.addTodo(project.value, {
      title: title.value,
      description: description.value,
      dueDate: due.value || null,
      priority: priority.value,
    });

    dialog.close();
  });

  dialog.append(form);
  mountDialog(dialog);
  title.focus();
}

export function openProjectDialog() {
  const name = el("input", { type: "text", required: true, autofocus: true });
  const error = el("p", { class: "form-error" });
  const dialog = el("dialog", {});

  const form = el("form", {}, [
    el("div", { class: "dialog-body" }, [
      el("h2", { text: "New project" }),
      field("Name", name),
      error,
      el("div", { class: "dialog-actions" }, [
        el("button", {
          class: "quiet",
          type: "button",
          text: "Cancel",
          onClick: () => dialog.close(),
        }),
        el("button", { class: "primary", type: "submit", text: "Create" }),
      ]),
    ]),
  ]);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!name.value.trim()) {
      error.textContent = "Give it a name.";
      name.focus();
      return;
    }
    store.addProject(name.value);
    dialog.close();
  });

  dialog.append(form);
  mountDialog(dialog);
  name.focus();
}
