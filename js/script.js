const addBtn = document.querySelector('.add-book-btn--add');
const okBtn = document.querySelector('.add-book-btn--ok');
const form = document.querySelector('.form');
const formContainer = document.querySelector('.form-container');
let windowWidth = window.innerWidth;
formContainer.style.transform = `translateX(-${windowWidth}px)`;

document.body.style.height = `${window.innerHeight}px`;

const header = document.querySelector('.form__heading');

addBtn.addEventListener('click', function (e) {
  form.reset();

  if (addBtn.classList.contains('transform-to-cancel')) {
    addBtn.style.position = 'fixed';
    form.classList.remove('visible');
    addBtn.classList.remove('transform-to-cancel');
    // formContainer.style.transform = 'translateX(-100%)';
    formContainer.style.transform = `translateX(-${windowWidth}px)`;
  } else {
    addBtn.style.position = 'absolute';
    form.style.height = `${window.innerHeight}px`;
    form.classList.add('visible');
    addBtn.classList.add('transform-to-cancel');
    formContainer.style.transform = 'translateX(0)';
  }
});

///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

const booksDiv = document.querySelector('.book-list');
const input = document.querySelector('.input-text');
const Searchbtn = document.querySelector('.btn');

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

Searchbtn.addEventListener('click', (e) => {
  e.preventDefault();
  booksDiv.innerHTML = '';
  booksDiv.innerHTML = `<div class="loader"></div>`;
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

      img.classList.add('book-image');
      const p = document.createElement('p');
      const btn = document.createElement('div');

      p.textContent = `${bookList.docs[i].title} - ${
        bookList.docs[i].author_name?.[0] || ''
      }`;

      btn.classList.add('book');
      btn.id = bookList.docs[i].isbn[0];
      btn.append(p, img);
      booksContainer.appendChild(btn);

      if (imgsLoaded === forLength) {
        booksDiv.innerHTML = '';
        booksDiv.appendChild(booksContainer);
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
