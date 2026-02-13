/**
 * GEM Mobile - Speech Recognition Service
 * Day 11-12: Voice Input Implementation
 *
 * STRATEGY:
 * - Native: Use device speech recognition (FREE - Siri/Google)
 * - Web: Use Web Speech API
 * - Fallback: OpenAI Whisper API (paid)
 *
 * SUPPORTED LANGUAGES:
 * - Vietnamese (vi-VN) - Primary
 * - English (en-US) - Secondary
 *
 * Updated: December 15, 2025
 * - Added @react-native-voice/voice for FREE native speech recognition
 */

import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';

// Native voice recognition (FREE!)
let Voice = null;
if (Platform.OS !== 'web') {
  try {
    Voice = require('@react-native-voice/voice').default;
  } catch (e) {
    console.log('[SpeechRecognition] @react-native-voice/voice not available');
  }
}

class SpeechRecognitionService {
  constructor() {
    this.isListening = false;
    this.recognition = null;
    this.language = 'vi-VN';
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
    this.partialResults = '';
    this.primerSound = null; // iOS silent mode TTS fix - keeps audio session in playback mode

    // Initialize native voice if available
    if (Voice) {
      this._initNativeVoice();
    }
  }

  /**
   * Initialize native voice recognition
   * @private
   */
  _initNativeVoice() {
    if (!Voice) return;

    try {
      Voice.onSpeechStart = () => {
        console.log('[SpeechRecognition] Native speech started');
        this.isListening = true;
      };

      Voice.onSpeechEnd = () => {
        console.log('[SpeechRecognition] Native speech ended');
        this.isListening = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };

      Voice.onSpeechResults = (event) => {
        const results = event.value || [];
        const finalText = results[0] || '';
        console.log('[SpeechRecognition] Native results:', finalText);

        if (this.onResultCallback && finalText) {
          this.onResultCallback({
            finalTranscript: finalText,
            interimTranscript: '',
            isFinal: true
          });
        }
      };

      Voice.onSpeechPartialResults = (event) => {
        const results = event.value || [];
        const partialText = results[0] || '';
        this.partialResults = partialText;

        if (this.onResultCallback && partialText) {
          this.onResultCallback({
            finalTranscript: '',
            interimTranscript: partialText,
            isFinal: false
          });
        }
      };

      Voice.onSpeechError = (event) => {
        console.error('[SpeechRecognition] Native error:', event.error);
        this.isListening = false;

        if (this.onErrorCallback) {
          this.onErrorCallback({ error: event.error?.message || event.error });
        }
      };

      console.log('[SpeechRecognition] Native voice initialized');
    } catch (e) {
      // Expected in Expo Go - native module event handlers may not work
      console.log('[SpeechRecognition] Native voice init skipped (Expo Go)');
    }
  }

  /**
   * Check if speech recognition is available
   * @returns {boolean}
   */
  isAvailable() {
    if (Platform.OS === 'web') {
      return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }
    // For native, check if Voice is available
    return Voice !== null;
  }

  /**
   * Check if native voice is available
   * @returns {Promise<boolean>}
   */
  async isNativeAvailable() {
    if (!Voice) return false;
    try {
      // Check if the isAvailable method exists and is callable
      if (typeof Voice.isAvailable !== 'function') {
        return false;
      }
      const available = await Voice.isAvailable();
      return available === 1 || available === true;
    } catch (e) {
      // Expected in Expo Go - native module not linked
      console.log('[SpeechRecognition] isNativeAvailable check failed (expected in Expo Go)');
      return false;
    }
  }

  /**
   * Set recognition language
   * @param {string} lang - 'vi-VN' | 'en-US'
   */
  setLanguage(lang) {
    this.language = lang;
    console.log('[SpeechRecognition] Language set to:', lang);
  }

  /**
   * Initialize Web Speech API (for web platform)
   * @private
   */
  _initWebSpeechAPI() {
    if (Platform.OS !== 'web') return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('[SpeechRecognition] Web Speech API not supported');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = this.language;
    recognition.maxAlternatives = 1;

    return recognition;
  }

  /**
   * Start speech recognition
   * - Native: Uses device speech recognition (FREE - Siri/Google)
   * - Web: Uses Web Speech API
   *
   * @param {Object} callbacks - { onResult, onError, onEnd }
   * @returns {Promise<boolean>}
   */
  async startListening(callbacks = {}) {
    this.onResultCallback = callbacks.onResult;
    this.onErrorCallback = callbacks.onError;
    this.onEndCallback = callbacks.onEnd;
    this.partialResults = '';

    if (Platform.OS === 'web') {
      return this._startWebListening();
    }

    // For native platforms, use @react-native-voice/voice (FREE!)
    return this._startNativeListening();
  }

  /**
   * Start native voice recognition (iOS/Android)
   * Uses device's built-in speech recognition - FREE!
   * @private
   */
  async _startNativeListening() {
    if (!Voice) {
      console.log('[SpeechRecognition] Native voice module not available (expected in Expo Go)');
      if (this.onErrorCallback) {
        this.onErrorCallback({ error: 'Native voice recognition not available in Expo Go' });
      }
      return false;
    }

    try {
      // Check if native module is truly available (not just the JS wrapper)
      const isAvailable = await this.isNativeAvailable();
      if (!isAvailable) {
        console.log('[SpeechRecognition] Native voice not available on this device/environment');
        if (this.onErrorCallback) {
          this.onErrorCallback({ error: 'Native voice recognition not supported in this environment' });
        }
        return false;
      }

      // Check if already listening
      if (this.isListening) {
        await this.stopListening();
      }

      console.log('[SpeechRecognition] Starting native listening, language:', this.language);

      // Start voice recognition with language
      await Voice.start(this.language);
      this.isListening = true;

      return true;

    } catch (error) {
      // Handle gracefully - this is expected in Expo Go
      console.log('[SpeechRecognition] Native voice not available:', error.message || error);
      if (this.onErrorCallback) {
        this.onErrorCallback({ error: 'Voice recognition requires a development build' });
      }
      return false;
    }
  }

  /**
   * Start Web Speech API listening
   * @private
   */
  _startWebListening() {
    try {
      this.recognition = this._initWebSpeechAPI();

      if (!this.recognition) {
        if (this.onErrorCallback) {
          this.onErrorCallback({ error: 'Speech recognition not available' });
        }
        return false;
      }

      // Set up event handlers
      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (this.onResultCallback) {
          this.onResultCallback({
            finalTranscript,
            interimTranscript,
            isFinal: finalTranscript.length > 0
          });
        }
      };

      this.recognition.onerror = (event) => {
        console.error('[SpeechRecognition] Error:', event.error);
        this.isListening = false;

        if (this.onErrorCallback) {
          this.onErrorCallback({ error: event.error });
        }
      };

      this.recognition.onend = () => {
        console.log('[SpeechRecognition] Recognition ended');
        this.isListening = false;

        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };

      this.recognition.start();
      this.isListening = true;
      console.log('[SpeechRecognition] Started listening...');

      return true;

    } catch (error) {
      console.error('[SpeechRecognition] Start error:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback({ error: error.message });
      }
      return false;
    }
  }

  /**
   * Stop speech recognition
   * @returns {Promise<void>}
   */
  async stopListening() {
    try {
      if (Platform.OS === 'web' && this.recognition) {
        this.recognition.stop();
        console.log('[SpeechRecognition] Stopped web listening');
      } else if (Voice) {
        await Voice.stop();
        console.log('[SpeechRecognition] Stopped native listening');
      }
    } catch (error) {
      console.error('[SpeechRecognition] Stop error:', error);
    }

    this.isListening = false;
  }

  /**
   * Cancel speech recognition
   * @returns {Promise<void>}
   */
  async cancelListening() {
    try {
      if (Platform.OS === 'web' && this.recognition) {
        this.recognition.abort();
        console.log('[SpeechRecognition] Cancelled web listening');
      } else if (Voice) {
        await Voice.cancel();
        console.log('[SpeechRecognition] Cancelled native listening');
      }
    } catch (error) {
      console.error('[SpeechRecognition] Cancel error:', error);
    }

    this.isListening = false;
    this.partialResults = '';
  }

  /**
   * Destroy voice recognition (call on unmount)
   * @returns {Promise<void>}
   */
  async destroy() {
    try {
      if (Voice) {
        await Voice.destroy();
        console.log('[SpeechRecognition] Native voice destroyed');
      }
    } catch (error) {
      console.error('[SpeechRecognition] Destroy error:', error);
    }
  }

  /**
   * Transcribe audio file using server-side API
   * For native platforms where Web Speech API is not available
   *
   * @param {string} audioUri - Local URI of audio file
   * @param {string} language - 'vi-VN' | 'en-US'
   * @returns {Promise<Object>} - { success, text, confidence, error }
   */
  async transcribeAudio(audioUri, language = 'vi-VN') {
    try {
      console.log('[SpeechRecognition] Transcribing audio:', audioUri);

      // For now, we'll use a simple approach
      // In production, you would:
      // 1. Upload audio to Supabase Storage
      // 2. Call an Edge Function that uses Google Cloud Speech-to-Text
      // 3. Return the transcription

      // Placeholder for server-side transcription
      // This would be replaced with actual API call
      const response = await this._callTranscriptionAPI(audioUri, language);

      return response;

    } catch (error) {
      console.error('[SpeechRecognition] Transcription error:', error);
      return {
        success: false,
        text: '',
        confidence: 0,
        error: error.message
      };
    }
  }

  /**
   * Call server-side transcription API (OpenAI Whisper via Supabase Edge Function)
   * @private
   * @param {string} audioUri - Local URI of audio file
   * @param {string} language - 'vi-VN' | 'en-US'
   * @returns {Promise<Object>} - { success, text, confidence, error }
   */
  async _callTranscriptionAPI(audioUri, language) {
    try {
      console.log('[SpeechRecognition] Calling transcription API...');
      console.log('[SpeechRecognition] Audio URI:', audioUri);
      console.log('[SpeechRecognition] Language:', language);

      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || SUPABASE_ANON_KEY;

      // Read audio file
      let audioBlob;
      let fileName = 'recording.m4a';

      if (Platform.OS === 'web') {
        // For web, fetch the blob from URI
        const response = await fetch(audioUri);
        audioBlob = await response.blob();
      } else {
        // For native (iOS/Android), read file and create blob
        const fileInfo = await FileSystem.getInfoAsync(audioUri);

        if (!fileInfo.exists) {
          console.error('[SpeechRecognition] Audio file not found:', audioUri);
          return {
            success: false,
            text: '',
            confidence: 0,
            error: 'audio_file_not_found'
          };
        }

        console.log('[SpeechRecognition] File size:', fileInfo.size);

        // Read file as base64
        const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Convert base64 to blob
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Determine MIME type from extension
        const extension = audioUri.split('.').pop()?.toLowerCase() || 'm4a';
        const mimeType = {
          'm4a': 'audio/m4a',
          'mp4': 'audio/mp4',
          'mp3': 'audio/mpeg',
          'wav': 'audio/wav',
          'webm': 'audio/webm',
        }[extension] || 'audio/m4a';

        audioBlob = new Blob([bytes], { type: mimeType });
        fileName = `recording.${extension}`;
      }

      console.log('[SpeechRecognition] Audio blob size:', audioBlob.size);

      // Create FormData
      const formData = new FormData();
      formData.append('audio', audioBlob, fileName);
      formData.append('language', language);

      // Call Edge Function
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/transcribe-audio`;
      console.log('[SpeechRecognition] Calling:', edgeFunctionUrl);

      const startTime = Date.now();

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const processingTime = Date.now() - startTime;
      console.log(`[SpeechRecognition] Response time: ${processingTime}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SpeechRecognition] API error:', response.status, errorText);

        return {
          success: false,
          text: '',
          confidence: 0,
          error: `api_error_${response.status}`,
          details: errorText
        };
      }

      const result = await response.json();
      console.log('[SpeechRecognition] Transcription result:', result);

      if (result.success && result.text) {
        return {
          success: true,
          text: result.text,
          confidence: 0.9, // Whisper doesn't return confidence, assume high
          processingTimeMs: result.processingTimeMs || processingTime
        };
      } else {
        return {
          success: false,
          text: '',
          confidence: 0,
          error: result.error || 'transcription_failed',
          code: result.code
        };
      }

    } catch (error) {
      console.error('[SpeechRecognition] Transcription API error:', error);
      return {
        success: false,
        text: '',
        confidence: 0,
        error: error.message || 'transcription_error'
      };
    }
  }

  /**
   * Use device text-to-speech (for reading responses)
   * @param {string} text
   * @param {string} language
   * @returns {Promise<void>}
   */
  /**
   * Cleanup primer sound (iOS silent mode TTS fix)
   */
  async _cleanupPrimerSound() {
    if (this.primerSound) {
      await this.primerSound.stopAsync().catch(() => {});
      await this.primerSound.unloadAsync().catch(() => {});
      this.primerSound = null;
    }
  }

  async speak(text, language = 'vi-VN') {
    try {
      // Cho phép phát âm thanh khi iPhone ở chế độ silent/vibrate
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      // Check if already speaking
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }

      // CRITICAL FIX: expo-speech (AVSpeechSynthesizer) on iOS respects mute switch
      // Audio.setAudioModeAsync does NOT affect it. Workaround: play a nearly-silent
      // sound via expo-av to force iOS audio session to playback mode.
      try {
        await this._cleanupPrimerSound();
        const { sound: primer } = await Audio.Sound.createAsync(
          require('../../assets/sounds/Ritual_sounds/chime.mp3'),
          { shouldPlay: true, isLooping: true, volume: 0.01 }
        );
        this.primerSound = primer;
      } catch (e) {
        console.log('[SpeechRecognition] Primer sound error (non-critical):', e.message);
      }

      await Speech.speak(text, {
        language: language,
        pitch: 1.0,
        rate: 0.9, // Slightly slower for Vietnamese
        onDone: async () => {
          console.log('[SpeechRecognition] Finished speaking');
          await this._cleanupPrimerSound();
        },
        onError: async (error) => {
          console.error('[SpeechRecognition] Speak error:', error);
          await this._cleanupPrimerSound();
        }
      });

      console.log('[SpeechRecognition] Speaking:', text.substring(0, 50) + '...');

    } catch (error) {
      console.error('[SpeechRecognition] Speak error:', error);
      await this._cleanupPrimerSound();
    }
  }

  /**
   * Stop text-to-speech
   * @returns {Promise<void>}
   */
  async stopSpeaking() {
    try {
      await Speech.stop();
      await this._cleanupPrimerSound();
    } catch (error) {
      console.error('[SpeechRecognition] Stop speaking error:', error);
    }
  }

  /**
   * Get available voices for a language
   * @param {string} language
   * @returns {Promise<Array>}
   */
  async getAvailableVoices(language = 'vi-VN') {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.filter(v =>
        v.language.startsWith(language.split('-')[0])
      );
    } catch (error) {
      console.error('[SpeechRecognition] Get voices error:', error);
      return [];
    }
  }
}

// Singleton instance
const speechRecognitionInstance = new SpeechRecognitionService();

export default speechRecognitionInstance;
export { SpeechRecognitionService };
