/**
 * Quota Management Hook
 * Manages daily scan quota for FREE tier users
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

/** Quota state */
interface QuotaState {
  remaining: number;
  maxScans: number;
  canScan: boolean;
  resetAt: Date | null;
  loading: boolean;
  error: string | null;
}

/** RPC response for quota check */
interface QuotaCheckResponse {
  can_scan: boolean;
  remaining: number;
  max_scans: number;
  reset_at: string;
}

/** Quota slot result */
interface UseQuotaSlotResult {
  success: boolean;
  error?: string;
  remaining?: number;
}

/** Quota hook return type */
interface UseQuotaReturn {
  quota: QuotaState;
  useQuotaSlot: () => Promise<UseQuotaSlotResult>;
  refreshQuota: () => Promise<void>;
}

export function useQuota(): UseQuotaReturn {
  const { user } = useAuth();
  const [quota, setQuota] = useState<QuotaState>({
    remaining: 5,
    maxScans: 5,
    canScan: true,
    resetAt: null,
    loading: true,
    error: null
  });

  // Fetch current quota from database
  const fetchQuota = async (): Promise<void> => {
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
        console.log('No quota record found, using defaults (new user)');
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

      interface QuotaRecord {
        max_scans: number;
        scan_count: number;
      }

      const quotaData = data as QuotaRecord;

      setQuota({
        remaining: quotaData.max_scans - quotaData.scan_count,
        maxScans: quotaData.max_scans,
        canScan: quotaData.scan_count < quotaData.max_scans,
        resetAt: resetAt,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setQuota(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  };

  // Use a quota slot (call before scanning)
  const useQuotaSlot = async (): Promise<UseQuotaSlotResult> => {
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

      const rpcResponse = data as QuotaCheckResponse;

      // Check if scan is allowed
      if (!rpcResponse.can_scan) {
        return {
          success: false,
          error: 'Đã hết lượt scan hôm nay! Vui lòng nâng cấp hoặc chờ reset.',
          remaining: 0
        };
      }

      // Update local state
      setQuota({
        remaining: rpcResponse.remaining,
        maxScans: rpcResponse.max_scans,
        canScan: rpcResponse.remaining > 0,
        resetAt: new Date(rpcResponse.reset_at),
        loading: false,
        error: null
      });

      return {
        success: true,
        remaining: rpcResponse.remaining
      };
    } catch (error) {
      console.error('Error using quota:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage
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
