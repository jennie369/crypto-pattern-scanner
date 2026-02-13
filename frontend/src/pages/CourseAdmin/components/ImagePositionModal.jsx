/**
 * ImagePositionModal - Edit image position, fit, and size
 * Allows crop, resize, and reposition of images in placeholders
 * Supports drag-to-reposition on the preview frame
 * Version: 2.0 - Uses image dimensions directly for accurate preview
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Check,
  Move,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Hand,
} from 'lucide-react';

const COLORS = {
  bgDark: '#0a0a0f',
  bgCard: 'rgba(255, 255, 255, 0.03)',
  bgOverlay: 'rgba(0, 0, 0, 0.85)',
  burgundy: '#9C0612',
  gold: '#FFBD59',
  cyan: '#00F0FF',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  border: 'rgba(255, 255, 255, 0.1)',
};

const OBJECT_FIT_OPTIONS = [
  { value: 'cover', label: 'Cover', desc: 'Phủ kín, có thể crop' },
  { value: 'contain', label: 'Contain', desc: 'Hiển thị toàn bộ' },
  { value: 'fill', label: 'Fill', desc: 'Kéo giãn vừa khung' },
  { value: 'none', label: 'None', desc: 'Kích thước gốc' },
];

const POSITION_PRESETS = [
  { value: 'top left', label: 'TL' },
  { value: 'top center', label: 'TC' },
  { value: 'top right', label: 'TR' },
  { value: 'center left', label: 'CL' },
  { value: 'center center', label: 'CC' },
  { value: 'center right', label: 'CR' },
  { value: 'bottom left', label: 'BL' },
  { value: 'bottom center', label: 'BC' },
  { value: 'bottom right', label: 'BR' },
];

// Detect placeholder dimensions and return actual size info
function getPlaceholderInfo(imageElement) {
  if (!imageElement) {
    return { width: 360, height: 200, label: 'Mặc định', isCircle: false };
  }

  // Get the image's actual rendered dimensions first
  const imgRect = imageElement.getBoundingClientRect();
  const imgWidth = imgRect.width;
  const imgHeight = imgRect.height;

  console.log('[ImagePosition] Image dimensions:', { imgWidth: Math.round(imgWidth), imgHeight: Math.round(imgHeight) });

  // Strategy: Use the IMAGE's own rendered dimensions as the primary source
  // This is because the image is already constrained by CSS (object-fit, width, height)
  // and reflects how it actually appears in the placeholder

  let width = imgWidth;
  let height = imgHeight;
  let isCircle = false;
  let label = 'Tùy chỉnh';

  // Check if the image itself has border-radius: 50% (circle)
  const imgStyle = window.getComputedStyle(imageElement);
  if (imgStyle.borderRadius === '50%') {
    isCircle = true;
  }

  // Also check immediate parent for circle styling
  const parent = imageElement.parentElement;
  if (parent) {
    const parentStyle = window.getComputedStyle(parent);
    const parentRect = parent.getBoundingClientRect();

    // If parent has overflow:hidden and smaller dimensions, use parent
    if (parentStyle.overflow === 'hidden' || parentStyle.overflowX === 'hidden' || parentStyle.overflowY === 'hidden') {
      // Check if parent is actually constraining the image
      if (parentRect.width < imgWidth || parentRect.height < imgHeight) {
        width = parentRect.width;
        height = parentRect.height;
        console.log('[ImagePosition] Using parent dimensions (overflow hidden):', { width: Math.round(width), height: Math.round(height) });
      }
    }

    // Check parent for circle
    if (parentStyle.borderRadius === '50%' || parent.classList?.contains('circle-placeholder')) {
      isCircle = true;
    }
  }

  // Ensure minimum dimensions
  if (!width || width < 10) width = imgWidth || 360;
  if (!height || height < 10) height = imgHeight || 200;

  // Determine label based on aspect ratio
  const aspectRatio = width / height;

  if (isCircle) {
    label = 'Tròn';
  } else if (Math.abs(aspectRatio - 1) < 0.15) {
    label = 'Vuông (1:1)';
  } else if (aspectRatio < 0.75) {
    label = 'Dọc';
  } else if (aspectRatio > 1.4) {
    label = 'Ngang';
  } else {
    label = 'Tùy chỉnh';
  }

  console.log('[ImagePosition] Final dimensions:', { width: Math.round(width), height: Math.round(height), aspectRatio: aspectRatio.toFixed(2), isCircle, label });

  return { width, height, label, isCircle };
}

export default function ImagePositionModal({ isOpen, imageElement, onClose, onSave }) {
  const [objectFit, setObjectFit] = useState('cover');
  const [objectPosition, setObjectPosition] = useState('center center');
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [scale, setScale] = useState(100);
  const [originalStyles, setOriginalStyles] = useState({});
  const [placeholderInfo, setPlaceholderInfo] = useState({ width: 360, height: 200, label: 'Mặc định', isCircle: false });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, posX: 50, posY: 50 });

  const previewRef = useRef(null);
  const previewFrameRef = useRef(null);

  // Parse current image styles when modal opens
  useEffect(() => {
    if (isOpen && imageElement) {
      const style = imageElement.style;
      const computedStyle = window.getComputedStyle(imageElement);

      // Detect placeholder dimensions
      setPlaceholderInfo(getPlaceholderInfo(imageElement));

      // Save original styles for reset
      setOriginalStyles({
        objectFit: style.objectFit || computedStyle.objectFit || 'cover',
        objectPosition: style.objectPosition || computedStyle.objectPosition || 'center center',
        transform: style.transform || '',
      });

      // Parse object-fit
      const fit = style.objectFit || computedStyle.objectFit || 'cover';
      setObjectFit(fit);

      // Parse object-position
      const pos = style.objectPosition || computedStyle.objectPosition || 'center center';
      setObjectPosition(pos);

      // Parse position percentages
      const posMatch = pos.match(/(\d+)%?\s*(\d+)%?/);
      if (posMatch) {
        setPosX(parseInt(posMatch[1]) || 50);
        setPosY(parseInt(posMatch[2]) || 50);
      } else {
        // Handle keyword positions
        if (pos.includes('left')) setPosX(0);
        else if (pos.includes('right')) setPosX(100);
        else setPosX(50);

        if (pos.includes('top')) setPosY(0);
        else if (pos.includes('bottom')) setPosY(100);
        else setPosY(50);
      }

      // Parse scale from transform
      const transformMatch = (style.transform || '').match(/scale\(([^)]+)\)/);
      if (transformMatch) {
        setScale(Math.round(parseFloat(transformMatch[1]) * 100));
      } else {
        setScale(100);
      }
    }
  }, [isOpen, imageElement]);

  // Update preview when values change
  useEffect(() => {
    if (previewRef.current && imageElement) {
      const previewImg = previewRef.current;
      previewImg.style.objectFit = objectFit;
      previewImg.style.objectPosition = `${posX}% ${posY}%`;
      if (scale !== 100) {
        previewImg.style.transform = `scale(${scale / 100})`;
      } else {
        previewImg.style.transform = '';
      }
    }
  }, [objectFit, posX, posY, scale, imageElement]);

  // Drag handlers for preview
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({
      x: clientX,
      y: clientY,
      posX: posX,
      posY: posY,
    });
  }, [posX, posY]);

  const handleDragMove = useCallback((e) => {
    if (!isDragging || !previewFrameRef.current) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = previewFrameRef.current.getBoundingClientRect();
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;

    // Convert pixel delta to percentage (invert for natural dragging feel)
    // Moving image RIGHT means position goes LEFT (decreasing %)
    const percentDeltaX = -(deltaX / rect.width) * 100;
    const percentDeltaY = -(deltaY / rect.height) * 100;

    // Calculate new position with bounds
    const newPosX = Math.max(0, Math.min(100, dragStart.posX + percentDeltaX));
    const newPosY = Math.max(0, Math.min(100, dragStart.posY + percentDeltaY));

    setPosX(Math.round(newPosX));
    setPosY(Math.round(newPosY));
  }, [isDragging, dragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse/touch listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handlePositionPreset = (preset) => {
    setObjectPosition(preset);
    // Parse preset to X/Y
    if (preset.includes('left')) setPosX(0);
    else if (preset.includes('right')) setPosX(100);
    else setPosX(50);

    if (preset.includes('top')) setPosY(0);
    else if (preset.includes('bottom')) setPosY(100);
    else setPosY(50);
  };

  const handleReset = () => {
    setObjectFit(originalStyles.objectFit || 'cover');
    setObjectPosition(originalStyles.objectPosition || 'center center');
    setPosX(50);
    setPosY(50);
    setScale(100);
  };

  const handleSave = () => {
    if (!imageElement) {
      console.error('[ImagePosition] No image element to save');
      return;
    }

    console.log('[ImagePosition] Applying styles:', { objectFit, posX, posY, scale });

    // Build the complete style string
    const existingStyle = imageElement.getAttribute('style') || '';

    // Remove any existing object-fit, object-position, transform from the style
    let cleanedStyle = existingStyle
      .replace(/object-fit\s*:\s*[^;]+;?/gi, '')
      .replace(/object-position\s*:\s*[^;]+;?/gi, '')
      .replace(/transform\s*:\s*scale\([^)]+\)\s*;?/gi, '')
      .trim();

    // Build new style parts
    const newStyleParts = [];
    if (cleanedStyle) {
      newStyleParts.push(cleanedStyle);
    }
    newStyleParts.push(`object-fit: ${objectFit}`);
    newStyleParts.push(`object-position: ${posX}% ${posY}%`);
    if (scale !== 100) {
      newStyleParts.push(`transform: scale(${scale / 100})`);
    }

    // Set the complete style attribute (this ensures it's serialized in innerHTML)
    const finalStyle = newStyleParts.join('; ') + ';';
    imageElement.setAttribute('style', finalStyle);

    console.log('[ImagePosition] Final style attribute:', finalStyle);
    console.log('[ImagePosition] Image outerHTML:', imageElement.outerHTML?.substring(0, 300));

    // Call onSave callback with the settings
    onSave?.({
      objectFit,
      objectPosition: `${posX}% ${posY}%`,
      scale,
    });
  };

  if (!isOpen || !imageElement) return null;

  const imageSrc = imageElement.src || imageElement.getAttribute('src');

  // Dynamic preview frame styles based on aspect ratio
  const getPreviewFrameStyle = () => {
    const { width, height, isCircle } = placeholderInfo;

    // Scale to fit within max preview area while maintaining exact aspect ratio
    const MAX_WIDTH = 400;
    const MAX_HEIGHT = 300;

    // Calculate scale factor to fit within max dimensions
    const scaleX = MAX_WIDTH / width;
    const scaleY = MAX_HEIGHT / height;
    const scaleFactor = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

    const previewWidth = Math.round(width * scaleFactor);
    const previewHeight = Math.round(height * scaleFactor);

    console.log('[Preview] Dimensions:', { original: { width, height }, preview: { previewWidth, previewHeight }, scaleFactor });

    return {
      ...styles.previewFrame,
      width: `${previewWidth}px`,
      height: `${previewHeight}px`,
      cursor: isDragging ? 'grabbing' : 'grab',
      borderRadius: isCircle ? '50%' : '12px',
      overflow: 'hidden',
    };
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>
            <Move size={18} />
            Chỉnh sửa hình ảnh
          </h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Preview */}
        <div style={styles.previewContainer}>
          <div style={styles.previewInfo}>
            <span style={styles.previewLabel}>
              <Hand size={14} style={{ marginRight: 6 }} />
              Kéo thả để điều chỉnh vị trí
            </span>
            <span style={styles.aspectLabel}>
              {placeholderInfo.label} ({Math.round(placeholderInfo.width)}×{Math.round(placeholderInfo.height)})
            </span>
          </div>
          <div
            ref={previewFrameRef}
            style={getPreviewFrameStyle()}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <img
              ref={previewRef}
              src={imageSrc}
              alt="Preview"
              draggable={false}
              style={{
                ...styles.previewImage,
                objectFit: objectFit,
                objectPosition: `${posX}% ${posY}%`,
                transform: scale !== 100 ? `scale(${scale / 100})` : 'none',
                pointerEvents: 'none', // Let parent handle drag
                borderRadius: placeholderInfo.isCircle ? '50%' : '0',
              }}
            />
            {/* Drag indicator overlay */}
            {isDragging && (
              <div style={{ ...styles.dragOverlay, borderRadius: placeholderInfo.isCircle ? '50%' : '12px' }}>
                <Move size={24} style={{ color: COLORS.gold }} />
              </div>
            )}
          </div>
          {/* Position indicator */}
          <div style={styles.positionIndicator}>
            X: {posX}% | Y: {posY}%
          </div>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          {/* Object Fit */}
          <div style={styles.controlGroup}>
            <label style={styles.label}>Kiểu hiển thị (Object Fit)</label>
            <div style={styles.fitOptions}>
              {OBJECT_FIT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  style={{
                    ...styles.fitBtn,
                    ...(objectFit === opt.value ? styles.fitBtnActive : {}),
                  }}
                  onClick={() => setObjectFit(opt.value)}
                  title={opt.desc}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Position Grid */}
          <div style={styles.controlGroup}>
            <label style={styles.label}>Vị trí (Object Position)</label>
            <div style={styles.positionGrid}>
              {POSITION_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  style={{
                    ...styles.posBtn,
                    ...(objectPosition === preset.value ||
                        `${posX}% ${posY}%` === `${preset.value.includes('left') ? 0 : preset.value.includes('right') ? 100 : 50}% ${preset.value.includes('top') ? 0 : preset.value.includes('bottom') ? 100 : 50}%`
                        ? styles.posBtnActive : {}),
                  }}
                  onClick={() => handlePositionPreset(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fine-tune Position */}
          <div style={styles.controlGroup}>
            <label style={styles.label}>Tinh chỉnh vị trí</label>
            <div style={styles.sliderRow}>
              <span style={styles.sliderLabel}>X: {posX}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={posX}
                onChange={(e) => setPosX(parseInt(e.target.value))}
                style={styles.slider}
              />
            </div>
            <div style={styles.sliderRow}>
              <span style={styles.sliderLabel}>Y: {posY}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={posY}
                onChange={(e) => setPosY(parseInt(e.target.value))}
                style={styles.slider}
              />
            </div>
          </div>

          {/* Scale */}
          <div style={styles.controlGroup}>
            <label style={styles.label}>
              <ZoomIn size={14} style={{ marginRight: 6 }} />
              Zoom: {scale}%
            </label>
            <div style={styles.sliderRow}>
              <ZoomOut size={16} style={{ color: COLORS.textMuted }} />
              <input
                type="range"
                min="50"
                max="200"
                value={scale}
                onChange={(e) => setScale(parseInt(e.target.value))}
                style={styles.slider}
              />
              <ZoomIn size={16} style={{ color: COLORS.textMuted }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.resetBtn} onClick={handleReset}>
            <RotateCcw size={16} />
            Reset
          </button>
          <div style={styles.footerRight}>
            <button style={styles.cancelBtn} onClick={onClose}>
              Hủy
            </button>
            <button style={styles.saveBtn} onClick={handleSave}>
              <Check size={16} />
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    zIndex: 9999999, // Must be higher than fullscreen editor (999999)
    padding: '20px',
  },
  modal: {
    width: '100%',
    maxWidth: '520px',
    backgroundColor: COLORS.bgDark,
    borderRadius: '16px',
    border: `1px solid ${COLORS.border}`,
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: COLORS.textPrimary,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  closeBtn: {
    padding: '8px',
    background: 'transparent',
    border: 'none',
    color: COLORS.textSecondary,
    cursor: 'pointer',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    padding: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  previewInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '360px',
  },
  previewLabel: {
    fontSize: '12px',
    color: COLORS.gold,
    display: 'flex',
    alignItems: 'center',
  },
  aspectLabel: {
    fontSize: '11px',
    color: COLORS.cyan,
    padding: '4px 10px',
    background: 'rgba(0, 240, 255, 0.1)',
    borderRadius: '12px',
    fontWeight: 600,
  },
  previewFrame: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    overflow: 'hidden',
    border: `2px solid ${COLORS.border}`,
    position: 'relative',
    userSelect: 'none',
    transition: 'border-color 0.2s',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    display: 'block',
    userSelect: 'none',
  },
  dragOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  positionIndicator: {
    fontSize: '12px',
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '6px 12px',
    borderRadius: '6px',
  },
  controls: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: COLORS.textSecondary,
    display: 'flex',
    alignItems: 'center',
  },
  fitOptions: {
    display: 'flex',
    gap: '8px',
  },
  fitBtn: {
    flex: 1,
    padding: '10px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textSecondary,
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  fitBtnActive: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
    color: COLORS.textPrimary,
  },
  positionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '6px',
    maxWidth: '180px',
  },
  posBtn: {
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '6px',
    color: COLORS.textMuted,
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  posBtnActive: {
    backgroundColor: COLORS.cyan,
    borderColor: COLORS.cyan,
    color: COLORS.bgDark,
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sliderLabel: {
    fontSize: '12px',
    color: COLORS.textMuted,
    minWidth: '55px',
  },
  slider: {
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    appearance: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    accentColor: COLORS.gold,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderTop: `1px solid ${COLORS.border}`,
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textSecondary,
    fontSize: '13px',
    cursor: 'pointer',
  },
  footerRight: {
    display: 'flex',
    gap: '10px',
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textSecondary,
    fontSize: '13px',
    cursor: 'pointer',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    backgroundColor: COLORS.burgundy,
    border: 'none',
    borderRadius: '8px',
    color: COLORS.textPrimary,
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },
};
