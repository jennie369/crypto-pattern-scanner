import React, { useState, useEffect } from 'react';
import { TPSLCalculator } from '../../utils/tpslCalculator';
import './TPSLInput.css';

const TPSLInput = ({
  entryPrice,
  currentPrice,
  quantity,
  side = 'buy',
  onTPChange,
  onSLChange,
  initialTP = null,
  initialSL = null
}) => {

  // Toggle modes: 'amount' or 'percentage'
  const [tpMode, setTPMode] = useState('amount');
  const [slMode, setSLMode] = useState('amount');

  // Amount mode: Input is target profit/loss AMOUNT in USDT
  const [tpAmount, setTPAmount] = useState('');
  const [slAmount, setSLAmount] = useState('');

  // Percentage mode: Input is percentage
  const [tpPercentageInput, setTPPercentageInput] = useState('');
  const [slPercentageInput, setSLPercentageInput] = useState('');

  // Calculated values
  const [tpPrice, setTPPrice] = useState(null);
  const [tpPercentage, setTPPercentage] = useState(null);
  const [tpPnL, setTPPnL] = useState(null);

  const [slPrice, setSLPrice] = useState(null);
  const [slPercentage, setSLPercentage] = useState(null);
  const [slPnL, setSLPnL] = useState(null);

  const [riskReward, setRiskReward] = useState(null);
  const [currentPnL, setCurrentPnL] = useState(null);

  // Calculate current PnL
  useEffect(() => {
    if (entryPrice && currentPrice && quantity) {
      const pnl = TPSLCalculator.calculateCurrentPnL(
        entryPrice,
        currentPrice,
        quantity,
        side
      );
      setCurrentPnL(pnl);
    }
  }, [entryPrice, currentPrice, quantity, side]);

  // Initialize with existing TP/SL (calculate amount from price)
  useEffect(() => {
    if (initialTP && entryPrice && quantity) {
      const pnl = TPSLCalculator.calculateTPPnL(entryPrice, initialTP, quantity, side);
      setTPAmount(pnl?.toFixed(2) || '');
    }

    if (initialSL && entryPrice && quantity) {
      const pnl = TPSLCalculator.calculateSLPnL(entryPrice, initialSL, quantity, side);
      setSLAmount(pnl?.toFixed(2) || '');
    }
  }, [initialTP, initialSL, entryPrice, quantity, side]);

  // Calculate TP from amount mode
  useEffect(() => {
    if (!entryPrice || !quantity || tpMode !== 'amount' || !tpAmount) {
      if (tpMode === 'amount') {
        setTPPrice(null);
        setTPPercentage(null);
        setTPPnL(null);
      }
      return;
    }

    const targetProfit = parseFloat(tpAmount);
    if (!targetProfit || targetProfit <= 0) {
      setTPPrice(null);
      setTPPercentage(null);
      setTPPnL(null);
      return;
    }

    // Formula: TP Price = Entry Price + (Target Profit / Quantity)
    const calculatedPrice = entryPrice + (targetProfit / quantity);
    setTPPrice(calculatedPrice);

    // Calculate percentage
    const pct = ((calculatedPrice - entryPrice) / entryPrice) * 100;
    setTPPercentage(pct);
    setTPPnL(targetProfit);

    if (onTPChange) {
      onTPChange({
        price: calculatedPrice,
        percentage: pct,
        pnl: targetProfit
      });
    }
  }, [tpAmount, tpMode, entryPrice, quantity, side, onTPChange]);

  // Calculate TP from percentage mode
  useEffect(() => {
    if (!entryPrice || !quantity || tpMode !== 'percentage' || !tpPercentageInput) {
      if (tpMode === 'percentage') {
        setTPPrice(null);
        setTPPercentage(null);
        setTPPnL(null);
      }
      return;
    }

    const pct = parseFloat(tpPercentageInput);
    if (!pct || pct <= 0) {
      setTPPrice(null);
      setTPPercentage(null);
      setTPPnL(null);
      return;
    }

    // Calculate price from percentage
    const calculatedPrice = entryPrice * (1 + pct / 100);
    setTPPrice(calculatedPrice);
    setTPPercentage(pct);

    // Calculate profit amount
    const profit = (calculatedPrice - entryPrice) * quantity;
    setTPPnL(profit);

    if (onTPChange) {
      onTPChange({
        price: calculatedPrice,
        percentage: pct,
        pnl: profit
      });
    }
  }, [tpPercentageInput, tpMode, entryPrice, quantity, side, onTPChange]);

  // Calculate SL from amount mode
  useEffect(() => {
    if (!entryPrice || !quantity || slMode !== 'amount' || !slAmount) {
      if (slMode === 'amount') {
        setSLPrice(null);
        setSLPercentage(null);
        setSLPnL(null);
      }
      return;
    }

    let targetLoss = parseFloat(slAmount);

    // Auto-add minus sign if user enters positive number
    if (targetLoss > 0) {
      targetLoss = -targetLoss;
      setSLAmount(targetLoss.toString());
    }

    if (!targetLoss || targetLoss >= 0) {
      setSLPrice(null);
      setSLPercentage(null);
      setSLPnL(null);
      return;
    }

    // Formula: SL Price = Entry Price + (Target Loss / Quantity)
    const calculatedPrice = entryPrice + (targetLoss / quantity);
    setSLPrice(calculatedPrice);

    // Calculate percentage
    const pct = ((calculatedPrice - entryPrice) / entryPrice) * 100;
    setSLPercentage(pct);
    setSLPnL(targetLoss);

    if (onSLChange) {
      onSLChange({
        price: calculatedPrice,
        percentage: pct,
        pnl: targetLoss
      });
    }
  }, [slAmount, slMode, entryPrice, quantity, side, onSLChange]);

  // Calculate SL from percentage mode
  useEffect(() => {
    if (!entryPrice || !quantity || slMode !== 'percentage' || !slPercentageInput) {
      if (slMode === 'percentage') {
        setSLPrice(null);
        setSLPercentage(null);
        setSLPnL(null);
      }
      return;
    }

    let pct = parseFloat(slPercentageInput);

    // Auto-add minus sign if user enters positive number
    if (pct > 0) {
      pct = -pct;
      setSLPercentageInput(pct.toString());
    }

    if (!pct || pct >= 0) {
      setSLPrice(null);
      setSLPercentage(null);
      setSLPnL(null);
      return;
    }

    // Calculate price from percentage
    const calculatedPrice = entryPrice * (1 + pct / 100);
    setSLPrice(calculatedPrice);
    setSLPercentage(pct);

    // Calculate loss amount
    const loss = (calculatedPrice - entryPrice) * quantity;
    setSLPnL(loss);

    if (onSLChange) {
      onSLChange({
        price: calculatedPrice,
        percentage: pct,
        pnl: loss
      });
    }
  }, [slPercentageInput, slMode, entryPrice, quantity, side, onSLChange]);

  // Calculate Risk:Reward from P&L
  useEffect(() => {
    if (tpPnL && slPnL && slPnL < 0) {
      const rr = Math.abs(tpPnL / slPnL);
      setRiskReward(rr);
    } else {
      setRiskReward(null);
    }
  }, [tpPnL, slPnL]);

  return (
    <div className="tpsl-input-container">

      {/* Current PnL Display */}
      {currentPnL !== null && entryPrice !== currentPrice && (
        <div className="current-pnl-display">
          <span className="label">Current P&L:</span>
          <span className={`value ${currentPnL >= 0 ? 'profit' : 'loss'}`}>
            {TPSLCalculator.formatPnL(currentPnL)} USDT
          </span>
        </div>
      )}

      {/* Take Profit */}
      <div className="tpsl-section take-profit">
        <div className="section-header">
          <label>TAKE PROFIT</label>
          <div className="mode-toggle">
            <button
              className={tpMode === 'amount' ? 'active' : ''}
              onClick={() => setTPMode('amount')}
            >
              Amount
            </button>
            <button
              className={tpMode === 'percentage' ? 'active' : ''}
              onClick={() => setTPMode('percentage')}
            >
              %
            </button>
          </div>
        </div>

        {tpMode === 'amount' ? (
          <div className="input-row profit-input">
            <span className="prefix">+$</span>
            <input
              type="number"
              placeholder="1000"
              value={tpAmount}
              onChange={(e) => setTPAmount(e.target.value)}
              step="0.01"
              min="0"
              className="amount-input"
            />
            <span className="unit">USDT</span>
          </div>
        ) : (
          <div className="input-row profit-input">
            <span className="prefix">+</span>
            <input
              type="number"
              placeholder="5.00"
              value={tpPercentageInput}
              onChange={(e) => setTPPercentageInput(e.target.value)}
              step="0.01"
              min="0"
              className="amount-input"
            />
            <span className="unit">%</span>
          </div>
        )}

        {tpPrice && tpPercentage && (
          <div className="calculated-values">
            <div className="value-row">
              <span className="label">TP Price:</span>
              <span className="value">${tpPrice.toFixed(2)}</span>
            </div>
            <div className="value-row">
              <span className="label">TP %:</span>
              <span className="value profit">
                +{tpPercentage.toFixed(2)}%
              </span>
            </div>
            {tpPnL && (
              <div className="value-row pnl">
                <span className="label">Profit when hit:</span>
                <span className="value profit">
                  +${tpPnL.toFixed(2)} USDT
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stop Loss */}
      <div className="tpsl-section stop-loss">
        <div className="section-header">
          <label>STOP LOSS</label>
          <div className="mode-toggle">
            <button
              className={slMode === 'amount' ? 'active' : ''}
              onClick={() => setSLMode('amount')}
            >
              Amount
            </button>
            <button
              className={slMode === 'percentage' ? 'active' : ''}
              onClick={() => setSLMode('percentage')}
            >
              %
            </button>
          </div>
        </div>

        {slMode === 'amount' ? (
          <div className="input-row loss-input">
            <span className="prefix">-$</span>
            <input
              type="number"
              placeholder="1000"
              value={slAmount ? Math.abs(parseFloat(slAmount)) : ''}
              onChange={(e) => setSLAmount(e.target.value ? `-${Math.abs(parseFloat(e.target.value))}` : '')}
              step="0.01"
              min="0"
              className="amount-input"
            />
            <span className="unit">USDT</span>
          </div>
        ) : (
          <div className="input-row loss-input">
            <span className="prefix">-</span>
            <input
              type="number"
              placeholder="5.00"
              value={slPercentageInput ? Math.abs(parseFloat(slPercentageInput)) : ''}
              onChange={(e) => setSLPercentageInput(e.target.value ? `-${Math.abs(parseFloat(e.target.value))}` : '')}
              step="0.01"
              min="0"
              className="amount-input"
            />
            <span className="unit">%</span>
          </div>
        )}

        {slPrice && slPercentage && (
          <div className="calculated-values">
            <div className="value-row">
              <span className="label">SL Price:</span>
              <span className="value">${slPrice.toFixed(2)}</span>
            </div>
            <div className="value-row">
              <span className="label">SL %:</span>
              <span className="value loss">
                {slPercentage.toFixed(2)}%
              </span>
            </div>
            {slPnL && (
              <div className="value-row pnl">
                <span className="label">Loss when hit:</span>
                <span className="value loss">
                  {slPnL.toFixed(2)} USDT
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Risk:Reward Ratio */}
      {riskReward !== null && (
        <div className="risk-reward-display">
          <span className="label">Risk:Reward</span>
          <span className="value">
            1:{riskReward.toFixed(2)}
          </span>
        </div>
      )}

    </div>
  );
};

export default TPSLInput;
