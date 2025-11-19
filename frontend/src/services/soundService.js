/**
 * Sound Service for Chatbot
 * Manages sound effects and user preferences
 */

class SoundService {
  constructor() {
    this.enabled = this.loadPreference();
    this.sounds = {
      send: this.createBeep(800, 0.1, 'sine'),      // Higher pitch for sending
      receive: this.createBeep(600, 0.15, 'sine'),  // Lower pitch for receiving
      error: this.createBeep(400, 0.2, 'square')    // Error sound
    };
  }

  /**
   * Create beep sound using Web Audio API
   */
  createBeep(frequency, duration, type = 'sine') {
    return () => {
      if (!this.enabled) return;

      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        // Fade in/out for smoother sound
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      } catch (error) {
        console.warn('Sound playback failed:', error);
      }
    };
  }

  /**
   * Play sound by type
   */
  play(type) {
    if (this.enabled && this.sounds[type]) {
      this.sounds[type]();
    }
  }

  /**
   * Toggle sound on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    this.savePreference();

    // Play test sound when enabling
    if (this.enabled) {
      this.play('send');
    }

    return this.enabled;
  }

  /**
   * Check if sound is enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Load preference from localStorage
   */
  loadPreference() {
    try {
      const saved = localStorage.getItem('gem-chatbot-sound');
      return saved === null ? true : saved === 'true'; // Default: enabled
    } catch {
      return true;
    }
  }

  /**
   * Save preference to localStorage
   */
  savePreference() {
    try {
      localStorage.setItem('gem-chatbot-sound', this.enabled.toString());
    } catch (error) {
      console.warn('Failed to save sound preference:', error);
    }
  }
}

// Export singleton instance
export const soundService = new SoundService();
