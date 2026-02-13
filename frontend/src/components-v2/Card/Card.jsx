import React from 'react';
import './Card.css';

/**
 * Card Component - Gemral
 * Glassmorphism card with multiple variants
 *
 * @param {Object} props
 * @param {'default'|'glass'|'stat'|'gradient'|'compact'} props.variant - Card style
 * @param {'sm'|'md'|'lg'} props.size - Card padding size
 * @param {boolean} props.hoverable - Enable hover effects
 * @param {boolean} props.clickable - Make card clickable (cursor pointer)
 * @param {React.ReactNode} props.header - Card header content
 * @param {React.ReactNode} props.children - Card body content
 * @param {React.ReactNode} props.footer - Card footer content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 */
export const Card = ({
  variant = 'default',
  size = 'md',
  hoverable = false,
  clickable = false,
  header = null,
  children,
  footer = null,
  onClick,
  className = '',
  ...rest
}) => {
  const classes = [
    'card',
    `card-${variant}`,
    `card-${size}`,
    hoverable && 'card-hoverable',
    clickable && 'card-clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e) => {
    if (clickable && onClick) {
      onClick(e);
    }
  };

  return (
    <div className={classes} onClick={handleClick} {...rest}>
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
