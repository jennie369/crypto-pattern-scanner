/**
 * Vision Board Services - Barrel Export
 *
 * @fileoverview Centralized exports for all Vision Board services
 */

// Tier Service - Quota and access control
export {
  TIER_LIMITS,
  TIER_FEATURES,
  getEffectiveTier,
  checkGoalQuota,
  checkHabitQuota,
  checkAffirmationQuota,
  getAllQuotas,
  hasFeature,
  getUpgradeBenefits,
} from './tierService';

// Goal Service - Goal management
export {
  LIFE_AREAS,
  XP_REWARDS,
  PROGRESS_WEIGHTS,
  GOAL_STATUS,
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  completeGoal,
  createMilestones,
  toggleMilestone,
  createActions,
  addAction,
  toggleAction,
  deleteAction,
  calculateGoalProgress,
  updateGoalProgress,
  awardXP,
  isGoalOverdue,
  getGoalsSummary,
} from './goalService';

// Habit Service - Habit tracking
export {
  HABIT_FREQUENCIES,
  HABIT_CATEGORIES,
  HABIT_XP,
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  checkHabit,
  uncheckHabit,
  calculateStreak,
  getStreakHistory,
  getHabitsSummary,
  getTodaysHabits,
} from './habitService';

// Affirmation Service - Affirmation management
export {
  AFFIRMATION_CATEGORIES,
  AFFIRMATION_XP,
  DEFAULT_AFFIRMATIONS,
  getAffirmations,
  getAffirmationById,
  createAffirmation,
  updateAffirmation,
  deleteAffirmation,
  toggleFavorite,
  logReading,
  getTodaysAffirmation,
  getRandomAffirmation,
  getAffirmationsSummary,
  seedDefaultAffirmations,
} from './affirmationService';

// Stats Service - User statistics and tracking
export {
  XP_LEVELS,
  DAILY_SCORE_WEIGHTS,
  getUserStats,
  calculateLevel,
  calculateLevelProgress,
  updateUserStats,
  getDailyScore,
  saveDailySummary,
  getDailySummaryHistory,
  updateActivityStreak,
  getDashboardStats,
  getActivityCalendar,
  getXPHistory,
} from './statsService';

// Default export with all services grouped
export default {
  tier: require('./tierService').default,
  goal: require('./goalService').default,
  habit: require('./habitService').default,
  affirmation: require('./affirmationService').default,
  stats: require('./statsService').default,
};
