// Initial message
document.addEventListener('DOMContentLoaded', function() {
  const messageElement = document.getElementById('message');
  const summarizeBtn = document.getElementById('summarizeBtn');
  const summaryDiv = document.getElementById('summary');

  // Listener for messages from the content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showSummarizeButton") {
      messageElement.style.display = 'none';
      summarizeBtn.style.display = 'block';
    } else if (request.action === "displaySummary") {
      summarizeBtn.style.display = 'none';
      summaryDiv.innerHTML = request.summary;
    }
  });

  // Request content script to check if it's a TOS page
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      files: ['content.js']
    }, () => {
      // After ensuring content.js is injected, send a message to check the page
      // This is a bit redundant if content.js runs on page load,
      // but can be useful for dynamically injected content or single-page apps.
      // For now, content.js will proactively send a message if it detects a TOS.
    });
  });

  summarizeBtn.addEventListener('click', () => {
    summaryDiv.innerHTML = "Summarizing...";
    // Send message to content script to get TOS text
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: "getTOSText"}, (response) => {
        if (chrome.runtime.lastError) {
          summaryDiv.innerHTML = "Error: Could not communicate with the content script. Try reloading the page.";
          console.error(chrome.runtime.lastError.message);
          return;
        }
        if (response && response.tosText) {
          // Send TOS text to background script
          chrome.runtime.sendMessage({action: "summarizeTOS", tosText: response.tosText}, (summaryResponse) => {
             if (chrome.runtime.lastError) {
                summaryDiv.innerHTML = "Error: Could not get summary. " + chrome.runtime.lastError.message;
                console.error(chrome.runtime.lastError.message);
                return;
              }
            if (summaryResponse && summaryResponse.summary) {
              summaryDiv.innerHTML = summaryResponse.summary;
            } else if (summaryResponse && summaryResponse.error) {
               summaryDiv.innerHTML = "Error: " + summaryResponse.error;
            } else {
              summaryDiv.innerHTML = "Failed to get summary.";
            }
          });
        } else {
          summaryDiv.innerHTML = "Could not extract TOS text.";
        }
      });
    });
  });
});
