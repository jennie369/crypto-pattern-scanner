/**
 * GEM Mobile - Freshness Indicator Component
 * Visual display for zone freshness/test count
 *
 * Phase 1C: Odds Enhancers + Freshness Tracking
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  Info,
  Target,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';
import { getFreshnessDisplayInfo, getRemainingOrdersPercent } from '../../services/freshnessTracker';

/**
 * Main Freshness Indicator
 */
const FreshnessIndicator = ({
  testCount = 0,
  size = 'medium',
  showDetails = true,
  showOrders = true,
  onInfoPress,
  style,
}) => {
  const freshnessInfo = getFreshnessDisplayInfo(testCount);
  const remainingOrders = getRemainingOrdersPercent(testCount);

  const sizes = {
    small: { icon: 14, badge: 20, text: 10 },
    medium: { icon: 18, badge: 28, text: 12 },
    large: { icon: 24, badge: 36, text: 14 },
  };

  const sizeConfig = sizes[size] || sizes.medium;

  const IconComponent = freshnessInfo.isFTB
    ? Sparkles
    : freshnessInfo.status === 'tested'
    ? RefreshCw
    : AlertCircle;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onInfoPress}
      activeOpacity={onInfoPress ? 0.7 : 1}
      disabled={!onInfoPress}
    >
      {/* Icon badge */}
      <View
        style={[
          styles.iconBadge,
          {
            width: sizeConfig.badge,
            height: sizeConfig.badge,
            backgroundColor: freshnessInfo.color + '20',
          },
        ]}
      >
        <IconComponent size={sizeConfig.icon} color={freshnessInfo.color} />
      </View>

      {/* Details */}
      {showDetails && (
        <View style={styles.details}>
          <Text
            style={[
              styles.label,
              { fontSize: sizeConfig.text, color: freshnessInfo.color },
            ]}
          >
            {freshnessInfo.label}
          </Text>
          {showOrders && (
            <Text style={[styles.orders, { fontSize: sizeConfig.text - 2 }]}>
              {remainingOrders}% orders
            </Text>
          )}
        </View>
      )}

      {/* Info button */}
      {onInfoPress && (
        <Info size={14} color={COLORS.textSecondary} style={styles.infoIcon} />
      )}
    </TouchableOpacity>
  );
};

/**
 * FTB Badge - Special badge for First Time Back
 */
export const FTBBadge = ({ size = 'medium', style }) => {
  const sizes = {
    small: { padding: 4, text: 9, icon: 10 },
    medium: { padding: 6, text: 11, icon: 12 },
    large: { padding: 8, text: 13, icon: 14 },
  };

  const sizeConfig = sizes[size] || sizes.medium;

  return (
    <View style={[styles.ftbBadge, { padding: sizeConfig.padding }, style]}>
      <Target size={sizeConfig.icon} color="#22C55E" />
      <Text style={[styles.ftbText, { fontSize: sizeConfig.text }]}>FTB</Text>
    </View>
  );
};

/**
 * Test Count Badge - Simple test count display
 */
export const TestCountBadge = ({ testCount = 0, style }) => {
  const freshnessInfo = getFreshnessDisplayInfo(testCount);

  if (testCount === 0) {
    return <FTBBadge size="small" style={style} />;
  }

  return (
    <View
      style={[
        styles.testCountBadge,
        { backgroundColor: freshnessInfo.color + '20' },
        style,
      ]}
    >
      <RefreshCw size={10} color={freshnessInfo.color} />
      <Text style={[styles.testCountText, { color: freshnessInfo.color }]}>
        {testCount}x
      </Text>
    </View>
  );
};

/**
 * Order Absorption Bar - Visual representation of remaining orders
 */
export const OrderAbsorptionBar = ({ testCount = 0, showLabel = true, style }) => {
  const remainingPercent = getRemainingOrdersPercent(testCount);
  const freshnessInfo = getFreshnessDisplayInfo(testCount);

  return (
    <View style={[styles.absorptionContainer, style]}>
      {showLabel && (
        <View style={styles.absorptionHeader}>
          <Text style={styles.absorptionLabel}>Orders Remaining</Text>
          <Text style={[styles.absorptionPercent, { color: freshnessInfo.color }]}>
            {remainingPercent}%
          </Text>
        </View>
      )}
      <View style={styles.absorptionTrack}>
        <View
          style={[
            styles.absorptionFill,
            {
              width: `${remainingPercent}%`,
              backgroundColor: freshnessInfo.color,
            },
          ]}
        />
        {/* Tick marks at 30%, 50%, 70% */}
        <View style={[styles.tick, { left: '30%' }]} />
        <View style={[styles.tick, { left: '50%' }]} />
        <View style={[styles.tick, { left: '70%' }]} />
      </View>
    </View>
  );
};

/**
 * Freshness Card - Detailed freshness info card
 */
export const FreshnessCard = ({ testCount = 0, zoneType, onInfoPress, style }) => {
  const freshnessInfo = getFreshnessDisplayInfo(testCount);
  const remainingOrders = getRemainingOrdersPercent(testCount);

  const IconComponent = freshnessInfo.isFTB
    ? Sparkles
    : freshnessInfo.status === 'tested'
    ? RefreshCw
    : AlertCircle;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={[styles.cardIcon, { backgroundColor: freshnessInfo.color + '20' }]}>
            <IconComponent size={20} color={freshnessInfo.color} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Zone Freshness</Text>
            <Text style={[styles.cardStatus, { color: freshnessInfo.color }]}>
              {freshnessInfo.labelVi}
            </Text>
          </View>
        </View>

        {freshnessInfo.isFTB && <FTBBadge size="medium" />}

        {onInfoPress && (
          <TouchableOpacity onPress={onInfoPress} style={styles.cardInfoBtn}>
            <Info size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <OrderAbsorptionBar testCount={testCount} />

      <View style={styles.cardFooter}>
        <View style={styles.cardStat}>
          <Text style={styles.cardStatLabel}>Tests</Text>
          <Text style={styles.cardStatValue}>{testCount}</Text>
        </View>
        <View style={styles.cardStatDivider} />
        <View style={styles.cardStat}>
          <Text style={styles.cardStatLabel}>Orders Left</Text>
          <Text style={[styles.cardStatValue, { color: freshnessInfo.color }]}>
            {remainingOrders}%
          </Text>
        </View>
        <View style={styles.cardStatDivider} />
        <View style={styles.cardStat}>
          <Text style={styles.cardStatLabel}>Zone</Text>
          <Text style={styles.cardStatValue}>{zoneType || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Main indicator
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  iconBadge: {
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    gap: 1,
  },
  label: {
    fontWeight: '600',
  },
  orders: {
    color: COLORS.textSecondary,
  },
  infoIcon: {
    marginLeft: 4,
  },

  // FTB Badge
  ftbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#22C55E20',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#22C55E40',
  },
  ftbText: {
    color: '#22C55E',
    fontWeight: 'bold',
  },

  // Test Count Badge
  testCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  testCountText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Order Absorption Bar
  absorptionContainer: {
    gap: SPACING.xs,
  },
  absorptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  absorptionLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  absorptionPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  absorptionTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  absorptionFill: {
    height: '100%',
    borderRadius: 3,
  },
  tick: {
    position: 'absolute',
    top: 0,
    width: 1,
    height: '100%',
    backgroundColor: COLORS.surfaceLight,
  },

  // Freshness Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  cardStatus: {
    fontSize: 12,
  },
  cardInfoBtn: {
    padding: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cardStat: {
    alignItems: 'center',
    gap: 2,
  },
  cardStatLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  cardStatValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  cardStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
});

export default FreshnessIndicator;
