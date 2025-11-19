# HỆ THỐNG THIẾT KẾ HIỆN TẠI - GEM PLATFORM

**Date:** 2025-11-12
**Project:** Crypto Pattern Scanner (Gem Platform)
**Theme:** Dark Mode (Primary)

---

## 1. COLOR PALETTE

### 🎨 **PRIMARY COLORS**

```css
/* Main Brand Colors */
--primary-burgundy: #4A1942;
--primary-navy: #112250;
--secondary-purple: #2A1B52;
--gold-accent: #FFBD59;
--gold-light: #DEBC81;
```

**Usage:**
- `--primary-burgundy`: Gradient background (bottom)
- `--primary-navy`: Main background color, gradient top
- `--secondary-purple`: Middle gradient color
- `--gold-accent`: Primary accent (buttons, highlights, borders)
- `--gold-light`: Secondary accent (text, subtle highlights)

### 🌈 **GRADIENT BACKGROUNDS**

```css
/* Main App Gradient */
background: linear-gradient(180deg, #112250 0%, #2A1B52 50%, #4A1942 100%);

/* Alternative Gradients */
linear-gradient(135deg, #1a2847, #0f1b35);  /* TopNavBar */
linear-gradient(135deg, rgba(14, 203, 129, 0.1), rgba(255, 189, 89, 0.1));  /* Status bars */
linear-gradient(135deg, #667eea 0%, #764ba2 100%);  /* Purple buttons */
linear-gradient(180deg, #0a1628, #0f1b35, #1a2847);  /* Page backgrounds */
```

### ✅ **STATUS COLORS**

```css
/* Trading Status */
--success-green: #0ECB81;      /* Profit, wins, bullish */
--danger-red: #F6465D;         /* Loss, errors, bearish */
--warning-yellow: #FFBD59;     /* Warnings, alerts */
--info-blue: #667eea;          /* Information, links */
```

### 🎭 **NEUTRAL COLORS**

```css
/* Backgrounds */
--background-primary: #112250;
--background-card: rgba(17, 34, 80, 0.95);
--background-overlay: rgba(17, 34, 80, 0.5);

/* Text Colors */
--text-primary: rgba(255, 255, 255, 0.87);
--text-secondary: rgba(255, 255, 255, 0.7);
--text-tertiary: #aaa;
--text-accent: #FFBD59;

/* Borders */
--border-default: rgba(255, 189, 89, 0.1);
--border-active: rgba(255, 189, 89, 0.3);
--border-strong: #FFBD59;
```

### 💫 **OPACITY VARIANTS**

```css
/* Gold Accent Opacity Levels */
rgba(255, 189, 89, 0.1)  /* Subtle background */
rgba(255, 189, 89, 0.2)  /* Light border/hover */
rgba(255, 189, 89, 0.3)  /* Active border/shadow */
rgba(255, 189, 89, 0.5)  /* Medium glow */
rgba(255, 189, 89, 0.8)  /* Strong glow */

/* Green/Red Opacity */
rgba(14, 203, 129, 0.2)  /* Success background */
rgba(246, 70, 93, 0.2)   /* Error background */
```

---

## 2. TYPOGRAPHY

### 📝 **FONT FAMILIES**

```css
/* Primary Font */
--font-primary: 'Noto Sans Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Secondary Font (Headers, Buttons) */
--font-secondary: 'Montserrat', sans-serif;

/* Monospace (Numbers, Code) */
--font-mono: 'Courier New', monospace;
```

**Usage:**
- **Body text:** Noto Sans Display
- **Headers, nav items, buttons:** Montserrat
- **Numbers, prices, code:** Courier New

### 📏 **FONT SIZES**

```css
/* Text Sizes */
--text-xs: 10px;     /* Badges, tiny labels */
--text-sm: 12px;     /* Small labels, subtitles */
--text-base: 13px;   /* Body text, secondary info */
--text-md: 14px;     /* Primary body text */
--text-lg: 16px;     /* Large body text, buttons */
--text-xl: 18px;     /* Large buttons, emphasis */
--text-2xl: 24px;    /* Subheadings */
--text-3xl: 36px;    /* Page titles */
--text-4xl: 56px;    /* Hero titles */
```

**Examples in Code:**
- Logo title: `18px`
- Logo subtitle: `12px`
- Nav items: `14px`
- Buttons: `14px - 16px`
- Hero title: `56px`
- Page headers: `36px`

### ⚖️ **FONT WEIGHTS**

```css
--weight-regular: 400;
--weight-medium: 600;
--weight-semibold: 700;
--weight-bold: 800;
--weight-black: 900;
```

**Usage:**
- Regular (400): Body text
- Medium (600): Emphasized text, labels
- Semibold (700): Buttons, nav items
- Bold (800): Headers, important text
- Black (900): Hero titles, logo

### 📐 **LINE HEIGHT**

```css
--line-height-tight: 1;      /* Logo, badges */
--line-height-normal: 1.5;   /* Body text */
--line-height-relaxed: 1.75; /* Paragraphs */
```

### 🔤 **LETTER SPACING**

```css
/* Used for emphasis and style */
letter-spacing: 0.5px;  /* Badges */
letter-spacing: 1px;    /* Logo title */
letter-spacing: 2px;    /* Logo subtitle, uppercase labels */
```

---

## 3. SPACING SYSTEM

### 📦 **SPACING SCALE**

```css
/* Base unit: 4px */
--spacing-1: 4px;    /* 0.25rem */
--spacing-2: 8px;    /* 0.5rem */
--spacing-3: 12px;   /* 0.75rem */
--spacing-4: 16px;   /* 1rem */
--spacing-5: 20px;   /* 1.25rem */
--spacing-6: 24px;   /* 1.5rem */
--spacing-8: 32px;   /* 2rem */
--spacing-10: 40px;  /* 2.5rem */
--spacing-12: 48px;  /* 3rem */
--spacing-16: 64px;  /* 4rem */
--spacing-20: 80px;  /* 5rem */
```

### 📋 **COMMON SPACING PATTERNS**

```css
/* Padding Patterns */
padding: 4px 6px;      /* Badges (--spacing-1 --spacing-1.5) */
padding: 4px 10px;     /* Small tags */
padding: 4px 12px;     /* Tier badges */
padding: 8px 12px;     /* Small buttons */
padding: 10px 16px;    /* Medium buttons */
padding: 10px 20px;    /* Nav items */
padding: 12px 24px;    /* TopNavBar, cards */
padding: 14px 28px;    /* Large buttons */
padding: 20px;         /* Main content padding */
padding: 24px;         /* Card padding */
padding: 32px;         /* Large cards */
padding: 80px 24px;    /* Hero section */

/* Gap Patterns */
gap: 4px;    /* Tight elements */
gap: 8px;    /* Nav items */
gap: 10px;   /* Related elements */
gap: 12px;   /* Card content */
gap: 15px;   /* Status bar items */
gap: 16px;   /* Hero content */
gap: 20px;   /* Grid items */
gap: 32px;   /* Large sections */
```

---

## 4. BORDER RADIUS

### 🔲 **RADIUS SCALE**

```css
--radius-xs: 4px;    /* Small elements */
--radius-sm: 6px;    /* Badges, tags */
--radius-md: 10px;   /* Buttons */
--radius-lg: 12px;   /* Nav items, cards */
--radius-xl: 16px;   /* Large cards */
--radius-2xl: 20px;  /* Hero cards */
--radius-full: 50%;  /* Circular elements */
```

### 🎨 **USAGE IN COMPONENTS**

| Component | Radius | Value |
|-----------|--------|-------|
| Badges | Small | 4px - 6px |
| Buttons | Medium | 10px - 12px |
| Nav items | Large | 12px |
| Cards | Large | 16px - 20px |
| Modals | Large | 16px - 20px |
| Spinners | Full | 50% |

---

## 5. SHADOWS

### 🌑 **BOX SHADOWS**

```css
/* Shadow Scale */
--shadow-xs: 0 1px 3px rgba(0, 0, 0, 0.12);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.2);
--shadow-md: 0 4px 15px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 4px 20px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 8px 24px rgba(0, 0, 0, 0.5);

/* Colored Shadows (Glow Effects) */
--shadow-gold: 0 0 8px rgba(255, 189, 89, 0.5);
--shadow-gold-strong: 0 0 16px rgba(255, 189, 89, 0.8);
--shadow-purple: 0 4px 15px rgba(102, 126, 234, 0.4);
--shadow-red: 0 0 4px rgba(244, 67, 54, 0.3);
```

### ✨ **DROP SHADOWS (Icons)**

```css
/* For icon effects */
filter: drop-shadow(0 0 8px rgba(255, 189, 89, 0.5));   /* Logo icon */
filter: drop-shadow(0 0 16px rgba(255, 189, 89, 0.8));  /* Strong glow */
filter: drop-shadow(0 0 20px rgba(255, 189, 89, 0.6));  /* Gem icon */
```

### 🎭 **INSET SHADOWS**

```css
/* For active/pressed states */
box-shadow: inset 0 0 12px rgba(255, 189, 89, 0.1);
```

### 🔦 **MULTI-LAYERED SHADOWS**

```css
/* Complex shadow patterns */
box-shadow:
  0 0 16px rgba(255, 189, 89, 0.3),
  inset 0 0 12px rgba(255, 189, 89, 0.1);
```

---

## 6. ANIMATIONS & TRANSITIONS

### ⏱️ **TRANSITION DURATIONS**

```css
--transition-fast: 0.15s;
--transition-base: 0.2s;
--transition-medium: 0.3s;
--transition-slow: 0.5s;
```

### 🎬 **COMMON TRANSITIONS**

```css
/* Standard Transitions */
transition: all 0.2s ease;               /* Hover effects */
transition: all 0.3s ease;               /* Nav logo, modals */
transition: transform 0.3s ease;         /* Slide animations */
transition: opacity 0.3s ease;           /* Fade effects */
transition: background 0.2s ease;        /* Background changes */

/* Multi-Property Transitions */
transition: all 0.2s ease, box-shadow 0.2s ease;
```

### 🔄 **KEYFRAME ANIMATIONS**

```css
/* Spinner Rotation */
@keyframes spin {
  to { transform: rotate(360deg); }
}
/* Duration: 1s linear infinite */

/* Gem Pulse (Logo) */
@keyframes gemPulse {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(255, 189, 89, 0.5)); }
  50% { filter: drop-shadow(0 0 16px rgba(255, 189, 89, 0.8)); }
}
/* Duration: 2s ease-in-out infinite */

/* Badge Pulse */
@keyframes badgePulse {
  0%, 100% { box-shadow: 0 0 4px rgba(244, 67, 54, 0.3); }
  50% { box-shadow: 0 0 12px rgba(244, 67, 54, 0.6); }
}
/* Duration: 2s ease-in-out infinite */

/* Float Animation */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
/* Duration: 3s ease-in-out infinite */
```

### 🎯 **HOVER EFFECTS**

```css
/* Button Hover */
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

/* Nav Logo Hover */
.nav-logo:hover {
  transform: scale(1.05);
}

/* Nav Item Hover */
.nav-item:hover {
  background: rgba(255, 189, 89, 0.1);
  border-color: #FFBD59;
  transform: translateY(-2px);
}
```

---

## 7. BREAKPOINTS

### 📱 **RESPONSIVE BREAKPOINTS**

```css
/* Mobile First Approach */
--mobile: 480px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1400px;
--ultra-wide: 1920px;
```

### 📏 **MEDIA QUERIES IN USE**

```css
/* Mobile */
@media (max-width: 480px) {
  /* Small adjustments */
}

/* Tablet */
@media (max-width: 768px) {
  /* Mobile menu, single column layout */
  .app-layout {
    grid-template-columns: 1fr;
  }
}

/* Small Desktop */
@media (max-width: 968px) {
  /* Hide desktop labels, show mobile menu */
}

/* Desktop */
@media (max-width: 1024px) {
  /* Adjust grid columns */
  .app-layout {
    grid-template-columns: 30% 40% 30%;
  }
}

/* Large Desktop */
@media (max-width: 1400px) {
  .app-layout {
    grid-template-columns: 25% 45% 30%;
  }
}
```

### 🎨 **CONTAINER MAX-WIDTHS**

```css
/* Page Containers */
max-width: 320px;   /* Min width (body) */
max-width: 400px;   /* Small cards */
max-width: 600px;   /* Hero description */
max-width: 1200px;  /* Hero section */
max-width: 1400px;  /* Portfolio, large pages */
max-width: 1920px;  /* TopNavBar, ultra-wide */
```

---

## 8. Z-INDEX LAYERS

### 📚 **Z-INDEX SCALE**

```css
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-fixed: 500;
--z-modal-backdrop: 900;
--z-modal: 1000;
--z-popover: 1100;
--z-tooltip: 1200;
```

### 🎯 **USAGE IN COMPONENTS**

```css
.top-nav-bar { z-index: 1000; }  /* Sticky navigation */
.scanning-overlay { z-index: 1000; }  /* Full-screen overlay */
.modal-backdrop { z-index: 900; }  /* Modal background */
.modal-content { z-index: 1000; }  /* Modal foreground */
```

---

## 9. COMPONENT-SPECIFIC PATTERNS

### 🔘 **BUTTONS**

```css
/* Primary Button */
.btn-primary {
  padding: 14px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

/* Nav Button */
.nav-item {
  padding: 10px 20px;
  background: rgba(17, 34, 80, 0.4);
  border: 1px solid rgba(255, 189, 89, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

/* Active State */
.nav-item.active {
  background: linear-gradient(135deg, rgba(255, 189, 89, 0.3), rgba(255, 189, 89, 0.15));
  border-color: #FFBD59;
  box-shadow: 0 0 16px rgba(255, 189, 89, 0.3);
}
```

### 🎴 **CARDS**

```css
/* Standard Card */
.card {
  background: linear-gradient(135deg, rgba(17, 34, 80, 0.95), rgba(26, 40, 71, 0.95));
  border: 1px solid rgba(255, 189, 89, 0.3);
  border-radius: 16px;
  padding: 24px;
}

/* Stat Card */
.stat-card {
  background: linear-gradient(135deg, rgba(17, 34, 80, 0.95), rgba(26, 40, 71, 0.95));
  border: 1px solid rgba(255, 189, 89, 0.3);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}
```

### 🏷️ **BADGES**

```css
/* Tier Badge */
.tier-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(255, 189, 89, 0.3), rgba(14, 203, 129, 0.3));
  border: 1px solid #FFBD59;
  color: #FFBD59;
  box-shadow: 0 0 10px rgba(255, 189, 89, 0.3);
}

/* VIP Badge (Animated) */
.vip-badge {
  background: linear-gradient(135deg, #F44336, #E91E63);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  animation: badgePulse 2s ease-in-out infinite;
}
```

### 🎭 **MODALS**

```css
/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 900;
}

/* Modal Content */
.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #1a2847, #0f1b35);
  border: 2px solid rgba(255, 189, 89, 0.3);
  border-radius: 20px;
  padding: 32px;
  max-width: 600px;
  z-index: 1000;
}
```

---

## 10. ACCESSIBILITY

### ♿ **FOCUS STATES**

```css
/* Keyboard Focus Visible */
button:focus-visible,
.nav-btn:focus-visible,
.coin-item:focus-visible {
  outline: 2px solid #FFBD59;
  outline-offset: 2px;
}
```

### 🎬 **REDUCED MOTION**

```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. GRID LAYOUTS

### 📐 **MAIN APP LAYOUT**

```css
/* 3-Column Layout (Scanner) */
.app-layout {
  display: grid;
  grid-template-columns: 20% 50% 30%;  /* Left | Center | Right */
  gap: 0;
  height: calc(100vh - 70px);
  overflow: hidden;
}

/* Portfolio Stats Grid */
.portfolio-stats-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
```

---

## 12. UTILITY CLASSES

### 🛠️ **COMMON UTILITIES**

```css
/* Display */
.flex { display: flex; }
.grid { display: grid; }
.hidden { display: none; }

/* Flex Utilities */
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Text Utilities */
.text-center { text-align: center; }
.text-right { text-align: right; }
.uppercase { text-transform: uppercase; }
```

---

## ✅ DESIGN SYSTEM SUMMARY

### 🎨 **Color Consistency**
- ⭐⭐⭐⭐ (4/5) - Good use of CSS variables in App.css
- ⚠️ Some hardcoded colors in component CSS files
- ✅ Clear gold/navy/purple theme

### 📝 **Typography**
- ⭐⭐⭐ (3/5) - Two main fonts (Noto Sans, Montserrat)
- ⚠️ Font sizes not fully standardized
- ✅ Clear font-weight patterns

### 📦 **Spacing**
- ⭐⭐⭐ (3/5) - Good patterns emerging
- ⚠️ No formal spacing scale defined
- ✅ Consistent padding/gap patterns

### 🎭 **Components**
- ⭐⭐⭐⭐ (4/5) - Good patterns for cards, buttons, badges
- ⚠️ Some inconsistency in implementation
- ✅ Clear hover/active states

### 📱 **Responsive**
- ⭐⭐⭐⭐ (4/5) - Good breakpoint coverage
- ✅ Mobile menu implemented
- ✅ Grid layout adjustments

### ♿ **Accessibility**
- ⭐⭐⭐ (3/5) - Basic focus states
- ✅ Reduced motion support
- ⚠️ Needs more ARIA labels

---

## 🚀 RECOMMENDATIONS

1. **Formalize Design Tokens** - Move all colors, spacing, typography to a single tokens file
2. **Create Component Library** - Standardized Button, Card, Badge components
3. **Add Storybook** - Document and showcase component patterns
4. **TypeScript** - Type-safe props and design tokens
5. **CSS Variables** - Expand usage for all design tokens
6. **Dark/Light Theme** - Proper theme switching system

---

**Analysis Date:** 2025-11-12
**Status:** ✅ Design system documented and ready for redesign planning
