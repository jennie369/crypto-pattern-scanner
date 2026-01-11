/**
 * GEM Scanner - Onboarding Service
 * Manages Paper Trade onboarding state (Supabase + AsyncStorage)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { getStepIds } from '../constants/onboardingSteps';

// AsyncStorage keys
const STORAGE_KEYS = {
  ONBOARDING_STATE: '@gem_paper_trade_onboarding',
  ONBOARDING_COMPLETED: '@gem_paper_trade_onboarding_completed',
  ONBOARDING_SKIPPED: '@gem_paper_trade_onboarding_skipped',
};

// Default onboarding state
const DEFAULT_STATE = {
  seen_welcome: false,
  seen_order_types: false,
  seen_leverage: false,
  seen_tpsl: false,
  seen_positions: false,
  all_completed: false,
  skipped: false,
  skipped_at: null,
  completed_at: null,
  show_count: 0,
  last_shown_at: null,
};

// ═══════════════════════════════════════════════════════════
// LOCAL STORAGE FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get local onboarding state
 * @returns {Promise<Object>} Local onboarding state
 */
const getLocalState = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_STATE);
    return stored ? JSON.parse(stored) : { ...DEFAULT_STATE };
  } catch (error) {
    console.error('[onboardingService] getLocalState error:', error);
    return { ...DEFAULT_STATE };
  }
};

/**
 * Save local onboarding state
 * @param {Object} state - State to save
 */
const saveLocalState = async (state) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('[onboardingService] saveLocalState error:', error);
  }
};

// ═══════════════════════════════════════════════════════════
// SUPABASE FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get onboarding record from Supabase
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Onboarding record
 */
const getSupabaseState = async (userId) => {
  try {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('paper_trade_onboarding')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[onboardingService] getSupabaseState error:', error);
    return null;
  }
};

/**
 * Create or update onboarding record in Supabase
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 */
const upsertSupabaseState = async (userId, updates) => {
  try {
    if (!userId) return;

    const { error } = await supabase
      .from('paper_trade_onboarding')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) throw error;
  } catch (error) {
    console.error('[onboardingService] upsertSupabaseState error:', error);
  }
};

// ═══════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════

/**
 * Check if onboarding should be shown
 * @param {string} userId - User ID (optional)
 * @returns {Promise<boolean>} True if should show onboarding
 */
export const checkShouldShow = async (userId = null) => {
  try {
    // First check local state
    const localState = await getLocalState();

    if (localState.all_completed || localState.skipped) {
      return false;
    }

    // If user is logged in, also check Supabase
    if (userId) {
      const supabaseState = await getSupabaseState(userId);
      if (supabaseState?.all_completed || supabaseState?.skipped) {
        // Sync to local
        await saveLocalState({
          ...localState,
          ...supabaseState,
        });
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('[onboardingService] checkShouldShow error:', error);
    // Default to showing onboarding on error
    return true;
  }
};

/**
 * Mark a step as seen
 * @param {string} userId - User ID (optional)
 * @param {string} stepId - Step ID ('welcome', 'order_types', etc.)
 */
export const markStepSeen = async (userId = null, stepId) => {
  try {
    const validStepIds = getStepIds();
    if (!validStepIds.includes(stepId)) {
      console.warn('[onboardingService] Invalid step ID:', stepId);
      return;
    }

    const fieldName = `seen_${stepId}`;

    // Update local state
    const localState = await getLocalState();
    const updatedState = {
      ...localState,
      [fieldName]: true,
      last_shown_at: new Date().toISOString(),
    };

    // Check if all steps are now seen
    const allSeen = validStepIds.every(id => updatedState[`seen_${id}`]);
    if (allSeen) {
      updatedState.all_completed = true;
      updatedState.completed_at = new Date().toISOString();
    }

    await saveLocalState(updatedState);

    // Sync to Supabase if user is logged in
    if (userId) {
      await upsertSupabaseState(userId, {
        [fieldName]: true,
        all_completed: updatedState.all_completed,
        completed_at: updatedState.completed_at,
      });
    }

    console.log('[onboardingService] Marked step seen:', stepId, allSeen ? '(completed)' : '');
  } catch (error) {
    console.error('[onboardingService] markStepSeen error:', error);
  }
};

/**
 * Mark onboarding as completed
 * @param {string} userId - User ID (optional)
 */
export const markCompleted = async (userId = null) => {
  try {
    const stepIds = getStepIds();
    const updates = {
      all_completed: true,
      completed_at: new Date().toISOString(),
    };

    // Mark all steps as seen
    stepIds.forEach(id => {
      updates[`seen_${id}`] = true;
    });

    // Update local state
    const localState = await getLocalState();
    await saveLocalState({ ...localState, ...updates });

    // Sync to Supabase
    if (userId) {
      await upsertSupabaseState(userId, updates);
    }

    console.log('[onboardingService] Onboarding completed');
  } catch (error) {
    console.error('[onboardingService] markCompleted error:', error);
  }
};

/**
 * Mark onboarding as skipped
 * @param {string} userId - User ID (optional)
 * @param {string} reason - Skip reason ('skip_button', 'outside_tap', etc.)
 */
export const markSkipped = async (userId = null, reason = 'skip_button') => {
  try {
    const updates = {
      skipped: true,
      skipped_at: new Date().toISOString(),
      skip_reason: reason,
    };

    // Update local state
    const localState = await getLocalState();
    await saveLocalState({
      ...localState,
      ...updates,
      dismissed_count: (localState.dismissed_count || 0) + 1,
    });

    // Sync to Supabase
    if (userId) {
      await upsertSupabaseState(userId, updates);
    }

    console.log('[onboardingService] Onboarding skipped:', reason);
  } catch (error) {
    console.error('[onboardingService] markSkipped error:', error);
  }
};

/**
 * Increment show count (call when modal opens)
 * @param {string} userId - User ID (optional)
 */
export const incrementShowCount = async (userId = null) => {
  try {
    const localState = await getLocalState();
    const updates = {
      show_count: (localState.show_count || 0) + 1,
      last_shown_at: new Date().toISOString(),
    };

    await saveLocalState({ ...localState, ...updates });

    if (userId) {
      await upsertSupabaseState(userId, updates);
    }
  } catch (error) {
    console.error('[onboardingService] incrementShowCount error:', error);
  }
};

/**
 * Reset onboarding (for testing or user request)
 * @param {string} userId - User ID (optional)
 */
export const resetOnboarding = async (userId = null) => {
  try {
    await saveLocalState({ ...DEFAULT_STATE });

    if (userId) {
      const { error } = await supabase
        .from('paper_trade_onboarding')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    }

    console.log('[onboardingService] Onboarding reset');
  } catch (error) {
    console.error('[onboardingService] resetOnboarding error:', error);
  }
};

/**
 * Get current onboarding state
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Object>} Current state
 */
export const getOnboardingState = async (userId = null) => {
  try {
    const localState = await getLocalState();

    // Merge with Supabase state if available
    if (userId) {
      const supabaseState = await getSupabaseState(userId);
      if (supabaseState) {
        return { ...localState, ...supabaseState };
      }
    }

    return localState;
  } catch (error) {
    console.error('[onboardingService] getOnboardingState error:', error);
    return { ...DEFAULT_STATE };
  }
};

/**
 * Sync local state to Supabase (call on login)
 * @param {string} userId - User ID
 */
export const syncToSupabase = async (userId) => {
  try {
    if (!userId) return;

    const localState = await getLocalState();
    const supabaseState = await getSupabaseState(userId);

    // If local has progress but Supabase doesn't, sync up
    if (localState.all_completed || localState.skipped) {
      if (!supabaseState?.all_completed && !supabaseState?.skipped) {
        await upsertSupabaseState(userId, localState);
        console.log('[onboardingService] Synced local state to Supabase');
      }
    }

    // If Supabase has progress but local doesn't, sync down
    if (supabaseState?.all_completed || supabaseState?.skipped) {
      if (!localState.all_completed && !localState.skipped) {
        await saveLocalState({ ...localState, ...supabaseState });
        console.log('[onboardingService] Synced Supabase state to local');
      }
    }
  } catch (error) {
    console.error('[onboardingService] syncToSupabase error:', error);
  }
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const onboardingService = {
  checkShouldShow,
  markStepSeen,
  markCompleted,
  markSkipped,
  incrementShowCount,
  resetOnboarding,
  getOnboardingState,
  syncToSupabase,
};

export default onboardingService;
