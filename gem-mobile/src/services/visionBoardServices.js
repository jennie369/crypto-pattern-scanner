/**
 * Vision Board Services Index
 * Central export for all Vision Board 2.0 services
 * Created: December 10, 2025
 */

// Goal System
export * from './goalService';
export { default as goalService } from './goalService';

// Actions/Tasks
export * from './actionService';
export { default as actionService } from './actionService';

// Affirmations
export * from './affirmationService';
export { default as affirmationService } from './affirmationService';

// Habits
export * from './habitService';
export { default as habitService } from './habitService';

// Stats & Gamification
export * from './statsService';
export { default as statsService } from './statsService';

// Rituals
export * from './ritualService';
export { default as ritualService } from './ritualService';

// Activity Feed (Phase 2)
export * from './activityService';
export { default as activityService } from './activityService';

// Ritual Recommendations (Phase 2)
export * from './ritualRecommendationService';
export { default as ritualRecommendationService } from './ritualRecommendationService';

// Divination (Tarot & I Ching)
export * from './tarotService';
export { default as tarotService } from './tarotService';

export * from './ichingService';
export { default as ichingService } from './ichingService';

export * from './divinationService';
export { default as divinationService } from './divinationService';

// ============ COMBINED DATA FETCHERS ============

/**
 * Get complete Vision Board data for a user
 * Use in VisionBoardScreen to load all data at once
 */
export const getVisionBoardData = async (userId) => {
  const [
    goalsData,
    todayActionsData,
    todayHabitsData,
    todayAffirmationsData,
    statsData,
    recentReadings,
  ] = await Promise.all([
    require('./goalService').getGoals(userId),
    require('./actionService').getTodayActions(userId),
    require('./habitService').getTodayHabits(userId),
    require('./affirmationService').getTodayAffirmations(userId),
    require('./statsService').getFullStats(userId),
    require('./divinationService').getRecentReadings(userId, 3),
  ]);

  return {
    goals: goalsData,
    todayActions: todayActionsData,
    todayHabits: todayHabitsData,
    todayAffirmations: todayAffirmationsData,
    stats: statsData,
    recentReadings,
  };
};

/**
 * Get daily summary for home widget
 */
export const getDailySummary = async (userId) => {
  const [
    habitsSummary,
    affirmationsSummary,
    actionsSummary,
    dailyScore,
  ] = await Promise.all([
    require('./habitService').getHabitsSummary(userId),
    require('./affirmationService').getAffirmationsSummary(userId),
    require('./actionService').getActionsSummary(userId),
    require('./statsService').calculateDailyScore(userId),
  ]);

  return {
    habits: habitsSummary,
    affirmations: affirmationsSummary,
    actions: actionsSummary,
    dailyScore,
  };
};

/**
 * Get weekly progress for radar chart
 */
export const getWeeklyRadarData = async (userId) => {
  const weeklyProgress = await require('./statsService').getWeeklyProgress(userId);
  const lifeAreaScores = await require('./statsService').getLifeAreaScores(userId);

  return {
    weeklyProgress,
    lifeAreaScores,
  };
};
