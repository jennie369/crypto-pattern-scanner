/**
 * Candlestick SVG Icons
 * Professional candlestick chart icons to replace emoji
 */

// Bullish Candle (Green/Up)
export const BullishCandle = ({ size = 24, color = '#00E676' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Top wick */}
    <line x1="12" y1="2" x2="12" y2="7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    {/* Bullish body (hollow/green) */}
    <rect x="8" y="7" width="8" height="10" fill={color} rx="1"/>
    {/* Bottom wick */}
    <line x1="12" y1="17" x2="12" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Bearish Candle (Red/Down)
export const BearishCandle = ({ size = 24, color = '#F44336' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Top wick */}
    <line x1="12" y1="2" x2="12" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    {/* Bearish body (filled/red) */}
    <rect x="8" y="8" width="8" height="8" fill={color} rx="1"/>
    {/* Bottom wick */}
    <line x1="12" y1="16" x2="12" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Pause Candle (Blue/Consolidation)
export const PauseCandle = ({ size = 24, color = '#2196F3' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Top wick */}
    <line x1="12" y1="4" x2="12" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    {/* Pause body */}
    <rect x="8" y="8" width="8" height="8" fill={color} rx="1"/>
    {/* Pause symbol inside */}
    <rect x="10" y="10" width="1.5" height="4" fill="#fff" rx="0.5"/>
    <rect x="12.5" y="10" width="1.5" height="4" fill="#fff" rx="0.5"/>
    {/* Bottom wick */}
    <line x1="12" y1="16" x2="12" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Neutral/Doji Candle
export const DojiCandle = ({ size = 24, color = '#FFC107' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Long wick */}
    <line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    {/* Small body */}
    <rect x="9" y="11" width="6" height="2" fill={color} rx="0.5"/>
  </svg>
);

// Mini Pattern Chart Icon (for compact display)
export const MiniPatternChart = ({ pattern = 'DPD', size = 60 }) => {
  const getPatternCandles = () => {
    switch (pattern) {
      case 'DPD': // Down-Pause-Down
        return (
          <>
            <g transform="translate(8, 0)">
              <BearishCandle size={20} />
            </g>
            <g transform="translate(24, 0)">
              <PauseCandle size={20} />
            </g>
            <g transform="translate(40, 0)">
              <BearishCandle size={20} />
            </g>
          </>
        );
      case 'UPU': // Up-Pause-Up
        return (
          <>
            <g transform="translate(8, 0)">
              <BullishCandle size={20} />
            </g>
            <g transform="translate(24, 0)">
              <PauseCandle size={20} />
            </g>
            <g transform="translate(40, 0)">
              <BullishCandle size={20} />
            </g>
          </>
        );
      case 'UPD': // Up-Pause-Down
        return (
          <>
            <g transform="translate(8, 0)">
              <BullishCandle size={20} />
            </g>
            <g transform="translate(24, 0)">
              <PauseCandle size={20} />
            </g>
            <g transform="translate(40, 0)">
              <BearishCandle size={20} />
            </g>
          </>
        );
      case 'DPU': // Down-Pause-Up
        return (
          <>
            <g transform="translate(8, 0)">
              <BearishCandle size={20} />
            </g>
            <g transform="translate(24, 0)">
              <PauseCandle size={20} />
            </g>
            <g transform="translate(40, 0)">
              <BullishCandle size={20} />
            </g>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <svg width={size} height={24} viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {getPatternCandles()}
    </svg>
  );
};

// Large Pattern Chart Icon (for pattern display)
export const PatternChartIcon = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background gradient */}
    <defs>
      <linearGradient id="chartBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(17, 34, 80, 0.8)" />
        <stop offset="100%" stopColor="rgba(17, 34, 80, 0.3)" />
      </linearGradient>
    </defs>

    <rect width="80" height="80" rx="8" fill="url(#chartBg)" />

    {/* Chart candles - Bearish to Bullish pattern */}
    {/* Bearish candle 1 */}
    <line x1="12" y1="20" x2="12" y2="26" stroke="#F44336" strokeWidth="2" strokeLinecap="round"/>
    <rect x="9" y="26" width="6" height="10" fill="#F44336" rx="0.5"/>
    <line x1="12" y1="36" x2="12" y2="42" stroke="#F44336" strokeWidth="2" strokeLinecap="round"/>

    {/* Bearish candle 2 */}
    <line x1="22" y1="24" x2="22" y2="30" stroke="#F44336" strokeWidth="2" strokeLinecap="round"/>
    <rect x="19" y="30" width="6" height="12" fill="#F44336" rx="0.5"/>
    <line x1="22" y1="42" x2="22" y2="48" stroke="#F44336" strokeWidth="2" strokeLinecap="round"/>

    {/* Pause/consolidation */}
    <line x1="32" y1="36" x2="32" y2="40" stroke="#2196F3" strokeWidth="2" strokeLinecap="round"/>
    <rect x="29" y="40" width="6" height="6" fill="#2196F3" rx="0.5"/>
    <rect x="30.5" y="42" width="1" height="2" fill="#fff" rx="0.3"/>
    <rect x="32" y="42" width="1" height="2" fill="#fff" rx="0.3"/>
    <line x1="32" y1="46" x2="32" y2="50" stroke="#2196F3" strokeWidth="2" strokeLinecap="round"/>

    {/* Bullish candle 1 */}
    <line x1="42" y1="38" x2="42" y2="42" stroke="#00E676" strokeWidth="2" strokeLinecap="round"/>
    <rect x="39" y="42" width="6" height="12" fill="#00E676" rx="0.5"/>
    <line x1="42" y1="54" x2="42" y2="60" stroke="#00E676" strokeWidth="2" strokeLinecap="round"/>

    {/* Bullish candle 2 */}
    <line x1="52" y1="32" x2="52" y2="36" stroke="#00E676" strokeWidth="2" strokeLinecap="round"/>
    <rect x="49" y="36" width="6" height="16" fill="#00E676" rx="0.5"/>
    <line x1="52" y1="52" x2="52" y2="58" stroke="#00E676" strokeWidth="2" strokeLinecap="round"/>

    {/* Bullish candle 3 */}
    <line x1="62" y1="26" x2="62" y2="30" stroke="#00E676" strokeWidth="2" strokeLinecap="round"/>
    <rect x="59" y="30" width="6" height="18" fill="#00E676" rx="0.5"/>
    <line x1="62" y1="48" x2="62" y2="54" stroke="#00E676" strokeWidth="2" strokeLinecap="round"/>

    {/* Trend line */}
    <line x1="10" y1="50" x2="70" y2="25" stroke="#FFBD59" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 4"/>
  </svg>
);

// Zone Marker Icons
export const HFZIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="10,2 14,8 18,8 11,14 13,20 10,16 7,20 9,14 2,8 6,8" fill="#F44336" opacity="0.8"/>
    <polygon points="10,2 14,8 18,8 11,14 13,20 10,16 7,20 9,14 2,8 6,8" stroke="#FF6B6B" strokeWidth="1"/>
  </svg>
);

export const LFZIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="10,18 14,12 18,12 11,6 13,0 10,4 7,0 9,6 2,12 6,12" fill="#00E676" opacity="0.8"/>
    <polygon points="10,18 14,12 18,12 11,6 13,0 10,4 7,0 9,6 2,12 6,12" stroke="#4CAF50" strokeWidth="1"/>
  </svg>
);
