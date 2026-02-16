/* ===========================
   SIMPLE AUTH (SIGNUP / LOGIN)
   =========================== */

/* Helper to get and save users (list of accounts) */
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("users")) || [];
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

/* Return the email of the currently logged-in user */
function getCurrentUserEmail() {
  return localStorage.getItem("currentUser") || null;
}

/* ---- SIGN UP ---- */
function signup() {
  const emailInput = document.getElementById("signupEmail");
  const passInput = document.getElementById("signupPassword");
  const msg = document.getElementById("signupMessage");

  if (!emailInput || !passInput || !msg) return;

  const email = emailInput.value.trim().toLowerCase();
  const password = passInput.value.trim();

  msg.textContent = "";
  msg.className = "";

  if (!email || !password) {
    msg.textContent = "Please fill all fields.";
    msg.className = "error";
    return;
  }

  const users = getUsers();
  const existing = users.find(u => u.email === email);
  if (existing) {
    msg.textContent = "Email already registered.";
    msg.className = "error";
    return;
  }

  users.push({
    id: Date.now(),
    email: email,
    password: password
  });
  saveUsers(users);

  msg.textContent = "Account created successfully!";
  msg.className = "success";

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}

/* ---- LOGIN WITH OTP ---- */
function login() {
  const emailInput = document.getElementById("loginEmail");
  const passInput = document.getElementById("loginPassword");
  const msg = document.getElementById("loginMessage");

  if (!emailInput || !passInput || !msg) return;

  const email = emailInput.value.trim().toLowerCase();
  const password = passInput.value.trim();

  msg.textContent = "";
  msg.className = "";

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    msg.textContent = "Invalid login credentials.";
    msg.className = "error";
    return;
  }

  msg.textContent = "Credentials correct. Generating OTP...";
  msg.className = "success";

  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000);
  alert("Your OTP is: " + otp);

  const enteredOtp = prompt("Enter OTP:");

  if (enteredOtp == otp) {
    localStorage.setItem("currentUser", user.email);
    window.location.href = "index.html";
  } else {
    msg.textContent = "Incorrect OTP!";
    msg.className = "error";
  }
}

/* ---- LOGOUT ---- */
function logout() {
  localStorage.removeItem("currentUser");
  alert("You have been logged out.");
  window.location.href = "login.html";
}

/* ===========================
   THEME (LIGHT / DARK)
   =========================== */

function applyTheme(theme) {
  const body = document.body;
  const container = document.querySelector(".container");
  const header = document.querySelector(".header");
  const modeBtn = document.getElementById("modeToggle");

  if (theme === "dark") {
    body.classList.add("dark-mode");
    container && container.classList.add("dark-mode-box");
    header && header.classList.add("dark-header");
    if (modeBtn) modeBtn.textContent = "Light Mode";
  } else {
    body.classList.remove("dark-mode");
    container && container.classList.remove("dark-mode-box");
    header && header.classList.remove("dark-header");
    if (modeBtn) modeBtn.textContent = "Dark Mode";
  }

  // Update cards if they exist
  document.querySelectorAll(".book-card").forEach(card => {
    if (theme === "dark") card.classList.add("dark-card");
    else card.classList.remove("dark-card");
  });
}

function toggleDarkMode() {
  const currentTheme = localStorage.getItem("theme") || "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", nextTheme);
  applyTheme(nextTheme);
}

/* ===========================
   TOAST (SMALL MESSAGE)
   =========================== */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ===========================
   BOOK STORAGE HELPERS
   =========================== */

/* Get all books from localStorage (array of objects) */
function getAllBooks() {
  try {
    return JSON.parse(localStorage.getItem("books")) || [];
  } catch (e) {
    return [];
  }
}

/* Save all books back to localStorage */
function saveAllBooks(books) {
  localStorage.setItem("books", JSON.stringify(books));
}

/* ===========================
   BOOK LIBRARY CLASS
   =========================== */

class BookLibrary {
  constructor(pageType) {
    this.pageType = pageType; // "home", "favorites", or "stats"

    // DOM elements (may be null on some pages)
    this.booksContainer = document.getElementById("booksContainer");
    this.searchInput = document.getElementById("searchInput");
    this.genreFilter = document.getElementById("genreFilter");
    this.yearFilter = document.getElementById("yearFilter");
    this.availabilityFilter = document.getElementById("availabilityFilter");
    this.sortSelect = document.getElementById("sortSelect");

    this.addBookBtn = document.getElementById("addBookBtn");
    this.titleInput = document.getElementById("titleInput");
    this.authorInput = document.getElementById("authorInput");
    this.genreInput = document.getElementById("genreInput");
    this.yearSelect = document.getElementById("yearSelect");
    this.imgInput = document.getElementById("imgInput"); // can be file input or text
    this.availableInput = document.getElementById("availableInput");
    this.exportCsvBtn = document.getElementById("exportCsvBtn");

    // Stats page elements
    this.statTotal = document.getElementById("statTotalBooks");
    this.statFav = document.getElementById("statFavorites");
    this.statTopAuthor = document.getElementById("statTopAuthor");
    this.statOldest = document.getElementById("statOldest");
    this.statNewest = document.getElementById("statNewest");
    this.genreStatsBody = document.getElementById("genreStatsBody");

    // Internal data
    this.books = getAllBooks();
    this.searchTerm = "";
    this.filters = {
      genre: "",
      year: "",
      availability: "",
      sort: "title-asc"
    };

    this.init();
  }

  /* ----- INIT ----- */
  init() {
    this.populateYears();
    this.attachEvents();
    this.render();
    this.updateStatsPage();
  }

  /* ----- YEARS DROPDOWN ----- */
  populateYears() {
    if (!this.yearSelect) return;
    const current = new Date().getFullYear();
    for (let y = current; y >= 1900; y--) {
      const opt = document.createElement("option");
      opt.value = String(y);
      opt.textContent = String(y);
      this.yearSelect.appendChild(opt);
    }
  }

  /* ----- EVENTS ----- */
  attachEvents() {
    // Search / filters
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.render();
      });
    }

    if (this.genreFilter) {
      this.genreFilter.addEventListener("change", (e) => {
        this.filters.genre = e.target.value;
        this.render();
      });
    }

    if (this.yearFilter) {
      this.yearFilter.addEventListener("change", (e) => {
        this.filters.year = e.target.value;
        this.render();
      });
    }

    if (this.availabilityFilter) {
      this.availabilityFilter.addEventListener("change", (e) => {
        this.filters.availability = e.target.value;
        this.render();
      });
    }

    if (this.sortSelect) {
      this.sortSelect.addEventListener("change", (e) => {
        this.filters.sort = e.target.value;
        this.render();
      });
    }

    // Add book (only on home page)
    if (this.addBookBtn) {
      this.addBookBtn.addEventListener("click", () => this.addBook());
    }

    // Export CSV + JSON (only on home page)
    if (this.exportCsvBtn) {
      this.exportCsvBtn.addEventListener("click", () => this.exportData());
    }

    // Theme button (if exists on page)
    const modeBtn = document.getElementById("modeToggle");
    if (modeBtn) {
      modeBtn.addEventListener("click", toggleDarkMode);
    }
  }

  /* ----- ADD BOOK (supports file upload or URL) ----- */
  addBook() {
    const currentUser = getCurrentUserEmail();
    if (!currentUser) {
      alert("You must login first!");
      window.location.href = "login.html";
      return;
    }

    const title = this.titleInput ? this.titleInput.value.trim() : "";
    const author = this.authorInput ? this.authorInput.value.trim() : "";
    const genre = this.genreInput ? this.genreInput.value.trim() : "";
    const year = this.yearSelect ? this.yearSelect.value : "";
    const available = this.availableInput ? this.availableInput.checked : true;

    if (!title || !author || !genre || !year) {
      alert("Fill all fields.");
      return;
    }

    const placeholder = "https://via.placeholder.com/200x180?text=No+Image";
    const input = this.imgInput;
    const file = input && input.files && input.files[0];
    const urlValue = input ? input.value.trim() : "";

    const finishAdd = (imageSrc) => {
      const allBooks = getAllBooks();
      allBooks.push({
        id: String(Date.now()),
        title: title,
        author: author,
        genre: genre,
        year: year,
        image: imageSrc || placeholder,
        available: available,
        rating: 0,
        favorite: false,
        owner: currentUser
      });
      saveAllBooks(allBooks);
      this.books = allBooks;
      this.clearInputs();
      this.render();
      this.updateStatsPage();
      this.populateFilterOptions();
      showToast("Book added");
    };

    // If input is a file input with a selected file
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        finishAdd(e.target.result);
      };
      reader.onerror = () => {
        finishAdd(placeholder);
      };
      reader.readAsDataURL(file);
    } else {
      // If it's text input or no file: use URL or placeholder
      finishAdd(urlValue || placeholder);
    }
  }

  /* Clear the form after adding a book */
  clearInputs() {
    if (this.titleInput) this.titleInput.value = "";
    if (this.authorInput) this.authorInput.value = "";
    if (this.genreInput) this.genreInput.value = "";
    if (this.yearSelect) this.yearSelect.selectedIndex = 0;
    if (this.imgInput) this.imgInput.value = "";
    if (this.availableInput) this.availableInput.checked = true;
  }

  /* ----- FILTER AND SORT BOOKS (for current user) ----- */
  getFilteredBooks() {
    const currentUser = getCurrentUserEmail();
    let list = getAllBooks();

    // Only books of the logged-in user
    if (currentUser) {
      list = list.filter(b => b.owner === currentUser);
    }

    // If favorites page, keep only favorites
    if (this.pageType === "favorites") {
      list = list.filter(b => b.favorite);
    }

    // Search
    if (this.searchTerm) {
      list = list.filter(b =>
        (b.title + b.author + b.genre)
          .toLowerCase()
          .includes(this.searchTerm)
      );
    }

    // Genre filter
    if (this.filters.genre) {
      list = list.filter(b => b.genre === this.filters.genre);
    }

    // Year filter
    if (this.filters.year) {
      list = list.filter(b => String(b.year) === String(this.filters.year));
    }

    // Availability filter
    if (this.filters.availability === "available") {
      list = list.filter(b => b.available);
    } else if (this.filters.availability === "unavailable") {
      list = list.filter(b => !b.available);
    }

    // Sorting
    switch (this.filters.sort) {
      case "title-asc":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        list.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "year-asc":
        list.sort((a, b) => a.year - b.year);
        break;
      case "year-desc":
        list.sort((a, b) => b.year - a.year);
        break;
      case "author-asc":
        list.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case "author-desc":
        list.sort((a, b) => b.author.localeCompare(a.author));
        break;
    }

    return list;
  }

  /* Populate genre/year filters based on user's books */
  populateFilterOptions() {
    if (!this.genreFilter && !this.yearFilter) return;

    const currentUser = getCurrentUserEmail();
    let list = getAllBooks();
    if (currentUser) {
      list = list.filter(b => b.owner === currentUser);
    }

    const genres = [...new Set(list.map(b => b.genre))];
    const years = [...new Set(list.map(b => b.year))];

    if (this.genreFilter) {
      this.genreFilter.innerHTML = `<option value="">All genres</option>`;
      genres.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        this.genreFilter.appendChild(opt);
      });
    }

    if (this.yearFilter) {
      this.yearFilter.innerHTML = `<option value="">All years</option>`;
      years.forEach(y => {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        this.yearFilter.appendChild(opt);
      });
    }
  }

  /* ----- RENDER BOOK CARDS ----- */
  render() {
    if (!this.booksContainer) {
      // maybe stats-only page
      this.updateStatsPage();
      return;
    }

    const books = this.getFilteredBooks();
    const theme = localStorage.getItem("theme") || "light";

    this.booksContainer.innerHTML = "";

    if (books.length === 0) {
      this.booksContainer.innerHTML = "<p>No books found.</p>";
      return;
    }

    books.forEach(book => {
      const card = document.createElement("div");
      card.className = "book-card";
      if (theme === "dark") card.classList.add("dark-card");

      card.innerHTML = `
        <img src="${book.image}">
        <h4 class="book-title">${book.title}</h4>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Genre:</strong> ${book.genre}</p>
        <p><strong>Year:</strong> ${book.year}</p>
        <p><strong>Availability:</strong> ${book.available ? "Available" : "Not available"}</p>
      `;

      const footer = document.createElement("div");
      footer.className = "card-footer";

      const actions = document.createElement("div");
      actions.className = "card-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "btn-edit";
      editBtn.textContent = "Edit";
      editBtn.onclick = () => this.editBook(book.id);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn-delete";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => this.deleteBook(book.id);

      const favBtn = document.createElement("button");
      favBtn.className = "btn-favorite" + (book.favorite ? " active" : "");
      favBtn.textContent = book.favorite ? "Unfavorite" : "Favorite";
      favBtn.onclick = () => this.toggleFavorite(book.id);

      actions.append(editBtn, deleteBtn, favBtn);

      // Rating stars
      const ratingDiv = document.createElement("div");
      ratingDiv.className = "rating";
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.textContent = "★";
        star.className = "star" + (i <= book.rating ? " filled" : "");
        star.onclick = () => this.setRating(book.id, i);
        ratingDiv.appendChild(star);
      }

      footer.append(actions, ratingDiv);
      card.appendChild(footer);
      this.booksContainer.appendChild(card);
    });

    // Refresh filters based on possibly changed data
    this.populateFilterOptions();
  }

  /* ----- EDIT BOOK ----- */
  editBook(id) {
    const allBooks = getAllBooks();
    const book = allBooks.find(b => b.id === id);
    if (!book) return;

    const newTitle = prompt("Edit title:", book.title);
    if (newTitle === null) return;

    const newAuthor = prompt("Edit author:", book.author);
    if (newAuthor === null) return;

    const newGenre = prompt("Edit genre:", book.genre);
    if (newGenre === null) return;

    const newYear = prompt("Edit year:", book.year);
    if (newYear === null) return;

    const newAvailable = confirm("Is the book available? OK = Yes");

    book.title = newTitle.trim() || book.title;
    book.author = newAuthor.trim() || book.author;
    book.genre = newGenre.trim() || book.genre;
    book.year = newYear.trim() || book.year;
    book.available = newAvailable;

    saveAllBooks(allBooks);
    this.books = allBooks;
    this.render();
    this.updateStatsPage();
    showToast("Book updated");
  }

  /* ----- DELETE BOOK ----- */
  deleteBook(id) {
    if (!confirm("Delete this book?")) return;

    let allBooks = getAllBooks();
    allBooks = allBooks.filter(b => b.id !== id);
    saveAllBooks(allBooks);
    this.books = allBooks;
    this.render();
    this.updateStatsPage();
    showToast("Book deleted");
  }

  /* ----- FAVORITE ----- */
  toggleFavorite(id) {
    const allBooks = getAllBooks();
    const book = allBooks.find(b => b.id === id);
    if (!book) return;

    book.favorite = !book.favorite;
    saveAllBooks(allBooks);
    this.books = allBooks;
    this.render();
    this.updateStatsPage();
    showToast(book.favorite ? "Added to favorites" : "Removed from favorites");
  }

  /* ----- RATING ----- */
  setRating(id, rating) {
    const allBooks = getAllBooks();
    const book = allBooks.find(b => b.id === id);
    if (!book) return;

    book.rating = rating;
    saveAllBooks(allBooks);
    this.books = allBooks;
    this.render();
    this.updateStatsPage();
    showToast(`Rated ${rating} star(s)`);
  }

  /* ----- EXPORT CSV + JSON (for current user) ----- */
  exportData() {
    const currentUser = getCurrentUserEmail();
    let list = getAllBooks();
    if (currentUser) {
      list = list.filter(b => b.owner === currentUser);
    }

    if (!list.length) {
      alert("No books to export.");
      return;
    }

    // CSV
    const header = ["ID", "Title", "Author", "Genre", "Year", "Available", "Rating", "Favorite", "Owner"];
    const rows = list.map(b => [
      b.id,
      b.title,
      b.author,
      b.genre,
      b.year,
      b.available,
      b.rating,
      b.favorite,
      b.owner
    ]);
    const csvLines = [header.join(","), ...rows.map(r => r.join(","))];
    const csvText = csvLines.join("\n");
    downloadFile("books.csv", csvText, "text/csv");

    // JSON
    const jsonText = JSON.stringify(list, null, 2);
    downloadFile("books.json", jsonText, "application/json");

    showToast("Exported CSV and JSON");
  }

  /* ----- UPDATE STATS PAGE ----- */
  updateStatsPage() {
    if (!this.statTotal) return; // not on stats page

    const currentUser = getCurrentUserEmail();
    let list = getAllBooks();
    if (currentUser) {
      list = list.filter(b => b.owner === currentUser);
    }

    this.statTotal.textContent = list.length;
    this.statFav.textContent = list.filter(b => b.favorite).length;

    // Most popular author
    const authorCount = {};
    list.forEach(b => {
      authorCount[b.author] = (authorCount[b.author] || 0) + 1;
    });
    const topAuthorEntry = Object.entries(authorCount).sort((a, b) => b[1] - a[1])[0];
    this.statTopAuthor.textContent = topAuthorEntry ? topAuthorEntry[0] : "-";

    // Oldest and newest years
    const years = list.map(b => Number(b.year)).filter(n => !isNaN(n));
    this.statOldest.textContent = years.length ? Math.min(...years) : "-";
    this.statNewest.textContent = years.length ? Math.max(...years) : "-";

    // Genre table
    this.genreStatsBody.innerHTML = "";
    const genreCount = {};
    list.forEach(b => {
      genreCount[b.genre] = (genreCount[b.genre] || 0) + 1;
    });
    Object.entries(genreCount).forEach(([g, c]) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${g}</td><td>${c}</td>`;
      this.genreStatsBody.appendChild(row);
    });
  }
}

/* ===========================
   PAGE INITIALIZATION
   =========================== */

document.addEventListener("DOMContentLoaded", () => {
  // Apply saved theme
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);

  // Only create BookLibrary on pages that have data-page attribute
  const pageType = document.body.dataset.page || null;
  if (pageType === "home" || pageType === "favorites" || pageType === "stats") {
    window.library = new BookLibrary(pageType);
  }
});
