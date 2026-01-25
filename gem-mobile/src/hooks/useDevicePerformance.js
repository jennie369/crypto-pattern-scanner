/**
 * Device Performance Detection Hook
 * Detect device tier to adjust animations/effects
 * Phase 2: VisionBoard Upgrade
 */

import { useState, useEffect } from 'react';
import { Platform, Dimensions, PixelRatio } from 'react-native';
import * as Device from 'expo-device';

const HOOK_NAME = '[useDevicePerformance]';

// Global cache for device tier (singleton pattern)
// This ensures ALL components get the same tier
let globalTier = null;
let globalFeatures = null;
let detectionPromise = null;

// Device tiers
export const DEVICE_TIERS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Feature flags based on tier
export const TIER_FEATURES = {
  [DEVICE_TIERS.LOW]: {
    enableParticles: false,
    enableVideoBackground: false,
    maxConcurrentAnimations: 2,
    enableBlur: false,
    enableShadows: false,
    particleCount: 5,
    animationSpeed: 0.8,
  },
  [DEVICE_TIERS.MEDIUM]: {
    enableParticles: true,
    enableVideoBackground: true,
    maxConcurrentAnimations: 3,
    enableBlur: true,
    enableShadows: true,
    particleCount: 15,
    animationSpeed: 1,
  },
  [DEVICE_TIERS.HIGH]: {
    enableParticles: true,
    enableVideoBackground: true,
    maxConcurrentAnimations: 5,
    enableBlur: true,
    enableShadows: true,
    particleCount: 25,
    animationSpeed: 1,
  },
};

/**
 * Detect device performance tier
 * @returns {Promise<string>} Device tier: 'low' | 'medium' | 'high'
 */
const detectDeviceTier = async () => {
  try {
    const { width, height } = Dimensions.get('window');
    const pixelRatio = PixelRatio.get();

    // Get device info
    const deviceType = await Device.getDeviceTypeAsync();
    const totalMemory = Device.totalMemory;
    const modelName = Device.modelName || '';

    // Calculate score
    let score = 0;

    // Screen resolution (higher = better device)
    const screenScore = (width * height * pixelRatio) / 1000000;
    score += screenScore > 3 ? 3 : screenScore > 1.5 ? 2 : 1;

    // Platform bonus
    if (Platform.OS === 'ios') {
      score += 1; // iOS generally has better optimization
    }

    // Pixel ratio bonus
    if (pixelRatio >= 3) {
      score += 1;
    }

    // Device type bonus
    if (deviceType === Device.DeviceType.TABLET) {
      score += 0.5; // Tablets usually have more resources
    }

    // Memory check (if available)
    if (totalMemory && totalMemory > 4 * 1024 * 1024 * 1024) {
      score += 1; // More than 4GB RAM
    }

    // Check for specific low-end device patterns
    const lowEndPatterns = ['Redmi', 'POCO', 'Realme', 'Samsung A', 'Oppo A'];
    if (lowEndPatterns.some((pattern) => modelName.includes(pattern))) {
      score -= 1;
    }

    // Check for high-end device patterns
    const highEndPatterns = ['iPhone 1', 'iPhone 14', 'iPhone 15', 'Pro', 'Ultra', 'Galaxy S2'];
    if (highEndPatterns.some((pattern) => modelName.includes(pattern))) {
      score += 1;
    }

    console.log(HOOK_NAME, 'Device score:', score, {
      width,
      height,
      pixelRatio,
      modelName,
      totalMemory: totalMemory ? `${Math.round(totalMemory / 1024 / 1024)}MB` : 'unknown',
    });

    // Determine tier
    if (score >= 4) return DEVICE_TIERS.HIGH;
    if (score >= 2) return DEVICE_TIERS.MEDIUM;
    return DEVICE_TIERS.LOW;
  } catch (error) {
    console.warn(HOOK_NAME, 'Detection error:', error?.message);
    return DEVICE_TIERS.MEDIUM; // Default to medium
  }
};

/**
 * useDevicePerformance Hook
 *
 * @returns {object} { tier, features, isLowEnd, isHighEnd, isDetecting }
 *
 * @example
 * const { tier, features, isLowEnd } = useDevicePerformance();
 *
 * // Conditionally render heavy components
 * {features.enableVideoBackground && <VideoBackground />}
 *
 * // Adjust particle count
 * <ParticleField count={features.particleCount} />
 */
const useDevicePerformance = () => {
  // Use global cache if available for instant, consistent results
  const [tier, setTier] = useState(globalTier || DEVICE_TIERS.MEDIUM);
  const [features, setFeatures] = useState(globalFeatures || TIER_FEATURES[DEVICE_TIERS.MEDIUM]);
  const [isDetecting, setIsDetecting] = useState(!globalTier);

  useEffect(() => {
    // If already detected globally, use cached values
    if (globalTier) {
      setTier(globalTier);
      setFeatures(globalFeatures);
      setIsDetecting(false);
      return;
    }

    let mounted = true;

    const detect = async () => {
      // Use singleton promise to prevent multiple detections
      if (!detectionPromise) {
        detectionPromise = detectDeviceTier();
      }

      const detectedTier = await detectionPromise;

      // Cache globally
      globalTier = detectedTier;
      globalFeatures = TIER_FEATURES[detectedTier];

      if (mounted) {
        setTier(detectedTier);
        setFeatures(TIER_FEATURES[detectedTier]);
        setIsDetecting(false);
        console.log(HOOK_NAME, 'Detected tier (cached globally):', detectedTier);
      }
    };

    detect();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    tier,
    features,
    isLowEnd: tier === DEVICE_TIERS.LOW,
    isHighEnd: tier === DEVICE_TIERS.HIGH,
    isDetecting,
  };
};

export default useDevicePerformance;
