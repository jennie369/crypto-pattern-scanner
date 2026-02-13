/**
 * GEM Mobile - Quota Indicator Component
 * Display remaining queries for chatbot
 *
 * Color coding:
 * - Green: > 50% remaining
 * - Yellow/Orange: 20-50% remaining
 * - Red: < 20% remaining or depleted
 * - Cyan/Green: Unlimited (TIER3/VIP)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Zap, Infinity, AlertCircle, Clock } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';

/**
 * Color configurations
 */
const QUOTA_COLORS = {
  success: '#00FF88',   // Green - plenty remaining
  warning: '#FFB800',   // Orange/Yellow - running low
  danger: '#FF6B6B',    // Red - depleted or very low
  unlimited: '#00D9FF'  // Cyan - unlimited tier
};

/**
 * QuotaIndicator Component
 * @param {Object} props
 * @param {Object} props.quota - Quota object from QuotaService.checkQuota()
 * @param {string} props.size - Indicator size ('sm', 'md', 'lg')
 * @param {boolean} props.showLabel - Show "Quota" label
 * @param {boolean} props.showResetTime - Show time until reset
 * @param {Function} props.onPress - Callback when pressed
 * @param {Object} props.style - Additional container style
 */
const QuotaIndicator = ({
  quota,
  size = 'md',
  showLabel = false,
  showResetTime = false,
  onPress,
  style
}) => {
  if (!quota) return null;

  // Determine color based on quota status
  const getColor = () => {
    if (quota.unlimited) return QUOTA_COLORS.unlimited;

    const percentage = (quota.remaining / quota.limit) * 100;

    if (percentage <= 0) return QUOTA_COLORS.danger;
    if (percentage < 20) return QUOTA_COLORS.danger;
    if (percentage < 50) return QUOTA_COLORS.warning;
    return QUOTA_COLORS.success;
  };

  // Get display text
  const getDisplayText = () => {
    if (quota.unlimited) return 'Unlimited';
    if (quota.remaining <= 0) return 'Het luot';
    return `${quota.remaining}/${quota.limit}`;
  };

  // Get reset time text
  const getResetTimeText = () => {
    if (quota.unlimited || !quota.resetAt) return null;

    const now = new Date();
    const reset = new Date(quota.resetAt);
    const diff = reset - now;

    if (diff < 0) return 'Reset ngay';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const color = getColor();
  const displayText = getDisplayText();
  const resetTime = showResetTime ? getResetTimeText() : null;

  // Size configurations
  const sizeConfig = {
    sm: {
      paddingVertical: 3,
      paddingHorizontal: 6,
      iconSize: 10,
      fontSize: 9,
      gap: 3,
      borderRadius: 6
    },
    md: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      iconSize: 12,
      fontSize: 10,
      gap: 4,
      borderRadius: 8
    },
    lg: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      iconSize: 16,
      fontSize: 12,
      gap: 6,
      borderRadius: 10
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // Choose icon
  const IconComponent = quota.unlimited ? Infinity : (quota.remaining <= 0 ? AlertCircle : Zap);
  const iconFill = quota.unlimited ? 'transparent' : color;

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.container,
        {
          paddingVertical: config.paddingVertical,
          paddingHorizontal: config.paddingHorizontal,
          borderRadius: config.borderRadius,
          gap: config.gap
        },
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {showLabel && (
        <Text style={[styles.label, { fontSize: config.fontSize - 1 }]}>
          Quota
        </Text>
      )}

      <View style={[styles.content, { gap: config.gap }]}>
        <IconComponent
          size={config.iconSize}
          color={color}
          fill={iconFill}
        />
        <Text
          style={[
            styles.text,
            {
              color,
              fontSize: config.fontSize
            }
          ]}
        >
          {displayText}
        </Text>
      </View>

      {resetTime && !quota.unlimited && (
        <View style={[styles.resetContainer, { gap: 2 }]}>
          <Clock size={8} color={COLORS.textMuted} />
          <Text style={[styles.resetText, { fontSize: config.fontSize - 2 }]}>
            {resetTime}
          </Text>
        </View>
      )}
    </Container>
  );
};

/**
 * Compact version for inline usage
 */
export const QuotaIndicatorCompact = ({ quota, style }) => {
  if (!quota) return null;

  const getColor = () => {
    if (quota.unlimited) return QUOTA_COLORS.unlimited;
    const percentage = (quota.remaining / quota.limit) * 100;
    if (percentage <= 0) return QUOTA_COLORS.danger;
    if (percentage < 20) return QUOTA_COLORS.danger;
    if (percentage < 50) return QUOTA_COLORS.warning;
    return QUOTA_COLORS.success;
  };

  const color = getColor();

  return (
    <View style={[styles.compactContainer, style]}>
      {quota.unlimited ? (
        <Infinity size={12} color={color} />
      ) : (
        <>
          <Zap size={10} color={color} fill={color} />
          <Text style={[styles.compactText, { color }]}>
            {quota.remaining}
          </Text>
        </>
      )}
    </View>
  );
};

/**
 * Progress bar version
 */
export const QuotaProgressBar = ({ quota, style }) => {
  if (!quota || quota.unlimited) return null;

  const percentage = Math.max(0, (quota.remaining / quota.limit) * 100);

  const getColor = () => {
    if (percentage <= 0) return QUOTA_COLORS.danger;
    if (percentage < 20) return QUOTA_COLORS.danger;
    if (percentage < 50) return QUOTA_COLORS.warning;
    return QUOTA_COLORS.success;
  };

  const color = getColor();

  return (
    <View style={[styles.progressContainer, style]}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: color
            }
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color }]}>
        {quota.remaining}/{quota.limit}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    color: COLORS.textMuted,
    fontWeight: '500',
    marginRight: 4
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5
  },
  resetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
    paddingLeft: 6,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)'
  },
  resetText: {
    color: COLORS.textMuted,
    fontWeight: '500'
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  compactText: {
    fontSize: 10,
    fontWeight: '700'
  },

  // Progress bar styles
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 2
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right'
  }
});

export default QuotaIndicator;
