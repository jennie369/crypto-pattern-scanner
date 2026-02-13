/**
 * ErrorState - Shared error display component
 * Uses design tokens for consistent styling
 */
import { AlertCircle, RefreshCw } from 'lucide-react';
import './ErrorState.css';

export default function ErrorState({
  title = 'Đã xảy ra lỗi',
  message = 'Không thể tải dữ liệu. Vui lòng thử lại.',
  onRetry,
  retryLabel = 'Thử lại',
  fullScreen = false
}) {
  return (
    <div className={`error-state-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="error-state-content">
        <div className="error-state-icon">
          <AlertCircle size={48} />
        </div>
        <h3 className="error-state-title">{title}</h3>
        <p className="error-state-message">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="error-state-retry-btn">
            <RefreshCw size={18} />
            <span>{retryLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
