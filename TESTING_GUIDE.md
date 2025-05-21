# TOS to Human - Developer Testing Guide

This document provides exhaustive testing instructions for developers working on the TOS to Human Firefox extension. This is an internal developer document, not user-facing documentation.

## Quick Start: Getting a Google Gemini API Key

To test this extension, you'll need a Google Gemini API key. Here's how to get one quickly:

1. Go to https://ai.google.dev/
2. Sign in with your Google account
3. Navigate to "Get API key" in the top right or go directly to https://makersuite.google.com/app/apikey
4. Create a new API key by clicking "Create API key"
5. Copy the generated API key
6. In the extension's options page, paste your API key and click "Save Key"

Note: Google provides a free quota for Gemini API usage, which should be sufficient for testing purposes. The API key is stored locally in your browser and is only used to communicate with the Gemini API.

## Table of Contents
1. [Development Environment Setup](#development-environment-setup)
2. [Loading the Extension](#loading-the-extension)
3. [Manual Testing Procedure](#manual-testing-procedure)
4. [API Key Testing](#api-key-testing)
5. [Subscription Testing](#subscription-testing)
6. [TOS Detection Testing](#tos-detection-testing)
7. [Content Extraction Testing](#content-extraction-testing)
8. [UI Testing](#ui-testing)
9. [Error Case Testing](#error-case-testing)
10. [Browser Compatibility Testing](#browser-compatibility-testing)
11. [Performance Testing](#performance-testing)
12. [Debugging Tips](#debugging-tips)

## Development Environment Setup

### Prerequisites
- Firefox Developer Edition or Firefox Nightly (recommended for extension development)
- A Google Gemini API key for testing
- Git for version control

### Development Tools
- Firefox Browser Console: Open with Ctrl+Shift+J or Command+Shift+J on Mac
- Firefox Debugger: Available in the Firefox DevTools
- Extension Debugging Page: Navigate to `about:debugging#/runtime/this-firefox`

### Code Validation Tools
- Web-ext: `npm install -g web-ext` for linting and testing
- ESLint: For JavaScript validation
- Firefox Profiler: For performance analysis

## Loading the Extension

### Temporary Installation (for development)
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Navigate to your extension directory and select manifest.json
4. The extension will be loaded until Firefox is closed

### Testing Changes
1. After making changes to the extension code:
   - Go to `about:debugging#/runtime/this-firefox`
   - Find the TOS to Human extension
   - Click "Reload" to apply changes
   - OR use web-ext: `web-ext run --firefox-profile=dev`

### Building for Distribution
```bash
# Install web-ext if not already installed
npm install -g web-ext

# Build the extension
web-ext build

# Sign the extension (requires API keys from addons.mozilla.org)
web-ext sign --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET
```

## Manual Testing Procedure

### Basic Functionality Test
1. Load the extension
2. Navigate to a known Terms of Service page (see [test URLs](#test-urls))
3. Click the extension icon to open the popup
4. Verify the "Help me understand this TOS!" button appears
5. Click the button and verify the summarization process starts
6. Check that the summary appears correctly formatted with bullet points

### Test URLs
Use these URLs for testing TOS detection:
- https://www.facebook.com/terms.php
- https://policies.google.com/terms
- https://www.amazon.com/gp/help/customer/display.html?nodeId=201909000
- https://www.apple.com/legal/internet-services/itunes/us/terms.html
- https://www.microsoft.com/en-us/servicesagreement/
- https://twitter.com/en/tos
- https://www.reddit.com/policies/user-agreement
- https://www.spotify.com/us/legal/end-user-agreement/
- https://www.dropbox.com/terms
- https://zoom.us/terms

### Negative Test URLs (should NOT trigger TOS detection)
- https://www.wikipedia.org
- https://www.weather.gov
- https://www.cnn.com
- https://developer.mozilla.org
- https://github.com
- https://stackoverflow.com

## API Key Testing

### Test API Key Configuration
1. Open the extension options page (right-click extension icon > Manage Extensions > Options)
2. Enter a valid Gemini API key
3. Click "Save Key"
4. Verify the success message appears
5. Reload the extension
6. Navigate to a TOS page and test summarization works with your key

### Invalid API Key Testing
1. Enter an invalid API key in the options page (e.g., "invalid-key-123")
2. Save the key
3. Try to summarize a TOS page
4. Verify appropriate error message appears (should include the API error)

### Empty API Key Testing
1. Clear the API key in the options page
2. Save the empty key
3. Try to summarize a TOS page
4. Verify the error message provides instructions to set up an API key

### API Key Storage Testing
1. Set an API key and save it
2. Close Firefox completely
3. Reopen Firefox and load the extension
4. Verify the API key is still saved in the options page

### Direct Storage Manipulation
```javascript
// In Firefox console after accessing the extension's background page
// Clear API key
chrome.storage.sync.set({apiKey: ""}, () => console.log("API key cleared"));

// Set a test API key
chrome.storage.sync.set({apiKey: "test-api-key-123"}, () => console.log("Test API key set"));

// View current API key
chrome.storage.sync.get("apiKey", (result) => console.log("Current API key:", result.apiKey));
```

## Subscription Testing

Since the subscription feature is a placeholder, test that the UI works correctly:

1. Click the "Subscribe" button in the options page
2. Verify the subscription status message changes
3. Verify the subscription information is saved between browser sessions
4. Test that the subscription expiry logic works by manually modifying the expiry date in storage

### Simulating Subscription States
Use the browser console to simulate subscription states:
```javascript
// Set active subscription
chrome.storage.sync.set({
  useSubscription: true,
  subscriptionExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000)  // 30 days from now
}, () => console.log("Active subscription set"));

// Set expired subscription
chrome.storage.sync.set({
  useSubscription: true,
  subscriptionExpiry: Date.now() - (1 * 24 * 60 * 60 * 1000)  // 1 day ago
}, () => console.log("Expired subscription set"));

// Check current subscription values
chrome.storage.sync.get(['useSubscription', 'subscriptionExpiry'], (result) => {
  console.log("Subscription active:", result.useSubscription);
  console.log("Expiry date:", new Date(result.subscriptionExpiry).toLocaleString());
  console.log("Is expired:", Date.now() > result.subscriptionExpiry);
});
```

### Testing Subscription UI States
Test the UI for all possible subscription states:
- No subscription, no API key
- No subscription, valid API key
- Active subscription
- Expired subscription

## TOS Detection Testing

### Testing URL-based Detection
1. Navigate to URLs with keywords like "terms", "privacy", "legal", etc.
2. Check extension popup to verify detection
3. Use console to test detection directly:
```javascript
// In the console of a TOS page
var script = document.createElement('script');
script.textContent = `
  console.log("Is TOS page:", isTOSPage());
  console.log("URL keywords check:", window.location.href.toLowerCase().includes("terms"));
`;
document.body.appendChild(script);
```

### Testing Title-based Detection  
1. Create local HTML files with titles containing TOS keywords:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Terms of Service - Test Page</title>
</head>
<body>
  <h1>Test Terms of Service Page</h1>
  <p>This is a test page for TOS detection.</p>
</body>
</html>
```
2. Open the file in Firefox and verify detection works

### Testing Heading-based Detection
1. Create local HTML files with different heading structures (h1, h2, h3)
```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
</head>
<body>
  <h1>Welcome to Our Website</h1>
  <h2>Terms and Conditions</h2>
  <p>This is a test page for TOS detection.</p>
</body>
</html>
```
2. Verify the extension detects them correctly

### Testing Content Pattern Detection
1. Create HTML files with content matching the patterns in content.js
```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
</head>
<body>
  <p>By using this website, you agree to our terms and conditions.</p>
  <p>This page should be detected as a TOS page based on content patterns.</p>
</body>
</html>
```
2. Verify detection works correctly

### False Positive Testing
Test pages that might have similar keywords but aren't TOS pages:
- News articles about terms of service
- Blog posts discussing privacy policies
- Academic papers on legal agreements

## Content Extraction Testing

### Testing Main Content Extraction
1. Navigate to different TOS pages with varied layouts
2. Use the browser console to test the extractTOSContent() function:
```javascript
// In browser console, with extension loaded and on a TOS page
var extractScript = document.createElement('script');
extractScript.textContent = `
  if (typeof extractTOSContent === 'function') {
    const extracted = extractTOSContent();
    console.log("Extracted content length:", extracted.length);
    console.log("Body content length:", document.body.innerText.length);
    console.log("Extraction ratio:", extracted.length / document.body.innerText.length);
    console.log("First 200 chars:", extracted.substring(0, 200));
  } else {
    console.log("extractTOSContent function not found");
  }
`;
document.body.appendChild(extractScript);
```

### Testing Extraction on Different Page Structures
Test content extraction on sites with different HTML structures:
- Single-page TOS documents (e.g., Facebook, Twitter)
- Multi-page/tabbed TOS documents (e.g., Microsoft, Apple)
- TOS embedded in iframes (some e-commerce sites)
- TOS with unusual markup (e.g., lists, tables)
- TOS with JavaScript-rendered content

### Content Size Testing
1. Test with very large TOS documents (e.g., Apple's iTunes agreement)
2. Test with very short TOS documents (create test pages with <1000 characters)
3. Check if the extraction handles both cases properly

## UI Testing

### Popup UI Testing
1. Test popup appearance on different TOS pages
2. Verify all UI elements are properly aligned and styled
3. Test button states (enabled/disabled)
4. Test error messages appear correctly
5. Test summary formatting with different length summaries

### Options Page UI Testing
1. Test all form controls on the options page
2. Verify notifications appear correctly
3. Test responsive behavior by resizing the window
4. Verify subscription UI elements appear correctly

### Visual Testing
1. Take screenshots of the UI in different states
2. Compare with reference designs/screenshots
3. Check for visual regressions

### Accessibility Testing
1. Verify color contrast meets WCAG standards
2. Test keyboard navigation within popup and options
3. Verify proper focus management
4. Test with screen readers if possible

## Error Case Testing

### Network Error Testing
1. Disable internet connection
2. Try to summarize a TOS document
3. Verify appropriate error message appears

### API Limit Testing
1. Use a Gemini API key with rate limits reached or simulate with a mock
2. Try to summarize a TOS document
3. Verify the error message is user-friendly

### API Response Testing
Test handling of different API responses:
```javascript
// Modify background.js temporarily to simulate different API responses
// Add this before the fetch call

// Mock successful response with empty content
return sendResponse({ 
  summary: "This is a mock summary to test the UI formatting."
});

// Mock error response
return sendResponse({ 
  error: "Simulated API error for testing. This is a long error message to test wrapping."
});
```

### Edge Cases
1. Test with extremely short TOS content
2. Test with extremely long TOS content
3. Test with TOS containing special characters, HTML tags, etc.
4. Test when API returns unexpected response format

## Browser Compatibility Testing

### Firefox Version Testing
Test the extension on:
- Firefox Latest Stable
- Firefox ESR
- Firefox Developer Edition
- Firefox Nightly
- Firefox for Android (if applicable)

### Chrome Testing
The extension should also work on Chrome:
1. Load the extension in Chrome using developer mode
2. Test core functionality
3. Document any Chrome-specific issues

### Other Browser Testing
If targeting other browsers:
- Test on Edge
- Test on Safari with the appropriate build process
- Test on Opera

## Performance Testing

### Load Time Testing
1. Measure popup load time:
```javascript
// Add to popup.js
console.time('popup-load');
document.addEventListener('DOMContentLoaded', function() {
  console.timeEnd('popup-load');
  // rest of code...
});
```

2. Measure content script injection and detection time:
```javascript
// Add to content.js
console.time('tos-detection');
// ... detection code ...
console.timeEnd('tos-detection');
```

### Memory Usage Testing
1. Monitor memory usage in Firefox Task Manager
2. Test memory usage with multiple summarizations
3. Check for memory leaks by repeatedly opening/closing popup

### API Response Time Testing
1. Measure time from clicking summarize to receiving results:
```javascript
// Add to popup.js
let apiStartTime;
summarizeBtn.addEventListener('click', () => {
  apiStartTime = performance.now();
  // ... existing code ...
});

// When response is received:
console.log('API response time:', performance.now() - apiStartTime, 'ms');
```
2. Test with different TOS document sizes
3. Create performance benchmarks for common TOS pages

## Debugging Tips

### Enable Verbose Logging
Add additional console.log statements for debugging:
```javascript
// In background.js
console.log("API URL:", GEMINI_API_URL);
console.log("Request payload:", JSON.stringify(requestPayload));
```

### Inspect Extension Storage
View and modify extension storage via browser console:
```javascript
// View all storage
chrome.storage.sync.get(null, console.log);

// Clear all storage
chrome.storage.sync.clear();

// Reset storage to default values
chrome.storage.sync.set({
  apiKey: "",
  useSubscription: false,
  subscriptionExpiry: 0
});
```

### Debug Content Script Injection
Verify content script is properly injected:
```javascript
// In browser console on a TOS page
typeof isTOSPage === 'function' ? "Content script loaded" : "Content script not loaded";
```

### Test API Communication
Test each part of the API communication flow:
1. Content script extraction
2. Background script API call
3. Response handling

### Manual API Testing
Test the Gemini API directly with curl:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Summarize this sample TOS: This is a sample terms of service..."}]}],"generationConfig":{"temperature":0.2,"topP":0.8,"topK":40,"maxOutputTokens":1024}}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY"
```

### Debug Message Passing
Add logging for extension message passing:
```javascript
// In content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);
  // ...
});

// In background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background script received message:", request);
  console.log("From:", sender);
  // ...
});
```

## Regression Testing Checklist

Before releasing any updates:

### Functionality Testing
- [ ] Extension loads without errors
- [ ] TOS detection works on all test URLs
- [ ] API key configuration works
- [ ] Subscription UI works correctly
- [ ] Text extraction works on different TOS pages
- [ ] Summaries are properly formatted
- [ ] Error messages are user-friendly

### UI Testing
- [ ] Popup UI displays correctly
- [ ] Options page UI displays correctly
- [ ] All states (loading, error, success) display correctly
- [ ] Responsive design works properly

### Performance Testing
- [ ] Popup opens quickly (<200ms)
- [ ] TOS detection is fast (<500ms)
- [ ] API response handling is efficient
- [ ] No memory leaks after extended use

### Cross-browser Testing
- [ ] Works correctly on Firefox
- [ ] Works correctly on Chrome (if targeted)
- [ ] Works correctly on other targeted browsers

### Release Preparation
- [ ] Version number is updated in manifest.json
- [ ] All console.log debugging statements are removed or conditional
- [ ] Documentation is updated
- [ ] Built with web-ext build
- [ ] Tested final package in clean browser profile

## Known Issues and Limitations

- Content extraction may not work optimally on all TOS pages, especially those with complex layouts or dynamic content
- The extension cannot access content within iframes from different origins due to browser security restrictions
- Some sites may block the extension from accessing their content
- Gemini API has rate limits and usage quotas that may affect heavy users
- The subscription feature is currently a placeholder and needs integration with a payment processor
- Cross-origin restrictions may prevent the extension from working on some sites
- Very large TOS documents may hit token limits with the Gemini API

---

## Troubleshooting Common Issues

### "Extension can't be loaded" errors
- Check for syntax errors in JavaScript files
- Verify manifest.json is correctly formatted
- Try loading in a clean Firefox profile

### Content script not running
- Check the manifest.json content_scripts section
- Verify the matches pattern includes the test URLs
- Try using the "activeTab" permission

### API communication issues
- Verify API key format is correct
- Check for CORS or network issues
- Verify API URL and endpoint are correct
- Check if the API key has reached rate limits

### Storage problems
- Clear browser extension storage and try again
- Check for quota limitations
- Verify storage permission in manifest.json

### TOS detection issues
- Check if URL/title/heading detection is working
- Verify content patterns are correctly defined
- Try adding console logs to debug detection logic

### Summary formatting issues
- Check the HTML structure of the summary
- Verify CSS is correctly applied
- Test with various lengths of summaries

### Extension permissions
- Check if all required permissions are in manifest.json
- Verify activeTab permission is working correctly
- Check if content_scripts matches patterns are correct