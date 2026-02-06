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

const TAB_BAR_HEIGHT = 100; // Height of tab bar + bottom margin + extra buffer for safety
const ANIMATION_DURATION = 250;

// Simple event system for React Native (replacement for Node.js EventEmitter)
const createSimpleEventEmitter = () => {
  const listeners = {};
  return {
    on: (event, callback) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    },
    off: (event, callback) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    },
    emit: (event, ...args) => {
      if (!listeners[event]) return;
      listeners[event].forEach(callback => callback(...args));
    },
  };
};

// Event emitter for tab double-tap events
const tabEventEmitter = createSimpleEventEmitter();

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
  // Track if app has finished initial startup (prevents race conditions on iOS)
  const hasStartedRef = useRef(false);
  // Track pending visibility change to apply after animation completes
  const pendingVisibilityRef = useRef(null);

  // Keyboard event listeners for auto-hide
  useEffect(() => {
    // Delay keyboard listener activation to avoid race conditions on iOS app startup
    // iOS sometimes fires keyboardWillShow briefly during app launch
    const startupTimer = setTimeout(() => {
      hasStartedRef.current = true;
    }, 500);

    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Skip keyboard hiding during startup to avoid race conditions
        if (keyboardAutoHideEnabled && hasStartedRef.current) {
          hideTabBarInternal(true);
        }
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        if (keyboardAutoHideEnabled && hasStartedRef.current) {
          // If animation is in progress, queue the show for after it completes
          if (isAnimating.current) {
            pendingVisibilityRef.current = 'show';
          } else {
            showTabBarInternal(true);
          }
        }
      }
    );

    return () => {
      clearTimeout(startupTimer);
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [keyboardAutoHideEnabled]);

  // Process any pending visibility changes after animation completes
  const processPendingVisibility = useCallback(() => {
    const pending = pendingVisibilityRef.current;
    pendingVisibilityRef.current = null;

    if (pending === 'show') {
      // Defer to next tick to avoid calling during current animation callback
      setTimeout(() => showTabBarInternal(true), 0);
    } else if (pending === 'hide') {
      setTimeout(() => hideTabBarInternal(true), 0);
    }
  }, []);

  // Internal hide function (doesn't check keyboard state)
  const hideTabBarInternal = useCallback((animated = true) => {
    if (isAnimating.current) {
      pendingVisibilityRef.current = 'hide';
      return;
    }

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
        processPendingVisibility();
      });
    } else {
      translateY.setValue(120);
      bottomPadding.setValue(0);
      isAnimating.current = false;
      processPendingVisibility();
    }
  }, [translateY, bottomPadding, processPendingVisibility]);

  // Internal show function (doesn't check keyboard state)
  const showTabBarInternal = useCallback((animated = true) => {
    if (isAnimating.current) {
      pendingVisibilityRef.current = 'show';
      return;
    }

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
        processPendingVisibility();
      });
    } else {
      translateY.setValue(0);
      bottomPadding.setValue(TAB_BAR_HEIGHT);
      isAnimating.current = false;
      processPendingVisibility();
    }
  }, [translateY, bottomPadding, processPendingVisibility]);

  const hideTabBar = useCallback((animated = true) => {
    if (!isVisible) return;

    if (isAnimating.current) {
      pendingVisibilityRef.current = 'hide';
      return;
    }

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
        processPendingVisibility();
      });
    } else {
      translateY.setValue(120);
      bottomPadding.setValue(0);
      isAnimating.current = false;
      processPendingVisibility();
    }
  }, [isVisible, translateY, bottomPadding, processPendingVisibility]);

  const showTabBar = useCallback((animated = true) => {
    if (isVisible) return;

    if (isAnimating.current) {
      pendingVisibilityRef.current = 'show';
      return;
    }

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
        processPendingVisibility();
      });
    } else {
      translateY.setValue(0);
      bottomPadding.setValue(TAB_BAR_HEIGHT);
      isAnimating.current = false;
      processPendingVisibility();
    }
  }, [isVisible, translateY, bottomPadding, processPendingVisibility]);

  // Force show tab bar - bypasses all guards, for recovery from stuck states
  const forceShowTabBar = useCallback(() => {
    // Stop any running animations
    translateY.stopAnimation();
    bottomPadding.stopAnimation();

    // Reset all state
    isAnimating.current = false;
    pendingVisibilityRef.current = null;

    // Force visible state
    translateY.setValue(0);
    bottomPadding.setValue(TAB_BAR_HEIGHT);
    setIsVisible(true);
  }, [translateY, bottomPadding]);

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
  // Uses forceShowTabBar to ensure it always works regardless of animation state
  const resetTabBar = useCallback(() => {
    lastScrollY.current = 0;
    forceShowTabBar();
  }, [forceShowTabBar]);

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

  // ========== Double-tap event system ==========
  // Emit scroll-to-top and refresh event for a specific tab
  const emitScrollToTopAndRefresh = useCallback((tabName) => {
    console.log('[TabBarContext] Emitting scrollToTopAndRefresh for tab:', tabName);
    tabEventEmitter.emit('scrollToTopAndRefresh', tabName);
  }, []);

  // Subscribe to scroll-to-top and refresh events
  const subscribeToScrollToTop = useCallback((tabName, callback) => {
    const handler = (emittedTabName) => {
      if (emittedTabName === tabName) {
        callback();
      }
    };
    tabEventEmitter.on('scrollToTopAndRefresh', handler);
    // Return unsubscribe function
    return () => {
      tabEventEmitter.off('scrollToTopAndRefresh', handler);
    };
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
        forceShowTabBar,
        resetTabBar,
        enableAutoHide,
        disableAutoHide,
        autoHideEnabled,
        // Keyboard auto-hide
        keyboardVisible,
        keyboardAutoHideEnabled,
        enableKeyboardAutoHide,
        disableKeyboardAutoHide,
        // Double-tap events
        emitScrollToTopAndRefresh,
        subscribeToScrollToTop,
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
