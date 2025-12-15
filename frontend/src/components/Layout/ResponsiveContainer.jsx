/**
 * Responsive Container Components
 * Auto-wraps content with proper mobile/tablet/desktop layout
 */

import React from 'react';
import './ResponsiveContainer.css';

/**
 * Base responsive container
 */
export const ResponsiveContainer = ({
  children,
  variant = 'default', // 'default' | '3-column' | 'centered'
  className = ''
}) => {
  return (
    <div className={`responsive-container ${variant} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Three Column Layout
 * Auto-stacks on mobile, 2-col on tablet, 3-col on desktop
 */
export const ThreeColumnLayout = ({
  left,
  center,
  right,
  className = ''
}) => {
  return (
    <div className={`three-column-layout ${className}`}>
      <aside className="left-column">{left}</aside>
      <main className="center-column">{center}</main>
      <aside className="right-column">{right}</aside>
    </div>
  );
};

/**
 * Two Column Layout
 * Auto-stacks on mobile, 2-col on tablet/desktop
 */
export const TwoColumnLayout = ({
  left,
  right,
  className = ''
}) => {
  return (
    <div className={`two-column-layout ${className}`}>
      <aside className="left-column">{left}</aside>
      <main className="right-column">{right}</main>
    </div>
  );
};

/**
 * Stack Layout
 * Vertical stack with customizable gap
 */
export const StackLayout = ({
  children,
  gap = 'md', // 'sm' | 'md' | 'lg'
  className = ''
}) => {
  return (
    <div className={`stack-layout gap-${gap} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Grid Layout
 * Responsive grid: 1 col mobile, 2 col tablet, N col desktop
 */
export const GridLayout = ({
  children,
  columns = 3, // Number of columns on desktop
  gap = 'md',
  className = ''
}) => {
  return (
    <div
      className={`grid-layout gap-${gap} ${className}`}
      style={{ '--grid-cols': columns }}
    >
      {children}
    </div>
  );
};
