/**
 * Forum Components Index
 * Exports all forum-related components
 *
 * Phase 1: Reaction System (30/12/2024)
 * Phase 3: Comment Threading (30/12/2024)
 * Phase 4: View Count & Algorithm (30/12/2024)
 */

// Reaction System Components
export { default as ReactionIcon } from './ReactionIcon';
export { default as ForumReactionPicker } from './ForumReactionPicker';
export { default as ForumReactionButton } from './ForumReactionButton';
export { default as ReactionSummary } from './ReactionSummary';
export { default as ForumReactionTooltip } from './ForumReactionTooltip';

// Reaction Onboarding & Hints
export { default as ReactionOnboarding } from './ReactionOnboarding';
export {
  default as ReactionTooltipHint,
  incrementLikesForHint,
  resetLikesForHint,
} from './ReactionTooltipHint';

// Phase 3: Comment Threading Components
export { default as CommentThread } from './CommentThread';
export { default as CommentItem } from './CommentItem';
export { default as ThreadLine } from './ThreadLine';
export { default as MentionText } from './MentionText';
export { default as ReplyButton } from './ReplyButton';
export { default as LoadMoreReplies } from './LoadMoreReplies';

// Phase 4: View Count & Feed Components
export { default as ViewCount } from './ViewCount';
export { default as FeedTabs, FEED_TYPES } from './FeedTabs';
export { default as TrendingBadge } from './TrendingBadge';

// Product Integration
export { default as TaggedProductCard, clearProductCache } from './TaggedProductCard';

// Performance & Loading Components (Phase: Optimization Jan 2026)
export {
  default as PostSkeleton,
  PostSkeletonList,
  CompactSkeleton,
  SkeletonItem,
  ShimmerEffect,
} from './PostSkeleton';
export { default as ScrollToTopButton } from './ScrollToTopButton';
