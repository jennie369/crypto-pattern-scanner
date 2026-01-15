/**
 * Gemral - Auth Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase, getCurrentUser, getUserProfile, signOut } from '../services/supabase';
import presenceService from '../services/presenceService';
import biometricService from '../services/biometricService';
import notificationScheduler from '../services/notificationScheduler';
import QuotaService from '../services/quotaService';
import paperTradeService from '../services/paperTradeService';

// Helper: Handle invalid refresh token by clearing session
const handleInvalidRefreshToken = async (setUser, setProfile) => {
  console.warn('[AuthContext] ⚠️ Invalid refresh token detected, clearing session...');
  try {
    // Clear biometric stored credentials
    await biometricService.disable();
    // Sign out to clear invalid session
    await signOut();
    // Clear state
    setUser(null);
    setProfile(null);
    // Cleanup services
    presenceService.cleanup();
    QuotaService.clearCache();
    paperTradeService.stopGlobalMonitoring();

    Alert.alert(
      'Phiên đăng nhập hết hạn',
      'Vui lòng đăng nhập lại để tiếp tục sử dụng app.',
      [{ text: 'OK' }]
    );
  } catch (err) {
    console.error('[AuthContext] Error clearing invalid session:', err);
  }
};

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Helper: Auto-enable biometric on login if device supports it
const autoEnableBiometric = async (session) => {
  try {
    // Check if already enabled
    const isAlreadyEnabled = await biometricService.isEnabled();
    if (isAlreadyEnabled) {
      console.log('[AuthContext] Biometric already enabled');
      return;
    }

    // Check if device supports biometric
    const support = await biometricService.checkSupport();
    if (!support.supported) {
      console.log('[AuthContext] Device does not support biometric');
      return;
    }

    // Auto-enable biometric silently (store credentials without prompting)
    const email = session?.user?.email;
    const refreshToken = session?.refresh_token;

    if (!email || !refreshToken) {
      console.warn('[AuthContext] Missing email or refresh token for biometric');
      return;
    }

    // Use autoEnable instead of enable (no authentication prompt)
    const result = await biometricService.autoEnable(email, refreshToken, support.typeName);
    if (result.success) {
      console.log('[AuthContext] ✅ Biometric auto-enabled:', support.typeName);
    } else {
      console.warn('[AuthContext] Biometric auto-enable failed:', result.error);
    }
  } catch (err) {
    console.error('[AuthContext] autoEnableBiometric error:', err);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // =====================================================
  // UPGRADE STATE - For showing UpgradeSuccessModal
  // =====================================================
  const [upgradeState, setUpgradeState] = useState({
    showModal: false,
    tierType: null,
    tierName: null,
    previousTier: null,
  });

  /**
   * Refresh user tier from database
   * Call this after successful purchase to update tier immediately
   * @param {boolean} showUpgradeModal - Show congratulations modal if tier changed
   * @returns {Object} { success, newProfile, tierChanged }
   */
  const refreshUserTier = async (showUpgradeModal = true) => {
    if (!user?.id) {
      console.warn('[AuthContext] refreshUserTier called without user');
      return { success: false, error: 'No user logged in' };
    }

    try {
      console.log('[AuthContext] Refreshing user tier...');
      const previousProfile = profile;

      // Fetch fresh profile from database
      const { data: newProfile, error } = await getUserProfile(user.id);

      if (error) {
        console.error('[AuthContext] Failed to refresh profile:', error);
        return { success: false, error: error.message };
      }

      // Update profile state
      setProfile(newProfile);

      // Check if any tier changed
      const tierChanged = {
        course: previousProfile?.subscription_tier !== newProfile?.subscription_tier,
        scanner: previousProfile?.scanner_tier !== newProfile?.scanner_tier,
        chatbot: previousProfile?.chatbot_tier !== newProfile?.chatbot_tier,
      };

      const anyTierChanged = tierChanged.course || tierChanged.scanner || tierChanged.chatbot;

      console.log('[AuthContext] Tier refresh result:', {
        anyTierChanged,
        changes: tierChanged,
        newTiers: {
          course: newProfile?.subscription_tier,
          scanner: newProfile?.scanner_tier,
          chatbot: newProfile?.chatbot_tier,
        },
      });

      // Show upgrade modal if tier changed and modal requested
      if (anyTierChanged && showUpgradeModal) {
        // Determine which tier type changed and to what
        let tierType = 'course';
        let tierName = newProfile?.subscription_tier;

        if (tierChanged.scanner && newProfile?.scanner_tier !== 'FREE') {
          tierType = 'scanner';
          tierName = newProfile?.scanner_tier;
        } else if (tierChanged.chatbot && newProfile?.chatbot_tier !== 'FREE') {
          tierType = 'chatbot';
          tierName = newProfile?.chatbot_tier;
        }

        setUpgradeState({
          showModal: true,
          tierType,
          tierName,
          previousTier: previousProfile?.subscription_tier || previousProfile?.scanner_tier || 'FREE',
        });
      }

      // Refresh quota cache to reflect new tier limits
      QuotaService.clearCache();
      QuotaService.checkAllQuotas(user.id, true).catch(err => {
        console.warn('[AuthContext] Quota refresh after tier update failed:', err?.message);
      });

      return {
        success: true,
        newProfile,
        tierChanged: anyTierChanged,
        changes: tierChanged,
      };

    } catch (error) {
      console.error('[AuthContext] refreshUserTier error:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Close the upgrade success modal
   */
  const closeUpgradeModal = () => {
    setUpgradeState(prev => ({ ...prev, showModal: false }));
  };

  // Load initial session
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { user, error } = await getCurrentUser();

        // Check for invalid refresh token error
        if (error?.isInvalidRefreshToken || error?.message?.includes('Refresh Token') || error?.message?.includes('refresh_token')) {
          await handleInvalidRefreshToken(setUser, setProfile);
          setLoading(false);
          setInitialized(true);
          return;
        }

        if (user) {
          setUser(user);
          const { data: profileData } = await getUserProfile(user.id);
          setProfile(profileData);

          // ⚡ DEBUG: Log admin fields
          console.log('[AuthContext] Profile loaded:', {
            userId: user.id,
            role: profileData?.role,
            is_admin: profileData?.is_admin,
            scanner_tier: profileData?.scanner_tier,
            chatbot_tier: profileData?.chatbot_tier,
          });

          // Initialize presence service for real-time messaging
          presenceService.initialize();

          // Initialize push notification scheduler
          notificationScheduler.initialize(user.id).then((success) => {
            if (success) {
              console.log('[AuthContext] Push notifications initialized');
            }
          }).catch((err) => {
            console.warn('[AuthContext] Push notifications init failed:', err?.message);
          });

          // =====================================================
          // REFRESH QUOTA ON APP START (Database-backed)
          // Clear cache and fetch fresh quota from database
          // =====================================================
          QuotaService.clearCache();
          QuotaService.checkAllQuotas(user.id, true).then((quota) => {
            console.log('[AuthContext] Quota refreshed on app start:', {
              chatbot: `${quota.chatbot?.remaining}/${quota.chatbot?.limit}`,
              scanner: `${quota.scanner?.remaining}/${quota.scanner?.limit}`,
              resetAt: quota.resetAt,
            });
          }).catch((err) => {
            console.warn('[AuthContext] Quota refresh failed:', err?.message);
          });

          // =====================================================
          // START PAPER TRADE MONITORING (Auto-close TP/SL)
          // Checks positions every 5 seconds even when app is backgrounded
          // =====================================================
          paperTradeService.startGlobalMonitoring(user.id, 5000);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        // Handle invalid refresh token in catch block
        if (error?.message?.includes('Refresh Token') || error?.message?.includes('refresh_token')) {
          await handleInvalidRefreshToken(setUser, setProfile);
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    loadSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth event:', event);

        // Handle token refresh failure
        if (event === 'TOKEN_REFRESH_FAILED' || event === 'SIGNED_OUT') {
          // Check if this was due to invalid refresh token
          if (!session) {
            console.warn('[AuthContext] Session ended, checking if refresh token issue...');
          }
        }

        // Update biometric stored token when token is refreshed
        if (event === 'TOKEN_REFRESHED' && session?.refresh_token) {
          try {
            const isEnabled = await biometricService.isEnabled();
            if (isEnabled) {
              await biometricService.updateToken(session.refresh_token);
              console.log('[AuthContext] Biometric token updated');
            }
          } catch (err) {
            console.error('[AuthContext] Failed to update biometric token:', err);
          }
        }

        if (session?.user) {
          setUser(session.user);
          const { data: profileData } = await getUserProfile(session.user.id);
          setProfile(profileData);

          // ⚡ DEBUG: Log admin fields on auth change
          console.log('[AuthContext] Profile updated:', {
            userId: session.user.id,
            role: profileData?.role,
            is_admin: profileData?.is_admin,
            scanner_tier: profileData?.scanner_tier,
            chatbot_tier: profileData?.chatbot_tier,
          });

          // Initialize presence service for real-time messaging
          presenceService.initialize();

          // Initialize push notifications on login
          if (event === 'SIGNED_IN') {
            notificationScheduler.initialize(session.user.id).then((success) => {
              if (success) {
                console.log('[AuthContext] Push notifications initialized on sign in');
              }
            }).catch((err) => {
              console.warn('[AuthContext] Push notifications init failed:', err?.message);
            });

            // REFRESH QUOTA ON LOGIN
            QuotaService.clearCache();
            QuotaService.checkAllQuotas(session.user.id, true).then((quota) => {
              console.log('[AuthContext] Quota refreshed on login:', {
                chatbot: `${quota.chatbot?.remaining}/${quota.chatbot?.limit}`,
                scanner: `${quota.scanner?.remaining}/${quota.scanner?.limit}`,
              });
            }).catch((err) => {
              console.warn('[AuthContext] Quota refresh failed:', err?.message);
            });

            // AUTO-ENABLE BIOMETRIC ON LOGIN (if device supports and not already enabled)
            autoEnableBiometric(session).catch((err) => {
              console.warn('[AuthContext] Auto biometric failed:', err?.message);
            });

            // START PAPER TRADE MONITORING on login
            paperTradeService.startGlobalMonitoring(session.user.id, 5000);

            // APPLY PENDING PURCHASES ON LOGIN
            // This handles the case where user bought via Shopify before creating GEM account
            supabase.rpc('apply_all_pending_purchases', { p_user_id: session.user.id })
              .then(({ data, error }) => {
                if (data?.success) {
                  console.log('[AuthContext] Pending purchases applied:', data);
                  // Refresh profile to get updated tiers
                  if (data.tier_upgrades?.applied_count > 0 || data.gem_credits?.credits_claimed > 0) {
                    getUserProfile(session.user.id).then(({ data: newProfile }) => {
                      setProfile(newProfile);
                      console.log('[AuthContext] Profile refreshed after pending claims');
                    });
                  }
                } else if (error) {
                  console.warn('[AuthContext] Apply pending failed (non-critical):', error?.message);
                }
              })
              .catch((err) => {
                console.warn('[AuthContext] Apply pending error (non-critical):', err?.message);
              });

            // LINK WAITLIST ENTRY ON SIGNUP
            // Links Early Bird waitlist registration to user account
            // Also applies Early Bird benefits (discount code + scanner trial)
            supabase.rpc('link_user_to_waitlist', {
              p_user_id: session.user.id,
              p_email: session.user.email,
              p_phone: session.user.user_metadata?.phone || null
            })
              .then(({ data, error }) => {
                if (data?.success) {
                  console.log('[AuthContext] Waitlist linked:', data);
                  // Refresh profile to get queue_number, referral_code, and scanner_tier
                  getUserProfile(session.user.id).then(({ data: newProfile }) => {
                    setProfile(newProfile);
                    console.log('[AuthContext] Profile refreshed with Early Bird benefits:', {
                      queue_number: newProfile?.queue_number,
                      scanner_tier: newProfile?.scanner_tier,
                      scanner_trial_ends_at: newProfile?.scanner_trial_ends_at,
                      early_bird_discount_code: newProfile?.early_bird_discount_code,
                    });
                  });
                  // Note: Welcome notification will be shown by the signup screen
                  // Store the waitlist info for display (includes is_top_100 flag)
                  if (global.onWaitlistLinked) {
                    global.onWaitlistLinked(data);
                  }
                } else if (error) {
                  // Non-critical - user just wasn't on waitlist
                  console.log('[AuthContext] Waitlist link skipped:', error?.message || 'No waitlist entry');
                }
              })
              .catch((err) => {
                // Non-blocking - failures don't break signup
                console.log('[AuthContext] Waitlist link skipped:', err?.message);
              });
          }
        } else {
          setUser(null);
          setProfile(null);

          // Cleanup presence service on logout
          presenceService.cleanup();

          // Clear quota cache on logout
          QuotaService.clearCache();

          // STOP PAPER TRADE MONITORING on logout
          paperTradeService.stopGlobalMonitoring();
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // ⚡ ADMIN CHECK - Critical for admin features
  const isAdmin = profile?.role === 'admin' ||
                  profile?.role === 'ADMIN' ||
                  profile?.is_admin === true ||
                  profile?.scanner_tier === 'ADMIN' ||
                  profile?.chatbot_tier === 'ADMIN';

  // ⚡ MANAGER CHECK - Manager has limited admin access (Content, Courses only)
  // Manager gets unlimited Scanner, Chatbot, Vision Board but restricted Admin sections
  const isManager = profile?.role === 'manager' || profile?.role === 'MANAGER';

  // ⚡ DEBUG: Log isAdmin/isManager result whenever profile changes
  useEffect(() => {
    if (profile) {
      console.log('[AuthContext] ⚡ Role check:', { isAdmin, isManager, role: profile?.role });
    }
  }, [profile, isAdmin, isManager]);

  // Get highest tier (admin/manager gets unlimited)
  const userTier = (isAdmin || isManager) ? 'ADMIN' : (profile?.scanner_tier || profile?.chatbot_tier || 'FREE');

  const value = {
    user,
    profile,
    loading,
    initialized,
    isAuthenticated: !!user,
    tier: profile?.scanner_tier || 'FREE',  // Always uppercase per DATABASE_SCHEMA.md
    userTier, // Normalized tier (uppercase)
    isAdmin,  // Admin flag for bypassing restrictions
    isManager, // Manager flag for limited admin access

    // Tier refresh & upgrade modal
    refreshUserTier, // Call after purchase to refresh tier and show modal
    upgradeState, // { showModal, tierType, tierName, previousTier }
    closeUpgradeModal, // Close the upgrade success modal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
