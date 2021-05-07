const booksDiv = document.querySelector(".book-list");
const input = document.querySelector(".input-text");
const btn = document.querySelector(".btn");

btn.addEventListener("click", (e) => {
  booksDiv.innerHTML = "";
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

  for (let i = 0; i < forLength; i++) {
    const p = document.createElement("p");
    const img = document.createElement("img");
    img.src =
      `http://covers.openlibrary.org/b/isbn/${bookList.docs[i].isbn?.[0]}-M.jpg` ||
      "";
    // http://covers.openlibrary.org/b/isbn/0385472579-S.jpg
    console.log(img.src);
    p.textContent = bookList.docs[i].title;
    booksDiv.appendChild(p);
    booksDiv.appendChild(img);
  }
  //   return bookList;
}

// document.addEventListener("DOMContentLoaded", getBooks);

// getCover(9789580602316);
