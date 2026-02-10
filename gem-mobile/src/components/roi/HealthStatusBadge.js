/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HEALTH STATUS BADGE
 * ROI Proof System - Phase A
 * Displays account health status with icon and optional label
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Flame,
  Skull,
} from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { BORDER_RADIUS } from '../../utils/tokens';
import { HEALTH_CONFIG } from '../../services/accountHealthService';

/**
 * Icon mapping for health statuses
 */
const HEALTH_ICONS = {
  healthy: ShieldCheck,
  warning: AlertTriangle,
  danger: AlertOctagon,
  burned: Flame,
  wiped: Skull,
};

/**
 * Size configurations
 */
const SIZE_CONFIG = {
  sm: {
    container: { paddingHorizontal: 8, paddingVertical: 4 },
    iconSize: 14,
    fontSize: 10,
    gap: 4,
  },
  md: {
    container: { paddingHorizontal: 10, paddingVertical: 6 },
    iconSize: 16,
    fontSize: 12,
    gap: 6,
  },
  lg: {
    container: { paddingHorizontal: 14, paddingVertical: 8 },
    iconSize: 20,
    fontSize: 14,
    gap: 8,
  },
};

/**
 * HealthStatusBadge Component
 *
 * @param {Object} props
 * @param {string} props.status - Health status: 'healthy', 'warning', 'danger', 'burned', 'wiped'
 * @param {number} props.balancePct - Optional balance percentage to display
 * @param {'sm' | 'md' | 'lg'} props.size - Badge size
 * @param {boolean} props.showLabel - Show status label
 * @param {boolean} props.showPercentage - Show balance percentage
 * @param {boolean} props.outline - Use outline style instead of filled
 * @param {Object} props.style - Additional container styles
 */
const HealthStatusBadge = ({
  status = 'healthy',
  balancePct,
  size = 'md',
  showLabel = true,
  showPercentage = false,
  outline = false,
  style,
}) => {
  const { colors, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Get configuration
  const config = HEALTH_CONFIG[status] || HEALTH_CONFIG.healthy;
  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const IconComponent = HEALTH_ICONS[status] || HEALTH_ICONS.healthy;

  // Format percentage
  const formattedPct = balancePct != null ? `${Math.round(balancePct)}%` : null;

  // Determine what to show as label
  const labelText = showPercentage && formattedPct
    ? formattedPct
    : (showLabel ? config.labelShort : null);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: BORDER_RADIUS.md,
    },
    label: {
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View
      style={[
        styles.container,
        sizeConfig.container,
        {
          backgroundColor: outline ? 'transparent' : config.bgColor,
          borderColor: config.borderColor,
          borderWidth: outline ? 1.5 : 1,
        },
        style,
      ]}
    >
      <IconComponent
        size={sizeConfig.iconSize}
        color={config.color}
        strokeWidth={2.5}
      />
      {labelText && (
        <Text
          style={[
            styles.label,
            {
              fontSize: sizeConfig.fontSize,
              color: config.color,
              marginLeft: sizeConfig.gap,
            },
          ]}
          numberOfLines={1}
        >
          {labelText}
        </Text>
      )}
    </View>
  );
};

/**
 * HealthStatusIcon Component
 * Renders only the icon without container
 *
 * @param {Object} props
 * @param {string} props.status - Health status
 * @param {number} props.size - Icon size
 * @param {Object} props.style - Additional styles
 */
export const HealthStatusIcon = ({ status = 'healthy', size = 20, style }) => {
  const config = HEALTH_CONFIG[status] || HEALTH_CONFIG.healthy;
  const IconComponent = HEALTH_ICONS[status] || HEALTH_ICONS.healthy;

  return (
    <View style={style}>
      <IconComponent
        size={size}
        color={config.color}
        strokeWidth={2.5}
      />
    </View>
  );
};

/**
 * HealthStatusCard Component
 * Larger card-style display with more details
 *
 * @param {Object} props
 * @param {string} props.status - Health status
 * @param {number} props.balancePct - Balance percentage
 * @param {string} props.message - Optional custom message
 * @param {Object} props.style - Additional styles
 */
export const HealthStatusCard = ({
  status = 'healthy',
  balancePct,
  message,
  style,
}) => {
  const { colors, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const config = HEALTH_CONFIG[status] || HEALTH_CONFIG.healthy;
  const IconComponent = HEALTH_ICONS[status] || HEALTH_ICONS.healthy;

  const styles = useMemo(() => StyleSheet.create({
    // Card styles
    card: {
      borderRadius: BORDER_RADIUS.lg,
      borderWidth: 1,
      padding: SPACING.lg,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    cardIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    cardTitleContainer: {
      flex: 1,
    },
    cardTitle: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    cardPercentage: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
      marginTop: 2,
    },
    cardDescription: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: colors.textMuted,
      lineHeight: 20,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
        style,
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.cardIconContainer,
            { backgroundColor: config.bgColor },
          ]}
        >
          <IconComponent
            size={24}
            color={config.color}
            strokeWidth={2.5}
          />
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={[styles.cardTitle, { color: config.color }]}>
            {config.label}
          </Text>
          {balancePct != null && (
            <Text style={styles.cardPercentage}>
              {Math.round(balancePct)}% vốn
            </Text>
          )}
        </View>
      </View>
      <Text style={styles.cardDescription}>
        {message || config.description}
      </Text>
    </View>
  );
};

/**
 * HealthStatusDot Component
 * Simple dot indicator for compact displays
 *
 * @param {Object} props
 * @param {string} props.status - Health status
 * @param {number} props.size - Dot size
 * @param {Object} props.style - Additional styles
 */
export const HealthStatusDot = ({ status = 'healthy', size = 8, style }) => {
  const config = HEALTH_CONFIG[status] || HEALTH_CONFIG.healthy;

  const styles = useMemo(() => StyleSheet.create({
    // Dot styles
    dot: {
      // Dimensions set inline
    },
  }), []);

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: config.color,
        },
        style,
      ]}
    />
  );
};

export default React.memo(HealthStatusBadge);
