import React, { useState } from 'react';

const GoalCard = ({ data, preview = false, onUpdate, onDelete, onPin, isPinned = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const progressPercentage = data.targetAmount > 0
    ? (data.currentAmount / data.targetAmount) * 100
    : 0;

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className={`widget goal-card ${preview ? 'preview-mode' : ''}`}>
      <div className="widget-header">
        <h3>{isPinned ? '📌 ' : ''}{data.title}</h3>
        {!preview && (
          <div className="widget-menu-container">
            <button
              className="widget-menu"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              ⋯
            </button>

            {showMenu && (
              <div className="menu-dropdown">
                {onUpdate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate();
                      setShowMenu(false);
                    }}
                  >
                    📈 Update Progress
                  </button>
                )}
                {onPin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPin();
                      setShowMenu(false);
                    }}
                  >
                    {isPinned ? '📍 Unpin' : '📌 Pin'}
                  </button>
                )}
                {onDelete && (
                  <button
                    className="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setShowMenu(false);
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="widget-body">
        <div className="goal-stats">
          <div className="stat">
            <span className="stat-label">Target:</span>
            <span className="stat-value">
              {formatCurrency(data.targetAmount)} VND
            </span>
          </div>

          <div className="stat">
            <span className="stat-label">Current:</span>
            <span className="stat-value">
              {formatCurrency(data.currentAmount)} VND
            </span>
          </div>

          <div className="stat">
            <span className="stat-label">Deadline:</span>
            <span className="stat-value">
              {formatDate(data.targetDate)}
            </span>
          </div>
        </div>

        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          >
            <span className="progress-text">{progressPercentage.toFixed(0)}%</span>
          </div>
        </div>

        {!preview && onUpdate && (
          <div className="widget-actions">
            <button className="btn-sm btn-primary" onClick={onUpdate}>
              📈 Update Progress
            </button>
          </div>
        )}
      </div>

      {!preview && (
        <div className="widget-footer">
          <span className="widget-meta">
            🔔 Daily reminders: <strong>ON</strong>
          </span>
        </div>
      )}
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(GoalCard);
