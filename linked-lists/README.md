# Linked Lists

A singly linked list built from scratch, from [The Odin Project](https://www.theodinproject.com/)'s Linked Lists assignment.

No interface — the brief is a command-line project.

```bash
node main.js
```

## What a linked list is

A chain of nodes. Each node holds a value and a **pointer** to the next one. The list itself only knows where the chain starts, so to reach the tenth node you walk through nine others.

```
( dog ) -> ( cat ) -> ( parrot ) -> ( hamster ) -> null
```

That is the whole trade-off. Inserting into the middle is cheap — two pointers change and nothing moves. *Finding* the middle is expensive, because unlike an array there is no way to jump straight to an index.

JavaScript arrays already resize themselves and already insert at any index, so this is not a structure you need here. You build it because it is the simplest thing that uses pointers, and trees and graphs are pointers all the way down.

## The methods

| Method | Does |
| --- | --- |
| `append(value)` | Adds to the end |
| `prepend(value)` | Adds to the start |
| `size()` | How many nodes |
| `head()` / `tail()` | The first / last value, `undefined` if empty |
| `at(index)` | The value at an index, `undefined` if out of range |
| `pop()` | Removes the **head** and returns its value |
| `contains(value)` | `true` / `false` |
| `findIndex(value)` | Index of the first match, or `-1` |
| `toString()` | `( a ) -> ( b ) -> null`, empty string for an empty list |
| `insertAt(index, ...values)` | Inserts a run of values, `RangeError` out of bounds |
| `removeAt(index)` | Removes one, `RangeError` out of bounds |

`append`, `prepend` and `insertAt` return the list, so they chain: `new LinkedList().append("a").append("b")`.

### One surprise in the brief

**`pop()` removes the head, not the tail.** That is what the assignment specifies — "pop() should remove the head node from the list and return its value" — and it is the opposite of `Array.prototype.pop` and of most linked-list implementations, where popping the tail is the awkward operation precisely *because* a singly linked list cannot walk backwards. Implemented as written, and worth knowing if you compare against other people's solutions.

## Two things kept alongside the head

The brief only requires a head pointer. This also keeps a **tail** and a **size**, and the reason is complexity:

- Without a tail pointer, every `append` walks the whole list to find the end. That is `O(n)` per append, so building a list of `n` items costs `O(n²)`. Holding the end makes append `O(1)`.
- Without a stored size, `size()` has to count. Tracking it as the list changes makes it `O(1)`.

The price is that both have to be maintained *everywhere* — and that is where a linked list actually goes wrong. A stale tail pointer does not break immediately; it breaks the next time you append, long after the mistake. So the cases worth checking are the ones that move an end:

- popping the last node out of a list (tail must become `null`)
- appending again afterwards
- removing the tail node with `removeAt`
- inserting at index `0` of an empty list, or at `size`

All of those are exercised at the bottom of `main.js`.

## Class with private fields

`#head`, `#tail` and `#size` are genuinely private — not reachable from outside, not enumerable, not in `JSON.stringify`. The list can only be changed through its methods, so the invariant "tail always points at the last node" cannot be broken from the outside.

## What I Practiced

* Pointers, and that "linking" a node is just reassigning what `nextNode` refers to
* Why insertion is cheap and lookup is expensive here, and the reverse for arrays
* Keeping derived state (`tail`, `size`) correct across every operation that could invalidate it
* `#private` class fields, and what they actually protect

## Project Status

Complete, including the extra credit.

## Acknowledgements

Completed as part of The Odin Project's JavaScript course.
