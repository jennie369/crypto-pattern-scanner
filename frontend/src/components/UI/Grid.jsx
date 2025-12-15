import React from 'react';
import './Grid.css';

/**
 * Grid Component - Responsive grid system using design tokens
 *
 * @param {object} columns - { mobile: 1, tablet: 2, desktop: 3 }
 * @param {string} gap - 'compact' | 'default' | 'spacious'
 * @param {string} align - 'start' | 'center' | 'end' | 'stretch'
 */
const Grid = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'default',
  align = 'stretch',
  className = '',
  ...props
}) => {
  const style = {
    '--grid-cols-mobile': columns.mobile || 1,
    '--grid-cols-tablet': columns.tablet || 2,
    '--grid-cols-desktop': columns.desktop || 3,
  };

  return (
    <div
      className={`ui-grid ui-grid-gap-${gap} ui-grid-align-${align} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

// Grid Item - Optional wrapper for grid children
export const GridItem = ({
  children,
  span = 1,
  className = '',
  ...props
}) => (
  <div
    className={`ui-grid-item ${className}`}
    style={{ '--grid-span': span }}
    {...props}
  >
    {children}
  </div>
);

// Row - Flex row with responsive gap
export const Row = ({
  children,
  gap = 'default',
  align = 'center',
  justify = 'flex-start',
  wrap = true,
  className = '',
  ...props
}) => (
  <div
    className={`ui-row ui-row-gap-${gap} ${wrap ? 'ui-row-wrap' : ''} ${className}`}
    style={{ alignItems: align, justifyContent: justify }}
    {...props}
  >
    {children}
  </div>
);

// Column - Flex column with responsive gap
export const Column = ({
  children,
  gap = 'default',
  align = 'stretch',
  justify = 'flex-start',
  className = '',
  ...props
}) => (
  <div
    className={`ui-column ui-column-gap-${gap} ${className}`}
    style={{ alignItems: align, justifyContent: justify }}
    {...props}
  >
    {children}
  </div>
);

// Container - Responsive container with max-width
export const Container = ({
  children,
  size = 'default',
  padding = true,
  className = '',
  ...props
}) => (
  <div
    className={`ui-container ui-container-${size} ${padding ? 'ui-container-padded' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Section - Page section with spacing
export const Section = ({
  children,
  spacing = 'default',
  className = '',
  ...props
}) => (
  <section
    className={`ui-section ui-section-${spacing} ${className}`}
    {...props}
  >
    {children}
  </section>
);

export default Grid;
