/**
 * Tarot Sound Effects Service
 * Audio effects for Tarot and I-Ching features
 */

import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_ENABLED_KEY = 'tarot_sound_effects_enabled';
const SOUND_VOLUME_KEY = 'tarot_sound_effects_volume';

class TarotSoundEffects {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.7;
    this.initialized = false;
  }

  /**
   * Initialize sound service and load preferences
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Load preferences
      const [enabledStr, volumeStr] = await Promise.all([
        AsyncStorage.getItem(SOUND_ENABLED_KEY),
        AsyncStorage.getItem(SOUND_VOLUME_KEY),
      ]);

      this.enabled = enabledStr !== 'false';
      this.volume = volumeStr ? parseFloat(volumeStr) : 0.7;

      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      this.initialized = true;
      console.log('[TarotSoundEffects] Initialized - enabled:', this.enabled, 'volume:', this.volume);
    } catch (error) {
      console.error('[TarotSoundEffects] Initialization error:', error);
    }
  }

  /**
   * Load a sound file
   * @param {string} name - Sound identifier
   * @param {any} source - require() source
   */
  async loadSound(name, source) {
    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        volume: this.volume,
        shouldPlay: false,
      });
      this.sounds[name] = sound;
      console.log('[TarotSoundEffects] Loaded sound:', name);
    } catch (error) {
      console.error('[TarotSoundEffects] Error loading sound:', name, error);
    }
  }

  /**
   * Play a sound by name
   * @param {string} name - Sound identifier
   */
  async playSound(name) {
    if (!this.enabled) return;

    try {
      const sound = this.sounds[name];
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.setVolumeAsync(this.volume);
        await sound.playAsync();
      } else {
        // Silently fail if sound not loaded
        console.log('[TarotSoundEffects] Sound not loaded:', name);
      }
    } catch (error) {
      console.error('[TarotSoundEffects] Error playing sound:', name, error);
    }
  }

  /**
   * Card flip sound effect
   */
  async playCardFlip() {
    await this.playSound('card_flip');
  }

  /**
   * Shuffle sound effect
   */
  async playShuffle() {
    await this.playSound('shuffle');
  }

  /**
   * Coin toss sound effect
   */
  async playCoinToss() {
    await this.playSound('coin_toss');
  }

  /**
   * Success/completion sound
   */
  async playSuccess() {
    await this.playSound('success');
  }

  /**
   * Mystic ambient sound
   */
  async playMystic() {
    await this.playSound('mystic');
  }

  /**
   * Set sound enabled/disabled
   * @param {boolean} enabled
   */
  async setEnabled(enabled) {
    this.enabled = enabled;
    try {
      await AsyncStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
      console.log('[TarotSoundEffects] Sound enabled:', enabled);
    } catch (error) {
      console.error('[TarotSoundEffects] Error saving enabled state:', error);
    }
  }

  /**
   * Get current enabled state
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Set volume level
   * @param {number} volume - 0.0 to 1.0
   */
  async setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    try {
      await AsyncStorage.setItem(SOUND_VOLUME_KEY, String(this.volume));

      // Update volume on all loaded sounds
      for (const sound of Object.values(this.sounds)) {
        await sound.setVolumeAsync(this.volume);
      }

      console.log('[TarotSoundEffects] Volume set:', this.volume);
    } catch (error) {
      console.error('[TarotSoundEffects] Error saving volume:', error);
    }
  }

  /**
   * Get current volume
   * @returns {number}
   */
  getVolume() {
    return this.volume;
  }

  /**
   * Preload all sound effects
   * Call this during app initialization or screen mount
   */
  async preloadSounds() {
    await this.initialize();

    // Note: Sound files would need to be added to assets/sounds folder
    // Uncomment when sound files are available:
    // await this.loadSound('card_flip', require('../assets/sounds/card_flip.mp3'));
    // await this.loadSound('shuffle', require('../assets/sounds/shuffle.mp3'));
    // await this.loadSound('coin_toss', require('../assets/sounds/coin_toss.mp3'));
    // await this.loadSound('success', require('../assets/sounds/success.mp3'));
    // await this.loadSound('mystic', require('../assets/sounds/mystic_ambient.mp3'));

    console.log('[TarotSoundEffects] Preload complete (no sound files loaded yet)');
  }

  /**
   * Cleanup and unload all sounds
   */
  async cleanup() {
    try {
      for (const [name, sound] of Object.entries(this.sounds)) {
        await sound.unloadAsync();
        console.log('[TarotSoundEffects] Unloaded sound:', name);
      }
      this.sounds = {};
    } catch (error) {
      console.error('[TarotSoundEffects] Cleanup error:', error);
    }
  }

  /**
   * Stop all currently playing sounds
   */
  async stopAll() {
    try {
      for (const sound of Object.values(this.sounds)) {
        const status = await sound.getStatusAsync();
        if (status.isPlaying) {
          await sound.stopAsync();
        }
      }
    } catch (error) {
      console.error('[TarotSoundEffects] Stop all error:', error);
    }
  }
}

// Export singleton instance
const tarotSoundEffects = new TarotSoundEffects();
export default tarotSoundEffects;

// Named exports for convenience
export const playCardFlip = () => tarotSoundEffects.playCardFlip();
export const playShuffle = () => tarotSoundEffects.playShuffle();
export const playCoinToss = () => tarotSoundEffects.playCoinToss();
export const playSuccess = () => tarotSoundEffects.playSuccess();
export const playMystic = () => tarotSoundEffects.playMystic();
export const setVolume = (v) => tarotSoundEffects.setVolume(v);
export const setEnabled = (e) => tarotSoundEffects.setEnabled(e);
export const preloadSounds = () => tarotSoundEffects.preloadSounds();
