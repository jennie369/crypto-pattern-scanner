/**
 * Gemral - Auth Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getCurrentUser, getUserProfile } from '../services/supabase';
import presenceService from '../services/presenceService';

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
        } else {
          setUser(null);
          setProfile(null);

          // Cleanup presence service on logout
          presenceService.cleanup();
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

  // ⚡ DEBUG: Log isAdmin result whenever profile changes
  useEffect(() => {
    if (profile) {
      console.log('[AuthContext] ⚡ isAdmin check:', isAdmin, {
        'role=admin': profile?.role === 'admin',
        'role=ADMIN': profile?.role === 'ADMIN',
        'is_admin=true': profile?.is_admin === true,
        'scanner_tier=ADMIN': profile?.scanner_tier === 'ADMIN',
        'chatbot_tier=ADMIN': profile?.chatbot_tier === 'ADMIN',
      });
    }
  }, [profile, isAdmin]);

  // Get highest tier (admin gets unlimited)
  const userTier = isAdmin ? 'ADMIN' : (profile?.scanner_tier || profile?.chatbot_tier || 'FREE');

  const value = {
    user,
    profile,
    loading,
    initialized,
    isAuthenticated: !!user,
    tier: profile?.scanner_tier || 'free',
    userTier, // Normalized tier
    isAdmin,  // ⚡ Admin flag for bypassing restrictions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
