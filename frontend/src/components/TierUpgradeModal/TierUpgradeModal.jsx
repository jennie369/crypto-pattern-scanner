// ============================================
// 🔐 TIER UPGRADE MODAL
// Shows when user tries to access multi-TF feature
// ============================================

import React from 'react';
import { X, Lock, Zap, TrendingUp, Star, Crown } from 'lucide-react';
import './TierUpgradeModal.css';

const TierUpgradeModal = ({ isOpen, onClose, currentTier, feature = 'Multi-Timeframe Detection' }) => {
  if (!isOpen) return null;

  const getTierInfo = (tier) => {
    const tiers = {
      FREE: {
        name: 'FREE',
        color: '#6C757D',
        icon: Lock,
        maxTimeframes: 1,
        price: '$0',
        features: [
          'Single timeframe scanning',
          'Basic pattern detection',
          'Manual chart analysis'
        ]
      },
      TIER1: {
        name: 'TIER 1',
        color: '#17A2B8',
        icon: Zap,
        maxTimeframes: 1,
        price: '$9.99/mo',
        features: [
          'Single timeframe scanning',
          'Advanced pattern detection',
          'Real-time alerts',
          'Basic backtesting'
        ]
      },
      TIER2: {
        name: 'TIER 2',
        color: '#FFC107',
        icon: TrendingUp,
        maxTimeframes: 3,
        price: '$19.99/mo',
        features: [
          '✨ Multi-TF scan (3 timeframes)',
          '✨ Timeframe confluence analysis',
          'Advanced backtesting',
          'AI prediction access',
          'Priority support'
        ],
        recommended: true
      },
      TIER3: {
        name: 'TIER 3 - ELITE',
        color: '#FF6B6B',
        icon: Crown,
        maxTimeframes: 5,
        price: '$39.99/mo',
        features: [
          '⭐ Multi-TF scan (5+ timeframes)',
          '⭐ Advanced confluence scoring',
          '⭐ All timeframes (5m - 1M)',
          'Elite trading tools',
          'Custom indicators',
          'API access',
          'VIP support'
        ]
      }
    };

    return tiers[tier] || tiers.FREE;
  };

  const current = getTierInfo(currentTier?.toUpperCase());
  const tier2 = getTierInfo('TIER2');
  const tier3 = getTierInfo('TIER3');

  const handleUpgrade = (targetTier) => {
    // Navigate to pricing/upgrade page
    window.location.href = `/pricing?upgrade=${targetTier.toLowerCase()}`;
  };

  return (
    <div className="tier-upgrade-modal-overlay">
      <div className="tier-upgrade-modal">
        {/* Close Button */}
        <button className="tier-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        {/* Header */}
        <div className="tier-modal-header">
          <div className="tier-modal-lock-icon">
            <Lock size={48} />
          </div>
          <h2 className="tier-modal-title">
            🔒 {feature} is Locked
          </h2>
          <p className="tier-modal-subtitle">
            Upgrade to TIER 2 or TIER 3 to unlock multi-timeframe scanning
          </p>
        </div>

        {/* Current Tier Info */}
        <div className="tier-modal-current">
          <div className="current-tier-badge" style={{ backgroundColor: current.color }}>
            <current.icon size={16} />
            <span>Your Current: {current.name}</span>
          </div>
          <p className="current-tier-limit">
            Current limit: {current.maxTimeframes} timeframe only
          </p>
        </div>

        {/* Upgrade Options */}
        <div className="tier-modal-options">
          {/* TIER 2 Card */}
          <div className={`tier-option-card ${tier2.recommended ? 'recommended' : ''}`}>
            {tier2.recommended && (
              <div className="tier-recommended-badge">
                <Star size={14} />
                <span>RECOMMENDED</span>
              </div>
            )}

            <div className="tier-card-header">
              <tier2.icon size={32} style={{ color: tier2.color }} />
              <h3 className="tier-card-name">{tier2.name}</h3>
              <p className="tier-card-price">{tier2.price}</p>
            </div>

            <div className="tier-card-body">
              <div className="tier-highlight">
                <Zap size={20} style={{ color: tier2.color }} />
                <span>Scan up to {tier2.maxTimeframes} timeframes simultaneously</span>
              </div>

              <ul className="tier-features-list">
                {tier2.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="feature-checkmark">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className="tier-upgrade-btn"
                style={{ backgroundColor: tier2.color }}
                onClick={() => handleUpgrade('TIER2')}
              >
                Upgrade to TIER 2
              </button>
            </div>
          </div>

          {/* TIER 3 Card */}
          <div className="tier-option-card">
            <div className="tier-card-header">
              <tier3.icon size={32} style={{ color: tier3.color }} />
              <h3 className="tier-card-name">{tier3.name}</h3>
              <p className="tier-card-price">{tier3.price}</p>
            </div>

            <div className="tier-card-body">
              <div className="tier-highlight">
                <Crown size={20} style={{ color: tier3.color }} />
                <span>Scan up to {tier3.maxTimeframes}+ timeframes + Elite tools</span>
              </div>

              <ul className="tier-features-list">
                {tier3.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="feature-checkmark">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className="tier-upgrade-btn elite"
                style={{ backgroundColor: tier3.color }}
                onClick={() => handleUpgrade('TIER3')}
              >
                Upgrade to TIER 3
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="tier-modal-footer">
          <p className="tier-footer-note">
            💡 All plans include access to current tier features plus upgrades
          </p>
          <button className="tier-footer-link" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default TierUpgradeModal;
