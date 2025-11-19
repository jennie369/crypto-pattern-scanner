import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forumService, forumCategories } from '../../services/forum';
import { useAuth } from '../../contexts/AuthContext';
import { PenLine, ClipboardList, Send } from 'lucide-react';
import './Forum.css';

export default function CreateThread() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    } else if (formData.title.length > 300) {
      newErrors.title = 'Tiêu đề không được vượt quá 300 ký tự';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung không được để trống';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Nội dung phải có ít nhất 10 ký tự';
    }

    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Parse tags from comma-separated string
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const newThread = await forumService.createThread({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        authorId: user.id,
        tags
      });

      // Navigate to the newly created thread
      navigate(`/forum/thread/${newThread.id}`);
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Không thể tạo chủ đề. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  if (!user) return null;

  return (
    <div className="forum-page create-thread-page">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate('/forum')}>
        ← Quay Lại Forum
      </button>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="heading-gold" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <PenLine size={32} />
          Tạo Chủ Đề Mới
        </h1>
        <p className="page-subtitle">
          Chia sẻ câu hỏi, kinh nghiệm hoặc thảo luận với cộng đồng
        </p>
      </div>

      {/* Create Thread Form */}
      <div className="create-thread-form card-glass">
        <form onSubmit={handleSubmit}>
          {/* Title Input */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Tiêu Đề <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Nhập tiêu đề chủ đề..."
              className={`form-input ${errors.title ? 'error' : ''}`}
              maxLength={300}
              disabled={submitting}
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
            <span className="char-count">
              {formData.title.length}/300
            </span>
          </div>

          {/* Category Selector */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Danh Mục <span className="required">*</span>
            </label>
            <div className="category-selector">
              {forumCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleChange('category', cat.id)}
                  className={`category-select-btn ${
                    formData.category === cat.id ? 'selected' : ''
                  }`}
                  style={{
                    '--category-color': cat.color
                  }}
                  disabled={submitting}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <div className="category-info">
                    <span className="category-name">{cat.name}</span>
                    <span className="category-desc">{cat.description}</span>
                  </div>
                </button>
              ))}
            </div>
            {errors.category && (
              <span className="error-message">{errors.category}</span>
            )}
          </div>

          {/* Content Textarea */}
          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Nội Dung <span className="required">*</span>
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Nhập nội dung chi tiết của chủ đề...&#10;&#10;Mẹo: Viết rõ ràng và chi tiết để nhận được nhiều phản hồi hữu ích hơn!"
              className={`form-textarea ${errors.content ? 'error' : ''}`}
              rows={12}
              disabled={submitting}
            />
            {errors.content && (
              <span className="error-message">{errors.content}</span>
            )}
            <span className="char-count">
              {formData.content.length} ký tự
            </span>
          </div>

          {/* Tags Input */}
          <div className="form-group">
            <label htmlFor="tags" className="form-label">
              Tags (Tùy chọn)
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="Nhập tags, cách nhau bằng dấu phẩy (vd: bitcoin, pattern, support)"
              className="form-input"
              disabled={submitting}
            />
            <span className="helper-text">
              Tags giúp người khác dễ dàng tìm thấy chủ đề của bạn
            </span>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/forum')}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {submitting ? (
                <>
                  <span className="spinner-small" />
                  Đang Tạo...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Tạo Chủ Đề
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Guidelines Card */}
      <div className="guidelines-card card-glass">
        <h3 className="guidelines-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList size={24} />
          Hướng Dẫn Đăng Bài
        </h3>
        <ul className="guidelines-list">
          <li>
            <strong>Tiêu đề rõ ràng:</strong> Viết tiêu đề ngắn gọn, súc tích, thể hiện đúng nội dung
          </li>
          <li>
            <strong>Chọn đúng danh mục:</strong> Giúp người khác dễ tìm và trả lời câu hỏi của bạn
          </li>
          <li>
            <strong>Nội dung chi tiết:</strong> Mô tả vấn đề cụ thể, kèm ảnh hoặc ví dụ nếu có
          </li>
          <li>
            <strong>Tôn trọng cộng đồng:</strong> Giữ thái độ lịch sự, tích cực và hỗ trợ lẫn nhau
          </li>
          <li>
            <strong>Sử dụng tags:</strong> Thêm từ khóa liên quan để tăng khả năng tìm kiếm
          </li>
        </ul>
      </div>
    </div>
  );
}
