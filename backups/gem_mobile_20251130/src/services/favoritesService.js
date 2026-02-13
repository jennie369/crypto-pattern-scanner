/**
 * GEM Mobile - Favorites Service
 * Manage favorite coins and recent scanned coins
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'scanner_favorite_coins';
const RECENT_KEY = 'scanner_recent_coins';
const MAX_RECENT = 10;

class FavoritesService {
  /**
   * Get favorite coins
   */
  async getFavorites() {
    try {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Favorites] Get error:', error);
      return [];
    }
  }

  /**
   * Add coin to favorites
   */
  async addFavorite(symbol) {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(symbol)) {
        favorites.push(symbol);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
      return favorites;
    } catch (error) {
      console.error('[Favorites] Add error:', error);
      return [];
    }
  }

  /**
   * Remove coin from favorites
   */
  async removeFavorite(symbol) {
    try {
      let favorites = await this.getFavorites();
      favorites = favorites.filter(s => s !== symbol);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return favorites;
    } catch (error) {
      console.error('[Favorites] Remove error:', error);
      return [];
    }
  }

  /**
   * Toggle favorite
   */
  async toggleFavorite(symbol) {
    const favorites = await this.getFavorites();
    if (favorites.includes(symbol)) {
      return this.removeFavorite(symbol);
    } else {
      return this.addFavorite(symbol);
    }
  }

  /**
   * Check if coin is favorite
   */
  async isFavorite(symbol) {
    const favorites = await this.getFavorites();
    return favorites.includes(symbol);
  }

  /**
   * Get recent scanned coins
   */
  async getRecent() {
    try {
      const data = await AsyncStorage.getItem(RECENT_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Add to recent
   */
  async addRecent(symbol) {
    try {
      let recent = await this.getRecent();
      recent = recent.filter(s => s !== symbol);
      recent.unshift(symbol);
      recent = recent.slice(0, MAX_RECENT);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(recent));
      return recent;
    } catch (error) {
      return [];
    }
  }
}

export const favoritesService = new FavoritesService();
export default favoritesService;
