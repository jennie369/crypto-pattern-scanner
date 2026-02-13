/**
 * CommentSection Component
 * Nested comments with replies
 * Uses design tokens for consistent styling
 */

import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Trash2,
  Flag,
  Reply
} from 'lucide-react';
import { ReactionPicker } from './ReactionPicker';
import './CommentSection.css';

// Single Comment Component
function Comment({
  comment,
  currentUser,
  level = 0,
  onReply,
  onDelete,
  onReact,
  maxLevel = 3
}) {
  const [showReplies, setShowReplies] = useState(level < 2);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = currentUser?.id === comment.author?.id;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText.trim());
    setReplyText('');
    setShowReplyInput(false);
    setShowReplies(true);
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return past.toLocaleDateString('vi-VN');
  };

  return (
    <div className={`comment-item level-${level}`}>
      {/* Comment Content */}
      <div className="comment-content">
        {/* Avatar */}
        <div className="comment-avatar">
          {comment.author?.avatar_url ? (
            <img src={comment.author.avatar_url} alt={comment.author.full_name} />
          ) : (
            <span>{(comment.author?.full_name || 'U')[0].toUpperCase()}</span>
          )}
        </div>

        {/* Body */}
        <div className="comment-body">
          <div className="comment-bubble">
            <span className="comment-author">{comment.author?.full_name || 'Người dùng'}</span>
            <p className="comment-text">{comment.content}</p>
          </div>

          {/* Actions */}
          <div className="comment-actions">
            <span className="comment-time">{formatTimeAgo(comment.created_at)}</span>

            {/* Reaction */}
            <ReactionPicker
              postId={comment.id}
              currentReaction={comment.userReaction}
              reactionCounts={comment.reactions || {}}
              onReact={onReact}
              showCounts={false}
              disabled={!currentUser}
            />

            {/* Reply Button */}
            {level < maxLevel && (
              <button
                className="action-btn"
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                <Reply size={14} />
                Trả lời
              </button>
            )}

            {/* More Menu */}
            <div className="menu-container">
              <button
                className="action-btn menu-trigger"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical size={14} />
              </button>

              {showMenu && (
                <div className="dropdown-menu">
                  {isOwner && (
                    <button onClick={() => onDelete(comment.id)}>
                      <Trash2 size={14} />
                      Xóa
                    </button>
                  )}
                  <button onClick={() => alert('Báo cáo đã được gửi')}>
                    <Flag size={14} />
                    Báo cáo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="reply-input-container">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Viết trả lời..."
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitReply()}
                autoFocus
              />
              <button
                className="send-reply-btn"
                onClick={handleSubmitReply}
                disabled={!replyText.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {hasReplies && (
        <div className="replies-container">
          {/* Toggle Button */}
          <button
            className="toggle-replies-btn"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showReplies ? 'Ẩn' : 'Xem'} {comment.replies.length} câu trả lời
          </button>

          {/* Replies List */}
          {showReplies && (
            <div className="replies-list">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  currentUser={currentUser}
                  level={level + 1}
                  onReply={onReply}
                  onDelete={onDelete}
                  onReact={onReact}
                  maxLevel={maxLevel}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main Comment Section
export function CommentSection({
  postId,
  comments = [],
  currentUser,
  onAddComment,
  onReplyComment,
  onDeleteComment,
  onReactComment,
  loading = false
}) {
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSubmitComment = () => {
    if (!newComment.trim() || !currentUser) return;
    onAddComment(postId, newComment.trim());
    setNewComment('');
  };

  // Build nested comment tree
  const buildCommentTree = (flatComments) => {
    const commentMap = {};
    const rootComments = [];

    // Create map
    flatComments.forEach(c => {
      commentMap[c.id] = { ...c, replies: [] };
    });

    // Build tree
    flatComments.forEach(c => {
      if (c.parent_id && commentMap[c.parent_id]) {
        commentMap[c.parent_id].replies.push(commentMap[c.id]);
      } else {
        rootComments.push(commentMap[c.id]);
      }
    });

    return rootComments;
  };

  const nestedComments = buildCommentTree(comments);

  return (
    <div className="comment-section">
      {/* Header */}
      <button
        className="comments-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <MessageCircle size={18} />
        <span>{comments.length} bình luận</span>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isExpanded && (
        <div className="comments-content">
          {/* Comment Input */}
          {currentUser && (
            <div className="new-comment-input">
              <div className="input-avatar">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt={currentUser.full_name} />
                ) : (
                  <span>{(currentUser.full_name || 'U')[0].toUpperCase()}</span>
                )}
              </div>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                />
                <button
                  className="send-btn"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Comments List */}
          {loading ? (
            <div className="comments-loading">Đang tải...</div>
          ) : nestedComments.length > 0 ? (
            <div className="comments-list">
              {nestedComments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  currentUser={currentUser}
                  onReply={onReplyComment}
                  onDelete={onDeleteComment}
                  onReact={onReactComment}
                />
              ))}
            </div>
          ) : (
            <div className="no-comments">
              <MessageCircle size={32} />
              <p>Chưa có bình luận nào</p>
              <span>Hãy là người đầu tiên bình luận!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CommentSection;
