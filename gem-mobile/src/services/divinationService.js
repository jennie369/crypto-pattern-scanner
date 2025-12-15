/**
 * Divination Service - Vision Board 2.0
 * Unified reading history management for Tarot & I Ching
 * Created: December 10, 2025
 */

import { supabase } from './supabase';

// ============ GET ALL READINGS ============
export const getAllReadings = async (userId, options = {}) => {
  try {
    let query = supabase
      .from('divination_readings')
      .select('*')
      .eq('user_id', userId);

    if (options.type) {
      query = query.eq('type', options.type);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[divinationService] getAllReadings error:', err);
    return [];
  }
};

// ============ GET READING BY ID ============
export const getReadingById = async (readingId) => {
  try {
    const { data, error } = await supabase
      .from('divination_readings')
      .select('*')
      .eq('id', readingId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[divinationService] getReadingById error:', err);
    return null;
  }
};

// ============ GET RECENT READINGS (FOR WIDGET) ============
export const getRecentReadings = async (userId, limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('divination_readings')
      .select('id, type, question, interpretation, created_at, cards, hexagram')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Format for widget display
    return (data || []).map(reading => ({
      id: reading.id,
      type: reading.type,
      typeLabel: reading.type === 'tarot' ? '🃏 Tarot' : '☯️ Kinh Dịch',
      question: reading.question || 'Không có câu hỏi',
      summary: getSummary(reading),
      createdAt: reading.created_at,
      timeAgo: getTimeAgo(reading.created_at),
    }));
  } catch (err) {
    console.error('[divinationService] getRecentReadings error:', err);
    return [];
  }
};

// ============ DELETE READING ============
export const deleteReading = async (readingId) => {
  try {
    const { error } = await supabase
      .from('divination_readings')
      .delete()
      .eq('id', readingId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[divinationService] deleteReading error:', err);
    throw err;
  }
};

// ============ SHARE READING ============
export const shareReading = async (readingId) => {
  try {
    const reading = await getReadingById(readingId);
    if (!reading) throw new Error('Reading not found');

    // Generate shareable content
    const shareContent = generateShareContent(reading);

    // Update reading to mark as shared
    await supabase
      .from('divination_readings')
      .update({ shared_at: new Date().toISOString() })
      .eq('id', readingId);

    return shareContent;
  } catch (err) {
    console.error('[divinationService] shareReading error:', err);
    throw err;
  }
};

// ============ GET READING STATS ============
export const getReadingStats = async (userId) => {
  try {
    // Get total counts by type
    const { data: tarotCount } = await supabase
      .from('divination_readings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'tarot');

    const { data: ichingCount } = await supabase
      .from('divination_readings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'iching');

    // Get this week's readings
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const { count: weeklyCount } = await supabase
      .from('divination_readings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', weekStart.toISOString());

    // Get most recent reading
    const { data: lastReading } = await supabase
      .from('divination_readings')
      .select('type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      totalTarot: tarotCount?.count || 0,
      totalIChing: ichingCount?.count || 0,
      total: (tarotCount?.count || 0) + (ichingCount?.count || 0),
      thisWeek: weeklyCount || 0,
      lastReading: lastReading?.created_at || null,
      lastType: lastReading?.type || null,
    };
  } catch (err) {
    console.error('[divinationService] getReadingStats error:', err);
    return {
      totalTarot: 0,
      totalIChing: 0,
      total: 0,
      thisWeek: 0,
      lastReading: null,
      lastType: null,
    };
  }
};

// ============ SEARCH READINGS ============
export const searchReadings = async (userId, searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('divination_readings')
      .select('*')
      .eq('user_id', userId)
      .or(`question.ilike.%${searchTerm}%,interpretation.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[divinationService] searchReadings error:', err);
    return [];
  }
};

// ============ GET FAVORITE READINGS ============
export const getFavoriteReadings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('divination_readings')
      .select('*')
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[divinationService] getFavoriteReadings error:', err);
    return [];
  }
};

// ============ TOGGLE FAVORITE ============
export const toggleFavorite = async (readingId) => {
  try {
    // Get current state
    const { data: reading } = await supabase
      .from('divination_readings')
      .select('is_favorite')
      .eq('id', readingId)
      .single();

    // Toggle
    const { error } = await supabase
      .from('divination_readings')
      .update({ is_favorite: !reading?.is_favorite })
      .eq('id', readingId);

    if (error) throw error;
    return !reading?.is_favorite;
  } catch (err) {
    console.error('[divinationService] toggleFavorite error:', err);
    throw err;
  }
};

// ============ GET READINGS BY DATE RANGE ============
export const getReadingsByDateRange = async (userId, startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('divination_readings')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[divinationService] getReadingsByDateRange error:', err);
    return [];
  }
};

// ============ GET READINGS FOR CALENDAR ============
export const getReadingsForCalendar = async (userId, month, year) => {
  try {
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from('divination_readings')
      .select('id, type, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    // Group by date
    const byDate = {};
    (data || []).forEach(reading => {
      const dateKey = reading.created_at.split('T')[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = { tarot: 0, iching: 0 };
      }
      byDate[dateKey][reading.type]++;
    });

    return byDate;
  } catch (err) {
    console.error('[divinationService] getReadingsForCalendar error:', err);
    return {};
  }
};

// ============ HELPER FUNCTIONS ============

function getSummary(reading) {
  if (reading.type === 'tarot' && reading.cards) {
    const cards = Array.isArray(reading.cards) ? reading.cards : [];
    if (cards.length === 1) {
      return cards[0].nameVi || cards[0].name || 'Một lá bài';
    } else if (cards.length === 3) {
      return 'Quá khứ - Hiện tại - Tương lai';
    } else if (cards.length > 0) {
      return `${cards.length} lá bài`;
    }
  }

  if (reading.type === 'iching' && reading.hexagram) {
    const hex = reading.hexagram;
    return hex.nameVi || hex.name || `Quẻ số ${hex.number}`;
  }

  // Fallback to first line of interpretation
  if (reading.interpretation) {
    const firstLine = reading.interpretation.split('\n')[0];
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
  }

  return 'Xem chi tiết';
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return date.toLocaleDateString('vi-VN');
}

function generateShareContent(reading) {
  const typeEmoji = reading.type === 'tarot' ? '🃏' : '☯️';
  const typeName = reading.type === 'tarot' ? 'Tarot' : 'Kinh Dịch';

  let content = `${typeEmoji} ${typeName} Reading\n\n`;

  if (reading.question) {
    content += `❓ Câu hỏi: ${reading.question}\n\n`;
  }

  if (reading.type === 'tarot' && reading.cards) {
    const cards = Array.isArray(reading.cards) ? reading.cards : [];
    content += `🎴 Các lá bài:\n`;
    cards.forEach((card, i) => {
      const reversed = card.isReversed ? ' (Ngược)' : '';
      content += `  ${i + 1}. ${card.nameVi} - ${card.name}${reversed}\n`;
    });
    content += '\n';
  }

  if (reading.type === 'iching' && reading.hexagram) {
    const hex = reading.hexagram;
    content += `☯️ Quẻ: ${hex.nameVi} - ${hex.name}\n`;
    content += `📊 Số: ${hex.number}\n\n`;
  }

  if (reading.interpretation) {
    const shortInterpretation = reading.interpretation.length > 500
      ? reading.interpretation.substring(0, 500) + '...'
      : reading.interpretation;
    content += `📖 Giải thích:\n${shortInterpretation}\n\n`;
  }

  content += `\n✨ Chia sẻ từ GEM App`;

  return {
    text: content,
    title: `${typeName} Reading - GEM App`,
    message: content,
  };
}

export default {
  getAllReadings,
  getReadingById,
  getRecentReadings,
  deleteReading,
  shareReading,
  getReadingStats,
  searchReadings,
  getFavoriteReadings,
  toggleFavorite,
  getReadingsByDateRange,
  getReadingsForCalendar,
};
