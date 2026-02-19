import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { forumService, forumCategories } from '../../services/forum';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
  PenLine,
  ClipboardList,
  Send,
  Clock,
  Calendar,
  Link2,
  AtSign,
  X,
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import './Forum.css';

/**
 * CreateThread - ENHANCED
 * - @mention support with autocomplete dropdown
 * - Link preview auto-detection
 * - Schedule post option (date/time picker)
 * - Image attachment placeholder
 * - Preview mode toggle
 */
export default function CreateThread() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const contentRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Schedule state
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Mention state
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionResults, setMentionResults] = useState([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionCursorPos, setMentionCursorPos] = useState(0);

  // Link preview state
  const [detectedLinks, setDetectedLinks] = useState([]);

  // Preview mode
  const [showPreview, setShowPreview] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Detect links in content
  useEffect(() => {
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
    const matches = formData.content.match(urlRegex) || [];
    const unique = [...new Set(matches)];
    setDetectedLinks(unique.slice(0, 3)); // Max 3 previews
  }, [formData.content]);

  // Search users for @mention
  const searchMentionUsers = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setMentionResults([]);
      setShowMentionDropdown(false);
      return;
    }
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .ilike('display_name', `%${query}%`)
        .limit(5);
      if (data && data.length > 0) {
        setMentionResults(data);
        setShowMentionDropdown(true);
      } else {
        setMentionResults([]);
        setShowMentionDropdown(false);
      }
    } catch {
      setMentionResults([]);
      setShowMentionDropdown(false);
    }
  }, []);

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

    if (scheduleEnabled) {
      if (!scheduledDate) {
        newErrors.scheduledDate = 'Vui lòng chọn ngày đăng';
      }
      if (!scheduledTime) {
        newErrors.scheduledTime = 'Vui lòng chọn giờ đăng';
      }
      // Check if scheduled time is in the future
      if (scheduledDate && scheduledTime) {
        const scheduled = new Date(`${scheduledDate}T${scheduledTime}`);
        if (scheduled <= new Date()) {
          newErrors.scheduledDate = 'Thời gian hẹn phải ở tương lai';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      if (scheduleEnabled && scheduledDate && scheduledTime) {
        // Save to scheduled_posts table
        const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
        await supabase.from('scheduled_posts').insert({
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          category: formData.category,
          tags,
          scheduled_at: scheduledAt,
          status: 'pending'
        });
        navigate('/forum/scheduled');
      } else {
        // Create immediately
        const newThread = await forumService.createThread({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          authorId: user.id,
          tags
        });
        navigate(`/forum/thread/${newThread.id}`);
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Không thể tạo chủ đề. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle content change with @mention detection
  const handleContentChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    handleChange('content', value);

    // Detect @mention trigger
    const textBeforeCursor = value.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w{2,})$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionCursorPos(cursorPos);
      searchMentionUsers(mentionMatch[1]);
    } else {
      setShowMentionDropdown(false);
      setMentionQuery('');
    }
  };

  // Insert mention into content
  const insertMention = (user_) => {
    const content = formData.content;
    const beforeMention = content.substring(0, mentionCursorPos - mentionQuery.length - 1);
    const afterMention = content.substring(mentionCursorPos);
    const newContent = `${beforeMention}@${user_.display_name} ${afterMention}`;

    handleChange('content', newContent);
    setShowMentionDropdown(false);
    setMentionQuery('');

    // Refocus textarea
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.focus();
        const newPos = beforeMention.length + user_.display_name.length + 2;
        contentRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  // Remove detected link
  const removeLink = (link) => {
    setDetectedLinks(prev => prev.filter(l => l !== link));
  };

  // Get min date for schedule (today)
  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  if (!user) return null;

  return (
    <div className="forum-page create-thread-page">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate('/forum')} title="Quay lại">
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

          {/* Content Textarea with @mention support */}
          <div className="form-group" style={{ position: 'relative' }}>
            <div className="form-label-row">
              <label htmlFor="content" className="form-label">
                Nội Dung <span className="required">*</span>
              </label>
              <button
                type="button"
                className="preview-toggle-btn"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye size={14} />
                {showPreview ? 'Soạn thảo' : 'Xem trước'}
              </button>
            </div>

            {showPreview ? (
              <div className="content-preview">
                {formData.content || 'Chưa có nội dung...'}
              </div>
            ) : (
              <>
                <textarea
                  ref={contentRef}
                  id="content"
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder={"Nhập nội dung chi tiết...\n\nMẹo: Dùng @ để tag thành viên, dán link sẽ tự động được nhận diện!"}
                  className={`form-textarea ${errors.content ? 'error' : ''}`}
                  rows={12}
                  disabled={submitting}
                />

                {/* Mention helper text */}
                <div className="content-helpers">
                  <span className="helper-tag">
                    <AtSign size={12} />
                    <span>@tên để tag</span>
                  </span>
                  <span className="helper-tag">
                    <Link2 size={12} />
                    <span>Dán link tự động</span>
                  </span>
                </div>

                {/* @mention dropdown */}
                {showMentionDropdown && mentionResults.length > 0 && (
                  <div className="mention-dropdown">
                    {mentionResults.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className="mention-option"
                        onClick={() => insertMention(u)}
                      >
                        <div className="mention-avatar">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.display_name} />
                          ) : (
                            <div className="avatar-placeholder-sm">
                              {(u.display_name || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="mention-name">{u.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {errors.content && (
              <span className="error-message">{errors.content}</span>
            )}
            <span className="char-count">
              {formData.content.length} ky tu
            </span>
          </div>

          {/* Detected Links Preview */}
          {detectedLinks.length > 0 && (
            <div className="form-group">
              <label className="form-label">
                <Link2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                Link được phát hiện
              </label>
              <div className="detected-links">
                {detectedLinks.map((link, i) => (
                  <div key={i} className="detected-link-item">
                    <Link2 size={14} className="link-icon" />
                    <span className="link-url">{link.length > 60 ? link.substring(0, 60) + '...' : link}</span>
                    <button
                      type="button"
                      className="remove-link-btn"
                      onClick={() => removeLink(link)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Schedule Option */}
          <div className="form-group schedule-section">
            <label className="schedule-toggle">
              <input
                type="checkbox"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
                disabled={submitting}
              />
              <Clock size={16} />
              <span>Hẹn giờ đăng bài</span>
            </label>

            {scheduleEnabled && (
              <div className="schedule-inputs">
                <div className="schedule-field">
                  <Calendar size={14} />
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => {
                      setScheduledDate(e.target.value);
                      if (errors.scheduledDate) setErrors(prev => ({ ...prev, scheduledDate: null }));
                    }}
                    min={getMinDate()}
                    className={`schedule-date-input ${errors.scheduledDate ? 'error' : ''}`}
                    disabled={submitting}
                  />
                  {errors.scheduledDate && (
                    <span className="error-message">{errors.scheduledDate}</span>
                  )}
                </div>
                <div className="schedule-field">
                  <Clock size={14} />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => {
                      setScheduledTime(e.target.value);
                      if (errors.scheduledTime) setErrors(prev => ({ ...prev, scheduledTime: null }));
                    }}
                    className={`schedule-time-input ${errors.scheduledTime ? 'error' : ''}`}
                    disabled={submitting}
                  />
                  {errors.scheduledTime && (
                    <span className="error-message">{errors.scheduledTime}</span>
                  )}
                </div>
              </div>
            )}
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
              ) : scheduleEnabled ? (
                <>
                  <Clock size={20} />
                  Hẹn Giờ Đăng
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
          <li>
            <strong>Tag thành viên:</strong> Dùng @tên để tag trực tiếp người bạn muốn hỏi
          </li>
        </ul>
      </div>
    </div>
  );
}
