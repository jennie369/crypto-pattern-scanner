import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  Plus,
  Check,
  Calendar,
  Eye,
  Link as LinkIcon
} from 'lucide-react';
import forumService, { forumCategories } from '../../../services/forum';
import MentionInput from './MentionInput';
import LinkPreviewCard from './LinkPreviewCard';
import './PostCreationModal.css';

/**
 * PostCreationModal Component - Enhanced with mentions, link preview, schedule, preview mode
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

/**
 * URL extraction regex
 */
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;

export default function PostCreationModal({
  onClose,
  onSubmit,
  currentUser,
  isAdmin = false
}) {
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const [formData, setFormData] = useState({
    content: '',
    selectedTopic: null,
    audience: 'public',
    tradeEntry: '',
    tradeSL: '',
    tradeTP: '',
    tradeRR: '',
    tags: []
  });

  // Multi-image state
  const [selectedImages, setSelectedImages] = useState([]);

  // UI state
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [showAudiencePicker, setShowAudiencePicker] = useState(false);
  const [showTradingData, setShowTradingData] = useState(false);
  const [linkedProduct, setLinkedProduct] = useState(null);
  const [mentions, setMentions] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Schedule state
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Link preview
  const [detectedUrl, setDetectedUrl] = useState(null);
  const [linkPreview, setLinkPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Tag input
  const [tagInput, setTagInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableTopics = isAdmin
    ? [...MAIN_TOPICS, ...ADMIN_TOPICS]
    : MAIN_TOPICS;

  /**
   * Auto-detect URLs in content for link preview
   */
  useEffect(() => {
    const urls = formData.content.match(URL_REGEX);
    const firstUrl = urls?.[0] || null;

    if (firstUrl && firstUrl !== detectedUrl) {
      setDetectedUrl(firstUrl);
      // Fetch link preview (mock — real implementation uses edge function)
      setLoadingPreview(true);
      setLinkPreview(null);
      // Simulate preview fetch with timeout
      const timeout = setTimeout(() => {
        try {
          const domain = new URL(firstUrl).hostname.replace('www.', '');
          setLinkPreview({
            url: firstUrl,
            domain,
            title: null,
            description: null,
            image: null
          });
        } catch {
          setLinkPreview(null);
        }
        setLoadingPreview(false);
      }, 500);
      return () => clearTimeout(timeout);
    } else if (!firstUrl) {
      setDetectedUrl(null);
      setLinkPreview(null);
    }
  }, [formData.content, detectedUrl]);

  /**
   * Handle content change from MentionInput
   */
  const handleContentChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
    setError('');
  };

  /**
   * Handle multi-image select
   */
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    addImageFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /**
   * Add image files (from input or drag-drop)
   */
  const addImageFiles = (files) => {
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - selectedImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const validFiles = filesToAdd.filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 5 * 1024 * 1024) return false;
      return true;
    });

    if (validFiles.length < filesToAdd.length) {
      setError('Một số ảnh không hợp lệ (chỉ chấp nhận ảnh dưới 5MB)');
    }

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
  };

  /**
   * Drag and drop handlers
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    addImageFiles(files.filter(f => f.type.startsWith('image/')));
  };

  /**
   * Remove image at index
   */
  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Add tag
   */
  const handleAddTag = () => {
    const tag = tagInput.trim().replace(/^#/, '');
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  };

  /**
   * Remove tag
   */
  const handleRemoveTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  /**
   * Extract title and content
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
    const { title } = extractTitleAndContent();
    if (!title.trim()) {
      setError('Vui lòng nhập nội dung (dòng đầu tiên sẽ là tiêu đề)');
      return false;
    }
    if (formData.content.length > 5000) {
      setError('Nội dung không được vượt quá 5000 ký tự');
      return false;
    }
    if (isScheduled && (!scheduleDate || !scheduleTime)) {
      setError('Vui lòng chọn ngày và giờ đăng bài');
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
      const hashtags = [...extractHashtags(formData.content), ...formData.tags];

      let feedType = 'general';
      if (formData.selectedTopic?.feedType) {
        feedType = formData.selectedTopic.feedType;
      }

      const postData = {
        title,
        content: body || title,
        category: formData.selectedTopic?.id || 'general',
        hashtags: [...new Set(hashtags)],
        feedType,
        audience: formData.audience,
        tradeEntry: formData.tradeEntry ? parseFloat(formData.tradeEntry) : null,
        tradeSL: formData.tradeSL ? parseFloat(formData.tradeSL) : null,
        tradeTP: formData.tradeTP ? parseFloat(formData.tradeTP) : null,
        tradeRR: formData.tradeRR ? parseFloat(formData.tradeRR) : null,
        linkedProductId: linkedProduct?.id || null,
        mentions,
        linkPreview: linkPreview?.url ? linkPreview : null,
      };

      // Schedule data
      if (isScheduled && scheduleDate && scheduleTime) {
        postData.scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
      }

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
          <div className="modal-header-actions">
            <button
              type="button"
              className={`preview-toggle-btn ${previewMode ? 'active' : ''}`}
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye size={16} />
              {previewMode ? 'Soạn' : 'Xem trước'}
            </button>
            <button
              type="submit"
              className="submit-btn-header"
              disabled={loading || !formData.content.trim()}
              onClick={handleSubmit}
            >
              {loading ? <Loader size={18} className="spinner" /> : (isScheduled ? 'Lên lịch' : 'Đăng')}
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            MODAL BODY
            ═══════════════════════════════════════════════════════════ */}
        <div className="modal-body">
          {previewMode ? (
            /* ══════════ PREVIEW MODE ══════════ */
            <div className="post-preview">
              <div className="post-preview-header">
                <div className="post-preview-avatar">
                  {currentUser?.avatar_url ? (
                    <img src={currentUser.avatar_url} alt={currentUser.full_name} />
                  ) : (
                    <span>{(currentUser?.full_name || 'U')[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="post-preview-author">
                  <span className="post-preview-name">{currentUser?.full_name || 'Bạn'}</span>
                  <span className="post-preview-meta">Vừa xong</span>
                </div>
              </div>
              <div className="post-preview-content">
                <p style={{ whiteSpace: 'pre-wrap' }}>{formData.content || 'Nội dung bài viết...'}</p>
              </div>
              {selectedImages.length > 0 && (
                <div className="post-preview-images">
                  <img src={selectedImages[0].preview} alt="Preview" />
                  {selectedImages.length > 1 && (
                    <span className="post-preview-image-count">+{selectedImages.length - 1}</span>
                  )}
                </div>
              )}
              {linkPreview && (
                <LinkPreviewCard
                  url={linkPreview.url}
                  title={linkPreview.title}
                  description={linkPreview.description}
                  image={linkPreview.image}
                  domain={linkPreview.domain}
                  loading={loadingPreview}
                />
              )}
            </div>
          ) : (
            /* ══════════ EDIT MODE ══════════ */
            <>
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
                      onClick={() => { setFormData(prev => ({ ...prev, selectedTopic: null })); setShowTopicPicker(false); }}
                    >
                      <span>Không chọn</span>
                      {!formData.selectedTopic && <Check size={16} />}
                    </button>
                    {availableTopics.map((topic) => (
                      <button
                        key={topic.id}
                        className={`topic-option ${formData.selectedTopic?.id === topic.id ? 'active' : ''}`}
                        onClick={() => { setFormData(prev => ({ ...prev, selectedTopic: topic })); setShowTopicPicker(false); }}
                      >
                        <span className="topic-dot" style={{ backgroundColor: topic.color }} />
                        <span style={{ color: topic.color }}>{topic.icon} {topic.name}</span>
                        {topic.feedType && <span className="admin-badge">ADMIN</span>}
                        {formData.selectedTopic?.id === topic.id && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Content - MentionInput */}
              <div className="content-input-wrapper">
                <MentionInput
                  value={formData.content}
                  onChange={handleContentChange}
                  onMentionsChange={setMentions}
                  placeholder={"Dòng đầu tiên sẽ là tiêu đề...\n\nViết nội dung bài viết của bạn...\n\nDùng @ để tag người dùng, # để thêm hashtag"}
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

              {/* Detected Link Preview */}
              {(linkPreview || loadingPreview) && (
                <div className="detected-link-preview">
                  <div className="detected-link-header">
                    <LinkIcon size={14} />
                    <span>Xem trước liên kết</span>
                    <button
                      className="detected-link-remove"
                      onClick={() => { setLinkPreview(null); setDetectedUrl(null); }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <LinkPreviewCard
                    url={linkPreview?.url || detectedUrl}
                    title={linkPreview?.title}
                    description={linkPreview?.description}
                    image={linkPreview?.image}
                    domain={linkPreview?.domain}
                    loading={loadingPreview}
                  />
                </div>
              )}

              {/* Tag Input */}
              {formData.tags.length > 0 && (
                <div className="tags-display">
                  {formData.tags.map(tag => (
                    <span key={tag} className="tag-chip">
                      #{tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="tag-input-wrapper">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  placeholder="Thêm tag (Enter để thêm)"
                  className="tag-input"
                  disabled={loading}
                />
              </div>

              {/* Creator Toolbar */}
              <div className="creator-toolbar">
                {/* Audience */}
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
                          onClick={() => { setFormData(prev => ({ ...prev, audience: option.id })); setShowAudiencePicker(false); }}
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

                {/* Schedule toggle */}
                <button
                  type="button"
                  className={`toolbar-btn ${isScheduled ? 'active' : ''}`}
                  onClick={() => setIsScheduled(!isScheduled)}
                >
                  <Calendar size={18} />
                  <span>{isScheduled ? 'Lên lịch' : 'Đăng ngay'}</span>
                </button>

                {/* Product Link */}
                <button
                  type="button"
                  className={`toolbar-btn ${linkedProduct ? 'active' : ''}`}
                  onClick={() => alert('Tính năng gắn sản phẩm sẽ sớm được ra mắt!')}
                >
                  <ShoppingBag size={18} />
                  <span>{linkedProduct ? 'Đã gắn' : 'Gắn SP'}</span>
                </button>
              </div>

              {/* Schedule date/time picker */}
              {isScheduled && (
                <div className="schedule-picker">
                  <div className="schedule-picker-label">
                    <Calendar size={16} />
                    <span>Lên lịch đăng bài</span>
                  </div>
                  <div className="schedule-inputs">
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="schedule-date-input"
                    />
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="schedule-time-input"
                    />
                  </div>
                </div>
              )}

              {/* Linked Product Display */}
              {linkedProduct && (
                <div className="linked-product-card">
                  <ShoppingBag size={18} />
                  <div className="linked-product-info">
                    <span className="linked-product-name">{linkedProduct.title}</span>
                    <span className="linked-product-price">{linkedProduct.price}</span>
                  </div>
                  <button type="button" onClick={() => setLinkedProduct(null)} className="remove-product-btn">
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Multi-Image Upload with Drag-and-Drop */}
              <div
                className={`image-upload-section ${isDragging ? 'dragging' : ''}`}
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="section-label">
                  ẢNH ĐÍNH KÈM ({selectedImages.length}/{MAX_IMAGES})
                </div>

                {selectedImages.length > 0 ? (
                  <div className="image-gallery">
                    {selectedImages.map((img, index) => (
                      <div key={index} className="gallery-image-container">
                        <img src={img.preview} alt={`Ảnh ${index + 1}`} className="gallery-image" />
                        {index === 0 && <span className="cover-badge">BÌA</span>}
                        <button type="button" className="remove-image-btn" onClick={() => handleRemoveImage(index)}>
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
                    <span className="add-media-text">Kéo thả hoặc chọn ảnh (tối đa {MAX_IMAGES})</span>
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
                        onChange={(e) => setFormData(prev => ({ ...prev, tradeEntry: e.target.value }))}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, tradeSL: e.target.value }))}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, tradeTP: e.target.value }))}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, tradeRR: e.target.value }))}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
}
