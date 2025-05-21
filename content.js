// content.js

function isTOSPage() {
  const urlKeywords = [
    'terms-of-service', 'terms', 'privacy-policy', 'legal', 'service-agreement', 
    'terms-and-conditions', 'tos', 'eula', 'end-user-license-agreement',
    'conditions', 'aup', 'acceptable-use-policy', 'privacy'
  ];
  
  const titleKeywords = [
    'Terms of Service', 'Privacy Policy', 'Legal', 'Agreement', 
    'Terms and Conditions', 'TOS', 'EULA', 'End User License Agreement',
    'Terms of Use', 'Acceptable Use Policy', 'User Agreement',
    'Service Agreement', 'License Agreement'
  ];

  const currentURL = window.location.href.toLowerCase();
  const pageTitle = document.title.toLowerCase();

  // Check URL
  for (const keyword of urlKeywords) {
    if (currentURL.includes(keyword)) {
      console.log("TOS detected in URL: " + keyword);
      return true;
    }
  }

  // Check page title
  for (const keyword of titleKeywords) {
    if (pageTitle.includes(keyword.toLowerCase())) {
      console.log("TOS detected in page title: " + keyword);
      return true;
    }
  }
  
  // Check for common headings
  const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
  for (const heading of headings) {
    const headingText = heading.innerText.toLowerCase();
    for (const keyword of titleKeywords) {
      if (headingText.includes(keyword.toLowerCase())) {
        console.log("TOS detected in heading: " + keyword);
        return true;
      }
    }
  }
  
  // Check for common patterns in page content
  const contentPatterns = [
    /by\s+using\s+this\s+(service|site|website|app|application)/i,
    /agree\s+to\s+(these|our|the)\s+terms/i,
    /accept\s+(these|our|the)\s+terms/i,
    /legally\s+binding\s+agreement/i
  ];
  
  const bodyText = document.body.innerText;
  for (const pattern of contentPatterns) {
    if (pattern.test(bodyText)) {
      console.log("TOS detected in content pattern: " + pattern);
      return true;
    }
  }

  return false;
}

// Try to identify the main content container instead of using the entire page body
function extractTOSContent() {
  // Common selectors for main content areas
  const possibleContentSelectors = [
    'article', 'main', '.main-content', '#main-content', 
    '.content', '#content', '.terms', '#terms',
    '.terms-content', '#terms-content', '.privacy-content', '#privacy-content'
  ];
  
  // Try to find a suitable container
  for (const selector of possibleContentSelectors) {
    const element = document.querySelector(selector);
    if (element && element.innerText.length > 500) { // Arbitrary length to ensure it's substantial content
      return element.innerText;
    }
  }
  
  // Fallback: identify the largest text block
  const paragraphs = Array.from(document.querySelectorAll('p'));
  let largestContainer = null;
  let largestTextLength = 0;
  
  // Find the parent element that contains the most text
  paragraphs.forEach(p => {
    const parent = p.parentElement;
    // Skip parents that are likely to be headers or menus
    if (parent.tagName === 'HEADER' || parent.tagName === 'NAV' || parent.tagName === 'FOOTER') {
      return;
    }
    
    // Get all text from this parent
    const text = parent.innerText;
    if (text.length > largestTextLength) {
      largestTextLength = text.length;
      largestContainer = parent;
    }
  });
  
  // If we found a suitable container, use it
  if (largestContainer && largestTextLength > 1000) {
    return largestContainer.innerText;
  }
  
  // Default fallback: return the whole body text
  return document.body.innerText;
}

// Create and show the notification banner
function showTOSBanner() {
  // First check if banner already exists
  if (document.getElementById('tos-summarizer-banner')) {
    return;
  }
  
  // Create banner container
  const banner = document.createElement('div');
  banner.id = 'tos-summarizer-banner';
  
  // Style the banner
  Object.assign(banner.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    backgroundColor: '#4285f4',
    color: 'white',
    padding: '10px 20px',
    zIndex: '9999999',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif'
  });
  
  // Banner content
  banner.innerHTML = `
    <div style="display:flex; align-items:center;">
      <img src="${chrome.runtime.getURL('images/icon48.png')}" style="height:24px; margin-right:10px;">
      <span>This appears to be a Terms of Service. Would you like to summarize it?</span>
    </div>
    <div>
      <button id="tos-summarize-btn" style="background:#34a853; color:white; border:none; padding:8px 16px; border-radius:4px; cursor:pointer; margin-right:10px; font-weight:bold;">Summarize</button>
      <button id="tos-dismiss-btn" style="background:transparent; color:white; border:1px solid white; padding:8px 16px; border-radius:4px; cursor:pointer;">Dismiss</button>
    </div>
  `;
  
  // Add to DOM
  document.body.prepend(banner);
  
  // Add event listeners
  document.getElementById('tos-summarize-btn').addEventListener('click', () => {
    // Open the extension popup and trigger summarization
    chrome.runtime.sendMessage({ action: "autoSummarize" });
    banner.remove();
  });
  
  document.getElementById('tos-dismiss-btn').addEventListener('click', () => {
    banner.remove();
  });
  
  // Auto-dismiss after 30 seconds
  setTimeout(() => {
    if (document.getElementById('tos-summarizer-banner')) {
      document.getElementById('tos-summarizer-banner').remove();
    }
  }, 30000);
}

// Check if it's a TOS page
if (isTOSPage()) {
  // Show banner after a short delay to let page render
  setTimeout(showTOSBanner, 1500);
  
  // Also send message to the extension
  chrome.runtime.sendMessage({ action: "showSummarizeButton" });
}

// Listen for messages from the popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTOSText") {
    // Extract the TOS content
    const tosText = extractTOSContent();
    sendResponse({ tosText: tosText });
    return true; // Indicates that the response will be sent asynchronously
  }
});
