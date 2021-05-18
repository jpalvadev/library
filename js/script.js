const transitionDuration =
  parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      '--transition-duration'
    )
  ) * 1000;

const nav = document.querySelector('.nav');

document.body.style.minHeight = window.innerHeight;

// Buttons
const addBtn = document.querySelector('.add-book-btn--add');
const okBtn = document.querySelector('.add-book-btn--ok');

// Book Form
const formContainer = document.querySelector('.form-container');
const form = document.querySelector('.form');

const formCover = document.querySelector('.form__cover-img');
const formTitle = document.getElementById('title');
const formAuthor = document.getElementById('author');
const formPages = document.getElementById('pages');
const formPagesRead = document.getElementById('pages-read');
const checkboxRead = document.querySelector('.read-checkbox');

// const header = document.querySelector('.form__heading');
const searchSpinner = document.querySelector('.search-spinner');
const formSpinner = document.querySelector('.form-spinner');

// Search Books Form
const searchBooksForm = document.querySelector('.search-books');
const searchInput = document.getElementById('input-search-title');
const searchBtn = document.querySelector('.search-btn');

const searchResultsContainer = document.querySelector('.search-results');

// Entered books Container
const booksContainer = document.querySelector('.books-container');

// BORRAR!!!!!!!!!!!

class Book {
  constructor(
    title,
    author,
    description,
    pages,
    pagesRead,
    cover,
    isbn,
    complete
  ) {
    this.title = title;
    this.author = author;
    this.description = description;
    this.pages = pages;
    this.pagesRead = pagesRead;
    this.cover = cover;
    this.isbn = isbn;
    this.complete = complete;
  }
}

class Data {
  searchResults = [];

  constructor() {}

  getBooksFromLS() {
    let books;
    if (localStorage.getItem('books') === null) {
      books = [];
    } else {
      books = JSON.parse(localStorage.getItem('books'));
    }

    return books;
  }

  addBook(book) {
    const books = this.getBooksFromLS();
    books.push(book);
    localStorage.setItem('books', JSON.stringify(books));
  }

  removeBookFromLS(isbn) {
    const books = this.getBooksFromLS().filter((book) => book.isbn !== isbn);
    localStorage.setItem('books', JSON.stringify(books));
  }

  async getBookList(keyword) {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${keyword}&maxResults=20&${API_KEY}`
    );

    this.searchResults = await response.json();

    return this.searchResults;
  }

  async getBetterImg(book) {
    let img = book.imageLinks.thumbnail;
    try {
      for (let i = 0; i < book.industryIdentifiers.length; i++) {
        const imgURL = `https://covers.openlibrary.org/b/isbn/${book.industryIdentifiers[i].identifier}-L.jpg`;
        const response = await fetch(`${imgURL}?default=false`);

        console.log(response.status);
        if (response.status === 404) {
          // console.clear(); // No way to not show 404 on console??????????
          continue;
        } else {
          img = imgURL;
          break;
        }
      }
    } catch (err) {
      console.log(err);
    }

    return img;
  }
}

class UI {
  currentBook = {};

  constructor() {}

  displayBooks() {
    const books = app.data.getBooksFromLS();

    books.forEach((book) => app.UI.addBook(book));
  }

  showBookList(bookList) {
    // console.log(bookList.items[0]);
    let divsContainer = document.createDocumentFragment();
    const imgNotFound =
      'http://books.google.com/books/content?id=CGL7DwAAQAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api';

    bookList.items.forEach((book) => {
      // If there isn't an ISBN we don't add that book
      if (!book.volumeInfo?.industryIdentifiers?.[0].identifier) return;

      searchResultsContainer.innerHTML += `
      <div class="result">
        <img class="result__img"
          src="${book.volumeInfo.imageLinks?.thumbnail || imgNotFound}"
          alt=""
        />
        <p class="result__title">${book.volumeInfo.title}</p>
        <p class="result__author">${book.volumeInfo.authors?.[0] || ''}</p>
        <p class="result__pages">${
          book.volumeInfo?.pageCount
            ? book.volumeInfo?.pageCount + ' pages'
            : ''
        }</p>
        <p class="result__isbn">ISBN: ${
          book.volumeInfo?.industryIdentifiers?.[0].identifier
        }</p>
      </div>
      `;
    });
  }

  async showSelectedBook(book) {
    // form text
    formTitle.value = book.title;
    formAuthor.value = book.authors?.[0] || '';
    formPages.value = book?.pageCount || 0;
    formPagesRead.value = 0;

    // const img = await app.data.getBetterImg(book);
    // console.log(img);
    app.UI.showElements(formSpinner);
    formCover.src = await app.data.getBetterImg(book);
    formCover.addEventListener('load', () => app.UI.hideElements(formSpinner), {
      once: true,
    });
    book.cover = formCover.src;

    console.log('UI data', book);

    this.currentBook = book;
    // app.UI.hideElements(formSpinner);
    // console.log(img);
  }

  addBook(book) {
    const pagesReadPerc = Math.floor((book.pagesRead * 100) / book.pages);

    booksContainer.innerHTML += `
    <div class="book">
      <div class="book__cover">
        <img src="${book.cover}" />
      </div>
      <div class="book__content">
        <h3 class="book__title">${book.title} - ${book.author}</h3>
        <div class="book__pages-isbn">
          <p class="book__pages"><strong>Pages:</strong><br />${book.pages}</p>
          <p class="book__isbn"><strong>ISBN:</strong><br />${book.isbn}</p>
        </div>
        <p class="book__description">${book.description}...</p>
        <div class="book__progress">
          <div class="book__progress-div">
            <div class="book__progress-bar" style="width:${pagesReadPerc}%;"></div>
          </div>
          <p class="book__progress-percent">${pagesReadPerc}%</p>
        </div>
        <div class="book__btns">
          <button class="book__delete" data-isbn="${book.isbn}">Remove</button>
          <label class="toggle">Read?
            <input class="toggle__input" name="" type="checkbox" ${
              book.complete ? 'checked' : ''
            } />
            <div class="toggle__fill"></div>
          </label>
        </div>
      </div>
    </div>     
    `;
  }

  deleteBook(e) {
    e.parentElement.parentElement.parentElement.remove();
  }

  showAlert(message, status) {
    const warning = document.querySelector('.warning');
    warning.textContent = message;
    if (status) warning.style.backgroundColor = 'var(--color-green)';
    else warning.style.backgroundColor = 'var(--color-red)';

    this.showElements(warning);
    setTimeout(() => this.hideElements(warning), 2000);
  }

  showElements(...elements) {
    elements.forEach((el) => {
      el.classList.add('visible');
    });
  }

  hideElements(...elements) {
    elements.forEach((el) => {
      el.classList.remove('visible');
    });
  }

  clearSearchResults() {
    setTimeout(() => {
      searchResultsContainer.innerHTML = '';
    }, transitionDuration);
  }

  scrollToTop() {
    nav.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }
}

class App {
  constructor(data, UI) {
    this.data = data;
    this.UI = UI;
  }

  getBooks() {
    this.UI.displayBooks();
  }

  // Get books from API based on input text field
  async getSearchResults(keyword) {
    // Show Spinner
    this.UI.showElements(searchSpinner);

    // Hide Search box

    // Get books from Google
    const bookList = await this.data.getBookList(keyword);
    console.log(bookList);

    // hide Spinner
    this.UI.hideElements(searchSpinner);

    // Show books in the UI
    this.UI.showBookList(bookList);

    this.UI.showElements(searchResultsContainer);
    this.UI.hideElements(searchBooksForm);
    document.body.classList.remove('noscroll');
  }

  getBookData(isbn) {
    // console.log(this.data.searchResults);
    // console.log(isbn);

    const book = this.data.searchResults.items.filter((book) => {
      return book.volumeInfo?.industryIdentifiers?.[0].identifier === isbn;
    });

    console.log(book);

    this.UI.showElements(formContainer, okBtn);
    this.UI.hideElements(searchResultsContainer);

    this.UI.showSelectedBook(book[0].volumeInfo);

    this.UI.clearSearchResults();

    // document.body.classList.remove('noscroll');
    this.UI.scrollToTop();
    document.body.classList.add('noscroll');
  }
}

const app = new App(new Data(), new UI());

document.addEventListener('DOMContentLoaded', app.UI.displayBooks);

// Add event listener for PLUS BUTTON
///////////////////
addBtn.addEventListener('click', function (e) {
  form.reset();

  searchInput.value = ''; // borrar search input

  formCover.src = './images/white.jpg'; // to avoid decentering of loading spinner
  e.preventDefault();
  if (!addBtn.classList.contains('transform-to-cancel')) {
    app.UI.showElements(searchBooksForm, booksContainer);
    // searchBooksForm.scrollIntoView({ block: 'end', behavior: 'smooth' });
    app.UI.scrollToTop();

    document.body.classList.add('noscroll');
    addBtn.classList.add('transform-to-cancel');
  } else {
    app.UI.hideElements(searchBooksForm, searchResultsContainer, formContainer);
    app.UI.clearSearchResults();

    document.body.classList.remove('noscroll');
    addBtn.classList.remove('transform-to-cancel');
  }
});

// Search button click event listener
searchBtn.addEventListener('click', (e) => {
  e.preventDefault();

  if (!searchInput.value) {
    app.UI.showAlert('You have to type something...', false);
    return;
  }
  searchResultsContainer.innerHTML = '';
  searchSpinner.classList.add('visible');
  app.getSearchResults(searchInput.value);
});

// Add event listener for targeting individual book using event delegation
searchResultsContainer.addEventListener('click', (e) => {
  // console.log(e.target);
  if (!e.target.closest('div').classList.contains('result')) return;
  // console.log("si");

  // app.getBook();
  console.log(app.data.searchResults);
  // const bookId = e.target.closest("div").id;
  const targetISBN = e.target
    .closest('div')
    .querySelector('.result__isbn')
    .textContent.slice(6);

  app.getBookData(targetISBN);
});

okBtn.addEventListener('click', () => {
  // Create a book object
  const title = formTitle.value;
  const author = formAuthor.value;
  const description =
    app.UI.currentBook?.description?.slice(0, 200) || 'No description';
  const pages = formPages.value;
  const pagesRead = formPagesRead.value;
  const cover = app.UI.currentBook.cover;
  const isbn = app.UI.currentBook.industryIdentifiers[0].identifier;
  const complete = checkboxRead.checked;
  const book = new Book(
    title,
    author,
    description,
    pages,
    pagesRead,
    cover,
    isbn,
    complete
  );

  if (pagesRead > pages) {
    app.UI.showAlert(
      'You cannot read more pages than there are in the book... dah!',
      false
    );
    return;
  }

  document.body.classList.remove('noscroll');

  app.UI.addBook(book);
  app.data.addBook(book);

  app.UI.hideElements(formContainer, okBtn);

  addBtn.classList.remove('transform-to-cancel');
});

booksContainer.addEventListener('click', (e) => {
  console.log(e.target);

  if (!e.target.classList.contains('book__delete')) return;
  // Remove book from UI

  app.UI.deleteBook(e.target);

  // Remove book from LS
  app.data.removeBookFromLS(e.target.dataset.isbn);
});

///////////////////////////////////
///////////////////////////////////
///////////////////////////////////
/*


// UI Class: Handle UI Tasks
class UI {
  static displayBooks() {
    const books = Store.getBooks();

    books.forEach((book) => UI.addBookToList(book));
  }

  static addBookToList(book) {
    const list = document.querySelector('#book-list');

    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.isbn}</td>
      <td><a href="#" class="btn btn-danger btn-sm delete">X</a></td>
    `;

    list.appendChild(row);
  }

  static deleteBook(el) {
    if(el.classList.contains('delete')) {
      el.parentElement.parentElement.remove();
    }
  }

  static showAlert(message, className) {
    const div = document.createElement('div');
    div.className = `alert alert-${className}`;
    div.appendChild(document.createTextNode(message));
    const container = document.querySelector('.container');
    const form = document.querySelector('#book-form');
    container.insertBefore(div, form);

    // Vanish in 3 seconds
    setTimeout(() => document.querySelector('.alert').remove(), 3000);
  }

  static clearFields() {
    document.querySelector('#title').value = '';
    document.querySelector('#author').value = '';
    document.querySelector('#isbn').value = '';
  }
}

// Store Class: Handles Storage
class Store {
  static getBooks() {
    let books;
    if(localStorage.getItem('books') === null) {
      books = [];
    } else {
      books = JSON.parse(localStorage.getItem('books'));
    }

    return books;
  }

  static addBook(book) {
    const books = Store.getBooks();
    books.push(book);
    localStorage.setItem('books', JSON.stringify(books));
  }

  static removeBook(isbn) {
    const books = Store.getBooks();

    books.forEach((book, index) => {
      if(book.isbn === isbn) {
        books.splice(index, 1);
      }
    });

    localStorage.setItem('books', JSON.stringify(books));
  }
}

// Event: Display Books
document.addEventListener('DOMContentLoaded', UI.displayBooks);

// Event: Add a Book
document.querySelector('#book-form').addEventListener('submit', (e) => {
  // Prevent actual submit
  e.preventDefault();

  // Get form values
  const title = document.querySelector('#title').value;
  const author = document.querySelector('#author').value;
  const isbn = document.querySelector('#isbn').value;

  // Validate
  if(title === '' || author === '' || isbn === '') {
    UI.showAlert('Please fill in all fields', 'danger');
  } else {
    // Instatiate book
    const book = new Book(title, author, isbn);

    // Add Book to UI
    UI.addBookToList(book);

    // Add book to store
    Store.addBook(book);

    // Show success message
    UI.showAlert('Book Added', 'success');

    // Clear fields
    UI.clearFields();
  }
});

// Event: Remove a Book
document.querySelector('#book-list').addEventListener('click', (e) => {
  // Remove book from UI
  UI.deleteBook(e.target);

  // Remove book from store
  Store.removeBook(e.target.parentElement.previousElementSibling.textContent);

  // Show success message
  UI.showAlert('Book Removed', 'success');
});

*/
