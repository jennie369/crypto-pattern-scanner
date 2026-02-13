/**
 * GEM Mobile - Multi-Timeframe Scan Results Section
 * Shows patterns grouped by timeframe with confluence scores
 * TIER2+ feature only
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { formatPrice } from '../../../utils/formatters';
import { isPremiumTier } from '../../../constants/tierFeatures';

/**
 * Confluence Score Badge
 */
const ConfluenceBadge = ({ score, level }) => {
  const colors = {
    HIGH: { bg: 'rgba(0, 255, 136, 0.15)', text: '#00FF88' },
    MEDIUM: { bg: 'rgba(255, 189, 89, 0.15)', text: '#FFBD59' },
    LOW: { bg: 'rgba(255, 71, 87, 0.15)', text: '#FF4757' },
  };

  const config = colors[level] || colors.LOW;

  return (
    <View style={[styles.confluenceBadge, { backgroundColor: config.bg }]}>
      <Zap size={12} color={config.text} />
      <Text style={[styles.confluenceText, { color: config.text }]}>
        {score}% {level}
      </Text>
    </View>
  );
};

/**
 * Timeframe Pattern Card
 */
const TimeframePatternCard = ({ data, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const pattern = data;
  const isLong = pattern.direction === 'LONG';

  return (
    <TouchableOpacity
      style={styles.patternCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          {isLong ? (
            <TrendingUp size={18} color={COLORS.success} />
          ) : (
            <TrendingDown size={18} color={COLORS.error} />
          )}
          <Text style={styles.patternName}>{pattern.patternName}</Text>
        </View>

        <View style={styles.cardRight}>
          {pattern.confluence && (
            <ConfluenceBadge
              score={pattern.confluence.score}
              level={pattern.confluence.level}
            />
          )}
          {expanded ? (
            <ChevronUp size={18} color={COLORS.textMuted} />
          ) : (
            <ChevronDown size={18} color={COLORS.textMuted} />
          )}
        </View>
      </View>

      {/* Timeframes where pattern appears */}
      <View style={styles.timeframesRow}>
        {pattern.timeframes?.map((tf, idx) => (
          <View key={idx} style={styles.tfBadge}>
            <Clock size={10} color={COLORS.cyan} />
            <Text style={styles.tfText}>{tf.timeframe}</Text>
          </View>
        ))}
      </View>

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.expandedContent}>
          {pattern.timeframes?.map((tf, idx) => (
            <View key={idx} style={styles.tfDetailRow}>
              <Text style={styles.tfLabel}>{tf.timeframe}</Text>
              <View style={styles.tfStats}>
                <View style={styles.tfStat}>
                  <Text style={styles.tfStatLabel}>State</Text>
                  <Text style={[styles.tfStatValue, { color: getStateColor(tf.state) }]}>
                    {tf.state || 'FRESH'}
                  </Text>
                </View>
                <View style={styles.tfStat}>
                  <Text style={styles.tfStatLabel}>Confidence</Text>
                  <Text style={styles.tfStatValue}>{tf.confidence}%</Text>
                </View>
                {tf.entry && (
                  <View style={styles.tfStat}>
                    <Target size={12} color={COLORS.cyan} />
                    <Text style={styles.tfStatValue}>${formatPrice(tf.entry)}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * Helper functions
 */
const getStateColor = (state) => {
  const colors = {
    FRESH: '#00CFFF',
    ACTIVE: '#00FF88',
    WAITING: '#FFBD59',
    WAITING_RETEST: '#FFBD59',
    MISSED: '#8E8E93',
    STOPPED_OUT: '#FF4757',
    TARGET_HIT: '#00FF88',
  };
  return colors[state] || '#FFFFFF';
};

// formatPrice is now imported from utils/formatters

/**
 * Main Multi-TF Results Section
 */
const MultiTFResultsSection = ({
  results = null,
  isScanning = false,
  userTier = 'FREE',
  onUpgradePress,
}) => {
  // Note: ScannerScreen already checks multiTFAccess.hasAccess before rendering this component
  // So we don't need to show upgrade prompt here - just return null for non-premium
  const hasPremium = isPremiumTier(userTier);
  if (!hasPremium) {
    return null;
  }

  // Loading state
  if (isScanning) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Layers size={20} color={COLORS.gold} />
          <Text style={styles.headerTitle}>Multi-Timeframe Scan</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Scanning multiple timeframes...</Text>
        </View>
      </View>
    );
  }

  // No results yet - don't show anything (Multi-TF runs automatically)
  if (!results || !results.success) {
    return null;
  }

  // Has results
  const { symbol, scannedTimeframes, confluence, totalPatterns, tier } = results;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Layers size={20} color={COLORS.gold} />
          <Text style={styles.headerTitle}>Multi-TF Results</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.symbolText}>{symbol?.replace('USDT', '/USDT')}</Text>
          <Text style={styles.statsText}>
            {totalPatterns} patterns | {scannedTimeframes?.length} TFs
          </Text>
        </View>
      </View>

      {/* Timeframes Scanned */}
      <View style={styles.tfScannedRow}>
        {scannedTimeframes?.map((tf, idx) => (
          <View key={idx} style={styles.tfScannedBadge}>
            <Text style={styles.tfScannedText}>{tf}</Text>
          </View>
        ))}
      </View>

      {/* Confluence Patterns */}
      <ScrollView
        style={styles.resultsScroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {confluence && confluence.length > 0 ? (
          confluence.map((pattern, idx) => (
            <TimeframePatternCard
              key={idx}
              data={pattern}
            />
          ))
        ) : (
          <View style={styles.noPatterns}>
            <Text style={styles.noPatternsText}>
              No patterns found across selected timeframes
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS.background,
    marginTop: SPACING.md,
    marginHorizontal: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  headerRight: {
    alignItems: 'flex-end',
  },

  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  symbolText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.cyan,
  },

  statsText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  tierBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 6,
  },

  tierText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Locked state
  lockedContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },

  lockedTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },

  lockedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },

  upgradeButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    marginTop: SPACING.lg,
  },

  upgradeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#000000',
  },

  // Loading
  loadingContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },

  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },

  // Empty
  emptyContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Timeframes scanned row
  tfScannedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },

  tfScannedBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 207, 255, 0.15)',
    borderRadius: 4,
  },

  tfScannedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.cyan,
  },

  // Results scroll
  resultsScroll: {
    maxHeight: 400,
    padding: SPACING.sm,
  },

  // Pattern Card
  patternCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  patternName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  // Confluence badge
  confluenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },

  confluenceText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Timeframes row
  timeframesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },

  tfBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: 'rgba(0, 207, 255, 0.1)',
    borderRadius: 4,
  },

  tfText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.cyan,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Expanded content
  expandedContent: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },

  tfDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },

  tfLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    width: 40,
  },

  tfStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    flex: 1,
    justifyContent: 'flex-end',
  },

  tfStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  tfStatLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  tfStatValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // No patterns
  noPatterns: {
    padding: SPACING.xl,
    alignItems: 'center',
  },

  noPatternsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default MultiTFResultsSection;
