import React from 'react';
import { motion } from 'framer-motion';
import './TrendingBadge.css';

/**
 * TrendingBadge - Inline badge for trending posts
 * Shows fire icon + "Trending" text with gold pulse animation
 */
export default function TrendingBadge({ score }) {
  return (
    <motion.span
      className="trending-badge"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="trending-badge-icon">🔥</span>
      <span className="trending-badge-text">Trending</span>
      {score != null && (
        <span className="trending-badge-score">{Math.round(score)}</span>
      )}
    </motion.span>
  );
}
