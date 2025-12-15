/**
 * GEM PLATFORM - DESIGN TOKENS (JavaScript)
 * Version: 1.0
 * Date: 29 Nov 2025
 *
 * This file mirrors the CSS design-tokens.css for use in JavaScript/React
 * All values MUST match design-tokens.css exactly
 */

export const tokens = {
  // ============================================
  // BREAKPOINTS
  // ============================================
  breakpoints: {
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1400,
    '2xl': 1920,
  },

  // ============================================
  // BACKGROUND COLORS - NEW GRADIENT
  // ============================================
  colors: {
    // Base backgrounds
    bgPrimary: '#0A0E27',
    bgSecondary: '#141B3D',
    bgTertiary: '#1E2A5E',
    bgGradient: 'linear-gradient(135deg, #0A0E27 0%, #141B3D 50%, #1E2A5E 100%)',

    // Glow colors
    glowBlueBright: 'rgba(59, 130, 246, 0.5)',
    glowBlueMedium: 'rgba(37, 99, 235, 0.25)',
    glowBlueDark: 'rgba(30, 64, 175, 0.3)',

    // Card backgrounds with glassmorphism
    bgCard: 'rgba(30, 42, 94, 0.4)',
    bgCardHover: 'rgba(30, 42, 94, 0.6)',
    bgGlass: 'rgba(15, 16, 48, 0.55)',
    bgGlassLight: 'rgba(26, 27, 58, 0.7)',
    bgGlassDark: 'rgba(10, 11, 26, 0.8)',

    // Brand colors
    brandBurgundy: '#9C0612',
    brandBurgundyDark: '#6B0F1A',
    brandBurgundyLight: '#B91D28',
    brandGold: '#FFBD59',
    brandGoldMuted: '#D4A574',
    brandGoldLight: '#DEBC81',
    brandCyan: '#FFBD59', // Cyan replaced with gold
    brandBlue: '#4D9DE0',
    brandPurple: '#8B5CF6',
    brandPink: '#FF6B9D',

    // Functional colors
    accentGreen: '#00FF88',
    accentRed: '#FF4757',
    accentOrange: '#FF9F43',
    accentYellow: '#FFC312',

    // Text colors
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.85)',
    textTertiary: 'rgba(255, 255, 255, 0.70)',
    textMuted: 'rgba(255, 255, 255, 0.50)',
    textDisabled: 'rgba(255, 255, 255, 0.35)',

    // Course theme
    coursePrimary: '#00D9FF',
    courseAccent: '#4A90E2',
    courseGlow: 'rgba(0, 217, 255, 0.3)',
    courseBg: 'rgba(0, 180, 216, 0.05)',

    // Tier colors
    tierFree: '#3AF7A6',
    tier1: '#00F0FF',
    tier2: '#6A5BFF',
    tier3: '#FFBD59',
  },

  // ============================================
  // GRADIENTS
  // ============================================
  gradients: {
    bg: 'linear-gradient(135deg, #0A0E27 0%, #141B3D 50%, #1E2A5E 100%)',
    card: 'linear-gradient(180deg, rgba(74, 26, 79, 0.35) 0%, rgba(107, 15, 26, 0.25) 100%)',
    burgundy: 'linear-gradient(135deg, #9C0612 0%, #6B0F1A 100%)',
    gold: 'linear-gradient(135deg, #FFBD59 0%, #E6A64D 100%)',
    purple: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    goldText: 'linear-gradient(135deg, #FFFFFF 0%, #FFBD59 100%)',
    rainbow: 'linear-gradient(135deg, #FFBD59 0%, #8B5CF6 50%, #FF6B9D 100%)',
    courseHero: 'linear-gradient(135deg, #00D9FF 0%, #4A90E2 100%)',
    courseCard: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(74, 144, 226, 0.1) 100%)',
  },

  // ============================================
  // SPACING (8px base)
  // ============================================
  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
    '2xl': 64,
    '3xl': 80,
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    // Font families
    fontDisplay: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontBody: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'Fira Code', 'Courier New', Courier, monospace",

    // Font sizes
    textXs: 12,
    textSm: 14,
    textBase: 16,
    textLg: 20,
    textXl: 24,
    text2xl: 32,
    text3xl: 48,
    text4xl: 72,

    // Font weights
    fontLight: 300,
    fontNormal: 400,
    fontMedium: 500,
    fontSemibold: 600,
    fontBold: 700,
    fontExtrabold: 800,
    fontBlack: 900,

    // Line heights
    leadingTight: 1.1,
    leadingSnug: 1.25,
    leadingNormal: 1.5,
    leadingRelaxed: 1.75,

    // Letter spacing
    trackingTighter: -2,
    trackingTight: -1,
    trackingNormal: 0,
    trackingWide: 0.5,
    trackingWider: 1,
  },

  // ============================================
  // BORDER RADIUS
  // ============================================
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 14,
    xl: 20,
    '2xl': 30,
    full: 50,
    circle: '50%',
  },

  // ============================================
  // SHADOWS & GLOWS
  // ============================================
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.15)',
    md: '0 4px 16px rgba(0, 0, 0, 0.2)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.25)',
    xl: '0 12px 48px rgba(0, 0, 0, 0.3)',
    gold: '0 0 30px rgba(255, 189, 89, 0.5)',
    burgundy: '0 10px 40px rgba(156, 6, 18, 0.4)',
    cyan: '0 0 30px rgba(255, 189, 89, 0.4)',
    purple: '0 0 30px rgba(139, 92, 246, 0.4)',
  },

  // ============================================
  // TRANSITIONS
  // ============================================
  transitions: {
    fast: '0.15s ease',
    base: '0.3s ease',
    slow: '0.5s ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // ============================================
  // Z-INDEX
  // ============================================
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // ============================================
  // GLASSMORPHISM
  // ============================================
  glass: {
    blur: 18,
    bg: 'rgba(15, 16, 48, 0.55)',
    bgLight: 'rgba(26, 27, 58, 0.7)',
    bgDark: 'rgba(10, 11, 26, 0.8)',
    border: 'rgba(255, 255, 255, 0.12)',
    borderHover: 'rgba(255, 189, 89, 0.3)',
  },

  // ============================================
  // COMPONENT SIZES (Mobile-first)
  // ============================================
  components: {
    // Card
    card: {
      padding: { mobile: 12, tablet: 16, desktop: 24 },
      gap: { mobile: 8, tablet: 12, desktop: 20 },
      borderRadius: 14,
    },
    // Button
    button: {
      height: { sm: 32, base: 40, lg: 48, xl: 56 },
      padding: { sm: '0 12px', base: '0 16px', lg: '0 20px', xl: '0 24px' },
      fontSize: { sm: 12, base: 14, lg: 16, xl: 18 },
      borderRadius: 8,
    },
    // Input
    input: {
      height: { mobile: 44, desktop: 48 },
      padding: '12px 16px',
      fontSize: 16, // Prevent iOS zoom
      borderRadius: 8,
    },
    // Modal
    modal: {
      padding: { mobile: 16, desktop: 32 },
      maxHeight: '70vh',
      borderRadius: 20,
    },
    // Icon
    icon: {
      size: { sm: 16, base: 20, lg: 24, xl: 32 },
    },
  },
};

// ============================================
// RESPONSIVE HELPERS
// ============================================
export const media = {
  mobile: `@media (max-width: ${tokens.breakpoints.md - 1}px)`,
  tablet: `@media (min-width: ${tokens.breakpoints.md}px) and (max-width: ${tokens.breakpoints.lg - 1}px)`,
  desktop: `@media (min-width: ${tokens.breakpoints.lg}px)`,
  wide: `@media (min-width: ${tokens.breakpoints.xl}px)`,
};

// ============================================
// MOBILE VALUES FROM SCREENSHOTS
// ============================================
export const mobileValues = {
  // Stat Card (Profile/Stats Pages)
  statCard: {
    padding: 12,
    minHeight: 70,
    marginBottom: 8,
    iconSize: 28,
    labelFontSize: 11,
    valueFontSize: 20,
  },
  // Info Card (Dashboard/Overview)
  infoCard: {
    padding: 14,
    marginBottom: 10,
    iconSize: 32,
    titleFontSize: 14,
    valueFontSize: 22,
    descFontSize: 11,
  },
  // Modal
  modal: {
    padding: 16,
    titleFontSize: 18,
    sectionMargin: 12,
    bigStatFontSize: 40,
    buttonHeight: 40,
  },
  // Buttons
  button: {
    primaryHeight: 40,
    secondaryHeight: 36,
    smallHeight: 32,
    fontSize: 14,
  },
  // Tabs
  tab: {
    height: 36,
    fontSize: 12,
    minWidth: 80,
  },
  // Container
  container: {
    padding: 16,
    sectionMargin: 20,
  },
};

export default tokens;
