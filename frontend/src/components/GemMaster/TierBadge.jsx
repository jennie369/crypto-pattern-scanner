/**
 * TierBadge - Web component
 * Shows user tier (FREE/TIER1/TIER2/TIER3) with appropriate colors from TIER_STYLES.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Star, Crown, Gem } from 'lucide-react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, TIER_STYLES, ANIMATION } from '../../../../web design-tokens';

const TIER_ICONS = {
  FREE: Shield,
  TIER1: Star,
  TIER2: Crown,
  TIER3: Gem,
};

const TIER_LABELS = {
  FREE: 'Free',
  TIER1: 'Tier 1',
  TIER2: 'Tier 2',
  TIER3: 'Tier 3',
};

const TierBadge = ({
  tier = 'FREE',
  size = 'medium',
  showLabel = true,
  showIcon = true,
  animated = true,
  style: customStyle,
}) => {
  const tierKey = tier?.toUpperCase() || 'FREE';
  const tierStyle = TIER_STYLES[tierKey] || TIER_STYLES.FREE;
  const Icon = TIER_ICONS[tierKey] || Shield;
  const label = TIER_LABELS[tierKey] || 'Free';

  const sizeConfig = {
    small: { iconSize: 12, fontSize: TYPOGRAPHY.fontSize.xs, padding: `2px ${SPACING.sm}px`, gap: 4 },
    medium: { iconSize: 14, fontSize: TYPOGRAPHY.fontSize.sm, padding: `${SPACING.xs}px ${SPACING.md}px`, gap: 6 },
    large: { iconSize: 18, fontSize: TYPOGRAPHY.fontSize.base, padding: `${SPACING.sm}px ${SPACING.base}px`, gap: 8 },
  }[size] || { iconSize: 14, fontSize: TYPOGRAPHY.fontSize.sm, padding: `${SPACING.xs}px ${SPACING.md}px`, gap: 6 };

  const Wrapper = animated ? motion.div : 'div';
  const animProps = animated ? {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    whileHover: { scale: 1.05 },
    transition: ANIMATION.spring,
  } : {};

  return (
    <Wrapper
      {...animProps}
      role="status"
      aria-label={`User tier: ${label}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizeConfig.gap,
        padding: sizeConfig.padding,
        borderRadius: RADIUS.full,
        background: tierStyle.bg,
        border: `1px solid ${tierStyle.border}`,
        color: tierStyle.color,
        minHeight: 44,
        boxSizing: 'border-box',
        ...customStyle,
      }}
    >
      {showIcon && <Icon size={sizeConfig.iconSize} color={tierStyle.color} />}
      {showLabel && (
        <span style={{
          fontSize: sizeConfig.fontSize,
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
          color: tierStyle.color,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      )}
    </Wrapper>
  );
};

export default TierBadge;
