/**
 * CoinCastAnimation - Web version (Framer Motion)
 * I Ching coin casting animation: 3 coins flip and land (heads=yang, tails=yin).
 * Shows line building as coins are cast (6 times for hexagram).
 * Based on App's CoinCastAnimation.js with Framer Motion spring animations.
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION, BREAKPOINTS } from '../../../../web design-tokens';

const COIN_SIZE = 56;
const COIN_SIZE_MOBILE = 48;

/**
 * I-Ching coin toss logic:
 * - 3 coins, each has heads (value 3) or tails (value 2)
 * - Sum = 6, 7, 8, or 9
 * - 6 = Old Yin (changing broken line)
 * - 7 = Young Yang (stable solid line)
 * - 8 = Young Yin (stable broken line)
 * - 9 = Old Yang (changing solid line)
 */
const tossCoin = () => (Math.random() > 0.5 ? 3 : 2);

const sumToLineResult = (sum) => {
  switch (sum) {
    case 6: return { lineType: 'yin', isChanging: true, label: 'Old Yin' };
    case 7: return { lineType: 'yang', isChanging: false, label: 'Young Yang' };
    case 8: return { lineType: 'yin', isChanging: false, label: 'Young Yin' };
    case 9: return { lineType: 'yang', isChanging: true, label: 'Old Yang' };
    default: return { lineType: 'yang', isChanging: false, label: 'Yang' };
  }
};

/**
 * Single coin face with heads/tails visual
 */
const CoinFace = ({ isHeads, size = COIN_SIZE, revealed = true }) => {
  if (!revealed) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          border: `2px dashed rgba(255, 189, 89, 0.2)`,
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: size * 0.25,
            background: 'rgba(106, 91, 255, 0.15)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: isHeads
          ? `linear-gradient(135deg, ${COLORS.primary}, #FF8A00)`
          : 'linear-gradient(135deg, #C0C0C0, #707070)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isHeads
          ? `0 2px 12px rgba(255, 189, 89, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)`
          : `0 2px 12px rgba(128, 128, 128, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)`,
        border: `2px solid ${isHeads ? COLORS.primary : '#A0A0A0'}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Inner circle */}
      <div
        style={{
          width: size * 0.6,
          height: size * 0.6,
          borderRadius: size * 0.3,
          border: `1.5px solid ${isHeads ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Center dot for heads, empty for tails */}
        {isHeads ? (
          <div
            style={{
              width: size * 0.18,
              height: size * 0.18,
              borderRadius: size * 0.09,
              background: 'rgba(139, 105, 20, 0.7)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
            }}
          />
        ) : (
          <div
            style={{
              width: size * 0.22,
              height: size * 0.22,
              borderRadius: size * 0.11,
              border: '1.5px solid rgba(74, 74, 74, 0.5)',
            }}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Line result preview (miniature yang/yin line)
 */
const LineResultPreview = ({ lineType, isChanging }) => {
  const isYang = lineType === 'yang';
  const changingBorder = isChanging
    ? { border: `1.5px solid ${COLORS.primary}`, boxShadow: SHADOWS.glow.gold }
    : {};

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isYang ? 'stretch' : 'space-between',
        width: 100,
        height: 10,
      }}
    >
      {isYang ? (
        <div
          style={{
            width: '100%',
            height: 10,
            background: COLORS.primary,
            borderRadius: 5,
            ...changingBorder,
          }}
        />
      ) : (
        <>
          <div
            style={{
              width: 40,
              height: 10,
              background: 'rgba(255, 255, 255, 0.35)',
              borderRadius: 5,
              ...changingBorder,
            }}
          />
          <div
            style={{
              width: 40,
              height: 10,
              background: 'rgba(255, 255, 255, 0.35)',
              borderRadius: 5,
              ...changingBorder,
            }}
          />
        </>
      )}
    </div>
  );
};

const CoinCastAnimation = ({
  onCastComplete,
  isActive = true,
  castNumber = 1,
  result = null,
  style: customStyle,
}) => {
  const [coins, setCoins] = useState([null, null, null]);
  const [isTossing, setIsTossing] = useState(false);
  const [lineResult, setLineResult] = useState(null);
  const tossTimeouts = useRef([]);

  const cleanup = useCallback(() => {
    tossTimeouts.current.forEach(clearTimeout);
    tossTimeouts.current = [];
  }, []);

  const startToss = useCallback(() => {
    if (isTossing || !isActive) return;

    cleanup();
    setIsTossing(true);
    setLineResult(null);
    setCoins([null, null, null]);

    // Generate coin values
    const coin1 = tossCoin();
    const coin2 = tossCoin();
    const coin3 = tossCoin();
    const coinResults = [coin1, coin2, coin3];
    const sum = coin1 + coin2 + coin3;
    const lineData = sumToLineResult(sum);

    // Stagger coin reveals
    coinResults.forEach((value, i) => {
      const t = setTimeout(() => {
        setCoins((prev) => {
          const next = [...prev];
          next[i] = value;
          return next;
        });
      }, 200 + i * 200);
      tossTimeouts.current.push(t);
    });

    // Show result after all coins
    const resultTimeout = setTimeout(() => {
      setLineResult(lineData);
      setIsTossing(false);
    }, 200 + 3 * 200 + 100);
    tossTimeouts.current.push(resultTimeout);

    // Notify parent
    const completeTimeout = setTimeout(() => {
      onCastComplete?.({
        position: castNumber,
        sum,
        lineType: lineData.lineType,
        isChanging: lineData.isChanging,
        coins: coinResults,
      });
    }, 200 + 3 * 200 + 400);
    tossTimeouts.current.push(completeTimeout);
  }, [isTossing, isActive, castNumber, onCastComplete, cleanup]);

  // If a result is passed in, display it directly
  const displayResult = result ? sumToLineResult(
    result === 'old_yin' ? 6 :
    result === 'young_yang' ? 7 :
    result === 'young_yin' ? 8 :
    result === 'old_yang' ? 9 : 7
  ) : lineResult;

  return (
    <div
      role="region"
      aria-label={`Coin cast ${castNumber} of 6`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${SPACING.md}px ${SPACING.lg}px`,
        ...customStyle,
      }}
    >
      {/* Line number indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          marginBottom: SPACING.sm,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: TYPOGRAPHY.fontSize.lg,
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: COLORS.info,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          Line {castNumber}
        </span>
      </motion.div>

      {/* Coins row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: SPACING.lg,
          marginTop: SPACING.md,
          marginBottom: SPACING.md,
          minHeight: COIN_SIZE + 30,
          alignItems: 'flex-start',
        }}
      >
        {[0, 1, 2].map((coinIndex) => {
          const coinValue = coins[coinIndex];
          const isRevealed = coinValue !== null;
          const isHeads = coinValue === 3;

          return (
            <div
              key={coinIndex}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: SPACING.xs,
              }}
            >
              {isTossing && !isRevealed ? (
                /* Flipping coin animation */
                <motion.div
                  animate={{
                    rotateX: [0, 360, 720, 1080],
                    y: [0, -40, -30, 0],
                    scale: [1, 0.9, 1.05, 1],
                  }}
                  transition={{
                    duration: 0.5 + coinIndex * 0.1,
                    ease: 'easeOut',
                    repeat: Infinity,
                    repeatDelay: 0.1,
                  }}
                  style={{ perspective: 600 }}
                >
                  <CoinFace isHeads size={COIN_SIZE} />
                </motion.div>
              ) : isRevealed ? (
                /* Landed coin with bounce */
                <motion.div
                  initial={{ scale: 0.6, opacity: 0, y: -20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 15,
                    mass: 0.8,
                  }}
                >
                  <CoinFace isHeads={isHeads} size={COIN_SIZE} />
                </motion.div>
              ) : (
                /* Empty placeholder */
                <CoinFace isHeads={false} size={COIN_SIZE} revealed={false} />
              )}

              {/* Coin label */}
              <AnimatePresence>
                {isRevealed && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      fontSize: TYPOGRAPHY.fontSize.xs,
                      color: isHeads ? COLORS.primary : COLORS.textMuted,
                      fontWeight: TYPOGRAPHY.fontWeight.medium,
                    }}
                  >
                    {isHeads ? 'Yang (3)' : 'Yin (2)'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Result line preview */}
      <AnimatePresence>
        {displayResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={ANIMATION.spring}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: SPACING.xs,
              marginTop: SPACING.sm,
            }}
          >
            <LineResultPreview
              lineType={displayResult.lineType}
              isChanging={displayResult.isChanging}
            />
            <span
              style={{
                fontSize: TYPOGRAPHY.fontSize.sm,
                color: COLORS.textSecondary,
                fontWeight: TYPOGRAPHY.fontWeight.medium,
              }}
            >
              {displayResult.label}
              {displayResult.isChanging ? ' (Changing)' : ' (Stable)'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toss button */}
      {!displayResult && isActive && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startToss}
          disabled={isTossing || !isActive}
          aria-label={isTossing ? 'Casting coins...' : `Cast coins for line ${castNumber}`}
          style={{
            marginTop: SPACING.md,
            padding: `${SPACING.sm}px ${SPACING.xl}px`,
            borderRadius: RADIUS.full,
            border: 'none',
            cursor: isTossing ? 'wait' : 'pointer',
            background: isTossing
              ? 'rgba(255, 189, 89, 0.3)'
              : `linear-gradient(135deg, ${COLORS.primary}, #FF8A00)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: SPACING.sm,
            minHeight: 44,
            minWidth: 140,
            opacity: isTossing ? 0.6 : 1,
            transition: 'opacity 0.2s ease',
            boxShadow: isTossing ? 'none' : SHADOWS.glow.gold,
          }}
        >
          {/* Sparkle SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F1030" strokeWidth="2">
            <path d="M12 3v1m0 16v1m-7.07-2.93l.71-.71M5.64 5.64l-.71-.71M3 12h1m16 0h1m-2.93 7.07l-.71-.71M18.36 5.64l.71-.71" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <span
            style={{
              fontSize: TYPOGRAPHY.fontSize.md,
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              color: '#0F1030',
            }}
          >
            {isTossing ? 'Casting...' : 'Cast Coins'}
          </span>
        </motion.button>
      )}
    </div>
  );
};

export default CoinCastAnimation;
