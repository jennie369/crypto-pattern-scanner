/**
 * Pattern Image Generator
 * Generates chart thumbnails with highlighted pattern areas
 * Used in TradingInfoSidebar to visualize detected patterns
 */

import { COLORS } from '../shared/design-tokens';

/** Convert hex color to rgba string for canvas */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Generate pattern thumbnail image using Canvas API
 * @param {Object} pattern - Pattern data with candlestick information
 * @param {Array} candles - Candlestick data for the pattern
 * @param {Object} config - Configuration options
 * @returns {Promise<string>} Base64 image data URL
 */
export async function generatePatternThumbnail(pattern, candles, config = {}) {
  const {
    width = 300,
    height = 200,
    backgroundColor = COLORS.bgCard || '#1a1a1a',
    highlightColor = COLORS.gold || '#FFD700',
    highlightOpacity = 0.15,
    bullishColor = COLORS.success || '#0ECB81',
    bearishColor = COLORS.error || '#F6465D',
  } = config;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // If no candles data, return placeholder
  if (!candles || candles.length === 0) {
    return createPlaceholderImage(ctx, pattern, width, height);
  }

  // Calculate price range
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const maxPrice = Math.max(...highs);
  const minPrice = Math.min(...lows);
  const priceRange = maxPrice - minPrice;

  // Add padding
  const padding = { top: 30, right: 10, bottom: 20, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Draw candlesticks
  const candleWidth = chartWidth / candles.length;

  candles.forEach((candle, i) => {
    const x = padding.left + i * candleWidth;

    // Scale prices to chart height
    const openY = padding.top + ((maxPrice - candle.open) / priceRange) * chartHeight;
    const closeY = padding.top + ((maxPrice - candle.close) / priceRange) * chartHeight;
    const highY = padding.top + ((maxPrice - candle.high) / priceRange) * chartHeight;
    const lowY = padding.top + ((maxPrice - candle.low) / priceRange) * chartHeight;

    const isBullish = candle.close >= candle.open;
    const color = isBullish ? bullishColor : bearishColor;

    // Draw wick
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + candleWidth / 2, highY);
    ctx.lineTo(x + candleWidth / 2, lowY);
    ctx.stroke();

    // Draw body
    ctx.fillStyle = color;
    const bodyHeight = Math.abs(closeY - openY);
    const bodyY = Math.min(openY, closeY);
    ctx.fillRect(x + 1, bodyY, Math.max(1, candleWidth - 2), Math.max(1, bodyHeight));
  });

  // Draw highlighted area based on pattern type
  drawPatternHighlight(ctx, pattern, candles, {
    padding,
    chartWidth,
    chartHeight,
    candleWidth,
    maxPrice,
    minPrice,
    priceRange,
    highlightColor,
    highlightOpacity,
  });

  // Draw pattern label
  drawPatternLabel(ctx, pattern, width, padding);

  // Convert to data URL
  return canvas.toDataURL('image/png');
}

/**
 * Draw pattern highlight based on pattern type
 */
function drawPatternHighlight(ctx, pattern, candles, params) {
  const {
    padding,
    chartWidth,
    chartHeight,
    candleWidth,
    maxPrice,
    minPrice,
    priceRange,
    highlightColor,
    highlightOpacity,
  } = params;

  if (!pattern.zone) return;

  const zone = pattern.zone;

  // Calculate highlight box coordinates
  const zoneHighY = padding.top + ((maxPrice - zone.high) / priceRange) * chartHeight;
  const zoneLowY = padding.top + ((maxPrice - zone.low) / priceRange) * chartHeight;
  const zoneHeight = zoneLowY - zoneHighY;

  // Draw highlight box (full width)
  ctx.fillStyle = `rgba(255, 215, 0, ${highlightOpacity})`;
  ctx.fillRect(padding.left, zoneHighY, chartWidth, zoneHeight);

  // Draw highlight border
  ctx.strokeStyle = highlightColor;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  ctx.strokeRect(padding.left, zoneHighY, chartWidth, zoneHeight);
  ctx.setLineDash([]); // Reset dash

  // Draw zone labels
  ctx.fillStyle = highlightColor;
  ctx.font = 'bold 10px Arial';
  ctx.fillText(
    `${pattern.patternCode || pattern.type} ZONE`,
    padding.left + 5,
    zoneHighY + 12
  );

  // Draw zone boundaries
  ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
  ctx.font = '9px monospace';
  ctx.fillText(`High: ${zone.high.toFixed(2)}`, padding.left + 5, zoneHighY - 3);
  ctx.fillText(`Low: ${zone.low.toFixed(2)}`, padding.left + 5, zoneLowY + 12);
}

/**
 * Draw pattern label at top of chart
 */
function drawPatternLabel(ctx, pattern, width, padding) {
  // Draw pattern icon and name
  ctx.fillStyle = COLORS.gold || '#FFD700';
  ctx.font = 'bold 14px Arial';
  const labelText = `${pattern.patternIcon || '📊'} ${pattern.patternCode || pattern.patternType}`;
  const textWidth = ctx.measureText(labelText).width;
  const labelX = (width - textWidth) / 2;

  // Draw label background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(labelX - 6, padding.top / 2 - 12, textWidth + 12, 18);

  // Draw label text
  ctx.fillStyle = COLORS.gold || '#FFD700';
  ctx.fillText(labelText, labelX, padding.top / 2);
}

/**
 * Create placeholder image when no candle data
 */
function createPlaceholderImage(ctx, pattern, width, height) {
  // Draw placeholder
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(0, 0, width, height);

  // Draw icon
  ctx.fillStyle = COLORS.gold || '#FFD700';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pattern.patternIcon || '📊', width / 2, height / 2 - 20);

  // Draw text
  ctx.font = 'bold 14px Arial';
  ctx.fillText(pattern.patternCode || 'Pattern', width / 2, height / 2 + 30);

  return ctx.canvas.toDataURL('image/png');
}

/**
 * Generate mock candle data for pattern
 * Used when real candle data is not available
 */
export function generateMockCandleData(pattern, numCandles = 50) {
  const candles = [];
  const basePrice = pattern.entry || 1000;
  const volatility = basePrice * 0.02; // 2% volatility

  let currentPrice = basePrice;

  for (let i = 0; i < numCandles; i++) {
    // Determine trend direction based on pattern
    let trendBias = 0;
    if (pattern.direction === 'bullish') {
      trendBias = i < numCandles / 2 ? -0.3 : 0.5; // Down then up (DPU pattern)
    } else {
      trendBias = i < numCandles / 2 ? 0.3 : -0.5; // Up then down (UPD pattern)
    }

    const change = (Math.random() - 0.5 + trendBias) * volatility;
    currentPrice += change;

    const open = currentPrice;
    const close = currentPrice + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;

    candles.push({
      time: Date.now() - (numCandles - i) * 60000, // 1 minute intervals
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.random() * 1000000,
    });
  }

  return candles;
}

/**
 * Get pattern area indices for highlighting
 * Returns start and end indices for the pattern zone
 */
export function getPatternAreaIndices(pattern, candles) {
  // If pattern has explicit indices, use them
  if (pattern.startIndex !== undefined && pattern.endIndex !== undefined) {
    return {
      start: pattern.startIndex,
      end: pattern.endIndex,
    };
  }

  // Otherwise, highlight middle 40% of candles (the pause zone)
  const totalCandles = candles.length;
  const startIndex = Math.floor(totalCandles * 0.3);
  const endIndex = Math.floor(totalCandles * 0.7);

  return { start: startIndex, end: endIndex };
}
