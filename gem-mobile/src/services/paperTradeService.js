/**
 * Gemral - Paper Trade Service
 * FULL CLOUD SYNC - All data synced to Supabase for cross-device consistency
 * Updated: 2024-12-25
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { supabase } from './supabase';
import { formatError } from '../utils/errorUtils';
import 'react-native-get-random-values'; // Required for uuid
import { v4 as uuidv4 } from 'uuid';
import { calculateLiquidationPrice } from './tradingCalculations';
import {
  notifyOrderFilled,
  notifyTPHit,
  notifySLHit,
  notifyLiquidation,
} from './paperTradeNotificationService';
// NOTE: pendingOrderService imported lazily inside checkAllOpenPositions()
// to avoid circular dependency (pendingOrderService imports paperTradeService)

// Fetch with timeout to prevent hanging requests on stalled mobile connections
const FETCH_TIMEOUT = 10000;
const fetchWithTimeout = async (url, timeoutMs = FETCH_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Binance API request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
};

// Helper to get user-specific storage keys
const getStorageKeys = (userId) => ({
  POSITIONS: userId ? `gem_paper_positions_${userId}` : 'gem_paper_positions',
  PENDING: userId ? `gem_paper_pending_orders_${userId}` : 'gem_paper_pending_orders',
  HISTORY: userId ? `gem_paper_history_${userId}` : 'gem_paper_history',
  BALANCE: userId ? `gem_paper_balance_${userId}` : 'gem_paper_balance',
  INITIAL_BALANCE: userId ? `gem_paper_initial_balance_${userId}` : 'gem_paper_initial_balance',
  LAST_SYNC: userId ? `gem_paper_last_sync_${userId}` : 'gem_paper_last_sync',
});

// Legacy keys for migration
const LEGACY_STORAGE_KEYS = {
  POSITIONS: 'gem_paper_positions',
  PENDING: 'gem_paper_pending_orders',
  HISTORY: 'gem_paper_history',
  BALANCE: 'gem_paper_balance',
  INITIAL_BALANCE: 'gem_paper_initial_balance',
  LAST_SYNC: 'gem_paper_last_sync',
};

const DEFAULT_INITIAL_BALANCE = 10000; // $10,000 paper money (default)

class PaperTradeService {
  constructor() {
    this.openPositions = [];
    this.pendingOrders = [];
    this.tradeHistory = [];
    this.balance = DEFAULT_INITIAL_BALANCE;
    this.initialBalance = DEFAULT_INITIAL_BALANCE;
    this.initialized = false;
    this.currentUserId = null;

    // Global monitoring for auto-close TP/SL
    this.monitoringInterval = null;
    this.isMonitoring = false;
    this.lastMonitorCheck = null;
    // B5 FIX: Concurrency guard + AppState tracking
    this.isChecking = false;
    this.appStateSubscription = null;
    this.isAppActive = true;
    // Phase 10 Fix A: Track notified position IDs to prevent duplicate notifications
    this._notifiedPositionIds = new Set();
  }

  // ═══════════════════════════════════════════════════════════
  // GLOBAL MONITORING - AUTO-CLOSE TP/SL WHEN APP BACKGROUNDED
  // ═══════════════════════════════════════════════════════════

  /**
   * Start global monitoring for all open positions
   * This ensures TP/SL are checked even when user is not on OpenPositionsScreen
   * @param {string} userId - User ID
   * @param {number} intervalMs - Check interval in milliseconds (default 5000ms)
   */
  startGlobalMonitoring(userId, intervalMs = 5000) {
    if (this.isMonitoring) {
      console.log('[PaperTrade] Global monitoring already running');
      return;
    }

    if (!userId) {
      console.log('[PaperTrade] Cannot start monitoring without userId');
      return;
    }

    this.isMonitoring = true;
    this.currentUserId = userId;

    console.log('[PaperTrade] Starting global TP/SL monitoring (interval:', intervalMs, 'ms)');

    // B5 FIX: AppState listener — pause monitoring when app is in background
    this.isAppActive = AppState.currentState === 'active';
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      const wasInactive = !this.isAppActive;
      this.isAppActive = nextAppState === 'active';
      // When coming back to foreground, trigger immediate check
      if (wasInactive && this.isAppActive) {
        console.log('[PaperTrade] App resumed — triggering immediate check');
        this.checkAllOpenPositions(userId);
      }
    });

    // Initial check
    this.checkAllOpenPositions(userId);

    // Set up interval with concurrency and AppState guards
    this.monitoringInterval = setInterval(() => {
      // B5 FIX: Skip if app is in background
      if (!this.isAppActive) return;
      // B5 FIX: Skip if a previous check is still running (concurrency guard)
      if (this.isChecking) return;
      // B5 FIX: Skip if no open positions or pending orders to monitor
      if (this.openPositions.length === 0 && this.pendingOrders.length === 0) return;

      this.checkAllOpenPositions(userId);
    }, intervalMs);
  }

  /**
   * Stop global monitoring
   */
  stopGlobalMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    // B5 FIX: Clean up AppState listener
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.isMonitoring = false;
    this.isChecking = false;
    this._notifiedPositionIds.clear();
    console.log('[PaperTrade] Global monitoring stopped');
  }

  /**
   * Check all open positions against current prices
   * Fetches prices and calls updatePrices() to check TP/SL hits
   * @param {string} userId - User ID
   */
  async checkAllOpenPositions(userId) {
    // B5 FIX: Concurrency guard — prevent overlapping checks
    if (this.isChecking) {
      console.log('[PaperTrade] Skipping check — previous check still running');
      return { closed: [], filled: [], updated: [] };
    }
    this.isChecking = true;
    try {
      await this.init(userId);

      if (this.openPositions.length === 0 && this.pendingOrders.length === 0) {
        return { closed: [], filled: [], updated: [] };
      }

      // Get all unique symbols from open positions and pending orders
      const allPositions = [...this.openPositions, ...this.pendingOrders];
      const symbols = [...new Set(allPositions.map(p => p.symbol))];

      if (symbols.length === 0) return { closed: [], filled: [], updated: [] };

      // Fetch current prices from Binance
      const prices = await this._fetchCurrentPrices(symbols);

      if (Object.keys(prices).length === 0) {
        console.log('[PaperTrade] No prices fetched');
        return { closed: [], filled: [], updated: [] };
      }

      this.lastMonitorCheck = new Date().toISOString();

      // Check pending orders first (may convert to open)
      const { filled } = await this.checkPendingOrders(prices);

      // Check paper_pending_orders table (Limit/Stop orders from pendingOrderService)
      // These are separate from this.pendingOrders (which come from paper_trades PENDING).
      // Previously only checked from OpenPositionsScreen — now centralized here (Rule 20).
      // Lazy require to avoid circular dependency (pendingOrderService imports paperTradeService).
      try {
        const { checkAndTriggerOrders } = require('./pendingOrderService');
        const priceMap = {};
        for (const [symbol, price] of Object.entries(prices)) {
          priceMap[symbol] = { last: price, mark: price };
        }
        await checkAndTriggerOrders(priceMap, this.currentUserId);
      } catch (pendingErr) {
        console.log('[PaperTrade] pendingOrderService check error:', pendingErr.message);
      }

      // Then check open positions for TP/SL hits
      const { closed, updated } = await this.updatePrices(prices);

      if (closed.length > 0 || filled.length > 0) {
        console.log('[PaperTrade] Monitor check result:', {
          closed: closed.length,
          filled: filled.length,
          updated: updated.length,
        });
      }

      return { closed, filled, updated };
    } catch (error) {
      console.log('[PaperTrade] checkAllOpenPositions error:', error.message);
      return { closed: [], filled: [], updated: [] };
    } finally {
      // B5 FIX: Always release concurrency guard
      this.isChecking = false;
    }
  }

  /**
   * Fetch current prices from Binance for given symbols
   * @private
   * @param {Array<string>} symbols - Array of symbol names (e.g., ['BTCUSDT', 'ETHUSDT'])
   * @returns {Object} Map of symbol -> current price
   */
  async _fetchCurrentPrices(symbols) {
    const prices = {};

    try {
      // B7 FIX: Only fetch prices for needed symbols instead of ALL ~2000 tickers
      // B8 FIX: Use Futures API (fapi) to match candle data source, not Spot (api)
      if (symbols.length === 1) {
        // Single symbol — use direct endpoint
        const response = await fetchWithTimeout(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbols[0]}`);
        if (!response.ok) throw new Error('Failed to fetch price');
        const data = await response.json();
        prices[data.symbol] = parseFloat(data.price);
      } else if (symbols.length <= 20) {
        // Small batch — use symbols[] parameter
        const symbolsParam = encodeURIComponent(JSON.stringify(symbols));
        const response = await fetchWithTimeout(`https://fapi.binance.com/fapi/v1/ticker/price?symbols=${symbolsParam}`);
        if (!response.ok) throw new Error('Failed to fetch prices');
        const data = await response.json();
        for (const item of data) {
          prices[item.symbol] = parseFloat(item.price);
        }
      } else {
        // Large batch — fetch all (rare edge case with 20+ open positions)
        const response = await fetchWithTimeout('https://fapi.binance.com/fapi/v1/ticker/price');
        if (!response.ok) throw new Error('Failed to fetch prices');
        const data = await response.json();
        const symbolSet = new Set(symbols);
        for (const item of data) {
          if (symbolSet.has(item.symbol)) {
            prices[item.symbol] = parseFloat(item.price);
          }
        }
      }
    } catch (error) {
      console.log('[PaperTrade] _fetchCurrentPrices error:', error.message);
    }

    return prices;
  }

  /**
   * Check if monitoring is currently active
   * @returns {boolean}
   */
  isMonitoringActive() {
    return this.isMonitoring;
  }

  /**
   * Get last monitoring check timestamp
   * @returns {string|null}
   */
  getLastMonitorCheck() {
    return this.lastMonitorCheck;
  }

  // ═══════════════════════════════════════════════════════════
  // INITIALIZATION - CLOUD FIRST, LOCAL FALLBACK
  // ═══════════════════════════════════════════════════════════

  async init(userId = null) {
    console.log('[PaperTrade] init called with userId:', userId, 'current state:', {
      initialized: this.initialized,
      currentUserId: this.currentUserId,
      openPositionsCount: this.openPositions?.length || 0,
    });

    // If already initialized for same user, skip
    if (this.initialized && this.currentUserId === userId) {
      console.log('[PaperTrade] init - SKIPPING (already initialized for same user)');
      return;
    }

    // CRITICAL FIX: Backup existing data before any changes
    // This prevents data loss if cloud load fails
    const backupPositions = [...this.openPositions];
    const backupPending = [...this.pendingOrders];
    const backupHistory = [...this.tradeHistory];
    const backupBalance = this.balance;
    const backupInitialBalance = this.initialBalance;
    const isSwitchingUsers = userId && this.currentUserId !== userId;

    // Reset flags but DON'T clear data yet
    if (isSwitchingUsers) {
      this.initialized = false;
    }

    this.currentUserId = userId;

    try {
      console.log('[PaperTrade] Initializing with CLOUD SYNC...');

      // Try to load from Supabase FIRST (cloud priority)
      let cloudLoaded = false;
      if (userId) {
        // Clear arrays ONLY if we're about to load from cloud
        // loadAllFromSupabase will populate these arrays
        this.openPositions = [];
        this.pendingOrders = [];
        this.tradeHistory = [];

        cloudLoaded = await this.loadAllFromSupabase(userId);

        // If cloud load failed, restore backup for SAME user, or try local storage
        if (!cloudLoaded) {
          console.log('[PaperTrade] Cloud load failed...');
          if (!isSwitchingUsers && backupPositions.length > 0) {
            // Same user, restore backup
            console.log('[PaperTrade] Restoring backup data for same user');
            this.openPositions = backupPositions;
            this.pendingOrders = backupPending;
            this.tradeHistory = backupHistory;
            this.balance = backupBalance;
            this.initialBalance = backupInitialBalance;
          } else {
            // Different user or no backup, try local storage
            console.log('[PaperTrade] Falling back to local storage...');
            await this.loadFromLocalStorage();
          }
        } else {
          // Cloud loaded successfully - merge with local storage to recover any orphaned trades
          await this.mergeLocalOrphanedTrades();
        }
      } else {
        // No userId - just use local storage
        await this.loadFromLocalStorage();
      }

      this.initialized = true;

      console.log('[PaperTrade] Loaded (cloud=' + cloudLoaded + '):', {
        positions: this.openPositions.length,
        pending: this.pendingOrders.length,
        history: this.tradeHistory.length,
        balance: this.balance,
        initialBalance: this.initialBalance,
      });

      // Save to local storage as cache
      await this.saveToLocalStorage();

    } catch (error) {
      console.error('[PaperTrade] Init error:', error);
      // On error, try to restore backup if same user
      if (!isSwitchingUsers && backupPositions.length > 0) {
        console.log('[PaperTrade] Error occurred, restoring backup...');
        this.openPositions = backupPositions;
        this.pendingOrders = backupPending;
        this.tradeHistory = backupHistory;
        this.balance = backupBalance;
        this.initialBalance = backupInitialBalance;
      } else {
        this.openPositions = [];
        this.pendingOrders = [];
        this.tradeHistory = [];
        this.initialBalance = DEFAULT_INITIAL_BALANCE;
        this.balance = DEFAULT_INITIAL_BALANCE;
      }
      this.initialized = true;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // CLOUD SYNC METHODS
  // ═══════════════════════════════════════════════════════════

  /**
   * Load ALL paper trade data from Supabase (cloud priority)
   * Returns true if successful, false otherwise
   * FIXED: Better error handling - returns false on critical failures
   */
  async loadAllFromSupabase(userId) {
    if (!userId) return false;

    let hasLoadedAnyData = false;
    let criticalError = false;

    try {
      // 1. Load user settings (balance, initial_balance)
      const { data: settings, error: settingsError } = await supabase
        .from('user_paper_trade_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsError) {
        if (settingsError.code === 'PGRST116') {
          // PGRST116 = no rows found (new user) - this is OK
          console.log('[PaperTrade] New user - no settings found');
          this.balance = DEFAULT_INITIAL_BALANCE;
          this.initialBalance = DEFAULT_INITIAL_BALANCE;
        } else if (settingsError.message?.includes('JWT') || settingsError.message?.includes('auth')) {
          // Auth error - critical failure, don't use cloud
          console.error('[PaperTrade] Auth error loading settings:', settingsError.message);
          criticalError = true;
        } else {
          console.log('[PaperTrade] Settings load error:', settingsError.message);
        }
      } else if (settings) {
        this.balance = parseFloat(settings.balance) || DEFAULT_INITIAL_BALANCE;
        this.initialBalance = parseFloat(settings.initial_balance) || DEFAULT_INITIAL_BALANCE;
        hasLoadedAnyData = true;
      }

      // If critical error (auth issue), abort cloud load
      if (criticalError) {
        console.log('[PaperTrade] Critical error - falling back to local');
        return false;
      }

      // 2. Load OPEN positions
      console.log('[PaperTrade] Querying OPEN positions for userId:', userId);
      const { data: openPositions, error: openError } = await supabase
        .from('paper_trades')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'OPEN')
        .order('opened_at', { ascending: false });

      console.log('[PaperTrade] OPEN positions query result:', {
        error: openError?.message || null,
        count: openPositions?.length || 0,
        positions: openPositions?.map(p => ({ id: p.id, symbol: p.symbol, status: p.status })) || [],
      });

      if (openError) {
        console.log('[PaperTrade] Open positions load error:', openError.message);
        // Check if it's a table doesn't exist error
        if (openError.message?.includes('does not exist') || openError.message?.includes('relation')) {
          console.log('[PaperTrade] Table may not exist - migration needed');
          criticalError = true;
        }
      } else {
        this.openPositions = (openPositions || []).map(p => this.mapFromSupabase(p));
        if (openPositions && openPositions.length > 0) hasLoadedAnyData = true;
        console.log('[PaperTrade] Loaded', this.openPositions.length, 'OPEN positions into memory');
      }

      if (criticalError) return false;

      // 3. Load PENDING orders
      const { data: pendingOrders, error: pendingError } = await supabase
        .from('paper_trades')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'PENDING')
        .order('pending_at', { ascending: false });

      if (pendingError) {
        console.log('[PaperTrade] Pending orders load error:', pendingError.message);
      } else {
        this.pendingOrders = (pendingOrders || []).map(p => this.mapFromSupabase(p));
        if (pendingOrders && pendingOrders.length > 0) hasLoadedAnyData = true;
      }

      // 4. Load trade HISTORY (CLOSED + CANCELLED, last 100)
      const { data: history, error: historyError } = await supabase
        .from('paper_trades')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['CLOSED', 'CANCELLED'])
        .order('closed_at', { ascending: false })
        .limit(100);

      if (historyError) {
        console.log('[PaperTrade] History load error:', historyError.message);
      } else {
        this.tradeHistory = (history || []).map(p => this.mapFromSupabase(p));
        if (history && history.length > 0) hasLoadedAnyData = true;
      }

      console.log('[PaperTrade] Cloud sync complete:', {
        balance: this.balance,
        openPositions: this.openPositions.length,
        pendingOrders: this.pendingOrders.length,
        history: this.tradeHistory.length,
        hasLoadedAnyData,
      });

      // If we loaded settings successfully, consider it a success even if no trades exist
      // This prevents overwriting cloud data with stale local data
      return true;
    } catch (error) {
      console.error('[PaperTrade] loadAllFromSupabase error:', error);
      // Network error or other critical failure
      return false;
    }
  }

  /**
   * Sync user settings (balance, initial_balance) to Supabase
   */
  async syncSettingsToSupabase(userId) {
    if (!userId) {
      console.log('[PaperTrade] syncSettingsToSupabase - No userId, skipping');
      return { success: false, error: 'No userId' };
    }

    console.log('[PaperTrade] syncSettingsToSupabase:', {
      userId: userId.substring(0, 8) + '...',
      balance: this.balance,
      initialBalance: this.initialBalance,
    });

    try {
      const { error } = await supabase
        .from('user_paper_trade_settings')
        .upsert({
          user_id: userId,
          balance: this.balance,
          initial_balance: this.initialBalance,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('[PaperTrade] ❌ syncSettingsToSupabase FAILED:', error.message);
        return { success: false, error: error.message };
      }

      console.log('[PaperTrade] ✅ syncSettingsToSupabase SUCCESS');
      return { success: true };
    } catch (error) {
      console.error('[PaperTrade] ❌ syncSettingsToSupabase EXCEPTION:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load from local storage (fallback)
   * FIXED: Now uses user-specific keys and migrates legacy data
   */
  async loadFromLocalStorage() {
    try {
      const STORAGE_KEYS = getStorageKeys(this.currentUserId);

      // Try user-specific keys first
      let [positions, pending, history, balance, initialBalance] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.POSITIONS),
        AsyncStorage.getItem(STORAGE_KEYS.PENDING),
        AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.BALANCE),
        AsyncStorage.getItem(STORAGE_KEYS.INITIAL_BALANCE),
      ]);

      // If no user-specific data and we have a userId, try migrating from legacy keys
      if (!positions && !history && this.currentUserId) {
        console.log('[PaperTrade] No user-specific data found, checking legacy storage...');
        const [legacyPositions, legacyPending, legacyHistory, legacyBalance, legacyInitBalance] = await Promise.all([
          AsyncStorage.getItem(LEGACY_STORAGE_KEYS.POSITIONS),
          AsyncStorage.getItem(LEGACY_STORAGE_KEYS.PENDING),
          AsyncStorage.getItem(LEGACY_STORAGE_KEYS.HISTORY),
          AsyncStorage.getItem(LEGACY_STORAGE_KEYS.BALANCE),
          AsyncStorage.getItem(LEGACY_STORAGE_KEYS.INITIAL_BALANCE),
        ]);

        if (legacyPositions || legacyHistory) {
          console.log('[PaperTrade] Found legacy data, migrating to user-specific storage...');
          positions = legacyPositions;
          pending = legacyPending;
          history = legacyHistory;
          balance = legacyBalance;
          initialBalance = legacyInitBalance;

          // After loading, save to user-specific keys (migration)
          // This happens after we set the values below
        }
      }

      this.openPositions = positions ? JSON.parse(positions) : [];
      this.pendingOrders = pending ? JSON.parse(pending) : [];
      this.tradeHistory = history ? JSON.parse(history) : [];
      this.initialBalance = initialBalance ? parseFloat(initialBalance) : DEFAULT_INITIAL_BALANCE;
      this.balance = balance ? parseFloat(balance) : this.initialBalance;

      console.log('[PaperTrade] Loaded from local storage:', {
        positions: this.openPositions.length,
        pending: this.pendingOrders.length,
        history: this.tradeHistory.length,
        balance: this.balance,
      });

      // If we migrated from legacy, save to user-specific keys
      if (this.currentUserId && (this.openPositions.length > 0 || this.tradeHistory.length > 0)) {
        await this.saveToLocalStorage();
        console.log('[PaperTrade] Migrated legacy data to user-specific keys');
      }
    } catch (error) {
      console.error('[PaperTrade] loadFromLocalStorage error:', error);
    }
  }

  /**
   * Save to local storage (cache)
   * FIXED: Now uses user-specific keys
   */
  async saveToLocalStorage() {
    try {
      const STORAGE_KEYS = getStorageKeys(this.currentUserId);

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(this.openPositions)),
        AsyncStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(this.pendingOrders)),
        AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(this.tradeHistory)),
        AsyncStorage.setItem(STORAGE_KEYS.BALANCE, this.balance.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.INITIAL_BALANCE, this.initialBalance.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString()),
      ]);
    } catch (error) {
      console.error('[PaperTrade] saveToLocalStorage error:', error);
    }
  }

  /**
   * Merge orphaned trades from local storage that aren't in cloud
   * This recovers trades that failed to sync to cloud
   */
  async mergeLocalOrphanedTrades() {
    try {
      const STORAGE_KEYS = getStorageKeys(this.currentUserId);

      // Load local data
      const [localPositions, localPending] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.POSITIONS),
        AsyncStorage.getItem(STORAGE_KEYS.PENDING),
      ]);

      const localOpenPositions = localPositions ? JSON.parse(localPositions) : [];
      const localPendingOrders = localPending ? JSON.parse(localPending) : [];

      // Get cloud position IDs
      const cloudPositionIds = new Set(this.openPositions.map(p => p.id));
      const cloudPendingIds = new Set(this.pendingOrders.map(p => p.id));

      // Find orphaned trades (in local but not in cloud)
      // Also filter out invalid entries: zero margin, missing symbol, or very old trades (>30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const isValidTrade = (p) => {
        if (!p.symbol) return false;
        if (!p.margin && !p.positionSize) return false;  // Zero margin = invalid
        // Skip very old orphaned trades — they were likely test data or already closed on server
        const openedAt = p.openedAt || p.opened_at || p.pendingAt || p.pending_at;
        if (openedAt && openedAt < thirtyDaysAgo) return false;
        return true;
      };
      const orphanedPositions = localOpenPositions.filter(p => !cloudPositionIds.has(p.id) && isValidTrade(p));
      const orphanedPending = localPendingOrders.filter(p => !cloudPendingIds.has(p.id) && isValidTrade(p));

      if (orphanedPositions.length > 0 || orphanedPending.length > 0) {
        console.log('[PaperTrade] Found orphaned trades:', {
          positions: orphanedPositions.length,
          pending: orphanedPending.length,
        });

        // Add orphaned trades to current arrays
        this.openPositions = [...this.openPositions, ...orphanedPositions];
        this.pendingOrders = [...this.pendingOrders, ...orphanedPending];

        // Try to sync orphaned trades to cloud
        for (const position of orphanedPositions) {
          await this.syncPositionToSupabase(position, 'INSERT');
        }
        for (const pending of orphanedPending) {
          await this.syncPositionToSupabase(pending, 'INSERT');
        }
      }
    } catch (error) {
      console.error('[PaperTrade] mergeLocalOrphanedTrades error:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // OPEN POSITION
  // ═══════════════════════════════════════════════════════════

  async openPosition(params) {
    await this.init(this.currentUserId);

    const {
      pattern,
      positionSize,
      userId: paramUserId,  // Renamed to avoid confusion
      leverage = 10,
      positionValue,
      currentMarketPrice = null,  // NEW: For limit order detection
      // Dual Mode fields
      tradeMode = 'pattern',
      patternEntry = null,
      patternSL = null,
      patternTP = null,
      entryDeviationPercent = 0,
      slDeviationPercent = 0,
      tpDeviationPercent = 0,
      aiScore = 0,
      aiFeedback = null,
    } = params;

    // CRITICAL: Determine effective userId - prioritize param, fallback to currentUserId
    const effectiveUserId = paramUserId || this.currentUserId;

    console.log('[PaperTrade] openPosition - userId check:', {
      paramUserId,
      currentUserId: this.currentUserId,
      effectiveUserId,
      symbol: pattern?.symbol,
    });

    // Validate
    if (!pattern || !positionSize || positionSize <= 0) {
      throw new Error('Invalid parameters');
    }

    // Normalize symbol: ensure it ends with 'USDT' (Rule 11: Format Normalization)
    if (pattern.symbol && !pattern.symbol.endsWith('USDT')) {
      console.warn(`[PaperTrade] openPosition: normalizing symbol "${pattern.symbol}" → "${pattern.symbol}USDT"`);
      pattern = { ...pattern, symbol: pattern.symbol + 'USDT' };
    }

    if (positionSize > this.balance) {
      throw new Error('Insufficient balance');
    }

    // CRITICAL: Warn if no valid userId - position won't sync to cloud!
    if (!effectiveUserId || effectiveUserId === 'anonymous') {
      console.warn('[PaperTrade] ⚠️ WARNING: Opening position without valid userId - will not sync to cloud!');
    }

    // Generate UUID for paper trade (compatible with database UUID type)
    const id = uuidv4();

    // Calculate position value (margin × leverage) - Binance Futures style
    const actualPositionValue = positionValue || (positionSize * leverage);

    // Get market price (required for proper order handling)
    // P6 FIX #2: Don't fallback to pattern.entry — that makes isSamePrice always true
    const marketPrice = currentMarketPrice || 0;

    // ═══════════════════════════════════════════════════════════
    // P6 FIX #2: PENDING ORDER DETECTION — supports BOTH limit AND stop orders
    // ═══════════════════════════════════════════════════════════
    // MARKET: entry ≈ market price (within 0.1%) → instant fill
    // PENDING: entry ≠ market price → wait for price to reach entry
    //   - Limit: LONG entry < market (buy dip) / SHORT entry > market (sell pump)
    //   - Stop:  LONG entry > market (breakout) / SHORT entry < market (breakdown)
    // Fill direction is determined by createdAtMarketPrice stored on the order
    const dir = (pattern.direction || '').toUpperCase();

    // Check if prices are essentially the same (within 0.1% tolerance)
    const priceTolerance = (marketPrice || pattern.entry) * 0.001;
    const isSamePrice = marketPrice > 0
      ? Math.abs(pattern.entry - marketPrice) <= priceTolerance
      : false; // If no market price, never treat as same → create PENDING

    // P6 FIX #2: ALL non-same entries are PENDING — no "invalid entry" concept
    // pattern.entry is authoritative (from zone/detector analysis)
    const finalEntryPrice = pattern.entry;
    const isLimitOrder = !isSamePrice;

    // Calculate quantity based on position value and FINAL entry price
    const quantity = actualPositionValue / finalEntryPrice;

    // P6 FIX #4: Validate quantity
    if (!isFinite(quantity) || quantity <= 0) {
      throw new Error(`Invalid quantity: ${quantity} (positionValue=${actualPositionValue}, entry=${finalEntryPrice})`);
    }

    // Debug: Log order type detection
    console.log('[PaperTrade] openPosition - Order type check:', {
      tradeMode,
      direction: dir,
      requestedEntry: pattern.entry,
      marketPrice,
      finalEntryPrice,
      isSamePrice,
      isLimitOrder,
      orderType: isLimitOrder ? 'PENDING' : 'MARKET',
    });

    // Create position object
    const position = {
      id,
      orderId: id,

      // User - CRITICAL: Use effectiveUserId for proper cloud sync
      userId: effectiveUserId || 'anonymous',

      // Symbol & Pattern
      symbol: pattern.symbol,
      baseAsset: pattern.symbol?.replace('USDT', ''),
      direction: pattern.direction, // 'LONG' or 'SHORT'
      patternType: pattern.type,
      timeframe: pattern.timeframe,
      confidence: pattern.confidence,

      // Prices - USE finalEntryPrice (always = pattern.entry after P6 fix)
      entryPrice: finalEntryPrice,
      requestedEntryPrice: pattern.entry,  // Store original requested entry for reference
      createdAtMarketPrice: marketPrice,   // P6 FIX #2: For fill direction detection
      entryWasCorrected: false,            // P6 FIX #2: Entry is never force-corrected now
      stopLoss: pattern.stopLoss,
      takeProfit: pattern.targets?.[0] || pattern.target1 || finalEntryPrice * (pattern.direction === 'LONG' ? 1.02 : 0.98),
      takeProfit2: pattern.targets?.[1] || pattern.target2,

      // Position sizing (Binance Futures style)
      margin: positionSize, // Collateral/margin amount (USDT)
      positionSize: positionSize, // Keep for backward compatibility
      positionValue: actualPositionValue, // Actual position value = margin × leverage
      quantity: quantity, // Coin quantity based on position value
      leverage: leverage,

      // Risk calculations (based on leveraged position) - USE finalEntryPrice for accurate calculations
      riskAmount: Math.abs(finalEntryPrice - pattern.stopLoss) * quantity,
      rewardAmount: Math.abs((pattern.targets?.[0] || finalEntryPrice * 1.02) - finalEntryPrice) * quantity,
      riskRewardRatio: this.calculateRR(pattern),
      // ROE (Return on Equity) calculations - USE finalEntryPrice
      roeRisk: ((Math.abs(finalEntryPrice - pattern.stopLoss) / finalEntryPrice) * leverage * 100).toFixed(1),
      roeReward: ((Math.abs((pattern.targets?.[0] || finalEntryPrice * 1.02) - finalEntryPrice) / finalEntryPrice) * leverage * 100).toFixed(1),

      // Timestamps - NEW: Conditional based on order type
      openedAt: isLimitOrder ? null : new Date().toISOString(),
      pendingAt: isLimitOrder ? new Date().toISOString() : null,  // NEW
      filledAt: null,  // NEW
      updatedAt: new Date().toISOString(),

      // Status & Order Type - NEW
      status: isLimitOrder ? 'PENDING' : 'OPEN',
      orderType: isLimitOrder ? 'LIMIT' : 'MARKET',  // NEW

      // P&L tracking
      currentPrice: marketPrice,  // Use market price for pending orders
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,

      // Source
      source: 'PATTERN_SCANNER',

      // Dual Mode fields
      tradeMode: tradeMode, // 'pattern' or 'custom'
      patternEntryOriginal: patternEntry || pattern.entry,
      patternSLOriginal: patternSL || pattern.stopLoss,
      patternTPOriginal: patternTP || (pattern.targets?.[0] || pattern.target1 || pattern.entry * (pattern.direction === 'LONG' ? 1.02 : 0.98)),
      entryDeviationPercent: entryDeviationPercent,
      slDeviationPercent: slDeviationPercent,
      tpDeviationPercent: tpDeviationPercent,
      aiScore: aiScore,
      aiFeedback: aiFeedback,

      // Store original pattern data for chart navigation
      patternData: {
        ...pattern,
        // Ensure key fields are stored (support both camelCase and snake_case)
        symbol: pattern.symbol,
        type: pattern.type || pattern.patternType,
        patternType: pattern.type || pattern.patternType,
        pattern_type: pattern.pattern_type || pattern.type || pattern.patternType,
        timeframe: pattern.timeframe,
        direction: pattern.direction,
        // Entry/SL/TP - normalized values
        entry: pattern.entry || pattern.entry_price,
        entryPrice: pattern.entry || pattern.entry_price,
        entry_price: pattern.entry_price || pattern.entry,
        stopLoss: pattern.stopLoss || pattern.stop_loss,
        stop_loss: pattern.stop_loss || pattern.stopLoss,
        // Target fields (different formats for compatibility)
        target: pattern.targets?.[0] || pattern.target1 || pattern.target || pattern.target_1,
        targets: pattern.targets,
        target1: pattern.target1 || pattern.target_1,
        target_1: pattern.target_1 || pattern.target1,
        target2: pattern.target2 || pattern.target_2,
        target_2: pattern.target_2 || pattern.target2,
        take_profit: pattern.take_profit || pattern.takeProfit || pattern.target || pattern.target_1,
        confidence: pattern.confidence,
        // ═══════════════════════════════════════════════════════════
        // ZONE DATA - For displaying zone rectangle on chart
        // ═══════════════════════════════════════════════════════════
        zone_high: pattern.zone_high || pattern.zoneHigh,
        zone_low: pattern.zone_low || pattern.zoneLow,
        zoneHigh: pattern.zoneHigh || pattern.zone_high,
        zoneLow: pattern.zoneLow || pattern.zone_low,
        start_time: pattern.start_time || pattern.startTime || pattern.formation_time || pattern.formationTime,
        startTime: pattern.startTime || pattern.start_time || pattern.formationTime || pattern.formation_time,
        formation_time: pattern.formation_time || pattern.formationTime || pattern.start_time || pattern.startTime,
        formationTime: pattern.formationTime || pattern.formation_time || pattern.startTime || pattern.start_time,
        end_time: pattern.end_time || pattern.endTime,
        endTime: pattern.endTime || pattern.end_time,
        // Pattern ID for linking
        pattern_id: pattern.pattern_id || pattern.id,
        // Chart data for labels/lines
        supportLevels: pattern.supportLevels,
        resistanceLevels: pattern.resistanceLevels,
        trendlines: pattern.trendlines,
        keyPoints: pattern.keyPoints,
        description: pattern.description,
        analysis: pattern.analysis,
        detectedAt: pattern.detectedAt || new Date().toISOString(),
      },
    };

    // Deduct from balance (margin is reserved for both market and limit orders)
    this.balance -= positionSize;

    // NEW: Add to appropriate array based on order type
    if (isLimitOrder) {
      this.pendingOrders.push(position);
      console.log('[PaperTrade] Limit order created (PENDING):', {
        id: position.id,
        symbol: position.symbol,
        direction: position.direction,
        entryPrice: position.entryPrice,
        marketPrice: marketPrice,
        size: positionSize,
      });
    } else {
      this.openPositions.push(position);
      console.log('[PaperTrade] Market order executed (OPEN):', {
        id: position.id,
        symbol: position.symbol,
        direction: position.direction,
        size: positionSize,
      });
    }

    // Save to storage
    await this.saveAll();

    // Sync to Supabase - CRITICAL: This must succeed for persistence across app restarts
    const syncResult = await this.syncPositionToSupabase(position, 'INSERT');

    console.log('[PaperTrade] openPosition complete:', {
      positionId: position.id,
      symbol: position.symbol,
      userId: position.userId,
      status: position.status,
      syncedToCloud: syncResult?.success || false,
      syncError: syncResult?.error || null,
    });

    return position;
  }

  // ═══════════════════════════════════════════════════════════
  // LIMIT ORDER HELPERS
  // ═══════════════════════════════════════════════════════════

  /**
   * P6 FIX #2: Determine if an order should be pending (any entry ≠ market)
   * Replaces old isLimitOrder() which only handled limit orders, not stop/breakout orders
   */
  isLimitOrder(direction, entryPrice, marketPrice) {
    if (!marketPrice || marketPrice <= 0) return true; // No market price → pending
    const tolerance = marketPrice * 0.001;
    return Math.abs(entryPrice - marketPrice) > tolerance;
  }

  /**
   * P6 FIX #2: Check if a pending order should fill based on current market price
   * Uses createdAtMarketPrice to determine fill direction:
   * - Limit (entry was below market): fill when price DROPS to entry
   * - Stop  (entry was above market): fill when price RISES to entry
   */
  shouldFillOrder(order, marketPrice) {
    const createdAt = order.createdAtMarketPrice || 0;
    if (createdAt > 0 && order.entryPrice > createdAt) {
      // Stop order: entry was above market → fill when price RISES to entry
      return marketPrice >= order.entryPrice;
    } else if (createdAt > 0 && order.entryPrice < createdAt) {
      // Limit order: entry was below market → fill when price DROPS to entry
      return marketPrice <= order.entryPrice;
    } else {
      // No createdAtMarketPrice (legacy orders) — fallback to old direction-based logic
      const dir = (order.direction || '').toUpperCase();
      if (dir === 'LONG') return marketPrice <= order.entryPrice;
      return marketPrice >= order.entryPrice;
    }
  }

  /**
   * Check all pending orders against current prices and fill those that hit their entry
   * @param {Object} currentPrices - Map of symbol -> current price
   * @returns {Object} { filled: filledOrders[], pending: remainingPending[] }
   */
  async checkPendingOrders(currentPrices) {
    await this.init(this.currentUserId);

    if (this.pendingOrders.length === 0) {
      return { filled: [], pending: [] };
    }

    const filledOrders = [];

    // FIX 4: Iterate a snapshot but mutate the live array immediately on fill.
    // This prevents concurrent calls from seeing already-filled orders.
    const snapshot = [...this.pendingOrders];

    for (const order of snapshot) {
      const marketPrice = currentPrices[order.symbol];
      if (!marketPrice) continue;

      // Update current price for display
      order.currentPrice = marketPrice;

      const shouldFill = this.shouldFillOrder(order, marketPrice);

      if (shouldFill) {
        // FIX 4: Remove from live pending array IMMEDIATELY (before async work)
        this.pendingOrders = this.pendingOrders.filter(o => o.id !== order.id);

        // Fill the order - move to open positions
        const filledPosition = {
          ...order,
          status: 'OPEN',
          openedAt: new Date().toISOString(),
          filledAt: new Date().toISOString(),
          currentPrice: marketPrice,
          // Reset P&L since we just filled
          unrealizedPnL: 0,
          unrealizedPnLPercent: 0,
        };

        this.openPositions.push(filledPosition);
        filledOrders.push(filledPosition);

        console.log('[PaperTrade] Limit order FILLED:', {
          id: filledPosition.id,
          symbol: filledPosition.symbol,
          direction: filledPosition.direction,
          entryPrice: filledPosition.entryPrice,
          marketPrice: marketPrice,
        });

        // Sync filled position to Supabase
        await this.syncPositionToSupabase(filledPosition, 'UPDATE');

        // ═══════════════════════════════════════════════════════════
        // PUSH NOTIFICATION - Limit Order Filled (FIX 3: dedup guard)
        // ═══════════════════════════════════════════════════════════
        if (!this._notifiedPositionIds.has(filledPosition.id)) {
          this._notifiedPositionIds.add(filledPosition.id);
          try {
            await notifyOrderFilled({
              symbol: filledPosition.symbol,
              direction: filledPosition.direction,
              entry_price: filledPosition.entryPrice,
              filledPrice: filledPosition.entryPrice,
              position_size: filledPosition.positionValue || filledPosition.positionSize,
              id: filledPosition.id,
            }, filledPosition.userId);
          } catch (notifyError) {
            console.log('[PaperTrade] Notification error (order filled):', notifyError.message);
          }
        }
      }
    }

    // Save if anything changed
    if (filledOrders.length > 0) {
      await this.saveAll();
    }

    return { filled: filledOrders, pending: [...this.pendingOrders] };
  }

  /**
   * Cancel a pending limit order
   * Returns margin to balance and moves order to history as CANCELLED
   * @param {string} orderId - ID of the pending order to cancel
   */
  async cancelPendingOrder(orderId) {
    await this.init(this.currentUserId);

    const orderIndex = this.pendingOrders.findIndex((o) => o.id === orderId);

    if (orderIndex === -1) {
      throw new Error('Lệnh chờ không tồn tại');
    }

    const order = this.pendingOrders[orderIndex];

    // Return margin to balance
    this.balance += order.positionSize;

    // Remove from pending
    this.pendingOrders.splice(orderIndex, 1);

    // Add to history as cancelled
    const cancelledOrder = {
      ...order,
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
      result: 'CANCELLED',
      realizedPnL: 0,
      realizedPnLPercent: 0,
    };

    this.tradeHistory.unshift(cancelledOrder);

    // Keep only last 100 trades in history
    if (this.tradeHistory.length > 100) {
      this.tradeHistory = this.tradeHistory.slice(0, 100);
    }

    // Save to storage
    await this.saveAll();

    // Sync to Supabase
    await this.syncPositionToSupabase(cancelledOrder, 'UPDATE');

    console.log('[PaperTrade] Pending order CANCELLED:', {
      id: order.id,
      symbol: order.symbol,
      marginReturned: order.positionSize,
    });

    return cancelledOrder;
  }

  // ═══════════════════════════════════════════════════════════
  // CLOSE POSITION
  // ═══════════════════════════════════════════════════════════

  async closePosition(positionId, exitPrice, exitReason = 'MANUAL') {
    await this.init(this.currentUserId);

    // CRITICAL: Ensure currentUserId is set for proper sync to Supabase
    // If currentUserId is not set, the closed trade won't be saved to cloud
    if (!this.currentUserId) {
      console.warn('[PaperTrade] WARNING: currentUserId not set when closing position');
    }

    const positionIndex = this.openPositions.findIndex((p) => p.id === positionId);

    if (positionIndex === -1) {
      throw new Error('Position not found');
    }

    const position = { ...this.openPositions[positionIndex] };

    // Calculate final P&L
    const isLong = position.direction === 'LONG';
    const priceDiff = isLong
      ? exitPrice - position.entryPrice
      : position.entryPrice - exitPrice;

    const realizedPnL = priceDiff * position.quantity;
    const realizedPnLPercent = (priceDiff / position.entryPrice) * (position.leverage || 1) * 100;

    // Create closed trade record
    // IMPORTANT: Prioritize currentUserId to ensure stats filter AND Supabase sync work correctly
    // If userId is 'anonymous', it won't sync to cloud and will be lost on refresh!
    const finalUserId = this.currentUserId || position.userId;
    if (!finalUserId || finalUserId === 'anonymous') {
      console.warn('[PaperTrade] WARNING: No valid userId for closed trade - data may not sync to cloud');
    }

    const closedTrade = {
      ...position,

      // User ID - PRIORITIZE currentUserId to match what UI filters by
      // IMPORTANT: Must be a real userId (not 'anonymous') for Supabase sync to work
      userId: finalUserId || 'anonymous',

      // Exit info
      exitPrice: exitPrice,
      exitReason: exitReason, // 'MANUAL', 'STOP_LOSS', 'TAKE_PROFIT'
      closedAt: new Date().toISOString(),

      // Final P&L
      realizedPnL: realizedPnL,
      realizedPnLPercent: realizedPnLPercent,

      // Result
      result: realizedPnL >= 0 ? 'WIN' : 'LOSS',
      status: 'CLOSED',

      // Duration
      holdingTime: this.calculateHoldingTime(position.openedAt),
    };

    console.log('[PaperTrade] Creating closed trade with userId:', closedTrade.userId, 'currentUserId:', this.currentUserId);

    // B6 FIX: Atomic close — snapshot state, mutate, persist. Rollback on failure.
    const previousBalance = this.balance;
    const previousHistory = [...this.tradeHistory];

    try {
      // Return position size + P&L to balance
      this.balance += position.positionSize + realizedPnL;

      // Remove from open positions
      this.openPositions.splice(positionIndex, 1);

      // Add to history (at beginning)
      this.tradeHistory.unshift(closedTrade);

      // Keep only last 100 trades in history
      if (this.tradeHistory.length > 100) {
        this.tradeHistory = this.tradeHistory.slice(0, 100);
      }

      // Save to storage — if this fails, rollback
      await this.saveAll();

      // Sync to Supabase (best-effort, don't rollback for cloud sync failure)
      // FIX 6: Use 'CLOSE' action for atomic guard (.eq('status', 'OPEN'))
      try {
        await this.syncPositionToSupabase(closedTrade, 'CLOSE');
      } catch (syncError) {
        console.warn('[PaperTrade] Supabase sync failed (local state is correct):', syncError.message);
      }
    } catch (error) {
      // Rollback all in-memory mutations
      console.error('[PaperTrade] Position close failed — rolling back:', error.message);
      this.balance = previousBalance;
      this.openPositions.splice(positionIndex, 0, position);
      this.tradeHistory = previousHistory;
      throw error;
    }

    console.log('[PaperTrade] Position closed:', {
      id: closedTrade.id,
      result: closedTrade.result,
      pnl: realizedPnL.toFixed(2),
      reason: exitReason,
    });

    return closedTrade;
  }

  // ═══════════════════════════════════════════════════════════
  // UPDATE SL/TP/LEVERAGE/MARGIN (Custom Mode only)
  // ═══════════════════════════════════════════════════════════

  async updatePositionSLTP(positionId, newStopLoss, newTakeProfit, newLeverage = null, newMargin = null) {
    await this.init(this.currentUserId);

    const positionIndex = this.openPositions.findIndex((p) => p.id === positionId);

    if (positionIndex === -1) {
      throw new Error('Position not found');
    }

    const position = this.openPositions[positionIndex];

    // Only allow editing for Custom Mode trades
    if (position.tradeMode !== 'custom' && position.trade_mode !== 'custom') {
      throw new Error('Chỉ có thể chỉnh với lệnh Custom Mode');
    }

    // Validate new SL/TP
    const isLong = position.direction === 'LONG';
    if (isLong) {
      if (newStopLoss >= position.entryPrice) {
        throw new Error('Cắt lỗ phải thấp hơn giá vào (LONG)');
      }
      if (newTakeProfit <= position.entryPrice) {
        throw new Error('Chốt lời phải cao hơn giá vào (LONG)');
      }
    } else {
      if (newStopLoss <= position.entryPrice) {
        throw new Error('Cắt lỗ phải cao hơn giá vào (SHORT)');
      }
      if (newTakeProfit >= position.entryPrice) {
        throw new Error('Chốt lời phải thấp hơn giá vào (SHORT)');
      }
    }

    // Validate leverage if provided
    if (newLeverage !== null && (newLeverage < 1 || newLeverage > 125)) {
      throw new Error('Đòn bẩy phải từ 1x đến 125x');
    }

    // Validate margin if provided
    if (newMargin !== null && newMargin <= 0) {
      throw new Error('Ký quỹ phải lớn hơn 0');
    }

    // Calculate new position value and quantity if leverage or margin changed
    const leverage = newLeverage || position.leverage || 10;
    const oldMargin = position.positionSize || position.margin || 0;
    const margin = newMargin !== null ? newMargin : oldMargin;

    // Adjust balance when margin changes
    if (newMargin !== null && newMargin !== oldMargin) {
      const marginDiff = newMargin - oldMargin;
      if (marginDiff > 0 && marginDiff > this.balance) {
        throw new Error(`Không đủ số dư. Cần thêm $${(marginDiff - this.balance).toFixed(2)}`);
      }
      // Deduct additional margin from balance (or add back if reducing)
      this.balance -= marginDiff;
    }

    const positionValue = margin * leverage;
    const quantity = positionValue / position.entryPrice;

    // Update position - preserve all essential fields
    this.openPositions[positionIndex] = {
      ...position,
      // Core fields (must be preserved)
      id: position.id,
      userId: position.userId,
      status: 'OPEN', // Ensure status stays OPEN
      // Updated fields
      stopLoss: newStopLoss,
      takeProfit: newTakeProfit,
      leverage: leverage,
      positionSize: margin,
      margin: margin, // Also set margin field for compatibility
      positionValue: positionValue,
      quantity: quantity,
      // Timestamps
      slEditedAt: new Date().toISOString(),
      tpEditedAt: new Date().toISOString(),
      leverageEditedAt: newLeverage !== null ? new Date().toISOString() : position.leverageEditedAt,
      marginEditedAt: newMargin !== null ? new Date().toISOString() : position.marginEditedAt,
      updatedAt: new Date().toISOString(),
    };

    // Save to storage
    await this.saveAll();

    // Sync to Supabase
    await this.syncPositionToSupabase(this.openPositions[positionIndex], 'UPDATE');

    console.log('[PaperTrade] Position updated:', {
      id: positionId,
      userId: this.openPositions[positionIndex].userId,
      status: this.openPositions[positionIndex].status,
      newSL: newStopLoss,
      newTP: newTakeProfit,
      newLeverage: leverage,
      newMargin: margin,
      balance: this.balance,
      totalOpenPositions: this.openPositions.length,
    });

    return this.openPositions[positionIndex];
  }

  // ═══════════════════════════════════════════════════════════
  // UPDATE POSITION (for Custom Mode editing TP/SL)
  // ═══════════════════════════════════════════════════════════

  async updatePosition(positionId, updates) {
    await this.init(this.currentUserId);

    const positionIndex = this.openPositions.findIndex((p) => p.id === positionId);

    if (positionIndex === -1) {
      throw new Error('Position not found');
    }

    const position = this.openPositions[positionIndex];

    // Only allow updates for Custom Mode positions
    if (position.tradeMode !== 'custom' && position.trade_mode !== 'custom') {
      throw new Error('Cannot modify GEM Pattern Mode positions');
    }

    // Apply updates
    if (updates.takeProfit !== undefined) {
      position.takeProfit = updates.takeProfit;
    }
    if (updates.stopLoss !== undefined) {
      position.stopLoss = updates.stopLoss;
    }
    if (updates.leverage !== undefined) {
      position.leverage = updates.leverage;
      // Recalculate position value and quantity
      position.positionValue = position.margin * updates.leverage;
      position.quantity = position.positionValue / position.entryPrice;
    }

    position.updatedAt = new Date().toISOString();

    // Save locally
    await this.saveAll();

    // Sync to Supabase
    await this.syncPositionToSupabase(position, 'UPDATE');

    console.log('[PaperTrade] Position updated:', {
      id: position.id,
      updates,
    });

    return position;
  }

  // ═══════════════════════════════════════════════════════════
  // UPDATE PRICES & CHECK SL/TP
  // ═══════════════════════════════════════════════════════════

  async updatePrices(currentPrices) {
    await this.init(this.currentUserId);

    if (this.openPositions.length === 0) return { closed: [], updated: [] };

    const closedPositions = [];
    const updatedPositions = [];

    for (const position of [...this.openPositions]) {
      const currentPrice = currentPrices[position.symbol];
      if (!currentPrice) continue;

      // FIX 2: Grace period — skip positions opened within last 10 seconds
      // Prevents same-tick evaluation where fetched price differs from modal price
      const openedAt = position.openedAt || position.filledAt;
      if (openedAt) {
        const ageMs = Date.now() - new Date(openedAt).getTime();
        if (ageMs < 10000) {
          // Still update current price for display, but skip SL/TP/liq checks
          position.currentPrice = currentPrice;
          updatedPositions.push(position);
          continue;
        }
      }

      const isLong = position.direction === 'LONG';

      // FIX 1: Guard against null/0/undefined SL — without this,
      // currentPrice >= null coerces to currentPrice >= 0 → always true for SHORT
      const hitStopLoss = position.stopLoss > 0 && (isLong
        ? currentPrice <= position.stopLoss
        : currentPrice >= position.stopLoss);

      if (hitStopLoss) {
        const closed = await this.closePosition(
          position.id,
          position.stopLoss,
          'STOP_LOSS'
        );
        closedPositions.push(closed);

        // ═══════════════════════════════════════════════════════════
        // PUSH NOTIFICATION - Stop Loss Hit (Phase 10 Fix A: dedup)
        // ═══════════════════════════════════════════════════════════
        if (!this._notifiedPositionIds.has(position.id)) {
          this._notifiedPositionIds.add(position.id);
          try {
            const roe = ((closed.realizedPnL || 0) / (position.positionSize || 1)) * 100;
            await notifySLHit(position, closed.realizedPnL || 0, roe, position.userId);
          } catch (notifyError) {
            console.log('[PaperTrade] Notification error (SL hit):', notifyError.message);
          }
        }
        continue;
      }

      // FIX 1: Guard against null/0/undefined TP — without this,
      // currentPrice >= null coerces to currentPrice >= 0 → always true for LONG
      const hitTakeProfit = position.takeProfit > 0 && (isLong
        ? currentPrice >= position.takeProfit
        : currentPrice <= position.takeProfit);

      if (hitTakeProfit) {
        const closed = await this.closePosition(
          position.id,
          position.takeProfit,
          'TAKE_PROFIT'
        );
        closedPositions.push(closed);

        // ═══════════════════════════════════════════════════════════
        // PUSH NOTIFICATION - Take Profit Hit (Phase 10 Fix A: dedup)
        // ═══════════════════════════════════════════════════════════
        if (!this._notifiedPositionIds.has(position.id)) {
          this._notifiedPositionIds.add(position.id);
          try {
            const roe = ((closed.realizedPnL || 0) / (position.positionSize || 1)) * 100;
            await notifyTPHit(position, closed.realizedPnL || 0, roe, position.userId);
          } catch (notifyError) {
            console.log('[PaperTrade] Notification error (TP hit):', notifyError.message);
          }
        }
        continue;
      }

      // Check Liquidation Price
      const leverage = position.leverage || 1;
      const positionValue = position.positionSize * leverage;
      const liquidationPrice = calculateLiquidationPrice(
        position.entryPrice,
        leverage,
        position.direction,
        positionValue
      );

      const hitLiquidation = isLong
        ? currentPrice <= liquidationPrice
        : currentPrice >= liquidationPrice;

      if (hitLiquidation) {
        console.log('[PaperTrade] LIQUIDATION:', {
          symbol: position.symbol,
          liquidationPrice,
          currentPrice,
        });
        const closed = await this.closePosition(
          position.id,
          liquidationPrice,
          'LIQUIDATION'
        );
        closedPositions.push(closed);

        // ═══════════════════════════════════════════════════════════
        // PUSH NOTIFICATION - Liquidation (Phase 10 Fix A: dedup)
        // ═══════════════════════════════════════════════════════════
        if (!this._notifiedPositionIds.has(position.id)) {
          this._notifiedPositionIds.add(position.id);
          try {
            await notifyLiquidation(position, liquidationPrice, closed.realizedPnL || 0, position.userId);
          } catch (notifyError) {
            console.log('[PaperTrade] Notification error (liquidation):', notifyError.message);
          }
        }
        continue;
      }

      // Update unrealized P&L
      const priceDiff = isLong
        ? currentPrice - position.entryPrice
        : position.entryPrice - currentPrice;

      position.currentPrice = currentPrice;
      // P6 FIX #4: Guard against NaN/Infinity quantity
      if (!isFinite(position.quantity) || position.quantity <= 0) {
        position.unrealizedPnL = 0;
        position.unrealizedPnLPercent = 0;
      } else {
        position.unrealizedPnL = priceDiff * position.quantity;
        position.unrealizedPnLPercent = (priceDiff / position.entryPrice) * (position.leverage || 1) * 100;
      }
      position.updatedAt = new Date().toISOString();

      updatedPositions.push(position);
    }

    // Save updated positions
    if (updatedPositions.length > 0 || closedPositions.length > 0) {
      await this.saveAll();
    }

    return { closed: closedPositions, updated: updatedPositions };
  }

  // ═══════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════

  getOpenPositions(userId = null) {
    console.log('[PaperTrade] getOpenPositions called:', {
      requestedUserId: userId,
      currentUserId: this.currentUserId,
      totalPositions: this.openPositions.length,
      positionUserIds: this.openPositions.map(p => p.userId),
      initialized: this.initialized,
    });

    // TEMPORARY FIX: If no positions but we're initialized, return all without filtering
    // This helps debug if the issue is with filtering
    if (this.openPositions.length > 0) {
      console.log('[PaperTrade] First position sample:', JSON.stringify(this.openPositions[0], null, 2));
    }

    if (userId) {
      const filtered = this.openPositions.filter((p) => {
        const match1 = p.userId === userId;
        const match2 = p.userId === 'anonymous' && this.currentUserId === userId;
        const match3 = (!p.userId || p.userId === '' || p.userId === null) && this.currentUserId === userId;
        console.log('[PaperTrade] Position filter check:', {
          positionId: p.id,
          positionUserId: p.userId,
          requestedUserId: userId,
          match1, match2, match3,
          result: match1 || match2 || match3,
        });
        return match1 || match2 || match3;
      });
      console.log('[PaperTrade] getOpenPositions filtered result:', filtered.length);
      return filtered;
    }
    return [...this.openPositions];
  }

  getPendingOrders(userId = null) {
    if (userId) {
      return this.pendingOrders.filter((p) => {
        if (p.userId === userId) return true;
        if (p.userId === 'anonymous' && this.currentUserId === userId) return true;
        if ((!p.userId || p.userId === '' || p.userId === null) && this.currentUserId === userId) return true;
        return false;
      });
    }
    return [...this.pendingOrders];
  }

  getTradeHistory(userId = null, limit = 50) {
    let history;
    if (userId) {
      // Filter by userId with multiple fallback conditions
      // This handles legacy trades and various userId states
      history = this.tradeHistory.filter((t) => {
        // Direct match
        if (t.userId === userId) return true;
        // Include 'anonymous' trades if currentUserId matches the requested userId
        if (t.userId === 'anonymous' && this.currentUserId === userId) return true;
        // Include trades with no userId (undefined, null, empty) if we're the current user
        if ((!t.userId || t.userId === '' || t.userId === null || t.userId === undefined) && this.currentUserId === userId) return true;
        return false;
      });
      console.log('[PaperTrade] getTradeHistory filtered:', {
        userId,
        totalHistory: this.tradeHistory.length,
        filteredCount: history.length,
        sampleUserIds: this.tradeHistory.slice(0, 3).map(t => t.userId),
      });
    } else {
      history = [...this.tradeHistory];
    }

    return history.slice(0, limit);
  }

  getBalance() {
    return this.balance;
  }

  getPositionById(positionId) {
    return this.openPositions.find((p) => p.id === positionId);
  }

  // ═══════════════════════════════════════════════════════════
  // STATISTICS
  // ═══════════════════════════════════════════════════════════

  getStats(userId = null) {
    // Debug: Log filter info
    console.log('[PaperTrade] getStats called with userId:', userId);
    console.log('[PaperTrade] currentUserId:', this.currentUserId);
    console.log('[PaperTrade] tradeHistory count:', this.tradeHistory.length);
    if (this.tradeHistory.length > 0) {
      console.log('[PaperTrade] First history item userId:', this.tradeHistory[0]?.userId);
    }

    const history = this.getTradeHistory(userId, 1000);
    console.log('[PaperTrade] Filtered history count:', history.length);

    const openPositions = this.getOpenPositions(userId);

    // Calculate unrealized P&L from open positions
    const unrealizedPnL = openPositions.reduce((sum, p) => sum + (p.unrealizedPnL || 0), 0);

    // Calculate total position size in use
    const usedMargin = openPositions.reduce((sum, p) => sum + (p.positionSize || 0), 0);

    if (history.length === 0) {
      return {
        totalTrades: 0, // Closed trades count
        openTrades: openPositions.length,
        winRate: 0,
        totalPnL: unrealizedPnL, // Include unrealized P&L
        realizedPnL: 0,
        unrealizedPnL: unrealizedPnL,
        avgPnL: 0,
        wins: 0,
        losses: 0,
        bestTrade: 0,
        worstTrade: 0,
        avgHoldingTime: '0h',
        profitFactor: 0,
        balance: this.balance,
        usedMargin: usedMargin,
        availableBalance: this.balance,
      };
    }

    const wins = history.filter((t) => t.result === 'WIN');
    const losses = history.filter((t) => t.result === 'LOSS');

    const realizedPnL = history.reduce((sum, t) => sum + (t.realizedPnL || 0), 0);
    const totalPnL = realizedPnL + unrealizedPnL; // Combined P&L

    const winPnL = wins.reduce((sum, t) => sum + (t.realizedPnL || 0), 0);
    const lossPnL = Math.abs(
      losses.reduce((sum, t) => sum + (t.realizedPnL || 0), 0)
    );

    const pnls = history.map((t) => t.realizedPnL || 0);
    const closedTradesCount = history.length;

    return {
      totalTrades: closedTradesCount, // Number of CLOSED trades
      openTrades: openPositions.length,
      winRate: closedTradesCount > 0 ? (wins.length / closedTradesCount) * 100 : 0,
      totalPnL: totalPnL, // Realized + Unrealized
      realizedPnL: realizedPnL,
      unrealizedPnL: unrealizedPnL,
      avgPnL: closedTradesCount > 0 ? realizedPnL / closedTradesCount : 0,
      wins: wins.length,
      losses: losses.length,
      bestTrade: pnls.length > 0 ? Math.max(...pnls, 0) : 0,
      worstTrade: pnls.length > 0 ? Math.min(...pnls, 0) : 0,
      profitFactor: lossPnL > 0 ? winPnL / lossPnL : winPnL,
      balance: this.balance,
      usedMargin: usedMargin,
      availableBalance: this.balance,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // DUAL MODE HELPERS
  // ═══════════════════════════════════════════════════════════

  /**
   * Get count of custom mode trades for a specific date
   * Used to check daily limits for FREE users
   * @param {string} userId - User ID
   * @param {string} date - Date in YYYY-MM-DD format (default: today)
   * @returns {number} Count of custom trades
   */
  async getCustomTradesCount(userId, date = null) {
    if (!userId) return 0;

    try {
      // Use provided date or today
      const targetDate = date || new Date().toISOString().split('T')[0];

      const { count, error } = await supabase
        .from('paper_trades')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('trade_mode', 'custom')
        .gte('opened_at', `${targetDate}T00:00:00Z`)
        .lt('opened_at', `${targetDate}T23:59:59Z`);

      if (error) {
        console.log('[PaperTrade] getCustomTradesCount error:', error.message);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.log('[PaperTrade] getCustomTradesCount error:', error.message);
      return 0;
    }
  }

  /**
   * Check if user can use custom mode (based on daily limit)
   * @param {Object} user - User object with scanner_tier, karma_level, role, is_admin
   * @returns {Object|null} { allowed, remaining, dailyLimit, usedToday } or null if unlimited
   */
  async checkCustomModeLimit(user) {
    // ADMIN has unlimited access - check all admin conditions (sync with AuthContext)
    const isAdmin = user?.role === 'admin' ||
                    user?.role === 'ADMIN' ||
                    user?.is_admin === true ||
                    user?.scanner_tier === 'ADMIN' ||
                    user?.chatbot_tier === 'ADMIN';

    // Debug: Log admin check
    if (__DEV__) {
      console.log('[PaperTrade] checkCustomModeLimit:', {
        role: user?.role,
        is_admin: user?.is_admin,
        scanner_tier: user?.scanner_tier,
        chatbot_tier: user?.chatbot_tier,
        isAdmin,
      });
    }

    if (isAdmin) {
      return null; // null = unlimited
    }

    // Paid users (TIER1/2/3) have unlimited access
    const paidTiers = ['TIER1', 'TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP'];
    if (paidTiers.includes(user?.scanner_tier)) {
      return null; // null = unlimited
    }

    // FREE users have daily limits based on karma level
    const karmaLevel = user?.karma_level || 'novice';
    // Student karma = 10/day, others (novice, warrior, master, guardian) = 3/day for FREE tier
    const dailyLimit = karmaLevel.toLowerCase() === 'student' ? 10 : 3;

    // Count today's custom trades
    const usedToday = await this.getCustomTradesCount(user?.id);

    return {
      allowed: usedToday < dailyLimit,
      remaining: Math.max(0, dailyLimit - usedToday),
      dailyLimit,
      usedToday,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════

  calculateRR(pattern) {
    if (!pattern.entry || !pattern.stopLoss || !pattern.targets?.[0]) {
      return '1:2';
    }

    const risk = Math.abs(pattern.entry - pattern.stopLoss);
    const reward = Math.abs(pattern.targets[0] - pattern.entry);

    if (risk === 0) return '1:2';

    const ratio = reward / risk;
    return `1:${ratio.toFixed(1)}`;
  }

  calculateHoldingTime(openedAt) {
    const opened = new Date(openedAt);
    const now = new Date();
    const diffMs = now - opened;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }

    return `${hours}h ${minutes}m`;
  }

  // ═══════════════════════════════════════════════════════════
  // STORAGE - CLOUD + LOCAL SYNC
  // ═══════════════════════════════════════════════════════════

  async saveAll() {
    try {
      // Save to local storage (cache)
      await this.saveToLocalStorage();

      // Sync balance to cloud
      if (this.currentUserId) {
        await this.syncSettingsToSupabase(this.currentUserId);
      }
    } catch (error) {
      console.error('[PaperTrade] Save error:', error);
    }
  }

  /**
   * Reset all data and start fresh with current initial balance
   * Clears all positions, pending orders, and history, resets balance to initialBalance
   * CLOUD SYNC: Also clears data in Supabase
   */
  async resetAll() {
    const userId = this.currentUserId;

    this.openPositions = [];
    this.pendingOrders = [];
    this.tradeHistory = [];
    this.balance = this.initialBalance;

    // Save to local
    await this.saveToLocalStorage();

    // Clear in Supabase if user is logged in
    if (userId) {
      try {
        // Delete all trades for this user
        await supabase
          .from('paper_trades')
          .delete()
          .eq('user_id', userId);

        // Reset settings in cloud
        await supabase
          .from('user_paper_trade_settings')
          .upsert({
            user_id: userId,
            balance: this.initialBalance,
            initial_balance: this.initialBalance,
            total_trades: 0,
            total_wins: 0,
            total_losses: 0,
            total_realized_pnl: 0,
            updated_at: new Date().toISOString(),
            last_trade_at: null,
          }, {
            onConflict: 'user_id',
          });

        console.log('[PaperTrade] Cloud reset complete');
      } catch (error) {
        console.log('[PaperTrade] Cloud reset error:', error.message);
      }
    }

    console.log('[PaperTrade] Reset complete with balance:', this.initialBalance);
    return {
      balance: this.balance,
      initialBalance: this.initialBalance,
    };
  }

  /**
   * Get the current initial balance setting
   */
  getInitialBalance() {
    return this.initialBalance;
  }

  /**
   * Set a new initial balance for paper trading
   * @param {number} amount - New initial balance (min $100, max $10,000,000)
   * @param {boolean} resetAccount - If true, also reset all positions/history
   * CLOUD SYNC: Syncs to Supabase
   */
  async setInitialBalance(amount, resetAccount = false) {
    await this.init(this.currentUserId);

    // Validate amount
    const MIN_BALANCE = 100;
    const MAX_BALANCE = 10000000; // 10 million

    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Số tiền không hợp lệ');
    }

    if (amount < MIN_BALANCE) {
      throw new Error(`Số tiền tối thiểu là $${MIN_BALANCE.toLocaleString()}`);
    }

    if (amount > MAX_BALANCE) {
      throw new Error(`Số tiền tối đa là $${MAX_BALANCE.toLocaleString()}`);
    }

    const oldInitialBalance = this.initialBalance;
    this.initialBalance = amount;

    if (resetAccount) {
      // Full reset with new initial balance - use resetAll() for cloud sync
      this.initialBalance = amount;
      await this.resetAll();
    } else {
      // Adjust current balance by the difference
      const difference = amount - oldInitialBalance;
      this.balance += difference;

      // Ensure balance doesn't go negative
      if (this.balance < 0) {
        this.balance = 0;
      }

      // Save and sync to cloud
      await this.saveAll();
    }

    console.log('[PaperTrade] Initial balance set:', {
      oldInitialBalance,
      newInitialBalance: this.initialBalance,
      currentBalance: this.balance,
      resetAccount,
    });

    return {
      initialBalance: this.initialBalance,
      balance: this.balance,
      resetAccount,
    };
  }

  /**
   * Reset to default initial balance ($10,000) and clear all data
   * CLOUD SYNC: Syncs to Supabase
   */
  async resetToDefault() {
    this.initialBalance = DEFAULT_INITIAL_BALANCE;
    await this.resetAll();
    console.log('[PaperTrade] Reset to default complete');
    return {
      initialBalance: this.initialBalance,
      balance: this.balance,
    };
  }

  /**
   * Recalculate balance based on history, open positions, and pending orders
   * Use this to fix corrupted balance data
   * Formula: Balance = initialBalance + sum(realizedPnL) - sum(openPositionSizes) - sum(pendingOrderSizes)
   */
  async recalculateBalance() {
    // CRITICAL: Use currentUserId to preserve cloud sync context
    // Don't call init() without userId as it will reset currentUserId to null
    await this.init(this.currentUserId);

    // Sum of all realized P&L from closed trades
    const totalRealizedPnL = this.tradeHistory.reduce((sum, t) => {
      return sum + (t.realizedPnL || 0);
    }, 0);

    // Sum of position sizes currently in use (locked in open trades)
    const usedMarginOpen = this.openPositions.reduce((sum, p) => {
      return sum + (p.positionSize || 0);
    }, 0);

    // Sum of margin locked in pending orders
    const usedMarginPending = this.pendingOrders.reduce((sum, p) => {
      return sum + (p.positionSize || 0);
    }, 0);

    const totalUsedMargin = usedMarginOpen + usedMarginPending;

    // Correct balance = Initial + Profits/Losses - Currently Used Margin
    const correctBalance = this.initialBalance + totalRealizedPnL - totalUsedMargin;

    console.log('[PaperTrade] Recalculating balance:', {
      initial: this.initialBalance,
      totalRealizedPnL,
      usedMarginOpen,
      usedMarginPending,
      totalUsedMargin,
      oldBalance: this.balance,
      newBalance: correctBalance,
    });

    this.balance = correctBalance;
    await this.saveAll();

    return {
      oldBalance: this.balance,
      newBalance: correctBalance,
      initialBalance: this.initialBalance,
      totalRealizedPnL,
      usedMargin: totalUsedMargin,
    };
  }

  /**
   * Get equity (balance + unrealized P&L)
   * This is the "real" account value including floating profits/losses
   */
  getEquity(userId = null) {
    const openPositions = this.getOpenPositions(userId);
    const pendingOrders = this.getPendingOrders(userId);
    const unrealizedPnL = openPositions.reduce((sum, p) => sum + (p.unrealizedPnL || 0), 0);
    const usedMarginOpen = openPositions.reduce((sum, p) => sum + (p.positionSize || 0), 0);
    const usedMarginPending = pendingOrders.reduce((sum, p) => sum + (p.positionSize || 0), 0);

    return {
      initialBalance: this.initialBalance,
      balance: this.balance,
      usedMargin: usedMarginOpen,
      pendingMargin: usedMarginPending,  // NEW: Margin locked in pending orders
      unrealizedPnL: unrealizedPnL,
      equity: this.balance + usedMarginOpen + usedMarginPending + unrealizedPnL, // Total account value
      availableBalance: this.balance, // Free margin
      pendingOrdersCount: pendingOrders.length,  // NEW
    };
  }

  // ═══════════════════════════════════════════════════════════
  // SUPABASE SYNC - FULL DATA SYNC
  // ═══════════════════════════════════════════════════════════

  async syncPositionToSupabase(position, action = 'INSERT') {
    console.log('[PaperTrade] syncPositionToSupabase called:', {
      action,
      positionId: position.id,
      symbol: position.symbol,
      userId: position.userId,
      status: position.status,
      currentUserId: this.currentUserId,
    });

    try {
      // CRITICAL: Use currentUserId as fallback if position.userId is not set
      const effectiveUserId = position.userId || this.currentUserId;

      if (!effectiveUserId || effectiveUserId === 'anonymous') {
        console.error('[PaperTrade] ❌ SYNC SKIPPED - No valid userId!', {
          positionUserId: position.userId,
          currentUserId: this.currentUserId,
        });
        return { success: false, error: 'No valid userId' };
      }

      // Ensure position has userId for future reference
      if (!position.userId) {
        position.userId = effectiveUserId;
      }

      // Map direction to side for database compatibility
      const sideValue = position.direction === 'LONG' ? 'buy' : 'sell';

      const data = {
        id: position.id,
        user_id: effectiveUserId,
        symbol: position.symbol,
        // Both direction and side for compatibility
        direction: position.direction,
        side: sideValue,  // Required by existing table schema
        pattern_type: position.patternType,
        timeframe: position.timeframe,
        // Both entry_price and price for compatibility
        entry_price: position.entryPrice,
        price: position.entryPrice,  // Required by existing table schema
        stop_loss: position.stopLoss,
        take_profit: position.takeProfit,
        position_size: position.positionSize,
        quantity: position.quantity || (position.positionValue / position.entryPrice),
        // Both total_value and position_value
        total_value: position.positionValue || position.positionSize,
        status: position.status,
        opened_at: position.openedAt,
        closed_at: position.closedAt || null,
        exit_price: position.exitPrice || null,
        exit_reason: position.exitReason || null,
        // Both realized_pnl and pnl for compatibility
        realized_pnl: position.realizedPnL || null,
        pnl: position.realizedPnL || 0,
        realized_pnl_percent: position.realizedPnLPercent || null,
        pnl_percent: position.realizedPnLPercent || 0,
        result: position.result || null,
        // Extended fields
        leverage: position.leverage || 10,
        margin: position.margin || position.positionSize,
        position_value: position.positionValue || null,
        confidence: position.confidence || null,
        order_type: position.orderType || 'MARKET',
        pending_at: position.pendingAt || null,
        filled_at: position.filledAt || null,
        cancelled_at: position.cancelledAt || null,
        holding_time: position.holdingTime || null,
        pattern_data: position.patternData ? JSON.stringify(position.patternData) : null,
        // Dual Mode fields
        trade_mode: position.tradeMode || 'pattern',
        pattern_entry: position.patternEntryOriginal || null,
        pattern_sl: position.patternSLOriginal || null,
        pattern_tp: position.patternTPOriginal || null,
        entry_deviation_percent: position.entryDeviationPercent || 0,
        sl_deviation_percent: position.slDeviationPercent || 0,
        tp_deviation_percent: position.tpDeviationPercent || 0,
        ai_score: position.aiScore || 0,
        ai_feedback: position.aiFeedback || null,
      };

      let error = null;

      if (action === 'INSERT') {
        const result = await supabase.from('paper_trades').insert(data);
        error = result.error;
        if (error) {
          // Try upsert if insert fails (might already exist)
          console.log('[PaperTrade] Insert failed, trying upsert...', error.message);
          const upsertResult = await supabase.from('paper_trades').upsert(data);
          error = upsertResult.error;
        }
      } else if (action === 'CLOSE') {
        // FIX 6: Atomic close — only update if status is still OPEN in DB.
        // Prevents double-close from concurrent updatePrices() calls.
        const result = await supabase
          .from('paper_trades')
          .update(data)
          .eq('id', data.id)
          .eq('status', 'OPEN');
        error = result.error;
        if (!error) {
          console.log('[PaperTrade] Atomic close sync successful for', data.id);
        }
      } else {
        const result = await supabase.from('paper_trades').upsert(data);
        error = result.error;
      }

      if (error) {
        console.error('[PaperTrade] Supabase sync FAILED:', `action=${action}, ${formatError(error)}`);
        return { success: false, error: error.message };
      }

      // VERIFY: Query back to confirm data was saved
      const { data: verifyData, error: verifyError } = await supabase
        .from('paper_trades')
        .select('id, symbol, status, user_id')
        .eq('id', position.id)
        .single();

      if (verifyError || !verifyData) {
        console.error('[PaperTrade] ⚠️ VERIFICATION FAILED - Data may not have been saved!', {
          verifyError: verifyError?.message,
          positionId: position.id,
        });
      } else {
        console.log('[PaperTrade] ✅ Supabase sync VERIFIED:', {
          action,
          positionId: verifyData.id,
          symbol: verifyData.symbol,
          status: verifyData.status,
          userId: verifyData.user_id,
        });
      }

      // Also update balance in settings
      const settingsUserId = this.currentUserId || effectiveUserId;
      if (settingsUserId) {
        await this.syncSettingsToSupabase(settingsUserId);
      }

      return { success: true, verified: !verifyError && !!verifyData };
    } catch (error) {
      console.error('[PaperTrade] ❌ Supabase sync EXCEPTION:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Force refresh from cloud (useful for manual sync button)
   * CRITICAL FIX: Don't clear existing data until cloud load succeeds
   */
  async forceRefreshFromCloud(userId) {
    if (!userId) return false;

    console.log('[PaperTrade] forceRefreshFromCloud called for userId:', userId);

    // CRITICAL: Save existing data in case cloud load fails
    const backupPositions = [...this.openPositions];
    const backupPending = [...this.pendingOrders];
    const backupHistory = [...this.tradeHistory];
    const backupBalance = this.balance;
    const backupInitialBalance = this.initialBalance;

    try {
      // Set currentUserId BEFORE calling loadAllFromSupabase
      // This ensures userId filtering works correctly
      this.currentUserId = userId;

      // Try to load from cloud
      const cloudLoaded = await this.loadAllFromSupabase(userId);

      if (cloudLoaded) {
        console.log('[PaperTrade] forceRefreshFromCloud - Cloud load SUCCESS:', {
          positions: this.openPositions.length,
          pending: this.pendingOrders.length,
          history: this.tradeHistory.length,
        });
        this.initialized = true;

        // Save to local storage as cache
        await this.saveToLocalStorage();
        return true;
      } else {
        // Cloud load failed - RESTORE backup data
        console.log('[PaperTrade] forceRefreshFromCloud - Cloud load FAILED, restoring backup');
        this.openPositions = backupPositions;
        this.pendingOrders = backupPending;
        this.tradeHistory = backupHistory;
        this.balance = backupBalance;
        this.initialBalance = backupInitialBalance;
        this.initialized = true;
        return false;
      }
    } catch (error) {
      // Error occurred - RESTORE backup data
      console.error('[PaperTrade] forceRefreshFromCloud error:', error);
      this.openPositions = backupPositions;
      this.pendingOrders = backupPending;
      this.tradeHistory = backupHistory;
      this.balance = backupBalance;
      this.initialBalance = backupInitialBalance;
      this.initialized = true;
      return false;
    }
  }

  /**
   * DIAGNOSTIC: Check all storage locations for paper trade data
   * Returns a detailed report of what data exists and where
   * Use this to debug data loss issues
   */
  async diagnoseDataStorage(userId) {
    const report = {
      userId,
      timestamp: new Date().toISOString(),
      inMemory: {
        openPositions: this.openPositions.length,
        pendingOrders: this.pendingOrders.length,
        tradeHistory: this.tradeHistory.length,
        balance: this.balance,
        initialBalance: this.initialBalance,
        currentUserId: this.currentUserId,
        initialized: this.initialized,
      },
      userSpecificStorage: {},
      legacyStorage: {},
      supabase: {},
      recommendation: '',
    };

    try {
      // Check user-specific local storage
      const STORAGE_KEYS = getStorageKeys(userId);
      const [usPositions, usPending, usHistory, usBalance] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.POSITIONS),
        AsyncStorage.getItem(STORAGE_KEYS.PENDING),
        AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.BALANCE),
      ]);

      report.userSpecificStorage = {
        positions: usPositions ? JSON.parse(usPositions).length : 0,
        pending: usPending ? JSON.parse(usPending).length : 0,
        history: usHistory ? JSON.parse(usHistory).length : 0,
        balance: usBalance ? parseFloat(usBalance) : null,
        hasData: !!(usPositions || usHistory),
      };

      // Check legacy local storage
      const [legPositions, legPending, legHistory, legBalance] = await Promise.all([
        AsyncStorage.getItem(LEGACY_STORAGE_KEYS.POSITIONS),
        AsyncStorage.getItem(LEGACY_STORAGE_KEYS.PENDING),
        AsyncStorage.getItem(LEGACY_STORAGE_KEYS.HISTORY),
        AsyncStorage.getItem(LEGACY_STORAGE_KEYS.BALANCE),
      ]);

      report.legacyStorage = {
        positions: legPositions ? JSON.parse(legPositions).length : 0,
        pending: legPending ? JSON.parse(legPending).length : 0,
        history: legHistory ? JSON.parse(legHistory).length : 0,
        balance: legBalance ? parseFloat(legBalance) : null,
        hasData: !!(legPositions || legHistory),
      };

      // Check Supabase (if userId provided)
      if (userId) {
        try {
          const { data: settings } = await supabase
            .from('user_paper_trade_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

          const { data: allTrades } = await supabase
            .from('paper_trades')
            .select('id, status')
            .eq('user_id', userId);

          const openCount = allTrades?.filter(t => t.status === 'OPEN').length || 0;
          const pendingCount = allTrades?.filter(t => t.status === 'PENDING').length || 0;
          const closedCount = allTrades?.filter(t => t.status === 'CLOSED' || t.status === 'CANCELLED').length || 0;

          report.supabase = {
            hasSettings: !!settings,
            balance: settings?.balance || null,
            initialBalance: settings?.initial_balance || null,
            openPositions: openCount,
            pendingOrders: pendingCount,
            closedTrades: closedCount,
            totalTrades: allTrades?.length || 0,
            hasData: !!settings || (allTrades && allTrades.length > 0),
          };
        } catch (supabaseError) {
          report.supabase = {
            error: supabaseError.message,
            hasData: false,
          };
        }
      }

      // Generate recommendation
      if (report.supabase.hasData && report.supabase.totalTrades > 0) {
        report.recommendation = 'Data exists in Supabase. Try forceRefreshFromCloud() to reload.';
      } else if (report.legacyStorage.hasData) {
        report.recommendation = 'Data found in legacy storage. Need migration - call init() with userId.';
      } else if (report.userSpecificStorage.hasData) {
        report.recommendation = 'Data found in user-specific storage. Check if cloud sync failed.';
      } else {
        report.recommendation = 'No data found in any storage location. Data may have been reset or is a new account.';
      }

      console.log('[PaperTrade] Diagnostic Report:', JSON.stringify(report, null, 2));
      return report;

    } catch (error) {
      report.error = error.message;
      console.error('[PaperTrade] Diagnostic error:', error);
      return report;
    }
  }

  /**
   * RECOVERY: Attempt to recover data from all available sources
   * Priority: Supabase > User-specific storage > Legacy storage
   * IMPROVED: Better parsing and validation of storage data
   */
  async attemptDataRecovery(userId) {
    if (!userId) {
      return { success: false, error: 'No userId provided' };
    }

    console.log('[PaperTrade] Attempting data recovery for user:', userId);

    try {
      // 1. First try Supabase
      const cloudLoaded = await this.loadAllFromSupabase(userId);
      if (cloudLoaded && (this.openPositions.length > 0 || this.tradeHistory.length > 0)) {
        this.currentUserId = userId;
        await this.saveToLocalStorage();
        return {
          success: true,
          source: 'supabase',
          data: {
            positions: this.openPositions.length,
            history: this.tradeHistory.length,
            balance: this.balance,
          },
        };
      }

      console.log('[PaperTrade] Cloud had no data, checking local storage...');

      // 2. Try user-specific storage first
      const STORAGE_KEYS = getStorageKeys(userId);
      const [usPositions, usPending, usHistory, usBalance, usInitBalance] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.POSITIONS),
        AsyncStorage.getItem(STORAGE_KEYS.PENDING),
        AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.BALANCE),
        AsyncStorage.getItem(STORAGE_KEYS.INITIAL_BALANCE),
      ]);

      // Parse user-specific data
      let userPositions = [];
      let userPending = [];
      let userHistory = [];
      let userBalance = null;
      let userInitBalance = null;

      try {
        userPositions = usPositions ? JSON.parse(usPositions) : [];
        userPending = usPending ? JSON.parse(usPending) : [];
        userHistory = usHistory ? JSON.parse(usHistory) : [];
        userBalance = usBalance ? parseFloat(usBalance) : null;
        userInitBalance = usInitBalance ? parseFloat(usInitBalance) : null;
      } catch (parseError) {
        console.log('[PaperTrade] Error parsing user-specific storage:', parseError);
      }

      const hasUserData = userPositions.length > 0 || userHistory.length > 0 || userBalance !== null;

      if (hasUserData) {
        console.log('[PaperTrade] Found user-specific data:', {
          positions: userPositions.length,
          pending: userPending.length,
          history: userHistory.length,
          balance: userBalance,
        });

        this.openPositions = userPositions;
        this.pendingOrders = userPending;
        this.tradeHistory = userHistory;
        this.balance = userBalance || DEFAULT_INITIAL_BALANCE;
        this.initialBalance = userInitBalance || DEFAULT_INITIAL_BALANCE;
        this.currentUserId = userId;

        // Sync to cloud
        await this._syncAllToCloud(userId);

        return {
          success: true,
          source: 'user_specific_storage',
          data: {
            positions: this.openPositions.length,
            pending: this.pendingOrders.length,
            history: this.tradeHistory.length,
            balance: this.balance,
          },
          syncedToCloud: true,
        };
      }

      // 3. Try legacy storage
      console.log('[PaperTrade] Checking legacy storage...');
      const [legPositions, legPending, legHistory, legBalance, legInitBalance] = await Promise.all([
        AsyncStorage.getItem(LEGACY_STORAGE_KEYS.POSITIONS),
        AsyncStorage.getItem(LEGACY_STORAGE_KEYS.PENDING),
        AsyncStorage.getItem(LEGACY_STORAGE_KEYS.HISTORY),
        AsyncStorage.getItem(LEGACY_STORAGE_KEYS.BALANCE),
        AsyncStorage.getItem(LEGACY_STORAGE_KEYS.INITIAL_BALANCE),
      ]);

      // Parse legacy data
      let legacyPositions = [];
      let legacyPending = [];
      let legacyHistory = [];
      let legacyBalance = null;
      let legacyInitBalance = null;

      try {
        legacyPositions = legPositions ? JSON.parse(legPositions) : [];
        legacyPending = legPending ? JSON.parse(legPending) : [];
        legacyHistory = legHistory ? JSON.parse(legHistory) : [];
        legacyBalance = legBalance ? parseFloat(legBalance) : null;
        legacyInitBalance = legInitBalance ? parseFloat(legInitBalance) : null;
      } catch (parseError) {
        console.log('[PaperTrade] Error parsing legacy storage:', parseError);
      }

      console.log('[PaperTrade] Legacy storage contents:', {
        positionsRaw: legPositions,
        historyRaw: legHistory,
        balanceRaw: legBalance,
        positions: legacyPositions.length,
        history: legacyHistory.length,
        balance: legacyBalance,
      });

      // Check if legacy has actual data (not just empty arrays or default balance)
      const hasLegacyTradeData = legacyPositions.length > 0 || legacyHistory.length > 0;
      const hasLegacyBalanceData = legacyBalance !== null && legacyBalance !== DEFAULT_INITIAL_BALANCE;

      if (hasLegacyTradeData || hasLegacyBalanceData) {
        console.log('[PaperTrade] Found legacy data, restoring...');

        this.openPositions = legacyPositions;
        this.pendingOrders = legacyPending;
        this.tradeHistory = legacyHistory;
        this.balance = legacyBalance || DEFAULT_INITIAL_BALANCE;
        this.initialBalance = legacyInitBalance || DEFAULT_INITIAL_BALANCE;
        this.currentUserId = userId;

        // Save to user-specific storage
        await this.saveToLocalStorage();

        // Sync to cloud
        await this._syncAllToCloud(userId);

        return {
          success: true,
          source: 'legacy_storage',
          data: {
            positions: this.openPositions.length,
            pending: this.pendingOrders.length,
            history: this.tradeHistory.length,
            balance: this.balance,
          },
          syncedToCloud: true,
        };
      }

      // 4. Check if we at least have balance data (no trades but customized balance)
      if (legacyBalance !== null || userBalance !== null) {
        const restoredBalance = legacyBalance || userBalance || DEFAULT_INITIAL_BALANCE;
        const restoredInitBalance = legacyInitBalance || userInitBalance || DEFAULT_INITIAL_BALANCE;

        console.log('[PaperTrade] Found balance settings, restoring...');

        this.openPositions = [];
        this.pendingOrders = [];
        this.tradeHistory = [];
        this.balance = restoredBalance;
        this.initialBalance = restoredInitBalance;
        this.currentUserId = userId;

        await this.saveToLocalStorage();
        await this.syncSettingsToSupabase(userId);

        return {
          success: true,
          source: 'balance_only',
          data: {
            positions: 0,
            pending: 0,
            history: 0,
            balance: this.balance,
          },
          note: 'Only balance settings were recovered (no trade data found)',
        };
      }

      return {
        success: false,
        error: 'Không tìm thấy dữ liệu giao dịch trong bất kỳ nguồn lưu trữ nào',
      };

    } catch (error) {
      console.error('[PaperTrade] Recovery error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Sync all data to Supabase
   * @private
   */
  async _syncAllToCloud(userId) {
    try {
      // Sync settings first
      await this.syncSettingsToSupabase(userId);

      // Sync open positions
      for (const pos of this.openPositions) {
        pos.userId = userId;
        await this.syncPositionToSupabase(pos, 'INSERT');
      }

      // Sync pending orders
      for (const order of this.pendingOrders) {
        order.userId = userId;
        await this.syncPositionToSupabase(order, 'INSERT');
      }

      // Sync trade history
      for (const trade of this.tradeHistory) {
        trade.userId = userId;
        await this.syncPositionToSupabase(trade, 'INSERT');
      }

      console.log('[PaperTrade] All data synced to cloud');
    } catch (error) {
      console.log('[PaperTrade] Cloud sync during recovery failed:', error.message);
    }
  }

  /**
   * Map database row to local position object
   */
  mapFromSupabase(data) {
    // Parse pattern_data if it's a string
    let patternData = null;
    if (data.pattern_data) {
      try {
        patternData = typeof data.pattern_data === 'string'
          ? JSON.parse(data.pattern_data)
          : data.pattern_data;
      } catch (e) {
        patternData = null;
      }
    }

    // Normalize symbol: ensure it ends with 'USDT' (Rule 11: Format Normalization)
    const normalizedSymbol = data.symbol && !data.symbol.endsWith('USDT')
      ? data.symbol + 'USDT'
      : data.symbol;

    return {
      id: data.id,
      userId: data.user_id,
      symbol: normalizedSymbol,
      baseAsset: normalizedSymbol?.replace('USDT', ''),
      direction: data.direction,
      patternType: data.pattern_type,
      timeframe: data.timeframe,
      entryPrice: parseFloat(data.entry_price) || 0,
      // FIX 5: Preserve null for SL/TP — parseFloat(null) || 0 produces 0,
      // which triggers false positive in updatePrices() (currentPrice >= 0 → always true)
      stopLoss: data.stop_loss != null ? parseFloat(data.stop_loss) : null,
      takeProfit: data.take_profit != null ? parseFloat(data.take_profit) : null,
      positionSize: parseFloat(data.position_size) || 0,
      margin: parseFloat(data.margin) || parseFloat(data.position_size) || 0,
      positionValue: parseFloat(data.position_value) || 0,
      quantity: parseFloat(data.quantity) || 0,
      leverage: data.leverage || 10,
      confidence: data.confidence || 75,
      status: data.status,
      orderType: data.order_type || 'MARKET',
      openedAt: data.opened_at,
      closedAt: data.closed_at,
      pendingAt: data.pending_at,
      filledAt: data.filled_at,
      cancelledAt: data.cancelled_at,
      exitPrice: parseFloat(data.exit_price) || null,
      exitReason: data.exit_reason,
      realizedPnL: parseFloat(data.realized_pnl) || 0,
      realizedPnLPercent: parseFloat(data.realized_pnl_percent) || 0,
      result: data.result,
      holdingTime: data.holding_time,
      // P6 FIX #4: Don't set currentPrice to entryPrice — causes $0 PNL flash on restart
      // Leave at 0, monitoring will update within 5s
      currentPrice: parseFloat(data.current_price) || 0,
      unrealizedPnL: parseFloat(data.unrealized_pnl) || 0,
      unrealizedPnLPercent: parseFloat(data.unrealized_pnl_percent) || 0,
      // Dual Mode fields
      tradeMode: data.trade_mode || 'pattern',
      patternEntryOriginal: parseFloat(data.pattern_entry) || null,
      patternSLOriginal: parseFloat(data.pattern_sl) || null,
      patternTPOriginal: parseFloat(data.pattern_tp) || null,
      entryDeviationPercent: parseFloat(data.entry_deviation_percent) || 0,
      slDeviationPercent: parseFloat(data.sl_deviation_percent) || 0,
      tpDeviationPercent: parseFloat(data.tp_deviation_percent) || 0,
      aiScore: data.ai_score || 0,
      aiFeedback: data.ai_feedback,
      patternData: patternData,
      source: 'PATTERN_SCANNER',
    };
  }
}

// Export singleton instance
const paperTradeService = new PaperTradeService();
export default paperTradeService;
