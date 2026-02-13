// src/hooks/useEventTracking.ts
// Event Tracking Hook for User Behavior Intelligence
// GEMRAL AI BRAIN - Phase 3

import { useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabase } from '../services/supabase';
import DeviceInfo from 'react-native-device-info';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = '@gemral_event_queue';
const BATCH_INTERVAL = 30000; // 30 seconds
const MAX_QUEUE_SIZE = 100;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UserEvent {
  user_id?: string;
  event_type: 'screen_view' | 'button_click' | 'feature_use' | 'search' | 'purchase' | 'error';
  event_name: string;
  event_category?: 'scanner' | 'chatbot' | 'forum' | 'shop' | 'courses' | 'account' | 'other';
  screen_name?: string;
  component_name?: string;
  event_data?: Record<string, any>;
  session_id?: string;
  device_type?: string;
  app_version?: string;
  occurred_at?: string;
}

interface EventTrackingHook {
  trackEvent: (event: Omit<UserEvent, 'user_id' | 'session_id' | 'device_type' | 'app_version' | 'occurred_at'>) => void;
  trackScreenView: (screenName: string, category?: string) => void;
  trackButtonClick: (buttonName: string, screenName?: string, data?: Record<string, any>) => void;
  trackFeatureUse: (featureName: string, category?: string, data?: Record<string, any>) => void;
  trackSearch: (query: string, category?: string, resultsCount?: number) => void;
  trackPurchase: (productId: string, amount: number, currency?: string) => void;
  flushEvents: () => Promise<void>;
  getSessionId: () => string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

let currentSessionId: string | null = null;
let sessionStartTime: number = 0;

const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const getOrCreateSession = (): string => {
  const now = Date.now();

  // Create new session if expired or doesn't exist
  if (!currentSessionId || (now - sessionStartTime) > SESSION_TIMEOUT) {
    currentSessionId = generateSessionId();
    sessionStartTime = now;
  }

  return currentSessionId;
};

// C3 FIX: Clear session on logout to prevent state bleed across user sessions
export const clearEventSession = (): void => {
  currentSessionId = null;
  sessionStartTime = 0;
};

// ═══════════════════════════════════════════════════════════════════════════
// DEVICE INFO
// ═══════════════════════════════════════════════════════════════════════════

let cachedDeviceType: string | null = null;
let cachedAppVersion: string | null = null;

const getDeviceType = (): string => {
  if (cachedDeviceType) return cachedDeviceType;

  cachedDeviceType = Platform.OS; // 'ios' | 'android' | 'web'
  return cachedDeviceType;
};

const getAppVersion = async (): Promise<string> => {
  if (cachedAppVersion) return cachedAppVersion;

  try {
    cachedAppVersion = await DeviceInfo.getVersion();
  } catch {
    cachedAppVersion = '1.0.0';
  }

  return cachedAppVersion;
};

// ═══════════════════════════════════════════════════════════════════════════
// EVENT QUEUE
// ═══════════════════════════════════════════════════════════════════════════

const loadQueue = async (): Promise<UserEvent[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[EventTracking] Failed to load queue:', error);
    return [];
  }
};

const saveQueue = async (queue: UserEvent[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('[EventTracking] Failed to save queue:', error);
  }
};

const clearQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[EventTracking] Failed to clear queue:', error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// BATCH UPLOAD
// ═══════════════════════════════════════════════════════════════════════════

const uploadEvents = async (events: UserEvent[]): Promise<boolean> => {
  if (events.length === 0) return true;

  try {
    console.log(`[EventTracking] Uploading ${events.length} events...`);

    const { data, error } = await supabase.rpc('batch_track_events', {
      p_events: events,
    });

    if (error) {
      console.error('[EventTracking] Upload error:', error);
      return false;
    }

    console.log(`[EventTracking] Uploaded ${data} events successfully`);
    return true;
  } catch (error) {
    console.error('[EventTracking] Upload failed:', error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export const useEventTracking = (userId?: string): EventTrackingHook => {
  const eventQueueRef = useRef<UserEvent[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load queue on mount
  useEffect(() => {
    const init = async () => {
      eventQueueRef.current = await loadQueue();
    };
    init();
  }, []);

  // Setup batch upload interval
  useEffect(() => {
    timerRef.current = setInterval(async () => {
      if (eventQueueRef.current.length > 0) {
        const events = [...eventQueueRef.current];
        const success = await uploadEvents(events);

        if (success) {
          eventQueueRef.current = [];
          await clearQueue();
        }
      }
    }, BATCH_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Flush on unmount
  useEffect(() => {
    return () => {
      saveQueue(eventQueueRef.current);
    };
  }, []);

  // Add event to queue
  const addToQueue = useCallback(async (event: UserEvent) => {
    const appVersion = await getAppVersion();

    const fullEvent: UserEvent = {
      ...event,
      user_id: userId,
      session_id: getOrCreateSession(),
      device_type: getDeviceType(),
      app_version: appVersion,
      occurred_at: new Date().toISOString(),
    };

    eventQueueRef.current.push(fullEvent);

    // Save to storage
    await saveQueue(eventQueueRef.current);

    // Flush if queue is full
    if (eventQueueRef.current.length >= MAX_QUEUE_SIZE) {
      const events = [...eventQueueRef.current];
      const success = await uploadEvents(events);

      if (success) {
        eventQueueRef.current = [];
        await clearQueue();
      }
    }
  }, [userId]);

  // Track generic event
  const trackEvent = useCallback((event: Omit<UserEvent, 'user_id' | 'session_id' | 'device_type' | 'app_version' | 'occurred_at'>) => {
    addToQueue(event as UserEvent);
  }, [addToQueue]);

  // Track screen view
  const trackScreenView = useCallback((screenName: string, category?: string) => {
    addToQueue({
      event_type: 'screen_view',
      event_name: screenName,
      event_category: category as any,
      screen_name: screenName,
    });
  }, [addToQueue]);

  // Track button click
  const trackButtonClick = useCallback((buttonName: string, screenName?: string, data?: Record<string, any>) => {
    addToQueue({
      event_type: 'button_click',
      event_name: buttonName,
      screen_name: screenName,
      event_data: data,
    });
  }, [addToQueue]);

  // Track feature use
  const trackFeatureUse = useCallback((featureName: string, category?: string, data?: Record<string, any>) => {
    addToQueue({
      event_type: 'feature_use',
      event_name: featureName,
      event_category: category as any,
      event_data: data,
    });
  }, [addToQueue]);

  // Track search
  const trackSearch = useCallback((query: string, category?: string, resultsCount?: number) => {
    addToQueue({
      event_type: 'search',
      event_name: 'search',
      event_category: category as any,
      event_data: {
        query,
        results_count: resultsCount,
      },
    });
  }, [addToQueue]);

  // Track purchase
  const trackPurchase = useCallback((productId: string, amount: number, currency: string = 'VND') => {
    addToQueue({
      event_type: 'purchase',
      event_name: 'purchase',
      event_category: 'shop',
      event_data: {
        product_id: productId,
        amount,
        currency,
      },
    });
  }, [addToQueue]);

  // Manual flush
  const flushEvents = useCallback(async () => {
    if (eventQueueRef.current.length > 0) {
      const events = [...eventQueueRef.current];
      const success = await uploadEvents(events);

      if (success) {
        eventQueueRef.current = [];
        await clearQueue();
      }
    }
  }, []);

  // Get current session ID
  const getSessionId = useCallback(() => {
    return getOrCreateSession();
  }, []);

  return {
    trackEvent,
    trackScreenView,
    trackButtonClick,
    trackFeatureUse,
    trackSearch,
    trackPurchase,
    flushEvents,
    getSessionId,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// STANDALONE TRACKING (for use outside React components)
// ═══════════════════════════════════════════════════════════════════════════

export const trackEvent = async (
  userId: string | undefined,
  eventType: UserEvent['event_type'],
  eventName: string,
  options?: {
    category?: UserEvent['event_category'];
    screenName?: string;
    componentName?: string;
    data?: Record<string, any>;
  }
): Promise<void> => {
  try {
    const appVersion = await getAppVersion();

    const { error } = await supabase.rpc('track_user_event', {
      p_user_id: userId || null,
      p_event_type: eventType,
      p_event_name: eventName,
      p_event_category: options?.category || null,
      p_screen_name: options?.screenName || null,
      p_event_data: options?.data || {},
      p_session_id: getOrCreateSession(),
      p_device_type: getDeviceType(),
    });

    if (error) {
      console.error('[EventTracking] Direct track error:', error);
    }
  } catch (error) {
    console.error('[EventTracking] Direct track failed:', error);
  }
};

export default useEventTracking;
