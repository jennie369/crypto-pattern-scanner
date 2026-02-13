import React, { forwardRef } from 'react';
import './Input.css';

/**
 * Input Component - Gemral
 * Form input with validation states
 *
 * @param {Object} props
 * @param {'text'|'email'|'password'|'number'|'tel'|'url'} props.type - Input type
 * @param {'sm'|'md'|'lg'} props.size - Input size
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.helperText - Helper text below input
 * @param {string} props.error - Error message
 * @param {boolean} props.success - Success state
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.fullWidth - Full width input
 * @param {React.ReactNode} props.leftIcon - Icon on left side
 * @param {React.ReactNode} props.rightIcon - Icon on right side
 * @param {string} props.className - Additional CSS classes
 */
export const Input = forwardRef(({
  type = 'text',
  size = 'md',
  label = '',
  placeholder = '',
  helperText = '',
  error = '',
  success = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...rest
}, ref) => {
  const wrapperClasses = [
    'input-wrapper',
    fullWidth && 'input-wrapper-full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inputClasses = [
    'input',
    `input-${size}`,
    error && 'input-error',
    success && 'input-success',
    leftIcon && 'input-with-left-icon',
    rightIcon && 'input-with-right-icon',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}

      <div className="input-container">
        {leftIcon && (
          <span className="input-icon input-icon-left">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
        />

        {rightIcon && (
          <span className="input-icon input-icon-right">
            {rightIcon}
          </span>
        )}
      </div>

      {(helperText || error) && (
        <div className={`input-helper ${error ? 'input-helper-error' : ''}`}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
