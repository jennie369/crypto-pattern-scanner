/**
 * Voice Transcription Service for GEM Master
 * Uses OpenAI Whisper API via backend for Vietnamese speech-to-text
 */

import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { getSession } from './supabase';

// Backend API URL - Update after Railway deployment
const BACKEND_URL = __DEV__
  ? 'http://localhost:8000'
  : 'https://gem-backend.railway.app';

// Audio recording settings optimized for speech
const RECORDING_OPTIONS = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.MEDIUM,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 64000,
  },
};

// Maximum recording duration (60 seconds)
const MAX_RECORDING_DURATION_MS = 60000;

class VoiceTranscriptionService {
  constructor() {
    this.recording = null;
    this.isRecording = false;
    this.recordingStartTime = null;
    this.permissionGranted = false;
  }

  /**
   * Request microphone permission
   */
  async requestPermission() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      this.permissionGranted = status === 'granted';
      return this.permissionGranted;
    } catch (error) {
      console.error('[VoiceTranscription] Permission error:', error);
      return false;
    }
  }

  /**
   * Check if permission is granted
   */
  async checkPermission() {
    try {
      const { status } = await Audio.getPermissionsAsync();
      this.permissionGranted = status === 'granted';
      return this.permissionGranted;
    } catch (error) {
      console.error('[VoiceTranscription] Check permission error:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording() {
    try {
      // Check permission
      if (!this.permissionGranted) {
        const granted = await this.requestPermission();
        if (!granted) {
          throw new Error('Microphone permission denied');
        }
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        RECORDING_OPTIONS,
        null,
        100 // Update status every 100ms
      );

      this.recording = recording;
      this.isRecording = true;
      this.recordingStartTime = Date.now();

      console.log('[VoiceTranscription] Recording started');

      // Auto-stop after max duration
      setTimeout(() => {
        if (this.isRecording) {
          console.log('[VoiceTranscription] Auto-stopping after max duration');
          this.stopRecording();
        }
      }, MAX_RECORDING_DURATION_MS);

      return { success: true };
    } catch (error) {
      console.error('[VoiceTranscription] Start recording error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop recording and get audio file URI
   */
  async stopRecording() {
    try {
      if (!this.recording || !this.isRecording) {
        return { success: false, error: 'No active recording' };
      }

      const duration = Date.now() - this.recordingStartTime;
      console.log('[VoiceTranscription] Stopping recording, duration:', duration);

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      this.isRecording = false;
      const recordingRef = this.recording;
      this.recording = null;

      // Check minimum duration (0.5 seconds)
      if (duration < 500) {
        return { success: false, error: 'Recording too short' };
      }

      console.log('[VoiceTranscription] Recording saved:', uri);

      return {
        success: true,
        uri,
        duration,
      };
    } catch (error) {
      console.error('[VoiceTranscription] Stop recording error:', error);
      this.isRecording = false;
      this.recording = null;
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel recording without saving
   */
  async cancelRecording() {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }
      this.isRecording = false;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      console.log('[VoiceTranscription] Recording cancelled');
      return { success: true };
    } catch (error) {
      console.error('[VoiceTranscription] Cancel recording error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Transcribe audio file via backend Whisper API
   */
  async transcribeAudio(audioUri) {
    try {
      console.log('[VoiceTranscription] Transcribing audio:', audioUri);

      // Get auth token
      const { session } = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Read file as base64
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Determine file extension
      const extension = audioUri.split('.').pop() || 'm4a';

      // Send to backend for transcription
      const response = await fetch(`${BACKEND_URL}/api/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          audio_base64: base64Audio,
          file_extension: extension,
          language: 'vi', // Vietnamese
          prompt: 'GEM Master, trading, crypto, Bitcoin, Ethereum, tarot, kinh dịch, phong thủy, đá quý',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Transcription failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('[VoiceTranscription] Transcription result:', result.text?.substring(0, 50));

      return {
        success: true,
        text: result.text,
        language: result.language,
        duration: result.duration,
      };
    } catch (error) {
      console.error('[VoiceTranscription] Transcribe error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Record and transcribe in one call
   * This is a convenience method that handles the full flow
   */
  async recordAndTranscribe(onRecordingStart, onRecordingStop) {
    // Start recording
    const startResult = await this.startRecording();
    if (!startResult.success) {
      return startResult;
    }

    if (onRecordingStart) {
      onRecordingStart();
    }

    // Wait for user to stop (this should be called externally)
    // This method is mainly for documentation purposes
    return { success: true, recording: true };
  }

  /**
   * Complete the recording and transcription flow
   */
  async completeRecordingAndTranscribe() {
    // Stop recording
    const stopResult = await this.stopRecording();
    if (!stopResult.success) {
      return stopResult;
    }

    // Transcribe the audio
    const transcribeResult = await this.transcribeAudio(stopResult.uri);

    // Clean up the audio file
    try {
      await FileSystem.deleteAsync(stopResult.uri, { idempotent: true });
    } catch (cleanupError) {
      console.warn('[VoiceTranscription] Cleanup error:', cleanupError);
    }

    return transcribeResult;
  }

  /**
   * Get recording status
   */
  getStatus() {
    return {
      isRecording: this.isRecording,
      duration: this.isRecording ? Date.now() - this.recordingStartTime : 0,
      permissionGranted: this.permissionGranted,
    };
  }
}

// Export singleton instance
export const voiceTranscriptionService = new VoiceTranscriptionService();
export default voiceTranscriptionService;
