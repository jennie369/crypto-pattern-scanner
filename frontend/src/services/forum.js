/**
 * Forum Service
 * Community forum backend service
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
   * Create a new thread
   * @param {Object} data - Thread data
   * @param {string} data.title - Thread title
   * @param {string} data.content - Thread content
   * @param {string} data.category - Category ID
   * @param {string} data.authorId - User ID
   * @param {Array} data.tags - Optional tags
   * @returns {Promise<Object>} Created thread
   */
  async createThread(data) {
    const { data: thread, error } = await supabase
      .from('forum_threads')
      .insert({
        title: data.title,
        content: data.content,
        category: data.category,
        author_id: data.authorId,
        tags: data.tags || []
      })
      .select(`
        *,
        author:users!forum_threads_author_id_fkey(id, full_name, avatar_url, scanner_tier)
      `)
      .single();

    if (error) throw error;
    return thread;
  }

  /**
   * Get threads with pagination and filtering
   * @param {Object} options - Query options
   * @param {string} options.category - Filter by category
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.sortBy - Sort method
   * @returns {Promise<Object>} Threads and pagination info
   */
  async getThreads({ category, page = 1, limit = 20, sortBy = 'recent' }) {
    let query = supabase
      .from('forum_threads')
      .select(`
        *,
        author:users!forum_threads_author_id_fkey(id, full_name, avatar_url, scanner_tier)
      `, { count: 'exact' });

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Sorting
    if (sortBy === 'recent') {
      query = query.order('updated_at', { ascending: false });
    } else if (sortBy === 'popular') {
      query = query.order('view_count', { ascending: false });
    } else if (sortBy === 'unanswered') {
      query = query.eq('is_answered', false).order('created_at', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    return {
      threads: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Get thread details with replies
   * @param {string} threadId - Thread UUID
   * @returns {Promise<Object>} Thread with replies
   */
  async getThread(threadId) {
    const { data, error } = await supabase
      .from('forum_threads')
      .select(`
        *,
        author:users!forum_threads_author_id_fkey(id, full_name, avatar_url, scanner_tier),
        replies:forum_replies(
          *,
          author:users!forum_replies_author_id_fkey(id, full_name, avatar_url, scanner_tier)
        )
      `)
      .eq('id', threadId)
      .single();

    if (error) throw error;

    // Increment view count (fire and forget)
    supabase
      .from('forum_threads')
      .update({ view_count: (data?.view_count || 0) + 1 })
      .eq('id', threadId)
      .then(() => {});

    return data;
  }

  /**
   * Create a reply to a thread
   * @param {Object} data - Reply data
   * @param {string} data.threadId - Thread UUID
   * @param {string} data.content - Reply content
   * @param {string} data.authorId - User ID
   * @param {string} data.parentId - Parent reply ID for nesting (optional)
   * @returns {Promise<Object>} Created reply
   */
  async createReply(data) {
    const { data: reply, error } = await supabase
      .from('forum_replies')
      .insert({
        thread_id: data.threadId,
        content: data.content,
        author_id: data.authorId,
        parent_id: data.parentId || null
      })
      .select(`
        *,
        author:users!forum_replies_author_id_fkey(id, full_name, avatar_url, scanner_tier)
      `)
      .single();

    if (error) throw error;

    return reply;
  }

  /**
   * Toggle like on thread or reply
   * @param {string} type - 'thread' or 'reply'
   * @param {string} id - Thread or reply UUID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Like status
   */
  async toggleLike(type, id, userId) {
    const table = type === 'thread' ? 'forum_thread_likes' : 'forum_reply_likes';
    const column = type === 'thread' ? 'thread_id' : 'reply_id';

    // Check if already liked
    const { data: existing } = await supabase
      .from(table)
      .select('id')
      .eq(column, id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Unlike
      await supabase
        .from(table)
        .delete()
        .eq('id', existing.id);

      return { liked: false };
    } else {
      // Like
      await supabase
        .from(table)
        .insert({ [column]: id, user_id: userId });

      return { liked: true };
    }
  }

  /**
   * Check if user has liked a thread/reply
   * @param {string} type - 'thread' or 'reply'
   * @param {string} id - Thread or reply UUID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if liked
   */
  async hasLiked(type, id, userId) {
    if (!userId) return false;

    const table = type === 'thread' ? 'forum_thread_likes' : 'forum_reply_likes';
    const column = type === 'thread' ? 'thread_id' : 'reply_id';

    const { data } = await supabase
      .from(table)
      .select('id')
      .eq(column, id)
      .eq('user_id', userId)
      .single();

    return !!data;
  }

  /**
   * Mark thread as solved
   * @param {string} threadId - Thread UUID
   * @param {string} replyId - Accepted reply UUID
   * @returns {Promise<void>}
   */
  async markAsSolved(threadId, replyId) {
    const { error } = await supabase
      .from('forum_threads')
      .update({
        is_answered: true,
        accepted_reply_id: replyId
      })
      .eq('id', threadId);

    if (error) throw error;
  }

  /**
   * Search threads by title or content
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching threads
   */
  async searchThreads(query) {
    const { data, error} = await supabase
      .from('forum_threads')
      .select(`
        *,
        author:users!forum_threads_author_id_fkey(id, full_name, avatar_url, scanner_tier)
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  /**
   * Delete a thread (only by author)
   * @param {string} threadId - Thread UUID
   * @returns {Promise<void>}
   */
  async deleteThread(threadId) {
    const { error } = await supabase
      .from('forum_threads')
      .delete()
      .eq('id', threadId);

    if (error) throw error;
  }

  /**
   * Delete a reply (only by author)
   * @param {string} replyId - Reply UUID
   * @returns {Promise<void>}
   */
  async deleteReply(replyId) {
    const { error } = await supabase
      .from('forum_replies')
      .delete()
      .eq('id', replyId);

    if (error) throw error;
  }

  /**
   * Update thread
   * @param {string} threadId - Thread UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated thread
   */
  async updateThread(threadId, updates) {
    const { data, error } = await supabase
      .from('forum_threads')
      .update(updates)
      .eq('id', threadId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update reply
   * @param {string} replyId - Reply UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated reply
   */
  async updateReply(replyId, updates) {
    const { data, error } = await supabase
      .from('forum_replies')
      .update(updates)
      .eq('id', replyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get trending topics (most liked/commented posts from last 7 days)
   * @param {number} limit - Number of topics to return (default: 5)
   * @returns {Promise<Array>} Trending topics
   */
  async getTrendingTopics(limit = 5) {
    // Get date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('forum_threads')
      .select(`
        id,
        title,
        like_count,
        reply_count,
        view_count,
        created_at
      `)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('like_count', { ascending: false })
      .order('reply_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get suggested creators (top contributors by posts and likes)
   * @param {number} limit - Number of creators to return (default: 5)
   * @returns {Promise<Array>} Top creators with stats
   */
  async getSuggestedCreators(limit = 5) {
    const { data, error } = await supabase
      .rpc('get_top_creators', { result_limit: limit });

    if (error) {
      console.warn('get_top_creators RPC failed, using fallback query:', error);

      // Fallback: Get users who have posted recently
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('forum_threads')
        .select(`
          author_id,
          author:users!forum_threads_author_id_fkey(
            id,
            full_name,
            avatar_url,
            scanner_tier
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (fallbackError) throw fallbackError;

      // Group by author and count posts
      const authorMap = new Map();

      fallbackData?.forEach((thread) => {
        if (thread.author) {
          const authorId = thread.author.id;
          if (authorMap.has(authorId)) {
            authorMap.get(authorId).post_count++;
          } else {
            authorMap.set(authorId, {
              id: thread.author.id,
              display_name: thread.author.full_name,
              avatar_url: thread.author.avatar_url,
              scanner_tier: thread.author.scanner_tier,
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
   * @returns {Promise<number>} Number of online users
   */
  async getOnlineUsersCount() {
    // This would require a presence system (e.g., Supabase Realtime)
    // For now, return a mock count
    // TODO: Implement real-time presence tracking
    return Math.floor(Math.random() * 50) + 10;
  }

  /**
   * Get top forum members by contribution
   * @param {number} limit - Number of members to return (default: 10)
   * @returns {Promise<Array>} Top members
   */
  async getTopMembers(limit = 10) {
    // Reuse getSuggestedCreators for now
    return this.getSuggestedCreators(limit);
  }
}

export const forumService = new ForumService();
export default forumService;
