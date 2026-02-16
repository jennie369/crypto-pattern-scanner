/**
 * Gemral - Supabase Client
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';

// Re-export for use in other services
export { SUPABASE_URL, SUPABASE_ANON_KEY };

// Derive storage key from project URL (avoids hardcoding project ID)
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] ?? 'pgfkbcnzqozzkohwbgbk';
const AUTH_STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;

// Custom storage adapter that works on both web and native
const customStorage = {
  getItem: async (key) => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  removeItem: async (key) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};

// Per-request timeout for Supabase API calls.
// Prevents HTTP requests from hanging indefinitely on stalled mobile connections.
// Phase 9 Fix: Extended to cover edge functions (28 call sites were unprotected).
const DB_QUERY_TIMEOUT = 8000;         // 8s for DB queries + auth calls
const EDGE_FUNCTION_TIMEOUT = 30000;   // 30s for edge functions (AI/TTS can be slow)
// Storage (/storage/v1/) has NO timeout — file uploads can be large

// Create Supabase client with custom storage and tiered fetch timeout
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
  global: {
    fetch: (url, options = {}) => {
      // Skip if caller already set their own AbortController signal
      if (options.signal) {
        return fetch(url, options);
      }

      // Determine timeout based on endpoint type
      let timeout = 0;
      if (typeof url === 'string') {
        if (url.includes('/rest/v1/') || url.includes('/auth/v1/')) {
          timeout = DB_QUERY_TIMEOUT;        // 8s for DB + auth
        } else if (url.includes('/functions/v1/')) {
          timeout = EDGE_FUNCTION_TIMEOUT;   // 30s for edge functions
        }
        // /storage/v1/ — no timeout (file uploads)
        // /realtime/v1/ — no timeout (WebSocket upgrade)
      }

      if (!timeout) {
        return fetch(url, options);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  },
});

// Auth helpers
export const signUp = async (email, password, metadata = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  } catch (error) {
    console.error('SignUp error:', error);
    return { data: null, error };
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (error) {
    console.error('SignIn error:', error);
    // Handle network or parse errors
    if (error.message?.includes('JSON Parse error') || error.message?.includes('fetch')) {
      return {
        data: null,
        error: {
          message: 'Lỗi kết nối server. Vui lòng kiểm tra:\n1. Kết nối internet\n2. Supabase project có thể bị paused\n\nHãy vào dashboard.supabase.com để kiểm tra.'
        }
      };
    }
    return { data: null, error: { message: error.message || 'Lỗi không xác định' } };
  }
};

export const signOut = async () => {
  try {
    // Use 'local' scope to only sign out current device
    // Default is 'global' which invalidates ALL sessions across all devices
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    return { error };
  } catch (error) {
    console.error('SignOut error:', error);
    return { error };
  }
};

/**
 * Local-only sign out: clears session from device WITHOUT revoking on server.
 * This keeps the refresh token valid so biometric re-login still works.
 * Use this for intentional logout (user taps "Sign Out").
 *
 * supabase.auth.signOut({ scope: 'local' }) still makes an API call that
 * revokes the session on the server. This function avoids that.
 */
export const localOnlySignOut = async () => {
  try {
    // Clear the Supabase auth session from local storage only
    await customStorage.removeItem(AUTH_STORAGE_KEY);
    // Also clear the code verifier if any (PKCE flow)
    await customStorage.removeItem(`${AUTH_STORAGE_KEY}-code-verifier`);
    console.log('[Supabase] Local-only sign out completed (server session preserved)');
    return { error: null };
  } catch (error) {
    console.error('LocalOnlySignOut error:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    // Check for invalid refresh token error
    if (error?.message?.includes('Refresh Token') || error?.message?.includes('refresh_token') || error?.code === 'invalid_grant') {
      console.warn('[Supabase] Invalid refresh token detected');
      // Clear stored session
      await customStorage.removeItem(AUTH_STORAGE_KEY);
      return { user: null, error: { ...error, isInvalidRefreshToken: true } };
    }

    return { user, error };
  } catch (error) {
    console.error('GetCurrentUser error:', error);
    // Check for invalid refresh token in catch
    if (error?.message?.includes('Refresh Token') || error?.message?.includes('refresh_token')) {
      await customStorage.removeItem(AUTH_STORAGE_KEY);
      return { user: null, error: { message: error.message, isInvalidRefreshToken: true } };
    }
    return { user: null, error };
  }
};

export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    // Check for invalid refresh token error
    if (error?.message?.includes('Refresh Token') || error?.message?.includes('refresh_token') || error?.code === 'invalid_grant') {
      console.warn('[Supabase] Invalid refresh token in getSession');
      await customStorage.removeItem(AUTH_STORAGE_KEY);
      return { session: null, error: { ...error, isInvalidRefreshToken: true } };
    }

    return { session, error };
  } catch (error) {
    console.error('GetSession error:', error);
    if (error?.message?.includes('Refresh Token') || error?.message?.includes('refresh_token')) {
      await customStorage.removeItem(AUTH_STORAGE_KEY);
      return { session: null, error: { message: error.message, isInvalidRefreshToken: true } };
    }
    return { session: null, error };
  }
};

// User profile helpers
// NOTE: Using ONLY 'profiles' table (unified)
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  } catch (error) {
    console.error('GetUserProfile error:', error);
    return { data: null, error };
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('UpdateUserProfile error:', error);
    return { data: null, error };
  }
};

// Biometric auth helper - login with refresh token
// Uses refreshSession() instead of setSession() because:
// 1. setSession requires a valid access_token (empty string fails in Supabase v2+)
// 2. refreshSession properly exchanges the refresh_token for new tokens
export const setSessionFromToken = async (refreshToken) => {
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    // Check for invalid refresh token
    if (error?.message?.includes('Refresh Token') || error?.message?.includes('refresh_token') || error?.code === 'invalid_grant') {
      console.warn('[Supabase] Biometric login failed - invalid refresh token');
      await customStorage.removeItem(AUTH_STORAGE_KEY);
      return { data: null, error: { message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại bằng email/mật khẩu.', isInvalidRefreshToken: true } };
    }

    return { data, error };
  } catch (error) {
    console.error('SetSessionFromToken error:', error);
    if (error?.message?.includes('Refresh Token') || error?.message?.includes('refresh_token')) {
      await customStorage.removeItem(AUTH_STORAGE_KEY);
      return { data: null, error: { message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', isInvalidRefreshToken: true } };
    }
    return { data: null, error: { message: error.message || 'Lỗi khôi phục phiên đăng nhập' } };
  }
};

export default supabase;
