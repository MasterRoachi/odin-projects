import { Tree } from "./binarySearchTree.js";

let pass = 0, fail = 0;
const ok = (label, got, want) => {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  if (a === b) { pass++; } else { fail++; console.log("FAIL " + label + ": got " + a + " want " + b); }
};

const t = new Tree([1, 7, 4, 23, 8, 9, 4, 3, 5, 7, 9, 67, 6345, 324]);
ok("sorted and deduped", t.toArray(), [1,3,4,5,7,8,9,23,67,324,6345]);
ok("size", t.size(), 11);
ok("balanced on build", t.isBalanced(), true);
ok("height of root", t.height(t.root), 3);
ok("find hit", t.find(23).data, 23);
ok("find miss", t.find(99), null);
ok("depth of root", t.depth(t.root.data), 0);
ok("height of a missing value", t.height(999), null);
ok("depth of a missing value", t.depth(999), null);

// delete, all three shapes
const leaf = new Tree([1,2,3,4,5,6,7]);
leaf.deleteItem(1);
ok("delete a leaf", leaf.toArray(), [2,3,4,5,6,7]);
const one = new Tree([1,2,3,4,5,6,7]);
one.deleteItem(2);
ok("delete a one-child node", one.toArray(), [1,3,4,5,6,7]);
const two = new Tree([1,2,3,4,5,6,7]);
ok("root has two children", [two.root.data, !!two.root.left, !!two.root.right], [4,true,true]);
two.deleteItem(4);
ok("delete the root", two.toArray(), [1,2,3,5,6,7]);
ok("successor was promoted", two.root.data, 5);
ok("still balanced after root delete", two.isBalanced(), true);
ok("delete something absent", (two.deleteItem(999), two.toArray()), [1,2,3,5,6,7]);

// insert
const ins = new Tree([1,2,3]);
ins.insert(4).insert(4).insert(0);
ok("insert, duplicates ignored", ins.toArray(), [0,1,2,3,4]);

// traversal orders on a known shape: [1..7] builds root 4, left 2, right 6
const o = new Tree([1,2,3,4,5,6,7]);
const grab = (fn) => { const a = []; o[fn]((n) => a.push(n.data)); return a; };
ok("levelOrder", grab("levelOrder"), [4,2,6,1,3,5,7]);
ok("inOrder", grab("inOrder"), [1,2,3,4,5,6,7]);
ok("preOrder", grab("preOrder"), [4,2,1,3,6,5,7]);
ok("postOrder", grab("postOrder"), [1,3,2,5,7,6,4]);

for (const fn of ["levelOrder","inOrder","preOrder","postOrder"]) {
  let threw = false;
  try { o[fn](); } catch (e) { threw = e instanceof TypeError; }
  ok(fn + " demands a callback", threw, true);
}

// isBalanced must check every node, not just the root
const skew = new Tree([50]);
[10, 5, 3].forEach((v) => skew.insert(v));
[90, 95, 99].forEach((v) => skew.insert(v));
ok("root looks even but sides are chains", [skew.height(skew.root.left), skew.height(skew.root.right)], [2,2]);
ok("still correctly unbalanced", skew.isBalanced(), false);
skew.rebalance();
ok("rebalanced", skew.isBalanced(), true);
ok("rebalance kept every value", skew.toArray(), [3,5,10,50,90,95,99]);

// empty tree
const empty = new Tree();
ok("empty root", empty.root, null);
ok("empty size", empty.size(), 0);
ok("empty is balanced", empty.isBalanced(), true);
ok("empty toArray", empty.toArray(), []);
empty.deleteItem(5);
ok("delete from empty is safe", empty.toArray(), []);

// strings work too
const words = new Tree(["pear", "apple", "fig", "apple", "date"]);
ok("strings sort", words.toArray(), ["apple","date","fig","pear"]);

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
