/* =========================================================
   A balanced binary search tree.

   Every node holds a value, and everything smaller than it
   sits to its left, everything larger to its right. That one
   rule is the whole structure — it is what lets a search throw
   away half the remaining tree at every step.

   That halving only holds while the tree is balanced. A tree
   built by inserting sorted values one at a time is a linked
   list wearing a tree costume, and searching it is O(n). Hence
   buildTree, isBalanced and rebalance.
   ========================================================= */

export class Node {
  constructor(data, left = null, right = null) {
    this.data = data;
    this.left = left;
    this.right = right;
  }
}

export class Tree {
  #root;

  constructor(array = []) {
    this.#root = Tree.buildTree(array);
  }

  get root() {
    return this.#root;
  }

  /* ------------------------------------------------------ */

  /**
   * Turns an array into a balanced tree.
   *
   * Sorted and deduplicated first — duplicates have no place to go in a
   * search tree, since a value is either less than a node or greater than it.
   *
   * Then the middle element becomes the root and each half is built the same
   * way. Taking the middle is what makes it balanced: both sides get the same
   * number of values, all the way down.
   */
  static buildTree(array) {
    const sorted = [...new Set(array)].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
    return Tree.#build(sorted, 0, sorted.length - 1);
  }

  static #build(sorted, start, end) {
    if (start > end) return null;

    const mid = Math.floor((start + end) / 2);
    return new Node(
      sorted[mid],
      Tree.#build(sorted, start, mid - 1),
      Tree.#build(sorted, mid + 1, end)
    );
  }

  /* ------------------------------------------------------ */

  /**
   * Walks down comparing, and hangs the value off the first empty branch.
   *
   * Insertion never restructures anything, which is why repeated inserts can
   * unbalance a tree — this is a plain BST, not an AVL or red-black tree that
   * rotates to keep itself in shape.
   */
  insert(value) {
    this.#root = Tree.#insertInto(this.#root, value);
    return this;
  }

  static #insertInto(node, value) {
    if (node === null) return new Node(value);

    if (value < node.data) node.left = Tree.#insertInto(node.left, value);
    else if (value > node.data) node.right = Tree.#insertInto(node.right, value);
    // equal — already here, and a search tree holds no duplicates

    return node;
  }

  /**
   * Removes a value, in one of three shapes:
   *
   *   no children   — detach it
   *   one child     — the child takes its place
   *   two children  — neither child can be promoted without breaking the
   *                   ordering, so the value is replaced by its in-order
   *                   successor (the smallest value on its right), which is
   *                   the only other value that can sit there legally. That
   *                   successor is then deleted from the right subtree, where
   *                   it is guaranteed to have at most one child.
   */
  deleteItem(value) {
    this.#root = Tree.#deleteFrom(this.#root, value);
    return this;
  }

  static #deleteFrom(node, value) {
    if (node === null) return null;

    if (value < node.data) {
      node.left = Tree.#deleteFrom(node.left, value);
      return node;
    }
    if (value > node.data) {
      node.right = Tree.#deleteFrom(node.right, value);
      return node;
    }

    if (node.left === null) return node.right;
    if (node.right === null) return node.left;

    const successor = Tree.#leftmost(node.right);
    node.data = successor.data;
    node.right = Tree.#deleteFrom(node.right, successor.data);
    return node;
  }

  static #leftmost(node) {
    let current = node;
    while (current.left !== null) current = current.left;
    return current;
  }

  /**
   * The node holding a value, or null.
   *
   * Iterative rather than recursive — there is no work to do on the way back
   * up, so there is nothing for the call stack to hold.
   */
  find(value) {
    let current = this.#root;
    while (current !== null && current.data !== value) {
      current = value < current.data ? current.left : current.right;
    }
    return current;
  }

  /* --- traversals ---------------------------------------- */

  /**
   * Breadth first — every node at one depth before any node at the next.
   *
   * A queue, not recursion. Recursion goes deep by nature; going wide means
   * holding a whole row of nodes at once, and that row is the queue.
   *
   * The queue is drained with a moving index rather than shift(), which is
   * O(n) each time because it renumbers the whole array.
   */
  levelOrder(callback) {
    Tree.#requireCallback(callback, "levelOrder");
    if (this.#root === null) return;

    const queue = [this.#root];
    for (let i = 0; i < queue.length; i++) {
      const node = queue[i];
      callback(node);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }

  /** Left, node, right — which for a search tree comes out sorted. */
  inOrder(callback) {
    Tree.#requireCallback(callback, "inOrder");
    (function walk(node) {
      if (node === null) return;
      walk(node.left);
      callback(node);
      walk(node.right);
    })(this.#root);
  }

  /** Node first — the order that would rebuild this exact tree by insertion. */
  preOrder(callback) {
    Tree.#requireCallback(callback, "preOrder");
    (function walk(node) {
      if (node === null) return;
      callback(node);
      walk(node.left);
      walk(node.right);
    })(this.#root);
  }

  /** Node last — children are always finished before their parent. */
  postOrder(callback) {
    Tree.#requireCallback(callback, "postOrder");
    (function walk(node) {
      if (node === null) return;
      walk(node.left);
      walk(node.right);
      callback(node);
    })(this.#root);
  }

  static #requireCallback(callback, name) {
    if (typeof callback !== "function") {
      throw new TypeError(`${name} needs a callback — without one it would do nothing`);
    }
  }

  /* --- shape --------------------------------------------- */

  /**
   * Edges on the longest path down from a node to a leaf.
   *
   * Accepts a node or a value. A leaf is 0, and a value that is not in the
   * tree is null.
   */
  height(target) {
    const node = target instanceof Node ? target : this.find(target);
    return node === null ? null : Tree.#heightOf(node);
  }

  static #heightOf(node) {
    if (node === null) return -1;
    return 1 + Math.max(Tree.#heightOf(node.left), Tree.#heightOf(node.right));
  }

  /** Edges from the root down to a node. The root is 0. */
  depth(target) {
    const value = target instanceof Node ? target.data : target;

    let current = this.#root;
    let edges = 0;
    while (current !== null) {
      if (current.data === value) return edges;
      current = value < current.data ? current.left : current.right;
      edges += 1;
    }
    return null;
  }

  /**
   * Whether the two subtrees of every node are within one of each other.
   *
   * Every node, not just the root — a root can have equal heights on both
   * sides while one of those sides is a long thin chain.
   *
   * Done in a single pass: the recursion returns a height, or the UNBALANCED
   * flag meaning "something below here was already out of shape", which then
   * propagates straight up without measuring anything else.
   */
  isBalanced() {
    return Tree.#measure(this.#root) !== Tree.UNBALANCED;
  }

  static UNBALANCED = -2;

  static #measure(node) {
    if (node === null) return -1;

    const left = Tree.#measure(node.left);
    if (left === Tree.UNBALANCED) return Tree.UNBALANCED;

    const right = Tree.#measure(node.right);
    if (right === Tree.UNBALANCED) return Tree.UNBALANCED;

    if (Math.abs(left - right) > 1) return Tree.UNBALANCED;
    return 1 + Math.max(left, right);
  }

  /**
   * Rebuilds the tree balanced.
   *
   * inOrder already yields the values sorted, which is exactly what buildTree
   * wants — so rebalancing is a traversal and a rebuild, nothing cleverer.
   */
  rebalance() {
    const values = [];
    this.inOrder((node) => values.push(node.data));
    this.#root = Tree.buildTree(values);
    return this;
  }

  /* ------------------------------------------------------ */

  /** The values, in order. */
  toArray() {
    const values = [];
    this.inOrder((node) => values.push(node.data));
    return values;
  }

  size() {
    let count = 0;
    this.levelOrder(() => (count += 1));
    return count;
  }
}

export default Tree;
