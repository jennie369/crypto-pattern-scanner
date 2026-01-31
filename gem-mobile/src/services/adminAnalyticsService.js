/**
 * Admin Analytics Service - Core Tracking Engine
 * GEM Platform Admin Analytics Dashboard
 *
 * Features:
 * - Session management (30-min timeout)
 * - Event queue with batch insert (30-sec flush)
 * - Offline queue with AsyncStorage sync
 * - Specialized tracking for all features
 * - Auto page view tracking
 * - Error tracking
 *
 * Created: January 30, 2026
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { supabase } from './supabase';
import {
  EVENT_CATEGORIES,
  EVENT_TYPES,
  EVENT_NAMES,
  PAGE_NAMES,
  PAGE_CATEGORIES,
  RITUAL_TYPES,
  CHATBOT_TYPES,
  SCANNER_PATTERNS,
  TIMEFRAMES,
} from './analyticsConstants';

const SERVICE_NAME = '[AdminAnalyticsService]';

// =====================================================
// CONFIGURATION
// =====================================================

const CONFIG = {
  // Session timeout in milliseconds (30 minutes)
  SESSION_TIMEOUT_MS: 30 * 60 * 1000,

  // Batch flush interval (30 seconds)
  BATCH_FLUSH_INTERVAL_MS: 30 * 1000,

  // Max events per batch insert
  MAX_BATCH_SIZE: 50,

  // Offline queue storage key
  OFFLINE_QUEUE_KEY: '@gem_analytics_offline_queue',

  // Session storage key
  SESSION_KEY: '@gem_analytics_session',

  // Enable debug logging
  DEBUG: __DEV__,

  // Feature flags
  FEATURES: {
    trackPageViews: true,
    trackEvents: true,
    trackSessions: true,
    trackErrors: true,
    offlineQueue: true,
  },
};

// =====================================================
// STATE
// =====================================================

let state = {
  // Current session
  session: null,
  sessionExpiresAt: null,

  // Current user
  userId: null,
  userTier: null,

  // Event queue
  eventQueue: [],
  pageViewQueue: [],

  // Timers
  flushTimer: null,
  sessionCheckTimer: null,

  // Connectivity
  isOnline: true,

  // App state
  appState: 'active',
  lastActiveAt: Date.now(),

  // Device info
  deviceInfo: null,

  // Initialization
  isInitialized: false,
};

// =====================================================
// HELPERS
// =====================================================

const log = (...args) => {
  if (CONFIG.DEBUG) {
    console.log(SERVICE_NAME, ...args);
  }
};

const logError = (...args) => {
  console.error(SERVICE_NAME, ...args);
};

const generateSessionId = () => {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

const getTimestamp = () => new Date().toISOString();

const getHour = () => new Date().getHours();

const getDayOfWeek = () => new Date().getDay();

// =====================================================
// DEVICE INFO
// =====================================================

const getDeviceInfo = async () => {
  if (state.deviceInfo) return state.deviceInfo;

  try {
    // Get Android ID or iOS identifier
    let uniqueId = 'unknown';
    if (Platform.OS === 'android') {
      uniqueId = Application.getAndroidId() || 'unknown';
    } else if (Platform.OS === 'ios') {
      uniqueId = await Application.getIosIdForVendorAsync() || 'unknown';
    }

    state.deviceInfo = {
      platform: Platform.OS,
      os_version: Device.osVersion || Platform.Version?.toString() || 'unknown',
      device_model: Device.modelName || 'unknown',
      device_brand: Device.brand || 'unknown',
      app_version: Application.nativeApplicationVersion || 'unknown',
      build_number: Application.nativeBuildVersion || 'unknown',
      is_tablet: Device.deviceType === Device.DeviceType.TABLET,
      unique_id: uniqueId,
    };
  } catch (error) {
    logError('getDeviceInfo error:', error);
    state.deviceInfo = {
      platform: Platform.OS,
      os_version: 'unknown',
      device_model: 'unknown',
      device_brand: 'unknown',
      app_version: 'unknown',
      build_number: 'unknown',
      is_tablet: false,
      unique_id: 'unknown',
    };
  }

  return state.deviceInfo;
};

// =====================================================
// SESSION MANAGEMENT
// =====================================================

const createSession = async () => {
  const sessionId = generateSessionId();
  const deviceInfo = await getDeviceInfo();
  const now = new Date();

  state.session = {
    id: sessionId,
    user_id: state.userId,
    started_at: now.toISOString(),
    device_info: deviceInfo,
    app_version: deviceInfo.app_version,
    platform: deviceInfo.platform,
    referrer: null,
  };

  state.sessionExpiresAt = now.getTime() + CONFIG.SESSION_TIMEOUT_MS;

  // Save session to storage
  await saveSessionToStorage();

  // Insert session to database
  if (state.isOnline) {
    try {
      const { error } = await supabase
        .from('analytics_sessions')
        .insert({
          id: sessionId,
          user_id: state.userId,
          started_at: state.session.started_at,
          device_info: deviceInfo,
          app_version: deviceInfo.app_version,
          platform: deviceInfo.platform,
        });

      if (error) throw error;
      log('Session created:', sessionId);
    } catch (error) {
      logError('createSession insert error:', error);
    }
  }

  return sessionId;
};

const getOrCreateSession = async () => {
  const now = Date.now();

  // Check if current session is still valid
  if (state.session && state.sessionExpiresAt && now < state.sessionExpiresAt) {
    // Extend session
    state.sessionExpiresAt = now + CONFIG.SESSION_TIMEOUT_MS;
    return state.session.id;
  }

  // Try to restore session from storage
  const restored = await restoreSessionFromStorage();
  if (restored && now < state.sessionExpiresAt) {
    return state.session.id;
  }

  // Create new session
  return createSession();
};

const endSession = async () => {
  if (!state.session) return;

  const now = new Date();
  const durationMs = now.getTime() - new Date(state.session.started_at).getTime();

  // Update session in database
  if (state.isOnline) {
    try {
      const { error } = await supabase
        .from('analytics_sessions')
        .update({
          ended_at: now.toISOString(),
          duration_seconds: Math.round(durationMs / 1000),
        })
        .eq('id', state.session.id);

      if (error) throw error;
      log('Session ended:', state.session.id);
    } catch (error) {
      logError('endSession update error:', error);
    }
  }

  state.session = null;
  state.sessionExpiresAt = null;
  await AsyncStorage.removeItem(CONFIG.SESSION_KEY);
};

const saveSessionToStorage = async () => {
  try {
    await AsyncStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify({
      session: state.session,
      sessionExpiresAt: state.sessionExpiresAt,
    }));
  } catch (error) {
    logError('saveSessionToStorage error:', error);
  }
};

const restoreSessionFromStorage = async () => {
  try {
    const stored = await AsyncStorage.getItem(CONFIG.SESSION_KEY);
    if (stored) {
      const { session, sessionExpiresAt } = JSON.parse(stored);
      state.session = session;
      state.sessionExpiresAt = sessionExpiresAt;
      return true;
    }
  } catch (error) {
    logError('restoreSessionFromStorage error:', error);
  }
  return false;
};

// =====================================================
// EVENT QUEUE MANAGEMENT
// =====================================================

const queueEvent = (event) => {
  if (!CONFIG.FEATURES.trackEvents) return;

  state.eventQueue.push({
    ...event,
    queued_at: Date.now(),
  });

  log('Event queued:', event.event_name, 'Queue size:', state.eventQueue.length);

  // Check if we should flush
  if (state.eventQueue.length >= CONFIG.MAX_BATCH_SIZE) {
    flushEventQueue();
  }
};

const queuePageView = (pageView) => {
  if (!CONFIG.FEATURES.trackPageViews) return;

  state.pageViewQueue.push({
    ...pageView,
    queued_at: Date.now(),
  });

  log('Page view queued:', pageView.page_name, 'Queue size:', state.pageViewQueue.length);

  // Check if we should flush
  if (state.pageViewQueue.length >= CONFIG.MAX_BATCH_SIZE) {
    flushPageViewQueue();
  }
};

const flushEventQueue = async () => {
  if (state.eventQueue.length === 0) return;

  if (!state.isOnline) {
    log('Offline - saving events to offline queue');
    await saveToOfflineQueue('events', [...state.eventQueue]);
    state.eventQueue = [];
    return;
  }

  const eventsToFlush = state.eventQueue.splice(0, CONFIG.MAX_BATCH_SIZE);
  log('Flushing events:', eventsToFlush.length);

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert(eventsToFlush.map(e => ({
        user_id: e.user_id,
        session_id: e.session_id,
        event_type: e.event_type,
        event_category: e.event_category,
        event_name: e.event_name,
        event_value: e.event_value,
        event_data: e.event_data,
        page_name: e.page_name,
        platform: e.platform,
        app_version: e.app_version,
        hour_of_day: e.hour_of_day,
        day_of_week: e.day_of_week,
        created_at: e.created_at,
      })));

    if (error) throw error;
    log('Events flushed successfully');
  } catch (error) {
    logError('flushEventQueue error:', error);
    // Re-queue events on failure
    state.eventQueue.unshift(...eventsToFlush);
    await saveToOfflineQueue('events', eventsToFlush);
  }
};

const flushPageViewQueue = async () => {
  if (state.pageViewQueue.length === 0) return;

  if (!state.isOnline) {
    log('Offline - saving page views to offline queue');
    await saveToOfflineQueue('pageViews', [...state.pageViewQueue]);
    state.pageViewQueue = [];
    return;
  }

  const pageViewsToFlush = state.pageViewQueue.splice(0, CONFIG.MAX_BATCH_SIZE);
  log('Flushing page views:', pageViewsToFlush.length);

  try {
    const { error } = await supabase
      .from('analytics_page_views')
      .insert(pageViewsToFlush.map(pv => ({
        user_id: pv.user_id,
        session_id: pv.session_id,
        page_name: pv.page_name,
        page_category: pv.page_category,
        previous_page: pv.previous_page,
        time_on_page_ms: pv.time_on_page_ms,
        screen_params: pv.screen_params,
        platform: pv.platform,
        app_version: pv.app_version,
        hour_of_day: pv.hour_of_day,
        day_of_week: pv.day_of_week,
        created_at: pv.created_at,
      })));

    if (error) throw error;
    log('Page views flushed successfully');
  } catch (error) {
    logError('flushPageViewQueue error:', error);
    // Re-queue on failure
    state.pageViewQueue.unshift(...pageViewsToFlush);
    await saveToOfflineQueue('pageViews', pageViewsToFlush);
  }
};

const flushAllQueues = async () => {
  await Promise.all([
    flushEventQueue(),
    flushPageViewQueue(),
  ]);
};

// =====================================================
// OFFLINE QUEUE
// =====================================================

const saveToOfflineQueue = async (type, items) => {
  if (!CONFIG.FEATURES.offlineQueue) return;

  try {
    const stored = await AsyncStorage.getItem(CONFIG.OFFLINE_QUEUE_KEY);
    const queue = stored ? JSON.parse(stored) : { events: [], pageViews: [] };

    if (type === 'events') {
      queue.events.push(...items);
    } else if (type === 'pageViews') {
      queue.pageViews.push(...items);
    }

    await AsyncStorage.setItem(CONFIG.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    log('Saved to offline queue:', type, items.length);
  } catch (error) {
    logError('saveToOfflineQueue error:', error);
  }
};

const syncOfflineQueue = async () => {
  if (!state.isOnline || !CONFIG.FEATURES.offlineQueue) return;

  try {
    const stored = await AsyncStorage.getItem(CONFIG.OFFLINE_QUEUE_KEY);
    if (!stored) return;

    const queue = JSON.parse(stored);
    log('Syncing offline queue:', queue.events?.length, 'events,', queue.pageViews?.length, 'page views');

    // Sync events
    if (queue.events?.length > 0) {
      const { error: eventsError } = await supabase
        .from('analytics_events')
        .insert(queue.events);

      if (eventsError) throw eventsError;
    }

    // Sync page views
    if (queue.pageViews?.length > 0) {
      const { error: pageViewsError } = await supabase
        .from('analytics_page_views')
        .insert(queue.pageViews);

      if (pageViewsError) throw pageViewsError;
    }

    // Clear offline queue
    await AsyncStorage.removeItem(CONFIG.OFFLINE_QUEUE_KEY);
    log('Offline queue synced and cleared');
  } catch (error) {
    logError('syncOfflineQueue error:', error);
  }
};

// =====================================================
// CORE TRACKING METHODS
// =====================================================

/**
 * Track a page view
 * @param {string} pageName - Screen/page name
 * @param {object} params - Screen params
 * @param {string} previousPage - Previous page name
 * @param {number} timeOnPreviousPageMs - Time spent on previous page
 */
const trackPageView = async (pageName, params = {}, previousPage = null, timeOnPreviousPageMs = null) => {
  if (!state.isInitialized) {
    log('Service not initialized, skipping page view');
    return;
  }

  const sessionId = await getOrCreateSession();
  const deviceInfo = await getDeviceInfo();

  const pageView = {
    user_id: state.userId,
    session_id: sessionId,
    page_name: pageName,
    page_category: PAGE_CATEGORIES[pageName] || 'other',
    previous_page: previousPage,
    time_on_page_ms: timeOnPreviousPageMs,
    screen_params: Object.keys(params).length > 0 ? params : null,
    platform: deviceInfo.platform,
    app_version: deviceInfo.app_version,
    hour_of_day: getHour(),
    day_of_week: getDayOfWeek(),
    created_at: getTimestamp(),
  };

  queuePageView(pageView);
};

/**
 * Track a generic event
 * @param {string} type - Event type (action, click, etc.)
 * @param {string} category - Event category
 * @param {string} name - Event name
 * @param {number} value - Optional numeric value
 * @param {object} data - Additional event data
 * @param {string} pageName - Current page name
 */
const trackEvent = async (type, category, name, value = null, data = {}, pageName = null) => {
  if (!state.isInitialized) {
    log('Service not initialized, skipping event');
    return;
  }

  const sessionId = await getOrCreateSession();
  const deviceInfo = await getDeviceInfo();

  const event = {
    user_id: state.userId,
    session_id: sessionId,
    event_type: type,
    event_category: category,
    event_name: name,
    event_value: value,
    event_data: Object.keys(data).length > 0 ? data : null,
    page_name: pageName,
    platform: deviceInfo.platform,
    app_version: deviceInfo.app_version,
    hour_of_day: getHour(),
    day_of_week: getDayOfWeek(),
    created_at: getTimestamp(),
  };

  queueEvent(event);
};

// =====================================================
// SPECIALIZED TRACKING METHODS
// =====================================================

// --- SCANNER TRACKING ---

/**
 * Track scan start
 * @param {string} patternType - Pattern type (UPD, DPD, etc.)
 * @param {string} timeframe - Timeframe (1m, 5m, etc.)
 * @param {string} symbol - Trading symbol
 * @param {object} filters - Applied filters
 */
const trackScanStart = (patternType, timeframe, symbol, filters = {}) => {
  trackEvent(
    EVENT_TYPES.START,
    EVENT_CATEGORIES.SCANNER,
    EVENT_NAMES.scanner.SCAN_START,
    null,
    { pattern_type: patternType, timeframe, symbol, filters },
    PAGE_NAMES.SCANNER
  );
};

/**
 * Track scan complete
 * @param {string} patternType - Pattern type
 * @param {string} timeframe - Timeframe
 * @param {string} symbol - Trading symbol
 * @param {number} resultsCount - Number of patterns found
 * @param {number} durationMs - Scan duration in ms
 */
const trackScanComplete = (patternType, timeframe, symbol, resultsCount, durationMs) => {
  trackEvent(
    EVENT_TYPES.COMPLETE,
    EVENT_CATEGORIES.SCANNER,
    EVENT_NAMES.scanner.SCAN_COMPLETE,
    resultsCount,
    {
      pattern_type: patternType,
      timeframe,
      symbol,
      results_count: resultsCount,
      duration_ms: durationMs,
    },
    PAGE_NAMES.SCANNER
  );
};

/**
 * Track pattern detected
 * @param {string} patternType - Pattern type
 * @param {string} symbol - Trading symbol
 * @param {object} patternData - Pattern details
 */
const trackPatternDetected = (patternType, symbol, patternData = {}) => {
  trackEvent(
    EVENT_TYPES.SCAN,
    EVENT_CATEGORIES.SCANNER,
    EVENT_NAMES.scanner.PATTERN_DETECTED,
    null,
    { pattern_type: patternType, symbol, ...patternData },
    PAGE_NAMES.SCANNER
  );
};

/**
 * Track pattern view (user views pattern details)
 * @param {string} patternId - Pattern ID
 * @param {string} patternType - Pattern type
 * @param {string} symbol - Trading symbol
 */
const trackPatternView = (patternId, patternType, symbol) => {
  trackEvent(
    EVENT_TYPES.ACTION,
    EVENT_CATEGORIES.SCANNER,
    EVENT_NAMES.scanner.PATTERN_VIEW,
    null,
    { pattern_id: patternId, pattern_type: patternType, symbol },
    PAGE_NAMES.PATTERN_DETAIL
  );
};

// --- RITUAL TRACKING ---

/**
 * Track ritual start
 * @param {string} ritualType - Ritual type
 * @param {string} ritualName - Display name
 */
const trackRitualStart = (ritualType, ritualName) => {
  trackEvent(
    EVENT_TYPES.START,
    EVENT_CATEGORIES.RITUAL,
    EVENT_NAMES.ritual.RITUAL_START,
    null,
    { ritual_type: ritualType, ritual_name: ritualName },
    PAGE_NAMES.RITUAL_DETAIL
  );
};

/**
 * Track ritual complete
 * @param {string} ritualType - Ritual type
 * @param {string} ritualName - Display name
 * @param {number} durationMs - Duration in ms
 * @param {number} xpEarned - XP earned
 * @param {object} reflection - Optional reflection data
 */
const trackRitualComplete = (ritualType, ritualName, durationMs, xpEarned = 0, reflection = null) => {
  trackEvent(
    EVENT_TYPES.COMPLETE,
    EVENT_CATEGORIES.RITUAL,
    EVENT_NAMES.ritual.RITUAL_COMPLETE,
    xpEarned,
    {
      ritual_type: ritualType,
      ritual_name: ritualName,
      duration_ms: durationMs,
      xp_earned: xpEarned,
      has_reflection: !!reflection,
    },
    PAGE_NAMES.RITUAL_DETAIL
  );
};

/**
 * Track ritual skip
 * @param {string} ritualType - Ritual type
 * @param {number} stepNumber - Step where skipped
 * @param {string} reason - Skip reason
 */
const trackRitualSkip = (ritualType, stepNumber, reason = null) => {
  trackEvent(
    EVENT_TYPES.ACTION,
    EVENT_CATEGORIES.RITUAL,
    EVENT_NAMES.ritual.RITUAL_SKIP,
    stepNumber,
    { ritual_type: ritualType, step_number: stepNumber, reason },
    PAGE_NAMES.RITUAL_DETAIL
  );
};

/**
 * Track streak achieved
 * @param {string} streakType - Type of streak (ritual, mood, journal)
 * @param {number} streakCount - Current streak count
 */
const trackStreakAchieved = (streakType, streakCount) => {
  trackEvent(
    EVENT_TYPES.COMPLETE,
    EVENT_CATEGORIES.RITUAL,
    EVENT_NAMES.ritual.STREAK_ACHIEVED,
    streakCount,
    { streak_type: streakType, streak_count: streakCount },
    PAGE_NAMES.VISION_BOARD
  );
};

/**
 * Track mood recorded
 * @param {string} mood - Mood value
 * @param {string} checkInType - morning or evening
 * @param {string} note - Optional note
 */
const trackMoodRecorded = (mood, checkInType, note = null) => {
  trackEvent(
    EVENT_TYPES.ACTION,
    EVENT_CATEGORIES.RITUAL,
    EVENT_NAMES.ritual.MOOD_RECORDED,
    null,
    { mood, check_in_type: checkInType, has_note: !!note },
    PAGE_NAMES.CALENDAR
  );
};

// --- CHATBOT TRACKING ---

/**
 * Track chatbot conversation start
 * @param {string} chatbotType - Chatbot type (tarot, iching, etc.)
 * @param {string} conversationId - Conversation ID
 */
const trackChatbotStart = (chatbotType, conversationId) => {
  trackEvent(
    EVENT_TYPES.START,
    EVENT_CATEGORIES.CHATBOT,
    EVENT_NAMES.chatbot.CONVERSATION_START,
    null,
    { chatbot_type: chatbotType, conversation_id: conversationId },
    PAGE_NAMES.GEM_MASTER
  );
};

/**
 * Track chatbot conversation end
 * @param {string} chatbotType - Chatbot type
 * @param {string} conversationId - Conversation ID
 * @param {number} messageCount - Total messages in conversation
 * @param {number} durationMs - Conversation duration
 * @param {number} rating - User rating (1-5)
 */
const trackChatbotEnd = (chatbotType, conversationId, messageCount, durationMs, rating = null) => {
  trackEvent(
    EVENT_TYPES.COMPLETE,
    EVENT_CATEGORIES.CHATBOT,
    EVENT_NAMES.chatbot.CONVERSATION_END,
    messageCount,
    {
      chatbot_type: chatbotType,
      conversation_id: conversationId,
      message_count: messageCount,
      duration_ms: durationMs,
      rating,
    },
    PAGE_NAMES.GEM_MASTER
  );
};

/**
 * Track chatbot message sent
 * @param {string} chatbotType - Chatbot type
 * @param {string} messageType - Message type (text, quick_action)
 */
const trackChatbotMessage = (chatbotType, messageType = 'text') => {
  trackEvent(
    EVENT_TYPES.ACTION,
    EVENT_CATEGORIES.CHATBOT,
    EVENT_NAMES.chatbot.MESSAGE_SENT,
    null,
    { chatbot_type: chatbotType, message_type: messageType },
    PAGE_NAMES.GEM_MASTER
  );
};

// --- TAROT TRACKING ---

/**
 * Track tarot reading start
 * @param {string} spreadType - Spread type
 * @param {string} question - User's question (anonymized)
 */
const trackTarotStart = (spreadType, question = null) => {
  trackEvent(
    EVENT_TYPES.START,
    EVENT_CATEGORIES.TAROT,
    EVENT_NAMES.tarot.READING_START,
    null,
    { spread_type: spreadType, has_question: !!question },
    PAGE_NAMES.TAROT
  );
};

/**
 * Track tarot reading complete
 * @param {string} spreadType - Spread type
 * @param {array} cardsDrawn - Cards drawn (names only)
 * @param {number} durationMs - Duration
 */
const trackTarotComplete = (spreadType, cardsDrawn, durationMs) => {
  trackEvent(
    EVENT_TYPES.COMPLETE,
    EVENT_CATEGORIES.TAROT,
    EVENT_NAMES.tarot.READING_COMPLETE,
    cardsDrawn.length,
    {
      spread_type: spreadType,
      cards_count: cardsDrawn.length,
      cards_drawn: cardsDrawn,
      duration_ms: durationMs,
    },
    PAGE_NAMES.TAROT
  );
};

/**
 * Track tarot card drawn
 * @param {string} cardName - Card name
 * @param {number} position - Position in spread
 * @param {boolean} isReversed - Is card reversed
 */
const trackTarotCardDrawn = (cardName, position, isReversed) => {
  trackEvent(
    EVENT_TYPES.ACTION,
    EVENT_CATEGORIES.TAROT,
    EVENT_NAMES.tarot.CARD_DRAWN,
    position,
    { card_name: cardName, position, is_reversed: isReversed },
    PAGE_NAMES.TAROT
  );
};

// --- I-CHING TRACKING ---

/**
 * Track I-Ching reading start
 * @param {string} question - User's question (anonymized)
 */
const trackIChingStart = (question = null) => {
  trackEvent(
    EVENT_TYPES.START,
    EVENT_CATEGORIES.ICHING,
    EVENT_NAMES.iching.READING_START,
    null,
    { has_question: !!question },
    PAGE_NAMES.ICHING
  );
};

/**
 * Track I-Ching reading complete
 * @param {number} hexagramNumber - Hexagram number
 * @param {string} hexagramName - Hexagram name
 * @param {number} changingLines - Number of changing lines
 * @param {number} durationMs - Duration
 */
const trackIChingComplete = (hexagramNumber, hexagramName, changingLines, durationMs) => {
  trackEvent(
    EVENT_TYPES.COMPLETE,
    EVENT_CATEGORIES.ICHING,
    EVENT_NAMES.iching.READING_COMPLETE,
    hexagramNumber,
    {
      hexagram_number: hexagramNumber,
      hexagram_name: hexagramName,
      changing_lines: changingLines,
      duration_ms: durationMs,
    },
    PAGE_NAMES.ICHING
  );
};

// --- SHOP TRACKING ---

/**
 * Track product view
 * @param {string} productId - Product ID
 * @param {string} productName - Product name
 * @param {string} productType - Product type
 * @param {number} price - Product price
 */
const trackProductView = (productId, productName, productType, price) => {
  trackEvent(
    EVENT_TYPES.ACTION,
    EVENT_CATEGORIES.SHOP,
    EVENT_NAMES.shop.PRODUCT_VIEW,
    price,
    {
      product_id: productId,
      product_name: productName,
      product_type: productType,
      price,
    },
    PAGE_NAMES.PRODUCT_DETAIL
  );
};

/**
 * Track add to cart
 * @param {string} productId - Product ID
 * @param {string} productName - Product name
 * @param {number} quantity - Quantity added
 * @param {number} price - Product price
 */
const trackAddToCart = (productId, productName, quantity, price) => {
  trackEvent(
    EVENT_TYPES.ACTION,
    EVENT_CATEGORIES.SHOP,
    EVENT_NAMES.shop.ADD_TO_CART,
    price * quantity,
    {
      product_id: productId,
      product_name: productName,
      quantity,
      unit_price: price,
      total_value: price * quantity,
    },
    PAGE_NAMES.PRODUCT_DETAIL
  );
};

/**
 * Track purchase complete
 * @param {string} orderId - Order ID
 * @param {number} orderTotal - Total order value
 * @param {array} items - Order items
 * @param {string} paymentMethod - Payment method used
 */
const trackPurchase = (orderId, orderTotal, items, paymentMethod) => {
  trackEvent(
    EVENT_TYPES.PURCHASE,
    EVENT_CATEGORIES.SHOP,
    EVENT_NAMES.shop.PURCHASE_COMPLETE,
    orderTotal,
    {
      order_id: orderId,
      order_total: orderTotal,
      items_count: items.length,
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      })),
      payment_method: paymentMethod,
    },
    PAGE_NAMES.CHECKOUT
  );
};

// --- COURSE TRACKING ---

/**
 * Track course view
 * @param {string} courseId - Course ID
 * @param {string} courseName - Course name
 * @param {string} category - Course category
 */
const trackCourseView = (courseId, courseName, category) => {
  trackEvent(
    EVENT_TYPES.ACTION,
    EVENT_CATEGORIES.COURSES,
    EVENT_NAMES.courses.COURSE_VIEW,
    null,
    { course_id: courseId, course_name: courseName, category },
    PAGE_NAMES.COURSE_DETAIL
  );
};

/**
 * Track course enroll
 * @param {string} courseId - Course ID
 * @param {string} courseName - Course name
 * @param {number} price - Course price
 */
const trackCourseEnroll = (courseId, courseName, price) => {
  trackEvent(
    EVENT_TYPES.PURCHASE,
    EVENT_CATEGORIES.COURSES,
    EVENT_NAMES.courses.COURSE_ENROLL,
    price,
    { course_id: courseId, course_name: courseName, price },
    PAGE_NAMES.COURSE_DETAIL
  );
};

/**
 * Track lesson complete
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @param {number} lessonNumber - Lesson number
 * @param {number} durationMs - Time spent on lesson
 * @param {number} progress - Overall course progress (0-100)
 */
const trackLessonComplete = (courseId, lessonId, lessonNumber, durationMs, progress) => {
  trackEvent(
    EVENT_TYPES.COMPLETE,
    EVENT_CATEGORIES.COURSES,
    EVENT_NAMES.courses.LESSON_COMPLETE,
    progress,
    {
      course_id: courseId,
      lesson_id: lessonId,
      lesson_number: lessonNumber,
      duration_ms: durationMs,
      progress,
    },
    PAGE_NAMES.LESSON
  );
};

// --- AFFILIATE TRACKING ---

/**
 * Track affiliate link click
 * @param {string} linkId - Affiliate link ID
 * @param {string} affiliateId - Affiliate user ID
 * @param {string} source - Traffic source
 */
const trackAffiliateClick = (linkId, affiliateId, source) => {
  trackEvent(
    EVENT_TYPES.CLICK,
    EVENT_CATEGORIES.AFFILIATE,
    EVENT_NAMES.affiliate.REFERRAL_VISIT,
    null,
    { link_id: linkId, affiliate_id: affiliateId, source },
    null
  );
};

/**
 * Track affiliate conversion
 * @param {string} linkId - Affiliate link ID
 * @param {string} affiliateId - Affiliate user ID
 * @param {string} conversionType - signup or purchase
 * @param {number} orderValue - Order value (for purchase)
 */
const trackAffiliateConversion = (linkId, affiliateId, conversionType, orderValue = null) => {
  trackEvent(
    EVENT_TYPES.COMPLETE,
    EVENT_CATEGORIES.AFFILIATE,
    conversionType === 'signup' ? EVENT_NAMES.affiliate.REFERRAL_SIGNUP : EVENT_NAMES.affiliate.REFERRAL_PURCHASE,
    orderValue,
    {
      link_id: linkId,
      affiliate_id: affiliateId,
      conversion_type: conversionType,
      order_value: orderValue,
    },
    null
  );
};

// --- FORUM TRACKING ---

/**
 * Track post view
 * @param {string} postId - Post ID
 * @param {string} authorId - Author ID
 */
const trackPostView = (postId, authorId) => {
  trackEvent(
    EVENT_TYPES.ACTION,
    EVENT_CATEGORIES.FORUM,
    EVENT_NAMES.forum.POST_VIEW,
    null,
    { post_id: postId, author_id: authorId },
    PAGE_NAMES.POST_DETAIL
  );
};

/**
 * Track post interaction
 * @param {string} postId - Post ID
 * @param {string} action - like, comment, share, save
 */
const trackPostInteraction = (postId, action) => {
  const eventName = EVENT_NAMES.forum[`POST_${action.toUpperCase()}`] || EVENT_NAMES.forum.POST_LIKE;
  trackEvent(
    EVENT_TYPES.ACTION,
    EVENT_CATEGORIES.FORUM,
    eventName,
    null,
    { post_id: postId, action },
    PAGE_NAMES.POST_DETAIL
  );
};

// --- ERROR TRACKING ---

/**
 * Track error
 * @param {string} errorType - Error type/code
 * @param {string} errorMessage - Error message
 * @param {string} pageName - Page where error occurred
 * @param {object} context - Additional context
 */
const trackError = (errorType, errorMessage, pageName, context = {}) => {
  if (!CONFIG.FEATURES.trackErrors) return;

  trackEvent(
    EVENT_TYPES.ERROR,
    EVENT_CATEGORIES.ERROR,
    errorType,
    null,
    {
      error_message: errorMessage,
      context,
    },
    pageName
  );
};

// =====================================================
// ADMIN DASHBOARD DATA FETCHING
// =====================================================

/**
 * Get dashboard overview data
 * @param {string} startDate - Start date (ISO string)
 * @param {string} endDate - End date (ISO string)
 */
const getDashboardOverview = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .rpc('get_analytics_dashboard_overview', {
        p_start_date: startDate,
        p_end_date: endDate,
      });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logError('getDashboardOverview error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get feature breakdown
 * @param {string} category - Feature category
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 */
const getFeatureBreakdown = async (category, startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .rpc('get_analytics_feature_breakdown', {
        p_category: category,
        p_start_date: startDate,
        p_end_date: endDate,
      });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logError('getFeatureBreakdown error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get hourly heatmap data
 * @param {number} days - Number of days to include
 */
const getHourlyHeatmap = async (days = 7) => {
  try {
    const { data, error } = await supabase
      .rpc('get_analytics_hourly_heatmap', { p_days: days });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logError('getHourlyHeatmap error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get real-time active users
 */
const getRealtimeUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('v_analytics_realtime_users')
      .select('*')
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logError('getRealtimeUsers error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get top features today
 */
const getTopFeaturesToday = async () => {
  try {
    const { data, error } = await supabase
      .from('v_analytics_top_features_today')
      .select('*')
      .limit(10);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logError('getTopFeaturesToday error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get declining users (churn risk)
 */
const getDecliningUsers = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_analytics_declining_users');

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logError('getDecliningUsers error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get highly engaged free users (conversion opportunity)
 */
const getEngagedFreeUsers = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_analytics_engaged_free_users');

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logError('getEngagedFreeUsers error:', error);
    return { success: false, error: error.message };
  }
};

// =====================================================
// INITIALIZATION & LIFECYCLE
// =====================================================

/**
 * Initialize analytics service
 * @param {string} userId - User ID
 * @param {string} userTier - User tier
 */
const initialize = async (userId, userTier = 'free') => {
  if (state.isInitialized && state.userId === userId) {
    log('Already initialized for user:', userId);
    return;
  }

  log('Initializing for user:', userId);

  state.userId = userId;
  state.userTier = userTier;
  state.isInitialized = true;

  // Get device info
  await getDeviceInfo();

  // Create/restore session
  await getOrCreateSession();

  // Set up connectivity listener
  const unsubscribe = NetInfo.addEventListener(netState => {
    const wasOnline = state.isOnline;
    state.isOnline = netState.isConnected && netState.isInternetReachable;

    if (!wasOnline && state.isOnline) {
      log('Back online - syncing offline queue');
      syncOfflineQueue();
    }
  });

  // Set up app state listener
  const appStateSubscription = AppState.addEventListener('change', nextAppState => {
    if (state.appState === 'active' && nextAppState.match(/inactive|background/)) {
      // Going to background - flush queues
      flushAllQueues();
    } else if (state.appState.match(/inactive|background/) && nextAppState === 'active') {
      // Coming to foreground
      state.lastActiveAt = Date.now();
      syncOfflineQueue();
    }
    state.appState = nextAppState;
  });

  // Set up periodic flush
  state.flushTimer = setInterval(() => {
    flushAllQueues();
  }, CONFIG.BATCH_FLUSH_INTERVAL_MS);

  log('Initialized successfully');

  // Return cleanup function
  return () => {
    unsubscribe();
    appStateSubscription.remove();
    if (state.flushTimer) {
      clearInterval(state.flushTimer);
    }
  };
};

/**
 * Update user info (e.g., after tier upgrade)
 * @param {string} userTier - New user tier
 */
const updateUser = (userTier) => {
  state.userTier = userTier;
  log('User updated:', { userTier });
};

/**
 * Cleanup and end session
 */
const cleanup = async () => {
  log('Cleaning up...');

  // Clear timers
  if (state.flushTimer) {
    clearInterval(state.flushTimer);
    state.flushTimer = null;
  }

  // Flush remaining events
  await flushAllQueues();

  // End session
  await endSession();

  // Reset state
  state.isInitialized = false;
  state.userId = null;
  state.userTier = null;
  state.eventQueue = [];
  state.pageViewQueue = [];

  log('Cleanup complete');
};

// =====================================================
// EXPORTS
// =====================================================

export const adminAnalyticsService = {
  // Configuration
  CONFIG,

  // Initialization
  initialize,
  updateUser,
  cleanup,

  // Core tracking
  trackPageView,
  trackEvent,

  // Scanner tracking
  trackScanStart,
  trackScanComplete,
  trackPatternDetected,
  trackPatternView,

  // Ritual tracking
  trackRitualStart,
  trackRitualComplete,
  trackRitualSkip,
  trackStreakAchieved,
  trackMoodRecorded,

  // Chatbot tracking
  trackChatbotStart,
  trackChatbotEnd,
  trackChatbotMessage,

  // Tarot tracking
  trackTarotStart,
  trackTarotComplete,
  trackTarotCardDrawn,

  // I-Ching tracking
  trackIChingStart,
  trackIChingComplete,

  // Shop tracking
  trackProductView,
  trackAddToCart,
  trackPurchase,

  // Course tracking
  trackCourseView,
  trackCourseEnroll,
  trackLessonComplete,

  // Affiliate tracking
  trackAffiliateClick,
  trackAffiliateConversion,

  // Forum tracking
  trackPostView,
  trackPostInteraction,

  // Error tracking
  trackError,

  // Admin dashboard data
  getDashboardOverview,
  getFeatureBreakdown,
  getHourlyHeatmap,
  getRealtimeUsers,
  getTopFeaturesToday,
  getDecliningUsers,
  getEngagedFreeUsers,

  // Session management
  getOrCreateSession,
  endSession,

  // Queue management
  flushAllQueues,
  syncOfflineQueue,
};

export default adminAnalyticsService;
