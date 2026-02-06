/**
 * Call Signaling Service
 * Handles WebRTC signaling via Supabase Realtime broadcast channels
 */

import { supabase } from './supabase';
import {
  SIGNAL_TYPE,
  getSignalingChannelName,
} from '../constants/callConstants';

class CallSignalingService {
  constructor() {
    this.channel = null;
    this.callId = null;
    this.userId = null;

    // Callbacks
    this.onOffer = null;
    this.onAnswer = null;
    this.onIceCandidate = null;
    this.onEnd = null;
    this.onMuteChange = null;
    this.onVideoChange = null;
    this.onBusy = null;
    this.onReconnect = null;
    this.onReady = null; // Called when callee is ready to receive offer
  }

  // ========== CHANNEL MANAGEMENT ==========

  /**
   * Subscribe to signaling channel for a call
   * @param {string} callId - Call ID
   * @param {string} userId - Current user ID
   * @returns {Promise<void>}
   */
  async subscribe(callId, userId) {
    try {
      this.callId = callId;
      this.userId = userId;

      const channelName = getSignalingChannelName(callId);
      console.log('[Signaling] Subscribing to channel:', channelName);

      // Unsubscribe from existing channel if any
      await this.unsubscribe();

      // Create promise that resolves when channel is SUBSCRIBED
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Signaling channel subscription timeout'));
        }, 10000); // 10 second timeout

        this.channel = supabase
          .channel(channelName, {
            config: {
              broadcast: {
                self: false, // Don't receive own messages
              },
            },
          })
          .on('broadcast', { event: 'signal' }, ({ payload }) => {
            this._handleSignal(payload);
          })
          .subscribe((status) => {
            console.log('[Signaling] Channel status:', status);
            if (status === 'SUBSCRIBED') {
              clearTimeout(timeout);
              console.log('[Signaling] Channel ready:', channelName);
              resolve();
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              clearTimeout(timeout);
              reject(new Error(`Signaling channel error: ${status}`));
            }
          });
      });
    } catch (error) {
      console.error('[Signaling] Subscribe error:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from signaling channel
   * @returns {Promise<void>}
   */
  async unsubscribe() {
    try {
      if (this.channel) {
        console.log('[Signaling] Unsubscribing from channel');
        await supabase.removeChannel(this.channel);
        this.channel = null;
      }
      this.callId = null;
    } catch (error) {
      console.error('[Signaling] Unsubscribe error:', error);
    }
  }

  // ========== SEND SIGNALS ==========

  /**
   * Send a signal through the channel
   * @param {Object} signal - Signal data
   * @private
   */
  async _sendSignal(signal) {
    if (!this.channel) {
      // Silently ignore if no channel - this can happen after call ends
      // Don't log error as it's expected behavior during cleanup
      return;
    }

    try {
      await this.channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: {
          ...signal,
          senderId: this.userId,
          timestamp: Date.now(),
        },
      });
      console.log('[Signaling] Sent signal:', signal.type);
    } catch (error) {
      // Only log if it's not a channel closed error
      if (!error.message?.includes('closed') && !error.message?.includes('not found')) {
        console.error('[Signaling] Send signal error:', error);
      }
    }
  }

  /**
   * Send WebRTC offer
   * @param {Object} offer - SDP offer
   * @param {string} calleeId - Target user ID
   */
  async sendOffer(offer, calleeId) {
    await this._sendSignal({
      type: SIGNAL_TYPE.OFFER,
      offer,
      calleeId,
    });
  }

  /**
   * Send WebRTC answer
   * @param {Object} answer - SDP answer
   */
  async sendAnswer(answer) {
    await this._sendSignal({
      type: SIGNAL_TYPE.ANSWER,
      answer,
    });
  }

  /**
   * Send ICE candidate
   * @param {Object} candidate - ICE candidate
   */
  async sendIceCandidate(candidate) {
    await this._sendSignal({
      type: SIGNAL_TYPE.ICE_CANDIDATE,
      candidate,
    });
  }

  /**
   * Send end call signal
   * @param {string} reason - End reason
   */
  async sendEnd(reason = 'normal') {
    await this._sendSignal({
      type: SIGNAL_TYPE.END,
      reason,
    });
  }

  /**
   * Send mute status change
   * @param {boolean} isMuted - Mute state
   */
  async sendMuteChange(isMuted) {
    await this._sendSignal({
      type: isMuted ? SIGNAL_TYPE.MUTE : SIGNAL_TYPE.UNMUTE,
      isMuted,
    });
  }

  /**
   * Send video status change
   * @param {boolean} isVideoOn - Video state
   */
  async sendVideoChange(isVideoOn) {
    await this._sendSignal({
      type: isVideoOn ? SIGNAL_TYPE.VIDEO_ON : SIGNAL_TYPE.VIDEO_OFF,
      isVideoOn,
    });
  }

  /**
   * Send busy signal (already in another call)
   */
  async sendBusy() {
    await this._sendSignal({
      type: SIGNAL_TYPE.BUSY,
    });
  }

  /**
   * Send reconnect signal
   */
  async sendReconnect() {
    await this._sendSignal({
      type: SIGNAL_TYPE.RECONNECT,
    });
  }

  /**
   * Send ready signal (callee tells caller they're ready to receive offer)
   * Returns false if no channel available
   */
  async sendReady() {
    if (!this.channel) {
      // Silently fail - no channel means call has ended
      return false;
    }
    console.log('[Signaling] Sending ready signal');
    await this._sendSignal({
      type: SIGNAL_TYPE.READY,
    });
    return true;
  }

  /**
   * Check if channel is active
   */
  hasActiveChannel() {
    return this.channel !== null;
  }

  // ========== HANDLE SIGNALS ==========

  /**
   * Handle incoming signals
   * @param {Object} payload - Signal payload
   * @private
   */
  _handleSignal(payload) {
    // Ignore signals from self
    if (payload.senderId === this.userId) {
      return;
    }

    console.log('[Signaling] Received signal:', payload.type);

    switch (payload.type) {
      case SIGNAL_TYPE.OFFER:
        this.onOffer?.(payload.offer, payload.senderId);
        break;

      case SIGNAL_TYPE.ANSWER:
        this.onAnswer?.(payload.answer, payload.senderId);
        break;

      case SIGNAL_TYPE.ICE_CANDIDATE:
        this.onIceCandidate?.(payload.candidate, payload.senderId);
        break;

      case SIGNAL_TYPE.END:
        this.onEnd?.(payload.reason, payload.senderId);
        break;

      case SIGNAL_TYPE.MUTE:
      case SIGNAL_TYPE.UNMUTE:
        this.onMuteChange?.(payload.isMuted, payload.senderId);
        break;

      case SIGNAL_TYPE.VIDEO_ON:
      case SIGNAL_TYPE.VIDEO_OFF:
        this.onVideoChange?.(payload.isVideoOn, payload.senderId);
        break;

      case SIGNAL_TYPE.BUSY:
        this.onBusy?.(payload.senderId);
        break;

      case SIGNAL_TYPE.RECONNECT:
        this.onReconnect?.(payload.senderId);
        break;

      case SIGNAL_TYPE.READY:
        console.log('[Signaling] Callee is ready');
        this.onReady?.(payload.senderId);
        break;

      default:
        console.warn('[Signaling] Unknown signal type:', payload.type);
    }
  }

  // ========== CLEANUP ==========

  /**
   * Reset all callbacks
   */
  resetCallbacks() {
    this.onOffer = null;
    this.onAnswer = null;
    this.onIceCandidate = null;
    this.onEnd = null;
    this.onMuteChange = null;
    this.onVideoChange = null;
    this.onBusy = null;
    this.onReconnect = null;
  }

  /**
   * Full cleanup
   */
  async cleanup() {
    await this.unsubscribe();
    this.resetCallbacks();
    this.userId = null;
    console.log('[Signaling] Cleanup complete');
  }

  /**
   * Force reset - clears all state immediately without async operations
   * Use this when you need to ensure a clean state synchronously
   */
  forceReset() {
    console.log('[Signaling] Force reset');
    if (this.channel) {
      // Try to remove channel but don't wait
      supabase.removeChannel(this.channel).catch(() => {});
      this.channel = null;
    }
    this.callId = null;
    this.userId = null;
    this.resetCallbacks();
  }
}

// Export singleton instance
export const callSignalingService = new CallSignalingService();
export default callSignalingService;
