/**
 * useScrollToTop Hook
 * Subscribes to tab double-tap events and provides scroll-to-top + refresh functionality
 *
 * Usage:
 * const { scrollViewRef, handleRefresh } = useScrollToTop('Home', fetchData);
 *
 * <ScrollView ref={scrollViewRef} ... />
 */

import { useRef, useEffect, useCallback } from 'react';
import { useTabBar } from '../contexts/TabBarContext';

/**
 * Hook to handle scroll-to-top and refresh when user double-taps on a tab
 * @param {string} tabName - The tab name to listen for (e.g., 'Home', 'Shop', 'Trading')
 * @param {function} onRefresh - Optional callback to refresh data
 * @returns {{ scrollViewRef: React.Ref, triggerScrollToTopAndRefresh: function }}
 */
export default function useScrollToTop(tabName, onRefresh) {
  const scrollViewRef = useRef(null);

  // Try to get subscribeToScrollToTop from context
  let subscribeToScrollToTop = null;
  try {
    const tabBarContext = useTabBar();
    subscribeToScrollToTop = tabBarContext?.subscribeToScrollToTop;
  } catch (e) {
    // Context not available - this is fine, hook just won't do anything
  }

  // Handle scroll to top and refresh
  const triggerScrollToTopAndRefresh = useCallback(() => {
    console.log(`[useScrollToTop] Triggered for tab: ${tabName}`);

    // Scroll to top
    if (scrollViewRef.current) {
      if (scrollViewRef.current.scrollTo) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      } else if (scrollViewRef.current.scrollToOffset) {
        // FlatList support
        scrollViewRef.current.scrollToOffset({ offset: 0, animated: true });
      } else if (scrollViewRef.current.scrollToTop) {
        // Some components have scrollToTop method
        scrollViewRef.current.scrollToTop();
      }
    }

    // Trigger refresh after a short delay (to let scroll animation start)
    if (onRefresh) {
      setTimeout(() => {
        onRefresh();
      }, 100);
    }
  }, [tabName, onRefresh]);

  // Subscribe to double-tap events
  useEffect(() => {
    if (!subscribeToScrollToTop) return;

    const unsubscribe = subscribeToScrollToTop(tabName, triggerScrollToTopAndRefresh);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [tabName, subscribeToScrollToTop, triggerScrollToTopAndRefresh]);

  return {
    scrollViewRef,
    triggerScrollToTopAndRefresh,
  };
}
