/* =========================================================
   Exercising the linked list.

   Run with:  node main.js
   ========================================================= */

import { LinkedList } from "./linkedList.js";

const show = (label, value) => console.log(`  ${label.padEnd(26)} ${value}`);
const rule = (title) => console.log(`\n${title}\n${"─".repeat(title.length)}`);

/* --- build one -------------------------------------------- */

const list = new LinkedList();
["dog", "cat", "parrot", "hamster", "snake", "turtle"].forEach((animal) =>
  list.append(animal)
);

rule("The list");
console.log(`  ${list.toString()}`);

rule("Reading it");
show("size()", list.size());
show("head()", list.head());
show("tail()", list.tail());
show("at(0)", list.at(0));
show("at(3)", list.at(3));
show("at(99)", list.at(99));
show("contains('parrot')", list.contains("parrot"));
show("contains('badger')", list.contains("badger"));
show("findIndex('snake')", list.findIndex("snake"));
show("findIndex('badger')", list.findIndex("badger"));

/* --- changing it ------------------------------------------ */

rule("prepend('lizard')");
list.prepend("lizard");
console.log(`  ${list.toString()}`);

rule("pop()  — the brief's pop removes the head");
show("returned", list.pop());
console.log(`  ${list.toString()}`);

rule("insertAt(1, 'ferret', 'gecko')");
list.insertAt(1, "ferret", "gecko");
console.log(`  ${list.toString()}`);

rule("removeAt(2)");
show("returned", list.removeAt(2));
console.log(`  ${list.toString()}`);

rule("insertAt(size) appends");
list.insertAt(list.size(), "newt");
console.log(`  ${list.toString()}`);
show("tail()", list.tail());

/* --- the edges -------------------------------------------- */

rule("Out of bounds");
[
  ["insertAt(-1, 'x')", () => list.insertAt(-1, "x")],
  ["insertAt(99, 'x')", () => list.insertAt(99, "x")],
  ["removeAt(99)", () => list.removeAt(99)],
  ["removeAt(size)", () => list.removeAt(list.size())],
].forEach(([label, run]) => {
  try {
    run();
    show(label, "did not throw — that is wrong");
  } catch (error) {
    show(label, `${error.constructor.name}: ${error.message}`);
  }
});

rule("An empty list");
const empty = new LinkedList();
show("size()", empty.size());
show("head()", String(empty.head()));
show("tail()", String(empty.tail()));
show("at(0)", String(empty.at(0)));
show("pop()", String(empty.pop()));
show("contains('dog')", empty.contains("dog"));
show("findIndex('dog')", empty.findIndex("dog"));
show("toString()", `"${empty.toString()}"`);

rule("Emptying a list keeps head and tail honest");
const two = new LinkedList().append("a").append("b");
show("start", two.toString());
two.pop();
show("after one pop", `${two.toString()}   tail: ${two.tail()}`);
two.pop();
show("after two pops", `"${two.toString()}"   tail: ${String(two.tail())}`);
two.append("c");
show("append after empty", `${two.toString()}   tail: ${two.tail()}`);

console.log();
