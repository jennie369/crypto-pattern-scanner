/**
 * GEM Academy - Leaderboard Screen
 * Weekly XP leaderboard with ranking
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Crown,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, BORDER_RADIUS } from '../../utils/tokens';
import { getWeeklyLeaderboard, getUserLearningStats } from '../../services/learningGamificationService';
import { useAuth } from '../../contexts/AuthContext';

// League configurations
const LEAGUES = {
  bronze: { name: 'Bronze', color: '#CD7F32', icon: Medal },
  silver: { name: 'Silver', color: '#C0C0C0', icon: Medal },
  gold: { name: 'Gold', color: COLORS.gold, icon: Trophy },
  diamond: { name: 'Diamond', color: COLORS.cyan, icon: Crown },
};

const LeaderboardScreen = ({ navigation }) => {
  const { profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);

      // Load leaderboard and user stats
      const [leaderboardResult, statsResult] = await Promise.all([
        getWeeklyLeaderboard(50),
        getUserLearningStats(),
      ]);

      if (leaderboardResult.success) {
        const data = leaderboardResult.data || [];
        setLeaderboard(data);

        // Find user's rank
        const userEntry = data.find(e => e.user_id === profile?.id);
        if (userEntry) {
          setUserRank(userEntry);
        }
      } else {
        throw new Error(leaderboardResult.error || 'Failed to load leaderboard');
      }

      if (statsResult.success) {
        setUserStats(statsResult.data);
      }
    } catch (err) {
      console.error('[LeaderboardScreen] loadData error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Get week dates
  const getWeekDates = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

    const format = (date) => {
      return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    return `${format(startOfWeek)} - ${format(endOfWeek)}`;
  };

  // Render rank change indicator
  const renderRankChange = (entry) => {
    const change = (entry.previous_rank || entry.rank) - entry.rank;

    if (change > 0) {
      return (
        <View style={styles.rankChange}>
          <TrendingUp size={12} color={COLORS.success} />
          <Text style={[styles.rankChangeText, { color: COLORS.success }]}>+{change}</Text>
        </View>
      );
    } else if (change < 0) {
      return (
        <View style={styles.rankChange}>
          <TrendingDown size={12} color={COLORS.error} />
          <Text style={[styles.rankChangeText, { color: COLORS.error }]}>{change}</Text>
        </View>
      );
    }

    return (
      <View style={styles.rankChange}>
        <Minus size={12} color={COLORS.textMuted} />
      </View>
    );
  };

  // Render top 3 podium
  const renderPodium = () => {
    if (leaderboard.length < 3) return null;

    const top3 = leaderboard.slice(0, 3);
    // Reorder for podium display: [2nd, 1st, 3rd]
    const podiumOrder = [top3[1], top3[0], top3[2]];
    const podiumHeights = [100, 130, 80];
    const podiumColors = ['#C0C0C0', COLORS.gold, '#CD7F32'];

    return (
      <View style={styles.podiumContainer}>
        {podiumOrder.map((entry, index) => {
          if (!entry) return null;
          const height = podiumHeights[index];
          const color = podiumColors[index];
          const actualRank = index === 1 ? 1 : index === 0 ? 2 : 3;

          return (
            <View key={entry.user_id || index} style={styles.podiumItem}>
              {/* Avatar */}
              <View style={[styles.podiumAvatar, { borderColor: color }]}>
                {entry.avatar_url ? (
                  <Image source={{ uri: entry.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <User size={24} color={COLORS.textMuted} />
                )}
                <View style={[styles.rankBadge, { backgroundColor: color }]}>
                  <Text style={styles.rankBadgeText}>{actualRank}</Text>
                </View>
              </View>

              {/* Name */}
              <Text style={styles.podiumName} numberOfLines={1}>
                {entry.display_name || entry.username || 'User'}
              </Text>

              {/* XP */}
              <View style={styles.podiumXP}>
                <Zap size={12} color={color} />
                <Text style={[styles.podiumXPText, { color }]}>
                  {(entry.weekly_xp || 0).toLocaleString()}
                </Text>
              </View>

              {/* Pedestal */}
              <LinearGradient
                colors={[`${color}50`, `${color}20`]}
                style={[styles.pedestal, { height }]}
              >
                {actualRank === 1 && <Crown size={24} color={COLORS.gold} />}
              </LinearGradient>
            </View>
          );
        })}
      </View>
    );
  };

  const renderLeaderboardItem = ({ item, index }) => {
    const isCurrentUser = item.user_id === profile?.id;
    const league = LEAGUES[item.league || 'bronze'];

    // Skip top 3 (shown in podium)
    if (index < 3) return null;

    return (
      <View style={[styles.listItem, isCurrentUser && styles.listItemCurrent]}>
        {/* Rank */}
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{item.rank || index + 1}</Text>
          {renderRankChange(item)}
        </View>

        {/* Avatar */}
        <View style={styles.listAvatar}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.listAvatarImage} />
          ) : (
            <View style={styles.listAvatarPlaceholder}>
              <User size={18} color={COLORS.textMuted} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.listInfo}>
          <Text style={styles.listName} numberOfLines={1}>
            {item.display_name || item.username || 'User'}
          </Text>
          <View style={styles.leagueBadge}>
            <league.icon size={10} color={league.color} />
            <Text style={[styles.leagueText, { color: league.color }]}>{league.name}</Text>
          </View>
        </View>

        {/* XP */}
        <View style={styles.listXP}>
          <Zap size={14} color={COLORS.cyan} />
          <Text style={styles.listXPText}>{(item.weekly_xp || 0).toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Week info */}
      <View style={styles.weekInfo}>
        <Text style={styles.weekLabel}>Tuần này</Text>
        <Text style={styles.weekDates}>{getWeekDates()}</Text>
      </View>

      {/* Podium */}
      {renderPodium()}

      {/* User rank (if not in top 3) */}
      {userRank && userRank.rank > 3 && (
        <View style={styles.userRankCard}>
          <Text style={styles.userRankLabel}>Xếp hạng của bạn</Text>
          <View style={styles.userRankRow}>
            <Text style={styles.userRankNumber}>#{userRank.rank}</Text>
            <View style={styles.userRankXP}>
              <Zap size={16} color={COLORS.gold} />
              <Text style={styles.userRankXPText}>
                {(userRank.weekly_xp || 0).toLocaleString()} XP
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Remaining list header */}
      {leaderboard.length > 3 && (
        <Text style={styles.sectionTitle}>Xếp hạng #{4} - #{leaderboard.length}</Text>
      )}
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
        <Text style={styles.loadingText}>Đang tải bảng xếp hạng...</Text>
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
            <Trophy size={20} color={COLORS.gold} />
            <Text style={styles.headerTitle}>Bảng xếp hạng</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item, index) => item.user_id || `rank-${index}`}
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
              <Trophy size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Chưa có dữ liệu</Text>
              <Text style={styles.emptySubtitle}>
                Bảng xếp hạng sẽ được cập nhật khi có người tham gia
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
  weekInfo: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  weekLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  weekDates: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xxs,
  },

  // Podium
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(15, 16, 48, 0.8)',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    position: 'relative',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },
  podiumName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    maxWidth: 80,
    textAlign: 'center',
  },
  podiumXP: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xxs,
  },
  podiumXPText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: 2,
  },
  pedestal: {
    width: '90%',
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderTopRightRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // User rank card
  userRankCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    marginBottom: SPACING.lg,
  },
  userRankLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  userRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  userRankNumber: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  userRankXP: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRankXPText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginLeft: SPACING.xs,
  },

  // Section
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.lg,
  },

  // List item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.1)',
  },
  listItemCurrent: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  rankChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rankChangeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: 2,
  },
  listAvatar: {
    marginLeft: SPACING.sm,
    marginRight: SPACING.md,
  },
  listAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  listAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  leagueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  leagueText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: 4,
  },
  listXP: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listXPText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.cyan,
    marginLeft: SPACING.xxs,
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

export default LeaderboardScreen;
