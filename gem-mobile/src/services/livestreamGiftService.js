/**
 * Livestream Gift Service
 * Phase 3: Multi-Platform Integration
 *
 * Extended gift system for livestream commerce:
 * - Unified gift format across platforms (TikTok, Facebook, Gemral)
 * - Virtual gift purchase with GEM currency
 * - Gift value conversion (Diamonds → VND → GEM)
 * - Gift animations and effects
 * - Gift leaderboard and statistics
 * - Streamer revenue tracking
 */

import { supabase } from './supabase';

// Platform gift currencies
export const GIFT_CURRENCIES = {
  TIKTOK: { name: 'Diamond', symbol: 'D', vndRate: 2000 }, // 1 Diamond ≈ 2000 VND
  FACEBOOK: { name: 'Star', symbol: '★', vndRate: 500 }, // 1 Star ≈ 500 VND
  GEMRAL: { name: 'GEM', symbol: 'G', vndRate: 1000 }, // 1 GEM = 1000 VND
};

// Predefined virtual gifts for Gemral
export const GEMRAL_GIFTS = [
  {
    id: 'rose',
    name: 'Hoa Hồng',
    icon: '🌹',
    gemCost: 1,
    category: 'basic',
    animation: 'float',
  },
  {
    id: 'heart',
    name: 'Trái Tim',
    icon: '❤️',
    gemCost: 5,
    category: 'basic',
    animation: 'pulse',
  },
  {
    id: 'crystal',
    name: 'Pha Lê',
    icon: '💎',
    gemCost: 10,
    category: 'premium',
    animation: 'sparkle',
  },
  {
    id: 'moon',
    name: 'Trăng Sao',
    icon: '🌙',
    gemCost: 20,
    category: 'premium',
    animation: 'glow',
  },
  {
    id: 'star',
    name: 'Ngôi Sao',
    icon: '⭐',
    gemCost: 50,
    category: 'luxury',
    animation: 'burst',
  },
  {
    id: 'rainbow',
    name: 'Cầu Vồng',
    icon: '🌈',
    gemCost: 100,
    category: 'luxury',
    animation: 'rainbow',
  },
  {
    id: 'dragon',
    name: 'Rồng Vàng',
    icon: '🐉',
    gemCost: 200,
    category: 'legendary',
    animation: 'explosion',
  },
  {
    id: 'phoenix',
    name: 'Phượng Hoàng',
    icon: '🔥',
    gemCost: 500,
    category: 'legendary',
    animation: 'fullscreen',
  },
];

// Gift categories with effects
export const GIFT_CATEGORIES = {
  basic: { minGem: 1, maxGem: 5, displayDuration: 2000 },
  premium: { minGem: 10, maxGem: 50, displayDuration: 3000, hasSound: true },
  luxury: { minGem: 50, maxGem: 100, displayDuration: 4000, hasSound: true, hasBanner: true },
  legendary: { minGem: 200, maxGem: 1000, displayDuration: 5000, hasSound: true, hasBanner: true, isFullscreen: true },
};

class LivestreamGiftService {
  constructor() {
    this.listeners = new Map();
    this.giftQueue = [];
    this.isProcessing = false;
  }

  /**
   * Convert platform gift to unified format
   * @param {Object} platformGift - Gift from TikTok/Facebook
   * @param {string} platform - Platform name
   */
  normalizeGift(platformGift, platform) {
    const currency = GIFT_CURRENCIES[platform.toUpperCase()] || GIFT_CURRENCIES.GEMRAL;
    let gemValue = 0;
    let vndValue = 0;

    switch (platform.toLowerCase()) {
      case 'tiktok':
        vndValue = (platformGift.diamondCount || 0) * currency.vndRate;
        gemValue = Math.floor(vndValue / GIFT_CURRENCIES.GEMRAL.vndRate);
        break;
      case 'facebook':
        vndValue = (platformGift.starCount || 0) * currency.vndRate;
        gemValue = Math.floor(vndValue / GIFT_CURRENCIES.GEMRAL.vndRate);
        break;
      case 'gemral':
        gemValue = platformGift.gemCost || 0;
        vndValue = gemValue * GIFT_CURRENCIES.GEMRAL.vndRate;
        break;
    }

    return {
      id: platformGift.id || `${platform}_${Date.now()}`,
      platform,
      giftId: platformGift.giftId || platformGift.id,
      giftName: platformGift.giftName || platformGift.name,
      giftIcon: platformGift.icon || platformGift.image,
      count: platformGift.count || platformGift.repeatCount || 1,
      sender: {
        id: platformGift.userId || platformGift.senderId,
        username: platformGift.username || platformGift.senderName,
        displayName: platformGift.displayName,
        avatar: platformGift.avatar,
      },
      value: {
        original: platformGift.diamondCount || platformGift.starCount || platformGift.gemCost,
        originalCurrency: currency.name,
        vnd: vndValue,
        gem: gemValue,
      },
      category: this._getCategory(gemValue),
      animation: platformGift.animation || 'float',
      timestamp: platformGift.timestamp || Date.now(),
    };
  }

  /**
   * Get gift category based on GEM value
   */
  _getCategory(gemValue) {
    if (gemValue >= 200) return 'legendary';
    if (gemValue >= 50) return 'luxury';
    if (gemValue >= 10) return 'premium';
    return 'basic';
  }

  /**
   * Send a virtual gift (Gemral platform)
   * @param {string} sessionId - Livestream session ID
   * @param {string} giftId - Gift ID from GEMRAL_GIFTS
   * @param {number} count - Number of gifts to send
   */
  async sendGift(sessionId, giftId, count = 1) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find gift
      const gift = GEMRAL_GIFTS.find(g => g.id === giftId);
      if (!gift) throw new Error('Gift not found');

      const totalCost = gift.gemCost * count;

      // Check user balance (call gem economy service)
      const { data: wallet, error: walletError } = await supabase
        .from('user_wallets')
        .select('gem_balance')
        .eq('user_id', user.id)
        .single();

      if (walletError) throw walletError;
      if ((wallet?.gem_balance || 0) < totalCost) {
        throw new Error('Insufficient GEM balance');
      }

      // Deduct from wallet
      const { error: deductError } = await supabase.rpc('deduct_gems', {
        p_user_id: user.id,
        p_amount: totalCost,
        p_reason: `Gift: ${gift.name} x${count}`,
      });

      if (deductError) throw deductError;

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single();

      // Save gift to database
      const { data: savedGift, error: saveError } = await supabase
        .from('livestream_gifts')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          platform: 'gemral',
          platform_user_id: user.id,
          platform_username: profile?.display_name || 'User',
          gift_id: gift.id,
          gift_name: gift.name,
          gift_count: count,
          gem_value: totalCost,
          value_vnd: totalCost * GIFT_CURRENCIES.GEMRAL.vndRate,
          metadata: {
            icon: gift.icon,
            animation: gift.animation,
            category: gift.category,
            avatar: profile?.avatar_url,
          },
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Create normalized gift object
      const normalizedGift = this.normalizeGift({
        id: savedGift.id,
        giftId: gift.id,
        giftName: gift.name,
        icon: gift.icon,
        gemCost: totalCost,
        count,
        userId: user.id,
        username: profile?.display_name,
        displayName: profile?.display_name,
        avatar: profile?.avatar_url,
        animation: gift.animation,
      }, 'gemral');

      // Emit gift event
      this._emit('gift', normalizedGift);

      // Add to animation queue
      this.queueGiftAnimation(normalizedGift);

      return { success: true, gift: normalizedGift };
    } catch (error) {
      console.error('[GiftService] Send gift error:', error);
      throw error;
    }
  }

  /**
   * Queue gift for animation display
   */
  queueGiftAnimation(gift) {
    this.giftQueue.push(gift);
    this._processQueue();
  }

  /**
   * Process gift animation queue
   */
  async _processQueue() {
    if (this.isProcessing || this.giftQueue.length === 0) return;

    this.isProcessing = true;

    while (this.giftQueue.length > 0) {
      const gift = this.giftQueue.shift();
      const category = GIFT_CATEGORIES[gift.category];
      const duration = category?.displayDuration || 2000;

      // Emit animation event
      this._emit('animation', {
        gift,
        duration,
        hasSound: category?.hasSound,
        hasBanner: category?.hasBanner,
        isFullscreen: category?.isFullscreen,
      });

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, duration));
    }

    this.isProcessing = false;
  }

  /**
   * Get gift leaderboard for session
   * @param {string} sessionId - Session ID
   * @param {number} limit - Max results
   */
  async getLeaderboard(sessionId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('livestream_gifts')
        .select(`
          platform_user_id,
          platform_username,
          metadata
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Aggregate by user
      const userTotals = {};
      data.forEach(gift => {
        const key = `${gift.platform}_${gift.platform_user_id}`;
        if (!userTotals[key]) {
          userTotals[key] = {
            userId: gift.platform_user_id,
            username: gift.platform_username,
            avatar: gift.metadata?.avatar,
            totalGem: 0,
            giftCount: 0,
          };
        }
        userTotals[key].totalGem += gift.gem_value || 0;
        userTotals[key].giftCount += gift.gift_count || 1;
      });

      // Sort by total GEM and return top N
      return Object.values(userTotals)
        .sort((a, b) => b.totalGem - a.totalGem)
        .slice(0, limit)
        .map((user, index) => ({
          rank: index + 1,
          ...user,
        }));
    } catch (error) {
      console.error('[GiftService] Get leaderboard error:', error);
      return [];
    }
  }

  /**
   * Get session gift statistics
   */
  async getSessionStats(sessionId) {
    try {
      const { data, error } = await supabase
        .from('livestream_gifts')
        .select('gem_value, value_vnd, gift_count, platform')
        .eq('session_id', sessionId);

      if (error) throw error;

      const stats = {
        totalGifts: data.reduce((sum, g) => sum + (g.gift_count || 1), 0),
        totalGem: data.reduce((sum, g) => sum + (g.gem_value || 0), 0),
        totalVnd: data.reduce((sum, g) => sum + (g.value_vnd || 0), 0),
        byPlatform: {
          gemral: { count: 0, gem: 0 },
          tiktok: { count: 0, gem: 0 },
          facebook: { count: 0, gem: 0 },
        },
        uniqueSenders: new Set(data.map(g => `${g.platform}_${g.platform_user_id}`)).size,
      };

      data.forEach(gift => {
        const platform = gift.platform || 'gemral';
        if (stats.byPlatform[platform]) {
          stats.byPlatform[platform].count += gift.gift_count || 1;
          stats.byPlatform[platform].gem += gift.gem_value || 0;
        }
      });

      return stats;
    } catch (error) {
      console.error('[GiftService] Get session stats error:', error);
      return null;
    }
  }

  /**
   * Get available gifts for purchase
   */
  getAvailableGifts() {
    return GEMRAL_GIFTS.map(gift => ({
      ...gift,
      category: GIFT_CATEGORIES[gift.category],
    }));
  }

  /**
   * Get gifts by category
   */
  getGiftsByCategory(category) {
    return GEMRAL_GIFTS.filter(g => g.category === category);
  }

  /**
   * Calculate streamer revenue from session
   * @param {string} sessionId - Session ID
   * @param {number} commissionRate - Platform commission (default 30%)
   */
  async calculateStreamerRevenue(sessionId, commissionRate = 0.3) {
    try {
      const stats = await this.getSessionStats(sessionId);
      if (!stats) return null;

      const grossVnd = stats.totalVnd;
      const commission = grossVnd * commissionRate;
      const netVnd = grossVnd - commission;

      return {
        grossVnd,
        commission,
        netVnd,
        commissionRate: commissionRate * 100,
        totalGem: stats.totalGem,
        totalGifts: stats.totalGifts,
        uniqueSenders: stats.uniqueSenders,
      };
    } catch (error) {
      console.error('[GiftService] Calculate revenue error:', error);
      return null;
    }
  }

  /**
   * Subscribe to events
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit event
   */
  _emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(data);
        } catch (error) {
          console.error(`[GiftService] Event handler error for ${event}:`, error);
        }
      });
    }
  }
}

// Singleton instance
export const livestreamGiftService = new LivestreamGiftService();
export default livestreamGiftService;
