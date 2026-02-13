import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { orderMonitor } from '../services/orderMonitor';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthContext] getSession result:', !!session?.user);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Initial load - pass true to set loading state
        loadUserProfile(session.user.id, true).finally(() => {
          setInitialLoadDone(true);
        });
      } else {
        setLoading(false);
        setInitialLoadDone(true);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthContext] onAuthStateChange:', _event, !!session?.user);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Not initial load - don't set loading to avoid flicker
        loadUserProfile(session.user.id, false);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ===== START ORDER MONITORING WHEN USER LOGS IN =====
  useEffect(() => {
    if (user && profile?.id) {
      // Get or create paper trading account
      const initializeAndMonitor = async () => {
        try {
          // Get account
          const { data: account, error } = await supabase
            .from('paper_trading_accounts')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') {
            console.error('❌ [AuthContext] Error fetching paper trading account:', error);
            return;
          }

          let accountId;

          if (!account) {
            // Create account if doesn't exist
            const { data: newAccount, error: createError } = await supabase
              .from('paper_trading_accounts')
              .insert({
                user_id: user.id,
                balance: 100000,
                initial_balance: 100000,
              })
              .select('id')
              .single();

            if (createError) {
              console.error('❌ [AuthContext] Error creating paper trading account:', createError);
              return;
            }

            accountId = newAccount.id;
            console.log('✅ [AuthContext] Paper trading account created:', accountId);
          } else {
            accountId = account.id;
          }

          // Start monitoring pending orders
          console.log('🔍 [AuthContext] Starting order monitor for user:', user.id);
          await orderMonitor.startMonitoring(user.id, accountId);
        } catch (error) {
          console.error('❌ [AuthContext] Error initializing order monitor:', error);
        }
      };

      initializeAndMonitor();
    } else {
      // User logged out - stop monitoring
      orderMonitor.stopMonitoring();
    }

    return () => {
      // Cleanup: stop monitoring when component unmounts
      orderMonitor.stopMonitoring();
    };
  }, [user, profile]);

  // ===== LOAD USER PROFILE =====
  const loadUserProfile = async (userId, isInitialLoad = false) => {
    console.log('📊 Loading profile for user:', userId, '| initial:', isInitialLoad);

    // Only set loading to true on initial load (not on refresh/auth state change)
    // This prevents screen flickering when profile is reloaded
    if (isInitialLoad) {
      setLoading(true);
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          display_name,
          bio,
          avatar_url,
          twitter_handle,
          telegram_handle,
          scan_count,
          last_scan_at,
          created_at,
          updated_at,
          course_tier,
          scanner_tier,
          chatbot_tier,
          course_tier_expires_at,
          scanner_tier_expires_at,
          chatbot_tier_expires_at,
          verified_seller,
          verified_trader,
          level_badge,
          role_badge,
          achievement_badges,
          role
        `)
        .eq('id', userId)
        .maybeSingle();

      // 🔍 DEBUG LOGS
      console.log('═══ AUTH CONTEXT DEBUG (loadUserProfile) ═══');
      console.log('User ID:', userId);
      console.log('Profile Data:', data);
      console.log('Course Tier:', data?.course_tier);
      console.log('Scanner Tier:', data?.scanner_tier);
      console.log('Fetch Error:', error);
      console.log('══════════════════════════');

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error loading profile:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Profile loaded:', data);

        // 🔍 CHECK: localStorage interference
        console.log('localStorage profile:', localStorage.getItem('profile'));
        console.log('sessionStorage profile:', sessionStorage.getItem('profile'));

        // 🔍 DETAILED PROFILE STATE DEBUG
        console.log('═══ PROFILE STATE DEBUG ═══');
        console.log('1. Raw Supabase data:', JSON.stringify(data, null, 2));
        console.log('2. Data has course_tier?:', 'course_tier' in (data || {}));
        console.log('3. Data has scanner_tier?:', 'scanner_tier' in (data || {}));
        console.log('4. Tier values:', {
          course: data?.course_tier,
          scanner: data?.scanner_tier,
          chatbot: data?.chatbot_tier
        });
        console.log('5. About to call setProfile with:', data);

        setProfile(data);
        setLoading(false);

        // ⚡ FIX: Force refresh profile khi load
        window.currentUserProfile = data;

        // 🔍 CHECK: Profile state after setProfile
        setTimeout(() => {
          console.log('6. Profile state after setProfile (100ms delay):', profile);
          console.log('7. Profile has course_tier?:', profile?.course_tier);
          console.log('8. Profile has scanner_tier?:', profile?.scanner_tier);
          console.log('9. window.currentUserProfile:', window.currentUserProfile);
        }, 100);

        console.log('═══════════════════════════');

        return;
      }

      console.warn('⚠️ Profile not found, creating...');
      await createUserProfile(userId);

    } catch (err) {
      console.error('💥 Load profile failed:', err);
      setLoading(false);
    }
  };

  // ===== CREATE USER PROFILE (FALLBACK) =====
  const createUserProfile = async (userId) => {
    console.log('🆕 Creating profile for user:', userId);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error('No authenticated user');
      }

      const newProfile = {
        id: userId,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || null,
        tier: 'free',
        course_tier: 'free',
        scanner_tier: 'free',
        chatbot_tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('📝 Inserting profile:', newProfile);

      const { data, error } = await supabase
        .from('users')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to create profile:', error);
        throw error;
      }

      console.log('✅ Profile created:', data);
      setProfile(data);

      // Also create quota record
      try {
        await supabase.from('daily_scan_quota').upsert([{
          user_id: userId,
          scan_count: 0,
          max_scans: 5
        }], {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });
        console.log('✅ Quota record created');
      } catch (quotaErr) {
        console.warn('⚠️ Could not create quota record:', quotaErr);
      }

      setLoading(false);

    } catch (err) {
      console.error('💥 Create profile failed:', err);
      setLoading(false);
    }
  };

  // ===== SIGNUP =====
  const signUp = async (email, password, fullName = '') => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 SIGNUP START');
    console.log('Email:', email);
    console.log('Full Name:', fullName);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      // Step 1: Create auth user
      console.log('STEP 1: Creating auth user...');

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) {
        console.error('❌ Auth error:', authError.message);
        throw authError;
      }

      console.log('✅ Auth user created:', authData.user?.id);

      // Step 2: Wait 3 seconds for trigger
      console.log('STEP 2: Waiting 3 seconds for trigger...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 3: Check profile
      console.log('STEP 3: Checking if profile exists...');

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          display_name,
          bio,
          avatar_url,
          twitter_handle,
          telegram_handle,
          scan_count,
          last_scan_at,
          created_at,
          updated_at,
          course_tier,
          scanner_tier,
          chatbot_tier,
          course_tier_expires_at,
          scanner_tier_expires_at,
          chatbot_tier_expires_at
        `)
        .eq('id', authData.user.id)
        .maybeSingle();

      // 🔍 DEBUG LOGS
      console.log('═══ AUTH CONTEXT DEBUG (signUp) ═══');
      console.log('User ID:', authData.user?.id);
      console.log('Profile Data:', profile);
      console.log('Course Tier:', profile?.course_tier);
      console.log('Scanner Tier:', profile?.scanner_tier);
      console.log('Fetch Error:', profileError);
      console.log('══════════════════════════');

      if (profile) {
        console.log('✅ Profile found:', profile);
        setProfile(profile);
      } else {
        console.warn('⚠️ Profile not found, creating manually...');

        // Step 4: Create profile manually
        await createUserProfile(authData.user.id);
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ SIGNUP COMPLETE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return { success: true, data: authData };

    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ SIGNUP FAILED');
      console.error('Error:', error.message);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      throw error;
    }
  };

  // ===== SIGNIN =====
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  };

  // ===== SIGNOUT =====
  const signOut = async () => {
    try {
      console.log('🚪 SIGNING OUT...');

      // Clear local state first
      setUser(null);
      setProfile(null);
      window.currentUserProfile = null;

      // Call Supabase signout
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Supabase signout error:', error);
        throw error;
      }

      console.log('✅ Signed out successfully');

      // Force redirect to home
      window.location.href = '/';

    } catch (error) {
      console.error('💥 Sign out error:', error);
      // Force reload anyway
      window.location.href = '/';
    }
  };

  // ===== HELPER FUNCTIONS =====

  // Check if admin
  const isAdmin = () => {
    return profile && profile.role === 'admin';
  };

  // Check if teacher
  const isTeacher = () => {
    return profile && profile.role === 'teacher';
  };

  // Check if manager (quản lý)
  const isManager = () => {
    return profile && profile.role === 'manager';
  };

  // Check if user has access to course admin page
  // Admin, Teacher, Manager can access
  const hasCourseAdminAccess = () => {
    if (!profile) return false;
    return ['admin', 'teacher', 'manager'].includes(profile.role);
  };

  // Check if user can edit a specific course
  // Admin: can edit all
  // Teacher: can edit only their own courses
  // Manager: can only view (read-only)
  const canEditCourse = (courseCreatorId) => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    if (profile.role === 'teacher' && courseCreatorId === profile.id) return true;
    return false; // manager and user cannot edit
  };

  // Check if user can create courses
  // Only admin and teacher can create courses
  const canCreateCourse = () => {
    if (!profile) return false;
    return ['admin', 'teacher'].includes(profile.role);
  };

  // Check if user can delete courses
  // Admin: can delete all
  // Teacher: can delete only their own courses
  const canDeleteCourse = (courseCreatorId) => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    if (profile.role === 'teacher' && courseCreatorId === profile.id) return true;
    return false;
  };

  // Legacy: Check if premium (DEPRECATED - use specific checkers)
  const isPremium = () => {
    return profile && profile.tier !== 'free';
  };

  // Check if premium expired
  const isPremiumExpired = () => {
    if (!profile || profile.tier === 'free') return false;
    if (!profile.tier_expires_at) return false;
    return new Date(profile.tier_expires_at) < new Date();
  };

  // ===== MULTI-TIER CHECKERS =====
  
  // Check if user has paid for course
  const hasCoursePaid = () => {
    return profile && profile.course_tier && profile.course_tier !== 'free';
  };

  // Check if user has paid for scanner
  const hasScannerPaid = () => {
    return profile && profile.scanner_tier && profile.scanner_tier !== 'free';
  };

  // Check if user has paid for chatbot
  const hasChatbotPaid = () => {
    return profile && profile.chatbot_tier && profile.chatbot_tier !== 'free';
  };

  // Get scanner tier level
  // Admin and Manager users always get tier3 (full access)
  const getScannerTier = () => {
    if (profile?.role === 'admin' || profile?.role === 'ADMIN') return 'tier3';
    if (profile?.role === 'manager' || profile?.role === 'MANAGER') return 'tier3';
    return profile?.scanner_tier || 'free';
  };

  // Get course tier level
  // Admin and Manager users always get tier3 (full access)
  const getCourseTier = () => {
    if (profile?.role === 'admin' || profile?.role === 'ADMIN') return 'tier3';
    if (profile?.role === 'manager' || profile?.role === 'MANAGER') return 'tier3';
    return profile?.course_tier || 'free';
  };

  // Get chatbot tier level
  // Admin and Manager users always get tier3 (full access)
  const getChatbotTier = () => {
    if (profile?.role === 'admin' || profile?.role === 'ADMIN') return 'tier3';
    if (profile?.role === 'manager' || profile?.role === 'MANAGER') return 'tier3';
    return profile?.chatbot_tier || 'free';
  };

  // Get max scan count based on scanner tier
  const getMaxScans = () => {
    const tier = getScannerTier();
    const maxScans = {
      'free': 5,
      'tier1': 20,
      'tier2': 50,
      'tier3': -1, // unlimited
    };
    return maxScans[tier] || 5;
  };

  // Check if user has unlimited scans
  const hasUnlimitedScans = () => {
    return getScannerTier() === 'tier3';
  };

  // ===== REFRESH PROFILE =====
  const refreshProfile = async () => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          display_name,
          bio,
          avatar_url,
          twitter_handle,
          telegram_handle,
          scan_count,
          last_scan_at,
          created_at,
          updated_at,
          course_tier,
          scanner_tier,
          chatbot_tier,
          course_tier_expires_at,
          scanner_tier_expires_at,
          chatbot_tier_expires_at
        `)
        .eq('id', user.id)
        .single();

      // 🔍 DEBUG LOGS
      console.log('═══ AUTH CONTEXT DEBUG (refreshProfile) ═══');
      console.log('User ID:', user?.id);
      console.log('Profile Data:', data);
      console.log('Course Tier:', data?.course_tier);
      console.log('Scanner Tier:', data?.scanner_tier);
      console.log('Fetch Error:', error);
      console.log('══════════════════════════');

      if (error) throw error;

      setProfile(data);
      console.log('✅ Profile refreshed successfully:', data);
      return { success: true, profile: data };
    } catch (error) {
      console.error('❌ Error refreshing profile:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
    isAdmin,
    isTeacher,
    isManager,
    hasCourseAdminAccess,
    canEditCourse,
    canCreateCourse,
    canDeleteCourse,
    isPremium, // DEPRECATED
    isPremiumExpired,
    refreshProfile,
    // Multi-tier checkers
    hasCoursePaid,
    hasScannerPaid,
    hasChatbotPaid,
    getScannerTier,
    getCourseTier,
    getChatbotTier,
    getMaxScans,
    hasUnlimitedScans,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
