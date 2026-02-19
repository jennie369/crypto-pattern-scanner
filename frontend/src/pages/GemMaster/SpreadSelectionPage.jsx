/**
 * SpreadSelectionPage - Tarot spread picker
 * Category-filtered grid of spread cards.
 * Premium spreads show lock icon + UpgradeModal on click.
 * Accessible spreads navigate to /gemmaster/reading?spread=SPREAD_ID.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Lock, Clock, Layers, Info, X, ChevronRight,
  Sparkles, Heart, Briefcase, TrendingUp, Crown, Star,
} from 'lucide-react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION, TIER_STYLES, BREAKPOINTS } from '../../../../web design-tokens';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import TierBadge from '../../components/GemMaster/TierBadge';
import UpgradeModal from '../../components/GemMaster/UpgradeModal';
import { useAccessControl } from '../../hooks/useAccessControl';

// ─────────────────────────────────────────────
// Data (inline fallback if tarotSpreadService not ready)
// ─────────────────────────────────────────────

const SPREAD_DATA = [
  { id: 'single', name: 'Mot la', nameEn: 'Single Card', cards: 1, tier: 'FREE', category: 'general', time: '2 phut', description: 'Rut mot la de nhan thong diep nhanh' },
  { id: 'past-present-future', name: 'Qua khu - Hien tai - Tuong lai', nameEn: 'Past-Present-Future', cards: 3, tier: 'FREE', category: 'general', time: '5 phut', description: 'Ba la bai dai dien cho qua khu, hien tai va tuong lai' },
  { id: 'celtic-cross', name: 'Celtic Cross', nameEn: 'Celtic Cross', cards: 10, tier: 'TIER2', category: 'advanced', time: '15 phut', description: 'Trai bai kinh dien voi 10 la' },
  { id: 'love', name: 'Tinh yeu', nameEn: 'Love Spread', cards: 5, tier: 'TIER1', category: 'love', time: '8 phut', description: 'Phan tich moi quan he tinh cam' },
  { id: 'career', name: 'Su nghiep', nameEn: 'Career Spread', cards: 5, tier: 'TIER1', category: 'career', time: '8 phut', description: 'Huong dan su nghiep va cong viec' },
  { id: 'trading', name: 'Trading Insight', nameEn: 'Trading Spread', cards: 4, tier: 'TIER2', category: 'trading', time: '6 phut', description: 'Phan tich tam ly trading' },
  { id: 'year-ahead', name: 'Nam toi', nameEn: 'Year Ahead', cards: 12, tier: 'TIER3', category: 'advanced', time: '20 phut', description: '12 la cho 12 thang toi' },
];

const CATEGORIES = [
  { key: 'all', label: 'Tat ca', icon: null },
  { key: 'general', label: 'Tong quat', icon: Sparkles },
  { key: 'love', label: 'Tinh yeu', icon: Heart },
  { key: 'career', label: 'Su nghiep', icon: Briefcase },
  { key: 'trading', label: 'Trading', icon: TrendingUp },
  { key: 'advanced', label: 'Nang cao', icon: Crown },
];

const TIER_ORDER = { FREE: 0, TIER1: 1, TIER2: 2, TIER3: 3 };

const DIFFICULTY_MAP = {
  1: 'De',
  3: 'Trung binh',
  4: 'Trung binh',
  5: 'Trung binh',
  10: 'Kho',
  12: 'Nang cao',
};

const getDifficulty = (cards) => {
  if (cards <= 1) return 'De';
  if (cards <= 5) return 'Trung binh';
  if (cards <= 10) return 'Kho';
  return 'Nang cao';
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
  iconBtn: {
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
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  historyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.xs,
    height: 44,
    padding: `0 ${SPACING.md}px`,
    borderRadius: RADIUS.full,
    background: 'transparent',
    border: `1px solid ${COLORS.borderLight}`,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    cursor: 'pointer',
  },
  filterRow: {
    display: 'flex',
    gap: SPACING.sm,
    padding: `${SPACING.md}px ${SPACING.base}px`,
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  pill: (active) => ({
    height: 44,
    minWidth: 64,
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
  gridWrapper: {
    padding: `0 ${SPACING.base}px`,
  },
  grid: {
    display: 'grid',
    gap: SPACING.md,
  },
  card: (locked) => ({
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden',
    opacity: locked ? 0.75 : 1,
  }),
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  cardName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: 2,
  },
  cardNameEn: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  lockOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  lockBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    background: 'rgba(255, 255, 255, 0.1)',
  },
  infoToggle: {
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
  },
  descriptionExpanded: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    background: COLORS.bgSecondary,
    borderRadius: RADIUS.md,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function SpreadSelectionPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { tier, canUse, showUpgradeModal, setShowUpgradeModal } = useAccessControl();

  const [category, setCategory] = useState('all');
  const [expandedCard, setExpandedCard] = useState(null);
  const [upgradeTarget, setUpgradeTarget] = useState(null);

  // ─────────────────── Responsive ───────────────────

  const [cols, setCols] = useState(1);
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w >= BREAKPOINTS.lg) setCols(3);
      else if (w >= BREAKPOINTS.sm) setCols(2);
      else setCols(1);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ─────────────────── Filtering ───────────────────

  const filteredSpreads = category === 'all'
    ? SPREAD_DATA
    : SPREAD_DATA.filter(s => s.category === category);

  const userTierNum = TIER_ORDER[tier?.toUpperCase()] || 0;

  const isLocked = (spread) => {
    const spreadTierNum = TIER_ORDER[spread.tier] || 0;
    return spreadTierNum > userTierNum;
  };

  // ─────────────────── Actions ───────────────────

  const handleSpreadClick = (spread) => {
    if (isLocked(spread)) {
      setUpgradeTarget(spread.tier);
      setShowUpgradeModal(true);
    } else {
      navigate(`/gemmaster/reading?spread=${spread.id}`);
    }
  };

  const toggleInfo = (e, spreadId) => {
    e.stopPropagation();
    setExpandedCard(expandedCard === spreadId ? null : spreadId);
  };

  // ─────────────────── Render ───────────────────

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <motion.button
          style={styles.iconBtn}
          whileHover={{ background: COLORS.bgCardHover }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h1 style={styles.headerTitle}>Chon Trai Bai</h1>
        <motion.button
          style={styles.historyBtn}
          whileHover={{ borderColor: COLORS.borderAccent }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/gemmaster/readings')}
        >
          <Clock size={14} />
          Lich su
        </motion.button>
      </div>

      {/* Category tabs */}
      <div style={styles.filterRow}>
        {CATEGORIES.map(cat => (
          <motion.button
            key={cat.key}
            style={styles.pill(category === cat.key)}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCategory(cat.key)}
          >
            {cat.icon && <cat.icon size={14} />}
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Spread grid */}
      <div style={styles.gridWrapper}>
        <div style={{
          ...styles.grid,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}>
          <AnimatePresence mode="popLayout">
            {filteredSpreads.map((spread, idx) => {
              const locked = isLocked(spread);
              const expanded = expandedCard === spread.id;
              const tierStyle = TIER_STYLES[spread.tier] || TIER_STYLES.FREE;

              return (
                <motion.div
                  key={spread.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05, duration: 0.25 }}
                  style={styles.card(locked)}
                  whileHover={{
                    borderColor: locked ? COLORS.borderLight : COLORS.borderAccent,
                    boxShadow: locked ? 'none' : SHADOWS.card,
                  }}
                  onClick={() => handleSpreadClick(spread)}
                >
                  {/* Top row */}
                  <div style={styles.cardTop}>
                    <div>
                      <div style={styles.cardName}>{spread.name}</div>
                      <div style={styles.cardNameEn}>{spread.nameEn}</div>
                    </div>
                  </div>

                  {/* Meta */}
                  <div style={styles.cardMeta}>
                    <span style={styles.metaItem}>
                      <Layers size={14} />
                      {spread.cards} la
                    </span>
                    <span style={styles.metaItem}>
                      <Clock size={14} />
                      {spread.time}
                    </span>
                    <span style={styles.metaItem}>
                      {getDifficulty(spread.cards)}
                    </span>
                  </div>

                  {/* Description (collapsed by default) */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={styles.descriptionExpanded}>
                          {spread.description}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Lock / Tier badge */}
                  <div style={styles.lockOverlay}>
                    {locked ? (
                      <div style={styles.lockBadge}>
                        <Lock size={14} color={tierStyle.color} />
                      </div>
                    ) : null}
                    {spread.tier !== 'FREE' && (
                      <TierBadge tier={spread.tier} size="small" showLabel={false} />
                    )}
                  </div>

                  {/* Info toggle */}
                  <button
                    style={styles.infoToggle}
                    onClick={(e) => toggleInfo(e, spread.id)}
                    aria-label="Toggle description"
                  >
                    <Info size={14} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        currentTier={tier?.toUpperCase() || 'FREE'}
        targetTier={upgradeTarget || 'TIER1'}
        onClose={() => {
          setShowUpgradeModal(false);
          setUpgradeTarget(null);
        }}
      />
    </div>
  );
}
