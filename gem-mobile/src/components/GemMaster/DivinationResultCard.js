/**
 * GEM Mobile - Divination Result Card
 * Visual card for I Ching hexagram and Tarot results in chat
 * For social sharing viral feature
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Moon, Sun, Share2, Sparkles } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import { getCardImage } from '../../assets/tarot';
import { getHexagramImage } from '../../assets/iching';

/**
 * I Ching Hexagram Visual - Now with real card images
 */
const HexagramVisual = ({ hexagramId, name, vietnamese, imageUri, imageSource }) => {
  // Try multiple sources for image
  const hexagramImage = hexagramId ? getHexagramImage(hexagramId) : null;

  // Determine which image source to use
  const finalImageSource = imageSource || hexagramImage;
  const hasImage = !!finalImageSource || !!imageUri;

  console.log('[HexagramVisual] hexagramId:', hexagramId, 'hasImage:', hasImage);

  return (
    <View style={styles.hexagramContainer}>
      <View style={styles.hexagramCard}>
        {hasImage ? (
          <Image
            source={imageUri ? { uri: imageUri } : finalImageSource}
            style={styles.hexagramImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['rgba(255, 189, 89, 0.2)', 'rgba(106, 91, 255, 0.1)']}
            style={styles.hexagramFallback}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Star size={24} color={COLORS.gold} />
          </LinearGradient>
        )}
        {/* Card name overlay */}
        <View style={styles.hexagramNameOverlay}>
          <Text style={styles.hexagramName}>{name}</Text>
          <Text style={styles.hexagramVietnamese}>{vietnamese}</Text>
        </View>
      </View>
    </View>
  );
};

/**
 * Tarot Cards Visual (3 cards) - Now with real images
 */
const TarotCardsVisual = ({ cards }) => {
  const positions = ['Quá khứ', 'Hiện tại', 'Tương lai'];

  return (
    <View style={styles.tarotContainer}>
      {cards.map((card, index) => {
        // Get real card image using card.id
        const cardImage = card.id !== undefined ? getCardImage(card.id) : null;

        // Determine which image source to use
        const finalImageSource = card.imageSource || cardImage;
        const hasImage = !!finalImageSource || !!card.imageUri;

        console.log('[TarotCardsVisual] card:', card.vietnamese, 'id:', card.id, 'hasImage:', hasImage);

        return (
          <View key={index} style={styles.tarotCardWrapper}>
            <Text style={styles.positionLabel}>{positions[index]}</Text>
            <View style={styles.tarotCard}>
              {hasImage ? (
                <Image
                  source={card.imageUri ? { uri: card.imageUri } : finalImageSource}
                  style={styles.tarotCardImage}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={['rgba(255, 189, 89, 0.3)', 'rgba(106, 91, 255, 0.2)']}
                  style={styles.tarotCardFallback}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Star size={20} color={COLORS.gold} />
                </LinearGradient>
              )}
              {/* Card name overlay */}
              <View style={styles.tarotCardNameOverlay}>
                <Text style={styles.tarotCardName} numberOfLines={1}>
                  {card.vietnamese}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

/**
 * Fortune Stars
 */
const FortuneStars = ({ fortune }) => (
  <View style={styles.fortuneContainer}>
    <Text style={styles.fortuneLabel}>Độ may mắn:</Text>
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text
          key={star}
          style={[styles.star, star <= fortune && styles.starActive]}
        >
          ★
        </Text>
      ))}
    </View>
  </View>
);

/**
 * Main Divination Result Card
 * @param {string} type - 'iching' | 'tarot'
 * @param {Object} data - Divination result data
 * @param {Function} onExportPress - Callback to open export preview modal with visual card
 */
const DivinationResultCard = ({ type, data, onShare, onExportPress }) => {
  if (!data) return null;

  // Use export preview for visual sharing (preferred), fallback to text share
  const handleShare = async () => {
    // If onExportPress is provided, use it to open the beautiful export preview
    if (onExportPress) {
      onExportPress();
      return;
    }

    // Fallback: text-only share if no export callback
    try {
      let shareContent = '';

      if (type === 'iching') {
        shareContent = `🔮 Kết quả Kinh Dịch - Gemral\n\n` +
          `Quẻ: ${data.name} (${data.vietnamese})\n` +
          `Ý nghĩa: ${data.meaning}\n\n` +
          `${data.interpretation?.general || ''}\n\n` +
          `💡 Lời khuyên: ${data.interpretation?.advice || ''}\n\n` +
          `⭐ Độ may mắn: ${'★'.repeat(data.interpretation?.fortune || 3)}${'☆'.repeat(5 - (data.interpretation?.fortune || 3))}\n\n` +
          `📲 Tải app Gemral để xem quẻ của bạn!`;
      } else if (type === 'tarot') {
        const cards = data.cards || [];
        shareContent = `🃏 Kết quả Tarot - Gemral\n\n` +
          `Trải bài 3 lá:\n` +
          `• Quá khứ: ${cards[0]?.vietnamese || ''}\n` +
          `• Hiện tại: ${cards[1]?.vietnamese || ''}\n` +
          `• Tương lai: ${cards[2]?.vietnamese || ''}\n\n` +
          `${data.interpretation?.summary || ''}\n\n` +
          `💡 Lời khuyên: ${data.interpretation?.advice || ''}\n\n` +
          `📲 Tải app Gemral để bốc bài của bạn!`;
      }

      await Share.share({
        message: shareContent,
        title: type === 'iching' ? 'Kết quả Kinh Dịch' : 'Kết quả Tarot',
      });

      if (onShare) onShare();
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Sparkles size={16} color={COLORS.gold} />
        <Text style={styles.headerTitle}>
          {type === 'iching' ? '🔮 Kết quả Kinh Dịch' : '🃏 Kết quả Tarot'}
        </Text>
      </View>

      {/* Visual */}
      {type === 'iching' && (data.id || data.hexagramId) && (
        <HexagramVisual
          hexagramId={data.id || data.hexagramId}
          name={data.name}
          vietnamese={data.vietnamese}
          imageUri={data.imageUri}
          imageSource={data.imageSource}
        />
      )}

      {type === 'tarot' && data.cards && (
        <TarotCardsVisual cards={data.cards} />
      )}

      {/* Fortune (for I Ching) */}
      {type === 'iching' && data.interpretation?.fortune && (
        <FortuneStars fortune={data.interpretation.fortune} />
      )}

      {/* Share Button */}
      <TouchableOpacity
        style={styles.shareButton}
        onPress={handleShare}
        activeOpacity={0.7}
      >
        <Share2 size={14} color={COLORS.gold} />
        <Text style={styles.shareText}>Chia sẻ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(15, 16, 48, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },

  // Hexagram Visual - Real card image
  hexagramContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  hexagramCard: {
    width: 130,
    height: 190,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gold,
    overflow: 'hidden',
    position: 'relative',
  },
  hexagramImage: {
    width: '100%',
    height: '100%',
  },
  hexagramFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexagramNameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  hexagramName: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    textAlign: 'center',
  },
  hexagramVietnamese: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },

  // Tarot Cards
  tarotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  tarotCardWrapper: {
    alignItems: 'center',
  },
  positionLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tarotCard: {
    width: 75,
    height: 110,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.gold,
    overflow: 'hidden',
    position: 'relative',
  },
  tarotCardImage: {
    width: '100%',
    height: '100%',
  },
  tarotCardFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tarotCardNameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  tarotCardName: {
    fontSize: 8,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },

  // Fortune Stars
  fortuneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  fortuneLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.2)',
  },
  starActive: {
    color: COLORS.gold,
  },

  // Share Button
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },
  shareText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
});

export default DivinationResultCard;
