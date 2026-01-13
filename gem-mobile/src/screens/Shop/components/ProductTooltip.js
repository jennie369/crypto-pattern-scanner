/**
 * Gemral - Product Tooltip Component
 * First-time user guidance tooltips for digital products section
 */

import React, { useState, useEffect, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Info, X, ChevronRight, HelpCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { TOOLTIP_STORAGE_KEY, TOOLTIP_CONTENT } from '../../../utils/digitalProductsConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════
// TOOLTIP HOOK
// ═══════════════════════════════════════════════════════════

export const useTooltips = () => {
  const [viewedTooltips, setViewedTooltips] = useState(new Set());
  const [activeTooltip, setActiveTooltip] = useState(null);

  useEffect(() => {
    loadViewedTooltips();
  }, []);

  const loadViewedTooltips = async () => {
    try {
      const stored = await AsyncStorage.getItem(TOOLTIP_STORAGE_KEY);
      if (stored) {
        setViewedTooltips(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('[Tooltip] Load error:', error);
    }
  };

  const markTooltipViewed = useCallback(async (tooltipId) => {
    const newSet = new Set(viewedTooltips);
    newSet.add(tooltipId);
    setViewedTooltips(newSet);

    try {
      await AsyncStorage.setItem(TOOLTIP_STORAGE_KEY, JSON.stringify([...newSet]));
    } catch (error) {
      console.error('[Tooltip] Save error:', error);
    }
  }, [viewedTooltips]);

  const shouldShowTooltip = useCallback((tooltipId) => {
    const tooltip = TOOLTIP_CONTENT[tooltipId];
    if (!tooltip) return false;
    if (tooltip.showOnce && viewedTooltips.has(tooltipId)) return false;
    return true;
  }, [viewedTooltips]);

  const showTooltip = useCallback((tooltipId) => {
    if (shouldShowTooltip(tooltipId)) {
      setActiveTooltip(TOOLTIP_CONTENT[tooltipId]);
    }
  }, [shouldShowTooltip]);

  const hideTooltip = useCallback(() => {
    if (activeTooltip) {
      markTooltipViewed(activeTooltip.id);
    }
    setActiveTooltip(null);
  }, [activeTooltip, markTooltipViewed]);

  const resetAllTooltips = useCallback(async () => {
    setViewedTooltips(new Set());
    await AsyncStorage.removeItem(TOOLTIP_STORAGE_KEY);
  }, []);

  return {
    activeTooltip,
    showTooltip,
    hideTooltip,
    shouldShowTooltip,
    markTooltipViewed,
    resetAllTooltips,
  };
};

// ═══════════════════════════════════════════════════════════
// TOOLTIP TRIGGER (Help icon indicator)
// ═══════════════════════════════════════════════════════════

export const TooltipTrigger = memo(({ tooltipId, children, style, onPress }) => {
  const [showIcon, setShowIcon] = useState(false);

  useEffect(() => {
    const checkNewUser = async () => {
      try {
        const viewed = await AsyncStorage.getItem(TOOLTIP_STORAGE_KEY);
        if (!viewed || !JSON.parse(viewed).includes(tooltipId)) {
          setShowIcon(true);
          // Auto-hide after 5 seconds
          const timer = setTimeout(() => setShowIcon(false), 5000);
          return () => clearTimeout(timer);
        }
      } catch (error) {
        // Ignore errors
      }
    };
    checkNewUser();
  }, [tooltipId]);

  if (!showIcon) return children;

  return (
    <View style={[styles.triggerContainer, style]}>
      {children}
      <TouchableOpacity
        style={styles.helpIconContainer}
        onPress={() => onPress?.(tooltipId)}
        activeOpacity={0.7}
      >
        <HelpCircle size={14} color={COLORS.gold} />
      </TouchableOpacity>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════
// MAIN TOOLTIP MODAL
// ═══════════════════════════════════════════════════════════

const ProductTooltip = ({ tooltip, onClose }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (tooltip) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [tooltip, fadeAnim]);

  if (!tooltip) return null;

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => onClose?.());
  };

  return (
    <Modal
      transparent
      visible={!!tooltip}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <Animated.View
          style={[
            styles.tooltipCard,
            { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
          ]}
        >
          {/* Header */}
          <View style={styles.tooltipHeader}>
            <View style={styles.tooltipIconContainer}>
              <Info size={18} color={COLORS.gold} />
            </View>
            <Text style={styles.tooltipTitle}>{tooltip.title}</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <Text style={styles.tooltipContent}>{tooltip.content}</Text>

          {/* Footer */}
          <TouchableOpacity
            style={styles.gotItButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.gotItText}>Đã hiểu</Text>
            <ChevronRight size={16} color={COLORS.gold} />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // Trigger
  triggerContainer: {
    position: 'relative',
  },
  helpIconContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.4)',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl,
  },

  // Card
  tooltipCard: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 340,
    backgroundColor: GLASS.backgroundColor,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.xxl,
    borderWidth: GLASS.borderWidth,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },

  // Header
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tooltipIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  tooltipTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.xs,
  },

  // Content
  tooltipContent: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    lineHeight: 22,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },

  // Footer
  gotItButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },
  gotItText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginRight: SPACING.xs,
  },
});

export default memo(ProductTooltip);
