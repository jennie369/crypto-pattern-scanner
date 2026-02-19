/**
 * Achievements Screen
 * Display all achievements with progress, unlocked/locked state
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
  RefreshControl,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, GLASS, GRADIENTS } from '../../utils/tokens';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';
import { supabase } from '../../services/supabase';
import { ACHIEVEMENTS } from '../../services/gamificationService';
import { XPGoalTracker, LevelBadge } from '../../components/Charts';
import progressCalculator from '../../services/progressCalculator';

// Icon mapping
const ICON_MAP = {
  flame: Icons.Flame,
  star: Icons.Star,
  award: Icons.Award,
  trophy: Icons.Trophy,
  crown: Icons.Crown,
  zap: Icons.Zap,
  sparkles: Icons.Sparkles,
  target: Icons.Target,
  check: Icons.Check,
  heart: Icons.Heart,
  sun: Icons.Sun,
  moon: Icons.Moon,
};

// Category labels
const CATEGORY_LABELS = {
  streak: 'Streak',
  goal: 'Mục tiêu',
  task: 'Nhiệm vụ',
  affirmation: 'Khẳng định',
  level: 'Cấp độ',
  special: 'Đặc biệt',
};

const AchievementsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  // User data
  const [totalXP, setTotalXP] = useState(0);
  const [levelInfo, setLevelInfo] = useState(null);

  // Achievements
  const [achievements, setAchievements] = useState([]);
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get user
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // Load data
  const loadData = useCallback(async () => {
    if (!userId) return;

    try {
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp')
        .eq('id', userId)
        .single();

      if (profile) {
        setTotalXP(profile.total_xp || 0);
        setLevelInfo(progressCalculator.getLevelFromXP(profile.total_xp || 0));
      }

      // Get unlocked achievements
      const { data: unlocked } = await supabase
        .from('user_unlocked_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId);

      const unlockedMap = {};
      unlocked?.forEach(u => {
        unlockedMap[u.achievement_id] = u.unlocked_at;
      });

      setUnlockedIds(Object.keys(unlockedMap));

      // Map achievements with unlocked status (ACHIEVEMENTS is an Object, need Object.values)
      const mapped = Object.values(ACHIEVEMENTS).map(a => ({
        ...a,
        unlocked: !!unlockedMap[a.id],
        unlockedAt: unlockedMap[a.id] || null,
      }));

      setAchievements(mapped);
    } catch (error) {
      console.error('[Achievements] Load error:', error);
    }
  }, [userId]);

  // Issue 2 Fix: Wrap in try/finally to guarantee setLoading(false)
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await loadData();
      } catch (err) {
        console.error('[Achievements] Init error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) init();
  }, [userId, loadData]);

  // Listen for FORCE_REFRESH_EVENT from health monitor / recovery system
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[Achievements] Force refresh event received - resetting all states');
      setLoading(false);
      setRefreshing(false);
      loadData();
    });
    return () => listener.remove();
  }, [loadData]);

  // Issue 2 Fix: Wrap in try/finally to guarantee setRefreshing(false)
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } catch (err) {
      console.error('[Achievements] Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter achievements by category
  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  // Group by category
  const groupedAchievements = {};
  filteredAchievements.forEach(a => {
    if (!groupedAchievements[a.category]) {
      groupedAchievements[a.category] = [];
    }
    groupedAchievements[a.category].push(a);
  });

  // Stats
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient colors={GRADIENTS.darkPurple} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.loadingText}>Đang tải thành tích...</Text>
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
        <Text style={styles.headerTitle}>Thành tích</Text>
        <View style={styles.placeholder} />
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
          />
        }
      >
        {/* Progress Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Icons.Trophy size={24} color={COLORS.gold} />
            <Text style={styles.overviewTitle}>Tiến độ thành tích</Text>
          </View>

          <View style={styles.progressRow}>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressValue}>{unlockedCount}/{totalCount}</Text>
              <Text style={styles.progressLabel}>Đã mở khóa</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={[COLORS.gold, COLORS.purple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                />
              </View>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
            </View>
          </View>

          {/* Level Info */}
          {levelInfo && (
            <View style={styles.levelRow}>
              <LevelBadge level={levelInfo.level} size="small" />
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Lv.{levelInfo.level} - {levelInfo.title}</Text>
                <Text style={styles.xpText}>{totalXP} XP tổng cộng</Text>
              </View>
            </View>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === 'all' && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {Object.keys(CATEGORY_LABELS).map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Achievements List */}
        {selectedCategory === 'all' ? (
          // Grouped view
          Object.keys(groupedAchievements).map(category => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categorySectionTitle}>{CATEGORY_LABELS[category]}</Text>
              <View style={styles.achievementsGrid}>
                {groupedAchievements[category].map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </View>
            </View>
          ))
        ) : (
          // Flat view
          <View style={styles.achievementsGrid}>
            {filteredAchievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Achievement Card Component
const AchievementCard = ({ achievement }) => {
  const IconComponent = ICON_MAP[achievement.icon] || Icons.Star;
  const isUnlocked = achievement.unlocked;

  return (
    <View style={[styles.achievementCard, !isUnlocked && styles.achievementCardLocked]}>
      {/* Icon */}
      <View style={[
        styles.achievementIcon,
        isUnlocked ? styles.achievementIconUnlocked : styles.achievementIconLocked
      ]}>
        <IconComponent
          size={28}
          color={isUnlocked ? COLORS.gold : COLORS.textMuted}
        />
      </View>

      {/* Info */}
      <Text style={[styles.achievementTitle, !isUnlocked && styles.textLocked]} numberOfLines={1}>
        {achievement.title}
      </Text>
      <Text style={[styles.achievementDesc, !isUnlocked && styles.textLocked]} numberOfLines={2}>
        {achievement.description}
      </Text>

      {/* XP Badge */}
      <View style={[styles.xpBadge, !isUnlocked && styles.xpBadgeLocked]}>
        <Icons.Sparkles size={12} color={isUnlocked ? COLORS.gold : COLORS.textMuted} />
        <Text style={[styles.xpBadgeText, !isUnlocked && styles.textLocked]}>
          +{achievement.xp}
        </Text>
      </View>

      {/* Unlocked indicator */}
      {isUnlocked && (
        <View style={styles.unlockedBadge}>
          <Icons.Check size={14} color={COLORS.bgDarkest} />
        </View>
      )}

      {/* Lock overlay */}
      {!isUnlocked && (
        <View style={styles.lockOverlay}>
          <Icons.Lock size={16} color={COLORS.textMuted} />
        </View>
      )}
    </View>
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
  placeholder: {
    width: 32,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },

  // Overview Card
  overviewCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    marginBottom: SPACING.lg,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  overviewTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTextContainer: {
    marginRight: SPACING.lg,
  },
  progressValue: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  progressLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.xs,
    textAlign: 'right',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelInfo: {
    marginLeft: SPACING.md,
  },
  levelTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  xpText: {
    color: COLORS.cyan,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },

  // Category Filter
  categoryScroll: {
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  categoryButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: COLORS.purple,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  categoryTextActive: {
    color: COLORS.purple,
  },

  // Category Section
  categorySection: {
    marginBottom: SPACING.lg,
  },
  categorySectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.md,
  },

  // Achievements Grid
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },

  // Achievement Card
  achievementCard: {
    width: '47%',
    backgroundColor: COLORS.glassBg,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
    position: 'relative',
  },
  achievementCardLocked: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    alignSelf: 'center',
  },
  achievementIconUnlocked: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  achievementIconLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  achievementTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  achievementDesc: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.xs,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    minHeight: 32,
  },
  textLocked: {
    color: COLORS.textMuted,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingVertical: SPACING.xxs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.xs,
    alignSelf: 'center',
  },
  xpBadgeLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  xpBadgeText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.xxs,
  },
  unlockedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },

  bottomSpacing: {
    height: 100,
  },
});

export default AchievementsScreen;
