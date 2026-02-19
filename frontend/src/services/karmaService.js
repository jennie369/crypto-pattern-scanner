/**
 * Karma Service
 * Karma tracking, levels, leaderboard
 * Uses RPC functions: get_user_karma_full, get_karma_leaderboard
 */

import { supabase } from '../lib/supabaseClient';

class KarmaService {
  /**
   * Get full karma breakdown for a user
   * @param {string} userId
   * @returns {{ total_karma: number, level: number, level_name: string, breakdown: Object }}
   */
  async getUserKarma(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_karma_full', { p_user_id: userId });

      if (error) throw error;

      // RPC may return array with single item or object
      const karma = Array.isArray(data) ? data[0] : data;
      return karma || { total_karma: 0, level: 1, level_name: 'Newbie', breakdown: {} };
    } catch (error) {
      console.error('getUserKarma error:', error);
      return { total_karma: 0, level: 1, level_name: 'Newbie', breakdown: {} };
    }
  }

  /**
   * Get karma leaderboard — top users by total karma
   * @param {number} limit
   * @returns {Array<{ user_id, full_name, avatar_url, total_karma, level }>}
   */
  async getKarmaLeaderboard(limit = 10) {
    try {
      const { data, error } = await supabase
        .rpc('get_karma_leaderboard', { p_limit: limit });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('getKarmaLeaderboard error:', error);
      return [];
    }
  }

  /**
   * Get karma history events for a user
   * @param {string} userId
   * @param {number} limit
   * @returns {Array<{ id, action, points, source_type, source_id, created_at }>}
   */
  async getKarmaHistory(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('karma_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('getKarmaHistory error:', error);
      return [];
    }
  }
}

export default new KarmaService();
