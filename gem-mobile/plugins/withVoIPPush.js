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
      // Add PushKit and CallKit imports if not present
      if (!contents.includes('#import <PushKit/PushKit.h>')) {
        // Find the imports section and add PushKit + CallKit
        const importRegex = /(#import\s+["<][^">\n]+[">]\s*\n)+/;
        const match = contents.match(importRegex);

        if (match) {
          const lastImportIndex = match.index + match[0].length;
          contents =
            contents.slice(0, lastImportIndex) +
            '#import <PushKit/PushKit.h>\n' +
            '#import <CallKit/CallKit.h>\n' +
            '#if __has_include(<RNVoipPushNotification/RNVoipPushNotification.h>)\n' +
            '#import <RNVoipPushNotification/RNVoipPushNotification.h>\n' +
            '#elif __has_include("RNVoipPushNotification.h")\n' +
            '#import "RNVoipPushNotification.h"\n' +
            '#endif\n' +
            '#if __has_include(<RNCallKeep/RNCallKeep.h>)\n' +
            '#import <RNCallKeep/RNCallKeep.h>\n' +
            '#elif __has_include("RNCallKeep.h")\n' +
            '#import "RNCallKeep.h"\n' +
            '#endif\n' +
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
  @try {
    Class voipClass = NSClassFromString(@"RNVoipPushNotification");
    if (voipClass && [voipClass respondsToSelector:@selector(didUpdatePushCredentials:forType:)]) {
      [voipClass didUpdatePushCredentials:credentials forType:(NSString *)type];
      NSLog(@"[VoIPPush] Credentials updated successfully");
    } else {
      NSLog(@"[VoIPPush] RNVoipPushNotification not available");
    }
  } @catch (NSException *exception) {
    NSLog(@"[VoIPPush] Error updating credentials: %@", exception);
  }
}

- (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type {
  // Handle token invalidation if needed
}

- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
  // CRITICAL: iOS 13+ requires reporting call to CallKit IMMEDIATELY
  // Failure to do so will cause iOS to terminate the app

  @try {
    NSDictionary *payloadDict = payload.dictionaryPayload;
    NSString *callId = payloadDict[@"callId"];
    NSString *callerName = payloadDict[@"callerName"] ?: @"Cuộc gọi đến";
    NSString *callerId = payloadDict[@"callerId"] ?: @"";
    NSString *callType = payloadDict[@"callType"] ?: @"audio";
    BOOL hasVideo = [callType isEqualToString:@"video"];

    // Generate UUID for CallKit if not provided
    NSUUID *callUUID;
    if (callId && callId.length > 0) {
      callUUID = [[NSUUID alloc] initWithUUIDString:callId] ?: [NSUUID UUID];
    } else {
      callUUID = [NSUUID UUID];
      callId = [callUUID UUIDString];
    }

    NSLog(@"[VoIPPush] Received incoming call: %@, caller: %@, video: %d", callId, callerName, hasVideo);

    // IMMEDIATELY report to CallKit to show native fullscreen incoming call UI
    @try {
      Class callKeepClass = NSClassFromString(@"RNCallKeep");
      if (callKeepClass) {
        [callKeepClass reportNewIncomingCall:callUUID.UUIDString
                                      handle:callerId
                                  handleType:@"generic"
                                    hasVideo:hasVideo
                         localizedCallerName:callerName
                             supportsHolding:YES
                                supportsDTMF:YES
                            supportsGrouping:NO
                          supportsUngrouping:NO
                                 fromPushKit:YES
                                     payload:payloadDict
                       withCompletionHandler:^{
          NSLog(@"[VoIPPush] CallKit reported successfully");
        }];
      } else {
        NSLog(@"[VoIPPush] RNCallKeep not available");
      }
    } @catch (NSException *callKitException) {
      NSLog(@"[VoIPPush] CallKit error: %@", callKitException);
    }

    // Also notify RNVoipPushNotification for JS handling
    @try {
      Class voipClass = NSClassFromString(@"RNVoipPushNotification");
      if (voipClass) {
        [voipClass didReceiveIncomingPushWithPayload:payload forType:(NSString *)type];
      }
    } @catch (NSException *voipException) {
      NSLog(@"[VoIPPush] VoIP notification error: %@", voipException);
    }
  } @catch (NSException *exception) {
    NSLog(@"[VoIPPush] Error handling incoming push: %@", exception);
  }

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

      // Register for VoIP push in didFinishLaunchingWithOptions
      // This ensures VoIP is registered early, before JS loads
      if (!contents.includes('voipRegistry')) {
        const didFinishRegex =
          /(-\s*\(BOOL\)application:.*didFinishLaunchingWithOptions:.*\{)/;
        const match = contents.match(didFinishRegex);

        if (match) {
          const insertPosition = match.index + match[0].length;
          const voipRegistration = `
  // Register for VoIP push notifications (PushKit)
  // Token will be sent to JS via RNVoipPushNotification
  @try {
    PKPushRegistry *voipRegistry = [[PKPushRegistry alloc] initWithQueue:dispatch_get_main_queue()];
    voipRegistry.delegate = self;
    voipRegistry.desiredPushTypes = [NSSet setWithObject:PKPushTypeVoIP];
    NSLog(@"[VoIPPush] PKPushRegistry initialized");
  } @catch (NSException *exception) {
    NSLog(@"[VoIPPush] Failed to initialize PKPushRegistry: %@", exception);
  }
`;
          contents =
            contents.slice(0, insertPosition) +
            voipRegistration +
            contents.slice(insertPosition);
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
