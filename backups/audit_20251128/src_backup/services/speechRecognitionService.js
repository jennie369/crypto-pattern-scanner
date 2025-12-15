/**
 * GEM Mobile - Speech Recognition Service
 * Day 11-12: Voice Input Implementation
 *
 * STRATEGY:
 * - Use Web Speech API (via expo-speech or browser API)
 * - Fallback to Google Cloud Speech API for better Vietnamese support
 * - Handle real-time transcription where possible
 *
 * SUPPORTED LANGUAGES:
 * - Vietnamese (vi-VN) - Primary
 * - English (en-US) - Secondary
 */

import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

class SpeechRecognitionService {
  constructor() {
    this.isListening = false;
    this.recognition = null;
    this.language = 'vi-VN';
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
  }

  /**
   * Check if speech recognition is available
   * @returns {boolean}
   */
  isAvailable() {
    if (Platform.OS === 'web') {
      return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }
    // For native, we'll use a third-party service
    return true;
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
   * Start speech recognition (Web platform)
   * @param {Object} callbacks - { onResult, onError, onEnd }
   * @returns {Promise<boolean>}
   */
  async startListening(callbacks = {}) {
    this.onResultCallback = callbacks.onResult;
    this.onErrorCallback = callbacks.onError;
    this.onEndCallback = callbacks.onEnd;

    if (Platform.OS === 'web') {
      return this._startWebListening();
    }

    // For native platforms, return audio URI for server-side processing
    console.log('[SpeechRecognition] Native platform - use voiceService for recording');
    return true;
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
    if (Platform.OS === 'web' && this.recognition) {
      try {
        this.recognition.stop();
        console.log('[SpeechRecognition] Stopped listening');
      } catch (error) {
        console.error('[SpeechRecognition] Stop error:', error);
      }
    }

    this.isListening = false;
  }

  /**
   * Cancel speech recognition
   * @returns {Promise<void>}
   */
  async cancelListening() {
    if (Platform.OS === 'web' && this.recognition) {
      try {
        this.recognition.abort();
        console.log('[SpeechRecognition] Cancelled listening');
      } catch (error) {
        console.error('[SpeechRecognition] Cancel error:', error);
      }
    }

    this.isListening = false;
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
   * Call server-side transcription API
   * @private
   */
  async _callTranscriptionAPI(audioUri, language) {
    // TODO: Implement server-side transcription
    // For MVP, we'll simulate the transcription
    // In production, this would call a Supabase Edge Function

    /*
    Example implementation with Supabase Edge Function:

    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a'
    });
    formData.append('language', language);

    const response = await fetch(
      'https://your-project.supabase.co/functions/v1/transcribe-audio',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.auth.session()?.access_token}`,
        },
        body: formData
      }
    );

    const data = await response.json();
    return {
      success: true,
      text: data.transcript,
      confidence: data.confidence
    };
    */

    // Temporary: Return placeholder
    console.log('[SpeechRecognition] Server-side transcription not implemented yet');
    return {
      success: false,
      text: '',
      confidence: 0,
      error: 'server_transcription_not_implemented'
    };
  }

  /**
   * Use device text-to-speech (for reading responses)
   * @param {string} text
   * @param {string} language
   * @returns {Promise<void>}
   */
  async speak(text, language = 'vi-VN') {
    try {
      // Check if already speaking
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }

      await Speech.speak(text, {
        language: language,
        pitch: 1.0,
        rate: 0.9, // Slightly slower for Vietnamese
        onDone: () => {
          console.log('[SpeechRecognition] Finished speaking');
        },
        onError: (error) => {
          console.error('[SpeechRecognition] Speak error:', error);
        }
      });

      console.log('[SpeechRecognition] Speaking:', text.substring(0, 50) + '...');

    } catch (error) {
      console.error('[SpeechRecognition] Speak error:', error);
    }
  }

  /**
   * Stop text-to-speech
   * @returns {Promise<void>}
   */
  async stopSpeaking() {
    try {
      await Speech.stop();
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
