# 📊 DATA SOURCES - SINGLE SOURCE OF TRUTH

> **AUTO-GENERATED FROM PROJECT SCAN**
> **Last Updated:** 2025-12-11
> **Project:** Gemral Mobile App (gem-mobile)

---

## 📋 SUMMARY

| Metric | Count |
|--------|-------|
| Total Tables | 127 |
| Total Services | 101 |
| Total Exported Functions | 353+ |
| Migration Files | 179 |
| Potential Conflicts | 3 (documented below) |

---

## 🗄️ DATABASE TABLES

### Core User Tables

#### `profiles` (PRIMARY USER TABLE)
> **⚠️ USE THIS TABLE FOR ALL USER DATA**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (same as auth.users.id) |
| `email` | TEXT | User email |
| `full_name` | TEXT | Full name |
| `display_name` | TEXT | Display name |
| `avatar_url` | TEXT | Avatar image URL |
| `bio` | TEXT | User bio |
| `role` | VARCHAR(20) | 'user', 'admin', 'teacher', 'manager' |
| `is_admin` | BOOLEAN | Admin flag |
| `scanner_tier` | VARCHAR(20) | Scanner access tier |
| `chatbot_tier` | VARCHAR(20) | Chatbot access tier |
| `course_tier` | VARCHAR(20) | Course access tier |
| `tier_expires_at` | TIMESTAMPTZ | Tier expiration |
| `gems` | INT | **PRIMARY gem balance (SINGLE SOURCE OF TRUTH)** |
| `referral_code` | TEXT | Unique affiliate code |
| `referred_by` | UUID | Referrer user ID |
| `expo_push_token` | TEXT | Push notification token |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update |

**Used by:** Almost all services
**Status:** ✅ ACTIVE - PRIMARY TABLE

---

### Gem Economy Tables

#### `gems_transactions` (PRIMARY TRANSACTION LOG)
> **⚠️ USE THIS FOR ALL GEM TRANSACTION LOGS**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `type` | TEXT | 'credit', 'debit', 'purchase', 'gift_sent', etc. |
| `amount` | INT | Transaction amount |
| `description` | TEXT | Transaction description |
| `reference_type` | TEXT | 'shopify_order', 'gift', 'boost', etc. |
| `reference_id` | TEXT | Reference ID |
| `balance_before` | INT | Balance before transaction |
| `balance_after` | INT | Balance after transaction |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMPTZ | Timestamp |

**Used by:** gemEconomyService, walletService, Shopify webhook
**Status:** ✅ ACTIVE - PRIMARY TRANSACTION LOG

#### `gem_packs`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Pack name |
| `gems_quantity` | INT | Base gems |
| `bonus_gems` | INT | Bonus gems |
| `total_gems` | INT | Total gems (base + bonus) |
| `price` | INT | Price in VND |
| `shopify_variant_id` | TEXT | Shopify variant ID |
| `display_order` | INT | Sort order |
| `is_active` | BOOLEAN | Active status |

**Used by:** gemEconomyService, BuyGemsScreen
**Status:** ✅ ACTIVE

#### `user_wallets` (LEGACY - SYNCED)
> **⚠️ DO NOT UPDATE DIRECTLY - Use profiles.gems instead**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `gem_balance` | INT | **SYNCED from profiles.gems via trigger** |
| `diamond_balance` | INT | Diamond balance |
| `total_earned` | INT | Total gems earned |
| `total_spent` | INT | Total gems spent |

**Used by:** walletService (legacy)
**Status:** ⚠️ DEPRECATED - Kept for backwards compatibility

#### `wallet_transactions` (LEGACY)
> **⚠️ USE gems_transactions instead**

**Status:** ❌ DEPRECATED - Use gems_transactions

#### `currency_packages` (LEGACY)
> **⚠️ USE gem_packs instead**

**Status:** ❌ DEPRECATED - Use gem_packs

---

### Forum & Social Tables

#### `forum_posts`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Author user ID |
| `content` | TEXT | Post content |
| `media_urls` | TEXT[] | Media attachments |
| `category` | TEXT | Post category |
| `likes_count` | INT | Cached like count |
| `comments_count` | INT | Cached comment count |
| `is_boosted` | BOOLEAN | Boost status |

**Used by:** forumService, feedService, analyticsService
**Status:** ✅ ACTIVE

#### `forum_comments`
#### `forum_likes`
#### `forum_saved`
#### `user_follows`
#### `reposts`
#### `post_boosts`
#### `post_views`
#### `post_interactions`

---

### Course System Tables

#### `courses`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Course title |
| `description` | TEXT | Course description |
| `price` | INT | Price in VND |
| `tier_required` | VARCHAR | Minimum tier required |
| `shopify_product_id` | TEXT | Shopify product ID |
| `created_by` | UUID | Creator user ID |

**Used by:** courseService, courseBuilderService, courseAccessService
**Status:** ✅ ACTIVE

#### `course_modules`
#### `course_lessons`
#### `course_enrollments`
#### `course_teachers`
#### `lesson_progress`
#### `lesson_attachments`
#### `quizzes`
#### `quiz_attempts`
#### `course_certificates`

---

### Vision Board Tables (prefix: vision_)

#### `vision_goals`
#### `vision_actions`
#### `vision_action_logs`
#### `vision_habits`
#### `vision_habit_logs`
#### `vision_affirmations`
#### `vision_affirmation_logs`
#### `vision_rituals`
#### `vision_ritual_completions`
#### `vision_ritual_streaks`
#### `vision_milestones`
#### `vision_daily_summary`
#### `vision_user_stats`
#### `vision_board_widgets`

---

### Affiliate System Tables (prefix: affiliate_)

#### `affiliate_profiles`
#### `affiliate_codes`
#### `affiliate_referrals`
#### `affiliate_sales`
#### `affiliate_commissions`
#### `affiliate_withdrawals`
#### `affiliate_bonus_kpi`

---

### Shopify Integration Tables (prefix: shopify_)

#### `shopify_orders`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `shopify_order_id` | TEXT | Shopify order ID |
| `order_number` | TEXT | Order number |
| `user_id` | UUID | FK to profiles |
| `email` | TEXT | Customer email |
| `product_type` | TEXT | Product type |
| `tier_purchased` | TEXT | Tier purchased |
| `financial_status` | TEXT | Payment status |
| `processed_at` | TIMESTAMPTZ | When gems/tier granted |

**Used by:** Shopify webhook
**Status:** ✅ ACTIVE

#### `shopify_courses`
#### `shopify_crystals`
#### `pending_gem_credits`
#### `pending_course_access`

---

### Other Tables

#### Notifications
- `notifications`
- `notification_preferences`
- `notification_settings`
- `notification_history`
- `user_push_tokens`

#### Messaging
- `conversations`
- `conversation_participants`
- `messages`
- `message_reactions`
- `message-attachments`

#### Trading
- `paper_trades`
- `portfolio_items`

#### Content Calendar
- `content_calendar`
- `scheduled_posts`

#### Sponsor System
- `sponsor_banners`
- `dismissed_banners`
- `ad_impressions`

#### Gamification
- `user_achievements`
- `user_streaks`
- `user_content_dislikes`

---

## 💎 DATA MAPPING (SOURCE OF TRUTH)

### ⚠️ CRITICAL: Use the correct data source

| Data Type | ✅ USE THIS | ❌ DON'T USE | Migration |
|-----------|-------------|--------------|-----------|
| **User gem balance** | `profiles.gems` | `user_wallets.gem_balance` | 20251211_unify_gem_balance.sql |
| **Gem transactions** | `gems_transactions` | `wallet_transactions` | 20251211_unify_gem_balance.sql |
| **Gem packages** | `gem_packs` | `currency_packages` | 20251209_gem_economy.sql |
| **User info** | `profiles` | - | PRIMARY |
| **User tier** | `profiles.scanner_tier`, `profiles.chatbot_tier`, `profiles.course_tier` | - | PRIMARY |

### RPC Functions (Use these for gem operations)

| Function | Description | Example |
|----------|-------------|---------|
| `get_gem_balance(p_user_id)` | Get user's gem balance | `supabase.rpc('get_gem_balance', { p_user_id: userId })` |
| `add_gems(p_user_id, p_amount, ...)` | Add gems to user | `supabase.rpc('add_gems', { p_user_id: userId, p_amount: 100 })` |
| `spend_gems(p_user_id, p_amount, ...)` | Spend gems | `supabase.rpc('spend_gems', { p_user_id: userId, p_amount: 50 })` |

---

## ⚠️ DEPRECATED (DO NOT USE)

### Tables
| Deprecated Table | Replacement | Notes |
|------------------|-------------|-------|
| `user_wallets` | `profiles.gems` | Kept for backwards compatibility, synced via trigger |
| `wallet_transactions` | `gems_transactions` | Legacy transaction log |
| `currency_packages` | `gem_packs` | Legacy gem packages |
| `users` | `profiles` | Always use profiles |

### Columns
| Deprecated | Replacement | Notes |
|------------|-------------|-------|
| `user_wallets.gem_balance` | `profiles.gems` | Synced via trigger |
| `gem_packs.sort_order` | `gem_packs.display_order` | Column renamed |

### Services
| Deprecated Usage | Correct Usage |
|------------------|---------------|
| `walletService.getBalance()` reading from `user_wallets` | Now reads from `profiles.gems` (fixed) |

---

## 🔄 RECENT CHANGES

| Date | Change | Migration |
|------|--------|-----------|
| 2025-12-11 | Unified gem balance to profiles.gems | 20251211_unify_gem_balance.sql |
| 2025-12-11 | Fixed duplicate webhook grants | shopify-webhook updated |
| 2025-12-10 | Vision Board RPCs | 20251210_vision_board_complete.sql |
| 2025-12-09 | Gem Economy system | 20251209_gem_economy.sql |
| 2025-12-09 | Course access via Shopify | 20251209_course_access_via_shopify.sql |

---

## 🔗 TRIGGERS & SYNCS

### Auto-sync triggers
| Trigger | Source | Target | Description |
|---------|--------|--------|-------------|
| `trg_sync_gems_to_wallet` | `profiles.gems` | `user_wallets.gem_balance` | Keeps wallet in sync |
| `trg_create_wallet` | `profiles` INSERT | `user_wallets` | Creates wallet for new users |

---

## 📝 NOTES FOR DEVELOPERS

### When working with gems:
1. **Read balance:** Use `gemEconomyService.getGemBalance(userId)` or `profiles.gems`
2. **Add gems:** Update `profiles.gems` directly, trigger syncs to `user_wallets`
3. **Log transactions:** Insert into `gems_transactions` (not `wallet_transactions`)
4. **Get packages:** Use `gemEconomyService.getGemPacks()` (reads from `gem_packs`)

### When working with users:
1. **Always use `profiles` table** - never query `users` table directly
2. **Check admin:** Use the standard admin detection logic from DATABASE_SCHEMA.md

### When adding new tables:
1. Prefix Vision Board tables with `vision_`
2. Prefix Affiliate tables with `affiliate_`
3. Prefix Shopify tables with `shopify_`
4. Add RLS policies
5. Document in this file
