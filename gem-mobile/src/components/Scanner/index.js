/**
 * GEM Mobile - Scanner Components
 * Zone-related components for pattern visualization
 *
 * Phase 1A: Zone Object + Pattern Strength
 * Phase 1B: Quasimodo + FTR Detection
 * Phase 1C: Odds Enhancers + Freshness Tracking
 * Phase 2A: Flag Limit + Decision Point + Zone Hierarchy
 * Phase 2B: Stacked Zones + Hidden FTR + FTB Tracking
 * Phase 2C: Compression + Inducement + Look Right
 * Phase 3A: Confirmation Patterns (Engulfing, Pin Bar, etc.)
 * Phase 3B: Extended Zones + MPL + Pin Engulf Combo
 * Phase 3C: Smart Alerts + UI Polish + Final Integration
 */

// Phase 1A Components
export { default as ZoneBoundaryDisplay } from './ZoneBoundaryDisplay';
export { default as PatternStrengthBadge, StrengthStars, ContextBadge, WinRateBadge } from './PatternStrengthBadge';
export { default as ZoneConceptOnboarding, checkShouldShowZoneOnboarding, resetZoneOnboarding } from './ZoneConceptOnboarding';

// Phase 1B Components - Quasimodo + FTR
export { default as QMPatternCard } from './QMPatternCard';
export { default as FTRZoneCard } from './FTRZoneCard';
export { default as AdvancedPatternsOnboarding, shouldShowAdvancedPatternsOnboarding, resetAdvancedPatternsOnboarding } from './AdvancedPatternsOnboarding';

// Phase 1C Components - Odds Enhancers + Freshness Tracking
export { default as OddsEnhancerScorecard, OddsEnhancerCompact, OddsGradeBadge } from './OddsEnhancerScorecard';
export { default as FreshnessIndicator, FTBBadge, TestCountBadge, OrderAbsorptionBar, FreshnessCard } from './FreshnessIndicator';
export { default as GradeDisplay, GradeBadge, GradeProgressRing, PositionSizeIndicator, GradeLegend, TradeDecisionCard } from './GradeDisplay';
export { default as OddsEnhancersOnboarding, shouldShowOddsEnhancersOnboarding, resetOddsEnhancersOnboarding } from './OddsEnhancersOnboarding';

// Phase 2A Components - Flag Limit + Decision Point + Zone Hierarchy
export { default as ZoneHierarchyBadge, HierarchyInline, HierarchyLegend, HierarchyBar, HierarchyStatsCard } from './ZoneHierarchyBadge';
export { default as FlagLimitCard } from './FlagLimitCard';
export { default as DecisionPointCard } from './DecisionPointCard';
export { default as ZoneHierarchyOnboarding, shouldShowZoneHierarchyOnboarding, resetZoneHierarchyOnboarding } from './ZoneHierarchyOnboarding';

// Phase 2B Components - Stacked Zones + Hidden FTR + FTB Tracking
export { default as StackedZonesIndicator, StackedZonesList, StackedZonesSummary } from './StackedZonesIndicator';
export { default as HiddenFTRPanel, HiddenFTRBadge, NestedZonesList } from './HiddenFTRPanel';
export { default as FTBHighlight, FTBBadge as FTBStatusBadge, FreshnessTierDisplay, FTBOpportunityCard, FTBSummaryCard } from './FTBHighlight';
export { default as StackedZonesOnboarding, shouldShowStackedZonesOnboarding, resetStackedZonesOnboarding } from './StackedZonesOnboarding';

// Phase 2C Components - Compression + Inducement + Look Right
export { default as CompressionAlert, CompressionBadge, CompressionCard } from './CompressionAlert';
export { default as InducementWarning, InducementBadge, InducementCard, LiquidityPoolsDisplay } from './InducementWarning';
export { default as ZoneValidityBadge, ValidityBadge, ValidityCard, RealTimeValidityIndicator } from './ZoneValidityBadge';
export { default as CompressionOnboarding, shouldShowCompressionOnboarding, resetCompressionOnboarding } from './CompressionOnboarding';

// Phase 3A Components - Confirmation Patterns
export { default as ConfirmationBadge, ConfirmationIndicator, ConfirmationScoreBadge, PatternTypeLabel, ConfirmationStrengthBar } from './ConfirmationBadge';
export { default as CandlePatternCard, CandlePatternListItem, PatternSummary } from './CandlePatternCard';
export { default as ConfirmationOnboarding, shouldShowConfirmationOnboarding, resetConfirmationOnboarding } from './ConfirmationOnboarding';

// Phase 3B Components - Extended Zones + MPL + Pin Engulf Combo
export { default as ExtendedZoneVisual, ExtendedZoneBadge, ExtensionIndicator, ExtendedZoneCompare } from './ExtendedZoneVisual';
export { default as MPLIndicator, MPLBadge, MPLImprovementCard, MPLLevelsChart } from './MPLIndicator';
export { default as ExtendedZoneOnboarding, shouldShowExtendedZoneOnboarding, resetExtendedZoneOnboarding } from './ExtendedZoneOnboarding';

// Phase 3A Components - Entry Method Selection
export { default as EntryMethodSelector, EntryMethodBadge, EntryMethodInline } from './EntryMethodSelector';

// Phase 3C Components - Smart Alerts + UI Polish + Final Integration
export { default as AlertCard, AlertListItem, AlertTypeBadge, AlertPriorityIndicator } from './AlertCard';
export { default as AlertPanel, AlertBadge, AlertSummary } from './AlertPanel';
export { default as AlertOnboarding, shouldShowAlertOnboarding, resetAlertOnboarding } from './AlertOnboarding';
export { default as PriceAlertModal, QuickAlertButton, AlertCreatedToast } from './PriceAlertModal';

// Zone Visualization Components (NEW)
export { default as ZoneRectangle } from './ZoneRectangle';
export { default as MultiZoneOverlay } from './MultiZoneOverlay';
export { default as ZoneFeatureGuard, useZoneFeatureAccess, getRequiredTierForFeature } from './ZoneFeatureGuard';
export { default as ZonePreferencesModal } from './ZonePreferencesModal';

// Trading Leads Benefit Components
export { default as ProScannerBenefitModal } from './ProScannerBenefitModal';
