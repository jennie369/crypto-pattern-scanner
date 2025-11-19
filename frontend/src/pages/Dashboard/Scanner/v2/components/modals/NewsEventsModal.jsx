import React from 'react';
import { Newspaper, BarChart3 } from 'lucide-react';
import './Modal.css';

export const NewsEventsModal = ({ pattern, onClose }) => {
  if (!pattern) return null;

  const newsItems = [
    { id: 1, title: 'Bitcoin ETF Approval Expected Next Week', source: 'CoinDesk', sentiment: 'Bullish', time: '2h ago' },
    { id: 2, title: 'Major Exchange Adds New Trading Pairs', source: 'CryptoNews', sentiment: 'Neutral', time: '4h ago' },
    { id: 3, title: 'Regulatory Concerns in Europe', source: 'Reuters', sentiment: 'Bearish', time: '6h ago' },
  ];

  const events = [
    { id: 1, title: 'Fed Interest Rate Decision', date: '2024-01-31', impact: 'High' },
    { id: 2, title: 'Bitcoin Halving Event', date: '2024-04-20', impact: 'Very High' },
    { id: 3, title: 'ETH 2.0 Upgrade', date: '2024-03-15', impact: 'High' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon"><Newspaper size={24} /></span>
            <div>
              <h2>News & Events Calendar</h2>
              <span className="modal-tier-badge tier-2">TIER 2</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Latest News */}
          <div className="modal-section">
            <h3 className="modal-section-title">Latest News</h3>
            <div className="modal-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {newsItems.map((news) => (
                  <div
                    key={news.id}
                    style={{
                      padding: 'var(--space-md)',
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                      e.currentTarget.style.borderColor = 'var(--brand-cyan)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xs)' }}>
                      <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                        {news.title}
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-bold)',
                        background: news.sentiment === 'Bullish' ? 'rgba(0, 255, 136, 0.15)' : news.sentiment === 'Bearish' ? 'rgba(246, 70, 93, 0.15)' : 'rgba(255, 189, 89, 0.15)',
                        color: news.sentiment === 'Bullish' ? '#00FF88' : news.sentiment === 'Bearish' ? '#F6465D' : '#FFBD59',
                      }}>
                        {news.sentiment}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      <span>{news.source}</span>
                      <span>{news.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="modal-section">
            <h3 className="modal-section-title">Upcoming Events</h3>
            <div className="modal-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {events.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--space-md)',
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderLeft: `3px solid ${event.impact === 'Very High' ? '#F6465D' : event.impact === 'High' ? '#FFBD59' : '#00FF88'}`,
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                        {event.title}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <span style={{
                      padding: 'var(--space-xs) var(--space-sm)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-bold)',
                      background: event.impact === 'Very High' ? 'rgba(246, 70, 93, 0.15)' : event.impact === 'High' ? 'rgba(255, 189, 89, 0.15)' : 'rgba(0, 255, 136, 0.15)',
                      color: event.impact === 'Very High' ? '#F6465D' : event.impact === 'High' ? '#FFBD59' : '#00FF88',
                    }}>
                      {event.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Impact */}
          <div className="modal-section">
            <h3 className="modal-section-title">Market Impact Analysis</h3>
            <div className="modal-card">
              <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-secondary)' }}>
                <div style={{ marginBottom: 'var(--space-sm)', display: 'flex', justifyContent: 'center' }}><BarChart3 size={48} /></div>
                <p>AI-powered news sentiment analysis</p>
                <p style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-xs)' }}>
                  Real-time impact assessment on {pattern.coin}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>Close</button>
          <button className="modal-btn modal-btn-primary">Set Alerts</button>
        </div>
      </div>
    </div>
  );
};

export default NewsEventsModal;
