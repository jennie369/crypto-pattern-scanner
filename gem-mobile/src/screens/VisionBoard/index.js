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
export { default as AllGoalsScreen } from './AllGoalsScreen';
export { default as DailyRecapScreen } from './DailyRecapScreen';

// Calendar & Journal Screens (Smart Journal)
export { default as JournalEntryScreen } from './JournalEntryScreen';
export { default as TradingJournalScreen } from './TradingJournalScreen';
export { default as CalendarSettingsScreen } from './CalendarSettingsScreen';
export { default as EditEventScreen } from './EditEventScreen';
export { default as JournalDetailScreen } from '../Calendar/JournalDetailScreen';

// Ritual Playground Screens
export { default as RitualPlaygroundScreen } from './RitualPlaygroundScreen';
export { default as RitualHistoryScreen } from './RitualHistoryScreen';

// New Ritual Screens (Vision Board 2.0 - Cosmic Glassmorphism)
export {
  HeartExpansionRitual,
  GratitudeFlowRitual,
  CleansingBreathRitual,
  WaterManifestRitual,
  LetterToUniverseRitual,
  BurnReleaseRitual,
  StarWishRitual,
  CrystalHealingRitual,
  RITUAL_SCREENS,
  RITUAL_METADATA,
  getAllRituals,
  getRitualById,
} from './rituals';

// Widget components
export { default as AffirmationWidget } from './components/AffirmationWidget';
export { default as GoalsWidget } from './components/GoalsWidget';
export { default as AddWidgetModal } from './components/AddWidgetModal';
