const myLibrary = [];
const dialog = document.querySelector("#dialog");

function Book(title, author, genre, description, pages, read = false, cover) {
  this.id = crypto.randomUUID();
  this.title = title.trim();
  this.author = author.trim();
  this.genre = genre;
  this.pages = pages;
  this.description = description;
  this.read = read;
  this.cover = `url(${cover})`;
}

Book.prototype.toggleRead = function () {
  this.read = !this.read;
  populateLibrary();
};

Book.prototype.delete = function () {
  const index = myLibrary.findIndex((book) => book.id === this.id);

  if (index > -1) {
    myLibrary.splice(index, 1);
  }

  populateLibrary();
};

function addBookToLibrary(
  title,
  author,
  genre,
  description,
  pages,
  read,
  cover,
) {
  const book = new Book(title, author, genre, description, pages, read, cover);
  myLibrary.push(book);
}

function populateLibrary() {
  const bookshelf = document.querySelector("#bookshelf");
  bookshelf.replaceChildren();

  myLibrary.forEach((book) => {
    const newBook = document.createElement("div");
    newBook.classList.add("book");
    newBook.style.backgroundImage = book.cover;

    const bookTitle = document.createElement("h2");
    bookTitle.textContent = `${book.title}`;

    const bookAuthor = document.createElement("p");
    bookAuthor.textContent = `${book.author}`;

    const bookGenre = document.createElement("h3");
    bookGenre.textContent = `${book.genre}`;

    const bookDescription = document.createElement("p");
    bookDescription.textContent = `${book.description}`;

    const bookRead = document.createElement("button");
    bookRead.textContent = book.read ? "Mark as unread" : "Mark as read";
    bookRead.type = "button";
    bookRead.classList.add("read-button");
    bookRead.addEventListener("click", () => {
      book.toggleRead();
    });

    const bookPages = document.createElement("p");
    bookPages.textContent = `${book.pages}`;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Remove from Library";
    deleteButton.type = "button";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => {
      book.delete();
    });

    newBook.append(
      bookTitle,
      bookAuthor,
      bookGenre,
      bookDescription,
      bookPages,
      bookRead,
      deleteButton,
    );
    bookshelf.appendChild(newBook);
  });
}

const newBookButton = document.querySelector("#new-book");
newBookButton.addEventListener("click", () => {
  dialog.showModal();
});

const form = document.querySelector("#form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const titleInput = document.querySelector("#title");
  const authorInput = document.querySelector("#author");
  const genreInput = document.querySelector("#genre");
  const descriptionInput = document.querySelector("#description");
  const readInput = document.querySelector("#read");
  const pagesInput = document.querySelector("#pages");
  const bookCover = document.querySelector("#cover");
  addBookToLibrary(
    titleInput.value,
    authorInput.value,
    genreInput.value,
    descriptionInput.value,
    Number(pagesInput.value),
    readInput.checked,
    bookCover.value,
  );
  form.reset();
  populateLibrary();
  dialog.close();
});
