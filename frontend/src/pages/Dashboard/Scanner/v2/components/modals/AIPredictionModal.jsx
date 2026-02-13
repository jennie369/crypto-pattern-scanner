import React, { useState } from 'react';
import { Bot, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import './Modal.css';

export const AIPredictionModal = ({ pattern, onClose }) => {
  const [predictionHorizon, setPredictionHorizon] = useState('24h');

  if (!pattern) return null;

  const predictions = {
    '24h': { price: pattern.entry * 1.035, confidence: 78, direction: 'Up' },
    '7d': { price: pattern.entry * 1.089, confidence: 65, direction: 'Up' },
    '30d': { price: pattern.entry * 1.152, confidence: 52, direction: 'Up' },
  };

  const currentPrediction = predictions[predictionHorizon];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon"><Bot size={24} /></span>
            <div>
              <h2>AI Prediction (Gemini 2.5 Flash)</h2>
              <span className="modal-tier-badge tier-3">TIER 3</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Prediction Horizon Selector */}
          <div className="modal-section">
            <h3 className="modal-section-title">Prediction Horizon</h3>
            <div className="modal-card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)' }}>
                {['24h', '7d', '30d'].map((horizon) => (
                  <button
                    key={horizon}
                    onClick={() => setPredictionHorizon(horizon)}
                    style={{
                      padding: 'var(--space-md)',
                      background: predictionHorizon === horizon ? 'rgba(255, 189, 89, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                      border: predictionHorizon === horizon ? '2px solid var(--brand-gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--text-primary)',
                      transition: 'all var(--transition-base)',
                    }}
                  >
                    {horizon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Prediction Result */}
          <div className="modal-section">
            <h3 className="modal-section-title">AI Forecast</h3>
            <div className="modal-card">
              <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                <div style={{ marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'center' }}>
                  {currentPrediction.direction === 'Up' ? <TrendingUp size={64} color="#00FF88" /> : <TrendingDown size={64} color="#F6465D" />}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>
                  Predicted Price ({predictionHorizon})
                </div>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: currentPrediction.direction === 'Up' ? '#00FF88' : '#F6465D' }}>
                  ${currentPrediction.price.toLocaleString()}
                </div>
                <div style={{ fontSize: 'var(--text-lg)', color: 'var(--brand-gold)', marginTop: 'var(--space-sm)' }}>
                  {((currentPrediction.price / pattern.entry - 1) * 100).toFixed(2)}% change
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                  <span className="modal-label">AI Confidence</span>
                  <span style={{ fontWeight: 'var(--font-bold)' }}>{currentPrediction.confidence}%</span>
                </div>
                <div style={{ height: '12px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${currentPrediction.confidence}%`,
                    background: 'linear-gradient(90deg, var(--brand-gold), #FFBD59)',
                    borderRadius: '6px'
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Key Factors */}
          <div className="modal-section">
            <h3 className="modal-section-title">Key Factors Analyzed</h3>
            <div className="modal-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {[
                  { factor: 'Technical Indicators', impact: 'Positive', strength: 85 },
                  { factor: 'Market Sentiment', impact: 'Positive', strength: 72 },
                  { factor: 'Volume Profile', impact: 'Neutral', strength: 50 },
                  { factor: 'On-Chain Metrics', impact: 'Positive', strength: 68 },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{item.factor}</div>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: item.impact === 'Positive' ? '#00FF88' : item.impact === 'Negative' ? '#F6465D' : '#FFBD59',
                        marginTop: '2px'
                      }}>
                        {item.impact}
                      </div>
                    </div>
                    <div style={{ width: '100px' }}>
                      <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${item.strength}%`,
                          background: item.impact === 'Positive' ? '#00FF88' : item.impact === 'Negative' ? '#F6465D' : '#FFBD59',
                          borderRadius: '3px'
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ padding: 'var(--space-sm)', background: 'rgba(255, 189, 89, 0.1)', border: '1px solid rgba(255, 189, 89, 0.3)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-xs)' }}>
              <AlertTriangle size={14} color="#FFBD59" /> AI predictions are for educational purposes only. Not financial advice.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>Close</button>
          <button className="modal-btn modal-btn-primary">Save Prediction</button>
        </div>
      </div>
    </div>
  );
};

export default AIPredictionModal;
