/* =========================================================
   What each route is, and what it says about itself.

   Kept apart from the server so that routing stays a lookup
   rather than a chain of if statements.
   ========================================================= */

export const PAGES = {
  "/": {
    view: "index",
    status: 200,
    title: "This page was served by hand",
    lead:
      "No framework. Node's http module, a lookup table of four paths, and a template filled in " +
      "with the request that fetched this page.",
  },
  "/about": {
    view: "about",
    status: 200,
    title: "How it answered you",
    lead:
      "A web server is a function from a request to a response. Everything else Express does is " +
      "convenience on top of that.",
  },
  "/contact": {
    view: "contact",
    status: 200,
    title: "Send it a request body",
    lead:
      "A GET has no body. Post this form and the server reads the stream by hand, parses it, and " +
      "reads it back to you — escaped.",
  },
};

/** Served for anything not in PAGES. */
export const NOT_FOUND = {
  view: "404",
  status: 404,
  title: "No route for that",
  lead: "There are three pages and this is not one of them.",
};

/** Served when a method that is not allowed reaches a real path. */
export const NOT_ALLOWED = {
  view: "405",
  status: 405,
  title: "Not with that method",
  lead: "The path exists. What you did to it is not something it accepts.",
};
