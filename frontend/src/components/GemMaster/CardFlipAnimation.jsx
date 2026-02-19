/**
 * CardFlipAnimation - Web version (Framer Motion)
 * 3D card flip revealing tarot card. Based on App's CardFlip.js.
 * Uses CSS 3D transforms + Framer Motion spring animations.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION } from '../../../../web design-tokens';

const DEFAULT_CARD_WIDTH = 120;
const DEFAULT_CARD_HEIGHT = 180;

const CardFlipAnimation = ({
  card,
  isFlipped = false,
  onFlip,
  onPress,
  positionLabel,
  positionIndex = 0,
  disabled = false,
  cardWidth = DEFAULT_CARD_WIDTH,
  cardHeight = DEFAULT_CARD_HEIGHT,
  reversed = false,
  showPosition = true,
  style: customStyle,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    if (!isFlipped && onFlip) {
      onFlip(card);
    } else if (isFlipped && onPress) {
      onPress(card);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      style={{
        width: cardWidth,
        height: cardHeight,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...customStyle,
      }}
    >
      <motion.div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={isFlipped
          ? `${card?.name || 'Card'} ${reversed ? '(Reversed)' : ''} - Click for details`
          : 'Click to flip card'
        }
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={disabled ? {} : { scale: 1.05 }}
        whileTap={disabled ? {} : { scale: 0.95 }}
        style={{
          width: cardWidth,
          height: cardHeight,
          cursor: disabled ? 'default' : 'pointer',
          perspective: 1000,
          position: 'relative',
        }}
      >
        {/* Pulsing glow for unflipped cards */}
        {!isFlipped && !disabled && (
          <motion.div
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.02, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: RADIUS.md,
              background: 'rgba(255, 215, 0, 0.15)',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Card Inner - handles 3D flip */}
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15, mass: 1 }}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Front Face (card back - face down) */}
          <div style={{
            ...styles.cardFace,
            width: cardWidth,
            height: cardHeight,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}>
            <div style={{
              ...styles.cardBackDesign,
              width: cardWidth - 4,
              height: cardHeight - 4,
            }}>
              {/* Mystical card back pattern */}
              <div style={styles.patternBorder}>
                <div style={styles.patternFrame}>
                  {/* Center star SVG */}
                  <svg width={cardWidth * 0.5} height={cardWidth * 0.5} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.6" />
                    <circle cx="50" cy="50" r="38" stroke="#FFD700" strokeWidth="1" fill="none" opacity="0.4" />
                    <path
                      d="M50 10 L58 35 L85 35 L63 52 L72 80 L50 62 L28 80 L37 52 L15 35 L42 35 Z"
                      stroke="#FFD700"
                      strokeWidth="1.5"
                      fill="rgba(255, 215, 0, 0.15)"
                    />
                    <circle cx="50" cy="50" r="15" stroke="#FFD700" strokeWidth="1" fill="rgba(255, 215, 0, 0.2)" />
                    <circle cx="50" cy="50" r="5" fill="#FFD700" opacity="0.8" />
                  </svg>

                  {/* Corner sparkles */}
                  <div style={{ ...styles.corner, top: 4, left: 4 }}>
                    <Sparkles size={12} color="#FFD700" />
                  </div>
                  <div style={{ ...styles.corner, top: 4, right: 4 }}>
                    <Sparkles size={12} color="#FFD700" />
                  </div>
                  <div style={{ ...styles.corner, bottom: 4, left: 4 }}>
                    <Sparkles size={12} color="#FFD700" />
                  </div>
                  <div style={{ ...styles.corner, bottom: 4, right: 4 }}>
                    <Sparkles size={12} color="#FFD700" />
                  </div>
                </div>
              </div>

              {/* Tap hint */}
              {!disabled && (
                <div style={styles.tapHint}>
                  <span style={styles.tapHintText}>Click to flip</span>
                </div>
              )}
            </div>
          </div>

          {/* Back Face (card front - face up) */}
          <div style={{
            ...styles.cardFace,
            width: cardWidth,
            height: cardHeight,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: `rotateY(180deg)${reversed ? ' rotate(180deg)' : ''}`,
          }}>
            {card?.image ? (
              <img
                src={card.image}
                alt={card.name || 'Tarot card'}
                style={{
                  width: cardWidth - 4,
                  height: cardHeight - 4,
                  objectFit: 'cover',
                  borderRadius: 6,
                }}
              />
            ) : (
              <div style={{
                width: cardWidth - 4,
                height: cardHeight - 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: COLORS.bgCard,
                borderRadius: 6,
                padding: SPACING.xs,
              }}>
                <span style={{
                  fontSize: TYPOGRAPHY.fontSize.sm,
                  color: COLORS.textPrimary,
                  textAlign: 'center',
                  fontWeight: TYPOGRAPHY.fontWeight.medium,
                }}>
                  {card?.vietnameseName || card?.name || 'Unknown'}
                </span>
              </div>
            )}

            {/* Reversed badge */}
            {reversed && (
              <div style={styles.reversedBadge}>
                <RotateCcw size={10} color={COLORS.textPrimary} />
                <span style={styles.reversedText}>Reversed</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Position badge */}
      {showPosition && positionIndex > 0 && (
        <div style={styles.positionBadge} title={positionLabel || `Position ${positionIndex}`}>
          <span style={styles.positionBadgeText}>{positionIndex}</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 8,
    border: `2px solid ${COLORS.primary}`,
    background: '#1A0A2E',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBackDesign: {
    background: 'linear-gradient(135deg, #2D1B4E, #1A0A2E, #0D0519)',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  patternBorder: {
    border: '2px solid rgba(255, 215, 0, 0.4)',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    width: 'calc(100% - 16px)',
    height: 'calc(100% - 16px)',
    boxSizing: 'border-box',
  },
  patternFrame: {
    border: '1px solid rgba(255, 215, 0, 0.2)',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  corner: {
    position: 'absolute',
    opacity: 0.7,
  },
  tapHint: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  tapHintText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    background: 'rgba(0, 0, 0, 0.7)',
    padding: `2px ${SPACING.sm}px`,
    borderRadius: 4,
  },
  reversedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    background: 'rgba(156, 6, 18, 0.9)',
    padding: `2px 6px`,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  reversedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  positionBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    background: 'rgba(106, 91, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${COLORS.primary}`,
    zIndex: 10,
  },
  positionBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    lineHeight: 1,
  },
};

export default CardFlipAnimation;
