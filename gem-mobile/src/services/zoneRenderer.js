/**
 * GEM Mobile - Zone Renderer Service
 * Generates JavaScript code for WebView injection to render zones on chart
 *
 * Features:
 * - Generate zone rectangle rendering code
 * - Generate zone label rendering code
 * - Handle zone updates and removals
 * - Support zone click/tap events
 */

import { ZONE_TYPE, ZONE_STATUS, ZONE_COLORS, zoneManager } from './zoneManager';
import tierAccessService from './tierAccessService';

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Default zone styles
 */
const DEFAULT_STYLES = {
  fillOpacity: 0.25,
  borderWidth: 1,
  labelFontSize: 10,
  labelPadding: 4,
  minZoneHeight: 2, // Minimum pixel height
  zIndex: {
    zone: 10,
    label: 20,
    line: 15,
  },
};

/**
 * Zone label positions
 */
const LABEL_POSITION = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
};

// ============================================================
// ZONE RENDERER CLASS
// ============================================================

class ZoneRenderer {
  constructor() {
    this.renderedZones = new Map();
  }

  // ============================================================
  // MAIN RENDERING METHODS
  // ============================================================

  /**
   * Generate complete zone rendering code for WebView injection
   * @param {Array} zones - Array of zones to render
   * @param {Object} preferences - User preferences
   * @returns {string} JavaScript code to inject
   */
  generateZoneRenderingCode(zones, preferences = {}) {
    if (!zones || zones.length === 0) {
      return this._generateClearAllCode();
    }

    // Check tier access
    const canRender = tierAccessService.canUseZoneRectangles();
    const canShowLabels = tierAccessService.canUseZoneLabels();
    const canShowLifecycle = tierAccessService.canUseZoneLifecycle();

    if (!canRender) {
      return this._generateBasicLinesCode(zones);
    }

    const code = `
(function() {
  try {
    // Clear existing zones
    window.clearAllZones && window.clearAllZones();

    // Zone rendering configuration
    const config = {
      showLabels: ${canShowLabels},
      showLifecycle: ${canShowLifecycle},
      fillOpacity: ${preferences.fillOpacity || DEFAULT_STYLES.fillOpacity},
      customColors: ${JSON.stringify(preferences.customColors || {})},
    };

    // Zone data
    const zones = ${JSON.stringify(zones.map(z => this._sanitizeZone(z)))};

    // Initialize zone container if needed
    if (!window.zoneContainer) {
      window.zoneContainer = document.createElement('div');
      window.zoneContainer.id = 'zone-overlay-container';
      window.zoneContainer.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:${DEFAULT_STYLES.zIndex.zone};';
      document.body.appendChild(window.zoneContainer);
    }

    // Store zones for updates
    window.activeZones = window.activeZones || new Map();

    // Render each zone
    zones.forEach((zone, index) => {
      renderZone(zone, index, config);
    });

    // Zone rendering function
    function renderZone(zone, index, config) {
      const zoneId = zone.id || 'zone_' + index;

      // Get zone colors
      const colors = getZoneColors(zone, config.customColors);

      // Create zone element
      const zoneEl = document.createElement('div');
      zoneEl.id = 'zone_' + zoneId;
      zoneEl.className = 'zone-rectangle zone-' + zone.zone_type.toLowerCase();
      zoneEl.dataset.zoneId = zoneId;
      zoneEl.dataset.zoneType = zone.zone_type;
      zoneEl.dataset.status = zone.status;

      // Style zone rectangle
      zoneEl.style.cssText = \`
        position: absolute;
        left: 0;
        right: 60px;
        background-color: \${colors.fill};
        border-top: \${DEFAULT_STYLES.borderWidth}px solid \${colors.border};
        border-bottom: \${DEFAULT_STYLES.borderWidth}px solid \${colors.border};
        pointer-events: auto;
        cursor: pointer;
        transition: opacity 0.2s;
        min-height: ${DEFAULT_STYLES.minZoneHeight}px;
      \`;

      // Calculate position from price
      const topY = priceToY(zone.zone_high);
      const bottomY = priceToY(zone.zone_low);
      zoneEl.style.top = topY + 'px';
      zoneEl.style.height = Math.max(bottomY - topY, ${DEFAULT_STYLES.minZoneHeight}) + 'px';

      // Add click handler
      zoneEl.onclick = function(e) {
        e.stopPropagation();
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'ZONE_CLICK',
          zoneId: zoneId,
          zoneData: zone
        }));
      };

      // Add label if enabled
      if (config.showLabels) {
        const label = createZoneLabel(zone, colors, config.showLifecycle);
        zoneEl.appendChild(label);
      }

      // Add to container
      window.zoneContainer.appendChild(zoneEl);
      window.activeZones.set(zoneId, { element: zoneEl, data: zone });
    }

    // Create zone label
    function createZoneLabel(zone, colors, showLifecycle) {
      const label = document.createElement('div');
      label.className = 'zone-label';

      const action = zone.zone_type === 'LFZ' ? 'Buy' : 'Sell';
      const strength = zone.strength || 100;
      const stars = getStrengthStars(strength);

      let statusBadge = '';
      if (showLifecycle && zone.status !== 'FRESH') {
        const statusColors = {
          'TESTED_1X': '#FFC107',
          'TESTED_2X': '#FF9800',
          'TESTED_3X_PLUS': '#FF5722',
          'BROKEN': '#6C757D',
        };
        statusBadge = \`<span style="background:\${statusColors[zone.status] || '#6C757D'};padding:1px 4px;border-radius:2px;font-size:8px;margin-left:4px;">\${zone.status.replace(/_/g, ' ')}</span>\`;
      }

      label.innerHTML = \`
        <span style="font-weight:600;">\${action}</span>
        <span style="margin-left:4px;">\${strength}%</span>
        <span style="margin-left:2px;color:#FFD700;">\${stars}</span>
        \${statusBadge}
      \`;

      label.style.cssText = \`
        position: absolute;
        top: 2px;
        right: 4px;
        background: \${colors.labelBg};
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: ${DEFAULT_STYLES.labelFontSize}px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        white-space: nowrap;
        pointer-events: none;
        z-index: ${DEFAULT_STYLES.zIndex.label};
      \`;

      return label;
    }

    // Get zone colors
    function getZoneColors(zone, customColors) {
      if (zone.status === 'BROKEN') {
        return {
          fill: 'rgba(108, 117, 125, 0.15)',
          border: '#6C757D',
          label: '#6C757D',
          labelBg: 'rgba(108, 117, 125, 0.9)',
        };
      }

      const defaults = zone.zone_type === 'HFZ' ? {
        fill: 'rgba(255, 107, 107, 0.25)',
        border: '#FF6B6B',
        label: '#FF6B6B',
        labelBg: 'rgba(255, 107, 107, 0.9)',
      } : {
        fill: 'rgba(78, 205, 196, 0.25)',
        border: '#4ECDC4',
        label: '#4ECDC4',
        labelBg: 'rgba(78, 205, 196, 0.9)',
      };

      // Apply custom colors if provided
      if (customColors && customColors[zone.zone_type]) {
        return { ...defaults, ...customColors[zone.zone_type] };
      }

      return defaults;
    }

    // Get strength stars
    function getStrengthStars(strength) {
      if (strength >= 100) return '★★★★★';
      if (strength >= 80) return '★★★★☆';
      if (strength >= 60) return '★★★☆☆';
      if (strength >= 40) return '★★☆☆☆';
      if (strength > 0) return '★☆☆☆☆';
      return '☆☆☆☆☆';
    }

    // Convert price to Y coordinate (requires chart integration)
    function priceToY(price) {
      if (window.chart && window.chart.timeScale) {
        const series = window.chart.series;
        if (series && series.priceToCoordinate) {
          return series.priceToCoordinate(price) || 0;
        }
      }
      // Fallback calculation (will be updated by chart)
      return 0;
    }

    // Update zone positions on chart scroll/zoom
    window.updateZonePositions = function() {
      window.activeZones && window.activeZones.forEach((zoneInfo, zoneId) => {
        const el = zoneInfo.element;
        const zone = zoneInfo.data;
        const topY = priceToY(zone.zone_high);
        const bottomY = priceToY(zone.zone_low);
        el.style.top = topY + 'px';
        el.style.height = Math.max(bottomY - topY, ${DEFAULT_STYLES.minZoneHeight}) + 'px';
      });
    };

    // Clear all zones function
    window.clearAllZones = function() {
      if (window.zoneContainer) {
        window.zoneContainer.innerHTML = '';
      }
      window.activeZones && window.activeZones.clear();
    };

    console.log('[ZoneRenderer] Rendered', zones.length, 'zones');

  } catch (error) {
    console.error('[ZoneRenderer] Error:', error);
  }
})();
`;

    return code;
  }

  /**
   * Generate code to update a single zone
   * @param {Object} zone - Zone to update
   * @returns {string} JavaScript code
   */
  generateZoneUpdateCode(zone) {
    const sanitized = this._sanitizeZone(zone);
    const colors = zoneManager.getZoneColor(zone);

    return `
(function() {
  const zoneId = '${zone.id}';
  const zoneInfo = window.activeZones && window.activeZones.get(zoneId);
  if (!zoneInfo) return;

  const el = zoneInfo.element;
  const zone = ${JSON.stringify(sanitized)};
  const colors = ${JSON.stringify(colors)};

  // Update styles
  el.style.backgroundColor = colors.fill;
  el.style.borderTopColor = colors.border;
  el.style.borderBottomColor = colors.border;
  el.dataset.status = zone.status;

  // Update label
  const label = el.querySelector('.zone-label');
  if (label) {
    const action = zone.zone_type === 'LFZ' ? 'Buy' : 'Sell';
    const strength = zone.strength || 100;
    const stars = window.getStrengthStars ? window.getStrengthStars(strength) : '';
    label.innerHTML = '<span style="font-weight:600;">' + action + '</span><span style="margin-left:4px;">' + strength + '%</span><span style="margin-left:2px;color:#FFD700;">' + stars + '</span>';
  }

  // Update stored data
  zoneInfo.data = zone;
  window.activeZones.set(zoneId, zoneInfo);

  console.log('[ZoneRenderer] Updated zone:', zoneId);
})();
`;
  }

  /**
   * Generate code to remove a zone
   * @param {string} zoneId - Zone ID to remove
   * @returns {string} JavaScript code
   */
  generateZoneRemoveCode(zoneId) {
    return `
(function() {
  const zoneId = '${zoneId}';
  const zoneInfo = window.activeZones && window.activeZones.get(zoneId);
  if (zoneInfo && zoneInfo.element) {
    zoneInfo.element.remove();
    window.activeZones.delete(zoneId);
    console.log('[ZoneRenderer] Removed zone:', zoneId);
  }
})();
`;
  }

  /**
   * Generate code for zone click handler
   * @returns {string} JavaScript code
   */
  generateZoneClickHandlerCode() {
    return `
window.handleZoneClick = function(zoneId) {
  const zoneInfo = window.activeZones && window.activeZones.get(zoneId);
  if (zoneInfo) {
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'ZONE_CLICK',
      zoneId: zoneId,
      zoneData: zoneInfo.data
    }));
  }
};
`;
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  /**
   * Generate basic price lines (for FREE tier)
   * @private
   */
  _generateBasicLinesCode(zones) {
    if (!zones || zones.length === 0) return '';

    // Only show first zone for FREE tier
    const zone = zones[0];

    return `
(function() {
  // Basic line rendering for FREE tier
  if (window.chart && window.chart.series) {
    const series = window.chart.series;

    // Remove existing lines
    if (window.entryLine) series.removePriceLine(window.entryLine);
    if (window.stopLine) series.removePriceLine(window.stopLine);

    // Add entry line
    window.entryLine = series.createPriceLine({
      price: ${zone.entry_price || zone.zone_high},
      color: '${zone.zone_type === 'LFZ' ? '#4ECDC4' : '#FF6B6B'}',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      axisLabelVisible: true,
      title: '${zone.zone_type === 'LFZ' ? 'Buy' : 'Sell'}',
    });

    // Add stop line
    window.stopLine = series.createPriceLine({
      price: ${zone.stop_price || zone.zone_low},
      color: '#FF6B6B',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'Stop',
    });
  }
})();
`;
  }

  /**
   * Generate code to clear all zones
   * @private
   */
  _generateClearAllCode() {
    return `
(function() {
  window.clearAllZones && window.clearAllZones();

  // Also clear basic lines
  if (window.chart && window.chart.series) {
    const series = window.chart.series;
    if (window.entryLine) { series.removePriceLine(window.entryLine); window.entryLine = null; }
    if (window.stopLine) { series.removePriceLine(window.stopLine); window.stopLine = null; }
    if (window.target1Line) { series.removePriceLine(window.target1Line); window.target1Line = null; }
    if (window.target2Line) { series.removePriceLine(window.target2Line); window.target2Line = null; }
  }

  console.log('[ZoneRenderer] Cleared all zones');
})();
`;
  }

  /**
   * Sanitize zone object for JSON serialization
   * @private
   */
  _sanitizeZone(zone) {
    return {
      id: zone.id,
      zone_type: zone.zone_type,
      zone_high: parseFloat(zone.zone_high) || 0,
      zone_low: parseFloat(zone.zone_low) || 0,
      entry_price: parseFloat(zone.entry_price) || 0,
      stop_price: parseFloat(zone.stop_price) || 0,
      target_1: parseFloat(zone.target_1) || 0,
      target_2: parseFloat(zone.target_2) || 0,
      status: zone.status || ZONE_STATUS.FRESH,
      strength: parseInt(zone.strength) || 100,
      pattern_type: zone.pattern_type || 'UNKNOWN',
      pattern_grade: zone.pattern_grade || 'C',
    };
  }

  /**
   * Generate trading lines code (Entry, SL, TP)
   * @param {Object} zone - Zone object
   * @returns {string} JavaScript code
   */
  generateTradingLinesCode(zone) {
    if (!zone) return '';

    const isLong = zone.zone_type === ZONE_TYPE.LFZ;
    const entryColor = isLong ? '#4ECDC4' : '#FF6B6B';

    return `
(function() {
  if (!window.chart || !window.chart.series) return;

  const series = window.chart.series;

  // Clear existing trading lines
  ['entryLine', 'stopLine', 'target1Line', 'target2Line'].forEach(lineName => {
    if (window[lineName]) {
      series.removePriceLine(window[lineName]);
      window[lineName] = null;
    }
  });

  // Entry line
  window.entryLine = series.createPriceLine({
    price: ${zone.entry_price},
    color: '${entryColor}',
    lineWidth: 2,
    lineStyle: 0,
    axisLabelVisible: true,
    title: 'Entry',
  });

  // Stop loss line
  window.stopLine = series.createPriceLine({
    price: ${zone.stop_price},
    color: '#FF6B6B',
    lineWidth: 1,
    lineStyle: 2,
    axisLabelVisible: true,
    title: 'SL',
  });

  // Target 1 line
  ${zone.target_1 ? `
  window.target1Line = series.createPriceLine({
    price: ${zone.target_1},
    color: '#3AF7A6',
    lineWidth: 1,
    lineStyle: 2,
    axisLabelVisible: true,
    title: 'TP1',
  });
  ` : ''}

  // Target 2 line
  ${zone.target_2 ? `
  window.target2Line = series.createPriceLine({
    price: ${zone.target_2},
    color: '#3AF7A6',
    lineWidth: 1,
    lineStyle: 2,
    axisLabelVisible: true,
    title: 'TP2',
  });
  ` : ''}

  console.log('[ZoneRenderer] Added trading lines for zone');
})();
`;
  }
}

// Export singleton instance
export const zoneRenderer = new ZoneRenderer();
export default zoneRenderer;
