/**
 * Gemral - Chat History Service
 *
 * Manages chat conversation persistence using Supabase
 * - Create, save, load, delete conversations
 * - Auto-generate titles and previews
 * - Pagination support for history listing
 */

import { supabase } from './supabase';

const TABLE_NAME = 'chatbot_conversations';
const PAGE_SIZE = 20;

/**
 * Generate title from first user message
 * @param {Array} messages - Array of message objects
 * @returns {string} - Generated title (max 50 chars)
 */
const generateTitle = (messages) => {
  const firstUserMessage = messages.find(m => m.type === 'user');
  if (firstUserMessage && firstUserMessage.text) {
    const text = firstUserMessage.text.trim();
    if (text.length <= 50) return text;
    return text.substring(0, 47) + '...';
  }

  // Fallback: date-based title
  const date = new Date();
  return `Chat - ${date.toLocaleDateString('vi-VN')}`;
};

/**
 * Generate preview from last message
 * @param {Array} messages - Array of message objects
 * @returns {string} - Preview text (max 100 chars)
 */
const generatePreview = (messages) => {
  if (!messages || messages.length === 0) return '';

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || !lastMessage.text) return '';

  const text = lastMessage.text.trim();
  if (text.length <= 100) return text;
  return text.substring(0, 97) + '...';
};

/**
 * Create a new conversation
 * @param {string} userId - User ID
 * @param {Array} messages - Initial messages (optional)
 * @returns {Object} - Created conversation
 */
const createConversation = async (userId, messages = []) => {
  try {
    // Ensure messages is a valid array - Supabase requires non-empty JSON
    const validMessages = Array.isArray(messages) && messages.length > 0
      ? messages
      : []; // Empty array is valid JSON, but we need to ensure it's properly formatted

    const title = validMessages.length > 0 ? generateTitle(validMessages) : 'New Chat';
    const preview = generatePreview(validMessages);

    // For empty messages, we still need valid JSON - use empty array
    const messagesJson = validMessages.length > 0 ? validMessages : [];

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        user_id: userId,
        messages: messagesJson,
        title: title,
        preview: preview,
        message_count: validMessages.length,
        last_message_at: new Date().toISOString(),
        is_archived: false,
      })
      .select()
      .single();

    if (error) throw error;

    console.log('[ChatHistory] Created conversation:', data.id);
    return data;
  } catch (error) {
    console.error('[ChatHistory] Create error:', error);
    throw error;
  }
};

/**
 * Save/update an existing conversation
 * @param {string} conversationId - Conversation ID
 * @param {Array} messages - Updated messages array
 * @param {string} userId - User ID for validation
 * @returns {Object} - Updated conversation
 */
const saveConversation = async (conversationId, messages, userId) => {
  try {
    // Validate messages array - skip save if invalid
    if (!Array.isArray(messages)) {
      console.warn('[ChatHistory] Invalid messages array, skipping save');
      return null;
    }

    // Ensure messages are serializable (remove any functions, circular refs)
    const cleanMessages = messages.map(m => ({
      id: m?.id || '',
      type: m?.type || 'user',
      text: m?.text || '',
      timestamp: m?.timestamp || new Date().toISOString(),
      ...(m?.quickActions && { quickActions: m.quickActions }),
      ...(m?.data && { data: m.data }),
    })).filter(m => m.text); // Only keep messages with text

    // Skip save if no valid messages
    if (cleanMessages.length === 0) {
      console.warn('[ChatHistory] No valid messages to save, skipping');
      return null;
    }

    const title = generateTitle(cleanMessages);
    const preview = generatePreview(cleanMessages);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        messages: cleanMessages,
        title: title,
        preview: preview,
        message_count: cleanMessages.length,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .eq('user_id', userId) // Security: ensure user owns conversation
      .select()
      .single();

    if (error) throw error;

    console.log('[ChatHistory] Saved conversation:', conversationId, 'messages:', cleanMessages.length);
    return data;
  } catch (error) {
    console.error('[ChatHistory] Save error:', error);
    throw error;
  }
};

/**
 * Load a single conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Object} - Conversation data
 */
const loadConversation = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) throw error;

    console.log('[ChatHistory] Loaded conversation:', conversationId);
    return data;
  } catch (error) {
    console.error('[ChatHistory] Load error:', error);
    throw error;
  }
};

/**
 * Get list of conversations (paginated)
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (0-indexed)
 * @param {number} options.limit - Items per page
 * @param {boolean} options.includeArchived - Include archived conversations
 * @param {string} options.searchQuery - Search in title/preview
 * @returns {Object} - { conversations, hasMore, totalCount }
 */
const getConversations = async (userId, options = {}) => {
  try {
    const {
      page = 0,
      limit = PAGE_SIZE,
      includeArchived = false,
      searchQuery = '',
    } = options;

    let query = supabase
      .from(TABLE_NAME)
      .select('id, title, preview, message_count, last_message_at, is_archived, started_at', { count: 'exact' })
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    // Filter archived
    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    // Search in title and preview
    if (searchQuery && searchQuery.trim()) {
      const search = searchQuery.trim();
      query = query.or(`title.ilike.%${search}%,preview.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    console.log('[ChatHistory] Got conversations:', data?.length, 'total:', count);
    return {
      conversations: data || [],
      hasMore: (page + 1) * limit < (count || 0),
      totalCount: count || 0,
    };
  } catch (error) {
    console.error('[ChatHistory] Get conversations error:', error);
    throw error;
  }
};

/**
 * Get only archived conversations
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Object} - { conversations, hasMore, totalCount }
 */
const getArchivedConversations = async (userId, options = {}) => {
  try {
    const { page = 0, limit = PAGE_SIZE } = options;

    const { data, error, count } = await supabase
      .from(TABLE_NAME)
      .select('id, title, preview, message_count, last_message_at, is_archived, started_at', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_archived', true)
      .order('last_message_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;

    return {
      conversations: data || [],
      hasMore: (page + 1) * limit < (count || 0),
      totalCount: count || 0,
    };
  } catch (error) {
    console.error('[ChatHistory] Get archived error:', error);
    throw error;
  }
};

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID for validation
 * @returns {boolean} - Success status
 */
const deleteConversation = async (conversationId, userId) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId); // Security: ensure user owns conversation

    if (error) throw error;

    console.log('[ChatHistory] Deleted conversation:', conversationId);
    return true;
  } catch (error) {
    console.error('[ChatHistory] Delete error:', error);
    throw error;
  }
};

/**
 * Archive a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID for validation
 * @returns {Object} - Updated conversation
 */
const archiveConversation = async (conversationId, userId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ is_archived: true })
      .eq('id', conversationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log('[ChatHistory] Archived conversation:', conversationId);
    return data;
  } catch (error) {
    console.error('[ChatHistory] Archive error:', error);
    throw error;
  }
};

/**
 * Unarchive a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID for validation
 * @returns {Object} - Updated conversation
 */
const unarchiveConversation = async (conversationId, userId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ is_archived: false })
      .eq('id', conversationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log('[ChatHistory] Unarchived conversation:', conversationId);
    return data;
  } catch (error) {
    console.error('[ChatHistory] Unarchive error:', error);
    throw error;
  }
};

/**
 * Get the most recent active conversation for a user
 * @param {string} userId - User ID
 * @returns {Object|null} - Most recent conversation or null
 */
const getRecentConversation = async (userId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('last_message_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('[ChatHistory] Get recent error:', error);
    return null;
  }
};

/**
 * Delete all conversations for a user
 * @param {string} userId - User ID
 * @returns {boolean} - Success status
 */
const deleteAllConversations = async (userId) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    console.log('[ChatHistory] Deleted all conversations for user:', userId);
    return true;
  } catch (error) {
    console.error('[ChatHistory] Delete all error:', error);
    throw error;
  }
};

export default {
  createConversation,
  saveConversation,
  loadConversation,
  getConversations,
  getArchivedConversations,
  deleteConversation,
  archiveConversation,
  unarchiveConversation,
  getRecentConversation,
  deleteAllConversations,
  generateTitle,
  generatePreview,
};
