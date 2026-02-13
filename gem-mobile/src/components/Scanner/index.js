/**
 * =====================================================
 * File: src/components/Scanner/index.js
 * Description: Scanner components exports
 * =====================================================
 */

// =====================================================
// EXISTING SCANNER COMPONENTS
// =====================================================

// Zone visualization
export { default as ZoneRectangle } from './ZoneRectangle';
export { default as MultiZoneOverlay } from './MultiZoneOverlay';
export { default as ZoneBoundaryDisplay } from './ZoneBoundaryDisplay';
export { default as ExtendedZoneVisual } from './ExtendedZoneVisual';
export { default as StackedZonesIndicator } from './StackedZonesIndicator';
export { default as ZoneHierarchyBadge } from './ZoneHierarchyBadge';
export { default as ZoneValidityBadge } from './ZoneValidityBadge';
export { default as ZoneFeatureGuard } from './ZoneFeatureGuard';
export { default as ZonePreferencesModal } from './ZonePreferencesModal';

// Pattern cards
export { default as FTRZoneCard } from './FTRZoneCard';
export { default as QMPatternCard } from './QMPatternCard';
export { default as CandlePatternCard } from './CandlePatternCard';
export { default as DecisionPointCard } from './DecisionPointCard';
export { default as FlagLimitCard } from './FlagLimitCard';

// Pattern indicators
export { default as PatternStrengthBadge } from './PatternStrengthBadge';
export { default as GradeDisplay } from './GradeDisplay';
export { default as FreshnessIndicator } from './FreshnessIndicator';
export { default as ConfirmationBadge } from './ConfirmationBadge';
export { default as MPLIndicator } from './MPLIndicator';
export { default as FTBHighlight } from './FTBHighlight';
export { default as InducementWarning } from './InducementWarning';
export { default as HiddenFTRPanel } from './HiddenFTRPanel';

// Alerts
export { default as AlertCard } from './AlertCard';
export { default as AlertPanel } from './AlertPanel';
export { default as PriceAlertModal } from './PriceAlertModal';
export { default as CompressionAlert } from './CompressionAlert';

// Odds enhancers
export { default as OddsEnhancerScorecard } from './OddsEnhancerScorecard';
export { default as EntryMethodSelector } from './EntryMethodSelector';

// Onboarding modals
export { default as ZoneConceptOnboarding } from './ZoneConceptOnboarding';
export { default as ZoneHierarchyOnboarding } from './ZoneHierarchyOnboarding';
export { default as ExtendedZoneOnboarding } from './ExtendedZoneOnboarding';
export { default as StackedZonesOnboarding } from './StackedZonesOnboarding';
export { default as ConfirmationOnboarding } from './ConfirmationOnboarding';
export { default as OddsEnhancersOnboarding } from './OddsEnhancersOnboarding';
export { default as AlertOnboarding } from './AlertOnboarding';
export { default as CompressionOnboarding } from './CompressionOnboarding';
export { default as AdvancedPatternsOnboarding } from './AdvancedPatternsOnboarding';

// Modals
export { default as ProScannerBenefitModal } from './ProScannerBenefitModal';

// =====================================================
// V2 SCANNER COMPONENTS (NEW)
// =====================================================

// Confidence display
export { default as ConfidenceBreakdown, ConfidenceCompact, ConfidenceBadge } from './ConfidenceBreakdown';

// Validation badges
export {
  default as ValidationBadges,
  ValidationBadgesCompact,
  VolumeBadge,
  HTFBadge,
  RetestBadge,
  PendingBadge,
  LockedBadge,
} from './ValidationBadges';
