/* =========================================================
   The driver script the brief asks for.

   Build from random numbers, prove it is balanced, walk it four
   ways, wreck it with values larger than anything in it, prove
   it is now unbalanced, rebalance, and walk it again.

   Run with:  node main.js
   ========================================================= */

import { Tree } from "./binarySearchTree.js";

/* The tree printer given in the assignment, unchanged. */
const prettyPrint = (node, prefix = "", isLeft = true) => {
  if (node === null) return;
  if (node.right !== null) {
    prettyPrint(node.right, `${prefix}${isLeft ? "│   " : "    "}`, false);
  }
  console.log(`${prefix}${isLeft ? "└── " : "┌── "}${node.data}`);
  if (node.left !== null) {
    prettyPrint(node.left, `${prefix}${isLeft ? "    " : "│   "}`, true);
  }
};

const rule = (title) => console.log(`\n${title}\n${"─".repeat(title.length)}`);
const show = (label, value) => console.log(`  ${label.padEnd(18)} ${value}`);

/** Collects a traversal into an array, so it can be printed on one line. */
const collect = (tree, order) => {
  const values = [];
  tree[order]((node) => values.push(node.data));
  return values;
};

function report(tree) {
  ["levelOrder", "inOrder", "preOrder", "postOrder"].forEach((order) => {
    show(order, collect(tree, order).join(" "));
  });
}

const randomNumbers = (count, ceiling) =>
  Array.from({ length: count }, () => Math.floor(Math.random() * ceiling));

/* --- build ------------------------------------------------- */

const numbers = randomNumbers(15, 100);
const tree = new Tree(numbers);

rule("A tree from random numbers below 100");
show("generated", numbers.join(" "));
show("kept", `${tree.size()} of ${numbers.length} — duplicates dropped`);
console.log();
prettyPrint(tree.root);

rule("Is it balanced?");
show("isBalanced()", tree.isBalanced());
show("height", tree.height(tree.root));
show("perfect would be", Math.ceil(Math.log2(tree.size() + 1)) - 1);

rule("Walked four ways");
report(tree);

/* --- wreck it ---------------------------------------------- */

/*
 * Every one of these is larger than everything already in the tree, so each
 * goes right, then right again, forever. They come in ascending order, so
 * they chain rather than spread — six inserts, six levels.
 */
const tall = [101, 202, 303, 404, 505, 606];

rule("Unbalancing it");
show("inserting", tall.join(" "));
tall.forEach((value) => tree.insert(value));
console.log();
prettyPrint(tree.root);

rule("Is it balanced now?");
show("isBalanced()", tree.isBalanced());
show("height", tree.height(tree.root));
show("left side", tree.height(tree.root.left));
show("right side", tree.height(tree.root.right));

/* --- put it right ------------------------------------------ */

rule("rebalance()");
const before = tree.toArray();
tree.rebalance();
console.log();
prettyPrint(tree.root);

rule("Is it balanced again?");
show("isBalanced()", tree.isBalanced());
show("height", tree.height(tree.root));
show("values intact", `${JSON.stringify(before) === JSON.stringify(tree.toArray())}`);

rule("Walked four ways again");
report(tree);

/* --- the rest of the interface ------------------------------ */

rule("The other methods");
const smallest = tree.toArray()[0];
show("find(smallest)", `${smallest} → node ${tree.find(smallest).data}`);
show("find(9999)", String(tree.find(9999)));
show("depth(root)", tree.depth(tree.root.data));
show("depth(smallest)", tree.depth(smallest));
show("height(smallest)", tree.height(smallest));
show("depth(9999)", String(tree.depth(9999)));

rule("Deleting the root — the two-children case");
const oldRoot = tree.root.data;
tree.deleteItem(oldRoot);
show("removed", oldRoot);
show("new root", `${tree.root.data} — its in-order successor`);
show("still sorted", collect(tree, "inOrder").join(" "));

rule("Traversals demand a callback");
try {
  tree.inOrder();
} catch (error) {
  show("inOrder()", `${error.constructor.name}: ${error.message}`);
}

console.log();
