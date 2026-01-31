/**
 * useFeatureTracking Hook - Feature-Specific Event Tracking
 * GEM Platform Admin Analytics Dashboard
 *
 * Provides specialized tracking for specific features with:
 * - Start/complete pattern with duration tracking
 * - Action tracking
 * - Error tracking with context
 *
 * Created: January 30, 2026
 */

import { useRef, useCallback, useMemo } from 'react';
import { adminAnalyticsService } from '../services/adminAnalyticsService';
import {
  EVENT_CATEGORIES,
  EVENT_TYPES,
  EVENT_NAMES,
} from '../services/analyticsConstants';

/**
 * Generic feature tracking hook
 * Provides start/complete/action tracking for any feature
 *
 * @param {string} category - Feature category (from EVENT_CATEGORIES)
 * @param {string} featureName - Feature name for grouping
 * @param {string} pageName - Current page name
 * @returns {object} Tracking methods
 *
 * @example
 * const { trackStart, trackComplete, trackAction } = useFeatureTracking('scanner', 'pattern_scan', 'ScannerScreen');
 *
 * // Start tracking
 * trackStart({ pattern: 'UPD', timeframe: '1h' });
 *
 * // Track actions during
 * trackAction('filter_change', { filter: 'volume' });
 *
 * // Complete tracking (auto-calculates duration)
 * trackComplete({ results_count: 5 });
 */
export const useFeatureTracking = (category, featureName, pageName = null) => {
  const startTimeRef = useRef(null);
  const startDataRef = useRef(null);
  const isTrackingRef = useRef(false);

  // Track feature start
  const trackStart = useCallback((data = {}) => {
    startTimeRef.current = Date.now();
    startDataRef.current = data;
    isTrackingRef.current = true;

    adminAnalyticsService.trackEvent(
      EVENT_TYPES.START,
      category,
      `${featureName}_start`,
      null,
      data,
      pageName
    );
  }, [category, featureName, pageName]);

  // Track feature complete (with auto duration)
  const trackComplete = useCallback((data = {}, value = null) => {
    const durationMs = startTimeRef.current
      ? Date.now() - startTimeRef.current
      : null;

    adminAnalyticsService.trackEvent(
      EVENT_TYPES.COMPLETE,
      category,
      `${featureName}_complete`,
      value,
      {
        ...startDataRef.current,
        ...data,
        duration_ms: durationMs,
      },
      pageName
    );

    // Reset
    startTimeRef.current = null;
    startDataRef.current = null;
    isTrackingRef.current = false;
  }, [category, featureName, pageName]);

  // Track action during feature use
  const trackAction = useCallback((actionName, data = {}, value = null) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      category,
      actionName,
      value,
      {
        feature: featureName,
        ...data,
      },
      pageName
    );
  }, [category, featureName, pageName]);

  // Track error during feature use
  const trackError = useCallback((errorType, errorMessage, context = {}) => {
    adminAnalyticsService.trackError(
      errorType,
      errorMessage,
      pageName,
      {
        feature: featureName,
        category,
        ...context,
      }
    );
  }, [category, featureName, pageName]);

  // Track click
  const trackClick = useCallback((elementName, data = {}) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.CLICK,
      category,
      `${elementName}_click`,
      null,
      {
        feature: featureName,
        element: elementName,
        ...data,
      },
      pageName
    );
  }, [category, featureName, pageName]);

  // Get current duration (for UI display)
  const getDuration = useCallback(() => {
    if (!startTimeRef.current) return 0;
    return Date.now() - startTimeRef.current;
  }, []);

  // Check if currently tracking
  const isTracking = useCallback(() => {
    return isTrackingRef.current;
  }, []);

  // Cancel tracking without completion
  const cancelTracking = useCallback(() => {
    startTimeRef.current = null;
    startDataRef.current = null;
    isTrackingRef.current = false;
  }, []);

  return {
    trackStart,
    trackComplete,
    trackAction,
    trackError,
    trackClick,
    getDuration,
    isTracking,
    cancelTracking,
  };
};

// =====================================================
// SPECIALIZED HOOKS
// =====================================================

/**
 * Scanner tracking hook
 * Specialized for pattern scanning flow
 *
 * @param {string} pageName - Current page
 * @returns {object} Scanner tracking methods
 */
export const useScannerTracking = (pageName = 'ScannerScreen') => {
  const scanStartRef = useRef(null);

  const trackScanStart = useCallback((patternType, timeframe, symbol, filters = {}) => {
    scanStartRef.current = Date.now();
    adminAnalyticsService.trackScanStart(patternType, timeframe, symbol, filters);
  }, []);

  const trackScanComplete = useCallback((patternType, timeframe, symbol, resultsCount) => {
    const durationMs = scanStartRef.current ? Date.now() - scanStartRef.current : 0;
    adminAnalyticsService.trackScanComplete(patternType, timeframe, symbol, resultsCount, durationMs);
    scanStartRef.current = null;
  }, []);

  const trackPatternDetected = useCallback((patternType, symbol, patternData) => {
    adminAnalyticsService.trackPatternDetected(patternType, symbol, patternData);
  }, []);

  const trackPatternView = useCallback((patternId, patternType, symbol) => {
    adminAnalyticsService.trackPatternView(patternId, patternType, symbol);
  }, []);

  const trackFilterChange = useCallback((filterType, filterValue) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.SCANNER,
      EVENT_NAMES.scanner.FILTER_CHANGE,
      null,
      { filter_type: filterType, filter_value: filterValue },
      pageName
    );
  }, [pageName]);

  return {
    trackScanStart,
    trackScanComplete,
    trackPatternDetected,
    trackPatternView,
    trackFilterChange,
  };
};

/**
 * Ritual tracking hook
 * Specialized for ritual completion flow
 *
 * @param {string} pageName - Current page
 * @returns {object} Ritual tracking methods
 */
export const useRitualTracking = (pageName = 'RitualDetailScreen') => {
  const ritualStartRef = useRef(null);
  const currentRitualRef = useRef(null);

  const trackRitualStart = useCallback((ritualType, ritualName) => {
    ritualStartRef.current = Date.now();
    currentRitualRef.current = { type: ritualType, name: ritualName };
    adminAnalyticsService.trackRitualStart(ritualType, ritualName);
  }, []);

  const trackRitualComplete = useCallback((xpEarned = 0, reflection = null) => {
    const durationMs = ritualStartRef.current ? Date.now() - ritualStartRef.current : 0;
    const { type, name } = currentRitualRef.current || {};

    if (type && name) {
      adminAnalyticsService.trackRitualComplete(type, name, durationMs, xpEarned, reflection);
    }

    ritualStartRef.current = null;
    currentRitualRef.current = null;
  }, []);

  const trackRitualSkip = useCallback((stepNumber, reason = null) => {
    const { type } = currentRitualRef.current || {};
    if (type) {
      adminAnalyticsService.trackRitualSkip(type, stepNumber, reason);
    }
    ritualStartRef.current = null;
    currentRitualRef.current = null;
  }, []);

  const trackStepComplete = useCallback((stepNumber, stepName) => {
    const { type } = currentRitualRef.current || {};
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.COMPLETE,
      EVENT_CATEGORIES.RITUAL,
      EVENT_NAMES.ritual.STEP_COMPLETE,
      stepNumber,
      { ritual_type: type, step_number: stepNumber, step_name: stepName },
      pageName
    );
  }, [pageName]);

  const trackStreakAchieved = useCallback((streakType, streakCount) => {
    adminAnalyticsService.trackStreakAchieved(streakType, streakCount);
  }, []);

  const trackMoodRecorded = useCallback((mood, checkInType, note) => {
    adminAnalyticsService.trackMoodRecorded(mood, checkInType, note);
  }, []);

  // Get ritual duration so far
  const getRitualDuration = useCallback(() => {
    if (!ritualStartRef.current) return 0;
    return Date.now() - ritualStartRef.current;
  }, []);

  return {
    trackRitualStart,
    trackRitualComplete,
    trackRitualSkip,
    trackStepComplete,
    trackStreakAchieved,
    trackMoodRecorded,
    getRitualDuration,
  };
};

/**
 * Chatbot tracking hook
 * Specialized for GemMaster conversations
 *
 * @param {string} pageName - Current page
 * @returns {object} Chatbot tracking methods
 */
export const useChatbotTracking = (pageName = 'GemMasterScreen') => {
  const conversationStartRef = useRef(null);
  const messageCountRef = useRef(0);
  const conversationIdRef = useRef(null);
  const chatbotTypeRef = useRef(null);

  const trackConversationStart = useCallback((chatbotType, conversationId) => {
    conversationStartRef.current = Date.now();
    messageCountRef.current = 0;
    conversationIdRef.current = conversationId;
    chatbotTypeRef.current = chatbotType;

    adminAnalyticsService.trackChatbotStart(chatbotType, conversationId);
  }, []);

  const trackMessage = useCallback((messageType = 'text') => {
    messageCountRef.current += 1;
    adminAnalyticsService.trackChatbotMessage(chatbotTypeRef.current, messageType);
  }, []);

  const trackConversationEnd = useCallback((rating = null) => {
    const durationMs = conversationStartRef.current ? Date.now() - conversationStartRef.current : 0;

    adminAnalyticsService.trackChatbotEnd(
      chatbotTypeRef.current,
      conversationIdRef.current,
      messageCountRef.current,
      durationMs,
      rating
    );

    // Reset
    conversationStartRef.current = null;
    messageCountRef.current = 0;
    conversationIdRef.current = null;
    chatbotTypeRef.current = null;
  }, []);

  const trackWidgetCreated = useCallback((widgetType, widgetData) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.CHATBOT,
      EVENT_NAMES.chatbot.WIDGET_CREATED,
      null,
      {
        chatbot_type: chatbotTypeRef.current,
        widget_type: widgetType,
        ...widgetData,
      },
      pageName
    );
  }, [pageName]);

  const trackQuickAction = useCallback((actionName) => {
    trackMessage('quick_action');
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.CHATBOT,
      EVENT_NAMES.chatbot.QUICK_ACTION_USED,
      null,
      {
        chatbot_type: chatbotTypeRef.current,
        action_name: actionName,
      },
      pageName
    );
  }, [pageName]);

  return {
    trackConversationStart,
    trackMessage,
    trackConversationEnd,
    trackWidgetCreated,
    trackQuickAction,
    getMessageCount: () => messageCountRef.current,
  };
};

/**
 * Tarot tracking hook
 * Specialized for tarot readings
 *
 * @param {string} pageName - Current page
 * @returns {object} Tarot tracking methods
 */
export const useTarotTracking = (pageName = 'TarotReadingScreen') => {
  const readingStartRef = useRef(null);
  const cardsDrawnRef = useRef([]);
  const spreadTypeRef = useRef(null);

  const trackReadingStart = useCallback((spreadType, question = null) => {
    readingStartRef.current = Date.now();
    cardsDrawnRef.current = [];
    spreadTypeRef.current = spreadType;

    adminAnalyticsService.trackTarotStart(spreadType, question);
  }, []);

  const trackCardDrawn = useCallback((cardName, position, isReversed) => {
    cardsDrawnRef.current.push(cardName);
    adminAnalyticsService.trackTarotCardDrawn(cardName, position, isReversed);
  }, []);

  const trackReadingComplete = useCallback(() => {
    const durationMs = readingStartRef.current ? Date.now() - readingStartRef.current : 0;

    adminAnalyticsService.trackTarotComplete(
      spreadTypeRef.current,
      cardsDrawnRef.current,
      durationMs
    );

    // Reset
    readingStartRef.current = null;
    cardsDrawnRef.current = [];
    spreadTypeRef.current = null;
  }, []);

  const trackInterpretationViewed = useCallback((cardName, position) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.TAROT,
      EVENT_NAMES.tarot.INTERPRETATION_VIEWED,
      position,
      {
        spread_type: spreadTypeRef.current,
        card_name: cardName,
        position,
      },
      pageName
    );
  }, [pageName]);

  const trackReadingSaved = useCallback(() => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.TAROT,
      EVENT_NAMES.tarot.READING_SAVED,
      cardsDrawnRef.current.length,
      { spread_type: spreadTypeRef.current },
      pageName
    );
  }, [pageName]);

  const trackReadingShared = useCallback((shareMethod) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.SHARE,
      EVENT_CATEGORIES.TAROT,
      EVENT_NAMES.tarot.READING_SHARED,
      null,
      { spread_type: spreadTypeRef.current, share_method: shareMethod },
      pageName
    );
  }, [pageName]);

  return {
    trackReadingStart,
    trackCardDrawn,
    trackReadingComplete,
    trackInterpretationViewed,
    trackReadingSaved,
    trackReadingShared,
    getCardsDrawn: () => cardsDrawnRef.current,
  };
};

/**
 * I-Ching tracking hook
 * Specialized for I-Ching readings
 *
 * @param {string} pageName - Current page
 * @returns {object} I-Ching tracking methods
 */
export const useIChingTracking = (pageName = 'IChingScreen') => {
  const readingStartRef = useRef(null);
  const throwCountRef = useRef(0);

  const trackReadingStart = useCallback((question = null) => {
    readingStartRef.current = Date.now();
    throwCountRef.current = 0;

    adminAnalyticsService.trackIChingStart(question);
  }, []);

  const trackCoinsThrown = useCallback((throwNumber, result) => {
    throwCountRef.current += 1;
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.ICHING,
      EVENT_NAMES.iching.COINS_THROWN,
      throwNumber,
      { throw_number: throwNumber, result },
      pageName
    );
  }, [pageName]);

  const trackReadingComplete = useCallback((hexagramNumber, hexagramName, changingLines) => {
    const durationMs = readingStartRef.current ? Date.now() - readingStartRef.current : 0;

    adminAnalyticsService.trackIChingComplete(
      hexagramNumber,
      hexagramName,
      changingLines,
      durationMs
    );

    // Reset
    readingStartRef.current = null;
    throwCountRef.current = 0;
  }, []);

  const trackInterpretationViewed = useCallback((section) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.ICHING,
      EVENT_NAMES.iching.INTERPRETATION_VIEWED,
      null,
      { section },
      pageName
    );
  }, [pageName]);

  const trackReadingSaved = useCallback((hexagramNumber) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.ICHING,
      EVENT_NAMES.iching.READING_SAVED,
      hexagramNumber,
      { hexagram_number: hexagramNumber },
      pageName
    );
  }, [pageName]);

  return {
    trackReadingStart,
    trackCoinsThrown,
    trackReadingComplete,
    trackInterpretationViewed,
    trackReadingSaved,
    getThrowCount: () => throwCountRef.current,
  };
};

/**
 * Shop tracking hook
 * Specialized for e-commerce flow
 *
 * @param {string} pageName - Current page
 * @returns {object} Shop tracking methods
 */
export const useShopTracking = (pageName = 'ShopScreen') => {
  const trackProductView = useCallback((productId, productName, productType, price) => {
    adminAnalyticsService.trackProductView(productId, productName, productType, price);
  }, []);

  const trackAddToCart = useCallback((productId, productName, quantity, price) => {
    adminAnalyticsService.trackAddToCart(productId, productName, quantity, price);
  }, []);

  const trackRemoveFromCart = useCallback((productId, productName, quantity) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.SHOP,
      EVENT_NAMES.shop.REMOVE_FROM_CART,
      quantity,
      { product_id: productId, product_name: productName, quantity },
      pageName
    );
  }, [pageName]);

  const trackCheckoutStart = useCallback((cartValue, itemCount) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.START,
      EVENT_CATEGORIES.SHOP,
      EVENT_NAMES.shop.CHECKOUT_START,
      cartValue,
      { cart_value: cartValue, item_count: itemCount },
      pageName
    );
  }, [pageName]);

  const trackPurchase = useCallback((orderId, orderTotal, items, paymentMethod) => {
    adminAnalyticsService.trackPurchase(orderId, orderTotal, items, paymentMethod);
  }, []);

  const trackPromoCodeApplied = useCallback((code, discount) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.SHOP,
      EVENT_NAMES.shop.PROMO_CODE_APPLIED,
      discount,
      { code, discount },
      pageName
    );
  }, [pageName]);

  const trackWishlistAdd = useCallback((productId, productName) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.SHOP,
      EVENT_NAMES.shop.WISHLIST_ADD,
      null,
      { product_id: productId, product_name: productName },
      pageName
    );
  }, [pageName]);

  const trackSearch = useCallback((query, resultsCount) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.SEARCH,
      EVENT_CATEGORIES.SHOP,
      EVENT_NAMES.shop.PRODUCT_SEARCH,
      resultsCount,
      { query, results_count: resultsCount },
      pageName
    );
  }, [pageName]);

  return {
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckoutStart,
    trackPurchase,
    trackPromoCodeApplied,
    trackWishlistAdd,
    trackSearch,
  };
};

/**
 * Course tracking hook
 * Specialized for learning/education flow
 *
 * @param {string} pageName - Current page
 * @returns {object} Course tracking methods
 */
export const useCourseTracking = (pageName = 'CoursesScreen') => {
  const lessonStartRef = useRef(null);
  const currentLessonRef = useRef(null);

  const trackCourseView = useCallback((courseId, courseName, category) => {
    adminAnalyticsService.trackCourseView(courseId, courseName, category);
  }, []);

  const trackCourseEnroll = useCallback((courseId, courseName, price) => {
    adminAnalyticsService.trackCourseEnroll(courseId, courseName, price);
  }, []);

  const trackLessonStart = useCallback((courseId, lessonId, lessonNumber) => {
    lessonStartRef.current = Date.now();
    currentLessonRef.current = { courseId, lessonId, lessonNumber };

    adminAnalyticsService.trackEvent(
      EVENT_TYPES.START,
      EVENT_CATEGORIES.COURSES,
      EVENT_NAMES.courses.LESSON_START,
      lessonNumber,
      { course_id: courseId, lesson_id: lessonId, lesson_number: lessonNumber },
      pageName
    );
  }, [pageName]);

  const trackLessonComplete = useCallback((progress) => {
    const durationMs = lessonStartRef.current ? Date.now() - lessonStartRef.current : 0;
    const { courseId, lessonId, lessonNumber } = currentLessonRef.current || {};

    if (courseId && lessonId) {
      adminAnalyticsService.trackLessonComplete(courseId, lessonId, lessonNumber, durationMs, progress);
    }

    lessonStartRef.current = null;
    currentLessonRef.current = null;
  }, []);

  const trackLessonProgress = useCallback((progress, videoTime) => {
    const { courseId, lessonId } = currentLessonRef.current || {};
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.COURSES,
      EVENT_NAMES.courses.LESSON_PROGRESS,
      progress,
      { course_id: courseId, lesson_id: lessonId, progress, video_time: videoTime },
      pageName
    );
  }, [pageName]);

  const trackQuizSubmit = useCallback((courseId, quizId, score, passed) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.COMPLETE,
      EVENT_CATEGORIES.COURSES,
      passed ? EVENT_NAMES.courses.QUIZ_PASS : EVENT_NAMES.courses.QUIZ_FAIL,
      score,
      { course_id: courseId, quiz_id: quizId, score, passed },
      pageName
    );
  }, [pageName]);

  const trackCertificateEarned = useCallback((courseId, courseName) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.COMPLETE,
      EVENT_CATEGORIES.COURSES,
      EVENT_NAMES.courses.CERTIFICATE_EARNED,
      null,
      { course_id: courseId, course_name: courseName },
      pageName
    );
  }, [pageName]);

  return {
    trackCourseView,
    trackCourseEnroll,
    trackLessonStart,
    trackLessonComplete,
    trackLessonProgress,
    trackQuizSubmit,
    trackCertificateEarned,
    getLessonDuration: () => lessonStartRef.current ? Date.now() - lessonStartRef.current : 0,
  };
};

/**
 * Affiliate tracking hook
 * Specialized for affiliate/referral tracking
 *
 * @param {string} pageName - Current page
 * @returns {object} Affiliate tracking methods
 */
export const useAffiliateTracking = (pageName = 'AffiliateDashboardScreen') => {
  const trackDashboardView = useCallback(() => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.AFFILIATE,
      EVENT_NAMES.affiliate.DASHBOARD_VIEW,
      null,
      {},
      pageName
    );
  }, [pageName]);

  const trackLinkGenerate = useCallback((linkId, campaignName) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.AFFILIATE,
      EVENT_NAMES.affiliate.LINK_GENERATE,
      null,
      { link_id: linkId, campaign_name: campaignName },
      pageName
    );
  }, [pageName]);

  const trackLinkCopy = useCallback((linkId) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.AFFILIATE,
      EVENT_NAMES.affiliate.LINK_COPY,
      null,
      { link_id: linkId },
      pageName
    );
  }, [pageName]);

  const trackLinkShare = useCallback((linkId, shareMethod) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.SHARE,
      EVENT_CATEGORIES.AFFILIATE,
      EVENT_NAMES.affiliate.LINK_SHARE,
      null,
      { link_id: linkId, share_method: shareMethod },
      pageName
    );
  }, [pageName]);

  const trackWithdrawalRequest = useCallback((amount, method) => {
    adminAnalyticsService.trackEvent(
      EVENT_TYPES.ACTION,
      EVENT_CATEGORIES.AFFILIATE,
      EVENT_NAMES.affiliate.WITHDRAWAL_REQUEST,
      amount,
      { amount, method },
      pageName
    );
  }, [pageName]);

  return {
    trackDashboardView,
    trackLinkGenerate,
    trackLinkCopy,
    trackLinkShare,
    trackWithdrawalRequest,
  };
};

export default useFeatureTracking;
