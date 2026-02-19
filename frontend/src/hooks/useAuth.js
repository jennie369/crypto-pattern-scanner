/**
 * Authentication Hook
 * Manages user authentication state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, getCurrentUser, getUserProfile } from '../lib/supabaseClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial user session
  useEffect(() => {
    loadUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth event:', event);

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

  const loadUser = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        await loadUserProfile(currentUser.id);
      }
    } catch (err) {
      console.error('Error loading user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      const userProfile = await getUserProfile(userId);
      setProfile(userProfile);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  /**
   * Sign up new user
   */
  const signUp = useCallback(async (email, password, fullName) => {
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
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          tier: 'free',
        });

        if (profileError) throw profileError;

        // Create daily quota record (upsert to prevent duplicates)
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
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign in existing user
   */
  const signIn = useCallback(async (email, password) => {
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
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send password reset email
   */
  const resetPassword = useCallback(async (email) => {
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
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if user has premium tier
   */
  const isPremium = useCallback(() => {
    if (!profile) return false;
    return profile.tier !== 'free';
  }, [profile]);

  /**
   * Check if premium is expired
   */
  const isPremiumExpired = useCallback(() => {
    if (!profile || profile.tier === 'free') return false;
    if (!profile.tier_expires_at) return false;

    return new Date(profile.tier_expires_at) < new Date();
  }, [profile]);

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
    reloadProfile: () => loadUserProfile(user?.id),
  };
}
