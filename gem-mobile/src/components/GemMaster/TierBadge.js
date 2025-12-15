/**
 * GEM Mobile - Tier Badge Component
 * Display user tier (FREE/TIER1/TIER2/TIER3)
 *
 * Design tokens compliant - uses COLORS, TYPOGRAPHY, SPACING from tokens.js
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Crown, Star, Zap, Shield } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

/**
 * Tier style configurations
 */
const TIER_STYLES = {
  FREE: {
    bg: 'rgba(156, 6, 18, 0.2)',
    border: 'rgba(156, 6, 18, 0.4)',
    text: '#FF6B6B',
    icon: null
  },
  TIER1: {
    bg: 'rgba(255, 189, 89, 0.2)',
    border: 'rgba(255, 189, 89, 0.4)',
    text: COLORS.gold,
    icon: Zap
  },
  PRO: {
    bg: 'rgba(255, 189, 89, 0.2)',
    border: 'rgba(255, 189, 89, 0.4)',
    text: COLORS.gold,
    icon: Zap
  },
  TIER2: {
    bg: 'rgba(106, 91, 255, 0.2)',
    border: 'rgba(106, 91, 255, 0.4)',
    text: COLORS.purple,
    icon: Star
  },
  PREMIUM: {
    bg: 'rgba(106, 91, 255, 0.2)',
    border: 'rgba(106, 91, 255, 0.4)',
    text: COLORS.purple,
    icon: Star
  },
  TIER3: {
    bg: 'rgba(255, 215, 0, 0.2)',
    border: 'rgba(255, 215, 0, 0.5)',
    text: '#FFD700',
    icon: Crown
  },
  VIP: {
    bg: 'rgba(255, 215, 0, 0.2)',
    border: 'rgba(255, 215, 0, 0.5)',
    text: '#FFD700',
    icon: Crown
  },
  ADMIN: {
    bg: 'rgba(255, 0, 255, 0.2)',
    border: 'rgba(255, 0, 255, 0.5)',
    text: '#FF00FF',
    icon: Shield
  }
};

/**
 * Display names for tiers
 */
const TIER_NAMES = {
  FREE: 'FREE',
  TIER1: 'TIER 1',
  PRO: 'PRO',
  TIER2: 'TIER 2',
  PREMIUM: 'PREMIUM',
  TIER3: 'VIP',
  VIP: 'VIP',
  ADMIN: 'ADMIN'
};

/**
 * TierBadge Component
 * @param {Object} props
 * @param {string} props.tier - User tier (FREE, TIER1, TIER2, TIER3, PRO, PREMIUM, VIP)
 * @param {string} props.size - Badge size ('sm', 'md', 'lg')
 * @param {boolean} props.showIcon - Show tier icon
 * @param {Object} props.style - Additional container style
 */
const TierBadge = ({
  tier = 'FREE',
  size = 'md',
  showIcon = true,
  style
}) => {
  // Normalize tier name
  const normalizedTier = tier?.toUpperCase() || 'FREE';
  const tierStyle = TIER_STYLES[normalizedTier] || TIER_STYLES.FREE;
  const displayName = TIER_NAMES[normalizedTier] || 'FREE';
  const IconComponent = tierStyle.icon;

  // Size configurations
  const sizeConfig = {
    sm: {
      paddingVertical: 2,
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
      iconSize: 14,
      fontSize: 12,
      gap: 6,
      borderRadius: 10
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tierStyle.bg,
          borderColor: tierStyle.border,
          paddingVertical: config.paddingVertical,
          paddingHorizontal: config.paddingHorizontal,
          borderRadius: config.borderRadius,
          gap: config.gap
        },
        style
      ]}
    >
      {showIcon && IconComponent && (
        <IconComponent
          size={config.iconSize}
          color={tierStyle.text}
          fill={['TIER3', 'VIP', 'ADMIN'].includes(normalizedTier) ? tierStyle.text : 'transparent'}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: tierStyle.text,
            fontSize: config.fontSize
          }
        ]}
      >
        {displayName}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5
  }
});

export default TierBadge;
