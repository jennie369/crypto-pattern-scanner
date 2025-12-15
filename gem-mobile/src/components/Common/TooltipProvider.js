/**
 * Gemral - Tooltip Provider v2
 *
 * Context provider for managing tooltips and feature discovery
 * Supports:
 * - Individual tooltips per screen
 * - Feature discovery prompts
 * - Guided tours
 * - Usage-based triggers
 *
 * Uses tooltipConfig.js for configuration
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import tooltipService from '../../services/tooltipService';
import { TOOLTIPS, TOOLTIP_SEQUENCES } from '../../config/tooltipConfig';
import Tooltip from './Tooltip';
import FeatureDiscoveryModal from './FeatureDiscoveryModal';

// Create context
const TooltipContext = createContext(null);

/**
 * Hook to use tooltip context
 */
export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    // Return no-op functions when used outside provider
    return {
      initialized: false,
      showTooltip: () => {},
      showTooltipForScreen: () => {},
      checkAndShowTooltip: () => false,
      dismissTooltip: () => {},
      getTooltipsForScreen: () => [],
      showDiscovery: () => {},
      dismissDiscovery: () => {},
      startTour: () => {},
      shouldShowTutorial: () => false,
    };
  }
  return context;
};

/**
 * Tooltip Provider Component
 */
const TooltipProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [currentTooltip, setCurrentTooltip] = useState(null);
  const [tooltipQueue, setTooltipQueue] = useState([]);
  const [currentDiscovery, setCurrentDiscovery] = useState(null);
  const [activeTour, setActiveTour] = useState(null);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  // Initialize tooltip service
  useEffect(() => {
    const init = async () => {
      try {
        await tooltipService.initialize();
        setInitialized(true);
      } catch (error) {
        console.error('[TooltipProvider] Init error:', error);
        setInitialized(true); // Continue anyway
      }
    };
    init();
  }, []);

  /**
   * Get tooltip config by key
   */
  const getTooltipConfig = useCallback((tooltipKey) => {
    if (!tooltipKey) return null;

    // Search in all categories
    for (const category of Object.keys(TOOLTIPS || {})) {
      const categoryTooltips = TOOLTIPS?.[category] || [];
      const tooltip = categoryTooltips.find((t) => t?.key === tooltipKey);
      if (tooltip) return tooltip;
    }
    return null;
  }, []);

  /**
   * Show a tooltip by key
   */
  const showTooltip = useCallback(
    async (tooltipKey) => {
      if (!initialized || !tooltipKey) return;

      // Check if already viewed
      const shouldShow = await tooltipService.shouldShowTooltip(tooltipKey);
      if (!shouldShow) return;

      const config = getTooltipConfig(tooltipKey);
      if (config) {
        setCurrentTooltip({
          ...config,
          feature: tooltipKey, // For backward compatibility
        });
      }
    },
    [initialized, getTooltipConfig]
  );

  /**
   * Show tooltip for current screen (auto-detect first tooltip)
   */
  const showTooltipForScreen = useCallback(
    async (screenName, options = {}) => {
      if (!initialized || !screenName) return;

      const tooltips = tooltipService.getTooltipsForScreen(screenName, options);
      if (!tooltips || tooltips.length === 0) return;

      // Get first unviewed tooltip
      for (const tooltip of tooltips) {
        const shouldShow = await tooltipService.shouldShowTooltip(tooltip?.key);
        if (shouldShow) {
          setCurrentTooltip({
            ...tooltip,
            feature: tooltip?.key,
          });
          break;
        }
      }
    },
    [initialized]
  );

  /**
   * Get all tooltips for a screen
   */
  const getTooltipsForScreen = useCallback(
    (screenName, options = {}) => {
      if (!initialized) return [];
      return tooltipService.getTooltipsForScreen(screenName, options) || [];
    },
    [initialized]
  );

  /**
   * Check and show tooltip if applicable
   */
  const checkAndShowTooltip = useCallback(
    async (tooltipKey) => {
      if (!initialized || !tooltipKey) return false;

      const shouldShow = await tooltipService.shouldShowTooltip(tooltipKey);
      if (shouldShow) {
        await showTooltip(tooltipKey);
        return true;
      }
      return false;
    },
    [initialized, showTooltip]
  );

  /**
   * Queue multiple tooltips (show one after another)
   */
  const queueTooltips = useCallback(
    async (tooltipKeys) => {
      if (!initialized || !tooltipKeys?.length) return;

      const validTooltips = [];
      for (const key of tooltipKeys) {
        const shouldShow = await tooltipService.shouldShowTooltip(key);
        if (shouldShow) {
          const config = getTooltipConfig(key);
          if (config) {
            validTooltips.push({ ...config, feature: key });
          }
        }
      }

      if (validTooltips.length > 0) {
        setTooltipQueue(validTooltips.slice(1));
        setCurrentTooltip(validTooltips[0]);
      }
    },
    [initialized, getTooltipConfig]
  );

  /**
   * Dismiss current tooltip
   */
  const dismissTooltip = useCallback(async () => {
    if (currentTooltip) {
      await tooltipService.markTooltipViewed(
        currentTooltip?.key || currentTooltip?.feature
      );
    }

    // Show next in queue if any
    if (tooltipQueue.length > 0) {
      const [next, ...rest] = tooltipQueue;
      setTooltipQueue(rest);
      setTimeout(() => setCurrentTooltip(next), 300);
    } else {
      setCurrentTooltip(null);
    }

    // Continue tour if active
    if (activeTour) {
      advanceTour();
    }
  }, [currentTooltip, tooltipQueue, activeTour]);

  /**
   * Skip current tooltip (mark as skipped)
   */
  const skipTooltip = useCallback(async () => {
    if (currentTooltip) {
      await tooltipService.markTooltipViewed(
        currentTooltip?.key || currentTooltip?.feature
      );
    }

    // Show next in queue if any
    if (tooltipQueue.length > 0) {
      const [next, ...rest] = tooltipQueue;
      setTooltipQueue(rest);
      setTimeout(() => setCurrentTooltip(next), 300);
    } else {
      setCurrentTooltip(null);
    }
  }, [currentTooltip, tooltipQueue]);

  // ========== FEATURE DISCOVERY ==========

  /**
   * Show a feature discovery prompt
   */
  const showDiscovery = useCallback(
    async (discoveryConfig) => {
      if (!initialized || !discoveryConfig) return;

      // Check if already dismissed
      const shouldShow = await tooltipService.shouldShowDiscovery(
        discoveryConfig?.key || discoveryConfig?.id
      );
      if (!shouldShow) return;

      setCurrentDiscovery(discoveryConfig);
    },
    [initialized]
  );

  /**
   * Dismiss feature discovery
   */
  const dismissDiscovery = useCallback(
    async (discoveryKey) => {
      if (discoveryKey || currentDiscovery) {
        await tooltipService.markDiscoveryDismissed(
          discoveryKey || currentDiscovery?.key || currentDiscovery?.id
        );
      }
      setCurrentDiscovery(null);
    },
    [currentDiscovery]
  );

  /**
   * Handle discovery action
   */
  const handleDiscoveryAction = useCallback(
    async (discovery) => {
      await dismissDiscovery(discovery?.key || discovery?.id);

      // Navigate based on action if needed
      if (discovery?.onAction) {
        discovery.onAction();
      }
    },
    [dismissDiscovery]
  );

  // ========== GUIDED TOURS ==========

  /**
   * Start a guided tour
   */
  const startTour = useCallback(
    async (tourName) => {
      if (!initialized || !tourName) return;

      const tour = TOOLTIP_SEQUENCES?.[tourName];
      if (!tour?.steps || tour.steps.length === 0) return;

      // Check tour progress
      const progress = await tooltipService.getTourProgress(tourName);
      const startIndex = progress?.currentStep || 0;

      // If tour completed, don't restart
      if (progress?.completed) return;

      setActiveTour({ name: tourName, ...tour });
      setTourStepIndex(startIndex);

      // Show first tooltip
      const firstStep = tour.steps[startIndex];
      if (firstStep) {
        const config = getTooltipConfig(firstStep);
        if (config) {
          setCurrentTooltip({
            ...config,
            feature: firstStep,
            tourStep: startIndex + 1,
            totalSteps: tour.steps.length,
          });
        }
      }
    },
    [initialized, getTooltipConfig]
  );

  /**
   * Advance to next tour step
   */
  const advanceTour = useCallback(async () => {
    if (!activeTour) return;

    const nextIndex = tourStepIndex + 1;

    // Tour completed
    if (nextIndex >= (activeTour?.steps?.length || 0)) {
      await tooltipService.advanceTourStep(activeTour.name);
      setActiveTour(null);
      setTourStepIndex(0);
      return;
    }

    // Show next step
    await tooltipService.advanceTourStep(activeTour.name);
    setTourStepIndex(nextIndex);

    const nextStep = activeTour?.steps?.[nextIndex];
    if (nextStep) {
      const config = getTooltipConfig(nextStep);
      if (config) {
        setTimeout(() => {
          setCurrentTooltip({
            ...config,
            feature: nextStep,
            tourStep: nextIndex + 1,
            totalSteps: activeTour?.steps?.length || 0,
          });
        }, 400);
      }
    }
  }, [activeTour, tourStepIndex, getTooltipConfig]);

  /**
   * Cancel current tour
   */
  const cancelTour = useCallback(() => {
    setActiveTour(null);
    setTourStepIndex(0);
    setCurrentTooltip(null);
  }, []);

  // ========== UTILITY ==========

  /**
   * Check if tooltip should be shown
   */
  const shouldShowTutorial = useCallback(
    async (tooltipKey) => {
      if (!initialized) return false;
      return tooltipService.shouldShowTooltip(tooltipKey);
    },
    [initialized]
  );

  /**
   * Sync tutorials for logged in user
   */
  const syncTutorials = useCallback(
    async (userId) => {
      if (!initialized) return;
      await tooltipService.syncFromDatabase(userId);
    },
    [initialized]
  );

  /**
   * Reset all tutorials (for testing)
   */
  const resetTutorials = useCallback(async () => {
    await tooltipService.resetAllTutorials();
    setCurrentTooltip(null);
    setTooltipQueue([]);
    setCurrentDiscovery(null);
    setActiveTour(null);
    setTourStepIndex(0);
  }, []);

  // Context value
  const value = useMemo(
    () => ({
      initialized,
      currentTooltip,
      showTooltip,
      showTooltipForScreen,
      getTooltipsForScreen,
      checkAndShowTooltip,
      queueTooltips,
      dismissTooltip,
      skipTooltip,
      shouldShowTutorial,
      syncTutorials,
      resetTutorials,
      // Feature Discovery
      currentDiscovery,
      showDiscovery,
      dismissDiscovery,
      // Tours
      activeTour,
      startTour,
      cancelTour,
    }),
    [
      initialized,
      currentTooltip,
      showTooltip,
      showTooltipForScreen,
      getTooltipsForScreen,
      checkAndShowTooltip,
      queueTooltips,
      dismissTooltip,
      skipTooltip,
      shouldShowTutorial,
      syncTutorials,
      resetTutorials,
      currentDiscovery,
      showDiscovery,
      dismissDiscovery,
      activeTour,
      startTour,
      cancelTour,
    ]
  );

  return (
    <TooltipContext.Provider value={value}>
      {children}

      {/* Global Tooltip Modal */}
      {currentTooltip && (
        <Tooltip
          visible={!!currentTooltip}
          title={currentTooltip?.title || ''}
          description={currentTooltip?.content || currentTooltip?.description || ''}
          icon={currentTooltip?.icon || 'HelpCircle'}
          ctaText={
            activeTour
              ? tourStepIndex < (activeTour?.steps?.length || 0) - 1
                ? 'Tiếp theo'
                : 'Hoàn thành'
              : currentTooltip?.ctaText || 'Đã hiểu!'
          }
          position={currentTooltip?.position || 'bottom'}
          onDismiss={dismissTooltip}
          onCTA={dismissTooltip}
          showSkip={tooltipQueue.length > 0 || !!activeTour}
          onSkip={activeTour ? cancelTour : skipTooltip}
          tourStep={currentTooltip?.tourStep}
          totalSteps={currentTooltip?.totalSteps}
        />
      )}

      {/* Feature Discovery Modal */}
      <FeatureDiscoveryModal
        visible={!!currentDiscovery}
        discovery={currentDiscovery}
        onDismiss={() => dismissDiscovery()}
        onAction={handleDiscoveryAction}
      />
    </TooltipContext.Provider>
  );
};

export default TooltipProvider;
