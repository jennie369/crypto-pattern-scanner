# Gemral Comment Helper - Chrome Extension

AI-powered comment suggestion tool for Facebook and social media posts.

## Features

- **AI Comment Generation**: Uses Gemini AI to generate natural Vietnamese comments
- **Multiple Suggestions**: Get 3 different comment options to choose from
- **Style Options**: Choose from friendly, professional, enthusiastic, or curious styles
- **Language Support**: Vietnamese, English, or mixed comments
- **Keyboard Shortcut**: Quick access with `Ctrl+Shift+G`
- **Right-Click Menu**: Generate comments via context menu
- **Stats Tracking**: Track daily and total comments generated

## Installation

### Development Mode

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension icon will appear in your toolbar

### Setting Up

1. Click the extension icon in your toolbar
2. Enter your Gemini API key (get one at https://makersuite.google.com/app/apikey)
3. Configure your preferred comment style and language
4. Click "Save Settings"
5. Click "Test Connection" to verify API access

## Usage

### On Facebook

1. Navigate to any Facebook post
2. Look for the `💎 AI` button near the comment box
3. Click to generate comment suggestions
4. Click "Use" on your preferred suggestion to insert it

### Keyboard Shortcut

- Press `Ctrl+Shift+G` while viewing a post to generate suggestions

### Context Menu

- Right-click on any post and select "Generate Comment with Gemral"

## Icons Required

Create the following icon files in the `icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

Recommended: Use a gold/yellow gem or diamond icon matching the Gemral brand.

## File Structure

```
chrome-extension/
├── manifest.json       # Extension configuration
├── popup.html         # Settings popup UI
├── popup.js           # Settings popup logic
├── background.js      # Service worker (API calls)
├── content.js         # Facebook page injection
├── content.css        # Injected styles
├── README.md          # This file
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## API Key Security

- Your API key is stored in Chrome's sync storage
- It's never sent to any server except Google's Gemini API
- The key is required for the extension to function

## Permissions Explained

- `activeTab`: To read post content on the current tab
- `storage`: To save your settings
- `contextMenus`: For right-click menu functionality
- `host_permissions`: Access to Facebook and Gemini API

## Troubleshooting

### Comments not generating
- Check that your API key is valid
- Use "Test Connection" in settings
- Ensure you're on a supported site (Facebook)

### Button not appearing
- Refresh the page
- Make sure the extension is enabled
- Check for JavaScript errors in console

### Style mismatch
- Adjust the "Comment Style" setting in popup
- Try different language options

## Support

For issues and feature requests, visit:
https://github.com/your-repo/gemral-comment-helper

## License

MIT License - Feel free to modify and distribute.
