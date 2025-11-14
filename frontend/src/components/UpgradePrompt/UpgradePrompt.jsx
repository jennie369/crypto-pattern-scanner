import React from 'react'
import { useNavigate } from 'react-router-dom'
import PriceDisplay from '../PriceDisplay/PriceDisplay'
import './UpgradePrompt.css'

/**
 * UpgradePrompt Component
 * 
 * Shows upgrade prompt for TIER 2 features
 * Displays:
 * - Current tier vs required tier
 * - TIER 2 price (21M VND/năm)
 * - List of 6 TIER 2 features
 * - Upgrade CTA button
 * 
 * @param {string} currentTier - User's current tier ('free', 'pro', 'premium', 'vip')
 * @param {string} requiredTier - Required tier for this feature (default: 'premium')
 * @param {string} featureName - Name of the locked feature
 */
export default function UpgradePrompt({ 
  currentTier = 'free', 
  requiredTier = 'premium',
  featureName = 'Advanced Tools'
}) {
  const navigate = useNavigate()

  // Tier display names
  const tierNames = {
    free: 'FREE',
    pro: 'TIER 1 (PRO)',
    premium: 'TIER 2 (PREMIUM)',
    vip: 'TIER 3 (VIP)',
    tier1: 'TIER 1 (PRO)',
    tier2: 'TIER 2 (PREMIUM)',
    tier3: 'TIER 3 (VIP)'
  }

  // TIER 2 Features list (all 6 tools)
  const tier2Features = [
    {
      icon: '🔍',
      title: 'Advanced Pattern Scanner',
      description: '15 patterns + 6 Frequency Zones với retest tracking'
    },
    {
      icon: '💰',
      title: 'Enhanced Risk & Position Calculator',
      description: 'Zone-based SL, Multiple TPs (1:2, 1:3, 1:5), Liquidation calculator'
    },
    {
      icon: '💼',
      title: 'Portfolio Tracker với Entry Type Analytics',
      description: 'Track holdings, P&L, phân tích RETEST vs BREAKOUT performance'
    },
    {
      icon: '📊',
      title: 'Multi-Timeframe Analysis',
      description: '4 charts đồng thời (15m, 1h, 4h, 1d) với auto HFZ/LFZ detection'
    },
    {
      icon: '📈',
      title: 'Sentiment Analyzer',
      description: 'Fear & Greed Index, Trending coins, Social metrics, News aggregation'
    },
    {
      icon: '📅',
      title: 'News & Events Calendar',
      description: 'Economic events, Crypto events, Impact filtering, Alerts'
    }
  ]

  return (
    <div className="upgrade-prompt-overlay">
      <div className="upgrade-prompt">
        {/* Lock Icon */}
        <div className="lock-icon">🔒</div>

        {/* Heading */}
        <h2 className="upgrade-title">Tính Năng TIER 2</h2>
        <p className="upgrade-subtitle">{featureName}</p>

        {/* Tier Comparison */}
        <div className="tier-comparison">
          <div className="tier-current">
            <span className="tier-label">Tier hiện tại:</span>
            <span className="tier-value current">{tierNames[currentTier] || 'FREE'}</span>
          </div>
          <div className="tier-arrow">→</div>
          <div className="tier-required">
            <span className="tier-label">Cần nâng cấp:</span>
            <span className="tier-value required">{tierNames[requiredTier] || 'TIER 2'}</span>
          </div>
        </div>

        {/* Price Display */}
        <div className="price-box">
          <PriceDisplay tier="premium" size="large" showMonthly={true} />
          <div className="price-subtitle">6 công cụ chuyên nghiệp</div>
        </div>

        {/* Features List */}
        <div className="features-section">
          <h3 className="features-heading">Bạn sẽ được sử dụng:</h3>
          <ul className="features-list">
            {tier2Features.map((feature, index) => (
              <li key={index} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-content">
                  <div className="feature-title">{feature.title}</div>
                  <div className="feature-description">{feature.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="upgrade-actions">
          <button 
            className="btn-upgrade-primary"
            onClick={() => navigate('/pricing')}
          >
            ⭐ Nâng Cấp TIER 2 Ngay
          </button>
          
          <button 
            className="btn-upgrade-secondary"
            onClick={() => navigate('/')}
          >
            ← Về Trang Chủ
          </button>
        </div>

        {/* Money-back guarantee */}
        <div className="guarantee-badge">
          <span className="guarantee-icon">✅</span>
          <span className="guarantee-text">Đảm bảo hoàn tiền trong 7 ngày</span>
        </div>
      </div>
    </div>
  )
}
