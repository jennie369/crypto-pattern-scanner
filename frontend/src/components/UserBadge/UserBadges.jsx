import React from 'react';
import UserBadge from './UserBadge';
import './UserBadges.css';

const UserBadges = ({
  user,
  size = 'small',
  showLabels = false,
  maxBadges = 3,
  className = ''
}) => {
  if (!user) return null;

  const badges = [];

  // PRIORITY 1: Verification badges (highest priority)
  if (user.verified_seller) {
    badges.push({
      type: 'verified_seller',
      value: 'verified_seller',
      priority: 1
    });
  }
  if (user.verified_trader) {
    badges.push({
      type: 'verified_trader',
      value: 'verified_trader',
      priority: 2
    });
  }

  // PRIORITY 2: Tier badge
  const getTierBadge = () => {
    // Check scanner_tier first, then course_tier, then chatbot_tier
    const tier = user.scanner_tier || user.course_tier || user.chatbot_tier || 'free';

    const tierMap = {
      'free': 'tier_free',
      'tier1': 'tier_1',
      'tier2': 'tier_2',
      'tier3': 'tier_3',
      'basic': 'tier_1',
      'pro': 'tier_1',
      'premium': 'tier_2',
      'vip': 'tier_3'
    };

    return tierMap[tier.toLowerCase()] || 'tier_free';
  };

  const tierBadge = getTierBadge();
  if (tierBadge && tierBadge !== 'tier_free') { // Don't show FREE badge unless space
    badges.push({
      type: 'tier',
      value: tierBadge,
      priority: 3
    });
  }

  // PRIORITY 3: Role badge (if exists)
  if (user.role_badge) {
    badges.push({
      type: 'role',
      value: user.role_badge,
      priority: 4
    });
  }

  // PRIORITY 4: Level badge
  if (user.level_badge && user.level_badge !== 'bronze') { // Only show if not bronze
    badges.push({
      type: 'level',
      value: user.level_badge,
      priority: 5
    });
  }

  // PRIORITY 5: Achievement badges (first one only)
  if (user.achievement_badges && Array.isArray(user.achievement_badges) && user.achievement_badges.length > 0) {
    badges.push({
      type: 'achievement',
      value: user.achievement_badges[0],
      priority: 6
    });
  }

  // Sort by priority and limit
  const displayBadges = badges
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxBadges);

  if (displayBadges.length === 0) return null;

  return (
    <div className={`user-badges ${className}`}>
      {displayBadges.map((badge, index) => (
        <UserBadge
          key={`${badge.value}-${index}`}
          type={badge.type}
          value={badge.value}
          size={size}
          showLabel={showLabels}
        />
      ))}
    </div>
  );
};

export default UserBadges;
