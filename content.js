// Handles webpage-level activities such as manipulating page data
// Contains scripts that run directly on the webpages you visit
// Allows the extension to interact with and modify the DOM of those pages

const bookmarkImgURL = chrome.runtime.getURL("assets/bookmark.png");
const AZ_PROBLEM_KEY = "AZ_PROBLEM_KEY";

// Mutation observer is observing any changes that are happening inside our body,
// including children and entire subtree of that body 
// If any changes occurs, it executes this addBookmarkButton() function
const observer = new MutationObserver(() => {
  addBookmarkButton();
})
observer.observe(document.body, {childList: true, subtree:true});

// We've to execute our addBookmarkButton() on script load as well 
// 1 time we need to execute this for consistency purposes 
// So that it never misses, even if it does not run Mutation observer 
// After that any change in our webpage, any part of the content that 
// is getting changed would trigger this function 
addBookmarkButton();

function onProblemsPage() {
  return window.location.pathname.startsWith('/problems/');
}

// We're changing something on /problems/
// It was triggering MutationObserver (bcoz of we adding that particular element)
// and that change was trigerring another change, 
// and it went into an Recursive cycle of infinite loop 
// On problems page it's not returning, 
// it's trying to add element again n again on every change
// But we don't want that, we only want it to add if it's not present already
function addBookmarkButton() {
  console.log("Triggering");
  // If we're not on problems page, then simply return
  // Bcoz we're giving access to every webpage on maang to content.js
  if(!onProblemsPage() || document.getElementById("add-bookmark-button")) return;

  // Create a new bookmark button as an image element
  const bookmarkButton = document.createElement("img");
  bookmarkButton.id = "add-bookmark-button";
  bookmarkButton.src = bookmarkImgURL;
  bookmarkButton.style.height = "30px";
  bookmarkButton.style.width = "30px";

  const askDoubtButton = document.getElementsByClassName(
    "coding_ask_doubt_button__FjwXJ"
  )[0];

  askDoubtButton.parentNode.insertAdjacentElement("afterend", bookmarkButton);

  bookmarkButton.addEventListener("click", addNewBookmarkHandler);
}

async function addNewBookmarkHandler() {
  // Fetch the current bookmarks stored in Chrome's sync storage
  const currentBookmarks = await getCurrentBookmarks();

  // Get the current problem URL and extract a unique identifier from it
  const azProblemUrl = window.location.href;
  const uniqueId = extractUniqueId(azProblemUrl);
  const problemName = document.querySelector("h4.problem_heading").textContent;

  // If the problem is already bookmarked, exit to prevent duplicates
  if (currentBookmarks.some((bookmark) => bookmark.id === uniqueId)) return;

  // Create a bookmark object containing the problem details
  const bookmarkObject = {
    id: uniqueId,
    name: problemName,
    url: azProblemUrl,
  };

  // Add the new bookmark to the existing list
  const updatedBookmarks = [...currentBookmarks, bookmarkObject];

  // Save the updated bookmarks list back to Chrome's sync storage
  chrome.storage.sync.set({ AZ_PROBLEM_KEY: updatedBookmarks }, () => {
    console.log("Bookmarks updated successfully:", updatedBookmarks);
  });
}

function extractUniqueId(url) {
  // Extracts the unique problem identifier from the URL
  const start_idx = url.indexOf("problems/") + "problems/".length;
  const end_idx = url.indexOf("?");

  // If no query parameters exist, return the remaining part of the URL
  return end_idx === -1
    ? url.substring(start_idx)
    : url.substring(start_idx, end_idx);
}

function getCurrentBookmarks() {
  // Retrieves the current list of bookmarks stored in Chrome's sync storage
  return new Promise((resolve) => {
    chrome.storage.sync.get([AZ_PROBLEM_KEY], (results) => {
      // If no bookmarks exist, return an empty array
      resolve(results[AZ_PROBLEM_KEY] || []);
    });
  });
}
