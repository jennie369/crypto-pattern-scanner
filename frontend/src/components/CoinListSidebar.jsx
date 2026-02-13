import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { binanceApi } from '../services/binanceApi';
import './CoinListSidebar.css';

/**
 * CoinListSidebar Component
 * Displays scrollable list of Futures coins with realtime prices
 * AND scan results section below
 *
 * Props:
 * - selectedSymbol: Currently selected symbol
 * - onSelectSymbol: Callback when user clicks a coin
 * - scannedCoins: Array of coins with scan results
 * - scanResults: Array of full scan result objects with pattern details
 * - onScanResultClick: Callback when user clicks a scan result
 */
export default function CoinListSidebar({ selectedSymbol, onSelectSymbol, scannedCoins = [], scanResults = [], onScanResultClick }) {
  return (
    <div className="coin-list-sidebar">
      {/* Scan Results Section - Only show when we have results */}
      {scanResults && scanResults.length > 0 && (
        <div className="scan-results-section">
          <div className="scan-results-header">
            <h3><BarChart3 className="w-5 h-5 inline mr-1" /> Scan Results</h3>
            <span className="results-count">{scanResults.length} found</span>
          </div>

          <div className="scan-results-list">
            {scanResults.map((result, index) => {
              const isSelected = result.symbol === selectedSymbol;
              // ✅ FIX: Use .includes() to detect BUY signals (handles 'BUY', 'STRONG_BUY', etc.)
              const isBuySignal = result.signal && result.signal.includes('BUY');

              return (
                <div
                  key={index}
                  className={`scan-result-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onScanResultClick && onScanResultClick(result);
                    onSelectSymbol(result.symbol);
                  }}
                  title="Click to view on chart"
                >
                  <div className="result-header">
                    <span className="result-symbol">{result.symbol.replace('USDT', '')}</span>
                    <span className={`result-signal ${isBuySignal ? 'buy' : 'sell'}`}>
                      {isBuySignal ? <><TrendingUp className="w-4 h-4 inline mr-1 text-green-500" /> LONG</> : <><TrendingDown className="w-4 h-4 inline mr-1 text-red-500" /> SHORT</>}
                    </span>
                  </div>

                  <div className="result-details">
                    <span className="result-pattern">{result.pattern}</span>
                    <span className="result-confidence">{result.confidence.toFixed(0)}%</span>
                  </div>

                  <div className="result-levels">
                    <span className="level-entry">Entry: ${result.entry.toFixed(2)}</span>
                    <span className="level-tp">TP: ${result.takeProfit.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state when no scan results */}
      {(!scanResults || scanResults.length === 0) && (
        <div className="scan-results-empty">
          <div className="empty-icon"><BarChart3 className="w-16 h-16" /></div>
          <h3>No Scan Results Yet</h3>
          <p>Click "Bắt Đầu Scan" to find patterns</p>
        </div>
      )}
    </div>
  );
}
