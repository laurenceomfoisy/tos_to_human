// TOS Summarizer App Script
document.addEventListener('DOMContentLoaded', function() {
  // Get UI elements
  const apiKeyInput = document.getElementById('apiKey');
  const saveKeyBtn = document.getElementById('saveKeyBtn');
  const statusMessage = document.getElementById('statusMessage');
  const pageStatus = document.getElementById('pageStatus');
  const summarizeBtn = document.getElementById('summarizeBtn');
  const summaryCard = document.getElementById('summaryCard');
  const summaryDiv = document.getElementById('summary');
  
  // Get the current tab ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const tabId = parseInt(urlParams.get('tabId'));
  
  // Load saved API key
  loadApiKey();
  
  // Check if current page is a TOS
  checkIfTosPage();
  
  // Set up event listeners
  saveKeyBtn.addEventListener('click', saveApiKey);
  summarizeBtn.addEventListener('click', summarizeTos);
  
  // Functions
  function loadApiKey() {
    chrome.storage.sync.get('apiKey', function(data) {
      if (data.apiKey) {
        apiKeyInput.value = data.apiKey;
        console.log('API key loaded from storage');
      }
    });
  }
  
  function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.sync.set({apiKey: apiKey}, function() {
        statusMessage.textContent = 'API Key saved!';
        statusMessage.style.color = 'green';
        setTimeout(() => {
          statusMessage.textContent = '';
        }, 3000);
      });
    } else {
      statusMessage.textContent = 'Please enter an API key';
      statusMessage.style.color = 'red';
    }
  }
  
  function checkIfTosPage() {
    // Get the current tab details and check its content
    chrome.tabs.executeScript(
      tabId,
      {code: `
        // Simple TOS detection
        const pageText = document.body.innerText.toLowerCase();
        const pageTitle = document.title.toLowerCase();
        const urlPath = window.location.href.toLowerCase();
        
        const tosKeywords = ['terms', 'service', 'privacy', 'policy', 'agreement', 'legal', 'tos'];
        
        // Check URL
        const urlHasTosKeywords = tosKeywords.some(keyword => urlPath.includes(keyword));
        
        // Check title
        const titleHasTosKeywords = tosKeywords.some(keyword => pageTitle.includes(keyword));
        
        // Check content patterns
        const hasAgreementText = pageText.includes('agree to these terms') || 
                                 pageText.includes('by using this') ||
                                 pageText.includes('terms of service') ||
                                 pageText.includes('privacy policy');
        
        // Return result
        urlHasTosKeywords || titleHasTosKeywords || hasAgreementText;
      `},
      function(results) {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          pageStatus.textContent = 'Error checking page content: ' + chrome.runtime.lastError.message;
          return;
        }
        
        if (results && results[0] === true) {
          pageStatus.textContent = 'This page appears to contain Terms of Service!';
          summarizeBtn.classList.remove('hidden');
        } else {
          pageStatus.textContent = 'This page does not appear to contain Terms of Service.';
        }
      }
    );
  }
  
  function summarizeTos() {
    // Check if API key is set
    chrome.storage.sync.get('apiKey', function(data) {
      if (!data.apiKey) {
        summaryCard.classList.remove('hidden');
        summaryDiv.innerHTML = '<p style="color:red">Please enter and save your API key first!</p>';
        return;
      }
      
      // Show the summary card with loading message
      summaryCard.classList.remove('hidden');
      summaryDiv.innerHTML = '<p>Extracting and summarizing the Terms of Service...</p>';
      
      // Get the page content
      chrome.tabs.executeScript(
        tabId,
        {code: 'document.body.innerText'},
        function(results) {
          if (chrome.runtime.lastError) {
            summaryDiv.innerHTML = '<p style="color:red">Error: ' + chrome.runtime.lastError.message + '</p>';
            return;
          }
          
          if (results && results[0]) {
            const tosText = results[0];
            
            // Send message to background script for API processing
            chrome.runtime.sendMessage(
              {
                action: 'summarizeTOS',
                tosText: tosText
              },
              function(response) {
                if (chrome.runtime.lastError) {
                  summaryDiv.innerHTML = '<p style="color:red">Error: ' + chrome.runtime.lastError.message + '</p>';
                  return;
                }
                
                if (response && response.summary) {
                  // Format the summary
                  let formattedSummary = response.summary;
                  
                  // Convert markdown bullet points to HTML if not already
                  if (!formattedSummary.includes('<li>')) {
                    formattedSummary = formattedSummary
                      .replace(/\n- /g, '\n<li>')
                      .replace(/\n\s*\n/g, '</li>\n\n')
                      .replace(/<\/li>\n<li>/g, '</li>\n<li>');
                      
                    if (formattedSummary.includes('<li>')) {
                      formattedSummary = '<ul>' + formattedSummary + '</li></ul>';
                    }
                  }
                  
                  summaryDiv.innerHTML = `
                    <h3>Summary of Terms:</h3>
                    ${formattedSummary}
                    <div style="text-align:right; margin-top:15px; font-size:12px; color:#666;">
                      Powered by Google Gemini 2.0 Flash
                    </div>
                  `;
                } else if (response && response.error) {
                  summaryDiv.innerHTML = '<p style="color:red">Error: ' + response.error + '</p>';
                } else {
                  summaryDiv.innerHTML = '<p style="color:red">Failed to get summary. Please try again.</p>';
                }
              }
            );
          } else {
            summaryDiv.innerHTML = '<p style="color:red">Could not extract page content.</p>';
          }
        }
      );
    });
  }
});