# 💎 Pattern Card Component - Gem Trading Academy

Complete React component với đầy đủ animations theo Gem Holding brand identity.

## ✨ Features

### 🎨 **Animations Đầy Đủ**

1. **Particles Bay Lên (6-10 hạt)**
   - 3 loại size khác nhau
   - Màu vàng gold (#FFBD59, #DEBC81, white)
   - Chuyển động ngẫu nhiên, xoay tròn
   - Trigger khi hover vào card

2. **Glow Effects**
   - 2 orbs phát sáng (gold và burgundy)
   - Float animation liên tục
   - Blur effect mềm mại

3. **Float Animations**
   - Card float nhẹ nhàng (6s cycle)
   - Icon pulse animation
   - Direction blink effect

4. **Hover Interactions**
   - Card scale up + lift up
   - Border glow rotation
   - Chart shine overlay
   - Button effects
   - Price row slide

5. **Copy Functionality**
   - Visual feedback: "Copy" → "Copied!" → "Copy"
   - Green flash effect
   - Smooth transitions

6. **Chart Thumbnail**
   - 1:1 aspect ratio
   - Highlighted pattern area với dashed border
   - Shine effect on hover
   - Scale animation

7. **Confidence Bar**
   - Animated fill
   - Continuous shine effect
   - Glow pulse

### 🎨 **Gem Holding Brand Colors**

```css
--primary-burgundy: #9C0612
--primary-dark: #640A0C
--gold-accent: #FFBD59
--gold-light: #DEBC81
--bg-navy: #112250
--text-light: #FFFFFF
--text-gold: #DEBC81
```

### 📊 **Pattern Support**

Component hỗ trợ hiển thị các loại pattern:
- Head and Shoulders
- Double Top/Bottom
- Triangles (Ascending/Descending/Symmetrical)
- Cup and Handle
- Engulfing patterns
- Supply/Demand Zones
- Flags, Wedges
- và nhiều hơn...

---

## 🚀 Installation

### 1. **Setup React Project**

```bash
# Tạo React project với Vite
npm create vite@latest pattern-scanner -- --template react
cd pattern-scanner

# Install dependencies
npm install

# Install Framer Motion cho animations
npm install framer-motion

# Run dev server
npm run dev
```

### 2. **Copy Component Files**

Copy 4 files vào project:
```
src/
├── components/
│   ├── PatternCard.jsx
│   └── PatternCard.css
├── App.jsx
└── App.css
```

---

## 📖 Usage

### **Basic Usage**

```jsx
import PatternCard from './components/PatternCard';

function App() {
  const pattern = {
    symbol: 'BTCUSDT Perp',
    patternType: 'Head and Shoulders',
    entry: 110598.33,
    stopLoss: 110999.07,
    takeProfit: [110197.59, 109796.84, 109396.10],
    confidence: 0.90,
    timestamp: new Date().toISOString(),
    direction: 'bearish', // 'bullish' or 'bearish'
  };

  return (
    <PatternCard pattern={pattern} />
  );
}
```

### **Pattern Data Structure**

```typescript
interface Pattern {
  symbol: string;           // 'BTCUSDT Perp'
  patternType: string;      // 'Head and Shoulders'
  patternImage?: string;    // URL hoặc null (sẽ dùng placeholder)
  entry: number;            // 110598.33
  stopLoss: number;         // 110999.07
  takeProfit: number[];     // [110197.59, 109796.84, 109396.10]
  confidence: number;       // 0.90 (0-1)
  timestamp: string;        // ISO string
  direction: 'bullish' | 'bearish';
  chartCoordinates?: {
    startIdx: number;
    endIdx: number;
  };
}
```

### **Multiple Cards Grid**

```jsx
const patterns = [
  { /* pattern 1 */ },
  { /* pattern 2 */ },
  { /* pattern 3 */ },
];

<div className="pattern-grid">
  {patterns.map((pattern, index) => (
    <PatternCard key={index} pattern={pattern} />
  ))}
</div>
```

---

## 🎯 Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `pattern` | `Pattern` | Yes | Pattern data object |
| `pattern.symbol` | `string` | Yes | Trading pair (e.g., "BTCUSDT Perp") |
| `pattern.patternType` | `string` | Yes | Pattern name |
| `pattern.entry` | `number` | Yes | Entry price |
| `pattern.stopLoss` | `number` | Yes | Stop loss price |
| `pattern.takeProfit` | `number[]` | Yes | Array of TP levels (1-3) |
| `pattern.confidence` | `number` | Yes | Confidence 0-1 |
| `pattern.timestamp` | `string` | Yes | ISO timestamp |
| `pattern.direction` | `'bullish' \| 'bearish'` | Yes | Trade direction |
| `pattern.patternImage` | `string` | No | Chart image URL |
| `pattern.chartCoordinates` | `object` | No | For chart zoom |

---

## 🎨 Customization

### **Change Colors**

Edit `PatternCard.css`:

```css
:root {
  /* Thay đổi brand colors */
  --primary-burgundy: #YOUR_COLOR;
  --gold-accent: #YOUR_COLOR;
  /* ... */
}
```

### **Adjust Animations**

```css
/* Tắt particles */
.particles-container {
  display: none;
}

/* Slow down float animation */
@keyframes cardFloat {
  /* Change duration from 6s to 10s */
}

/* Remove glow effects */
.glow-orbs {
  display: none;
}
```

### **Change Card Size**

```css
.pattern-card {
  padding: 32px; /* Increase from 24px */
}

.pattern-chart-container {
  aspect-ratio: 16 / 9; /* Change from 1/1 */
}
```

---

## 🎭 Animation Details

### **Performance Optimized**

- Sử dụng `transform` và `opacity` cho smooth animations
- GPU-accelerated với `will-change`
- Conditional rendering cho particles (chỉ khi hover)
- Framer Motion với lazy loading

### **Accessibility**

```css
/* Respects user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
  }
}
```

- Focus visible states
- Keyboard navigation support
- Screen reader friendly
- High contrast support

---

## 📱 Responsive Design

Breakpoints:
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

```css
@media (max-width: 768px) {
  .pattern-card {
    padding: 20px;
  }
  /* Adjusted sizes for mobile */
}
```

---

## 🔧 Browser Support

- Chrome/Edge: ✅ (recommended)
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

Requires:
- CSS Grid
- CSS Custom Properties
- Backdrop Filter
- Framer Motion

---

## 💡 Tips & Best Practices

### **1. Performance**

```jsx
// Memoize component nếu render nhiều cards
import { memo } from 'react';

const PatternCard = memo(({ pattern }) => {
  // ...
});
```

### **2. Real Chart Images**

```jsx
// Thay placeholder bằng real chart snapshot
const pattern = {
  patternImage: 'https://your-api.com/chart-snapshot.png',
  // ...
};
```

### **3. Click Handlers**

```jsx
<PatternCard 
  pattern={pattern}
  onClick={() => {
    // Zoom chart chính đến pattern này
    zoomToPattern(pattern.chartCoordinates);
  }}
/>
```

### **4. Loading States**

```jsx
{isLoading ? (
  <div className="loading-skeleton" style={{ height: '500px' }} />
) : (
  <PatternCard pattern={pattern} />
)}
```

---

## 🐛 Troubleshooting

### **Animations không chạy?**

```bash
# Check Framer Motion installed
npm list framer-motion

# Reinstall nếu cần
npm install framer-motion
```

### **Particles không hiện?**

- Check hover state
- Verify `isHovered` state
- Check z-index layers

### **Colors sai?**

- Verify CSS Variables trong `:root`
- Check import của CSS file
- Clear browser cache

---

## 📄 License

MIT License - Free to use for personal and commercial projects.

---

## 🤝 Contributing

Feel free to:
- Add more animations
- Improve performance
- Add new pattern types
- Create themes

---

## 📞 Support

Questions? Issues?
- Check demo at `/demo`
- Review code comments
- Test with provided sample data

---

## 🎉 Credits

Created for **Gem Trading Academy**  
Design: Gem Holding Brand Identity  
Animations: Framer Motion  
Icons: Unicode Emoji

---

**Happy Trading! 💎📈**
