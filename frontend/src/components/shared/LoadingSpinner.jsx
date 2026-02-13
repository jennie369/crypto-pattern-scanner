import React from 'react';
import './LoadingSpinner.css';

/**
 * LoadingSpinner - Reusable loading indicator
 * @param {string} size - 'small' | 'medium' | 'large'
 * @param {string} color - Hex color code (default: cyan)
 */
export const LoadingSpinner = ({
  size = 'medium',
  color = '#00D9FF'
}) => {
  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '40px',
  };

  return (
    <div
      className="loading-spinner"
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        borderColor: `${color}33`, // 20% opacity
        borderTopColor: color,
      }}
    />
  );
};

export default LoadingSpinner;
