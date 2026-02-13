/**
 * Version History Modal Component
 * Displays lesson version history with restore functionality
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  RotateCcw,
  User,
  Calendar,
  FileText,
  HelpCircle,
  Loader,
  AlertCircle,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { lessonVersionService } from '../../../services/lessonVersionService';
import './VersionHistoryModal.css';

export default function VersionHistoryModal({ lessonId, onClose, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);

  useEffect(() => {
    loadVersions();
  }, [lessonId]);

  const loadVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await lessonVersionService.getVersions(lessonId);
      if (error) throw error;
      setVersions(data);
    } catch (err) {
      console.error('[VersionHistoryModal] Load error:', err);
      setError('Không thể tải lịch sử phiên bản');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVersion = async (version) => {
    setSelectedVersion(version);
    setPreviewContent(version.parsed_content);
  };

  const handleRestore = async () => {
    if (!selectedVersion) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn khôi phục về phiên bản ${selectedVersion.version_number}?\n\nPhiên bản hiện tại sẽ được lưu vào lịch sử.`
    );

    if (!confirmed) return;

    setRestoring(true);
    try {
      const { success, error } = await lessonVersionService.restoreVersion(
        lessonId,
        selectedVersion.id
      );

      if (error) throw error;

      if (success) {
        onRestore?.({
          html_content: selectedVersion.html_content,
          parsed_content: selectedVersion.parsed_content,
        });
      }
    } catch (err) {
      console.error('[VersionHistoryModal] Restore error:', err);
      alert('Lỗi khi khôi phục: ' + err.message);
    } finally {
      setRestoring(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStats = (parsedContent) => {
    if (!parsedContent) return { blocks: 0, quizzes: 0 };
    return {
      blocks: parsedContent.blocks?.length || 0,
      quizzes: parsedContent.quizzes?.length || 0,
    };
  };

  return (
    <div className="version-history-overlay" onClick={onClose}>
      <div className="version-history-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-title">
            <History size={20} />
            <h2>Lịch sử phiên bản</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Version List */}
          <div className="version-list-panel">
            <div className="panel-header">
              <span className="panel-title">Các phiên bản ({versions.length})</span>
            </div>

            {loading ? (
              <div className="loading-state">
                <Loader size={24} className="spin" />
                <span>Đang tải...</span>
              </div>
            ) : error ? (
              <div className="error-state">
                <AlertCircle size={24} />
                <span>{error}</span>
                <button onClick={loadVersions}>Thử lại</button>
              </div>
            ) : versions.length === 0 ? (
              <div className="empty-state">
                <History size={32} />
                <span>Chưa có lịch sử phiên bản</span>
                <p>Lịch sử sẽ được tạo tự động khi bạn chỉnh sửa và lưu nội dung.</p>
              </div>
            ) : (
              <div className="version-list">
                {versions.map((version) => {
                  const stats = getStats(version.parsed_content);
                  const isSelected = selectedVersion?.id === version.id;

                  return (
                    <button
                      key={version.id}
                      className={`version-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectVersion(version)}
                    >
                      <div className="version-main">
                        <div className="version-number">
                          Phiên bản {version.version_number}
                        </div>
                        <div className="version-meta">
                          <span className="meta-item">
                            <Calendar size={12} />
                            {formatDate(version.created_at)}
                          </span>
                          {version.creator && (
                            <span className="meta-item">
                              <User size={12} />
                              {version.creator.full_name || 'Người dùng'}
                            </span>
                          )}
                        </div>
                        <div className="version-stats">
                          <span className="stat">
                            <FileText size={12} />
                            {stats.blocks} blocks
                          </span>
                          <span className="stat">
                            <HelpCircle size={12} />
                            {stats.quizzes} quizzes
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="version-arrow" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="version-preview-panel">
            <div className="panel-header">
              <span className="panel-title">
                <Eye size={14} />
                Xem trước
              </span>
              {selectedVersion && (
                <button
                  className="restore-btn"
                  onClick={handleRestore}
                  disabled={restoring}
                >
                  {restoring ? (
                    <Loader size={14} className="spin" />
                  ) : (
                    <RotateCcw size={14} />
                  )}
                  {restoring ? 'Đang khôi phục...' : 'Khôi phục phiên bản này'}
                </button>
              )}
            </div>

            <div className="preview-content">
              {!selectedVersion ? (
                <div className="preview-empty">
                  <Eye size={32} />
                  <span>Chọn một phiên bản để xem trước</span>
                </div>
              ) : (
                <div className="preview-html">
                  {/* Version Info */}
                  <div className="preview-info">
                    <div className="info-row">
                      <span className="info-label">Phiên bản:</span>
                      <span className="info-value">{selectedVersion.version_number}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Thời gian:</span>
                      <span className="info-value">
                        {formatDate(selectedVersion.created_at)}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Người chỉnh sửa:</span>
                      <span className="info-value">
                        {selectedVersion.creator?.full_name || 'Không xác định'}
                      </span>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="preview-blocks">
                    {previewContent?.metadata?.title && (
                      <h2 className="preview-title">{previewContent.metadata.title}</h2>
                    )}

                    {previewContent?.blocks?.slice(0, 5).map((block) => (
                      <div key={block.id} className="preview-block">
                        <span className="block-type">{block.type}</span>
                        <span className="block-content">
                          {block.content?.substring(0, 100) || '(no content)'}
                          {block.content?.length > 100 ? '...' : ''}
                        </span>
                      </div>
                    ))}

                    {previewContent?.blocks?.length > 5 && (
                      <div className="preview-more">
                        +{previewContent.blocks.length - 5} blocks khác
                      </div>
                    )}

                    {previewContent?.quizzes?.length > 0 && (
                      <div className="preview-quizzes">
                        <span className="quizzes-label">Quizzes:</span>
                        {previewContent.quizzes.map((quiz) => (
                          <span key={quiz.id} className="quiz-tag">
                            {quiz.title} ({quiz.questions?.length || 0} câu)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
