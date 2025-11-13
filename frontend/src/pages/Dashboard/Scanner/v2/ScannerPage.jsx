import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import TradingChart from './components/TradingChart';
import PatternDetails from './components/PatternDetails';
import SubToolsPanel from './components/SubToolsPanel';
import './ScannerPage.css';

/**
 * Scanner Page v2 - GEM Platform
 * 3-column layout with real-time pattern detection
 * Week 3, Day 18-21
 */
export const ScannerPage = () => {
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [scanResults, setScanResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async (filters) => {
    setIsScanning(true);
    try {
      // TODO: Call scan API
      // const results = await scanPatterns(filters);
      // setScanResults(results);

      // Mock results for demonstration
      setTimeout(() => {
        setScanResults([
          {
            id: 1,
            coin: 'BTC/USDT',
            pattern: 'DPD',
            patternName: 'Down-Pause-Down',
            confidence: 87,
            timeframe: '1H',
            entry: 42150,
            stopLoss: 43200,
            takeProfit: 40500,
            riskReward: 1.57,
            detectedAt: new Date().toISOString(),
          },
          {
            id: 2,
            coin: 'ETH/USDT',
            pattern: 'UPU',
            patternName: 'Up-Pause-Up',
            confidence: 76,
            timeframe: '1H',
            entry: 2150,
            stopLoss: 2100,
            takeProfit: 2250,
            riskReward: 2.0,
            detectedAt: new Date().toISOString(),
          },
          {
            id: 3,
            coin: 'SOL/USDT',
            pattern: 'H&S',
            patternName: 'Head & Shoulders',
            confidence: 92,
            timeframe: '4H',
            entry: 98.50,
            stopLoss: 102.00,
            takeProfit: 92.00,
            riskReward: 1.86,
            detectedAt: new Date().toISOString(),
          },
          {
            id: 4,
            coin: 'BNB/USDT',
            pattern: 'Double Bottom',
            patternName: 'Double Bottom',
            confidence: 68,
            timeframe: '1D',
            entry: 310,
            stopLoss: 295,
            takeProfit: 340,
            riskReward: 2.0,
            detectedAt: new Date().toISOString(),
          },
        ]);
        setSelectedPattern(null); // Reset selection on new scan
        setIsScanning(false);
      }, 2000);
    } catch (error) {
      console.error('Scan error:', error);
      setIsScanning(false);
    }
  };

  const handleSelectPattern = (pattern) => {
    setSelectedPattern(pattern);
  };

  return (
    <div className="scanner-page-v2">
      <div className="scanner-layout">
        {/* LEFT - Control Panel */}
        <div className="scanner-left">
          <ControlPanel
            onScan={handleScan}
            isScanning={isScanning}
            results={scanResults}
            onSelectPattern={handleSelectPattern}
            selectedPattern={selectedPattern}
          />
        </div>

        {/* CENTER - Trading Chart */}
        <div className="scanner-center">
          <TradingChart
            pattern={selectedPattern}
          />
        </div>

        {/* RIGHT - Pattern Details + Sub-Tools */}
        <div className="scanner-right">
          <PatternDetails
            pattern={selectedPattern}
          />

          <SubToolsPanel
            pattern={selectedPattern}
          />
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;
