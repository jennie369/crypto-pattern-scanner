/**
 * ChatHistoryPage - Chat conversation history
 * Lists all chatbot conversations with search, filter (All/Archived),
 * pagination, delete/archive actions.
 * Navigate to /chatbot?conversation=ID to resume a conversation.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, X, Archive, MessageSquare, Trash2, ChevronDown, Loader2 } from 'lucide-react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION, TIER_STYLES, BREAKPOINTS } from '../../../../web design-tokens';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import chatHistoryService from '../../services/chatHistoryService';
import ConversationCard from '../../components/GemMaster/ConversationCard';
import EmptyHistoryState from '../../components/GemMaster/EmptyHistoryState';
import TierBadge from '../../components/GemMaster/TierBadge';

const PAGE_SIZE = 10;

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const styles = {
  container: {
    minHeight: '100vh',
    background: COLORS.bgPrimary,
    color: COLORS.textPrimary,
    paddingBottom: SPACING['4xl'],
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.md,
    padding: `${SPACING.lg}px ${SPACING.base}px`,
    borderBottom: `1px solid ${COLORS.borderLight}`,
    position: 'sticky',
    top: 0,
    background: COLORS.bgPrimary,
    zIndex: 10,
    backdropFilter: 'blur(12px)',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    minWidth: 44,
    borderRadius: RADIUS.md,
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderLight}`,
    cursor: 'pointer',
    color: COLORS.textPrimary,
    transition: 'background 0.2s',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    flex: 1,
  },
  searchWrapper: {
    padding: `${SPACING.md}px ${SPACING.base}px`,
  },
  searchInput: {
    width: '100%',
    height: 44,
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: RADIUS.md,
    padding: `0 ${SPACING.base}px 0 ${SPACING['2xl']}px`,
    color: COLORS.textPrimary,
    fontSize: 16, // Must be >= 16px to prevent iOS zoom on focus
    outline: 'none',
    boxSizing: 'border-box',
  },
  searchIcon: {
    position: 'absolute',
    left: SPACING.md,
    top: '50%',
    transform: 'translateY(-50%)',
    color: COLORS.textMuted,
    pointerEvents: 'none',
  },
  clearSearch: {
    position: 'absolute',
    right: SPACING.xs,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: COLORS.textMuted,
  },
  filterRow: {
    display: 'flex',
    gap: SPACING.sm,
    padding: `0 ${SPACING.base}px ${SPACING.md}px`,
  },
  pill: (active) => ({
    height: 44,
    minWidth: 80,
    padding: `0 ${SPACING.base}px`,
    borderRadius: RADIUS.full,
    border: `1px solid ${active ? COLORS.accent : COLORS.borderLight}`,
    background: active ? COLORS.accent : 'transparent',
    color: active ? COLORS.textPrimary : COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  }),
  listWrapper: {
    padding: `0 ${SPACING.base}px`,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: SPACING.md,
  },
  loadMoreBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    width: '100%',
    height: 48,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.md,
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderLight}`,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  loadingCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['3xl'],
  },
  errorContainer: {
    textAlign: 'center',
    padding: SPACING['2xl'],
    color: COLORS.error,
  },
  retryButton: {
    marginTop: SPACING.md,
    height: 44,
    padding: `0 ${SPACING.xl}px`,
    borderRadius: RADIUS.md,
    background: COLORS.accent,
    border: 'none',
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    cursor: 'pointer',
  },
  confirmOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: SPACING.base,
  },
  confirmDialog: {
    background: COLORS.bgSecondary,
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    maxWidth: 360,
    width: '100%',
    textAlign: 'center',
  },
  confirmTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.sm,
  },
  confirmText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  confirmBtnRow: {
    display: 'flex',
    gap: SPACING.md,
  },
  confirmCancel: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.md,
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderLight}`,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    cursor: 'pointer',
  },
  confirmDelete: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.md,
    background: COLORS.error,
    border: 'none',
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    cursor: 'pointer',
  },
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function ChatHistoryPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // State
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'archived'
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debounceRef = useRef(null);

  // ─────────────────── Fetch ───────────────────

  const fetchConversations = useCallback(async (pageNum = 0, search = '', isArchived = false, append = false) => {
    if (!user?.id) return;

    if (pageNum === 0 && !append) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      let result;
      if (isArchived) {
        result = await chatHistoryService.getArchivedConversations(user.id, {
          page: pageNum,
          limit: PAGE_SIZE,
          searchQuery: search,
        });
      } else {
        result = await chatHistoryService.getConversations(user.id, {
          page: pageNum,
          limit: PAGE_SIZE,
          searchQuery: search,
          includeArchived: false,
        });
      }

      const list = result?.conversations || [];
      setConversations(prev => append ? [...prev, ...list] : list);
      setHasMore(result?.hasMore || false);
      setPage(pageNum);
    } catch (err) {
      console.error('[ChatHistoryPage] Fetch error:', err);
      setError(err?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    fetchConversations(0, searchQuery, filter === 'archived');
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchConversations(0, value, filter === 'archived');
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchConversations(0, '', filter === 'archived');
  };

  // ─────────────────── Actions ───────────────────

  const handleConversationClick = (convId) => {
    navigate(`/chatbot?conversation=${convId}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget || !user?.id) return;
    try {
      await chatHistoryService.deleteConversation(deleteTarget, user.id);
      setConversations(prev => prev.filter(c => c.id !== deleteTarget));
    } catch (err) {
      console.error('[ChatHistoryPage] Delete error:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleArchiveToggle = async (convId, isCurrentlyArchived) => {
    if (!user?.id) return;
    try {
      if (isCurrentlyArchived) {
        await chatHistoryService.unarchiveConversation(convId, user.id);
      } else {
        await chatHistoryService.archiveConversation(convId, user.id);
      }
      setConversations(prev => prev.filter(c => c.id !== convId));
    } catch (err) {
      console.error('[ChatHistoryPage] Archive toggle error:', err);
    }
  };

  const handleLoadMore = () => {
    fetchConversations(page + 1, searchQuery, filter === 'archived', true);
  };

  // ─────────────────── Responsive ───────────────────

  const [isWide, setIsWide] = useState(window.innerWidth >= BREAKPOINTS.md);
  useEffect(() => {
    const onResize = () => setIsWide(window.innerWidth >= BREAKPOINTS.md);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ─────────────────── Render ───────────────────

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <motion.button
          style={styles.backButton}
          whileHover={{ background: COLORS.bgCardHover }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h1 style={styles.headerTitle}>Lich su Chat</h1>
        {profile && <TierBadge tier={profile.scanner_tier || 'FREE'} size="small" />}
      </div>

      {/* Search */}
      <div style={styles.searchWrapper}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tim kiem hoi thoai..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button style={styles.clearSearch} onClick={clearSearch} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div style={styles.filterRow}>
        <motion.button
          style={styles.pill(filter === 'all')}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilter('all')}
        >
          <MessageSquare size={14} />
          Tat ca
        </motion.button>
        <motion.button
          style={styles.pill(filter === 'archived')}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilter('archived')}
        >
          <Archive size={14} />
          Luu tru
        </motion.button>
      </div>

      {/* Content */}
      <div style={styles.listWrapper}>
        {loading ? (
          <div style={styles.loadingCenter}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <Loader2 size={32} color={COLORS.accent} />
            </motion.div>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <p>{error}</p>
            <button
              style={styles.retryButton}
              onClick={() => fetchConversations(0, searchQuery, filter === 'archived')}
            >
              Thu lai
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <EmptyHistoryState
            type="chat"
            isArchived={filter === 'archived'}
            onStartChat={() => navigate('/chatbot')}
          />
        ) : (
          <>
            <div style={{
              ...styles.grid,
              gridTemplateColumns: isWide ? 'repeat(2, 1fr)' : '1fr',
            }}>
              <AnimatePresence mode="popLayout">
                {conversations.map((conv, idx) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.04, duration: 0.25 }}
                  >
                    <ConversationCard
                      conversation={conv}
                      onClick={() => handleConversationClick(conv.id)}
                      onDelete={() => setDeleteTarget(conv.id)}
                      onArchive={() => handleArchiveToggle(conv.id, conv.is_archived)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {hasMore && (
              <motion.button
                style={styles.loadMoreBtn}
                whileHover={{ background: COLORS.bgCardHover, borderColor: COLORS.borderAccent }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <ChevronDown size={18} />
                )}
                {loadingMore ? 'Dang tai...' : 'Tai them'}
              </motion.button>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            style={styles.confirmOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              style={styles.confirmDialog}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.confirmTitle}>Xoa hoi thoai?</div>
              <div style={styles.confirmText}>
                Hoi thoai se bi xoa vinh vien va khong the khoi phuc.
              </div>
              <div style={styles.confirmBtnRow}>
                <button style={styles.confirmCancel} onClick={() => setDeleteTarget(null)}>
                  Huy
                </button>
                <button style={styles.confirmDelete} onClick={handleDelete}>
                  Xoa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
