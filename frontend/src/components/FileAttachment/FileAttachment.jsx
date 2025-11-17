import React, { useState, useRef } from 'react';
import { Paperclip, X, File, FileText, Image as ImageIcon, Download } from 'lucide-react';
import { uploadImage } from '../../utils/imageUpload';
import './FileAttachment.css';

/**
 * FileAttachment Component
 * Upload and display file attachments in messages
 *
 * @param {function} onFileSelect - Callback when file is selected ({url, name, type, size}) => void
 * @param {object} attachment - Current attachment {url, name, type, size}
 * @param {function} onRemove - Callback when attachment is removed
 */
export default function FileAttachment({ onFileSelect, attachment, onRemove }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file to Supabase Storage
      const url = await uploadImage(file, 'message-attachments', 'files');

      clearInterval(progressInterval);
      setProgress(100);

      // Call callback with file info
      if (onFileSelect) {
        onFileSelect({
          url,
          name: file.name,
          type: file.type,
          size: file.size
        });
      }

      // Reset progress after delay
      setTimeout(() => {
        setProgress(0);
      }, 1000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    if (!uploading && !attachment) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) {
      return <ImageIcon size={16} />;
    } else if (type?.includes('pdf')) {
      return <FileText size={16} />;
    } else {
      return <File size={16} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="file-attachment-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {attachment ? (
        // Show attachment preview
        <div className="attachment-preview">
          <div className="attachment-info">
            {getFileIcon(attachment.type)}
            <div className="attachment-details">
              <span className="attachment-name">{attachment.name}</span>
              <span className="attachment-size">{formatFileSize(attachment.size)}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-remove-attachment"
            onClick={handleRemove}
            title="Remove attachment"
          >
            <X size={16} />
          </button>
        </div>
      ) : uploading ? (
        // Show upload progress
        <div className="upload-progress-small">
          <div className="spinner-small"></div>
          <span>{progress}%</span>
        </div>
      ) : (
        // Show attach button
        <button
          type="button"
          className="btn-attach"
          onClick={handleClick}
          title="Attach file"
        >
          <Paperclip size={20} />
        </button>
      )}

      {error && (
        <div className="attachment-error">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

/**
 * MessageAttachment Component
 * Display attachment in message
 *
 * @param {object} attachment - Attachment data {url, name, type, size}
 */
export function MessageAttachment({ attachment }) {
  if (!attachment || !attachment.url) return null;

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) {
      return <ImageIcon size={20} />;
    } else if (type?.includes('pdf')) {
      return <FileText size={20} />;
    } else {
      return <File size={20} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImage = attachment.type?.startsWith('image/');

  return (
    <div className="message-attachment">
      {isImage ? (
        <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="attachment-image-link">
          <img src={attachment.url} alt={attachment.name} className="attachment-image" />
        </a>
      ) : (
        <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="attachment-file-link">
          <div className="attachment-file-icon">
            {getFileIcon(attachment.type)}
          </div>
          <div className="attachment-file-info">
            <span className="attachment-file-name">{attachment.name}</span>
            {attachment.size && (
              <span className="attachment-file-size">{formatFileSize(attachment.size)}</span>
            )}
          </div>
          <Download size={18} className="download-icon" />
        </a>
      )}
    </div>
  );
}
