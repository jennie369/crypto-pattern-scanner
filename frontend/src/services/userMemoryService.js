/**
 * User Memory Service (Web)
 * Ported from gem-mobile/src/services/userMemoryService.js
 *
 * Long-term memory management for GEM Master Chatbot.
 * Handles user profiles, memories, and personalization context.
 *
 * Adaptations:
 * - Uses web supabaseClient instead of mobile supabase
 * - Uses simple in-memory cache instead of mobile cacheService
 * - Removed validationService dependency (inline validation)
 */

import { supabase } from '../lib/supabaseClient';

// Memory type constants
export const MEMORY_TYPES = {
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

export const IMPORTANCE_LEVELS = {
  LOW: 3,
  MEDIUM: 5,
  HIGH: 7,
  CRITICAL: 9,
};

// Simple in-memory cache for web
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCached = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const invalidateCache = (prefix, userId) => {
  const fullKey = `${prefix}_${userId}`;
  for (const key of cache.keys()) {
    if (key.startsWith(fullKey) || key === fullKey) {
      cache.delete(key);
    }
  }
};

const clearUserCache = (userId) => {
  for (const key of cache.keys()) {
    if (key.includes(userId)) {
      cache.delete(key);
    }
  }
};

// Simple validation helpers
const sanitizeString = (str, maxLen = 200) => {
  if (!str || typeof str !== 'string') return null;
  return str.trim().slice(0, maxLen);
};

class UserMemoryService {
  async getUserProfile(userId) {
    if (!userId) return null;

    try {
      const cached = getCached(`CHATBOT_PROFILE_${userId}`);
      if (cached) return cached;

      const { data, error } = await supabase
        .rpc('get_or_create_chatbot_profile', { p_user_id: userId });

      if (error) {
        console.warn('[UserMemory] RPC failed, falling back to direct query:', error.message);
        return await this._getProfileDirect(userId);
      }

      if (data) {
        setCached(`CHATBOT_PROFILE_${userId}`, data);
      }

      return data;
    } catch (error) {
      console.error('[UserMemory] getUserProfile error:', error);
      return null;
    }
  }

  async _getProfileDirect(userId) {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        data = await this.createUserProfile(userId);
      } else if (error) {
        throw error;
      }

      if (data) {
        setCached(`CHATBOT_PROFILE_${userId}`, data);
      }

      return data;
    } catch (error) {
      console.error('[UserMemory] _getProfileDirect error:', error);
      return null;
    }
  }

  async createUserProfile(userId) {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('[UserMemory] Profile not found for user:', userId);
        return null;
      }

      if (data) {
        setCached(`CHATBOT_PROFILE_${userId}`, data);
      }

      return data;
    } catch (error) {
      console.error('[UserMemory] createUserProfile error:', error);
      return null;
    }
  }

  async updateUserProfile(userId, updates) {
    if (!userId || !updates) return null;

    try {
      const validatedUpdates = { ...updates };

      if (updates.display_name) {
        const clean = sanitizeString(updates.display_name, 50);
        if (!clean || clean.length < 2) {
          delete validatedUpdates.display_name;
        } else {
          validatedUpdates.display_name = clean;
        }
      }

      if (updates.preferred_name) {
        const clean = sanitizeString(updates.preferred_name, 50);
        if (!clean || clean.length < 2) {
          delete validatedUpdates.preferred_name;
        } else {
          validatedUpdates.preferred_name = clean;
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(validatedUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      clearUserCache(userId);
      if (data) {
        setCached(`CHATBOT_PROFILE_${userId}`, data);
      }

      return data;
    } catch (error) {
      console.error('[UserMemory] updateUserProfile error:', error);
      return null;
    }
  }

  async saveMemory(userId, memory) {
    if (!userId || !memory?.content) return null;

    try {
      const content = sanitizeString(memory.content, 2000);
      if (!content || content.length < 3) return null;

      const memoryData = {
        user_id: userId,
        memory_type: memory.memory_type || MEMORY_TYPES.GENERAL,
        category: memory.category || 'general',
        title: memory.title || null,
        content,
        summary: memory.summary || null,
        context: memory.context || {},
        importance: memory.importance || IMPORTANCE_LEVELS.MEDIUM,
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

      invalidateCache('RECENT_MEMORIES', userId);
      return data;
    } catch (error) {
      console.error('[UserMemory] saveMemory error:', error);
      return null;
    }
  }

  async getRelevantMemories(userId, query, options = {}) {
    if (!userId) return [];

    const { memoryType = null, limit = 10, minImportance = 1 } = options;

    try {
      const { data, error } = await supabase
        .rpc('search_memories', {
          p_user_id: userId,
          p_query: query || '',
          p_memory_type: memoryType,
          p_limit: limit,
        });

      if (error) {
        console.warn('[UserMemory] search_memories RPC failed:', error.message);
        return await this._getMemoriesDirect(userId, memoryType, limit, minImportance);
      }

      return data || [];
    } catch (error) {
      console.error('[UserMemory] getRelevantMemories error:', error);
      return [];
    }
  }

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

      query = query.or('expires_at.is.null,expires_at.gt.now()');

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[UserMemory] _getMemoriesDirect error:', error);
      return [];
    }
  }

  async getRecentMemories(userId, days = 30, memoryType = null) {
    if (!userId) return [];

    try {
      const cacheKey = `RECENT_MEMORIES_${memoryType || 'all'}_${userId}`;
      const cached = getCached(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .rpc('get_recent_memories', {
          p_user_id: userId,
          p_memory_type: memoryType,
          p_days: days,
          p_limit: 20,
        });

      if (error) throw error;

      if (data) {
        setCached(cacheKey, data);
      }

      return data || [];
    } catch (error) {
      console.error('[UserMemory] getRecentMemories error:', error);
      return [];
    }
  }

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

      invalidateCache('RECENT_MEMORIES', userId);
      return data;
    } catch (error) {
      console.error('[UserMemory] updateMemory error:', error);
      return null;
    }
  }

  async deleteMemory(memoryId, userId) {
    if (!memoryId || !userId) return false;

    try {
      const { error } = await supabase
        .from('chat_memories')
        .delete()
        .eq('id', memoryId)
        .eq('user_id', userId);

      if (error) throw error;

      invalidateCache('RECENT_MEMORIES', userId);
      return true;
    } catch (error) {
      console.error('[UserMemory] deleteMemory error:', error);
      return false;
    }
  }

  async buildPersonalizedContext(userId, message) {
    if (!userId) {
      return { profile: null, memories: [], goals: [], divinations: [] };
    }

    try {
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

  buildPersonalizedGreeting(profile) {
    const hour = new Date().getHours();
    let timeGreeting;

    if (hour >= 5 && hour < 12) timeGreeting = 'Chao buoi sang';
    else if (hour >= 12 && hour < 17) timeGreeting = 'Chao buoi chieu';
    else if (hour >= 17 && hour < 21) timeGreeting = 'Chao buoi toi';
    else timeGreeting = 'Xin chao';

    const name = profile?.preferred_name || profile?.display_name;
    const days = profile?.transformation_days || 0;

    let greeting = timeGreeting;
    if (name) greeting += `, ${name}`;
    greeting += '!';

    if (days > 0) {
      if (days === 1) {
        greeting += ' Hom nay la ngay dau tien trong hanh trinh chuyen hoa cua ban.';
      } else if (days % 7 === 0) {
        const weeks = Math.floor(days / 7);
        greeting += ` Chuc mung tuan thu ${weeks} trong hanh trinh!`;
      } else if ([30, 60, 90, 100].includes(days)) {
        greeting += ` Tuyet voi! Ban da dong hanh cung GEM ${days} ngay roi!`;
      } else {
        greeting += ` Ngay ${days} trong hanh trinh cua ban.`;
      }
    }

    return greeting;
  }

  formatContextForPrompt(context) {
    if (!context?.profile) return '';

    const parts = [];
    const profile = context.profile;

    if (profile.preferred_name || profile.display_name) {
      parts.push(`Ten nguoi dung: ${profile.preferred_name || profile.display_name}`);
    }
    if (profile.zodiac_sign) {
      parts.push(`Cung hoang dao: ${profile.zodiac_sign}`);
    }
    if (profile.life_purpose) {
      parts.push(`Muc dich song: ${profile.life_purpose}`);
    }
    if (profile.core_values?.length > 0) {
      parts.push(`Gia tri cot loi: ${profile.core_values.join(', ')}`);
    }
    if (profile.spiritual_goals?.length > 0) {
      parts.push(`Muc tieu tam thuc: ${profile.spiritual_goals.join(', ')}`);
    }

    const styleMap = {
      gentle: 'nhe nhang, am ap',
      direct: 'thang than, ro rang',
      balanced: 'can bang giua am ap va truc tiep',
    };
    if (profile.communication_style) {
      parts.push(`Phong cach giao tiep: ${styleMap[profile.communication_style] || 'can bang'}`);
    }

    if (context.transformationDays > 0) {
      parts.push(`Ngay thu ${context.transformationDays} trong hanh trinh chuyen hoa`);
    }

    if (context.goals?.length > 0) {
      const goalsList = context.goals.map(g => g.content).join('; ');
      parts.push(`Muc tieu hien tai: ${goalsList}`);
    }

    if (context.memories?.length > 0) {
      const memoriesList = context.memories.slice(0, 3).map(m => m.content).join('; ');
      parts.push(`Thong tin lien quan tu cuoc tro chuyen truoc: ${memoriesList}`);
    }

    if (context.divinations?.length > 0) {
      const divinationSummary = context.divinations.slice(0, 2).map(d => {
        const category = d.category === 'tarot' ? 'Tarot' : d.category === 'iching' ? 'I Ching' : d.category;
        return `${category}: ${d.summary || d.content?.substring(0, 100)}...`;
      }).join('; ');
      parts.push(`Ket qua boi gan day: ${divinationSummary}`);
    }

    if (parts.length === 0) return '';
    return `\n[THONG TIN CA NHAN HOA]\n${parts.join('\n')}\n`;
  }

  async extractAndSaveMemories(userId, userMessage, aiResponse, category = 'general') {
    if (!userId || !userMessage) return [];

    const savedMemories = [];

    try {
      const goalPatterns = [
        /muon\s+(.+?)(?:\.|,|$)/gi,
        /muc tieu\s+(?:cua toi\s+)?(?:la\s+)?(.+?)(?:\.|,|$)/gi,
        /dang co gang\s+(.+?)(?:\.|,|$)/gi,
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

      return savedMemories;
    } catch (error) {
      console.error('[UserMemory] extractAndSaveMemories error:', error);
      return savedMemories;
    }
  }

  async saveDivinationMemory(userId, divinationResult) {
    if (!userId || !divinationResult) return null;

    try {
      const { type, question, result, interpretation } = divinationResult;
      return await this.saveMemory(userId, {
        memory_type: MEMORY_TYPES.DIVINATION,
        category: type,
        title: question || `Ket qua ${type}`,
        content: interpretation || result,
        summary: result?.substring(0, 200),
        context: { type, question, result_data: result, timestamp: new Date().toISOString() },
        importance: IMPORTANCE_LEVELS.MEDIUM,
        source_type: 'divination',
      });
    } catch (error) {
      console.error('[UserMemory] saveDivinationMemory error:', error);
      return null;
    }
  }

  clearCache(userId) {
    if (userId) clearUserCache(userId);
  }

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
        stats.byType[memory.memory_type] = (stats.byType[memory.memory_type] || 0) + 1;
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

export const userMemoryService = new UserMemoryService();
export default userMemoryService;
