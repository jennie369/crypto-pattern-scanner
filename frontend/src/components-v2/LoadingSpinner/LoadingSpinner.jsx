import React from 'react';
import './LoadingSpinner.css';

/**
 * Loading Spinner Component
 * Used for loading states across the app
 */
export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
