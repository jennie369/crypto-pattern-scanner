import React from 'react'
import './PriceDisplay.css'

/**
 * PriceDisplay Component
 * 
 * Reusable component for displaying tier prices in correct VND format
 * ✅ CORRECT: "21.000.000 VND/năm" or "21M VND/năm"
 * ❌ WRONG: "21.000.000đ/năm"
 * 
 * @param {string} tier - 'tier1', 'tier2', 'tier3', 'pro', 'premium', 'vip'
 * @param {string} size - 'small', 'medium', 'large' (default: 'medium')
 * @param {boolean} showMonthly - Show monthly breakdown (default: false)
 */
export default function PriceDisplay({ tier, size = 'medium', showMonthly = false }) {
  
  // Price data for all tiers
  const prices = {
    // TIER 1 (Scanner PRO / Course Basic)
    tier1: {
      full: '11.000.000 VND/năm',
      short: '11M VND/năm',
      monthly: '917K VND/tháng',
      value: 11000000,
      duration: '12 tháng'
    },
    pro: {  // Alias for tier1
      full: '11.000.000 VND/năm',
      short: '11M VND/năm',
      monthly: '917K VND/tháng',
      value: 11000000,
      duration: '12 tháng'
    },
    
    // TIER 2 (Scanner PREMIUM / Course Advanced)
    tier2: {
      full: '21.000.000 VND/năm',
      short: '21M VND/năm',
      monthly: '1.75M VND/tháng',
      value: 21000000,
      duration: '12 tháng'
    },
    premium: {  // Alias for tier2
      full: '21.000.000 VND/năm',
      short: '21M VND/năm',
      monthly: '1.75M VND/tháng',
      value: 21000000,
      duration: '12 tháng'
    },
    
    // TIER 3 (Scanner VIP / Course Complete)
    tier3: {
      full: '68.000.000 VND/24 tháng',
      short: '68M VND/24 tháng',
      monthly: '2.83M VND/tháng',
      value: 68000000,
      duration: '24 tháng'
    },
    vip: {  // Alias for tier3
      full: '68.000.000 VND/24 tháng',
      short: '68M VND/24 tháng',
      monthly: '2.83M VND/tháng',
      value: 68000000,
      duration: '24 tháng'
    }
  }

  // Get price data for the tier
  const priceData = prices[tier] || prices.tier1

  // Render based on size
  if (size === 'small') {
    return (
      <div className="price-display price-small">
        <span className="price-short">{priceData.short}</span>
      </div>
    )
  }

  if (size === 'large') {
    return (
      <div className="price-display price-large">
        <div className="price-main">
          <span className="price-short">{priceData.short}</span>
        </div>
        <div className="price-details">
          <span className="price-full">{priceData.full}</span>
        </div>
        {showMonthly && (
          <div className="price-monthly">
            <span className="monthly-label">≈ {priceData.monthly}</span>
          </div>
        )}
      </div>
    )
  }

  // Default: medium size
  return (
    <div className="price-display price-medium">
      <span className="price-short">{priceData.short}</span>
      {showMonthly && (
        <span className="price-monthly-inline">({priceData.monthly})</span>
      )}
    </div>
  )
}
