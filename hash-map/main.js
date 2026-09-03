/* =========================================================
   Walks the test sequence the brief lays out.

   Run with:  node main.js
   ========================================================= */

import { HashMap } from "./hashMap.js";
import { HashSet } from "./hashSet.js";

const rule = (title) => console.log(`\n${title}\n${"─".repeat(title.length)}`);
const show = (label, value) => console.log(`  ${label.padEnd(28)} ${value}`);

const state = (map) =>
  `capacity ${map.capacity}   length ${map.length()}   load ${map.load.toFixed(2)}`;

/** Which buckets hold more than one entry — the collisions. */
function collisions(map) {
  return map
    .bucketSizes()
    .map((count, index) => ({ index, count }))
    .filter(({ count }) => count > 1);
}

/* --- fill it to exactly the load factor -------------------- */

const test = new HashMap();

const data = [
  ["apple", "red"],
  ["banana", "yellow"],
  ["carrot", "orange"],
  ["dog", "brown"],
  ["elephant", "gray"],
  ["frog", "green"],
  ["grape", "purple"],
  ["hat", "black"],
  ["ice cream", "white"],
  ["jacket", "blue"],
  ["kite", "pink"],
  ["lion", "golden"],
];

data.forEach(([key, value]) => test.set(key, value));

rule("Twelve entries — exactly at the load factor");
show("state", state(test));
show("bucket sizes", test.bucketSizes().join(" "));
show(
  "collisions",
  collisions(test).length === 0
    ? "none"
    : collisions(test).map((c) => `bucket ${c.index} holds ${c.count}`).join(", ")
);

/* --- overwriting must not add ------------------------------ */

rule("Overwriting existing keys");
const before = { length: test.length(), capacity: test.capacity };
test.set("apple", "crimson");
test.set("lion", "tawny");
test.set("frog", "emerald");
show("apple is now", test.get("apple"));
show("length unchanged", `${before.length} → ${test.length()}`);
show("capacity unchanged", `${before.capacity} → ${test.capacity}`);

/* --- one more entry tips it over --------------------------- */

rule("set('moon', 'silver') — this exceeds the load factor");
show("before", state(test));
test.set("moon", "silver");
show("after", state(test));
show("bucket sizes", test.bucketSizes().join(" "));
show(
  "collisions",
  collisions(test).length === 0
    ? "none"
    : collisions(test).map((c) => `bucket ${c.index} holds ${c.count}`).join(", ")
);

rule("Everything survived the rehash");
const missing = [...data.map(([key]) => key), "moon"].filter((key) => !test.has(key));
show("keys still present", `${13 - missing.length} of 13`);
show("missing", missing.length === 0 ? "none" : missing.join(", "));
show("apple kept its update", test.get("apple"));

/* --- overwrite again, after growing ------------------------ */

rule("Overwriting after the grow");
test.set("moon", "pale");
show("moon is now", test.get("moon"));
show("state", state(test));

/* --- the rest of the methods ------------------------------- */

rule("The other methods");
show("get('grape')", test.get("grape"));
show("get('mango')", String(test.get("mango")));
show("has('kite')", test.has("kite"));
show("has('mango')", test.has("mango"));
show("remove('kite')", test.remove("kite"));
show("remove('mango')", test.remove("mango"));
show("length()", test.length());
show("keys().length", test.keys().length);
show("values().length", test.values().length);
show("entries()[0]", JSON.stringify(test.entries()[0]));

rule("Insertion order is not preserved");
console.log(`  inserted: ${data.slice(0, 6).map(([k]) => k).join(", ")} …`);
console.log(`  returned: ${test.keys().slice(0, 6).join(", ")} …`);

rule("clear()");
test.clear();
show("state", state(test));
show("entries()", JSON.stringify(test.entries()));

/* --- out of bounds guard ----------------------------------- */

rule("Guards");
try {
  new HashMap().hash(42);
  show("hash(42)", "did not throw — that is wrong");
} catch (error) {
  show("hash(42)", `${error.constructor.name}: ${error.message}`);
}
console.log(`
  The brief also asks for an out-of-bounds check on every bucket access.
  It is in #bucketFor, and it is deliberately unreachable: hash() applies
  the modulo, so the index is always in range. It guards against a future
  change to hash(), not against anything callable today.`);

/* --- extra credit ------------------------------------------ */

rule("HashSet — keys with no values");
const set = new HashSet();
["rama", "sita", "rama", "hanuman"].forEach((name) => set.add(name));
show("added rama twice", `length ${set.length()}`);
show("has('sita')", set.has("sita"));
show("has('ravana')", set.has("ravana"));
show("keys()", JSON.stringify(set.keys()));
show("remove('sita')", set.remove("sita"));
show("keys() after", JSON.stringify(set.keys()));

console.log();
