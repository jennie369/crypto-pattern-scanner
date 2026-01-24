# BÁO CÁO HỆ THỐNG ROLES, QUOTA & ACCESS CONTROL
## GEMRAL Platform - Phiên bản 1.0.19

**Ngày cập nhật:** 18/01/2026
**Tác giả:** GEM Development Team

---

## MỤC LỤC

1. [Tổng Quan Hệ Thống Tier](#1-tổng-quan-hệ-thống-tier)
2. [Roles & Quyền Hạn](#2-roles--quyền-hạn)
3. [Quota - Giới Hạn Sử Dụng](#3-quota---giới-hạn-sử-dụng)
4. [Feature Access Control](#4-feature-access-control)
5. [Vision Board Limits](#5-vision-board-limits)
6. [GEM Master Chatbot Features](#6-gem-master-chatbot-features)
7. [Course Access Control](#7-course-access-control)
8. [Pricing & Upgrade Path](#8-pricing--upgrade-path)
9. [Cấu Trúc Database](#9-cấu-trúc-database)
10. [API & RPC Functions](#10-api--rpc-functions)

---

## 1. TỔNG QUAN HỆ THỐNG TIER

### 1.1 Các Cấp Bậc (Tier Hierarchy)

| Tier | Level | Tên Hiển Thị | Màu | Mô Tả |
|------|-------|--------------|-----|-------|
| `FREE` | 0 | Miễn phí | #FF6B6B (Đỏ) | Người dùng mới, chưa mua gói |
| `TIER1` / `PRO` | 1 | Cơ bản / Pro | #FFBD59 (Cam) | Gói cơ bản, phù hợp người mới bắt đầu |
| `TIER2` / `PREMIUM` | 2 | Nâng cao / Premium | #6A5BFF (Tím) | Gói nâng cao, nhiều tính năng hơn |
| `TIER3` / `VIP` | 3 | VIP | #FFD700 (Vàng) | Gói cao cấp nhất, không giới hạn |
| `ADMIN` | 99 | Admin | #FF00FF (Magenta) | Quyền quản trị, bypass mọi giới hạn |
| `MANAGER` | 99 | Manager | #FF00FF | Quyền quản lý, bypass quota như Admin |

### 1.2 Quy Tắc Xác Định Tier

```
User Tier = MAX(chatbot_tier, scanner_tier, course_tier, purchased_tiers)
```

- Hệ thống lấy **tier cao nhất** từ tất cả các nguồn
- Bundle purchases bao gồm cả chatbot + scanner + courses
- Standalone purchases chỉ ảnh hưởng đến module tương ứng

---

## 2. ROLES & QUYỀN HẠN

### 2.1 System Roles

| Role | Quyền Hạn | Quota | Truy Cập Admin Panel |
|------|-----------|-------|---------------------|
| **User** (default) | Sử dụng app theo tier | Theo tier | Không |
| **Manager** | Quản lý users, content | Unlimited | Có (hạn chế) |
| **Admin** | Full system access | Unlimited | Có (đầy đủ) |
| **Instructor** | Tạo/quản lý khóa học | Theo tier | Có (Course Admin) |

### 2.2 Course Roles

| Role | Quyền Hạn |
|------|-----------|
| **Student** | Xem nội dung khóa học đã đăng ký |
| **Teacher** | Xem danh sách học viên, progress |
| **Assistant** | Hỗ trợ teacher, xem analytics |
| **Owner** | Full control, thêm/xóa teacher |

### 2.3 Partnership Roles

| Role | Mô Tả | Commission |
|------|-------|------------|
| **CTV** (Cộng Tác Viên) | Affiliate cơ bản | 10-15% |
| **KOL** | Influencer đã verify | 15-25% |
| **Ambassador** | Đối tác chiến lược | 25-35% |

---

## 3. QUOTA - GIỚI HẠN SỬ DỤNG

### 3.1 GEM Master Chatbot Quota

| Tier | Queries/Ngày | Voice Messages/Ngày | Memory Context |
|------|--------------|---------------------|----------------|
| FREE | 5 | 3 | 5 câu |
| TIER1/PRO | 15 | Unlimited | 10 câu |
| TIER2/PREMIUM | 50 | Unlimited | 30 câu |
| TIER3/VIP | Unlimited | Unlimited | 50 câu |
| ADMIN/MANAGER | Unlimited | Unlimited | Unlimited |

### 3.2 GEM Scanner Quota

| Tier | Scans/Ngày | Patterns | Real-time Alerts |
|------|------------|----------|------------------|
| FREE | 10 | 3 patterns | Không |
| TIER1/PRO | 20 | 7 patterns | Có |
| TIER2/PREMIUM | 50 | 15 patterns | Có + Priority |
| TIER3/VIP | Unlimited | 24 patterns | Có + Priority |
| ADMIN/MANAGER | Unlimited | Unlimited | Có + Priority |

### 3.3 Divination Quota (Tarot, I Ching, Numerology)

| Feature | FREE | TIER1 | TIER2 | TIER3 |
|---------|------|-------|-------|-------|
| Tarot | 1/ngày | 3/ngày | 10/ngày | Unlimited |
| I Ching | 1/ngày | 3/ngày | 10/ngày | Unlimited |
| Numerology | Không | 2/ngày | 10/ngày | Unlimited |

### 3.4 Quota Reset

- **Thời gian reset:** 00:00 giờ Việt Nam (UTC+7) hàng ngày
- **Cache TTL:** 30 giây
- **Database tables:** `chatbot_quota`, `scanner_quota`, `feature_usage`

---

## 4. FEATURE ACCESS CONTROL

### 4.1 Ma Trận Truy Cập Tính Năng

| Tính Năng | FREE | TIER1 | TIER2 | TIER3 |
|-----------|------|-------|-------|-------|
| **Chat cơ bản** | 10/ngày | 50/ngày | 200/ngày | Unlimited |
| **Personalization** | Không | Basic | Advanced | Full |
| **Proactive Messages** | Không | Daily Insight, Streak Alert | + Ritual Reminder, Pattern | All |
| **Emotion Detection** | Không | Basic (no Hz) | Advanced (show Hz) | Full + 90 days history |
| **Rituals** | 2 rituals, no gamification | 5 rituals + gamification | 15 rituals | Unlimited |
| **RAG Search** | Không | Tier 1 courses | Tier 1+2 courses | All courses |
| **Voice Input** | Không | Không | Có | Có |
| **Export Data** | Không | Không | PDF | PDF, CSV, JSON |

### 4.2 Memory Features

| Tier | Retention Days | Max Memories | Pinned Memories |
|------|----------------|--------------|-----------------|
| FREE | 7 ngày | 10 | 0 |
| TIER1 | 30 ngày | 50 | 5 |
| TIER2 | 90 ngày | 200 | 20 |
| TIER3 | Unlimited | Unlimited | Unlimited |

---

## 5. VISION BOARD LIMITS

### 5.1 Giới Hạn Theo Tier

| Tier | Goals | Actions/Goal | Affirmations | Habits |
|------|-------|--------------|--------------|--------|
| FREE | 3 | 5 | 5 | 3 |
| TIER1/PRO | 10 | 15 | 20 | 10 |
| TIER2/PREMIUM | 30 | 30 | 50 | 20 |
| TIER3/VIP | Unlimited | Unlimited | Unlimited | Unlimited |

### 5.2 Vision Board Bundled với Chatbot Tier

Vision Board limits được gắn với `chatbot_tier` của user. Khi user nâng cấp chatbot tier, Vision Board limits cũng tăng theo.

---

## 6. GEM MASTER CHATBOT FEATURES

### 6.1 Proactive AI Messages

| Message Type | FREE | TIER1 | TIER2 | TIER3 |
|--------------|------|-------|-------|-------|
| Daily Insight | Không | Có | Có | Có |
| Streak Alert | Không | Có | Có | Có |
| Ritual Reminder | Không | Không | Có | Có |
| Pattern Observation | Không | Không | Có | Có |
| Milestone Celebration | Không | Có | Có | Có |
| Custom Messages | Không | Không | Không | Có |

### 6.2 Emotion Detection Levels

| Level | Mô Tả | Available |
|-------|-------|-----------|
| **Basic** | Keyword-based detection, no frequency display | TIER1+ |
| **Advanced** | AI-enhanced detection, frequency Hz display | TIER2+ |
| **Full** | Full history (90 days), pattern analysis, crisis detection | TIER3 |

### 6.3 Gamification (Streaks & Badges)

| Feature | FREE | TIER1+ |
|---------|------|--------|
| Streak Tracking | Có (basic) | Có (full) |
| Badges | Không | Có |
| Levels & XP | Không | Có |
| Leaderboard | Không | Có |

**Badge Milestones:** 7, 14, 21, 30, 60, 90, 100, 365 ngày

---

## 7. COURSE ACCESS CONTROL

### 7.1 Access Types

| Access Type | Mô Tả | Duration |
|-------------|-------|----------|
| `purchase` | Mua trực tiếp | Lifetime hoặc theo gói |
| `bundle` | Mua bundle | Theo bundle tier |
| `admin_grant` | Admin cấp quyền | Tùy chỉnh |
| `promo` | Khuyến mãi | Có thời hạn |
| `gift` | Quà tặng | Tùy chỉnh |
| `trading_leads` | First 50 registrants | 30 ngày |

### 7.2 Course Tiers

| Course Tier | Included In |
|-------------|-------------|
| Tier 1 Courses | TIER1, TIER2, TIER3 |
| Tier 2 Courses | TIER2, TIER3 |
| Tier 3 Courses | TIER3 only |
| Free Courses | All users |

### 7.3 Trading Leads Benefit

- **Điều kiện:** First 50 registrants từ Trading Course Landing
- **Benefit:** 30 ngày PRO Scanner (TIER1)
- **Table:** `trading_leads`
- **Fields:** `queue_number`, `scanner_activated_at`, `scanner_expires_at`

---

## 8. PRICING & UPGRADE PATH

### 8.1 Standalone Chatbot Pricing

| Tier | Giá/Tháng | Giá/Năm |
|------|-----------|---------|
| PRO | 39.000đ | 390.000đ |
| PREMIUM | 59.000đ | 590.000đ |
| VIP | 99.000đ | 990.000đ |

### 8.2 Bundle Pricing

| Bundle | Giá | Bao Gồm |
|--------|-----|---------|
| TIER 1: Nền Tảng Trader | 11.000.000đ | Courses T1 + Scanner PRO + Chatbot PRO |
| TIER 2: Tần Số Thịnh Vượng | 21.000.000đ | Courses T1+T2 + Scanner PREMIUM + Chatbot PREMIUM |
| TIER 3: Đế Chế Bậc Thầy | 68.000.000đ | All Courses + Scanner VIP + Chatbot VIP |

### 8.3 Upgrade Path

```
FREE → TIER1 (PRO)
      ↓
    TIER1 → TIER2 (PREMIUM)
            ↓
          TIER2 → TIER3 (VIP)
```

---

## 9. CẤU TRÚC DATABASE

### 9.1 Core Tables

```sql
-- User profile with tier info
profiles:
  - id (UUID, PK)
  - chatbot_tier (VARCHAR) -- FREE, TIER1, TIER2, TIER3, ADMIN
  - scanner_tier (VARCHAR)
  - course_tier (VARCHAR)
  - is_admin (BOOLEAN)
  - role (VARCHAR) -- user, manager, admin
  - chatbot_tier_expires_at (TIMESTAMPTZ)
  - scanner_tier_expires_at (TIMESTAMPTZ)

-- Quota tracking
chatbot_quota:
  - user_id (UUID, FK)
  - date (DATE)
  - queries_used (INTEGER)

scanner_quota:
  - user_id (UUID, FK)
  - date (DATE)
  - scans_used (INTEGER)

feature_usage:
  - user_id (UUID, FK)
  - feature_key (VARCHAR)
  - usage_date (DATE)
  - count (INTEGER)
  - UNIQUE(user_id, feature_key, usage_date)

-- Course access
course_enrollments:
  - id (UUID, PK)
  - user_id (UUID, FK)
  - course_id (VARCHAR, FK)
  - access_source (VARCHAR) -- purchase, bundle, admin_grant, promo
  - enrolled_at (TIMESTAMPTZ)
  - expires_at (TIMESTAMPTZ, nullable)
  - completed_at (TIMESTAMPTZ, nullable)
```

### 9.2 Memory Tables (GEM Master Upgrade)

```sql
-- Long-term memory profile
user_chatbot_profiles:
  - user_id (UUID, FK)
  - display_name, preferred_name
  - life_purpose, core_values, spiritual_goals
  - communication_style ('gentle'|'direct'|'balanced')
  - journey_start_date, transformation_days
  - notification_preferences (JSONB)

-- Semantic memories
chat_memories:
  - user_id (UUID, FK)
  - memory_type ('goal'|'value'|'preference'|'achievement'|...)
  - category, title, content, summary
  - importance (1-10), is_pinned
  - expires_at (TIMESTAMPTZ, nullable)

-- Emotion tracking
emotional_states:
  - user_id (UUID, FK)
  - primary_emotion, secondary_emotions
  - intensity (1-10), frequency_hz (20-700)
  - trigger_topic, detected_at
```

---

## 10. API & RPC FUNCTIONS

### 10.1 Quota Functions

```sql
-- Check all quotas
check_all_quotas(p_user_id UUID)
  RETURNS TABLE(chatbot_tier, chatbot_limit, chatbot_used, chatbot_remaining,
                scanner_tier, scanner_limit, scanner_used, scanner_remaining, ...)

-- Increment chatbot usage
increment_chatbot_quota(p_user_id UUID)
  RETURNS TABLE(success, used, remaining, limit_reached)

-- Increment scanner usage
increment_scanner_quota(p_user_id UUID)
  RETURNS TABLE(success, used, remaining, limit_reached)

-- Get feature usage today
get_feature_usage_today(p_user_id UUID, p_feature_key VARCHAR)
  RETURNS INTEGER

-- Increment feature usage
increment_feature_usage(p_user_id UUID, p_feature_key VARCHAR)
  RETURNS INTEGER
```

### 10.2 Course Access Functions

```sql
-- Check course access
check_course_access(user_id_param UUID, course_id_param VARCHAR)
  RETURNS TABLE(has_access, reason, expires_at)

-- Grant course access
grant_course_access(user_id_param UUID, course_id_param VARCHAR,
                    access_source_param VARCHAR, duration_days_param INTEGER)
  RETURNS UUID

-- Calculate progress
calculate_course_progress(user_id_param UUID, course_id_param VARCHAR)
  RETURNS INTEGER
```

### 10.3 Memory Functions

```sql
-- Get/create chatbot profile
get_or_create_chatbot_profile(p_user_id UUID)
  RETURNS user_chatbot_profiles

-- Search memories
search_memories(p_user_id UUID, p_query TEXT, p_memory_type VARCHAR, p_limit INTEGER)
  RETURNS TABLE(id, memory_type, category, title, content, importance, created_at, relevance_score)

-- Get emotional journey
get_emotional_journey(p_user_id UUID, p_days INTEGER)
  RETURNS TABLE(detected_date, avg_frequency, primary_emotions, record_count)
```

---

## PHỤ LỤC: UPGRADE PROMPTS

### A.1 Prompt Messages Khi Đạt Giới Hạn

| Feature | Current Tier | Message |
|---------|--------------|---------|
| chatbot_basic | FREE | "Nâng cấp lên TIER 1 để có 50 lượt/ngày!" |
| chatbot_basic | TIER1 | "Nâng cấp lên TIER 2 để chat thoải mái!" |
| memory_basic | FREE | "Nâng cấp để GEM Master nhớ tới 30 ngày!" |
| personalization | FREE | "Nâng cấp để GEM cá nhân hóa cho bạn!" |
| proactive_messages | FREE | "Nâng cấp để nhận daily insights!" |
| emotion_detection | FREE | "Nâng cấp để GEM nhận biết cảm xúc của bạn!" |
| rituals | FREE | "Nâng cấp để tạo tới 5 ritual!" |
| numerology | FREE | "Nâng cấp để truy cập thần số học!" |

---

## CHANGELOG

| Version | Date | Changes |
|---------|------|---------|
| 1.0.19 | 18/01/2026 | Initial comprehensive report |
| - | - | Added GEM Master Chatbot features |
| - | - | Added Memory & Emotion tracking |
| - | - | Added Ritual & Gamification |

---

**Document maintained by:** GEM Development Team
**Last updated:** 18/01/2026
