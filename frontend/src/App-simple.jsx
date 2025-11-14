import React, { useState } from 'react';
import Header from './components/Header';
import CoinListSidebar from './components/CoinListSidebar';
import TradingInfoSidebar from './components/TradingInfoSidebar';
import TradingChart from './components/TradingChart';
import './App.css';

/**
 * Simplified App - Testing Header + CoinListSidebar + TradingInfoSidebar
 */
function App() {
  const [theme, setTheme] = useState('dark');
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  const mockPattern = {
    symbol: 'BTCUSDT',
    patternType: 'Head and Shoulders',
    entry: 110598.33,
    stopLoss: 110999.07,
    takeProfit: [110197.59, 109796.84, 109396.10],
    confidence: 0.90,
    direction: 'bearish',
  };

  const handleScan = () => {
    console.log('Scan clicked');
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSymbolSelect = (symbol) => {
    setSelectedSymbol(symbol);
    console.log('Selected:', symbol);
  };

  return (
    <div className={`app ${theme}`}>
      <Header
        onScanClick={handleScan}
        onThemeToggle={handleThemeToggle}
        theme={theme}
      />

      <div className="app-layout">
        <aside className="sidebar-left">
          <CoinListSidebar
            selectedSymbol={selectedSymbol}
            onSelectSymbol={handleSymbolSelect}
            scannedCoins={[]}
          />
        </aside>

        <main className="main-content">
          <TradingChart
            symbol={selectedSymbol}
            interval="15m"
            patterns={[mockPattern]}
          />
        </main>

        <aside className="sidebar-right">
          <TradingInfoSidebar
            pattern={mockPattern}
            symbol={selectedSymbol}
          />
        </aside>
      </div>
    </div>
  );
}

export default App;
