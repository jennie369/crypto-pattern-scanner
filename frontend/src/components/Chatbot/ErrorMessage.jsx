/**
 * ErrorMessage Component
 * Displays error messages with retry option
 * Uses design tokens for consistent styling
 */

import React from 'react';
import { AlertCircle, RefreshCw, WifiOff, Clock, Lock } from 'lucide-react';
import './ErrorMessage.css';

// Error types and their configurations
const ERROR_CONFIGS = {
  network: {
    icon: WifiOff,
    title: 'Lỗi kết nối',
    message: 'Không thể kết nối đến server. Vui lòng kiểm tra mạng và thử lại.',
    color: '#FF4757'
  },
  timeout: {
    icon: Clock,
    title: 'Hết thời gian chờ',
    message: 'Yêu cầu mất quá lâu. Vui lòng thử lại.',
    color: '#FFBD59'
  },
  limit: {
    icon: Lock,
    title: 'Đã hết lượt sử dụng',
    message: 'Bạn đã hết lượt sử dụng hôm nay. Nâng cấp tài khoản để sử dụng không giới hạn.',
    color: '#8B5CF6'
  },
  default: {
    icon: AlertCircle,
    title: 'Đã có lỗi xảy ra',
    message: 'Đã có lỗi không xác định. Vui lòng thử lại.',
    color: '#FF4757'
  }
};

// Detect error type from error message
function detectErrorType(errorMessage) {
  if (!errorMessage) return 'default';

  const msg = errorMessage.toLowerCase();

  if (msg.includes('network') || msg.includes('fetch') || msg.includes('connection')) {
    return 'network';
  }
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return 'timeout';
  }
  if (msg.includes('limit') || msg.includes('quota') || msg.includes('exceeded')) {
    return 'limit';
  }

  return 'default';
}

export function ErrorMessage({
  error,
  errorType,
  onRetry,
  onUpgrade,
  showRetry = true
}) {
  const type = errorType || detectErrorType(error);
  const config = ERROR_CONFIGS[type] || ERROR_CONFIGS.default;
  const ErrorIcon = config.icon;

  return (
    <div className="error-message-container">
      <div className="error-message-icon" style={{ color: config.color }}>
        <ErrorIcon size={24} />
      </div>
      <div className="error-message-content">
        <h4 className="error-message-title" style={{ color: config.color }}>
          {config.title}
        </h4>
        <p className="error-message-text">
          {error || config.message}
        </p>
      </div>
      <div className="error-message-actions">
        {showRetry && type !== 'limit' && (
          <button className="error-retry-button" onClick={onRetry}>
            <RefreshCw size={16} />
            <span>Thử lại</span>
          </button>
        )}
        {type === 'limit' && onUpgrade && (
          <button className="error-upgrade-button" onClick={onUpgrade}>
            <Lock size={16} />
            <span>Nâng cấp</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
