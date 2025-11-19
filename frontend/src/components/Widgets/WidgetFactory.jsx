import React from 'react';
import { PriceAlertWidget } from './PriceAlertWidget';
import { PatternWatchWidget } from './PatternWatchWidget';
import { PortfolioTrackerWidget } from './PortfolioTrackerWidget';
import { DailyReadingWidget } from './DailyReadingWidget';
import './Widget.css';

/**
 * Widget Factory
 * Dynamically renders the correct widget component based on type
 */
export const WidgetFactory = ({ widget, size = 'medium', onRemove }) => {
  const components = {
    price_alert: PriceAlertWidget,
    pattern_watch: PatternWatchWidget,
    portfolio_tracker: PortfolioTrackerWidget,
    daily_reading: DailyReadingWidget
  };

  const Component = components[widget.type];

  if (!Component) {
    return (
      <div className="widget" style={{
        padding: '20px',
        textAlign: 'center',
        background: 'rgba(255, 68, 102, 0.1)',
        border: '2px solid rgba(255, 68, 102, 0.3)'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
        <div style={{ color: '#ff4466', fontSize: '14px', fontWeight: '600' }}>
          Unknown widget type: {widget.type}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <Component data={widget.data} size={size} />
      {onRemove && (
        <button
          onClick={() => onRemove(widget)}
          className="remove-widget-btn"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(255, 68, 102, 0.9)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            zIndex: 10
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          title="Remove widget"
        >
          ×
        </button>
      )}
    </div>
  );
};

// Export individual components for direct use if needed
export {
  PriceAlertWidget,
  PatternWatchWidget,
  PortfolioTrackerWidget,
  DailyReadingWidget
};
