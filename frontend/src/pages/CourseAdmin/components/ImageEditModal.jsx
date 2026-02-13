/**
 * ImageEditModal - Edit image metadata
 * Edit position_id, title, caption, alt_text
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { courseImageService } from '../../../services/courseImageService';

// Design Tokens
const COLORS = {
  bgDark: '#0a0a0f',
  bgCard: 'rgba(255, 255, 255, 0.03)',
  bgOverlay: 'rgba(0, 0, 0, 0.8)',
  burgundy: '#9C0612',
  gold: '#FFBD59',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  border: 'rgba(255, 255, 255, 0.1)',
  success: '#22c55e',
  error: '#ef4444',
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.bgOverlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
    boxSizing: 'border-box',
  },
  modal: {
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    backgroundColor: COLORS.bgDark,
    borderRadius: '16px',
    border: `1px solid ${COLORS.border}`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: `1px solid ${COLORS.border}`,
    flexShrink: 0,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  closeButton: {
    padding: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    color: COLORS.textSecondary,
    cursor: 'pointer',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '44px',
    minHeight: '44px',
  },
  content: {
    padding: '20px',
    flex: 1,
    overflow: 'auto',
  },
  preview: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '180px',
    objectFit: 'contain',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: '14px',
    fontWeight: '500',
  },
  required: {
    color: COLORS.error,
  },
  input: {
    padding: '12px 14px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textPrimary,
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    minHeight: '44px',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  textarea: {
    padding: '12px 14px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textPrimary,
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    minHeight: '80px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: '12px',
  },
  errorText: {
    color: COLORS.error,
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'stretch',
    gap: '12px',
    padding: '16px 20px',
    borderTop: `1px solid ${COLORS.border}`,
    flexShrink: 0,
  },
  cancelButton: {
    flex: 1,
    padding: '12px 20px',
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textSecondary,
    fontSize: '14px',
    cursor: 'pointer',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: COLORS.burgundy,
    border: 'none',
    borderRadius: '8px',
    color: COLORS.textPrimary,
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    minHeight: '44px',
  },
  saveButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default function ImageEditModal({ isOpen, image, onClose, onSave }) {
  const [formData, setFormData] = useState({
    position_id: '',
    title: '',
    caption: '',
    alt_text: '',
  });
  const [positionIdError, setPositionIdError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Initialize form when image changes
  useEffect(() => {
    if (image) {
      setFormData({
        position_id: image.position_id || '',
        title: image.title || '',
        caption: image.caption || '',
        alt_text: image.alt_text || '',
      });
      setPositionIdError('');
      setError('');
    }
  }, [image]);

  // Handle position_id change with validation
  const handlePositionIdChange = (value) => {
    setFormData((prev) => ({ ...prev, position_id: value }));
    const validation = courseImageService.validatePositionId(value);
    setPositionIdError(validation.error || '');
  };

  // Handle save
  const handleSave = async () => {
    // Validate position_id
    const validation = courseImageService.validatePositionId(formData.position_id);
    if (!validation.valid) {
      setPositionIdError(validation.error);
      return;
    }

    // Check for duplicate if position_id changed
    if (formData.position_id !== image?.position_id) {
      const isDuplicate = await courseImageService.checkDuplicatePositionId(
        image?.lesson_id,
        formData.position_id,
        image?.id
      );
      if (isDuplicate) {
        setPositionIdError('Position ID này đã tồn tại trong bài học');
        return;
      }
    }

    setSaving(true);
    setError('');

    try {
      const { data, error: saveError } = await courseImageService.update(image?.id, {
        position_id: formData.position_id,
        title: formData.title,
        caption: formData.caption,
        alt_text: formData.alt_text,
      });

      if (saveError) throw saveError;

      onSave?.(data);
      onClose?.();
    } catch (err) {
      console.error('[ImageEditModal] Save error:', err);
      setError(err?.message || 'Không thể lưu thay đổi');
    } finally {
      setSaving(false);
    }
  };

  // Handle click outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !saving) {
      onClose?.();
    }
  };

  if (!isOpen || !image) return null;

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            <ImageIcon size={20} />
            Chỉnh sửa hình ảnh
          </h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Preview */}
          <div style={styles.preview}>
            <img
              src={image.image_url}
              alt={image.alt_text || image.position_id}
              style={styles.previewImage}
            />
          </div>

          {/* Form */}
          <div style={styles.form}>
            {/* Position ID */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Position ID <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.position_id}
                onChange={(e) => handlePositionIdChange(e.target.value)}
                placeholder="diagram-1, hero-image, etc."
                style={{
                  ...styles.input,
                  ...(positionIdError ? styles.inputError : {}),
                }}
              />
              {positionIdError ? (
                <span style={styles.errorText}>
                  <AlertCircle size={12} />
                  {positionIdError}
                </span>
              ) : (
                <span style={styles.hint}>
                  Chỉ cho phép a-z, 0-9, -, _
                </span>
              )}
            </div>

            {/* Title */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Tiêu đề</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Tiêu đề hình ảnh"
                style={styles.input}
              />
            </div>

            {/* Alt Text */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Alt Text</label>
              <input
                type="text"
                value={formData.alt_text}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, alt_text: e.target.value }))
                }
                placeholder="Mô tả hình ảnh cho accessibility"
                style={styles.input}
              />
              <span style={styles.hint}>
                Mô tả ngắn cho người dùng sử dụng screen reader
              </span>
            </div>

            {/* Caption */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Chú thích</label>
              <textarea
                value={formData.caption}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, caption: e.target.value }))
                }
                placeholder="Chú thích hiển thị dưới hình ảnh"
                style={styles.textarea}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ ...styles.errorText, padding: '8px 0' }}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            style={styles.cancelButton}
            onClick={onClose}
            disabled={saving}
          >
            Hủy
          </button>
          <button
            style={{
              ...styles.saveButton,
              ...(saving || positionIdError ? styles.saveButtonDisabled : {}),
            }}
            onClick={handleSave}
            disabled={saving || !!positionIdError}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={16} />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
