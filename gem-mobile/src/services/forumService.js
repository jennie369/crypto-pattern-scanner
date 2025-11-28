/**
 * Gemral - Forum Service
 * Handles all forum-related API calls
 * COMPLETE IMPLEMENTATION
 */

import { supabase } from './supabase';

// Keyword mapping for feed filtering - Gemral Philosophy
// Posts containing these keywords/hashtags will be shown in respective feeds
const FEED_KEYWORDS = {
  // Trading Track 🎯
  'trading': ['trading', 'giao dịch', 'btc', 'eth', 'crypto', 'forex', 'coin', 'market', 'thị trường', 'buy', 'sell', 'mua', 'bán', 'long', 'short', 'entry', 'tp', 'sl', '#trading', '#giaodich'],
  'patterns': ['pattern', 'mẫu hình', 'head shoulder', 'đầu vai', 'triangle', 'tam giác', 'wedge', 'nêm', 'channel', 'kênh', 'breakout', 'support', 'resistance', 'fibonacci', 'indicator', '#pattern', '#gemmethod'],
  'results': ['profit', 'lợi nhuận', 'loss', 'lỗ', 'P/L', 'ROI', 'win', 'lose', 'thắng', 'thua', 'kết quả', 'result', '+%', '-%', '#tradingresult', '#ketqua'],

  // Wellness Track ☯️
  'wellness': ['crystal', 'đá quý', 'tinh thể', 'năng lượng', 'energy', 'healing', 'chữa lành', 'thạch anh', 'amethyst', 'citrine', 'rose quartz', 'jade', 'chakra', '#crystal', '#daquy', '#healing'],
  'meditation': ['thiền', 'meditation', 'mindfulness', 'chánh niệm', 'breath', 'thở', 'relax', 'thư giãn', 'calm', 'bình an', 'yoga', '#meditation', '#thien', '#mindfulness'],
  'growth': ['phát triển', 'growth', 'personal', 'bản thân', 'học hỏi', 'learning', 'improve', 'cải thiện', 'habit', 'thói quen', 'success', 'thành công', 'motivation', 'động lực', '#personalgrowth', '#phattrienbanThan'],

  // Integration Track 🌟
  'mindful-trading': ['chánh niệm', 'mindful', 'tâm lý', 'psychology', 'emotion', 'cảm xúc', 'discipline', 'kỷ luật', 'patience', 'kiên nhẫn', 'balance', 'cân bằng', 'stress', 'áp lực', '#mindfultrading', '#chanhniem'],
  'sieu-giau': ['giàu', 'rich', 'wealthy', 'thành công', 'success', 'câu chuyện', 'story', 'tỷ phú', 'triệu phú', 'abundance', 'thịnh vượng', 'đột phá', 'breakthrough', '#success', '#sieugiau', '#thanhcong'],

  // Earn Track 💰
  'earn': ['kiếm tiền', 'affiliate', 'cộng tác', 'CTV', 'hoa hồng', 'commission', 'referral', 'giới thiệu', 'income', 'thu nhập', 'passive', '#affiliate', '#kiemtien', '#CTV'],
};

// Topic keywords for dropdown filter (GIAO DỊCH, TINH THẦN, THỊNH VƯỢNG)
const TOPIC_KEYWORDS = {
  'giao-dich': [
    'trading', 'giao dịch', 'btc', 'eth', 'crypto', 'forex', 'coin', 'market', 'thị trường',
    'buy', 'sell', 'mua', 'bán', 'long', 'short', 'entry', 'tp', 'sl', 'profit', 'loss',
    'pattern', 'mẫu hình', 'indicator', 'chart', 'phân tích', 'kỹ thuật', 'futures',
    '#trading', '#giaodich', '#crypto', '#forex'
  ],
  'tinh-than': [
    'crystal', 'đá quý', 'tinh thể', 'năng lượng', 'energy', 'healing', 'chữa lành',
    'thạch anh', 'amethyst', 'citrine', 'chakra', 'thiền', 'meditation', 'mindfulness',
    'chánh niệm', 'breath', 'thở', 'relax', 'thư giãn', 'yoga', 'tâm linh', 'spirituality',
    '#crystal', '#healing', '#meditation', '#thien'
  ],
  'thinh-vuong': [
    'thịnh vượng', 'abundance', 'mindful trading', 'tâm lý giao dịch', 'psychology',
    'emotion', 'cảm xúc', 'discipline', 'kỷ luật', 'patience', 'kiên nhẫn',
    'thành công', 'success', 'phát triển bản thân', 'balance',
    'personal growth', 'chánh niệm trading', '#mindfultrading', '#thinhvuong'
  ],
};

export const forumService = {
  /**
   * Get all forum categories
   */
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  /**
   * Get posts with optional filters including feed type
   * Feed types: explore, following, news, notifications, popular
   * Now includes user_liked status for current user
   */
  async getPosts(filters = {}) {
    try {
      const { category, feed = 'explore', page = 1, limit = 20, search, topic } = filters;

      // Get current user for personalized feeds
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges),
          category:forum_categories(id, name, color),
          likes:forum_likes(user_id),
          saved:forum_saved(user_id)
        `)
        .eq('status', 'published');

      // Apply feed type specific logic
      switch (feed) {
        case 'following':
          // Posts from followed users only
          if (user) {
            const { data: following } = await supabase
              .from('user_follows')
              .select('following_id')
              .eq('follower_id', user.id);

            const followingIds = following?.map(f => f.following_id) || [];
            if (followingIds.length > 0) {
              query = query.in('user_id', followingIds);
            } else {
              return []; // No following = no posts
            }
          } else {
            return []; // Not logged in = no following posts
          }
          query = query.order('created_at', { ascending: false });
          break;

        case 'news':
          // Admin posts only (tin tuc) - filter by feed_type or pinned posts
          // Until is_admin_post column exists, use feed_type = 'news' or is_pinned
          query = query
            .eq('feed_type', 'news')
            .order('created_at', { ascending: false });
          break;

        case 'notifications':
          // Admin/system announcements - filter by feed_type = 'announcement'
          query = query
            .eq('feed_type', 'announcement')
            .order('created_at', { ascending: false });
          break;

        case 'popular':
          // Top posts by likes + comments with ranking
          query = query
            .order('likes_count', { ascending: false })
            .order('comments_count', { ascending: false })
            .order('created_at', { ascending: false });
          break;

        case 'academy':
          // Admin posts about courses, professional knowledge
          // Until is_admin_post column exists, use feed_type = 'academy'
          query = query
            .eq('feed_type', 'academy')
            .order('created_at', { ascending: false });
          break;

        // ==== SIDEMENU FEED CATEGORIES (with keyword filtering) ====
        // Trading Track
        case 'trading':
        case 'patterns':
        case 'results':
        // Wellness Track
        case 'wellness':
        case 'meditation':
        case 'growth':
        // Integration Track
        case 'mindful-trading':
        case 'sieu-giau':
        // Earn Track
        case 'earn': {
          // Apply keyword filtering from FEED_KEYWORDS
          const feedKeywords = FEED_KEYWORDS[feed];
          if (feedKeywords && feedKeywords.length > 0) {
            const keywordFilters = feedKeywords.map(keyword =>
              `title.ilike.%${keyword}%,content.ilike.%${keyword}%`
            ).join(',');
            query = query.or(keywordFilters);
          }
          query = query.order('created_at', { ascending: false });
          break;
        }

        case 'explore':
        default:
          // Personalized feed: mix of new + trending + user behavior
          // Order by: recent posts with engagement boost
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Apply topic filter (GIAO DICH, TINH THAN, CAN BANG)
      if (topic) {
        const topicKeywords = TOPIC_KEYWORDS[topic];
        if (topicKeywords && topicKeywords.length > 0) {
          const keywordFilters = topicKeywords.map(keyword =>
            `title.ilike.%${keyword}%,content.ilike.%${keyword}%`
          ).join(',');
          query = query.or(keywordFilters);
        }
      }

      // Apply category filter (legacy support)
      if (category) {
        query = query.eq('category_id', category);
      }

      // Apply search filter
      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      // Apply pagination
      query = query.range((page - 1) * limit, page * limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      // Deduplicate posts (can happen with OR keyword filters matching multiple times)
      const uniquePosts = [];
      const seenIds = new Set();
      for (const post of (data || [])) {
        if (!seenIds.has(post.id)) {
          seenIds.add(post.id);
          uniquePosts.push(post);
        }
      }

      // Transform data to include user_liked and user_saved status
      const transformedPosts = uniquePosts.map((post) => {
        // Check if current user liked/saved this post
        const user_liked = currentUserId
          ? post.likes?.some(like => like.user_id === currentUserId)
          : false;
        const user_saved = currentUserId
          ? post.saved?.some(save => save.user_id === currentUserId)
          : false;

        return {
          ...post,
          user_liked,
          user_saved,
          likes_count: post.likes_count || post.likes?.length || 0,
        };
      });

      // Add ranking badges for popular feed
      if (feed === 'popular') {
        return transformedPosts.map((post, index) => ({
          ...post,
          popularRank: (page - 1) * limit + index + 1,
        }));
      }

      return transformedPosts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  /**
   * Get liked posts by current user
   */
  async getLikedPosts(page = 1, limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('forum_likes')
        .select(`
          post:forum_posts(
            *,
            author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges),
            category:forum_categories(id, name, color)
          )
        `)
        .eq('user_id', user.id)
        .not('post_id', 'is', null)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      return data?.map(item => item.post).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching liked posts:', error);
      return [];
    }
  },

  /**
   * Get saved/bookmarked posts by current user
   */
  async getSavedPosts(page = 1, limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('forum_saved')
        .select(`
          post:forum_posts(
            *,
            author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges),
            category:forum_categories(id, name, color)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      return data?.map(item => item.post).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      return [];
    }
  },

  /**
   * Save/bookmark a post with duplicate check
   */
  async savePost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('[Forum] Saving post:', postId);

      // Check if already saved (prevent duplicates)
      const { data: existing } = await supabase
        .from('forum_saved')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        console.log('[Forum] Already saved, skipping');
        return { success: true, alreadySaved: true };
      }

      const { error } = await supabase
        .from('forum_saved')
        .insert({
          post_id: postId,
          user_id: user.id,
        });

      if (error) throw error;
      console.log('[Forum] ✅ Post saved');
      return { success: true };
    } catch (error) {
      console.error('[Forum] Save error:', error);
      return { success: false, error };
    }
  },

  /**
   * Unsave/remove bookmark from a post
   */
  async unsavePost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('[Forum] Unsaving post:', postId);

      const { error } = await supabase
        .from('forum_saved')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      console.log('[Forum] ✅ Post unsaved');
      return { success: true };
    } catch (error) {
      console.error('[Forum] Unsave error:', error);
      return { success: false, error };
    }
  },

  /**
   * Check if post is saved by current user
   */
  async isPostSaved(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('forum_saved')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  },

  /**
   * Check if post is liked by current user
   */
  async isPostLiked(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get single post by ID
   */
  async getPostById(postId) {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges),
          category:forum_categories(id, name, color),
          comments:forum_comments(
            *,
            author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges)
          )
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  },

  /**
   * Upload post image to Supabase storage
   * Uses base64 encoding for more reliable uploads on mobile
   */
  async uploadPostImage(uri) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('[Forum] Uploading image:', uri);

      // Create unique filename
      const timestamp = Date.now();
      const filename = `posts/${user.id}/${timestamp}.jpg`;

      // Fetch the image
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      // Convert to ArrayBuffer then to Uint8Array for reliable upload
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      console.log('[Forum] Image size:', uint8Array.length, 'bytes');

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('forum-images')
        .upload(filename, uint8Array, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('[Forum] Upload error:', error);
        // If bucket doesn't exist, try with different bucket name
        if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
          console.log('[Forum] Trying fallback bucket...');
          const { data: fallbackData, error: fallbackError } = await supabase.storage
            .from('avatars') // Fallback to avatars bucket which usually exists
            .upload(`forum/${filename}`, uint8Array, {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (fallbackError) {
            console.error('[Forum] Fallback upload error:', fallbackError);
            throw fallbackError;
          }

          const { data: fallbackUrl } = supabase.storage
            .from('avatars')
            .getPublicUrl(`forum/${filename}`);

          console.log('[Forum] ✅ Image uploaded to fallback:', fallbackUrl.publicUrl);
          return { success: true, url: fallbackUrl.publicUrl };
        }
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('forum-images')
        .getPublicUrl(filename);

      console.log('[Forum] ✅ Image uploaded:', urlData.publicUrl);
      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('[Forum] Upload image error:', error);
      return { success: false, error: error.message || error };
    }
  },

  /**
   * Upload multiple images to Supabase storage
   * @param {Array<string>} imageUris - Array of local image URIs
   * @returns {Object} - { success, urls: string[], errors: any[] }
   */
  async uploadMultipleImages(imageUris) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!imageUris || imageUris.length === 0) {
        return { success: true, urls: [], errors: [] };
      }

      console.log('[Forum] Uploading multiple images:', imageUris.length);

      const uploadPromises = imageUris.map(async (uri, index) => {
        try {
          // Skip URLs (already uploaded)
          if (uri.startsWith('http')) {
            return { success: true, url: uri };
          }

          const timestamp = Date.now();
          const filename = `posts/${user.id}/${timestamp}_${index}.jpg`;

          const response = await fetch(uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch image ${index}: ${response.status}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          const { data, error } = await supabase.storage
            .from('forum-images')
            .upload(filename, uint8Array, {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (error) {
            // Try fallback bucket
            const { data: fallbackData, error: fallbackError } = await supabase.storage
              .from('avatars')
              .upload(`forum/${filename}`, uint8Array, {
                contentType: 'image/jpeg',
                upsert: true,
              });

            if (fallbackError) throw fallbackError;

            const { data: fallbackUrl } = supabase.storage
              .from('avatars')
              .getPublicUrl(`forum/${filename}`);

            return { success: true, url: fallbackUrl.publicUrl };
          }

          const { data: urlData } = supabase.storage
            .from('forum-images')
            .getPublicUrl(filename);

          return { success: true, url: urlData.publicUrl };
        } catch (error) {
          console.error(`[Forum] Upload error for image ${index}:`, error);
          return { success: false, error: error.message };
        }
      });

      const results = await Promise.all(uploadPromises);
      const urls = results.filter(r => r.success).map(r => r.url);
      const errors = results.filter(r => !r.success).map(r => r.error);

      console.log(`[Forum] ✅ Uploaded ${urls.length}/${imageUris.length} images`);

      return {
        success: urls.length > 0,
        urls,
        errors,
      };
    } catch (error) {
      console.error('[Forum] Upload multiple images error:', error);
      return { success: false, urls: [], errors: [error.message] };
    }
  },

  /**
   * Create a new post
   */
  async createPost(post) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          ...post,
          user_id: user.id,
          feed_type: post.feed_type || 'general',
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating post:', error);
      return { data: null, error };
    }
  },

  /**
   * Update an existing post
   * SECURITY: Only post author can update
   * Saves edit history before updating
   */
  async updatePost(postId, userId, updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Security check: Only author can update
      const { data: existingPost, error: fetchError } = await supabase
        .from('forum_posts')
        .select('id, user_id, title, content')
        .eq('id', postId)
        .single();

      if (fetchError || !existingPost) {
        console.error('[Forum] Post not found:', postId);
        return { success: false, error: 'Post not found' };
      }

      if (existingPost.user_id !== user.id) {
        console.error('[Forum] Unauthorized edit attempt');
        return { success: false, error: 'Unauthorized' };
      }

      // Save edit history (if table exists)
      try {
        await supabase
          .from('post_edit_history')
          .insert({
            post_id: postId,
            title_before: existingPost.title,
            content_before: existingPost.content,
            title_after: updates.title,
            content_after: updates.content,
            edited_by: user.id,
          });
        console.log('[Forum] Edit history saved');
      } catch (historyError) {
        // Table might not exist yet, continue with update
        console.log('[Forum] Edit history table not available, skipping');
      }

      // Update the post with edited_at timestamp
      const { data, error } = await supabase
        .from('forum_posts')
        .update({
          title: updates.title,
          content: updates.content,
          topic: updates.topic,
          image_url: updates.image_url,
          feed_type: updates.feed_type,
          edited_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('[Forum] Update error:', error);
        throw error;
      }

      console.log('[Forum] Post updated successfully:', postId);
      return { success: true, data };
    } catch (error) {
      console.error('[Forum] Update post error:', error);
      return { success: false, error: error.message || error };
    }
  },

  /**
   * Delete a post
   * SECURITY: Only post author can delete
   */
  async deletePost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Security check: Only author can delete
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) {
        console.error('[Forum] Delete error:', error);
        throw error;
      }

      console.log('[Forum] Post deleted successfully:', postId);
      return { success: true };
    } catch (error) {
      console.error('[Forum] Delete post error:', error);
      return { success: false, error: error.message || error };
    }
  },

  /**
   * Like a post with duplicate check
   */
  async likePost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('[Forum] Liking post:', postId);

      // Check if already liked (prevent duplicates)
      const { data: existing } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        console.log('[Forum] Already liked, skipping');
        return { success: true, alreadyLiked: true };
      }

      // Insert new like
      const { error } = await supabase
        .from('forum_likes')
        .insert({
          post_id: postId,
          user_id: user.id,
        });

      if (error) throw error;

      // Get post info for notification
      const { data: post } = await supabase
        .from('forum_posts')
        .select('id, title, user_id')
        .eq('id', postId)
        .single();

      // Create notification for post owner
      if (post && post.user_id !== user.id) {
        await this.createNotification({
          recipientId: post.user_id,
          type: 'like',
          title: 'Thích bài viết',
          body: `đã thích bài viết "${post.title?.substring(0, 30)}${post.title?.length > 30 ? '...' : ''}"`,
          data: { postId },
        });
      }

      console.log('[Forum] ✅ Post liked');
      return { success: true };
    } catch (error) {
      console.error('[Forum] Like error:', error);
      return { success: false, error };
    }
  },

  /**
   * Unlike a post
   */
  async unlikePost(postId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('[Forum] Unliking post:', postId);

      const { error } = await supabase
        .from('forum_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('[Forum] ✅ Post unliked');
      return { success: true };
    } catch (error) {
      console.error('[Forum] Unlike error:', error);
      return { success: false, error };
    }
  },

  /**
   * Add a comment to a post
   */
  async createComment(postId, content, parentId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const commentData = {
        post_id: postId,
        user_id: user.id,
        content,
      };

      // Add parent_id for replies
      if (parentId) {
        commentData.parent_id = parentId;
      }

      const { data, error } = await supabase
        .from('forum_comments')
        .insert(commentData)
        .select('*')
        .single();

      if (error) throw error;

      // Get post info for notification
      const { data: post } = await supabase
        .from('forum_posts')
        .select('id, title, user_id')
        .eq('id', postId)
        .single();

      // Create notification
      if (parentId) {
        // Reply notification - notify parent comment author
        const { data: parentComment } = await supabase
          .from('forum_comments')
          .select('user_id')
          .eq('id', parentId)
          .single();

        if (parentComment && parentComment.user_id !== user.id) {
          await this.createNotification({
            recipientId: parentComment.user_id,
            type: 'reply',
            title: 'Trả lời bình luận',
            body: `đã trả lời bình luận của bạn: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
            data: { postId, commentId: data.id },
          });
        }
      } else {
        // Comment notification - notify post owner
        if (post && post.user_id !== user.id) {
          await this.createNotification({
            recipientId: post.user_id,
            type: 'comment',
            title: 'Bình luận mới',
            body: `đã bình luận: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
            data: { postId, commentId: data.id },
          });
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error creating comment:', error);
      return { data: null, error };
    }
  },

  /**
   * Get comments with replies for a post
   */
  async getCommentsWithReplies(postId) {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          *,
          author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments into threads
      const commentMap = new Map();
      const rootComments = [];

      // First pass: create map
      (data || []).forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      // Second pass: organize into hierarchy
      (data || []).forEach(comment => {
        const commentWithReplies = commentMap.get(comment.id);
        if (comment.parent_id && commentMap.has(comment.parent_id)) {
          // This is a reply, add to parent
          commentMap.get(comment.parent_id).replies.push(commentWithReplies);
        } else {
          // This is a root comment
          rootComments.push(commentWithReplies);
        }
      });

      return rootComments;
    } catch (error) {
      console.error('[Forum] Get comments error:', error);
      return [];
    }
  },

  // ==========================================
  // FOLLOW SYSTEM
  // ==========================================

  /**
   * Follow a user
   */
  async followUser(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userId,
        });

      if (error) throw error;

      // Create follow notification
      if (userId !== user.id) {
        await this.createNotification({
          recipientId: userId,
          type: 'follow',
          title: 'Người theo dõi mới',
          body: 'đã bắt đầu theo dõi bạn',
          data: {},
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error following user:', error);
      return { success: false, error };
    }
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return { success: false, error };
    }
  },

  /**
   * Check if following a user
   */
  async isFollowing(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get followers count
   */
  async getFollowersCount(userId) {
    try {
      const { count, error } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Get following count
   */
  async getFollowingCount(userId) {
    try {
      const { count, error } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, bio, username, created_at, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Forum] Get user profile error:', error);
      return null;
    }
  },

  /**
   * Get posts by user ID
   */
  async getUserPosts(userId, page = 1, limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges),
          category:forum_categories(id, name, color),
          likes:forum_likes(user_id),
          saved:forum_saved(user_id)
        `)
        .eq('user_id', userId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      // Transform with user_liked and user_saved
      return (data || []).map((post) => ({
        ...post,
        user_liked: currentUserId ? post.likes?.some(l => l.user_id === currentUserId) : false,
        user_saved: currentUserId ? post.saved?.some(s => s.user_id === currentUserId) : false,
        likes_count: post.likes_count || post.likes?.length || 0,
      }));
    } catch (error) {
      console.error('[Forum] Get user posts error:', error);
      return [];
    }
  },

  // ==========================================
  // CUSTOM FEEDS SYSTEM
  // ==========================================

  /**
   * Get all custom feeds for current user
   */
  async getCustomFeeds() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('custom_feeds')
        .select(`
          *,
          topics:custom_feed_topics(topic),
          profiles:custom_feed_profiles(profile_id)
        `)
        .eq('user_id', user.id)
        .order('sort_order');

      if (error) throw error;

      // Transform data to match app format
      return (data || []).map(feed => ({
        id: feed.id,
        name: feed.name,
        description: feed.description,
        isPublic: feed.is_public,
        sortOrder: feed.sort_order,
        topics: feed.topics?.map(t => t.topic) || [],
        profiles: feed.profiles?.map(p => ({ id: p.profile_id })) || [],
        createdAt: feed.created_at,
      }));
    } catch (error) {
      console.error('Error fetching custom feeds:', error);
      return [];
    }
  },

  /**
   * Create a new custom feed
   */
  async createCustomFeed(feedData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Create the feed
      const { data: feed, error: feedError } = await supabase
        .from('custom_feeds')
        .insert({
          user_id: user.id,
          name: feedData.name,
          description: feedData.description || '',
          is_public: feedData.isPublic || false,
        })
        .select()
        .single();

      if (feedError) throw feedError;

      // 2. Add topics if any
      if (feedData.topics && feedData.topics.length > 0) {
        const topicsToInsert = feedData.topics.map(topic => ({
          feed_id: feed.id,
          topic,
        }));

        const { error: topicsError } = await supabase
          .from('custom_feed_topics')
          .insert(topicsToInsert);

        if (topicsError) console.error('Error adding topics:', topicsError);
      }

      // 3. Add profiles if any
      if (feedData.profiles && feedData.profiles.length > 0) {
        const profilesToInsert = feedData.profiles.map(profile => ({
          feed_id: feed.id,
          profile_id: profile.id,
        }));

        const { error: profilesError } = await supabase
          .from('custom_feed_profiles')
          .insert(profilesToInsert);

        if (profilesError) console.error('Error adding profiles:', profilesError);
      }

      return {
        success: true,
        feed: {
          id: feed.id,
          name: feed.name,
          description: feed.description,
          isPublic: feed.is_public,
          topics: feedData.topics || [],
          profiles: feedData.profiles || [],
        },
      };
    } catch (error) {
      console.error('Error creating custom feed:', error);
      return { success: false, error };
    }
  },

  /**
   * Update a custom feed
   */
  async updateCustomFeed(feedId, feedData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Update the feed
      const { error: feedError } = await supabase
        .from('custom_feeds')
        .update({
          name: feedData.name,
          description: feedData.description,
          is_public: feedData.isPublic,
        })
        .eq('id', feedId)
        .eq('user_id', user.id);

      if (feedError) throw feedError;

      // 2. Update topics (delete all and re-insert)
      if (feedData.topics) {
        await supabase
          .from('custom_feed_topics')
          .delete()
          .eq('feed_id', feedId);

        if (feedData.topics.length > 0) {
          const topicsToInsert = feedData.topics.map(topic => ({
            feed_id: feedId,
            topic,
          }));

          await supabase
            .from('custom_feed_topics')
            .insert(topicsToInsert);
        }
      }

      // 3. Update profiles (delete all and re-insert)
      if (feedData.profiles) {
        await supabase
          .from('custom_feed_profiles')
          .delete()
          .eq('feed_id', feedId);

        if (feedData.profiles.length > 0) {
          const profilesToInsert = feedData.profiles.map(profile => ({
            feed_id: feedId,
            profile_id: profile.id,
          }));

          await supabase
            .from('custom_feed_profiles')
            .insert(profilesToInsert);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating custom feed:', error);
      return { success: false, error };
    }
  },

  /**
   * Delete a custom feed
   */
  async deleteCustomFeed(feedId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('custom_feeds')
        .delete()
        .eq('id', feedId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting custom feed:', error);
      return { success: false, error };
    }
  },

  /**
   * Reorder custom feeds
   */
  async reorderCustomFeeds(feedIds) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update sort_order for each feed
      const updates = feedIds.map((id, index) =>
        supabase
          .from('custom_feeds')
          .update({ sort_order: index })
          .eq('id', id)
          .eq('user_id', user.id)
      );

      await Promise.all(updates);
      return { success: true };
    } catch (error) {
      console.error('Error reordering feeds:', error);
      return { success: false, error };
    }
  },

  // ==========================================
  // IN-APP NOTIFICATIONS (Database)
  // ==========================================

  /**
   * Create in-app notification
   */
  async createNotification({ recipientId, type, title, body, data = {} }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Don't notify yourself
      if (recipientId === user.id) return;

      const { error } = await supabase
        .from('forum_notifications')
        .insert({
          user_id: recipientId,
          from_user_id: user.id,
          type,
          title,
          body,
          data,
          read: false,
        });

      if (error) {
        console.error('[Forum] Create notification error:', error);
      }
    } catch (error) {
      console.error('[Forum] Create notification error:', error);
    }
  },

  /**
   * Get notifications for current user
   */
  async getNotifications(page = 1, limit = 30) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First try with profiles join
      let { data, error } = await supabase
        .from('forum_notifications')
        .select(`
          *,
          from_user:from_user_id(id, full_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // If join fails, try without it
      if (error && (error.code === 'PGRST200' || error.message?.includes('relationship'))) {
        console.warn('[Forum] Notifications join failed, fetching without profile data');
        const fallback = await supabase
          .from('forum_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        data = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Forum] Get notifications error:', error);
      return [];
    }
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('forum_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('forum_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[Forum] Mark as read error:', error);
      return { success: false };
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };

      const { error } = await supabase
        .from('forum_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[Forum] Mark all as read error:', error);
      return { success: false };
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };

      const { error } = await supabase
        .from('forum_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[Forum] Delete notification error:', error);
      return { success: false };
    }
  },

  /**
   * Get unread notification count
   */
  async getUnreadNotificationCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('forum_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        // If table doesn't exist or column error, return 0 silently
        console.warn('[Forum] Get unread count warning:', error.message);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error('[Forum] Get unread count error:', error);
      return 0;
    }
  },

  /**
   * Get user stats (posts count, followers count, following count)
   */
  async getUserStats(userId) {
    try {
      // Get posts count
      const { count: postsCount, error: postsError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'published');

      if (postsError) console.error('[Forum] Get posts count error:', postsError);

      // Get followers count
      const { count: followersCount, error: followersError } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (followersError) console.error('[Forum] Get followers count error:', followersError);

      // Get following count
      const { count: followingCount, error: followingError } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (followingError) console.error('[Forum] Get following count error:', followingError);

      return {
        postsCount: postsCount || 0,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
      };
    } catch (error) {
      console.error('[Forum] Get user stats error:', error);
      return { postsCount: 0, followersCount: 0, followingCount: 0 };
    }
  },

  /**
   * Update current user's profile
   */
  async updateProfile(profileData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          username: profileData.username,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[Forum] Update profile error:', error);
      return { success: false, error };
    }
  },

  /**
   * Upload avatar to Supabase storage
   */
  async uploadAvatar(uri) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('[Forum] Uploading avatar:', uri);

      // Create unique filename
      const filename = `avatars/${user.id}/${Date.now()}.jpg`;

      // Fetch the image as blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('forum-images')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('[Forum] Upload avatar error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('forum-images')
        .getPublicUrl(filename);

      console.log('[Forum] Avatar uploaded:', urlData.publicUrl);
      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('[Forum] Upload avatar error:', error);
      return { success: false, error };
    }
  },

  /**
   * Get user's photos (posts with images)
   */
  async getUserPhotos(userId, page = 1, limit = 30) {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('id, image_url, created_at')
        .eq('user_id', userId)
        .eq('status', 'published')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Forum] Get user photos error:', error);
      return [];
    }
  },

  /**
   * Get user's videos (posts with video URLs)
   */
  async getUserVideos(userId, page = 1, limit = 30) {
    try {
      // For now, return empty array - video support can be added later
      // This would filter posts with video_url column when implemented
      return [];
    } catch (error) {
      console.error('[Forum] Get user videos error:', error);
      return [];
    }
  },

  /**
   * Get posts for a custom feed (by topics and profiles)
   */
  async getCustomFeedPosts(feedId, page = 1, limit = 20) {
    try {
      // Get feed details
      const { data: feed, error: feedError } = await supabase
        .from('custom_feeds')
        .select(`
          *,
          topics:custom_feed_topics(topic),
          profiles:custom_feed_profiles(profile_id)
        `)
        .eq('id', feedId)
        .single();

      if (feedError) throw feedError;

      const topics = feed.topics?.map(t => t.topic) || [];
      const profileIds = feed.profiles?.map(p => p.profile_id) || [];

      // Build query for posts
      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles(id, email, full_name, avatar_url, scanner_tier, chatbot_tier, verified_seller, verified_trader, level_badge, role_badge, role, achievement_badges),
          category:forum_categories(id, name, color)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Filter by topics (search in content/title) or profiles
      if (topics.length > 0 || profileIds.length > 0) {
        const filters = [];

        // Topic filters (search in title and content)
        topics.forEach(topic => {
          filters.push(`title.ilike.%${topic}%`);
          filters.push(`content.ilike.%${topic}%`);
        });

        // Profile filters
        if (profileIds.length > 0) {
          query = query.in('user_id', profileIds);
        } else if (filters.length > 0) {
          query = query.or(filters.join(','));
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching custom feed posts:', error);
      return [];
    }
  },
};

export default forumService;
