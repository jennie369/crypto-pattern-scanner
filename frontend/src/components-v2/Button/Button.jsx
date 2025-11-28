import React from 'react';
import './Button.css';

/**
 * Button Component - Gemral
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'} props.variant - Button style variant
 * @param {'sm'|'md'|'lg'} props.size - Button size
 * @param {boolean} props.fullWidth - Make button full width
 * @param {boolean} props.disabled - Disable button
 * @param {boolean} props.loading - Show loading state
 * @param {React.ReactNode} props.icon - Icon element (emoji or component)
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Button type (button, submit, reset)
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  children,
  onClick,
  className = '',
  type = 'button',
  ...rest
}) => {
  // Build className string
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full',
    disabled && 'btn-disabled',
    loading && 'btn-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Handle click
  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <>
          <span className="btn-spinner"></span>
          <span>Đang tải...</span>
        </>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          <span className="btn-text">{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
