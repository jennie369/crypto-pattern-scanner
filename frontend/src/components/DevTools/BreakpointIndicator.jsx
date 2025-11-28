import React, { useState, useEffect } from 'react';
import './BreakpointIndicator.css';

const BreakpointIndicator = () => {
  const [breakpoint, setBreakpoint] = useState('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDimensions({ width, height });

      if (width < 480) {
        setBreakpoint('📱 Mobile (XS)');
      } else if (width < 768) {
        setBreakpoint('📱 Mobile (LG)');
      } else if (width < 1024) {
        setBreakpoint('💻 Tablet');
      } else if (width < 1440) {
        setBreakpoint('🖥️ Desktop');
      } else {
        setBreakpoint('🖥️ Desktop (XL)');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  if (import.meta.env.PROD) return null;

  return (
    <div className="breakpoint-indicator">
      <div className="bp-label">{breakpoint}</div>
      <div className="bp-dimensions">
        {dimensions.width} × {dimensions.height}
      </div>
    </div>
  );
};

export default BreakpointIndicator;
