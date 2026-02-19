/**
 * Link Preview Service
 * Extracts URLs from text and fetches rich previews via edge function
 * Caches results in memory to avoid duplicate fetches
 */

import { supabase } from '../lib/supabaseClient';

/** URL regex — matches http(s) URLs */
const URL_REGEX = /https?:\/\/[^\s<>)"']+/gi;

/** Cache TTL: 10 minutes */
const CACHE_TTL = 10 * 60 * 1000;

class LinkPreviewService {
  constructor() {
    /** @type {Map<string, { data: Object, ts: number }>} */
    this.cache = new Map();
  }

  /**
   * Fetch a rich preview for a URL
   * Uses the fetch-link-preview edge function with in-memory cache
   * @param {string} url
   * @returns {{ title: string, description: string, image: string, domain: string, url: string } | null}
   */
  async fetchPreview(url) {
    try {
      // Check cache
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return cached.data;
      }

      const { data, error } = await supabase.functions.invoke('fetch-link-preview', {
        body: { url },
      });

      if (error) throw error;

      const preview = {
        title: data?.title || '',
        description: data?.description || '',
        image: data?.image || '',
        domain: data?.domain || this._extractDomain(url),
        url,
      };

      // Cache result
      this.cache.set(url, { data: preview, ts: Date.now() });
      return preview;
    } catch (error) {
      console.error('fetchPreview error:', error);
      return null;
    }
  }

  /**
   * Extract all URLs from a text string
   * @param {string} text
   * @returns {string[]}
   */
  extractUrls(text) {
    if (!text) return [];
    const matches = text.match(URL_REGEX);
    // Deduplicate
    return [...new Set(matches || [])];
  }

  /**
   * Extract domain from URL for display
   * @param {string} url
   * @returns {string}
   * @private
   */
  _extractDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  /**
   * Clear the in-memory cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export default new LinkPreviewService();
