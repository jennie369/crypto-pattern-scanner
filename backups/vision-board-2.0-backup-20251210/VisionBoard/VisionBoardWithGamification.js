/**
 * VisionBoardWithGamification - Wrapper Component
 *
 * This file wraps VisionBoardScreen with gamification features:
 * - StreakBanner (top)
 * - ComboTracker (before content)
 * - HabitGrid (optional, toggled)
 * - Achievement Modal
 * - Streak History Modal
 *
 * Gamification tracking happens automatically when user interacts
 * with existing features (affirmation, habit, goal).
 */

import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

// Gamification components
import {
  StreakBanner,
  ComboTracker,
  HabitGrid,
  AchievementModal,
  StreakHistoryModal,
} from '../../components/VisionBoard';

// Gamification hook
import useGamification from '../../hooks/useGamification';

// Auth context
import { useAuth } from '../../contexts/AuthContext';

// Tokens
import { COLORS, SPACING, GRADIENTS } from '../../utils/tokens';

/**
 * GamificationHeader Component
 * Shows StreakBanner and ComboTracker at top of VisionBoard
 *
 * @param {Object} stats - Real-time stats from VisionBoardScreen for combo tracker
 *   - goalsCompleted: number of completed goals
 *   - goalsTotal: total number of goals
 *   - affirmationsCompleted: number of affirmations completed today
 *   - habitsPercent: percentage of habits completed
 */
export const GamificationHeader = memo(({
  userId,
  onOpenStreakHistory,
  stats = null, // Real-time stats from parent for combo updates
}) => {
  const {
    loading,
    dailyStatus,
    streak,
    isStreakAtRisk,
    refreshData,
  } = useGamification(userId);

  // Refresh gamification data when screen comes into focus for real-time sync
  useFocusEffect(
    useCallback(() => {
      if (userId && refreshData) {
        console.log('[GamificationHeader] Screen focused, refreshing data...');
        refreshData();
      }
    }, [userId, refreshData])
  );

  if (loading) return null;

  // Use real-time stats from parent if provided, otherwise fallback to gamification hook data
  // This ensures combo tracker updates immediately when user interacts with goals/affirmations
  const comboStatus = stats ? {
    affirmationDone: stats.affirmationsCompleted > 0,
    habitDone: stats.habitsPercent > 0,
    goalDone: stats.goalsCompleted > 0,
    comboCount: (stats.affirmationsCompleted > 0 ? 1 : 0) +
                (stats.habitsPercent > 0 ? 1 : 0) +
                (stats.goalsCompleted > 0 ? 1 : 0),
    multiplier: ((stats.affirmationsCompleted > 0 ? 1 : 0) +
                 (stats.habitsPercent > 0 ? 1 : 0) +
                 (stats.goalsCompleted > 0 ? 1 : 0)) === 3 ? 2.0 : 1.0,
  } : dailyStatus;

  return (
    <View style={styles.gamificationHeader}>
      {/* Streak Banner */}
      <StreakBanner
        currentStreak={streak.currentStreak}
        longestStreak={streak.longestStreak}
        freezeCount={streak.freezeCount}
        isAtRisk={isStreakAtRisk}
        onPress={onOpenStreakHistory}
      />

      {/* Combo Tracker - Now uses real-time stats when available */}
      <ComboTracker
        affirmationDone={comboStatus.affirmationDone}
        habitDone={comboStatus.habitDone}
        goalDone={comboStatus.goalDone}
        comboCount={comboStatus.comboCount}
        multiplier={comboStatus.multiplier}
      />
    </View>
  );
});

/**
 * GamificationModals Component
 * Handles all gamification modals
 */
export const GamificationModals = memo(({
  userId,
  showStreakHistory,
  onCloseStreakHistory,
}) => {
  const {
    allStreaks,
    streak,
    newAchievement,
    dismissAchievement,
    useFreeze,
  } = useGamification(userId);

  return (
    <>
      {/* Achievement Modal */}
      <AchievementModal
        visible={!!newAchievement}
        onClose={dismissAchievement}
        achievement={newAchievement}
      />

      {/* Streak History Modal */}
      <StreakHistoryModal
        visible={showStreakHistory}
        onClose={onCloseStreakHistory}
        streakData={allStreaks}
        freezeCount={streak.freezeCount}
        onUseFreeze={useFreeze}
      />
    </>
  );
});

/**
 * HabitGridSection Component
 * Shows GitHub-style habit grid
 */
export const HabitGridSection = memo(({ userId }) => {
  const { habitGrid } = useGamification(userId);

  return (
    <HabitGrid
      gridData={habitGrid}
      title="Hoạt động 5 tuần gần nhất"
    />
  );
});

/**
 * useGamificationTracking Hook
 * Returns tracking functions to call from VisionBoardScreen
 *
 * Usage in VisionBoardScreen:
 * const { trackAffirmation, trackHabit, trackGoal } = useGamificationTracking();
 *
 * // When affirmation is completed:
 * await trackAffirmation();
 *
 * // When habit checkbox is toggled:
 * await trackHabit();
 *
 * // When goal is checked in:
 * await trackGoal();
 */
export const useGamificationTracking = () => {
  const { user } = useAuth();
  const { trackCategory } = useGamification(user?.id);

  const trackAffirmation = useCallback(async () => {
    if (!user?.id) return;
    const result = await trackCategory('affirmation');
    console.log('[Gamification] Tracked affirmation:', result);
    return result;
  }, [user?.id, trackCategory]);

  const trackHabit = useCallback(async () => {
    if (!user?.id) return;
    const result = await trackCategory('habit');
    console.log('[Gamification] Tracked habit:', result);
    return result;
  }, [user?.id, trackCategory]);

  const trackGoal = useCallback(async () => {
    if (!user?.id) return;
    const result = await trackCategory('goal');
    console.log('[Gamification] Tracked goal:', result);
    return result;
  }, [user?.id, trackCategory]);

  return {
    trackAffirmation,
    trackHabit,
    trackGoal,
  };
};

/**
 * Example integration with VisionBoardScreen:
 *
 * In VisionBoardScreen.js, add these imports:
 * ```
 * import {
 *   GamificationHeader,
 *   GamificationModals,
 *   HabitGridSection,
 *   useGamificationTracking,
 * } from './VisionBoardWithGamification';
 * ```
 *
 * Add state for streak history modal:
 * ```
 * const [showStreakHistory, setShowStreakHistory] = useState(false);
 * ```
 *
 * Get tracking functions:
 * ```
 * const { trackAffirmation, trackHabit, trackGoal } = useGamificationTracking();
 * ```
 *
 * In handleAffirmationComplete, add:
 * ```
 * await trackAffirmation();
 * ```
 *
 * In handleToggleItem for habits, add:
 * ```
 * await trackHabit();
 * ```
 *
 * In goal check-in handler, add:
 * ```
 * await trackGoal();
 * ```
 *
 * In render, add GamificationHeader after header:
 * ```
 * <GamificationHeader
 *   userId={user?.id}
 *   onOpenStreakHistory={() => setShowStreakHistory(true)}
 * />
 * ```
 *
 * Add HabitGridSection before closing ScrollView:
 * ```
 * <HabitGridSection userId={user?.id} />
 * ```
 *
 * Add GamificationModals at end:
 * ```
 * <GamificationModals
 *   userId={user?.id}
 *   showStreakHistory={showStreakHistory}
 *   onCloseStreakHistory={() => setShowStreakHistory(false)}
 * />
 * ```
 */

const styles = StyleSheet.create({
  gamificationHeader: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
});

export default {
  GamificationHeader,
  GamificationModals,
  HabitGridSection,
  useGamificationTracking,
};
