import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import forumService, { forumCategories } from '../../services/forum';
import { ArrowLeft, Save, X, Loader2, Image as ImageIcon, Tag, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './EditPost.css';

/**
 * EditPost Page — Edit an existing forum post
 * Route: /forum/edit/:postId
 * Protected: only post author can access
 */
export default function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [post, setPost] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    image_url: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Load post data
  useEffect(() => {
    if (!postId) return;
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await forumService.getThread(postId);

      if (!data) {
        setError('Bài viết không tồn tại');
        return;
      }

      // Author-only check
      if (data.user_id !== user?.id) {
        setError('Bạn không có quyền chỉnh sửa bài viết này');
        return;
      }

      setPost(data);
      setFormData({
        title: data.title || '',
        content: data.content || '',
        category: data.category_id || '',
        tags: (data.tags || []).join(', '),
        image_url: data.image_url || ''
      });
    } catch (err) {
      console.error('[EditPost] Load error:', err);
      setError('Không thể tải bài viết. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Tiêu đề không được để trống';
    if (formData.title.length > 300) errors.title = 'Tiêu đề tối đa 300 ký tự';
    if (!formData.content.trim()) errors.content = 'Nội dung không được để trống';
    if (formData.content.length < 10) errors.content = 'Nội dung phải có ít nhất 10 ký tự';
    if (!formData.category) errors.category = 'Vui lòng chọn danh mục';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await forumService.updateThread(postId, {
        title: formData.title,
        content: formData.content,
        category_id: formData.category,
        tags,
        image_url: formData.image_url || null,
        edited_at: new Date().toISOString()
      });

      navigate(`/forum/thread/${postId}`);
    } catch (err) {
      console.error('[EditPost] Save error:', err);
      setError('Không thể lưu bài viết. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="edit-post-page">
        <div className="edit-post-loading">
          <Loader2 size={40} className="spinner-icon" />
          <p>Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  // Error state (unauthorized or not found)
  if (error && !post) {
    return (
      <div className="edit-post-page">
        <div className="edit-post-error">
          <AlertCircle size={48} />
          <p>{error}</p>
          <button className="btn-back" onClick={() => navigate('/forum')}>
            <ArrowLeft size={18} />
            Quay lại Forum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-post-page">
      {/* Header */}
      <div className="edit-post-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <h1 className="edit-post-title">Chỉnh sửa bài viết</h1>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="edit-post-error-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <div className="edit-post-form">
        {/* Title */}
        <div className="form-group">
          <label className="form-label">
            Tiêu đề <span className="required">*</span>
          </label>
          <input
            type="text"
            className={`form-input ${formErrors.title ? 'error' : ''}`}
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Tiêu đề bài viết..."
            maxLength={300}
            disabled={saving}
          />
          {formErrors.title && <span className="error-text">{formErrors.title}</span>}
          <span className="char-count">{formData.title.length}/300</span>
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">
            Danh mục <span className="required">*</span>
          </label>
          <div className="category-grid">
            {forumCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`category-btn ${formData.category === cat.id ? 'selected' : ''}`}
                style={{ '--cat-color': cat.color }}
                onClick={() => handleChange('category', cat.id)}
                disabled={saving}
              >
                <span className="cat-name">{cat.name}</span>
              </button>
            ))}
          </div>
          {formErrors.category && <span className="error-text">{formErrors.category}</span>}
        </div>

        {/* Content */}
        <div className="form-group">
          <label className="form-label">
            Nội dung <span className="required">*</span>
          </label>
          <textarea
            className={`form-textarea ${formErrors.content ? 'error' : ''}`}
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Nội dung bài viết..."
            rows={12}
            disabled={saving}
          />
          {formErrors.content && <span className="error-text">{formErrors.content}</span>}
          <span className="char-count">{formData.content.length} ký tự</span>
        </div>

        {/* Image URL */}
        <div className="form-group">
          <label className="form-label">
            <ImageIcon size={16} />
            Hình ảnh (URL)
          </label>
          <input
            type="url"
            className="form-input"
            value={formData.image_url}
            onChange={(e) => handleChange('image_url', e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={saving}
          />
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">
            <Tag size={16} />
            Tags (cách nhau bằng dấu phẩy)
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="bitcoin, trading, pattern"
            disabled={saving}
          />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="edit-post-actions">
        <button
          className="btn-cancel"
          onClick={() => navigate(-1)}
          disabled={saving}
        >
          <X size={18} />
          <span>Hủy</span>
        </button>
        <button
          className="btn-save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 size={18} className="spinner-icon" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Lưu thay đổi</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
