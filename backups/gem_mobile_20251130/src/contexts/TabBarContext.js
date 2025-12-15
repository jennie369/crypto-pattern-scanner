/**
 * Gemral - Tab Bar Context
 * Manages tab bar visibility for auto-hide on scroll
 *
 * Features:
 * - Auto-hide on scroll down, show on scroll up
 * - Animated bottom padding for smooth UI transitions
 * - Screen-specific auto-hide mode (like GemMaster chat)
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Animated, Keyboard, Platform } from 'react-native';

const TAB_BAR_HEIGHT = 85; // Height of tab bar + bottom margin
const ANIMATION_DURATION = 250;

const TabBarContext = createContext();

export const TabBarProvider = ({ children }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  // Animated value for bottom padding (0 when hidden, TAB_BAR_HEIGHT when visible)
  const bottomPadding = useRef(new Animated.Value(TAB_BAR_HEIGHT)).current;
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const isAnimating = useRef(false);
  // Track if auto-hide mode is enabled (for specific screens like chat)
  const [autoHideEnabled, setAutoHideEnabled] = useState(false);
  // Track if keyboard is visible
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  // Track if keyboard auto-hide is enabled (default: true)
  const [keyboardAutoHideEnabled, setKeyboardAutoHideEnabled] = useState(true);

  // Keyboard event listeners for auto-hide
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        if (keyboardAutoHideEnabled) {
          hideTabBarInternal(true);
        }
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        if (keyboardAutoHideEnabled) {
          showTabBarInternal(true);
        }
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [keyboardAutoHideEnabled]);

  // Internal hide function (doesn't check keyboard state)
  const hideTabBarInternal = useCallback((animated = true) => {
    if (isAnimating.current) return;

    isAnimating.current = true;
    setIsVisible(false);

    if (animated) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 120, // Hide below screen
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(bottomPadding, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: false,
        }),
      ]).start(() => {
        isAnimating.current = false;
      });
    } else {
      translateY.setValue(120);
      bottomPadding.setValue(0);
      isAnimating.current = false;
    }
  }, [translateY, bottomPadding]);

  // Internal show function (doesn't check keyboard state)
  const showTabBarInternal = useCallback((animated = true) => {
    if (isAnimating.current) return;

    isAnimating.current = true;
    setIsVisible(true);

    if (animated) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(bottomPadding, {
          toValue: TAB_BAR_HEIGHT,
          duration: ANIMATION_DURATION,
          useNativeDriver: false,
        }),
      ]).start(() => {
        isAnimating.current = false;
      });
    } else {
      translateY.setValue(0);
      bottomPadding.setValue(TAB_BAR_HEIGHT);
      isAnimating.current = false;
    }
  }, [translateY, bottomPadding]);

  const hideTabBar = useCallback((animated = true) => {
    if (!isVisible || isAnimating.current) return;

    isAnimating.current = true;
    setIsVisible(false);

    if (animated) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 120, // Hide below screen
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(bottomPadding, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: false, // Can't use native driver for layout props
        }),
      ]).start(() => {
        isAnimating.current = false;
      });
    } else {
      translateY.setValue(120);
      bottomPadding.setValue(0);
      isAnimating.current = false;
    }
  }, [isVisible, translateY, bottomPadding]);

  const showTabBar = useCallback((animated = true) => {
    if (isVisible || isAnimating.current) return;

    isAnimating.current = true;
    setIsVisible(true);

    if (animated) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(bottomPadding, {
          toValue: TAB_BAR_HEIGHT,
          duration: ANIMATION_DURATION,
          useNativeDriver: false,
        }),
      ]).start(() => {
        isAnimating.current = false;
      });
    } else {
      translateY.setValue(0);
      bottomPadding.setValue(TAB_BAR_HEIGHT);
      isAnimating.current = false;
    }
  }, [isVisible, translateY, bottomPadding]);

  // Handle scroll for auto-hide (general use)
  const handleScroll = useCallback((event) => {
    if (!autoHideEnabled) return;

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
  }, [autoHideEnabled, hideTabBar, showTabBar]);

  // Handle scroll specifically for chat screens (more sensitive)
  const handleChatScroll = useCallback((event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const { contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollThreshold = 30;
    const bottomThreshold = 100; // Distance from bottom to show tab bar

    // Calculate distance from bottom
    const distanceFromBottom = contentSize.height - currentScrollY - layoutMeasurement.height;

    // If near bottom, always show tab bar
    if (distanceFromBottom < bottomThreshold) {
      showTabBar();
      lastScrollY.current = currentScrollY;
      return;
    }

    // Only process if we've scrolled enough
    if (Math.abs(currentScrollY - lastScrollY.current) < 8) {
      return;
    }

    // Scroll down - hide tab bar (more sensitive for chat)
    if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold) {
      hideTabBar();
    }
    // Scroll up - show tab bar
    else if (currentScrollY < lastScrollY.current - 5) {
      showTabBar();
    }

    lastScrollY.current = currentScrollY;
  }, [hideTabBar, showTabBar]);

  // Reset tab bar visibility (useful when navigating)
  const resetTabBar = useCallback(() => {
    lastScrollY.current = 0;
    showTabBar();
  }, [showTabBar]);

  // Enable auto-hide mode for specific screens
  const enableAutoHide = useCallback(() => {
    setAutoHideEnabled(true);
  }, []);

  // Disable auto-hide mode
  const disableAutoHide = useCallback(() => {
    setAutoHideEnabled(false);
    showTabBar();
  }, [showTabBar]);

  // Enable keyboard auto-hide (default behavior)
  const enableKeyboardAutoHide = useCallback(() => {
    setKeyboardAutoHideEnabled(true);
  }, []);

  // Disable keyboard auto-hide for specific screens
  const disableKeyboardAutoHide = useCallback(() => {
    setKeyboardAutoHideEnabled(false);
  }, []);

  return (
    <TabBarContext.Provider
      value={{
        translateY,
        bottomPadding,
        isVisible,
        tabBarHeight: TAB_BAR_HEIGHT,
        handleScroll,
        handleChatScroll,
        hideTabBar,
        showTabBar,
        resetTabBar,
        enableAutoHide,
        disableAutoHide,
        autoHideEnabled,
        // Keyboard auto-hide
        keyboardVisible,
        keyboardAutoHideEnabled,
        enableKeyboardAutoHide,
        disableKeyboardAutoHide,
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
