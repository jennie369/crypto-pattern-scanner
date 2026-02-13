/**
 * Gemral - Swipe Navigation Hook
 * Enables swipe left/right to navigate between tabs
 */

import { useRef, useCallback, useMemo } from 'react';
import { PanResponder, Animated } from 'react-native';

const SWIPE_THRESHOLD = 50; // Minimum swipe distance to trigger
const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum velocity

/**
 * Hook to handle horizontal swipe gestures for tab navigation
 * @param {Object} options - Configuration options
 * @param {Array} options.tabs - Array of tab objects with id property
 * @param {string} options.currentTab - Current active tab id
 * @param {Function} options.onTabChange - Callback when tab changes
 * @param {boolean} options.enabled - Whether swipe is enabled (default: true)
 * @returns {Object} - panHandlers to spread on the swipeable component
 */
export const useSwipeNavigation = ({
  tabs = [],
  currentTab,
  onTabChange,
  enabled = true,
}) => {
  const swipeX = useRef(new Animated.Value(0)).current;

  // Use refs to store latest values (avoids stale closure)
  const tabsRef = useRef(tabs);
  const currentTabRef = useRef(currentTab);
  const onTabChangeRef = useRef(onTabChange);
  const enabledRef = useRef(enabled);

  // Update refs when props change
  tabsRef.current = tabs;
  currentTabRef.current = currentTab;
  onTabChangeRef.current = onTabChange;
  enabledRef.current = enabled;

  const getCurrentIndex = useCallback(() => {
    return tabsRef.current.findIndex(tab => tab.id === currentTabRef.current);
  }, []);

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        const { dx, dy } = gestureState;
        return enabledRef.current && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
      },
      onPanResponderGrant: () => {
        // Optional: Add visual feedback
      },
      onPanResponderMove: (_, gestureState) => {
        // Optional: Track swipe for visual feedback
        swipeX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        const tabs = tabsRef.current;
        const currentIndex = tabsRef.current.findIndex(tab => tab.id === currentTabRef.current);

        // Reset animation
        Animated.spring(swipeX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();

        // Check if swipe meets threshold
        const hasSwipedEnough = Math.abs(dx) > SWIPE_THRESHOLD;
        const hasVelocity = Math.abs(vx) > SWIPE_VELOCITY_THRESHOLD;

        if (!hasSwipedEnough && !hasVelocity) return;
        if (currentIndex === -1) return;

        // Determine direction
        const isSwipeLeft = dx < 0;
        const isSwipeRight = dx > 0;

        if (isSwipeLeft && currentIndex < tabs.length - 1) {
          // Swipe left = go to next tab
          const nextTab = tabs[currentIndex + 1];
          onTabChangeRef.current(nextTab.id);
        } else if (isSwipeRight && currentIndex > 0) {
          // Swipe right = go to previous tab
          const prevTab = tabs[currentIndex - 1];
          onTabChangeRef.current(prevTab.id);
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(swipeX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
    [swipeX]
  );

  const currentIndex = getCurrentIndex();

  return {
    panHandlers: panResponder.panHandlers,
    swipeX,
    getCurrentIndex,
    canSwipeLeft: currentIndex < tabs.length - 1,
    canSwipeRight: currentIndex > 0,
  };
};

export default useSwipeNavigation;
