/**
 * GEM Mobile - MTF Alignment Panel Component
 * Displays multi-timeframe zone alignment with confluence score
 *
 * Props:
 * - symbol: Trading pair
 * - alignment: Alignment data from mtfAlignmentService
 * - loading: Loading state
 * - onRefresh: Refresh callback
 * - compact: Use compact layout
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ChevronRight,
  Minus,
} from 'lucide-react-native';

import {
  ALIGNMENT_STATUS,
  ALIGNMENT_LEVELS,
  RECOMMENDATION,
} from '../../services/mtfAlignmentService';
import { COLORS, SPACING } from '../../theme/darkTheme';

const MTFAlignmentPanel = ({
  symbol,
  alignment,
  loading = false,
  onRefresh,
  compact = false,
  onExpand,
}) => {
  if (loading) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Analyzing MTF alignment...</Text>
      </View>
    );
  }

  if (!alignment) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <Layers size={20} color={COLORS.textSecondary} />
        <Text style={styles.noDataText}>No MTF data available</Text>
        {onRefresh && (
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <RefreshCw size={14} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const { htf, itf, ltf, alignment: alignmentData, recommendation } = alignment;
  const score = alignmentData?.score || 0;

  const getScoreColor = () => {
    if (score >= ALIGNMENT_LEVELS.HIGH_PROBABILITY) return '#4ECDC4';
    if (score >= ALIGNMENT_LEVELS.NORMAL) return '#FFC107';
    if (score >= ALIGNMENT_LEVELS.LOW) return '#FF9800';
    return '#6C757D';
  };

  const getRecommendationDisplay = () => {
    switch (recommendation) {
      case RECOMMENDATION.HIGH_PROBABILITY:
        return { text: 'HIGH PROBABILITY', color: '#4ECDC4', icon: Target };
      case RECOMMENDATION.NORMAL:
        return { text: 'NORMAL', color: '#FFC107', icon: CheckCircle };
      case RECOMMENDATION.WAIT:
        return { text: 'WAIT', color: '#FF9800', icon: AlertTriangle };
      default:
        return { text: 'SKIP', color: '#6C757D', icon: Minus };
    }
  };

  const getStatusDisplay = () => {
    switch (alignmentData?.status) {
      case ALIGNMENT_STATUS.ALIGNED:
        return { text: 'Aligned', color: '#4ECDC4' };
      case ALIGNMENT_STATUS.PARTIAL:
        return { text: 'Partial', color: '#FFC107' };
      case ALIGNMENT_STATUS.CONFLICTING:
        return { text: 'Conflicting', color: '#FF6B6B' };
      default:
        return { text: 'Unknown', color: '#6C757D' };
    }
  };

  const renderTimeframeIndicator = (label, data, size = 'normal') => {
    const isLong = data?.direction === 'LONG';
    const strength = data?.strength || 0;
    const hasData = data?.zones?.length > 0;

    const iconSize = size === 'small' ? 12 : 16;
    const containerSize = size === 'small' ? 24 : 32;

    return (
      <View style={styles.tfContainer}>
        <Text style={[styles.tfLabel, size === 'small' && styles.tfLabelSmall]}>
          {label}
        </Text>
        <View
          style={[
            styles.tfIcon,
            { width: containerSize, height: containerSize },
            hasData && {
              backgroundColor: isLong
                ? 'rgba(78, 205, 196, 0.2)'
                : 'rgba(255, 107, 107, 0.2)',
            },
          ]}
        >
          {hasData ? (
            isLong ? (
              <TrendingUp size={iconSize} color="#4ECDC4" />
            ) : (
              <TrendingDown size={iconSize} color="#FF6B6B" />
            )
          ) : (
            <Minus size={iconSize} color={COLORS.textSecondary} />
          )}
        </View>
        {size !== 'small' && (
          <Text
            style={[
              styles.tfStrength,
              hasData && { color: isLong ? '#4ECDC4' : '#FF6B6B' },
            ]}
          >
            {hasData ? `${strength}%` : '—'}
          </Text>
        )}
      </View>
    );
  };

  const recDisplay = getRecommendationDisplay();
  const statusDisplay = getStatusDisplay();
  const RecIcon = recDisplay.icon;

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onExpand}
        activeOpacity={0.7}
      >
        <View style={styles.compactHeader}>
          <Layers size={14} color={COLORS.textSecondary} />
          <Text style={styles.compactTitle}>MTF</Text>
        </View>

        <View style={styles.compactTfs}>
          {renderTimeframeIndicator('H', htf, 'small')}
          {renderTimeframeIndicator('I', itf, 'small')}
          {renderTimeframeIndicator('L', ltf, 'small')}
        </View>

        <View style={[styles.compactScore, { backgroundColor: `${getScoreColor()}20` }]}>
          <Text style={[styles.compactScoreText, { color: getScoreColor() }]}>
            {score}%
          </Text>
        </View>

        <ChevronRight size={14} color={COLORS.textSecondary} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Layers size={18} color={COLORS.primary} />
          <Text style={styles.title}>MTF Alignment</Text>
          {symbol && (
            <Text style={styles.symbol}>{symbol}</Text>
          )}
        </View>
        {onRefresh && (
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <RefreshCw size={14} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Timeframe indicators */}
      <View style={styles.tfRow}>
        {renderTimeframeIndicator('HTF', htf)}
        <View style={styles.tfDivider} />
        {renderTimeframeIndicator('ITF', itf)}
        <View style={styles.tfDivider} />
        {renderTimeframeIndicator('LTF', ltf)}
      </View>

      {/* Score and recommendation */}
      <View style={styles.scoreRow}>
        {/* Score gauge */}
        <View style={styles.scoreGauge}>
          <View style={[styles.scoreBar, { width: `${score}%`, backgroundColor: getScoreColor() }]} />
        </View>
        <Text style={[styles.scoreValue, { color: getScoreColor() }]}>
          {score}%
        </Text>
      </View>

      {/* Recommendation */}
      <View style={[styles.recommendation, { backgroundColor: `${recDisplay.color}20` }]}>
        <RecIcon size={16} color={recDisplay.color} />
        <Text style={[styles.recText, { color: recDisplay.color }]}>
          {recDisplay.text}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusDisplay.color}30` }]}>
          <Text style={[styles.statusText, { color: statusDisplay.color }]}>
            {statusDisplay.text}
          </Text>
        </View>
      </View>

      {/* Direction indicator */}
      {alignmentData?.direction && (
        <View style={styles.directionRow}>
          <Text style={styles.directionLabel}>Bias:</Text>
          <View
            style={[
              styles.directionBadge,
              {
                backgroundColor:
                  alignmentData.direction === 'LONG'
                    ? 'rgba(78, 205, 196, 0.2)'
                    : 'rgba(255, 107, 107, 0.2)',
              },
            ]}
          >
            {alignmentData.direction === 'LONG' ? (
              <TrendingUp size={14} color="#4ECDC4" />
            ) : (
              <TrendingDown size={14} color="#FF6B6B" />
            )}
            <Text
              style={[
                styles.directionText,
                { color: alignmentData.direction === 'LONG' ? '#4ECDC4' : '#FF6B6B' },
              ]}
            >
              {alignmentData.direction}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  symbol: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  refreshBtn: {
    padding: 4,
  },
  tfRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tfContainer: {
    alignItems: 'center',
    gap: 4,
  },
  tfLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tfLabelSmall: {
    fontSize: 9,
  },
  tfIcon: {
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tfStrength: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tfDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  scoreGauge: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'right',
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  recText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  directionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  directionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  compactTfs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  compactScore: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  compactScoreText: {
    fontSize: 11,
    fontWeight: '700',
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  noDataText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
    marginLeft: SPACING.sm,
  },
});

export default MTFAlignmentPanel;
