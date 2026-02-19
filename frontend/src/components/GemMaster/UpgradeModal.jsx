/**
 * UpgradeModal - Web component
 * Modal prompting tier upgrade. Shows current tier, benefits of next tier, pricing.
 * Animated with Framer Motion (overlay fade + modal slide-up).
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Check, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION, TIER_STYLES, GRADIENTS } from '../../../../web design-tokens';

const TIER_BENEFITS = {
  TIER1: {
    price: '$4.99/mo',
    features: [
      '50 chats/day (5x more)',
      '3 tarot readings/day',
      '3 I Ching readings/day',
      '30-day memory',
      'Gamification & streaks',
      'Basic personalization',
    ],
  },
  TIER2: {
    price: '$9.99/mo',
    features: [
      '200 chats/day (20x more)',
      '10 tarot readings/day',
      '10 I Ching readings/day',
      '90-day memory',
      'Voice input',
      'PDF export',
      'Advanced emotion detection',
      'Ritual & pattern AI',
    ],
  },
  TIER3: {
    price: '$19.99/mo',
    features: [
      'Unlimited everything',
      'Forever memory',
      'PDF/CSV/JSON export',
      'Full personalization',
      'All proactive AI features',
      'Priority support',
      'All RAG/Knowledge access',
    ],
  },
};

const getNextTier = (currentTier) => {
  const map = { FREE: 'TIER1', TIER1: 'TIER2', TIER2: 'TIER3', TIER3: null };
  return map[currentTier] || 'TIER1';
};

const UpgradeModal = ({
  isOpen,
  onClose,
  currentTier = 'FREE',
  targetTier,
  onUpgrade,
}) => {
  const nextTier = targetTier || getNextTier(currentTier);
  if (!nextTier) return null;

  const tierStyle = TIER_STYLES[nextTier] || TIER_STYLES.TIER1;
  const benefits = TIER_BENEFITS[nextTier] || TIER_BENEFITS.TIER1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={styles.overlay}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Upgrade to ${nextTier}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={ANIMATION.spring}
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              style={styles.closeButton}
              aria-label="Close upgrade modal"
            >
              <X size={20} color={COLORS.textMuted} />
            </button>

            {/* Header */}
            <div style={styles.header}>
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...ANIMATION.springBouncy, delay: 0.2 }}
                style={{
                  ...styles.iconCircle,
                  background: tierStyle.bg,
                  border: `2px solid ${tierStyle.border}`,
                  boxShadow: `0 0 24px ${tierStyle.color}40`,
                }}
              >
                <Crown size={32} color={tierStyle.color} />
              </motion.div>

              <h2 style={styles.title}>
                Upgrade to <span style={{ color: tierStyle.color }}>{nextTier.replace('TIER', 'Tier ')}</span>
              </h2>
              <p style={styles.subtitle}>
                Unlock more features and get the most out of GEM Master
              </p>
            </div>

            {/* Current tier info */}
            <div style={styles.currentTierRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
                <Shield size={14} color={TIER_STYLES[currentTier]?.color || COLORS.success} />
                <span style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textMuted }}>
                  Current: <span style={{ color: TIER_STYLES[currentTier]?.color || COLORS.success, fontWeight: TYPOGRAPHY.fontWeight.semibold }}>{currentTier === 'FREE' ? 'Free' : currentTier.replace('TIER', 'Tier ')}</span>
                </span>
              </div>
              <ArrowRight size={14} color={COLORS.textMuted} />
              <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
                <Sparkles size={14} color={tierStyle.color} />
                <span style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: tierStyle.color, fontWeight: TYPOGRAPHY.fontWeight.semibold }}>
                  {nextTier.replace('TIER', 'Tier ')}
                </span>
              </div>
            </div>

            {/* Benefits List */}
            <div style={styles.benefitsList}>
              {benefits.features.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  style={styles.benefitItem}
                >
                  <Check size={16} color={tierStyle.color} />
                  <span style={styles.benefitText}>{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Price + CTA */}
            <div style={styles.footer}>
              <div style={styles.priceRow}>
                <span style={{ ...styles.price, color: tierStyle.color }}>
                  {benefits.price}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onUpgrade?.(nextTier)}
                style={{
                  ...styles.upgradeButton,
                  background: `linear-gradient(135deg, ${tierStyle.color}, ${tierStyle.color}CC)`,
                }}
                aria-label={`Upgrade to ${nextTier} for ${benefits.price}`}
              >
                <Zap size={18} color={COLORS.bgPrimary} />
                <span style={styles.upgradeButtonText}>Upgrade Now</span>
              </motion.button>
              <button
                onClick={onClose}
                style={styles.laterButton}
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: SPACING.base,
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: 440,
    maxHeight: '90vh',
    overflowY: 'auto',
    background: COLORS.bgSecondary,
    borderRadius: RADIUS.xl,
    border: `1px solid ${COLORS.borderLight}`,
    padding: SPACING['2xl'],
    boxShadow: SHADOWS.lg,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.base,
    right: SPACING.base,
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  header: {
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: `0 auto ${SPACING.base}px`,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    margin: `0 0 ${SPACING.sm}px 0`,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    margin: 0,
  },
  currentTierRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: `${SPACING.md}px`,
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.lg,
  },
  benefitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.md,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: SPACING.md,
  },
  priceRow: {
    textAlign: 'center',
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  upgradeButton: {
    width: '100%',
    padding: `${SPACING.md}px ${SPACING.xl}px`,
    borderRadius: RADIUS.md,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: 48,
  },
  upgradeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgPrimary,
  },
  laterButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    padding: `${SPACING.sm}px ${SPACING.base}px`,
    minHeight: 44,
  },
};

export default UpgradeModal;
