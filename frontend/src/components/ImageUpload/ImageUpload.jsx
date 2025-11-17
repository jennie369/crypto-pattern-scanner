import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadImage, deleteImage } from '../../utils/imageUpload';
import './ImageUpload.css';

/**
 * ImageUpload Component
 * File upload with preview and progress
 *
 * @param {string} currentImageUrl - Current image URL (for editing)
 * @param {function} onUploadComplete - Callback when upload completes (url) => void
 * @param {function} onRemove - Callback when image is removed
 * @param {string} bucket - Supabase storage bucket name
 * @param {string} folder - Folder path in bucket
 */
export default function ImageUpload({
  currentImageUrl = '',
  onUploadComplete,
  onRemove,
  bucket = 'event-covers',
  folder = 'covers'
}) {
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress (Supabase doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload image
      const url = await uploadImage(file, bucket, folder);

      clearInterval(progressInterval);
      setProgress(100);

      // Set image URL
      setImageUrl(url);

      // Call callback
      if (onUploadComplete) {
        onUploadComplete(url);
      }

      // Reset progress after delay
      setTimeout(() => {
        setProgress(0);
      }, 1000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      setError('Please drop an image file');
    }
  };

  const handleRemove = async () => {
    if (imageUrl) {
      // Delete from storage (optional - comment out if you want to keep old images)
      // await deleteImage(imageUrl, bucket);

      setImageUrl('');

      if (onRemove) {
        onRemove();
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {imageUrl && !uploading ? (
        // Image Preview
        <div className="image-preview-container">
          <img src={imageUrl} alt="Uploaded" className="uploaded-image" />
          <button
            type="button"
            className="btn-remove-image"
            onClick={handleRemove}
            title="Remove image"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        // Upload Zone
        <div
          className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={!uploading ? handleClick : undefined}
        >
          {uploading ? (
            // Upload Progress
            <div className="upload-progress">
              <div className="spinner"></div>
              <p>Uploading... {progress}%</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            // Upload Prompt
            <>
              <Upload size={48} className="upload-icon" />
              <h4>Click to upload or drag and drop</h4>
              <p>PNG, JPG, GIF or WebP (max 5MB)</p>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="upload-error">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
