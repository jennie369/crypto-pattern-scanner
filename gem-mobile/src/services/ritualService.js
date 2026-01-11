/**
 * Ritual Service - Vision Board 2.0
 * Ritual management, completion tracking, streak system
 * Created: December 10, 2025
 */

import { supabase } from './supabase';
import { addXPToUser, updateDailySummary, XP_REWARDS } from './goalService';

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

// ============ GET ALL RITUALS ============
export const getAllRituals = async () => {
  try {
    const { data, error } = await supabase
      .from('vision_rituals')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Merge with local configs
    return (data || []).map(ritual => ({
      ...ritual,
      ...RITUAL_TYPES[ritual.slug],
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

    return {
      ...data,
      ...RITUAL_TYPES[data.slug],
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

    return (streaks || []).map(streak => ({
      ritualId: streak.ritual_id,
      ritualSlug: streak.ritual?.slug,
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
    // Get ritual info
    let { data: ritual } = await supabase
      .from('vision_rituals')
      .select('id, slug, name')
      .eq('slug', ritualSlug)
      .single();

    if (!ritual) {
      // Ritual not in database - use local config instead
      const ritualType = RITUAL_TYPES[ritualSlug];
      if (!ritualType) {
        console.warn('[ritualService] Unknown ritual type:', ritualSlug);
        return { success: true, xpEarned: 25, newStreak: 1, isNewBest: false };
      }

      // Use local config - don't try to auto-create in database
      // This avoids RLS/permission errors while still completing the ritual
      console.log('[ritualService] Using local ritual config for:', ritualSlug);

      // Award XP directly without database tracking
      try {
        await addXPToUser(userId, XP_REWARDS.ritual_complete);
        await updateDailySummary(userId, { rituals_completed: 1 });
      } catch (xpErr) {
        console.warn('[ritualService] XP update failed:', xpErr.message);
      }

      return {
        success: true,
        xpEarned: XP_REWARDS.ritual_complete,
        newStreak: 1,
        isNewBest: false
      };
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if already completed today
    const { data: existing } = await supabase
      .from('vision_ritual_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('ritual_id', ritual.id)
      .gte('completed_at', today)
      .single();

    if (existing) {
      return { alreadyCompleted: true, xpEarned: 0 };
    }

    // Log completion
    await supabase
      .from('vision_ritual_completions')
      .insert({
        user_id: userId,
        ritual_id: ritual.id,
        content: content,
        completed_at: new Date().toISOString(),
      });

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

    return {
      success: true,
      xpEarned,
      newStreak: streakResult.newStreak,
      isNewBest: streakResult.isNewBest,
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
      .select('*, ritual:vision_rituals(slug, name)')
      .eq('user_id', userId)
      .gte('completed_at', today);

    if (error) throw error;

    return (data || []).map(c => c.ritual?.slug).filter(Boolean);
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
};
