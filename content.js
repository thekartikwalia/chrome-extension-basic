// Handles all the webpage level activities (eg: manipulating page data, etc.)
// It contains scripts that run directly on the webpages you visit 
// It allows the extension to interact with and manipulate the DOM of those pages 

const bookmarkImgURL = chrome.runtime.getURL("assets/bookmark.png");

// Don't select DOM (bcoz we're relying on CSS to select button, so we want CSS to get loaded before we run this script)
// So use window 
window.addEventListener("load", addBookmarkButton);

function addBookmarkButton() {
    const bookmarkButton = document.createElement('img');
    bookmarkButton.id = "add-bookmark-button";
    bookmarkButton.src = bookmarkImgURL;
    bookmarkButton.style.height = "30px";
    bookmarkButton.style.width = "30px";

    const askDoubtButton = document.getElementsByClassName("coding_ask_doubt_button__FjwXJ")[0];

    askDoubtButton.parentNode.insertAdjacentElement("afterend", bookmarkButton);
}