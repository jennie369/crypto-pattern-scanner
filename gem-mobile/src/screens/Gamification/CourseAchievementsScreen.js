/**
 * GEM Academy - Course Achievements Screen
 * Shows all learning achievements with progress
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Trophy, Filter, Star } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, BORDER_RADIUS } from '../../utils/tokens';
import { getAchievementsWithProgress, getUserLearningStats } from '../../services/learningGamificationService';
import { AchievementCard } from '../../components/Gamification';
import { ProgressBar } from '../../components/Common';

// Achievement categories
const CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'streak', name: 'Streak' },
  { id: 'learning', name: 'Học tập' },
  { id: 'mastery', name: 'Thành thạo' },
  { id: 'general', name: 'Chung' },
];

const CourseAchievementsScreen = ({ navigation }) => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);

      // Load achievements and stats in parallel
      const [achievementsResult, statsResult] = await Promise.all([
        getAchievementsWithProgress(),
        getUserLearningStats(),
      ]);

      if (achievementsResult.success) {
        // Service returns { data: { all: [...], grouped: {...} } }
        // We need data.all for the flat list
        const achievementsData = achievementsResult.data?.all || achievementsResult.data || [];
        setAchievements(Array.isArray(achievementsData) ? achievementsData : []);
      } else {
        throw new Error(achievementsResult.error || 'Failed to load achievements');
      }

      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (err) {
      console.error('[CourseAchievementsScreen] loadData error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Filter achievements by category (with fallback to empty array)
  const achievementsList = Array.isArray(achievements) ? achievements : [];
  const filteredAchievements = selectedCategory === 'all'
    ? achievementsList
    : achievementsList.filter(a => a?.category === selectedCategory);

  // Split into unlocked and locked (with safe fallbacks)
  // Service returns 'earned' property for unlock status
  const unlockedAchievements = Array.isArray(filteredAchievements)
    ? filteredAchievements.filter(a => a?.earned || a?.is_unlocked)
    : [];
  const lockedAchievements = Array.isArray(filteredAchievements)
    ? filteredAchievements.filter(a => !a?.earned && !a?.is_unlocked)
    : [];

  // Calculate stats
  const totalAchievements = achievementsList.length;
  const unlockedCount = achievementsList.filter(a => a?.earned || a?.is_unlocked).length;
  const progressPercent = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;

  const renderCategoryChip = (category) => {
    const isSelected = selectedCategory === category.id;
    const count = category.id === 'all'
      ? achievementsList.length
      : achievementsList.filter(a => a?.category === category.id).length;

    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
        onPress={() => setSelectedCategory(category.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
          {category.name} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  const renderAchievement = ({ item }) => (
    <AchievementCard
      achievement={item}
      userProgress={item.progress || item.user_progress || 0}
      isUnlocked={item.earned || item.is_unlocked || false}
      isNew={item.isNew || item.is_new || false}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Stats summary */}
      <View style={styles.statsSummary}>
        <View style={styles.statsCard}>
          <Trophy size={32} color={COLORS.gold} />
          <View style={styles.statsText}>
            <Text style={styles.statsValue}>{unlockedCount}/{totalAchievements}</Text>
            <Text style={styles.statsLabel}>Thành tích</Text>
          </View>
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progressPercent}
              height={8}
              fillColor={COLORS.gold}
              style={styles.statsProgress}
            />
            <Text style={styles.progressLabel}>{Math.round(progressPercent)}%</Text>
          </View>
        </View>

        {/* XP earned from achievements */}
        {stats && (
          <View style={styles.xpCard}>
            <Star size={20} color={COLORS.cyan} fill={COLORS.cyan} />
            <Text style={styles.xpValue}>
              {(stats.total_xp || 0).toLocaleString()}
            </Text>
            <Text style={styles.xpLabel}>Total XP</Text>
          </View>
        )}
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
        style={styles.categoriesContainer}
      >
        {CATEGORIES.map(renderCategoryChip)}
      </ScrollView>

      {/* Section header */}
      {unlockedAchievements.length > 0 && (
        <Text style={styles.sectionTitle}>
          Đã mở khóa ({unlockedAchievements.length})
        </Text>
      )}
    </View>
  );

  const renderLockedSection = () => {
    if (lockedAchievements.length === 0) return null;

    return (
      <View style={styles.lockedSection}>
        <Text style={styles.sectionTitle}>
          Chưa mở khóa ({lockedAchievements.length})
        </Text>
        {lockedAchievements.map(item => (
          <AchievementCard
            key={item.id}
            achievement={item}
            userProgress={item.user_progress || 0}
            isUnlocked={false}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>Đang tải thành tích...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.errorContainer}
      >
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thành tích</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <FlatList
          data={unlockedAchievements}
          renderItem={renderAchievement}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderLockedSection}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.gold}
              colors={[COLORS.gold]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Trophy size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Chưa có thành tích</Text>
              <Text style={styles.emptySubtitle}>
                Hoàn thành các nhiệm vụ để mở khóa thành tích
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gold,
    borderRadius: BORDER_RADIUS.md,
  },
  retryText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  placeholder: {
    width: 44,
  },

  // Header content
  headerContent: {
    paddingBottom: SPACING.md,
  },
  statsSummary: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },
  statsCard: {
    flex: 2,
    backgroundColor: 'rgba(15, 16, 48, 0.7)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  statsText: {
    marginTop: SPACING.sm,
  },
  statsValue: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statsLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  progressContainer: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsProgress: {
    flex: 1,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginLeft: SPACING.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  xpCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 16, 48, 0.7)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpValue: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
    marginTop: SPACING.sm,
  },
  xpLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },

  // Categories
  categoriesContainer: {
    marginTop: SPACING.lg,
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: SPACING.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.bgDarkest,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Sections
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.lg,
  },

  // List
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  lockedSection: {
    marginTop: SPACING.md,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.huge,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default CourseAchievementsScreen;
