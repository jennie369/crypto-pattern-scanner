import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SidePeekPanel.css';

/**
 * Side Peek Panel Component (Notion-style) - FULL PAGE OVERLAY
 * Slides in from the right side, overlays entire page
 * Resizable and positioned using React Portal
 * Used for sub-tools like Risk Calculator, Analytics, etc.
 */
const SidePeekPanel = ({
  isOpen,
  onClose,
  title,
  tier,
  children,
  defaultWidth = 700,
  minWidth = 400,
  maxWidth = 1200,
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Resize handlers
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  const handleResizeMove = (e) => {
    if (!startXRef.current) return;

    const deltaX = startXRef.current - e.clientX;
    const newWidth = Math.min(
      Math.max(startWidthRef.current + deltaX, minWidth),
      maxWidth
    );

    setWidth(newWidth);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    startXRef.current = 0;
    startWidthRef.current = 0;

    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Content to render
  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="side-peek-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            className={`side-peek-panel ${isResizing ? 'resizing' : ''}`}
            style={{ width: `${width}px` }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300
            }}
          >
            {/* Resize Handle */}
            <div
              className="resize-handle"
              onMouseDown={handleResizeStart}
            >
              <GripVertical size={20} className="grip-icon" />
              <div className="resize-hint">
                ← Drag to resize →
              </div>
            </div>

            {/* Header */}
            <div className="side-peek-header">
              <div className="header-left">
                <h2>{title}</h2>
                {tier && tier !== 'FREE' && (
                  <span className={`tier-badge tier-${tier.toLowerCase()}`}>
                    {tier}
                  </span>
                )}
              </div>

              <button className="close-btn" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="side-peek-content">
              {children}
            </div>

            {/* Width Indicator - Only show when resizing */}
            {isResizing && (
              <div className="width-indicator">
                {width}px
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render to body using portal (escapes component tree!)
  return createPortal(content, document.body);
};

export default SidePeekPanel;
