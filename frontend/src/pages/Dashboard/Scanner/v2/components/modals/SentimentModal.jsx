import React from 'react';
import './Modal.css';

export const SentimentModal = ({ pattern, onClose }) => {
  if (!pattern) return null;

  const sentimentData = {
    overall: 72,
    social: 68,
    news: 75,
    technical: 78,
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon">😊</span>
            <div>
              <h2>Sentiment Analysis</h2>
              <span className="modal-tier-badge tier-2">TIER 2</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Overall Sentiment */}
          <div className="modal-section">
            <h3 className="modal-section-title">Overall Market Sentiment</h3>
            <div className="modal-card">
              <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                <div style={{ fontSize: '64px', marginBottom: 'var(--space-md)' }}>
                  {sentimentData.overall >= 70 ? '🟢' : sentimentData.overall >= 40 ? '🟡' : '🔴'}
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--brand-gold)' }}>
                  {sentimentData.overall}% Bullish
                </div>
                <div className="modal-label" style={{ marginTop: 'var(--space-xs)' }}>
                  for {pattern.coin}
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="modal-section">
            <h3 className="modal-section-title">Sentiment Breakdown</h3>
            <div className="modal-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {/* Social Media */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                    <span className="modal-label">Social Media</span>
                    <span style={{ fontWeight: 'var(--font-bold)' }}>{sentimentData.social}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${sentimentData.social}%`, background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)', borderRadius: '4px' }} />
                  </div>
                </div>

                {/* News Sentiment */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                    <span className="modal-label">News Sentiment</span>
                    <span style={{ fontWeight: 'var(--font-bold)' }}>{sentimentData.news}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${sentimentData.news}%`, background: 'linear-gradient(90deg, #00D9FF, #00A3CC)', borderRadius: '4px' }} />
                  </div>
                </div>

                {/* Technical Analysis */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                    <span className="modal-label">Technical Indicators</span>
                    <span style={{ fontWeight: 'var(--font-bold)' }}>{sentimentData.technical}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${sentimentData.technical}%`, background: 'linear-gradient(90deg, #00FF88, #00CC6E)', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Mentions */}
          <div className="modal-section">
            <h3 className="modal-section-title">Recent Mentions</h3>
            <div className="modal-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {['Twitter', 'Reddit', 'Telegram'].map((platform, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-sm)', background: 'rgba(0, 0, 0, 0.2)', borderRadius: 'var(--radius-sm)' }}>
                    <span className="modal-label">{platform}</span>
                    <span style={{ fontSize: 'var(--text-sm)', color: '#00FF88' }}>+{Math.floor(Math.random() * 500)}% mentions (24h)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>Close</button>
          <button className="modal-btn modal-btn-primary">View Detailed Report</button>
        </div>
      </div>
    </div>
  );
};

export default SentimentModal;
