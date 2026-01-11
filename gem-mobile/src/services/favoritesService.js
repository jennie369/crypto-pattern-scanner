/**
 * GEM Mobile - Favorites Service
 * CLOUD SYNC: All favorites synced to Supabase for cross-device consistency
 * Updated: 2024-12-25
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const FAVORITES_KEY = 'scanner_favorite_coins';
const RECENT_KEY = 'scanner_recent_coins';
const LAST_SYNC_KEY = 'scanner_favorites_last_sync';
const MAX_RECENT = 10;

class FavoritesService {
  constructor() {
    this.currentUserId = null;
    this.favorites = [];
    this.recent = [];
    this.initialized = false;
  }

  // ═══════════════════════════════════════════════════════════
  // INITIALIZATION - CLOUD FIRST
  // ═══════════════════════════════════════════════════════════

  async init(userId = null) {
    if (this.initialized && this.currentUserId === userId) return;

    this.currentUserId = userId;

    try {
      // Try cloud first if user is logged in
      if (userId) {
        await this.loadFromSupabase(userId);
      } else {
        await this.loadFromLocalStorage();
      }

      this.initialized = true;
    } catch (error) {
      console.error('[Favorites] Init error:', error);
      await this.loadFromLocalStorage();
      this.initialized = true;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // CLOUD SYNC METHODS
  // ═══════════════════════════════════════════════════════════

  async loadFromSupabase(userId) {
    try {
      // Load favorites
      const { data: favData, error: favError } = await supabase
        .from('user_favorites')
        .select('symbol')
        .eq('user_id', userId);

      if (favError) throw favError;
      this.favorites = (favData || []).map(f => f.symbol);

      // Load recent patterns
      const { data: recentData, error: recentError } = await supabase
        .from('user_recent_patterns')
        .select('symbol')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(MAX_RECENT);

      if (recentError) throw recentError;
      this.recent = (recentData || []).map(r => r.symbol);

      // Cache locally
      await this.saveToLocalStorage();

      console.log('[Favorites] Loaded from cloud:', {
        favorites: this.favorites.length,
        recent: this.recent.length,
      });
    } catch (error) {
      console.error('[Favorites] Cloud load error:', error);
      // Fallback to local
      await this.loadFromLocalStorage();
    }
  }

  async loadFromLocalStorage() {
    try {
      const [favData, recentData] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_KEY),
        AsyncStorage.getItem(RECENT_KEY),
      ]);

      this.favorites = favData ? JSON.parse(favData) : [];
      this.recent = recentData ? JSON.parse(recentData) : [];
    } catch (error) {
      console.error('[Favorites] Local load error:', error);
      this.favorites = [];
      this.recent = [];
    }
  }

  async saveToLocalStorage() {
    try {
      await Promise.all([
        AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(this.favorites)),
        AsyncStorage.setItem(RECENT_KEY, JSON.stringify(this.recent)),
        AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString()),
      ]);
    } catch (error) {
      console.error('[Favorites] Local save error:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // FAVORITES CRUD
  // ═══════════════════════════════════════════════════════════

  async getFavorites(userId = null) {
    await this.init(userId || this.currentUserId);
    return [...this.favorites];
  }

  async addFavorite(symbol, userId = null) {
    const uid = userId || this.currentUserId;
    await this.init(uid);

    try {
      if (!this.favorites.includes(symbol)) {
        this.favorites.push(symbol);

        // Sync to cloud
        if (uid) {
          await supabase
            .from('user_favorites')
            .upsert({
              user_id: uid,
              symbol: symbol,
              added_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id,symbol,pattern_type,timeframe',
            });
        }

        await this.saveToLocalStorage();
      }
      return [...this.favorites];
    } catch (error) {
      console.error('[Favorites] Add error:', error);
      return [...this.favorites];
    }
  }

  async removeFavorite(symbol, userId = null) {
    const uid = userId || this.currentUserId;
    await this.init(uid);

    try {
      this.favorites = this.favorites.filter(s => s !== symbol);

      // Sync to cloud
      if (uid) {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', uid)
          .eq('symbol', symbol);
      }

      await this.saveToLocalStorage();
      return [...this.favorites];
    } catch (error) {
      console.error('[Favorites] Remove error:', error);
      return [...this.favorites];
    }
  }

  async toggleFavorite(symbol, userId = null) {
    await this.init(userId || this.currentUserId);

    if (this.favorites.includes(symbol)) {
      return this.removeFavorite(symbol, userId);
    } else {
      return this.addFavorite(symbol, userId);
    }
  }

  async isFavorite(symbol, userId = null) {
    await this.init(userId || this.currentUserId);
    return this.favorites.includes(symbol);
  }

  // ═══════════════════════════════════════════════════════════
  // RECENT PATTERNS
  // ═══════════════════════════════════════════════════════════

  async getRecent(userId = null) {
    await this.init(userId || this.currentUserId);
    return [...this.recent];
  }

  async addRecent(symbol, patternType = null, timeframe = null, userId = null) {
    const uid = userId || this.currentUserId;
    await this.init(uid);

    try {
      // Remove if exists, add to front
      this.recent = this.recent.filter(s => s !== symbol);
      this.recent.unshift(symbol);
      this.recent = this.recent.slice(0, MAX_RECENT);

      // Sync to cloud
      if (uid) {
        await supabase
          .from('user_recent_patterns')
          .upsert({
            user_id: uid,
            symbol: symbol,
            pattern_type: patternType,
            timeframe: timeframe,
            viewed_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,symbol,pattern_type,timeframe',
          });
      }

      await this.saveToLocalStorage();
      return [...this.recent];
    } catch (error) {
      console.error('[Favorites] Add recent error:', error);
      return [...this.recent];
    }
  }

  // ═══════════════════════════════════════════════════════════
  // FORCE REFRESH
  // ═══════════════════════════════════════════════════════════

  async forceRefresh(userId) {
    this.initialized = false;
    await this.init(userId);
    return {
      favorites: [...this.favorites],
      recent: [...this.recent],
    };
  }

  // ═══════════════════════════════════════════════════════════
  // CLEAR (on logout)
  // ═══════════════════════════════════════════════════════════

  async clear() {
    this.favorites = [];
    this.recent = [];
    this.currentUserId = null;
    this.initialized = false;
    await AsyncStorage.multiRemove([FAVORITES_KEY, RECENT_KEY, LAST_SYNC_KEY]);
  }
}

export const favoritesService = new FavoritesService();
export default favoritesService;
