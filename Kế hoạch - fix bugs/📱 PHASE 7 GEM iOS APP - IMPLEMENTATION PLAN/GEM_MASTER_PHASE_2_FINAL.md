# 🚀 Gemral MOBILE - PHASE 2: ADVANCED FEATURES (FINAL)

**Project:** Gemral Tab - AI Chat to Interactive Dashboard  
**Timeline:** 14 ngày (7-10 giờ/ngày)  
**Priority:** HIGH - Game-changing features  
**Dependencies:** Phase 1 (Day 1-10) hoàn thành  
**Status:** ✅ FINAL - Ready for implementation  
**Version:** 3.0 - Account Tab Integration

---

## 📋 OVERVIEW

### **Vấn Đề Cũ:**
```
❌ User hỏi AI → AI trả lời text → User đọc xong → QUÊN MẤT!

Problems:
• Không track được progress
• Không có reminders
• Phải manual note lại
• Dễ bỏ qua commitment
• AI response chỉ là text đơn thuần
```

### **Giải Pháp Mới:**
```
✅ User hỏi AI → AI generate plan → "Add to Dashboard?" → 
   WIDGETS xuất hiện trong TAB TÀI SẢN!

Benefits:
• ✅ Auto tracking progress
• ✅ Daily reminders tự động
• ✅ Visual progress bars
• ✅ Actionable interactive cards
• ✅ Never forget goals
• ✅ Integrated vào existing Account screen
```

### **Magic Flow:**
```
AI Chat Response
      ↓
User clicks "Add to Dashboard"
      ↓
✨ MAGIC: Widgets xuất hiện trong TAB TÀI SẢN!
      ↓
AccountScreen → Dashboard section:
- Goal tracking card (progress bar)
- Affirmation widget (daily)
- Action checklist (interactive)
- Stats widget (real-time)
      ↓
User engage daily với dashboard trong Account tab
```

---

## 🎯 PHASE 2 FEATURES

### **Feature 1: 🎤 Voice Input**

**Description:** User nói câu hỏi thay vì gõ

**Key Points:**
- Mic button trong ChatInput
- Vietnamese speech recognition
- Auto-send sau khi nói xong
- Visual feedback khi recording

**Monetization:**
- FREE: 3 voice inputs/day
- TIER1+: Unlimited

**Impact:** +40% engagement, 8-12% conversion

**Timeline:** Day 11-12 (8h)

---

### **Feature 2: 📸 Export to Image**

**Description:** Export reading/response thành beautiful image để share social

**Key Points:**
- 3 templates: Reading Card, Chat Wisdom, Trading Signal
- High resolution (1080x1920)
- Brand colors + logo watermark
- Share directly to social media

**Monetization:**
- FREE: Basic template + watermark
- TIER1: Premium templates
- TIER2+: Remove watermark

**Impact:** +60% social sharing, 5-8% conversion

**Timeline:** Day 13-14 (8h)

---

### **Feature 3: 📊 AI CHAT → DASHBOARD WIDGETS IN ACCOUNT TAB**

**Description:** AI tự động detect response type → Suggest create widgets → User click "Add to Dashboard" → Widgets xuất hiện trong **Tab Tài Sản (AccountScreen.js)**

**🆕 CRITICAL: Widgets integrate vào AccountScreen.js có sẵn, KHÔNG tạo DashboardScreen riêng!**

#### **3.1 Account Tab Integration**

**Current AccountScreen Structure:**
```
AccountScreen.js (src/screens/tabs/)
├─ 1. Profile Header (Avatar, name, username, bio)
├─ 2. Stats Row (Posts, Followers, Following)
├─ 3. Đơn Hàng Của Tôi (Orders)
├─ 4. Chương Trình Affiliate
├─ 5. Tài Sản (Portfolio & Paper Trade)
├─ 6. Tài Khoản (Settings)
└─ 7. Khác (Help, Terms, Logout)
```

**NEW AccountScreen Structure (With Dashboard Widgets):**
```
AccountScreen.js (src/screens/tabs/)
├─ 1. Profile Header (Avatar, name, username, bio)
├─ 2. 📊 DASHBOARD WIDGETS ✨ [NEW SECTION]
│   ├─ Goal Tracking Cards (1-10 based on tier)
│   ├─ Daily Affirmation Card
│   ├─ Action Checklist Cards
│   └─ Stats Widget
├─ 3. Stats Row (Posts, Followers, Following)
├─ 4. Đơn Hàng Của Tôi (Orders)
├─ 5. Chương Trình Affiliate
├─ 6. Tài Sản (Portfolio & Paper Trade)
├─ 7. Tài Khoản (Settings)
└─ 8. Khác (Help, Terms, Logout)
```

**Visual Layout:**
```
┌────────────────────────────────────────┐
│ Tab: Tài Sản                       ⚙️  │
├────────────────────────────────────────┤
│ 👤 Profile Header                      │
│ Avatar | Name | Username | Bio         │
├────────────────────────────────────────┤
│ 📊 Dashboard - Goals & Actions     ▼   │ ← NEW!
├────────────────────────────────────────┤
│ ┌──────────────────────────────────┐  │
│ │ 💰 Thu nhập thụ động 100M       │  │
│ │ ████░░░░░░░░░░ 40%              │  │
│ │ 92 days left                     │  │
│ │ [Update] [Details]               │  │
│ └──────────────────────────────────┘  │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ ✨ Today's Affirmation           │  │
│ │ "Tiền bạc đến với tôi dễ dàng..." │  │
│ │ [🔊 Read] [✓ Done]              │  │
│ │ 🔥 7-day streak                  │  │
│ └──────────────────────────────────┘  │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ 📋 30-Day Action Plan            │  │
│ │ ☑ Research income streams        │  │
│ │ ☐ Analyze pros/cons              │  │
│ │ ☐ Choose best fit                │  │
│ │ Progress: 1/5                    │  │
│ └──────────────────────────────────┘  │
│                                        │
│ [+ Thêm Mục Tiêu Mới]                 │
├────────────────────────────────────────┤
│ 📊 Stats Row                           │
│ 42 Posts | 156 Followers | 89 Following│
├────────────────────────────────────────┤
│ 📦 Đơn Hàng Của Tôi                    │
│ ...                                    │
└────────────────────────────────────────┘
```

**Collapsible Behavior:**
```
Default State:
- Expanded if 1-3 widgets (show immediately)
- Collapsed if 4+ widgets (save space)
- Remember user preference (AsyncStorage)
- Tap header to toggle expand/collapse
```

#### **3.2 User Flow: Create Widget from Chat**

```
STEP 1: User Chat 💬
Location: GemMaster tab
User: "Tôi muốn manifest 100M trong 6 tháng"
      ↓

STEP 2: AI Response 🤖
AI detects: MANIFESTATION_GOAL (confidence: 0.95)
AI: "Perfect! 💰 Plan created:
     • 5 affirmations
     • Crystal recommendations
     • 30-day action plan
     
     ✨ Add to Dashboard trong Tab Tài Sản?
     [Preview] [Yes, Add!] [No]"
      ↓

STEP 3: User Clicks "Yes, Add!" ✨
AI: "✅ Done! Created in your Account:
     📊 Goal tracking card
     ✨ Daily affirmations widget
     📋 Action checklist
     🔔 Auto reminders (3x/day)
     
     [View in Account Tab →]"
      ↓

STEP 4: Navigate to Account Tab 📊
User taps "View in Account Tab →"
OR manually navigate to Tài Sản tab
      ↓
See Dashboard section với widgets mới
      ↓

STEP 5: Daily Engagement 🔥
User receives notifications
Tap notification → Deep link to Account tab
Update progress, check tasks, read affirmations
```

#### **3.3 Smart AI Response Detection**

**AI tự động detect response type:**

```javascript
const RESPONSE_TYPES = {
  MANIFESTATION_GOAL: {
    triggers: ['manifest', 'goal', 'achieve', 'target', 'thu nhập', 'giàu có'],
    hasFields: ['target_amount', 'timeline', 'affirmations', 'action_plan'],
    widgetTypes: ['GOAL_CARD', 'AFFIRMATION_CARD', 'ACTION_CHECKLIST'],
    confidence: 0.95,
    suggestDashboard: true
  },
  
  CRYSTAL_HEALING: {
    triggers: ['crystal', 'stress', 'anxiety', 'chakra', 'năng lượng', 'thạch anh'],
    hasFields: ['crystal_names', 'placement', 'usage_guide', 'chakra_alignment'],
    widgetTypes: ['CRYSTAL_GRID', 'USAGE_GUIDE'],
    confidence: 0.92,
    suggestDashboard: true
  },
  
  TRADING_ANALYSIS: {
    triggers: ['btc', 'trade', 'loss', 'pattern', 'win rate', 'strategy'],
    hasFields: ['mistakes', 'spiritual_insight', 'action_plan', 'patterns'],
    widgetTypes: ['CROSS_DOMAIN_CARD', 'TRADING_CHECKLIST'],
    confidence: 0.88,
    suggestDashboard: true
  },
  
  GENERAL_ADVICE: {
    triggers: ['how', 'what', 'explain', 'why', 'tell me'],
    hasFields: null,
    widgetTypes: null,
    confidence: 0.85,
    suggestDashboard: false // No widget needed
  }
};

// Example: AI response với metadata
{
  text: "Perfect! 💰 Manifestation plan created...",
  metadata: {
    responseType: 'MANIFESTATION_GOAL',
    confidence: 0.95,
    extractedData: {
      goalTitle: "Thu nhập thụ động 100M",
      targetAmount: 100000000,
      timeline: "6 months",
      affirmations: [
        "Tiền bạc đến với tôi dễ dàng qua passive income",
        "Tôi xứng đáng với thu nhập thụ động dồi dào",
        // ...
      ],
      actionSteps: [
        "Research 3 passive income streams",
        "Analyze pros/cons each stream",
        // ...
      ],
      crystalRecommendations: ['Citrine', 'Pyrite', 'Green Aventurine']
    },
    suggestedWidgets: ['GOAL_CARD', 'AFFIRMATION_CARD', 'ACTION_CHECKLIST'],
    accountTabIntegration: true // ← NEW FLAG
  }
}
```

**Visual Indicator trong Chat:**
```
┌──────────────────────────────────────┐
│ 🤖 GEM AI                            │
├──────────────────────────────────────┤
│ Perfect! 💰 Manifestation plan:      │
│ • 5 affirmations                     │
│ • Crystal recommendations            │
│ • 30-day action plan                 │
│                                      │
│ ┌────────────────────────────────┐ │
│ │ ✨ Add to Account Dashboard?   │ │
│ │                                 │ │
│ │ Tạo trong Tab Tài Sản:         │ │
│ │ • Goal tracking card            │ │
│ │ • Daily affirmations            │ │
│ │ • Action checklist              │ │
│ │ • Auto reminders (3x/day)       │ │
│ │                                 │ │
│ │ [Preview] [Yes, Add!] [No]     │ │
│ └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

#### **3.4 Widget Types**

**A. Goal Tracking Card**
```
┌──────────────────────────────────┐
│ 💰 Thu nhập thụ động 100M   ⋯   │
├──────────────────────────────────┤
│ 📅 Target: 15/05/2026 (178 days)│
│                                  │
│ ████░░░░░░░░░░░░░░ 0%           │
│ 0 VND / 100,000,000 VND          │
│                                  │
│ [Update Progress] [Details]      │
│                                  │
│ 🔔 Daily reminders: ON           │
│ ⏰ Next: 8:00 AM                 │
└──────────────────────────────────┘
```

**Interactive Features:**
- Progress bar (tap to update)
- Days left countdown
- Quick action buttons
- Notification toggle
- Streak counter 🔥

**B. Daily Affirmation Card**
```
┌──────────────────────────────────┐
│ ✨ Today's Affirmation           │
├──────────────────────────────────┤
│                                  │
│ "Tiền bạc đến với tôi dễ dàng   │
│  qua passive income"             │
│                                  │
│ [🔊 Read Aloud] [✓ Done]        │
│                                  │
│ ✅ Completed 3x today            │
│ 🔥 7-day streak                  │
│                                  │
│ [← Prev] [Next →]               │
└──────────────────────────────────┘
```

**Interactive Features:**
- Read aloud (TTS)
- Completion tracking
- Streak counter
- Swipe/tap for next affirmation
- Mark as favorite

**C. Action Plan Checklist**
```
┌──────────────────────────────────┐
│ 📋 30-Day Action Plan        ⋯   │
├──────────────────────────────────┤
│ ☑ Research 3 passive income      │
│ ☐ Analyze pros/cons each         │
│ ☐ Choose best fit for me         │
│ ☐ Start first income stream      │
│ ☐ Set up accounts/tools          │
│                                  │
│ Progress: 1/5 completed          │
│                                  │
│ [Add Task] [Reorder]             │
└──────────────────────────────────┘
```

**Interactive Features:**
- Tap to check/uncheck
- Progress counter (0/5 → 5/5)
- Add custom tasks
- Reorder tasks (drag & drop)
- Set task deadlines

**D. Stats Dashboard Widget**
```
┌──────────────────────────────────┐
│ 📊 Your Stats                ⋯   │
├──────────────────────────────────┤
│  3        7 🔥      156      8   │
│ Goals   Streak   Affirm   Meditate│
│                                  │
│ [View Details]                   │
└──────────────────────────────────┘
```

**Tracked Stats:**
- Active goals count
- Current streak (days)
- Affirmations completed
- Meditations done
- Crystals explored
- Readings performed

#### **3.5 Widget Preview Before Adding**

**Preview Modal:**
```
┌────────────────────────────────────┐
│ Widget Preview               ✕    │
├────────────────────────────────────┤
│ Preview in Tab Tài Sản:           │
│                                    │
│ ┌──────────────────────────────┐ │
│ │ 💰 Thu nhập thụ động 100M   │ │
│ │ [Live preview rendering]     │ │
│ └──────────────────────────────┘ │
│                                    │
│ ✏️ Customize:                     │
│ Title: [100M Passive Income   ]   │
│ Target: [100,000,000] VND         │
│ Timeline: [6] months              │
│                                    │
│ Reminder Times:                   │
│ ☑️ Morning   [08:00] ▼            │
│ ☑️ Midday    [12:00] ▼            │
│ ☑️ Evening   [21:00] ▼            │
│                                    │
│ [Cancel] [Add to Account ✨]     │
└────────────────────────────────────┘
```

**After Adding:**
```
┌────────────────────────────────────┐
│ ✅ Success!                        │
├────────────────────────────────────┤
│ Widgets created in Tab Tài Sản:   │
│ • Goal tracking card               │
│ • Daily affirmations               │
│ • Action checklist                 │
│                                    │
│ 🔔 Reminders scheduled:            │
│ • 8:00 AM - Morning Affirmations   │
│ • 12:00 PM - Midday Check-in       │
│ • 9:00 PM - Evening Visualization  │
│                                    │
│ [View in Account Tab →]            │
│ [Continue Chat]                    │
└────────────────────────────────────┘
```

#### **3.6 AccountScreen.js Implementation**

**Updated AccountScreen Structure:**

```jsx
// AccountScreen.js (src/screens/tabs/)
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react-native';

// Widget Components
import GoalTrackingCard from '../../components/GemMaster/GoalTrackingCard';
import AffirmationCard from '../../components/GemMaster/AffirmationCard';
import ActionChecklistCard from '../../components/GemMaster/ActionChecklistCard';
import StatsWidget from '../../components/GemMaster/StatsWidget';

// Services
import WidgetManagementService from '../../services/widgetManagementService';

// Existing components
import ProfileHeader from '../../components/Account/ProfileHeader';
import StatsRow from '../../components/Account/StatsRow';
// ... other existing components

const MOCK_USER_ID = 'user-123'; // Replace with real auth

const AccountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const scrollViewRef = useRef(null);
  const dashboardSectionRef = useRef(null);
  
  // Widgets state
  const [widgets, setWidgets] = useState([]);
  const [isWidgetSectionCollapsed, setIsWidgetSectionCollapsed] = useState(false);
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true);
  
  // Load user's widgets
  useEffect(() => {
    loadUserWidgets();
  }, []);
  
  // Handle deep link from notification
  useEffect(() => {
    if (route.params?.scrollToWidget) {
      handleDeepLinkToWidget(route.params.scrollToWidget);
    }
  }, [route.params]);
  
  const loadUserWidgets = async () => {
    try {
      setIsLoadingWidgets(true);
      const userWidgets = await WidgetManagementService.getUserWidgets(MOCK_USER_ID);
      setWidgets(userWidgets);
      
      // Auto-collapse if >3 widgets
      const savedPreference = await AsyncStorage.getItem('dashboard_collapsed');
      if (savedPreference !== null) {
        setIsWidgetSectionCollapsed(savedPreference === 'true');
      } else {
        setIsWidgetSectionCollapsed(userWidgets.length > 3);
      }
    } catch (error) {
      console.error('Error loading widgets:', error);
    } finally {
      setIsLoadingWidgets(false);
    }
  };
  
  const handleDeepLinkToWidget = async (widgetId) => {
    // Expand dashboard section
    setIsWidgetSectionCollapsed(false);
    
    // Wait for render
    setTimeout(() => {
      // Scroll to dashboard section
      dashboardSectionRef.current?.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y, animated: true });
          
          // Highlight widget briefly
          highlightWidget(widgetId);
        }
      );
    }, 300);
  };
  
  const highlightWidget = (widgetId) => {
    // TODO: Add highlight animation
    // Could use Animated API or flash background color
  };
  
  const toggleDashboardSection = async () => {
    const newState = !isWidgetSectionCollapsed;
    setIsWidgetSectionCollapsed(newState);
    await AsyncStorage.setItem('dashboard_collapsed', newState.toString());
  };
  
  const navigateToGemMaster = () => {
    navigation.navigate('GemMaster');
  };
  
  const renderWidget = (widget) => {
    switch(widget.type) {
      case 'GOAL_CARD':
        return (
          <GoalTrackingCard 
            key={widget.id} 
            widget={widget}
            onUpdate={loadUserWidgets}
          />
        );
      case 'AFFIRMATION_CARD':
        return (
          <AffirmationCard 
            key={widget.id} 
            widget={widget}
            onComplete={loadUserWidgets}
          />
        );
      case 'ACTION_CHECKLIST':
        return (
          <ActionChecklistCard 
            key={widget.id} 
            widget={widget}
            onTaskToggle={loadUserWidgets}
          />
        );
      case 'STATS_WIDGET':
        return (
          <StatsWidget 
            key={widget.id} 
            widget={widget}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Profile Header */}
      <ProfileHeader />
      
      {/* 2. Dashboard Widgets Section - NEW! */}
      {widgets.length > 0 ? (
        <View 
          ref={dashboardSectionRef}
          style={styles.dashboardSection}
        >
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={toggleDashboardSection}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>
              📊 Dashboard - Goals & Actions
            </Text>
            {isWidgetSectionCollapsed ? (
              <ChevronDown size={20} color="#FFBD59" />
            ) : (
              <ChevronUp size={20} color="#FFBD59" />
            )}
          </TouchableOpacity>
          
          {!isWidgetSectionCollapsed && (
            <View style={styles.widgetsContainer}>
              {widgets.map(renderWidget)}
              
              {/* Add New Goal Button */}
              <TouchableOpacity 
                style={styles.addWidgetButton}
                onPress={navigateToGemMaster}
                activeOpacity={0.8}
              >
                <Plus size={20} color="#FFBD59" />
                <Text style={styles.addWidgetText}>
                  Thêm Mục Tiêu Mới
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        /* Empty State - No widgets yet */
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💎</Text>
          <Text style={styles.emptyTitle}>
            Chưa có mục tiêu nào
          </Text>
          <Text style={styles.emptyText}>
            Chat với GEM AI để tạo goals & affirmations!
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={navigateToGemMaster}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>
              Bắt Đầu Ngay
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* 3. Stats Row */}
      <StatsRow />
      
      {/* 4. Đơn Hàng Của Tôi */}
      <OrdersSection />
      
      {/* 5. Chương Trình Affiliate */}
      <AffiliateSection />
      
      {/* 6. Tài Sản */}
      <AssetsSection />
      
      {/* 7. Tài Khoản */}
      <AccountSettingsSection />
      
      {/* 8. Khác */}
      <OtherSection />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1030',
  },
  
  // Dashboard Section
  dashboardSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  widgetsContainer: {
    padding: 12,
    gap: 12,
  },
  addWidgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    borderStyle: 'dashed',
  },
  addWidgetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFBD59',
  },
  
  // Empty State
  emptyState: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 32,
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FFBD59',
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F1030',
  },
});

export default AccountScreen;
```

---

### **Feature 4: 🔔 PERSONALIZED PUSH NOTIFICATIONS**

**Description:** Smart notifications dựa trên dashboard widgets user đã tạo trong Account tab, personalized cho từng goal

**🆕 CRITICAL: Notifications deep link vào Account tab, scroll to Dashboard section!**

#### **4.1 Notification Types (Based on Account Widgets)**

**Type 1: Morning Affirmations (8 AM)**
```
┌────────────────────────────────┐
│ 🔔 Gemral       8:00 AM  │
├────────────────────────────────┤
│ 🌅 Good morning!               │
│                                │
│ Time for your affirmations:    │
│                                │
│ "Tiền bạc đến với tôi dễ dàng │
│  qua passive income"           │
│                                │
│ [Open Account] [Snooze 15m]    │
└────────────────────────────────┘
```

**Deep Link:** 
```javascript
{
  screen: 'Account',
  params: {
    scrollToWidget: 'affirmation-widget-id',
    expandDashboard: true
  }
}
```

**Type 2: Midday Check-in (12 PM)**
```
┌────────────────────────────────┐
│ 🔔 Gemral      12:00 PM  │
├────────────────────────────────┤
│ ☕ Midday Check-in              │
│                                │
│ Did you take aligned action?   │
│                                │
│ Your goal: 100M passive income │
│ Next step: Research streams    │
│                                │
│ [✅ Yes, I did!] [Not yet]    │
└────────────────────────────────┘
```

**Deep Link:** → Account tab, scroll to Action Checklist

**Action:** "Yes, I did!" → Auto-check task trong Account

**Type 3: Evening Visualization (9 PM)**
```
┌────────────────────────────────┐
│ 🔔 Gemral       9:00 PM  │
├────────────────────────────────┤
│ 🌙 Evening Visualization       │
│                                │
│ 10-minute guided session       │
│                                │
│ "Close your eyes...            │
│  See yourself with 100M..."    │
│                                │
│ [▶️ Start Now] [Skip Today]   │
└────────────────────────────────┘
```

**Deep Link:** → Account tab, scroll to Goal widget

**Type 4: Milestone Celebration**
```
┌────────────────────────────────┐
│ 🔔 Gemral      Just now  │
├────────────────────────────────┤
│ 🎉 Milestone Achieved!         │
│                                │
│ You've completed 50% of goal!  │
│                                │
│ 40M out of 100M ✨             │
│                                │
│ Keep going! The universe is    │
│ supporting you!                │
│                                │
│ [View in Account] [Share]      │
└────────────────────────────────┘
```

**Deep Link:** → Account tab, scroll to Goal widget + confetti

#### **4.2 Deep Linking Implementation**

**Notification Handler:**
```javascript
// App.js or navigation setup
import * as Notifications from 'expo-notifications';

Notifications.addNotificationResponseReceivedListener(response => {
  const { data } = response.notification.request.content;
  
  // Extract deep link params
  const { 
    targetTab,        // 'Account'
    widgetId,         // 'goal-widget-123'
    widgetType,       // 'GOAL_CARD'
    expandDashboard,  // true
    action            // 'COMPLETE_TASK', etc.
  } = data;
  
  // Navigate to Account tab with params
  navigation.navigate('MainTabs', {
    screen: targetTab,
    params: {
      scrollToWidget: widgetId,
      expandDashboard: expandDashboard,
      highlightWidget: true,
      action: action
    }
  });
  
  // Track notification engagement
  trackNotificationEngagement({
    notificationId: response.notification.request.identifier,
    userId: currentUserId,
    action: 'OPENED',
    widgetId: widgetId
  });
});

// In AccountScreen.js - Handle deep link
useEffect(() => {
  if (route.params?.scrollToWidget) {
    // Expand dashboard
    setIsWidgetSectionCollapsed(false);
    
    // Wait for render
    setTimeout(() => {
      // Scroll to dashboard section
      dashboardSectionRef.current?.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ 
            y: y - 20, // Offset for padding
            animated: true 
          });
          
          // Highlight widget
          if (route.params.highlightWidget) {
            highlightWidget(route.params.scrollToWidget);
          }
          
          // Execute action if provided
          if (route.params.action === 'COMPLETE_TASK') {
            // Auto-complete task
            handleTaskComplete(route.params.scrollToWidget);
          }
        }
      );
    }, 300);
  }
}, [route.params]);
```

#### **4.3 Smart Notification Scheduling**

**Personalization Logic:**
```javascript
// notificationScheduler.js
async function scheduleSmartNotifications(userId) {
  // Get user's widgets from Account tab
  const widgets = await WidgetManagementService.getUserWidgets(userId);
  
  // For each goal widget in Account
  widgets.filter(w => w.type === 'GOAL_CARD').forEach(goalWidget => {
    
    // Schedule morning affirmations
    if (goalWidget.affirmations.length > 0) {
      scheduleNotification({
        userId,
        type: 'MORNING_AFFIRMATION',
        time: getUserPreferredTime(userId, 'morning') || '08:00',
        content: {
          affirmation: getRandomAffirmation(goalWidget.affirmations),
          goalTitle: goalWidget.title
        },
        deepLink: {
          screen: 'Account',
          params: {
            scrollToWidget: `affirmation-${goalWidget.id}`,
            expandDashboard: true
          }
        },
        sound: 'gem_chime.mp3'
      });
    }
    
    // Schedule midday check-in
    if (goalWidget.actionPlan.length > 0) {
      const nextTask = goalWidget.actionPlan.find(t => !t.completed);
      
      scheduleNotification({
        userId,
        type: 'MIDDAY_CHECKIN',
        time: getUserPreferredTime(userId, 'midday') || '12:00',
        content: {
          goalTitle: goalWidget.title,
          nextTask: nextTask?.title || 'Take aligned action'
        },
        deepLink: {
          screen: 'Account',
          params: {
            scrollToWidget: goalWidget.id,
            expandDashboard: true
          }
        },
        actions: [
          { 
            id: 'complete', 
            title: '✅ Yes, I did!', 
            deepLink: {
              screen: 'Account',
              params: {
                scrollToWidget: goalWidget.id,
                action: 'COMPLETE_TASK',
                taskId: nextTask?.id
              }
            }
          },
          { 
            id: 'snooze', 
            title: 'Not yet', 
            action: 'SNOOZE_2H' 
          }
        ]
      });
    }
    
    // Schedule evening visualization
    scheduleNotification({
      userId,
      type: 'EVENING_VISUALIZATION',
      time: getUserPreferredTime(userId, 'evening') || '21:00',
      content: {
        goalTitle: goalWidget.title,
        visualization: generateVisualization(goalWidget)
      },
      deepLink: {
        screen: 'Account',
        params: {
          scrollToWidget: goalWidget.id,
          expandDashboard: true
        }
      },
      sound: 'peaceful_bell.mp3'
    });
    
    // Monitor for milestones
    watchForMilestones(goalWidget.id, async (milestone) => {
      await sendImmediateNotification({
        userId,
        type: 'MILESTONE_CELEBRATION',
        content: {
          milestone: milestone.percentage,
          goalTitle: goalWidget.title,
          currentAmount: goalWidget.progress.current,
          targetAmount: goalWidget.progress.target
        },
        deepLink: {
          screen: 'Account',
          params: {
            scrollToWidget: goalWidget.id,
            expandDashboard: true,
            showConfetti: true
          }
        },
        priority: 'high',
        sound: 'celebration.mp3'
      });
    });
  });
}
```

---

## 📁 FILE STRUCTURE (FINAL)

```
src/
├── screens/
│   ├── tabs/
│   │   └── AccountScreen.js                [MAJOR UPDATE]
│   │       ├─ Import widget components
│   │       ├─ Add Dashboard section (position #2)
│   │       ├─ Add loadUserWidgets()
│   │       ├─ Add deep link handling
│   │       ├─ Add empty state
│   │       └─ Add collapsible logic
│   │
│   ├── GemMaster/
│   │   └── GemMasterScreen.js              [UPDATE]
│   │       └─ Add "Add to Dashboard" flow
│   │
│   └── Account/
│       ├─ AccountScreen.js                 [NO CHANGES]
│       ├─ AffiliateDetailScreen.js         [NO CHANGES]
│       └─ ... (other screens unchanged)
│
├── components/
│   ├── GemMaster/
│   │   ├── VoiceInputButton.js             [Feature 1]
│   │   ├── RecordingIndicator.js           [Feature 1]
│   │   ├── ExportButton.js                 [Feature 2]
│   │   ├── ExportTemplateSelector.js       [Feature 2]
│   │   │
│   │   ├── WidgetSuggestionCard.js         [Feature 3 - NEW]
│   │   ├── WidgetPreviewModal.js           [Feature 3 - NEW]
│   │   ├── GoalTrackingCard.js             [Feature 3 - NEW]
│   │   ├── AffirmationCard.js              [Feature 3 - NEW]
│   │   ├── ActionChecklistCard.js          [Feature 3 - NEW]
│   │   ├── StatsWidget.js                  [Feature 3 - NEW]
│   │   └── WidgetEvolutionModal.js         [Feature 3 - NEW]
│   │
│   └── Account/
│       ├─ ProfileHeader.js                 [EXISTING]
│       ├─ StatsRow.js                      [EXISTING]
│       └─ ... (other existing components)
│
├── services/
│   ├── voiceService.js                     [Feature 1]
│   ├── exportService.js                    [Feature 2]
│   │
│   ├── responseDetectionService.js         [Feature 3 - NEW]
│   ├── widgetFactoryService.js             [Feature 3 - NEW]
│   ├── widgetManagementService.js          [Feature 3 - NEW]
│   ├── widgetInteractionService.js         [Feature 3 - NEW]
│   │
│   ├── notificationScheduler.js            [Feature 4 - NEW]
│   └── notificationPersonalizer.js         [Feature 4 - NEW]
│
└── navigation/
    ├── MainTabs.js                         [NO CHANGES]
    └── AccountStack.js                     [NO CHANGES]
```

**Key Points:**
- ✅ NO new screens created
- ✅ AccountScreen.js is the only screen modified
- ✅ All widgets are components used in AccountScreen
- ✅ Navigation structure unchanged

---

## 🗓️ IMPLEMENTATION TIMELINE

### **Day 11-12: Voice Input (8h)**
- voiceService.js
- VoiceInputButton.js
- RecordingIndicator.js
- Update ChatInput.js

### **Day 13-14: Export to Image (8h)**
- exportService.js
- ExportButton.js
- ExportTemplateSelector.js
- imageGenerator.js

### **Day 15-16: Testing & Polish (6h)**
- Test voice + export
- Bug fixes
- UX polish

### **Day 17-19: AI → Dashboard Widgets in Account (10h)**

**Day 17:**
- responseDetectionService.js
- widgetFactoryService.js
- WidgetSuggestionCard.js (in chat)
- WidgetPreviewModal.js

**Day 18:**
- GoalTrackingCard.js
- AffirmationCard.js
- ActionChecklistCard.js
- StatsWidget.js

**Day 19:**
- UPDATE AccountScreen.js (add Dashboard section)
- widgetManagementService.js
- widgetInteractionService.js
- Testing integration

### **Day 20-22: Smart Notifications (10h)**

**Day 20:**
- notificationScheduler.js
- notificationPersonalizer.js
- Setup Firebase/APNs

**Day 21:**
- 4 notification types implementation
- Deep linking to Account tab
- Action buttons

**Day 22:**
- Notification settings UI
- Testing all notification flows
- Milestone tracking

### **Day 23-24: Final Testing & Launch (6h)**

**Day 23:**
- Comprehensive testing
- Bug fixes
- Performance optimization

**Day 24:**
- Final polish
- Documentation
- Launch preparation

**Total:** 14 ngày (~100 giờ)

---

## ✅ TESTING CHECKLIST

### **Feature 3: Dashboard in Account Tab**

**Account Integration:**
- [ ] Dashboard section renders in AccountScreen position #2
- [ ] Widgets display correctly after Profile Header
- [ ] Empty state shows when no widgets
- [ ] "Thêm Mục Tiêu Mới" navigates to GemMaster
- [ ] Collapsible section works (tap header)
- [ ] User preference saved (collapsed/expanded)
- [ ] Doesn't break existing Account features

**Widget Creation Flow:**
- [ ] Chat in GemMaster → AI suggests widget
- [ ] "Add to Dashboard" button appears
- [ ] Preview modal works
- [ ] Customization options functional
- [ ] Widget saves to database
- [ ] Success message shows with "View in Account Tab"
- [ ] Navigate to Account shows new widget

**Widget Functionality:**
- [ ] Goal card updates progress
- [ ] Affirmation card shows daily affirmation
- [ ] Checklist checkboxes toggle
- [ ] Stats widget displays accurately
- [ ] All widgets responsive
- [ ] Cross-widget interactions work

**Deep Linking:**
- [ ] Notification → Opens Account tab ✅
- [ ] Auto-scroll to Dashboard section ✅
- [ ] Expand Dashboard if collapsed ✅
- [ ] Highlight specific widget ✅
- [ ] Action buttons work (complete task) ✅

### **Feature 4: Notifications**

**Scheduling:**
- [ ] Morning notification (8 AM) scheduled
- [ ] Midday notification (12 PM) scheduled
- [ ] Evening notification (9 PM) scheduled
- [ ] Custom times respected
- [ ] Do Not Disturb honored
- [ ] Max 3/day enforced

**Content Personalization:**
- [ ] Morning shows user's affirmation from Account
- [ ] Midday shows user's next task from Account
- [ ] Evening visualization matches user's goal
- [ ] Milestone % accurate

**Deep Link Actions:**
- [ ] Tap notification → Opens Account tab
- [ ] Scroll to correct widget
- [ ] Highlight widget animation
- [ ] "Yes, I did!" → Checks off task in Account
- [ ] All actions work iOS & Android

---

## 🎯 SUCCESS CRITERIA

### **Must Work:**

✅ Widgets render in AccountScreen position #2  
✅ Dashboard section collapsible  
✅ Empty state attractive  
✅ Widget creation flow smooth  
✅ All 4 widget types functional  
✅ Notifications deep link to Account  
✅ Auto-scroll + highlight working  
✅ Doesn't break existing Account features  
✅ Performance optimized (no lag)  

### **Key Metrics:**

```
After 1 Week:
├─ Account tab visits: +50%
├─ Widget creation: 40% of users
├─ Notification open rate: 40%
├─ Daily engagement: +60%
└─ Widget interaction: 80% of users with widgets

After 1 Month:
├─ Account tab visits: +80%
├─ Active widgets: 70% of users
├─ Notification CTR: 25%
├─ Goal completion: 25%
└─ Retention: +40%
```

---

## 💰 MONETIZATION

### **Tiered Features:**

**FREE:**
- 1 goal widget in Account
- 5 affirmations
- 10 checklist items
- 3 notifications/day

**TIER1 ($11):**
- 3 goal widgets in Account
- Unlimited affirmations
- 30 checklist items
- Unlimited notifications

**TIER2 ($21):**
- 10 goal widgets in Account
- Crystal healing widgets
- Trading analysis widgets
- Export no watermark
- Widget evolution

**TIER3 ($68):**
- Unlimited widgets in Account
- All TIER2 features
- Social widgets
- Community challenges
- AI-powered insights

### **Expected Conversions:**

```
Dashboard Impact:
├─ FREE → TIER1: +15-20%
│   (Need more widgets in Account)
├─ TIER1 → TIER2: +10-15%
│   (Want crystal & trading widgets)
└─ TIER2 → TIER3: +5-8%
    (Power users wanting unlimited)

Combined Phase 2:
└─ Total revenue: +50-60% (Month 3)
```

---

## 🚨 CRITICAL NOTES

### **Account Tab Integration Benefits:**

✅ **User Mental Model:**
- "Tài Sản" = My assets, my goals, my dashboard
- Natural fit with existing "Portfolio" section
- Users already visit Account frequently

✅ **Navigation Simplicity:**
- No new tab needed
- No new navigation screen
- Familiar location

✅ **Technical Simplicity:**
- Modify 1 existing screen (AccountScreen.js)
- Reuse existing navigation
- Cleaner architecture

✅ **UX Flow:**
```
User journey:
1. Chat in GemMaster
2. Create widget
3. "View in Account Tab" (explicit instruction)
4. Navigate to Account (familiar action)
5. See widgets in Dashboard section (position #2, prominent)
```

### **Deep Linking Advantages:**

✅ **Clear Destination:**
- Notification → "Account tab" (user knows where to go)
- Dashboard section visible (position #2)
- No confusion about widget location

✅ **Existing Patterns:**
- Users already navigate to Account for other features
- Consistent with app-wide notification behavior
- Familiar tab-based navigation

---

## 📊 EXPECTED OUTCOMES

### **User Engagement:**
```
Before Phase 2:
├─ Account visits/week: 2-3
├─ Time in Account: 30 sec (quick checks)
├─ Sessions/week: 3-4
└─ Retention (30-day): 40%

After Phase 2:
├─ Account visits/week: 10-15 (+400%)
├─ Time in Account: 3-5 min (+600%)
├─ Sessions/week: 7-10 (+75%)
└─ Retention (30-day): 70% (+75%)
```

### **Account Tab Transformation:**
```
OLD: Quick utility tab
- Check orders
- View portfolio
- Settings

NEW: Daily engagement hub
- Check orders
- VIEW & INTERACT WITH GOALS 🎯
- Update progress
- Read affirmations
- Check off tasks
- View portfolio
- Settings
```

---

**STATUS:** ✅ FINAL - Account Tab Integration Complete  
**Version:** 3.0  
**Key Change:** Widgets in AccountScreen.js, NOT separate DashboardScreen  
**Location:** Tab Tài Sản → Dashboard section (position #2)  

🚀 **READY FOR IMPLEMENTATION!**
