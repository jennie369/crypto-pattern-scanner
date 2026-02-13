import React, { useState, useEffect } from 'react';
import './RiskCalculatorContent.css';

/**
 * Risk Calculator Content - 2-column layout with trading scenarios
 * Automatically calculates position size, risk/reward, and profit potential
 */
const RiskCalculatorContent = ({ pattern }) => {
  const [accountSize, setAccountSize] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [entryPrice, setEntryPrice] = useState(pattern?.entry || 42150);
  const [stopLoss, setStopLoss] = useState(pattern?.stopLoss || 43200);
  const [takeProfit, setTakeProfit] = useState(pattern?.takeProfit || 40500);

  const [results, setResults] = useState({});
  const [scenarios, setScenarios] = useState([]);

  useEffect(() => {
    calculateResults();
  }, [accountSize, riskPercent, entryPrice, stopLoss, takeProfit]);

  const calculateResults = () => {
    // Risk amount
    const riskAmount = (accountSize * riskPercent) / 100;

    // Price difference
    const stopLossDiff = Math.abs(entryPrice - stopLoss);
    const takeProfitDiff = Math.abs(entryPrice - takeProfit);

    // Position size (assuming BTC)
    const positionSize = riskAmount / stopLossDiff;

    // Potential profit
    const potentialProfit = positionSize * takeProfitDiff;

    // Risk/Reward ratio
    const riskRewardRatio = takeProfitDiff / stopLossDiff;

    setResults({
      riskAmount,
      positionSize,
      potentialProfit,
      riskRewardRatio
    });

    // Calculate scenarios
    const scenarioRisks = [1, 2, 3, 5];
    const newScenarios = scenarioRisks.map(risk => {
      const riskAmt = (accountSize * risk) / 100;
      const posSize = riskAmt / stopLossDiff;
      const profit = posSize * takeProfitDiff;

      return {
        riskPercent: risk,
        positionSize: posSize,
        riskAmount: riskAmt,
        potentialProfit: profit,
        riskReward: riskRewardRatio
      };
    });

    setScenarios(newScenarios);
  };

  const handleReset = () => {
    setAccountSize(10000);
    setRiskPercent(2);
    if (pattern) {
      setEntryPrice(pattern.entry);
      setStopLoss(pattern.stopLoss);
      setTakeProfit(pattern.takeProfit);
    }
  };

  return (
    <div className="risk-calculator-content">
      <div className="calculator-grid">
        {/* Left Column: Inputs */}
        <div className="calculator-inputs">
          <h3>ACCOUNT SETTINGS</h3>

          <div className="input-group">
            <label>Account Size ($)</label>
            <input
              type="number"
              value={accountSize}
              onChange={(e) => setAccountSize(Number(e.target.value))}
              min="100"
              step="100"
            />
          </div>

          <div className="input-group">
            <label>Risk Per Trade (%)</label>
            <input
              type="number"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              min="0.1"
              max="10"
              step="0.1"
            />
          </div>

          <div className="input-group">
            <label>Entry Price ($)</label>
            <input
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(Number(e.target.value))}
              step="0.01"
            />
          </div>

          <div className="input-group">
            <label>Stop Loss ($)</label>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(Number(e.target.value))}
              step="0.01"
            />
          </div>

          <div className="input-group">
            <label>Take Profit ($)</label>
            <input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(Number(e.target.value))}
              step="0.01"
            />
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="calculator-results">
          <h3>CALCULATION RESULTS</h3>

          <div className="result-item">
            <label>Risk Amount</label>
            <div className="result-value danger">
              ${results.riskAmount?.toFixed(2)}
            </div>
          </div>

          <div className="result-item">
            <label>Position Size</label>
            <div className="result-value info">
              {results.positionSize?.toFixed(4)} BTC
            </div>
          </div>

          <div className="result-item">
            <label>Potential Profit</label>
            <div className="result-value success">
              ${results.potentialProfit?.toFixed(2)}
            </div>
          </div>

          <div className="result-item highlight">
            <label>Risk/Reward Ratio</label>
            <div className="result-value">
              1:{results.riskRewardRatio?.toFixed(2)}
            </div>
          </div>

          <div className="calculator-actions">
            <button className="btn-calculate" onClick={calculateResults}>
              Calculate
            </button>
            <button className="btn-reset" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Trading Scenarios Table */}
      <div className="trading-scenarios">
        <h3>TRADING SCENARIOS</h3>

        <table className="scenarios-table">
          <thead>
            <tr>
              <th>Risk %</th>
              <th>Position</th>
              <th>Risk $</th>
              <th>Profit $</th>
              <th>R:R</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario, index) => (
              <tr key={index}>
                <td>{scenario.riskPercent}%</td>
                <td>{scenario.positionSize.toFixed(4)}</td>
                <td className="danger">${scenario.riskAmount.toFixed(0)}</td>
                <td className="success">${scenario.potentialProfit.toFixed(2)}</td>
                <td>1:{scenario.riskReward.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskCalculatorContent;
