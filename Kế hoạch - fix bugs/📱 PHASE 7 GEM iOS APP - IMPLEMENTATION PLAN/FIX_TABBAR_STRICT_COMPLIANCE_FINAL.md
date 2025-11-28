# 🔧 FIX TAB BAR - STRICT COMPLIANCE WITH APPROVED SPECS

## ⚠️ CRITICAL ENFORCEMENT RULES

```markdown
🚨 ABSOLUTE REQUIREMENTS - NO DEVIATIONS ALLOWED:

1. MUST use DESIGN_TOKENS.md as SINGLE SOURCE OF TRUTH
2. MUST use FINAL_NAVIGATION_STRUCTURE_6_TABS.md for navigation
3. MUST NOT modify any approved specifications
4. MUST NOT create random values
5. MUST NOT use different fonts, colors, or spacing
6. ALL values MUST come from design tokens
7. ANY deviation = REJECT and redo

These are PRODUCTION SPECIFICATIONS - NOT suggestions!
```

---

## 📋 PROMPT CHO CLAUDE CODE

```markdown
NHIỆM VỤ: Fix Tab Bar Navigation - STRICT COMPLIANCE

CRITICAL: This is NOT a creative task. You MUST follow existing specs EXACTLY.

═══════════════════════════════════════════════════════════
MANDATORY REFERENCE DOCUMENTS (READ FIRST!)
═══════════════════════════════════════════════════════════

**BEFORE writing ANY code, READ these files:**

1. **DESIGN_TOKENS.md** (SINGLE SOURCE OF TRUTH)
   Location: Look in project root or /mnt/project/DESIGN_TOKENS.md
   Contains: ALL spacing, colors, fonts, sizes
   Version: v3.0 (Production Ready)
   
2. **FINAL_NAVIGATION_STRUCTURE_6_TABS.md**
   Location: Look in project root or /mnt/project/
   Contains: Exact tab names, icons, routes

═══════════════════════════════════════════════════════════
STEP 1: READ DESIGN TOKENS (MANDATORY!)
═══════════════════════════════════════════════════════════

**Open and READ file:** `DESIGN_TOKENS.md`

**Find Section 4: COLORS and extract:**

```javascript
// Tab Bar Colors
const TAB_BAR_COLORS = {
  background: '#112250',           // Navy (primary brand)
  borderTop: '#FFBD59',            // Gold accent
  activeTint: '#FFBD59',           // Gold when selected
  inactiveTint: 'rgba(255,255,255,0.5)',  // Muted white
};
```

**Find Section 5: TYPOGRAPHY and extract:**

```javascript
// Tab Label Typography
const TAB_TYPOGRAPHY = {
  fontFamily: 'Montserrat',        // Primary UI font
  fontSize: 11,                    // Small size for 6 tabs
  fontWeight: '600',               // Semibold
};
```

**Find Section 2: SPACING and extract:**

```javascript
// Tab Bar Spacing
const TAB_SPACING = {
  height: 70,           // Total tab bar height
  paddingTop: 10,       // Top padding
  paddingBottom: 10,    // Bottom padding (safe area)
  borderWidth: 2,       // Top border width
};
```

**❌ DO NOT USE any values not in DESIGN_TOKENS.md**

═══════════════════════════════════════════════════════════
STEP 2: READ NAVIGATION STRUCTURE (MANDATORY!)
═══════════════════════════════════════════════════════════

**Open and READ file:** `FINAL_NAVIGATION_STRUCTURE_6_TABS.md`

**Extract EXACT tab configuration:**

```javascript
// CRITICAL: These are EXACT names - NO variations allowed!
const APPROVED_TABS = [
  {
    name: 'Home',
    title: 'Home',           // ✅ EXACT from spec
    icon: 'home',
    route: '/forum',
    screen: 'ForumScreen',
  },
  {
    name: 'Shop',
    title: 'Shop',           // ✅ EXACT from spec
    icon: 'shopping',
    route: '/shop',
    screen: 'ShopScreen',
  },
  {
    name: 'Trading',
    title: 'Giao Dịch',     // ✅ EXACT from spec (NOT "Scanner"!)
    icon: 'trending-up',
    route: '/scannerv2',
    screen: 'ScannerScreen',
  },
  {
    name: 'Gemral',
    title: 'Gemral',        // ✅ EXACT from spec (NOT "Chat"!)
    icon: 'robot',
    route: '/Gemral',
    screen: 'GemralScreen',
  },
  {
    name: 'Notifications',
    title: 'Thông Báo',     // ✅ EXACT from spec (NOT "Alerts"!)
    icon: 'bell',
    route: '/notifications',
    screen: 'NotificationsScreen',
  },
  {
    name: 'Account',
    title: 'Tài Sản',       // ✅ EXACT from spec (NOT "Account"!)
    icon: 'wallet',
    route: '/account',
    screen: 'AccountScreen',
  },
];
```

**🚨 CRITICAL - Tab Title Rules:**
- Tab 3: MUST be "Giao Dịch" (NOT "Scanner", NOT "Trading")
- Tab 4: MUST be "Gemral" (NOT "Chat", NOT "AI")
- Tab 5: MUST be "Thông Báo" (NOT "Alerts", NOT "Notifications")
- Tab 6: MUST be "Tài Sản" (NOT "Account", NOT "Profile")

═══════════════════════════════════════════════════════════
STEP 3: LOCATE NAVIGATOR FILE
═══════════════════════════════════════════════════════════

**Find the navigation file - common locations:**

```
Possible file paths:
1. src/navigation/MainNavigator.js
2. src/navigation/AppNavigator.js
3. src/navigation/TabNavigator.js
4. navigation/MainNavigator.js
5. App.js (if tabs defined inline)
```

**If file not found:**
- Search for "createBottomTabNavigator"
- Search for "Tab.Navigator"
- Search for "Tab.Screen"

═══════════════════════════════════════════════════════════
STEP 4: UPDATE CODE (USE EXACT VALUES!)
═══════════════════════════════════════════════════════════

**REPLACE the Tab.Navigator with:**

```javascript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import ForumScreen from '../screens/Forum/ForumScreen';
import ShopScreen from '../screens/Shop/ShopScreen';
import ScannerScreen from '../screens/Scanner/ScannerScreen';
import GemralScreen from '../screens/Gemral/GemralScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import AccountScreen from '../screens/Account/AccountScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          // ✅ All values from DESIGN_TOKENS.md
          backgroundColor: '#112250',           // Navy (DESIGN_TOKENS Section 4)
          borderTopColor: '#FFBD59',            // Gold (DESIGN_TOKENS Section 4)
          borderTopWidth: 2,                    // Border (DESIGN_TOKENS Section 2)
          height: 70,                           // Height (DESIGN_TOKENS Section 15)
          paddingBottom: 10,                    // Spacing (DESIGN_TOKENS Section 2)
          paddingTop: 10,                       // Spacing (DESIGN_TOKENS Section 2)
        },
        tabBarActiveTintColor: '#FFBD59',      // Gold (DESIGN_TOKENS Section 4)
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)', // Muted (DESIGN_TOKENS Section 4)
        tabBarLabelStyle: {
          fontSize: 11,                         // Font size (DESIGN_TOKENS Section 5)
          fontWeight: '600',                    // Font weight (DESIGN_TOKENS Section 5)
          fontFamily: 'Montserrat',             // Font family (DESIGN_TOKENS Section 5)
        },
      }}
    >
      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB 1: HOME                                              */}
      {/* Source: FINAL_NAVIGATION_STRUCTURE_6_TABS.md            */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Tab.Screen
        name="Home"
        component={ForumScreen}
        options={{
          title: 'Home',                    // ✅ EXACT from spec
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB 2: SHOP                                              */}
      {/* Source: FINAL_NAVIGATION_STRUCTURE_6_TABS.md            */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          title: 'Shop',                    // ✅ EXACT from spec
          tabBarIcon: ({ color, size }) => (
            <Icon name="shopping" size={size} color={color} />
          ),
        }}
      />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB 3: GIAO DỊCH                                         */}
      {/* CRITICAL: Must be "Giao Dịch" NOT "Scanner"!            */}
      {/* Source: FINAL_NAVIGATION_STRUCTURE_6_TABS.md            */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Tab.Screen
        name="Trading"
        component={ScannerScreen}
        options={{
          title: 'Giao Dịch',              // ✅ EXACT from spec (NOT "Scanner"!)
          tabBarIcon: ({ color, size }) => (
            <Icon name="trending-up" size={size} color={color} />
          ),
        }}
      />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB 4: Gemral                                           */}
      {/* CRITICAL: Must be "Gemral" NOT "Chat"!                 */}
      {/* Source: FINAL_NAVIGATION_STRUCTURE_6_TABS.md            */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Tab.Screen
        name="Gemral"
        component={GemralScreen}
        options={{
          title: 'Gemral',                // ✅ EXACT from spec (NOT "Chat"!)
          tabBarIcon: ({ color, size }) => (
            <Icon name="robot" size={size} color={color} />
          ),
        }}
      />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB 5: THÔNG BÁO                                         */}
      {/* CRITICAL: Must be "Thông Báo" NOT "Alerts"!             */}
      {/* Source: FINAL_NAVIGATION_STRUCTURE_6_TABS.md            */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Thông Báo',             // ✅ EXACT from spec (NOT "Alerts"!)
          tabBarIcon: ({ color, size }) => (
            <Icon name="bell" size={size} color={color} />
          ),
        }}
      />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB 6: TÀI SẢN                                           */}
      {/* CRITICAL: Must be "Tài Sản" NOT "Account"!              */}
      {/* Source: FINAL_NAVIGATION_STRUCTURE_6_TABS.md            */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: 'Tài Sản',               // ✅ EXACT from spec (NOT "Account"!)
          tabBarIcon: ({ color, size }) => (
            <Icon name="wallet" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
```

═══════════════════════════════════════════════════════════
STEP 5: VALIDATION CHECKLIST (MANDATORY!)
═══════════════════════════════════════════════════════════

**After making changes, YOU MUST verify ALL items:**

**✅ Tab Names (CRITICAL - No variations allowed!):**
- [ ] Tab 1 title: "Home" (exact match)
- [ ] Tab 2 title: "Shop" (exact match)
- [ ] Tab 3 title: "Giao Dịch" (NOT "Scanner", NOT "Trading")
- [ ] Tab 4 title: "Gemral" (NOT "Chat", NOT "AI")
- [ ] Tab 5 title: "Thông Báo" (NOT "Alerts", NOT "Notifications")
- [ ] Tab 6 title: "Tài Sản" (NOT "Account", NOT "Profile")

**✅ Colors (from DESIGN_TOKENS.md Section 4):**
- [ ] Background: '#112250' (navy - exact hex)
- [ ] Border top: '#FFBD59' (gold - exact hex)
- [ ] Active tint: '#FFBD59' (gold - exact hex)
- [ ] Inactive tint: 'rgba(255,255,255,0.5)' (exact rgba)

**✅ Typography (from DESIGN_TOKENS.md Section 5):**
- [ ] Font family: 'Montserrat' (exact name)
- [ ] Font size: 11 (exact number)
- [ ] Font weight: '600' (exact string)

**✅ Spacing (from DESIGN_TOKENS.md Section 2 & 15):**
- [ ] Height: 70 (exact number)
- [ ] Padding bottom: 10 (exact number)
- [ ] Padding top: 10 (exact number)
- [ ] Border width: 2 (exact number)

**✅ Icons:**
- [ ] All from MaterialCommunityIcons
- [ ] Icon names match spec
- [ ] Size and color passed correctly

**✅ Comments:**
- [ ] Source comments present
- [ ] Critical warnings included
- [ ] Values traced to specs

═══════════════════════════════════════════════════════════
COMPLIANCE RULES (ABSOLUTE!)
═══════════════════════════════════════════════════════════

**🚨 YOU MUST:**
1. ✅ Read DESIGN_TOKENS.md BEFORE coding
2. ✅ Read FINAL_NAVIGATION_STRUCTURE_6_TABS.md BEFORE coding
3. ✅ Use ONLY exact values from specs
4. ✅ Add source comments
5. ✅ Complete validation checklist
6. ✅ Report what was changed

**🚨 YOU MUST NOT:**
1. ❌ Create any new values
2. ❌ Modify approved specifications
3. ❌ Use "similar" or "close" values
4. ❌ Change tab names
5. ❌ Use different fonts/colors/spacing
6. ❌ Add features not in spec
7. ❌ Skip validation checklist

**🚨 IF YOU:**
- Cannot find DESIGN_TOKENS.md → STOP, report error
- Cannot find FINAL_NAVIGATION_STRUCTURE_6_TABS.md → STOP, report error
- Are unsure about any value → Use spec file, don't guess
- Want to improve something → DON'T, follow spec exactly

═══════════════════════════════════════════════════════════
REPORTING (REQUIRED!)
═══════════════════════════════════════════════════════════

**After completion, you MUST report:**

```markdown
✅ COMPLETED: Tab Bar Navigation Fix

Files Modified:
- [exact file path]

Tab Names Verified:
1. "Home" ✅
2. "Shop" ✅
3. "Giao Dịch" ✅ (was: "Scanner" ❌)
4. "Gemral" ✅ (was: "Chat" ❌)
5. "Thông Báo" ✅ (was: "Alerts" ❌)
6. "Tài Sản" ✅ (was: "Account" ❌)

Values Used (with sources):
- Navy: #112250 (DESIGN_TOKENS.md Section 4)
- Gold: #FFBD59 (DESIGN_TOKENS.md Section 4)
- Font: Montserrat/11px/600 (DESIGN_TOKENS.md Section 5)
- Height: 70px (DESIGN_TOKENS.md Section 15)

Validation Checklist: ✅ ALL ITEMS VERIFIED
Specs Followed: ✅ 100% COMPLIANCE
Ready for Testing: ✅ YES
```

═══════════════════════════════════════════════════════════

**EXECUTE TASK NOW**

Remember: 
- This is PRODUCTION code
- Specs are FINAL and APPROVED
- NO creativity or improvements allowed
- EXACT compliance required
- Validation checklist is MANDATORY
```

---

## 🎯 SUCCESS CRITERIA

```markdown
Tab names match spec: ✅ 100%
Colors from DESIGN_TOKENS.md: ✅ 100%
Fonts from DESIGN_TOKENS.md: ✅ 100%
Spacing from DESIGN_TOKENS.md: ✅ 100%
Icons correct: ✅ 100%
Comments added: ✅ YES
Validation complete: ✅ YES
Report provided: ✅ YES
```

---

**📄 FILE: FIX_TABBAR_STRICT_COMPLIANCE_FINAL.md**

**PASTE CHO CLAUDE CODE → GUARANTEED 100% COMPLIANCE! 🔒**
