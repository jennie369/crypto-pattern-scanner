// ============================================
// 📊 CHART ANNOTATIONS COMPONENT (v4 - NO FLICKER FIX)
// ============================================
// Draws pattern Entry/TP/SL lines on TradingView Lightweight Charts
// FIX: Pattern ID tracking + proper cleanup + debounce

import React, { useEffect, useRef } from 'react';

/**
 * ChartAnnotations Component
 *
 * Renders Entry/Target/Stop lines on chart
 * FIXED: No double labels, no flickering, no infinite loops
 */
export const ChartAnnotations = ({
  candlestickSeriesRef,
  pattern
}) => {
  // Track price line refs for proper cleanup
  const priceLineRefsRef = useRef([]);

  // Track last pattern ID to prevent unnecessary re-renders
  const lastPatternIdRef = useRef(null);

  useEffect(() => {
    // Guard: require both series and pattern data
    if (!candlestickSeriesRef || !pattern) {
      return;
    }

    // Skip if same pattern (prevent flickering)
    const patternId = pattern.id || `${pattern.coin}-${pattern.detectedAt}`;
    if (lastPatternIdRef.current === patternId) {
      console.log('[ChartAnnotations] ⏭️ Same pattern, skipping re-render');
      return;
    }

    console.log('[ChartAnnotations] 🎨 Drawing annotations for:', pattern.coin || pattern.symbol);

    // Update last pattern ID
    lastPatternIdRef.current = patternId;

    // CRITICAL: Cleanup function to remove ALL old annotations
    const cleanup = () => {
      console.log('[ChartAnnotations] 🧹 Cleaning up old annotations');

      // Remove all price lines
      priceLineRefsRef.current.forEach(priceLine => {
        try {
          candlestickSeriesRef.removePriceLine(priceLine);
        } catch (error) {
          console.warn('[ChartAnnotations] Failed to remove price line:', error);
        }
      });
      priceLineRefsRef.current = [];

      // Clear markers
      try {
        candlestickSeriesRef.setMarkers([]);
      } catch (error) {
        console.warn('[ChartAnnotations] Failed to clear markers:', error);
      }
    };

    // Always cleanup before drawing new annotations
    cleanup();

    // Extract pattern data
    const {
      entry,
      stopLoss,
      takeProfit,
      detectedAt,
      coin,
      symbol
    } = pattern;

    // Validate required data
    if (!entry || !detectedAt) {
      console.warn('[ChartAnnotations] Missing required pattern data');
      return cleanup;
    }

    // Convert timestamp if needed
    let entryTimestamp;
    try {
      entryTimestamp = typeof detectedAt === 'number'
        ? detectedAt
        : Math.floor(new Date(detectedAt).getTime() / 1000);
    } catch (error) {
      console.error('[ChartAnnotations] Invalid detectedAt:', detectedAt);
      return cleanup;
    }

    // Add small delay to prevent flickering
    const timeoutId = setTimeout(() => {
      try {
        // ===================================
        // ENTRY LINE (Gold)
        // ===================================
        const entryLine = candlestickSeriesRef.createPriceLine({
          price: parseFloat(entry),
          color: '#FFBD59',
          lineWidth: 2,
          lineStyle: 0, // Solid
          axisLabelVisible: true,
          title: 'ENTRY',
          lineVisible: true,
        });
        priceLineRefsRef.current.push(entryLine);
        console.log('[ChartAnnotations] ✅ ENTRY line created at', entry);

        // ===================================
        // TAKE PROFIT LINE (Green)
        // ===================================
        if (takeProfit) {
          const tpLine = candlestickSeriesRef.createPriceLine({
            price: parseFloat(takeProfit),
            color: '#10b981',
            lineWidth: 2,
            lineStyle: 2, // Dashed
            axisLabelVisible: true,
            title: 'TP',
            lineVisible: true,
          });
          priceLineRefsRef.current.push(tpLine);
          console.log('[ChartAnnotations] ✅ TP line created at', takeProfit);
        }

        // ===================================
        // STOP LOSS LINE (Red)
        // ===================================
        if (stopLoss) {
          const slLine = candlestickSeriesRef.createPriceLine({
            price: parseFloat(stopLoss),
            color: '#ef4444',
            lineWidth: 2,
            lineStyle: 2, // Dashed
            axisLabelVisible: true,
            title: 'SL',
            lineVisible: true,
          });
          priceLineRefsRef.current.push(slLine);
          console.log('[ChartAnnotations] ✅ SL line created at', stopLoss);
        }

        // ===================================
        // ENTRY MARKER (Arrow on candle)
        // ===================================
        const markers = [
          {
            time: entryTimestamp,
            position: 'belowBar',
            color: '#FFBD59',
            shape: 'arrowUp',
            text: 'ENTRY',
            size: 1,
          }
        ];

        candlestickSeriesRef.setMarkers(markers);
        console.log('[ChartAnnotations] ✅ Entry marker created');

        console.log(`[ChartAnnotations] ✅✅✅ Annotations complete for ${coin || symbol}`);

      } catch (error) {
        console.error('[ChartAnnotations] Error drawing annotations:', error);
      }
    }, 100); // 100ms delay to prevent flickering

    // Cleanup on unmount or when pattern changes
    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };

  }, [candlestickSeriesRef, pattern]);

  // No visual component - just manages chart annotations
  return null;
};

export default ChartAnnotations;
