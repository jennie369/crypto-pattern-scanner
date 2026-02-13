/**
 * USER MEMORY SERVICE
 * Long-term memory management for GEM Master Chatbot
 * Handles user profiles, memories, and personalization context
 */

import { supabase } from './supabase';
import cacheService from './cacheService';
import { validationService } from './validationService';

// Memory type constants
const MEMORY_TYPES = {
  GOAL: 'goal',
  VALUE: 'value',
  PREFERENCE: 'preference',
  ACHIEVEMENT: 'achievement',
  CHALLENGE: 'challenge',
  RELATIONSHIP: 'relationship',
  EMOTION: 'emotion',
  INSIGHT: 'insight',
  DIVINATION: 'divination',
  GENERAL: 'general',
};

// Memory importance levels
const IMPORTANCE_LEVELS = {
  LOW: 3,
  MEDIUM: 5,
  HIGH: 7,
  CRITICAL: 9,
};

// Default notification preferences
const DEFAULT_NOTIFICATION_PREFS = {
  daily_insight: true,
  streak_alerts: true,
  ritual_reminders: true,
  pattern_observations: true,
  milestone_celebrations: true,
  preferred_time: '08:00',
};

class UserMemoryService {
  // ============================================================
  // USER PROFILE MANAGEMENT
  // ============================================================

  /**
   * Get user's chatbot profile (creates if doesn't exist)
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Profile object or null on error
   */
  async getUserProfile(userId) {
    if (!userId) return null;

    try {
      // Check cache first
      const cached = await cacheService.getForUser('CHATBOT_PROFILE', userId);
      if (cached) return cached;

      // Try RPC function first (handles upsert)
      const { data, error } = await supabase
        .rpc('get_or_create_chatbot_profile', { p_user_id: userId });

      if (error) {
        console.warn('[UserMemory] RPC failed, falling back to direct query:', error.message);
        // Fallback to direct query
        return await this._getProfileDirect(userId);
      }

      // Cache the profile
      if (data) {
        await cacheService.setForUser('CHATBOT_PROFILE', data, userId);
      }

      return data;
    } catch (error) {
      console.error('[UserMemory] getUserProfile error:', error);
      return null;
    }
  }

  /**
   * Direct profile fetch (fallback method)
   * @private
   */
  async _getProfileDirect(userId) {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Not found, create new profile
        data = await this.createUserProfile(userId);
      } else if (error) {
        throw error;
      }

      if (data) {
        await cacheService.setForUser('CHATBOT_PROFILE', data, userId);
      }

      return data;
    } catch (error) {
      console.error('[UserMemory] _getProfileDirect error:', error);
      return null;
    }
  }

  /**
   * Get or initialize user profile
   * Note: profiles are created by Supabase Auth on signup, not here
   * This function just fetches the existing profile
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Profile or null
   */
  async createUserProfile(userId) {
    if (!userId) return null;

    try {
      // Profiles are created by auth signup - just fetch existing
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('[UserMemory] Profile not found for user:', userId);
        return null;
      }

      // Cache the profile
      if (data) {
        await cacheService.setForUser('CHATBOT_PROFILE', data, userId);
      }

      return data;
    } catch (error) {
      console.error('[UserMemory] createUserProfile error:', error);
      return null;
    }
  }

  /**
   * Update user's chatbot profile
   * @param {string} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated profile or null
   */
  async updateUserProfile(userId, updates) {
    if (!userId || !updates) return null;

    try {
      // Validate string fields
      const validatedUpdates = { ...updates };

      if (updates.display_name) {
        const result = validationService.validate('display_name', updates.display_name);
        if (!result.valid) {
          console.warn('[UserMemory] Invalid display_name:', result.errors);
          delete validatedUpdates.display_name;
        } else {
          validatedUpdates.display_name = result.value;
        }
      }

      if (updates.preferred_name) {
        const result = validationService.validate('preferred_name', updates.preferred_name);
        if (!result.valid) {
          console.warn('[UserMemory] Invalid preferred_name:', result.errors);
          delete validatedUpdates.preferred_name;
        } else {
          validatedUpdates.preferred_name = result.value;
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(validatedUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Invalidate cache
      await cacheService.clearUserCache(userId);

      // Re-cache updated profile
      if (data) {
        await cacheService.setForUser('CHATBOT_PROFILE', data, userId);
      }

      return data;
    } catch (error) {
      console.error('[UserMemory] updateUserProfile error:', error);
      return null;
    }
  }

  // ============================================================
  // MEMORY MANAGEMENT
  // ============================================================

  /**
   * Save a new memory
   * @param {string} userId - User ID
   * @param {Object} memory - Memory data
   * @returns {Promise<Object|null>} Created memory or null
   */
  async saveMemory(userId, memory) {
    if (!userId || !memory?.content) return null;

    try {
      // Validate memory
      const validation = validationService.validateMemory(memory);
      if (!validation.valid) {
        console.warn('[UserMemory] Invalid memory:', validation.errors);
        return null;
      }

      const memoryData = {
        user_id: userId,
        memory_type: validation.data.memory_type || MEMORY_TYPES.GENERAL,
        category: memory.category || 'general',
        title: memory.title || null,
        content: validation.data.content,
        summary: memory.summary || null,
        context: memory.context || {},
        importance: validation.data.importance || IMPORTANCE_LEVELS.MEDIUM,
        is_pinned: memory.is_pinned || false,
        source_type: memory.source_type || 'conversation',
        source_reference_id: memory.source_reference_id || null,
        expires_at: memory.expires_at || null,
      };

      const { data, error } = await supabase
        .from('chat_memories')
        .insert(memoryData)
        .select()
        .single();

      if (error) throw error;

      // Invalidate memories cache
      await cacheService.invalidate('RECENT_MEMORIES', userId);

      return data;
    } catch (error) {
      console.error('[UserMemory] saveMemory error:', error);
      return null;
    }
  }

  /**
   * Get relevant memories for context
   * @param {string} userId - User ID
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of relevant memories
   */
  async getRelevantMemories(userId, query, options = {}) {
    if (!userId) return [];

    const {
      memoryType = null,
      limit = 10,
      minImportance = 1,
    } = options;

    try {
      // Try RPC function for semantic search
      const { data, error } = await supabase
        .rpc('search_memories', {
          p_user_id: userId,
          p_query: query || '',
          p_memory_type: memoryType,
          p_limit: limit,
        });

      if (error) {
        console.warn('[UserMemory] search_memories RPC failed:', error.message);
        // Fallback to direct query
        return await this._getMemoriesDirect(userId, memoryType, limit, minImportance);
      }

      return data || [];
    } catch (error) {
      console.error('[UserMemory] getRelevantMemories error:', error);
      return [];
    }
  }

  /**
   * Direct memory fetch (fallback)
   * @private
   */
  async _getMemoriesDirect(userId, memoryType, limit, minImportance) {
    try {
      let query = supabase
        .from('chat_memories')
        .select('*')
        .eq('user_id', userId)
        .gte('importance', minImportance)
        .order('importance', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (memoryType) {
        query = query.eq('memory_type', memoryType);
      }

      // Exclude expired memories
      query = query.or('expires_at.is.null,expires_at.gt.now()');

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[UserMemory] _getMemoriesDirect error:', error);
      return [];
    }
  }

  /**
   * Get recent memories
   * @param {string} userId - User ID
   * @param {number} days - Number of days to look back
   * @param {string} memoryType - Optional memory type filter
   * @returns {Promise<Array>} Array of recent memories
   */
  async getRecentMemories(userId, days = 30, memoryType = null) {
    if (!userId) return [];

    try {
      // Check cache
      const cacheKey = `RECENT_MEMORIES_${memoryType || 'all'}`;
      const cached = await cacheService.getForUser(cacheKey, userId);
      if (cached) return cached;

      const { data, error } = await supabase
        .rpc('get_recent_memories', {
          p_user_id: userId,
          p_memory_type: memoryType,
          p_days: days,
          p_limit: 20,
        });

      if (error) throw error;

      // Cache results
      if (data) {
        await cacheService.setForUser(cacheKey, data, userId);
      }

      return data || [];
    } catch (error) {
      console.error('[UserMemory] getRecentMemories error:', error);
      return [];
    }
  }

  /**
   * Get user's pinned goals
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of pinned goals
   */
  async getUserGoals(userId) {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('chat_memories')
        .select('*')
        .eq('user_id', userId)
        .eq('memory_type', MEMORY_TYPES.GOAL)
        .eq('is_pinned', true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('importance', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[UserMemory] getUserGoals error:', error);
      return [];
    }
  }

  /**
   * Get recent divination results
   * @param {string} userId - User ID
   * @param {number} days - Days to look back
   * @param {string} category - Optional category filter (tarot, iching, numerology)
   * @returns {Promise<Array>} Array of divination memories
   */
  async getRecentDivinations(userId, days = 30, category = null) {
    if (!userId) return [];

    try {
      let query = supabase
        .from('chat_memories')
        .select('*')
        .eq('user_id', userId)
        .eq('memory_type', MEMORY_TYPES.DIVINATION)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[UserMemory] getRecentDivinations error:', error);
      return [];
    }
  }

  /**
   * Update a memory
   * @param {string} memoryId - Memory ID
   * @param {string} userId - User ID (for authorization)
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated memory or null
   */
  async updateMemory(memoryId, userId, updates) {
    if (!memoryId || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('chat_memories')
        .update(updates)
        .eq('id', memoryId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Invalidate cache
      await cacheService.invalidate('RECENT_MEMORIES', userId);

      return data;
    } catch (error) {
      console.error('[UserMemory] updateMemory error:', error);
      return null;
    }
  }

  /**
   * Delete a memory
   * @param {string} memoryId - Memory ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<boolean>} Success status
   */
  async deleteMemory(memoryId, userId) {
    if (!memoryId || !userId) return false;

    try {
      const { error } = await supabase
        .from('chat_memories')
        .delete()
        .eq('id', memoryId)
        .eq('user_id', userId);

      if (error) throw error;

      // Invalidate cache
      await cacheService.invalidate('RECENT_MEMORIES', userId);

      return true;
    } catch (error) {
      console.error('[UserMemory] deleteMemory error:', error);
      return false;
    }
  }

  // ============================================================
  // CONTEXT BUILDING
  // ============================================================

  /**
   * Build personalized context for AI prompts
   * @param {string} userId - User ID
   * @param {string} message - Current user message
   * @returns {Promise<Object>} Context object
   */
  async buildPersonalizedContext(userId, message) {
    if (!userId) {
      return { profile: null, memories: [], goals: [], divinations: [] };
    }

    try {
      // Parallel fetch for performance
      const [profile, relevantMemories, goals, recentDivinations] = await Promise.all([
        this.getUserProfile(userId),
        this.getRelevantMemories(userId, message, { limit: 5 }),
        this.getUserGoals(userId),
        this.getRecentDivinations(userId, 7),
      ]);

      return {
        profile,
        memories: relevantMemories,
        goals,
        divinations: recentDivinations,
        transformationDays: profile?.transformation_days || 0,
        journeyStartDate: profile?.journey_start_date,
        preferredName: profile?.preferred_name || profile?.display_name,
        communicationStyle: profile?.communication_style || 'balanced',
      };
    } catch (error) {
      console.error('[UserMemory] buildPersonalizedContext error:', error);
      return { profile: null, memories: [], goals: [], divinations: [] };
    }
  }

  /**
   * Build personalized greeting based on profile
   * @param {Object} profile - User chatbot profile
   * @returns {string} Personalized greeting
   */
  buildPersonalizedGreeting(profile) {
    const hour = new Date().getHours();
    let timeGreeting;

    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Chào buổi sáng';
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = 'Chào buổi chiều';
    } else if (hour >= 17 && hour < 21) {
      timeGreeting = 'Chào buổi tối';
    } else {
      timeGreeting = 'Xin chào';
    }

    const name = profile?.preferred_name || profile?.display_name;
    const days = profile?.transformation_days || 0;

    let greeting = timeGreeting;

    if (name) {
      greeting += `, ${name}`;
    }

    greeting += '!';

    // Add journey milestone
    if (days > 0) {
      if (days === 1) {
        greeting += ' Hôm nay là ngày đầu tiên trong hành trình chuyển hóa của bạn.';
      } else if (days % 7 === 0) {
        const weeks = Math.floor(days / 7);
        greeting += ` Chúc mừng tuần thứ ${weeks} trong hành trình!`;
      } else if (days === 30 || days === 60 || days === 90 || days === 100) {
        greeting += ` Tuyệt vời! Bạn đã đồng hành cùng GEM ${days} ngày rồi!`;
      } else {
        greeting += ` Ngày ${days} trong hành trình của bạn.`;
      }
    }

    return greeting;
  }

  /**
   * Format context for AI prompt injection
   * @param {Object} context - Context from buildPersonalizedContext
   * @returns {string} Formatted context string
   */
  formatContextForPrompt(context) {
    if (!context?.profile) return '';

    const parts = [];

    // Profile info
    const profile = context.profile;
    if (profile.preferred_name || profile.display_name) {
      parts.push(`Tên người dùng: ${profile.preferred_name || profile.display_name}`);
    }

    if (profile.zodiac_sign) {
      parts.push(`Cung hoàng đạo: ${profile.zodiac_sign}`);
    }

    if (profile.life_purpose) {
      parts.push(`Mục đích sống: ${profile.life_purpose}`);
    }

    if (profile.core_values?.length > 0) {
      parts.push(`Giá trị cốt lõi: ${profile.core_values.join(', ')}`);
    }

    if (profile.spiritual_goals?.length > 0) {
      parts.push(`Mục tiêu tâm thức: ${profile.spiritual_goals.join(', ')}`);
    }

    // Communication style
    const styleMap = {
      gentle: 'nhẹ nhàng, ấm áp',
      direct: 'thẳng thắn, rõ ràng',
      balanced: 'cân bằng giữa ấm áp và trực tiếp',
    };
    if (profile.communication_style) {
      parts.push(`Phong cách giao tiếp mong muốn: ${styleMap[profile.communication_style] || 'cân bằng'}`);
    }

    // Transformation journey
    if (context.transformationDays > 0) {
      parts.push(`Ngày thứ ${context.transformationDays} trong hành trình chuyển hóa`);
    }

    // Goals
    if (context.goals?.length > 0) {
      const goalsList = context.goals.map(g => g.content).join('; ');
      parts.push(`Mục tiêu hiện tại: ${goalsList}`);
    }

    // Recent memories
    if (context.memories?.length > 0) {
      const memoriesList = context.memories.slice(0, 3).map(m => m.content).join('; ');
      parts.push(`Thông tin liên quan từ cuộc trò chuyện trước: ${memoriesList}`);
    }

    // Recent divinations
    if (context.divinations?.length > 0) {
      const divinationSummary = context.divinations.slice(0, 2).map(d => {
        const category = d.category === 'tarot' ? 'Tarot' : d.category === 'iching' ? 'I Ching' : d.category;
        return `${category}: ${d.summary || d.content.substring(0, 100)}...`;
      }).join('; ');
      parts.push(`Kết quả bói gần đây: ${divinationSummary}`);
    }

    if (parts.length === 0) return '';

    return `\n[THÔNG TIN CÁ NHÂN HÓA]\n${parts.join('\n')}\n`;
  }

  // ============================================================
  // MEMORY EXTRACTION
  // ============================================================

  /**
   * Extract and save memories from conversation
   * @param {string} userId - User ID
   * @param {string} userMessage - User's message
   * @param {string} aiResponse - AI's response
   * @param {string} category - Context category
   * @returns {Promise<Array>} Saved memories
   */
  async extractAndSaveMemories(userId, userMessage, aiResponse, category = 'general') {
    if (!userId || !userMessage) return [];

    const savedMemories = [];

    try {
      // Extract goal mentions
      const goalPatterns = [
        /muốn\s+(.+?)(?:\.|,|$)/gi,
        /mục tiêu\s+(?:của tôi\s+)?(?:là\s+)?(.+?)(?:\.|,|$)/gi,
        /đang cố gắng\s+(.+?)(?:\.|,|$)/gi,
        /kế hoạch\s+(.+?)(?:\.|,|$)/gi,
      ];

      for (const pattern of goalPatterns) {
        const matches = userMessage.matchAll(pattern);
        for (const match of matches) {
          if (match[1] && match[1].length > 10 && match[1].length < 200) {
            const memory = await this.saveMemory(userId, {
              memory_type: MEMORY_TYPES.GOAL,
              category,
              content: match[1].trim(),
              importance: IMPORTANCE_LEVELS.HIGH,
              source_type: 'extracted',
            });
            if (memory) savedMemories.push(memory);
          }
        }
      }

      // Extract achievements/progress mentions
      const achievementPatterns = [
        /(?:tôi )?đã\s+(.+?)(?:xong|được|thành công)(?:\.|,|$)/gi,
        /hoàn thành\s+(.+?)(?:\.|,|$)/gi,
        /đạt được\s+(.+?)(?:\.|,|$)/gi,
      ];

      for (const pattern of achievementPatterns) {
        const matches = userMessage.matchAll(pattern);
        for (const match of matches) {
          if (match[1] && match[1].length > 10 && match[1].length < 200) {
            const memory = await this.saveMemory(userId, {
              memory_type: MEMORY_TYPES.ACHIEVEMENT,
              category,
              content: match[1].trim(),
              importance: IMPORTANCE_LEVELS.MEDIUM,
              source_type: 'extracted',
            });
            if (memory) savedMemories.push(memory);
          }
        }
      }

      // Extract challenge mentions
      const challengePatterns = [
        /đang gặp khó khăn\s+(?:với\s+)?(.+?)(?:\.|,|$)/gi,
        /vấn đề\s+(?:của tôi\s+)?(?:là\s+)?(.+?)(?:\.|,|$)/gi,
        /không thể\s+(.+?)(?:\.|,|$)/gi,
        /lo lắng\s+(?:về\s+)?(.+?)(?:\.|,|$)/gi,
      ];

      for (const pattern of challengePatterns) {
        const matches = userMessage.matchAll(pattern);
        for (const match of matches) {
          if (match[1] && match[1].length > 10 && match[1].length < 200) {
            const memory = await this.saveMemory(userId, {
              memory_type: MEMORY_TYPES.CHALLENGE,
              category,
              content: match[1].trim(),
              importance: IMPORTANCE_LEVELS.MEDIUM,
              source_type: 'extracted',
            });
            if (memory) savedMemories.push(memory);
          }
        }
      }

      // Extract value mentions
      const valuePatterns = [
        /quan trọng\s+(?:với tôi\s+)?(?:là\s+)?(.+?)(?:\.|,|$)/gi,
        /(?:tôi )?coi trọng\s+(.+?)(?:\.|,|$)/gi,
        /giá trị\s+(?:của tôi\s+)?(?:là\s+)?(.+?)(?:\.|,|$)/gi,
      ];

      for (const pattern of valuePatterns) {
        const matches = userMessage.matchAll(pattern);
        for (const match of matches) {
          if (match[1] && match[1].length > 5 && match[1].length < 100) {
            const memory = await this.saveMemory(userId, {
              memory_type: MEMORY_TYPES.VALUE,
              category,
              content: match[1].trim(),
              importance: IMPORTANCE_LEVELS.HIGH,
              source_type: 'extracted',
            });
            if (memory) savedMemories.push(memory);
          }
        }
      }

      // Extract insights from AI response (if contains key insights)
      const insightPatterns = [
        /điều quan trọng\s+(?:là\s+)?(.+?)(?:\.|$)/gi,
        /bạn nên\s+(.+?)(?:\.|$)/gi,
        /gợi ý\s+(?:cho bạn\s+)?(?:là\s+)?(.+?)(?:\.|$)/gi,
      ];

      for (const pattern of insightPatterns) {
        const matches = aiResponse.matchAll(pattern);
        for (const match of matches) {
          if (match[1] && match[1].length > 20 && match[1].length < 300) {
            const memory = await this.saveMemory(userId, {
              memory_type: MEMORY_TYPES.INSIGHT,
              category,
              content: match[1].trim(),
              importance: IMPORTANCE_LEVELS.LOW,
              source_type: 'extracted',
              // Set expiration for insights (30 days)
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            });
            if (memory) savedMemories.push(memory);
          }
        }
      }

      return savedMemories;
    } catch (error) {
      console.error('[UserMemory] extractAndSaveMemories error:', error);
      return savedMemories;
    }
  }

  /**
   * Save divination result as memory
   * @param {string} userId - User ID
   * @param {Object} divinationResult - Divination data
   * @returns {Promise<Object|null>} Saved memory or null
   */
  async saveDivinationMemory(userId, divinationResult) {
    if (!userId || !divinationResult) return null;

    try {
      const { type, question, result, interpretation } = divinationResult;

      const memory = await this.saveMemory(userId, {
        memory_type: MEMORY_TYPES.DIVINATION,
        category: type, // 'tarot', 'iching', 'numerology'
        title: question || `Kết quả ${type}`,
        content: interpretation || result,
        summary: result?.substring(0, 200),
        context: {
          type,
          question,
          result_data: result,
          timestamp: new Date().toISOString(),
        },
        importance: IMPORTANCE_LEVELS.MEDIUM,
        source_type: 'divination',
      });

      return memory;
    } catch (error) {
      console.error('[UserMemory] saveDivinationMemory error:', error);
      return null;
    }
  }

  // ============================================================
  // CLEANUP & MAINTENANCE
  // ============================================================

  /**
   * Clear user's cached data
   * @param {string} userId - User ID
   */
  async clearCache(userId) {
    if (userId) {
      await cacheService.clearUserCache(userId);
    }
  }

  /**
   * Get memory statistics for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Statistics object
   */
  async getMemoryStats(userId) {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('chat_memories')
        .select('memory_type, importance')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        byType: {},
        byImportance: { low: 0, medium: 0, high: 0, critical: 0 },
      };

      data?.forEach(memory => {
        // Count by type
        stats.byType[memory.memory_type] = (stats.byType[memory.memory_type] || 0) + 1;

        // Count by importance
        if (memory.importance <= 3) stats.byImportance.low++;
        else if (memory.importance <= 5) stats.byImportance.medium++;
        else if (memory.importance <= 7) stats.byImportance.high++;
        else stats.byImportance.critical++;
      });

      return stats;
    } catch (error) {
      console.error('[UserMemory] getMemoryStats error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const userMemoryService = new UserMemoryService();
export default userMemoryService;

// Export constants
export { MEMORY_TYPES, IMPORTANCE_LEVELS };
