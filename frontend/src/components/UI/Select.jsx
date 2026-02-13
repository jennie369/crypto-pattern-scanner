/**
 * Custom Select Component - Replaces native <select>
 * Dark theme dropdown matching design tokens
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './Select.css';

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Chọn...',
  disabled = false,
  error = false,
  className = '',
  size = 'md', // sm, md, lg
  icon = null,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  // Find selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev =>
            prev < options.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev =>
            prev > 0 ? prev - 1 : options.length - 1
          );
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < options.length) {
            handleSelect(options[focusedIndex].value);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, options]);

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const focusedItem = listRef.current.children[focusedIndex];
      if (focusedItem) {
        focusedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        // Set focus to current value when opening
        const currentIndex = options.findIndex(opt => opt.value === value);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
    }
  };

  const handleSelect = (optionValue) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  return (
    <div
      ref={containerRef}
      className={`
        custom-select
        custom-select--${size}
        ${isOpen ? 'custom-select--open' : ''}
        ${disabled ? 'custom-select--disabled' : ''}
        ${error ? 'custom-select--error' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Trigger */}
      <button
        type="button"
        className="custom-select__trigger"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {icon && <span className="custom-select__icon">{icon}</span>}
        <span className={`custom-select__value ${!selectedOption ? 'custom-select__placeholder' : ''}`}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`custom-select__chevron ${isOpen ? 'custom-select__chevron--rotated' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="custom-select__dropdown">
          <ul
            ref={listRef}
            className="custom-select__list"
            role="listbox"
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                className={`
                  custom-select__option
                  ${option.value === value ? 'custom-select__option--selected' : ''}
                  ${index === focusedIndex ? 'custom-select__option--focused' : ''}
                `}
                role="option"
                aria-selected={option.value === value}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                <span className="custom-select__option-label">
                  {option.label}
                </span>
                {option.description && (
                  <span className="custom-select__option-desc">
                    {option.description}
                  </span>
                )}
                {option.value === value && (
                  <Check size={16} className="custom-select__check" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Also export a wrapper for form-select replacement
export function FormSelect({ label, error, required, hint, ...props }) {
  return (
    <div className={`form-group ${error ? 'has-error' : ''}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <Select error={!!error} {...props} />
      {error && <span className="form-error">{error}</span>}
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  );
}
