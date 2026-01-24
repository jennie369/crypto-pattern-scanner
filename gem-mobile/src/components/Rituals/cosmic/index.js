/**
 * Cosmic Components - Shared components for Rituals Cosmic Glassmorphism
 * Export all cosmic components from this file
 */

// Background
export { default as CosmicBackground } from './CosmicBackground';
export { default as VideoBackground, preloadVideo, clearPreloadedVideos } from './VideoBackground';

// Lottie Animations
export { default as RitualAnimation } from './RitualAnimation';

// Cards
export { default as GlassCard, GlassInputCard, GlassButtonCard } from './GlassCard';

// Orbs and Buttons
export { default as GlowingOrb } from './GlowingOrb';
export { default as GlowButton, GlowIconButton } from './GlowButton';

// Particles
export { default as ParticleField } from './ParticleField';

// Progress and Indicators
export { default as PulsingCircle, usePulsingCircleControl } from './PulsingCircle';
export { default as ProgressRing, ProgressRingWithIcon, MiniProgressRing, StackedProgressRings } from './ProgressRing';

// Celebration
export { default as CompletionCelebration } from './CompletionCelebration';

// Text
export { default as InstructionText, AnimatedInstruction, TitleText, SubtitleText, HintText } from './InstructionText';

// Header
export { default as RitualHeader, MinimalRitualHeader } from './RitualHeader';

// Re-export theme tokens for convenience
export { COSMIC_COLORS, COSMIC_GRADIENTS, COSMIC_SHADOWS, COSMIC_ANIMATIONS, COSMIC_SPACING, COSMIC_RADIUS, COSMIC_TYPOGRAPHY, GLASS_STYLES, COSMIC_LAYOUT, PARTICLE_CONFIGS } from '../../../theme/cosmicTokens';

// Re-export animation utilities
export { COSMIC_TIMING, ANIMATION_PRESETS, createPulseAnimation, createGlowAnimation, createFloatAnimation, createBreathAnimation, createBoxBreathAnimation, createRelaxingBreathAnimation, createParticleAnimation, createTwinkleAnimation, createPressAnimation, createReleaseAnimation, createLongPressAnimation, createSuccessAnimation, createSparkleAnimation, createCounterAnimation, createRippleAnimation, createExpandingRingsAnimation, createFadeInAnimation, createFadeOutAnimation, createSlideUpAnimation, createScaleEntranceAnimation, createEnergyFlowAnimation, createFlameFlickerAnimation, createBurnAnimation, createShootingStarAnimation, createLetterFlyAnimation, createGodRaysAnimation, cancelCosmicAnimation, resetAnimation } from '../../../utils/cosmicAnimations';

// Re-export haptic patterns
export { HAPTIC_PATTERNS, HAPTIC_IMPACT, HAPTIC_NOTIFICATION, HAPTIC_SELECTION, safeHaptic, playHapticSequence, createDebouncedHaptic, createThrottledHaptic } from '../../../utils/hapticPatterns';
