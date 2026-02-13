import React from 'react';
import './ErrorState.css';

/**
 * ErrorState - Reusable error display with retry option
 * @param {string} message - Error message to display
 * @param {function} onRetry - Optional retry callback
 * @param {string} icon - Optional error icon (default: ⚠️)
 */
export const ErrorState = ({
  message = 'Something went wrong',
  onRetry,
  icon = '⚠️'
}) => {
  return (
    <div className="error-state">
      <span className="error-icon">{icon}</span>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="btn-retry" onClick={onRetry}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
