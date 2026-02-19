/**
 * Gemral - Auth Context
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase, getUserProfile, signOut, localOnlySignOut } from '../services/supabase';
import presenceService from '../services/presenceService';
import biometricService from '../services/biometricService';
import notificationScheduler from '../services/notificationScheduler';
import QuotaService from '../services/quotaService';
import paperTradeService from '../services/paperTradeService';
import connectionHealthMonitor from '../services/connectionHealthMonitor';
import { websocketService } from '../services/websocketService';
import { hybridChatService } from '../services/hybridChatService';
import cacheService from '../services/cacheService';
import { notificationService } from '../services/notificationService';
import { errorService } from '../services/errorService';
import { clearEventSession } from '../hooks/useEventTracking';

// withAuthTimeout REMOVED (Phase 11 Fix):
// refreshProfile() now uses getSession() (local storage, instant) instead of
// getUser() (API call that hung on cold Supabase / slow network).
// loadSession() was already fixed in Phase 9b. Both paths are now instant.

// Helper: Handle invalid refresh token by clearing session
const handleInvalidRefreshToken = async (setUser, setProfile) => {
  console.warn('[AuthContext] ⚠️ Invalid refresh token detected, clearing session...');
  try {
    // Clear biometric stored credentials (but keep biometric_enabled preference)
    await biometricService.clearCredentials();
    // Sign out to clear invalid session
    await signOut();
    // Clear state
    setUser(null);
    setProfile(null);
    // Cleanup services
    presenceService.cleanup();
    QuotaService.clearCache();
    paperTradeService.stopGlobalMonitoring();
    connectionHealthMonitor.stop();
    websocketService.disconnect();
    hybridChatService.cleanup();
    try {
      supabase.getChannels().forEach(ch => supabase.removeChannel(ch));
    } catch (e) {}

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
    const email = session?.user?.email;
    const refreshToken = session?.refresh_token;

    if (!email || !refreshToken) {
      console.warn('[AuthContext] Missing email or refresh token for biometric');
      return;
    }

    // Check if already enabled - if so, just update the token
    const isAlreadyEnabled = await biometricService.isEnabled();
    if (isAlreadyEnabled) {
      // UPDATE token on every login to ensure it's always fresh
      // This fixes Face ID failing after user logs in with email/password
      await biometricService.updateToken(refreshToken);
      console.log('[AuthContext] Biometric token updated on login');
      return;
    }

    // Check if device supports biometric
    const support = await biometricService.checkSupport();
    if (!support.supported) {
      console.log('[AuthContext] Device does not support biometric');
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

  // Track current user in a ref so onAuthStateChange callback
  // can detect involuntary sign-out (ref avoids stale closure issue with [] deps)
  const userRef = useRef(null);

  // Flag to distinguish manual logout from involuntary sign-out
  // When true, onAuthStateChange won't show "session expired" popup
  // and won't clear biometric preferences
  const isIntentionalLogoutRef = useRef(false);

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

  // =====================================================
  // APP RESUME: Re-validate session + refresh profile
  // Fixes: stale auth, missing avatar, role not recognized,
  // quota not loaded after app idle/background
  // =====================================================
  // appStateRef and lastResumeRef removed — AppState listener consolidated into AppResumeManager
  const isRefreshingRef = useRef(false);

  /**
   * Refresh user profile, role, and quota from database.
   * Safe to call anytime - no-ops if no user or already refreshing.
   * Called automatically on app resume and can be called manually.
   */
  const refreshProfile = useCallback(async () => {
    // Guard: no user logged in
    if (!user?.id) {
      console.log('[AuthContext] refreshProfile: no user, skipping');
      return { success: false, reason: 'no_user' };
    }

    // Guard: already refreshing
    if (isRefreshingRef.current) {
      console.log('[AuthContext] refreshProfile: already in progress, skipping');
      return { success: false, reason: 'already_refreshing' };
    }

    isRefreshingRef.current = true;

    try {
      console.log('[AuthContext] refreshProfile: reading session and refreshing profile...');

      // Step 1: Read session from local storage (INSTANT, no network call)
      // Phase 11 Fix: Changed from getUser() (API call → /auth/v1/user) to getSession() (local).
      // getUser() hung on cold Supabase / slow network, causing "Auth timeout" after 10s.
      // Session validation & token refresh is already handled by:
      //   - AppResumeManager Step 1 (_refreshSession → getSession + refreshSession)
      //   - onAuthStateChange (auto token refresh on TOKEN_REFRESHED event)
      // The profile fetch at Step 3 will naturally fail with auth error if session is invalid.
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      const freshUser = session?.user ?? null;

      if (authError) {
        // Check for invalid refresh token
        if (authError.message?.includes('Refresh Token') ||
            authError.message?.includes('refresh_token') ||
            authError.code === 'invalid_grant') {
          console.warn('[AuthContext] refreshProfile: session expired, clearing...');
          await handleInvalidRefreshToken(setUser, setProfile);
          return { success: false, reason: 'session_expired' };
        }
        console.warn('[AuthContext] refreshProfile: auth error:', authError.message);
        return { success: false, reason: 'auth_error' };
      }

      if (!freshUser) {
        console.warn('[AuthContext] refreshProfile: no user in session');
        return { success: false, reason: 'no_user_returned' };
      }

      // Step 2: Update user state (may have new metadata)
      setUser(freshUser);

      // Step 3: Re-fetch profile from database (role, avatar, tier, etc.)
      const { data: freshProfile, error: profileError } = await getUserProfile(freshUser.id);

      if (profileError) {
        console.warn('[AuthContext] refreshProfile: profile fetch error:', profileError.message);
        return { success: false, reason: 'profile_error' };
      }

      // Step 4: Update profile state - this triggers re-render for all consumers
      setProfile(freshProfile);

      console.log('[AuthContext] refreshProfile: success', {
        userId: freshUser.id,
        role: freshProfile?.role,
        is_admin: freshProfile?.is_admin,
        avatar_url: freshProfile?.avatar_url ? 'present' : 'missing',
        scanner_tier: freshProfile?.scanner_tier,
        chatbot_tier: freshProfile?.chatbot_tier,
      });

      // Step 5: Refresh quota cache
      QuotaService.clearCache();
      QuotaService.checkAllQuotas(freshUser.id, true).then((quota) => {
        console.log('[AuthContext] refreshProfile: quota refreshed', {
          chatbot: `${quota?.chatbot?.remaining ?? '?'}/${quota?.chatbot?.limit ?? '?'}`,
          scanner: `${quota?.scanner?.remaining ?? '?'}/${quota?.scanner?.limit ?? '?'}`,
        });
      }).catch((err) => {
        console.warn('[AuthContext] refreshProfile: quota refresh failed:', err?.message);
      });

      return { success: true, profile: freshProfile };

    } catch (error) {
      console.error('[AuthContext] refreshProfile error:', error);
      return { success: false, reason: 'exception', error: error.message };
    } finally {
      isRefreshingRef.current = false;
    }
  }, [user?.id]);

  // =====================================================
  // APP STATE LISTENER: REMOVED (Issue 2 Fix)
  //
  // Previously, AuthContext had its own AppState listener that
  // raced with AppResumeManager (3 listeners firing simultaneously).
  // Now AppResumeManager is the SOLE resume handler and calls
  // refreshProfile() directly via the registered callback.
  //
  // The refreshProfile() function is still available for:
  // - AppResumeManager to call on resume (via registered callback)
  // - Manual calls from screens (e.g. after purchase)
  // - SIGNED_IN auth event post-login operations
  // =====================================================

  // =====================================================
  // SHARED CLEANUP: Single source of truth for logout cleanup
  // Used by both onAuthStateChange SIGNED_OUT and intentionalLogout
  // Fixes A3: dual logout path with duplicated cleanup code
  // =====================================================
  const performFullCleanup = useCallback(async (previousUserId) => {
    console.log('[AuthContext] performFullCleanup:', { previousUserId });

    userRef.current = null;
    setUser(null);
    setProfile(null);

    // Cleanup all services — Phase 9 Fix: individual try/catch prevents
    // one service crash from blocking all cleanup (and setLoading(false))
    try { presenceService.cleanup(); } catch (e) { console.warn('[AuthContext] presenceService cleanup error:', e?.message); }
    try { QuotaService.clearCache(); } catch (e) { console.warn('[AuthContext] QuotaService cleanup error:', e?.message); }
    try { paperTradeService.stopGlobalMonitoring(); } catch (e) { console.warn('[AuthContext] paperTradeService cleanup error:', e?.message); }
    try { connectionHealthMonitor.stop(); } catch (e) { console.warn('[AuthContext] connectionHealthMonitor cleanup error:', e?.message); }
    try { websocketService.disconnect(); } catch (e) { console.warn('[AuthContext] websocketService cleanup error:', e?.message); }
    try { hybridChatService.cleanup(); } catch (e) { console.warn('[AuthContext] hybridChatService cleanup error:', e?.message); }

    // Stop zone price monitor (lazy loaded to avoid circular deps)
    try {
      const { zonePriceMonitor } = require('../services/zonePriceMonitor');
      zonePriceMonitor.stop();
    } catch (e) {}

    // Clear user cache
    if (previousUserId) {
      cacheService.clearUserCache(previousUserId).catch(() => {});
    }

    // Remove all Supabase Realtime channels
    try {
      supabase.getChannels().forEach(ch => supabase.removeChannel(ch));
    } catch (e) {
      console.warn('[AuthContext] Channel cleanup error:', e?.message);
    }

    // A7: Clear module-level caches that persist across login/logout
    try {
      const { clearForumCache } = require('../screens/Forum/ForumScreen');
      clearForumCache?.();
    } catch (e) {}
    try {
      const { clearNotificationsCache } = require('../screens/tabs/NotificationsScreen');
      clearNotificationsCache?.();
    } catch (e) {}

    // C3: Clear module-level user/session state to prevent cross-user bleed
    try { errorService.clearUserId(); } catch (e) {}
    try { clearEventSession(); } catch (e) {}
  }, []);

  // Load initial session
  useEffect(() => {
    const loadSession = async () => {
      console.time('[AUTH] Total startup');
      try {
        // Phase 9b Fix: Use getSession() instead of getCurrentUser()
        // getSession() reads from AsyncStorage (INSTANT, no network call).
        // getCurrentUser() called supabase.auth.getUser() which makes an API call
        // to /auth/v1/user — this hangs on cold Supabase / slow network, causing
        // "Auth timeout" after 10s and cascade failure (user=null → profile=null → FREE tier).
        // Token verification is handled by onAuthStateChange (INITIAL_SESSION event).
        console.time('[AUTH] getSession');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.timeEnd('[AUTH] getSession');

        // Check for invalid refresh token error
        if (sessionError?.isInvalidRefreshToken || sessionError?.message?.includes('Refresh Token') || sessionError?.message?.includes('refresh_token') || sessionError?.code === 'invalid_grant') {
          await handleInvalidRefreshToken(setUser, setProfile);
          setLoading(false);
          setInitialized(true);
          return;
        }

        const user = session?.user ?? null;

        if (user) {
          userRef.current = user;
          setUser(user);

          // Fetch profile with error handling + retry + 10s total budget
          // Budget: first try (up to 8s) + 1s delay + retry (up to 8s) = 17s worst case.
          // Watchdog fires at 15s. Cap entire profile fetch at 10s so loadSession
          // completes in <12s. App recovers via FORCE_REFRESH_EVENT if profile is null.
          console.time('[AUTH] getUserProfile');
          let profileData = null;
          try {
            profileData = await Promise.race([
              (async () => {
                const { data: firstTry, error: firstError } = await getUserProfile(user.id);
                if (firstError || !firstTry) {
                  console.warn('[AuthContext] loadSession: profile fetch failed, retrying in 1s...', firstError?.message);
                  await new Promise(r => setTimeout(r, 1000));
                  const { data: retryData, error: retryError } = await getUserProfile(user.id);
                  if (retryData) return retryData;
                  console.error('[AuthContext] loadSession: profile retry also failed:', retryError?.message);
                  return null;
                }
                return firstTry;
              })(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch budget exceeded (10s)')), 10000)),
            ]);
          } catch (budgetErr) {
            console.warn('[AuthContext] loadSession:', budgetErr.message, '— continuing with null profile');
          }
          setProfile(profileData);
          console.timeEnd('[AUTH] getUserProfile');

          // ⚡ DEBUG: Log admin fields
          console.log('[AuthContext] Profile loaded:', {
            userId: user.id,
            role: profileData?.role,
            is_admin: profileData?.is_admin,
            scanner_tier: profileData?.scanner_tier,
            chatbot_tier: profileData?.chatbot_tier,
            loaded: !!profileData,
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
        // Phase 9b Fix: Do NOT blindly set user=null on error.
        // onAuthStateChange (INITIAL_SESSION) may have already set user + profile.
        // Only clear if we genuinely have no session (userRef is empty).
        else if (!userRef.current) {
          console.warn('[AuthContext] loadSession error and no user found — clearing state');
          setUser(null);
          setProfile(null);
        } else {
          console.warn('[AuthContext] loadSession error but user exists via onAuthStateChange — keeping state');
        }
      } finally {
        setLoading(false);
        setInitialized(true);
        console.timeEnd('[AUTH] Total startup');
        console.log('[AUTH] ✅ loadSession complete — initialized=true, loading=false');
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
          userRef.current = session.user;
          setUser(session.user);

          // Fetch profile with error handling + retry + 10s budget
          let profileData = null;
          try {
            profileData = await Promise.race([
              (async () => {
                const { data: firstTry, error: firstError } = await getUserProfile(session.user.id);
                if (firstError || !firstTry) {
                  console.warn('[AuthContext] onAuthStateChange: profile fetch failed, retrying in 1s...', firstError?.message);
                  await new Promise(r => setTimeout(r, 1000));
                  const { data: retryData, error: retryError } = await getUserProfile(session.user.id);
                  if (retryData) return retryData;
                  console.error('[AuthContext] onAuthStateChange: profile retry also failed:', retryError?.message);
                  return null;
                }
                return firstTry;
              })(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch budget exceeded (10s)')), 10000)),
            ]);
          } catch (budgetErr) {
            console.warn('[AuthContext] onAuthStateChange:', budgetErr.message);
          }
          setProfile(profileData);

          // ⚡ DEBUG: Log admin fields on auth change
          console.log('[AuthContext] Profile updated:', {
            userId: session.user.id,
            role: profileData?.role,
            is_admin: profileData?.is_admin,
            scanner_tier: profileData?.scanner_tier,
            chatbot_tier: profileData?.chatbot_tier,
            loaded: !!profileData,
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

            // A5: Sequential post-login operations (prevents 3 concurrent setProfile races)
            // Run sequentially so only ONE final profile refresh happens
            (async () => {
              let needsProfileRefresh = false;

              // APPLY PENDING PURCHASES ON LOGIN
              try {
                const { data: purchaseResult, error: purchaseError } = await supabase.rpc(
                  'apply_all_pending_purchases',
                  { p_user_id: session.user.id }
                );
                if (purchaseResult?.success) {
                  console.log('[AuthContext] Pending purchases applied:', purchaseResult);
                  if (purchaseResult.tier_upgrades?.applied_count > 0 || purchaseResult.gem_credits?.credits_claimed > 0) {
                    needsProfileRefresh = true;
                  }
                } else if (purchaseError) {
                  console.warn('[AuthContext] Apply pending failed (non-critical):', purchaseError?.message);
                }
              } catch (err) {
                console.warn('[AuthContext] Apply pending error (non-critical):', err?.message);
              }

              // LINK WAITLIST ENTRY ON SIGNUP
              try {
                const { data: waitlistResult, error: waitlistError } = await supabase.rpc(
                  'link_user_to_waitlist',
                  {
                    p_user_id: session.user.id,
                    p_email: session.user.email,
                    p_phone: session.user.user_metadata?.phone || null,
                  }
                );
                if (waitlistResult?.success) {
                  console.log('[AuthContext] Waitlist linked:', waitlistResult);
                  needsProfileRefresh = true;
                  if (global.onWaitlistLinked) {
                    global.onWaitlistLinked(waitlistResult);
                  }
                } else if (waitlistError) {
                  console.log('[AuthContext] Waitlist link skipped:', waitlistError?.message || 'No waitlist entry');
                }
              } catch (err) {
                console.log('[AuthContext] Waitlist link skipped:', err?.message);
              }

              // Single profile refresh at the end if anything changed
              if (needsProfileRefresh) {
                try {
                  const { data: freshProfile } = await getUserProfile(session.user.id);
                  if (freshProfile) {
                    setProfile(freshProfile);
                    console.log('[AuthContext] Profile refreshed after post-login operations:', {
                      queue_number: freshProfile?.queue_number,
                      scanner_tier: freshProfile?.scanner_tier,
                      scanner_trial_ends_at: freshProfile?.scanner_trial_ends_at,
                    });
                  }
                } catch (err) {
                  console.warn('[AuthContext] Post-login profile refresh failed:', err?.message);
                }
              }
            })();
          }
        } else {
          // A3: Use shared cleanup (single source of truth)
          const wasLoggedIn = !!userRef.current;
          const previousUserId = userRef.current?.id;

          await performFullCleanup(previousUserId);

          // Distinguish manual logout from involuntary sign-out
          if (wasLoggedIn && (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESH_FAILED')) {
            if (isIntentionalLogoutRef.current) {
              // Manual logout: don't show expired popup, don't clear biometric preference
              console.log('[AuthContext] Intentional logout - no expired popup, keeping biometric preference');
              isIntentionalLogoutRef.current = false;
            } else {
              // Involuntary sign-out (token expired/revoked)
              // Only clear stored credentials (token), keep biometric_enabled preference
              // so BiometricButton still shows on login screen
              console.warn('[AuthContext] Involuntary sign-out detected, clearing biometric credentials...');
              biometricService.clearCredentials().catch((err) => {
                console.error('[AuthContext] Failed to clear biometric credentials:', err);
              });
              Alert.alert(
                'Phiên đăng nhập hết hạn',
                'Vui lòng đăng nhập lại để tiếp tục sử dụng app.',
                [{ text: 'OK' }]
              );
            }
          }
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // =====================================================
  // INTENTIONAL LOGOUT
  // Sets flag before signOut so onAuthStateChange knows
  // this is a manual logout, not a session expiry
  // =====================================================
  const intentionalLogout = useCallback(async () => {
    isIntentionalLogoutRef.current = true;
    console.log('[AuthContext] Intentional logout initiated');
    try {
      // A6: Remove push token BEFORE signout (while session is still active)
      try {
        await notificationService.removePushToken();
        console.log('[AuthContext] Push token removed on logout');
      } catch (err) {
        console.warn('[AuthContext] Push token removal failed (non-critical):', err?.message);
      }

      // Use localOnlySignOut to clear session WITHOUT revoking on server
      // This keeps the refresh token valid for biometric re-login
      await localOnlySignOut();

      // A3: Use shared cleanup (single source of truth)
      const previousUserId = userRef.current?.id;
      await performFullCleanup(previousUserId);

      // Reset the flag
      isIntentionalLogoutRef.current = false;
      setLoading(false);

      console.log('[AuthContext] Intentional logout completed - biometric preserved');
      return { error: null };
    } catch (error) {
      isIntentionalLogoutRef.current = false;
      console.error('[AuthContext] Intentional logout error:', error);
      throw error;
    }
  }, [performFullCleanup]);

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

    // App resume re-hydration
    refreshProfile, // Call to manually refresh profile, role, quota from database

    // Logout
    intentionalLogout, // Call this for manual logout (won't show expired popup)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
