/**
 * ImageUploader - Drag & Drop Image Upload Component
 * Supports file input and drag-drop with preview
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  X,
  FolderOpen,
} from 'lucide-react';
import { courseImageService } from '../../../services/courseImageService';

// Design Tokens
const COLORS = {
  bgDark: '#0a0a0f',
  bgCard: 'rgba(255, 255, 255, 0.03)',
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
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  libraryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textSecondary,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minHeight: '44px',
  },
  dropZone: {
    border: `2px dashed ${COLORS.border}`,
    borderRadius: '12px',
    padding: '32px 16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: COLORS.bgCard,
  },
  dropZoneActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
  },
  dropZoneIcon: {
    color: COLORS.textMuted,
    marginBottom: '12px',
  },
  dropZoneText: {
    color: COLORS.textSecondary,
    fontSize: '14px',
    marginBottom: '8px',
  },
  dropZoneHint: {
    color: COLORS.textMuted,
    fontSize: '12px',
  },
  previewContainer: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    backgroundColor: COLORS.bgCard,
    borderRadius: '12px',
    border: `1px solid ${COLORS.border}`,
    flexWrap: 'wrap',
  },
  previewImage: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    flexShrink: 0,
  },
  previewInfo: {
    flex: 1,
    minWidth: '200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: COLORS.textMuted,
    fontSize: '13px',
  },
  input: {
    padding: '12px 14px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textPrimary,
    fontSize: '14px',
    outline: 'none',
    minHeight: '44px',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: '12px',
    marginTop: '2px',
  },
  previewActions: {
    display: 'flex',
    gap: '12px',
    marginTop: 'auto',
    flexWrap: 'wrap',
  },
  uploadButton: {
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
    flex: '1 1 auto',
    minWidth: '120px',
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textSecondary,
    fontSize: '14px',
    cursor: 'pointer',
    minHeight: '44px',
    flex: '1 1 auto',
    minWidth: '100px',
  },
  fileName: {
    color: COLORS.textSecondary,
    fontSize: '13px',
    marginTop: '4px',
    wordBreak: 'break-all',
  },
};

export default function ImageUploader({ lessonId, onUploadComplete, onOpenLibrary }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [positionId, setPositionId] = useState('');
  const [positionIdError, setPositionIdError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Chỉ hỗ trợ PNG, JPG, GIF, WebP, SVG');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File quá lớn (tối đa 10MB)');
      return;
    }

    setUploadError('');
    setSelectedFile(file);

    // Use FileReader instead of blob URL to avoid CSP issues
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    setPositionId(courseImageService.generatePositionId(file.name));
  }, []);

  // Drag & drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files?.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // File input change
  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = ''; // Reset input
  };

  // Position ID validation
  const handlePositionIdChange = (value) => {
    setPositionId(value);
    const validation = courseImageService.validatePositionId(value);
    setPositionIdError(validation.error || '');
  };

  // Upload handler
  const handleUpload = async () => {
    if (!selectedFile || !positionId) return;

    // Validate position ID
    const validation = courseImageService.validatePositionId(positionId);
    if (!validation.valid) {
      setPositionIdError(validation.error);
      return;
    }

    // Check for duplicate
    const isDuplicate = await courseImageService.checkDuplicatePositionId(lessonId, positionId);
    if (isDuplicate) {
      setPositionIdError('Position ID này đã tồn tại trong bài học');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const { data, error } = await courseImageService.uploadAndCreate(
        selectedFile,
        lessonId,
        { positionId }
      );

      if (error) throw error;

      // Success - reset form and notify parent
      handleCancel();
      onUploadComplete?.(data);
    } catch (error) {
      console.error('[ImageUploader] Upload error:', error);
      setUploadError(error?.message || 'Không thể upload hình ảnh');
    } finally {
      setIsUploading(false);
    }
  };

  // Cancel/reset
  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPositionId('');
    setPositionIdError('');
    setUploadError('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <Upload size={18} />
          Upload hình ảnh
        </h3>
        {onOpenLibrary && (
          <button
            style={styles.libraryButton}
            onClick={onOpenLibrary}
            type="button"
          >
            <FolderOpen size={16} />
            Thư viện hình ảnh
          </button>
        )}
      </div>

      {!selectedFile ? (
        // Drop Zone
        <div
          style={{
            ...styles.dropZone,
            ...(isDragging ? styles.dropZoneActive : {}),
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon size={48} style={styles.dropZoneIcon} />
          <p style={styles.dropZoneText}>
            Kéo thả hình ảnh vào đây hoặc click để chọn
          </p>
          <p style={styles.dropZoneHint}>
            PNG, JPG, GIF, WebP, SVG - Tối đa 10MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
            onChange={handleInputChange}
            hidden
          />
        </div>
      ) : (
        // Preview & Form
        <div style={styles.previewContainer}>
          <img
            src={previewUrl}
            alt="Preview"
            style={styles.previewImage}
          />

          <div style={styles.previewInfo}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Position ID *</label>
              <input
                type="text"
                value={positionId}
                onChange={(e) => handlePositionIdChange(e.target.value)}
                placeholder="diagram-1, hero-image, etc."
                style={{
                  ...styles.input,
                  ...(positionIdError ? styles.inputError : {}),
                }}
              />
              {positionIdError && (
                <span style={styles.errorText}>{positionIdError}</span>
              )}
            </div>

            <p style={styles.fileName}>
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>

            {uploadError && (
              <div style={{ color: COLORS.error, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} />
                {uploadError}
              </div>
            )}

            <div style={styles.previewActions}>
              <button
                style={styles.uploadButton}
                onClick={handleUpload}
                disabled={isUploading || !positionId}
                type="button"
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                {isUploading ? 'Đang upload...' : 'Upload'}
              </button>
              <button
                style={styles.cancelButton}
                onClick={handleCancel}
                disabled={isUploading}
                type="button"
              >
                <X size={16} />
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
