/**
 * ChatbotPricingModal - Web component
 * Shows tier pricing comparison when user exceeds chatbot quota.
 * Ported from gem-mobile/src/components/GemMaster/ChatbotPricingModal.js
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Crown,
  Star,
  Zap,
  Check,
  AlertCircle,
  ShoppingCart,
  Infinity,
  ExternalLink,
} from 'lucide-react';
import { ANIMATION } from '../../../../web design-tokens';
import './ChatbotPricingModal.css';

/**
 * Chatbot tier packages
 * NOTE: These use chatbot_tier naming (PRO/PREMIUM/VIP), NOT scanner_tier
 */
const CHATBOT_TIERS = [
  {
    id: 'pro',
    name: 'PRO',
    tier: 'PRO',
    priceDisplay: '39.000d',
    period: '/thang',
    queries: 15,
    queriesDisplay: '15 luot/ngay',
    color: '#FFB800',
    Icon: Zap,
    features: [
      '15 cau hoi moi ngay',
      'Phan tich coin co ban',
      'Goi y trading',
      'Ho tro email',
    ],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    tier: 'PREMIUM',
    priceDisplay: '59.000d',
    period: '/thang',
    queries: 50,
    queriesDisplay: '50 luot/ngay',
    color: '#6A5BFF',
    Icon: Star,
    features: [
      '50 cau hoi moi ngay',
      'Phan tich chuyen sau',
      'Tin hieu trading',
      'Ho tro uu tien',
    ],
    popular: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    tier: 'VIP',
    priceDisplay: '99.000d',
    period: '/thang',
    queries: -1,
    queriesDisplay: 'Khong gioi han',
    color: '#FFD700',
    Icon: Crown,
    features: [
      'Khong gioi han cau hoi',
      'Phan tich real-time',
      'Chien luoc doc quyen',
      'Ho tro 24/7 VIP',
    ],
  },
];

const TIER_LEVELS = { FREE: 0, PRO: 1, PREMIUM: 2, VIP: 3 };

const ChatbotPricingModal = ({
  isOpen,
  onClose,
  quota,
  currentTier = 'FREE',
  onUpgrade,
}) => {
  const currentLevel = TIER_LEVELS[currentTier?.toUpperCase()] || 0;
  const availableTiers = useMemo(
    () => CHATBOT_TIERS.filter((t) => (TIER_LEVELS[t.tier] || 0) > currentLevel),
    [currentLevel]
  );

  const handleUpgrade = (tier) => {
    onUpgrade?.(tier);
  };

  const handleLearnMore = () => {
    window.open('https://gemral.com', '_blank', 'noopener');
  };

  // Keyboard: escape to close
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="chatbot-pricing-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Chatbot pricing"
        >
          <motion.div
            className="chatbot-pricing-modal"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={ANIMATION.spring}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              className="chatbot-pricing-close"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} color="rgba(255,255,255,0.6)" />
            </button>

            {/* Header */}
            <div className="chatbot-pricing-header">
              <div className="chatbot-pricing-header-icon">
                <AlertCircle size={28} color="#FFBD59" />
              </div>
              <h2 className="chatbot-pricing-title">Het luot hom nay</h2>
            </div>

            {/* Status */}
            <div className="chatbot-pricing-status">
              <p className="chatbot-pricing-status-text">
                Ban da su dung het{' '}
                <span className="chatbot-pricing-status-highlight">
                  {quota?.limit || 5} luot hoi
                </span>{' '}
                trong ngay.
              </p>
              <p className="chatbot-pricing-status-subtext">
                Nang cap de co them luot hoi:
              </p>
              <ul className="chatbot-pricing-compare">
                <li>PRO: 15 luot/ngay - 39.000d</li>
                <li>PREMIUM: 50 luot/ngay - 59.000d</li>
                <li>VIP: Khong gioi han - 99.000d</li>
              </ul>
            </div>

            {/* Tier Cards */}
            <div className="chatbot-pricing-tiers">
              {availableTiers.map((tier, index) => {
                const TierIcon = tier.Icon;
                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className={`chatbot-tier-card ${tier.popular ? 'chatbot-tier-card--popular' : ''}`}
                  >
                    {tier.popular && (
                      <span className="chatbot-tier-popular-badge">PHO BIEN NHAT</span>
                    )}

                    <div className="chatbot-tier-header">
                      <div
                        className="chatbot-tier-icon"
                        style={{ backgroundColor: `${tier.color}20` }}
                      >
                        <TierIcon
                          size={24}
                          color={tier.color}
                          fill={tier.id === 'vip' ? tier.color : 'transparent'}
                        />
                      </div>
                      <div className="chatbot-tier-info">
                        <p className="chatbot-tier-name" style={{ color: tier.color }}>
                          {tier.name}
                        </p>
                        <div className="chatbot-tier-queries">
                          {tier.queries === -1 && <Infinity size={14} color="#3AF7A6" />}
                          <span>{tier.queriesDisplay}</span>
                        </div>
                      </div>
                      <div className="chatbot-tier-pricing">
                        <p className="chatbot-tier-price">{tier.priceDisplay}</p>
                        <p className="chatbot-tier-period">{tier.period}</p>
                      </div>
                    </div>

                    <div className="chatbot-tier-features">
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="chatbot-tier-feature">
                          <Check size={14} color="#00FF88" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="chatbot-tier-buttons">
                      <button
                        className="chatbot-tier-learn-btn"
                        onClick={handleLearnMore}
                      >
                        <ExternalLink size={14} />
                        Tim hieu
                      </button>
                      <button
                        className="chatbot-tier-buy-btn"
                        style={{ background: `linear-gradient(90deg, ${tier.color}, ${tier.color}BB)` }}
                        onClick={() => handleUpgrade(tier)}
                      >
                        <ShoppingCart size={16} />
                        Mua ngay
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Dismiss */}
            <button className="chatbot-pricing-dismiss" onClick={onClose}>
              Dong
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatbotPricingModal;
