/**
 * Rituals Index - Vision Board 2.0
 * Export all ritual screens
 * Created: December 10, 2025
 */

export { default as HeartExpansionRitual } from './HeartExpansionRitual';
export { default as GratitudeFlowRitual } from './GratitudeFlowRitual';
export { default as CleansingBreathRitual } from './CleansingBreathRitual';
export { default as WaterManifestRitual } from './WaterManifestRitual';
export { default as LetterToUniverseRitual } from './LetterToUniverseRitual';

// Ritual mapping for navigation
export const RITUAL_SCREENS = {
  'heart-expansion': 'HeartExpansionRitual',
  'gratitude-flow': 'GratitudeFlowRitual',
  'cleansing-breath': 'CleansingBreathRitual',
  'water-manifest': 'WaterManifestRitual',
  'letter-to-universe': 'LetterToUniverseRitual',
};
