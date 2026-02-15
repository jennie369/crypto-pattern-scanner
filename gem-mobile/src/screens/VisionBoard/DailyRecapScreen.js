/**
 * Daily Recap Screen
 * End-of-day summary with stats, XP earned, achievements
 *
 * Created: December 9, 2025
 * Part of Vision Board 2.0 Redesign
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, GLASS, GRADIENTS } from '../../utils/tokens';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';
import { supabase } from '../../services/supabase';
import { ScoreRing, RadarChartCompact, LevelBadge } from '../../components/Charts';
import progressCalculator from '../../services/progressCalculator';

const DailyRecapScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { date: paramDate } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Date
  const [recapDate, setRecapDate] = useState(
    paramDate ? new Date(paramDate) : new Date()
  );

  // Recap data
  const [dailyScore, setDailyScore] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [goalsProgress, setGoalsProgress] = useState(0);
  const [affirmationsCompleted, setAffirmationsCompleted] = useState(0);
  const [habitsCompleted, setHabitsCompleted] = useState(0);
  const [habitsTotal, setHabitsTotal] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [achievementsUnlocked, setAchievementsUnlocked] = useState([]);
  const [totalXP, setTotalXP] = useState(0);
  const [levelInfo, setLevelInfo] = useState(null);

  // Life area scores
  const [lifeAreaScores, setLifeAreaScores] = useState({
    finance: 0,
    career: 0,
    health: 0,
    relationships: 0,
    personal: 0,
    spiritual: 0,
  });

  // Get user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // Load recap data
  const loadRecapData = useCallback(async () => {
    if (!userId) return;

    const dateStr = recapDate.toISOString().split('T')[0];

    try {
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp, streak_count')
        .eq('id', userId)
        .single();

      if (profile) {
        setTotalXP(profile.total_xp || 0);
        setStreakDays(profile.streak_count || 0);
        setLevelInfo(progressCalculator.getLevelFromXP(profile.total_xp || 0));
      }

      // Get completed widgets for the date
      const { data: completedWidgets } = await supabase
        .from('vision_board_widgets')
        .select('*')
        .eq('user_id', userId)
        .gte('completed_at', `${dateStr}T00:00:00`)
        .lt('completed_at', `${dateStr}T23:59:59`);

      // Count by type
      let tasks = 0, goals = 0, affirmations = 0, habits = 0;
      completedWidgets?.forEach(w => {
        switch (w.widget_type) {
          case 'action':
          case 'task':
            tasks++;
            break;
          case 'goal':
            goals++;
            break;
          case 'affirmation':
            affirmations++;
            break;
          case 'habit':
            habits++;
            break;
        }
      });

      setTasksCompleted(tasks);
      setGoalsProgress(goals);
      setAffirmationsCompleted(affirmations);
      setHabitsCompleted(habits);

      // Get total tasks for the day
      const { count: totalTasks } = await supabase
        .from('vision_board_widgets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('widget_type', ['action', 'task']);

      setTasksTotal(totalTasks || 0);

      // Get total habits
      const { count: totalHabits } = await supabase
        .from('vision_board_widgets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('widget_type', 'habit');

      setHabitsTotal(totalHabits || 0);

      // Calculate daily score
      const score = Math.min(100, Math.round(
        ((tasks / Math.max(1, totalTasks || 1)) * 60) +
        ((affirmations > 0 ? 1 : 0) * 20) +
        ((habits / Math.max(1, totalHabits || 1)) * 20)
      ));
      setDailyScore(score);

      // Estimate XP earned (simplified)
      const estimatedXP = (tasks * 20) + (affirmations * 15) + (habits * 25) + (goals * 200);
      setXpEarned(estimatedXP);

      // Get unlocked achievements for the date
      const { data: achievements } = await supabase
        .from('user_unlocked_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId)
        .gte('unlocked_at', `${dateStr}T00:00:00`)
        .lt('unlocked_at', `${dateStr}T23:59:59`);

      setAchievementsUnlocked(achievements || []);

      // Get life area scores (simplified)
      const scores = {
        finance: Math.random() * 100,
        career: Math.random() * 100,
        health: Math.random() * 100,
        relationships: Math.random() * 100,
        personal: Math.random() * 100,
        spiritual: Math.random() * 100,
      };
      setLifeAreaScores(scores);

    } catch (error) {
      console.error('[DailyRecap] Load error:', error);
    }
  }, [userId, recapDate]);

  // Initial load
  // Issue 2 Fix: Wrap in try/finally to guarantee setLoading(false)
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await loadRecapData();
      } catch (err) {
        console.error('[DailyRecap] Init error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) init();
  }, [userId, loadRecapData]);

  // Listen for FORCE_REFRESH_EVENT from health monitor / recovery system
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[DailyRecap] Force refresh event received - resetting all states');
      setLoading(false);
      loadRecapData();
    });
    return () => listener.remove();
  }, [loadRecapData]);

  // Share recap
  const handleShare = async () => {
    const dateStr = recapDate.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    const message = `Vision Board - ${dateStr}\n\n` +
      `Điểm hôm nay: ${dailyScore}%\n` +
      `Tasks hoàn thành: ${tasksCompleted}/${tasksTotal}\n` +
      `Thói quen: ${habitsCompleted}/${habitsTotal}\n` +
      `XP kiếm được: +${xpEarned}\n` +
      `Streak: ${streakDays} ngày\n\n` +
      `Cấp độ: ${levelInfo?.title || 'Người Mới'}\n` +
      `Tổng XP: ${totalXP}`;

    try {
      await Share.share({ message });
    } catch (error) {
      console.error('[DailyRecap] Share error:', error);
    }
  };

  // Navigate days
  const goToPreviousDay = () => {
    const newDate = new Date(recapDate);
    newDate.setDate(newDate.getDate() - 1);
    setRecapDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(recapDate);
    newDate.setDate(newDate.getDate() + 1);
    // Don't go beyond today
    if (newDate <= new Date()) {
      setRecapDate(newDate);
    }
  };

  const isToday = recapDate.toDateString() === new Date().toDateString();

  // Format date
  const formattedDate = recapDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.loadingText}>Đang tải tổng kết...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icons.ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tổng kết ngày</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Icons.Share2 size={20} color={COLORS.purple} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Navigation */}
        <View style={styles.dateNav}>
          <TouchableOpacity onPress={goToPreviousDay} style={styles.navButton}>
            <Icons.ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formattedDate}</Text>
            {isToday && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>Hôm nay</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={goToNextDay}
            style={[styles.navButton, isToday && styles.navButtonDisabled]}
            disabled={isToday}
          >
            <Icons.ChevronRight size={24} color={isToday ? COLORS.textMuted : COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Daily Score */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Icons.Star size={24} color={COLORS.gold} />
            <Text style={styles.scoreTitle}>Điểm hôm nay</Text>
          </View>
          <View style={styles.scoreContent}>
            <ScoreRing
              score={dailyScore}
              label=""
              size={150}
              gradientColors={[COLORS.gold, COLORS.purple]}
            />
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Icons.CheckCircle size={20} color={COLORS.success} />
              <Text style={styles.quickStatValue}>{tasksCompleted}/{tasksTotal}</Text>
              <Text style={styles.quickStatLabel}>Tasks</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Icons.Repeat size={20} color={COLORS.cyan} />
              <Text style={styles.quickStatValue}>{habitsCompleted}/{habitsTotal}</Text>
              <Text style={styles.quickStatLabel}>Thói quen</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Icons.Heart size={20} color="#FF6B9D" />
              <Text style={styles.quickStatValue}>{affirmationsCompleted}</Text>
              <Text style={styles.quickStatLabel}>Khẳng định</Text>
            </View>
          </View>
        </View>

        {/* XP & Level */}
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Icons.Sparkles size={20} color={COLORS.gold} />
            <Text style={styles.xpTitle}>XP & Cấp độ</Text>
          </View>

          <View style={styles.xpContent}>
            <View style={styles.xpEarnedSection}>
              <Text style={styles.xpEarnedLabel}>XP kiếm được</Text>
              <Text style={styles.xpEarnedValue}>+{xpEarned}</Text>
            </View>

            {levelInfo && (
              <View style={styles.levelSection}>
                <LevelBadge level={levelInfo.level} size="medium" />
                <View style={styles.levelInfo}>
                  <Text style={styles.levelTitle}>{levelInfo.title}</Text>
                  <Text style={styles.totalXpText}>{totalXP} XP tổng cộng</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Streak */}
        <View style={styles.streakCard}>
          <Icons.Flame size={24} color={COLORS.gold} />
          <View style={styles.streakInfo}>
            <Text style={styles.streakValue}>{streakDays}</Text>
            <Text style={styles.streakLabel}>ngày streak</Text>
          </View>
          {streakDays >= 7 && (
            <View style={styles.streakBadge}>
              <Icons.Award size={16} color={COLORS.purple} />
              <Text style={styles.streakBadgeText}>Xuất sắc!</Text>
            </View>
          )}
        </View>

        {/* Life Balance */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Icons.Activity size={20} color={COLORS.cyan} />
            <Text style={styles.balanceTitle}>Cân bằng cuộc sống</Text>
          </View>
          <RadarChartCompact
            data={lifeAreaScores}
            size={240}
          />
        </View>

        {/* Achievements Unlocked */}
        {achievementsUnlocked.length > 0 && (
          <View style={styles.achievementsCard}>
            <View style={styles.achievementsHeader}>
              <Icons.Trophy size={20} color={COLORS.gold} />
              <Text style={styles.achievementsTitle}>Thành tích mới</Text>
            </View>
            <View style={styles.achievementsList}>
              {achievementsUnlocked.map((a, index) => (
                <View key={index} style={styles.achievementItem}>
                  <Icons.Star size={16} color={COLORS.gold} />
                  <Text style={styles.achievementText}>{a.achievement_id}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Motivation Quote */}
        <View style={styles.quoteCard}>
          <Icons.Quote size={24} color={COLORS.purple} />
          <Text style={styles.quoteText}>
            {dailyScore >= 80
              ? '"Một ngày tuyệt vời! Tiếp tục phát huy nhé!"'
              : dailyScore >= 50
                ? '"Cố gắng tốt lắm! Ngày mai sẽ tốt hơn!"'
                : '"Mỗi bước nhỏ đều đáng giá. Đừng bỏ cuộc!"'}
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  shareButton: {
    padding: SPACING.xs,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },

  // Date Navigation
  dateNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  navButton: {
    padding: SPACING.sm,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  todayBadge: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingVertical: SPACING.xxs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.xs,
    marginTop: SPACING.xs,
  },
  todayText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Score Card
  scoreCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    marginBottom: SPACING.lg,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoreTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.sm,
  },
  scoreContent: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatValue: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.xs,
  },
  quickStatLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.xxs,
  },

  // XP Card
  xpCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    marginBottom: SPACING.lg,
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  xpTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.sm,
  },
  xpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  xpEarnedSection: {
    alignItems: 'center',
    flex: 1,
  },
  xpEarnedLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  xpEarnedValue: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  levelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelInfo: {
    marginLeft: SPACING.md,
  },
  levelTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  totalXpText: {
    color: COLORS.cyan,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },

  // Streak Card
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(255, 189, 89, 0.2)',
    marginBottom: SPACING.lg,
  },
  streakInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  streakValue: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  streakLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.md,
  },
  streakBadgeText: {
    color: COLORS.purple,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: SPACING.xs,
  },

  // Balance Card
  balanceCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    marginBottom: SPACING.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  balanceTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.sm,
  },

  // Achievements Card
  achievementsCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    marginBottom: SPACING.lg,
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  achievementsTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.sm,
  },
  achievementsList: {
    gap: SPACING.sm,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.sm,
  },
  achievementText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginLeft: SPACING.sm,
  },

  // Quote Card
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  quoteText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontStyle: 'italic',
    marginLeft: SPACING.md,
    lineHeight: 24,
  },

  bottomSpacing: {
    height: 100,
  },
});

export default DailyRecapScreen;
