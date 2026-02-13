/**
 * KarmaLeaderboardItem - Leaderboard row with rank, avatar, and karma
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Medal, Award, Flame, User } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../utils/tokens';
import { KARMA_LEVEL_THRESHOLDS } from '../../services/karmaService';

const KarmaLeaderboardItem = ({
  rank = 1,
  userId = '',
  displayName = 'Người dùng',
  avatarUrl = null,
  karmaPoints = 0,
  karmaLevel = 'student',
  streak = 0,
  isCurrentUser = false,
  onPress,
  style,
}) => {
  const levelConfig = KARMA_LEVEL_THRESHOLDS[karmaLevel] || KARMA_LEVEL_THRESHOLDS.student;

  // Get rank display
  const getRankDisplay = () => {
    if (rank === 1) {
      return {
        icon: Crown,
        color: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
      };
    }
    if (rank === 2) {
      return {
        icon: Medal,
        color: '#C0C0C0',
        backgroundColor: 'rgba(192, 192, 192, 0.2)',
      };
    }
    if (rank === 3) {
      return {
        icon: Award,
        color: '#CD7F32',
        backgroundColor: 'rgba(205, 127, 50, 0.2)',
      };
    }
    return null;
  };

  const rankDisplay = getRankDisplay();

  // Get gradient for top 3
  const getContainerGradient = () => {
    if (isCurrentUser) {
      return ['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.05)'];
    }
    if (rank === 1) {
      return ['rgba(255, 215, 0, 0.15)', 'rgba(255, 215, 0, 0.02)'];
    }
    if (rank === 2) {
      return ['rgba(192, 192, 192, 0.1)', 'rgba(192, 192, 192, 0.02)'];
    }
    if (rank === 3) {
      return ['rgba(205, 127, 50, 0.1)', 'rgba(205, 127, 50, 0.02)'];
    }
    return ['rgba(15, 16, 48, 0.5)', 'rgba(15, 16, 48, 0.3)'];
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.7}
      style={[style]}
    >
      <LinearGradient
        colors={getContainerGradient()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.container,
          isCurrentUser && styles.currentUserContainer,
        ]}
      >
        {/* Rank */}
        <View style={styles.rankContainer}>
          {rankDisplay ? (
            <View style={[styles.rankBadge, { backgroundColor: rankDisplay.backgroundColor }]}>
              <rankDisplay.icon size={18} color={rankDisplay.color} strokeWidth={2} />
            </View>
          ) : (
            <Text style={styles.rankNumber}>{rank}</Text>
          )}
        </View>

        {/* Avatar */}
        <View style={[styles.avatarContainer, { borderColor: levelConfig.color }]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: levelConfig.color + '30' }]}>
              <User size={20} color={levelConfig.color} strokeWidth={2} />
            </View>
          )}
        </View>

        {/* User info */}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.displayName, isCurrentUser && styles.currentUserName]}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {isCurrentUser && (
              <View style={styles.youBadge}>
                <Text style={styles.youBadgeText}>Bạn</Text>
              </View>
            )}
          </View>
          <View style={styles.levelRow}>
            <Text style={[styles.levelText, { color: levelConfig.color }]}>
              {levelConfig.name}
            </Text>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Flame size={12} color={COLORS.warning} strokeWidth={2} />
                <Text style={styles.streakText}>{streak}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Karma points */}
        <View style={styles.karmaContainer}>
          <Text style={[styles.karmaValue, { color: levelConfig.color }]}>
            {karmaPoints.toLocaleString()}
          </Text>
          <Text style={styles.karmaLabel}>Karma</Text>
        </View>
      </LinearGradient>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.md,
  },
  currentUserContainer: {
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 2,
  },
  displayName: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    flex: 1,
  },
  currentUserName: {
    color: '#8B5CF6',
  },
  youBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  youBadgeText: {
    color: '#8B5CF6',
    fontSize: FONT_SIZES.xxs,
    fontWeight: '600',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  levelText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  streakText: {
    color: COLORS.warning,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  karmaContainer: {
    alignItems: 'flex-end',
  },
  karmaValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  karmaLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
  },
});

export default KarmaLeaderboardItem;
