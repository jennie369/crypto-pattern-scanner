# 🎨 Gemral - GLOBAL COMPONENT SYSTEM

## Quick Reference Guide for Developers

---

## ✅ SYSTEM STATUS

- ✅ `components.css` created with all global classes
- ✅ Imported in `main.jsx` (loads globally)
- ✅ Font fallbacks added to `base.css`
- ✅ All classes ready to use across ALL pages

---

## 📦 HOW TO USE

### Instead of inline styles (OLD WAY - DON'T DO THIS):
```jsx
<div style={{ background: 'rgba(30, 42, 94, 0.4)', border: '1px solid...' }}>
```

### Use classes (NEW WAY - DO THIS):
```jsx
<div className="card-glass">
```

---

## 🎴 CARD CLASSES

### Glass Cards (for general content)
```jsx
<div className="card-glass">
  Your content here
</div>
```

### Stats Cards (for statistics/metrics)
```jsx
<div className="card-stat">
  <div className="text-muted">Total Trades</div>
  <div className="fw-900" style={{ fontSize: '48px' }}>150</div>
</div>
```

### Pricing Cards
```jsx
<!-- FREE tier -->
<div className="card-pricing card-pricing-free">
  <div className="badge badge-free">📚 FREQUENCY TRADING</div>
  <h3 className="text-green">FREE TRIAL</h3>
  <div className="divider-green"></div>
  ...
</div>

<!-- PRO tier -->
<div className="card-pricing card-pricing-pro">
  <div className="badge badge-pro">📚 GÓI 1</div>
  ...
</div>

<!-- PREMIUM tier (with POPULAR badge) -->
<div className="card-pricing card-pricing-premium">
  <div className="badge badge-popular">🔥 POPULAR</div>
  ...
</div>

<!-- VIP tier -->
<div className="card-pricing card-pricing-vip">
  <div className="badge badge-vip">📚 VIP</div>
  <h3 className="heading-vip">GÓI 3 - VIP</h3>
  ...
</div>
```

### FAQ Cards
```jsx
<div className="card-faq">
  <h4>❓ Question here?</h4>
  <p>Answer here...</p>
</div>
```

---

## 🔘 BUTTON CLASSES

### Primary Button (Burgundy + Gold border)
```jsx
<button className="btn-primary">
  ⚡ Bắt Đầu Scan
</button>

<!-- Full width -->
<button className="btn-primary btn-full">
  Mua Ngay
</button>
```

### Success Button (Green gradient)
```jsx
<button className="btn-success btn-full">
  Bắt Đầu Ngay
</button>
```

### Warning Button (Gold/Orange gradient)
```jsx
<button className="btn-warning btn-full">
  Mua Ngay
</button>
```

### Premium Button (Purple gradient)
```jsx
<button className="btn-premium btn-full">
  Mua Ngay
</button>
```

### VIP Button (Gold → Orange → Burgundy gradient)
```jsx
<button className="btn-vip btn-full">
  Mua Ngay - VIP
</button>
```

### Secondary Button (Outline style)
```jsx
<button className="btn-secondary">
  Export CSV
</button>
```

### Button Sizes
```jsx
<button className="btn-primary btn-sm">Small</button>
<button className="btn-primary">Normal</button>
<button className="btn-primary btn-lg">Large</button>
```

---

## 🏷️ BADGE CLASSES

### Course/Product Badges
```jsx
<div className="badge badge-free">📚 FREQUENCY TRADING</div>
<div className="badge badge-pro">📚 GÓI 1</div>
<div className="badge badge-premium">📚 GÓI 2</div>
<div className="badge badge-vip">📚 VIP</div>
```

### POPULAR Badge (absolute positioned)
```jsx
<div className="badge badge-popular">🔥 POPULAR</div>
```

### Current Tier Badge
```jsx
<div className="badge badge-current">✓ Đang Dùng</div>
```

---

## 📦 FEATURE BOXES (inside cards)

```jsx
<!-- Green feature box -->
<div className="feature-box feature-box-green">
  <span>✅</span>
  <span>Truy cập 3 chương đầu</span>
</div>

<!-- Gold feature box -->
<div className="feature-box feature-box-gold">
  <span>✓</span>
  <span>Khóa học GÓI 1</span>
</div>

<!-- Purple feature box -->
<div className="feature-box feature-box-purple">
  <span>✓</span>
  <span>Scanner PREMIUM</span>
</div>

<!-- Cyan feature box -->
<div className="feature-box feature-box-cyan">
  <span>✓</span>
  <span>Chatbot PRO</span>
</div>
```

---

## 🎨 COMBO/BUNDLE BADGES

```jsx
<div className="combo-badge combo-badge-gold">
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span>⭐</span>
    <span className="fw-600 text-gold">Combo: Khóa học + Scanner + Chatbot</span>
  </div>
</div>
```

---

## ➖ DIVIDERS

```jsx
<div className="divider-gold"></div>
<div className="divider-cyan"></div>
<div className="divider-purple"></div>
<div className="divider-green"></div>
```

---

## 📝 HEADING CLASSES

### Gold Gradient Headings
```jsx
<h1 className="heading-gold">
  💎 Bảng Giá - GEM Trading Academy
</h1>

<!-- Small -->
<h2 className="heading-gold heading-gold-sm">Smaller Heading</h2>

<!-- Large -->
<h1 className="heading-gold heading-gold-lg">Larger Heading</h1>
```

### VIP Gradient Heading
```jsx
<h2 className="heading-vip">GÓI 3 - VIP</h2>
```

---

## 🌐 PAGE WRAPPER

### Wrap ALL pages with this container:
```jsx
function MyPage() {
  return (
    <div className="page-container">
      <div className="page-content">
        {/* Your page content here */}
        <h1 className="heading-gold">Page Title</h1>

        <div className="card-glass">
          Card content here
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 UTILITY CLASSES

### Text Colors
```jsx
<span className="text-green">Green text</span>
<span className="text-gold">Gold text</span>
<span className="text-purple">Purple text</span>
<span className="text-cyan">Cyan text</span>
<span className="text-red">Red text</span>
<span className="text-white">White text</span>
<span className="text-muted">Muted text</span>
```

### Font Weights
```jsx
<span className="fw-600">Semi-bold</span>
<span className="fw-700">Bold</span>
<span className="fw-800">Extra bold</span>
<span className="fw-900">Black</span>
```

### Margins
```jsx
<div className="mt-8">Margin top 8px</div>
<div className="mt-16">Margin top 16px</div>
<div className="mt-24">Margin top 24px</div>
<div className="mb-8">Margin bottom 8px</div>
<div className="mb-16">Margin bottom 16px</div>
<div className="mb-24">Margin bottom 24px</div>
```

---

## ✅ REAL EXAMPLES

### Example 1: Trading Journal Stats Card
```jsx
<div className="card-stat">
  <div style={{ fontSize: '12px' }} className="text-muted">TOTAL TRADES</div>
  <div className="fw-900 text-white" style={{ fontSize: '48px' }}>150</div>
  <div className="text-muted">50 wins / 100 total</div>
</div>
```

### Example 2: Pricing Card (Premium tier)
```jsx
<div className="card-pricing card-pricing-premium">
  {/* POPULAR badge */}
  <div className="badge badge-popular">🔥 POPULAR</div>

  {/* Course badge */}
  <div className="badge badge-premium mb-16">
    📚 Khóa học FREQUENCY TRADING
  </div>

  {/* Title */}
  <h3 className="text-purple fw-900" style={{ fontSize: '36px' }}>
    GÓI 2
  </h3>

  {/* Price */}
  <div className="fw-900 text-white" style={{ fontSize: '48px' }}>
    21.000.000đ
  </div>
  <div className="text-muted mb-24">/ tháng</div>

  {/* Combo badge */}
  <div className="combo-badge combo-badge-purple">
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>⭐</span>
      <span className="fw-600 text-purple">Combo: Khóa học + Scanner + Chatbot</span>
    </div>
  </div>

  {/* Features */}
  <div className="mb-24">
    <div className="feature-box feature-box-purple">
      <span>✓</span>
      <span>Khóa học GÓI 2</span>
    </div>
    <div className="feature-box feature-box-purple">
      <span>✓</span>
      <span>Scanner PREMIUM</span>
    </div>
  </div>

  {/* Bottom highlight */}
  <div className="combo-badge combo-badge-green mb-24">
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>✅</span>
      <span className="fw-600 text-green">Tất cả tính năng Gói 1</span>
    </div>
  </div>

  {/* CTA Button */}
  <button className="btn-premium btn-full">
    Mua Ngay
  </button>
</div>
```

### Example 3: Settings Page Card
```jsx
<div className="card-glass">
  <h2 className="fw-700 text-white mb-16">⚙️ Settings</h2>
  <p className="text-muted mb-24">Configure your preferences</p>

  {/* Settings options here */}

  <button className="btn-primary btn-full mt-24">
    💾 Save Settings
  </button>
</div>
```

---

## 🎯 MIGRATION CHECKLIST

To migrate an existing page to use the global component system:

1. ✅ Wrap page with `<div className="page-container">` and `<div className="page-content">`
2. ✅ Replace inline card styles with `.card-glass`, `.card-stat`, `.card-pricing`, etc.
3. ✅ Replace inline button styles with `.btn-primary`, `.btn-success`, etc.
4. ✅ Replace inline badge styles with `.badge badge-*`
5. ✅ Use `.heading-gold` for main headings
6. ✅ Use utility classes for colors, margins, font weights
7. ✅ Replace inline dividers with `.divider-gold`, `.divider-cyan`, etc.

---

## 💡 BENEFITS

✅ **Consistency**: All cards, buttons, badges look identical across all pages
✅ **Maintainability**: Change `components.css` once, affects everything
✅ **Speed**: No more copy-pasting inline styles
✅ **Clean Code**: No more 50-line style objects
✅ **Responsive**: Built-in mobile breakpoints
✅ **Accessible**: Built-in focus states and keyboard navigation

---

## 🚀 NEXT STEPS

1. ✅ Global system is now active
2. 📝 Migrate pages one by one (or use search & replace)
3. 🧪 Test all pages to ensure consistency
4. 🎨 Customize `components.css` if needed
5. 📚 Educate team on new class system

---

**🎉 The global component system is now live! Use these classes everywhere!**
