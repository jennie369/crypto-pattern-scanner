/**
 * GEM Mobile - Pattern Card
 * Display detected pattern with entry/exit levels
 * Includes Paper Trade button for simulated trading
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, ChevronRight, PlayCircle } from 'lucide-react-native';
import ConfidenceBar from './ConfidenceBar';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const PatternCard = ({ pattern, onPress, onPaperTrade }) => {
  const isLong = pattern.direction === 'LONG';
  const directionColor = isLong ? COLORS.success : COLORS.error;

  const formatPrice = (price) => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Header */}
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

        <View style={[styles.badge, { backgroundColor: `${directionColor}20` }]}>
          <Text style={[styles.badgeText, { color: directionColor }]}>
            {pattern.direction}
          </Text>
        </View>
      </View>

      {/* Confidence Bar */}
      <ConfidenceBar confidence={pattern.confidence} />

      {/* Price Levels */}
      <View style={styles.levels}>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Entry</Text>
          <Text style={styles.levelValue}>${formatPrice(pattern.entry)}</Text>
        </View>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Target</Text>
          <Text style={[styles.levelValue, { color: COLORS.success }]}>
            ${formatPrice(pattern.target)}
          </Text>
        </View>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Stop Loss</Text>
          <Text style={[styles.levelValue, { color: COLORS.error }]}>
            ${formatPrice(pattern.stopLoss)}
          </Text>
        </View>
      </View>

      {/* Stats Footer */}
      <View style={styles.footer}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>R/R</Text>
          <Text style={styles.statValue}>
            {typeof pattern.riskReward === 'number'
              ? pattern.riskReward.toFixed(1)
              : pattern.riskReward || '2.0'}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Win Rate</Text>
          <Text style={styles.statValue}>{pattern.winRate || 65}%</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>TF</Text>
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
