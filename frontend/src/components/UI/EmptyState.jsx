/**
 * EmptyState - Shared empty data display component
 * Uses design tokens for consistent styling
 */
import { Inbox } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Chưa có dữ liệu',
  description = 'Không có dữ liệu để hiển thị.',
  actionLabel,
  onAction,
  fullScreen = false
}) {
  return (
    <div className={`empty-state-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="empty-state-content">
        <div className="empty-state-icon">
          <Icon size={48} />
        </div>
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-description">{description}</p>
        {actionLabel && onAction && (
          <button onClick={onAction} className="empty-state-action-btn">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
