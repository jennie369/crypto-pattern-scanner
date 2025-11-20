import React from 'react';
import './ErrorBoundary.css';

/**
 * ErrorBoundary - Catches React errors and displays fallback UI
 * Wrap components that might throw errors in this boundary
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('🔴 ErrorBoundary caught an error:', error, errorInfo);

    // Store error info in state
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Log to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <span className="error-icon">💥</span>
            <h2 className="error-title">Oops! Something went wrong</h2>
            <p className="error-description">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="error-details">
                <summary>Error Details (Dev Only)</summary>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}

            <div className="error-actions">
              <button className="btn-retry" onClick={this.handleReset}>
                Try Again
              </button>
              <button
                className="btn-reload"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
