# RITUALS & RITUAL LIBRARY - COMPLETE FEATURE SPECIFICATION
## Vision Board 2.0 - GEM Mobile App

**Document Version:** 1.0
**Created:** December 28, 2025
**Last Updated:** December 28, 2025

---

# TABLE OF CONTENTS

1. [Overview](#1-overview)
2. [Feature Architecture](#2-feature-architecture)
3. [Ritual Types & Catalog](#3-ritual-types--catalog)
4. [Component Specifications](#4-component-specifications)
5. [Screen Specifications](#5-screen-specifications)
6. [Individual Ritual Implementations](#6-individual-ritual-implementations)
7. [Animation & Effects System](#7-animation--effects-system)
8. [Design Tokens & Theme](#8-design-tokens--theme)
9. [Database Schema](#9-database-schema)
10. [Service Layer & API](#10-service-layer--api)
11. [Gamification System](#11-gamification-system)
12. [Access Control](#12-access-control)
13. [Navigation & Routing](#13-navigation--routing)
14. [Wireframes & Layout](#14-wireframes--layout)

---

# 1. OVERVIEW

## 1.1 Feature Description

Rituals là hệ thống nghi thức tâm linh tích hợp trong Vision Board 2.0, cho phép người dùng thực hiện các nghi thức mindfulness, manifestation, và healing. Hệ thống bao gồm:

- **Featured Daily Ritual**: Nghi thức gợi ý mỗi ngày
- **Ritual Library**: Thư viện nghi thức với filter/categories
- **Individual Ritual Screens**: Màn hình riêng cho từng loại nghi thức
- **Ritual History**: Lịch sử nghi thức đã thực hiện
- **Ritual Playground**: Màn hình chơi nghi thức tổng hợp
- **Streak & XP System**: Gamification với streak và điểm XP

## 1.2 Key Features

| Feature | Description |
|---------|-------------|
| 7 Ritual Types | 7 loại nghi thức khác nhau với animation unique |
| Cosmic Theme | Giao diện cosmic/mystic với particle effects |
| Audio Integration | Ambient sounds cho mỗi nghi thức |
| XP Rewards | 20-30 XP mỗi lần hoàn thành |
| Streak Tracking | Theo dõi streak liên tục với bonus |
| Haptic Feedback | Vibration feedback cho interactions |
| Offline Support | Hoạt động offline với local data |

## 1.3 Files Structure

```
gem-mobile/src/
├── screens/VisionBoard/
│   ├── RitualPlaygroundScreen.js      # Main ritual playground
│   ├── RitualHistoryScreen.js         # History of completed rituals
│   └── rituals/
│       ├── index.js                   # Export & RITUAL_SCREENS mapping
│       ├── HeartExpansionRitual.js    # Heart ritual (7 min)
│       ├── GratitudeFlowRitual.js     # Gratitude ritual (4 min)
│       ├── CleansingBreathRitual.js   # Breathing ritual (4 min)
│       ├── WaterManifestRitual.js     # Water ritual (5 min)
│       └── LetterToUniverseRitual.js  # Letter ritual (5-10 min)
├── components/Rituals/
│   ├── index.js
│   └── FeaturedRitualSection.js       # Main ritual hub component
└── services/
    └── ritualService.js               # Ritual business logic
```

---

# 2. FEATURE ARCHITECTURE

## 2.1 Component Hierarchy

```
VisionBoardScreen
└── FeaturedRitualSection
    ├── SectionHeader
    │   ├── Moon Icon
    │   ├── Title: "Nghi Thức Gợi Ý"
    │   └── ViewAllButton
    ├── FeaturedRitualCard (Large)
    │   ├── LinearGradient Background
    │   ├── SparkleEffect (x4)
    │   ├── FeaturedBadge: "Nghi thức hôm nay"
    │   ├── IconContainer
    │   ├── Title + Subtitle
    │   ├── TagPills
    │   ├── Duration Badge
    │   └── CTA Button: "Bắt đầu"
    ├── LibrarySection
    │   ├── LibraryHeader: "Thư Viện Nghi Thức"
    │   ├── FilterTags (horizontal scroll)
    │   ├── SmallRitualCard (x3, horizontal)
    │   └── RitualListItem (vertical list)
    └── QuickActions
        ├── "Tạo nghi thức" button
        └── "Chế độ thiền" button
```

## 2.2 Data Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌───────────────┐
│  VisionBoard    │───▶│  ritualService   │───▶│   Supabase    │
│    Context      │    │                  │    │   Database    │
└─────────────────┘    └──────────────────┘    └───────────────┘
        │                      │
        ▼                      ▼
┌─────────────────┐    ┌──────────────────┐
│ FeaturedRitual  │    │  RITUAL_TYPES    │
│    Section      │    │  (Local Config)  │
└─────────────────┘    └──────────────────┘
        │
        ▼
┌─────────────────┐
│ Individual      │
│ Ritual Screen   │
└─────────────────┘
```

---

# 3. RITUAL TYPES & CATALOG

## 3.1 Complete Ritual Catalog

### 3.1.1 Heart Expansion (Mở Rộng Trái Tim)

| Property | Value |
|----------|-------|
| ID | `heart-expansion` |
| Title (VI) | Mở Rộng Trái Tim |
| Subtitle | Nghi thức tần số yêu thương |
| Icon | `Heart` (Lucide) |
| Color | `#FF69B4` (Hot Pink) |
| Duration | 7 phút |
| Category | `love` / `healing` |
| XP Reward | 25 XP |
| Gradient | `['#F093FB', '#F5576C']` |
| Phases | Intro → Breath Sync → Heart Expansion → Completion |

**Steps:**
1. Hít thở sâu 3 lần
2. Đặt tay lên ngực, cảm nhận nhịp tim
3. Hình dung ánh sáng hồng lan tỏa từ tim
4. Gửi yêu thương đến người thân
5. Mở rộng yêu thương ra vũ trụ

### 3.1.2 Gratitude Flow (Dòng Chảy Biết Ơn)

| Property | Value |
|----------|-------|
| ID | `gratitude-flow` |
| Title (VI) | Dòng Chảy Biết Ơn |
| Subtitle | Thu hút thêm nhiều phước lành |
| Icon | `Gift` (Lucide) |
| Color | `#FFD700` (Gold) |
| Duration | 4 phút |
| Category | `abundance` / `prosperity` |
| XP Reward | 30 XP |
| Gradient | `['#FFD700', '#FFA500']` |
| Phases | Start → Input → Sending → Completed |

**Steps:**
1. Ngồi thoải mái, nhắm mắt
2. Nghĩ về 3 điều biết ơn hôm nay
3. Cảm nhận sự ấm áp lan tỏa
4. Viết ra những điều biết ơn
5. Gửi năng lượng vào vũ trụ

### 3.1.3 Cleansing Breath (Thở Thanh Lọc)

| Property | Value |
|----------|-------|
| ID | `cleansing-breath` |
| Title (VI) | Thở Thanh Lọc |
| Subtitle | Làm sạch năng lượng tiêu cực |
| Icon | `Wind` (Lucide) |
| Color | `#667EEA` (Indigo) |
| Duration | 4 phút (~4 cycles) |
| Category | `cleansing` / `spiritual` |
| XP Reward | 30 XP |
| Gradient | `['#667EEA', '#764BA2']` |
| Breathing Pattern | 4-4-4-4 (inhale-hold-exhale-rest) |

**Breath Phases:**
| Phase | Duration | Text | Color |
|-------|----------|------|-------|
| Inhale | 4s | "Hít vào..." | `#667EEA` |
| Hold | 4s | "Giữ hơi..." | `#764BA2` |
| Exhale | 4s | "Thở ra..." | `#4ECDC4` |
| Rest | 4s | "Nghỉ..." | `#44A08D` |

### 3.1.4 Water Manifestation (Hiện Thực Hóa Bằng Nước)

| Property | Value |
|----------|-------|
| ID | `water-manifest` |
| Title (VI) | Hiện Thực Hóa Bằng Nước |
| Subtitle | Nạp ý định vào nước và uống |
| Icon | `Droplet` (Lucide) |
| Color | `#4ECDC4` (Teal) |
| Duration | 5 phút |
| Category | `manifestation` |
| XP Reward | 30 XP |
| Gradient | `['#4ECDC4', '#44A08D']` |

**Ritual Steps:**
| Step | Title | Description | Duration |
|------|-------|-------------|----------|
| 1 | Chuẩn bị | Đặt một ly nước sạch trước mặt | - |
| 2 | Viết ý định | Viết rõ ràng điều muốn hiện thực hóa | Input |
| 3 | Nạp năng lượng | Đặt tay bao quanh ly nước | 30s |
| 4 | Uống nước | Từ từ uống hết ly nước | - |

### 3.1.5 Letter to Universe (Thư Gửi Vũ Trụ)

| Property | Value |
|----------|-------|
| ID | `letter-to-universe` |
| Title (VI) | Thư Gửi Vũ Trụ |
| Subtitle | Gửi điều ước đến vũ trụ bao la |
| Icon | `Mail` (Lucide) |
| Color | `#9D4EDD` (Purple) |
| Duration | 5-10 phút (input) + 22s animation |
| Category | `manifestation` / `intention` |
| XP Reward | 25 XP |
| Gradient | `['#6A5BFF', '#9D4EDD']` |

**Animation Timeline:**
| Time | Event |
|------|-------|
| 0s | Letter animation starts |
| 3.5s | Letter phase 1 complete |
| 6.5s | God rays appear |
| 8s | Shooting stars begin |
| 10s | Nebula clouds appear |
| 15s | Twinkling stars |
| 18s | Completion message |
| 22s | Animation complete |

### 3.1.6 Burn & Release (Đốt & Giải Phóng)

| Property | Value |
|----------|-------|
| ID | `burn-release` |
| Title (VI) | Đốt & Giải Phóng |
| Subtitle | Buông bỏ và chuyển hóa năng lượng |
| Icon | `Flame` (Lucide) |
| Color | `#FF6B6B` (Red) |
| Duration | 4-5 phút |
| Category | `release` / `healing` |
| XP Reward | 25 XP |
| Gradient | `['#FF6B6B', '#FF8E53']` |

**Steps:**
1. Ngồi yên và thở sâu
2. Viết ra điều muốn buông bỏ
3. Đọc lại một lần cuối
4. Kéo giấy vào ngọn lửa
5. Cảm nhận sự giải phóng

### 3.1.7 Star Wish (Nghi Thức Ước Sao)

| Property | Value |
|----------|-------|
| ID | `star-wish` |
| Title (VI) | Nghi Thức Ước Sao |
| Subtitle | Ước nguyện dưới ánh sao |
| Icon | `Star` (Lucide) |
| Color | `#4ECDC4` / `#00CED1` |
| Duration | 3 phút |
| Category | `manifestation` |
| XP Reward | 20 XP |
| Gradient | `['#4ECDC4', '#44A08D']` |

---

# 4. COMPONENT SPECIFICATIONS

## 4.1 FeaturedRitualSection Component

### Props Interface

```typescript
interface FeaturedRitualSectionProps {
  onRitualPress?: (ritual: Ritual) => void;
  onCreateRitual?: () => void;
  onAmbientMode?: () => void;
  onViewAllRituals?: () => void;
  style?: ViewStyle;
}
```

### Layout Specifications

| Element | Specification |
|---------|---------------|
| Container | `marginBottom: SPACING.lg (16px)` |
| Section Header | `flexDirection: row, justifyContent: space-between` |
| Featured Card | `borderRadius: 24px, minHeight: 220px` |
| Library Section | `borderRadius: 20px, padding: 12px` |
| Quick Actions | `flexDirection: row, gap: 12px` |

## 4.2 FeaturedRitualCard Component (Large)

### Visual Specifications

```
┌─────────────────────────────────────────────────────────┐
│ ★ [Badge: Nghi thức hôm nay]           ○ 5-10 phút    │
│                                                         │
│  ┌────────┐  Thư Gửi Vũ Trụ                            │
│  │  📧    │  "Gửi điều ước đến vũ trụ bao la"          │
│  │ (Icon) │                                             │
│  └────────┘  [ý định] [mở rộng]                        │
│                                                         │
│                              ┌────────────────┐         │
│                              │ Bắt đầu    →  │         │
│                              └────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

### Style Specifications

| Element | Property | Value |
|---------|----------|-------|
| Card | borderRadius | 24px |
| Card | minHeight | 220px |
| Card | overflow | hidden |
| Gradient | padding | 16px (SPACING.lg) |
| Badge | backgroundColor | `rgba(0, 0, 0, 0.3)` |
| Badge | paddingHorizontal | 12px |
| Badge | paddingVertical | 6px |
| Badge | borderRadius | 20px |
| Badge Text | fontSize | 11px |
| Badge Text | fontWeight | 600 |
| Badge Text | color | `#FFD700` |
| Icon Container | width/height | 64px |
| Icon Container | borderRadius | 20px |
| Icon Container | backgroundColor | `rgba(255, 255, 255, 0.2)` |
| Title | fontSize | 22px |
| Title | fontWeight | 700 |
| Title | color | `#FFFFFF` |
| Subtitle | fontSize | 14px |
| Subtitle | fontStyle | italic |
| Subtitle | color | `rgba(255, 255, 255, 0.85)` |
| Tag Pill | backgroundColor | `rgba(255, 255, 255, 0.2)` |
| Tag Pill | paddingHorizontal | 10px |
| Tag Pill | paddingVertical | 4px |
| Tag Pill | borderRadius | 12px |
| Duration | fontSize | 11px |
| Duration | position | absolute top-right |
| CTA Button | borderRadius | 20px |
| CTA Button | paddingHorizontal | 16px |
| CTA Button | paddingVertical | 10px |
| CTA Button | backgroundColor | `rgba(255, 255, 255, 0.25)` |
| CTA Button | borderWidth | 1px |
| CTA Button | borderColor | `rgba(255, 255, 255, 0.3)` |

### Animations

**Glow Pulse Animation:**
```javascript
duration: 2000ms each direction
opacity: 0.3 → 0.6 → 0.3 (loop)
```

**Press Scale Animation:**
```javascript
onPressIn: scale 1 → 0.97 (spring)
onPressOut: scale 0.97 → 1 (spring)
```

## 4.3 SmallRitualCard Component

### Dimensions

| Property | Value |
|----------|-------|
| width | 140px |
| height | 160px |
| borderRadius | 20px |
| marginRight | 16px |
| padding | 12px (SPACING.md) |

### Visual Structure

```
┌─────────────────┐
│  ┌──────┐       │
│  │ Icon │       │
│  │ 48px │       │
│  └──────┘       │
│                 │
│  Title Text     │
│  (2 lines max)  │
│                 │
│  ⏱ 5 phút      │
└─────────────────┘
```

### Style Details

| Element | Property | Value |
|---------|----------|-------|
| Gradient | colors | `[${color}40, ${color}20]` (40% & 20% opacity) |
| Gradient | borderWidth | 1px |
| Gradient | borderColor | `rgba(255, 255, 255, 0.1)` |
| Icon Container | width/height | 48px |
| Icon Container | borderRadius | 16px |
| Icon Container | backgroundColor | `${color}30` (30% opacity) |
| Title | fontSize | 14px |
| Title | fontWeight | 600 |
| Title | numberOfLines | 2 |
| Duration | fontSize | 11px |
| Duration | color | COLORS.textMuted |

## 4.4 RitualListItem Component

### Layout Structure

```
┌──────────────────────────────────────────────────────────┐
│  ┌──────┐  Title Text                           5 phút  │
│  │ Icon │  "Subtitle in quotes"                    →    │
│  │ 48px │                                               │
│  └──────┘                                               │
└──────────────────────────────────────────────────────────┘
```

### Style Specifications

| Element | Property | Value |
|---------|----------|-------|
| Container | borderRadius | 16px |
| Container | marginBottom | 8px (SPACING.sm) |
| Gradient | flexDirection | row |
| Gradient | alignItems | center |
| Gradient | padding | 12px (SPACING.md) |
| Gradient | gap | 12px |
| Gradient | borderWidth | 1px |
| Gradient | borderColor | `rgba(255, 255, 255, 0.08)` |
| Icon | width/height | 48px |
| Icon | borderRadius | 14px |
| Title | fontSize | 15px |
| Title | fontWeight | 600 |
| Subtitle | fontSize | 12px |
| Subtitle | fontStyle | italic |
| Duration | fontSize | 11px |

## 4.5 FilterTags Component

### Tags Configuration

```javascript
const RITUAL_TAGS = [
  { key: 'all', label: 'Tất cả', icon: 'Sparkles' },
  { key: 'healing', label: 'Chữa lành', icon: 'Heart' },
  { key: 'abundance', label: 'Thịnh vượng', icon: 'Coins' },
  { key: 'love', label: 'Tình yêu', icon: 'HeartHandshake' },
  { key: 'custom', label: 'Tùy chỉnh', icon: 'Plus' },
];
```

### Style Specifications

| State | Property | Value |
|-------|----------|-------|
| Default | backgroundColor | `rgba(255, 255, 255, 0.05)` |
| Default | borderColor | `rgba(255, 255, 255, 0.1)` |
| Default | textColor | COLORS.textMuted |
| Selected | backgroundColor | `rgba(255, 215, 0, 0.15)` |
| Selected | borderColor | COLORS.gold |
| Selected | textColor | COLORS.gold |
| Common | paddingHorizontal | 12px |
| Common | paddingVertical | 8px |
| Common | borderRadius | 16px |
| Common | fontSize | 12px |
| Common | iconSize | 14px |

## 4.6 QuickActions Component

### Layout

```
┌─────────────────────┐  ┌─────────────────────┐
│   ＋ Tạo nghi thức  │  │   🌙 Chế độ thiền   │
└─────────────────────┘  └─────────────────────┘
```

### Style Specifications

| Element | Property | Value |
|---------|----------|-------|
| Container | flexDirection | row |
| Container | gap | 12px (SPACING.md) |
| Button | flex | 1 |
| Button | borderRadius | 16px |
| Gradient | flexDirection | row |
| Gradient | alignItems | center |
| Gradient | justifyContent | center |
| Gradient | gap | 8px |
| Gradient | paddingVertical | 14px |
| Gradient | borderWidth | 1px |
| Gradient | borderColor | `rgba(255, 255, 255, 0.1)` |
| Text | fontSize | 13px |
| Text | fontWeight | 600 |
| Create Button | colors | `['rgba(106, 91, 255, 0.2)', 'rgba(106, 91, 255, 0.1)']` |
| Create Button | textColor | COLORS.purple |
| Ambient Button | colors | `['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.1)']` |
| Ambient Button | textColor | COLORS.gold |

## 4.7 SparkleEffect Component

### Animation Specifications

```javascript
// Animation sequence
delay: customizable (default 0)
size: customizable (default 4px)

// Phase 1: Fade In
opacity: 0 → 1 (800ms)
scale: 0.5 → 1 (800ms)

// Phase 2: Fade Out
opacity: 1 → 0 (800ms)
scale: 1 → 0.5 (800ms)

// Loop: infinite
```

### Style

| Property | Value |
|----------|-------|
| backgroundColor | `#FFD700` |
| borderRadius | size / 2 |
| shadowColor | `#FFD700` |
| shadowOpacity | 0.8 |
| shadowRadius | size |

---

# 5. SCREEN SPECIFICATIONS

## 5.1 RitualPlaygroundScreen

### Header Layout

```
┌─────────────────────────────────────────────────────────┐
│  ←   [Icon + Title: Thư Gửi Vũ Trụ]   🔊  ⋮           │
└─────────────────────────────────────────────────────────┘
```

### Header Specifications

| Element | Property | Value |
|---------|----------|-------|
| Container | flexDirection | row |
| Container | alignItems | center |
| Container | justifyContent | space-between |
| Container | paddingHorizontal | 16px |
| Container | paddingVertical | 12px |
| Back Button | width/height | 44px |
| Back Button | borderRadius | 22px |
| Back Button | backgroundColor | `rgba(255, 255, 255, 0.1)` |
| Title | fontSize | 18px (TYPOGRAPHY.fontSize.xxxl) |
| Title | fontWeight | 600 |
| Title | color | `#FFFFFF` |

### Background Specifications

| Property | Value |
|----------|-------|
| Type | LinearGradient |
| Default Colors | `['#0D0221', '#1A0533', '#2D1B4E']` (cosmic purple) |
| Fire Theme | `['#1A0A0A', '#2D1010', '#3D1515']` |
| Star Theme | `['#0A1628', '#152238', '#1E3A5F']` |
| Gold Theme | `['#1A1500', '#2D2500', '#4A3D00']` |

### Ritual Config Structure

```javascript
const RITUAL_CONFIGS = {
  'ritual-id': {
    title: 'Tiêu đề',
    subtitle: 'Mô tả ngắn',
    icon: 'IconName',
    prompt: 'Placeholder text...',
    actionLabel: 'Hướng dẫn hành động',
    completionMessage: 'Thông báo hoàn thành',
    gradients: {
      background: ['#color1', '#color2', '#color3'],
      accent: ['#color1', '#color2'],
    },
    targetZone: 'sky' | 'fire' | 'star' | 'heart' | 'water',
    transformTo: 'star' | 'ash' | 'sparkle' | 'love' | 'ripple',
  },
};
```

## 5.2 RitualHistoryScreen

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  ←     ⏱ Lịch Sử Nghi Thức     📍                     │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │   5          5          Thư vũ trụ                  │ │
│ │ Nghi thức  Ngày liên  Yêu thích                     │ │
│ │            tiếp                                      │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  [Cosmic Map Visualization - Optional View]            │
├─────────────────────────────────────────────────────────┤
│ Filter: [Tất cả] [Thư vũ trụ] [Đốt] [Biết ơn] [Tim]   │
├─────────────────────────────────────────────────────────┤
│ 📅 Nghi Thức Gần Đây                              (5)  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📧 Thư Gửi Vũ Trụ                        2 giờ trước│ │
│ │    "Tôi ước muốn có một công việc..."            → │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔥 Đốt & Giải Phóng                         Hôm qua │ │
│ │    "Tôi buông bỏ nỗi sợ thất bại..."             → │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Stats Card Specifications

| Element | Property | Value |
|---------|----------|-------|
| Container | borderRadius | 20px |
| Container | marginBottom | 16px |
| Gradient | colors | `['rgba(106, 91, 255, 0.15)', 'rgba(157, 78, 221, 0.08)']` |
| Gradient | padding | 16px |
| Gradient | borderWidth | 1px |
| Gradient | borderColor | `rgba(106, 91, 255, 0.2)` |
| Stat Value | fontSize | 20px |
| Stat Value | fontWeight | 700 |
| Stat Value | color | `#FFFFFF` |
| Stat Label | fontSize | 11px |
| Stat Label | color | COLORS.textMuted |
| Icon Container | width/height | 40px |
| Icon Container | borderRadius | 12px |
| Divider | width | 1px |
| Divider | height | 50px |
| Divider | backgroundColor | `rgba(255, 255, 255, 0.1)` |

### Cosmic Map Specifications

| Property | Value |
|----------|-------|
| height | 200px |
| borderRadius | 20px |
| Gradient | `['rgba(13, 2, 33, 0.9)', 'rgba(26, 5, 51, 0.8)']` |
| borderWidth | 1px |
| borderColor | `rgba(106, 91, 255, 0.3)` |
| Star Size | 32px diameter |
| Star BorderRadius | 16px |
| Background Stars | 20 random positions, 1-3px size |

### History Item Specifications

| Element | Property | Value |
|---------|----------|-------|
| Container | borderRadius | 16px |
| Container | marginBottom | 8px |
| Gradient | flexDirection | row |
| Gradient | padding | 12px |
| Gradient | borderWidth | 1px |
| Gradient | borderColor | `rgba(255, 255, 255, 0.08)` |
| Icon | width/height | 48px |
| Icon | borderRadius | 14px |
| Title | fontSize | 15px |
| Title | fontWeight | 600 |
| Content Text | fontSize | 13px |
| Content Text | fontStyle | italic |
| Content Text | numberOfLines | 2 |
| Date | fontSize | 11px |

---

# 6. INDIVIDUAL RITUAL IMPLEMENTATIONS

## 6.1 HeartExpansionRitual

### Config

```javascript
const CONFIG = {
  duration: 7 * 60, // 7 minutes total
  breathCycles: 6,
  breathPattern: { inhale: 4, hold: 2, exhale: 6 }, // 12s per cycle
  heartExpansionDuration: 150, // 2.5 minutes
  xpReward: 25,
};

const THEME = {
  primary: '#FF69B4',
  secondary: '#FFB6C1',
  accent: '#FFD700',
  glow: 'rgba(255, 105, 180, 0.4)',
  bgGradient: ['#1a0b2e', '#2d1b4e', '#1a0b2e'],
};
```

### Phases

| Phase | Description | UI |
|-------|-------------|-----|
| `intro` | Màn hình chào | Pulsing heart + Start button |
| `breath` | Đồng bộ hơi thở | BreathCircle + Counter |
| `expansion` | Vuốt gửi yêu thương | Heart + LoveWave + EnergyBar |
| `completion` | Hoàn thành | XP badge + Actions |

### Gesture Handler

```javascript
// PanResponder for heart expansion phase
onPanResponderGrant: () => {
  setGlowIntensity(1);
  Vibration.vibrate(40);
};

onPanResponderMove: (dx, dy) => {
  distance = sqrt(dx² + dy²);
  if (distance > 60 && abs(dx - lastDx) > 30) {
    // Trigger love wave
    setEnergyLevel(prev => min(100, prev + 8));
    Vibration.vibrate(20);
  }
};
```

### BreathCircle Component

```javascript
// Scale animation based on breath state
switch (breathState) {
  case 'inhale':
    toValue = 1.5;
    duration = CONFIG.breathPattern.inhale * 1000; // 4s
    break;
  case 'hold':
    toValue = 1.5;
    duration = 100;
    break;
  case 'exhale':
    toValue = 1;
    duration = CONFIG.breathPattern.exhale * 1000; // 6s
    break;
}
```

### LoveWave Animation

```javascript
// Wave animation when swiping
translateX: direction === 'left' ? -120 : 120;
scale: 1 → 1.8;
opacity: 1 → 0;
duration: 1200ms;
```

## 6.2 GratitudeFlowRitual

### Config

```javascript
const GOLD_COLORS = {
  primary: '#FFD700',
  secondary: '#FFA500',
  light: '#FFF3B0',
  dark: '#B8860B',
};
```

### Phases

| Phase | Description |
|-------|-------------|
| `start` | Màn hình giới thiệu |
| `input` | Nhập 1-5 điều biết ơn |
| `sending` | Animation gửi lên vũ trụ |
| `completed` | Hoàn thành với XP |

### GoldenParticle Animation

```javascript
// Particle floating upward
startX: random(-0.4, 0.4) * SCREEN_WIDTH;
endX: startX + random(-50, 50);
translateY: 50 → -SCREEN_HEIGHT * 0.5;
opacity: 0 → 1 → 0;
scale: 0 → 1 → 0.5;
duration: fade in 500ms, float up 3000ms;
```

### GratitudeItem Animation

```javascript
// Slide in from left
translateX: -50 → 0;
opacity: 0 → 1;
duration: 300ms;
delay: index * 100ms;
```

## 6.3 CleansingBreathRitual

### Breath Phase Colors

```javascript
const BREATH_COLORS = {
  inhale: '#667EEA',  // Indigo
  hold: '#764BA2',    // Purple
  exhale: '#4ECDC4',  // Teal
  rest: '#44A08D',    // Green
};

const BREATH_CIRCLE_SIZE = 200;
```

### Breath Phases Configuration

```javascript
const BREATH_PHASES = [
  { phase: 'inhale', duration: 4000, text: 'Hít vào...', color: '#667EEA' },
  { phase: 'hold', duration: 4000, text: 'Giữ hơi...', color: '#764BA2' },
  { phase: 'exhale', duration: 4000, text: 'Thở ra...', color: '#4ECDC4' },
  { phase: 'rest', duration: 4000, text: 'Nghỉ...', color: '#44A08D' },
];

// Total: 4 cycles = 16 phases × 4s = ~1 minute
```

### BreathCircle Animation

```javascript
// Scale based on phase
inhale/hold: scale 0.6 → 1.3, glow 0.3 → 0.8;
exhale/rest: scale 1.3 → 0.6, glow 0.8 → 0.3;
duration: 4000ms;
```

### Counter Animation

```javascript
// Number pop effect on change
scale: 0.8 → 1.2 → 1;
duration: 100ms + 200ms;
```

## 6.4 WaterManifestRitual

### Config

```javascript
const WATER_COLORS = {
  primary: '#4ECDC4',
  secondary: '#44A08D',
  light: '#88E5DD',
  dark: '#2D9A90',
  glow: '#00FFE0',
};

const GLASS_SIZE = 180;
```

### Ritual Steps

```javascript
const RITUAL_STEPS = [
  {
    title: 'Chuẩn bị',
    description: 'Đặt một ly nước sạch trước mặt bạn.',
    action: 'Tiếp tục',
  },
  {
    title: 'Viết ý định',
    description: 'Viết rõ ràng điều bạn muốn hiện thực hóa.',
    input: true,
    placeholder: 'Tôi đã đạt được...',
    action: 'Tiếp tục',
  },
  {
    title: 'Nạp năng lượng',
    description: 'Đặt hai tay bao quanh ly nước.',
    duration: 30000,
    action: 'Hoàn thành',
  },
  {
    title: 'Uống nước',
    description: 'Từ từ uống hết ly nước.',
    action: 'Đã uống xong',
  },
];
```

### WaterRipple Animation

```javascript
// 3 concentric ripples
scale: 0.5 → 2;
opacity: 0.8 → 0;
duration: 2000ms;
delays: [0, 600, 1200];
loop: infinite when isActive;
```

### WaterGlass Component

```javascript
// SVG Glass with fill level
fillLevel: 0-1 (percentage);
glowing: boolean (pulsing glow animation);

// Glow pulse when charging
opacity: 0.5 → 1 → 0.5;
duration: 1000ms each direction;
loop: infinite;
```

## 6.5 LetterToUniverseRitual

### Galaxy Colors

```javascript
const GALAXY = {
  nebulaPurple: '#8B5CF6',
  nebulaPink: '#EC4899',
  nebulaBlue: '#3B82F6',
  nebulaCyan: '#06B6D4',
  starWhite: '#FFFFFF',
  starGold: '#FFD700',
  lightCore: '#FFF8E1',
  spaceBlack: '#05040B',
  spaceDark: '#0F0A1F',
};
```

### Animation Components

**ShootingStar:**
```javascript
// Diagonal falling star with tail
startX: varies;
startY: varies;
duration: 2400-3000ms;
endPosition: (+250, +350);
easing: Easing.out(Easing.quad);

// Tail gradient
colors: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.3)', 'transparent'];
width: 100px;
height: 2.5px;
```

**GodRays:**
```javascript
// 12 rays emanating from center
rays: 12;
rotation: 30° apart;
scale: 0 → 1 (spring);
opacity: 0 → 0.5;
rotation: 360° in 40s (loop);

// Center glow
size: 70px;
color: GALAXY.lightCore;
shadowRadius: 50px;
```

**NebulaCloud:**
```javascript
// Pulsing colored clouds
colors: nebulaPurple, nebulaPink, nebulaBlue, nebulaCyan;
sizes: 200-320px;
opacity: 0 → 0.35;
scale: 0.85 ↔ 1.15 (pulse);
duration: 5000ms each direction;
```

**CosmicLetter:**
```javascript
// Phase 1: Lift with rotation (0-3.5s)
translateY: 0 → -180;
rotate: 0 → 7°;
glowOpacity: 0.4 → 1;
duration: 3500ms;

// Phase 2: Transform to light (3.5-6.5s)
scale: 1 → 0.2;
opacity: 1 → 0;
duration: 3000ms;
```

---

# 7. ANIMATION & EFFECTS SYSTEM

## 7.1 Common Animations

### Press Scale Effect

```javascript
// Used in all touchable cards
onPressIn: Animated.spring(scale, {
  toValue: 0.97 | 1.03,  // 0.97 for large, 1.03 for small
  useNativeDriver: true,
});

onPressOut: Animated.spring(scale, {
  toValue: 1,
  useNativeDriver: true,
});
```

### Glow Pulse Effect

```javascript
// Continuous glow animation
Animated.loop(
  Animated.sequence([
    Animated.timing(glow, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }),
    Animated.timing(glow, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: false,
    }),
  ])
);

// Interpolation
glowOpacity: glow.interpolate({
  inputRange: [0, 1],
  outputRange: [0.3, 0.6],
});
```

### Fade In Effect

```javascript
Animated.timing(opacity, {
  toValue: 1,
  duration: 1000,
  useNativeDriver: true,
});
```

## 7.2 Particle Systems

### Base Particle

```javascript
// Standard particle floating upward
const Particle = ({ delay, size = 4, color = '#FFD700' }) => {
  opacity: 0 → 1 → 0;
  translateY: 0 → -100;
  scale: 0.3 → 1 → 0.5;

  // Timing
  phase1: 500ms (fade in, scale up)
  phase2: 1500ms (fade out) + 2000ms (float up)

  // Loop
  loop: infinite with cleanup
};
```

### Background Star

```javascript
// Twinkling background star
opacity: 0.3 ↔ 1;
duration: 1000-2000ms (random);
loop: infinite;
```

### Ember Particle (Fire)

```javascript
// Upward floating ember for burn ritual
translateY: 0 → varying negative;
translateX: startX → random drift;
opacity: 0 → 1 → 0;
scale: 0.5 → 1 → 0.3;
color: orange to red gradient;
```

## 7.3 Haptic Feedback

| Action | Vibration Pattern |
|--------|-------------------|
| Start Ritual | `100ms` |
| Phase Change | `50ms` |
| Add Item | `50ms` |
| Touch Heart | `40ms` |
| Love Wave | `20ms` |
| Completion | `[0, 100, 50, 100, 50, 100]` |
| Breath Phase | `30ms` |

## 7.4 Audio Integration

### Sound Files Required

| Ritual | Sound File | Loop | Volume |
|--------|------------|------|--------|
| Heart Expansion | `ambient_heart.mp3` | Yes | 0.3 |
| Gratitude Flow | `chime.mp3` | Yes | 0.3 |
| Cleansing Breath | `breathing.mp3` | Yes | 0.3 |
| Water Manifest | `water.mp3` | Yes | 0.3 |
| Letter to Universe | (none) | - | - |

### Sound Controls

```javascript
// Toggle mute
if (isMuted) {
  await sound.playAsync();
} else {
  await sound.pauseAsync();
}

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (sound) sound.unloadAsync();
  };
}, [sound]);
```

---

# 8. DESIGN TOKENS & THEME

## 8.1 Color Palette

### Primary Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| gold | `#FFBD59` | Primary accent, badges |
| goldBright | `#FFD700` | Highlights, particles |
| purple | `#6A5BFF` | Secondary accent |
| purpleGlow | `#8C64FF` | Glow effects |

### Background Gradients

| Name | Colors | Usage |
|------|--------|-------|
| Cosmic Purple | `['#0D0221', '#1A0533', '#2D1B4E']` | Default ritual bg |
| Fire Red | `['#1A0A0A', '#2D1010', '#3D1515']` | Burn ritual |
| Ocean Blue | `['#0A1628', '#152238', '#1E3A5F']` | Water/Star ritual |
| Golden | `['#1A1500', '#2D2500', '#4A3D00']` | Gratitude ritual |
| Space Black | `['#05040B', '#0F1030', '#1a0b2e']` | Letter ritual |

### Text Colors

| Name | Value | Usage |
|------|-------|-------|
| textPrimary | `#FFFFFF` | Main text |
| textSecondary | `rgba(255, 255, 255, 0.8)` | Secondary text |
| textMuted | `rgba(255, 255, 255, 0.6)` | Subtle text |
| textDisabled | `rgba(255, 255, 255, 0.4)` | Disabled |

### Ritual-Specific Colors

| Ritual | Primary | Gradient |
|--------|---------|----------|
| Heart | `#FF69B4` | `['#F093FB', '#F5576C']` |
| Gratitude | `#FFD700` | `['#FFD700', '#FFA500']` |
| Breath | `#667EEA` | `['#667EEA', '#764BA2']` |
| Water | `#4ECDC4` | `['#4ECDC4', '#44A08D']` |
| Letter | `#9D4EDD` | `['#6A5BFF', '#9D4EDD']` |
| Burn | `#FF6B6B` | `['#FF6B6B', '#FF8E53']` |
| Star | `#4ECDC4` | `['#4ECDC4', '#44A08D']` |

## 8.2 Spacing

```javascript
const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  huge: 32,
  giant: 40,
};
```

## 8.3 Typography

```javascript
const TYPOGRAPHY = {
  fontSize: {
    xs: 10,
    sm: 11,      // Labels, duration
    md: 12,      // Small text
    base: 13,    // Body small
    lg: 14,      // Body
    xl: 15,      // Buttons
    xxl: 16,     // Large body
    xxxl: 18,    // Card titles
    display: 20, // Headers
    hero: 32,    // Large displays
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};
```

## 8.4 Border Radius

```javascript
const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 24,
  full: 9999,
};
```

## 8.5 Glass Effect

```javascript
const GLASS = {
  background: 'rgba(15, 16, 48, 0.55)',
  blur: 18,
  borderWidth: 1.2,
  borderRadius: 18,
  borderStart: '#6A5BFF',
  borderEnd: '#00F0FF',
};
```

---

# 9. DATABASE SCHEMA

## 9.1 Tables

### vision_rituals (Master List)

```sql
CREATE TABLE vision_rituals (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_vi VARCHAR(100),
  description TEXT,
  category VARCHAR(50) NOT NULL,
  duration_minutes INTEGER DEFAULT 5,
  icon VARCHAR(50),
  color VARCHAR(20),
  xp_per_completion INTEGER DEFAULT 20,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### vision_ritual_completions

```sql
CREATE TABLE vision_ritual_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ritual_id VARCHAR(50) REFERENCES vision_rituals(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER,
  user_input TEXT,
  reflection TEXT,
  xp_earned INTEGER DEFAULT 0,
  goal_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### vision_ritual_streaks

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

## 9.2 Indexes

```sql
CREATE INDEX idx_vision_ritual_completions_user
  ON vision_ritual_completions(user_id);
```

## 9.3 Row Level Security

```sql
ALTER TABLE vision_ritual_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_ritual_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ritual_completions"
  ON vision_ritual_completions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own ritual_streaks"
  ON vision_ritual_streaks FOR ALL
  USING (auth.uid() = user_id);
```

## 9.4 Seed Data

```sql
INSERT INTO vision_rituals VALUES
('star-wish', 'Star Wish Ritual', 'Nghi Thức Ước Sao',
  'Gửi ước nguyện lên vũ trụ', 'manifest', 3, 'star', '#00CED1', 20, 1),
('cleansing-breath', 'Cleansing Breath', 'Thở Thanh Lọc',
  'Giải phóng căng thẳng', 'spiritual', 5, 'wind', '#4A90A4', 20, 2),
('heart-expansion', 'Heart Expansion', 'Mở Rộng Trái Tim',
  'Nghi thức tần số yêu thương', 'healing', 7, 'heart', '#FF69B4', 25, 3),
('gratitude-flow', 'Gratitude Flow', 'Dòng Chảy Biết Ơn',
  'Thu hút phước lành', 'prosperity', 4, 'gift', '#FFD700', 20, 4),
('water-manifest', 'Water Manifestation', 'Nghi Thức Nước',
  'Manifest ước muốn qua nước', 'manifest', 5, 'droplet', '#4169E1', 25, 5);
```

---

# 10. SERVICE LAYER & API

## 10.1 ritualService.js

### Exported Functions

```typescript
// Get all active rituals
getAllRituals(): Promise<Ritual[]>

// Get ritual by ID
getRitualById(ritualId: string): Promise<Ritual | null>

// Get user's ritual progress (streaks)
getUserRitualProgress(userId: string): Promise<RitualProgress[]>

// Complete a ritual
completeRitual(
  userId: string,
  ritualSlug: string,
  content?: string
): Promise<CompletionResult>

// Get today's completed rituals
getTodayCompletions(userId: string): Promise<string[]>

// Get ritual history
getRitualHistory(userId: string, limit?: number): Promise<Completion[]>

// Get ritual statistics
getRitualStats(userId: string): Promise<RitualStats>

// Get time-based recommendations
getRecommendedRituals(userId: string): Promise<Ritual[]>
```

### RITUAL_TYPES Constant

```javascript
export const RITUAL_TYPES = {
  'heart-expansion': {
    id: 'heart-expansion',
    title: 'Mở Rộng Trái Tim',
    subtitle: 'Nghi thức tần số yêu thương',
    icon: 'Heart',
    color: '#F093FB',
    duration: 5,
    category: 'love',
    description: '...',
    steps: ['...', '...'],
  },
  // ... other rituals
};
```

### completeRitual Logic

```javascript
async function completeRitual(userId, ritualSlug, content) {
  // 1. Get or create ritual in database
  // 2. Check if already completed today
  // 3. Log completion in vision_ritual_completions
  // 4. Update streak in vision_ritual_streaks
  // 5. Award XP (base + streak bonuses)
  // 6. Update daily summary

  return {
    success: true,
    xpEarned: number,
    newStreak: number,
    isNewBest: boolean,
  };
}
```

### XP Rewards

```javascript
// Base XP
ritual_complete: 20-30 XP (varies by ritual)

// Streak Bonuses
7-day streak: +50 XP
30-day streak: +200 XP
```

### Time-Based Recommendations

```javascript
function getRecommendedRituals(userId) {
  const hour = new Date().getHours();

  // Morning (5-11): Energizing
  if (hour >= 5 && hour < 11) {
    return ['gratitude-flow', 'heart-expansion', 'water-manifest'];
  }

  // Afternoon (11-17): Manifestation
  if (hour >= 11 && hour < 17) {
    return ['letter-to-universe', 'star-wish', 'water-manifest'];
  }

  // Evening (17-22): Release
  if (hour >= 17 && hour < 22) {
    return ['burn-release', 'cleansing-breath', 'gratitude-flow'];
  }

  // Night (22-5): Calming
  return ['cleansing-breath', 'heart-expansion'];
}
```

---

# 11. GAMIFICATION SYSTEM

## 11.1 XP System

| Ritual | Base XP |
|--------|---------|
| Star Wish | 20 XP |
| Cleansing Breath | 20 XP |
| Gratitude Flow | 20 XP |
| Water Manifest | 25 XP |
| Heart Expansion | 25 XP |
| Letter to Universe | 25 XP |
| Burn & Release | 25 XP |

### Streak Bonuses

| Milestone | Bonus XP |
|-----------|----------|
| 7-day streak | +50 XP |
| 30-day streak | +200 XP |

## 11.2 Streak Tracking

```javascript
// Streak logic
function updateRitualStreak(userId, ritualId) {
  // Check if completed yesterday
  const yesterdayCompletion = await getYesterdayCompletion();

  if (yesterdayCompletion) {
    // Continue streak
    newStreak = currentStreak + 1;
  } else {
    // Reset streak
    newStreak = 1;
  }

  // Update best streak
  bestStreak = max(bestStreak, newStreak);

  return { newStreak, isNewBest: newStreak > oldBestStreak };
}
```

## 11.3 Completion Badge UI

```
┌──────────────────────────┐
│  ✦ +25 XP               │
│  🔥 5 ngày streak       │
└──────────────────────────┘
```

### Badge Style

| Property | Value |
|----------|-------|
| backgroundColor | `rgba(255, 215, 0, 0.15)` |
| paddingHorizontal | 16px |
| paddingVertical | 8px |
| borderRadius | 20px |
| borderWidth | 1px |
| borderColor | `rgba(255, 215, 0, 0.25)` |
| textColor | COLORS.gold |
| fontSize | 15-16px |
| fontWeight | 600-700 |

---

# 12. ACCESS CONTROL

## 12.1 Tier-Based Access

| Feature | Free | Tier 1 | Tier 2 | Tier 3 |
|---------|------|--------|--------|--------|
| Basic Rituals (3) | ✅ | ✅ | ✅ | ✅ |
| All Rituals (7) | ❌ | ✅ | ✅ | ✅ |
| Ritual History | Limited | Full | Full | Full |
| Custom Rituals | ❌ | ❌ | ✅ | ✅ |
| Streak Bonuses | ❌ | ✅ | ✅ | ✅ |
| Ambient Mode | ❌ | ✅ | ✅ | ✅ |

## 12.2 Free Tier Rituals

- Star Wish (star-wish)
- Cleansing Breath (cleansing-breath)
- Gratitude Flow (gratitude-flow)

## 12.3 Premium Rituals (Tier 1+)

- Heart Expansion (heart-expansion)
- Water Manifest (water-manifest)
- Letter to Universe (letter-to-universe)
- Burn & Release (burn-release)

## 12.4 Implementation

```javascript
// TierGuard component usage
<TierGuard requiredTier={1} featureName="Heart Expansion Ritual">
  <HeartExpansionRitual />
</TierGuard>

// Or check in ritual library
const isLocked = !canAccessRitual(user.tier, ritual.id);
```

---

# 13. NAVIGATION & ROUTING

## 13.1 Stack Configuration (AccountStack.js)

```javascript
// Ritual Screens in AccountStack
<Stack.Screen
  name="RitualPlayground"
  component={RitualPlaygroundScreen}
/>
<Stack.Screen
  name="RitualHistory"
  component={RitualHistoryScreen}
/>
<Stack.Screen
  name="HeartExpansionRitual"
  component={HeartExpansionRitual}
/>
<Stack.Screen
  name="GratitudeFlowRitual"
  component={GratitudeFlowRitual}
/>
<Stack.Screen
  name="CleansingBreathRitual"
  component={CleansingBreathRitual}
/>
<Stack.Screen
  name="WaterManifestRitual"
  component={WaterManifestRitual}
/>
<Stack.Screen
  name="LetterToUniverseRitual"
  component={LetterToUniverseRitual}
/>
```

## 13.2 RITUAL_SCREENS Mapping

```javascript
// rituals/index.js
export const RITUAL_SCREENS = {
  'heart-expansion': 'HeartExpansionRitual',
  'gratitude-flow': 'GratitudeFlowRitual',
  'cleansing-breath': 'CleansingBreathRitual',
  'water-manifest': 'WaterManifestRitual',
  'letter-to-universe': 'LetterToUniverseRitual',
  'burn-release': 'RitualPlayground',
  'star-wish': 'RitualPlayground',
};
```

## 13.3 Navigation Flow

```
VisionBoardScreen
    │
    ├── FeaturedRitualSection.onRitualPress(ritual)
    │       │
    │       ├── if RITUAL_SCREENS[ritual.id] exists
    │       │       └── navigate(RITUAL_SCREENS[ritual.id])
    │       │
    │       └── else
    │               └── navigate('RitualPlayground', { ritualType: ritual.id })
    │
    ├── onViewAllRituals()
    │       └── navigate('RitualHistory')
    │
    └── QuickActions
            ├── onCreateRitual() → TBD
            └── onAmbientMode() → TBD
```

---

# 14. WIREFRAMES & LAYOUT

## 14.1 FeaturedRitualSection Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🌙 Nghi Thức Gợi Ý                                    Xem tất cả →     │
├─────────────────────────────────────────────────────────────────────────┤
│ ╔═══════════════════════════════════════════════════════════════════╗  │
│ ║ ★ Nghi thức hôm nay                                 ⏱ 5-10 phút ║  │
│ ║  ✧  ·  ✧                                                         ║  │
│ ║                                                                   ║  │
│ ║  ┌──────────┐  Thư Gửi Vũ Trụ                                    ║  │
│ ║  │   📧     │  "Gửi điều ước đến vũ trụ bao la"                  ║  │
│ ║  │ (64×64)  │                                                    ║  │
│ ║  └──────────┘  [ý định] [mở rộng]                                ║  │
│ ║                                                                   ║  │
│ ║                                        ┌──────────────────┐      ║  │
│ ║  ✧                                     │   Bắt đầu   →   │      ║  │
│ ║                                        └──────────────────┘      ║  │
│ ╚═══════════════════════════════════════════════════════════════════╝  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ✨ Thư Viện Nghi Thức                                             │  │
│ ├───────────────────────────────────────────────────────────────────┤  │
│ │ [✨ Tất cả] [❤ Chữa lành] [💰 Thịnh vượng] [💕 Tình yêu] [+ Tùy] │  │
│ ├───────────────────────────────────────────────────────────────────┤  │
│ │ ┌────────────┐ ┌────────────┐ ┌────────────┐                     │  │
│ │ │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │                     │  │
│ │ │ │ 🔥     │ │ │ │ 💧     │ │ │ │ 💨     │ │  ← Horizontal      │  │
│ │ │ │ (48px) │ │ │ │ (48px) │ │ │ │ (48px) │ │    Scroll          │  │
│ │ │ └────────┘ │ │ └────────┘ │ │ └────────┘ │                     │  │
│ │ │ Đốt &     │ │ │ Nghi Thức │ │ │ Thở      │ │                     │  │
│ │ │ Giải Phóng│ │ │ Nước      │ │ │ Thanh Lọc│ │                     │  │
│ │ │ ⏱ 5 phút │ │ │ ⏱ 5 phút │ │ │ ⏱ 5 phút │ │                     │  │
│ │ └────────────┘ └────────────┘ └────────────┘                     │  │
│ │ (140×160px each)                                                  │  │
│ ├───────────────────────────────────────────────────────────────────┤  │
│ │ Các nghi thức khác                                                │  │
│ │ ┌─────────────────────────────────────────────────────────────┐  │  │
│ │ │ 💖 Mở Rộng Trái Tim           "Nghi thức tần số..."  7 phút →│  │  │
│ │ └─────────────────────────────────────────────────────────────┘  │  │
│ │ ┌─────────────────────────────────────────────────────────────┐  │  │
│ │ │ 🎁 Dòng Chảy Biết Ơn         "Thu hút thêm..."       4 phút →│  │  │
│ │ └─────────────────────────────────────────────────────────────┘  │  │
│ └───────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐  ┌─────────────────────────┐               │
│ │    ＋ Tạo nghi thức     │  │    🌙 Chế độ thiền      │               │
│ └─────────────────────────┘  └─────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

## 14.2 Individual Ritual Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← [Back]     ❤ Mở Rộng Trái Tim           🔊 [Sound]   ⋮ [More]        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                        ✧  ·  ·  ✧                                      │
│                   ·                    ·                                │
│                                                                         │
│                         ╔═══════════╗                                  │
│                         ║    💖     ║                                  │
│                         ║  (Heart)  ║   ← Central Visual               │
│                         ║   120px   ║                                  │
│                         ╚═══════════╝                                  │
│                                                                         │
│                  ～～～  [Glow]  ～～～                                  │
│                                                                         │
│                                                                         │
│                  "Chạm giữ vào trái tim                                │
│                   rồi vuốt ra để lan tỏa yêu thương"                   │
│                                                                         │
│                  ┌────────────────────────────────────┐                │
│                  │ Năng lượng: [████████░░] 80%       │                │
│                  └────────────────────────────────────┘                │
│                                                                         │
│                  Thời gian còn: 2:30                                   │
│                                                                         │
│                      ✧      ·      ✧                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 14.3 Completion Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                              ✧                                         │
│                         ·    ✦    ·                                    │
│                              ✧                                         │
│                                                                         │
│                         ╔═══════════╗                                  │
│                         ║    💖     ║                                  │
│                         ║  (80px)   ║                                  │
│                         ╚═══════════╝                                  │
│                    ✦ ・ ✦ ・ ✦ ・ ✦                                    │
│                                                                         │
│               "Trái tim bạn đã được mở rộng ✦"                         │
│                                                                         │
│              ┌─────────────┐   ┌─────────────────┐                     │
│              │   +25 XP    │   │  🔥 5 ngày streak │                   │
│              └─────────────┘   └─────────────────┘                     │
│                                                                         │
│           ┌─────────────────────────────────────────┐                  │
│           │    ✏️  Ghi cảm nhận                     │                  │
│           └─────────────────────────────────────────┘                  │
│           ┌─────────────────────────────────────────┐                  │
│           │    ⭐  Thêm vào Vision Board            │                  │
│           └─────────────────────────────────────────┘                  │
│           ┌─────────────────────────────────────────┐                  │
│           │    🎯  Liên kết với mục tiêu            │                  │
│           └─────────────────────────────────────────┘                  │
│                                                                         │
│           ┌═════════════════════════════════════════┐                  │
│           ║           ✓  Hoàn thành                 ║                  │
│           └═════════════════════════════════════════┘                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 14.4 Ritual History Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← [Back]       ⏱ Lịch Sử Nghi Thức                  📍 [Map Toggle]    │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ┌─────────────┐│┌─────────────┐│┌─────────────┐                   │  │
│ │ │   📊        ││   📈        ││   ⭐        │                   │  │
│ │ │   40px      ││   40px      ││   40px      │                   │  │
│ │ │             ││             ││             │                   │  │
│ │ │     5       ││     5       ││  Thư vũ trụ │                   │  │
│ │ │  Nghi thức  ││ Ngày liên   ││  Yêu thích  │                   │  │
│ │ └─────────────┘│└─────────────┘│└─────────────┘                   │  │
│ └───────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │  🌙 Bản Đồ Vũ Trụ                                                 │  │
│ │ ┌─────────────────────────────────────────────────────────────┐  │  │
│ │ │  ·    ·       ·         ·      ·     ·                      │  │  │
│ │ │       ★📧          ·          ★🔥     ·                      │  │  │
│ │ │  ·              ★🎁       ·              ·                   │  │  │
│ │ │      ·     ·         🌙          ·    ★💖                    │  │  │
│ │ │          ★⭐     ·        ·    ·           ·                 │  │  │
│ │ │   ·              ·                    ·                     │  │  │
│ │ └─────────────────────────────────────────────────────────────┘  │  │
│ │              Mỗi ngôi sao là một nghi thức bạn đã hoàn thành     │  │
│ └───────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│ [✨ Tất cả] [📧 Thư vũ trụ] [🔥 Đốt] [🎁 Biết ơn] [💖 Tim]           │
├─────────────────────────────────────────────────────────────────────────┤
│ 📅 Nghi Thức Gần Đây                                            (5)   │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ┌────────┐ Thư Gửi Vũ Trụ                            2 giờ trước │  │
│ │ │ 📧     │ "Tôi ước muốn có một công việc tốt..."              → │  │
│ │ │ (48px) │ ⏱ 2 giờ trước                                         │  │
│ │ └────────┘                                                        │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ┌────────┐ Đốt & Giải Phóng                                Hôm qua│  │
│ │ │ 🔥     │ "Tôi buông bỏ nỗi sợ thất bại..."                    → │  │
│ │ └────────┘                                                        │  │
│ └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# APPENDIX

## A. Icon Mapping

```javascript
const ICONS = {
  Moon: 'Moon',
  Sparkles: 'Sparkles',
  Heart: 'Heart',
  Coins: 'Coins',
  HeartHandshake: 'HeartHandshake',
  Plus: 'Plus',
  Mail: 'Mail',
  Flame: 'Flame',
  Star: 'Star',
  Wind: 'Wind',
  Gift: 'Gift',
  Clock: 'Clock',
  ChevronRight: 'ChevronRight',
  ArrowRight: 'ArrowRight',
  Feather: 'Feather',
  Sun: 'Sun',
  Leaf: 'Leaf',
  Droplets: 'Droplets',
  Zap: 'Zap',
};
```

## B. File Dependencies

### FeaturedRitualSection.js

```javascript
import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Sparkles, Heart, ... } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/tokens';
```

### Individual Ritual Screens

```javascript
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import Svg, { Circle, Path, ... } from 'react-native-svg';
import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual } from '../../../services/ritualService';
```

## C. Performance Considerations

1. **Animation Cleanup**: Tất cả animations đều có cleanup function trong useEffect return
2. **Memoization**: BackgroundStar và particle arrays được memoized với useMemo
3. **Sound Unload**: Audio resources được unload khi unmount
4. **Interval Cleanup**: Tất cả setInterval/setTimeout được clear khi component unmount
5. **Lazy Loading**: Individual ritual screens không được bundle cùng nhau

---

**END OF DOCUMENT**
