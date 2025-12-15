/**
 * Gemral - AI Bot Service
 * Auto-comment bot that responds to real user posts
 */

import { supabase } from '../supabase';
import { getRandomNumber } from './seedDatasets';
import { getConfigValue, logBotActivity, checkDailyLimit } from './seedContentService';
import { getRandomSeedUsers } from './seedUserGenerator';
import {
  generateWithAI,
  generateTemplateComment,
  generateReply,
  generateAIReply,
  detectTopic,
} from './naturalCommentGenerator';
import { addBotLikes } from './seedInteractionGenerator';

// Bot state
let isRunning = false;
let realtimeSubscription = null;
let actionQueue = [];
let queueProcessorInterval = null;

// Timing configurations (in milliseconds)
const COMMENT_TIMING = {
  first: { min: 5 * 60 * 1000, max: 20 * 60 * 1000 },      // 5-20 minutes
  second: { min: 30 * 60 * 1000, max: 90 * 60 * 1000 },    // 30-90 minutes
  third: { min: 2 * 60 * 60 * 1000, max: 6 * 60 * 60 * 1000 },   // 2-6 hours
  fourth: { min: 8 * 60 * 60 * 1000, max: 24 * 60 * 60 * 1000 }, // 8-24 hours
  fifth: { min: 24 * 60 * 60 * 1000, max: 48 * 60 * 60 * 1000 }, // 24-48 hours
};

const LIKE_TIMING = {
  immediate: { min: 1 * 60 * 1000, max: 30 * 60 * 1000 },   // 1-30 minutes (50%)
  delayed: { min: 1 * 60 * 60 * 1000, max: 24 * 60 * 60 * 1000 }, // 1-24 hours (50%)
};

const REPLY_TIMING = {
  quick: { min: 2 * 60 * 1000, max: 15 * 60 * 1000 },      // 2-15 minutes
  normal: { min: 15 * 60 * 1000, max: 60 * 60 * 1000 },    // 15-60 minutes
};

/**
 * Initialize the AI Bot
 * Sets up realtime listeners for new posts and comments
 */
export const initialize = async () => {
  if (isRunning) {
    console.log('[AIBot] Already running');
    return;
  }

  try {
    // Check if bot is enabled
    const botEnabled = await getConfigValue('bot_enabled', true);
    if (!botEnabled) {
      console.log('[AIBot] Bot is disabled in config');
      return;
    }

    console.log('[AIBot] Initializing...');

    // Subscribe to new real posts
    realtimeSubscription = supabase
      .channel('new_posts_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_posts',
          filter: 'is_seed_post=eq.false',
        },
        (payload) => {
          handleNewPost(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_comments',
        },
        (payload) => {
          handleNewComment(payload.new);
        }
      )
      .subscribe();

    // Start queue processor
    startQueueProcessor();

    isRunning = true;
    console.log('[AIBot] Initialized successfully');
  } catch (error) {
    console.error('[AIBot] Initialization error:', error);
    throw error;
  }
};

/**
 * Handle a new real user post
 * @param {Object} post - New post object
 */
const handleNewPost = async (post) => {
  try {
    console.log('[AIBot] New post detected:', post.id);

    // Check if post author is a seed user (skip seed posts)
    const { data: author } = await supabase
      .from('profiles')
      .select('is_seed_user')
      .eq('id', post.author_id)
      .single();

    if (author?.is_seed_user) {
      console.log('[AIBot] Skipping seed user post');
      return;
    }

    // Get config
    const autoComment = await getConfigValue('bot_auto_comment', true);
    const autoLike = await getConfigValue('bot_auto_like', true);
    const commentsConfig = await getConfigValue('bot_comments_per_post', { min: 3, max: 5 });
    const likesConfig = await getConfigValue('bot_likes_per_post', { min: 15, max: 40 });

    // Queue comments
    if (autoComment) {
      const commentCount = getRandomNumber(commentsConfig.min, commentsConfig.max);
      await queueCommentsForPost(post, commentCount);
    }

    // Queue likes
    if (autoLike) {
      const likeCount = getRandomNumber(likesConfig.min, likesConfig.max);
      await queueLikesForPost(post.id, likeCount, post.author_id);
    }
  } catch (error) {
    console.error('[AIBot] handleNewPost error:', error);
  }
};

/**
 * Handle a new real user comment
 * @param {Object} comment - New comment object
 */
const handleNewComment = async (comment) => {
  try {
    // Check if comment author is a seed user
    const { data: author } = await supabase
      .from('profiles')
      .select('is_seed_user')
      .eq('id', comment.author_id)
      .single();

    if (author?.is_seed_user) {
      return;
    }

    console.log('[AIBot] New real comment detected:', comment.id);

    // Get config
    const autoReply = await getConfigValue('bot_auto_reply', true);
    const replyProbability = await getConfigValue('bot_reply_probability', 0.7);

    if (!autoReply) {
      return;
    }

    // Random check for reply probability
    if (Math.random() > replyProbability) {
      return;
    }

    // Queue a reply
    await queueReplyForComment(comment);
  } catch (error) {
    console.error('[AIBot] handleNewComment error:', error);
  }
};

/**
 * Queue comments for a post with realistic timing
 * @param {Object} post - Post object
 * @param {number} count - Number of comments to queue
 */
const queueCommentsForPost = async (post, count) => {
  const seedUsers = await getRandomSeedUsers(count, post.author_id);

  for (let i = 0; i < Math.min(seedUsers.length, count); i++) {
    let timing;
    if (i === 0) timing = COMMENT_TIMING.first;
    else if (i === 1) timing = COMMENT_TIMING.second;
    else if (i < 4) timing = COMMENT_TIMING.third;
    else if (i < 6) timing = COMMENT_TIMING.fourth;
    else timing = COMMENT_TIMING.fifth;

    const delay = getRandomNumber(timing.min, timing.max);
    const executeAt = Date.now() + delay;

    queueAction({
      type: 'comment',
      postId: post.id,
      post: post,
      seedUserId: seedUsers[i].id,
      targetUserId: post.author_id,
      executeAt,
      triggeredBy: 'auto_new_post',
    });
  }
};

/**
 * Queue likes for a post with realistic timing
 * @param {string} postId - Post ID
 * @param {number} count - Number of likes to queue
 * @param {string} excludeUserId - User ID to exclude
 */
const queueLikesForPost = async (postId, count, excludeUserId) => {
  // 50% immediate, 50% delayed
  const immediateCount = Math.floor(count * 0.5);
  const delayedCount = count - immediateCount;

  // Queue immediate likes
  for (let i = 0; i < immediateCount; i++) {
    const delay = getRandomNumber(LIKE_TIMING.immediate.min, LIKE_TIMING.immediate.max);
    queueAction({
      type: 'like_batch',
      postId,
      count: 1,
      excludeUserId,
      executeAt: Date.now() + delay + (i * 30000), // Spread by 30s
      triggeredBy: 'auto_new_post',
    });
  }

  // Queue delayed likes
  for (let i = 0; i < delayedCount; i++) {
    const delay = getRandomNumber(LIKE_TIMING.delayed.min, LIKE_TIMING.delayed.max);
    queueAction({
      type: 'like_batch',
      postId,
      count: 1,
      excludeUserId,
      executeAt: Date.now() + delay + (i * 60000), // Spread by 1 min
      triggeredBy: 'auto_new_post',
    });
  }
};

/**
 * Queue a reply for a comment
 * @param {Object} comment - Comment object
 */
const queueReplyForComment = async (comment) => {
  const seedUsers = await getRandomSeedUsers(1, comment.author_id);

  if (seedUsers.length === 0) return;

  // Random timing: 70% quick, 30% normal
  const timing = Math.random() < 0.7 ? REPLY_TIMING.quick : REPLY_TIMING.normal;
  const delay = getRandomNumber(timing.min, timing.max);

  queueAction({
    type: 'reply',
    commentId: comment.id,
    postId: comment.post_id,
    comment,
    seedUserId: seedUsers[0].id,
    targetUserId: comment.author_id,
    executeAt: Date.now() + delay,
    triggeredBy: 'auto_reply',
  });
};

/**
 * Add action to queue
 * @param {Object} action - Action object
 */
const queueAction = (action) => {
  actionQueue.push(action);
  // Sort by executeAt
  actionQueue.sort((a, b) => a.executeAt - b.executeAt);
  console.log(`[AIBot] Queued ${action.type} action, total in queue: ${actionQueue.length}`);
};

/**
 * Start the queue processor
 */
const startQueueProcessor = () => {
  if (queueProcessorInterval) {
    clearInterval(queueProcessorInterval);
  }

  // Check queue every 30 seconds
  queueProcessorInterval = setInterval(processQueue, 30000);
  console.log('[AIBot] Queue processor started');
};

/**
 * Process pending actions in the queue
 */
const processQueue = async () => {
  if (actionQueue.length === 0) return;

  const now = Date.now();
  const readyActions = actionQueue.filter(a => a.executeAt <= now);

  if (readyActions.length === 0) return;

  console.log(`[AIBot] Processing ${readyActions.length} ready actions`);

  // Process actions one by one
  for (const action of readyActions) {
    try {
      await executeAction(action);
      // Remove from queue
      actionQueue = actionQueue.filter(a => a !== action);
    } catch (error) {
      console.error('[AIBot] Action execution error:', error);
      // Remove failed action from queue
      actionQueue = actionQueue.filter(a => a !== action);
    }

    // Small delay between actions
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

/**
 * Execute a single action
 * @param {Object} action - Action object
 */
const executeAction = async (action) => {
  switch (action.type) {
    case 'comment':
      await postComment(action);
      break;
    case 'like_batch':
      await postLike(action);
      break;
    case 'reply':
      await postReply(action);
      break;
    default:
      console.warn('[AIBot] Unknown action type:', action.type);
  }
};

/**
 * Post a comment on a post
 * @param {Object} action - Action object
 */
const postComment = async (action) => {
  try {
    // Check daily limit
    const canComment = await checkDailyLimit('comment');
    if (!canComment) {
      console.log('[AIBot] Daily comment limit reached');
      return;
    }

    // Get post data if not included
    let post = action.post;
    if (!post || !post.content) {
      const { data } = await supabase
        .from('forum_posts')
        .select('id, content, seed_topic')
        .eq('id', action.postId)
        .single();
      post = data;
    }

    if (!post) return;

    // Generate comment (30% AI, 70% template)
    const useAI = Math.random() < 0.3;
    let content;
    let aiModel = null;

    if (useAI) {
      content = await generateWithAI(post);
      aiModel = 'gemini-2.5-flash';
    }

    if (!content) {
      const topic = post.seed_topic || detectTopic(post.content);
      content = generateTemplateComment(topic);
    }

    // Insert comment - use user_id (not author_id)
    const { error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: action.postId,
        user_id: action.seedUserId,
        content,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[AIBot] Comment insert error:', error);
      return;
    }

    // Update post comment count
    await supabase.rpc('increment_comment_count', { post_id: action.postId }).catch(() => {
      // If RPC doesn't exist, do it manually
      supabase
        .from('forum_posts')
        .select('comments_count')
        .eq('id', action.postId)
        .single()
        .then(({ data }) => {
          const newCount = (data?.comments_count || 0) + 1;
          supabase
            .from('forum_posts')
            .update({ comments_count: newCount })
            .eq('id', action.postId);
        });
    });

    // Log activity
    await logBotActivity({
      actionType: 'comment',
      postId: action.postId,
      seedUserId: action.seedUserId,
      targetUserId: action.targetUserId,
      content,
      triggeredBy: action.triggeredBy,
      aiModel,
    });

    console.log('[AIBot] Comment posted successfully');
  } catch (error) {
    console.error('[AIBot] postComment error:', error);
  }
};

/**
 * Add a like to a post
 * @param {Object} action - Action object
 */
const postLike = async (action) => {
  try {
    // Check daily limit
    const canLike = await checkDailyLimit('like');
    if (!canLike) {
      console.log('[AIBot] Daily like limit reached');
      return;
    }

    // Add likes using interaction generator
    const addedCount = await addBotLikes(action.postId, action.count || 1, action.excludeUserId);

    if (addedCount > 0) {
      // Log activity
      await logBotActivity({
        actionType: 'like',
        postId: action.postId,
        seedUserId: null, // Multiple users
        targetUserId: action.excludeUserId,
        content: `Added ${addedCount} likes`,
        triggeredBy: action.triggeredBy,
      });

      console.log(`[AIBot] Added ${addedCount} likes`);
    }
  } catch (error) {
    console.error('[AIBot] postLike error:', error);
  }
};

/**
 * Post a reply to a comment
 * @param {Object} action - Action object
 */
const postReply = async (action) => {
  try {
    // Check daily limit
    const canReply = await checkDailyLimit('reply');
    if (!canReply) {
      console.log('[AIBot] Daily reply limit reached');
      return;
    }

    // Get post for context
    const { data: post } = await supabase
      .from('forum_posts')
      .select('id, content, seed_topic')
      .eq('id', action.postId)
      .single();

    // Generate reply (50% AI, 50% template)
    const useAI = Math.random() < 0.5;
    let content;
    let aiModel = null;

    if (useAI && post) {
      content = await generateAIReply(action.comment, post);
      aiModel = 'gemini-2.5-flash';
    }

    if (!content) {
      const topic = post?.seed_topic || detectTopic(post?.content || '');
      content = generateReply(action.comment, topic);
    }

    // Insert reply (as a comment with parent_id) - use user_id not author_id
    const { error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: action.postId,
        user_id: action.seedUserId,
        parent_id: action.commentId,
        content,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[AIBot] Reply insert error:', error);
      return;
    }

    // Log activity
    await logBotActivity({
      actionType: 'reply',
      postId: action.postId,
      commentId: action.commentId,
      seedUserId: action.seedUserId,
      targetUserId: action.targetUserId,
      content,
      triggeredBy: action.triggeredBy,
      aiModel,
    });

    console.log('[AIBot] Reply posted successfully');
  } catch (error) {
    console.error('[AIBot] postReply error:', error);
  }
};

/**
 * Stop the AI Bot
 */
export const stop = async () => {
  console.log('[AIBot] Stopping...');

  if (realtimeSubscription) {
    await supabase.removeChannel(realtimeSubscription);
    realtimeSubscription = null;
  }

  if (queueProcessorInterval) {
    clearInterval(queueProcessorInterval);
    queueProcessorInterval = null;
  }

  actionQueue = [];
  isRunning = false;

  console.log('[AIBot] Stopped');
};

/**
 * Get bot status
 * @returns {Object} Status object
 */
export const getStatus = () => {
  return {
    isRunning,
    queueLength: actionQueue.length,
    nextAction: actionQueue[0] ? new Date(actionQueue[0].executeAt).toISOString() : null,
  };
};

/**
 * Force process all queued actions immediately (for testing)
 */
export const forceProcessQueue = async () => {
  console.log('[AIBot] Force processing queue...');

  for (const action of actionQueue) {
    try {
      await executeAction(action);
    } catch (error) {
      console.error('[AIBot] Force process error:', error);
    }
  }

  actionQueue = [];
};

/**
 * Manually trigger comments on a post (for testing)
 * @param {string} postId - Post ID
 * @param {number} count - Number of comments
 */
export const manualComment = async (postId, count = 3) => {
  try {
    const { data: post } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (!post) {
      throw new Error('Post not found');
    }

    const seedUsers = await getRandomSeedUsers(count, post.author_id);

    for (const user of seedUsers) {
      await executeAction({
        type: 'comment',
        postId,
        post,
        seedUserId: user.id,
        targetUserId: post.author_id,
        triggeredBy: 'manual',
      });

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return { success: true, count: seedUsers.length };
  } catch (error) {
    console.error('[AIBot] manualComment error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  initialize,
  stop,
  getStatus,
  forceProcessQueue,
  manualComment,
};
