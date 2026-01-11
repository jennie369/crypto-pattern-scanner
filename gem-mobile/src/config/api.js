/**
 * API Configuration for GEM Mobile
 * Centralized API endpoints and settings
 */

// Environment detection
const isDev = __DEV__;

// Backend API URLs
export const API_CONFIG = {
  // FastAPI Backend (Railway)
  BACKEND_URL: isDev
    ? 'http://localhost:8000'
    : 'https://gem-backend.railway.app',

  // WebSocket URL
  BACKEND_WS_URL: isDev
    ? 'ws://localhost:8000/ws/chat'
    : 'wss://gem-backend.railway.app/ws/chat',

  // Supabase Edge Functions
  EDGE_FUNCTIONS_URL: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1',

  // Timeouts (in milliseconds)
  TIMEOUTS: {
    API_REQUEST: 30000,      // 30 seconds
    WS_CONNECT: 5000,        // 5 seconds
    WS_RESPONSE: 30000,      // 30 seconds
    VOICE_TRANSCRIPTION: 60000, // 60 seconds
  },

  // Rate limits
  RATE_LIMITS: {
    MESSAGES_PER_MINUTE: 30,
    VOICE_PER_DAY_FREE: 3,
    VOICE_PER_DAY_PAID: 50,
  },

  // WebSocket settings
  WS_CONFIG: {
    HEARTBEAT_INTERVAL: 30000,  // 30 seconds
    RECONNECT_DELAYS: [1000, 2000, 4000, 8000, 16000, 30000],
    MAX_RECONNECT_ATTEMPTS: 10,
    MAX_CONNECTIONS_PER_USER: 5,
  },

  // Offline queue settings
  OFFLINE_QUEUE: {
    MAX_QUEUE_SIZE: 50,
    MESSAGE_EXPIRY_HOURS: 24,
    SYNC_RETRY_DELAY: 500,
  },
};

// Helper to get full API URL
export const getApiUrl = (path) => {
  return `${API_CONFIG.BACKEND_URL}${path}`;
};

// Helper to get full Edge Function URL
export const getEdgeFunctionUrl = (functionName) => {
  return `${API_CONFIG.EDGE_FUNCTIONS_URL}/${functionName}`;
};

// Export individual values for convenience
export const BACKEND_URL = API_CONFIG.BACKEND_URL;
export const BACKEND_WS_URL = API_CONFIG.BACKEND_WS_URL;
export const EDGE_FUNCTIONS_URL = API_CONFIG.EDGE_FUNCTIONS_URL;

export default API_CONFIG;
