/**
 * Engagement Service - Track User Interactions
 * Records likes, comments, shares, saves, views with dwell time
 * Updates post engagement scores and learns user preferences
 */

import { supabase } from './supabase';

// ============================================
// TRACK INTERACTION (MAIN FUNCTION)
// ============================================

export async function trackInteraction(userId, postId, interactionType, metadata = {}) {
  try {
    console.log(`[EngagementService] Tracking ${interactionType} for post ${postId} by user ${userId}`);

    // Validate inputs
    if (!userId || !postId) {
      console.warn('[EngagementService] Missing userId or postId, skipping interaction');
      return { success: false, error: 'Missing userId or postId' };
    }

    // 1. Record interaction in database using upsert to avoid 409 conflicts
    const { error: insertError } = await supabase
      .from('post_interactions')
      .upsert({
        user_id: userId,
        post_id: postId,
        interaction_type: interactionType,
        dwell_time: metadata.dwell_time || null,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,post_id,interaction_type',
        ignoreDuplicates: false // Update timestamp on conflict
      });

    // Handle foreign key violation - post doesn't exist anymore
    // Use console.log instead of warn to reduce log noise (this is expected for deleted posts)
    if (insertError && insertError.code === '23503') {
      // Silent skip - don't log every deleted post reference
      return { success: false, error: 'Post not found' };
    } else if (insertError) {
      // Log but don't throw - interaction tracking shouldn't break the app
      console.log('[EngagementService] Upsert error:', insertError.message);
      return { success: false, error: insertError.message };
    }

    // 2. Update post engagement counts
    await updatePostCounts(postId, interactionType);

    // 3. Update user preferences (learn from behavior)
    await updateUserPreferences(userId, postId, interactionType, metadata);

    // 4. Update feed impressions if this was shown in feed
    if (metadata.sessionId) {
      await updateFeedImpression(userId, postId, interactionType, metadata.sessionId);
    }

    console.log(`[EngagementService] Successfully tracked ${interactionType}`);
    return { success: true };

  } catch (error) {
    console.error('[EngagementService] Error tracking interaction:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// UPDATE POST COUNTS
// ============================================

async function updatePostCounts(postId, interactionType) {
  try {
    const countField = `${interactionType}_count`;

    // Try RPC first
    const { error } = await supabase.rpc('increment_post_count', {
      post_uuid: postId,
      count_field: countField
    });

    if (error) {
      // If RPC doesn't exist, do manual update
      const { data: post } = await supabase
        .from('forum_posts')
        .select(countField)
        .eq('id', postId)
        .single();

      if (post) {
        await supabase
          .from('forum_posts')
          .update({ [countField]: (post[countField] || 0) + 1 })
          .eq('id', postId);
      }
    }

  } catch (error) {
    console.error('[EngagementService] Error updating post counts:', error);
    // Don't throw - non-critical
  }
}

// ============================================
// UPDATE USER PREFERENCES (LEARNING)
// ============================================

async function updateUserPreferences(userId, postId, interactionType, metadata) {
  try {
    // Get post details
    const { data: post } = await supabase
      .from('forum_posts')
      .select('category_id, hashtags, user_id')
      .eq('id', postId)
      .single();

    if (!post) return;

    // Positive interactions - increase preference
    if (['like', 'save', 'share', 'comment'].includes(interactionType)) {

      // 1. Add category to preferred if not already
      const { data: prefs } = await supabase
        .from('user_feed_preferences')
        .select('preferred_categories')
        .eq('user_id', userId)
        .single();

      const preferredCategories = prefs?.preferred_categories || [];

      if (post.category_id && !preferredCategories.includes(post.category_id)) {
        // Limit to 10 preferred categories
        const newCategories = [...preferredCategories, post.category_id].slice(-10);

        await supabase
          .from('user_feed_preferences')
          .upsert({
            user_id: userId,
            preferred_categories: newCategories,
            updated_at: new Date().toISOString()
          });
      }

      // 2. Track hashtag affinity
      if (post.hashtags && post.hashtags.length > 0) {
        for (const hashtag of post.hashtags) {
          // Try to update existing
          const { data: existing } = await supabase
            .from('user_hashtag_affinity')
            .select('engagement_count')
            .eq('user_id', userId)
            .eq('hashtag', hashtag)
            .single();

          if (existing) {
            await supabase
              .from('user_hashtag_affinity')
              .update({
                engagement_count: existing.engagement_count + 1,
                last_engaged_at: new Date().toISOString()
              })
              .eq('user_id', userId)
              .eq('hashtag', hashtag);
          } else {
            await supabase
              .from('user_hashtag_affinity')
              .insert({
                user_id: userId,
                hashtag: hashtag,
                engagement_count: 1,
                last_engaged_at: new Date().toISOString()
              });
          }
        }
      }
    }

    // Negative signal - user skipped quickly (dwell time < 2 seconds)
    if (interactionType === 'view' && metadata.dwell_time && metadata.dwell_time < 2) {
      const { data: existing } = await supabase
        .from('user_content_dislikes')
        .select('dislike_count')
        .eq('user_id', userId)
        .eq('category_id', post.category_id)
        .single();

      if (existing) {
        await supabase
          .from('user_content_dislikes')
          .update({
            dislike_count: existing.dislike_count + 1,
            last_disliked_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('category_id', post.category_id);
      } else if (post.category_id) {
        await supabase
          .from('user_content_dislikes')
          .insert({
            user_id: userId,
            category_id: post.category_id,
            dislike_count: 1,
            last_disliked_at: new Date().toISOString()
          });
      }
    }

  } catch (error) {
    console.error('[EngagementService] Error updating user preferences:', error);
    // Don't throw - non-critical
  }
}

// ============================================
// UPDATE FEED IMPRESSION
// ============================================

async function updateFeedImpression(userId, postId, interactionType, sessionId) {
  try {
    await supabase
      .from('feed_impressions')
      .update({
        interacted: true,
        interaction_type: interactionType
      })
      .match({
        user_id: userId,
        post_id: postId,
        session_id: sessionId
      });
  } catch (error) {
    console.error('[EngagementService] Error updating feed impression:', error);
  }
}

// ============================================
// TRACK VIEW WITH DWELL TIME
// ============================================

export async function trackView(userId, postId, dwellTime, sessionId = null) {
  return trackInteraction(userId, postId, 'view', { dwell_time: dwellTime, sessionId });
}

// ============================================
// TRACK LIKE
// ============================================

export async function trackLike(userId, postId, sessionId = null) {
  return trackInteraction(userId, postId, 'like', { sessionId });
}

// ============================================
// UNLIKE (REMOVE LIKE)
// ============================================

export async function removeLike(userId, postId) {
  try {
    // Delete the interaction
    await supabase
      .from('post_interactions')
      .delete()
      .match({ user_id: userId, post_id: postId, interaction_type: 'like' });

    // Decrement post count
    const { data: post } = await supabase
      .from('forum_posts')
      .select('like_count')
      .eq('id', postId)
      .single();

    if (post && post.like_count > 0) {
      await supabase
        .from('forum_posts')
        .update({ like_count: post.like_count - 1 })
        .eq('id', postId);
    }

    return { success: true };
  } catch (error) {
    console.error('[EngagementService] Error removing like:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// TRACK SAVE
// ============================================

export async function trackSave(userId, postId, sessionId = null) {
  return trackInteraction(userId, postId, 'save', { sessionId });
}

// ============================================
// UNSAVE (REMOVE SAVE)
// ============================================

export async function removeSave(userId, postId) {
  try {
    await supabase
      .from('post_interactions')
      .delete()
      .match({ user_id: userId, post_id: postId, interaction_type: 'save' });

    const { data: post } = await supabase
      .from('forum_posts')
      .select('save_count')
      .eq('id', postId)
      .single();

    if (post && post.save_count > 0) {
      await supabase
        .from('forum_posts')
        .update({ save_count: post.save_count - 1 })
        .eq('id', postId);
    }

    return { success: true };
  } catch (error) {
    console.error('[EngagementService] Error removing save:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// TRACK COMMENT
// ============================================

export async function trackComment(userId, postId, sessionId = null) {
  return trackInteraction(userId, postId, 'comment', { sessionId });
}

// ============================================
// TRACK SHARE
// ============================================

export async function trackShare(userId, postId, sessionId = null) {
  return trackInteraction(userId, postId, 'share', { sessionId });
}

// ============================================
// CHECK IF USER LIKED POST
// ============================================

export async function hasLiked(userId, postId) {
  try {
    const { data } = await supabase
      .from('post_interactions')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .eq('interaction_type', 'like')
      .single();

    return !!data;
  } catch (error) {
    return false;
  }
}

// ============================================
// CHECK IF USER SAVED POST
// ============================================

export async function hasSaved(userId, postId) {
  try {
    const { data } = await supabase
      .from('post_interactions')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .eq('interaction_type', 'save')
      .single();

    return !!data;
  } catch (error) {
    return false;
  }
}

// ============================================
// GET USER'S SAVED POSTS
// ============================================

export async function getSavedPosts(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('post_interactions')
      .select(`
        post_id,
        created_at,
        forum_posts (
          *,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        )
      `)
      .eq('user_id', userId)
      .eq('interaction_type', 'save')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map(item => ({
      ...item.forum_posts,
      saved_at: item.created_at
    })) || [];
  } catch (error) {
    console.error('[EngagementService] Error getting saved posts:', error);
    return [];
  }
}

// ============================================
// TRACK AD CLICK
// ============================================

export async function trackAdClick(userId, adType, sessionId) {
  try {
    await supabase
      .from('ad_impressions')
      .update({
        clicked: true,
        click_at: new Date().toISOString()
      })
      .match({
        user_id: userId,
        ad_type: adType,
        session_id: sessionId
      });

    console.log(`[EngagementService] Tracked ad click: ${adType}`);
    return { success: true };

  } catch (error) {
    console.error('[EngagementService] Error tracking ad click:', error);
    return { success: false };
  }
}

// ============================================
// TRACK AD CONVERSION
// ============================================

export async function trackAdConversion(userId, adType, sessionId) {
  try {
    await supabase
      .from('ad_impressions')
      .update({
        converted: true,
        convert_at: new Date().toISOString()
      })
      .match({
        user_id: userId,
        ad_type: adType,
        session_id: sessionId
      });

    console.log(`[EngagementService] Tracked ad conversion: ${adType}`);
    return { success: true };

  } catch (error) {
    console.error('[EngagementService] Error tracking ad conversion:', error);
    return { success: false };
  }
}

// ============================================
// GET USER ENGAGEMENT STATS
// ============================================

export async function getUserEngagementStats(userId) {
  try {
    const { data, error } = await supabase
      .from('post_interactions')
      .select('interaction_type, dwell_time')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      likes_given: 0,
      comments_made: 0,
      shares_made: 0,
      saves_made: 0,
      posts_viewed: 0,
      avg_dwell_time: 0
    };

    let totalDwellTime = 0;
    let viewCount = 0;

    data?.forEach(interaction => {
      switch (interaction.interaction_type) {
        case 'like':
          stats.likes_given++;
          break;
        case 'comment':
          stats.comments_made++;
          break;
        case 'share':
          stats.shares_made++;
          break;
        case 'save':
          stats.saves_made++;
          break;
        case 'view':
          stats.posts_viewed++;
          if (interaction.dwell_time) {
            totalDwellTime += interaction.dwell_time;
            viewCount++;
          }
          break;
      }
    });

    if (viewCount > 0) {
      stats.avg_dwell_time = Math.round(totalDwellTime / viewCount);
    }

    return stats;
  } catch (error) {
    console.error('[EngagementService] Error getting user stats:', error);
    return null;
  }
}

// ============================================
// EXPORTS
// ============================================

export default {
  trackInteraction,
  trackView,
  trackLike,
  removeLike,
  trackSave,
  removeSave,
  trackComment,
  trackShare,
  hasLiked,
  hasSaved,
  getSavedPosts,
  trackAdClick,
  trackAdConversion,
  getUserEngagementStats
};
