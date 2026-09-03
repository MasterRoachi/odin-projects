/* =========================================================
   Reading a request body, by hand.

   Express hands you `req.body` and this is what it is doing:
   a request is a readable stream, and the body arrives in
   chunks that have to be collected before they mean anything.
   ========================================================= */

/** 10kB is far more than a contact form needs. */
export const MAX_BODY_BYTES = 10 * 1024;

/**
 * Collects the body, or refuses.
 *
 * The size limit is not tidiness. Without it, `body += chunk` on an
 * unbounded stream is a way to exhaust the server's memory from outside —
 * one request that never stops sending. Express has the same limit, set to
 * 100kB by default, for the same reason.
 *
 * The socket is destroyed rather than merely rejected, because replying
 * politely while the sender keeps pushing megabytes at you is not much of a
 * defence.
 */
export function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        const error = new Error("Request body too large");
        error.statusCode = 413;
        req.destroy();
        reject(error);
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/**
 * Parses application/x-www-form-urlencoded.
 *
 * URLSearchParams already knows how to do this, including the awkward parts:
 * plus signs meaning spaces, percent escapes, and repeated keys.
 */
export function parseForm(raw) {
  const params = new URLSearchParams(raw);
  const out = {};
  for (const [key, value] of params) out[key] = value;
  return out;
}
