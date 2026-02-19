/**
 * EmptyHistoryState - Web version
 * Shown when user has no chat/reading history.
 * Features: animated illustration, message, action button.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Star } from 'lucide-react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, GRADIENTS, SHADOWS, ANIMATION } from '../../../../web design-tokens';

const EmptyHistoryState = ({ onStartChat, isArchived = false, type = 'chat' }) => {
  const titles = {
    chat: isArchived ? 'No archived chats' : 'No conversations yet',
    reading: 'No readings yet',
    general: 'Nothing here yet',
  };

  const descriptions = {
    chat: isArchived
      ? 'Archived conversations will appear here.'
      : 'Start a conversation with Gemral to get guidance and insights!',
    reading: 'Your tarot and I Ching reading history will appear here.',
    general: 'Content will appear here once you get started.',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={styles.container}
      role="status"
      aria-label={titles[type] || titles.general}
    >
      {/* Illustration */}
      <div style={styles.illustrationContainer}>
        {/* Decorative stars */}
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ ...styles.star, top: 10, left: 20 }}
        >
          <Star size={14} color="rgba(255, 189, 89, 0.3)" />
        </motion.div>
        <motion.div
          animate={{ opacity: [0.15, 0.4, 0.15], scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          style={{ ...styles.star, top: 25, right: 15 }}
        >
          <Star size={10} color="rgba(255, 189, 89, 0.2)" />
        </motion.div>
        <motion.div
          animate={{ opacity: [0.2, 0.45, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ ...styles.star, bottom: 20, left: 10 }}
        >
          <Star size={12} color="rgba(255, 189, 89, 0.25)" />
        </motion.div>

        {/* Main icon circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...ANIMATION.springBouncy, delay: 0.2 }}
          style={styles.iconGradient}
        >
          <MessageSquare size={48} color={COLORS.bgPrimary} />
        </motion.div>
      </div>

      {/* Text Content */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={styles.title}
      >
        {titles[type] || titles.general}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={styles.description}
      >
        {descriptions[type] || descriptions.general}
      </motion.p>

      {/* Action Button */}
      {!isArchived && onStartChat && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05, boxShadow: SHADOWS.glow.gold }}
          whileTap={{ scale: 0.97 }}
          onClick={onStartChat}
          style={styles.actionButton}
          aria-label="Start a new conversation"
        >
          <Sparkles size={18} color={COLORS.primary} />
          <span style={styles.actionButtonText}>Start a conversation</span>
        </motion.button>
      )}
    </motion.div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${SPACING['4xl']}px ${SPACING['2xl']}px`,
    minHeight: 300,
    textAlign: 'center',
  },
  illustrationContainer: {
    width: 140,
    height: 140,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  star: {
    position: 'absolute',
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    background: GRADIENTS.primaryCSS,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 32px rgba(255, 189, 89, 0.3)`,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    margin: `0 0 ${SPACING.sm}px 0`,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    margin: `0 0 ${SPACING['2xl']}px 0`,
    maxWidth: 360,
  },
  actionButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: `${SPACING.md}px ${SPACING.xl}px`,
    borderRadius: RADIUS.md,
    border: `1.5px solid ${COLORS.primary}`,
    background: 'rgba(255, 189, 89, 0.1)',
    cursor: 'pointer',
    minHeight: 44,
    transition: 'all 0.2s ease',
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
};

export default EmptyHistoryState;
