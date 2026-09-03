# NodeJS: the back end, and the biggest course in the path

21 lessons and **nine** projects — more than everything before it put together. It is also the course where the consequences change. Until now a bug made your page wrong; from here a bug can leak somebody's password.

Eighth in the series, after [whats-ahead.md](./whats-ahead.md), [complexity-and-structures.md](./complexity-and-structures.md), [hash-maps.md](./hash-maps.md), [testing-for-real.md](./testing-for-real.md), [advanced-html-css.md](./advanced-html-css.md), [react.md](./react.md) and [databases-and-sql.md](./databases-and-sql.md).

---

## The one idea underneath everything

**Nothing from the client can be trusted. Ever.**

You have met a mild version of this repeatedly — the CV Builder normalises imported files, Battleship validates coordinates, the shopping cart drops malformed cart lines out of storage. All of that was defending against your own bad data.

On a server, the input is a *stranger* who may be deliberately hostile, and the things behind it are other people's accounts. Every lesson about validation, escaping, hashing and sessions is one instance of that single rule.

The corollary catches people out: **client-side validation is a courtesy, not a control.** The `:user-invalid` styling in the Quarry form is there to be helpful. It stops nobody — anyone can send a request without ever loading your page.

---

## Node itself

### It is JavaScript without a document

No `window`, no `document`, no DOM. Instead: `fs` for files, `http` for servers, `path` for paths, `process` for the environment. The language is the same; the standard library is completely different.

### Modules, and the two systems

Node started with CommonJS (`require` / `module.exports`) and browsers standardised on ES Modules (`import` / `export`). Node supports both, and mixing them is a common early frustration.

The switch is `"type": "module"` in `package.json` — which every project in this repo already sets, so you have been writing ESM all along. Older Node tutorials use `require`, and that is the difference you are seeing.

### The event loop, briefly

Node is single-threaded for your code. One thread runs your JavaScript, and anything slow — reading a file, querying a database, calling an API — is handed off and picked up later.

Which means **blocking that thread stops the entire server for everybody.** A synchronous file read in a request handler does not slow down that one response; it freezes every other user's request behind it. This is why the async versions exist and why `readFileSync` belongs in start-up code and nowhere else.

---

## HTTP, properly this time

The first project is a server built on the raw `http` module, with no framework, and it is worth doing rather than rushing.

A request is a **method**, a **path**, some **headers** and maybe a **body**. A response is a **status code**, headers and a body. That is all a web server is.

Status codes actually matter:

| | |
| --- | --- |
| `200` | fine |
| `201` | created something |
| `302` | look over there instead |
| `400` | your request was malformed |
| `401` | who are you? |
| `403` | I know who you are, and no |
| `404` | no such thing |
| `500` | I broke |

The distinction between **401 and 403** is one people get wrong for years: 401 means *not authenticated*, 403 means *authenticated but not allowed*.

And `Content-Type` is not optional. Send HTML without it and the browser may display your markup as plain text, or worse, guess.

---

## Express

A thin layer over `http` that removes the boilerplate. Two ideas carry the whole framework.

### Routing

```js
app.get("/products/:id", (req, res) => res.render("product", { id: req.params.id }));
```

`:id` is a parameter, exactly like the `/product/:id` route in the shopping cart — that React Router lesson transfers directly.

### Middleware — the part worth understanding properly

A middleware is a function that gets the request, the response, and `next`. It can inspect, change, respond, or pass along:

```js
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();                 // forget this and the request hangs forever
});
```

They run **in the order they were added**, which is the source of most Express confusion. A body parser registered *after* the route that needs the body means `req.body` is undefined. An auth check registered after the protected route protects nothing.

Error handlers are middleware with four arguments — `(err, req, res, next)` — and Express identifies them by that arity alone, which is genuinely odd and worth remembering.

### MVC

Routes stay thin, controllers hold the logic, models talk to the database, views render. It is the same separation you have already built twice by hand: `src/model` and `src/ui` in the Todo List, and the whole point of Battleship's 58 tests being able to run without a browser.

---

## Templating

EJS or Pug, rendering HTML on the server. After React this feels like going backwards, and it is worth noticing what it buys: the page arrives complete, so it is fast and works without JavaScript.

**The security point:** template engines escape interpolated values by default, and the "raw" syntax turns that off. In EJS, `<%= value %>` escapes and `<%- value %>` does not. If a user's name is `<script>steal()</script>`, the first prints it harmlessly and the second runs it. That is **XSS**, and the raw form is how it happens.

---

## Authentication, and the part you must not improvise

**Never store a password.** Store a hash:

```js
const hash = await bcrypt.hash(password, 10);          // signing up
const ok   = await bcrypt.compare(password, user.hash); // logging in
```

bcrypt is deliberately slow, which is the feature — it makes guessing billions of passwords expensive. A fast hash like SHA-256 is *wrong* here for exactly that reason, and never write your own.

**Sessions**: the server keeps the state and the browser holds an opaque id in a cookie. **Tokens (JWT)**: the client holds signed claims and the server keeps nothing. Sessions are easier to reason about and easier to revoke; the course uses them with Passport.

Cookies need `httpOnly` (JavaScript cannot read it, so XSS cannot steal it), `secure` (HTTPS only) and `sameSite` (blunts CSRF).

Three attacks worth being able to name:

- **SQL injection** — covered in the databases notes. Parameters, always.
- **XSS** — someone's input rendered as markup. Escape output; that is what the template engine is doing for you.
- **CSRF** — another site making a request as your logged-in user. Beaten with a token and `sameSite` cookies.

---

## Secrets

Configuration comes from the environment, not from the source:

```js
const url = process.env.DATABASE_URL;
```

**This repository is public.** A committed `.env` is not a tidiness problem, it is a disclosure — and git remembers, so deleting it later does not remove it from the history. Every project here gets `.env` in `.gitignore` and a committed `.env.example` with the shape and no values.

---

## Prisma, and the N+1 trap

An ORM turns rows into objects and writes the SQL for you. Convenient, and it hides the cost:

```js
const posts = await prisma.post.findMany();
for (const p of posts) p.author = await prisma.user.findUnique({ where: { id: p.authorId } });
```

Fifty posts, fifty-one queries. One `include` would have done it in one. This is the same shape as the memory game, where sixteen cards could have been sixteen requests and turned out to need only one — and knowing the SQL is what lets you notice.

---

## The nine projects

| | teaches |
| --- | --- |
| Basic Informational Site | the raw `http` module: routing by hand, status codes, content types |
| Mini Message Board | Express, routing, views, form posts |
| Inventory Application | a real database behind full CRUD |
| Members Only | sessions, authentication, authorisation |
| Blog API | a JSON API with a separate front end, and CORS |
| File Uploader | multipart uploads, Prisma, storage |
| Messaging App | more auth and relational modelling |
| Where's Waldo | coordinates, hit detection, timing |
| **Odin-Book** | a social network. Nearly everything above, at once. |

Several are CRUD with a different subject, and the repetition is largely the point.

---

## How this repo will differ from here

Every project so far ends in something you can open in a browser at a URL. **A Node server cannot be hosted on GitHub Pages**, which serves static files only.

So these run locally with `npm start`, and the portfolio links to the source and the notes rather than a live page. That is what almost everyone working through this course does, and it changes nothing about whether the code is any good.
