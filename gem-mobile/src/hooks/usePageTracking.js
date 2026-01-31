/**
 * usePageTracking Hook - Automatic Page View Tracking
 * GEM Platform Admin Analytics Dashboard
 *
 * Drop-in hook for screens to automatically track:
 * - Page view when screen mounts
 * - Time spent on page when leaving
 * - Previous page navigation flow
 *
 * Created: January 30, 2026
 */

import { useEffect, useRef, useCallback } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { adminAnalyticsService } from '../services/adminAnalyticsService';
import { PAGE_NAMES, PAGE_CATEGORIES } from '../services/analyticsConstants';

// Track the previous page globally for navigation flow
let globalPreviousPage = null;
let globalPreviousPageEnteredAt = null;

/**
 * Auto page tracking hook
 * Simply add to any screen: usePageTracking('ScreenName')
 *
 * @param {string} pageName - Screen/page name (use PAGE_NAMES constants)
 * @param {object} additionalData - Extra data to track with page view
 * @returns {object} { trackCustomEvent, setAdditionalData }
 */
export const usePageTracking = (pageName, additionalData = {}) => {
  const navigation = useNavigation();
  const route = useRoute();

  const enteredAtRef = useRef(null);
  const additionalDataRef = useRef(additionalData);
  const pageNameRef = useRef(pageName);
  const hasTrackedRef = useRef(false);

  // Update refs when props change
  useEffect(() => {
    additionalDataRef.current = additionalData;
    pageNameRef.current = pageName;
  }, [additionalData, pageName]);

  // Track page view on focus
  useFocusEffect(
    useCallback(() => {
      // Entered the page
      const now = Date.now();
      enteredAtRef.current = now;
      hasTrackedRef.current = false;

      // Calculate time on previous page
      let timeOnPreviousPageMs = null;
      if (globalPreviousPageEnteredAt) {
        timeOnPreviousPageMs = now - globalPreviousPageEnteredAt;
      }

      // Track page view
      adminAnalyticsService.trackPageView(
        pageNameRef.current,
        {
          ...additionalDataRef.current,
          ...route.params,
        },
        globalPreviousPage,
        timeOnPreviousPageMs
      );

      hasTrackedRef.current = true;

      // Return cleanup function (runs when losing focus)
      return () => {
        // Store current page as previous for next navigation
        globalPreviousPage = pageNameRef.current;
        globalPreviousPageEnteredAt = enteredAtRef.current;
      };
    }, [route.params])
  );

  // Method to update additional data after mount
  const setAdditionalData = useCallback((newData) => {
    additionalDataRef.current = {
      ...additionalDataRef.current,
      ...newData,
    };
  }, []);

  // Method to track custom events on this page
  const trackCustomEvent = useCallback((eventName, eventData = {}) => {
    adminAnalyticsService.trackEvent(
      'action',
      PAGE_CATEGORIES[pageNameRef.current] || 'other',
      eventName,
      null,
      eventData,
      pageNameRef.current
    );
  }, []);

  // Get time spent on current page
  const getTimeOnPage = useCallback(() => {
    if (!enteredAtRef.current) return 0;
    return Date.now() - enteredAtRef.current;
  }, []);

  return {
    trackCustomEvent,
    setAdditionalData,
    getTimeOnPage,
    pageName: pageNameRef.current,
  };
};

/**
 * Hook to track page view only once (for modals, overlays)
 * Does not track time or navigation flow
 *
 * @param {string} pageName - Page name
 * @param {object} additionalData - Extra data
 */
export const usePageViewOnce = (pageName, additionalData = {}) => {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current) {
      adminAnalyticsService.trackPageView(pageName, additionalData, null, null);
      trackedRef.current = true;
    }
  }, [pageName, additionalData]);
};

/**
 * Hook to manually control page tracking
 * Useful for screens with complex lifecycle
 *
 * @returns {object} { trackPageEnter, trackPageLeave }
 */
export const useManualPageTracking = () => {
  const enteredAtRef = useRef(null);
  const currentPageRef = useRef(null);

  const trackPageEnter = useCallback((pageName, additionalData = {}) => {
    const now = Date.now();

    // Calculate time on previous page
    let timeOnPreviousPageMs = null;
    if (globalPreviousPageEnteredAt && currentPageRef.current) {
      timeOnPreviousPageMs = now - globalPreviousPageEnteredAt;
    }

    // Track page view
    adminAnalyticsService.trackPageView(
      pageName,
      additionalData,
      globalPreviousPage,
      timeOnPreviousPageMs
    );

    // Update state
    currentPageRef.current = pageName;
    enteredAtRef.current = now;
  }, []);

  const trackPageLeave = useCallback(() => {
    if (currentPageRef.current && enteredAtRef.current) {
      globalPreviousPage = currentPageRef.current;
      globalPreviousPageEnteredAt = enteredAtRef.current;

      currentPageRef.current = null;
      enteredAtRef.current = null;
    }
  }, []);

  // Get time spent on current page
  const getTimeOnPage = useCallback(() => {
    if (!enteredAtRef.current) return 0;
    return Date.now() - enteredAtRef.current;
  }, []);

  return {
    trackPageEnter,
    trackPageLeave,
    getTimeOnPage,
  };
};

/**
 * Reset page tracking state (use on logout)
 */
export const resetPageTracking = () => {
  globalPreviousPage = null;
  globalPreviousPageEnteredAt = null;
};

export default usePageTracking;
