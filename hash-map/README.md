# HashMap

A hash map built from scratch, from [The Odin Project](https://www.theodinproject.com/)'s HashMap assignment. Plus the extra-credit `HashSet`, and a page you can watch it fill up on.

```bash
node main.js        # walks the brief's test sequence
```

[**Buckets**](./index.html) — the visualiser. Every column is a bucket, every tile a key–value pair. Fill it past three-quarters and watch the whole thing double and redeal.

## What it is

An array of buckets. A key is turned into a number, that number picks a bucket, and the pair is stored there. That is the entire reason `object["key"]` is `O(1)` — nothing is searched for, the key is *computed into* a location.

Two different keys can pick the same bucket. That is a collision, it is unavoidable, and it is why each bucket holds a linked list rather than one entry.

## The buckets are the linked list from the last project

Imported, not rewritten:

```js
import { LinkedList } from "../linked-lists/linkedList.js";
```

That is why Linked Lists comes immediately before this in the curriculum. Using it needed one small addition to that class — a `[Symbol.iterator]`, so a bucket can be walked with `for...of`. Without it, walking a bucket meant calling `at(i)` in a loop, and `at` restarts from the head every time.

*The cross-project import means this project will break if `linked-lists/` is moved or renamed.*

## The three things that are easy to get wrong

**The modulo goes inside the loop.**

```js
hashCode = (primeNumber * hashCode + key.charCodeAt(i)) % this.#capacity;
```

Left to accumulate, `hashCode` passes `Number.MAX_SAFE_INTEGER` on quite short keys and the arithmetic silently stops being exact. Taking the modulo on every iteration keeps it small and keeps it correct.

**A repeat key is an update, not a collision.** Finding the right bucket is not enough — the bucket may hold several entries, so you still have to compare keys. Matching key, overwrite the value and leave `length` alone. Different key, append and increment.

**Growing is not resizing.** A bucket index is `hash % capacity`, so changing the capacity changes where every existing key belongs. The old buckets cannot be copied across; every entry has to be hashed again against the new size. `#grow` reads all the entries out, rebuilds the array at double the size, and `set`s them all back.

## Running the brief's sequence

`node main.js` follows the assignment exactly, and prints what the map is doing at each step:

```
Twelve entries — exactly at the load factor
  state            capacity 16   length 12   load 0.75
  bucket sizes     0 1 0 1 1 1 0 0 0 0 1 2 2 1 1 1
  collisions       bucket 11 holds 2, bucket 12 holds 2

set('moon', 'silver') — this exceeds the load factor
  before           capacity 16   length 12   load 0.75
  after            capacity 32   length 13   load 0.41
  collisions       bucket 28 holds 2
```

Twelve entries sits at exactly `0.75` and does **not** grow — the threshold is *passing* the load factor, not reaching it. The thirteenth triggers it. All thirteen keys survive the rehash, including the ones that had been overwritten.

## The guard that cannot fire

The brief asks for an out-of-bounds check on every bucket access, and it is there in `#bucketFor`. It is also unreachable: `hash()` applies the modulo, so the index is always in range.

That is not a reason to leave it out. It guards against a future change to `hash()` — and the brief includes it precisely because JavaScript would otherwise let you write to index 500 of a 16-slot array and quietly defeat the entire exercise.

## HashSet — the extra credit

The same structure with the value column removed. Rather than reimplement hashing, buckets, collisions and growth, it holds a `HashMap` and stores each key against a placeholder — which is genuinely what a set is, a map whose values nobody reads.

```js
const set = new HashSet();
set.add("rama").add("sita").add("rama");
set.length();   // 2 — adding a key twice is an update, not a second entry
set.keys();     // ["rama", "sita"]
```

## The page

`index.html` renders the real `HashMap` — `entries()` and `bucketSizes()` come straight off the instance, and there is no second copy of the logic.

Each tile takes its hue from **its own key**, so a key is always the same colour. That is what makes the growth legible: when the map doubles you can follow a colour from one column to another and see that it genuinely moved rather than that the picture was redrawn.

## Complexity

| Operation | Average | Worst |
| --- | --- | --- |
| `set`, `get`, `has`, `remove` | `O(1)` | `O(n)` |

The worst case is everything landing in one bucket, at which point this is a linked list with extra steps. The hash function and the load factor exist to keep the average case average.

## What I Practiced

* Why hashing multiplies by a prime rather than summing characters, and what breaks without it
* That a hash code is a *location*, not an identity — hence still comparing keys
* Growth as a rehash rather than a copy
* Composing a structure out of one already built, rather than starting over

## Project Status

Complete, including the extra credit.

## Acknowledgements

Completed as part of The Odin Project's JavaScript course.
