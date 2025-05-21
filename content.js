// content.js

function isTOSPage() {
  const urlKeywords = ['terms-of-service', 'terms', 'privacy-policy', 'legal', 'service-agreement'];
  const titleKeywords = ['Terms of Service', 'Privacy Policy', 'Legal', 'Agreement'];

  const currentURL = window.location.href.toLowerCase();
  const pageTitle = document.title.toLowerCase();

  // Check URL
  for (const keyword of urlKeywords) {
    if (currentURL.includes(keyword)) {
      return true;
    }
  }

  // Check page title
  for (const keyword of titleKeywords) {
    if (pageTitle.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  // Check for common headings
  const headings = Array.from(document.querySelectorAll('h1, h2'));
  for (const heading of headings) {
    const headingText = heading.innerText.toLowerCase();
    for (const keyword of titleKeywords) {
        if (headingText.includes(keyword.toLowerCase())) {
            return true;
        }
    }
  }

  return false;
}

// Send a message to the popup if it's a TOS page
if (isTOSPage()) {
  // This message will be caught by popup.js to show the "Summarize" button
  chrome.runtime.sendMessage({ action: "showSummarizeButton" });
}

// Listen for messages from the popup (e.g., to get page content)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTOSText") {
    // A more sophisticated approach would be to find the main content body
    // For now, we'll send the whole document body's innerText
    const bodyText = document.body.innerText;
    sendResponse({ tosText: bodyText });
    return true; // Indicates that the response will be sent asynchronously
  }
});
