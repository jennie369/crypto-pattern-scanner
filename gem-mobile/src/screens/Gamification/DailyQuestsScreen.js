/**
 * GEM Academy - Daily Quests Screen
 * Full daily quests view with all quests and progress
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, Clock, Gift, Zap } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, BORDER_RADIUS } from '../../utils/tokens';
import {
  getTodayQuests,
  getDailyQuestProgress,
  claimQuestReward,
  getUserLearningStats,
} from '../../services/learningGamificationService';
import { DailyQuestCard } from '../../components/Gamification';
import { ProgressBar } from '../../components/Common';

const DailyQuestsScreen = ({ navigation }) => {
  const [quests, setQuests] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claiming, setClaiming] = useState({});
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);

      // Load quests, progress, and stats in parallel
      const [questsResult, progressResult, statsResult] = await Promise.all([
        getTodayQuests(),
        getDailyQuestProgress(),
        getUserLearningStats(),
      ]);

      if (questsResult.success) {
        setQuests(questsResult.data || []);
      } else {
        throw new Error(questsResult.error || 'Failed to load quests');
      }

      if (progressResult.success && progressResult.data) {
        const pMap = {};
        progressResult.data.forEach(p => {
          pMap[p.quest_id] = p;
        });
        setProgressMap(pMap);
      }

      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (err) {
      console.error('[DailyQuestsScreen] loadData error:', err);
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

  const handleClaimQuest = async (questId, xpReward) => {
    try {
      setClaiming(prev => ({ ...prev, [questId]: true }));

      const result = await claimQuestReward(questId);
      if (result.success) {
        // Update local state
        setProgressMap(prev => ({
          ...prev,
          [questId]: {
            ...prev[questId],
            xp_claimed: true,
          },
        }));

        // Refresh stats to get updated XP
        const statsResult = await getUserLearningStats();
        if (statsResult.success) {
          setStats(statsResult.data);
        }
      }
    } catch (err) {
      console.error('[DailyQuestsScreen] handleClaimQuest error:', err);
    } finally {
      setClaiming(prev => ({ ...prev, [questId]: false }));
    }
  };

  // Calculate time remaining until reset
  const getTimeRemaining = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  // Calculate quest completion stats
  const getQuestStats = () => {
    const total = quests.length;
    const completed = quests.filter(q => progressMap[q.id]?.is_completed).length;
    const claimed = quests.filter(q => progressMap[q.id]?.xp_claimed).length;
    const totalXP = quests.reduce((sum, q) => sum + (q.xp_reward || 0), 0);
    const claimedXP = quests
      .filter(q => progressMap[q.id]?.xp_claimed)
      .reduce((sum, q) => sum + (q.xp_reward || 0), 0);

    return { total, completed, claimed, totalXP, claimedXP };
  };

  const questStats = getQuestStats();
  const timeRemaining = getTimeRemaining();

  const renderQuest = ({ item }) => {
    const progress = progressMap[item.id] || {};

    return (
      <DailyQuestCard
        quest={item}
        progress={progress.current_progress || 0}
        isCompleted={progress.is_completed || false}
        isClaimed={progress.xp_claimed || false}
        claiming={claiming[item.id] || false}
        onClaim={() => handleClaimQuest(item.id, item.xp_reward)}
      />
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Time remaining card */}
      <View style={styles.timeCard}>
        <View style={styles.timeCardContent}>
          <Clock size={20} color={COLORS.textMuted} />
          <View style={styles.timeTextContainer}>
            <Text style={styles.timeLabel}>Thời gian còn lại</Text>
            <Text style={styles.timeValue}>
              {timeRemaining.hours}h {timeRemaining.minutes}m
            </Text>
          </View>
        </View>
        <View style={styles.timeProgress}>
          <ProgressBar
            progress={((24 - timeRemaining.hours) / 24) * 100}
            height={4}
            fillColor={COLORS.purple}
          />
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Gift size={20} color={COLORS.gold} />
          <Text style={styles.statValue}>
            {questStats.completed}/{questStats.total}
          </Text>
          <Text style={styles.statLabel}>Hoàn thành</Text>
        </View>
        <View style={styles.statCard}>
          <Zap size={20} color={COLORS.cyan} />
          <Text style={styles.statValue}>
            {questStats.claimedXP}/{questStats.totalXP}
          </Text>
          <Text style={styles.statLabel}>XP đã nhận</Text>
        </View>
      </View>

      {/* Section title */}
      <Text style={styles.sectionTitle}>Nhiệm vụ hôm nay</Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>Đang tải nhiệm vụ...</Text>
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
          <View style={styles.headerTitleRow}>
            <Calendar size={20} color={COLORS.gold} />
            <Text style={styles.headerTitle}>Nhiệm vụ hàng ngày</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <FlatList
          data={quests}
          renderItem={renderQuest}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
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
              <Calendar size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Không có nhiệm vụ</Text>
              <Text style={styles.emptySubtitle}>
                Nhiệm vụ mới sẽ được cập nhật mỗi ngày
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
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
    paddingTop: SPACING.lg,
  },
  timeCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: 'rgba(15, 16, 48, 0.7)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  timeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeTextContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  timeLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  timeValue: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  timeProgress: {
    marginTop: SPACING.md,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 16, 48, 0.7)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },

  // Section
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

export default DailyQuestsScreen;
