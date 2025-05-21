// background.js

// Shared subscription API key - in a real implementation, this would be on a server
// This is just a placeholder - you would use a server to handle this securely
const SUBSCRIPTION_API_KEY = "YOUR_SHARED_SUBSCRIPTION_API_KEY";

// Gemini 2.0 Flash model
const GEMINI_MODEL = "gemini-2.0-flash"; 

// Listen for automatic summarization requests from the banner
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "autoSummarize") {
    // Get the tab where the banner was clicked
    if (sender.tab) {
      // Open the popup and click the summarize button
      chrome.action.openPopup();
      
      // We can't directly click the button in the popup, but we can send a signal
      // for the popup to auto-summarize when it opens
      chrome.storage.local.set({ 'autoSummarizeTab': sender.tab.id });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarizeTOS") {
    const tosText = request.tosText;
    console.log("Background script received TOS text. Length:", tosText.length);

    chrome.storage.sync.get(['apiKey', 'useSubscription', 'subscriptionExpiry'], (data) => {
      let apiKey = null;
      
      // Check if user has an active subscription
      if (data.useSubscription && data.subscriptionExpiry && Date.now() < data.subscriptionExpiry) {
        apiKey = SUBSCRIPTION_API_KEY;
        console.log("Using subscription API key");
      } else {
        // Otherwise use the user's API key
        apiKey = data.apiKey;
        console.log("Using user's personal API key");
      }

      if (!apiKey || apiKey.trim() === "") {
        console.error("Gemini API key is not set.");
        sendResponse({ 
          error: "No API key available. Please set your API key first." 
        });
        return;
      }

      // Updated URL to use Gemini 2.0 Flash model
      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

      const requestPayload = {
        contents: [{
          parts: [{
            text: `Simplify and summarize this Terms of Service in a way that's VERY EASY for average humans to understand.

Your output MUST follow these guidelines:
1. Use simple, everyday language - NO legal jargon
2. Use short sentences and clear explanations
3. Break down complex concepts into plain English
4. Organize with bullet points under clear categories
5. Highlight the KEY RISKS and what users are actually agreeing to
6. Be concise - no lengthy explanations

Focus on these important areas:
- What user data is collected and how it's used
- What rights users are giving up
- What the company can do with user content/data
- How to cancel the service
- Any unexpected obligations or limitations
- Any particularly concerning terms normal people would care about
- Financial terms (payments, refunds, etc.)

Format your response with Markdown:
- Use ## headings for main categories
- Use bullet points (-)
- Put critically important points in **bold**
- Use simple paragraph breaks for readability

Your summary should be friendly, helpful, and about 50% shorter than a typical Terms of Service summary. Start with a very brief 1-sentence overview. Make this so simple a 12-year-old could understand what they're agreeing to.

Here is the TOS: ${tosText}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1024,
        }
      };

      fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            console.error('Gemini API Error:', response.status, errorData);
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
          });
        }
        return response.json();
      })
      .then(apiData => {
        let summary = "Could not extract summary from API response.";
        if (apiData.candidates && apiData.candidates[0] && apiData.candidates[0].content && apiData.candidates[0].content.parts && apiData.candidates[0].content.parts[0]) {
          summary = apiData.candidates[0].content.parts[0].text;
        } else {
          console.warn("Unexpected API response structure:", apiData);
        }
        sendResponse({ summary: summary });
      })
      .catch(error => {
        console.error('Error calling Gemini API:', error);
        sendResponse({ error: error.message || "Failed to fetch summary from API." });
      });
    });

    return true; // Indicates that the response will be sent asynchronously
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("TOS Summarizer extension installed.");
  chrome.storage.sync.get(["apiKey", "useSubscription", "subscriptionExpiry"], (data) => {
    // Initialize storage values if they don't exist
    const updates = {};
    
    if (data.apiKey === undefined) {
      updates.apiKey = "";
    }
    
    if (data.useSubscription === undefined) {
      updates.useSubscription = false;
    }
    
    if (data.subscriptionExpiry === undefined) {
      updates.subscriptionExpiry = 0;
    }
    
    if (Object.keys(updates).length > 0) {
      chrome.storage.sync.set(updates, () => {
        console.log("Extension storage initialized.");
      });
    }
  });
});
