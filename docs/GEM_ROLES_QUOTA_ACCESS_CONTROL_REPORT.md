# BÁO CÁO HỆ THỐNG ROLES, QUOTA & ACCESS CONTROL
## GEMRAL Platform - Phiên bản 1.0.21

**Ngày cập nhật:** 28/01/2026
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
8. [Zone Visualization Access](#8-zone-visualization-access)
9. [Pricing & Upgrade Path](#9-pricing--upgrade-path)
10. [Cấu Trúc Database](#10-cấu-trúc-database)
11. [API & RPC Functions](#11-api--rpc-functions)
12. [Source Code Files](#12-source-code-files)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. TỔNG QUAN HỆ THỐNG TIER

### 1.1 Các Cấp Bậc (Tier Hierarchy)

| Tier | Level | Tên Hiển Thị | Màu | Mô Tả |
|------|-------|--------------|-----|-------|
| `FREE` | 0 | Miễn phí | #FF6B6B (Đỏ) | Người dùng mới, chưa mua gói |
| `TIER1` / `PRO` | 1 | Cơ bản / Pro | #FFBD59 (Cam) | Gói cơ bản, phù hợp người mới bắt đầu |
| `TIER2` / `PREMIUM` | 2 | Nâng cao / Premium | #6A5BFF (Tím) | Gói nâng cao, nhiều tính năng hơn |
| `TIER3` / `VIP` | 3 | VIP | #FFD700 (Vàng) | Gói cao cấp nhất, không giới hạn |
| `MANAGER` | 99 | Manager | #FF00FF (Magenta) | Quyền quản lý, bypass TẤT CẢ quota |
| `ADMIN` | 99 | Admin | #FF00FF (Magenta) | Quyền quản trị, bypass TẤT CẢ quota |

### 1.2 Quy Tắc Xác Định Tier

```
User Tier = MAX(chatbot_tier, scanner_tier, course_tier, purchased_tiers)
```

- Hệ thống lấy **tier cao nhất** từ tất cả các nguồn
- Bundle purchases bao gồm cả chatbot + scanner + courses
- Standalone purchases chỉ ảnh hưởng đến module tương ứng
- **ADMIN/MANAGER bypass tất cả tier checks**

### 1.3 Tier Normalization

Hệ thống hỗ trợ case-insensitive tier matching:
- `free`, `FREE`, `Free` → `FREE`
- `tier1`, `TIER1`, `pro`, `PRO` → `TIER1`
- `tier2`, `TIER2`, `premium`, `PREMIUM` → `TIER2`
- `tier3`, `TIER3`, `vip`, `VIP` → `TIER3`
- `manager`, `MANAGER` → `MANAGER`
- `admin`, `ADMIN` → `ADMIN`

---

## 2. ROLES & QUYỀN HẠN

### 2.1 System Roles

| Role | Mô Tả | Quota | Truy Cập Admin Panel | Course Access |
|------|-------|-------|---------------------|---------------|
| **User** (default) | Người dùng thông thường | Theo tier | Không | Theo enrollment |
| **Teacher** | Giảng viên | Theo tier | Course Admin (riêng) | Full (khóa của mình) |
| **Manager** | Quản lý | **UNLIMITED** | Có (read-only) | **Full (tất cả)** |
| **Admin** | Quản trị viên | **UNLIMITED** | Có (đầy đủ) | **Full (tất cả)** |

### 2.2 Manager Role - Chi Tiết Quyền Hạn

**MANAGER có quyền bypass TẤT CẢ các giới hạn sau:**

| Tính năng | Quyền hạn |
|-----------|-----------|
| Chatbot Quota | Unlimited queries/ngày |
| Scanner Quota | Unlimited scans/ngày |
| Tarot/I Ching | Unlimited readings |
| Vision Board | Unlimited goals, habits, affirmations |
| Course Access | Xem TẤT CẢ khóa học (published + unpublished) |
| Zone Visualization | Full access (như TIER3) |
| Feature Lock | KHÔNG bị lock bất kỳ tính năng nào |

**MANAGER KHÔNG có quyền:**
- Tạo/sửa/xóa khóa học (chỉ xem)
- Truy cập Admin functions (user management, withdrawals, etc.)
- Cấp quyền cho users khác

### 2.3 Cách Kiểm Tra Manager Role

```javascript
// Trong code JavaScript/React Native
const isManager = profile?.role === 'manager' ||
                  profile?.role === 'MANAGER' ||
                  profile?.scanner_tier === 'MANAGER' ||
                  profile?.chatbot_tier === 'MANAGER';

// Kiểm tra bypass
const hasUnlimitedAccess = isAdmin || isManager;
```

```sql
-- Trong SQL/Database
v_is_manager := (
  v_profile.user_role IN ('manager', 'MANAGER') OR
  v_profile.user_chatbot_tier IN ('MANAGER') OR
  v_profile.user_scanner_tier IN ('MANAGER')
);
```

### 2.4 Course Roles

| Role | Quyền Hạn |
|------|-----------|
| **Student** | Xem nội dung khóa học đã đăng ký |
| **Teacher** | Tạo/sửa/xóa khóa học của mình, xem học viên |
| **Manager** | Xem TẤT CẢ khóa học (read-only) |
| **Admin** | Full control tất cả khóa học |

### 2.5 Partnership Roles

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
| TIER3/VIP | **Unlimited** | Unlimited | 50 câu |
| MANAGER | **Unlimited** | Unlimited | Unlimited |
| ADMIN | **Unlimited** | Unlimited | Unlimited |

### 3.2 GEM Scanner Quota

| Tier | Scans/Ngày | Patterns | Coins | Real-time Alerts |
|------|------------|----------|-------|------------------|
| FREE | **5** | 3 patterns | 20 coins | Không |
| TIER1/PRO | **Unlimited** | 3 patterns | 50 coins | 3/coin |
| TIER2/PREMIUM | **Unlimited** | 7 patterns | 200 coins | 10/coin |
| TIER3/VIP | **Unlimited** | ALL (17+) | ALL (437+) | Unlimited |
| MANAGER | **Unlimited** | ALL | ALL | Unlimited |
| ADMIN | **Unlimited** | ALL | ALL | Unlimited |

> **Lưu ý quan trọng:** Scanner quota cho PRO+ là UNLIMITED (không giới hạn scans/ngày). Chỉ FREE tier mới bị giới hạn 5 scans/ngày.

### 3.3 Divination Quota (Tarot, I Ching, Numerology)

| Feature | FREE | TIER1 | TIER2 | TIER3 | MANAGER/ADMIN |
|---------|------|-------|-------|-------|---------------|
| Tarot | 1/ngày | 3/ngày | 10/ngày | Unlimited | **Unlimited** |
| I Ching | 1/ngày | 3/ngày | 10/ngày | Unlimited | **Unlimited** |
| Numerology | Không | 2/ngày | 10/ngày | Unlimited | **Unlimited** |

### 3.4 Quota Reset

- **Thời gian reset:** 00:00 giờ Việt Nam (UTC+7) hàng ngày
- **Cache TTL:** 30 giây (để tránh DB calls liên tục)
- **Database tables:** `chatbot_quota`, `scanner_quota`

### 3.5 Quota Return Values

```javascript
// Khi gọi checkAllQuotas() hoặc check_all_quotas RPC:
{
  chatbot: {
    tier: 'MANAGER',      // Tier hiển thị
    limit: -1,            // -1 = unlimited
    used: 5,              // Số đã dùng (vẫn track)
    remaining: -1,        // -1 = unlimited
    unlimited: true       // Flag để check nhanh
  },
  scanner: {
    tier: 'MANAGER',
    limit: -1,
    used: 10,
    remaining: -1,
    unlimited: true
  },
  resetAt: '2026-01-28T17:00:00.000Z'  // Next reset time (UTC)
}
```

---

## 4. FEATURE ACCESS CONTROL

### 4.1 Ma Trận Truy Cập Tính Năng

| Tính Năng | FREE | TIER1 | TIER2 | TIER3 | MANAGER/ADMIN |
|-----------|------|-------|-------|-------|---------------|
| **Chat cơ bản** | 5/ngày | 15/ngày | 50/ngày | Unlimited | **Unlimited** |
| **Personalization** | Không | Basic | Advanced | Full | **Full** |
| **Proactive Messages** | Không | Daily Insight | + Ritual Reminder | All | **All** |
| **Emotion Detection** | Không | Basic | Advanced | Full | **Full** |
| **Rituals** | 2 rituals (cơ bản) | 5 rituals | Tất cả 8 | Tất cả 8 | **Tất cả 8** |
| **Voice Input** | Không | Không | Có | Có | **Có** |
| **Export Data** | Không | Không | PDF | PDF, CSV, JSON | **All** |
| **Zone Visualization** | Không | Basic | Advanced | Full | **Full** |

### 4.2 Memory Features

| Tier | Retention Days | Max Memories | Pinned Memories |
|------|----------------|--------------|-----------------|
| FREE | 7 ngày | 10 | 0 |
| TIER1 | 30 ngày | 50 | 5 |
| TIER2 | 90 ngày | 200 | 20 |
| TIER3 | Unlimited | Unlimited | Unlimited |
| MANAGER/ADMIN | **Unlimited** | **Unlimited** | **Unlimited** |

### 4.3 Access Control Service Config

```javascript
// gem-mobile/src/services/accessControlService.js
canAccess(userTier, featureKey) {
  // ADMIN and MANAGER bypass ALL restrictions
  if (tier === TIERS.ADMIN || tier === TIERS.MANAGER) {
    return {
      enabled: true,
      unlimited: true,
      config: {
        enabled: true,
        daily_limit: Infinity,
        max_rituals: Infinity,
        course_access: 'all',
        // ... all features unlocked
      },
    };
  }
  // ... normal tier logic
}
```

### 4.4 Ritual Access Control (MỚI - 28/01/2026)

#### 4.4.1 Danh Sách 8 Rituals

| ID | Tên Tiếng Việt | Tier Yêu Cầu | XP |
|----|----------------|--------------|-----|
| `heart-expansion` | Mở Rộng Trái Tim | **FREE** | 30 |
| `gratitude-flow` | Dòng Chảy Biết Ơn | **FREE** | 30 |
| `letter-to-universe` | Thư Gửi Vũ Trụ | TIER1 (Pro) | 25 |
| `water-manifest` | Hiện Thực Hóa Bằng Nước | TIER1 (Pro) | 30 |
| `cleansing-breath` | Hơi Thở Thanh Lọc | TIER1 (Pro) | 35 |
| `burn-release` | Đốt & Buông Bỏ | TIER2 (Premium) | 35 |
| `star-wish` | Ước Nguyện Sao Băng | TIER2 (Premium) | 25 |
| `crystal-healing` | Chữa Lành Pha Lê | TIER2 (Premium) | 30 |

#### 4.4.2 Ritual Access Matrix

| Tier | Số Ritual | Rituals Có Thể Access |
|------|-----------|----------------------|
| **FREE** | 2 | `heart-expansion`, `gratitude-flow` |
| **TIER1/Pro** | 5 | + `letter-to-universe`, `water-manifest`, `cleansing-breath` |
| **TIER2/Premium** | 8 | + `burn-release`, `star-wish`, `crystal-healing` (tất cả) |
| **TIER3/VIP** | 8 | Tất cả 8 rituals |
| **MANAGER** | 8 | **Bypass tất cả** |
| **ADMIN** | 8 | **Bypass tất cả** |

#### 4.4.3 Cách Unlock Rituals

User có thể unlock rituals bằng cách mua **BẤT KỲ** gói nào sau:

| Gói Mua | Tier Được | Rituals Unlock |
|---------|-----------|----------------|
| Chatbot Pro | TIER1 | 5 rituals |
| Chatbot Premium | TIER2 | Tất cả 8 |
| Chatbot VIP | TIER3 | Tất cả 8 |
| Scanner Pro | TIER1 | 5 rituals |
| Scanner Premium | TIER2 | Tất cả 8 |
| Scanner VIP | TIER3 | Tất cả 8 |
| Bundle TIER 1 | TIER1 | 5 rituals |
| Bundle TIER 2 | TIER2 | Tất cả 8 |
| Bundle TIER 3 | TIER3 | Tất cả 8 |

**Quy tắc:** Hệ thống lấy **tier cao nhất** từ `chatbot_tier`, `scanner_tier`, `course_tier` để xác định ritual access.

#### 4.4.4 UI Locked Rituals

- FREE user thấy **tất cả 8 rituals** trong UI
- Rituals locked sẽ hiển thị:
  - Icon khóa màu vàng
  - Badge tier yêu cầu (VD: "Pro", "Premium")
  - Màu xám nhạt
- Khi tap vào ritual locked → Hiện **Upgrade Modal**
- Upgrade Modal có nút "Nâng Cấp Ngay" → Navigate tới UpgradeScreen

#### 4.4.5 Code Implementation

```javascript
// gem-mobile/src/screens/VisionBoard/rituals/index.js
export const RITUAL_METADATA = {
  'heart-expansion': {
    id: 'heart-expansion',
    name: 'Mở Rộng Trái Tim',
    requiredTier: 'FREE',
    // ...
  },
  'burn-release': {
    id: 'burn-release',
    name: 'Đốt & Buông Bỏ',
    requiredTier: 'TIER2',
    // ...
  },
};

// Check access
import { canAccessRitual } from '../screens/VisionBoard/rituals';
const hasAccess = canAccessRitual(userTier, 'burn-release'); // false nếu FREE
```

---

## 5. VISION BOARD LIMITS

### 5.1 Giới Hạn Theo Tier

| Tier | Goals | Actions/Goal | Affirmations | Habits |
|------|-------|--------------|--------------|--------|
| FREE | 3 | 5 | 5 | 3 |
| TIER1/PRO | 10 | 15 | 20 | 10 |
| TIER2/PREMIUM | 30 | 30 | 50 | 20 |
| TIER3/VIP | Unlimited | Unlimited | Unlimited | Unlimited |
| MANAGER | **Unlimited** | **Unlimited** | **Unlimited** | **Unlimited** |
| ADMIN | **Unlimited** | **Unlimited** | **Unlimited** | **Unlimited** |

### 5.2 Vision Board Bundled với Chatbot Tier

Vision Board limits được gắn với `chatbot_tier` của user. Khi user nâng cấp chatbot tier, Vision Board limits cũng tăng theo.

**Cấu hình trong TierService:**
```javascript
MANAGER: {
  queries: -1,           // Unlimited
  voice: -1,            // Unlimited voice
  scanner: 'MANAGER',
  chatbot: 'MANAGER',
  patterns: -1,         // Unlimited patterns
  visionBoard: {
    goals: -1,          // Unlimited
    actionsPerGoal: -1,
    affirmations: -1,
    habits: -1,
  }
}
```

---

## 6. GEM MASTER CHATBOT FEATURES

### 6.1 Proactive AI Messages

| Message Type | FREE | TIER1 | TIER2 | TIER3 | MANAGER |
|--------------|------|-------|-------|-------|---------|
| Daily Insight | Không | Có | Có | Có | **Có** |
| Streak Alert | Không | Có | Có | Có | **Có** |
| Ritual Reminder | Không | Không | Có | Có | **Có** |
| Pattern Observation | Không | Không | Có | Có | **Có** |
| Milestone Celebration | Không | Có | Có | Có | **Có** |
| Custom Messages | Không | Không | Không | Có | **Có** |

### 6.2 Emotion Detection Levels

| Level | Mô Tả | Available |
|-------|-------|-----------|
| **Basic** | Keyword-based detection, no frequency display | TIER1+ |
| **Advanced** | AI-enhanced detection, frequency Hz display | TIER2+ |
| **Full** | Full history (90 days), pattern analysis, crisis detection | TIER3, MANAGER, ADMIN |

### 6.3 Gamification (Streaks & Badges)

| Feature | FREE | TIER1+ | MANAGER/ADMIN |
|---------|------|--------|---------------|
| Streak Tracking | Có (basic) | Có (full) | **Có (full)** |
| Badges | Không | Có | **Có** |
| Levels & XP | Không | Có | **Có** |
| Leaderboard | Không | Có | **Có** |

---

## 7. COURSE ACCESS CONTROL

### 7.1 Access Hierarchy

| Role/Status | Quyền truy cập |
|-------------|----------------|
| **Admin** | Xem + Edit + Delete TẤT CẢ khóa học |
| **Manager** | Xem TẤT CẢ khóa học (read-only, không cần enroll) |
| **Teacher** | Xem + Edit + Delete khóa học CỦA MÌNH |
| **Enrolled User** | Xem khóa học đã đăng ký |
| **Tier User** | Xem khóa học FREE hoặc tier <= user tier |

### 7.2 Course Access Check Logic

```javascript
// gem-mobile/src/contexts/CourseContext.js
const canAccessCourse = useCallback((course) => {
  // Admin and Manager can access everything
  if (userTier === 'ADMIN' || userTier === 'MANAGER' || isAdmin || isManager) {
    return true;  // BYPASS ALL CHECKS
  }

  // Normal tier check
  const courseTier = course?.tier_required || 'FREE';
  const tierOrder = ['FREE', 'STARTER', 'TIER1', 'TIER2', 'TIER3'];
  return tierOrder.indexOf(courseTier) <= tierOrder.indexOf(userTier);
}, [userTier, isAdmin, isManager]);
```

### 7.3 Database RLS Policy

```sql
-- check_course_access() function
-- First check if user is Admin or Manager - they bypass all restrictions
IF is_admin_flag = true OR
   user_role IN ('admin', 'ADMIN', 'manager', 'MANAGER') THEN
  RETURN QUERY SELECT true, 'admin_access'::TEXT, NULL::TIMESTAMPTZ;
  RETURN;
END IF;
```

### 7.4 Access Types

| Access Type | Mô Tả | Duration |
|-------------|-------|----------|
| `admin_access` | Admin/Manager bypass | Permanent |
| `purchase` | Mua trực tiếp | Lifetime hoặc theo gói |
| `bundle` | Mua bundle | Theo bundle tier |
| `admin_grant` | Admin cấp quyền | Tùy chỉnh |
| `shopify_purchase` | Mua qua Shopify | Theo order |
| `trading_leads` | First 50 registrants | 30 ngày |

---

## 8. ZONE VISUALIZATION ACCESS

### 8.1 Zone Features by Tier

| Feature | FREE | TIER1 | TIER2 | TIER3 | MANAGER/ADMIN |
|---------|------|-------|-------|-------|---------------|
| Zone Enabled | Không | Có | Có | Có | **Có** |
| Max Zones | 1 | 3 | 10 | 20 | **50** |
| Zone Rectangles | Không | Có | Có | Có | **Có** |
| Zone Labels | Không | Có | Có | Có | **Có** |
| Zone Lifecycle | Không | Không | Có | Có | **Có** |
| Historical Zones | Không | Không | Có | Có | **Có** |
| MTF Timeframes | 0 | 0 | 3 | 5 | **12** |
| Zone Alerts | 0 | 3 | 10 | Unlimited | **Unlimited** |
| Custom Colors | Không | Không | Có | Có | **Có** |
| Zone Export | Không | Không | Không | Có | **Có** |

### 8.2 Zone Config (tierAccess.js)

```javascript
MANAGER: {
  zoneVisualization: {
    enabled: true,
    maxZonesDisplayed: 50,
    zoneRectangles: true,
    zoneLabels: true,
    zoneLifecycle: true,
    historicalZones: true,
    mtfTimeframes: 12,
    zoneAlerts: -1,           // Unlimited
    customColors: true,
    zoneExport: true,
  },
}
```

---

## 9. PRICING & UPGRADE PATH

### 9.1 Standalone Chatbot Pricing

| Tier | Giá/Tháng | Giá/Năm |
|------|-----------|---------|
| PRO | 39.000đ | 390.000đ |
| PREMIUM | 59.000đ | 590.000đ |
| VIP | 99.000đ | 990.000đ |

### 9.2 Bundle Pricing

| Bundle | Giá | Bao Gồm |
|--------|-----|---------|
| TIER 1: Nền Tảng Trader | 11.000.000đ | Courses T1 + Scanner PRO + Chatbot PRO |
| TIER 2: Tần Số Thịnh Vượng | 21.000.000đ | Courses T1+T2 + Scanner PREMIUM + Chatbot PREMIUM |
| TIER 3: Đế Chế Bậc Thầy | 68.000.000đ | All Courses + Scanner VIP + Chatbot VIP |

### 9.3 Upgrade Path

```
FREE → TIER1 (PRO)
      ↓
    TIER1 → TIER2 (PREMIUM)
            ↓
          TIER2 → TIER3 (VIP)
```

---

## 10. CẤU TRÚC DATABASE

### 10.1 Core Tables

```sql
-- User profile with tier info
profiles:
  - id (UUID, PK)
  - email (VARCHAR)
  - chatbot_tier (VARCHAR) -- FREE, TIER1, TIER2, TIER3, ADMIN, MANAGER
  - scanner_tier (VARCHAR)
  - course_tier (VARCHAR)
  - is_admin (BOOLEAN)
  - role (VARCHAR) -- user, teacher, manager, admin
  - chatbot_tier_expires_at (TIMESTAMPTZ)
  - scanner_tier_expires_at (TIMESTAMPTZ)

-- Role constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IS NULL OR role IN ('user', 'admin', 'teacher', 'manager'));

-- Quota tracking
chatbot_quota:
  - user_id (UUID, FK)
  - date (DATE)
  - queries_used (INTEGER)
  - updated_at (TIMESTAMPTZ)
  - UNIQUE(user_id, date)

scanner_quota:
  - user_id (UUID, FK)
  - date (DATE)
  - scans_used (INTEGER)
  - updated_at (TIMESTAMPTZ)
  - UNIQUE(user_id, date)
```

### 10.2 Course Access Tables

```sql
-- Course enrollments
course_enrollments:
  - id (UUID, PK)
  - user_id (UUID, FK)
  - course_id (UUID, FK)
  - access_source (VARCHAR) -- purchase, bundle, admin_grant, shopify_purchase
  - enrolled_at (TIMESTAMPTZ)
  - expires_at (TIMESTAMPTZ, nullable)
  - is_active (BOOLEAN)
  - progress_percentage (INTEGER)
  - UNIQUE(user_id, course_id)
```

---

## 11. API & RPC FUNCTIONS

### 11.1 Quota Functions

```sql
-- Check all quotas (with Admin/Manager bypass)
CREATE OR REPLACE FUNCTION check_all_quotas(p_user_id UUID)
RETURNS TABLE (...)
AS $$
  -- Check Admin status
  v_is_admin := (
    v_profile.user_is_admin = TRUE OR
    v_profile.user_role IN ('admin', 'ADMIN') OR
    v_profile.user_chatbot_tier IN ('ADMIN') OR
    v_profile.user_scanner_tier IN ('ADMIN')
  );

  -- Check Manager status
  v_is_manager := (
    v_profile.user_role IN ('manager', 'MANAGER') OR
    v_profile.user_chatbot_tier IN ('MANAGER') OR
    v_profile.user_scanner_tier IN ('MANAGER')
  );

  -- Admin = unlimited everything
  IF v_is_admin THEN
    RETURN QUERY SELECT 'ADMIN', -1, 0, -1, TRUE, ...;
  END IF;

  -- Manager = unlimited everything (same as Admin)
  IF v_is_manager THEN
    RETURN QUERY SELECT 'MANAGER', -1, 0, -1, TRUE, ...;
  END IF;

  -- Normal tier logic...
$$;

-- Increment chatbot quota (with Admin/Manager bypass)
CREATE OR REPLACE FUNCTION increment_chatbot_quota(p_user_id UUID)
RETURNS TABLE (...)
AS $$
  -- Check if Admin or Manager = unlimited
  v_is_unlimited := (
    v_profile.user_is_admin = TRUE OR
    v_profile.user_role IN ('admin', 'ADMIN', 'manager', 'MANAGER') OR
    v_profile.user_chatbot_tier IN ('TIER3', 'VIP', 'ADMIN', 'MANAGER')
  );

  IF v_is_unlimited THEN
    -- Still increment for tracking, but return unlimited
    RETURN QUERY SELECT TRUE, v_used, -1, FALSE;
  END IF;
  -- Normal limit check...
$$;

-- Increment scanner quota (with Admin/Manager bypass)
CREATE OR REPLACE FUNCTION increment_scanner_quota(p_user_id UUID)
-- Same pattern as increment_chatbot_quota
```

### 11.2 Course Access Functions

```sql
-- Check course access (with Admin/Manager bypass)
CREATE OR REPLACE FUNCTION check_course_access(...)
AS $$
  -- First check if user is Admin or Manager
  IF is_admin_flag = true OR
     user_role IN ('admin', 'ADMIN', 'manager', 'MANAGER') THEN
    RETURN QUERY SELECT true, 'admin_access'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  -- Normal enrollment check...
$$;
```

### 11.3 Role Helper Functions

```sql
-- Check if user is manager
CREATE OR REPLACE FUNCTION is_manager(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'manager'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user has course admin access
CREATE OR REPLACE FUNCTION has_course_admin_access(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role IN ('admin', 'teacher', 'manager')
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## 12. SOURCE CODE FILES

### 12.1 Files với Manager Bypass (đã implement)

| File | Vị trí | Mô tả |
|------|--------|-------|
| `AuthContext.js` | gem-mobile/src/contexts/ | isManager flag, userTier = 'ADMIN' nếu isManager |
| `TierGuard.js` | gem-mobile/src/components/ | Manager bypass check |
| `quotaService.js` | gem-mobile/src/services/ | hasUnlimitedAccess = isAdmin \|\| isManager |
| `tierService.js` | gem-mobile/src/services/ | MANAGER tier config với unlimited |
| `tierAccess.js` | gem-mobile/src/config/ | MANAGER tier definition |
| `accessControlService.js` | gem-mobile/src/services/ | MANAGER bypass trong canAccess() |
| `CourseContext.js` | gem-mobile/src/contexts/ | canAccessCourse với isManager |
| `TierGuard.jsx` | frontend/src/components/TierGuard/ | Admin/Manager bypass |
| `FeatureGate.jsx` | frontend/src/components/FeatureGate/ | Admin/Manager bypass |
| `AuthContext.jsx` | frontend/src/contexts/ | getScannerTier với manager check |
| `rituals/index.js` | gem-mobile/src/screens/VisionBoard/rituals/ | Ritual metadata với requiredTier |
| `ritualService.js` | gem-mobile/src/services/ | RITUAL_TYPES với requiredTier |
| `RitualContext.js` | gem-mobile/src/contexts/ | canUserAccessRitual(), getEffectiveTier() |
| `FeaturedRitualSection.js` | gem-mobile/src/components/Rituals/ | UI locked rituals với upgrade modal |
| `VisionBoardScreen.js` | gem-mobile/src/screens/VisionBoard/ | navigateToRitual() với tier check, upgrade modal |
| `GemMasterScreen.js` | gem-mobile/src/screens/GemMaster/ | navigate_ritual action với tier check |
| `FAQPanelData.js` | gem-mobile/src/components/GemMaster/ | Added ritualId for tier check |

### 12.2 Database SQL Files

| File | Vị trí | Mô tả |
|------|--------|-------|
| `RUN_THIS_fix_manager_quota_FINAL.sql` | supabase/ | **CRITICAL:** Fix Manager bypass cho quota functions |
| `RUN_THIS_fix_manager_access.sql` | supabase/ | Fix Manager course access |
| `20251209_add_teacher_manager_roles.sql` | supabase/migrations/ | Add role constraint |

---

## 13. TROUBLESHOOTING

### 13.1 Manager Bị Lock Tính Năng / Quota

**Nguyên nhân có thể:**

1. **Database RPC functions chưa được update**
   - **Fix:** Chạy `supabase/RUN_THIS_fix_manager_quota_FINAL.sql` trong Supabase SQL Editor

2. **Migration mới đã overwrite functions**
   - Check file `20251215_fix_quota_reset_system.sql` - có thể đã xóa Manager check
   - **Fix:** Chạy lại `RUN_THIS_fix_manager_quota_FINAL.sql`

3. **Profile chưa có role = 'manager'**
   - Check trong database: `SELECT role FROM profiles WHERE id = 'user-id'`
   - **Fix:** `UPDATE profiles SET role = 'manager' WHERE id = 'user-id'`

4. **Cache quota cũ**
   - **Fix:** Logout & login lại, hoặc gọi `QuotaService.clearCache()`

### 13.2 Checklist Kiểm Tra Manager Access

```sql
-- 1. Check user profile
SELECT id, email, role, is_admin, chatbot_tier, scanner_tier
FROM profiles WHERE email = 'manager@example.com';

-- 2. Test check_all_quotas function
SELECT * FROM check_all_quotas('user-uuid-here');
-- Phải trả về: chatbot_tier='MANAGER', chatbot_unlimited=true

-- 3. Test increment functions
SELECT * FROM increment_chatbot_quota('user-uuid-here');
-- Phải trả về: remaining=-1 (unlimited)

-- 4. Test course access
SELECT * FROM check_course_access('user-uuid-here', 'course-uuid-here');
-- Phải trả về: has_access=true, reason='admin_access'
```

### 13.3 Lệnh Debug trong App

```javascript
// Trong React Native console hoặc Chrome DevTools:
// 1. Check current user tier
console.log(profile?.role, profile?.scanner_tier, profile?.chatbot_tier);

// 2. Check quota
const quota = await QuotaService.checkAllQuotas(userId, true);
console.log(quota);

// 3. Force refresh quota
QuotaService.clearCache();
const freshQuota = await QuotaService.checkAllQuotas(userId, true);
```

---

## CHANGELOG

| Version | Date | Changes |
|---------|------|---------|
| 1.0.21 | 28/01/2026 | **NEW:** Ritual Access Control - FREE chỉ 2 rituals, TIER1=5, TIER2+=8 |
| - | - | Thêm section 4.4 Ritual Access Control |
| - | - | Thêm requiredTier cho mỗi ritual trong metadata |
| - | - | UI locked rituals với upgrade modal |
| - | - | Unlock bằng chatbot/scanner/course tier |
| 1.0.20 | 27/01/2026 | **Major update:** Chi tiết hóa Manager role bypass |
| - | - | Thêm Zone Visualization Access section |
| - | - | Thêm Source Code Files reference |
| - | - | Thêm Troubleshooting section |
| - | - | Cập nhật Scanner quota (PRO+ = unlimited) |
| - | - | Thêm Database RPC function details |
| 1.0.19 | 18/01/2026 | Initial comprehensive report |
| - | - | Added GEM Master Chatbot features |
| - | - | Added Memory & Emotion tracking |

---

**Document maintained by:** GEM Development Team
**Last updated:** 28/01/2026
**Related SQL files:** `RUN_THIS_fix_manager_quota_FINAL.sql`
