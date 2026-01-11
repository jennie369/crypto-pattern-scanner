/**
 * GEM Scanner - Order Type Configurations
 * Form field configurations for each order type
 */

import { ORDER_TYPES, TIME_IN_FORCE, TRIGGER_TYPES } from './tradingConstants';

// ═══════════════════════════════════════════════════════════
// FORM FIELD TYPES
// ═══════════════════════════════════════════════════════════

export const FIELD_TYPES = {
  PRICE: 'price',
  STOP_PRICE: 'stop_price',
  QUANTITY: 'quantity',
  LEVERAGE: 'leverage',
  MARGIN_MODE: 'margin_mode',
  TIME_IN_FORCE: 'time_in_force',
  TRIGGER_TYPE: 'trigger_type',
  REDUCE_ONLY: 'reduce_only',
  POST_ONLY: 'post_only',
  TP: 'take_profit',
  SL: 'stop_loss',
};

// ═══════════════════════════════════════════════════════════
// LIMIT ORDER CONFIG
// ═══════════════════════════════════════════════════════════

export const LIMIT_ORDER_CONFIG = {
  orderType: ORDER_TYPES.LIMIT,

  // Required fields
  requiredFields: [
    FIELD_TYPES.PRICE,
    FIELD_TYPES.QUANTITY,
  ],

  // Optional fields
  optionalFields: [
    FIELD_TYPES.LEVERAGE,
    FIELD_TYPES.MARGIN_MODE,
    FIELD_TYPES.TIME_IN_FORCE,
    FIELD_TYPES.POST_ONLY,
    FIELD_TYPES.REDUCE_ONLY,
    FIELD_TYPES.TP,
    FIELD_TYPES.SL,
  ],

  // Field configs
  fields: {
    price: {
      type: 'number',
      label: 'Giá',
      labelEn: 'Price',
      placeholder: 'Nhập giá limit',
      required: true,
      decimals: 8,
      showBBO: true,  // Show Best Bid/Offer button
      showIncrement: true,  // Show +/- buttons
    },
    quantity: {
      type: 'number',
      label: 'Số lượng',
      labelEn: 'Quantity',
      placeholder: 'Nhập số lượng',
      required: true,
      showSlider: true,
      showQuickPercents: true,
      showUnitToggle: true,  // USDT/Coin toggle
    },
    timeInForce: {
      type: 'select',
      label: 'Thời hạn lệnh',
      labelEn: 'Time in Force',
      default: TIME_IN_FORCE.GTC.id,
      options: Object.values(TIME_IN_FORCE),
    },
    postOnly: {
      type: 'checkbox',
      label: 'Post Only',
      labelVi: 'Chỉ Maker',
      description: 'Lệnh sẽ chỉ được thêm vào order book, không khớp ngay',
      default: false,
    },
    reduceOnly: {
      type: 'checkbox',
      label: 'Reduce Only',
      labelVi: 'Chỉ giảm',
      description: 'Lệnh chỉ có thể giảm vị thế hiện tại',
      default: false,
    },
  },

  // Validation rules
  validation: {
    price: {
      minPercent: 50,   // Min 50% of current price
      maxPercent: 200,  // Max 200% of current price
    },
  },
};

// ═══════════════════════════════════════════════════════════
// MARKET ORDER CONFIG
// ═══════════════════════════════════════════════════════════

export const MARKET_ORDER_CONFIG = {
  orderType: ORDER_TYPES.MARKET,

  // Required fields
  requiredFields: [
    FIELD_TYPES.QUANTITY,
  ],

  // Optional fields
  optionalFields: [
    FIELD_TYPES.LEVERAGE,
    FIELD_TYPES.MARGIN_MODE,
    FIELD_TYPES.REDUCE_ONLY,
    FIELD_TYPES.TP,
    FIELD_TYPES.SL,
  ],

  // Field configs
  fields: {
    quantity: {
      type: 'number',
      label: 'Số lượng',
      labelEn: 'Quantity',
      placeholder: 'Nhập số lượng',
      required: true,
      showSlider: true,
      showQuickPercents: true,
      showUnitToggle: true,
    },
    reduceOnly: {
      type: 'checkbox',
      label: 'Reduce Only',
      labelVi: 'Chỉ giảm',
      description: 'Lệnh chỉ có thể giảm vị thế hiện tại',
      default: false,
    },
  },

  // No price validation needed for market orders
  validation: {},

  // Show warning about slippage
  warnings: [
    {
      type: 'info',
      message: 'Lệnh Market sẽ khớp ngay ở giá thị trường',
      messageEn: 'Market order will execute immediately at market price',
    },
  ],
};

// ═══════════════════════════════════════════════════════════
// STOP LIMIT ORDER CONFIG
// ═══════════════════════════════════════════════════════════

export const STOP_LIMIT_ORDER_CONFIG = {
  orderType: ORDER_TYPES.STOP_LIMIT,

  // Required fields
  requiredFields: [
    FIELD_TYPES.STOP_PRICE,
    FIELD_TYPES.PRICE,
    FIELD_TYPES.QUANTITY,
  ],

  // Optional fields
  optionalFields: [
    FIELD_TYPES.TRIGGER_TYPE,
    FIELD_TYPES.LEVERAGE,
    FIELD_TYPES.MARGIN_MODE,
    FIELD_TYPES.TIME_IN_FORCE,
    FIELD_TYPES.REDUCE_ONLY,
    FIELD_TYPES.TP,
    FIELD_TYPES.SL,
  ],

  // Field configs
  fields: {
    stopPrice: {
      type: 'number',
      label: 'Giá kích hoạt',
      labelEn: 'Stop Price',
      placeholder: 'Giá để kích hoạt lệnh',
      required: true,
      decimals: 8,
      showIncrement: true,
      helpText: 'Khi giá chạm mức này, lệnh Limit sẽ được đặt',
      helpTextEn: 'When price reaches this level, a Limit order will be placed',
    },
    price: {
      type: 'number',
      label: 'Giá Limit',
      labelEn: 'Limit Price',
      placeholder: 'Giá đặt lệnh sau khi kích hoạt',
      required: true,
      decimals: 8,
      showIncrement: true,
    },
    quantity: {
      type: 'number',
      label: 'Số lượng',
      labelEn: 'Quantity',
      placeholder: 'Nhập số lượng',
      required: true,
      showSlider: true,
      showQuickPercents: true,
      showUnitToggle: true,
    },
    triggerType: {
      type: 'select',
      label: 'Loại giá kích hoạt',
      labelEn: 'Trigger Type',
      default: TRIGGER_TYPES.MARK_PRICE.id,
      options: Object.values(TRIGGER_TYPES),
    },
    timeInForce: {
      type: 'select',
      label: 'Thời hạn lệnh',
      labelEn: 'Time in Force',
      default: TIME_IN_FORCE.GTC.id,
      options: Object.values(TIME_IN_FORCE),
    },
    reduceOnly: {
      type: 'checkbox',
      label: 'Reduce Only',
      labelVi: 'Chỉ giảm',
      description: 'Lệnh chỉ có thể giảm vị thế hiện tại',
      default: false,
    },
  },

  // Validation rules
  validation: {
    stopPrice: {
      // For Long: Stop >= current price, For Short: Stop <= current price
      dynamicValidation: true,
    },
    price: {
      // Limit price should be close to stop price
      maxDifferencePercent: 5,
    },
  },

  // Explanation
  explanation: {
    long: 'Long Stop Limit: Đặt khi bạn muốn mua khi giá vượt qua một mức nào đó',
    short: 'Short Stop Limit: Đặt khi bạn muốn bán khi giá giảm xuống một mức nào đó',
    longEn: 'Long Stop Limit: Place when you want to buy after price breaks above a level',
    shortEn: 'Short Stop Limit: Place when you want to sell after price drops below a level',
  },
};

// ═══════════════════════════════════════════════════════════
// STOP MARKET ORDER CONFIG
// ═══════════════════════════════════════════════════════════

export const STOP_MARKET_ORDER_CONFIG = {
  orderType: ORDER_TYPES.STOP_MARKET,

  // Required fields
  requiredFields: [
    FIELD_TYPES.STOP_PRICE,
    FIELD_TYPES.QUANTITY,
  ],

  // Optional fields
  optionalFields: [
    FIELD_TYPES.TRIGGER_TYPE,
    FIELD_TYPES.LEVERAGE,
    FIELD_TYPES.MARGIN_MODE,
    FIELD_TYPES.REDUCE_ONLY,
    FIELD_TYPES.TP,
    FIELD_TYPES.SL,
  ],

  // Field configs
  fields: {
    stopPrice: {
      type: 'number',
      label: 'Giá kích hoạt',
      labelEn: 'Stop Price',
      placeholder: 'Giá để kích hoạt lệnh',
      required: true,
      decimals: 8,
      showIncrement: true,
      helpText: 'Khi giá chạm mức này, lệnh Market sẽ được thực hiện ngay',
      helpTextEn: 'When price reaches this level, a Market order executes immediately',
    },
    quantity: {
      type: 'number',
      label: 'Số lượng',
      labelEn: 'Quantity',
      placeholder: 'Nhập số lượng',
      required: true,
      showSlider: true,
      showQuickPercents: true,
      showUnitToggle: true,
    },
    triggerType: {
      type: 'select',
      label: 'Loại giá kích hoạt',
      labelEn: 'Trigger Type',
      default: TRIGGER_TYPES.MARK_PRICE.id,
      options: Object.values(TRIGGER_TYPES),
    },
    reduceOnly: {
      type: 'checkbox',
      label: 'Reduce Only',
      labelVi: 'Chỉ giảm',
      description: 'Lệnh chỉ có thể giảm vị thế hiện tại',
      default: false,
    },
  },

  // Validation rules
  validation: {
    stopPrice: {
      dynamicValidation: true,
    },
  },

  // Warnings
  warnings: [
    {
      type: 'info',
      message: 'Lệnh sẽ khớp ngay ở giá thị trường khi Stop được kích hoạt',
      messageEn: 'Order will execute at market price when Stop is triggered',
    },
  ],
};

// ═══════════════════════════════════════════════════════════
// GET CONFIG BY ORDER TYPE
// ═══════════════════════════════════════════════════════════

export const getOrderTypeConfig = (orderTypeId) => {
  switch (orderTypeId) {
    case 'limit':
      return LIMIT_ORDER_CONFIG;
    case 'market':
      return MARKET_ORDER_CONFIG;
    case 'stop_limit':
      return STOP_LIMIT_ORDER_CONFIG;
    case 'stop_market':
      return STOP_MARKET_ORDER_CONFIG;
    default:
      return LIMIT_ORDER_CONFIG;
  }
};

// ═══════════════════════════════════════════════════════════
// TPSL FIELD CONFIG
// ═══════════════════════════════════════════════════════════

export const TPSL_FIELD_CONFIG = {
  takeProfit: {
    type: 'number',
    label: 'Chốt lời (TP)',
    labelEn: 'Take Profit',
    placeholder: 'Giá chốt lời',
    required: false,
    decimals: 8,
    showTriggerType: true,
    showPercentPresets: true,
    color: '#3AF7A6',  // Green
    validateDirection: true,  // TP must be > entry for Long, < entry for Short
  },
  stopLoss: {
    type: 'number',
    label: 'Cắt lỗ (SL)',
    labelEn: 'Stop Loss',
    placeholder: 'Giá cắt lỗ',
    required: false,
    decimals: 8,
    showTriggerType: true,
    showPercentPresets: true,
    color: '#FF6B6B',  // Red
    validateDirection: true,  // SL must be < entry for Long, > entry for Short
  },
};

// ═══════════════════════════════════════════════════════════
// ORDER FORM STATE TEMPLATE
// ═══════════════════════════════════════════════════════════

export const getInitialOrderState = (currentPrice = 0) => ({
  // Order type
  orderType: 'limit',

  // Direction
  direction: 'LONG',

  // Prices
  price: currentPrice,
  stopPrice: null,
  triggerType: 'mark_price',

  // Quantity
  quantity: 0,
  quantityPercent: 10,
  quantityUnit: 'usdt',  // 'usdt' or 'coin'

  // Leverage & Margin
  leverage: 20,
  marginMode: 'isolated',

  // Order options
  timeInForce: 'GTC',
  reduceOnly: false,
  postOnly: false,

  // TP/SL
  tpEnabled: false,
  takeProfit: null,
  tpTriggerType: 'mark_price',
  slEnabled: false,
  stopLoss: null,
  slTriggerType: 'mark_price',

  // Pattern info (for Pattern mode)
  patternType: null,
  timeframe: null,
  confidence: null,
  aiAssessment: null,
});

// ═══════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════

export const validateStopPrice = (stopPrice, currentPrice, direction) => {
  if (!stopPrice || !currentPrice) return { valid: false, error: 'Vui lòng nhập giá' };

  if (direction === 'LONG') {
    // For Long Stop orders: stopPrice should be above current for entry
    if (stopPrice <= currentPrice * 0.5) {
      return { valid: false, error: 'Giá stop quá thấp' };
    }
    if (stopPrice >= currentPrice * 2) {
      return { valid: false, error: 'Giá stop quá cao' };
    }
  } else {
    // For Short Stop orders: stopPrice should be below current for entry
    if (stopPrice >= currentPrice * 2) {
      return { valid: false, error: 'Giá stop quá cao' };
    }
    if (stopPrice <= currentPrice * 0.5) {
      return { valid: false, error: 'Giá stop quá thấp' };
    }
  }

  return { valid: true, error: null };
};

export const validateTPSL = (tp, sl, entryPrice, direction) => {
  const errors = [];

  if (direction === 'LONG') {
    if (tp && tp <= entryPrice) {
      errors.push('TP phải cao hơn giá vào lệnh cho Long');
    }
    if (sl && sl >= entryPrice) {
      errors.push('SL phải thấp hơn giá vào lệnh cho Long');
    }
  } else {
    if (tp && tp >= entryPrice) {
      errors.push('TP phải thấp hơn giá vào lệnh cho Short');
    }
    if (sl && sl <= entryPrice) {
      errors.push('SL phải cao hơn giá vào lệnh cho Short');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const orderTypeConfigs = {
  LIMIT_ORDER_CONFIG,
  MARKET_ORDER_CONFIG,
  STOP_LIMIT_ORDER_CONFIG,
  STOP_MARKET_ORDER_CONFIG,
  getOrderTypeConfig,
  TPSL_FIELD_CONFIG,
  getInitialOrderState,
  validateStopPrice,
  validateTPSL,
  FIELD_TYPES,
};

export default orderTypeConfigs;
