/**
 * Gemral - Open Positions Screen
 * View and manage paper trade positions
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  DeviceEventEmitter,
} from 'react-native';
import CustomAlert from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  X,
  DollarSign,
  Target,
  Clock,
  Wallet,
  BarChart2,
  RefreshCw,
  History,
  Gem,
  Brain,
  AlertTriangle,
  Edit2,
  Check,
  XCircle,
  HelpCircle,
  Percent,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import paperTradeService from '../../services/paperTradeService';
import { supabase } from '../../services/supabase';
import { getPendingOrders as fetchPendingOrders, cancelPendingOrder, checkAndTriggerOrders as checkPendingOrderTriggers } from '../../services/pendingOrderService';
import { binanceService } from '../../services/binanceService';
// notificationService import removed — push notifications are now sent solely by
// paperTradeService → paperTradeNotificationService (single notification source)
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';
import { formatPrice, formatCurrency } from '../../utils/formatters';
import SponsorBannerSection from '../../components/SponsorBannerSection';
import { PendingOrdersSection } from '../../components/Trading';

export default function OpenPositionsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  // Get highlighted position from navigation params
  const highlightPositionId = route.params?.highlightPositionId;

  const [positions, setPositions] = useState([]);
  const [highlightedId, setHighlightedId] = useState(highlightPositionId);
  const flatListRef = useRef(null);
  const [pendingOrders, setPendingOrders] = useState([]);  // NEW: Pending limit orders
  const [cancellingOrderId, setCancellingOrderId] = useState(null);  // NEW: For cancel loading state
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [closingId, setClosingId] = useState(null);

  // Edit SL/TP state
  const [editingPosition, setEditingPosition] = useState(null); // position id being edited
  const [editSL, setEditSL] = useState('');
  const [editTP, setEditTP] = useState('');
  const [editLeverage, setEditLeverage] = useState('');
  const [editMargin, setEditMargin] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // PNL Tooltip state
  const [showPnLTooltip, setShowPnLTooltip] = useState(null); // position id showing tooltip

  // Real-time price subscriptions ref
  const wsUnsubscribesRef = useRef([]);
  const pricesRef = useRef({}); // Store latest prices for all symbols
  const pendingOrdersRef = useRef([]); // [PendingOrders] Ref to track pending orders from pendingOrderService (paper_pending_orders table)
  const lastPendingCheckRef = useRef(0); // [PendingOrders] Throttle: last time we checked pending orders (ms)
  const PENDING_CHECK_INTERVAL_MS = 3000; // [PendingOrders] Only check pending order fills every 3 seconds

  // Custom Alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [{ text: 'OK' }],
    type: 'default',
  });

  // Custom alert function to replace Alert.alert()
  const showAlert = (title, message, buttons = [{ text: 'OK' }], type = 'default') => {
    setAlertConfig({ visible: true, title, message, buttons, type });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  // Cleanup WebSocket subscriptions
  const cleanupSubscriptions = useCallback(() => {
    wsUnsubscribesRef.current.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') unsubscribe();
    });
    wsUnsubscribesRef.current = [];
  }, []);

  // Setup WebSocket subscriptions for all position symbols
  const setupPriceSubscriptions = useCallback((currentPositions, currentPending) => {
    // Cleanup existing subscriptions first
    cleanupSubscriptions();

    // Collect all unique symbols
    const allSymbols = [
      ...currentPositions.map((p) => p.symbol),
      ...currentPending.map((p) => p.symbol),
    ];
    const symbols = [...new Set(allSymbols)];

    if (symbols.length === 0) return;

    console.log('[OpenPositions] Setting up WebSocket for symbols:', symbols);

    // Subscribe to each symbol
    symbols.forEach(symbol => {
      const unsubscribe = binanceService.subscribe(symbol, (priceData) => {
        if (priceData && priceData.price) {
          pricesRef.current[symbol] = priceData.price;
          // Update positions with new price
          handlePriceUpdate(symbol, priceData.price);
        }
      });
      wsUnsubscribesRef.current.push(unsubscribe);
    });
  }, [cleanupSubscriptions]);

  // [PendingOrders] Reload pending orders from pendingOrderService (paper_pending_orders table)
  // This is the SINGLE SOURCE OF TRUTH for pending orders
  const reloadPendingOrdersFromDB = useCallback(async () => {
    if (!user?.id) return [];
    try {
      const { data: pendingData, error: pendingError } = await fetchPendingOrders(user?.id);
      if (pendingError) {
        console.warn('[PendingOrders] reloadPendingOrdersFromDB error:', pendingError);
        return pendingOrdersRef.current; // keep existing on error
      }
      const mapped = (pendingData || []).map(order => ({
        ...order,
        entryPrice: order.limit_price || order.stop_price || 0,
        positionSize: order.initial_margin || order.position_size || 0,
        margin: order.initial_margin || 0,
        pendingAt: order.created_at,
      }));
      console.log('[PendingOrders] Reloaded from DB:', mapped.length, 'orders');
      pendingOrdersRef.current = mapped;
      return mapped;
    } catch (err) {
      console.warn('[PendingOrders] reloadPendingOrdersFromDB exception:', err);
      return pendingOrdersRef.current;
    }
  }, [user?.id]);

  // Handle real-time price update for a single symbol
  const handlePriceUpdate = useCallback(async (symbol, price) => {
    try {
      // Update all prices from ref
      const prices = { ...pricesRef.current, [symbol]: price };

      // [PendingOrders] FIX: Check pending orders via pendingOrderService (paper_pending_orders table)
      // NOT via paperTradeService.checkPendingOrders() which reads from paper_trades table
      // Throttled to avoid excessive Supabase queries on every WebSocket tick
      let pendingFillOccurred = false;
      const now = Date.now();
      const shouldCheckPending = (now - lastPendingCheckRef.current) >= PENDING_CHECK_INTERVAL_MS
        && pendingOrdersRef.current.length > 0;

      if (shouldCheckPending) {
        lastPendingCheckRef.current = now;
        try {
          const pricesForCheck = {};
          for (const [sym, p] of Object.entries(prices)) {
            pricesForCheck[sym] = { last: p, mark: p };
          }
          const triggerResult = await checkPendingOrderTriggers(pricesForCheck, user?.id);
          if (triggerResult.executed > 0) {
            pendingFillOccurred = true;
            console.log('[PendingOrders] Orders filled via pendingOrderService:', triggerResult.executed);
          }
        } catch (triggerErr) {
          console.log('[PendingOrders] checkPendingOrderTriggers error:', triggerErr);
        }

        // Also check paperTradeService pending orders (paper_trades table, status=PENDING)
        // for backward compatibility with legacy orders that may exist there
        const pendingResult = await paperTradeService.checkPendingOrders(prices);
        if (pendingResult.filled.length > 0) {
          pendingFillOccurred = true;
          for (const filled of pendingResult.filled) {
            showAlert(
              'Lệnh Đã Khớp!',
              `${filled.symbol} ${filled.direction}\n` +
                `Giá vào: $${formatPrice(filled.entryPrice)}\n` +
                `Số lượng: ${formatCurrency(filled.positionSize)} USDT`,
              [{ text: 'OK' }],
              'success'
            );
            // Push notification already sent by paperTradeService.checkPendingOrders() → notifyOrderFilled()
          }
        }
      }

      // Update positions with new prices (includes SL/TP checks)
      const result = await paperTradeService.updatePrices(prices);

      // Show UI alerts for closed positions (SL/TP hit)
      // Push notifications already sent by paperTradeService.updatePrices() → notifySLHit/notifyTPHit/notifyLiquidation
      if (result.closed.length > 0) {
        for (const closed of result.closed) {
          showAlert(
            closed.result === 'WIN' ? 'Chạm Chốt lời!' : 'Chạm Cắt lỗ!',
            `${closed.symbol} ${closed.direction}\n` +
              `P/L: ${closed.realizedPnL >= 0 ? '+' : ''}$${formatCurrency(closed.realizedPnL)}`,
            [{ text: 'OK' }],
            closed.result === 'WIN' ? 'success' : 'error'
          );
        }
      }

      // Update open positions state (always safe — from paperTradeService in-memory)
      setPositions(paperTradeService.getOpenPositions(user?.id));
      setStats(paperTradeService.getStats(user?.id));

      // [PendingOrders] FIX: Only update pendingOrders state if a fill/cancel actually happened
      // Do NOT blindly overwrite with paperTradeService.getPendingOrders() which reads from wrong table
      if (pendingFillOccurred || result.closed.length > 0) {
        console.log('[PendingOrders] Fill/close occurred — refreshing pending orders from DB');
        const freshPending = await reloadPendingOrdersFromDB();
        setPendingOrders(freshPending);
      }
      // Otherwise: keep existing pendingOrders state intact (loaded from paper_pending_orders)
    } catch (error) {
      console.log('[OpenPositions] handlePriceUpdate error:', error);
    }
  }, [user?.id, reloadPendingOrdersFromDB]);

  // Load positions when userId becomes available (handles initial auth delay)
  useEffect(() => {
    if (user?.id) {
      console.log('[OpenPositions] User authenticated, loading data:', user.id);
      loadData(false); // Don't force refresh - use init() normally
    }
  }, [user?.id]);

  // Reload positions on screen focus
  useFocusEffect(
    useCallback(() => {
      if (!user?.id) {
        console.log('[OpenPositions] Waiting for user auth...');
        return;
      }
      console.log('[OpenPositions] Screen focused with user:', user?.id);
      loadData(false); // Don't force refresh - use init() normally (will load if needed)
      return () => cleanupSubscriptions();
    }, [cleanupSubscriptions, user?.id])
  );

  // Listen for FORCE_REFRESH_EVENT from health monitor / recovery system
  // CRITICAL: Reset stuck loading states and re-load positions data
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[OpenPositions] Force refresh event received - resetting all states');

      // CRITICAL: Reset stuck loading states FIRST
      setLoading(false);
      setRefreshing(false);

      // Re-load data from scratch
      loadData(true);
    });
    return () => listener.remove();
  }, [user?.id]);

  const loadData = async (forceRefresh = false) => {
    try {
      // CRITICAL: Guard against undefined user - must have valid userId to load
      if (!user?.id) {
        console.log('[OpenPositions] loadData called but user?.id is undefined - skipping');
        setLoading(false);
        return;
      }

      console.log('[OpenPositions] loadData starting with userId:', user.id, 'forceRefresh:', forceRefresh);

      // IMPORTANT: Set currentUserId BEFORE init to ensure correct userId filtering
      // This prevents init from clearing data when same user calls it
      if (paperTradeService.currentUserId !== user.id) {
        console.log('[OpenPositions] Switching user context from', paperTradeService.currentUserId, 'to', user.id);
      }

      // Use forceRefreshFromCloud only for manual refresh (pull-to-refresh)
      // For normal screen loads, use init() which has built-in data protection
      if (forceRefresh && !paperTradeService.initialized) {
        // First time load - always init
        await paperTradeService.init(user.id);
      } else if (forceRefresh) {
        // Manual refresh requested - force cloud refresh
        await paperTradeService.forceRefreshFromCloud(user.id);
      } else {
        // Normal load - just init (will skip if already initialized for same user)
        await paperTradeService.init(user.id);
      }

      // Debug: Log what service has after init
      console.log('[OpenPositions] After init - service state:', {
        historyCount: paperTradeService.tradeHistory?.length || 0,
        openCount: paperTradeService.openPositions?.length || 0,
        pendingCount: paperTradeService.pendingOrders?.length || 0,
        currentUserId: paperTradeService.currentUserId,
        initialized: paperTradeService.initialized,
      });

      const openPositions = paperTradeService.getOpenPositions(user.id);
      console.log('[OpenPositions] getOpenPositions returned:', openPositions.length, 'positions');

      // Load pending orders from pendingOrderService (Supabase)
      let pending = [];
      try {
        console.log('[OpenPositions] Fetching pending orders for user:', user?.id);
        const { data: pendingData, error: pendingError } = await fetchPendingOrders(user?.id);
        console.log('[OpenPositions] Pending orders result:', {
          count: pendingData?.length || 0,
          error: pendingError,
          data: pendingData,
        });

        // Map Supabase field names to PendingOrdersSection expected format
        pending = (pendingData || []).map(order => ({
          ...order,
          // Map field names for PendingOrdersSection compatibility
          entryPrice: order.limit_price || order.stop_price || 0,
          positionSize: order.initial_margin || order.position_size || 0,
          margin: order.initial_margin || 0,
          pendingAt: order.created_at,
        }));
        // [PendingOrders] Sync ref so handlePriceUpdate and updatePrices use correct data
        pendingOrdersRef.current = pending;
        console.log('[PendingOrders] loadData: synced pendingOrdersRef with', pending.length, 'orders');
      } catch (pendingFetchError) {
        console.warn('[OpenPositions] Pending orders load error:', pendingFetchError);
      }

      const tradeStats = paperTradeService.getStats(user?.id);
      setPositions(openPositions);
      setPendingOrders(pending);
      console.log('[OpenPositions] State updated - pendingOrders:', pending.length);
      setStats(tradeStats);
      // Setup WebSocket subscriptions for real-time price updates
      setupPriceSubscriptions(openPositions, pending);

      // Auto-scroll to highlighted position if specified
      if (highlightPositionId && openPositions.length > 0) {
        const index = openPositions.findIndex(p => p.id === highlightPositionId);
        if (index >= 0 && flatListRef.current) {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.3 });
            // Auto-expand the highlighted position for editing
            setEditingPosition(highlightPositionId);
            const pos = openPositions[index];
            if (pos) {
              setEditTP(formatPriceForEdit(pos.takeProfit));
              setEditSL(formatPriceForEdit(pos.stopLoss));
              setEditLeverage(pos.leverage?.toString() || '10');
              setEditMargin(pos.margin?.toString() || pos.positionSize?.toString() || '');
            }
          }, 500);
        }
      }
    } catch (error) {
      console.error('[OpenPositions] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh prices via REST API (for refresh button)
  const updatePrices = async () => {
    try {
      const currentPositions = paperTradeService.getOpenPositions(user?.id);
      // [PendingOrders] FIX: Use ref for current pending orders, NOT paperTradeService.getPendingOrders()
      const currentPending = pendingOrdersRef.current;

      // Collect all symbols from positions AND pending orders
      const allSymbols = [
        ...currentPositions.map((p) => p.symbol),
        ...currentPending.map((p) => p.symbol),
      ];
      const symbols = [...new Set(allSymbols)];

      if (symbols.length === 0) return;

      // Get current prices for all symbols via REST API
      const prices = {};
      for (const symbol of symbols) {
        try {
          const price = await binanceService.getCurrentPrice(symbol);
          if (price) {
            prices[symbol] = price;
            pricesRef.current[symbol] = price; // Update ref too
          }
        } catch (e) {
          console.log(`[OpenPositions] Failed to get price for ${symbol}`);
        }
      }

      // [PendingOrders] FIX: Check pending orders via pendingOrderService (paper_pending_orders table)
      let pendingFillOccurred = false;
      try {
        const pricesForCheck = {};
        for (const [sym, p] of Object.entries(prices)) {
          pricesForCheck[sym] = { last: p, mark: p };
        }
        const triggerResult = await checkPendingOrderTriggers(pricesForCheck, user?.id);
        if (triggerResult.executed > 0) {
          pendingFillOccurred = true;
          console.log('[PendingOrders] Manual refresh: orders filled:', triggerResult.executed);
        }
      } catch (triggerErr) {
        console.log('[PendingOrders] Manual refresh trigger check error:', triggerErr);
      }

      // Also check legacy pending orders from paper_trades
      const pendingResult = await paperTradeService.checkPendingOrders(prices);
      if (pendingResult.filled.length > 0) {
        pendingFillOccurred = true;
        for (const filled of pendingResult.filled) {
          showAlert(
            'Lệnh Đã Khớp!',
            `${filled.symbol} ${filled.direction}\n` +
              `Giá vào: $${formatPrice(filled.entryPrice)}\n` +
              `Số lượng: ${formatCurrency(filled.positionSize)} USDT`,
            [{ text: 'OK' }],
            'success'
          );
          // Push notification already sent by paperTradeService.checkPendingOrders() → notifyOrderFilled()
        }
      }

      // Update positions with new prices (includes SL/TP checks)
      const result = await paperTradeService.updatePrices(prices);

      // Show UI alerts for closed positions (SL/TP hit)
      // Push notifications already sent by paperTradeService.updatePrices() → notifySLHit/notifyTPHit/notifyLiquidation
      if (result.closed.length > 0) {
        for (const closed of result.closed) {
          showAlert(
            closed.result === 'WIN' ? 'Chạm Chốt lời!' : 'Chạm Cắt lỗ!',
            `${closed.symbol} ${closed.direction}\n` +
              `P/L: ${closed.realizedPnL >= 0 ? '+' : ''}$${formatCurrency(closed.realizedPnL)}`,
            [{ text: 'OK' }],
            closed.result === 'WIN' ? 'success' : 'error'
          );
        }
      }

      // Update open positions and stats
      setPositions(paperTradeService.getOpenPositions(user?.id));
      setStats(paperTradeService.getStats(user?.id));

      // [PendingOrders] FIX: Refresh pending orders from DB (not from paperTradeService)
      if (pendingFillOccurred || result.closed.length > 0) {
        const freshPending = await reloadPendingOrdersFromDB();
        setPendingOrders(freshPending);
      }

      // Re-setup WebSocket subscriptions in case symbols changed
      setupPriceSubscriptions(currentPositions, currentPending);
    } catch (error) {
      console.log('[OpenPositions] Update prices error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(true); // Force refresh from cloud on pull-to-refresh
    setRefreshing(false);
  };

  // Cancel pending order
  const handleCancelPendingOrder = async (orderId) => {
    showAlert(
      'Huỷ Lệnh Chờ?',
      'Ký quỹ sẽ được hoàn lại vào số dư.',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Huỷ Lệnh',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellingOrderId(orderId);
              // Use pendingOrderService to cancel (updates Supabase)
              const result = await cancelPendingOrder(orderId, 'Huỷ bởi người dùng', user?.id);
              if (!result.success) {
                throw new Error(result.error || 'Không thể huỷ lệnh');
              }
              await loadData();
              showAlert('Đã huỷ!', 'Lệnh chờ đã được huỷ, ký quỹ đã hoàn lại.', [{ text: 'OK' }], 'success');
            } catch (error) {
              showAlert('Lỗi', error.message, [{ text: 'OK' }], 'error');
            } finally {
              setCancellingOrderId(null);
            }
          },
        },
      ],
      'warning'
    );
  };

  // Close position manually
  const handleClosePosition = async (position) => {
    showAlert(
      'Đóng lệnh?',
      `${position.symbol} ${position.direction}\n` +
        `P/L: ${position.unrealizedPnL >= 0 ? '+' : ''}$${formatCurrency(position.unrealizedPnL)}`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đóng',
          style: 'destructive',
          onPress: async () => {
            try {
              setClosingId(position.id);
              await paperTradeService.closePosition(
                position.id,
                position.currentPrice,
                'MANUAL'
              );
              await loadData();
              showAlert('Đã đóng!', 'Lệnh đã được đóng thành công.', [{ text: 'OK' }], 'success');
            } catch (error) {
              showAlert('Lỗi', error.message, [{ text: 'OK' }], 'error');
            } finally {
              setClosingId(null);
            }
          },
        },
      ],
      'warning'
    );
  };

  // Start editing SL/TP for a position
  const startEditing = (position) => {
    setEditingPosition(position.id);
    setEditSL(formatPriceForEdit(position.stopLoss));
    setEditTP(formatPriceForEdit(position.takeProfit));
    setEditLeverage((position.leverage || 10).toString());
    setEditMargin(position.positionSize?.toString() || '');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingPosition(null);
    setEditSL('');
    setEditTP('');
    setEditLeverage('');
    setEditMargin('');
  };

  // Save edited SL/TP/Leverage/Margin
  const saveEditedSLTP = async (position) => {
    // Parse Vietnamese format (comma as decimal separator) back to number
    const newSL = parseFloat(editSL.replace(',', '.'));
    const newTP = parseFloat(editTP.replace(',', '.'));
    const newLeverage = parseInt(editLeverage) || position.leverage || 10;
    const newMargin = parseFloat(editMargin.replace(',', '.')) || position.positionSize;

    if (isNaN(newSL) || isNaN(newTP)) {
      showAlert('Lỗi', 'Vui lòng nhập giá hợp lệ', [{ text: 'OK' }], 'error');
      return;
    }

    // Validate leverage (1-125x)
    if (newLeverage < 1 || newLeverage > 125) {
      showAlert('Lỗi', 'Đòn bẩy phải từ 1x đến 125x', [{ text: 'OK' }], 'error');
      return;
    }

    // Validate margin
    if (newMargin <= 0) {
      showAlert('Lỗi', 'Ký quỹ phải lớn hơn 0', [{ text: 'OK' }], 'error');
      return;
    }

    // Validate SL/TP logic
    const isLong = position.direction === 'LONG';
    if (isLong) {
      if (newSL >= position.entryPrice) {
        showAlert('Lỗi', 'Cắt lỗ phải thấp hơn giá vào (LONG)', [{ text: 'OK' }], 'error');
        return;
      }
      if (newTP <= position.entryPrice) {
        showAlert('Lỗi', 'Chốt lời phải cao hơn giá vào (LONG)', [{ text: 'OK' }], 'error');
        return;
      }
    } else {
      if (newSL <= position.entryPrice) {
        showAlert('Lỗi', 'Cắt lỗ phải cao hơn giá vào (SHORT)', [{ text: 'OK' }], 'error');
        return;
      }
      if (newTP >= position.entryPrice) {
        showAlert('Lỗi', 'Chốt lời phải thấp hơn giá vào (SHORT)', [{ text: 'OK' }], 'error');
        return;
      }
    }

    try {
      setSavingEdit(true);
      await paperTradeService.updatePositionSLTP(position.id, newSL, newTP, newLeverage, newMargin);
      await loadData();
      cancelEditing();
      showAlert('Thành công', 'Đã cập nhật thông tin vị thế', [{ text: 'OK' }], 'success');
    } catch (error) {
      showAlert('Lỗi', error.message, [{ text: 'OK' }], 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // formatPrice and formatCurrency are imported from utils/formatters

  // Vietnamese pattern names mapping
  const PATTERN_NAMES_VI = {
    // GEM Frequency patterns (keep uppercase)
    'dpu': 'DPU',
    'dpd': 'DPD',
    'upu': 'UPU',
    'upd': 'UPD',
    'hfz': 'HFZ',
    'lfz': 'LFZ',
    // Classic patterns
    'reversal': 'Đảo Chiều',
    'double_top': 'Hai Đỉnh',
    'double_bottom': 'Hai Đáy',
    'head_shoulders': 'Vai Đầu Vai',
    'inverse_head_shoulders': 'Vai Đầu Vai Ngược',
    'triangle': 'Tam Giác',
    'ascending_triangle': 'Tam Giác Tăng',
    'descending_triangle': 'Tam Giác Giảm',
    'symmetric_triangle': 'Tam Giác Đối Xứng',
    'wedge': 'Wedge',
    'falling_wedge': 'Falling Wedge',
    'rising_wedge': 'Rising Wedge',
    'channel': 'Kênh Giá',
    'flag': 'Cờ',
    'pennant': 'Cờ Đuôi Nheo',
    'cup_handle': 'Tách Và Tay Cầm',
    'breakout': 'Phá Vỡ',
    'breakdown': 'Phá Vỡ Xuống',
    'support': 'Hỗ Trợ',
    'resistance': 'Kháng Cự',
    'trend_continuation': 'Tiếp Diễn Xu Hướng',
    'bullish_engulfing': 'Nhấn Chìm Tăng',
    'bearish_engulfing': 'Nhấn Chìm Giảm',
    'doji': 'Doji',
    'hammer': 'Búa',
    'shooting_star': 'Sao Băng',
    'morning_star': 'Sao Mai',
    'evening_star': 'Sao Hôm',
    'three_white_soldiers': 'Ba Lính Trắng',
    'three_black_crows': 'Ba Con Quạ Đen',
    'falling_three_methods': 'Ba Phương Pháp Giảm',
    'rising_three_methods': 'Ba Phương Pháp Tăng',
    'unknown': 'Chưa Xác Định',
  };

  // Abbreviations that should stay uppercase
  const UPPERCASE_PATTERNS = ['DPU', 'DPD', 'UPU', 'UPD', 'HFZ', 'LFZ', 'H&S', 'HS'];

  // Get Vietnamese pattern name with proper capitalization
  const getPatternNameVI = (patternType) => {
    if (!patternType) return 'Mẫu Hình';
    const key = patternType.toLowerCase().replace(/\s+/g, '_');

    // Check dictionary first
    if (PATTERN_NAMES_VI[key]) {
      return PATTERN_NAMES_VI[key];
    }

    // Check if it's an abbreviation that should stay uppercase
    const upperType = patternType.toUpperCase();
    if (UPPERCASE_PATTERNS.includes(upperType)) {
      return upperType;
    }

    // Fallback: capitalize each word
    return patternType.split('_').map(w =>
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join(' ');
  };

  // Format P&L with thousand separators (Vietnamese format)
  const formatPnL = (pnl, percent) => {
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}$${formatCurrency(Math.abs(pnl))} (${sign}${percent.toFixed(2).replace('.', ',')}%)`;
  };

  // Format price for edit input - rounds to proper decimals to avoid floating point issues
  // Uses Vietnamese format (comma for decimals)
  const formatPriceForEdit = (price) => {
    if (!price || isNaN(price)) return '';
    // Round based on price magnitude to avoid floating point precision issues
    let rounded;
    if (price >= 1000) {
      rounded = Math.round(price * 100) / 100; // 2 decimals
    } else if (price >= 100) {
      rounded = Math.round(price * 1000) / 1000; // 3 decimals
    } else if (price >= 1) {
      rounded = Math.round(price * 10000) / 10000; // 4 decimals
    } else {
      rounded = Math.round(price * 100000000) / 100000000; // 8 decimals
    }
    // Format with Vietnamese locale (comma for decimals)
    return rounded.toString().replace('.', ',');
  };

  // Navigate to pattern chart when clicking on position
  const handlePositionPress = (position) => {
    // Build pattern object from stored position data
    // patternData should contain the original pattern used to open the trade
    const basePattern = position.patternData || {
      // Fallback: reconstruct pattern from position data
      symbol: position.symbol,
      type: position.patternType,
      patternType: position.patternType,
      timeframe: position.timeframe,
      direction: position.direction,
      entry: position.entryPrice,
      entryPrice: position.entryPrice,
      stopLoss: position.stopLoss,
      takeProfit: position.takeProfit,
      target: position.takeProfit,
      targets: [position.takeProfit, position.takeProfit2].filter(Boolean),
      target1: position.takeProfit,
      target2: position.takeProfit2,
      confidence: position.confidence,
    };

    // ALWAYS merge position-specific data to ensure trade mode and sizing are correct
    // This is important because patternData might not have these fields
    const pattern = {
      ...basePattern,
      currentPrice: position.currentPrice,
      openedAt: position.openedAt,
      // Trade mode MUST come from position, not patternData
      tradeMode: position.tradeMode || position.trade_mode || 'pattern',
      trade_mode: position.tradeMode || position.trade_mode || 'pattern',
      // Order type
      orderType: position.orderType || position.order_type || 'market',
      order_type: position.orderType || position.order_type || 'market',
      // Position sizing info
      margin: position.margin || position.positionSize,
      positionSize: position.positionSize,
      positionValue: position.positionValue,
      leverage: position.leverage || 10,
      quantity: position.quantity,
      // Risk/Reward ratio
      riskReward: position.riskReward || position.risk_reward,
      // AI assessment for Custom Mode
      aiScore: position.aiScore || position.ai_score,
      aiFeedback: position.aiFeedback || position.ai_feedback,
    };

    // Navigate to PatternDetail with the pattern data
    navigation.navigate('PatternDetail', {
      pattern,
      fromPosition: true, // Flag to indicate coming from open position
      positionId: position.id,
    });
  };

  // Render position card
  const renderPosition = ({ item }) => {
    const isLong = item.direction === 'LONG';
    const pnlColor = item.unrealizedPnL >= 0 ? COLORS.success : COLORS.error;
    const directionColor = isLong ? COLORS.success : COLORS.error;
    const isClosing = closingId === item.id;
    const isCustomMode = item.tradeMode === 'custom' || item.trade_mode === 'custom';

    // Check if this position is being edited - disable navigation
    const isEditing = editingPosition === item.id;

    return (
      <View style={styles.positionCard}>
        {/* Touchable area for navigation - only when not editing */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => !isEditing && handlePositionPress(item)}
          disabled={isEditing}
        >
        {/* Header */}
        <View style={styles.positionHeader}>
          <View style={styles.symbolRow}>
            <Text style={styles.symbolText}>{item.symbol.replace('USDT', '/USDT')}</Text>
            <View style={[styles.directionBadge, { backgroundColor: directionColor }]}>
              {isLong ? (
                <TrendingUp size={12} color="#000" />
              ) : (
                <TrendingDown size={12} color="#FFF" />
              )}
              <Text style={[styles.directionText, { color: isLong ? '#000' : '#FFF' }]}>
                {item.direction}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => handleClosePosition(item)}
            disabled={isClosing}
          >
            {isClosing ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <X size={20} color={COLORS.error} />
            )}
          </TouchableOpacity>
        </View>

        {/* Trade Mode Badge + V2 Info Row */}
        <View style={styles.modeInfoRow}>
          <View style={[
            styles.tradeModeBadge,
            { backgroundColor: isCustomMode ? COLORS.warning + '20' : COLORS.gold + '20' }
          ]}>
            {isCustomMode ? (
              <Brain size={12} color={COLORS.warning} />
            ) : (
              <Gem size={12} color={COLORS.gold} />
            )}
            <Text style={[
              styles.tradeModeText,
              { color: isCustomMode ? COLORS.warning : COLORS.gold }
            ]}>
              {isCustomMode ? 'Custom Mode' : 'GEM Pattern'}
            </Text>
          </View>

          {/* V2: Order Type Badge */}
          <View style={styles.orderTypeBadge}>
            <Text style={styles.orderTypeText}>
              {item.order_type === 'market' || item.orderType === 'market' ? 'Market' :
               item.order_type === 'stop_limit' || item.orderType === 'stop_limit' ? 'Stop Limit' :
               item.order_type === 'stop_market' || item.orderType === 'stop_market' ? 'Stop Market' :
               'Limit'}
            </Text>
          </View>

        </View>

        {/* P&L with label and tooltip */}
        <View style={styles.pnlRow}>
          <View style={styles.pnlHeader}>
            <Text style={styles.pnlLabel}>PNL</Text>
            <TouchableOpacity
              onPress={() => setShowPnLTooltip(showPnLTooltip === item.id ? null : item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <HelpCircle size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.pnlValue, { color: pnlColor }]}>
            {formatPnL(item.unrealizedPnL, item.unrealizedPnLPercent)}
          </Text>
          {showPnLTooltip === item.id && (
            <View style={styles.pnlTooltip}>
              <Text style={styles.tooltipText}>
                PNL = Khoản Lãi/Lỗ chưa chốt.
              </Text>
            </View>
          )}
        </View>

        {/* Details Grid - Row 1: Entry, TP, SL - USE formatPrice for crypto */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Giá vào lệnh</Text>
            <Text style={styles.detailValue}>${formatPrice(item.entryPrice)}</Text>
          </View>

          {/* Take Profit - Editable for Custom Mode (FIRST) */}
          <View style={[styles.detailItem, isEditing && isCustomMode && styles.detailItemTP]}>
            <Text style={[styles.detailLabel, { color: COLORS.success }]}>Chốt lời</Text>
            {isEditing ? (
              <TextInput
                style={[styles.editInput, { color: COLORS.success }]}
                value={editTP}
                onChangeText={setEditTP}
                keyboardType="decimal-pad"
                placeholder="TP"
                placeholderTextColor={COLORS.textMuted}
              />
            ) : (
              <Text style={[styles.detailValue, { color: COLORS.success }]}>
                ${formatPrice(item.takeProfit)}
              </Text>
            )}
          </View>

          {/* Stop Loss - Editable for Custom Mode (SECOND) */}
          <View style={[styles.detailItem, isEditing && isCustomMode && styles.detailItemSL]}>
            <Text style={[styles.detailLabel, { color: COLORS.error }]}>Cắt lỗ</Text>
            {isEditing ? (
              <TextInput
                style={[styles.editInput, { color: COLORS.error }]}
                value={editSL}
                onChangeText={setEditSL}
                keyboardType="decimal-pad"
                placeholder="SL"
                placeholderTextColor={COLORS.textMuted}
              />
            ) : (
              <Text style={[styles.detailValue, { color: COLORS.error }]}>
                ${formatPrice(item.stopLoss)}
              </Text>
            )}
          </View>
        </View>

        {/* Details Grid - Row 2: Current, Liquidation, Leverage - USE formatPrice for crypto */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Hiện tại</Text>
            <Text style={styles.detailValue}>
              ${formatPrice(item.currentPrice)}
            </Text>
          </View>
          {/* Liquidation Price */}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Thanh lý</Text>
            <Text style={styles.detailValue}>
              ${formatPrice((() => {
                const leverage = item.leverage || 10;
                const mmr = 0.004; // 0.4% maintenance margin rate
                const imr = 1 / leverage; // initial margin rate
                const directionUpper = (item.direction || '').toUpperCase();
                if (directionUpper === 'LONG') {
                  return item.entryPrice * (1 - imr + mmr);
                } else {
                  return item.entryPrice * (1 + imr - mmr);
                }
              })())}
            </Text>
          </View>
          {/* Leverage - Editable for Custom Mode */}
          <View style={[styles.detailItem, isEditing && isCustomMode && styles.detailItemEdit]}>
            <Text style={styles.detailLabel}>Đòn bẩy</Text>
            {isEditing && isCustomMode ? (
              <View style={styles.leverageEditRow}>
                <TextInput
                  style={styles.editInputSmall}
                  value={editLeverage}
                  onChangeText={setEditLeverage}
                  keyboardType="number-pad"
                  placeholder="20"
                  placeholderTextColor={COLORS.textMuted}
                />
                <Text style={styles.detailValue}>x</Text>
              </View>
            ) : (
              <Text style={styles.detailValue}>
                {item.leverage || 10}x
              </Text>
            )}
          </View>
        </View>

        {/* Details Grid - Row 3: Margin Stats */}
        <View style={styles.detailsGrid}>
          {/* Ký Quỹ (Margin) - Editable for Custom Mode */}
          <View style={[styles.detailItem, isEditing && isCustomMode && styles.detailItemEdit]}>
            <Text style={styles.detailLabel}>Ký quỹ</Text>
            {isEditing && isCustomMode ? (
              <View style={styles.marginEditRow}>
                <Text style={styles.dollarPrefix}>$</Text>
                <TextInput
                  style={styles.editInputSmall}
                  value={editMargin}
                  onChangeText={setEditMargin}
                  keyboardType="decimal-pad"
                  placeholder="100"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            ) : (
              <Text style={styles.detailValue}>
                ${formatCurrency(item.positionSize)}
              </Text>
            )}
          </View>
          {/* Margin Ratio % */}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Tỉ lệ ký quỹ</Text>
            <Text style={styles.detailValue}>
              {(((item.positionSize || 0) / (stats?.balance || 10000)) * 100).toFixed(1).replace('.', ',')}%
            </Text>
          </View>
          {/* Giá trị vị thế (Position Value) */}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Giá trị vị thế</Text>
            <Text style={styles.detailValue}>
              ${formatCurrency((item.positionSize || 0) * (item.leverage || 10))}
            </Text>
          </View>
        </View>
        </TouchableOpacity>

        {/* Edit/Save buttons for Custom Mode OR Close button for both */}
        <View style={styles.actionButtonsRow}>
          {isCustomMode && (
            isEditing ? (
              <View style={styles.editButtonsRow}>
                <TouchableOpacity
                  style={styles.cancelEditBtn}
                  onPress={cancelEditing}
                >
                  <XCircle size={16} color={COLORS.textMuted} />
                  <Text style={styles.cancelEditText}>Huỷ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveEditBtn}
                  onPress={() => saveEditedSLTP(item)}
                  disabled={savingEdit}
                >
                  {savingEdit ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Check size={16} color="#FFF" />
                      <Text style={styles.saveEditText}>Lưu TP/SL</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.editSLTPBtn}
                onPress={() => startEditing(item)}
              >
                <Edit2 size={14} color={COLORS.textPrimary} />
                <Text style={styles.editSLTPText}>Chỉnh TP/SL</Text>
              </TouchableOpacity>
            )
          )}

          {/* Close Position Button - for both modes */}
          {!isEditing && (
            <TouchableOpacity
              style={styles.closePositionBtn}
              onPress={() => handleClosePosition(item)}
              disabled={isClosing}
            >
              {isClosing ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <X size={14} color="#FFF" />
                  <Text style={styles.closePositionText}>Đóng Lệnh</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Footer with labeled stats */}
        <View style={styles.positionFooter}>
          <View style={styles.footerItemLabeled}>
            <View style={styles.footerIconRow}>
              <Percent size={14} color={COLORS.textMuted} />
              <Text style={[styles.footerValue, { color: pnlColor }]}>
                {item.unrealizedPnLPercent >= 0 ? '+' : ''}{(item.unrealizedPnLPercent?.toFixed(2) || '0,00').replace('.', ',')}%
              </Text>
            </View>
            <Text style={styles.footerLabel}>ROI</Text>
          </View>
          <View style={styles.footerItemLabeled}>
            <View style={styles.footerIconRow}>
              <Clock size={14} color={COLORS.textMuted} />
              <Text style={styles.footerValue}>
                {paperTradeService.calculateHoldingTime(item.openedAt)}
              </Text>
            </View>
            <Text style={styles.footerLabel}>Thời Gian Giữ</Text>
          </View>
          <View style={styles.footerItemLabeled}>
            <View style={styles.footerIconRow}>
              <Target size={14} color={COLORS.textMuted} />
              <Text style={styles.footerValue}>{getPatternNameVI(item.patternType)}</Text>
            </View>
            <Text style={styles.footerLabel}>Mẫu Hình</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render stats header with pending orders
  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.balanceCard}>
        <Wallet size={24} color={COLORS.textPrimary} />
        <View>
          <Text style={styles.balanceLabel}>Số Dư Paper Trade</Text>
          <Text style={styles.balanceValue}>${formatCurrency(stats?.balance || 10000)}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Đang Mở</Text>
          <Text style={styles.statValue}>
            {stats?.openTrades || 0}
          </Text>
          <Text style={styles.statSubtitle}>lệnh chưa đóng</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Đang Chờ</Text>
          <Text style={styles.statValue}>
            {pendingOrders.length || 0}
          </Text>
          <Text style={styles.statSubtitle}>lệnh giới hạn</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Đã Đóng</Text>
          <Text style={styles.statValue}>
            {stats?.totalTrades || 0}
          </Text>
          <Text style={styles.statSubtitle}>tổng lệnh đã thực hiện</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Tỷ Lệ Thắng</Text>
          <Text style={styles.statValue}>
            {(stats?.winRate || 0).toFixed(1).replace('.', ',')}%
          </Text>
          <Text style={styles.statSubtitle}>% lệnh có lãi</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Tổng Lãi/Lỗ</Text>
          <Text
            style={[
              styles.statValue,
              { color: (stats?.totalPnL || 0) >= 0 ? COLORS.success : COLORS.error },
            ]}
          >
            {(stats?.totalPnL || 0) >= 0 ? '+' : ''}${formatCurrency(Math.abs(stats?.totalPnL || 0))}
          </Text>
          <Text style={styles.statSubtitle}>từ tất cả lệnh</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Thắng</Text>
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {stats?.wins || 0}
          </Text>
          <Text style={styles.statSubtitle}>chạm chốt lời</Text>
        </View>
      </View>

      {/* NEW: Pending Orders Section */}
      <PendingOrdersSection
        orders={pendingOrders}
        onCancel={handleCancelPendingOrder}
        cancellingId={cancellingOrderId}
      />

      {/* Section Header for Open Positions */}
      {positions.length > 0 && (
        <View style={styles.sectionHeader}>
          <BarChart2 size={18} color={COLORS.textPrimary} />
          <Text style={styles.sectionTitle}>Lệnh Đang Mở ({positions.length})</Text>
        </View>
      )}
    </View>
  );

  // State for recovery
  const [recovering, setRecovering] = useState(false);

  // Handle data recovery - DIRECT SUPABASE QUERY
  const handleRecoverData = async () => {
    if (!user?.id) {
      showAlert('Lỗi', 'Bạn cần đăng nhập để khôi phục dữ liệu', [{ text: 'OK' }], 'error');
      return;
    }

    try {
      setRecovering(true);
      console.log('[OpenPositions] Starting recovery for userId:', user.id);

      // DIRECT SUPABASE QUERY - bypass paperTradeService
      const { data: supabasePositions, error: supaError } = await supabase
        .from('paper_trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'OPEN');

      console.log('[OpenPositions] Direct Supabase query result:', {
        error: supaError,
        count: supabasePositions?.length || 0,
        positions: supabasePositions,
      });

      // Run diagnosis
      const diagnosis = await paperTradeService.diagnoseDataStorage(user.id);
      console.log('[OpenPositions] Diagnosis result:', diagnosis);

      // Build detailed message
      let diagMsg = `User ID: ${user.id.substring(0, 8)}...\n\n`;
      diagMsg += `📱 Bộ nhớ: ${diagnosis.inMemory.openPositions} lệnh mở\n`;
      diagMsg += `💾 Local Storage: ${diagnosis.userSpecificStorage?.positions || 0} lệnh\n`;
      diagMsg += `📁 Legacy Storage: ${diagnosis.legacyStorage?.positions || 0} lệnh\n`;
      diagMsg += `☁️ Supabase (trực tiếp): ${supabasePositions?.length || 0} lệnh mở\n`;

      if (supaError) {
        diagMsg += `\n⚠️ Lỗi Supabase: ${supaError.message}`;
      }

      if (supabasePositions && supabasePositions.length > 0) {
        diagMsg += `\n\n📋 Các lệnh tìm thấy:\n`;
        supabasePositions.forEach((p, i) => {
          diagMsg += `${i + 1}. ${p.symbol} ${p.direction}\n`;
        });
      }

      // If Supabase has data, force reload
      if (supabasePositions && supabasePositions.length > 0) {
        // Reset and reload
        paperTradeService.initialized = false;
        paperTradeService.currentUserId = null;
        paperTradeService.openPositions = [];

        await paperTradeService.init(user.id);

        const reloadedPositions = paperTradeService.getOpenPositions(user.id);
        console.log('[OpenPositions] After reload:', reloadedPositions.length);

        setPositions(reloadedPositions);
        setStats(paperTradeService.getStats(user.id));

        showAlert(
          'Đã tải lại dữ liệu',
          `Tìm thấy ${supabasePositions.length} lệnh trong Supabase.\n\nĐã hiển thị: ${reloadedPositions.length} lệnh.\n\n${reloadedPositions.length === 0 ? 'Lỗi: Dữ liệu không được parse đúng!' : ''}`,
          [{ text: 'OK' }],
          reloadedPositions.length > 0 ? 'success' : 'warning'
        );
      } else {
        // Try recovery from local storage
        const result = await paperTradeService.attemptDataRecovery(user.id);

        if (result.success) {
          await loadData(false);
          showAlert(
            'Khôi phục thành công!',
            `Đã khôi phục từ ${result.source}:\n` +
            `- ${result.data.positions} lệnh mở\n` +
            `- ${result.data.history} lịch sử`,
            [{ text: 'OK' }],
            'success'
          );
        } else {
          showAlert(
            'Kết quả kiểm tra',
            diagMsg,
            [{ text: 'OK' }],
            'info'
          );
        }
      }
    } catch (error) {
      console.error('[OpenPositions] Recovery error:', error);
      showAlert('Lỗi', 'Không thể khôi phục: ' + error.message, [{ text: 'OK' }], 'error');
    } finally {
      setRecovering(false);
    }
  };

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <BarChart2 size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Chưa có lệnh nào</Text>
      <Text style={styles.emptySubtitle}>
        Mở paper trade từ Pattern Scanner để bắt đầu
      </Text>
      <View style={styles.emptyButtonsRow}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('ScannerMain')}
        >
          <Text style={styles.scanButtonText}>Quét mẫu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.scanButton, styles.recoverButton]}
          onPress={handleRecoverData}
          disabled={recovering}
        >
          {recovering ? (
            <ActivityIndicator size="small" color={COLORS.warning} />
          ) : (
            <Text style={[styles.scanButtonText, { color: COLORS.warning }]}>Khôi phục dữ liệu</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Lệnh đang mở</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => navigation.navigate('PaperTradeHistory')}
            >
              <History size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.refreshButton} onPress={updatePrices}>
              <RefreshCw size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={[...positions].sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt))}
            renderItem={renderPosition}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderStats}
            ListEmptyComponent={renderEmpty}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
              }, 100);
            }}
            ListFooterComponent={() => (
              <View style={styles.footerContainer}>
                {/* Quick Action to History */}
                <TouchableOpacity
                  style={styles.viewHistoryButton}
                  onPress={() => navigation.navigate('PaperTradeHistory')}
                >
                  <History size={18} color={COLORS.textPrimary} />
                  <Text style={styles.viewHistoryText}>Xem Lịch Sử Paper Trade</Text>
                </TouchableOpacity>

                {/* Sponsor Banner */}
                <SponsorBannerSection
                  screenName="paper_trade"
                  navigation={navigation}
                  maxBanners={1}
                />
              </View>
            )}
            contentContainerStyle={[
              styles.listContent,
              positions.length === 0 && styles.emptyListContent,
            ]}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.gold}
              />
            }
          />
        )}
      </SafeAreaView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        type={alertConfig.type}
        onClose={closeAlert}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  historyButton: {
    padding: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  refreshButton: {
    padding: SPACING.xs,
  },

  // List
  listContent: {
    padding: SPACING.md,
    paddingBottom: 180,
  },
  emptyListContent: {
    flex: 1,
  },

  // Stats
  statsContainer: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: GLASS.background,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  balanceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  statBox: {
    flex: 1,
    backgroundColor: GLASS.background,
    padding: SPACING.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statSubtitle: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
    textAlign: 'center',
  },

  // Position Card
  positionCard: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  symbolText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  directionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  modeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  tradeModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  tradeModeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  orderTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: COLORS.cyan + '20',
  },
  orderTypeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.cyan,
  },
  closeButton: {
    padding: SPACING.xs,
  },

  // P&L
  pnlRow: {
    marginBottom: SPACING.md,
  },
  pnlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  pnlLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  pnlValue: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  pnlTooltip: {
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  tooltipText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Details
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  detailItem: {
    width: '31.5%',
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  detailItemSL: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  detailItemTP: {
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  editInput: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 6,
    minWidth: 90,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  editInputSmall: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 6,
    minWidth: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  leverageEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  marginEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dollarPrefix: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  detailItemEdit: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 1,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  // Action buttons row
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
    paddingTop: SPACING.xs,
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  editSLTPBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  editSLTPText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  cancelEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
  },
  cancelEditText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textMuted,
  },
  saveEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.success,
    borderRadius: 6,
  },
  saveEditText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#FFF',
  },
  closePositionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.error,
    borderRadius: 6,
  },
  closePositionText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#FFF',
  },

  // Footer with labels
  positionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerItemLabeled: {
    alignItems: 'center',
    flex: 1,
  },
  footerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  footerLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // Keep old styles for backward compatibility
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  scanButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  scanButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  emptyButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  recoverButton: {
    borderColor: COLORS.warning,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },

  // Footer Container
  footerContainer: {
    marginTop: SPACING.lg,
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  viewHistoryText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});
