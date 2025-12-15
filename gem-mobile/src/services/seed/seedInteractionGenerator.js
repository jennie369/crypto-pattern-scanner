/**
 * Gemral - Seed Interaction Generator
 * Generates likes and comments for seed posts
 */

import { supabase } from '../supabase';
import { getRandomNumber } from './seedDatasets';
import { logGeneration } from './seedContentService';
import { getRandomSeedUsers } from './seedUserGenerator';
import { generateComments, generateMixed, detectTopic } from './naturalCommentGenerator';

// Batch sizes
const LIKE_BATCH_SIZE = 50;
const COMMENT_BATCH_SIZE = 10;

/**
 * Generate a random timestamp between post creation and now
 * @param {Date} postCreatedAt - Post creation date
 * @param {number} spreadHours - Spread interactions over this many hours
 * @returns {Date}
 */
const getRandomTimestamp = (postCreatedAt, spreadHours = 48) => {
  const postTime = new Date(postCreatedAt).getTime();
  const now = Date.now();
  const maxSpread = Math.min(spreadHours * 60 * 60 * 1000, now - postTime);

  if (maxSpread <= 0) return new Date();

  return new Date(postTime + Math.random() * maxSpread);
};

/**
 * Generate likes for a single post
 * @param {string} postId - Post ID
 * @param {number} count - Number of likes
 * @param {Date} postCreatedAt - Post creation date
 * @returns {Promise<Object>}
 */
export const generateLikesForPost = async (postId, count = 250, postCreatedAt = null) => {
  const results = {
    generated: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Get random seed users (more than needed to avoid duplicates)
    const seedUsers = await getRandomSeedUsers(Math.min(count * 1.5, 500));

    if (seedUsers.length === 0) {
      throw new Error('Không có seed users để tạo likes');
    }

    // Check existing likes to avoid duplicates
    // NOTE: Seed post likes use seed_post_id column, not post_id
    const { data: existingLikes } = await supabase
      .from('forum_likes')
      .select('user_id')
      .eq('seed_post_id', postId);

    const existingUserIds = new Set(existingLikes?.map(l => l.user_id) || []);

    // Filter out users who already liked
    const availableUsers = seedUsers.filter(u => !existingUserIds.has(u.id));
    const usersToUse = availableUsers.slice(0, count);

    if (usersToUse.length === 0) {
      return results;
    }

    // Prepare likes data - use seed_post_id for seed posts
    const postDate = postCreatedAt ? new Date(postCreatedAt) : new Date();
    const likes = usersToUse.map(user => ({
      seed_post_id: postId,  // Use seed_post_id for seed posts
      user_id: user.id,
      created_at: getRandomTimestamp(postDate, 48).toISOString(),
    }));

    // Insert in batches
    const totalBatches = Math.ceil(likes.length / LIKE_BATCH_SIZE);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * LIKE_BATCH_SIZE;
      const end = Math.min(start + LIKE_BATCH_SIZE, likes.length);
      const batch = likes.slice(start, end);

      try {
        const { error } = await supabase
          .from('forum_likes')
          .insert(batch);

        if (error) {
          // Might be duplicate errors, count partial success
          results.failed += batch.length;
          results.errors.push({ batch: i + 1, error: error.message });
        } else {
          results.generated += batch.length;
        }
      } catch (batchError) {
        results.failed += batch.length;
        results.errors.push({ batch: i + 1, error: batchError.message });
      }
    }

    // Update post likes_count in seed_posts table
    await supabase
      .from('seed_posts')
      .update({ likes_count: results.generated + (existingLikes?.length || 0) })
      .eq('id', postId);

    return results;
  } catch (error) {
    console.error('[InteractionGenerator] generateLikesForPost error:', error);
    results.errors.push({ type: 'general', error: error.message });
    throw error;
  }
};

/**
 * Generate comments for a single post
 * @param {Object} post - Post object
 * @param {number} count - Number of comments
 * @param {boolean} useAI - Whether to use AI for some comments
 * @returns {Promise<Object>}
 */
export const generateCommentsForPost = async (post, count = 18, useAI = true) => {
  const results = {
    generated: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Get random seed users
    const seedUsers = await getRandomSeedUsers(count);

    if (seedUsers.length === 0) {
      throw new Error('Không có seed users để tạo comments');
    }

    // Generate comments
    let commentContents;
    if (useAI) {
      const mixedComments = await generateMixed(post, count);
      commentContents = mixedComments.map(c => ({ content: c.content, isAI: c.isAI }));
    } else {
      const templateComments = generateComments(post, count);
      commentContents = templateComments.map(content => ({ content, isAI: false }));
    }

    // Prepare comments data
    const postDate = new Date(post.created_at);
    const comments = [];

    for (let i = 0; i < Math.min(seedUsers.length, commentContents.length); i++) {
      // Spread comments over time
      // First few comments come quickly, later ones spread out more
      let timestamp;
      if (i === 0) {
        // First comment: 5-20 minutes after post
        timestamp = new Date(postDate.getTime() + getRandomNumber(5, 20) * 60 * 1000);
      } else if (i === 1) {
        // Second comment: 30-90 minutes after post
        timestamp = new Date(postDate.getTime() + getRandomNumber(30, 90) * 60 * 1000);
      } else if (i < 5) {
        // Comments 3-5: 2-6 hours after post
        timestamp = new Date(postDate.getTime() + getRandomNumber(2, 6) * 60 * 60 * 1000);
      } else if (i < 10) {
        // Comments 6-10: 6-24 hours after post
        timestamp = new Date(postDate.getTime() + getRandomNumber(6, 24) * 60 * 60 * 1000);
      } else {
        // Remaining comments: 24-48 hours after post
        timestamp = new Date(postDate.getTime() + getRandomNumber(24, 48) * 60 * 60 * 1000);
      }

      // Make sure timestamp is not in the future
      if (timestamp > new Date()) {
        timestamp = new Date(Date.now() - getRandomNumber(1, 60) * 60 * 1000);
      }

      comments.push({
        post_id: post.id,
        user_id: seedUsers[i].id,  // Note: forum_comments uses user_id, not author_id
        content: commentContents[i].content,
        created_at: timestamp.toISOString(),
        updated_at: timestamp.toISOString(),
        likes_count: 0,
      });
    }

    // Insert in batches
    const totalBatches = Math.ceil(comments.length / COMMENT_BATCH_SIZE);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * COMMENT_BATCH_SIZE;
      const end = Math.min(start + COMMENT_BATCH_SIZE, comments.length);
      const batch = comments.slice(start, end);

      try {
        const { data, error } = await supabase
          .from('forum_comments')
          .insert(batch)
          .select('id');

        if (error) {
          results.failed += batch.length;
          results.errors.push({ batch: i + 1, error: error.message });
        } else {
          results.generated += data?.length || batch.length;
        }
      } catch (batchError) {
        results.failed += batch.length;
        results.errors.push({ batch: i + 1, error: batchError.message });
      }

      // Small delay between batches
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Update post comments_count
    const { count: totalComments } = await supabase
      .from('forum_comments')
      .select('id', { count: 'exact' })
      .eq('post_id', post.id);

    // Update comments_count in seed_posts table (NOT forum_posts)
    await supabase
      .from('seed_posts')
      .update({ comments_count: totalComments || results.generated })
      .eq('id', post.id);

    return results;
  } catch (error) {
    console.error('[InteractionGenerator] generateCommentsForPost error:', error);
    results.errors.push({ type: 'general', error: error.message });
    throw error;
  }
};

/**
 * Generate all interactions (likes and comments) for all seed posts
 * @param {Object} options - Generation options
 * @returns {Promise<Object>}
 */
export const generateAllInteractions = async ({
  likesPerPost = { min: 200, max: 300 },
  commentsPerPost = { min: 15, max: 20 },
  useAI = true,
  onProgress = null,
  generatedBy = null,
} = {}) => {
  console.log('[InteractionGenerator] Starting interaction generation for all seed posts');

  const results = {
    posts_processed: 0,
    likes_generated: 0,
    comments_generated: 0,
    failed_likes: 0,
    failed_comments: 0,
    errors: [],
  };

  try {
    // Get all seed posts
    if (onProgress) {
      onProgress({
        phase: 'fetching_posts',
        message: 'Đang tải danh sách seed posts...',
        current: 0,
        total: 0,
      });
    }

    // NOTE: Seed posts are stored in 'seed_posts' table (NOT 'forum_posts')
    const { data: seedPosts, count: totalPosts } = await supabase
      .from('seed_posts')
      .select('id, content, seed_topic, created_at, user_id', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (!seedPosts || seedPosts.length === 0) {
      throw new Error('Không có seed posts để tạo interactions');
    }

    console.log(`[InteractionGenerator] Found ${seedPosts.length} seed posts`);

    // Process each post
    for (let i = 0; i < seedPosts.length; i++) {
      const post = seedPosts[i];

      if (onProgress) {
        onProgress({
          phase: 'processing',
          message: `Đang xử lý post ${i + 1}/${seedPosts.length}...`,
          current: i + 1,
          total: seedPosts.length,
        });
      }

      try {
        // Generate likes
        const likeCount = getRandomNumber(likesPerPost.min, likesPerPost.max);
        const likeResults = await generateLikesForPost(post.id, likeCount, post.created_at);
        results.likes_generated += likeResults.generated;
        results.failed_likes += likeResults.failed;

        // Generate comments
        const commentCount = getRandomNumber(commentsPerPost.min, commentsPerPost.max);
        const commentResults = await generateCommentsForPost(post, commentCount, useAI);
        results.comments_generated += commentResults.generated;
        results.failed_comments += commentResults.failed;

        results.posts_processed++;

        // Small delay between posts to avoid rate limiting
        if (i < seedPosts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (postError) {
        console.error(`[InteractionGenerator] Error processing post ${post.id}:`, postError);
        results.errors.push({
          post_id: post.id,
          error: postError.message,
        });
      }
    }

    // Log generation
    await logGeneration({
      generationType: 'interactions',
      countGenerated: results.likes_generated + results.comments_generated,
      countFailed: results.failed_likes + results.failed_comments,
      parameters: {
        posts_processed: results.posts_processed,
        likes_per_post: likesPerPost,
        comments_per_post: commentsPerPost,
        use_ai: useAI,
      },
      errorDetails: results.errors.length > 0 ? results.errors : null,
      generatedBy,
    });

    if (onProgress) {
      onProgress({
        phase: 'completed',
        message: `Hoàn thành! ${results.likes_generated} likes, ${results.comments_generated} comments.`,
        current: results.posts_processed,
        total: seedPosts.length,
      });
    }

    console.log(`[InteractionGenerator] Generation completed: ${results.likes_generated} likes, ${results.comments_generated} comments`);

    return results;
  } catch (error) {
    console.error('[InteractionGenerator] generateAllInteractions error:', error);
    results.errors.push({ type: 'general', error: error.message });

    await logGeneration({
      generationType: 'interactions',
      countGenerated: results.likes_generated + results.comments_generated,
      countFailed: results.failed_likes + results.failed_comments,
      parameters: { likesPerPost, commentsPerPost },
      errorDetails: results.errors,
      generatedBy,
    });

    throw error;
  }
};

/**
 * Generate interactions for a specific post
 * @param {string} postId - Post ID
 * @param {Object} options - Generation options
 * @returns {Promise<Object>}
 */
export const generateInteractionsForPost = async (postId, {
  likesCount = 250,
  commentsCount = 18,
  useAI = true,
} = {}) => {
  try {
    // Get post data from seed_posts table (NOT forum_posts)
    const { data: post, error } = await supabase
      .from('seed_posts')
      .select('id, content, seed_topic, created_at, user_id')
      .eq('id', postId)
      .single();

    if (error || !post) {
      throw new Error('Không tìm thấy post');
    }

    // Generate likes
    const likeResults = await generateLikesForPost(postId, likesCount, post.created_at);

    // Generate comments
    const commentResults = await generateCommentsForPost(post, commentsCount, useAI);

    return {
      likes: likeResults,
      comments: commentResults,
    };
  } catch (error) {
    console.error('[InteractionGenerator] generateInteractionsForPost error:', error);
    throw error;
  }
};

/**
 * Add likes from seed users to a specific post (for bot actions)
 * @param {string} postId - Post ID
 * @param {number} count - Number of likes to add
 * @param {string} excludeUserId - User ID to exclude (post author)
 * @returns {Promise<number>} Number of likes added
 */
export const addBotLikes = async (postId, count = 20, excludeUserId = null) => {
  try {
    const seedUsers = await getRandomSeedUsers(count * 2, excludeUserId);

    if (seedUsers.length === 0) {
      return 0;
    }

    // Check existing likes using seed_post_id column
    const { data: existingLikes } = await supabase
      .from('forum_likes')
      .select('user_id')
      .eq('seed_post_id', postId);

    const existingUserIds = new Set(existingLikes?.map(l => l.user_id) || []);
    const availableUsers = seedUsers.filter(u => !existingUserIds.has(u.id));
    const usersToUse = availableUsers.slice(0, count);

    if (usersToUse.length === 0) {
      return 0;
    }

    // Use seed_post_id for seed posts
    const likes = usersToUse.map(user => ({
      seed_post_id: postId,
      user_id: user.id,
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('forum_likes')
      .insert(likes)
      .select('id');

    if (error) {
      console.error('[InteractionGenerator] addBotLikes error:', error);
      return 0;
    }

    // Update post likes count in seed_posts table (NOT forum_posts)
    const addedCount = data?.length || 0;
    await supabase
      .from('seed_posts')
      .update({
        likes_count: (existingLikes?.length || 0) + addedCount,
      })
      .eq('id', postId);

    return addedCount;
  } catch (error) {
    console.error('[InteractionGenerator] addBotLikes error:', error);
    return 0;
  }
};

export default {
  generateLikesForPost,
  generateCommentsForPost,
  generateAllInteractions,
  generateInteractionsForPost,
  addBotLikes,
};
