import React from 'react';
import { Lock, CheckCircle } from 'lucide-react';

/**
 * Sub Tool Button Component
 * Individual tool button in the sub-tools grid
 *
 * @param {Element} icon - Lucide icon component
 * @param {String} title - Tool name
 * @param {String} tier - Required tier (FREE, TIER2, TIER3)
 * @param {Function} onClick - Click handler
 * @param {Boolean} isActive - Active state
 * @param {Boolean} isLocked - Locked state (user doesn't have access)
 */
export const SubToolButton = ({
  icon: Icon,
  title,
  tier = 'FREE',
  onClick,
  isActive = false,
  isLocked = false
}) => {
  const handleClick = () => {
    if (isLocked) {
      const lockIcon = '🔓';
      const checkIcon = '✓';
      alert(`${lockIcon} ${title} requires ${tier}\n\n${checkIcon} Upgrade to unlock this feature!`);
      return;
    }
    onClick && onClick();
  };

  const getTierClass = () => {
    if (tier === 'FREE') return '';
    if (tier === 'TIER2' || tier === 'TIER 2') return 'tier-2';
    if (tier === 'TIER3' || tier === 'TIER 3') return 'tier-3';
    return '';
  };

  return (
    <button
      className={`sub-tool-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
      onClick={handleClick}
      disabled={isLocked}
    >
      <div className="sub-tool-icon">
        {Icon && <Icon size={20} />}
      </div>

      <div className="sub-tool-title">{title}</div>

      {tier !== 'FREE' && (
        <div className={`sub-tool-tier ${getTierClass()}`}>
          {tier}
        </div>
      )}

      {isLocked && <Lock size={12} className="lock-icon" />}
    </button>
  );
};

export default SubToolButton;
