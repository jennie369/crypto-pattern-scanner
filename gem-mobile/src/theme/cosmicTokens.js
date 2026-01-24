/**
 * Cosmic Glassmorphism Design Tokens
 * Ritual UI Redesign - GEM Mobile
 *
 * Design System cho 7 Rituals với style cosmic mystical
 */

// ═══════════════════════════════════════════════════════════
// COSMIC COLORS
// ═══════════════════════════════════════════════════════════
export const COSMIC_COLORS = {
  // ========== BACKGROUND LAYERS ==========
  bgDeepSpace: '#05040B',      // Layer 0 - Deepest
  bgCosmic: '#0D0D2B',         // Layer 1 - Primary bg
  bgNebula: '#1A1A3E',         // Layer 2 - Secondary
  bgMystic: '#2D1B4E',         // Layer 3 - Tertiary
  bgGalaxy: '#1E1033',         // Layer 4 - Accent

  // ========== GLASS PROPERTIES ==========
  glass: {
    bg: 'rgba(13, 13, 43, 0.6)',           // Glass background
    bgLight: 'rgba(255, 255, 255, 0.05)',  // Light glass
    bgDark: 'rgba(0, 0, 0, 0.3)',          // Dark glass
    border: 'rgba(255, 255, 255, 0.1)',    // Glass border
    borderGlow: 'rgba(106, 91, 255, 0.3)', // Glowing border
    blur: 20,                               // Blur intensity
  },

  // ========== GLOW ACCENTS ==========
  glow: {
    gold: '#FFBD59',
    goldBright: '#FFD700',
    cyan: '#00F0FF',
    purple: '#A855F7',
    pink: '#EC4899',
    green: '#10B981',
    blue: '#3B82F6',
    orange: '#F97316',
    white: '#FFFFFF',
    red: '#FF6B6B',
  },

  // ========== RITUAL THEME COLORS ==========
  ritualThemes: {
    heart: {
      primary: '#FF69B4',
      secondary: '#FF1493',
      deep: '#C71585',
      light: '#FFB6C1',
      soft: '#FFC0CB',
      glow: 'rgba(255, 105, 180, 0.5)',
      glowIntense: 'rgba(255, 105, 180, 0.8)',
      gradient: ['#FF69B4', '#FF1493', '#C71585'],
      bgGradient: ['#0D0D2B', '#1A0D2B', '#2D1A3E'],
    },
    gratitude: {
      primary: '#FFD700',
      secondary: '#FFA500',
      deep: '#FF8C00',
      light: '#FFE4B5',
      soft: '#FFFBD1',
      glow: 'rgba(255, 215, 0, 0.5)',
      glowIntense: 'rgba(255, 215, 0, 0.8)',
      gradient: ['#FFD700', '#FFA500', '#FF8C00'],
      bgGradient: ['#0D0D2B', '#1A1500', '#2D2500'],
    },
    breath: {
      primary: '#00F0FF',
      secondary: '#00CED1',
      deep: '#008B8B',
      light: '#E0FFFF',
      soft: '#F0FFFF',
      glow: 'rgba(0, 240, 255, 0.5)',
      glowIntense: 'rgba(0, 240, 255, 0.8)',
      gradient: ['#00F0FF', '#00CED1', '#008B8B'],
      bgGradient: ['#0D0D2B', '#0A1628', '#152238'],
      // Phase-specific colors
      phases: {
        inhale: '#00F0FF',
        hold: '#764BA2',
        exhale: '#4ECDC4',
        rest: '#44A08D',
      },
    },
    water: {
      primary: '#4169E1',
      secondary: '#1E90FF',
      deep: '#00BFFF',
      light: '#87CEEB',
      soft: '#E0E0FF',
      glow: 'rgba(65, 105, 225, 0.5)',
      glowIntense: 'rgba(65, 105, 225, 0.8)',
      gradient: ['#4169E1', '#1E90FF', '#00BFFF'],
      bgGradient: ['#0D0D2B', '#0A1628', '#152238'],
    },
    letter: {
      primary: '#A855F7',
      secondary: '#8B5CF6',
      deep: '#7C3AED',
      light: '#C4B5FD',
      soft: '#E9D5FF',
      glow: 'rgba(168, 85, 247, 0.5)',
      glowIntense: 'rgba(168, 85, 247, 0.8)',
      gradient: ['#A855F7', '#8B5CF6', '#7C3AED'],
      bgGradient: ['#0D0D2B', '#1A0D2B', '#2D1B4E'],
      // Galaxy-specific colors
      galaxy: {
        nebulaPurple: '#8B5CF6',
        nebulaPink: '#EC4899',
        nebulaBlue: '#3B82F6',
        nebulaCyan: '#06B6D4',
        starWhite: '#FFFFFF',
        starGold: '#FFD700',
        lightCore: '#FFF8E1',
      },
    },
    burn: {
      primary: '#FF6B35',
      secondary: '#FF4500',
      deep: '#FF0000',
      light: '#FFC940',
      soft: '#FFE0B2',
      glow: 'rgba(255, 107, 53, 0.5)',
      glowIntense: 'rgba(255, 107, 53, 0.8)',
      gradient: ['#FF6B35', '#FF4500', '#FF0000'],
      bgGradient: ['#0D0D2B', '#1A0A0A', '#2D1010'],
      // Fire-specific colors
      fire: {
        core: '#FFFFFF',
        inner: '#FFC940',
        outer: '#FF9330',
        tip: '#FF6B6B',
        ember: '#FF6B00',
        ash: '#666666',
        char: '#1A1A1A',
      },
    },
    star: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
      deep: '#C0C0C0',
      light: '#F5F5F5',
      soft: '#FAFAFA',
      glow: 'rgba(255, 255, 255, 0.6)',
      glowIntense: 'rgba(255, 255, 255, 0.9)',
      gradient: ['#FFFFFF', '#E0E0E0', '#C0C0C0'],
      bgGradient: ['#05040B', '#0D0D2B', '#1A1A3E'],
      // Star-specific
      gold: '#FFD700',
      silver: '#C0C0C0',
    },
    crystal: {
      primary: '#9B59B6',       // Amethyst purple
      secondary: '#8E44AD',
      deep: '#6C3483',
      light: '#D2B4DE',
      soft: '#E8DAEF',
      glow: 'rgba(155, 89, 182, 0.5)',
      glowIntense: 'rgba(155, 89, 182, 0.8)',
      gradient: ['#9B59B6', '#8E44AD', '#6C3483'],
      bgGradient: ['#0D0D2B', '#1A0D2B', '#2D1B4E'],
      // Crystal-specific colors
      crystals: {
        amethyst: '#9B59B6',
        roseQuartz: '#FFB6C1',
        clearQuartz: '#E8E8E8',
        citrine: '#F4D03F',
        obsidian: '#1C1C1C',
        turquoise: '#48C9B0',
        lapisLazuli: '#2E4053',
      },
    },
  },

  // ========== TEXT ==========
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.8)',
    muted: 'rgba(255, 255, 255, 0.6)',
    hint: 'rgba(255, 255, 255, 0.4)',
    disabled: 'rgba(255, 255, 255, 0.3)',
  },

  // ========== PARTICLES ==========
  particles: {
    star: '#FFFFFF',
    starDim: 'rgba(255, 255, 255, 0.3)',
    starBright: 'rgba(255, 255, 255, 0.9)',
    nebula: 'rgba(168, 85, 247, 0.2)',
    sparkle: '#FFD700',
    dust: 'rgba(255, 255, 255, 0.15)',
  },

  // ========== FUNCTIONAL ==========
  functional: {
    success: '#3AF7A6',
    error: '#FF6B6B',
    warning: '#FFB800',
    info: '#3B82F6',
  },
};

// ═══════════════════════════════════════════════════════════
// COSMIC GRADIENTS
// ═══════════════════════════════════════════════════════════
export const COSMIC_GRADIENTS = {
  // Background gradients
  cosmicBg: ['#05040B', '#0D0D2B', '#1A1A3E'],
  nebulaBg: ['#0D0D2B', '#1A1A3E', '#2D1B4E'],
  deepSpace: ['#000000', '#05040B', '#0D0D2B'],
  starryNight: ['#05040B', '#0A1628', '#152238'],

  // Radial spotlight
  spotlight: ['rgba(168, 85, 247, 0.3)', 'transparent'],
  spotlightGold: ['rgba(255, 215, 0, 0.3)', 'transparent'],
  spotlightPink: ['rgba(255, 105, 180, 0.3)', 'transparent'],
  spotlightCyan: ['rgba(0, 240, 255, 0.3)', 'transparent'],

  // Button gradients
  buttonPrimary: ['#9C0612', '#6B0F1A'],
  buttonGold: ['#FFBD59', '#FFD700'],
  buttonCyan: ['#00F0FF', '#00CED1'],
  buttonPurple: ['#A855F7', '#8B5CF6'],
  buttonPink: ['#FF69B4', '#FF1493'],

  // Glass gradients
  glassDefault: ['rgba(13, 13, 43, 0.6)', 'rgba(13, 13, 43, 0.4)'],
  glassLight: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)'],
  glassDark: ['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.2)'],
};

// ═══════════════════════════════════════════════════════════
// COSMIC SHADOWS
// ═══════════════════════════════════════════════════════════
export const COSMIC_SHADOWS = {
  // Glow shadows (colored)
  glowSmall: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  glowMedium: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  glowLarge: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
    elevation: 20,
  },

  // Create custom glow shadow
  createGlow: (color, intensity = 'medium') => {
    const configs = {
      small: { opacity: 0.5, radius: 10, elevation: 10 },
      medium: { opacity: 0.6, radius: 20, elevation: 15 },
      large: { opacity: 0.7, radius: 30, elevation: 20 },
      intense: { opacity: 0.8, radius: 40, elevation: 25 },
    };
    const config = configs[intensity] || configs.medium;
    return {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: config.opacity,
      shadowRadius: config.radius,
      elevation: config.elevation,
    };
  },

  // Depth shadows (black)
  depth1: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  depth2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  depth3: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },

  // Glass shadow
  glass: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 10,
  },
};

// ═══════════════════════════════════════════════════════════
// COSMIC ANIMATIONS
// ═══════════════════════════════════════════════════════════
export const COSMIC_ANIMATIONS = {
  // Timing
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
    ritual: 1500,
    breath: 4000,
  },

  // Easing curves (for use with Animated API)
  easing: {
    smooth: 'ease-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cosmic: 'cubic-bezier(0.37, 0, 0.63, 1)',
  },

  // Pulse configs
  pulse: {
    slow: { duration: 3000, scaleMin: 1, scaleMax: 1.05 },
    medium: { duration: 2000, scaleMin: 1, scaleMax: 1.1 },
    fast: { duration: 1000, scaleMin: 1, scaleMax: 1.15 },
    breath: { duration: 4000, scaleMin: 1, scaleMax: 1.3 },
  },

  // Glow configs
  glow: {
    subtle: { duration: 2000, opacityMin: 0.3, opacityMax: 0.6 },
    medium: { duration: 1500, opacityMin: 0.4, opacityMax: 0.8 },
    intense: { duration: 1000, opacityMin: 0.5, opacityMax: 1 },
  },

  // Float configs (for particles)
  float: {
    slow: { duration: 8000, distance: 5 },
    medium: { duration: 5000, distance: 10 },
    fast: { duration: 3000, distance: 15 },
  },

  // Breathing patterns (in ms)
  breathing: {
    standard: { inhale: 4000, hold: 0, exhale: 4000, rest: 0 },
    box: { inhale: 4000, hold: 4000, exhale: 4000, rest: 4000 },
    relaxing: { inhale: 4000, hold: 7000, exhale: 8000, rest: 0 },
  },
};

// ═══════════════════════════════════════════════════════════
// COSMIC SPACING
// ═══════════════════════════════════════════════════════════
export const COSMIC_SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
};

// ═══════════════════════════════════════════════════════════
// COSMIC BORDER RADIUS
// ═══════════════════════════════════════════════════════════
export const COSMIC_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  round: 9999,
};

// ═══════════════════════════════════════════════════════════
// COSMIC TYPOGRAPHY
// ═══════════════════════════════════════════════════════════
export const COSMIC_TYPOGRAPHY = {
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 28,
    hero: 36,
    giant: 48,
  },

  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },

  // Preset styles
  presets: {
    ritualTitle: {
      fontSize: 24,
      fontWeight: '700',
      letterSpacing: 0.5,
      color: '#FFFFFF',
    },
    ritualSubtitle: {
      fontSize: 16,
      fontWeight: '400',
      letterSpacing: 0,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    ritualInstruction: {
      fontSize: 18,
      fontWeight: '500',
      letterSpacing: 0.3,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      lineHeight: 28,
    },
    ritualTimer: {
      fontSize: 48,
      fontWeight: '700',
      letterSpacing: 2,
      color: '#FFFFFF',
    },
    ritualPhase: {
      fontSize: 20,
      fontWeight: '600',
      letterSpacing: 0.5,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
      color: '#FFFFFF',
    },
    glowText: {
      textShadowColor: '#A855F7',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
    },
  },
};

// ═══════════════════════════════════════════════════════════
// GLASS CARD STYLES
// ═══════════════════════════════════════════════════════════
export const GLASS_STYLES = {
  default: {
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    borderRadius: COSMIC_RADIUS.xl,
    overflow: 'hidden',
  },
  glow: {
    backgroundColor: COSMIC_COLORS.glass.bg,
    borderWidth: 1.5,
    borderColor: COSMIC_COLORS.glass.borderGlow,
    borderRadius: COSMIC_RADIUS.xl,
    overflow: 'hidden',
  },
  light: {
    backgroundColor: COSMIC_COLORS.glass.bgLight,
    borderWidth: 1,
    borderColor: COSMIC_COLORS.glass.border,
    borderRadius: COSMIC_RADIUS.xl,
    overflow: 'hidden',
  },
};

// ═══════════════════════════════════════════════════════════
// LAYOUT CONSTANTS
// ═══════════════════════════════════════════════════════════
export const COSMIC_LAYOUT = {
  screenPadding: 16,
  cardPadding: 20,

  // Orb sizes
  orbSizes: {
    small: 80,
    medium: 120,
    large: 160,
    hero: 200,
  },

  // Button heights
  buttonHeight: {
    small: 40,
    medium: 48,
    large: 56,
  },

  // Header
  headerHeight: 60,

  // Bottom padding for scroll views
  bottomPadding: 100,
};

// ═══════════════════════════════════════════════════════════
// PARTICLE CONFIGS
// ═══════════════════════════════════════════════════════════
export const PARTICLE_CONFIGS = {
  stars: {
    count: { sparse: 20, normal: 40, dense: 60 },
    sizeRange: { min: 1, max: 3 },
    opacityRange: { min: 0.3, max: 1 },
    twinkleSpeed: { min: 1000, max: 3000 },
  },
  sparkles: {
    count: 30,
    sizeRange: { min: 2, max: 6 },
    colors: ['#FFD700', '#FFFFFF', '#FF69B4'],
    duration: 1000,
  },
  hearts: {
    count: 15,
    sizeRange: { min: 8, max: 16 },
    color: '#FF69B4',
  },
  ash: {
    count: 30,
    color: '#666666',
    floatSpeed: { min: 0.5, max: 1.5 },
    swayAmount: 30,
  },
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════
export default {
  COSMIC_COLORS,
  COSMIC_GRADIENTS,
  COSMIC_SHADOWS,
  COSMIC_ANIMATIONS,
  COSMIC_SPACING,
  COSMIC_RADIUS,
  COSMIC_TYPOGRAPHY,
  GLASS_STYLES,
  COSMIC_LAYOUT,
  PARTICLE_CONFIGS,
};
