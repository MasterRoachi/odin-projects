/* =========================================================
   The interface.

   Everything that knows the DOM exists lives under ui/. It
   reads from the store, calls the store's functions to change
   things, and re-renders when the store says something moved.
   It never reaches into the data itself.
   ========================================================= */

import * as store from "../model/store.js";
import { PRIORITIES } from "../model/todo.js";
import { checklistProgress, dueLabel, isDueToday, isOverdue } from "../model/todo.js";
import { CHEVRON, el, TICK } from "./dom.js";
import { openAddDialog, openProjectDialog } from "./dialog.js";

const VIEW_TITLES = {
  today: "Today",
  upcoming: "Upcoming",
  overdue: "Overdue",
  all: "Everything",
};

const ui = {
  root: null,
  sidebar: null,
  main: null,
  openId: null, // the one expanded todo
  focusIndex: -1, // keyboard cursor into the visible list
};

/* ---------------------------------------------------------
   Sidebar
   --------------------------------------------------------- */

function viewButton(key, label, count) {
  return el("li", {}, [
    el(
      "button",
      {
        type: "button",
        "aria-current": String(store.getSelected() === key),
        onClick: () => store.select(key),
      },
      [
        el("span", { class: "label", text: label }),
        count > 0 ? el("span", { class: "count", text: String(count) }) : null,
      ]
    ),
  ]);
}

function projectButton(project) {
  const button = el(
    "button",
    {
      type: "button",
      "aria-current": String(store.getSelected() === project.id),
      dataset: { projectId: project.id },
      onClick: () => store.select(project.id),
    },
    [
      el("span", { class: "dot", style: { "--tint": project.tint } }),
      el("span", { class: "label", text: project.name }),
      el("span", { class: "count", text: String(store.openCount(project)) }),
    ]
  );

  // a todo can be dropped straight onto a project to move it there
  button.addEventListener("dragover", (event) => {
    event.preventDefault();
    button.classList.add("drop-target");
  });
  button.addEventListener("dragleave", () => button.classList.remove("drop-target"));
  button.addEventListener("drop", (event) => {
    event.preventDefault();
    button.classList.remove("drop-target");
    const id = event.dataTransfer.getData("text/todo-id");
    if (id) store.moveTodoToProject(id, project.id);
  });

  return el("li", {}, [button]);
}

function renderSidebar() {
  const counts = store.counts();

  ui.sidebar.replaceChildren(
    el("p", { class: "brand", text: "Things to do" }),

    el("div", { class: "group" }, [
      el("div", { class: "group-head" }, [el("h2", { text: "Views" })]),
      el("ul", { class: "nav" }, [
        viewButton("today", "Today", counts.today),
        viewButton("upcoming", "Upcoming", counts.upcoming),
        viewButton("overdue", "Overdue", counts.overdue),
        viewButton("all", "Everything", counts.all),
      ]),
    ]),

    el("div", { class: "group" }, [
      el("div", { class: "group-head" }, [
        el("h2", { text: "Projects" }),
        el("button", {
          class: "add-project",
          type: "button",
          title: "New project",
          "aria-label": "New project",
          text: "+",
          onClick: () => openProjectDialog(),
        }),
      ]),
      el("ul", { class: "nav" }, store.getProjects().map(projectButton)),
    ]),

    el("div", {
      class: "hint",
      html:
        "<kbd>n</kbd> new · <kbd>j</kbd>/<kbd>k</kbd> move · <kbd>x</kbd> complete<br />" +
        "<kbd>e</kbd> open · <kbd>1</kbd>–<kbd>9</kbd> projects",
    })
  );
}

/* ---------------------------------------------------------
   A todo
   --------------------------------------------------------- */

function metaFor(todo, project) {
  const bits = [];

  // in a date view the project is what you cannot see; in a project view
  // it is the one thing you already know
  if (store.isView(store.getSelected())) {
    bits.push(
      el("span", { class: "chip" }, [
        el("span", { class: "dot", style: { "--tint": project.tint } }),
        project.name,
      ])
    );
  }

  if (todo.dueDate) {
    const state = isOverdue(todo) ? "due-overdue" : isDueToday(todo) ? "due-today" : "";
    bits.push(el("span", { class: `chip ${state}`, text: dueLabel(todo) }));
  }

  const { done, total } = checklistProgress(todo);
  if (total > 0) {
    bits.push(
      el("span", { class: "chip" }, [
        el("span", { class: "mini-bar" }, [
          el("span", { style: { width: `${(done / total) * 100}%` } }),
        ]),
        `${done}/${total}`,
      ])
    );
  }

  if (todo.priority !== "normal") {
    bits.push(
      el("span", { class: "chip" }, [
        el("span", { class: `flag ${todo.priority}` }),
        todo.priority,
      ])
    );
  }

  return bits;
}

function detailFor(todo) {
  const field = (label, control) => el("label", { class: "field" }, [el("span", { text: label }), control]);

  const title = el("input", {
    type: "text",
    value: todo.title,
    onChange: (event) => store.updateTodo(todo.id, { title: event.target.value.trim() || todo.title }),
  });

  const description = el("textarea", {
    rows: 2,
    value: todo.description,
    onChange: (event) => store.updateTodo(todo.id, { description: event.target.value }),
  });

  const due = el("input", {
    type: "date",
    value: todo.dueDate || "",
    onChange: (event) => store.updateTodo(todo.id, { dueDate: event.target.value || null }),
  });

  const priority = el(
    "select",
    { onChange: (event) => store.updateTodo(todo.id, { priority: event.target.value }) },
    PRIORITIES.map((value) =>
      el("option", { value, selected: value === todo.priority, text: value })
    )
  );

  const notes = el("textarea", {
    rows: 2,
    value: todo.notes,
    onChange: (event) => store.updateTodo(todo.id, { notes: event.target.value }),
  });

  const checklist = el(
    "ul",
    { class: "checklist" },
    todo.checklist.map((item) =>
      el("li", { class: item.done ? "done" : "" }, [
        el("input", {
          type: "checkbox",
          checked: item.done,
          "aria-label": item.text,
          onChange: () => store.toggleChecklistItem(todo.id, item.id),
        }),
        el("span", { class: "text", text: item.text }),
        el("button", {
          class: "remove",
          type: "button",
          "aria-label": `Remove ${item.text}`,
          text: "×",
          onClick: () => store.removeChecklistItem(todo.id, item.id),
        }),
      ])
    )
  );

  const newItem = el("input", {
    type: "text",
    placeholder: "Add a step",
    onKeydown: (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      store.addChecklistItem(todo.id, event.target.value);
    },
  });

  return el("div", { class: "detail" }, [
    field("Title", title),
    field("Description", description),
    el("div", { class: "field-row" }, [field("Due", due), field("Priority", priority)]),
    field("Notes", notes),
    el("div", { class: "field" }, [
      el("span", { text: "Checklist" }),
      checklist,
      el("div", { class: "add-item" }, [
        newItem,
        el("button", {
          class: "quiet",
          type: "button",
          text: "Add",
          onClick: () => store.addChecklistItem(todo.id, newItem.value),
        }),
      ]),
    ]),
    el("div", { class: "detail-actions" }, [
      el("button", {
        class: "danger",
        type: "button",
        text: "Delete todo",
        onClick: () => store.removeTodo(todo.id),
      }),
    ]),
  ]);
}

function todoElement({ todo, project }, index) {
  const open = ui.openId === todo.id;

  const item = el("li", {
    class: [
      "todo",
      todo.done ? "is-done" : "",
      open ? "is-open" : "",
      index === ui.focusIndex ? "is-focused" : "",
    ]
      .filter(Boolean)
      .join(" "),
    draggable: true,
    dataset: { id: todo.id },
  });

  const row = el("div", { class: "todo-row" }, [
    el("span", { class: "grip", "aria-hidden": "true", text: "⠿" }),
    el(
      "button",
      {
        class: "check",
        type: "button",
        "aria-label": todo.done ? `Mark ${todo.title} not done` : `Mark ${todo.title} done`,
        onClick: () => store.toggleDone(todo.id),
      },
      [TICK()]
    ),
    el("div", { class: "todo-body" }, [
      el("p", { class: "todo-title", text: todo.title, style: { margin: "0" } }),
      el("div", { class: "todo-meta" }, metaFor(todo, project)),
    ]),
    el(
      "button",
      {
        class: "expand",
        type: "button",
        "aria-expanded": String(open),
        "aria-label": open ? "Collapse" : "Expand",
        onClick: () => {
          ui.openId = open ? null : todo.id;
          render();
        },
      },
      [CHEVRON()]
    ),
  ]);

  item.append(row);
  if (open) item.append(detailFor(todo));

  wireDragging(item, todo.id);
  return item;
}

function wireDragging(item, id) {
  item.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/todo-id", id);
    event.dataTransfer.effectAllowed = "move";
    item.classList.add("is-dragging");
  });

  item.addEventListener("dragend", () => item.classList.remove("is-dragging"));

  item.addEventListener("dragover", (event) => {
    event.preventDefault();
    item.classList.add("drop-before");
  });

  item.addEventListener("dragleave", () => item.classList.remove("drop-before"));

  item.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();
    item.classList.remove("drop-before");
    const dragged = event.dataTransfer.getData("text/todo-id");
    if (dragged) store.moveTodoBefore(dragged, id);
  });
}

/* ---------------------------------------------------------
   Main column
   --------------------------------------------------------- */

function headingFor() {
  const key = store.getSelected();
  if (store.isView(key)) return VIEW_TITLES[key];
  return store.findProject(key)?.name ?? "Everything";
}

function emptyFor() {
  const key = store.getSelected();
  const lines = {
    today: ["Nothing due today.", "Enjoy it, or pull something forward."],
    upcoming: ["Nothing scheduled.", "The horizon is clear."],
    overdue: ["Nothing overdue.", "Genuinely impressive."],
    all: ["No todos yet.", "Add the first one."],
  };
  const [strong, quiet] = lines[key] ?? ["This project is empty.", "Add something to it."];
  return el("div", { class: "empty" }, [el("strong", { text: strong }), quiet]);
}

function renderMain() {
  const visible = store.visibleTodos();
  const outstanding = visible.filter(({ todo }) => !todo.done).length;

  const head = el("div", { class: "main-head" }, [
    el("div", {}, [
      el("h1", { text: headingFor(), style: { margin: "0" } }),
      el("p", {
        class: "sub",
        text:
          visible.length === 0
            ? "Nothing here"
            : `${outstanding} outstanding of ${visible.length}`,
      }),
    ]),
    el("button", {
      class: "primary",
      type: "button",
      text: "Add todo",
      onClick: () => openAddDialog(),
    }),
  ]);

  const body =
    visible.length === 0
      ? emptyFor()
      : el("ul", { class: "todos" }, visible.map(todoElement));

  ui.main.replaceChildren(head, body);
}

/* ---------------------------------------------------------
   Render, and the small amount of state the interface owns
   --------------------------------------------------------- */

export function render() {
  const visible = store.visibleTodos();

  // the expanded todo may have been deleted, or filtered out of this view
  if (ui.openId && !visible.some(({ todo }) => todo.id === ui.openId)) ui.openId = null;
  if (ui.focusIndex >= visible.length) ui.focusIndex = visible.length - 1;

  renderSidebar();
  renderMain();
}

export const focusState = {
  get index() {
    return ui.focusIndex;
  },
  set index(value) {
    ui.focusIndex = value;
  },
  get openId() {
    return ui.openId;
  },
  set openId(value) {
    ui.openId = value;
  },
};

export function mount(root) {
  ui.root = root;
  ui.sidebar = el("aside", { class: "sidebar" });
  ui.main = el("main", { class: "main" });
  root.append(el("div", { class: "shell" }, [ui.sidebar, ui.main]));

  store.subscribe(render);
  render();
}
