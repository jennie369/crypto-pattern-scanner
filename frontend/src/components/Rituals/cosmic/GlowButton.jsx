/**
 * GlowButton Component
 * Button with glow effect for ritual UI
 *
 * @fileoverview Cosmic-styled button with glow
 */

import React from 'react';
import { motion } from 'framer-motion';
import './GlowButton.css';

/**
 * GlowButton - Button with glow effect
 *
 * @param {string} color - Button/glow color
 * @param {string} variant - 'primary' | 'secondary' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const GlowButton = ({
  children,
  color = '#6A5BFF',
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  type = 'button',
}) => {
  return (
    <motion.button
      type={type}
      className={`glow-button glow-button-${variant} glow-button-${size} ${className}`}
      style={{
        '--btn-color': color,
        '--btn-glow': `${color}40`,
      }}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.button>
  );
};

export default GlowButton;
