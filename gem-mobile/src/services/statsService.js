/**
 * Stats Service - Vision Board 2.0
 * Daily Score, XP, Streak, Combo calculations
 * Created: December 10, 2025
 */

import { supabase } from './supabase';

// ============ LEVELS ============
export const LEVELS = [
  { level: 1, title: 'Người Mới Bắt Đầu', badge: '🌱', xpRequired: 0 },
  { level: 2, title: 'Người Tập Sự', badge: '🌿', xpRequired: 100 },
  { level: 3, title: 'Người Nỗ Lực', badge: '🌳', xpRequired: 300 },
  { level: 4, title: 'Người Kiên Trì', badge: '⭐', xpRequired: 600 },
  { level: 5, title: 'Người Quyết Tâm', badge: '🌟', xpRequired: 1000 },
  { level: 6, title: 'Chiến Binh', badge: '⚔️', xpRequired: 1500 },
  { level: 7, title: 'Chiến Binh Bạc', badge: '🛡️', xpRequired: 2200 },
  { level: 8, title: 'Chiến Binh Vàng', badge: '👑', xpRequired: 3000 },
  { level: 9, title: 'Bậc Thầy', badge: '💎', xpRequired: 4000 },
  { level: 10, title: 'Huyền Thoại', badge: '🔱', xpRequired: 5500 },
  { level: 11, title: 'Đại Sư', badge: '🌌', xpRequired: 7500 },
  { level: 12, title: 'Bất Tử', badge: '✨', xpRequired: 10000 },
];

// ============ DAILY SCORE WEIGHTS ============
const DAILY_SCORE_WEIGHTS = {
  tasks: 0.40,        // 40%
  affirmations: 0.20, // 20%
  habits: 0.30,       // 30%
  ritual: 0.10,       // 10%
};

// ============ COMBO MULTIPLIERS ============
const COMBO_MULTIPLIERS = [1.0, 1.0, 1.25, 1.5, 2.0];

// ============ CALCULATE DAILY SCORE ============
export const calculateDailyScore = async (userId) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    // 1. Get today's tasks from vision_actions table
    const { data: actions } = await supabase
      .from('vision_actions')
      .select('is_completed')
      .eq('user_id', userId)
      .eq('due_date', today);

    let tasksTotal = actions?.length || 0;
    let tasksCompleted = actions?.filter(a => a.is_completed).length || 0;

    // 1b. Also count legacy actions from vision_board_widgets.content.steps
    // This ensures goals created before the actions table migration are still tracked
    const { data: goalWidgets } = await supabase
      .from('vision_board_widgets')
      .select('content')
      .eq('user_id', userId)
      .eq('widget_type', 'goal');

    if (goalWidgets && goalWidgets.length > 0) {
      goalWidgets.forEach(widget => {
        let content = widget.content;
        if (typeof content === 'string') {
          try { content = JSON.parse(content); } catch (e) { content = {}; }
        }
        // Get steps/actionSteps from legacy widget content
        const steps = [...(content?.steps || []), ...(content?.actionSteps || [])];
        if (steps.length > 0) {
          tasksTotal += steps.length;
          tasksCompleted += steps.filter(s => s.is_completed || s.completed).length;
        }
      });
    }

    const taskScore = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;

    // 2. Get today's affirmations
    const { data: affirmations } = await supabase
      .from('vision_affirmations')
      .select('times_per_day')
      .eq('user_id', userId);

    const { count: affLogsCount } = await supabase
      .from('vision_affirmation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', today);

    const affTotal = affirmations?.reduce((sum, a) => sum + (a.times_per_day || 3), 0) || 0;
    const affCompleted = affLogsCount || 0;
    const affScore = affTotal > 0 ? Math.min(100, (affCompleted / affTotal) * 100) : 0;

    // 3. Get today's habits
    const { data: habits } = await supabase
      .from('vision_habits')
      .select('id')
      .eq('user_id', userId);

    const { count: habitLogsCount } = await supabase
      .from('vision_habit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('log_date', today);

    const habitsTotal = habits?.length || 0;
    const habitsCompleted = habitLogsCount || 0;
    const habitScore = habitsTotal > 0 ? (habitsCompleted / habitsTotal) * 100 : 0;

    // 4. Check ritual completion
    const { count: ritualCount } = await supabase
      .from('vision_ritual_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', today);

    const ritualCompleted = ritualCount && ritualCount > 0;
    const ritualScore = ritualCompleted ? 100 : 0;

    // Calculate weighted score
    const dailyScore = Math.round(
      (taskScore * DAILY_SCORE_WEIGHTS.tasks) +
      (affScore * DAILY_SCORE_WEIGHTS.affirmations) +
      (habitScore * DAILY_SCORE_WEIGHTS.habits) +
      (ritualScore * DAILY_SCORE_WEIGHTS.ritual)
    );

    return {
      dailyScore,
      tasks: { completed: tasksCompleted, total: tasksTotal },
      affirmations: { completed: affCompleted, total: affTotal },
      habits: { completed: habitsCompleted, total: habitsTotal },
      ritualCompleted,
    };
  } catch (err) {
    console.error('[statsService] calculateDailyScore error:', err);
    return {
      dailyScore: 0,
      tasks: { completed: 0, total: 0 },
      affirmations: { completed: 0, total: 0 },
      habits: { completed: 0, total: 0 },
      ritualCompleted: false,
    };
  }
};

// ============ CALCULATE STREAK ============
export const calculateStreak = async (userId) => {
  try {
    console.log('[statsService] calculateStreak - fetching for user:', userId);

    const { data: stats, error } = await supabase
      .from('vision_user_stats')
      .select('current_streak, best_streak')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no row exists

    if (error) {
      console.error('[statsService] calculateStreak query error:', error);
    }

    console.log('[statsService] calculateStreak result:', stats);

    return {
      currentStreak: stats?.current_streak || 0,
      bestStreak: stats?.best_streak || 0,
    };
  } catch (err) {
    console.error('[statsService] calculateStreak error:', err);
    return { currentStreak: 0, bestStreak: 0 };
  }
};

// ============ UPDATE STREAK ============
export const updateStreak = async (userId) => {
  try {
    console.log('[statsService] updateStreak - updating for user:', userId);

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if user completed something yesterday
    const { data: yesterdaySummary, error: yesterdayError } = await supabase
      .from('vision_daily_summary')
      .select('daily_score')
      .eq('user_id', userId)
      .eq('summary_date', yesterday)
      .maybeSingle(); // Use maybeSingle to avoid error when no row exists

    if (yesterdayError) {
      console.error('[statsService] updateStreak yesterday query error:', yesterdayError);
    }

    // Get current streak
    const { data: stats, error: statsError } = await supabase
      .from('vision_user_stats')
      .select('current_streak, best_streak')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle to avoid error when no row exists

    if (statsError) {
      console.error('[statsService] updateStreak stats query error:', statsError);
    }

    console.log('[statsService] updateStreak - yesterday summary:', yesterdaySummary, 'current stats:', stats);

    let newStreak = 1;

    if (yesterdaySummary && yesterdaySummary.daily_score > 0) {
      // Continue streak
      newStreak = (stats?.current_streak || 0) + 1;
    }

    const newBestStreak = Math.max(stats?.best_streak || 0, newStreak);

    // Update
    const { error: upsertError } = await supabase
      .from('vision_user_stats')
      .upsert({
        user_id: userId,
        current_streak: newStreak,
        best_streak: newBestStreak,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('[statsService] updateStreak upsert error:', upsertError);
    }

    console.log('[statsService] updateStreak result:', { currentStreak: newStreak, bestStreak: newBestStreak });

    return { currentStreak: newStreak, bestStreak: newBestStreak };
  } catch (err) {
    console.error('[statsService] updateStreak error:', err);
    return { currentStreak: 0, bestStreak: 0 };
  }
};

// ============ CALCULATE COMBO ============
export const calculateCombo = async (userId) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    let categoriesCompleted = 0;

    // Check tasks from vision_actions table
    const { data: tasks } = await supabase
      .from('vision_actions')
      .select('is_completed')
      .eq('user_id', userId)
      .eq('due_date', today)
      .eq('is_completed', true)
      .limit(1);

    let hasCompletedTask = tasks && tasks.length > 0;

    // Also check legacy widget actions if no task found in vision_actions
    if (!hasCompletedTask) {
      const { data: goalWidgets } = await supabase
        .from('vision_board_widgets')
        .select('content')
        .eq('user_id', userId)
        .eq('widget_type', 'goal');

      if (goalWidgets && goalWidgets.length > 0) {
        for (const widget of goalWidgets) {
          let content = widget.content;
          if (typeof content === 'string') {
            try { content = JSON.parse(content); } catch (e) { content = {}; }
          }
          const steps = [...(content?.steps || []), ...(content?.actionSteps || [])];
          if (steps.some(s => s.is_completed || s.completed)) {
            hasCompletedTask = true;
            break;
          }
        }
      }
    }

    if (hasCompletedTask) categoriesCompleted++;

    // Check affirmations
    const { count: affCount } = await supabase
      .from('vision_affirmation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', today);
    if (affCount && affCount > 0) categoriesCompleted++;

    // Check habits
    const { count: habitCount } = await supabase
      .from('vision_habit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('log_date', today);
    if (habitCount && habitCount > 0) categoriesCompleted++;

    // Check ritual
    const { count: ritualCount } = await supabase
      .from('vision_ritual_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', today);
    if (ritualCount && ritualCount > 0) categoriesCompleted++;

    // Calculate multiplier
    const comboMultiplier = COMBO_MULTIPLIERS[Math.min(categoriesCompleted, 4)];

    return {
      categoriesCompleted,
      comboMultiplier,
      comboLabel: `x${comboMultiplier.toFixed(2)}`,
    };
  } catch (err) {
    console.error('[statsService] calculateCombo error:', err);
    return { categoriesCompleted: 0, comboMultiplier: 1.0, comboLabel: 'x1.00' };
  }
};

// ============ GET TODAY XP ============
export const getTodayXP = async (userId) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    const { data } = await supabase
      .from('vision_daily_summary')
      .select('xp_earned')
      .eq('user_id', userId)
      .eq('summary_date', today)
      .single();

    return data?.xp_earned || 0;
  } catch (err) {
    return 0;
  }
};

// ============ GET TOTAL XP ============
export const getTotalXP = async (userId) => {
  try {
    const { data } = await supabase
      .from('vision_user_stats')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    return data?.total_xp || 0;
  } catch (err) {
    return 0;
  }
};

// ============ GET USER LEVEL ============
export const getUserLevel = async (userId) => {
  try {
    const totalXP = await getTotalXP(userId);
    return getLevelFromXP(totalXP);
  } catch (err) {
    return {
      level: 1,
      title: 'Người Mới Bắt Đầu',
      badge: '🌱',
      totalXP: 0,
      progress: 0,
      xpToNext: 100,
    };
  }
};

// ============ GET LEVEL FROM XP ============
export const getLevelFromXP = (totalXP) => {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || LEVELS[i];
      break;
    }
  }

  const xpInLevel = totalXP - currentLevel.xpRequired;
  const xpForLevel = nextLevel.xpRequired - currentLevel.xpRequired;
  const progress = xpForLevel > 0 ? (xpInLevel / xpForLevel) * 100 : 100;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    badge: currentLevel.badge,
    totalXP,
    progress: Math.min(100, Math.round(progress)),
    xpToNext: Math.max(0, nextLevel.xpRequired - totalXP),
    nextLevel: nextLevel,
  };
};

// ============ GET WEEKLY PROGRESS ============
export const getWeeklyProgress = async (userId) => {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = today.toISOString().split('T')[0];

    console.log('[statsService] getWeeklyProgress - fetching for user:', userId, 'from', startDateStr, 'to', endDateStr);

    // Fetch all summaries for the week in one query
    const { data: summaries, error } = await supabase
      .from('vision_daily_summary')
      .select('*')
      .eq('user_id', userId)
      .gte('summary_date', startDateStr)
      .lte('summary_date', endDateStr);

    if (error) {
      console.error('[statsService] getWeeklyProgress query error:', error);
    }

    console.log('[statsService] getWeeklyProgress - found summaries:', summaries?.length || 0);

    // Create a map for quick lookup
    const summaryMap = {};
    (summaries || []).forEach(s => {
      summaryMap[s.summary_date] = s;
    });

    // Build days array
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const summary = summaryMap[dateStr];

      days.push({
        date: dateStr,
        dayName: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()],
        score: summary?.daily_score || 0,
        tasksCompleted: summary?.actions_completed || 0,
        xpEarned: summary?.xp_earned || 0,
      });
    }

    const average = Math.round(days.reduce((sum, d) => sum + d.score, 0) / 7);
    const totalXP = days.reduce((sum, d) => sum + d.xpEarned, 0);

    console.log('[statsService] getWeeklyProgress result:', { daysCount: days.length, average, totalXP });

    return { days, average, totalXP };
  } catch (err) {
    console.error('[statsService] getWeeklyProgress error:', err);
    return { days: [], average: 0, totalXP: 0 };
  }
};

// ============ GET LIFE AREA SCORES (for Radar Chart) ============
export const getLifeAreaScores = async (userId) => {
  const areas = ['finance', 'career', 'health', 'relationships', 'personal', 'spiritual'];

  try {
    console.log('[statsService] getLifeAreaScores - fetching for user:', userId);

    // Fetch all goals and habits in parallel (2 queries instead of 12)
    const [goalsResult, habitsResult] = await Promise.all([
      supabase
        .from('vision_goals')
        .select('life_area, progress_percent')
        .eq('user_id', userId)
        .eq('status', 'active'),
      supabase
        .from('vision_habits')
        .select('life_area, current_streak, target_streak')
        .eq('user_id', userId),
    ]);

    if (goalsResult.error) {
      console.error('[statsService] getLifeAreaScores goals error:', goalsResult.error);
    }
    if (habitsResult.error) {
      console.error('[statsService] getLifeAreaScores habits error:', habitsResult.error);
    }

    const goals = goalsResult.data || [];
    const habits = habitsResult.data || [];

    console.log('[statsService] getLifeAreaScores - found goals:', goals.length, 'habits:', habits.length);

    // Calculate scores for each area
    const scores = {};
    for (const area of areas) {
      const areaGoals = goals.filter(g => g.life_area === area);
      const areaHabits = habits.filter(h => h.life_area === area);

      const goalScore = areaGoals.length > 0
        ? areaGoals.reduce((sum, g) => sum + (g.progress_percent || 0), 0) / areaGoals.length
        : 50;

      const habitScore = areaHabits.length > 0
        ? areaHabits.reduce((sum, h) => sum + Math.min(100, ((h.current_streak || 0) / (h.target_streak || 30)) * 100), 0) / areaHabits.length
        : 50;

      scores[area] = Math.round((goalScore * 0.6) + (habitScore * 0.4));
    }

    console.log('[statsService] getLifeAreaScores result:', scores);

    return scores;
  } catch (err) {
    console.error('[statsService] getLifeAreaScores error:', err);
    return {
      finance: 50, career: 50, health: 50,
      relationships: 50, personal: 50, spiritual: 50,
    };
  }
};

// ============ SAVE DAILY SUMMARY ============
export const saveDailySummary = async (userId, summaryData) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    console.log('[statsService] saveDailySummary - saving for user:', userId, 'date:', today, 'data:', summaryData);

    const { error } = await supabase
      .from('vision_daily_summary')
      .upsert({
        user_id: userId,
        summary_date: today,
        daily_score: summaryData.dailyScore || 0,
        actions_completed: summaryData.tasks?.completed || 0,
        actions_total: summaryData.tasks?.total || 0,
        affirmations_completed: summaryData.affirmations?.completed || 0,
        habits_completed: summaryData.habits?.completed || 0,
        ritual_completed: summaryData.ritualCompleted || false,
        xp_earned: summaryData.xpEarned || 0,
      }, { onConflict: 'user_id,summary_date' });

    if (error) {
      console.error('[statsService] saveDailySummary upsert error:', error);
      return false;
    }

    console.log('[statsService] saveDailySummary - saved successfully');
    return true;
  } catch (err) {
    console.error('[statsService] saveDailySummary error:', err);
    return false;
  }
};

// ============ RECALCULATE DAILY SCORE ============
// Call this after any action completion
export const recalculateDailyScore = async (userId) => {
  try {
    const scoreData = await calculateDailyScore(userId);
    const comboData = await calculateCombo(userId);

    // Apply combo multiplier to score (optional)
    const finalScore = Math.min(100, Math.round(scoreData.dailyScore * comboData.comboMultiplier));

    // Save to daily summary
    await saveDailySummary(userId, {
      ...scoreData,
      dailyScore: finalScore,
    });

    return {
      ...scoreData,
      dailyScore: finalScore,
      combo: comboData,
    };
  } catch (err) {
    console.error('[statsService] recalculateDailyScore error:', err);
    return null;
  }
};

// ============ GET TODAY'S ACTIVITY COUNTS ============
// Returns counts for affirmations, habits completed today
// Primary source: vision_daily_summary (saved by VisionBoardScreen widgets)
export const getTodayActivityCounts = async (userId) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    // Primary source: Read from today's daily summary (saved by VisionBoardScreen)
    const { data: summaryData, error: summaryError } = await supabase
      .from('vision_daily_summary')
      .select('affirmations_completed, habits_completed, ritual_completed, actions_completed')
      .eq('user_id', userId)
      .eq('summary_date', today)
      .single();

    if (summaryData && !summaryError) {
      console.log('[statsService] getTodayActivityCounts from summary:', summaryData);
      return {
        affirmationsCompleted: summaryData.affirmations_completed || 0,
        habitsCompleted: summaryData.habits_completed || 0,
        ritualsCompleted: summaryData.ritual_completed ? 1 : 0,
        goalsCompleted: summaryData.actions_completed || 0,
      };
    }

    // Fallback: Get ritual completions today from ritual_completions table
    const { count: ritualsCount } = await supabase
      .from('vision_ritual_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', today);

    // Fallback: Get completed calendar events (goals/tasks) today
    const { count: goalsCount } = await supabase
      .from('vision_calendar_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('event_date', today)
      .eq('is_completed', true);

    console.log('[statsService] getTodayActivityCounts fallback:', { ritualsCount, goalsCount });

    return {
      affirmationsCompleted: 0,
      habitsCompleted: 0,
      ritualsCompleted: ritualsCount || 0,
      goalsCompleted: goalsCount || 0,
    };
  } catch (err) {
    console.error('[statsService] getTodayActivityCounts error:', err);
    return {
      affirmationsCompleted: 0,
      habitsCompleted: 0,
      ritualsCompleted: 0,
      goalsCompleted: 0,
    };
  }
};

// ============ GET FULL STATS ============
export const getFullStats = async (userId) => {
  try {
    const [dailyScore, streak, combo, todayXP, level, weeklyProgress, lifeScores, todayActivity] = await Promise.all([
      calculateDailyScore(userId),
      calculateStreak(userId),
      calculateCombo(userId),
      getTodayXP(userId),
      getUserLevel(userId),
      getWeeklyProgress(userId),
      getLifeAreaScores(userId),
      getTodayActivityCounts(userId),
    ]);

    return {
      dailyScore,
      streak,
      combo,
      todayXP,
      level,
      weeklyProgress,
      lifeScores,
      todayActivity,
    };
  } catch (err) {
    console.error('[statsService] getFullStats error:', err);
    return null;
  }
};

export default {
  LEVELS,
  calculateDailyScore,
  calculateStreak,
  updateStreak,
  calculateCombo,
  getTodayXP,
  getTotalXP,
  getTodayActivityCounts,
  getUserLevel,
  getLevelFromXP,
  getWeeklyProgress,
  getLifeAreaScores,
  saveDailySummary,
  recalculateDailyScore,
  getFullStats,
};
