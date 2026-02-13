/**
 * StatsRow Component
 * Posts, Followers, Following counts
 * Uses design tokens for consistent styling
 */

import React from 'react';
import { FileText, Users, UserPlus } from 'lucide-react';
import './StatsRow.css';

export function StatsRow({
  postsCount = 0,
  followersCount = 0,
  followingCount = 0,
  onPostsClick,
  onFollowersClick,
  onFollowingClick
}) {
  const formatCount = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="stats-row-container">
      <div
        className="stat-item"
        onClick={onPostsClick}
        role="button"
        tabIndex={0}
      >
        <FileText size={18} className="stat-icon" />
        <span className="stat-value">{formatCount(postsCount)}</span>
        <span className="stat-label">Bài viết</span>
      </div>

      <div className="stat-divider" />

      <div
        className="stat-item"
        onClick={onFollowersClick}
        role="button"
        tabIndex={0}
      >
        <Users size={18} className="stat-icon" />
        <span className="stat-value">{formatCount(followersCount)}</span>
        <span className="stat-label">Người theo dõi</span>
      </div>

      <div className="stat-divider" />

      <div
        className="stat-item"
        onClick={onFollowingClick}
        role="button"
        tabIndex={0}
      >
        <UserPlus size={18} className="stat-icon" />
        <span className="stat-value">{formatCount(followingCount)}</span>
        <span className="stat-label">Đang theo dõi</span>
      </div>
    </div>
  );
}

export default StatsRow;
