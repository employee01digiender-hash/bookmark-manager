// ==========================================
// Bookmark Manager - script.js
// ==========================================


// -------------------------
// DOM Elements
// -------------------------

const bookmarkForm = document.getElementById("bookmarkForm");
const bookmarkName = document.getElementById("bookmarkName");
const bookmarkUrl = document.getElementById("bookmarkUrl");
const bookmarkCategory = document.getElementById("bookmarkCategory");
const bookmarkFavorite = document.getElementById("bookmarkFavorite");

const bookmarkList = document.getElementById("bookmarkList");
const bookmarkCount = document.getElementById("bookmarkCount");
const emptyState = document.getElementById("emptyState");

const searchBookmark = document.getElementById("searchBookmark");
const categoryFilter = document.getElementById("categoryFilter");
const showFavorites = document.getElementById("showFavorites");

const editModal = document.getElementById("editModal");
const closeModal = document.getElementById("closeModal");
const editBookmarkForm = document.getElementById("editBookmarkForm");

const editBookmarkName = document.getElementById("editBookmarkName");
const editBookmarkUrl = document.getElementById("editBookmarkUrl");
const editBookmarkCategory = document.getElementById("editBookmarkCategory");
const editBookmarkFavorite = document.getElementById("editBookmarkFavorite");


// -------------------------
// App State
// -------------------------

let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

let editingBookmarkId = null;

let favoritesOnly = false;


// -------------------------
// Save to Local Storage
// -------------------------

function saveBookmarks() {
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}


// -------------------------
// Generate Unique ID
// -------------------------

function generateId() {
  return Date.now().toString();
}


// -------------------------
// Fix URL
// -------------------------

function normalizeUrl(url) {
  let cleanUrl = url.trim();

  if (
    !cleanUrl.startsWith("http://") &&
    !cleanUrl.startsWith("https://")
  ) {
    cleanUrl = "https://" + cleanUrl;
  }

  return cleanUrl;
}


// -------------------------
// Validate URL
// -------------------------

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}


// -------------------------
// Escape HTML
// -------------------------

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}


// -------------------------
// Add Bookmark
// -------------------------

bookmarkForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = bookmarkName.value.trim();
  const url = normalizeUrl(bookmarkUrl.value);
  const category = bookmarkCategory.value;
  const favorite = bookmarkFavorite.checked;

  if (!name || !url) {
    alert("Please enter website name and URL.");
    return;
  }

  if (!isValidUrl(url)) {
    alert("Please enter a valid website URL.");
    return;
  }

  const newBookmark = {
    id: generateId(),
    name,
    url,
    category,
    favorite
  };

  bookmarks.unshift(newBookmark);

  saveBookmarks();
  renderBookmarks();

  bookmarkForm.reset();

  bookmarkName.focus();
});


// -------------------------
// Render Bookmarks
// -------------------------

function renderBookmarks() {
  const searchText = searchBookmark.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;

  let filteredBookmarks = bookmarks.filter(function (bookmark) {

    const matchesSearch =
      bookmark.name.toLowerCase().includes(searchText) ||
      bookmark.url.toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "all" ||
      bookmark.category === selectedCategory;

    const matchesFavorite =
      !favoritesOnly || bookmark.favorite;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesFavorite
    );
  });


  bookmarkList.innerHTML = "";


  // Update Count
  bookmarkCount.textContent = bookmarks.length;


  // Empty State
  if (filteredBookmarks.length === 0) {

    const empty = document.createElement("div");

    empty.className = "empty-state";

    empty.innerHTML = `
      <div class="empty-icon">🔖</div>
      <h3>No bookmarks found</h3>
      <p>
        ${
          bookmarks.length === 0
            ? "Add your first bookmark using the form above."
            : "Try changing your search or filters."
        }
      </p>
    `;

    bookmarkList.appendChild(empty);

    return;
  }


  // Create Cards
  filteredBookmarks.forEach(function (bookmark) {

    const card = document.createElement("article");

    card.className = "bookmark-card";

    card.innerHTML = `

      <div class="bookmark-card-header">

        <div>
          <h3>${escapeHTML(bookmark.name)}</h3>
        </div>

        <button
          type="button"
          class="favorite-icon"
          data-action="favorite"
          data-id="${bookmark.id}"
          title="Toggle favorite"
          style="
            border: none;
            background: transparent;
            cursor: pointer;
          "
        >
          ${bookmark.favorite ? "⭐" : "☆"}
        </button>

      </div>


      <a
        href="${escapeHTML(bookmark.url)}"
        target="_blank"
        rel="noopener noreferrer"
        class="bookmark-url"
      >
        ${escapeHTML(bookmark.url)}
      </a>


      <span class="category-badge">
        ${escapeHTML(bookmark.category)}
      </span>


      <div class="bookmark-actions">

        <a
          href="${escapeHTML(bookmark.url)}"
          target="_blank"
          rel="noopener noreferrer"
          class="open-btn"
        >
          Open
        </a>


        <button
          type="button"
          data-action="edit"
          data-id="${bookmark.id}"
        >
          Edit
        </button>


        <button
          type="button"
          data-action="delete"
          data-id="${bookmark.id}"
          class="delete-btn"
        >
          Delete
        </button>

      </div>
    `;

    bookmarkList.appendChild(card);
  });
}


// -------------------------
// Bookmark Card Actions
// -------------------------

bookmarkList.addEventListener("click", function (event) {

  const button = event.target.closest("[data-action]");

  if (!button) {
    return;
  }

  const id = button.dataset.id;
  const action = button.dataset.action;


  // Delete
  if (action === "delete") {
    deleteBookmark(id);
  }


  // Edit
  if (action === "edit") {
    openEditModal(id);
  }


  // Favorite
  if (action === "favorite") {
    toggleFavorite(id);
  }
});


// -------------------------
// Delete Bookmark
// -------------------------

function deleteBookmark(id) {

  const bookmark = bookmarks.find(function (item) {
    return item.id === id;
  });

  if (!bookmark) {
    return;
  }

  const confirmed = confirm(
    `Delete "${bookmark.name}" bookmark?`
  );

  if (!confirmed) {
    return;
  }

  bookmarks = bookmarks.filter(function (bookmark) {
    return bookmark.id !== id;
  });

  saveBookmarks();
  renderBookmarks();
}


// -------------------------
// Toggle Favorite
// -------------------------

function toggleFavorite(id) {

  bookmarks = bookmarks.map(function (bookmark) {

    if (bookmark.id === id) {

      return {
        ...bookmark,
        favorite: !bookmark.favorite
      };

    }

    return bookmark;
  });

  saveBookmarks();
  renderBookmarks();
}


// -------------------------
// Open Edit Modal
// -------------------------

function openEditModal(id) {

  const bookmark = bookmarks.find(function (bookmark) {
    return bookmark.id === id;
  });

  if (!bookmark) {
    return;
  }

  editingBookmarkId = id;

  editBookmarkName.value = bookmark.name;
  editBookmarkUrl.value = bookmark.url;
  editBookmarkCategory.value = bookmark.category;
  editBookmarkFavorite.checked = bookmark.favorite;

  editModal.classList.add("active");

  editBookmarkName.focus();
}


// -------------------------
// Close Edit Modal
// -------------------------

function closeEditModal() {

  editModal.classList.remove("active");

  editingBookmarkId = null;

  editBookmarkForm.reset();
}


closeModal.addEventListener("click", function () {
  closeEditModal();
});


// Close modal by clicking background
editModal.addEventListener("click", function (event) {

  if (event.target === editModal) {
    closeEditModal();
  }

});


// Close modal with Escape key
document.addEventListener("keydown", function (event) {

  if (
    event.key === "Escape" &&
    editModal.classList.contains("active")
  ) {
    closeEditModal();
  }

});


// -------------------------
// Save Edited Bookmark
// -------------------------

editBookmarkForm.addEventListener("submit", function (event) {

  event.preventDefault();

  if (!editingBookmarkId) {
    return;
  }

  const name = editBookmarkName.value.trim();

  const url = normalizeUrl(
    editBookmarkUrl.value
  );

  const category = editBookmarkCategory.value;

  const favorite = editBookmarkFavorite.checked;


  if (!name || !url) {

    alert("Please enter website name and URL.");

    return;
  }


  if (!isValidUrl(url)) {

    alert("Please enter a valid website URL.");

    return;
  }


  bookmarks = bookmarks.map(function (bookmark) {

    if (bookmark.id === editingBookmarkId) {

      return {
        ...bookmark,
        name,
        url,
        category,
        favorite
      };

    }

    return bookmark;
  });


  saveBookmarks();

  renderBookmarks();

  closeEditModal();
});


// -------------------------
// Search Bookmarks
// -------------------------

searchBookmark.addEventListener("input", function () {
  renderBookmarks();
});


// -------------------------
// Category Filter
// -------------------------

categoryFilter.addEventListener("change", function () {
  renderBookmarks();
});


// -------------------------
// Show Favorites
// -------------------------

showFavorites.addEventListener("click", function () {

  favoritesOnly = !favoritesOnly;

  if (favoritesOnly) {

    showFavorites.textContent = "⭐ Showing Favorites";

    showFavorites.classList.add("active");

  } else {

    showFavorites.textContent = "⭐ Favorites";

    showFavorites.classList.remove("active");
  }

  renderBookmarks();
});


// -------------------------
// Initial Render
// -------------------------

renderBookmarks();