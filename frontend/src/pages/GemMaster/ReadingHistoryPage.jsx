/**
 * ReadingHistoryPage - Reading history for Tarot and I Ching
 * Filter by type (All/Tarot/IChing/Starred), search, paginate,
 * star toggle, delete with confirmation.
 * Navigate to /gemmaster/readings/:id?type=tarot|iching for detail.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Search, X, Star, Trash2, ChevronDown, Loader2,
  Sparkles, BookOpen, Filter, Calendar, Tag,
} from 'lucide-react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION, TIER_STYLES, BREAKPOINTS } from '../../../../web design-tokens';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { readingHistoryService } from '../../services/readingHistoryService';
import TierBadge from '../../components/GemMaster/TierBadge';
import EmptyHistoryState from '../../components/GemMaster/EmptyHistoryState';

const PAGE_SIZE = 20;
const FILTER_TABS = [
  { key: 'all', label: 'Tat ca', icon: null },
  { key: 'tarot', label: 'Tarot', icon: Sparkles },
  { key: 'iching', label: 'I-Ching', icon: BookOpen },
  { key: 'starred', label: 'Da luu', icon: Star },
];

const LIFE_AREA_COLORS = {
  general: COLORS.info,
  love: '#FF6B9D',
  career: '#00F0FF',
  health: COLORS.success,
  finance: COLORS.primary,
  trading: COLORS.accent,
  spiritual: '#8B7FFF',
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hom nay';
  if (diffDays === 1) return 'Hom qua';
  if (diffDays < 7) return `${diffDays} ngay truoc`;
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });
};

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
  backBtn: {
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
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    flex: 1,
  },
  searchToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderLight}`,
    cursor: 'pointer',
    color: COLORS.textMuted,
  },
  searchBar: {
    padding: `${SPACING.sm}px ${SPACING.base}px`,
    overflow: 'hidden',
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
  searchIconPos: {
    position: 'absolute',
    left: SPACING.md,
    top: '50%',
    transform: 'translateY(-50%)',
    color: COLORS.textMuted,
    pointerEvents: 'none',
  },
  filterRow: {
    display: 'flex',
    gap: SPACING.sm,
    padding: `${SPACING.sm}px ${SPACING.base}px ${SPACING.md}px`,
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  pill: (active) => ({
    height: 44,
    minWidth: 72,
    whiteSpace: 'nowrap',
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
    flexShrink: 0,
  }),
  listWrapper: {
    padding: `0 ${SPACING.base}px`,
  },
  grid: {
    display: 'grid',
    gap: SPACING.md,
  },
  card: {
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    gap: SPACING.md,
    position: 'relative',
  },
  typeIcon: (type) => ({
    width: 44,
    height: 44,
    minWidth: 44,
    borderRadius: RADIUS.md,
    background: type === 'tarot'
      ? 'rgba(106, 91, 255, 0.15)'
      : 'rgba(0, 240, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: type === 'tarot' ? COLORS.accent : COLORS.info,
  }),
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  cardQuestion: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    flexWrap: 'wrap',
  },
  lifeAreaBadge: (area) => ({
    display: 'inline-flex',
    alignItems: 'center',
    height: 22,
    padding: `0 ${SPACING.sm}px`,
    borderRadius: RADIUS.full,
    background: `${LIFE_AREA_COLORS[area] || COLORS.textMuted}22`,
    color: LIFE_AREA_COLORS[area] || COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  }),
  starBtn: (starred) => ({
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: starred ? '#FFD700' : COLORS.textMuted,
    transition: 'color 0.2s',
  }),
  deleteBtn: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
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
    transition: 'color 0.2s',
  },
  loadMore: {
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
  },
  loadingCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['3xl'],
  },
  errorBox: {
    textAlign: 'center',
    padding: SPACING['2xl'],
    color: COLORS.error,
  },
  retryBtn: {
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
  // Confirm dialog
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: SPACING.base,
  },
  dialog: {
    background: COLORS.bgSecondary,
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    maxWidth: 360,
    width: '100%',
    textAlign: 'center',
  },
  dialogTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.sm,
  },
  dialogText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  dialogBtns: {
    display: 'flex',
    gap: SPACING.md,
  },
  dialogCancel: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.md,
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderLight}`,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.base,
    cursor: 'pointer',
  },
  dialogDelete: {
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

export default function ReadingHistoryPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, type }

  const debounceRef = useRef(null);

  // ─────────────────── Responsive ───────────────────

  const [cols, setCols] = useState(1);
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w >= BREAKPOINTS.lg) setCols(3);
      else if (w >= BREAKPOINTS.md) setCols(2);
      else setCols(1);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ─────────────────── Fetch ───────────────────

  const fetchReadings = useCallback(async (pageNum = 0, append = false) => {
    if (!user?.id) return;

    if (!append) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const options = {
        type: filter === 'starred' ? 'all' : filter,
        starredOnly: filter === 'starred',
        page: pageNum,
        limit: PAGE_SIZE,
      };

      const result = await readingHistoryService.getReadings(user.id, options);

      if (result.error) throw new Error(result.error);

      let data = result.data || [];

      // Client-side search filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        data = data.filter(r =>
          (r.question || '').toLowerCase().includes(q) ||
          (r.life_area || '').toLowerCase().includes(q)
        );
      }

      setReadings(prev => append ? [...prev, ...data] : data);
      setHasMore(result.hasMore || false);
      setPage(pageNum);
    } catch (err) {
      console.error('[ReadingHistoryPage] Fetch error:', err);
      setError(err?.message || 'Failed to load readings');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user?.id, filter, searchQuery]);

  useEffect(() => {
    fetchReadings(0);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchReadings(0);
    }, 300);
  };

  // ─────────────────── Actions ───────────────────

  const handleReadingClick = (reading) => {
    const type = reading.reading_type || reading.type || 'tarot';
    navigate(`/gemmaster/readings/${reading.id}?type=${type}`);
  };

  const handleStarToggle = async (e, reading) => {
    e.stopPropagation();
    const type = reading.reading_type || reading.type || 'tarot';
    try {
      await readingHistoryService.toggleStar(reading.id, type);
      setReadings(prev => prev.map(r =>
        r.id === reading.id ? { ...r, is_starred: !r.is_starred } : r
      ));
    } catch (err) {
      console.error('[ReadingHistoryPage] Star toggle error:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !user?.id) return;
    try {
      const { id, type } = deleteTarget;
      if (type === 'tarot') {
        await readingHistoryService.deleteTarotReading(id, user.id);
      } else if (type === 'iching') {
        await readingHistoryService.deleteIChingReading(id, user.id);
      } else {
        await readingHistoryService.deleteDivinationReading(id, user.id);
      }
      setReadings(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('[ReadingHistoryPage] Delete error:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const emptyType = filter === 'starred' ? 'general' : 'reading';

  // ─────────────────── Render ───────────────────

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <motion.button
          style={styles.backBtn}
          whileHover={{ background: COLORS.bgCardHover }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h1 style={styles.title}>Lich su Doc</h1>
        <motion.button
          style={{
            ...styles.searchToggle,
            ...(showSearch ? { borderColor: COLORS.borderAccent, color: COLORS.accent } : {}),
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSearch(!showSearch)}
          aria-label="Toggle search"
        >
          <Search size={18} />
        </motion.button>
        {profile && <TierBadge tier={profile.scanner_tier || 'FREE'} size="small" />}
      </div>

      {/* Search bar (animated) */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            style={styles.searchBar}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ position: 'relative' }}>
              <Search size={18} style={styles.searchIconPos} />
              <input
                type="text"
                placeholder="Tim kiem bai doc..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={styles.searchInput}
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div style={styles.filterRow}>
        {FILTER_TABS.map(tab => (
          <motion.button
            key={tab.key}
            style={styles.pill(filter === tab.key)}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(tab.key)}
          >
            {tab.icon && <tab.icon size={14} />}
            {tab.label}
          </motion.button>
        ))}
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
          <div style={styles.errorBox}>
            <p>{error}</p>
            <button style={styles.retryBtn} onClick={() => fetchReadings(0)}>
              Thu lai
            </button>
          </div>
        ) : readings.length === 0 ? (
          <EmptyHistoryState type={emptyType} />
        ) : (
          <>
            <div style={{
              ...styles.grid,
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
            }}>
              <AnimatePresence mode="popLayout">
                {readings.map((reading, idx) => {
                  const rType = reading.reading_type || reading.type || 'tarot';
                  return (
                    <motion.div
                      key={reading.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.03, duration: 0.25 }}
                      style={styles.card}
                      whileHover={{ borderColor: COLORS.borderAccent, boxShadow: SHADOWS.card }}
                      onClick={() => handleReadingClick(reading)}
                    >
                      {/* Type icon */}
                      <div style={styles.typeIcon(rType)}>
                        {rType === 'tarot' ? <Sparkles size={20} /> : <BookOpen size={20} />}
                      </div>

                      {/* Content */}
                      <div style={styles.cardContent}>
                        <div style={styles.cardQuestion}>
                          {reading.question || (rType === 'tarot' ? 'Tarot Reading' : 'I-Ching Reading')}
                        </div>
                        <div style={styles.cardMeta}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={12} />
                            {formatDate(reading.created_at)}
                          </span>
                          {reading.life_area && reading.life_area !== 'general' && (
                            <span style={styles.lifeAreaBadge(reading.life_area)}>
                              {reading.life_area}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Star */}
                      <button
                        style={styles.starBtn(reading.is_starred)}
                        onClick={(e) => handleStarToggle(e, reading)}
                        aria-label={reading.is_starred ? 'Unstar' : 'Star'}
                      >
                        <Star size={18} fill={reading.is_starred ? '#FFD700' : 'none'} />
                      </button>

                      {/* Delete */}
                      <button
                        style={styles.deleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ id: reading.id, type: rType });
                        }}
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {hasMore && (
              <motion.button
                style={styles.loadMore}
                whileHover={{ background: COLORS.bgCardHover }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fetchReadings(page + 1, true)}
                disabled={loadingMore}
              >
                {loadingMore ? <Loader2 size={18} /> : <ChevronDown size={18} />}
                {loadingMore ? 'Dang tai...' : 'Tai them'}
              </motion.button>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            style={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              style={styles.dialog}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.dialogTitle}>Xoa bai doc?</div>
              <div style={styles.dialogText}>
                Bai doc se bi xoa vinh vien va khong the khoi phuc.
              </div>
              <div style={styles.dialogBtns}>
                <button style={styles.dialogCancel} onClick={() => setDeleteTarget(null)}>
                  Huy
                </button>
                <button style={styles.dialogDelete} onClick={handleDeleteConfirm}>
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
