import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { forumService, forumCategories } from '../../services/forum';
import { useAuth } from '../../contexts/AuthContext';
import UserBadges from '../../components/UserBadge/UserBadges';
import { X, CheckCircle, ThumbsUp, MessageSquare, Eye, Send } from 'lucide-react';
import './Forum.css';

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

  useEffect(() => {
    loadThread();
  }, [threadId]);

  const loadThread = async () => {
    setLoading(true);
    try {
      const data = await forumService.getThread(threadId);
      setThread(data);
      setReplies(data.replies || []);
    } catch (error) {
      console.error('Error loading thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) return;

    setSubmitting(true);
    try {
      const newReply = await forumService.createReply({
        threadId,
        content: replyContent,
        authorId: user.id,
        parentId: replyingTo
      });

      setReplies([...replies, newReply]);
      setReplyContent('');
      setReplyingTo(null);
      loadThread(); // Reload to get updated counts
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
    if (!user) {
      alert('Vui lòng đăng nhập để thích trả lời');
      return;
    }

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

  const category = forumCategories.find(c => c.id === thread.category);

  return (
    <div className="forum-page thread-detail-page">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate('/forum')}>
        ← Quay Lại Forum
      </button>

      {/* Thread Content */}
      <div className="thread-detail card-glass">
        {/* Header */}
        <div className="thread-detail-header">
          <div className="thread-badges">
            {category && (
              <span
                className="category-badge"
                style={{ '--badge-color': category.color }}
              >
                {category.icon} {category.name}
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
            <img
              src={thread.author?.avatar_url || '/default-avatar.png'}
              alt={thread.author?.full_name}
              className="author-avatar-small"
            />
            <span className="author-name">{thread.author?.full_name}</span>
            <span className="meta-dot">•</span>
            <span className="thread-date">
              {new Date(thread.created_at).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="thread-detail-content">
          <p>{thread.content}</p>
        </div>

        {/* Actions */}
        <div className="thread-actions">
          <button className="action-btn" onClick={handleLikeThread} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ThumbsUp size={16} />
            {thread.like_count || 0} Thích
          </button>
          <button className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={16} />
            {thread.reply_count || 0} Trả Lời
          </button>
          <button className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={16} />
            {thread.view_count || 0} Lượt Xem
          </button>
        </div>
      </div>

      {/* Replies Section */}
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
              <ReplyCard
                key={reply.id}
                reply={reply}
                threadAuthorId={thread.author_id}
                currentUserId={user?.id}
                onLike={() => handleLikeReply(reply.id)}
                onMarkSolved={() => handleMarkSolved(reply.id)}
                isAccepted={thread.accepted_reply_id === reply.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reply Form */}
      <div className="reply-form card-glass">
        <h3 className="reply-form-title">Viết Trả Lời</h3>

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
                  <>
                    <Send size={20} />
                    Gửi Trả Lời
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Reply Card Component
function ReplyCard({
  reply,
  threadAuthorId,
  currentUserId,
  onLike,
  onMarkSolved,
  isAccepted
}) {
  const isAuthor = currentUserId === threadAuthorId;

  return (
    <div className={`reply-card card-glass ${isAccepted ? 'accepted' : ''}`}>
      <div className="reply-header">
        <img
          src={reply.author?.avatar_url || '/default-avatar.png'}
          alt={reply.author?.full_name}
          className="reply-avatar"
        />

        <div className="reply-author-info">
          <span className="reply-author-name">
            {reply.author?.full_name}
            <UserBadges user={reply.author} size="tiny" />
          </span>
          <span className="reply-date">
            {new Date(reply.created_at).toLocaleString('vi-VN')}
          </span>
        </div>

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
        <button className="reply-action-btn" onClick={onLike} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ThumbsUp size={16} />
          {reply.like_count || 0}
        </button>

        {isAuthor && !isAccepted && (
          <button
            className="reply-action-btn accept-btn"
            onClick={onMarkSolved}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCircle size={16} />
            Đánh Dấu Là Câu Trả Lời
          </button>
        )}
      </div>
    </div>
  );
}
