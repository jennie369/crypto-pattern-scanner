import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getUserIP } from '../utils/ipUtils';

/**
 * Hook for IP-based quota management (for anonymous Bitcoin scans)
 * Provides 5 free scans per day based on IP address
 */
export function useIpQuota() {
  const [ipQuota, setIpQuota] = useState({
    loading: true,
    canScan: true,
    remaining: 5,
    maxScans: 5,
    resetAt: null
  });

  /**
   * Load IP quota summary
   */
  const loadIpQuotaSummary = async () => {
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

      setIpQuota({
        loading: false,
        canScan: data.can_scan,
        remaining: data.remaining,
        maxScans: 5,
        resetAt: data.reset_at || null
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
   * @returns {Promise<{success: boolean, remaining: number, needsSignup?: boolean, error?: string}>}
   */
  const useIPQuotaSlot = async () => {
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

      if (!checkData.can_scan) {
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
          remaining: checkData.remaining,
          error: 'Lỗi khi sử dụng quota'
        };
      }

      // Refresh quota
      await loadIpQuotaSummary();

      return {
        success: true,
        remaining: incrementData.remaining
      };
    } catch (error) {
      console.error('Error in useIPQuotaSlot:', error);
      return {
        success: false,
        remaining: 0,
        error: error.message
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
