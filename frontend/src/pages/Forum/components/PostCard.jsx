import React, { useState, useEffect, useCallback } from 'react';
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
  TrendingDown,
  Bookmark,
  Repeat2,
  Send,
  Gift,
  Edit2,
  EyeOff,
  UserX,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import forumService from '../../../services/forum';
import { ReactionPicker } from '../../../components/forum/ReactionPicker';
import './PostCard.css';

/**
 * PostCard Component - SYNCED FROM MOBILE PostCard
 * Individual post card in the feed
 *
 * Features (synced from Mobile):
 * - Author info (avatar, name, timestamp)
 * - Post content (text + multi-image carousel)
 * - Trading data (entry, SL, TP, R:R) if present
 * - Like button with animation
 * - Bookmark/Save button
 * - Repost button
 * - Share button
 * - Delete button (for post owner)
 * - Report/Hide/Block options
 * - Category badge
 * - Hashtag highlighting
 */
// Constants for text truncation
const MAX_LINES = 3;
const MAX_CHARS = 150;

export default function PostCard({
  post,
  currentUser,
  onLike,
  onDelete,
  onSave,
  onRepost
}) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [isSaved, setIsSaved] = useState(post.user_saved || false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get images array
  const images = post.media_urls?.length > 0
    ? post.media_urls
    : (post.image_url ? [post.image_url] : []);

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
   * Handle like toggle with animation
   */
  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      alert('Vui lòng đăng nhập để thích bài viết');
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    try {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

      // Call parent handler
      await onLike?.();
    } catch (err) {
      // Revert on error
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      console.error('Error toggling like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  /**
   * Handle save/bookmark toggle
   */
  const handleSave = async (e) => {
    e.stopPropagation();

    if (!currentUser) {
      alert('Vui lòng đăng nhập để lưu bài viết');
      return;
    }

    try {
      setIsSaved(!isSaved);
      await onSave?.(post.id, !isSaved);
    } catch (err) {
      setIsSaved(isSaved);
      console.error('Error toggling save:', err);
    }
  };

  /**
   * Handle share
   */
  const handleShare = async (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/forum/thread/${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'Bài viết từ Gemral',
          text: post.content?.substring(0, 100) + '...',
          url
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Đã copy link bài viết!');
    }
  };

  /**
   * Handle repost
   */
  const handleRepost = async (e) => {
    e.stopPropagation();

    if (!currentUser) {
      alert('Vui lòng đăng nhập để chia sẻ lại');
      return;
    }

    // TODO: Open RepostSheet modal
    alert('Tính năng chia sẻ lại sẽ sớm được ra mắt!');
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
      await onDelete?.();
      setShowMenu(false);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Không thể xóa bài viết. Vui lòng thử lại.');
    }
  };

  /**
   * Handle hide post
   */
  const handleHidePost = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    alert('Bài viết đã được ẩn khỏi bảng tin của bạn');
  };

  /**
   * Handle report
   */
  const handleReport = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    alert('Báo cáo đã được gửi. Cảm ơn bạn!');
  };

  /**
   * Navigate to thread detail
   */
  const handleCardClick = () => {
    navigate(`/forum/thread/${post.id}`);
  };

  /**
   * Image carousel navigation
   */
  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
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
      'questions': { label: 'Q&A', color: '#FF6B9D' },
      'giao-dich': { label: 'Giao dịch', color: '#00F0FF' },
      'tinh-than': { label: 'Tinh thần', color: '#6A5BFF' },
      'thinh-vuong': { label: 'Thịnh vượng', color: '#FFBD59' }
    };
    return categories[categorySlug] || { label: categorySlug, color: '#666' };
  };

  /**
   * Check if text needs truncation
   */
  const needsTruncation = (text) => {
    if (!text) return false;
    const lineCount = (text.match(/\n/g) || []).length + 1;
    return text.length > MAX_CHARS || lineCount > MAX_LINES;
  };

  /**
   * Truncate text for preview
   */
  const truncateText = (text) => {
    if (!text) return '';

    // Split by lines first
    const lines = text.split('\n');
    let result = '';
    let charCount = 0;

    for (let i = 0; i < lines.length && i < MAX_LINES; i++) {
      const line = lines[i];
      const remaining = MAX_CHARS - charCount;

      if (remaining <= 0) break;

      if (line.length <= remaining) {
        result += (i > 0 ? '\n' : '') + line;
        charCount += line.length + 1;
      } else {
        result += (i > 0 ? '\n' : '') + line.substring(0, remaining);
        break;
      }
    }

    return result.trim();
  };

  /**
   * Handle View More click
   */
  const handleViewMore = (e) => {
    e.stopPropagation();
    setIsExpanded(true);
  };

  /**
   * Render content with clickable hashtags and View More
   */
  const renderContentWithHashtags = (text) => {
    if (!text) return null;

    const shouldTruncate = !isExpanded && needsTruncation(text);
    const displayText = shouldTruncate ? truncateText(text) : text;

    const hashtagRegex = /#([\w\u00C0-\u024F\u1E00-\u1EFF]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = hashtagRegex.exec(displayText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: displayText.slice(lastIndex, match.index)
        });
      }
      parts.push({
        type: 'hashtag',
        content: match[0],
        tag: match[1]
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < displayText.length) {
      parts.push({
        type: 'text',
        content: displayText.slice(lastIndex)
      });
    }

    if (parts.length === 0) {
      return (
        <div className="post-text-wrapper">
          <p className="post-text">{displayText}</p>
          {shouldTruncate && (
            <button className="view-more-btn" onClick={handleViewMore}>
              ... Xem thêm
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="post-text-wrapper">
        <p className="post-text">
          {parts.map((part, index) => {
            if (part.type === 'hashtag') {
              return (
                <span
                  key={`hashtag-${index}`}
                  className="hashtag-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/forum/hashtag/${part.tag}`);
                  }}
                >
                  {part.content}
                </span>
              );
            }
            return <span key={`text-${index}`}>{part.content}</span>;
          })}
        </p>
        {shouldTruncate && (
          <button className="view-more-btn" onClick={handleViewMore}>
            ... Xem thêm
          </button>
        )}
      </div>
    );
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
            <div className="timestamp-row">
              <span className="post-timestamp">{getTimeAgo(post.created_at)}</span>
              {post.edited_at && (
                <span className="edited-badge">
                  <Edit2 size={10} />
                  Đã chỉnh sửa
                </span>
              )}
            </div>
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
              {isOwner ? (
                <>
                  <button
                    className="menu-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Navigate to edit
                      setShowMenu(false);
                    }}
                  >
                    <Edit2 size={16} />
                    Chỉnh sửa bài viết
                  </button>
                  <button className="menu-item delete" onClick={handleDelete}>
                    <Trash2 size={16} />
                    Xóa bài viết
                  </button>
                </>
              ) : (
                <>
                  <button className="menu-item" onClick={handleHidePost}>
                    <EyeOff size={16} />
                    Ẩn bài viết này
                  </button>
                  <button
                    className="menu-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      alert('Đã chặn người dùng');
                    }}
                  >
                    <UserX size={16} />
                    Chặn người dùng
                  </button>
                  <button className="menu-item delete" onClick={handleReport}>
                    <Flag size={16} />
                    Báo cáo bài viết
                  </button>
                </>
              )}
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

        {/* Content with hashtags */}
        {renderContentWithHashtags(post.content)}

        {/* Image Carousel */}
        {images.length > 0 && (
          <div className="post-media">
            <div className="image-carousel">
              <img
                src={images[currentImageIndex]}
                alt={`Post image ${currentImageIndex + 1}`}
                className="carousel-image"
              />

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button className="carousel-nav prev" onClick={handlePrevImage}>
                    <ChevronLeft size={24} />
                  </button>
                  <button className="carousel-nav next" onClick={handleNextImage}>
                    <ChevronRight size={24} />
                  </button>

                  {/* Dots indicator */}
                  <div className="carousel-dots">
                    {images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(idx);
                        }}
                      />
                    ))}
                  </div>

                  {/* Image counter */}
                  <div className="image-counter">
                    {currentImageIndex + 1}/{images.length}
                  </div>
                </>
              )}
            </div>
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
          POST FOOTER - Facebook Style (Clean)
          ═══════════════════════════════════════════════════════════ */}
      <div className="post-footer">
        {/* Stats row - simple text like Facebook */}
        {(likeCount > 0 || (post.reply_count || 0) > 0 || (post.repost_count || 0) > 0) && (
          <div className="post-stats-row">
            {likeCount > 0 && (
              <span className="stat-text">❤️ {likeCount}</span>
            )}
            <span className="stat-text-right">
              {(post.reply_count || 0) > 0 && <span>{post.reply_count} bình luận</span>}
              {(post.reply_count || 0) > 0 && (post.repost_count || 0) > 0 && <span> · </span>}
              {(post.repost_count || 0) > 0 && <span>{post.repost_count} chia sẻ</span>}
            </span>
          </div>
        )}

        {/* Actions row - Facebook style: Like, Comment, Gift, Share */}
        <div className="post-actions">
          {/* Like Button */}
          <button
            type="button"
            className={`action-btn like-btn ${isLiked ? 'liked' : ''} ${isLiking ? 'animating' : ''}`}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            <span>Thích</span>
          </button>

          {/* Comment Button */}
          <button
            type="button"
            className="action-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/forum/thread/${post.id}`);
            }}
          >
            <MessageCircle size={20} />
            <span>Bình luận</span>
          </button>

          {/* Gift Button */}
          <button
            type="button"
            className="action-btn gift-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!currentUser) {
                alert('Vui lòng đăng nhập để tặng quà');
                return;
              }
              // TODO: Open gift modal
              alert('Tính năng tặng quà sẽ sớm được ra mắt!');
            }}
          >
            <Gift size={20} />
            <span>Tặng quà</span>
          </button>

          {/* Share Button */}
          <button type="button" className="action-btn" onClick={handleShare}>
            <Share2 size={20} />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
