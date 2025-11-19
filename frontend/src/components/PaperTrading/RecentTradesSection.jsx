import React from 'react';
import './RecentTradesSection.css';

// ULTRA-SIMPLE VERSION - No hooks, no API calls
export const RecentTradesSection = () => {
  return (
    <div className="recent-trades-section">
      <h3>Recent Trades</h3>
      <div className="empty-state">
        <p>No recent trades</p>
      </div>
    </div>
  );
};

export default RecentTradesSection;
