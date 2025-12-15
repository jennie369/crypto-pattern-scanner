/**
 * LessonEditor - Create/Edit Lesson
 * Supports video, article (with HTML import), and quiz types
 * Enhanced with full HTML editing toolbar and copy-paste support
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Video,
  FileText,
  HelpCircle,
  Upload,
  Code,
  Loader2,
  AlertCircle,
  Check,
  X,
  Link,
  Clock,
  ToggleLeft,
  ToggleRight,
  FileUp,
  Trash2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Quote,
  Copy,
  ClipboardPaste,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
  Table,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { lessonService } from '../../services/lessonService';
import { courseService } from '../../services/courseService';
import './LessonEditor.css';

const LESSON_TYPES = [
  { value: 'video', label: 'Video', icon: Video, description: 'Bài học dạng video' },
  { value: 'article', label: 'Bài viết', icon: FileText, description: 'Bài viết với HTML' },
  { value: 'quiz', label: 'Bài kiểm tra', icon: HelpCircle, description: 'Quiz trắc nghiệm' },
];

// HTML Toolbar buttons configuration
const HTML_TOOLBAR = [
  { group: 'history', items: [
    { id: 'undo', icon: Undo, title: 'Hoàn tác', tag: null },
    { id: 'redo', icon: Redo, title: 'Làm lại', tag: null },
  ]},
  { group: 'headings', items: [
    { id: 'h1', icon: Heading1, title: 'Tiêu đề 1', tag: '<h1>', closeTag: '</h1>' },
    { id: 'h2', icon: Heading2, title: 'Tiêu đề 2', tag: '<h2>', closeTag: '</h2>' },
    { id: 'h3', icon: Heading3, title: 'Tiêu đề 3', tag: '<h3>', closeTag: '</h3>' },
  ]},
  { group: 'format', items: [
    { id: 'bold', icon: Bold, title: 'In đậm', tag: '<strong>', closeTag: '</strong>' },
    { id: 'italic', icon: Italic, title: 'In nghiêng', tag: '<em>', closeTag: '</em>' },
    { id: 'underline', icon: Underline, title: 'Gạch chân', tag: '<u>', closeTag: '</u>' },
  ]},
  { group: 'lists', items: [
    { id: 'ul', icon: List, title: 'Danh sách', tag: '<ul>\n  <li>', closeTag: '</li>\n</ul>' },
    { id: 'ol', icon: ListOrdered, title: 'Danh sách có số', tag: '<ol>\n  <li>', closeTag: '</li>\n</ol>' },
  ]},
  { group: 'blocks', items: [
    { id: 'quote', icon: Quote, title: 'Trích dẫn', tag: '<blockquote>', closeTag: '</blockquote>' },
    { id: 'code', icon: Code, title: 'Code', tag: '<pre><code>', closeTag: '</code></pre>' },
  ]},
  { group: 'media', items: [
    { id: 'image', icon: Image, title: 'Hình ảnh', tag: '<img src="', closeTag: '" alt="" />' },
    { id: 'link', icon: Link2, title: 'Liên kết', tag: '<a href="', closeTag: '">Link</a>' },
    { id: 'table', icon: Table, title: 'Bảng', tag: '<table>\n  <tr>\n    <th>Cột 1</th>\n    <th>Cột 2</th>\n  </tr>\n  <tr>\n    <td>', closeTag: '</td>\n    <td></td>\n  </tr>\n</table>' },
  ]},
  { group: 'align', items: [
    { id: 'alignLeft', icon: AlignLeft, title: 'Căn trái', tag: '<div style="text-align: left;">', closeTag: '</div>' },
    { id: 'alignCenter', icon: AlignCenter, title: 'Căn giữa', tag: '<div style="text-align: center;">', closeTag: '</div>' },
    { id: 'alignRight', icon: AlignRight, title: 'Căn phải', tag: '<div style="text-align: right;">', closeTag: '</div>' },
  ]},
];

export default function LessonEditor() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = lessonId && lessonId !== 'new';
  const fileInputRef = useRef(null);
  const htmlInputRef = useRef(null);
  const textareaRef = useRef(null);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [module, setModule] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    lesson_type: 'video',
    video_url: '',
    content_html: '',
    duration_minutes: 0,
    is_preview: false,
    order_index: 0,
  });

  const [errors, setErrors] = useState({});
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Fetch lesson for editing
  const fetchLesson = useCallback(async () => {
    if (!isEditing) {
      // Fetch module info for new lesson
      try {
        const courseData = await courseService.getCourseDetail(courseId);
        const moduleData = courseData?.modules?.find(m => m.id === moduleId);
        setModule(moduleData);
        if (moduleData?.lessons) {
          setFormData(prev => ({ ...prev, order_index: moduleData.lessons.length }));
        }
      } catch (err) {
        console.error('[LessonEditor] Error fetching module:', err);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const lesson = await lessonService.getLesson(lessonId);
      if (!lesson) {
        setError('Không tìm thấy bài học');
        return;
      }

      // Map from DB field names - check ALL possible content columns
      const htmlContent =
        lesson.content ||
        lesson.content_html ||
        lesson.html_content ||
        lesson.article_content ||
        lesson.parsed_content ||
        '';

      setFormData({
        title: lesson.title || '',
        lesson_type: lesson.type || lesson.lesson_type || lesson.content_type || 'video',
        video_url: lesson.video_url || '',
        content_html: htmlContent,
        duration_minutes: lesson.duration_minutes || 0,
        is_preview: lesson.is_preview || lesson.is_free_preview || false,
        order_index: lesson.order_index || 0,
      });

      // Fetch module info
      const courseData = await courseService.getCourseDetail(courseId);
      const moduleData = courseData?.modules?.find(m => m.id === moduleId);
      setModule(moduleData);
    } catch (err) {
      console.error('[LessonEditor] Error:', err);
      setError('Không thể tải thông tin bài học');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, moduleId, lessonId, isEditing]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  // Handle input change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle HTML file import
  const handleHtmlImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setErrors(prev => ({ ...prev, content_html: 'Vui lòng chọn file HTML' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const htmlContent = event.target?.result;
      if (typeof htmlContent === 'string') {
        // Extract body content if full HTML document
        const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const content = bodyMatch ? bodyMatch[1] : htmlContent;
        saveToUndo();
        handleChange('content_html', content.trim());
        setSuccessMessage('Đã import nội dung HTML');
        setTimeout(() => setSuccessMessage(''), 2000);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Save to undo stack
  const saveToUndo = () => {
    setUndoStack(prev => [...prev.slice(-19), formData.content_html]);
    setRedoStack([]);
  };

  // Undo action
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const newUndoStack = [...undoStack];
    const previousValue = newUndoStack.pop();
    setRedoStack(prev => [...prev, formData.content_html]);
    setUndoStack(newUndoStack);
    handleChange('content_html', previousValue);
  };

  // Redo action
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const newRedoStack = [...redoStack];
    const nextValue = newRedoStack.pop();
    setUndoStack(prev => [...prev, formData.content_html]);
    setRedoStack(newRedoStack);
    handleChange('content_html', nextValue);
  };

  // Insert HTML tag at cursor position
  const insertHtmlTag = (item) => {
    if (item.id === 'undo') {
      handleUndo();
      return;
    }
    if (item.id === 'redo') {
      handleRedo();
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    saveToUndo();

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content_html.substring(start, end);
    const beforeText = formData.content_html.substring(0, start);
    const afterText = formData.content_html.substring(end);

    let newText;
    if (selectedText) {
      // Wrap selected text with tags
      newText = beforeText + item.tag + selectedText + item.closeTag + afterText;
    } else {
      // Insert tags at cursor
      newText = beforeText + item.tag + item.closeTag + afterText;
    }

    handleChange('content_html', newText);

    // Set cursor position after the opening tag
    setTimeout(() => {
      const newCursorPos = selectedText
        ? start + item.tag.length + selectedText.length + item.closeTag.length
        : start + item.tag.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Handle paste from clipboard
  const handlePaste = async (e) => {
    // Allow default paste behavior but save to undo
    saveToUndo();
  };

  // Handle paste HTML from clipboard button
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        saveToUndo();
        const textarea = textareaRef.current;
        const start = textarea?.selectionStart || formData.content_html.length;
        const end = textarea?.selectionEnd || formData.content_html.length;
        const beforeText = formData.content_html.substring(0, start);
        const afterText = formData.content_html.substring(end);
        const newText = beforeText + text + afterText;
        handleChange('content_html', newText);
        setSuccessMessage('Đã dán nội dung từ clipboard');
        setTimeout(() => setSuccessMessage(''), 2000);
      }
    } catch (err) {
      console.error('[LessonEditor] Paste error:', err);
      setError('Không thể dán từ clipboard. Vui lòng sử dụng Ctrl+V');
    }
  };

  // Copy HTML to clipboard
  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(formData.content_html);
      setSuccessMessage('Đã copy nội dung HTML');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error('[LessonEditor] Copy error:', err);
      setError('Không thể copy');
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề bài học';
    }

    if (formData.lesson_type === 'video' && !formData.video_url.trim()) {
      newErrors.video_url = 'Vui lòng nhập URL video';
    }

    if (formData.lesson_type === 'article' && !formData.content_html.trim()) {
      newErrors.content_html = 'Vui lòng nhập nội dung bài viết';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async (stayOnPage = false) => {
    if (!validateForm()) return;

    setIsSaving(true);
    setError(null);

    try {
      // Transform to match DB schema
      // DB columns: id, course_id, module_id, title, type, video_url, duration_minutes, order_index, is_preview, content
      const lessonData = {
        title: formData.title,
        type: formData.lesson_type, // DB uses 'type' not 'lesson_type'
        video_url: formData.video_url || null,
        duration_minutes: formData.duration_minutes || 0,
        is_preview: formData.is_preview || false,
        module_id: moduleId,
        course_id: courseId, // Required by DB
      };

      // Save content to html_content column (exists in DB)
      // Also try content column as fallback
      if (formData.content_html && formData.content_html.trim()) {
        lessonData.html_content = formData.content_html;
        // Try multiple columns to ensure it's saved
        lessonData.article_content = formData.content_html;
      }

      let result;
      if (isEditing) {
        result = await lessonService.updateLesson(lessonId, lessonData);
        if (!result.success) throw new Error(result.error);
        setSuccessMessage('Đã lưu thay đổi');
      } else {
        result = await lessonService.createLesson(lessonData);
        if (!result.success) throw new Error(result.error);
        setSuccessMessage('Đã tạo bài học mới');
      }

      setTimeout(() => setSuccessMessage(''), 2000);

      if (!stayOnPage) {
        navigate(`/courses/admin/edit/${courseId}/modules`);
      }
    } catch (err) {
      console.error('[LessonEditor] Save error:', err);
      setError(err.message || 'Không thể lưu bài học');
    } finally {
      setIsSaving(false);
    }
  };

  // Extract video ID from YouTube URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="lesson-editor-page">
        <div className="editor-loading">
          <Loader2 size={48} className="loading-spinner-icon" />
          <p>Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !formData.title && isEditing) {
    return (
      <div className="lesson-editor-page">
        <div className="editor-error">
          <AlertCircle size={48} />
          <h2>{error}</h2>
          <button onClick={() => navigate(`/courses/admin/edit/${courseId}/modules`)} className="btn-back-modules">
            <ArrowLeft size={18} />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-editor-page">
      {/* Header */}
      <div className="editor-header">
        <button
          className="btn-back"
          onClick={() => navigate(`/courses/admin/edit/${courseId}/modules`)}
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>

        <div className="header-title">
          <h1 className="editor-title">
            {LESSON_TYPES.find(t => t.value === formData.lesson_type)?.icon &&
              React.createElement(LESSON_TYPES.find(t => t.value === formData.lesson_type).icon, { size: 24 })}
            {isEditing ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
          </h1>
          {module && (
            <span className="module-name">Chương: {module.title}</span>
          )}
        </div>

        <div className="editor-actions">
          <button
            className="btn-save"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 size={18} className="loading-spinner-icon" /> : <Save size={18} />}
            Lưu
          </button>
          <button
            className="btn-save-exit"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            Lưu & Thoát
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="message-success">
          <Check size={18} />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="message-error">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      {/* Form */}
      <div className="editor-form">
        <div className="form-grid">
          {/* Left Column - Main Content */}
          <div className="form-column">
            {/* Title */}
            <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
              <label className="form-label">
                Tiêu đề bài học <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: Giới thiệu về Candlestick"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                maxLength={200}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Lesson Type */}
            <div className="form-group">
              <label className="form-label">Loại bài học</label>
              <div className="lesson-type-options">
                {LESSON_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`type-option ${formData.lesson_type === type.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="lesson_type"
                      value={type.value}
                      checked={formData.lesson_type === type.value}
                      onChange={(e) => handleChange('lesson_type', e.target.value)}
                    />
                    <type.icon size={24} />
                    <span className="type-label">{type.label}</span>
                    <span className="type-desc">{type.description}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Video URL (for video type) */}
            {formData.lesson_type === 'video' && (
              <div className={`form-group ${errors.video_url ? 'has-error' : ''}`}>
                <label className="form-label">
                  URL Video <span className="required">*</span>
                </label>
                <div className="url-input-wrapper">
                  <Link size={18} className="url-icon" />
                  <input
                    type="url"
                    className="form-input with-icon"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.video_url}
                    onChange={(e) => handleChange('video_url', e.target.value)}
                  />
                </div>
                {errors.video_url && <span className="form-error">{errors.video_url}</span>}
                <span className="form-hint">Hỗ trợ: YouTube, Vimeo, hoặc link video trực tiếp</span>

                {/* Video Preview */}
                {getYouTubeId(formData.video_url) && (
                  <div className="video-preview">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(formData.video_url)}`}
                      title="Video preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}

            {/* HTML Content (for article type) */}
            {formData.lesson_type === 'article' && (
              <div className={`form-group html-editor-container ${errors.content_html ? 'has-error' : ''} ${isFullscreen ? 'fullscreen' : ''}`}>
                <div className="form-label-row">
                  <label className="form-label">
                    Nội dung HTML <span className="required">*</span>
                  </label>
                  <div className="html-actions">
                    <button
                      type="button"
                      className="btn-import-html"
                      onClick={() => htmlInputRef.current?.click()}
                      title="Import từ file HTML"
                    >
                      <FileUp size={16} />
                      Import
                    </button>
                    <input
                      ref={htmlInputRef}
                      type="file"
                      accept=".html,.htm"
                      onChange={handleHtmlImport}
                      hidden
                    />
                    <button
                      type="button"
                      className="btn-copy-html"
                      onClick={handleCopyHtml}
                      title="Copy nội dung"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn-paste-html"
                      onClick={handlePasteFromClipboard}
                      title="Dán từ clipboard"
                    >
                      <ClipboardPaste size={16} />
                    </button>
                    <button
                      type="button"
                      className={`btn-preview-html ${showHtmlPreview ? 'active' : ''}`}
                      onClick={() => setShowHtmlPreview(!showHtmlPreview)}
                    >
                      {showHtmlPreview ? <Code size={16} /> : <Eye size={16} />}
                      {showHtmlPreview ? 'Code' : 'Preview'}
                    </button>
                    <button
                      type="button"
                      className="btn-fullscreen"
                      onClick={toggleFullscreen}
                      title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                    >
                      {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                  </div>
                </div>

                {/* HTML Toolbar */}
                {!showHtmlPreview && (
                  <div className="html-toolbar">
                    {HTML_TOOLBAR.map((group) => (
                      <div key={group.group} className="toolbar-group">
                        {group.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={`toolbar-btn ${item.id === 'undo' && undoStack.length === 0 ? 'disabled' : ''} ${item.id === 'redo' && redoStack.length === 0 ? 'disabled' : ''}`}
                            onClick={() => insertHtmlTag(item)}
                            title={item.title}
                            disabled={(item.id === 'undo' && undoStack.length === 0) || (item.id === 'redo' && redoStack.length === 0)}
                          >
                            <item.icon size={16} />
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {showHtmlPreview ? (
                  <div className="html-preview">
                    <div
                      className="html-content"
                      dangerouslySetInnerHTML={{ __html: formData.content_html }}
                    />
                  </div>
                ) : (
                  <textarea
                    ref={textareaRef}
                    className="form-textarea code-editor"
                    placeholder="<h2>Tiêu đề</h2>
<p>Nội dung bài học...</p>
<ul>
  <li>Điểm 1</li>
  <li>Điểm 2</li>
</ul>

Mẹo: Sử dụng toolbar ở trên hoặc copy-paste HTML từ nguồn khác."
                    value={formData.content_html}
                    onChange={(e) => handleChange('content_html', e.target.value)}
                    onPaste={handlePaste}
                    rows={15}
                    spellCheck={false}
                  />
                )}
                {errors.content_html && <span className="form-error">{errors.content_html}</span>}

                <div className="html-editor-footer">
                  <span className="char-count">{formData.content_html.length} ký tự</span>
                  <span className="editor-hint">Ctrl+Z: Hoàn tác | Ctrl+Y: Làm lại | Ctrl+V: Dán</span>
                </div>
              </div>
            )}

            {/* Quiz Type Notice */}
            {formData.lesson_type === 'quiz' && (
              <div className="quiz-notice">
                <HelpCircle size={24} />
                <div className="quiz-notice-content">
                  <h4>Bài kiểm tra</h4>
                  <p>Sau khi lưu bài học, bạn có thể thêm câu hỏi cho bài kiểm tra.</p>
                  <button
                    type="button"
                    className="btn-goto-quiz"
                    onClick={() => {
                      if (isEditing) {
                        navigate(`/courses/admin/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}/quiz`);
                      } else {
                        alert('Vui lòng lưu bài học trước khi thêm câu hỏi');
                      }
                    }}
                    disabled={!isEditing}
                  >
                    {isEditing ? 'Quản lý câu hỏi' : 'Lưu để thêm câu hỏi'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Settings */}
          <div className="form-column form-column-right">
            {/* Duration */}
            <div className="form-group">
              <label className="form-label">Thời lượng</label>
              <div className="duration-input-wrapper">
                <Clock size={18} className="duration-icon" />
                <input
                  type="number"
                  className="form-input with-icon"
                  placeholder="10"
                  value={formData.duration_minutes || ''}
                  onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value) || 0)}
                  min={0}
                  max={999}
                />
                <span className="duration-unit">phút</span>
              </div>
            </div>

            {/* Preview Toggle */}
            <div className="form-group">
              <label className="form-label">Cho phép xem trước</label>
              <button
                type="button"
                className={`toggle-btn ${formData.is_preview ? 'active' : ''}`}
                onClick={() => handleChange('is_preview', !formData.is_preview)}
              >
                {formData.is_preview ? (
                  <>
                    <ToggleRight size={24} />
                    <span>Bật</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={24} />
                    <span>Tắt</span>
                  </>
                )}
              </button>
              <p className="form-hint">
                {formData.is_preview
                  ? 'Người dùng chưa đăng ký có thể xem bài học này'
                  : 'Chỉ học viên đã đăng ký mới xem được'}
              </p>
            </div>

            {/* Tips Card */}
            <div className="tips-card">
              <h4>Mẹo tạo bài học</h4>
              <ul>
                {formData.lesson_type === 'video' && (
                  <>
                    <li>Video nên dài từ 5-15 phút</li>
                    <li>Sử dụng video chất lượng HD</li>
                    <li>Thêm phụ đề nếu có thể</li>
                  </>
                )}
                {formData.lesson_type === 'article' && (
                  <>
                    <li>Chia nội dung thành các phần nhỏ</li>
                    <li>Sử dụng heading (h2, h3) để phân cấp</li>
                    <li>Thêm hình ảnh minh họa</li>
                    <li>Import file HTML từ editor khác</li>
                  </>
                )}
                {formData.lesson_type === 'quiz' && (
                  <>
                    <li>Mỗi quiz nên có 5-10 câu hỏi</li>
                    <li>Đa dạng loại câu hỏi</li>
                    <li>Thêm giải thích cho đáp án</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
