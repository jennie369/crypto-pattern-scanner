// ============================================
// 💡 PATTERN BADGE TOOLTIP
// Hiển thị giải thích khi hover icon "?"
// ============================================

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import './PatternBadgeTooltip.css';

const PatternBadgeTooltip = ({ type, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => {
    console.log('🎯 Tooltip SHOW', { type, position });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    console.log('🎯 Tooltip HIDE', { type, position });
    setIsVisible(false);
  };

  return (
    <div
      className="badge-tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <HelpCircle
        size={16}
        className="badge-tooltip-icon"
      />

      {isVisible && (
        <div className={`badge-tooltip badge-tooltip-${position} badge-tooltip-${type}`}>
          <div className="badge-tooltip-arrow" />
          <div className="badge-tooltip-content">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatternBadgeTooltip;
