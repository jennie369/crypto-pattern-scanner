/**
 * Gemral - I Ching Hexagram Images
 * Real I Ching hexagram card images
 * 64 hexagrams + card back design
 */

// All 64 Hexagrams
export const HEXAGRAMS = {
  1: require('./hexagram_01.jpg'),
  2: require('./hexagram_02.jpg'),
  3: require('./hexagram_03.jpg'),
  4: require('./hexagram_04.jpg'),
  5: require('./hexagram_05.jpg'),
  6: require('./hexagram_06.jpg'),
  7: require('./hexagram_07.jpg'),
  8: require('./hexagram_08.jpg'),
  9: require('./hexagram_09.jpg'),
  10: require('./hexagram_10.jpg'),
  11: require('./hexagram_11.jpg'),
  12: require('./hexagram_12.jpg'),
  13: require('./hexagram_13.jpg'),
  14: require('./hexagram_14.jpg'),
  15: require('./hexagram_15.jpg'),
  16: require('./hexagram_16.jpg'),
  17: require('./hexagram_17.jpg'),
  18: require('./hexagram_18.jpg'),
  19: require('./hexagram_19.jpg'),
  20: require('./hexagram_20.jpg'),
  21: require('./hexagram_21.jpg'),
  22: require('./hexagram_22.jpg'),
  23: require('./hexagram_23.jpg'),
  24: require('./hexagram_24.jpg'),
  25: require('./hexagram_25.jpg'),
  26: require('./hexagram_26.jpg'),
  27: require('./hexagram_27.jpg'),
  28: require('./hexagram_28.jpg'),
  29: require('./hexagram_29.jpg'),
  30: require('./hexagram_30.jpg'),
  31: require('./hexagram_31.jpg'),
  32: require('./hexagram_32.jpg'),
  33: require('./hexagram_33.jpg'),
  34: require('./hexagram_34.jpg'),
  35: require('./hexagram_35.jpg'),
  36: require('./hexagram_36.jpg'),
  37: require('./hexagram_37.jpg'),
  38: require('./hexagram_38.jpg'),
  39: require('./hexagram_39.jpg'),
  40: require('./hexagram_40.jpg'),
  41: require('./hexagram_41.jpg'),
  42: require('./hexagram_42.jpg'),
  43: require('./hexagram_43.jpg'),
  44: require('./hexagram_44.jpg'),
  45: require('./hexagram_45.jpg'),
  46: require('./hexagram_46.jpg'),
  47: require('./hexagram_47.jpg'),
  48: require('./hexagram_48.jpg'),
  49: require('./hexagram_49.jpg'),
  50: require('./hexagram_50.jpg'),
  51: require('./hexagram_51.jpg'),
  52: require('./hexagram_52.jpg'),
  53: require('./hexagram_53.jpg'),
  54: require('./hexagram_54.jpg'),
  55: require('./hexagram_55.jpg'),
  56: require('./hexagram_56.jpg'),
  57: require('./hexagram_57.jpg'),
  58: require('./hexagram_58.jpg'),
  59: require('./hexagram_59.jpg'),
  60: require('./hexagram_60.jpg'),
  61: require('./hexagram_61.jpg'),
  62: require('./hexagram_62.jpg'),
  63: require('./hexagram_63.jpg'),
  64: require('./hexagram_64.jpg'),
};

// Card back design
export const CARD_BACK = require('./card_back.jpg');

// Screen background - mystical I Ching wheel
export const ICHING_BACKGROUND = require('./iching_background.jpg.jpeg');

/**
 * Get hexagram image by number (1-64)
 */
export const getHexagramImage = (hexagramNumber) => {
  const num = parseInt(hexagramNumber, 10);
  if (num >= 1 && num <= 64) {
    return HEXAGRAMS[num];
  }
  return null;
};

/**
 * Get card back image
 */
export const getCardBack = () => CARD_BACK;

export default {
  HEXAGRAMS,
  CARD_BACK,
  ICHING_BACKGROUND,
  getHexagramImage,
  getCardBack,
};
