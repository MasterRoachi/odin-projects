import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { performance } from "node:perf_hooks";
import { render, detailList, escapeHtml } from "./src/render.js";
import { PAGES, NOT_FOUND, NOT_ALLOWED } from "./src/pages.js";
import { readBody, parseForm, MAX_BODY_BYTES } from "./src/body.js";

/* =========================================================
   A web server, with nothing underneath it but Node.

   A server is a function from a request to a response. This
   file is that function, written out: work out what was
   asked for, decide a status code, set the content type, send
   a body. Express does all of this — it just does it for you.

   3000 is often already taken by something, so the port is
   read from the environment with a default that is not.
   ========================================================= */

const PORT = Number(process.env.PORT) || 3100;
const ROOT = import.meta.dirname;

/* Read once at start-up rather than per request. Doing this synchronously
   would be fine here and is exactly what must never happen in a handler:
   the thread that blocks is the one serving everybody. */
const layout = await readFile(join(ROOT, "views", "layout.html"), "utf8");

const views = new Map();
for (const name of ["index", "about", "contact", "404", "405", "500"]) {
  views.set(name, await readFile(join(ROOT, "views", `${name}.html`), "utf8"));
}

/* --- static files ----------------------------------------- */

const TYPES = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

/**
 * Serves a file from public/.
 *
 * The path is normalised and then checked to be inside public/ before
 * anything is read. Without that check, a request for
 * /public/../../../../etc/passwd walks straight out of the directory and
 * hands over whatever it finds — the oldest bug in serving files, and the
 * reason `express.static` exists rather than everyone writing this.
 */
async function serveStatic(res, urlPath) {
  const publicDir = join(ROOT, "public");
  const target = normalize(join(publicDir, urlPath.replace(/^\/public/, "")));

  if (!target.startsWith(publicDir)) {
    return send(res, 403, "text/plain; charset=utf-8", "Forbidden");
  }

  try {
    const file = await readFile(target);
    const type = TYPES[extname(target)] || "application/octet-stream";
    return send(res, 200, type, file, { "Cache-Control": "no-cache" });
  } catch {
    return send(res, 404, "text/plain; charset=utf-8", "Not found");
  }
}

/* --- responding ------------------------------------------- */

function send(res, status, type, body, extra = {}) {
  res.writeHead(status, {
    "Content-Type": type,
    "Content-Length": Buffer.byteLength(body),
    /* the browser will not guess at the type if it is told not to, which
       closes off a whole family of content-sniffing attacks */
    "X-Content-Type-Options": "nosniff",
    ...extra,
  });
  res.end(body);
}

/** Builds a page: the layout, with a view inside it. */
function page({ view, status, title, lead }, facts, extraHtml = "") {
  const body = render(views.get(view), {
    title,
    lead,
    facts: detailList(facts),
    extra: extraHtml,
  });

  return render(layout, { title, status: String(status), body });
}

/* --- the request itself ----------------------------------- */

/**
 * The facts about this request, which are the content of every page.
 *
 * Every one of these is controlled by whoever made the request — the path,
 * the user agent, the language header. They are all escaped on the way into
 * the HTML, which is what `detailList` and `{{ }}` are for.
 */
function factsFor(req, url, status, startedAt, pathname = url.pathname) {
  return [
    ["Method", req.method],
    ["Path", pathname],
    ["Query", url.search || "(none)"],
    ["Status", status],
    ["HTTP version", req.httpVersion],
    ["Host", req.headers.host],
    ["User agent", req.headers["user-agent"]],
    ["Accept", req.headers.accept],
    ["Accept language", req.headers["accept-language"]],
    ["Handled in", `${(performance.now() - startedAt).toFixed(2)} ms`],
  ];
}

const server = createServer(async (req, res) => {
  const startedAt = performance.now();

  /* req.url is only ever a path and a query, never a whole address, so it
     needs a base to become a URL object */
  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  /*
   * The path has to be decoded before it can be matched or used as a
   * filename — %2Fabout is the same route as /about, and a file called
   * "my notes.txt" arrives as "my%20notes.txt".
   *
   * Decoding is also the moment the path becomes dangerous. Percent-encoded,
   * <script> is inert text; decoded, it is markup, and it goes on to be
   * printed in the 404 page. Escaping on the way out is what makes that
   * safe, and there is a test for it.
   *
   * A malformed escape like /%ZZ makes decodeURIComponent throw, which is a
   * bad request rather than a server fault.
   */
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return send(res, 400, "text/plain; charset=utf-8", "Malformed path encoding");
  }

  try {
    if (pathname.startsWith("/public/")) {
      return await serveStatic(res, pathname);
    }

    const known = PAGES[pathname];

    /* a path that exists but a method it does not take is 405, not 404 —
       and a 405 is required to say what it *does* allow */
    if (known && req.method !== "GET" && !(pathname === "/contact" && req.method === "POST")) {
      const allow = pathname === "/contact" ? "GET, POST" : "GET";
      return send(
        res,
        405,
        "text/html; charset=utf-8",
        page(NOT_ALLOWED, factsFor(req, url, 405, startedAt, pathname), `<p class="note">Allowed: ${allow}</p>`),
        { Allow: allow }
      );
    }

    if (pathname === "/contact" && req.method === "POST") {
      return await handleContact(req, res, url, startedAt, pathname);
    }

    if (!known) {
      return send(
        res,
        404,
        "text/html; charset=utf-8",
        page(NOT_FOUND, factsFor(req, url, 404, startedAt, pathname))
      );
    }

    return send(
      res,
      known.status,
      "text/html; charset=utf-8",
      page(known, factsFor(req, url, known.status, startedAt, pathname))
    );
  } catch (error) {
    /*
     * The catch-all. Without it, one thrown error in a handler takes down
     * the whole process and every other request with it.
     *
     * The message goes to the log, never to the response — an error page
     * that prints a stack trace tells an attacker about your filesystem
     * and your dependencies.
     */
    console.error(`[500] ${req.method} ${req.url}`, error);
    const status = error.statusCode ?? 500;
    return send(
      res,
      status,
      "text/html; charset=utf-8",
      page(
        {
          view: "500",
          status,
          title: status === 413 ? "That was too much" : "Something broke",
          lead:
            status === 413
              ? `Bodies are capped at ${MAX_BODY_BYTES / 1024}kB, so that one request cannot eat the server's memory.`
              : "The server threw, and it is not going to tell you what.",
        },
        factsFor(req, url, status, startedAt)
      )
    );
  }
});

/* --- the one route with a body ---------------------------- */

async function handleContact(req, res, url, startedAt, pathname) {
  const type = req.headers["content-type"] ?? "";

  if (!type.startsWith("application/x-www-form-urlencoded")) {
    return send(
      res,
      415,
      "text/html; charset=utf-8",
      page(
        {
          view: "500",
          status: 415,
          title: "Not a media type it reads",
          lead: "This route parses form encoding by hand, and nothing else.",
        },
        factsFor(req, url, 415, startedAt, pathname)
      )
    );
  }

  const fields = parseForm(await readBody(req));
  const message = (fields.message ?? "").trim();

  if (!message) {
    return send(
      res,
      400,
      "text/html; charset=utf-8",
      page(
        { ...PAGES["/contact"], status: 400, title: "Nothing in the body" },
        factsFor(req, url, 400, startedAt, pathname),
        `<p class="note note--bad">The message field was empty. A 400 means the request itself was wrong.</p>`
      )
    );
  }

  /*
   * Echoed back escaped. The whole point: this is a string a stranger sent,
   * going into a page. Unescaped, `<script>` in the box would run.
   */
  const echo = `
    <h2>What arrived</h2>
    <p class="note">${Buffer.byteLength(message)} bytes, read from the request stream in chunks.</p>
    <pre class="echo">${escapeHtml(message)}</pre>
    <p class="note">
      Escaped on the way in. Try sending &lt;script&gt;alert(1)&lt;/script&gt; — it comes back as
      text, which is the difference between a page and a vulnerability.
    </p>`;

  return send(
    res,
    200,
    "text/html; charset=utf-8",
    page(
      { ...PAGES["/contact"], title: "It read your body" },
      factsFor(req, url, 200, startedAt, pathname),
      echo
    )
  );
}

/* --- start ------------------------------------------------ */

/* exported so the tests can start it on a port of their own */
export { server };

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`Serving on http://localhost:${PORT}`);
    console.log("Routes: /  /about  /contact  (anything else is a 404)");
  });
}
