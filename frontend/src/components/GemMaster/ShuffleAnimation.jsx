/**
 * ShuffleAnimation - Web component (Framer Motion)
 * Card shuffle animation: cards spread out, shuffle, and gather back.
 * Used before tarot reading begins.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION } from '../../../../web design-tokens';

const CARD_COUNT = 7;
const CARD_WIDTH = 80;
const CARD_HEIGHT = 120;

const ShuffleAnimation = ({
  isShuffling = false,
  onShuffleComplete,
  cardCount = CARD_COUNT,
  duration = 2000,
  style: customStyle,
}) => {
  const [phase, setPhase] = useState('idle'); // idle | spread | shuffle | gather | done

  useEffect(() => {
    if (!isShuffling) {
      setPhase('idle');
      return;
    }

    setPhase('spread');
    const t1 = setTimeout(() => setPhase('shuffle'), duration * 0.3);
    const t2 = setTimeout(() => setPhase('gather'), duration * 0.7);
    const t3 = setTimeout(() => {
      setPhase('done');
      onShuffleComplete?.();
    }, duration);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isShuffling, duration, onShuffleComplete]);

  const getCardVariants = (index) => {
    const totalCards = cardCount;
    const centerOffset = (index - (totalCards - 1) / 2);
    const randomAngle = (index * 37 + 13) % 30 - 15; // Deterministic pseudo-random

    return {
      idle: {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        zIndex: index,
      },
      spread: {
        x: centerOffset * (CARD_WIDTH * 0.6),
        y: Math.sin(index * 0.9) * 20,
        rotate: centerOffset * 5,
        scale: 1,
        zIndex: index,
        transition: { type: 'spring', stiffness: 200, damping: 20, delay: index * 0.04 },
      },
      shuffle: {
        x: centerOffset * (CARD_WIDTH * 0.3),
        y: ((index % 2 === 0 ? -1 : 1) * 30) + Math.sin(index) * 15,
        rotate: randomAngle,
        scale: 0.95,
        zIndex: totalCards - index,
        transition: {
          type: 'spring',
          stiffness: 150,
          damping: 12,
          delay: index * 0.03,
          repeat: 1,
          repeatType: 'reverse',
        },
      },
      gather: {
        x: 0,
        y: -index * 2,
        rotate: 0,
        scale: 1,
        zIndex: totalCards - index,
        transition: { type: 'spring', stiffness: 300, damping: 25, delay: index * 0.03 },
      },
      done: {
        x: 0,
        y: -index * 2,
        rotate: 0,
        scale: 1,
        zIndex: totalCards - index,
      },
    };
  };

  const cards = Array.from({ length: cardCount }, (_, i) => i);

  return (
    <div
      role="img"
      aria-label={isShuffling ? 'Shuffling cards...' : 'Card deck'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
        height: CARD_HEIGHT + 80,
        overflow: 'visible',
        ...customStyle,
      }}
    >
      <div style={{
        position: 'relative',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      }}>
        {cards.map((index) => (
          <motion.div
            key={index}
            variants={getCardVariants(index)}
            animate={phase}
            style={{
              position: 'absolute',
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              borderRadius: 8,
              border: `2px solid ${COLORS.primary}`,
              background: 'linear-gradient(135deg, #2D1B4E, #1A0A2E, #0D0519)',
              boxShadow: SHADOWS.card,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Simple card back pattern */}
            <div style={{
              width: CARD_WIDTH - 12,
              height: CARD_HEIGHT - 12,
              border: '1.5px solid rgba(255, 215, 0, 0.3)',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="30" height="30" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#FFD700" strokeWidth="2" fill="none" opacity="0.4" />
                <path
                  d="M50 15 L56 38 L80 38 L61 52 L68 75 L50 60 L32 75 L39 52 L20 38 L44 38 Z"
                  stroke="#FFD700"
                  strokeWidth="1.5"
                  fill="rgba(255, 215, 0, 0.1)"
                />
                <circle cx="50" cy="50" r="8" fill="#FFD700" opacity="0.5" />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Shuffling text indicator */}
      <AnimatePresence>
        {isShuffling && phase !== 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              bottom: 0,
              textAlign: 'center',
            }}
          >
            <span style={{
              fontSize: TYPOGRAPHY.fontSize.sm,
              color: COLORS.primary,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
            }}>
              Shuffling...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShuffleAnimation;
