const booksDiv = document.querySelector('.book-list');
const input = document.querySelector('.input-text');
const btn = document.querySelector('.btn');
let isLoaded = false;

btn.addEventListener('click', (e) => {
  booksDiv.innerHTML = '';
  e.preventDefault();
  getBooks(input.value);
});
async function getBooks(keyword) {
  //   const keyword = "javascript";
  //   const keyword = "you don't know js";
  const response = await fetch(
    `http://openlibrary.org/search.json?q="${keyword}"`
  );
  const bookList = await response.json();
  console.log(bookList);
  const forLength = bookList.docs.length <= 10 ? bookList.docs.length : 10;
  console.log(forLength);
  console.log(bookList.docs.length);

  let j = 0;
  for (let i = 0; i < bookList.docs.length; i++) {
    if (j > 10) break;
    const p = document.createElement('p');
    const img = document.createElement('img');
    img.src =
      `http://covers.openlibrary.org/b/isbn/${bookList.docs[i].isbn?.[0]}-M.jpg` ||
      '';

    const checkImg = (e) => {
      img.removeEventListener('load', checkImg);
      isLoaded = img.complete && img.naturalHeight !== 1;
      if (!isLoaded) return;

      p.textContent = `${bookList.docs[i].title} - ${
        bookList.docs[i].author_name?.[0] || ''
      }`;
      booksDiv.appendChild(p);
      booksDiv.appendChild(img);
      j++;
    };

    img.addEventListener('load', checkImg);
  }
}

// document.addEventListener("DOMContentLoaded", getBooks);

// getCover(9789580602316);
