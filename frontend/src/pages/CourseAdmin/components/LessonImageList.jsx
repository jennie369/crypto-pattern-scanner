/**
 * LessonImageList - Display and manage lesson images
 * Grid view with copy URL, copy HTML, edit, delete, reorder
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Image as ImageIcon,
  Copy,
  Code,
  Edit3,
  Trash2,
  GripVertical,
  Check,
  Loader2,
  AlertCircle,
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';

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
  count: {
    color: COLORS.textMuted,
    fontSize: '14px',
    fontWeight: '400',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.2s',
  },
  cardDragging: {
    opacity: 0.5,
    border: `2px dashed ${COLORS.gold}`,
  },
  cardDragOver: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
  },
  imageContainer: {
    position: 'relative',
    height: '160px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  dragHandle: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    padding: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '8px',
    cursor: 'grab',
    color: COLORS.textSecondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: '14px',
  },
  positionId: {
    color: COLORS.gold,
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: '6px',
    wordBreak: 'break-all',
  },
  fileName: {
    color: COLORS.textMuted,
    fontSize: '12px',
    marginBottom: '12px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textSecondary,
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minHeight: '40px',
  },
  actionButtonSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: COLORS.success,
    color: COLORS.success,
  },
  deleteButton: {
    color: COLORS.error,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    color: COLORS.textMuted,
    textAlign: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: '12px',
    border: `1px dashed ${COLORS.border}`,
  },
  emptyIcon: {
    marginBottom: '12px',
    opacity: 0.5,
  },
  emptyText: {
    fontSize: '14px',
    margin: 0,
  },
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    color: COLORS.textMuted,
  },
  // Lightbox styles
  lightboxOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
    zIndex: 10001,
  },
  lightboxTitle: {
    color: COLORS.textPrimary,
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  lightboxSubtitle: {
    color: COLORS.textMuted,
    fontSize: '13px',
    marginTop: '4px',
  },
  lightboxActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  lightboxButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '8px',
    color: COLORS.textPrimary,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  lightboxButtonHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  lightboxCloseButton: {
    backgroundColor: 'rgba(156, 6, 18, 0.3)',
  },
  lightboxImageContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '80px 100px',
    overflow: 'auto',
  },
  lightboxImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
    transition: 'transform 0.3s ease',
  },
  lightboxNav: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '50%',
    color: COLORS.textPrimary,
    cursor: 'pointer',
    transition: 'all 0.2s',
    zIndex: 10001,
  },
  lightboxNavPrev: {
    left: '24px',
  },
  lightboxNavNext: {
    right: '24px',
  },
  lightboxFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px 24px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    zIndex: 10001,
  },
  lightboxCounter: {
    color: COLORS.textSecondary,
    fontSize: '14px',
  },
  zoomIndicator: {
    color: COLORS.gold,
    fontSize: '13px',
    marginLeft: '16px',
    fontFamily: 'monospace',
  },
  imageClickOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    cursor: 'zoom-in',
    transition: 'all 0.2s',
  },
  imageClickOverlayHover: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  zoomIcon: {
    opacity: 0,
    color: COLORS.textPrimary,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '50%',
    padding: '12px',
    transition: 'opacity 0.2s',
  },
  zoomIconVisible: {
    opacity: 1,
  },
};

export default function LessonImageList({
  images = [],
  loading = false,
  onUpdate,
  onDelete,
  onReorder,
  onEdit,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredImageIndex, setHoveredImageIndex] = useState(null);

  // Copy to clipboard helper
  const copyToClipboard = useCallback(async (text, id, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(`${id}-${type}`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('[LessonImageList] Copy failed:', err);
    }
  }, []);

  // Copy URL handler
  const handleCopyUrl = (image) => {
    copyToClipboard(image.image_url, image.id, 'url');
  };

  // Copy HTML tag handler
  const handleCopyHtml = (image) => {
    const alt = image.alt_text || image.position_id || 'image';
    const htmlTag = `<img src="${image.image_url}" alt="${alt}" />`;
    copyToClipboard(htmlTag, image.id, 'html');
  };

  // Delete handler
  const handleDelete = async (image) => {
    if (!window.confirm(`Xóa hình "${image.position_id}"?`)) return;

    setDeletingId(image.id);
    try {
      await onDelete?.(image.id);
    } catch (error) {
      console.error('[LessonImageList] Delete error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  // Drag handlers for reordering
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder images
    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);

    onReorder?.(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Lightbox handlers
  const openLightbox = useCallback((index) => {
    setLightboxIndex(index);
    setZoomLevel(1);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setZoomLevel(1);
  }, []);

  const goToPrevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoomLevel(1);
  }, [images.length]);

  const goToNextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoomLevel(1);
  }, [images.length]);

  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const downloadImage = useCallback(() => {
    const currentImage = images[lightboxIndex];
    if (currentImage?.image_url) {
      const link = document.createElement('a');
      link.href = currentImage.image_url;
      link.download = currentImage.file_name || currentImage.position_id || 'image';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [images, lightboxIndex]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          goToPrevImage();
          break;
        case 'ArrowRight':
          goToNextImage();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, goToPrevImage, goToNextImage, zoomIn, zoomOut]);

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingState}>
        <Loader2 size={24} className="animate-spin" />
        <span style={{ marginLeft: '8px' }}>Đang tải hình ảnh...</span>
      </div>
    );
  }

  // Empty state
  if (!images?.length) {
    return (
      <div style={styles.emptyState}>
        <ImageIcon size={48} style={styles.emptyIcon} />
        <p style={styles.emptyText}>
          Chưa có hình ảnh nào trong bài học này
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <ImageIcon size={18} />
          Hình ảnh bài học
          <span style={styles.count}>({images.length})</span>
        </h3>
      </div>

      <div style={styles.grid}>
        {images.map((image, index) => (
          <div
            key={image.id}
            style={{
              ...styles.card,
              ...(draggedIndex === index ? styles.cardDragging : {}),
              ...(dragOverIndex === index ? styles.cardDragOver : {}),
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div style={styles.imageContainer}>
              <img
                src={image.image_url}
                alt={image.alt_text || image.position_id}
                style={styles.image}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              {/* Zoom overlay - click to open lightbox */}
              <div
                style={{
                  ...styles.imageClickOverlay,
                  ...(hoveredImageIndex === index ? styles.imageClickOverlayHover : {}),
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openLightbox(index);
                }}
                onMouseEnter={() => setHoveredImageIndex(index)}
                onMouseLeave={() => setHoveredImageIndex(null)}
              >
                <ZoomIn
                  size={28}
                  style={{
                    ...styles.zoomIcon,
                    ...(hoveredImageIndex === index ? styles.zoomIconVisible : {}),
                  }}
                />
              </div>
              <div style={styles.dragHandle}>
                <GripVertical size={16} />
              </div>
            </div>

            <div style={styles.cardContent}>
              <div style={styles.positionId}>
                {image.position_id}
              </div>
              <div style={styles.fileName}>
                {image.file_name}
              </div>

              <div style={styles.actions}>
                <button
                  style={{
                    ...styles.actionButton,
                    ...(copiedId === `${image.id}-url` ? styles.actionButtonSuccess : {}),
                  }}
                  onClick={() => handleCopyUrl(image)}
                  title="Copy URL"
                >
                  {copiedId === `${image.id}-url` ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                  URL
                </button>

                <button
                  style={{
                    ...styles.actionButton,
                    ...(copiedId === `${image.id}-html` ? styles.actionButtonSuccess : {}),
                  }}
                  onClick={() => handleCopyHtml(image)}
                  title="Copy HTML tag"
                >
                  {copiedId === `${image.id}-html` ? (
                    <Check size={14} />
                  ) : (
                    <Code size={14} />
                  )}
                  HTML
                </button>

                <button
                  style={styles.actionButton}
                  onClick={() => onEdit?.(image)}
                  title="Chỉnh sửa"
                >
                  <Edit3 size={14} />
                </button>

                <button
                  style={{
                    ...styles.actionButton,
                    ...styles.deleteButton,
                  }}
                  onClick={() => handleDelete(image)}
                  disabled={deletingId === image.id}
                  title="Xóa"
                >
                  {deletingId === image.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Lightbox Modal */}
      {lightboxOpen && images[lightboxIndex] && (
        <div
          style={styles.lightboxOverlay}
          onClick={closeLightbox}
        >
          {/* Header */}
          <div style={styles.lightboxHeader} onClick={(e) => e.stopPropagation()}>
            <div>
              <div style={styles.lightboxTitle}>
                {images[lightboxIndex].position_id}
              </div>
              <div style={styles.lightboxSubtitle}>
                {images[lightboxIndex].file_name}
              </div>
            </div>
            <div style={styles.lightboxActions}>
              <button
                style={styles.lightboxButton}
                onClick={zoomOut}
                title="Thu nhỏ (-)"
              >
                <ZoomOut size={20} />
              </button>
              <button
                style={styles.lightboxButton}
                onClick={zoomIn}
                title="Phóng to (+)"
              >
                <ZoomIn size={20} />
              </button>
              <button
                style={styles.lightboxButton}
                onClick={downloadImage}
                title="Tải xuống"
              >
                <Download size={20} />
              </button>
              <button
                style={{ ...styles.lightboxButton, ...styles.lightboxCloseButton }}
                onClick={closeLightbox}
                title="Đóng (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation - Previous */}
          {images.length > 1 && (
            <button
              style={{ ...styles.lightboxNav, ...styles.lightboxNavPrev }}
              onClick={(e) => {
                e.stopPropagation();
                goToPrevImage();
              }}
              title="Hình trước (←)"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Image Container */}
          <div
            style={styles.lightboxImageContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex].image_url}
              alt={images[lightboxIndex].alt_text || images[lightboxIndex].position_id}
              style={{
                ...styles.lightboxImage,
                transform: `scale(${zoomLevel})`,
                cursor: zoomLevel > 1 ? 'grab' : 'default',
              }}
              draggable={false}
            />
          </div>

          {/* Navigation - Next */}
          {images.length > 1 && (
            <button
              style={{ ...styles.lightboxNav, ...styles.lightboxNavNext }}
              onClick={(e) => {
                e.stopPropagation();
                goToNextImage();
              }}
              title="Hình sau (→)"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Footer */}
          <div style={styles.lightboxFooter} onClick={(e) => e.stopPropagation()}>
            <span style={styles.lightboxCounter}>
              {lightboxIndex + 1} / {images.length}
            </span>
            {zoomLevel !== 1 && (
              <span style={styles.zoomIndicator}>
                {Math.round(zoomLevel * 100)}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
