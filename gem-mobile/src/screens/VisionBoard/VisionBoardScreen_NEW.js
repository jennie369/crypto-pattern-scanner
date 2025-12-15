/**
 * VisionBoardScreen - Complete Redesign 2.0
 *
 * Layout:
 * 1. DailyScoreCard (hero section)
 * 2. QuickStatsRow (4 mini cards)
 * 3. TodayTasksList
 * 4. AffirmationCarousel
 * 5. GoalCardsRow
 * 6. MonthCalendar (compact)
 * 7. RadarChart (life balance)
 * 8. WeeklyProgressChart
 * 9. XPGoalTracker
 *
 * Updated: December 10, 2025
 * Replaced old VisionBoard with new 2.0 design
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';

// Design tokens
import { COLORS, TYPOGRAPHY, SPACING, GLASS, GRADIENTS } from '../../utils/tokens';

// Services
import { supabase } from '../../services/supabase';
import visionBoardService from '../../services/visionBoardService';
import calendarService from '../../services/calendarService';
import progressCalculator, {
  LEVELS,
  XP_REWARDS,
  COMBO_MULTIPLIERS,
} from '../../services/progressCalculator';

// Chart Components
import {
  ScoreRing,
  RadarChart,
  RadarChartCompact,
  WeeklyProgressChart,
  WeeklyProgressCompact,
  XPGoalTracker,
  XPGoalTrackerCompact,
} from '../../components/Charts';

// Calendar Components
import { MonthCalendarCompact } from '../../components/Calendar';

// Dashboard Components
import {
  DailyScoreCard,
  QuickStatsRow,
  TodayTasksList,
  GoalCardsRow,
  StreakBanner,
  ComboTracker,
  AchievementModal,
} from '../../components/VisionBoard';

// Existing widgets
import AffirmationWidget from './components/AffirmationWidget';

const VisionBoardScreen = () => {
  console.log('[VisionBoardScreen] Component initializing...');
  const navigation = useNavigation();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // User data
  const [userId, setUserId] = useState(null);

  // Dashboard data
  const [dailyScore, setDailyScore] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [xpToday, setXpToday] = useState(0);
  const [totalXP, setTotalXP] = useState(0);

  // Level info
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelTitle, setLevelTitle] = useState('Người Mới Bắt Đầu');
  const [xpForNextLevel, setXpForNextLevel] = useState(100);
  const [xpProgress, setXpProgress] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    goals: { completed: 0, total: 0 },
    affirmations: { completed: 0, total: 0 },
    habits: { completed: 0, total: 0 },
    xpToday: 0,
  });

  // Today's tasks
  const [todayTasks, setTodayTasks] = useState([]);

  // Goals
  const [goals, setGoals] = useState([]);

  // Life area scores (for radar chart)
  const [lifeAreaScores, setLifeAreaScores] = useState({
    finance: 0,
    career: 0,
    health: 0,
    relationships: 0,
    personal: 0,
    spiritual: 0,
  });

  // Weekly progress
  const [weeklyProgress, setWeeklyProgress] = useState([]);

  // Calendar events
  const [calendarEvents, setCalendarEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  // Affirmation stats
  const [affirmationCompletedToday, setAffirmationCompletedToday] = useState(0);
  const [affirmationStreak, setAffirmationStreak] = useState(0);

  // Achievement modal
  const [showAchievement, setShowAchievement] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Helper: Convert calendar events array to eventsByDate object
  const convertToEventsByDate = useCallback((events) => {
    if (!events || !Array.isArray(events)) return {};
    const eventsByDate = {};
    events.forEach(event => {
      const dateStr = event?.event_date || event?.date;
      if (dateStr) {
        const key = dateStr.split('T')[0];
        if (!eventsByDate[key]) {
          eventsByDate[key] = [];
        }
        eventsByDate[key].push(event);
      }
    });
    return eventsByDate;
  }, []);

  // Load all data
  const loadDashboardData = useCallback(async () => {
    if (!userId) return;

    try {
      // Parallel fetch all data
      const [
        todayOverviewResult,
        goalsResult,
        lifeScoresResult,
        weeklyResult,
        calendarData,
      ] = await Promise.all([
        visionBoardService.getTodayOverview(userId),
        visionBoardService.getGoalsWithProgress(userId),
        visionBoardService.getLifeAreaScores(userId),
        visionBoardService.getWeeklyProgress(userId),
        calendarService.getCalendarEvents(userId, selectedDate),
      ]);

      // Today overview - handle both direct data and { success, overview } format
      const todayOverview = todayOverviewResult?.overview || todayOverviewResult || {};
      if (todayOverview) {
        // Try to get data from nested structure or direct structure
        const todayData = todayOverview?.today || todayOverview;
        const streakData = todayOverview?.streak || {};
        const levelData = todayOverview?.level || {};

        setDailyScore(todayData?.daily_score || 0);
        setTasksCompleted(todayData?.tasks_completed || todayData?.actions_completed || 0);
        setTasksTotal(todayData?.tasks_total || 5);
        setStreakDays(streakData?.current || todayData?.streak_days || 0);
        setComboCount(todayData?.combo_count || 0);
        setXpToday(todayData?.xp_earned || todayData?.xp_today || 0);
        setTotalXP(levelData?.total_xp || todayData?.total_xp || 0);
        setTodayTasks(todayOverview?.today_tasks || []);
        setAffirmationCompletedToday(todayData?.affirmations_completed || 0);
        setAffirmationStreak(streakData?.current || 0);

        // Stats
        setStats({
          goals: {
            completed: todayData?.goals_completed || 0,
            total: todayData?.goals_total || 0,
          },
          affirmations: {
            completed: todayData?.affirmations_completed || 0,
            total: todayData?.affirmations_total || 3,
          },
          habits: {
            completed: todayData?.habits_completed || 0,
            total: todayData?.habits_total || 0,
          },
          xpToday: todayData?.xp_earned || todayData?.xp_today || 0,
        });

        // Calculate level
        const userTotalXP = levelData?.total_xp || todayData?.total_xp || 0;
        const levelInfo = progressCalculator.getLevelFromXP(userTotalXP);
        setCurrentLevel(levelInfo?.level || 1);
        setLevelTitle(levelInfo?.title || 'Người Mới Bắt Đầu');
        setXpForNextLevel(levelInfo?.xpForNext || 100);
        setXpProgress(levelInfo?.progress || 0);
      }

      // Goals - handle { success, goals } format
      const goalsData = goalsResult?.goals || goalsResult?.widgets || goalsResult || [];
      setGoals(Array.isArray(goalsData) ? goalsData : []);

      // Life area scores - handle { success, scores } format and convert to object if needed
      const scoresData = lifeScoresResult?.scores || lifeScoresResult || {};
      if (Array.isArray(scoresData)) {
        // Convert array to object { finance: score, career: score, ... }
        const scoresObj = {};
        scoresData.forEach(item => {
          if (item?.life_area) {
            scoresObj[item.life_area] = item.score || 0;
          }
        });
        setLifeAreaScores(scoresObj);
      } else {
        setLifeAreaScores(scoresData || {
          finance: 0,
          career: 0,
          health: 0,
          relationships: 0,
          personal: 0,
          spiritual: 0,
        });
      }

      // Weekly progress - handle { success, progress } format
      const weeklyData = weeklyResult?.progress || weeklyResult || [];
      setWeeklyProgress(Array.isArray(weeklyData) ? weeklyData : []);

      // Calendar events - convert array to eventsByDate object
      const eventsArray = calendarData || [];
      setCalendarEvents(convertToEventsByDate(Array.isArray(eventsArray) ? eventsArray : []));

    } catch (error) {
      console.error('[VisionBoard] Load data error:', error);
    }
  }, [userId, selectedDate, convertToEventsByDate]);

  // Load on focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadDashboardData();
      }
    }, [userId, loadDashboardData])
  );

  // Initial load
  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);
      await loadDashboardData();
      setLoading(false);
    };

    if (userId) {
      initLoad();
    }
  }, [userId, loadDashboardData]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  // Task completion handler
  const handleTaskComplete = useCallback(async (task) => {
    if (!userId || !task) return;

    try {
      // Complete the widget/task
      const result = await visionBoardService.completeWidget(task.id, userId);

      if (result?.xp_earned) {
        setXpToday(prev => prev + result.xp_earned);
        setTotalXP(prev => prev + result.xp_earned);

        // Check for new achievement
        if (result.achievement_unlocked) {
          setUnlockedAchievement(result.achievement_unlocked);
          setShowAchievement(true);
        }
      }

      // Refresh data
      await loadDashboardData();
    } catch (error) {
      console.error('[VisionBoard] Task complete error:', error);
    }
  }, [userId, loadDashboardData]);

  // Affirmation completion handler
  const handleAffirmationComplete = useCallback(async () => {
    setAffirmationCompletedToday(prev => prev + 1);
    await loadDashboardData();
  }, [loadDashboardData]);

  // Navigation handlers
  const handleGoalPress = useCallback((goal) => {
    navigation.navigate('GoalDetail', { goalId: goal?.id });
  }, [navigation]);

  const handleViewAllGoals = useCallback(() => {
    // Navigate to VisionBoard itself for now (goals section)
    console.log('[VisionBoard] View all goals');
  }, []);

  const handleViewAllTasks = useCallback(() => {
    // Navigate to VisionBoard itself for now (tasks section)
    console.log('[VisionBoard] View all tasks');
  }, []);

  const handleCalendarPress = useCallback(() => {
    navigation.navigate('VisionCalendar');
  }, [navigation]);

  const handleStatsPress = useCallback((statKey) => {
    switch (statKey) {
      case 'goals':
        console.log('[VisionBoard] View all goals');
        break;
      case 'affirmations':
        console.log('[VisionBoard] View affirmations');
        break;
      case 'habits':
        console.log('[VisionBoard] View habits');
        break;
      case 'xp':
        navigation.navigate('Achievements');
        break;
    }
  }, [navigation]);

  const handleSettingsPress = useCallback(() => {
    // For now, just log - settings screen can be added later
    console.log('[VisionBoard] Settings pressed');
  }, []);

  // Loading state
  console.log('[VisionBoardScreen] About to render, loading =', loading);
  if (loading) {
    console.log('[VisionBoardScreen] Rendering loading state...');
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient
          colors={GRADIENTS.darkPurple || ['#05040B', '#0F1030', '#1a0b2e']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.loadingText}>Đang tải Vision Board...</Text>
      </SafeAreaView>
    );
  }
  console.log('[VisionBoardScreen] Rendering main content...');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={GRADIENTS.darkPurple}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icons.Sparkles size={24} color={COLORS.gold} />
          <Text style={styles.headerTitle}>Vision Board</Text>
        </View>
        <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
          <Icons.Settings size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.purple}
            colors={[COLORS.purple]}
          />
        }
      >
        {/* 1. Daily Score Card (Hero) */}
        <DailyScoreCard
          dailyScore={dailyScore}
          tasksCompleted={tasksCompleted}
          tasksTotal={tasksTotal}
          streakDays={streakDays}
          currentLevel={currentLevel}
          levelTitle={levelTitle}
          comboCount={comboCount}
          xpToday={xpToday}
          style={styles.section}
        />

        {/* 2. Quick Stats Row */}
        <View style={styles.statsSection}>
          <QuickStatsRow
            stats={stats}
            onStatPress={handleStatsPress}
          />
        </View>

        {/* 3. Today Tasks List */}
        <TodayTasksList
          tasks={todayTasks}
          onTaskPress={(task) => navigation.navigate('TaskDetail', { taskId: task.id })}
          onTaskComplete={handleTaskComplete}
          onViewAll={handleViewAllTasks}
          maxItems={5}
          style={styles.section}
        />

        {/* 4. Affirmation Carousel */}
        <AffirmationWidget
          completedToday={affirmationCompletedToday}
          streak={affirmationStreak}
          onComplete={handleAffirmationComplete}
        />

        {/* 5. Goals Row */}
        <GoalCardsRow
          goals={goals}
          onGoalPress={handleGoalPress}
          onViewAll={handleViewAllGoals}
          title="Mục tiêu của tôi"
          style={styles.sectionNoPadding}
        />

        {/* 6. Month Calendar (Compact) */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleCalendarPress}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Icons.Calendar size={18} color={COLORS.purple} />
                <Text style={styles.sectionTitle}>Lịch tháng này</Text>
              </View>
              <View style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
                <Icons.ChevronRight size={14} color={COLORS.purple} />
              </View>
            </View>
          </TouchableOpacity>
          <MonthCalendarCompact
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            eventsByDate={calendarEvents}
            onViewFullCalendar={handleCalendarPress}
          />
        </View>

        {/* 7. Life Balance Radar Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Icons.Activity size={18} color={COLORS.cyan} />
              <Text style={styles.sectionTitle}>Cân bằng cuộc sống</Text>
            </View>
          </View>
          <RadarChartCompact
            data={lifeAreaScores}
            size={280}
          />
        </View>

        {/* 8. Weekly Progress Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Icons.BarChart3 size={18} color={COLORS.success} />
              <Text style={styles.sectionTitle}>Tiến độ tuần này</Text>
            </View>
          </View>
          <WeeklyProgressCompact
            data={weeklyProgress}
            showSummary={true}
          />
        </View>

        {/* 9. XP Goal Tracker */}
        <View style={styles.section}>
          <XPGoalTrackerCompact
            currentXP={totalXP}
            currentLevel={currentLevel}
            levelTitle={levelTitle}
            xpForNextLevel={xpForNextLevel}
            xpProgress={xpProgress}
            xpToday={xpToday}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsTitle}>Hành động nhanh</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Home', { screen: 'GemMaster' })}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(106, 91, 255, 0.2)' }]}>
                <Icons.MessageCircle size={20} color={COLORS.purple} />
              </View>
              <Text style={styles.quickActionLabel}>Hỏi Gem</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => console.log('[VisionBoard] Add goal - coming soon')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(255, 189, 89, 0.2)' }]}>
                <Icons.Target size={20} color={COLORS.gold} />
              </View>
              <Text style={styles.quickActionLabel}>Thêm mục tiêu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => console.log('[VisionBoard] Add habit - coming soon')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(58, 247, 166, 0.2)' }]}>
                <Icons.Repeat size={20} color={COLORS.success} />
              </View>
              <Text style={styles.quickActionLabel}>Thêm thói quen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Achievements')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(0, 240, 255, 0.2)' }]}>
                <Icons.Trophy size={20} color={COLORS.cyan} />
              </View>
              <Text style={styles.quickActionLabel}>Thành tích</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Achievement Modal */}
      <AchievementModal
        visible={showAchievement}
        achievement={unlockedAchievement}
        onClose={() => {
          setShowAchievement(false);
          setUnlockedAchievement(null);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgDarkest,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
    marginTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.sm,
  },
  settingsButton: {
    padding: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionNoPadding: {
    marginBottom: SPACING.lg,
    marginHorizontal: -SPACING.lg,
  },
  statsSection: {
    marginBottom: SPACING.lg,
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.sm,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  quickActionsSection: {
    marginBottom: SPACING.lg,
  },
  quickActionsTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.md,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  quickActionLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.xs,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default VisionBoardScreen;
