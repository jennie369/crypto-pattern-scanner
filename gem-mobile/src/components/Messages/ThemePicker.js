/**
 * ThemePicker Component
 * Grid picker for selecting chat themes
 *
 * Features:
 * - 8 preset themes with preview
 * - Visual selection indicator
 * - Sample bubble preview
 * - Smooth animations
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { getAllThemes } from '../../constants/chatThemes';

/**
 * ThemePicker - Grid picker cho chat themes
 *
 * @param {string} selectedTheme - Current theme ID
 * @param {function} onSelectTheme - (themeId) => void
 */
const ThemePicker = memo(({
  selectedTheme,
  onSelectTheme,
}) => {
  const themes = getAllThemes();

  const handleSelect = useCallback((themeId) => {
    onSelectTheme?.(themeId);
  }, [onSelectTheme]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.grid}>
        {themes.map((theme) => {
          const isSelected = selectedTheme === theme.id;

          return (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeCard,
                isSelected && styles.themeCardSelected,
              ]}
              onPress={() => handleSelect(theme.id)}
              activeOpacity={0.7}
            >
              {/* Preview */}
              <LinearGradient
                colors={theme.gradient}
                style={styles.preview}
              >
                {/* Sample bubbles */}
                <View style={[
                  styles.sampleBubble,
                  styles.otherBubble,
                  { backgroundColor: theme.colors.otherBubble },
                ]} />
                <View style={[
                  styles.sampleBubble,
                  styles.ownBubble,
                  { backgroundColor: theme.colors.ownBubble },
                ]} />
              </LinearGradient>

              {/* Info */}
              <View style={styles.themeInfo}>
                <Text style={styles.themeEmoji}>{theme.emoji}</Text>
                <Text style={styles.themeName}>{theme.name}</Text>
              </View>

              {/* Selected indicator */}
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark" size={14} color={COLORS.glassBg} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
});

ThemePicker.displayName = 'ThemePicker';

export default ThemePicker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  themeCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeCardSelected: {
    borderColor: COLORS.gold,
  },
  preview: {
    height: 100,
    padding: SPACING.sm,
    justifyContent: 'center',
  },
  sampleBubble: {
    borderRadius: 12,
    height: 20,
    marginVertical: 4,
  },
  otherBubble: {
    width: '60%',
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  ownBubble: {
    width: '50%',
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  themeEmoji: {
    fontSize: 18,
  },
  themeName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
