/**
 * GEM Platform - Chatbot Screen (Gem Master)
 * Dark glass theme
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

export default function ChatbotScreen() {
  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* ✅ Header with dark blue background like Thong Bao */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={GRADIENTS.avatar}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>🤖</Text>
            </LinearGradient>
            <View>
              <Text style={styles.title}>Gem Master</Text>
              <Text style={styles.status}>● Online</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.messagesContainer}>
          {/* AI Welcome Message */}
          <View style={styles.messageRow}>
            <View style={styles.messageBubbleAI}>
              <Text style={styles.messageText}>
                Xin chào! Tôi là GEM AI Assistant. Tôi có thể giúp bạn phân tích patterns,
                xem bói Tarot/I Ching, và trả lời các câu hỏi về trading.
              </Text>
            </View>
          </View>

          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>💬</Text>
            <Text style={styles.placeholderText}>Chat Interface</Text>
            <Text style={styles.placeholderDesc}>
              Full AI chat with Gemini integration coming in Week 3+
            </Text>
          </View>
        </ScrollView>

        {/* Input placeholder */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputPlaceholder}>Nhập tin nhắn...</Text>
          </View>
          <View style={styles.sendButton}>
            <Text style={styles.sendIcon}>➤</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  // ✅ Header style matching Thong Bao - dark blue background
  header: {
    backgroundColor: GLASS.background,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  status: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
  },
  messagesContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  messageRow: {
    marginBottom: SPACING.lg,
  },
  messageBubbleAI: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.25)',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: SPACING.md,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    marginTop: SPACING.xxl,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  placeholderDesc: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    paddingBottom: 100, // Account for floating tab bar (70px height + 18px offset + extra padding)
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    borderRadius: 12,
    padding: SPACING.md,
  },
  inputPlaceholder: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.burgundy,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});
