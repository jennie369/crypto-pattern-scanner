/**
 * Chat History Service (Web)
 * Ported from gem-mobile/src/services/chatHistoryService.js
 *
 * Manages chat conversation persistence using Supabase
 * - Create, save, load, delete conversations
 * - Auto-generate titles and previews
 * - Pagination support for history listing
 * - Local caching with localStorage for instant display
 */

import { supabase } from '../lib/supabaseClient';

const TABLE_NAME = 'chatbot_conversations';
const PAGE_SIZE = 20;

// Cache keys
const CACHE_KEY_CONVERSATIONS = 'chat_history_conversations';
const CACHE_KEY_ARCHIVED = 'chat_history_archived';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// ═══════════════════════════════════════════════════════════
// CACHE HELPERS (localStorage instead of AsyncStorage)
// ═══════════════════════════════════════════════════════════

const getCachedConversations = (userId, archived = false) => {
  try {
    const key = archived ? `${CACHE_KEY_ARCHIVED}_${userId}` : `${CACHE_KEY_CONVERSATIONS}_${userId}`;
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);

    // Filter out persistently deleted conversations from cache
    const deletedIds = getDeletedIds(userId);
    if (data?.conversations && deletedIds.size > 0) {
      data.conversations = data.conversations.filter(c => !deletedIds.has(c.id));
    }

    // Check if cache is still valid
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      return { data, expired: true };
    }
    return { data, expired: false };
  } catch (error) {
    console.warn('[ChatHistory] Cache read error:', error);
    return null;
  }
};

const setCachedConversations = (userId, data, archived = false) => {
  try {
    const key = archived ? `${CACHE_KEY_ARCHIVED}_${userId}` : `${CACHE_KEY_CONVERSATIONS}_${userId}`;
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.warn('[ChatHistory] Cache write error:', error);
  }
};

const clearCache = (userId) => {
  try {
    localStorage.removeItem(`${CACHE_KEY_CONVERSATIONS}_${userId}`);
    localStorage.removeItem(`${CACHE_KEY_ARCHIVED}_${userId}`);
  } catch (error) {
    console.warn('[ChatHistory] Cache clear error:', error);
  }
};

/**
 * Generate title from first user message
 */
const generateTitle = (messages) => {
  const firstUserMessage = messages.find(m => m.type === 'user');
  if (firstUserMessage && firstUserMessage.text) {
    const text = firstUserMessage.text.trim();
    if (text.length <= 50) return text;
    return text.substring(0, 47) + '...';
  }

  const date = new Date();
  return `Chat - ${date.toLocaleDateString('vi-VN')}`;
};

/**
 * Generate preview from last message
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
 */
const createConversation = async (userId, messages = []) => {
  try {
    const validMessages = Array.isArray(messages) && messages.length > 0 ? messages : [];
    const title = validMessages.length > 0 ? generateTitle(validMessages) : 'New Chat';
    const preview = generatePreview(validMessages);
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
 */
const saveConversation = async (conversationId, messages, userId) => {
  try {
    if (!Array.isArray(messages)) {
      console.warn('[ChatHistory] Invalid messages array, skipping save');
      return null;
    }

    const cleanMessages = messages.map((m, index) => {
      if (!m) return null;
      const cleaned = {
        id: m.id || `msg_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        type: m.type || 'user',
        text: m.text || '',
        timestamp: m.timestamp || new Date().toISOString(),
      };
      const optionalFields = [
        'quickActions', 'actionButtons', 'data', 'source',
        'products', 'metadata', 'responseType', 'richData',
        'options', 'questionId', 'questionIndex', 'totalQuestions',
        'divinationType', 'hexagram', 'cards', 'interpretation',
      ];
      for (const field of optionalFields) {
        if (m[field] != null) {
          cleaned[field] = m[field];
        }
      }
      return cleaned;
    }).filter(m => m && m.text);

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
      .eq('user_id', userId)
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
 */
const loadConversation = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) throw error;

    // Ensure loaded messages have unique IDs
    if (data && Array.isArray(data.messages)) {
      const seenIds = new Set();
      data.messages = data.messages.map((m, index) => {
        let id = m?.id;
        if (!id || seenIds.has(id)) {
          id = `loaded_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
        }
        seenIds.add(id);
        return { ...m, id };
      });
    }

    console.log('[ChatHistory] Loaded conversation:', conversationId);
    return data;
  } catch (error) {
    console.error('[ChatHistory] Load error:', error);
    throw error;
  }
};

/**
 * Get list of conversations (paginated)
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

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    if (searchQuery && searchQuery.trim()) {
      const search = searchQuery.trim();
      query = query.or(`title.ilike.%${search}%,preview.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Filter out persistently deleted conversations
    const deletedIds = getDeletedIds(userId);
    const filtered = (data || []).filter(c => !deletedIds.has(c.id));

    const result = {
      conversations: filtered,
      hasMore: (page + 1) * limit < (count || 0),
      totalCount: count || 0,
    };

    // Cache first page results
    if (page === 0 && !searchQuery && !includeArchived) {
      setCachedConversations(userId, result, false);
    }

    console.log('[ChatHistory] Got conversations:', filtered.length, 'total:', count);
    return result;
  } catch (error) {
    console.error('[ChatHistory] Get conversations error:', error);
    throw error;
  }
};

/**
 * Get only archived conversations
 */
const getArchivedConversations = async (userId, options = {}) => {
  try {
    const { page = 0, limit = PAGE_SIZE, searchQuery = '' } = options;

    let query = supabase
      .from(TABLE_NAME)
      .select('id, title, preview, message_count, last_message_at, is_archived, started_at', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_archived', true)
      .order('last_message_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (searchQuery && searchQuery.trim()) {
      const search = searchQuery.trim();
      query = query.or(`title.ilike.%${search}%,preview.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const deletedIds = getDeletedIds(userId);
    const filtered = (data || []).filter(c => !deletedIds.has(c.id));

    const result = {
      conversations: filtered,
      hasMore: (page + 1) * limit < (count || 0),
      totalCount: count || 0,
    };

    if (page === 0 && !searchQuery) {
      setCachedConversations(userId, result, true);
    }

    return result;
  } catch (error) {
    console.error('[ChatHistory] Get archived error:', error);
    throw error;
  }
};

/**
 * Get persistent list of deleted conversation IDs (localStorage fallback for RLS issues)
 */
const getDeletedIds = (userId) => {
  try {
    const raw = localStorage.getItem(`chatbot_deleted_ids_${userId}`);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

const addToDeletedList = (conversationId, userId) => {
  try {
    const deleted = getDeletedIds(userId);
    deleted.add(conversationId);
    localStorage.setItem(
      `chatbot_deleted_ids_${userId}`,
      JSON.stringify([...deleted])
    );
  } catch (error) {
    console.warn('[ChatHistory] Failed to persist deleted ID:', error);
  }
};

/**
 * Delete a conversation
 */
const deleteConversation = async (conversationId, userId) => {
  try {
    addToDeletedList(conversationId, userId);

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (error) {
      console.error('[ChatHistory] Server delete error:', error);
    } else {
      console.log('[ChatHistory] Deleted conversation:', conversationId);
    }

    clearCache(userId);
    return true;
  } catch (error) {
    console.error('[ChatHistory] Delete error:', error);
    return true;
  }
};

/**
 * Archive a conversation
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
    return data;
  } catch (error) {
    console.error('[ChatHistory] Archive error:', error);
    throw error;
  }
};

/**
 * Unarchive a conversation
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
    return data;
  } catch (error) {
    console.error('[ChatHistory] Unarchive error:', error);
    throw error;
  }
};

/**
 * Get the most recent active conversation for a user
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

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data && Array.isArray(data.messages)) {
      const seenIds = new Set();
      data.messages = data.messages.map((m, index) => {
        let id = m?.id;
        if (!id || seenIds.has(id)) {
          id = `loaded_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
        }
        seenIds.add(id);
        return { ...m, id };
      });
    }

    return data || null;
  } catch (error) {
    console.error('[ChatHistory] Get recent error:', error);
    return null;
  }
};

/**
 * Delete all conversations for a user
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

const clearDeletedIds = (userId) => {
  try {
    localStorage.removeItem(`chatbot_deleted_ids_${userId}`);
  } catch (error) {
    console.warn('[ChatHistory] Failed to clear deleted IDs:', error);
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
  getCachedConversations,
  setCachedConversations,
  clearCache,
  clearDeletedIds,
  PAGE_SIZE,
};
