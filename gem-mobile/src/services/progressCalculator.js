/**
 * Progress Calculator Service
 * Smart progress calculation for Vision Board
 *
 * Progress Formula:
 * - Actions: 60% weight
 * - Affirmations: 20% weight
 * - Habits: 20% weight
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 */

// Progress weights
export const PROGRESS_WEIGHTS = {
  actions: 0.6, // 60%
  affirmations: 0.2, // 20%
  habits: 0.2, // 20%
};

// XP Rewards
export const XP_REWARDS = {
  // Actions
  action_complete: 20,
  action_complete_early: 30,
  action_complete_streak: 5,

  // Affirmations
  affirmation_complete: 5,
  affirmation_all_daily: 15,
  affirmation_streak_7: 50,
  affirmation_streak_30: 200,

  // Habits
  habit_complete: 10,
  habit_streak_7: 70,
  habit_streak_30: 300,

  // Goals
  milestone_25: 50,
  milestone_50: 100,
  milestone_75: 150,
  goal_complete: 500,

  // Combos
  daily_combo_all: 50,
  weekly_perfect: 200,
  monthly_perfect: 1000,

  // Engagement
  daily_checkin: 10,
  add_goal: 20,
};

// Level thresholds and titles
export const LEVELS = [
  { level: 1, xp: 0, title: 'Người Mới Bắt Đầu', badge: 'seedling' },
  { level: 2, xp: 100, title: 'Người Tập Sự', badge: 'sprout' },
  { level: 3, xp: 300, title: 'Người Nỗ Lực', badge: 'tree' },
  { level: 4, xp: 600, title: 'Người Kiên Trì', badge: 'star' },
  { level: 5, xp: 1000, title: 'Người Quyết Tâm', badge: 'star' },
  { level: 6, xp: 1500, title: 'Chiến Binh', badge: 'sword' },
  { level: 7, xp: 2200, title: 'Chiến Binh Bạc', badge: 'shield' },
  { level: 8, xp: 3000, title: 'Chiến Binh Vàng', badge: 'crown' },
  { level: 9, xp: 4000, title: 'Bậc Thầy', badge: 'gem' },
  { level: 10, xp: 5500, title: 'Huyền Thoại', badge: 'trident' },
  { level: 11, xp: 7500, title: 'Đại Sư', badge: 'galaxy' },
  { level: 12, xp: 10000, title: 'Bất Tử', badge: 'sparkles' },
];

// Combo multipliers
export const COMBO_MULTIPLIERS = {
  0: 1.0, // No combo
  1: 1.0, // First completion
  2: 1.25, // 2 completions
  3: 1.5, // Full combo (all 3)
};

class ProgressCalculator {
  /**
   * Calculate daily progress score (0-100)
   * @param {Object} dailyStats - Daily completion stats
   * @returns {number}
   */
  calculateDailyScore(dailyStats) {
    const {
      actionsCompleted = 0,
      actionsTotal = 1,
      affirmationsCompleted = 0,
      affirmationsTotal = 1,
      habitsCompleted = 0,
      habitsTotal = 1,
    } = dailyStats;

    // Calculate individual percentages
    const actionsPct = actionsTotal > 0
      ? (actionsCompleted / actionsTotal) * 100
      : 0;
    const affirmationsPct = affirmationsTotal > 0
      ? (affirmationsCompleted / affirmationsTotal) * 100
      : 0;
    const habitsPct = habitsTotal > 0
      ? (habitsCompleted / habitsTotal) * 100
      : 0;

    // Apply weights
    const weightedScore =
      (actionsPct * PROGRESS_WEIGHTS.actions) +
      (affirmationsPct * PROGRESS_WEIGHTS.affirmations) +
      (habitsPct * PROGRESS_WEIGHTS.habits);

    return Math.round(weightedScore);
  }

  /**
   * Calculate goal progress from linked actions
   * @param {Object} goal - Goal widget
   * @param {Array} actions - Linked actions
   * @returns {number} Progress 0-100
   */
  calculateGoalProgress(goal, actions) {
    if (!actions || actions.length === 0) {
      return goal?.content?.progress || 0;
    }

    const completedActions = actions.filter(a => a.is_completed).length;
    const totalActions = actions.length;

    const progress = Math.round((completedActions / totalActions) * 100);
    return progress;
  }

  /**
   * Get current level from XP
   * @param {number} totalXP - Total XP
   * @returns {Object} Level info
   */
  getLevelFromXP(totalXP) {
    let currentLevel = LEVELS[0];

    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalXP >= LEVELS[i].xp) {
        currentLevel = LEVELS[i];
        break;
      }
    }

    const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
    const xpToNext = nextLevel
      ? nextLevel.xp - totalXP
      : 0;
    const xpProgress = nextLevel
      ? ((totalXP - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100
      : 100;

    return {
      ...currentLevel,
      totalXP,
      xpToNext,
      xpProgress: Math.round(xpProgress),
      nextLevel: nextLevel?.title || 'Tối Đa',
      isMaxLevel: !nextLevel,
    };
  }

  /**
   * Calculate XP for a completion
   * @param {string} type - Completion type
   * @param {Object} context - Additional context
   * @returns {number} XP amount
   */
  calculateXP(type, context = {}) {
    let baseXP = XP_REWARDS[type] || 0;

    // Apply combo multiplier
    if (context.comboCount && COMBO_MULTIPLIERS[context.comboCount]) {
      baseXP = Math.round(baseXP * COMBO_MULTIPLIERS[context.comboCount]);
    }

    // Streak bonus
    if (context.streakDays && context.streakDays > 0) {
      const streakBonus = Math.min(context.streakDays, 30) * 0.5; // Max 15 bonus
      baseXP = Math.round(baseXP + streakBonus);
    }

    return baseXP;
  }

  /**
   * Get combo multiplier
   * @param {number} comboCount - Number of categories completed
   * @returns {number} Multiplier
   */
  getComboMultiplier(comboCount) {
    return COMBO_MULTIPLIERS[comboCount] || 1.0;
  }

  /**
   * Check if full combo achieved
   * @param {Object} dailyStatus - Daily completion status
   * @returns {boolean}
   */
  isFullCombo(dailyStatus) {
    return (
      dailyStatus.actionsCompleted > 0 &&
      dailyStatus.affirmationsCompleted > 0 &&
      dailyStatus.habitsCompleted > 0
    );
  }

  /**
   * Calculate life area score
   * @param {Array} widgets - Widgets for a life area
   * @returns {number} Score 0-100
   */
  calculateLifeAreaScore(widgets) {
    if (!widgets || widgets.length === 0) return 0;

    const completed = widgets.filter(w => w.is_completed).length;
    return Math.round((completed / widgets.length) * 100);
  }

  /**
   * Calculate overall life balance score
   * @param {Object} areaScores - Scores per life area
   * @returns {number} Average score
   */
  calculateLifeBalanceScore(areaScores) {
    const areas = Object.values(areaScores);
    if (areas.length === 0) return 0;

    const total = areas.reduce((sum, score) => sum + score, 0);
    return Math.round(total / areas.length);
  }

  /**
   * Get milestone reached for goal
   * @param {number} progress - Goal progress 0-100
   * @returns {Object|null} Milestone info
   */
  getMilestoneReached(progress) {
    const milestones = [
      { threshold: 25, label: '25%', xp: XP_REWARDS.milestone_25 },
      { threshold: 50, label: '50%', xp: XP_REWARDS.milestone_50 },
      { threshold: 75, label: '75%', xp: XP_REWARDS.milestone_75 },
      { threshold: 100, label: '100%', xp: XP_REWARDS.goal_complete },
    ];

    // Return highest milestone reached
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (progress >= milestones[i].threshold) {
        return milestones[i];
      }
    }

    return null;
  }

  /**
   * Calculate weekly stats
   * @param {Array} weeklyData - Array of daily stats for 7 days
   * @returns {Object} Weekly summary
   */
  calculateWeeklyStats(weeklyData) {
    if (!weeklyData || weeklyData.length === 0) {
      return {
        totalScore: 0,
        averageScore: 0,
        perfectDays: 0,
        totalXP: 0,
        bestDay: null,
      };
    }

    let totalScore = 0;
    let totalXP = 0;
    let perfectDays = 0;
    let bestDay = null;
    let bestScore = 0;

    weeklyData.forEach(day => {
      const score = day.total_score || 0;
      totalScore += score;
      totalXP += day.xp_earned || 0;

      // Check if perfect day (all tasks done)
      if (day.actions_completed > 0 &&
        day.affirmations_completed > 0 &&
        day.habits_completed > 0) {
        perfectDays++;
      }

      if (score > bestScore) {
        bestScore = score;
        bestDay = day;
      }
    });

    return {
      totalScore,
      averageScore: Math.round(totalScore / weeklyData.length),
      perfectDays,
      totalXP,
      bestDay,
    };
  }

  /**
   * Format XP display
   * @param {number} xp - XP amount
   * @returns {string}
   */
  formatXP(xp) {
    if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}K`;
    }
    return xp.toString();
  }

  /**
   * Get progress color based on score
   * @param {number} score - Score 0-100
   * @returns {string} Color hex
   */
  getProgressColor(score) {
    if (score >= 80) return '#3AF7A6'; // Green - Excellent
    if (score >= 60) return '#FFBD59'; // Gold - Good
    if (score >= 40) return '#00F0FF'; // Cyan - Average
    if (score >= 20) return '#6A5BFF'; // Purple - Low
    return '#9C0612'; // Burgundy - Very low
  }

  /**
   * Get streak message
   * @param {number} streak - Current streak
   * @returns {string}
   */
  getStreakMessage(streak) {
    if (streak >= 100) return 'Huyền thoại! 100+ ngày liên tiếp!';
    if (streak >= 30) return 'Tuyệt vời! Một tháng kiên trì!';
    if (streak >= 14) return 'Xuất sắc! 2 tuần không nghỉ!';
    if (streak >= 7) return 'Một tuần vàng!';
    if (streak >= 3) return 'Khởi đầu tốt!';
    if (streak > 0) return `${streak} ngày liên tiếp`;
    return 'Bắt đầu streak mới!';
  }
}

export default new ProgressCalculator();
