/**
 * useAnalytics Hook - Main Analytics Access Hook
 * GEM Platform Admin Analytics Dashboard
 *
 * Provides access to analytics service with context-aware tracking.
 * Auto-initializes with auth context.
 *
 * Created: January 30, 2026
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminAnalyticsService } from '../services/adminAnalyticsService';

/**
 * Main analytics hook - provides all tracking methods
 * Auto-initializes when user is authenticated
 *
 * @returns {object} Analytics tracking methods and state
 */
export const useAnalytics = () => {
  const { user, profile } = useAuth();
  const cleanupRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize analytics when user is available
  useEffect(() => {
    const init = async () => {
      if (user?.id) {
        const userTier = profile?.tier || 'free';
        const cleanup = await adminAnalyticsService.initialize(user.id, userTier);
        cleanupRef.current = cleanup;
        setIsReady(true);
      }
    };

    init();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [user?.id, profile?.tier]);

  // Update user tier when it changes
  useEffect(() => {
    if (isReady && profile?.tier) {
      adminAnalyticsService.updateUser(profile.tier);
    }
  }, [isReady, profile?.tier]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      adminAnalyticsService.cleanup();
    };
  }, []);

  // =====================================================
  // TRACKING METHODS (memoized)
  // =====================================================

  // Page view tracking
  const trackPageView = useCallback((pageName, params, previousPage, timeOnPreviousPageMs) => {
    if (!isReady) return;
    adminAnalyticsService.trackPageView(pageName, params, previousPage, timeOnPreviousPageMs);
  }, [isReady]);

  // Generic event tracking
  const trackEvent = useCallback((type, category, name, value, data, pageName) => {
    if (!isReady) return;
    adminAnalyticsService.trackEvent(type, category, name, value, data, pageName);
  }, [isReady]);

  // Scanner tracking
  const trackScanStart = useCallback((patternType, timeframe, symbol, filters) => {
    if (!isReady) return;
    adminAnalyticsService.trackScanStart(patternType, timeframe, symbol, filters);
  }, [isReady]);

  const trackScanComplete = useCallback((patternType, timeframe, symbol, resultsCount, durationMs) => {
    if (!isReady) return;
    adminAnalyticsService.trackScanComplete(patternType, timeframe, symbol, resultsCount, durationMs);
  }, [isReady]);

  const trackPatternDetected = useCallback((patternType, symbol, patternData) => {
    if (!isReady) return;
    adminAnalyticsService.trackPatternDetected(patternType, symbol, patternData);
  }, [isReady]);

  const trackPatternView = useCallback((patternId, patternType, symbol) => {
    if (!isReady) return;
    adminAnalyticsService.trackPatternView(patternId, patternType, symbol);
  }, [isReady]);

  // Ritual tracking
  const trackRitualStart = useCallback((ritualType, ritualName) => {
    if (!isReady) return;
    adminAnalyticsService.trackRitualStart(ritualType, ritualName);
  }, [isReady]);

  const trackRitualComplete = useCallback((ritualType, ritualName, durationMs, xpEarned, reflection) => {
    if (!isReady) return;
    adminAnalyticsService.trackRitualComplete(ritualType, ritualName, durationMs, xpEarned, reflection);
  }, [isReady]);

  const trackRitualSkip = useCallback((ritualType, stepNumber, reason) => {
    if (!isReady) return;
    adminAnalyticsService.trackRitualSkip(ritualType, stepNumber, reason);
  }, [isReady]);

  const trackStreakAchieved = useCallback((streakType, streakCount) => {
    if (!isReady) return;
    adminAnalyticsService.trackStreakAchieved(streakType, streakCount);
  }, [isReady]);

  const trackMoodRecorded = useCallback((mood, checkInType, note) => {
    if (!isReady) return;
    adminAnalyticsService.trackMoodRecorded(mood, checkInType, note);
  }, [isReady]);

  // Chatbot tracking
  const trackChatbotStart = useCallback((chatbotType, conversationId) => {
    if (!isReady) return;
    adminAnalyticsService.trackChatbotStart(chatbotType, conversationId);
  }, [isReady]);

  const trackChatbotEnd = useCallback((chatbotType, conversationId, messageCount, durationMs, rating) => {
    if (!isReady) return;
    adminAnalyticsService.trackChatbotEnd(chatbotType, conversationId, messageCount, durationMs, rating);
  }, [isReady]);

  const trackChatbotMessage = useCallback((chatbotType, messageType) => {
    if (!isReady) return;
    adminAnalyticsService.trackChatbotMessage(chatbotType, messageType);
  }, [isReady]);

  // Tarot tracking
  const trackTarotStart = useCallback((spreadType, question) => {
    if (!isReady) return;
    adminAnalyticsService.trackTarotStart(spreadType, question);
  }, [isReady]);

  const trackTarotComplete = useCallback((spreadType, cardsDrawn, durationMs) => {
    if (!isReady) return;
    adminAnalyticsService.trackTarotComplete(spreadType, cardsDrawn, durationMs);
  }, [isReady]);

  const trackTarotCardDrawn = useCallback((cardName, position, isReversed) => {
    if (!isReady) return;
    adminAnalyticsService.trackTarotCardDrawn(cardName, position, isReversed);
  }, [isReady]);

  // I-Ching tracking
  const trackIChingStart = useCallback((question) => {
    if (!isReady) return;
    adminAnalyticsService.trackIChingStart(question);
  }, [isReady]);

  const trackIChingComplete = useCallback((hexagramNumber, hexagramName, changingLines, durationMs) => {
    if (!isReady) return;
    adminAnalyticsService.trackIChingComplete(hexagramNumber, hexagramName, changingLines, durationMs);
  }, [isReady]);

  // Shop tracking
  const trackProductView = useCallback((productId, productName, productType, price) => {
    if (!isReady) return;
    adminAnalyticsService.trackProductView(productId, productName, productType, price);
  }, [isReady]);

  const trackAddToCart = useCallback((productId, productName, quantity, price) => {
    if (!isReady) return;
    adminAnalyticsService.trackAddToCart(productId, productName, quantity, price);
  }, [isReady]);

  const trackPurchase = useCallback((orderId, orderTotal, items, paymentMethod) => {
    if (!isReady) return;
    adminAnalyticsService.trackPurchase(orderId, orderTotal, items, paymentMethod);
  }, [isReady]);

  // Course tracking
  const trackCourseView = useCallback((courseId, courseName, category) => {
    if (!isReady) return;
    adminAnalyticsService.trackCourseView(courseId, courseName, category);
  }, [isReady]);

  const trackCourseEnroll = useCallback((courseId, courseName, price) => {
    if (!isReady) return;
    adminAnalyticsService.trackCourseEnroll(courseId, courseName, price);
  }, [isReady]);

  const trackLessonComplete = useCallback((courseId, lessonId, lessonNumber, durationMs, progress) => {
    if (!isReady) return;
    adminAnalyticsService.trackLessonComplete(courseId, lessonId, lessonNumber, durationMs, progress);
  }, [isReady]);

  // Affiliate tracking
  const trackAffiliateClick = useCallback((linkId, affiliateId, source) => {
    if (!isReady) return;
    adminAnalyticsService.trackAffiliateClick(linkId, affiliateId, source);
  }, [isReady]);

  const trackAffiliateConversion = useCallback((linkId, affiliateId, conversionType, orderValue) => {
    if (!isReady) return;
    adminAnalyticsService.trackAffiliateConversion(linkId, affiliateId, conversionType, orderValue);
  }, [isReady]);

  // Forum tracking
  const trackPostView = useCallback((postId, authorId) => {
    if (!isReady) return;
    adminAnalyticsService.trackPostView(postId, authorId);
  }, [isReady]);

  const trackPostInteraction = useCallback((postId, action) => {
    if (!isReady) return;
    adminAnalyticsService.trackPostInteraction(postId, action);
  }, [isReady]);

  // Error tracking
  const trackError = useCallback((errorType, errorMessage, pageName, context) => {
    if (!isReady) return;
    adminAnalyticsService.trackError(errorType, errorMessage, pageName, context);
  }, [isReady]);

  return {
    isReady,

    // Core
    trackPageView,
    trackEvent,

    // Scanner
    trackScanStart,
    trackScanComplete,
    trackPatternDetected,
    trackPatternView,

    // Ritual
    trackRitualStart,
    trackRitualComplete,
    trackRitualSkip,
    trackStreakAchieved,
    trackMoodRecorded,

    // Chatbot
    trackChatbotStart,
    trackChatbotEnd,
    trackChatbotMessage,

    // Tarot
    trackTarotStart,
    trackTarotComplete,
    trackTarotCardDrawn,

    // I-Ching
    trackIChingStart,
    trackIChingComplete,

    // Shop
    trackProductView,
    trackAddToCart,
    trackPurchase,

    // Courses
    trackCourseView,
    trackCourseEnroll,
    trackLessonComplete,

    // Affiliate
    trackAffiliateClick,
    trackAffiliateConversion,

    // Forum
    trackPostView,
    trackPostInteraction,

    // Error
    trackError,
  };
};

export default useAnalytics;
