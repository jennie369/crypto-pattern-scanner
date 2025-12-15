/**
 * GEM Mobile - Pattern Card
 * Display detected pattern with entry/exit levels
 * Includes Paper Trade button for simulated trading
 * Updated: Uses patternSignals.js for expected win rate
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, ChevronRight, PlayCircle } from 'lucide-react-native';
import ConfidenceBar from './ConfidenceBar';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { formatPrice } from '../../../utils/formatters';
import { getPatternSignal, PATTERN_STATES } from '../../../constants/patternSignals';
import { isPremiumTier } from '../../../constants/tierFeatures';

/**
 * Pattern State Badge - Shows lifecycle state (FRESH, ACTIVE, etc.)
 */
const PatternStateBadge = ({ state }) => {
  const stateInfo = PATTERN_STATES[state] || PATTERN_STATES.FRESH;

  return (
    <View style={[styles.stateBadge, { backgroundColor: stateInfo.bgColor }]}>
      <Text style={styles.stateEmoji}>{stateInfo.emoji}</Text>
      <Text style={[styles.stateLabel, { color: stateInfo.color }]}>
        {stateInfo.label}
      </Text>
    </View>
  );
};

/**
 * Quality Grade Badge - Shows A+, A, B+, B, C, D
 */
const QualityGradeBadge = ({ grade, hasPremium }) => {
  if (!hasPremium || !grade) return null;

  const gradeConfig = {
    'A+': { color: '#00FF88', bg: 'rgba(0, 255, 136, 0.15)' },
    'A': { color: '#00FF88', bg: 'rgba(0, 255, 136, 0.12)' },
    'B+': { color: '#FFBD59', bg: 'rgba(255, 189, 89, 0.15)' },
    'B': { color: '#FFBD59', bg: 'rgba(255, 189, 89, 0.12)' },
    'C': { color: '#FF9500', bg: 'rgba(255, 149, 0, 0.15)' },
    'D': { color: '#FF4757', bg: 'rgba(255, 71, 87, 0.15)' },
  };

  const config = gradeConfig[grade] || gradeConfig['C'];

  return (
    <View style={[styles.gradeBadge, { backgroundColor: config.bg }]}>
      <Text style={[styles.gradeText, { color: config.color }]}>{grade}</Text>
    </View>
  );
};

const PatternCard = ({ pattern, onPress, onPaperTrade, userTier = 'FREE' }) => {
  const isLong = pattern.direction === 'LONG';
  const directionColor = isLong ? COLORS.success : COLORS.error;
  const hasPremium = isPremiumTier(userTier);

  // Get pattern signal info for expected win rate
  const patternSignal = useMemo(() => {
    const patternType = pattern.patternType || pattern.type || pattern.name || '';
    return getPatternSignal(patternType);
  }, [pattern.patternType, pattern.type, pattern.name]);

  // Use expected win rate from patternSignals.js
  const expectedWinRate = patternSignal.expectedWinRate || 60;

  // Get pattern state and quality grade
  const patternState = pattern.state || 'FRESH';
  const qualityGrade = pattern.qualityGrade || null;

  // formatPrice is now imported from utils/formatters

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Header with State & Quality Badges */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isLong ? (
            <TrendingUp size={20} color={COLORS.success} strokeWidth={2.5} />
          ) : (
            <TrendingDown size={20} color={COLORS.error} strokeWidth={2.5} />
          )}
          <View>
            <Text style={styles.patternName}>{pattern.patternType}</Text>
            <Text style={styles.symbolText}>
              {pattern.symbol?.replace('USDT', '')}/USDT
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Pattern State Badge */}
          <PatternStateBadge state={patternState} />

          {/* Quality Grade Badge (Premium only) */}
          <QualityGradeBadge grade={qualityGrade} hasPremium={hasPremium} />

          {/* Direction Badge */}
          <View style={[styles.badge, { backgroundColor: `${directionColor}20` }]}>
            <Text style={[styles.badgeText, { color: directionColor }]}>
              {pattern.direction}
            </Text>
          </View>
        </View>
      </View>

      {/* Confidence Bar */}
      <ConfidenceBar confidence={pattern.confidence} />

      {/* Price Levels */}
      <View style={styles.levels}>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Điểm Vào</Text>
          <Text style={styles.levelValue}>${formatPrice(pattern.entry)}</Text>
        </View>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Chốt Lời</Text>
          <Text style={[styles.levelValue, { color: COLORS.success }]}>
            ${formatPrice(pattern.target || pattern.targets?.[0])}
          </Text>
        </View>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Cắt Lỗ</Text>
          <Text style={[styles.levelValue, { color: COLORS.error }]}>
            ${formatPrice(pattern.stopLoss)}
          </Text>
        </View>
      </View>

      {/* Stats Footer */}
      <View style={styles.footer}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Tỷ Lệ RR</Text>
          <Text style={styles.statValue}>
            1:{typeof pattern.riskReward === 'number'
              ? pattern.riskReward.toFixed(1)
              : pattern.riskReward || '2.0'}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Tỷ Lệ Thắng</Text>
          <Text style={styles.statValue}>{pattern.winRate || expectedWinRate}%</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Khung</Text>
          <Text style={styles.statValue}>{pattern.timeframe?.toUpperCase()}</Text>
        </View>
        <ChevronRight size={20} color={COLORS.textMuted} />
      </View>

      {/* Paper Trade Button */}
      {onPaperTrade && (
        <TouchableOpacity
          style={styles.paperTradeButton}
          onPress={(e) => {
            e.stopPropagation();
            onPaperTrade(pattern);
          }}
          activeOpacity={0.8}
        >
          <PlayCircle size={18} color="#FFFFFF" />
          <Text style={styles.paperTradeText}>Paper Trade</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1.2,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  // State Badge styles
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  stateEmoji: {
    fontSize: 10,
  },
  stateLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  // Quality Grade Badge styles
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  gradeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  patternName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  symbolText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: 0.5,
  },
  levels: {
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  levelLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  levelValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.cyan,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  // Paper Trade Button
  paperTradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: SPACING.md,
    gap: 8,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  paperTradeText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default PatternCard;
