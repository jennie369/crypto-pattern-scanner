/**
 * AssetStatsCards Component
 * Gems, Thu nhập, Affiliate stats cards
 * Uses design tokens for consistent styling
 */

import React from 'react';
import { Gem, DollarSign, Users, TrendingUp } from 'lucide-react';
import './AssetStatsCards.css';

export function AssetStatsCards({
  gemsBalance = 0,
  earnings = 0,
  affiliateEarnings = 0,
  onGemsClick,
  onEarningsClick,
  onAffiliateClick
}) {
  const formatCurrency = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const cards = [
    {
      id: 'gems',
      icon: Gem,
      label: 'GEM Balance',
      value: formatCurrency(gemsBalance),
      suffix: 'GEM',
      color: '#00D9FF',
      gradient: 'linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(0, 217, 255, 0.05) 100%)',
      onClick: onGemsClick
    },
    {
      id: 'earnings',
      icon: DollarSign,
      label: 'Thu nhập',
      value: formatCurrency(earnings),
      suffix: 'đ',
      color: '#00FF88',
      gradient: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.05) 100%)',
      onClick: onEarningsClick
    },
    {
      id: 'affiliate',
      icon: Users,
      label: 'Affiliate',
      value: formatCurrency(affiliateEarnings),
      suffix: 'đ',
      color: '#FFBD59',
      gradient: 'linear-gradient(135deg, rgba(255, 189, 89, 0.2) 0%, rgba(255, 189, 89, 0.05) 100%)',
      onClick: onAffiliateClick
    }
  ];

  return (
    <div className="asset-stats-container">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="asset-card"
            style={{ background: card.gradient }}
            onClick={card.onClick}
            role="button"
            tabIndex={0}
          >
            <div className="asset-icon" style={{ background: `${card.color}20` }}>
              <Icon size={24} style={{ color: card.color }} />
            </div>
            <div className="asset-info">
              <span className="asset-label">{card.label}</span>
              <div className="asset-value-row">
                <span className="asset-value" style={{ color: card.color }}>
                  {card.value}
                </span>
                <span className="asset-suffix">{card.suffix}</span>
              </div>
            </div>
            <TrendingUp size={16} className="asset-trend" style={{ color: card.color }} />
          </div>
        );
      })}
    </div>
  );
}

export default AssetStatsCards;
