Library Web usiing Html/Css/Javascript 
# Book Library (HTML/CSS/JavaScript)

A simple front-end **Book Library** web app built with **HTML, CSS, JavaScript**, and **Bootstrap 5**.  
It allows you to add books, search/filter/sort them, mark availability, manage favorites, and view statistics.

## Pages

- **Home**: `index.html`  
  Main page to add books and browse your book list.
- **Favorites**: `favorites.html`  
  View books you marked as favorites.
- **Statistics**: `status.html`  
  View statistics about your library (counts/summary).
- **Sign Up / Login**: `signup.html`, `login.html`  
  Simple authentication UI pages (behavior depends on `index.js` logic).
- **Styles**
  - `index.css` (main styling)
  - `loginsignup.css` (login/signup pages styling)
- **Scripts**
  - `index.js` (main app logic for library features)

## Features (Home Page)

### 1) Add a book
On `index.html`, the “BOOK INPUTS” section contains:
- **Title** (`#titleInput`)
- **Author** (`#authorInput`)
- **Genre** (`#genreInput`)
- **Year** dropdown (`#yearSelect`)
- **Image URL** (`#imgInput`)
- **Availability** checkbox (`#availableInput`)
- **Add Book** button (`#addBookBtn`)

### 2) Search
Use the search field:
- **Search input**: `#searchInput`
- Placeholder: “Search by title, author, or genre...”

### 3) Filter
Filters are provided as dropdowns:
- **Genre filter**: `#genreFilter`
- **Year filter**: `#yearFilter`
- **Availability filter**: `#availabilityFilter`
  - All books
  - Available
  - Not available

### 4) Sort
Sorting dropdown:
- **Sort select**: `#sortSelect`
Options:
- Title A → Z / Z → A
- Newest year / Oldest year
- Author A → Z / Z → A

### 5) Dark mode
- Button: `#modeToggle`  
Toggles the page theme (implemented in `index.js` / `index.css`).

### 6) Export CSV
- Button: `#exportCsvBtn`  
Exports the library to a CSV file (implemented in `index.js`).

### 7) Book list rendering
- Container: `#booksContainer`  
All books are rendered into this element by JavaScript.

### 8) Toast notifications
- Element: `#toast`  
Used for messages/alerts (success, errors, etc.) depending on your JS.

## Navigation / Menu

The header includes a Bootstrap dropdown menu with links to:
- Home (`index.html`)
- Favorites (`favorites.html`)
- Statistics (`status.html`)
- Sign Up (`signup.html`)
- Login (`login.html`)
- Logout action: calls `logout()` from your JavaScript

## Tech Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- [Bootstrap 5.3](https://getbootstrap.com/) via CDN

## How to Run Locally

### Option A: Open directly
1. Download/clone the repo
2. Open `index.html` in your browser

### Option B: Use a local dev server (recommended)
Using VS Code:
1. Install the **Live Server** extension
2. Right click `index.html` → **Open with Live Server**

This helps avoid some browser restrictions and makes reloading easier.

## Project Structure

```text
Library-web-Html-Css-Javascript/
├─ index.html
├─ index.css
├─ index.js
├─ favorites.html
├─ status.html
├─ login.html
├─ signup.html
├─ loginsignup.css
└─ images.jpeg
