/**
 * GlassCard Component
 * Glassmorphism card for ritual UI
 *
 * @fileoverview Frosted glass card effect
 */

import React from 'react';
import { motion } from 'framer-motion';
import './GlassCard.css';

/**
 * GlassCard - Glassmorphism container
 *
 * @param {boolean} hoverable - Enable hover effects
 * @param {string} glowColor - Glow color on hover
 */
const GlassCard = ({
  children,
  hoverable = false,
  glowColor,
  onClick,
  className = '',
  style = {},
}) => {
  return (
    <motion.div
      className={`glass-card ${hoverable ? 'glass-card-hoverable' : ''} ${className}`}
      onClick={onClick}
      style={{
        ...style,
        '--glow-color': glowColor || 'rgba(106, 91, 255, 0.3)',
      }}
      whileHover={hoverable ? { scale: 1.02, y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
