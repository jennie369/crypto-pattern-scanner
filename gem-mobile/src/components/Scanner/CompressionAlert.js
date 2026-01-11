/**
 * GEM Mobile - Compression Alert Component
 * Display compression detection alert with pattern info
 *
 * Phase 2C: Compression + Inducement + Look Right
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Activity,
  TrendingDown,
  TrendingUp,
  Triangle,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/tokens';

// ═══════════════════════════════════════════════════════════
// COMPRESSION TYPE ICONS
// ═══════════════════════════════════════════════════════════

const COMPRESSION_ICONS = {
  descending_triangle: TrendingDown,
  ascending_triangle: TrendingUp,
  descending_wedge: TrendingDown,
  ascending_wedge: TrendingUp,
  symmetrical: Triangle,
  undefined_compression: Activity,
};

// ═══════════════════════════════════════════════════════════
// COMPRESSION BADGE (COMPACT)
// ═══════════════════════════════════════════════════════════

export const CompressionBadge = memo(({ compression, onPress }) => {
  if (!compression?.hasCompression) return null;

  const { compressionQuality, compressionPercent, compressionType } = compression;
  const IconComponent = COMPRESSION_ICONS[compressionType] || Activity;

  const getQualityColor = () => {
    if (compressionQuality === 'excellent') return COLORS.gold;
    if (compressionQuality === 'good') return COLORS.success;
    return COLORS.warning;
  };

  const color = getQualityColor();

  return (
    <TouchableOpacity
      style={[styles.badge, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <IconComponent size={12} color={color} />
      <Text style={[styles.badgeText, { color }]}>
        Nén {compressionPercent}%
      </Text>
      <View style={[styles.qualityDot, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
});

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const CompressionAlert = memo(({
  compression,
  zoneType,
  onInfoPress,
  showDetails = true,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  if (!compression?.hasCompression) {
    return null;
  }

  const {
    compressionType,
    compressionQuality,
    compressionPercent,
    compressionRatio,
    implication,
    recommendation,
    candleCount,
    ranges,
  } = compression;

  const getQualityColor = () => {
    if (compressionQuality === 'excellent') return COLORS.gold;
    if (compressionQuality === 'good') return COLORS.success;
    return COLORS.warning;
  };

  const IconComponent = COMPRESSION_ICONS[compressionType] || Activity;
  const qualityColor = getQualityColor();

  const formatCompressionType = (type) => {
    const names = {
      descending_triangle: 'Tam Giác Giảm',
      ascending_triangle: 'Tam Giác Tăng',
      descending_wedge: 'Nêm Giảm',
      ascending_wedge: 'Nêm Tăng',
      symmetrical: 'Tam Giác Đối Xứng',
    };
    return names[type] || 'Nén Giá';
  };

  return (
    <View style={[styles.container, { borderLeftColor: qualityColor }]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: qualityColor + '20' }]}>
            <IconComponent size={18} color={qualityColor} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Compression Detected</Text>
            </View>
            <Text style={styles.type}>{formatCompressionType(compressionType)}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.qualityBadge, { backgroundColor: qualityColor }]}>
            <Text style={styles.qualityText}>{compressionQuality}</Text>
          </View>
          {onInfoPress && (
            <TouchableOpacity onPress={onInfoPress} style={styles.infoButton}>
              <Info size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
          {expanded ? (
            <ChevronUp size={18} color={COLORS.textMuted} />
          ) : (
            <ChevronDown size={18} color={COLORS.textMuted} />
          )}
        </View>
      </TouchableOpacity>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Nén</Text>
          <Text style={[styles.metricValue, { color: qualityColor }]}>
            {compressionPercent}%
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Ratio</Text>
          <Text style={styles.metricValue}>{compressionRatio}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Candles</Text>
          <Text style={styles.metricValue}>{candleCount}</Text>
        </View>
      </View>

      {/* Implication */}
      {showDetails && (
        <View style={[styles.implicationContainer, { backgroundColor: qualityColor + '10' }]}>
          <Zap size={14} color={qualityColor} />
          <Text style={[styles.implicationText, { color: qualityColor }]}>
            {implication}
          </Text>
        </View>
      )}

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.expandedContainer}>
          {/* Range progression */}
          {ranges && ranges.length > 0 && (
            <View style={styles.rangesContainer}>
              <Text style={styles.rangesTitle}>Range Progression</Text>
              <View style={styles.rangesRow}>
                {ranges.slice(0, 5).map((r, i) => (
                  <View key={i} style={styles.rangeItem}>
                    <View
                      style={[
                        styles.rangeBar,
                        {
                          height: Math.max(8, (r.range / ranges[0].range) * 40),
                          backgroundColor: i === ranges.length - 1 ? qualityColor : COLORS.textMuted,
                        },
                      ]}
                    />
                    <Text style={styles.rangeLabel}>{i + 1}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Recommendation */}
          <View style={[styles.recommendationContainer, { borderLeftColor: qualityColor }]}>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        </View>
      )}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════
// COMPACT CARD VERSION
// ═══════════════════════════════════════════════════════════

export const CompressionCard = memo(({ compression, onPress }) => {
  if (!compression?.hasCompression) return null;

  const { compressionType, compressionQuality, compressionPercent, implication } = compression;
  const IconComponent = COMPRESSION_ICONS[compressionType] || Activity;

  const getQualityColor = () => {
    if (compressionQuality === 'excellent') return COLORS.gold;
    if (compressionQuality === 'good') return COLORS.success;
    return COLORS.warning;
  };

  const color = getQualityColor();

  const formatType = (type) => {
    const names = {
      descending_triangle: 'Tam Giác Giảm',
      ascending_triangle: 'Tam Giác Tăng',
      descending_wedge: 'Nêm Giảm',
      ascending_wedge: 'Nêm Tăng',
      symmetrical: 'Đối Xứng',
    };
    return names[type] || 'Nén';
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.cardIcon, { backgroundColor: color + '20' }]}>
        <IconComponent size={20} color={color} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{formatType(compressionType)}</Text>
          <Text style={[styles.cardPercent, { color }]}>{compressionPercent}%</Text>
        </View>
        <Text style={styles.cardSubtext} numberOfLines={1}>
          {implication}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  qualityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Container
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 3,
    padding: SPACING.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  type: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  qualityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.sm,
  },
  qualityText: {
    fontSize: 10,
    color: COLORS.bgDarkest,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  infoButton: {
    padding: 4,
  },

  // Metrics
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bgDarkest,
    borderRadius: BORDER_RADIUS.md,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: COLORS.glassBg,
  },

  // Implication
  implicationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  implicationText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },

  // Expanded
  expandedContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBg,
  },
  rangesContainer: {
    marginBottom: SPACING.sm,
  },
  rangesTitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  rangesRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  rangeItem: {
    alignItems: 'center',
    gap: 2,
  },
  rangeBar: {
    width: 16,
    borderRadius: 2,
  },
  rangeLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  recommendationContainer: {
    borderLeftWidth: 3,
    paddingLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  recommendationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.sm,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  cardPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardSubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

CompressionAlert.displayName = 'CompressionAlert';
CompressionBadge.displayName = 'CompressionBadge';
CompressionCard.displayName = 'CompressionCard';

export default CompressionAlert;
