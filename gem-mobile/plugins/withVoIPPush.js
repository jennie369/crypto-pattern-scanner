/**
 * Expo Config Plugin for react-native-voip-push-notification
 * Adds PushKit (iOS) support for VoIP push notifications
 *
 * Note: This plugin modifies the AppDelegate to add PushKit imports and delegates.
 * For full VoIP push support, you also need to:
 * 1. Create a VoIP Services Certificate in Apple Developer Portal
 * 2. Enable "Push Notifications" capability in Xcode
 * 3. Enable "Voice over IP" in Background Modes
 */

const {
  withAppDelegate,
  withEntitlementsPlist,
  withInfoPlist,
} = require('expo/config-plugins');

function withVoIPPush(config) {
  // ========== iOS: AppDelegate Modifications ==========
  config = withAppDelegate(config, (config) => {
    let contents = config.modResults.contents;

    // Check if this is Objective-C (AppDelegate.m) or Swift (AppDelegate.swift)
    const isObjC =
      config.modResults.path?.endsWith('.m') ||
      config.modResults.path?.endsWith('.mm');

    if (isObjC) {
      // Add PushKit import if not present
      if (!contents.includes('#import <PushKit/PushKit.h>')) {
        // Find the imports section and add PushKit
        const importRegex = /(#import\s+["<][^">\n]+[">]\s*\n)+/;
        const match = contents.match(importRegex);

        if (match) {
          const lastImportIndex = match.index + match[0].length;
          contents =
            contents.slice(0, lastImportIndex) +
            '#import <PushKit/PushKit.h>\n' +
            '#import <RNVoipPushNotification.h>\n' +
            contents.slice(lastImportIndex);
        }
      }

      // Add PKPushRegistryDelegate protocol if not present
      if (!contents.includes('PKPushRegistryDelegate')) {
        contents = contents.replace(
          /@interface\s+AppDelegate\s*:\s*([^<\n]+)(<[^>]*>)?/,
          (match, superclass, protocols) => {
            if (protocols) {
              // Already has protocols, add PKPushRegistryDelegate
              const newProtocols = protocols.replace('>', ', PKPushRegistryDelegate>');
              return `@interface AppDelegate : ${superclass}${newProtocols}`;
            } else {
              // No protocols yet
              return `@interface AppDelegate : ${superclass}<PKPushRegistryDelegate>`;
            }
          }
        );
      }

      // Add PKPushRegistry delegate methods if not present
      if (!contents.includes('didUpdatePushCredentials')) {
        // Find the @end of implementation to add methods before it
        const implementationEndIndex = contents.lastIndexOf('@end');

        if (implementationEndIndex !== -1) {
          const voipMethods = `
#pragma mark - PushKit (VoIP Push)

- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(PKPushType)type {
  [RNVoipPushNotification didUpdatePushCredentials:credentials forType:(NSString *)type];
}

- (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type {
  // Handle token invalidation if needed
}

- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
  // Process VoIP push - must report call to CallKit within this method
  NSString *uuid = payload.dictionaryPayload[@"callId"];
  NSString *callerName = payload.dictionaryPayload[@"callerName"];
  NSString *callType = payload.dictionaryPayload[@"callType"];
  BOOL hasVideo = [callType isEqualToString:@"video"];

  // Notify RNVoipPushNotification
  [RNVoipPushNotification didReceiveIncomingPushWithPayload:payload forType:(NSString *)type];

  // Must call completion handler
  completion();
}

`;
          contents =
            contents.slice(0, implementationEndIndex) +
            voipMethods +
            contents.slice(implementationEndIndex);
        }
      }

      // Add VoIP registration in didFinishLaunchingWithOptions if not present
      if (!contents.includes('PKPushRegistry') || !contents.includes('voipRegistry')) {
        const didFinishRegex =
          /(-\s*\(BOOL\)application:.*didFinishLaunchingWithOptions:.*\{)/;
        const match = contents.match(didFinishRegex);

        if (match) {
          const insertPosition = match.index + match[0].length;
          const voipRegistration = `
  // Register for VoIP push notifications
  PKPushRegistry *voipRegistry = [[PKPushRegistry alloc] initWithQueue:dispatch_get_main_queue()];
  voipRegistry.delegate = self;
  voipRegistry.desiredPushTypes = [NSSet setWithObject:PKPushTypeVoIP];
`;
          // Only add if not already present
          if (!contents.includes('voipRegistry')) {
            contents =
              contents.slice(0, insertPosition) +
              voipRegistration +
              contents.slice(insertPosition);
          }
        }
      }
    }
    // Swift support would go here if needed

    config.modResults.contents = contents;
    return config;
  });

  // ========== iOS: Entitlements ==========
  config = withEntitlementsPlist(config, (config) => {
    // Enable push notifications
    config.modResults['aps-environment'] =
      config.modResults['aps-environment'] || 'development';

    return config;
  });

  // ========== iOS: Info.plist ==========
  config = withInfoPlist(config, (config) => {
    // Ensure UIBackgroundModes includes voip
    const backgroundModes = config.modResults.UIBackgroundModes || [];

    if (!backgroundModes.includes('voip')) {
      backgroundModes.push('voip');
    }

    if (!backgroundModes.includes('remote-notification')) {
      backgroundModes.push('remote-notification');
    }

    config.modResults.UIBackgroundModes = backgroundModes;

    return config;
  });

  return config;
}

module.exports = withVoIPPush;
