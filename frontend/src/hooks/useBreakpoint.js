/**
 * useBreakpoint Hook
 * Detect current breakpoint and provide boolean flags
 */

import { useState, useEffect } from 'react';

const BREAKPOINTS = {
  mobile: 0,
  mobileLg: 480,
  tablet: 768,
  desktop: 1024,
  desktopLg: 1440,
  desktopXl: 1920
};

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('desktop');
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width < BREAKPOINTS.tablet) {
        setBreakpoint('mobile');
      } else if (width < BREAKPOINTS.desktop) {
        setBreakpoint('tablet');
      } else if (width < BREAKPOINTS.desktopLg) {
        setBreakpoint('desktop');
      } else if (width < BREAKPOINTS.desktopXl) {
        setBreakpoint('desktopLg');
      } else {
        setBreakpoint('desktopXl');
      }
    };

    handleResize(); // Initial check

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    windowWidth,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: ['desktop', 'desktopLg', 'desktopXl'].includes(breakpoint),
    isAboveMobile: breakpoint !== 'mobile',
    isBelowDesktop: ['mobile', 'tablet'].includes(breakpoint),
    isDesktopLg: breakpoint === 'desktopLg',
    isDesktopXl: breakpoint === 'desktopXl',
  };
};

/**
 * Usage:
 *
 * const { isMobile, isTablet, isDesktop, windowWidth } = useBreakpoint();
 *
 * return (
 *   <div>
 *     {isMobile && <MobileView />}
 *     {isTablet && <TabletView />}
 *     {isDesktop && <DesktopView />}
 *   </div>
 * );
 */
