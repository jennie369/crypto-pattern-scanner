/**
 * ProgressBar Component
 * Animated progress bar with customizable colors
 *
 * @fileoverview Responsive progress bar using design tokens
 */

import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, RADIUS } from '../../../../web design-tokens';
import './ProgressBar.css';

/**
 * ProgressBar - Animated horizontal progress bar
 *
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} color - Bar color (default: primary)
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} showLabel - Show percentage label
 * @param {boolean} animated - Enable animation
 */
const ProgressBar = ({
  progress = 0,
  color = COLORS.primary,
  size = 'md',
  showLabel = false,
  animated = true,
  className = '',
}) => {
  // Clamp progress to 0-100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const sizeClasses = {
    sm: 'progress-bar-sm',
    md: 'progress-bar-md',
    lg: 'progress-bar-lg',
  };

  return (
    <div className={`progress-bar-container ${sizeClasses[size]} ${className}`}>
      <div className="progress-bar-track">
        <motion.div
          className="progress-bar-fill"
          style={{ backgroundColor: color }}
          initial={animated ? { width: 0 } : { width: `${clampedProgress}%` }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <span className="progress-bar-label" style={{ color }}>
          {Math.round(clampedProgress)}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
