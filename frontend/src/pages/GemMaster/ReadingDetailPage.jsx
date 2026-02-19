/**
 * ReadingDetailPage - Full reading detail view
 * Shows Tarot or I-Ching reading details based on URL params.
 * Sections: Overview, Card/Line Analysis, Advice, Action Steps, Affirmation.
 * Features: notes editing, star toggle, share, delete, claim follow-up.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, Share2, Trash2, Loader2, AlertCircle, RefreshCw,
  MessageSquare, Edit3, Save, X, Copy, Check, Sparkles, BookOpen,
  ChevronDown, ChevronUp, Gem,
} from 'lucide-react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION, TIER_STYLES, BREAKPOINTS } from '../../../../web design-tokens';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { readingHistoryService } from '../../services/readingHistoryService';
import TarotVisual from '../../components/TarotVisual';
import HexagramVisual from '../../components/HexagramVisual';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const formatFullDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const FortuneStars = ({ rating }) => {
  const count = Math.min(Math.max(Math.round(rating || 0), 0), 5);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={18}
          fill={i <= count ? '#FFD700' : 'none'}
          color={i <= count ? '#FFD700' : COLORS.textMuted}
        />
      ))}
    </div>
  );
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
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  content: {
    maxWidth: 800,
    margin: '0 auto',
    padding: `${SPACING.lg}px ${SPACING.base}px`,
  },
  // Skeleton loading
  skeleton: {
    background: `linear-gradient(90deg, ${COLORS.bgCard} 25%, ${COLORS.bgCardHover} 50%, ${COLORS.bgCard} 75%)`,
    backgroundSize: '200% 100%',
    borderRadius: RADIUS.md,
    animation: 'shimmer 1.5s infinite',
  },
  skeletonBlock: (h) => ({
    height: h,
    marginBottom: SPACING.md,
    background: `linear-gradient(90deg, ${COLORS.bgCard} 25%, ${COLORS.bgCardHover} 50%, ${COLORS.bgCard} 75%)`,
    backgroundSize: '200% 100%',
    borderRadius: RADIUS.md,
  }),
  // Card section
  section: {
    background: COLORS.bgCard,
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.md,
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    whiteSpace: 'pre-wrap',
  },
  // Overview
  overviewRow: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  overviewLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    minWidth: 80,
  },
  overviewValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  // Notes
  notesArea: {
    width: '100%',
    minHeight: 100,
    background: COLORS.bgSecondary,
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 16, // Must be >= 16px to prevent iOS zoom on focus
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  notesSaveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    height: 44,
    padding: `0 ${SPACING.base}px`,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
    background: COLORS.accent,
    border: 'none',
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    cursor: 'pointer',
  },
  // Crystal recommendations
  crystalChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: SPACING.xs,
    height: 32,
    padding: `0 ${SPACING.md}px`,
    borderRadius: RADIUS.full,
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#8B7FFF',
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  // Actions
  actionsRow: {
    display: 'flex',
    gap: SPACING.md,
    flexWrap: 'wrap',
    marginTop: SPACING.lg,
  },
  actionBtn: (variant) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 48,
    padding: `0 ${SPACING.lg}px`,
    borderRadius: RADIUS.md,
    border: variant === 'danger'
      ? `1px solid ${COLORS.error}`
      : variant === 'primary'
        ? 'none'
        : `1px solid ${COLORS.borderLight}`,
    background: variant === 'primary'
      ? COLORS.accent
      : variant === 'danger'
        ? 'transparent'
        : COLORS.bgCard,
    color: variant === 'danger'
      ? COLORS.error
      : COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    cursor: 'pointer',
    flex: variant === 'primary' ? 1 : 'unset',
    minWidth: 120,
  }),
  // Error state
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['3xl'],
    gap: SPACING.md,
    textAlign: 'center',
  },
  errorIcon: {
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  retryBtn: {
    height: 44,
    padding: `0 ${SPACING.xl}px`,
    borderRadius: RADIUS.md,
    background: COLORS.accent,
    border: 'none',
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
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

export default function ReadingDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const readingType = searchParams.get('type') || 'tarot';
  const { user } = useAuth();

  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Notes
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  // Star
  const [starred, setStarred] = useState(false);

  // Share feedback
  const [copied, setCopied] = useState(false);

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ─────────────────── Fetch ───────────────────

  const fetchReading = useCallback(async () => {
    if (!id || !user?.id) return;
    setLoading(true);
    setError(null);

    try {
      let result;

      if (readingType === 'tarot') {
        result = await readingHistoryService.getTarotReadingById(id, user.id);
      } else if (readingType === 'iching') {
        result = await readingHistoryService.getIChingReadingById(id, user.id);
      } else {
        // Fallback to unified table
        result = await readingHistoryService.getDivinationReadingById(id, user.id);
      }

      if (result.error) throw new Error(result.error);
      if (!result.data) throw new Error('Reading not found');

      setReading(result.data);
      setNotes(result.data.notes || '');
      setStarred(result.data.is_starred || false);
    } catch (err) {
      console.error('[ReadingDetailPage] Fetch error:', err);
      setError(err?.message || 'Failed to load reading');
    } finally {
      setLoading(false);
    }
  }, [id, user?.id, readingType]);

  useEffect(() => {
    fetchReading();
  }, [fetchReading]);

  // ─────────────────── Actions ───────────────────

  const handleStarToggle = async () => {
    try {
      await readingHistoryService.toggleStar(id, readingType);
      setStarred(!starred);
    } catch (err) {
      console.error('[ReadingDetailPage] Star error:', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!user?.id) return;
    setSavingNotes(true);
    try {
      if (readingType === 'tarot') {
        await readingHistoryService.updateTarotNotes(id, user.id, notes);
      } else if (readingType === 'iching') {
        await readingHistoryService.updateIChingNotes(id, user.id, notes);
      } else {
        await readingHistoryService.updateDivinationNotes(id, user.id, notes);
      }
      setEditingNotes(false);
    } catch (err) {
      console.error('[ReadingDetailPage] Save notes error:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleShare = async () => {
    const text = [
      reading?.question ? `Question: ${reading.question}` : '',
      reading?.overall_interpretation || reading?.ai_interpretation || '',
      reading?.affirmation ? `\nAffirmation: ${reading.affirmation}` : '',
    ].filter(Boolean).join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      console.warn('[ReadingDetailPage] Clipboard not available');
    }
  };

  const handleDelete = async () => {
    if (!user?.id) return;
    try {
      if (readingType === 'tarot') {
        await readingHistoryService.deleteTarotReading(id, user.id);
      } else if (readingType === 'iching') {
        await readingHistoryService.deleteIChingReading(id, user.id);
      } else {
        await readingHistoryService.deleteDivinationReading(id, user.id);
      }
      navigate('/gemmaster/readings', { replace: true });
    } catch (err) {
      console.error('[ReadingDetailPage] Delete error:', err);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleClaim = () => {
    const prompt = reading?.question
      ? `Toi muon hieu sau hon ve: ${reading.question}`
      : 'Toi muon hieu sau hon ve bai doc truoc cua toi';
    navigate(`/chatbot?initialPrompt=${encodeURIComponent(prompt)}`);
  };

  // ─────────────────── Render helpers ───────────────────

  const renderSkeleton = () => (
    <div style={styles.content}>
      <div style={styles.skeletonBlock(32)} />
      <div style={styles.skeletonBlock(120)} />
      <div style={styles.skeletonBlock(200)} />
      <div style={styles.skeletonBlock(80)} />
    </div>
  );

  const renderError = () => (
    <div style={styles.errorContainer}>
      <AlertCircle size={48} style={styles.errorIcon} />
      <div style={{ fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold }}>
        {error || 'Something went wrong'}
      </div>
      <div style={{ fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textMuted }}>
        Khong the tai bai doc nay.
      </div>
      <button style={styles.retryBtn} onClick={fetchReading}>
        <RefreshCw size={16} />
        Thu lai
      </button>
    </div>
  );

  const renderTarotCards = () => {
    if (!reading?.cards || !Array.isArray(reading.cards)) return null;
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <Sparkles size={18} color={COLORS.accent} />
          Cards
        </div>
        <TarotVisual cards={reading.cards} spreadType={reading.spread_type} />
      </div>
    );
  };

  const renderHexagram = () => {
    if (!reading?.present_hexagram) return null;
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <BookOpen size={18} color={COLORS.info} />
          Hexagram
        </div>
        <HexagramVisual hexagram={reading.present_hexagram} />
      </div>
    );
  };

  // ─────────────────── Main render ───────────────────

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

        <div style={styles.headerTitle}>
          {loading ? 'Loading...' : reading?.question || (readingType === 'tarot' ? 'Tarot Reading' : 'I-Ching Reading')}
        </div>

        {!loading && reading && (
          <motion.button
            style={{
              ...styles.iconBtn,
              color: starred ? '#FFD700' : COLORS.textMuted,
              borderColor: starred ? 'rgba(255, 215, 0, 0.3)' : COLORS.borderLight,
            }}
            whileTap={{ scale: 0.9 }}
            onClick={handleStarToggle}
            aria-label={starred ? 'Unstar' : 'Star'}
          >
            <Star size={18} fill={starred ? '#FFD700' : 'none'} />
          </motion.button>
        )}
      </div>

      {/* Body */}
      {loading ? renderSkeleton() : error ? renderError() : reading && (
        <motion.div
          style={styles.content}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overview section */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Overview</div>

            {reading.question && (
              <div style={styles.overviewRow}>
                <span style={styles.overviewLabel}>Cau hoi:</span>
                <span style={styles.overviewValue}>{reading.question}</span>
              </div>
            )}

            <div style={styles.overviewRow}>
              <span style={styles.overviewLabel}>Loai:</span>
              <span style={styles.overviewValue}>
                {readingType === 'tarot' ? 'Tarot' : 'I-Ching'}
              </span>
            </div>

            {reading.spread_type && (
              <div style={styles.overviewRow}>
                <span style={styles.overviewLabel}>Spread:</span>
                <span style={styles.overviewValue}>{reading.spread_type}</span>
              </div>
            )}

            {reading.life_area && (
              <div style={styles.overviewRow}>
                <span style={styles.overviewLabel}>Linh vuc:</span>
                <span style={styles.overviewValue}>{reading.life_area}</span>
              </div>
            )}

            <div style={styles.overviewRow}>
              <span style={styles.overviewLabel}>Ngay:</span>
              <span style={styles.overviewValue}>{formatFullDate(reading.created_at)}</span>
            </div>

            {reading.fortune_rating && (
              <div style={styles.overviewRow}>
                <span style={styles.overviewLabel}>Fortune:</span>
                <FortuneStars rating={reading.fortune_rating} />
              </div>
            )}
          </div>

          {/* Visual: Tarot cards or Hexagram */}
          {readingType === 'tarot' ? renderTarotCards() : renderHexagram()}

          {/* AI Interpretation */}
          {(reading.ai_interpretation || reading.overall_interpretation) && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                <Sparkles size={18} color={COLORS.primary} />
                Giai doan
              </div>
              <div style={styles.sectionText}>
                {reading.ai_interpretation || reading.overall_interpretation}
              </div>
            </div>
          )}

          {/* Affirmation */}
          {reading.affirmation && (
            <div style={{
              ...styles.section,
              background: 'rgba(106, 91, 255, 0.08)',
              borderColor: COLORS.borderAccent,
            }}>
              <div style={styles.sectionTitle}>
                <Star size={18} color={COLORS.accent} />
                Affirmation
              </div>
              <div style={{
                ...styles.sectionText,
                fontStyle: 'italic',
                color: COLORS.textPrimary,
                fontSize: TYPOGRAPHY.fontSize.md,
              }}>
                "{reading.affirmation}"
              </div>
            </div>
          )}

          {/* Crystal Recommendations */}
          {reading.crystal_recommendations && reading.crystal_recommendations.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                <Gem size={18} color="#8B7FFF" />
                Crystal Recommendations
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {reading.crystal_recommendations.map((crystal, i) => (
                  <span key={i} style={styles.crystalChip}>
                    <Gem size={12} />
                    {typeof crystal === 'string' ? crystal : crystal.name || crystal.crystal}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes section */}
          <div style={styles.section}>
            <div style={{
              ...styles.sectionTitle,
              justifyContent: 'space-between',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
                <Edit3 size={18} color={COLORS.textMuted} />
                Ghi chu
              </span>
              {!editingNotes && (
                <motion.button
                  style={{
                    ...styles.iconBtn,
                    width: 44,
                    height: 44,
                    minWidth: 44,
                  }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingNotes(true)}
                  aria-label="Edit notes"
                >
                  <Edit3 size={14} />
                </motion.button>
              )}
            </div>

            {editingNotes ? (
              <>
                <textarea
                  style={styles.notesArea}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Them ghi chu cua ban..."
                  autoFocus
                />
                <div style={{ display: 'flex', gap: SPACING.sm }}>
                  <button style={styles.notesSaveBtn} onClick={handleSaveNotes} disabled={savingNotes}>
                    {savingNotes ? <Loader2 size={14} /> : <Save size={14} />}
                    {savingNotes ? 'Dang luu...' : 'Luu'}
                  </button>
                  <button
                    style={{
                      ...styles.notesSaveBtn,
                      background: COLORS.bgCard,
                      border: `1px solid ${COLORS.borderLight}`,
                    }}
                    onClick={() => {
                      setNotes(reading.notes || '');
                      setEditingNotes(false);
                    }}
                  >
                    Huy
                  </button>
                </div>
              </>
            ) : (
              <div style={{
                ...styles.sectionText,
                color: notes ? COLORS.textSecondary : COLORS.textMuted,
                fontStyle: notes ? 'normal' : 'italic',
              }}>
                {notes || 'Chua co ghi chu. Nhan nut chinh sua de them.'}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={styles.actionsRow}>
            <motion.button
              style={styles.actionBtn('primary')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClaim}
            >
              <MessageSquare size={18} />
              Hoi them
            </motion.button>

            <motion.button
              style={styles.actionBtn('secondary')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
            >
              {copied ? <Check size={18} color={COLORS.success} /> : <Copy size={18} />}
              {copied ? 'Da copy!' : 'Copy'}
            </motion.button>

            <motion.button
              style={styles.actionBtn('danger')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={18} />
              Xoa
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            style={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
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
                <button style={styles.dialogCancel} onClick={() => setShowDeleteConfirm(false)}>
                  Huy
                </button>
                <button style={styles.dialogDelete} onClick={handleDelete}>
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
