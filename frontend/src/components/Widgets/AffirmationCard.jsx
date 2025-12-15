import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AffirmationCard = ({ data, preview = false, onDelete, onPin, isPinned = false }) => {
  const [currentIndex, setCurrentIndex] = useState(data.currentIndex || 0);
  const [showMenu, setShowMenu] = useState(false);

  const nextAffirmation = () => {
    setCurrentIndex((prev) => (prev + 1) % data.affirmations.length);
  };

  const prevAffirmation = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? data.affirmations.length - 1 : prev - 1
    );
  };

  return (
    <div className={`widget affirmation-card ${preview ? 'preview-mode' : ''}`}>
      <div className="widget-header">
        <h3>{isPinned ? '📌 ' : ''}✨ Daily Affirmation</h3>
        {!preview && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="affirmation-counter">
              {currentIndex + 1} / {data.affirmations.length}
            </span>
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
          </div>
        )}
      </div>

      <div className="widget-body">
        <div className="affirmation-content">
          <p className="affirmation-text">
            "{data.affirmations[currentIndex]}"
          </p>
        </div>

        <div className="affirmation-navigation">
          <button onClick={prevAffirmation} className="nav-btn">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextAffirmation} className="nav-btn">
            <ChevronRight size={20} />
          </button>
        </div>

        {!preview && (
          <div className="widget-actions">
            <button className="btn-sm btn-primary">
              ✅ Mark as Completed
            </button>
          </div>
        )}
      </div>

      {!preview && data.streak > 0 && (
        <div className="widget-footer">
          <span className="widget-meta">
            🔥 Streak: <strong>{data.streak} days</strong>
          </span>
        </div>
      )}
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(AffirmationCard);
