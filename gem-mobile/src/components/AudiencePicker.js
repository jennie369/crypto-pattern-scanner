/**
 * Gemral - Audience Picker Component
 * Feature #13: Privacy & Audience Settings
 * Select who can see a post
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Globe,
  Users,
  Star,
  Lock,
  ChevronDown,
  Check,
  X,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../utils/tokens';
import privacyService from '../services/privacyService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ICONS = {
  Globe,
  Users,
  Star,
  Lock,
};

const AudiencePicker = ({
  value = 'public',
  onChange,
  disabled = false,
  compact = false,
  style,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [closeFriendsCount, setCloseFriendsCount] = useState(0);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const options = privacyService.getAudienceOptions();
  const selectedOption = options.find(o => o.id === value) || options[0];
  const IconComponent = ICONS[selectedOption.icon] || Globe;

  useEffect(() => {
    loadCloseFriendsCount();
  }, []);

  useEffect(() => {
    if (showPicker) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showPicker]);

  const loadCloseFriendsCount = async () => {
    const count = await privacyService.getCloseFriendsCount();
    setCloseFriendsCount(count);
  };

  const handleSelect = (optionId) => {
    onChange?.(optionId);
    setShowPicker(false);
  };

  const renderOption = (option) => {
    const OptionIcon = ICONS[option.icon] || Globe;
    const isSelected = value === option.id;
    const isCloseFriends = option.id === 'close_friends';

    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.optionRow, isSelected && styles.optionRowSelected]}
        onPress={() => handleSelect(option.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
          <OptionIcon
            size={20}
            color={isSelected ? COLORS.textPrimary : COLORS.textMuted}
          />
        </View>
        <View style={styles.optionInfo}>
          <View style={styles.optionLabelRow}>
            <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
              {option.label}
            </Text>
            {isCloseFriends && closeFriendsCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{closeFriendsCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.optionDesc}>{option.description}</Text>
        </View>
        {isSelected && (
          <Check size={20} color={COLORS.success} />
        )}
      </TouchableOpacity>
    );
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactButton, disabled && styles.buttonDisabled, style]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
      >
        <IconComponent size={14} color={COLORS.textMuted} />
        <Text style={styles.compactText}>{selectedOption.label}</Text>
        <ChevronDown size={12} color={COLORS.textMuted} />

        <Modal
          visible={showPicker}
          transparent
          animationType="none"
          statusBarTranslucent
        >
          <View style={styles.overlay}>
            <TouchableOpacity
              style={styles.backdrop}
              onPress={() => setShowPicker(false)}
            />

            <Animated.View
              style={[
                styles.pickerContainer,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

              <View style={styles.pickerHandle} />

              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Đối tượng xem</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowPicker(false)}
                >
                  <X size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsList}>
                {options.map(renderOption)}
              </View>
            </Animated.View>
          </View>
        </Modal>
      </TouchableOpacity>
    );
  }

  return (
    <View style={style}>
      <TouchableOpacity
        style={[styles.selectButton, disabled && styles.buttonDisabled]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
      >
        <View style={styles.selectedInfo}>
          <View style={styles.selectedIcon}>
            <IconComponent size={18} color={COLORS.textPrimary} />
          </View>
          <View>
            <Text style={styles.selectedLabel}>{selectedOption.label}</Text>
            <Text style={styles.selectedDesc}>{selectedOption.description}</Text>
          </View>
        </View>
        <ChevronDown size={20} color={COLORS.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            onPress={() => setShowPicker(false)}
          />

          <Animated.View
            style={[
              styles.pickerContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

            <View style={styles.pickerHandle} />

            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Ai có thể xem bài viết này?</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPicker(false)}
              >
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.pickerSubtitle}>
              Chọn đối tượng bạn muốn chia sẻ bài viết
            </Text>

            <View style={styles.optionsList}>
              {options.map(renderOption)}
            </View>

            {value === 'close_friends' && closeFriendsCount === 0 && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  Bạn chưa thêm bạn thân nào. Bài viết sẽ chỉ hiển thị với bạn.
                </Text>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

/**
 * Inline visibility indicator (read-only)
 */
export const VisibilityBadge = ({ visibility = 'public', size = 'small' }) => {
  const options = privacyService.getAudienceOptions();
  const option = options.find(o => o.id === visibility) || options[0];
  const IconComponent = ICONS[option.icon] || Globe;

  const sizes = {
    small: { icon: 12, text: TYPOGRAPHY.fontSize.xs },
    normal: { icon: 14, text: TYPOGRAPHY.fontSize.sm },
  };

  const s = sizes[size] || sizes.small;

  return (
    <View style={styles.badge}>
      <IconComponent size={s.icon} color={COLORS.textMuted} />
      <Text style={[styles.badgeText, { fontSize: s.text }]}>{option.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  selectedIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  selectedDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  compactText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: GLASS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: SPACING.huge,
    overflow: 'hidden',
  },
  pickerHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.sm,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  pickerTitle: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  pickerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  optionsList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  optionRowSelected: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.purple,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionIconSelected: {
    backgroundColor: COLORS.purple,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  optionLabelSelected: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  countBadge: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  optionDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  warningBox: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 183, 0, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 183, 0, 0.3)',
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.warning,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  badgeText: {
    color: COLORS.textMuted,
  },
});

export default AudiencePicker;
