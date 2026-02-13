import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import binanceWS from '../../services/binanceWebSocket';
import {
  executeBuy,
  executeSell,
  getAccount,
  getHoldings,
  getUserTier,
  checkDailyTradeLimit,
  createStopOrder
} from '../../services/paperTrading';
import './PaperTradingModal.css';

/**
 * Paper Trading Modal Component
 * Full-featured trading interface with real-time prices
 *
 * Props:
 * - symbol: Trading pair (e.g., 'BTCUSDT')
 * - onClose: Callback to close modal
 * - prefilledSide: 'buy' | 'sell' (optional)
 */
export const PaperTradingModal = ({ symbol, onClose, prefilledSide = null }) => {
  const { user } = useAuth();

  // State
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [side, setSide] = useState(prefilledSide || 'buy');
  const [quantity, setQuantity] = useState('');
  const [useStopLoss, setUseStopLoss] = useState(false);
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [useTakeProfit, setUseTakeProfit] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState('');

  // Account & tier info
  const [account, setAccount] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [userTier, setUserTier] = useState('FREE');
  const [tradeLimit, setTradeLimit] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Load account, holdings, and tier on mount
  useEffect(() => {
    if (user) {
      loadAccountData();
      loadUserTier();
      loadTradeLimit();
    }
  }, [user]);

  // Subscribe to real-time price
  useEffect(() => {
    if (!symbol) return;

    setPriceLoading(true);

    const unsubscribe = binanceWS.subscribe(symbol, (update) => {
      if (update.error) {
        setError('Unable to connect to price stream');
        setPriceLoading(false);
        return;
      }

      setCurrentPrice(update.price);
      setPriceLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [symbol]);

  const loadAccountData = async () => {
    const { account: acc } = await getAccount(user.id);
    setAccount(acc);

    const holdingsData = await getHoldings(user.id);
    setHoldings(holdingsData);
  };

  const loadUserTier = async () => {
    const { tier } = await getUserTier(user.id);
    setUserTier(tier);
  };

  const loadTradeLimit = async () => {
    const limit = await checkDailyTradeLimit(user.id);
    setTradeLimit(limit);
  };

  const handleTrade = async () => {
    console.log('🔵 [Paper Trade Modal] Starting trade execution...', {
      symbol,
      side,
      quantity,
      currentPrice,
      useStopLoss,
      useTakeProfit,
      userTier,
      userId: user?.id  // ✅ Log user ID for debugging
    });

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // ✅ CRITICAL: Validate user exists
      if (!user || !user.id) {
        const errorMsg = 'User not authenticated. Please login again.';
        console.error('❌ [Paper Trade Modal] User validation failed:', { user });
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      console.log('✅ [Paper Trade Modal] User authenticated:', user.id);

      const qty = parseFloat(quantity);
      if (isNaN(qty) || qty <= 0) {
        const errorMsg = 'Invalid quantity';
        console.error('❌ [Paper Trade Modal] Validation failed:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      if (!currentPrice) {
        const errorMsg = 'Price not available';
        console.error('❌ [Paper Trade Modal] Price check failed:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      console.log('✅ [Paper Trade Modal] Validation passed, executing trade...');

      let result;
      if (side === 'buy') {
        console.log('📊 [Paper Trade Modal] Calling executeBuy...');
        result = await executeBuy(user.id, symbol, qty, currentPrice);
      } else {
        console.log('📊 [Paper Trade Modal] Calling executeSell...');
        result = await executeSell(user.id, symbol, qty, currentPrice);
      }

      console.log('📋 [Paper Trade Modal] Trade result:', result);

      if (result.success) {
        const successMsg = `${side.toUpperCase()} order executed successfully!`;
        console.log('✅ [Paper Trade Modal] Trade successful!', {
          order: result.order,
          newBalance: result.newBalance,
          pnl: result.pnl
        });

        setSuccess(successMsg);
        toast.success(successMsg, {
          duration: 3000,
          icon: '✅'
        });

        // Create stop orders if enabled
        if (useStopLoss && stopLossPrice && userTier !== 'FREE') {
          console.log('📍 [Paper Trade Modal] Creating stop-loss order...');
          const stopLossResult = await createStopOrder(user.id, symbol, 'stop_loss', parseFloat(stopLossPrice), qty);
          if (stopLossResult.success) {
            console.log('✅ [Paper Trade Modal] Stop-loss created');
            toast.success('Stop-loss order created', { icon: '🛡️' });
          }
        }
        if (useTakeProfit && takeProfitPrice && userTier !== 'FREE') {
          console.log('📍 [Paper Trade Modal] Creating take-profit order...');
          const takeProfitResult = await createStopOrder(user.id, symbol, 'take_profit', parseFloat(takeProfitPrice), qty);
          if (takeProfitResult.success) {
            console.log('✅ [Paper Trade Modal] Take-profit created');
            toast.success('Take-profit order created', { icon: '🎯' });
          }
        }

        // Reload data
        console.log('🔄 [Paper Trade Modal] Reloading account data...');
        await loadAccountData();
        await loadTradeLimit();
        console.log('✅ [Paper Trade Modal] Account data reloaded');

        // Reset form
        setQuantity('');
        setUseStopLoss(false);
        setStopLossPrice('');
        setUseTakeProfit(false);
        setTakeProfitPrice('');

        // Auto-close after 2 seconds
        setTimeout(() => {
          console.log('🚪 [Paper Trade Modal] Closing modal...');
          onClose();
        }, 2000);
      } else {
        console.error('❌ [Paper Trade Modal] Trade failed:', result.error);
        setError(result.error);
        toast.error(result.error, {
          duration: 5000,
          icon: '❌'
        });
      }
    } catch (err) {
      const errorMsg = err.message || 'Trade failed';
      console.error('❌ [Paper Trade Modal] Exception caught:', err);
      setError(errorMsg);
      toast.error(errorMsg, {
        duration: 5000,
        icon: '⚠️'
      });
    } finally {
      setLoading(false);
      console.log('🏁 [Paper Trade Modal] Trade execution completed');
    }
  };

  const handleStopLossToggle = () => {
    if (userTier === 'FREE') {
      setShowUpgradePrompt(true);
      return;
    }
    setUseStopLoss(!useStopLoss);
  };

  const handleTakeProfitToggle = () => {
    if (userTier === 'FREE') {
      setShowUpgradePrompt(true);
      return;
    }
    setUseTakeProfit(!useTakeProfit);
  };

  const getCurrentHolding = () => {
    return holdings.find(h => h.symbol === symbol.toUpperCase());
  };

  const getTotalValue = () => {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || !currentPrice) return 0;
    return qty * currentPrice;
  };

  const holding = getCurrentHolding();

  return (
    <div className="paper-trading-modal-overlay" onClick={onClose}>
      <div className="paper-trading-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Paper Trade: {symbol}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Real-time Price */}
        <div className="price-display">
          <div className="price-label">Current Price</div>
          <div className="price-value">
            {priceLoading ? (
              <span className="loading">Loading...</span>
            ) : (
              <span className={currentPrice ? 'pulse' : ''}>
                ${currentPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
              </span>
            )}
          </div>
          <div className="live-indicator">
            <span className="dot"></span> LIVE
          </div>
        </div>

        {/* Account Info */}
        {account && (
          <div className="account-info">
            <div className="info-item">
              <span>Balance:</span>
              <strong>${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            {holding && (
              <div className="info-item">
                <span>Holdings:</span>
                <strong>{holding.quantity.toFixed(8)} {symbol}</strong>
              </div>
            )}
            {tradeLimit && (
              <div className="info-item">
                <span>Trades Today:</span>
                <strong className={tradeLimit.remaining === 0 ? 'text-danger' : ''}>
                  {tradeLimit.used}/{tradeLimit.limit}
                </strong>
              </div>
            )}
          </div>
        )}

        {/* Side Toggle */}
        <div className="side-toggle">
          <button
            className={`side-btn ${side === 'buy' ? 'active buy' : ''}`}
            onClick={() => setSide('buy')}
          >
            BUY
          </button>
          <button
            className={`side-btn ${side === 'sell' ? 'active sell' : ''}`}
            onClick={() => setSide('sell')}
          >
            SELL
          </button>
        </div>

        {/* Order Form */}
        <div className="order-form">
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              step="0.00000001"
              min="0"
            />
            <div className="form-hint">
              Total: ${getTotalValue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Stop Loss (TIER1+) */}
          <div className="form-group-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useStopLoss}
                onChange={handleStopLossToggle}
              />
              <span>Stop Loss</span>
              {userTier === 'FREE' && <span className="tier-badge">TIER1+</span>}
            </label>
            {useStopLoss && (
              <input
                type="number"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
                placeholder="Stop loss price"
                step="0.01"
                min="0"
              />
            )}
          </div>

          {/* Take Profit (TIER1+) */}
          <div className="form-group-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useTakeProfit}
                onChange={handleTakeProfitToggle}
              />
              <span>Take Profit</span>
              {userTier === 'FREE' && <span className="tier-badge">TIER1+</span>}
            </label>
            {useTakeProfit && (
              <input
                type="number"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(e.target.value)}
                placeholder="Take profit price"
                step="0.01"
                min="0"
              />
            )}
          </div>

          {/* Error/Success Messages */}
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Submit Button */}
          <button
            className={`trade-btn ${side}`}
            onClick={handleTrade}
            disabled={loading || !quantity || !currentPrice}
          >
            {loading ? 'Processing...' : `${side.toUpperCase()} ${symbol}`}
          </button>
        </div>

        {/* Upgrade Prompt Modal */}
        {showUpgradePrompt && (
          <div className="upgrade-prompt-overlay" onClick={() => setShowUpgradePrompt(false)}>
            <div className="upgrade-prompt" onClick={(e) => e.stopPropagation()}>
              <h3>Upgrade to Unlock Stop Orders</h3>
              <p>Stop-loss and take-profit orders require TIER1 or higher.</p>
              <div className="upgrade-benefits">
                <h4>TIER1 Benefits:</h4>
                <ul>
                  <li>✓ Stop-loss orders</li>
                  <li>✓ Take-profit orders</li>
                  <li>✓ 50 trades per day</li>
                  <li>✓ Advanced order types</li>
                </ul>
              </div>
              <div className="upgrade-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    window.location.href = '/pricing';
                  }}
                >
                  View Pricing
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowUpgradePrompt(false)}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperTradingModal;
