// Handles frontend UI logic
// Contains the logic for the popup

const AZ_PROBLEM_KEY = "AZ_PROBLEM_KEY";

const assetsURLMap = {
  play: chrome.runtime.getURL("assets/play.png"),
  delete: chrome.runtime.getURL("assets/delete.png"),
};

const bookmarkSection = document.getElementById("bookmarks");

// Whenever you open it, fetch the bookmarks from the storage and add it to the popup
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get([AZ_PROBLEM_KEY], (data) => {
    const currentBookmarks = data[AZ_PROBLEM_KEY] || []; // if not present, return empty array
    viewBookmarks(currentBookmarks);
  });
});

function viewBookmarks(bookmarks) {
  // We're refreshing all the bookmarks, so make sure to clear up the entire area before adding all the new bookmarks
  // Otherwise, it'll might add things again and again
  // So, always clear this things first (bcoz we're going to fill it from scratch)
  bookmarkSection.innerHTML = "";

  if (bookmarks.length === 0) {
    bookmarkSection.innerHTML = "<i>No bookmarks to show</i>";
  }

  bookmarks.forEach((bookmark) => addNewBookmark(bookmark));
}

function addNewBookmark(bookmark) {
  const newBookmark = document.createElement("div");
  const bookmarkTitle = document.createElement("div");
  const bookmarkControls = document.createElement("div");

  bookmarkTitle.textContent = bookmark.name;
  bookmarkTitle.classList.add("bookmark-title");

  setControlAttributes(assetsURLMap["play"], onPlay, bookmarkControls);
  setControlAttributes(assetsURLMap["delete"], onDelete, bookmarkControls);
  bookmarkControls.classList.add("bookmark-controls");

  newBookmark.classList.add("bookmark");

  newBookmark.append(bookmarkTitle);
  newBookmark.append(bookmarkControls);

  newBookmark.setAttribute("url", bookmark.url);
  newBookmark.setAttribute("bookmark-id", bookmark.id);

  bookmarkSection.appendChild(newBookmark);
}

function setControlAttributes(src, handler, parentDiv) {
  const controlElement = document.createElement("img");
  controlElement.src = src;
  controlElement.addEventListener("click", handler);

  parentDiv.appendChild(controlElement);
}

function onPlay(event) {
  const bookmarkItem = event.target.parentNode.parentNode;
  const problemUrl = bookmarkItem.getAttribute("url"); // get url from bookmarkItem (outer div)
  window.open(problemUrl, "_blank"); // open url in a new tab
}

function onDelete(event) {
  const bookmarkItem = event.target.parentNode.parentNode;
  const idToRemove = bookmarkItem.getAttribute("bookmark-id");
  bookmarkItem.remove();

  // Only getting deleted from current instance of popup
  // It's not getting deleted from chrome's storage
  // So we need to delete it from chrome's storage as well
  deleteItemFromStorage(idToRemove);
}

function deleteItemFromStorage(idToRemove) {
  chrome.storage.sync.get([AZ_PROBLEM_KEY], (data) => {
    const currentBookmarks = data[AZ_PROBLEM_KEY] || [];
    const updatedBookmarks = currentBookmarks.filter(
      (bookmark) => bookmark.id !== idToRemove
    );
    chrome.storage.sync.set({ AZ_PROBLEM_KEY: updatedBookmarks });
  });
}
