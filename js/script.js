const transitionDuration =
  parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      '--transition-duration'
    )
  ) * 1000;

const nav = document.querySelector('.nav');

const overlay = document.querySelector('.overlay');

let appHeight = '';
// document.body.style.minHeight = window.innerHeight;
// document.body.style.height = window.innerHeight;

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

const inputFields = [
  formTitle,
  formAuthor,
  formPages,
  formPagesRead,
  searchInput,
];

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
    this.pagesReadPerc = Math.floor((this.pagesRead * 100) / this.pages);
    // this.pagesReadPerc = this.complete
    //   ? 100
    //   : Math.floor((this.pagesRead * 100) / this.pages);
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

  updateReadStatusOnLS(isbn) {
    const books = this.getBooksFromLS();

    const index = books.findIndex((book) => book.isbn === isbn);
    // console.log(books[index]);
    // console.log(books[index].complete);

    books[index].complete = !books[index].complete;
    // console.log(books[index].complete);
    localStorage.setItem('books', JSON.stringify(books));

    return books[index];
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
    formPages.value = book?.pageCount || '';
    formPagesRead.value = '';

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
    // const pagesReadPerc = book.complete
    //   ? 100
    //   : Math.floor((book.pagesRead * 100) / book.pages);

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
            <div class="book__progress-bar" style="width:${
              book.complete ? 100 : book.pagesReadPerc
            }%;"></div>
          </div>
          <p class="book__progress-percent">${
            book.complete ? 100 : book.pagesReadPerc
          }%</p>
        </div>
        <div class="book__btns">
          <button class="book__delete" data-isbn="${book.isbn}">Remove</button>
          <label class="toggle">
          <p>Read?</p>
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

  updateReadStatus(target, book) {
    const progressBar =
      target.parentElement.parentElement.parentElement.querySelector(
        '.book__progress-bar'
      );

    const progressText =
      target.parentElement.parentElement.parentElement.querySelector(
        '.book__progress-percent'
      );

    const checkbox = target.parentElement.querySelector('input');
    console.log(checkbox.checked);

    console.log(book);

    console.log(progressBar);

    if (book.complete) {
      progressBar.style.width = '100%';
      progressText.textContent = '100%';
    } else {
      progressBar.style.width = `${book.pagesReadPerc}%`;
      progressText.textContent = `${book.pagesReadPerc}%`;
    }
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
    // document.body.classList.add('noscroll');
    const formHeight = formContainer.offsetHeight;
    console.log(formHeight);
    formContainer.style.height = `${formHeight}px`;
    document.body.style.minHeight = `${formHeight}px`;
    document.body.classList.add('noscroll');

    // setTimeout(() => {
    //   let rect = formContainer.getBoundingClientRect();
    //   console.log(rect.top, rect.right, rect.bottom, rect.left);
    //   addBtn.style.position = 'absolute';
    //   addBtn.style.top = `${rect.bottom}px`;
    // }, transitionDuration);
  }

  updateReadStatus(target, isbn) {
    // Update Read status on LS
    const book = app.data.updateReadStatusOnLS(isbn);

    // Update Read status on UI
    app.UI.updateReadStatus(target, book);
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
    app.UI.showElements(searchBooksForm, booksContainer, overlay);
    // searchBooksForm.scrollIntoView({ block: 'end', behavior: 'smooth' });
    app.UI.scrollToTop();

    document.body.classList.add('noscroll');
    addBtn.classList.add('transform-to-cancel');
  } else {
    app.UI.hideElements(
      searchBooksForm,
      searchResultsContainer,
      formContainer,
      okBtn,
      overlay
    );
    app.UI.clearSearchResults();

    document.body.classList.remove('noscroll');
    addBtn.classList.remove('transform-to-cancel');
  }
});

// Search button click event listener
searchBtn.addEventListener('click', (e) => {
  e.preventDefault();

  appHeight = `${window.innerHeight}px`;

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
  const pages = Number(formPages.value);
  const pagesRead = Number(formPagesRead.value);
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
    // console.log(Number(pagesRead), pages);

    app.UI.showAlert(
      'You cannot read more pages than there are in the book... dah!',
      false
    );
    return;
  }

  document.body.classList.remove('noscroll');

  app.UI.addBook(book);
  app.data.addBook(book);

  app.UI.hideElements(formContainer, okBtn, overlay);

  addBtn.classList.remove('transform-to-cancel');
});

// Using mouseup to prevent the event from firing twice
booksContainer.addEventListener('mouseup', (e) => {
  // console.log(e.target);

  if (e.target.closest('label')?.classList.contains('toggle')) {
    // e.stopPropagation();
    const isbn = e.target.parentElement.previousElementSibling.dataset.isbn;

    app.updateReadStatus(e.target, isbn);
  }
  // e.preventDefault();

  if (e.target.classList.contains('book__delete')) {
    // Remove book from UI

    app.UI.deleteBook(e.target);

    // Remove book from LS
    app.data.removeBookFromLS(e.target.dataset.isbn);
  }
});
