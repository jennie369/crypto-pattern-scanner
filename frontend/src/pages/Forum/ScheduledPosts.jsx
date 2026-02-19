import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
  ArrowLeft, Calendar, Clock, Edit2, Trash2, Send,
  Loader2, AlertCircle, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ScheduledPosts.css';

const STATUS_CONFIG = {
  pending: { label: 'Chờ đăng', color: 'var(--brand-gold)', bg: 'rgba(255,189,89,0.12)' },
  published: { label: 'Đã đăng', color: 'var(--accent-green)', bg: 'rgba(0,255,136,0.12)' },
  failed: { label: 'Thất bại', color: 'var(--accent-red)', bg: 'rgba(255,71,87,0.12)' }
};

/**
 * ScheduledPosts Page — Manage scheduled posts
 * Route: /forum/scheduled
 * Protected: logged in only
 */
export default function ScheduledPosts() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user) loadScheduledPosts();
  }, [user]);

  const loadScheduledPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (fetchError) throw fetchError;
      setPosts(data || []);
    } catch (err) {
      console.error('[ScheduledPosts] Load error:', err);
      setError('Không thể tải bài viết lên lịch.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết lên lịch này?')) return;

    try {
      setDeletingId(id);
      const { error: delError } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (delError) throw delError;
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('[ScheduledPosts] Delete error:', err);
      alert('Không thể xóa. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublishNow = async (id) => {
    try {
      const post = posts.find(p => p.id === id);
      if (!post) return;

      // Create the post immediately
      const { error: createError } = await supabase
        .from('forum_posts')
        .insert({
          title: post.title,
          content: post.content,
          category_id: post.category_id,
          user_id: user.id,
          image_url: post.image_url,
          tags: post.tags,
          status: 'published'
        });

      if (createError) throw createError;

      // Update scheduled post status
      await supabase
        .from('scheduled_posts')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', id);

      setPosts(prev => prev.map(p =>
        p.id === id ? { ...p, status: 'published' } : p
      ));
    } catch (err) {
      console.error('[ScheduledPosts] Publish error:', err);
      alert('Không thể đăng ngay. Vui lòng thử lại.');
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

  // Loading
  if (loading) {
    return (
      <div className="scheduled-page">
        <div className="scheduled-loading">
          <Loader2 size={40} className="spinner-icon" />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scheduled-page">
      {/* Header */}
      <div className="scheduled-header">
        <button className="btn-back" onClick={() => navigate('/forum')}>
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <h1 className="scheduled-title">
          <Calendar size={24} />
          Bài viết lên lịch
        </h1>
      </div>

      {/* Error */}
      {error && (
        <div className="scheduled-error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={loadScheduledPosts}>Thử lại</button>
        </div>
      )}

      {/* Empty State */}
      {!error && posts.length === 0 && (
        <div className="scheduled-empty">
          <Calendar size={56} />
          <h3>Chưa có bài viết lên lịch nào</h3>
          <p>Tạo bài viết và chọn thời gian đăng để sử dụng tính năng này</p>
          <button className="btn-create" onClick={() => navigate('/forum/new')}>
            <FileText size={18} />
            Tạo bài viết mới
          </button>
        </div>
      )}

      {/* Posts List */}
      <AnimatePresence>
        {posts.map(post => {
          const status = STATUS_CONFIG[post.status] || STATUS_CONFIG.pending;
          const isPending = post.status === 'pending';

          return (
            <motion.div
              key={post.id}
              className="scheduled-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              layout
            >
              <div className="scheduled-card-header">
                <span
                  className="status-badge"
                  style={{ color: status.color, background: status.bg }}
                >
                  {status.label}
                </span>
                <div className="scheduled-time">
                  <Clock size={14} />
                  <span>{formatDate(post.scheduled_at)}</span>
                </div>
              </div>

              <h3 className="scheduled-card-title">{post.title || 'Không có tiêu đề'}</h3>
              <p className="scheduled-card-content">
                {(post.content || '').substring(0, 150)}
                {(post.content || '').length > 150 ? '...' : ''}
              </p>

              {isPending && (
                <div className="scheduled-card-actions">
                  <button className="btn-action edit" onClick={() => navigate(`/forum/edit/${post.id}`)}>
                    <Edit2 size={14} />
                    Sửa
                  </button>
                  <button className="btn-action publish" onClick={() => handlePublishNow(post.id)}>
                    <Send size={14} />
                    Đăng ngay
                  </button>
                  <button
                    className="btn-action delete"
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                  >
                    {deletingId === post.id ? (
                      <Loader2 size={14} className="spinner-icon" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Xóa
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
