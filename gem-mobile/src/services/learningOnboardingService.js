/**
 * GEM Academy - Learning Onboarding Service
 * Tracks user onboarding state for tooltips and intro modals
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const LOCAL_KEY = 'user_learning_onboarding_local';

// All available onboarding features
const ONBOARDING_FEATURES = [
  'courses_intro',
  'gamification_intro',
  'streak_intro',
  'leaderboard_intro',
  'achievements_intro',
  'quiz_intro',
  'certificate_intro',
  'offline_intro',
  'tooltip_progress',
  'tooltip_xp',
  'tooltip_streak',
  'tooltip_daily_quest',
];

// ═══════════════════════════════════════════════════════════
// LOCAL STORAGE FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get local onboarding state
 * @returns {Promise<Object>} Local onboarding state
 */
const getLocalState = async () => {
  try {
    const stored = await AsyncStorage.getItem(LOCAL_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with all features unseen
    const initial = {};
    ONBOARDING_FEATURES.forEach(feature => {
      initial[`seen_${feature}`] = false;
    });
    return initial;
  } catch (error) {
    console.error('[learningOnboardingService] getLocalState error:', error);
    return {};
  }
};

/**
 * Save local onboarding state
 * @param {Object} state - State to save
 */
const saveLocalState = async (state) => {
  try {
    await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('[learningOnboardingService] saveLocalState error:', error);
  }
};

// ═══════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════

/**
 * Get full onboarding state (merged local + Supabase)
 * @returns {Promise<Object>} Full onboarding state
 */
export const getOnboardingState = async () => {
  try {
    // First get local state
    const localState = await getLocalState();

    // Try to get Supabase state if user is authenticated
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

    if (!user) {
      return localState;
    }

    // Check if user_onboarding table exists and get state
    const { data, error } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // Graceful degradation if table doesn't exist
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('[learningOnboardingService] user_onboarding table not ready yet');
        return localState;
      }

      // No row found - create one
      if (error.code === 'PGRST116') {
        await supabase.from('user_onboarding').insert({ user_id: user.id });
        return localState;
      }

      throw error;
    }

    // Merge Supabase state (it takes priority)
    return { ...localState, ...data };
  } catch (error) {
    console.error('[learningOnboardingService] getOnboardingState error:', error);
    return await getLocalState();
  }
};

/**
 * Mark a feature as seen
 * @param {string} featureKey - Feature key (e.g., 'courses_intro', 'tooltip_xp')
 * @returns {Promise<boolean>} Success status
 */
export const markFeatureSeen = async (featureKey) => {
  try {
    const fieldName = featureKey.startsWith('seen_') ? featureKey : `seen_${featureKey}`;

    // Validate feature key
    const featureName = featureKey.replace('seen_', '');
    if (!ONBOARDING_FEATURES.includes(featureName)) {
      console.warn('[learningOnboardingService] Invalid feature key:', featureKey);
      return false;
    }

    // Update local state
    const localState = await getLocalState();
    localState[fieldName] = true;
    await saveLocalState(localState);

    // Update Supabase if user is authenticated
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

    if (user) {
      const { error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          [fieldName]: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error && error.code !== '42P01') {
        console.error('[learningOnboardingService] Supabase update error:', error);
      }
    }

    console.log('[learningOnboardingService] Marked feature seen:', featureKey);
    return true;
  } catch (error) {
    console.error('[learningOnboardingService] markFeatureSeen error:', error);
    return false;
  }
};

/**
 * Check if a feature has been seen
 * @param {string} featureKey - Feature key to check
 * @returns {Promise<boolean>} True if feature has been seen
 */
export const hasSeenFeature = async (featureKey) => {
  try {
    const fieldName = featureKey.startsWith('seen_') ? featureKey : `seen_${featureKey}`;
    const state = await getOnboardingState();
    return state[fieldName] === true;
  } catch (error) {
    console.error('[learningOnboardingService] hasSeenFeature error:', error);
    return false; // Default to not seen on error
  }
};

/**
 * Reset all onboarding state (for testing)
 * @returns {Promise<boolean>} Success status
 */
export const resetOnboarding = async () => {
  try {
    // Reset local state
    const initial = {};
    ONBOARDING_FEATURES.forEach(feature => {
      initial[`seen_${feature}`] = false;
    });
    await saveLocalState(initial);

    // Reset Supabase if user is authenticated
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

    if (user) {
      const updates = { user_id: user.id, updated_at: new Date().toISOString() };
      ONBOARDING_FEATURES.forEach(feature => {
        updates[`seen_${feature}`] = false;
      });

      await supabase
        .from('user_onboarding')
        .upsert(updates, { onConflict: 'user_id' });
    }

    console.log('[learningOnboardingService] Onboarding reset');
    return true;
  } catch (error) {
    console.error('[learningOnboardingService] resetOnboarding error:', error);
    return false;
  }
};

/**
 * Sync local state to Supabase (call on login)
 * @returns {Promise<void>}
 */
export const syncToSupabase = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) return;

    const localState = await getLocalState();

    // Get any existing Supabase state
    const { data: supabaseState } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Merge states - if any source has seen=true, keep it as true
    const merged = { user_id: user.id, updated_at: new Date().toISOString() };
    ONBOARDING_FEATURES.forEach(feature => {
      const field = `seen_${feature}`;
      merged[field] = localState[field] === true || supabaseState?.[field] === true;
    });

    // Upsert merged state
    await supabase
      .from('user_onboarding')
      .upsert(merged, { onConflict: 'user_id' });

    // Update local state with merged values
    await saveLocalState(merged);

    console.log('[learningOnboardingService] Synced to Supabase');
  } catch (error) {
    console.error('[learningOnboardingService] syncToSupabase error:', error);
  }
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const learningOnboardingService = {
  getOnboardingState,
  markFeatureSeen,
  hasSeenFeature,
  resetOnboarding,
  syncToSupabase,
  ONBOARDING_FEATURES,
};

export default learningOnboardingService;
