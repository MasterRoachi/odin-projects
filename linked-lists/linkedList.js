/* =========================================================
   A singly linked list.

   A chain of nodes, each holding a value and a pointer to the
   next one. The list itself only knows where the chain starts
   — to reach the tenth node you walk through nine others.

   That is the whole trade. Inserting into the middle is cheap
   because only two pointers change; *finding* the middle is
   expensive because there is no way to jump.
   ========================================================= */

export class Node {
  constructor(value = null, nextNode = null) {
    this.value = value;
    this.nextNode = nextNode;
  }
}

export class LinkedList {
  #head = null;

  // A tail pointer is not required by the brief, but without one every
  // append walks the entire list to find the end — O(n) per append, so
  // building a list of n items costs O(n²). Keeping the end in hand makes
  // append O(1). The cost is remembering to update it everywhere.
  #tail = null;

  // Likewise: counting nodes on demand would make size() O(n). Tracking it
  // as the list changes makes it O(1).
  #size = 0;

  /* ------------------------------------------------------ */

  append(value) {
    const node = new Node(value);

    if (this.#head === null) {
      this.#head = node;
      this.#tail = node;
    } else {
      this.#tail.nextNode = node;
      this.#tail = node;
    }

    this.#size += 1;
    return this;
  }

  prepend(value) {
    const node = new Node(value, this.#head);

    this.#head = node;
    if (this.#tail === null) this.#tail = node;

    this.#size += 1;
    return this;
  }

  size() {
    return this.#size;
  }

  head() {
    return this.#head === null ? undefined : this.#head.value;
  }

  tail() {
    return this.#tail === null ? undefined : this.#tail.value;
  }

  at(index) {
    const node = this.#nodeAt(index);
    return node === null ? undefined : node.value;
  }

  /** The brief defines pop as removing the *head*, not the tail. */
  pop() {
    if (this.#head === null) return undefined;

    const { value } = this.#head;
    this.#head = this.#head.nextNode;
    if (this.#head === null) this.#tail = null;

    this.#size -= 1;
    return value;
  }

  contains(value) {
    return this.findIndex(value) !== -1;
  }

  /** The index of the first node holding this value, or -1. */
  findIndex(value) {
    let current = this.#head;
    let index = 0;

    while (current !== null) {
      if (current.value === value) return index;
      current = current.nextNode;
      index += 1;
    }

    return -1;
  }

  toString() {
    if (this.#head === null) return "";

    const parts = [];
    let current = this.#head;

    while (current !== null) {
      parts.push(`( ${current.value} )`);
      current = current.nextNode;
    }

    return `${parts.join(" -> ")} -> null`;
  }

  /* ---------------- extra credit ------------------------ */

  /**
   * Inserts nodes for each value at `index`.
   *
   * Inserting at `size` is allowed — that is appending. Anything beyond it
   * is not, because there would be nothing to link the new nodes onto.
   */
  insertAt(index, ...values) {
    if (!Number.isInteger(index) || index < 0 || index > this.#size) {
      throw new RangeError(`insertAt: index ${index} is out of bounds`);
    }
    if (values.length === 0) return this;

    // build the new run as its own little chain first, then splice the
    // whole thing in with two pointer changes
    const chainHead = new Node(values[0]);
    let chainTail = chainHead;
    for (let i = 1; i < values.length; i++) {
      chainTail.nextNode = new Node(values[i]);
      chainTail = chainTail.nextNode;
    }

    if (index === 0) {
      chainTail.nextNode = this.#head;
      this.#head = chainHead;
      if (this.#tail === null) this.#tail = chainTail;
    } else {
      const before = this.#nodeAt(index - 1);
      chainTail.nextNode = before.nextNode;
      before.nextNode = chainHead;
      if (before === this.#tail) this.#tail = chainTail;
    }

    this.#size += values.length;
    return this;
  }

  /** Removes the node at `index` and returns its value. */
  removeAt(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.#size) {
      throw new RangeError(`removeAt: index ${index} is out of bounds`);
    }

    if (index === 0) return this.pop();

    const before = this.#nodeAt(index - 1);
    const removed = before.nextNode;

    before.nextNode = removed.nextNode;
    if (removed === this.#tail) this.#tail = before;

    this.#size -= 1;
    return removed.value;
  }

  /* ------------------------------------------------------ */

  /** Walks to a node, or null if the index is not in the list. */
  #nodeAt(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.#size) return null;

    let current = this.#head;
    for (let i = 0; i < index; i++) current = current.nextNode;
    return current;
  }
}

export default LinkedList;
