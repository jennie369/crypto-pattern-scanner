/**
 * Expo Config Plugin for react-native-callkeep
 * Adds CallKit (iOS) and ConnectionService (Android) permissions
 */

const { withAndroidManifest, withInfoPlist } = require('expo/config-plugins');

function withCallKeep(config) {
  // ========== ANDROID: ConnectionService Permissions ==========
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // Initialize uses-permission array if needed
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    // Permissions needed for CallKeep on Android
    const callKeepPermissions = [
      'android.permission.BIND_TELECOM_CONNECTION_SERVICE',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_PHONE_CALL',
      'android.permission.READ_PHONE_STATE',
      'android.permission.CALL_PHONE',
      'android.permission.MANAGE_OWN_CALLS',
      'android.permission.READ_PHONE_NUMBERS',
    ];

    // Add each permission if not already present
    callKeepPermissions.forEach((permission) => {
      const exists = manifest['uses-permission'].some(
        (perm) => perm.$?.['android:name'] === permission
      );

      if (!exists) {
        manifest['uses-permission'].push({
          $: { 'android:name': permission },
        });
      }
    });

    // Add ConnectionService to application
    const application = manifest.application?.[0];
    if (application) {
      // Initialize service array if needed
      if (!application.service) {
        application.service = [];
      }

      // Check if VoipConnectionService already exists
      const serviceExists = application.service.some(
        (service) =>
          service.$?.['android:name'] === 'io.wazo.callkeep.VoipConnectionService'
      );

      if (!serviceExists) {
        application.service.push({
          $: {
            'android:name': 'io.wazo.callkeep.VoipConnectionService',
            'android:label': 'GEM Calls',
            'android:exported': 'true',
            'android:permission': 'android.permission.BIND_TELECOM_CONNECTION_SERVICE',
          },
          'intent-filter': [
            {
              action: [
                { $: { 'android:name': 'android.telecom.ConnectionService' } },
              ],
            },
          ],
        });
      }

      // Add foreground service type for Android 14+
      const foregroundServiceExists = application.service.some(
        (service) =>
          service.$?.['android:name'] === 'io.wazo.callkeep.RNCallKeepBackgroundMessagingService'
      );

      if (!foregroundServiceExists) {
        application.service.push({
          $: {
            'android:name': 'io.wazo.callkeep.RNCallKeepBackgroundMessagingService',
            'android:foregroundServiceType': 'phoneCall',
            'android:exported': 'false',
          },
        });
      }
    }

    return config;
  });

  // ========== iOS: CallKit Background Mode ==========
  config = withInfoPlist(config, (config) => {
    // Add voip to UIBackgroundModes
    const backgroundModes = config.modResults.UIBackgroundModes || [];

    if (!backgroundModes.includes('voip')) {
      backgroundModes.push('voip');
    }

    // Ensure audio is also in background modes for call audio
    if (!backgroundModes.includes('audio')) {
      backgroundModes.push('audio');
    }

    config.modResults.UIBackgroundModes = backgroundModes;

    // Add CallKit description if needed
    if (!config.modResults.NSContactsUsageDescription) {
      config.modResults.NSContactsUsageDescription =
        'GEM uses your contacts to display caller names during calls.';
    }

    return config;
  });

  return config;
}

module.exports = withCallKeep;
