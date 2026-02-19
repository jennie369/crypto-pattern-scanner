/**
 * Forum Service
 * Community forum backend service
 * SYNCED WITH MOBILE: Uses forum_posts table (not forum_threads)
 */

import { supabase } from '../lib/supabaseClient';

// Forum categories
export const forumCategories = [
  {
    id: 'trading-discussion',
    name: 'Thảo Luận Trading',
    icon: 'MessageSquare',
    description: 'Thảo luận về chiến lược, phân tích thị trường',
    color: '#FFBD59'
  },
  {
    id: 'pattern-help',
    name: 'Nhận Dạng Pattern',
    icon: 'TrendingUp',
    description: 'Hỏi đáp về nhận dạng pattern',
    color: '#00D9FF'
  },
  {
    id: 'spiritual',
    name: 'Tâm Linh & Năng Lượng',
    icon: 'Sparkles',
    description: 'Thiền định, năng lượng, linh hoạt',
    color: '#8B5CF6'
  },
  {
    id: 'success-stories',
    name: 'Câu Chuyện Thành Công',
    icon: 'Trophy',
    description: 'Chia sẻ thành công, kết quả trading',
    color: '#00FF88'
  },
  {
    id: 'questions',
    name: 'Hỏi Đáp',
    icon: 'HelpCircle',
    description: 'Câu hỏi về khóa học, công cụ',
    color: '#FF8C00'
  }
];

export class ForumService {
  /**
   * Create a new post
   * Uses forum_posts table (synced with mobile)
   */
  async createThread(data) {
    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert({
        title: data.title || '',
        content: data.content,
        category_id: data.category,
        user_id: data.authorId,
        image_url: data.image_url || null,
        status: 'published'
      })
      .select(`
        *,
        author:profiles(id, full_name, avatar_url, scanner_tier, role)
      `)
      .single();

    if (error) throw error;
    return post;
  }

  /**
   * Get posts with pagination and filtering
   * Uses forum_posts table (synced with mobile)
   */
  async getThreads({ category, page = 1, limit = 20, sortBy = 'recent' }) {
    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, role),
        category:forum_categories(id, name, color),
        likes:forum_likes(user_id),
        tagged_products:post_products(
          id,
          product_id,
          product_title,
          product_price,
          product_image,
          product_handle
        )
      `, { count: 'exact' })
      .eq('status', 'published');

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    // Sorting
    if (sortBy === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'popular') {
      query = query.order('likes_count', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    // Transform data for compatibility
    const transformedData = (data || []).map(post => ({
      ...post,
      like_count: post.likes_count || post.likes?.length || 0,
      reply_count: post.comments_count || 0,
    }));

    return {
      threads: transformedData,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Get post details with comments
   * Uses forum_posts and forum_comments tables
   */
  async getThread(postId) {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        author:profiles(id, full_name, avatar_url, scanner_tier, role),
        comments:forum_comments(
          *,
          author:profiles(id, full_name, avatar_url, scanner_tier, role)
        )
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;

    // Increment view count
    supabase
      .from('forum_posts')
      .update({ views_count: (data?.views_count || 0) + 1 })
      .eq('id', postId)
      .then(() => {});

    return data;
  }

  /**
   * Create a comment on a post
   * Uses forum_comments table
   */
  async createReply(data) {
    const { data: comment, error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: data.threadId,
        content: data.content,
        user_id: data.authorId,
        parent_id: data.parentId || null
      })
      .select(`
        *,
        author:profiles(id, full_name, avatar_url, scanner_tier, role)
      `)
      .single();

    if (error) throw error;
    return comment;
  }

  /**
   * Toggle like on post
   * Uses forum_likes table
   */
  async toggleLike(type, id, userId) {
    // Check if already liked
    const { data: existing } = await supabase
      .from('forum_likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Unlike
      await supabase
        .from('forum_likes')
        .delete()
        .eq('id', existing.id);

      return { liked: false };
    } else {
      // Like
      await supabase
        .from('forum_likes')
        .insert({ post_id: id, user_id: userId });

      return { liked: true };
    }
  }

  /**
   * Check if user has liked a post
   */
  async hasLiked(type, id, userId) {
    if (!userId) return false;

    const { data } = await supabase
      .from('forum_likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', userId)
      .single();

    return !!data;
  }

  /**
   * Search posts by title or content
   */
  async searchThreads(query) {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        author:profiles(id, email, full_name, avatar_url, scanner_tier, role)
      `)
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  /**
   * Delete a post (only by author)
   */
  async deleteThread(postId) {
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  }

  /**
   * Delete a comment (only by author)
   */
  async deleteReply(commentId) {
    const { error } = await supabase
      .from('forum_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  }

  /**
   * Update post
   */
  async updateThread(postId, updates) {
    const { data, error } = await supabase
      .from('forum_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update comment
   */
  async updateReply(commentId, updates) {
    const { data, error } = await supabase
      .from('forum_comments')
      .update(updates)
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get trending topics (most liked posts from last 7 days)
   */
  async getTrendingTopics(limit = 5) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        id,
        title,
        content,
        likes_count,
        comments_count,
        views_count,
        created_at
      `)
      .eq('status', 'published')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('likes_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get suggested creators (top contributors by posts)
   */
  async getSuggestedCreators(limit = 5) {
    const { data, error } = await supabase
      .rpc('get_top_creators', { result_limit: limit });

    if (error) {
      console.warn('get_top_creators RPC failed, using fallback query:', error);

      // Fallback: Get users who have posted recently
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('forum_posts')
        .select(`
          user_id,
          author:profiles(
            id,
            full_name,
            avatar_url,
            scanner_tier
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(20);

      if (fallbackError) throw fallbackError;

      // Group by author and count posts
      const authorMap = new Map();

      fallbackData?.forEach((post) => {
        if (post.author) {
          const authorId = post.author.id;
          if (authorMap.has(authorId)) {
            authorMap.get(authorId).post_count++;
          } else {
            authorMap.set(authorId, {
              id: post.author.id,
              display_name: post.author.full_name,
              avatar_url: post.author.avatar_url,
              scanner_tier: post.author.scanner_tier,
              post_count: 1,
              total_likes: 0
            });
          }
        }
      });

      // Convert to array and sort by post count
      const creators = Array.from(authorMap.values())
        .sort((a, b) => b.post_count - a.post_count)
        .slice(0, limit);

      return creators;
    }

    return data || [];
  }

  /**
   * Get online users count
   */
  async getOnlineUsersCount() {
    // TODO: Implement real-time presence tracking
    return Math.floor(Math.random() * 50) + 10;
  }

  /**
   * Get top forum members by contribution
   */
  async getTopMembers(limit = 10) {
    return this.getSuggestedCreators(limit);
  }

  // ─── REACTIONS (6 types) ───────────────────────────────────────────

  /**
   * Toggle reaction on a post — upsert logic:
   * - Same type exists → remove
   * - Different type exists → update
   * - No reaction → insert
   * @param {string} postId
   * @param {string} type - like|love|haha|wow|sad|angry
   * @param {string} userId
   * @returns {{ action: 'added'|'removed'|'changed', type: string }}
   */
  async toggleReaction(postId, type, userId) {
    try {
      const { data: existing } = await supabase
        .from('post_reactions')
        .select('id, type')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        if (existing.type === type) {
          // Same type → remove
          const { error } = await supabase
            .from('post_reactions')
            .delete()
            .eq('id', existing.id);
          if (error) throw error;
          return { action: 'removed', type };
        } else {
          // Different type → update
          const { error } = await supabase
            .from('post_reactions')
            .update({ type })
            .eq('id', existing.id);
          if (error) throw error;
          return { action: 'changed', type };
        }
      }

      // No reaction → insert
      const { error } = await supabase
        .from('post_reactions')
        .insert({ post_id: postId, user_id: userId, type });
      if (error) throw error;
      return { action: 'added', type };
    } catch (error) {
      console.error('toggleReaction error:', error);
      throw error;
    }
  }

  /**
   * Get all reactions for a post with user profiles
   * @param {string} postId
   * @returns {Array<{ id, type, user_id, created_at, user: { id, full_name, avatar_url } }>}
   */
  async getReactions(postId) {
    try {
      const { data, error } = await supabase
        .from('post_reactions')
        .select(`
          id, type, user_id, created_at,
          user:profiles(id, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('getReactions error:', error);
      return [];
    }
  }

  /**
   * Get reaction counts per type from post's reaction_counts jsonb column
   * Falls back to aggregate query if column is null
   * @param {string} postId
   * @returns {Object} e.g. { like: 3, love: 1, haha: 0, wow: 0, sad: 0, angry: 0, total: 4 }
   */
  async getReactionCounts(postId) {
    try {
      // Try reading from the cached jsonb column first
      const { data: post, error: postError } = await supabase
        .from('forum_posts')
        .select('reaction_counts')
        .eq('id', postId)
        .single();

      if (!postError && post?.reaction_counts) {
        const counts = post.reaction_counts;
        const total = Object.values(counts).reduce((s, n) => s + (n || 0), 0);
        return { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0, ...counts, total };
      }

      // Fallback — aggregate from post_reactions
      const { data, error } = await supabase
        .from('post_reactions')
        .select('type')
        .eq('post_id', postId);

      if (error) throw error;

      const counts = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
      (data || []).forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
      const total = Object.values(counts).reduce((s, n) => s + n, 0);
      return { ...counts, total };
    } catch (error) {
      console.error('getReactionCounts error:', error);
      return { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0, total: 0 };
    }
  }

  // ─── EDIT POST ─────────────────────────────────────────────────────

  /**
   * Update a post and record edit history
   * @param {string} postId
   * @param {Object} data - { title, content, category_id, image_url, media_urls, hashtags }
   * @returns {Object} Updated post
   */
  async updatePost(postId, data) {
    try {
      // Get current post for history
      const { data: currentPost, error: fetchErr } = await supabase
        .from('forum_posts')
        .select('title, content, category_id, image_url, media_urls, hashtags, user_id')
        .eq('id', postId)
        .single();
      if (fetchErr) throw fetchErr;

      // Record edit history
      await supabase
        .from('post_edit_history')
        .insert({
          post_id: postId,
          user_id: currentPost.user_id,
          previous_title: currentPost.title,
          previous_content: currentPost.content,
          previous_category_id: currentPost.category_id,
        });

      // Apply update
      const updateFields = {};
      if (data.title !== undefined) updateFields.title = data.title;
      if (data.content !== undefined) updateFields.content = data.content;
      if (data.category_id !== undefined) updateFields.category_id = data.category_id;
      if (data.image_url !== undefined) updateFields.image_url = data.image_url;
      if (data.media_urls !== undefined) updateFields.media_urls = data.media_urls;
      if (data.hashtags !== undefined) updateFields.hashtags = data.hashtags;
      updateFields.edited_at = new Date().toISOString();

      const { data: updated, error } = await supabase
        .from('forum_posts')
        .update(updateFields)
        .eq('id', postId)
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, scanner_tier, role),
          category:forum_categories(id, name, color)
        `)
        .single();

      if (error) throw error;
      return updated;
    } catch (error) {
      console.error('updatePost error:', error);
      throw error;
    }
  }

  /**
   * Get edit history for a post
   * @param {string} postId
   * @returns {Array}
   */
  async getEditHistory(postId) {
    try {
      const { data, error } = await supabase
        .from('post_edit_history')
        .select(`
          *,
          editor:profiles(id, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('getEditHistory error:', error);
      return [];
    }
  }

  // ─── SCHEDULED POSTS ──────────────────────────────────────────────

  /**
   * Schedule a post for future publishing
   * @param {Object} data - { title, content, category_id, user_id, scheduled_at, image_url, media_urls, hashtags }
   * @returns {Object} Created scheduled post
   */
  async schedulePost(data) {
    try {
      const { data: scheduled, error } = await supabase
        .from('scheduled_posts')
        .insert({
          title: data.title || '',
          content: data.content,
          category_id: data.category_id,
          user_id: data.user_id,
          scheduled_at: data.scheduled_at,
          image_url: data.image_url || null,
          media_urls: data.media_urls || null,
          hashtags: data.hashtags || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return scheduled;
    } catch (error) {
      console.error('schedulePost error:', error);
      throw error;
    }
  }

  /**
   * Get user's scheduled posts
   * @param {string} userId
   * @returns {Array}
   */
  async getScheduledPosts(userId) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('getScheduledPosts error:', error);
      return [];
    }
  }

  /**
   * Delete a scheduled post
   * @param {string} id
   */
  async deleteScheduledPost(id) {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('deleteScheduledPost error:', error);
      throw error;
    }
  }

  /**
   * Publish a scheduled post immediately — moves it to forum_posts
   * @param {string} id - scheduled_posts id
   * @returns {Object} Created forum post
   */
  async publishScheduledPost(id) {
    try {
      // Fetch the scheduled post
      const { data: sp, error: fetchErr } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('id', id)
        .single();
      if (fetchErr) throw fetchErr;

      // Insert into forum_posts
      const { data: post, error: insertErr } = await supabase
        .from('forum_posts')
        .insert({
          title: sp.title,
          content: sp.content,
          category_id: sp.category_id,
          user_id: sp.user_id,
          image_url: sp.image_url,
          media_urls: sp.media_urls,
          hashtags: sp.hashtags,
          status: 'published',
        })
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, scanner_tier, role)
        `)
        .single();
      if (insertErr) throw insertErr;

      // Mark scheduled as published
      await supabase
        .from('scheduled_posts')
        .update({ status: 'published' })
        .eq('id', id);

      return post;
    } catch (error) {
      console.error('publishScheduledPost error:', error);
      throw error;
    }
  }

  // ─── POST ANALYTICS ───────────────────────────────────────────────

  /**
   * Get analytics for a post — views, reactions breakdown, engagement
   * @param {string} postId
   * @returns {Object} { views, uniqueViews, reactions, interactions, engagement }
   */
  async getPostAnalytics(postId) {
    try {
      // Fetch all in parallel
      const [viewsRes, reactionsRes, interactionsRes, postRes] = await Promise.all([
        supabase
          .from('post_views')
          .select('id, user_id, created_at', { count: 'exact' })
          .eq('post_id', postId),
        supabase
          .from('post_reactions')
          .select('type')
          .eq('post_id', postId),
        supabase
          .from('post_interactions')
          .select('type')
          .eq('post_id', postId),
        supabase
          .from('forum_posts')
          .select('likes_count, comments_count, reposts_count, shares_count, views_count')
          .eq('id', postId)
          .single(),
      ]);

      // View counts
      const views = viewsRes.count || 0;
      const uniqueViewers = new Set((viewsRes.data || []).filter(v => v.user_id).map(v => v.user_id));
      const uniqueViews = uniqueViewers.size;

      // Reaction breakdown
      const reactionBreakdown = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
      (reactionsRes.data || []).forEach(r => { reactionBreakdown[r.type] = (reactionBreakdown[r.type] || 0) + 1; });
      const totalReactions = Object.values(reactionBreakdown).reduce((s, n) => s + n, 0);

      // Interaction breakdown
      const interactionBreakdown = {};
      (interactionsRes.data || []).forEach(i => { interactionBreakdown[i.type] = (interactionBreakdown[i.type] || 0) + 1; });

      const post = postRes.data || {};
      const engagement = views > 0
        ? ((totalReactions + (post.comments_count || 0) + (post.shares_count || 0)) / views * 100).toFixed(1)
        : '0.0';

      return {
        views,
        uniqueViews,
        reactions: { breakdown: reactionBreakdown, total: totalReactions },
        interactions: interactionBreakdown,
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        reposts: post.reposts_count || 0,
        shares: post.shares_count || 0,
        engagementRate: parseFloat(engagement),
      };
    } catch (error) {
      console.error('getPostAnalytics error:', error);
      return { views: 0, uniqueViews: 0, reactions: { breakdown: {}, total: 0 }, interactions: {}, engagementRate: 0 };
    }
  }

  // ─── HASHTAGS ──────────────────────────────────────────────────────

  /**
   * Get posts by hashtag with pagination
   * @param {string} hashtag - without #
   * @param {number} page
   * @param {number} limit
   * @returns {{ posts: Array, total: number, page: number, totalPages: number }}
   */
  async getPostsByHashtag(hashtag, page = 1, limit = 20) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, scanner_tier, role),
          category:forum_categories(id, name, color)
        `, { count: 'exact' })
        .eq('status', 'published')
        .contains('hashtags', [hashtag])
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return {
        posts: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('getPostsByHashtag error:', error);
      return { posts: [], total: 0, page, totalPages: 0 };
    }
  }

  // ─── PIN / HIDE / BOOST ────────────────────────────────────────────

  /**
   * Pin a post (admin/moderator action)
   * @param {string} postId
   * @param {string} userId - who pinned
   */
  async pinPost(postId, userId) {
    try {
      const { error } = await supabase
        .from('pinned_posts')
        .insert({ post_id: postId, pinned_by: userId });
      if (error) throw error;
    } catch (error) {
      console.error('pinPost error:', error);
      throw error;
    }
  }

  /**
   * Unpin a post
   * @param {string} postId
   */
  async unpinPost(postId) {
    try {
      const { error } = await supabase
        .from('pinned_posts')
        .delete()
        .eq('post_id', postId);
      if (error) throw error;
    } catch (error) {
      console.error('unpinPost error:', error);
      throw error;
    }
  }

  /**
   * Hide a post for a user
   * @param {string} postId
   * @param {string} userId
   */
  async hidePost(postId, userId) {
    try {
      const { error } = await supabase
        .from('hidden_posts')
        .insert({ post_id: postId, user_id: userId });
      if (error) throw error;
    } catch (error) {
      console.error('hidePost error:', error);
      throw error;
    }
  }

  /**
   * Boost a post (paid promotion)
   * @param {string} postId
   * @param {Object} data - { user_id, gems_spent, duration_hours, target_audience }
   * @returns {Object} Created boost
   */
  async boostPost(postId, data) {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (data.duration_hours || 24));

      const { data: boost, error } = await supabase
        .from('post_boosts')
        .insert({
          post_id: postId,
          user_id: data.user_id,
          gems_spent: data.gems_spent || 0,
          duration_hours: data.duration_hours || 24,
          target_audience: data.target_audience || null,
          expires_at: expiresAt.toISOString(),
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return boost;
    } catch (error) {
      console.error('boostPost error:', error);
      throw error;
    }
  }

  // ─── VIEW TRACKING ─────────────────────────────────────────────────

  /**
   * Record a post view (deduplication handled by unique constraint on table)
   * @param {string} postId
   * @param {string|null} userId
   * @param {string|null} fingerprint - for anonymous views
   */
  async recordView(postId, userId, fingerprint = null) {
    try {
      const { error } = await supabase
        .from('post_views')
        .insert({
          post_id: postId,
          user_id: userId || null,
          fingerprint: fingerprint || null,
        });
      // Ignore unique constraint violations — means already viewed
      if (error && !error.message?.includes('duplicate')) throw error;
    } catch (error) {
      console.error('recordView error:', error);
    }
  }

  // ─── FOLLOW SYSTEM ─────────────────────────────────────────────────

  /**
   * Get followers of a user
   * @param {string} userId
   * @returns {Array<{ follower_id, created_at, follower: { id, full_name, avatar_url } }>}
   */
  async getFollowers(userId) {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          follower_id, created_at,
          follower:profiles!user_follows_follower_id_fkey(id, full_name, avatar_url, scanner_tier)
        `)
        .eq('following_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('getFollowers error:', error);
      return [];
    }
  }

  /**
   * Get users that a user is following
   * @param {string} userId
   * @returns {Array}
   */
  async getFollowing(userId) {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          following_id, created_at,
          following:profiles!user_follows_following_id_fkey(id, full_name, avatar_url, scanner_tier)
        `)
        .eq('follower_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('getFollowing error:', error);
      return [];
    }
  }

  /**
   * Toggle follow/unfollow a user
   * @param {string} targetUserId - user to follow/unfollow
   * @param {string} currentUserId
   * @returns {{ following: boolean }}
   */
  async toggleFollow(targetUserId, currentUserId) {
    try {
      if (targetUserId === currentUserId) throw new Error('Cannot follow yourself');

      const { data: existing } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return { following: false };
      }

      const { error } = await supabase
        .from('user_follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId });
      if (error) throw error;
      return { following: true };
    } catch (error) {
      console.error('toggleFollow error:', error);
      throw error;
    }
  }
}

export const forumService = new ForumService();
export default forumService;
