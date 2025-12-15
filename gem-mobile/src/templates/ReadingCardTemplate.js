/**
 * Gemral - Reading Card Template
 *
 * Beautiful card for I Ching/Tarot readings
 * Size: 1080x1920 (Instagram story format)
 * Theme: Navy to dark gradient with gold accents
 *
 * Now includes visual hexagram lines and tarot card display!
 */

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Star, Moon, Sun } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/tokens';
import { getCardImage } from '../assets/tarot';
import { getHexagramImage } from '../assets/iching';

// Fixed export dimensions for Instagram story format
const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;

/**
 * Hexagram Visual Component
 * Renders I Ching hexagram with real card image
 */
const HexagramVisual = ({ hexagramId, name, vietnamese }) => {
  const hexagramImage = hexagramId ? getHexagramImage(hexagramId) : null;

  return (
    <View style={hexStyles.container}>
      <View style={hexStyles.card}>
        {hexagramImage ? (
          <Image
            source={hexagramImage}
            style={hexStyles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['rgba(255, 189, 89, 0.15)', 'rgba(106, 91, 255, 0.1)']}
            style={hexStyles.cardFallback}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Star size={40 * SCALE} color={COLORS.gold} />
          </LinearGradient>
        )}
        {/* Card name overlay */}
        <View style={hexStyles.cardNameOverlay}>
          <Text style={hexStyles.name}>{name || ''}</Text>
          {vietnamese && vietnamese !== 'undefined' && (
            <Text style={hexStyles.vietnamese}>{vietnamese}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

// Scale factor for 1080px width template
const SCALE = 2.5;

const hexStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20 * SCALE,
  },
  card: {
    width: 200 * SCALE,
    height: 300 * SCALE,
    borderRadius: 14 * SCALE,
    borderWidth: 4,
    borderColor: COLORS.gold,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingVertical: 12 * SCALE,
    paddingHorizontal: 10 * SCALE,
  },
  name: {
    fontSize: 22 * SCALE,
    fontWeight: '700',
    color: COLORS.gold,
    textAlign: 'center',
  },
  vietnamese: {
    fontSize: 14 * SCALE,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
});

/**
 * Tarot Cards Visual Component
 * Renders 3-card spread (Past, Present, Future) with real images
 */
const TarotCardsVisual = ({ cards }) => {
  if (!cards || cards.length < 3) return null;

  const positions = ['Quá khứ', 'Hiện tại', 'Tương lai'];

  return (
    <View style={tarotStyles.container}>
      {cards.slice(0, 3).map((card, index) => {
        // Get real card image
        const cardImage = card.id !== undefined ? getCardImage(card.id) : null;

        return (
          <View key={index} style={tarotStyles.cardWrapper}>
            <Text style={tarotStyles.positionLabel}>{positions[index]}</Text>
            <View style={tarotStyles.card}>
              {cardImage ? (
                <Image
                  source={cardImage}
                  style={tarotStyles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={['rgba(255, 189, 89, 0.2)', 'rgba(106, 91, 255, 0.15)']}
                  style={tarotStyles.cardFallback}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Star size={28 * SCALE} color={COLORS.gold} />
                </LinearGradient>
              )}
              {/* Card name overlay */}
              <View style={tarotStyles.cardNameOverlay}>
                <Text style={tarotStyles.cardName} numberOfLines={1}>
                  {card.vietnamese}
                </Text>
                <Text style={tarotStyles.cardMeaning} numberOfLines={1}>
                  {card.meaning}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const tarotStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12 * SCALE,
    marginBottom: 24 * SCALE,
  },
  cardWrapper: {
    alignItems: 'center',
  },
  positionLabel: {
    fontSize: 14 * SCALE,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8 * SCALE,
    fontWeight: '600',
  },
  card: {
    width: 130 * SCALE,
    height: 195 * SCALE,
    borderRadius: 12 * SCALE,
    borderWidth: 3,
    borderColor: COLORS.gold,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 8 * SCALE,
    paddingHorizontal: 6 * SCALE,
  },
  cardName: {
    fontSize: 14 * SCALE,
    color: COLORS.gold,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  cardMeaning: {
    fontSize: 11 * SCALE,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

/**
 * Fortune Stars Component
 */
const FortuneStars = ({ fortune }) => {
  if (!fortune) return null;

  return (
    <View style={fortuneStyles.container}>
      <Text style={fortuneStyles.label}>Độ may mắn</Text>
      <View style={fortuneStyles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            style={[fortuneStyles.star, star <= fortune && fortuneStyles.starActive]}
          >
            ★
          </Text>
        ))}
      </View>
    </View>
  );
};

const fortuneStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20 * SCALE,
  },
  label: {
    fontSize: 16 * SCALE,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8 * SCALE,
    fontWeight: '500',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8 * SCALE,
  },
  star: {
    fontSize: 28 * SCALE,
    color: 'rgba(255, 255, 255, 0.2)',
  },
  starActive: {
    color: COLORS.gold,
  },
});

/**
 * Strip markdown formatting from text for clean display
 * Removes: **bold**, *italic*, bullet points, etc.
 */
const stripMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold** → bold
    .replace(/\*([^*]+)\*/g, '$1')       // *italic* → italic
    .replace(/^[•\-\*]\s+/gm, '• ')      // Normalize bullet points
    .replace(/^\s*\n/gm, '\n')           // Remove empty lines
    .trim();
};

/**
 * Truncate text for export image
 * Extract first meaningful paragraph(s) for display
 * @param {string} text - Full interpretation text
 * @param {number} maxLength - Maximum characters
 * @returns {string} Truncated text
 */
const truncateForExport = (text, maxLength = 200) => {
  if (!text) return '';

  // Clean up the text first
  let cleaned = stripMarkdown(text);

  // Remove section headers like "🔮 Kết quả Kinh Dịch", "📖 Luận giải:", etc.
  cleaned = cleaned
    .replace(/^[🔮🃏📖💎✨🌟⭐️🌙💫].*?:\s*/gm, '')  // Remove emoji headers
    .replace(/^Quẻ.*?\n/gm, '')                        // Remove "Quẻ xxx" lines
    .replace(/^Kết quả.*?\n/gm, '')                    // Remove "Kết quả" lines
    .replace(/\(undefined\)/g, '')                     // Remove "(undefined)" text
    .replace(/undefined/g, '')                         // Remove any "undefined" text
    .replace(/\n{2,}/g, '\n')                          // Multiple newlines → single
    .trim();

  // If text is already short enough, return it
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Try to find a natural break point (end of sentence)
  const truncated = cleaned.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastComma = truncated.lastIndexOf(',');
  const lastNewline = truncated.lastIndexOf('\n');

  // Find best break point
  let breakPoint = maxLength;
  if (lastPeriod > maxLength * 0.5) {
    breakPoint = lastPeriod + 1;
  } else if (lastNewline > maxLength * 0.5) {
    breakPoint = lastNewline;
  } else if (lastComma > maxLength * 0.5) {
    breakPoint = lastComma + 1;
  }

  return cleaned.substring(0, breakPoint).trim();
};

const ReadingCardTemplate = forwardRef(({ data, showWatermark = true }, ref) => {
  const {
    title = 'Your Reading',
    interpretation = '',
    keyMessage = '',
    hexagramNumber = '',
    date = new Date(),
    // Visual data for I Ching
    hexagram = null,     // { lines: [1,0,1...], name, vietnamese }
    // Visual data for Tarot
    cards = null,        // [{ vietnamese, meaning, icon }, ...]
    // Fortune stars
    fortune = null,
    // Divination type
    divinationType = null,  // 'iching' or 'tarot'
  } = data || {};

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Clean and truncate interpretation text for export image
  // Use truncateForExport to get a clean, properly-sized text
  const cleanInterpretation = truncateForExport(interpretation, 180);

  return (
    <View ref={ref} style={styles.container} collapsable={false}>
      <LinearGradient
        colors={['#112250', '#0F1030', '#05040B']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      >
        {/* Decorative Stars */}
        <View style={styles.starsContainer}>
          <Star size={12} color="rgba(255, 189, 89, 0.3)" style={styles.star1} />
          <Star size={8} color="rgba(255, 189, 89, 0.2)" style={styles.star2} />
          <Star size={10} color="rgba(255, 189, 89, 0.25)" style={styles.star3} />
          <Moon size={20} color="rgba(255, 189, 89, 0.15)" style={styles.moon} />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Sparkles size={28} color={COLORS.gold} />
            </View>
            <Text style={styles.headerTitle}>Gemral READING</Text>
            <Text style={styles.headerDate}>{formatDate(date)}</Text>
          </View>

          {/* Reading Title */}
          <View style={styles.titleContainer}>
            <View style={styles.titleDecor} />
            <Text style={styles.readingTitle} numberOfLines={3}>
              {title}
            </Text>
            <View style={styles.titleDecor} />
          </View>

          {/* I Ching Hexagram Visual */}
          {hexagram && (hexagram.id || hexagram.hexagramId) && (
            <HexagramVisual
              hexagramId={hexagram.id || hexagram.hexagramId}
              name={hexagram.name}
              vietnamese={hexagram.vietnamese}
            />
          )}

          {/* Tarot Cards Visual */}
          {cards && cards.length >= 3 && (
            <TarotCardsVisual cards={cards} />
          )}

          {/* Fortune Stars (for I Ching) */}
          {fortune && <FortuneStars fortune={fortune} />}

          {/* Interpretation */}
          {cleanInterpretation && (
            <View style={styles.interpretationContainer}>
              <Text style={styles.interpretationText}>
                {cleanInterpretation}
              </Text>
            </View>
          )}

          {/* Key Message - Only for non-divination cards */}
          {keyMessage && !hexagram && !cards && (
            <View style={styles.keyMessageContainer}>
              <View style={styles.quoteIcon}>
                <Text style={styles.quoteSymbol}>"</Text>
              </View>
              <Text style={styles.keyMessageText}>
                {keyMessage}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {showWatermark && (
            <View style={styles.watermark}>
              <Sparkles size={18} color="rgba(255, 189, 89, 0.6)" />
              <Text style={styles.watermarkText}>Gemral</Text>
            </View>
          )}
          <Text style={styles.website}>gemcapitalholding.com</Text>
        </View>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#05040B',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 50,
    paddingVertical: 60,
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },

  // Stars decoration
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star1: { position: 'absolute', top: 80, left: 50 },
  star2: { position: 'absolute', top: 140, right: 60 },
  star3: { position: 'absolute', top: 220, left: 100 },
  moon: { position: 'absolute', top: 100, right: 50 },

  // Header - Compact
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  headerTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 4,
    marginBottom: 10,
  },
  headerDate: {
    fontSize: 30,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Title - Compact
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 30,
  },
  titleDecor: {
    width: 140,
    height: 3,
    backgroundColor: 'rgba(255, 189, 89, 0.4)',
    marginVertical: 16,
  },
  readingTitle: {
    fontSize: 52,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 64,
  },

  // Interpretation - Auto-fit to content
  interpretationContainer: {
    backgroundColor: 'rgba(15, 16, 48, 0.7)',
    borderRadius: 24,
    padding: 36,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  interpretationText: {
    fontSize: 34,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 50,
    textAlign: 'center',
  },

  // Key Message - Only for non-divination cards
  keyMessageContainer: {
    backgroundColor: 'rgba(255, 189, 89, 0.08)',
    borderRadius: 24,
    padding: 36,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: 12,
  },
  quoteSymbol: {
    fontSize: 64,
    color: COLORS.gold,
    fontWeight: '700',
    lineHeight: 64,
  },
  keyMessageText: {
    fontSize: 38,
    color: COLORS.gold,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 54,
  },

  // Footer - Fixed at bottom
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  watermark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  watermarkText: {
    fontSize: 32,
    color: 'rgba(255, 189, 89, 0.6)',
    fontWeight: '600',
  },
  website: {
    fontSize: 26,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default ReadingCardTemplate;
