/**
 * ScannerStateContext - Unified State Manager cho Scanner
 *
 * FEATURES:
 * - Centralized state management
 * - Selective re-renders voi useScannerSelector
 * - Persistence across screens
 * - Integration voi optimization services
 *
 * USAGE:
 * // Wrap app or Scanner navigator
 * <ScannerStateProvider>
 *   <ScannerScreen />
 * </ScannerStateProvider>
 *
 * // In components
 * const { patterns, isScanning } = useScannerState();
 * const actions = useScannerActions();
 * actions.startScan();
 *
 * // Selective updates (prevents unnecessary re-renders)
 * const patterns = useScannerSelector(state => state.patterns);
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import optimization services
import { patternEnricher } from '../services/scanner/patternEnricherService';
import { patternCache } from '../services/scanner/patternCacheService';
import { opposingMapper } from '../services/scanner/opposingMapperService';
import { wsPool } from '../services/scanner/webSocketPoolService';
import { haptic } from '../services/hapticService';

// Storage key for persistence
const STORAGE_KEY = '@scanner_state_v2';

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  // === SCAN STATE ===
  isScanning: false,
  scanProgress: 0,
  scanTotal: 0,
  currentScanSymbol: '',
  scanStartTime: null,

  // === RESULTS ===
  patterns: [],
  resultsPerCoin: [],
  selectedPattern: null,
  patternsFound: 0,

  // === FILTERS ===
  filters: {
    minRR: 2.0,
    direction: 'all', // 'all', 'bullish', 'bearish'
    timeframes: ['1h', '4h'],
    patternTypes: [], // Empty = all types
    minConfidence: 0.6,
  },

  // === ZONES ===
  zones: [],
  selectedZone: null,
  selectedZonePatternId: null,
  zoneDisplayMode: 'all', // 'all', 'selected', 'hidden'
  zonePreferences: {
    opacity: 0.3,
    showLabels: true,
    showEntry: true,
    showSL: true,
    showTP: true,
  },

  // === POSITIONS ===
  openPositions: [],
  pendingOrders: [],

  // === PRICES (from WebSocket) ===
  prices: {},

  // === SELECTED ITEMS ===
  selectedCoins: [],
  selectedTimeframe: '4h',
  selectedScanTimeframes: ['1h', '4h'],

  // === UI STATE ===
  chartReady: false,
  showZones: true,
  showOrderLines: true,
  loading: false,

  // === META ===
  lastScanTime: null,
  error: null,
  initialized: false,
};

// =====================================================
// ACTION TYPES
// =====================================================

const ActionTypes = {
  // Scan
  SET_SCANNING: 'SET_SCANNING',
  UPDATE_SCAN_PROGRESS: 'UPDATE_SCAN_PROGRESS',
  SCAN_COMPLETE: 'SCAN_COMPLETE',

  // Results
  SET_PATTERNS: 'SET_PATTERNS',
  ADD_PATTERNS: 'ADD_PATTERNS',
  SELECT_PATTERN: 'SELECT_PATTERN',
  CLEAR_PATTERNS: 'CLEAR_PATTERNS',

  // Filters
  SET_FILTERS: 'SET_FILTERS',
  RESET_FILTERS: 'RESET_FILTERS',

  // Zones
  SET_ZONES: 'SET_ZONES',
  SELECT_ZONE: 'SELECT_ZONE',
  SET_ZONE_DISPLAY_MODE: 'SET_ZONE_DISPLAY_MODE',
  SET_ZONE_PREFERENCES: 'SET_ZONE_PREFERENCES',

  // Positions
  SET_POSITIONS: 'SET_POSITIONS',
  UPDATE_POSITION: 'UPDATE_POSITION',
  REMOVE_POSITION: 'REMOVE_POSITION',

  // Prices
  UPDATE_PRICES: 'UPDATE_PRICES',

  // Selection
  SET_SELECTED_COINS: 'SET_SELECTED_COINS',
  SET_SELECTED_TIMEFRAME: 'SET_SELECTED_TIMEFRAME',
  SET_SELECTED_SCAN_TIMEFRAMES: 'SET_SELECTED_SCAN_TIMEFRAMES',

  // UI
  SET_CHART_READY: 'SET_CHART_READY',
  SET_LOADING: 'SET_LOADING',
  TOGGLE_ZONES: 'TOGGLE_ZONES',
  TOGGLE_ORDER_LINES: 'TOGGLE_ORDER_LINES',

  // Meta
  SET_ERROR: 'SET_ERROR',
  RESTORE_STATE: 'RESTORE_STATE',
  RESET: 'RESET',
};

// =====================================================
// REDUCER
// =====================================================

function scannerReducer(state, action) {
  switch (action.type) {
    // === SCAN ===
    case ActionTypes.SET_SCANNING:
      return {
        ...state,
        isScanning: action.payload,
        scanProgress: action.payload ? 0 : state.scanProgress,
        scanStartTime: action.payload ? Date.now() : null,
        error: null,
      };

    case ActionTypes.UPDATE_SCAN_PROGRESS:
      return {
        ...state,
        scanProgress: action.payload.progress,
        scanTotal: action.payload.total,
        currentScanSymbol: action.payload.symbol || state.currentScanSymbol,
        patternsFound: action.payload.patternsFound ?? state.patternsFound,
      };

    case ActionTypes.SCAN_COMPLETE:
      return {
        ...state,
        isScanning: false,
        lastScanTime: Date.now(),
        scanStartTime: null,
      };

    // === RESULTS ===
    case ActionTypes.SET_PATTERNS:
      return {
        ...state,
        patterns: action.payload.patterns || [],
        resultsPerCoin: action.payload.resultsPerCoin || [],
        patternsFound: action.payload.patterns?.length || 0,
        lastScanTime: Date.now(),
      };

    case ActionTypes.ADD_PATTERNS:
      return {
        ...state,
        patterns: [...state.patterns, ...(action.payload || [])],
        patternsFound: state.patterns.length + (action.payload?.length || 0),
      };

    case ActionTypes.SELECT_PATTERN:
      return {
        ...state,
        selectedPattern: action.payload,
        selectedZonePatternId: action.payload?.pattern_id || action.payload?.id || null,
      };

    case ActionTypes.CLEAR_PATTERNS:
      return {
        ...state,
        patterns: [],
        resultsPerCoin: [],
        patternsFound: 0,
        selectedPattern: null,
        selectedZonePatternId: null,
      };

    // === FILTERS ===
    case ActionTypes.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case ActionTypes.RESET_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
      };

    // === ZONES ===
    case ActionTypes.SET_ZONES:
      return {
        ...state,
        zones: action.payload || [],
      };

    case ActionTypes.SELECT_ZONE:
      return {
        ...state,
        selectedZone: action.payload,
        selectedZonePatternId: action.payload?.pattern_id || action.payload?.id || null,
      };

    case ActionTypes.SET_ZONE_DISPLAY_MODE:
      return {
        ...state,
        zoneDisplayMode: action.payload,
      };

    case ActionTypes.SET_ZONE_PREFERENCES:
      return {
        ...state,
        zonePreferences: { ...state.zonePreferences, ...action.payload },
      };

    // === POSITIONS ===
    case ActionTypes.SET_POSITIONS:
      return {
        ...state,
        openPositions: action.payload.positions ?? state.openPositions,
        pendingOrders: action.payload.orders ?? state.pendingOrders,
      };

    case ActionTypes.UPDATE_POSITION:
      return {
        ...state,
        openPositions: state.openPositions.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      };

    case ActionTypes.REMOVE_POSITION:
      return {
        ...state,
        openPositions: state.openPositions.filter(p => p.id !== action.payload),
      };

    // === PRICES ===
    case ActionTypes.UPDATE_PRICES:
      return {
        ...state,
        prices: { ...state.prices, ...action.payload },
      };

    // === SELECTION ===
    case ActionTypes.SET_SELECTED_COINS:
      return {
        ...state,
        selectedCoins: action.payload || [],
      };

    case ActionTypes.SET_SELECTED_TIMEFRAME:
      return {
        ...state,
        selectedTimeframe: action.payload,
      };

    case ActionTypes.SET_SELECTED_SCAN_TIMEFRAMES:
      return {
        ...state,
        selectedScanTimeframes: action.payload || ['1h', '4h'],
      };

    // === UI ===
    case ActionTypes.SET_CHART_READY:
      return {
        ...state,
        chartReady: action.payload,
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ActionTypes.TOGGLE_ZONES:
      return {
        ...state,
        showZones: action.payload ?? !state.showZones,
      };

    case ActionTypes.TOGGLE_ORDER_LINES:
      return {
        ...state,
        showOrderLines: action.payload ?? !state.showOrderLines,
      };

    // === META ===
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isScanning: false,
      };

    case ActionTypes.RESTORE_STATE:
      return {
        ...state,
        ...action.payload,
        initialized: true,
        isScanning: false, // Never restore scanning state
      };

    case ActionTypes.RESET:
      return {
        ...initialState,
        filters: state.filters, // Preserve filters
        selectedCoins: state.selectedCoins, // Preserve coins
        initialized: true,
      };

    default:
      return state;
  }
}

// =====================================================
// CONTEXTS
// =====================================================

const ScannerStateContext = createContext(null);
const ScannerDispatchContext = createContext(null);

// =====================================================
// PROVIDER
// =====================================================

export function ScannerStateProvider({ children }) {
  const [state, dispatch] = useReducer(scannerReducer, initialState);

  // Restore state from storage on mount
  useEffect(() => {
    const restoreState = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Only restore certain fields
          dispatch({
            type: ActionTypes.RESTORE_STATE,
            payload: {
              selectedCoins: parsed.selectedCoins || [],
              selectedTimeframe: parsed.selectedTimeframe || '4h',
              selectedScanTimeframes: parsed.selectedScanTimeframes || ['1h', '4h'],
              filters: parsed.filters || initialState.filters,
              zonePreferences: parsed.zonePreferences || initialState.zonePreferences,
              showZones: parsed.showZones ?? true,
              showOrderLines: parsed.showOrderLines ?? true,
            },
          });
        } else {
          dispatch({ type: ActionTypes.RESTORE_STATE, payload: {} });
        }
      } catch (e) {
        console.error('[ScannerState] Restore error:', e);
        dispatch({ type: ActionTypes.RESTORE_STATE, payload: {} });
      }
    };

    restoreState();
  }, []);

  // Persist state to storage on changes
  useEffect(() => {
    if (!state.initialized) return;

    const saveState = async () => {
      try {
        const toSave = {
          selectedCoins: state.selectedCoins,
          selectedTimeframe: state.selectedTimeframe,
          selectedScanTimeframes: state.selectedScanTimeframes,
          filters: state.filters,
          zonePreferences: state.zonePreferences,
          showZones: state.showZones,
          showOrderLines: state.showOrderLines,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (e) {
        console.error('[ScannerState] Save error:', e);
      }
    };

    // Debounce save
    const timeout = setTimeout(saveState, 500);
    return () => clearTimeout(timeout);
  }, [
    state.initialized,
    state.selectedCoins,
    state.selectedTimeframe,
    state.selectedScanTimeframes,
    state.filters,
    state.zonePreferences,
    state.showZones,
    state.showOrderLines,
  ]);

  // Memoize values
  const stateValue = useMemo(() => state, [state]);
  const dispatchValue = useMemo(() => dispatch, []);

  return (
    <ScannerStateContext.Provider value={stateValue}>
      <ScannerDispatchContext.Provider value={dispatchValue}>
        {children}
      </ScannerDispatchContext.Provider>
    </ScannerStateContext.Provider>
  );
}

// =====================================================
// HOOKS
// =====================================================

/**
 * Get full scanner state
 */
export function useScannerState() {
  const context = useContext(ScannerStateContext);
  if (!context) {
    throw new Error('useScannerState must be used within ScannerStateProvider');
  }
  return context;
}

/**
 * Get dispatch function
 */
export function useScannerDispatch() {
  const context = useContext(ScannerDispatchContext);
  if (!context) {
    throw new Error('useScannerDispatch must be used within ScannerStateProvider');
  }
  return context;
}

/**
 * Selective state selector (prevents unnecessary re-renders)
 * @param {function} selector - (state) => value
 */
export function useScannerSelector(selector) {
  const state = useScannerState();
  return useMemo(() => selector(state), [state, selector]);
}

/**
 * Action creators
 */
export function useScannerActions() {
  const dispatch = useScannerDispatch();

  return useMemo(() => ({
    // === SCAN ACTIONS ===
    startScan: () => {
      haptic.mediumTap();
      dispatch({ type: ActionTypes.SET_SCANNING, payload: true });
    },

    stopScan: () => {
      dispatch({ type: ActionTypes.SET_SCANNING, payload: false });
    },

    updateProgress: (progress, total, symbol, patternsFound) => {
      dispatch({
        type: ActionTypes.UPDATE_SCAN_PROGRESS,
        payload: { progress, total, symbol, patternsFound },
      });
    },

    completeScan: () => {
      haptic.scanComplete();
      dispatch({ type: ActionTypes.SCAN_COMPLETE });
    },

    // === PATTERN ACTIONS ===
    setPatterns: (patterns, resultsPerCoin) => {
      // Use patternEnricher for consistent enrichment
      const enriched = patternEnricher.enrichPatterns(
        patterns,
        patterns[0]?.symbol || 'UNKNOWN'
      );

      // Build opposing map for TP optimization
      opposingMapper.buildMaps(enriched);

      dispatch({
        type: ActionTypes.SET_PATTERNS,
        payload: { patterns: enriched, resultsPerCoin },
      });
    },

    addPatterns: (patterns) => {
      dispatch({ type: ActionTypes.ADD_PATTERNS, payload: patterns });
    },

    selectPattern: (pattern) => {
      haptic.lightTap();
      dispatch({ type: ActionTypes.SELECT_PATTERN, payload: pattern });
    },

    clearPatterns: () => {
      patternCache.clear();
      patternEnricher.clearCache();
      opposingMapper.clear();
      dispatch({ type: ActionTypes.CLEAR_PATTERNS });
    },

    // === FILTER ACTIONS ===
    setFilters: (filters) => {
      haptic.filterChanged();
      dispatch({ type: ActionTypes.SET_FILTERS, payload: filters });
    },

    resetFilters: () => {
      dispatch({ type: ActionTypes.RESET_FILTERS });
    },

    // === ZONE ACTIONS ===
    setZones: (zones) => {
      dispatch({ type: ActionTypes.SET_ZONES, payload: zones });
    },

    selectZone: (zone) => {
      haptic.zoneTapped();
      dispatch({ type: ActionTypes.SELECT_ZONE, payload: zone });
    },

    setZoneDisplayMode: (mode) => {
      dispatch({ type: ActionTypes.SET_ZONE_DISPLAY_MODE, payload: mode });
    },

    setZonePreferences: (prefs) => {
      dispatch({ type: ActionTypes.SET_ZONE_PREFERENCES, payload: prefs });
    },

    // === POSITION ACTIONS ===
    setPositions: (positions, orders) => {
      dispatch({
        type: ActionTypes.SET_POSITIONS,
        payload: { positions, orders },
      });
    },

    updatePosition: (position) => {
      dispatch({ type: ActionTypes.UPDATE_POSITION, payload: position });
    },

    removePosition: (positionId) => {
      dispatch({ type: ActionTypes.REMOVE_POSITION, payload: positionId });
    },

    // === PRICE ACTIONS ===
    updatePrices: (prices) => {
      dispatch({ type: ActionTypes.UPDATE_PRICES, payload: prices });
    },

    // === SELECTION ACTIONS ===
    setSelectedCoins: (coins) => {
      dispatch({ type: ActionTypes.SET_SELECTED_COINS, payload: coins });
    },

    setSelectedTimeframe: (tf) => {
      dispatch({ type: ActionTypes.SET_SELECTED_TIMEFRAME, payload: tf });
    },

    setSelectedScanTimeframes: (tfs) => {
      dispatch({ type: ActionTypes.SET_SELECTED_SCAN_TIMEFRAMES, payload: tfs });
    },

    // === UI ACTIONS ===
    setChartReady: (ready) => {
      dispatch({ type: ActionTypes.SET_CHART_READY, payload: ready });
    },

    setLoading: (loading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
    },

    toggleZones: (show) => {
      dispatch({ type: ActionTypes.TOGGLE_ZONES, payload: show });
    },

    toggleOrderLines: (show) => {
      dispatch({ type: ActionTypes.TOGGLE_ORDER_LINES, payload: show });
    },

    // === META ACTIONS ===
    setError: (error) => {
      haptic.error();
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    },

    reset: () => {
      dispatch({ type: ActionTypes.RESET });
    },
  }), [dispatch]);
}

// =====================================================
// COMPUTED SELECTORS
// =====================================================

/**
 * Get filtered patterns based on current filters
 */
export function useFilteredPatterns() {
  const state = useScannerState();

  return useMemo(() => {
    const { patterns, filters } = state;

    if (!patterns || patterns.length === 0) return [];

    return patterns.filter(p => {
      // Direction filter
      if (filters.direction !== 'all') {
        const dir = p.direction?.toLowerCase() || '';
        if (filters.direction === 'bullish' && !dir.includes('bull')) return false;
        if (filters.direction === 'bearish' && !dir.includes('bear')) return false;
      }

      // Min R:R filter
      const rr = p.riskRewardRatio || p.rrRatio || 0;
      if (rr < filters.minRR) return false;

      // Min confidence filter
      const conf = p.confidence || 0;
      if (conf < filters.minConfidence) return false;

      // Timeframe filter
      if (filters.timeframes.length > 0) {
        const tf = p.timeframe || p.tf || '';
        if (!filters.timeframes.includes(tf)) return false;
      }

      // Pattern type filter
      if (filters.patternTypes.length > 0) {
        const type = p.type || p.pattern_type || '';
        if (!filters.patternTypes.includes(type)) return false;
      }

      return true;
    });
  }, [state.patterns, state.filters]);
}

/**
 * Get scan progress percentage
 */
export function useScanProgress() {
  const state = useScannerState();

  return useMemo(() => {
    const { scanProgress, scanTotal, scanStartTime, currentScanSymbol, patternsFound } = state;

    const percent = scanTotal > 0 ? (scanProgress / scanTotal) * 100 : 0;

    return {
      progress: scanProgress,
      total: scanTotal,
      percent,
      symbol: currentScanSymbol,
      patternsFound,
      startTime: scanStartTime,
    };
  }, [state.scanProgress, state.scanTotal, state.scanStartTime, state.currentScanSymbol, state.patternsFound]);
}

// =====================================================
// EXPORTS
// =====================================================

export default ScannerStateProvider;
