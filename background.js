// background.js

// No longer a hardcoded key here. It will be fetched from storage.
// const GEMINI_API_KEY = "YOUR_GOOGLE_API_KEY"; 
// const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarizeTOS") {
    const tosText = request.tosText;
    console.log("Background script received TOS text. Length:", tosText.length);

    chrome.storage.sync.get('apiKey', (data) => {
      const apiKey = data.apiKey;

      if (!apiKey || apiKey.trim() === "") {
        console.error("Gemini API key is not set. Please configure it in the extension options page.");
        sendResponse({ error: "API Key not configured. Please set it in the extension's options page." });
        return; // Exit early, no need for return true as sendResponse was called.
      }

      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

      const requestPayload = {
        contents: [{
          parts: [{
            text: `Summarize this TOS in a way that can be understood by humans with bullet points. The most important is that the risks can be well understood by humans. Here is the TOS: ${tosText}`
          }]
        }],
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
      .then(apiData => { // Renamed 'data' to 'apiData' to avoid conflict with 'data' from storage
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
  chrome.storage.sync.get("apiKey", (data) => {
    if (data.apiKey === undefined) { // Check if apiKey is undefined (not just falsy like empty string)
      chrome.storage.sync.set({ apiKey: "" }); 
      console.log("API Key initialized to empty string in storage.");
    }
  });
});
