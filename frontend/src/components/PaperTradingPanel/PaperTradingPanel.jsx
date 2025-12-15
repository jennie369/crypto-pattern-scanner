/**
 * Paper Trading Side Peek Panel
 * Professional resizable trading interface
 * Allows users to trade while viewing charts
 * ULTRA COMPACT ORDER TABS - 28px height
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, GripVertical, TrendingUp, TrendingDown, Zap, Target, Shield, Info, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomSelect from '../CustomSelect/CustomSelect';
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
import './PaperTradingPanel.css';

/**
 * PaperTradingPanel Component
 *
 * Props:
 * - isOpen: boolean - Panel visibility state
 * - onClose: function - Callback to close panel
 * - symbol: string - Trading pair (e.g., 'BTCUSDT')
 * - prefilledSide: 'buy' | 'sell' - Optional prefilled trade side
 */
const PaperTradingPanel = ({ isOpen, onClose, symbol, prefilledSide = null }) => {
  const { user, isAdmin } = useAuth();
  const panelRef = useRef(null);

  // Panel resize state
  const [panelWidth, setPanelWidth] = useState(550);
  const [isResizing, setIsResizing] = useState(false);

  // Trading state
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [side, setSide] = useState(prefilledSide || 'buy');
  const [orderType, setOrderType] = useState('market'); // 'market' | 'limit' | 'stop-limit'
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [useStopLoss, setUseStopLoss] = useState(false);
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [useTakeProfit, setUseTakeProfit] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [reduceOnly, setReduceOnly] = useState(false);
  const [timeInForce, setTimeInForce] = useState('GTC'); // 'GTC' | 'IOC' | 'FOK'

  // Symbol normalization
  const [normalizedSymbol, setNormalizedSymbol] = useState(null);

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

  // Constants
  const MIN_WIDTH = 320;
  const MAX_WIDTH = 600;

  // 🛡️ Helper: Render price safely (bypass browser extension detection)
  // Splits price into individual characters to prevent privacy extensions from hiding it
  // Uses INLINE STYLES + RENDERING LAYER FORCING to bypass CSS conflicts
  const renderPriceSafely = (price) => {
    if (!price) return null;

    // Format with proper decimal places
    const formatted = typeof price === 'number'
      ? price.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      : String(price);

    // Split into individual characters with FORCED inline styles + rendering optimizations
    return formatted.split('').map((char, index) => (
      <span
        key={index}
        style={{
          display: 'inline-block',
          fontSize: '32px',
          fontWeight: '800',
          color: '#06B6D4',
          lineHeight: '1.2',
          fontFamily: 'inherit',
          opacity: 1,
          visibility: 'visible',
          width: 'auto',
          height: 'auto',
          minWidth: 'fit-content',
          minHeight: 'auto',
          transform: 'translateZ(0)',
          WebkitFontSmoothing: 'antialiased',
          backfaceVisibility: 'visible',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 999999
        }}
      >
        {char}
      </span>
    ));
  };

  // Normalize symbol (BTC -> BTCUSDT, BTCUSDT/USDT -> BTCUSDT, etc.)
  const normalizeSymbol = (sym) => {
    if (!sym) {
      console.log('❌ [Paper Trading Panel] No symbol provided');
      return null;
    }

    // Convert to uppercase and trim
    let cleaned = sym.toUpperCase().trim();

    console.log('🔵 [Paper Trading Panel] Raw symbol:', sym);
    console.log('🔵 [Paper Trading Panel] Uppercased:', cleaned);

    // Remove common separators and USDT suffix patterns
    cleaned = cleaned
      .replace('/USDT', '')   // Remove /USDT (e.g., BTCUSDT/USDT → BTCUSDT)
      .replace('-USDT', '')   // Remove -USDT
      .replace('_USDT', '')   // Remove _USDT
      .replace(' USDT', '')   // Remove space USDT
      .replace('/USD', '')    // Remove /USD
      .replace('-USD', '')    // Remove -USD
      .replace(':', '');      // Remove colon separator

    console.log('🔧 [Paper Trading Panel] After cleanup:', cleaned);

    // If already ends with USDT, return as is
    if (cleaned.endsWith('USDT')) {
      console.log('✅ [Paper Trading Panel] Already ends with USDT:', cleaned);
      return cleaned;
    }

    // Append USDT (e.g., BTC → BTCUSDT)
    const normalized = `${cleaned}USDT`;
    console.log('✅ [Paper Trading Panel] Normalized:', sym, '→', normalized);

    return normalized;
  };

  // Normalize symbol when it changes
  useEffect(() => {
    if (symbol && isOpen) {
      console.log('🔵 ========================================');
      console.log('🔵 [Paper Trading Panel] PANEL OPENED');
      console.log('🔵 Raw symbol received:', symbol);
      console.log('🔵 User:', user?.email || 'Not logged in');
      console.log('🔵 ========================================');

      const normalized = normalizeSymbol(symbol);
      setNormalizedSymbol(normalized);
    } else {
      setNormalizedSymbol(null);
    }
  }, [symbol, isOpen, user]);

  // Load account data
  useEffect(() => {
    if (user && isOpen) {
      loadAccountData();
      loadUserTier();
      loadTradeLimit();
    }
  }, [user, isOpen]);

  // Subscribe to real-time price + fallback to REST API
  useEffect(() => {
    if (!normalizedSymbol || !isOpen) {
      console.log('🔵 [Paper Trading Panel] Skipping price fetch - normalizedSymbol:', normalizedSymbol, 'isOpen:', isOpen);
      return;
    }

    console.log('🔵 [Paper Trading Panel] Starting price fetch for:', normalizedSymbol);
    setPriceLoading(true);
    setError(null);

    let priceReceived = false;

    // Try WebSocket first
    const unsubscribe = binanceWS.subscribe(normalizedSymbol, (update) => {
      console.log('📡 [Paper Trading Panel] WebSocket update:', update);

      if (update.error) {
        console.error('❌ [Paper Trading Panel] WebSocket error:', update.error);
        setError('Unable to connect to price stream');
        setPriceLoading(false);
        return;
      }

      if (update.price && update.price > 0) {
        console.log('✅ [Paper Trading Panel] Price received from WebSocket:', update.price);
        setCurrentPrice(update.price);
        setPriceLoading(false);
        priceReceived = true;
      }
    });

    // Fallback: Fetch from REST API if WebSocket doesn't respond in 3 seconds
    const fallbackTimer = setTimeout(async () => {
      if (!priceReceived) {
        console.log('⚠️ [Paper Trading Panel] WebSocket timeout - fetching from REST API...');

        try {
          // Use Futures API (fapi.binance.com) to avoid CORS issues
          // Futures API has better CORS support than spot API (api.binance.com)
          const response = await fetch(
            `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${normalizedSymbol}`
          );

          if (!response.ok) {
            // Fallback to spot API if futures fails (for non-futures symbols)
            console.log('⚠️ [Paper Trading Panel] Futures API failed, trying spot API...');
            const spotResponse = await fetch(
              `https://api.binance.com/api/v3/ticker/price?symbol=${normalizedSymbol}`
            );
            if (!spotResponse.ok) {
              throw new Error(`HTTP ${spotResponse.status}: ${spotResponse.statusText}`);
            }
            const spotData = await spotResponse.json();
            const spotPrice = parseFloat(spotData.price);
            if (spotPrice && spotPrice > 0) {
              console.log('✅ [Paper Trading Panel] Price fetched from Spot API:', spotPrice);
              setCurrentPrice(spotPrice);
              setPriceLoading(false);
              priceReceived = true;
            } else {
              throw new Error('Invalid price data from spot API');
            }
            return;
          }

          const data = await response.json();
          const price = parseFloat(data.price);

          if (price && price > 0) {
            console.log('✅ [Paper Trading Panel] Price fetched from Futures REST API:', price);
            setCurrentPrice(price);
            setPriceLoading(false);
            priceReceived = true;
          } else {
            throw new Error('Invalid price data');
          }
        } catch (err) {
          console.error('❌ [Paper Trading Panel] REST API fetch failed:', err);
          setError(`Failed to fetch price for ${normalizedSymbol}`);
          setPriceLoading(false);
        }
      }
    }, 3000);

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, [normalizedSymbol, isOpen]);

  // Load saved panel width
  useEffect(() => {
    const savedWidth = localStorage.getItem('paperTradingPanelWidth');
    if (savedWidth) {
      const width = parseInt(savedWidth);
      if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
        setPanelWidth(width);
      }
    }
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Handle resize drag
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        // Save to localStorage
        localStorage.setItem('paperTradingPanelWidth', panelWidth.toString());
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, panelWidth]);

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
    console.log('🔵 ========================================');
    console.log('🔵 [Paper Trade Panel] TRADE BUTTON CLICKED!');
    console.log('🔵 Trade details:', {
      rawSymbol: symbol,
      normalizedSymbol,
      side,
      quantity,
      currentPrice,
      totalValue: (parseFloat(quantity) * currentPrice).toFixed(2),
      userId: user?.id,
      userEmail: user?.email
    });
    console.log('🔵 ========================================');

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Validate user
      if (!user || !user.id) {
        const errorMsg = 'User not authenticated. Please login again.';
        console.error('❌ [Paper Trade Panel] User validation failed');
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      // Validate symbol
      if (!normalizedSymbol) {
        const errorMsg = 'Invalid trading symbol';
        console.error('❌ [Paper Trade Panel] Symbol validation failed');
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      // Validate quantity
      const qty = parseFloat(quantity);
      if (isNaN(qty) || qty <= 0) {
        const errorMsg = 'Invalid quantity';
        console.error('❌ [Paper Trade Panel] Quantity validation failed:', quantity);
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      // Validate price
      if (!currentPrice || currentPrice <= 0) {
        const errorMsg = 'Price not available. Please wait for price to load.';
        console.error('❌ [Paper Trade Panel] Price validation failed:', currentPrice);
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      // Validate limit price for limit/stop-limit orders
      if ((orderType === 'limit' || orderType === 'stop-limit') && (!limitPrice || parseFloat(limitPrice) <= 0)) {
        const errorMsg = 'Limit price is required for limit orders';
        console.error('❌ [Paper Trade Panel] Limit price validation failed:', limitPrice);
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      // Validate stop price for stop-limit orders
      if (orderType === 'stop-limit' && (!stopPrice || parseFloat(stopPrice) <= 0)) {
        const errorMsg = 'Stop price is required for stop-limit orders';
        console.error('❌ [Paper Trade Panel] Stop price validation failed:', stopPrice);
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      // Validate price relationships for limit orders
      if (orderType === 'limit') {
        const limit = parseFloat(limitPrice);
        if (side === 'buy' && limit > currentPrice) {
          const errorMsg = 'Limit price should be below market price for buy orders';
          console.error('❌ [Paper Trade Panel] Limit price too high for buy:', { limit, currentPrice });
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }
        if (side === 'sell' && limit < currentPrice) {
          const errorMsg = 'Limit price should be above market price for sell orders';
          console.error('❌ [Paper Trade Panel] Limit price too low for sell:', { limit, currentPrice });
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }
      }

      // Validate price relationships for stop-limit orders
      if (orderType === 'stop-limit') {
        const limit = parseFloat(limitPrice);
        const stop = parseFloat(stopPrice);

        if (side === 'buy') {
          if (stop < currentPrice) {
            const errorMsg = 'Stop price should be above market price for buy stop-limit orders';
            console.error('❌ [Paper Trade Panel] Stop price too low for buy:', { stop, currentPrice });
            setError(errorMsg);
            toast.error(errorMsg);
            setLoading(false);
            return;
          }
          if (limit > stop) {
            const errorMsg = 'Limit price should be below stop price for buy stop-limit orders';
            console.error('❌ [Paper Trade Panel] Limit > Stop for buy:', { limit, stop });
            setError(errorMsg);
            toast.error(errorMsg);
            setLoading(false);
            return;
          }
        }

        if (side === 'sell') {
          if (stop > currentPrice) {
            const errorMsg = 'Stop price should be below market price for sell stop-limit orders';
            console.error('❌ [Paper Trade Panel] Stop price too high for sell:', { stop, currentPrice });
            setError(errorMsg);
            toast.error(errorMsg);
            setLoading(false);
            return;
          }
          if (limit < stop) {
            const errorMsg = 'Limit price should be above stop price for sell stop-limit orders';
            console.error('❌ [Paper Trade Panel] Limit < Stop for sell:', { limit, stop });
            setError(errorMsg);
            toast.error(errorMsg);
            setLoading(false);
            return;
          }
        }
      }

      // Validate sufficient balance for buy orders
      if (side === 'buy' && account) {
        const orderCost = qty * currentPrice;
        const fee = orderCost * 0.001;
        const totalRequired = orderCost + fee;

        if (totalRequired > account.balance) {
          const errorMsg = `Insufficient balance. Required: $${totalRequired.toFixed(2)}, Available: $${account.balance.toFixed(2)}`;
          console.error('❌ [Paper Trade Panel] Insufficient balance:', { totalRequired, balance: account.balance });
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }
      }

      // Validate sufficient holdings for sell orders
      if (side === 'sell') {
        const holding = getCurrentHolding();
        if (!holding || holding.quantity < qty) {
          const errorMsg = `Insufficient holdings. Required: ${qty}, Available: ${holding?.quantity || 0}`;
          console.error('❌ [Paper Trade Panel] Insufficient holdings:', { required: qty, available: holding?.quantity });
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }
      }

      // Validate TP/SL price logic
      const executionPrice = orderType === 'market' ? currentPrice :
                            orderType === 'limit' ? parseFloat(limitPrice) :
                            parseFloat(stopPrice) || currentPrice;

      if (useTakeProfit && takeProfitPrice) {
        const tp = parseFloat(takeProfitPrice);
        if (side === 'buy' && tp <= executionPrice) {
          const errorMsg = `Take Profit must be higher than entry price (${executionPrice.toFixed(2)})`;
          console.error('❌ [Paper Trade Panel] Invalid TP for BUY:', { tp, executionPrice });
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }
        if (side === 'sell' && tp >= executionPrice) {
          const errorMsg = `Take Profit must be lower than entry price (${executionPrice.toFixed(2)})`;
          console.error('❌ [Paper Trade Panel] Invalid TP for SELL:', { tp, executionPrice });
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }
      }

      if (useStopLoss && stopLossPrice) {
        const sl = parseFloat(stopLossPrice);
        if (side === 'buy' && sl >= executionPrice) {
          const errorMsg = `Stop Loss must be lower than entry price (${executionPrice.toFixed(2)})`;
          console.error('❌ [Paper Trade Panel] Invalid SL for BUY:', { sl, executionPrice });
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }
        if (side === 'sell' && sl <= executionPrice) {
          const errorMsg = `Stop Loss must be higher than entry price (${executionPrice.toFixed(2)})`;
          console.error('❌ [Paper Trade Panel] Invalid SL for SELL:', { sl, executionPrice });
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }
      }

      console.log('✅ [Paper Trade Panel] All validations passed');
      console.log('🔵 [Paper Trade Panel] Calling executeBuy/executeSell...');
      console.log('🔵 [Paper Trade Panel] Order details:', {
        orderType,
        limitPrice: limitPrice ? parseFloat(limitPrice) : null,
        stopPrice: stopPrice ? parseFloat(stopPrice) : null,
        takeProfitPrice: useTakeProfit ? parseFloat(takeProfitPrice) : null,
        stopLossPrice: useStopLoss ? parseFloat(stopLossPrice) : null
      });

      let result;
      const orderOptions = {
        orderType,
        limitPrice: (orderType === 'limit' || orderType === 'stop-limit') ? parseFloat(limitPrice) : null,
        stopPrice: orderType === 'stop-limit' ? parseFloat(stopPrice) : null,
        takeProfitPrice: useTakeProfit ? parseFloat(takeProfitPrice) : null,
        stopLossPrice: useStopLoss ? parseFloat(stopLossPrice) : null,
        reduceOnly,
        timeInForce
      };

      if (side === 'buy') {
        result = await executeBuy(user.id, normalizedSymbol, qty, currentPrice, orderOptions);
      } else {
        result = await executeSell(user.id, normalizedSymbol, qty, currentPrice, orderOptions);
      }

      console.log('📋 [Paper Trade Panel] Trade result:', result);

      if (result.success) {
        const successMsg = `${side.toUpperCase()} order executed successfully!`;
        setSuccess(successMsg);
        toast.success(successMsg, { icon: '✅' });

        // Create stop orders if enabled (TIER1+ or Admin)
        const canUseStopOrders = (isAdmin && isAdmin()) || userTier !== 'FREE';

        if (useStopLoss && stopLossPrice && canUseStopOrders) {
          console.log('🔵 [Paper Trade Panel] Creating stop-loss order...');
          const stopLossResult = await createStopOrder(user.id, normalizedSymbol, 'stop_loss', parseFloat(stopLossPrice), qty);
          if (stopLossResult.success) {
            console.log('✅ [Paper Trade Panel] Stop-loss order created');
            toast.success('Stop-loss order created', { icon: '🛡️' });
          }
        }
        if (useTakeProfit && takeProfitPrice && canUseStopOrders) {
          console.log('🔵 [Paper Trade Panel] Creating take-profit order...');
          const takeProfitResult = await createStopOrder(user.id, normalizedSymbol, 'take_profit', parseFloat(takeProfitPrice), qty);
          if (takeProfitResult.success) {
            console.log('✅ [Paper Trade Panel] Take-profit order created');
            toast.success('Take-profit order created', { icon: '🎯' });
          }
        }

        // Reload data
        await loadAccountData();
        await loadTradeLimit();

        // Reset form
        setQuantity('');
        setOrderType('market');
        setLimitPrice('');
        setStopPrice('');
        setUseStopLoss(false);
        setStopLossPrice('');
        setUseTakeProfit(false);
        setTakeProfitPrice('');
        setReduceOnly(false);
        setTimeInForce('GTC');

        // Keep panel open for user to see updated balance
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        console.error('❌ [Paper Trade Panel] Trade failed:', result.error);
        setError(result.error);
        toast.error(result.error, { icon: '❌' });
      }
    } catch (err) {
      const errorMsg = err.message || 'Trade failed';
      console.error('❌ [Paper Trade Panel] Exception:', err);
      setError(errorMsg);
      toast.error(errorMsg, { icon: '⚠️' });
    } finally {
      setLoading(false);
    }
  };

  const handleStopLossToggle = () => {
    // ✅ ADMIN BYPASS - Admins have access to ALL features
    const hasAccess = (isAdmin && isAdmin()) || userTier !== 'FREE';

    if (!hasAccess) {
      setShowUpgradePrompt(true);
      return;
    }
    setUseStopLoss(!useStopLoss);
  };

  const handleTakeProfitToggle = () => {
    // ✅ ADMIN BYPASS - Admins have access to ALL features
    const hasAccess = (isAdmin && isAdmin()) || userTier !== 'FREE';

    if (!hasAccess) {
      setShowUpgradePrompt(true);
      return;
    }
    setUseTakeProfit(!useTakeProfit);
  };

  const getCurrentHolding = () => {
    return holdings.find(h => h.symbol === symbol?.toUpperCase());
  };

  const getTotalValue = () => {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || !currentPrice) return 0;
    return qty * currentPrice;
  };

  // Cost Calculation - Binance Style (0.1% taker fee)
  const costCalculation = useMemo(() => {
    const qty = parseFloat(quantity);
    const price = orderType === 'market' ? currentPrice :
                  orderType === 'limit' ? parseFloat(limitPrice) :
                  orderType === 'stop-limit' ? parseFloat(limitPrice) :
                  currentPrice;

    if (isNaN(qty) || !price || qty <= 0) {
      return { orderCost: 0, fee: 0, total: 0 };
    }

    const orderCost = qty * price;
    const fee = orderCost * 0.001; // 0.1% Binance taker fee
    const total = orderCost + fee;

    return { orderCost, fee, total };
  }, [quantity, currentPrice, orderType, limitPrice]);

  const holding = getCurrentHolding();

  // Mobile responsive width
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const finalWidth = isMobile ? '100%' : `${panelWidth}px`;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="paper-trading-panel-backdrop"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div
        ref={panelRef}
        className={`paper-trading-panel ${isResizing ? 'resizing' : ''}`}
        style={{ width: finalWidth }}
      >
        {/* Panel Content */}
        <div className="panel-content">
          {/* Header */}
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Paper Trade</h2>
              <p className="panel-subtitle">
                {normalizedSymbol ? (
                  <span style={{ color: '#06B6D4', fontWeight: '600' }}>{normalizedSymbol}</span>
                ) : (
                  <span style={{ color: '#888' }}>Loading symbol...</span>
                )}
              </p>
            </div>
            <button onClick={onClose} className="close-button">
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="panel-body">
            {/* Real-time Price Display */}
            <div className="price-card" style={{
              opacity: 1,
              visibility: 'visible',
              overflow: 'visible'
            }}>
              <div className="price-label" style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '4px',
                opacity: 1,
                visibility: 'visible',
                display: 'block'
              }}>
                Current Price
              </div>
              <div className="price-value" style={{
                opacity: 1,
                visibility: 'visible',
                display: 'block',
                marginBottom: '12px',
                position: 'relative',
                zIndex: 9999,
                transform: 'translateZ(0)',
                minHeight: '40px',
                width: '100%',
                overflow: 'visible'
              }}>
                  {!normalizedSymbol ? (
                    <span style={{ color: '#888', fontSize: '14px', opacity: 1, visibility: 'visible' }}>
                      Please select a symbol
                    </span>
                  ) : priceLoading ? (
                    <span style={{ color: '#888', fontSize: '14px', opacity: 1, visibility: 'visible' }}>
                      Loading...
                    </span>
                  ) : currentPrice ? (
                    <div
                      className="price-amount"
                      style={{
                        display: 'block',
                        fontSize: '32px',
                        fontWeight: '800',
                        color: '#06B6D4',
                        lineHeight: '1.2',
                        marginBottom: '4px',
                        opacity: 1,
                        visibility: 'visible',
                        position: 'relative',
                        zIndex: 999999,
                        transform: 'translateZ(0)',
                        WebkitFontSmoothing: 'antialiased',
                        width: '100%',
                        minHeight: '38px'
                      }}
                    >
                      <span style={{
                        display: 'inline-block',
                        fontSize: '32px',
                        fontWeight: '800',
                        color: '#06B6D4',
                        opacity: 1,
                        visibility: 'visible',
                        position: 'relative',
                        zIndex: 999999,
                        transform: 'translateZ(0)',
                        WebkitFontSmoothing: 'antialiased',
                        backfaceVisibility: 'visible'
                      }}>$</span>
                      {renderPriceSafely(currentPrice)}
                    </div>
                  ) : (
                    <span style={{ color: '#EF4444', fontSize: '14px', opacity: 1, visibility: 'visible' }}>
                      Price unavailable
                    </span>
                  )}
              </div>
              <div className="live-indicator" style={{
                fontSize: '11px',
                color: '#10b981',
                marginTop: '4px',
                opacity: 1,
                visibility: 'visible',
                display: 'flex'
              }}>
                <div className="live-dot" style={{ opacity: 1, visibility: 'visible' }} />
                <span className="live-text" style={{ opacity: 1, visibility: 'visible' }}>LIVE</span>
              </div>
            </div>

            {/* Account Info Cards */}
            {account && (
              <div className="info-grid">
                <div className="info-card">
                  <div className="info-label">Balance</div>
                  <div className="info-value">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                {holding && (
                  <div className="info-card">
                    <div className="info-label">Holdings</div>
                    <div className="info-value">{holding.quantity.toFixed(8)}</div>
                  </div>
                )}
                {tradeLimit && (
                  <div className="info-card">
                    <div className="info-label">Trades Today</div>
                    <div className={`info-value ${tradeLimit.remaining === 0 ? 'text-red-400' : ''}`}>
                      {tradeLimit.used}/{tradeLimit.limit}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Buy/Sell Toggle */}
            <div className="side-buttons">
              <button
                className={`side-button buy ${side === 'buy' ? 'active' : ''}`}
                onClick={() => setSide('buy')}
              >
                <div className="button-glow" />
                <TrendingUp size={20} className="button-icon" style={{ color: '#FFBD59' }} />
                <span className="button-text">BUY</span>
              </button>
              <button
                className={`side-button sell ${side === 'sell' ? 'active' : ''}`}
                onClick={() => setSide('sell')}
              >
                <div className="button-glow" />
                <TrendingDown size={20} className="button-icon" style={{ color: '#FFBD59' }} />
                <span className="button-text">SELL</span>
              </button>
            </div>

            {/* Order Form */}
            <div className="order-form">
              {/* Order Type Selector - INLINE STYLES FORCED! */}
              <div
                className="order-type-selector"
                style={{
                  display: 'flex',
                  gap: 0,
                  padding: '2px',
                  margin: '12px 16px 8px',
                  background: 'rgba(17, 34, 80, 0.3)',
                  borderRadius: '6px',
                  border: '1px solid rgba(0, 217, 255, 0.15)'
                }}
              >
                <button
                  className={`order-tab ${orderType === 'limit' ? 'active' : ''}`}
                  onClick={() => setOrderType('limit')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    height: '28px',
                    minHeight: '28px',
                    maxHeight: '28px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: orderType === 'limit' ? 500 : 400,
                    lineHeight: 1,
                    background: orderType === 'limit' ? 'rgba(0, 217, 255, 0.12)' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: orderType === 'limit' ? 'var(--brand-cyan)' : 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Target size={12} />
                  <span>Limit</span>
                </button>

                <button
                  className={`order-tab ${orderType === 'market' ? 'active' : ''}`}
                  onClick={() => setOrderType('market')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    height: '28px',
                    minHeight: '28px',
                    maxHeight: '28px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: orderType === 'market' ? 500 : 400,
                    lineHeight: 1,
                    background: orderType === 'market' ? 'rgba(0, 217, 255, 0.12)' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: orderType === 'market' ? 'var(--brand-cyan)' : 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Zap size={12} />
                  <span>Market</span>
                </button>

                <button
                  className={`order-tab ${orderType === 'stop-limit' ? 'active' : ''}`}
                  onClick={() => setOrderType('stop-limit')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    height: '28px',
                    minHeight: '28px',
                    maxHeight: '28px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: orderType === 'stop-limit' ? 500 : 400,
                    lineHeight: 1,
                    background: orderType === 'stop-limit' ? 'rgba(0, 217, 255, 0.12)' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: orderType === 'stop-limit' ? 'var(--brand-cyan)' : 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Shield size={12} />
                  <span>Stop Limit</span>
                </button>
              </div>

              {/* Limit Price Input (show for limit or stop-limit) */}
              {(orderType === 'limit' || orderType === 'stop-limit') && (
                <div className="input-section">
                  <label className="input-label">
                    {orderType === 'limit' ? 'Limit Price' : 'Limit Price (After Trigger)'}
                  </label>

                  <div className="input-wrapper">
                    <input
                      type="number"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder={currentPrice ? currentPrice.toFixed(2) : '0.00'}
                      step="0.01"
                      min="0"
                      className="price-input"
                    />
                    <span className="input-suffix">USDT</span>

                    {/* Quick set buttons */}
                    <div className="quick-price-buttons">
                      <button
                        onClick={() => setLimitPrice((currentPrice * 0.99).toFixed(2))}
                        className="quick-btn"
                      >
                        -1%
                      </button>
                      <button
                        onClick={() => setLimitPrice(currentPrice.toFixed(2))}
                        className="quick-btn"
                      >
                        Market
                      </button>
                      <button
                        onClick={() => setLimitPrice((currentPrice * 1.01).toFixed(2))}
                        className="quick-btn"
                      >
                        +1%
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Stop Price Input (show only for stop-limit) */}
              {orderType === 'stop-limit' && (
                <div className="input-section">
                  <label className="input-label">Stop Price (Trigger)</label>

                  <div className="input-wrapper">
                    <input
                      type="number"
                      value={stopPrice}
                      onChange={(e) => setStopPrice(e.target.value)}
                      placeholder={currentPrice ? currentPrice.toFixed(2) : '0.00'}
                      step="0.01"
                      min="0"
                      className="price-input"
                    />
                    <span className="input-suffix">USDT</span>
                  </div>

                  <div className="input-hint">
                    <Info size={14} className="hint-icon" style={{ color: '#FFBD59', flexShrink: 0 }} />
                    <span className="hint-text">
                      Order triggers when price {side === 'buy' ? 'reaches or exceeds' : 'drops to or below'} this value
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity Input with Slider & Percentage Buttons */}
              <div className="form-group">
                <label className="form-label">
                  Quantity
                  <span className="balance-info">
                    Available: {account ? `$${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '---'}
                  </span>
                </label>

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
                  step="0.00000001"
                  min="0"
                  className="form-input"
                />

                {/* Percentage Buttons - Binance Style */}
                <div className="quantity-percentage-buttons">
                  <button
                    onClick={() => {
                      if (currentPrice && account) {
                        const maxQty = account.balance / currentPrice;
                        setQuantity((maxQty * 0.25).toFixed(8));
                      }
                    }}
                    className="percentage-btn"
                    type="button"
                  >
                    25%
                  </button>
                  <button
                    onClick={() => {
                      if (currentPrice && account) {
                        const maxQty = account.balance / currentPrice;
                        setQuantity((maxQty * 0.50).toFixed(8));
                      }
                    }}
                    className="percentage-btn"
                    type="button"
                  >
                    50%
                  </button>
                  <button
                    onClick={() => {
                      if (currentPrice && account) {
                        const maxQty = account.balance / currentPrice;
                        setQuantity((maxQty * 0.75).toFixed(8));
                      }
                    }}
                    className="percentage-btn"
                    type="button"
                  >
                    75%
                  </button>
                  <button
                    onClick={() => {
                      if (currentPrice && account) {
                        const maxQty = account.balance / currentPrice;
                        setQuantity(maxQty.toFixed(8));
                      }
                    }}
                    className="percentage-btn"
                    type="button"
                  >
                    100%
                  </button>
                </div>

                {/* Cost Calculation Summary - Binance Style */}
                <div className="cost-summary">
                  <div className="cost-row">
                    <span className="cost-label">Order Cost</span>
                    <span className="cost-value">
                      ${costCalculation.orderCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="cost-row">
                    <span className="cost-label">Fee (0.1%)</span>
                    <span className="cost-value">
                      ${costCalculation.fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="cost-row cost-total">
                    <span className="cost-label">Total</span>
                    <span className="cost-value">
                      ${costCalculation.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advanced Orders Section - TP/SL with Enhanced UI */}
              <div className="advanced-orders-section">
                <label className="section-label">Advanced Orders</label>

                {/* Take Profit */}
                <div className="advanced-order-item">
                  <div className="checkbox-row">
                    <input
                      type="checkbox"
                      id="tp-checkbox"
                      checked={useTakeProfit}
                      onChange={handleTakeProfitToggle}
                      className="checkbox-input"
                    />
                    <label htmlFor="tp-checkbox" className="checkbox-label-inline">
                      <span className="checkbox-text">Take Profit</span>
                      {userTier === 'FREE' && <span className="checkbox-badge tier1">TIER1+</span>}
                    </label>
                  </div>

                  {useTakeProfit && (
                    <div className="advanced-price-input">
                      <div className="input-wrapper-enhanced">
                        <input
                          type="number"
                          value={takeProfitPrice}
                          onChange={(e) => setTakeProfitPrice(e.target.value)}
                          placeholder={currentPrice ? (currentPrice * 1.05).toFixed(2) : '0.00'}
                          step="0.01"
                          min="0"
                          className="tp-price-input"
                        />
                        <span className="input-suffix-enhanced">USDT</span>
                      </div>

                      {/* Quick TP buttons */}
                      <div className="quick-tp-buttons">
                        {[2, 5, 10, 20].map(percent => (
                          <button
                            key={percent}
                            onClick={() => {
                              const executionPrice = orderType === 'market' ? currentPrice :
                                                    parseFloat(limitPrice) || currentPrice;
                              if (executionPrice) {
                                const tpPrice = executionPrice * (1 + percent / 100);
                                setTakeProfitPrice(tpPrice.toFixed(2));
                              }
                            }}
                            className="quick-tp-btn"
                            type="button"
                          >
                            +{percent}%
                          </button>
                        ))}
                      </div>

                      {takeProfitPrice && currentPrice && quantity && (
                        <div className="tp-preview">
                          <span className="preview-label">Profit if TP hits:</span>
                          <span className="preview-value positive">
                            +${(
                              (parseFloat(takeProfitPrice) - currentPrice) *
                              parseFloat(quantity)
                            ).toFixed(2)}
                            {' '}({((parseFloat(takeProfitPrice) / currentPrice - 1) * 100).toFixed(2)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Stop Loss */}
                <div className="advanced-order-item">
                  <div className="checkbox-row">
                    <input
                      type="checkbox"
                      id="sl-checkbox"
                      checked={useStopLoss}
                      onChange={handleStopLossToggle}
                      className="checkbox-input"
                    />
                    <label htmlFor="sl-checkbox" className="checkbox-label-inline">
                      <span className="checkbox-text">Stop Loss</span>
                      {userTier === 'FREE' && <span className="checkbox-badge tier1">TIER1+</span>}
                    </label>
                  </div>

                  {useStopLoss && (
                    <div className="advanced-price-input">
                      <div className="input-wrapper-enhanced">
                        <input
                          type="number"
                          value={stopLossPrice}
                          onChange={(e) => setStopLossPrice(e.target.value)}
                          placeholder={currentPrice ? (currentPrice * 0.95).toFixed(2) : '0.00'}
                          step="0.01"
                          min="0"
                          className="sl-price-input"
                        />
                        <span className="input-suffix-enhanced">USDT</span>
                      </div>

                      {/* Quick SL buttons */}
                      <div className="quick-sl-buttons">
                        {[2, 5, 10, 20].map(percent => (
                          <button
                            key={percent}
                            onClick={() => {
                              const executionPrice = orderType === 'market' ? currentPrice :
                                                    parseFloat(limitPrice) || currentPrice;
                              if (executionPrice) {
                                const slPrice = executionPrice * (1 - percent / 100);
                                setStopLossPrice(slPrice.toFixed(2));
                              }
                            }}
                            className="quick-sl-btn"
                            type="button"
                          >
                            -{percent}%
                          </button>
                        ))}
                      </div>

                      {stopLossPrice && currentPrice && quantity && (
                        <div className="sl-preview">
                          <span className="preview-label">Loss if SL hits:</span>
                          <span className="preview-value negative">
                            ${(
                              (parseFloat(stopLossPrice) - currentPrice) *
                              parseFloat(quantity)
                            ).toFixed(2)}
                            {' '}({((parseFloat(stopLossPrice) / currentPrice - 1) * 100).toFixed(2)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Risk/Reward Ratio */}
                {useTakeProfit && useStopLoss && takeProfitPrice && stopLossPrice && currentPrice && (
                  <div className="risk-reward-display">
                    <span className="rr-label">Risk/Reward Ratio:</span>
                    <span className="rr-value">
                      1 : {(
                        Math.abs(parseFloat(takeProfitPrice) - currentPrice) /
                        Math.abs(currentPrice - parseFloat(stopLossPrice))
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Reduce-Only Option */}
              <div className="reduce-only-section">
                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    id="reduce-only"
                    checked={reduceOnly}
                    onChange={(e) => setReduceOnly(e.target.checked)}
                    className="checkbox-input"
                  />
                  <label htmlFor="reduce-only" className="checkbox-label-inline">
                    <span className="checkbox-text">Reduce-Only</span>
                    <button
                      className="info-tooltip"
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info('Order will only reduce your position, not increase it', {
                          duration: 4000,
                        });
                      }}
                      type="button"
                    >
                      <Info size={14} style={{ color: '#FFBD59' }} />
                    </button>
                  </label>
                </div>

                {reduceOnly && (
                  <div className="reduce-only-hint">
                    <AlertTriangle size={14} className="hint-icon" style={{ color: '#FFBD59', flexShrink: 0 }} />
                    <span className="hint-text">
                      This order will be rejected if it would increase your position size
                    </span>
                  </div>
                )}
              </div>

              {/* Time in Force Selector */}
              <div className="tif-section">
                <label className="section-label">
                  Time in Force
                  <button
                    className="info-tooltip"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info(
                        'GTC: Good Till Cancel\nIOC: Immediate or Cancel\nFOK: Fill or Kill',
                        { duration: 5000 }
                      );
                    }}
                    type="button"
                  >
                    <Info size={14} style={{ color: '#FFBD59' }} />
                  </button>
                </label>

                <CustomSelect
                  value={timeInForce}
                  onChange={setTimeInForce}
                  options={[
                    { value: 'GTC', label: 'GTC (Good Till Cancel)' },
                    { value: 'IOC', label: 'IOC (Immediate or Cancel)' },
                    { value: 'FOK', label: 'FOK (Fill or Kill)' }
                  ]}
                  className="tif-select"
                />

                <div className="tif-description">
                  {timeInForce === 'GTC' && (
                    <span>Order remains active until filled or manually cancelled</span>
                  )}
                  {timeInForce === 'IOC' && (
                    <span>Fill immediately, cancel any unfilled portion</span>
                  )}
                  {timeInForce === 'FOK' && (
                    <span>Fill entire order immediately or cancel completely</span>
                  )}
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {/* Execute Button - Enhanced with Spinner */}
              <button
                className={`execute-button ${side}`}
                onClick={handleTrade}
                disabled={loading || !quantity || !currentPrice || priceLoading}
                style={{ marginTop: '120px' }}
              >
                {loading ? (
                  <div className="btn-loading">
                    <span className="btn-spinner"></span>
                    <span>Executing...</span>
                  </div>
                ) : priceLoading ? (
                  <div className="btn-loading">
                    <span className="btn-spinner"></span>
                    <span>Loading price...</span>
                  </div>
                ) : (
                  <>
                    {side === 'buy' ? (
                      <TrendingUp size={16} style={{ color: '#FFBD59' }} />
                    ) : (
                      <TrendingDown size={16} style={{ color: '#FFBD59' }} />
                    )}
                    <span>{side.toUpperCase()} {normalizedSymbol || symbol || ''}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        {!isMobile && (
          <div
            className={`resize-handle ${isResizing ? 'active' : ''}`}
            onMouseDown={handleMouseDown}
          >
            <GripVertical size={16} className="resize-icon" />
          </div>
        )}
      </div>

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <div className="upgrade-overlay" onClick={() => setShowUpgradePrompt(false)}>
          <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="upgrade-title">Upgrade to Unlock Stop Orders</h3>
            <p className="upgrade-text">Stop-loss and take-profit orders require TIER1 or higher.</p>
            <div className="upgrade-benefits">
              <h4 className="benefits-title">TIER1 Benefits:</h4>
              <ul className="benefits-list">
                <li>✓ Stop-loss orders</li>
                <li>✓ Take-profit orders</li>
                <li>✓ 50 trades per day</li>
                <li>✓ Advanced order types</li>
              </ul>
            </div>
            <div className="upgrade-actions">
              <button
                className="upgrade-button-primary"
                onClick={() => { window.location.href = '/pricing'; }}
              >
                View Pricing
              </button>
              <button
                className="upgrade-button-secondary"
                onClick={() => setShowUpgradePrompt(false)}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaperTradingPanel;
