/**
 * SelectInput.js
 * Dropdown select component with modal picker
 *
 * Created: 2026-02-02
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
  GLASS_STYLES,
} from '../../../theme/cosmicTokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * SelectInput Component
 * @param {any} value - Current selected value
 * @param {function} onChange - Value change callback
 * @param {Array} options - Array of { value, label, description?, icon? }
 * @param {string} placeholder - Placeholder text
 * @param {string} label - Field label
 * @param {boolean} required - Is required
 * @param {boolean} disabled - Disable interaction
 * @param {string} error - Error message
 */
const SelectInput = ({
  value,
  onChange,
  options = [],
  placeholder = 'Chọn một tùy chọn',
  label,
  required = false,
  disabled = false,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Find selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Open modal
  const handleOpen = () => {
    if (disabled) return;
    setModalVisible(true);
  };

  // Close modal
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  };

  // Select option
  const handleSelect = (option) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange?.(option.value);
    handleClose();
  };

  // Animate on open
  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible, fadeAnim, slideAnim]);

  // Render option item
  const renderOption = ({ item }) => {
    const isSelected = item.value === value;

    return (
      <TouchableOpacity
        style={[styles.optionItem, isSelected && styles.optionItemSelected]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.optionContent}>
          {item.icon && (
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>{item.icon}</Text>
            </View>
          )}
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
              {item.label}
            </Text>
            {item.description && (
              <Text style={styles.optionDescription}>{item.description}</Text>
            )}
          </View>
        </View>

        {isSelected && (
          <Check size={20} color={COSMIC_COLORS.glow.gold} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Select Button */}
      <TouchableOpacity
        style={[
          styles.selectButton,
          error && styles.selectButtonError,
          disabled && styles.selectButtonDisabled,
        ]}
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectText,
            !selectedOption && styles.selectPlaceholder,
          ]}
          numberOfLines={1}
        >
          {selectedOption ? (
            <>
              {selectedOption.icon && `${selectedOption.icon} `}
              {selectedOption.label}
            </>
          ) : (
            placeholder
          )}
        </Text>
        <ChevronDown size={20} color={COSMIC_COLORS.text.muted} />
      </TouchableOpacity>

      {/* Error */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Modal Picker */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View
            style={[
              styles.modal,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label || 'Chọn'}</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color={COSMIC_COLORS.text.muted} />
                </TouchableOpacity>
              </View>

              {/* Options List */}
              <FlatList
                data={options}
                renderItem={renderOption}
                keyExtractor={(item) => String(item.value)}
                style={styles.optionsList}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: COSMIC_SPACING.md,
  },
  label: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
    color: COSMIC_COLORS.text.secondary,
    marginBottom: COSMIC_SPACING.sm,
  },
  required: {
    color: COSMIC_COLORS.functional.error,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COSMIC_COLORS.glass.bgDark,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.md,
    minHeight: 48,
  },
  selectButtonError: {
    borderColor: COSMIC_COLORS.functional.error,
  },
  selectButtonDisabled: {
    opacity: 0.5,
  },
  selectText: {
    flex: 1,
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    color: COSMIC_COLORS.text.primary,
    marginRight: COSMIC_SPACING.sm,
  },
  selectPlaceholder: {
    color: COSMIC_COLORS.text.hint,
  },
  error: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.functional.error,
    marginTop: COSMIC_SPACING.xs,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COSMIC_COLORS.bgNebula,
    borderTopLeftRadius: COSMIC_RADIUS.xxl,
    borderTopRightRadius: COSMIC_RADIUS.xxl,
    maxHeight: SCREEN_HEIGHT * 0.7,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: COSMIC_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COSMIC_COLORS.glass.border,
  },
  modalTitle: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.lg,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
    color: COSMIC_COLORS.text.primary,
  },
  closeButton: {
    padding: COSMIC_SPACING.xs,
  },
  optionsList: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: COSMIC_SPACING.lg,
    paddingVertical: COSMIC_SPACING.md,
  },
  optionItemSelected: {
    backgroundColor: COSMIC_COLORS.glow.gold + '15',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: COSMIC_RADIUS.sm,
    backgroundColor: COSMIC_COLORS.glass.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: COSMIC_SPACING.md,
  },
  optionIconText: {
    fontSize: 18,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md,
    color: COSMIC_COLORS.text.primary,
  },
  optionLabelSelected: {
    color: COSMIC_COLORS.glow.gold,
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.semibold,
  },
  optionDescription: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm,
    color: COSMIC_COLORS.text.muted,
    marginTop: COSMIC_SPACING.xxs,
  },
  separator: {
    height: 1,
    backgroundColor: COSMIC_COLORS.glass.border,
    marginHorizontal: COSMIC_SPACING.lg,
  },
});

export default SelectInput;
