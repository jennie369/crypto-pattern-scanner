/**
 * shopOnboardingService.js - Shop Onboarding Service
 * Manages user onboarding progress for Shop features
 * Tracks which onboarding steps users have completed/skipped
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_STORAGE_KEY = '@gem_shop_onboarding';

// Onboarding steps configuration
export const SHOP_ONBOARDING_STEPS = [
  {
    key: 'welcome',
    title: 'Chào mừng đến Shop',
    description: 'Khám phá các sản phẩm tâm linh và phong thủy độc đáo',
    position: 'center',
    icon: 'sparkles',
    order: 0,
  },
  {
    key: 'categories',
    title: 'Danh mục sản phẩm',
    description: 'Chọn danh mục để xem sản phẩm theo chủ đề',
    position: 'top',
    targetRef: 'categoryGrid',
    icon: 'grid',
    order: 1,
  },
  {
    key: 'flash_sale',
    title: 'Flash Sale',
    description: 'Đừng bỏ lỡ các đợt giảm giá cực sốc!',
    position: 'bottom',
    targetRef: 'flashSaleSection',
    icon: 'zap',
    order: 2,
  },
  {
    key: 'wishlist',
    title: 'Yêu thích',
    description: 'Nhấn trái tim để lưu sản phẩm yêu thích',
    position: 'right',
    targetRef: 'wishlistButton',
    icon: 'heart',
    order: 3,
  },
  {
    key: 'recently_viewed',
    title: 'Đã xem gần đây',
    description: 'Xem lại các sản phẩm bạn đã tìm hiểu',
    position: 'bottom',
    targetRef: 'recentlyViewedSection',
    icon: 'clock',
    order: 4,
  },
  {
    key: 'complete',
    title: 'Hoàn tất!',
    description: 'Bạn đã sẵn sàng khám phá Shop. Chúc bạn mua sắm vui vẻ!',
    position: 'center',
    icon: 'check-circle',
    order: 5,
  },
];

/**
 * Get onboarding progress for current user
 * @returns {Promise<Object>} Onboarding progress data
 */
export const getOnboardingProgress = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

    if (!user) {
      // Return local progress for guest users
      return getLocalOnboardingProgress();
    }

    const { data, error } = await supabase
      .from('user_onboarding_progress')
      .select('*')
      .eq('user_id', user.id)
      .like('feature_key', 'shop_%');

    if (error) throw error;

    // Convert to object keyed by feature_key
    const progress = {};
    (data || []).forEach(item => {
      progress[item.feature_key] = {
        completed: true,
        skipped: item.skipped,
        completedAt: item.completed_at,
      };
    });

    return progress;
  } catch (err) {
    console.error('[shopOnboardingService] getOnboardingProgress error:', err);
    return {};
  }
};

/**
 * Check if user should see shop onboarding
 * @returns {Promise<boolean>} True if onboarding should be shown
 */
export const shouldShowOnboarding = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

    if (!user) {
      // Check local storage for guest users
      const stored = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!stored) return true;

      const progress = JSON.parse(stored);
      return !progress.shop_onboarding_complete;
    }

    const { data, error } = await supabase
      .from('user_onboarding_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('feature_key', 'shop_onboarding_complete')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !data;
  } catch (err) {
    console.error('[shopOnboardingService] shouldShowOnboarding error:', err);
    return false;
  }
};

/**
 * Mark an onboarding step as complete
 * @param {string} featureKey - The feature/step key
 * @param {boolean} skipped - Whether the step was skipped
 * @returns {Promise<Object>} Result with success status
 */
export const markStepComplete = async (featureKey, skipped = false) => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    const prefixedKey = featureKey.startsWith('shop_') ? featureKey : `shop_${featureKey}`;

    if (!user) {
      // Save to local storage for guest users
      return markLocalStepComplete(prefixedKey, skipped);
    }

    const { data, error } = await supabase
      .from('user_onboarding_progress')
      .upsert({
        user_id: user.id,
        feature_key: prefixedKey,
        skipped,
        completed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,feature_key',
      })
      .select()
      .single();

    if (error) throw error;

    console.log('[shopOnboardingService] Step completed:', prefixedKey);
    return { success: true, data };
  } catch (err) {
    console.error('[shopOnboardingService] markStepComplete error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Complete the entire onboarding
 * @param {boolean} skipped - Whether onboarding was skipped
 * @returns {Promise<Object>} Result with success status
 */
export const completeOnboarding = async (skipped = false) => {
  try {
    // Mark all steps as complete
    for (const step of SHOP_ONBOARDING_STEPS) {
      await markStepComplete(step.key, skipped);
    }

    // Mark the overall onboarding as complete
    await markStepComplete('shop_onboarding_complete', skipped);

    console.log('[shopOnboardingService] Onboarding completed, skipped:', skipped);
    return { success: true };
  } catch (err) {
    console.error('[shopOnboardingService] completeOnboarding error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Skip the onboarding entirely
 * @returns {Promise<Object>} Result with success status
 */
export const skipOnboarding = async () => {
  return completeOnboarding(true);
};

/**
 * Reset onboarding progress (for testing)
 * @returns {Promise<Object>} Result with success status
 */
export const resetOnboarding = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;

    if (!user) {
      // Clear local storage for guest users
      await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
      return { success: true };
    }

    const { error } = await supabase
      .from('user_onboarding_progress')
      .delete()
      .eq('user_id', user.id)
      .like('feature_key', 'shop_%');

    if (error) throw error;

    console.log('[shopOnboardingService] Onboarding reset');
    return { success: true };
  } catch (err) {
    console.error('[shopOnboardingService] resetOnboarding error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Get the current step index based on progress
 * @returns {Promise<number>} Current step index
 */
export const getCurrentStepIndex = async () => {
  try {
    const progress = await getOnboardingProgress();

    for (let i = 0; i < SHOP_ONBOARDING_STEPS.length; i++) {
      const step = SHOP_ONBOARDING_STEPS[i];
      const key = `shop_${step.key}`;
      if (!progress[key]) {
        return i;
      }
    }

    // All steps complete
    return SHOP_ONBOARDING_STEPS.length;
  } catch (err) {
    console.error('[shopOnboardingService] getCurrentStepIndex error:', err);
    return 0;
  }
};

/**
 * Get next onboarding step
 * @returns {Promise<Object|null>} Next step data or null if complete
 */
export const getNextStep = async () => {
  try {
    const currentIndex = await getCurrentStepIndex();

    if (currentIndex >= SHOP_ONBOARDING_STEPS.length) {
      return null;
    }

    return {
      ...SHOP_ONBOARDING_STEPS[currentIndex],
      index: currentIndex,
      totalSteps: SHOP_ONBOARDING_STEPS.length,
      isLastStep: currentIndex === SHOP_ONBOARDING_STEPS.length - 1,
    };
  } catch (err) {
    console.error('[shopOnboardingService] getNextStep error:', err);
    return null;
  }
};

/**
 * Advance to the next onboarding step
 * @returns {Promise<Object|null>} Next step data or null if complete
 */
export const advanceToNextStep = async () => {
  try {
    const currentStep = await getNextStep();

    if (!currentStep) {
      return null;
    }

    // Mark current step as complete
    await markStepComplete(currentStep.key);

    // Return next step
    return getNextStep();
  } catch (err) {
    console.error('[shopOnboardingService] advanceToNextStep error:', err);
    return null;
  }
};

// ============================================================
// LOCAL STORAGE FUNCTIONS (for guest users)
// ============================================================

/**
 * Get local onboarding progress from AsyncStorage
 */
const getLocalOnboardingProgress = async () => {
  try {
    const stored = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (err) {
    console.error('[shopOnboardingService] getLocalOnboardingProgress error:', err);
    return {};
  }
};

/**
 * Mark step complete in local storage
 */
const markLocalStepComplete = async (featureKey, skipped = false) => {
  try {
    const progress = await getLocalOnboardingProgress();

    progress[featureKey] = {
      completed: true,
      skipped,
      completedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
    return { success: true };
  } catch (err) {
    console.error('[shopOnboardingService] markLocalStepComplete error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Sync local onboarding progress to Supabase after user logs in
 */
export const syncLocalOnboardingToSupabase = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) return;

    const localProgress = await getLocalOnboardingProgress();
    if (Object.keys(localProgress).length === 0) return;

    // Upsert each step
    for (const [featureKey, data] of Object.entries(localProgress)) {
      await supabase
        .from('user_onboarding_progress')
        .upsert({
          user_id: user.id,
          feature_key: featureKey,
          skipped: data.skipped || false,
          completed_at: data.completedAt || new Date().toISOString(),
        }, {
          onConflict: 'user_id,feature_key',
        });
    }

    // Clear local storage after sync
    await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
    console.log('[shopOnboardingService] Local onboarding synced to Supabase');
  } catch (err) {
    console.error('[shopOnboardingService] syncLocalOnboardingToSupabase error:', err);
  }
};

export default {
  SHOP_ONBOARDING_STEPS,
  getOnboardingProgress,
  shouldShowOnboarding,
  markStepComplete,
  completeOnboarding,
  skipOnboarding,
  resetOnboarding,
  getCurrentStepIndex,
  getNextStep,
  advanceToNextStep,
  syncLocalOnboardingToSupabase,
};
