/**
 * Calendar Journal Service - CRUD operations for journal entries
 * Part of Calendar Smart Journal System
 *
 * Created: January 28, 2026
 */

import { supabase } from './supabase';
import { checkCalendarAccess, getJournalCharLimit, getJournalDailyLimit } from '../config/calendarAccessControl';

const SERVICE_NAME = '[CalendarJournalService]';

// ==================== CONSTANTS ====================

export const ENTRY_TYPES = {
  REFLECTION: 'reflection',
  GRATITUDE: 'gratitude',
  GOAL_NOTE: 'goal_note',
  RITUAL_REFLECTION: 'ritual_reflection',
  QUICK_NOTE: 'quick_note',
};

export const MOODS = {
  HAPPY: { id: 'happy', label: 'Vui vẻ', icon: 'Smile', score: 5, color: '#3AF7A6' },
  EXCITED: { id: 'excited', label: 'Hưng khởi', icon: 'Sparkles', score: 5, color: '#FFD700' },
  PEACEFUL: { id: 'peaceful', label: 'Bình yên', icon: 'Heart', score: 4, color: '#00F0FF' },
  NEUTRAL: { id: 'neutral', label: 'Bình thường', icon: 'Meh', score: 3, color: '#9CA3AF' },
  ANXIOUS: { id: 'anxious', label: 'Lo lắng', icon: 'AlertCircle', score: 2, color: '#FFB800' },
  SAD: { id: 'sad', label: 'Buồn', icon: 'Frown', score: 2, color: '#6B7280' },
  STRESSED: { id: 'stressed', label: 'Căng thẳng', icon: 'Zap', score: 1, color: '#FF6B6B' },
};

export const LIFE_AREAS = {
  FINANCE: { id: 'finance', label: 'Tài chính', icon: 'DollarSign', color: '#FFD700' },
  HEALTH: { id: 'health', label: 'Sức khỏe', icon: 'Heart', color: '#3AF7A6' },
  CAREER: { id: 'career', label: 'Sự nghiệp', icon: 'Briefcase', color: '#6A5BFF' },
  RELATIONSHIPS: { id: 'relationships', label: 'Mối quan hệ', icon: 'Users', color: '#FF6B6B' },
  PERSONAL: { id: 'personal', label: 'Cá nhân', icon: 'User', color: '#00F0FF' },
  SPIRITUAL: { id: 'spiritual', label: 'Tâm linh', icon: 'Sparkles', color: '#9C0612' },
};

// ==================== HELPERS ====================

/**
 * Get mood object by id
 */
export const getMoodById = (moodId) => {
  if (!moodId) return null;
  const key = moodId.toUpperCase();
  return MOODS[key] || null;
};

/**
 * Get life area object by id
 * Supports lookup by key (FINANCE) or by id field (finance, personal_growth)
 */
export const getLifeAreaById = (areaId) => {
  if (!areaId) return null;

  // First try direct key lookup (uppercase)
  const key = areaId.toUpperCase();
  if (LIFE_AREAS[key]) {
    return LIFE_AREAS[key];
  }

  // Then try finding by id field (for templates that use lowercase ids)
  const normalizedId = areaId.toLowerCase();
  const entry = Object.values(LIFE_AREAS).find(area => area.id === normalizedId);
  if (entry) {
    return entry;
  }

  // Handle special mappings (template ids to calendarJournal ids)
  const mappings = {
    'personal_growth': 'personal',
    'love': 'relationships',
    'crypto': 'finance',
  };
  if (mappings[normalizedId]) {
    return Object.values(LIFE_AREAS).find(area => area.id === mappings[normalizedId]) || null;
  }

  return null;
};

/**
 * Get all moods as array
 */
export const getMoodsArray = () => Object.values(MOODS);

/**
 * Get all life areas as array
 */
export const getLifeAreasArray = () => Object.values(LIFE_AREAS);

// ==================== VALIDATION ====================

const validateJournalEntry = (data, userTier, userRole) => {
  const errors = [];

  // Required fields
  if (!data.content || data.content.trim().length === 0) {
    errors.push('Nội dung không được để trống');
  }

  if (!data.entry_date) {
    errors.push('Ngày không được để trống');
  }

  // Type validation
  if (data.entry_type && !Object.values(ENTRY_TYPES).includes(data.entry_type)) {
    errors.push('Loại nhật ký không hợp lệ');
  }

  // Mood validation
  if (data.mood && !getMoodById(data.mood)) {
    errors.push('Tâm trạng không hợp lệ');
  }

  // Life area validation
  if (data.life_area && !getLifeAreaById(data.life_area)) {
    errors.push('Lĩnh vực không hợp lệ');
  }

  // Tier-based character limit
  const charLimit = getJournalCharLimit(userTier, userRole);
  if (data.content && data.content.length > charLimit) {
    errors.push(`Nội dung không được vượt quá ${charLimit} ký tự`);
  }

  // Title length
  if (data.title && data.title.length > 200) {
    errors.push('Tiêu đề không được vượt quá 200 ký tự');
  }

  // Tags validation
  if (data.tags && Array.isArray(data.tags)) {
    if (data.tags.length > 10) {
      errors.push('Không được thêm quá 10 tags');
    }
    data.tags.forEach(tag => {
      if (tag.length > 30) {
        errors.push('Mỗi tag không được vượt quá 30 ký tự');
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ==================== CRUD OPERATIONS ====================

/**
 * Create new journal entry
 */
export const createJournalEntry = async (userId, data, userTier = 'free', userRole = null) => {
  console.log(`${SERVICE_NAME} createJournalEntry`, { userId, entryType: data.entry_type });

  try {
    // Check access
    const access = checkCalendarAccess('basic_journal', userTier, userRole);
    if (!access.allowed) {
      return { success: false, error: access.reason };
    }

    // Check daily limit
    const dailyLimit = getJournalDailyLimit(userTier, userRole);
    if (dailyLimit !== 'unlimited') {
      const today = new Date().toISOString().split('T')[0];
      const { count, error: countError } = await supabase
        .from('calendar_journal_entries')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('entry_date', today);

      if (countError) throw countError;

      if (count >= dailyLimit) {
        return {
          success: false,
          error: `Bạn đã đạt giới hạn ${dailyLimit} nhật ký/ngày. Nâng cấp để viết không giới hạn.`,
          limitReached: true,
        };
      }
    }

    // Validate
    const validation = validateJournalEntry(data, userTier, userRole);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', '), errors: validation.errors };
    }

    // Check if first entry (for onboarding)
    const { count: totalCount } = await supabase
      .from('calendar_journal_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    const isFirstEntry = totalCount === 0;

    // Prepare data
    const mood = getMoodById(data.mood);
    const entryData = {
      user_id: userId,
      entry_date: data.entry_date || new Date().toISOString().split('T')[0],
      entry_type: data.entry_type || ENTRY_TYPES.REFLECTION,
      title: data.title?.trim() || null,
      content: data.content.trim(),
      mood: data.mood || null,
      mood_score: mood?.score || null,
      life_area: data.life_area || null,
      tags: data.tags || [],
      related_ritual_id: data.related_ritual_id || null,
      related_goal_id: data.related_goal_id || null,
      related_habit_id: data.related_habit_id || null,
      attachments: data.attachments || [],
      voice_note_url: data.voice_note_url || null,
      voice_note_duration: data.voice_note_duration || null,
      is_pinned: data.is_pinned || false,
      is_private: data.is_private !== false, // Default true
      is_favorite: data.is_favorite || false,
      word_count: data.content.trim().split(/\s+/).length,
      is_first_entry: isFirstEntry,
    };

    // Insert
    const { data: entry, error } = await supabase
      .from('calendar_journal_entries')
      .insert(entryData)
      .select()
      .single();

    if (error) throw error;

    console.log(`${SERVICE_NAME} Created journal entry:`, entry.id);

    return {
      success: true,
      data: entry,
      isFirstEntry,
    };

  } catch (error) {
    console.error(`${SERVICE_NAME} createJournalEntry error:`, error);
    return { success: false, error: error.message || 'Không thể tạo nhật ký' };
  }
};

/**
 * Get journal entry by ID
 */
export const getEntryById = async (userId, entryId) => {
  console.log(`${SERVICE_NAME} getEntryById`, { userId, entryId });

  try {
    const { data, error } = await supabase
      .from('calendar_journal_entries')
      .select('*')
      .eq('id', entryId)
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle to handle 0 rows gracefully

    if (error) throw error;

    if (!data) {
      return { success: false, error: 'Entry not found', data: null };
    }

    return { success: true, data };

  } catch (error) {
    console.error(`${SERVICE_NAME} getEntryById error:`, error);
    return { success: false, error: error.message, data: null };
  }
};

/**
 * Get journal entries for a specific date
 */
export const getEntriesForDate = async (userId, date) => {
  console.log(`${SERVICE_NAME} getEntriesForDate`, { userId, date });

  try {
    const { data, error } = await supabase
      .from('calendar_journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', date)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };

  } catch (error) {
    console.error(`${SERVICE_NAME} getEntriesForDate error:`, error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Get journal entries for date range
 */
export const getEntriesForRange = async (userId, startDate, endDate, options = {}) => {
  console.log(`${SERVICE_NAME} getEntriesForRange`, { userId, startDate, endDate });

  try {
    let query = supabase
      .from('calendar_journal_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate);

    // Filter by type
    if (options.entry_type) {
      query = query.eq('entry_type', options.entry_type);
    }

    // Filter by mood
    if (options.mood) {
      query = query.eq('mood', options.mood);
    }

    // Filter by life area
    if (options.life_area) {
      query = query.eq('life_area', options.life_area);
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      query = query.overlaps('tags', options.tags);
    }

    // Filter pinned only
    if (options.pinnedOnly) {
      query = query.eq('is_pinned', true);
    }

    // Filter favorites only
    if (options.favoritesOnly) {
      query = query.eq('is_favorite', true);
    }

    // Order
    query = query
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false });

    // Limit
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: data || [] };

  } catch (error) {
    console.error(`${SERVICE_NAME} getEntriesForRange error:`, error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Update journal entry
 */
export const updateJournalEntry = async (userId, entryId, updates, userTier = 'free', userRole = null) => {
  console.log(`${SERVICE_NAME} updateJournalEntry`, { userId, entryId });

  try {
    // Validate if content updated
    if (updates.content) {
      const validation = validateJournalEntry({ ...updates, entry_date: 'dummy' }, userTier, userRole);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }
    }

    // Prepare update data
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Recalculate word count if content updated
    if (updates.content) {
      updateData.word_count = updates.content.trim().split(/\s+/).length;
    }

    // Update mood score if mood changed
    if (updates.mood) {
      const mood = getMoodById(updates.mood);
      updateData.mood_score = mood?.score || null;
    }

    // Remove fields that shouldn't be updated
    delete updateData.user_id;
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.is_first_entry;

    const { data, error } = await supabase
      .from('calendar_journal_entries')
      .update(updateData)
      .eq('id', entryId)
      .eq('user_id', userId) // Security: ensure user owns entry
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return { success: false, error: 'Không tìm thấy nhật ký' };
    }

    return { success: true, data };

  } catch (error) {
    console.error(`${SERVICE_NAME} updateJournalEntry error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete journal entry
 */
export const deleteJournalEntry = async (userId, entryId) => {
  console.log(`${SERVICE_NAME} deleteJournalEntry`, { userId, entryId });

  try {
    const { error } = await supabase
      .from('calendar_journal_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId); // Security: ensure user owns entry

    if (error) throw error;

    return { success: true };

  } catch (error) {
    console.error(`${SERVICE_NAME} deleteJournalEntry error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Toggle pin status
 */
export const togglePinEntry = async (userId, entryId) => {
  try {
    // Get current status
    const { data: entry } = await supabase
      .from('calendar_journal_entries')
      .select('is_pinned')
      .eq('id', entryId)
      .eq('user_id', userId)
      .single();

    if (!entry) {
      return { success: false, error: 'Không tìm thấy nhật ký' };
    }

    const { data, error } = await supabase
      .from('calendar_journal_entries')
      .update({ is_pinned: !entry.is_pinned, updated_at: new Date().toISOString() })
      .eq('id', entryId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data, isPinned: !entry.is_pinned };

  } catch (error) {
    console.error(`${SERVICE_NAME} togglePinEntry error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Toggle favorite status
 */
export const toggleFavoriteEntry = async (userId, entryId) => {
  try {
    const { data: entry } = await supabase
      .from('calendar_journal_entries')
      .select('is_favorite')
      .eq('id', entryId)
      .eq('user_id', userId)
      .single();

    if (!entry) {
      return { success: false, error: 'Không tìm thấy nhật ký' };
    }

    const { data, error } = await supabase
      .from('calendar_journal_entries')
      .update({ is_favorite: !entry.is_favorite, updated_at: new Date().toISOString() })
      .eq('id', entryId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data, isFavorite: !entry.is_favorite };

  } catch (error) {
    console.error(`${SERVICE_NAME} toggleFavoriteEntry error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Search journal entries
 */
export const searchJournalEntries = async (userId, searchQuery, options = {}) => {
  console.log(`${SERVICE_NAME} searchJournalEntries`, { userId, searchQuery });

  try {
    // Build search query
    let query = supabase
      .from('calendar_journal_entries')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);

    // Apply date range if provided
    if (options.startDate) {
      query = query.gte('entry_date', options.startDate);
    }
    if (options.endDate) {
      query = query.lte('entry_date', options.endDate);
    }

    query = query
      .order('entry_date', { ascending: false })
      .limit(options.limit || 50);

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: data || [] };

  } catch (error) {
    console.error(`${SERVICE_NAME} searchJournalEntries error:`, error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Get journal statistics
 */
export const getJournalStats = async (userId, startDate, endDate) => {
  console.log(`${SERVICE_NAME} getJournalStats`, { userId, startDate, endDate });

  try {
    const { data, error } = await supabase
      .from('calendar_journal_entries')
      .select('entry_type, mood, life_area, word_count, entry_date')
      .eq('user_id', userId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate);

    if (error) throw error;

    // Calculate stats
    const entries = data || [];
    const stats = {
      total_entries: entries.length,
      total_words: entries.reduce((sum, e) => sum + (e.word_count || 0), 0),
      entries_by_type: {},
      entries_by_mood: {},
      entries_by_life_area: {},
      days_with_entries: new Set(entries.map(e => e.entry_date)).size,
      avg_entries_per_day: 0,
      most_common_mood: null,
    };

    entries.forEach(entry => {
      // By type
      stats.entries_by_type[entry.entry_type] =
        (stats.entries_by_type[entry.entry_type] || 0) + 1;

      // By mood
      if (entry.mood) {
        stats.entries_by_mood[entry.mood] =
          (stats.entries_by_mood[entry.mood] || 0) + 1;
      }

      // By life area
      if (entry.life_area) {
        stats.entries_by_life_area[entry.life_area] =
          (stats.entries_by_life_area[entry.life_area] || 0) + 1;
      }
    });

    // Calculate averages
    if (stats.days_with_entries > 0) {
      stats.avg_entries_per_day = parseFloat((stats.total_entries / stats.days_with_entries).toFixed(1));
    }

    // Most common mood
    const moodCounts = Object.entries(stats.entries_by_mood);
    if (moodCounts.length > 0) {
      stats.most_common_mood = moodCounts.sort((a, b) => b[1] - a[1])[0][0];
    }

    return { success: true, data: stats };

  } catch (error) {
    console.error(`${SERVICE_NAME} getJournalStats error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get suggested tags based on user's history
 */
export const getSuggestedTags = async (userId, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('calendar_journal_entries')
      .select('tags')
      .eq('user_id', userId)
      .not('tags', 'eq', '{}')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Count tag occurrences
    const tagCounts = {};
    (data || []).forEach(entry => {
      (entry.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort by frequency and return top tags
    const suggestedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag]) => tag);

    return { success: true, data: suggestedTags };

  } catch (error) {
    console.error(`${SERVICE_NAME} getSuggestedTags error:`, error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Get pinned entries
 */
export const getPinnedEntries = async (userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('calendar_journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('is_pinned', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: data || [] };

  } catch (error) {
    console.error(`${SERVICE_NAME} getPinnedEntries error:`, error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Get favorite entries
 */
export const getFavoriteEntries = async (userId, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('calendar_journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: data || [] };

  } catch (error) {
    console.error(`${SERVICE_NAME} getFavoriteEntries error:`, error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Get today's entry count
 */
export const getTodayEntryCount = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { count, error } = await supabase
      .from('calendar_journal_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('entry_date', today);

    if (error) throw error;

    return { success: true, count: count || 0 };

  } catch (error) {
    console.error(`${SERVICE_NAME} getTodayEntryCount error:`, error);
    return { success: false, error: error.message, count: 0 };
  }
};

export default {
  ENTRY_TYPES,
  MOODS,
  LIFE_AREAS,
  getMoodById,
  getLifeAreaById,
  getMoodsArray,
  getLifeAreasArray,
  createJournalEntry,
  getEntryById,
  getEntriesForDate,
  getEntriesForRange,
  updateJournalEntry,
  deleteJournalEntry,
  togglePinEntry,
  toggleFavoriteEntry,
  searchJournalEntries,
  getJournalStats,
  getSuggestedTags,
  getPinnedEntries,
  getFavoriteEntries,
  getTodayEntryCount,
};
