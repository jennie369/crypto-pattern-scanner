/**
 * useLinkPreview Hooks
 * React hooks để dùng link preview trong components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchLinkPreview,
  getCachedPreview,
  clearUrlCache,
} from '../services/linkPreviewService';
import {
  detectPrimaryUrl,
  detectUrls,
  isValidUrl,
  normalizeUrl,
} from '../utils/urlDetector';
import { PREVIEW_STATUS, LIMITS } from '../constants/linkPreview';

/**
 * Hook để fetch và manage link preview
 * @param {string} url - URL cần fetch preview
 * @param {Object} options - Options
 * @param {boolean} options.enabled - Enable/disable fetch
 * @param {boolean} options.autoFetch - Tự động fetch khi url thay đổi
 * @returns {Object} { preview, loading, error, refetch, clear }
 */
export function useLinkPreview(url, options = {}) {
  const {
    enabled = true,
    autoFetch = true,
  } = options;

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ref để track mounted state
  const isMounted = useRef(true);
  const abortController = useRef(null);

  // Normalize URL
  const normalizedUrl = url ? normalizeUrl(url) : null;

  /**
   * Fetch preview data
   */
  const fetch = useCallback(async (forceRefresh = false) => {
    if (!normalizedUrl || !isValidUrl(normalizedUrl)) {
      setPreview(null);
      setError(null);
      return;
    }

    // Check cache trước
    if (!forceRefresh) {
      const cached = getCachedPreview(normalizedUrl);
      if (cached) {
        setPreview(cached);
        setLoading(false);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchLinkPreview(normalizedUrl, { forceRefresh });

      if (!isMounted.current) return;

      if (result.status === PREVIEW_STATUS.ERROR) {
        setError(result.error || 'Fetch failed');
        setPreview(null);
      } else {
        setPreview(result);
        setError(null);
      }
    } catch (err) {
      if (!isMounted.current) return;
      setError(err.message || 'Unknown error');
      setPreview(null);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [normalizedUrl]);

  /**
   * Refetch với force refresh
   */
  const refetch = useCallback(() => {
    return fetch(true);
  }, [fetch]);

  /**
   * Clear preview và cache
   */
  const clear = useCallback(async () => {
    if (normalizedUrl) {
      await clearUrlCache(normalizedUrl);
    }
    setPreview(null);
    setError(null);
  }, [normalizedUrl]);

  // Auto fetch khi url thay đổi
  useEffect(() => {
    if (enabled && autoFetch && normalizedUrl) {
      fetch();
    }
  }, [enabled, autoFetch, normalizedUrl, fetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return {
    preview,
    loading,
    error,
    fetch,
    refetch,
    clear,
    isValid: !!normalizedUrl && isValidUrl(normalizedUrl),
  };
}

/**
 * Hook để detect URLs trong text và fetch previews
 * @param {string} text - Text content
 * @param {Object} options - Options
 * @param {boolean} options.enabled - Enable/disable
 * @param {number} options.maxUrls - Maximum URLs to fetch
 * @param {boolean} options.multipleUrls - Detect all URLs (not just first)
 * @returns {Object} { urls, previews, loading, primaryUrl, primaryPreview, allPreviews }
 */
export function useTextLinkPreviews(text, options = {}) {
  const {
    enabled = true,
    maxUrls = LIMITS?.MAX_URLS_PER_POST || 3,
    multipleUrls = false,
  } = options;

  const [urls, setUrls] = useState([]);
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(false);

  // Debounce ref
  const debounceRef = useRef(null);

  // Detect URLs from text
  useEffect(() => {
    if (!enabled || !text) {
      setUrls([]);
      return;
    }

    // Debounce URL detection
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (multipleUrls) {
        // Detect all URLs
        const allUrls = detectUrls(text);
        setUrls(allUrls.slice(0, maxUrls));
      } else {
        // Detect only primary URL (for backwards compatibility)
        const primaryUrl = detectPrimaryUrl(text);
        if (primaryUrl) {
          setUrls([primaryUrl]);
        } else {
          setUrls([]);
        }
      }
    }, LIMITS?.DEBOUNCE_MS || 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [text, enabled, multipleUrls, maxUrls]);

  // Fetch previews cho detected URLs
  useEffect(() => {
    if (!enabled || urls.length === 0) {
      setPreviews({});
      return;
    }

    let isMounted = true;

    const fetchAll = async () => {
      setLoading(true);

      const results = {};
      for (const url of urls.slice(0, maxUrls)) {
        try {
          const result = await fetchLinkPreview(url);
          if (isMounted) {
            results[url] = result;
          }
        } catch (err) {
          if (isMounted) {
            results[url] = { status: PREVIEW_STATUS?.ERROR || 'error', error: err.message };
          }
        }
      }

      if (isMounted) {
        setPreviews(results);
        setLoading(false);
      }
    };

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, [urls, enabled, maxUrls]);

  // Primary URL and preview
  const primaryUrl = urls[0] || null;
  const primaryPreview = primaryUrl ? previews[primaryUrl] : null;

  // All previews as array (for multiple link rendering)
  const allPreviews = urls.map(url => ({
    url,
    preview: previews[url] || null,
    loading: loading && !previews[url],
  })).filter(item => item.preview || item.loading);

  return {
    urls,
    previews,
    loading,
    primaryUrl,
    primaryPreview,
    allPreviews,
    hasMultiple: urls.length > 1,
  };
}

/**
 * Hook để manage link preview trong form (CreatePost)
 * @param {string} initialUrl - URL ban đầu (nếu có)
 * @returns {Object} Form management functions
 */
export function useLinkPreviewForm(initialUrl = null) {
  const [url, setUrl] = useState(initialUrl);
  const [removed, setRemoved] = useState(false);

  const { preview, loading, error, refetch, clear } = useLinkPreview(url, {
    enabled: !removed && !!url,
  });

  /**
   * Update URL từ text input
   */
  const detectFromText = useCallback((text) => {
    if (removed) return;

    const detectedUrl = detectPrimaryUrl(text);
    if (detectedUrl !== url) {
      setUrl(detectedUrl);
    }
  }, [url, removed]);

  /**
   * Manually set URL
   */
  const setPreviewUrl = useCallback((newUrl) => {
    setUrl(newUrl);
    setRemoved(false);
  }, []);

  /**
   * Remove preview
   */
  const removePreview = useCallback(() => {
    setRemoved(true);
    setUrl(null);
    clear();
  }, [clear]);

  /**
   * Reset về trạng thái ban đầu
   */
  const reset = useCallback(() => {
    setUrl(initialUrl);
    setRemoved(false);
  }, [initialUrl]);

  /**
   * Get preview data cho submit
   */
  const getPreviewData = useCallback(() => {
    if (removed || !preview || preview.status === PREVIEW_STATUS.ERROR) {
      return null;
    }

    return {
      url: preview.url,
      domain: preview.domain,
      title: preview.title,
      description: preview.description,
      image_url: preview.image,
      favicon_url: preview.favicon,
      site_name: preview.siteName,
      og_type: preview.type,
      is_video: preview.isVideo,
    };
  }, [preview, removed]);

  return {
    url,
    preview,
    loading,
    error,
    removed,
    detectFromText,
    setPreviewUrl,
    removePreview,
    refetch,
    reset,
    getPreviewData,
    hasPreview: !removed && preview && preview.status !== PREVIEW_STATUS.ERROR,
  };
}

// ========== EXPORTS ==========

export default {
  useLinkPreview,
  useTextLinkPreviews,
  useLinkPreviewForm,
};
