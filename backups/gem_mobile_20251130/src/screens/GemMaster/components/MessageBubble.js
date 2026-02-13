/**
 * Gemral - Message Bubble Component
 * Chat message bubble with avatar and export button for AI messages
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Sparkles, Download } from 'lucide-react-native';
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

const MessageBubble = ({ message, userTier = 'FREE', onExport, recommendations }) => {
  const isUser = message.type === 'user';
  // Skip template selector - go directly to preview with reading_card template
  const [showPreview, setShowPreview] = useState(false);

  // Get products from recommendations or message
  const products = message.products || recommendations?.crystals?.slice(0, 2) || [];

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

        {/* Bubble */}
        <View style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
        ]}>
          <Text style={[
            styles.text,
            isUser ? styles.textUser : styles.textAssistant,
          ]}>
            {isUser
              ? message.text
              : renderMarkdownText(message.text, [styles.text, styles.textAssistant])
            }
          </Text>

          {/* Divination Visual Card (I Ching hexagram or Tarot cards) */}
          {!isUser && message.divinationType && (message.hexagram || message.cards) && (
            <DivinationResultCard
              type={message.divinationType}
              data={{
                // I Ching data - include id for real image
                ...(message.hexagram && {
                  id: message.hexagram.id,
                  name: message.hexagram.name,
                  vietnamese: message.hexagram.vietnamese,
                  meaning: message.hexagram.meaning,
                  lines: message.hexagram.lines,
                  interpretation: message.interpretation,
                }),
                // Tarot data - include id for real images
                ...(message.cards && {
                  cards: message.cards.map(card => ({
                    ...card,
                    id: card.id,
                  })),
                  interpretation: message.interpretation,
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
        </View>

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
});

export default MessageBubble;
