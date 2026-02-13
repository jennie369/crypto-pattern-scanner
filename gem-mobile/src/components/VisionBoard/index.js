/**
 * Vision Board Gamification Components
 * Export all components from VisionBoard folder
 *
 * Updated: December 9, 2025 - Added Vision Board 2.0 Dashboard Components
 * Updated: December 14, 2025 - Added Quota UI Components
 */

// Existing gamification components
export { default as StreakBanner } from './StreakBanner';
export { default as ComboTracker } from './ComboTracker';
export { default as HabitGrid } from './HabitGrid';
export { default as AchievementModal } from './AchievementModal';
export { default as StreakHistoryModal } from './StreakHistoryModal';

// NEW: Vision Board 2.0 Dashboard Components
export { default as DailyScoreCard, DailyScoreCardCompact } from './DailyScoreCard';
export { default as QuickStatsRow, QuickStatsGrid, StatCard } from './QuickStatsRow';
export { default as TodayTasksList, TaskItem, TodayTasksCompact } from './TodayTasksList';
export { default as GoalCard, GoalCardsRow, GoalCardCompact, MilestoneIndicator } from './GoalCard';
export { default as GoalThumbnailCard } from './GoalThumbnailCard';
export { default as GoalsGridSection } from './GoalsGridSection';
export { default as CalendarHeatMap } from './CalendarHeatMap';

// Divination Section (Trải bài & Gieo quẻ) - Redesigned
export { default as DivinationSection } from './DivinationSection';

// NEW: Quota UI Components (Tier-based limits)
export { default as QuotaBar, QuotaBarCompact, QuotaSummaryCard } from './QuotaBar';
export { default as QuotaLimitModal, QuotaWarningBanner } from './QuotaLimitModal';

// NEW: Activity Feed (Phase 2 Upgrade)
export { default as ActivityFeed } from './ActivityFeed';

// NEW: Goal Creation from Templates (Centralized Templates)
export { default as GoalCreationOptions } from './GoalCreationOptions';
export { default as GoalFromJournalCard, GoalFromJournalCardCompact, JournalLinkBadge } from './GoalFromJournalCard';
