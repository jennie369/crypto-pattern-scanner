/**
 * CreatePostPage - Create new post/thread
 * Synced with Mobile Post Creation
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { forumService, forumCategories } from '../../services/forum';
import CompactSidebar from '../../components/CompactSidebar/CompactSidebar';
import { LoadingSpinner } from '../../components/UI';
import {
  ArrowLeft, Image, Hash, Send, X, AlertCircle,
  MessageSquare, TrendingUp, Sparkles, Trophy, HelpCircle
} from 'lucide-react';
import './CreatePostPage.css';

const iconMap = {
  MessageSquare, TrendingUp, Sparkles, Trophy, HelpCircle
};

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if not logged in
  if (!user) {
    navigate('/login', { state: { from: '/community/create' } });
    return null;
  }

  const handleAddTag = () => {
    const tag = tagInput.trim().replace('#', '');
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề bài viết');
      return;
    }

    if (!content.trim()) {
      setError('Vui lòng nhập nội dung bài viết');
      return;
    }

    if (!category) {
      setError('Vui lòng chọn danh mục');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const threadData = {
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags.length > 0 ? tags : undefined
      };

      const result = await forumService.createThread(threadData);

      if (result?.id) {
        navigate(`/community/post/${result.id}`);
      } else {
        navigate('/community');
      }
    } catch (err) {
      console.error('[CreatePostPage] Error:', err);
      setError(err.message || 'Đã xảy ra lỗi khi đăng bài. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = title.trim() && content.trim() && category && !loading;

  return (
    <>
      <CompactSidebar />
      <div className="page-container">
        <div className="page-content">
          {/* Header */}
          <div className="create-post-header">
            <button className="btn-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </button>
            <h1>Tạo Bài Viết Mới</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="create-post-form">
            {/* Error Message */}
            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Category Selection */}
            <div className="form-section">
              <label className="form-label">Danh mục *</label>
              <div className="category-grid">
                {forumCategories.map(cat => {
                  const Icon = iconMap[cat.icon] || MessageSquare;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`category-option ${category === cat.id ? 'selected' : ''}`}
                      onClick={() => setCategory(cat.id)}
                      style={{ '--cat-color': cat.color }}
                    >
                      <Icon size={20} />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="form-section">
              <label className="form-label">Tiêu đề *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề bài viết..."
                className="form-input"
                maxLength={200}
              />
              <span className="char-count">{title.length}/200</span>
            </div>

            {/* Content */}
            <div className="form-section">
              <label className="form-label">Nội dung *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Chia sẻ suy nghĩ, câu hỏi hoặc kiến thức của bạn..."
                className="form-textarea"
                rows={10}
              />
            </div>

            {/* Tags */}
            <div className="form-section">
              <label className="form-label">Hashtag (tùy chọn)</label>
              <div className="tags-input-container">
                <div className="tags-list">
                  {tags.map(tag => (
                    <span key={tag} className="tag-item">
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                {tags.length < 5 && (
                  <div className="tag-input-wrapper">
                    <Hash size={16} />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={handleAddTag}
                      placeholder="Thêm hashtag..."
                      className="tag-input"
                    />
                  </div>
                )}
              </div>
              <span className="form-hint">Nhấn Enter hoặc dấu phẩy để thêm (tối đa 5 tags)</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-submit"
              disabled={!canSubmit}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Đang đăng...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Đăng Bài Viết</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
