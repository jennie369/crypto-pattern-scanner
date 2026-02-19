import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ReactionDisplay.css';

/**
 * Reaction type definitions
 */
const REACTION_MAP = {
  like: { emoji: '❤️', label: 'Thích' },
  love: { emoji: '😍', label: 'Yêu thích' },
  haha: { emoji: '😂', label: 'Haha' },
  wow: { emoji: '😮', label: 'Wow' },
  sad: { emoji: '😢', label: 'Buồn' },
  angry: { emoji: '😡', label: 'Phẫn nộ' },
};

/**
 * ReactionDisplay - Shows reaction summary below posts/comments
 * "❤️ 12  😂 5  😮 2  và 8 người khác"
 */
export default function ReactionDisplay({
  reactionCounts = {},
  totalReactions = 0,
  reactedUsers = [],
  compact = false,
  onClick
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate total if not provided
  const total = totalReactions || Object.values(reactionCounts).reduce((sum, c) => sum + c, 0);

  if (total === 0) return null;

  // Get top 3 reactions sorted by count
  const topReactions = Object.entries(reactionCounts)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Compact mode for comments: just emoji + total
  if (compact) {
    return (
      <span className="reaction-display reaction-display-compact" onClick={onClick}>
        <span className="reaction-display-emojis">
          {topReactions.map(([type]) => (
            <span key={type} className="reaction-display-emoji">
              {REACTION_MAP[type]?.emoji || '👍'}
            </span>
          ))}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={total}
            className="reaction-display-total"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {total}
          </motion.span>
        </AnimatePresence>
      </span>
    );
  }

  // Full mode for posts
  return (
    <div
      className="reaction-display reaction-display-full"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={onClick}
    >
      <span className="reaction-display-emojis">
        {topReactions.map(([type]) => (
          <span key={type} className="reaction-display-emoji">
            {REACTION_MAP[type]?.emoji || '👍'}
          </span>
        ))}
      </span>

      <span className="reaction-display-summary">
        {topReactions.map(([type, count], idx) => (
          <span key={type} className="reaction-display-item">
            {REACTION_MAP[type]?.emoji} {count}
            {idx < topReactions.length - 1 && <span className="reaction-display-sep"> </span>}
          </span>
        ))}
        {total > topReactions.reduce((s, [, c]) => s + c, 0) && (
          <span className="reaction-display-others">
            {' '}và {total - topReactions.reduce((s, [, c]) => s + c, 0)} người khác
          </span>
        )}
      </span>

      {/* Tooltip with user list */}
      {showTooltip && reactedUsers.length > 0 && (
        <div className="reaction-display-tooltip">
          {reactedUsers.slice(0, 10).map((user, idx) => (
            <div key={idx} className="reaction-tooltip-user">
              <span className="reaction-tooltip-emoji">
                {REACTION_MAP[user.reaction_type]?.emoji || '👍'}
              </span>
              <span className="reaction-tooltip-name">
                {user.full_name || 'Người dùng'}
              </span>
            </div>
          ))}
          {reactedUsers.length > 10 && (
            <div className="reaction-tooltip-more">
              +{reactedUsers.length - 10} người khác
            </div>
          )}
        </div>
      )}
    </div>
  );
}
