# Gemral - Database Schema & Tier System
## MASTER REFERENCE - Updated: 2025-11-28 (12 Major Features Added)

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
  role VARCHAR(20) DEFAULT 'user',        -- 'user' | 'admin'
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

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

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

## 3. ADMIN DETECTION LOGIC

```javascript
// Use this EXACT logic everywhere
const isAdmin =
  profile.is_admin === true ||
  profile.role === 'admin' ||
  profile.role === 'ADMIN' ||
  profile.scanner_tier === 'ADMIN' ||
  profile.chatbot_tier === 'ADMIN';
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
```sql
CREATE TABLE user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  gem_balance INT DEFAULT 0,
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

### 13.10b `currency_packages` (Feature #14: Virtual Currency)
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
