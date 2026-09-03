# Databases: the short course that everything after it depends on

Two lessons and one project. It is the smallest course in the path and the one with the highest ratio of usefulness to length, because **every single one of the nine NodeJS projects talks to a database**. Skimming this makes the next course much harder than it needs to be.

Seventh in the series, after [whats-ahead.md](./whats-ahead.md), [complexity-and-structures.md](./complexity-and-structures.md), [hash-maps.md](./hash-maps.md), [testing-for-real.md](./testing-for-real.md), [advanced-html-css.md](./advanced-html-css.md) and [react.md](./react.md).

---

## What a relational database actually is

Tables. Rows are records, columns are fields, and every row in a table has the same shape.

That last part is the whole bargain. You give up the freedom of `localStorage` — where you have been throwing arbitrary JSON — and in exchange the database can **enforce** things: this column must be a date, this field cannot be empty, this order must belong to a customer who exists.

Everything you have stored so far has been unenforced. The Ark re-seats books on their prototype because JSON does not carry methods; the CV Builder runs imported files through a `normalise` function because a file off disk is not trusted to have the right shape. A database is the thing that makes that class of defensive code unnecessary, because bad data cannot get in.

## SQL is declarative

You describe the result you want, not the steps to get it. There is no loop:

```sql
SELECT name, price FROM products WHERE category = 'jewelery' ORDER BY price DESC LIMIT 5;
```

That is the same job as `products.filter(...).sort(...).slice(0, 5)` from the shopping cart, said once and left to the database to work out how. The database has a query planner whose entire job is deciding *how* — and it is much better at it than you, because it knows how big the tables are and what indexes exist.

---

## The four things you do

```sql
SELECT  columns FROM table WHERE condition;   -- read
INSERT  INTO table (a, b) VALUES (1, 2);      -- create
UPDATE  table SET a = 1 WHERE condition;      -- change
DELETE  FROM table WHERE condition;           -- destroy
```

**Learn this reflex now:** `UPDATE` and `DELETE` without a `WHERE` clause apply to **every row in the table**. There is no undo and no confirmation dialogue. Write the `WHERE` first, then go back and write the verb — professionals genuinely do this, and the ones who do not have a story about the day they did not.

The safe habit: run it as a `SELECT` first, look at what comes back, then swap `SELECT *` for `DELETE`.

## Keys, and why rows can find each other

A **primary key** uniquely identifies a row — usually `id`. A **foreign key** is a column holding another table's primary key, and it is how tables relate:

```sql
CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  total_cents INTEGER NOT NULL
);
```

`REFERENCES` is the important word. The database will now **refuse** an order whose `customer_id` does not exist, and refuse to delete a customer who still has orders. That is *referential integrity*, and it is a guarantee you cannot get from a JSON file no matter how carefully you write your code.

## Joins — the actual difficulty

Everything above is easy. Joins are where people get stuck, and it is worth being slow about them.

A join answers: *for each row in this table, find the matching rows in that one.*

```sql
SELECT customers.name, orders.total_cents
FROM   customers
JOIN   orders ON orders.customer_id = customers.id;
```

- **`INNER JOIN`** (plain `JOIN`) — only rows with a match on both sides. A customer with no orders **disappears entirely.**
- **`LEFT JOIN`** — every row from the left table, with `NULL` where the right has no match. The customer with no orders stays, with nulls beside them.

**That distinction is the bug.** "Why is this customer missing from my report?" is almost always an inner join where a left join was meant. If you want *every* X regardless, you need `LEFT JOIN`.

### Many-to-many needs a third table

A product can be in many orders; an order contains many products. You cannot express that with a column on either side, so you use a **join table**:

```
products ──< order_items >── orders
```

`order_items` holds `product_id`, `order_id`, and usually the quantity and the price at the time. That last point is subtle and real: the price belongs on the order line, not looked up from the product, or every historical order silently changes when you reprice something.

## Aggregates and grouping

```sql
SELECT   category, COUNT(*) AS items, AVG(price) AS average
FROM     products
GROUP BY category
HAVING   COUNT(*) > 3
ORDER BY average DESC;
```

`WHERE` filters rows **before** grouping; `HAVING` filters groups **after**. Using `WHERE` where you meant `HAVING` is the second classic mistake, after the join one.

## NULL is not a value

`NULL` means *unknown*, and it does not behave like anything else:

- `NULL = NULL` is not true. It is `NULL`. Use `IS NULL`.
- `COUNT(*)` counts rows; `COUNT(column)` skips nulls in that column. Those give different answers and both are sometimes right.
- Any arithmetic touching `NULL` produces `NULL`, so a sum can quietly come back empty.

## Indexes

An index is why a query on a million rows returns instantly. Without one the database scans every row; with one it can jump straight to the right place.

You have already built one. **A database index is usually a B-tree**, and you built a balanced search tree in [Two Trees](../binary-search-trees/README.md) — including the demonstration of what happens when it degenerates. That project is the mechanism, at a smaller scale.

The trade-off: indexes make reads fast and writes slower, because every insert has to update the index too. So you index what you search by, not everything.

## Transactions

Several statements that must all happen or none:

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

If the second statement fails, `ROLLBACK` puts the first one back. Without this, a crash between the two lines destroys £100. This is the *A* in **ACID** — atomicity, consistency, isolation, durability.

---

## SQL injection — read this one twice

This is the single most important thing in the course, and it is why the NodeJS lessons keep going on about it.

**Never build a query by concatenating strings.**

```js
// catastrophic
db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

Someone types `' OR '1'='1` as their email and the query becomes `WHERE email = '' OR '1'='1'` — which is true for every row, and they are now logged in as somebody. A nastier input ends with `'; DROP TABLE users; --`.

**Always use parameters:**

```js
// safe
db.query("SELECT * FROM users WHERE email = $1", [email]);
```

The value is sent to the database *separately* from the query text, so it can never be read as SQL. It is not escaping and it is not sanitising — the value is simply never parsed as code.

This is the same shape of bug as everything else about trusting input, which has come up repeatedly here: the CV Builder normalises imported files, Battleship validates coordinates, the shopping cart filters malformed cart lines out of storage. Injection is that lesson with much worse consequences.

## The N+1 problem

Coming for you in the NodeJS course, when an ORM makes it easy to write:

```js
const posts = await getPosts();                       // 1 query
for (const post of posts) post.author = await getAuthor(post.author_id);  // N more
```

Fifty posts is fifty-one round trips. One `JOIN` would have done it in one. You already fixed exactly this shape in the memory game — sixteen cards could have been sixteen requests to PokéAPI, and the list endpoint plus a derivable image path made it one.

---

## The project

**SQL Zoo** — work through the tutorials at [sqlzoo.net](https://sqlzoo.net/). It is not a web app and there is nothing to deploy; it is query practice against real datasets, and it is the right shape for learning joins because it makes you write them rather than read about them.

Get to the point where you can write a three-table join without looking it up. Everything in NodeJS assumes it.

## Then

**NodeJS**: 21 lessons and **nine** projects, ending with Odin-Book — a social network, and the largest thing in the curriculum. That course is where the databases stop being an exercise.
