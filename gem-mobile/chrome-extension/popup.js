/**
 * Gemral Comment Helper - Popup Script
 * Handles settings and UI interactions in the extension popup
 */

// Default settings
const DEFAULT_SETTINGS = {
  apiKey: '',
  commentStyle: 'friendly',
  language: 'vi',
  autoSuggest: true,
  includeEmojis: true,
  multipleOptions: true,
  commentsToday: 0,
  commentsTotal: 0,
  lastResetDate: new Date().toDateString(),
};

// Load settings from storage
async function loadSettings() {
  const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);

  // Reset daily counter if it's a new day
  if (result.lastResetDate !== new Date().toDateString()) {
    result.commentsToday = 0;
    result.lastResetDate = new Date().toDateString();
    await chrome.storage.sync.set(result);
  }

  // Update UI
  document.getElementById('apiKey').value = result.apiKey || '';
  document.getElementById('commentStyle').value = result.commentStyle;
  document.getElementById('language').value = result.language;
  document.getElementById('autoSuggest').checked = result.autoSuggest;
  document.getElementById('includeEmojis').checked = result.includeEmojis;
  document.getElementById('multipleOptions').checked = result.multipleOptions;
  document.getElementById('commentsToday').textContent = result.commentsToday;
  document.getElementById('commentsTotal').textContent = result.commentsTotal;

  // Update status badge
  const statusBadge = document.getElementById('statusBadge');
  if (result.apiKey) {
    statusBadge.textContent = 'Active';
    statusBadge.className = 'status-badge active';
  } else {
    statusBadge.textContent = 'No API Key';
    statusBadge.className = 'status-badge inactive';
  }
}

// Save settings to storage
async function saveSettings() {
  const settings = {
    apiKey: document.getElementById('apiKey').value.trim(),
    commentStyle: document.getElementById('commentStyle').value,
    language: document.getElementById('language').value,
    autoSuggest: document.getElementById('autoSuggest').checked,
    includeEmojis: document.getElementById('includeEmojis').checked,
    multipleOptions: document.getElementById('multipleOptions').checked,
  };

  await chrome.storage.sync.set(settings);

  // Show success feedback
  const saveBtn = document.getElementById('saveBtn');
  const originalText = saveBtn.textContent;
  saveBtn.textContent = '✓ Saved!';
  saveBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';

  setTimeout(() => {
    saveBtn.textContent = originalText;
    saveBtn.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
    loadSettings(); // Reload to update status
  }, 1500);
}

// Test Gemini API connection
async function testConnection() {
  const testBtn = document.getElementById('testBtn');
  const apiKey = document.getElementById('apiKey').value.trim();

  if (!apiKey) {
    alert('Please enter your Gemini API key first.');
    return;
  }

  testBtn.textContent = 'Testing...';
  testBtn.disabled = true;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say "OK" if you can read this.',
            }],
          }],
          generationConfig: {
            maxOutputTokens: 10,
          },
        }),
      }
    );

    if (response.ok) {
      testBtn.textContent = '✓ Connected!';
      testBtn.style.background = 'rgba(76, 175, 80, 0.3)';
    } else {
      const error = await response.json();
      throw new Error(error.error?.message || 'Connection failed');
    }
  } catch (error) {
    testBtn.textContent = '✗ Failed';
    testBtn.style.background = 'rgba(255, 87, 87, 0.3)';
    alert('Connection failed: ' + error.message);
  }

  setTimeout(() => {
    testBtn.textContent = 'Test Connection';
    testBtn.style.background = 'rgba(255, 255, 255, 0.1)';
    testBtn.disabled = false;
  }, 2000);
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('testBtn').addEventListener('click', testConnection);
});
