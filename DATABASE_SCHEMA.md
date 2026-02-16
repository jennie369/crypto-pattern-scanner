# Gemral - Database Schema & Tier System
## MASTER REFERENCE - Updated: 2026-02-17 (RLS Security Fix: 24 policies fixed + 20 tables enabled)

> **IMPORTANT**: Tất cả code phải sử dụng CHÍNH XÁC các table, column và values trong file này.
> **PRIMARY TABLE**: `profiles` - Sử dụng cho TẤT CẢ user data

---

## 1. TIER HIERARCHY

```
Level 0:  FREE      (Default)
Level 1:  TIER1     (Alias: PRO)
Level 2:  TIER2     (Alias: PREMIUM)
Level 3:  TIER3     (Alias: VIP)
Level 99: ADMIN     (Unlimited everything)
```

### Valid Tier Values (for constraints):
```sql
'FREE', 'TIER1', 'TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP', 'ADMIN'
```

### Tier Limits:
| Tier | Chatbot Queries | Voice/day | Scanner Patterns | Color |
|------|-----------------|-----------|------------------|-------|
| FREE | 5/day | 3 | 3 | #FF6B6B |
| TIER1/PRO | 15/day | Unlimited | 7 | #FFBD59 |
| TIER2/PREMIUM | 50/day | Unlimited | 15 | #6A5BFF |
| TIER3/VIP | Unlimited | Unlimited | 24 | #FFD700 |
| ADMIN | Unlimited | Unlimited | Unlimited | #FF00FF |

---

## 2. PRIMARY TABLE: `profiles`

> **USE THIS TABLE FOR ALL USER DATA**

```sql
CREATE TABLE profiles (
  -- Primary Key (same as auth.users.id)
  id UUID PRIMARY KEY REFERENCES auth.users(id),

  -- Basic Info
  email TEXT,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,

  -- Role & Admin
  -- Roles: 'user' | 'admin' | 'teacher' | 'manager'
  -- - admin: Full access to everything
  -- - teacher: Can create/edit/delete their own courses
  -- - manager: Read-only access to course admin (view all courses)
  -- - user: Default role, no course admin access
  role VARCHAR(20) DEFAULT 'user',
  is_admin BOOLEAN DEFAULT FALSE,

  -- Tier Columns (CRITICAL)
  scanner_tier VARCHAR(20) DEFAULT 'FREE',
  chatbot_tier VARCHAR(20) DEFAULT 'FREE',
  course_tier VARCHAR(20) DEFAULT 'FREE',
  tier_expires_at TIMESTAMPTZ,

  -- Social Handles
  twitter_handle TEXT,
  telegram_handle TEXT,

  -- Trading Preferences
  trading_style TEXT,                      -- 'scalper', 'swing', 'day_trader'
  favorite_pairs TEXT[],                   -- ['BTCUSDT', 'ETHUSDT']

  -- Privacy Settings
  public_profile BOOLEAN DEFAULT TRUE,
  show_stats BOOLEAN DEFAULT TRUE,

  -- Affiliate System
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),

  -- Online Presence
  online_status TEXT DEFAULT 'offline',    -- 'online', 'offline', 'away'
  last_seen TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,

  -- Badge System
  badge_tier TEXT DEFAULT 'bronze',        -- 'bronze', 'silver', 'gold', 'platinum'
  badges TEXT[],

  -- Notifications
  notification_sounds BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT FALSE,
  expo_push_token TEXT,

  -- ═══════════════════════════════════════════════════
  -- GEM ECONOMY (SINGLE SOURCE OF TRUTH)
  -- ═══════════════════════════════════════════════════
  gems INT DEFAULT 0,  -- PRIMARY gem balance. Synced to user_wallets via trigger.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

> **IMPORTANT - GEM BALANCE:**
> - `profiles.gems` is the **SINGLE SOURCE OF TRUTH** for gem balance
> - `user_wallets.gem_balance` is synced via trigger for backwards compatibility
> - All services should read from `profiles.gems` or use `get_gem_balance()` RPC
> - Shopify webhook updates `profiles.gems` directly

### Constraints:
```sql
ALTER TABLE profiles ADD CONSTRAINT profiles_scanner_tier_check
  CHECK (scanner_tier IS NULL OR scanner_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP', 'ADMIN'));

ALTER TABLE profiles ADD CONSTRAINT profiles_chatbot_tier_check
  CHECK (chatbot_tier IS NULL OR chatbot_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP', 'ADMIN'));

ALTER TABLE profiles ADD CONSTRAINT profiles_course_tier_check
  CHECK (course_tier IS NULL OR course_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP', 'ADMIN'));
```

---

## 3. ROLE DETECTION LOGIC

### Admin Detection
```javascript
// Use this EXACT logic everywhere
const isAdmin =
  profile.is_admin === true ||
  profile.role === 'admin' ||
  profile.role === 'ADMIN' ||
  profile.scanner_tier === 'ADMIN' ||
  profile.chatbot_tier === 'ADMIN';
```

### Role Checking (Course Admin)
```javascript
// Check if user is teacher
const isTeacher = profile?.role === 'teacher';

// Check if user is manager (quản lý)
const isManager = profile?.role === 'manager';

// Check if user has course admin access (admin, teacher, or manager)
const hasCourseAdminAccess = ['admin', 'teacher', 'manager'].includes(profile?.role);

// Check if user can edit a specific course
// Admin: can edit all courses
// Teacher: can only edit their own courses
// Manager: read-only (cannot edit)
const canEditCourse = (courseCreatorId) => {
  if (isAdmin) return true;
  if (isTeacher && courseCreatorId === profile.id) return true;
  return false;
};

// Check if user can create courses
const canCreateCourse = ['admin', 'teacher'].includes(profile?.role);

// Check if user can delete a specific course
// Same logic as canEditCourse
const canDeleteCourse = (courseCreatorId) => canEditCourse(courseCreatorId);
```

### SQL Version:
```sql
CREATE OR REPLACE FUNCTION is_user_admin(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_profile RECORD;
BEGIN
  SELECT role, is_admin, scanner_tier, chatbot_tier
  INTO user_profile
  FROM profiles
  WHERE id = user_id_param;

  IF NOT FOUND THEN RETURN FALSE; END IF;

  RETURN (
    user_profile.is_admin = TRUE OR
    user_profile.role = 'admin' OR
    user_profile.role = 'ADMIN' OR
    user_profile.scanner_tier = 'ADMIN' OR
    user_profile.chatbot_tier = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 4. OTHER TABLES

### 4.1 `user_purchases`
```sql
CREATE TABLE user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Product Info
  product_id TEXT NOT NULL,
  product_type TEXT NOT NULL,              -- 'bundle', 'chatbot', 'scanner', 'course'
  product_tier TEXT,                       -- 'TIER1', 'TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP'
  product_name TEXT,

  -- Purchase Details
  amount DECIMAL(12, 2),
  currency TEXT DEFAULT 'VND',

  -- Shopify Integration
  shopify_order_id TEXT,
  shopify_order_number TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,

  -- Timestamps
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 `chatbot_quota`
```sql
CREATE TABLE chatbot_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Daily Tracking
  date DATE NOT NULL,
  queries_used INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);
```

### 4.3 `voice_usage`
```sql
CREATE TABLE voice_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Daily Tracking
  date DATE NOT NULL,
  voice_count INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);
```

### 4.4 `partnership_applications`
```sql
CREATE TABLE partnership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Application Info
  partnership_type TEXT NOT NULL,          -- 'affiliate', 'ctv'
  full_name TEXT NOT NULL,
  phone TEXT,
  social_links JSONB,
  reason TEXT,

  -- Status
  status TEXT DEFAULT 'pending',           -- 'pending', 'approved', 'rejected'
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.5 `withdrawal_requests`
```sql
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Amount
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'VND',

  -- Bank Info
  bank_name TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  bank_account_name TEXT NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending',           -- 'pending', 'approved', 'processing', 'completed', 'rejected'
  processed_by UUID,
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  transaction_ref TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. CODE EXAMPLES

### 5.1 Get User Profile (JavaScript)
```javascript
import { supabase } from './supabase';

// ALWAYS use 'profiles' table
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

### 5.2 Get User Tier
```javascript
const { data: profile } = await supabase
  .from('profiles')
  .select('chatbot_tier, scanner_tier, course_tier, is_admin, role')
  .eq('id', userId)
  .single();

// Check admin first
const isAdmin =
  profile.is_admin === true ||
  profile.role === 'admin' ||
  profile.role === 'ADMIN' ||
  profile.scanner_tier === 'ADMIN' ||
  profile.chatbot_tier === 'ADMIN';

if (isAdmin) {
  return 'ADMIN'; // Unlimited access
}

// Get highest tier
const tiers = [profile.chatbot_tier, profile.scanner_tier, profile.course_tier];
// ... normalize and return highest
```

### 5.3 Update Online Status
```javascript
await supabase
  .from('profiles')
  .update({
    online_status: 'online',
    last_seen: new Date().toISOString()
  })
  .eq('id', userId);
```

### 5.4 Set User as Admin (SQL)
```sql
UPDATE profiles
SET
  role = 'admin',
  is_admin = TRUE,
  scanner_tier = 'ADMIN',
  chatbot_tier = 'ADMIN',
  course_tier = 'ADMIN'
WHERE email = 'user@example.com';
```

### 5.5 Set User Tier (SQL)
```sql
-- Set TIER3/VIP
UPDATE profiles
SET scanner_tier = 'TIER3', chatbot_tier = 'TIER3'
WHERE email = 'user@example.com';

-- Set TIER2/PREMIUM
UPDATE profiles
SET scanner_tier = 'TIER2', chatbot_tier = 'TIER2'
WHERE email = 'user@example.com';

-- Set TIER1/PRO
UPDATE profiles
SET scanner_tier = 'TIER1', chatbot_tier = 'TIER1'
WHERE email = 'user@example.com';

-- Reset to FREE
UPDATE profiles
SET scanner_tier = 'FREE', chatbot_tier = 'FREE'
WHERE email = 'user@example.com';
```

---

## 6. DEPRECATED - DO NOT USE

### ❌ `users` table
- **DEPRECATED** - Do not use in new code
- Data is synced from `profiles` via trigger for backward compatibility
- All new code must use `profiles` table

### ❌ Old column names
- `tier` → Use `scanner_tier` or `chatbot_tier`
- `user_tier` → Use `scanner_tier` or `chatbot_tier`

---

## 7. QUICK REFERENCE

### Tables to Use:
| Feature | Table |
|---------|-------|
| User profile | `profiles` |
| User tier | `profiles` |
| Admin check | `profiles` |
| Online status | `profiles` |
| Chatbot quota | `chatbot_quota` |
| Voice usage | `voice_usage` |
| Purchases | `user_purchases` |
| Partnership | `partnership_applications` |
| Withdrawals | `withdrawal_requests` |

### Column Quick Reference:
| Purpose | Column | Table | Values |
|---------|--------|-------|--------|
| Is admin? | `is_admin` | profiles | true/false |
| Role | `role` | profiles | 'user', 'admin' |
| Scanner tier | `scanner_tier` | profiles | FREE/TIER1/TIER2/TIER3/ADMIN |
| Chatbot tier | `chatbot_tier` | profiles | FREE/TIER1/TIER2/TIER3/ADMIN |
| Course tier | `course_tier` | profiles | FREE/TIER1/TIER2/TIER3/ADMIN |
| Online status | `online_status` | profiles | 'online', 'offline', 'away' |

---

## 8. CURRENT ADMIN

```sql
-- Admin user: maow390@gmail.com
-- Settings:
--   role = 'admin'
--   is_admin = TRUE
--   scanner_tier = 'ADMIN'
--   chatbot_tier = 'ADMIN'
--   course_tier = 'ADMIN'
```

---

## 9. FORUM TABLES

### 9.1 `forum_posts`
```sql
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES forum_categories(id),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  poll_data JSONB,
  topic TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'published',    -- 'published', 'draft', 'hidden'
  feed_type VARCHAR(50) DEFAULT 'general',
  edited_at TIMESTAMPTZ,
  edit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.2 `forum_comments`
```sql
CREATE TABLE forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  edited_at TIMESTAMPTZ,
  edit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.3 `forum_categories`
```sql
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#FFBD59',
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.4 `forum_likes`
```sql
CREATE TABLE forum_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);
```

### 9.5 `forum_saved` (Bookmarks)
```sql
CREATE TABLE forum_saved (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);
```

### 9.6 `user_follows`
```sql
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);
```

---

## 10. FORUM FEATURE TABLES (Features #14-#24)

### 10.1 `notification_preferences` (Feature #14: Mute Notifications)
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  muted BOOLEAN DEFAULT true,
  muted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);
```

### 10.2 `scheduled_posts` (Feature #16: Schedule Posts)
```sql
CREATE TABLE scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  topic TEXT,
  images TEXT[] DEFAULT '{}',
  poll_data JSONB,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',             -- 'pending', 'published', 'failed', 'cancelled'
  published_at TIMESTAMPTZ,
  published_post_id UUID,
  cancelled_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10.3 `post_edit_history` (Feature #18: Edit History)
```sql
CREATE TABLE post_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  title_before TEXT,
  content_before TEXT,
  title_after TEXT,
  content_after TEXT,
  edited_by UUID NOT NULL,                   -- NOTE: Uses edited_by, NOT user_id
  edited_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10.4 `comment_edit_history` (Feature #18: Edit History)
```sql
CREATE TABLE comment_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL,
  content_before TEXT,
  content_after TEXT,
  edited_by UUID NOT NULL,                   -- NOTE: Uses edited_by, NOT user_id
  edited_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10.5 `pinned_posts` (Feature #20: Pin Posts to Profile)
```sql
CREATE TABLE pinned_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  pin_order INTEGER DEFAULT 1,
  pinned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);
```

### 10.6 `stories` (Feature #21: Stories)
```sql
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',           -- 'image', 'video'
  caption TEXT,
  stickers JSONB DEFAULT '[]',
  background_color TEXT,
  views_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,           -- Usually NOW() + 24 hours
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10.7 `story_views` (Feature #21: Stories)
```sql
CREATE TABLE story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  viewer_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);
```

### 10.8 `story_reactions` (Feature #21: Stories)
```sql
CREATE TABLE story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reaction TEXT NOT NULL,                    -- Emoji or reaction type
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10.9 `story_replies` (Feature #21: Stories)
```sql
CREATE TABLE story_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10.10 `live_streams` (Feature #22: Live Streaming)
```sql
CREATE TABLE live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT,
  stream_key TEXT UNIQUE,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'live',                -- 'live', 'ended', 'paused'
  viewers_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);
```

### 10.11 `stream_viewers` (Feature #22: Live Streaming)
```sql
CREATE TABLE stream_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stream_id, user_id)
);
```

### 10.12 `stream_chat` (Feature #22: Live Streaming)
```sql
CREATE TABLE stream_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10.13 `stream_gifts` (Feature #22: Live Streaming)
```sql
CREATE TABLE stream_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL,
  sender_id UUID NOT NULL,                   -- NOTE: Uses sender_id, NOT user_id
  gift_type TEXT NOT NULL,
  amount INTEGER DEFAULT 0,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 11. FORUM HELPER FUNCTIONS

### 11.1 Story Views Counter
```sql
CREATE OR REPLACE FUNCTION increment_story_views(p_story_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE stories SET views_count = views_count + 1 WHERE id = p_story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 11.2 Stream Viewers Counter
```sql
CREATE OR REPLACE FUNCTION increment_stream_viewers(p_stream_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE live_streams
  SET viewers_count = viewers_count + 1,
      peak_viewers = GREATEST(peak_viewers, viewers_count + 1)
  WHERE id = p_stream_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_stream_viewers(p_stream_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE live_streams
  SET viewers_count = GREATEST(0, viewers_count - 1)
  WHERE id = p_stream_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 12. UPDATED QUICK REFERENCE

### All Tables:
| Feature | Table | Key Column Notes |
|---------|-------|------------------|
| User profile | `profiles` | Primary user table |
| Forum posts | `forum_posts` | `user_id` |
| Forum comments | `forum_comments` | `user_id`, `parent_id` for replies |
| Forum likes | `forum_likes` | `user_id`, `post_id` or `comment_id` |
| Forum saved | `forum_saved` | `user_id`, `post_id` |
| User follows | `user_follows` | `follower_id`, `following_id` |
| Mute notifications | `notification_preferences` | `user_id`, `post_id` |
| Schedule posts | `scheduled_posts` | `user_id`, `status` |
| Post edit history | `post_edit_history` | `edited_by` (NOT user_id!) |
| Comment edit history | `comment_edit_history` | `edited_by` (NOT user_id!) |
| Pinned posts | `pinned_posts` | `user_id`, `post_id` |
| Stories | `stories` | `user_id`, `expires_at` |
| Story views | `story_views` | `viewer_id` (NOT user_id!) |
| Story reactions | `story_reactions` | `user_id` |
| Story replies | `story_replies` | `user_id` |
| Live streams | `live_streams` | `user_id`, `status` |
| Stream viewers | `stream_viewers` | `user_id` |
| Stream chat | `stream_chat` | `user_id` |
| Stream gifts | `stream_gifts` | `sender_id` (NOT user_id!) |

---

## 13. SOCIAL FEATURES TABLES (12 Major Features)

### 13.1 `shopping_tags` (Feature #1: Shopping Tags)
```sql
CREATE TABLE shopping_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(12,2),
  product_image TEXT,
  product_url TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'shopify', 'shopee')),
  x_position FLOAT NOT NULL,                 -- 0.0 to 1.0
  y_position FLOAT NOT NULL,                 -- 0.0 to 1.0
  image_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shopping_tags_post ON shopping_tags(post_id);
CREATE INDEX idx_shopping_tags_product ON shopping_tags(product_id);
```

### 13.1b `live_shopping_products` (Feature #2: Live Shopping)
```sql
CREATE TABLE live_shopping_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID,                            -- REFERENCES live_streams(id) ON DELETE CASCADE
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(12,2),
  sale_price DECIMAL(12,2),
  product_image TEXT,
  product_url TEXT,
  stock_quantity INT DEFAULT 0,
  sold_quantity INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_live_products_stream ON live_shopping_products(stream_id);
```

### 13.1c `live_purchases` (Feature #2: Live Shopping)
```sql
CREATE TABLE live_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID,
  product_id TEXT NOT NULL,
  buyer_id UUID REFERENCES profiles(id),
  quantity INT DEFAULT 1,
  price DECIMAL(12,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_live_purchases_buyer ON live_purchases(buyer_id);
```

### 13.1d `shopee_affiliate_links` (Feature #3: Shopee Integration)
```sql
CREATE TABLE shopee_affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  original_url TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  product_name TEXT,
  product_image TEXT,
  commission_rate DECIMAL(5,2),
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shopee_links_user ON shopee_affiliate_links(user_id);
```

### 13.1e `shopee_commissions` (Feature #3: Shopee Integration)
```sql
CREATE TABLE shopee_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_link_id UUID REFERENCES shopee_affiliate_links(id),
  order_id TEXT NOT NULL,
  amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 13.2 `sound_library` (Feature #4-6: Sound Library)
```sql
CREATE TABLE sound_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT,
  audio_url TEXT NOT NULL,
  cover_image TEXT,
  duration_seconds INT,                      -- Duration in seconds
  genre TEXT,                                -- 'pop', 'edm', 'hiphop', 'chill', 'lofi', 'acoustic', 'viet', 'funny', 'meme', 'original', 'other'
  mood TEXT,
  is_original BOOLEAN DEFAULT FALSE,
  uploaded_by UUID REFERENCES profiles(id),
  play_count INT DEFAULT 0,
  use_count INT DEFAULT 0,
  is_trending BOOLEAN DEFAULT FALSE,
  upload_status TEXT DEFAULT 'approved' CHECK (upload_status IN ('pending', 'processing', 'approved', 'rejected')),
  copyright_info TEXT,
  is_licensed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sounds_trending ON sound_library(is_trending, use_count);
CREATE INDEX idx_sounds_genre ON sound_library(genre);
CREATE INDEX idx_sounds_uploaded_by ON sound_library(uploaded_by);
```

### 13.2b `sound_favorites` (Feature #4: Browse Sounds)
```sql
CREATE TABLE sound_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sound_id UUID REFERENCES sound_library(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sound_id)
);
```

### 13.4 `post_boosts` (Feature #7: Boost Post)
```sql
CREATE TABLE post_boosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  budget DECIMAL(12,2) NOT NULL,
  spent DECIMAL(12,2) DEFAULT 0,
  target_audience JSONB,
  -- target_audience: { interests: [], age_range: [18, 65], location: [] }
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'cancelled')),
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  reach INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_boosts_status ON post_boosts(status);
CREATE INDEX idx_boosts_user ON post_boosts(user_id);
CREATE INDEX idx_boosts_post ON post_boosts(post_id);
```

### 13.4b `boost_payments` (Feature #7: Boost Post)
```sql
CREATE TABLE boost_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boost_id UUID REFERENCES post_boosts(id) ON DELETE CASCADE,
  amount DECIMAL(12,2),
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 13.4c `advertisements` (Feature #8: Create Ad from Post)
```sql
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_post_id UUID REFERENCES forum_posts(id),
  advertiser_id UUID REFERENCES profiles(id),
  ad_type TEXT CHECK (ad_type IN ('feed', 'story', 'banner')),
  headline TEXT,
  description TEXT,
  call_to_action TEXT,
  destination_url TEXT,
  media_urls JSONB,
  target_audience JSONB,
  budget DECIMAL(12,2),
  daily_budget DECIMAL(12,2),
  bid_strategy TEXT DEFAULT 'auto' CHECK (bid_strategy IN ('auto', 'manual')),
  bid_amount DECIMAL(12,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'paused', 'rejected', 'completed')),
  rejection_reason TEXT,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ads_status ON advertisements(status);
CREATE INDEX idx_ads_advertiser ON advertisements(advertiser_id);
```

### 13.5 `reposts` (Feature #10: Repost to Feed)
```sql
CREATE TABLE reposts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  reposter_id UUID REFERENCES profiles(id),
  quote TEXT,                                -- Optional quote text
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(original_post_id, reposter_id)
);

CREATE INDEX idx_reposts_original ON reposts(original_post_id);
CREATE INDEX idx_reposts_user ON reposts(reposter_id);
```

### 13.6 `comment_reports` (Feature #11: Report Comments)
```sql
CREATE TABLE comment_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,                      -- 'spam', 'harassment', 'hate_speech', 'misinformation', 'violence', 'adult_content', 'other'
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, reporter_id)
);

CREATE INDEX idx_comment_reports_status ON comment_reports(status);
```

### 13.7 `close_friends` (Feature #13: Privacy Settings)
```sql
CREATE TABLE close_friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_close_friends_user ON close_friends(user_id);
```

### 13.7b `post_audience_restrictions` (Feature #13: Privacy Settings)
```sql
CREATE TABLE post_audience_restrictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  allow_comments BOOLEAN DEFAULT TRUE,
  allow_sharing BOOLEAN DEFAULT TRUE,
  allow_reactions BOOLEAN DEFAULT TRUE,
  hide_like_count BOOLEAN DEFAULT FALSE,
  disable_download BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id)
);
```

### 13.8 `user_settings` (Feature #13: Privacy Settings)
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  default_post_visibility TEXT DEFAULT 'public',  -- 'public', 'followers', 'close_friends', 'private'
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 13.9 `user_wallets` (Feature #14: Virtual Currency)

> **NOTE:** `gem_balance` is kept in sync with `profiles.gems` via database trigger.
> **DO NOT** update `gem_balance` directly - update `profiles.gems` instead.

```sql
CREATE TABLE user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  gem_balance INT DEFAULT 0,        -- SYNCED from profiles.gems via trigger
  diamond_balance INT DEFAULT 0,
  total_earned INT DEFAULT 0,
  total_spent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 13.10 `wallet_transactions` (Feature #14: Virtual Currency)
```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES user_wallets(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('purchase', 'gift_sent', 'gift_received', 'withdrawal', 'bonus', 'refund')),
  currency TEXT CHECK (currency IN ('gem', 'diamond', 'vnd')),
  amount INT NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_transactions_type ON wallet_transactions(type);
```

### 13.10a `gems_transactions` (PRIMARY Transaction Log)

> **NOTE:** This is the PRIMARY transaction log for gem economy.
> Used by Shopify webhook and all services. `wallet_transactions` is legacy.

```sql
CREATE TABLE gems_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- 'credit', 'debit', 'purchase', 'gift_sent', 'gift_received', 'bonus', 'withdrawal', 'checkin'
  amount INT NOT NULL,
  description TEXT,
  reference_type TEXT, -- 'shopify_order', 'gift', 'boost', 'checkin', etc.
  reference_id TEXT,
  balance_before INT,
  balance_after INT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gems_transactions_user_id ON gems_transactions(user_id);
CREATE INDEX idx_gems_transactions_type ON gems_transactions(type);
CREATE INDEX idx_gems_transactions_created_at ON gems_transactions(created_at DESC);
```

### 13.10b `currency_packages` (Feature #14: Virtual Currency) - LEGACY
```sql
CREATE TABLE currency_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  gem_amount INT NOT NULL,
  price_vnd INT NOT NULL,
  bonus_gems INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial currency packages
INSERT INTO currency_packages (name, gem_amount, price_vnd, bonus_gems, is_featured) VALUES
  ('Starter Pack', 100, 22000, 0, FALSE),
  ('Popular Pack', 500, 99000, 50, TRUE),
  ('Pro Pack', 1000, 189000, 150, FALSE),
  ('VIP Pack', 5000, 890000, 1000, FALSE)
ON CONFLICT DO NOTHING;
```

### 13.11 `gift_catalog` (Feature #15: Gift Catalog)
```sql
CREATE TABLE gift_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  animation_url TEXT,
  gem_cost INT NOT NULL,
  category TEXT CHECK (category IN ('standard', 'premium', 'luxury', 'animated', 'limited')),
  is_animated BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gift_catalog_category ON gift_catalog(category);

-- Initial gifts catalog
INSERT INTO gift_catalog (name, description, image_url, gem_cost, category, is_animated, display_order) VALUES
  ('Heart', 'Show some love', '/gifts/heart.png', 10, 'standard', FALSE, 1),
  ('Star', 'You are a star!', '/gifts/star.png', 25, 'standard', FALSE, 2),
  ('Rose', 'A beautiful rose', '/gifts/rose.png', 50, 'standard', FALSE, 3),
  ('Diamond', 'Premium gift', '/gifts/diamond.png', 100, 'premium', TRUE, 4),
  ('Crown', 'Royal treatment', '/gifts/crown.png', 500, 'luxury', TRUE, 5),
  ('Fireworks', 'Celebration!', '/gifts/fireworks.png', 1000, 'animated', TRUE, 6)
ON CONFLICT DO NOTHING;
```

### 13.12 `sent_gifts` (Feature #15: Gift Catalog)
```sql
CREATE TABLE sent_gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_id UUID REFERENCES gift_catalog(id),
  sender_id UUID REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  post_id UUID REFERENCES forum_posts(id),
  stream_id UUID,
  gem_amount INT NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gifts_recipient ON sent_gifts(recipient_id);
CREATE INDEX idx_gifts_sender ON sent_gifts(sender_id);
CREATE INDEX idx_gifts_post ON sent_gifts(post_id);
```

### 13.13 `creator_earnings` (Feature #16: Creator Earnings)
```sql
CREATE TABLE creator_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  source_type TEXT CHECK (source_type IN ('gift', 'subscription', 'tip', 'ad_revenue')),
  source_id UUID,
  gross_amount INT NOT NULL,
  platform_fee INT DEFAULT 0,                -- 30% platform fee
  net_amount INT NOT NULL,                   -- 70% to creator
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'withdrawn', 'cancelled')),
  available_at TIMESTAMPTZ,                  -- 7-day hold period
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_earnings_creator ON creator_earnings(creator_id);
CREATE INDEX idx_earnings_status ON creator_earnings(status);
```

### 13.13b `withdrawal_requests` (Feature #16: Creator Earnings)
```sql
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id),
  amount INT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_withdrawals_creator ON withdrawal_requests(creator_id);
CREATE INDEX idx_withdrawals_status ON withdrawal_requests(status);
```

---

## 14. ADDITIONAL COLUMNS ON EXISTING TABLES

### 14.1 `forum_posts` - New Columns
```sql
-- Visibility/Privacy (with check constraint)
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public'
  CHECK (visibility IN ('public', 'followers', 'close_friends', 'private'));

-- Sound attachment
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS sound_id UUID REFERENCES sound_library(id);

-- Repost tracking
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS repost_count INT DEFAULT 0;
```

### 14.2 `forum_comments` - New Columns
```sql
-- Pinned comments
ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ;
ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS pinned_by UUID REFERENCES profiles(id);
```

---

## 15. RPC FUNCTIONS (12 Major Features)

### 15.1 Sound Library Functions
```sql
-- Increment play count
CREATE OR REPLACE FUNCTION increment_sound_play_count(p_sound_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE sound_library
  SET play_count = COALESCE(play_count, 0) + 1
  WHERE id = p_sound_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment use count
CREATE OR REPLACE FUNCTION increment_sound_use_count(p_sound_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE sound_library
  SET use_count = COALESCE(use_count, 0) + 1
  WHERE id = p_sound_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate trending score
CREATE OR REPLACE FUNCTION calculate_sound_trending_score(p_sound_id UUID)
RETURNS FLOAT AS $$
DECLARE
  base_score FLOAT;
  recency_bonus FLOAT;
  velocity_score FLOAT;
BEGIN
  -- Base score from use count
  SELECT COALESCE(use_count * 10 + play_count, 0) INTO base_score
  FROM sound_library WHERE id = p_sound_id;

  -- Recency bonus (newer = higher)
  SELECT GREATEST(0, 100 - EXTRACT(DAY FROM NOW() - created_at) * 5) INTO recency_bonus
  FROM sound_library WHERE id = p_sound_id;

  -- Velocity: uses in last 24h
  SELECT COUNT(*) * 50 INTO velocity_score
  FROM forum_posts
  WHERE sound_id = p_sound_id
    AND created_at > NOW() - INTERVAL '24 hours';

  RETURN COALESCE(base_score, 0) + COALESCE(recency_bonus, 0) + COALESCE(velocity_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Update trending sounds
CREATE OR REPLACE FUNCTION update_trending_sounds()
RETURNS void AS $$
BEGIN
  UPDATE sound_library SET is_trending = FALSE;
  UPDATE sound_library SET is_trending = TRUE
  WHERE id IN (
    SELECT id FROM sound_library
    ORDER BY calculate_sound_trending_score(id) DESC
    LIMIT 50
  );
END;
$$ LANGUAGE plpgsql;
```

### 15.2 Repost Functions
```sql
-- Increment repost count
CREATE OR REPLACE FUNCTION increment_repost_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET repost_count = COALESCE(repost_count, 0) + 1
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement repost count
CREATE OR REPLACE FUNCTION decrement_repost_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET repost_count = GREATEST(COALESCE(repost_count, 0) - 1, 0)
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 15.3 Comment Functions
```sql
-- Decrement comment count
CREATE OR REPLACE FUNCTION decrement_comment_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 15.4 Gift Earnings Trigger
```sql
-- Calculate earnings from gifts (70% to creator, 30% platform fee)
CREATE OR REPLACE FUNCTION calculate_gift_earnings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO creator_earnings (
    creator_id,
    source_type,
    source_id,
    gross_amount,
    platform_fee,
    net_amount,
    status,
    available_at
  ) VALUES (
    NEW.recipient_id,
    'gift',
    NEW.id,
    NEW.gem_amount,
    FLOOR(NEW.gem_amount * 0.30), -- 30% platform fee
    FLOOR(NEW.gem_amount * 0.70), -- 70% to creator
    'pending',
    NOW() + INTERVAL '7 days'     -- 7-day hold period
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on sent_gifts
CREATE TRIGGER trg_gift_earnings
AFTER INSERT ON sent_gifts
FOR EACH ROW EXECUTE FUNCTION calculate_gift_earnings();
```

### 15.5 Auto-Create Wallet on User Signup
```sql
-- Function to create wallet on user signup
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on profiles
CREATE TRIGGER trg_create_wallet
AFTER INSERT ON profiles
FOR EACH ROW EXECUTE FUNCTION create_user_wallet();
```

---

## 16. BOOST PACKAGES REFERENCE

| Package | ID | Duration | Reach | Price (Gems) |
|---------|-----|----------|-------|--------------|
| Co ban | `basic` | 24h | 2x | 50 |
| Tieu chuan | `standard` | 48h | 5x | 100 |
| Cao cap | `premium` | 7 days | 10x | 300 |
| Sieu cap | `ultra` | 14 days | 20x | 500 |

---

## 17. VISIBILITY VALUES REFERENCE

| Value | Description | Who Can View |
|-------|-------------|--------------|
| `public` | Cong khai | Everyone |
| `followers` | Nguoi theo doi | Only followers |
| `close_friends` | Ban than | Only close friends |
| `private` | Chi minh toi | Only the author |

---

## 18. SOUND CATEGORIES REFERENCE

| ID | Label (Vietnamese) |
|----|-------------------|
| `trending` | Xu huong |
| `pop` | Pop |
| `edm` | EDM |
| `hiphop` | Hip Hop |
| `chill` | Chill |
| `lofi` | Lo-Fi |
| `acoustic` | Acoustic |
| `viet` | Nhac Viet |
| `funny` | Hai huoc |
| `meme` | Meme |
| `original` | Original |
| `other` | Khac |

---

## 19. REPORT REASONS REFERENCE

| ID | Label (Vietnamese) |
|----|-------------------|
| `spam` | Spam |
| `harassment` | Quay roi |
| `hate_speech` | Ngon tu thu han |
| `misinformation` | Thong tin sai lech |
| `violence` | Bao luc |
| `adult_content` | Noi dung nguoi lon |
| `other` | Ly do khac |

---

## 20. UPDATED TABLES QUICK REFERENCE

### All Tables (Including New):
| Feature | Table | Key Column Notes |
|---------|-------|------------------|
| User profile | `profiles` | Primary user table |
| Forum posts | `forum_posts` | `user_id`, `visibility`, `sound_id`, `repost_count` |
| Forum comments | `forum_comments` | `user_id`, `is_pinned`, `pinned_by` |
| Shopping tags | `shopping_tags` | `post_id`, `x_position`, `y_position`, `source` |
| Live shopping | `live_shopping_products` | `stream_id`, `product_id`, `is_featured` |
| Live purchases | `live_purchases` | `buyer_id`, `product_id`, `status` |
| Shopee affiliate | `shopee_affiliate_links` | `user_id`, `affiliate_url`, `clicks` |
| Shopee commissions | `shopee_commissions` | `affiliate_link_id`, `order_id`, `status` |
| Sound library | `sound_library` | `uploaded_by`, `genre`, `is_trending` |
| Sound favorites | `sound_favorites` | `user_id`, `sound_id` |
| Post boosts | `post_boosts` | `user_id`, `budget`, `status` |
| Boost payments | `boost_payments` | `boost_id`, `amount`, `status` |
| Advertisements | `advertisements` | `advertiser_id`, `ad_type`, `status` |
| Reposts | `reposts` | `reposter_id`, `original_post_id` |
| Comment reports | `comment_reports` | `reporter_id`, `reason`, `status` |
| Close friends | `close_friends` | `user_id`, `friend_id` |
| Post audience | `post_audience_restrictions` | `post_id`, `allow_comments`, `allow_sharing` |
| User settings | `user_settings` | `user_id`, `default_post_visibility` |
| User wallets | `user_wallets` | `user_id`, `gem_balance`, `diamond_balance` |
| Wallet transactions | `wallet_transactions` | `wallet_id`, `type`, `currency` |
| Currency packages | `currency_packages` | `gem_amount`, `price_vnd`, `is_featured` |
| Gift catalog | `gift_catalog` | `gem_cost`, `category`, `is_animated` |
| Sent gifts | `sent_gifts` | `sender_id`, `recipient_id`, `is_anonymous` |
| Creator earnings | `creator_earnings` | `creator_id`, `source_type`, `net_amount` |
| Withdrawals | `withdrawal_requests` | `creator_id`, `amount`, `status` |

---

## 21. AFFILIATE SYSTEM TABLES

### 21.1 `affiliate_profiles`
```sql
CREATE TABLE affiliate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Role & Tier
  role TEXT DEFAULT 'affiliate',             -- 'affiliate', 'ctv'
  ctv_tier TEXT DEFAULT 'beginner',          -- 'beginner', 'growing', 'master', 'grand'

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Performance Stats
  total_sales DECIMAL(15,2) DEFAULT 0,
  total_commission DECIMAL(15,2) DEFAULT 0,
  pending_commission DECIMAL(15,2) DEFAULT 0,
  paid_commission DECIMAL(15,2) DEFAULT 0,

  -- Referral Info
  referral_code TEXT UNIQUE,
  referral_count INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 21.2 `affiliate_codes` (EXTENDED with Product Links)
```sql
CREATE TABLE affiliate_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Main Code
  code TEXT UNIQUE NOT NULL,                 -- Main referral code e.g., 'gemuser_abc123'
  is_active BOOLEAN DEFAULT TRUE,

  -- Click Tracking
  clicks INTEGER DEFAULT 0,

  -- ** NEW: Product Affiliate Link Fields **
  product_id UUID,                           -- NULL = user referral, NOT NULL = product link
  product_type TEXT,                         -- 'crystal', 'course', 'subscription', 'bundle', 'book'
  short_code TEXT,                           -- Short URL code e.g., 'RQC456'
  product_name TEXT,                         -- Product name for display
  product_price DECIMAL(12,2),               -- Product price at time of link creation
  image_url TEXT,                            -- Product image URL

  -- ** NEW: Product Link Performance **
  sales_count INTEGER DEFAULT 0,             -- Number of sales via this link
  sales_amount DECIMAL(12,2) DEFAULT 0,      -- Total sales amount
  commission_earned DECIMAL(12,2) DEFAULT 0, -- Total commission earned from this link

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for product links
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_product ON affiliate_codes(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_short_code ON affiliate_codes(short_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_product_type ON affiliate_codes(product_type);

-- Unique: one product link per user per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_codes_user_product
  ON affiliate_codes(user_id, product_id)
  WHERE product_id IS NOT NULL;

-- Constraint for product_type values
ALTER TABLE affiliate_codes ADD CONSTRAINT affiliate_codes_product_type_check
  CHECK (product_type IS NULL OR product_type IN ('crystal', 'course', 'subscription', 'bundle', 'book'));
```

### 21.3 `affiliate_referrals`
```sql
CREATE TABLE affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliate_profiles(id),
  referred_user_id UUID NOT NULL REFERENCES auth.users(id),
  referral_code TEXT NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending',             -- 'pending', 'converted', 'expired'

  -- Conversion Tracking
  first_purchase_date TIMESTAMPTZ,
  total_spent DECIMAL(15,2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ
);
```

### 21.4 `affiliate_sales`
```sql
CREATE TABLE affiliate_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliate_profiles(id),
  affiliate_code_id UUID REFERENCES affiliate_codes(id),  -- Links to product-specific code if applicable

  -- Order Info
  order_id TEXT NOT NULL,
  shopify_order_id TEXT,

  -- Sale Details
  product_type TEXT,                         -- 'digital', 'physical', 'course', 'subscription'
  product_name TEXT,
  sale_amount DECIMAL(15,2) NOT NULL,

  -- Commission
  commission_rate DECIMAL(5,4) NOT NULL,     -- e.g., 0.03 for 3%
  commission_amount DECIMAL(15,2) NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending',             -- 'pending', 'approved', 'paid', 'cancelled'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);
```

### 21.5 `affiliate_commissions`
```sql
CREATE TABLE affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliate_profiles(id),
  sale_id UUID REFERENCES affiliate_sales(id),

  -- Commission Details
  amount DECIMAL(15,2) NOT NULL,
  rate DECIMAL(5,4) NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending',             -- 'pending', 'available', 'paid'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  available_at TIMESTAMPTZ,                  -- When commission becomes withdrawable
  paid_at TIMESTAMPTZ
);
```

### 21.6 `affiliate_withdrawals`
```sql
CREATE TABLE affiliate_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliate_profiles(id),

  -- Amount
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'VND',

  -- Payment Info
  payment_method TEXT NOT NULL,              -- 'bank_transfer', 'momo', 'zalopay'
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,

  -- Status
  status TEXT DEFAULT 'pending',             -- 'pending', 'processing', 'completed', 'rejected'

  -- Processing
  processed_by UUID,
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  transaction_ref TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 21.7 `affiliate_bonus_kpi`
```sql
CREATE TABLE affiliate_bonus_kpi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliate_profiles(id),

  -- KPI Period
  month INT NOT NULL,
  year INT NOT NULL,

  -- KPI Metrics
  target_sales DECIMAL(15,2),
  actual_sales DECIMAL(15,2) DEFAULT 0,
  target_referrals INT,
  actual_referrals INT DEFAULT 0,

  -- Bonus
  bonus_amount DECIMAL(15,2) DEFAULT 0,
  bonus_status TEXT DEFAULT 'pending',       -- 'pending', 'earned', 'paid'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,

  UNIQUE(affiliate_id, month, year)
);
```

---

## 22. AFFILIATE RPC FUNCTIONS

### 22.1 Click Tracking Functions
```sql
-- Increment clicks by code ID
CREATE OR REPLACE FUNCTION increment_affiliate_clicks(code_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE affiliate_codes
  SET clicks = COALESCE(clicks, 0) + 1
  WHERE id = code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment clicks by code string
CREATE OR REPLACE FUNCTION increment_affiliate_clicks_by_code(code_param TEXT)
RETURNS void AS $$
BEGIN
  UPDATE affiliate_codes
  SET clicks = COALESCE(clicks, 0) + 1
  WHERE code = code_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 22.2 Product Affiliate Sale Recording
```sql
-- Record a product affiliate sale
CREATE OR REPLACE FUNCTION record_product_affiliate_sale(
  p_affiliate_link_id UUID,
  p_sale_amount NUMERIC,
  p_commission_amount NUMERIC,
  p_quantity INTEGER DEFAULT 1
)
RETURNS void AS $$
BEGIN
  UPDATE affiliate_codes
  SET
    sales_count = COALESCE(sales_count, 0) + p_quantity,
    sales_amount = COALESCE(sales_amount, 0) + p_sale_amount,
    commission_earned = COALESCE(commission_earned, 0) + p_commission_amount
  WHERE id = p_affiliate_link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 22.3 Dashboard Summary Function
```sql
CREATE OR REPLACE FUNCTION get_affiliate_dashboard_summary(user_id_param UUID)
RETURNS TABLE (
  total_referrals BIGINT,
  pending_referrals BIGINT,
  converted_referrals BIGINT,
  total_commission NUMERIC,
  pending_commission NUMERIC,
  paid_commission NUMERIC,
  conversion_rate NUMERIC,
  total_sales NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Count referrals
    (SELECT COUNT(*) FROM affiliate_referrals ar
     JOIN affiliate_profiles ap ON ar.affiliate_id = ap.id
     WHERE ap.user_id = user_id_param)::BIGINT,

    (SELECT COUNT(*) FROM affiliate_referrals ar
     JOIN affiliate_profiles ap ON ar.affiliate_id = ap.id
     WHERE ap.user_id = user_id_param AND ar.status = 'pending')::BIGINT,

    (SELECT COUNT(*) FROM affiliate_referrals ar
     JOIN affiliate_profiles ap ON ar.affiliate_id = ap.id
     WHERE ap.user_id = user_id_param AND ar.status = 'converted')::BIGINT,

    -- Commission totals from profile
    COALESCE((SELECT ap.total_commission FROM affiliate_profiles ap WHERE ap.user_id = user_id_param), 0),
    COALESCE((SELECT ap.pending_commission FROM affiliate_profiles ap WHERE ap.user_id = user_id_param), 0),
    COALESCE((SELECT ap.paid_commission FROM affiliate_profiles ap WHERE ap.user_id = user_id_param), 0),

    -- Conversion rate
    COALESCE((
      SELECT CASE
        WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE ar.status = 'converted')::NUMERIC / COUNT(*)::NUMERIC * 100)
        ELSE 0
      END
      FROM affiliate_referrals ar
      JOIN affiliate_profiles ap ON ar.affiliate_id = ap.id
      WHERE ap.user_id = user_id_param
    ), 0),

    -- Total sales
    COALESCE((SELECT ap.total_sales FROM affiliate_profiles ap WHERE ap.user_id = user_id_param), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 23. AFFILIATE COMMISSION RATES REFERENCE

### By Role & Tier:
| Role | Tier | Commission Rate |
|------|------|-----------------|
| Affiliate | - | 3% |
| CTV | Beginner | 10% |
| CTV | Growing | 15% |
| CTV | Master | 20% |
| CTV | Grand | 30% |

### Product Type Multipliers:
| Product Type | Multiplier |
|--------------|------------|
| Crystal (physical) | 1.0x |
| Course (digital) | 1.2x |
| Subscription | 1.5x |
| Bundle | 1.3x |
| Book | 0.8x |

### CTV Tier Thresholds:
| Tier | Required Sales (VND) |
|------|---------------------|
| Beginner | 0 |
| Growing | 20,000,000 |
| Master | 100,000,000 |
| Grand | 600,000,000 |

---

## 24. PRODUCT AFFILIATE LINK URL FORMAT

### URL Structure:
```
https://gemral.com/p/{short_code}?aff={affiliate_code}

Example:
https://gemral.com/p/RQC456?aff=gemuser_abc123
```

### Short Code Generation:
- Format: `{initials}{3-digit-number}`
- Example: Product "Rose Quartz Crystal" → `RQC456`
- Initials from first 3 words (max 3 chars)
- Random 3-digit number (100-999)

---

## 25. AFFILIATE TABLES QUICK REFERENCE

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `affiliate_profiles` | User affiliate account | `user_id`, `role`, `ctv_tier`, `is_active` |
| `affiliate_codes` | Referral codes & product links | `code`, `product_id`, `short_code`, `clicks`, `sales_count` |
| `affiliate_referrals` | User signup tracking | `affiliate_id`, `referred_user_id`, `status` |
| `affiliate_sales` | Sales records | `affiliate_id`, `order_id`, `commission_amount` |
| `affiliate_commissions` | Commission records | `affiliate_id`, `sale_id`, `status` |
| `affiliate_withdrawals` | Payout requests | `affiliate_id`, `amount`, `status`, `payment_method` |
| `affiliate_bonus_kpi` | Monthly KPI bonuses | `affiliate_id`, `month`, `year`, `bonus_amount` |

---

## 26. ROW LEVEL SECURITY POLICIES (12 Major Features)

### 26.1 RLS Enabled Tables
```sql
-- Enable RLS on all new tables
ALTER TABLE shopping_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_shopping_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopee_affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopee_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sound_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE sound_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE close_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_audience_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
```

### 26.2 Policy Summary
| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `shopping_tags` | Everyone | Auth | - | Post owner |
| `sound_library` | Approved only | Auth | Owner | - |
| `sound_favorites` | Owner | Owner | - | Owner |
| `reposts` | Everyone | Owner | - | Owner |
| `close_friends` | Owner | Owner | - | Owner |
| `user_wallets` | Owner | Owner | - | - |
| `wallet_transactions` | Owner | - | - | - |
| `currency_packages` | Active only | - | - | - |
| `gift_catalog` | Active only | - | - | - |
| `sent_gifts` | Sender/Receiver | Sender | - | - |
| `creator_earnings` | Creator | - | - | - |
| `withdrawal_requests` | Creator | Creator | - | - |
| `post_boosts` | Owner | Owner | Owner | - |
| `advertisements` | Owner | Owner | Owner | - |
| `comment_reports` | Reporter | Reporter | - | - |
| `post_audience_restrictions` | Post owner | Post owner | Post owner | Post owner |

---

## 27. GIFT CATEGORIES REFERENCE

| ID | Label (Vietnamese) | Example Gifts |
|----|-------------------|---------------|
| `standard` | Tieu chuan | Heart, Star, Rose |
| `premium` | Cao cap | Diamond |
| `luxury` | Xa xi | Crown |
| `animated` | Hoat hinh | Fireworks |
| `limited` | Gioi han | Special event gifts |

---

## 28. CURRENCY PACKAGES REFERENCE

| Name | Gems | Price (VND) | Bonus | Featured |
|------|------|-------------|-------|----------|
| Starter Pack | 100 | 22,000 | 0 | No |
| Popular Pack | 500 | 99,000 | 50 | Yes |
| Pro Pack | 1,000 | 189,000 | 150 | No |
| VIP Pack | 5,000 | 890,000 | 1,000 | No |

---

## 29. CREATOR EARNINGS SPLIT

| Party | Percentage | Notes |
|-------|-----------|-------|
| Creator | 70% | `net_amount` |
| Platform | 30% | `platform_fee` |
| Hold Period | 7 days | Before `available_at` |

---

## 30. STATUS VALUES REFERENCE

### 30.1 `post_boosts.status`
| Value | Description |
|-------|-------------|
| `pending` | Awaiting payment/approval |
| `active` | Currently running |
| `paused` | Temporarily stopped |
| `completed` | Budget exhausted or expired |
| `cancelled` | Cancelled by user |

### 30.2 `advertisements.status`
| Value | Description |
|-------|-------------|
| `draft` | Not submitted |
| `pending_review` | Awaiting admin review |
| `active` | Running |
| `paused` | Temporarily stopped |
| `rejected` | Rejected by admin |
| `completed` | Finished |

### 30.3 `creator_earnings.status`
| Value | Description |
|-------|-------------|
| `pending` | Within hold period |
| `available` | Can be withdrawn |
| `withdrawn` | Already withdrawn |
| `cancelled` | Cancelled/refunded |

### 30.4 `sound_library.upload_status`
| Value | Description |
|-------|-------------|
| `pending` | Awaiting review |
| `processing` | Being processed |
| `approved` | Ready to use |
| `rejected` | Not approved |

---

## 31. PORTFOLIO SYSTEM TABLES (Issue #22)

### 31.1 `portfolio_items` (User Portfolio Positions)
```sql
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Position Info
  symbol VARCHAR(20) NOT NULL,                 -- 'BTC', 'ETH', 'SOL'
  exchange VARCHAR(50),                        -- 'binance', 'okx', 'coinbase'

  -- Amount & Price
  quantity DECIMAL(24, 10) NOT NULL DEFAULT 0,
  average_buy_price DECIMAL(24, 10),
  total_cost DECIMAL(24, 10) DEFAULT 0,

  -- Current Value (updated periodically)
  current_price DECIMAL(24, 10),
  current_value DECIMAL(24, 10),
  unrealized_pnl DECIMAL(24, 10),
  unrealized_pnl_percent DECIMAL(8, 4),

  -- Tracking
  notes TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  first_buy_date TIMESTAMPTZ,
  last_transaction_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, symbol)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON public.portfolio_items(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_symbol ON public.portfolio_items(symbol);
CREATE INDEX IF NOT EXISTS idx_portfolio_active ON public.portfolio_items(is_active) WHERE is_active = TRUE;
```

### 31.2 `portfolio_transactions` (Buy/Sell History)
```sql
CREATE TABLE IF NOT EXISTS public.portfolio_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_item_id UUID REFERENCES public.portfolio_items(id) ON DELETE SET NULL,

  -- Transaction Type
  type VARCHAR(10) NOT NULL,                   -- 'buy', 'sell'
  symbol VARCHAR(20) NOT NULL,
  exchange VARCHAR(50),

  -- Amounts
  quantity DECIMAL(24, 10) NOT NULL,
  price DECIMAL(24, 10) NOT NULL,
  total_value DECIMAL(24, 10) NOT NULL,
  fee DECIMAL(24, 10) DEFAULT 0,

  -- For sell transactions
  realized_pnl DECIMAL(24, 10),
  realized_pnl_percent DECIMAL(8, 4),

  -- Notes
  notes TEXT,

  -- Timestamps
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.portfolio_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON public.portfolio_transactions(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.portfolio_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.portfolio_transactions(type);
```

### 31.3 Portfolio RLS Policies
```sql
-- Enable RLS
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_transactions ENABLE ROW LEVEL SECURITY;

-- portfolio_items policies
CREATE POLICY "Users can manage own portfolio" ON public.portfolio_items
  FOR ALL USING (auth.uid() = user_id);

-- portfolio_transactions policies
CREATE POLICY "Users can view own transactions" ON public.portfolio_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.portfolio_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 32. WITHDRAWAL SYSTEM - ACTUAL SCHEMA (Issue #24)

> **IMPORTANT**: The actual `withdrawal_requests` table uses different column names than originally documented.

### 32.1 `withdrawal_requests` (Actual Schema)
```sql
-- Table already exists with partner_id column (NOT user_id)
-- Column mapping:
--   partner_id = user_id
--   amount = gems amount (INTEGER)
--   account_holder_name = bank account holder name

CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- User (uses partner_id, NOT user_id)
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Amount info
  amount INTEGER NOT NULL,                     -- Gems amount to withdraw
  available_balance_at_request INTEGER,        -- Balance snapshot at request time
  vnd_amount DECIMAL(15, 0),                   -- VND equivalent
  platform_fee DECIMAL(15, 0),                 -- Platform fee in VND
  author_receive DECIMAL(15, 0),               -- Net amount after fee

  -- Bank info
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_holder_name VARCHAR(100) NOT NULL,   -- NOTE: NOT account_name

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'completed')),

  -- Admin processing
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  reject_reason TEXT,
  transaction_id VARCHAR(100),                 -- Bank transaction reference

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_withdraw_partner ON public.withdrawal_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_withdraw_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdraw_pending ON public.withdrawal_requests(status) WHERE status = 'pending';
```

### 32.2 Column Mapping Reference
| Code/Service | Actual DB Column |
|--------------|------------------|
| `userId` | `partner_id` |
| `gemsAmount` | `amount` |
| `accountName` | `account_holder_name` |
| `processedBy` | `reviewed_by` |
| `processedAt` | `reviewed_at` |
| `rejectReason` | `reject_reason` |

### 32.3 `process_withdrawal` RPC Function
```sql
CREATE OR REPLACE FUNCTION process_withdrawal(
  p_request_id UUID,
  p_admin_id UUID,
  p_action VARCHAR(10),                        -- 'approve' or 'reject'
  p_reject_reason TEXT DEFAULT NULL,
  p_transaction_id VARCHAR(100) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_request RECORD;
  v_user_balance INTEGER;
BEGIN
  -- Get request
  SELECT * INTO v_request
  FROM public.withdrawal_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Request not found');
  END IF;

  IF v_request.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Request already processed');
  END IF;

  IF p_action = 'approve' THEN
    -- Check user balance
    SELECT gems INTO v_user_balance
    FROM public.profiles
    WHERE id = v_request.partner_id;

    IF v_user_balance IS NULL OR v_user_balance < v_request.amount THEN
      RETURN json_build_object('success', false, 'error', 'Insufficient balance');
    END IF;

    -- Deduct balance
    UPDATE public.profiles
    SET gems = gems - v_request.amount,
        updated_at = NOW()
    WHERE id = v_request.partner_id;

    -- Update request
    UPDATE public.withdrawal_requests
    SET status = 'approved',
        reviewed_by = p_admin_id,
        reviewed_at = NOW(),
        transaction_id = p_transaction_id,
        updated_at = NOW()
    WHERE id = p_request_id;

    -- Create notification for user
    INSERT INTO public.notifications (
      user_id, type, title, body, data
    ) VALUES (
      v_request.partner_id,
      'withdraw_approved',
      'Rut tien thanh cong',
      'Yeu cau rut ' || v_request.amount || ' gems da duoc duyet.',
      json_build_object('request_id', p_request_id, 'amount', v_request.amount)
    );

    RETURN json_build_object('success', true, 'message', 'Withdrawal approved');

  ELSIF p_action = 'reject' THEN
    -- Update request
    UPDATE public.withdrawal_requests
    SET status = 'rejected',
        reviewed_by = p_admin_id,
        reviewed_at = NOW(),
        reject_reason = p_reject_reason,
        updated_at = NOW()
    WHERE id = p_request_id;

    -- Create notification for user
    INSERT INTO public.notifications (
      user_id, type, title, body, data
    ) VALUES (
      v_request.partner_id,
      'withdraw_rejected',
      'Yeu cau rut tien bi tu choi',
      'Ly do: ' || COALESCE(p_reject_reason, 'Khong dap ung dieu kien'),
      json_build_object('request_id', p_request_id, 'reason', p_reject_reason)
    );

    RETURN json_build_object('success', true, 'message', 'Withdrawal rejected');
  ELSE
    RETURN json_build_object('success', false, 'error', 'Invalid action');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 33. NOTIFICATIONS SYSTEM TABLES (Issue #25)

### 33.1 `notifications` (General Notifications)
```sql
-- Supports both targeted and broadcast notifications
-- Broadcast = user_id IS NULL (visible to all users)

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Target (NULL = broadcast to all users)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content
  type VARCHAR(50) NOT NULL DEFAULT 'system',
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,

  -- Optional data
  data JSONB DEFAULT '{}',
  image_url TEXT,
  action_url TEXT,

  -- Sender info (for social notifications)
  from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_broadcast ON public.notifications(created_at DESC) WHERE user_id IS NULL;
```

### 33.2 `user_push_tokens` (Push Notification Tokens)
```sql
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  device_type VARCHAR(20) DEFAULT 'unknown',   -- 'ios', 'android', 'unknown'
  device_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, push_token)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_active ON user_push_tokens(is_active) WHERE is_active = TRUE;
```

### 33.3 `forum_notifications` - Updated Column
```sql
-- Added is_broadcast column for broadcast notifications
ALTER TABLE forum_notifications
ADD COLUMN IF NOT EXISTS is_broadcast BOOLEAN DEFAULT FALSE;

-- Index for broadcast lookups
CREATE INDEX IF NOT EXISTS idx_forum_notifications_broadcast
  ON forum_notifications(is_broadcast) WHERE is_broadcast = TRUE;
```

### 33.4 Notifications RLS Policies
```sql
-- notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications OR broadcast notifications (user_id IS NULL)
CREATE POLICY "Users can view own and broadcast notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- user_push_tokens table
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tokens" ON user_push_tokens
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins read all tokens for broadcasting" ON user_push_tokens
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = TRUE))
  );

-- forum_notifications - updated for broadcast
CREATE POLICY "Users can view own and broadcast notifications" ON forum_notifications
  FOR SELECT USING (auth.uid() = user_id OR is_broadcast = TRUE);
```

### 33.5 Notification RPC Functions
```sql
-- Send broadcast notification (user_id = NULL)
CREATE OR REPLACE FUNCTION send_broadcast_notification(
  p_title VARCHAR(200),
  p_message TEXT,
  p_type VARCHAR(50) DEFAULT 'system',
  p_data JSONB DEFAULT '{}',
  p_image_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, type, title, body, data, image_url
  ) VALUES (
    NULL,                                      -- Broadcast to all
    p_type, p_title, p_message, p_data, p_image_url
  )
  RETURNING id INTO v_notification_id;

  RETURN json_build_object('success', true, 'notification_id', v_notification_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Send notification to specific users
CREATE OR REPLACE FUNCTION send_notification_to_users(
  p_user_ids UUID[],
  p_title VARCHAR(200),
  p_message TEXT,
  p_type VARCHAR(50) DEFAULT 'system',
  p_data JSONB DEFAULT '{}'
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_count INTEGER := 0;
BEGIN
  FOREACH v_user_id IN ARRAY p_user_ids LOOP
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (v_user_id, p_type, p_title, p_message, p_data);
    v_count := v_count + 1;
  END LOOP;

  RETURN json_build_object('success', true, 'sent_count', v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin send broadcast (with logging)
CREATE OR REPLACE FUNCTION admin_send_broadcast(
  p_title TEXT,
  p_body TEXT,
  p_admin_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Verify admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_admin_id AND (role = 'admin' OR is_admin = TRUE)
  ) THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Unauthorized: Admin access required');
  END IF;

  -- Insert broadcast to forum_notifications for all users
  WITH inserted AS (
    INSERT INTO forum_notifications (id, user_id, type, title, message, is_broadcast, is_read, created_at)
    SELECT gen_random_uuid(), id, 'system', p_title, p_body, TRUE, FALSE, NOW()
    FROM profiles
    WHERE id != p_admin_id
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_count FROM inserted;

  -- Also insert to notifications table as broadcast
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (NULL, 'system', p_title, p_body, jsonb_build_object('sent_by', p_admin_id));

  RETURN jsonb_build_object('success', TRUE, 'sent_count', v_count, 'message', 'Broadcast sent');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 34. NOTIFICATION TYPES REFERENCE

| Type | Description | Target |
|------|-------------|--------|
| `system` | System announcements | Broadcast (NULL) |
| `admin_withdraw_request` | New withdrawal to process | Admin users |
| `withdraw_approved` | Withdrawal approved | Specific user |
| `withdraw_rejected` | Withdrawal rejected | Specific user |
| `like` | Post/comment liked | Specific user |
| `comment` | New comment on post | Specific user |
| `follow` | New follower | Specific user |
| `mention` | Mentioned in post/comment | Specific user |
| `gift` | Received a gift | Specific user |

---

## 35. UPDATED QUICK REFERENCE - NEW TABLES

### All New Tables (Issues 22-25):
| Feature | Table | Key Column Notes |
|---------|-------|------------------|
| Portfolio items | `portfolio_items` | `user_id`, `symbol`, `quantity`, `average_buy_price` |
| Portfolio history | `portfolio_transactions` | `user_id`, `type`, `symbol`, `quantity`, `price` |
| Notifications | `notifications` | `user_id` (NULL = broadcast), `type`, `read` |
| Push tokens | `user_push_tokens` | `user_id`, `push_token`, `device_type` |
| Withdrawals | `withdrawal_requests` | `partner_id` (NOT user_id!), `amount`, `status` |
| Forum notifications | `forum_notifications` | Added `is_broadcast` column |

### Service File Mappings:
| Service | Database Column | Notes |
|---------|----------------|-------|
| `withdrawService.js` | `partner_id` | Use instead of `user_id` |
| `withdrawService.js` | `amount` | Gems amount (INTEGER) |
| `withdrawService.js` | `account_holder_name` | Bank account name |
| `notificationService.js` | `user_id IS NULL` | For broadcast notifications |
| `portfolioService.js` | `portfolio_items` | Main positions table |

---

## 36. AFFIRMATION & STREAK SYSTEM TABLES

### 36.1 `affirmation_completions` (Daily Affirmation Tracking)
```sql
CREATE TABLE IF NOT EXISTS public.affirmation_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Daily tracking
  completed_date DATE NOT NULL,
  affirmation_text TEXT,

  -- Optional metadata
  category TEXT,                               -- 'abundance', 'love', 'health', 'success'
  mood_before INT,                             -- 1-10 scale
  mood_after INT,                              -- 1-10 scale
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One completion per user per day
  UNIQUE(user_id, completed_date)
);

-- Indexes
CREATE INDEX idx_affirmation_completions_user ON public.affirmation_completions(user_id);
CREATE INDEX idx_affirmation_completions_date ON public.affirmation_completions(completed_date DESC);
CREATE INDEX idx_affirmation_completions_user_date ON public.affirmation_completions(user_id, completed_date);
```

### 36.2 `user_streaks` (Streak Tracking)
```sql
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Streak type
  streak_type TEXT NOT NULL,                   -- 'affirmation', 'meditation', 'journal', 'login'

  -- Streak stats
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_completions INT DEFAULT 0,

  -- Date tracking
  last_completion_date DATE,
  streak_start_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One streak type per user
  UNIQUE(user_id, streak_type)
);

-- Indexes
CREATE INDEX idx_user_streaks_user ON public.user_streaks(user_id);
CREATE INDEX idx_user_streaks_type ON public.user_streaks(streak_type);
CREATE INDEX idx_user_streaks_user_type ON public.user_streaks(user_id, streak_type);
```

### 36.3 Streak Helper Functions
```sql
-- Update streak on completion
CREATE OR REPLACE FUNCTION update_user_streak(
  p_user_id UUID,
  p_streak_type TEXT
)
RETURNS VOID AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INT;
  v_longest_streak INT;
BEGIN
  -- Get current streak info
  SELECT last_completion_date, current_streak, longest_streak
  INTO v_last_date, v_current_streak, v_longest_streak
  FROM public.user_streaks
  WHERE user_id = p_user_id AND streak_type = p_streak_type;

  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO public.user_streaks (
      user_id, streak_type, current_streak, longest_streak,
      total_completions, last_completion_date, streak_start_date
    ) VALUES (
      p_user_id, p_streak_type, 1, 1, 1, CURRENT_DATE, CURRENT_DATE
    );
  ELSE
    -- Check if already completed today
    IF v_last_date = CURRENT_DATE THEN
      RETURN; -- Already completed today
    END IF;

    -- Check if continuing streak (completed yesterday)
    IF v_last_date = CURRENT_DATE - 1 THEN
      -- Continue streak
      UPDATE public.user_streaks
      SET
        current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        total_completions = total_completions + 1,
        last_completion_date = CURRENT_DATE,
        updated_at = NOW()
      WHERE user_id = p_user_id AND streak_type = p_streak_type;
    ELSE
      -- Streak broken, restart
      UPDATE public.user_streaks
      SET
        current_streak = 1,
        total_completions = total_completions + 1,
        last_completion_date = CURRENT_DATE,
        streak_start_date = CURRENT_DATE,
        updated_at = NOW()
      WHERE user_id = p_user_id AND streak_type = p_streak_type;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user streak
CREATE OR REPLACE FUNCTION get_user_streak(
  p_user_id UUID,
  p_streak_type TEXT
)
RETURNS TABLE (
  current_streak INT,
  longest_streak INT,
  total_completions INT,
  last_completion_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(us.current_streak, 0),
    COALESCE(us.longest_streak, 0),
    COALESCE(us.total_completions, 0),
    us.last_completion_date
  FROM public.user_streaks us
  WHERE us.user_id = p_user_id AND us.streak_type = p_streak_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 37. USER WIDGETS TABLE (Vision Board)

### 37.1 `user_widgets` (Existing Table - Added settings column)
```sql
-- Table already exists, added settings column:
ALTER TABLE public.user_widgets ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Full schema reference:
-- id UUID PRIMARY KEY
-- user_id UUID NOT NULL REFERENCES auth.users(id)
-- type TEXT                                   -- 'affirmation', 'goal', 'habit', 'quote', 'crystal', 'tarot'
-- title TEXT
-- data JSONB DEFAULT '{}'
-- settings JSONB DEFAULT '{}'                 -- NEW: Widget settings
-- position INT DEFAULT 0
-- is_active BOOLEAN DEFAULT TRUE
-- created_at TIMESTAMPTZ DEFAULT NOW()
-- updated_at TIMESTAMPTZ DEFAULT NOW()
```

---

## 38. STREAK TYPES REFERENCE

| Type | Description | Used For |
|------|-------------|----------|
| `affirmation` | Daily affirmation completion | GemMaster Affirmation Widget |
| `meditation` | Daily meditation sessions | Future meditation feature |
| `journal` | Daily journaling | Future journal feature |
| `login` | Daily app login | Engagement tracking |

---

## 39. AFFIRMATION CATEGORIES REFERENCE

| Category | Vietnamese | Description |
|----------|-----------|-------------|
| `abundance` | Thịnh Vượng | Wealth, prosperity, success |
| `love` | Tình Yêu | Relationships, self-love |
| `health` | Sức Khỏe | Physical and mental health |
| `success` | Thành Công | Career, goals, achievement |
| `gratitude` | Biết Ơn | Appreciation, thankfulness |
| `confidence` | Tự Tin | Self-esteem, empowerment |

---

## 40. ENGAGEMENT & FEED SYSTEM TABLES

### 40.1 `post_interactions` (Engagement Tracking)
```sql
CREATE TABLE post_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'save', 'share', 'comment')),
  dwell_time INT, -- Time spent viewing in seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_post_interaction UNIQUE (user_id, post_id, interaction_type)
);

CREATE INDEX idx_post_interactions_user ON post_interactions(user_id);
CREATE INDEX idx_post_interactions_post ON post_interactions(post_id);
CREATE INDEX idx_post_interactions_type ON post_interactions(interaction_type);
```

### 40.2 `user_feed_preferences` (Feed Personalization)
```sql
CREATE TABLE user_feed_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_categories UUID[] DEFAULT '{}',
  discovery_weight DECIMAL(3,2) DEFAULT 0.4,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 40.3 `user_hashtag_affinity` (Content Recommendation)
```sql
CREATE TABLE user_hashtag_affinity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  engagement_count INT DEFAULT 1,
  last_engaged_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_hashtag UNIQUE (user_id, hashtag)
);
```

### 40.4 `user_content_dislikes` (Negative Signals)
```sql
CREATE TABLE user_content_dislikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
  dislike_count INT DEFAULT 1,
  last_disliked_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_category_dislike UNIQUE (user_id, category_id)
);
```

### 40.5 `feed_impressions` (Feed Analytics)
```sql
CREATE TABLE feed_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  position INT NOT NULL,
  source TEXT CHECK (source IN ('following', 'discovery', 'serendipity', 'ad')),
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  interacted BOOLEAN DEFAULT FALSE,
  interaction_type TEXT,

  CONSTRAINT unique_feed_impression UNIQUE (user_id, post_id, session_id)
);
```

### 40.6 `ad_impressions` (Ad Performance Tracking)
```sql
CREATE TABLE ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('affiliate_product', 'subscription_upsell', 'feature_promo')),
  session_id UUID NOT NULL,
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  click_at TIMESTAMPTZ,
  converted BOOLEAN DEFAULT FALSE,
  convert_at TIMESTAMPTZ,

  CONSTRAINT unique_ad_impression UNIQUE (user_id, ad_type, session_id)
);
```

---

## 41. FORUM_POSTS ENGAGEMENT COLUMNS

### Added columns to `forum_posts` table:
```sql
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS save_count INT DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS share_count INT DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS comment_count INT DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS repost_count INT DEFAULT 0;
```

---

## 42. ENGAGEMENT RPC FUNCTIONS

### 42.1 increment_post_count (Generic)
```sql
CREATE OR REPLACE FUNCTION increment_post_count(post_uuid UUID, count_field TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE forum_posts SET %I = COALESCE(%I, 0) + 1 WHERE id = $1', count_field, count_field)
  USING post_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_post_count TO authenticated;
```

### 42.2 increment_repost_count
```sql
CREATE OR REPLACE FUNCTION increment_repost_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET repost_count = COALESCE(repost_count, 0) + 1
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_repost_count TO authenticated;
```

### 42.3 decrement_repost_count
```sql
CREATE OR REPLACE FUNCTION decrement_repost_count(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts
  SET repost_count = GREATEST(COALESCE(repost_count, 0) - 1, 0)
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION decrement_repost_count TO authenticated;
```

---

## 43. UPDATED TABLES QUICK REFERENCE - ALL NEW TABLES

### All Tables (Including New from Migration 2025-11-30):
| Feature | Table | Key Column Notes |
|---------|-------|------------------|
| Affirmation tracking | `affirmation_completions` | `user_id`, `completed_date`, `category` |
| Streak tracking | `user_streaks` | `user_id`, `streak_type`, `current_streak` |
| Vision Board widgets | `user_widgets` | `user_id`, `type`, `settings` (NEW column) |
| Affiliate profiles | `affiliate_profiles` | `user_id`, `role`, `total_commission` |
| Post interactions | `post_interactions` | `user_id`, `post_id`, `interaction_type`, `dwell_time` |
| Feed preferences | `user_feed_preferences` | `user_id`, `preferred_categories`, `discovery_weight` |
| Hashtag affinity | `user_hashtag_affinity` | `user_id`, `hashtag`, `engagement_count` |
| Content dislikes | `user_content_dislikes` | `user_id`, `category_id`, `dislike_count` |
| Feed impressions | `feed_impressions` | `user_id`, `post_id`, `session_id`, `source` |
| Ad impressions | `ad_impressions` | `user_id`, `ad_type`, `clicked`, `converted` |
| Gift catalog | `gift_catalog` | `name`, `gem_cost`, `category`, `is_animated` |
| Reposts | `reposts` | `original_post_id`, `reposter_id`, `quote` |
| Goal Scenarios | `goal_scenarios` | `life_area`, `affirmations` (JSONB), `action_steps` (JSONB) |

### RPC Functions Summary:
| Function | Purpose | Parameters |
|----------|---------|------------|
| `increment_post_count` | Increment any engagement count | `post_uuid`, `count_field` |
| `increment_repost_count` | Increment repost count | `p_post_id` |
| `decrement_repost_count` | Decrement repost count | `p_post_id` |

### Interaction Types Reference:
| Type | Description |
|------|-------------|
| `view` | User viewed the post |
| `like` | User liked the post |
| `save` | User saved/bookmarked the post |
| `share` | User shared the post |
| `comment` | User commented on the post |

### Feed Source Types Reference:
| Source | Description |
|--------|-------------|
| `following` | Posts from followed users |
| `discovery` | Algorithmic discovery posts |
| `serendipity` | Random interesting posts |
| `ad` | Sponsored/ad content |

### Ad Types Reference:
| Type | Description |
|------|-------------|
| `affiliate_product` | Product affiliate ad |
| `subscription_upsell` | Tier upgrade promotion |
| `feature_promo` | Feature promotion |

---

## 44. GOAL SCENARIOS SYSTEM (Migration 2025-12-03)

> **Purpose**: Pre-defined goal scenarios with affirmations and action plans for Vision Board

### Table: `goal_scenarios`

```sql
CREATE TABLE goal_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  life_area VARCHAR(50) NOT NULL,       -- 'finance', 'relationships', 'career', 'health', 'personal', 'spiritual'
  title VARCHAR(255) NOT NULL,          -- Scenario title in Vietnamese
  description TEXT,                      -- Detailed description
  icon VARCHAR(50) DEFAULT 'target',    -- Icon name for display
  affirmations JSONB NOT NULL DEFAULT '[]',  -- Array of affirmation strings
  action_steps JSONB NOT NULL DEFAULT '[]',  -- Array of {step, description, duration} objects
  difficulty VARCHAR(20) DEFAULT 'medium',   -- 'easy', 'medium', 'hard'
  duration_days INT DEFAULT 30,         -- Recommended duration in days
  is_active BOOLEAN DEFAULT TRUE,       -- Show/hide scenario
  sort_order INT DEFAULT 0,             -- Display order
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_goal_scenarios_life_area ON goal_scenarios(life_area);
CREATE INDEX idx_goal_scenarios_active ON goal_scenarios(is_active);
```

### Life Areas Reference:
| Value | Vietnamese | Description |
|-------|------------|-------------|
| `finance` | Tài chính | Financial goals (saving, investing, income) |
| `relationships` | Mối quan hệ | Relationship goals (family, friends, romance) |
| `career` | Sự nghiệp | Career goals (promotion, skills, business) |
| `health` | Sức khỏe | Health goals (fitness, nutrition, mental health) |
| `personal` | Phát triển cá nhân | Personal development (learning, creativity) |
| `spiritual` | Tâm linh | Spiritual growth (meditation, mindfulness) |

### JSONB Column Structures:

**affirmations** (Array of strings):
```json
[
  "Tôi xứng đáng với sự giàu có và thịnh vượng",
  "Tiền bạc đến với tôi một cách tự nhiên và dễ dàng",
  "Tôi quản lý tài chính một cách thông minh"
]
```

**action_steps** (Array of objects):
```json
[
  {
    "step": "Theo dõi chi tiêu hàng ngày",
    "description": "Ghi lại mọi khoản chi vào sổ hoặc ứng dụng",
    "duration": "7 ngày đầu"
  },
  {
    "step": "Tạo ngân sách tháng",
    "description": "Phân bổ thu nhập theo tỷ lệ 50/30/20",
    "duration": "Tuần 2"
  }
]
```

### RLS Policies:
```sql
-- Public read access (anyone can view scenarios)
CREATE POLICY "goal_scenarios_public_read" ON goal_scenarios
  FOR SELECT USING (is_active = TRUE);

-- Admin only for write operations
CREATE POLICY "goal_scenarios_admin_write" ON goal_scenarios
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
```

### Sample Scenarios Count:
| Life Area | Count | Description |
|-----------|-------|-------------|
| `finance` | 10 | Financial freedom, saving, investing |
| `relationships` | 10 | Communication, connection, love |
| `career` | 10 | Growth, leadership, balance |
| `health` | 10 | Fitness, nutrition, sleep, mental health |
| `personal` | 5 | Learning, creativity, self-confidence |
| `spiritual` | 5 | Meditation, gratitude, mindfulness |
| **Total** | **50** | |

### Usage in Vision Board Flow:
1. User clicks "Thêm Mục Tiêu Mới" button
2. Modal shows life area selection (6 options)
3. After selecting life area, fetch scenarios: `WHERE life_area = $selected AND is_active = TRUE`
4. User selects a scenario
5. System auto-populates affirmations and action_steps from the scenario
6. User can customize before saving to `user_widgets` table

---

## 45. DATABASE TRIGGERS REFERENCE (From Actual DB - 2025-12-05)

> **IMPORTANT**: This is the complete list of all triggers in the production database.

### 45.1 User & Profile Triggers

| Trigger | Table | Event | Function | Description |
|---------|-------|-------|----------|-------------|
| `trigger_apply_pending_gems` | `profiles` | AFTER INSERT | `apply_pending_gems()` | Apply pending gems to new users |
| `trigger_create_wallet_on_profile` | `profiles` | AFTER INSERT | `create_wallet_for_new_user()` | Auto-create wallet on signup |
| `update_profiles_updated_at` | `profiles` | BEFORE UPDATE | `update_updated_at_column()` | Update timestamp |
| `on_user_created_paper_account` | `users` | AFTER INSERT | `handle_new_paper_trading_account()` | Create paper trading account |
| `on_user_created_stats` | `users` | AFTER INSERT | `handle_new_user_stats()` | Initialize user stats |
| `set_users_updated_at` | `users` | BEFORE UPDATE | `handle_users_updated_at()` | Update timestamp |
| `trigger_create_default_user_settings` | `users` | AFTER INSERT | `create_default_user_settings()` | Create default settings |
| `trigger_sync_full_name` | `users` | BEFORE INSERT/UPDATE | `sync_full_name_from_display_name()` | Sync display name |

### 45.2 Affiliate System Triggers

| Trigger | Table | Event | Function | Description |
|---------|-------|-------|----------|-------------|
| `trigger_check_tier_upgrade` | `affiliate_profiles` | BEFORE UPDATE | `check_tier_upgrade()` | Check CTV tier upgrade |
| `trigger_generate_referral_code` | `affiliate_profiles` | AFTER INSERT | `generate_referral_code()` | Auto-generate referral code |

### 45.3 Forum Triggers

| Trigger | Table | Event | Function | Description |
|---------|-------|-------|----------|-------------|
| `trigger_new_real_post` | `forum_posts` | AFTER INSERT | `notify_new_real_post()` | Notify on new post |
| `trigger_new_real_comment` | `forum_comments` | AFTER INSERT | `notify_new_real_comment()` | Notify on new comment |
| `trigger_update_comments_count` | `forum_comments` | AFTER INSERT/DELETE | `update_post_comments_count()` | Update comment count |
| `trigger_update_post_likes` | `forum_likes` | AFTER INSERT/DELETE | `update_post_likes_count()` | Update like count |
| `trigger_update_popularity_on_comment` | `forum_comments` | AFTER INSERT/DELETE | `calculate_popularity_score()` | Calculate popularity |
| `trigger_update_popularity_on_like` | `forum_likes` | AFTER INSERT/DELETE | `calculate_popularity_score()` | Calculate popularity |
| `set_forum_reply_updated_at` | `forum_replies` | BEFORE UPDATE | `handle_forum_reply_updated_at()` | Update timestamp |
| `trigger_update_thread_on_reply` | `forum_replies` | AFTER INSERT | `update_thread_on_reply()` | Update thread on reply |
| `trigger_reply_like_count` | `forum_reply_likes` | AFTER INSERT/DELETE | `update_reply_like_count()` | Update reply likes |
| `trigger_thread_like_count` | `forum_thread_likes` | AFTER INSERT/DELETE | `update_thread_like_count()` | Update thread likes |
| `set_forum_thread_updated_at` | `forum_threads` | BEFORE UPDATE | `handle_forum_thread_updated_at()` | Update timestamp |

### 45.4 Course & Lesson Triggers

| Trigger | Table | Event | Function | Description |
|---------|-------|-------|----------|-------------|
| `trigger_generate_certificate_number` | `course_certificates` | BEFORE INSERT | `generate_certificate_number()` | Generate cert number |
| `lesson_version_trigger` | `course_lessons` | BEFORE UPDATE | `create_lesson_version()` | Create lesson version |
| `trigger_update_course_completion` | `course_progress` | AFTER INSERT/UPDATE | `update_course_completion()` | Update completion status |
| `trigger_update_course_rating` | `course_reviews` | AFTER INSERT/UPDATE/DELETE | `update_course_rating()` | Update course rating |
| `trigger_update_enrollment_progress` | `lesson_progress` | AFTER INSERT/UPDATE | `update_enrollment_progress()` | Update enrollment progress |

### 45.5 Engagement & Interaction Triggers

| Trigger | Table | Event | Function | Description |
|---------|-------|-------|----------|-------------|
| `trigger_update_engagement_score` | `post_interactions` | AFTER INSERT/UPDATE | `update_post_engagement_score()` | Update engagement score |
| `trigger_auto_award_badges` | `user_stats` | AFTER INSERT/UPDATE | `notify_auto_award_badges()` | Auto-award badges |
| `user_stats_update_timestamp` | `user_stats` | BEFORE UPDATE | `update_user_stats_timestamp()` | Update timestamp |

### 45.6 Event & Community Triggers

| Trigger | Table | Event | Function | Description |
|---------|-------|-------|----------|-------------|
| `event_update_timestamp` | `community_events` | BEFORE UPDATE | `update_event_timestamp()` | Update timestamp |
| `rsvp_increment_participants` | `event_rsvps` | AFTER INSERT | `increment_event_participants()` | Increment participants |
| `rsvp_decrement_participants_update` | `event_rsvps` | AFTER UPDATE | `decrement_event_participants()` | Decrement on cancel |
| `rsvp_decrement_participants_delete` | `event_rsvps` | AFTER DELETE | `decrement_event_participants()` | Decrement on delete |
| `rsvp_update_timestamp` | `event_rsvps` | BEFORE UPDATE | `update_rsvp_timestamp()` | Update timestamp |

### 45.7 Portfolio & Trading Triggers

| Trigger | Table | Event | Function | Description |
|---------|-------|-------|----------|-------------|
| `sync_portfolio_trigger` | `portfolio_holdings` | BEFORE INSERT/UPDATE | `sync_avg_price_columns()` | Sync avg price |
| `update_portfolio_holdings_updated_at` | `portfolio_holdings` | BEFORE UPDATE | `update_updated_at_column()` | Update timestamp |
| `sync_transaction_trigger` | `portfolio_transactions` | BEFORE INSERT/UPDATE | `sync_transaction_columns()` | Sync transaction data |
| `set_paper_accounts_updated_at` | `paper_trading_accounts` | BEFORE UPDATE | `handle_paper_trading_updated_at()` | Update timestamp |
| `set_paper_holdings_updated_at` | `paper_trading_holdings` | BEFORE UPDATE | `handle_paper_trading_updated_at()` | Update timestamp |
| `set_paper_stop_orders_updated_at` | `paper_trading_stop_orders` | BEFORE UPDATE | `handle_paper_trading_updated_at()` | Update timestamp |
| `set_trading_journal_updated_at` | `trading_journal` | BEFORE UPDATE | `handle_trading_journal_updated_at()` | Update timestamp |

### 45.8 Messaging Triggers

| Trigger | Table | Event | Function | Description |
|---------|-------|-------|----------|-------------|
| `message_increment_unread` | `messages` | AFTER INSERT | `increment_unread_count()` | Increment unread count |
| `message_update_conversation` | `messages` | AFTER INSERT | `update_conversation_timestamp()` | Update conversation |

### 45.9 Wallet & Transactions Triggers

| Trigger | Table | Event | Function | Description |
|---------|-------|-------|----------|-------------|
| `trigger_update_user_wallets` | `user_wallets` | BEFORE UPDATE | `update_user_wallets_updated_at()` | Update timestamp |

### 45.10 Widget & Vision Board Triggers

| Trigger | Table | Event | Function | Description |
|---------|-------|-------|----------|-------------|
| `update_widgets_timestamp` | `dashboard_widgets` | BEFORE UPDATE | `update_updated_at_column()` | Update timestamp |
| `update_user_widgets_updated_at` | `user_widgets` | BEFORE UPDATE | `update_updated_at_column()` | Update timestamp |
| `trigger_update_vision_board_widgets_updated_at` | `vision_board_widgets` | BEFORE UPDATE | `update_vision_board_widgets_updated_at()` | Update timestamp |
| `update_widget_progress_updated_at` | `widget_progress` | BEFORE UPDATE | `update_widget_updated_at()` | Update timestamp |

### 45.11 Shopify & Shop Triggers

| Trigger | Table | Event | Function | Description |
|---------|-------|-------|----------|-------------|
| `update_shopify_products_timestamp` | `shopify_products` | BEFORE UPDATE | `update_shopify_products_updated_at()` | Update timestamp |
| `update_courses_updated_at` | `shopify_courses` | BEFORE UPDATE | `update_updated_at()` | Update timestamp |
| `update_crystals_updated_at` | `shopify_crystals` | BEFORE UPDATE | `update_updated_at()` | Update timestamp |
| `update_shopifycollections_updatedat` | `shopifycollections` | BEFORE UPDATE | `update_updatedat_column()` | Update timestamp |
| `update_shopifyorders_updatedat` | `shopifyorders` | BEFORE UPDATE | `update_updatedat_column()` | Update timestamp |
| `update_shopifyproducts_updatedat` | `shopifyproducts` | BEFORE UPDATE | `update_updatedat_column()` | Update timestamp |
| `update_shoppingcarts_updatedat` | `shoppingcarts` | BEFORE UPDATE | `update_updatedat_column()` | Update timestamp |

### 45.12 Admin & Partnership Triggers

| Trigger | Table | Event | Function | Description |
|---------|-------|-------|----------|-------------|
| `trigger_update_partnership_applications` | `partnership_applications` | BEFORE UPDATE | `update_partnership_applications_updated_at()` | Update timestamp |
| `trigger_platform_connections_updated_at` | `platform_connections` | BEFORE UPDATE | `update_platform_connections_updated_at()` | Update timestamp |
| `trigger_update_sponsor_banner_updated_at` | `sponsor_banners` | BEFORE UPDATE | `update_sponsor_banner_updated_at()` | Update timestamp |
| `trigger_content_calendar_updated_at` | `content_calendar` | BEFORE UPDATE | `update_content_calendar_updated_at()` | Update timestamp |

### 45.13 Notification & Settings Triggers

| Trigger | Table | Event | Function | Description |
|---------|-------|-------|----------|-------------|
| `update_notification_settings_updated_at` | `notification_settings` | BEFORE UPDATE | `update_updated_at_column()` | Update timestamp |
| `update_scheduled_notifications_updated_at` | `scheduled_notifications` | BEFORE UPDATE | `update_updated_at_column()` | Update timestamp |
| `update_push_tokens_updated_at` | `user_push_tokens` | BEFORE UPDATE | `update_updated_at_column()` | Update timestamp |
| `trigger_update_user_settings_updated_at` | `user_settings` | BEFORE UPDATE | `update_updated_at_column()` | Update timestamp |

### 45.14 Other System Triggers

| Trigger | Table | Event | Function | Description |
|---------|-------|-------|----------|-------------|
| `backtestconfigs_updated_at_trigger` | `backtestconfigs` | BEFORE UPDATE | `update_backtestconfigs_updated_at()` | Update timestamp |
| `update_bundles_updated_at` | `bundle_offers` | BEFORE UPDATE | `update_updated_at()` | Update timestamp |
| `update_chatbot_conversation_timestamp` | `chatbot_conversations` | BEFORE UPDATE | `update_chatbot_conversation_timestamp()` | Update timestamp |
| `update_chatbot_quota_updated_at` | `chatbot_quota` | BEFORE UPDATE | `update_updated_at_column()` | Update timestamp |
| `trigger_custom_feeds_updated_at` | `custom_feeds` | BEFORE UPDATE | `update_custom_feeds_updated_at()` | Update timestamp |
| `update_favorite_reading_timestamp` | `favorite_readings` | BEFORE UPDATE | `update_favorite_reading_updated_at()` | Update timestamp |
| `update_goals_timestamp` | `manifestation_goals` | BEFORE UPDATE | `update_updated_at_column()` | Update timestamp |
| `update_purchases_updated_at` | `user_purchases` | BEFORE UPDATE | `update_updated_at()` | Update timestamp |
| `update_user_purchases_updated_at` | `user_purchases` | BEFORE UPDATE | `update_updated_at_column()` | Update timestamp |
| `trigger_update_subscription_invoices_updated_at` | `subscription_invoices` | BEFORE UPDATE | `update_updated_at_column()` | Update timestamp |
| `trigger_update_withdrawal_requests` | `withdrawal_requests` | BEFORE UPDATE | `update_withdrawal_requests_updated_at()` | Update timestamp |
| `whale_alerts_updated_at_trigger` | `whale_alerts` | BEFORE UPDATE | `update_whale_alerts_updated_at()` | Update timestamp |
| `whale_wallets_last_updated_trigger` | `whale_wallets` | BEFORE UPDATE | `update_whale_wallets_last_updated()` | Update timestamp |

---

## 46. TABLES NOT YET DOCUMENTED (From Triggers List)

> **NEW TABLES DISCOVERED**: These tables exist in production but need documentation.

| Table | Category | Notes |
|-------|----------|-------|
| `backtestconfigs` | Trading | Backtest configuration |
| `bundle_offers` | Shop | Product bundles |
| `chatbot_conversations` | Chatbot | Chat history |
| `community_events` | Community | Events system |
| `event_rsvps` | Community | Event RSVPs |
| `custom_feeds` | Feed | Custom feed settings |
| `dashboard_widgets` | Dashboard | Dashboard widgets |
| `favorite_readings` | GemMaster | Saved readings |
| `forum_replies` | Forum | Legacy forum replies |
| `forum_reply_likes` | Forum | Reply likes |
| `forum_threads` | Forum | Legacy forum threads |
| `forum_thread_likes` | Forum | Thread likes |
| `manifestation_goals` | VisionBoard | User goals |
| `notification_settings` | Notifications | User notification prefs |
| `paper_trading_accounts` | Trading | Paper trading accounts |
| `paper_trading_holdings` | Trading | Paper trading holdings |
| `paper_trading_stop_orders` | Trading | Paper trading orders |
| `platform_connections` | Admin | Social platform connections |
| `portfolio_holdings` | Portfolio | User holdings (v1) |
| `scheduled_notifications` | Notifications | Scheduled notifications |
| `sponsor_banners` | Admin | Sponsor banner ads |
| `subscription_invoices` | Billing | Subscription invoices |
| `trading_journal` | Trading | Trading journal entries |
| `vision_board_widgets` | VisionBoard | Vision board widgets |
| `whale_alerts` | Trading | Whale alerts |
| `whale_wallets` | Trading | Whale wallet tracking |
| `widget_progress` | VisionBoard | Widget progress tracking |

---

## 47. SHOPIFY TABLES

### 47.1 `shopify_orders` (Order Tracking V3)
```sql
CREATE TABLE shopify_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_order_id TEXT UNIQUE,              -- Shopify's order ID
  order_number TEXT,                          -- Display order number (#1001)

  -- User Info
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,                                 -- Customer email
  customer_email TEXT,                        -- Alias for email (webhook compat)
  phone TEXT,

  -- Pricing
  total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  subtotal_price DECIMAL(12,2),
  total_tax DECIMAL(12,2),
  total_discounts DECIMAL(12,2) DEFAULT 0,
  total_shipping DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'VND',

  -- Status
  financial_status TEXT,                      -- 'pending', 'paid', 'refunded', etc.
  fulfillment_status TEXT,                    -- 'fulfilled', 'partial', 'unfulfilled', etc.
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,

  -- Order details
  line_items JSONB DEFAULT '[]'::jsonb,       -- Array of order items
  shipping_address JSONB,
  billing_address JSONB,
  customer JSONB,

  -- Tracking
  tracking_number TEXT,
  tracking_url TEXT,
  carrier TEXT,

  -- Payment
  payment_gateway_names JSONB,
  paid_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,

  -- Notes
  note TEXT,
  tags TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_shopify_orders_user_id ON shopify_orders(user_id);
CREATE INDEX idx_shopify_orders_email ON shopify_orders(email);
CREATE INDEX idx_shopify_orders_order_number ON shopify_orders(order_number);
CREATE INDEX idx_shopify_orders_financial_status ON shopify_orders(financial_status);
CREATE INDEX idx_shopify_orders_created_at ON shopify_orders(created_at DESC);

-- RLS Policies
ALTER TABLE shopify_orders ENABLE ROW LEVEL SECURITY;

-- Users can view orders by user_id, email, or linked_emails
CREATE POLICY "Users view own orders" ON shopify_orders
FOR SELECT USING (
  auth.uid() = user_id
  OR email = (SELECT email FROM profiles WHERE id = auth.uid())
  OR email = ANY(
    SELECT unnest(COALESCE(linked_emails, '{}')) FROM profiles WHERE id = auth.uid()
  )
);

-- Service role full access (for webhooks)
CREATE POLICY "Service role full access" ON shopify_orders
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
```

### 47.2 `profiles.linked_emails` (Order Linking Support)
```sql
-- Add to profiles table for order linking
ALTER TABLE profiles ADD COLUMN linked_emails TEXT[] DEFAULT '{}';

-- Usage: Link multiple emails to view orders from different addresses
-- Example: ['old@email.com', 'work@email.com']
```

### Order Status Values:
| financial_status | Vietnamese | Color |
|------------------|------------|-------|
| `pending` | Chờ thanh toán | #F59E0B |
| `paid` | Đã thanh toán | #3B82F6 |
| `refunded` | Đã hoàn tiền | #EF4444 |

| fulfillment_status | Vietnamese | Color |
|--------------------|------------|-------|
| `unfulfilled` | Đang xử lý | #888888 |
| `fulfilled` | Đã giao hàng | #10B981 |
| `partial` | Giao một phần | #F59E0B |

---

## 49. AI MASTER SYSTEM TABLES (AI Su Phu - Migration 2025-12-15)

### 49.1 `ai_master_interactions`
Stores all AI-user interactions for the AI Su Phu trading mentor.

```sql
CREATE TABLE ai_master_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scenario_type VARCHAR(50) NOT NULL,  -- 'fomo_warning', 'revenge_trade_block', etc.
  trade_id UUID,                        -- Related paper trade
  trigger_conditions JSONB DEFAULT '{}', -- { "rsi": 75, "priceChange1h": 6.5 }
  ai_message TEXT NOT NULL,
  ai_mood VARCHAR(20) DEFAULT 'calm',   -- 'calm', 'warning', 'angry', 'proud', 'silent'
  user_action VARCHAR(50),              -- 'accepted', 'dismissed', 'ignored'
  user_action_at TIMESTAMPTZ,
  karma_change INT DEFAULT 0,
  karma_reason VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 49.2 `ai_master_config`
AI scenario configurations with message templates.

```sql
CREATE TABLE ai_master_config (
  id VARCHAR(50) PRIMARY KEY,
  scenario_category VARCHAR(30) NOT NULL, -- 'fomo', 'revenge', 'discipline', 'greed', 'praise'
  message_template TEXT NOT NULL,
  mood VARCHAR(20) DEFAULT 'warning',
  karma_impact INT DEFAULT 0,
  block_trade BOOLEAN DEFAULT false,
  block_duration_minutes INT DEFAULT 0,
  require_unlock BOOLEAN DEFAULT false,
  cooldown_minutes INT DEFAULT 0,
  priority INT DEFAULT 10,
  is_active BOOLEAN DEFAULT true
);
```

**Default Scenarios**:
- `fomo_buy_overbought`: RSI > 70 warning
- `revenge_trade_block`: 3+ losses in a row
- `no_stoploss`: Trade without stop loss
- `sl_moved_wider`: Stop loss moved further away
- `discipline_win`: +25 karma for disciplined win
- `discipline_loss`: +10 karma for disciplined loss
- `account_frozen`: Karma = 0

### 49.3 `user_trade_blocks`
Tracks when users are blocked from trading.

```sql
CREATE TABLE user_trade_blocks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  block_reason VARCHAR(50) NOT NULL,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  unlock_method VARCHAR(50),  -- 'meditation', 'journal', 'rest', 'wait'
  unlocked_at TIMESTAMPTZ,
  unlocked_by UUID REFERENCES profiles(id),
  interaction_id UUID REFERENCES ai_master_interactions(id),
  is_active BOOLEAN DEFAULT true
);
-- Note: UNIQUE constraint on (user_id) WHERE is_active = true
```

### AI Master RPC Functions
```javascript
// Check if user is blocked from trading
const { data } = await supabase.rpc('is_user_trade_blocked', { p_user_id: userId });
// Returns: { blocked: bool, reason, blocked_until, require_unlock }

// Block user trading
const { data } = await supabase.rpc('block_user_trading', {
  p_user_id: userId,
  p_reason: 'revenge_trade',
  p_duration_minutes: 60,
  p_interaction_id: interactionId
});

// Unlock user trading
const { data } = await supabase.rpc('unlock_user_trading', {
  p_user_id: userId,
  p_unlock_method: 'meditation'
});

// Log AI interaction
const { data } = await supabase.rpc('log_ai_interaction', {
  p_user_id: userId,
  p_scenario_type: 'fomo_warning',
  p_ai_message: 'Dung lai...',
  p_ai_mood: 'warning',
  p_karma_change: -5
});

// Get AI config
const { data } = await supabase.rpc('get_ai_config', { p_scenario_id: 'fomo_buy_overbought' });
```

---

## 50. KARMA SYSTEM TABLES (Migration 2025-12-15)

### 50.1 `user_karma`
Main karma tracking per user.

```sql
CREATE TABLE user_karma (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) UNIQUE NOT NULL,
  karma_points INT DEFAULT 200 CHECK (karma_points >= 0 AND karma_points <= 9999),
  karma_level VARCHAR(20) DEFAULT 'student', -- 'novice', 'student', 'warrior', 'master', 'guardian'

  -- Lifetime stats
  total_earned INT DEFAULT 0,
  total_lost INT DEFAULT 0,
  highest_karma INT DEFAULT 200,
  lowest_karma INT DEFAULT 200,

  -- Streaks
  current_discipline_streak INT DEFAULT 0,
  best_discipline_streak INT DEFAULT 0,
  last_discipline_trade_at TIMESTAMPTZ,

  -- Daily tracking
  karma_earned_today INT DEFAULT 0,
  karma_lost_today INT DEFAULT 0,
  trades_today INT DEFAULT 0,
  last_trade_date DATE,

  -- Restrictions
  is_frozen BOOLEAN DEFAULT false,
  frozen_until TIMESTAMPTZ,
  frozen_reason TEXT,
  daily_trade_limit INT,

  -- AI monitoring level
  ai_monitoring VARCHAR(20) DEFAULT 'normal' -- 'strict', 'normal', 'light', 'minimal', 'trusted'
);
```

### 50.2 `karma_history`
All karma changes log.

```sql
CREATE TABLE karma_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  change_amount INT NOT NULL,
  new_total INT NOT NULL,
  previous_total INT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  action_detail TEXT,
  related_trade_id UUID,
  related_ai_interaction_id UUID,
  old_level VARCHAR(20),
  new_level VARCHAR(20),
  level_changed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 50.3 `karma_levels`
Level definitions with benefits and restrictions.

| Level | Range | Daily Trades | AI Monitoring | Benefits |
|-------|-------|--------------|---------------|----------|
| novice | 0-199 | 3 | strict | Basic access |
| student | 200-499 | 10 | normal | 3 signals/day |
| warrior | 500-799 | unlimited | light | Group chat, all signals |
| master | 800-999 | unlimited | minimal | VIP group, secret course |
| guardian | 1000+ | unlimited | trusted | Private mentorship |

### 50.4 `karma_actions`
Karma action configs with point values.

| Action | Category | Points | Daily Limit |
|--------|----------|--------|-------------|
| trade_discipline_win | trading | +25 | - |
| trade_discipline_loss | trading | +10 | - |
| fomo_trade | violation | -30 | - |
| revenge_trade | violation | -50 | - |
| no_stoploss | violation | -10 | - |
| sl_moved_wider | violation | -20 | - |
| lesson_complete | learning | +10 | 5 |
| module_complete | learning | +30 | - |
| meditation | wellness | +5 | 3 |
| journal_entry | wellness | +5 | 3 |
| refer_signup | social | +50 | - |
| inactive_7_days | inactivity | -30 | 1 |

### Karma RPC Functions
```javascript
// Get user karma with full level info
const { data } = await supabase.rpc('get_user_karma_full', { p_user_id: userId });
// Returns: { karma_points, karma_level, level_name_vi, benefits, restrictions, ... }

// Update user karma
const { data } = await supabase.rpc('update_user_karma', {
  p_user_id: userId,
  p_change: 25,
  p_action_type: 'trade_discipline_win',
  p_action_detail: 'Win trade dung ky luat'
});
// Returns: { success, previous_karma, new_karma, old_level, new_level, level_changed }

// Get karma leaderboard
const { data } = await supabase.rpc('get_karma_leaderboard', { p_limit: 20 });

// Update discipline streak
const { data } = await supabase.rpc('update_discipline_streak', {
  p_user_id: userId,
  p_is_disciplined: true
});

// Get karma level from points
const level = get_karma_level(550); // Returns 'warrior'

// Increment trades today
const trades = await supabase.rpc('increment_trades_today', { p_user_id: userId });
```

---

## 51. SHADOW MODE SYSTEM TABLES (Migration 2025-12-15)

Compare paper trades vs real trades from Binance for trading psychology analysis.

### 51.1 `user_exchange_connections`
Store encrypted Binance API keys (READ-ONLY only).

```sql
CREATE TABLE user_exchange_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  exchange VARCHAR(50) NOT NULL DEFAULT 'binance',
  api_key_encrypted TEXT NOT NULL,
  api_secret_encrypted TEXT NOT NULL,
  is_read_only BOOLEAN NOT NULL DEFAULT TRUE, -- MUST be true
  is_verified BOOLEAN DEFAULT FALSE,
  permissions JSONB DEFAULT '[]',
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  sync_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, exchange),
  CONSTRAINT check_read_only CHECK (is_read_only = TRUE)
);
```

### 51.2 `real_trades`
Synced real trades from Binance for comparison.

```sql
CREATE TABLE real_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  connection_id UUID REFERENCES user_exchange_connections(id),
  exchange VARCHAR(50) DEFAULT 'binance',
  exchange_trade_id VARCHAR(100),
  exchange_order_id VARCHAR(100),
  symbol VARCHAR(50) NOT NULL,
  side VARCHAR(10) NOT NULL,
  trade_type VARCHAR(20) DEFAULT 'SPOT',
  entry_price DECIMAL(20, 8) NOT NULL,
  exit_price DECIMAL(20, 8),
  quantity DECIMAL(20, 8) NOT NULL,
  realized_pnl DECIMAL(20, 8),
  trade_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'open',

  UNIQUE(user_id, exchange, exchange_trade_id)
);
```

### 51.3 `shadow_reports`
Weekly/monthly reports comparing paper vs real performance.

```sql
CREATE TABLE shadow_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  report_type VARCHAR(20) DEFAULT 'weekly',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Paper stats
  paper_trades_count INT,
  paper_total_pnl DECIMAL(20, 8),
  paper_win_rate DECIMAL(5, 2),

  -- Real stats
  real_trades_count INT,
  real_total_pnl DECIMAL(20, 8),
  real_win_rate DECIMAL(5, 2),

  -- Gap analysis
  pnl_gap_percent DECIMAL(10, 4),
  win_rate_gap DECIMAL(5, 2),

  -- AI analysis
  ai_analysis TEXT,
  ai_issues JSONB DEFAULT '[]',
  ai_recommendations JSONB DEFAULT '[]',
  ai_severity VARCHAR(20) DEFAULT 'info',

  -- Karma impact
  karma_adjustment INT DEFAULT 0,
  karma_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 51.4 Shadow Mode RPC Functions

```sql
-- Get exchange connection status
get_exchange_connection(p_user_id UUID, p_exchange VARCHAR) -> JSONB

-- Get comparison stats
get_shadow_comparison_stats(p_user_id UUID, p_start_date DATE, p_end_date DATE) -> JSONB

-- Generate shadow report
generate_shadow_report(p_user_id UUID, p_report_type VARCHAR) -> UUID

-- Get recent shadow reports
get_shadow_reports(p_user_id UUID, p_limit INT) -> JSONB
```

### 51.5 Frontend Services

```javascript
// binanceApiService.js
binanceApiService.addConnection(userId, apiKey, apiSecret) // Connect (READ-ONLY)
binanceApiService.removeConnection(userId) // Disconnect
binanceApiService.syncTrades(userId, { days: 30 }) // Sync trades
binanceApiService.getAccountBalance(userId) // Read balance

// shadowModeService.js
shadowModeService.isEnabled(userId) // Check if connected
shadowModeService.getComparisonStats(userId) // Get paper vs real stats
shadowModeService.generateReport(userId, 'weekly') // Create report
shadowModeService.getReports(userId) // Get report list
```

---

## 53. GEMRAL AI BRAIN - Knowledge Base & RAG System

> **GEMRAL AI BRAIN Phase 1-2**: Vector-based knowledge base with RAG (Retrieval Augmented Generation) for GEM Master chatbot.

### 53.1 `ai_knowledge_documents`
```sql
-- Stores source documents (Markdown files, JSON data, etc.)
CREATE TABLE ai_knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('spiritual', 'trading', 'product', 'faq', 'course')),
  category TEXT,
  content TEXT NOT NULL,
  content_hash TEXT UNIQUE NOT NULL,  -- For deduplication
  metadata JSONB DEFAULT '{}',
  token_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 53.2 `ai_knowledge_chunks`
```sql
-- Stores chunked text with vector embeddings for similarity search
-- Requires pgvector extension: CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE ai_knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES ai_knowledge_documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(1536),  -- OpenAI text-embedding-3-small dimension
  token_count INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  retrieval_count INT DEFAULT 0,
  avg_relevance_score FLOAT DEFAULT 0,
  last_retrieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

-- Critical index for vector similarity search
CREATE INDEX idx_ai_knowledge_chunks_embedding
ON ai_knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### 53.3 `ai_knowledge_gaps`
```sql
-- Tracks unanswered questions for knowledge base improvement
CREATE TABLE ai_knowledge_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  query_hash TEXT UNIQUE NOT NULL,
  occurrence_count INT DEFAULT 1,
  last_occurred_at TIMESTAMPTZ DEFAULT NOW(),
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by_document_id UUID REFERENCES ai_knowledge_documents(id),
  resolved_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 53.4 Knowledge Search Function
```sql
-- Main vector similarity search function
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_source_type TEXT DEFAULT NULL,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_text TEXT,
  similarity FLOAT,
  source_type TEXT,
  category TEXT,
  title TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.document_id,
    c.chunk_text,
    1 - (c.embedding <=> query_embedding) AS similarity,
    d.source_type,
    d.category,
    d.title
  FROM ai_knowledge_chunks c
  JOIN ai_knowledge_documents d ON c.document_id = d.id
  WHERE d.is_active = TRUE
    AND (filter_source_type IS NULL OR d.source_type = filter_source_type)
    AND (filter_category IS NULL OR d.category = filter_category)
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
```

---

## 54. GEMRAL AI BRAIN - Trading Intelligence

> **GEMRAL AI BRAIN Phase 3**: Pattern detection, learning data, and trading intelligence tables.

### 54.1 `ai_pattern_definitions`
```sql
-- 24 trading patterns with tier access control
CREATE TABLE ai_pattern_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_code TEXT UNIQUE NOT NULL,  -- 'DPD', 'UPU', 'HEAD_SHOULDERS', etc.
  pattern_name TEXT NOT NULL,
  pattern_name_vi TEXT,  -- Vietnamese name
  description TEXT,
  tier_required TEXT DEFAULT 'FREE' CHECK (tier_required IN ('FREE', 'TIER1', 'TIER2', 'TIER3')),
  base_win_rate DECIMAL(5,2) DEFAULT 50.00,
  current_win_rate DECIMAL(5,2) DEFAULT 50.00,
  total_detections INT DEFAULT 0,
  successful_trades INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  detection_logic JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24 seeded patterns (example):
-- FREE: DPD, UPU, HEAD_SHOULDERS (3)
-- TIER1: UPD, DPU, INV_HEAD_SHOULDERS, DOUBLE_TOP/BOTTOM (7)
-- TIER2: HFZ, LFZ, WEDGES, FLAGS, TRIANGLES (15)
-- TIER3: All 24 patterns including advanced confluences
```

### 54.2 `ai_pattern_detections`
```sql
-- Records each pattern detection for learning
CREATE TABLE ai_pattern_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID REFERENCES ai_pattern_definitions(id),
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  entry_price DECIMAL(20,8),
  stop_loss DECIMAL(20,8),
  take_profit DECIMAL(20,8),
  r_multiple DECIMAL(5,2),
  confidence_score DECIMAL(5,2),
  quality_grade TEXT CHECK (quality_grade IN ('A', 'B', 'C', 'D', 'F')),

  -- Zone Retest tracking (KEY for win rate improvement)
  has_zone_retest BOOLEAN DEFAULT FALSE,
  retest_quality DECIMAL(5,2),

  -- Outcome
  outcome TEXT CHECK (outcome IN ('win', 'loss', 'breakeven', 'pending', 'expired')),
  outcome_at TIMESTAMPTZ,
  actual_r_multiple DECIMAL(5,2),

  -- Features (from feature_extractor.py)
  features JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 54.3 `ai_daily_pattern_metrics`
```sql
-- Daily aggregated metrics for performance tracking
CREATE TABLE ai_daily_pattern_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  pattern_id UUID REFERENCES ai_pattern_definitions(id),
  total_detections INT DEFAULT 0,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  win_rate DECIMAL(5,2),
  avg_r_multiple DECIMAL(5,2),

  -- Zone retest impact
  detections_with_retest INT DEFAULT 0,
  wins_with_retest INT DEFAULT 0,
  win_rate_with_retest DECIMAL(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(metric_date, pattern_id)
);
```

---

## 55. GEMRAL AI BRAIN - Pattern AI Features

> **GEMRAL AI BRAIN Phase 6**: Feature extraction and pattern quality scoring.

### 55.1 `pattern_features`
```sql
-- Extracted features for ML model training
CREATE TABLE pattern_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_id UUID REFERENCES ai_pattern_detections(id) ON DELETE CASCADE,

  -- Technical indicators
  ema_20 DECIMAL(20,8),
  ema_50 DECIMAL(20,8),
  ema_200 DECIMAL(20,8),
  rsi_14 DECIMAL(5,2),
  atr_14 DECIMAL(20,8),
  macd_line DECIMAL(20,8),
  macd_signal DECIMAL(20,8),
  macd_histogram DECIMAL(20,8),

  -- Volume analysis
  volume_ratio DECIMAL(5,2),
  volume_trend TEXT,

  -- Zone Retest (KEY FEATURE)
  has_zone_retest BOOLEAN DEFAULT FALSE,
  retest_candle_count INT,
  retest_depth_percent DECIMAL(5,2),
  retest_rejection_strength DECIMAL(5,2),

  -- Support/Resistance
  distance_to_support_pct DECIMAL(5,2),
  distance_to_resistance_pct DECIMAL(5,2),
  sr_confluence_count INT,

  -- Trend context
  trend_direction TEXT,
  trend_strength DECIMAL(5,2),

  -- Quality scoring
  quality_grade TEXT,
  quality_score DECIMAL(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 55.2 `ai_pattern_filters`
```sql
-- Dynamic filters for improving win rate
CREATE TABLE ai_pattern_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filter_name TEXT NOT NULL,
  filter_type TEXT NOT NULL,  -- 'volume', 'trend', 'zone_retest', 'quality'
  filter_condition JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 50,

  -- Performance metrics
  patterns_filtered INT DEFAULT 0,
  improvement_rate DECIMAL(5,2),
  last_evaluated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default filter: Zone Retest Required
-- { "has_zone_retest": true, "retest_depth_percent": { "min": 0.5 } }
```

---

## 56. GEMRAL AI BRAIN - Backtesting Engine

> **GEMRAL AI BRAIN Phase 7**: Historical data and backtesting system.

### 56.1 `ai_historical_candles`
```sql
-- Cached candle data from Binance
CREATE TABLE ai_historical_candles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  exchange TEXT DEFAULT 'binance',
  open_time TIMESTAMPTZ NOT NULL,
  open DECIMAL(20,8) NOT NULL,
  high DECIMAL(20,8) NOT NULL,
  low DECIMAL(20,8) NOT NULL,
  close DECIMAL(20,8) NOT NULL,
  volume DECIMAL(30,8) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(symbol, timeframe, exchange, open_time)
);

CREATE INDEX idx_ai_candles_lookup ON ai_historical_candles(symbol, timeframe, open_time);
```

### 56.2 `ai_backtest_runs`
```sql
-- Backtest configurations and metadata
CREATE TABLE ai_backtest_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,

  -- Configuration
  symbols TEXT[] NOT NULL,
  timeframes TEXT[] NOT NULL,
  patterns TEXT[],
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Parameters
  initial_capital DECIMAL(20,2) DEFAULT 10000,
  risk_per_trade DECIMAL(5,2) DEFAULT 1.0,
  require_zone_retest BOOLEAN DEFAULT TRUE,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 56.3 `ai_backtest_trades`
```sql
-- Individual trades from backtest
CREATE TABLE ai_backtest_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES ai_backtest_runs(id) ON DELETE CASCADE,
  trade_number INT NOT NULL,

  -- Entry
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  pattern_code TEXT NOT NULL,
  entry_time TIMESTAMPTZ NOT NULL,
  entry_price DECIMAL(20,8) NOT NULL,

  -- Exit
  exit_time TIMESTAMPTZ,
  exit_price DECIMAL(20,8),
  exit_reason TEXT,

  -- Position
  side TEXT NOT NULL CHECK (side IN ('long', 'short')),
  position_size DECIMAL(20,8),
  stop_loss DECIMAL(20,8),
  take_profit DECIMAL(20,8),

  -- Zone Retest
  had_zone_retest BOOLEAN DEFAULT FALSE,

  -- Result
  pnl DECIMAL(20,8),
  pnl_percent DECIMAL(10,4),
  r_multiple DECIMAL(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 56.4 `ai_backtest_summaries`
```sql
-- Backtest result summaries
CREATE TABLE ai_backtest_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES ai_backtest_runs(id) ON DELETE CASCADE,

  -- Trade stats
  total_trades INT DEFAULT 0,
  winning_trades INT DEFAULT 0,
  losing_trades INT DEFAULT 0,
  win_rate DECIMAL(5,2),

  -- Zone Retest impact
  trades_with_retest INT DEFAULT 0,
  wins_with_retest INT DEFAULT 0,
  win_rate_with_retest DECIMAL(5,2),
  win_rate_without_retest DECIMAL(5,2),

  -- PnL
  total_pnl DECIMAL(20,8),
  total_pnl_percent DECIMAL(10,4),
  avg_win DECIMAL(20,8),
  avg_loss DECIMAL(20,8),
  largest_win DECIMAL(20,8),
  largest_loss DECIMAL(20,8),

  -- Risk metrics
  profit_factor DECIMAL(5,2),
  sharpe_ratio DECIMAL(5,2),
  max_drawdown DECIMAL(10,4),
  avg_r_multiple DECIMAL(5,2),

  -- Equity curve
  equity_curve JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 57. GEMRAL AI BRAIN - Auto-Optimization

> **GEMRAL AI BRAIN Phase 8**: Daily optimization job and filter tuning.

### 57.1 `ai_parameter_optimization_results`
```sql
-- Results from parameter optimization runs
CREATE TABLE ai_parameter_optimization_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  optimization_date DATE NOT NULL,
  parameter_name TEXT NOT NULL,
  optimal_value JSONB NOT NULL,
  improvement_percent DECIMAL(5,2),
  sample_size INT,
  confidence DECIMAL(5,2),
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 57.2 `ai_filter_evaluation_log`
```sql
-- Log of filter performance evaluations
CREATE TABLE ai_filter_evaluation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filter_id UUID REFERENCES ai_pattern_filters(id),
  evaluation_date DATE NOT NULL,

  -- Before filter
  total_patterns INT,
  wins_before INT,
  win_rate_before DECIMAL(5,2),

  -- After filter
  patterns_after_filter INT,
  wins_after INT,
  win_rate_after DECIMAL(5,2),

  -- Impact
  improvement_rate DECIMAL(5,2),
  patterns_filtered_out INT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 57.3 Daily Optimization RPC
```sql
-- Get zone retest impact for analysis
CREATE OR REPLACE FUNCTION get_zone_retest_impact(
  p_pattern_code TEXT DEFAULT NULL,
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  pattern_code TEXT,
  total_detections BIGINT,
  with_retest BIGINT,
  without_retest BIGINT,
  win_rate_with_retest DECIMAL,
  win_rate_without_retest DECIMAL,
  improvement DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pd.pattern_code,
    COUNT(*) AS total_detections,
    COUNT(*) FILTER (WHERE d.has_zone_retest = TRUE) AS with_retest,
    COUNT(*) FILTER (WHERE d.has_zone_retest = FALSE) AS without_retest,
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE d.has_zone_retest = TRUE AND d.outcome = 'win') /
      NULLIF(COUNT(*) FILTER (WHERE d.has_zone_retest = TRUE AND d.outcome IN ('win', 'loss')), 0),
      2
    ) AS win_rate_with_retest,
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE d.has_zone_retest = FALSE AND d.outcome = 'win') /
      NULLIF(COUNT(*) FILTER (WHERE d.has_zone_retest = FALSE AND d.outcome IN ('win', 'loss')), 0),
      2
    ) AS win_rate_without_retest,
    ROUND(
      (100.0 * COUNT(*) FILTER (WHERE d.has_zone_retest = TRUE AND d.outcome = 'win') /
       NULLIF(COUNT(*) FILTER (WHERE d.has_zone_retest = TRUE AND d.outcome IN ('win', 'loss')), 0)) -
      (100.0 * COUNT(*) FILTER (WHERE d.has_zone_retest = FALSE AND d.outcome = 'win') /
       NULLIF(COUNT(*) FILTER (WHERE d.has_zone_retest = FALSE AND d.outcome IN ('win', 'loss')), 0)),
      2
    ) AS improvement
  FROM ai_pattern_detections d
  JOIN ai_pattern_definitions pd ON d.pattern_id = pd.id
  WHERE d.detected_at > NOW() - (p_days || ' days')::INTERVAL
    AND (p_pattern_code IS NULL OR pd.pattern_code = p_pattern_code)
  GROUP BY pd.pattern_code
  ORDER BY improvement DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;
```

---

## 59. GEMRAL AI BRAIN - User Behavior Intelligence

> **GEMRAL AI BRAIN Phase 3**: User event tracking and behavior analysis.

### 59.1 `ai_user_events`
```sql
-- Tracks all user interactions for behavior analysis
CREATE TABLE ai_user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL,  -- 'screen_view', 'button_click', 'feature_use', 'search', 'purchase'
  event_name TEXT NOT NULL,
  event_category TEXT,       -- 'scanner', 'chatbot', 'forum', 'shop', 'courses'

  -- Context
  screen_name TEXT,
  component_name TEXT,
  event_data JSONB DEFAULT '{}',

  -- Session tracking
  session_id TEXT,
  device_type TEXT,          -- 'ios', 'android', 'web'
  app_version TEXT,

  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 59.2 `ai_user_profiles`
```sql
-- AI-computed behavior profiles
CREATE TABLE ai_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),

  -- Engagement metrics
  total_sessions INT DEFAULT 0,
  total_events INT DEFAULT 0,
  engagement_score INT DEFAULT 0,       -- 0-100
  last_active_at TIMESTAMPTZ,

  -- Feature usage (percentage)
  scanner_usage_pct DECIMAL(5,2) DEFAULT 0,
  chatbot_usage_pct DECIMAL(5,2) DEFAULT 0,
  forum_usage_pct DECIMAL(5,2) DEFAULT 0,
  shop_usage_pct DECIMAL(5,2) DEFAULT 0,
  courses_usage_pct DECIMAL(5,2) DEFAULT 0,

  -- Computed segments
  user_segment TEXT,    -- 'new', 'active', 'power_user', 'at_risk', 'churned'
  persona TEXT,         -- 'trader', 'spiritual_seeker', 'learner', 'shopper'
  churn_risk TEXT DEFAULT 'low',

  -- Preferences
  preferred_patterns TEXT[],
  spiritual_interests TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 59.3 User Intelligence RPC Functions
```sql
-- Track user event
track_user_event(p_user_id, p_event_type, p_event_name, p_event_category, ...)

-- Get user behavior profile
get_user_behavior_profile(p_user_id) -> JSONB

-- Calculate engagement score (0-100)
calculate_engagement_score(p_user_id) -> INT

-- Batch track events (for offline queue)
batch_track_events(p_events JSONB) -> INT
```

---

## 60. GEMRAL AI BRAIN - Error Tracking

> **GEMRAL AI BRAIN Phase 4**: Bug detection and error pattern analysis.

### 60.1 `ai_error_logs`
```sql
-- Individual error occurrences
CREATE TABLE ai_error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),

  -- Error identification
  error_hash TEXT NOT NULL,
  error_type TEXT NOT NULL,    -- 'js_error', 'api_error', 'network_error', 'render_error'
  error_message TEXT NOT NULL,
  error_name TEXT,
  error_stack TEXT,

  -- Context
  screen_name TEXT,
  component_name TEXT,
  action_name TEXT,
  metadata JSONB DEFAULT '{}',

  -- Device info
  device_type TEXT,
  app_version TEXT,
  severity TEXT DEFAULT 'error',
  is_handled BOOLEAN DEFAULT FALSE,

  occurred_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 60.2 `ai_error_patterns`
```sql
-- Grouped error patterns for analysis
CREATE TABLE ai_error_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_hash TEXT UNIQUE NOT NULL,
  error_type TEXT NOT NULL,
  error_message_template TEXT,

  -- Stats
  occurrence_count INT DEFAULT 1,
  affected_users_count INT DEFAULT 1,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),

  -- Status
  status TEXT DEFAULT 'new',      -- 'new', 'investigating', 'identified', 'fixing', 'fixed'
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  priority INT DEFAULT 50,

  -- Resolution
  root_cause TEXT,
  fix_description TEXT,
  fixed_at TIMESTAMPTZ,

  -- AI Analysis
  ai_analysis JSONB,
  suggested_fix TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 60.3 Error Tracking RPC Functions
```sql
-- Generate error hash for grouping
generate_error_hash(p_error_type, p_error_name, p_error_message, ...) -> TEXT

-- Report error
report_error(p_user_id, p_error_type, p_error_message, ...) -> UUID

-- Get error dashboard stats
get_error_dashboard(p_days INT) -> JSONB

-- Get error pattern details
get_error_pattern_details(p_error_hash) -> JSONB
```

---

## 61. GEMRAL AI BRAIN - Feedback & Continuous Learning

> **GEMRAL AI BRAIN Phase 5**: User feedback collection and learning system.

### 61.1 `ai_response_feedback`
```sql
-- User feedback (thumbs up/down) on AI responses
CREATE TABLE ai_response_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),

  -- Context
  feature TEXT NOT NULL,         -- 'chatbot', 'scanner', 'tarot', 'iching'
  session_id TEXT,
  query TEXT NOT NULL,
  response TEXT NOT NULL,

  -- Feedback
  rating TEXT NOT NULL CHECK (rating IN ('positive', 'negative')),
  feedback_type TEXT,            -- 'incorrect', 'unhelpful', 'offensive', 'other'
  feedback_text TEXT,

  -- RAG context
  rag_used BOOLEAN DEFAULT FALSE,
  sources_used TEXT[],
  sources_helpful BOOLEAN,

  -- Status
  status TEXT DEFAULT 'new',     -- 'new', 'reviewed', 'actioned', 'dismissed'
  reviewed_by UUID,
  action_taken TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 61.2 `ai_learning_updates`
```sql
-- Changes made based on feedback
CREATE TABLE ai_learning_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES ai_response_feedback(id),

  -- Update details
  update_type TEXT NOT NULL,     -- 'knowledge_added', 'prompt_updated', 'filter_added'
  feature TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Before/After tracking
  before_state JSONB,
  after_state JSONB,

  -- Validation
  validation_status TEXT DEFAULT 'pending',

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 61.3 `ai_feedback_daily_stats`
```sql
-- Daily feedback statistics
CREATE TABLE ai_feedback_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL,
  feature TEXT NOT NULL,

  total_feedback INT DEFAULT 0,
  positive_count INT DEFAULT 0,
  negative_count INT DEFAULT 0,
  satisfaction_rate DECIMAL(5,2),

  rag_used_count INT DEFAULT 0,
  rag_helpful_count INT DEFAULT 0,

  UNIQUE(stat_date, feature)
);
```

### 61.4 Feedback RPC Functions
```sql
-- Submit feedback
submit_ai_feedback(p_user_id, p_feature, p_query, p_response, p_rating, ...) -> UUID

-- Get feedback stats
get_feedback_stats(p_feature, p_days) -> JSONB

-- Get negative feedback for review
get_negative_feedback_for_review(p_feature, p_limit) -> JSONB

-- Review feedback
review_feedback(p_feedback_id, p_reviewer_id, p_action_taken, p_status) -> BOOLEAN

-- Record learning update
record_learning_update(p_feedback_id, p_update_type, p_feature, p_description, ...) -> UUID
```

---

## 62. PAPER TRADES TABLE (Dual Mode - Migration 2025-12-18)

Paper trading system for simulated trades with GEM Pattern and Custom Mode support.

### 62.1 `paper_trades`

```sql
CREATE TABLE paper_trades (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User Reference
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Trade Info
  symbol VARCHAR(50) NOT NULL,             -- 'BTCUSDT', 'ETHUSDT'
  direction VARCHAR(10) NOT NULL,          -- 'LONG', 'SHORT'
  pattern_type VARCHAR(100),               -- 'Head & Shoulders', 'Double Bottom'
  timeframe VARCHAR(20),                   -- '15m', '1h', '4h', '1d'

  -- Entry/Exit Prices (Actual used in trade)
  entry_price DECIMAL(20, 8) NOT NULL,
  stop_loss DECIMAL(20, 8),
  take_profit DECIMAL(20, 8),
  exit_price DECIMAL(20, 8),

  -- Position Details
  position_size DECIMAL(20, 8) NOT NULL,   -- Margin amount (USDT)
  leverage INT DEFAULT 1,                   -- Leverage multiplier
  position_value DECIMAL(20, 8),            -- position_size * leverage
  quantity DECIMAL(20, 8),                  -- Coin quantity

  -- P&L
  pnl DECIMAL(20, 8) DEFAULT 0,
  pnl_percent DECIMAL(10, 4) DEFAULT 0,
  roe_percent DECIMAL(10, 4) DEFAULT 0,    -- Return on Equity

  -- Status
  status VARCHAR(20) DEFAULT 'open',        -- 'open', 'closed', 'stopped', 'target_hit'
  exit_reason VARCHAR(50),                  -- 'manual', 'stop_loss', 'take_profit', 'liquidated'

  -- Timestamps
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- ═══════════════════════════════════════════════════════════════
  -- DUAL MODE COLUMNS (Migration 2025-12-18)
  -- ═══════════════════════════════════════════════════════════════

  -- Trade Mode
  trade_mode VARCHAR(20) DEFAULT 'pattern',  -- 'pattern' | 'custom'

  -- Original Pattern Values (for comparison in Custom Mode)
  pattern_entry DECIMAL(20, 8),             -- Original pattern entry price
  pattern_sl DECIMAL(20, 8),                -- Original pattern stop loss
  pattern_tp DECIMAL(20, 8),                -- Original pattern take profit

  -- Deviation Tracking (Custom Mode)
  entry_deviation_percent DECIMAL(10, 4) DEFAULT 0,  -- % deviation from pattern entry
  sl_deviation_percent DECIMAL(10, 4) DEFAULT 0,     -- % deviation from pattern SL
  tp_deviation_percent DECIMAL(10, 4) DEFAULT 0,     -- % deviation from pattern TP

  -- AI Assessment (Custom Mode)
  ai_score INTEGER DEFAULT 0,               -- AI score 0-100
  ai_feedback JSONB                         -- { warnings: [], successes: [], recommendations: [] }
);

-- Indexes
CREATE INDEX idx_paper_trades_user ON paper_trades(user_id);
CREATE INDEX idx_paper_trades_status ON paper_trades(status);
CREATE INDEX idx_paper_trades_symbol ON paper_trades(symbol);
CREATE INDEX idx_paper_trades_mode ON paper_trades(trade_mode);
CREATE INDEX idx_paper_trades_user_mode_date ON paper_trades(user_id, trade_mode, created_at);
```

### 62.2 Trade Mode Values

| Mode | Description | Entry/SL/TP |
|------|-------------|-------------|
| `pattern` | GEM Pattern Mode (Default) | Locked từ pattern scan |
| `custom` | Custom Mode | User tự chỉnh |

### 62.3 Daily Limits (Custom Mode)

| User Type | Pattern Mode | Custom Mode |
|-----------|--------------|-------------|
| FREE + Novice Karma | Unlimited | 3/ngày |
| FREE + Student Karma | Unlimited | 10/ngày |
| TIER1/TIER2/TIER3 (Paid) | Unlimited | Unlimited |

### 62.4 AI Feedback Structure (Custom Mode)

```json
{
  "score": 85,
  "blocked": false,
  "blockReason": null,
  "warnings": [
    "Entry lệch 2.5% so với pattern",
    "Đòn bẩy 50x cao"
  ],
  "successes": [
    "Có Stop Loss đầy đủ",
    "Tỷ lệ R:R 1.5 - Tốt"
  ],
  "recommendations": [
    "Cân nhắc entry gần pattern hơn",
    "Khuyến nghị leverage ≤ 20x"
  ],
  "rrRatio": 1.5,
  "deviations": {
    "entry": 2.5,
    "sl": -1.2,
    "tp": 3.1
  }
}
```

### 62.5 AI Score Calculation

| Condition | Score Impact |
|-----------|--------------|
| No Stop Loss | BLOCKED (score = 0) |
| R:R < 1:1 | -20 points |
| Entry deviation > 2% | -15 points |
| SL wider than pattern | -15 points |
| TP further than pattern | -10 points |
| Leverage > 50x | -20 points |
| Leverage > 20x | -10 points |

---

## 63. LINK PREVIEWS SYSTEM (2025-12-28)

### 63.1 `link_previews` (URL Metadata Cache)

> Server-side cache for Open Graph metadata extracted from URLs.

```sql
CREATE TABLE IF NOT EXISTS public.link_previews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- URL information
  url TEXT NOT NULL,                           -- Normalized URL (canonical)
  original_url TEXT,                           -- Original URL before normalization
  domain TEXT NOT NULL,                        -- Extracted domain (e.g., 'youtube.com')

  -- Open Graph metadata
  title TEXT,
  description TEXT,
  image_url TEXT,
  image_width INTEGER,
  image_height INTEGER,

  -- Site information
  site_name TEXT,
  favicon_url TEXT,
  locale TEXT DEFAULT 'vi_VN',

  -- Content type
  og_type TEXT DEFAULT 'website',              -- 'website', 'article', 'video', 'file'
  content_type TEXT,                           -- HTTP Content-Type header

  -- Video support (YouTube, Vimeo, etc.)
  video_url TEXT,
  video_secure_url TEXT,
  video_type TEXT,
  video_width INTEGER,
  video_height INTEGER,
  is_video BOOLEAN DEFAULT FALSE,

  -- Twitter Cards metadata
  twitter_card TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,

  -- Status & error handling
  status TEXT DEFAULT 'success',               -- 'success', 'error', 'timeout', 'no_og', 'blocked'
  error_message TEXT,

  -- Cache management
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  fetch_count INTEGER DEFAULT 1,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT link_previews_unique_url UNIQUE(url)
);

-- Indexes
CREATE INDEX idx_link_previews_url ON public.link_previews(url);
CREATE INDEX idx_link_previews_domain ON public.link_previews(domain);
CREATE INDEX idx_link_previews_expires_at ON public.link_previews(expires_at);
CREATE INDEX idx_link_previews_status ON public.link_previews(status);
CREATE INDEX idx_link_previews_created_at ON public.link_previews(created_at DESC);
CREATE INDEX idx_link_previews_last_accessed ON public.link_previews(last_accessed_at);
```

### 63.2 `forum_posts` Link Preview Columns

```sql
-- Add to forum_posts table
ALTER TABLE public.forum_posts
ADD COLUMN IF NOT EXISTS link_preview JSONB;

ALTER TABLE public.forum_posts
ADD COLUMN IF NOT EXISTS extracted_urls TEXT[];

-- Indexes
CREATE INDEX idx_forum_posts_link_preview ON public.forum_posts USING GIN (link_preview);
CREATE INDEX idx_forum_posts_extracted_urls ON public.forum_posts USING GIN (extracted_urls);
```

### 63.3 Link Preview RLS Policies

```sql
-- Enable RLS
ALTER TABLE public.link_previews ENABLE ROW LEVEL SECURITY;

-- Anyone can view (public cache)
CREATE POLICY "Anyone can view link previews"
  ON public.link_previews FOR SELECT USING (true);

-- Only service role can write
CREATE POLICY "Service role can insert link previews"
  ON public.link_previews FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update link previews"
  ON public.link_previews FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete link previews"
  ON public.link_previews FOR DELETE USING (auth.role() = 'service_role');
```

### 63.4 Link Preview Status Values

| Status | Description |
|--------|-------------|
| `success` | OG tags extracted successfully |
| `no_og` | No OG tags found, used fallbacks |
| `error` | HTTP error or network failure |
| `timeout` | Request timeout (>8s) |
| `blocked` | Domain in blocklist |

### 63.5 Helper Functions

```sql
-- Get cached preview
CREATE OR REPLACE FUNCTION get_cached_link_preview(p_url TEXT)
RETURNS TABLE (
  id UUID, url TEXT, domain TEXT, title TEXT, description TEXT,
  image_url TEXT, site_name TEXT, favicon_url TEXT, og_type TEXT,
  is_video BOOLEAN, status TEXT, cached BOOLEAN, expires_at TIMESTAMPTZ
);

-- Upsert link preview
CREATE OR REPLACE FUNCTION upsert_link_preview(
  p_url TEXT, p_domain TEXT, p_title TEXT, p_description TEXT,
  p_image_url TEXT, p_site_name TEXT, p_favicon_url TEXT,
  p_og_type TEXT, p_is_video BOOLEAN, p_video_url TEXT,
  p_twitter_card TEXT, p_twitter_image TEXT, p_status TEXT,
  p_error_message TEXT, p_content_type TEXT
) RETURNS UUID;

-- Cleanup expired previews
CREATE OR REPLACE FUNCTION cleanup_expired_link_previews() RETURNS INTEGER;

-- Auto-extract URLs from post content (trigger)
CREATE OR REPLACE FUNCTION auto_extract_post_urls() RETURNS TRIGGER;
```

### 63.6 Edge Function: `fetch-link-preview`

**Endpoint**: `POST /functions/v1/fetch-link-preview`

**Request**:
```json
{
  "url": "https://example.com/article",
  "force_refresh": false
}
```

**Response**:
```json
{
  "url": "https://example.com/article",
  "domain": "example.com",
  "title": "Article Title",
  "description": "Article description...",
  "image_url": "https://example.com/og-image.jpg",
  "site_name": "Example Site",
  "favicon_url": "https://example.com/favicon.ico",
  "og_type": "article",
  "is_video": false,
  "status": "success",
  "cached": true
}
```

### 63.7 Data Flow

```
Client Request (URL)
       │
       ▼
┌─────────────────┐
│  Edge Function  │
│  fetch-link-    │
│  preview        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     HIT     ┌─────────────────┐
│ Check Cache     │────────────►│ Return cached   │
│ (link_previews) │             │ + update access │
└────────┬────────┘             └─────────────────┘
         │ MISS
         ▼
┌─────────────────┐
│ Fetch URL       │
│ (8s timeout)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Parse HTML      │
│ - OG tags       │
│ - Twitter Cards │
│ - Fallbacks     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Upsert to DB    │
│ link_previews   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Return Response │
│ {data, cached}  │
└─────────────────┘
```

---

## 64. UPDATED DATE

**Last Updated**: 2025-12-28

**Changes in this update**:
1. Added Section 49: AI Master System Tables (ai_master_interactions, ai_master_config, user_trade_blocks)
2. Added Section 50: Karma System Tables (user_karma, karma_history, karma_levels, karma_actions)
3. Added Section 51: Shadow Mode System Tables (user_exchange_connections, real_trades, shadow_reports)
4. Added RPC functions for AI, Karma, and Shadow Mode systems
5. 5 karma levels: novice, student, warrior, master, guardian
6. 10+ default AI scenarios with Vietnamese messages
7. Shadow Mode compares paper vs real trades from Binance
8. **NEW**: Section 53-57: GEMRAL AI BRAIN System (Phases 1-2, 6-8)
   - Section 53: Knowledge Base & RAG System (pgvector)
   - Section 54: Trading Intelligence (24 patterns, zone retest tracking)
   - Section 55: Pattern AI Features (feature extraction, quality scoring)
   - Section 56: Backtesting Engine (historical data, trade simulation)
   - Section 57: Auto-Optimization (daily job, filter tuning)
9. **NEW**: Section 59-61: GEMRAL AI BRAIN System (Phases 3-5)
   - Section 59: User Behavior Intelligence (event tracking, profiles)
   - Section 60: Error Tracking (bug detection, patterns)
   - Section 61: Feedback & Continuous Learning (thumbs up/down, improvements)
10. **NEW**: Section 62: Paper Trades Table (Dual Mode - 2025-12-18)
    - trade_mode: 'pattern' | 'custom'
    - pattern_entry, pattern_sl, pattern_tp (original values)
    - Deviation tracking (entry/sl/tp deviation percentages)
    - AI assessment (ai_score, ai_feedback JSONB)
    - Daily limits for Custom Mode (FREE: 3-10/day, Paid: unlimited)
11. **NEW**: Section 63: Link Previews System (2025-12-28)
    - `link_previews` table for server-side URL metadata caching
    - `forum_posts.link_preview` JSONB column for inline preview data
    - `forum_posts.extracted_urls` TEXT[] for detected URLs
    - Updated `fetch-link-preview` edge function with database integration
    - Auto URL extraction trigger for posts
12. **NEW**: Section 65: Zone Visualization System (2026-01-02)
    - `detected_zones` table for zone display on charts
    - `zone_test_history` for tracking zone tests
    - `mtf_alignment_cache` for multi-timeframe alignment
    - `zone_visualization_preferences` for user settings
    - `zone_alerts` for zone-specific notifications
    - Tier-based zone limits (FREE: 1, TIER1: 3, TIER2: 10, TIER3: 20)

---

## 65. ZONE VISUALIZATION SYSTEM (Migration 2026-01-02)

### 65.1 `detected_zones` (Zone Storage & Lifecycle)

Stores all detected trading zones for chart visualization. Multiple zones per symbol/timeframe.
Tracks lifecycle: FRESH → TESTED_1X → TESTED_2X → TESTED_3X_PLUS → BROKEN

```sql
CREATE TABLE detected_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Zone identification
  symbol VARCHAR(20) NOT NULL,           -- 'BTCUSDT'
  timeframe VARCHAR(10) NOT NULL,        -- '4h', '1d'
  zone_type VARCHAR(10) NOT NULL,        -- 'HFZ' or 'LFZ'

  -- Zone boundaries (for drawing rectangles)
  zone_high DECIMAL(20, 8) NOT NULL,     -- Top of zone
  zone_low DECIMAL(20, 8) NOT NULL,      -- Bottom of zone
  entry_price DECIMAL(20, 8) NOT NULL,   -- Entry level
  stop_price DECIMAL(20, 8) NOT NULL,    -- Stop level

  -- Time boundaries
  start_time BIGINT NOT NULL,            -- Unix timestamp (ms)
  end_time BIGINT,                       -- NULL = extend right
  start_candle_index INT,

  -- Pattern that created this zone
  pattern_type VARCHAR(30) NOT NULL,     -- 'DPD', 'UPU', etc.
  pattern_confidence DECIMAL(5, 2),      -- 0-100
  pattern_grade VARCHAR(2),              -- 'A+', 'A', 'B', etc.

  -- Zone lifecycle
  status VARCHAR(20) DEFAULT 'FRESH',    -- FRESH, TESTED_1X, TESTED_2X, TESTED_3X_PLUS, BROKEN, EXPIRED
  test_count INT DEFAULT 0,
  strength INT DEFAULT 100,              -- 0-100, decreases on tests

  -- Scoring
  odds_score INT DEFAULT 0,              -- 0-16 from Odds Enhancers
  hierarchy_rank INT DEFAULT 0,          -- 1=DP, 2=FTR, 3=FL, 4=Regular
  targets JSONB DEFAULT '[]'::jsonb,     -- Array of target prices

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_tested_at TIMESTAMPTZ,
  broken_at TIMESTAMPTZ,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);
```

**Zone Type Values:**
- `HFZ` = High Frequency Zone (Supply/Resistance) - SELL zones
- `LFZ` = Low Frequency Zone (Demand/Support) - BUY zones

**Status Values:**
- `FRESH` = New zone, never tested (100% strength)
- `TESTED_1X` = Tested once (80% strength)
- `TESTED_2X` = Tested twice (60% strength)
- `TESTED_3X_PLUS` = Tested 3+ times (40% strength)
- `BROKEN` = Zone broken by price (0% strength)
- `EXPIRED` = Zone too old (30+ days)

**Hierarchy Rank:**
| Rank | Type | Description |
|------|------|-------------|
| 1 | Decision Point | Strongest zone type |
| 2 | FTR | Fail To Return |
| 3 | Flag Limit | Flag boundary |
| 4 | Regular | Standard zone |

### 65.2 `zone_test_history` (Zone Test Events)

Records each time a zone is tested by price.

```sql
CREATE TABLE zone_test_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id UUID NOT NULL REFERENCES detected_zones(id) ON DELETE CASCADE,

  test_time BIGINT NOT NULL,             -- Unix timestamp (ms)
  test_price DECIMAL(20, 8) NOT NULL,
  penetration_depth DECIMAL(5, 2),       -- % into zone

  result VARCHAR(20) NOT NULL,           -- 'BOUNCED', 'PENETRATED', 'BROKEN'
  candle_pattern VARCHAR(30),            -- Confirmation pattern if any

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Result Values:**
- `BOUNCED` = Price touched zone and reversed
- `PENETRATED` = Price went partially into zone
- `BROKEN` = Price broke through zone completely

### 65.3 `mtf_alignment_cache` (Multi-Timeframe Alignment)

Caches multi-timeframe alignment calculations.

```sql
CREATE TABLE mtf_alignment_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,

  -- Zone references
  htf_zone_id UUID REFERENCES detected_zones(id),  -- 1D/1W
  itf_zone_id UUID REFERENCES detected_zones(id),  -- 4H
  ltf_zone_id UUID REFERENCES detected_zones(id),  -- 1H/15m

  -- Cached zone data
  htf_timeframe VARCHAR(10),
  htf_zone_type VARCHAR(10),
  htf_zone_high DECIMAL(20, 8),
  htf_zone_low DECIMAL(20, 8),
  -- ... similar for ITF and LTF

  -- Alignment score
  confluence_score INT DEFAULT 0,        -- 0-10
  alignment_type VARCHAR(20),            -- 'FULL', 'PARTIAL', 'NONE'
  recommendation VARCHAR(50),            -- 'HIGH_PROBABILITY', 'NORMAL', 'SKIP'
  direction VARCHAR(10),                 -- 'LONG', 'SHORT', 'NEUTRAL'

  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  UNIQUE(user_id, symbol)
);
```

### 65.4 `zone_visualization_preferences` (User Settings)

User settings for zone display colors, visibility, notifications.

```sql
CREATE TABLE zone_visualization_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Display settings
  show_hfz BOOLEAN DEFAULT TRUE,
  show_lfz BOOLEAN DEFAULT TRUE,
  show_labels BOOLEAN DEFAULT TRUE,
  show_historical BOOLEAN DEFAULT TRUE,
  max_zones_displayed INT DEFAULT 10,

  -- Colors
  hfz_fill_color VARCHAR(30) DEFAULT 'rgba(156, 6, 18, 0.3)',
  hfz_border_color VARCHAR(20) DEFAULT '#9C0612',
  lfz_fill_color VARCHAR(30) DEFAULT 'rgba(14, 203, 129, 0.3)',
  lfz_border_color VARCHAR(20) DEFAULT '#0ECB81',

  -- Notifications
  notify_on_retest BOOLEAN DEFAULT TRUE,
  notify_on_broken BOOLEAN DEFAULT TRUE,
  notify_on_new_zone BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 65.5 `zone_alerts` (Zone-Specific Alerts)

User-configured alerts for specific zones.

```sql
CREATE TABLE zone_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES detected_zones(id) ON DELETE CASCADE,

  alert_type VARCHAR(20) NOT NULL,       -- 'RETEST', 'BROKEN', 'APPROACH'
  threshold_percent DECIMAL(5, 2),       -- Distance % for APPROACH

  is_active BOOLEAN DEFAULT TRUE,
  triggered_at TIMESTAMPTZ,
  trigger_count INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 65.6 Zone Tier Limits

| Tier | Max Zones | Rectangles | Labels | Lifecycle | Historical | MTF TFs | Alerts/Coin |
|------|-----------|------------|--------|-----------|------------|---------|-------------|
| FREE | 1 | No | No | No | No | 0 | 0 |
| TIER1 | 3 | Yes | Yes | No | No | 0 | 3 |
| TIER2 | 10 | Yes | Yes | Yes | Yes | 3 | 10 |
| TIER3 | 20 | Yes | Yes | Yes | Yes | 5 | Unlimited |
| ADMIN | 50 | Yes | Yes | Yes | Yes | 12 | Unlimited |

### 65.7 Zone RPC Functions

```sql
-- Get user max zones based on tier
get_user_max_zones(p_user_id UUID) RETURNS INT

-- Count active zones for user/symbol/timeframe
count_user_active_zones(p_user_id UUID, p_symbol VARCHAR, p_timeframe VARCHAR) RETURNS INT

-- Cleanup old broken/expired zones (30+ days)
cleanup_old_zones() RETURNS void
```

### 65.8 Zone Triggers

```sql
-- Auto-update zone status when test is recorded
trigger_update_zone_on_test
  ON zone_test_history AFTER INSERT
  → Updates detected_zones: test_count++, strength-=20, status change

-- Auto-update updated_at timestamp
trigger_zones_updated_at
  ON detected_zones BEFORE UPDATE
```

### 65.9 Zone Tables Quick Reference

| Table | Purpose |
|-------|---------|
| `detected_zones` | Store detected zones with boundaries, lifecycle |
| `zone_test_history` | Track each zone test event |
| `mtf_alignment_cache` | Cache MTF alignment calculations |
| `zone_visualization_preferences` | User display settings |
| `zone_alerts` | Zone-specific notifications |

---

## 66. VISION BOARD SYSTEM TABLES (Migration 2025-12-10)

### 66.1 `vision_goals`
```sql
CREATE TABLE vision_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  life_area VARCHAR(50) NOT NULL,          -- 'finance', 'health', 'career', 'relationships', 'personal', 'spiritual'
  icon VARCHAR(50) DEFAULT 'target',
  color VARCHAR(20),
  target_type VARCHAR(20) DEFAULT 'completion',
  target_value NUMERIC DEFAULT 100,
  target_unit VARCHAR(50),
  current_value NUMERIC DEFAULT 0,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  progress_percent NUMERIC DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',     -- 'active', 'completed', 'archived'
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 66.2 `vision_milestones`
```sql
CREATE TABLE vision_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES vision_goals(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_percent INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 50,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 66.3 `vision_actions`
```sql
CREATE TABLE vision_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES vision_goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  recurrence VARCHAR(20) DEFAULT 'once',   -- 'once', 'daily', 'weekly', 'monthly'
  recurrence_days INTEGER[],               -- [1,3,5] for Mon,Wed,Fri
  weight INTEGER DEFAULT 1,
  xp_reward INTEGER DEFAULT 20,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  last_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 66.4 `vision_affirmations`
```sql
CREATE TABLE vision_affirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES vision_goals(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  audio_url TEXT,
  life_area VARCHAR(50),
  times_per_day INTEGER DEFAULT 3,
  times_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 66.5 `vision_affirmation_logs`
```sql
CREATE TABLE vision_affirmation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affirmation_id UUID REFERENCES vision_affirmations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 66.6 `vision_habits`
```sql
CREATE TABLE vision_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES vision_goals(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) DEFAULT 'daily',
  target_streak INTEGER DEFAULT 30,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  life_area VARCHAR(50),
  icon VARCHAR(50) DEFAULT 'check-circle',
  color VARCHAR(20) DEFAULT '#4CAF50',
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 66.7 `vision_habit_logs`
```sql
CREATE TABLE vision_habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES vision_habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, log_date)
);
```

### 66.8 `vision_rituals` (Master List)
```sql
CREATE TABLE vision_rituals (
  id VARCHAR(50) PRIMARY KEY,              -- 'star-wish', 'heart-expansion', etc.
  name VARCHAR(100) NOT NULL,
  name_vi VARCHAR(100),
  description TEXT,
  category VARCHAR(50) NOT NULL,           -- 'manifest', 'spiritual', 'healing', 'prosperity'
  duration_minutes INTEGER DEFAULT 5,
  icon VARCHAR(50),
  color VARCHAR(20),
  xp_per_completion INTEGER DEFAULT 20,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 66.9 `vision_ritual_completions`
```sql
CREATE TABLE vision_ritual_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ritual_id VARCHAR(50) REFERENCES vision_rituals(id),
  ritual_slug VARCHAR(50),                 -- Denormalized for quick access
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER,
  user_input TEXT,
  reflection TEXT,
  content TEXT,                            -- User content (gratitude items, wishes, letters)
  xp_earned INTEGER DEFAULT 0,
  goal_id UUID REFERENCES vision_goals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 66.10 `vision_ritual_streaks`
```sql
CREATE TABLE vision_ritual_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ritual_id VARCHAR(50) REFERENCES vision_rituals(id),
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  UNIQUE(user_id, ritual_id)
);
```

### 66.11 `vision_user_stats`
```sql
CREATE TABLE vision_user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  goals_created INTEGER DEFAULT 0,
  goals_completed INTEGER DEFAULT 0,
  achievements TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 66.12 `vision_daily_summary`
```sql
CREATE TABLE vision_daily_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  daily_score INTEGER DEFAULT 0,
  actions_completed INTEGER DEFAULT 0,
  actions_total INTEGER DEFAULT 0,
  affirmations_completed INTEGER DEFAULT 0,
  habits_completed INTEGER DEFAULT 0,
  ritual_completed BOOLEAN DEFAULT FALSE,
  xp_earned INTEGER DEFAULT 0,
  -- Calendar Journal Integration (2026-01)
  journal_count INTEGER DEFAULT 0,
  trading_count INTEGER DEFAULT 0,
  trading_pnl DECIMAL(20, 2) DEFAULT 0,
  trading_wins INTEGER DEFAULT 0,
  trading_losses INTEGER DEFAULT 0,
  divination_count INTEGER DEFAULT 0,
  mood_morning VARCHAR(20),
  mood_evening VARCHAR(20),
  mood_overall VARCHAR(20),
  mood_score INTEGER,
  day_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, summary_date)
);
```

### 66.13 `divination_readings`
```sql
CREATE TABLE divination_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,               -- 'tarot', 'iching', 'numerology'
  question TEXT,
  -- For Tarot
  cards JSONB,
  spread_type VARCHAR(50),
  -- For I Ching
  hexagram_number INTEGER,
  hexagram_data JSONB,
  -- Notes
  interpretation TEXT,
  notes TEXT,
  is_starred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 66.14 Vision Board Tables Quick Reference

| Table | Purpose |
|-------|---------|
| `vision_goals` | User goals with targets, deadlines, progress |
| `vision_milestones` | Goal milestones with XP rewards |
| `vision_actions` | Action items linked to goals |
| `vision_affirmations` | User affirmations with audio |
| `vision_affirmation_logs` | Affirmation completion history |
| `vision_habits` | Habit definitions with streak tracking |
| `vision_habit_logs` | Daily habit completion logs |
| `vision_rituals` | Master ritual definitions |
| `vision_ritual_completions` | Individual ritual completion records |
| `vision_ritual_streaks` | User streak per ritual |
| `vision_user_stats` | Aggregated user statistics |
| `vision_daily_summary` | Daily score, XP, completions summary |
| `divination_readings` | Tarot/I-Ching readings |

---

## 67. CALENDAR & SMART JOURNAL TABLES (Migration 2026-01-28)

### 67.1 `calendar_journal_entries`
```sql
CREATE TABLE calendar_journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Date & Type
  entry_date DATE NOT NULL,
  entry_type VARCHAR(30) NOT NULL DEFAULT 'reflection',
  -- Types: 'reflection', 'gratitude', 'goal_note', 'ritual_reflection', 'quick_note'

  -- Content
  title VARCHAR(200),
  content TEXT NOT NULL,

  -- Mood tracking
  mood VARCHAR(20),                        -- 'happy', 'peaceful', 'neutral', 'sad', 'stressed', 'excited', 'anxious'
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),

  -- Categorization
  life_area VARCHAR(30),                   -- 'finance', 'health', 'career', 'relationships', 'personal', 'spiritual'
  tags TEXT[] DEFAULT '{}',

  -- Related entities
  related_ritual_id UUID,
  related_goal_id UUID,
  related_habit_id UUID,

  -- Media
  attachments JSONB DEFAULT '[]',          -- [{url, type: 'image'|'file', name, size, uploaded_at}]
  voice_note_url TEXT,
  voice_note_duration INTEGER,             -- seconds

  -- Metadata
  is_pinned BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT TRUE,
  is_favorite BOOLEAN DEFAULT FALSE,
  word_count INTEGER DEFAULT 0,
  is_first_entry BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 67.2 `trading_journal_entries`
```sql
CREATE TABLE trading_journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  calendar_entry_id UUID REFERENCES calendar_journal_entries(id) ON DELETE SET NULL,

  -- Trade info
  trade_date DATE NOT NULL,
  trade_time TIME,
  symbol VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('long', 'short')),

  -- Pattern & Setup (from Scanner)
  pattern_type VARCHAR(50),                -- 'DPD', 'UPU', 'head-shoulders', etc.
  pattern_grade VARCHAR(5) CHECK (pattern_grade IN ('A+', 'A', 'B', 'C', 'D')),
  timeframe VARCHAR(10),                   -- '15m', '1h', '4h', '1d'
  zone_type VARCHAR(20),                   -- 'demand', 'supply', 'flip'
  zone_strength INTEGER CHECK (zone_strength >= 1 AND zone_strength <= 5),

  -- Prices
  entry_price DECIMAL(20, 8) NOT NULL,
  exit_price DECIMAL(20, 8),
  stop_loss DECIMAL(20, 8),
  take_profit_1 DECIMAL(20, 8),
  take_profit_2 DECIMAL(20, 8),
  take_profit_3 DECIMAL(20, 8),

  -- Position sizing
  position_size DECIMAL(20, 8),
  position_value_usdt DECIMAL(20, 2),
  risk_amount_usdt DECIMAL(20, 2),
  risk_percent DECIMAL(5, 2),
  risk_reward_ratio DECIMAL(5, 2),

  -- Result
  pnl_amount DECIMAL(20, 2),
  pnl_percent DECIMAL(10, 4),
  pnl_r DECIMAL(5, 2),                     -- P/L in R multiples
  result VARCHAR(15) CHECK (result IN ('win', 'loss', 'breakeven', 'open', 'cancelled')),

  -- Analysis notes
  entry_reason TEXT,
  exit_reason TEXT,
  lessons_learned TEXT,
  market_context TEXT,
  what_went_well TEXT,
  what_to_improve TEXT,

  -- Rating & Discipline (1-5)
  execution_rating INTEGER CHECK (execution_rating >= 1 AND execution_rating <= 5),
  setup_rating INTEGER CHECK (setup_rating >= 1 AND setup_rating <= 5),
  management_rating INTEGER CHECK (management_rating >= 1 AND management_rating <= 5),

  -- Discipline checklist (JSONB for flexibility)
  discipline_checklist JSONB DEFAULT '{
    "correct_setup": null,
    "correct_size": null,
    "stop_loss_set": null,
    "waited_confirmation": null,
    "followed_plan": null,
    "no_fomo": null,
    "no_revenge_trade": null,
    "proper_risk_management": null
  }',
  discipline_score INTEGER CHECK (discipline_score >= 0 AND discipline_score <= 100),

  -- Psychology tracking
  pre_trade_emotion VARCHAR(20),           -- 'calm', 'anxious', 'greedy', 'fomo', 'confident', 'fearful', 'revenge'
  during_trade_emotion VARCHAR(20),
  post_trade_emotion VARCHAR(20),
  emotional_note TEXT,

  -- Screenshots
  screenshots JSONB DEFAULT '[]',          -- [{url, caption, type: 'entry'|'exit'|'analysis'|'setup', uploaded_at}]

  -- Source tracking
  source VARCHAR(30) DEFAULT 'manual',     -- 'manual', 'scanner_signal', 'paper_trade', 'shadow_mode', 'ai_suggestion'
  source_reference_id UUID,
  confirmations_used JSONB DEFAULT '[]',

  -- Timestamps
  entry_time TIMESTAMPTZ,
  exit_time TIMESTAMPTZ,
  holding_duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 67.3 `calendar_daily_mood`
```sql
CREATE TABLE calendar_daily_mood (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_date DATE NOT NULL,

  -- Morning check-in
  morning_mood VARCHAR(20),
  morning_mood_score INTEGER CHECK (morning_mood_score >= 1 AND morning_mood_score <= 5),
  morning_note TEXT,
  morning_energy INTEGER CHECK (morning_energy >= 1 AND morning_energy <= 5),
  morning_sleep_quality INTEGER CHECK (morning_sleep_quality >= 1 AND morning_sleep_quality <= 5),
  morning_checked_at TIMESTAMPTZ,

  -- Midday check-in (optional)
  midday_mood VARCHAR(20),
  midday_mood_score INTEGER,
  midday_note TEXT,
  midday_checked_at TIMESTAMPTZ,

  -- Evening check-in
  evening_mood VARCHAR(20),
  evening_mood_score INTEGER CHECK (evening_mood_score >= 1 AND evening_mood_score <= 5),
  evening_note TEXT,
  evening_productivity INTEGER CHECK (evening_productivity >= 1 AND evening_productivity <= 5),
  evening_gratitude TEXT,
  evening_checked_at TIMESTAMPTZ,

  -- Overall
  overall_mood VARCHAR(20),
  overall_mood_score INTEGER CHECK (overall_mood_score >= 1 AND overall_mood_score <= 5),
  mood_factors JSONB DEFAULT '[]',         -- ['good_sleep', 'exercise', 'stress', 'social', etc.]
  day_highlight TEXT,
  day_lowlight TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mood_date)
);
```

### 67.4 `calendar_ritual_logs`
```sql
CREATE TABLE calendar_ritual_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ritual_completion_id UUID,               -- Link to original completion

  log_date DATE NOT NULL,
  log_time TIME,
  ritual_slug VARCHAR(50) NOT NULL,
  ritual_name VARCHAR(100) NOT NULL,
  ritual_category VARCHAR(30),             -- 'mindfulness', 'manifestation', 'healing', 'gratitude'

  duration_seconds INTEGER,
  duration_minutes INTEGER GENERATED ALWAYS AS (duration_seconds / 60) STORED,
  xp_earned INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 1,
  is_streak_bonus BOOLEAN DEFAULT FALSE,

  user_input TEXT,
  reflection TEXT,
  additional_notes TEXT,
  notes_added_at TIMESTAMPTZ,

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 67.5 `calendar_divination_logs`
```sql
CREATE TABLE calendar_divination_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  log_date DATE NOT NULL,
  log_time TIME,
  reading_type VARCHAR(20) NOT NULL CHECK (reading_type IN ('tarot', 'iching', 'numerology')),

  result_summary TEXT NOT NULL,
  result_data JSONB NOT NULL,

  -- For Tarot
  spread_type VARCHAR(30),
  cards_drawn JSONB,                       -- [{position, card_name, is_reversed}]

  -- For I Ching
  hexagram_number INTEGER,
  hexagram_name VARCHAR(100),
  changing_lines JSONB,

  -- User context
  user_question TEXT,
  user_intention TEXT,
  life_area VARCHAR(30),

  -- User interpretation
  user_interpretation TEXT,
  interpretation_added_at TIMESTAMPTZ,
  action_taken TEXT,
  action_taken_at TIMESTAMPTZ,

  related_goal_id UUID,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_significant BOOLEAN DEFAULT FALSE,

  reading_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 67.6 `calendar_goal_progress_logs`
```sql
CREATE TABLE calendar_goal_progress_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID NOT NULL,

  log_date DATE NOT NULL,
  log_time TIME,

  progress_note TEXT,
  progress_percent INTEGER CHECK (progress_percent >= 0 AND progress_percent <= 100),
  previous_percent INTEGER,
  progress_change INTEGER GENERATED ALWAYS AS (progress_percent - COALESCE(previous_percent, 0)) STORED,

  milestone_title VARCHAR(200),
  milestone_achieved BOOLEAN DEFAULT FALSE,
  milestone_xp INTEGER DEFAULT 0,

  actions_completed_today INTEGER DEFAULT 0,
  actions_total_today INTEGER DEFAULT 0,
  progress_mood VARCHAR(20),               -- 'motivated', 'frustrated', 'proud', 'stuck', 'excited'
  blockers TEXT,
  next_steps TEXT,
  is_auto_logged BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 67.7 `calendar_user_settings`
```sql
CREATE TABLE calendar_user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Onboarding
  has_seen_onboarding BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,

  -- Feature settings
  auto_log_rituals BOOLEAN DEFAULT TRUE,
  auto_log_divination BOOLEAN DEFAULT TRUE,
  auto_log_goals BOOLEAN DEFAULT TRUE,

  -- Reminder settings
  morning_mood_reminder BOOLEAN DEFAULT TRUE,
  morning_reminder_time TIME DEFAULT '07:00',
  evening_mood_reminder BOOLEAN DEFAULT TRUE,
  evening_reminder_time TIME DEFAULT '21:00',
  journal_reminder BOOLEAN DEFAULT FALSE,
  journal_reminder_time TIME DEFAULT '20:00',

  -- Display settings
  default_calendar_view VARCHAR(20) DEFAULT 'month',
  show_mood_on_calendar BOOLEAN DEFAULT TRUE,
  show_trading_on_calendar BOOLEAN DEFAULT TRUE,
  show_divination_on_calendar BOOLEAN DEFAULT TRUE,

  -- Privacy
  share_mood_with_coach BOOLEAN DEFAULT FALSE,
  share_trading_with_community BOOLEAN DEFAULT FALSE,
  push_token TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### 67.8 Calendar Tables Quick Reference

| Table | Purpose |
|-------|---------|
| `calendar_journal_entries` | Main journal entries (reflection, gratitude, notes) |
| `trading_journal_entries` | Trading journal with metrics, psychology, discipline |
| `calendar_daily_mood` | Morning, midday, evening mood check-ins |
| `calendar_ritual_logs` | Auto-logged ritual completions |
| `calendar_divination_logs` | Tarot/I-Ching readings with interpretations |
| `calendar_goal_progress_logs` | Goal progress notes and milestones |
| `calendar_user_settings` | Calendar preferences and notifications |

---

## 68. CALL SYSTEM TABLES (Migration 2025-12-28)

### 68.1 `calls`
```sql
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Call type & mode
  call_type TEXT NOT NULL DEFAULT 'audio' CHECK (call_type IN ('audio', 'video')),
  is_group_call BOOLEAN DEFAULT FALSE,

  -- Call status state machine
  status TEXT NOT NULL DEFAULT 'initiating' CHECK (status IN (
    'initiating',    -- Đang khởi tạo WebRTC
    'ringing',       -- Đang đổ chuông bên callee
    'connecting',    -- Đang thiết lập kết nối P2P
    'connected',     -- Đang trong cuộc gọi
    'reconnecting',  -- Đang kết nối lại sau mất mạng
    'ended',         -- Kết thúc bình thường
    'missed',        -- Không trả lời (timeout 60s)
    'declined',      -- Từ chối
    'cancelled',     -- Người gọi hủy trước khi nhận
    'failed',        -- Lỗi kết nối
    'busy'           -- Người nhận đang bận
  )),

  -- Timing
  ring_started_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,

  -- WebRTC/LiveKit
  room_id TEXT,

  -- Quality & Metadata
  end_reason TEXT,                         -- 'caller_ended', 'callee_ended', 'connection_failed', 'timeout'
  quality_score SMALLINT CHECK (quality_score IS NULL OR (quality_score >= 1 AND quality_score <= 5)),
  network_type TEXT,                       -- 'wifi', '4g', '3g'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 68.2 `call_participants`
```sql
CREATE TABLE call_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN (
    'caller',        -- Người gọi
    'callee',        -- Người nhận
    'participant'    -- Thành viên group call
  )),

  -- Participant status
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN (
    'invited',       -- Được mời
    'ringing',       -- Đang đổ chuông
    'connecting',    -- Đang kết nối
    'connected',     -- Đã kết nối
    'reconnecting',  -- Đang kết nối lại
    'left',          -- Đã rời
    'declined',      -- Từ chối
    'missed',        -- Không trả lời
    'busy'           -- Đang bận
  )),

  -- Timing
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,

  -- Media state (realtime sync)
  is_muted BOOLEAN DEFAULT FALSE,
  is_video_enabled BOOLEAN DEFAULT TRUE,
  is_screen_sharing BOOLEAN DEFAULT FALSE,
  is_speaker_on BOOLEAN DEFAULT FALSE,

  -- Connection info
  connection_quality TEXT DEFAULT 'good' CHECK (connection_quality IN (
    'excellent', 'good', 'fair', 'poor', 'bad'
  )),
  device_type TEXT,                        -- 'ios', 'android', 'web'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(call_id, user_id)
);
```

### 68.3 `call_events`
```sql
CREATE TABLE call_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  event_type TEXT NOT NULL CHECK (event_type IN (
    -- Call lifecycle
    'call_initiated', 'call_ringing', 'call_answered', 'call_declined',
    'call_missed', 'call_cancelled', 'call_connected', 'call_ended', 'call_failed',
    -- Participant events
    'participant_joined', 'participant_left', 'participant_invited',
    -- Media events
    'mute_toggled', 'video_toggled', 'speaker_toggled',
    'screen_share_started', 'screen_share_stopped', 'camera_switched',
    -- Connection events
    'connection_quality_changed', 'network_type_changed',
    'reconnecting', 'reconnected', 'ice_candidate_added', 'ice_connection_failed',
    -- Error events
    'permission_denied', 'media_error', 'signaling_error'
  )),

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 68.4 Call Tables Quick Reference

| Table | Purpose |
|-------|---------|
| `calls` | Call records with status, timing, quality |
| `call_participants` | Individual participant data per call |
| `call_events` | Call lifecycle events for debugging/analytics |

---

## 69. MESSAGING PRIVACY TABLES (Migration 2026-02-01)

### 69.1 `user_privacy_settings`
```sql
CREATE TABLE user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,

  -- Messaging Privacy
  allow_message_requests BOOLEAN DEFAULT true,
  read_receipts_enabled BOOLEAN DEFAULT true,
  typing_indicator_enabled BOOLEAN DEFAULT true,
  online_status_enabled BOOLEAN DEFAULT true,
  last_seen_enabled BOOLEAN DEFAULT true,

  -- Call Privacy
  allow_calls_from TEXT DEFAULT 'everyone' CHECK (allow_calls_from IN (
    'everyone',
    'contacts_only',
    'nobody'
  )),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 69.2 `user_contacts`
```sql
CREATE TABLE user_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',
    'archived',
    'removed'
  )),
  first_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, contact_id),
  CONSTRAINT no_self_contact CHECK (user_id != contact_id)
);
```

### 69.3 `message_requests`
```sql
CREATE TABLE message_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'accepted',
    'declined',
    'blocked'
  )),
  message_preview TEXT,
  messages_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,

  UNIQUE(conversation_id, requester_id, recipient_id)
);
```

### 69.4 `restricted_users`
```sql
CREATE TABLE restricted_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restricter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  restricted_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(restricter_id, restricted_id),
  CONSTRAINT no_self_restrict CHECK (restricter_id != restricted_id)
);
```

### 69.5 Messaging Privacy Helper Functions
```sql
-- Check if users are contacts
CREATE OR REPLACE FUNCTION are_users_contacts(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_contacts
    WHERE (user_id = user_a AND contact_id = user_b AND status = 'active')
       OR (user_id = user_b AND contact_id = user_a AND status = 'active')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if can call user
CREATE OR REPLACE FUNCTION can_call_user(caller_id UUID, callee_id UUID)
RETURNS TABLE (allowed BOOLEAN, reason TEXT);
```

### 69.6 Messaging Privacy Tables Quick Reference

| Table | Purpose |
|-------|---------|
| `user_privacy_settings` | Read receipts, typing indicators, online status, call permissions |
| `user_contacts` | Track who has chatted with whom |
| `message_requests` | Message requests for privacy protection |
| `restricted_users` | Silent block/restriction list |

---

## 70. CHATBOT MEMORY SYSTEM TABLES (Migration 2026-01-16)

### 70.1 `user_chatbot_profiles`
```sql
CREATE TABLE user_chatbot_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Identity
  display_name VARCHAR(100),
  preferred_name VARCHAR(50),
  birth_date DATE,
  zodiac_sign VARCHAR(20),

  -- Spiritual Journey
  life_purpose TEXT,
  core_values TEXT[] DEFAULT '{}',
  spiritual_goals TEXT[] DEFAULT '{}',

  -- Communication Preferences
  communication_style VARCHAR(20) DEFAULT 'balanced' CHECK (communication_style IN (
    'gentle', 'direct', 'balanced'
  )),
  language_preference VARCHAR(10) DEFAULT 'vi',

  -- Journey Tracking
  journey_start_date DATE DEFAULT CURRENT_DATE,
  transformation_days INTEGER DEFAULT 0,   -- Auto-calculated

  -- Notification Preferences
  notification_preferences JSONB DEFAULT '{
    "daily_insight": true,
    "streak_alerts": true,
    "ritual_reminders": true,
    "pattern_observations": true,
    "milestone_celebrations": true,
    "preferred_time": "08:00"
  }'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_chatbot_profile UNIQUE (user_id)
);
```

### 70.2 `chat_memories`
```sql
CREATE TABLE chat_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Memory Classification
  memory_type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (memory_type IN (
    'goal', 'value', 'preference', 'achievement', 'challenge',
    'relationship', 'emotion', 'insight', 'divination', 'general'
  )),
  category VARCHAR(50) DEFAULT 'general',

  -- Memory Content
  title VARCHAR(200),
  content TEXT NOT NULL,
  summary TEXT,
  context JSONB DEFAULT '{}',

  -- Memory Importance
  importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  is_pinned BOOLEAN DEFAULT FALSE,

  -- Source Tracking
  source_type VARCHAR(50) DEFAULT 'conversation' CHECK (source_type IN (
    'conversation', 'divination', 'goal', 'manual', 'extracted'
  )),
  source_reference_id UUID,

  -- Expiration (null = never expires)
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 70.3 `emotional_states`
```sql
CREATE TABLE emotional_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Emotion Data
  primary_emotion VARCHAR(50) NOT NULL,
  secondary_emotions TEXT[] DEFAULT '{}',
  intensity INTEGER DEFAULT 5 CHECK (intensity >= 1 AND intensity <= 10),

  -- Frequency Data (GEM Method Hz mapping)
  frequency_hz INTEGER CHECK (frequency_hz >= 20 AND frequency_hz <= 700),
  frequency_level VARCHAR(20) CHECK (frequency_level IN ('low', 'medium', 'elevated')),

  -- Context
  trigger_topic VARCHAR(100),
  message_excerpt TEXT,
  session_id UUID,

  detected_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 70.4 `proactive_messages` (Migration 2026-01-16)
```sql
CREATE TABLE proactive_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  message_type VARCHAR(50) NOT NULL,       -- 'daily_insight', 'ritual_reminder', 'streak_alert', 'milestone'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',

  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  is_sent BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 70.5 Chatbot Memory Helper Functions
```sql
-- Get or create chatbot profile
CREATE OR REPLACE FUNCTION get_or_create_chatbot_profile(p_user_id UUID)
RETURNS user_chatbot_profiles;

-- Search memories by relevance
CREATE OR REPLACE FUNCTION search_memories(
  p_user_id UUID,
  p_query TEXT,
  p_memory_type VARCHAR DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (...);

-- Get emotional journey
CREATE OR REPLACE FUNCTION get_emotional_journey(
  p_user_id UUID,
  p_days INTEGER DEFAULT 14
) RETURNS TABLE (...);
```

### 70.6 Chatbot Memory Tables Quick Reference

| Table | Purpose |
|-------|---------|
| `user_chatbot_profiles` | Long-term AI personalization profile |
| `chat_memories` | Semantic memories extracted from conversations |
| `emotional_states` | Emotion tracking history for adaptive AI |
| `proactive_messages` | Scheduled AI-generated messages |

---

## 71. UPDATED QUICK REFERENCE - ALL TABLES BY FEATURE

### Vision Board Tables
| Table | Purpose |
|-------|---------|
| `vision_goals` | User goals with progress tracking |
| `vision_milestones` | Goal milestones |
| `vision_actions` | Action items |
| `vision_affirmations` | Daily affirmations |
| `vision_affirmation_logs` | Affirmation completions |
| `vision_habits` | Habit tracking |
| `vision_habit_logs` | Habit completions |
| `vision_rituals` | Ritual definitions |
| `vision_ritual_completions` | Ritual completions |
| `vision_ritual_streaks` | Ritual streaks |
| `vision_user_stats` | User statistics |
| `vision_daily_summary` | Daily score summary |
| `divination_readings` | Tarot/I-Ching readings |

### Calendar & Journal Tables
| Table | Purpose |
|-------|---------|
| `calendar_journal_entries` | Journal entries |
| `trading_journal_entries` | Trading journal |
| `calendar_daily_mood` | Mood tracking |
| `calendar_ritual_logs` | Ritual logs |
| `calendar_divination_logs` | Divination logs |
| `calendar_goal_progress_logs` | Goal progress |
| `calendar_user_settings` | Calendar settings |

### Call System Tables
| Table | Purpose |
|-------|---------|
| `calls` | Call records |
| `call_participants` | Participants |
| `call_events` | Event logs |

### Messaging Privacy Tables
| Table | Purpose |
|-------|---------|
| `user_privacy_settings` | Privacy settings |
| `user_contacts` | Contact list |
| `message_requests` | Message requests |
| `restricted_users` | Block list |

### Chatbot Memory Tables
| Table | Purpose |
|-------|---------|
| `user_chatbot_profiles` | AI profile |
| `chat_memories` | Semantic memories |
| `emotional_states` | Emotion history |
| `proactive_messages` | Scheduled messages |

---

## RLS SECURITY STATUS (Updated: 2026-02-17)

> **All public tables now have RLS enabled and proper policies.**

### Migrations Applied
1. `20260217_rls_fix_service_role_policies` — Fixed 24 policies with `TO {public}` → `TO service_role`
2. `20260217_rls_enable_missing_tables` — Enabled RLS on 20 tables + added policies

### Policy Categories

| Category | Pattern | Example Tables |
|----------|---------|----------------|
| **Backend-only** | `FOR ALL TO service_role USING (true)` | `push_notification_queue`, `system_logs`, `job_logs`, `rate_limit_tracking` |
| **User-owned data** | `FOR SELECT TO authenticated USING (user_id = auth.uid())` | `gems_transactions`, `user_purchases`, `user_access`, `chatbot_history` |
| **Admin read** | `FOR SELECT TO authenticated USING (is_admin_user())` | `gems_transactions`, `analytics_events`, `payment_logs`, `user_profiles` |
| **Public catalog** | `FOR SELECT TO authenticated USING (true)` or `USING (is_active = true)` | `upgrade_tiers`, `upgrade_banners`, `gem_packs`, `vision_rituals` |
| **Email-based** | `FOR SELECT TO authenticated USING (customer_email = auth.jwt()->>'email')` | `pending_payments` |

### Required Template for New Tables
```sql
CREATE TABLE IF NOT EXISTS new_table (...);
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_new_table" ON new_table
  FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Add user policies as needed (SELECT/INSERT/UPDATE)
```

### Verification Queries
```sql
-- Should return 0 rows:
SELECT tablename FROM pg_tables WHERE schemaname='public' AND rowsecurity=false;

-- Should return 0 rows:
SELECT tablename, policyname FROM pg_policies
WHERE schemaname='public' AND qual='true'
AND roles='{public}' AND cmd IN ('ALL','UPDATE','INSERT','DELETE');
```

### Helper Functions
- `is_admin_user()` — Returns true if `auth.uid()` is an admin (checks `profiles.role`)
- `is_user_admin(user_id)` — Returns true if given UUID is an admin
