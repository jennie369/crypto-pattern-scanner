/**
 * GEM Scanner - Info Tooltip Component
 * Inline contextual help tooltip with modal overlay
 * Different from Tooltip.js (which is a tour modal)
 * Theme-aware with i18n support
 */

import React, { memo, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { HelpCircle, AlertTriangle, Lightbulb, Info, X } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TOOLTIP_ICONS = {
  help: HelpCircle,
  warning: AlertTriangle,
  tip: Lightbulb,
  info: Info,
};

const InfoTooltip = ({
  // Content
  title = '',
  content = '',
  warning = null,  // Warning text
  tip = null,      // Pro tip text
  // Appearance
  type = 'help',  // 'help', 'warning', 'tip', 'info'
  iconSize = 14,
  iconColor = null,
  // Position
  position = 'auto',  // 'top', 'bottom', 'left', 'right', 'auto'
  // Children
  children = null,  // Custom trigger element
  // Callbacks
  onOpen = null,
  onClose = null,
  // Disabled
  disabled = false,
}) => {
  const { colors, settings, SPACING } = useSettings();
  const [visible, setVisible] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState(null);
  const triggerRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Get icon based on type - use theme colors
  const IconComponent = TOOLTIP_ICONS[type] || HelpCircle;
  const defaultIconColor = type === 'warning' ? (colors.warning || colors.warningText)
    : type === 'tip' ? colors.gold
    : type === 'info' ? (colors.info || colors.infoText)
    : colors.textMuted;

  // Open tooltip
  const handleOpen = useCallback(() => {
    if (disabled) return;

    // Measure trigger position
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        setTriggerLayout({ x, y, width, height });
      });
    }

    setVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    onOpen?.();
  }, [disabled, fadeAnim, onOpen]);

  // Close tooltip
  const handleClose = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onClose?.();
    });
  }, [fadeAnim, onClose]);

  // Calculate tooltip position
  const getTooltipPosition = useCallback(() => {
    if (!triggerLayout) {
      return { top: SCREEN_HEIGHT / 2 - 100, left: 20, right: 20 };
    }

    const { x, y, width, height } = triggerLayout;
    const tooltipHeight = 200;  // Approximate height

    let top;

    // Auto position calculation
    const spaceAbove = y;
    const spaceBelow = SCREEN_HEIGHT - (y + height);

    if (position === 'auto') {
      // Prefer bottom, but use top if not enough space
      if (spaceBelow >= tooltipHeight || spaceBelow > spaceAbove) {
        top = y + height + 10;
      } else {
        top = y - tooltipHeight - 10;
      }
    } else if (position === 'top') {
      top = y - tooltipHeight - 10;
    } else {
      top = y + height + 10;
    }

    // Ensure tooltip stays within screen bounds
    top = Math.max(20, Math.min(top, SCREEN_HEIGHT - tooltipHeight - 20));

    return { top, left: 20, right: 20 };
  }, [triggerLayout, position]);

  const tooltipStyle = getTooltipPosition();

  // Theme-aware styles
  const styles = useMemo(() => StyleSheet.create({
    trigger: {
      padding: 4,
    },
    overlay: {
      flex: 1,
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)',
    },
    tooltipContainer: {
      position: 'absolute',
      backgroundColor: settings.theme === 'light' ? colors.glassBg : 'rgba(15, 16, 48, 0.98)',
      borderRadius: 12,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: settings.theme === 'light' ? colors.border : 'rgba(106, 91, 255, 0.3)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: settings.theme === 'light' ? 0.15 : 0.3,
      shadowRadius: 8,
      elevation: 8,
      maxHeight: SCREEN_HEIGHT * 0.6,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.sm,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      flex: 1,
    },
    title: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      flex: 1,
    },
    closeButton: {
      padding: 4,
    },
    content: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
    },
    warningContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.sm,
      backgroundColor: settings.theme === 'light' ? colors.warning : 'rgba(255, 184, 0, 0.1)',
      padding: SPACING.sm,
      borderRadius: 8,
      marginTop: SPACING.xs,
      borderWidth: 1,
      borderColor: settings.theme === 'light' ? 'rgba(133, 100, 4, 0.3)' : 'rgba(255, 184, 0, 0.2)',
    },
    warningText: {
      flex: 1,
      fontSize: 12,
      color: colors.warning || colors.warningText,
      lineHeight: 18,
    },
    tipContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.sm,
      backgroundColor: 'rgba(255, 189, 89, 0.1)',
      padding: SPACING.sm,
      borderRadius: 8,
      marginTop: SPACING.xs,
      borderWidth: 1,
      borderColor: 'rgba(255, 189, 89, 0.2)',
    },
    tipText: {
      flex: 1,
      fontSize: 12,
      color: colors.gold,
      lineHeight: 18,
      fontStyle: 'italic',
    },
    wrapperContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
  }), [colors, settings.theme, SPACING]);

  return (
    <>
      {/* Trigger */}
      <TouchableOpacity
        ref={triggerRef}
        onPress={handleOpen}
        style={styles.trigger}
        activeOpacity={0.7}
        disabled={disabled}
      >
        {children || (
          <IconComponent
            size={iconSize}
            color={iconColor || defaultIconColor}
          />
        )}
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <Pressable
          style={styles.overlay}
          onPress={handleClose}
        >
          <Animated.View
            style={[
              styles.tooltipContainer,
              {
                top: tooltipStyle.top,
                left: tooltipStyle.left,
                right: tooltipStyle.right,
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                }],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <IconComponent
                    size={18}
                    color={iconColor || defaultIconColor}
                  />
                  {title && (
                    <Text style={styles.title}>{title}</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                >
                  <X size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Content */}
              {content && (
                <Text style={styles.content}>{content}</Text>
              )}

              {/* Warning */}
              {warning && (
                <View style={styles.warningContainer}>
                  <AlertTriangle size={14} color={colors.warning || colors.warningText} />
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              )}

              {/* Tip */}
              {tip && (
                <View style={styles.tipContainer}>
                  <Lightbulb size={14} color={colors.gold} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

// Preset tooltip wrapper for common cases
export const TooltipWrapper = memo(({
  tooltipConfig,
  children,
  ...props
}) => {
  const { SPACING } = useSettings();

  // tooltipConfig should come from tooltipsConfig.js
  if (!tooltipConfig) {
    return children;
  }

  const wrapperStyles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
  }), []);

  return (
    <View style={wrapperStyles.container}>
      {children}
      <InfoTooltip
        title={tooltipConfig.title}
        content={tooltipConfig.content}
        warning={tooltipConfig.warning}
        tip={tooltipConfig.tip}
        type={tooltipConfig.type || 'help'}
        {...props}
      />
    </View>
  );
});

export default memo(InfoTooltip);
