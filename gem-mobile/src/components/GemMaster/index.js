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
export { default as ChatbotPricingModal } from './ChatbotPricingModal';
export { default as QuickBuyModal } from './QuickBuyModal';
export { default as UpsellModal } from './UpsellModal';

// Binance-style FAQ Panel (Quick Select Topics)
export { default as FAQPanel } from './FAQPanel';
export {
  FAQ_TOPICS,
  FAQ_QUESTIONS,
  getTopicById,
  getQuestionsForTopic,
} from './FAQPanelData';

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
export { default as ProductRecommendation } from './ProductRecommendation';

// Product Card
export { default as ProductCard } from './ProductCard';

// Smart Widget Components (Phase 2-3 GemMaster)
export { default as SmartFormCard } from '../SmartFormCard';
export { default as AddWidgetSuggestion, AddWidgetButton, AddWidgetFAB } from '../AddWidgetSuggestion';

// NEW: Improved Smart Widget Components (with proper Supabase/Shopify integration)
export { default as SmartFormCardNew } from './SmartFormCardNew';
export { default as CrystalRecommendationNew } from './CrystalRecommendationNew';
export { default as ProductRecommendations, detectRecommendations } from './ProductRecommendations';

// Goal Setting Form (Phase 2-3: Interactive Form instead of text chat)
export { default as GoalSettingForm } from './GoalSettingForm';

// NEW: Inline Chat Form (replaces modal with in-chat form for better UX)
export { default as InlineChatForm } from './InlineChatForm';

// NEW: Template Inline Form (centralized templates system)
export { default as TemplateInlineForm } from './TemplateInlineForm';

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

// Tarot Spread Components (Phase 1 Enhancement)
export { default as CardFlip } from './CardFlip';
export { default as ShuffleAnimation } from './ShuffleAnimation';
export { default as SpreadLayout } from './SpreadLayout';
export { default as SpreadCard } from './SpreadCard';
export { default as SpreadInfoModal } from './SpreadInfoModal';

// Reading History Components (Phase 2 Enhancement)
export { default as ReadingHistoryItem } from './ReadingHistoryItem';
export { default as QuestionPrompts } from './QuestionPrompts';

// I-Ching Animation Components (Phase 2 Enhancement)
export { default as CoinCastAnimation } from './CoinCastAnimation';
export { default as HexagramBuilder } from './HexagramBuilder';

// Tarot Onboarding & Settings (Phase 2-3)
export { default as TarotOnboarding } from './TarotOnboarding';
export { default as DeckSelector } from './DeckSelector';
