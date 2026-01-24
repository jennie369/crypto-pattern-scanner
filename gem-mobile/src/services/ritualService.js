/**
 * Ritual Service - Vision Board 2.0
 * Ritual management, completion tracking, streak system
 * Created: December 10, 2025
 */

import { supabase } from './supabase';
import { addXPToUser, updateDailySummary, XP_REWARDS } from './goalService';
import calendarService, { EVENT_SOURCE_TYPES } from './calendarService';
import { logActivity, ACTIVITY_TYPES } from './activityService';

// ============ RITUAL TYPES ============
export const RITUAL_TYPES = {
  'heart-expansion': {
    id: 'heart-expansion',
    title: 'Mở Rộng Trái Tim',
    subtitle: 'Nghi thức tần số yêu thương',
    icon: 'Heart',
    color: '#F093FB',
    duration: 5, // minutes
    category: 'love',
    description: 'Mở rộng trái tim, gửi yêu thương đến người thân và vũ trụ',
    steps: [
      'Hít thở sâu 3 lần',
      'Đặt tay lên ngực, cảm nhận nhịp tim',
      'Hình dung ánh sáng hồng lan tỏa từ tim',
      'Gửi yêu thương đến người thân',
      'Mở rộng yêu thương ra vũ trụ',
    ],
  },
  'gratitude-flow': {
    id: 'gratitude-flow',
    title: 'Dòng Chảy Biết Ơn',
    subtitle: 'Thu hút thêm nhiều phước lành',
    icon: 'Gift',
    color: '#FFD700',
    duration: 3,
    category: 'abundance',
    description: 'Viết và gửi lòng biết ơn vào vũ trụ để thu hút phước lành',
    steps: [
      'Ngồi thoải mái, nhắm mắt',
      'Nghĩ về 3 điều biết ơn hôm nay',
      'Cảm nhận sự ấm áp lan tỏa',
      'Viết ra những điều biết ơn',
      'Gửi năng lượng vào vũ trụ',
    ],
  },
  'cleansing-breath': {
    id: 'cleansing-breath',
    title: 'Thở Thanh Lọc',
    subtitle: 'Làm sạch năng lượng tiêu cực',
    icon: 'Wind',
    color: '#667EEA',
    duration: 4,
    category: 'cleansing',
    description: 'Thanh lọc năng lượng tiêu cực thông qua hơi thở có ý thức',
    steps: [
      'Hít vào 4 nhịp - Năng lượng tích cực',
      'Giữ 4 nhịp - Chuyển hóa',
      'Thở ra 4 nhịp - Thải độc',
      'Giữ 4 nhịp - Nghỉ ngơi',
      'Lặp lại 4 vòng',
    ],
  },
  'water-manifest': {
    id: 'water-manifest',
    title: 'Hiện Thực Hóa Bằng Nước',
    subtitle: 'Nạp ý định vào nước và uống',
    icon: 'Droplet',
    color: '#4ECDC4',
    duration: 3,
    category: 'manifestation',
    description: 'Viết ý định lên cốc nước, nạp năng lượng và uống để hiện thực hóa',
    steps: [
      'Chuẩn bị một ly nước sạch',
      'Viết ý định của bạn',
      'Đặt tay bao quanh ly nước',
      'Tập trung năng lượng vào nước',
      'Uống nước với lòng biết ơn',
    ],
  },
  'letter-to-universe': {
    id: 'letter-to-universe',
    title: 'Thư Gửi Vũ Trụ',
    subtitle: 'Gửi điều ước đến vũ trụ',
    icon: 'Mail',
    color: '#9D4EDD',
    duration: 5,
    category: 'manifestation',
    description: 'Viết thư gửi điều ước lên bầu trời để vũ trụ nhận được',
    steps: [
      'Tĩnh tâm và thở sâu',
      'Viết rõ điều ước của bạn',
      'Đọc lại với niềm tin mãnh liệt',
      'Gửi thư lên bầu trời',
      'Cảm ơn vũ trụ đã nhận',
    ],
  },
  'burn-release': {
    id: 'burn-release',
    title: 'Đốt & Giải Phóng',
    subtitle: 'Buông bỏ và chuyển hóa',
    icon: 'Flame',
    color: '#FF6B6B',
    duration: 4,
    category: 'release',
    description: 'Viết ra điều muốn buông bỏ và đốt cháy để giải phóng',
    steps: [
      'Ngồi yên và thở sâu',
      'Viết ra điều muốn buông bỏ',
      'Đọc lại một lần cuối',
      'Kéo giấy vào ngọn lửa',
      'Cảm nhận sự giải phóng',
    ],
  },
  'star-wish': {
    id: 'star-wish',
    title: 'Nghi Thức Ước Sao',
    subtitle: 'Ước nguyện dưới ánh sao',
    icon: 'Star',
    color: '#4ECDC4',
    duration: 3,
    category: 'manifestation',
    description: 'Gửi điều ước lên ngôi sao sáng nhất',
    steps: [
      'Nhìn lên bầu trời đêm',
      'Chọn ngôi sao sáng nhất',
      'Viết điều ước của bạn',
      'Gửi điều ước lên sao',
      'Tin rằng nó sẽ thành hiện thực',
    ],
  },
};

// ============ ENSURE RITUAL EXISTS IN DATABASE ============
/**
 * Creates a ritual in the database if it doesn't exist
 * Uses the local RITUAL_TYPES config as the source of truth
 * @param {string} ritualSlug - Ritual slug/id
 * @returns {Promise<Object|null>} The ritual record or null on failure
 */
const ensureRitualExists = async (ritualSlug) => {
  const ritualConfig = RITUAL_TYPES[ritualSlug];
  if (!ritualConfig) {
    console.warn('[ritualService] Unknown ritual type:', ritualSlug);
    return null;
  }

  try {
    // Check if ritual exists
    const { data: existing } = await supabase
      .from('vision_rituals')
      .select('id, name')
      .eq('id', ritualSlug)
      .single();

    if (existing) {
      return existing;
    }

    // Create ritual in database
    console.log('[ritualService] Creating ritual in database:', ritualSlug);

    // Map category from RITUAL_TYPES to database format
    const categoryMap = {
      'love': 'healing',
      'abundance': 'prosperity',
      'cleansing': 'spiritual',
      'manifestation': 'manifest',
      'release': 'release',
      'healing': 'healing',
    };

    const { data: created, error } = await supabase
      .from('vision_rituals')
      .insert({
        id: ritualSlug,
        name: ritualConfig.title,
        name_vi: ritualConfig.title,
        description: ritualConfig.description,
        category: categoryMap[ritualConfig.category] || 'spiritual',
        duration_minutes: ritualConfig.duration || 5,
        icon: ritualConfig.icon?.toLowerCase() || 'sparkles',
        color: ritualConfig.color || '#9C0612',
        xp_per_completion: 25,
        sort_order: Object.keys(RITUAL_TYPES).indexOf(ritualSlug) + 1,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      // If insert fails (e.g., RLS policy), log but don't throw
      console.warn('[ritualService] Failed to create ritual in DB:', error.message);
      return null;
    }

    console.log('[ritualService] Ritual created successfully:', ritualSlug);
    return created;
  } catch (err) {
    console.error('[ritualService] ensureRitualExists error:', err);
    return null;
  }
};

// ============ GET ALL RITUALS ============
export const getAllRituals = async () => {
  try {
    const { data, error } = await supabase
      .from('vision_rituals')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Merge with local configs (id is the slug in vision_rituals)
    return (data || []).map(ritual => ({
      ...ritual,
      ...RITUAL_TYPES[ritual.id],
    }));
  } catch (err) {
    console.error('[ritualService] getAllRituals error:', err);
    // Return local configs as fallback
    return Object.values(RITUAL_TYPES);
  }
};

// ============ GET RITUAL BY ID ============
export const getRitualById = async (ritualId) => {
  try {
    const { data, error } = await supabase
      .from('vision_rituals')
      .select('*')
      .eq('id', ritualId)
      .single();

    if (error) throw error;

    // In vision_rituals table, id IS the slug (VARCHAR)
    return {
      ...data,
      ...RITUAL_TYPES[data.id],
    };
  } catch (err) {
    console.error('[ritualService] getRitualById error:', err);
    return null;
  }
};

// ============ GET USER RITUAL PROGRESS ============
export const getUserRitualProgress = async (userId) => {
  try {
    // Get all user's ritual streaks
    const { data: streaks, error } = await supabase
      .from('vision_ritual_streaks')
      .select('*, ritual:vision_rituals(*)')
      .eq('user_id', userId);

    if (error) throw error;

    // In vision_rituals table, id IS the slug (VARCHAR)
    return (streaks || []).map(streak => ({
      ritualId: streak.ritual_id,
      ritualSlug: streak.ritual?.id, // id is the slug in this table
      currentStreak: streak.current_streak,
      bestStreak: streak.best_streak,
      totalCompletions: streak.total_completions,
      lastCompletedAt: streak.last_completed_at,
    }));
  } catch (err) {
    console.error('[ritualService] getUserRitualProgress error:', err);
    return [];
  }
};

// ============ COMPLETE RITUAL ============
export const completeRitual = async (userId, ritualSlug, content = null) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const ritualConfig = RITUAL_TYPES[ritualSlug] || {};

    // Ensure ritual exists in database, create if not
    let ritual = await ensureRitualExists(ritualSlug);

    if (!ritual) {
      // Fallback: ritual couldn't be found or created in DB
      // Still allow completion with local config
      console.log('[ritualService] Using local-only mode for ritual:', ritualSlug);

      if (!ritualConfig.title) {
        console.warn('[ritualService] Unknown ritual type:', ritualSlug);
        return { success: true, xpEarned: 25, newStreak: 1, isNewBest: false };
      }

      // Award XP directly without database tracking
      try {
        await addXPToUser(userId, XP_REWARDS.ritual_complete);
        await updateDailySummary(userId, { rituals_completed: 1 });
      } catch (xpErr) {
        console.warn('[ritualService] XP update failed:', xpErr.message);
      }

      // Create calendar event for local-only ritual (no sourceId - uses null)
      try {
        const reflection = content?.reflection || content?.notes || null;
        await calendarService.createEvent(userId, {
          title: `✨ ${ritualConfig.title}`,
          description: reflection ? `Suy ngẫm: ${reflection}` : ritualConfig.description || null,
          date: today,
          sourceType: EVENT_SOURCE_TYPES.DIVINATION,
          // sourceId omitted - will be null (local-only ritual)
          color: ritualConfig.color || '#9C0612',
          icon: 'sparkles',
          lifeArea: 'spiritual',
          isAllDay: true,
          metadata: {
            ritual_slug: ritualSlug,
            ritual_name: ritualConfig.title,
            reflection: reflection,
            xp_earned: XP_REWARDS.ritual_complete,
            streak: 1,
          },
        });
        console.log('[ritualService] Calendar event created for local ritual:', ritualSlug);
      } catch (calendarErr) {
        console.warn('[ritualService] Calendar event creation failed:', calendarErr.message);
      }

      return {
        success: true,
        xpEarned: XP_REWARDS.ritual_complete,
        newStreak: 1,
        isNewBest: false
      };
    }

    // Ritual exists in database - proceed with full tracking
    // Check if already completed today
    const { data: existing } = await supabase
      .from('vision_ritual_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('ritual_id', ritual.id)
      .gte('completed_at', today)
      .single();

    if (existing) {
      return { alreadyCompleted: true, xpEarned: 0, completionId: existing.id };
    }

    // Log completion and get the completion record (with UUID id)
    // Build insert data - only include content if provided (column may not exist in older schemas)
    const insertData = {
      user_id: userId,
      ritual_id: ritual.id,
      completed_at: new Date().toISOString(),
    };

    // Try insert with content first, fallback without content if column doesn't exist
    let completionRecord = null;
    let insertError = null;

    if (content !== null && content !== undefined) {
      // Try with content
      const result = await supabase
        .from('vision_ritual_completions')
        .insert({ ...insertData, content: content })
        .select('id')
        .single();

      if (result.error?.code === 'PGRST204' && result.error?.message?.includes('content')) {
        // content column doesn't exist, retry without it
        console.warn('[ritualService] content column not found, inserting without it');
        const retryResult = await supabase
          .from('vision_ritual_completions')
          .insert(insertData)
          .select('id')
          .single();
        completionRecord = retryResult.data;
        insertError = retryResult.error;
      } else {
        completionRecord = result.data;
        insertError = result.error;
      }
    } else {
      // No content provided, insert without it
      const result = await supabase
        .from('vision_ritual_completions')
        .insert(insertData)
        .select('id')
        .single();
      completionRecord = result.data;
      insertError = result.error;
    }

    if (insertError) {
      console.error('[ritualService] Failed to insert completion:', insertError);
      throw insertError;
    }

    const completionId = completionRecord?.id; // This is UUID

    // Update streak
    const streakResult = await updateRitualStreak(userId, ritual.id);

    // Award XP
    let xpEarned = XP_REWARDS.ritual_complete;

    // Bonus for streaks
    if (streakResult.newStreak === 7) {
      xpEarned += 50; // 7-day streak bonus
    } else if (streakResult.newStreak === 30) {
      xpEarned += 200; // 30-day streak bonus
    }

    await addXPToUser(userId, xpEarned);

    // Update daily summary
    await updateDailySummary(userId, {
      rituals_completed: 1,
    });

    // Create calendar event using completion UUID as sourceId
    try {
      const eventTitle = ritualConfig.title || ritual.name || 'Nghi thức hoàn thành';
      const reflection = content?.reflection || content?.notes || null;

      await calendarService.createEvent(userId, {
        title: `✨ ${eventTitle}`,
        description: reflection ? `Suy ngẫm: ${reflection}` : ritualConfig.description || null,
        date: today,
        sourceType: EVENT_SOURCE_TYPES.DIVINATION,
        sourceId: completionId, // Use completion UUID, not ritual.id (VARCHAR)
        color: ritualConfig.color || '#9C0612',
        icon: 'sparkles',
        lifeArea: 'spiritual',
        isAllDay: true,
        metadata: {
          ritual_slug: ritualSlug,
          ritual_name: ritual.name,
          reflection: reflection,
          xp_earned: xpEarned,
          streak: streakResult.newStreak,
          completion_id: completionId,
        },
      });
      console.log('[ritualService] Calendar event created for ritual:', ritualSlug);
    } catch (calendarErr) {
      // Don't fail the ritual completion if calendar event fails
      console.warn('[ritualService] Calendar event creation failed:', calendarErr.message);
    }

    // Log activity for activity feed
    try {
      await logActivity(userId, ACTIVITY_TYPES.RITUAL_COMPLETE, {
        title: `Hoàn thành ${ritualConfig.title || ritual.name}`,
        description: content?.reflection || null,
        referenceId: completionId,
        referenceType: 'ritual_completion',
        xpEarned,
        metadata: {
          ritual_slug: ritualSlug,
          ritual_name: ritualConfig.title || ritual.name,
          streak: streakResult.newStreak,
          is_new_best: streakResult.isNewBest,
        },
      });
      console.log('[ritualService] Activity logged for ritual:', ritualSlug);
    } catch (activityErr) {
      // Don't fail if activity logging fails
      console.warn('[ritualService] Activity logging failed:', activityErr?.message);
    }

    return {
      success: true,
      xpEarned,
      newStreak: streakResult.newStreak,
      isNewBest: streakResult.isNewBest,
      completionId,
    };
  } catch (err) {
    console.error('[ritualService] completeRitual error:', err);
    throw err;
  }
};

// ============ UPDATE RITUAL STREAK ============
const updateRitualStreak = async (userId, ritualId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get existing streak
    let { data: streak } = await supabase
      .from('vision_ritual_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('ritual_id', ritualId)
      .single();

    // Check if completed yesterday
    const { data: yesterdayCompletion } = await supabase
      .from('vision_ritual_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('ritual_id', ritualId)
      .gte('completed_at', yesterdayStr)
      .lt('completed_at', today)
      .single();

    let newStreak = 1;
    let isNewBest = false;

    if (streak) {
      // Continue or reset streak
      if (yesterdayCompletion) {
        newStreak = (streak.current_streak || 0) + 1;
      } else {
        newStreak = 1;
      }

      const newBest = Math.max(streak.best_streak || 0, newStreak);
      isNewBest = newBest > (streak.best_streak || 0);

      await supabase
        .from('vision_ritual_streaks')
        .update({
          current_streak: newStreak,
          best_streak: newBest,
          total_completions: (streak.total_completions || 0) + 1,
          last_completed_at: new Date().toISOString(),
        })
        .eq('id', streak.id);
    } else {
      // Create new streak
      await supabase
        .from('vision_ritual_streaks')
        .insert({
          user_id: userId,
          ritual_id: ritualId,
          current_streak: 1,
          best_streak: 1,
          total_completions: 1,
          last_completed_at: new Date().toISOString(),
        });

      isNewBest = true;
    }

    return { newStreak, isNewBest };
  } catch (err) {
    console.error('[ritualService] updateRitualStreak error:', err);
    return { newStreak: 1, isNewBest: false };
  }
};

// ============ GET TODAY'S RITUAL COMPLETIONS ============
export const getTodayCompletions = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('vision_ritual_completions')
      .select('*, ritual:vision_rituals(id, name)')
      .eq('user_id', userId)
      .gte('completed_at', today);

    if (error) throw error;

    // In vision_rituals table, id IS the slug (VARCHAR)
    return (data || []).map(c => c.ritual?.id).filter(Boolean);
  } catch (err) {
    console.error('[ritualService] getTodayCompletions error:', err);
    return [];
  }
};

// ============ GET RITUAL HISTORY ============
export const getRitualHistory = async (userId, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('vision_ritual_completions')
      .select('*, ritual:vision_rituals(*)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[ritualService] getRitualHistory error:', err);
    return [];
  }
};

// ============ GET RITUAL STATS ============
export const getRitualStats = async (userId) => {
  try {
    // Total completions
    const { count: totalCompletions } = await supabase
      .from('vision_ritual_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // This week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const { count: thisWeek } = await supabase
      .from('vision_ritual_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', weekStart.toISOString());

    // Best streak
    const { data: streaks } = await supabase
      .from('vision_ritual_streaks')
      .select('best_streak, current_streak')
      .eq('user_id', userId);

    const bestStreak = streaks?.reduce((max, s) => Math.max(max, s.best_streak || 0), 0) || 0;
    const currentStreak = streaks?.reduce((max, s) => Math.max(max, s.current_streak || 0), 0) || 0;

    // Favorite ritual
    const { data: favorite } = await supabase
      .from('vision_ritual_completions')
      .select('ritual:vision_rituals(slug, name)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    return {
      totalCompletions: totalCompletions || 0,
      thisWeek: thisWeek || 0,
      bestStreak,
      currentStreak,
      favoriteRitual: favorite?.ritual?.name || null,
    };
  } catch (err) {
    console.error('[ritualService] getRitualStats error:', err);
    return {
      totalCompletions: 0,
      thisWeek: 0,
      bestStreak: 0,
      currentStreak: 0,
      favoriteRitual: null,
    };
  }
};

// ============ GET RECOMMENDED RITUALS ============
export const getRecommendedRituals = async (userId) => {
  try {
    const allRituals = Object.values(RITUAL_TYPES);
    const todayCompletions = await getTodayCompletions(userId);

    // Filter out already completed today
    const available = allRituals.filter(r => !todayCompletions.includes(r.id));

    // Get time-based recommendations
    const hour = new Date().getHours();

    // Morning (5-11): Energizing rituals
    if (hour >= 5 && hour < 11) {
      return available.filter(r => ['gratitude-flow', 'heart-expansion', 'water-manifest'].includes(r.id));
    }

    // Afternoon (11-17): Manifestation rituals
    if (hour >= 11 && hour < 17) {
      return available.filter(r => ['letter-to-universe', 'star-wish', 'water-manifest'].includes(r.id));
    }

    // Evening (17-22): Release rituals
    if (hour >= 17 && hour < 22) {
      return available.filter(r => ['burn-release', 'cleansing-breath', 'gratitude-flow'].includes(r.id));
    }

    // Night (22-5): Calming rituals
    return available.filter(r => ['cleansing-breath', 'heart-expansion'].includes(r.id));
  } catch (err) {
    console.error('[ritualService] getRecommendedRituals error:', err);
    return Object.values(RITUAL_TYPES).slice(0, 3);
  }
};

// ============ SAVE REFLECTION (After completion) ============
/**
 * Save reflection for today's ritual completion and create calendar event
 * @param {string} userId - User ID
 * @param {string} ritualSlug - Ritual slug
 * @param {string} reflection - Reflection text
 * @returns {Promise<Object>}
 */
export const saveReflection = async (userId, ritualSlug, reflection) => {
  if (!userId || !ritualSlug || !reflection?.trim()) {
    console.warn('[ritualService] saveReflection: Missing required params');
    return { success: false, error: 'Missing required parameters' };
  }

  const today = new Date().toISOString().split('T')[0];
  const ritualConfig = RITUAL_TYPES[ritualSlug] || {};

  try {
    // Ensure ritual exists in database, create if not
    const ritual = await ensureRitualExists(ritualSlug);

    // Get today's completion for this ritual
    let completion = null;
    if (ritual) {
      // Try to get completion with content column first
      let result = await supabase
        .from('vision_ritual_completions')
        .select('id, content')
        .eq('user_id', userId)
        .eq('ritual_id', ritual.id)
        .gte('completed_at', today)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      // If content column doesn't exist, query without it
      if (result.error?.code === 'PGRST204' && result.error?.message?.includes('content')) {
        console.warn('[ritualService] content column not found, querying without it');
        result = await supabase
          .from('vision_ritual_completions')
          .select('id')
          .eq('user_id', userId)
          .eq('ritual_id', ritual.id)
          .gte('completed_at', today)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();
      }

      completion = result.data;
    }

    // Update completion with reflection (if content column exists)
    if (completion) {
      const existingContent = completion.content || {};
      const updatedContent = {
        ...existingContent,
        reflection: reflection.trim(),
      };

      // Try to update with content
      const updateResult = await supabase
        .from('vision_ritual_completions')
        .update({ content: updatedContent })
        .eq('id', completion.id);

      if (updateResult.error?.code === 'PGRST204' && updateResult.error?.message?.includes('content')) {
        // content column doesn't exist, skip update
        console.warn('[ritualService] content column not found, skipping reflection update');
      } else if (updateResult.error) {
        console.error('[ritualService] Failed to update completion with reflection:', updateResult.error);
      } else {
        console.log('[ritualService] Updated completion with reflection:', completion.id);
      }
    }

    // Create calendar event with reflection
    // Use completion.id (UUID) as sourceId, NOT ritual.id (VARCHAR)
    const eventTitle = ritualConfig.title || (ritual?.name) || 'Nghi thức hoàn thành';
    const sourceId = completion?.id || null; // UUID from vision_ritual_completions

    const calendarResult = await calendarService.createEvent(userId, {
      title: `✨ ${eventTitle}`,
      description: `Suy ngẫm: ${reflection.trim()}`,
      date: today,
      sourceType: EVENT_SOURCE_TYPES.DIVINATION,
      sourceId: sourceId, // Use completion UUID, not ritual.id (VARCHAR)
      color: ritualConfig.color || '#9C0612',
      icon: 'sparkles',
      lifeArea: 'spiritual',
      isAllDay: true,
      metadata: {
        ritual_slug: ritualSlug,
        ritual_name: eventTitle,
        reflection: reflection.trim(),
        saved_after_completion: true,
        completion_id: completion?.id || null,
      },
    });

    console.log('[ritualService] Calendar event created for reflection:', calendarResult.success);

    return {
      success: true,
      calendarEventCreated: calendarResult.success,
      completionId: completion?.id,
    };
  } catch (err) {
    console.error('[ritualService] saveReflection error:', err);
    return { success: false, error: err.message };
  }
};

export default {
  RITUAL_TYPES,
  getAllRituals,
  getRitualById,
  getUserRitualProgress,
  completeRitual,
  getTodayCompletions,
  getRitualHistory,
  getRitualStats,
  getRecommendedRituals,
  saveReflection,
};
