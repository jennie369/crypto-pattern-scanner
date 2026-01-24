/**
 * Activity Service
 * Tracks user activities for activity feed and calendar
 * Phase 3: VisionBoard Upgrade
 */

import { supabase } from './supabase';

const SERVICE_NAME = '[activityService]';

// Activity types
export const ACTIVITY_TYPES = {
  RITUAL_COMPLETE: 'ritual_complete',
  GOAL_PROGRESS: 'goal_progress',
  GOAL_COMPLETE: 'goal_complete',
  HABIT_COMPLETE: 'habit_complete',
  TAROT_READING: 'tarot_reading',
  ICHING_READING: 'iching_reading',
  ACHIEVEMENT_UNLOCK: 'achievement_unlock',
  STREAK_MILESTONE: 'streak_milestone',
  VISIONBOARD_UPDATE: 'visionboard_update',
  REFLECTION_SAVED: 'reflection_saved',
};

/**
 * Log an activity
 * @param {string} userId - User ID
 * @param {string} activityType - Activity type from ACTIVITY_TYPES
 * @param {object} data - Activity data
 * @returns {Promise<object>}
 */
export const logActivity = async (userId, activityType, data = {}) => {
  if (!userId || !activityType) {
    console.warn(SERVICE_NAME, 'logActivity: Missing userId or activityType');
    return null;
  }

  const {
    title,
    description,
    referenceId,
    referenceType,
    xpEarned = 0,
    metadata = {},
  } = data;

  try {
    const { data: activity, error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        title: title || getDefaultTitle(activityType),
        description,
        reference_id: referenceId,
        reference_type: referenceType,
        xp_earned: xpEarned,
        metadata,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // Table might not exist yet - log but don't fail
      console.warn(SERVICE_NAME, 'logActivity error (table may not exist):', error?.message);
      return null;
    }

    console.log(SERVICE_NAME, 'Activity logged:', activityType, title);
    return activity;
  } catch (err) {
    console.error(SERVICE_NAME, 'logActivity failed:', err?.message);
    return null;
  }
};

/**
 * Get default title for activity type
 * @param {string} activityType
 * @returns {string}
 */
const getDefaultTitle = (activityType) => {
  const titles = {
    [ACTIVITY_TYPES.RITUAL_COMPLETE]: 'Hoàn thành nghi thức',
    [ACTIVITY_TYPES.GOAL_PROGRESS]: 'Cập nhật mục tiêu',
    [ACTIVITY_TYPES.GOAL_COMPLETE]: 'Hoàn thành mục tiêu',
    [ACTIVITY_TYPES.HABIT_COMPLETE]: 'Hoàn thành thói quen',
    [ACTIVITY_TYPES.TAROT_READING]: 'Xem bài Tarot',
    [ACTIVITY_TYPES.ICHING_READING]: 'Xem quẻ Kinh Dịch',
    [ACTIVITY_TYPES.ACHIEVEMENT_UNLOCK]: 'Mở khóa thành tựu',
    [ACTIVITY_TYPES.STREAK_MILESTONE]: 'Đạt mốc streak',
    [ACTIVITY_TYPES.VISIONBOARD_UPDATE]: 'Cập nhật Vision Board',
    [ACTIVITY_TYPES.REFLECTION_SAVED]: 'Lưu suy ngẫm',
  };
  return titles[activityType] || 'Hoạt động';
};

/**
 * Get user activity feed
 * @param {string} userId - User ID
 * @param {number} limit - Max items
 * @param {number} offset - Pagination offset
 * @returns {Promise<array>}
 */
export const getActivityFeed = async (userId, limit = 20, offset = 0) => {
  if (!userId) return [];

  try {
    // Try RPC function first (more efficient)
    const { data, error } = await supabase.rpc('get_user_activity_feed', {
      p_user_id: userId,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      // Fallback to direct query
      console.warn(SERVICE_NAME, 'RPC failed, using direct query:', error?.message);

      const { data: fallbackData, error: fallbackError } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (fallbackError) throw fallbackError;
      return fallbackData || [];
    }

    return data || [];
  } catch (err) {
    console.error(SERVICE_NAME, 'getActivityFeed failed:', err?.message);
    return [];
  }
};

/**
 * Get activities for a specific date
 * @param {string} userId - User ID
 * @param {Date} date - Date to query
 * @returns {Promise<array>}
 */
export const getActivitiesForDate = async (userId, date) => {
  if (!userId || !date) return [];

  const dateStr = date.toISOString().split('T')[0];

  try {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', `${dateStr}T00:00:00`)
      .lt('completed_at', `${dateStr}T23:59:59.999`)
      .order('completed_at', { ascending: false });

    if (error) {
      console.warn(SERVICE_NAME, 'getActivitiesForDate error:', error?.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(SERVICE_NAME, 'getActivitiesForDate failed:', err?.message);
    return [];
  }
};

/**
 * Get activity summary for date range (for calendar heat map)
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<array>}
 */
export const getActivitySummaryByDate = async (userId, startDate, endDate) => {
  if (!userId || !startDate || !endDate) return [];

  try {
    // Try RPC function first
    const { data, error } = await supabase.rpc('get_activities_by_date', {
      p_user_id: userId,
      p_start_date: startDate.toISOString().split('T')[0],
      p_end_date: endDate.toISOString().split('T')[0],
    });

    if (error) {
      // Fallback: group by date manually
      console.warn(SERVICE_NAME, 'RPC failed, using fallback:', error?.message);

      const { data: activities, error: queryError } = await supabase
        .from('user_activities')
        .select('completed_at, xp_earned, activity_type')
        .eq('user_id', userId)
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString());

      if (queryError) throw queryError;

      // Group by date
      const grouped = {};
      (activities || []).forEach((a) => {
        const dateKey = a.completed_at.split('T')[0];
        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            activity_date: dateKey,
            activity_count: 0,
            total_xp: 0,
            activity_types: [],
          };
        }
        grouped[dateKey].activity_count++;
        grouped[dateKey].total_xp += a.xp_earned || 0;
        if (!grouped[dateKey].activity_types.includes(a.activity_type)) {
          grouped[dateKey].activity_types.push(a.activity_type);
        }
      });

      return Object.values(grouped);
    }

    return data || [];
  } catch (err) {
    console.error(SERVICE_NAME, 'getActivitySummaryByDate failed:', err?.message);
    return [];
  }
};

/**
 * Get today's activity summary
 * @param {string} userId - User ID
 * @returns {Promise<object>}
 */
export const getTodaySummary = async (userId) => {
  if (!userId) {
    return {
      totalActivities: 0,
      totalXp: 0,
      ritualsCompleted: 0,
      readingsCompleted: 0,
    };
  }

  try {
    const { data, error } = await supabase.rpc('get_today_activity_summary', {
      p_user_id: userId,
    });

    if (error) {
      // Fallback
      const today = new Date().toISOString().split('T')[0];
      const { data: activities } = await supabase
        .from('user_activities')
        .select('xp_earned, activity_type')
        .eq('user_id', userId)
        .gte('completed_at', `${today}T00:00:00`);

      const result = {
        totalActivities: activities?.length || 0,
        totalXp: activities?.reduce((sum, a) => sum + (a.xp_earned || 0), 0) || 0,
        ritualsCompleted:
          activities?.filter((a) => a.activity_type === ACTIVITY_TYPES.RITUAL_COMPLETE).length || 0,
        readingsCompleted:
          activities?.filter(
            (a) =>
              a.activity_type === ACTIVITY_TYPES.TAROT_READING ||
              a.activity_type === ACTIVITY_TYPES.ICHING_READING
          ).length || 0,
      };

      return result;
    }

    // Map from snake_case to camelCase
    return {
      totalActivities: data?.[0]?.total_activities || 0,
      totalXp: data?.[0]?.total_xp || 0,
      ritualsCompleted: data?.[0]?.rituals_completed || 0,
      readingsCompleted: data?.[0]?.readings_completed || 0,
    };
  } catch (err) {
    console.error(SERVICE_NAME, 'getTodaySummary failed:', err?.message);
    return {
      totalActivities: 0,
      totalXp: 0,
      ritualsCompleted: 0,
      readingsCompleted: 0,
    };
  }
};

export default {
  ACTIVITY_TYPES,
  logActivity,
  getActivityFeed,
  getActivitiesForDate,
  getActivitySummaryByDate,
  getTodaySummary,
};
