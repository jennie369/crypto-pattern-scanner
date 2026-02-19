/**
 * HexagramBuilder - Web version (Framer Motion)
 * Builds I Ching hexagram from 6 lines with animated line-by-line reveal.
 * Each line: solid (yang), broken (yin), or changing (with glow).
 * Lines build from bottom to top using staggerChildren.
 * Based on App's HexagramBuilder.js.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION, BREAKPOINTS } from '../../../../web design-tokens';

const SIZES = {
  small: { width: 140, height: 10, gap: 6, yinGap: 14, labelWidth: 50 },
  normal: { width: 200, height: 14, gap: 8, yinGap: 20, labelWidth: 60 },
  large: { width: 260, height: 18, gap: 10, yinGap: 24, labelWidth: 70 },
};

/**
 * Renders a single hexagram line (yang, yin, or empty placeholder)
 */
const HexagramLine = ({ line, index, total, animated, dimensions, isCurrentLine, showLabels }) => {
  const isEmpty = !line;
  const isCurrent = isCurrentLine;
  const delay = animated ? (total - 1 - index) * 0.1 : 0;

  // Empty placeholder for uncast lines
  if (isEmpty) {
    return (
      <motion.div
        initial={animated ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: delay * 0.5, duration: 0.3 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: SPACING.md,
          marginBottom: dimensions.gap,
        }}
      >
        <div
          style={{
            width: dimensions.width,
            height: dimensions.height,
            borderRadius: 6,
            border: isCurrent
              ? `2px dashed ${COLORS.primary}`
              : '1px dashed rgba(255, 189, 89, 0.15)',
            background: isCurrent
              ? 'rgba(255, 189, 89, 0.05)'
              : 'rgba(255, 255, 255, 0.02)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Pulsing indicator for current casting line */}
          {isCurrent && (
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(90deg, transparent, rgba(255, 189, 89, 0.15), transparent)`,
                borderRadius: 6,
              }}
            />
          )}
        </div>
        {showLabels && (
          <div style={{ width: dimensions.labelWidth, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span
              style={{
                fontSize: TYPOGRAPHY.fontSize.sm,
                color: isCurrent ? COLORS.primary : COLORS.textMuted,
                fontWeight: isCurrent ? TYPOGRAPHY.fontWeight.bold : TYPOGRAPHY.fontWeight.medium,
              }}
            >
              {index + 1}
            </span>
            {isCurrent && (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{
                  fontSize: TYPOGRAPHY.fontSize.xs,
                  color: COLORS.primary,
                  fontWeight: TYPOGRAPHY.fontWeight.semibold,
                }}
              >
                Casting...
              </motion.span>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  const isYang = line.lineType === 'yang';
  const isChanging = line.isChanging;

  const changingStyles = isChanging
    ? {
        border: `1.5px solid ${COLORS.primary}`,
        boxShadow: `0 0 8px ${COLORS.primary}, 0 0 16px rgba(255, 189, 89, 0.2)`,
      }
    : {};

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.md,
        marginBottom: dimensions.gap,
      }}
    >
      {/* Line visualization */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Glow background for changing lines */}
        {isChanging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.08, 0.2, 0.08] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              width: dimensions.width + 20,
              height: 30,
              borderRadius: 15,
              background: COLORS.primary,
              filter: 'blur(10px)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Animated line container */}
        <motion.div
          initial={animated ? { opacity: 0, scaleX: 0 } : false}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{
            delay,
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
          style={{
            width: dimensions.width,
            display: 'flex',
            alignItems: 'center',
            justifyContent: isYang ? 'stretch' : 'space-between',
            transformOrigin: 'center',
          }}
        >
          {isYang ? (
            /* Yang: solid line */
            <div
              style={{
                width: '100%',
                height: dimensions.height,
                background: COLORS.primary,
                borderRadius: 6,
                ...changingStyles,
              }}
            />
          ) : (
            /* Yin: broken line (two segments with gap) */
            <>
              <div
                style={{
                  width: (dimensions.width - dimensions.yinGap) / 2,
                  height: dimensions.height,
                  background: 'rgba(255, 255, 255, 0.35)',
                  borderRadius: 6,
                  ...changingStyles,
                }}
              />
              <div style={{ width: dimensions.yinGap }} />
              <div
                style={{
                  width: (dimensions.width - dimensions.yinGap) / 2,
                  height: dimensions.height,
                  background: 'rgba(255, 255, 255, 0.35)',
                  borderRadius: 6,
                  ...changingStyles,
                }}
              />
            </>
          )}
        </motion.div>

        {/* Changing line indicator dots */}
        {isChanging && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.15, type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              position: 'absolute',
              right: -8,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              gap: 3,
              pointerEvents: 'none',
            }}
          >
            <div style={{ width: 4, height: 4, borderRadius: 2, background: COLORS.primary }} />
            <div style={{ width: 4, height: 4, borderRadius: 2, background: COLORS.primary }} />
          </motion.div>
        )}
      </div>

      {/* Line label */}
      {showLabels && (
        <motion.div
          initial={animated ? { opacity: 0, x: 10 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.05, duration: 0.3 }}
          style={{
            width: dimensions.labelWidth,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <span
            style={{
              fontSize: TYPOGRAPHY.fontSize.sm,
              color: COLORS.textMuted,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
            }}
          >
            {index + 1}
          </span>
          {isChanging && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.15 }}
              style={{
                fontSize: TYPOGRAPHY.fontSize.xs,
                color: COLORS.primary,
                fontWeight: TYPOGRAPHY.fontWeight.bold,
                marginTop: 2,
              }}
            >
              Changing
            </motion.span>
          )}
        </motion.div>
      )}
    </div>
  );
};

/**
 * Hexagram info display when complete
 */
const HexagramInfo = ({ hexagramData, animated }) => {
  if (!hexagramData) return null;

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20, scale: 0.9 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.6 }}
      style={{
        marginTop: SPACING.lg,
        padding: `${SPACING.md}px ${SPACING.xl}px`,
        borderRadius: RADIUS.md,
        background: COLORS.bgGlass,
        border: `1px solid ${COLORS.borderGold}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: SPACING.xs,
        boxShadow: SHADOWS.glow.gold,
      }}
    >
      {hexagramData.number && (
        <span
          style={{
            fontSize: TYPOGRAPHY.fontSize.xs,
            color: COLORS.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          Hexagram #{hexagramData.number}
        </span>
      )}
      {hexagramData.name && (
        <span
          style={{
            fontSize: TYPOGRAPHY.fontSize.xl,
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: COLORS.primary,
          }}
        >
          {hexagramData.name}
        </span>
      )}
      {hexagramData.chineseName && (
        <span
          style={{
            fontSize: TYPOGRAPHY.fontSize.lg,
            color: COLORS.textSecondary,
          }}
        >
          {hexagramData.chineseName}
        </span>
      )}
      {hexagramData.description && (
        <span
          style={{
            fontSize: TYPOGRAPHY.fontSize.sm,
            color: COLORS.textMuted,
            lineHeight: TYPOGRAPHY.lineHeight.relaxed,
            marginTop: SPACING.xs,
          }}
        >
          {hexagramData.description}
        </span>
      )}
    </motion.div>
  );
};

const HexagramBuilder = ({
  lines = [],
  isBuilding = false,
  currentLine = 0,
  hexagramData = null,
  showLabels = true,
  animated = true,
  size = 'normal',
  style: customStyle,
}) => {
  const dimensions = SIZES[size] || SIZES.normal;
  const isComplete = lines.length >= 6;

  // Ensure we have 6 line slots (fill with null for empty)
  const displayLines = [...lines];
  while (displayLines.length < 6) {
    displayLines.push(null);
  }

  // Reverse for display (line 6 at top, line 1 at bottom) - I Ching convention
  const reversedLines = [...displayLines].reverse();

  return (
    <div
      role="img"
      aria-label={
        isComplete
          ? `I Ching hexagram${hexagramData?.name ? `: ${hexagramData.name}` : ''} with ${lines.filter(l => l?.isChanging).length} changing lines`
          : `Building I Ching hexagram: ${lines.length} of 6 lines cast`
      }
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${SPACING.md}px 0`,
        ...customStyle,
      }}
    >
      {/* Title when building */}
      {isBuilding && !isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginBottom: SPACING.md,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: TYPOGRAPHY.fontSize.sm,
              color: COLORS.textMuted,
            }}
          >
            {lines.length} of 6 lines
          </span>
          {/* Progress dots */}
          <div
            style={{
              display: 'flex',
              gap: SPACING.xs,
              justifyContent: 'center',
              marginTop: SPACING.xs,
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  background: i < lines.length ? COLORS.primary : 'rgba(255, 255, 255, 0.1)',
                  scale: i === currentLine - 1 ? 1.3 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Hexagram lines */}
      <motion.div
        initial={animated ? 'hidden' : false}
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.08,
              staggerDirection: -1,
            },
          },
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {reversedLines.map((line, displayIndex) => {
          const realIndex = 5 - displayIndex;
          const isCurrentCastLine = isBuilding && realIndex === currentLine - 1;

          return (
            <HexagramLine
              key={displayIndex}
              line={line}
              index={realIndex}
              total={6}
              animated={animated}
              dimensions={dimensions}
              isCurrentLine={isCurrentCastLine}
              showLabels={showLabels}
            />
          );
        })}
      </motion.div>

      {/* Hexagram completion info */}
      <AnimatePresence>
        {isComplete && hexagramData && (
          <HexagramInfo hexagramData={hexagramData} animated={animated} />
        )}
      </AnimatePresence>

      {/* Completion sparkle effect */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, delay: 0.3 }}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(255, 189, 89, 0.08) 0%, transparent 70%)',
            borderRadius: RADIUS.lg,
          }}
        />
      )}
    </div>
  );
};

export default HexagramBuilder;
