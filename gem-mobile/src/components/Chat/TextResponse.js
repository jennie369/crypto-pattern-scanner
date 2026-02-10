// src/components/Chat/TextResponse.js
// ============================================================
// TEXT RESPONSE COMPONENT
// Basic text response for chatbot
// ============================================================

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';

const TextResponse = memo(({ text, isAI = true }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      maxWidth: '85%',
      padding: SPACING.md,
      borderRadius: 16,
      marginVertical: SPACING.xs,
    },
    aiContainer: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 4,
    },
    userContainer: {
      backgroundColor: colors.gold,
      alignSelf: 'flex-end',
      borderBottomRightRadius: 4,
    },
    text: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      lineHeight: 22,
    },
    aiText: {
      color: colors.textPrimary,
    },
    userText: {
      color: colors.bgDark,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={[styles.container, isAI ? styles.aiContainer : styles.userContainer]}>
      <Text style={[styles.text, isAI ? styles.aiText : styles.userText]}>
        {text || ''}
      </Text>
    </View>
  );
});

TextResponse.displayName = 'TextResponse';

export default TextResponse;
