/**
 * useAudioOutput Hook
 * Manages speaker/earpiece toggle for calls
 */

import { useState, useCallback } from 'react';
import { Audio } from 'expo-av';

/**
 * Hook for managing audio output (speaker/earpiece)
 * @param {boolean} initialSpeakerOn - Initial speaker state
 * @returns {Object} { isSpeakerOn, toggleSpeaker, setSpeaker }
 */
export const useAudioOutput = (initialSpeakerOn = false) => {
  const [isSpeakerOn, setIsSpeakerOn] = useState(initialSpeakerOn);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Set audio output mode
   * @param {boolean} useSpeaker - true for speaker, false for earpiece
   */
  const setSpeaker = useCallback(async (useSpeaker) => {
    try {
      setIsLoading(true);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: !useSpeaker,
      });

      setIsSpeakerOn(useSpeaker);
      console.log('[useAudioOutput] Speaker set to:', useSpeaker);
    } catch (error) {
      console.error('[useAudioOutput] Error setting speaker:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Toggle between speaker and earpiece
   */
  const toggleSpeaker = useCallback(async () => {
    await setSpeaker(!isSpeakerOn);
  }, [isSpeakerOn, setSpeaker]);

  /**
   * Initialize audio mode for call
   */
  const initializeForCall = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: true, // Start with earpiece
      });
      setIsSpeakerOn(false);
      console.log('[useAudioOutput] Audio initialized for call');
    } catch (error) {
      console.error('[useAudioOutput] Error initializing audio:', error);
    }
  }, []);

  /**
   * Reset audio mode after call
   */
  const resetAudio = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      setIsSpeakerOn(false);
      console.log('[useAudioOutput] Audio reset after call');
    } catch (error) {
      console.error('[useAudioOutput] Error resetting audio:', error);
    }
  }, []);

  return {
    isSpeakerOn,
    isLoading,
    toggleSpeaker,
    setSpeaker,
    initializeForCall,
    resetAudio,
  };
};

export default useAudioOutput;
