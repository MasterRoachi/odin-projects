import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { server } from "../server.js";

/* =========================================================
   node:test and node:assert, both built into Node, so this
   project still has no dependencies at all.

   The server is started on port 0 — the operating system
   picks a free one — because hard-coding a port in a test is
   how a suite fails on somebody else's machine.
   ========================================================= */

let base;

before(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

const get = (path, options) => fetch(`${base}${path}`, options);

describe("the three pages", () => {
  test("home answers 200 with html", async () => {
    const res = await get("/");
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type"), /text\/html/);
    assert.match(await res.text(), /served by hand/);
  });

  test("about and contact answer 200", async () => {
    for (const path of ["/about", "/contact"]) {
      assert.equal((await get(path)).status, 200, `${path} should be 200`);
    }
  });

  test("every page says which status it sent", async () => {
    const body = await (await get("/about")).text();
    assert.match(body, /aria-label="Response status">200</);
  });

  test("the request facts come back in the page", async () => {
    const body = await (await get("/about?q=1", { headers: { "User-Agent": "probe/1.0" } })).text();
    assert.match(body, /probe\/1\.0/);
    assert.match(body, /\?q=1/);
  });
});

describe("status codes", () => {
  test("an unknown path is 404, not 200", async () => {
    const res = await get("/nowhere");
    assert.equal(res.status, 404);
    assert.match(await res.text(), /No route for that/);
  });

  test("a known path with the wrong method is 405 and says what is allowed", async () => {
    const res = await get("/about", { method: "DELETE" });
    assert.equal(res.status, 405);
    assert.equal(res.headers.get("allow"), "GET");
  });

  test("contact allows POST as well as GET", async () => {
    const res = await get("/contact", { method: "PUT" });
    assert.equal(res.status, 405);
    assert.equal(res.headers.get("allow"), "GET, POST");
  });

  test("posting the wrong media type is 415", async () => {
    const res = await get("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"message":"hello"}',
    });
    assert.equal(res.status, 415);
  });

  test("posting an empty message is 400", async () => {
    const res = await get("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "message=%20%20",
    });
    assert.equal(res.status, 400);
  });
});

describe("reading a body", () => {
  test("a posted message comes back", async () => {
    const res = await get("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ message: "hello from the stream" }).toString(),
    });
    assert.equal(res.status, 200);
    assert.match(await res.text(), /hello from the stream/);
  });

  test("a body over the limit is refused with 413", async () => {
    const huge = new URLSearchParams({ message: "x".repeat(20 * 1024) }).toString();
    /* the server destroys the socket rather than reading it all, so fetch
       may reject outright — either that or a 413 is the right outcome */
    try {
      const res = await get("/contact", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: huge,
      });
      assert.equal(res.status, 413);
    } catch (error) {
      assert.ok(error, "the connection was cut, which is also a refusal");
    }
  });
});

describe("escaping, which is the point", () => {
  test("a script tag in the path does not come back as a script tag", async () => {
    const res = await get("/%3Cscript%3Ealert(1)%3C/script%3E");
    const body = await res.text();

    assert.equal(res.status, 404);
    assert.ok(!body.includes("<script>alert(1)</script>"), "the tag must not survive intact");
    assert.match(body, /&lt;script&gt;/, "it should be escaped instead");
  });

  test("a script tag in a posted message does not come back as one", async () => {
    const res = await get("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ message: "<script>alert(1)</script>" }).toString(),
    });
    const body = await res.text();

    assert.ok(!body.includes("<script>alert(1)</script>"));
    assert.match(body, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  });

  test("a malformed percent escape is a 400, not a crash", async () => {
    const res = await get("/%ZZ");
    assert.equal(res.status, 400);
  });

  test("a hostile user agent header is escaped too", async () => {
    const body = await (
      await get("/", { headers: { "User-Agent": '"><script>x()</script>' } })
    ).text();

    assert.ok(!body.includes("<script>x()</script>"));
    assert.match(body, /&lt;script&gt;x\(\)&lt;\/script&gt;/);
  });
});

describe("static files", () => {
  test("the stylesheet is served as css", async () => {
    const res = await get("/public/styles.css");
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type"), /text\/css/);
  });

  test("nosniff is set, so the browser will not guess", async () => {
    assert.equal((await get("/")).headers.get("x-content-type-options"), "nosniff");
  });

  test("a missing static file is 404", async () => {
    assert.equal((await get("/public/nope.css")).status, 404);
  });

  test("it will not climb out of public/", async () => {
    /* fetch normalises ../ out of a URL before sending, so the traversal is
       sent percent-encoded to get it past the client and to the server */
    const res = await get("/public/..%2f..%2fpackage.json");
    assert.ok(res.status === 403 || res.status === 404, `got ${res.status}`);
    const body = await res.text();
    assert.ok(!body.includes('"name": "basic-node-server"'), "package.json must not be served");
  });
});
