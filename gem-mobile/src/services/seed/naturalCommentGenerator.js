/**
 * Gemral - Natural Comment Generator
 * Generates natural Vietnamese comments using templates and AI
 */

import {
  COMMENT_TEMPLATES,
  COMMENT_EMOJIS,
  COMMENT_TYPE_DISTRIBUTION,
  REPLY_TEMPLATES,
  TRADING_VARIABLES,
  CRYSTAL_VARIABLES,
  LOA_VARIABLES,
  getRandomItem,
  getRandomItems,
  getRandomNumber,
} from './seedDatasets';

// Gemini API configuration
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GEMINI_API_KEY = 'AIzaSyCymkgeL0ERDYYePtbV4zuL-BZ2mfMxehc';

// Topic keywords for detection
const TOPIC_KEYWORDS = {
  trading: ['btc', 'eth', 'crypto', 'trade', 'coin', 'chart', 'signal', 'entry', 'exit', 'profit', 'loss', 'bullish', 'bearish', 'pump', 'dump'],
  crystal: ['đá', 'crystal', 'thạch anh', 'amethyst', 'phong thuỷ', 'năng lượng', 'chakra', 'healing', 'mệnh'],
  loa: ['loa', 'manifest', 'affirmation', 'vũ trụ', 'gratitude', 'visualization', 'attract', 'luật hấp dẫn', 'tích cực'],
  education: ['học', 'khoá', 'course', 'kiến thức', 'chia sẻ', 'tips', 'hướng dẫn', 'guide'],
  wealth: ['tiền', 'giàu', 'wealth', 'đầu tư', 'invest', 'tài chính', 'thu nhập', 'passive'],
  affiliate: ['affiliate', 'commission', 'kiếm tiền', 'mmo', 'link', 'ref'],
};

// Question templates by topic
const QUESTION_TEMPLATES = {
  trading: [
    'entry ở đâu vậy bạn', 'stoploss bao nhiêu', 'target tiếp theo là bao nhiêu',
    'còn hold được không bạn', 'timeframe nào vậy', 'indicator gì vậy bạn',
  ],
  crystal: [
    'mua ở đâu vậy bạn', 'đá này hợp mệnh gì', 'cách sạc năng lượng như nào',
    'giá bao nhiêu vậy', 'có phải đá tự nhiên không', 'đeo tay nào vậy bạn',
  ],
  loa: [
    'làm bao lâu mới hiệu quả', 'có tips gì không bạn', 'mình mới bắt đầu nên làm gì',
    'visualize như thế nào', 'làm sao để không doubt',
  ],
  general: [
    'bạn có thể chia sẻ thêm không', 'làm sao để bắt đầu', 'có khó không bạn',
  ],
};

// Action templates by topic
const ACTION_TEMPLATES = {
  trading: ['vào lệnh', 'hold', 'DCA', 'scalp', 'swing', 'set stoploss'],
  crystal: ['sạc đá', 'đeo đá', 'mua thêm', 'thanh lọc'],
  loa: ['visualize', 'practice', 'affirm', 'manifest', 'meditate'],
  general: ['học', 'thử', 'bắt đầu', 'tìm hiểu'],
};

/**
 * Detect topic from post content
 * @param {string} content - Post content
 * @returns {string}
 */
export const detectTopic = (content) => {
  const lowerContent = content.toLowerCase();

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const matchCount = keywords.filter(keyword =>
      lowerContent.includes(keyword.toLowerCase())
    ).length;

    if (matchCount >= 2) {
      return topic;
    }
  }

  // Check for single strong matches
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()))) {
      return topic;
    }
  }

  return 'general';
};

/**
 * Get comment type based on distribution
 * @returns {string}
 */
const getCommentType = () => {
  const rand = Math.random();
  let cumulative = 0;

  for (const [type, weight] of Object.entries(COMMENT_TYPE_DISTRIBUTION)) {
    cumulative += weight;
    if (rand <= cumulative) {
      return type;
    }
  }

  return 'positive';
};

/**
 * Fill comment template with variables
 * @param {string} template - Comment template
 * @param {string} topic - Post topic
 * @returns {string}
 */
const fillCommentTemplate = (template, topic) => {
  const questions = QUESTION_TEMPLATES[topic] || QUESTION_TEMPLATES.general;
  const actions = ACTION_TEMPLATES[topic] || ACTION_TEMPLATES.general;

  let result = template
    .replace(/{emoji}/g, getRandomItem(COMMENT_EMOJIS))
    .replace(/{question}/g, getRandomItem(questions))
    .replace(/{action}/g, getRandomItem(actions))
    .replace(/{topic}/g, topic)
    .replace(/{point}/g, 'phần này')
    .replace(/{past_action}/g, `học về ${topic}`)
    .replace(/{observation}/g, 'hiệu quả');

  return result;
};

/**
 * Generate a single template-based comment
 * @param {string} topic - Post topic
 * @param {string} type - Comment type (optional)
 * @returns {string}
 */
export const generateTemplateComment = (topic = 'general', type = null) => {
  const commentType = type || getCommentType();
  const templates = COMMENT_TEMPLATES[commentType] || COMMENT_TEMPLATES.positive;
  const template = getRandomItem(templates);

  return fillCommentTemplate(template, topic);
};

/**
 * Generate multiple template-based comments
 * @param {Object} post - Post object
 * @param {number} count - Number of comments
 * @returns {Array<string>}
 */
export const generateComments = (post, count = 5) => {
  const topic = post.seed_topic || detectTopic(post.content);
  const comments = [];
  const usedTemplates = new Set();

  for (let i = 0; i < count; i++) {
    let comment;
    let attempts = 0;

    // Try to get unique comments
    do {
      comment = generateTemplateComment(topic);
      attempts++;
    } while (usedTemplates.has(comment) && attempts < 10);

    usedTemplates.add(comment);
    comments.push(comment);
  }

  return comments;
};

/**
 * Generate a reply to a comment
 * @param {Object} comment - Comment object
 * @param {string} topic - Post topic
 * @returns {string}
 */
export const generateReply = (comment, topic = 'general') => {
  const content = comment.content?.toLowerCase() || '';

  // Detect if it's a question
  const isQuestion = content.includes('?') ||
    content.includes('làm sao') ||
    content.includes('như thế nào') ||
    content.includes('ở đâu') ||
    content.includes('bao nhiêu');

  let templates;
  if (isQuestion) {
    templates = REPLY_TEMPLATES.to_question;
  } else if (content.includes('hay') || content.includes('tuyệt') || content.includes('cảm ơn')) {
    templates = REPLY_TEMPLATES.to_positive;
  } else if (content.includes('mình cũng') || content.includes('giống')) {
    templates = REPLY_TEMPLATES.to_sharing;
  } else {
    templates = REPLY_TEMPLATES.general;
  }

  let reply = getRandomItem(templates);

  // Fill variables
  const suggestions = {
    trading: ['xem thêm chart', 'đợi confirmation', 'set stoploss'],
    crystal: ['hỏi shop', 'tìm hiểu thêm về mệnh', 'cảm nhận năng lượng'],
    loa: ['thực hành đều đặn', 'tin tưởng vào process', 'viết gratitude journal'],
    general: ['tìm hiểu thêm', 'thử xem', 'kiên nhẫn'],
  };

  const answers = {
    trading: ['tuỳ vào risk tolerance của bạn', 'xem thêm trên chart', 'phụ thuộc vào market'],
    crystal: ['mình mua ở shop Gem', 'đá này hợp nhiều mệnh', 'cứ cảm nhận là biết'],
    loa: ['mình làm khoảng 21 ngày thấy hiệu quả', 'quan trọng là consistency', 'tin tưởng là chính'],
    general: ['mình cũng đang tìm hiểu', 'thử xem rồi biết', 'ai cũng có thể làm được'],
  };

  const recommendations = {
    trading: ['học thêm về TA', 'quản lý vốn tốt', 'kiên nhẫn chờ setup'],
    crystal: ['mua đá tự nhiên', 'chọn đá hợp mệnh', 'sạc đá định kỳ'],
    loa: ['visualization mỗi ngày', 'gratitude journal', 'tin tưởng vào vũ trụ'],
    general: ['học hỏi từ cộng đồng', 'thực hành đều đặn', 'kiên trì'],
  };

  const topicSuggestions = suggestions[topic] || suggestions.general;
  const topicAnswers = answers[topic] || answers.general;
  const topicRecommendations = recommendations[topic] || recommendations.general;

  reply = reply
    .replace(/{emoji}/g, getRandomItem(COMMENT_EMOJIS))
    .replace(/{suggestion}/g, getRandomItem(topicSuggestions))
    .replace(/{answer}/g, getRandomItem(topicAnswers))
    .replace(/{recommendation}/g, getRandomItem(topicRecommendations))
    .replace(/{action}/g, getRandomItem(ACTION_TEMPLATES[topic] || ACTION_TEMPLATES.general))
    .replace(/{explanation}/g, getRandomItem(topicAnswers));

  return reply;
};

// Rate limit tracking
let lastAPICall = 0;
let consecutiveErrors = 0;
const MIN_API_INTERVAL = 2000; // Minimum 2 seconds between API calls
const MAX_RETRIES = 3;

/**
 * Sleep helper with exponential backoff
 * @param {number} attempt - Current retry attempt
 * @returns {Promise<void>}
 */
const sleepWithBackoff = async (attempt) => {
  const baseDelay = 2000; // 2 seconds base
  const delay = baseDelay * Math.pow(2, attempt); // Exponential: 2s, 4s, 8s, 16s...
  const jitter = Math.random() * 1000; // Add random jitter up to 1s
  await new Promise(resolve => setTimeout(resolve, delay + jitter));
};

/**
 * Ensure minimum interval between API calls
 */
const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastCall = now - lastAPICall;
  if (timeSinceLastCall < MIN_API_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_API_INTERVAL - timeSinceLastCall));
  }
  lastAPICall = Date.now();
};

/**
 * Generate AI comment using Gemini with retry logic
 * @param {Object} post - Post object
 * @param {string} apiKey - Gemini API key (optional)
 * @returns {Promise<string|null>}
 */
export const generateWithAI = async (post, apiKey = GEMINI_API_KEY) => {
  // Skip AI if too many consecutive errors (likely rate limited)
  if (consecutiveErrors >= 5) {
    console.log('[CommentGenerator] Skipping AI due to rate limit, using template');
    return null;
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Wait for rate limit
      await waitForRateLimit();

      const topic = post.seed_topic || detectTopic(post.content);
      const postPreview = post.content.substring(0, 300);

      const prompt = `Bạn là một user Việt Nam đang comment trên một bài viết về ${topic} trong một cộng đồng về trading, đá phong thuỷ và luật hấp dẫn.

Bài viết:
"${postPreview}"

Hãy viết MỘT comment ngắn gọn (1-2 câu), tự nhiên như một người Việt Nam bình thường comment.
- Có thể dùng emoji phù hợp
- Không quá formal, thân thiện
- Có thể là: khen ngợi, hỏi thêm, chia sẻ kinh nghiệm tương tự, hoặc đồng ý
- Viết bằng tiếng Việt tự nhiên

Chỉ trả về comment, không giải thích.`;

      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
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
            maxOutputTokens: 100,
          },
        }),
      });

      // Handle rate limit (429)
      if (response.status === 429) {
        console.warn(`[CommentGenerator] Rate limited (429), attempt ${attempt + 1}/${MAX_RETRIES}`);
        consecutiveErrors++;

        if (attempt < MAX_RETRIES - 1) {
          await sleepWithBackoff(attempt);
          continue;
        }
        return null;
      }

      if (!response.ok) {
        console.error('[CommentGenerator] Gemini API error:', response.status);
        consecutiveErrors++;
        return null;
      }

      // Success - reset error counter
      consecutiveErrors = 0;

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        return null;
      }

      // Clean up the response
      let comment = generatedText.trim();
      // Remove quotes if wrapped
      if (comment.startsWith('"') && comment.endsWith('"')) {
        comment = comment.slice(1, -1);
      }

      return comment;
    } catch (error) {
      console.error('[CommentGenerator] AI generation error:', error);
      consecutiveErrors++;

      if (attempt < MAX_RETRIES - 1) {
        await sleepWithBackoff(attempt);
        continue;
      }
      return null;
    }
  }

  return null;
};

/**
 * Generate mixed comments (85% template, 15% AI to avoid rate limits)
 * @param {Object} post - Post object
 * @param {number} count - Number of comments
 * @param {string} apiKey - Gemini API key (optional)
 * @returns {Promise<Array<{content: string, isAI: boolean}>>}
 */
export const generateMixed = async (post, count = 5, apiKey = GEMINI_API_KEY) => {
  const comments = [];
  const topic = post.seed_topic || detectTopic(post.content);

  // Only 15% AI comments to reduce API calls (was 30%)
  // For 18 comments: ~2-3 AI comments max
  const aiCount = Math.min(Math.floor(count * 0.15), 2); // Cap at 2 AI comments per post
  const templateCount = count - aiCount;

  // Generate template comments first
  const templateComments = generateComments(post, templateCount);
  templateComments.forEach(content => {
    comments.push({ content, isAI: false });
  });

  // Generate AI comments (with rate limiting built into generateWithAI)
  for (let i = 0; i < aiCount; i++) {
    try {
      const aiComment = await generateWithAI(post, apiKey);
      if (aiComment) {
        comments.push({ content: aiComment, isAI: true });
      } else {
        // Fallback to template if AI fails
        comments.push({ content: generateTemplateComment(topic), isAI: false });
      }
    } catch (error) {
      // Fallback to template
      comments.push({ content: generateTemplateComment(topic), isAI: false });
    }
  }

  // Shuffle comments
  return comments.sort(() => Math.random() - 0.5);
};

/**
 * Generate AI reply using Gemini
 * @param {Object} comment - Original comment
 * @param {Object} post - Parent post
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<string|null>}
 */
export const generateAIReply = async (comment, post, apiKey = GEMINI_API_KEY) => {
  try {
    const topic = post?.seed_topic || detectTopic(post?.content || '');

    const prompt = `Bạn là author của một bài viết về ${topic}. Một user đã comment:
"${comment.content}"

Hãy viết MỘT reply ngắn gọn (1-2 câu), thân thiện và hữu ích.
- Nếu là câu hỏi, trả lời ngắn gọn
- Nếu là lời khen, cảm ơn
- Viết bằng tiếng Việt tự nhiên, có thể dùng emoji

Chỉ trả về reply, không giải thích.`;

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
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
          maxOutputTokens: 80,
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (reply?.startsWith('"') && reply?.endsWith('"')) {
      reply = reply.slice(1, -1);
    }

    return reply || null;
  } catch (error) {
    console.error('[CommentGenerator] AI reply error:', error);
    return null;
  }
};

export default {
  detectTopic,
  generateTemplateComment,
  generateComments,
  generateReply,
  generateWithAI,
  generateMixed,
  generateAIReply,
};
