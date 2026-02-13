# Gemral - COMPLETE FEATURES PLAN
## Shopping, Sound Library, Monetization, Interactions & Gifting

**Version:** 2.0 COMPLETE  
**Date:** November 27, 2024  
**Status:** Ready for Implementation ✅

**Updates trong version này:**
- ❌ Removed: Amazon affiliate
- ✅ Added: Shopee affiliate integration
- ✅ Added: Sound Library (complete new feature)
- ✅ Retained: All original features (Boost Post, Gifting, etc.)

---

## 📋 MỤC LỤC COMPLETE

1. [Shopping Features (Updated)](#1-shopping-features-updated)
   - 1.1 Shopping Tags
   - 1.2 Live Shopping
   - 1.3 Product Sources (Shopee Integration)
2. [Sound Library (NEW)](#2-sound-library-new)
   - 2.1 Browse & Discover
   - 2.2 Upload Original Sounds
   - 2.3 Trending Algorithm
   - 2.4 Sound Player
3. [Monetization Features](#3-monetization-features)
   - 3.1 Boost Post
   - 3.2 Create Ad from Post
4. [Interaction Features](#4-interaction-features)
   - 4.1 Share to External Apps
   - 4.2 Share to Feed (Repost)
   - 4.3 Pin Comments
   - 4.4 Delete Comments
   - 4.5 Report Comments
   - 4.6 See Who Reacted
5. [Privacy & Audience Settings](#5-privacy--audience-settings)
6. [Gifting System](#6-gifting-system)
   - 6.1 Virtual Currency
   - 6.2 Gift Catalog
   - 6.3 Creator Earnings
7. [Database Schema Complete](#7-database-schema-complete)
8. [Implementation Timeline](#8-implementation-timeline)
9. [Testing Checklist](#9-testing-checklist)

---

## 1. SHOPPING FEATURES (UPDATED)

### 1.1 SHOPPING TAGS - Tag Sản Phẩm Trong Posts

**Mục đích:** Tag products từ YinYangMasters, GEM Academy, hoặc Shopee vào posts với giá và link mua.

#### 📱 SCREENS

##### Screen 1: Create Post with Product Tags
```
┌─────────────────────────────────────┐
│ ← Back        Create Post    Post → │
├─────────────────────────────────────┤
│ [Photo/Video Upload Area]            │
│                                      │
│ Write caption...                     │
│                                      │
├─────────────────────────────────────┤
│ 🏷️ Tag Products (0/10)               │
│ [+ Add Products]                     │
│                                      │
│ Tagged Products:                     │
│ ┌──────────────────────────────┐   │
│ │ 🔮 Rose Quartz Crystal       │   │
│ │ 💰 350,000 VNĐ               │   │
│ │ 🛍️ YinYangMasters.com    [X] │   │
│ └──────────────────────────────┘   │
│                                      │
│ ┌──────────────────────────────┐   │
│ │ 📚 Trading Psychology        │   │
│ │ 💰 89,000 VNĐ                │   │
│ │ 🛒 Shopee Affiliate      [X] │   │
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

##### Screen 2: Product Search Modal
```
┌─────────────────────────────────────┐
│ ← Back      Add Products             │
├─────────────────────────────────────┤
│ 🔍 Search products...                │
├─────────────────────────────────────┤
│ 📂 Sources:                          │
│ ☑ YinYangMasters (Crystals)          │
│ ☑ GEM Academy (Courses)              │
│ ☑ Shopee (Affiliate) 🔥              │
├─────────────────────────────────────┤
│ 📂 Categories:                       │
│ • Crystals & Gemstones ✓             │
│ • Trading Books                      │
│ • Spiritual Tools                    │
│ • Courses & Education                │
├─────────────────────────────────────┤
│ Products (127 found)                 │
│                                      │
│ ┌──────────────────────────────┐   │
│ │ [Image]  Rose Quartz         │   │
│ │ 350,000 VNĐ                  │   │
│ │ 🛍️ YinYangMasters    [+]     │   │
│ │ ⭐ 4.8 (234)                 │   │
│ └──────────────────────────────┘   │
│                                      │
│ ┌──────────────────────────────┐   │
│ │ [Image]  Trading Journal     │   │
│ │ 89,000 VNĐ                   │   │
│ │ 🛒 Shopee          [+]       │   │
│ │ ⭐ 4.9 (1.2K) 🔥             │   │
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

##### Screen 3: Product Detail Sheet
```
┌─────────────────────────────────────┐
│               ──────                 │
│ [Product Image]                      │
│                                      │
│ 🔮 Rose Quartz Crystal               │
│ ⭐⭐⭐⭐⭐ 4.8 (234 reviews)           │
│                                      │
│ 💰 350,000 VNĐ                       │
│ 🛍️ YinYangMasters.com                │
│ ✅ In Stock                           │
│ 🚚 Free shipping >500K                │
│                                      │
│ Description:                         │
│ Natural Rose Quartz for love,        │
│ healing, and positive energy.        │
│                                      │
│ [View Full Details]                  │
│                                      │
│ ┌──────────────────────────────┐   │
│ │ 🛒 Add to Cart                │   │
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ ⚡ Buy Now                    │   │
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### 💾 DATABASE SCHEMA

```sql
-- Products (supporting multiple sources)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_type TEXT NOT NULL, -- 'crystal', 'course', 'affiliate', 'book'
  source TEXT NOT NULL, -- 'shopify', 'academy', 'shopee', 'manual'
  
  -- External IDs
  external_id TEXT, -- Shopify product ID
  shopee_product_id TEXT, -- Shopee product ID
  shopee_shop_id TEXT, -- Shopee shop ID
  shopee_category_id INTEGER,
  
  -- Product info
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'VND',
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  
  -- Shop info
  shop_name TEXT,
  shop_url TEXT,
  product_url TEXT NOT NULL,
  
  -- Affiliate
  affiliate_link TEXT,
  commission_rate NUMERIC(5, 2),
  shopee_commission_rate NUMERIC(5, 2),
  
  -- Metadata
  category_id UUID REFERENCES product_categories(id),
  tags TEXT[] DEFAULT '{}',
  rating NUMERIC(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  stock_status TEXT DEFAULT 'in_stock',
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product categories
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  parent_id UUID REFERENCES product_categories(id),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post product tags
CREATE TABLE post_product_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, product_id)
);

-- Product interactions tracking
CREATE TABLE product_tag_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  post_id UUID REFERENCES forum_posts(id),
  product_id UUID REFERENCES products(id),
  interaction_type TEXT NOT NULL, -- 'view', 'add_to_cart', 'buy_now', 'save', 'shopee_click'
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping cart
CREATE TABLE shopping_cart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  added_from_post_id UUID REFERENCES forum_posts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Shopee sync log
CREATE TABLE shopee_product_sync (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_type TEXT NOT NULL,
  products_synced INTEGER DEFAULT 0,
  products_added INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  products_removed INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running'
);

-- Indexes
CREATE INDEX idx_products_source ON products(source);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_shopee ON products(shopee_product_id) WHERE shopee_product_id IS NOT NULL;
CREATE INDEX idx_post_product_tags_post ON post_product_tags(post_id);
CREATE INDEX idx_product_interactions_product ON product_tag_interactions(product_id);
CREATE INDEX idx_shopping_cart_user ON shopping_cart(user_id);
```

#### 🔧 SHOPEE INTEGRATION

```javascript
// src/services/shopeeService.js

import crypto from 'crypto';

const SHOPEE_CONFIG = {
  PARTNER_ID: process.env.SHOPEE_PARTNER_ID,
  PARTNER_KEY: process.env.SHOPEE_PARTNER_KEY,
  AFFILIATE_ID: process.env.SHOPEE_AFFILIATE_ID,
  API_BASE: 'https://open-api.shopee.com'
};

// Generate Shopee API signature
function generateSignature(path, timestamp, accessToken = '', shopId = '') {
  const baseString = `${SHOPEE_CONFIG.PARTNER_ID}${path}${timestamp}${accessToken}${shopId}`;
  return crypto
    .createHmac('sha256', SHOPEE_CONFIG.PARTNER_KEY)
    .update(baseString)
    .digest('hex');
}

// Search Shopee products
export async function searchShopeeProducts(keyword, category = null, limit = 20) {
  const timestamp = Math.floor(Date.now() / 1000);
  const path = '/api/v2/product/search_item';
  const signature = generateSignature(path, timestamp);

  const params = new URLSearchParams({
    partner_id: SHOPEE_CONFIG.PARTNER_ID,
    timestamp: timestamp,
    sign: signature,
    keyword: keyword,
    page_size: limit
  });

  if (category) params.append('category_id', category);

  const response = await fetch(`${SHOPEE_CONFIG.API_BASE}${path}?${params}`);
  const data = await response.json();

  if (data.error) throw new Error(data.message);

  return data.response.items.map(item => ({
    shopee_product_id: item.item_id,
    shopee_shop_id: item.shop_id,
    name: item.item_name,
    price: item.price / 100000,
    image_url: item.images[0],
    images: item.images,
    rating: item.item_rating,
    sold_count: item.sold,
    stock: item.stock,
    affiliate_link: generateShopeeAffiliateLink(item.item_id, item.shop_id)
  }));
}

// Generate Shopee affiliate link
export function generateShopeeAffiliateLink(productId, shopId, subId = null) {
  const params = new URLSearchParams({
    affi_id: SHOPEE_CONFIG.AFFILIATE_ID
  });
  if (subId) params.append('sub_id', subId);
  return `https://shope.ee/${shopId}/${productId}?${params}`;
}

// Sync Shopee products (cron job every 6 hours)
export async function syncShopeeProducts() {
  console.log('Starting Shopee sync...');
  
  const categories = [
    { id: 100639, name: 'Trang trí nhà cửa' },
    { id: 100992, name: 'Sức khỏe' },
    { id: 100011, name: 'Sách & Tạp chí' }
  ];

  let totalAdded = 0;
  let totalUpdated = 0;

  for (const category of categories) {
    const products = await searchShopeeProducts('', category.id, 50);

    for (const product of products) {
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('shopee_product_id', product.shopee_product_id)
        .single();

      if (existing) {
        await supabase
          .from('products')
          .update({
            price: product.price,
            stock_status: product.stock > 0 ? 'in_stock' : 'out_of_stock',
            rating: product.rating,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        totalUpdated++;
      } else {
        await supabase
          .from('products')
          .insert({
            product_type: 'affiliate',
            source: 'shopee',
            shopee_product_id: product.shopee_product_id,
            shopee_shop_id: product.shopee_shop_id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            images: product.images,
            product_url: product.affiliate_link,
            affiliate_link: product.affiliate_link,
            rating: product.rating,
            stock_status: product.stock > 0 ? 'in_stock' : 'out_of_stock',
            shop_name: 'Shopee',
            shopee_commission_rate: 10, // 10% average
            is_active: true
          });
        totalAdded++;
      }
    }
  }

  console.log(`Shopee sync complete: ${totalAdded} added, ${totalUpdated} updated`);
}
```

---

### 1.2 LIVE SHOPPING - Bán Trong Livestream

**Mục đích:** Host thêm products vào livestream, viewers mua trực tiếp không cần rời stream.

#### 📱 SCREENS

##### Host View - Shopping Panel
```
┌─────────────────────────────────────┐
│ [LIVE STREAM VIDEO]                  │
│ 🔴 LIVE   👁️ 1,234   [End]          │
│                                      │
│ [Swipe left reveals:]                │
│                                      │
│ Shopping Drawer                      │
│ ┌──────────────────────────────┐   │
│ │ Active Products (3)           │   │
│ │                               │   │
│ │ [Img] Rose Quartz             │   │
│ │ 350K VNĐ • 23 bought 🔥 [Pin]│   │
│ │                               │   │
│ │ [Img] Trading Book            │   │
│ │ 89K VNĐ • 12 bought      [Pin]│   │
│ │                               │   │
│ │ [+ Add Product]               │   │
│ │                               │   │
│ │ 💰 Revenue: 12.5M VNĐ         │   │
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

##### Viewer View - Pinned Product
```
┌─────────────────────────────────────┐
│ [LIVE STREAM VIDEO]                  │
│                                      │
│ 🛍️ [Product Card - Pinned]          │
│ ┌────────────────────────────────┐  │
│ │ [Thumb] Rose Quartz            │  │
│ │ 350,000 VNĐ • Tap to buy       │  │
│ │ 🔥 23 people bought            │  │
│ └────────────────────────────────┘  │
│                                      │
│ Comments scrolling...                │
│ User1: Buying now! 🛍️                │
│                                      │
│ 🛍️ View All Products (3) →          │
└─────────────────────────────────────┘
```

#### 💾 DATABASE SCHEMA

```sql
-- Live shopping sessions
CREATE TABLE live_shopping_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livestream_id UUID REFERENCES livestreams(id) ON DELETE CASCADE,
  host_user_id UUID REFERENCES profiles(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  total_views INTEGER DEFAULT 0,
  total_revenue NUMERIC(12, 2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products in live session
CREATE TABLE live_shopping_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES live_shopping_sessions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0,
  live_price NUMERIC(10, 2),
  discount_percentage INTEGER,
  view_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  revenue NUMERIC(12, 2) DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  removed_at TIMESTAMPTZ
);

-- Live shopping orders
CREATE TABLE live_shopping_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES live_shopping_sessions(id),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES profiles(id),
  quantity INTEGER DEFAULT 1,
  price_paid NUMERIC(10, 2) NOT NULL,
  discount_applied NUMERIC(10, 2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  order_status TEXT DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_live_shopping_sessions_livestream ON live_shopping_sessions(livestream_id);
CREATE INDEX idx_live_shopping_products_session ON live_shopping_products(session_id);
CREATE INDEX idx_live_shopping_products_pinned ON live_shopping_products(is_pinned);
CREATE INDEX idx_live_shopping_orders_session ON live_shopping_orders(session_id);
```

---

## 2. SOUND LIBRARY (NEW)

### 2.1 OVERVIEW

**Mục đích:** Massive music catalog như TikTok - users thêm nhạc vào posts/videos.

**Features:**
- 🎵 Browse trending sounds
- 🎤 Upload original sounds  
- 🔥 Trending tracking
- 🔍 Search & filter
- 📊 Usage analytics

---

### 2.2 SCREENS

#### Sound Selection Modal
```
┌─────────────────────────────────────┐
│ ← Back    Add Sound to Post          │
├─────────────────────────────────────┤
│ 🔍 Search sounds...                  │
├─────────────────────────────────────┤
│ 📂 Browse:                           │
│ • 🔥 Trending                        │
│ • 🎤 Original Sounds                 │
│ • 🎼 By Genre                        │
│ • 💾 My Saved                        │
├─────────────────────────────────────┤
│ 🔥 TRENDING                          │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ [🎵] Chill Lo-fi Beats         │  │
│ │ @producer123                   │  │
│ │ 🔥 12.3K posts • 1:45      [♪]│  │
│ │ ▶️ Preview         [Use Sound]│  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ [🎵] Summer Vibes              │  │
│ │ @djsunset                      │  │
│ │ 🔥 8.7K posts • 2:30       [♪]│  │
│ │ ▶️ Preview         [Use Sound]│  │
│ └────────────────────────────────┘  │
│                                      │
│ [+ Upload Your Sound]                │
└─────────────────────────────────────┘
```

#### Sound Detail Page
```
┌─────────────────────────────────────┐
│ ← Back                               │
├─────────────────────────────────────┤
│ [Waveform Visualization]             │
│                                      │
│ 🎵 Chill Lo-fi Beats                 │
│ 👤 @producer123                      │
│ 📅 Nov 15, 2024                      │
│                                      │
│ ▶️ ━━━━●━━━━ 0:45 / 1:45            │
│ [🔁] [⬇️] [📤]                       │
│                                      │
├─────────────────────────────────────┤
│ 📊 Stats:                            │
│ • 12,345 posts                       │
│ • 234.5K plays                       │
│ • 8.9K saves                         │
│                                      │
│ 🏷️ #lofi #chill #study #beats       │
│ 🎼 Genre: Lo-fi Hip Hop              │
│ ⏱️ Duration: 1:45                    │
│                                      │
├─────────────────────────────────────┤
│ 🔥 TRENDING POSTS                    │
│ [Grid of thumbnails]                 │
│                                      │
│ ┌──────────────────────────────┐   │
│ │ Use This Sound                │   │
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### Upload Original Sound
```
┌─────────────────────────────────────┐
│ ← Back    Upload Sound               │
├─────────────────────────────────────┤
│ 📁 Select Audio File                 │
│ ┌────────────────────────────────┐  │
│ │ [📂 Browse]                     │  │
│ │ or drag & drop                  │  │
│ │ MP3, WAV, M4A                   │  │
│ │ Max 50MB, 5 min                 │  │
│ └────────────────────────────────┘  │
│                                      │
│ [Selected: my-track.mp3]             │
│ 🎵 2:34 • 4.2 MB                     │
│                                      │
│ Title: *                             │
│ [My Amazing Track]                   │
│                                      │
│ Description:                         │
│ [Original composition...]            │
│                                      │
│ Genre: [Lo-fi / Chill ▼]             │
│                                      │
│ Tags: [chill, study, beats, lofi]    │
│                                      │
│ ☑ I own the rights                   │
│ ☑ Allow others to use                │
│                                      │
│ ┌──────────────────────────────┐   │
│ │ 🚀 Upload Sound               │   │
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### Post with Sound Display
```
┌─────────────────────────────────────┐
│ [User] Jennie Chu • 2h               │
├─────────────────────────────────────┤
│ [Post Image/Video]                   │
│                                      │
│ ♪ ────────────────────────────── ♪  │
│ 🎵 Chill Lo-fi Beats                 │
│    by @producer123                   │
│    [Tap to see more →]               │
│ ──────────────────────────────────  │
│                                      │
│ Caption: Perfect vibes! 📈✨          │
│                                      │
│ ❤️ 234  💬 45  🔄 12  📤             │
└─────────────────────────────────────┘
```

---

### 2.3 DATABASE SCHEMA

```sql
-- Sounds catalog
CREATE TABLE sounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- seconds
  file_url TEXT NOT NULL,
  waveform_url TEXT,
  preview_url TEXT,
  
  creator_user_id UUID REFERENCES profiles(id),
  is_original BOOLEAN DEFAULT TRUE,
  
  genre TEXT,
  tags TEXT[] DEFAULT '{}',
  bpm INTEGER,
  mood TEXT,
  
  file_size BIGINT,
  format TEXT,
  bitrate INTEGER,
  sample_rate INTEGER,
  
  license_type TEXT DEFAULT 'original',
  copyright_owner TEXT,
  allow_commercial_use BOOLEAN DEFAULT TRUE,
  
  use_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  
  trending_score NUMERIC(10, 2) DEFAULT 0,
  trending_rank INTEGER,
  
  is_approved BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post sounds relationship
CREATE TABLE post_sounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  sound_id UUID REFERENCES sounds(id) ON DELETE SET NULL,
  start_time NUMERIC(10, 2),
  end_time NUMERIC(10, 2),
  volume NUMERIC(3, 2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, sound_id)
);

-- User saved sounds
CREATE TABLE user_saved_sounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sound_id UUID REFERENCES sounds(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sound_id)
);

-- Sound plays tracking
CREATE TABLE sound_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sound_id UUID REFERENCES sounds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE SET NULL,
  play_type TEXT, -- 'preview', 'post_play', 'full_play'
  play_duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trending daily stats
CREATE TABLE sound_trending_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sound_id UUID REFERENCES sounds(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  uses_count INTEGER DEFAULT 0,
  plays_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  new_posts_count INTEGER DEFAULT 0,
  trending_score NUMERIC(10, 2) DEFAULT 0,
  trending_rank INTEGER,
  growth_percentage NUMERIC(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sound_id, date)
);

-- Sound reports
CREATE TABLE sound_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sound_id UUID REFERENCES sounds(id) ON DELETE CASCADE,
  reported_by_user_id UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by_admin_id UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sound genres
CREATE TABLE sound_genres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  parent_genre_id UUID REFERENCES sound_genres(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_sounds_creator ON sounds(creator_user_id);
CREATE INDEX idx_sounds_trending_score ON sounds(trending_score DESC);
CREATE INDEX idx_sounds_genre ON sounds(genre);
CREATE INDEX idx_sounds_tags ON sounds USING GIN(tags);
CREATE INDEX idx_post_sounds_post ON post_sounds(post_id);
CREATE INDEX idx_post_sounds_sound ON post_sounds(sound_id);
CREATE INDEX idx_user_saved_sounds_user ON user_saved_sounds(user_id);
CREATE INDEX idx_sound_plays_sound ON sound_plays(sound_id);
CREATE INDEX idx_sound_trending_daily_date ON sound_trending_daily(date DESC);

-- Initial genres data
INSERT INTO sound_genres (name, slug, icon, display_order) VALUES
('Lo-fi / Chill', 'lofi-chill', '🎧', 1),
('Electronic / EDM', 'electronic-edm', '🎹', 2),
('Pop', 'pop', '🎤', 3),
('Rock', 'rock', '🎸', 4),
('Hip Hop / Rap', 'hiphop-rap', '🎤', 5),
('Classical', 'classical', '🎻', 6),
('Jazz', 'jazz', '🎷', 7),
('Ambient', 'ambient', '🌊', 8),
('Meditation', 'meditation', '🧘', 9),
('Motivational', 'motivational', '💪', 10),
('Trading Beats', 'trading-beats', '📈', 11),
('Other', 'other', '🎵', 99);
```

---

### 2.4 TRENDING ALGORITHM

```javascript
// Calculate trending scores (runs hourly)
export async function calculateTrendingScores() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];

  const { data: sounds } = await supabase
    .from('sounds')
    .select('id')
    .eq('is_approved', true);

  for (const sound of sounds) {
    const { data: todayStats } = await supabase
      .from('sound_trending_daily')
      .select('new_posts_count')
      .eq('sound_id', sound.id)
      .eq('date', today)
      .single();

    const { data: weekStats } = await supabase
      .from('sound_trending_daily')
      .select('new_posts_count')
      .eq('sound_id', sound.id)
      .gte('date', new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0]);

    const { data: yesterdayStats } = await supabase
      .from('sound_trending_daily')
      .select('new_posts_count')
      .eq('sound_id', sound.id)
      .eq('date', yesterday)
      .single();

    const usesToday = todayStats?.new_posts_count || 0;
    const usesWeek = weekStats?.reduce((sum, d) => sum + d.new_posts_count, 0) || 0;
    const usesYesterday = yesterdayStats?.new_posts_count || 0;

    // Growth rate
    const growthRate = usesYesterday > 0 
      ? ((usesToday - usesYesterday) / usesYesterday) * 100 
      : usesToday * 100;

    // Trending score formula
    const trendingScore = (usesToday * 5) + (usesWeek * 1.5) + (growthRate * 10);

    await supabase
      .from('sounds')
      .update({ trending_score: trendingScore })
      .eq('id', sound.id);
  }

  // Assign ranks
  const { data: ranked } = await supabase
    .from('sounds')
    .select('id')
    .order('trending_score', { ascending: false })
    .limit(100);

  for (let i = 0; i < ranked.length; i++) {
    await supabase
      .from('sounds')
      .update({ trending_rank: i + 1 })
      .eq('id', ranked[i].id);
  }
}
```

---

## 3. MONETIZATION FEATURES

### 3.1 BOOST POST - Paid Promotion

**Mục đích:** Users trả tiền tăng reach cho posts.

#### 📱 SCREENS

##### Boost Settings
```
┌─────────────────────────────────────┐
│ ← Back        Boost Post             │
├─────────────────────────────────────┤
│ Preview:                             │
│ [Post Preview]                       │
│                                      │
│ 💰 Budget & Duration                 │
│                                      │
│ Daily Budget:                        │
│ [- | 50,000 VNĐ | +]                 │
│ Recommended: 30K - 100K/day          │
│                                      │
│ Duration:                            │
│ • 3 days (150,000) ○                 │
│ • 7 days (350,000) ●                 │
│ • 14 days (700,000) ○                │
│                                      │
│ 🎯 Target Audience                   │
│ ● Automatic (AI targets)             │
│ ○ Custom [Edit →]                    │
│                                      │
│ 📊 Estimated Results                 │
│ 👁️ 5,000 - 8,000 people              │
│ ❤️ 250 - 400 reactions               │
│ 💬 50 - 80 comments                  │
│                                      │
│ Total: 350,000 VNĐ                   │
│ ┌──────────────────────────────┐   │
│ │ 🚀 Boost Post                 │   │
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

##### Custom Targeting
```
┌─────────────────────────────────────┐
│ ← Back    Custom Targeting           │
├─────────────────────────────────────┤
│ 📍 Location                          │
│ ● Ho Chi Minh City                   │
│ ○ Hanoi                              │
│ ○ All Vietnam                        │
│                                      │
│ 👤 Age: [18]─●────[65]               │
│                                      │
│ 💎 Interests (max 5)                 │
│ ☑ Cryptocurrency                     │
│ ☑ Crystals & Spirituality            │
│ ☑ Self-Improvement                   │
│                                      │
│ 💳 Tier Level                        │
│ ☑ FREE  ☑ TIER 1  ☑ TIER 2  ☑ TIER 3│
│                                      │
│ Estimated: 12,000 people             │
│                                      │
│ ┌──────────────────────────────┐   │
│ │ Apply                         │   │
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

##### Analytics Dashboard
```
┌─────────────────────────────────────┐
│ ← Back    Campaign Performance       │
├─────────────────────────────────────┤
│ [Post Preview]                       │
│ 🟢 Active (Day 3 of 7)               │
│                                      │
│ 💰 150K / 350K VNĐ (43%)             │
│ ▓▓▓▓▓▓▓▓░░░░░░░░                    │
│                                      │
│ 📊 Performance                       │
│ 👁️ 6,234 reach (Target: 5-8K ✅)    │
│ 💰 24 VNĐ/reach (Avg: 30 📉)         │
│ ❤️ 4.8% engagement (Avg: 2.1% 📈)   │
│ 🔄 45 shares (Best: 12 🎉)           │
│                                      │
│ 📈 Daily Breakdown                   │
│ Day 1: 1,234 reach • 52 engage       │
│ Day 2: 2,567 reach • 118 engage      │
│ Day 3: 2,433 reach • 129 engage      │
│                                      │
│ [View Full Report →]                 │
│                                      │
│ ⚙️ Actions                           │
│ • Increase Budget                    │
│ • Extend Duration                    │
│ • Edit Targeting                     │
│ • Pause / End Campaign               │
└─────────────────────────────────────┘
```

#### 💾 DATABASE SCHEMA

```sql
-- Boost campaigns
CREATE TABLE boost_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  
  total_budget NUMERIC(10, 2) NOT NULL,
  daily_budget NUMERIC(10, 2) NOT NULL,
  budget_spent NUMERIC(10, 2) DEFAULT 0,
  duration_days INTEGER NOT NULL,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  targeting_type TEXT DEFAULT 'automatic',
  targeting_config JSONB,
  target_audience_ids UUID[],
  
  status TEXT DEFAULT 'active',
  
  total_reach INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  
  likes_gained INTEGER DEFAULT 0,
  comments_gained INTEGER DEFAULT 0,
  shares_gained INTEGER DEFAULT 0,
  
  cpm NUMERIC(10, 2),
  cpc NUMERIC(10, 2),
  engagement_rate NUMERIC(5, 2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily stats
CREATE TABLE boost_campaign_daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES boost_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  budget_spent NUMERIC(10, 2) DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

-- Impressions tracking
CREATE TABLE boost_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES boost_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  position INTEGER,
  interacted BOOLEAN DEFAULT FALSE,
  interaction_type TEXT,
  cost NUMERIC(10, 2),
  UNIQUE(campaign_id, user_id)
);

-- Payments
CREATE TABLE boost_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES boost_campaigns(id),
  user_id UUID REFERENCES profiles(id),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'VND',
  payment_method TEXT,
  transaction_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_boost_campaigns_post ON boost_campaigns(post_id);
CREATE INDEX idx_boost_campaigns_user ON boost_campaigns(user_id);
CREATE INDEX idx_boost_campaigns_status ON boost_campaigns(status);
CREATE INDEX idx_boost_campaigns_dates ON boost_campaigns(start_date, end_date);
CREATE INDEX idx_boost_daily_stats_campaign ON boost_campaign_daily_stats(campaign_id);
CREATE INDEX idx_boost_impressions_campaign ON boost_impressions(campaign_id);
```

#### 🔧 BOOST ALGORITHM

```javascript
// Boost Post Engine
class BoostPostEngine {
  constructor(post, budget, duration, targeting) {
    this.post = post;
    this.dailyBudget = budget / duration;
    this.duration = duration;
    this.targeting = targeting;
    this.totalBudget = budget;
  }

  estimateReach() {
    const baseCPM = 25000; // 25K VNĐ per 1000 impressions
    let adjustedCPM = baseCPM;
    
    if (this.targeting.type === 'custom') {
      adjustedCPM *= 1.3; // More specific = higher CPM
    }
    
    const totalImpressions = (this.totalBudget / adjustedCPM) * 1000;
    const estimatedReach = Math.floor(totalImpressions * 0.75);
    
    return {
      min: Math.floor(estimatedReach * 0.8),
      max: Math.floor(estimatedReach * 1.2),
      average: estimatedReach
    };
  }

  estimateEngagement() {
    const reach = this.estimateReach().average;
    const postQuality = this.calculatePostQuality();
    const baseRate = 0.03 + (postQuality * 0.02); // 3-7%
    const total = Math.floor(reach * baseRate);
    
    return {
      likes: Math.floor(total * 0.6),
      comments: Math.floor(total * 0.25),
      shares: Math.floor(total * 0.15)
    };
  }

  calculatePostQuality() {
    let score = 0.5;
    if (this.post.media_urls?.length > 0) score += 0.2;
    if (this.post.product_tags?.length > 0) score += 0.1;
    const len = this.post.content?.length || 0;
    if (len >= 100 && len <= 300) score += 0.1;
    const hashtags = this.post.hashtags?.length || 0;
    if (hashtags >= 3 && hashtags <= 5) score += 0.1;
    return Math.min(score, 1);
  }

  async selectAudience() {
    if (this.targeting.type === 'automatic') {
      return this.selectAutomaticAudience();
    }
    return this.selectCustomAudience();
  }

  async selectAutomaticAudience() {
    const interests = this.extractInterests(this.post);
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .or(interests.map(i => `interests.cs.{${i}}`).join(','))
      .limit(10000);
    return data.map(u => u.id);
  }

  async selectCustomAudience() {
    let query = supabase.from('profiles').select('id');
    
    if (this.targeting.location) {
      query = query.eq('location', this.targeting.location);
    }
    if (this.targeting.ageRange) {
      query = query
        .gte('age', this.targeting.ageRange.min)
        .lte('age', this.targeting.ageRange.max);
    }
    if (this.targeting.interests?.length > 0) {
      query = query.overlaps('interests', this.targeting.interests);
    }
    if (this.targeting.tierLevels?.length > 0) {
      query = query.in('scanner_tier', this.targeting.tierLevels);
    }
    
    const { data } = await query.limit(50000);
    return data.map(u => u.id);
  }

  extractInterests(post) {
    const interests = [];
    const content = (post.content + ' ' + post.title).toLowerCase();
    const map = {
      'crypto': ['crypto', 'bitcoin', 'trading'],
      'crystal': ['crystal', 'gemstone', 'quartz'],
      'spiritual': ['spiritual', 'meditation', 'chakra'],
      'trading': ['trade', 'market', 'chart']
    };
    
    for (const [interest, keywords] of Object.entries(map)) {
      if (keywords.some(k => content.includes(k))) {
        interests.push(interest);
      }
    }
    return interests;
  }

  distributeBudget() {
    const distribution = [];
    for (let day = 0; day < this.duration; day++) {
      let multiplier = 1.0;
      if (day < 2) multiplier = 1.3; // First 2 days boost
      else if (day === this.duration - 1) multiplier = 1.2; // Last day push
      
      distribution.push({
        day: day + 1,
        budget: this.dailyBudget * multiplier
      });
    }
    
    const total = distribution.reduce((sum, d) => sum + d.budget, 0);
    const factor = this.totalBudget / total;
    distribution.forEach(d => d.budget = Math.floor(d.budget * factor));
    
    return distribution;
  }
}
```

---

### 3.2 CREATE AD FROM POST

**Mục đích:** Convert successful post thành ad campaign với CTA button, tracking, conversion goals.

**Key Differences:**
- Boost Post: Tăng reach cho post hiện tại
- Ad Campaign: Post becomes ad với CTA, tracking pixel, conversion tracking

**Features:**
- Choose objective (Engagement/Traffic/Conversions/Installs)
- Add CTA button (Learn More/Shop Now/Sign Up/Download)
- Set destination URL
- Track conversions

---

## 4. INTERACTION FEATURES

### 4.1 SHARE TO EXTERNAL APPS

**Mục đích:** Share posts ra WhatsApp, Messenger, Email, SMS.

#### 📱 SCREEN

```
┌─────────────────────────────────────┐
│ Share Post                           │
├─────────────────────────────────────┤
│ Share to:                            │
│                                      │
│ [📱 WhatsApp]  [💬 Messenger]        │
│ [📧 Email]     [💬 SMS]              │
│ [📋 Copy Link]                       │
│                                      │
│ Or share within GEM:                 │
│ [🔄 Share to Feed]                   │
│ [📨 Send to Friends]                 │
└─────────────────────────────────────┘
```

#### 🔧 IMPLEMENTATION

```javascript
import { Share } from 'react-native';

export async function shareToExternal(post) {
  const shareUrl = await generateDynamicLink({
    type: 'post',
    id: post.id,
    title: post.title,
    description: post.content.substring(0, 150),
    image: post.image_url
  });

  const message = `Check out this post from GEM!\n\n${post.title}\n\n${shareUrl}`;

  const result = await Share.share({
    message: message,
    url: shareUrl,
    title: post.title
  });

  if (result.action === Share.sharedAction) {
    await trackShare(post.id, 'external', result.activityType);
  }

  return result;
}
```

#### 💾 DATABASE

```sql
CREATE TABLE external_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  platform TEXT NOT NULL, -- 'whatsapp', 'messenger', 'email', 'sms'
  share_link TEXT,
  views_from_share INTEGER DEFAULT 0,
  clicks_from_share INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_external_shares_post ON external_shares(post_id);
CREATE INDEX idx_external_shares_platform ON external_shares(platform);
```

---

### 4.2 SHARE TO FEED (REPOST)

**Mục đích:** Repost/quote share post của người khác lên feed của mình.

#### 📱 SCREEN

```
┌─────────────────────────────────────┐
│ Share to Your Feed                   │
├─────────────────────────────────────┤
│ [Original Post Preview]              │
│ ┌────────────────────────────────┐  │
│ │ @jenniechu posted:              │  │
│ │ [Image] "Crystals! 🔮"          │  │
│ └────────────────────────────────┘  │
│                                      │
│ Add your thoughts:                   │
│ [This is amazing! Recommend...]      │
│                                      │
│ • Your Feed (Public) ●               │
│ • Friends Only ○                     │
│                                      │
│ ┌──────────────────────────────┐   │
│ │ Share Now                     │   │
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘

[After sharing - Feed display:]
┌─────────────────────────────────────┐
│ [You] You • Just now                 │
├─────────────────────────────────────┤
│ This is amazing! Highly recommend... │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ 🔄 Shared @jenniechu's post     │  │
│ │ ────────────────────────────── │  │
│ │ [Embedded Original Post]        │  │
│ │ [Image] "Crystals! 🔮"          │  │
│ │ ❤️ 234  💬 45                   │  │
│ └────────────────────────────────┘  │
│                                      │
│ ❤️ 12  💬 3  🔄 1                    │
└─────────────────────────────────────┘
```

#### 💾 DATABASE

```sql
CREATE TABLE post_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  shared_by_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  share_type TEXT DEFAULT 'repost', -- 'repost', 'quote'
  quote_text TEXT,
  new_post_id UUID REFERENCES forum_posts(id) ON DELETE SET NULL,
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(original_post_id, shared_by_user_id)
);

CREATE INDEX idx_post_shares_original ON post_shares(original_post_id);
CREATE INDEX idx_post_shares_shared_by ON post_shares(shared_by_user_id);
```

---

### 4.3 PIN COMMENTS

**Mục đích:** Creator pin important comment lên đầu.

#### 📱 SCREEN

```
[Long press comment] →
┌─────────────────────────────────────┐
│ Comment Options                      │
├─────────────────────────────────────┤
│ 📌 Pin Comment                       │
│ 🗑️ Delete Comment                    │
│ 🚫 Block User                        │
└─────────────────────────────────────┘

[After pinning:]
┌─────────────────────────────────────┐
│ 📌 PINNED BY CREATOR                 │
│ ┌────────────────────────────────┐  │
│ │ [Avatar] User123               │  │
│ │ This is so helpful! Thanks!    │  │
│ │ ❤️ 45  💬 Reply                │  │
│ └────────────────────────────────┘  │
│                                      │
│ Other Comments (23)                  │
│ ...                                  │
└─────────────────────────────────────┘
```

#### 💾 DATABASE

```sql
ALTER TABLE comments ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE comments ADD COLUMN pinned_at TIMESTAMPTZ;
ALTER TABLE comments ADD COLUMN pinned_by_user_id UUID REFERENCES profiles(id);

-- Only one pinned per post
CREATE UNIQUE INDEX idx_one_pinned_per_post 
  ON comments(post_id) 
  WHERE is_pinned = TRUE;
```

---

### 4.4 DELETE COMMENTS

**Mục đích:** Creator hoặc comment author có thể xóa comment.

#### 🔧 LOGIC

```javascript
export async function deleteComment(postId, commentId, userId) {
  const { data: comment } = await supabase
    .from('comments')
    .select('user_id, post_id')
    .eq('id', commentId)
    .single();

  const { data: post } = await supabase
    .from('forum_posts')
    .select('user_id')
    .eq('id', postId)
    .single();

  // Check authorization
  if (comment.user_id !== userId && post.user_id !== userId) {
    throw new Error('Not authorized');
  }

  // Soft delete
  await supabase
    .from('comments')
    .update({ 
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by_user_id: userId
    })
    .eq('id', commentId);

  // Decrement count
  await supabase.rpc('decrement_comment_count', { post_uuid: postId });

  return { success: true };
}
```

---

### 4.5 REPORT COMMENTS

**Mục đích:** Users báo cáo spam/inappropriate comments.

#### 📱 SCREEN

```
┌─────────────────────────────────────┐
│ Report Comment                       │
├─────────────────────────────────────┤
│ Why are you reporting?               │
│                                      │
│ ○ Spam                               │
│ ○ Harassment                         │
│ ○ Hate speech                        │
│ ○ Violence                           │
│ ○ False information                  │
│ ○ Scam                               │
│ ○ Other                              │
│                                      │
│ Details (optional):                  │
│ [                    ]               │
│                                      │
│ [Cancel]  [Submit]                   │
└─────────────────────────────────────┘

[After submitting:]
┌─────────────────────────────────────┐
│ ✅ Thank You                         │
│ We've received your report.          │
│                                      │
│ Meanwhile:                           │
│ • Hide this comment                  │
│ • Block the user                     │
│                                      │
│ [Done]                               │
└─────────────────────────────────────┘
```

#### 💾 DATABASE

```sql
CREATE TABLE comment_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reported_by_user_id UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by_admin_id UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comment_reports_comment ON comment_reports(comment_id);
CREATE INDEX idx_comment_reports_status ON comment_reports(status);
```

#### 🔧 AUTO-HIDE LOGIC

```javascript
// If 3+ reports, auto-hide pending review
export async function reportComment(commentId, userId, reason, details) {
  await supabase
    .from('comment_reports')
    .insert({
      comment_id: commentId,
      reported_by_user_id: userId,
      reason: reason,
      details: details
    });

  const { count } = await supabase
    .from('comment_reports')
    .select('id', { count: 'exact' })
    .eq('comment_id', commentId)
    .eq('status', 'pending');

  if (count >= 3) {
    await supabase
      .from('comments')
      .update({ 
        is_hidden: true,
        hidden_reason: 'multiple_reports'
      })
      .eq('id', commentId);

    await notifyAdmins({
      type: 'comment_auto_hidden',
      commentId: commentId,
      reportCount: count
    });
  }

  return { success: true };
}
```

---

### 4.6 SEE WHO REACTED

**Mục đích:** View danh sách users đã react vào post.

#### 📱 SCREEN

```
[Tap "234 likes"] →
┌─────────────────────────────────────┐
│ ← Back        Reactions              │
├─────────────────────────────────────┤
│ ❤️ All (234) | 👍 (89) | 🔥 (45)    │
├─────────────────────────────────────┤
│ ┌────────────────────────────────┐  │
│ │ [Avatar] Jennie Chu            │  │
│ │ @jenniechu                     │  │
│ │ 🔮 Gemral    [Follow] ❤️   │  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ [Avatar] User123               │  │
│ │ @user123                       │  │
│ │ TIER 2         [Following] 👍  │  │
│ └────────────────────────────────┘  │
│                                      │
│ [Load more...]                       │
└─────────────────────────────────────┘
```

#### 🔧 IMPLEMENTATION

```javascript
export async function getPostReactions(postId, reactionType = null, limit = 50, offset = 0) {
  let query = supabase
    .from('post_interactions')
    .select(`
      id,
      interaction_type,
      created_at,
      profiles:user_id (
        id,
        username,
        avatar_url,
        is_gem_master,
        scanner_tier
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (reactionType) {
    query = query.eq('interaction_type', reactionType);
  } else {
    query = query.in('interaction_type', ['like', 'love', 'fire', 'wow']);
  }

  const { data, error } = await query;
  if (error) throw error;

  return {
    reactions: data,
    hasMore: data.length === limit
  };
}
```

---

## 5. PRIVACY & AUDIENCE SETTINGS

### 5.1 POST VISIBILITY CONTROLS

#### 📱 SCREEN

```
┌─────────────────────────────────────┐
│ ⚙️ Privacy Settings                  │
├─────────────────────────────────────┤
│ Who can see this post?               │
│                                      │
│ ● 🌐 Public                          │
│   Anyone on GEM                      │
│                                      │
│ ○ 👥 Friends/Followers Only          │
│   Only people who follow you         │
│                                      │
│ ○ 🔒 Private                         │
│   Only you                           │
│                                      │
├─────────────────────────────────────┤
│ Advanced:                            │
│                                      │
│ Who can comment?                     │
│ • Everyone ●                         │
│ • Friends Only                       │
│ • Off                                │
│                                      │
│ Who can share?                       │
│ • Everyone ●                         │
│ • Friends Only                       │
│ • Off                                │
│                                      │
│ ☑ Allow save                         │
│ ☑ Show counts                        │
│                                      │
│ [Save]                               │
└─────────────────────────────────────┘
```

#### 💾 DATABASE

```sql
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS can_comment TEXT DEFAULT 'everyone';
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS can_share TEXT DEFAULT 'everyone';
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS allow_save BOOLEAN DEFAULT TRUE;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS show_counts BOOLEAN DEFAULT TRUE;

CREATE INDEX idx_posts_visibility ON forum_posts(visibility);

ALTER TABLE forum_posts ADD CONSTRAINT check_visibility 
  CHECK (visibility IN ('public', 'friends', 'private'));
ALTER TABLE forum_posts ADD CONSTRAINT check_can_comment 
  CHECK (can_comment IN ('everyone', 'friends', 'off'));
ALTER TABLE forum_posts ADD CONSTRAINT check_can_share 
  CHECK (can_share IN ('everyone', 'friends', 'off'));
```

#### 🔧 PERMISSION CHECK

```javascript
export async function canUserInteractWithPost(userId, postId, actionType) {
  const { data: post } = await supabase
    .from('forum_posts')
    .select('user_id, visibility, can_comment, can_share')
    .eq('id', postId)
    .single();

  // Own post - allow
  if (post.user_id === userId) return true;

  // Check visibility
  if (post.visibility === 'private') return false;

  if (post.visibility === 'friends') {
    const isFollowing = await checkIfFollowing(userId, post.user_id);
    if (!isFollowing) return false;
  }

  // Check action permissions
  if (actionType === 'comment') {
    if (post.can_comment === 'off') return false;
    if (post.can_comment === 'friends') {
      return await checkIfFollowing(userId, post.user_id);
    }
  }

  if (actionType === 'share') {
    if (post.can_share === 'off') return false;
    if (post.can_share === 'friends') {
      return await checkIfFollowing(userId, post.user_id);
    }
  }

  return true;
}
```

---

## 6. GIFTING SYSTEM

### 6.1 VIRTUAL CURRENCY

**Mục đích:** Users mua coins → Send gifts cho creators → Creators earn money (giống TikTok).

#### 📱 SCREENS

##### Send Gift Button in Post
```
┌─────────────────────────────────────┐
│ [Post Content]                       │
├─────────────────────────────────────┤
│ ❤️ 234  💬 45  🔄 12  🎁 Gift        │
└─────────────────────────────────────┘

[Tap "Gift" →]
```

##### Gift Selection Sheet
```
┌─────────────────────────────────────┐
│               ──────                 │
│ Send a Gift to @jenniechu            │
│                                      │
│ Your Balance: 💎 1,250 coins         │
│ [+ Buy More]                         │
├─────────────────────────────────────┤
│ Gifts:                               │
│                                      │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│ │ 🌹   │ │ 💎   │ │ 👑   │ │ 🦄   ││
│ │ Rose │ │ Gem  │ │Crown │ │Unicorn││
│ │ 10💎 │ │ 50💎 │ │500💎 │ │5K💎  ││
│ └──────┘ └──────┘ └──────┘ └──────┘│
│                                      │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│ │ ⭐   │ │ 🔥   │ │ 🚀   │ │ 🎊   ││
│ │ Star │ │ Fire │ │Rocket│ │Party ││
│ │ 20💎 │ │100💎 │ │1K💎  │ │10K💎 ││
│ └──────┘ └──────┘ └──────┘ └──────┘│
│                                      │
│ Quantity: [- | 1 | +]                │
│ Total: 50 💎                         │
│                                      │
│ ☑ Show my name                       │
│                                      │
│ ┌──────────────────────────────┐   │
│ │ Send Gift                     │   │
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

##### Buy Coins Shop
```
┌─────────────────────────────────────┐
│ ← Back        Buy Coins              │
├─────────────────────────────────────┤
│ Balance: 💎 1,250                    │
├─────────────────────────────────────┤
│ Packages:                            │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ 💎 100 coins                    │  │
│ │ 10,000 VNĐ          [Buy]      │  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ 💎 500 coins                    │  │
│ │ 45,000 VNĐ (Save 10%) [Buy]    │  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ 💎 1,000 coins                  │  │
│ │ 85,000 VNĐ (Save 15%) [Buy]    │  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ 💎 5,000 coins 🌟 BEST          │  │
│ │ 400,000 VNĐ (Save 20%) [Buy]   │  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ 💎 10,000 coins 🔥 POPULAR      │  │
│ │ 750,000 VNĐ (Save 25%) [Buy]   │  │
│ └────────────────────────────────┘  │
│                                      │
│ Payment: [💳 MoMo] [🏦 Bank]         │
└─────────────────────────────────────┘
```

##### Creator Earnings Dashboard
```
┌─────────────────────────────────────┐
│ ← Back        My Gifts               │
├─────────────────────────────────────┤
│ This Month:                          │
│ 💎 12,450 coins received             │
│ 💰 2,490,000 VNĐ (gross)             │
│                                      │
│ ┌──────────────────────────────┐   │
│ │ Available to Withdraw:        │   │
│ │ 💰 2,100,000 VNĐ              │   │
│ │ (Next payout: Dec 1)          │   │
│ │ [Withdraw to Bank]            │   │
│ └──────────────────────────────┘   │
│                                      │
├─────────────────────────────────────┤
│ Recent Gifts:                        │
│                                      │
│ Nov 27 • @user123 sent 🦄            │
│ 5,000 💎 (1,000,000 VNĐ)             │
│                                      │
│ Nov 26 • @crypto99 sent 👑           │
│ 500 💎 (100,000 VNĐ)                 │
│                                      │
│ Nov 26 • Anonymous sent 💎           │
│ 50 💎 (10,000 VNĐ)                   │
│                                      │
│ [View All]                           │
│                                      │
├─────────────────────────────────────┤
│ Top Gifters:                         │
│ 🥇 @user123     15,000 💎            │
│ 🥈 @crypto99    8,500 💎             │
│ 🥉 @trader456   6,200 💎             │
└─────────────────────────────────────┘
```

---

### 6.2 DATABASE SCHEMA

```sql
-- Coin accounts
CREATE TABLE coin_accounts (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  lifetime_purchased INTEGER DEFAULT 0,
  lifetime_received INTEGER DEFAULT 0,
  lifetime_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coin purchases
CREATE TABLE coin_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  coins_amount INTEGER NOT NULL,
  price_vnd NUMERIC(10, 2) NOT NULL,
  bonus_coins INTEGER DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  transaction_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- Gift types catalog
CREATE TABLE gift_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL,
  coin_price INTEGER NOT NULL,
  rarity TEXT DEFAULT 'common',
  animation_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gifts sent
CREATE TABLE gifts_sent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gift_type_id UUID REFERENCES gift_types(id),
  quantity INTEGER DEFAULT 1,
  total_coins INTEGER NOT NULL,
  context_type TEXT NOT NULL, -- 'post', 'comment', 'livestream'
  post_id UUID REFERENCES forum_posts(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  livestream_id UUID REFERENCES livestreams(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator earnings
CREATE TABLE creator_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_coins_received INTEGER DEFAULT 0,
  total_vnd_earned NUMERIC(12, 2) DEFAULT 0,
  platform_fee_percentage NUMERIC(5, 2) DEFAULT 30,
  platform_fee_vnd NUMERIC(12, 2) DEFAULT 0,
  payout_amount_vnd NUMERIC(12, 2) DEFAULT 0,
  payout_status TEXT DEFAULT 'pending',
  payout_method TEXT,
  payout_reference TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_start, period_end)
);

-- Withdrawal requests
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount_vnd NUMERIC(12, 2) NOT NULL,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  processed_by_admin_id UUID REFERENCES profiles(id),
  processed_at TIMESTAMPTZ,
  transaction_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_coin_purchases_user ON coin_purchases(user_id);
CREATE INDEX idx_gifts_sent_sender ON gifts_sent(sender_user_id);
CREATE INDEX idx_gifts_sent_receiver ON gifts_sent(receiver_user_id);
CREATE INDEX idx_gifts_sent_context ON gifts_sent(context_type, post_id);
CREATE INDEX idx_creator_earnings_user ON creator_earnings(user_id);
CREATE INDEX idx_withdrawal_requests_user ON withdrawal_requests(user_id);

-- Initial gift types
INSERT INTO gift_types (name, emoji, coin_price, rarity, display_order) VALUES
('rose', '🌹', 10, 'common', 1),
('star', '⭐', 20, 'common', 2),
('gem', '💎', 50, 'rare', 3),
('fire', '🔥', 100, 'rare', 4),
('crown', '👑', 500, 'epic', 5),
('rocket', '🚀', 1000, 'epic', 6),
('unicorn', '🦄', 5000, 'legendary', 7),
('party', '🎊', 10000, 'legendary', 8);
```

---

### 6.3 GIFTING LOGIC

```javascript
// Send gift
export async function sendGift({
  senderUserId,
  receiverUserId,
  giftTypeId,
  quantity = 1,
  contextType,
  contextId,
  isAnonymous = false
}) {
  // Get gift details
  const { data: giftType } = await supabase
    .from('gift_types')
    .select('*')
    .eq('id', giftTypeId)
    .single();

  const totalCost = giftType.coin_price * quantity;

  // Check balance
  const { data: account } = await supabase
    .from('coin_accounts')
    .select('balance')
    .eq('user_id', senderUserId)
    .single();

  if (account.balance < totalCost) {
    throw new Error('Insufficient coins');
  }

  // Deduct from sender
  await supabase
    .from('coin_accounts')
    .update({
      balance: account.balance - totalCost,
      lifetime_sent: supabase.raw(`lifetime_sent + ${totalCost}`)
    })
    .eq('user_id', senderUserId);

  // Add to receiver
  await supabase
    .from('coin_accounts')
    .upsert({
      user_id: receiverUserId,
      lifetime_received: supabase.raw(`COALESCE(lifetime_received, 0) + ${totalCost}`)
    }, { onConflict: 'user_id' });

  // Record transaction
  const { data: gift } = await supabase
    .from('gifts_sent')
    .insert({
      sender_user_id: senderUserId,
      receiver_user_id: receiverUserId,
      gift_type_id: giftTypeId,
      quantity: quantity,
      total_coins: totalCost,
      context_type: contextType,
      post_id: contextType === 'post' ? contextId : null,
      livestream_id: contextType === 'livestream' ? contextId : null,
      is_anonymous: isAnonymous
    })
    .select()
    .single();

  // Notify receiver
  if (!isAnonymous) {
    await sendNotification({
      userId: receiverUserId,
      type: 'gift_received',
      data: { giftName: giftType.name, giftEmoji: giftType.emoji }
    });
  }

  // Broadcast to livestream if applicable
  if (contextType === 'livestream') {
    await broadcastToLivestream(contextId, {
      type: 'gift_sent',
      senderUsername: isAnonymous ? 'Anonymous' : senderUsername,
      giftEmoji: giftType.emoji,
      quantity: quantity
    });
  }

  return { success: true, gift, newBalance: account.balance - totalCost };
}

// Calculate earnings
export async function calculateCreatorEarnings(userId, periodStart, periodEnd) {
  const { data: gifts } = await supabase
    .from('gifts_sent')
    .select('total_coins')
    .eq('receiver_user_id', userId)
    .gte('created_at', periodStart)
    .lte('created_at', periodEnd)
    .eq('status', 'completed');

  const totalCoins = gifts.reduce((sum, g) => sum + g.total_coins, 0);
  const COIN_TO_VND = 200; // 1 coin = 200 VNĐ
  const totalVnd = totalCoins * COIN_TO_VND;
  const platformFee = totalVnd * 0.3; // 30%
  const payout = totalVnd - platformFee;

  const { data: earnings } = await supabase
    .from('creator_earnings')
    .upsert({
      user_id: userId,
      period_start: periodStart,
      period_end: periodEnd,
      total_coins_received: totalCoins,
      total_vnd_earned: totalVnd,
      platform_fee_percentage: 30,
      platform_fee_vnd: platformFee,
      payout_amount_vnd: payout,
      payout_status: 'pending'
    }, { onConflict: 'user_id,period_start,period_end' })
    .select()
    .single();

  return earnings;
}

// Request withdrawal
export async function requestWithdrawal(userId, amount, bankDetails) {
  const currentMonth = new Date().toISOString().substring(0, 7);
  
  const { data: earnings } = await supabase
    .from('creator_earnings')
    .select('payout_amount_vnd')
    .eq('user_id', userId)
    .eq('payout_status', 'pending')
    .gte('period_start', `${currentMonth}-01`)
    .single();

  if (!earnings || earnings.payout_amount_vnd < amount) {
    throw new Error('Insufficient earnings');
  }

  const { data: withdrawal } = await supabase
    .from('withdrawal_requests')
    .insert({
      user_id: userId,
      amount_vnd: amount,
      bank_name: bankDetails.bankName,
      bank_account_number: bankDetails.accountNumber,
      bank_account_name: bankDetails.accountName,
      status: 'pending'
    })
    .select()
    .single();

  await notifyAdmins({
    type: 'withdrawal_requested',
    userId: userId,
    amount: amount,
    withdrawalId: withdrawal.id
  });

  return withdrawal;
}
```

---

## 7. DATABASE SCHEMA COMPLETE

**TOTAL TABLES: 40+**

### Shopping (10 tables)
```
1. products
2. product_categories
3. post_product_tags
4. product_tag_interactions
5. shopping_cart
6. shopee_product_sync
7. live_shopping_sessions
8. live_shopping_products
9. live_shopping_orders
10. live_shopping_interactions
```

### Sound Library (7 tables)
```
11. sounds
12. post_sounds
13. user_saved_sounds
14. sound_plays
15. sound_trending_daily
16. sound_reports
17. sound_genres
```

### Monetization (4 tables)
```
18. boost_campaigns
19. boost_campaign_daily_stats
20. boost_impressions
21. boost_payments
```

### Interactions (3 tables)
```
22. external_shares
23. post_shares
24. comment_reports
```

### Privacy (Updates to existing)
```
25. forum_posts (add columns)
26. comments (add columns)
```

### Gifting (6 tables)
```
27. coin_accounts
28. coin_purchases
29. gift_types
30. gifts_sent
31. creator_earnings
32. withdrawal_requests
```

### Existing Core Tables
```
33. profiles
34. forum_posts
35. comments
36. post_interactions
37. categories
38. livestreams
39. feed_impressions
40. user_feed_preferences
... (more)
```

---

## 8. IMPLEMENTATION TIMELINE

### Week 1-2: Shopping Features
```
✅ Shopee API integration
✅ Product sync (cron every 6 hours)
✅ Shopping tags in posts
✅ Product search & browse
✅ Shopping cart
✅ Live shopping basic
```

### Week 2-3: Sound Library
```
✅ Sound database tables
✅ Sound upload system (S3/CDN)
✅ Waveform generation
✅ Sound player component
✅ Browse/search sounds
✅ Trending algorithm
✅ Genre filtering
```

### Week 4-5: Monetization
```
✅ Boost post system
✅ AI audience targeting
✅ Budget distribution
✅ MoMo payment integration
✅ Bank transfer
✅ Analytics dashboard
```

### Week 6: Interactions
```
✅ Share to external apps
✅ Share to feed (repost)
✅ Pin comments
✅ Delete comments
✅ Report system
✅ See who reacted
```

### Week 7: Privacy & Gifting
```
✅ Privacy controls
✅ Permission checks
✅ Coin purchase system
✅ Gift catalog
✅ Send gifts
✅ Creator earnings
✅ Withdrawal requests
```

### Week 8: Polish & Launch
```
✅ Testing all features
✅ Bug fixes
✅ Performance optimization
✅ Admin dashboard
✅ Documentation
✅ Soft launch
```

**TOTAL: 8 weeks**

---

## 9. TESTING CHECKLIST

### Shopping ✅
```
□ Tag product in post
□ Search Shopee products
□ View product details
□ Add to cart
□ Buy now (Shopee redirect)
□ Track affiliate clicks
□ Shopee sync working
□ Live shopping host panel
□ Live shopping viewer
□ Real-time purchases
```

### Sound Library ✅
```
□ Browse trending sounds
□ Search sounds
□ Filter by genre
□ Preview sound
□ Save sound
□ Upload original sound
□ Sound plays in post
□ Waveform displays
□ Trending calculation
□ Sound analytics
```

### Monetization ✅
```
□ Create boost campaign
□ Set budget & duration
□ Auto/custom targeting
□ Pay via MoMo
□ Pay via bank transfer
□ Boosted post in feed
□ Track impressions
□ View analytics
□ Pause/end campaign
```

### Interactions ✅
```
□ Share to WhatsApp
□ Share to Messenger
□ Share to feed (repost)
□ Pin comment
□ Delete comment
□ Report comment
□ View who reacted
□ Filter reactions
```

### Privacy ✅
```
□ Set post visibility
□ Friends-only visible to followers only
□ Private post only to author
□ Comment permission enforced
□ Share permission enforced
```

### Gifting ✅
```
□ Buy coins (MoMo)
□ Buy coins (Bank)
□ Send gift to post
□ Send gift to livestream
□ View gift animation
□ Receive gift notification
□ View earnings
□ Request withdrawal
□ Admin process payout
```

---

## 📊 SUMMARY

**Tổng số tính năng:** 12 major features
**Tổng số tables:** 40+ tables
**Timeline:** 8 weeks
**Team size:** 2-3 developers
**Budget estimate:** 150-200M VNĐ (contractors)

**Revenue potential (Month 6):**
- Shopping: 40M VNĐ/month
- Boost: 12M VNĐ/month
- Gifting: 80M VNĐ/month
- Live Shopping: 20M VNĐ/month
**Total: ~150M VNĐ/month**

**Ready for Claude Code implementation!** ✅

---

**End of Complete Features Plan**
