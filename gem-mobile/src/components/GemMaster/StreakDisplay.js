/**
 * STREAK DISPLAY COMPONENT
 * Shows streak, level, and XP progress
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Flame,
  Trophy,
  Star,
  TrendingUp,
  Award,
  ChevronRight,
} from 'lucide-react-native';

const StreakDisplay = ({
  currentStreak = 0,
  longestStreak = 0,
  level = 1,
  levelName = 'Người mới',
  totalPoints = 0,
  nextLevelPoints = 100,
  progressPercent = 0,
  compact = false,
  onPress,
  style,
}) => {
  const getStreakColor = () => {
    if (currentStreak >= 30) return '#FFD700';
    if (currentStreak >= 7) return '#FF8C00';
    if (currentStreak >= 1) return '#FF6347';
    return '#808080';
  };

  const streakColor = getStreakColor();

  // Compact version (for header)
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <Flame size={16} color={streakColor} />
        <Text style={[styles.compactStreak, { color: streakColor }]}>
          {currentStreak}
        </Text>
      </TouchableOpacity>
    );
  }

  // Full version
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Streak Section */}
      <View style={styles.streakSection}>
        <View style={[styles.streakCircle, { borderColor: streakColor }]}>
          <Flame size={28} color={streakColor} />
          <Text style={[styles.streakNumber, { color: streakColor }]}>
            {currentStreak}
          </Text>
        </View>
        <Text style={styles.streakLabel}>ngày streak</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        {/* Level */}
        <View style={styles.statRow}>
          <Star size={14} color="#FFD700" />
          <Text style={styles.statLabel}>Level {level}</Text>
          <Text style={styles.statValue}>{levelName}</Text>
        </View>

        {/* Points */}
        <View style={styles.statRow}>
          <TrendingUp size={14} color="#4CAF50" />
          <Text style={styles.statLabel}>XP</Text>
          <Text style={styles.statValue}>{totalPoints}</Text>
        </View>

        {/* Record */}
        <View style={styles.statRow}>
          <Trophy size={14} color="#CD7F32" />
          <Text style={styles.statLabel}>Kỷ lục</Text>
          <Text style={styles.statValue}>{longestStreak} ngày</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, progressPercent)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {nextLevelPoints - totalPoints} XP đến level tiếp theo
          </Text>
        </View>
      </View>

      {/* Arrow */}
      {onPress && (
        <View style={styles.arrowContainer}>
          <ChevronRight size={20} color="#808080" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Badge display component
export const BadgeDisplay = ({ badge, earned = false, size = 'medium', onPress }) => {
  const iconSize = size === 'small' ? 24 : size === 'large' ? 40 : 32;
  const containerSize = size === 'small' ? 40 : size === 'large' ? 64 : 52;

  const IconComponent = badge?.icon === 'trophy' ? Trophy :
                        badge?.icon === 'crown' ? Award :
                        badge?.icon === 'star' ? Star : Award;

  return (
    <TouchableOpacity
      style={[
        styles.badgeContainer,
        {
          width: containerSize,
          height: containerSize,
          opacity: earned ? 1 : 0.4,
        },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        style={[
          styles.badgeIcon,
          {
            backgroundColor: earned ? `${badge?.color || '#FFD700'}20` : '#33333350',
            borderColor: earned ? badge?.color || '#FFD700' : '#555555',
          },
        ]}
      >
        <IconComponent
          size={iconSize}
          color={earned ? badge?.color || '#FFD700' : '#555555'}
        />
      </View>
      {badge?.requirement && (
        <Text style={[styles.badgeLabel, { color: earned ? '#FFFFFF' : '#808080' }]}>
          {badge.requirement}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Mini streak for inline use
export const MiniStreak = ({ streak, style }) => {
  const color = streak >= 7 ? '#FF8C00' : streak >= 1 ? '#FF6347' : '#808080';

  return (
    <View style={[styles.miniContainer, style]}>
      <Flame size={12} color={color} />
      <Text style={[styles.miniText, { color }]}>{streak}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  streakSection: {
    alignItems: 'center',
    marginRight: 16,
  },
  streakCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: -4,
  },
  streakLabel: {
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 4,
  },
  statsSection: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: {
    color: '#A0A0A0',
    fontSize: 12,
    marginLeft: 6,
    width: 50,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    color: '#808080',
    fontSize: 10,
    marginTop: 4,
  },
  arrowContainer: {
    marginLeft: 8,
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  compactStreak: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },

  // Badge styles
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },

  // Mini styles
  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
});

export default StreakDisplay;
