# Before the HashMap project: how hash maps actually work

One lesson sits between Linked Lists and the HashMap project, and it is the one that explains something you have been using since your first week — `object["key"]`. Worth reading properly rather than skimming, because the project asks you to rebuild it.

Third in the series, after [whats-ahead.md](./whats-ahead.md) and [complexity-and-structures.md](./complexity-and-structures.md).

---

## The thing being explained

When you write `person["name"]`, JavaScript does **not** search for `"name"`. Searching would be `O(n)` — slower the more keys you had — and object lookup is famously `O(1)`, the same speed with ten keys or ten million.

It does this instead:

1. Run the key through a **hash function**, which turns the string into a number
2. Use that number as an **index into an array**
3. Go straight there

That's it. The magic is that a string becomes a number, and numbers are array indexes, and array indexes are instant.

---

## Hashing

**Hashing means turning an input into a number, deterministically.** Same input, same output, every time — no randomness. A hash function must be **pure**.

It is also **one-way**. You can hash `"Carlos"` into a number; you cannot take that number and get `"Carlos"` back. Given the hash of `"C"`, the original could have been Carlos, Carla or Carrot.

### The hash function you will write

The lesson builds up to this, and the project uses it:

```js
function hash(key) {
  let hashCode = 0;
  const primeNumber = 31;

  for (let i = 0; i < key.length; i++) {
    hashCode = primeNumber * hashCode + key.charCodeAt(i);
  }

  return hashCode;
}
```

Two things to understand rather than copy:

**Why multiply at all.** If you only *added* character codes, `"Sara"` and `"raSa"` would hash identically — same letters, same sum. Multiplying the running total before adding each character makes **position** matter, so anagrams stop colliding.

**Why 31 specifically.** Any number would work; a prime is better. Multiplying by a prime makes the resulting codes less likely to share factors with your bucket count, which spreads them more evenly across the buckets. Even distribution is the entire goal.

⚠️ **The trap in the project:** that `hashCode` grows fast and will exceed JavaScript's safe integer range on longer keys. You have to apply the modulo **inside the loop**, not just at the end:

```js
hashCode = (primeNumber * hashCode + key.charCodeAt(i)) % capacity;
```

---

## Buckets

The array the hash points into. Each slot is a **bucket**.

To store `"Fred" → "Smith"`: hash `"Fred"`, get a number, take it modulo the bucket count to land in range, store the pair there.

### The step people skip

To *retrieve*, you hash the key, go to that bucket — **and then you still have to compare the key.**

That feels redundant. You already found the bucket, so why check? Because **a hash code is only a location, and different keys can produce the same one.** The bucket tells you where to look; the key comparison tells you whether what's there is actually yours.

### Insertion order is not kept

Iterating a hash map does not give you back the order you inserted things. Hash codes scatter; index 3 might hold the tenth thing you added. JavaScript's own `Map` does preserve order, but by extra bookkeeping — the project builds an unordered one.

---

## Collisions

**A collision is two different keys landing in the same bucket.**

You cannot eliminate them. This is the **pigeonhole principle**: with more keys than buckets, at least two must share. A good hash function makes them rare; nothing makes them impossible.

**How you handle them: each bucket holds a linked list.** Empty bucket, store the head. Occupied bucket, walk the list to the end and add there — comparing keys as you go, so a repeat key overwrites instead of duplicating.

That is why Linked Lists came immediately before this. Not a coincidence.

---

## Growth, and the load factor

Buckets cost memory, so you start small — **16**, because powers of two allow bit-manipulation tricks for index calculation.

But as a map fills, collisions get common, the lists in each bucket get longer, and lookup slides from `O(1)` back toward `O(n)`. So you grow.

| Term | Meaning |
| --- | --- |
| **capacity** | How many buckets you currently have |
| **load factor** | The fullness threshold that triggers a grow — typically `0.75` to `1` |

At a load factor of `0.75` and capacity `16`, you grow once you hold **12 entries**.

**Growing is not just making the array bigger.** The bucket index depends on the capacity — `hash % capacity` — so changing the capacity changes where everything belongs. You must **re-hash every existing entry into the new array**. Doubling capacity and re-inserting everything is the standard move.

---

## The complexity payoff

| Operation | Average | Worst case |
| --- | --- | --- |
| Insertion | `O(1)` | `O(n)` |
| Retrieval | `O(1)` | `O(n)` |
| Removal | `O(1)` | `O(n)` |

The worst case is everything colliding into one bucket, at which point you have written a linked list with extra steps. That is why the hash function and the load factor both matter: they are what keep the average case *average*.

---

## The knowledge check, answered

| Question | Answer |
| --- | --- |
| What does it mean to hash? | Turn an input into a number, deterministically and one-way |
| What are buckets? | The array slots a hash code indexes into, where pairs are stored |
| What is a collision? | Two different keys producing the same hash code, so landing in the same bucket |
| When should you grow the buckets array? | When entries ÷ capacity reaches the load factor — 12 entries at capacity 16 and a factor of 0.75 |

---

## What the project will make you do

Beyond the concepts, the assignment adds one rule of its own. JavaScript will happily let you write to index 500 of a 16-slot array, which would silently defeat the entire exercise, so you must guard every bucket access:

```js
if (index < 0 || index >= buckets.length) {
  throw new Error("Trying to access index out of bounds");
}
```

Methods to build: `hash`, `set`, `get`, `has`, `remove`, `length`, `clear`, `keys`, `values`, `entries`.

---

## In one line

A hash map is an array you index by turning the key into a number; collisions are unavoidable so each slot holds a list; and when it gets three-quarters full you double it and re-hash everything, because the index depends on the capacity.
