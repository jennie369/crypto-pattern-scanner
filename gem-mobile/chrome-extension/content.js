/**
 * Gemral Comment Helper - Content Script
 * Injects comment generation UI into Facebook pages
 */

// State
let currentSettings = {};
let suggestionPopup = null;
let currentPostElement = null;

// Initialize
async function init() {
  // Load settings
  chrome.runtime.sendMessage({ action: 'getSettings' }, (settings) => {
    currentSettings = settings || {};
  });

  // Create suggestion popup
  createSuggestionPopup();

  // Listen for messages from background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'triggerGenerate') {
      handleGenerateRequest(request.selectedText);
    }
  });

  // Add generate buttons to posts (with debounce for dynamic content)
  const observer = new MutationObserver(debounce(addGenerateButtons, 500));
  observer.observe(document.body, { childList: true, subtree: true });

  // Initial scan
  addGenerateButtons();

  console.log('[Gemral] Comment Helper initialized');
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Create the floating suggestion popup
function createSuggestionPopup() {
  suggestionPopup = document.createElement('div');
  suggestionPopup.id = 'gemral-suggestion-popup';
  suggestionPopup.innerHTML = `
    <div class="gemral-popup-header">
      <span class="gemral-logo">💎</span>
      <span class="gemral-title">Gemral Suggestions</span>
      <button class="gemral-close">&times;</button>
    </div>
    <div class="gemral-popup-body">
      <div class="gemral-loading">
        <div class="gemral-spinner"></div>
        <span>Generating comments...</span>
      </div>
      <div class="gemral-suggestions"></div>
    </div>
  `;

  document.body.appendChild(suggestionPopup);

  // Close button handler
  suggestionPopup.querySelector('.gemral-close').addEventListener('click', () => {
    hideSuggestionPopup();
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (suggestionPopup.classList.contains('visible') &&
        !suggestionPopup.contains(e.target) &&
        !e.target.classList.contains('gemral-generate-btn')) {
      hideSuggestionPopup();
    }
  });
}

// Show suggestion popup near element
function showSuggestionPopup(targetElement) {
  const rect = targetElement.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  suggestionPopup.style.top = `${rect.bottom + scrollTop + 8}px`;
  suggestionPopup.style.left = `${Math.max(10, rect.left + scrollLeft)}px`;
  suggestionPopup.classList.add('visible');

  // Show loading state
  suggestionPopup.querySelector('.gemral-loading').style.display = 'flex';
  suggestionPopup.querySelector('.gemral-suggestions').innerHTML = '';
}

// Hide suggestion popup
function hideSuggestionPopup() {
  suggestionPopup.classList.remove('visible');
}

// Display suggestions in popup
function displaySuggestions(comments) {
  const loading = suggestionPopup.querySelector('.gemral-loading');
  const suggestionsContainer = suggestionPopup.querySelector('.gemral-suggestions');

  loading.style.display = 'none';
  suggestionsContainer.innerHTML = '';

  comments.forEach((comment, index) => {
    const suggestionElement = document.createElement('div');
    suggestionElement.className = 'gemral-suggestion-item';
    suggestionElement.innerHTML = `
      <span class="gemral-suggestion-text">${escapeHtml(comment)}</span>
      <button class="gemral-use-btn" data-index="${index}">Use</button>
    `;

    suggestionElement.querySelector('.gemral-use-btn').addEventListener('click', () => {
      useComment(comment);
    });

    suggestionsContainer.appendChild(suggestionElement);
  });
}

// Display error in popup
function displayError(error) {
  const loading = suggestionPopup.querySelector('.gemral-loading');
  const suggestionsContainer = suggestionPopup.querySelector('.gemral-suggestions');

  loading.style.display = 'none';
  suggestionsContainer.innerHTML = `
    <div class="gemral-error">
      <span>❌ ${escapeHtml(error)}</span>
      <button class="gemral-retry-btn">Retry</button>
    </div>
  `;

  suggestionsContainer.querySelector('.gemral-retry-btn').addEventListener('click', () => {
    generateCommentForPost(currentPostElement);
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add generate buttons to Facebook posts
function addGenerateButtons() {
  // Find all posts that don't have our button yet
  const posts = document.querySelectorAll('[data-pagelet^="FeedUnit_"], [role="article"]');

  posts.forEach((post) => {
    if (post.querySelector('.gemral-generate-btn')) return;

    // Find comment input area
    const commentArea = post.querySelector('[contenteditable="true"], [data-lexical-editor="true"]');
    if (!commentArea) return;

    // Find the comment form container
    const commentForm = commentArea.closest('form') || commentArea.parentElement;
    if (!commentForm) return;

    // Create generate button
    const generateBtn = document.createElement('button');
    generateBtn.className = 'gemral-generate-btn';
    generateBtn.innerHTML = '💎 AI';
    generateBtn.title = 'Generate comment with Gemral';

    generateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      currentPostElement = post;
      showSuggestionPopup(generateBtn);
      generateCommentForPost(post);
    });

    // Insert button next to comment area
    try {
      const container = document.createElement('div');
      container.className = 'gemral-btn-container';
      container.appendChild(generateBtn);

      // Try to find a good insertion point
      const submitBtn = commentForm.querySelector('[type="submit"], [aria-label*="Comment"], [aria-label*="Bình luận"]');
      if (submitBtn && submitBtn.parentElement) {
        submitBtn.parentElement.insertBefore(container, submitBtn);
      } else {
        commentForm.appendChild(container);
      }
    } catch (e) {
      console.warn('[Gemral] Could not insert button:', e);
    }
  });
}

// Extract post content from a post element
function extractPostContent(postElement) {
  let content = '';

  // Try various Facebook selectors
  const contentSelectors = [
    '[data-ad-preview="message"]',
    '[data-ad-comet-preview="message"]',
    '[dir="auto"]',
    '.userContent',
    '[data-testid="post_message"]',
  ];

  for (const selector of contentSelectors) {
    const element = postElement.querySelector(selector);
    if (element && element.textContent.trim()) {
      content = element.textContent.trim();
      break;
    }
  }

  // Fallback: get all text from post
  if (!content) {
    content = postElement.innerText.substring(0, 1000);
  }

  return content;
}

// Generate comment for a post
async function generateCommentForPost(postElement) {
  const postContent = extractPostContent(postElement);

  if (!postContent || postContent.length < 10) {
    displayError('Could not extract post content');
    return;
  }

  try {
    chrome.runtime.sendMessage(
      { action: 'generateComment', postContent },
      (response) => {
        if (response.success) {
          displaySuggestions(response.comments);
        } else {
          displayError(response.error || 'Generation failed');
        }
      }
    );
  } catch (error) {
    displayError(error.message);
  }
}

// Use a generated comment
function useComment(comment) {
  if (!currentPostElement) return;

  // Find comment input
  const commentInput = currentPostElement.querySelector('[contenteditable="true"], [data-lexical-editor="true"]');
  if (!commentInput) {
    // Try to copy to clipboard instead
    navigator.clipboard.writeText(comment).then(() => {
      alert('Comment copied to clipboard! Paste it manually.');
    });
    hideSuggestionPopup();
    return;
  }

  // Focus and set content
  commentInput.focus();

  // For contenteditable elements
  if (commentInput.hasAttribute('contenteditable')) {
    commentInput.innerHTML = '';
    const textNode = document.createTextNode(comment);
    commentInput.appendChild(textNode);

    // Trigger input event
    commentInput.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // For Lexical editor (newer Facebook)
  if (commentInput.hasAttribute('data-lexical-editor')) {
    // Use clipboard approach for Lexical
    navigator.clipboard.writeText(comment).then(() => {
      document.execCommand('paste');
    });
  }

  hideSuggestionPopup();
}

// Handle generate request (from keyboard shortcut or context menu)
function handleGenerateRequest(selectedText) {
  // Find focused or hovered post
  const activeElement = document.activeElement;
  const hoveredPost = document.querySelector('[role="article"]:hover, [data-pagelet^="FeedUnit_"]:hover');

  let targetPost = null;

  if (activeElement) {
    targetPost = activeElement.closest('[role="article"], [data-pagelet^="FeedUnit_"]');
  }

  if (!targetPost && hoveredPost) {
    targetPost = hoveredPost;
  }

  if (!targetPost) {
    // Try to find any visible post
    const visiblePosts = document.querySelectorAll('[role="article"], [data-pagelet^="FeedUnit_"]');
    for (const post of visiblePosts) {
      const rect = post.getBoundingClientRect();
      if (rect.top >= 0 && rect.top < window.innerHeight) {
        targetPost = post;
        break;
      }
    }
  }

  if (targetPost) {
    currentPostElement = targetPost;

    // Find generate button or create temporary element for popup position
    const generateBtn = targetPost.querySelector('.gemral-generate-btn');
    if (generateBtn) {
      showSuggestionPopup(generateBtn);
    } else {
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.top = targetPost.getBoundingClientRect().top + window.scrollY + 'px';
      tempElement.style.left = targetPost.getBoundingClientRect().left + 'px';
      document.body.appendChild(tempElement);
      showSuggestionPopup(tempElement);
      tempElement.remove();
    }

    generateCommentForPost(targetPost);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
