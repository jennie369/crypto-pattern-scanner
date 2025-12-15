/**
 * Gemral - Message Bubble Component
 * Chat message bubble with avatar and export button for AI messages
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ToastAndroid, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { User, Sparkles, Download, Copy, Check } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import ExportPreview from '../../../components/GemMaster/ExportPreview';
import exportService from '../../../services/exportService';
import ProductCard from '../../../components/GemMaster/ProductCard';
import DivinationResultCard from '../../../components/GemMaster/DivinationResultCard';

/**
 * Simple markdown text renderer
 * Supports: **bold**, *italic*, bullet points
 */
const renderMarkdownText = (text, baseStyle) => {
  if (!text) return null;

  // Split by lines first
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    // Check if line is a bullet point
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('*') && !line.trim().startsWith('**');
    const bulletMatch = line.match(/^(\s*)[•\*]\s+(.*)$/);

    if (bulletMatch) {
      const content = bulletMatch[2];
      return (
        <Text key={lineIndex} style={baseStyle}>
          {'  • '}{renderInlineMarkdown(content, baseStyle)}
          {lineIndex < lines.length - 1 ? '\n' : ''}
        </Text>
      );
    }

    return (
      <Text key={lineIndex} style={baseStyle}>
        {renderInlineMarkdown(line, baseStyle)}
        {lineIndex < lines.length - 1 ? '\n' : ''}
      </Text>
    );
  });
};

/**
 * Render inline markdown (bold, italic)
 */
const renderInlineMarkdown = (text, baseStyle) => {
  if (!text) return null;

  const parts = [];
  let remaining = text;
  let key = 0;

  // Pattern for **bold** and *italic*
  const boldPattern = /\*\*([^*]+)\*\*/;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(boldPattern);

    if (boldMatch) {
      const beforeBold = remaining.slice(0, boldMatch.index);
      if (beforeBold) {
        parts.push(<Text key={key++}>{beforeBold}</Text>);
      }
      parts.push(
        <Text key={key++} style={{ fontWeight: '700' }}>
          {boldMatch[1]}
        </Text>
      );
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
    } else {
      parts.push(<Text key={key++}>{remaining}</Text>);
      break;
    }
  }

  return parts;
};

const MessageBubble = ({ message, userTier = 'FREE', onExport, recommendations, onOptionSelect, onQuickBuy }) => {
  const isUser = message.type === 'user';
  // Skip template selector - go directly to preview with reading_card template
  const [showPreview, setShowPreview] = useState(false);
  // State for copy feedback
  const [copied, setCopied] = useState(false);
  // State for selected option (to show visual feedback)
  const [selectedOption, setSelectedOption] = useState(null);

  // Get products from recommendations or message
  const products = message.products || recommendations?.crystals?.slice(0, 2) || [];

  // Check if this message has interactive options (questionnaire)
  const hasOptions = !isUser && message.options && Array.isArray(message.options) && message.options.length > 0;

  // Handle option button press
  const handleOptionPress = useCallback((option) => {
    if (selectedOption) return; // Already selected, prevent double tap

    // Visual feedback
    setSelectedOption(option.id);

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Call parent handler with the selected option
    if (onOptionSelect) {
      // Small delay for visual feedback
      setTimeout(() => {
        onOptionSelect(option);
      }, 200);
    }
  }, [selectedOption, onOptionSelect]);

  // Handle long press to copy text
  const handleLongPress = useCallback(async () => {
    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Copy text to clipboard
      await Clipboard.setStringAsync(message.text || '');

      // Show feedback
      setCopied(true);

      // Toast on Android
      if (Platform.OS === 'android') {
        ToastAndroid.show('Đã sao chép tin nhắn', ToastAndroid.SHORT);
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('[MessageBubble] Copy error:', error);
    }
  }, [message.text]);

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Prepare message data for export (includes visual data for divination)
  const prepareExportData = () => {
    // Extract title based on divination type
    let title = exportService.extractTitle(message.text);
    if (message.divinationType === 'iching' && message.hexagram) {
      title = `🔮 Kết quả Kinh Dịch - ${message.hexagram.name}`;
    } else if (message.divinationType === 'tarot' && message.cards) {
      title = '🃏 Kết quả Tarot - Trải 3 lá';
    }

    return {
      text: message.text,
      title: title,
      interpretation: message.text,
      keyMessage: exportService.extractKeyMessage(message.text),
      wisdom: message.text,
      date: message.timestamp || new Date(),
      // Visual data for templates
      divinationType: message.divinationType || null,
      hexagram: message.hexagram || null,
      cards: message.cards || null,
      fortune: message.interpretation?.fortune || null,
    };
  };

  // Skip template selector - go directly to preview
  const handleExportPress = () => {
    setShowPreview(true);
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
  };

  return (
    <>
      <View style={[
        styles.container,
        isUser ? styles.containerUser : styles.containerAssistant,
      ]}>
        {/* Avatar - Assistant */}
        {!isUser && (
          <View style={styles.avatar}>
            <Sparkles size={16} color={COLORS.gold} />
          </View>
        )}

        {/* Bubble - Pressable for long press to copy */}
        <Pressable
          onLongPress={handleLongPress}
          delayLongPress={500}
          style={({ pressed }) => [
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAssistant,
            pressed && styles.bubblePressed,
            copied && styles.bubbleCopied,
          ]}
        >
          {/* Copy indicator */}
          {copied && (
            <View style={styles.copyIndicator}>
              <Check size={14} color="#10B981" />
              <Text style={styles.copyIndicatorText}>Đã sao chép</Text>
            </View>
          )}

          <Text style={[
            styles.text,
            isUser ? styles.textUser : styles.textAssistant,
          ]}>
            {isUser
              ? message.text
              : renderMarkdownText(message.text, [styles.text, styles.textAssistant])
            }
          </Text>

          {/* Interactive Choice Buttons for Questionnaire */}
          {hasOptions && (
            <View style={styles.optionsContainer}>
              {message.options.map((option) => {
                const isSelected = selectedOption === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                      selectedOption && !isSelected && styles.optionButtonDisabled,
                    ]}
                    onPress={() => handleOptionPress(option)}
                    disabled={!!selectedOption}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}>
                      <Text style={[
                        styles.optionLabelText,
                        isSelected && styles.optionLabelTextSelected,
                      ]}>
                        {option.label}
                      </Text>
                    </View>
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                      selectedOption && !isSelected && styles.optionTextDisabled,
                    ]}>
                      {option.text}
                    </Text>
                    {isSelected && (
                      <Check size={16} color={COLORS.gold} style={styles.optionCheck} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Divination Visual Card (I Ching hexagram or Tarot cards) */}
          {!isUser && message.divinationType && (message.hexagram || message.cards) && (
            <DivinationResultCard
              type={message.divinationType}
              data={{
                // I Ching data - include id for real image
                ...(message.hexagram && {
                  id: message.hexagram.id,
                  hexagramId: message.hexagram.id, // Also include as hexagramId for compatibility
                  name: message.hexagram.name,
                  vietnamese: message.hexagram.vietnamese,
                  meaning: message.hexagram.meaning,
                  lines: message.hexagram.lines,
                  interpretation: message.interpretation,
                  // Pass through image data if available
                  imageUri: message.imageUri,
                  imageSource: message.imageSource,
                }),
                // Tarot data - include id for real images
                ...(message.cards && {
                  cards: message.cards.map((card, idx) => ({
                    ...card,
                    id: card.id,
                    // Pass through individual card images if available
                    imageUri: card.imageUri,
                    imageSource: card.imageSource,
                  })),
                  interpretation: message.interpretation,
                  // Pass through array of images if available
                  images: message.images,
                }),
              }}
              onExportPress={handleExportPress}
            />
          )}

          {/* Product Cards (for AI messages with recommendations) */}
          {!isUser && products.length > 0 && (
            <View style={styles.productsContainer}>
              {products.map((product, index) => (
                <ProductCard
                  key={product.id || index}
                  product={product}
                  compact={true}
                  onQuickBuy={onQuickBuy}
                />
              ))}
            </View>
          )}

          {/* Footer Row - Timestamp and Actions */}
          <View style={styles.footer}>
            <Text style={[styles.timestamp, isUser && styles.timestampUser]}>
              {formatTime(message.timestamp)}
            </Text>

            {/* Export Button - Only for AI messages */}
            {!isUser && message.text && message.text.length > 20 && (
              <TouchableOpacity
                style={styles.exportButton}
                onPress={handleExportPress}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Download size={14} color={COLORS.gold} />
              </TouchableOpacity>
            )}
          </View>
        </Pressable>

        {/* Avatar - User */}
        {isUser && (
          <View style={[styles.avatar, styles.avatarUser]}>
            <User size={16} color={COLORS.textPrimary} />
          </View>
        )}
      </View>

      {/* Export Preview Modal - Skip template selector, use reading_card directly */}
      <ExportPreview
        visible={showPreview}
        onClose={handlePreviewClose}
        templateId="reading_card"
        messageData={prepareExportData()}
        userTier={userTier}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  containerUser: {
    flexDirection: 'row-reverse',
  },
  containerAssistant: {
    flexDirection: 'row',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GLASS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: GLASS.borderWidth,
    borderColor: COLORS.purple,
  },
  avatarUser: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  bubble: {
    borderRadius: GLASS.borderRadius,
    padding: SPACING.md,
    maxWidth: '75%',
  },
  bubbleUser: {
    backgroundColor: COLORS.gold,
    alignSelf: 'flex-end',
    borderBottomRightRadius: SPACING.xs,
  },
  bubbleAssistant: {
    backgroundColor: GLASS.background,
    borderWidth: GLASS.borderWidth,
    borderColor: COLORS.inputBorder,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: SPACING.xs,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    lineHeight: 22,
  },
  textUser: {
    color: '#1a1a2e',  // Dark purple-black for readability on gold
  },
  textAssistant: {
    color: COLORS.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  timestampUser: {
    color: 'rgba(26, 26, 46, 0.6)',  // Dark for gold background
  },
  exportButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  productsContainer: {
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  // Long press states
  bubblePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  bubbleCopied: {
    borderColor: '#10B981',
    borderWidth: 1.5,
  },
  copyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  copyIndicatorText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  // Interactive choice button styles
  optionsContainer: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderColor: COLORS.gold,
    borderWidth: 1.5,
  },
  optionButtonDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionLabel: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(106, 91, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabelSelected: {
    backgroundColor: COLORS.gold,
  },
  optionLabelText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  optionLabelTextSelected: {
    color: '#1a1a2e',
  },
  optionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  optionTextSelected: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  optionTextDisabled: {
    color: COLORS.textMuted,
  },
  optionCheck: {
    marginLeft: SPACING.xs,
  },
});

export default MessageBubble;
