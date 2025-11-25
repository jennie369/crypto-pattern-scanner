/**
 * GEM Platform - Auth Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getCurrentUser, getUserProfile } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load initial session
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { user } = await getCurrentUser();
        if (user) {
          setUser(user);
          const { data: profileData } = await getUserProfile(user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    loadSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const { data: profileData } = await getUserProfile(session.user.id);
          setProfile(profileData);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    initialized,
    isAuthenticated: !!user,
    tier: profile?.scanner_tier || 'free',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
