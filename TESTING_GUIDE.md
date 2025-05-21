# Manual Testing Guide for TOS Summarizer Extension

This guide outlines the steps to manually test the core functionality of the TOS Summarizer Firefox extension.

## Prerequisites

1.  **Firefox browser installed.**
2.  **The TOS Summarizer extension loaded into Firefox.**
    *   Example method: Navigate to `about:debugging` in Firefox.
    *   Click on "This Firefox".
    *   Click "Load Temporary Add-on".
    *   Select the `manifest.json` file from the extension's directory.
3.  **A valid Google Gemini API key.**

## Testing Steps

### 1. API Key Configuration

*   **Accessing the Options Page:**
    1.  Right-click the extension icon in the Firefox toolbar.
    2.  Select "Manage Extension."
    3.  Click on the three dots (...) for the "TOS Summarizer" extension and select "Options."
    *   Alternatively, find the extension in `about:addons`, then click "Preferences" / "Options" for the TOS Summarizer.

*   **Test Case 1.1: No API Key Set (Initial State or Cleared Key)**
    1.  Ensure no API key is currently saved (or delete any existing key from the options page and click "Save Key").
    2.  Navigate to a known TOS/Privacy Policy page (e.g., search for "Google Terms of Service").
    3.  Click the extension icon to open the popup.
    4.  **Expected:** The popup should display the "Help me understand this TOS!" button.
    5.  Click the button.
    6.  **Expected:** The summary area should display an error message similar to: `API Key not configured. Please set it in the extension's options page.`

*   **Test Case 1.2: Saving a Valid API Key**
    1.  Go to the extension's options page.
    2.  Enter your valid Google Gemini API key into the input field.
    3.  Click "Save Key."
    4.  **Expected:** A status message "API Key saved!" should appear briefly.
    5.  Reload the options page (e.g., by closing and reopening it, or refreshing if it's in its own tab).
    6.  **Expected:** The API key you entered should still be present in the input field.

### 2. TOS Detection and Summarization

*   Ensure a valid API key is saved (as per Test Case 1.2).

*   **Test Case 2.1: Non-TOS Page**
    1.  Navigate to a general website that is clearly not a TOS/Privacy Policy page (e.g., the main page of `https://www.mozilla.org`).
    2.  Click the extension icon to open the popup.
    3.  **Expected:** The popup should show the initial message "Detecting TOS..." and the "Help me understand this TOS!" button should *not* be visible.

*   **Test Case 2.2: TOS Page - Detection**
    1.  Navigate to a known TOS or Privacy Policy page.
        *   Example 1: Google Terms of Service
        *   Example 2: Facebook Privacy Policy
        *   Example 3: A less common TOS page.
    2.  Click the extension icon to open the popup.
    3.  **Expected:** The "Detecting TOS..." message should be gone, and the "Help me understand this TOS!" button should be visible.

*   **Test Case 2.3: TOS Page - Summarization**
    1.  On the TOS page, with the popup open and the "Help me understand this TOS!" button visible, click the button.
    2.  **Expected:**
        *   The summary area should initially display "Summarizing...".
        *   After a short delay (API call duration), the summary area should be populated with a bullet-point summary of the TOS, focusing on risks, as per the API prompt.
        *   Verify that the summary is relevant to the content of the TOS page.

*   **Test Case 2.4: Summarization Error (e.g., Invalid API Key after initial save)**
    1.  If possible, after a successful summarization, go to the extension's options page and save an invalid/dummy API key.
    2.  Return to a TOS page and attempt to summarize again.
    3.  **Expected:** The summary area should display an error message related to API failure (e.g., `API Error: 400...` or similar, depending on the Gemini API's response to an invalid key).

### 3. Text Extraction Robustness (Exploratory)

*   **Test Case 3.1: Complex TOS Pages**
    1.  Test the extension on TOS pages with various structures:
        *   Pages with complex layouts.
        *   Pages potentially using iframes for TOS content (Note: the current text extraction `document.body.innerText` will likely *not* access iframe content directly; this is a known limitation).
        *   Pages with significant dynamic content loading.
    2.  **Expected:** The quality and completeness of the summary might vary. Note any pages where text extraction seems to fail, grabs irrelevant content, or misses significant portions of the TOS. This information can be useful for identifying future improvements to the `content.js` text extraction logic.

## Reporting Issues

When reporting issues, please include:
*   The **Test Case number** (e.g., Test Case 2.3).
*   A clear description of the **Actual Result**.
*   A clear description of the **Expected Result** if it differs from the actual.
*   The **URL of the page** being tested.
*   Any **error messages** from:
    *   The browser console (usually accessed via `Ctrl+Shift+J` or `Cmd+Option+J`).
    *   The extension's background script console (accessible from `about:debugging` by inspecting the extension).

This manual testing guide will help ensure the primary user flows and interactions are functioning as expected.
