import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { UserProfile, TierLevel } from '../types';

/** Auth context value interface */
interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; data?: { user: User | null; session: Session | null }; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; data?: { user: User | null; session: Session | null }; error?: string }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAdmin: () => boolean;
  isPremium: () => boolean;
  isPremiumExpired: () => boolean;
  refreshProfile: () => Promise<{ success: boolean; profile?: UserProfile; error?: string }>;
  hasCoursePaid: () => boolean;
  hasScannerPaid: () => boolean;
  hasChatbotPaid: () => boolean;
  getScannerTier: () => TierLevel;
  getCourseTier: () => TierLevel;
  getChatbotTier: () => TierLevel;
  getMaxScans: () => number;
  hasUnlimitedScans: () => boolean;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export const useAuth = (): AuthContextValue => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id).finally(() => {
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
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ===== LOAD USER PROFILE =====
  const loadUserProfile = async (userId: string): Promise<void> => {
    console.log('Loading profile for user:', userId);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
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
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        throw error;
      }

      if (data) {
        console.log('Profile loaded:', data);
        setProfile(data as UserProfile);
        setLoading(false);
        return;
      }

      console.warn('Profile not found, creating...');
      await createUserProfile(userId);

    } catch (err) {
      console.error('Load profile failed:', err);
      setLoading(false);
    }
  };

  // ===== CREATE USER PROFILE (FALLBACK) =====
  const createUserProfile = async (userId: string): Promise<void> => {
    console.log('Creating profile for user:', userId);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error('No authenticated user');
      }

      const newProfile: Partial<UserProfile> = {
        id: userId,
        email: authUser.email ?? '',
        full_name: authUser.user_metadata?.full_name as string ?? null,
        course_tier: 'free',
        scanner_tier: 'free',
        chatbot_tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('users')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error('Failed to create profile:', error);
        throw error;
      }

      console.log('Profile created:', data);
      setProfile(data as UserProfile);

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
        console.log('Quota record created');
      } catch (quotaErr) {
        console.warn('Could not create quota record:', quotaErr);
      }

      setLoading(false);

    } catch (err) {
      console.error('Create profile failed:', err);
      setLoading(false);
    }
  };

  // ===== SIGNUP =====
  const signUp = async (
    email: string,
    password: string,
    fullName: string = ''
  ): Promise<{ success: boolean; data?: { user: User | null; session: Session | null }; error?: string }> => {
    try {
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
        console.error('Auth error:', authError.message);
        throw authError;
      }

      // Wait for trigger
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check profile
      const { data: profileData } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
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
        .eq('id', authData.user?.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as UserProfile);
      } else if (authData.user) {
        await createUserProfile(authData.user.id);
      }

      return { success: true, data: authData };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      console.error('Signup failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ===== SIGNIN =====
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; data?: { user: User | null; session: Session | null }; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      console.error('Sign in error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ===== SIGNOUT =====
  const signOut = async (): Promise<void> => {
    try {
      console.log('Signing out...');
      setUser(null);
      setProfile(null);

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signout error:', error);
        throw error;
      }

      console.log('Signed out successfully');
      window.location.href = '/';

    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/';
    }
  };

  // ===== HELPER FUNCTIONS =====

  const isAdmin = (): boolean => {
    return profile?.role === 'admin';
  };

  const isPremium = (): boolean => {
    return !!profile && profile.tier !== 'free' && profile.tier !== 'FREE';
  };

  const isPremiumExpired = (): boolean => {
    if (!profile || profile.tier === 'free' || profile.tier === 'FREE') return false;
    if (!profile.tier_expires_at) return false;
    return new Date(profile.tier_expires_at) < new Date();
  };

  // ===== MULTI-TIER CHECKERS =====

  const hasCoursePaid = (): boolean => {
    return !!profile?.course_tier && profile.course_tier !== 'free' && profile.course_tier !== 'FREE';
  };

  const hasScannerPaid = (): boolean => {
    return !!profile?.scanner_tier && profile.scanner_tier !== 'free' && profile.scanner_tier !== 'FREE';
  };

  const hasChatbotPaid = (): boolean => {
    return !!profile?.chatbot_tier && profile.chatbot_tier !== 'free' && profile.chatbot_tier !== 'FREE';
  };

  const getScannerTier = (): TierLevel => {
    return profile?.scanner_tier ?? 'free';
  };

  const getCourseTier = (): TierLevel => {
    return profile?.course_tier ?? 'free';
  };

  const getChatbotTier = (): TierLevel => {
    return profile?.chatbot_tier ?? 'free';
  };

  const getMaxScans = (): number => {
    const tier = getScannerTier();
    const maxScans: Record<string, number> = {
      'free': 5,
      'FREE': 5,
      'tier1': 20,
      'TIER1': 20,
      'tier2': 50,
      'TIER2': 50,
      'tier3': -1,
      'TIER3': -1,
    };
    return maxScans[tier] ?? 5;
  };

  const hasUnlimitedScans = (): boolean => {
    const tier = getScannerTier();
    return tier === 'tier3' || tier === 'TIER3';
  };

  // ===== REFRESH PROFILE =====
  const refreshProfile = async (): Promise<{ success: boolean; profile?: UserProfile; error?: string }> => {
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

      if (error) throw error;

      setProfile(data as UserProfile);
      console.log('Profile refreshed successfully:', data);
      return { success: true, profile: data as UserProfile };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh profile';
      console.error('Error refreshing profile:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value: AuthContextValue = {
    user,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
    isAdmin,
    isPremium,
    isPremiumExpired,
    refreshProfile,
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
      {!loading && children}
    </AuthContext.Provider>
  );
};
