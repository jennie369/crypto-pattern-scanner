import React from 'react';
import './ZoneOverlay.css';

/**
 * ZoneOverlay Component
 *
 * Displays HFZ (High Frequency Zone) and LFZ (Low Frequency Zone) markers
 * as overlays on price charts
 *
 * Props:
 * - zones: Array of zone objects with { type, top, bottom, strength, createdAt }
 * - currentPrice: Current price for positioning
 * - chartHeight: Height of the chart area
 * - priceRange: { high, low } for scaling
 * - showLabels: Whether to show zone labels
 */
export default function ZoneOverlay({
  zones = [],
  currentPrice = 0,
  chartHeight = 500,
  priceRange = { high: 100, low: 0 },
  showLabels = true
}) {
  // Calculate Y position for a price level
  const getPriceYPosition = (price) => {
    const { high, low } = priceRange;
    const pricePercent = ((high - price) / (high - low));
    return chartHeight * pricePercent;
  };

  // Get color for zone type
  const getZoneColor = (type, strength = 3) => {
    const opacity = Math.min(strength / 5, 0.8);

    if (type === 'HFZ') {
      return `rgba(239, 68, 68, ${opacity})`; // Red for resistance
    } else if (type === 'LFZ') {
      return `rgba(16, 185, 129, ${opacity})`; // Green for support
    }
    return `rgba(139, 92, 246, ${opacity})`; // Purple for others
  };

  // Get border color for zone type
  const getBorderColor = (type) => {
    if (type === 'HFZ') return '#ef4444';
    if (type === 'LFZ') return '#10b981';
    return '#8b5cf6';
  };

  // Empty state
  if (zones.length === 0) {
    return null;
  }

  return (
    <div className="zone-overlay" style={{ height: `${chartHeight}px` }}>

      {/* Current Price Line */}
      {currentPrice > 0 && (
        <div
          className="current-price-line"
          style={{
            top: `${getPriceYPosition(currentPrice)}px`
          }}
        >
          {showLabels && (
            <div className="price-label">
              ${currentPrice.toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Zone Rectangles */}
      {zones.map((zone, index) => {
        const topY = getPriceYPosition(zone.top);
        const bottomY = getPriceYPosition(zone.bottom);
        const height = bottomY - topY;

        // Determine if price is inside zone
        const isInside = currentPrice >= zone.bottom && currentPrice <= zone.top;

        // Get age in days
        const ageInDays = zone.createdAt
          ? Math.floor((Date.now() - new Date(zone.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        return (
          <div
            key={index}
            className={`zone-rectangle ${zone.type.toLowerCase()} ${isInside ? 'active' : ''}`}
            style={{
              top: `${topY}px`,
              height: `${height}px`,
              backgroundColor: getZoneColor(zone.type, zone.strength),
              borderColor: getBorderColor(zone.type)
            }}
          >
            {showLabels && (
              <div className="zone-label">
                <span className="zone-type">{zone.type}</span>
                <span className="zone-strength">
                  {'⭐'.repeat(Math.min(zone.strength || 3, 5))}
                </span>
                {ageInDays > 0 && (
                  <span className="zone-age">{ageInDays}d old</span>
                )}
              </div>
            )}

            {/* Top border line */}
            <div className="zone-border zone-top" />

            {/* Bottom border line */}
            <div className="zone-border zone-bottom" />
          </div>
        );
      })}

      {/* Zone Legend */}
      {showLabels && zones.length > 0 && (
        <div className="zone-legend">
          <div className="legend-item hfz">
            <div className="legend-color"></div>
            <span>HFZ (Resistance)</span>
          </div>
          <div className="legend-item lfz">
            <div className="legend-color"></div>
            <span>LFZ (Support)</span>
          </div>
        </div>
      )}

    </div>
  );
}
