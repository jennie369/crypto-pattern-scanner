/**
 * ProgressRing Component
 * Circular progress indicator with animation
 *
 * @fileoverview SVG-based circular progress
 */

import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../../../../web design-tokens';
import './ProgressRing.css';

/**
 * ProgressRing - Circular progress indicator
 *
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} color - Ring color
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {number} strokeWidth - Width of the ring
 * @param {React.ReactNode} children - Content inside the ring
 */
const ProgressRing = ({
  progress = 0,
  color = COLORS.primary,
  size = 'md',
  strokeWidth = 4,
  children,
  className = '',
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const sizeMap = {
    sm: 56,
    md: 80,
    lg: 100,
    xl: 120,
  };

  const dimension = sizeMap[size] || sizeMap.md;
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div
      className={`progress-ring progress-ring-${size} ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      <svg
        width={dimension}
        height={dimension}
        className="progress-ring-svg"
      >
        {/* Background circle */}
        <circle
          className="progress-ring-background"
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <motion.circle
          className="progress-ring-progress"
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            transformOrigin: 'center',
            transform: 'rotate(-90deg)',
          }}
        />
      </svg>

      {/* Content inside */}
      <div className="progress-ring-content">
        {children || (
          <span className="progress-ring-value" style={{ color }}>
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;
