import React from 'react';
import { Button } from '../Button';
import './ErrorMessage.css';

/**
 * Error Message Component
 * Display errors with optional retry action
 */
export const ErrorMessage = ({
  error,
  onRetry,
  title = 'Error',
  variant = 'default'
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message || 'An error occurred';

  return (
    <div className={`error-message ${variant}`}>
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h4 className="error-title">{title}</h4>
        <p className="error-text">{errorMessage}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="error-retry-btn"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
