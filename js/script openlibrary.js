const addBtn = document.querySelector('.add-book-btn--add');
const okBtn = document.querySelector('.add-book-btn--ok');
const form = document.querySelector('.form');
const formContainer = document.querySelector('.form-container');
let windowWidth = window.innerWidth;
const header = document.querySelector('.form__heading');
const searchBooks = document.querySelector('.search-books');
const spinner = document.querySelector('.spinner');
const booksDiv = document.querySelector('.book-list');
const input = document.querySelector('.input-text');
const searchBtn = document.querySelector('.btn');

// HIDE AND SHOW ELEMENTS (adds and removes 'visible' class)
//////////////////
const showElements = (...elements) => {
  elements.forEach((el) => {
    el.classList.add('visible');
  });
};
const hideElements = (...elements) => {
  elements.forEach((el) => {
    el.classList.remove('visible');
  });
};

// Add event listener for add a book button is clicked
///////////////////
addBtn.addEventListener('click', function (e) {
  form.reset();

  if (addBtn.classList.contains('transform-to-cancel')) {
    // addBtn.style.position = 'fixed';
    // form.classList.remove('visible');
    searchBooks.classList.remove('visible');
    // searchBooks.style.transform = `translateX(-${windowWidth}px)`;
    addBtn.classList.remove('transform-to-cancel');
    // formContainer.style.transform = `translateX(-${windowWidth}px)`;
  } else {
    // addBtn.style.position = 'absolute';
    // form.style.height = `${window.innerHeight}px`;

    // form.classList.add('visible');
    searchBooks.classList.add('visible');
    // searchBooks.style.transform = 'translateX(0)';
    addBtn.classList.add('transform-to-cancel');
    // formContainer.style.transform = 'translateX(0)';
  }
});

////////////////////////
////////////////////////
// Book Class
class Book {
  constructor(title, author, description, pages, cover, isbn) {
    this.title = title;
    this.author = author;
    this.description = description;
    this.pages = pages;
    this.cover = cover;
    this.isbn = isbn;
  }
}

///////////////////////////////////////////////////////////////
// Shows book info when clicked on a book from the list of results
async function showBookInfo(bookId) {
  const response = await fetch(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${bookId}&jscmd=details&format=json`
  );
  const data = await response.json();
  console.log(data);

  // Create variables for book object
  const title = data[`ISBN:${bookId}`].details.title;
  const author =
    data[`ISBN:${bookId}`].details?.authors?.[0].name || 'No author';
  const description =
    data[`ISBN:${bookId}`].details?.description?.value || 'No Description';
  const pages = data[`ISBN:${bookId}`].details?.number_of_pages || 0;
  const cover = data[`ISBN:${bookId}`].thumbnail_url?.slice(0, -5) + 'L.jpg';
  const isbn = data[`ISBN:${bookId}`].details.isbn_10[0];

  // Create book object
  const book = new Book(title, author, description, pages, cover, isbn);
  console.log(book);
}

booksDiv.addEventListener('click', (e) => {
  if (!e.target.closest('div').classList.contains('book')) return;

  const bookId = e.target.closest('div').id;
  showBookInfo(bookId);
});

// Search button click event listener
searchBtn.addEventListener('click', (e) => {
  e.preventDefault();
  booksDiv.innerHTML = '';
  spinner.classList.add('visible');
  getBooks(input.value);
});

class UI {
  constructor() {}

  showBookList = (bookList) => {
    // console.log(bookList);
    let imgsLoaded = 0;
    const forLength = bookList.docs.length <= 20 ? bookList.docs.length : 20;
    const booksContainer = document.createDocumentFragment();

    for (let i = 0; i < forLength; i++) {
      const img = document.createElement('img');
      img.src =
        `https://covers.openlibrary.org/b/isbn/${bookList.docs[i].isbn?.[0]}-M.jpg` ||
        '';

      const checkImgIsValid = (e) => {
        const isLoadedOk = img.complete && img.naturalHeight !== 1;
        imgsLoaded++;

        if (!isLoadedOk) return;

        img.classList.add('book__cover');
        const p = document.createElement('p');
        p.classList.add('book__title');
        const div = document.createElement('div');

        p.textContent = `${bookList.docs[i].title} - ${
          bookList.docs[i].author_name?.[0] || ''
        }`;

        div.classList.add('book');
        div.id = bookList.docs[i].isbn[0];
        div.append(p, img);
        booksContainer.appendChild(div);

        if (imgsLoaded === forLength) {
          booksDiv.innerHTML = '';
          booksDiv.appendChild(booksContainer);
          booksDiv.classList.add('visible');
          // booksDiv.style.transform = 'scale(1)';
        }
      };

      img.addEventListener('load', checkImgIsValid, { once: true });
    }
  };
}

// Get books from API based on input text field
async function getBooks(keyword) {
  const response = await fetch(
    `https://openlibrary.org/search.json?q="${keyword}"`
  );
  const bookList = await response.json();

  app.UI.showBookList(bookList);
}

class Data {
  constructor() {}
}

class App {
  constructor(data, UI) {
    this.data = data;
    this.UI = UI;
  }
}

const app = new App(new Data(), new UI());

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
