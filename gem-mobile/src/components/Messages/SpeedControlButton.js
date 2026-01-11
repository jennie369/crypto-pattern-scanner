/**
 * SpeedControlButton Component
 * Dropdown button for selecting voice playback speed
 */

import React, { useState, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * SpeedControlButton - Button to select voice playback speed
 *
 * @param {Object} props
 * @param {number} props.currentSpeed - Current playback speed
 * @param {Array} props.options - Array of speed options [{value, label}]
 * @param {Function} props.onSpeedChange - Callback when speed changes
 */
const SpeedControlButton = memo(({
  currentSpeed = 1,
  options = [],
  onSpeedChange,
}) => {
  // ========== STATE ==========
  const [modalVisible, setModalVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // ========== REFS ==========
  const buttonRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // ========== HANDLERS ==========
  const handleOpenModal = useCallback(() => {
    // Measure button position for popup placement
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setButtonLayout({ x, y, width, height });
    });

    setModalVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleCloseModal = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  }, [scaleAnim]);

  const handleSelectSpeed = useCallback((speedValue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSpeedChange?.(speedValue);
    handleCloseModal();
  }, [onSpeedChange, handleCloseModal]);

  // ========== RENDER ==========
  const currentLabel = options.find((o) => o.value === currentSpeed)?.label || `${currentSpeed}x`;

  return (
    <>
      {/* Speed Button */}
      <TouchableOpacity
        ref={buttonRef}
        style={styles.button}
        onPress={handleOpenModal}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>{currentLabel}</Text>
        <ChevronDown size={14} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {/* Speed Options Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <Animated.View
            style={[
              styles.optionsContainer,
              {
                // Position above the button
                top: Math.max(40, buttonLayout.y - (options.length * 44) - 16),
                right: SCREEN_WIDTH - buttonLayout.x - buttonLayout.width,
                transform: [
                  { scale: scaleAnim },
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  currentSpeed === option.value && styles.optionItemActive,
                ]}
                onPress={() => handleSelectSpeed(option.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    currentSpeed === option.value && styles.optionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {currentSpeed === option.value && (
                  <Check size={16} color={COLORS.gold} />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
});

SpeedControlButton.displayName = 'SpeedControlButton';

export default SpeedControlButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginRight: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  optionsContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderRadius: 12,
    paddingVertical: SPACING.xs,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  optionItemActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },
  optionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  optionTextActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
});
