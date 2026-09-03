# Before Linked Lists: complexity, stacks and queues

The three lessons between the Recursion project and the Linked Lists project have no project of their own, so they are easy to skim and then find yourself needing later. This is what actually matters in them.

Companion to [whats-ahead.md](./whats-ahead.md).

---

## Time complexity

### Efficiency is counted in steps, not seconds

Seconds depend on your laptop, what else is running, and how warm the CPU is. So efficiency is measured in **steps** — how many operations the algorithm performs — and specifically in **how the number of steps grows as the input grows**.

That last part is the whole idea. Nobody cares whether something takes 12 steps or 15. They care whether doubling the input doubles the work or squares it.

### Constants get thrown away

If you count precisely you might get `2n + 5` steps. That becomes **O(n)**.

- Drop the constant multiplier — `2n` and `500n` are both `O(n)`
- Drop the lower-order terms — `n² + n + 30` is `O(n²)`, because once `n` is large the `n²` dwarfs everything else

This feels like cheating and isn't. It is the only way the measurement stays true regardless of machine.

### Three notations, one you'll actually use

| Notation | Means |
| --- | --- |
| **Big O** | The **worst** case — the upper bound |
| Omega (Ω) | The best case — the lower bound |
| Theta (Θ) | Both, so effectively the average case |

When anyone says "what's the complexity", they mean Big O. The others exist so you know why the O is there.

### The ladder

From best to worst, with what each actually looks like:

| Complexity | Name | In code | Doubling the input… |
| --- | --- | --- | --- |
| `O(1)` | Constant | `array[5]`, `map.get(key)` | changes nothing |
| `O(log N)` | Logarithmic | Binary search; a balanced tree lookup | adds **one** step |
| `O(N)` | Linear | One loop over the input | doubles the work |
| `O(N log N)` | — | Merge sort, and any decent sort | slightly more than doubles |
| `O(N²)` | Quadratic | A loop inside a loop over the same data | **quadruples** the work |
| `O(N³)` | Cubic | Three nested loops | ×8 |
| `O(2ᴺ)` | Exponential | Naive recursive Fibonacci | doubles with each *single* extra item |
| `O(N!)` | Factorial | Trying every possible ordering | hopeless past about 12 |

The practical cliff is between `O(N log N)` and `O(N²)`. Above the line, big inputs are fine. Below it, they aren't.

### The caveat worth remembering

**Big O ignores constant factors, and constant factors are real.** An `O(N)` algorithm with an enormous per-step cost can lose to an `O(N²)` one on small inputs. This is why production sort functions often switch to insertion sort for tiny arrays — `O(N²)` but with almost no overhead.

So: Big O tells you which algorithm wins *eventually*. If two algorithms have the same complexity, or your inputs are always small, stop theorising and **measure**.

---

## Space complexity

### The same question, about memory

How much memory does this need as the input grows? Same notation, same ladder.

### Auxiliary space is the useful number

- **Total space** = the input itself + whatever extra you allocate
- **Auxiliary space** = just the extra

Auxiliary is almost always what's meant, because you had to have the input anyway. An algorithm that sorts an array by shuffling it in place uses `O(1)` auxiliary space no matter how big the array is.

### Recursion is not free

This is the thing to take away. Every call that hasn't returned yet is sitting on the **call stack**, holding its variables. A recursive function that goes `n` levels deep uses `O(n)` memory even if it never allocates a single array.

That is what "maximum call stack size exceeded" means: not an infinite loop, but too many unreturned calls stacked up. A missing base case is the usual cause, but a legitimately deep recursion on a big input can do it too.

Worth knowing about the merge sort you just wrote: it is `O(N log N)` in time but **`O(N)` in auxiliary space**, because every merge builds a new array. In-place quicksort trades that for `O(log N)` space. Neither is simply better.

### The trade you'll make constantly

Memoisation — caching results so you never compute the same thing twice — buys time with space. Naive recursive Fibonacci is `O(2ᴺ)` time and `O(N)` space; memoised it's `O(N)` time and `O(N)` space. That is an enormous win for a small cost, and it is the same bargain behind every cache you will ever write.

---

## Common data structures and algorithms

Short lesson, and the direct setup for the next four projects.

### Stack — last in, first out

A pile of plates. You **push** onto the top and **pop** off the top. The last thing in is the first thing out.

**You already use one constantly:** the call stack. When a function calls a function, the caller is pushed down and waits. That is why recursion and stacks are the same idea wearing different clothes.

### Queue — first in, first out

A queue at a counter. You **enqueue** at the back and **dequeue** from the front. The first thing in is the first thing out.

Those two words — *enqueue* and *dequeue* — are worth memorising because the lesson's knowledge check asks for them by name.

### Why this matters for what's coming

This is the single most useful thing in the lesson, and it decides how you write two of the next three projects:

> **Breadth-first traversal uses a queue. Depth-first traversal uses a stack.**

- **Breadth-first** explores level by level — all the neighbours, then all *their* neighbours. To do that you park nodes in a **queue** and take them in the order you found them. This is why BFS finds the *shortest* path: it cannot reach anything in five steps before it has finished everything reachable in four.
- **Depth-first** charges down one branch to the bottom before backtracking. You park nodes on a **stack** and take the most recent one first — or you just use recursion, which is the call stack doing it for you.

Both the Binary Search Trees project and Knight's Travails hinge on this.

### Binary search

Look at the middle. Too big? Throw away the top half. Too small? Throw away the bottom half. Repeat.

- It is **divide and conquer** — the same design principle as merge sort. That is what the knowledge check is asking.
- It is `O(log N)`, which is why a million-item search takes about twenty steps.
- **It only works on sorted data.** That precondition is the entire cost of the technique, and it's why sorting is worth so much.

Compare with linear search — just check every item — which is `O(N)` and works on anything.

---

## The knowledge check, answered

The lesson ends with six questions. They are worth being able to answer cold:

| Question | Answer |
| --- | --- |
| Difference between a stack and a queue? | Stack is last-in-first-out; queue is first-in-first-out |
| What are enqueue and dequeue? | Adding to the back of a queue, and removing from the front |
| What is a linked list? A node? | A chain of nodes; a node holds a value and a pointer to the next one |
| Which design principle does binary search implement? | Divide and conquer |
| What structure defers nodes in a **breadth**-first traversal? | A queue |
| What structure defers nodes in a **depth**-first traversal? | A stack |

---

## In one line

Big O describes growth, not speed. Recursion costs stack memory. Queue means breadth, stack means depth — and that one sentence is most of the next three projects.
