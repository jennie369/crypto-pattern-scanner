/**
 * Gemral - UserBadges Container Component
 * Displays multiple badges with priority-based ordering
 * Consistent with web app UserBadges.jsx
 */

import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import UserBadge from './UserBadge';
import { getUserBadges, getBadgeSizeConfig } from '../../services/badgeService';

/**
 * UserBadges Container Component
 * @param {Object} user - User profile object with badge fields
 * @param {string} size - Badge size ('tiny', 'small', 'medium', 'large')
 * @param {number} maxBadges - Maximum number of badges to display (default: 3)
 * @param {Object} style - Additional container styles
 */
const UserBadges = ({ user, size = 'small', maxBadges = 3, style }) => {
  // Get badges sorted by priority
  const badges = useMemo(() => {
    return getUserBadges(user).slice(0, maxBadges);
  }, [user, maxBadges]);

  // Don't render if no badges
  if (!badges || badges.length === 0) {
    return null;
  }

  const sizeConfig = getBadgeSizeConfig(size);

  // Calculate gap based on size
  const gap = size === 'tiny' ? 2 : size === 'small' ? 3 : 4;

  return (
    <View style={[styles.container, { gap }, style]}>
      {badges.map((badge, index) => (
        <UserBadge
          key={`${badge.type}-${index}`}
          type={badge.type}
          size={size}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
});

export default memo(UserBadges);
