// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(
  // Video formats
  'mp4',
  'mov',
  'webm',
  // Lottie
  'json',
  // Fonts
  'ttf',
  'otf',
);

// Ensure source extensions include all necessary formats
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config;
