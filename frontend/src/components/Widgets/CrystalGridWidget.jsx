import React from 'react';

const CrystalGridWidget = ({ data, preview = false }) => {
  return (
    <div className={`widget crystal-grid ${preview ? 'preview-mode' : ''}`}>
      <div className="widget-header">
        <h3>💎 Crystal Recommendations</h3>
      </div>

      <div className="widget-body">
        <div className="crystal-list">
          {data.crystals.map((crystal, index) => (
            <div key={index} className="crystal-item">
              <span className="crystal-icon">💎</span>
              <span className="crystal-name">{crystal}</span>
            </div>
          ))}
        </div>

        {!preview && (
          <div className="widget-actions">
            <button className="btn-sm btn-secondary">
              🌙 Mark as Cleansed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default React.memo(CrystalGridWidget);
