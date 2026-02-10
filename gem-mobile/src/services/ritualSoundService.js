/**
 * Ritual Sound Service
 * Play ambient and effect sounds for Vision Board rituals
 * Created: February 2026
 */

import { Audio } from 'expo-av';

// Sound file imports
const SOUND_FILES = {
  chime: require('../../assets/sounds/Ritual_sounds/chime.mp3'),
  cosmicAmbient: require('../../assets/sounds/Ritual_sounds/cosmic-ambient.mp3'),
  exhale: require('../../assets/sounds/Ritual_sounds/exhale-cue.mp3'),
  fireCrackling: require('../../assets/sounds/Ritual_sounds/fire-crackling.mp3.wav'),
  gentleWind: require('../../assets/sounds/Ritual_sounds/gentle-wind.wav'),
  heartbeat: require('../../assets/sounds/Ritual_sounds/heartbeat.mp3'),
  holdTone: require('../../assets/sounds/Ritual_sounds/hold-tone.wav'),
  inhale: require('../../assets/sounds/Ritual_sounds/inhale-cue.wav'),
  levelUp: require('../../assets/sounds/Ritual_sounds/level-up.mp3'),
  paperBurn: require('../../assets/sounds/Ritual_sounds/paper-burn.mp3'),
  sparkle: require('../../assets/sounds/Ritual_sounds/sparkle.wav'),
  starryNight: require('../../assets/sounds/Ritual_sounds/starry-night.wav'),
  success: require('../../assets/sounds/Ritual_sounds/success.wav'),
  waterFlow: require('../../assets/sounds/Ritual_sounds/water-flow.mp3'),
  waterSplash: require('../../assets/sounds/Ritual_sounds/water-splash.mp3'),
  whoosh: require('../../assets/sounds/Ritual_sounds/whoosh.mp3'),
};

// Sound mapping for each ritual
export const RITUAL_SOUNDS = {
  'heart-expansion': {
    ambient: 'heartbeat',
    action: 'sparkle',
    complete: 'success',
    description: 'Heartbeat ambient với sparkle effect',
  },
  'gratitude-flow': {
    ambient: 'cosmicAmbient',
    action: 'chime',
    complete: 'success',
    description: 'Cosmic ambient với chime khi thêm gratitude',
  },
  'cleansing-breath': {
    ambient: 'gentleWind',
    inhale: 'inhale',
    hold: 'holdTone',
    exhale: 'exhale',
    complete: 'success',
    description: 'Breath cues với gentle wind ambient',
  },
  'water-manifest': {
    ambient: 'waterFlow',
    action: 'waterSplash',
    complete: 'success',
    description: 'Water flow ambient với splash effect',
  },
  'letter-to-universe': {
    ambient: 'cosmicAmbient',
    action: 'whoosh',
    sending: 'starryNight',
    complete: 'levelUp',
    description: 'Cosmic ambient với whoosh khi gửi',
  },
  'burn-release': {
    ambient: 'fireCrackling',
    action: 'paperBurn',
    release: 'whoosh',
    complete: 'success',
    description: 'Fire crackling với paper burn effect',
  },
  'star-wish': {
    ambient: 'starryNight',
    action: 'sparkle',
    wish: 'whoosh',
    complete: 'success',
    description: 'Starry night ambient với sparkle effect',
  },
  'crystal-healing': {
    ambient: 'cosmicAmbient',
    select: 'chime',
    healing: 'sparkle',
    complete: 'success',
    description: 'Cosmic ambient với chime và sparkle',
  },
};

class RitualSoundService {
  constructor() {
    this.sounds = {};
    this.ambientSound = null;
    this.isAmbientPlaying = false;
    this.currentRitual = null;
    this.isEnabled = true;
    this.isInitialized = false;
    this.initPromise = null;
  }

  /**
   * Initialize audio settings
   * ALWAYS re-sets audio mode to ensure correct state,
   * since other components (e.g. primer sound in GoalDetailScreen)
   * may have changed the audio session configuration.
   */
  async init() {
    // If init is in progress, wait for it
    if (this.initPromise) {
      console.log('[RitualSound] Init in progress, waiting...');
      return this.initPromise;
    }

    // Start initialization (always re-set audio mode)
    this.initPromise = this._doInit();
    return this.initPromise;
  }

  /**
   * Internal init implementation
   */
  async _doInit() {
    try {
      console.log('[RitualSound] Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
      this.initPromise = null;
      console.log('[RitualSound] Audio mode set successfully');
    } catch (error) {
      console.error('[RitualSound] Init error:', error);
      // Reset promise so init can be retried
      this.initPromise = null;
    }
  }

  /**
   * Ensure init is complete before proceeding
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  /**
   * Force re-set audio mode regardless of initialization state.
   * Call this when entering a ritual screen to reclaim audio session
   * from other components that may have changed it.
   */
  async forceResetAudioMode() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
      console.log('[RitualSound] Audio mode force-reset');
    } catch (error) {
      console.error('[RitualSound] Force reset error:', error);
    }
  }

  /**
   * Enable/disable sound
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  /**
   * Load a sound file
   */
  async loadSound(soundKey) {
    if (this.sounds[soundKey]) {
      return this.sounds[soundKey];
    }

    const soundFile = SOUND_FILES[soundKey];
    if (!soundFile) {
      console.warn('[RitualSound] Sound not found:', soundKey);
      return null;
    }

    try {
      // Ensure audio mode is set before loading sounds
      await this.ensureInitialized();

      const { sound } = await Audio.Sound.createAsync(soundFile, { shouldPlay: false });
      this.sounds[soundKey] = sound;
      return sound;
    } catch (error) {
      console.error('[RitualSound] Load error:', soundKey, error);
      return null;
    }
  }

  /**
   * Play a one-shot sound effect
   */
  async playEffect(soundKey, volume = 1.0) {
    if (!this.isEnabled) return;

    try {
      // Ensure audio mode is set before playing
      await this.ensureInitialized();

      const sound = await this.loadSound(soundKey);
      if (!sound) return;

      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(volume);
      await sound.playAsync();

      console.log('[RitualSound] Playing effect:', soundKey);
    } catch (error) {
      console.error('[RitualSound] Play effect error:', soundKey, error);
    }
  }

  /**
   * Start ambient sound loop for a ritual
   */
  async startAmbient(ritualId, volume = 0.5) {
    if (!this.isEnabled) return;

    const ritualSounds = RITUAL_SOUNDS[ritualId];
    if (!ritualSounds?.ambient) {
      console.warn('[RitualSound] No ambient sound for ritual:', ritualId);
      return;
    }

    // Stop current ambient if different ritual
    if (this.currentRitual !== ritualId) {
      await this.stopAmbient();
    }

    try {
      // Ensure audio mode is set before playing
      await this.ensureInitialized();

      const soundKey = ritualSounds.ambient;
      const sound = await this.loadSound(soundKey);
      if (!sound) return;

      this.ambientSound = sound;
      this.currentRitual = ritualId;

      await sound.setIsLoopingAsync(true);
      await sound.setVolumeAsync(volume);
      await sound.setPositionAsync(0);
      await sound.playAsync();

      this.isAmbientPlaying = true;
      console.log('[RitualSound] Started ambient:', soundKey, 'for', ritualId);
    } catch (error) {
      console.error('[RitualSound] Start ambient error:', error);
    }
  }

  /**
   * Stop ambient sound
   */
  async stopAmbient() {
    if (this.ambientSound) {
      try {
        await this.ambientSound.stopAsync();
        await this.ambientSound.setPositionAsync(0);
        this.isAmbientPlaying = false;
        console.log('[RitualSound] Stopped ambient');
      } catch (error) {
        console.error('[RitualSound] Stop ambient error:', error);
      }
    }
    this.currentRitual = null;
  }

  /**
   * Pause ambient sound
   */
  async pauseAmbient() {
    if (this.ambientSound && this.isAmbientPlaying) {
      try {
        await this.ambientSound.pauseAsync();
        this.isAmbientPlaying = false;
        console.log('[RitualSound] Paused ambient');
      } catch (error) {
        console.error('[RitualSound] Pause ambient error:', error);
      }
    }
  }

  /**
   * Resume ambient sound
   */
  async resumeAmbient() {
    if (this.ambientSound && !this.isAmbientPlaying && this.isEnabled) {
      try {
        // Ensure audio mode is set before resuming
        await this.ensureInitialized();
        await this.ambientSound.playAsync();
        this.isAmbientPlaying = true;
        console.log('[RitualSound] Resumed ambient');
      } catch (error) {
        console.error('[RitualSound] Resume ambient error:', error);
      }
    }
  }

  /**
   * Set ambient volume
   */
  async setAmbientVolume(volume) {
    if (this.ambientSound) {
      try {
        await this.ambientSound.setVolumeAsync(volume);
      } catch (error) {
        console.error('[RitualSound] Set volume error:', error);
      }
    }
  }

  /**
   * Play ritual-specific action sound
   */
  async playRitualSound(ritualId, soundType = 'action', volume = 1.0) {
    if (!this.isEnabled) return;

    const ritualSounds = RITUAL_SOUNDS[ritualId];
    if (!ritualSounds) {
      console.warn('[RitualSound] Unknown ritual:', ritualId);
      return;
    }

    const soundKey = ritualSounds[soundType];
    if (!soundKey) {
      console.warn('[RitualSound] No sound type', soundType, 'for ritual:', ritualId);
      return;
    }

    await this.playEffect(soundKey, volume);
  }

  /**
   * Play completion sound for ritual
   */
  async playComplete(ritualId) {
    await this.playRitualSound(ritualId, 'complete', 1.0);
  }

  /**
   * Stop all sounds and cleanup
   */
  async stopAll() {
    await this.stopAmbient();

    // Stop all loaded sounds
    for (const [key, sound] of Object.entries(this.sounds)) {
      try {
        await sound.stopAsync();
      } catch (error) {
        // Ignore errors on cleanup
      }
    }

    console.log('[RitualSound] Stopped all');
  }

  /**
   * Unload all sounds (call on unmount)
   */
  async cleanup() {
    await this.stopAll();

    for (const [key, sound] of Object.entries(this.sounds)) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        // Ignore errors on cleanup
      }
    }

    this.sounds = {};
    this.ambientSound = null;
    // Reset initialization state so audio mode can be re-set if needed
    this.isInitialized = false;
    this.initPromise = null;
    console.log('[RitualSound] Cleaned up');
  }

  // ========== Breathing-specific methods ==========

  /**
   * Play inhale cue
   */
  async playInhale() {
    await this.playEffect('inhale', 0.8);
  }

  /**
   * Play hold cue
   */
  async playHold() {
    await this.playEffect('holdTone', 0.6);
  }

  /**
   * Play exhale cue
   */
  async playExhale() {
    await this.playEffect('exhale', 0.8);
  }

  // ========== Common effect methods ==========

  /**
   * Play chime sound
   */
  async playChime() {
    await this.playEffect('chime', 0.9);
  }

  /**
   * Play sparkle sound
   */
  async playSparkle() {
    await this.playEffect('sparkle', 0.9);
  }

  /**
   * Play whoosh sound
   */
  async playWhoosh() {
    await this.playEffect('whoosh', 0.9);
  }

  /**
   * Play success sound
   */
  async playSuccess() {
    await this.playEffect('success', 1.0);
  }

  /**
   * Play level up sound
   */
  async playLevelUp() {
    await this.playEffect('levelUp', 1.0);
  }
}

// Export singleton instance
export const ritualSoundService = new RitualSoundService();
export default ritualSoundService;
