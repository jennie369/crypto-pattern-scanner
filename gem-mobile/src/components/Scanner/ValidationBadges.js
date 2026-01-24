/**
 * =====================================================
 * File: src/components/Scanner/ValidationBadges.js
 * Description: Validation status badges for patterns
 * Access: TIER 1+ (validationBadges feature)
 * =====================================================
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Volume2,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Zap,
  Lock,
} from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';

/**
 * Badge configurations
 */
const BADGE_CONFIG = {
  volume: {
    label: 'Volume',
    icon: Volume2,
    tooltipValid: 'Volume confirmed',
    tooltipInvalid: 'Low volume',
  },
  zoneRetest: {
    label: 'Retest',
    icon: Target,
    tooltipValid: 'Zone retested',
    tooltipInvalid: 'Awaiting retest',
  },
  htfAlignment: {
    label: 'HTF',
    icon: TrendingUp,
    tooltipValid: 'HTF aligned',
    tooltipInvalid: 'Counter trend',
  },
  breakout: {
    label: 'Breakout',
    icon: Zap,
    tooltipValid: 'Breakout confirmed',
    tooltipInvalid: 'False breakout',
  },
};

/**
 * Grade colors and styles
 */
const GRADE_STYLES = {
  STRONG: {
    bg: 'rgba(14, 203, 129, 0.2)',
    border: '#0ECB81',
    text: '#0ECB81',
  },
  GOOD: {
    bg: 'rgba(14, 203, 129, 0.15)',
    border: '#0ECB81',
    text: '#0ECB81',
  },
  MEDIUM: {
    bg: 'rgba(255, 189, 89, 0.2)',
    border: '#FFBD59',
    text: '#FFBD59',
  },
  WEAK: {
    bg: 'rgba(246, 70, 93, 0.15)',
    border: '#F6465D',
    text: '#F6465D',
  },
  INVALID: {
    bg: 'rgba(136, 136, 136, 0.2)',
    border: '#888',
    text: '#888',
  },
  LOCKED: {
    bg: 'rgba(136, 136, 136, 0.1)',
    border: '#555',
    text: '#555',
  },
};

/**
 * Get status from validation result
 */
function getStatus(validation) {
  if (!validation) return 'INVALID';
  if (validation.locked) return 'LOCKED';
  if (!validation.valid) return 'INVALID';

  // Check grade or strength
  const grade = validation.grade || validation.retestStrength || validation.quality;
  if (grade === 'STRONG' || grade === 'HIGH_QUALITY') return 'STRONG';
  if (grade === 'GOOD' || grade === 'MEDIUM_QUALITY') return 'GOOD';
  if (grade === 'MEDIUM' || grade === 'ACCEPTABLE') return 'MEDIUM';
  if (grade === 'WEAK' || grade === 'MINIMUM' || grade === 'LOW_QUALITY') return 'WEAK';

  // Default based on valid/invalid
  return validation.valid ? 'GOOD' : 'INVALID';
}

/**
 * Single validation badge
 */
const SingleBadge = ({
  type,
  validation,
  onPress,
  showLabel = true,
  size = 'md',
}) => {
  const config = BADGE_CONFIG[type];
  if (!config) return null;

  const status = getStatus(validation);
  const style = GRADE_STYLES[status];
  const Icon = config.icon;
  const isSmall = size === 'sm';
  const isLocked = status === 'LOCKED';

  // Status icon
  const StatusIcon = isLocked
    ? Lock
    : status === 'INVALID'
    ? XCircle
    : status === 'WEAK'
    ? AlertCircle
    : CheckCircle;

  return (
    <TouchableOpacity
      style={[
        styles.badge,
        { backgroundColor: style.bg, borderColor: style.border },
        isSmall && styles.badgeSmall,
      ]}
      onPress={() => onPress?.(type, validation)}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.badgeContent}>
        <Icon size={isSmall ? 12 : 14} color={style.text} />
        {showLabel && (
          <Text style={[styles.badgeLabel, { color: style.text }, isSmall && styles.badgeLabelSmall]}>
            {config.label}
          </Text>
        )}
      </View>
      <StatusIcon size={isSmall ? 10 : 12} color={style.text} />
    </TouchableOpacity>
  );
};

/**
 * ValidationBadges Component
 *
 * @param {Object} props
 * @param {Object} props.volume - Volume validation result
 * @param {Object} props.zoneRetest - Zone retest validation result
 * @param {Object} props.htfAlignment - HTF alignment result
 * @param {Object} props.breakout - Breakout validation result
 * @param {Function} props.onBadgePress - Badge press handler
 * @param {string} props.size - Badge size ('sm', 'md')
 * @param {boolean} props.showLabels - Show text labels
 * @param {Object} props.style - Additional container style
 */
const ValidationBadges = ({
  volume,
  zoneRetest,
  htfAlignment,
  breakout,
  onBadgePress,
  size = 'md',
  showLabels = true,
  style,
}) => {
  const badges = [
    { type: 'volume', validation: volume },
    { type: 'zoneRetest', validation: zoneRetest },
    { type: 'htfAlignment', validation: htfAlignment },
    { type: 'breakout', validation: breakout },
  ].filter(b => b.validation !== undefined);

  if (badges.length === 0) return null;

  return (
    <View style={[styles.container, style]}>
      {badges.map(({ type, validation }) => (
        <SingleBadge
          key={type}
          type={type}
          validation={validation}
          onPress={onBadgePress}
          showLabel={showLabels}
          size={size}
        />
      ))}
    </View>
  );
};

/**
 * Compact badge row for pattern list
 */
export const ValidationBadgesCompact = ({
  volume,
  zoneRetest,
  htfAlignment,
  style,
}) => {
  return (
    <View style={[styles.compactContainer, style]}>
      {volume !== undefined && (
        <StatusDot status={getStatus(volume)} label="V" />
      )}
      {zoneRetest !== undefined && (
        <StatusDot status={getStatus(zoneRetest)} label="R" />
      )}
      {htfAlignment !== undefined && (
        <StatusDot status={getStatus(htfAlignment)} label="H" />
      )}
    </View>
  );
};

/**
 * Simple status dot
 */
const StatusDot = ({ status, label }) => {
  const style = GRADE_STYLES[status] || GRADE_STYLES.INVALID;
  return (
    <View style={[styles.statusDot, { backgroundColor: style.border }]}>
      <Text style={styles.statusDotLabel}>{label}</Text>
    </View>
  );
};

/**
 * Volume grade badge
 */
export const VolumeBadge = ({ grade, ratio, size = 'md' }) => {
  const style = GRADE_STYLES[grade] || GRADE_STYLES.INVALID;
  const isSmall = size === 'sm';

  return (
    <View style={[
      styles.volumeBadge,
      { backgroundColor: style.bg, borderColor: style.border },
      isSmall && styles.volumeBadgeSmall,
    ]}>
      <Volume2 size={isSmall ? 10 : 12} color={style.text} />
      <Text style={[styles.volumeText, { color: style.text }, isSmall && styles.volumeTextSmall]}>
        {ratio ? `${ratio.toFixed(1)}x` : grade}
      </Text>
    </View>
  );
};

/**
 * HTF alignment badge
 */
export const HTFBadge = ({ aligned, trend, timeframe, size = 'md' }) => {
  const status = aligned ? 'GOOD' : aligned === false ? 'WEAK' : 'INVALID';
  const style = GRADE_STYLES[status];
  const isSmall = size === 'sm';

  const trendIcon = trend?.direction === 'UP' ? '↑' : trend?.direction === 'DOWN' ? '↓' : '→';

  return (
    <View style={[
      styles.htfBadge,
      { backgroundColor: style.bg, borderColor: style.border },
      isSmall && styles.htfBadgeSmall,
    ]}>
      <TrendingUp size={isSmall ? 10 : 12} color={style.text} />
      <Text style={[styles.htfText, { color: style.text }, isSmall && styles.htfTextSmall]}>
        {timeframe} {trendIcon}
      </Text>
    </View>
  );
};

/**
 * Zone retest badge
 */
export const RetestBadge = ({ valid, strength, size = 'md' }) => {
  const status = !valid ? 'INVALID' : strength === 'STRONG' ? 'STRONG' : strength === 'MEDIUM' ? 'MEDIUM' : 'WEAK';
  const style = GRADE_STYLES[status];
  const isSmall = size === 'sm';

  return (
    <View style={[
      styles.retestBadge,
      { backgroundColor: style.bg, borderColor: style.border },
      isSmall && styles.retestBadgeSmall,
    ]}>
      <Target size={isSmall ? 10 : 12} color={style.text} />
      <Text style={[styles.retestText, { color: style.text }, isSmall && styles.retestTextSmall]}>
        {valid ? strength || 'OK' : 'No'}
      </Text>
    </View>
  );
};

/**
 * Pending/waiting badge
 */
export const PendingBadge = ({ label = 'Pending', size = 'md' }) => {
  const isSmall = size === 'sm';
  return (
    <View style={[styles.pendingBadge, isSmall && styles.pendingBadgeSmall]}>
      <Clock size={isSmall ? 10 : 12} color="#888" />
      <Text style={[styles.pendingText, isSmall && styles.pendingTextSmall]}>{label}</Text>
    </View>
  );
};

/**
 * Locked feature badge (for upgrade prompts)
 */
export const LockedBadge = ({ feature, tier, onPress, size = 'md' }) => {
  const isSmall = size === 'sm';
  return (
    <TouchableOpacity
      style={[styles.lockedBadge, isSmall && styles.lockedBadgeSmall]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Lock size={isSmall ? 10 : 12} color="#888" />
      <Text style={[styles.lockedText, isSmall && styles.lockedTextSmall]}>
        TIER {tier}+
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs || 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  badgeLabelSmall: {
    fontSize: 10,
  },
  // Compact
  compactContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  statusDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDotLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
  },
  // Volume badge
  volumeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    gap: 4,
  },
  volumeBadgeSmall: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  volumeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  volumeTextSmall: {
    fontSize: 9,
  },
  // HTF badge
  htfBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    gap: 4,
  },
  htfBadgeSmall: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  htfText: {
    fontSize: 11,
    fontWeight: '600',
  },
  htfTextSmall: {
    fontSize: 9,
  },
  // Retest badge
  retestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    gap: 4,
  },
  retestBadgeSmall: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  retestText: {
    fontSize: 11,
    fontWeight: '600',
  },
  retestTextSmall: {
    fontSize: 9,
  },
  // Pending badge
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(136, 136, 136, 0.2)',
    borderWidth: 1,
    borderColor: '#555',
    gap: 4,
  },
  pendingBadgeSmall: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  pendingText: {
    fontSize: 11,
    color: '#888',
  },
  pendingTextSmall: {
    fontSize: 9,
  },
  // Locked badge
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(136, 136, 136, 0.1)',
    borderWidth: 1,
    borderColor: '#444',
    borderStyle: 'dashed',
    gap: 4,
  },
  lockedBadgeSmall: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  lockedText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  lockedTextSmall: {
    fontSize: 8,
  },
});

export default ValidationBadges;
