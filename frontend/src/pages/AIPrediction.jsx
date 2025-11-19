import React, { useState, useEffect } from 'react';
import { Bot, AlertTriangle, Loader, TrendingUp, TrendingDown, ArrowUpDown, BarChart3, Lightbulb, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { binanceService } from '../services/binanceService';
import { patternDetectionService } from '../services/patternDetection';
// import './AIPrediction.css'; // Commented out to use global styles from components.css

const patternDetector = patternDetectionService;

const AIPrediction = () => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('4h');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPredictionHistory();
  }, []);

  const loadPredictionHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const runPrediction = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      console.log('🤖 Starting AI prediction...');

      // 1. Fetch recent candles
      const candles = await binanceService.getCandlestickData(symbol, timeframe, 100);

      if (!candles || candles.length === 0) {
        throw new Error('No candle data available');
      }

      console.log(`✅ Fetched ${candles.length} candles`);

      // 2. Detect patterns
      const patterns = [];

      // Detect DPD
      const dpd = patternDetector.detectDPD(candles);
      if (dpd) patterns.push(dpd);

      // Detect UPU
      const upu = patternDetector.detectUPU(candles);
      if (upu) patterns.push(upu);

      // Detect H&S
      const hs = patternDetector.detectHeadAndShoulders(candles);
      if (hs) patterns.push(hs);

      console.log(`✅ Detected ${patterns.length} patterns`);

      // 3. Get user session
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();

      if (!user || !session) {
        throw new Error('Not authenticated');
      }

      // 4. Call Gemini via Edge Function
      console.log('🚀 Calling Gemini AI...');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-prediction-gemini`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'user-id': user.id
          },
          body: JSON.stringify({
            candles,
            patterns,
            symbol,
            timeframe
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Prediction failed');
      }

      const aiPrediction = await response.json();

      console.log('✅ AI Prediction received:', aiPrediction);

      setPrediction(aiPrediction);

      // Reload history
      await loadPredictionHistory();

    } catch (err) {
      console.error('❌ AI Prediction failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
          <div className="page-header">
            <h1 className="heading-gold" style={{ marginBottom: '32px' }}>
              <Bot size={40} style={{ marginRight: '12px', display: 'inline-block', verticalAlign: 'middle' }} /> AI Prediction Tool
            </h1>
            <p className="text-muted" style={{ fontSize: '18px', marginBottom: '32px' }}>AI-powered market analysis with Gemini 2.5 Flash • Zone Retest Strategy • Free Tier: 15 predictions/min</p>
          </div>

          {/* Input Panel */}
          <div className="card-glass" style={{
            borderColor: 'rgba(255, 189, 89, 0.22)',
            padding: '32px',
            marginBottom: '24px'
          }}>
        <div className="form-row">
          <div className="form-group">
            <label>Symbol</label>
            <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
              <option value="BTCUSDT">BTC/USDT</option>
              <option value="ETHUSDT">ETH/USDT</option>
              <option value="BNBUSDT">BNB/USDT</option>
              <option value="ADAUSDT">ADA/USDT</option>
              <option value="SOLUSDT">SOL/USDT</option>
              <option value="XRPUSDT">XRP/USDT</option>
              <option value="DOTUSDT">DOT/USDT</option>
              <option value="MATICUSDT">MATIC/USDT</option>
            </select>
          </div>

          <div className="form-group">
            <label>Timeframe</label>
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
              <option value="1h">1 Hour</option>
              <option value="4h">4 Hours</option>
              <option value="1d">1 Day</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon"><AlertTriangle size={18} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /></span>
            <span>{error}</span>
          </div>
        )}

        <button
          className="btn-premium"
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
          onClick={runPrediction}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader size={16} className="spin" style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Analyzing with AI...
            </>
          ) : (
            <>
              <Bot size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Run AI Prediction
            </>
          )}
        </button>
      </div>

      {/* Prediction Result */}
      {prediction && (
        <>
          {/* DISCLAIMER BANNER */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 189, 89, 0.15) 0%, rgba(255, 140, 0, 0.1) 100%)',
            border: '2px solid rgba(255, 189, 89, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertTriangle size={24} style={{ color: '#FFBD59', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{
                color: '#FFBD59',
                fontWeight: 700,
                fontSize: '14px',
                marginBottom: '4px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                ⚠️ NOT FINANCIAL ADVICE
              </div>
              <div style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '13px',
                lineHeight: '1.5',
                fontFamily: 'Inter, sans-serif'
              }}>
                AI predictions are for educational purposes only. Always conduct your own research and consult with a financial advisor before making any trading decisions.
              </div>
            </div>
          </div>

          <div className="card-glass" style={{
            borderColor: 'rgba(0, 217, 255, 0.22)',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <h3><BarChart3 size={24} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} /> AI Analysis Results</h3>

          {/* Confidence Gauge */}
          <div className="confidence-section">
            <div
              className="confidence-circle"
              style={{
                background: `conic-gradient(
                  var(--success-green, #0ECB81) ${prediction.confidence * 3.6}deg,
                  rgba(255,255,255,0.1) ${prediction.confidence * 3.6}deg
                )`
              }}
            >
              <div className="confidence-inner">
                <span className="confidence-number">{prediction.confidence}</span>
                <span className="confidence-label">Confidence</span>
              </div>
            </div>
          </div>

          {/* Prediction Details Grid */}
          <div className="prediction-details">
            <div className="detail-card">
              <div className="detail-label">Prediction</div>
              <div className={`detail-value prediction-${prediction.prediction.toLowerCase()}`}>
                {prediction.prediction === 'UP' && <><TrendingUp size={20} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> BULLISH</>}
                {prediction.prediction === 'DOWN' && <><TrendingDown size={20} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> BEARISH</>}
                {prediction.prediction === 'SIDEWAYS' && <><ArrowUpDown size={20} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> SIDEWAYS</>}
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-label">Target Price</div>
              <div className="detail-value">
                ${prediction.nextPrice?.toLocaleString()}
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-label">Timeframe</div>
              <div className="detail-value">
                {prediction.timeframe || 'N/A'}
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-label">Risk Level</div>
              <div className={`detail-value risk-${prediction.risk?.toLowerCase()}`}>
                {prediction.risk}
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-label">Suggested Action</div>
              <div className={`detail-value action-${prediction.action?.toLowerCase()}`}>
                {prediction.action}
              </div>
            </div>
          </div>

          {/* Key Levels */}
          <div className="key-levels">
            <div className="levels-column">
              <h4><ChevronUp size={20} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Resistance Levels</h4>
              <div className="levels-list">
                {prediction.keyLevels?.resistance?.map((level, idx) => (
                  <div key={idx} className="level-item resistance">
                    ${level.toLocaleString()}
                  </div>
                ))}
              </div>
            </div>

            <div className="levels-column">
              <h4><ChevronDown size={20} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Support Levels</h4>
              <div className="levels-list">
                {prediction.keyLevels?.support?.map((level, idx) => (
                  <div key={idx} className="level-item support">
                    ${level.toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="reasoning-section">
            <h4><Lightbulb size={20} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> AI Reasoning & Strategy</h4>
            <div className="reasoning-content">
              {prediction.reasoning}
            </div>
          </div>
        </div>
        </>
      )}

      {/* Prediction History */}
      <div className="card-glass" style={{
        borderColor: 'rgba(139, 92, 246, 0.22)',
        padding: '32px'
      }}>
        <h3><BarChart3 size={24} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} /> Prediction History</h3>
        {history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><BarChart3 size={48} style={{ opacity: 0.5 }} /></div>
            <div className="empty-title">No predictions yet</div>
            <div className="empty-description">
              Run your first AI prediction to see it here
            </div>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item" style={{
                background: 'linear-gradient(180deg, rgba(74, 26, 79, 0.25) 0%, rgba(30, 42, 94, 0.3) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.3s ease'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.35)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.25)';
              }}>
                <div className="history-header">
                  <div className="history-symbol-group">
                    <span className="history-symbol">{item.symbol}</span>
                    <span className="history-timeframe">{item.timeframe}</span>
                  </div>
                  <div className="history-confidence-group">
                    <span className="history-confidence">{item.confidence}%</span>
                    <span className="history-date">
                      {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="history-prediction">
                  <span className={`prediction-badge ${item.prediction_direction?.toLowerCase()}`}>
                    {item.prediction_direction}
                  </span>
                  <span className="prediction-arrow">→</span>
                  <span className="prediction-price">
                    ${item.prediction?.nextPrice?.toLocaleString()}
                  </span>
                  <span className={`action-badge ${item.suggested_action?.toLowerCase()}`}>
                    {item.suggested_action}
                  </span>
                </div>

                {item.actual_result && (
                  <div className={`history-result result-${item.actual_result.toLowerCase()}`}>
                    <span className="result-label">Result:</span>
                    <span className="result-value">{item.actual_result}</span>
                    {item.accuracy_score && (
                      <span className="accuracy-score">{item.accuracy_score}% accurate</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default AIPrediction;
