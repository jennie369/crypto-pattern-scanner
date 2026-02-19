/**
 * Supabase Connection Test Utility
 * Use this to verify Supabase is properly configured
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');

  // Step 1: Check configuration
  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase not configured! Check .env.local file');
    return { success: false, error: 'Missing credentials' };
  }
  console.log('✅ Environment variables loaded');

  try {
    // Step 2: Test database connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Database connection successful');

    // Step 3: Check auth
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.warn('⚠️ Auth check failed:', authError.message);
    } else {
      console.log('✅ Auth system ready');
      if (session) {
        console.log('👤 User logged in:', session.user.email);
      } else {
        console.log('👤 No user logged in (this is normal)');
      }
    }

    return {
      success: true,
      message: 'Supabase connected successfully!',
      hasSession: !!session
    };

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Test user signup
 */
export async function testSignUp(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    console.log('✅ Sign up successful:', data.user?.email);
    return { success: true, user: data.user };
  } catch (err) {
    console.error('❌ Sign up failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Test user signin
 */
export async function testSignIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    console.log('✅ Sign in successful:', data.user?.email);
    return { success: true, user: data.user };
  } catch (err) {
    console.error('❌ Sign in failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Test quota check
 */
export async function testQuotaCheck(userId) {
  try {
    const { data, error } = await supabase
      .rpc('get_quota_status', { p_user_id: userId });

    if (error) throw error;

    console.log('✅ Quota check successful:', data);
    return { success: true, quota: data };
  } catch (err) {
    console.error('❌ Quota check failed:', err.message);
    return { success: false, error: err.message };
  }
}
