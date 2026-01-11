/**
 * GEM Mobile - Coin Accordion Component
 * Issue #16 & #17: Merge Scan Results + Detected Patterns
 * Groups patterns by coin with expandable accordion
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Wallet,
  Target,
  Shield,
  ArrowUpDown,
  Clock,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { formatPrice, formatConfidence, calculateRR } from '../../utils/formatters';
import { PATTERN_STATES } from '../../constants/patternSignals';
import { isPremiumTier } from '../../constants/tierFeatures';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Get main direction from patterns - show MIXED if both LONG and SHORT exist
 */
const getMainDirection = (patterns) => {
  if (!patterns || patterns.length === 0) return 'NEUTRAL';
  const longs = patterns.filter(p => p.direction === 'LONG').length;
  const shorts = patterns.filter(p => p.direction === 'SHORT').length;

  // If has both LONG and SHORT patterns, show MIXED
  if (longs > 0 && shorts > 0) return 'MIXED';

  return longs > 0 ? 'LONG' : 'SHORT';
};

/**
 * Get average confidence from patterns
 */
const getAvgConfidence = (patterns) => {
  if (!patterns || patterns.length === 0) return 0;
  return patterns.reduce((sum, p) => sum + (p.confidence || 0), 0) / patterns.length;
};

/**
 * Pattern State Badge - Shows lifecycle state (FRESH, ACTIVE, etc.)
 */
const PatternStateBadge = ({ state }) => {
  const stateInfo = PATTERN_STATES?.[state] || PATTERN_STATES?.FRESH || {
    label: state || 'FRESH',
    color: '#00CFFF',
    bgColor: 'rgba(0, 207, 255, 0.15)',
    emoji: '🆕'
  };

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

/**
 * Single Pattern Item inside accordion
 */
const PatternItem = ({
  pattern,
  isSelected,
  onSelect,
  onPaperTrade,
  userTier = 'FREE',
}) => {
  const rr = calculateRR(pattern);
  const hasPremium = isPremiumTier(userTier);
  const patternState = pattern.state || 'FRESH';
  const qualityGrade = pattern.qualityGrade || null;

  return (
    <TouchableOpacity
      style={[styles.patternItem, isSelected && styles.patternItemSelected]}
      onPress={() => onSelect(pattern)}
      activeOpacity={0.7}
    >
      {/* Pattern Header with State & Quality Badges */}
      <View style={styles.patternHeader}>
        <View style={styles.patternNameRow}>
          <Text style={styles.patternName}>
            {pattern.patternType || pattern.name || 'Pattern'}
          </Text>
          {/* Timeframe Badge */}
          {pattern.timeframe && (
            <View style={styles.timeframeBadge}>
              <Clock size={10} color={COLORS.cyan} />
              <Text style={styles.timeframeText}>{pattern.timeframe}</Text>
            </View>
          )}
        </View>
        <View style={styles.badgesRow}>
          {/* Pattern State Badge */}
          <PatternStateBadge state={patternState} />

          {/* Quality Grade Badge (Premium only) */}
          <QualityGradeBadge grade={qualityGrade} hasPremium={hasPremium} />

          {/* Direction Badge */}
          <View style={[
            styles.miniDirectionBadge,
            pattern.direction === 'LONG' ? styles.longBadge : styles.shortBadge,
          ]}>
            {pattern.direction === 'LONG' ? (
              <TrendingUp size={12} color="#22C55E" />
            ) : (
              <TrendingDown size={12} color="#EF4444" />
            )}
            <Text style={[
              styles.miniDirectionText,
              pattern.direction === 'LONG' ? styles.longText : styles.shortText,
            ]}>
              {pattern.direction}
            </Text>
          </View>
        </View>
      </View>

      {/* Pattern Stats */}
      <View style={styles.patternStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Độ Tin Cậy</Text>
          <Text style={styles.statValue}>
            {formatConfidence(pattern.confidence, 1)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Target size={12} color="#3B82F6" />
          <Text style={styles.statLabel}>Điểm Vào</Text>
          <Text style={[styles.statValue, styles.blueText]}>
            ${formatPrice(pattern.entry)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <TrendingUp size={12} color="#22C55E" />
          <Text style={styles.statLabel}>Chốt Lời</Text>
          <Text style={[styles.statValue, styles.greenText]}>
            ${formatPrice(pattern.target || pattern.takeProfit1 || pattern.takeProfit || pattern.targets?.[0])}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Shield size={12} color="#EF4444" />
          <Text style={styles.statLabel}>Cắt Lỗ</Text>
          <Text style={[styles.statValue, styles.redText]}>
            ${formatPrice(pattern.stopLoss)}
          </Text>
        </View>
      </View>

      {/* R:R Row */}
      <View style={styles.rrRow}>
        <Text style={styles.rrLabel}>Tỷ Lệ R:R</Text>
        <Text style={[styles.rrValue, rr >= 2 ? styles.greenText : styles.yellowText]}>
          1:{rr.toFixed(1).replace('.', ',')}
        </Text>
      </View>

      {/* Paper Trade Button */}
      {onPaperTrade && (
        <TouchableOpacity
          style={styles.paperTradeBtn}
          onPress={() => onPaperTrade(pattern)}
          activeOpacity={0.8}
        >
          <Wallet size={14} color="#FFFFFF" />
          <Text style={styles.paperTradeText}>Paper Trade</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

/**
 * Main CoinAccordion Component
 */
const CoinAccordion = ({
  coin,
  patterns = [],
  isExpanded = false,
  onToggle,
  onSelectPattern,
  onPaperTrade,
  selectedPatternId,
  userTier = 'FREE',
}) => {
  const totalPatterns = patterns.length;
  const mainDirection = getMainDirection(patterns);
  const avgConfidence = getAvgConfidence(patterns);

  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle?.();
  }, [onToggle]);

  if (totalPatterns === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header - Tap to toggle */}
      <TouchableOpacity
        style={[styles.header, isExpanded && styles.headerExpanded]}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <View style={styles.coinInfo}>
          <View style={styles.checkIcon}>
            <CheckCircle size={20} color="#22C55E" />
          </View>
          <View>
            <Text style={styles.coinName}>
              {coin?.symbol?.replace('USDT', '/USDT') || coin?.symbol || 'Unknown'}
            </Text>
            <Text style={styles.patternCount}>
              {totalPatterns} pattern{totalPatterns > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.rightInfo}>
          {/* Direction Badge */}
          <View style={[
            styles.directionBadge,
            mainDirection === 'LONG' ? styles.longBadge :
            mainDirection === 'SHORT' ? styles.shortBadge : styles.mixedBadge,
          ]}>
            {mainDirection === 'LONG' ? (
              <TrendingUp size={14} color="#22C55E" />
            ) : mainDirection === 'SHORT' ? (
              <TrendingDown size={14} color="#EF4444" />
            ) : (
              <ArrowUpDown size={14} color="#FFBD59" />
            )}
            <Text style={[
              styles.directionText,
              mainDirection === 'LONG' ? styles.longText :
              mainDirection === 'SHORT' ? styles.shortText : styles.mixedText,
            ]}>
              {mainDirection}
            </Text>
          </View>

          {/* Confidence */}
          <Text style={styles.confidence}>
            {formatConfidence(avgConfidence, 0)}
          </Text>

          {/* Chevron */}
          {isExpanded ? (
            <ChevronUp size={20} color={COLORS.textMuted} />
          ) : (
            <ChevronDown size={20} color={COLORS.textMuted} />
          )}
        </View>
      </TouchableOpacity>

      {/* Patterns List - Only show when expanded */}
      {isExpanded && (
        <View style={styles.patternsContainer}>
          {patterns.map((pattern, index) => (
            <PatternItem
              key={pattern.id || `${pattern.symbol}-${pattern.name}-${index}`}
              pattern={pattern}
              isSelected={selectedPatternId === pattern.id}
              onSelect={onSelectPattern}
              userTier={userTier}
              onPaperTrade={onPaperTrade}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },

  headerExpanded: {
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },

  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  coinName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  patternCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#22C55E', // Explicit green color
  },

  rightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },

  longBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },

  shortBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },

  mixedBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },

  directionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  longText: {
    color: '#22C55E',
  },

  shortText: {
    color: '#EF4444',
  },

  mixedText: {
    color: '#FFBD59',
  },

  confidence: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },

  patternsContainer: {
    padding: SPACING.sm,
  },

  patternItem: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },

  patternItemSelected: {
    borderWidth: 2,
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
  },

  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },

  patternNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },

  patternName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  timeframeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  timeframeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.cyan,
  },

  miniDirectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  miniDirectionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  patternStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },

  statItem: {
    alignItems: 'center',
    gap: 2,
  },

  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  statValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },

  blueText: {
    color: '#3B82F6',
  },

  greenText: {
    color: '#22C55E',
  },

  redText: {
    color: '#EF4444',
  },

  yellowText: {
    color: '#FFD700',
  },

  rrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },

  rrLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  rrValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  paperTradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.purple,
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },

  paperTradeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#FFFFFF',
  },

  // Badges Row for State + Quality + Direction
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
});

export default CoinAccordion;
