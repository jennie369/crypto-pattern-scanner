/**
 * Quota Management Hook
 * Manages daily scan quota for FREE tier users
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export function useQuota() {
  const { user } = useAuth();
  const [quota, setQuota] = useState({
    remaining: 5,
    maxScans: 5,
    canScan: true,
    resetAt: null,
    loading: true,
    error: null
  });

  // Fetch current quota from database
  const fetchQuota = async () => {
    if (!user) {
      setQuota(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Get quota record for today
      const { data, error } = await supabase
        .from('daily_scan_quota')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching quota:', error);
        setQuota(prev => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      // Calculate reset time (midnight UTC+7)
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      // Convert to UTC+7
      const resetAt = new Date(tomorrow.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

      // Check if user has quota record
      if (!data) {
        console.log('ℹ️ No quota record found, using defaults (new user)');
        setQuota({
          remaining: 5,
          maxScans: 5,
          canScan: true,
          resetAt: resetAt,
          loading: false,
          error: null
        });
        return;
      }

      setQuota({
        remaining: data.max_scans - data.scan_count,
        maxScans: data.max_scans,
        canScan: data.scan_count < data.max_scans,
        resetAt: resetAt,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      setQuota(prev => ({ ...prev, loading: false, error: error.message }));
    }
  };

  // Use a quota slot (call before scanning)
  const useQuotaSlot = async () => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Call database function to check and increment
      const { data, error } = await supabase.rpc('check_and_increment_quota', {
        p_user_id: user.id
      });

      if (error) {
        console.error('RPC error:', error);
        return { success: false, error: error.message };
      }

      // Check if scan is allowed
      if (!data.can_scan) {
        return {
          success: false,
          error: 'Đã hết lượt scan hôm nay! Vui lòng nâng cấp hoặc chờ reset.',
          remaining: 0
        };
      }

      // Update local state
      setQuota({
        remaining: data.remaining,
        maxScans: data.max_scans,
        canScan: data.remaining > 0,
        resetAt: new Date(data.reset_at),
        loading: false,
        error: null
      });

      return {
        success: true,
        remaining: data.remaining
      };
    } catch (error) {
      console.error('Error using quota:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Fetch quota on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchQuota();

      // Refresh quota every 1 minute
      const interval = setInterval(fetchQuota, 60000);

      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    quota,
    useQuotaSlot,
    refreshQuota: fetchQuota
  };
}
