import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './ImageLightbox.css';

/**
 * ImageLightbox - Full-screen image viewer
 * Portal rendered, supports keyboard nav, swipe gestures, and arrow navigation
 */
export default function ImageLightbox({
  images = [],
  initialIndex = 0,
  isOpen,
  onClose
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartRef = useRef(null);

  // Sync when initialIndex changes
  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  // Navigate to next/prev
  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case 'ArrowRight':
          goNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, goNext, goPrev]);

  // Swipe gesture handlers
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartRef.current === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartRef.current = null;
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen || images.length === 0) return null;

  const lightbox = (
    <AnimatePresence>
      <motion.div
        className="lightbox-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleBackdropClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close button */}
        <button
          className="lightbox-close"
          onClick={onClose}
          aria-label="Đóng"
        >
          <X size={24} />
        </button>

        {/* Counter badge */}
        {images.length > 1 && (
          <div className="lightbox-counter">
            {currentIndex + 1}/{images.length}
          </div>
        )}

        {/* Image with slide animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="lightbox-image-wrapper"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.2 }}
          >
            <img
              src={images[currentIndex]}
              alt={`Ảnh ${currentIndex + 1} / ${images.length}`}
              className="lightbox-image"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Arrow navigation */}
        {images.length > 1 && (
          <>
            <button
              className="lightbox-nav lightbox-nav-prev"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              className="lightbox-nav lightbox-nav-next"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="Ảnh tiếp"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(lightbox, document.body);
}
