import React from 'react';
import { Circle } from 'lucide-react';
import { useAuth } from '../../../../../contexts/AuthContext';
import './ResultsList.css';

export const ResultsList = ({ results, onSelect, selectedPattern, onOpenPaperTrading }) => {
  const { user, profile, getScannerTier, isAdmin } = useAuth();

  // Get user's scanner tier for validation
  const scannerTierRaw = getScannerTier ? getScannerTier() : 'free';
  const normalizeTier = (tier) => {
    const tierLower = (tier || 'free').toLowerCase();
    if (tierLower === 'free') return 'FREE';
    if (tierLower === 'tier1' || tierLower === 'pro') return 'TIER1';
    if (tierLower === 'tier2' || tierLower === 'premium') return 'TIER2';
    if (tierLower === 'tier3' || tierLower === 'vip') return 'TIER3';
    return 'FREE';
  };
  const userTier = normalizeTier(scannerTierRaw);

  // CRITICAL: Check if user's tier allows paper trading this pattern
  const canPaperTradePattern = (pattern) => {
    // ✅ ADMIN BYPASS - Admins have access to ALL features
    if (isAdmin && isAdmin()) {
      console.log('[ResultsList] ✅ Admin bypass - granting access to pattern:', pattern);
      return true;
    }

    // ✅ TIER3 BYPASS - TIER3 users have access to ALL patterns
    if (userTier === 'TIER3') {
      console.log('[ResultsList] ✅ TIER3 bypass - granting access to pattern:', pattern);
      return true;
    }

    // Pattern tier requirements (must match ControlPanel.jsx)
    const tier1Patterns = ['DPD', 'UPU', 'UPD', 'DPU', 'Double Top', 'Double Bottom', 'H&S'];
    const tier2Patterns = [
      ...tier1Patterns,
      'HFZ', 'LFZ', 'Inverse H&S', 'Rounding Bottom', 'Rounding Top',
      'Symmetrical Triangle', 'Ascending Triangle', 'Descending Triangle'
    ];
    const tier3Patterns = [
      ...tier2Patterns,
      'Bull Flag', 'Bear Flag', 'Flag', 'Wedge', 'Engulfing',
      'Morning/Evening Star', 'Cup & Handle', '3 Methods', 'Hammer'
    ];

    // If user can't scan it in real mode, they can't paper trade it
    if (userTier === 'FREE') {
      return ['DPD', 'UPU', 'H&S'].includes(pattern);
    } else if (userTier === 'TIER1') {
      return tier1Patterns.includes(pattern);
    } else if (userTier === 'TIER2') {
      return tier2Patterns.includes(pattern);
    } else if (userTier === 'TIER3') {
      return tier3Patterns.includes(pattern);
    }
    return false;
  };
  // Debug logging on component render
  console.log('[ResultsList] Rendered:', {
    resultsCount: results.length,
    hasOnSelect: !!onSelect,
    selectedId: selectedPattern?.id,
  });

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'confidence-high';
    if (confidence >= 60) return 'confidence-medium';
    return 'confidence-low';
  };

  const getConfidenceIcon = (confidence) => {
    const color = confidence >= 80 ? '#0ECB81' : confidence >= 60 ? '#FFBD59' : '#F6465D';
    return <Circle size={10} fill={color} color={color} />;
  };

  // Calculate time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const detected = new Date(dateString);
    const diffInMinutes = Math.floor((now - detected) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1m ago';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1h ago';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1d ago';
    return `${diffInDays}d ago`;
  };

  // Debug wrapper for click handling
  const handleCardClick = (result) => {
    console.log('[ResultsList] [CLICK] Card clicked!', {
      coin: result.coin,
      pattern: result.pattern,
      confidence: result.confidence,
      hasOnSelect: !!onSelect,
      resultData: result,
    });

    if (!onSelect) {
      console.error('[ResultsList] [ERROR] onSelect prop is missing!');
      return;
    }

    onSelect(result);
  };

  return (
    <div className="results-list">
      <div className="results-header">
        <h3 className="heading-xs">{results.length} Patterns Found</h3>
      </div>

      <div className="results-items">
        {results.map(result => (
          <div
            key={result.id}
            className={`result-card ${selectedPattern?.id === result.id ? 'selected' : ''}`}
            onClick={() => handleCardClick(result)}
            style={{ cursor: 'pointer' }}
          >
            <div className="result-header">
              <span className="result-coin">{result.coin}</span>
              <span className={`result-confidence ${getConfidenceColor(result.confidence)}`}>
                {getConfidenceIcon(result.confidence)} {result.confidence}%
              </span>
            </div>

            <div className="result-pattern">
              <span className="pattern-code">{result.pattern}</span>
              <span className="result-timeframe">{result.timeframe}</span>
            </div>

            {/* 3-column layout: Entry, Stop, Target */}
            <div className="result-details-3col">
              <div className="result-detail-item">
                <span className="detail-label">ENTRY</span>
                <span className="detail-value entry-value">${result.entry?.toLocaleString() || '0.00'}</span>
              </div>
              <div className="result-detail-item">
                <span className="detail-label">STOP</span>
                <span className="detail-value stop-value">${result.stopLoss?.toLocaleString() || '0.00'}</span>
              </div>
              <div className="result-detail-item">
                <span className="detail-label">TARGET</span>
                <span className="detail-value target-value">${result.takeProfit?.toLocaleString() || '0.00'}</span>
              </div>
            </div>

            {/* Paper Trade Button with Tier Validation */}
            {canPaperTradePattern(result.pattern) ? (
              <button
                className="paper-trade-btn"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card selection
                  if (onOpenPaperTrading) {
                    onOpenPaperTrading(result.coin);
                  }
                }}
              >
                ↗ Paper Trade
              </button>
            ) : (
              <button
                className="paper-trade-btn locked"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Paper trading for ${result.pattern} pattern requires a higher tier. Upgrade to access this feature.`);
                  window.location.href = '/pricing';
                }}
              >
                🔒 Paper Trade (Upgrade Required)
              </button>
            )}

            {/* Time ago */}
            {result.detectedAt && (
              <div className="result-time-ago">
                <span className="time-icon">⏱</span>
                <span>{getTimeAgo(result.detectedAt)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsList;
