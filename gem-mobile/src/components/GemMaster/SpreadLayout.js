/**
 * SpreadLayout Component
 * Properly centered card layouts for all spread types
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { CARD_BACK } from '../../assets/tarot';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Calculate proper card dimensions and positions
const calculateLayout = (cardCount, containerHeight, layoutType) => {
  const horizontalPadding = 12;
  const verticalPadding = 8;
  const availableWidth = SCREEN_WIDTH - (horizontalPadding * 2);
  const availableHeight = containerHeight - (verticalPadding * 2);
  const aspectRatio = 1.5; // Tarot card aspect ratio

  let cardWidth, cardHeight, positions = [];

  // ==== 1 CARD - Large centered ====
  if (cardCount === 1) {
    // Make card as large as possible while fitting in container
    cardHeight = Math.min(availableHeight * 0.85, 280);
    cardWidth = cardHeight / aspectRatio;

    // Ensure it fits width
    if (cardWidth > availableWidth * 0.6) {
      cardWidth = availableWidth * 0.6;
      cardHeight = cardWidth * aspectRatio;
    }

    positions = [{
      x: (availableWidth - cardWidth) / 2,
      y: (availableHeight - cardHeight) / 2,
    }];

    return { cardWidth, cardHeight, positions, horizontalPadding, verticalPadding };
  }

  // ==== 3 CARDS - Single row, large ====
  if (cardCount === 3) {
    const gap = 12;

    // Calculate max card size - use more of container height
    cardHeight = Math.min(availableHeight * 0.75, 200);
    cardWidth = cardHeight / aspectRatio;

    // Ensure 3 cards fit horizontally
    const totalWidthNeeded = cardWidth * 3 + gap * 2;
    if (totalWidthNeeded > availableWidth) {
      cardWidth = (availableWidth - gap * 2) / 3;
      cardHeight = cardWidth * aspectRatio;
    }

    const totalWidth = cardWidth * 3 + gap * 2;
    const startX = (availableWidth - totalWidth) / 2;
    const centerY = (availableHeight - cardHeight) / 2;

    for (let i = 0; i < 3; i++) {
      positions.push({
        x: startX + i * (cardWidth + gap),
        y: centerY,
      });
    }

    return { cardWidth, cardHeight, positions, horizontalPadding, verticalPadding };
  }

  // ==== 5 CARDS - 2 rows: 3 on top, 2 on bottom ====
  if (cardCount === 5) {
    const gap = 12;
    const rowGap = 16;

    // Calculate card size to fit 2 rows
    cardHeight = (availableHeight - rowGap) / 2 * 0.85;
    cardWidth = cardHeight / aspectRatio;

    // Ensure 3 cards fit horizontally
    const totalWidthNeeded = cardWidth * 3 + gap * 2;
    if (totalWidthNeeded > availableWidth) {
      cardWidth = (availableWidth - gap * 2) / 3;
      cardHeight = cardWidth * aspectRatio;
    }

    const row1Width = cardWidth * 3 + gap * 2;
    const row2Width = cardWidth * 2 + gap;
    const row1StartX = (availableWidth - row1Width) / 2;
    const row2StartX = (availableWidth - row2Width) / 2;
    const totalHeight = cardHeight * 2 + rowGap;
    const startY = (availableHeight - totalHeight) / 2;

    // Row 1: 3 cards
    for (let i = 0; i < 3; i++) {
      positions.push({
        x: row1StartX + i * (cardWidth + gap),
        y: startY,
      });
    }
    // Row 2: 2 cards centered
    for (let i = 0; i < 2; i++) {
      positions.push({
        x: row2StartX + i * (cardWidth + gap),
        y: startY + cardHeight + rowGap,
      });
    }

    return { cardWidth, cardHeight, positions, horizontalPadding, verticalPadding };
  }

  // ==== 6 CARDS - 2 rows: 3 + 3 ====
  if (cardCount === 6) {
    const gap = 12;
    const rowGap = 16;

    // Calculate card size to fit 2 rows
    cardHeight = (availableHeight - rowGap) / 2 * 0.85;
    cardWidth = cardHeight / aspectRatio;

    // Ensure 3 cards fit horizontally
    const totalWidthNeeded = cardWidth * 3 + gap * 2;
    if (totalWidthNeeded > availableWidth) {
      cardWidth = (availableWidth - gap * 2) / 3;
      cardHeight = cardWidth * aspectRatio;
    }

    const totalWidth = cardWidth * 3 + gap * 2;
    const startX = (availableWidth - totalWidth) / 2;
    const totalHeight = cardHeight * 2 + rowGap;
    const startY = (availableHeight - totalHeight) / 2;

    for (let i = 0; i < 6; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      positions.push({
        x: startX + col * (cardWidth + gap),
        y: startY + row * (cardHeight + rowGap),
      });
    }

    return { cardWidth, cardHeight, positions, horizontalPadding, verticalPadding };
  }

  // ==== 10 CARDS - Celtic Cross ====
  if (layoutType === 'cross' && cardCount === 10) {
    const gap = 6;

    // Calculate card size - staff needs 4 cards, cross needs 4 cards vertically
    cardHeight = (availableHeight - gap * 3) / 4 * 0.95;
    cardWidth = cardHeight / aspectRatio;

    // Cross section takes about 55% width, staff takes 45%
    const crossWidth = availableWidth * 0.55;
    const staffWidth = availableWidth * 0.45;

    // Cross center point
    const crossCenterX = crossWidth / 2;
    const crossCenterY = availableHeight / 2;

    // Staff X position (centered in right section)
    const staffX = crossWidth + staffWidth / 2;

    // Staff positions - evenly distributed vertically
    const staffCardGap = (availableHeight - cardHeight * 4) / 5;

    positions = [
      // Cross pattern (left section)
      // 1 - Center top (Situation)
      { x: crossCenterX - cardWidth / 2, y: crossCenterY - cardHeight - gap / 2 },
      // 2 - Center bottom (Challenge)
      { x: crossCenterX - cardWidth / 2, y: crossCenterY + gap / 2 },
      // 3 - Bottom (Foundation)
      { x: crossCenterX - cardWidth / 2, y: crossCenterY + cardHeight + gap * 2 },
      // 4 - Left (Past)
      { x: crossCenterX - cardWidth - gap * 2, y: crossCenterY - cardHeight / 2 },
      // 5 - Top (Crown)
      { x: crossCenterX - cardWidth / 2, y: crossCenterY - cardHeight * 2 - gap * 2 },
      // 6 - Right (Future)
      { x: crossCenterX + gap * 2, y: crossCenterY - cardHeight / 2 },

      // Staff (right section, bottom to top: 7, 8, 9, 10)
      { x: staffX - cardWidth / 2, y: staffCardGap * 4 + cardHeight * 3 },
      { x: staffX - cardWidth / 2, y: staffCardGap * 3 + cardHeight * 2 },
      { x: staffX - cardWidth / 2, y: staffCardGap * 2 + cardHeight },
      { x: staffX - cardWidth / 2, y: staffCardGap },
    ];

    return { cardWidth, cardHeight, positions, horizontalPadding, verticalPadding };
  }

  // ==== DEFAULT GRID (7+ cards) ====
  const cols = cardCount <= 8 ? 4 : 5;
  const rows = Math.ceil(cardCount / cols);
  const gap = 8;
  const rowGap = 12;

  cardHeight = (availableHeight - (rows - 1) * rowGap) / rows * 0.9;
  cardWidth = cardHeight / aspectRatio;

  if (cardWidth * cols + gap * (cols - 1) > availableWidth) {
    cardWidth = (availableWidth - gap * (cols - 1)) / cols;
    cardHeight = cardWidth * aspectRatio;
  }

  const totalWidth = cols * cardWidth + (cols - 1) * gap;
  const startX = (availableWidth - totalWidth) / 2;
  const totalHeight = rows * cardHeight + (rows - 1) * rowGap;
  const startY = (availableHeight - totalHeight) / 2;

  for (let i = 0; i < cardCount; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const cardsInRow = Math.min(cols, cardCount - row * cols);
    const rowStartX = (cardsInRow < cols)
      ? (availableWidth - (cardsInRow * cardWidth + (cardsInRow - 1) * gap)) / 2
      : startX;

    positions.push({
      x: rowStartX + col * (cardWidth + gap),
      y: startY + row * (cardHeight + rowGap),
    });
  }

  return { cardWidth, cardHeight, positions, horizontalPadding, verticalPadding };
};

// Simple Card component
const SimpleCard = ({
  card,
  index,
  isFlipped,
  onFlip,
  onPress,
  cardWidth,
  cardHeight,
  disabled,
}) => {
  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isFlipped && onFlip) {
      onFlip(card, index);
    } else if (isFlipped && onPress) {
      onPress(card, index);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.9}
      style={[styles.cardTouchable, { width: cardWidth, height: cardHeight }]}
    >
      {/* Position badge - top right */}
      <View style={styles.positionBadge}>
        <Text style={styles.positionBadgeText}>{index + 1}</Text>
      </View>

      {/* Card content */}
      <View style={[styles.cardInner, { width: cardWidth - 4, height: cardHeight - 4 }]}>
        {isFlipped && card?.image ? (
          <Image
            source={typeof card.image === 'string' ? { uri: card.image } : card.image}
            style={[
              styles.cardImage,
              { width: cardWidth - 8, height: cardHeight - 8 },
              card?.isReversed && styles.cardReversed,
            ]}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.cardBack}>
            <Image
              source={CARD_BACK}
              style={[styles.cardBackImage, { width: cardWidth - 8, height: cardHeight - 8 }]}
              resizeMode="cover"
            />
            <View style={styles.tapHintOverlay}>
              <Text style={styles.tapHint}>Chạm để lật</Text>
            </View>
          </View>
        )}
      </View>

      {/* Reversed indicator */}
      {isFlipped && card?.isReversed && (
        <View style={styles.reversedBadge}>
          <Text style={styles.reversedText}>Ngược</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const SpreadLayout = ({
  spread,
  cards = [],
  flippedCards = [],
  onCardFlip,
  onCardPress,
  containerHeight = 400,
  disabled = false,
}) => {
  const cardCount = cards.length || spread?.cards || 3;
  const layoutType = spread?.layout_type || 'horizontal';

  // Calculate layout
  const layout = useMemo(() => {
    return calculateLayout(cardCount, containerHeight, layoutType);
  }, [cardCount, containerHeight, layoutType]);

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      {cards.map((card, index) => {
        const pos = layout.positions[index];
        if (!pos) return null;

        return (
          <View
            key={`card-${index}`}
            style={[
              styles.cardWrapper,
              {
                left: layout.horizontalPadding + pos.x,
                top: layout.verticalPadding + pos.y,
              },
            ]}
          >
            <SimpleCard
              card={card}
              index={index}
              isFlipped={flippedCards.includes(index)}
              onFlip={onCardFlip}
              onPress={onCardPress}
              cardWidth={layout.cardWidth}
              cardHeight={layout.cardHeight}
              disabled={disabled}
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    position: 'relative',
    overflow: 'visible', // Allow badges to show outside container
  },
  cardWrapper: {
    position: 'absolute',
    overflow: 'visible', // Allow badges to show outside card wrapper
  },
  cardTouchable: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: '#1A0A2E',
    overflow: 'visible', // Allow badge to show outside
  },
  cardInner: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  cardImage: {
    borderRadius: 4,
    margin: 2,
  },
  cardReversed: {
    transform: [{ rotate: '180deg' }],
  },
  cardBack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardBackImage: {
    borderRadius: 4,
  },
  tapHintOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 2,
  },
  cardBackDesign: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  starInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFD700',
    opacity: 0.5,
  },
  tapHint: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  positionBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#6A5BFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#1A0A2E',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  positionBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  reversedBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(156, 6, 18, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reversedText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default SpreadLayout;
