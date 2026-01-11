/**
 * GEM Scanner - Trading Constants
 * Constants for Paper Trade Custom Mode (Binance Futures style)
 */

import {
  MinusCircle,
  Zap,
  ShieldAlert,
  ShieldCheck,
  BarChart3,
  DollarSign,
} from 'lucide-react-native';
import { COLORS } from '../utils/tokens';

// ═══════════════════════════════════════════════════════════
// ORDER TYPES
// ═══════════════════════════════════════════════════════════

export const ORDER_TYPES = {
  LIMIT: {
    id: 'limit',
    name: 'Limit',
    nameVi: 'Giới hạn',
    icon: MinusCircle,
    description: 'Mua hoặc bán ở một mức giá cụ thể hoặc mức giá tốt hơn',
    descriptionEn: 'Buy or sell at a specific price or better',
    color: COLORS.gold,
    requiresPrice: true,
    requiresStopPrice: false,
    isMaker: true,
    feeType: 'maker',
  },
  MARKET: {
    id: 'market',
    name: 'Market',
    nameVi: 'Thị trường',
    icon: Zap,
    description: 'Mua hoặc bán ở mức giá thị trường tốt nhất hiện có',
    descriptionEn: 'Buy or sell at the best available market price',
    color: COLORS.cyan,
    requiresPrice: false,
    requiresStopPrice: false,
    isMaker: false,
    feeType: 'taker',
  },
  STOP_LIMIT: {
    id: 'stop_limit',
    name: 'Stop Limit',
    nameVi: 'Stop Limit',
    icon: ShieldAlert,
    description: 'Kích hoạt Lệnh Limit khi đạt đến Giá dừng',
    descriptionEn: 'Activate Limit order when Stop price is reached',
    color: COLORS.warning,
    requiresPrice: true,
    requiresStopPrice: true,
    isMaker: true,
    feeType: 'maker',
  },
  STOP_MARKET: {
    id: 'stop_market',
    name: 'Stop Market',
    nameVi: 'Stop Market',
    icon: ShieldCheck,
    description: 'Kích hoạt Lệnh Thị trường khi đạt đến Giá dừng',
    descriptionEn: 'Activate Market order when Stop price is reached',
    color: COLORS.error,
    requiresPrice: false,
    requiresStopPrice: true,
    isMaker: false,
    feeType: 'taker',
  },
};

// Order type array for iteration
export const ORDER_TYPE_LIST = [
  ORDER_TYPES.LIMIT,
  ORDER_TYPES.MARKET,
  ORDER_TYPES.STOP_LIMIT,
  ORDER_TYPES.STOP_MARKET,
];

// ═══════════════════════════════════════════════════════════
// MARGIN MODES
// ═══════════════════════════════════════════════════════════

export const MARGIN_MODES = {
  CROSS: {
    id: 'cross',
    name: 'Cross',
    nameVi: 'Chéo',
    description: 'Dùng toàn bộ số dư làm margin',
    descriptionEn: 'Uses entire balance as margin',
    warning: 'Rủi ro thanh lý toàn bộ tài khoản',
    warningEn: 'Risk of liquidating entire account',
    color: COLORS.warning,
  },
  ISOLATED: {
    id: 'isolated',
    name: 'Isolated',
    nameVi: 'Độc lập',
    description: 'Chỉ dùng margin được chỉ định',
    descriptionEn: 'Uses only assigned margin',
    warning: 'Chỉ mất margin của vị thế này',
    warningEn: 'Only loses this position margin',
    color: COLORS.success,
    isRecommended: true,
  },
};

// ═══════════════════════════════════════════════════════════
// LEVERAGE CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const LEVERAGE_CONFIG = {
  min: 1,
  max: 125,
  default: 20,
  step: 1,

  // Quick preset buttons
  quickOptions: [1, 2, 3, 5, 10, 20, 50, 75, 100, 125],

  // Warning thresholds
  warningThreshold: 50,      // Show warning at 50x+
  dangerThreshold: 75,       // Show danger at 75x+
  extremeThreshold: 100,     // Show extreme warning at 100x+

  // Slider tick marks
  tickMarks: [1, 5, 10, 25, 50, 75, 100, 125],

  // Messages
  warningMessage: 'Đòn bẩy cao tăng rủi ro thanh lý',
  dangerMessage: 'Rủi ro thanh lý RẤT CAO',
  extremeMessage: 'CỰC KỲ NGUY HIỂM - Chỉ dành cho chuyên gia',
};

// Get leverage color based on value
export const getLeverageColor = (leverage) => {
  if (leverage >= LEVERAGE_CONFIG.extremeThreshold) return COLORS.error;
  if (leverage >= LEVERAGE_CONFIG.dangerThreshold) return '#FF8C00'; // Orange
  if (leverage >= LEVERAGE_CONFIG.warningThreshold) return COLORS.warning;
  return COLORS.success;
};

// Get leverage warning level
export const getLeverageWarningLevel = (leverage) => {
  if (leverage >= LEVERAGE_CONFIG.extremeThreshold) return 'extreme';
  if (leverage >= LEVERAGE_CONFIG.dangerThreshold) return 'danger';
  if (leverage >= LEVERAGE_CONFIG.warningThreshold) return 'warning';
  return 'safe';
};

// ═══════════════════════════════════════════════════════════
// TIME IN FORCE
// ═══════════════════════════════════════════════════════════

export const TIME_IN_FORCE = {
  GTC: {
    id: 'GTC',
    name: 'GTC',
    fullName: 'Good Till Cancel',
    nameVi: 'Đến khi hủy',
    description: 'Lệnh tồn tại cho đến khi khớp hoặc hủy',
    descriptionEn: 'Order remains until filled or cancelled',
    isDefault: true,
  },
  IOC: {
    id: 'IOC',
    name: 'IOC',
    fullName: 'Immediate or Cancel',
    nameVi: 'Ngay hoặc hủy',
    description: 'Khớp ngay phần có thể, hủy phần còn lại',
    descriptionEn: 'Fill immediately what is possible, cancel rest',
    isDefault: false,
  },
  FOK: {
    id: 'FOK',
    name: 'FOK',
    fullName: 'Fill or Kill',
    nameVi: 'Khớp hết hoặc hủy',
    description: 'Khớp toàn bộ hoặc hủy toàn bộ',
    descriptionEn: 'Fill entire order or cancel completely',
    isDefault: false,
  },
};

// Time in force array for iteration
export const TIME_IN_FORCE_LIST = [
  TIME_IN_FORCE.GTC,
  TIME_IN_FORCE.IOC,
  TIME_IN_FORCE.FOK,
];

// ═══════════════════════════════════════════════════════════
// TRIGGER TYPES
// ═══════════════════════════════════════════════════════════

export const TRIGGER_TYPES = {
  LAST_PRICE: {
    id: 'last_price',
    name: 'Last Price',
    nameVi: 'Giá cuối',
    description: 'Giá giao dịch gần nhất',
    descriptionEn: 'Most recent trade price',
    shortName: 'Last',
  },
  MARK_PRICE: {
    id: 'mark_price',
    name: 'Mark Price',
    nameVi: 'Giá đánh dấu',
    description: 'Giá index trung bình từ nhiều sàn',
    descriptionEn: 'Average index price from multiple exchanges',
    shortName: 'Mark',
    isRecommended: true,
    tooltip: 'Mark Price ổn định hơn, tránh bị thanh lý do spike giá',
  },
};

// ═══════════════════════════════════════════════════════════
// FEE RATES (Binance Futures Default - Tier 0)
// ═══════════════════════════════════════════════════════════

export const FEE_RATES = {
  maker: 0.0002,  // 0.02%
  taker: 0.0004,  // 0.04%

  // With BNB discount (25% off)
  makerBnb: 0.00015,  // 0.015%
  takerBnb: 0.0003,   // 0.03%
};

// ═══════════════════════════════════════════════════════════
// MARGIN RATES
// ═══════════════════════════════════════════════════════════

export const MARGIN_RATES = {
  // Maintenance Margin Rate (varies by position size)
  maintenanceMarginRate: 0.004,  // 0.4% default (up to 50k USDT)

  // Tiered maintenance rates (Binance Futures)
  tiers: [
    { maxPosition: 50000, mmr: 0.004 },      // 0.4%
    { maxPosition: 250000, mmr: 0.005 },     // 0.5%
    { maxPosition: 1000000, mmr: 0.01 },     // 1%
    { maxPosition: 5000000, mmr: 0.025 },    // 2.5%
    { maxPosition: 20000000, mmr: 0.05 },    // 5%
    { maxPosition: 50000000, mmr: 0.1 },     // 10%
    { maxPosition: Infinity, mmr: 0.125 },   // 12.5%
  ],

  // Insurance Fund Rate
  insuranceFundRate: 0.0,  // No insurance fund for paper trading
};

// Get MMR based on position size
export const getMaintenanceMarginRate = (positionValue) => {
  const tier = MARGIN_RATES.tiers.find(t => positionValue <= t.maxPosition);
  return tier?.mmr || 0.004;
};

// ═══════════════════════════════════════════════════════════
// POSITION SIZE CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const POSITION_SIZE_CONFIG = {
  // Quick percentage buttons
  quickPercents: [25, 50, 75, 100],

  // Min/max position
  minPositionUSDT: 10,
  maxPositionUSDT: 1000000,  // 1M USDT

  // Default values
  defaultPercent: 10,  // 10% of balance

  // Decimal places
  decimalsUSDT: 2,
  decimalsCoin: 8,
};

// ═══════════════════════════════════════════════════════════
// TP/SL CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const TPSL_CONFIG = {
  // Default TP/SL percentages
  defaultTPPercent: 4.0,   // 4% take profit
  defaultSLPercent: 2.0,   // 2% stop loss

  // Quick preset buttons
  tpPresets: [2, 4, 6, 8, 10],
  slPresets: [1, 2, 3, 4, 5],

  // Limits
  minPercent: 0.1,
  maxTPPercent: 500,
  maxSLPercent: 100,

  // Risk:Reward ratios
  rrPresets: ['1:1', '1:2', '1:3', '2:1', '3:1'],

  // Default trigger type
  defaultTriggerType: 'mark_price',
};

// ═══════════════════════════════════════════════════════════
// DIRECTION / SIDE
// ═══════════════════════════════════════════════════════════

export const DIRECTIONS = {
  LONG: {
    id: 'LONG',
    name: 'Long',
    nameVi: 'Mua',
    action: 'Buy/Long',
    actionVi: 'Mua/Long',
    color: COLORS.success,
    buttonColor: '#059669',  // Green
  },
  SHORT: {
    id: 'SHORT',
    name: 'Short',
    nameVi: 'Bán',
    action: 'Sell/Short',
    actionVi: 'Bán/Short',
    color: COLORS.error,
    buttonColor: '#DC2626',  // Red
  },
};

// ═══════════════════════════════════════════════════════════
// ORDER STATUS
// ═══════════════════════════════════════════════════════════

export const ORDER_STATUS = {
  PENDING: {
    id: 'PENDING',
    name: 'Pending',
    nameVi: 'Chờ xử lý',
    color: COLORS.warning,
    icon: 'clock',
  },
  TRIGGERED: {
    id: 'TRIGGERED',
    name: 'Triggered',
    nameVi: 'Đã kích hoạt',
    color: COLORS.cyan,
    icon: 'zap',
  },
  PARTIALLY_FILLED: {
    id: 'PARTIALLY_FILLED',
    name: 'Partial Fill',
    nameVi: 'Khớp một phần',
    color: COLORS.info,
    icon: 'pie-chart',
  },
  FILLED: {
    id: 'FILLED',
    name: 'Filled',
    nameVi: 'Đã khớp',
    color: COLORS.success,
    icon: 'check-circle',
  },
  CANCELLED: {
    id: 'CANCELLED',
    name: 'Cancelled',
    nameVi: 'Đã hủy',
    color: COLORS.textMuted,
    icon: 'x-circle',
  },
  EXPIRED: {
    id: 'EXPIRED',
    name: 'Expired',
    nameVi: 'Hết hạn',
    color: COLORS.textDisabled,
    icon: 'clock',
  },
  REJECTED: {
    id: 'REJECTED',
    name: 'Rejected',
    nameVi: 'Từ chối',
    color: COLORS.error,
    icon: 'alert-circle',
  },
};

// ═══════════════════════════════════════════════════════════
// VALIDATION RULES
// ═══════════════════════════════════════════════════════════

export const VALIDATION_RULES = {
  // Price validation
  price: {
    minPercent: 0.1,     // Min 0.1% of current price
    maxPercent: 1000,    // Max 1000% of current price
    decimals: 8,
  },

  // Quantity validation
  quantity: {
    minUSDT: 10,
    maxUSDT: 1000000,
    decimals: 8,
  },

  // Leverage validation
  leverage: {
    min: 1,
    max: 125,
  },

  // TP/SL validation
  tpsl: {
    minPercent: 0.1,
    maxPercent: 500,
  },
};

// ═══════════════════════════════════════════════════════════
// NOTIFICATION TYPES
// ═══════════════════════════════════════════════════════════

export const NOTIFICATION_TYPES = {
  ORDER_PLACED: 'order_placed',
  ORDER_FILLED: 'order_filled',
  ORDER_CANCELLED: 'order_cancelled',
  ORDER_EXPIRED: 'order_expired',
  ORDER_REJECTED: 'order_rejected',
  TP_HIT: 'tp_hit',
  SL_HIT: 'sl_hit',
  POSITION_CLOSED: 'position_closed',
  LIQUIDATION_WARNING: 'liquidation_warning',
  STOP_TRIGGERED: 'stop_triggered',
  DAILY_SUMMARY: 'daily_summary',
  WEEKLY_SUMMARY: 'weekly_summary',
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const tradingConstants = {
  ORDER_TYPES,
  ORDER_TYPE_LIST,
  MARGIN_MODES,
  LEVERAGE_CONFIG,
  TIME_IN_FORCE,
  TIME_IN_FORCE_LIST,
  TRIGGER_TYPES,
  FEE_RATES,
  MARGIN_RATES,
  POSITION_SIZE_CONFIG,
  TPSL_CONFIG,
  DIRECTIONS,
  ORDER_STATUS,
  VALIDATION_RULES,
  NOTIFICATION_TYPES,
  getLeverageColor,
  getLeverageWarningLevel,
  getMaintenanceMarginRate,
};

export default tradingConstants;
