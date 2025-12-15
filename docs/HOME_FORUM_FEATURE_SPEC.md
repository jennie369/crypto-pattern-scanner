# GEM MOBILE - HOME/FORUM COMPLETE FEATURE SPECIFICATION

## Document Version: 1.0
## Last Updated: December 2024

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Core Screens](#3-core-screens)
4. [Components Library](#4-components-library)
5. [Services Layer](#5-services-layer)
6. [Cross-Feature Integrations](#6-cross-feature-integrations)
7. [Design System](#7-design-system)
8. [User Flows](#8-user-flows)
9. [Data Models](#9-data-models)
10. [Real-time Features](#10-real-time-features)
11. [Feed Algorithm](#11-feed-algorithm)
12. [Monetization System](#12-monetization-system)
13. [File Manifest](#13-file-manifest)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Overview
Tab Home/Forum là trung tâm xã hội của GEM Mobile, cung cấp trải nghiệm mạng xã hội đầy đủ tích hợp với các tính năng độc đáo: GEM currency, product tagging, sound effects, boost posts, và notifications system.

### 1.2 Core Features
- **Unified Feed System** - Hybrid algorithm (60% following + 40% discovery)
- **Post Creation/Editing** - Multi-image, products, sound, audience control
- **Interactions** - Like animation, comments, share, repost, gift
- **Monetization** - Boost posts using GEM currency
- **Product Tagging** - Tag up to 5 Shopify products per post
- **Sound Effects** - Attach background music to posts
- **Real-time Updates** - Live post/comment/like updates
- **User Profiles** - Follow system, posts/photos tabs
- **Sponsor Banners** - Native ads distributed in feed
- **Seed Posts** - Pre-populated content for cold start

### 1.3 Key Integrations
| Integration | Description |
|-------------|-------------|
| GEM Currency | Wallet shortcuts, boost payment, gift sending |
| Product Tagging | Shopify products in posts, affiliate tracking |
| Sound Effects | Background music attachment, sound library |
| Boost Posts | Paid promotion using GEM currency |
| Notifications | Like, comment, follow, mention alerts |
| Mentions/Hashtags | @user tagging, #hashtag filtering |

---

## 2. ARCHITECTURE OVERVIEW

### 2.1 Directory Structure
```
gem-mobile/src/
├── screens/Forum/
│   ├── ForumScreen.js              # Main feed screen
│   ├── PostDetailScreen.js         # Post with comments
│   ├── CreatePostScreen.js         # New post modal
│   ├── EditPostScreen.js           # Edit post modal
│   ├── UserProfileScreen.js        # User profile view
│   └── components/
│       ├── PostCard.js             # Post preview component
│       ├── FABButton.js            # Floating action button
│       └── CategoryTabs.js         # Feed type tabs
├── screens/tabs/
│   └── HomeScreen.js               # Alternative home (if used)
├── screens/Monetization/
│   ├── BoostPostScreen.js          # Boost campaign creation
│   └── SelectPostForBoostScreen.js # Post selection for boost
├── components/
│   ├── Forum/
│   │   └── AdCard.js               # Feed advertisements
│   ├── MentionInput.js             # @mention support
│   ├── ProductPicker.js            # Product selection modal
│   ├── RichTextEditor.js           # Text formatting
│   ├── ShareSheet.js               # Share options
│   ├── RepostSheet.js              # Repost with quote
│   ├── GiftCatalogSheet.js         # Gift sending
│   ├── ReceivedGiftsBar.js         # Gift display
│   ├── SoundCard.js                # Audio display
│   └── SoundPicker.js              # Audio selection
└── services/
    ├── forumService.js             # Post CRUD operations
    ├── feedService.js              # Hybrid feed algorithm
    ├── repostService.js            # Repost functionality
    ├── shareService.js             # Sharing integrations
    ├── soundService.js             # Sound effects management
    ├── notificationService.js      # Notification handling
    └── gamificationService.js      # GEM rewards
```

### 2.2 Technology Stack
- **UI Framework**: React Native + Expo
- **State Management**: React Context + useState
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Storage**: Supabase Storage (images, sounds)
- **Real-time**: Supabase Realtime subscriptions
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Animation**: React Native Animated + Reanimated

### 2.3 Data Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                        FORUM ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ ForumScreen  │───▶│ feedService  │───▶│   Supabase   │       │
│  │   (Feed)     │    │ (Algorithm)  │    │  (Database)  │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                    │               │
│         ▼                   ▼                    ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  PostCard    │◀──▶│forumService  │◀──▶│   Realtime   │       │
│  │ (Component)  │    │   (CRUD)     │    │ Subscriptions│       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                                    │
│         ▼                   ▼                                    │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              Cross-Feature Integrations              │       │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │       │
│  │  │  GEM   │ │Products│ │ Sound  │ │ Boost  │        │       │
│  │  │Currency│ │Tagging │ │Effects │ │ Posts  │        │       │
│  │  └────────┘ └────────┘ └────────┘ └────────┘        │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. CORE SCREENS

### 3.1 ForumScreen (Main Feed)
**File**: `gem-mobile/src/screens/Forum/ForumScreen.js`

#### 3.1.1 Purpose
Main social feed screen displaying posts from following users and discovery algorithm.

#### 3.1.2 State Management
```javascript
// Core Feed State
const [posts, setPosts] = useState([]);
const [feedItems, setFeedItems] = useState([]);  // Mixed posts + ads
const [sessionId, setSessionId] = useState(null);
const [selectedFeed, setSelectedFeed] = useState('explore');
const [selectedTopic, setSelectedTopic] = useState(null);

// Loading State
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);

// Pagination State
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

// UI State
const [menuOpen, setMenuOpen] = useState(false);
const [useHybridFeed, setUseHybridFeed] = useState(true);
```

#### 3.1.3 Key Functions

**loadPosts(reset)** - Load posts using unified feed system
```javascript
const loadPosts = async (reset = false) => {
  if (reset) {
    setPage(1);
    setHasMore(true);
  }

  const currentPage = reset ? 1 : page;
  const feedData = await feedService.generateFeed(
    user?.id,
    sessionId,
    POSTS_PER_PAGE * currentPage
  );

  // Inject sponsor banners
  const feedWithBanners = injectBannersIntoFeed(feedData.posts, banners);
  setFeedItems(feedWithBanners);
};
```

**loadHybridFeed(reset)** - Load posts using hybrid algorithm
```javascript
const loadHybridFeed = async (reset = false) => {
  // 60% following posts + 40% discovery posts
  const hybridData = await feedService.getHybridFeed(
    user?.id,
    reset ? 0 : offset,
    limit
  );

  const scoredPosts = await feedService.scorePostsForUser(
    user?.id,
    hybridData.posts
  );

  return scoredPosts;
};
```

**trackVisibleImpressions()** - Track post impressions
```javascript
const trackVisibleImpressions = useCallback(async () => {
  // Track when post is 50% visible for 300ms
  const visiblePosts = getVisiblePosts();
  await feedService.trackImpressions(
    user?.id,
    sessionId,
    visiblePosts
  );
}, [sessionId, user?.id]);
```

#### 3.1.4 UI Components

**Header Section**
```
┌─────────────────────────────────────────────────────────────┐
│  ☰  GEM FORUM                           🔔  🔍  ✉️          │
├─────────────────────────────────────────────────────────────┤
│  [💎 Ví Gems] [💰 Thu Nhập] [🎵 Âm Thanh] [🚀 Quảng Bá]    │
├─────────────────────────────────────────────────────────────┤
│  [Dành cho bạn] [Đang theo dõi] [Tin tức] [Academy] [...]   │
└─────────────────────────────────────────────────────────────┘
```

**Header Shortcuts**
| Icon | Label | Action |
|------|-------|--------|
| 💎 | Ví Gems | Navigate to Wallet screen |
| 💰 | Thu Nhập | Navigate to Earnings screen |
| 🎵 | Âm Thanh | Navigate to Sound Library |
| 🚀 | Quảng Bá | Navigate to Boost Post selection |

**Category Tabs**
| Tab ID | Label | Feed Type |
|--------|-------|-----------|
| explore | Dành cho bạn | Hybrid algorithm feed |
| following | Đang theo dõi | Posts from followed users |
| news | Tin tức | News category posts |
| academy | Academy | Educational posts |
| popular | Phổ biến | Popular by engagement |

#### 3.1.5 Features
- **Animated Header** - Hides on scroll down, shows on scroll up
- **Pull-to-Refresh** - Refresh feed with gesture
- **Infinite Scroll** - Load more at 30% from bottom
- **Session Tracking** - Track user session for analytics
- **Sponsor Banners** - Injected between posts
- **Real-time Updates** - Subscribe to new posts
- **FAB Button** - Floating button for post creation

#### 3.1.6 Real-time Subscriptions
```javascript
useEffect(() => {
  const channel = supabase
    .channel('forum-realtime')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'forum_posts'
    }, handleNewPost)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'forum_posts'
    }, handlePostUpdate)
    .on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'forum_posts'
    }, handlePostDelete)
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

---

### 3.2 PostDetailScreen
**File**: `gem-mobile/src/screens/Forum/PostDetailScreen.js`

#### 3.2.1 Purpose
Display full post content with comments, reactions, and interactions.

#### 3.2.2 State Management
```javascript
// Post State
const [post, setPost] = useState(null);
const [comments, setComments] = useState([]);

// Interaction State
const [liked, setLiked] = useState(false);
const [saved, setSaved] = useState(false);

// Comment State
const [comment, setComment] = useState('');
const [replyingTo, setReplyingTo] = useState(null);
const [submitting, setSubmitting] = useState(false);

// Modal State
const [imageViewerVisible, setImageViewerVisible] = useState(false);
const [giftSheetVisible, setGiftSheetVisible] = useState(false);

// Keyboard State
const [keyboardVisible, setKeyboardVisible] = useState(false);
```

#### 3.2.3 Key Functions

**loadPost()** - Fetch post with comments
```javascript
const loadPost = async () => {
  const postData = await forumService.getPost(postId);
  const commentsData = await forumService.getCommentsWithReplies(postId);

  setPost(postData);
  setComments(commentsData);
  setLiked(postData.user_liked);
  setSaved(postData.user_saved);
};
```

**handleComment()** - Submit comment
```javascript
const handleComment = async () => {
  if (!comment.trim()) return;

  const newComment = await forumService.createComment(
    postId,
    comment,
    replyingTo?.id  // Parent comment ID for replies
  );

  setComments(prev => [...prev, newComment]);
  setComment('');
  setReplyingTo(null);
};
```

**renderFormattedText(text)** - Render formatted text
```javascript
const renderFormattedText = (text, baseStyle) => {
  // Parse **bold**, #hashtags, @mentions
  const parts = text.split(/(\*\*[^*]+\*\*|#\w+|@\w+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**')) {
      return <Text key={index} style={styles.bold}>
        {part.slice(2, -2)}
      </Text>;
    }
    if (part.startsWith('#')) {
      return <Text
        key={index}
        style={styles.hashtag}
        onPress={() => navigateToHashtag(part)}
      >
        {part}
      </Text>;
    }
    if (part.startsWith('@')) {
      return <Text
        key={index}
        style={styles.mention}
        onPress={() => navigateToUser(part)}
      >
        {part}
      </Text>;
    }
    return <Text key={index}>{part}</Text>;
  });
};
```

#### 3.2.4 UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ←  Bài viết                                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────┐  Author Name  [Badge] [Badge]                      │
│  │ AVA │  @username · 2 giờ trước                     ⋮     │
│  └─────┘                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Post content with **bold**, #hashtags, and @mentions       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │              Post Image (1:1 ratio)                 │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  🛍️ Sản phẩm gắn kèm                                        │
│  ┌──────┐ ┌──────┐ ┌──────┐                                │
│  │ Prod │ │ Prod │ │ Prod │  ───▶                          │
│  │  1   │ │  2   │ │  3   │                                │
│  └──────┘ └──────┘ └──────┘                                │
├─────────────────────────────────────────────────────────────┤
│  👁️ 1,234 lượt xem                                          │
├─────────────────────────────────────────────────────────────┤
│  [❤️ Thích] [💬 Bình luận] [📤 Gửi] [🔄 Repost] [🎁 Gift] [📑]│
├─────────────────────────────────────────────────────────────┤
│  💎 Quà tặng: 50 💎                                         │
├─────────────────────────────────────────────────────────────┤
│  📝 Bình luận (15)                                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────┐  Commenter Name                                    │
│  │ AVA │  Comment text here...                              │
│  └─────┘  2 giờ · Thích · Trả lời                          │
│           └─ ┌─────┐ Reply Author                          │
│              │ AVA │ Reply text...                          │
│              └─────┘ 1 giờ · Thích                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Viết bình luận...                              [Gửi]│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2.5 Action Bar
| Button | Icon | Action |
|--------|------|--------|
| Thích | ❤️ | Toggle like with animation |
| Bình luận | 💬 | Focus comment input |
| Gửi | 📤 | Open ShareSheet |
| Repost | 🔄 | Open RepostSheet |
| Gift | 🎁 | Open GiftCatalogSheet |
| Save | 📑 | Toggle save/bookmark |

---

### 3.3 CreatePostScreen
**File**: `gem-mobile/src/screens/Forum/CreatePostScreen.js`

#### 3.3.1 Purpose
Modal screen for creating new posts with media, products, and sound.

#### 3.3.2 State Management
```javascript
// Content State
const [content, setContent] = useState('');
const [selectedTopic, setSelectedTopic] = useState(null);
const [audience, setAudience] = useState('public');

// Media State
const [selectedImages, setSelectedImages] = useState([]);
const [uploading, setUploading] = useState(false);

// Attachments State
const [selectedSound, setSelectedSound] = useState(null);
const [linkedProducts, setLinkedProducts] = useState([]);

// Modal State
const [showTopicPicker, setShowTopicPicker] = useState(false);
const [showImageEditor, setShowImageEditor] = useState(false);
const [showSoundPicker, setShowSoundPicker] = useState(false);
const [showProductPicker, setShowProductPicker] = useState(false);

// Submit State
const [submitting, setSubmitting] = useState(false);
```

#### 3.3.3 Topics Configuration

**User Topics**
| Topic | Color | Icon |
|-------|-------|------|
| GIAO DỊCH (Trading) | #00F0FF (cyan) | 📊 |
| TINH THẦN (Wellness) | #6A5BFF (purple) | 🧘 |
| THỊNH VƯỢNG (Prosperity) | #FFBD59 (gold) | 💰 |

**Admin Topics** (Additional)
| Topic | Color | Icon |
|-------|-------|------|
| AFFILIATE | #FF6B6B (red) | 🤝 |
| TIN TỨC (News) | #4ECDC4 (cyan) | 📰 |
| THÔNG BÁO (Announcement) | #FFE66D (yellow) | 📢 |
| ACADEMY | #A855F7 (purple) | 🎓 |

#### 3.3.4 Key Functions

**handlePickImage()** - Select images from library
```javascript
const handlePickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: 10 - selectedImages.length,
    quality: 0.8,
  });

  if (!result.canceled) {
    setSelectedImages(prev => [...prev, ...result.assets]);
  }
};
```

**handleSubmit()** - Create post
```javascript
const handleSubmit = async () => {
  setSubmitting(true);

  // 1. Upload images
  const mediaUrls = await forumService.uploadMultipleImages(
    selectedImages.map(img => img.uri)
  );

  // 2. Extract hashtags
  const hashtags = content.match(/#\w+/g) || [];

  // 3. Create post
  const postData = {
    content,
    title: content.split('\n')[0].slice(0, 100),
    media_urls: mediaUrls,
    image_url: mediaUrls[0],
    topic: selectedTopic?.id,
    visibility: audience,
    hashtags,
    sound_id: selectedSound?.id,
  };

  const newPost = await forumService.createPost(postData);

  // 4. Link products
  if (linkedProducts.length > 0) {
    await forumService.linkProductsToPost(newPost.id, linkedProducts);
  }

  navigation.goBack();
};
```

#### 3.3.5 UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ✕  Tạo bài viết mới                              [Đăng]   │
├─────────────────────────────────────────────────────────────┤
│  [📊 GIAO DỊCH ▼]  (Admin only - Topic selector)           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Bạn đang nghĩ gì?                                   │   │
│  │ Nhập nội dung bài viết...                           │   │
│  │ @mention và #hashtag được hỗ trợ                    │   │
│  │                                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  [📷 Ảnh/Video]  [👥 Gắn thẻ người]                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │  Image   │ │  Image   │ │  Image   │                    │
│  │    1     │ │    2     │ │    3     │  + Add more        │
│  │  [COVER] │ │          │ │          │                    │
│  │    ✕     │ │    ✕     │ │    ✕     │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
├─────────────────────────────────────────────────────────────┤
│  [🎵 Âm Thanh]  [🌐 Công khai ▼]  [🛍️ Gắn SP]               │
├─────────────────────────────────────────────────────────────┤
│  🎵 Sound Card (if selected)                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎵 Sound Name - Artist                         ✕    │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  🛍️ Products (if selected)                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐                                │
│  │ Prod │ │ Prod │ │ +Add │                                │
│  └──────┘ └──────┘ └──────┘                                │
└─────────────────────────────────────────────────────────────┘
```

#### 3.3.6 Audience Options
| Option | Label | Description |
|--------|-------|-------------|
| public | Công khai | Mọi người đều có thể xem |
| followers | Người theo dõi | Chỉ người theo dõi |
| private | Riêng tư | Chỉ mình tôi |

#### 3.3.7 Constraints
- **Max Images**: 10 per post
- **Max Products**: 5 per post
- **Max Sound**: 1 per post
- **Image Quality**: 0.8 (80%)
- **Image Crop**: 16:9 aspect ratio (optional)
- **Content**: Required (cannot post empty)

---

### 3.4 EditPostScreen
**File**: `gem-mobile/src/screens/Forum/EditPostScreen.js`

#### 3.4.1 Purpose
Modal screen for editing existing posts (author or admin only).

#### 3.4.2 Additional Features vs CreatePostScreen
- **Delete Post** - Danger zone with confirmation
- **Preserve Media** - Keep existing images, add new ones
- **Track Changes** - Detect if images/products changed
- **Seed Post Support** - Can edit both forum_posts and seed_posts
- **Authorization** - Only author or admin can edit

#### 3.4.3 Delete Post Flow
```javascript
const handleDeletePost = async () => {
  Alert.alert(
    'Xóa bài viết',
    'Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác.',
    [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await forumService.deletePost(post.id);
          navigation.navigate('Forum');
        }
      }
    ]
  );
};
```

---

### 3.5 UserProfileScreen
**File**: `gem-mobile/src/screens/Forum/UserProfileScreen.js`

#### 3.5.1 Purpose
Display user profile with posts, photos, and follow functionality.

#### 3.5.2 State Management
```javascript
// Profile State
const [resolvedUserId, setResolvedUserId] = useState(paramUserId);
const [profile, setProfile] = useState(null);
const [isFollowing, setIsFollowing] = useState(false);

// Content State
const [posts, setPosts] = useState([]);
const [photos, setPhotos] = useState([]);
const [videos, setVideos] = useState([]);
const [activeTab, setActiveTab] = useState('posts');

// Stats State
const [stats, setStats] = useState({
  followers: 0,
  following: 0,
  posts: 0
});
```

#### 3.5.3 Profile Tabs
| Tab | Label | Content |
|-----|-------|---------|
| posts | Bài Viết | All user posts |
| photos | Hình Ảnh | Posts with images |
| videos | Video | Video posts (placeholder) |

#### 3.5.4 UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ←  Trang cá nhân                                    ⋮      │
├─────────────────────────────────────────────────────────────┤
│       ┌───────────┐                                         │
│       │           │                                         │
│       │  Avatar   │    Display Name                         │
│       │   80x80   │    [Badge] [Badge] [Badge]              │
│       │           │    @username                            │
│       └───────────┘                                         │
│                                                             │
│       Bio text here...                                      │
├─────────────────────────────────────────────────────────────┤
│     ┌────────┐    ┌────────┐    ┌────────┐                 │
│     │   24   │    │  1.2K  │    │   456  │                 │
│     │ Posts  │    │Followers│   │Following│                 │
│     └────────┘    └────────┘    └────────┘                 │
├─────────────────────────────────────────────────────────────┤
│     [    Theo dõi    ]    [    Nhắn tin    ]               │
├─────────────────────────────────────────────────────────────┤
│  [Bài Viết (24)] [Hình Ảnh (18)] [Video (0)]               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tab Content (Posts/Photos/Videos grid)                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3.5.5 Features
- **Username Resolution** - Support @username navigation
- **Follow/Unfollow** - Toggle follow status
- **Direct Message** - Navigate to conversation
- **Stats Navigation** - Tap followers/following for lists
- **Pull-to-Refresh** - Refresh profile data

---

## 4. COMPONENTS LIBRARY

### 4.1 PostCard
**File**: `gem-mobile/src/screens/Forum/components/PostCard.js`

#### 4.1.1 Purpose
Reusable post preview component with full interaction support.

#### 4.1.2 Props
```typescript
interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onRepost?: () => void;
  onGift?: () => void;
  onSave?: () => void;
  onAuthorPress?: () => void;
  onProductPress?: (product: Product) => void;
  showInlineComments?: boolean;
}
```

#### 4.1.3 State Management
```javascript
// Interaction State
const [isLiked, setIsLiked] = useState(post.user_liked || false);
const [likesCount, setLikesCount] = useState(post.likes_count || 0);
const [isSaved, setIsSaved] = useState(post.user_saved || false);
const [isLiking, setIsLiking] = useState(false);

// UI State
const [isExpanded, setIsExpanded] = useState(false);
const [showViewMore, setShowViewMore] = useState(false);
const [showMenu, setShowMenu] = useState(false);
const [isHidden, setIsHidden] = useState(false);

// Modal State
const [shareSheetVisible, setShareSheetVisible] = useState(false);
const [repostSheetVisible, setRepostSheetVisible] = useState(false);
const [giftSheetVisible, setGiftSheetVisible] = useState(false);
const [reactionsVisible, setReactionsVisible] = useState(false);
const [imageViewerVisible, setImageViewerVisible] = useState(false);

// Comments State
const [showComments, setShowComments] = useState(false);
const [inlineComments, setInlineComments] = useState([]);
const [commentText, setCommentText] = useState('');
```

#### 4.1.4 Key Features

**Double-Tap Like**
```javascript
const lastTap = useRef(0);
const DOUBLE_TAP_DELAY = 300;

const handleImagePress = () => {
  const now = Date.now();
  if (now - lastTap.current < DOUBLE_TAP_DELAY) {
    // Double tap detected
    handleLike();
    showBigHeartAnimation();
  }
  lastTap.current = now;
};
```

**Like Animation**
```javascript
const likeScale = useRef(new Animated.Value(1)).current;
const bigHeartOpacity = useRef(new Animated.Value(0)).current;
const bigHeartScale = useRef(new Animated.Value(0.5)).current;

const animateLike = () => {
  Animated.sequence([
    Animated.spring(likeScale, {
      toValue: 1.3,
      useNativeDriver: true,
    }),
    Animated.spring(likeScale, {
      toValue: 1,
      useNativeDriver: true,
    }),
  ]).start();
};

const showBigHeartAnimation = () => {
  Animated.parallel([
    Animated.timing(bigHeartOpacity, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.spring(bigHeartScale, {
      toValue: 1,
      useNativeDriver: true,
    }),
  ]).start(() => {
    Animated.timing(bigHeartOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  });
};
```

**Inline Comments (Facebook-style)**
```javascript
const loadInlineComments = async () => {
  const comments = await forumService.getComments(post.id, 3);
  setInlineComments(comments);
};

// Render max 3 comments with expand option
const renderInlineComments = () => (
  <View style={styles.inlineCommentsContainer}>
    {inlineComments.slice(0, 3).map(comment => (
      <CommentItem key={comment.id} comment={comment} />
    ))}
    {post.comments_count > 3 && (
      <TouchableOpacity onPress={navigateToPost}>
        <Text style={styles.viewMoreComments}>
          Xem thêm {post.comments_count - 3} bình luận
        </Text>
      </TouchableOpacity>
    )}
  </View>
);
```

#### 4.1.5 UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────┐  Author Name  [Badge] [Badge]              ⋮      │
│  │ AVA │  @username · 2h                                   │
│  └─────┘                                                   │
├─────────────────────────────────────────────────────────────┤
│  Post content text here...                                  │
│  Can be expanded if too long                                │
│  [Xem thêm]                                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │           Image Carousel / Single Image             │   │
│  │                                                     │   │
│  │                    [❤️ BIG HEART]                   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  [🛍️] Product tag overlay                                  │
├─────────────────────────────────────────────────────────────┤
│  🎵 Sound Card (if attached)                               │
├─────────────────────────────────────────────────────────────┤
│  🛍️ Tagged Products                                         │
│  ┌──────┐ ┌──────┐                                         │
│  │ Prod │ │ Prod │  ───▶                                   │
│  └──────┘ └──────┘                                         │
├─────────────────────────────────────────────────────────────┤
│  👁️ 1,234 views · [🚀 BOOSTED]                              │
├─────────────────────────────────────────────────────────────┤
│  ❤️ 245        💬 18        🔄 5                            │
├─────────────────────────────────────────────────────────────┤
│  [❤️ Thích] [💬 Bình luận] [📤 Gửi] [🔄] [🎁] [📑]          │
├─────────────────────────────────────────────────────────────┤
│  💎 Đã nhận: 50 💎                                          │
├─────────────────────────────────────────────────────────────┤
│  Inline Comments (max 3)                                    │
│  ┌─────┐ User1: Comment text...                            │
│  └─────┘ 1h · Thích · Trả lời                              │
│  ┌─────┐ User2: Another comment...                         │
│  └─────┘ 30m · Thích · Trả lời                             │
│  [Xem thêm 15 bình luận]                                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Viết bình luận...                              [Gửi]│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### 4.1.6 Menu Actions
| Action | Icon | Visibility | Function |
|--------|------|------------|----------|
| Chỉnh sửa | ✏️ | Author/Admin | Navigate to EditPost |
| Xóa | 🗑️ | Author/Admin | Delete with confirmation |
| Báo cáo | 🚩 | Others | Open report modal |
| Ẩn bài viết | 👁️‍🗨️ | Others | Hide from feed |
| Chặn | 🚫 | Others | Block user |
| Sao chép link | 🔗 | All | Copy post link |

---

### 4.2 FABButton
**File**: `gem-mobile/src/screens/Forum/components/FABButton.js`

#### 4.2.1 Styling
```javascript
const styles = {
  fab: {
    position: 'absolute',
    bottom: 140,  // Above tab bar
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B0000',  // Dark red
    borderWidth: 2,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    color: COLORS.gold,
    size: 28,
  },
};
```

---

### 4.3 AdCard
**File**: `gem-mobile/src/components/Forum/AdCard.js`

#### 4.3.1 Purpose
Display native advertisements in feed.

#### 4.3.2 Ad Types

**Tier Upgrade Ads**
```javascript
const TIER_UPGRADE_ADS = {
  tier_upgrade_1: {
    title: 'Nâng cấp lên Premium',
    subtitle: 'Truy cập tất cả pattern và công cụ',
    icon: 'crown',
    color: COLORS.gold,
    cta: 'Nâng cấp ngay',
    action: { type: 'screen', target: 'TierUpgrade' },
  },
  tier_upgrade_2: {
    title: 'Mở khóa Pro Features',
    subtitle: 'Multi-timeframe scanner, AI signals',
    icon: 'zap',
    color: COLORS.cyan,
    cta: 'Khám phá',
    action: { type: 'screen', target: 'TierUpgrade' },
  },
};
```

**Affiliate Product Ads**
```javascript
const AFFILIATE_AD = {
  type: 'affiliate_product',
  title: 'Sản phẩm nổi bật',
  subtitle: 'Kiếm hoa hồng với mỗi lượt giới thiệu',
  icon: 'shopping-bag',
  color: COLORS.purple,
  cta: 'Xem sản phẩm',
  action: { type: 'screen', target: 'Shop' },
};
```

**Course Promo Ads**
```javascript
const COURSE_AD = {
  type: 'course_promo',
  title: 'Khóa học mới',
  subtitle: 'Học trading từ chuyên gia',
  icon: 'book-open',
  color: COLORS.success,
  cta: 'Đăng ký ngay',
  action: { type: 'screen', target: 'Courses' },
};
```

**Sponsor Banner Ads** (from database)
```javascript
// Fetched from sponsor_banners table
const sponsorBanner = {
  id: 'banner-1',
  title: 'Banner Title',
  subtitle: 'Banner subtitle text',
  image_url: 'https://...',
  background_color: '#1a1a2e',
  accent_color: '#FFBD59',
  text_color: '#FFFFFF',
  cta_text: 'Tìm hiểu',
  action_type: 'url' | 'screen' | 'deeplink',
  action_value: 'https://...' | 'ScreenName' | 'gem://...',
  priority: 1,
  active_from: timestamp,
  active_to: timestamp,
};
```

#### 4.3.3 UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ═══════════════════════════════════════════ (accent line)   │
│                                                             │
│  [Sponsor]                                                  │
│                                                             │
│     👑  Ad Title                                            │
│         Ad subtitle text here                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Ad Image (if available)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                              [CTA Button →]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.4 MentionInput
**File**: `gem-mobile/src/components/MentionInput.js`

#### 4.4.1 Purpose
Text input with @mention autocomplete support.

#### 4.4.2 Features
- **Trigger Detection** - Detect @username typing
- **User Search** - Search users by username/name
- **Autocomplete Dropdown** - Show matching users
- **Selection** - Insert selected user @mention
- **Styling** - Highlight mentions in cyan

#### 4.4.3 Usage
```jsx
<MentionInput
  value={content}
  onChangeText={setContent}
  placeholder="Bạn đang nghĩ gì?"
  multiline
  style={styles.input}
/>
```

---

### 4.5 ProductPicker
**File**: `gem-mobile/src/components/ProductPicker.js`

#### 4.5.1 Purpose
Modal for selecting products to tag in posts.

#### 4.5.2 Features
- **Multi-Select Mode** - Select up to 5 products
- **Search** - Search products by name
- **Categories** - Filter by product category
- **Preview** - Show product image, name, price
- **Selection Badge** - Show selected count

#### 4.5.3 Props
```typescript
interface ProductPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (products: Product[]) => void;
  selectedProducts?: Product[];
  maxSelection?: number;  // Default: 5
  multiSelect?: boolean;  // Default: true
}
```

---

### 4.6 SoundPicker
**File**: `gem-mobile/src/components/SoundPicker.js`

#### 4.6.1 Purpose
Modal for selecting background music for posts.

#### 4.6.2 Features
- **Sound Library** - Browse available sounds
- **Preview Playback** - Play sound before selecting
- **Categories** - Filter by genre/mood
- **Recent** - Show recently used sounds
- **Favorites** - Show favorited sounds

---

### 4.7 ShareSheet
**File**: `gem-mobile/src/components/ShareSheet.js`

#### 4.7.1 Purpose
Bottom sheet for sharing posts to external platforms.

#### 4.7.2 Share Options
| Platform | Icon | Action |
|----------|------|--------|
| Copy Link | 🔗 | Copy to clipboard |
| WhatsApp | 💬 | Share to WhatsApp |
| Facebook | 📘 | Share to Facebook |
| Twitter | 🐦 | Share to Twitter |
| More | ⋯ | Native share dialog |
| Save Image | 💾 | Save post as image |

---

### 4.8 RepostSheet
**File**: `gem-mobile/src/components/RepostSheet.js`

#### 4.8.1 Purpose
Bottom sheet for reposting with optional quote.

#### 4.8.2 Features
- **Quick Repost** - Repost without comment
- **Quote Repost** - Add text with repost
- **Preview** - Show original post preview
- **Undo** - Remove repost if already reposted

---

### 4.9 GiftCatalogSheet
**File**: `gem-mobile/src/components/GiftCatalogSheet.js`

#### 4.9.1 Purpose
Bottom sheet for sending gifts using GEM currency.

#### 4.9.2 Gift Catalog
| Gift | GEM Cost | Animation |
|------|----------|-----------|
| Coffee | 10 💎 | ☕ |
| Star | 25 💎 | ⭐ |
| Heart | 50 💎 | ❤️ |
| Diamond | 100 💎 | 💎 |
| Crown | 250 💎 | 👑 |
| Rocket | 500 💎 | 🚀 |

---

### 4.10 ReceivedGiftsBar
**File**: `gem-mobile/src/components/ReceivedGiftsBar.js`

#### 4.10.1 Purpose
Display received gifts count on posts.

#### 4.10.2 UI
```
┌─────────────────────────────────────────────────────────────┐
│  💎 Đã nhận: 150 💎  (☕×3 ⭐×2 ❤️×1)                        │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.11 SoundCard
**File**: `gem-mobile/src/components/SoundCard.js`

#### 4.11.1 Purpose
Display attached sound on posts.

#### 4.11.2 UI
```
┌─────────────────────────────────────────────────────────────┐
│  🎵  Sound Name                                    [▶️ Play] │
│      Artist Name · 3:45                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. SERVICES LAYER

### 5.1 forumService.js
**File**: `gem-mobile/src/services/forumService.js`

#### 5.1.1 Post CRUD Operations

**getPosts(options)**
```javascript
async getPosts({
  feedType = 'explore',
  topic = null,
  page = 1,
  limit = 20,
  userId = null,
}) {
  let query = supabase
    .from('forum_posts')
    .select(`
      *,
      profiles:user_id (id, username, full_name, avatar_url, role, badges),
      categories:category_id (id, name, color),
      tagged_products:post_products (*),
      likes:forum_likes(user_id),
      saved:forum_saved(user_id)
    `)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (feedType === 'following') {
    const following = await this.getFollowingIds(userId);
    query = query.in('user_id', following);
  }

  if (topic) {
    query = query.eq('topic', topic);
  }

  const { data, error } = await query;
  return data;
}
```

**createPost(postData)**
```javascript
async createPost({
  content,
  title,
  media_urls,
  image_url,
  topic,
  visibility,
  hashtags,
  sound_id,
}) {
  const { data, error } = await supabase
    .from('forum_posts')
    .insert({
      user_id: this.userId,
      content,
      title: title || content.split('\n')[0].slice(0, 100),
      media_urls,
      image_url: image_url || media_urls?.[0],
      topic,
      visibility: visibility || 'public',
      hashtags: hashtags || [],
      sound_id,
    })
    .select()
    .single();

  return data;
}
```

**updatePost(postId, userId, postData)**
```javascript
async updatePost(postId, userId, postData) {
  // Check authorization
  const post = await this.getPost(postId);
  const canEdit = post.user_id === userId || await this.isAdmin(userId);

  if (!canEdit) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('forum_posts')
    .update({
      ...postData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .select()
    .single();

  return data;
}
```

**deletePost(postId)**
```javascript
async deletePost(postId) {
  // Delete related data first
  await supabase.from('forum_likes').delete().eq('post_id', postId);
  await supabase.from('forum_comments').delete().eq('post_id', postId);
  await supabase.from('post_products').delete().eq('post_id', postId);

  // Delete post
  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId);

  return !error;
}
```

#### 5.1.2 Interaction Methods

**likePost(postId)**
```javascript
async likePost(postId) {
  // Add like
  await supabase.from('forum_likes').insert({
    post_id: postId,
    user_id: this.userId,
  });

  // Increment count
  await supabase.rpc('increment_likes_count', { post_id: postId });

  // Create notification
  await this.createLikeNotification(postId);
}
```

**unlikePost(postId)**
```javascript
async unlikePost(postId) {
  await supabase
    .from('forum_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', this.userId);

  await supabase.rpc('decrement_likes_count', { post_id: postId });
}
```

**createComment(postId, content, parentId)**
```javascript
async createComment(postId, content, parentId = null) {
  const { data, error } = await supabase
    .from('forum_comments')
    .insert({
      post_id: postId,
      user_id: this.userId,
      content,
      parent_id: parentId,
    })
    .select(`
      *,
      profiles:user_id (id, username, full_name, avatar_url)
    `)
    .single();

  // Increment count
  await supabase.rpc('increment_comments_count', { post_id: postId });

  // Create notification
  await this.createCommentNotification(postId, parentId);

  return data;
}
```

#### 5.1.3 Follow System

**followUser(userId)**
```javascript
async followUser(targetUserId) {
  await supabase.from('follows').insert({
    follower_id: this.userId,
    following_id: targetUserId,
  });

  // Create notification
  await this.createFollowNotification(targetUserId);
}
```

**unfollowUser(userId)**
```javascript
async unfollowUser(targetUserId) {
  await supabase
    .from('follows')
    .delete()
    .eq('follower_id', this.userId)
    .eq('following_id', targetUserId);
}
```

#### 5.1.4 Product Tagging

**linkProductsToPost(postId, products)**
```javascript
async linkProductsToPost(postId, products) {
  const productData = products.map((product, index) => ({
    post_id: postId,
    product_id: product.id,
    product_title: product.title,
    product_price: product.price,
    product_image: product.image,
    product_handle: product.handle,
    position: index,
  }));

  await supabase.from('post_products').insert(productData);
}
```

---

### 5.2 feedService.js
**File**: `gem-mobile/src/services/feedService.js`

#### 5.2.1 Feed Configuration
```javascript
const FEED_CONFIG = {
  DEFAULT_LIMIT: 100,
  FOLLOWING_WEIGHT: 0.6,      // 60% following posts
  DISCOVERY_WEIGHT: 0.3,      // 30% discovery posts
  SERENDIPITY_WEIGHT: 0.1,    // 10% random posts
  AD_FIRST_POSITION: 5,       // First ad after 5 posts
  AD_INTERVAL: 10,            // Ad every 10 posts
  MAX_ADS_PER_SESSION: 2,     // Max 2 inline ads
  CACHE_TTL: 300,             // 5 minute cache
};
```

#### 5.2.2 Feed Generation

**generateFeed(userId, sessionId, limit)**
```javascript
async generateFeed(userId, sessionId, limit = FEED_CONFIG.DEFAULT_LIMIT) {
  // 1. Get user's own posts (Facebook style - show newest first)
  const ownPosts = await this.getUserOwnPosts(userId, 5);

  // 2. Get following posts (60%)
  const followingPosts = await this.getFollowingPosts(
    userId,
    Math.floor(limit * FEED_CONFIG.FOLLOWING_WEIGHT)
  );

  // 3. Get discovery posts (30%)
  const discoveryPosts = await this.getDiscoveryPosts(
    userId,
    Math.floor(limit * FEED_CONFIG.DISCOVERY_WEIGHT)
  );

  // 4. Get serendipity posts (10%)
  const serendipityPosts = await this.getSerendipityPosts(
    userId,
    Math.floor(limit * FEED_CONFIG.SERENDIPITY_WEIGHT)
  );

  // 5. Merge and deduplicate
  const allPosts = this.deduplicatePosts([
    ...ownPosts,
    ...followingPosts,
    ...discoveryPosts,
    ...serendipityPosts,
  ]);

  // 6. Score posts
  const scoredPosts = await this.scorePostsForUser(userId, allPosts);

  // 7. Apply diversity rules
  const diversifiedPosts = this.applyDiversityRules(scoredPosts);

  // 8. Insert ads
  const feedWithAds = await this.insertAds(userId, sessionId, diversifiedPosts);

  // 9. Track impressions (non-blocking)
  this.trackImpressions(userId, sessionId, feedWithAds.slice(0, 10));

  return { posts: feedWithAds, sessionId };
}
```

#### 5.2.3 Post Scoring Algorithm

**scorePostsForUser(userId, posts)**
```javascript
async scorePostsForUser(userId, posts) {
  const seenPostIds = await this.getSeenPostIds(userId);

  return posts.map(post => {
    let score = 0;

    // Base score for unseen posts
    if (!seenPostIds.includes(post.id)) {
      score += 10000;
    }

    // Recency bonus
    const hoursAgo = (Date.now() - new Date(post.created_at)) / (1000 * 60 * 60);
    if (hoursAgo < 6) {
      score += 5000;
    } else if (hoursAgo < 24) {
      score += 3000;
    } else if (hoursAgo < 72) {
      score += 1000;
    }

    // Engagement score
    score += (post.likes_count || 0) * 1;
    score += (post.comments_count || 0) * 3;
    score += (post.shares_count || 0) * 5;

    // Time decay for seen posts
    if (seenPostIds.includes(post.id)) {
      const daysSinceSeen = hoursAgo / 24;
      score *= Math.exp(-daysSinceSeen * 0.5);
    }

    return { ...post, _score: score };
  }).sort((a, b) => b._score - a._score);
}
```

#### 5.2.4 Diversity Rules

**applyDiversityRules(posts)**
```javascript
applyDiversityRules(posts) {
  const result = [];
  const authorCounts = {};
  const MAX_CONSECUTIVE_SAME_AUTHOR = 2;

  for (const post of posts) {
    const authorId = post.user_id;
    const recentSameAuthor = result
      .slice(-3)
      .filter(p => p.user_id === authorId).length;

    if (recentSameAuthor < MAX_CONSECUTIVE_SAME_AUTHOR) {
      result.push(post);
      authorCounts[authorId] = (authorCounts[authorId] || 0) + 1;
    } else {
      // Defer to later in feed
      posts.push(post);
    }
  }

  return result;
}
```

#### 5.2.5 Ad Insertion

**insertAds(userId, sessionId, posts)**
```javascript
async insertAds(userId, sessionId, posts) {
  const userTier = await this.getUserTier(userId);

  // No ads for premium users
  if (userTier === 'premium') {
    return posts;
  }

  const result = [...posts];
  let adsInserted = 0;

  // Insert first ad after position 5
  if (result.length > FEED_CONFIG.AD_FIRST_POSITION) {
    const ad = await this.getNextAd(userId, sessionId);
    result.splice(FEED_CONFIG.AD_FIRST_POSITION, 0, { ...ad, _isAd: true });
    adsInserted++;
  }

  // Insert subsequent ads every 10 posts
  let position = FEED_CONFIG.AD_FIRST_POSITION + FEED_CONFIG.AD_INTERVAL;
  while (
    position < result.length &&
    adsInserted < FEED_CONFIG.MAX_ADS_PER_SESSION
  ) {
    const ad = await this.getNextAd(userId, sessionId);
    result.splice(position, 0, { ...ad, _isAd: true });
    adsInserted++;
    position += FEED_CONFIG.AD_INTERVAL;
  }

  return result;
}
```

---

### 5.3 repostService.js
**File**: `gem-mobile/src/services/repostService.js`

#### 5.3.1 Methods

**createRepost(originalPostId, quote)**
```javascript
async createRepost(originalPostId, quote = null) {
  // Check if already reposted
  const existing = await this.hasReposted(originalPostId);
  if (existing) {
    throw new Error('Already reposted');
  }

  // Create repost
  const { data, error } = await supabase
    .from('reposts')
    .insert({
      original_post_id: originalPostId,
      reposter_id: this.userId,
      quote,
    })
    .select()
    .single();

  // Increment repost count
  await supabase.rpc('increment_reposts_count', { post_id: originalPostId });

  return data;
}
```

**removeRepost(originalPostId)**
```javascript
async removeRepost(originalPostId) {
  await supabase
    .from('reposts')
    .delete()
    .eq('original_post_id', originalPostId)
    .eq('reposter_id', this.userId);

  await supabase.rpc('decrement_reposts_count', { post_id: originalPostId });
}
```

---

### 5.4 shareService.js
**File**: `gem-mobile/src/services/shareService.js`

#### 5.4.1 Methods

**generatePostLinks(postId)**
```javascript
generatePostLinks(postId) {
  return {
    deepLink: `gem://post/${postId}`,
    webLink: `https://gemral.com/post/${postId}`,
  };
}
```

**sharePost(post)**
```javascript
async sharePost(post) {
  const { deepLink, webLink } = this.generatePostLinks(post.id);
  const message = this.generateShareContent(post);

  await Share.share({
    message: `${message}\n\n${webLink}`,
    url: webLink,
    title: post.title || 'GEM Post',
  });

  // Track share
  await supabase.rpc('increment_shares_count', { post_id: post.id });
}
```

**shareToWhatsApp(post)**
```javascript
async shareToWhatsApp(post) {
  const { webLink } = this.generatePostLinks(post.id);
  const message = encodeURIComponent(
    `${this.generateShareContent(post)}\n\n${webLink}`
  );

  await Linking.openURL(`whatsapp://send?text=${message}`);
}
```

---

### 5.5 soundService.js
**File**: `gem-mobile/src/services/soundService.js`

#### 5.5.1 Methods

**getSoundLibrary()**
```javascript
async getSoundLibrary() {
  const { data } = await supabase
    .from('sounds')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return data;
}
```

**playSound(soundId)**
```javascript
async playSound(soundId) {
  const sound = await this.getSound(soundId);
  const { sound: audioObject } = await Audio.Sound.createAsync(
    { uri: sound.url },
    { shouldPlay: true }
  );

  this.currentSound = audioObject;
}
```

**stopSound()**
```javascript
async stopSound() {
  if (this.currentSound) {
    await this.currentSound.stopAsync();
    await this.currentSound.unloadAsync();
    this.currentSound = null;
  }
}
```

---

### 5.6 notificationService.js
**File**: `gem-mobile/src/services/notificationService.js`

#### 5.6.1 Notification Types
| Type | Trigger | Message Template |
|------|---------|------------------|
| like | User likes post | "{user} đã thích bài viết của bạn" |
| comment | User comments | "{user} đã bình luận bài viết của bạn" |
| reply | User replies to comment | "{user} đã trả lời bình luận của bạn" |
| follow | User follows | "{user} đã theo dõi bạn" |
| mention | User mentions | "{user} đã nhắc đến bạn" |
| gift | User sends gift | "{user} đã tặng bạn {gift}" |
| boost_complete | Boost ends | "Chiến dịch quảng bá của bạn đã kết thúc" |
| repost | User reposts | "{user} đã chia sẻ lại bài viết của bạn" |

#### 5.6.2 Methods

**getNotifications()**
```javascript
async getNotifications() {
  const { data } = await supabase
    .from('notifications')
    .select(`
      *,
      sender:sender_id (id, username, full_name, avatar_url),
      post:post_id (id, title, image_url)
    `)
    .eq('user_id', this.userId)
    .order('created_at', { ascending: false })
    .limit(50);

  return data;
}
```

**markAsRead(notificationId)**
```javascript
async markAsRead(notificationId) {
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);
}
```

**markAllAsRead()**
```javascript
async markAllAsRead() {
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', this.userId)
    .is('read_at', null);
}
```

---

## 6. CROSS-FEATURE INTEGRATIONS

### 6.1 GEM Currency Integration

#### 6.1.1 Wallet Shortcuts
ForumScreen header provides quick access to GEM-related features:

```javascript
const headerShortcuts = [
  {
    icon: 'gem',
    label: 'Ví Gems',
    screen: 'Wallet',
    color: COLORS.gold,
  },
  {
    icon: 'dollar-sign',
    label: 'Thu Nhập',
    screen: 'Earnings',
    color: COLORS.success,
  },
];
```

#### 6.1.2 Boost Payment
Boost posts using GEM currency:

```javascript
const BOOST_PACKAGES = [
  {
    id: 'basic',
    name: 'Cơ bản',
    gems: 50,
    duration: 1,  // days
    reach: 500,
  },
  {
    id: 'standard',
    name: 'Tiêu chuẩn',
    gems: 120,
    duration: 3,
    reach: 2000,
  },
  {
    id: 'premium',
    name: 'Cao cấp',
    gems: 250,
    duration: 7,
    reach: 5000,
  },
];
```

#### 6.1.3 Gift Sending
Send gifts using GEM currency:

```javascript
const handleSendGift = async (gift, post) => {
  // Deduct gems from sender
  await gemEconomyService.spendGems(gift.cost, 'gift', {
    recipient_id: post.user_id,
    post_id: post.id,
  });

  // Credit gems to recipient
  await gemEconomyService.creditGems(
    post.user_id,
    gift.cost * 0.7,  // 70% to creator
    'gift_received'
  );

  // Create notification
  await notificationService.createGiftNotification(post.user_id, gift);
};
```

---

### 6.2 Product Tagging Integration

#### 6.2.1 Product Selection Flow
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ CreatePost      │────▶│ ProductPicker   │────▶│ Post Created    │
│ Tap "Gắn SP"    │     │ Multi-select    │     │ With Products   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

#### 6.2.2 Product Display in Posts
```javascript
const renderTaggedProducts = (products) => (
  <View style={styles.taggedProductsContainer}>
    <Text style={styles.taggedProductsLabel}>
      🛍️ Sản phẩm gắn kèm
    </Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {products.map(product => (
        <TouchableOpacity
          key={product.id}
          style={styles.taggedProductCard}
          onPress={() => navigateToProduct(product)}
        >
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <Text style={styles.productTitle} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.productPrice}>
            {formatPrice(product.price)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);
```

#### 6.2.3 Affiliate Tracking
When user taps tagged product:

```javascript
const handleProductPress = async (product, post) => {
  // Track affiliate click
  await affiliateService.trackProductClick({
    product_id: product.id,
    post_id: post.id,
    referrer_id: post.user_id,
    viewer_id: currentUserId,
  });

  // Navigate to product
  navigation.navigate('ProductDetail', { productId: product.id });
};
```

---

### 6.3 Sound Effects Integration

#### 6.3.1 Sound Attachment Flow
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ CreatePost      │────▶│ SoundPicker     │────▶│ Post Created    │
│ Tap "Âm Thanh"  │     │ Preview & Select│     │ With Sound      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

#### 6.3.2 Sound Display in Posts
```javascript
const SoundCard = ({ sound, onPlay, onPause, isPlaying }) => (
  <View style={styles.soundCard}>
    <View style={styles.soundIcon}>
      <Feather name="music" size={20} color={COLORS.cyan} />
    </View>
    <View style={styles.soundInfo}>
      <Text style={styles.soundName}>{sound.name}</Text>
      <Text style={styles.soundArtist}>{sound.artist}</Text>
    </View>
    <TouchableOpacity onPress={isPlaying ? onPause : onPlay}>
      <Feather
        name={isPlaying ? 'pause' : 'play'}
        size={24}
        color={COLORS.gold}
      />
    </TouchableOpacity>
  </View>
);
```

#### 6.3.3 Sound Library Shortcut
```javascript
// ForumScreen header shortcut
{
  icon: 'music',
  label: 'Âm Thanh',
  screen: 'SoundLibrary',
  color: COLORS.cyan,
}
```

---

### 6.4 Boost Posts Integration

#### 6.4.1 Boost Flow
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ ForumScreen     │────▶│ SelectPostFor   │────▶│ BoostPost       │
│ Tap "Quảng Bá"  │     │ Boost           │     │ Screen          │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       ▼
        │                       │               ┌─────────────────┐
        │                       │               │ Payment         │
        │                       │               │ (GEM deduction) │
        │                       │               └─────────────────┘
        │                       │                       │
        │                       │                       ▼
        │                       │               ┌─────────────────┐
        │                       │               │ Boost Active    │
        │                       │               │ Badge on Post   │
        │                       │               └─────────────────┘
```

#### 6.4.2 SelectPostForBoostScreen
**File**: `gem-mobile/src/screens/Monetization/SelectPostForBoostScreen.js`

```javascript
const SelectPostForBoostScreen = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    loadUserPosts();
  }, []);

  const loadUserPosts = async () => {
    const userPosts = await forumService.getUserPosts(user.id);
    setPosts(userPosts);
  };

  const handleSelectPost = (post) => {
    navigation.navigate('BoostPost', { post });
  };

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => (
        <PostPreviewCard
          post={item}
          onSelect={() => handleSelectPost(item)}
          stats={{
            likes: item.likes_count,
            comments: item.comments_count,
            views: item.views_count,
          }}
        />
      )}
    />
  );
};
```

#### 6.4.3 BoostPostScreen
**File**: `gem-mobile/src/screens/Monetization/BoostPostScreen.js`

```javascript
const BoostPostScreen = ({ route }) => {
  const { post } = route.params;
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handleBoost = async () => {
    // Check gems balance
    if (gemsBalance < selectedPackage.gems) {
      Alert.alert('Không đủ Gems', 'Vui lòng nạp thêm Gems');
      return;
    }

    // Deduct gems
    await gemEconomyService.spendGems(
      selectedPackage.gems,
      'boost_post',
      { post_id: post.id }
    );

    // Create boost campaign
    await boostService.createCampaign({
      post_id: post.id,
      package_id: selectedPackage.id,
      gems_spent: selectedPackage.gems,
      duration_days: selectedPackage.duration,
      estimated_reach: selectedPackage.reach,
    });

    navigation.navigate('Forum');
  };

  return (
    <View>
      <PostPreview post={post} />

      <Text style={styles.sectionTitle}>Chọn gói quảng bá</Text>

      {BOOST_PACKAGES.map(pkg => (
        <PackageCard
          key={pkg.id}
          package={pkg}
          selected={selectedPackage?.id === pkg.id}
          onSelect={() => setSelectedPackage(pkg)}
        />
      ))}

      <Button
        title={`Quảng bá (${selectedPackage?.gems || 0} 💎)`}
        onPress={handleBoost}
        disabled={!selectedPackage}
      />
    </View>
  );
};
```

#### 6.4.4 Boosted Post Badge
```javascript
const BoostedBadge = () => (
  <View style={styles.boostedBadge}>
    <Feather name="zap" size={12} color={COLORS.gold} />
    <Text style={styles.boostedText}>BOOSTED</Text>
  </View>
);

// In PostCard
{post.is_boosted && <BoostedBadge />}
```

---

### 6.5 Notifications Integration

#### 6.5.1 Notification Bell Icon
```javascript
// ForumScreen header
const NotificationIcon = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    subscribeToNotifications();
  }, []);

  return (
    <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
      <Feather name="bell" size={24} color={COLORS.textPrimary} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
```

#### 6.5.2 Push Notification Triggers
```javascript
// When user receives notification
const handleNewNotification = async (notification) => {
  // Show local notification if app in background
  if (appState !== 'active') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: { screen: notification.screen, params: notification.params },
      },
      trigger: null,
    });
  }

  // Update unread count
  setUnreadCount(prev => prev + 1);
};
```

#### 6.5.3 Real-time Notification Subscription
```javascript
useEffect(() => {
  const channel = supabase
    .channel('notifications-realtime')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, handleNewNotification)
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [userId]);
```

---

### 6.6 Mentions & Hashtags Integration

#### 6.6.1 Mention Input
```javascript
const MentionInput = ({ value, onChangeText }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');

  const handleTextChange = async (text) => {
    onChangeText(text);

    // Detect @mention
    const match = text.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
      const users = await searchUsers(match[1]);
      setSuggestions(users);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (user) => {
    const newText = value.replace(
      new RegExp(`@${mentionQuery}$`),
      `@${user.username} `
    );
    onChangeText(newText);
    setShowSuggestions(false);
  };

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={handleTextChange}
        multiline
      />
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map(user => (
            <TouchableOpacity
              key={user.id}
              onPress={() => insertMention(user)}
            >
              <Image source={{ uri: user.avatar_url }} />
              <Text>@{user.username}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};
```

#### 6.6.2 Clickable Mentions & Hashtags
```javascript
const renderFormattedText = (text) => {
  const parts = text.split(/(@\w+|#\w+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return (
        <Text
          key={index}
          style={styles.mention}
          onPress={() => navigateToUser(part.slice(1))}
        >
          {part}
        </Text>
      );
    }
    if (part.startsWith('#')) {
      return (
        <Text
          key={index}
          style={styles.hashtag}
          onPress={() => navigateToHashtag(part.slice(1))}
        >
          {part}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
};

const styles = {
  mention: {
    color: COLORS.cyan,
    fontWeight: '600',
  },
  hashtag: {
    color: COLORS.cyan,
    fontWeight: '600',
  },
};
```

---

## 7. DESIGN SYSTEM

### 7.1 Color Palette

```javascript
const COLORS = {
  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#E0E0E0',
  textMuted: '#909090',
  textDisabled: '#666666',

  // Accent Colors
  gold: '#FFBD59',           // Primary accent
  cyan: '#00F0FF',           // Links, mentions, hashtags
  purple: '#6A5BFF',         // Badges, special items
  success: '#3AF7A6',        // Success states
  error: '#FF6B6B',          // Error states, delete
  warning: '#FFE66D',        // Warning states

  // Background Colors
  background: '#0a0a12',     // Main background
  bgDarkest: '#05050A',      // Darkest sections
  bgMid: '#1a1a2e',          // Mid-dark sections
  bgCard: 'rgba(26, 26, 46, 0.8)',  // Card backgrounds
  bgOverlay: 'rgba(0, 0, 0, 0.7)',   // Modal overlays

  // Special Colors
  burgundy: '#8B0000',       // FAB background
  likeRed: '#FF4444',        // Like button active
};
```

### 7.2 Spacing System

```javascript
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
};
```

### 7.3 Typography

```javascript
const TYPOGRAPHY = {
  fontSize: {
    xs: 11,
    sm: 12,
    base: 13,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
};
```

### 7.4 Border Radius

```javascript
const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};
```

### 7.5 Glass Effect

```javascript
const GLASS = {
  background: 'rgba(10, 10, 18, 0.8)',
  borderColor: 'rgba(255, 189, 89, 0.2)',
  borderWidth: 1,
  borderRadius: 16,
};
```

### 7.6 Shadows

```javascript
const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  gold: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};
```

### 7.7 Animations

```javascript
const ANIMATIONS = {
  // Spring config for bouncy animations
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },

  // Timing for smooth transitions
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // Like animation sequence
  likeAnimation: {
    scale: [1, 1.3, 1],
    duration: 300,
  },

  // Big heart overlay
  bigHeart: {
    scaleFrom: 0.5,
    scaleTo: 1,
    duration: 100,
    fadeOutDuration: 500,
  },
};
```

---

## 8. USER FLOWS

### 8.1 Browse Feed Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSE FEED FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Opens App                                             │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────┐                                           │
│  │ ForumScreen │  ◀─── Load hybrid feed (60/40 split)      │
│  │   (Feed)    │       Track session start                 │
│  └─────────────┘                                           │
│       │                                                     │
│       ├──▶ Scroll Down ──▶ Load more posts (infinite)      │
│       │                    Track impressions               │
│       │                                                     │
│       ├──▶ Pull Refresh ──▶ Reload feed                    │
│       │                     New session                    │
│       │                                                     │
│       ├──▶ Change Tab ──▶ Switch feed type                 │
│       │    (Following, News, etc.)                         │
│       │                                                     │
│       ├──▶ Tap Post ──▶ PostDetailScreen                   │
│       │                                                     │
│       ├──▶ Double-tap Image ──▶ Like with animation        │
│       │                                                     │
│       └──▶ Tap FAB ──▶ CreatePostScreen                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Create Post Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     CREATE POST FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tap FAB Button                                             │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────┐                                       │
│  │ CreatePostScreen │                                       │
│  └─────────────────┘                                       │
│       │                                                     │
│       ├──▶ Write Content (with @mentions, #hashtags)       │
│       │                                                     │
│       ├──▶ Add Images ──▶ ImagePicker ──▶ Edit/Crop        │
│       │                                                     │
│       ├──▶ Tag Products ──▶ ProductPicker (max 5)          │
│       │                                                     │
│       ├──▶ Add Sound ──▶ SoundPicker                       │
│       │                                                     │
│       ├──▶ Set Audience ──▶ Public/Followers/Private       │
│       │                                                     │
│       ├──▶ Select Topic ──▶ (Admin only)                   │
│       │                                                     │
│       ▼                                                     │
│  Tap "Đăng"                                                 │
│       │                                                     │
│       ├──▶ Upload images to Supabase Storage               │
│       │                                                     │
│       ├──▶ Create post record                              │
│       │                                                     │
│       ├──▶ Link products                                   │
│       │                                                     │
│       ├──▶ Extract & save hashtags                         │
│       │                                                     │
│       └──▶ Return to ForumScreen                           │
│            (New post appears at top)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Post Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   POST INTERACTION FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  View Post (PostCard or PostDetailScreen)                   │
│       │                                                     │
│       ├──▶ LIKE                                            │
│       │    ├──▶ Tap heart icon                             │
│       │    │    └──▶ Spring animation                      │
│       │    └──▶ Double-tap image                           │
│       │         └──▶ Big heart overlay                     │
│       │                                                     │
│       ├──▶ COMMENT                                         │
│       │    ├──▶ Tap comment icon ──▶ Focus input           │
│       │    ├──▶ Type comment (with @mentions)              │
│       │    └──▶ Submit ──▶ Show in comments list           │
│       │                                                     │
│       ├──▶ SHARE                                           │
│       │    └──▶ Open ShareSheet                            │
│       │         ├──▶ Copy Link                             │
│       │         ├──▶ WhatsApp                              │
│       │         ├──▶ Facebook                              │
│       │         ├──▶ Twitter                               │
│       │         └──▶ Native Share                          │
│       │                                                     │
│       ├──▶ REPOST                                          │
│       │    └──▶ Open RepostSheet                           │
│       │         ├──▶ Quick Repost                          │
│       │         └──▶ Quote Repost (add text)               │
│       │                                                     │
│       ├──▶ GIFT                                            │
│       │    └──▶ Open GiftCatalogSheet                      │
│       │         ├──▶ Select gift                           │
│       │         ├──▶ Deduct GEMs                           │
│       │         └──▶ Credit creator                        │
│       │                                                     │
│       └──▶ SAVE                                            │
│            └──▶ Add to saved posts                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.4 Boost Post Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      BOOST POST FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tap "Quảng Bá" Shortcut (ForumScreen)                      │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────┐                                   │
│  │ SelectPostForBoost  │  ◀─── List user's posts           │
│  │     Screen          │       Show stats (likes, views)   │
│  └─────────────────────┘                                   │
│       │                                                     │
│       ▼ Select Post                                         │
│  ┌─────────────────────┐                                   │
│  │  BoostPostScreen    │                                   │
│  └─────────────────────┘                                   │
│       │                                                     │
│       ├──▶ View post preview                               │
│       │                                                     │
│       ├──▶ Select package:                                 │
│       │    ├──▶ Cơ bản (50 💎, 1 ngày, ~500 views)         │
│       │    ├──▶ Tiêu chuẩn (120 💎, 3 ngày, ~2K views)     │
│       │    └──▶ Cao cấp (250 💎, 7 ngày, ~5K views)        │
│       │                                                     │
│       ▼ Tap "Quảng bá"                                      │
│       │                                                     │
│       ├──▶ Check GEMs balance                              │
│       │    ├──▶ Insufficient ──▶ Alert + Navigate Wallet   │
│       │    └──▶ Sufficient ──▶ Continue                    │
│       │                                                     │
│       ├──▶ Deduct GEMs                                     │
│       │                                                     │
│       ├──▶ Create boost campaign                           │
│       │                                                     │
│       ├──▶ Mark post as boosted                            │
│       │                                                     │
│       └──▶ Return to ForumScreen                           │
│            (Post shows BOOSTED badge)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. DATA MODELS

### 9.1 Post Schema

```typescript
interface Post {
  id: string;                    // UUID
  user_id: string;               // Author UUID
  content: string;               // Post text content
  title: string;                 // First line of content
  image_url: string | null;      // Cover image URL
  media_urls: string[];          // All media URLs
  topic: string | null;          // Topic category
  feed_type: string;             // Feed category
  visibility: 'public' | 'followers' | 'private';
  category_id: string | null;    // Category UUID
  hashtags: string[];            // Extracted hashtags
  sound_id: string | null;       // Attached sound UUID
  is_seed_post: boolean;         // Is seed content

  // Counts (denormalized for performance)
  likes_count: number;
  comments_count: number;
  shares_count: number;
  reposts_count: number;
  views_count: number;

  // Engagement
  engagement_score: number;

  // Boost
  is_boosted: boolean;
  boost_expires_at: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Relations (populated via join)
  profiles?: Profile;
  categories?: Category;
  tagged_products?: PostProduct[];
  likes?: Like[];
  saved?: Save[];

  // Computed (client-side)
  user_liked?: boolean;
  user_saved?: boolean;
  _score?: number;
  _isAd?: boolean;
}
```

### 9.2 Comment Schema

```typescript
interface Comment {
  id: string;                    // UUID
  post_id: string;               // Post UUID
  user_id: string;               // Author UUID
  content: string;               // Comment text
  parent_id: string | null;      // Parent comment (for replies)
  likes_count: number;
  created_at: string;
  updated_at: string;

  // Relations
  profiles?: Profile;
  replies?: Comment[];           // Nested replies
}
```

### 9.3 PostProduct Schema

```typescript
interface PostProduct {
  id: string;                    // UUID
  post_id: string;               // Post UUID
  product_id: string;            // Shopify product ID
  product_title: string;
  product_price: string | number;
  product_image: string;
  product_handle: string;
  position: number;              // Order in list
  created_at: string;
}
```

### 9.4 Boost Campaign Schema

```typescript
interface BoostCampaign {
  id: string;                    // UUID
  post_id: string;               // Post UUID
  user_id: string;               // Owner UUID
  package_id: 'basic' | 'standard' | 'premium';
  gems_spent: number;
  duration_days: number;
  estimated_reach: number;
  actual_reach: number;
  impressions_count: number;
  clicks_count: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  expires_at: string;
}
```

### 9.5 Notification Schema

```typescript
interface Notification {
  id: string;                    // UUID
  user_id: string;               // Recipient UUID
  sender_id: string | null;      // Sender UUID
  type: NotificationType;
  title: string;
  body: string;
  data: object;                  // Additional data
  post_id: string | null;        // Related post
  read_at: string | null;
  created_at: string;

  // Relations
  sender?: Profile;
  post?: Post;
}

type NotificationType =
  | 'like'
  | 'comment'
  | 'reply'
  | 'follow'
  | 'mention'
  | 'gift'
  | 'boost_complete'
  | 'repost';
```

### 9.6 Feed Impression Schema

```typescript
interface FeedImpression {
  id: string;                    // UUID
  user_id: string;               // Viewer UUID
  post_id: string;               // Post UUID
  session_id: string;            // Feed session UUID
  position: number;              // Position in feed
  dwell_time: number;            // Time spent viewing (ms)
  shown_at: string;
  interacted: boolean;           // Did user interact
}
```

### 9.7 Gift Schema

```typescript
interface Gift {
  id: string;                    // UUID
  sender_id: string;             // Sender UUID
  recipient_id: string;          // Recipient UUID
  post_id: string;               // Post UUID
  gift_type: string;             // Gift identifier
  gems_amount: number;           // GEMs spent
  created_at: string;
}
```

### 9.8 Repost Schema

```typescript
interface Repost {
  id: string;                    // UUID
  original_post_id: string;      // Original post UUID
  reposter_id: string;           // User who reposted
  quote: string | null;          // Optional quote text
  created_at: string;

  // Relations
  original_post?: Post;
  reposter?: Profile;
}
```

---

## 10. REAL-TIME FEATURES

### 10.1 Supabase Realtime Subscriptions

#### Forum Posts Channel
```javascript
const forumChannel = supabase
  .channel('forum-posts')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'forum_posts',
  }, (payload) => {
    // Add new post to feed
    handleNewPost(payload.new);
  })
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'forum_posts',
  }, (payload) => {
    // Update existing post
    handlePostUpdate(payload.new);
  })
  .on('postgres_changes', {
    event: 'DELETE',
    schema: 'public',
    table: 'forum_posts',
  }, (payload) => {
    // Remove post from feed
    handlePostDelete(payload.old.id);
  })
  .subscribe();
```

#### Notifications Channel
```javascript
const notificationsChannel = supabase
  .channel(`notifications-${userId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    handleNewNotification(payload.new);
  })
  .subscribe();
```

#### Comments Channel
```javascript
const commentsChannel = supabase
  .channel(`comments-${postId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'forum_comments',
    filter: `post_id=eq.${postId}`,
  }, (payload) => {
    handleNewComment(payload.new);
  })
  .subscribe();
```

### 10.2 Optimistic Updates

#### Like Optimistic Update
```javascript
const handleLike = async () => {
  // Optimistic update
  setIsLiked(true);
  setLikesCount(prev => prev + 1);
  animateLike();

  try {
    await forumService.likePost(post.id);
  } catch (error) {
    // Rollback on error
    setIsLiked(false);
    setLikesCount(prev => prev - 1);
    Alert.alert('Error', 'Could not like post');
  }
};
```

#### Comment Optimistic Update
```javascript
const handleComment = async () => {
  const tempId = `temp-${Date.now()}`;
  const optimisticComment = {
    id: tempId,
    content: commentText,
    user_id: user.id,
    profiles: user,
    created_at: new Date().toISOString(),
    _pending: true,
  };

  // Add optimistically
  setComments(prev => [...prev, optimisticComment]);
  setCommentText('');

  try {
    const realComment = await forumService.createComment(
      post.id,
      commentText
    );

    // Replace temp with real
    setComments(prev =>
      prev.map(c => c.id === tempId ? realComment : c)
    );
  } catch (error) {
    // Remove on error
    setComments(prev => prev.filter(c => c.id !== tempId));
    Alert.alert('Error', 'Could not post comment');
  }
};
```

---

## 11. FEED ALGORITHM

### 11.1 Hybrid Feed Generation

```javascript
const generateHybridFeed = async (userId) => {
  // Weight configuration
  const WEIGHTS = {
    following: 0.6,    // 60%
    discovery: 0.3,    // 30%
    serendipity: 0.1,  // 10%
  };

  // 1. Get user's own recent posts (always show first)
  const ownPosts = await getUserOwnPosts(userId, 3);

  // 2. Get following posts
  const followingIds = await getFollowingIds(userId);
  const followingPosts = await getPostsByUsers(
    followingIds,
    Math.floor(limit * WEIGHTS.following)
  );

  // 3. Get discovery posts (based on interests/engagement)
  const discoveryPosts = await getDiscoveryPosts(
    userId,
    Math.floor(limit * WEIGHTS.discovery)
  );

  // 4. Get serendipity posts (random for exploration)
  const serendipityPosts = await getRandomPosts(
    userId,
    Math.floor(limit * WEIGHTS.serendipity)
  );

  // 5. Merge and deduplicate
  const allPosts = deduplicatePosts([
    ...ownPosts,
    ...followingPosts,
    ...discoveryPosts,
    ...serendipityPosts,
  ]);

  return allPosts;
};
```

### 11.2 Post Scoring

```javascript
const scorePost = (post, userId, seenPostIds) => {
  let score = 0;

  // 1. Unseen bonus (highest priority)
  if (!seenPostIds.includes(post.id)) {
    score += 10000;
  }

  // 2. Recency bonus
  const hoursAgo = getHoursAgo(post.created_at);
  if (hoursAgo < 1) score += 8000;
  else if (hoursAgo < 6) score += 5000;
  else if (hoursAgo < 24) score += 3000;
  else if (hoursAgo < 72) score += 1000;

  // 3. Engagement score
  score += post.likes_count * 1;
  score += post.comments_count * 3;
  score += post.shares_count * 5;
  score += post.reposts_count * 4;

  // 4. Author relationship bonus
  if (isFollowing(userId, post.user_id)) {
    score += 2000;
  }

  // 5. Boosted post bonus
  if (post.is_boosted) {
    score += 3000;
  }

  // 6. Time decay for seen posts
  if (seenPostIds.includes(post.id)) {
    const daysSinceSeen = hoursAgo / 24;
    score *= Math.exp(-daysSinceSeen * 0.5);
  }

  return score;
};
```

### 11.3 Diversity Rules

```javascript
const applyDiversityRules = (posts) => {
  const MAX_CONSECUTIVE_SAME_AUTHOR = 2;
  const MAX_SAME_AUTHOR_IN_WINDOW = 3;
  const WINDOW_SIZE = 10;

  const result = [];
  const deferred = [];

  for (const post of posts) {
    const recentWindow = result.slice(-WINDOW_SIZE);
    const recentConsecutive = result.slice(-MAX_CONSECUTIVE_SAME_AUTHOR);

    const sameAuthorInWindow = recentWindow.filter(
      p => p.user_id === post.user_id
    ).length;

    const sameAuthorConsecutive = recentConsecutive.filter(
      p => p.user_id === post.user_id
    ).length;

    if (
      sameAuthorConsecutive < MAX_CONSECUTIVE_SAME_AUTHOR &&
      sameAuthorInWindow < MAX_SAME_AUTHOR_IN_WINDOW
    ) {
      result.push(post);
    } else {
      deferred.push(post);
    }
  }

  // Add deferred posts at end
  return [...result, ...deferred];
};
```

### 11.4 Impression Tracking

```javascript
const trackImpressions = async (userId, sessionId, posts) => {
  const impressions = posts.map((post, index) => ({
    user_id: userId,
    post_id: post.id,
    session_id: sessionId,
    position: index,
    shown_at: new Date().toISOString(),
  }));

  // Non-blocking insert
  supabase
    .from('feed_impressions')
    .upsert(impressions, {
      onConflict: 'user_id,post_id,session_id',
    })
    .then(() => {})
    .catch(console.error);
};
```

---

## 12. MONETIZATION SYSTEM

### 12.1 Boost Packages

```javascript
const BOOST_PACKAGES = [
  {
    id: 'basic',
    name: 'Cơ bản',
    description: 'Tiếp cận ~500 người trong 1 ngày',
    gems: 50,
    duration_days: 1,
    estimated_reach: 500,
    features: [
      'Hiển thị ưu tiên trong feed',
      'Badge "Được quảng bá"',
    ],
  },
  {
    id: 'standard',
    name: 'Tiêu chuẩn',
    description: 'Tiếp cận ~2,000 người trong 3 ngày',
    gems: 120,
    duration_days: 3,
    estimated_reach: 2000,
    features: [
      'Tất cả tính năng Cơ bản',
      'Hiển thị trong tab Khám phá',
      'Thống kê chi tiết',
    ],
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Cao cấp',
    description: 'Tiếp cận ~5,000 người trong 7 ngày',
    gems: 250,
    duration_days: 7,
    estimated_reach: 5000,
    features: [
      'Tất cả tính năng Tiêu chuẩn',
      'Ưu tiên hiển thị cao nhất',
      'Hỗ trợ 24/7',
    ],
  },
];
```

### 12.2 Gift Catalog

```javascript
const GIFT_CATALOG = [
  {
    id: 'coffee',
    name: 'Cà phê',
    icon: '☕',
    gems: 10,
    creator_share: 0.7,  // 70% to creator
  },
  {
    id: 'star',
    name: 'Ngôi sao',
    icon: '⭐',
    gems: 25,
    creator_share: 0.7,
  },
  {
    id: 'heart',
    name: 'Trái tim',
    icon: '❤️',
    gems: 50,
    creator_share: 0.7,
  },
  {
    id: 'diamond',
    name: 'Kim cương',
    icon: '💎',
    gems: 100,
    creator_share: 0.7,
  },
  {
    id: 'crown',
    name: 'Vương miện',
    icon: '👑',
    gems: 250,
    creator_share: 0.7,
  },
  {
    id: 'rocket',
    name: 'Tên lửa',
    icon: '🚀',
    gems: 500,
    creator_share: 0.7,
  },
];
```

### 12.3 Ad Distribution

```javascript
const AD_CONFIG = {
  first_position: 5,      // First ad after 5 posts
  interval: 10,           // Ad every 10 posts
  max_per_session: 2,     // Max 2 ads per session

  // Ad types and weights
  types: {
    tier_upgrade: 0.3,    // 30% tier upgrade ads
    affiliate: 0.25,      // 25% affiliate product ads
    course: 0.2,          // 20% course promo ads
    sponsor: 0.25,        // 25% sponsor banners
  },

  // Tier-based ad frequency
  tier_multiplier: {
    free: 1,              // Full ads
    basic: 0.5,           // Half ads
    premium: 0,           // No ads
  },
};
```

---

## 13. FILE MANIFEST

### 13.1 Screen Files
| File | Path | Description |
|------|------|-------------|
| ForumScreen.js | `screens/Forum/ForumScreen.js` | Main feed screen |
| PostDetailScreen.js | `screens/Forum/PostDetailScreen.js` | Post detail with comments |
| CreatePostScreen.js | `screens/Forum/CreatePostScreen.js` | Create new post modal |
| EditPostScreen.js | `screens/Forum/EditPostScreen.js` | Edit existing post |
| UserProfileScreen.js | `screens/Forum/UserProfileScreen.js` | User profile view |
| BoostPostScreen.js | `screens/Monetization/BoostPostScreen.js` | Boost campaign |
| SelectPostForBoostScreen.js | `screens/Monetization/SelectPostForBoostScreen.js` | Post selection |

### 13.2 Component Files
| File | Path | Description |
|------|------|-------------|
| PostCard.js | `screens/Forum/components/PostCard.js` | Post preview component |
| FABButton.js | `screens/Forum/components/FABButton.js` | Floating action button |
| AdCard.js | `components/Forum/AdCard.js` | Native ad component |
| MentionInput.js | `components/MentionInput.js` | @mention input |
| ProductPicker.js | `components/ProductPicker.js` | Product selector |
| SoundPicker.js | `components/SoundPicker.js` | Sound selector |
| SoundCard.js | `components/SoundCard.js` | Sound display |
| ShareSheet.js | `components/ShareSheet.js` | Share options |
| RepostSheet.js | `components/RepostSheet.js` | Repost options |
| GiftCatalogSheet.js | `components/GiftCatalogSheet.js` | Gift selector |
| ReceivedGiftsBar.js | `components/ReceivedGiftsBar.js` | Gifts display |

### 13.3 Service Files
| File | Path | Description |
|------|------|-------------|
| forumService.js | `services/forumService.js` | Post CRUD operations |
| feedService.js | `services/feedService.js` | Feed algorithm |
| repostService.js | `services/repostService.js` | Repost functionality |
| shareService.js | `services/shareService.js` | Share integrations |
| soundService.js | `services/soundService.js` | Sound management |
| notificationService.js | `services/notificationService.js` | Notifications |
| gamificationService.js | `services/gamificationService.js` | GEM rewards |

### 13.4 Context Files
| File | Path | Description |
|------|------|-------------|
| AuthContext.js | `contexts/AuthContext.js` | User authentication |
| TabBarContext.js | `contexts/TabBarContext.js` | Tab bar visibility |

### 13.5 Utility Files
| File | Path | Description |
|------|------|-------------|
| bannerDistribution.js | `utils/bannerDistribution.js` | Ad injection |
| formatters.js | `utils/formatters.js` | Text formatting |
| tokens.js | `utils/tokens.js` | Design tokens |

---

## CHANGELOG

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2024 | Initial complete specification |

---

*Document maintained by GEM Development Team*
*Last generated: December 2024*
