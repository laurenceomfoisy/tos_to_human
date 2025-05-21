# TOS to Human

A browser extension for Chrome that makes Terms of Service understandable to humans by using AI. The extension detects when you're reading Terms of Service or Privacy Policies and offers to summarize them in clear, understandable bullet points, highlighting the most important information and potential risks.

## Features

- Automatically detects Terms of Service, Privacy Policies, and similar legal pages
- Provides a simple "Help me understand this TOS!" button
- Uses Google's Gemini 2.0 Flash AI model to create human-readable summaries
- Highlights important information and potential risks in the terms
- Works on most websites with legal agreements
- Open source (FOSS)

## How to Use

1. Install the extension
2. Navigate to any Terms of Service or Privacy Policy page
3. Click the extension icon in your toolbar
4. A new tab will open with the TOS Summarizer interface
5. Enter your Google Gemini API key and click "Save API Key"
6. Click "Help me understand this TOS!"
7. Get a clear, bullet-pointed summary of the document

## Options

You have two ways to use this extension:

1. **Free Option**: Provide your own Google Gemini API key
   - Get a Gemini API key from [Google AI Studio](https://ai.google.dev/)
   - Enter your API key in the extension tab:
     1. Click on the extension icon in your toolbar (this will open a new tab)
     2. Enter your API key in the field provided
     3. Click "Save API Key"
   - Use the extension without any subscription fees

2. **Subscription Option**: $2/month (coming soon)
   - Use our shared API key without usage limits
   - Support the ongoing development of this open-source project
   - No need to create or manage your own API key

## Why This Matters

Legal agreements like Terms of Service and Privacy Policies are often deliberately written to be difficult for ordinary people to understand. This extension helps level the playing field by:

- Translating legal jargon into plain language
- Highlighting the most important information
- Identifying potential risks or concerning terms
- Making it easier to understand what you're agreeing to

## Privacy

- Your data is only sent to Google's Gemini API for summarization purposes
- The extension does not collect or store any personal information
- When using your own API key, you have complete control over your data

## Technical Details

- Built for Firefox using WebExtensions API
- Uses Google's Gemini 2.0 Flash API for AI-powered summarization
- Compatible with most modern websites
- Automatically detects TOS pages through URL, title, and content analysis

## Development

To set up your development environment:

1. Clone this repository
2. Load the extension in Firefox (about:debugging > This Firefox > Load Temporary Add-on)
3. Navigate to a Terms of Service page to test

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built to empower humans in understanding what they agree to online.
