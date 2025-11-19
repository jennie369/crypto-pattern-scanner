import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Trash2,
  Flag,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import forumService from '../../../services/forum';
import './PostCard.css';

/**
 * PostCard Component - DAY 2 IMPLEMENTATION
 * Individual post card in the feed
 *
 * Features:
 * - Author info (avatar, name, timestamp)
 * - Post content (text + image)
 * - Trading data (entry, SL, TP, R:R) if present
 * - Like button (connected to database)
 * - Comment count (click to view thread)
 * - Share button
 * - Delete button (for post owner)
 * - Category badge
 */
export default function PostCard({
  post,
  currentUser,
  onLike,
  onDelete
}) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [showMenu, setShowMenu] = useState(false);

  /**
   * Check if current user has liked this post
   */
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (currentUser && post.id) {
        try {
          const liked = await forumService.hasLiked(post.id);
          setIsLiked(liked);
        } catch (err) {
          console.error('Error checking like status:', err);
        }
      }
    };

    checkLikeStatus();
  }, [currentUser, post.id]);

  /**
   * Handle like toggle
   */
  const handleLike = async (e) => {
    e.stopPropagation(); // Prevent card click

    if (!currentUser) {
      alert('Vui lòng đăng nhập để thích bài viết');
      return;
    }

    try {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

      // Call parent handler
      await onLike();
    } catch (err) {
      // Revert on error
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      console.error('Error toggling like:', err);
    }
  };

  /**
   * Handle delete post
   */
  const handleDelete = async (e) => {
    e.stopPropagation();

    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      return;
    }

    try {
      await onDelete();
      setShowMenu(false);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Không thể xóa bài viết. Vui lòng thử lại.');
    }
  };

  /**
   * Navigate to thread detail
   */
  const handleCardClick = () => {
    navigate(`/forum/thread/${post.id}`);
  };

  /**
   * Format timestamp
   */
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return postDate.toLocaleDateString('vi-VN');
  };

  /**
   * Get category badge
   */
  const getCategoryBadge = (categorySlug) => {
    const categories = {
      'trading-discussion': { label: 'Trading', color: '#00D9FF' },
      'pattern-help': { label: 'Pattern', color: '#8B5CF6' },
      'spiritual': { label: 'Tâm linh', color: '#FFBD59' },
      'success-stories': { label: 'Thành công', color: '#00FF88' },
      'questions': { label: 'Q&A', color: '#FF6B9D' }
    };
    return categories[categorySlug] || { label: categorySlug, color: '#666' };
  };

  const isOwner = currentUser && currentUser.id === post.author_id;
  const categoryBadge = getCategoryBadge(post.category);

  return (
    <div className="post-card" onClick={handleCardClick}>
      {/* ═══════════════════════════════════════════════════════════
          POST HEADER
          ═══════════════════════════════════════════════════════════ */}
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">
            {post.users?.avatar_url ? (
              <img src={post.users.avatar_url} alt={post.users.display_name} />
            ) : (
              <div className="avatar-placeholder">
                {post.users?.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className="author-info">
            <div className="author-name-row">
              <span className="author-name">{post.users?.display_name || 'Ẩn danh'}</span>
              <span
                className="category-badge"
                style={{ '--badge-color': categoryBadge.color }}
              >
                {categoryBadge.label}
              </span>
            </div>
            <span className="post-timestamp">{getTimeAgo(post.created_at)}</span>
          </div>
        </div>

        <div className="post-menu">
          <button
            className="menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical size={20} />
          </button>

          {showMenu && (
            <div className="menu-dropdown">
              {isOwner && (
                <button className="menu-item delete" onClick={handleDelete}>
                  <Trash2 size={16} />
                  Xóa bài viết
                </button>
              )}
              <button
                className="menu-item"
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Tính năng báo cáo sẽ sớm được ra mắt');
                  setShowMenu(false);
                }}
              >
                <Flag size={16} />
                Báo cáo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          POST CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <div className="post-content">
        {/* Title */}
        {post.title && <h3 className="post-title">{post.title}</h3>}

        {/* Content */}
        <p className="post-text">{post.content}</p>

        {/* Image */}
        {post.image_url && (
          <div className="post-image">
            <img src={post.image_url} alt="Post" />
          </div>
        )}

        {/* Trading Data (if present) */}
        {(post.trade_entry || post.trade_sl || post.trade_tp) && (
          <div className="trading-data">
            <div className="trading-data-header">
              <TrendingUp size={16} />
              <span>Thông tin trade</span>
            </div>
            <div className="trading-data-grid">
              {post.trade_entry && (
                <div className="data-item">
                  <span className="data-label">Entry:</span>
                  <span className="data-value">${post.trade_entry}</span>
                </div>
              )}
              {post.trade_sl && (
                <div className="data-item">
                  <span className="data-label">SL:</span>
                  <span className="data-value stop-loss">
                    <TrendingDown size={14} />
                    ${post.trade_sl}
                  </span>
                </div>
              )}
              {post.trade_tp && (
                <div className="data-item">
                  <span className="data-label">TP:</span>
                  <span className="data-value take-profit">
                    <TrendingUp size={14} />
                    ${post.trade_tp}
                  </span>
                </div>
              )}
              {post.trade_rr && (
                <div className="data-item">
                  <span className="data-label">R:R:</span>
                  <span className="data-value rr">1:{post.trade_rr}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          POST FOOTER (Actions)
          ═══════════════════════════════════════════════════════════ */}
      <div className="post-footer">
        <div className="post-stats">
          <span className="stat-item">
            <Eye size={16} />
            {post.view_count || 0}
          </span>
        </div>

        <div className="post-actions">
          {/* Like Button */}
          <button
            className={`action-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <Heart size={20} fill={isLiked ? '#FF4444' : 'none'} />
            <span>{likeCount}</span>
          </button>

          {/* Comment Button */}
          <button
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/forum/thread/${post.id}`);
            }}
          >
            <MessageCircle size={20} />
            <span>{post.reply_count || 0}</span>
          </button>

          {/* Share Button */}
          <button
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(`${window.location.origin}/forum/thread/${post.id}`);
              alert('Đã copy link bài viết!');
            }}
          >
            <Share2 size={20} />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
