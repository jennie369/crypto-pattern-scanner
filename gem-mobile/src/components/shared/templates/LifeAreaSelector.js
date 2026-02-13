/**
 * LifeAreaSelector.js
 * Grid or compact dropdown for life area selection
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
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  ChevronDown,
  X,
  Heart,
  Briefcase,
  DollarSign,
  BookOpen,
  Users,
  Dumbbell,
  Brain,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
} from '../../../theme/cosmicTokens';
import { LIFE_AREAS } from '../../../services/templates/journalTemplates';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Icon mapping for life areas
const LIFE_AREA_ICONS = {
  health: Dumbbell,
  career: Briefcase,
  finance: DollarSign,
  relationships: Heart,
  personal: Brain,
  learning: BookOpen,
  family: Users,
  spiritual: Sparkles,
};

// Color mapping for life areas
const LIFE_AREA_COLORS = {
  health: COSMIC_COLORS.glow.green,
  career: COSMIC_COLORS.glow.blue,
  finance: COSMIC_COLORS.glow.gold,
  relationships: COSMIC_COLORS.glow.pink,
  personal: COSMIC_COLORS.glow.purple,
  learning: COSMIC_COLORS.glow.cyan,
  family: COSMIC_COLORS.glow.orange,
  spiritual: COSMIC_COLORS.glow.white,
};

/**
 * LifeAreaSelector Component
 * @param {string} value - Current selected life area ID
 * @param {function} onChange - Value change callback
 * @param {string} mode - 'grid' or 'compact' (default: 'compact')
 * @param {string} label - Field label
 * @param {boolean} required - Is required
 * @param {boolean} disabled - Disable interaction
 * @param {string} error - Error message
 * @param {string} placeholder - Placeholder for compact mode
 */
const LifeAreaSelector = ({
  value,
  onChange,
  mode = 'compact',
  label,
  required = false,
  disabled = false,
  error,
  placeholder = 'Chọn lĩnh vực',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const lifeAreas = Object.entries(LIFE_AREAS).map(([id, area]) => ({
    id,
    ...area,
    icon: LIFE_AREA_ICONS[id] || Sparkles,
    color: LIFE_AREA_COLORS[id] || COSMIC_COLORS.glow.purple,
  }));

  const selectedArea = lifeAreas.find((area) => area.id === value);

  // Handle selection
  const handleSelect = (areaId) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange?.(areaId);

    if (mode === 'compact') {
      handleClose();
    }
  };

  // Open modal (compact mode)
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

  // Render grid item
  const renderGridItem = (area) => {
    const isSelected = area.id === value;
    const IconComponent = area.icon;

    return (
      <TouchableOpacity
        key={area.id}
        style={[
          styles.gridItem,
          isSelected && [
            styles.gridItemSelected,
            { borderColor: area.color, backgroundColor: area.color + '15' },
          ],
          disabled && styles.gridItemDisabled,
        ]}
        onPress={() => handleSelect(area.id)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.gridIconContainer,
            { backgroundColor: area.color + '20' },
          ]}
        >
          <IconComponent
            size={20}
            color={isSelected ? area.color : COSMIC_COLORS.text.muted}
          />
        </View>
        <Text
          style={[
            styles.gridLabel,
            isSelected && { color: area.color },
          ]}
          numberOfLines={1}
        >
          {area.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render compact mode
  if (mode === 'compact') {
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
            styles.compactButton,
            error && styles.compactButtonError,
            disabled && styles.compactButtonDisabled,
          ]}
          onPress={handleOpen}
          disabled={disabled}
          activeOpacity={0.7}
        >
          {selectedArea ? (
            <View style={styles.selectedContent}>
              <View
                style={[
                  styles.compactIcon,
                  { backgroundColor: selectedArea.color + '20' },
                ]}
              >
                <selectedArea.icon size={16} color={selectedArea.color} />
              </View>
              <Text style={[styles.compactText, { color: selectedArea.color }]}>
                {selectedArea.name}
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>{placeholder}</Text>
          )}
          <ChevronDown size={18} color={COSMIC_COLORS.text.muted} />
        </TouchableOpacity>

        {/* Error */}
        {error && <Text style={styles.error}>{error}</Text>}

        {/* Modal */}
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
                  <Text style={styles.modalTitle}>Chọn lĩnh vực</Text>
                  <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <X size={24} color={COSMIC_COLORS.text.muted} />
                  </TouchableOpacity>
                </View>

                {/* Grid */}
                <ScrollView
                  contentContainerStyle={styles.modalGrid}
                  showsVerticalScrollIndicator={false}
                >
                  {lifeAreas.map(renderGridItem)}
                </ScrollView>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // Render grid mode
  return (
    <View style={styles.container}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Grid */}
      <View style={styles.grid}>
        {lifeAreas.map(renderGridItem)}
      </View>

      {/* Error */}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: COSMIC_SPACING.md,
  },
  label: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md, // Increased
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
    color: COSMIC_COLORS.text.secondary,
    marginBottom: COSMIC_SPACING.sm,
  },
  required: {
    color: COSMIC_COLORS.functional.error,
  },
  error: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md, // Increased
    color: COSMIC_COLORS.functional.error,
    marginTop: COSMIC_SPACING.xs,
  },

  // Grid mode
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COSMIC_SPACING.sm,
  },
  gridItem: {
    width: (SCREEN_WIDTH - COSMIC_SPACING.lg * 2 - COSMIC_SPACING.sm * 3) / 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: COSMIC_SPACING.md,
    paddingHorizontal: COSMIC_SPACING.xs,
    backgroundColor: COSMIC_COLORS.glass.bgLight,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COSMIC_COLORS.glass.border,
    gap: COSMIC_SPACING.xs,
  },
  gridItemSelected: {
    borderWidth: 2,
  },
  gridItemDisabled: {
    opacity: 0.5,
  },
  gridIconContainer: {
    width: 36,
    height: 36,
    borderRadius: COSMIC_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.sm, // Increased
    color: COSMIC_COLORS.text.muted,
    textAlign: 'center',
  },

  // Compact mode
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COSMIC_COLORS.glass.bgDark,
    borderRadius: COSMIC_RADIUS.md,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.sm,
    minHeight: 44,
  },
  compactButtonError: {
    borderColor: COSMIC_COLORS.functional.error,
  },
  compactButtonDisabled: {
    opacity: 0.5,
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COSMIC_SPACING.sm,
  },
  compactIcon: {
    width: 28,
    height: 28,
    borderRadius: COSMIC_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md, // Increased
    fontWeight: COSMIC_TYPOGRAPHY.fontWeight.medium,
  },
  placeholderText: {
    fontSize: COSMIC_TYPOGRAPHY.fontSize.md, // Increased
    color: COSMIC_COLORS.text.hint,
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
    maxHeight: SCREEN_HEIGHT * 0.6,
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
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: COSMIC_SPACING.lg,
    gap: COSMIC_SPACING.sm,
  },
});

export default LifeAreaSelector;
