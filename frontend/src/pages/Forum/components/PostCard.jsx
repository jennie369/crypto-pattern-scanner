import React, { useState, useEffect, useRef } from 'react';
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
import { forumLinks } from '../../../utils/linkUtils';
import TrendingBadge from './TrendingBadge';
import PinnedBadge from './PinnedBadge';
import ReactionDisplay from './ReactionDisplay';
import LinkPreviewCard from './LinkPreviewCard';
import QuotedPost from './QuotedPost';
import ImageLightbox from './ImageLightbox';
import './PostCard.css';

/**
 * Reaction definitions for the hover picker
 */
const REACTIONS = [
  { id: 'like', emoji: '❤️', label: 'Thích' },
  { id: 'love', emoji: '😍', label: 'Yêu thích' },
  { id: 'haha', emoji: '😂', label: 'Haha' },
  { id: 'wow', emoji: '😮', label: 'Wow' },
  { id: 'sad', emoji: '😢', label: 'Buồn' },
  { id: 'angry', emoji: '😡', label: 'Phẫn nộ' },
];

// Constants for text truncation
const MAX_LINES = 3;
const MAX_CHARS = 150;

export default function PostCard({
  post,
  currentUser,
  onLike,
  onDelete,
  onSave,
  onRepost,
  onReact
}) {
  const navigate = useNavigate();

  // Edge case: null/undefined post
  if (!post || !post.id) return null;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [isSaved, setIsSaved] = useState(post.user_saved || false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Reaction state
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [currentReaction, setCurrentReaction] = useState(post.user_reaction || null);
  const [reactionCounts, setReactionCounts] = useState(post.reaction_counts || {});
  const [hoveredReaction, setHoveredReaction] = useState(null);
  const reactionTimeoutRef = useRef(null);
  const pickerRef = useRef(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handleClick = (e) => {
      if (!e.target.closest('.post-menu')) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  /**
   * Handle reaction selection
   */
  const handleReaction = (reactionId) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để thả cảm xúc');
      return;
    }

    const isRemove = currentReaction === reactionId;
    const newReaction = isRemove ? null : reactionId;

    // Optimistic update counts
    setReactionCounts(prev => {
      const next = { ...prev };
      if (currentReaction) {
        next[currentReaction] = Math.max(0, (next[currentReaction] || 1) - 1);
      }
      if (newReaction) {
        next[newReaction] = (next[newReaction] || 0) + 1;
      }
      return next;
    });

    setCurrentReaction(newReaction);
    setShowReactionPicker(false);

    // Also update legacy like state
    if (newReaction) {
      setIsLiked(true);
      setLikeCount(prev => currentReaction ? prev : prev + 1);
    } else {
      setIsLiked(false);
      setLikeCount(prev => Math.max(0, prev - 1));
    }

    // Call parent handler
    onReact?.(post.id, newReaction);
  };

  /**
   * Quick like (click on button without opening picker)
   */
  const handleQuickLike = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentReaction) {
      handleReaction(currentReaction); // Remove current reaction
    } else {
      handleReaction('like'); // Default to like
    }
  };

  /**
   * Reaction picker hover handlers
   */
  const handleReactionMouseEnter = () => {
    if (!currentUser) return;
    clearTimeout(reactionTimeoutRef.current);
    reactionTimeoutRef.current = setTimeout(() => {
      setShowReactionPicker(true);
    }, 400);
  };

  const handleReactionMouseLeave = () => {
    clearTimeout(reactionTimeoutRef.current);
    reactionTimeoutRef.current = setTimeout(() => {
      setShowReactionPicker(false);
      setHoveredReaction(null);
    }, 300);
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
    const url = forumLinks.thread(post.id);

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
   * Handle delete post
   */
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      await onDelete?.();
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
   * Open image in lightbox
   */
  const handleImageClick = (e) => {
    e.stopPropagation();
    setLightboxIndex(currentImageIndex);
    setLightboxOpen(true);
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
   * Render content with clickable hashtags and @mentions
   */
  const renderContentWithMarkup = (text) => {
    if (!text) return null;

    const shouldTruncate = !isExpanded && needsTruncation(text);
    const displayText = shouldTruncate ? truncateText(text) : text;

    // Combined regex for hashtags and mentions
    const markupRegex = /(#[\w\u00C0-\u024F\u1E00-\u1EFF]+)|(@[\w\u00C0-\u024F\u1E00-\u1EFF\s]+?)(?=\s|$|@|#)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = markupRegex.exec(displayText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: displayText.slice(lastIndex, match.index) });
      }

      if (match[1]) {
        // Hashtag
        parts.push({
          type: 'hashtag',
          content: match[1],
          tag: match[1].slice(1)
        });
      } else if (match[2]) {
        // Mention
        parts.push({
          type: 'mention',
          content: match[2],
          name: match[2].slice(1).trim()
        });
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < displayText.length) {
      parts.push({ type: 'text', content: displayText.slice(lastIndex) });
    }

    const renderParts = () => {
      if (parts.length === 0) return displayText;

      return parts.map((part, index) => {
        if (part.type === 'hashtag') {
          return (
            <span
              key={`h-${index}`}
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
        if (part.type === 'mention') {
          return (
            <span
              key={`m-${index}`}
              className="mention-link"
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to user profile when available
              }}
            >
              {part.content}
            </span>
          );
        }
        return <span key={`t-${index}`}>{part.content}</span>;
      });
    };

    return (
      <div className="post-text-wrapper">
        <p className="post-text">{renderParts()}</p>
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
  const totalReactions = Object.values(reactionCounts).reduce((s, c) => s + c, 0);

  // Link preview data
  const linkPreview = post.link_preview || null;
  const extractedUrl = post.extracted_urls?.[0] || null;

  return (
    <div className="post-card" onClick={handleCardClick}>
      {/* ═══════════════════════════════════════════════════════════
          BADGES ROW (Pinned + Boosted)
          ═══════════════════════════════════════════════════════════ */}
      {(post.is_pinned || post.is_boosted) && (
        <div className="post-badges-row">
          {post.is_pinned && <PinnedBadge />}
          {post.is_boosted && (
            <span className="boosted-badge">
              <TrendingUp size={12} />
              <span>Được đẩy</span>
            </span>
          )}
        </div>
      )}

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
              {/* View count */}
              {post.view_count > 0 && (
                <span className="view-count-badge">
                  <Eye size={12} />
                  {post.view_count}
                </span>
              )}
              {/* Trending badge */}
              {post.trending_score > 50 && (
                <TrendingBadge score={post.trending_score} />
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
            title="Thêm tùy chọn"
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
                      navigate(`/forum/edit/${post.id}`);
                      setShowMenu(false);
                    }}
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={16} />
                    Chỉnh sửa bài viết
                  </button>
                  <button className="menu-item delete" onClick={handleDelete} title="Xóa">
                    <Trash2 size={16} />
                    Xóa bài viết
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="menu-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      if (!currentUser) { alert('Vui lòng đăng nhập'); return; }
                      alert('Bài viết đã được ẩn khỏi bảng tin của bạn');
                    }}
                  >
                    <EyeOff size={16} />
                    Ẩn bài viết này
                  </button>
                  <button
                    className="menu-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      if (!currentUser) { alert('Vui lòng đăng nhập'); return; }
                      alert('Đã chặn người dùng');
                    }}
                  >
                    <UserX size={16} />
                    Chặn người dùng
                  </button>
                  <button
                    className="menu-item delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      if (!currentUser) { alert('Vui lòng đăng nhập'); return; }
                      alert('Báo cáo đã được gửi. Cảm ơn bạn!');
                    }}
                    title="Báo cáo"
                  >
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

        {/* Content with hashtags + mentions */}
        {renderContentWithMarkup(post.content)}

        {/* Quoted/Reposted Post */}
        {(post.repost_of_id || post.post_type === 'repost') && (
          <QuotedPost originalPost={post.original_post} />
        )}

        {/* Link Preview */}
        {linkPreview && (
          <LinkPreviewCard
            url={linkPreview.url || extractedUrl}
            title={linkPreview.title}
            description={linkPreview.description}
            image={linkPreview.image}
            domain={linkPreview.domain}
          />
        )}
        {!linkPreview && extractedUrl && (
          <LinkPreviewCard url={extractedUrl} />
        )}

        {/* Image Carousel */}
        {images.length > 0 && (
          <div className="post-media">
            <div className="image-carousel" onClick={handleImageClick}>
              <img
                src={images[currentImageIndex]}
                alt={`Ảnh bài viết ${currentImageIndex + 1}`}
                className="carousel-image"
                onError={(e) => { e.target.style.display = 'none'; }}
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
          POST FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <div className="post-footer">
        {/* Stats row */}
        {(totalReactions > 0 || likeCount > 0 || (post.reply_count || 0) > 0 || (post.repost_count || 0) > 0) && (
          <div className="post-stats-row">
            {/* Reaction display */}
            {totalReactions > 0 ? (
              <ReactionDisplay
                reactionCounts={reactionCounts}
                totalReactions={totalReactions}
                reactedUsers={post.reacted_users}
              />
            ) : likeCount > 0 ? (
              <span className="stat-text">❤️ {likeCount}</span>
            ) : null}

            <span className="stat-text-right">
              {(post.reply_count || 0) > 0 && <span>{post.reply_count} bình luận</span>}
              {(post.reply_count || 0) > 0 && (post.repost_count || 0) > 0 && <span> · </span>}
              {(post.repost_count || 0) > 0 && <span>{post.repost_count} chia sẻ</span>}
            </span>
          </div>
        )}

        {/* Actions row */}
        <div className="post-actions">
          {/* Like/React Button with hover picker */}
          <div
            className="reaction-btn-wrapper"
            ref={pickerRef}
            onMouseEnter={handleReactionMouseEnter}
            onMouseLeave={handleReactionMouseLeave}
          >
            <button
              type="button"
              className={`action-btn like-btn ${currentReaction || isLiked ? 'liked' : ''} ${isLiking ? 'animating' : ''}`}
              onClick={handleQuickLike}
              disabled={isLiking}
              title={currentReaction ? REACTIONS.find(r => r.id === currentReaction)?.label || 'Thích' : 'Thích'}
            >
              {currentReaction ? (
                <span className="action-emoji">
                  {REACTIONS.find(r => r.id === currentReaction)?.emoji || '❤️'}
                </span>
              ) : (
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              )}
              <span>
                {currentReaction
                  ? REACTIONS.find(r => r.id === currentReaction)?.label || 'Thích'
                  : 'Thích'
                }
              </span>
            </button>

            {/* Reaction picker popup */}
            {showReactionPicker && (
              <div className="post-reaction-picker">
                {REACTIONS.map((reaction) => (
                  <button
                    key={reaction.id}
                    className={`post-reaction-option ${currentReaction === reaction.id ? 'selected' : ''} ${hoveredReaction === reaction.id ? 'hovered' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReaction(reaction.id);
                    }}
                    onMouseEnter={() => setHoveredReaction(reaction.id)}
                    onMouseLeave={() => setHoveredReaction(null)}
                    title={reaction.label}
                  >
                    <span className="post-reaction-emoji">{reaction.emoji}</span>
                    {hoveredReaction === reaction.id && (
                      <span className="post-reaction-tooltip">{reaction.label}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comment Button */}
          <button
            type="button"
            className="action-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/forum/thread/${post.id}`);
            }}
            title="Bình luận"
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
              alert('Tính năng tặng quà sẽ sớm được ra mắt!');
            }}
            title="Tặng quà"
          >
            <Gift size={20} />
            <span>Tặng quà</span>
          </button>

          {/* Share Button */}
          <button type="button" className="action-btn" onClick={handleShare} title="Chia sẻ">
            <Share2 size={20} />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
