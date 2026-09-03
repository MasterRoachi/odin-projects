/* =========================================================
   A hash map.

   An array of buckets. A key is turned into a number, that
   number picks a bucket, and the pair is stored there. Two
   different keys can pick the same bucket — a collision — so
   each bucket holds a linked list rather than a single entry.

   The linked list is the one from the Linked Lists project,
   imported rather than rewritten. That is why that project
   comes immediately before this one.
   ========================================================= */

import { LinkedList } from "../linked-lists/linkedList.js";

const DEFAULT_CAPACITY = 16;
const DEFAULT_LOAD_FACTOR = 0.75;

export class HashMap {
  #buckets;
  #capacity;
  #loadFactor;
  #length = 0;

  constructor(capacity = DEFAULT_CAPACITY, loadFactor = DEFAULT_LOAD_FACTOR) {
    this.#capacity = capacity;
    this.#loadFactor = loadFactor;
    this.#buckets = HashMap.#emptyBuckets(capacity);
  }

  static #emptyBuckets(capacity) {
    return Array.from({ length: capacity }, () => new LinkedList());
  }

  /* ------------------------------------------------------ */

  /**
   * Turns a string key into a bucket index.
   *
   * Multiplying the running total by a prime before adding each character
   * makes *position* matter, so "Sara" and "raSa" no longer collide the way
   * they would if the codes were merely summed.
   *
   * The modulo is applied inside the loop rather than once at the end. Left
   * to run, hashCode exceeds Number.MAX_SAFE_INTEGER on quite short keys and
   * the arithmetic silently stops being exact.
   */
  hash(key) {
    if (typeof key !== "string") {
      throw new TypeError("hash expects a string key");
    }

    let hashCode = 0;
    const primeNumber = 31;

    for (let i = 0; i < key.length; i++) {
      hashCode = (primeNumber * hashCode + key.charCodeAt(i)) % this.#capacity;
    }

    return hashCode;
  }

  /* ------------------------------------------------------ */

  set(key, value) {
    const bucket = this.#bucketFor(key);

    // a repeat key is an update, not a collision — the entry object is held
    // by the list, so writing to it changes what the list holds
    for (const entry of bucket) {
      if (entry.key === key) {
        entry.value = value;
        return this;
      }
    }

    bucket.append({ key, value });
    this.#length += 1;

    if (this.#length > this.#capacity * this.#loadFactor) this.#grow();
    return this;
  }

  get(key) {
    for (const entry of this.#bucketFor(key)) {
      if (entry.key === key) return entry.value;
    }
    return null;
  }

  has(key) {
    for (const entry of this.#bucketFor(key)) {
      if (entry.key === key) return true;
    }
    return false;
  }

  remove(key) {
    const bucket = this.#bucketFor(key);

    let index = 0;
    for (const entry of bucket) {
      if (entry.key === key) {
        bucket.removeAt(index);
        this.#length -= 1;
        return true;
      }
      index += 1;
    }

    return false;
  }

  length() {
    return this.#length;
  }

  clear() {
    this.#buckets = HashMap.#emptyBuckets(this.#capacity);
    this.#length = 0;
    return this;
  }

  keys() {
    return this.entries().map(([key]) => key);
  }

  values() {
    return this.entries().map(([, value]) => value);
  }

  /**
   * Every pair, bucket by bucket.
   *
   * The order is whatever the hash codes happen to produce, not the order
   * things were inserted. That is expected of a hash map.
   */
  entries() {
    const collected = [];
    this.#buckets.forEach((bucket) => {
      for (const entry of bucket) collected.push([entry.key, entry.value]);
    });
    return collected;
  }

  /* ------------------------------------------------------ */

  get capacity() {
    return this.#capacity;
  }

  get loadFactor() {
    return this.#loadFactor;
  }

  /** How full the map is, against the load factor that triggers a grow. */
  get load() {
    return this.#length / this.#capacity;
  }

  /** How many entries sit in each bucket — a collision is any count above one. */
  bucketSizes() {
    return this.#buckets.map((bucket) => bucket.size());
  }

  /* ------------------------------------------------------ */

  #bucketFor(key) {
    const index = this.hash(key);

    // JavaScript would happily let us write to index 500 of a 16-slot array,
    // which would defeat the whole point of a fixed number of buckets
    if (index < 0 || index >= this.#buckets.length) {
      throw new Error("Trying to access index out of bounds");
    }

    return this.#buckets[index];
  }

  /**
   * Doubles the capacity and re-inserts everything.
   *
   * This is not a resize. A bucket index is `hash % capacity`, so changing
   * the capacity changes where every existing key belongs — the entries have
   * to be hashed again against the new size, not copied across.
   */
  #grow() {
    const existing = this.entries();

    this.#capacity *= 2;
    this.#buckets = HashMap.#emptyBuckets(this.#capacity);
    this.#length = 0;

    existing.forEach(([key, value]) => this.set(key, value));
  }
}

export default HashMap;
