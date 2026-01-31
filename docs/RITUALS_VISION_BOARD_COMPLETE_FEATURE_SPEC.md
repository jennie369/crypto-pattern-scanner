# RITUALS & VISION BOARD - ĐẶC TẢ TÍNH NĂNG HOÀN CHỈNH
## Vision Board 2.0 - GEM Mobile App

**Phiên bản tài liệu:** 4.1
**Ngày tạo:** 28/12/2025
**Cập nhật lần cuối:** 29/01/2026

---

# TỔNG QUAN MARKETING

## Giới Thiệu Tính Năng

**Vision Board 2.0** là hệ sinh thái tâm linh và phát triển bản thân toàn diện, kết hợp **Rituals (Nghi Thức)**, **Calendar Smart Journal (Nhật Ký Thông Minh)**, và **Gamification** để giúp người dùng xây dựng thói quen tích cực, theo dõi hành trình phát triển, và kết nối với năng lượng vũ trụ mỗi ngày.

### Giá Trị Cốt Lõi

**"Biến mỗi ngày thành một cuộc hành trình tâm linh ý nghĩa"**

| Lợi Ích | Mô Tả |
|---------|-------|
| **Mindfulness Daily** | 8 nghi thức độc đáo giúp người dùng bắt đầu ngày mới với tâm trí thanh tịnh và năng lượng tích cực |
| **Smart Tracking** | Calendar Smart Journal tích hợp 6 nguồn dữ liệu (Rituals, Journal, Trading, Divination, Goals, Mood) để theo dõi toàn diện |
| **Gamification** | Hệ thống XP, Streak, Achievements tạo động lực duy trì thói quen hàng ngày |
| **Beautiful UX** | Giao diện Cosmic Glassmorphism với video backgrounds, Lottie animations, và particle effects |
| **Trading Integration** | Trading Journal giúp traders ghi nhận và phân tích giao dịch, kết nối với divination readings |

### Đối Tượng Người Dùng

1. **Người thực hành mindfulness** - Muốn bắt đầu/kết thúc ngày với nghi thức tâm linh
2. **Crypto traders** - Muốn ghi nhật ký giao dịch và sử dụng divination để hỗ trợ quyết định
3. **Goal-setters** - Muốn theo dõi mục tiêu và xây dựng thói quen tích cực
4. **Người yêu tâm linh** - Muốn trải nghiệm tarot, I Ching và các nghi thức manifestation

### Tính Năng Nổi Bật

#### 1. Rituals - Nghi Thức Tâm Linh
- **8 loại nghi thức** với animation, video và âm thanh độc đáo
- **Video backgrounds** cosmic/mystical cho trải nghiệm nhập tâm
- **XP rewards** 25-35 XP mỗi nghi thức
- **Streak tracking** với bonus XP cho chuỗi ngày liên tục

#### 2. Calendar Smart Journal - Nhật Ký Thông Minh (MỚI)
- **Journal Entry** - Ghi nhật ký với mood, tags, life areas
- **Trading Journal** - Ghi nhận giao dịch với P/L, discipline checklist, emotions
- **Mood Tracking** - Check-in buổi sáng/trưa/tối với mood, energy, sleep quality
- **Unified Calendar View** - Xem tất cả hoạt động trên một calendar
- **Heat Map** - Visualization hoạt động theo tháng

#### 3. Divination - Trải Bài & Gieo Quẻ
- **Tarot Reading** - Trải bài với AI interpretation
- **I Ching** - Gieo quẻ Kinh Dịch với trading insights
- **Auto-log to Calendar** - Tự động ghi vào calendar khi làm reading

#### 4. Gamification
- **XP System** - Tích điểm qua mỗi hoạt động
- **Streak Badges** - Huy hiệu cho chuỗi ngày liên tục (3, 7, 14, 30, 60, 90, 180, 365 ngày)
- **Achievements** - Thành tựu unlock qua milestones
- **Level System** - Cấp bậc tăng theo XP

### Phân Quyền Theo Cấp (Tier Access)

| Tính năng | FREE | TIER1 | TIER2 | TIER3 |
|-----------|------|-------|-------|-------|
| Basic Rituals (3) | Có | Có | Có | Có |
| All Rituals (8) | Không | Có | Có | Có |
| Journal Entries | 3/ngày | 10/ngày | Không giới hạn | Không giới hạn |
| Trading Journal | Không | 5/ngày | 20/ngày | Không giới hạn |
| Mood Tracking | 2/ngày | 5/ngày | Không giới hạn | Không giới hạn |
| History Access | 7 ngày | 30 ngày | 90 ngày | Không giới hạn |
| AI Insights | Không | Không | Không | Có |
| Export Data | Không | Không | Có | Có |

### Screenshots & UI Highlights

**Vision Board Dashboard:**
- Daily Score Card hiển thị XP, mood, completions
- Quick Action Bar để truy cập nhanh các tính năng
- Featured Ritual gợi ý nghi thức phù hợp theo thời gian
- Calendar HeatMap visualization

**Ritual Screens:**
- Video Background loop tạo không gian thư giãn
- Particle Effects và Lottie animations
- Step-by-step guidance với timers
- Completion Celebration với confetti

**Calendar Smart Journal:**
- Month view với heat map màu sắc
- Day timeline hiển thị tất cả activities
- Mood picker với energy/sleep tracking
- Quick entry buttons cho mỗi loại nhật ký

---

# MỤC LỤC

1. [Tổng Quan](#1-tổng-quan)
2. [Trạng Thái Triển Khai Hiện Tại](#2-trạng-thái-triển-khai-hiện-tại)
3. [Kiến Trúc Tính Năng](#3-kiến-trúc-tính-năng)
4. [Hệ Thống Context (Split Architecture)](#4-hệ-thống-context-split-architecture)
5. [Calendar Smart Journal System (MỚI)](#5-calendar-smart-journal-system-mới)
6. [Danh Mục Nghi Thức](#6-danh-mục-nghi-thức)
7. [Hệ Thống Cosmic Components](#7-hệ-thống-cosmic-components)
8. [VisionBoard UI Components](#8-visionboard-ui-components)
9. [Đặc Tả Màn Hình](#9-đặc-tả-màn-hình)
10. [Triển Khai Nghi Thức Chi Tiết](#10-triển-khai-nghi-thức-chi-tiết)
11. [Hệ Thống Animation & Effects](#11-hệ-thống-animation--effects)
12. [Design Tokens & Theme](#12-design-tokens--theme)
13. [Database Schema](#13-database-schema)
14. [Service Layer & API](#14-service-layer--api)
15. [Hệ Thống Gamification & Achievement](#15-hệ-thống-gamification--achievement)
16. [Hệ Thống Cache](#16-hệ-thống-cache)
17. [Access Control](#17-access-control)
18. [Navigation & Routing](#18-navigation--routing)
19. [Các Vấn Đề Đã Biết & Cách Khắc Phục](#19-các-vấn-đề-đã-biết--cách-khắc-phục)
20. [Tối Ưu Hóa Hiệu Năng](#20-tối-ưu-hóa-hiệu-năng)

---

# 1. TỔNG QUAN

## 1.1 Mô Tả Tính Năng

Vision Board 2.0 là hệ thống quản lý mục tiêu và phát triển bản thân tích hợp trong GEM Mobile, bao gồm:

- **Rituals**: 8 nghi thức tâm linh với cosmic design
- **Calendar Smart Journal**: Nhật ký thông minh tích hợp 6 nguồn dữ liệu
- **Goals & Habits**: Quản lý mục tiêu và thói quen
- **Divination**: Tarot và I Ching với AI interpretation
- **Gamification**: XP, Streaks, Achievements

## 1.2 Các Tính Năng Chính

| Tính Năng | Mô Tả | Trạng Thái |
|-----------|-------|------------|
| 8 Loại Nghi Thức | 8 loại nghi thức khác nhau với animation unique | Đã triển khai |
| Cosmic Theme | Giao diện cosmic/mystic với particle effects | Đã triển khai |
| Video Backgrounds | Video loop backgrounds cho mỗi ritual | Đã triển khai |
| Lottie Animations | Smooth Lottie animations cho từng ritual | Đã triển khai |
| Audio Integration | Ambient sounds cho mỗi nghi thức | Đã triển khai |
| XP Rewards | 25-35 XP mỗi lần hoàn thành | Đã triển khai |
| Streak Tracking | Theo dõi streak liên tục với bonus | Đã triển khai |
| Achievement System | Badges và rewards cho milestones | Đã triển khai |
| Context Split | 6 split contexts for performance | Đã triển khai |
| Calendar Smart Journal | Unified journal với 6 data sources | **MỚI** Đã triển khai |
| Journal Entries | Ghi nhật ký với mood, tags | **MỚI** Đã triển khai |
| Trading Journal | Ghi nhận giao dịch với P/L, emotions | **MỚI** Đã triển khai |
| Mood Tracking | Morning/midday/evening mood check-in | **MỚI** Đã triển khai |
| Divination Auto-Log | Tự động log tarot/iching to calendar | **MỚI** Đã triển khai |

## 1.3 Cấu Trúc Files

```
gem-mobile/src/
├── screens/VisionBoard/
│   ├── VisionBoardScreen.js           # Màn hình chính
│   ├── CalendarScreen.js              # Xem lịch (ĐÃ CẬP NHẬT)
│   ├── JournalEntryScreen.js          # MỚI: Tạo nhật ký
│   ├── TradingJournalScreen.js        # MỚI: Nhật ký giao dịch
│   ├── CalendarSettingsScreen.js      # MỚI: Cài đặt lịch
│   ├── RitualPlaygroundScreen.js      # Sân chơi nghi thức
│   ├── RitualHistoryScreen.js         # Lịch sử nghi thức
│   ├── AchievementsScreen.js          # Thành tựu
│   ├── DailyRecapScreen.js            # Tổng kết hàng ngày
│   ├── GoalDetailScreen.js            # Chi tiết mục tiêu
│   ├── index.js                       # Exports
│   └── rituals/                       # Các màn hình nghi thức riêng
├── components/
│   ├── Rituals/
│   │   ├── FeaturedRitualSection.js
│   │   └── cosmic/                    # Shared cosmic components
│   ├── Calendar/
│   │   ├── MonthCalendar.js           # Component lịch tháng
│   │   ├── DayDetailModal.js          # Modal chi tiết ngày (ĐÃ CẬP NHẬT)
│   │   └── index.js
│   └── VisionBoard/
│       ├── index.js                   # Tất cả exports
│       │   # Components Hiện Có
│       ├── DivinationSection.js
│       ├── DailyScoreCard.js
│       ├── StreakBanner.js
│       ├── QuotaBar.js
│       ├── ActivityFeed.js
│       │
│       │   # UI Components (Tháng 1/2026)
│       ├── WidgetSkeleton.js          # Skeleton loading states
│       ├── CalendarHeatMap.js         # Activity heat map
│       ├── DayTimeline.js             # Daily timeline view
│       ├── RitualProgressBar.js       # Animated progress bars
│       ├── StreakBadge.js             # Streak badges
│       ├── CompletionModal.js         # Celebration modal
│       ├── Tooltip.js                 # Tooltips và onboarding
│       │
│       │   # MỚI: Calendar Smart Journal Components (28-29/01/2026)
│       ├── MoodPicker.js              # Modal chọn mood
│       ├── TagInput.js                # Input tags với autocomplete
│       ├── DisciplineChecklist.js     # Tracking kỷ luật trading
│       ├── QuickActionBar.js          # Hàng nút hành động nhanh
│       ├── DailySummaryCard.js        # Card tổng kết ngày
│       ├── TimelineItem.js            # Item timeline
│       ├── JournalEntryCard.js        # Card nhật ký
│       ├── TradingEntryCard.js        # Card giao dịch
│       └── OnboardingOverlay.js       # Onboarding tính năng
├── contexts/
│   ├── VisionBoardContext.js          # Combined Provider
│   ├── RitualContext.js               # State nghi thức
│   ├── GoalContext.js                 # Goals và actions
│   ├── HabitContext.js                # Habits và affirmations
│   ├── DivinationContext.js           # Divination readings
│   └── CalendarContext.js             # Calendar, stats (ĐÃ CẬP NHẬT)
├── services/
│   ├── ritualService.js               # Business logic nghi thức
│   ├── calendarService.js             # Calendar events (ĐÃ CẬP NHẬT)
│   ├── calendarJournalService.js      # MỚI: CRUD nhật ký
│   ├── tradingJournalService.js       # MỚI: Nhật ký giao dịch
│   ├── moodTrackingService.js         # MỚI: Theo dõi mood
│   ├── calendarNotificationService.js # MỚI: Notifications
│   ├── achievementService.js          # Hệ thống thành tựu
│   ├── tarotService.js                # Tarot (ĐÃ CẬP NHẬT - auto-log)
│   └── ichingService.js               # I Ching (ĐÃ CẬP NHẬT - auto-log)
├── config/
│   └── calendarAccessControl.js       # MỚI: Access theo tier
└── theme/
    └── index.js                       # Theme exports (ĐÃ CẬP NHẬT)
```

---

# 2. TRẠNG THÁI TRIỂN KHAI HIỆN TẠI

## 2.1 Trạng Thái Màn Hình Nghi Thức

| Nghi Thức | File Màn Hình | VideoBackground | Lottie Animation | Timer | Lưu Reflection |
|-----------|--------------|-----------------|------------------|-------|----------------|
| HeartExpansion | HeartExpansionRitual.js | Có | heart-glow | OK | OK |
| GratitudeFlow | GratitudeFlowRitual.js | Có | golden-orbs | OK | OK |
| CleansingBreath | CleansingBreathRitual.js | Có | breath-circle | OK | OK |
| WaterManifest | WaterManifestRitual.js | Có | water-energy | OK | OK |
| LetterToUniverse | LetterToUniverseRitual.js | Có | letter-fly | OK | OK |
| BurnRelease | BurnReleaseRitual.js | Có | paper-burn | OK | OK |
| StarWish | StarWishRitual.js | Có | shooting-star | OK | OK |
| CrystalHealing | CrystalHealingRitual.js | Có | crystal-glow | OK | OK |

## 2.2 Trạng Thái Context System

| Context | File | Trạng Thái |
|---------|------|------------|
| VisionBoardContext | VisionBoardContext.js | Đã triển khai (Combined Provider) |
| RitualContext | RitualContext.js | Đã triển khai |
| GoalContext | GoalContext.js | Đã triển khai |
| HabitContext | HabitContext.js | Đã triển khai |
| DivinationContext | DivinationContext.js | Đã triển khai |
| CalendarContext | CalendarContext.js | **ĐÃ CẬP NHẬT** - Calendar Smart Journal integration |

## 2.3 Trạng Thái Calendar Smart Journal (MỚI)

| Component/Service | File | Trạng Thái |
|-------------------|------|------------|
| calendarJournalService | calendarJournalService.js | **MỚI** Đã triển khai |
| tradingJournalService | tradingJournalService.js | **MỚI** Đã triển khai |
| moodTrackingService | moodTrackingService.js | **MỚI** Đã triển khai |
| calendarNotificationService | calendarNotificationService.js | **MỚI** Đã triển khai |
| calendarAccessControl | calendarAccessControl.js | **MỚI** Đã triển khai |
| MoodPicker | MoodPicker.js | **MỚI** Đã triển khai |
| TagInput | TagInput.js | **MỚI** Đã triển khai |
| DisciplineChecklist | DisciplineChecklist.js | **MỚI** Đã triển khai |
| QuickActionBar | QuickActionBar.js | **MỚI** Đã triển khai |
| DailySummaryCard | DailySummaryCard.js | **MỚI** Đã triển khai |
| TimelineItem | TimelineItem.js | **MỚI** Đã triển khai |
| JournalEntryCard | JournalEntryCard.js | **MỚI** Đã triển khai |
| TradingEntryCard | TradingEntryCard.js | **MỚI** Đã triển khai |
| OnboardingOverlay | OnboardingOverlay.js | **MỚI** Đã triển khai |
| JournalEntryScreen | JournalEntryScreen.js | **MỚI** Đã triển khai |
| TradingJournalScreen | TradingJournalScreen.js | **MỚI** Đã triển khai |
| CalendarSettingsScreen | CalendarSettingsScreen.js | **MỚI** Đã triển khai |

## 2.4 Trạng Thái Tích Hợp Service

| Service | Tích Hợp | Trạng Thái |
|---------|----------|------------|
| tarotService | Auto-log vào calendar_divination_logs | **MỚI** Đã triển khai |
| ichingService | Auto-log vào calendar_divination_logs | **MỚI** Đã triển khai |
| calendarService | logDivination(), logGoalProgress(), getDayCalendarData() | **MỚI** Đã triển khai |
| CalendarContext | getDayData(), refreshJournalEntries(), refreshTradingEntries(), refreshMoodData() | **MỚI** Đã triển khai |

---

# 3. KIẾN TRÚC TÍNH NĂNG

## 3.1 Phân Cấp Component

```
App
├── VisionBoardProvider (Combined Context Provider)
│   ├── RitualProvider
│   ├── GoalProvider
│   ├── HabitProvider
│   ├── DivinationProvider
│   └── CalendarProvider (ĐÃ CẬP NHẬT)
│       └── VisionBoardInnerProvider
│
├── VisionBoardScreen
│   ├── Header - Ngày, streak, XP display
│   ├── QuickStatsRow - Tiến độ hôm nay
│   ├── FeaturedRitualSection
│   ├── DivinationSection
│   ├── GoalCards
│   ├── HabitGrid
│   └── TodayTasksList
│
├── CalendarScreen (ĐÃ CẬP NHẬT)
│   ├── CalendarHeatMap
│   ├── MoodCheckInBanner
│   ├── DailySummaryCard
│   ├── QuickActionBar
│   ├── DayTimeline (với tất cả loại hoạt động)
│   └── MoodPicker (modal)
│
├── JournalEntryScreen (MỚI)
│   ├── EntryTypeSelector
│   ├── ContentEditor
│   ├── MoodSelector
│   ├── LifeAreaSelector
│   └── TagInput
│
├── TradingJournalScreen (MỚI)
│   ├── SymbolInput
│   ├── DirectionSelector
│   ├── PriceInputs
│   ├── DisciplineChecklist
│   ├── EmotionSelectors
│   └── ScreenshotUpload
│
└── Các Màn Hình Nghi Thức Riêng
    ├── VideoBackground
    ├── ParticleField
    ├── RitualAnimation
    └── CompletionCelebration
```

## 3.2 Luồng Dữ Liệu

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VisionBoardProvider                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │RitualContext│  │ GoalContext │  │HabitContext │                 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
│         │                │                │                         │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐                 │
│  │DivinationCtx│  │CalendarCtx  │  │ CacheService│                 │
│  │ (auto-log)  │  │ (ĐÃ CẬP NHẬT)│  │             │                 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
│         │                │                │                         │
│         └────────────────┼────────────────┘                         │
│                          │                                          │
│              ┌───────────▼───────────┐                              │
│              │   useVisionBoard()    │                              │
│              │   useCalendar()       │                              │
│              └───────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Services   │ │  Supabase   │ │   Cache     │
    │ (Journal,   │ │  (8+ bảng   │ │(AsyncStorage│
    │ Trading,    │ │   mới)      │ │             │
    │ Mood, v.v.) │ │             │ │             │
    └─────────────┘ └─────────────┘ └─────────────┘
```

---

# 4. HỆ THỐNG CONTEXT (SPLIT ARCHITECTURE)

## 4.1 Tổng Quan

Vision Board 2.0 sử dụng kiến trúc split context để tối ưu hiệu năng. Mỗi domain có context riêng.

## 4.2 CalendarContext (ĐÃ CẬP NHẬT)

**File:** `contexts/CalendarContext.js`

```javascript
// State
{
  stats: {},
  dailyScore: 0,
  calendarEvents: [],
  selectedDate: null,
  monthActivities: {},
  isLoading: boolean,
  error: null,

  // MỚI: Calendar Smart Journal state
  dayData: null,           // Tất cả dữ liệu cho ngày được chọn
  journalEntries: [],      // Các entry nhật ký cho ngày được chọn
  tradingEntries: [],      // Các entry giao dịch cho ngày được chọn
  moodData: null,          // Dữ liệu mood cho ngày được chọn
  monthMarkers: {},        // Markers tháng cho heatmap
}

// Actions (hiện có)
loadCalendarEvents(month, year)
loadMonthActivities(month, year)
getEventsForDate(date)
setSelectedDate(date)
refreshStats()
refresh()

// MỚI Actions
getDayData(date)                    // Lấy tất cả dữ liệu calendar cho một ngày
refreshJournalEntries(date)         // Refresh journal entries
refreshTradingEntries(date)         // Refresh trading entries
refreshMoodData(date)               // Refresh mood data
getMonthMarkers(year, month)        // Lấy month markers cho heatmap

// Service access
calendarService
calendarJournalService              // MỚI
tradingJournalService               // MỚI
moodTrackingService                 // MỚI
```

---

# 5. CALENDAR SMART JOURNAL SYSTEM (MỚI)

## 5.1 Tổng Quan

Calendar Smart Journal là hệ thống nhật ký thông minh tích hợp 6 nguồn dữ liệu:

1. **Rituals** - Tự động log khi hoàn thành nghi thức
2. **Journal** - Nhật ký cá nhân (reflection, gratitude, goal notes)
3. **Trading** - Nhật ký giao dịch với P/L, emotions, discipline
4. **Divination** - Tự động log tarot/iching readings
5. **Goals** - Goal progress notes
6. **Mood** - Morning/midday/evening mood check-ins

## 5.2 Bảng Database

| Bảng | Mục Đích |
|------|----------|
| calendar_journal_entries | Các entry nhật ký chính |
| trading_journal_entries | Nhật ký giao dịch với metrics |
| calendar_ritual_logs | Nghi thức được tự động log |
| calendar_divination_logs | Tarot/iching được tự động log |
| calendar_goal_progress_logs | Ghi chú tiến độ mục tiêu |
| calendar_daily_mood | Tracking mood sáng/tối |
| calendar_user_settings | Cài đặt người dùng |
| calendar_notification_queue | Queue thông báo push |

## 5.3 Services

### calendarJournalService.js

```javascript
// Loại Entry
ENTRY_TYPES = {
  reflection: 'Suy ngẫm',
  gratitude: 'Biết ơn',
  goal_note: 'Ghi chú mục tiêu',
  quick_note: 'Ghi chú nhanh',
}

// Functions
createJournalEntry(userId, data, userTier, userRole)
getEntriesForDate(userId, date)
getEntriesForRange(userId, startDate, endDate, options)
updateJournalEntry(userId, entryId, updates, userTier)
deleteJournalEntry(userId, entryId)
togglePinEntry(userId, entryId)
toggleFavoriteEntry(userId, entryId)
searchJournalEntries(userId, query)
getJournalStats(userId)
getSuggestedTags(userId)
```

### tradingJournalService.js

```javascript
// Hướng Giao Dịch
TRADE_DIRECTIONS = { long: 'Long', short: 'Short' }

// Kết Quả Giao Dịch
TRADE_RESULTS = { win: 'Thắng', loss: 'Thua', breakeven: 'Hòa', open: 'Đang mở' }

// Cảm Xúc
TRADE_EMOTIONS = {
  pre_trade: ['confident', 'fearful', 'greedy', 'fomo', 'calm', 'excited'],
  during_trade: ['anxious', 'patient', 'panicked', 'focused', 'overconfident'],
  post_trade: ['satisfied', 'regretful', 'frustrated', 'grateful', 'learned']
}

// Functions
createTradingEntry(userId, data, userTier, userRole)
getTradingEntriesForDate(userId, date)
getTradingEntriesForRange(userId, startDate, endDate, options)
updateTradingEntry(userId, entryId, updates, userTier)
deleteTradingEntry(userId, entryId)
getTradingStats(userId, startDate, endDate)
createFromScannerSignal(userId, signalData, userTier)
createFromPaperTrade(userId, paperTradeData, userTier)
calculateTradeMetrics(entry)
```

### moodTrackingService.js

```javascript
// Moods
MOODS = {
  happy: { label: 'Vui vẻ', icon: 'smile', color: '#FFD700' },
  excited: { label: 'Phấn khích', icon: 'sparkles', color: '#FF6B6B' },
  peaceful: { label: 'Bình an', icon: 'heart', color: '#4ECDC4' },
  // ... more moods
}

// Loại Check-in
CHECK_IN_TYPES = {
  morning: { label: 'Buổi sáng', timeRange: [5, 11] },
  midday: { label: 'Buổi trưa', timeRange: [11, 17] },
  evening: { label: 'Buổi tối', timeRange: [17, 23] },
}

// Functions
getOrCreateTodayMood(userId)
saveMoodCheckIn(userId, checkInType, data, userTier, userRole)
getMoodForDate(userId, date)
getMoodHistory(userId, startDate, endDate)
getMoodStats(userId, startDate, endDate)
getPendingCheckIn(userId)
```

## 5.4 UI Components

### MoodPicker

Component modal để chọn mood.

```javascript
<MoodPicker
  visible={showMoodPicker}
  checkInType="morning"  // morning, midday, evening
  onSave={(data) => handleMoodSave(data)}
  onClose={() => setShowMoodPicker(false)}
  mode="checkin"  // checkin hoặc select
/>
```

### QuickActionBar

Hàng nút hành động nhanh cho calendar screen.

```javascript
<QuickActionBar
  onWriteJournal={() => navigation.navigate('JournalEntry')}
  onLogTrade={() => navigation.navigate('TradingJournal')}
  onGratitude={() => handleQuickGratitude()}
  onQuickRitual={() => navigation.navigate('RitualPlayground')}
  onMoodCheckIn={() => setShowMoodPicker(true)}
  userTier={userTier}
  pendingMoodCheckIn="morning"
/>
```

### DailySummaryCard

Card tổng kết ngày hiển thị mood, XP, completion stats.

```javascript
<DailySummaryCard
  data={{
    journalCount: 3,
    tradingCount: 2,
    tradingPnl: 150.50,
    ritualCount: 1,
    divinationCount: 1,
    goalProgress: 75,
  }}
  mood={moodData}
  loading={isLoading}
  isToday={true}
/>
```

### TimelineItem

Entry timeline cho các loại hoạt động khác nhau.

```javascript
<TimelineItem
  item={{
    id: '1',
    type: 'journal',  // journal, trade, ritual, divination, goal_progress
    title: 'Morning Reflection',
    content: 'Hôm nay tôi biết ơn vì...',
    timestamp: '2026-01-29T08:30:00',
    mood: 'peaceful',
  }}
  onPress={() => handleItemPress(item)}
/>
```

### DisciplineChecklist

Tracking kỷ luật trading.

```javascript
<DisciplineChecklist
  checklist={{
    followed_plan: true,
    proper_sizing: true,
    set_stop_loss: false,
    took_profit_targets: true,
    // ... more items
  }}
  onChange={(newChecklist) => setChecklist(newChecklist)}
  disabled={false}
/>
// Tự động tính điểm kỷ luật (0-100)
```

## 5.5 Màn Hình

### JournalEntryScreen

Tạo/chỉnh sửa journal entries.

**Tính năng:**
- Chọn loại entry (reflection, gratitude, goal_note, quick_note)
- Input tiêu đề (tùy chọn)
- Textarea nội dung với giới hạn ký tự theo tier
- Chọn mood
- Chọn life area
- Input tags với autocomplete
- Toggle Pin/Favorite
- Xác nhận khi có thay đổi chưa lưu

### TradingJournalScreen

Tạo/chỉnh sửa trading entries.

**Tính năng:**
- Input symbol (tự động uppercase)
- Chọn hướng (Long/Short)
- Dropdown loại pattern
- Inputs giá (entry, exit, SL, TP1-3)
- Section sizing vị thế
- Discipline checklist (8 items)
- Chọn cảm xúc (pre/during/post trade)
- Sections ghi chú
- Upload screenshots (giới hạn theo tier)
- Tự động tính P/L
- Sliders đánh giá (execution, setup, management)

### CalendarSettingsScreen

Cài đặt notification và hiển thị.

**Tính năng:**
- Toggle nhắc mood buổi sáng + chọn giờ
- Toggle nhắc mood buổi tối + chọn giờ
- Toggle nhắc journal + chọn giờ
- Toggle auto-log (rituals, divination, goals)
- Tùy chọn hiển thị
- Export data (TIER2+)

## 5.6 Access Control

| Tính năng | FREE | TIER1 | TIER2 | TIER3 |
|-----------|------|-------|-------|-------|
| basic_journal | 3/ngày, 500 ký tự | 10/ngày, 2000 ký tự | không giới hạn, 5000 ký tự | không giới hạn, 10000 ký tự |
| trading_journal | Không | 5/ngày, 2 screenshots | 20/ngày, 5 screenshots | không giới hạn, 10 screenshots |
| mood_tracking | 2/ngày | 5/ngày | không giới hạn | không giới hạn |
| voice_notes | Không | tối đa 60s | tối đa 180s | tối đa 600s |
| attachments | Không | 2 img, 2MB | 5 img, 5MB | 10 img, 10MB |
| history_days | 7 | 30 | 90 | không giới hạn |
| ai_insights | Không | Không | Không | Có |
| export_data | Không | Không | Có | Có |

## 5.7 Auto-Logging

### Tarot Readings

Khi user lưu tarot reading, tự động log vào calendar:

```javascript
// tarotService.js saveReading()
await calendarService.logDivination(
  userId,
  'tarot',
  summary,
  { cards: reading.cards, readingId: data.id },
  reading.spreadType,
  cardsCount,
  reading.question
);
```

### I Ching Readings

Khi user lưu I Ching reading, tự động log vào calendar:

```javascript
// ichingService.js saveReading()
await calendarService.logDivination(
  userId,
  'iching',
  summary,
  { hexagram: reading.hexagram, readingId: data.id },
  null,
  throwsCount,
  reading.question
);
```

---

# 6. DANH MỤC NGHI THỨC

## 6.1 Danh Mục 8 Nghi Thức

### 6.1.1 Heart Expansion (Mở Rộng Trái Tim)

| Thuộc Tính | Giá Trị |
|------------|---------|
| ID | `heart-expansion` |
| Tiêu đề (VI) | Mở Rộng Trái Tim |
| Icon | `Heart` (Lucide) |
| Màu | `#FF69B4` (Hot Pink) |
| Thời gian | 5-7 phút |
| XP Reward | 30 XP |

### 6.1.2 Gratitude Flow (Dòng Chảy Biết Ơn)

| Thuộc Tính | Giá Trị |
|------------|---------|
| ID | `gratitude-flow` |
| Tiêu đề (VI) | Dòng Chảy Biết Ơn |
| Icon | `Gift` (Lucide) |
| Màu | `#FFD700` (Gold) |
| Thời gian | 3-5 phút |
| XP Reward | 30 XP |

### 6.1.3 Cleansing Breath (Hơi Thở Thanh Lọc)

| Thuộc Tính | Giá Trị |
|------------|---------|
| ID | `cleansing-breath` |
| Tiêu đề (VI) | Hơi Thở Thanh Lọc |
| Icon | `Wind` (Lucide) |
| Màu | `#667EEA` (Indigo) |
| Thời gian | 5-7 phút |
| XP Reward | 35 XP |
| Breathing Pattern | 4-4-4-4 box breathing |

### 6.1.4 Water Manifestation (Hiện Thực Hóa Bằng Nước)

| Thuộc Tính | Giá Trị |
|------------|---------|
| ID | `water-manifest` |
| Tiêu đề (VI) | Hiện Thực Hóa Bằng Nước |
| Icon | `Droplet` (Lucide) |
| Màu | `#4ECDC4` (Teal) |
| Thời gian | 5-7 phút |
| XP Reward | 30 XP |

### 6.1.5 Letter to Universe (Thư Gửi Vũ Trụ)

| Thuộc Tính | Giá Trị |
|------------|---------|
| ID | `letter-to-universe` |
| Tiêu đề (VI) | Thư Gửi Vũ Trụ |
| Icon | `Mail` (Lucide) |
| Màu | `#9D4EDD` (Purple) |
| Thời gian | 5-10 phút |
| XP Reward | 25 XP |

### 6.1.6 Burn & Release (Đốt & Buông Bỏ)

| Thuộc Tính | Giá Trị |
|------------|---------|
| ID | `burn-release` |
| Tiêu đề (VI) | Đốt & Buông Bỏ |
| Icon | `Flame` (Lucide) |
| Màu | `#FF6B6B` (Red) |
| Thời gian | 5-7 phút |
| XP Reward | 35 XP |

### 6.1.7 Star Wish (Ước Nguyện Sao Băng)

| Thuộc Tính | Giá Trị |
|------------|---------|
| ID | `star-wish` |
| Tiêu đề (VI) | Ước Nguyện Sao Băng |
| Icon | `Star` (Lucide) |
| Màu | `#FFD700` (Gold) |
| Thời gian | 3-5 phút |
| XP Reward | 25 XP |

### 6.1.8 Crystal Healing (Chữa Lành Pha Lê)

| Thuộc Tính | Giá Trị |
|------------|---------|
| ID | `crystal-healing` |
| Tiêu đề (VI) | Chữa Lành Pha Lê |
| Icon | `Gem` (Lucide) |
| Màu | `#9D4EDD` (Purple) |
| Thời gian | 5 phút |
| XP Reward | 30 XP |

---

# 7-20. [CÁC PHẦN CÒN LẠI]

*(Xem tài liệu trước đó cho các phần 7-20)*

---

# PHỤ LỤC

## A. Tham Khảo Nhanh - Calendar Smart Journal

```javascript
// Sử dụng CalendarContext để truy cập dữ liệu thống nhất
import { useCalendar } from '../contexts/CalendarContext';

const Component = () => {
  const {
    // State
    dayData,
    journalEntries,
    tradingEntries,
    moodData,
    monthMarkers,

    // Actions
    getDayData,
    refreshJournalEntries,
    refreshTradingEntries,
    refreshMoodData,
    getMonthMarkers,

    // Services
    calendarJournalService,
    tradingJournalService,
    moodTrackingService,
  } = useCalendar();

  // Load dữ liệu cho một ngày
  useEffect(() => {
    getDayData('2026-01-29');
  }, []);
};
```

## B. Tham Khảo Nhanh - Sử Dụng Components Mới

```javascript
import {
  // Calendar Smart Journal
  MoodPicker,
  TagInput,
  DisciplineChecklist,
  QuickActionBar,
  DailySummaryCard,
  TimelineItem,
  JournalEntryCard,
  TradingEntryCard,
  OnboardingOverlay,
} from '../components/VisionBoard';
```

## C. Navigation Routes (Đã Cập Nhật)

```javascript
// AccountStack.js
<Stack.Screen name="JournalEntry" component={JournalEntryScreen} />
<Stack.Screen name="TradingJournal" component={TradingJournalScreen} />
<Stack.Screen name="CalendarSettings" component={CalendarSettingsScreen} />
```

---

**KẾT THÚC TÀI LIỆU**

*Tài liệu được cập nhật: 29/01/2026*
*Phiên bản: 4.1*
