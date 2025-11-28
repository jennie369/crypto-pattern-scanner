/**
 * Gemral - Chat Wisdom Template
 *
 * Elegant design for AI wisdom quotes
 * Size: 1080x1920 (Instagram story format)
 * Theme: Burgundy to Navy gradient with gold border
 */

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Quote, Heart } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH;
const CARD_HEIGHT = CARD_WIDTH * (1920 / 1080);

const ChatWisdomTemplate = forwardRef(({ data, showWatermark = true }, ref) => {
  const {
    question = '',
    wisdom = '',
    text = '',
    crystalRecommendation = '',
    date = new Date(),
  } = data || {};

  const wisdomText = wisdom || text || '';

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <View ref={ref} style={styles.container} collapsable={false}>
      <LinearGradient
        colors={['#9C0612', '#6B0F1A', '#112250', '#0F1030']}
        locations={[0, 0.25, 0.6, 1]}
        style={styles.gradient}
      >
        {/* Decorative Border */}
        <View style={styles.borderFrame}>
          {/* Corner decorations */}
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconRow}>
            <Sparkles size={20} color={COLORS.gold} />
            <Text style={styles.headerTitle}>GEM WISDOM</Text>
            <Sparkles size={20} color={COLORS.gold} />
          </View>
          <Text style={styles.headerDate}>{formatDate(date)}</Text>
        </View>

        {/* Question (if exists) */}
        {question && (
          <View style={styles.questionContainer}>
            <Text style={styles.questionLabel}>Your Question:</Text>
            <Text style={styles.questionText} numberOfLines={3}>
              "{question}"
            </Text>
          </View>
        )}

        {/* Main Wisdom */}
        <View style={styles.wisdomContainer}>
          <View style={styles.quoteIconTop}>
            <Quote size={32} color={COLORS.gold} />
          </View>

          <Text style={styles.wisdomText} numberOfLines={12}>
            {wisdomText}
          </Text>

          <View style={styles.quoteIconBottom}>
            <Quote
              size={32}
              color={COLORS.gold}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </View>
        </View>

        {/* Crystal Recommendation */}
        {crystalRecommendation && (
          <View style={styles.crystalContainer}>
            <View style={styles.crystalHeader}>
              <Heart size={16} color={COLORS.gold} />
              <Text style={styles.crystalLabel}>Recommended Crystal</Text>
            </View>
            <Text style={styles.crystalName}>{crystalRecommendation}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {showWatermark && (
            <View style={styles.watermark}>
              <Text style={styles.watermarkText}>Unlock Premium Templates</Text>
            </View>
          )}
          <View style={styles.brandRow}>
            <Sparkles size={14} color="rgba(255, 189, 89, 0.6)" />
            <Text style={styles.website}>gemcapitalholding.com</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#9C0612',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.huge,
  },

  // Decorative border
  borderFrame: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderRadius: 8,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: COLORS.gold,
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },

  // Header
  header: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 3,
  },
  headerDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Question
  questionContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  questionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: SPACING.xs,
  },
  questionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Wisdom
  wisdomContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.lg,
  },
  quoteIconTop: {
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  quoteIconBottom: {
    alignItems: 'flex-end',
    marginTop: SPACING.md,
  },
  wisdomText: {
    fontSize: 20,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '400',
  },

  // Crystal
  crystalContainer: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  crystalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  crystalLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: '600',
  },
  crystalName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.md,
  },
  watermark: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginBottom: SPACING.md,
  },
  watermarkText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 189, 89, 0.6)',
    fontWeight: '500',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  website: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default ChatWisdomTemplate;
