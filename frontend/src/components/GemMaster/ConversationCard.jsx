/**
 * ConversationCard - Web version
 * Displays a single conversation in chat history list.
 * Features: title, preview, date, message count, hover actions (delete/archive).
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Trash2, Archive, Clock, ArchiveRestore } from 'lucide-react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION } from '../../../../web design-tokens';

/**
 * Format relative time (Vietnamese)
 */
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

const ConversationCard = ({
  conversation,
  onPress,
  onDelete,
  onArchive,
  isArchived = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const {
    id,
    title = 'Conversation',
    preview = '',
    message_count = 0,
    last_message_at,
  } = conversation || {};

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`Conversation: ${title}. ${message_count} messages. ${formatRelativeTime(last_message_at)}`}
      onClick={() => onPress?.(id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPress?.(id); } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={ANIMATION.spring}
      style={styles.container}
    >
      {/* Icon */}
      <div style={styles.iconContainer}>
        <MessageSquare size={20} color={COLORS.primary} />
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Title Row */}
        <div style={styles.titleRow}>
          <span style={styles.title}>{title}</span>
          {isArchived && (
            <span style={styles.archivedBadge}>Archived</span>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <p style={styles.preview}>{preview}</p>
        )}

        {/* Meta Row */}
        <div style={styles.metaRow}>
          <div style={styles.metaItem}>
            <Clock size={12} color={COLORS.textMuted} />
            <span style={styles.metaText}>
              {formatRelativeTime(last_message_at)}
            </span>
          </div>
          <span style={styles.messageCount}>
            {message_count} messages
          </span>
        </div>
      </div>

      {/* Hover Actions */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            style={styles.actions}
          >
            {onArchive && (
              <button
                aria-label={isArchived ? 'Unarchive conversation' : 'Archive conversation'}
                title={isArchived ? 'Unarchive' : 'Archive'}
                onClick={(e) => { e.stopPropagation(); onArchive(id); }}
                style={styles.actionButton}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(106, 91, 255, 0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(106, 91, 255, 0.15)'; }}
              >
                {isArchived ? <ArchiveRestore size={16} color={COLORS.accent} /> : <Archive size={16} color={COLORS.accent} />}
              </button>
            )}
            {onDelete && (
              <button
                aria-label="Delete conversation"
                title="Delete"
                onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                style={styles.deleteButton}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 107, 107, 0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 107, 107, 0.15)'; }}
              >
                <Trash2 size={16} color={COLORS.error} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    background: COLORS.bgGlass,
    borderRadius: RADIUS.md,
    border: `1px solid ${COLORS.borderAccent}`,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.md,
    cursor: 'pointer',
    position: 'relative',
    minHeight: 44,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    background: 'rgba(255, 189, 89, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.xs,
    minWidth: 0,
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  archivedBadge: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    padding: '2px 8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    flexShrink: 0,
    letterSpacing: '0.5px',
  },
  preview: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    lineHeight: 1.4,
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  metaRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  messageCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    background: 'rgba(106, 91, 255, 0.15)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease',
    minWidth: 44,
    minHeight: 44,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    background: 'rgba(255, 107, 107, 0.15)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease',
    minWidth: 44,
    minHeight: 44,
  },
};

export default ConversationCard;
