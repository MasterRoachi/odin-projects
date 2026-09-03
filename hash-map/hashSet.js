/* =========================================================
   A hash set.

   The extra credit: the same structure as a HashMap with the
   value column removed. Keys only.

   Rather than reimplement hashing, buckets, collisions and
   growth, it holds a HashMap and stores each key against a
   placeholder. That is genuinely what a set is — a map whose
   values nobody looks at.
   ========================================================= */

import { HashMap } from "./hashMap.js";

const PRESENT = true;

export class HashSet {
  #map;

  constructor(capacity, loadFactor) {
    this.#map = new HashMap(capacity, loadFactor);
  }

  add(key) {
    this.#map.set(key, PRESENT);
    return this;
  }

  has(key) {
    return this.#map.has(key);
  }

  remove(key) {
    return this.#map.remove(key);
  }

  length() {
    return this.#map.length();
  }

  clear() {
    this.#map.clear();
    return this;
  }

  keys() {
    return this.#map.keys();
  }

  get capacity() {
    return this.#map.capacity;
  }

  get load() {
    return this.#map.load;
  }
}

export default HashSet;
