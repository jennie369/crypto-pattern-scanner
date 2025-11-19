import React, { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  TrendingUp,
  ChevronDown,
  Loader
} from 'lucide-react';
import forumService, { forumCategories } from '../../../services/forum';
import './PostCreationModal.css';

/**
 * PostCreationModal Component - DAY 2 IMPLEMENTATION
 * Modal for creating new posts
 *
 * Features:
 * - Title and content inputs
 * - Category selection dropdown
 * - Image upload (Supabase Storage)
 * - Trading data inputs (Entry, SL, TP, R:R) - OPTIONAL
 * - Form validation
 * - Loading states
 * - Error handling
 */
export default function PostCreationModal({
  onClose,
  onSubmit,
  currentUser
}) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'trading-discussion',
    imageFile: null,
    imagePreview: null,
    // Trading data (optional)
    tradeEntry: '',
    tradeSL: '',
    tradeTP: '',
    tradeRR: ''
  });

  const [showTradingData, setShowTradingData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle input change
   */
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError(''); // Clear error on change
  };

  /**
   * Handle image upload
   */
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        imageFile: file,
        imagePreview: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  /**
   * Remove image
   */
  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      imageFile: null,
      imagePreview: null
    });
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return false;
    }

    if (!formData.content.trim()) {
      setError('Vui lòng nhập nội dung');
      return false;
    }

    if (formData.title.length > 200) {
      setError('Tiêu đề không được vượt quá 200 ký tự');
      return false;
    }

    if (formData.content.length > 5000) {
      setError('Nội dung không được vượt quá 5000 ký tự');
      return false;
    }

    return true;
  };

  /**
   * Handle form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      // Prepare post data
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        // Optional trading data
        tradeEntry: formData.tradeEntry ? parseFloat(formData.tradeEntry) : null,
        tradeSL: formData.tradeSL ? parseFloat(formData.tradeSL) : null,
        tradeTP: formData.tradeTP ? parseFloat(formData.tradeTP) : null,
        tradeRR: formData.tradeRR ? parseFloat(formData.tradeRR) : null
      };

      // Upload image if present
      if (formData.imageFile) {
        // TODO: Implement Supabase Storage upload
        // For now, we'll skip image upload
        // postData.imageUrl = await uploadImage(formData.imageFile);
      }

      // Call parent submit handler
      await onSubmit(postData);

      // Modal will be closed by parent on success
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* ═══════════════════════════════════════════════════════════
            MODAL HEADER
            ═══════════════════════════════════════════════════════════ */}
        <div className="modal-header">
          <h2 className="modal-title">Tạo bài viết mới</h2>
          <button className="modal-close-btn" onClick={onClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            MODAL BODY
            ═══════════════════════════════════════════════════════════ */}
        <form className="modal-body" onSubmit={handleSubmit}>
          {/* User Info */}
          <div className="post-author-info">
            <div className="author-avatar">
              {currentUser?.user_metadata?.avatar_url ? (
                <img
                  src={currentUser.user_metadata.avatar_url}
                  alt={currentUser.user_metadata?.display_name || currentUser.email}
                />
              ) : (
                <div className="avatar-placeholder">
                  {(currentUser?.user_metadata?.display_name || currentUser?.email)?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="author-details">
              <span className="author-name">
                {currentUser?.user_metadata?.display_name || currentUser?.email}
              </span>
              <div className="category-select">
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  disabled={loading}
                >
                  {forumCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Title Input */}
          <input
            type="text"
            className="post-title-input"
            placeholder="Tiêu đề bài viết (tối đa 200 ký tự)"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            maxLength={200}
            disabled={loading}
          />

          {/* Content Textarea */}
          <textarea
            className="post-content-input"
            placeholder="Chia sẻ kinh nghiệm, phân tích hoặc câu hỏi của bạn..."
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            maxLength={5000}
            rows={6}
            disabled={loading}
          />

          {/* Character Count */}
          <div className="char-count">
            {formData.content.length}/5000
          </div>

          {/* Image Preview */}
          {formData.imagePreview && (
            <div className="image-preview">
              <img src={formData.imagePreview} alt="Preview" />
              <button
                type="button"
                className="remove-image-btn"
                onClick={handleRemoveImage}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Trading Data Toggle */}
          <button
            type="button"
            className="toggle-trading-data-btn"
            onClick={() => setShowTradingData(!showTradingData)}
            disabled={loading}
          >
            <TrendingUp size={18} />
            <span>{showTradingData ? 'Ẩn' : 'Thêm'} thông tin trade</span>
          </button>

          {/* Trading Data Inputs */}
          {showTradingData && (
            <div className="trading-data-inputs">
              <div className="input-row">
                <div className="input-group">
                  <label>Entry Price</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.tradeEntry}
                    onChange={(e) => handleChange('tradeEntry', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="input-group">
                  <label>Stop Loss</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.tradeSL}
                    onChange={(e) => handleChange('tradeSL', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Take Profit</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.tradeTP}
                    onChange={(e) => handleChange('tradeTP', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="input-group">
                  <label>Risk:Reward</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.tradeRR}
                    onChange={(e) => handleChange('tradeRR', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              MODAL FOOTER
              ═══════════════════════════════════════════════════════════ */}
          <div className="modal-footer">
            {/* Image Upload Button */}
            <label className="image-upload-btn" htmlFor="image-upload">
              <ImageIcon size={20} />
              <span>Ảnh</span>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={loading}
                style={{ display: 'none' }}
              />
            </label>

            <div className="footer-actions">
              {/* Cancel Button */}
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-btn"
                disabled={loading || !formData.title.trim() || !formData.content.trim()}
              >
                {loading ? (
                  <>
                    <Loader size={20} className="spinner" />
                    Đang đăng...
                  </>
                ) : (
                  'Đăng bài'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
