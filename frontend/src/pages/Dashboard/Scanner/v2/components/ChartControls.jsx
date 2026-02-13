import React, { useState } from 'react';
import { RefreshCw, BarChart2, Maximize2, Minimize2, Settings, ChevronDown, Wifi, WifiOff, Calendar } from 'lucide-react';
import './ChartControls.css';

/**
 * Chart Controls Component
 * Control bar above TradingView chart with all chart actions
 *
 * @param {String} coin - Selected coin symbol
 * @param {String} timeframe - Current timeframe
 * @param {Function} onTimeframeChange - Callback when timeframe changes
 * @param {Object} pattern - Current pattern data
 * @param {Boolean} volumeVisible - Volume visibility state
 * @param {Function} onVolumeToggle - Toggle volume callback
 * @param {Function} onRefresh - Refresh chart callback
 * @param {Function} onFullscreen - Fullscreen toggle callback
 * @param {Boolean} isFullscreen - Fullscreen state
 */
export const ChartControls = ({
  coin = 'BTC/USDT',
  timeframe = '1H',
  onTimeframeChange,
  pattern = null,
  volumeVisible = true,
  onVolumeToggle,
  onRefresh,
  onFullscreen,
  isFullscreen = false,
  isLive = false,
  lastUpdate = null,
  onDateRangeChange
}) => {
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const timeframes = [
    '1m', '3m', '5m', '15m', '30m',
    '1h', '2h', '4h', '6h', '12h',
    '1d', '3d', '1w'
  ];

  const getConfidenceColor = (confidence) => {
    if (!confidence) return '';
    if (confidence >= 80) return 'high';
    if (confidence >= 60) return 'medium';
    return 'low';
  };

  const handleTimeframeSelect = (tf) => {
    onTimeframeChange && onTimeframeChange(tf);
    setShowTimeframeDropdown(false);
  };

  const handleDateRangeApply = () => {
    if (startDate && endDate && onDateRangeChange) {
      onDateRangeChange(startDate, endDate);
      setShowCalendar(false);
    }
  };

  const handleDateRangeReset = () => {
    setStartDate('');
    setEndDate('');
    onDateRangeChange && onDateRangeChange(null, null);
    setShowCalendar(false);
  };

  return (
    <div className="chart-controls-bar">
      {/* Left: Symbol & Pattern Info */}
      <div className="chart-info">
        <span className="chart-symbol">{coin}</span>

        {/* LIVE Status Badge */}
        <div className={`live-status ${isLive ? 'live' : 'offline'}`}>
          {isLive ? (
            <>
              <Wifi size={14} />
              <span>LIVE</span>
              <div className="live-pulse" />
            </>
          ) : (
            <>
              <WifiOff size={14} />
              <span>OFFLINE</span>
            </>
          )}
        </div>

        <span className="chart-timeframe">{timeframe}</span>
        {pattern && (
          <>
            <span className="chart-pattern">{pattern.patternName || pattern.pattern}</span>
            <span className={`confidence ${getConfidenceColor(pattern.confidence)}`}>
              {pattern.confidence}% Confidence
            </span>
          </>
        )}
      </div>

      {/* Right: Controls */}
      <div className="chart-controls">
        {/* Refresh Button */}
        <button
          className="control-btn"
          onClick={onRefresh}
          title="Refresh Chart"
        >
          <RefreshCw size={16} />
        </button>

        {/* Timeframe Dropdown */}
        <div className="timeframe-dropdown">
          <button
            className="control-btn"
            onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
            title="Change Timeframe"
          >
            {timeframe} <ChevronDown size={14} />
          </button>

          {showTimeframeDropdown && (
            <div className="timeframe-dropdown-menu">
              {timeframes.map(tf => (
                <button
                  key={tf}
                  className={timeframe.toLowerCase() === tf ? 'active' : ''}
                  onClick={() => handleTimeframeSelect(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Calendar Date Range Picker */}
        <div className="calendar-dropdown">
          <button
            className={`control-btn ${startDate && endDate ? 'active' : ''}`}
            onClick={() => setShowCalendar(!showCalendar)}
            title="Historical Date Range"
          >
            <Calendar size={16} />
          </button>

          {showCalendar && (
            <div className="calendar-dropdown-menu">
              <div className="calendar-header">
                <h4>Select Date Range</h4>
                <button onClick={() => setShowCalendar(false)}>×</button>
              </div>
              <div className="calendar-body">
                <div className="date-input-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="date-input-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="calendar-footer">
                  <button className="reset-btn" onClick={handleDateRangeReset}>
                    Reset
                  </button>
                  <button
                    className="apply-btn"
                    onClick={handleDateRangeApply}
                    disabled={!startDate || !endDate}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Volume Toggle */}
        <button
          className={`control-btn ${volumeVisible ? 'active' : ''}`}
          onClick={onVolumeToggle}
          title="Toggle Volume"
        >
          <BarChart2 size={16} />
        </button>

        {/* Fullscreen Button */}
        <button
          className="control-btn"
          onClick={onFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        {/* Settings Button */}
        <button
          className="control-btn"
          onClick={() => setShowSettings(!showSettings)}
          title="Chart Settings"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Settings Modal (Placeholder for future) */}
      {showSettings && (
        <div className="chart-settings-modal">
          <div className="settings-header">
            <h4>Chart Settings</h4>
            <button onClick={() => setShowSettings(false)}>×</button>
          </div>
          <div className="settings-content">
            <p>Chart settings coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartControls;
