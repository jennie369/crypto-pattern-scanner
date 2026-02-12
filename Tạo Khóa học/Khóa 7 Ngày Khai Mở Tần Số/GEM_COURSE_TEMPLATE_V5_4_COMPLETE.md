# 📚 GEM TRADING ACADEMY - COURSE TEMPLATE V5.4 COMPLETE

**Phiên bản:** 5.4 - Facebook-Style Full-Width Layout + CSS Chi Tiết
**Ngày cập nhật:** 02/01/2025

---

## ⚠️ QUY TẮC QUAN TRỌNG

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ❌ KHÔNG TẠO CÁC THÀNH PHẦN SAU                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ❌ Navigation Buttons (Bài trước / Bài sau)                               │
│  ❌ .lesson-nav class                                                       │
│  ❌ .nav-btn class                                                          │
│  ❌ Bất kỳ links đến bài học khác                                          │
│  ❌ Submit button trong quiz (dùng instant feedback onclick)               │
│                                                                             │
│  → Navigation được xử lý tự động bởi LMS system (Tevello)                  │
│  → Mỗi bài học là file HTML độc lập, không cần link qua lại               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 MỤC LỤC

| Phần | Nội dung |
|------|----------|
| **PHẦN 1** | V5.4 Core Principle - Facebook-Style Layout |
| **PHẦN 2** | V5.4 CSS Design Tokens |
| **PHẦN 3** | V5.4 Component CSS Patterns - CHI TIẾT |
| **PHẦN 4** | Complete HTML Template V5.4 |
| **PHẦN 5** | Quiz System - Instant Feedback |
| **PHẦN 6** | Canva Design System |
| **PHẦN 7** | Checklist & Migration Guide |

---

# 🎯 PHẦN 1: V5.4 CORE PRINCIPLE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    V5.4 FACEBOOK-STYLE LAYOUT PRINCIPLE                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📱 MOBILE (< 600px):                                                       │
│  ────────────────────────────────────────────────────────────────────────   │
│  • Container: padding: 0 (KHÔNG CÓ PADDING)                                │
│  • Components: Full-width, edge-to-edge như Facebook feed                   │
│  • Text elements (h2, h3, p, li): padding-left/right: 16px                 │
│  • Cards/Boxes: border-radius: 0, border-left: 4px thay vì full border     │
│  • Images: Full-width, border-radius: 0                                    │
│  • Grids: gap: 1px với background làm separator                            │
│  • Tables: Full-width, không bo góc                                        │
│                                                                             │
│  💻 DESKTOP (600px+):                                                       │
│  ────────────────────────────────────────────────────────────────────────   │
│  • Container: padding: 1.5rem                                              │
│  • Components: Có margin, contained layout                                  │
│  • Text elements: padding: 0 (container đã có padding)                     │
│  • Cards/Boxes: Full border, border-radius, shadows, hover effects         │
│  • Images: border-radius: 8px, border: 2px                                 │
│  • Grids: gap: 16px+, transparent background                               │
│  • Tables: border-radius: 8px                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 📐 PHẦN 2: V5.4 CSS DESIGN TOKENS

## 2.1 CSS Variables Đầy Đủ

```css
/* ==========================================
   🎨 GEM DESIGN SYSTEM - V5.4 DESIGN TOKENS
   Facebook-Style Full-Width Layout
   ========================================== */

:root {
  /* ========== COLORS - GEM BRAND ========== */
  --color-navy: #112250;
  --color-navy-dark: #0A0F1A;
  --color-navy-light: #1a3a6e;
  --color-gold: #FFBD59;
  --color-gold-dark: #E5A84D;
  --color-burgundy: #9C0612;
  --color-cyan: #00F0FF;
  --color-purple: #6A5BFF;
  --color-green: #10B981;
  --color-red: #EF4444;
  --color-white: #FFFFFF;
  
  /* ========== TEXT COLORS ========== */
  --color-text: #E8E8E8;
  --color-text-secondary: rgba(255, 255, 255, 0.7);
  --color-text-muted: rgba(255, 255, 255, 0.5);
  
  /* ========== BACKGROUNDS ========== */
  --bg-card: rgba(255, 255, 255, 0.03);
  --bg-card-hover: rgba(255, 255, 255, 0.06);
  --bg-glass: rgba(255, 255, 255, 0.03);
  --color-bg-dark: #0A0F1A;
  
  /* ========== BORDERS ========== */
  --border-subtle: rgba(255, 255, 255, 0.1);
  --border-gold: rgba(255, 189, 89, 0.3);
  --border-cyan: rgba(0, 240, 255, 0.3);
  --border-green: rgba(16, 185, 129, 0.3);
  --border-purple: rgba(106, 91, 255, 0.3);
  --glass-border: rgba(255, 255, 255, 0.08);
  
  /* ==========================================
     🚨 V5.4 CRITICAL: TEXT-ONLY PADDING
     Chỉ text elements có padding, components không
     ========================================== */
  --text-padding: 16px;
  
  /* ==========================================
     🚨 V5.4 CRITICAL: CONTAINER PADDING = 0
     Container không có padding trên mobile
     ========================================== */
  --container-padding: 0;
  
  /* ========== SPACING ========== */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-2xl: 24px;
  --space-3xl: 32px;
  
  /* ========== CARD PADDING ========== */
  --card-padding: 12px;
  --table-padding: 6px;
  
  /* ========== BORDER RADIUS ========== */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  /* ========== SHADOWS ========== */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
  --shadow-card: 0 2px 10px rgba(0, 0, 0, 0.3);
  --shadow-glow-gold: 0 0 15px rgba(255, 189, 89, 0.3);
  --shadow-glow-cyan: 0 0 15px rgba(0, 240, 255, 0.3);
  --shadow-glow-green: 0 0 15px rgba(16, 185, 129, 0.3);
  --shadow-glow-purple: 0 0 15px rgba(106, 91, 255, 0.3);
  
  /* ========== GLASSMORPHISM ========== */
  --glass-blur: blur(40px);
  
  /* ========== TYPOGRAPHY ========== */
  --font-heading: 'Montserrat', sans-serif;
  --font-body: 'Noto Sans Display', sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.85rem;
  --text-base: 0.95rem;
  --text-lg: 1.1rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
}

/* ==========================================
   💻 DESKTOP BREAKPOINT (600px+)
   ========================================== */
@media (min-width: 600px) {
  :root {
    --text-padding: 0;          /* Desktop không cần text padding */
    --container-padding: 1.5rem; /* Desktop có container padding */
    --card-padding: 16px;
    --table-padding: 12px;
    
    --space-sm: 10px;
    --space-md: 16px;
    --space-lg: 20px;
    --space-xl: 24px;
    --space-2xl: 32px;
    --space-3xl: 48px;
    
    --text-xs: 0.8rem;
    --text-sm: 0.9rem;
    --text-base: 1rem;
    --text-lg: 1.15rem;
    --text-xl: 1.3rem;
    --text-2xl: 1.6rem;
  }
}
```

---

# 📦 PHẦN 3: V5.4 COMPONENT CSS PATTERNS - CHI TIẾT

## 3.1 BASE STYLES & BACKGROUND

```css
/* ========== RESET & BASE ========== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  background: var(--color-bg-dark);
  color: var(--color-text);
  line-height: 1.6;
  min-height: 100vh;
  font-size: var(--text-base);
}

/* ========== BOKEH BACKGROUND - 5 LAYERS ========== */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    /* Layer 1-2: Gradient base */
    linear-gradient(180deg, 
      rgba(10, 15, 26, 1) 0%,
      rgba(17, 34, 80, 0.8) 30%,
      rgba(17, 34, 80, 0.8) 70%,
      rgba(10, 15, 26, 1) 100%
    ),
    /* Layer 3: Gold bokeh - góc trên trái */
    radial-gradient(ellipse 600px 600px at 20% 20%, 
      rgba(255, 189, 89, 0.08), transparent 70%),
    /* Layer 4: Cyan bokeh - góc dưới phải */
    radial-gradient(ellipse 500px 500px at 80% 80%, 
      rgba(0, 240, 255, 0.06), transparent 70%),
    /* Layer 5: Purple bokeh - trung tâm */
    radial-gradient(ellipse 400px 400px at 50% 50%, 
      rgba(106, 91, 255, 0.04), transparent 70%);
  pointer-events: none;
  z-index: -1;
}
```

## 3.2 CONTAINER - Zero Padding Mobile

```css
/* ========== CONTAINER ========== */
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--container-padding); /* = 0 trên mobile */
}

@media (min-width: 600px) {
  .container {
    padding: var(--container-padding); /* = 1.5rem trên desktop */
  }
}
```

## 3.3 LESSON HEADER - Full-Width Mobile

```css
/* ========== LESSON HEADER ========== */
.lesson-header {
  text-align: center;
  padding: var(--space-lg) var(--text-padding);
  background: var(--bg-card);
  border-radius: 0;
  border: none;
  border-bottom: 1px solid var(--border-subtle);
  backdrop-filter: var(--glass-blur);
  position: relative;
  overflow: hidden;
  margin-bottom: 1px;
}

/* Gradient line top - THEME COLOR (thay đổi theo pattern) */
.lesson-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    var(--color-gold), 
    var(--color-cyan), 
    var(--color-gold)
  );
}

@media (min-width: 600px) {
  .lesson-header {
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-subtle);
    padding: var(--space-xl) var(--card-padding);
    margin-bottom: var(--space-lg);
  }
}

/* LESSON BADGE - THEME COLOR */
.lesson-badge {
  display: inline-block;
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
  color: var(--color-navy);
  padding: var(--space-xs) var(--space-md);
  border-radius: 20px;
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-sm);
}

/* Green theme example */
.lesson-badge.green {
  background: linear-gradient(135deg, var(--color-green), var(--color-cyan));
}

/* Purple theme example */
.lesson-badge.purple {
  background: linear-gradient(135deg, var(--color-purple), #8B5CF6);
  color: white;
}

/* LESSON TITLE */
.lesson-title {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-gold), var(--color-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-sm);
  line-height: 1.3;
}

.lesson-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
```

## 3.4 SECTION - Full-Width Mobile

```css
/* ========== SECTION ========== */
.section {
  background: var(--bg-glass);
  border: none;
  border-bottom: 1px solid var(--glass-border);
  border-radius: 0;
  padding: var(--card-padding) 0;
  margin-bottom: 1px;
  backdrop-filter: var(--glass-blur);
}

@media (min-width: 600px) {
  .section {
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-lg);
    padding: var(--card-padding);
    margin-bottom: var(--space-lg);
  }
}

/* Text elements trong section có padding riêng */
.section > p,
.section > h2,
.section > h3,
.section > ul,
.section > ol {
  padding-left: var(--text-padding);
  padding-right: var(--text-padding);
}

@media (min-width: 600px) {
  .section > p,
  .section > h2,
  .section > h3,
  .section > ul,
  .section > ol {
    padding-left: 0;
    padding-right: 0;
  }
}

/* SECTION TITLE */
.section-title {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-gold);
  margin-bottom: var(--space-md);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.section-title .icon {
  font-size: 1.2em;
}
```

## 3.5 HIGHLIGHT BOXES - 5 Variants

```css
/* ========== HIGHLIGHT BOX - BASE ========== */
.highlight-box {
  padding: var(--card-padding);
  padding-left: calc(var(--text-padding) - 4px);
  padding-right: var(--text-padding);
  border-radius: 0;
  margin: var(--space-md) 0;
  border: none;
  border-left: 4px solid var(--color-gold);
  background: linear-gradient(135deg, 
    rgba(255, 189, 89, 0.1), 
    rgba(0, 240, 255, 0.05)
  );
}

@media (min-width: 600px) {
  .highlight-box {
    border: 1px solid var(--border-gold);
    border-left: 4px solid var(--color-gold);
    border-radius: var(--radius-md);
    padding: var(--card-padding);
  }
}

/* VARIANT: Important (Cyan) */
.highlight-box.important,
.highlight-box.cyan {
  border-left-color: var(--color-cyan);
  background: linear-gradient(135deg, 
    rgba(0, 240, 255, 0.1), 
    rgba(106, 91, 255, 0.05)
  );
}

@media (min-width: 600px) {
  .highlight-box.important,
  .highlight-box.cyan {
    border-color: var(--border-cyan);
    border-left-color: var(--color-cyan);
  }
}

/* VARIANT: Success (Green) */
.highlight-box.success,
.highlight-box.green {
  border-left-color: var(--color-green);
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.1), 
    rgba(0, 240, 255, 0.05)
  );
}

@media (min-width: 600px) {
  .highlight-box.success,
  .highlight-box.green {
    border-color: var(--border-green);
    border-left-color: var(--color-green);
  }
}

/* VARIANT: Info (Purple) */
.highlight-box.info,
.highlight-box.purple {
  border-left-color: var(--color-purple);
  background: linear-gradient(135deg, 
    rgba(106, 91, 255, 0.1), 
    rgba(0, 240, 255, 0.05)
  );
}

@media (min-width: 600px) {
  .highlight-box.info,
  .highlight-box.purple {
    border-color: var(--border-purple);
    border-left-color: var(--color-purple);
  }
}

/* VARIANT: Warning (Red/Burgundy) */
.highlight-box.warning,
.highlight-box.red {
  border-left-color: var(--color-red);
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.1), 
    rgba(156, 6, 18, 0.05)
  );
}

@media (min-width: 600px) {
  .highlight-box.warning,
  .highlight-box.red {
    border-color: rgba(239, 68, 68, 0.3);
    border-left-color: var(--color-red);
  }
}

/* Highlight box content */
.highlight-box p {
  margin: 0;
  font-size: var(--text-sm);
}

.highlight-box strong {
  color: var(--color-gold);
}

.highlight-box.cyan strong,
.highlight-box.important strong {
  color: var(--color-cyan);
}

.highlight-box.green strong,
.highlight-box.success strong {
  color: var(--color-green);
}

.highlight-box.purple strong,
.highlight-box.info strong {
  color: var(--color-purple);
}
```

## 3.6 DEFINITION CARD - Centered

```css
/* ========== DEFINITION CARD ========== */
.definition-card {
  background: linear-gradient(135deg, 
    rgba(255, 189, 89, 0.15), 
    rgba(0, 240, 255, 0.05)
  );
  border: none;
  border-left: 4px solid var(--color-gold);
  border-radius: 0;
  padding: var(--space-lg);
  padding-left: calc(var(--text-padding) - 4px);
  padding-right: var(--text-padding);
  margin: var(--space-lg) 0;
  text-align: center;
}

@media (min-width: 600px) {
  .definition-card {
    border: 2px solid var(--color-gold);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }
}

.definition-card .term {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-gold);
  margin-bottom: var(--space-xs);
  text-transform: uppercase;
}

.definition-card .phonetic {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-style: italic;
  margin-bottom: var(--space-sm);
}

.definition-card .meaning {
  font-size: var(--text-lg);
  color: var(--color-cyan);
  font-weight: 600;
  margin-bottom: var(--space-sm);
}

.definition-card .description {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: 1.6;
}
```

## 3.7 OBJECTIVE LIST - Full-Width Mobile

```css
/* ========== OBJECTIVE LIST ========== */
.objective-list {
  list-style: none;
  padding: 0;
  margin: var(--space-md) 0;
  background: var(--glass-border);
}

@media (min-width: 600px) {
  .objective-list {
    background: transparent;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
}

.objective-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-md) var(--text-padding);
  background: var(--bg-glass);
  border: none;
  border-left: 4px solid var(--color-gold);
  margin-bottom: 1px;
  font-size: var(--text-sm);
}

@media (min-width: 600px) {
  .objective-list li {
    border: 1px solid var(--border-gold);
    border-left: 4px solid var(--color-gold);
    border-radius: var(--radius-sm);
    padding: var(--space-md);
    margin-bottom: 0;
  }
}

.objective-list li:last-child {
  margin-bottom: 0;
}

.objective-list .bullet {
  color: var(--color-gold);
  font-weight: bold;
  flex-shrink: 0;
}
```

## 3.8 STATS GRID - Gap 1px Mobile

```css
/* ========== STATS GRID ========== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  margin: var(--space-md) 0;
  background: var(--glass-border);
}

@media (min-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-md);
    background: transparent;
  }
}

.stat-card {
  background: var(--bg-glass);
  border: none;
  border-radius: 0;
  padding: var(--space-lg) var(--space-md);
  text-align: center;
}

@media (min-width: 600px) {
  .stat-card {
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: var(--card-padding);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-glow-cyan);
  }
}

.stat-value {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Green variant for stats */
.stat-card.green .stat-value {
  color: var(--color-green);
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

/* Gold variant for stats */
.stat-card.gold .stat-value {
  color: var(--color-gold);
  text-shadow: 0 0 10px rgba(255, 189, 89, 0.5);
}
```

## 3.9 PATTERN FLOW - Visual

```css
/* ========== PATTERN FLOW ========== */
.pattern-flow {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: var(--space-md) 0;
  background: var(--glass-border);
}

@media (min-width: 600px) {
  .pattern-flow {
    flex-direction: row;
    gap: var(--space-sm);
    background: transparent;
    align-items: center;
    justify-content: center;
  }
}

.flow-phase {
  background: var(--bg-glass);
  padding: var(--space-md) var(--text-padding);
  text-align: center;
  position: relative;
}

@media (min-width: 600px) {
  .flow-phase {
    flex: 1;
    max-width: 180px;
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: var(--card-padding);
  }
}

.flow-phase .phase-icon {
  font-size: 1.5rem;
  margin-bottom: var(--space-xs);
}

.flow-phase .phase-name {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-base);
  margin-bottom: var(--space-xs);
}

/* Phase colors */
.flow-phase.up .phase-name { color: var(--color-green); }
.flow-phase.down .phase-name { color: var(--color-red); }
.flow-phase.pause .phase-name { color: var(--color-gold); }

.flow-phase .phase-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* Arrows between phases */
.flow-arrow {
  display: none;
}

@media (min-width: 600px) {
  .flow-arrow {
    display: block;
    color: var(--color-cyan);
    font-size: 1.5rem;
  }
}
```

## 3.10 COMPARE GRID - 2 Cards

```css
/* ========== COMPARE GRID ========== */
.compare-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  margin: var(--space-md) 0;
  background: var(--glass-border);
}

@media (min-width: 600px) {
  .compare-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
    background: transparent;
  }
}

.compare-card {
  background: var(--bg-glass);
  padding: var(--card-padding) var(--text-padding);
  border: none;
  border-radius: 0;
}

@media (min-width: 600px) {
  .compare-card {
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: var(--card-padding);
  }
}

.compare-card .card-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.compare-card .card-icon {
  font-size: 1.3rem;
}

.compare-card .card-title {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-base);
  color: var(--color-gold);
}

.compare-card .card-content {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* Accent variants */
.compare-card.green .card-title { color: var(--color-green); }
.compare-card.cyan .card-title { color: var(--color-cyan); }
.compare-card.purple .card-title { color: var(--color-purple); }
```

## 3.11 IMAGE CONTAINER - Full-Width Mobile

```css
/* ========== IMAGE CONTAINER ========== */
.image-container {
  margin: var(--space-md) 0;
  text-align: center;
}

.image-container img {
  width: 100%;
  height: auto;
  border-radius: 0;
  display: block;
  box-shadow: var(--shadow-md);
}

@media (min-width: 600px) {
  .image-container img {
    border-radius: var(--radius-md);
    border: 2px solid var(--glass-border);
  }
}

.image-caption {
  margin-top: var(--space-sm);
  padding: 0 var(--text-padding);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-style: italic;
  text-align: center;
}

@media (min-width: 600px) {
  .image-caption {
    padding: 0;
    font-size: var(--text-sm);
  }
}
```

## 3.12 TABLE - Full-Width Mobile

```css
/* ========== TABLE ========== */
.table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: var(--space-md) 0;
}

.comparison-table {
  width: 100%;
  min-width: 300px;
  border-collapse: collapse;
  font-size: var(--text-xs);
  border-radius: 0;
  overflow: hidden;
}

@media (min-width: 600px) {
  .comparison-table {
    font-size: var(--text-sm);
    border-radius: var(--radius-md);
  }
}

.comparison-table th {
  background: linear-gradient(135deg, 
    rgba(255, 189, 89, 0.2), 
    rgba(0, 240, 255, 0.1)
  );
  color: var(--color-gold);
  font-family: var(--font-heading);
  font-weight: 700;
  text-transform: uppercase;
  font-size: var(--text-xs);
  padding: var(--space-sm) var(--text-padding);
  text-align: left;
  border-bottom: 2px solid var(--color-gold);
}

@media (min-width: 600px) {
  .comparison-table th {
    padding: var(--table-padding);
  }
}

.comparison-table td {
  padding: var(--space-sm) var(--text-padding);
  text-align: left;
  border-bottom: 1px solid var(--glass-border);
  background: var(--bg-glass);
  color: var(--color-text);
}

@media (min-width: 600px) {
  .comparison-table td {
    padding: var(--table-padding);
  }
}

.comparison-table tr:hover td {
  background: var(--bg-card-hover);
}

.comparison-table tr:last-child td {
  border-bottom: none;
}
```

## 3.13 SUMMARY BOX - Border-Left Mobile

```css
/* ========== SUMMARY BOX ========== */
.summary-box {
  background: linear-gradient(135deg, 
    rgba(255, 189, 89, 0.1), 
    rgba(0, 240, 255, 0.05)
  );
  border: none;
  border-left: 4px solid var(--color-gold);
  border-radius: 0;
  padding: var(--card-padding) 0;
  margin: var(--space-lg) 0;
}

@media (min-width: 600px) {
  .summary-box {
    border: 2px solid var(--color-gold);
    border-radius: var(--radius-lg);
    padding: var(--card-padding);
  }
}

/* Green theme */
.summary-box.green {
  border-left-color: var(--color-green);
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.1), 
    rgba(0, 240, 255, 0.05)
  );
}

@media (min-width: 600px) {
  .summary-box.green {
    border-color: var(--color-green);
  }
}

.summary-title {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-gold);
  margin-bottom: var(--space-md);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0 var(--text-padding);
}

.summary-box.green .summary-title {
  color: var(--color-green);
}

@media (min-width: 600px) {
  .summary-title {
    padding: 0;
  }
}

/* Key points list */
.key-points {
  padding: 0 var(--text-padding);
}

@media (min-width: 600px) {
  .key-points {
    padding: 0;
  }
}

.key-point {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.key-point:last-child {
  margin-bottom: 0;
}

.key-point .number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
  color: var(--color-navy);
  border-radius: 50%;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-xs);
  flex-shrink: 0;
}

.summary-box.green .key-point .number {
  background: linear-gradient(135deg, var(--color-green), var(--color-cyan));
}

.key-point .bullet {
  color: var(--color-cyan);
  font-weight: bold;
  flex-shrink: 0;
}
```

## 3.14 FOOTER

```css
/* ========== FOOTER ========== */
.lesson-footer {
  text-align: center;
  padding: var(--space-lg) var(--text-padding);
  background: var(--bg-card);
  border-top: 1px solid var(--border-subtle);
  margin-top: 0;
}

@media (min-width: 600px) {
  .lesson-footer {
    background: transparent;
    border-top: none;
    margin-top: var(--space-lg);
    padding: var(--space-lg) 0;
  }
}

.footer-brand {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--color-gold);
  font-size: var(--text-sm);
}

.footer-url {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  margin-top: var(--space-xs);
}

.footer-url a {
  color: var(--color-cyan);
  text-decoration: none;
}

.footer-url a:hover {
  text-decoration: underline;
}
```

---

# 📝 PHẦN 4: COMPLETE HTML TEMPLATE V5.4

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bài X.X: Tên Bài Học | GEM Trading Academy</title>
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Noto+Sans+Display:wght@400;500;600&display=swap" rel="stylesheet">
  
  <style>
    /* COPY TẤT CẢ CSS TỪ PHẦN 2 & 3 VÀO ĐÂY */
  </style>
</head>
<body>
  <div class="container">
    
    <!-- ============================================
         LESSON HEADER
         ============================================ -->
    <header class="lesson-header">
      <span class="lesson-badge">Bài X.X</span>
      <h1 class="lesson-title">Tên Bài Học</h1>
      <p class="lesson-subtitle">Mô tả ngắn gọn về nội dung bài học</p>
    </header>
    
    <!-- ============================================
         SECTION: MỤC TIÊU BÀI HỌC
         ============================================ -->
    <section class="section">
      <h2 class="section-title">
        <span class="icon">🎯</span>
        Mục Tiêu Bài Học
      </h2>
      
      <ul class="objective-list">
        <li>
          <span class="bullet">✓</span>
          <span>Mục tiêu 1: Hiểu về [khái niệm]</span>
        </li>
        <li>
          <span class="bullet">✓</span>
          <span>Mục tiêu 2: Nhận diện được [pattern]</span>
        </li>
        <li>
          <span class="bullet">✓</span>
          <span>Mục tiêu 3: Áp dụng vào [thực tế]</span>
        </li>
      </ul>
    </section>
    
    <!-- ============================================
         SECTION: ĐỊNH NGHĨA
         ============================================ -->
    <section class="section">
      <h2 class="section-title">
        <span class="icon">📚</span>
        Định Nghĩa
      </h2>
      
      <div class="definition-card">
        <div class="term">THUẬT NGỮ</div>
        <div class="phonetic">/phiên âm/</div>
        <div class="meaning">= Giải nghĩa tiếng Việt</div>
        <div class="description">
          Mô tả chi tiết về thuật ngữ này và ý nghĩa trong trading.
        </div>
      </div>
      
      <p>Nội dung giải thích thêm về khái niệm...</p>
      
      <!-- Highlight Box -->
      <div class="highlight-box">
        <p><strong>💡 Lưu ý quan trọng:</strong> Nội dung cần ghi nhớ...</p>
      </div>
    </section>
    
    <!-- ============================================
         🖼️ HÌNH 1: [TÊN HÌNH]
         - Nội dung: [Mô tả chi tiết]
         - Kích thước: 800x600px
         ============================================ -->
    <div class="image-container">
      <img 
        src="https://via.placeholder.com/800x600/112250/FFBD59?text=HINH+1" 
        alt="Mô tả hình ảnh cho SEO"
        loading="lazy"
      />
    </div>
    <p class="image-caption">Hình 1: Chú thích hình ảnh</p>
    
    <!-- ============================================
         SECTION: THỐNG KÊ
         ============================================ -->
    <section class="section">
      <h2 class="section-title">
        <span class="icon">📊</span>
        Thống Kê Hiệu Suất
      </h2>
      
      <div class="stats-grid">
        <div class="stat-card green">
          <div class="stat-value">68%</div>
          <div class="stat-label">Win Rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">1:2.5</div>
          <div class="stat-label">R:R</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">686</div>
          <div class="stat-label">Backtests</div>
        </div>
        <div class="stat-card gold">
          <div class="stat-value">4H/1D</div>
          <div class="stat-label">Best TF</div>
        </div>
      </div>
    </section>
    
    <!-- ============================================
         🖼️ HÌNH 2: [TÊN HÌNH]
         ============================================ -->
    <div class="image-container">
      <img 
        src="https://via.placeholder.com/800x600/112250/00F0FF?text=HINH+2" 
        alt="Mô tả hình ảnh"
        loading="lazy"
      />
    </div>
    <p class="image-caption">Hình 2: Chú thích hình ảnh</p>
    
    <!-- ============================================
         SECTION: PATTERN FLOW
         ============================================ -->
    <section class="section">
      <h2 class="section-title">
        <span class="icon">🔄</span>
        Cấu Trúc Pattern
      </h2>
      
      <div class="pattern-flow">
        <div class="flow-phase down">
          <div class="phase-icon">📉</div>
          <div class="phase-name">PHASE 1</div>
          <div class="phase-desc">Mô tả phase 1</div>
        </div>
        <div class="flow-arrow">→</div>
        <div class="flow-phase pause">
          <div class="phase-icon">⏸️</div>
          <div class="phase-name">PHASE 2</div>
          <div class="phase-desc">Mô tả phase 2</div>
        </div>
        <div class="flow-arrow">→</div>
        <div class="flow-phase down">
          <div class="phase-icon">📉</div>
          <div class="phase-name">PHASE 3</div>
          <div class="phase-desc">Mô tả phase 3</div>
        </div>
      </div>
    </section>
    
    <!-- ============================================
         🖼️ HÌNH 3: [TÊN HÌNH]
         ============================================ -->
    <div class="image-container">
      <img 
        src="https://via.placeholder.com/800x600/112250/6A5BFF?text=HINH+3" 
        alt="Mô tả hình ảnh"
        loading="lazy"
      />
    </div>
    <p class="image-caption">Hình 3: Chú thích hình ảnh</p>
    
    <!-- ============================================
         SECTION: SO SÁNH
         ============================================ -->
    <section class="section">
      <h2 class="section-title">
        <span class="icon">⚖️</span>
        So Sánh
      </h2>
      
      <div class="compare-grid">
        <div class="compare-card green">
          <div class="card-header">
            <span class="card-icon">✅</span>
            <span class="card-title">Pattern A</span>
          </div>
          <div class="card-content">
            Mô tả chi tiết về Pattern A và cách nhận biết...
          </div>
        </div>
        <div class="compare-card cyan">
          <div class="card-header">
            <span class="card-icon">🔄</span>
            <span class="card-title">Pattern B</span>
          </div>
          <div class="card-content">
            Mô tả chi tiết về Pattern B và điểm khác biệt...
          </div>
        </div>
      </div>
    </section>
    
    <!-- ============================================
         SECTION: BẢNG SO SÁNH
         ============================================ -->
    <section class="section">
      <h2 class="section-title">
        <span class="icon">📋</span>
        Bảng So Sánh Chi Tiết
      </h2>
      
      <div class="table-container">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Tiêu chí</th>
              <th>Option A</th>
              <th>Option B</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tiêu chí 1</td>
              <td>Giá trị A</td>
              <td>Giá trị B</td>
            </tr>
            <tr>
              <td>Tiêu chí 2</td>
              <td>Giá trị A</td>
              <td>Giá trị B</td>
            </tr>
            <tr>
              <td>Tiêu chí 3</td>
              <td>Giá trị A</td>
              <td>Giá trị B</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    
    <!-- ============================================
         🖼️ HÌNH 4: [TÊN HÌNH]
         ============================================ -->
    <div class="image-container">
      <img 
        src="https://via.placeholder.com/800x600/112250/10B981?text=HINH+4" 
        alt="Mô tả hình ảnh"
        loading="lazy"
      />
    </div>
    <p class="image-caption">Hình 4: Chú thích hình ảnh</p>
    
    <!-- ============================================
         SECTION: HIGHLIGHT BOXES VARIANTS
         ============================================ -->
    <section class="section">
      <h2 class="section-title">
        <span class="icon">💡</span>
        Các Loại Highlight Box
      </h2>
      
      <!-- Default - Gold -->
      <div class="highlight-box">
        <p><strong>💡 Mặc định (Gold):</strong> Dùng cho tips, lưu ý thông thường.</p>
      </div>
      
      <!-- Important - Cyan -->
      <div class="highlight-box important">
        <p><strong>⚡ Quan trọng (Cyan):</strong> Dùng cho thông tin quan trọng cần chú ý.</p>
      </div>
      
      <!-- Success - Green -->
      <div class="highlight-box success">
        <p><strong>✅ Thành công (Green):</strong> Dùng cho best practices, cách làm đúng.</p>
      </div>
      
      <!-- Info - Purple -->
      <div class="highlight-box info">
        <p><strong>📝 Thông tin (Purple):</strong> Dùng cho thông tin bổ sung, ghi chú.</p>
      </div>
      
      <!-- Warning - Red -->
      <div class="highlight-box warning">
        <p><strong>⚠️ Cảnh báo (Red):</strong> Dùng cho lỗi thường gặp, cần tránh.</p>
      </div>
    </section>
    
    <!-- ============================================
         SUMMARY BOX
         ============================================ -->
    <div class="summary-box green">
      <h3 class="summary-title">
        <span>📝</span>
        Tóm Tắt Bài Học
      </h3>
      <div class="key-points">
        <div class="key-point">
          <span class="number">1</span>
          <span>Điểm chính 1: Mô tả ngắn gọn...</span>
        </div>
        <div class="key-point">
          <span class="number">2</span>
          <span>Điểm chính 2: Mô tả ngắn gọn...</span>
        </div>
        <div class="key-point">
          <span class="number">3</span>
          <span>Điểm chính 3: Mô tả ngắn gọn...</span>
        </div>
        <div class="key-point">
          <span class="number">4</span>
          <span>Điểm chính 4: Mô tả ngắn gọn...</span>
        </div>
      </div>
    </div>
    
    <!-- ============================================
         📝 QUIZ SECTION - XEM PHẦN 5
         ============================================ -->
    
    <!-- ============================================
         FOOTER
         ============================================ -->
    <footer class="lesson-footer">
      <div class="footer-brand">GEM Trading Academy</div>
      <div class="footer-url">
        <a href="https://gemral.com" target="_blank">gemral.com</a>
      </div>
    </footer>
    
  </div>
  
  <!-- QUIZ JAVASCRIPT - XEM PHẦN 5 -->
</body>
</html>
```

---

# ❓ PHẦN 5: QUIZ SYSTEM - INSTANT FEEDBACK

## 5.1 Tính Năng Quiz V5.4

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ✅ TÍNH NĂNG QUIZ V5.4 - INSTANT FEEDBACK                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ Instant feedback - Click đáp án → hiện kết quả ngay                    │
│  ✅ KHÔNG CÓ NÚT SUBMIT - Chỉ click chọn đáp án                            │
│  ✅ Hiện giải thích ngay sau khi chọn                                       │
│  ✅ Highlight đáp án đúng (màu xanh) và sai (màu đỏ)                        │
│  ✅ Disable tất cả options sau khi chọn                                     │
│  ✅ Nút "Làm Lại Quiz" xuất hiện sau khi trả lời HẾT                        │
│  ✅ Facebook-style layout: border-left mobile, full border desktop          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5.2 Quiz CSS V5.4

```css
/* ============================================
   QUIZ SECTION - V5.4 Instant Feedback
   ============================================ */

.quiz-section {
  background: linear-gradient(135deg, 
    rgba(106, 91, 255, 0.15), 
    rgba(0, 240, 255, 0.05)
  );
  border: none;
  border-left: 4px solid var(--color-purple);
  border-radius: 0;
  padding: var(--card-padding) 0;
  margin: var(--space-lg) 0;
}

@media (min-width: 600px) {
  .quiz-section {
    border: 2px solid var(--color-purple);
    border-radius: var(--radius-lg);
    padding: var(--card-padding);
  }
}

/* Quiz Header */
.quiz-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  padding: 0 var(--text-padding);
}

@media (min-width: 600px) {
  .quiz-header {
    padding: 0;
  }
}

.quiz-icon {
  font-size: 1.3rem;
}

.quiz-title {
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: var(--text-lg);
  color: var(--color-purple);
  margin: 0;
}

/* Quiz Question */
.quiz-question {
  background: var(--bg-glass);
  border: none;
  border-radius: 0;
  border-bottom: 1px solid var(--glass-border);
  padding: var(--card-padding) var(--text-padding);
  margin-bottom: 1px;
}

@media (min-width: 600px) {
  .quiz-question {
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: var(--card-padding);
    margin-bottom: var(--space-lg);
  }
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.question-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  min-width: 24px;
  background: linear-gradient(135deg, var(--color-purple), #8B5CF6);
  color: white;
  border-radius: 50%;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-xs);
}

@media (min-width: 600px) {
  .question-number {
    width: 28px;
    height: 28px;
    min-width: 28px;
    font-size: var(--text-sm);
  }
}

.question-text {
  font-weight: 600;
  color: var(--color-white);
  font-size: var(--text-sm);
  line-height: 1.5;
}

@media (min-width: 600px) {
  .question-text {
    font-size: var(--text-base);
  }
}

/* Quiz Options - Gap 1px Mobile */
.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--glass-border);
  margin: 0 calc(-1 * var(--text-padding));
}

@media (min-width: 600px) {
  .quiz-options {
    gap: var(--space-sm);
    background: transparent;
    margin: 0;
  }
}

/* Quiz Option */
.quiz-option {
  background: rgba(255, 255, 255, 0.02);
  border: none;
  border-radius: 0;
  padding: var(--space-md) var(--text-padding);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-sm);
}

@media (min-width: 600px) {
  .quiz-option {
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-sm);
    padding: var(--space-md);
    font-size: var(--text-base);
  }
  
  .quiz-option:hover:not(.disabled):not(.correct):not(.incorrect) {
    background: rgba(0, 240, 255, 0.1);
    border-color: var(--color-cyan);
  }
}

.quiz-option.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* Correct State */
.quiz-option.correct {
  background: rgba(16, 185, 129, 0.2);
  border-left: 4px solid var(--color-green);
  pointer-events: none;
}

@media (min-width: 600px) {
  .quiz-option.correct {
    border: 1px solid var(--color-green);
    border-left: 4px solid var(--color-green);
  }
}

/* Incorrect State */
.quiz-option.incorrect {
  background: rgba(239, 68, 68, 0.2);
  border-left: 4px solid var(--color-red);
  pointer-events: none;
}

@media (min-width: 600px) {
  .quiz-option.incorrect {
    border: 1px solid var(--color-red);
    border-left: 4px solid var(--color-red);
  }
}

/* Show Correct Answer */
.quiz-option.show-correct {
  border-left: 4px solid var(--color-green);
}

@media (min-width: 600px) {
  .quiz-option.show-correct {
    border-color: var(--color-green);
  }
}

/* Option Elements */
.option-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  min-width: 24px;
  background: rgba(106, 91, 255, 0.2);
  color: var(--color-purple);
  border-radius: 50%;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-xs);
}

@media (min-width: 600px) {
  .option-letter {
    width: 28px;
    height: 28px;
    min-width: 28px;
    font-size: var(--text-sm);
  }
}

.option-text {
  flex: 1;
  color: var(--color-text);
}

.option-result {
  font-weight: 700;
  font-size: var(--text-xs);
  min-width: 50px;
  text-align: right;
}

@media (min-width: 600px) {
  .option-result {
    font-size: var(--text-sm);
    min-width: 60px;
  }
}

.quiz-option.correct .option-result {
  color: var(--color-green);
}

.quiz-option.incorrect .option-result {
  color: var(--color-red);
}

/* Quiz Explanation */
.quiz-explanation {
  display: none;
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0;
  font-size: var(--text-xs);
  line-height: 1.6;
  color: var(--color-text-muted);
}

@media (min-width: 600px) {
  .quiz-explanation {
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
  }
}

.quiz-explanation.show {
  display: block;
}

.quiz-explanation.correct {
  border-left: 3px solid var(--color-green);
}

.quiz-explanation.incorrect {
  border-left: 3px solid var(--color-red);
}

/* Retake Button */
.retake-btn {
  display: none;
  margin-top: var(--space-lg);
  margin-left: var(--text-padding);
  margin-right: var(--text-padding);
  padding: var(--space-sm) var(--space-lg);
  background: linear-gradient(135deg, var(--color-purple), #8B5CF6);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

@media (min-width: 600px) {
  .retake-btn {
    margin-left: 0;
    margin-right: 0;
  }
  
  .retake-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(106, 91, 255, 0.4);
  }
}

.retake-btn.show {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
}
```

## 5.3 Quiz HTML Template - 2 Câu

```html
<!-- ============================================
     📝 QUIZ SECTION - INSTANT FEEDBACK
     ============================================ -->
<section class="quiz-section" id="quizSection">
  <div class="quiz-header">
    <span class="quiz-icon">📝</span>
    <h2 class="quiz-title">KIỂM TRA KIẾN THỨC</h2>
  </div>
  
  <!-- Câu 1 -->
  <div class="quiz-question" id="question1">
    <div class="question-header">
      <span class="question-number">1</span>
      <span class="question-text">Nội dung câu hỏi 1?</span>
    </div>
    
    <div class="quiz-options">
      <div class="quiz-option" data-correct="false" onclick="checkAnswer(this, 1)">
        <span class="option-letter">A</span>
        <span class="option-text">Đáp án A</span>
        <span class="option-result"></span>
      </div>
      <div class="quiz-option" data-correct="true" onclick="checkAnswer(this, 1)">
        <span class="option-letter">B</span>
        <span class="option-text">Đáp án B (Đúng)</span>
        <span class="option-result"></span>
      </div>
      <div class="quiz-option" data-correct="false" onclick="checkAnswer(this, 1)">
        <span class="option-letter">C</span>
        <span class="option-text">Đáp án C</span>
        <span class="option-result"></span>
      </div>
      <div class="quiz-option" data-correct="false" onclick="checkAnswer(this, 1)">
        <span class="option-letter">D</span>
        <span class="option-text">Đáp án D</span>
        <span class="option-result"></span>
      </div>
    </div>
    
    <div class="quiz-explanation" id="explanation1">
      <strong>Giải thích:</strong> Giải thích tại sao đáp án B là đúng...
    </div>
  </div>
  
  <!-- Câu 2 -->
  <div class="quiz-question" id="question2">
    <div class="question-header">
      <span class="question-number">2</span>
      <span class="question-text">Nội dung câu hỏi 2?</span>
    </div>
    
    <div class="quiz-options">
      <div class="quiz-option" data-correct="false" onclick="checkAnswer(this, 2)">
        <span class="option-letter">A</span>
        <span class="option-text">Đáp án A</span>
        <span class="option-result"></span>
      </div>
      <div class="quiz-option" data-correct="false" onclick="checkAnswer(this, 2)">
        <span class="option-letter">B</span>
        <span class="option-text">Đáp án B</span>
        <span class="option-result"></span>
      </div>
      <div class="quiz-option" data-correct="true" onclick="checkAnswer(this, 2)">
        <span class="option-letter">C</span>
        <span class="option-text">Đáp án C (Đúng)</span>
        <span class="option-result"></span>
      </div>
      <div class="quiz-option" data-correct="false" onclick="checkAnswer(this, 2)">
        <span class="option-letter">D</span>
        <span class="option-text">Đáp án D</span>
        <span class="option-result"></span>
      </div>
    </div>
    
    <div class="quiz-explanation" id="explanation2">
      <strong>Giải thích:</strong> Giải thích tại sao đáp án C là đúng...
    </div>
  </div>
  
  <!-- Retake Button -->
  <button class="retake-btn" id="retakeBtn" onclick="retakeQuiz()">
    🔄 Làm Lại Quiz
  </button>
</section>
```

## 5.4 Quiz JavaScript - Instant Feedback

```javascript
<script>
  // ============================================
  // QUIZ JAVASCRIPT - V5.4 INSTANT FEEDBACK
  // Không có nút Submit - Click = Check ngay
  // ============================================
  
  // Track câu đã trả lời
  const answeredQuestions = {};
  
  // ⚠️ QUAN TRỌNG: Thay đổi số này theo số câu quiz thực tế
  const totalQuestions = 2;
  
  function checkAnswer(selectedOption, questionNumber) {
    // Nếu đã trả lời rồi thì không làm gì
    if (answeredQuestions[questionNumber]) {
      return;
    }
    
    // Đánh dấu đã trả lời
    answeredQuestions[questionNumber] = true;
    
    const questionDiv = document.getElementById('question' + questionNumber);
    const options = questionDiv.querySelectorAll('.quiz-option');
    const explanation = document.getElementById('explanation' + questionNumber);
    const isCorrect = selectedOption.getAttribute('data-correct') === 'true';
    
    // Disable tất cả options
    options.forEach(option => {
      option.classList.add('disabled');
      
      // Hiển thị đáp án đúng
      if (option.getAttribute('data-correct') === 'true') {
        option.classList.add('show-correct');
        if (option === selectedOption) {
          option.classList.add('correct');
          option.querySelector('.option-result').textContent = '✓ Đúng!';
        }
      }
      
      // Đánh dấu lựa chọn sai
      if (option === selectedOption && !isCorrect) {
        option.classList.add('incorrect');
        option.querySelector('.option-result').textContent = '✗ Sai';
      }
    });
    
    // Hiển thị giải thích
    explanation.classList.add('show');
    explanation.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    // Kiểm tra nếu đã trả lời hết → hiện nút Làm Lại
    if (Object.keys(answeredQuestions).length === totalQuestions) {
      document.getElementById('retakeBtn').classList.add('show');
    }
  }
  
  // Làm Lại Quiz
  function retakeQuiz() {
    // Reset tracking
    for (let key in answeredQuestions) {
      delete answeredQuestions[key];
    }
    
    // Reset tất cả câu hỏi
    for (let i = 1; i <= totalQuestions; i++) {
      const questionDiv = document.getElementById('question' + i);
      const options = questionDiv.querySelectorAll('.quiz-option');
      const explanation = document.getElementById('explanation' + i);
      
      // Reset options
      options.forEach(option => {
        option.classList.remove('disabled', 'correct', 'incorrect', 'show-correct');
        option.querySelector('.option-result').textContent = '';
      });
      
      // Ẩn giải thích
      explanation.classList.remove('show', 'correct', 'incorrect');
    }
    
    // Ẩn nút Làm Lại
    document.getElementById('retakeBtn').classList.remove('show');
    
    // Scroll lên đầu quiz
    document.getElementById('quizSection').scrollIntoView({ behavior: 'smooth' });
  }
</script>
```

## 5.5 Số Câu Quiz Đề Xuất

| Loại bài học | Số câu quiz | totalQuestions |
|--------------|-------------|----------------|
| Bài giới thiệu khái niệm | 2 câu | `const totalQuestions = 2;` |
| Bài cấu trúc/phases | 2-3 câu | `const totalQuestions = 2;` hoặc `3` |
| Bài thực hành | 2-3 câu | `const totalQuestions = 2;` hoặc `3` |
| Bài case study | 3-4 câu | `const totalQuestions = 3;` hoặc `4` |

---

# 🎨 PHẦN 6: CANVA DESIGN SYSTEM

## 6.1 Kích Thước Hình Ảnh

| Loại Hình | Kích Thước | Tỷ Lệ | Sử Dụng Cho |
|-----------|------------|-------|-------------|
| **Diagram/Infographic** | 800x600px | 4:3 | Sơ đồ, ecosystem |
| **Chart/Dashboard** | 800x600px | 4:3 | Biểu đồ, kết quả |
| **Trading Chart** | 1200x800px | 3:2 | Ví dụ chart |
| **Comparison** | 1000x600px | 5:3 | So sánh 2 concepts |

## 6.2 Placeholder URL Format

```
https://via.placeholder.com/{WIDTH}x{HEIGHT}/{BG_COLOR}/{TEXT_COLOR}?text={TEXT}

Màu GEM:
- Navy: 112250
- Gold: FFBD59
- Cyan: 00F0FF
- Purple: 6A5BFF
- Green: 10B981
```

## 6.3 Số Lượng Hình Đề Xuất

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SỐ LƯỢNG HÌNH ẢNH ĐỀ XUẤT: 4-6 HÌNH/BÀI                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📸 Hình 1: Diagram/Overview - Tổng quan concept                           │
│  📸 Hình 2: Example Chart - Ví dụ thực tế trên chart                       │
│  📸 Hình 3: Step-by-step - Các bước thực hiện                              │
│  📸 Hình 4: Comparison - So sánh hoặc đối chiếu                            │
│  📸 Hình 5 (tùy chọn): Case study                                          │
│  📸 Hình 6 (tùy chọn): Summary infographic                                 │
│                                                                             │
│  ⚠️ KHÔNG quá 6 hình/bài để tránh load chậm                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# ✅ PHẦN 7: CHECKLIST & MIGRATION GUIDE

## 7.1 V5.4 Component Comparison Table

| Component | Mobile (< 600px) | Desktop (600px+) |
|-----------|------------------|------------------|
| `.container` | `padding: 0` | `padding: 1.5rem` |
| `.lesson-header` | `border-radius: 0`, `border-bottom: 1px` | Full border + radius |
| `.section` | `border-radius: 0`, `border-bottom: 1px` | Full border + radius |
| `.highlight-box` | `border-radius: 0`, `border-left: 4px` | Full border + radius |
| `.definition-card` | `border-radius: 0`, `border-left: 4px` | Full `border: 2px` |
| `.objective-list li` | `border-left: 4px`, `gap: 1px` | Full border + radius |
| `.stats-grid` | `gap: 1px` + background separator | `gap: 16px` |
| `.stat-card` | `border-radius: 0`, no border | Full border + hover |
| `.compare-grid` | `gap: 1px` + background separator | `gap: 16px` |
| `.pattern-flow` | Vertical, `gap: 1px` | Horizontal + arrows |
| `.comparison-table` | `border-radius: 0` | `border-radius: 8px` |
| `.image-container img` | `border-radius: 0`, full-width | `border-radius: 8px` |
| `.summary-box` | `border-radius: 0`, `border-left: 4px` | Full `border: 2px` |
| `.quiz-section` | `border-radius: 0`, `border-left: 4px` | Full `border: 2px` |
| `.quiz-options` | `gap: 1px`, negative margin | `gap: 8px` |
| `.quiz-option` | `border-radius: 0`, no border | Full border + hover |
| `.lesson-footer` | `background: card`, `border-top: 1px` | Transparent |
| **Text elements** | `padding: 0 16px` | `padding: 0` |

## 7.2 Implementation Checklist

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    V5.4 IMPLEMENTATION CHECKLIST                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📐 CONTAINER:                                                              │
│  □ .container { padding: 0 } trên mobile                                   │
│  □ .container { padding: 1.5rem } trên desktop                             │
│                                                                             │
│  📦 SECTIONS:                                                               │
│  □ border-radius: 0, border-bottom: 1px trên mobile                        │
│  □ Full border + radius trên desktop                                       │
│  □ Text elements có padding-left/right: 16px trên mobile                   │
│                                                                             │
│  💡 HIGHLIGHT BOXES:                                                        │
│  □ 5 variants: default, cyan, green, purple, red                           │
│  □ border-radius: 0, border-left: 4px trên mobile                          │
│  □ Full border + radius trên desktop                                       │
│                                                                             │
│  📊 GRIDS (stats, compare):                                                │
│  □ gap: 1px + background: separator trên mobile                            │
│  □ gap: 16px+ + background: transparent trên desktop                       │
│  □ Cards không có border + radius trên mobile                              │
│                                                                             │
│  🖼️ IMAGES:                                                                 │
│  □ Full-width, border-radius: 0 trên mobile                                │
│  □ border-radius: 8px + border trên desktop                                │
│  □ 4-6 hình/bài (không quá nhiều)                                          │
│                                                                             │
│  ❓ QUIZ:                                                                   │
│  □ INSTANT FEEDBACK - không có nút Submit                                  │
│  □ Quiz section: border-left: 4px trên mobile                              │
│  □ Quiz options: gap: 1px, negative margin trên mobile                     │
│  □ Retake button với đúng id và onclick                                    │
│  □ totalQuestions = số câu quiz thực tế (2-4 câu)                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 7.3 Enforcement Rules

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    V5.4 ENFORCEMENT RULES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ PHẢI LÀM:                                                               │
│  ✅ Container padding: 0 trên mobile                                       │
│  ✅ Components full-width edge-to-edge trên mobile                         │
│  ✅ Chỉ text elements có padding-left/right: 16px                          │
│  ✅ Mobile: border-radius: 0 cho tất cả cards/boxes                        │
│  ✅ Mobile: border-left: 4px thay vì full border                           │
│  ✅ Mobile: gap: 1px với background làm separator                          │
│  ✅ Desktop: restore full borders, radius, shadows, hover                  │
│  ✅ Quiz: Instant feedback - không có Submit button                        │
│  ✅ Hình ảnh: 4-6 hình/bài, không quá nhiều                                │
│                                                                             │
│  ❌ KHÔNG ĐƯỢC LÀM:                                                         │
│  ❌ Container có padding trên mobile                                       │
│  ❌ Cards/boxes có border-radius trên mobile                               │
│  ❌ Full border cho cards/boxes trên mobile                                │
│  ❌ Quiz có nút Submit - phải dùng instant feedback                        │
│  ❌ Navigation Buttons (Bài trước / Bài sau)                               │
│  ❌ Quá 6 hình/bài                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

**Document Version:** 5.4 COMPLETE
**Updated:** 02/01/2025
**Major Changes từ V5.3:**
- CSS chi tiết đầy đủ cho tất cả components
- 5 variants cho highlight-box (default, cyan, green, purple, red)
- Pattern Flow component với arrows
- Compare Grid component
- Objective List component
- Definition Card cải tiến
- Quiz: Instant Feedback (không có Submit button)
- Giảm placeholder images: 4-6 hình/bài
- Thêm color variants cho stat-card
- CSS responsive đầy đủ cho mọi component

**Purpose:** Complete V5.4 template với CSS chi tiết, Quiz instant feedback, và full-width mobile layout cho GEM Trading Academy
