import React, { useState, useEffect } from 'react';
import { Microscope, Settings, BarChart3, DollarSign, FolderOpen, AlertTriangle, Loader, Rocket, X } from 'lucide-react';
import { backtestingService } from '../services/backtestingService';
import { supabase } from '../lib/supabaseClient';
// import './Backtesting.css'; // Commented out to use global styles from components.css

const Backtesting = () => {
  const [configs, setConfigs] = useState([]);
  const [currentConfig, setCurrentConfig] = useState({
    name: '',
    description: '',
    patterns: ['DPD', 'UPU'],
    symbols: ['BTCUSDT'],
    timeframe: '4h',
    startDate: '2020-01-01',
    endDate: '2024-12-31',
    riskPerTrade: 2,
    initialCapital: 10000,
    entryRules: {
      requireConfirmation: true,
      minConfidence: 70,
      zoneStatusRequired: ['fresh', 'tested_1x']
    },
    exitRules: {
      rrRatio: 2,
      useTrailingStop: false,
      partialTpLevels: []
    }
  });

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('config'); // 'config', 'results', 'trades', 'history'

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('backtestconfigs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setConfigs(data || []);
    } catch (err) {
      console.error('Error loading configs:', err);
    }
  };

  const runBacktest = async () => {
    setIsRunning(true);
    setProgress(0);
    setError(null);
    setResults(null);

    try {
      // Validate config
      if (!currentConfig.name) {
        throw new Error('Please enter a backtest name');
      }

      // Save config first
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      // Debug: Log config before sending
      console.log('📋 Backtest Config Before Submit:', currentConfig);
      console.log('📋 Symbols array:', currentConfig.symbols);
      console.log('📋 First symbol:', currentConfig.symbols[0]);

      // Prepare config for database
      // Handle both old schema (symbol singular) and new schema (symbols array)

      // Debug: Check all data types
      console.log('=== CONFIG TYPE VALIDATION ===');
      console.log('startDate:', currentConfig.startDate, 'type:', typeof currentConfig.startDate);
      console.log('endDate:', currentConfig.endDate, 'type:', typeof currentConfig.endDate);
      console.log('riskPerTrade:', currentConfig.riskPerTrade, 'type:', typeof currentConfig.riskPerTrade);
      console.log('initialCapital:', currentConfig.initialCapital, 'type:', typeof currentConfig.initialCapital);

      // Ensure dates are strings (not Date objects or numbers)
      const startDate = typeof currentConfig.startDate === 'string'
        ? currentConfig.startDate
        : currentConfig.startDate instanceof Date
        ? currentConfig.startDate.toISOString().split('T')[0]
        : String(currentConfig.startDate);

      const endDate = typeof currentConfig.endDate === 'string'
        ? currentConfig.endDate
        : currentConfig.endDate instanceof Date
        ? currentConfig.endDate.toISOString().split('T')[0]
        : String(currentConfig.endDate);

      // Ensure numeric fields are correct types
      const riskPerTrade = parseFloat(currentConfig.riskPerTrade);
      const initialCapital = parseFloat(currentConfig.initialCapital);

      console.log('Converted startDate:', startDate, 'type:', typeof startDate);
      console.log('Converted endDate:', endDate, 'type:', typeof endDate);
      console.log('Converted riskPerTrade:', riskPerTrade, 'type:', typeof riskPerTrade);
      console.log('Converted initialCapital:', initialCapital, 'type:', typeof initialCapital);

      const configToSave = {
        user_id: user.id,
        name: currentConfig.name,
        description: currentConfig.description,
        patterns: currentConfig.patterns,
        timeframe: currentConfig.timeframe,
        start_date: startDate,
        end_date: endDate,
        risk_per_trade: riskPerTrade,
        initial_capital: initialCapital,
        entry_rules: currentConfig.entryRules,
        exit_rules: currentConfig.exitRules
      };

      console.log('=== FINAL CONFIG TO SAVE ===');
      console.log(JSON.stringify(configToSave, null, 2));

      // Check for any decimal values where integers are expected
      Object.entries(configToSave).forEach(([key, value]) => {
        if (typeof value === 'number' && !Number.isInteger(value)) {
          console.log(`⚠️ Decimal found in ${key}:`, value);
        }
      });

      let savedConfig = null;

      // Try new schema first (symbols array), fallback to old schema (symbol string)
      try {
        const { data, error } = await supabase
          .from('backtestconfigs')
          .insert([{
            ...configToSave,
            symbols: currentConfig.symbols
          }])
          .select()
          .single();

        if (error) {
          // If error mentions 'symbol' column, try old schema with singular symbol
          if (error.message?.includes('symbol') || error.message?.includes('column')) {
            console.log('⚠️ New schema failed, trying old schema with singular symbol...');
            const { data: dataOld, error: errorOld } = await supabase
              .from('backtestconfigs')
              .insert([{
                ...configToSave,
                symbol: currentConfig.symbols[0] || 'BTCUSDT'  // Use first symbol from array
              }])
              .select()
              .single();

            if (errorOld) throw errorOld;
            savedConfig = dataOld;
            console.log('✅ Config saved with old schema (singular symbol)');
          } else {
            throw error;
          }
        } else {
          savedConfig = data;
          console.log('✅ Config saved with new schema (symbols array)');
        }

        console.log('📋 Saved config:', savedConfig);
      } catch (err) {
        console.error('❌ Config save failed:', err);
        throw err;
      }

      if (!savedConfig) {
        throw new Error('Failed to save config - no data returned');
      }

      // Run backtest
      setProgress(10);
      const backtestResults = await backtestingService.runBacktest(currentConfig);
      setProgress(80);

      // Save results
      await backtestingService.saveBacktest(savedConfig.id, user.id, backtestResults);
      setProgress(100);

      setResults(backtestResults);
      setActiveTab('results');

      // Reload configs
      await loadConfigs();

    } catch (err) {
      console.error('Backtest failed:', err);
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const loadConfig = (config) => {
    setCurrentConfig(config);
    setActiveTab('config');
  };

  const cancelBacktest = () => {
    backtestingService.cancel();
    setIsRunning(false);
  };

  return (
    <div className="page-container">
      <div className="page-content wide">
        <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
          <div className="page-header">
            <h1 className="heading-gold" style={{ marginBottom: '32px' }}>
              <Microscope size={40} style={{ marginRight: '12px', display: 'inline-block', verticalAlign: 'middle' }} /> Professional Backtesting Engine
            </h1>
        <p className="text-muted" style={{ fontSize: '18px', marginBottom: '32px' }}>Test your trading strategies with historical data • Zone Retest Method • 68%+ Win Rate Target</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          <Settings size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Configuration
        </button>
        <button
          className={`tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
          disabled={!results}
        >
          <BarChart3 size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Results
        </button>
        <button
          className={`tab ${activeTab === 'trades' ? 'active' : ''}`}
          onClick={() => setActiveTab('trades')}
          disabled={!results || !results.trades || results.trades.length === 0}
        >
          <DollarSign size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Trades ({results?.trades?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FolderOpen size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> History
        </button>
      </div>

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="card-glass" style={{
          borderColor: 'rgba(255, 189, 89, 0.22)',
          padding: '32px',
          marginBottom: '24px'
        }}>
          <h3>Strategy Configuration</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Backtest Name *</label>
              <input
                type="text"
                value={currentConfig.name}
                onChange={(e) => setCurrentConfig({ ...currentConfig, name: e.target.value })}
                placeholder="e.g., DPD Strategy 4H 2020-2024"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={currentConfig.description}
              onChange={(e) => setCurrentConfig({ ...currentConfig, description: e.target.value })}
              placeholder="Optional description of your strategy..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Patterns to Trade</label>
              <div className="checkbox-group">
                {['DPD', 'UPU', 'HEAD_AND_SHOULDERS'].map(pattern => (
                  <label key={pattern} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={currentConfig.patterns.includes(pattern)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...currentConfig.patterns, pattern]
                          : currentConfig.patterns.filter(p => p !== pattern);
                        setCurrentConfig({ ...currentConfig, patterns: updated });
                      }}
                    />
                    <span>{pattern}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Symbols</label>
              <select
                multiple
                value={currentConfig.symbols}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setCurrentConfig({ ...currentConfig, symbols: selected });
                }}
                className="multi-select"
                size={5}
              >
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="BNBUSDT">BNB/USDT</option>
                <option value="ADAUSDT">ADA/USDT</option>
                <option value="SOLUSDT">SOL/USDT</option>
                <option value="XRPUSDT">XRP/USDT</option>
                <option value="DOTUSDT">DOT/USDT</option>
                <option value="MATICUSDT">MATIC/USDT</option>
              </select>
              <small>Hold Ctrl (Cmd on Mac) to select multiple</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Timeframe</label>
              <select
                value={currentConfig.timeframe}
                onChange={(e) => setCurrentConfig({ ...currentConfig, timeframe: e.target.value })}
              >
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="1d">1 Day</option>
                <option value="1w">1 Week</option>
              </select>
            </div>

            <div className="form-group">
              <label>Initial Capital ($)</label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={currentConfig.initialCapital}
                onChange={(e) => setCurrentConfig({ ...currentConfig, initialCapital: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={currentConfig.startDate}
                onChange={(e) => setCurrentConfig({ ...currentConfig, startDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={currentConfig.endDate}
                onChange={(e) => setCurrentConfig({ ...currentConfig, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Risk Per Trade (%)</label>
              <input
                type="number"
                min="0.5"
                max="5"
                step="0.5"
                value={currentConfig.riskPerTrade}
                onChange={(e) => setCurrentConfig({ ...currentConfig, riskPerTrade: parseFloat(e.target.value) })}
              />
              <small>Recommended: 1-2%</small>
            </div>

            <div className="form-group">
              <label>Risk:Reward Ratio</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.5"
                value={currentConfig.exitRules.rrRatio}
                onChange={(e) => setCurrentConfig({
                  ...currentConfig,
                  exitRules: { ...currentConfig.exitRules, rrRatio: parseFloat(e.target.value) }
                })}
              />
              <small>Target profit vs risk</small>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon"><AlertTriangle size={18} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /></span>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={runBacktest}
            disabled={isRunning}
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              background: 'linear-gradient(135deg, #FFBD59 0%, #FF8C00 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#0A0E27',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '15px',
              fontWeight: 700,
              cursor: isRunning ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(255, 189, 89, 0.3)',
              opacity: isRunning ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isRunning) {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 6px 30px rgba(255, 189, 89, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isRunning) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 20px rgba(255, 189, 89, 0.3)';
              }
            }}
          >
            {isRunning ? (
              <>
                <Loader size={16} className="spin" style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Running... {progress}%
              </>
            ) : (
              <>
                <Rocket size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Run Backtest
              </>
            )}
          </button>

          {isRunning && (
            <button className="btn-secondary" onClick={cancelBacktest}>
              <X size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Cancel
            </button>
          )}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && results && (
        <div className="card-glass" style={{
          borderColor: 'rgba(0, 217, 255, 0.22)',
          padding: '32px',
          marginBottom: '24px'
        }}>
          <h3><BarChart3 size={24} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} /> Backtest Results</h3>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Total Trades</div>
              <div className="metric-value">{results.metrics.total_trades}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Win Rate</div>
              <div className={`metric-value ${results.metrics.win_rate >= 68 ? 'green' : 'red'}`}>
                {results.metrics.win_rate.toFixed(2)}%
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Total Return</div>
              <div className={`metric-value ${results.metrics.total_return > 0 ? 'green' : 'red'}`}>
                {results.metrics.total_return.toFixed(2)}%
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Net Profit</div>
              <div className={`metric-value ${results.metrics.net_profit > 0 ? 'green' : 'red'}`}>
                ${results.metrics.net_profit.toFixed(2)}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Profit Factor</div>
              <div className="metric-value">
                {results.metrics.profit_factor.toFixed(2)}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Max Drawdown</div>
              <div className="metric-value red">
                {results.metrics.max_drawdown.toFixed(2)}%
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Sharpe Ratio</div>
              <div className="metric-value">
                {results.metrics.sharpe_ratio.toFixed(2)}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Avg Win</div>
              <div className="metric-value green">
                ${results.metrics.avg_win.toFixed(2)}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Avg Loss</div>
              <div className="metric-value red">
                ${results.metrics.avg_loss.toFixed(2)}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Avg R:R</div>
              <div className="metric-value">
                {results.metrics.avg_rratio.toFixed(2)}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Patterns Found</div>
              <div className="metric-value">{results.patterns_detected}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Patterns Entered</div>
              <div className="metric-value">{results.patterns_entered}</div>
            </div>
          </div>

          <div className="stats-section">
            <h4>Additional Statistics</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Winning Trades:</span>
                <span className="stat-value green">{results.metrics.winning_trades}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Losing Trades:</span>
                <span className="stat-value red">{results.metrics.losing_trades}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Neutral Trades:</span>
                <span className="stat-value">{results.metrics.neutral_trades}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Largest Win:</span>
                <span className="stat-value green">${results.metrics.largest_win.toFixed(2)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Largest Loss:</span>
                <span className="stat-value red">${results.metrics.largest_loss.toFixed(2)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Trade Duration:</span>
                <span className="stat-value">{results.metrics.avg_trade_duration_hours.toFixed(1)} hours</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Bars to Entry:</span>
                <span className="stat-value">{results.metrics.avg_bars_to_entry.toFixed(1)} bars</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Candles Analyzed:</span>
                <span className="stat-value">{results.candles_analyzed.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trades Tab */}
      {activeTab === 'trades' && results && results.trades && (
        <div className="card-glass" style={{
          borderColor: 'rgba(139, 92, 246, 0.22)',
          padding: '32px',
          marginBottom: '24px',
          overflow: 'hidden'
        }}>
          <h3><DollarSign size={24} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} /> All Trades ({results.trades.length})</h3>
          <div className="table-container">
            <table className="trades-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Symbol</th>
                  <th>Pattern</th>
                  <th>Direction</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th>P&L</th>
                  <th>R:R</th>
                  <th>Result</th>
                  <th>Duration</th>
                  <th>Zone Status</th>
                </tr>
              </thead>
              <tbody>
                {results.trades.map((trade, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{trade.symbol}</td>
                    <td>{trade.pattern_type}</td>
                    <td>
                      <span className={`badge ${trade.trade_direction.toLowerCase()}`}>
                        {trade.trade_direction}
                      </span>
                    </td>
                    <td>${trade.entry_price.toFixed(2)}</td>
                    <td>${trade.exit_price.toFixed(2)}</td>
                    <td className={trade.pnl > 0 ? 'green' : trade.pnl < 0 ? 'red' : ''}>
                      ${trade.pnl.toFixed(2)}
                    </td>
                    <td>{trade.rratio_actual?.toFixed(2) || '-'}</td>
                    <td>
                      <span className={`badge ${trade.result.toLowerCase()}`}>
                        {trade.result}
                      </span>
                    </td>
                    <td>{trade.trade_duration_hours}h</td>
                    <td>
                      <span className={`badge zone-${trade.zone_status}`}>
                        {trade.zone_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="card-glass" style={{
          borderColor: 'rgba(255, 189, 89, 0.22)',
          padding: '32px',
          marginBottom: '24px'
        }}>
          <h3><FolderOpen size={24} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} /> Saved Backtests</h3>
          {configs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><FolderOpen size={48} style={{ opacity: 0.5 }} /></div>
              <div className="empty-title">No backtests yet</div>
              <div className="empty-description">Run your first backtest to see it here</div>
            </div>
          ) : (
            <div className="configs-list">
              {configs.map(config => (
                <div key={config.id} className="config-item" style={{
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
                  e.currentTarget.style.borderColor = 'rgba(255, 189, 89, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.35)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.25)';
                }}>
                  <div className="config-header">
                    <h4>{config.name}</h4>
                    <span className="config-date">
                      {new Date(config.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="config-details">
                    <div className="config-detail">
                      <span className="detail-label">Patterns:</span>
                      <span className="detail-value">{config.patterns.join(', ')}</span>
                    </div>
                    <div className="config-detail">
                      <span className="detail-label">Symbols:</span>
                      <span className="detail-value">{config.symbols.join(', ')}</span>
                    </div>
                    <div className="config-detail">
                      <span className="detail-label">Timeframe:</span>
                      <span className="detail-value">{config.timeframe}</span>
                    </div>
                    <div className="config-detail">
                      <span className="detail-label">Period:</span>
                      <span className="detail-value">
                        {config.start_date.split('T')[0]} to {config.end_date.split('T')[0]}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn-secondary"
                    onClick={() => loadConfig(config)}
                  >
                    <Settings size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Load Config
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default Backtesting;
