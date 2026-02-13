/**
 * Tooltip.js
 * Tooltip component for VisionBoard
 * Created: January 28, 2026
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Tooltip Component
 */
const Tooltip = ({
  children,
  content,
  title,
  position = 'top', // 'top', 'bottom', 'left', 'right'
  trigger = 'press', // 'press', 'longPress'
  width = 200,
  showArrow = true,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState('top');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const targetRef = useRef(null);

  // Show tooltip
  const showTooltip = () => {
    if (disabled) return;

    targetRef.current?.measure((x, y, targetWidth, targetHeight, pageX, pageY) => {
      calculatePosition(pageX, pageY, targetWidth, targetHeight);
      setVisible(true);
    });
  };

  // Hide tooltip
  const hideTooltip = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  // Calculate tooltip position
  const calculatePosition = (targetX, targetY, targetWidth, targetHeight) => {
    const tooltipHeight = 80; // Estimated
    const margin = 8;
    const arrowSize = 8;

    let top = 0;
    let left = 0;
    let finalPosition = position;

    switch (position) {
      case 'top':
        top = targetY - tooltipHeight - arrowSize - margin;
        left = targetX + targetWidth / 2 - width / 2;
        if (top < 50) {
          finalPosition = 'bottom';
          top = targetY + targetHeight + arrowSize + margin;
        }
        break;

      case 'bottom':
        top = targetY + targetHeight + arrowSize + margin;
        left = targetX + targetWidth / 2 - width / 2;
        if (top + tooltipHeight > SCREEN_HEIGHT - 50) {
          finalPosition = 'top';
          top = targetY - tooltipHeight - arrowSize - margin;
        }
        break;

      case 'left':
        top = targetY + targetHeight / 2 - tooltipHeight / 2;
        left = targetX - width - arrowSize - margin;
        if (left < margin) {
          finalPosition = 'right';
          left = targetX + targetWidth + arrowSize + margin;
        }
        break;

      case 'right':
        top = targetY + targetHeight / 2 - tooltipHeight / 2;
        left = targetX + targetWidth + arrowSize + margin;
        if (left + width > SCREEN_WIDTH - margin) {
          finalPosition = 'left';
          left = targetX - width - arrowSize - margin;
        }
        break;
    }

    // Keep within screen bounds
    left = Math.max(margin, Math.min(left, SCREEN_WIDTH - width - margin));
    top = Math.max(50, Math.min(top, SCREEN_HEIGHT - tooltipHeight - 50));

    setTooltipPosition({ top, left });
    setArrowPosition(finalPosition);
  };

  // Animate on show
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  // Get arrow style based on position
  const getArrowStyle = () => {
    switch (arrowPosition) {
      case 'top':
        return styles.arrowBottom;
      case 'bottom':
        return styles.arrowTop;
      case 'left':
        return styles.arrowRight;
      case 'right':
        return styles.arrowLeft;
      default:
        return styles.arrowBottom;
    }
  };

  const touchableProps = {
    onPress: trigger === 'press' ? showTooltip : undefined,
    onLongPress: trigger === 'longPress' ? showTooltip : undefined,
  };

  return (
    <>
      <TouchableOpacity
        ref={targetRef}
        activeOpacity={0.8}
        {...touchableProps}
      >
        {children}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={hideTooltip}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={hideTooltip}
        >
          <Animated.View
            style={[
              styles.tooltip,
              { width, top: tooltipPosition.top, left: tooltipPosition.left },
              { opacity: fadeAnim },
            ]}
          >
            {showArrow && <View style={[styles.arrow, getArrowStyle()]} />}

            {title && <Text style={styles.title}>{title}</Text>}
            {typeof content === 'string' ? (
              <Text style={styles.content}>{content}</Text>
            ) : (
              content
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

/**
 * Info tooltip with icon
 */
export const InfoTooltip = ({ content, title, size = 16, color }) => {
  const { Ionicons } = require('@expo/vector-icons');

  return (
    <Tooltip content={content} title={title}>
      <View style={styles.infoIcon}>
        <Ionicons
          name="information-circle-outline"
          size={size}
          color={color || COLORS.textMuted}
        />
      </View>
    </Tooltip>
  );
};

/**
 * Help tooltip for features
 */
export const HelpTooltip = ({
  feature,
  description,
  steps,
}) => {
  return (
    <Tooltip
      title={feature}
      width={260}
      content={
        <View>
          <Text style={styles.helpDescription}>{description}</Text>
          {steps && steps.length > 0 && (
            <View style={styles.helpSteps}>
              {steps.map((step, index) => (
                <View key={index} style={styles.helpStep}>
                  <Text style={styles.helpStepNumber}>{index + 1}</Text>
                  <Text style={styles.helpStepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      }
    >
      <View style={styles.helpButton}>
        <Text style={styles.helpButtonText}>?</Text>
      </View>
    </Tooltip>
  );
};

/**
 * Controlled tooltip (programmatically shown)
 */
export const ControlledTooltip = ({
  visible,
  onClose,
  content,
  title,
  position = { top: 0, left: 0 },
  width = 200,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.tooltip,
            { width, top: position.top, left: position.left },
            { opacity: fadeAnim },
          ]}
        >
          {title && <Text style={styles.title}>{title}</Text>}
          {typeof content === 'string' ? (
            <Text style={styles.content}>{content}</Text>
          ) : (
            content
          )}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

/**
 * Onboarding tooltip with pointer
 */
export const OnboardingTooltip = ({
  visible,
  onClose,
  onNext,
  title,
  content,
  step,
  totalSteps,
  targetPosition,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { Ionicons } = require('@expo/vector-icons');

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  const tooltipTop = targetPosition?.top > SCREEN_HEIGHT / 2
    ? targetPosition.top - 160
    : (targetPosition?.top || 0) + (targetPosition?.height || 0) + 16;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.onboardingOverlay}>
        {/* Highlight area */}
        {targetPosition && (
          <View
            style={[
              styles.highlight,
              {
                top: targetPosition.top - 8,
                left: targetPosition.left - 8,
                width: targetPosition.width + 16,
                height: targetPosition.height + 16,
              },
            ]}
          />
        )}

        {/* Tooltip */}
        <Animated.View
          style={[
            styles.onboardingTooltip,
            { top: tooltipTop, opacity: fadeAnim },
          ]}
        >
          {/* Step indicator */}
          {totalSteps > 1 && (
            <View style={styles.stepIndicator}>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.stepDot,
                    i === step && styles.stepDotActive,
                  ]}
                />
              ))}
            </View>
          )}

          <Text style={styles.onboardingTitle}>{title}</Text>
          <Text style={styles.onboardingContent}>{content}</Text>

          <View style={styles.onboardingActions}>
            <TouchableOpacity onPress={onClose} style={styles.skipButton}>
              <Text style={styles.skipText}>Bỏ qua</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onNext} style={styles.nextButton}>
              <Text style={styles.nextText}>
                {step === totalSteps - 1 ? 'Hoàn tất' : 'Tiếp theo'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark backdrop for better tooltip visibility
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#1A1D2E', // Solid dark background for readability
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)', // Purple border
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
  arrowTop: {
    top: -8,
    left: '50%',
    marginLeft: -8,
    borderWidth: 8,
    borderTopWidth: 0,
    borderColor: 'transparent',
    borderBottomColor: '#1A1D2E', // Match solid background
  },
  arrowBottom: {
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    borderWidth: 8,
    borderBottomWidth: 0,
    borderColor: 'transparent',
    borderTopColor: '#1A1D2E', // Match solid background
  },
  arrowLeft: {
    left: -8,
    top: '50%',
    marginTop: -8,
    borderWidth: 8,
    borderLeftWidth: 0,
    borderColor: 'transparent',
    borderRightColor: '#1A1D2E', // Match solid background
  },
  arrowRight: {
    right: -8,
    top: '50%',
    marginTop: -8,
    borderWidth: 8,
    borderRightWidth: 0,
    borderColor: 'transparent',
    borderLeftColor: '#1A1D2E', // Match solid background
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF', // Pure white for title
    marginBottom: SPACING.sm,
  },
  content: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.85)', // High contrast text
    lineHeight: TYPOGRAPHY.fontSize.sm * 1.6,
  },

  // Info tooltip
  infoIcon: {
    padding: 4,
  },

  // Help tooltip
  helpButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
  },
  helpDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  helpSteps: {
    gap: SPACING.xs,
  },
  helpStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  helpStepNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
    lineHeight: 18,
    marginRight: SPACING.xs,
  },
  helpStepText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },

  // Onboarding
  onboardingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  highlight: {
    position: 'absolute',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  onboardingTooltip: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    gap: 6,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    width: 18,
  },
  onboardingTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  onboardingContent: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.fontSize.md * 1.5,
    marginBottom: SPACING.lg,
  },
  onboardingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: SPACING.sm,
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  nextText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.white,
  },
});

export default Tooltip;
