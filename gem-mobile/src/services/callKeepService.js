/**
 * CallKeep Service
 * Manages native call UI via CallKit (iOS) and ConnectionService (Android)
 *
 * This service provides:
 * - Native incoming call UI (full-screen on lock screen)
 * - Outgoing call integration with system call log
 * - Mute/speaker controls from native UI
 * - Call state synchronization with native layer
 *
 * Requirements:
 * - react-native-callkeep installed
 * - Config plugins applied (withCallKeep.js)
 * - App built with expo-dev-client (not Expo Go)
 */

import { Platform, AppState } from 'react-native';
import { supabase } from './supabase';

// Dynamic import to handle cases when CallKeep isn't available
let RNCallKeep = null;
try {
  RNCallKeep = require('react-native-callkeep').default;
} catch (e) {
  console.log('[CallKeep] react-native-callkeep not available:', e.message);
}

class CallKeepService {
  constructor() {
    this.isSetup = false;
    this.isAvailable = RNCallKeep !== null;
    this.currentCallUUID = null;

    // Callbacks from native UI events
    this.onAnswerCallback = null;
    this.onEndCallback = null;
    this.onMuteCallback = null;
    this.onHoldCallback = null;
    this.onDTMFCallback = null;

    // Track call states
    this.activeCalls = new Map(); // uuid -> call info
  }

  // ========== AVAILABILITY CHECK ==========

  /**
   * Check if CallKeep is available
   * @returns {boolean}
   */
  get available() {
    return this.isAvailable && this.isSetup;
  }

  // ========== SETUP ==========

  /**
   * Initialize CallKeep with configuration
   * Call this once when app starts
   * @returns {Promise<boolean>} Setup success
   */
  async setup() {
    if (!this.isAvailable) {
      console.log('[CallKeep] Not available, skipping setup');
      return false;
    }

    if (this.isSetup) {
      console.log('[CallKeep] Already setup');
      return true;
    }

    const options = {
      ios: {
        appName: 'GEM',
        supportsVideo: true,
        maximumCallGroups: 1,
        maximumCallsPerCallGroup: 1,
        // Ringtone configured in native code
        includesCallsInRecents: true,
      },
      android: {
        alertTitle: 'Quyền truy cập cuộc gọi',
        alertDescription: 'GEM cần quyền để hiển thị cuộc gọi đến',
        cancelButton: 'Hủy',
        okButton: 'Đồng ý',
        imageName: 'phone_account_icon',
        // Self-managed mode for more control
        selfManaged: true,
        additionalPermissions: [],
        // Foreground service for Android 14+
        foregroundService: {
          channelId: 'com.gemral.mobile.call',
          channelName: 'GEM Calls',
          notificationTitle: 'Cuộc gọi đang diễn ra',
          notificationIcon: 'ic_notification',
        },
      },
    };

    try {
      await RNCallKeep.setup(options);
      this.isSetup = true;
      this._registerListeners();

      // Check and request phone account on Android
      if (Platform.OS === 'android') {
        const hasPhoneAccount = await RNCallKeep.hasPhoneAccount();
        if (!hasPhoneAccount) {
          await RNCallKeep.registerPhoneAccount();
          await RNCallKeep.registerAndroidEvents();
        }

        // Check default dialer permission
        const hasDefaultDialer = await RNCallKeep.hasDefaultPhoneAccount();
        if (!hasDefaultDialer) {
          // This will prompt user to set as default phone app
          // Only do this if absolutely necessary
          console.log('[CallKeep] Not default dialer, some features may be limited');
        }
      }

      console.log('[CallKeep] Setup successful');
      return true;
    } catch (error) {
      console.error('[CallKeep] Setup failed:', error);
      this.isSetup = false;
      return false;
    }
  }

  // ========== EVENT LISTENERS ==========

  /**
   * Register native event listeners
   * @private
   */
  _registerListeners() {
    if (!RNCallKeep) return;

    // Answer call from native UI (user tapped accept)
    RNCallKeep.addEventListener('answerCall', this._onAnswerCall);

    // End call from native UI (user tapped decline/hangup)
    RNCallKeep.addEventListener('endCall', this._onEndCall);

    // Mute toggle from native UI
    RNCallKeep.addEventListener('didPerformSetMutedCallAction', this._onMuteCall);

    // Hold toggle from native UI
    RNCallKeep.addEventListener('didToggleHoldCallAction', this._onHoldCall);

    // DTMF tones
    RNCallKeep.addEventListener('didPerformDTMFAction', this._onDTMF);

    // Audio route changes (speaker, bluetooth, etc)
    RNCallKeep.addEventListener('didChangeAudioRoute', this._onAudioRouteChanged);

    // iOS: Audio session activated
    RNCallKeep.addEventListener('didActivateAudioSession', this._onAudioSessionActivated);

    // iOS: Audio session deactivated
    RNCallKeep.addEventListener('didDeactivateAudioSession', this._onAudioSessionDeactivated);

    // Call state changes
    RNCallKeep.addEventListener('didDisplayIncomingCall', this._onDisplayIncomingCall);

    // Android only: Show incoming call UI (this event doesn't exist on iOS)
    if (Platform.OS === 'android') {
      try {
        RNCallKeep.addEventListener('showIncomingCallUi', this._onShowIncomingCallUI);
      } catch (e) {
        console.log('[CallKeep] showIncomingCallUi event not supported');
      }
    }

    // Android: Check reachability
    RNCallKeep.addEventListener('checkReachability', this._onCheckReachability);

    console.log('[CallKeep] Event listeners registered');
  }

  // ========== EVENT HANDLERS ==========

  _onAnswerCall = ({ callUUID }) => {
    console.log('[CallKeep] Answer call event:', callUUID);
    this.currentCallUUID = callUUID;

    // Get call info
    const callInfo = this.activeCalls.get(callUUID);

    if (this.onAnswerCallback) {
      this.onAnswerCallback(callUUID, callInfo);
    }
  };

  _onEndCall = ({ callUUID }) => {
    console.log('[CallKeep] End call event:', callUUID);

    // Get call info before removing
    const callInfo = this.activeCalls.get(callUUID);

    if (this.onEndCallback) {
      this.onEndCallback(callUUID, callInfo);
    }

    // Clean up
    this.activeCalls.delete(callUUID);
    if (this.currentCallUUID === callUUID) {
      this.currentCallUUID = null;
    }
  };

  _onMuteCall = ({ muted, callUUID }) => {
    console.log('[CallKeep] Mute event:', { muted, callUUID });

    if (this.onMuteCallback) {
      this.onMuteCallback(muted, callUUID);
    }
  };

  _onHoldCall = ({ hold, callUUID }) => {
    console.log('[CallKeep] Hold event:', { hold, callUUID });

    if (this.onHoldCallback) {
      this.onHoldCallback(hold, callUUID);
    }
  };

  _onDTMF = ({ digits, callUUID }) => {
    console.log('[CallKeep] DTMF event:', { digits, callUUID });

    if (this.onDTMFCallback) {
      this.onDTMFCallback(digits, callUUID);
    }
  };

  _onAudioRouteChanged = ({ output }) => {
    console.log('[CallKeep] Audio route changed:', output);
    // output can be: 'Speaker', 'Receiver', 'Bluetooth', 'Headphones', etc.
  };

  _onAudioSessionActivated = () => {
    console.log('[CallKeep] Audio session activated');
    // Start WebRTC audio here
  };

  _onAudioSessionDeactivated = () => {
    console.log('[CallKeep] Audio session deactivated');
    // Stop WebRTC audio here
  };

  _onDisplayIncomingCall = ({ error, callUUID, handle, localizedCallerName }) => {
    console.log('[CallKeep] Display incoming call:', {
      error,
      callUUID,
      handle,
      localizedCallerName,
    });

    if (error) {
      console.error('[CallKeep] Display incoming call error:', error);
    }
  };

  _onShowIncomingCallUI = ({ handle, callUUID, name }) => {
    console.log('[CallKeep] Show incoming call UI (Android):', { handle, callUUID, name });
  };

  _onCheckReachability = () => {
    // Android: Report that app is reachable
    if (RNCallKeep) {
      RNCallKeep.setReachable();
    }
  };

  // ========== PUBLIC METHODS - INCOMING CALL ==========

  /**
   * Display incoming call notification
   * Called when VoIP push or realtime event received
   *
   * @param {string} callUUID - Unique call identifier (usually call.id from database)
   * @param {string} callerName - Display name for caller
   * @param {boolean} hasVideo - Is this a video call
   * @param {string} callerNumber - Optional phone number or handle
   * @param {Object} additionalInfo - Additional call info to store
   */
  displayIncomingCall(
    callUUID,
    callerName,
    hasVideo = false,
    callerNumber = '',
    additionalInfo = {}
  ) {
    if (!this.available) {
      console.log('[CallKeep] Not available, cannot display incoming call');
      return false;
    }

    console.log('[CallKeep] Display incoming call:', {
      callUUID,
      callerName,
      hasVideo,
    });

    // Store call info
    this.activeCalls.set(callUUID, {
      uuid: callUUID,
      callerName,
      hasVideo,
      callerNumber,
      isIncoming: true,
      ...additionalInfo,
    });

    this.currentCallUUID = callUUID;

    // Display native incoming call UI
    RNCallKeep.displayIncomingCall(
      callUUID,
      callerNumber || callerName, // handle
      callerName, // localizedCallerName
      'generic', // handleType: 'generic', 'number', 'email'
      hasVideo, // hasVideo
      null // options (iOS only)
    );

    return true;
  }

  // ========== PUBLIC METHODS - OUTGOING CALL ==========

  /**
   * Report outgoing call started
   *
   * @param {string} callUUID - Unique call identifier
   * @param {string} calleeName - Display name for callee
   * @param {boolean} hasVideo - Is this a video call
   * @param {string} calleeNumber - Optional phone number or handle
   */
  startCall(callUUID, calleeName, hasVideo = false, calleeNumber = '') {
    if (!this.available) {
      console.log('[CallKeep] Not available, cannot start call');
      return false;
    }

    console.log('[CallKeep] Start outgoing call:', {
      callUUID,
      calleeName,
      hasVideo,
    });

    // Store call info
    this.activeCalls.set(callUUID, {
      uuid: callUUID,
      calleeName,
      hasVideo,
      calleeNumber,
      isIncoming: false,
    });

    this.currentCallUUID = callUUID;

    // Report to system
    RNCallKeep.startCall(
      callUUID,
      calleeNumber || calleeName, // handle
      calleeName, // contactIdentifier
      'generic', // handleType
      hasVideo // hasVideo
    );

    return true;
  }

  // ========== PUBLIC METHODS - CALL STATE ==========

  /**
   * Report call connected (both parties connected)
   * @param {string} callUUID - Call UUID (optional, uses current if not provided)
   */
  reportConnected(callUUID = null) {
    const uuid = callUUID || this.currentCallUUID;
    if (!uuid || !this.available) return;

    console.log('[CallKeep] Report connected:', uuid);
    RNCallKeep.setCurrentCallActive(uuid);

    // Update stored call info
    const callInfo = this.activeCalls.get(uuid);
    if (callInfo) {
      callInfo.isConnected = true;
      callInfo.connectedAt = Date.now();
    }
  }

  /**
   * Report call connecting (ringing, waiting for answer)
   * @param {string} callUUID - Call UUID
   */
  reportConnecting(callUUID = null) {
    const uuid = callUUID || this.currentCallUUID;
    if (!uuid || !this.available) return;

    console.log('[CallKeep] Report connecting:', uuid);

    if (Platform.OS === 'android') {
      // Android: Update connection state
      RNCallKeep.setConnectionState(uuid, RNCallKeep.CONSTANTS?.CONNECTING || 1);
    }
  }

  /**
   * End call
   * @param {string} callUUID - Call UUID (optional, uses current if not provided)
   */
  endCall(callUUID = null) {
    const uuid = callUUID || this.currentCallUUID;
    if (!uuid) return;

    console.log('[CallKeep] End call:', uuid);

    if (this.available) {
      RNCallKeep.endCall(uuid);
    }

    // Clean up
    this.activeCalls.delete(uuid);
    if (this.currentCallUUID === uuid) {
      this.currentCallUUID = null;
    }
  }

  /**
   * End all active calls
   */
  endAllCalls() {
    console.log('[CallKeep] End all calls');

    if (this.available) {
      RNCallKeep.endAllCalls();
    }

    // Clean up
    this.activeCalls.clear();
    this.currentCallUUID = null;
  }

  /**
   * Report call ended (for missed/declined/failed calls)
   * Use this when the call ends without user action on this device
   * @param {string} callUUID - Call UUID
   */
  reportEndCall(callUUID) {
    if (!callUUID || !this.available) return;

    console.log('[CallKeep] Report end call:', callUUID);
    RNCallKeep.reportEndCallWithUUID(callUUID, RNCallKeep.CONSTANTS?.END_CALL_REASONS?.REMOTE_ENDED || 2);

    // Clean up
    this.activeCalls.delete(callUUID);
    if (this.currentCallUUID === callUUID) {
      this.currentCallUUID = null;
    }
  }

  // ========== PUBLIC METHODS - MEDIA CONTROLS ==========

  /**
   * Set call on hold
   * @param {string} callUUID - Call UUID
   * @param {boolean} hold - Hold state
   */
  setOnHold(callUUID = null, hold = true) {
    const uuid = callUUID || this.currentCallUUID;
    if (!uuid || !this.available) return;

    console.log('[CallKeep] Set on hold:', { uuid, hold });
    RNCallKeep.setOnHold(uuid, hold);
  }

  /**
   * Set mute state
   * @param {string} callUUID - Call UUID
   * @param {boolean} muted - Mute state
   */
  setMuted(callUUID = null, muted = true) {
    const uuid = callUUID || this.currentCallUUID;
    if (!uuid || !this.available) return;

    console.log('[CallKeep] Set muted:', { uuid, muted });
    RNCallKeep.setMutedCall(uuid, muted);
  }

  /**
   * Update display name during call
   * @param {string} callUUID - Call UUID
   * @param {string} displayName - New display name
   * @param {string} handle - New handle/number
   */
  updateDisplay(callUUID = null, displayName, handle) {
    const uuid = callUUID || this.currentCallUUID;
    if (!uuid || !this.available) return;

    console.log('[CallKeep] Update display:', { uuid, displayName });
    RNCallKeep.updateDisplay(uuid, displayName, handle);
  }

  // ========== CALLBACK SETTERS ==========

  /**
   * Set callback for when user answers call from native UI
   * @param {Function} callback - (callUUID, callInfo) => void
   */
  setOnAnswerCallback(callback) {
    this.onAnswerCallback = callback;
  }

  /**
   * Set callback for when user ends/declines call from native UI
   * @param {Function} callback - (callUUID, callInfo) => void
   */
  setOnEndCallback(callback) {
    this.onEndCallback = callback;
  }

  /**
   * Set callback for mute toggle from native UI
   * @param {Function} callback - (muted, callUUID) => void
   */
  setOnMuteCallback(callback) {
    this.onMuteCallback = callback;
  }

  /**
   * Set callback for hold toggle from native UI
   * @param {Function} callback - (hold, callUUID) => void
   */
  setOnHoldCallback(callback) {
    this.onHoldCallback = callback;
  }

  // ========== UTILITY ==========

  /**
   * Get call info by UUID
   * @param {string} callUUID - Call UUID
   * @returns {Object|null} Call info
   */
  getCallInfo(callUUID) {
    return this.activeCalls.get(callUUID) || null;
  }

  /**
   * Get current call UUID
   * @returns {string|null}
   */
  getCurrentCallUUID() {
    return this.currentCallUUID;
  }

  /**
   * Check if there's an active call
   * @returns {boolean}
   */
  hasActiveCall() {
    return this.activeCalls.size > 0;
  }

  /**
   * Generate a new UUID for calls
   * @returns {string}
   */
  generateUUID() {
    // Use crypto.randomUUID if available, otherwise fallback
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback UUID v4 generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // ========== CLEANUP ==========

  /**
   * Remove all event listeners
   * Call when app is closing or CallKeep no longer needed
   */
  cleanup() {
    if (!RNCallKeep) return;

    console.log('[CallKeep] Cleaning up');

    RNCallKeep.removeEventListener('answerCall');
    RNCallKeep.removeEventListener('endCall');
    RNCallKeep.removeEventListener('didPerformSetMutedCallAction');
    RNCallKeep.removeEventListener('didToggleHoldCallAction');
    RNCallKeep.removeEventListener('didPerformDTMFAction');
    RNCallKeep.removeEventListener('didChangeAudioRoute');
    RNCallKeep.removeEventListener('didActivateAudioSession');
    RNCallKeep.removeEventListener('didDeactivateAudioSession');
    RNCallKeep.removeEventListener('didDisplayIncomingCall');
    RNCallKeep.removeEventListener('showIncomingCallUi');
    RNCallKeep.removeEventListener('checkReachability');

    this.activeCalls.clear();
    this.currentCallUUID = null;
    this.isSetup = false;
  }
}

// Export singleton instance
const callKeepService = new CallKeepService();
export default callKeepService;
export { callKeepService };
