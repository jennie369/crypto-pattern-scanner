/**
 * Authentication Hook
 * Manages user authentication state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, getCurrentUser, getUserProfile } from '../lib/supabaseClient';
import type { AuthUser, UserProfile, AuthResult } from '../types';
import type { AuthError, User, Session } from '@supabase/supabase-js';

/** Auth hook state */
interface UseAuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

/** Sign up result */
interface SignUpResult {
  data: { user: User | null; session: Session | null } | null;
  error: AuthError | Error | null;
}

/** Sign in result */
interface SignInResult {
  data: { user: User | null; session: Session | null } | null;
  error: AuthError | Error | null;
}

/** Password reset result */
interface ResetPasswordResult {
  error: AuthError | Error | null;
}

/** Auth hook return type */
interface UseAuthReturn extends UseAuthState {
  signUp: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<ResetPasswordResult>;
  isPremium: () => boolean;
  isPremiumExpired: () => boolean;
  reloadProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfile = async (userId: string): Promise<void> => {
    try {
      const userProfile = await getUserProfile(userId);
      setProfile(userProfile);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const loadUser = async (): Promise<void> => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        await loadUserProfile(currentUser.id);
      }
    } catch (err) {
      console.error('Error loading user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load initial user session
  useEffect(() => {
    loadUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        console.log('Auth event:', _event);

        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  /**
   * Sign up new user
   */
  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName: string
  ): Promise<SignUpResult> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          tier: 'free',
        });

        if (profileError) throw profileError;

        // Create daily quota record
        const { error: quotaError } = await supabase.from('daily_scan_quota').upsert({
          user_id: data.user.id,
          scan_count: 0,
          max_scans: 5,
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

        if (quotaError) throw quotaError;
      }

      return { data, error: null };
    } catch (err) {
      console.error('Sign up error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      return { data: null, error: err as AuthError | Error };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign in existing user
   */
  const signIn = useCallback(async (
    email: string,
    password: string
  ): Promise<SignInResult> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      return { data, error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      return { data: null, error: err as AuthError | Error };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out current user
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send password reset email
   */
  const resetPassword = useCallback(async (email: string): Promise<ResetPasswordResult> => {
    try {
      setLoading(true);
      setError(null);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      return { error: null };
    } catch (err) {
      console.error('Password reset error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      return { error: err as AuthError | Error };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if user has premium tier
   */
  const isPremium = useCallback((): boolean => {
    if (!profile) return false;
    return profile.tier !== 'free' && profile.tier !== 'FREE';
  }, [profile]);

  /**
   * Check if premium is expired
   */
  const isPremiumExpired = useCallback((): boolean => {
    if (!profile || profile.tier === 'free' || profile.tier === 'FREE') return false;
    if (!profile.tier_expires_at) return false;

    return new Date(profile.tier_expires_at) < new Date();
  }, [profile]);

  const reloadProfile = useCallback(async (): Promise<void> => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  }, [user]);

  return {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isPremium,
    isPremiumExpired,
    reloadProfile,
  };
}
