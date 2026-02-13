/**
 * StreakBadge Component
 * Displays streak count with fire icon
 *
 * @fileoverview Animated streak display
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { COLORS } from '../../../../web design-tokens';
import './StreakBadge.css';

/**
 * StreakBadge - Shows streak with animation
 *
 * @param {number} streak - Current streak count
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} showLabel - Show "day streak" label
 * @param {string} tooltip - Tooltip text
 */
const StreakBadge = ({
  streak = 0,
  size = 'md',
  showLabel = false,
  tooltip = 'Consecutive days of activity',
  className = '',
}) => {
  // Determine fire color based on streak
  const getFireColor = () => {
    if (streak >= 30) return '#FF4500'; // Red-orange for 30+
    if (streak >= 7) return COLORS.primary; // Gold for 7+
    return '#FF8A00'; // Orange for < 7
  };

  const iconSize = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  return (
    <motion.div
      className={`streak-badge streak-badge-${size} ${className}`}
      title={tooltip}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        className="streak-badge-icon"
        animate={{
          scale: streak > 0 ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 0.5,
          repeat: streak > 0 ? Infinity : 0,
          repeatDelay: 2,
        }}
      >
        <Flame
          size={iconSize[size]}
          fill={streak > 0 ? getFireColor() : 'none'}
          color={streak > 0 ? getFireColor() : COLORS.textMuted}
        />
      </motion.div>

      <span
        className="streak-badge-count"
        style={{ color: streak > 0 ? COLORS.textPrimary : COLORS.textMuted }}
      >
        {streak}
      </span>

      {showLabel && (
        <span className="streak-badge-label">
          {streak === 1 ? 'day' : 'days'}
        </span>
      )}
    </motion.div>
  );
};

export default StreakBadge;
