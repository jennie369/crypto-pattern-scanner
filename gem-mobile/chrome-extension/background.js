/**
 * Gemral Comment Helper - Background Service Worker
 * Handles API calls and keyboard shortcuts
 */

// Gemini API endpoint
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Generate comment using Gemini API
 * @param {string} postContent - The post content to generate a comment for
 * @param {Object} settings - User settings
 * @returns {Promise<Array<string>>} - Array of comment suggestions
 */
async function generateComment(postContent, settings) {
  if (!settings.apiKey) {
    throw new Error('API key not configured');
  }

  const stylePrompts = {
    friendly: 'thân thiện, casual, như bạn bè',
    professional: 'chuyên nghiệp, lịch sự, formal',
    enthusiastic: 'hào hứng, phấn khích, năng lượng cao',
    curious: 'tò mò, hay hỏi, muốn tìm hiểu thêm',
  };

  const languagePrompts = {
    vi: 'Viết bằng tiếng Việt tự nhiên',
    en: 'Write in natural English',
    both: 'Có thể mix tiếng Việt và tiếng Anh tự nhiên',
  };

  const emojiInstruction = settings.includeEmojis
    ? 'Có thể dùng 1-2 emoji phù hợp.'
    : 'KHÔNG dùng emoji.';

  const countInstruction = settings.multipleOptions
    ? 'Viết 3 comment khác nhau, mỗi comment trên 1 dòng mới, đánh số 1. 2. 3.'
    : 'Chỉ viết 1 comment.';

  const prompt = `Bạn là một người dùng bình thường đang comment trên Facebook.

Bài viết:
"${postContent.substring(0, 500)}"

Hãy viết comment với phong cách: ${stylePrompts[settings.commentStyle] || stylePrompts.friendly}
${languagePrompts[settings.language] || languagePrompts.vi}
${emojiInstruction}
${countInstruction}

Yêu cầu:
- Comment ngắn gọn (1-3 câu)
- Tự nhiên như người thật
- Không quá formal hoặc giả tạo
- Có thể: khen ngợi, đồng tình, hỏi thêm, chia sẻ kinh nghiệm

Chỉ trả về comment, không giải thích.`;

  const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${settings.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt,
        }],
      }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 300,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!generatedText) {
    throw new Error('No response from API');
  }

  // Parse multiple comments if present
  const comments = [];
  if (settings.multipleOptions) {
    const lines = generatedText.split('\n').filter(line => line.trim());
    for (const line of lines) {
      // Remove numbering prefix
      const cleaned = line.replace(/^\d+\.\s*/, '').trim();
      if (cleaned) {
        comments.push(cleaned);
      }
    }
  }

  if (comments.length === 0) {
    comments.push(generatedText);
  }

  return comments;
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateComment') {
    chrome.storage.sync.get(null, async (settings) => {
      try {
        const comments = await generateComment(request.postContent, settings);

        // Update stats
        const today = new Date().toDateString();
        if (settings.lastResetDate !== today) {
          settings.commentsToday = 0;
          settings.lastResetDate = today;
        }
        settings.commentsToday = (settings.commentsToday || 0) + 1;
        settings.commentsTotal = (settings.commentsTotal || 0) + 1;
        await chrome.storage.sync.set({
          commentsToday: settings.commentsToday,
          commentsTotal: settings.commentsTotal,
          lastResetDate: settings.lastResetDate,
        });

        sendResponse({ success: true, comments });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    });
    return true; // Keep message channel open for async response
  }

  if (request.action === 'getSettings') {
    chrome.storage.sync.get(null, (settings) => {
      sendResponse(settings);
    });
    return true;
  }
});

// Register keyboard shortcut command
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'generate-comment') {
    // Send message to active tab's content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'triggerGenerate' });
    }
  }
});

// Context menu for right-click generation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'generateComment',
    title: 'Generate Comment with Gemral',
    contexts: ['selection', 'page'],
    documentUrlPatterns: ['https://www.facebook.com/*', 'https://m.facebook.com/*'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'generateComment') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'triggerGenerate',
      selectedText: info.selectionText,
    });
  }
});
