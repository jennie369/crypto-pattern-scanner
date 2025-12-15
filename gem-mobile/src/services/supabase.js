/**
 * Gemral - Supabase Client
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';

// Re-export for use in other services
export { SUPABASE_URL, SUPABASE_ANON_KEY };

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

// Create Supabase client with custom storage
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
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
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('SignOut error:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (error) {
    console.error('GetCurrentUser error:', error);
    return { user: null, error };
  }
};

export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  } catch (error) {
    console.error('GetSession error:', error);
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
export const setSessionFromToken = async (refreshToken) => {
  try {
    const { data, error } = await supabase.auth.setSession({
      refresh_token: refreshToken,
      access_token: '', // Supabase will generate new access token
    });
    return { data, error };
  } catch (error) {
    console.error('SetSessionFromToken error:', error);
    return { data: null, error: { message: error.message || 'Lỗi khôi phục phiên đăng nhập' } };
  }
};

export default supabase;
