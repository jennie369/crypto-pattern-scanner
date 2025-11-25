/**
 * GEM Platform - Tab Bar Context
 * Manages tab bar visibility for auto-hide on scroll
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Animated } from 'react-native';

const TabBarContext = createContext();

export const TabBarProvider = ({ children }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const isAnimating = useRef(false);

  const hideTabBar = useCallback(() => {
    if (!isVisible || isAnimating.current) return;

    isAnimating.current = true;
    setIsVisible(false);

    Animated.timing(translateY, {
      toValue: 120, // Hide below screen
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
    });
  }, [isVisible, translateY]);

  const showTabBar = useCallback(() => {
    if (isVisible || isAnimating.current) return;

    isAnimating.current = true;
    setIsVisible(true);

    Animated.timing(translateY, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
    });
  }, [isVisible, translateY]);

  const handleScroll = useCallback((event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollThreshold = 50;

    // Only process if we've scrolled enough
    if (Math.abs(currentScrollY - lastScrollY.current) < 10) {
      return;
    }

    // Scroll down - hide tab bar
    if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold) {
      hideTabBar();
    }
    // Scroll up - show tab bar
    else if (currentScrollY < lastScrollY.current) {
      showTabBar();
    }

    lastScrollY.current = currentScrollY;
  }, [hideTabBar, showTabBar]);

  // Reset tab bar visibility (useful when navigating)
  const resetTabBar = useCallback(() => {
    lastScrollY.current = 0;
    showTabBar();
  }, [showTabBar]);

  return (
    <TabBarContext.Provider
      value={{
        translateY,
        isVisible,
        handleScroll,
        hideTabBar,
        showTabBar,
        resetTabBar,
      }}
    >
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBar = () => {
  const context = useContext(TabBarContext);
  if (!context) {
    throw new Error('useTabBar must be used within a TabBarProvider');
  }
  return context;
};

export default TabBarContext;
