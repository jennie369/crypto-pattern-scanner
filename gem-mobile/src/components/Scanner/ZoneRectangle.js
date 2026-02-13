/**
 * GEM Mobile - Zone Rectangle Component
 * Displays a single zone as a card with zone info, strength, and status
 *
 * Props:
 * - zone: Zone object
 * - onPress: Callback when zone is pressed
 * - isSelected: Whether zone is currently selected
 * - showLabel: Whether to show Buy/Sell label
 * - compact: Use compact layout
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Bell,
  BellOff,
} from 'lucide-react-native';

import { ZONE_TYPE, ZONE_STATUS, ZONE_COLORS, zoneManager } from '../../services/zoneManager';
import { zonePriceMonitor } from '../../services/zonePriceMonitor';
import { tierAccessService } from '../../services/tierAccessService';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme/darkTheme';

const ZoneRectangle = ({
  zone,
  onPress,
  isSelected = false,
  showLabel = true,
  showAlertToggle = true,
  compact = false,
  onAlertToggle,
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingAlert, setLoadingAlert] = useState(false);

  if (!zone) return null;

  const isLFZ = zone.zone_type === ZONE_TYPE.LFZ;
  const colors = ZONE_COLORS[zone.zone_type] || ZONE_COLORS.HFZ;
  const statusDisplay = zoneManager.getZoneStatusDisplay(zone);
  const strengthStars = zoneManager.getZoneStrengthStars(zone);
  const canUseAlerts = tierAccessService.canUseZoneAlerts();

  // Check if zone is subscribed
  useEffect(() => {
    if (zone?.id) {
      setIsSubscribed(zonePriceMonitor.isZoneSubscribed(zone.id));
    }
  }, [zone?.id]);

  const handleAlertToggle = async (e) => {
    e.stopPropagation?.();
    if (!canUseAlerts || loadingAlert) return;

    setLoadingAlert(true);
    try {
      if (isSubscribed) {
        await zonePriceMonitor.unsubscribeFromZone(zone.id);
        setIsSubscribed(false);
      } else {
        const result = await zonePriceMonitor.subscribeToZone(zone);
        if (result.success) {
          setIsSubscribed(true);
        }
      }
      onAlertToggle?.(zone, !isSubscribed);
    } catch (error) {
      console.error('[ZoneRectangle] Alert toggle error:', error);
    } finally {
      setLoadingAlert(false);
    }
  };

  const renderAlertButton = () => {
    if (!showAlertToggle || zone.status === ZONE_STATUS.BROKEN) return null;

    return (
      <TouchableOpacity
        style={[
          styles.alertButton,
          isSubscribed && styles.alertButtonActive,
          !canUseAlerts && styles.alertButtonDisabled,
        ]}
        onPress={handleAlertToggle}
        disabled={!canUseAlerts || loadingAlert}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {loadingAlert ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : isSubscribed ? (
          <Bell size={16} color={COLORS.primary} fill={COLORS.primary} />
        ) : (
          <BellOff size={16} color={canUseAlerts ? COLORS.textSecondary : COLORS.border} />
        )}
      </TouchableOpacity>
    );
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={compact ? 10 : 12}
          color={i < strengthStars ? '#FFD700' : '#6C757D'}
          fill={i < strengthStars ? '#FFD700' : 'transparent'}
        />
      );
    }
    return stars;
  };

  const getStatusIcon = () => {
    switch (zone.status) {
      case ZONE_STATUS.FRESH:
        return <CheckCircle size={14} color={statusDisplay.color} />;
      case ZONE_STATUS.TESTED_1X:
      case ZONE_STATUS.TESTED_2X:
        return <AlertCircle size={14} color={statusDisplay.color} />;
      case ZONE_STATUS.TESTED_3X_PLUS:
        return <AlertCircle size={14} color={statusDisplay.color} />;
      case ZONE_STATUS.BROKEN:
        return <XCircle size={14} color={statusDisplay.color} />;
      case ZONE_STATUS.EXPIRED:
        return <Clock size={14} color={statusDisplay.color} />;
      default:
        return null;
    }
  };

  const formatPrice = (price) => {
    if (!price) return '—';
    const num = parseFloat(price);
    if (num >= 1000) return num.toFixed(2);
    if (num >= 1) return num.toFixed(4);
    return num.toFixed(6);
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          { borderLeftColor: colors.border },
          isSelected && styles.selected,
        ]}
        onPress={() => onPress?.(zone)}
        activeOpacity={0.7}
      >
        {/* Zone Type Icon */}
        <View style={[styles.compactIcon, { backgroundColor: colors.fill }]}>
          {isLFZ ? (
            <TrendingUp size={14} color={colors.border} />
          ) : (
            <TrendingDown size={14} color={colors.border} />
          )}
        </View>

        {/* Zone Info */}
        <View style={styles.compactInfo}>
          <Text style={[styles.compactLabel, { color: colors.border }]}>
            {isLFZ ? 'Buy' : 'Sell'} {zone.strength}%
          </Text>
          <Text style={styles.compactPrice}>
            {formatPrice(zone.zone_high)} - {formatPrice(zone.zone_low)}
          </Text>
        </View>

        {/* Stars */}
        <View style={styles.compactStars}>
          {renderStars()}
        </View>

        {/* Alert Button (compact) */}
        {showAlertToggle && zone.status !== ZONE_STATUS.BROKEN && (
          <TouchableOpacity
            style={[
              styles.compactAlertButton,
              isSubscribed && styles.alertButtonActive,
              !canUseAlerts && styles.alertButtonDisabled,
            ]}
            onPress={handleAlertToggle}
            disabled={!canUseAlerts || loadingAlert}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {loadingAlert ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : isSubscribed ? (
              <Bell size={14} color={COLORS.primary} fill={COLORS.primary} />
            ) : (
              <BellOff size={14} color={canUseAlerts ? COLORS.textSecondary : COLORS.border} />
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderLeftColor: colors.border, backgroundColor: colors.fill },
        isSelected && styles.selected,
      ]}
      onPress={() => onPress?.(zone)}
      activeOpacity={0.7}
    >
      {/* Header Row */}
      <View style={styles.header}>
        {/* Zone Type Icon + Label */}
        <View style={styles.typeContainer}>
          <View style={[styles.typeIcon, { backgroundColor: colors.border }]}>
            {isLFZ ? (
              <TrendingUp size={16} color="#FFFFFF" />
            ) : (
              <TrendingDown size={16} color="#FFFFFF" />
            )}
          </View>
          {showLabel && (
            <View style={[styles.actionBadge, { backgroundColor: colors.labelBg }]}>
              <Text style={styles.actionText}>
                {isLFZ ? 'Buy' : 'Sell'} {zone.strength}%
              </Text>
            </View>
          )}
        </View>

        {/* Right side: Alert Button + Grade Badge */}
        <View style={styles.headerRight}>
          {/* Alert Button */}
          {renderAlertButton()}

          {/* Grade Badge */}
          {zone.pattern_grade && (
            <View style={[styles.gradeBadge, { borderColor: colors.border }]}>
              <Text style={[styles.gradeText, { color: colors.border }]}>
                {zone.pattern_grade}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Zone Boundaries */}
      <View style={styles.priceRow}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Zone High</Text>
          <Text style={styles.priceValue}>{formatPrice(zone.zone_high)}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Zone Low</Text>
          <Text style={styles.priceValue}>{formatPrice(zone.zone_low)}</Text>
        </View>
      </View>

      {/* Pattern Type */}
      <View style={styles.patternRow}>
        <Text style={styles.patternLabel}>
          {zone.pattern_type || 'Unknown Pattern'}
        </Text>
      </View>

      {/* Footer: Stars + Status */}
      <View style={styles.footer}>
        {/* Strength Stars */}
        <View style={styles.starsContainer}>
          {renderStars()}
        </View>

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: statusDisplay.color }]}>
            {statusDisplay.text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.sm,
  },
  selected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  typeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  gradeBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  alertButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  alertButtonActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: COLORS.primary,
  },
  alertButtonDisabled: {
    opacity: 0.4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginBottom: 2,
  },
  priceValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  priceDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  patternRow: {
    marginBottom: SPACING.sm,
  },
  patternLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    padding: SPACING.sm,
    marginVertical: 2,
    marginHorizontal: SPACING.sm,
  },
  compactIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  compactInfo: {
    flex: 1,
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactPrice: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  compactStars: {
    flexDirection: 'row',
    gap: 1,
  },
  compactAlertButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: SPACING.xs,
  },
});

export default ZoneRectangle;
