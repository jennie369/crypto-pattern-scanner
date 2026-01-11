/**
 * Expo Config Plugin to fix AndroidManifest conflicts
 * Adds tools:replace for appComponentFactory to resolve AndroidX vs support library conflicts
 */

const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withAndroidManifestFix(config) {
  return withAndroidManifest(config, async (config) => {
    const mainApplication = config.modResults.manifest.application[0];

    // Add tools namespace if not present
    if (!config.modResults.manifest.$['xmlns:tools']) {
      config.modResults.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // Add tools:replace for appComponentFactory
    if (!mainApplication.$['tools:replace']) {
      mainApplication.$['tools:replace'] = 'android:appComponentFactory';
    } else if (!mainApplication.$['tools:replace'].includes('android:appComponentFactory')) {
      mainApplication.$['tools:replace'] += ',android:appComponentFactory';
    }

    // Ensure android:appComponentFactory uses AndroidX
    mainApplication.$['android:appComponentFactory'] = 'androidx.core.app.CoreComponentFactory';

    return config;
  });
};
