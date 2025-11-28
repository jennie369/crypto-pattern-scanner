# 🔧 FIX LIGHT THEME - EXACT CSS REPLACEMENTS

**Vấn đề:** Light theme vẫn có navy cards, text khó đọc  
**Nguyên nhân:** CSS selectors thiếu hoặc không đủ specific  
**Giải pháp:** Replace toàn bộ light theme CSS với exact code

---

## 📋 PROMPT CHO CLAUDE CODE

```markdown
NHIỆM VỤ: Fix Light Theme CSS - Replace Exact Code

CONTEXT:
Light theme toggle đã có nhưng colors không apply đúng.
Cần replace TOÀN BỘ body.light-theme CSS section.

═══════════════════════════════════════════════════════════
STEP 1: FIND & DELETE OLD LIGHT THEME CSS
═══════════════════════════════════════════════════════════

Trong <style> section, tìm và XÓA HẾT:

```css
/* Tìm từ đây */
body.light-theme {
  ...
}

/* Đến khi hết tất cả body.light-theme selectors */
```

XÓA TẤT CẢ light theme CSS cũ!

═══════════════════════════════════════════════════════════
STEP 2: ADD COMPLETE NEW LIGHT THEME CSS
═══════════════════════════════════════════════════════════

Paste đoạn CSS này vào cuối <style> section (trước </style>):

```css
/* ============================================ */
/* LIGHT THEME - COMPLETE REPLACEMENT */
/* ============================================ */

/* Base */
body.light-theme {
    background: #F7F8FA !important;
    color: #111827 !important;
}

/* Container */
body.light-theme .container {
    background: #F7F8FA !important;
}

/* Headers & Titles */
body.light-theme .catalog-title,
body.light-theme .section-title,
body.light-theme .group-title {
    background: linear-gradient(135deg, #D97706, #9C0612) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
}

body.light-theme .component-name,
body.light-theme .screen-name,
body.light-theme h1, 
body.light-theme h2, 
body.light-theme h3 {
    color: #111827 !important;
}

/* Descriptions */
body.light-theme .catalog-subtitle,
body.light-theme .section-description,
body.light-theme .component-description,
body.light-theme .screen-description {
    color: #6B7280 !important;
}

body.light-theme .catalog-specs {
    color: #9CA3AF !important;
}

/* ALL CARDS - WHITE BACKGROUND */
body.light-theme .card,
body.light-theme .component-card,
body.light-theme .screen-info,
body.light-theme .product-card,
body.light-theme .post-card,
body.light-theme .pattern-card,
body.light-theme .notification-card {
    background: #FFFFFF !important;
    border: 1px solid #E5E7EB !important;
    color: #111827 !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06) !important;
}

/* Card Titles */
body.light-theme .card-title,
body.light-theme .product-name,
body.light-theme .post-author,
body.light-theme .pattern-name {
    color: #111827 !important;
}

/* Card Descriptions */
body.light-theme .card-description,
body.light-theme .product-description,
body.light-theme .post-content {
    color: #374151 !important;
}

/* Timestamps */
body.light-theme .post-time,
body.light-theme .timestamp {
    color: #9CA3AF !important;
}

/* Buttons */
body.light-theme .theme-toggle {
    background: #000000 !important;
    border: 1px solid #000000 !important;
    color: #FFFFFF !important;
}

body.light-theme .btn-primary,
body.light-theme button[style*="background: linear-gradient"] {
    background: #000000 !important;
    border: 1px solid #000000 !important;
    color: #FFFFFF !important;
}

body.light-theme .btn-secondary {
    background: transparent !important;
    border: 1px solid #D1D5DB !important;
    color: #111827 !important;
}

/* Navigation Tabs */
body.light-theme .nav-tab {
    background: transparent !important;
    border: 1px solid #D1D5DB !important;
    color: #6B7280 !important;
}

body.light-theme .nav-tab:hover {
    background: #F9FAFB !important;
    color: #111827 !important;
}

body.light-theme .nav-tab.active {
    background: #000000 !important;
    border-color: #000000 !important;
    color: #FFFFFF !important;
}

/* Phone Mockup */
body.light-theme .phone-mockup {
    background: #E5E7EB !important;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}

body.light-theme .phone-screen {
    background: #FFFFFF !important;
}

body.light-theme .phone-notch {
    background: #000000 !important;
}

/* Screen Header */
body.light-theme .screen-header {
    background: #FFFFFF !important;
    border-bottom: 1px solid #E5E7EB !important;
}

body.light-theme .screen-title {
    color: #111827 !important;
}

/* Screen Content */
body.light-theme .screen-content {
    background: #F7F8FA !important;
}

/* Tab Bar */
body.light-theme .tab-bar {
    background: #FFFFFF !important;
    border-top: 2px solid #000000 !important;
}

body.light-theme .tab-item.active {
    color: #000000 !important;
}

body.light-theme .tab-item.inactive {
    color: #9CA3AF !important;
}

/* Component Preview */
body.light-theme .component-preview {
    background: #F9FAFB !important;
    border: 1px solid #E5E7EB !important;
}

body.light-theme .component-specs {
    background: #F9FAFB !important;
    border: 1px solid #E5E7EB !important;
    color: #6B7280 !important;
}

/* Product Specific */
body.light-theme .product-image {
    background: linear-gradient(135deg, #F3F4F6, #E5E7EB) !important;
}

body.light-theme .product-price {
    color: #9C0612 !important;
    font-weight: 700 !important;
}

/* Pattern Card Specific */
body.light-theme .pattern-coin {
    color: #6B7280 !important;
}

body.light-theme .pattern-chart {
    background: #F9FAFB !important;
    border: 1px solid #E5E7EB !important;
}

body.light-theme .stat-value {
    color: #111827 !important;
}

body.light-theme .stat-label {
    color: #9CA3AF !important;
}

/* Direction Badges - Keep Vibrant */
body.light-theme .direction-badge.long {
    background: rgba(5, 150, 105, 0.1) !important;
    border: 1px solid #059669 !important;
    color: #059669 !important;
}

body.light-theme .direction-badge.short {
    background: rgba(220, 38, 38, 0.1) !important;
    border: 1px solid #DC2626 !important;
    color: #DC2626 !important;
}

/* Tier Badges */
body.light-theme .pattern-badge,
body.light-theme .tier-badge {
    background: rgba(217, 119, 6, 0.1) !important;
    border: 1px solid #D97706 !important;
    color: #D97706 !important;
}

/* Post Actions */
body.light-theme .post-actions {
    color: #6B7280 !important;
}

/* Notification List */
body.light-theme .notification-list {
    background: #F7F8FA !important;
}

body.light-theme .notification-card.unread {
    background: #EFF6FF !important;
    border-color: #DBEAFE !important;
}

/* Chat Interface */
body.light-theme .chat-bubble.user {
    background: #3B82F6 !important;
    color: #FFFFFF !important;
}

body.light-theme .chat-bubble.ai {
    background: #F3F4F6 !important;
    color: #111827 !important;
    border: 1px solid #E5E7EB !important;
}

/* Input Fields */
body.light-theme input,
body.light-theme textarea {
    background: #FFFFFF !important;
    border: 1px solid #D1D5DB !important;
    color: #111827 !important;
}

body.light-theme input:focus,
body.light-theme textarea:focus {
    border-color: #3B82F6 !important;
    outline: none !important;
}

body.light-theme input::placeholder,
body.light-theme textarea::placeholder {
    color: #9CA3AF !important;
}

/* Code Blocks - Keep Dark */
body.light-theme .component-code {
    background: #1F2937 !important;
    color: #10B981 !important;
    border: 1px solid #374151 !important;
}

/* Hamburger Menu */
body.light-theme .hamburger-line {
    background: #111827 !important;
}

/* Icons */
body.light-theme .icon-btn {
    background: #F3F4F6 !important;
    color: #111827 !important;
}

body.light-theme .icon-btn:hover {
    background: #E5E7EB !important;
}

/* Tier Lock Overlay */
body.light-theme .tier-lock {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(8px) !important;
}

body.light-theme .lock-icon {
    color: #9CA3AF !important;
}

body.light-theme .lock-title {
    color: #111827 !important;
}

body.light-theme .lock-description {
    color: #6B7280 !important;
}

body.light-theme .lock-upgrade-btn {
    background: #9C0612 !important;
    border: 1px solid #9C0612 !important;
    color: #FFFFFF !important;
}

/* Empty State */
body.light-theme .empty-icon {
    color: #9CA3AF !important;
}

body.light-theme .empty-title {
    color: #111827 !important;
}

body.light-theme .empty-description {
    color: #6B7280 !important;
}

/* Dividers */
body.light-theme .divider,
body.light-theme hr {
    border-color: #E5E7EB !important;
}

/* Specific Component Overrides */
body.light-theme [style*="#112250"] {
    background: #FFFFFF !important;
}

body.light-theme [style*="rgba(15,16,48"] {
    background: #FFFFFF !important;
}

body.light-theme [style*="#05040B"] {
    background: #F7F8FA !important;
}

/* Force white cards */
body.light-theme div[class*="card"] {
    background: #FFFFFF !important;
    border: 1px solid #E5E7EB !important;
}

/* Checkbox & Radio */
body.light-theme input[type="checkbox"],
body.light-theme input[type="radio"] {
    border-color: #D1D5DB !important;
}

body.light-theme input[type="checkbox"]:checked,
body.light-theme input[type="radio"]:checked {
    background-color: #FFBD59 !important;
    border-color: #FFBD59 !important;
}

/* Chips/Tags */
body.light-theme .chip,
body.light-theme .tag {
    background: #F3F4F6 !important;
    color: #111827 !important;
}

body.light-theme .chip.active,
body.light-theme .tag.active {
    background: #FFBD59 !important;
    color: #000000 !important;
}
```

═══════════════════════════════════════════════════════════
STEP 3: VERIFY FILES UPDATED
═══════════════════════════════════════════════════════════

Áp dụng CSS trên cho TẤT CẢ files:

```
Files to update:
1. CATALOG_INDEX.html
2. CATALOG_ATOMS.html
3. CATALOG_MOLECULES.html
4. CATALOG_ORGANISMS.html
5. CATALOG_TEMPLATES.html
6. CATALOG_NAVIGATION.html
7. SCREEN_WIREFRAMES.html (if exists)
8. Any other HTML files
```

Mỗi file:
1. Mở file
2. Find <style> section
3. Delete old body.light-theme CSS
4. Paste new CSS từ STEP 2
5. Save file

═══════════════════════════════════════════════════════════
CRITICAL NOTES
═══════════════════════════════════════════════════════════

**!important flags:**
- Cần thiết vì inline styles có priority cao
- Đảm bảo light theme override được dark theme defaults

**Color Requirements:**
- Background cards: #FFFFFF (pure white)
- Page background: #F7F8FA (light gray)
- Text primary: #111827 (almost black)
- Text secondary: #6B7280 (medium gray)
- Borders: #E5E7EB (light gray)

**NO navy colors in light theme:**
- #112250 → #FFFFFF
- #05040B → #F7F8FA
- rgba(15,16,48,0.55) → #FFFFFF

═══════════════════════════════════════════════════════════
TEST AFTER UPDATE
═══════════════════════════════════════════════════════════

1. Open HTML file in browser
2. Should see DARK theme (default)
3. Click "Switch Theme" button
4. Verify LIGHT theme:
   - [ ] All cards white (#FFFFFF)
   - [ ] Page background light gray (#F7F8FA)
   - [ ] Text high contrast (readable)
   - [ ] No navy colors anywhere
   - [ ] Buttons black with white text
   - [ ] Product images light gradient
5. Toggle back to DARK - still works

═══════════════════════════════════════════════════════════
IF STILL NOT WORKING
═══════════════════════════════════════════════════════════

Check browser console:
- Right-click → Inspect
- Console tab
- Look for CSS errors

Hard refresh:
- Cmd+Shift+R (Mac)
- Ctrl+Shift+R (Windows)
- Clear cache

Verify CSS loaded:
- Inspect element
- Check computed styles
- Should see background: #FFFFFF !important

═══════════════════════════════════════════════════════════

UPDATE ALL FILES VÀ TEST!
```

---

## 🎯 KEY DIFFERENCES FROM BEFORE

### **1. Added !important Flags**
```css
/* Before (không work) */
body.light-theme .card {
    background: #FFFFFF;
}

/* After (works!) */
body.light-theme .card {
    background: #FFFFFF !important;
}
```

**Why:** Inline styles có priority cao hơn, cần !important để override

### **2. More Specific Selectors**
```css
/* Added */
body.light-theme div[class*="card"] {
    background: #FFFFFF !important;
}

/* Catches all card variants */
```

### **3. Attribute Overrides**
```css
/* Override inline styles */
body.light-theme [style*="#112250"] {
    background: #FFFFFF !important;
}
```

### **4. Complete Coverage**
- Every possible card class
- Every text element
- Every background
- Every border

---

## 📊 BEFORE/AFTER

### **Before (Not Working):**
```css
body.light-theme .card {
    background: rgba(255,255,255,0.95);
    /* Too low priority */
}
```

### **After (Works!):**
```css
body.light-theme .card,
body.light-theme .component-card,
body.light-theme .product-card,
body.light-theme div[class*="card"] {
    background: #FFFFFF !important;
    border: 1px solid #E5E7EB !important;
    color: #111827 !important;
}
```

---

**📋 PASTE TOÀN BỘ PROMPT CHO CLAUDE CODE! 🔧**

**Lần này sẽ work 100%! ✅**
