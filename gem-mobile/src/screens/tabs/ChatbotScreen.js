/**
 * Gemral - Chatbot Screen (Gemral)
 * Dark glass theme
 * Theme-aware with i18n support
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bot, MessageCircle, Send } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

export default function ChatbotScreen() {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // i18n labels
  const titleLabel = t('chatbot.title', 'Gemral');
  const statusLabel = t('chatbot.status', '● Online');
  const welcomeMessage = t('chatbot.welcome', 'Ta là GEM Master. Ta có thể hướng dẫn bạn phân tích patterns, xem quẻ Kinh Dịch, đọc bài Tarot, và trả lời câu hỏi về trading.');
  const placeholderTitle = t('chatbot.placeholder.title', 'Chat Interface');
  const placeholderDesc = t('chatbot.placeholder.description', 'Full AI chat with Gemini integration coming in Week 3+');
  const inputPlaceholder = t('chatbot.inputPlaceholder', 'Nhập tin nhắn...');

  // Theme-aware styles
  const styles = useMemo(() => StyleSheet.create({
    gradient: {
      flex: 1,
    },
    lightContainer: {
      flex: 1,
      backgroundColor: colors.bgDarkest,
    },
    container: {
      flex: 1,
    },
    header: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      padding: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: settings.theme === 'light' ? colors.border : 'rgba(106, 91, 255, 0.2)',
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
    title: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },
    status: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.success || colors.successText,
    },
    messagesContainer: {
      flex: 1,
      padding: SPACING.lg,
    },
    messageRow: {
      marginBottom: SPACING.lg,
    },
    messageBubbleAI: {
      backgroundColor: settings.theme === 'light' ? 'rgba(106, 91, 255, 0.1)' : 'rgba(106, 91, 255, 0.15)',
      borderWidth: 1,
      borderColor: settings.theme === 'light' ? 'rgba(106, 91, 255, 0.2)' : 'rgba(106, 91, 255, 0.25)',
      borderRadius: 16,
      borderBottomLeftRadius: 4,
      padding: SPACING.md,
      maxWidth: '80%',
    },
    messageText: {
      fontSize: TYPOGRAPHY.fontSize.base,
      color: colors.textPrimary,
      lineHeight: 20,
    },
    placeholder: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.xxl,
      marginTop: SPACING.xxl,
    },
    placeholderText: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
    },
    placeholderDesc: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textMuted,
      textAlign: 'center',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      padding: SPACING.lg,
      paddingBottom: 100,
      borderTopWidth: 1,
      borderTopColor: settings.theme === 'light' ? colors.border : 'rgba(255, 255, 255, 0.08)',
    },
    inputWrapper: {
      flex: 1,
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.3)',
      borderWidth: 1,
      borderColor: settings.theme === 'light' ? colors.border : 'rgba(106, 91, 255, 0.3)',
      borderRadius: 12,
      padding: SPACING.md,
    },
    inputPlaceholderText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textMuted,
    },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.burgundy || colors.purple,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const renderContent = () => (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with theme-aware background */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={gradients.avatar}
            style={styles.avatar}
          >
            <Bot size={20} color={colors.textPrimary} />
          </LinearGradient>
          <View>
            <Text style={styles.title}>{titleLabel}</Text>
            <Text style={styles.status}>{statusLabel}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {/* AI Welcome Message */}
        <View style={styles.messageRow}>
          <View style={styles.messageBubbleAI}>
            <Text style={styles.messageText}>{welcomeMessage}</Text>
          </View>
        </View>

        <View style={styles.placeholder}>
          <MessageCircle size={48} color={colors.textMuted} strokeWidth={1.5} />
          <Text style={styles.placeholderText}>{placeholderTitle}</Text>
          <Text style={styles.placeholderDesc}>{placeholderDesc}</Text>
        </View>
      </ScrollView>

      {/* Input placeholder */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputPlaceholderText}>{inputPlaceholder}</Text>
        </View>
        <View style={styles.sendButton}>
          <Send size={16} color={colors.textPrimary} />
        </View>
      </View>
    </SafeAreaView>
  );

  // Light theme uses solid background, Dark theme uses gradient
  if (settings.theme === 'light') {
    return (
      <View style={styles.lightContainer}>
        {renderContent()}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={gradients.background}
      locations={gradients.backgroundLocations}
      style={styles.gradient}
    >
      {renderContent()}
    </LinearGradient>
  );
}
