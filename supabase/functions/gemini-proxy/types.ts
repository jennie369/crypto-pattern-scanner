/**
 * Gemini API Proxy - Type Definitions
 * Centralized types for the Edge Function
 */

// ===========================================
// USER TIER TYPES
// ===========================================

export type UserTier = 'free' | 'tier1' | 'tier2' | 'tier3';

export interface TierRateLimit {
  requestsPerMinute: number;
  tokensPerDay: number;
}

// Rate limits by tier (requests per minute)
export const TIER_RATE_LIMITS: Record<UserTier, TierRateLimit> = {
  free: { requestsPerMinute: 10, tokensPerDay: 50000 },
  tier1: { requestsPerMinute: 30, tokensPerDay: 200000 },
  tier2: { requestsPerMinute: 60, tokensPerDay: 500000 },
  tier3: { requestsPerMinute: 120, tokensPerDay: 1000000 },
};

// ===========================================
// GEMINI API TYPES
// ===========================================

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GeminiRequest {
  contents: GeminiMessage[];
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

export interface GeminiCandidate {
  content: {
    parts: Array<{ text: string }>;
    role: string;
  };
  finishReason: string;
  index: number;
}

export interface GeminiUsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

export interface GeminiResponse {
  candidates: GeminiCandidate[];
  usageMetadata: GeminiUsageMetadata;
  modelVersion?: string;
}

export interface GeminiErrorResponse {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

// ===========================================
// PROXY REQUEST/RESPONSE TYPES
// ===========================================

export interface ProxyRequest {
  feature: 'gem_master' | 'tarot' | 'i_ching' | 'tu_vi' | 'chat' | 'analysis' | 'admin_ai_trading';
  messages: GeminiMessage[];
  systemPrompt?: string;
  generationConfig?: GeminiRequest['generationConfig'];
  metadata?: Record<string, unknown>;
}

export interface ProxyResponse {
  success: boolean;
  data?: {
    text: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  error?: string;
  rateLimit?: {
    limit: number;
    remaining: number;
    resetAt: string;
  };
}

// ===========================================
// RATE LIMIT TYPES
// ===========================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  limit: number;
  current: number;
}

// ===========================================
// CORS CONFIGURATION
// ===========================================

// Allowed origins for CORS
export const ALLOWED_ORIGINS: string[] = [
  'http://localhost:8081',
  'http://localhost:19006',
  'http://localhost:3000',
  'https://gemral.vn',
  'https://www.gemral.vn',
  'https://app.gemral.vn',
  'https://yinyangmasters.com',
  'https://www.yinyangmasters.com',
  // Expo development
  'exp://localhost:8081',
  'exp://192.168.1.1:8081',
  // React Native (no origin)
  '',
];

// ===========================================
// CONSTANTS
// ===========================================

export const GEMINI_MODEL = 'gemini-2.5-flash';
export const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
// API key from environment variable (set in Supabase Dashboard > Edge Functions > Secrets)
export const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';

// Default generation config (gemini-2.5-flash uses thinking tokens, needs higher maxOutputTokens)
export const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.8,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 4096,
};

// Feature-specific generation configs (all need 4096+ for thinking tokens)
export const FEATURE_CONFIGS: Record<string, Partial<GeminiRequest['generationConfig']>> = {
  gem_master: {
    temperature: 0.85,
    maxOutputTokens: 8192,
  },
  tarot: {
    temperature: 0.9,
    maxOutputTokens: 8192,
  },
  i_ching: {
    temperature: 0.85,
    maxOutputTokens: 8192,
  },
  tu_vi: {
    temperature: 0.8,
    maxOutputTokens: 8192,
  },
  chat: {
    temperature: 0.7,
    maxOutputTokens: 4096,
  },
  analysis: {
    temperature: 0.3,
    maxOutputTokens: 4096,
  },
  admin_ai_trading: {
    temperature: 0.6,
    maxOutputTokens: 4096,
  },
};
