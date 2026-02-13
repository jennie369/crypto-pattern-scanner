# Color Palette Reference

Complete color system for GEM Trading Academy Crypto Pattern Scanner

---

## Primary Brand Colors

### Burgundy
```css
--primary-burgundy: #4A1942;
```
**Usage:**
- Primary brand color
- Gradient backgrounds
- Header sections
- Important accents

**RGB:** `74, 25, 66`
**HSL:** `315°, 49%, 19%`

---

### Navy
```css
--primary-navy: #112250;
```
**Usage:**
- Main background color
- Dark theme base
- Gradient backgrounds
- Container backgrounds

**RGB:** `17, 34, 80`
**HSL:** `224°, 65%, 19%`

---

### Purple
```css
--secondary-purple: #2A1B52;
```
**Usage:**
- Secondary accent
- Gradient midpoints
- Card backgrounds
- Hover states

**RGB:** `42, 27, 82`
**HSL:** `256°, 51%, 21%`

---

## Accent Colors

### Gold (Primary Accent)
```css
--gold-accent: #FFBD59;
```
**Usage:**
- CTAs and primary actions
- Important highlights
- Focus states
- Premium features
- Active navigation items

**RGB:** `255, 189, 89`
**HSL:** `36°, 100%, 67%`

---

### Gold Light
```css
--gold-light: #debc81;
```
**Usage:**
- Hover states for gold elements
- Lighter accents
- Subtle highlights

**RGB:** `222, 188, 129`
**HSL:** `38°, 59%, 69%`

---

## Semantic Colors

### Success Green
```css
--success-green: #0ECB81;
```
**Usage:**
- Profit indicators
- Positive price changes
- Success messages
- Confirmation states
- Long positions

**RGB:** `14, 203, 129`
**HSL:** `157°, 87%, 43%`

---

### Danger Red
```css
--danger-red: #F6465D;
```
**Usage:**
- Loss indicators
- Negative price changes
- Error messages
- Destructive actions
- Short positions

**RGB:** `246, 70, 93`
**HSL:** `352°, 91%, 62%`

---

### Warning Orange
```css
--warning-orange: #F0B90B;
```
**Usage:**
- Warning messages
- Caution states
- Pending actions
- Alerts

**RGB:** `240, 185, 11`
**HSL:** `46°, 91%, 49%`

---

### Info Blue
```css
--info-blue: #3B82F6;
```
**Usage:**
- Information messages
- Neutral actions
- Links
- Help text

**RGB:** `59, 130, 246`
**HSL:** `217°, 91%, 60%`

---

## Background Colors

### Dark Backgrounds

#### Main Background
```css
background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
```

#### Card Background (Glassmorphism)
```css
background: linear-gradient(
  135deg,
  rgba(74, 25, 66, 0.15),
  rgba(42, 27, 82, 0.15)
);
backdrop-filter: blur(20px);
```

#### Header Background
```css
background: linear-gradient(135deg, #4A1942 0%, #2A1B52 100%);
```

---

## Button Gradients

### Primary Button
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Success Button
```css
background: linear-gradient(135deg, #0ECB81 0%, #0BA468 100%);
```

### Danger Button
```css
background: linear-gradient(135deg, #F6465D 0%, #D63447 100%);
```

### Gold Button
```css
background: linear-gradient(135deg, #FFBD59 0%, #debc81 100%);
```

---

## Border Colors

### Subtle Border (Default)
```css
border: 1px solid rgba(255, 255, 255, 0.1);
```

### Hover Border
```css
border: 1px solid rgba(255, 189, 89, 0.3);
```

### Active Border
```css
border: 1px solid rgba(255, 189, 89, 0.6);
```

### Success Border
```css
border: 1px solid rgba(14, 203, 129, 0.3);
```

### Danger Border
```css
border: 1px solid rgba(246, 70, 93, 0.3);
```

---

## Text Colors

### Primary Text
```css
color: #ffffff;
```
**Usage:** Main content, headings

---

### Secondary Text
```css
color: #aaaaaa;
```
**Usage:** Supporting text, labels

---

### Muted Text
```css
color: #777777;
```
**Usage:** Placeholder text, disabled states

---

### Gold Text
```css
color: #FFBD59;
```
**Usage:** Important values, CTAs, links

---

### Success Text
```css
color: #0ECB81;
```
**Usage:** Positive values, profit

---

### Danger Text
```css
color: #F6465D;
```
**Usage:** Negative values, loss

---

## Shadow Colors

### Card Shadow
```css
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

### Hover Shadow
```css
box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
```

### Button Shadow
```css
box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
```

### Gold Glow
```css
box-shadow: 0 4px 12px rgba(255, 189, 89, 0.4);
```

---

## Overlay Colors

### Modal Overlay
```css
background: rgba(0, 0, 0, 0.85);
backdrop-filter: blur(8px);
```

### Loading Overlay
```css
background: rgba(0, 0, 0, 0.7);
```

---

## Status Colors

### Pattern Confidence

#### High Confidence (80%+)
```css
color: #0ECB81;
background: rgba(14, 203, 129, 0.15);
border: 1px solid rgba(14, 203, 129, 0.3);
```

#### Medium Confidence (60-79%)
```css
color: #F0B90B;
background: rgba(240, 185, 11, 0.15);
border: 1px solid rgba(240, 185, 11, 0.3);
```

#### Low Confidence (<60%)
```css
color: #F6465D;
background: rgba(246, 70, 93, 0.15);
border: 1px solid rgba(246, 70, 93, 0.3);
```

---

## Zone Type Colors

### HFZ (High Frequency Zone) - Resistance
```css
color: #F6465D;
background: rgba(246, 70, 93, 0.1);
border-left: 4px solid #F6465D;
```

### LFZ (Low Frequency Zone) - Support
```css
color: #0ECB81;
background: rgba(14, 203, 129, 0.1);
border-left: 4px solid #0ECB81;
```

---

## Tier Badge Colors

### Free Tier
```css
color: #aaaaaa;
background: rgba(170, 170, 170, 0.15);
border: 1px solid rgba(170, 170, 170, 0.3);
```

### Pro Tier (TIER 1)
```css
color: #3B82F6;
background: rgba(59, 130, 246, 0.15);
border: 1px solid rgba(59, 130, 246, 0.3);
```

### Premium Tier (TIER 2)
```css
color: #FFBD59;
background: rgba(255, 189, 89, 0.15);
border: 1px solid rgba(255, 189, 89, 0.3);
```

### VIP Tier (TIER 3)
```css
color: #a855f7;
background: rgba(168, 85, 247, 0.15);
border: 1px solid rgba(168, 85, 247, 0.3);
```

---

## Chart Colors

### Candlestick Chart
```css
--candle-up: #0ECB81;    /* Bullish candle */
--candle-down: #F6465D;  /* Bearish candle */
--wick: #ffffff;          /* Candle wicks */
```

### Line Chart
```css
--line-primary: #667eea;
--line-secondary: #FFBD59;
--line-tertiary: #0ECB81;
```

### Grid Lines
```css
color: rgba(255, 255, 255, 0.05);
```

---

## Usage Examples

### Success State Card
```css
.success-card {
  background: rgba(14, 203, 129, 0.1);
  border: 1px solid rgba(14, 203, 129, 0.3);
  border-left: 4px solid #0ECB81;
  color: #ffffff;
}

.success-card .icon {
  color: #0ECB81;
}
```

### Warning State Card
```css
.warning-card {
  background: rgba(240, 185, 11, 0.1);
  border: 1px solid rgba(240, 185, 11, 0.3);
  border-left: 4px solid #F0B90B;
  color: #ffffff;
}

.warning-card .icon {
  color: #F0B90B;
}
```

### Error State Card
```css
.error-card {
  background: rgba(246, 70, 93, 0.1);
  border: 1px solid rgba(246, 70, 93, 0.3);
  border-left: 4px solid #F6465D;
  color: #ffffff;
}

.error-card .icon {
  color: #F6465D;
}
```

---

## Color Accessibility

### Contrast Ratios (WCAG AA)

| Foreground | Background | Ratio | Status |
|------------|------------|-------|--------|
| #ffffff | #4A1942 | 8.7:1 | Pass AAA |
| #ffffff | #112250 | 12.1:1 | Pass AAA |
| #ffffff | #2A1B52 | 10.3:1 | Pass AAA |
| #FFBD59 | #112250 | 7.2:1 | Pass AA |
| #0ECB81 | #112250 | 5.8:1 | Pass AA |
| #F6465D | #112250 | 4.9:1 | Pass AA |

---

## Dark Mode Notes

This application uses **dark mode only**. All colors are optimized for dark backgrounds.

**Key principles:**
- White text (#ffffff) for primary content
- Gray text (#aaaaaa, #777777) for secondary content
- Colored accents stand out against dark backgrounds
- Glassmorphism effects add depth without harsh contrasts
- All interactive elements have clear hover/focus states
