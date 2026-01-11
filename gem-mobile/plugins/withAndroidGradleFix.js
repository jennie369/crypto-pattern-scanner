/**
 * Expo Config Plugin to fix Gradle dependencies
 * Excludes old Android support library and forces AndroidX
 */

const { withAppBuildGradle } = require('expo/config-plugins');

const withAndroidGradleFix = (config) => {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // Add configurations block at the end of the file
    if (!contents.includes('// AndroidX Fix')) {
      const fixBlock = `

// AndroidX Fix - Exclude old support library
configurations.all {
    exclude group: 'com.android.support'
}
`;
      config.modResults.contents = contents + fixBlock;
    }

    return config;
  });
};

module.exports = withAndroidGradleFix;
