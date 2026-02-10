/**
 * GEM Mobile - Zone Validity Badge Component
 * Display Look Right validation status for zones
 *
 * Phase 2C: Compression + Inducement + Look Right
 */

import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  Eye,
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
  Target,
} from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

// ═══════════════════════════════════════════════════════════
// STATUS COLORS & ICONS
// ═══════════════════════════════════════════════════════════

const getStatusConfig = (status, colors) => {
  switch (status) {
    case 'FRESH':
      return {
        color: colors.success,
        icon: Check,
        label: 'Còn nguyên',
        description: 'Zone chưa bị test - Tốt nhất để trade',
      };
    case 'TESTED':
      return {
        color: colors.warning,
        icon: AlertTriangle,
        label: 'Đã test',
        description: 'Zone đã bị test nhưng vẫn valid',
      };
    case 'BROKEN':
      return {
        color: colors.error,
        icon: X,
        label: 'Đã phá',
        description: 'Zone đã bị invalidate - KHÔNG trade',
      };
    default:
      return {
        color: colors.textMuted,
        icon: Eye,
        label: 'Chưa xác định',
        description: 'Cần thêm data để xác định',
      };
  }
};

// ═══════════════════════════════════════════════════════════
// VALIDITY BADGE (COMPACT)
// ═══════════════════════════════════════════════════════════

export const ValidityBadge = memo(({ validation, onPress }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    confidenceText: {
      fontSize: 10,
      fontWeight: '700',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!validation) return null;

  const { status, isValid, confidence } = validation;
  const config = getStatusConfig(status, colors);
  const IconComponent = config.icon;

  return (
    <TouchableOpacity
      style={[styles.badge, { borderColor: config.color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <IconComponent size={12} color={config.color} />
      <Text style={[styles.badgeText, { color: config.color }]}>
        {config.label}
      </Text>
      {confidence !== undefined && (
        <Text style={[styles.confidenceText, { color: config.color }]}>
          {Math.round(confidence * 100)}%
        </Text>
      )}
    </TouchableOpacity>
  );
});

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const ZoneValidityBadge = memo(({
  validation,
  zone,
  onInfoPress,
  showDetails = true,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const [expanded, setExpanded] = React.useState(false);

  const styles = useMemo(() => StyleSheet.create({
    // Container
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 16,
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
      borderRadius: 12,
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
      color: colors.textPrimary,
      fontWeight: '600',
    },
    statusBadge: {
      paddingHorizontal: SPACING.xs,
      paddingVertical: 2,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 9,
      color: colors.bgDarkest,
      fontWeight: '700',
    },
    subtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    infoButton: {
      padding: 4,
    },

    // Confidence
    confidenceContainer: {
      marginTop: SPACING.md,
    },
    confidenceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.xs,
    },
    confidenceLabel: {
      fontSize: 11,
      color: colors.textMuted,
    },
    confidenceValue: {
      fontSize: 13,
      fontWeight: '700',
    },
    confidenceBar: {
      height: 6,
      backgroundColor: colors.bgDarkest,
      borderRadius: 3,
      overflow: 'hidden',
    },
    confidenceFill: {
      height: '100%',
      borderRadius: 3,
    },

    // Stats
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: SPACING.md,
      paddingVertical: SPACING.sm,
      backgroundColor: colors.bgDarkest,
      borderRadius: 12,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statLabel: {
      fontSize: 9,
      color: colors.textMuted,
      textAlign: 'center',
    },
    statValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginTop: 2,
    },
    statDivider: {
      width: 1,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },

    // Expanded
    expandedContainer: {
      marginTop: SPACING.md,
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
    },
    reasonContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.xs,
      marginBottom: SPACING.sm,
    },
    reasonText: {
      fontSize: 12,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 16,
    },
    invalidationContainer: {
      backgroundColor: colors.bgDarkest,
      borderRadius: 8,
      padding: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    invalidationTitle: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: SPACING.xs,
    },
    invalidationGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    invalidationItem: {
      alignItems: 'center',
    },
    invalidationLabel: {
      fontSize: 9,
      color: colors.textMuted,
    },
    invalidationValue: {
      fontSize: 11,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    healthContainer: {
      marginBottom: SPACING.sm,
    },
    healthTitle: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: SPACING.xs,
    },
    healthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    healthGrade: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    healthGradeText: {
      fontSize: 14,
      color: colors.bgDarkest,
      fontWeight: '700',
    },
    healthScore: {
      fontSize: 12,
      color: colors.textPrimary,
      flex: 1,
    },
    healthTradeable: {
      fontSize: 11,
      fontWeight: '600',
    },
    tipContainer: {
      borderLeftWidth: 3,
      paddingLeft: SPACING.sm,
      paddingVertical: SPACING.xs,
    },
    tipText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontStyle: 'italic',
      lineHeight: 16,
    },

    // Recommendation
    recommendationBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginTop: SPACING.sm,
      padding: SPACING.sm,
      borderRadius: 8,
    },
    recommendationText: {
      fontSize: 12,
      fontWeight: '600',
      flex: 1,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!validation) return null;

  const {
    isValid,
    status,
    confidence,
    closesBeyondZone,
    wicksBeyondZone,
    maxPenetrationPercent,
    reason,
    recommendation,
    invalidationCandle,
  } = validation;

  const config = getStatusConfig(status, colors);
  const IconComponent = config.icon;

  const formatPrice = (price) => {
    if (!price) return '-';
    return price >= 1 ? price.toFixed(2) : price.toFixed(6);
  };

  return (
    <View style={[styles.container, { borderLeftColor: config.color }]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
            <ArrowRight size={18} color={config.color} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Look Right</Text>
              <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
                <Text style={styles.statusText}>{config.label}</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>{config.description}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {onInfoPress && (
            <TouchableOpacity onPress={onInfoPress} style={styles.infoButton}>
              <Info size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
          {expanded ? (
            <ChevronUp size={18} color={colors.textMuted} />
          ) : (
            <ChevronDown size={18} color={colors.textMuted} />
          )}
        </View>
      </TouchableOpacity>

      {/* Confidence Bar */}
      <View style={styles.confidenceContainer}>
        <View style={styles.confidenceHeader}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <Text style={[styles.confidenceValue, { color: config.color }]}>
            {Math.round(confidence * 100)}%
          </Text>
        </View>
        <View style={styles.confidenceBar}>
          <View
            style={[
              styles.confidenceFill,
              {
                width: `${confidence * 100}%`,
                backgroundColor: config.color,
              },
            ]}
          />
        </View>
      </View>

      {/* Stats Row */}
      {showDetails && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Closes Beyond</Text>
            <Text style={[
              styles.statValue,
              { color: closesBeyondZone > 0 ? colors.error : colors.success }
            ]}>
              {closesBeyondZone}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Wicks Beyond</Text>
            <Text style={[
              styles.statValue,
              { color: wicksBeyondZone > 2 ? colors.warning : colors.textPrimary }
            ]}>
              {wicksBeyondZone}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Max Penetration</Text>
            <Text style={styles.statValue}>{maxPenetrationPercent}%</Text>
          </View>
        </View>
      )}

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.expandedContainer}>
          {/* Reason */}
          <View style={styles.reasonContainer}>
            <IconComponent size={14} color={config.color} />
            <Text style={styles.reasonText}>{reason}</Text>
          </View>

          {/* Invalidation Candle */}
          {invalidationCandle && (
            <View style={styles.invalidationContainer}>
              <Text style={styles.invalidationTitle}>Invalidation Candle</Text>
              <View style={styles.invalidationGrid}>
                <View style={styles.invalidationItem}>
                  <Text style={styles.invalidationLabel}>Close</Text>
                  <Text style={[styles.invalidationValue, { color: colors.error }]}>
                    {formatPrice(invalidationCandle.close)}
                  </Text>
                </View>
                <View style={styles.invalidationItem}>
                  <Text style={styles.invalidationLabel}>High</Text>
                  <Text style={styles.invalidationValue}>
                    {formatPrice(invalidationCandle.high)}
                  </Text>
                </View>
                <View style={styles.invalidationItem}>
                  <Text style={styles.invalidationLabel}>Low</Text>
                  <Text style={styles.invalidationValue}>
                    {formatPrice(invalidationCandle.low)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Zone Health */}
          {validation.health && (
            <View style={styles.healthContainer}>
              <Text style={styles.healthTitle}>Zone Health</Text>
              <View style={styles.healthRow}>
                <View style={[styles.healthGrade, { backgroundColor: config.color }]}>
                  <Text style={styles.healthGradeText}>{validation.health.grade}</Text>
                </View>
                <Text style={styles.healthScore}>
                  Score: {validation.health.score}/100
                </Text>
                <Text style={[
                  styles.healthTradeable,
                  { color: validation.health.tradeable ? colors.success : colors.error }
                ]}>
                  {validation.health.tradeable ? 'Tradeable' : 'Skip'}
                </Text>
              </View>
            </View>
          )}

          {/* Tip */}
          <View style={[styles.tipContainer, { borderLeftColor: config.color }]}>
            <Text style={styles.tipText}>
              {isValid
                ? 'Look Right = Zone chưa bị phá bên phải chart. Valid để trade.'
                : 'Zone đã bị invalidate. Tìm zone khác hoặc chờ zone mới hình thành.'}
            </Text>
          </View>
        </View>
      )}

      {/* Recommendation */}
      <View style={[styles.recommendationBox, { backgroundColor: config.color + '10' }]}>
        {isValid ? (
          <Shield size={14} color={config.color} />
        ) : (
          <X size={14} color={config.color} />
        )}
        <Text style={[styles.recommendationText, { color: config.color }]}>
          {recommendation}
        </Text>
      </View>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════
// REAL-TIME VALIDITY INDICATOR
// ═══════════════════════════════════════════════════════════

export const RealTimeValidityIndicator = memo(({ realTimeCheck, zone }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    realTimeContainer: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 12,
      borderWidth: 1,
      padding: SPACING.md,
    },
    realTimeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginBottom: SPACING.sm,
    },
    realTimeTitle: {
      fontSize: 12,
      fontWeight: '600',
    },
    realTimeContent: {
      gap: SPACING.xs,
    },
    realTimeItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    realTimeLabel: {
      fontSize: 11,
      color: colors.textMuted,
    },
    realTimeValue: {
      fontSize: 12,
      fontWeight: '600',
    },
    alertBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginTop: SPACING.sm,
      padding: SPACING.sm,
      borderRadius: 8,
    },
    alertText: {
      fontSize: 11,
      fontWeight: '500',
      flex: 1,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!realTimeCheck) return null;

  const { isBreaking, isBroken, distancePercent, warning, warningLevel } = realTimeCheck;

  const getColor = () => {
    if (warningLevel === 'error') return colors.error;
    if (warningLevel === 'warning') return colors.warning;
    return colors.success;
  };

  const color = getColor();

  return (
    <View style={[styles.realTimeContainer, { borderColor: color }]}>
      <View style={styles.realTimeHeader}>
        <Eye size={14} color={color} />
        <Text style={[styles.realTimeTitle, { color }]}>Real-Time Monitor</Text>
      </View>

      <View style={styles.realTimeContent}>
        <View style={styles.realTimeItem}>
          <Text style={styles.realTimeLabel}>Status</Text>
          <Text style={[styles.realTimeValue, { color }]}>{warning}</Text>
        </View>

        <View style={styles.realTimeItem}>
          <Text style={styles.realTimeLabel}>Distance to Invalidation</Text>
          <Text style={[styles.realTimeValue, { color }]}>{distancePercent}%</Text>
        </View>
      </View>

      {(isBreaking || isBroken) && (
        <View style={[styles.alertBox, { backgroundColor: color + '20' }]}>
          <AlertTriangle size={14} color={color} />
          <Text style={[styles.alertText, { color }]}>
            {isBroken
              ? 'Zone đã bị phá! Đóng position hoặc không entry.'
              : 'Cảnh báo! Giá đang test vùng invalidation.'}
          </Text>
        </View>
      )}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════
// VALIDITY CARD (COMPACT)
// ═══════════════════════════════════════════════════════════

export const ValidityCard = memo(({ validation, onPress }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 12,
      borderWidth: 1,
      padding: SPACING.sm,
    },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
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
      color: colors.textPrimary,
      fontWeight: '600',
    },
    cardConfidence: {
      fontSize: 14,
      fontWeight: '700',
    },
    cardStatus: {
      fontSize: 11,
      marginTop: 2,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!validation) return null;

  const { status, confidence, isValid } = validation;
  const config = getStatusConfig(status, colors);
  const IconComponent = config.icon;

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: config.color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.cardIcon, { backgroundColor: config.color + '20' }]}>
        <IconComponent size={20} color={config.color} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Look Right</Text>
          <Text style={[styles.cardConfidence, { color: config.color }]}>
            {Math.round(confidence * 100)}%
          </Text>
        </View>
        <Text style={[styles.cardStatus, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

ZoneValidityBadge.displayName = 'ZoneValidityBadge';
ValidityBadge.displayName = 'ValidityBadge';
ValidityCard.displayName = 'ValidityCard';
RealTimeValidityIndicator.displayName = 'RealTimeValidityIndicator';

export default ZoneValidityBadge;
