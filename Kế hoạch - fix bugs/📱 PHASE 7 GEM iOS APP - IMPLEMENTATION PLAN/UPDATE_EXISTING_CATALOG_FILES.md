# 🔄 UPDATE EXISTING CATALOG FILES - PROMPT

**Tình huống:** Claude Code đã tạo xong component catalog  
**Cần fix:** Dark theme + Long/Short + Theme toggle clarification

---

## 📋 PROMPT GỬI CHO CLAUDE CODE

```markdown
NHIỆM VỤ: Update Component Catalog - Fix Theme & Add Features

CONTEXT:
Files catalog đã được tạo xong.
Cần update để fix một số issues:

1. ✅ Enforce DARK theme làm default cho TẤT CẢ
2. ✅ Add theme toggle (switches TOÀN BỘ app)
3. ✅ Add Long/Short indicator cho PatternCard
4. ✅ Fix any light theme references

═══════════════════════════════════════════════════════════
CRITICAL THEME CLARIFICATION
═══════════════════════════════════════════════════════════

**DARK THEME = DEFAULT (100% app):**
- Home tab: Dark ✅
- Shop tab: Dark ✅
- Scanner tab: Dark ✅
- Chatbot tab: Dark ✅
- Notifications tab: Dark ✅
- Account tab: Dark ✅

**LIGHT THEME = OPTIONAL TOGGLE (100% app):**
- Khi user bấm toggle button
- TẤT CẢ tabs đổi sang light cùng lúc
- Không có mixed themes (dark + light cùng lúc)

**WRONG ASSUMPTIONS TO FIX:**
❌ "Shop dùng light theme"
❌ "Forum dark, Shop light"
❌ "Different sections = different themes"

**CORRECT APPROACH:**
✅ Default: All dark
✅ Toggle: All light (when user clicks)
✅ Global theme state

═══════════════════════════════════════════════════════════
STEP 1: IDENTIFY FILES
═══════════════════════════════════════════════════════════

Liệt kê HTML files hiện có:

```bash
ls -la *.html
# hoặc
ls -la design-system/*.html
```

═══════════════════════════════════════════════════════════
STEP 2: UPDATE THEME TOGGLE BUTTON
═══════════════════════════════════════════════════════════

Trong CATALOG_INDEX.html hoặc file chính, add:

```html
<style>
.theme-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #9C0612, #6B0F1A);
    border: 1px solid #FFBD59;
    border-radius: 24px;
    color: white;
    cursor: pointer;
    z-index: 1000;
    font-weight: 600;
    font-size: 14px;
}

/* DARK THEME - DEFAULT */
body.dark-theme {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: white;
}

body.dark-theme .card {
    background: rgba(15, 16, 48, 0.55);
    backdrop-filter: blur(18px);
    border: 1px solid rgba(255, 189, 89, 0.2);
    color: white;
}

body.dark-theme .product-card,
body.dark-theme .post-card,
body.dark-theme .pattern-card {
    background: #112250;
    border: 1px solid rgba(255, 189, 89, 0.2);
    color: white;
}

/* LIGHT THEME - OPTIONAL */
body.light-theme {
    background: #F7F8FA;
    color: #111827;
}

body.light-theme .card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #111827;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

body.light-theme .product-card,
body.light-theme .post-card,
body.light-theme .pattern-card {
    background: #FFFFFF;
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #111827;
}

body.light-theme .theme-toggle {
    background: #000000;
    border: 1px solid #000000;
}
</style>

<body class="dark-theme">  <!-- DEFAULT = DARK -->
    
    <!-- Theme Toggle Button -->
    <button class="theme-toggle" onclick="toggleTheme()">
        🌓 <span id="theme-label">Switch to Light</span>
    </button>
    
    <!-- Rest of content -->
    
    <script>
        function toggleTheme() {
            const body = document.body
            const label = document.getElementById('theme-label')
            
            if (body.classList.contains('dark-theme')) {
                body.classList.remove('dark-theme')
                body.classList.add('light-theme')
                label.textContent = 'Switch to Dark'
                localStorage.setItem('theme', 'light')
            } else {
                body.classList.remove('light-theme')
                body.classList.add('dark-theme')
                label.textContent = 'Switch to Light'
                localStorage.setItem('theme', 'dark')
            }
        }
        
        // Load saved theme
        window.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('theme') || 'dark'
            if (savedTheme === 'light') {
                toggleTheme()
            }
        })
    </script>
</body>
```

═══════════════════════════════════════════════════════════
STEP 3: UPDATE PATTERNCARD - ADD LONG/SHORT
═══════════════════════════════════════════════════════════

Trong file có PatternCard (CATALOG_MOLECULES.html hoặc WIREFRAMES):

**Add CSS:**
```css
.direction-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.direction-badge.long {
    background: rgba(0, 255, 136, 0.2);
    border: 1px solid #00FF88;
    color: #00FF88;
}

.direction-badge.short {
    background: rgba(255, 68, 68, 0.2);
    border: 1px solid #FF4444;
    color: #FF4444;
}
```

**Update HTML:**

BEFORE:
```html
<div class="pattern-card">
    <div class="pattern-header">
        <div class="pattern-name">DPD Pattern</div>
        <div class="pattern-badge">🎯 TIER 1</div>
    </div>
</div>
```

AFTER:
```html
<div class="pattern-card">
    <div class="pattern-header" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
    ">
        <div class="pattern-name">DPD Pattern</div>
        
        <div style="display: flex; gap: 8px;">
            <!-- NEW: Direction Badge -->
            <div class="direction-badge long">
                <span>📈 LONG</span>
            </div>
            
            <!-- Tier Badge -->
            <div class="pattern-badge">🎯 TIER 1</div>
        </div>
    </div>
    
    <!-- Coin info -->
    <div class="pattern-coin">BTCUSDT • 4H</div>
    
    <!-- HFZ/LFZ -->
    <div style="font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 8px;">
        HFZ: $42,500
    </div>
    
    <!-- Chart -->
    <div class="pattern-chart">
        <div style="color: rgba(255,255,255,0.3);">
            [Chart Preview]
        </div>
    </div>
    
    <!-- Stats -->
    <div class="pattern-stats">
        <div class="stat-item">
            <div class="stat-value" style="color: #00FF88;">68%</div>
            <div class="stat-label">Win Rate</div>
        </div>
        <div class="stat-item">
            <div class="stat-value" style="color: #FFBD59;">1:3</div>
            <div class="stat-label">R:R</div>
        </div>
    </div>
</div>
```

**Create 2 variants:**
- PatternCard LONG (green badge)
- PatternCard SHORT (red badge)

**React Native code:**
```javascript
const PatternCard = ({ pattern, direction }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{pattern.name}</Text>
        
        <View style={styles.badges}>
          <View style={[
            styles.directionBadge,
            direction === 'LONG' ? styles.long : styles.short
          ]}>
            <Text style={[
              styles.badgeText,
              { color: direction === 'LONG' ? '#00FF88' : '#FF4444' }
            ]}>
              {direction === 'LONG' ? '📈 LONG' : '📉 SHORT'}
            </Text>
          </View>
          
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>🎯 {pattern.tier}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#112250',
    borderWidth: 1,
    borderColor: 'rgba(255,189,89,0.2)',
    borderRadius: 12,
    padding: 12
  },
  directionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1
  },
  long: {
    backgroundColor: 'rgba(0,255,136,0.2)',
    borderColor: '#00FF88'
  },
  short: {
    backgroundColor: 'rgba(255,68,68,0.2)',
    borderColor: '#FF4444'
  }
})
```

═══════════════════════════════════════════════════════════
STEP 4: REMOVE ANY LIGHT THEME DEFAULTS
═══════════════════════════════════════════════════════════

Search trong TẤT CẢ files và fix:

**FIND & REMOVE (as defaults):**
```css
/* Shop section - light theme */
.shop-section {
    background: #FFFFFF;  /* ❌ REMOVE */
}

/* Product cards - light */
.product-card {
    background: white;  /* ❌ REMOVE */
}
```

**REPLACE WITH (dark defaults):**
```css
/* Shop section - dark theme DEFAULT */
.shop-section {
    background: #05040B;
}

.product-card {
    background: #112250;
    border: 1px solid rgba(255,189,89,0.2);
}
```

**KEEP light theme only in .light-theme selector:**
```css
/* This is OK - for toggle */
body.light-theme .product-card {
    background: #FFFFFF;
    border: 1px solid rgba(0,0,0,0.1);
}
```

═══════════════════════════════════════════════════════════
STEP 5: VERIFY ALL SCREENS
═══════════════════════════════════════════════════════════

Check trong SCREEN_WIREFRAMES.html:

**TAB 2: SHOP screens:**
```html
<!-- Product Grid Screen -->
<div class="phone-screen">
    <div class="screen-header" style="background: #112250;">
        🛒 Shop
    </div>
    
    <div class="screen-content" style="background: #05040B;">
        <!-- Product cards - DARK -->
        <div style="display: grid; grid-template-columns: repeat(2,1fr); gap: 12px;">
            
            <div class="product-card" style="
                background: #112250;
                border: 1px solid rgba(255,189,89,0.2);
                border-radius: 12px;
                overflow: hidden;
            ">
                <!-- Image - burgundy gradient -->
                <div style="
                    height: 160px;
                    background: linear-gradient(135deg, #9C0612, #6B0F1A);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 48px;
                ">🔮</div>
                
                <!-- Info - dark -->
                <div style="padding: 12px;">
                    <div style="color: #FFFFFF; font-weight: 600;">
                        Thạch Anh Tím
                    </div>
                    <div style="color: #FFBD59; font-weight: 700; font-size: 16px;">
                        1.2M VND
                    </div>
                </div>
            </div>
            
            <!-- Repeat for more products -->
        </div>
    </div>
</div>
```

**TAB 3: SCANNER screens với Long/Short:**
```html
<!-- Scanner Pattern Card -->
<div class="pattern-card">
    <div class="pattern-header">
        <div>DPD Pattern</div>
        <div style="display: flex; gap: 8px;">
            <div class="direction-badge long">📈 LONG</div>
            <div class="pattern-badge">🎯 TIER 1</div>
        </div>
    </div>
    <!-- rest -->
</div>
```

═══════════════════════════════════════════════════════════
STEP 6: UPDATE DOCUMENTATION
═══════════════════════════════════════════════════════════

Thêm note trong file:

```html
<!--
GEM iOS COMPONENT CATALOG

THEME SYSTEM:
- Default: Dark theme (Liquid Glass)
- Optional: Light theme (Instagram-style)
- Toggle: Switches ENTIRE app
- No per-section themes

DARK THEME (Default):
- Background: #05040B, #112250
- Text: White variants
- Accents: #FFBD59, #9C0612

LIGHT THEME (Toggle):
- Background: #F7F8FA, #FFFFFF
- Text: #111827, #6B7280
- Accents: #000000, #9C0612

ALL tabs use same theme:
✅ Home, Shop, Scanner, Chatbot, Notifications, Account

User clicks toggle:
→ ALL tabs switch together
→ Preference saved to localStorage
→ Persists across sessions
-->
```

═══════════════════════════════════════════════════════════
STEP 7: TEST CHECKLIST
═══════════════════════════════════════════════════════════

Open HTML files in browser và verify:

**Default State:**
- [ ] Background is dark (#05040B/#112250) ✅
- [ ] All cards are dark ✅
- [ ] Text is white ✅
- [ ] Shop products are dark ✅
- [ ] Pattern cards have Long/Short badge ✅

**After Toggle:**
- [ ] Background becomes light (#F7F8FA) ✅
- [ ] All cards become light (#FFFFFF) ✅
- [ ] Text becomes dark (#111827) ✅
- [ ] Shop products are light ✅
- [ ] Pattern badges still visible ✅

**Toggle Again:**
- [ ] Returns to dark theme ✅
- [ ] Preference saved ✅

**Pattern Cards:**
- [ ] LONG badge is green 📈 ✅
- [ ] SHORT badge is red 📉 ✅
- [ ] Positioned correctly (top-right) ✅

═══════════════════════════════════════════════════════════
DELIVERABLE
═══════════════════════════════════════════════════════════

After update:

```
Updated Files:
├── CATALOG_INDEX.html (theme toggle added)
├── CATALOG_MOLECULES.html (dark default, Long/Short)
├── CATALOG_ORGANISMS.html (dark default)
├── SCREEN_WIREFRAMES.html (all dark, Long/Short)
└── [any other HTML files]

Changes:
✅ Dark theme = default for ALL
✅ Light theme = toggle for ALL
✅ Theme toggle button added
✅ Long/Short badges on pattern cards
✅ No mixed themes
✅ Shop is dark by default
✅ All documentation updated
```

═══════════════════════════════════════════════════════════

BẮT ĐẦU UPDATE VÀ BÁO CÁO KẾT QUẢ!
```

---

## ✅ KEY POINTS

1. **Default = Dark (100% app)**
2. **Toggle = Switches entire app**
3. **No per-section themes**
4. **Shop is dark by default**
5. **Light theme only when toggled**
6. **Long/Short on pattern cards**

---

**📋 PASTE PROMPT NÀY CHO CLAUDE CODE ĐỂ UPDATE! 🔄**
