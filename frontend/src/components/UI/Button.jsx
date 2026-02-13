import React from 'react';
import './Button.css';

/**
 * Button Component - Responsive button with design tokens
 *
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * @param {string} size - 'sm' | 'base' | 'lg' | 'xl'
 * @param {boolean} fullWidth - Full width button
 * @param {boolean} loading - Show loading state
 * @param {React.Component} leftIcon - Icon on the left
 * @param {React.Component} rightIcon - Icon on the right
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'base',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const classes = [
    'ui-btn',
    `ui-btn-${variant}`,
    `ui-btn-${size}`,
    fullWidth ? 'ui-btn-full' : '',
    loading ? 'ui-btn-loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="ui-btn-spinner" />
      ) : (
        <>
          {LeftIcon && <LeftIcon className="ui-btn-icon ui-btn-icon-left" size={16} />}
          <span className="ui-btn-text">{children}</span>
          {RightIcon && <RightIcon className="ui-btn-icon ui-btn-icon-right" size={16} />}
        </>
      )}
    </button>
  );
};

// Icon Button - circular button for icons only
export const IconButton = ({
  icon: Icon,
  variant = 'ghost',
  size = 'base',
  className = '',
  label,
  ...props
}) => {
  const sizeMap = { sm: 32, base: 40, lg: 48, xl: 56 };
  const iconSizeMap = { sm: 14, base: 18, lg: 20, xl: 24 };

  return (
    <button
      className={`ui-icon-btn ui-icon-btn-${variant} ui-icon-btn-${size} ${className}`}
      aria-label={label}
      {...props}
    >
      {Icon && <Icon size={iconSizeMap[size]} />}
    </button>
  );
};

// Button Group
export const ButtonGroup = ({
  children,
  className = '',
  direction = 'horizontal',
  ...props
}) => (
  <div
    className={`ui-btn-group ui-btn-group-${direction} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Button;
