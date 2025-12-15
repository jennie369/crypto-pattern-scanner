/**
 * Gemral - Chat Themes Sheet Component
 * Select chat background/wallpaper and color theme
 *
 * Features:
 * - Preset wallpapers
 * - Solid color backgrounds
 * - Gradient backgrounds
 * - Preview before applying
 */

import React, { useEffect, useRef, useState, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  Image,
  PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../../utils/haptics';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const SHEET_HEIGHT = 500;

// Preset themes
const THEMES = {
  default: {
    id: 'default',
    name: 'Default',
    type: 'gradient',
    colors: ['#05040B', '#0F1030', '#05040B'],
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    type: 'gradient',
    colors: ['#0a0a1a', '#1a1a3a', '#0a0a1a'],
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    type: 'gradient',
    colors: ['#0d1b2a', '#1b263b', '#415a77'],
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    type: 'gradient',
    colors: ['#1a0a2e', '#2d1b69', '#4a1c6b'],
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    type: 'gradient',
    colors: ['#0a1628', '#132743', '#1e3a5f'],
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    type: 'gradient',
    colors: ['#0a1a0a', '#1a2d1a', '#0a1a0a'],
  },
};

// Solid colors
const SOLID_COLORS = [
  { id: 'black', name: 'Black', color: '#000000' },
  { id: 'dark-gray', name: 'Dark Gray', color: '#1a1a1a' },
  { id: 'navy', name: 'Navy', color: '#0a192f' },
  { id: 'purple-dark', name: 'Dark Purple', color: '#1a0a2e' },
  { id: 'green-dark', name: 'Dark Green', color: '#0a1a0a' },
  { id: 'brown-dark', name: 'Dark Brown', color: '#1a0f0a' },
];

const ChatThemesSheet = memo(({
  visible,
  currentTheme = 'default',
  onClose,
  onSave,
}) => {
  // Local state
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [activeTab, setActiveTab] = useState('gradients');

  // Animation refs
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Update local state when prop changes
  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  // Open animation
  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  // Close animation
  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  // Save theme
  const handleSave = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave?.(selectedTheme);
    handleClose();
  }, [selectedTheme, onSave, handleClose]);

  // Select theme
  const handleSelectTheme = useCallback((themeId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTheme(themeId);
  }, []);

  // Render gradient theme option
  const renderGradientOption = (theme) => {
    const isSelected = selectedTheme === theme.id;

    return (
      <TouchableOpacity
        key={theme.id}
        style={[styles.themeOption, isSelected && styles.themeOptionSelected]}
        onPress={() => handleSelectTheme(theme.id)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={theme.colors}
          style={styles.themePreview}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark" size={16} color={COLORS.textPrimary} />
            </View>
          )}
        </LinearGradient>
        <Text style={[styles.themeName, isSelected && styles.themeNameSelected]}>
          {theme.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render solid color option
  const renderColorOption = (colorOption) => {
    const isSelected = selectedTheme === colorOption.id;

    return (
      <TouchableOpacity
        key={colorOption.id}
        style={[styles.themeOption, isSelected && styles.themeOptionSelected]}
        onPress={() => handleSelectTheme(colorOption.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.themePreview, { backgroundColor: colorOption.color }]}>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark" size={16} color={COLORS.textPrimary} />
            </View>
          )}
        </View>
        <Text style={[styles.themeName, isSelected && styles.themeNameSelected]}>
          {colorOption.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheetContainer,
          { transform: [{ translateY }] },
        ]}
        {...panResponder.panHandlers}
      >
        <BlurView intensity={40} style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="color-palette" size={24} color={COLORS.purple} />
            <Text style={styles.title}>Chat Theme</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'gradients' && styles.tabActive]}
              onPress={() => setActiveTab('gradients')}
            >
              <Text style={[styles.tabText, activeTab === 'gradients' && styles.tabTextActive]}>
                Gradients
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'solids' && styles.tabActive]}
              onPress={() => setActiveTab('solids')}
            >
              <Text style={[styles.tabText, activeTab === 'solids' && styles.tabTextActive]}>
                Solid Colors
              </Text>
            </TouchableOpacity>
          </View>

          {/* Theme Options */}
          <ScrollView
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.optionsGrid}>
              {activeTab === 'gradients'
                ? Object.values(THEMES).map(renderGradientOption)
                : SOLID_COLORS.map(renderColorOption)
              }
            </View>
          </ScrollView>

          {/* Apply Button */}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>Apply Theme</Text>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </Modal>
  );
});

ChatThemesSheet.displayName = 'ChatThemesSheet';

export default ChatThemesSheet;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },

  // Sheet
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
  },
  sheet: {
    flex: 1,
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },

  // Handle
  handleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.purple,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },

  // Options
  optionsContainer: {
    flex: 1,
  },
  optionsContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  themeOption: {
    width: '30%',
    alignItems: 'center',
  },
  themeOptionSelected: {},
  themePreview: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 12,
    marginBottom: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  themeNameSelected: {
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Apply Button
  applyButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});
