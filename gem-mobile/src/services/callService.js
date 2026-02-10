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
import callKeepService from './callKeepService';
import { Platform } from 'react-native';
import {
  CALL_STATUS,
  PARTICIPANT_STATUS,
  PARTICIPANT_ROLE,
  CALL_TYPE,
  CALL_TIMEOUTS,
  END_REASON,
  CALL_EVENT_TYPE,
  SIGNAL_TYPE,
  getIncomingCallChannelName,
  getSignalingChannelName,
} from '../constants/callConstants';

class CallService {
  constructor() {
    this.currentCallId = null;
    this.callTimeoutId = null;
    this.incomingCallSubscription = null;
    this.pendingOffer = null; // Store offer received before useCall initialized
    this.earlySignalingChannel = null; // Early subscription to catch offers
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

      console.log('[CallService] ========================================');
      console.log('[CallService] INITIATING CALL');
      console.log('[CallService] conversationId:', conversationId);
      console.log('[CallService] calleeId (người nhận):', calleeId);
      console.log('[CallService] callType:', callType);
      console.log('[CallService] Current user (người gọi):', user.id);
      console.log('[CallService] ========================================');

      // 1. Check if already in a call - but first try to clear stale state
      if (this.currentCallId) {
        // Check if the "current call" actually still exists and is active
        const { data: existingCall } = await supabase
          .from('calls')
          .select('id, status')
          .eq('id', this.currentCallId)
          .maybeSingle();

        const activeStatuses = [CALL_STATUS.INITIATING, CALL_STATUS.RINGING, CALL_STATUS.CONNECTING, CALL_STATUS.CONNECTED];
        if (!existingCall || !activeStatuses.includes(existingCall.status)) {
          // Call doesn't exist or is already ended - clear stale state
          console.log('[CallService] Clearing stale currentCallId:', this.currentCallId, 'status:', existingCall?.status);
          this.currentCallId = null;
        } else {
          // Actually in an active call
          return { success: false, error: 'Bạn đang trong cuộc gọi khác' };
        }
      }

      // 1.5. Clean up any stale participant records for BOTH caller and callee
      // This fixes false "busy" errors from orphaned records of failed calls
      await this._cleanupStaleParticipants(user.id); // Clean caller's own records
      await this._cleanupStaleParticipants(calleeId);

      // 2. Check if callee is already in a call
      // Must check BOTH participant status AND call status to avoid false "busy" errors
      // from stale records where call ended but participant status wasn't updated
      // Also add time filter: only consider calls from the last 5 minutes as potentially active
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: activeCall } = await supabase
        .from('call_participants')
        .select('call_id, calls!inner(status, created_at)')
        .eq('user_id', calleeId)
        .in('status', [PARTICIPANT_STATUS.CONNECTED, PARTICIPANT_STATUS.RINGING])
        .in('calls.status', [CALL_STATUS.INITIATING, CALL_STATUS.RINGING, CALL_STATUS.CONNECTING, CALL_STATUS.CONNECTED])
        .gte('calls.created_at', fiveMinutesAgo)
        .maybeSingle();

      if (activeCall) {
        console.log('[CallService] Callee is busy - active call:', activeCall.call_id, 'status:', activeCall.calls?.status);
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

      // 4. Add caller participant first
      const { error: callerError } = await supabase
        .from('call_participants')
        .insert({
          call_id: call.id,
          user_id: user.id,
          role: PARTICIPANT_ROLE.CALLER,
          status: PARTICIPANT_STATUS.CONNECTING,
          device_type: Platform.OS,
        });

      if (callerError) throw callerError;

      // 5. Update call status to ringing
      await supabase
        .from('calls')
        .update({
          status: CALL_STATUS.RINGING,
          ring_started_at: new Date().toISOString(),
        })
        .eq('id', call.id);

      // 6. Add callee participant with RINGING status
      // This triggers the realtime subscription for incoming calls
      const { error: calleeError } = await supabase
        .from('call_participants')
        .insert({
          call_id: call.id,
          user_id: calleeId,
          role: PARTICIPANT_ROLE.CALLEE,
          status: PARTICIPANT_STATUS.RINGING,
        });

      if (calleeError) throw calleeError;

      // 7. Log event
      await this._logEvent(call.id, CALL_EVENT_TYPE.CALL_INITIATED, {
        callType,
        calleeId,
      });

      // 8. Fetch caller profile for notification
      const { data: callerProfile } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, username, avatar_url')
        .eq('id', user.id)
        .single();

      const caller = callerProfile || { id: user.id };
      if (callerProfile) {
        caller.display_name = callerProfile.full_name || callerProfile.display_name || callerProfile.username || 'User';
      }

      // 9. Display native outgoing call UI via CallKeep
      if (callKeepService.available) {
        callKeepService.startCall(
          call.id,
          caller.display_name || 'Người dùng GEM',
          callType === CALL_TYPE.VIDEO
        );
      }

      // 10. Send VoIP push notification (preferred) or regular push
      console.log('[CallService] ========================================');
      console.log('[CallService] SENDING PUSH NOTIFICATION');
      console.log('[CallService] Sending TO (calleeId):', calleeId);
      console.log('[CallService] Caller profile:', caller.id, caller.display_name);
      console.log('[CallService] ========================================');
      await this._sendVoIPPushNotification(call, caller, calleeId);

      // 11. Start ring timeout
      this._startRingTimeout(call.id);

      // 12. Log ringing event
      await this._logEvent(call.id, CALL_EVENT_TYPE.CALL_RINGING, {});

      console.log('[CallService] Call initiated successfully:', call.id);

      // Add participants to call object so caller has access to callee info
      call.participants = [
        {
          user_id: user.id,
          role: PARTICIPANT_ROLE.CALLER,
          status: PARTICIPANT_STATUS.CONNECTING,
        },
        {
          user_id: calleeId,
          role: PARTICIPANT_ROLE.CALLEE,
          status: PARTICIPANT_STATUS.RINGING,
        },
      ];

      return { success: true, call };
    } catch (error) {
      console.error('[CallService] initiateCall error:', error);

      // Clean up any database records that were created before the error
      if (this.currentCallId) {
        try {
          // Mark call as failed
          await supabase
            .from('calls')
            .update({
              status: CALL_STATUS.FAILED,
              ended_at: new Date().toISOString(),
              end_reason: END_REASON.ERROR,
            })
            .eq('id', this.currentCallId);

          // Mark all participants as left
          await supabase
            .from('call_participants')
            .update({
              status: PARTICIPANT_STATUS.LEFT,
              updated_at: new Date().toISOString(),
            })
            .eq('call_id', this.currentCallId);

          console.log('[CallService] Cleaned up failed call records');
        } catch (cleanupError) {
          console.error('[CallService] Cleanup error:', cleanupError);
        }
      }

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

      // Prevent duplicate answer attempts
      if (this.currentCallId === callId) {
        console.log('[CallService] Already answering this call:', callId);
        return { success: true, alreadyAnswering: true };
      }

      console.log('[CallService] Answering call:', callId);

      this.currentCallId = callId;

      // 1. Update call status
      console.log('[CallService] Updating call status to CONNECTING...');
      const { error: callError } = await supabase
        .from('calls')
        .update({
          status: CALL_STATUS.CONNECTING,
        })
        .eq('id', callId);

      if (callError) throw callError;
      console.log('[CallService] Call status updated');

      // 2. Update participant status
      console.log('[CallService] Updating participant status...');
      const { error: participantError } = await supabase
        .from('call_participants')
        .update({
          status: PARTICIPANT_STATUS.CONNECTING,
          device_type: Platform.OS,
        })
        .eq('call_id', callId)
        .eq('user_id', user.id);

      if (participantError) {
        console.warn('[CallService] Participant update error:', participantError);
      }
      console.log('[CallService] Participant status updated');

      // 3. Log event (non-critical)
      try {
        await this._logEvent(callId, CALL_EVENT_TYPE.CALL_ANSWERED, {});
      } catch (logError) {
        console.warn('[CallService] Log event error (non-critical):', logError);
      }

      console.log('[CallService] Answer call successful:', callId);
      return { success: true };
    } catch (error) {
      console.error('[CallService] answerCall error:', error);
      this.currentCallId = null; // Clear on error
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

      // Report connected to CallKeep
      if (callKeepService.available) {
        callKeepService.reportConnected(callId);
      }

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

      // CRITICAL: Clear local state IMMEDIATELY before any async operations
      const wasCurrentCall = this.currentCallId === callId;
      if (wasCurrentCall) {
        this.currentCallId = null;
        console.log('[CallService] Cleared currentCallId immediately');
      }

      // End call in CallKeep (dismiss native UI)
      if (callKeepService.available) {
        callKeepService.endCall(callId);
      }

      // Update call status
      await supabase
        .from('calls')
        .update({
          status: CALL_STATUS.DECLINED,
          ended_at: new Date().toISOString(),
          end_reason: END_REASON.DECLINED,
        })
        .eq('id', callId);

      // Update declining user's participant status
      await supabase
        .from('call_participants')
        .update({
          status: PARTICIPANT_STATUS.DECLINED,
          updated_at: new Date().toISOString(),
        })
        .eq('call_id', callId)
        .eq('user_id', user.id);

      // Also update caller's participant status to 'left' so they can call again
      await supabase
        .from('call_participants')
        .update({
          status: PARTICIPANT_STATUS.LEFT,
          left_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('call_id', callId)
        .eq('role', PARTICIPANT_ROLE.CALLER);

      // Send end signal - need to subscribe to channel first if not already subscribed
      try {
        // Subscribe to signaling channel to send END signal
        await callSignalingService.subscribe(callId, user.id);
        await callSignalingService.sendEnd(END_REASON.DECLINED);
        // Cleanup signaling
        await callSignalingService.cleanup();
      } catch (sigError) {
        console.log('[CallService] Could not send decline signal:', sigError.message);
        // Non-critical - database update is enough, caller will timeout
      }

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

      // CRITICAL: Clear local state IMMEDIATELY before any async operations
      // This prevents "already in a call" error when user quickly makes another call
      const wasCurrentCall = this.currentCallId === callId;
      if (wasCurrentCall) {
        this.currentCallId = null;
        console.log('[CallService] Cleared currentCallId immediately');
      }

      // End call in CallKeep (dismiss native UI)
      if (callKeepService.available) {
        callKeepService.endCall(callId);
      }

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

      // CRITICAL: Clear local state IMMEDIATELY before any async operations
      // This prevents "already in a call" error when user quickly makes another call
      const wasCurrentCall = this.currentCallId === callId;
      if (wasCurrentCall) {
        this.currentCallId = null;
        console.log('[CallService] Cleared currentCallId immediately');
      }

      // End call in CallKeep (dismiss native UI)
      if (callKeepService.available) {
        callKeepService.endCall(callId);
      }

      // Update call record
      await supabase
        .from('calls')
        .update({
          status: CALL_STATUS.CANCELLED,
          ended_at: new Date().toISOString(),
          end_reason: END_REASON.CANCELLED,
        })
        .eq('id', callId);

      // Update ALL participants to terminal status to prevent "busy" error
      // Callee who was ringing -> cancelled
      await supabase
        .from('call_participants')
        .update({
          status: PARTICIPANT_STATUS.CANCELLED,
          updated_at: new Date().toISOString(),
        })
        .eq('call_id', callId)
        .eq('role', PARTICIPANT_ROLE.CALLEE);

      // Caller -> left
      await supabase
        .from('call_participants')
        .update({
          status: PARTICIPANT_STATUS.LEFT,
          left_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('call_id', callId)
        .eq('role', PARTICIPANT_ROLE.CALLER);

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
      // Step 1: Fetch call WITHOUT participants to avoid RLS recursion
      const { data: call, error } = await supabase
        .from('calls')
        .select('*')
        .eq('id', callId)
        .single();

      if (error) throw error;

      // Step 2: Fetch participants separately (avoids RLS infinite recursion)
      // Users can always view their own participation
      const { data: participants } = await supabase
        .from('call_participants')
        .select('*')
        .eq('call_id', callId);

      call.participants = participants || [];

      // Step 3: Collect all user IDs (caller + participants)
      const userIds = new Set();
      if (call.caller_id) userIds.add(call.caller_id);
      call.participants?.forEach(p => {
        if (p.user_id) userIds.add(p.user_id);
      });

      // Step 4: Fetch profiles for all users
      let profilesMap = {};
      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, username, avatar_url')
          .in('id', Array.from(userIds));

        if (profiles) {
          profiles.forEach(profile => {
            profile.display_name = profile.full_name || profile.display_name || profile.username || 'User';
            profilesMap[profile.id] = profile;
          });
        }
      }

      // Step 5: Attach caller profile
      call.caller = profilesMap[call.caller_id] || null;

      // Step 6: Attach profiles to participants
      call.participants = call.participants?.map(p => ({
        ...p,
        user: profilesMap[p.user_id] || null,
        profiles: profilesMap[p.user_id] || null,
      })) || [];

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
  subscribeToIncomingCalls(userId, onIncomingCall, onStatusChange = null) {
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
          console.log('[CallService] Realtime event received:', {
            role: payload.new.role,
            status: payload.new.status,
            call_id: payload.new.call_id,
            user_id: payload.new.user_id,
          });

          // Notify status change callback about the event
          if (onStatusChange) {
            onStatusChange({
              type: 'event',
              event: 'INSERT',
              callId: payload.new.call_id,
              timestamp: new Date().toISOString(),
            });
          }

          // Check if this is an incoming call (role = callee, status = ringing OR invited)
          // Accept both statuses for compatibility with older app versions
          const isIncomingCall =
            payload.new.role === PARTICIPANT_ROLE.CALLEE &&
            (payload.new.status === PARTICIPANT_STATUS.RINGING ||
             payload.new.status === PARTICIPANT_STATUS.INVITED);

          if (isIncomingCall) {
            console.log('[CallService] Incoming call detected:', payload.new.call_id, 'status:', payload.new.status);

            // EARLY SUBSCRIPTION: Subscribe to signaling channel immediately to catch offers
            // This helps when the caller sends offer before IncomingCallScreen mounts
            // IMPORTANT: Wait for subscription to be ready before continuing
            await this._startEarlySignaling(payload.new.call_id, userId);

            // Fetch full call info
            const { call } = await this.getCall(payload.new.call_id);
            console.log('[CallService] Fetched call:', call?.id, 'status:', call?.status);

            // Accept call if status is ringing (or initiating for older versions)
            if (call && (call.status === CALL_STATUS.RINGING || call.status === CALL_STATUS.INITIATING)) {
              // Display native incoming call UI via CallKeep
              // This shows the call even when app is in background
              if (callKeepService.available) {
                const callerName = call.caller?.display_name || call.caller?.full_name || 'Người dùng GEM';
                const hasVideo = call.call_type === CALL_TYPE.VIDEO;

                callKeepService.displayIncomingCall(
                  call.id,
                  callerName,
                  hasVideo,
                  '',
                  {
                    callerId: call.caller_id,
                    conversationId: call.conversation_id,
                    callType: call.call_type,
                  }
                );
              }

              console.log('[CallService] Triggering incoming call callback');
              onIncomingCall(call);
            }
          } else {
            console.log('[CallService] Event ignored - role:', payload.new.role, 'status:', payload.new.status);
          }
        }
      )
      .subscribe((status) => {
        console.log('[CallService] Incoming call subscription status:', status);
        // Notify status change callback
        if (onStatusChange) {
          onStatusChange({
            type: 'subscription',
            status: status,
            timestamp: new Date().toISOString(),
          });
        }
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
   * Send VoIP push notification for incoming call
   * Uses send-voip-push Edge Function for native call UI
   * Falls back to regular push if VoIP push fails
   * @param {Object} call - Call object
   * @param {Object} caller - Caller profile
   * @param {string} calleeId - Target user ID
   * @private
   */
  async _sendVoIPPushNotification(call, caller, calleeId) {
    try {
      console.log('[CallService] Sending VoIP push notification to:', calleeId);

      // Try VoIP push first (preferred for native call UI)
      const { data, error } = await supabase.functions.invoke('send-voip-push', {
        body: {
          callId: call.id,
          calleeId: calleeId,
          callerId: caller.id,
          callerName: caller.display_name || 'Người dùng GEM',
          callerAvatar: caller.avatar_url,
          callType: call.call_type,
          conversationId: call.conversation_id,
        },
      });

      if (error) {
        console.log('[CallService] VoIP push failed, falling back to regular push:', error.message);
        // Fallback to regular push notification
        await this._sendCallNotification(calleeId, call, caller);
        return;
      }

      console.log('[CallService] VoIP push sent successfully:', data);
    } catch (error) {
      console.error('[CallService] _sendVoIPPushNotification error:', error);
      // Fallback to regular push notification
      await this._sendCallNotification(calleeId, call, caller);
    }
  }

  /**
   * Send push notification for incoming call
   * Uses send-push Edge Function which queries user_push_tokens table
   * @param {string} userId - Target user ID
   * @param {Object} call - Call object
   * @param {Object} caller - Caller profile
   * @private
   */
  async _sendCallNotification(userId, call, caller) {
    try {
      console.log('[CallService] Sending push notification to user:', userId);

      const title = caller.display_name || 'Cuộc gọi đến';
      const body = call.call_type === CALL_TYPE.VIDEO
        ? '📹 Cuộc gọi video đến'
        : '📞 Cuộc gọi thoại đến';

      // Send via send-push Edge Function
      const { data, error } = await supabase.functions.invoke('send-push', {
        body: {
          user_id: userId,
          notification_type: 'incoming_call',
          title,
          body,
          data: {
            type: 'incoming_call',
            callId: call.id,
            callerId: caller.id,
            callerName: caller.display_name,
            callerAvatar: caller.avatar_url,
            callType: call.call_type,
            conversationId: call.conversation_id,
          },
          channel_id: 'incoming_call',
        },
      });

      if (error) {
        console.error('[CallService] Push notification error:', error);
        return;
      }

      console.log('[CallService] Push notification sent successfully:', data);
    } catch (error) {
      console.error('[CallService] sendCallNotification error:', error);
    }
  }

  // ========== TIMEOUTS ==========

  /**
   * Start ring timeout (60s)
   * Auto-hangup if no one answers within timeout period
   * @param {string} callId - Call ID
   * @private
   */
  _startRingTimeout(callId) {
    this._clearRingTimeout();

    console.log('[CallService] Starting ring timeout for call:', callId, '(', CALL_TIMEOUTS.RING_TIMEOUT / 1000, 's)');

    this.callTimeoutId = setTimeout(async () => {
      console.log('[CallService] Ring timeout reached for call:', callId);

      try {
        // Get call details for notification
        const { call } = await this.getCall(callId);

        // Mark as missed in database
        try {
          await supabase.rpc('mark_call_missed', { p_call_id: callId });
        } catch (rpcErr) {
          // Fallback: update directly if RPC doesn't exist
          console.log('[CallService] mark_call_missed RPC failed, using direct update:', rpcErr.message);

          // Update call record
          await supabase
            .from('calls')
            .update({
              status: CALL_STATUS.MISSED,
              ended_at: new Date().toISOString(),
              end_reason: END_REASON.NO_ANSWER,
            })
            .eq('id', callId);

          // IMPORTANT: Also update call_participants to prevent "busy" error on next call
          // Update callee to 'missed'
          await supabase
            .from('call_participants')
            .update({
              status: PARTICIPANT_STATUS.MISSED,
              updated_at: new Date().toISOString(),
            })
            .eq('call_id', callId)
            .eq('role', PARTICIPANT_ROLE.CALLEE);

          // Update caller to 'left'
          await supabase
            .from('call_participants')
            .update({
              status: PARTICIPANT_STATUS.LEFT,
              left_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('call_id', callId)
            .eq('role', PARTICIPANT_ROLE.CALLER);

          console.log('[CallService] Fallback: Updated call_participants status');
        }

        // Send end signal to peer so they know call is over
        try {
          await callSignalingService.sendEnd(END_REASON.NO_ANSWER);
        } catch (sigErr) {
          console.log('[CallService] Failed to send end signal:', sigErr.message);
        }

        // Send missed call push notification
        if (call) {
          const calleeId = call.participants?.find(p => p.role === PARTICIPANT_ROLE.CALLEE)?.user_id;
          if (calleeId && call.caller) {
            await this._sendMissedCallNotification(calleeId, call);
          }
        }

        // Log event
        await this._logEvent(callId, CALL_EVENT_TYPE.CALL_MISSED, {
          reason: END_REASON.NO_ANSWER,
          timeout: CALL_TIMEOUTS.RING_TIMEOUT,
        });

      } catch (err) {
        console.error('[CallService] Ring timeout error:', err);
      }

      // Cleanup WebRTC and signaling
      webrtcService.cleanup();
      await callSignalingService.cleanup();
      this._cleanup();

      console.log('[CallService] Ring timeout cleanup completed');
    }, CALL_TIMEOUTS.RING_TIMEOUT);
  }

  /**
   * Send missed call push notification
   * @param {string} userId - User ID to notify
   * @param {Object} call - Call object
   * @private
   */
  async _sendMissedCallNotification(userId, call) {
    try {
      const caller = call.caller || {};
      const { data, error } = await supabase.functions.invoke('send-push', {
        body: {
          user_id: userId,
          notification_type: 'missed_call',
          title: '📞 Cuộc gọi nhỡ',
          body: `${caller.display_name || 'Ai đó'} đã gọi cho bạn`,
          data: {
            type: 'missed_call',
            callId: call.id,
            callerId: caller.id,
            callerName: caller.display_name,
            callType: call.call_type,
          },
          channel_id: 'missed_call',
        },
      });

      if (error) {
        console.error('[CallService] Missed call notification error:', error);
      } else {
        console.log('[CallService] Missed call notification sent:', data);
      }
    } catch (err) {
      console.error('[CallService] _sendMissedCallNotification error:', err);
    }
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

  // ========== EARLY SIGNALING ==========

  /**
   * Start early signaling subscription to catch offers before IncomingCallScreen mounts
   * @param {string} callId - Call ID
   * @param {string} userId - Current user ID
   * @returns {Promise<void>} Resolves when channel is subscribed
   * @private
   */
  async _startEarlySignaling(callId, userId) {
    // Don't start if already subscribed
    if (this.earlySignalingChannel) {
      console.log('[CallService] Early signaling already active');
      return;
    }

    const channelName = getSignalingChannelName(callId);
    console.log('[CallService] *** Starting early signaling subscription:', channelName);

    this.pendingOffer = null;

    // Use promise to wait for subscription to be ready
    return new Promise((resolve) => {
      // Timeout after 5 seconds - don't block forever
      const timeout = setTimeout(() => {
        console.log('[CallService] *** Early signaling subscription timeout, continuing anyway');
        resolve();
      }, 5000);

      // Use the same channel name as regular signaling to receive offers
      this.earlySignalingChannel = supabase
        .channel(channelName, {
          config: {
            broadcast: {
              self: false,
            },
          },
        })
        .on('broadcast', { event: 'signal' }, ({ payload }) => {
          console.log('[CallService] *** Early signaling received signal:', payload.type, 'from:', payload.senderId);
          // Only capture offers - other signals will be handled by useCall
          if (payload.type === SIGNAL_TYPE.OFFER && payload.senderId !== userId) {
            console.log('[CallService] *** CAPTURED OFFER! ***');
            this.pendingOffer = {
              offer: payload.offer,
              senderId: payload.senderId,
              timestamp: Date.now(),
            };
          }
        })
        .subscribe((status) => {
          console.log('[CallService] *** Early signaling status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('[CallService] *** Early signaling READY to receive offers');
            clearTimeout(timeout);
            resolve();
          }
        });
    });
  }

  /**
   * Stop early signaling subscription
   * @private
   */
  async _stopEarlySignaling() {
    if (this.earlySignalingChannel) {
      console.log('[CallService] Stopping early signaling');
      await supabase.removeChannel(this.earlySignalingChannel);
      this.earlySignalingChannel = null;
    }
  }

  /**
   * Get pending offer captured by early signaling
   * @returns {Object|null} Pending offer data or null
   */
  getPendingOffer() {
    const offer = this.pendingOffer;
    if (offer) {
      console.log('[CallService] Returning pending offer from', offer.senderId);
      this.pendingOffer = null; // Clear after returning
    }
    return offer;
  }

  /**
   * Clear pending offer
   */
  clearPendingOffer() {
    this.pendingOffer = null;
  }

  /**
   * Stop early signaling (public wrapper)
   * Call this when useCall takes over signaling
   */
  async stopEarlySignaling() {
    await this._stopEarlySignaling();
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
    this._stopEarlySignaling();
    this.currentCallId = null;
    this.pendingOffer = null;
  }

  /**
   * Public method to clear call state
   * Use this when call ends via signaling or external events
   * @param {string} callId - Optional call ID to cleanup in database
   */
  async clearState(callId = null) {
    console.log('[CallService] Clearing call state, callId:', callId || this.currentCallId);

    const idToCleanup = callId || this.currentCallId;

    // Clear local state FIRST
    this._cleanup();

    // Also cleanup participant records in database to prevent "busy" errors
    if (idToCleanup) {
      try {
        // Update all participants of this call to LEFT status
        await supabase
          .from('call_participants')
          .update({
            status: PARTICIPANT_STATUS.LEFT,
            left_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('call_id', idToCleanup)
          .in('status', [
            PARTICIPANT_STATUS.RINGING,
            PARTICIPANT_STATUS.CONNECTING,
            PARTICIPANT_STATUS.CONNECTED,
            PARTICIPANT_STATUS.INVITED,
          ]);

        console.log('[CallService] Cleaned up participant records for call:', idToCleanup);
      } catch (err) {
        console.log('[CallService] Participant cleanup error (non-critical):', err.message);
      }
    }

    // Also cleanup any stale records for current user
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await this._cleanupStaleParticipants(user.id);
      }
    } catch (err) {
      console.log('[CallService] User cleanup error (non-critical):', err.message);
    }
  }

  /**
   * Clean up stale call participant records for a user
   * This fixes "busy" errors caused by orphaned records from failed calls
   * @param {string} userId - User ID to clean up
   * @private
   */
  async _cleanupStaleParticipants(userId) {
    try {
      // Method 1: Find participant records where the call has already ended
      const { data: staleRecords } = await supabase
        .from('call_participants')
        .select('id, call_id, status, calls!inner(id, status)')
        .eq('user_id', userId)
        .in('status', [PARTICIPANT_STATUS.RINGING, PARTICIPANT_STATUS.CONNECTED, PARTICIPANT_STATUS.CONNECTING, PARTICIPANT_STATUS.INVITED])
        .in('calls.status', [CALL_STATUS.ENDED, CALL_STATUS.MISSED, CALL_STATUS.DECLINED, CALL_STATUS.CANCELLED, CALL_STATUS.FAILED]);

      if (staleRecords && staleRecords.length > 0) {
        console.log('[CallService] Found', staleRecords.length, 'stale participant records (call ended), cleaning up...');

        for (const record of staleRecords) {
          await supabase
            .from('call_participants')
            .update({
              status: PARTICIPANT_STATUS.LEFT,
              left_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', record.id);
        }
      }

      // Method 2: Also clean up old records that are stuck in active status
      // If a participant record is in RINGING/CONNECTING for more than 2 minutes, it's stale
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { data: oldStaleRecords } = await supabase
        .from('call_participants')
        .select('id, call_id, status, created_at')
        .eq('user_id', userId)
        .in('status', [PARTICIPANT_STATUS.RINGING, PARTICIPANT_STATUS.CONNECTING, PARTICIPANT_STATUS.INVITED])
        .lt('created_at', twoMinutesAgo);

      if (oldStaleRecords && oldStaleRecords.length > 0) {
        console.log('[CallService] Found', oldStaleRecords.length, 'old stale participant records (>2min), cleaning up...');

        for (const record of oldStaleRecords) {
          await supabase
            .from('call_participants')
            .update({
              status: PARTICIPANT_STATUS.LEFT,
              left_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', record.id);

          // Also update the call if it's still in active status
          await supabase
            .from('calls')
            .update({
              status: CALL_STATUS.FAILED,
              ended_at: new Date().toISOString(),
              end_reason: END_REASON.ERROR,
            })
            .eq('id', record.call_id)
            .in('status', [CALL_STATUS.INITIATING, CALL_STATUS.RINGING, CALL_STATUS.CONNECTING]);
        }
      }

      if ((staleRecords?.length || 0) + (oldStaleRecords?.length || 0) > 0) {
        console.log('[CallService] Cleaned up stale participant records');
      }
    } catch (error) {
      // Non-critical, just log
      console.log('[CallService] Cleanup stale participants error:', error.message);
    }
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

  /**
   * Check if incoming call subscription is still active
   * @returns {boolean}
   */
  isSubscriptionActive() {
    return this.incomingCallSubscription !== null;
  }

  /**
   * Refresh incoming call subscription
   * Call this when app comes back from background to ensure subscription is active
   * @param {string} userId - User ID
   * @param {Function} onIncomingCall - Callback for incoming calls
   * @param {Function} onStatusChange - Optional status change callback
   * @returns {Function} New unsubscribe function
   */
  refreshSubscription(userId, onIncomingCall, onStatusChange = null) {
    console.log('[CallService] Refreshing incoming call subscription for:', userId);

    // Unsubscribe from old channel if exists
    if (this.incomingCallSubscription) {
      supabase.removeChannel(this.incomingCallSubscription);
      this.incomingCallSubscription = null;
    }

    // Create fresh subscription
    return this.subscribeToIncomingCalls(userId, onIncomingCall, onStatusChange);
  }
}

// Export singleton instance
export const callService = new CallService();
export default callService;
