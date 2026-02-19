# HOME (APP) ↔ COMMUNITY (WEB) SYNC — MASTER PLAN

## Date: 2026-02-19
## Status: IN PROGRESS
## Design Tokens: `web design-tokens.js` (JS) + `frontend/src/styles/design-tokens.css` (CSS)

---

## EXECUTIVE SUMMARY

Sync the App's Home tab (ForumScreen — 69KB) with the Web's Community page (Forum3Column) to achieve 100% feature parity. The Web already has a basic 3-column forum layout. The App has significantly richer features: 6-type reactions, comment threading, link previews, custom feeds, stories, scheduling, analytics, boost/gifts, karma, and more.

---

## CURRENT STATE

### Web Already Has (Basic):
| Feature | File | Status |
|---------|------|--------|
| 3-column layout | `Forum3Column.jsx` | Working |
| PostCard (likes, bookmark, repost, share, delete) | `PostCard.jsx` | Basic |
| ForumService (CRUD, likes, bookmarks, search) | `services/forum.js` | Basic |
| ThreadDetail (replies, likes) | `ThreadDetail.jsx` | Basic |
| CreateThread | `CreateThread.jsx` | Basic |
| LeftSidebar (feeds, categories, hashtags) | `LeftSidebar.jsx` | Basic |
| CenterFeed (posts, search, sort) | `CenterFeed.jsx` | Basic |
| RightSidebar (trending, creators) | `RightSidebar.jsx` | Basic |
| ReactionPicker component | `components/forum/ReactionPicker.jsx` | Exists |
| CommentSection component | `components/forum/CommentSection.jsx` | Exists |

### Web MISSING (Gap from App):

#### P0 — Critical (Must Have)
| # | Feature | App File (size) | Web Action |
|---|---------|-----------------|------------|
| 1 | **6-Type Reactions** (like/love/haha/wow/sad/angry) | `ForumReactionButton.js` (18KB) | Enhance PostCard + service |
| 2 | **Comment Threading** (nested, depth, thread lines) | `CommentItem.js` (8.7KB), `CommentThread.js` (5.5KB) | Build threaded comments |
| 3 | **Link Previews** in posts | `LinkPreviewCard.js` (18KB) | Build LinkPreview component |
| 4 | **Edit Post** | `EditPostScreen.js` (48KB) | Create EditPost page |
| 5 | **Infinite Scroll** with proper pagination | ForumScreen paginates | Implement virtual scroll |
| 6 | **Skeleton Loading** | `PostSkeleton.js` (7.2KB) | Build skeleton components |
| 7 | **Image Gallery/Viewer** full-screen | `ImageViewer.js` (24KB) | Build lightbox |
| 8 | **Rich User Profile** from forum | `UserProfileScreen.js` (20KB) | Create UserProfile page |
| 9 | **Feed Personalization** (explore/following/popular) | `feedService.js` (63KB) | Enhance feed service |
| 10 | **Mentions System** (@user mentions) | `MentionText.js` (3.4KB) | Build mention component |

#### P1 — High Priority
| # | Feature | App File | Web Action |
|---|---------|----------|------------|
| 11 | **Custom Feeds** (create/edit) | `CreateFeedModal.js`, `EditFeedsModal.js` | Build feed management |
| 12 | **Hashtag Feed** | `HashtagFeedScreen.js` (6.8KB) | Create HashtagFeed page |
| 13 | **Search with Filters** | `SearchScreen.js` (24KB) | Enhance search page |
| 14 | **Post Gifts** | `PostGiftsScreen.js` (8.5KB) | Build gift system |
| 15 | **Quoted Reposts** | `QuotedPost.js` (5KB) | Enhance repost |
| 16 | **View Count Tracking** | `ViewCount.js` (1.8KB) | Add view tracking |
| 17 | **Trending Badges** | `TrendingBadge.js` (1.6KB) | Add trending indicator |
| 18 | **Scroll to Top** | `ScrollToTopButton.js` (4.1KB) | Add scroll button |
| 19 | **Category Labels/Tabs** | `CategoryTabs.js` (3KB), `FeedCategoryLabel.js` | Enhance categories |
| 20 | **Comment Moderation** | `commentModerationService.js` (9.1KB) | Port moderation |

#### P2 — Medium Priority
| # | Feature | App File | Web Action |
|---|---------|----------|------------|
| 21 | **Post Analytics** | `PostAnalyticsScreen.js` (14KB) | Create analytics page |
| 22 | **Scheduled Posts** | `ScheduledPostsScreen.js` (15KB) | Create scheduling |
| 23 | **Edit History** | `EditHistoryScreen.js` (13KB) | Create edit history page |
| 24 | **Boost/Sponsor Posts** | `BoostPostSheet.js` (14KB) | Build boost system |
| 25 | **Karma System** | karma tables + RPCs | Integrate karma |
| 26 | **Stories** | `StoryViewerScreen.js` (15KB) | Build stories (complex) |
| 27 | **Ad Cards in Feed** | `AdCard.js` (5KB) | Build ad component |
| 28 | **Tagged Products** | `TaggedProductCard.js` (11KB) | Build product tags |
| 29 | **Pinned Posts** | `PinnedPostBadge.js` (4.8KB) | Add pin indicator |
| 30 | **Side Menu** (mobile hamburger) | `SideMenu.js` (23KB) | Build mobile menu |

---

## DATABASE (Already Deployed — Verified via Supabase MCP)

### Core Tables (ALL exist, ALL have RLS):
| Table | Columns | Rows | Notes |
|-------|---------|------|-------|
| `forum_posts` | 59 | 10 | Main posts — HEAVILY indexed (39 indexes) |
| `forum_comments` | 15 | 2 | Comments with threading (parent_id, thread_depth, reply_to_user_id) |
| `forum_likes` | 6 | 32,236 | Like tracking |
| `forum_categories` | 8 | 10 | Categories |
| `forum_saved` | 4 | 4 | Bookmarks |
| `post_reactions` | 7 | 14 | 6-type reactions (like/love/haha/wow/sad/angry) |
| `post_views` | 13 | 22 | View tracking |
| `post_reports` | 10 | 0 | Reports |
| `post_boosts` | 11 | 2 | Boosted posts |
| `post_edit_history` | 8 | 12 | Edit history |
| `post_interactions` | 6 | 30 | Interaction tracking |
| `reposts` | 5 | 4 | Reposts |
| `user_follows` | 4 | 2 | Follow system |
| `karma_history` | 14 | 29 | Karma events |
| `feed_impressions` | 8 | 30 | Feed tracking |
| `custom_feeds` | 8 | 0 | Custom feed definitions |
| `stories` | 10 | 0 | Stories |
| `pinned_posts` | 5 | 0 | Pinned posts |
| `hidden_posts` | 5 | 0 | Hidden posts |
| `scheduled_posts` | 15 | 0 | Scheduled posts |

### RPC Functions (55 community-related):
- Feed: `get_personalized_feed`, `get_user_activity_feed`, `get_trending_hashtags`
- Scoring: `calculate_hot_score`, `calculate_trending_score`, `update_post_scores`
- Post: `create_forum_post`, `record_post_view`, `auto_categorize_post`
- Karma: `get_karma_leaderboard`, `get_user_karma_full`, `update_user_karma`
- Notifications: `notify_post_comment`, `notify_post_reaction`, `notify_new_follower`

### Views:
- `forum_comments_threaded` — threaded comment display
- `post_reactions_with_users` — reactions with user info
- `top_performing_posts` — analytics

### Edge Functions:
- `fetch-link-preview` — Link preview extraction
- `Auto-Post-Scheduler` — Auto-posting
- `send-push-notification` — Push notifications
- `og-meta` — Open Graph metadata

**Conclusion: Database is COMPLETE. No new migrations needed. All tables, RPCs, indexes, and edge functions already deployed.**

---

## DESIGN TOKENS (MUST USE)

### JS Tokens (`web design-tokens.js`):
```
COLORS: { primary: '#FFBD59', accent: '#6A5BFF', bgPrimary: '#0A0B1A', bgCard: '#1A1B3A', ... }
SPACING: { xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, '2xl': 32, ... }
TYPOGRAPHY: { fontSize: { xs: 10, sm: 12, base: 14, md: 16, lg: 18, ... } }
RADIUS: { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 }
SHADOWS: { sm, md, lg, glow: { gold, purple, cyan, green } }
ANIMATION: { spring configs, cardHover, fadeIn, slideUp, stagger }
BREAKPOINTS: { xs: 375, sm: 640, md: 768, lg: 1024, xl: 1280 }
```

### CSS Variables (`frontend/src/styles/design-tokens.css`):
```
--bg-base-dark: #0A0E27  |  --brand-gold: #FFBD59
--text-primary: #FFFFFF   |  --text-secondary: rgba(255,255,255,0.85)
--space-1: 4px to --space-8: 32px  |  --text-xs: 13px to --text-3xl: 48px
--tier-free-color: #3AF7A6  |  --tier3-color: #FFBD59
```

### RULES:
1. Import from existing files — NO hardcoded colors/spacing
2. CSS: use `var(--color-name)` from design-tokens.css
3. JS: import from `web design-tokens.js`
4. Mobile First: base = mobile, `@media (min-width: 768px)` = tablet, `@media (min-width: 1024px)` = desktop

---

## WEB PROJECT INFO

- **Location**: `frontend/src/`
- **Build**: Vite 7.1.7
- **Framework**: React 19.1.1 + React Router 7.9.5
- **State**: Zustand 5.0.8 + Context API
- **Animation**: Framer Motion 12.23.24
- **Icons**: Lucide React
- **Auth**: `useAuth()` from `contexts/AuthContext.jsx`
- **Supabase**: `lib/supabaseClient.js`
- **CSS**: Design tokens + modular CSS files (NOT Tailwind)

---

## AGENT TEAM STRUCTURE

| Agent | Role | Tasks |
|-------|------|-------|
| **leader** (main) | Coordinator | Master plan, task assignment, integration, review |
| **services-agent** | Backend | Port/enhance ForumService, add feedService, commentService, reactionService |
| **components-agent** | UI Builder | PostCard enhancements, reactions, threading, skeletons, lightbox |
| **pages-agent** | Pages | EditPost, UserProfile, HashtagFeed, PostAnalytics, SearchEnhanced |
| **qa-agent** | Quality | Access control, mobile responsive, edge cases, testing |

---

## IMPLEMENTATION PHASES

### Phase A: Services Enhancement (services-agent)
1. Enhance `forum.js` — add reactions (6 types), edit post, scheduled posts, post analytics
2. Create `feedService.js` — personalized feed, following feed, custom feeds, infinite scroll
3. Create `commentService.js` — threaded comments, moderation, mentions
4. Create `reactionService.js` — reaction CRUD, animation triggers
5. Create `karmaService.js` — karma tracking, levels, leaderboard
6. Create `linkPreviewService.js` — fetch-link-preview edge function integration
7. Create `viewTrackingService.js` — record views, impressions
8. Create `giftService.js` — post gifts, gem spending

### Phase B: Components (components-agent)
1. Enhance `PostCard.jsx` — reactions picker, link previews, view count, trending badge, mentions
2. Create `ThreadedComments.jsx` — nested comments with depth indicators
3. Create `CommentItem.jsx` — individual comment with reactions, reply, edit
4. Create `LinkPreviewCard.jsx` — rich link preview cards
5. Create `PostSkeleton.jsx` — skeleton loading for posts
6. Create `ImageLightbox.jsx` — full-screen image viewer
7. Create `ReactionDisplay.jsx` — reaction counts with avatars
8. Create `MentionInput.jsx` — @mention auto-complete
9. Create `ScrollToTop.jsx` — scroll to top button
10. Create `QuotedPost.jsx` — quoted repost display
11. Create `TrendingBadge.jsx` — trending indicator
12. Create `PinnedBadge.jsx` — pinned post indicator

### Phase C: Pages (pages-agent)
1. Create `EditPost.jsx` — edit existing post
2. Create `UserProfile.jsx` — user profile with posts, followers, karma
3. Create `HashtagFeed.jsx` — posts filtered by hashtag
4. Create `PostAnalytics.jsx` — post performance dashboard
5. Create `ScheduledPosts.jsx` — manage scheduled posts
6. Create `EditHistory.jsx` — view post edit history
7. Enhance `Forum3Column.jsx` — infinite scroll, feed types, custom feeds
8. Enhance `ThreadDetail.jsx` — threaded comments, reactions, mentions
9. Add routes to `App.jsx`

### Phase D: Access Control & Polish (qa-agent)
1. Tier-based posting limits
2. Guest can view, login to interact
3. Mobile responsive verification (320px - 1440px)
4. Touch targets >= 44px
5. Loading/error/empty states for ALL components
6. Edge cases: network errors, expired sessions, concurrent edits, rate limiting
7. Tooltips for all main actions
8. Keyboard navigation
9. Accessibility (ARIA labels)

---

## FILE STRUCTURE (New/Modified Web Files)

```
frontend/src/
├── pages/
│   └── Forum/
│       ├── Forum3Column.jsx          # ENHANCE (infinite scroll, feed types)
│       ├── ThreadDetail.jsx          # ENHANCE (threaded comments, reactions)
│       ├── CreateThread.jsx          # ENHANCE (mentions, link preview, schedule)
│       ├── EditPost.jsx              # NEW
│       ├── UserProfile.jsx           # NEW
│       ├── HashtagFeed.jsx           # NEW
│       ├── PostAnalytics.jsx         # NEW
│       ├── ScheduledPosts.jsx        # NEW
│       ├── EditHistory.jsx           # NEW
│       └── components/
│           ├── PostCard.jsx          # ENHANCE (reactions, link preview, mentions)
│           ├── CenterFeed.jsx        # ENHANCE (infinite scroll, custom feeds)
│           ├── LeftSidebar.jsx       # ENHANCE (custom feeds, karma)
│           ├── RightSidebar.jsx      # ENHANCE (karma leaderboard)
│           ├── ThreadedComments.jsx  # NEW
│           ├── CommentItem.jsx       # NEW
│           ├── LinkPreviewCard.jsx   # NEW
│           ├── PostSkeleton.jsx      # NEW
│           ├── ImageLightbox.jsx     # NEW
│           ├── ReactionDisplay.jsx   # NEW
│           ├── MentionInput.jsx      # NEW
│           ├── ScrollToTop.jsx       # NEW
│           ├── QuotedPost.jsx        # NEW
│           ├── TrendingBadge.jsx     # NEW
│           ├── PinnedBadge.jsx       # NEW
│           └── PostCreationModal.jsx # ENHANCE
├── services/
│   ├── forum.js                     # ENHANCE (reactions, edit, schedule, analytics)
│   ├── feedService.js               # NEW
│   ├── commentService.js            # NEW
│   ├── reactionService.js           # NEW
│   ├── karmaService.js              # NEW
│   ├── linkPreviewService.js        # NEW
│   ├── viewTrackingService.js       # NEW
│   └── giftService.js               # NEW
└── hooks/
    ├── usePosts.js                  # NEW (infinite scroll, pagination)
    ├── useComments.js               # NEW (threaded comments)
    ├── useReactions.js              # NEW (reaction state)
    └── useKarma.js                  # NEW (karma display)
```

---

## ROLLBACK STRATEGY

1. Git branch: `feature/home-community-web-sync`
2. Each phase committed separately
3. Revert: `git checkout main`
4. Backup of original files created before modifications

---

## RULES (ALL AGENTS MUST FOLLOW)

1. **Design Tokens**: Import from existing files. NO hardcoded colors/spacing.
2. **Mobile First**: Base CSS = mobile. @media min-width for larger screens.
3. **from('profiles')**: All DB queries use `profiles` table, NOT `users`.
4. **Error Handling**: try/finally with loading states. AbortController for fetches.
5. **Auth**: Use `useAuth()` hook. Check `currentUser` before mutations.
6. **Supabase**: Import from `lib/supabaseClient.js`.
7. **Framer Motion**: Use for animations.
8. **Lucide Icons**: Use for all icons.
9. **Vietnamese**: All user-facing text in Vietnamese.
10. **RLS**: All queries go through RLS. No service_role on client.
