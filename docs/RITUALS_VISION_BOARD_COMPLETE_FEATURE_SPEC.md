# RITUALS & RITUAL LIBRARY - COMPLETE FEATURE SPECIFICATION
## Vision Board 2.0 - GEM Mobile App

**Document Version:** 2.0
**Created:** December 28, 2025
**Last Updated:** January 25, 2026

---

# TABLE OF CONTENTS

1. [Overview](#1-overview)
2. [Current Implementation Status](#2-current-implementation-status)
3. [Feature Architecture](#3-feature-architecture)
4. [Ritual Types & Catalog](#4-ritual-types--catalog)
5. [Cosmic Components System](#5-cosmic-components-system)
6. [Screen Specifications](#6-screen-specifications)
7. [Individual Ritual Implementations](#7-individual-ritual-implementations)
8. [Animation & Effects System](#8-animation--effects-system)
9. [Design Tokens & Theme](#9-design-tokens--theme)
10. [Database Schema](#10-database-schema)
11. [Service Layer & API](#11-service-layer--api)
12. [Gamification System](#12-gamification-system)
13. [Access Control](#13-access-control)
14. [Navigation & Routing](#14-navigation--routing)
15. [Known Issues & Fixes Required](#15-known-issues--fixes-required)
16. [Performance Optimization](#16-performance-optimization)

---

# 1. OVERVIEW

## 1.1 Feature Description

Rituals la he thong nghi thuc tam linh tich hop trong Vision Board 2.0, cho phep nguoi dung thuc hien cac nghi thuc mindfulness, manifestation, va healing. He thong bao gom:

- **Featured Daily Ritual**: Nghi thuc goi y moi ngay
- **Ritual Library**: Thu vien nghi thuc voi filter/categories
- **8 Individual Ritual Screens**: Man hinh rieng cho tung loai nghi thuc
- **Ritual History**: Lich su nghi thuc da thuc hien
- **Ritual Playground**: Man hinh choi nghi thuc tong hop
- **Streak & XP System**: Gamification voi streak va diem XP
- **Cosmic Glassmorphism Design**: Thiet ke cosmic voi video backgrounds va Lottie animations

## 1.2 Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| 8 Ritual Types | 8 loai nghi thuc khac nhau voi animation unique | Implemented |
| Cosmic Theme | Giao dien cosmic/mystic voi particle effects | Implemented |
| Video Backgrounds | Video loop backgrounds cho moi ritual | Implemented |
| Lottie Animations | Smooth Lottie animations cho tung ritual | Partial |
| Audio Integration | Ambient sounds cho moi nghi thuc | Implemented |
| XP Rewards | 25-35 XP moi lan hoan thanh | Implemented |
| Streak Tracking | Theo doi streak lien tuc voi bonus | Implemented |
| Haptic Feedback | Vibration feedback cho interactions | Implemented |
| Offline Support | Hoat dong offline voi local data | Implemented |

## 1.3 Files Structure

```
gem-mobile/src/
├── screens/VisionBoard/
│   ├── VisionBoardScreen.js           # Main screen
│   ├── CalendarScreen.js              # Calendar view
│   ├── RitualPlaygroundScreen.js      # Main ritual playground
│   ├── RitualHistoryScreen.js         # History of completed rituals
│   ├── AchievementsScreen.js          # User achievements
│   ├── DailyRecapScreen.js            # Daily summary
│   ├── GoalDetailScreen.js            # Goal details
│   ├── index.js                       # Exports
│   ├── components/
│   │   ├── AddWidgetModal.js
│   │   ├── AffirmationWidget.js
│   │   └── GoalsWidget.js
│   └── rituals/
│       ├── index.js                   # Export & RITUAL_SCREENS mapping
│       ├── HeartExpansionRitual.js    # Heart ritual (5-7 min)
│       ├── GratitudeFlowRitual.js     # Gratitude ritual (3-5 min)
│       ├── CleansingBreathRitual.js   # Breathing ritual (5-7 min)
│       ├── WaterManifestRitual.js     # Water ritual (5-7 min)
│       ├── LetterToUniverseRitual.js  # Letter ritual (5-10 min)
│       ├── BurnReleaseRitual.js       # Burn ritual (5-7 min)
│       ├── StarWishRitual.js          # Star wish ritual (3-5 min)
│       └── CrystalHealingRitual.js    # Crystal healing (5 min)
├── components/
│   ├── Rituals/
│   │   ├── index.js
│   │   ├── FeaturedRitualSection.js   # Main ritual hub component
│   │   └── cosmic/                    # Shared cosmic components
│   │       ├── index.js               # All exports
│   │       ├── VideoBackground.js     # Video backgrounds
│   │       ├── RitualAnimation.js     # Lottie animations
│   │       ├── CosmicBackground.js    # Gradient backgrounds
│   │       ├── GlassCard.js           # Glassmorphism cards
│   │       ├── GlowButton.js          # Glow effect buttons
│   │       ├── GlowingOrb.js          # Orb elements
│   │       ├── ParticleField.js       # Particle systems
│   │       ├── PulsingCircle.js       # Pulsing circle
│   │       ├── ProgressRing.js        # Progress indicators
│   │       ├── InstructionText.js     # Animated text
│   │       ├── RitualHeader.js        # Screen headers
│   │       └── CompletionCelebration.js # Completion UI
│   └── VisionBoard/
│       ├── index.js
│       ├── DivinationSection.js       # Tarot/I Ching section
│       ├── GoalCard.js
│       ├── HabitGrid.js
│       ├── DailyScoreCard.js
│       ├── StreakBanner.js
│       ├── ComboTracker.js
│       ├── QuickStatsRow.js
│       ├── QuotaBar.js
│       ├── GoalSetupQuestionnaire.js
│       └── TodayTasksList.js
├── contexts/
│   └── VisionBoardContext.js          # State management
├── services/
│   ├── ritualService.js               # Ritual business logic
│   └── ritualTrackingService.js       # Tracking & analytics
├── theme/
│   └── cosmicTokens.js                # Design tokens
└── utils/
    ├── cosmicAnimations.js            # Animation utilities
    └── hapticPatterns.js              # Haptic feedback
```

---

# 2. CURRENT IMPLEMENTATION STATUS

## 2.1 Ritual Screens Status

| Ritual | Screen File | VideoBackground | Lottie Animation | Timer | Reflection Save |
|--------|------------|-----------------|------------------|-------|-----------------|
| HeartExpansion | HeartExpansionRitual.js | Yes | heart-glow | **NEEDS FIX** | **NEEDS IMPL** |
| GratitudeFlow | GratitudeFlowRitual.js | Yes | **NEEDS golden-orbs** | OK | **NEEDS IMPL** |
| CleansingBreath | CleansingBreathRitual.js | Yes | breath-circle | OK | **NEEDS IMPL** |
| WaterManifest | WaterManifestRitual.js | Yes | water-energy | OK | **NEEDS IMPL** |
| LetterToUniverse | LetterToUniverseRitual.js | Yes | **NEEDS letter-fly** | OK | **NEEDS IMPL** |
| BurnRelease | BurnReleaseRitual.js | Yes | **NEEDS paper-burn** | OK | **NEEDS IMPL** |
| StarWish | StarWishRitual.js | **NEEDS IMPL** | **NEEDS shooting-star** | OK | **NEEDS IMPL** |
| CrystalHealing | CrystalHealingRitual.js | Yes | crystal-glow | OK | **NEEDS IMPL** |

## 2.2 Cosmic Components Status

| Component | File | Status |
|-----------|------|--------|
| VideoBackground | cosmic/VideoBackground.js | Implemented |
| RitualAnimation | cosmic/RitualAnimation.js | Implemented |
| CosmicBackground | cosmic/CosmicBackground.js | Implemented |
| GlassCard | cosmic/GlassCard.js | Implemented |
| GlowButton | cosmic/GlowButton.js | Implemented |
| GlowingOrb | cosmic/GlowingOrb.js | Implemented |
| ParticleField | cosmic/ParticleField.js | Implemented |
| PulsingCircle | cosmic/PulsingCircle.js | Implemented |
| ProgressRing | cosmic/ProgressRing.js | Implemented |
| InstructionText | cosmic/InstructionText.js | Implemented |
| RitualHeader | cosmic/RitualHeader.js | Implemented |
| CompletionCelebration | cosmic/CompletionCelebration.js | Implemented |

## 2.3 Assets Status

### Video Assets (gem-mobile/assets/videos/rituals/)

| File | Ritual | Status |
|------|--------|--------|
| heart-expansion.mp4 | HeartExpansion | Required |
| gratitude-flow.mp4 | GratitudeFlow | Required |
| cleansing-breath.mp4 | CleansingBreath | Required |
| water-manifest.mp4 | WaterManifest | Required |
| letter-universe.mp4 | LetterToUniverse | Required |
| burning-release.mp4 | BurnRelease | Required |
| shooting-star.mp4 | StarWish | Required |
| crystal-healing.mp4 | CrystalHealing | Required |

### Lottie Assets (gem-mobile/assets/lottie/rituals/)

| File | Animation ID | Status |
|------|-------------|--------|
| heart-glow.json | heart-glow | Required |
| golden-orbs.json | golden-orbs | Required |
| breath-circle.json | breath-circle | Required |
| water-energy.json | water-energy | Required |
| letter-fly.json | letter-fly | Required |
| paper-burn.json | paper-burn | Required |
| crystal-glow.json | crystal-glow | Required |
| shooting-star.json | shooting-star | Required |
| Fire Ball.json | fire-ball | Available |
| Paper.json | paper | Available |
| Reward light effect.json | reward-light | Available |

---

# 3. FEATURE ARCHITECTURE

## 3.1 Component Hierarchy

```
VisionBoardScreen
├── VisionBoardContext (State Provider)
│   ├── Goals state
│   ├── Habits state
│   ├── Rituals state
│   └── XP/Streak state
├── FeaturedRitualSection
│   ├── SectionHeader
│   │   ├── Moon Icon
│   │   ├── Title: "Nghi Thuc Goi Y"
│   │   └── ViewAllButton
│   ├── FeaturedRitualCard (Large)
│   │   ├── LinearGradient Background
│   │   ├── SparkleEffect (x4)
│   │   ├── FeaturedBadge
│   │   ├── IconContainer
│   │   ├── Title + Subtitle
│   │   ├── TagPills
│   │   ├── Duration Badge
│   │   └── CTA Button
│   ├── LibrarySection
│   │   ├── LibraryHeader
│   │   ├── FilterTags (horizontal scroll)
│   │   ├── SmallRitualCard (horizontal)
│   │   └── RitualListItem (vertical)
│   └── QuickActions (hidden - to be removed)
└── DivinationSection
    ├── TarotSection
    └── IChingSection
```

## 3.2 Data Flow

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
┌─────────────────┐    ┌──────────────────┐
│ Individual      │◀──▶│ Cosmic Components│
│ Ritual Screen   │    │ (Video, Lottie)  │
└─────────────────┘    └──────────────────┘
```

---

# 4. RITUAL TYPES & CATALOG

## 4.1 Complete Ritual Catalog (8 Rituals)

### 4.1.1 Heart Expansion (Mo Rong Trai Tim)

| Property | Value |
|----------|-------|
| ID | `heart-expansion` |
| Title (VI) | Mo Rong Trai Tim |
| Subtitle | Gui tinh yeu den ban than va nguoi khac |
| Icon | `Heart` (Lucide) |
| Color | `#FF69B4` (Hot Pink) |
| Duration | 5-7 phut |
| Category | `love` / `healing` |
| XP Reward | 30 XP |
| Video | `heart-expansion.mp4` |
| Lottie | `heart-glow.json` |
| Theme | `heart` |

### 4.1.2 Gratitude Flow (Dong Chay Biet On)

| Property | Value |
|----------|-------|
| ID | `gratitude-flow` |
| Title (VI) | Dong Chay Biet On |
| Subtitle | Gui long biet on den vu tru |
| Icon | `Gift` (Lucide) |
| Color | `#FFD700` (Gold) |
| Duration | 3-5 phut |
| Category | `abundance` / `prosperity` |
| XP Reward | 30 XP |
| Video | `gratitude-flow.mp4` |
| Lottie | `golden-orbs.json` |
| Theme | `gratitude` |

### 4.1.3 Cleansing Breath (Hoi Tho Thanh Loc)

| Property | Value |
|----------|-------|
| ID | `cleansing-breath` |
| Title (VI) | Hoi Tho Thanh Loc |
| Subtitle | Box breathing de can bang tam tri |
| Icon | `Wind` (Lucide) |
| Color | `#667EEA` (Indigo) |
| Duration | 5-7 phut |
| Category | `cleansing` / `spiritual` |
| XP Reward | 35 XP |
| Video | `cleansing-breath.mp4` |
| Lottie | `breath-circle.json` |
| Theme | `breath` |
| Breathing Pattern | 4-4-4-4 (inhale-hold-exhale-rest) |

### 4.1.4 Water Manifestation (Hien Thuc Hoa Bang Nuoc)

| Property | Value |
|----------|-------|
| ID | `water-manifest` |
| Title (VI) | Hien Thuc Hoa Bang Nuoc |
| Subtitle | Nap y dinh vao nuoc va uong |
| Icon | `Droplet` (Lucide) |
| Color | `#4ECDC4` (Teal) |
| Duration | 5-7 phut |
| Category | `manifestation` |
| XP Reward | 30 XP |
| Video | `water-manifest.mp4` |
| Lottie | `water-energy.json` |
| Theme | `water` |

### 4.1.5 Letter to Universe (Thu Gui Vu Tru)

| Property | Value |
|----------|-------|
| ID | `letter-to-universe` |
| Title (VI) | Thu Gui Vu Tru |
| Subtitle | Viet dieu uoc va gui len nhung vi sao |
| Icon | `Mail` (Lucide) |
| Color | `#9D4EDD` (Purple) |
| Duration | 5-10 phut |
| Category | `manifestation` / `intention` |
| XP Reward | 25 XP |
| Video | `letter-universe.mp4` |
| Lottie | `letter-fly.json` |
| Theme | `letter` |

### 4.1.6 Burn & Release (Dot & Buong Bo)

| Property | Value |
|----------|-------|
| ID | `burn-release` |
| Title (VI) | Dot & Buong Bo |
| Subtitle | Viet va dot chay nhung ganh nang |
| Icon | `Flame` (Lucide) |
| Color | `#FF6B6B` (Red) |
| Duration | 5-7 phut |
| Category | `release` / `healing` |
| XP Reward | 35 XP |
| Video | `burning-release.mp4` |
| Lottie | `paper-burn.json` |
| Theme | `burn` |

### 4.1.7 Star Wish (Uoc Nguyen Sao Bang)

| Property | Value |
|----------|-------|
| ID | `star-wish` |
| Title (VI) | Uoc Nguyen Sao Bang |
| Subtitle | Chon ngoi sao va gui dieu uoc |
| Icon | `Star` (Lucide) |
| Color | `#4ECDC4` / `#00CED1` |
| Duration | 3-5 phut |
| Category | `manifestation` |
| XP Reward | 25 XP |
| Video | `shooting-star.mp4` |
| Lottie | `shooting-star.json` |
| Theme | `star` |

### 4.1.8 Crystal Healing (Chua Lanh Pha Le)

| Property | Value |
|----------|-------|
| ID | `crystal-healing` |
| Title (VI) | Chua Lanh Pha Le |
| Subtitle | Ket noi nang luong chua lanh cua da quy |
| Icon | `Gem` (Lucide) |
| Color | `#9D4EDD` (Purple) |
| Duration | 5 phut |
| Category | `healing` |
| XP Reward | 30 XP |
| Video | `crystal-healing.mp4` |
| Lottie | `crystal-glow.json` |
| Theme | `crystal` |

---

# 5. COSMIC COMPONENTS SYSTEM

## 5.1 VideoBackground Component

```javascript
// Usage
import { VideoBackground } from '../components/Rituals/cosmic';

<VideoBackground ritualId="heart-expansion" paused={false}>
  {/* Ritual content renders on top */}
</VideoBackground>
```

### Available Video Sources

| Ritual ID | Video File | Fallback Gradient |
|-----------|------------|-------------------|
| heart-expansion | heart-expansion.mp4 | ['#1A0510', '#2D0A1A', '#4A1030'] |
| gratitude-flow | gratitude-flow.mp4 | ['#1A1500', '#2D2500', '#4A3D00'] |
| cleansing-breath | cleansing-breath.mp4 | ['#0A1628', '#152238', '#1E3A5F'] |
| water-manifest | water-manifest.mp4 | ['#0A1A1A', '#102828', '#1A3D3D'] |
| letter-to-universe | letter-universe.mp4 | ['#0D0221', '#1A0533', '#2D1B4E'] |
| burn-release | burning-release.mp4 | ['#1A0A0A', '#2D1010', '#3D1515'] |
| star-wish | shooting-star.mp4 | ['#0A0A1A', '#101028', '#151535'] |
| crystal-healing | crystal-healing.mp4 | ['#150A1A', '#251530', '#352045'] |

## 5.2 RitualAnimation Component

```javascript
// Usage
import { RitualAnimation } from '../components/Rituals/cosmic';

<RitualAnimation
  animationId="heart-glow"
  autoPlay={true}
  loop={true}
  speed={1}
  onAnimationFinish={() => console.log('Done')}
/>
```

### Available Lottie Animations

| Animation ID | Size | Loop | Speed | Usage |
|-------------|------|------|-------|-------|
| heart-glow | 250x250 | true | 1.0 | Heart expansion |
| golden-orbs | fullWidth x 400 | true | 0.8 | Gratitude flow |
| breath-circle | 280x280 | true | 1.0 | Breathing exercises |
| water-energy | 300x300 | true | 1.0 | Water manifest |
| letter-fly | fullWidth x 60% | false | 1.0 | Letter flying away |
| paper-burn | 280x370 | false | 0.6 | Paper burning |
| crystal-glow | 250x250 | true | 0.8 | Crystal healing |
| shooting-star | fullWidth x 50% | false | 1.0 | Star wish |
| fire-ball | 200x200 | true | 1.0 | Fire effects |
| reward-light | 350x350 | true | 1.0 | Completion effects |

## 5.3 CompletionCelebration Component

```javascript
import { CompletionCelebration } from '../components/Rituals/cosmic';

<CompletionCelebration
  visible={showCompletion}
  ritualName="Mo Rong Trai Tim"
  xpEarned={30}
  streakCount={5}
  onWriteReflection={(text) => setReflection(text)}
  onClose={handleClose}
  onAddToVisionBoard={handleAddToBoard}
  onLinkGoal={handleLinkGoal}
/>
```

## 5.4 Other Cosmic Components

| Component | Description |
|-----------|-------------|
| GlassCard | Glassmorphism container with blur |
| GlassInputCard | Glassmorphism input field |
| GlowButton | Button with glow effect |
| GlowingOrb | Animated orb element |
| ParticleField | Floating particles background |
| PulsingCircle | Breathing circle animation |
| ProgressRing | Circular progress indicator |
| InstructionText | Animated instruction text |
| RitualHeader | Screen header with back button |

---

# 6. SCREEN SPECIFICATIONS

## 6.1 VisionBoardScreen

Main dashboard showing goals, habits, rituals, and divination sections.

### Sections
1. **Header** - Date, streak, XP display
2. **QuickStatsRow** - Today's progress
3. **FeaturedRitualSection** - Daily ritual suggestion + library
4. **DivinationSection** - Tarot/I Ching
5. **GoalCards** - Active goals
6. **HabitGrid** - Daily habits
7. **TodayTasksList** - Today's tasks

## 6.2 RitualPlaygroundScreen

Generic ritual screen for rituals without dedicated screens.

### Header
- Back button
- Ritual icon + title
- Sound toggle
- More options

### Background
- LinearGradient or VideoBackground

## 6.3 RitualHistoryScreen

History of completed rituals with stats.

### Features
- Total completions
- Current streak
- Favorite ritual
- Cosmic map visualization
- Filter by ritual type
- Chronological list

---

# 7. INDIVIDUAL RITUAL IMPLEMENTATIONS

## 7.1 HeartExpansionRitual

### Phases
1. `intro` - Welcome screen with pulsing heart
2. `breath` - Breath sync (6 cycles, 4-2-6 pattern)
3. `expansion` - Swipe to send love waves
4. `completion` - XP badge + actions

### Timer Issue (NEEDS FIX)
- Timer always shows 0s
- Missing `handleComplete` in useEffect dependency
- Stale closure with `energyLevel`

## 7.2 GratitudeFlowRitual

### Phases
1. `start` - Introduction
2. `input` - Enter 1-5 gratitude items
3. `sending` - Animation sending to universe (NEEDS Lottie)
4. `completed` - Completion

## 7.3 CleansingBreathRitual

### Phases
- 4-4-4-4 box breathing pattern
- 4+ cycles total
- Visual breath circle animation

## 7.4 WaterManifestRitual

### Steps
1. Prepare water glass
2. Write intention
3. Charge water (30s)
4. Drink water

## 7.5 LetterToUniverseRitual

### Phases
1. Write letter/wish
2. Fold animation
3. Send to universe animation (NEEDS Lottie)
4. Completion

## 7.6 BurnReleaseRitual

### Phases
1. Write what to release
2. Read one last time
3. Burn animation (NEEDS Lottie)
4. Feel the release

## 7.7 StarWishRitual

### Phases
1. Choose a star
2. Write wish
3. Send wish to star (NEEDS VideoBackground + Lottie)
4. Completion (button text color NEEDS FIX)

## 7.8 CrystalHealingRitual

### Phases
1. Choose crystal type
2. Set healing intention
3. Connect with crystal energy
4. Completion

---

# 8. ANIMATION & EFFECTS SYSTEM

## 8.1 Animation Utilities

All animation utilities are in `utils/cosmicAnimations.js`:

```javascript
// Available animation presets
createPulseAnimation(value, config)
createGlowAnimation(value, config)
createFloatAnimation(value, config)
createBreathAnimation(value, config)
createBoxBreathAnimation(value, config)
createParticleAnimation(value, config)
createTwinkleAnimation(value, config)
createPressAnimation(value, config)
createReleaseAnimation(value, config)
createSuccessAnimation(value, config)
createSparkleAnimation(value, config)
createRippleAnimation(value, config)
createFlameFlickerAnimation(value, config)
createBurnAnimation(value, config)
createShootingStarAnimation(value, config)
createLetterFlyAnimation(value, config)
createGodRaysAnimation(value, config)
```

## 8.2 Haptic Feedback Patterns

All haptic utilities are in `utils/hapticPatterns.js`:

```javascript
// Available haptic patterns
HAPTIC_PATTERNS = {
  light, medium, heavy, soft,
  success, warning, error,
  selection, toggle, tap, longPress,
  breathIn, breathOut, breathHold,
  ritual_start, ritual_complete, phase_change
}

// Usage
import { safeHaptic, HAPTIC_PATTERNS } from '../utils/hapticPatterns';
safeHaptic(HAPTIC_PATTERNS.success);
```

---

# 9. DESIGN TOKENS & THEME

## 9.1 Cosmic Tokens

All design tokens are in `theme/cosmicTokens.js`:

### Colors
```javascript
COSMIC_COLORS = {
  // Backgrounds
  spaceBlack: '#05040B',
  spaceDark: '#0F0A1F',
  cosmicPurple: '#1A0533',

  // Accents
  gold: '#FFD700',
  purple: '#6A5BFF',
  pink: '#FF69B4',
  teal: '#4ECDC4',

  // Glass
  glassWhite: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
}
```

### Gradients
```javascript
COSMIC_GRADIENTS = {
  spaceBackground: ['#05040B', '#0F0A1F', '#1A0533'],
  heartTheme: ['#1A0510', '#2D0A1A', '#4A1030'],
  waterTheme: ['#0A1A1A', '#102828', '#1A3D3D'],
  fireTheme: ['#1A0A0A', '#2D1010', '#3D1515'],
  starTheme: ['#0A0A1A', '#101028', '#151535'],
}
```

---

# 10. DATABASE SCHEMA

## 10.1 Tables

### vision_rituals
Master list of available rituals.

### vision_ritual_completions
Records each ritual completion.

```sql
CREATE TABLE vision_ritual_completions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  ritual_id VARCHAR(50),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  user_input TEXT,        -- Main ritual input
  reflection TEXT,        -- Post-ritual reflection
  content JSONB,          -- Additional structured content
  xp_earned INTEGER,
  goal_id UUID,
  created_at TIMESTAMPTZ
);
```

### vision_ritual_streaks
Tracks user streaks per ritual.

---

# 11. SERVICE LAYER & API

## 11.1 ritualService.js

```javascript
// Exported Functions
getAllRituals()                    // Get all active rituals
getRitualById(ritualId)            // Get ritual by ID
getUserRitualProgress(userId)      // Get user's streaks
completeRitual(userId, ritualSlug, content)  // Complete a ritual
getTodayCompletions(userId)        // Get today's completed
getRitualHistory(userId, limit)    // Get history
getRitualStats(userId)             // Get statistics
getRecommendedRituals(userId)      // Time-based recommendations
```

## 11.2 ritualTrackingService.js

Analytics and tracking service.

## 11.3 VisionBoardContext.js

State management for the entire VisionBoard feature.

---

# 12. GAMIFICATION SYSTEM

## 12.1 XP System

| Ritual | Base XP |
|--------|---------|
| Star Wish | 25 XP |
| Letter to Universe | 25 XP |
| Cleansing Breath | 35 XP |
| Burn & Release | 35 XP |
| Heart Expansion | 30 XP |
| Gratitude Flow | 30 XP |
| Water Manifest | 30 XP |
| Crystal Healing | 30 XP |

### Streak Bonuses
- 7-day streak: +50 XP
- 30-day streak: +200 XP

---

# 13. ACCESS CONTROL

## 13.1 Tier-Based Access

| Feature | Free | Tier 1 | Tier 2+ |
|---------|------|--------|---------|
| Basic Rituals (3) | Yes | Yes | Yes |
| All Rituals (8) | No | Yes | Yes |
| Ritual History | Limited | Full | Full |
| Streak Bonuses | No | Yes | Yes |
| Video Backgrounds | No | Yes | Yes |

## 13.2 Free Tier Rituals
- Star Wish
- Cleansing Breath
- Gratitude Flow

---

# 14. NAVIGATION & ROUTING

## 14.1 RITUAL_SCREENS Mapping

```javascript
// rituals/index.js
export const RITUAL_SCREENS = {
  'heart-expansion': 'HeartExpansionRitual',
  'heart-opening': 'HeartExpansionRitual',
  'gratitude-flow': 'GratitudeFlowRitual',
  'cleansing-breath': 'CleansingBreathRitual',
  'purify-breathwork': 'CleansingBreathRitual',
  'water-manifest': 'WaterManifestRitual',
  'letter-to-universe': 'LetterToUniverseRitual',
  'burn-release': 'BurnReleaseRitual',
  'star-wish': 'StarWishRitual',
  'crystal-healing': 'CrystalHealingRitual',
};
```

---

# 15. KNOWN ISSUES & FIXES REQUIRED

## 15.1 High Priority

### HeartExpansion Timer Bug
- **Issue**: Timer always shows 0s, doesn't count down
- **File**: `HeartExpansionRitual.js` line 238-255
- **Fix**: Add `handleComplete` to useEffect dependency array

### Lottie Animations Missing
- **Issue**: Several rituals don't use Lottie animations
- **Affected**: LetterToUniverse, GratitudeFlow, BurnRelease, StarWish
- **Fix**: Import and use `RitualAnimation` component

### StarWish VideoBackground
- **Issue**: Not using VideoBackground component
- **Fix**: Wrap content with `VideoBackground ritualId="star-wish"`

### StarWish Button Text Color
- **Issue**: White text on white button (unreadable)
- **Fix**: Change completion button text to dark color

### Reflection Not Saving
- **Issue**: Reflection data collected but not saved to database
- **Affected**: All 8 rituals
- **Fix**: Include `reflection` in `completeRitual` call content

## 15.2 UI Cleanup Required

### Remove Buttons
- "Tao nghi thuc" button (2 locations)
- "Che do thien" button

### Remove Tab
- "Tuy chinh" tab in filter tags

**Files**:
- `DivinationSection.js` line 559
- `FeaturedRitualSection.js` lines 81, 459, 469

## 15.3 Calendar Integration

### Issue
Calendar only shows goals/habits, not rituals and divination.

### Required
- Add `getDailyJournal()` to calendarService
- Create `DailyJournalSection` component
- Update `DayDetailModal` to show rituals

---

# 16. PERFORMANCE OPTIMIZATION

## 16.1 Current Optimizations

- **Animation Cleanup**: useEffect cleanup for all animations
- **Memoization**: useMemo for particle arrays
- **Sound Cleanup**: Audio unload on unmount
- **Interval Cleanup**: All timers cleared on unmount
- **Video Preloading**: `preloadVideo()` function available

## 16.2 Recommended Optimizations

### Lazy Loading
```javascript
const HeartExpansionRitual = React.lazy(() =>
  import('./rituals/HeartExpansionRitual')
);
```

### Video Optimization
- Preload on screen focus
- Pause/unload on blur
- Use lower resolution videos on low-end devices

### Animation Optimization
- Use `useNativeDriver: true` everywhere
- Reduce particle counts on low-end devices
- Simplify animations based on device capability

### Component Memoization
```javascript
export default React.memo(RitualCard, (prev, next) =>
  prev.ritual.id === next.ritual.id
);
```

---

# APPENDIX

## A. Icon Mapping (Lucide Icons)

```javascript
const RITUAL_ICONS = {
  Heart, Gift, Wind, Droplet, Mail, Flame, Star, Gem,
  Moon, Sparkles, Clock, ChevronRight, ArrowRight
};
```

## B. File Dependencies

### Ritual Screens
```javascript
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual } from '../../../services/ritualService';
import {
  VideoBackground,
  RitualAnimation,
  GlassCard,
  GlowButton,
  CompletionCelebration,
  RitualHeader,
} from '../../../components/Rituals/cosmic';
```

## C. Quick Reference - Implementing a Ritual

```javascript
// 1. Import cosmic components
import {
  VideoBackground,
  RitualAnimation,
  CompletionCelebration,
} from '../../../components/Rituals/cosmic';

// 2. Wrap with VideoBackground
<VideoBackground ritualId="your-ritual-id">
  {/* Your content */}
</VideoBackground>

// 3. Use RitualAnimation for key visuals
<RitualAnimation
  animationId="your-animation-id"
  autoPlay={true}
/>

// 4. Use CompletionCelebration at the end
<CompletionCelebration
  visible={isComplete}
  ritualName="Your Ritual Name"
  xpEarned={30}
  onWriteReflection={(text) => setReflection(text)}
  onClose={handleClose}
/>

// 5. Save with reflection
await completeRitual(userId, 'your-ritual-id', {
  userInput: input,
  reflection: reflection,
});
```

---

**END OF DOCUMENT**
