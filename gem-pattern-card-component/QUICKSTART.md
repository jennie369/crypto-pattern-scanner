# 🚀 QUICK START GUIDE

## Pattern Card Component - 5 Phút Setup

---

## ⚡ OPTION 1: Setup Từ Đầu (Recommended)

### **Bước 1: Tạo React Project**

```bash
# Tạo project với Vite
npm create vite@latest gem-pattern-scanner -- --template react

# Di chuyển vào folder
cd gem-pattern-scanner

# Install dependencies
npm install

# Install Framer Motion
npm install framer-motion
```

### **Bước 2: Copy Component Files**

Copy các files vào project structure:

```
gem-pattern-scanner/
├── src/
│   ├── components/
│   │   ├── PatternCard.jsx       ← Copy file này
│   │   └── PatternCard.css       ← Copy file này
│   ├── App.jsx                    ← Replace với file mới
│   ├── App.css                    ← Replace với file mới
│   └── main.jsx                   ← Giữ nguyên
├── package.json                   ← Đã có sẵn
└── index.html                     ← Giữ nguyên
```

### **Bước 3: Update index.html**

Thêm Google Fonts vào `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Noto+Sans+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <title>Gem Pattern Scanner</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### **Bước 4: Run Development Server**

```bash
npm run dev
```

Mở browser tại: `http://localhost:5173`

---

## ⚡ OPTION 2: Clone & Run (Nhanh nhất)

```bash
# Clone hoặc copy toàn bộ folder
cd gem-pattern-scanner

# Install dependencies
npm install

# Run
npm run dev
```

---

## 🎨 Customize Your Own Pattern

### **File: App.jsx**

Thêm pattern của bạn:

```jsx
const myPattern = {
  symbol: 'ETHUSDT Perp',
  patternType: 'Your Pattern Name',
  entry: 3500.00,
  stopLoss: 3450.00,
  takeProfit: [3550.00, 3600.00, 3650.00],
  confidence: 0.85,
  timestamp: new Date().toISOString(),
  direction: 'bullish',
};

// Thêm vào samplePatterns array
const samplePatterns = [
  myPattern,
  // ... other patterns
];
```

---

## 🎯 Test Single Pattern Card

Tạo file test riêng: `src/TestPattern.jsx`

```jsx
import React from 'react';
import PatternCard from './components/PatternCard';
import './components/PatternCard.css';

function TestPattern() {
  const testPattern = {
    symbol: 'BTCUSDT Perp',
    patternType: 'Head and Shoulders',
    entry: 110598.33,
    stopLoss: 110999.07,
    takeProfit: [110197.59, 109796.84, 109396.10],
    confidence: 0.90,
    timestamp: new Date().toISOString(),
    direction: 'bearish',
  };

  return (
    <div style={{ 
      padding: '40px',
      background: 'linear-gradient(180deg, #112250 0%, #2A1B52 100%)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ maxWidth: '450px', width: '100%' }}>
        <PatternCard pattern={testPattern} />
      </div>
    </div>
  );
}

export default TestPattern;
```

Thay đổi `main.jsx`:

```jsx
import TestPattern from './TestPattern'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TestPattern />
  </React.StrictMode>,
)
```

---

## 🔧 Troubleshooting

### ❌ **Error: Cannot find module 'framer-motion'**

```bash
npm install framer-motion
```

### ❌ **Styles không load**

Check import trong component:
```jsx
import './PatternCard.css';  // Đường dẫn đúng?
```

### ❌ **Fonts không hiện**

Check `index.html` đã có Google Fonts link chưa.

### ❌ **Animations không chạy**

1. Check console có errors không
2. Verify Framer Motion installed: `npm list framer-motion`
3. Check browser support (Chrome/Firefox/Safari latest)

---

## 📦 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy folder 'dist' lên server
```

---

## 🎨 Next Steps

1. **Integrate Real Data**
   - Connect Binance API
   - Real-time WebSocket
   - Pattern detection logic

2. **Add More Features**
   - Click to zoom chart
   - Pattern history
   - Export/Share functionality

3. **Optimize**
   - Lazy loading images
   - Virtual scrolling for many cards
   - Performance monitoring

---

## 📚 File Structure After Setup

```
gem-pattern-scanner/
├── node_modules/              ← npm install tạo
├── public/
├── src/
│   ├── components/
│   │   ├── PatternCard.jsx    ✅
│   │   └── PatternCard.css    ✅
│   ├── App.jsx                ✅
│   ├── App.css                ✅
│   └── main.jsx
├── index.html                 ✅ (updated)
├── package.json               ✅
├── vite.config.js
└── README.md                  ✅
```

---

## ✅ Verification Checklist

Sau khi setup, verify:

- [ ] `npm run dev` chạy không lỗi
- [ ] Browser mở được `localhost:5173`
- [ ] Thấy 6 pattern cards
- [ ] Hover vào card → particles bay lên
- [ ] Click copy button → hiện "Copied!"
- [ ] Card có glow effects
- [ ] Fonts hiển thị đúng (Montserrat, Noto Sans)
- [ ] Colors đúng Gem Holding brand

---

## 🎉 Done!

Giờ bạn đã có:
- ✅ Pattern Card component hoàn chỉnh
- ✅ Full animations (particles, glows, floats)
- ✅ Gem Holding brand colors
- ✅ Responsive design
- ✅ Copy functionality
- ✅ Demo với 6 sample patterns

**Happy coding! 💎**

---

## 🆘 Need Help?

1. Check `README.md` chi tiết
2. Review code comments
3. Test với sample data trong `App.jsx`
4. Check browser console for errors

**Support:** Check all files có syntax errors không bằng ESLint:
```bash
npm run lint
```
