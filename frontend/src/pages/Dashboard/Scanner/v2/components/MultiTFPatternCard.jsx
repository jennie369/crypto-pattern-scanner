// ============================================
// 📊 MULTI-TIMEFRAME PATTERN CARD
// Displays same pattern detected across multiple timeframes
// ============================================

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, Activity, Target, Info } from 'lucide-react';
import { useTranslation } from '../../../../../hooks/useTranslation';
import './MultiTFPatternCard.css';

// Simple tooltip component for confluence explanation
const ConfluenceTooltip = ({ level, t }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getTooltipContent = () => {
    switch(level) {
      case 'HIGH':
        return t('highConfluenceTooltip');
      case 'MEDIUM':
        return t('mediumConfluenceTooltip');
      case 'LOW':
        return t('lowConfluenceTooltip');
      default:
        return '';
    }
  };

  return (
    <div
      className="confluence-tooltip-wrapper"
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Info size={12} style={{ cursor: 'help', opacity: 0.7 }} />
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(17, 34, 80, 0.98)',
          border: '1px solid rgba(255, 189, 89, 0.4)',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '11px',
          color: '#fff',
          whiteSpace: 'normal',
          width: '220px',
          zIndex: 1000,
          marginBottom: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          lineHeight: '1.5'
        }}>
          {getTooltipContent()}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(255, 189, 89, 0.4)'
          }} />
        </div>
      )}
    </div>
  );
};

const MultiTFPatternCard = ({ pattern, onSelectTimeframe }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();

  const { patternName, direction, timeframes, confluence } = pattern;

  // Get direction icon and color
  const getDirectionInfo = (dir) => {
    const directions = {
      LONG: { icon: '🔺', color: '#0ECB81', label: 'LONG' },
      SHORT: { icon: '🔻', color: '#F6465D', label: 'SHORT' },
      BREAKOUT: { icon: '⚡', color: '#FFBD59', label: 'BREAKOUT' }
    };
    return directions[dir] || directions.BREAKOUT;
  };

  const directionInfo = getDirectionInfo(direction);

  // Get confluence level styling
  const getConfluenceStyle = (level) => {
    const styles = {
      HIGH: { color: '#0ECB81', bg: 'rgba(14, 203, 129, 0.15)', label: 'HIGH' },
      MEDIUM: { color: '#FFBD59', bg: 'rgba(255, 189, 89, 0.15)', label: 'MEDIUM' },
      LOW: { color: '#6C757D', bg: 'rgba(108, 117, 125, 0.15)', label: 'LOW' }
    };
    return styles[level] || styles.LOW;
  };

  const confluenceStyle = getConfluenceStyle(confluence?.level);

  // Get state badge
  const getStateBadge = (state) => {
    const states = {
      ACTIVE: { label: 'ACTIVE', color: '#0ECB81', bg: 'rgba(14, 203, 129, 0.2)' },
      WAITING: { label: 'WAITING', color: '#FFBD59', bg: 'rgba(255, 189, 89, 0.2)' },
      FRESH: { label: 'FRESH', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.2)' },
      MISSED: { label: 'MISSED', color: '#6C757D', bg: 'rgba(108, 117, 125, 0.2)' }
    };
    return states[state] || states.FRESH;
  };

  // Sort timeframes by active state and confidence
  const sortedTimeframes = [...timeframes].sort((a, b) => {
    if (a.state === 'ACTIVE' && b.state !== 'ACTIVE') return -1;
    if (a.state !== 'ACTIVE' && b.state === 'ACTIVE') return 1;
    return (b.confidence || 0) - (a.confidence || 0);
  });

  return (
    <div className="multi-tf-pattern-card">
      {/* Card Header - Always Visible */}
      <div className="multi-tf-card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="multi-tf-pattern-info">
          <div className="multi-tf-pattern-name">
            <span className="pattern-direction-icon" style={{ color: directionInfo.color }}>
              {directionInfo.icon}
            </span>
            <span className="pattern-name-text">{patternName}</span>
            <span className="pattern-direction-label" style={{ color: directionInfo.color }}>
              {directionInfo.label}
            </span>
          </div>

          <div className="multi-tf-summary">
            <div className="tf-count-badge">
              <Activity size={14} />
              <span>{confluence?.totalTimeframes || timeframes.length} {t('timeframes')}</span>
            </div>

            <div
              className="confluence-badge"
              style={{
                backgroundColor: confluenceStyle.bg,
                color: confluenceStyle.color,
                border: `1px solid ${confluenceStyle.color}`
              }}
            >
              <Target size={12} />
              <span>{confluenceStyle.label === 'HIGH' ? t('highConfluence') : confluenceStyle.label === 'MEDIUM' ? t('mediumConfluence') : t('lowConfluence')}</span>
              <span className="confluence-score">{confluence?.score || 0}%</span>
              <ConfluenceTooltip level={confluenceStyle.label} t={t} />
            </div>
          </div>
        </div>

        <button className="expand-toggle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isExpanded ? (
            <ChevronUp size={20} strokeWidth={2.5} style={{ display: 'block' }} />
          ) : (
            <ChevronDown size={20} strokeWidth={2.5} style={{ display: 'block' }} />
          )}
        </button>
      </div>

      {/* Expanded Timeframe Details */}
      {isExpanded && (
        <div className="multi-tf-card-body">
          <div className="tf-list">
            {sortedTimeframes.map((tf, idx) => {
              const stateBadge = getStateBadge(tf.state);

              return (
                <div
                  key={idx}
                  className={`tf-item ${tf.state === 'ACTIVE' ? 'active' : ''}`}
                  onClick={() => onSelectTimeframe && onSelectTimeframe(tf.timeframe, pattern)}
                >
                  {/* Timeframe Label */}
                  <div className="tf-item-header">
                    <span className="tf-label">{tf.timeframe.toUpperCase()}</span>
                    <div
                      className="tf-state-badge"
                      style={{
                        backgroundColor: stateBadge.bg,
                        color: stateBadge.color
                      }}
                    >
                      {stateBadge.label}
                    </div>
                  </div>

                  {/* Timeframe Details */}
                  <div className="tf-item-details">
                    <div className="tf-detail-row">
                      <span className="detail-label">{t('confidence')}:</span>
                      <span className="detail-value confidence">{typeof tf.confidence === 'number' ? tf.confidence.toFixed(1) : (tf.confidence || 0)}%</span>
                    </div>

                    <div className="tf-detail-row">
                      <span className="detail-label">{t('entry')}:</span>
                      <span className="detail-value entry">${tf.entry?.toFixed(2) || 'N/A'}</span>
                    </div>

                    <div className="tf-detail-row">
                      <span className="detail-label">{t('stopLoss')}:</span>
                      <span className="detail-value stop-loss">${tf.stopLoss?.toFixed(2) || 'N/A'}</span>
                    </div>

                    <div className="tf-detail-row">
                      <span className="detail-label">{t('target')}:</span>
                      <span className="detail-value take-profit">${tf.takeProfit?.toFixed(2) || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Action Hint */}
                  {tf.state === 'ACTIVE' && (
                    <div className="tf-action-hint">
                      👉 {t('clickToSwitchTimeframe')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Confluence Analysis - COMPACT */}
          {confluence && (
            <div className="confluence-analysis" style={{ padding: '6px', borderRadius: '4px' }}>
              <h4 className="confluence-title" style={{ fontSize: '9px', margin: '0 0 4px' }}>📊 {t('confluenceAnalysis')}</h4>
              <div className="confluence-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                <div className="confluence-stat">
                  <span className="stat-label" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)' }}>{t('activeTimeframes')}:</span>
                  <span className="stat-value" style={{ fontSize: '10px', fontWeight: 700 }}>{confluence.activeTimeframes}/{confluence.totalTimeframes}</span>
                </div>
                <div className="confluence-stat">
                  <span className="stat-label" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)' }}>{t('avgConfidence')}:</span>
                  <span className="stat-value" style={{ fontSize: '10px', fontWeight: 700 }}>{confluence.avgConfidence}%</span>
                </div>
                <div className="confluence-stat">
                  <span className="stat-label" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)' }}>{t('confluenceScore')}:</span>
                  <span className="stat-value score" style={{ fontSize: '10px', fontWeight: 700, color: confluenceStyle.color }}>
                    {confluence.score}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiTFPatternCard;
