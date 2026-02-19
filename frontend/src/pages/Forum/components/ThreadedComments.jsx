import React, { useState, useMemo } from 'react';
import { MessageCircle, ChevronDown, ChevronUp, ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import { Send } from 'lucide-react';
import CommentItem from './CommentItem';
import './ThreadedComments.css';

/**
 * ThreadedComments - Tree structure comments from flat array
 * Builds tree using parent_id, supports collapse/expand, sort, load more
 */

const INITIAL_VISIBLE = 5; // root comments shown initially
const INITIAL_REPLIES = 3; // replies shown before "load more"

export default function ThreadedComments({
  comments = [],
  currentUser,
  totalCount = 0,
  onAddComment,
  onReply,
  onDelete,
  onEdit,
  onReact,
  onReport,
  onLoadMore,
  loading = false,
  hasMore = false
}) {
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [newComment, setNewComment] = useState('');
  const [collapsedThreads, setCollapsedThreads] = useState(new Set());
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  /**
   * Build comment tree from flat array
   */
  const commentTree = useMemo(() => {
    const map = {};
    const roots = [];

    // Create map with replies array
    comments.forEach(c => {
      map[c.id] = { ...c, replies: [] };
    });

    // Build tree
    comments.forEach(c => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].replies.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    // Sort roots
    roots.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Sort replies (always oldest first for natural conversation flow)
    const sortReplies = (node) => {
      node.replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      node.replies.forEach(sortReplies);
    };
    roots.forEach(sortReplies);

    return roots;
  }, [comments, sortOrder]);

  /**
   * Toggle thread collapse
   */
  const toggleCollapse = (commentId) => {
    setCollapsedThreads(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  /**
   * Expand all replies for a thread
   */
  const expandAllReplies = (commentId) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      next.add(commentId);
      return next;
    });
  };

  /**
   * Submit new root comment
   */
  const handleSubmitComment = () => {
    if (!newComment.trim() || !currentUser) return;
    onAddComment?.(newComment.trim());
    setNewComment('');
  };

  /**
   * Render a comment node and its replies recursively
   */
  const renderCommentNode = (node, depth = 0) => {
    const isCollapsed = collapsedThreads.has(node.id);
    const hasReplies = node.replies && node.replies.length > 0;
    const isAllExpanded = expandedReplies.has(node.id);
    const visibleReplies = isAllExpanded
      ? node.replies
      : node.replies.slice(0, INITIAL_REPLIES);
    const hiddenCount = node.replies.length - INITIAL_REPLIES;

    return (
      <div key={node.id} className="threaded-comment-node">
        <CommentItem
          comment={node}
          currentUser={currentUser}
          depth={depth}
          onReply={onReply}
          onDelete={onDelete}
          onEdit={onEdit}
          onReact={onReact}
          onReport={onReport}
          maxDepth={3}
        />

        {/* Replies section */}
        {hasReplies && (
          <div className="threaded-replies-section">
            {/* Collapse/expand toggle */}
            {node.replies.length > INITIAL_REPLIES && (
              <button
                className="thread-collapse-btn"
                onClick={() => toggleCollapse(node.id)}
              >
                {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                {isCollapsed
                  ? `Xem ${node.replies.length} câu trả lời`
                  : 'Ẩn trả lời'
                }
              </button>
            )}

            {/* Replies list */}
            {!isCollapsed && (
              <div className="threaded-replies-list">
                {visibleReplies.map(reply => renderCommentNode(reply, depth + 1))}

                {/* Load more replies */}
                {!isAllExpanded && hiddenCount > 0 && (
                  <button
                    className="thread-load-more-replies"
                    onClick={() => expandAllReplies(node.id)}
                  >
                    Xem thêm {hiddenCount} câu trả lời
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const displayCount = totalCount || comments.length;
  const visibleRoots = commentTree.slice(0, visibleCount);

  return (
    <div className="threaded-comments">
      {/* Header: count + sort */}
      <div className="threaded-comments-header">
        <div className="threaded-comments-count">
          <MessageCircle size={18} />
          <span>{displayCount} bình luận</span>
        </div>
        <button
          className="threaded-comments-sort"
          onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
        >
          {sortOrder === 'newest' ? <ArrowDownAZ size={16} /> : <ArrowUpAZ size={16} />}
          {sortOrder === 'newest' ? 'Mới nhất' : 'Cũ nhất'}
        </button>
      </div>

      {/* New comment input */}
      {currentUser && (
        <div className="threaded-new-comment">
          <div className="threaded-new-comment-avatar">
            {currentUser.avatar_url ? (
              <img src={currentUser.avatar_url} alt={currentUser.full_name} />
            ) : (
              <span>{(currentUser.full_name || 'U')[0].toUpperCase()}</span>
            )}
          </div>
          <div className="threaded-new-comment-input-wrapper">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
            />
            <button
              className="threaded-new-comment-send"
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Comments list */}
      {loading && comments.length === 0 ? (
        <div className="threaded-comments-loading">Đang tải bình luận...</div>
      ) : commentTree.length === 0 ? (
        <div className="threaded-comments-empty">
          <MessageCircle size={32} />
          <p>Chưa có bình luận nào</p>
          <span>Hãy là người đầu tiên bình luận!</span>
        </div>
      ) : (
        <div className="threaded-comments-list">
          {visibleRoots.map(node => renderCommentNode(node, 0))}

          {/* Show more root comments */}
          {visibleCount < commentTree.length && (
            <button
              className="threaded-load-more-btn"
              onClick={() => setVisibleCount(prev => prev + INITIAL_VISIBLE)}
            >
              Xem thêm bình luận ({commentTree.length - visibleCount} còn lại)
            </button>
          )}

          {/* Load more from server */}
          {hasMore && (
            <button
              className="threaded-load-more-btn"
              onClick={onLoadMore}
              disabled={loading}
            >
              {loading ? 'Đang tải...' : 'Tải thêm bình luận'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
