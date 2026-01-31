/**
 * GEM Mobile - Quick Action Bar Component
 * Quick action buttons above ChatInput - Binance-style FAQ Topics
 *
 * Actions:
 * - Kinh Dịch (navigate to IChing screen)
 * - Tarot (navigate to Tarot screen)
 * - Other topics (show FAQ panel with questions)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { COLORS, SPACING } from '../../utils/tokens';
import { FAQ_TOPICS } from './FAQPanelData';

// Theme blue/purple color for Quick Select buttons
const BUTTON_COLOR = COLORS.primary || '#8B5CF6';

/**
 * QuickActionBar Component
 * @param {Object} props
 * @param {Function} props.onAction - Callback when action is pressed (for messages)
 * @param {Function} props.onNavigate - Callback for navigation actions
 * @param {Function} props.onTopicSelect - Callback when topic with FAQ is selected
 * @param {boolean} props.disabled - Disable all buttons (quota exceeded)
 * @param {Object} props.style - Additional container style
 */
const QuickActionBar = ({
  onAction,
  onNavigate,
  onTopicSelect,
  disabled = false,
  style
}) => {
  const handlePress = (topic) => {
    // Navigate actions - always allowed
    if (topic.action === 'navigate_screen') {
      onNavigate?.(topic.screen);
      return;
    }

    // FAQ actions - show FAQ panel
    if (topic.action === 'show_faq') {
      if (disabled) return; // Disable FAQ when quota exceeded
      onTopicSelect?.(topic.id);
      return;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        decelerationRate="fast"
        keyboardShouldPersistTaps="always"
      >
        {FAQ_TOPICS.map((topic) => {
          const IconComponent = topic.icon;
          const isFAQAction = topic.action === 'show_faq';
          const isDisabled = disabled && isFAQAction;

          return (
            <TouchableOpacity
              key={topic.id}
              onPress={() => handlePress(topic)}
              activeOpacity={isDisabled ? 1 : 0.8}
              disabled={isDisabled}
              style={[
                styles.button,
                isDisabled && styles.buttonDisabled
              ]}
            >
              <View style={styles.iconWrapper}>
                <IconComponent
                  size={12}
                  color={isDisabled ? '#666' : BUTTON_COLOR}
                  strokeWidth={2}
                />
              </View>
              <Text
                style={[
                  styles.buttonLabel,
                  isDisabled && styles.textDisabled
                ]}
                numberOfLines={1}
              >
                {topic.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary || '#8B5CF6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(50, 50, 50, 0.3)',
    borderColor: '#444',
  },
  iconWrapper: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  buttonLabel: {
    color: COLORS.primary || '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
  },
  textDisabled: {
    color: '#666',
  },
});

export default QuickActionBar;
