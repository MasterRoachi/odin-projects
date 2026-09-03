# What's ahead

A plain-language guide to the parts of the curriculum still in front of you, written because the names give almost nothing away. "Knight's Travails" tells you nothing; "a shortest-path search on a graph" tells you a lot.

Accurate as of 3 September 2026, checked against the lesson files in [TheOdinProject/curriculum](https://github.com/TheOdinProject/curriculum).

---

## Where the line is

Everything up to here has been about **making a browser do things** — markup, layout, events, modules, fetching data. You now have most of that.

The next section changes subject entirely. It is not about the browser at all. It is about **how data is arranged in memory and how long it takes to get at**, which is the material technical interviews are almost entirely made of. It is the least immediately useful part of the course and the part most likely to get you hired.

Two projects are left in your current section, then the whole CS block, then a short Git section and the capstone.

---

## A Bit of Computer Science

Six lessons and five projects. This is the big one.

### Recursion

**What it is.** A function that calls itself. That's it. The whole trick is that every recursive function needs two things:

- a **base case** — the situation where it stops calling itself and just returns an answer
- a **recursive case** — where it calls itself on a *smaller* version of the problem

Miss the base case and it calls itself forever until the browser gives up. That error — "maximum call stack size exceeded" — is what a missing base case looks like.

**The project: Recursion.** Two classics.

*Fibonacci* — each number is the sum of the two before it (0, 1, 1, 2, 3, 5, 8, 13). Written recursively it is four lines and beautiful. It is also **spectacularly wasteful** — computing `fib(40)` recomputes `fib(10)` hundreds of times. The lesson has you write it anyway, because seeing something elegant be slow is the point; it sets up Big-O in the next lesson.

*Merge sort* — the genuinely useful one. Split the array in half. Split those halves. Keep going until every piece is a single item, which is sorted by definition. Then merge the pieces back together in order. This is "divide and conquer", and it is the shape of a huge number of real algorithms.

### Time complexity (Big-O)

**What it is.** A way of saying *how much slower does this get as the input gets bigger* — without measuring anything, and without caring what computer you're on.

You will see notation like `O(n)`. Read it as "grows in proportion to n":

| Notation | Means | Looks like |
| --- | --- | --- |
| `O(1)` | Constant. Same cost regardless of size | Looking up `array[5]` |
| `O(log n)` | Halves the problem each step | Binary search, a balanced tree lookup |
| `O(n)` | One pass through everything | Finding the largest number in a list |
| `O(n log n)` | The realistic best for sorting | Merge sort |
| `O(n²)` | Nested loop over the same data | Comparing every item to every other item |
| `O(2ⁿ)` | Doubles with each extra item | Naive recursive Fibonacci |

Why it matters: at 10 items, all of these are instant and the difference is invisible. At 10 million, `O(n)` finishes while you blink and `O(n²)` takes hours. Choosing the wrong structure is how software that worked fine in testing dies in production.

### Space complexity

The same idea for **memory** instead of time. The thing worth internalising: recursion is not free. Every pending call sits on the stack waiting, so a recursive function that goes `n` levels deep uses `O(n)` memory even if it looks like it uses none.

### Common data structures and algorithms

A survey lesson. Mostly names and shapes, setting up the four projects that follow.

---

### The four structure projects

These are the ones people find hardest, and they build on each other in order.

#### Linked Lists

**What it is.** A chain. Each item (a "node") holds a value and a **pointer** to the next node. The list itself only knows where the first node is; to reach the tenth you walk through nine others.

**Why bother, when JavaScript arrays already resize themselves?** The lesson admits outright that you don't need this in JS. You build it because:

- it is the simplest structure that uses **pointers**, and trees and graphs are pointers all the way down
- it makes the trade-off concrete: inserting into the middle of a linked list is cheap, but *finding* the middle is expensive. Arrays are the exact opposite.

**Expect to build:** `append`, `prepend`, `size`, `head`, `tail`, `at(index)`, `pop`, `contains`, `find`, `toString`, and insert/remove at an index.

#### Hash Map

**What it is.** This is the one that explains something you already use constantly. When you write `person["name"]`, JavaScript does not search for `"name"`. It runs the string through a **hash function** that turns it into a number, uses that number as an index into an array of "buckets", and goes straight there. That is why object lookup is `O(1)` — it does not scale with how many keys you have.

**The two hard parts:**

- **Collisions.** Two different keys can hash to the same bucket. You handle it by storing a small list in each bucket rather than a single value.
- **Load factor.** Once the map is about 75% full, collisions get common and performance degrades. So you **grow the array and re-hash everything into it**. The project sets a load factor of `0.75` and a starting capacity of `16`.

The lesson also makes you throw an error on out-of-bounds bucket access, specifically because JavaScript would otherwise happily let you write to index 500 of a 16-slot array and quietly defeat the whole exercise.

**Expect to build:** `hash`, `set`, `get`, `has`, `remove`, `length`, `clear`, `keys`, `values`, `entries`.

#### Binary Search Trees

**What it is.** A tree where every node has at most two children, and the rule is always: **everything to the left is smaller, everything to the right is bigger.** That single rule means finding a value is like binary search — at each node you discard half the remaining tree.

**Balance is the whole game.** If you insert 1, 2, 3, 4, 5 in order into a naive tree, you don't get a tree — you get a linked list wearing a tree costume, and lookup degrades from `O(log n)` back to `O(n)`. The project therefore has you build the tree **from a sorted array** by repeatedly taking the middle element, which produces a balanced tree by construction. Then it has you write `rebalance` for after you've inserted enough to ruin it.

**Traversal** — the ways to walk a tree — comes up here and matters again later:

- **Breadth-first (level order)** — visit everything one level at a time. Uses a **queue**.
- **Depth-first** — go all the way down one branch first. Uses a **stack**, or recursion, which is a stack. Comes in three flavours depending on when you look at the node relative to its children: *in-order* (which for a BST gives you sorted output), *pre-order*, *post-order*.

**Expect to build:** `buildTree`, `insert`, `deleteItem`, `find`, `levelOrder`, `inOrder`, `preOrder`, `postOrder`, `height`, `depth`, `isBalanced`, `rebalance`.

#### Knight's Travails

**What it is.** The payoff project, and the most satisfying of the four. A knight on a chessboard, a start square and an end square: find the **shortest** sequence of legal moves between them.

**Why it's really a graph problem.** Stop thinking about a board. Every square is a **vertex**. Every legal knight move from that square is an **edge** to another vertex. Now the question "what's the shortest route" is the standard shortest-path question on an unweighted graph.

**And that has a standard answer: breadth-first search.** BFS explores everything one move away, then everything two moves away, and so on — so the *first* time it reaches the target, it has necessarily arrived by the shortest route. Depth-first would find *a* path, but it would charge off down one branch and could easily return a twelve-move answer where three exist.

There is no interface to build. It's `knightMoves([0,0], [3,3])` returning the squares travelled.

---

## Intermediate Git

Three lessons, no projects, and a genuine relief after the CS block.

- **A Deeper Look at Git** — the difference between your working directory, the staging area and the repository. Amending commits, `reset` vs `revert` (one rewrites history, one adds a commit that undoes something — the distinction matters enormously once other people are involved).
- **Working with Remotes** — fetch vs pull, tracking branches, what actually happens when you push.
- **Using Git in the Real World** — rebasing, squashing, and the etiquette of not rewriting history other people have already pulled.

*Relevant to you right now:* this repo has 20 commits sitting on a branch called `project/recipes`, unpushed. That branch name stopped being accurate around the second project.

---

## Finishing Up with JavaScript

### Battleship

The capstone of the whole JavaScript course, and deliberately structured around **test-driven development** — write the failing test, then the code that passes it. You've just done the groundwork for this in Testing Practice.

You build the game logic (ships, a board that records hits and misses, a player) as thoroughly tested modules with **no DOM at all**, and only then put an interface on top. It is the same model/UI separation the Todo List used, but enforced by the tests rather than by discipline.

Then a short Conclusion lesson, and the JavaScript course is finished.

---

## And then

The rest of the Full Stack JavaScript path, in order:

| Course | Lessons / Projects | What it actually is |
| --- | --- | --- |
| **Advanced HTML and CSS** | 15 / 1 | Animation, then a substantial accessibility block (WCAG, semantic HTML, keyboard navigation, ARIA, auditing), then responsive design. Ends with rebuilding a homepage properly responsive. |
| **React** | 22 / 3 | The big one. Components, JSX, props, state, effects, the router, data fetching, testing React. Projects: a CV builder, a memory card game, a shopping cart. |
| **Databases** | 2 / 1 | Short. Relational databases and enough SQL to survive the backend course. |
| **NodeJS** | 21 / 9 | JavaScript on the server. Express, routing, controllers, views, PostgreSQL, authentication, Prisma, APIs, testing. Nine projects, ending with Odin-Book — a social network, the biggest thing in the path. |
| **Getting Hired** | 12 / 2 | Portfolio, CV, job search strategy, interviewing. |

**121 lessons and 30 projects** after Foundations, of which you have now done a meaningful slice.

---

## The honest summary

The CS section is the wall. It is abstract, there is nothing to look at when you finish, and none of it makes your websites better. Push through it anyway — not because you'll implement a hash map at work (you won't), but because it is the vocabulary every technical interview is conducted in, and because after building a balanced tree by hand you will never again be confused about why one piece of code is slow and another isn't.

React, after it, is the part that changes what you can build.
