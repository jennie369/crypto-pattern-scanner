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
}

export const forumService = new ForumService();
export default forumService;
