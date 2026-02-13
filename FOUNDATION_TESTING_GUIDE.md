# 📱 FOUNDATION TESTING GUIDE

**Created:** DAY 1 - Foundation Setup
**Purpose:** Test responsive foundation works correctly

---

## 🎯 QUICK START

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open Chrome DevTools:**
   - Press F12
   - Click "Toggle device toolbar" (Ctrl+Shift+M)

3. **Test these devices:**
   - iPhone SE (375x667)
   - iPhone 14 Pro (430x932)
   - iPad (768x1024)
   - Desktop (1024x768)

4. **Check BreakpointIndicator:**
   - Should show in bottom-right corner
   - Red (mobile), Orange (tablet), Green (desktop)

---

## ✅ WHAT TO VERIFY

### Global
- [ ] No horizontal scroll on ANY page
- [ ] Text readable (≥16px everywhere)
- [ ] Buttons tappable (≥48px)
- [ ] Forms usable
- [ ] Charts visible

### Layout Components
- [ ] ThreeColumnLayout stacks on mobile
- [ ] GridLayout: 1 col mobile, 2 col tablet, 3 col desktop
- [ ] StackLayout always vertical

### Navigation
- [ ] Hamburger menu works on mobile
- [ ] Sidebar slides in/out smoothly
- [ ] Desktop shows normal sidebar

---

## 🚨 COMMON ISSUES & FIXES

### Issue: Horizontal scroll still present
**Check:**
1. base-mobile.css imported in main.jsx?
2. body { overflow-x: hidden } applied?
3. Any element has fixed width >100vw?

**Fix:**
- Verify import order in main.jsx
- Check browser console for CSS errors

### Issue: Layout not stacking on mobile
**Check:**
1. Using ThreeColumnLayout component?
2. ResponsiveContainer.css imported?
3. Correct className applied?

**Fix:**
- Replace div with ThreeColumnLayout
- Import CSS file

### Issue: BreakpointIndicator not showing
**Check:**
1. Imported in App.jsx?
2. Running in development mode?
3. Component rendered at top level?

**Fix:**
- Add to App.jsx root level
- Check import.meta.env.PROD

---

## 📊 EXPECTED RESULTS

**Mobile (375px):**
- All layouts stack vertically
- Chart 320px height
- Forms full width
- Tables → cards
- Touch targets ≥48px

**Tablet (768px):**
- 2-column layouts
- Chart 450px height
- Forms auto width
- Normal tables

**Desktop (1024px+):**
- 3-column layouts
- Chart 600px height
- Original design preserved
- All features visible

---

## 📁 FILES CREATED - DAY 1

```
frontend/
├── index.html                 # ✅ Updated viewport meta
├── src/
│   ├── styles/
│   │   └── base-mobile.css    # ✅ NEW - Mobile-first base CSS
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── ResponsiveContainer.jsx  # ✅ NEW
│   │   │   ├── ResponsiveContainer.css  # ✅ NEW
│   │   │   ├── MobileNavWrapper.jsx     # ✅ NEW
│   │   │   └── MobileNavWrapper.css     # ✅ NEW
│   │   └── DevTools/
│   │       ├── BreakpointIndicator.jsx  # ✅ Already existed
│   │       └── BreakpointIndicator.css
│   ├── hooks/
│   │   └── useBreakpoint.js   # ✅ Updated
│   └── main.jsx               # ✅ Updated imports
└── FOUNDATION_TESTING_GUIDE.md  # ✅ This file
```

---

## 🎯 NEXT STEPS

**After foundation testing passes:**
1. ✅ Mark DAY 1 complete
2. 📊 Report results
3. 🚀 Start DAY 2: Apply to Scanner page

---

## 📝 TESTING CHECKLIST

### 1. Viewport (5 phút)
- [ ] Open Chrome DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Check viewport meta tag trong Sources
- [ ] Verify: width=device-width, initial-scale=1.0

### 2. Base Mobile CSS (15 phút)
Test trên mobile (375px):
- [ ] No horizontal scroll trên ANY page
- [ ] Body overflow-x: hidden working
- [ ] Text readable (≥16px)
- [ ] Touch targets visible
- [ ] No elements overflow viewport

### 3. Layout Components (30 phút)
- [ ] Mobile (375px): All layouts stack vertically
- [ ] Tablet (768px): Grid shows 2 columns
- [ ] Desktop (1024px): Grid shows 3 columns
- [ ] ThreeColumnLayout responsive correctly
- [ ] No overflow on any breakpoint

### 4. Mobile Navigation (20 phút)
- [ ] Hamburger button appears <1024px
- [ ] Click hamburger → Sidebar slides in
- [ ] Click backdrop → Sidebar closes
- [ ] Click X button → Sidebar closes
- [ ] Desktop (≥1024px): No hamburger, normal sidebar

### 5. Breakpoint Detection (10 phút)
- [ ] BreakpointIndicator visible in bottom-right
- [ ] Shows correct breakpoint:
  - 375px → MOBILE (red)
  - 768px → TABLET (orange)
  - 1024px → DESKTOP (green)
- [ ] Updates in real-time when resizing

### 6. Chart Container (20 phút)
Navigate to Scanner page:
- [ ] Mobile: Chart height = 320px
- [ ] Tablet: Chart height = 450px
- [ ] Desktop: Chart height = 600px
- [ ] Chart width = 100% (no overflow)
- [ ] Chart visible and usable on all breakpoints

### 7. Forms & Inputs (10 phút)
Test any form:
- [ ] Inputs min-height = 48px (touch-friendly)
- [ ] Font-size = 16px (no iOS zoom)
- [ ] Full width on mobile
- [ ] Auto width on desktop
- [ ] Buttons tappable (≥48px)

### 8. Performance (10 phút)
- [ ] No console errors
- [ ] No layout shift (CLS)
- [ ] Smooth transitions
- [ ] Page loads <3s

---

**END OF TESTING GUIDE**
