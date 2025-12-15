import React, { useState, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  TrendingUp,
  ChevronDown,
  Loader,
  Globe,
  Lock,
  UserCheck,
  ShoppingBag,
  Music,
  Plus,
  Crop,
  Check
} from 'lucide-react';
import forumService, { forumCategories } from '../../../services/forum';
import './PostCreationModal.css';

/**
 * PostCreationModal Component - SYNCED FROM MOBILE CreatePostScreen
 * Modal for creating new posts
 *
 * Features (synced from Mobile):
 * - Title auto-extract from first line
 * - Content with @mention and #hashtag support
 * - Topic/Category selection (Giao dịch, Tinh thần, Thịnh vượng)
 * - Multi-image upload (up to 10 images)
 * - Audience selection (Public, Followers, Private)
 * - Product linking
 * - Trading data inputs (Entry, SL, TP, R:R)
 * - Form validation
 * - Loading states
 */

// Topic definitions synced from Mobile
const MAIN_TOPICS = [
  { id: 'giao-dich', name: 'GIAO DỊCH', color: '#00F0FF', icon: '🎯' },
  { id: 'tinh-than', name: 'TINH THẦN', color: '#6A5BFF', icon: '☯️' },
  { id: 'thinh-vuong', name: 'THỊNH VƯỢNG', color: '#FFBD59', icon: '🌟' },
];

const ADMIN_TOPICS = [
  { id: 'affiliate', name: 'AFFILIATE', color: '#FF6B6B', icon: '💰', feedType: 'affiliate' },
  { id: 'tin-tuc', name: 'TIN TỨC', color: '#4ECDC4', icon: '📰', feedType: 'news' },
  { id: 'thong-bao', name: 'THÔNG BÁO', color: '#FFE66D', icon: '📢', feedType: 'announcement' },
  { id: 'academy', name: 'ACADEMY', color: '#A855F7', icon: '🎓', feedType: 'academy' },
];

const AUDIENCE_OPTIONS = [
  { id: 'public', label: 'Công khai', description: 'Mọi người đều thấy', icon: Globe, color: '#00FF88' },
  { id: 'followers', label: 'Followers', description: 'Chỉ người theo dõi', icon: UserCheck, color: '#8B5CF6' },
  { id: 'private', label: 'Riêng tư', description: 'Chỉ mình bạn thấy', icon: Lock, color: '#FF6B6B' },
];

const MAX_IMAGES = 10;

export default function PostCreationModal({
  onClose,
  onSubmit,
  currentUser,
  isAdmin = false
}) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    content: '', // First line auto-becomes title
    selectedTopic: null,
    audience: 'public',
    // Trading data (optional)
    tradeEntry: '',
    tradeSL: '',
    tradeTP: '',
    tradeRR: ''
  });

  // Multi-image state
  const [selectedImages, setSelectedImages] = useState([]); // Array of { file, preview }

  // UI state
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [showAudiencePicker, setShowAudiencePicker] = useState(false);
  const [showTradingData, setShowTradingData] = useState(false);
  const [linkedProduct, setLinkedProduct] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get available topics based on user role
  const availableTopics = isAdmin
    ? [...MAIN_TOPICS, ...ADMIN_TOPICS]
    : MAIN_TOPICS;

  /**
   * Handle content change
   */
  const handleContentChange = (value) => {
    setFormData({ ...formData, content: value });
    setError('');
  };

  /**
   * Handle multi-image select
   */
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - selectedImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    // Validate files
    const validFiles = filesToAdd.filter(file => {
      if (!file.type.startsWith('image/')) {
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        return false;
      }
      return true;
    });

    if (validFiles.length < filesToAdd.length) {
      setError('Một số ảnh không hợp lệ (chỉ chấp nhận ảnh dưới 5MB)');
    }

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages(prev => [
          ...prev,
          { file, preview: reader.result }
        ].slice(0, MAX_IMAGES));
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Remove image at index
   */
  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Extract title and content from input
   */
  const extractTitleAndContent = () => {
    const lines = formData.content.trim().split('\n');
    const title = lines[0]?.substring(0, 100) || '';
    const body = lines.length > 1 ? lines.slice(1).join('\n').trim() : lines[0];
    return { title, body };
  };

  /**
   * Extract hashtags from text
   */
  const extractHashtags = (text) => {
    const regex = /#([\w\u00C0-\u024F\u1E00-\u1EFF]+)/g;
    const matches = text.match(regex) || [];
    return [...new Set(matches.map(m => m.slice(1).toLowerCase()))];
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const { title, body } = extractTitleAndContent();

    if (!title.trim()) {
      setError('Vui lòng nhập nội dung (dòng đầu tiên sẽ là tiêu đề)');
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

      const { title, body } = extractTitleAndContent();
      const hashtags = extractHashtags(formData.content);

      // Determine feed_type based on selected topic
      let feedType = 'general';
      if (formData.selectedTopic?.feedType) {
        feedType = formData.selectedTopic.feedType;
      }

      // Prepare post data
      const postData = {
        title: title,
        content: body || title,
        category: formData.selectedTopic?.id || 'general',
        hashtags,
        feedType,
        audience: formData.audience,
        // Optional trading data
        tradeEntry: formData.tradeEntry ? parseFloat(formData.tradeEntry) : null,
        tradeSL: formData.tradeSL ? parseFloat(formData.tradeSL) : null,
        tradeTP: formData.tradeTP ? parseFloat(formData.tradeTP) : null,
        tradeRR: formData.tradeRR ? parseFloat(formData.tradeRR) : null,
        // Linked product
        linkedProductId: linkedProduct?.id || null
      };

      // TODO: Upload images if present
      // if (selectedImages.length > 0) {
      //   const mediaUrls = await uploadImages(selectedImages);
      //   postData.mediaUrls = mediaUrls;
      //   postData.imageUrl = mediaUrls[0];
      // }

      await onSubmit(postData);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const currentAudience = AUDIENCE_OPTIONS.find(a => a.id === formData.audience);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-post-modal" onClick={(e) => e.stopPropagation()}>
        {/* ═══════════════════════════════════════════════════════════
            MODAL HEADER
            ═══════════════════════════════════════════════════════════ */}
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose} disabled={loading}>
            <X size={24} />
          </button>
          <h2 className="modal-title">Tạo bài viết</h2>
          <button
            type="submit"
            className="submit-btn-header"
            disabled={loading || !formData.content.trim()}
            onClick={handleSubmit}
          >
            {loading ? <Loader size={18} className="spinner" /> : 'Đăng'}
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            MODAL BODY
            ═══════════════════════════════════════════════════════════ */}
        <div className="modal-body">
          {/* Topic Selector */}
          <div className="topic-selector">
            <button
              type="button"
              className="topic-selector-btn"
              onClick={() => setShowTopicPicker(!showTopicPicker)}
            >
              <span className="topic-label">CHỦ ĐỀ</span>
              <span
                className="topic-value"
                style={formData.selectedTopic ? { color: formData.selectedTopic.color } : {}}
              >
                {formData.selectedTopic
                  ? `${formData.selectedTopic.icon} ${formData.selectedTopic.name}`
                  : 'Chọn chủ đề'
                }
              </span>
              <ChevronDown size={18} />
            </button>

            {showTopicPicker && (
              <div className="topic-picker-dropdown">
                <button
                  className={`topic-option ${!formData.selectedTopic ? 'active' : ''}`}
                  onClick={() => {
                    setFormData({ ...formData, selectedTopic: null });
                    setShowTopicPicker(false);
                  }}
                >
                  <span>Không chọn</span>
                  {!formData.selectedTopic && <Check size={16} />}
                </button>

                {availableTopics.map((topic) => (
                  <button
                    key={topic.id}
                    className={`topic-option ${formData.selectedTopic?.id === topic.id ? 'active' : ''}`}
                    onClick={() => {
                      setFormData({ ...formData, selectedTopic: topic });
                      setShowTopicPicker(false);
                    }}
                  >
                    <span className="topic-dot" style={{ backgroundColor: topic.color }} />
                    <span style={{ color: topic.color }}>
                      {topic.icon} {topic.name}
                    </span>
                    {topic.feedType && <span className="admin-badge">ADMIN</span>}
                    {formData.selectedTopic?.id === topic.id && <Check size={16} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content Textarea */}
          <div className="content-input-wrapper">
            <textarea
              className="post-content-input"
              placeholder="Dòng đầu tiên sẽ là tiêu đề...&#10;&#10;Viết nội dung bài viết của bạn...&#10;&#10;Dùng @ để tag người dùng, # để thêm hashtag"
              value={formData.content}
              onChange={(e) => handleContentChange(e.target.value)}
              maxLength={5000}
              rows={8}
              disabled={loading}
            />
            <p className="input-hint">
              Dòng đầu tiên sẽ tự động trở thành tiêu đề. Dùng @ để tag, # cho hashtag
            </p>
          </div>

          {/* Character Count */}
          <div className="char-count">
            {formData.content.length}/5000
          </div>

          {/* ═══════════════════════════════════════════════════════════
              CREATOR TOOLBAR - Audience, Product
              ═══════════════════════════════════════════════════════════ */}
          <div className="creator-toolbar">
            {/* Audience Picker */}
            <div className="toolbar-item">
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => setShowAudiencePicker(!showAudiencePicker)}
              >
                {currentAudience && (
                  <>
                    <currentAudience.icon size={18} style={{ color: currentAudience.color }} />
                    <span>{currentAudience.label}</span>
                    <ChevronDown size={14} />
                  </>
                )}
              </button>

              {showAudiencePicker && (
                <div className="audience-dropdown">
                  {AUDIENCE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      className={`audience-option ${formData.audience === option.id ? 'active' : ''}`}
                      onClick={() => {
                        setFormData({ ...formData, audience: option.id });
                        setShowAudiencePicker(false);
                      }}
                    >
                      <option.icon size={18} style={{ color: option.color }} />
                      <div className="audience-option-text">
                        <span className="audience-option-label">{option.label}</span>
                        <span className="audience-option-desc">{option.description}</span>
                      </div>
                      {formData.audience === option.id && <Check size={16} className="check-icon" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Link Button */}
            <button
              type="button"
              className={`toolbar-btn ${linkedProduct ? 'active' : ''}`}
              onClick={() => alert('Tính năng gắn sản phẩm sẽ sớm được ra mắt!')}
            >
              <ShoppingBag size={18} />
              <span>{linkedProduct ? 'Đã gắn' : 'Gắn SP'}</span>
            </button>
          </div>

          {/* Linked Product Display */}
          {linkedProduct && (
            <div className="linked-product-card">
              <ShoppingBag size={18} />
              <div className="linked-product-info">
                <span className="linked-product-name">{linkedProduct.title}</span>
                <span className="linked-product-price">{linkedProduct.price}</span>
              </div>
              <button
                type="button"
                onClick={() => setLinkedProduct(null)}
                className="remove-product-btn"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              MULTI-IMAGE UPLOAD
              ═══════════════════════════════════════════════════════════ */}
          <div className="image-upload-section">
            <div className="section-label">
              ẢNH ĐÍNH KÈM ({selectedImages.length}/{MAX_IMAGES})
            </div>

            {selectedImages.length > 0 ? (
              <div className="image-gallery">
                {selectedImages.map((img, index) => (
                  <div key={index} className="gallery-image-container">
                    <img src={img.preview} alt={`Image ${index + 1}`} className="gallery-image" />
                    {index === 0 && <span className="cover-badge">BÌA</span>}
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {selectedImages.length < MAX_IMAGES && (
                  <label className="add-more-btn">
                    <Plus size={24} />
                    <span>Thêm</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            ) : (
              <label className="add-media-btn">
                <ImageIcon size={32} />
                <span className="add-media-text">Thêm ảnh (tối đa {MAX_IMAGES})</span>
                <span className="add-media-hint">Chạm để chọn từ thư viện</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

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
                    onChange={(e) => setFormData({ ...formData, tradeEntry: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, tradeSL: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, tradeTP: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, tradeRR: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
}
