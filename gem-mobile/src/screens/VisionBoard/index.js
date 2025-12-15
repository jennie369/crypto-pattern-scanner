/**
 * VisionBoard - Export tất cả components
 * Updated: December 10, 2025
 * Vision Board 2.0 Complete Redesign (merged into VisionBoardScreen)
 */

// Main VisionBoardScreen (2.0 redesign)
export { default as VisionBoardScreen } from './VisionBoardScreen';

// Detail Screens
export { default as AchievementsScreen } from './AchievementsScreen';
export { default as CalendarScreen } from './CalendarScreen';
export { default as GoalDetailScreen } from './GoalDetailScreen';
export { default as DailyRecapScreen } from './DailyRecapScreen';

// Ritual Playground Screens
export { default as RitualPlaygroundScreen } from './RitualPlaygroundScreen';
export { default as RitualHistoryScreen } from './RitualHistoryScreen';

// New Ritual Screens (Vision Board 2.0)
export {
  HeartExpansionRitual,
  GratitudeFlowRitual,
  CleansingBreathRitual,
  WaterManifestRitual,
  LetterToUniverseRitual,
  RITUAL_SCREENS,
} from './rituals';

// Widget components
export { default as AffirmationWidget } from './components/AffirmationWidget';
export { default as GoalsWidget } from './components/GoalsWidget';
export { default as AddWidgetModal } from './components/AddWidgetModal';
