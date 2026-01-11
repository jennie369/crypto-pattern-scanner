/**
 * useViewTracking Hook
 * Track post views with deduplication
 * Phase 4: View Count & Algorithm (30/12/2024)
 */

import { useEffect, useRef } from 'react';
import { viewService } from '../services/viewService';
import { useAuth } from '../contexts/AuthContext';

/**
 * useViewTracking - Track view on mount
 *
 * @param {string} postId - Post ID to track
 * @param {Object} options
 * @param {boolean} options.enabled - Enable tracking (default true)
 * @param {number} options.delay - Delay before tracking in ms (default 1000)
 */
export const useViewTracking = (postId, options = {}) => {
  const { user } = useAuth();
  const { enabled = true, delay = 1000 } = options;
  const trackedRef = useRef(false);
  const lastPostIdRef = useRef(null);

  useEffect(() => {
    // Reset when postId changes
    if (postId !== lastPostIdRef.current) {
      trackedRef.current = false;
      lastPostIdRef.current = postId;
    }

    if (!postId || !enabled || trackedRef.current) return;

    const timer = setTimeout(async () => {
      try {
        const result = await viewService.recordView(postId, user?.id);
        if (result) {
          console.log('[useViewTracking] View recorded for post:', postId);
        }
        trackedRef.current = true;
      } catch (error) {
        console.warn('[useViewTracking] Error:', error?.message);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [postId, user?.id, enabled, delay]);
};

export default useViewTracking;
