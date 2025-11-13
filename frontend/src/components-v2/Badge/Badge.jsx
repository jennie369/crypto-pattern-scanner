import React from 'react';
import './Badge.css';

/**
 * Badge Component - GEM Platform
 * Status indicators and labels
 *
 * @param {Object} props
 * @param {'gold'|'cyan'|'purple'|'green'|'red'|'orange'|'gray'} props.variant - Badge color
 * @param {'sm'|'md'|'lg'} props.size - Badge size
 * @param {boolean} props.pill - Rounded pill shape
 * @param {boolean} props.dot - Show status dot
 * @param {React.ReactNode} props.icon - Icon element
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.className - Additional CSS classes
 */
export const Badge = ({
  variant = 'gold',
  size = 'md',
  pill = false,
  dot = false,
  icon = null,
  children,
  className = '',
  ...rest
}) => {
  const classes = [
    'badge',
    `badge-${variant}`,
    `badge-${size}`,
    pill && 'badge-pill',
    dot && 'badge-dot',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...rest}>
      {dot && <span className="badge-dot-indicator"></span>}
      {icon && <span className="badge-icon">{icon}</span>}
      <span className="badge-text">{children}</span>
    </span>
  );
};

export default Badge;
