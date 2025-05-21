// Popup script for Chrome extension
document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  const apiKeyInput = document.getElementById('apiKey');
  const saveKeyBtn = document.getElementById('saveKeyBtn');
  const statusElement = document.getElementById('status');
  const messageElement = document.getElementById('message');
  const summarizeBtn = document.getElementById('summarizeBtn');
  const summaryElement = document.getElementById('summary');
  
  // Check if we need to auto-summarize
  chrome.storage.local.get('autoSummarizeTab', function(data) {
    if (data.autoSummarizeTab) {
      // Clear the flag
      chrome.storage.local.remove('autoSummarizeTab');
      
      // Check current tab to confirm it's the same one
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0].id === data.autoSummarizeTab) {
          // Show a message
          messageElement.textContent = 'Automatic summarization requested...';
          
          // Make sure we have an API key first
          chrome.storage.sync.get('apiKey', function(keyData) {
            if (keyData.apiKey && keyData.apiKey.trim() !== '') {
              // Wait for DOM to be ready and button to be visible
              setTimeout(function() {
                if (summarizeBtn.style.display === 'block') {
                  summarizeBtn.click();
                }
              }, 500);
            }
          });
        }
      });
    }
  });
  
  // Load any saved API key
  chrome.storage.sync.get('apiKey', function(data) {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
    }
  });
  
  // Save API key
  saveKeyBtn.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.sync.set({apiKey: apiKey}, function() {
        statusElement.textContent = 'API Key saved!';
        statusElement.style.color = 'green';
        setTimeout(() => {
          statusElement.textContent = '';
        }, 2000);
      });
    } else {
      statusElement.textContent = 'Please enter an API key';
      statusElement.style.color = 'red';
    }
  });
  
  // Check if current page has TOS content
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    
    // First check URL and title
    const url = currentTab.url.toLowerCase();
    const title = currentTab.title.toLowerCase();
    const tosKeywords = ['terms', 'tos', 'privacy', 'policy', 'legal', 'agreement'];
    
    let isTOS = tosKeywords.some(keyword => url.includes(keyword) || title.includes(keyword));
    
    if (isTOS) {
      messageElement.textContent = 'This appears to be a Terms of Service page!';
      summarizeBtn.style.display = 'block';
    } else {
      // Check page content
      chrome.scripting.executeScript({
        target: {tabId: currentTab.id},
        function: checkForTOSContent
      }, (results) => {
        if (results && results[0] && results[0].result === true) {
          messageElement.textContent = 'This appears to be a Terms of Service page!';
          summarizeBtn.style.display = 'block';
        } else {
          messageElement.textContent = 'This does not appear to be a Terms of Service page.';
        }
      });
    }
  });
  
  // Handle summarize button click
  summarizeBtn.addEventListener('click', function() {
    // Check if we have an API key
    chrome.storage.sync.get('apiKey', function(data) {
      if (!data.apiKey) {
        summaryElement.innerHTML = '<p style="color:red">Please save your API key first!</p>';
        return;
      }
      
      summaryElement.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>Simplifying the Terms of Service...</p>
        <p style="font-size:12px; color:#666;">This might take a moment for long documents</p>
      </div>
      `;
      
      // Get the current tab
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        
        // Extract text from the page
        chrome.scripting.executeScript({
          target: {tabId: currentTab.id},
          function: extractPageText
        }, (results) => {
          if (results && results[0] && results[0].result) {
            const pageText = results[0].result;
            
            // Send the text to the background script for processing
            chrome.runtime.sendMessage(
              {action: 'summarizeTOS', tosText: pageText},
              function(response) {
                if (chrome.runtime.lastError) {
                  summaryElement.innerHTML = '<p style="color:red">Error: ' + chrome.runtime.lastError.message + '</p>';
                  return;
                }
                
                if (response && response.summary) {
                  // Format and display the summary
                  formatAndDisplaySummary(response.summary);
                } else if (response && response.error) {
                  summaryElement.innerHTML = '<p style="color:red">Error: ' + response.error + '</p>';
                } else {
                  summaryElement.innerHTML = '<p style="color:red">Failed to get summary.</p>';
                }
              }
            );
          } else {
            summaryElement.innerHTML = '<p style="color:red">Could not extract page content.</p>';
          }
        });
      });
    });
  });
  
  // Helper function to format and display the summary
  function formatAndDisplaySummary(summary) {
    // Convert Markdown to HTML
    let formattedSummary = convertMarkdownToHtml(summary);
    
    summaryElement.innerHTML = `
      <div style="background-color:#f8f9fa; padding:16px; border-radius:8px; margin-top:16px; max-height:400px; overflow-y:auto;">
        <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Open Sans,Helvetica Neue,sans-serif; line-height:1.6;">
          ${formattedSummary}
        </div>
        <div style="text-align:right; margin-top:15px; padding-top:10px; border-top:1px solid #e6e6e6; font-size:11px; color:#666;">
          Powered by Google Gemini
        </div>
      </div>
    `;
    
    // Auto-expand the popup to fit the content
    document.body.style.minHeight = '500px';
  }
  
  // Function to convert Markdown to HTML
  function convertMarkdownToHtml(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Convert headings (## Heading)
    html = html.replace(/^## (.*?)$/gm, '<h2 style="margin:16px 0 8px; font-size:18px; color:#1a73e8;">$1</h2>');
    
    // Convert bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#d93025;">$1</strong>');
    
    // Convert bullet points
    html = html.replace(/^- (.*?)$/gm, '<li style="margin-bottom:8px;">$1</li>');
    
    // Wrap bullet points in ul tags
    let inList = false;
    const lines = html.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('<li') && !inList) {
        lines[i] = '<ul style="padding-left:20px; margin:8px 0 16px;">' + lines[i];
        inList = true;
      } else if (!lines[i].includes('<li') && inList) {
        lines[i-1] = lines[i-1] + '</ul>';
        inList = false;
      }
    }
    if (inList) {
      lines.push('</ul>');
    }
    
    // Join back and convert paragraphs
    html = lines.join('\n');
    
    // Convert paragraphs (blank lines between text)
    html = html.replace(/\n\n([^<].*?)\n/g, '\n<p style="margin:8px 0;">$1</p>\n');
    html = html.replace(/\n\n([^<].*?)$/g, '\n<p style="margin:8px 0;">$1</p>');
    
    return html;
  }
});

// Function to check if the page contains TOS content
function checkForTOSContent() {
  const bodyText = document.body.innerText.toLowerCase();
  const tosPatterns = [
    'terms of service',
    'terms and conditions',
    'privacy policy',
    'user agreement',
    'agree to these terms',
    'by using this',
    'legally binding'
  ];
  
  return tosPatterns.some(pattern => bodyText.includes(pattern));
}

// Function to extract text from the page
function extractPageText() {
  // Try to find a suitable container for the TOS
  const possibleContainers = [
    document.querySelector('article'),
    document.querySelector('main'),
    document.querySelector('.main-content'),
    document.querySelector('#main-content'),
    document.querySelector('.content'),
    document.querySelector('#content'),
    document.querySelector('.terms'),
    document.querySelector('#terms')
  ];
  
  // Filter out null values and get the first valid container
  const container = possibleContainers.filter(el => el !== null)[0] || document.body;
  
  // Return the text
  return container.innerText;
}