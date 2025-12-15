/**
 * ImageUpload Component
 * Allows users to upload images for chart analysis
 * Available for TIER2+ users only
 * Uses design tokens for consistent styling
 */

import React, { useState, useRef } from 'react';
import { Image, X, Upload, Lock, Loader } from 'lucide-react';
import './ImageUpload.css';

// Supported image types
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ImageUpload({
  onImageSelect,
  onImageRemove,
  selectedImage,
  userTier = 'FREE',
  disabled = false,
  isUploading = false
}) {
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Check if user has access (TIER2+)
  const hasAccess = ['TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP'].includes(userTier?.toUpperCase());

  const handleFileSelect = (file) => {
    setError(null);

    if (!hasAccess) {
      setError('Tính năng này chỉ dành cho TIER2 trở lên');
      return;
    }

    if (!file) return;

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Chỉ hỗ trợ định dạng: JPG, PNG, GIF, WebP');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Kích thước file tối đa là 5MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    onImageSelect({
      file,
      previewUrl,
      name: file.name,
      size: file.size,
      type: file.type
    });
  };

  const handleClick = () => {
    if (!hasAccess) {
      setError('Nâng cấp lên TIER2 để sử dụng tính năng phân tích chart');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (hasAccess) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (!hasAccess) {
      setError('Nâng cấp lên TIER2 để sử dụng tính năng này');
      return;
    }

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    onImageRemove();
    setError(null);
  };

  // If image is selected, show preview
  if (selectedImage) {
    return (
      <div className="image-upload-preview">
        <img
          src={selectedImage.previewUrl}
          alt="Chart để phân tích"
          className="preview-image"
        />
        <div className="preview-overlay">
          <span className="preview-name">{selectedImage.name}</span>
          {isUploading ? (
            <Loader size={20} className="preview-loader" />
          ) : (
            <button
              className="preview-remove-btn"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="image-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        className="image-upload-input"
        disabled={disabled || !hasAccess}
      />

      <button
        className={`image-upload-button ${isDragging ? 'dragging' : ''} ${!hasAccess ? 'locked' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={disabled}
        title={hasAccess ? 'Tải ảnh chart để phân tích' : 'Nâng cấp TIER2 để sử dụng'}
      >
        {hasAccess ? (
          <Image size={18} />
        ) : (
          <Lock size={18} />
        )}
      </button>

      {error && (
        <div className="image-upload-error">
          {error}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
