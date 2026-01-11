# COMPLETE FEATURE SPECIFICATION
## Ads/Sponsor Banner + Tab Tài Sản + Admin Dashboard

**Version:** 1.0.0
**Last Updated:** 2025-12-20
**Author:** Gemral Development Team

---

# TABLE OF CONTENTS

1. [ADS/SPONSOR BANNER SYSTEM](#1-adssponsor-banner-system)
2. [TAB TÀI SẢN (ASSETS)](#2-tab-tài-sản-assets)
3. [ADMIN DASHBOARD](#3-admin-dashboard)
4. [UI/UX DESIGN SPECS](#4-uiux-design-specs)
5. [DATABASE SCHEMA](#5-database-schema)
6. [API & SERVICES](#6-api--services)

---

# 1. ADS/SPONSOR BANNER SYSTEM

## 1.1 Overview

Hệ thống quảng cáo nội bộ cho phép admin tạo và quản lý banner quảng cáo hiển thị xuyên suốt ứng dụng với targeting theo tier và screen.

## 1.2 Components

### 1.2.1 SponsorBannerCard.js
**Location:** `gem-mobile/src/components/SponsorBannerCard.js`

**Props:**
```javascript
{
  banner: {
    id: string,
    title: string,
    subtitle: string,
    description: string,
    image_url: string,
    icon_url: string,
    action_type: 'url' | 'screen' | 'deeplink',
    action_value: string,
    action_label: string,
    background_color: string,
    text_color: string,
    accent_color: string,
    is_dismissible: boolean,
    html_content: string
  },
  onDismiss: function,
  onPress: function,
  style: object
}
```

**UI Structure:**
```
┌─────────────────────────────────────────────────────────┐
│ [X] Dismiss (if dismissible)                            │
│                                                         │
│  ✨ ICON        TITLE                                   │
│                 Subtitle text here                      │
│                                                         │
│  Description text with more details...                  │
│                                                         │
│  [IMAGE_URL - Full width banner image]                  │
│                                                         │
│           [ ACTION_LABEL Button ]                       │
│                                                         │
│  "Được tài trợ" label                                   │
└─────────────────────────────────────────────────────────┘
```

**Styling Specs:**
```javascript
// Container
container: {
  backgroundColor: banner.background_color || '#1A1A2E',
  borderRadius: 16,
  padding: 16,
  marginHorizontal: 16,
  marginVertical: 8,
  borderWidth: 1,
  borderColor: 'rgba(255, 215, 0, 0.3)', // Gold accent
  shadowColor: '#FFD700',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 8,
}

// Title
title: {
  color: banner.text_color || '#FFFFFF',
  fontSize: 18,
  fontWeight: '700',
  marginBottom: 4,
}

// Subtitle
subtitle: {
  color: banner.text_color || 'rgba(255, 255, 255, 0.7)',
  fontSize: 14,
  fontWeight: '500',
}

// Action Button
actionButton: {
  backgroundColor: banner.accent_color || '#FFD700',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 25,
  alignItems: 'center',
  marginTop: 12,
}

actionButtonText: {
  color: '#000000',
  fontSize: 14,
  fontWeight: '700',
  textTransform: 'uppercase',
}

// Sponsor Label
sponsorLabel: {
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: 10,
  textAlign: 'center',
  marginTop: 8,
}
```

### 1.2.2 SponsorBannerSection.js
**Location:** `gem-mobile/src/components/SponsorBannerSection.js`

**Hook Export:**
```javascript
export const useSponsorBanners = (screenName, options = {}) => {
  // Returns: { banners, loading, error, refreshBanners, dismissBanner }
}
```

**Options:**
```javascript
{
  maxBanners: number,        // Max banners to show (default: 3)
  excludeIds: string[],      // Banner IDs to exclude
  onBannersLoaded: function, // Callback when banners loaded
}
```

### 1.2.3 AdCard.js (Forum Native Ad)
**Location:** `gem-mobile/src/components/Forum/AdCard.js`

**Ad Types:**
- `sponsor_banner` - Standard sponsor banner
- `tier_upgrade_1` - Tier 1 upgrade promotion
- `tier_upgrade_2` - Tier 2 upgrade promotion
- `affiliate_product` - Affiliate product ad
- `course_promo` - Course promotion

**UI Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  👤 Avatar    "Được tài trợ"                            │
│               Brand Name                                │
│─────────────────────────────────────────────────────────│
│                                                         │
│  [GRADIENT BACKGROUND with ICON]                        │
│                                                         │
│  AD TITLE - Bold, Eye-catching                          │
│  Subtitle with value proposition                        │
│                                                         │
│  [ CTA BUTTON ]                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 1.3 Banner Placement Logic

### Home Feed Integration
```javascript
// HomeScreen.js
const { banners } = useSponsorBanners('home', { maxBanners: 2 });

// Render at top of feed
<FlatList
  ListHeaderComponent={
    <>
      {banners.map(banner => (
        <SponsorBannerCard key={banner.id} banner={banner} />
      ))}
    </>
  }
  data={posts}
  ...
/>
```

### Forum Feed Integration (Distributed)
```javascript
// ForumScreen.js - Inject ads into feed
const injectBannersIntoFeed = (posts, banners) => {
  const result = [];
  const adInterval = 5; // Show ad every 5 posts

  posts.forEach((post, index) => {
    result.push({ type: 'post', data: post });

    if ((index + 1) % adInterval === 0) {
      const bannerIndex = Math.floor(index / adInterval) % banners.length;
      if (banners[bannerIndex]) {
        result.push({ type: 'ad', data: banners[bannerIndex] });
      }
    }
  });

  return result;
};
```

## 1.4 Targeting System

### Target Tiers
- `FREE` - Free tier users
- `TIER1` - Tier 1 subscribers
- `TIER2` - Tier 2 subscribers
- `TIER3` - Tier 3 subscribers
- `ADMIN` - Admin users

### Target Screens
- `home` - Home tab feed
- `scanner` - Scanner screen
- `shop` - Shop screen
- `forum` - Forum feed
- `account` - Account screen
- `visionboard` - Vision Board
- `wallet` - Wallet screen
- `portfolio` - Portfolio screen

## 1.5 Analytics Tracking

```javascript
// View tracking (on mount)
sponsorBannerService.recordView(bannerId);

// Click tracking (on press)
sponsorBannerService.recordClick(bannerId);

// Viewability config (Forum)
const viewabilityConfig = {
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 300, // 300ms
};
```

---

# 2. TAB TÀI SẢN (ASSETS)

## 2.1 Overview

Tab quản lý tài sản tổng hợp bao gồm Gems, Portfolio crypto, Earnings, và các tính năng tài chính.

## 2.2 Screen Structure

### 2.2.1 AssetsHomeScreen.js
**Location:** `gem-mobile/src/screens/Assets/AssetsHomeScreen.js`

**UI Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                 │
│  "Tài Sản Của Tôi"              [Tier Badge] [Followers]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│  │  GEMS   │ │ EARNINGS│ │AFFILIATE│                   │
│  │  💎 5K  │ │ ₫ 2.5M  │ │ ₫ 500K  │                   │
│  └─────────┘ └─────────┘ └─────────┘                   │
│                                                         │
│  QUICK ACTIONS (Grid 4x2)                               │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                           │
│  │Ví  │ │Thu │ │Lịch│ │Boost│                          │
│  │tiền│ │nhập│ │ sử │ │    │                           │
│  └────┘ └────┘ └────┘ └────┘                           │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                           │
│  │Port│ │Sound│ │Cài │ │More│                          │
│  │folio││Lib │ │đặt │ │    │                           │
│  └────┘ └────┘ └────┘ └────┘                           │
│                                                         │
│  [ADMIN PANEL - Only for admins]                        │
│                                                         │
│  AFFILIATE SECTION                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Mã giới thiệu: GEMRAL123    [Copy]              │   │
│  │ Hoa hồng tháng này: ₫ 500,000                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  RECENT ACTIVITY                                        │
│  ├─ 💎 Mua 1000 Gems - 2 giờ trước                     │
│  ├─ 🎁 Nhận quà từ @user - 5 giờ trước                 │
│  ├─ 📈 Boost bài viết - Hôm qua                        │
│  └─ 💰 Hoa hồng affiliate - 3 ngày trước               │
│                                                         │
│  [UPGRADE CTA - For FREE tier]                          │
│  "Nâng cấp TIER để mở khóa tất cả tính năng"           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2.2 WalletScreen.js
**Location:** `gem-mobile/src/screens/Wallet/WalletScreen.js`

**UI Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  HEADER: "Ví Gems"                          [Settings]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  BALANCE CARD                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │      💎                                         │   │
│  │      5,000 GEMS                                 │   │
│  │      ≈ ₫ 500,000                                │   │
│  │                                                 │   │
│  │  Total Earned    Total Spent                    │   │
│  │  💎 12,500       💎 7,500                       │   │
│  │                                                 │   │
│  │  [     MUA GEMS     ]                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  QUICK ACTIONS                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ 🎁 Gửi  │ │ 📦 Quà   │ │ 📜 Lịch  │               │
│  │   Quà   │ │  tặng    │ │   sử     │               │
│  └──────────┘ └──────────┘ └──────────┘               │
│                                                         │
│  [SPONSOR BANNER]                                       │
│                                                         │
│  RECENT TRANSACTIONS                                    │
│  ├─ 🎁 Gửi quà cho @friend     -50 💎   2 giờ trước   │
│  ├─ 📦 Nhận quà từ @user       +100 💎  5 giờ trước   │
│  ├─ 🛒 Mua Gem Pack            +1000 💎 Hôm qua       │
│  ├─ 📈 Boost bài viết          -200 💎  3 ngày trước  │
│  └─ 🎉 Bonus đăng ký           +500 💎  1 tuần trước  │
│                                                         │
│  [Xem tất cả giao dịch →]                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2.3 PortfolioScreen.js
**Location:** `gem-mobile/src/screens/Account/PortfolioScreen.js`

**UI Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  HEADER: "Portfolio"                    [👁 Hide/Show]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  BALANCE CARD (Gradient: #1A1A2E → #2D1B4E)            │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Tổng giá trị                                   │   │
│  │  $12,345.67                                     │   │
│  │  ≈ ₫ 308,641,750                                │   │
│  │                                                 │   │
│  │  P&L: +$1,234.56 (+11.1%)  📈                   │   │
│  │                                                 │   │
│  │  [Send] [Receive] [Buy] [P2P] [Swap]            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [SPONSOR BANNER SECTION]                               │
│                                                         │
│  COIN LIST                                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [BTC Logo]  Bitcoin                    [Edit]   │   │
│  │             0.5 BTC                             │   │
│  │             $21,234.00    +5.2% 📈              │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ [ETH Logo]  Ethereum                   [Edit]   │   │
│  │             2.0 ETH                             │   │
│  │             $4,567.00     -2.1% 📉              │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ [SOL Logo]  Solana                     [Edit]   │   │
│  │             50 SOL                              │   │
│  │             $2,345.00     +12.5% 📈             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [     + THÊM COIN MỚI     ]                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Add/Edit Coin Modal:**
```
┌─────────────────────────────────────────────────────────┐
│  THÊM COIN MỚI                               [X Close]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Symbol *                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ BTC                                   [Search]  │   │
│  └─────────────────────────────────────────────────┘   │
│  ✓ Bitcoin (BTC) - Binance validated                   │
│                                                         │
│  Số lượng *                                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 0.5                                             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Giá mua trung bình ($)                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 35000                                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Ghi chú                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Mua từ Binance tháng 3/2024                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [          LƯU          ]    [   HỦY   ]              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 3. ADMIN DASHBOARD

## 3.1 Overview

Hệ thống quản trị toàn diện với 35+ màn hình cho phép quản lý users, partnerships, content, finances.

## 3.2 Admin Screens Inventory

### Core Management (6 screens)
| Screen | File | Purpose |
|--------|------|---------|
| Dashboard | `AdminDashboardScreen.js` | Tổng quan stats và quick access |
| Users | `AdminUsersScreen.js` | Quản lý users, tiers, roles |
| Applications | `AdminApplicationsScreen.js` | Duyệt đơn Affiliate/CTV |
| Withdrawals | `AdminWithdrawalsScreen.js` | Xử lý yêu cầu rút tiền |
| Reports | `AdminReportsScreen.js` | Báo cáo và analytics |
| Notifications | `AdminNotificationsScreen.js` | Push notifications |

### Content Management (8 screens)
| Screen | File | Purpose |
|--------|------|---------|
| Content Dashboard | `ContentDashboardScreen.js` | Content hub |
| Content Editor | `ContentEditorScreen.js` | Soạn thảo nội dung |
| Content Calendar | `ContentCalendarScreen.js` | Lịch đăng bài |
| Content Analytics | `ContentAnalyticsScreen.js` | Phân tích hiệu suất |
| Push Editor | `PushEditorScreen.js` | Soạn push notification |
| Template Library | `TemplateLibraryScreen.js` | Thư viện templates |
| Auto Post Logs | `AutoPostLogsScreen.js` | Logs auto-posting |
| Platform Settings | `PlatformSettingsScreen.js` | Facebook, TikTok, YouTube |

### Subscription Management (2 screens)
| Screen | File | Purpose |
|--------|------|---------|
| Expiring Users | `AdminExpiringUsersScreen.js` | Users sắp hết hạn |
| Expiration Logs | `AdminExpirationLogsScreen.js` | Lịch sử hết hạn |

### Course Management (8 screens)
| Screen | File | Purpose |
|--------|------|---------|
| Course List | `CourseListScreen.js` | Danh sách khóa học |
| Course Builder | `CourseBuilderScreen.js` | Tạo/sửa khóa học |
| Course Preview | `CoursePreviewScreen.js` | Xem trước khóa học |
| Course Students | `CourseStudentsScreen.js` | Học viên đăng ký |
| Module Builder | `ModuleBuilderScreen.js` | Tạo modules |
| Lesson Builder | `LessonBuilderScreen.js` | Tạo bài học |
| Quiz Builder | `QuizBuilderScreen.js` | Tạo quiz |
| Grant Access | `GrantAccessScreen.js` | Cấp quyền truy cập |

### Catalog Management (3 screens)
| Screen | File | Purpose |
|--------|------|---------|
| Gift Catalog | `AdminGiftCatalogScreen.js` | Quản lý quà tặng |
| Sticker Packs | `AdminStickerPacksScreen.js` | Quản lý sticker |
| Sticker Upload | `AdminStickerUploadScreen.js` | Upload stickers |

### Support & Finance (4 screens)
| Screen | File | Purpose |
|--------|------|---------|
| Support Tickets | `SupportTicketsScreen.js` | Quản lý tickets |
| Ticket Detail | `TicketDetailScreen.js` | Chi tiết ticket |
| Revenue Dashboard | `RevenueDashboardScreen.js` | Doanh thu |
| User Detail | `UserDetailScreen.js` | Chi tiết user |

## 3.3 AdminDashboardScreen Layout

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  STATS CARDS (2x2 Grid)                                │
│  ┌──────────────────┐ ┌──────────────────┐             │
│  │ 📋 Pending Apps  │ │ 💰 Pending       │             │
│  │      12          │ │  Withdrawals: 5  │             │
│  │  [View All →]    │ │  [Process →]     │             │
│  └──────────────────┘ └──────────────────┘             │
│  ┌──────────────────┐ ┌──────────────────┐             │
│  │ 👥 Total Users   │ │ ⚠️ Expiring Soon │             │
│  │     15,234       │ │      23          │             │
│  │  +234 this month │ │  [Notify →]      │             │
│  └──────────────────┘ └──────────────────┘             │
│                                                         │
│  REVENUE THIS MONTH                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ₫ 125,000,000                                   │   │
│  │ [===========================------] 83%         │   │
│  │ Target: ₫ 150,000,000                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  QUICK ACTIONS                                          │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │Users│ │Apps│ │With│ │Noti│ │Cont│ │Repo│           │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘           │
│                                                         │
│  RECENT ACTIVITIES                                      │
│  ├─ New affiliate application - 5 min ago              │
│  ├─ Withdrawal completed - 1 hour ago                  │
│  ├─ New user registered - 2 hours ago                  │
│  └─ Content published - 3 hours ago                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 3.4 AdminSponsorBannersScreen Layout

```
┌─────────────────────────────────────────────────────────┐
│  QUẢN LÝ BANNER                    [+ Tạo Banner Mới]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  FILTER: [All] [Active] [Inactive] [Scheduled]          │
│                                                         │
│  BANNER LIST                                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Image] Tier 1 Upgrade Banner                   │   │
│  │         Target: FREE, TIER1                     │   │
│  │         Screens: home, scanner                  │   │
│  │         Views: 1,234  Clicks: 89  CTR: 7.2%     │   │
│  │         Status: ● Active                        │   │
│  │         [Edit] [Deactivate] [Delete]            │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ [Image] Crystal Course Promo                    │   │
│  │         Target: ALL                             │   │
│  │         Screens: shop, visionboard              │   │
│  │         Views: 567  Clicks: 45  CTR: 7.9%       │   │
│  │         Status: ○ Scheduled (Dec 25)            │   │
│  │         [Edit] [Preview] [Delete]               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘

EDIT BANNER MODAL (3 Tabs)
┌─────────────────────────────────────────────────────────┐
│  [Basic] [HTML] [Preview]                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  BASIC TAB:                                             │
│  ─────────────────────────────────────────────────────  │
│  Title *: [Tier 1 Upgrade - Unlock Zone Retest]        │
│  Subtitle: [Nâng cấp ngay để mở khóa scanner]          │
│  Description: [Full description text...]               │
│  Image URL: [https://...]                   [Upload]   │
│                                                         │
│  Action Type: [Dropdown: url/screen/deeplink]          │
│  Action Value: [Deeplink Picker Component]             │
│  Action Label: [Nâng cấp ngay]                         │
│                                                         │
│  COLORS:                                                │
│  Background: [#1A1A2E] [Color Picker]                  │
│  Text: [#FFFFFF] [Color Picker]                        │
│  Accent: [#FFD700] [Color Picker]                      │
│                                                         │
│  TARGETING:                                             │
│  Tiers: [x]FREE [x]TIER1 [ ]TIER2 [ ]TIER3 [ ]ADMIN   │
│  Screens: [x]home [x]scanner [ ]shop [ ]forum...       │
│                                                         │
│  SCHEDULING:                                            │
│  Start: [2024-12-20] End: [2025-01-20]                 │
│  Priority: [10] (Higher = shown first)                 │
│  Dismissible: [x] Yes                                  │
│                                                         │
│  [       SAVE       ]                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 4. UI/UX DESIGN SPECS

## 4.1 Color Palette

### Primary Colors
```scss
$background-primary: #05040B;      // Main app background
$background-secondary: #0D0C15;    // Card backgrounds
$background-tertiary: #1A1A2E;     // Elevated surfaces

$accent-gold: #FFD700;             // Primary accent
$accent-gold-dark: #B8860B;        // Dark gold
$accent-purple: #8B5CF6;           // Secondary accent
$accent-teal: #14B8A6;             // Success states
```

### Text Colors
```scss
$text-primary: #FFFFFF;            // Primary text
$text-secondary: rgba(255, 255, 255, 0.7);  // Secondary text
$text-tertiary: rgba(255, 255, 255, 0.5);   // Muted text
$text-disabled: rgba(255, 255, 255, 0.3);   // Disabled text
```

### Status Colors
```scss
$status-success: #10B981;          // Green - Success
$status-warning: #F59E0B;          // Orange - Warning
$status-error: #EF4444;            // Red - Error
$status-info: #3B82F6;             // Blue - Info
```

### Tier Colors
```scss
$tier-free: #6B7280;               // Gray
$tier-1: #8B5CF6;                  // Purple
$tier-2: #FFD700;                  // Gold
$tier-3: #EC4899;                  // Pink
$tier-admin: #EF4444;              // Red
```

## 4.2 Typography

```scss
// Font Family
$font-family: 'Inter', -apple-system, system-ui, sans-serif;

// Font Sizes
$font-size-xs: 10px;
$font-size-sm: 12px;
$font-size-base: 14px;
$font-size-md: 16px;
$font-size-lg: 18px;
$font-size-xl: 20px;
$font-size-2xl: 24px;
$font-size-3xl: 30px;

// Font Weights
$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

// Line Heights
$line-height-tight: 1.2;
$line-height-normal: 1.5;
$line-height-relaxed: 1.75;
```

## 4.3 Spacing & Layout

```scss
// Base spacing unit: 4px
$spacing-1: 4px;
$spacing-2: 8px;
$spacing-3: 12px;
$spacing-4: 16px;
$spacing-5: 20px;
$spacing-6: 24px;
$spacing-8: 32px;
$spacing-10: 40px;
$spacing-12: 48px;

// Border Radius
$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$radius-xl: 20px;
$radius-full: 9999px;

// Screen Padding
$screen-padding-x: 16px;
$screen-padding-y: 12px;
```

## 4.4 Component Styles

### Cards
```javascript
// Standard Card
card: {
  backgroundColor: '#0D0C15',
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
}

// Glass Card (Elevated)
glassCard: {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
}

// Sponsor Card
sponsorCard: {
  backgroundColor: '#1A1A2E',
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: 'rgba(255, 215, 0, 0.3)',
  shadowColor: '#FFD700',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
}
```

### Buttons
```javascript
// Primary Button
primaryButton: {
  backgroundColor: '#FFD700',
  paddingVertical: 14,
  paddingHorizontal: 24,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
}

primaryButtonText: {
  color: '#000000',
  fontSize: 16,
  fontWeight: '700',
}

// Secondary Button
secondaryButton: {
  backgroundColor: 'transparent',
  paddingVertical: 14,
  paddingHorizontal: 24,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.3)',
}

secondaryButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
}

// Icon Button
iconButton: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  alignItems: 'center',
  justifyContent: 'center',
}
```

### Form Inputs
```javascript
// Text Input
textInput: {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 16,
  fontSize: 16,
  color: '#FFFFFF',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
}

textInputFocused: {
  borderColor: '#FFD700',
}

textInputError: {
  borderColor: '#EF4444',
}

// Input Label
inputLabel: {
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: 14,
  fontWeight: '500',
  marginBottom: 8,
}
```

## 4.5 Animations & Effects

### Press Effects
```javascript
// TouchableOpacity
activeOpacity: 0.7

// Pressable with scale
onPressIn: Animated.spring(scale, { toValue: 0.95 })
onPressOut: Animated.spring(scale, { toValue: 1.0 })
```

### Transitions
```javascript
// Screen transitions
transition: {
  duration: 300,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
}

// Fade in
fadeIn: {
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: 200,
}

// Slide up
slideUp: {
  from: { translateY: 20, opacity: 0 },
  to: { translateY: 0, opacity: 1 },
  duration: 300,
}
```

### Loading States
```javascript
// Skeleton loading
skeleton: {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 8,
  overflow: 'hidden',
}

// Shimmer effect
shimmer: {
  backgroundGradient: [
    'rgba(255, 255, 255, 0)',
    'rgba(255, 255, 255, 0.1)',
    'rgba(255, 255, 255, 0)',
  ],
  animationDuration: 1500,
}
```

---

# 5. DATABASE SCHEMA

## 5.1 sponsor_banners Table

```sql
CREATE TABLE sponsor_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  icon_url TEXT,
  html_content TEXT,                    -- Custom HTML override

  -- Action
  action_type VARCHAR(20) DEFAULT 'screen',  -- 'url', 'screen', 'deeplink'
  action_value TEXT,                    -- Destination
  action_label TEXT DEFAULT 'Xem ngay', -- Button text

  -- Styling
  background_color VARCHAR(20) DEFAULT '#1A1A2E',
  text_color VARCHAR(20) DEFAULT '#FFFFFF',
  accent_color VARCHAR(20) DEFAULT '#FFD700',

  -- Targeting
  target_tiers TEXT[] DEFAULT ARRAY['FREE', 'TIER1', 'TIER2', 'TIER3'],
  target_screens TEXT[] DEFAULT ARRAY['home'],

  -- Scheduling
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  priority INTEGER DEFAULT 0,           -- Higher = shown first

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_dismissible BOOLEAN DEFAULT true,

  -- Analytics
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sponsor_banners_active ON sponsor_banners(is_active);
CREATE INDEX idx_sponsor_banners_dates ON sponsor_banners(start_date, end_date);
CREATE INDEX idx_sponsor_banners_priority ON sponsor_banners(priority DESC);
```

## 5.2 dismissed_banners Table

```sql
CREATE TABLE dismissed_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  banner_id UUID REFERENCES sponsor_banners(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, banner_id)
);
```

## 5.3 portfolio_items Table

```sql
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  symbol VARCHAR(20) NOT NULL,          -- BTC, ETH, SOL
  quantity DECIMAL(20, 8) NOT NULL,
  avg_buy_price DECIMAL(20, 8),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, symbol)
);
```

## 5.4 gems_transactions Table

```sql
CREATE TABLE gems_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL,            -- purchase, spend, gift_received, gift_sent, bonus
  amount INTEGER NOT NULL,              -- Positive or negative
  balance_after INTEGER,

  description TEXT,
  reference_id UUID,                    -- Order ID, Gift ID, etc.
  reference_type VARCHAR(50),           -- order, gift, boost, etc.

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 5.5 RLS Policies

```sql
-- sponsor_banners: Public can view active banners
CREATE POLICY "Public can view active banners" ON sponsor_banners
  FOR SELECT USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- sponsor_banners: Admins have full access
CREATE POLICY "Admins have full access" ON sponsor_banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role IN ('admin', 'ADMIN')
        OR profiles.is_admin = true
        OR profiles.scanner_tier = 'ADMIN'
        OR profiles.chatbot_tier = 'ADMIN'
      )
    )
  );

-- dismissed_banners: Users manage their own
CREATE POLICY "Users manage own dismissals" ON dismissed_banners
  FOR ALL USING (auth.uid() = user_id);

-- portfolio_items: Users manage their own
CREATE POLICY "Users manage own portfolio" ON portfolio_items
  FOR ALL USING (auth.uid() = user_id);
```

---

# 6. API & SERVICES

## 6.1 sponsorBannerService.js

```javascript
// Location: gem-mobile/src/services/sponsorBannerService.js

export const sponsorBannerService = {
  // Fetch active banners for a screen
  async getActiveBanners(screenName, userTier, userId, options = {}) {
    const { maxBanners = 5, excludeIds = [] } = options;

    // Query banners with filtering
    let query = supabase
      .from('sponsor_banners')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', new Date().toISOString())
      .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .limit(maxBanners);

    // Filter by screen
    if (screenName) {
      query = query.contains('target_screens', [screenName]);
    }

    // Exclude specific IDs
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data, error } = await query;

    // Client-side tier filtering
    const filtered = data?.filter(banner => {
      const tiers = banner.target_tiers || [];
      return tiers.some(t =>
        t.toUpperCase() === userTier.toUpperCase() ||
        t.replace('_', '').toUpperCase() === userTier.toUpperCase()
      );
    });

    // Filter dismissed banners
    if (userId) {
      const { data: dismissed } = await supabase
        .from('dismissed_banners')
        .select('banner_id')
        .eq('user_id', userId);

      const dismissedIds = dismissed?.map(d => d.banner_id) || [];
      return filtered?.filter(b => !dismissedIds.includes(b.id)) || [];
    }

    return filtered || [];
  },

  // Dismiss a banner
  async dismissBanner(userId, bannerId) {
    return supabase.from('dismissed_banners').insert({
      user_id: userId,
      banner_id: bannerId,
    });
  },

  // Record view
  async recordView(bannerId) {
    return supabase.rpc('increment_banner_view', { banner_id: bannerId });
  },

  // Record click
  async recordClick(bannerId) {
    return supabase.rpc('increment_banner_click', { banner_id: bannerId });
  },

  // ADMIN: Get all banners
  async getAllBanners() {
    return supabase
      .from('sponsor_banners')
      .select('*')
      .order('created_at', { ascending: false });
  },

  // ADMIN: Create banner
  async createBanner(bannerData, createdBy) {
    return supabase.from('sponsor_banners').insert({
      ...bannerData,
      created_by: createdBy,
    }).select().single();
  },

  // ADMIN: Update banner
  async updateBanner(bannerId, updates) {
    return supabase
      .from('sponsor_banners')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', bannerId)
      .select()
      .single();
  },

  // ADMIN: Delete banner
  async deleteBanner(bannerId) {
    return supabase.from('sponsor_banners').delete().eq('id', bannerId);
  },

  // ADMIN: Toggle active status
  async toggleActive(bannerId, isActive) {
    return this.updateBanner(bannerId, { is_active: isActive });
  },
};
```

## 6.2 walletService.js

```javascript
// Location: gem-mobile/src/services/walletService.js

export const walletService = {
  // Get wallet balance
  async getBalance() {
    const { data: profile } = await supabase
      .from('profiles')
      .select('gems, diamonds')
      .eq('id', (await supabase.auth.getUser()).data.user.id)
      .single();

    return {
      gems: profile?.gems || 0,
      diamonds: profile?.diamonds || 0,
    };
  },

  // Get transactions
  async getTransactions(limit = 20, offset = 0) {
    const userId = (await supabase.auth.getUser()).data.user.id;

    return supabase
      .from('gems_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
  },

  // Spend gems
  async spendGems(amount, description, referenceId, referenceType) {
    const userId = (await supabase.auth.getUser()).data.user.id;

    // Check balance first
    const { gems } = await this.getBalance();
    if (gems < amount) {
      throw new Error('Insufficient gems');
    }

    // Deduct gems and log transaction
    const { error } = await supabase.rpc('spend_gems', {
      p_user_id: userId,
      p_amount: amount,
      p_description: description,
      p_reference_id: referenceId,
      p_reference_type: referenceType,
    });

    if (error) throw error;
    return true;
  },

  // Format gems display
  formatGems(amount) {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  },
};
```

## 6.3 portfolioService.js

```javascript
// Location: gem-mobile/src/services/portfolioService.js

export const portfolioService = {
  // Get user portfolio
  async getUserPortfolio(userId) {
    const { data: items } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!items?.length) return [];

    // Fetch current prices
    const symbols = items.map(i => i.symbol);
    const prices = await this.getCurrentPrices(symbols);

    // Calculate P&L
    return items.map(item => {
      const currentPrice = prices[item.symbol] || 0;
      const currentValue = item.quantity * currentPrice;
      const costBasis = item.quantity * (item.avg_buy_price || 0);
      const pnl = currentValue - costBasis;
      const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

      return {
        ...item,
        currentPrice,
        currentValue,
        pnl,
        pnlPercent,
      };
    });
  },

  // Get current prices from Binance
  async getCurrentPrices(symbols) {
    const prices = {};

    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`
        );
        const data = await response.json();
        prices[symbol] = parseFloat(data.price);
      } catch (error) {
        console.error(`Failed to fetch price for ${symbol}`);
      }
    }

    return prices;
  },

  // Add coin to portfolio
  async addCoin(userId, symbol, quantity, avgBuyPrice, notes) {
    return supabase.from('portfolio_items').insert({
      user_id: userId,
      symbol: symbol.toUpperCase(),
      quantity,
      avg_buy_price: avgBuyPrice,
      notes,
    }).select().single();
  },

  // Update coin
  async updateCoin(id, updates) {
    return supabase
      .from('portfolio_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  },

  // Delete coin
  async deleteCoin(id) {
    return supabase.from('portfolio_items').delete().eq('id', id);
  },

  // Search coin on Binance
  async searchCoin(query) {
    const response = await fetch(
      'https://api.binance.com/api/v3/exchangeInfo'
    );
    const data = await response.json();

    return data.symbols
      .filter(s =>
        s.quoteAsset === 'USDT' &&
        s.baseAsset.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10)
      .map(s => ({
        symbol: s.baseAsset,
        name: s.baseAsset,
      }));
  },
};
```

---

# APPENDIX

## A. File Locations Summary

| Feature | Path |
|---------|------|
| Sponsor Banner Card | `gem-mobile/src/components/SponsorBannerCard.js` |
| Sponsor Banner Section | `gem-mobile/src/components/SponsorBannerSection.js` |
| Ad Card (Forum) | `gem-mobile/src/components/Forum/AdCard.js` |
| Assets Home | `gem-mobile/src/screens/Assets/AssetsHomeScreen.js` |
| Wallet | `gem-mobile/src/screens/Wallet/WalletScreen.js` |
| Portfolio | `gem-mobile/src/screens/Account/PortfolioScreen.js` |
| Admin Dashboard | `gem-mobile/src/screens/Admin/AdminDashboardScreen.js` |
| Admin Banners | `gem-mobile/src/screens/Admin/AdminSponsorBannersScreen.js` |
| Banner Service | `gem-mobile/src/services/sponsorBannerService.js` |
| Wallet Service | `gem-mobile/src/services/walletService.js` |
| Portfolio Service | `gem-mobile/src/services/portfolioService.js` |
| Admin User Service | `gem-mobile/src/services/adminUserService.js` |
| DB Migration | `supabase/migrations/20251203_sponsor_banners.sql` |

## B. Deeplink Routes

```javascript
const DEEPLINK_OPTIONS = [
  // Main tabs
  { label: 'Home', value: 'gem://home' },
  { label: 'Scanner', value: 'gem://scanner' },
  { label: 'Shop', value: 'gem://shop' },
  { label: 'Forum', value: 'gem://forum' },
  { label: 'Account', value: 'gem://account' },

  // Account screens
  { label: 'Portfolio', value: 'gem://portfolio' },
  { label: 'VisionBoard', value: 'gem://visionboard' },
  { label: 'Settings', value: 'gem://settings' },
  { label: 'Notifications', value: 'gem://notifications' },

  // Monetization
  { label: 'Affiliate Program', value: 'gem://affiliate' },
  { label: 'Wallet', value: 'gem://wallet' },
  { label: 'Buy Gems', value: 'gem://buy-gems' },
  { label: 'Withdraw', value: 'gem://withdraw' },

  // Courses
  { label: 'Courses', value: 'gem://courses' },
  { label: 'My Courses', value: 'gem://my-courses' },

  // Shop
  { label: 'Cart', value: 'gem://cart' },
  { label: 'Orders', value: 'gem://orders' },
  { label: 'Gift Catalog', value: 'gem://gifts' },

  // Help
  { label: 'Help', value: 'gem://help' },
  { label: 'FAQ', value: 'gem://faq' },
  { label: 'Contact', value: 'gem://contact' },
];
```

---

**END OF DOCUMENT**
