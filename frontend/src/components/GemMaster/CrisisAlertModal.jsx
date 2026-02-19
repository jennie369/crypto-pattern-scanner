/**
 * CrisisAlertModal - Web component
 * Emergency support modal triggered by emotionDetectionService crisis keywords.
 * Shows Vietnamese mental health hotline with tel: link.
 * Accessible: focus trap, escape to close, aria labels.
 *
 * Based on crisis alert UI in gem-mobile GemMasterScreen.js
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATION } from '../../../../web design-tokens';
import './CrisisAlertModal.css';

const CrisisAlertModal = ({
  isOpen,
  onClose,
  crisisInfo,
}) => {
  const modalRef = useRef(null);
  const closeRef = useRef(null);

  // Focus trap: focus close button on open
  useEffect(() => {
    if (isOpen) {
      // Small delay for animation
      const timer = setTimeout(() => {
        closeRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Escape to close
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose?.();
      return;
    }
    // Simple focus trap: tab cycles within modal
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [onClose]);

  const defaultMessage =
    'Neu ban dang trai qua thoi diem kho khan, xin dung ngai tim kiem su ho tro.';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="crisis-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Crisis support"
          aria-describedby="crisis-message"
        >
          <motion.div
            ref={modalRef}
            className="crisis-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={ANIMATION.spring}
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <h2 className="crisis-title">Chung toi quan tam den ban</h2>

            <p className="crisis-message" id="crisis-message">
              {crisisInfo?.message || defaultMessage}
            </p>

            <div className="crisis-hotline">
              <p className="crisis-hotline-label">Duong day nong ho tro:</p>
              <a
                href="tel:1800599920"
                className="crisis-hotline-number"
                aria-label="Goi duong day nong 1800 599 920"
              >
                1800 599 920
              </a>
              <p className="crisis-hotline-note">(Mien phi, 24/7)</p>
            </div>

            <button
              ref={closeRef}
              className="crisis-close-btn"
              onClick={onClose}
              aria-label="Dong"
            >
              Toi hieu
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CrisisAlertModal;
