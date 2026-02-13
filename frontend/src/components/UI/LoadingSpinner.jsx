/**
 * LoadingSpinner - Shared loading state component
 * Uses design tokens for consistent styling
 */
import { Loader2 } from 'lucide-react';
import './LoadingSpinner.css';

export default function LoadingSpinner({
  message = 'Đang tải...',
  size = 'md',
  fullScreen = false
}) {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 56,
  };

  const spinnerSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`loading-spinner-container ${fullScreen ? 'fullscreen' : ''} ${size}`}>
      <div className="loading-spinner-content">
        <Loader2 size={spinnerSize} className="loading-spinner-icon" />
        {message && <p className="loading-spinner-message">{message}</p>}
      </div>
    </div>
  );
}
