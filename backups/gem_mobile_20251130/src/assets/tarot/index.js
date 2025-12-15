/**
 * Gemral - Tarot Card Images
 * Real Rider-Waite Tarot card images
 * 78 cards total: 22 Major Arcana + 56 Minor Arcana
 */

// Major Arcana (22 cards)
export const MAJOR_ARCANA = {
  0: require('./major/MW_The_Fool.jpg'),
  1: require('./major/MW_The_Magician.jpg'),
  2: require('./major/MW_The_High_Priestess.jpg'),
  3: require('./major/MW_The_Empress.jpg'),
  4: require('./major/MW_The_Emperor.jpg'),
  5: require('./major/MW_The_Hierophant.jpg'),
  6: require('./major/MW_The_Lovers.jpg'),
  7: require('./major/MW_The_Chariot.jpg'),
  8: require('./major/MW_Strength.jpg'),
  9: require('./major/MW_The_Hermit.jpg'),
  10: require('./major/MW_Wheel_of_Fortune.jpg'),
  11: require('./major/MW_Justice.jpg'),
  12: require('./major/MW_The_Hangedman.jpg'),
  13: require('./major/MW_Death.jpg'),
  14: require('./major/MW_Temperance.jpg'),
  15: require('./major/MW_The_Devil.jpg'),
  16: require('./major/MW_The_Tower.jpg'),
  17: require('./major/MW_The_Star.jpg'),
  18: require('./major/MW_The_Moon.jpg'),
  19: require('./major/MW_The_Sun.jpg'),
  20: require('./major/MW_Judgement.jpg'),
  21: require('./major/MW_The_World.jpg'),
};

// Minor Arcana - Wands (14 cards)
export const WANDS = {
  1: require('./minor/MW_Ace_of_Wands.jpg'),
  2: require('./minor/MW_Two_of_Wands.jpg'),
  3: require('./minor/MW_Three_of_Wands.jpg'),
  4: require('./minor/MW_Four_of_Wands.jpg'),
  5: require('./minor/MW_Five_of_Wands.jpg'),
  6: require('./minor/MW_Six_of_Wands.jpg'),
  7: require('./minor/MW_Seven_of_Wands.jpg'),
  8: require('./minor/MW_Eight_of_Wands.jpg'),
  9: require('./minor/MW_Nine_of_Wands.jpg'),
  10: require('./minor/MW_Ten_of_Wands.jpg'),
  11: require('./minor/MW_Page_of_Wands.jpg'),
  12: require('./minor/MW_Knight_of_Wands.jpg'),
  13: require('./minor/MW_Queen_of_Wands.jpg'),
  14: require('./minor/MW_King_of_Wands.jpg'),
};

// Minor Arcana - Cups (14 cards)
export const CUPS = {
  1: require('./minor/MW_Ace_of_Cups.jpg'),
  2: require('./minor/MW_Two_of_Cups.jpg'),
  3: require('./minor/MW_Three_of_Cups.jpg'),
  4: require('./minor/MW_Four_of_Cups.jpg'),
  5: require('./minor/MW_Five_of_Cups.jpg'),
  6: require('./minor/MW_Six_of_Cups.jpg'),
  7: require('./minor/MW_Seven_of_Cups.jpg'),
  8: require('./minor/MW_Eight_of_Cups.jpg'),
  9: require('./minor/MW_Nine_of_Cups.jpg'),
  10: require('./minor/MW_Ten_of_Cups.jpg'),
  11: require('./minor/MW_Page_of_Cups.jpg'),
  12: require('./minor/MW_Knight_of_Cups.jpg'),
  13: require('./minor/MW_Queen_of_Cups.jpg'),
  14: require('./minor/MW_King_of_Cups.jpg'),
};

// Minor Arcana - Swords (14 cards)
export const SWORDS = {
  1: require('./minor/MW_Ace_of_Sword.jpg'),
  2: require('./minor/MW_Two_of_Swords.jpg'),
  3: require('./minor/MW_Three_of_Swords.jpg'),
  4: require('./minor/MW_Four_of_Swords.jpg'),
  5: require('./minor/MW_Five_of_Swords.jpg'),
  6: require('./minor/MW_Six_of_Swords.jpg'),
  7: require('./minor/MW_Seven_of_Swords.jpg'),
  8: require('./minor/MW_Eight_of_Swords.jpg'),
  9: require('./minor/MW_Nine_of_Swords.jpg'),
  10: require('./minor/MW_Ten_of_Swords.jpg'),
  11: require('./minor/MW_Page_of_Swords.jpg'),
  12: require('./minor/MW_Knight_of_Swords.jpg'),
  13: require('./minor/MW_Queen_of_Swords.jpg'),
  14: require('./minor/MW_King_of_Swords.jpg'),
};

// Minor Arcana - Pentacles (14 cards)
export const PENTACLES = {
  1: require('./minor/MW_Ace_of_Pentacles.jpg'),
  2: require('./minor/MW_Two_of_Pentacles.jpg'),
  3: require('./minor/MW_Three_of_Pentacles.jpg'),
  4: require('./minor/MW_Four_of_Pentacles.jpg'),
  5: require('./minor/MW_Five_of_Pentacles.jpg'),
  6: require('./minor/MW_Six_of_Pentacles.jpg'),
  7: require('./minor/MW_Seven_of_Pentacles.jpg'),
  8: require('./minor/MW_Eight_of_Pentacles.jpg'),
  9: require('./minor/MW_Nine_of_Pentacles.jpg'),
  10: require('./minor/MW_Ten_of_Pentacles.jpg'),
  11: require('./minor/MW_Page_of_Pentacles.jpg'),
  12: require('./minor/MW_Knight_of_Pentacles.jpg'),
  13: require('./minor/MW_Queen_of_Pentacles.jpg'),
  14: require('./minor/MW_King_of_Pentacles.jpg'),
};

/**
 * Get card image by card ID (0-77)
 * 0-21: Major Arcana
 * 22-35: Wands
 * 36-49: Cups
 * 50-63: Swords
 * 64-77: Pentacles
 */
export const getCardImage = (cardId) => {
  if (cardId >= 0 && cardId <= 21) {
    return MAJOR_ARCANA[cardId];
  } else if (cardId >= 22 && cardId <= 35) {
    return WANDS[cardId - 21]; // 22 -> 1, 35 -> 14
  } else if (cardId >= 36 && cardId <= 49) {
    return CUPS[cardId - 35]; // 36 -> 1, 49 -> 14
  } else if (cardId >= 50 && cardId <= 63) {
    return SWORDS[cardId - 49]; // 50 -> 1, 63 -> 14
  } else if (cardId >= 64 && cardId <= 77) {
    return PENTACLES[cardId - 63]; // 64 -> 1, 77 -> 14
  }
  return null;
};

/**
 * Get card image by arcana type and number
 */
export const getCardImageByType = (arcana, number) => {
  switch (arcana) {
    case 'major':
      return MAJOR_ARCANA[number];
    case 'wands':
      return WANDS[number];
    case 'cups':
      return CUPS[number];
    case 'swords':
      return SWORDS[number];
    case 'pentacles':
      return PENTACLES[number];
    default:
      return null;
  }
};

export default {
  MAJOR_ARCANA,
  WANDS,
  CUPS,
  SWORDS,
  PENTACLES,
  getCardImage,
  getCardImageByType,
};
