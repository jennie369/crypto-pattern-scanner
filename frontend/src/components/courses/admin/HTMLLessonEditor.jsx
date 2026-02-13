/**
 * HTML Lesson Editor Component
 * Allows teachers to paste HTML content with embedded quizzes
 * Features: Live preview, parse status, save with Ctrl+S
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Save,
  Eye,
  EyeOff,
  Code,
  AlertCircle,
  CheckCircle,
  Loader,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Clock,
  History,
  ChevronLeft,
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { htmlLessonParser } from '../../../services/htmlLessonParser';
import HTMLLessonPreview from './HTMLLessonPreview';
import VersionHistoryModal from './VersionHistoryModal';
import './HTMLLessonEditor.css';

export default function HTMLLessonEditor({
  lessonId,
  courseId,
  onSave,
  onBack,
  initialContent = '',
}) {
  // State
  const [htmlContent, setHtmlContent] = useState(initialContent);
  const [parsedContent, setParsedContent] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionCount, setVersionCount] = useState(0);

  // Debounced parsing
  const [debouncedHtml, setDebouncedHtml] = useState(htmlContent);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHtml(htmlContent);
    }, 500);
    return () => clearTimeout(timer);
  }, [htmlContent]);

  // Load existing content
  useEffect(() => {
    if (lessonId) {
      loadLesson();
    } else {
      setLoading(false);
    }
  }, [lessonId]);

  // Parse HTML when content changes
  useEffect(() => {
    if (debouncedHtml) {
      parseHTMLContent(debouncedHtml);
    } else {
      setParsedContent(null);
      setParseError(null);
    }
  }, [debouncedHtml]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [htmlContent, parsedContent]);

  const loadLesson = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('html_content, parsed_content, last_edited_at')
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      if (data?.html_content) {
        setHtmlContent(data.html_content);
        setParsedContent(data.parsed_content);
        setLastSaved(data.last_edited_at);
      }

      // Get version count
      const { count } = await supabase
        .from('lesson_versions')
        .select('*', { count: 'exact', head: true })
        .eq('lesson_id', lessonId);

      setVersionCount(count || 0);
    } catch (error) {
      console.error('[HTMLLessonEditor] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseHTMLContent = (html) => {
    try {
      const parsed = htmlLessonParser.parse(html);
      const validation = htmlLessonParser.validate(parsed);

      setParsedContent(parsed);

      if (validation.errors.length > 0) {
        setParseError(validation.errors.join('\n'));
      } else {
        setParseError(null);
      }

      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('[HTMLLessonEditor] Parse error:', error);
      setParseError(error.message);
    }
  };

  const handleSave = async () => {
    if (!parsedContent || saving) return;

    if (parseError) {
      alert('Vui lòng sửa các lỗi trước khi lưu');
      return;
    }

    setSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('course_lessons')
        .update({
          html_content: htmlContent,
          parsed_content: parsedContent,
          embedded_quizzes: parsedContent.quizzes,
          embedded_images: parsedContent.images,
          type: 'html',
          last_edited_at: new Date().toISOString(),
          last_edited_by: user?.user?.id,
        })
        .eq('id', lessonId);

      if (error) throw error;

      setLastSaved(new Date().toISOString());
      setHasUnsavedChanges(false);
      setVersionCount(prev => prev + 1);

      onSave?.(parsedContent);
    } catch (error) {
      console.error('[HTMLLessonEditor] Save error:', error);
      alert('Lỗi khi lưu: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePaste = useCallback((e) => {
    // Allow paste HTML directly
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes('<') && pastedText.includes('>')) {
      // Looks like HTML
      setHtmlContent(pastedText);
      e.preventDefault();
    }
  }, []);

  const handleVersionRestore = useCallback((restoredContent) => {
    if (restoredContent?.html_content) {
      setHtmlContent(restoredContent.html_content);
      if (restoredContent.parsed_content) {
        setParsedContent(restoredContent.parsed_content);
      }
      setHasUnsavedChanges(true);
    }
    setShowVersionHistory(false);
  }, []);

  // Stats
  const stats = useMemo(() => {
    return htmlLessonParser.getStats(parsedContent);
  }, [parsedContent]);

  if (loading) {
    return (
      <div className="html-editor-loading">
        <Loader size={32} className="spin" />
        <span>Đang tải nội dung...</span>
      </div>
    );
  }

  return (
    <div className="html-lesson-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          {onBack && (
            <button className="back-btn" onClick={onBack}>
              <ChevronLeft size={20} />
            </button>
          )}
          <h2 className="editor-title">
            <Code size={20} className="title-icon" />
            HTML Lesson Editor
          </h2>

          {hasUnsavedChanges && (
            <span className="unsaved-badge">Chưa lưu</span>
          )}

          {lastSaved && !hasUnsavedChanges && (
            <span className="saved-time">
              Lưu lần cuối: {new Date(lastSaved).toLocaleString('vi-VN')}
            </span>
          )}
        </div>

        <div className="toolbar-right">
          {/* Version History */}
          <button
            className="toolbar-btn secondary"
            onClick={() => setShowVersionHistory(true)}
            disabled={versionCount === 0}
          >
            <History size={16} />
            Lịch sử ({versionCount})
          </button>

          {/* Toggle Preview */}
          <button
            className={`toolbar-btn ${showPreview ? 'active' : ''}`}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <Eye size={16} /> : <EyeOff size={16} />}
            Preview
          </button>

          {/* Save Button */}
          <button
            className="toolbar-btn primary"
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges || parseError}
          >
            {saving ? (
              <Loader size={16} className="spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Đang lưu...' : 'Lưu (Ctrl+S)'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="editor-main">
        {/* Editor Panel */}
        <div className={`editor-panel ${showPreview ? 'half' : 'full'}`}>
          {/* Editor Header */}
          <div className="panel-header">
            <span className="panel-title">HTML Content</span>
            <div className="parse-status">
              {parseError ? (
                <span className="status error">
                  <AlertCircle size={14} />
                  Lỗi
                </span>
              ) : parsedContent ? (
                <span className="status success">
                  <CheckCircle size={14} />
                  {stats.blockCount} blocks, {stats.quizCount} quizzes
                </span>
              ) : null}
            </div>
          </div>

          {/* Code Editor */}
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            onPaste={handlePaste}
            placeholder={`Paste HTML content từ AI vào đây...

Ví dụ:
<h1>Tiêu đề bài học</h1>
<p>Nội dung bài học...</p>
<img src="..." alt="..." />

<gem-quiz title="Quiz 1" passing-score="70">
  <gem-question type="single" points="10">
    <gem-prompt>Câu hỏi?</gem-prompt>
    <gem-option correct="true">Đáp án đúng</gem-option>
    <gem-option>Đáp án sai</gem-option>
    <gem-explanation>Giải thích đáp án</gem-explanation>
  </gem-question>
</gem-quiz>`}
            className="code-editor"
            spellCheck={false}
          />

          {/* Error Display */}
          {parseError && (
            <div className="error-banner">
              <AlertCircle size={16} />
              <span>{parseError}</span>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="preview-panel">
            <div className="panel-header">
              <span className="panel-title">Preview (Student View)</span>
            </div>

            <div className="preview-content">
              {parsedContent ? (
                <HTMLLessonPreview content={parsedContent} />
              ) : (
                <div className="preview-empty">
                  Nhập HTML để xem preview
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="editor-stats">
        <div className="stats-left">
          <span className="stat-item">
            <Clock size={14} />
            {stats.estimatedReadTime} phút đọc
          </span>
          <span className="stat-item">
            <FileText size={14} />
            {stats.blockCount} blocks
          </span>
          <span className="stat-item">
            <ImageIcon size={14} />
            {stats.imageCount} hình ảnh
          </span>
          <span className="stat-item">
            <HelpCircle size={14} />
            {stats.questionCount} câu hỏi
          </span>
        </div>
        <span className="stat-item muted">
          Lesson ID: {lessonId}
        </span>
      </div>

      {/* Version History Modal */}
      {showVersionHistory && (
        <VersionHistoryModal
          lessonId={lessonId}
          onClose={() => setShowVersionHistory(false)}
          onRestore={handleVersionRestore}
        />
      )}
    </div>
  );
}
