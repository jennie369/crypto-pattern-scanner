import React from 'react';
import './Typography.css';

/**
 * Typography Components - Responsive text components using design tokens
 */

// Heading 1
export const H1 = ({ children, className = '', color, ...props }) => (
  <h1
    className={`typo-h1 ${color ? `typo-color-${color}` : ''} ${className}`}
    {...props}
  >
    {children}
  </h1>
);

// Heading 2
export const H2 = ({ children, className = '', color, ...props }) => (
  <h2
    className={`typo-h2 ${color ? `typo-color-${color}` : ''} ${className}`}
    {...props}
  >
    {children}
  </h2>
);

// Heading 3
export const H3 = ({ children, className = '', color, ...props }) => (
  <h3
    className={`typo-h3 ${color ? `typo-color-${color}` : ''} ${className}`}
    {...props}
  >
    {children}
  </h3>
);

// Heading 4
export const H4 = ({ children, className = '', color, ...props }) => (
  <h4
    className={`typo-h4 ${color ? `typo-color-${color}` : ''} ${className}`}
    {...props}
  >
    {children}
  </h4>
);

// Body text
export const Body = ({ children, className = '', size = 'base', color, ...props }) => (
  <p
    className={`typo-body typo-body-${size} ${color ? `typo-color-${color}` : ''} ${className}`}
    {...props}
  >
    {children}
  </p>
);

// Small text
export const Small = ({ children, className = '', color, ...props }) => (
  <span
    className={`typo-small ${color ? `typo-color-${color}` : ''} ${className}`}
    {...props}
  >
    {children}
  </span>
);

// Caption text (very small)
export const Caption = ({ children, className = '', color, ...props }) => (
  <span
    className={`typo-caption ${color ? `typo-color-${color}` : ''} ${className}`}
    {...props}
  >
    {children}
  </span>
);

// Label (form labels, etc)
export const Label = ({ children, className = '', required, htmlFor, ...props }) => (
  <label
    className={`typo-label ${className}`}
    htmlFor={htmlFor}
    {...props}
  >
    {children}
    {required && <span className="typo-required">*</span>}
  </label>
);

// Display text (hero sections)
export const Display = ({ children, className = '', gradient, ...props }) => (
  <span
    className={`typo-display ${gradient ? 'typo-gradient' : ''} ${className}`}
    {...props}
  >
    {children}
  </span>
);

// Stat number (big numbers in stats)
export const StatNumber = ({ children, className = '', size = 'base', ...props }) => (
  <span
    className={`typo-stat typo-stat-${size} ${className}`}
    {...props}
  >
    {children}
  </span>
);

// Export all
const Typography = {
  H1,
  H2,
  H3,
  H4,
  Body,
  Small,
  Caption,
  Label,
  Display,
  StatNumber,
};

export default Typography;
