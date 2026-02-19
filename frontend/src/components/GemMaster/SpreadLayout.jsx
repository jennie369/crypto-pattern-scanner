/**
 * SpreadLayout - Web version
 * Grid layout for different tarot spreads (Celtic Cross, 3-Card, etc.)
 * Based on App's SpreadLayout.js, adapted for web container queries.
 */

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION } from '../../../../web design-tokens';
import CardFlipAnimation from './CardFlipAnimation';

const ASPECT_RATIO = 1.5;

/**
 * Calculate card positions for different spread types
 */
const calculateLayout = (cardCount, containerWidth, containerHeight, layoutType) => {
  const padding = 12;
  const availableWidth = containerWidth - padding * 2;
  const availableHeight = containerHeight - padding * 2;
  let cardWidth, cardHeight, positions = [];

  // === 1 CARD ===
  if (cardCount === 1) {
    cardHeight = Math.min(availableHeight * 0.85, 280);
    cardWidth = cardHeight / ASPECT_RATIO;
    if (cardWidth > availableWidth * 0.6) {
      cardWidth = availableWidth * 0.6;
      cardHeight = cardWidth * ASPECT_RATIO;
    }
    positions = [{ x: (availableWidth - cardWidth) / 2, y: (availableHeight - cardHeight) / 2 }];
    return { cardWidth, cardHeight, positions, padding };
  }

  // === 3 CARDS ===
  if (cardCount === 3) {
    const gap = 12;
    cardHeight = Math.min(availableHeight * 0.75, 200);
    cardWidth = cardHeight / ASPECT_RATIO;
    const totalNeeded = cardWidth * 3 + gap * 2;
    if (totalNeeded > availableWidth) {
      cardWidth = (availableWidth - gap * 2) / 3;
      cardHeight = cardWidth * ASPECT_RATIO;
    }
    const totalWidth = cardWidth * 3 + gap * 2;
    const startX = (availableWidth - totalWidth) / 2;
    const centerY = (availableHeight - cardHeight) / 2;
    for (let i = 0; i < 3; i++) {
      positions.push({ x: startX + i * (cardWidth + gap), y: centerY });
    }
    return { cardWidth, cardHeight, positions, padding };
  }

  // === 5 CARDS ===
  if (cardCount === 5) {
    const gap = 12;
    const rowGap = 16;
    cardHeight = (availableHeight - rowGap) / 2 * 0.85;
    cardWidth = cardHeight / ASPECT_RATIO;
    if (cardWidth * 3 + gap * 2 > availableWidth) {
      cardWidth = (availableWidth - gap * 2) / 3;
      cardHeight = cardWidth * ASPECT_RATIO;
    }
    const row1Width = cardWidth * 3 + gap * 2;
    const row2Width = cardWidth * 2 + gap;
    const row1StartX = (availableWidth - row1Width) / 2;
    const row2StartX = (availableWidth - row2Width) / 2;
    const totalHeight = cardHeight * 2 + rowGap;
    const startY = (availableHeight - totalHeight) / 2;
    for (let i = 0; i < 3; i++) positions.push({ x: row1StartX + i * (cardWidth + gap), y: startY });
    for (let i = 0; i < 2; i++) positions.push({ x: row2StartX + i * (cardWidth + gap), y: startY + cardHeight + rowGap });
    return { cardWidth, cardHeight, positions, padding };
  }

  // === 6 CARDS ===
  if (cardCount === 6) {
    const gap = 12;
    const rowGap = 16;
    cardHeight = (availableHeight - rowGap) / 2 * 0.85;
    cardWidth = cardHeight / ASPECT_RATIO;
    if (cardWidth * 3 + gap * 2 > availableWidth) {
      cardWidth = (availableWidth - gap * 2) / 3;
      cardHeight = cardWidth * ASPECT_RATIO;
    }
    const totalWidth = cardWidth * 3 + gap * 2;
    const startX = (availableWidth - totalWidth) / 2;
    const totalHeight = cardHeight * 2 + rowGap;
    const startY = (availableHeight - totalHeight) / 2;
    for (let i = 0; i < 6; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      positions.push({ x: startX + col * (cardWidth + gap), y: startY + row * (cardHeight + rowGap) });
    }
    return { cardWidth, cardHeight, positions, padding };
  }

  // === 10 CARDS - Celtic Cross ===
  if (layoutType === 'cross' && cardCount === 10) {
    const gap = 6;
    cardHeight = (availableHeight - gap * 3) / 4 * 0.95;
    cardWidth = cardHeight / ASPECT_RATIO;
    const crossWidth = availableWidth * 0.55;
    const staffWidth = availableWidth * 0.45;
    const crossCenterX = crossWidth / 2;
    const crossCenterY = availableHeight / 2;
    const staffX = crossWidth + staffWidth / 2;
    const staffCardGap = (availableHeight - cardHeight * 4) / 5;

    positions = [
      { x: crossCenterX - cardWidth / 2, y: crossCenterY - cardHeight - gap / 2 },
      { x: crossCenterX - cardWidth / 2, y: crossCenterY + gap / 2 },
      { x: crossCenterX - cardWidth / 2, y: crossCenterY + cardHeight + gap * 2 },
      { x: crossCenterX - cardWidth - gap * 2, y: crossCenterY - cardHeight / 2 },
      { x: crossCenterX - cardWidth / 2, y: crossCenterY - cardHeight * 2 - gap * 2 },
      { x: crossCenterX + gap * 2, y: crossCenterY - cardHeight / 2 },
      { x: staffX - cardWidth / 2, y: staffCardGap * 4 + cardHeight * 3 },
      { x: staffX - cardWidth / 2, y: staffCardGap * 3 + cardHeight * 2 },
      { x: staffX - cardWidth / 2, y: staffCardGap * 2 + cardHeight },
      { x: staffX - cardWidth / 2, y: staffCardGap },
    ];
    return { cardWidth, cardHeight, positions, padding };
  }

  // === DEFAULT GRID ===
  const cols = cardCount <= 8 ? 4 : 5;
  const rows = Math.ceil(cardCount / cols);
  const gap = 8;
  const rowGap = 12;
  cardHeight = (availableHeight - (rows - 1) * rowGap) / rows * 0.9;
  cardWidth = cardHeight / ASPECT_RATIO;
  if (cardWidth * cols + gap * (cols - 1) > availableWidth) {
    cardWidth = (availableWidth - gap * (cols - 1)) / cols;
    cardHeight = cardWidth * ASPECT_RATIO;
  }
  const totalWidth = cols * cardWidth + (cols - 1) * gap;
  const startX = (availableWidth - totalWidth) / 2;
  const totalHeight = rows * cardHeight + (rows - 1) * rowGap;
  const startY = (availableHeight - totalHeight) / 2;
  for (let i = 0; i < cardCount; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const cardsInRow = Math.min(cols, cardCount - row * cols);
    const rowStartX = cardsInRow < cols
      ? (availableWidth - (cardsInRow * cardWidth + (cardsInRow - 1) * gap)) / 2
      : startX;
    positions.push({ x: rowStartX + col * (cardWidth + gap), y: startY + row * (cardHeight + rowGap) });
  }
  return { cardWidth, cardHeight, positions, padding };
};

const SpreadLayout = ({
  spread,
  cards = [],
  flippedCards = [],
  onCardFlip,
  onCardPress,
  containerHeight = 500,
  disabled = false,
  style: customStyle,
}) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(600);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const cardCount = cards.length || spread?.cards || 3;
  const layoutType = spread?.layout_type || 'horizontal';

  const layout = useMemo(
    () => calculateLayout(cardCount, containerWidth, containerHeight, layoutType),
    [cardCount, containerWidth, containerHeight, layoutType]
  );

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={`${spread?.name || 'Tarot'} spread with ${cardCount} cards`}
      style={{
        width: '100%',
        height: containerHeight,
        position: 'relative',
        overflow: 'visible',
        ...customStyle,
      }}
    >
      {cards.map((card, index) => {
        const pos = layout.positions[index];
        if (!pos) return null;

        return (
          <motion.div
            key={`card-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08, ...ANIMATION.spring }}
            style={{
              position: 'absolute',
              left: layout.padding + pos.x,
              top: layout.padding + pos.y,
            }}
          >
            <CardFlipAnimation
              card={card}
              isFlipped={flippedCards.includes(index)}
              onFlip={(c) => onCardFlip?.(c, index)}
              onPress={(c) => onCardPress?.(c, index)}
              cardWidth={layout.cardWidth}
              cardHeight={layout.cardHeight}
              positionIndex={index + 1}
              reversed={card?.isReversed}
              disabled={disabled}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default SpreadLayout;
