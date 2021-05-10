const addBtn = document.querySelector('.add-book-btn--add');
const okBtn = document.querySelector('.add-book-btn--ok');
const form = document.querySelector('.form');
const formContainer = document.querySelector('.form-container');
let windowWidth = window.innerWidth;

// formContainer.style.transform = `translateX(-${windowWidth}px)`;
// document.body.style.height = `${window.innerHeight}px`;

const header = document.querySelector('.form__heading');
const searchBooks = document.querySelector('.search-books');

const spinner = document.querySelector('.spinner');

// searchBooks.style.transform = `translateX(-${windowWidth}px)`;

// document.body.style.minHeight = `${window.innerHeight}px`;

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

///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

const booksDiv = document.querySelector('.book-list');
const input = document.querySelector('.input-text');
const searchBtn = document.querySelector('.btn');

// const showBook = (bookId) => {
//   const img = document.createElement('img');
//   img.src = `https://covers.openlibrary.org/b/isbn/${bookId}-L.jpg`;
// };

async function showBookInfo(bookId) {
  const response = await fetch(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${bookId}&jscmd=details&format=json`
  );
  const data = await response.json();
  console.log(data);

  const bookInfo = {
    title: data[`ISBN:${bookId}`].details.title,
    author: data[`ISBN:${bookId}`].details?.authors?.[0].name || 'No author',
    description:
      data[`ISBN:${bookId}`].details?.description?.value || 'No Description',
    pages: data[`ISBN:${bookId}`].details?.number_of_pages || 0,
    cover: data[`ISBN:${bookId}`].thumbnail_url?.slice(0, -5) + 'L.jpg',
    isbn: data[`ISBN:${bookId}`].details.isbn_10[0],
  };

  console.log(bookInfo);
}

booksDiv.addEventListener('click', (e) => {
  if (!e.target.closest('div').classList.contains('book')) return;

  const bookId = e.target.closest('div').id;
  showBookInfo(bookId);
});

searchBtn.addEventListener('click', (e) => {
  e.preventDefault();
  booksDiv.innerHTML = '';
  // booksDiv.innerHTML = `<div class="spinner"></div>`;
  spinner.classList.add('visible');
  getBooks(input.value);
});

const showBookList = (bookList) => {
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

async function getBooks(keyword) {
  const response = await fetch(
    `https://openlibrary.org/search.json?q="${keyword}"`
  );
  const bookList = await response.json();

  showBookList(bookList);
}
