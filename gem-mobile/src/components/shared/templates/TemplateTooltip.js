/**
 * TemplateTooltip.js
 * Compact tooltip matching Vision Board style
 *
 * Created: 2026-02-02
 * Updated: 2026-02-03 - Redesigned to match Vision Board tooltip style
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Animated,
} from 'react-native';
import { Info } from 'lucide-react-native';
import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
} from '../../../theme/cosmicTokens';

/**
 * TemplateTooltip Component - Compact Vision Board style
 */
const TemplateTooltip = ({
  title,
  content,
  size = 14,
  color,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleOpen = () => {
    if (disabled || !content) return;
    setVisible(true);
  };

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        onPress={handleOpen}
        disabled={disabled || !content}
        style={styles.trigger}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Info size={size} color={color || COSMIC_COLORS.text.hint} />
      </TouchableOpacity>

      {/* Tooltip Modal - Vision Board style */}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            <Animated.View
              style={[
                styles.tooltip,
                { opacity: fadeAnim },
              ]}
            >
              {title && <Text style={styles.tooltipTitle}>{title}</Text>}
              <Text style={styles.tooltipContent}>{content}</Text>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

/**
 * Field Label with Tooltip - Compact version
 */
export const LabelWithTooltip = ({
  label,
  required,
  tooltip,
}) => (
  <View style={styles.labelRow}>
    <Text style={styles.label}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
    {tooltip && <TemplateTooltip content={tooltip} />}
  </View>
);

const styles = StyleSheet.create({
  trigger: {
    padding: 2,
  },

  // Overlay - semi-transparent
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: COSMIC_SPACING.xl,
  },

  // Tooltip - Vision Board style (dark, compact, rounded)
  tooltip: {
    maxWidth: 280,
    backgroundColor: COSMIC_COLORS.bgNebula,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipTitle: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.text.primary,
    marginBottom: COSMIC_SPACING.xs,
  },
  tooltipContent: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.text.secondary,
    lineHeight: COSMIC_TYPOGRAPHY.fontSize.sm * 1.4,
  },

  // Label with Tooltip
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.xxs,
    marginBottom: COSMIC_SPACING.xs,
  },
  label: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
    color: COSMIC_COLORS.text.secondary,
  },
  required: {
    color: COSMIC_COLORS.functional.error,
  },
});

export default TemplateTooltip;
