// src/components/Chat/TextResponse.js
// ============================================================
// TEXT RESPONSE COMPONENT
// Basic text response for chatbot
// ============================================================

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

/**
 * Strip markdown syntax from text for clean display
 */
const stripMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*\*([^*]+?)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+?)\*\*/g, '$1')
    .replace(/\*([^*]+?)\*/g, '$1')
    .replace(/^\*{3,}$/gm, '')
    .trim();
};

const TextResponse = memo(({ text, isAI = true }) => {
  return (
    <View style={[styles.container, isAI ? styles.aiContainer : styles.userContainer]}>
      <Text style={[styles.text, isAI ? styles.aiText : styles.userText]}>
        {isAI ? stripMarkdown(text) : (text || '')}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    maxWidth: '85%',
    padding: SPACING.md,
    borderRadius: 16,
    marginVertical: SPACING.xs,
  },
  aiContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userContainer: {
    backgroundColor: COLORS.gold,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    lineHeight: 22,
  },
  aiText: {
    color: COLORS.textPrimary,
  },
  userText: {
    color: COLORS.bgDark,
  },
});

TextResponse.displayName = 'TextResponse';

export default TextResponse;
