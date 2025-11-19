import React from 'react';
import PatternCard from './PatternCard';
import './App.css';

/**
 * DEMO APP - Pattern Card Examples
 * 
 * Demonstrates all features of PatternCard component:
 * - Different pattern types
 * - Bullish vs Bearish
 * - Multiple TP levels
 * - Various confidence levels
 */

function App() {
  // Sample pattern data
  const samplePatterns = [
    {
      symbol: 'BTCUSDT Perp',
      patternType: 'Head and Shoulders',
      patternImage: null, // Will show placeholder with highlight
      entry: 110598.33,
      stopLoss: 110999.07,
      takeProfit: [110197.59, 109796.84, 109396.10],
      confidence: 0.90,
      timestamp: '2025-11-02T12:00:00Z',
      direction: 'bearish',
      chartCoordinates: { startIdx: 100, endIdx: 150 }
    },
    {
      symbol: 'ETHUSDT Perp',
      patternType: 'Double Bottom',
      patternImage: null,
      entry: 3876.50,
      stopLoss: 3820.00,
      takeProfit: [3920.00, 3965.00, 4010.00],
      confidence: 0.85,
      timestamp: '2025-11-02T11:45:00Z',
      direction: 'bullish',
      chartCoordinates: { startIdx: 80, endIdx: 130 }
    },
    {
      symbol: 'BNBUSDT Perp',
      patternType: 'Ascending Triangle',
      patternImage: null,
      entry: 1091.20,
      stopLoss: 1075.00,
      takeProfit: [1105.00, 1118.50],
      confidence: 0.78,
      timestamp: '2025-11-02T11:30:00Z',
      direction: 'bullish',
      chartCoordinates: { startIdx: 60, endIdx: 120 }
    },
    {
      symbol: 'XRPUSDT Perp',
      patternType: 'Bearish Engulfing',
      patternImage: null,
      entry: 2.5193,
      stopLoss: 2.5650,
      takeProfit: [2.4850, 2.4500, 2.4150],
      confidence: 0.82,
      timestamp: '2025-11-02T11:15:00Z',
      direction: 'bearish',
      chartCoordinates: { startIdx: 90, endIdx: 100 }
    },
    {
      symbol: 'SOLUSDT Perp',
      patternType: 'Cup and Handle',
      patternImage: null,
      entry: 187.50,
      stopLoss: 183.00,
      takeProfit: [192.00, 196.50, 201.00],
      confidence: 0.88,
      timestamp: '2025-11-02T11:00:00Z',
      direction: 'bullish',
      chartCoordinates: { startIdx: 50, endIdx: 140 }
    },
    {
      symbol: 'ADAUSDT Perp',
      patternType: 'Supply Zone Rejection',
      patternImage: null,
      entry: 1.2450,
      stopLoss: 1.2780,
      takeProfit: [1.2200, 1.1980, 1.1750],
      confidence: 0.75,
      timestamp: '2025-11-02T10:45:00Z',
      direction: 'bearish',
      chartCoordinates: { startIdx: 70, endIdx: 110 }
    }
  ];

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon">💎</span>
            Gem Trading Academy
            <span className="title-subtitle">Pattern Scanner</span>
          </h1>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Patterns Detected</span>
              <span className="stat-value">{samplePatterns.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Confidence</span>
              <span className="stat-value">
                {(samplePatterns.reduce((acc, p) => acc + p.confidence, 0) / samplePatterns.length * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Pattern Results Section */}
      <main className="pattern-results-section">
        <div className="section-header">
          <h2>🔍 Pattern Detection Results</h2>
          <p className="section-subtitle">
            Real-time pattern recognition across {samplePatterns.length} cryptocurrency pairs
          </p>
        </div>

        {/* Pattern Grid */}
        <div className="pattern-grid">
          {samplePatterns.map((pattern, index) => (
            <PatternCard 
              key={`${pattern.symbol}-${index}`}
              pattern={pattern}
            />
          ))}
        </div>

        {/* Load More Button */}
        <div className="load-more-section">
          <button className="load-more-btn">
            <span>Load More Patterns</span>
            <span className="load-more-icon">↓</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2025 Gem Trading Academy - Pattern Scanner Demo</p>
      </footer>
    </div>
  );
}

export default App;
