import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { forumService, forumCategories } from '../../services/forum';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import UserBadges from '../../components/UserBadge/UserBadges';
import {
  X, CheckCircle, ThumbsUp, MessageSquare, Eye, Send,
  Heart, Edit2, BarChart3, Clock, ArrowLeft, Share2,
  Bookmark, MoreVertical, Flag, Trash2
} from 'lucide-react';
import './Forum.css';

const REACTION_TYPES = [
  { type: 'like', emoji: '👍', label: 'Thích' },
  { type: 'love', emoji: '❤️', label: 'Yêu thích' },
  { type: 'haha', emoji: '😂', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Buồn' },
  { type: 'angry', emoji: '😡', label: 'Phẫn nộ' }
];

/**
 * ThreadDetail — Enhanced with reactions, edit/analytics links, threaded replies
 */
export default function ThreadDetail() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [userReaction, setUserReaction] = useState(null);
  const [reactionCounts, setReactionCounts] = useState({});
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    loadThread();
  }, [threadId]);

  const loadThread = async () => {
    setLoading(true);
    try {
      const data = await forumService.getThread(threadId);
      setThread(data);

      // Build threaded replies
      const comments = data.comments || data.replies || [];
      const threaded = buildThreadedReplies(comments);
      setReplies(threaded);

      // Load reactions
      loadReactions();

      // Load related posts
      loadRelatedPosts(data.category_id);
    } catch (error) {
      console.error('Error loading thread:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Build threaded reply structure
   */
  const buildThreadedReplies = (comments) => {
    const map = {};
    const roots = [];

    comments.forEach(c => {
      map[c.id] = { ...c, children: [] };
    });

    comments.forEach(c => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    return roots;
  };

  const loadReactions = async () => {
    try {
      const { data } = await supabase
        .from('post_reactions')
        .select('reaction_type, user_id')
        .eq('post_id', threadId);

      if (data) {
        const counts = {};
        data.forEach(r => {
          counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
          if (r.user_id === user?.id) setUserReaction(r.reaction_type);
        });
        setReactionCounts(counts);
      }
    } catch (err) {
      console.error('Error loading reactions:', err);
    }
  };

  const loadRelatedPosts = async (categoryId) => {
    try {
      const { data } = await supabase
        .from('forum_posts')
        .select('id, title, likes_count, comments_count')
        .eq('status', 'published')
        .eq('category_id', categoryId)
        .neq('id', threadId)
        .order('likes_count', { ascending: false })
        .limit(4);
      setRelatedPosts(data || []);
    } catch (err) {
      // Silent
    }
  };

  const handleReaction = async (reactionType) => {
    if (!user) {
      alert('Vui lòng đăng nhập để phản ứng');
      return;
    }

    try {
      if (userReaction === reactionType) {
        // Remove reaction
        await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', threadId)
          .eq('user_id', user.id);
        setUserReaction(null);
        setReactionCounts(prev => ({
          ...prev,
          [reactionType]: Math.max(0, (prev[reactionType] || 1) - 1)
        }));
      } else {
        // Upsert reaction
        if (userReaction) {
          await supabase
            .from('post_reactions')
            .delete()
            .eq('post_id', threadId)
            .eq('user_id', user.id);
          setReactionCounts(prev => ({
            ...prev,
            [userReaction]: Math.max(0, (prev[userReaction] || 1) - 1)
          }));
        }
        await supabase
          .from('post_reactions')
          .insert({ post_id: threadId, user_id: user.id, reaction_type: reactionType });
        setUserReaction(reactionType);
        setReactionCounts(prev => ({
          ...prev,
          [reactionType]: (prev[reactionType] || 0) + 1
        }));
      }
      setShowReactionPicker(false);
    } catch (err) {
      console.error('Error setting reaction:', err);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) return;

    setSubmitting(true);
    try {
      await forumService.createReply({
        threadId,
        content: replyContent,
        authorId: user.id,
        parentId: replyingTo
      });
      setReplyContent('');
      setReplyingTo(null);
      loadThread();
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Không thể gửi trả lời. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeThread = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thích bài viết');
      return;
    }
    try {
      await forumService.toggleLike('thread', threadId, user.id);
      loadThread();
    } catch (error) {
      console.error('Error liking thread:', error);
    }
  };

  const handleLikeReply = async (replyId) => {
    if (!user) return;
    try {
      await forumService.toggleLike('reply', replyId, user.id);
      loadThread();
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const handleMarkSolved = async (replyId) => {
    if (!user || user.id !== thread.author_id) return;
    try {
      await forumService.markAsSolved(threadId, replyId);
      loadThread();
    } catch (error) {
      console.error('Error marking as solved:', error);
    }
  };

  const isAuthor = user && thread && user.id === (thread.user_id || thread.author_id);
  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="forum-page">
        <div className="loading-state">
          <div className="spinner" />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="forum-page">
        <div className="empty-state card-glass">
          <X size={64} className="empty-icon" style={{ color: 'rgba(255, 255, 255, 0.3)', margin: '0 auto 16px' }} />
          <h3>Không Tìm Thấy Chủ Đề</h3>
          <button className="btn-primary" onClick={() => navigate('/forum')}>
            Về Trang Forum
          </button>
        </div>
      </div>
    );
  }

  const category = forumCategories.find(c => c.id === (thread.category_id || thread.category));

  return (
    <div className="forum-page thread-detail-page">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate('/forum')} title="Quay lại danh sách bài viết">
        <ArrowLeft size={18} />
        Quay Lại Forum
      </button>

      {/* Thread Content */}
      <div className="thread-detail card-glass">
        {/* Header */}
        <div className="thread-detail-header">
          <div className="thread-badges">
            {category && (
              <span className="category-badge" style={{ '--badge-color': category.color }}>
                {category.name}
              </span>
            )}
            {thread.is_answered && (
              <span className="status-badge solved" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} />
                Đã Giải Đáp
              </span>
            )}
          </div>

          <h1 className="thread-detail-title">{thread.title}</h1>

          <div className="thread-detail-meta">
            <Link to={`/forum/user/${thread.user_id || thread.author_id}`} className="author-link">
              <img
                src={thread.author?.avatar_url || '/default-avatar.png'}
                alt={thread.author?.full_name}
                className="author-avatar-small"
              />
              <span className="author-name">{thread.author?.full_name}</span>
            </Link>
            <span className="meta-dot">·</span>
            <span className="thread-date">
              {new Date(thread.created_at).toLocaleString('vi-VN')}
            </span>
            {thread.edited_at && (
              <>
                <span className="meta-dot">·</span>
                <span className="edited-indicator">
                  <Edit2 size={12} /> Đã chỉnh sửa
                </span>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="thread-detail-content">
          <p>{thread.content}</p>
        </div>

        {/* Reaction Display */}
        {totalReactions > 0 && (
          <div className="thread-reactions-display">
            {Object.entries(reactionCounts)
              .filter(([, count]) => count > 0)
              .map(([type, count]) => {
                const r = REACTION_TYPES.find(rt => rt.type === type);
                return (
                  <span key={type} className="reaction-chip">
                    {r?.emoji} {count}
                  </span>
                );
              })}
          </div>
        )}

        {/* Actions */}
        <div className="thread-actions">
          {/* Reaction Button with picker */}
          <div className="reaction-btn-wrapper">
            <button
              className={`action-btn ${userReaction ? 'reacted' : ''}`}
              onClick={() => userReaction ? handleReaction(userReaction) : setShowReactionPicker(!showReactionPicker)}
              onMouseEnter={() => setShowReactionPicker(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Thích"
            >
              {userReaction ? (
                <span>{REACTION_TYPES.find(r => r.type === userReaction)?.emoji}</span>
              ) : (
                <ThumbsUp size={16} />
              )}
              {thread.like_count || thread.likes_count || 0} Thích
            </button>

            {showReactionPicker && (
              <div
                className="reaction-picker-popup"
                onMouseLeave={() => setShowReactionPicker(false)}
              >
                {REACTION_TYPES.map(r => (
                  <button
                    key={r.type}
                    className={`reaction-option ${userReaction === r.type ? 'active' : ''}`}
                    onClick={() => handleReaction(r.type)}
                    title={r.label}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Trả lời">
            <MessageSquare size={16} />
            {thread.reply_count || thread.comments_count || 0} Trả Lời
          </button>
          <button className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Lượt xem">
            <Eye size={16} />
            {thread.view_count || thread.views_count || 0} Lượt Xem
          </button>

          {/* Author-only actions */}
          {isAuthor && (
            <>
              <button
                className="action-btn"
                onClick={() => navigate(`/forum/edit/${threadId}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Chỉnh sửa bài viết"
              >
                <Edit2 size={16} />
                Chỉnh sửa
              </button>
              <button
                className="action-btn"
                onClick={() => navigate(`/forum/post/${threadId}/analytics`)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Xem phân tích bài viết"
              >
                <BarChart3 size={16} />
                Phân tích
              </button>
            </>
          )}
        </div>
      </div>

      {/* Threaded Replies */}
      <div className="replies-section">
        <h2 className="replies-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={24} />
          Trả Lời ({replies.length})
        </h2>

        {replies.length === 0 ? (
          <div className="no-replies card-glass">
            <p>Chưa có trả lời nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          <div className="replies-list">
            {replies.map(reply => (
              <ThreadedReply
                key={reply.id}
                reply={reply}
                depth={0}
                threadAuthorId={thread.user_id || thread.author_id}
                currentUserId={user?.id}
                onLike={handleLikeReply}
                onMarkSolved={handleMarkSolved}
                onReply={(replyId) => setReplyingTo(replyId)}
                acceptedReplyId={thread.accepted_reply_id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reply Form */}
      <div className="reply-form card-glass">
        <h3 className="reply-form-title">
          {replyingTo ? 'Trả lời bình luận' : 'Viết Trả Lời'}
        </h3>

        {replyingTo && (
          <div className="replying-to-indicator">
            <span>Đang trả lời bình luận</span>
            <button onClick={() => setReplyingTo(null)}>
              <X size={14} /> Hủy
            </button>
          </div>
        )}

        {!user ? (
          <p className="login-prompt">
            Vui lòng <a href="/login">đăng nhập</a> để trả lời
          </p>
        ) : (
          <form onSubmit={handleSubmitReply}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Nhập nội dung trả lời..."
              className="reply-textarea"
              rows={6}
              disabled={submitting}
            />
            <div className="reply-form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || !replyContent.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {submitting ? 'Đang gửi...' : (
                  <><Send size={20} /> Gửi Trả Lời</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="related-posts card-glass">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            Bài viết liên quan
          </h3>
          {relatedPosts.map(rp => (
            <Link key={rp.id} to={`/forum/thread/${rp.id}`} className="related-post-link">
              <span className="related-post-title">{rp.title}</span>
              <span className="related-post-stats">
                ❤️ {rp.likes_count || 0} · 💬 {rp.comments_count || 0}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Threaded Reply Component — Recursive nested replies
 */
function ThreadedReply({
  reply,
  depth,
  threadAuthorId,
  currentUserId,
  onLike,
  onMarkSolved,
  onReply,
  acceptedReplyId
}) {
  const isAuthor = currentUserId === threadAuthorId;
  const isAccepted = acceptedReplyId === reply.id;
  const maxDepth = 3;

  return (
    <div className={`reply-thread depth-${Math.min(depth, maxDepth)}`}>
      <div className={`reply-card card-glass ${isAccepted ? 'accepted' : ''}`}>
        {depth > 0 && <div className="thread-line" />}

        <div className="reply-header">
          <Link to={`/forum/user/${reply.user_id}`} className="reply-author-link">
            <img
              src={reply.author?.avatar_url || '/default-avatar.png'}
              alt={reply.author?.full_name}
              className="reply-avatar"
            />
            <div className="reply-author-info">
              <span className="reply-author-name">
                {reply.author?.full_name}
                {reply.author && <UserBadges user={reply.author} size="tiny" />}
              </span>
              <span className="reply-date">
                {new Date(reply.created_at).toLocaleString('vi-VN')}
              </span>
            </div>
          </Link>

          {isAccepted && (
            <span className="accepted-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} />
              Đã Chấp Nhận
            </span>
          )}
        </div>

        <div className="reply-content">
          <p>{reply.content}</p>
        </div>

        <div className="reply-actions">
          <button className="reply-action-btn" onClick={() => onLike(reply.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Thích">
            <ThumbsUp size={16} />
            {reply.like_count || reply.likes_count || 0}
          </button>

          {currentUserId && (
            <button
              className="reply-action-btn"
              onClick={() => onReply(reply.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Trả lời bình luận này"
            >
              <MessageSquare size={14} />
              Trả lời
            </button>
          )}

          {isAuthor && !isAccepted && (
            <button
              className="reply-action-btn accept-btn"
              onClick={() => onMarkSolved(reply.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Đánh dấu là câu trả lời chính xác"
            >
              <CheckCircle size={16} />
              Đánh Dấu Là Câu Trả Lời
            </button>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {reply.children && reply.children.length > 0 && (
        <div className="nested-replies">
          {reply.children.map(child => (
            <ThreadedReply
              key={child.id}
              reply={child}
              depth={depth + 1}
              threadAuthorId={threadAuthorId}
              currentUserId={currentUserId}
              onLike={onLike}
              onMarkSolved={onMarkSolved}
              onReply={onReply}
              acceptedReplyId={acceptedReplyId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
