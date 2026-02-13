/**
 * Core Type Definitions for Crypto Pattern Scanner
 *
 * This file contains all the shared type definitions used across the application.
 */

// ═══════════════════════════════════════════════════════════════════════════
// USER & AUTHENTICATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Tier levels for subscription features */
export type TierLevel = 'FREE' | 'TIER1' | 'TIER2' | 'TIER3' | 'free' | 'tier1' | 'tier2' | 'tier3';

/** User profile from Supabase */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  scan_count: number;
  last_scan_at: string | null;
  created_at: string;
  updated_at: string;
  /** @deprecated Use specific tier fields instead */
  tier?: TierLevel;
  /** @deprecated Use specific tier expiry fields instead */
  tier_expires_at?: string | null;
  role?: 'admin' | 'user';
  course_tier: TierLevel;
  scanner_tier: TierLevel;
  chatbot_tier: TierLevel;
  course_tier_expires_at: string | null;
  scanner_tier_expires_at: string | null;
  chatbot_tier_expires_at: string | null;
}

/** Supabase Auth User type */
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    [key: string]: unknown;
  };
  app_metadata?: Record<string, unknown>;
  aud?: string;
  created_at?: string;
}

/** Auth state returned from auth hooks/context */
export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

/** Auth operation result */
export interface AuthResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error | string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// CANDLESTICK & CHART TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** OHLCV Candlestick data */
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/** Timeframe intervals */
export type Timeframe = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';

/** Timeframe display values (uppercase format) */
export type TimeframeDisplay = '1M' | '5M' | '15M' | '30M' | '1H' | '4H' | '1D' | '1W';

/** WebSocket connection states */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'failed';

// ═══════════════════════════════════════════════════════════════════════════
// PATTERN TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Pattern type codes */
export type PatternCode =
  | 'DPD' | 'UPU' | 'UPD' | 'DPU'
  | 'H&S' | 'IH&S'
  | 'Double Top' | 'Double Bottom'
  | 'Triple Top' | 'Triple Bottom'
  | 'Ascending Triangle' | 'Descending Triangle' | 'Symmetrical Triangle' | 'Triangle'
  | 'Rising Wedge' | 'Falling Wedge'
  | 'Bull Flag' | 'Bear Flag'
  | 'Cup and Handle'
  | 'Rounding Bottom'
  | 'Head and Shoulders' | 'Inverse Head and Shoulders';

/** Detected pattern result */
export interface DetectedPattern {
  id: string;
  coin: string;
  pattern: PatternCode;
  patternName: string;
  confidence: number;
  timeframe: Timeframe | TimeframeDisplay;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  detectedAt: string;
}

/** Pattern scan filters */
export interface ScanFilters {
  coins: string[];
  timeframe: Timeframe | TimeframeDisplay;
  pattern?: PatternCode | 'All';
  patternFilter?: PatternCode | 'All';
}

/** Saved pattern alert */
export interface PatternAlert {
  id: number;
  coin: string;
  pattern_type: PatternCode;
  timeframe: Timeframe | TimeframeDisplay;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  confidence: number;
  detected_at: string;
  saved_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// PORTFOLIO TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Entry type for trade classification */
export type EntryType = 'RETEST' | 'BREAKOUT' | 'OTHER';

/** Transaction type */
export type TransactionType = 'BUY' | 'SELL';

/** Zone status at entry */
export type ZoneStatus = 'Fresh' | 'Tested' | 'Broken' | null;

/** Confirmation candlestick types */
export type ConfirmationType = 'PIN_BAR' | 'HAMMER' | 'ENGULFING' | 'DOJI' | 'MARUBOZU' | null;

/** Portfolio holding (open position) */
export interface PortfolioHolding {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  avg_entry_price: number;
  current_price: number;
  total_cost: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** New holding input data */
export interface NewHoldingInput {
  symbol: string;
  quantity: number;
  avg_entry_price: number;
  current_price?: number;
  notes?: string;
  entry_type?: EntryType;
  pattern_type?: PatternCode | null;
  zone_status_at_entry?: ZoneStatus;
  confirmation_type?: ConfirmationType;
}

/** Portfolio transaction (trade history) */
export interface PortfolioTransaction {
  id: string;
  user_id: string;
  symbol: string;
  transaction_type: TransactionType;
  quantity: number;
  price: number;
  total_amount: number;
  fees: number;
  entry_type: EntryType;
  pattern_type: PatternCode | null;
  zone_status_at_entry: ZoneStatus;
  confirmation_type: ConfirmationType;
  risk_reward_ratio: number | null;
  realized_pnl: number | null;
  realized_pnl_percent: number | null;
  notes: string | null;
  transaction_at: string;
  created_at: string;
}

/** New transaction input data */
export interface NewTransactionInput {
  symbol: string;
  transaction_type: TransactionType;
  quantity: number;
  price: number;
  fees?: number;
  entry_type?: EntryType;
  pattern_type?: PatternCode | null;
  zone_status_at_entry?: ZoneStatus;
  confirmation_type?: ConfirmationType;
  risk_reward_ratio?: number | null;
  realized_pnl?: number | null;
  realized_pnl_percent?: number | null;
  notes?: string | null;
}

/** Transaction filter options */
export interface TransactionFilters {
  symbol?: string;
  transaction_type?: TransactionType;
  entry_type?: EntryType;
  limit?: number;
}

/** Portfolio statistics */
export interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPercent: number;
  holdingsCount: number;
  topGainer: PortfolioHolding | null;
  topLoser: PortfolioHolding | null;
  holdings?: PortfolioHolding[];
}

/** Entry type performance stats */
export interface EntryTypeStats {
  trades: number;
  winRate: number;
  avgPnl: number;
  avgRR: number;
  totalProfit: number;
  wins?: number;
  losses?: number;
}

/** Entry type analytics data */
export interface EntryTypeAnalytics {
  retest: EntryTypeStats;
  breakout: EntryTypeStats;
  other: EntryTypeStats;
  overall: {
    trades: number;
    winRate: number;
    avgPnl: number;
    totalProfit: number;
  };
  recommendation: string;
  comparisonData?: Array<{
    type: EntryType;
    winRate: number;
    avgPnl: number;
    trades: number;
  }>;
}

/** Entry type distribution for charts */
export interface EntryTypeDistribution {
  type: EntryType;
  count: number;
  percentage: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRADING JOURNAL TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Trading journal entry */
export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  entry_date: string;
  created_at: string;
  updated_at: string;
}

/** New journal entry input */
export interface NewJournalEntryInput {
  title: string;
  content: string;
  tags?: string[];
  date?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TICKER & PRICE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** 24h ticker data */
export interface TickerData {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

/** Price update from WebSocket */
export interface PriceUpdate {
  coin: string;
  price: number;
  change24h: number;
}

/** Price update for holdings */
export interface HoldingPriceUpdate {
  symbol: string;
  price: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Generic API response wrapper */
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

/** Success response with data */
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

/** Error response */
export interface ErrorResponse {
  success: false;
  error: string;
}

/** Operation result (for delete, update operations) */
export interface OperationResult {
  success: boolean;
  error: Error | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// QUOTA TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Daily scan quota record */
export interface DailyScanQuota {
  user_id: string;
  scan_count: number;
  max_scans: number;
  last_reset_at?: string;
}

/** Quota status */
export interface QuotaStatus {
  used: number;
  remaining: number;
  total: number;
  isUnlimited: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// WEBSOCKET CALLBACK TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Callback for candle updates */
export type CandleUpdateCallback = (candle: Candle, isClosed: boolean) => void;

/** Callback for connection state changes */
export type ConnectionStateCallback = (state: ConnectionState) => void;

/** Callback for ticker updates */
export type TickerUpdateCallback = (ticker: TickerData) => void;

/** Callback for price updates */
export type PriceUpdateCallback = (update: PriceUpdate) => void;

/** Callback for pattern detection */
export type PatternDetectedCallback = (pattern: DetectedPattern) => void;

/** Error callback */
export type ErrorCallback = (error: Error) => void;
