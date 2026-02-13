# GEM Trading Academy - Design System Documentation

## Overview

This document describes the complete UI design system for the Crypto Pattern Scanner application. Use this as a reference when planning UI/UX improvements while maintaining design consistency.

---

## Color Palette

### Primary Colors
- **Burgundy**: `#4A1942` - Primary brand color, used in gradients and accents
- **Navy**: `#112250` - Primary background color, dark theme base
- **Purple**: `#2A1B52` - Secondary accent color, used in gradients

### Accent Colors
- **Gold**: `#FFBD59` - Primary accent for highlights, CTAs, and important elements
- **Gold Light**: `#debc81` - Lighter gold variant for hover states

### Semantic Colors
- **Success Green**: `#0ECB81` - Positive values, success states, profit indicators
- **Danger Red**: `#F6465D` - Negative values, error states, loss indicators
- **Warning Orange**: `#F0B90B` - Warnings, alerts, caution states
- **Info Blue**: `#3B82F6` - Information, neutral actions

### Background Gradients
```css
/* Main app background */
background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

/* Card backgrounds */
background: linear-gradient(135deg, rgba(74, 25, 66, 0.15), rgba(42, 27, 82, 0.15));

/* Header gradients */
background: linear-gradient(135deg, #4A1942 0%, #2A1B52 100%);
```

---

## Typography

### Font Families
- **Primary**: `'Noto Sans Display', sans-serif` - Headings, titles, navigation
- **Secondary**: `'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` - Body text, UI elements

### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extrabold: 800

### Type Scale
- **H1**: 32px / 800 weight - Page titles
- **H2**: 24px / 700 weight - Section headers
- **H3**: 20px / 600 weight - Card headers
- **H4**: 18px / 600 weight - Subsection headers
- **Body**: 16px / 400 weight - Default text
- **Small**: 14px / 400 weight - Secondary text
- **Tiny**: 12px / 400 weight - Labels, hints

---

## Spacing System

Uses 4px base unit with consistent scale:
- **xs**: 8px (0.5rem)
- **sm**: 12px (0.75rem)
- **md**: 16px (1rem)
- **lg**: 20px (1.25rem)
- **xl**: 24px (1.5rem)
- **2xl**: 32px (2rem)
- **3xl**: 40px (2.5rem)
- **4xl**: 48px (3rem)

---

## Component Patterns

### Card Components

**Base Card Style:**
```css
.card {
  background: linear-gradient(135deg, rgba(74, 25, 66, 0.15), rgba(42, 27, 82, 0.15));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 189, 89, 0.3);
}
```

**Card Variants:**
- **Stat Card**: Colored left border, icon + value layout
- **Info Card**: Glass effect, subtle border glow
- **Action Card**: Hover lift effect, clickable
- **Table Card**: Contains data tables with alternating row colors

### Button Components

**Primary Button:**
```css
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}
```

**Button Variants:**
- **Primary**: Gradient background, main actions
- **Secondary**: Transparent with border, secondary actions
- **Danger**: Red gradient, destructive actions
- **Success**: Green gradient, positive confirmations
- **Ghost**: No background, text-only

### Badge Components

**Status Badge:**
```css
.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-success {
  background: rgba(14, 203, 129, 0.15);
  color: #0ECB81;
  border: 1px solid rgba(14, 203, 129, 0.3);
}
```

**Badge Types:**
- Success (green)
- Danger (red)
- Warning (orange)
- Info (blue)
- Neutral (gray)

### Modal Components

**Full-screen Modal:**
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  max-width: 1200px;
  margin: 40px auto;
}
```

### Table Components

**Data Table:**
```css
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead th {
  background: rgba(255, 189, 89, 0.1);
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #FFBD59;
}

.data-table tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

.data-table tbody tr:hover {
  background: rgba(255, 189, 89, 0.05);
}
```

---

## Layout Structure

### Page Wrapper
```css
.page-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 140px); /* Account for nav + footer */
}
```

### Grid Layouts
- **2-column**: `grid-template-columns: repeat(2, 1fr); gap: 24px;`
- **3-column**: `grid-template-columns: repeat(3, 1fr); gap: 20px;`
- **4-column**: `grid-template-columns: repeat(4, 1fr); gap: 16px;`
- **Auto-fit**: `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));`

---

## Effects & Animations

### Glassmorphism
```css
backdrop-filter: blur(20px);
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### Hover Lift
```css
transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

:hover {
  transform: translateY(-4px);
}
```

### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

animation: fadeIn 0.3s ease-out;
```

### Shimmer Loading
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
animation: shimmer 2s infinite;
```

---

## Responsive Breakpoints

### Desktop First Approach
```css
/* Extra Large Desktop */
@media (max-width: 1400px) { }

/* Large Desktop */
@media (max-width: 1200px) { }

/* Desktop */
@media (max-width: 1024px) { }

/* Small Desktop / Tablet */
@media (max-width: 968px) { }

/* Tablet */
@media (max-width: 768px) {
  /* Mobile navigation, single column layouts */
}

/* Mobile */
@media (max-width: 480px) {
  /* Compact spacing, full-width elements */
}
```

---

## Common UI Patterns

### Loading States
- **Spinner**: Rotating border with gold accent color
- **Skeleton**: Shimmer effect with gray background
- **Progress Bar**: Gold gradient fill

### Empty States
- **Icon**: Large centered icon (64px)
- **Message**: Gray text explaining why empty
- **Action**: CTA button to populate

### Error States
- **Icon**: Red warning icon
- **Message**: Error description in red text
- **Retry Button**: Blue button to retry action

### Form Elements
- **Input Fields**: Dark background, gold border on focus
- **Select Dropdowns**: Custom styled with gold accent
- **Checkboxes**: Gold checkmark on dark background
- **Radio Buttons**: Gold dot on dark background

---

## Accessibility Notes

- **Contrast Ratios**: All text meets WCAG AA standards
- **Focus Indicators**: Gold outline on keyboard focus
- **Screen Readers**: Semantic HTML with ARIA labels
- **Color Blindness**: Success/danger states use icons + text

---

## File Organization

### CSS Architecture
Each component has its own CSS file following the pattern:
`ComponentName.css` (not CSS modules, just regular CSS)

### Key CSS Files
See `COLOR_PALETTE.md` for detailed color reference
See `COMPONENT_INVENTORY.md` for complete component catalog
