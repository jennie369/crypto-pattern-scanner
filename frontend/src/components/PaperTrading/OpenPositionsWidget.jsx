import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getHoldings, closePosition } from '../../services/paperTrading';
import binanceWS from '../../services/binanceWebSocket';
import toast from 'react-hot-toast';
import './OpenPositionsWidget.css';

export const OpenPositionsWidget = ({ onOpenPaperTrading }) => {
  const { user } = useAuth();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState({});
  const unsubscribeFnsRef = useRef([]);
  const mountedRef = useRef(true);

  const subscribeToPriceUpdates = useCallback((symbol) => {
    try {
      const unsubscribe = binanceWS.subscribe(symbol, (update) => {
        if (update.price && mountedRef.current) {
          setPrices(prev => ({
            ...prev,
            [symbol]: update.price
          }));
        }
      });

      unsubscribeFnsRef.current.push(unsubscribe);
    } catch (error) {
      console.error('[OpenPositionsWidget] Subscribe error:', error);
    }
  }, []);

  const loadPositions = useCallback(async () => {
    if (!user?.id || !mountedRef.current) return;

    setLoading(true);
    try {
      const holdings = await getHoldings(user.id);

      if (!mountedRef.current) return;

      setPositions(holdings || []);

      if (holdings && holdings.length > 0) {
        holdings.forEach(holding => {
          if (holding.symbol) {
            subscribeToPriceUpdates(holding.symbol);
          }
        });
      }
    } catch (error) {
      console.error('[OpenPositionsWidget] Load error:', error);
      if (mountedRef.current) {
        toast.error('Failed to load positions');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id, subscribeToPriceUpdates]);

  useEffect(() => {
    mountedRef.current = true;

    if (user?.id) {
      loadPositions();
    }

    return () => {
      mountedRef.current = false;

      unsubscribeFnsRef.current.forEach(unsub => {
        try {
          if (typeof unsub === 'function') {
            unsub();
          }
        } catch (err) {
          // Ignore cleanup errors
        }
      });
      unsubscribeFnsRef.current = [];
    };
  }, [user?.id, loadPositions]);

  const calculatePnL = (position) => {
    const currentPrice = prices[position.symbol] || 0;
    if (!currentPrice || currentPrice <= 0) return { pnl: 0, pnlPercentage: 0 };

    const pnl = (currentPrice - position.average_price) * position.quantity;
    const pnlPercentage = ((currentPrice / position.average_price) - 1) * 100;

    return { pnl, pnlPercentage };
  };

  const handleClosePosition = async (position) => {
    if (!user || !user.id) {
      toast.error('Please login to close positions');
      return;
    }

    if (!window.confirm(`Close ${position.symbol} position?\n\nQuantity: ${position.quantity.toFixed(8)}\nEntry: $${position.average_price.toLocaleString()}\nCurrent: $${(prices[position.symbol] || 0).toLocaleString()}`)) {
      return;
    }

    try {
      await closePosition(position.id, user.id);
      toast.success(`${position.symbol} position closed successfully!`);
      loadPositions();
    } catch (error) {
      console.error('Failed to close position:', error);
      toast.error(`Failed to close position: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="open-positions-widget">
        <div className="widget-header">
          <h3>Open Positions</h3>
        </div>
        <div className="loading-state">Loading positions...</div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="open-positions-widget">
        <div className="widget-header">
          <h3>Open Positions (0)</h3>
        </div>
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <p>No open positions</p>
          <span className="empty-hint">Start paper trading to see positions here</span>
        </div>
      </div>
    );
  }

  return (
    <div className="open-positions-widget">
      <div className="widget-header">
        <h3>Open Positions ({positions.length})</h3>
        <button
          className="btn-refresh"
          onClick={loadPositions}
        >
          🔄
        </button>
      </div>

      <div className="positions-list">
        {positions.map(position => {
          const { pnl, pnlPercentage } = calculatePnL(position);
          const currentPrice = prices[position.symbol] || 0;

          return (
            <div key={position.id} className="position-card">
              <div className="position-header">
                <span className="position-symbol">{position.symbol}</span>
                <span className={`position-pnl ${pnl >= 0 ? 'profit' : 'loss'}`}>
                  {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USDT
                </span>
              </div>

              <div className="position-details">
                <div className="detail-row">
                  <span className="detail-label">Quantity</span>
                  <span className="detail-value">{position.quantity.toFixed(8)}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Entry</span>
                  <span className="detail-value">${position.average_price.toLocaleString()}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Current</span>
                  <span className="detail-value">
                    {currentPrice > 0 ? `$${currentPrice.toLocaleString()}` : 'Loading...'}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">P&L %</span>
                  <span className={`detail-value ${pnlPercentage >= 0 ? 'profit' : 'loss'}`}>
                    {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="position-actions">
                <button
                  className="btn-close-position"
                  onClick={() => handleClosePosition(position)}
                >
                  Close Position
                </button>
                <button
                  className="btn-manage"
                  onClick={() => onOpenPaperTrading && onOpenPaperTrading(position.symbol)}
                >
                  Manage
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OpenPositionsWidget;
