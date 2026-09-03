# React: the change of gear

This is the largest course in the path — 22 lessons and three projects — and it is the first one that changes *how you think*, not just what you know.

Everything before this you told the browser what to do, step by step: find this element, make that one, put this text in it, remove that class. React asks you to describe what the page should **look like for a given state**, and works out the DOM operations itself.

Sixth in the series, after [whats-ahead.md](./whats-ahead.md), [complexity-and-structures.md](./complexity-and-structures.md), [hash-maps.md](./hash-maps.md), [testing-for-real.md](./testing-for-real.md) and [advanced-html-css.md](./advanced-html-css.md).

---

## You have already built most of this by hand

That is not encouragement, it is literally true, and it is the fastest way in:

| what you built | what React calls it |
| --- | --- |
| `src/model/` and `src/ui/` in the Todo List | components vs state |
| `store.subscribe()` telling the UI to redraw | `useState` triggering a re-render |
| `renderBoard()` wiping the container and rebuilding all 100 cells | reconciliation, done for you |
| every `document.createElement` you have written | JSX |
| passing a board into `renderBoard(container, board)` | props |

The Tic-Tac-Toe README makes the point exactly: *"the screen is redrawn, not patched… there is only one place the truth lives."* That sentence is the entire React model. React's contribution is doing the redraw efficiently, so you can write it that way for a page with ten thousand elements instead of nine.

---

## The core, in the order it lands

### Components and JSX

A component is a function that returns markup. That is all.

```jsx
function ProjectCard({ title, blurb }) {
  return (
    <article className="work">
      <h3>{title}</h3>
      <p>{blurb}</p>
    </article>
  );
}
```

JSX is not HTML and not a string — it compiles to function calls. Hence the gotchas: `className` not `class`, `htmlFor` not `for`, `{}` to drop in an expression, one root element per component (or a `<>…</>` fragment), and every tag closed.

Components must start with a **capital letter**. Lowercase is treated as a literal HTML tag, and this fails silently.

### Props

Data flows **down**, parent to child, and props are read-only. A child that wants to change something calls a function its parent gave it. That is the whole data model, and it is why React apps are traceable: there is exactly one direction.

### State

`useState` gives a component a value that survives re-renders, and a setter that triggers one.

```jsx
const [count, setCount] = useState(0);
```

Two things that catch everyone:

**State updates are not immediate.** Calling the setter schedules a re-render; the variable you are holding does not change. When the new value depends on the old one, pass a function: `setCount(c => c + 1)`, not `setCount(count + 1)`.

**Never mutate state.** Make a new object or array:

```jsx
setTodos([...todos, newTodo]);              // yes
setUser({ ...user, name: "Sid" });          // yes
todos.push(newTodo); setTodos(todos);       // does nothing at all
```

React decides whether to re-render by comparing references. Mutating in place leaves the reference identical, so React concludes nothing changed and the screen does not update. This is the single most common React bug, and it fails *silently*, which is worse.

### Lists and keys

```jsx
{projects.map(p => <ProjectCard key={p.id} title={p.title} />)}
```

The `key` tells React which item is which between renders so it can move elements rather than rebuild them. **Never use the array index as a key** in a list that can reorder, filter or delete — React will match up the wrong elements and you get state stuck on the wrong row. Use a real id; `crypto.randomUUID()` is right there, and you already used it in the Todo List.

### Lifting state up

When two components need the same data, it moves to their closest common parent and comes back down as props. This feels like a step backwards the first few times and is the correct instinct almost every time.

### `useEffect`, and how much you do not need it

For synchronising with something **outside** React — a subscription, a timer, a network request, the document title.

```jsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);   // the cleanup, not optional
}, []);
```

The dependency array decides when it re-runs. Omit it and it runs after every render; `[]` means once; `[x]` means whenever `x` changes. Forgetting the cleanup is how you get leaked intervals and listeners.

**The trap:** most `useEffect` calls beginners write should not exist. If you can compute a value from existing props and state, just compute it during render — do not keep it in state and sync it with an effect. An effect that only exists to copy one piece of state into another is a bug waiting to happen and an extra render every time.

### The rules of hooks

Only at the top level of a component, never inside a condition, loop or nested function. React tracks hooks by **call order**, so a conditional hook shifts every hook after it and state lands in the wrong variable. The linter enforces this; believe it.

---

## The rest of the course

**React Router** — multiple URLs in a page that never reloads. Routes, nested routes, `<Link>`, and route params. Mostly mechanical once the core clicks.

**Data fetching** — `useEffect` plus `fetch`, and the three states every request has: loading, error, success. All three need rendering, and the error one is the one people skip. You already did this by hand in the Weather App, including the part where a naive timestamp quietly lied to you.

**Testing React** — Vitest, which you already know, plus React Testing Library. Its philosophy is worth internalising: **test what the user sees, not how the component is built.** Query by role and by text, not by class name. A test that breaks when you rename a div was testing the wrong thing.

---

## Tooling

**Use Vite.** Create React App is deprecated and no longer maintained; the curriculum has moved. `npm create vite@latest` and pick React.

Vite is not webpack and is a much smaller thing to hold in your head — no `webpack.common/dev/prod` split, no loader chain. It serves your ES modules directly in development, so there is no bundle step while you work.

Also install the **React Developer Tools** browser extension on day one. Being able to see the component tree and inspect state is the difference between understanding a re-render and guessing at it.

---

## The three projects

| project | the point |
| --- | --- |
| **CV Builder** | Forms and controlled inputs. State that mirrors what is typed, edit and preview modes, and a lot of lifting state up. The first one, and mostly about `useState`. |
| **Memory Card Game** | State that changes on interaction, shuffling on every click, and a score that has to survive re-renders. Introduces `useEffect` for the initial data fetch. |
| **Shopping Cart** | The big one. React Router across several pages, a cart whose state is shared by components that are nowhere near each other, and real data fetching. This is where lifting state up starts to hurt and you find out why people reach for context. |

---

## What to expect

The first week is uncomfortable. Writing `setThings([...things, t])` instead of `things.push(t)` feels like ceremony until the day you delete two hundred lines of manual DOM updating and the thing still works.

The clearest sign it has landed: you stop asking *"how do I update this element?"* and start asking *"what state would make the page look like that?"*
