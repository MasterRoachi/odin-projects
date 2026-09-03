# A server, by hand

The first NodeJS project, from [The Odin Project](https://www.theodinproject.com/)'s Basic Informational Site assignment. Four pages served by Node's `http` module — no Express, and **no dependencies at all**.

```bash
npm start          # http://localhost:3100
npm run dev        # the same, restarting on change
npm test           # 19 tests, node:test
```

Nothing to open online: a Node server cannot be hosted on GitHub Pages, which serves static files only. This one runs on your machine.

## What the pages say

Rather than filler text, **each page documents the request that fetched it** — method, path, status, HTTP version, the headers your browser sent, and how long the handler took. A site about HTTP, served by hand-written HTTP.

That choice turned out to matter, because it means the server echoes **attacker-controlled data into HTML**, which is a real vulnerability in a project this small. More on that below.

## A server is a function

```js
createServer(async (req, res) => { ... })
```

That is the whole thing. Work out what was asked for, choose a status code, set a content type, write a body. Everything Express adds is convenience on top of this — and having written the awkward version once, the convenience is legible rather than magic.

Routing is a lookup table, not a chain of `if`s:

```js
const known = PAGES[pathname];
```

## The status codes, and meaning them

Most tutorials for this project send 200 for everything and 404 for the rest. This one uses the codes properly:

| | when |
| --- | --- |
| `200` | one of the three pages, fetched with GET |
| `400` | an empty message posted, or a malformed percent escape in the path |
| `403` | a static path that tried to climb out of `public/` |
| `404` | any path not in the table |
| `405` | a real path, wrong method — **with an `Allow` header**, which a 405 is obliged to send |
| `413` | a request body over 10kB |
| `415` | posting something that is not form encoding |
| `500` | the handler threw |

`405` versus `404` is the interesting one: the path exists, so saying "not found" is a lie.

## The security, which is not theoretical here

### Escaping

The template has two placeholder forms, deliberately the same distinction EJS makes:

```
{{name}}     escaped
{{{name}}}   inserted as markup
```

The escaped form is the default, because the path, the query and every request header are controlled by whoever made the request. Ask this server for `/<script>alert(1)</script>` and the 404 page prints the path you asked for. Unescaped, the browser runs it.

There is a test for exactly that, and one for a script tag in a posted message, and one for a hostile `User-Agent`.

### Decoding is when the danger starts

The first version of the escaping test **failed**, and the reason was worth keeping. `URL.pathname` does not decode percent escapes, so `%3Cscript%3E` stayed encoded — inert, but only by accident, and it meant the page displayed gibberish instead of the path.

Real servers decode the path, because `%2Fabout` is the same route as `/about` and a file called `my notes.txt` arrives as `my%20notes.txt`. So this one decodes it — and *that* is the moment `<script>` stops being text and becomes markup. Decode, then forget to escape, is precisely how the bug happens.

A malformed escape like `/%ZZ` makes `decodeURIComponent` throw, which is a `400`, not a `500`.

### Path traversal

```js
const target = normalize(join(publicDir, urlPath.replace(/^\/public/, "")));
if (!target.startsWith(publicDir)) return 403;
```

Without that check, `/public/../../package.json` walks straight out of the directory and hands over whatever it finds. It is the oldest bug in serving files and the reason `express.static` exists rather than everyone writing this by hand. Tested with the traversal percent-encoded, because `fetch` normalises `../` out of a URL before it is ever sent.

### An unbounded body is a memory attack

Reading a request body means collecting chunks off a stream, and `body += chunk` with no limit is a way to exhaust the server's memory from outside — one request that never stops sending. Capped at 10kB, and the socket is destroyed rather than politely refused, because replying nicely while somebody keeps pushing megabytes is not a defence. Express does the same thing at 100kB.

### The error page says nothing

The thrown error goes to the log; the response gets a generic page. An error page with a stack trace tells a stranger about your filesystem and your dependencies.

## The blocking problem

The views are read **once at start-up**, synchronously, which is fine there and must never happen in a handler:

> Node runs your code on one thread. A synchronous read in a request handler does not slow down that one response — it freezes every other user's request behind it.

## Tests

19, using `node:test` and `node:assert`, both built into Node — so the project still has zero dependencies.

The server listens on **port 0** in tests, letting the operating system pick a free one. Hard-coding a port in a test is how a suite passes for you and fails for everyone else.

Covered: all three pages and their content types, the request facts appearing in the page, every status code above, the body limit, the traversal guard, `nosniff`, and three separate escaping tests.

## What I Practiced

* That a web server is a function from a request to a response, and nothing more
* Status codes that mean what they say, including 405 with `Allow`
* Escaping on output, and that decoding the input is the moment it becomes necessary
* Path traversal, and checking the resolved path rather than the requested one
* Why an unbounded body read is a vulnerability rather than an oversight
* `node:test`, which removes the last reason to reach for a dependency here

## Project Status

Complete.

## Acknowledgements

Completed as part of The Odin Project's NodeJS course.
