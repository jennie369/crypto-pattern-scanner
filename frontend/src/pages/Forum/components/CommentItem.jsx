import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Reply,
  MoreVertical,
  Trash2,
  Flag,
  Edit2,
  Send
} from 'lucide-react';
import ReactionDisplay from './ReactionDisplay';
import './CommentItem.css';

/**
 * Reaction definitions for quick reactions on comments
 */
const QUICK_REACTIONS = [
  { id: 'like', emoji: '❤️' },
  { id: 'love', emoji: '😍' },
  { id: 'haha', emoji: '😂' },
];

/**
 * CommentItem - Individual comment with reactions, reply, edit/delete
 * Used inside ThreadedComments for nested comment display
 */
export default function CommentItem({
  comment,
  currentUser,
  depth = 0,
  onReply,
  onDelete,
  onEdit,
  onReact,
  onReport,
  maxDepth = 3
}) {
  const navigate = useNavigate();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content || '');

  const isOwner = currentUser?.id === comment.author_id;
  const authorName = comment.author?.full_name || comment.author_name || 'Người dùng';
  const authorAvatar = comment.author?.avatar_url || comment.author_avatar;

  /**
   * Format relative timestamp in Vietnamese
   */
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  /**
   * Handle reply submit
   */
  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onReply?.(comment.id, replyText.trim());
    setReplyText('');
    setShowReplyInput(false);
  };

  /**
   * Handle edit submit
   */
  const handleSubmitEdit = () => {
    if (!editText.trim() || editText.trim() === comment.content) {
      setIsEditing(false);
      return;
    }
    onEdit?.(comment.id, editText.trim());
    setIsEditing(false);
  };

  /**
   * Handle quick reaction
   */
  const handleQuickReact = (reactionId) => {
    if (!currentUser) return;
    const currentReaction = comment.user_reaction;
    const newReaction = currentReaction === reactionId ? null : reactionId;
    onReact?.(comment.id, newReaction);
  };

  /**
   * Render content with @mention highlighting
   */
  const renderContent = (text) => {
    if (!text) return null;

    const mentionRegex = /@([\w\u00C0-\u024F\u1E00-\u1EFF\s]+?)(?=\s|$|@|#)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'mention', content: match[0], name: match[1] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    if (parts.length === 0) return <span>{text}</span>;

    return parts.map((part, idx) => {
      if (part.type === 'mention') {
        return (
          <span
            key={idx}
            className="comment-mention"
            onClick={(e) => {
              e.stopPropagation();
              // Could navigate to user profile
            }}
          >
            {part.content}
          </span>
        );
      }
      return <span key={idx}>{part.content}</span>;
    });
  };

  return (
    <div className={`comment-item-v2 comment-depth-${Math.min(depth, maxDepth)}`}>
      {/* Thread connector line */}
      {depth > 0 && <div className="comment-thread-line" />}

      <div className="comment-item-content">
        {/* Avatar */}
        <div className="comment-item-avatar">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} />
          ) : (
            <span>{authorName.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="comment-item-body">
          {/* Comment bubble */}
          <div className="comment-item-bubble">
            <div className="comment-item-header">
              <span className="comment-item-author">{authorName}</span>
              {comment.author_tier && (
                <span className={`comment-tier-badge tier-${comment.author_tier}`}>
                  {comment.author_tier}
                </span>
              )}
            </div>

            {isEditing ? (
              <div className="comment-edit-wrapper">
                <textarea
                  className="comment-edit-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={2}
                  autoFocus
                />
                <div className="comment-edit-actions">
                  <button
                    className="comment-edit-cancel"
                    onClick={() => { setIsEditing(false); setEditText(comment.content); }}
                  >
                    Hủy
                  </button>
                  <button
                    className="comment-edit-save"
                    onClick={handleSubmitEdit}
                    disabled={!editText.trim()}
                  >
                    Lưu
                  </button>
                </div>
              </div>
            ) : (
              <p className="comment-item-text">{renderContent(comment.content)}</p>
            )}
          </div>

          {/* Action bar */}
          <div className="comment-item-actions">
            <span className="comment-item-time">{getTimeAgo(comment.created_at)}</span>

            {/* Quick reactions */}
            <div className="comment-quick-reactions">
              {QUICK_REACTIONS.map((r) => (
                <button
                  key={r.id}
                  className={`comment-quick-react ${comment.user_reaction === r.id ? 'active' : ''}`}
                  onClick={() => handleQuickReact(r.id)}
                  disabled={!currentUser}
                >
                  {r.emoji}
                </button>
              ))}
            </div>

            {/* Reaction counts */}
            {comment.reaction_counts && (
              <ReactionDisplay
                reactionCounts={comment.reaction_counts}
                compact
              />
            )}

            {/* Reply button — only for logged-in users */}
            {depth < maxDepth && currentUser && (
              <button
                className="comment-action-btn"
                onClick={() => setShowReplyInput(!showReplyInput)}
                title="Trả lời"
              >
                <Reply size={14} />
                Trả lời
              </button>
            )}

            {/* Menu */}
            <div className="comment-menu-wrapper">
              <button
                className="comment-action-btn comment-menu-trigger"
                onClick={() => setShowMenu(!showMenu)}
                title="Tùy chọn"
              >
                <MoreVertical size={14} />
              </button>

              {showMenu && (
                <div className="comment-menu-dropdown">
                  {isOwner && (
                    <>
                      <button
                        className="comment-menu-item"
                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                        title="Chỉnh sửa bình luận"
                      >
                        <Edit2 size={14} />
                        Chỉnh sửa
                      </button>
                      <button
                        className="comment-menu-item comment-menu-delete"
                        onClick={() => { onDelete?.(comment.id); setShowMenu(false); }}
                        title="Xóa bình luận"
                      >
                        <Trash2 size={14} />
                        Xóa
                      </button>
                    </>
                  )}
                  {currentUser && (
                    <button
                      className="comment-menu-item"
                      onClick={() => { onReport?.(comment.id); setShowMenu(false); }}
                      title="Báo cáo bình luận"
                    >
                      <Flag size={14} />
                      Báo cáo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Inline reply input */}
          {showReplyInput && (
            <div className="comment-reply-input">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Trả lời ${authorName}...`}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()}
                autoFocus
              />
              <button
                className="comment-reply-send"
                onClick={handleSubmitReply}
                disabled={!replyText.trim()}
                title="Gửi trả lời"
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
