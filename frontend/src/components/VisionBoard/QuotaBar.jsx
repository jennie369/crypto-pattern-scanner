/**
 * QuotaBar Component
 * Shows usage quota with upgrade prompt
 *
 * @fileoverview Quota display for tier limits
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpCircle, Info } from 'lucide-react';
import { COLORS, TIER_STYLES } from '../../../../web design-tokens';
import './QuotaBar.css';

/**
 * QuotaBar - Display quota usage
 *
 * @param {string} label - What the quota is for
 * @param {number} current - Current usage
 * @param {number} limit - Maximum allowed (-1 for unlimited)
 * @param {string} tier - User's tier level
 * @param {Function} onUpgrade - Upgrade click callback
 */
const QuotaBar = ({
  label,
  current = 0,
  limit = 0,
  tier = 'FREE',
  onUpgrade,
  className = '',
}) => {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && current >= limit;

  const tierStyle = TIER_STYLES[tier.toUpperCase()] || TIER_STYLES.FREE;

  const getBarColor = () => {
    if (isAtLimit) return COLORS.error;
    if (isNearLimit) return COLORS.warning;
    return tierStyle.color;
  };

  return (
    <div className={`quota-bar ${className}`}>
      <div className="quota-bar-header">
        <div className="quota-bar-label">
          <span>{label}</span>
          <span
            className="quota-bar-info"
            title="Upgrade to create more items"
          >
            <Info size={14} />
          </span>
        </div>
        <div className="quota-bar-count">
          <span className="quota-bar-current">{current}</span>
          <span className="quota-bar-separator">/</span>
          <span className="quota-bar-limit">
            {isUnlimited ? '∞' : limit}
          </span>
        </div>
      </div>

      <div className="quota-bar-track">
        <motion.div
          className="quota-bar-fill"
          style={{ backgroundColor: getBarColor() }}
          initial={{ width: 0 }}
          animate={{ width: isUnlimited ? '5%' : `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {isAtLimit && onUpgrade && (
        <motion.button
          className="quota-bar-upgrade"
          onClick={onUpgrade}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ArrowUpCircle size={14} />
          <span>Upgrade to create more</span>
        </motion.button>
      )}

      {isNearLimit && !isAtLimit && (
        <p className="quota-bar-warning">
          You're approaching your limit
        </p>
      )}
    </div>
  );
};

export default QuotaBar;
