/**
 * GEM Mobile - Voice Recording Service
 * Day 11-12: Voice Input Implementation
 *
 * CORE FUNCTIONALITY:
 * - Record voice using Expo Audio
 * - Convert to text using Speech Recognition
 * - Handle permissions
 * - Manage recording state
 *
 * QUOTA SYSTEM:
 * - FREE: 3 voice messages/day
 * - TIER1+: Unlimited
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import TierService from './tierService';

class VoiceService {
  constructor() {
    this.recording = null;
    this.isRecording = false;
    this.recordingUri = null;
    this.permissionGranted = false;
  }

  /**
   * Request microphone permission
   * @returns {Promise<boolean>}
   */
  async requestPermission() {
    try {
      console.log('[VoiceService] Requesting microphone permission...');

      const { status } = await Audio.requestPermissionsAsync();
      this.permissionGranted = status === 'granted';

      if (this.permissionGranted) {
        console.log('[VoiceService] Microphone permission granted');
      } else {
        console.log('[VoiceService] Microphone permission denied');
      }

      return this.permissionGranted;
    } catch (error) {
      console.error('[VoiceService] Permission request error:', error);
      return false;
    }
  }

  /**
   * Check if permission is granted
   * @returns {Promise<boolean>}
   */
  async hasPermission() {
    try {
      const { status } = await Audio.getPermissionsAsync();
      this.permissionGranted = status === 'granted';
      return this.permissionGranted;
    } catch (error) {
      console.error('[VoiceService] Check permission error:', error);
      return false;
    }
  }

  /**
   * Configure audio mode for recording
   * @private
   */
  async _configureAudioMode() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('[VoiceService] Configure audio mode error:', error);
    }
  }

  /**
   * Start recording voice
   * @returns {Promise<boolean>} - true if recording started successfully
   */
  async startRecording() {
    try {
      // Check permission first
      if (!this.permissionGranted) {
        const granted = await this.requestPermission();
        if (!granted) {
          console.log('[VoiceService] Cannot start recording - no permission');
          return false;
        }
      }

      // Stop any existing recording
      if (this.recording) {
        await this.stopRecording();
      }

      // Configure audio mode
      await this._configureAudioMode();

      console.log('[VoiceService] Starting recording...');

      // Create recording with high quality settings
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      const { recording } = await Audio.Recording.createAsync(
        recordingOptions,
        this._onRecordingStatusUpdate.bind(this)
      );

      this.recording = recording;
      this.isRecording = true;

      console.log('[VoiceService] Recording started');
      return true;

    } catch (error) {
      console.error('[VoiceService] Start recording error:', error);
      this.isRecording = false;
      return false;
    }
  }

  /**
   * Recording status update callback
   * @private
   */
  _onRecordingStatusUpdate(status) {
    if (status.isDoneRecording) {
      this.isRecording = false;
    }
  }

  /**
   * Stop recording and return audio URI
   * @returns {Promise<string|null>} - URI of recorded audio file
   */
  async stopRecording() {
    try {
      if (!this.recording) {
        console.log('[VoiceService] No active recording to stop');
        return null;
      }

      console.log('[VoiceService] Stopping recording...');

      await this.recording.stopAndUnloadAsync();

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = this.recording.getURI();
      this.recordingUri = uri;
      this.recording = null;
      this.isRecording = false;

      console.log('[VoiceService] Recording stopped, URI:', uri);
      return uri;

    } catch (error) {
      console.error('[VoiceService] Stop recording error:', error);
      this.recording = null;
      this.isRecording = false;
      return null;
    }
  }

  /**
   * Cancel recording without saving
   * @returns {Promise<void>}
   */
  async cancelRecording() {
    try {
      if (!this.recording) {
        return;
      }

      console.log('[VoiceService] Cancelling recording...');

      await this.recording.stopAndUnloadAsync();

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      // Delete the recorded file
      const uri = this.recording.getURI();
      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }

      this.recording = null;
      this.isRecording = false;
      this.recordingUri = null;

      console.log('[VoiceService] Recording cancelled');

    } catch (error) {
      console.error('[VoiceService] Cancel recording error:', error);
      this.recording = null;
      this.isRecording = false;
    }
  }

  /**
   * Get recording duration in seconds
   * @returns {Promise<number>}
   */
  async getRecordingDuration() {
    try {
      if (!this.recording) {
        return 0;
      }

      const status = await this.recording.getStatusAsync();
      return Math.floor(status.durationMillis / 1000);

    } catch (error) {
      console.error('[VoiceService] Get duration error:', error);
      return 0;
    }
  }

  /**
   * Delete recorded audio file
   * @param {string} uri
   * @returns {Promise<void>}
   */
  async deleteRecording(uri) {
    try {
      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
        console.log('[VoiceService] Deleted recording:', uri);
      }
    } catch (error) {
      console.error('[VoiceService] Delete recording error:', error);
    }
  }

  // ========================================
  // QUOTA MANAGEMENT
  // ========================================

  /**
   * Get today's voice usage count for user
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async getTodayVoiceCount(userId) {
    if (!userId) return 0;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('voice_usage')
        .select('count')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[VoiceService] Get voice count error:', error);
        return 0;
      }

      return data?.count || 0;

    } catch (error) {
      console.error('[VoiceService] Get voice count error:', error);
      return 0;
    }
  }

  /**
   * Increment voice usage count
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async incrementVoiceCount(userId) {
    if (!userId) return false;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Upsert voice usage
      const { error } = await supabase
        .from('voice_usage')
        .upsert(
          {
            user_id: userId,
            date: today,
            count: 1,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'user_id,date',
            ignoreDuplicates: false
          }
        );

      if (error) {
        // Try increment if upsert fails
        const { data: existing } = await supabase
          .from('voice_usage')
          .select('count')
          .eq('user_id', userId)
          .eq('date', today)
          .single();

        if (existing) {
          await supabase
            .from('voice_usage')
            .update({
              count: existing.count + 1,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('date', today);
        }
      }

      console.log('[VoiceService] Incremented voice count for user:', userId);
      return true;

    } catch (error) {
      console.error('[VoiceService] Increment voice count error:', error);
      return false;
    }
  }

  /**
   * Check if user can use voice input
   * @param {string} userId
   * @param {string} userTier
   * @returns {Promise<Object>} - { canUse, remaining, limit, reason }
   */
  async canUseVoice(userId, userTier) {
    const normalizedTier = TierService.normalizeTier(userTier);

    // TIER1+ has unlimited voice
    if (normalizedTier !== 'FREE') {
      return {
        canUse: true,
        remaining: -1, // Unlimited
        limit: -1,
        reason: null
      };
    }

    // FREE tier: 3 voice messages/day
    const FREE_VOICE_LIMIT = 3;
    const todayCount = await this.getTodayVoiceCount(userId);

    if (todayCount >= FREE_VOICE_LIMIT) {
      return {
        canUse: false,
        remaining: 0,
        limit: FREE_VOICE_LIMIT,
        reason: 'voice_limit_reached'
      };
    }

    return {
      canUse: true,
      remaining: FREE_VOICE_LIMIT - todayCount,
      limit: FREE_VOICE_LIMIT,
      reason: null
    };
  }

  /**
   * Get voice quota info for display
   * @param {string} userId
   * @param {string} userTier
   * @returns {Promise<Object>}
   */
  async getVoiceQuotaInfo(userId, userTier) {
    const normalizedTier = TierService.normalizeTier(userTier);

    if (normalizedTier !== 'FREE') {
      return {
        isUnlimited: true,
        used: 0,
        limit: -1,
        remaining: -1,
        displayText: 'Không giới hạn'
      };
    }

    const FREE_VOICE_LIMIT = 3;
    const todayCount = await this.getTodayVoiceCount(userId);
    const remaining = Math.max(0, FREE_VOICE_LIMIT - todayCount);

    return {
      isUnlimited: false,
      used: todayCount,
      limit: FREE_VOICE_LIMIT,
      remaining: remaining,
      displayText: `${remaining}/${FREE_VOICE_LIMIT} còn lại`
    };
  }
}

// Singleton instance
const voiceServiceInstance = new VoiceService();

export default voiceServiceInstance;
export { VoiceService };
