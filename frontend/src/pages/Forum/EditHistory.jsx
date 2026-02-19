import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Clock, Edit2, Loader2, AlertCircle } from 'lucide-react';
import './EditHistory.css';

/**
 * EditHistory Page — View edit history of a post
 * Route: /forum/post/:postId/history
 */
export default function EditHistory() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (postId) loadHistory();
  }, [postId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load post title
      const { data: postData } = await supabase
        .from('forum_posts')
        .select('id, title')
        .eq('id', postId)
        .single();

      setPost(postData);

      // Load edit history
      const { data, error: histError } = await supabase
        .from('post_edit_history')
        .select(`
          *,
          editor:profiles(id, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (histError) throw histError;
      setHistory(data || []);
    } catch (err) {
      console.error('[EditHistory] Load error:', err);
      setError('Không thể tải lịch sử chỉnh sửa.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Simple diff: highlight added/removed text
   */
  const renderDiff = (oldText, newText) => {
    if (!oldText && !newText) return null;
    if (!oldText) return <div className="diff-added">{newText}</div>;
    if (!newText) return <div className="diff-removed">{oldText}</div>;

    // Simple line-by-line diff
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const maxLen = Math.max(oldLines.length, newLines.length);

    return (
      <div className="diff-view">
        {Array.from({ length: maxLen }).map((_, i) => {
          const oldLine = oldLines[i];
          const newLine = newLines[i];

          if (oldLine === newLine) {
            return (
              <div key={i} className="diff-line same">
                <span className="diff-marker">&nbsp;</span>
                <span>{oldLine}</span>
              </div>
            );
          }

          return (
            <React.Fragment key={i}>
              {oldLine !== undefined && (
                <div className="diff-line removed">
                  <span className="diff-marker">-</span>
                  <span>{oldLine}</span>
                </div>
              )}
              {newLine !== undefined && (
                <div className="diff-line added">
                  <span className="diff-marker">+</span>
                  <span>{newLine}</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="edit-history-page">
        <div className="history-loading">
          <Loader2 size={40} className="spinner-icon" />
          <p>Đang tải lịch sử...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-history-page">
      {/* Header */}
      <div className="history-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="history-title-group">
          <h1 className="history-title">
            <Clock size={24} />
            Lịch sử chỉnh sửa
          </h1>
          {post && <p className="history-post-title">{post.title}</p>}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="history-error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Empty */}
      {!error && history.length === 0 && (
        <div className="history-empty">
          <Edit2 size={48} />
          <h3>Chưa có lịch sử chỉnh sửa</h3>
          <p>Bài viết này chưa được chỉnh sửa lần nào</p>
        </div>
      )}

      {/* History List */}
      <div className="history-list">
        {history.map((entry, index) => (
          <div key={entry.id} className="history-card">
            <div className="history-card-header">
              <div className="history-editor">
                <div className="editor-avatar">
                  {entry.editor?.avatar_url ? (
                    <img src={entry.editor.avatar_url} alt={entry.editor.full_name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {(entry.editor?.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="editor-info">
                  <span className="editor-name">{entry.editor?.full_name || 'Ẩn danh'}</span>
                  <span className="edit-label">Đã chỉnh sửa</span>
                </div>
              </div>
              <div className="history-time">
                <Clock size={12} />
                <span>{formatDate(entry.created_at)}</span>
              </div>
            </div>

            {/* Toggle diff */}
            <button
              className="toggle-diff-btn"
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
            >
              {expandedId === entry.id ? 'Ẩn thay đổi' : 'Xem thay đổi'}
            </button>

            {expandedId === entry.id && (
              <div className="history-diff">
                {entry.old_title !== entry.new_title && (
                  <div className="diff-section">
                    <h4 className="diff-section-title">Tiêu đề</h4>
                    {renderDiff(entry.old_title, entry.new_title)}
                  </div>
                )}
                {entry.old_content !== entry.new_content && (
                  <div className="diff-section">
                    <h4 className="diff-section-title">Nội dung</h4>
                    {renderDiff(entry.old_content, entry.new_content)}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
