/**
 * Call Service
 * Handles call lifecycle management, database operations, and push notifications
 *
 * REQUIREMENTS:
 * - react-native-webrtc must be installed
 * - App must be built with expo-dev-client (not Expo Go)
 * - Proper permissions for camera/microphone
 */

import { supabase } from './supabase';
import { callSignalingService } from './callSignalingService';
import { webrtcService } from './webrtcService';
import { Platform } from 'react-native';
import {
  CALL_STATUS,
  PARTICIPANT_STATUS,
  PARTICIPANT_ROLE,
  CALL_TYPE,
  CALL_TIMEOUTS,
  END_REASON,
  CALL_EVENT_TYPE,
  getIncomingCallChannelName,
} from '../constants/callConstants';

class CallService {
  constructor() {
    this.currentCallId = null;
    this.callTimeoutId = null;
    this.incomingCallSubscription = null;
  }

  // ========== CALL INITIATION ==========

  /**
   * Khởi tạo cuộc gọi mới
   * @param {string} conversationId - Conversation ID
   * @param {string} calleeId - ID người nhận
   * @param {string} callType - 'audio' hoặc 'video'
   * @returns {Promise<{success: boolean, call?: Object, error?: string}>}
   */
  async initiateCall(conversationId, calleeId, callType = CALL_TYPE.AUDIO) {
    try {
      // Check if WebRTC is available
      if (!webrtcService.isAvailable) {
        console.error('[CallService] WebRTC not available');
        return {
          success: false,
          error: 'Tính năng gọi điện chưa khả dụng. Vui lòng cập nhật ứng dụng.'
        };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      console.log('[CallService] Initiating call:', { conversationId, calleeId, callType });

      // 1. Check if already in a call
      if (this.currentCallId) {
        return { success: false, error: 'Bạn đang trong cuộc gọi khác' };
      }

      // 2. Check if callee is already in a call
      const { data: activeCall } = await supabase
        .from('call_participants')
        .select('call_id, calls!inner(status)')
        .eq('user_id', calleeId)
        .in('status', [PARTICIPANT_STATUS.CONNECTED, PARTICIPANT_STATUS.RINGING])
        .single();

      if (activeCall) {
        return { success: false, error: 'Người nhận đang bận' };
      }

      // 3. Create call record
      const { data: call, error: callError } = await supabase
        .from('calls')
        .insert({
          conversation_id: conversationId,
          caller_id: user.id,
          call_type: callType,
          status: CALL_STATUS.INITIATING,
        })
        .select()
        .single();

      if (callError) throw callError;

      this.currentCallId = call.id;

      // 4. Add participants
      const { error: participantError } = await supabase
        .from('call_participants')
        .insert([
          {
            call_id: call.id,
            user_id: user.id,
            role: PARTICIPANT_ROLE.CALLER,
            status: PARTICIPANT_STATUS.CONNECTING,
            device_type: Platform.OS,
          },
          {
            call_id: call.id,
            user_id: calleeId,
            role: PARTICIPANT_ROLE.CALLEE,
            status: PARTICIPANT_STATUS.INVITED,
          },
        ]);

      if (participantError) throw participantError;

      // 5. Log event
      await this._logEvent(call.id, CALL_EVENT_TYPE.CALL_INITIATED, {
        callType,
        calleeId,
      });

      // 6. Update status to ringing
      await supabase
        .from('calls')
        .update({
          status: CALL_STATUS.RINGING,
          ring_started_at: new Date().toISOString(),
        })
        .eq('id', call.id);

      // 7. Update callee participant status
      await supabase
        .from('call_participants')
        .update({ status: PARTICIPANT_STATUS.RINGING })
        .eq('call_id', call.id)
        .eq('user_id', calleeId);

      // 8. Send push notification to callee
      await this._sendCallNotification(calleeId, call, user);

      // 9. Start ring timeout
      this._startRingTimeout(call.id);

      // 10. Log ringing event
      await this._logEvent(call.id, CALL_EVENT_TYPE.CALL_RINGING, {});

      console.log('[CallService] Call initiated successfully:', call.id);

      return { success: true, call };
    } catch (error) {
      console.error('[CallService] initiateCall error:', error);
      this.currentCallId = null;
      return { success: false, error: error.message };
    }
  }

  // ========== CALL ANSWERING ==========

  /**
   * Trả lời cuộc gọi
   * @param {string} callId - Call ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async answerCall(callId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      console.log('[CallService] Answering call:', callId);

      this.currentCallId = callId;

      // 1. Update call status
      const { error: callError } = await supabase
        .from('calls')
        .update({
          status: CALL_STATUS.CONNECTING,
        })
        .eq('id', callId);

      if (callError) throw callError;

      // 2. Update participant status
      await supabase
        .from('call_participants')
        .update({
          status: PARTICIPANT_STATUS.CONNECTING,
          device_type: Platform.OS,
        })
        .eq('call_id', callId)
        .eq('user_id', user.id);

      // 3. Log event
      await this._logEvent(callId, CALL_EVENT_TYPE.CALL_ANSWERED, {});

      return { success: true };
    } catch (error) {
      console.error('[CallService] answerCall error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark call as connected
   * @param {string} callId - Call ID
   */
  async markConnected(callId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Clear ring timeout
      this._clearRingTimeout();

      // Update call
      await supabase
        .from('calls')
        .update({
          status: CALL_STATUS.CONNECTED,
          started_at: new Date().toISOString(),
        })
        .eq('id', callId);

      // Update participant
      await supabase
        .from('call_participants')
        .update({
          status: PARTICIPANT_STATUS.CONNECTED,
          joined_at: new Date().toISOString(),
        })
        .eq('call_id', callId)
        .eq('user_id', user.id);

      // Log event
      await this._logEvent(callId, CALL_EVENT_TYPE.CALL_CONNECTED, {});

      console.log('[CallService] Call marked as connected:', callId);
    } catch (error) {
      console.error('[CallService] markConnected error:', error);
    }
  }

  // ========== CALL DECLINING ==========

  /**
   * Từ chối cuộc gọi
   * @param {string} callId - Call ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async declineCall(callId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      console.log('[CallService] Declining call:', callId);

      // Update call status
      await supabase
        .from('calls')
        .update({
          status: CALL_STATUS.DECLINED,
          ended_at: new Date().toISOString(),
          end_reason: END_REASON.DECLINED,
        })
        .eq('id', callId);

      // Update participant status
      await supabase
        .from('call_participants')
        .update({ status: PARTICIPANT_STATUS.DECLINED })
        .eq('call_id', callId)
        .eq('user_id', user.id);

      // Send end signal
      await callSignalingService.sendEnd(END_REASON.DECLINED);

      // Log event
      await this._logEvent(callId, CALL_EVENT_TYPE.CALL_DECLINED, {});

      // Cleanup
      this._cleanup();

      return { success: true };
    } catch (error) {
      console.error('[CallService] declineCall error:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== CALL ENDING ==========

  /**
   * Kết thúc cuộc gọi
   * @param {string} callId - Call ID
   * @param {string} reason - Lý do kết thúc
   * @returns {Promise<{success: boolean, duration?: number, error?: string}>}
   */
  async endCall(callId, reason = END_REASON.NORMAL) {
    try {
      console.log('[CallService] Ending call:', callId, reason);

      // Use database function to end call
      const { data, error } = await supabase.rpc('end_call', {
        p_call_id: callId,
        p_end_reason: reason,
      });

      if (error) throw error;

      // Send end signal
      await callSignalingService.sendEnd(reason);

      // Cleanup WebRTC
      webrtcService.cleanup();
      await callSignalingService.cleanup();

      // Cleanup local state
      this._cleanup();

      console.log('[CallService] Call ended successfully:', data);

      return { success: true, duration: data?.duration || 0 };
    } catch (error) {
      console.error('[CallService] endCall error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Hủy cuộc gọi (caller hủy trước khi callee trả lời)
   * @param {string} callId - Call ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async cancelCall(callId) {
    try {
      console.log('[CallService] Cancelling call:', callId);

      await supabase
        .from('calls')
        .update({
          status: CALL_STATUS.CANCELLED,
          ended_at: new Date().toISOString(),
          end_reason: END_REASON.CANCELLED,
        })
        .eq('id', callId);

      // Send end signal
      await callSignalingService.sendEnd(END_REASON.CANCELLED);

      // Log event
      await this._logEvent(callId, CALL_EVENT_TYPE.CALL_CANCELLED, {});

      // Cleanup
      webrtcService.cleanup();
      await callSignalingService.cleanup();
      this._cleanup();

      return { success: true };
    } catch (error) {
      console.error('[CallService] cancelCall error:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== MEDIA CONTROLS ==========

  /**
   * Toggle mute
   * @param {string} callId - Call ID
   * @param {boolean} isMuted - Mute state
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async toggleMute(callId, isMuted) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Update local WebRTC
      webrtcService.toggleMute(isMuted);

      // Send signal to peer
      await callSignalingService.sendMuteChange(isMuted);

      // Update database
      await supabase
        .from('call_participants')
        .update({ is_muted: isMuted })
        .eq('call_id', callId)
        .eq('user_id', user.id);

      // Log event
      await this._logEvent(callId, CALL_EVENT_TYPE.MUTE_TOGGLED, { isMuted });

      return { success: true };
    } catch (error) {
      console.error('[CallService] toggleMute error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle speaker
   * @param {string} callId - Call ID
   * @param {boolean} isSpeakerOn - Speaker state
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async toggleSpeaker(callId, isSpeakerOn) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Update local WebRTC
      await webrtcService.toggleSpeaker(isSpeakerOn);

      // Update database
      await supabase
        .from('call_participants')
        .update({ is_speaker_on: isSpeakerOn })
        .eq('call_id', callId)
        .eq('user_id', user.id);

      // Log event
      await this._logEvent(callId, CALL_EVENT_TYPE.SPEAKER_TOGGLED, { isSpeakerOn });

      return { success: true };
    } catch (error) {
      console.error('[CallService] toggleSpeaker error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle video
   * @param {string} callId - Call ID
   * @param {boolean} isVideoEnabled - Video state
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async toggleVideo(callId, isVideoEnabled) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Update local WebRTC
      webrtcService.toggleVideo(isVideoEnabled);

      // Send signal to peer
      await callSignalingService.sendVideoChange(isVideoEnabled);

      // Update database
      await supabase
        .from('call_participants')
        .update({ is_video_enabled: isVideoEnabled })
        .eq('call_id', callId)
        .eq('user_id', user.id);

      // Log event
      await this._logEvent(callId, CALL_EVENT_TYPE.VIDEO_TOGGLED, { isVideoEnabled });

      return { success: true };
    } catch (error) {
      console.error('[CallService] toggleVideo error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upgrade từ audio call sang video call
   * @param {string} callId - Call ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async upgradeToVideo(callId) {
    try {
      console.log('[CallService] Upgrading to video call:', callId);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Enable video on WebRTC
      const success = await webrtcService.enableVideo(true);
      if (!success) {
        return { success: false, error: 'Không thể bật camera' };
      }

      // Update database - call type
      await supabase
        .from('calls')
        .update({ call_type: CALL_TYPE.VIDEO })
        .eq('id', callId);

      // Update participant video state
      await supabase
        .from('call_participants')
        .update({ is_video_enabled: true })
        .eq('call_id', callId)
        .eq('user_id', user.id);

      // Notify other party via signaling
      await callSignalingService.sendVideoChange(true);

      // Log event
      await this._logEvent(callId, CALL_EVENT_TYPE.VIDEO_TOGGLED, {
        enabled: true,
        upgraded: true
      });

      return { success: true };

    } catch (error) {
      console.error('[CallService] upgradeToVideo error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Switch camera front/back
   * @param {string} callId - Call ID
   * @returns {Promise<{success: boolean, isFrontCamera?: boolean, error?: string}>}
   */
  async switchCamera(callId) {
    try {
      const isFrontCamera = await webrtcService.switchCamera();

      if (isFrontCamera === null) {
        return { success: false, error: 'Không thể chuyển camera' };
      }

      // Log event
      await this._logEvent(callId, CALL_EVENT_TYPE.CAMERA_SWITCHED, {
        isFrontCamera
      });

      return { success: true, isFrontCamera };

    } catch (error) {
      console.error('[CallService] switchCamera error:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== CALL HISTORY ==========

  /**
   * Lấy lịch sử cuộc gọi
   * @param {number} limit - Số lượng
   * @param {number} offset - Offset
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async getCallHistory(limit = 50, offset = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { data, error } = await supabase.rpc('get_call_history', {
        p_user_id: user.id,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('[CallService] getCallHistory error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a single call by ID
   * @param {string} callId - Call ID
   * @returns {Promise<{success: boolean, call?: Object, error?: string}>}
   */
  async getCall(callId) {
    try {
      const { data: call, error } = await supabase
        .from('calls')
        .select(`
          *,
          caller:profiles!caller_id(id, display_name, avatar_url),
          participants:call_participants(
            *,
            user:profiles(id, display_name, avatar_url)
          )
        `)
        .eq('id', callId)
        .single();

      if (error) throw error;

      return { success: true, call };
    } catch (error) {
      console.error('[CallService] getCall error:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== INCOMING CALL SUBSCRIPTION ==========

  /**
   * Subscribe to incoming calls for a user
   * @param {string} userId - User ID
   * @param {Function} onIncomingCall - Callback when incoming call received
   * @returns {Function} Unsubscribe function
   */
  subscribeToIncomingCalls(userId, onIncomingCall) {
    console.log('[CallService] Subscribing to incoming calls for:', userId);

    const channel = supabase
      .channel(getIncomingCallChannelName(userId))
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_participants',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // Check if this is an incoming call (role = callee, status = ringing)
          if (
            payload.new.role === PARTICIPANT_ROLE.CALLEE &&
            payload.new.status === PARTICIPANT_STATUS.RINGING
          ) {
            console.log('[CallService] Incoming call detected:', payload.new.call_id);

            // Fetch full call info
            const { call } = await this.getCall(payload.new.call_id);

            if (call && call.status === CALL_STATUS.RINGING) {
              onIncomingCall(call);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[CallService] Incoming call subscription status:', status);
      });

    this.incomingCallSubscription = channel;

    // Return unsubscribe function
    return () => {
      console.log('[CallService] Unsubscribing from incoming calls');
      supabase.removeChannel(channel);
      this.incomingCallSubscription = null;
    };
  }

  // ========== PUSH NOTIFICATIONS ==========

  /**
   * Send push notification for incoming call
   * @param {string} userId - Target user ID
   * @param {Object} call - Call object
   * @param {Object} caller - Caller profile
   * @private
   */
  async _sendCallNotification(userId, call, caller) {
    try {
      // Get user's push token
      const { data: profile } = await supabase
        .from('profiles')
        .select('expo_push_token')
        .eq('id', userId)
        .single();

      if (!profile?.expo_push_token) {
        console.log('[CallService] No push token for user:', userId);
        return;
      }

      // Send via Supabase Edge Function
      await supabase.functions.invoke('send-push-notification', {
        body: {
          token: profile.expo_push_token,
          title: caller.display_name || 'Cuộc gọi đến',
          body: call.call_type === CALL_TYPE.VIDEO
            ? 'Cuộc gọi video đến'
            : 'Cuộc gọi thoại đến',
          data: {
            type: 'incoming_call',
            callId: call.id,
            callerId: caller.id,
            callerName: caller.display_name,
            callerAvatar: caller.avatar_url,
            callType: call.call_type,
            conversationId: call.conversation_id,
          },
          channelId: 'incoming_call',
          priority: 'high',
          sound: 'ringtone.wav',
        },
      });

      console.log('[CallService] Push notification sent to:', userId);
    } catch (error) {
      console.error('[CallService] sendCallNotification error:', error);
    }
  }

  // ========== TIMEOUTS ==========

  /**
   * Start ring timeout (60s)
   * @param {string} callId - Call ID
   * @private
   */
  _startRingTimeout(callId) {
    this._clearRingTimeout();

    this.callTimeoutId = setTimeout(async () => {
      console.log('[CallService] Ring timeout reached for call:', callId);

      // Mark as missed
      await supabase.rpc('mark_call_missed', { p_call_id: callId });

      // Cleanup
      webrtcService.cleanup();
      await callSignalingService.cleanup();
      this._cleanup();
    }, CALL_TIMEOUTS.RING_TIMEOUT);
  }

  /**
   * Clear ring timeout
   * @private
   */
  _clearRingTimeout() {
    if (this.callTimeoutId) {
      clearTimeout(this.callTimeoutId);
      this.callTimeoutId = null;
    }
  }

  // ========== HELPERS ==========

  /**
   * Log call event
   * @param {string} callId - Call ID
   * @param {string} eventType - Event type
   * @param {Object} metadata - Event metadata
   * @private
   */
  async _logEvent(callId, eventType, metadata = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('call_events').insert({
        call_id: callId,
        user_id: user?.id,
        event_type: eventType,
        metadata,
      });
    } catch (error) {
      console.error('[CallService] logEvent error:', error);
    }
  }

  /**
   * Cleanup local state
   * @private
   */
  _cleanup() {
    this._clearRingTimeout();
    this.currentCallId = null;
  }

  /**
   * Check if currently in a call
   * @returns {boolean}
   */
  isInCall() {
    return this.currentCallId !== null;
  }

  /**
   * Get current call ID
   * @returns {string|null}
   */
  getCurrentCallId() {
    return this.currentCallId;
  }

  /**
   * Full cleanup
   */
  async fullCleanup() {
    if (this.currentCallId) {
      await this.endCall(this.currentCallId, END_REASON.NORMAL);
    }
    if (this.incomingCallSubscription) {
      await supabase.removeChannel(this.incomingCallSubscription);
      this.incomingCallSubscription = null;
    }
    webrtcService.cleanup();
    await callSignalingService.cleanup();
    this._cleanup();
  }

  /**
   * Check if calls are available (WebRTC installed)
   * @returns {boolean}
   */
  isCallsAvailable() {
    return webrtcService.isAvailable;
  }
}

// Export singleton instance
export const callService = new CallService();
export default callService;
