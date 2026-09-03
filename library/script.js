/* =========================================================
   The Ark
   Odin Project, JavaScript — Library

   Sections: the Book type, storage, shelf rendering, the
   pulled-out book, adding, and wiring.

   The assignment's shape is kept exactly: a myLibrary array,
   a Book constructor, a separate addBookToLibrary(), ids from
   crypto.randomUUID(), and read status toggled by a method on
   Book.prototype.
   ========================================================= */

const myLibrary = [];

/* ---------------------------------------------------------
   1. The Book type
   --------------------------------------------------------- */

function Book(title, author, pages, status = "unread", extra = {}) {
  this.id = crypto.randomUUID();
  this.title = String(title).trim();
  this.author = String(author).trim();
  this.pages = Math.max(1, Math.round(Number(pages) || 1));
  this.status = status; // "unread" | "reading" | "read"
  this.currentPage = status === "read" ? this.pages : Number(extra.currentPage) || 0;
  this.cover = extra.cover || "";
  this.year = extra.year ? Number(extra.year) : null;
  this.added = Date.now();
}

/** The assignment asks for this specifically: a prototype method. */
Book.prototype.toggleRead = function toggleRead() {
  if (this.status === "read") {
    this.status = "unread";
    this.currentPage = 0;
  } else {
    this.status = "read";
    this.currentPage = this.pages;
  }
  return this.status;
};

/** Moves a bookmark, and lets the status follow from where it lands. */
Book.prototype.setPage = function setPage(page) {
  const target = Math.max(0, Math.min(this.pages, Math.round(Number(page) || 0)));
  this.currentPage = target;
  this.status = target >= this.pages ? "read" : target > 0 ? "reading" : "unread";
  return this.status;
};

Book.prototype.percent = function percent() {
  return Math.round((this.currentPage / this.pages) * 100);
};

/**
 * JSON keeps the data and throws away the prototype, so a book read back
 * from storage is a plain object with no methods on it. Re-seating it on
 * Book.prototype gives toggleRead and friends back without minting a new id.
 */
Book.revive = function revive(plain) {
  const book = Object.create(Book.prototype);
  Object.assign(book, plain);
  return book;
};

function addBookToLibrary(title, author, pages, status, extra) {
  const book = new Book(title, author, pages, status, extra);
  myLibrary.push(book);
  save();
  return book;
}

function removeBook(id) {
  const index = myLibrary.findIndex((book) => book.id === id);
  if (index === -1) return;
  myLibrary.splice(index, 1);
  save();
}

const findBook = (id) => myLibrary.find((book) => book.id === id);

/* ---------------------------------------------------------
   2. Storage
   --------------------------------------------------------- */

const STORAGE_KEY = "the-ark";

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(myLibrary));
  } catch {
    /* private mode or a full quota — the shelf still works for this session */
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored) || stored.length === 0) return false;
    stored.forEach((plain) => myLibrary.push(Book.revive(plain)));
    return true;
  } catch {
    return false;
  }
}

const SEED = [
  ["Piranesi", "Susanna Clarke", 272, "read", { year: 2020, cover: "10226290" }],
  ["The Overstory", "Richard Powers", 502, "reading", { year: 2018, currentPage: 241 }],
  ["Pale Fire", "Vladimir Nabokov", 246, "unread", { year: 1962 }],
  ["The Left Hand of Darkness", "Ursula K. Le Guin", 304, "read", { year: 1969 }],
  ["Gödel, Escher, Bach", "Douglas Hofstadter", 777, "unread", { year: 1979 }],
  ["Invisible Cities", "Italo Calvino", 165, "read", { year: 1972 }],
  ["The Peregrine", "J. A. Baker", 191, "unread", { year: 1967 }],
  ["A Wizard of Earthsea", "Ursula K. Le Guin", 183, "read", { year: 1968 }],
  ["Riddley Walker", "Russell Hoban", 235, "unread", { year: 1980 }],
];

function seed() {
  SEED.forEach(([title, author, pages, status, extra]) => {
    const cover = extra.cover ? coverUrl(extra.cover) : "";
    addBookToLibrary(title, author, pages, status, { ...extra, cover });
  });
}

/* ---------------------------------------------------------
   3. Shelf rendering
   --------------------------------------------------------- */

const els = {
  spines: document.querySelector("#spines"),
  empty: document.querySelector("#empty"),
  tally: document.querySelector("#tally"),
  search: document.querySelector("#search"),
  sort: document.querySelector("#sort"),
  filter: document.querySelector("#filter"),
  newBook: document.querySelector("#new-book"),
};

// muted binding cloths, picked from the title so a book always looks the same
const CLOTH = [
  "#7c2f2a",
  "#2f4a3a",
  "#29405e",
  "#7a5a1e",
  "#4a2f52",
  "#5c5347",
  "#8a4a22",
  "#35545c",
  "#63304a",
  "#3f4a2b",
];

function hashOf(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function visibleBooks() {
  const term = els.search.value.trim().toLowerCase();
  const mode = els.filter.value;

  let list = myLibrary.filter((book) => {
    if (mode !== "all" && book.status !== mode) return false;
    if (!term) return true;
    return (
      book.title.toLowerCase().includes(term) || book.author.toLowerCase().includes(term)
    );
  });

  const by = els.sort.value;
  list = [...list].sort((a, b) => {
    if (by === "title") return a.title.localeCompare(b.title);
    if (by === "author") return a.author.localeCompare(b.author);
    if (by === "pages") return b.pages - a.pages;
    return b.added - a.added;
  });

  return list;
}

function spineFor(book) {
  const seedValue = hashOf(book.title + book.author);

  const slot = document.createElement("div");
  slot.className = "slot";

  const spine = document.createElement("button");
  spine.type = "button";
  spine.className = "spine";
  spine.dataset.id = book.id;
  spine.classList.toggle("is-read", book.status === "read");
  spine.classList.toggle("is-reading", book.status === "reading");

  // a fat book is a wide spine, and every book stands a slightly different height
  const width = Math.round(Math.min(68, Math.max(26, 22 + book.pages * 0.075)));
  spine.style.setProperty("--w", `${width}px`);

  const height = 178 + (seedValue % 58);
  spine.style.setProperty("--h", `${height}px`);
  spine.style.setProperty("--cloth", CLOTH[seedValue % CLOTH.length]);

  // A long title on a short spine has to be set smaller, exactly as a real
  // binder would. Roughly 0.72em of vertical advance per character, against
  // the height left once the bands, padding and author line are taken out.
  const room = height - 78;
  const fitted = room / Math.max(1, book.title.length * 0.72);
  spine.style.setProperty("--title-size", `${Math.min(11.5, Math.max(8, fitted))}px`);

  spine.setAttribute(
    "aria-label",
    `${book.title} by ${book.author}, ${book.pages} pages, ${statusWord(book)}`
  );

  const ribbon = document.createElement("span");
  ribbon.className = "ribbon";

  const topBand = document.createElement("span");
  topBand.className = "band";

  const text = document.createElement("span");
  text.className = "spine-text";

  const title = document.createElement("span");
  title.className = "spine-title";
  title.textContent = book.title;

  const author = document.createElement("span");
  author.className = "spine-author";
  author.textContent = book.author;

  text.append(title, author);

  const bottomBand = document.createElement("span");
  bottomBand.className = "band";

  const pip = document.createElement("span");
  pip.className = "pip";

  spine.append(ribbon, topBand, text, bottomBand, pip);
  slot.append(spine);
  return slot;
}

function statusWord(book) {
  if (book.status === "read") return "read";
  if (book.status === "reading") return `on page ${book.currentPage} of ${book.pages}`;
  return "unread";
}

function render() {
  const list = visibleBooks();

  els.spines.replaceChildren();
  list.forEach((book) => els.spines.append(spineFor(book)));

  els.empty.hidden = list.length > 0;

  const reading = myLibrary.filter((b) => b.status === "reading").length;
  const read = myLibrary.filter((b) => b.status === "read").length;
  const shown = list.length === myLibrary.length ? `${myLibrary.length}` : `${list.length} of ${myLibrary.length}`;
  els.tally.textContent = `${shown} volumes · ${read} read · ${reading} in progress`;
}

/* ---------------------------------------------------------
   4. The pulled-out book
   --------------------------------------------------------- */

const sheet = {
  dialog: document.querySelector("#book-sheet"),
  cover: document.querySelector("#sheet-cover"),
  kicker: document.querySelector("#sheet-kicker"),
  title: document.querySelector("#sheet-title"),
  author: document.querySelector("#sheet-author"),
  blurb: document.querySelector("#sheet-blurb"),
  page: document.querySelector("#sheet-page"),
  of: document.querySelector("#sheet-of"),
  bar: document.querySelector("#sheet-bar"),
  percent: document.querySelector("#sheet-percent"),
  toggle: document.querySelector("#sheet-toggle"),
  remove: document.querySelector("#sheet-remove"),
};

let openId = null;

/**
 * A background-image has no error event, so the URL is loaded through a
 * probe first. A cover that never arrives leaves the title showing rather
 * than an empty rectangle.
 */
function paintCover(book) {
  sheet.cover.style.backgroundImage = "none";
  sheet.cover.textContent = book.title;
  if (!book.cover) return;

  const probe = new Image();
  probe.addEventListener("load", () => {
    if (openId !== book.id) return; // a different book was opened meanwhile
    sheet.cover.style.backgroundImage = `url("${book.cover}")`;
    sheet.cover.textContent = "";
  });
  probe.src = book.cover;
}

function paintSheet(book) {
  paintCover(book);

  sheet.kicker.textContent =
    book.status === "read" ? "Read" : book.status === "reading" ? "Currently reading" : "Unread";
  sheet.title.textContent = book.title;
  sheet.author.textContent = book.year ? `${book.author} · ${book.year}` : book.author;
  sheet.blurb.textContent = `${book.pages} pages.`;

  sheet.page.max = book.pages;
  sheet.page.value = book.currentPage;
  sheet.of.textContent = `of ${book.pages}`;
  sheet.bar.style.width = `${book.percent()}%`;
  sheet.percent.textContent = `${book.percent()}% through`;

  sheet.toggle.textContent = book.status === "read" ? "Mark unread" : "Mark read";
}

function openBook(id) {
  const book = findBook(id);
  if (!book) return;
  openId = id;
  paintSheet(book);
  sheet.dialog.showModal();
}

els.spines.addEventListener("click", (event) => {
  const spine = event.target.closest(".spine");
  if (spine) openBook(spine.dataset.id);
});

sheet.page.addEventListener("input", () => {
  const book = findBook(openId);
  if (!book) return;
  book.setPage(sheet.page.value);
  save();
  paintSheet(book);
  render();
});

sheet.toggle.addEventListener("click", () => {
  const book = findBook(openId);
  if (!book) return;
  book.toggleRead();
  save();
  paintSheet(book);
  render();
});

sheet.remove.addEventListener("click", () => {
  removeBook(openId);
  openId = null;
  sheet.dialog.close();
  render();
});

/* ---------------------------------------------------------
   5. Adding a book, with a hand from Open Library
   --------------------------------------------------------- */

const add = {
  dialog: document.querySelector("#add-sheet"),
  form: document.querySelector("#add-form"),
  title: document.querySelector("#f-title"),
  author: document.querySelector("#f-author"),
  pages: document.querySelector("#f-pages"),
  year: document.querySelector("#f-year"),
  cover: document.querySelector("#f-cover"),
  status: document.querySelector("#f-status"),
  error: document.querySelector("#form-error"),
  lookupInput: document.querySelector("#lookup-input"),
  lookupGo: document.querySelector("#lookup-go"),
  lookupStatus: document.querySelector("#lookup-status"),
  results: document.querySelector("#lookup-results"),
};

const coverUrl = (id, size = "M") => `https://covers.openlibrary.org/b/id/${id}-${size}.jpg`;

async function lookup(query) {
  const url =
    "https://openlibrary.org/search.json?q=" +
    encodeURIComponent(query) +
    "&limit=6&fields=title,author_name,number_of_pages_median,cover_i,first_publish_year";

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Open Library replied ${response.status}`);
  const data = await response.json();
  return data.docs ?? [];
}

function showResults(docs) {
  add.results.replaceChildren();

  docs.forEach((doc) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";

    const thumb = document.createElement("img");
    thumb.alt = "";
    thumb.loading = "lazy";
    if (doc.cover_i) thumb.src = coverUrl(doc.cover_i, "S");

    const wrap = document.createElement("span");

    const title = document.createElement("span");
    title.className = "r-title";
    title.textContent = doc.title;

    const meta = document.createElement("span");
    meta.className = "r-meta";
    meta.textContent = [
      doc.author_name?.[0],
      doc.first_publish_year,
      doc.number_of_pages_median ? `${doc.number_of_pages_median} pp` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    wrap.append(title, document.createElement("br"), meta);
    button.append(thumb, wrap);

    button.addEventListener("click", () => {
      add.title.value = doc.title ?? "";
      add.author.value = doc.author_name?.[0] ?? "";
      add.pages.value = doc.number_of_pages_median ?? "";
      add.year.value = doc.first_publish_year ?? "";
      add.cover.value = doc.cover_i ? coverUrl(doc.cover_i, "L") : "";
      add.lookupStatus.textContent = `Filled in from “${doc.title}”. Adjust anything below.`;
      add.results.replaceChildren();
      add.title.focus();
    });

    item.append(button);
    add.results.append(item);
  });
}

async function runLookup() {
  const query = add.lookupInput.value.trim();
  if (!query) return;

  add.results.replaceChildren();
  add.lookupStatus.textContent = "Searching Open Library…";

  try {
    const docs = await lookup(query);
    if (docs.length === 0) {
      add.lookupStatus.textContent = "Nothing found. Fill it in below instead.";
      return;
    }
    add.lookupStatus.textContent = `${docs.length} matches. Pick one:`;
    showResults(docs);
  } catch (error) {
    // the shelf must still work with the network on fire
    add.lookupStatus.textContent = "Could not reach Open Library. Fill it in below instead.";
  }
}

add.lookupGo.addEventListener("click", runLookup);

add.lookupInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    runLookup();
  }
});

els.newBook.addEventListener("click", () => {
  add.form.reset();
  add.error.textContent = "";
  add.lookupStatus.textContent = "";
  add.results.replaceChildren();
  add.lookupInput.value = "";
  add.dialog.showModal();
  add.lookupInput.focus();
});

add.form.addEventListener("submit", (event) => {
  // without this the form tries to send itself to a server and the page reloads
  event.preventDefault();

  const title = add.title.value.trim();
  const author = add.author.value.trim();
  const pages = Number(add.pages.value);

  if (!title || !author) {
    add.error.textContent = "A book needs a title and an author.";
    return;
  }
  if (!Number.isFinite(pages) || pages < 1) {
    add.error.textContent = "How many pages?";
    return;
  }

  addBookToLibrary(title, author, pages, add.status.value, {
    cover: add.cover.value.trim(),
    year: add.year.value,
  });

  add.dialog.close();
  els.search.value = "";
  els.filter.value = "all";
  render();
});

/* ---------------------------------------------------------
   6. Wiring
   --------------------------------------------------------- */

[els.search, els.sort, els.filter].forEach((control) => {
  control.addEventListener("input", render);
});

if (!load()) seed();
render();
