/**
 * Hook for IP-based quota management (for anonymous Bitcoin scans)
 * Provides 5 free scans per day based on IP address
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getUserIP } from '../utils/ipUtils';

/** IP Quota state */
interface IpQuotaState {
  loading: boolean;
  canScan: boolean;
  remaining: number;
  maxScans: number;
  resetAt: Date | null;
}

/** RPC response for IP quota check */
interface IpQuotaCheckResponse {
  can_scan: boolean;
  remaining: number;
  reset_at: string | null;
}

/** RPC response for IP scan increment */
interface IpScanIncrementResponse {
  remaining: number;
}

/** IP quota slot result */
interface UseIPQuotaSlotResult {
  success: boolean;
  remaining: number;
  needsSignup?: boolean;
  error?: string;
}

/** IP quota hook return type */
interface UseIpQuotaReturn {
  ipQuota: IpQuotaState;
  useIPQuotaSlot: () => Promise<UseIPQuotaSlotResult>;
  refreshIPQuota: () => Promise<void>;
}

export function useIpQuota(): UseIpQuotaReturn {
  const [ipQuota, setIpQuota] = useState<IpQuotaState>({
    loading: true,
    canScan: true,
    remaining: 5,
    maxScans: 5,
    resetAt: null
  });

  /**
   * Load IP quota summary
   */
  const loadIpQuotaSummary = async (): Promise<void> => {
    setIpQuota(prev => ({ ...prev, loading: true }));
    try {
      const ip = await getUserIP();

      const { data, error } = await supabase.rpc('check_ip_quota', {
        ip_addr: ip
      });

      if (error) {
        console.error('Error checking IP quota:', error);
        setIpQuota({
          loading: false,
          canScan: false,
          remaining: 0,
          maxScans: 5,
          resetAt: null
        });
        return;
      }

      const rpcResponse = data as IpQuotaCheckResponse;

      setIpQuota({
        loading: false,
        canScan: rpcResponse.can_scan,
        remaining: rpcResponse.remaining,
        maxScans: 5,
        resetAt: rpcResponse.reset_at ? new Date(rpcResponse.reset_at) : null
      });
    } catch (error) {
      console.error('Error loading IP quota summary:', error);
      setIpQuota({
        loading: false,
        canScan: false,
        remaining: 0,
        maxScans: 5,
        resetAt: null
      });
    }
  };

  /**
   * Use an IP quota slot (check + increment)
   */
  const useIPQuotaSlot = async (): Promise<UseIPQuotaSlotResult> => {
    try {
      const ip = await getUserIP();

      // Check if can scan
      const { data: checkData, error: checkError } = await supabase.rpc('check_ip_quota', {
        ip_addr: ip
      });

      if (checkError) {
        console.error('Error checking IP quota:', checkError);
        return {
          success: false,
          remaining: 0,
          error: 'Lỗi kiểm tra quota'
        };
      }

      const checkResponse = checkData as IpQuotaCheckResponse;

      if (!checkResponse.can_scan) {
        return {
          success: false,
          remaining: 0,
          needsSignup: true,
          error: 'Đã hết lượt scan BTC miễn phí. Đăng ký để có thêm 5 lượt!'
        };
      }

      // Increment scan count
      const { data: incrementData, error: incrementError } = await supabase.rpc('increment_ip_scan', {
        ip_addr: ip
      });

      if (incrementError) {
        console.error('Error incrementing IP scan:', incrementError);
        return {
          success: false,
          remaining: checkResponse.remaining,
          error: 'Lỗi khi sử dụng quota'
        };
      }

      const incrementResponse = incrementData as IpScanIncrementResponse;

      // Refresh quota
      await loadIpQuotaSummary();

      return {
        success: true,
        remaining: incrementResponse.remaining
      };
    } catch (error) {
      console.error('Error in useIPQuotaSlot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        remaining: 0,
        error: errorMessage
      };
    }
  };

  // Load quota summary on mount
  useEffect(() => {
    loadIpQuotaSummary();
  }, []);

  return {
    ipQuota,
    useIPQuotaSlot,
    refreshIPQuota: loadIpQuotaSummary
  };
}
