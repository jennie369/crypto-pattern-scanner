# GEM iOS APP - DESIGN TOKENS (PRODUCTION v3.0)

**Version:** 3.0 (Updated - Exact Match to Liquid Glass Reference)
**Date:** November 23, 2025
**Purpose:** Complete design specification for GEM iOS app
**Status:** PRODUCTION READY
**Reference:** GEM_LIQUID_GLASS_COMPONENTS.html (Source of Truth)

**Updates in v3.0:**
- Updated to match GEM_LIQUID_GLASS_COMPONENTS.html exactly
- Corrected glass card values (rgba(15, 16, 48, 0.55), blur 18px)
- Fixed cyan color (#00F0FF not #00D9FF)
- Fixed green color (#3AF7A6 not #00FF88)
- Fixed red color (#FF6B6B not #FF4444)
- Added purple accent (#6A5BFF) and glow (#8C64FF)
- Fixed border-radius (18px for cards, 12px for buttons)
- Added gradient border effect (purple to cyan)
- Added multi-layer shadow with purple glow

---

## TABLE OF CONTENTS

1. [Core Principles](#1-core-principles)
2. [Spacing Scale](#2-spacing-scale)
3. [Layout](#3-layout)
4. [Colors](#4-colors)
5. [Typography](#5-typography)
6. [Components - Avatars](#6-components---avatars)
7. [Components - Buttons](#7-components---buttons)
8. [Components - Icons](#8-components---icons)
9. [Components - Cards](#9-components---cards)
9A. [Glassmorphism Guidelines](#9a-glassmorphism-guidelines)
10. [Components - Inputs](#10-components---inputs)
11. [Components - Badges](#11-components---badges)
12. [Z-Index Scale](#12-z-index-scale)
13. [Animation](#13-animation)
14. [Shadows](#14-shadows)
15. [Touch Targets](#15-touch-targets)
16. [Usage Rules](#16-usage-rules)
17. [Common Patterns](#17-common-patterns)
18. [Screen Specifications](#18-screen-specifications)
19. [Validation Checklist](#19-validation-checklist)

---

## 1. CORE PRINCIPLES

### The 4 Golden Rules

```markdown
1. **8-POINT GRID (STRICT)**
   - ALL spacing must be divisible by 4 (preferably 8)
   - Never use: 5px, 7px, 9px, 11px, 13px, 15px, 22px, 25px, 30px
   - Always use: 4, 8, 12, 16, 18, 20, 24, 32, 40, 48px

2. **MOBILE-FIRST (COMPACT)**
   - Compact, dense, information-rich layouts
   - Optimize for 375px width (iPhone SE) minimum
   - Design for thumb reach zones
   - Prioritize vertical scrolling

3. **TOUCH-FRIENDLY**
   - Minimum 44x44px touch targets (Apple HIG)
   - Recommended 48x48px for primary actions
   - Visual elements can be smaller, touch area must not

4. **CONSISTENT (TOKEN-BASED)**
   - Use tokens, NEVER random values
   - Every design decision has a token
   - Document any exceptions
```

### Design Philosophy

```
Gemral = Trading Precision + Liquid Glass Elegance

Visual Language:
- Deep space gradient background (#05040B → #0F1030 → #1a0b2e)
- Purple-to-Cyan gradient borders (#6A5BFF → #00F0FF)
- Multi-layer shadows with purple glow
- GEM brand identity (burgundy #9C0612, gold #FFBD59)
- Cyan for numbers/stats ONLY
```

---

## 2. SPACING SCALE

### Primary Spacing Tokens

```javascript
const SPACING = {
  // Extra Small (micro adjustments)
  xxs: 2,     // Icon internal gaps, hairline spacing
  xs: 4,      // Tight internal spacing, inline elements

  // Small-Medium (most used range)
  sm: 8,      // List item gaps, small card padding
  md: 12,     // Component spacing, card internal gaps

  // Large (structural spacing)
  lg: 16,     // Between cards, section spacing
  xl: 18,     // Glass card padding (EXACT from reference)
  xxl: 20,    // Page horizontal padding

  // Extra Large (rare, hero sections only)
  xxxl: 24,   // Major sections
  huge: 32,   // Hero sections
  giant: 40   // Special layouts only
};

// USAGE FREQUENCY:
// xxs (2px)   - 5%   (rare, micro adjustments)
// xs (4px)    - 10%  (inline elements)
// sm (8px)    - 25%  (list items, small gaps)
// md (12px)   - 30%  (DEFAULT - most components)
// lg (16px)   - 15%  (card gaps, sections)
// xl (18px)   - 10%  (glass card padding)
// xxl+ (20+)  - 5%   (rare, major sections)
```

---

## 3. LAYOUT

### Page Layout

```javascript
const LAYOUT = {
  // Page Container
  page: {
    paddingHorizontal: 16,    // Side padding
    paddingTop: 8,            // Content below header
    paddingBottom: 100,       // Space for tab bar + safe area
  },

  // Safe Areas (iPhone)
  safeArea: {
    top: 50,                  // iPhone notch area
    bottom: 34,               // iPhone home indicator
    topWithHeader: 98,        // notch + header (48px)
  },

  // Screen Dimensions (design targets)
  screen: {
    minWidth: 375,            // iPhone SE
    maxWidth: 428,            // iPhone 14 Pro Max
    designWidth: 390,         // iPhone 14 (target)
  },
};
```

---

## 4. COLORS (EXACT FROM REFERENCE)

### Primary Brand Colors

```javascript
const COLORS = {
  // === PRIMARY BRAND ===
  burgundy: '#9C0612',        // Primary brand color
  burgundyDark: '#6B0F1A',    // Darker variant (button gradient end)
  burgundyLight: '#C41E2A',   // Lighter variant

  gold: '#FFBD59',            // Button borders, highlights
  goldBright: '#FFD700',      // Hover state gold
  goldMuted: '#D4A84B',       // Subdued gold

  // === BACKGROUND GRADIENT (EXACT) ===
  background: {
    gradient: 'linear-gradient(135deg, #05040B 0%, #0F1030 50%, #1a0b2e 100%)',
    darkest: '#05040B',       // Start color
    mid: '#0F1030',           // Middle color
    light: '#1a0b2e',         // End color (purple tint)
  },

  // === GLASS EFFECTS (EXACT FROM REFERENCE) ===
  glass: {
    // Card background
    background: 'rgba(15, 16, 48, 0.55)',     // EXACT
    backgroundLight: 'rgba(15, 16, 48, 0.5)', // Lighter variant
    backgroundHeavy: 'rgba(15, 16, 48, 0.6)', // Heavier variant

    // Blur settings
    blur: 18,                                  // EXACT: 18px
    saturate: 180,                             // EXACT: 180%
    backdropFilter: 'blur(18px) saturate(180%)',

    // Border (gradient technique)
    borderWidth: 1.2,                          // EXACT: 1.2px
    borderRadius: 18,                          // EXACT: 18px

    // Gradient border colors
    borderGradient: 'linear-gradient(135deg, #6A5BFF, #00F0FF)',
    borderPurple: '#6A5BFF',                   // Start color
    borderCyan: '#00F0FF',                     // End color

    // Multi-layer shadows (EXACT)
    shadow: `
      0 10px 20px rgba(0, 0, 0, 0.7),
      0 6px 30px rgba(140, 100, 255, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.03)
    `,

    // Hover shadow
    shadowHover: `
      0 15px 30px rgba(0, 0, 0, 0.8),
      0 10px 40px rgba(140, 100, 255, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.05)
    `,

    // Purple glow effect (EXACT)
    glowColor: '#8C64FF',
    glowGradient: 'radial-gradient(circle, #8C64FF 0%, rgba(140, 100, 255, 0) 70%)',
    glowOpacity: 0.22,
    glowBlur: 40,
  },

  // === ACCENT COLORS (EXACT FROM REFERENCE) ===
  purple: '#6A5BFF',                           // Primary accent
  purpleGlow: '#8C64FF',                       // Glow effect
  purpleGlowRgba: 'rgba(140, 100, 255, 0.22)', // Shadow glow

  cyan: '#00F0FF',                             // EXACT (not #00D9FF!)
  cyanSubtle: 'rgba(0, 240, 255, 0.1)',
  cyanBorder: 'rgba(0, 240, 255, 0.2)',

  // === FUNCTIONAL COLORS (EXACT FROM REFERENCE) ===
  success: '#3AF7A6',         // EXACT green (not #00FF88!)
  successBg: 'rgba(58, 247, 166, 0.2)',
  successBorder: 'rgba(58, 247, 166, 0.4)',

  danger: '#FF6B6B',          // EXACT red (not #FF4444!)
  dangerBg: 'rgba(255, 107, 107, 0.2)',
  dangerBorder: 'rgba(255, 107, 107, 0.4)',

  warning: '#FFB800',         // Warning orange
  warningBg: 'rgba(255, 184, 0, 0.1)',

  info: '#3B82F6',            // Info blue
  infoBg: 'rgba(59, 130, 246, 0.1)',

  // === TEXT COLORS (EXACT FROM REFERENCE) ===
  textColors: {
    primary: '#FFFFFF',                        // Pure white
    secondary: 'rgba(255, 255, 255, 0.8)',     // 80% white
    muted: 'rgba(255, 255, 255, 0.6)',         // 60% white (labels)
    subtle: 'rgba(255, 255, 255, 0.5)',        // 50% white
    disabled: 'rgba(255, 255, 255, 0.4)',      // 40% white

    // Special text
    balance: 'linear-gradient(135deg, #FFFFFF, #00F0FF)', // Gradient text
    accent: '#00F0FF',                         // Cyan (numbers only!)
    success: '#3AF7A6',                        // Green
    danger: '#FF6B6B',                         // Red
  },

  // === INPUT COLORS (EXACT FROM REFERENCE) ===
  input: {
    background: 'rgba(0, 0, 0, 0.3)',          // EXACT
    border: 'rgba(106, 91, 255, 0.3)',         // Purple-tinted
    borderFocus: '#6A5BFF',                    // Full purple on focus
    focusGlow: 'rgba(106, 91, 255, 0.3)',      // Focus glow
  },

  // === STAKING PERIOD (EXACT FROM REFERENCE) ===
  stakingPeriod: {
    background: 'rgba(106, 91, 255, 0.15)',    // Purple-tinted
    autoRenewBg: 'rgba(0, 0, 0, 0.2)',         // Darker
  },

  // === TOGGLE SWITCH (EXACT FROM REFERENCE) ===
  toggle: {
    activeGradient: 'linear-gradient(135deg, #3AF7A6, #00F0FF)', // Green to cyan
    inactiveBackground: 'rgba(255, 255, 255, 0.2)',
    knobColor: '#FFFFFF',
    knobShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
  },
};
```

### Color Quick Reference

```javascript
// === EXACT VALUES FROM REFERENCE ===
const QUICK_COLORS = {
  // Background
  BG_GRADIENT: 'linear-gradient(135deg, #05040B 0%, #0F1030 50%, #1a0b2e 100%)',

  // Glass Card
  GLASS_BG: 'rgba(15, 16, 48, 0.55)',
  GLASS_BORDER_GRADIENT: 'linear-gradient(135deg, #6A5BFF, #00F0FF)',

  // Accent
  PURPLE: '#6A5BFF',
  CYAN: '#00F0FF',
  PURPLE_GLOW: '#8C64FF',

  // Functional
  GREEN: '#3AF7A6',
  RED: '#FF6B6B',

  // Brand
  BURGUNDY: '#9C0612',
  BURGUNDY_DARK: '#6B0F1A',
  GOLD: '#FFBD59',

  // Text
  TEXT_WHITE: '#FFFFFF',
  TEXT_MUTED: 'rgba(255, 255, 255, 0.6)',
  TEXT_SUBTLE: 'rgba(255, 255, 255, 0.5)',

  // Input
  INPUT_BG: 'rgba(0, 0, 0, 0.3)',
  INPUT_BORDER: 'rgba(106, 91, 255, 0.3)',
};
```

---

## 5. TYPOGRAPHY (EXACT FROM REFERENCE)

### Font Families

```javascript
const TYPOGRAPHY = {
  // === FONT FAMILIES (EXACT FROM REFERENCE) ===
  fontFamily: {
    // Primary - iOS System (SF Pro Display)
    primary: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",

    // Display - Same as primary for iOS
    display: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",

    // Monospace - Numbers
    mono: "'SF Mono', Menlo, Monaco, 'Courier New', monospace",
  },

  // === FONT WEIGHTS ===
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',    // For balance amounts
  },

  // === FONT SIZE SCALE (EXACT FROM REFERENCE) ===
  fontSize: {
    xs: 10,       // Micro text
    sm: 11,       // Labels (EXACT: 11px)
    md: 12,       // Small text (EXACT: 12px)
    base: 13,     // Body small (EXACT: 13px)
    lg: 14,       // Body (EXACT: 14px)
    xl: 15,       // Buttons (EXACT: 15px)
    xxl: 16,      // Large body (EXACT: 16px)
    xxxl: 18,     // Card titles (EXACT: 18px)
    display: 20,  // APY (EXACT: 20px)
    hero: 32,     // Amount input (EXACT: 32px)
    giant: 42,    // Balance amount (EXACT: 42px)
  },

  // === LINE HEIGHTS ===
  lineHeight: {
    tight: 1.2,      // Display headings
    normal: 1.4,     // Body text
    relaxed: 1.6,    // Long-form content
  },

  // === LETTER SPACING ===
  letterSpacing: {
    tight: -2,       // Large balance (EXACT: -2px)
    normal: 0,       // Body text
    wide: 0.5,       // Small caps
    wider: 1.2,      // Uppercase labels
  },
};
```

### Typography Presets (EXACT FROM REFERENCE)

```javascript
const TYPE_PRESETS = {
  // === BALANCE DISPLAY (EXACT) ===
  balanceAmount: {
    fontSize: 42,                    // EXACT
    fontWeight: '800',               // EXACT
    letterSpacing: -2,               // EXACT
    background: 'linear-gradient(135deg, #FFFFFF, #00F0FF)', // Gradient text
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  // === LABELS (EXACT) ===
  label: {
    fontSize: 13,                    // EXACT
    fontWeight: '600',               // EXACT
    color: 'rgba(255, 255, 255, 0.6)', // EXACT
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // === SECTION LABELS ===
  sectionLabel: {
    fontSize: 11,                    // EXACT
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
  },

  // === INPUT VALUE (EXACT) ===
  inputValue: {
    fontSize: 32,                    // EXACT
    fontWeight: '700',               // EXACT
    color: '#FFFFFF',
  },

  // === APY DISPLAY (EXACT) ===
  apyValue: {
    fontSize: 20,                    // EXACT
    fontWeight: '800',               // EXACT
    color: '#3AF7A6',                // Green
  },

  // === PERIOD LABEL ===
  periodLabel: {
    fontSize: 14,                    // EXACT
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // === ASSET NAME (EXACT) ===
  assetName: {
    fontSize: 14,                    // EXACT
    fontWeight: '700',               // EXACT
    color: '#FFFFFF',
  },

  // === ASSET AMOUNT ===
  assetAmount: {
    fontSize: 11,                    // EXACT
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // === ASSET PRICE (EXACT) ===
  assetPrice: {
    fontSize: 15,                    // EXACT
    fontWeight: '700',               // EXACT
    color: '#FFFFFF',
  },

  // === ASSET CHANGE ===
  assetChange: {
    fontSize: 11,                    // EXACT
    fontWeight: '600',               // EXACT
    color: '#3AF7A6',                // Or #FF6B6B for negative
  },

  // === BUTTON TEXT (EXACT) ===
  buttonText: {
    fontSize: 15,                    // EXACT
    fontWeight: '600',               // EXACT
    color: '#FFFFFF',
  },
};
```

---

## 6. COMPONENTS - AVATARS

```javascript
const AVATAR = {
  // Size Variants
  xs: { size: 24, borderRadius: 12 },
  sm: { size: 36, borderRadius: 18 },
  md: { size: 42, borderRadius: 21 },  // EXACT from reference
  lg: { size: 56, borderRadius: 28 },
  xl: { size: 80, borderRadius: 40 },

  // Border
  border: {
    width: 2,
    color: '#FFFFFF',
    colorDark: 'rgba(255, 255, 255, 0.2)',
  },
};
```

---

## 7. COMPONENTS - BUTTONS (EXACT FROM REFERENCE)

### Button Variants

```javascript
const BUTTON = {
  // === PRIMARY BUTTON (EXACT FROM REFERENCE) ===
  primary: {
    padding: 16,                     // EXACT
    borderRadius: 12,                // EXACT (not 24!)

    // Gradient background (EXACT)
    background: 'linear-gradient(135deg, #9C0612, #6B0F1A)',

    // Gold border (EXACT)
    borderWidth: 1,
    borderColor: '#FFBD59',

    // Text
    color: '#FFFFFF',
    fontSize: 15,                    // EXACT
    fontWeight: '600',               // EXACT

    // Shadow (EXACT)
    boxShadow: '0 4px 15px rgba(156, 6, 18, 0.4)',

    // Transition
    transition: 'all 0.3s ease',

    // States
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(156, 6, 18, 0.6), 0 0 20px rgba(255, 189, 89, 0.3)',
      borderColor: '#FFD700',
    },

    pressed: {
      transform: 'translateY(0)',
    },

    disabled: {
      background: 'rgba(156, 6, 18, 0.3)',
      borderColor: 'rgba(255, 189, 89, 0.3)',
      color: 'rgba(255, 255, 255, 0.4)',
      boxShadow: 'none',
    },
  },

  // === CONTROL BUTTON (FROM REFERENCE) ===
  control: {
    flex: 1,
    padding: 16,                     // EXACT
    borderRadius: 16,                // EXACT

    background: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',

    backdropFilter: 'blur(10px)',

    transition: 'all 0.3s ease',

    hover: {
      background: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(106, 91, 255, 0.5)',
      transform: 'translateY(-2px)',
    },

    active: {
      background: 'rgba(106, 91, 255, 0.2)',
      borderColor: '#6A5BFF',
    },
  },

  // === TIMEFRAME BUTTON (FROM REFERENCE) ===
  timeframe: {
    padding: '8px 14px',
    borderRadius: 10,                // EXACT

    background: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',

    fontSize: 13,                    // EXACT
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',

    transition: 'all 0.3s ease',

    hover: {
      background: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(106, 91, 255, 0.5)',
    },

    active: {
      background: 'rgba(106, 91, 255, 0.2)',
      borderColor: '#6A5BFF',
      color: '#FFFFFF',
    },
  },
};
```

---

## 8. COMPONENTS - ICONS

```javascript
const ICON = {
  // Size Variants
  xs: 12,
  sm: 16,
  md: 20,     // DEFAULT
  lg: 24,
  xl: 32,

  // Colors
  color: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.8)',
    muted: 'rgba(255, 255, 255, 0.6)',
    accent: '#FFBD59',
    success: '#3AF7A6',
    danger: '#FF6B6B',
  },
};
```

---

## 9. COMPONENTS - CARDS (EXACT FROM REFERENCE)

### Card Variants

```javascript
const CARD = {
  // === GLASS CARD (EXACT FROM REFERENCE) ===
  glass: {
    // Position for pseudo elements
    position: 'relative',

    // Dimensions
    width: 340,                      // EXACT reference width
    borderRadius: 18,                // EXACT
    padding: 20,                     // EXACT

    // Glassmorphism effect (EXACT)
    background: 'rgba(15, 16, 48, 0.55)',
    backdropFilter: 'blur(18px) saturate(180%)',
    WebkitBackdropFilter: 'blur(18px) saturate(180%)',

    // Border gradient (via pseudo element)
    border: '1.2px solid transparent',
    backgroundClip: 'padding-box',

    // Multi-layer shadows (EXACT)
    boxShadow: `
      0 10px 20px rgba(0, 0, 0, 0.7),
      0 6px 30px rgba(140, 100, 255, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.03)
    `,

    // Transition (EXACT)
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',

    // Hover state (EXACT)
    hover: {
      transform: 'translateY(-5px)',
      boxShadow: `
        0 15px 30px rgba(0, 0, 0, 0.8),
        0 10px 40px rgba(140, 100, 255, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.05)
      `,
    },

    // === PSEUDO ELEMENTS ===

    // Gradient border (::before)
    beforeElement: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 18,
      padding: '1.2px',
      background: 'linear-gradient(135deg, #6A5BFF, #00F0FF)',
      WebkitMask: `
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0)
      `,
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      pointerEvents: 'none',
    },

    // Purple glow (::after)
    afterElement: {
      content: '""',
      position: 'absolute',
      top: -60,
      right: -40,
      width: 220,
      height: 120,
      background: 'radial-gradient(circle, #8C64FF 0%, rgba(140, 100, 255, 0) 70%)',
      borderRadius: '50%',
      opacity: 0.22,
      filter: 'blur(40px)',
      pointerEvents: 'none',
      zIndex: -1,
    },
  },

  // === BALANCE CARD VARIANT ===
  balance: {
    // Extends glass card
    background: 'rgba(15, 16, 48, 0.6)',  // Slightly heavier
  },

  // === STAKING CARD VARIANT ===
  staking: {
    // Same as glass card
    background: 'rgba(15, 16, 48, 0.55)',
  },

  // === CONTROL CARD VARIANT ===
  control: {
    background: 'rgba(15, 16, 48, 0.5)',  // Slightly lighter
    padding: 25,                           // More padding
  },

  // === ASSETS CARD VARIANT ===
  assets: {
    background: 'rgba(15, 16, 48, 0.5)',
  },
};
```

---

## 9A. GLASSMORPHISM GUIDELINES (EXACT FROM REFERENCE)

### Complete Glass Effect Anatomy

```javascript
const GLASSMORPHISM = {
  // === LAYER 1: BACKGROUND (EXACT) ===
  background: {
    color: 'rgba(15, 16, 48, 0.55)',   // EXACT
    blur: 18,                           // EXACT: 18px (not 20!)
    saturate: 180,                      // EXACT: 180%
    backdropFilter: 'blur(18px) saturate(180%)',
  },

  // === LAYER 2: GRADIENT BORDER (EXACT) ===
  border: {
    width: 1.2,                         // EXACT: 1.2px
    gradient: 'linear-gradient(135deg, #6A5BFF, #00F0FF)',
    startColor: '#6A5BFF',              // Purple
    endColor: '#00F0FF',                // Cyan
    angle: 135,                         // degrees

    // CSS Mask technique for gradient border
    maskCSS: `
      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    `,
  },

  // === LAYER 3: MULTI-LAYER SHADOWS (EXACT) ===
  shadows: {
    // Main shadow
    main: '0 10px 20px rgba(0, 0, 0, 0.7)',

    // Purple glow shadow
    glow: '0 6px 30px rgba(140, 100, 255, 0.22)',

    // Inner top highlight
    innerHighlight: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',

    // Combined
    combined: `
      0 10px 20px rgba(0, 0, 0, 0.7),
      0 6px 30px rgba(140, 100, 255, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.03)
    `,
  },

  // === LAYER 4: PURPLE GLOW EFFECT (EXACT) ===
  purpleGlow: {
    gradient: 'radial-gradient(circle, #8C64FF 0%, rgba(140, 100, 255, 0) 70%)',
    color: '#8C64FF',
    opacity: 0.22,                      // EXACT
    blur: 40,                           // EXACT: 40px
    position: { top: -60, right: -40 },
    size: { width: 220, height: 120 },
  },

  // === TRANSITION (EXACT) ===
  transition: {
    duration: 0.4,                      // EXACT: 0.4s
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    css: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // === HOVER EFFECT (EXACT) ===
  hover: {
    transform: 'translateY(-5px)',
    shadows: `
      0 15px 30px rgba(0, 0, 0, 0.8),
      0 10px 40px rgba(140, 100, 255, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.05)
    `,
  },

  // === BORDER RADIUS (EXACT) ===
  borderRadius: 18,                     // EXACT: 18px
};
```

### CSS Implementation Example

```css
/* EXACT Glass Card from GEM_LIQUID_GLASS_COMPONENTS.html */
.glass-card {
  position: relative;
  width: 340px;
  border-radius: 18px;
  padding: 20px;

  /* Glassmorphism effect - EXACT */
  background: rgba(15, 16, 48, 0.55);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);

  /* Border gradient */
  border: 1.2px solid transparent;
  background-clip: padding-box;

  /* Multi-layer shadows - EXACT */
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.7),
    0 6px 30px rgba(140, 100, 255, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);

  /* Transition - EXACT */
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Gradient Border Effect - EXACT */
.glass-card:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 18px;
  padding: 1.2px;
  background: linear-gradient(135deg, #6A5BFF, #00F0FF);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Purple Glow Effect - EXACT */
.glass-card:after {
  content: '';
  position: absolute;
  top: -60px;
  right: -40px;
  width: 220px;
  height: 120px;
  background: radial-gradient(circle, #8C64FF 0%, rgba(140, 100, 255, 0) 70%);
  border-radius: 50%;
  opacity: 0.22;
  filter: blur(40px);
  pointer-events: none;
  z-index: -1;
}

/* Hover State - EXACT */
.glass-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 15px 30px rgba(0, 0, 0, 0.8),
    0 10px 40px rgba(140, 100, 255, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

---

## 10. COMPONENTS - INPUTS (EXACT FROM REFERENCE)

```javascript
const INPUT = {
  // === TEXT INPUT (EXACT FROM REFERENCE) ===
  default: {
    // Container
    position: 'relative',
    borderRadius: 12,                    // EXACT
    padding: 18,                         // EXACT

    // Background
    background: 'rgba(0, 0, 0, 0.3)',    // EXACT

    // Border
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)', // EXACT: purple-tinted

    // Transition
    transition: 'all 0.3s ease',

    // Focus state (EXACT)
    focus: {
      borderColor: '#6A5BFF',
      boxShadow: '0 0 20px rgba(106, 91, 255, 0.3)',
    },
  },

  // === AMOUNT INPUT (EXACT FROM REFERENCE) ===
  amountInput: {
    background: 'none',
    border: 'none',
    color: '#FFFFFF',
    fontSize: 32,                        // EXACT
    fontWeight: '700',                   // EXACT
    width: '100%',
    outline: 'none',
  },

  // === INPUT META (MIN/MAX) ===
  inputMeta: {
    marginTop: 8,
    fontSize: 12,                        // EXACT

    min: {
      color: 'rgba(255, 255, 255, 0.5)',
    },
    max: {
      color: '#FF6B6B',                  // EXACT red
      fontWeight: '600',
      cursor: 'pointer',
    },
  },

  // === COIN SELECT (EXACT FROM REFERENCE) ===
  coinSelect: {
    flex: 1,
    minWidth: 100,
    padding: '12px 16px',
    borderRadius: 12,                    // EXACT

    background: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',

    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
};
```

---

## 11. COMPONENTS - BADGES (EXACT FROM REFERENCE)

```javascript
const BADGE = {
  // === DIRECTION BADGES (EXACT FROM REFERENCE) ===
  long: {
    padding: '6px 12px',
    borderRadius: 8,                     // EXACT
    fontSize: 11,                        // EXACT
    fontWeight: '700',                   // EXACT

    background: 'rgba(58, 247, 166, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(58, 247, 166, 0.4)',
    color: '#3AF7A6',
  },

  short: {
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '700',

    background: 'rgba(255, 107, 107, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.4)',
    color: '#FF6B6B',
  },

  // === PATTERN BADGES (EXACT FROM REFERENCE) ===
  patternBadge: {
    width: 42,                           // EXACT
    height: 42,                          // EXACT
    borderRadius: 10,                    // EXACT
    fontSize: 11,                        // EXACT
    fontWeight: '800',                   // EXACT

    // DPD (bullish pattern)
    dpd: {
      background: 'rgba(58, 247, 166, 0.2)',
      color: '#3AF7A6',
      borderWidth: 1.5,
      borderColor: '#3AF7A6',
    },

    // UPU (bearish pattern)
    upu: {
      background: 'rgba(255, 107, 107, 0.2)',
      color: '#FF6B6B',
      borderWidth: 1.5,
      borderColor: '#FF6B6B',
    },
  },

  // === TIER BADGE (FROM REFERENCE) ===
  tier: {
    padding: '4px 10px',
    borderRadius: 6,                     // EXACT
    fontSize: 10,                        // EXACT
    fontWeight: '700',                   // EXACT
    textTransform: 'uppercase',

    background: 'rgba(156, 6, 18, 0.3)',
    color: '#FF6B6B',
  },
};
```

---

## 11A. GLASS BOTTOM TAB BAR (IMPLEMENTED)

```javascript
/**
 * Gemral - Glass Bottom Tab Bar
 * Refined floating pill-style tab bar with deep navy glass effect
 * Matching header dark blue color scheme
 */

const GLASS_BOTTOM_TAB = {
  // === TOKENS ===
  colors: {
    bg: '#041027',                           // Very deep navy
    barTint: 'rgba(17, 34, 80, 0.85)',       // Match header GLASS.background
    rimDark: 'rgba(106, 91, 255, 0.2)',      // Purple tint like header border
    rimLight: 'rgba(106, 91, 255, 0.1)',
    icon: 'rgba(255,255,255,0.92)',          // Active icon
    iconInactive: 'rgba(255,255,255,0.48)',  // Inactive icon
    activeBg: 'rgba(17, 34, 80, 0.95)',      // Same dark blue as header
    activeRim: 'rgba(106, 91, 255, 0.3)',    // Purple border like header
    innerShadow: 'rgba(0,0,0,0.55)',
    glassAccent: '#112250',                  // Header navy color
  },

  radius: {
    bar: 40,         // Pill outer radius
    pill: 32,        // Active highlight radius
  },

  sizes: {
    barHeight: 76,   // Tab bar height
    icon: 20,        // Inactive icon size
    activeIcon: 22,  // Active icon size
  },

  glass: {
    blurIntensity: 90,   // Stronger frosted look
    rimAlpha: 0.95,
    glowAlpha: 0.22,
    sheenAlpha: 0.06,
  },

  touch: {
    minSize: 44,     // Apple HIG minimum
  },

  position: {
    bottom: 18,      // Floating offset from screen bottom
    width: '92%',    // Pill width as percentage of screen
  },

  // === TAB ITEMS ===
  tabs: [
    { key: 'Home', label: 'Home', icon: 'Home' },
    { key: 'Shop', label: 'Shop', icon: 'ShoppingCart' },
    { key: 'Trading', label: 'Giao Dịch', icon: 'BarChart2' },
    { key: 'GemMaster', label: 'Gemral', icon: 'Star' },
    { key: 'Notifications', label: 'Thông Báo', icon: 'Bell', badge: true },
    { key: 'Account', label: 'Tài Sản', icon: 'Box' },
  ],

  // === BADGE STYLE ===
  badge: {
    backgroundColor: '#DC2626',    // Red
    borderColor: 'rgba(17, 34, 80, 0.9)',
    borderWidth: 2,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // === ANIMATION ===
  animation: {
    duration: 220,           // Active highlight animation
    useNativeDriver: true,
  },

  // === DEPENDENCIES ===
  // - react-native-shadow-2 (for Shadow component)
  // - expo-blur (for BlurView)
  // - expo-linear-gradient (for LinearGradient)
  // - lucide-react-native (for icons)
};

// === CSS/STYLE IMPLEMENTATION ===
const GLASS_TAB_STYLES = {
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
    alignItems: 'center',
    zIndex: 100,
  },
  blur: {
    overflow: 'hidden',
    backgroundColor: 'rgba(17, 34, 80, 0.85)',
    alignSelf: 'center',
  },
  pill: {
    height: 76,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    paddingHorizontal: 6,
  },
  activeHighlight: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    backgroundColor: 'rgba(17, 34, 80, 0.95)',
    shadowColor: 'rgba(0,0,0,0.55)',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
    opacity: 0.98,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 0.2,
    fontWeight: '600',
  },
};
```

---

## 12. Z-INDEX SCALE

```javascript
const Z_INDEX = {
  base: 0,
  glowEffect: -1,      // Purple glow behind cards
  tabBar: 100,         // Glass bottom tab bar
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};
```

---

## 13. ANIMATION (EXACT FROM REFERENCE)

```javascript
const ANIMATION = {
  // Duration
  duration: {
    fast: 150,
    normal: 300,
    slow: 400,           // EXACT: 0.4s for glass cards
  },

  // Easing (EXACT FROM REFERENCE)
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',  // EXACT
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Transitions (EXACT)
  transitions: {
    glassCard: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    button: 'all 0.3s ease',
    input: 'all 0.3s ease',
  },
};
```

---

## 14. SHADOWS (EXACT FROM REFERENCE)

```javascript
const SHADOWS = {
  // Glass card shadows (EXACT)
  glass: {
    normal: `
      0 10px 20px rgba(0, 0, 0, 0.7),
      0 6px 30px rgba(140, 100, 255, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.03)
    `,
    hover: `
      0 15px 30px rgba(0, 0, 0, 0.8),
      0 10px 40px rgba(140, 100, 255, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.05)
    `,
  },

  // Button shadows (EXACT)
  button: {
    normal: '0 4px 15px rgba(156, 6, 18, 0.4)',
    hover: '0 6px 20px rgba(156, 6, 18, 0.6), 0 0 20px rgba(255, 189, 89, 0.3)',
  },

  // Toggle switch shadow (EXACT)
  toggle: '0 2px 6px rgba(0, 0, 0, 0.3)',

  // Asset icon shadow (EXACT)
  assetIcon: '0 4px 12px rgba(106, 91, 255, 0.3)',

  // Input focus glow (EXACT)
  inputFocus: '0 0 20px rgba(106, 91, 255, 0.3)',
};
```

---

## 15. TOUCH TARGETS

```javascript
const TOUCH = {
  minimum: 44,        // Apple HIG minimum
  recommended: 48,    // Recommended for primary actions
  comfortable: 56,    // Extra comfortable
  gap: 8,            // Minimum gap between targets
};
```

---

## 16. USAGE RULES (UPDATED)

### Color Usage

```javascript
// CORRECT - From Reference
const CORRECT = {
  glassBackground: 'rgba(15, 16, 48, 0.55)',  // NOT rgba(37, 38, 65, 0.4)
  glassBlur: 18,                               // NOT 20
  glassRadius: 18,                             // NOT 24
  buttonRadius: 12,                            // NOT 24

  cyan: '#00F0FF',                             // NOT #00D9FF
  green: '#3AF7A6',                            // NOT #00FF88
  red: '#FF6B6B',                              // NOT #FF4444

  inputBorder: 'rgba(106, 91, 255, 0.3)',      // Purple-tinted
  borderGradient: 'linear-gradient(135deg, #6A5BFF, #00F0FF)',
};

// WRONG - Old values
const WRONG = {
  glassBackground: 'rgba(37, 38, 65, 0.4)',    // Wrong!
  glassBlur: 20,                                // Wrong!
  glassRadius: 24,                              // Wrong!

  cyan: '#00D9FF',                              // Wrong!
  green: '#00FF88',                             // Wrong!
  red: '#FF4444',                               // Wrong!
};
```

---

## 17. COMMON PATTERNS (EXACT FROM REFERENCE)

### Balance Display Card

```javascript
const BalanceCard = {
  container: {
    background: 'rgba(15, 16, 48, 0.6)',
    borderRadius: 18,
    padding: 20,
    backdropFilter: 'blur(18px) saturate(180%)',
    boxShadow: `
      0 10px 20px rgba(0, 0, 0, 0.7),
      0 6px 30px rgba(140, 100, 255, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.03)
    `,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  amount: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -2,
    background: 'linear-gradient(135deg, #FFFFFF, #00F0FF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3AF7A6',
  },
};
```

### Asset Item

```javascript
const AssetItem = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },

  hover: {
    background: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(106, 91, 255, 0.3)',
    transform: 'translateX(5px)',
  },

  icon: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6A5BFF, #00F0FF)',
    boxShadow: '0 4px 12px rgba(106, 91, 255, 0.3)',
  },
};
```

---

## 18. SCREEN SPECIFICATIONS

### Screen Theme Matrix

| Screen | Theme | Background | Cards | Accent |
|--------|-------|------------|-------|--------|
| Scanner | Dark Glass | gradient #05040B→#1a0b2e | Glass rgba(15,16,48,0.55) | #FFBD59 |
| Chatbot | Dark Glass | gradient #05040B→#1a0b2e | Glass | #FFBD59 |
| Account | Dark Glass | gradient #05040B→#1a0b2e | Glass | #FFBD59 |
| Portfolio | Dark Glass | gradient #05040B→#1a0b2e | Glass | #3AF7A6 |

---

## 19. VALIDATION CHECKLIST

### Glass Effect Checklist

```markdown
- [ ] Background: rgba(15, 16, 48, 0.55)
- [ ] Blur: 18px (NOT 20px)
- [ ] Saturate: 180%
- [ ] Border radius: 18px (NOT 24px)
- [ ] Border: 1.2px gradient (#6A5BFF → #00F0FF)
- [ ] Shadow includes purple glow: rgba(140, 100, 255, 0.22)
- [ ] Purple glow effect: #8C64FF, opacity 0.22, blur 40px
- [ ] Transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1)
```

### Color Checklist

```markdown
- [ ] Cyan: #00F0FF (NOT #00D9FF)
- [ ] Green: #3AF7A6 (NOT #00FF88)
- [ ] Red: #FF6B6B (NOT #FF4444)
- [ ] Purple: #6A5BFF
- [ ] Purple glow: #8C64FF
- [ ] Input border: rgba(106, 91, 255, 0.3)
```

### Button Checklist

```markdown
- [ ] Border radius: 12px (NOT 24px)
- [ ] Background: linear-gradient(135deg, #9C0612, #6B0F1A)
- [ ] Border: 1px solid #FFBD59
- [ ] Shadow: 0 4px 15px rgba(156, 6, 18, 0.4)
- [ ] Font size: 15px
- [ ] Font weight: 600
```

---

## APPENDIX A: QUICK REFERENCE

### Copy-Paste Ready Constants

```javascript
// === BACKGROUND ===
const BG_GRADIENT = 'linear-gradient(135deg, #05040B 0%, #0F1030 50%, #1a0b2e 100%)';

// === GLASS CARD ===
const GLASS_BG = 'rgba(15, 16, 48, 0.55)';
const GLASS_BLUR = 'blur(18px) saturate(180%)';
const GLASS_RADIUS = 18;
const GLASS_BORDER_GRADIENT = 'linear-gradient(135deg, #6A5BFF, #00F0FF)';
const GLASS_SHADOW = `
  0 10px 20px rgba(0, 0, 0, 0.7),
  0 6px 30px rgba(140, 100, 255, 0.22),
  inset 0 1px 0 rgba(255, 255, 255, 0.03)
`;

// === COLORS ===
const PURPLE = '#6A5BFF';
const CYAN = '#00F0FF';
const PURPLE_GLOW = '#8C64FF';
const GREEN = '#3AF7A6';
const RED = '#FF6B6B';
const BURGUNDY = '#9C0612';
const BURGUNDY_DARK = '#6B0F1A';
const GOLD = '#FFBD59';

// === TEXT ===
const TEXT_WHITE = '#FFFFFF';
const TEXT_MUTED = 'rgba(255, 255, 255, 0.6)';
const TEXT_SUBTLE = 'rgba(255, 255, 255, 0.5)';

// === INPUT ===
const INPUT_BG = 'rgba(0, 0, 0, 0.3)';
const INPUT_BORDER = 'rgba(106, 91, 255, 0.3)';

// === BUTTON ===
const BUTTON_GRADIENT = 'linear-gradient(135deg, #9C0612, #6B0F1A)';
const BUTTON_BORDER = '#FFBD59';
const BUTTON_RADIUS = 12;
const BUTTON_SHADOW = '0 4px 15px rgba(156, 6, 18, 0.4)';

// === TRANSITION ===
const TRANSITION_GLASS = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
const TRANSITION_BUTTON = 'all 0.3s ease';
```

---

**END OF DESIGN TOKENS v3.0**

**Version History:**
- v3.0 (Nov 23, 2025): Updated to match GEM_LIQUID_GLASS_COMPONENTS.html exactly
- v2.0 (Nov 23, 2025): Updated fonts, navy-dominant colors, gold border buttons
- v1.0 (Nov 22, 2025): Initial production release

**Reference File:** GEM_LIQUID_GLASS_COMPONENTS.html
**Author:** Gemral Design System
**Status:** APPROVED FOR PRODUCTION
