/**
 * Gemral - Seed Content Service
 * Core management service for seed content system
 */

import { supabase } from '../supabase';

// Default configuration values
const DEFAULT_CONFIG = {
  bot_enabled: true,
  bot_auto_comment: true,
  bot_auto_reply: true,
  bot_auto_like: true,
  bot_comments_per_post: { min: 3, max: 5 },
  bot_likes_per_post: { min: 15, max: 40 },
  bot_reply_probability: 0.7,
  bot_initial_delay_minutes: { min: 5, max: 20 },
  bot_comment_spread_hours: { min: 1, max: 48 },
  bot_max_daily_comments: 200,
  bot_max_daily_likes: 1000,
  bot_max_daily_replies: 100,
  seed_content_visible: true,
  mix_seed_real_feed: true,
  ai_comment_ratio: 0.3,
};

// Cache for config
let configCache = null;
let configCacheTime = null;
const CONFIG_CACHE_TTL = 60000; // 1 minute

/**
 * Get all seed content configuration
 * @returns {Promise<Object>} Configuration object
 */
export const getConfig = async () => {
  try {
    // Check cache
    if (configCache && configCacheTime && Date.now() - configCacheTime < CONFIG_CACHE_TTL) {
      return configCache;
    }

    const { data, error } = await supabase
      .from('seed_content_config')
      .select('key, value');

    if (error) {
      console.error('[SeedContent] Error fetching config:', error);
      return DEFAULT_CONFIG;
    }

    // Convert array to object
    const config = { ...DEFAULT_CONFIG };
    data?.forEach(item => {
      try {
        // Parse JSONB value
        config[item.key] = typeof item.value === 'string'
          ? JSON.parse(item.value)
          : item.value;
      } catch (e) {
        config[item.key] = item.value;
      }
    });

    // Update cache
    configCache = config;
    configCacheTime = Date.now();

    return config;
  } catch (error) {
    console.error('[SeedContent] getConfig error:', error);
    return DEFAULT_CONFIG;
  }
};

/**
 * Get a specific config value
 * @param {string} key - Config key
 * @param {any} defaultValue - Default value if not found
 * @returns {Promise<any>}
 */
export const getConfigValue = async (key, defaultValue = null) => {
  try {
    const { data, error } = await supabase
      .from('seed_content_config')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) {
      return defaultValue ?? DEFAULT_CONFIG[key];
    }

    return typeof data.value === 'string'
      ? JSON.parse(data.value)
      : data.value;
  } catch (error) {
    console.error('[SeedContent] getConfigValue error:', error);
    return defaultValue ?? DEFAULT_CONFIG[key];
  }
};

/**
 * Update a config value
 * @param {string} key - Config key
 * @param {any} value - New value
 * @param {string} userId - User ID making the update
 * @returns {Promise<boolean>}
 */
export const updateConfig = async (key, value, userId = null) => {
  try {
    const { error } = await supabase
      .from('seed_content_config')
      .upsert({
        key,
        value: JSON.stringify(value),
        updated_at: new Date().toISOString(),
        updated_by: userId,
      }, {
        onConflict: 'key',
      });

    if (error) {
      console.error('[SeedContent] Error updating config:', error);
      return false;
    }

    // Invalidate cache
    configCache = null;
    configCacheTime = null;

    return true;
  } catch (error) {
    console.error('[SeedContent] updateConfig error:', error);
    return false;
  }
};

/**
 * Get seed content statistics
 * @returns {Promise<Object>} Statistics object
 */
export const getStats = async () => {
  try {
    // NOTE: Database function get_seed_content_stats may be outdated
    // It queries forum_posts instead of seed_posts table
    // So we skip it and always use manual queries

    // Manual queries - accurate for current table structure
    // NOTE: seed_users are stored in 'seed_users' table (NOT 'profiles')
    // NOTE: seed_posts are stored in 'seed_posts' table (NOT 'forum_posts')
    const [
      seedUsersResult,
      seedPostsResult,
      realUsersResult,
      realPostsResult,
      botActivityResult,
    ] = await Promise.all([
      supabase.from('seed_users').select('id, is_premium_seed', { count: 'exact' }), // Seed users in seed_users table
      supabase.from('seed_posts').select('id', { count: 'exact' }), // Count from seed_posts table
      supabase.from('profiles').select('id', { count: 'exact' }), // All real users in profiles table
      supabase.from('forum_posts').select('id', { count: 'exact' }), // Real posts from forum_posts
      supabase.from('bot_activity_log').select('action_type', { count: 'exact' }).gte('created_at', new Date().toISOString().split('T')[0]),
    ]);

    const premiumSeedUsers = seedUsersResult.data?.filter(u => u.is_premium_seed)?.length || 0;

    // Count bot activities by type
    let botCommentsToday = 0;
    let botLikesToday = 0;
    let botRepliesToday = 0;

    if (botActivityResult.data) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: activityData } = await supabase
        .from('bot_activity_log')
        .select('action_type')
        .gte('created_at', todayStart.toISOString());

      activityData?.forEach(item => {
        if (item.action_type === 'comment') botCommentsToday++;
        else if (item.action_type === 'like') botLikesToday++;
        else if (item.action_type === 'reply') botRepliesToday++;
      });
    }

    return {
      seed_users_total: seedUsersResult.count || 0,
      seed_users_premium: premiumSeedUsers,
      seed_users_regular: (seedUsersResult.count || 0) - premiumSeedUsers,
      seed_posts_total: seedPostsResult.count || 0,
      real_users_total: realUsersResult.count || 0,
      real_posts_total: realPostsResult.count || 0,
      bot_comments_today: botCommentsToday,
      bot_likes_today: botLikesToday,
      bot_replies_today: botRepliesToday,
    };
  } catch (error) {
    console.error('[SeedContent] getStats error:', error);
    return {
      seed_users_total: 0,
      seed_users_premium: 0,
      seed_users_regular: 0,
      seed_posts_total: 0,
      real_users_total: 0,
      real_posts_total: 0,
      bot_comments_today: 0,
      bot_likes_today: 0,
      bot_replies_today: 0,
    };
  }
};

/**
 * Get paginated list of seed users
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getSeedUsers = async ({
  page = 1,
  limit = 20,
  persona = null,
  isPremium = null,
  searchQuery = null,
} = {}) => {
  try {
    let query = supabase
      .from('profiles')
      .select('id, full_name, avatar_url, bio, seed_persona, is_premium_seed, bot_enabled, created_at, followers_count, following_count', { count: 'exact' })
      .eq('is_seed_user', true)
      .order('created_at', { ascending: false });

    if (persona) {
      query = query.eq('seed_persona', persona);
    }

    if (isPremium !== null) {
      query = query.eq('is_premium_seed', isPremium);
    }

    if (searchQuery) {
      query = query.ilike('full_name', `%${searchQuery}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('[SeedContent] getSeedUsers error:', error);
      return { users: [], total: 0, page, limit };
    }

    return {
      users: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('[SeedContent] getSeedUsers error:', error);
    return { users: [], total: 0, page, limit };
  }
};

/**
 * Get paginated list of seed posts
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getSeedPosts = async ({
  page = 1,
  limit = 20,
  topic = null,
  authorId = null,
} = {}) => {
  try {
    let query = supabase
      .from('forum_posts')
      .select(`
        id,
        content,
        images,
        seed_topic,
        created_at,
        likes_count,
        comments_count,
        author:profiles!author_id (
          id,
          full_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('is_seed_post', true)
      .order('created_at', { ascending: false });

    if (topic) {
      query = query.eq('seed_topic', topic);
    }

    if (authorId) {
      query = query.eq('author_id', authorId);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('[SeedContent] getSeedPosts error:', error);
      return { posts: [], total: 0, page, limit };
    }

    return {
      posts: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('[SeedContent] getSeedPosts error:', error);
    return { posts: [], total: 0, page, limit };
  }
};

/**
 * Get bot activity logs
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getBotActivityLogs = async ({
  page = 1,
  limit = 50,
  actionType = null,
  dateFrom = null,
  dateTo = null,
} = {}) => {
  try {
    let query = supabase
      .from('bot_activity_log')
      .select(`
        id,
        action_type,
        content,
        triggered_by,
        ai_model,
        status,
        created_at,
        seed_user:profiles!seed_user_id (
          id,
          full_name,
          avatar_url
        ),
        post:forum_posts!post_id (
          id,
          content
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('[SeedContent] getBotActivityLogs error:', error);
      return { logs: [], total: 0, page, limit };
    }

    return {
      logs: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('[SeedContent] getBotActivityLogs error:', error);
    return { logs: [], total: 0, page, limit };
  }
};

/**
 * Toggle bot enabled status for a seed user
 * @param {string} userId - User ID
 * @param {boolean} enabled - Enabled status
 * @returns {Promise<boolean>}
 */
export const toggleSeedUserBot = async (userId, enabled) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ bot_enabled: enabled })
      .eq('id', userId)
      .eq('is_seed_user', true);

    if (error) {
      console.error('[SeedContent] toggleSeedUserBot error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[SeedContent] toggleSeedUserBot error:', error);
    return false;
  }
};

/**
 * Delete a seed user and their content
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const deleteSeedUser = async (userId) => {
  try {
    // Delete user's posts first (comments and likes will cascade)
    await supabase
      .from('forum_posts')
      .delete()
      .eq('author_id', userId);

    // Delete user's comments (forum_comments uses user_id, not author_id)
    await supabase
      .from('forum_comments')
      .delete()
      .eq('user_id', userId);

    // Delete user's likes
    await supabase
      .from('forum_likes')
      .delete()
      .eq('user_id', userId);

    // Delete the user
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
      .eq('is_seed_user', true);

    if (error) {
      console.error('[SeedContent] deleteSeedUser error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[SeedContent] deleteSeedUser error:', error);
    return false;
  }
};

/**
 * Delete a seed post
 * @param {string} postId - Post ID
 * @returns {Promise<boolean>}
 */
export const deleteSeedPost = async (postId) => {
  try {
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId)
      .eq('is_seed_post', true);

    if (error) {
      console.error('[SeedContent] deleteSeedPost error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[SeedContent] deleteSeedPost error:', error);
    return false;
  }
};

/**
 * Delete all seed content (dangerous!)
 * @returns {Promise<Object>} Result with counts
 */
export const deleteAllSeedContent = async () => {
  try {
    // Try to use the database function first
    const { data: funcData, error: funcError } = await supabase
      .rpc('delete_all_seed_content');

    if (!funcError && funcData) {
      return funcData;
    }

    // Fallback to manual deletion
    // Delete comments on seed posts
    const { count: deletedCommentsOnPosts } = await supabase
      .from('forum_comments')
      .delete()
      .in('post_id', supabase.from('forum_posts').select('id').eq('is_seed_post', true));

    // Delete likes on seed posts
    const { count: deletedLikesOnPosts } = await supabase
      .from('forum_likes')
      .delete()
      .in('post_id', supabase.from('forum_posts').select('id').eq('is_seed_post', true));

    // Delete seed posts
    const { count: deletedPosts } = await supabase
      .from('forum_posts')
      .delete()
      .eq('is_seed_post', true);

    // Delete comments by seed users (forum_comments uses user_id, not author_id)
    await supabase
      .from('forum_comments')
      .delete()
      .in('user_id', supabase.from('seed_users').select('id'));

    // Delete likes by seed users
    await supabase
      .from('forum_likes')
      .delete()
      .in('user_id', supabase.from('profiles').select('id').eq('is_seed_user', true));

    // Delete seed users
    const { count: deletedUsers } = await supabase
      .from('profiles')
      .delete()
      .eq('is_seed_user', true);

    // Clear bot activity log
    await supabase
      .from('bot_activity_log')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    return {
      deleted_posts: deletedPosts || 0,
      deleted_users: deletedUsers || 0,
      deleted_comments: deletedCommentsOnPosts || 0,
      deleted_likes: deletedLikesOnPosts || 0,
    };
  } catch (error) {
    console.error('[SeedContent] deleteAllSeedContent error:', error);
    throw error;
  }
};

/**
 * Log a generation activity
 * @param {Object} params - Log parameters
 * @returns {Promise<string|null>} Log ID
 */
export const logGeneration = async ({
  generationType,
  countGenerated,
  countFailed = 0,
  parameters = {},
  errorDetails = null,
  generatedBy = null,
}) => {
  try {
    const { data, error } = await supabase
      .from('seed_generation_log')
      .insert({
        generation_type: generationType,
        count_generated: countGenerated,
        count_failed: countFailed,
        parameters,
        error_details: errorDetails,
        generated_by: generatedBy,
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('[SeedContent] logGeneration error:', error);
      return null;
    }

    return data?.id;
  } catch (error) {
    console.error('[SeedContent] logGeneration error:', error);
    return null;
  }
};

/**
 * Get generation history
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export const getGenerationHistory = async ({
  page = 1,
  limit = 20,
  type = null,
} = {}) => {
  try {
    let query = supabase
      .from('seed_generation_log')
      .select('*', { count: 'exact' })
      .order('started_at', { ascending: false });

    if (type) {
      query = query.eq('generation_type', type);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('[SeedContent] getGenerationHistory error:', error);
      return { logs: [], total: 0, page, limit };
    }

    return {
      logs: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('[SeedContent] getGenerationHistory error:', error);
    return { logs: [], total: 0, page, limit };
  }
};

/**
 * Log bot activity
 * @param {Object} params - Activity parameters
 * @returns {Promise<boolean>}
 */
export const logBotActivity = async ({
  actionType,
  postId = null,
  commentId = null,
  seedUserId,
  targetUserId = null,
  content = null,
  triggeredBy,
  aiModel = null,
  status = 'completed',
}) => {
  try {
    const { error } = await supabase
      .from('bot_activity_log')
      .insert({
        action_type: actionType,
        post_id: postId,
        comment_id: commentId,
        seed_user_id: seedUserId,
        target_user_id: targetUserId,
        content,
        triggered_by: triggeredBy,
        ai_model: aiModel,
        status,
      });

    if (error) {
      console.error('[SeedContent] logBotActivity error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[SeedContent] logBotActivity error:', error);
    return false;
  }
};

/**
 * Check if daily limit reached for an action type
 * @param {string} actionType - 'comment', 'like', or 'reply'
 * @returns {Promise<boolean>} true if under limit, false if limit reached
 */
export const checkDailyLimit = async (actionType) => {
  try {
    const { data, error } = await supabase
      .rpc('check_bot_daily_limit', { action_type_param: actionType });

    if (error) {
      console.error('[SeedContent] checkDailyLimit error:', error);
      // Default to allowing action if function fails
      return true;
    }

    return data ?? true;
  } catch (error) {
    console.error('[SeedContent] checkDailyLimit error:', error);
    return true;
  }
};

/**
 * Get random seed users for bot actions
 * @param {number} count - Number of users needed
 * @param {string} excludeUserId - User ID to exclude
 * @param {string} personaFilter - Filter by persona
 * @returns {Promise<Array>}
 */
export const getRandomSeedUsers = async (count, excludeUserId = null, personaFilter = null) => {
  try {
    const { data, error } = await supabase
      .rpc('get_random_seed_users', {
        count_needed: count,
        exclude_user_id: excludeUserId,
        persona_filter: personaFilter,
      });

    if (error) {
      console.error('[SeedContent] getRandomSeedUsers error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[SeedContent] getRandomSeedUsers error:', error);
    return [];
  }
};

export default {
  getConfig,
  getConfigValue,
  updateConfig,
  getStats,
  getSeedUsers,
  getSeedPosts,
  getBotActivityLogs,
  toggleSeedUserBot,
  deleteSeedUser,
  deleteSeedPost,
  deleteAllSeedContent,
  logGeneration,
  getGenerationHistory,
  logBotActivity,
  checkDailyLimit,
  getRandomSeedUsers,
};
