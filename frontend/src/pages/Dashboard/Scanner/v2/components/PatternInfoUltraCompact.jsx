import React from 'react';
import { Copy, Save, Target, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Activity, BarChart3, Zap } from 'lucide-react';
import { getPatternSignal, getPatternState } from '../../../../../constants/patternSignals';
import PatternBadgeTooltip from '../../../../../components/PatternBadgeTooltip/PatternBadgeTooltip';
import { STATE_TOOLTIPS, TIMEFRAME_TOOLTIPS, DIRECTION_TOOLTIPS } from '../../../../../constants/badgeTooltips';
import { useTranslation } from '../../../../../hooks/useTranslation';
import './PatternInfoUltraCompact.css';

/**
 * Pattern Info Ultra Compact - Single card design
 * Enhanced with signal badges, state badges, timeframe quality, win rate, and current price
 * Single-line header + 2x2 grid + actions
 */
export const PatternInfoUltraCompact = ({ pattern, currentPrice }) => {
  const { t } = useTranslation();

  if (!pattern) {
    return (
      <div className="pattern-info-compact-empty">
        <Target size={32} className="empty-icon" color="rgba(255, 189, 89, 0.5)" />
        <span className="empty-text">{t('selectPattern')}</span>
      </div>
    );
  }

  const calculatePercentages = () => {
    const stopLossPercent = ((pattern.stopLoss - pattern.entry) / pattern.entry * 100);
    const takeProfitPercent = ((pattern.takeProfit - pattern.entry) / pattern.entry * 100);
    return { stopLossPercent, takeProfitPercent };
  };

  const { stopLossPercent, takeProfitPercent } = calculatePercentages();

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const detected = new Date(dateString);
    const diffInMinutes = Math.floor((now - detected) / (1000 * 60));

    if (diffInMinutes < 1) return t('justNow');
    if (diffInMinutes === 1) return `1m ${t('agoSuffix')}`;
    if (diffInMinutes < 60) return `${diffInMinutes}m ${t('agoSuffix')}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return `1h ${t('agoSuffix')}`;
    return `${diffInHours}h ${t('agoSuffix')}`;
  };

  const handleCopy = () => {
    const tradeDetails = `
${pattern.patternName} - ${pattern.coin}
Timeframe: ${pattern.timeframe}
Confidence: ${pattern.confidence}%

Entry: $${pattern.entry.toLocaleString()}
Stop Loss: $${pattern.stopLoss.toLocaleString()} (${stopLossPercent.toFixed(2)}%)
Take Profit: $${pattern.takeProfit.toLocaleString()} (${takeProfitPercent.toFixed(2)}%)
Risk:Reward: 1:${pattern.riskReward.toFixed(2)}
    `.trim();

    navigator.clipboard.writeText(tradeDetails);
    alert(t('tradeDetailsCopied'));
  };

  const handleSave = () => {
    // TODO: Integrate with trading journal
    alert(t('saveToJournalComingSoon'));
  };

  const getConfidenceClass = () => {
    if (pattern.confidence >= 80) return 'high';
    if (pattern.confidence >= 60) return 'medium';
    return 'low';
  };

  // Get pattern signal metadata
  const patternType = pattern.patternType || pattern.pattern || pattern.patternName;
  const signalInfo = getPatternSignal(patternType);
  const stateInfo = pattern.state ? getPatternState(pattern.state) : null;

  // Check if this is a BREAKOUT pattern
  const isBreakoutPattern = signalInfo.type === 'BREAKOUT';

  // Get timeframe quality
  const getTimeframeQuality = () => {
    const tf = pattern.timeframe;
    if (signalInfo.bestTimeframes?.includes(tf)) {
      return { label: 'BEST', color: '#0ECB81', bgColor: 'rgba(14, 203, 129, 0.15)' };
    }
    if (signalInfo.goodTimeframes?.includes(tf)) {
      return { label: 'GOOD', color: '#FFBD59', bgColor: 'rgba(255, 189, 89, 0.15)' };
    }
    if (signalInfo.cautionTimeframes?.includes(tf)) {
      return { label: 'CAUTION', color: '#F6465D', bgColor: 'rgba(246, 70, 93, 0.15)' };
    }
    return null;
  };

  const timeframeQuality = getTimeframeQuality();

  // Check if current price is different from entry
  const showCurrentPrice = currentPrice && Math.abs(currentPrice - pattern.entry) / pattern.entry > 0.001;

  // Render Combined Badge for BREAKOUT patterns
  const renderCombinedBadge = () => {
    if (isBreakoutPattern && stateInfo) {
      const state = pattern.state;

      switch(state) {
        case 'ACTIVE':
          return {
            label: 'BREAKOUT ZONE',
            color: '#FFBD59',
            bgColor: 'linear-gradient(135deg, rgba(255, 189, 89, 0.2), rgba(0, 255, 136, 0.2))',
            border: '2px solid #FFBD59',
            tooltip: (
              <>
                <strong>BREAKOUT ZONE</strong>
                <p>Price in range, waiting for breakout</p>
                <p className="highlight">Break up = LONG</p>
                <p className="highlight">Break down = SHORT</p>
              </>
            ),
            animate: true
          };

        case 'WAITING':
          return {
            label: 'WAITING',
            color: '#FFBD59',
            bgColor: 'rgba(255, 189, 89, 0.15)',
            border: '1px solid #FFBD59',
            tooltip: (
              <>
                <strong>WAITING FOR ZONE</strong>
                <p>Price moving toward breakout zone.</p>
                <p className="highlight">Watch closely, prepare for entry.</p>
              </>
            )
          };

        case 'FRESH':
          return {
            label: 'FRESH',
            color: '#94A3B8',
            bgColor: 'rgba(148, 163, 184, 0.15)',
            border: '1px solid #94A3B8',
            tooltip: (
              <>
                <strong>FRESH BREAKOUT</strong>
                <p>Pattern just detected, no breakout yet.</p>
                <p className="highlight">Monitor and wait for price to enter zone.</p>
              </>
            )
          };

        default:
          return null;
      }
    }
    return null;
  };

  const combinedBadgeData = renderCombinedBadge();

  return (
    <div className="pattern-info-compact">
      {/* COMBINED BADGE for BREAKOUT patterns or SEPARATE BADGES for others */}
      {combinedBadgeData ? (
        /* BREAKOUT Pattern: Single Combined Badge */
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: '700',
          background: combinedBadgeData.bgColor,
          border: combinedBadgeData.border,
          color: combinedBadgeData.color,
          zIndex: 10,
          animation: combinedBadgeData.animate ? 'pulse-glow 2s ease-in-out infinite' : 'none',
          whiteSpace: 'nowrap',
          overflow: 'visible'
        }}>
          <span style={{ flex: '0 1 auto', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {combinedBadgeData.label}
          </span>
          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
            <PatternBadgeTooltip
              type="state"
              position="left"
              content={combinedBadgeData.tooltip}
            />
          </div>
        </div>
      ) : (
        /* Non-BREAKOUT Pattern: Separate Direction + State Badges */
        <>
          {/* LONG/SHORT Signal Badge (Top Left) */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '700',
            background: signalInfo.signal === 'BULLISH'
              ? 'rgba(14, 203, 129, 0.15)'
              : 'rgba(255, 71, 87, 0.15)',
            border: `1px solid ${signalInfo.color}`,
            color: signalInfo.color,
            zIndex: 10
          }}>
            {signalInfo.signal === 'BULLISH' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{signalInfo.direction}</span>
            <PatternBadgeTooltip
              type="direction"
              position="bottom"
              content={
                <>
                  <strong>{DIRECTION_TOOLTIPS[signalInfo.direction]?.title || 'LONG'}</strong>
                  <p>{DIRECTION_TOOLTIPS[signalInfo.direction]?.description}</p>
                  <p className="highlight">{DIRECTION_TOOLTIPS[signalInfo.direction]?.action}</p>
                </>
              }
            />
          </div>

          {/* State Badge (Top Right) */}
          {stateInfo && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '700',
              background: stateInfo.bgColor,
              border: `1px solid ${stateInfo.color}`,
              color: stateInfo.color,
              zIndex: 10
            }}>
              {stateInfo.label}
              <PatternBadgeTooltip
                type="state"
                position="left"
                content={
                  <>
                    <strong>{STATE_TOOLTIPS[pattern.state]?.title || 'FRESH'}</strong>
                    <p>{STATE_TOOLTIPS[pattern.state]?.description}</p>
                    <p className="highlight">{STATE_TOOLTIPS[pattern.state]?.action}</p>
                  </>
                }
              />
            </div>
          )}
        </>
      )}

      {/* Redesigned Header - Coin name prominent, pattern name smaller */}
      <div className="compact-header-redesign" style={{ marginTop: combinedBadgeData || stateInfo ? '32px' : '0' }}>
        {/* Top Row: Large Coin Name + Confidence Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#FFBD59',
            flex: '1',
            minWidth: '0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {pattern.coin}
          </span>
          <span className={`confidence-pill ${getConfidenceClass()}`} style={{
            fontSize: '10px',
            padding: '4px 10px',
            borderRadius: '12px',
            fontWeight: '700',
            flexShrink: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>{typeof pattern.confidence === 'number' ? pattern.confidence.toFixed(1) : pattern.confidence}%</span>
            <span style={{ fontSize: '9px', opacity: '0.8' }}>{t('confidence')}</span>
          </span>
        </div>

        {/* Bottom Row: Pattern Name + Metadata */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.7)',
          flexWrap: 'wrap'
        }}>
          <span style={{
            color: 'rgba(255, 255, 255, 0.95)',
            fontWeight: '600'
          }}>
            {pattern.patternName}
          </span>
          <span className="metadata-divider">|</span>
          <span className="metadata-item">
            <span className="metadata-label">TF:</span>
            <span className="metadata-value">{pattern.timeframe}</span>
          </span>
          {/* Timeframe Quality Badge with Tooltip */}
          {timeframeQuality && (
            <>
              <span className="metadata-divider">|</span>
              <span style={{
                fontSize: '9px',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '4px',
                background: timeframeQuality.bgColor,
                border: `1px solid ${timeframeQuality.color}`,
                color: timeframeQuality.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                {timeframeQuality.label}
                <PatternBadgeTooltip
                  type="timeframe"
                  position="top"
                  content={
                    <>
                      <strong>{TIMEFRAME_TOOLTIPS[timeframeQuality.label]?.title || 'Timeframe Quality'}</strong>
                      <p>{TIMEFRAME_TOOLTIPS[timeframeQuality.label]?.description || 'N/A'}</p>
                    </>
                  }
                />
              </span>
            </>
          )}
          <span className="metadata-divider">|</span>
          <span className="metadata-item">
            <span className="metadata-value">{getTimeAgo(pattern.detectedAt)}</span>
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pattern-info-content">
        {/* 2x2 Grid for Trade Parameters */}
        <div className="compact-grid">
          <div className="grid-item">
            <div className="item-label">{t('entry')}</div>
            <div className="item-value entry">${pattern.entry.toLocaleString()}</div>
          </div>

          <div className="grid-item">
            <div className="item-label">{t('stopLoss')}</div>
            <div className="item-value stop-loss">
              ${pattern.stopLoss.toLocaleString()}
              <span className="item-percent">({stopLossPercent.toFixed(2)}%)</span>
            </div>
          </div>

          <div className="grid-item">
            <div className="item-label">{t('takeProfit')}</div>
            <div className="item-value take-profit">
              ${pattern.takeProfit.toLocaleString()}
              <span className="item-percent">({takeProfitPercent.toFixed(2)}%)</span>
            </div>
          </div>

          <div className="grid-item highlight">
            <div className="item-label">{t('riskReward')}</div>
            <div className="item-value">
              1:{pattern.riskReward.toFixed(2)}
              {pattern.riskReward >= 2 ? <CheckCircle size={14} color="#0ECB81" style={{ marginLeft: '4px', verticalAlign: 'text-bottom' }} /> : <AlertTriangle size={14} color="#FFBD59" style={{ marginLeft: '4px', verticalAlign: 'text-bottom' }} />}
            </div>
          </div>
        </div>

        {/* Win Rate Section */}
        {signalInfo.expectedWinRate && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: 'rgba(255, 189, 89, 0.1)',
            border: '1px solid rgba(255, 189, 89, 0.3)',
            borderRadius: '8px',
            marginTop: '12px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', fontWeight: '600' }}>
                {t('expectedWinRate')}
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>
                {t('basedOnHistoricalData')}
              </span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#FFBD59' }}>
              {signalInfo.expectedWinRate}%
            </div>
          </div>
        )}

        {/* PHASE 1: Enhanced Quality Indicators (TIER2/3 Only) */}
        {pattern.isPremiumEnhanced && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '10px 12px',
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            borderRadius: '8px',
            marginTop: '12px'
          }}>
            {/* Header with Grade Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#9333EA" />
                <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', fontWeight: '600' }}>
                  Advanced Analysis
                </span>
              </div>
              {/* Quality Grade Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: pattern.grade === 'A+' ? 'rgba(14, 203, 129, 0.2)' :
                           pattern.grade === 'A' ? 'rgba(14, 203, 129, 0.15)' :
                           pattern.grade === 'B' ? 'rgba(255, 189, 89, 0.15)' :
                           pattern.grade === 'C' ? 'rgba(255, 189, 89, 0.1)' :
                           'rgba(246, 70, 93, 0.1)',
                border: `1px solid ${
                  pattern.grade === 'A+' ? '#0ECB81' :
                  pattern.grade === 'A' ? '#0ECB81' :
                  pattern.grade === 'B' ? '#FFBD59' :
                  pattern.grade === 'C' ? '#FFBD59' :
                  '#F6465D'
                }`
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  color: pattern.grade === 'A+' ? '#0ECB81' :
                         pattern.grade === 'A' ? '#0ECB81' :
                         pattern.grade === 'B' ? '#FFBD59' :
                         pattern.grade === 'C' ? '#FFBD59' :
                         '#F6465D'
                }}>
                  {pattern.grade}
                </span>
                <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {pattern.totalScore}/100
                </span>
              </div>
            </div>

            {/* Indicators Row */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {/* Volume Indicator */}
              {pattern.volumeAnalysis && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: '600',
                  background: pattern.volumeAnalysis.hasVolumeConfirmation
                    ? 'rgba(14, 203, 129, 0.15)'
                    : 'rgba(246, 70, 93, 0.15)',
                  border: `1px solid ${pattern.volumeAnalysis.hasVolumeConfirmation ? '#0ECB81' : '#F6465D'}`,
                  color: pattern.volumeAnalysis.hasVolumeConfirmation ? '#0ECB81' : '#F6465D'
                }}>
                  <BarChart3 size={10} />
                  <span>Vol: {pattern.volumeAnalysis.volumeRatio}x</span>
                  {pattern.volumeAnalysis.hasVolumeConfirmation && <CheckCircle size={10} />}
                </div>
              )}

              {/* Trend Indicator */}
              {pattern.trendAnalysis && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: '600',
                  background: pattern.trendAlignment?.alignment === 'WITH_TREND'
                    ? 'rgba(14, 203, 129, 0.15)'
                    : pattern.trendAlignment?.alignment === 'COUNTER_TREND'
                    ? 'rgba(246, 70, 93, 0.15)'
                    : 'rgba(255, 189, 89, 0.15)',
                  border: `1px solid ${
                    pattern.trendAlignment?.alignment === 'WITH_TREND' ? '#0ECB81' :
                    pattern.trendAlignment?.alignment === 'COUNTER_TREND' ? '#F6465D' :
                    '#FFBD59'
                  }`,
                  color: pattern.trendAlignment?.alignment === 'WITH_TREND' ? '#0ECB81' :
                         pattern.trendAlignment?.alignment === 'COUNTER_TREND' ? '#F6465D' :
                         '#FFBD59'
                }}>
                  <Activity size={10} />
                  <span>
                    {pattern.trendAnalysis.trend === 'uptrend' ? '↑' :
                     pattern.trendAnalysis.trend === 'downtrend' ? '↓' : '→'}
                    {pattern.trendAlignment?.alignment === 'WITH_TREND' ? ' With Trend' :
                     pattern.trendAlignment?.alignment === 'COUNTER_TREND' ? ' Counter Trend' :
                     ' Sideways'}
                  </span>
                </div>
              )}

              {/* Trend Bonus Badge */}
              {pattern.trendBonus !== 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: '600',
                  background: pattern.trendBonus > 0
                    ? 'rgba(14, 203, 129, 0.15)'
                    : 'rgba(246, 70, 93, 0.15)',
                  border: `1px solid ${pattern.trendBonus > 0 ? '#0ECB81' : '#F6465D'}`,
                  color: pattern.trendBonus > 0 ? '#0ECB81' : '#F6465D'
                }}>
                  <span>{pattern.trendBonus > 0 ? '+' : ''}{pattern.trendBonus} pts</span>
                </div>
              )}
            </div>

            {/* Warning Badge */}
            {pattern.warning && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '600',
                background: 'rgba(246, 70, 93, 0.1)',
                border: '1px solid rgba(246, 70, 93, 0.3)',
                color: '#F6465D'
              }}>
                <AlertTriangle size={12} />
                <span>
                  {pattern.warning === 'COUNTER_TREND_RISK'
                    ? 'Warning: Counter-trend - Higher risk'
                    : pattern.warning === 'LOW_VOLUME'
                    ? 'Warning: Low volume - Weak signal'
                    : pattern.warning}
                </span>
              </div>
            )}

            {/* Score Breakdown (Phase 1 + Phase 2 + Phase 3) */}
            {pattern.scoreBreakdown && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '9px',
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: '4px'
              }}>
                <span>Base: {pattern.scoreBreakdown.base}</span>
                {pattern.scoreBreakdown.volume !== undefined && <span>Vol: +{pattern.scoreBreakdown.volume}</span>}
                {pattern.scoreBreakdown.trend !== undefined && <span>Trend: {pattern.scoreBreakdown.trend > 0 ? '+' : ''}{pattern.scoreBreakdown.trend}</span>}
                {pattern.scoreBreakdown.volumeDir !== undefined && <span>VolDir: {pattern.scoreBreakdown.volumeDir > 0 ? '+' : ''}{pattern.scoreBreakdown.volumeDir}</span>}
                {pattern.scoreBreakdown.confluence !== undefined && <span style={{ color: '#0ECB81' }}>S/R: +{pattern.scoreBreakdown.confluence}</span>}
                {pattern.scoreBreakdown.candle !== undefined && <span style={{ color: '#FFBD59' }}>Candle: +{pattern.scoreBreakdown.candle}</span>}
                {pattern.scoreBreakdown.divergence !== undefined && pattern.scoreBreakdown.divergence > 0 && <span style={{ color: '#A855F7' }}>Div: +{pattern.scoreBreakdown.divergence}</span>}
                {pattern.scoreBreakdown.rr !== undefined && pattern.scoreBreakdown.rr > 0 && <span style={{ color: '#EC4899' }}>R:R: +{pattern.scoreBreakdown.rr}</span>}
              </div>
            )}
          </div>
        )}

        {/* PHASE 2: S/R Confluence & Candle Confirmation (TIER2/3 Only) */}
        {pattern.isPremiumEnhanced && (pattern.confluence || pattern.candleConfirmation) && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '10px 12px',
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.08), rgba(255, 189, 89, 0.08))',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            borderRadius: '8px',
            marginTop: '12px'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', fontWeight: '600' }}>
                Phase 2 Analysis
              </span>
            </div>

            {/* Phase 2 Badges Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {/* S/R Confluence Badge */}
              {pattern.confluence && pattern.confluence.hasConfluence && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: '600',
                  background: 'rgba(0, 255, 136, 0.15)',
                  border: '1px solid #0ECB81',
                  color: '#0ECB81'
                }}>
                  <span>S/R: {pattern.confluence.confluenceScore}</span>
                  <CheckCircle size={10} />
                </div>
              )}

              {/* Candle Confirmation Badge */}
              {pattern.candleConfirmation && pattern.candleConfirmation.hasConfirmation && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: '600',
                  background: 'rgba(255, 189, 89, 0.15)',
                  border: '1px solid #FFBD59',
                  color: '#FFBD59'
                }}>
                  <span>Candle: {pattern.candleConfirmation.confirmationScore}</span>
                  <CheckCircle size={10} />
                </div>
              )}

              {/* Waiting for Candle Confirmation */}
              {pattern.waitingFor === 'CANDLE_CONFIRMATION' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: '600',
                  background: 'rgba(148, 163, 184, 0.15)',
                  border: '1px solid #94A3B8',
                  color: '#94A3B8'
                }}>
                  <span>Waiting for candle confirmation</span>
                </div>
              )}
            </div>

            {/* Confluence Notes */}
            {pattern.confluence && pattern.confluence.confluenceNotes && pattern.confluence.confluenceNotes.length > 0 && (
              <div style={{
                fontSize: '9px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginTop: '4px'
              }}>
                {pattern.confluence.confluenceNotes.slice(0, 2).map((note, idx) => (
                  <div key={idx} style={{ marginBottom: '2px' }}>{note}</div>
                ))}
              </div>
            )}

            {/* Candle Signals */}
            {pattern.candleConfirmation && pattern.candleConfirmation.confirmationSignals && pattern.candleConfirmation.confirmationSignals.length > 0 && (
              <div style={{
                fontSize: '9px',
                color: 'rgba(255, 189, 89, 0.8)',
                marginTop: '2px'
              }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Signals: </span>
                {pattern.candleConfirmation.confirmationSignals.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* PHASE 3: RSI Divergence & Dynamic R:R (TIER2/3 Only) */}
        {pattern.isPremiumEnhanced && (pattern.rsiDivergence || pattern.rrOptimization) && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '10px 12px',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.08))',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '8px',
            marginTop: '12px'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', fontWeight: '600' }}>
                Phase 3 Analysis
              </span>
            </div>

            {/* Phase 3 Badges Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {/* RSI Divergence Badge */}
              {pattern.rsiDivergence && pattern.rsiDivergence.hasDivergence && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: '600',
                  background: pattern.hasAlignedDivergence
                    ? 'rgba(14, 203, 129, 0.2)'
                    : 'rgba(168, 85, 247, 0.15)',
                  border: `1px solid ${pattern.hasAlignedDivergence ? '#0ECB81' : '#A855F7'}`,
                  color: pattern.hasAlignedDivergence ? '#0ECB81' : '#A855F7'
                }}>
                  <span>{pattern.rsiDivergence.divergenceType} Div</span>
                  {pattern.hasAlignedDivergence && <CheckCircle size={10} />}
                </div>
              )}

              {/* Current RSI Badge */}
              {pattern.rsiDivergence && pattern.rsiDivergence.currentRSI && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: '600',
                  background: pattern.rsiDivergence.currentRSI > 70
                    ? 'rgba(246, 70, 93, 0.15)'
                    : pattern.rsiDivergence.currentRSI < 30
                    ? 'rgba(14, 203, 129, 0.15)'
                    : 'rgba(148, 163, 184, 0.15)',
                  border: `1px solid ${
                    pattern.rsiDivergence.currentRSI > 70 ? '#F6465D' :
                    pattern.rsiDivergence.currentRSI < 30 ? '#0ECB81' : '#94A3B8'
                  }`,
                  color: pattern.rsiDivergence.currentRSI > 70 ? '#F6465D' :
                         pattern.rsiDivergence.currentRSI < 30 ? '#0ECB81' : '#94A3B8'
                }}>
                  <span>RSI: {pattern.rsiDivergence.currentRSI}</span>
                </div>
              )}

              {/* Optimized R:R Badge */}
              {pattern.rrOptimization && pattern.optimizedRR && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: '600',
                  background: 'rgba(236, 72, 153, 0.15)',
                  border: '1px solid #EC4899',
                  color: '#EC4899'
                }}>
                  <span>R:R {pattern.rrOptimization.originalRR.toFixed(1)} → {pattern.optimizedRR.toFixed(1)}</span>
                  <TrendingUp size={10} />
                </div>
              )}
            </div>

            {/* Divergence Info */}
            {pattern.rsiDivergence && pattern.rsiDivergence.hasDivergence && pattern.rsiDivergence.divergenceInfo && (
              <div style={{
                fontSize: '9px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginTop: '4px'
              }}>
                <div style={{ marginBottom: '2px' }}>
                  {pattern.rsiDivergence.divergenceInfo.description}
                </div>
              </div>
            )}

            {/* R:R Optimization Details */}
            {pattern.rrOptimization && pattern.rrOptimization.adjustments && pattern.rrOptimization.adjustments.length > 0 && (
              <div style={{
                fontSize: '9px',
                color: 'rgba(236, 72, 153, 0.8)',
                marginTop: '2px'
              }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Adjustments: </span>
                {pattern.rrOptimization.adjustments.map((adj, idx) => (
                  <span key={idx} style={{ marginRight: '8px' }}>
                    {adj.factor}: {adj.impact}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Current Price Section (if different from entry) */}
        {showCurrentPrice && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: 'rgba(255, 189, 89, 0.1)',
            border: '1px solid rgba(255, 189, 89, 0.3)',
            borderRadius: '8px',
            marginTop: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#FFBD59', fontWeight: '600' }}>
                {t('currentPrice')}
              </span>
              <span style={{
                fontSize: '9px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: currentPrice > pattern.entry
                  ? 'rgba(14, 203, 129, 0.15)'
                  : 'rgba(246, 70, 93, 0.15)',
                color: currentPrice > pattern.entry ? '#0ECB81' : '#F6465D',
                fontWeight: '700'
              }}>
                {currentPrice > pattern.entry ? '▲' : '▼'} {Math.abs(((currentPrice - pattern.entry) / pattern.entry) * 100).toFixed(2)}%
              </span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFBD59' }}>
              ${currentPrice.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Compact Actions */}
      <div className="compact-actions">
        <button className="action-btn-compact primary" onClick={handleCopy}>
          <Copy size={16} />
          <span>{t('copy')}</span>
        </button>
        <button className="action-btn-compact secondary" onClick={handleSave}>
          <Save size={16} />
          <span>{t('save')}</span>
        </button>
      </div>
    </div>
  );
};

export default PatternInfoUltraCompact;
