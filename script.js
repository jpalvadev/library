const booksDiv = document.querySelector(".book-list");
const input = document.querySelector(".input-text");
const btn = document.querySelector(".btn");

btn.addEventListener("click", (e) => {
  booksDiv.innerHTML = "";
  e.preventDefault();
  booksDiv.innerHTML = `<div class="loader"></div>`;
  getBooks(input.value);
});

const showBooks = (bookList) => {
  console.log(bookList);
  let imgsLoaded = 0;
  const forLength = bookList.docs.length <= 20 ? bookList.docs.length : 20;
  const booksContainer = document.createDocumentFragment();

  for (let i = 0; i < forLength; i++) {
    const img = document.createElement("img");
    img.src =
      `http://covers.openlibrary.org/b/isbn/${bookList.docs[i].isbn?.[0]}-M.jpg` ||
      "";

    const checkImg = (e) => {
      const isLoadedOk = img.complete && img.naturalHeight !== 1;
      imgsLoaded++;
      if (!isLoadedOk) return;
      const p = document.createElement("p");

      p.textContent = `${bookList.docs[i].title} - ${
        bookList.docs[i].author_name?.[0] || ""
      }`;
      booksContainer.appendChild(p);
      booksContainer.appendChild(img);
      img.removeEventListener("load", checkImg);

      if (imgsLoaded === forLength) {
        booksDiv.innerHTML = "";
        booksDiv.appendChild(booksContainer);
      }
    };

    img.addEventListener("load", checkImg);
  }
};

async function getBooks(keyword) {
  //   const keyword = "javascript";
  //   const keyword = "you don't know js";
  const response = await fetch(
    `http://openlibrary.org/search.json?q="${keyword}"`
  );
  const bookList = await response.json();

  showBooks(bookList);
}
