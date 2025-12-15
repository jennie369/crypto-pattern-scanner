/**
 * GEM Mobile - GemMaster Components Index
 * Export all GemMaster related components
 *
 * Day 7 Updates:
 * - Added QuickActionBar
 * - Added ClearChatButton
 * - Added UpgradeModal
 *
 * Day 13-14 Updates:
 * - Added ExportButton
 * - Added ExportTemplateSelector
 * - Added ExportPreview
 */

// Tier & Quota Display Components
export { default as TierBadge } from './TierBadge';
export {
  default as QuotaIndicator,
  QuotaIndicatorCompact,
  QuotaProgressBar
} from './QuotaIndicator';

// Action Components
export { default as QuickActionBar } from './QuickActionBar';
export { default as ClearChatButton } from './ClearChatButton';

// Modal Components
export { default as UpgradeModal } from './UpgradeModal';

// Export Image Components
export { default as ExportButton } from './ExportButton';
export { default as ExportTemplateSelector } from './ExportTemplateSelector';
export { default as ExportPreview } from './ExportPreview';

// Voice Input Components (Day 11-12)
export { default as VoiceInputButton } from './VoiceInputButton';
export { default as RecordingIndicator } from './RecordingIndicator';
export { default as VoiceQuotaDisplay } from './VoiceQuotaDisplay';

// Dashboard Widget Components (Day 17-19)
export { default as GoalTrackingCard } from './GoalTrackingCard';
export { default as AffirmationCard } from './AffirmationCard';
export { default as ActionChecklistCard } from './ActionChecklistCard';
export { default as StatsWidget } from './StatsWidget';
export { default as WidgetSuggestionCard } from './WidgetSuggestionCard';

// Product Card
export { default as ProductCard } from './ProductCard';

// Smart Widget Components (Phase 2-3 GemMaster)
export { default as SmartFormCard } from '../SmartFormCard';
export { default as AddWidgetSuggestion, AddWidgetButton, AddWidgetFAB } from '../AddWidgetSuggestion';

// Crystal Components
export { default as CrystalLink, CrystalList, CrystalChip } from '../CrystalLink';

// Utils - Widget Trigger Detection
export {
  WIDGET_TYPES,
  detectWidgetTrigger,
  detectAllWidgetTriggers,
  shouldShowWidgetSuggestion,
  getWidgetIcon,
  getWidgetColor,
} from '../../utils/widgetTriggerDetector';

// Utils - Intent Detection
export {
  INTENT_TYPES,
  detectIntent,
  detectEmotion,
  detectLifeArea,
  getSuggestedTool,
  getCrystalRecommendations,
  getAutoFillData,
  isDivinationRequest,
  isGreeting,
  getResponseContext,
} from '../../utils/intentDetector';
