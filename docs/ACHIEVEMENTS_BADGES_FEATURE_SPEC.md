# ACHIEVEMENTS & BADGES SYSTEM - COMPLETE FEATURE SPEC

**Version:** 1.0
**Last Updated:** December 14, 2025
**Platform:** GEM Mobile App (React Native)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Achievement System](#2-achievement-system)
3. [Badge System](#3-badge-system)
4. [Streak System](#4-streak-system)
5. [Combo System](#5-combo-system)
6. [XP & Level System](#6-xp--level-system)
7. [Database Schema](#7-database-schema)
8. [RPC Functions](#8-rpc-functions)
9. [Service Layer](#9-service-layer)
10. [UI Components](#10-ui-components)
11. [Design Specifications](#11-design-specifications)
12. [Integration Points](#12-integration-points)
13. [Animations & Effects](#13-animations--effects)

---

## 1. Overview

### 1.1 System Purpose

The Achievements & Badges system gamifies user engagement across Vision Board, Trading Mindset, and Paper Trading features. It rewards consistent behavior through:

- **Achievements**: Milestone-based rewards for completing specific goals
- **Badges**: Visual status indicators for user profile (verification, tier, role)
- **Streaks**: Consecutive day tracking for habit formation
- **Combos**: Daily multi-task completion bonuses
- **XP/Levels**: Progressive experience point system

### 1.2 Core Components

| Component | Description | Service |
|-----------|-------------|---------|
| Achievements | 25+ unlockable milestones | `gamificationService.js` |
| Badges | Visual profile status | `badgeService.js` |
| Streaks | 5 streak types tracking | `gamificationService.js` |
| Combos | Daily combo multiplier | `gamificationService.js` |
| XP/Levels | 12 level progression | `progressCalculator.js` |

---

## 2. Achievement System

### 2.1 Achievement Categories

| Category | ID Prefix | Description |
|----------|-----------|-------------|
| **Streak** | `streak_*` | Consecutive day milestones |
| **Combo** | `combo_*` | Daily multi-task achievements |
| **Action** | `action_*` | Action plan completions |
| **Trading** | `mindset_*`, `paper_trade_*` | Trading mindset achievements |

### 2.2 Complete Achievement Definitions

#### STREAK ACHIEVEMENTS (5 total)

| ID | Title (VI) | Description | Icon | Points | Threshold |
|----|------------|-------------|------|--------|-----------|
| `streak_3` | Khởi đầu tốt | 3 ngày liên tiếp | `flame` | 50 | 3 days |
| `streak_7` | Tuần lễ vàng | 7 ngày liên tiếp | `star` | 100 | 7 days |
| `streak_14` | Hai tuần kiên trì | 14 ngày liên tiếp | `award` | 200 | 14 days |
| `streak_30` | Chiến binh tháng | 30 ngày liên tiếp | `trophy` | 500 | 30 days |
| `streak_100` | Bậc thầy kỷ luật | 100 ngày liên tiếp | `crown` | 2000 | 100 days |

#### COMBO ACHIEVEMENTS (4 total)

| ID | Title (VI) | Description | Icon | Points | Threshold |
|----|------------|-------------|------|--------|-----------|
| `first_combo` | Combo đầu tiên | Hoàn thành cả 3 mục trong ngày | `zap` | 50 | - |
| `full_combo_4` | Perfect Day | Hoàn thành cả 4 mục trong ngày | `sparkles` | 100 | - |
| `combo_streak_3` | Combo 3 ngày | 3 ngày full combo liên tiếp | `flame` | 150 | 3 days |
| `combo_streak_7` | Combo tuần | 7 ngày full combo liên tiếp | `star` | 350 | 7 days |

#### ACTION ACHIEVEMENTS (5 total)

| ID | Title (VI) | Description | Icon | Points | Threshold |
|----|------------|-------------|------|--------|-----------|
| `first_action` | Hành động đầu tiên | Hoàn thành action plan đầu tiên | `check-circle` | 30 | - |
| `action_streak_3` | Người hành động | 3 ngày hoàn thành action liên tiếp | `target` | 75 | 3 days |
| `action_streak_7` | Chiến binh hành động | 7 ngày hoàn thành action liên tiếp | `rocket` | 175 | 7 days |
| `action_streak_14` | Bậc thầy hành động | 14 ngày hoàn thành action liên tiếp | `crown` | 400 | 14 days |
| `action_master` | Action Master | Hoàn thành 100 action items | `trophy` | 500 | 100 total |

#### TRADING MINDSET ACHIEVEMENTS (9 total)

| ID | Title (VI) | Description | Icon | Points | Threshold |
|----|------------|-------------|------|--------|-----------|
| `mindset_first` | Nhà giao dịch có ý thức | Hoàn thành đánh giá tâm thế đầu tiên | `brain` | 50 | - |
| `mindset_streak_3` | Trader kỷ luật | 3 ngày check mindset liên tiếp | `target` | 100 | 3 days |
| `mindset_streak_7` | Bậc thầy kỷ luật trading | 7 ngày check mindset liên tiếp | `award` | 200 | 7 days |
| `mindset_high_score` | Tâm thế hoàn hảo | Đạt điểm mindset 90+ | `star` | 100 | Score 90+ |
| `mindset_compliance` | Tuân thủ hoàn hảo | Không trade khi điểm dưới 60 trong 7 ngày | `shield` | 300 | 7 days |
| `paper_trade_first` | Trader khởi đầu | Hoàn thành paper trade đầu tiên | `trending-up` | 30 | - |
| `paper_trade_10` | Trader tích cực | Hoàn thành 10 paper trades | `activity` | 100 | 10 trades |
| `paper_trade_win_streak_3` | Streak thắng | 3 paper trades thắng liên tiếp | `flame` | 150 | 3 wins |
| `paper_trade_win_rate_60` | Win Rate 60% | Đạt win rate 60% với ít nhất 10 trades | `trophy` | 250 | 60% WR |

### 2.3 Achievement Icon Mapping

```javascript
const ICON_MAP = {
  flame: Icons.Flame,
  star: Icons.Star,
  award: Icons.Award,
  trophy: Icons.Trophy,
  crown: Icons.Crown,
  zap: Icons.Zap,
  sparkles: Icons.Sparkles,
  target: Icons.Target,
  check: Icons.Check,
  'check-circle': Icons.CheckCircle,
  brain: Icons.Brain,
  shield: Icons.Shield,
  rocket: Icons.Rocket,
  'trending-up': Icons.TrendingUp,
  activity: Icons.Activity,
};
```

---

## 3. Badge System

### 3.1 Badge Categories & Priority

| Category | Priority Range | Description |
|----------|----------------|-------------|
| **Verification** | 99-100 | Official verification status |
| **Role** | 80-90 | Admin, Moderator, Mentor |
| **Tier** | 50-70 | Subscription tier level |
| **Level** | 30-45 | Trading level (bronze-diamond) |
| **Achievement** | 20-25 | Special achievement badges |

### 3.2 Complete Badge Definitions

#### VERIFICATION BADGES

| Type | Label | Color | Icon | Priority |
|------|-------|-------|------|----------|
| `verified_seller` | Verified Seller | `#3AF7A6` | `ShieldCheck` | 100 |
| `verified_trader` | Verified Trader | `#3B82F6` | `BadgeCheck` | 99 |

#### ROLE BADGES

| Type | Label | Color | Icon | Priority |
|------|-------|-------|------|----------|
| `admin` | Admin | `#FFD700` (Gold) | `Shield` | 90 |
| `moderator` | Moderator | `#F59E0B` | `ShieldAlert` | 85 |
| `mentor` | Mentor | `#10B981` | `GraduationCap` | 80 |

#### TIER BADGES

| Type | Label | Color | Icon | Priority |
|------|-------|-------|------|----------|
| `tier_3` | Tier 3 | `#FFD700` (Gold) | `Crown` | 70 |
| `tier_2` | Tier 2 | `#FFBD59` | `Sparkles` | 65 |
| `tier_1` | Tier 1 | `#00D9FF` | `Star` | 60 |
| `tier_free` | Free | `rgba(255,255,255,0.3)` | `User` | 50 |

#### LEVEL BADGES

| Type | Label | Color | Icon | Priority |
|------|-------|-------|------|----------|
| `diamond` | Diamond | `#B9F2FF` | `Gem` | 45 |
| `gold` | Gold | `#FFD700` | `TrendingUp` | 40 |
| `silver` | Silver | `#C0C0C0` | `TrendingUp` | 35 |
| `bronze` | Bronze | `#CD7F32` | `TrendingUp` | 30 |

#### ACHIEVEMENT BADGES

| Type | Label | Color | Icon | Priority |
|------|-------|-------|------|----------|
| `top_trader` | Top Trader | `#FFBD59` | `Trophy` | 25 |
| `pattern_master` | Pattern Master | `#8B5CF6` | `Target` | 24 |
| `early_adopter` | Early Adopter | `#FFD700` | `Rocket` | 23 |
| `whale` | Whale | `#00D9FF` | `Waves` | 22 |
| `streak_master` | Streak Master | `#F97316` | `Flame` | 21 |
| `community_star` | Community Star | `#EC4899` | `Star` | 20 |

### 3.3 Badge Size Configurations

```javascript
BADGE_SIZES = {
  tiny: {
    iconSize: 12,
    containerSize: 16,
    fontSize: 8,
    borderRadius: 4,
  },
  small: {
    iconSize: 14,
    containerSize: 20,
    fontSize: 9,
    borderRadius: 5,
  },
  medium: {
    iconSize: 16,
    containerSize: 24,
    fontSize: 10,
    borderRadius: 6,
  },
  large: {
    iconSize: 20,
    containerSize: 32,
    fontSize: 12,
    borderRadius: 8,
  },
};
```

### 3.4 Sparkle Animation Badges

Special badges with animated sparkle effects:

```javascript
SPARKLE_BADGES = ['admin', 'tier_3', 'diamond', 'verified_seller', 'verified_trader'];
```

**Golden Badges** (extra pulse & glow):
- `admin`
- `tier_3`

---

## 4. Streak System

### 4.1 Streak Types

| Type | Description | Tracked By |
|------|-------------|------------|
| `affirmation` | Daily affirmation completion | Daily task |
| `habit` | Daily habit completion | Daily task |
| `goal` | Daily goal check-in | Daily task |
| `action` | Action plan completion | Vision Board |
| `combo` | Full combo (all categories) | Auto when 3/3 or 4/4 |

### 4.2 Streak Data Structure

```javascript
{
  streak_type: 'combo',
  current_streak: 7,
  longest_streak: 14,
  total_completions: 45,
  last_completion_date: '2025-12-14',
  freeze_count: 2,
  last_freeze_date: null
}
```

### 4.3 Streak Freeze Feature

- Users can "freeze" a streak to prevent breaking
- Limited number of freezes available
- Updates `last_completion_date` to maintain streak

---

## 5. Combo System

### 5.1 Tracking Categories

```javascript
TRACKING_CATEGORIES = ['affirmation', 'habit', 'goal', 'action'];
```

### 5.2 Combo Multipliers

| Combo Count | Multiplier | Description |
|-------------|------------|-------------|
| 0 | x1.0 | No completion |
| 1 | x1.0 | 1 category |
| 2 | x1.25 | 2 categories |
| 3 | x1.5 | 3 categories (legacy full combo) |
| 4 | x1.75 | 4 categories |
| Full Combo | x2.0 | All categories + streak bonus |

### 5.3 Daily Completion Status

```javascript
{
  affirmationDone: true,
  habitDone: true,
  goalDone: false,
  actionDone: true,
  comboCount: 3,
  multiplier: 1.5
}
```

---

## 6. XP & Level System

### 6.1 XP Rewards Table

| Action | Base XP | Notes |
|--------|---------|-------|
| `action_complete` | 20 | Basic action completion |
| `action_complete_early` | 30 | Early completion bonus |
| `action_complete_streak` | +5 | Per streak day bonus |
| `affirmation_complete` | 5 | Single affirmation |
| `affirmation_all_daily` | 15 | All daily affirmations |
| `affirmation_streak_7` | 50 | 7-day streak |
| `affirmation_streak_30` | 200 | 30-day streak |
| `habit_complete` | 10 | Single habit |
| `habit_streak_7` | 70 | 7-day streak |
| `habit_streak_30` | 300 | 30-day streak |
| `milestone_25` | 50 | 25% goal milestone |
| `milestone_50` | 100 | 50% goal milestone |
| `milestone_75` | 150 | 75% goal milestone |
| `goal_complete` | 500 | 100% goal complete |
| `daily_combo_all` | 50 | Full daily combo |
| `weekly_perfect` | 200 | Perfect week |
| `monthly_perfect` | 1000 | Perfect month |
| `daily_checkin` | 10 | Daily app check-in |
| `add_goal` | 20 | Creating new goal |

### 6.2 Level Progression

| Level | XP Required | Title (VI) | Badge Icon |
|-------|-------------|------------|------------|
| 1 | 0 | Người Mới Bắt Đầu | `seedling` |
| 2 | 100 | Người Tập Sự | `sprout` |
| 3 | 300 | Người Nỗ Lực | `tree` |
| 4 | 600 | Người Kiên Trì | `star` |
| 5 | 1,000 | Người Quyết Tâm | `star` |
| 6 | 1,500 | Chiến Binh | `sword` |
| 7 | 2,200 | Chiến Binh Bạc | `shield` |
| 8 | 3,000 | Chiến Binh Vàng | `crown` |
| 9 | 4,000 | Bậc Thầy | `gem` |
| 10 | 5,500 | Huyền Thoại | `trident` |
| 11 | 7,500 | Đại Sư | `galaxy` |
| 12 | 10,000 | Bất Tử | `sparkles` |

### 6.3 XP Calculation with Multipliers

```javascript
calculateXP(type, context) {
  let baseXP = XP_REWARDS[type] || 0;

  // Combo multiplier
  if (context.comboCount && COMBO_MULTIPLIERS[context.comboCount]) {
    baseXP = Math.round(baseXP * COMBO_MULTIPLIERS[context.comboCount]);
  }

  // Streak bonus (max +15 from 30 days)
  if (context.streakDays > 0) {
    const streakBonus = Math.min(context.streakDays, 30) * 0.5;
    baseXP = Math.round(baseXP + streakBonus);
  }

  return baseXP;
}
```

---

## 7. Database Schema

### 7.1 Tables

#### `daily_completions`

```sql
CREATE TABLE daily_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Category tracking
  affirmation_done BOOLEAN DEFAULT FALSE,
  habit_done BOOLEAN DEFAULT FALSE,
  goal_done BOOLEAN DEFAULT FALSE,
  action_done BOOLEAN DEFAULT FALSE,

  -- Combo stats
  combo_count INT DEFAULT 0,
  combo_multiplier DECIMAL(3,2) DEFAULT 1.0,
  points_earned INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, completion_date)
);
```

#### `user_achievements`

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  achievement_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL DEFAULT 'milestone',
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  points_awarded INT DEFAULT 0,
  trigger_value INT,

  UNIQUE(user_id, achievement_id)
);
```

#### `user_streaks`

```sql
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  streak_type TEXT NOT NULL,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_completions INT DEFAULT 0,
  last_completion_date DATE,
  freeze_count INT DEFAULT 0,
  last_freeze_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, streak_type)
);
```

### 7.2 Indexes

```sql
CREATE INDEX idx_daily_completions_user ON daily_completions(user_id);
CREATE INDEX idx_daily_completions_date ON daily_completions(completion_date DESC);
CREATE INDEX idx_daily_completions_user_date ON daily_completions(user_id, completion_date);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_type ON user_achievements(achievement_type);
```

### 7.3 RLS Policies

```sql
-- daily_completions
CREATE POLICY "Users can read own completions" ON daily_completions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON daily_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own completions" ON daily_completions
  FOR UPDATE USING (auth.uid() = user_id);

-- user_achievements
CREATE POLICY "Users can read own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 8. RPC Functions

### 8.1 `track_daily_completion(p_user_id, p_category)`

**Purpose:** Mark a category as completed and update combo

**Returns:**
```json
{
  "category": "affirmation",
  "combo_count": 3,
  "multiplier": 1.5,
  "is_full_combo": true,
  "affirmation_done": true,
  "habit_done": true,
  "goal_done": true
}
```

### 8.2 `get_daily_completion_status(p_user_id)`

**Purpose:** Get today's completion status

**Returns:**
```json
{
  "affirmation_done": true,
  "habit_done": false,
  "goal_done": true,
  "action_done": false,
  "combo_count": 2,
  "multiplier": 1.25
}
```

### 8.3 `get_habit_grid_data(p_user_id, p_days)`

**Purpose:** Get completion data for GitHub-style habit grid

**Parameters:**
- `p_user_id`: User UUID
- `p_days`: Number of days (default 35 for 5x7 grid)

**Returns:** Table of daily records

### 8.4 `award_achievement(p_user_id, p_achievement_id, p_achievement_type, p_points, p_trigger_value)`

**Purpose:** Award an achievement (ON CONFLICT DO NOTHING)

**Returns:** Boolean (true if newly awarded)

---

## 9. Service Layer

### 9.1 `gamificationService.js`

**Location:** `gem-mobile/src/services/gamificationService.js`

**Key Methods:**

| Method | Description |
|--------|-------------|
| `trackCompletion(userId, category)` | Track daily completion |
| `trackActionCompletion(userId, widgetId)` | Convenience for action tracking |
| `getDailyStatus(userId)` | Get today's completion status |
| `getStreak(userId, streakType)` | Get specific streak data |
| `getAllStreaks(userId)` | Get all streak types |
| `getHabitGridData(userId, days)` | Get grid data |
| `getAchievements(userId)` | Get unlocked achievements |
| `checkAchievements(userId, data, category)` | Check & award achievements |
| `awardAchievement(userId, id, type, points, value)` | Award specific achievement |
| `useStreakFreeze(userId, streakType)` | Use a streak freeze |
| `getGamificationSummary(userId)` | Get full summary |

**Exports:**
- `ACHIEVEMENTS` - Achievement definitions object
- `TRACKING_CATEGORIES` - Valid categories array
- Default: GamificationService instance

### 9.2 `badgeService.js`

**Location:** `gem-mobile/src/services/badgeService.js`

**Key Methods:**

| Method | Description |
|--------|-------------|
| `tierToBadgeType(tier)` | Convert tier string to badge type |
| `getUserBadges(profile)` | Get all badges for user profile |
| `getBadgeConfig(type)` | Get badge configuration |
| `getBadgeSizeConfig(size)` | Get size configuration |

**Exports:**
- `BADGE_COLORS`
- `BADGE_ICONS`
- `BADGE_LABELS`
- `BADGE_PRIORITY`
- `BADGE_SIZES`

### 9.3 `progressCalculator.js`

**Location:** `gem-mobile/src/services/progressCalculator.js`

**Key Methods:**

| Method | Description |
|--------|-------------|
| `calculateDailyScore(stats)` | Calculate weighted daily score |
| `calculateGoalProgress(goal, actions)` | Calculate goal progress |
| `getLevelFromXP(totalXP)` | Get level info from XP |
| `calculateXP(type, context)` | Calculate XP with multipliers |
| `getComboMultiplier(count)` | Get combo multiplier |
| `isFullCombo(status)` | Check if full combo |
| `getMilestoneReached(progress)` | Get milestone info |
| `getProgressColor(score)` | Get color for score |
| `getStreakMessage(streak)` | Get streak message |

**Exports:**
- `PROGRESS_WEIGHTS` - { actions: 0.6, affirmations: 0.2, habits: 0.2 }
- `XP_REWARDS` - XP amounts per action
- `LEVELS` - Level progression array
- `COMBO_MULTIPLIERS` - Multiplier mapping

---

## 10. UI Components

### 10.1 AchievementsScreen

**Location:** `gem-mobile/src/screens/VisionBoard/AchievementsScreen.js`

**Features:**
- Progress overview card with trophy icon
- Progress bar with gold-to-purple gradient
- Level badge display (LevelBadge component)
- Category filter tabs (horizontal scroll)
- Achievement grid (2 columns, 47% width each)
- Pull-to-refresh

**State:**
```javascript
const [achievements, setAchievements] = useState([]);
const [unlockedIds, setUnlockedIds] = useState([]);
const [selectedCategory, setSelectedCategory] = useState('all');
const [totalXP, setTotalXP] = useState(0);
const [levelInfo, setLevelInfo] = useState(null);
```

### 10.2 AchievementCard Component

**Structure:**
```jsx
<View style={[styles.achievementCard, !isUnlocked && styles.achievementCardLocked]}>
  {/* Icon circle */}
  <View style={styles.achievementIcon}>
    <IconComponent size={28} color={isUnlocked ? COLORS.gold : COLORS.textMuted} />
  </View>

  {/* Title & Description */}
  <Text style={styles.achievementTitle}>{achievement.title}</Text>
  <Text style={styles.achievementDesc}>{achievement.description}</Text>

  {/* XP Badge */}
  <View style={styles.xpBadge}>
    <Icons.Sparkles size={12} color={COLORS.gold} />
    <Text>+{achievement.xp}</Text>
  </View>

  {/* Unlocked/Lock indicator */}
  {isUnlocked ? <CheckBadge /> : <LockOverlay />}
</View>
```

### 10.3 UserBadge Component

**Location:** `gem-mobile/src/components/UserBadge/UserBadge.js`

**Props:**
- `type` - Badge type string
- `size` - 'tiny' | 'small' | 'medium' | 'large'
- `showLabel` - Boolean for label display
- `style` - Additional styles

**Features:**
- Automatic sparkle animation for premium badges
- Pulse animation for golden badges (admin, tier_3)
- Expanding glow ring effect
- 4 animated sparkle dots with staggered timing

### 10.4 XPGoalTracker & LevelBadge

**Location:** `gem-mobile/src/components/Charts/`

**XPGoalTracker:**
- Circular progress indicator
- XP count display
- Level up animation

**LevelBadge:**
- Compact level display
- Icon based on level badge
- Size variants: 'small', 'medium', 'large'

---

## 11. Design Specifications

### 11.1 Color Constants

```javascript
// From tokens.js
COLORS = {
  gold: '#FFBD59',
  purple: '#6A5BFF',
  cyan: '#00F0FF',
  success: '#3AF7A6',
  info: '#3B82F6',
  error: '#FF6B6B',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  bgDarkest: '#0A0B1E',
  glassBg: 'rgba(15, 16, 48, 0.55)',
};

// Badge-specific colors
GOLD_PRIMARY = '#FFD700';
GOLD_BRIGHT = '#FFEA00';
GOLD_LIGHT = '#FFF8DC';
SPARKLE_WHITE = '#FFFFFF';

// Progress score colors
SCORE_COLORS = {
  excellent: '#3AF7A6',  // 80-100
  good: '#FFBD59',       // 60-79
  average: '#00F0FF',    // 40-59
  low: '#6A5BFF',        // 20-39
  veryLow: '#9C0612',    // 0-19
};
```

### 11.2 Glass Morphism Styles

```javascript
GLASS = {
  borderRadius: 18,
  borderWidth: 1.2,
  borderColor: 'rgba(106, 91, 255, 0.3)',
};

// Achievement card
achievementCard: {
  backgroundColor: 'rgba(15, 16, 48, 0.55)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255, 189, 89, 0.2)', // Unlocked
  // OR
  borderColor: 'rgba(255, 255, 255, 0.1)', // Locked
}
```

### 11.3 Typography

```javascript
TYPOGRAPHY = {
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
```

### 11.4 Spacing

```javascript
SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
```

### 11.5 Achievement Icon Circle

```javascript
// Unlocked
achievementIconUnlocked: {
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: 'rgba(255, 189, 89, 0.2)', // Gold tint
  alignItems: 'center',
  justifyContent: 'center',
}

// Locked
achievementIconLocked: {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
}
```

### 11.6 XP Badge

```javascript
xpBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 189, 89, 0.15)',
  paddingVertical: 2,
  paddingHorizontal: 8,
  borderRadius: 4,
}
```

### 11.7 Progress Bar

```javascript
// Background
progressBarBg: {
  height: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
  overflow: 'hidden',
}

// Fill gradient
<LinearGradient
  colors={[COLORS.gold, COLORS.purple]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={{ width: `${percent}%`, height: '100%', borderRadius: 4 }}
/>
```

---

## 12. Integration Points

### 12.1 Vision Board Integration

**Files:** Various VisionBoard screens

**Triggers:**
- Complete affirmation → `trackCompletion('affirmation')`
- Complete habit → `trackCompletion('habit')`
- Complete goal check-in → `trackCompletion('goal')`
- Complete action → `trackActionCompletion(widgetId)`

### 12.2 Trading Mindset Integration

**Files:** `MindsetCheckModal.js`, `PaperTradeModal.js`

**Triggers:**
- Complete mindset assessment → Award `mindset_first`
- High score (90+) → Award `mindset_high_score`
- Daily check streak → Track `mindset_streak_*`

### 12.3 Paper Trading Integration

**Files:** `PaperTradeModal.js`, `paperTradeService.js`

**Triggers:**
- First paper trade → Award `paper_trade_first`
- 10 trades → Award `paper_trade_10`
- Win streak 3 → Award `paper_trade_win_streak_3`
- Win rate 60% (10+ trades) → Award `paper_trade_win_rate_60`

### 12.4 Profile Display Integration

**Files:** `ProfileHeader.js`, `UserProfileScreen.js`, `PostCard.js`

**Usage:**
```javascript
const badges = getUserBadges(profile);
const primaryBadge = badges[0]; // Highest priority

<UserBadge
  type={primaryBadge.type}
  size="small"
  showLabel={false}
/>
```

---

## 13. Animations & Effects

### 13.1 Sparkle Animation

**Timing Sequence:**
```javascript
// Sparkle 1: Top-right
delay: 0ms → fadeIn: 200ms → fadeOut: 300ms → delay: 1200ms

// Sparkle 2: Bottom-right
delay: 400ms → fadeIn: 200ms → fadeOut: 300ms → delay: 1000ms

// Sparkle 3: Top-left
delay: 800ms → fadeIn: 150ms → fadeOut: 250ms → delay: 1100ms

// Sparkle 4: Bottom-left (extra bright)
delay: 1200ms → fadeIn: 100ms → fadeOut: 200ms → delay: 900ms
```

### 13.2 Golden Badge Pulse

```javascript
// Scale animation (admin, tier_3)
Animated.loop(
  Animated.sequence([
    Animated.timing(scale, {
      toValue: 1.05,
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
    }),
    Animated.timing(scale, {
      toValue: 1,
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
    }),
  ])
);
```

### 13.3 Glow Ring Animation

```javascript
// Expanding glow ring
Animated.loop(
  Animated.sequence([
    Animated.timing(glowScale, {
      toValue: 1.3,
      duration: 1000,
      easing: Easing.out(Easing.ease),
    }),
    Animated.timing(glowScale, {
      toValue: 1,
      duration: 1000,
      easing: Easing.in(Easing.ease),
    }),
  ])
);

// Opacity = 1.3 - scale (fades as expands)
opacity: Animated.subtract(1.3, glowScale)
```

### 13.4 Achievement Unlock Animation (Recommended)

```javascript
// Suggested implementation for achievement unlock
{
  scale: { from: 0.5, to: 1.0, duration: 400, easing: 'spring' },
  opacity: { from: 0, to: 1, duration: 300 },
  rotate: { from: '-15deg', to: '0deg', duration: 400 },
  confetti: true, // Optional celebratory effect
}
```

---

## Appendix A: Category Labels (Vietnamese)

```javascript
CATEGORY_LABELS = {
  streak: 'Streak',
  goal: 'Mục tiêu',
  task: 'Nhiệm vụ',
  affirmation: 'Khẳng định',
  level: 'Cấp độ',
  special: 'Đặc biệt',
  combo: 'Combo',
  action: 'Hành động',
  trading: 'Giao dịch',
};
```

## Appendix B: Streak Messages (Vietnamese)

```javascript
getStreakMessage(streak) {
  if (streak >= 100) return 'Huyền thoại! 100+ ngày liên tiếp!';
  if (streak >= 30) return 'Tuyệt vời! Một tháng kiên trì!';
  if (streak >= 14) return 'Xuất sắc! 2 tuần không nghỉ!';
  if (streak >= 7) return 'Một tuần vàng!';
  if (streak >= 3) return 'Khởi đầu tốt!';
  if (streak > 0) return `${streak} ngày liên tiếp`;
  return 'Bắt đầu streak mới!';
}
```

---

**End of Document**
