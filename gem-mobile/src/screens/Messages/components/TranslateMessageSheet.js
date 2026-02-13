/**
 * Gemral - Translate Message Sheet Component
 * Bottom sheet for translating message content
 *
 * Features:
 * - Auto-detect source language
 * - Multiple target languages
 * - Copy translation
 * - Show original text
 */

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  ActivityIndicator,
  PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '../../../utils/haptics';
import * as Clipboard from 'expo-clipboard';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const SHEET_HEIGHT = 450;

// Supported languages
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
];

const TranslateMessageSheet = memo(({
  visible,
  message,
  onClose,
}) => {
  // Local state
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translating, setTranslating] = useState(false);
  const [translation, setTranslation] = useState(null);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [error, setError] = useState(null);

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

  // Reset state when opened
  useEffect(() => {
    if (visible) {
      setTranslation(null);
      setError(null);
      setDetectedLanguage(null);
    }
  }, [visible]);

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

  // Translate message
  const handleTranslate = useCallback(async (targetLang) => {
    if (!message?.content || translating) return;

    try {
      setTranslating(true);
      setError(null);
      setSelectedLanguage(targetLang);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // In production, this would call a translation API
      // For demo, we'll simulate translation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulated translation (in real app, use Google Translate API or similar)
      const mockTranslations = {
        'en': `[Translated to English] ${message.content}`,
        'vi': `[Đã dịch sang Tiếng Việt] ${message.content}`,
        'zh': `[已翻译成中文] ${message.content}`,
        'ja': `[日本語に翻訳] ${message.content}`,
        'ko': `[한국어로 번역됨] ${message.content}`,
        'es': `[Traducido al Español] ${message.content}`,
        'fr': `[Traduit en Français] ${message.content}`,
        'de': `[Ins Deutsche übersetzt] ${message.content}`,
        'pt': `[Traduzido para Português] ${message.content}`,
        'ru': `[Переведено на русский] ${message.content}`,
        'th': `[แปลเป็นภาษาไทย] ${message.content}`,
        'id': `[Diterjemahkan ke Indonesia] ${message.content}`,
      };

      setTranslation(mockTranslations[targetLang] || message.content);
      setDetectedLanguage('auto'); // In real app, detect from API response
    } catch (err) {
      console.error('Translation error:', err);
      setError('Translation failed. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setTranslating(false);
    }
  }, [message, translating]);

  // Copy translation
  const handleCopy = useCallback(async () => {
    if (translation) {
      await Clipboard.setStringAsync(translation);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [translation]);

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
            <Ionicons name="language" size={24} color={COLORS.purple} />
            <Text style={styles.title}>Translate</Text>
          </View>

          {/* Original Text */}
          <View style={styles.originalContainer}>
            <Text style={styles.label}>Original</Text>
            <Text style={styles.originalText} numberOfLines={3}>
              {message?.content || ''}
            </Text>
          </View>

          {/* Language Selection */}
          <Text style={styles.label}>Translate to</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.languagesScroll}
            contentContainerStyle={styles.languagesContent}
          >
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageChip,
                  selectedLanguage === lang.code && styles.languageChipSelected,
                ]}
                onPress={() => handleTranslate(lang.code)}
                activeOpacity={0.7}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageName,
                  selectedLanguage === lang.code && styles.languageNameSelected,
                ]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Translation Result */}
          <View style={styles.resultContainer}>
            {translating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.purple} />
                <Text style={styles.loadingText}>Translating...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : translation ? (
              <>
                <Text style={styles.label}>Translation</Text>
                <View style={styles.translationBox}>
                  <Text style={styles.translationText}>{translation}</Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={handleCopy}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="copy-outline" size={18} color={COLORS.cyan} />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.hintContainer}>
                <Ionicons name="arrow-up" size={20} color={COLORS.textMuted} />
                <Text style={styles.hintText}>
                  Select a language above to translate
                </Text>
              </View>
            )}
          </View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
});

TranslateMessageSheet.displayName = 'TranslateMessageSheet';

export default TranslateMessageSheet;

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

  // Labels
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
  },

  // Original
  originalContainer: {
    marginBottom: SPACING.md,
  },
  originalText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    lineHeight: 22,
  },

  // Languages
  languagesScroll: {
    maxHeight: 50,
    marginBottom: SPACING.md,
  },
  languagesContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  languageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    gap: SPACING.xs,
  },
  languageChipSelected: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.purple,
  },
  languageFlag: {
    fontSize: 16,
  },
  languageName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
  languageNameSelected: {
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Result
  resultContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.error,
  },
  translationBox: {
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.purple,
  },
  translationText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  copyButton: {
    alignSelf: 'flex-end',
    marginTop: SPACING.sm,
    padding: SPACING.xs,
  },
  hintContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  hintText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },
});
