# Manual Testing Guide for TOS Summarizer Extension

This guide outlines the steps to manually test the core functionality of the TOS Summarizer Firefox extension.

**Prerequisites:**
1.  Firefox browser installed.
2.  The TOS Summarizer extension loaded into Firefox (e.g., through `about:debugging` > "This Firefox" > "Load Temporary Add-on", selecting the `manifest.json` file).
3.  A valid Google Gemini API key.

**Testing Steps:**

**1. API Key Configuration:**
    *   Open the extension's options page:
        *   Right-click the extension icon in the Firefox toolbar.
        *   Select "Manage Extension."
        *   Click on the three dots (...) for the TOS Summarizer extension and select "Options."
        *   Alternatively, find the extension in `about:addons`, click preferences/options.
    *   **Test Case 1.1: No API Key Set (Initial State or Cleared Key)**
        *   Ensure no API key is currently saved (or delete any existing key and click "Save Key").
        *   Navigate to a known TOS/Privacy Policy page (e.g., search for "Google Terms of Service").
        *   Click the extension icon to open the popup.
        *   **Expected:** The popup should show the "Help me understand this TOS!" button.
        *   Click the button.
        *   **Expected:** The summary area should display an error message like "API Key not configured. Please set it in the extension's options page."
    *   **Test Case 1.2: Saving a Valid API Key**
        *   Go back to the extension's options page.
        *   Enter your valid Google Gemini API key into the input field.
        *   Click "Save Key."
        *   **Expected:** A status message "API Key saved!" should appear briefly.
        *   Reload the options page.
        *   **Expected:** The API key you entered should still be present in the input field.

**2. TOS Detection and Summarization:**
    *   Ensure a valid API key is saved (from step 1.2).
    *   **Test Case 2.1: Non-TOS Page**
        *   Navigate to a general website that is clearly not a TOS/Privacy Policy page (e.g., `https://www.mozilla.org` main page).
        *   Click the extension icon to open the popup.
        *   **Expected:** The popup should show the initial message "Detecting TOS..." and the "Help me understand this TOS!" button should *not* be visible, or be hidden. (The current implementation shows "Detecting TOS..." and hides the button if `content.js` doesn't send the `showSummarizeButton` message).
    *   **Test Case 2.2: TOS Page - Detection**
        *   Navigate to a known TOS or Privacy Policy page.
            *   Example 1: Google Terms of Service
            *   Example 2: Facebook Privacy Policy
            *   Example 3: A less common TOS page if you can find one.
        *   Click the extension icon to open the popup.
        *   **Expected:** The message "Detecting TOS..." should be gone, and the "Help me understand this TOS!" button should be visible.
    *   **Test Case 2.3: TOS Page - Summarization**
        *   On the TOS page, with the popup open and the "Help me understand this TOS!" button visible, click the button.
        *   **Expected:**
            *   The summary area should initially show "Summarizing...".
            *   After a short delay (API call), the summary area should be populated with a bullet-point summary of the TOS, focusing on risks, as requested in the prompt.
            *   Verify that the summary is relevant to the content of the TOS page.
    *   **Test Case 2.4: Summarization Error (e.g., Invalid API Key after initial save)**
        *   If possible, after a successful summarization, go to options and save an invalid/dummy API key.
        *   Go back to a TOS page and try to summarize again.
        *   **Expected:** The summary area should display an error message related to API failure (e.g., "API Error: 400..." or similar, depending on Gemini's response to a bad key).

**3. Text Extraction Robustness (Exploratory):**
    *   **Test Case 3.1: Complex TOS pages**
        *   Try the extension on TOS pages with complex layouts, iframes (though `document.body.innerText` won't access iframe content directly without more work), or dynamic content loading.
        *   **Expected:** The quality of the summary might vary. Note any pages where text extraction seems to fail or grab irrelevant content. This can help identify areas for improving `content.js`'s text extraction logic. (Current logic: `document.body.innerText`).

**Reporting Issues:**
*   Note down the test case number.
*   Describe the actual result.
*   Describe the expected result if different.
*   Include the URL of the page being tested.
*   Check the browser console (Ctrl+Shift+J or Cmd+Option+J) and the extension's background script console (from `about:debugging`) for any error messages and include them.

This manual testing will cover the primary user flows and interactions.
