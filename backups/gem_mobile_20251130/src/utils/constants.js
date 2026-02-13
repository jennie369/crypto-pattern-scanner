/**
 * Gemral - App Constants
 */

export const APP_NAME = 'Gemral';
export const APP_VERSION = '1.0.0';

// API Endpoints
export const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzc1MzYsImV4cCI6MjA3Nzc1MzUzNn0.1De0-m3GhFHUrKl-ViqX_r6bydVFoWDaW8DsxhhbjEc';

// Screen Names
export const SCREENS = {
  // Auth
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  FORGOT_PASSWORD: 'ForgotPassword',

  // Main Tabs
  HOME: 'Home',
  SHOP: 'Shop',
  SCANNER: 'Scanner',
  CHATBOT: 'Chatbot',
  NOTIFICATIONS: 'Notifications',
  ACCOUNT: 'Account',
};

// Tab Icons (Lucide)
export const TAB_ICONS = {
  HOME: 'home',
  SHOP: 'shopping-bag',
  SCANNER: 'scan-line',
  CHATBOT: 'message-circle',
  NOTIFICATIONS: 'bell',
  ACCOUNT: 'user',
};

// Tiers
export const TIERS = {
  FREE: { id: 'free', name: 'Free', color: 'rgba(255,255,255,0.2)' },
  TIER_1: { id: 1, name: 'Tier 1', color: '#FFBD59' },
  TIER_2: { id: 2, name: 'Tier 2', color: '#3B82F6' },
  TIER_3: { id: 3, name: 'Tier 3', color: '#9C0612' },
};

// Pattern Types
export const PATTERNS = {
  DPD: { code: 'DPD', name: 'Double Peak & Dip', bullish: true },
  UPU: { code: 'UPU', name: 'Up Peak Up', bullish: false },
  HPD: { code: 'HPD', name: 'High Peak Dip', bullish: true },
  LPU: { code: 'LPU', name: 'Low Peak Up', bullish: false },
};

// Timeframes
export const TIMEFRAMES = ['5m', '15m', '1H', '4H', '1D'];

// Default settings
export const DEFAULTS = {
  TIMEFRAME: '1H',
  COIN: 'BTCUSDT',
  LANGUAGE: 'vi',
};
