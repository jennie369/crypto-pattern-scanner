# 📱 WEEK 4-8: COMPLETE IMPLEMENTATION PROMPTS

**CRITICAL:** Chatbot đã đổi tên thành "Gemral" - Update tất cả references!

---

# 🛒 WEEK 4: SHOP TAB IMPLEMENTATION

## ⚠️ ENFORCEMENT RULES

```markdown
🚨 MUST follow DESIGN_TOKENS.md
🚨 MUST reuse shopifyService.js from web app
🚨 MUST use Shopify Buy SDK
🚨 NO custom payment - use Shopify checkout
```

## 📋 PROMPT - WEEK 4

```markdown
NHIỆM VỤ: Implement Shop Tab (E-commerce)
TUẦN: 4
MỤC TIÊU: Complete shopping features với Shopify integration

═══════════════════════════════════════════════════════════
KEY FEATURES TO IMPLEMENT
═══════════════════════════════════════════════════════════

**1. Product Catalog:**
- Product grid (2 columns)
- Product images
- Price display
- Sale badges
- Quick add to cart

**2. Categories:**
- 💎 Crystals & Spiritual
- 📚 Courses
- ⭐ Subscriptions (TIER 1/2/3)
- 📦 Merchandise
- 🎁 Gift Cards

**3. Cart Management:**
- Add/remove items
- Update quantities
- Cart total calculation
- Persist cart (AsyncStorage)

**4. Checkout:**
- Shopify Web Checkout
- WebView integration
- Order confirmation
- Auto TIER upgrade (webhook)

═══════════════════════════════════════════════════════════
SERVICES TO REUSE (FROM WEB APP)
═══════════════════════════════════════════════════════════

```bash
# Copy Shopify service
cp ../gem-platform/src/services/shopifyService.js \
   ./src/services/shopifyService.js

# Copy Cart context
cp ../gem-platform/src/contexts/CartContext.js \
   ./src/contexts/CartContext.js
```

**Shopify Service Functions:**
```javascript
export const shopifyService = {
  async getProducts() { /* ... */ },
  async getProductById(id) { /* ... */ },
  async getCollections() { /* ... */ },
  async createCheckout(items) { /* ... */ },
  async getCheckout(checkoutId) { /* ... */ },
};
```

═══════════════════════════════════════════════════════════
SCREEN STRUCTURE
═══════════════════════════════════════════════════════════

```
src/screens/Shop/
├── ShopScreen.js           (Main screen)
├── ProductDetailScreen.js  (Product detail)
├── CartScreen.js           (Cart review)
├── CheckoutScreen.js       (Shopify WebView)
├── components/
│   ├── ProductGrid.js      (2-column grid)
│   ├── ProductCard.js      (Product preview)
│   ├── CategoryFilter.js   (Category tabs)
│   ├── CartButton.js       (Header cart icon)
│   └── PriceTag.js         (Price display)
└── styles/
    └── shopStyles.js
```

═══════════════════════════════════════════════════════════
MAIN SCREEN CODE
═══════════════════════════════════════════════════════════

```javascript
// src/screens/Shop/ShopScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
} from 'react-native';
import { shopifyService } from '../../services/shopifyService';
import ProductCard from './components/ProductCard';
import CategoryFilter from './components/CategoryFilter';
import { COLORS, SPACING } from '../../utils/designTokens';

const ShopScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await shopifyService.getProducts({
        collection: selectedCategory,
      });
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await shopifyService.getCollections();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgOffWhite,  // ✅ Light theme for shop
  },
  grid: {
    paddingHorizontal: SPACING.lg,     // 16px
    paddingTop: SPACING.md,            // 12px
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,          // 12px
  },
});

export default ShopScreen;
```

═══════════════════════════════════════════════════════════
VALIDATION CHECKLIST
═══════════════════════════════════════════════════════════

**✅ Features:**
- [ ] Product grid displays correctly
- [ ] Category filter working
- [ ] Product detail screen
- [ ] Add to cart working
- [ ] Cart badge showing count
- [ ] Shopify checkout WebView
- [ ] Order confirmation

**✅ Design:**
- [ ] Light theme (off-white background)
- [ ] 2-column grid
- [ ] Product images loading
- [ ] Price formatting correct
- [ ] Sale badges visible

**✅ Integration:**
- [ ] Shopify API working
- [ ] Cart persists (AsyncStorage)
- [ ] Checkout opens in WebView
- [ ] Order webhook triggers TIER upgrade

REPORT COMPLETION WITH ALL CHECKLIST ITEMS VERIFIED!
```

---

# 📊 WEEK 5: SCANNER TAB (GIAO DỊCH) IMPLEMENTATION

## ⚠️ ENFORCEMENT RULES

```markdown
🚨 MUST reuse patternDetection.js from web app
🚨 MUST reuse binanceService.js
🚨 MUST use WebView for TradingView charts
🚨 NO rebuild detection logic - it works!
```

## 📋 PROMPT - WEEK 5

```markdown
NHIỆM VỤ: Implement Scanner Tab (Pattern Detection)
TUẦN: 5  
MỤC TIÊU: Full trading features với pattern detection

═══════════════════════════════════════════════════════════
KEY FEATURES
═══════════════════════════════════════════════════════════

**1. Pattern Scanner:**
- Coin selector dropdown
- Timeframe buttons (1h, 4h, 1d, 1w)
- Pattern detection (7 patterns)
- Confidence bars
- Win rate display

**2. Pattern Display:**
- Pattern cards
- Entry/exit levels
- Stop loss/take profit
- Risk/reward ratio
- Confidence score

**3. Chart Integration:**
- TradingView WebView
- Price display
- Volume bars
- Pattern overlay (future)

**4. Real-time Updates:**
- Binance WebSocket
- Price updates
- New pattern alerts

═══════════════════════════════════════════════════════════
SERVICES TO REUSE (CRITICAL!)
═══════════════════════════════════════════════════════════

```bash
# Copy pattern detection (WORKING CODE!)
cp ../gem-platform/src/services/patternDetection.js \
   ./src/services/patternDetection.js

# Copy Binance service
cp ../gem-platform/src/services/binanceService.js \
   ./src/services/binanceService.js

# Copy constants
cp ../gem-platform/src/utils/constants.js \
   ./src/utils/constants.js
```

**Pattern Detection Service (EXISTING):**
```javascript
export const patternDetection = {
  async detectPatterns(symbol, timeframe) {
    // Get OHLCV data from Binance
    const candles = await binanceService.getCandles(symbol, timeframe);
    
    // Run all 7 pattern detectors
    const patterns = [];
    patterns.push(...detectDPD(candles));
    patterns.push(...detectUPU(candles));
    patterns.push(...detectHeadAndShoulders(candles));
    patterns.push(...detectUPD(candles));  // Week 6
    patterns.push(...detectDPU(candles));  // Week 6
    patterns.push(...detectDoubleTop(candles));  // Week 6
    patterns.push(...detectDoubleBottom(candles));  // Week 6
    
    return patterns;
  },
};
```

**⚠️ CRITICAL:** 
- 3/7 patterns implemented (DPD, UPU, H&S)
- 4/7 patterns TODO (UPD, DPU, Double Top/Bottom)
- Current win rate: 38% (need 68%)

═══════════════════════════════════════════════════════════
SCREEN STRUCTURE
═══════════════════════════════════════════════════════════

```
src/screens/Scanner/
├── ScannerScreen.js        (Main screen)
├── PatternDetailScreen.js  (Pattern detail)
├── ChartScreen.js          (TradingView WebView)
├── components/
│   ├── CoinSelector.js     (Dropdown)
│   ├── TimeframeButtons.js (1h/4h/1d/1w)
│   ├── PatternCard.js      (Pattern preview)
│   ├── ConfidenceBar.js    (Visual bar)
│   ├── LevelDisplay.js     (Entry/exit levels)
│   └── ChartWebView.js     (TradingView)
└── styles/
    └── scannerStyles.js
```

═══════════════════════════════════════════════════════════
MAIN SCREEN CODE
═══════════════════════════════════════════════════════════

```javascript
// src/screens/Scanner/ScannerScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { patternDetection } from '../../services/patternDetection';
import CoinSelector from './components/CoinSelector';
import TimeframeButtons from './components/TimeframeButtons';
import PatternCard from './components/PatternCard';
import { COLORS, SPACING, GLASS } from '../../utils/designTokens';

const ScannerScreen = ({ navigation }) => {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('4h');
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    scanPatterns();
  }, [selectedCoin, selectedTimeframe]);

  const scanPatterns = async () => {
    try {
      setLoading(true);
      
      // ✅ Use existing detection service
      const detected = await patternDetection.detectPatterns(
        selectedCoin,
        selectedTimeframe
      );
      
      // Sort by confidence
      const sorted = detected.sort((a, b) => b.confidence - a.confidence);
      setPatterns(sorted);
      
    } catch (error) {
      console.error('Error scanning patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Controls */}
      <View style={styles.controls}>
        <CoinSelector
          selected={selectedCoin}
          onSelect={setSelectedCoin}
        />
        
        <TimeframeButtons
          selected={selectedTimeframe}
          onSelect={setSelectedTimeframe}
        />
      </View>

      {/* Patterns List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        {patterns.map((pattern, index) => (
          <PatternCard
            key={`${pattern.type}-${index}`}
            pattern={pattern}
            onPress={() => navigation.navigate('PatternDetail', { pattern })}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  controls: {
    backgroundColor: GLASS.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: GLASS.border,
    padding: SPACING.lg,           // 16px
    gap: SPACING.md,               // 12px
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,           // 16px
    gap: SPACING.md,               // 12px
  },
});

export default ScannerScreen;
```

═══════════════════════════════════════════════════════════
PATTERN CARD COMPONENT
═══════════════════════════════════════════════════════════

```javascript
// src/screens/Scanner/components/PatternCard.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import ConfidenceBar from './ConfidenceBar';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/designTokens';

const PatternCard = ({ pattern, onPress }) => {
  const isLong = pattern.direction === 'LONG';
  const directionColor = isLong ? COLORS.success : COLORS.danger;
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isLong ? (
            <TrendingUp size={20} color={COLORS.success} strokeWidth={2.5} />
          ) : (
            <TrendingDown size={20} color={COLORS.danger} strokeWidth={2.5} />
          )}
          <Text style={styles.patternName}>{pattern.type}</Text>
        </View>
        
        <View style={[styles.badge, { backgroundColor: `${directionColor}20` }]}>
          <Text style={[styles.badgeText, { color: directionColor }]}>
            {pattern.direction}
          </Text>
        </View>
      </View>

      {/* Confidence */}
      <ConfidenceBar confidence={pattern.confidence} />

      {/* Levels */}
      <View style={styles.levels}>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Entry:</Text>
          <Text style={styles.levelValue}>{pattern.entry}</Text>
        </View>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Target:</Text>
          <Text style={[styles.levelValue, { color: COLORS.success }]}>
            {pattern.target}
          </Text>
        </View>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Stop Loss:</Text>
          <Text style={[styles.levelValue, { color: COLORS.danger }]}>
            {pattern.stopLoss}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statText}>
          R/R: {pattern.riskReward.toFixed(2)}
        </Text>
        <Text style={styles.statText}>
          Win Rate: {pattern.winRate}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS.backgroundDark,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GLASS.border,
    padding: SPACING.lg,          // 16px
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,     // 12px
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,              // 8px
  },
  
  patternName: {
    fontFamily: TYPOGRAPHY.fontFamily.display,
    fontSize: TYPOGRAPHY.fontSize.lg,     // 16px
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  
  badge: {
    paddingHorizontal: SPACING.sm,        // 8px
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  badgeText: {
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontSize: TYPOGRAPHY.fontSize.xs,     // 10px
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  
  levels: {
    marginTop: SPACING.md,                // 12px
    gap: SPACING.xs,                      // 4px
  },
  
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  levelLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.primary,
    fontSize: TYPOGRAPHY.fontSize.sm,     // 12px
    color: COLORS.textSecondary,
  },
  
  levelValue: {
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.cyan,                   // ✅ Cyan for numbers
  },
  
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,                // 12px
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: GLASS.border,
  },
  
  statText: {
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
});

export default PatternCard;
```

═══════════════════════════════════════════════════════════
VALIDATION CHECKLIST
═══════════════════════════════════════════════════════════

**✅ Features:**
- [ ] Coin selector working
- [ ] Timeframe buttons working
- [ ] Patterns detecting correctly
- [ ] Confidence bars display
- [ ] Entry/exit levels shown
- [ ] Direction badges (LONG/SHORT)
- [ ] Chart WebView working
- [ ] Real-time price updates

**✅ Pattern Detection:**
- [ ] DPD pattern working (existing)
- [ ] UPU pattern working (existing)
- [ ] Head & Shoulders working (existing)
- [ ] UPD pattern TODO (implement later)
- [ ] DPU pattern TODO (implement later)
- [ ] Double Top TODO (implement later)
- [ ] Double Bottom TODO (implement later)

**✅ Design:**
- [ ] Dark glass theme
- [ ] Cyan for numbers
- [ ] Green/red for directions
- [ ] Touch-friendly controls
- [ ] Smooth scrolling

REPORT COMPLETION WITH CHECKLIST!
```

---

# 🤖 WEEK 6: Gemral TAB IMPLEMENTATION

**⚠️ CRITICAL UPDATE: "Chatbot" → "Gemral"**

## ⚠️ ENFORCEMENT RULES

```markdown
🚨 Name: "Gemral" (NOT Chatbot!)
🚨 Tab title: "Gemral"
🚨 Screen name: "GemMasterScreen"
🚨 Features: I Ching + Tarot + Trading insights
```

## 📋 PROMPT - WEEK 6

```markdown
NHIỆM VỤ: Implement Gemral Tab (AI Chat)
TUẦN: 6
MỤC TIÊU: Complete AI chat với I Ching + Tarot features

═══════════════════════════════════════════════════════════
KEY FEATURES
═══════════════════════════════════════════════════════════

**1. Chat Interface:**
- Message bubbles (user/assistant)
- Streaming responses
- Typing indicator
- Message history
- Send button

**2. I Ching Readings:**
- Coin toss animation
- Hexagram display
- Interpretation
- Trading insights
- "Ask about market" shortcut

**3. Tarot Readings:**
- Card deck animation
- Card selection (1/3/5 cards)
- Card meanings
- Trading context
- "Draw card" shortcut

**4. Dashboard Widgets (Optional Week 7):**
- Quick stats
- Recent readings
- Saved conversations

═══════════════════════════════════════════════════════════
SCREEN STRUCTURE
═══════════════════════════════════════════════════════════

```
src/screens/GemMaster/  // ✅ NOT Chatbot!
├── GemMasterScreen.js         (Main chat)
├── IChingScreen.js            (I Ching reading)
├── TarotScreen.js             (Tarot reading)
├── components/
│   ├── MessageBubble.js       (Chat bubble)
│   ├── ChatInput.js           (Input bar)
│   ├── TypingIndicator.js     (Dots animation)
│   ├── HexagramDisplay.js     (I Ching)
│   ├── TarotCard.js           (Card component)
│   └── QuickActions.js        (Shortcuts)
└── styles/
    └── gemMasterStyles.js
```

═══════════════════════════════════════════════════════════
MAIN SCREEN CODE
═══════════════════════════════════════════════════════════

```javascript
// src/screens/GemMaster/GemMasterScreen.js
// ✅ Name: Gemral (NOT Chatbot!)

import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';
import QuickActions from './components/QuickActions';
import { COLORS, SPACING, GLASS } from '../../utils/designTokens';

const GemMasterScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'assistant',
      text: 'Chào mừng đến với Gemral! Tôi có thể giúp bạn:\n\n💫 Đọc I Ching về thị trường\n🎴 Xem Tarot về giao dịch\n📊 Phân tích xu hướng\n\nBạn cần gì?',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  const handleSendMessage = async (text) => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text,
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    setIsTyping(true);

    try {
      // TODO: Call Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            { role: 'user', content: text }
          ],
        }),
      });

      const data = await response.json();
      const assistantText = data.content[0].text;

      // Add assistant message
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: assistantText,
        timestamp: new Date(),
      };

      setMessages([...messages, userMessage, assistantMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }) => (
    <MessageBubble message={item} />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Quick Actions */}
      <QuickActions
        onPressIChing={() => navigation.navigate('IChing')}
        onPressTarot={() => navigation.navigate('Tarot')}
      />

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Typing Indicator */}
      {isTyping && <TypingIndicator />}

      {/* Input */}
      <ChatInput onSend={handleSendMessage} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  messages: {
    padding: SPACING.lg,          // 16px
    gap: SPACING.md,              // 12px
  },
});

export default GemMasterScreen;
```

═══════════════════════════════════════════════════════════
MESSAGE BUBBLE COMPONENT
═══════════════════════════════════════════════════════════

```javascript
// src/screens/GemMaster/components/MessageBubble.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User, Sparkles } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/designTokens';

const MessageBubble = ({ message }) => {
  const isUser = message.type === 'user';
  
  return (
    <View style={[
      styles.container,
      isUser ? styles.containerUser : styles.containerAssistant,
    ]}>
      {/* Avatar */}
      {!isUser && (
        <View style={styles.avatar}>
          <Sparkles size={16} color={COLORS.gold} />
        </View>
      )}

      {/* Bubble */}
      <View style={[
        styles.bubble,
        isUser ? styles.bubbleUser : styles.bubbleAssistant,
      ]}>
        <Text style={[
          styles.text,
          isUser ? styles.textUser : styles.textAssistant,
        ]}>
          {message.text}
        </Text>
        
        <Text style={styles.timestamp}>
          {formatTime(message.timestamp)}
        </Text>
      </View>

      {/* Avatar */}
      {isUser && (
        <View style={styles.avatar}>
          <User size={16} color={COLORS.textPrimary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.sm,              // 8px
    marginBottom: SPACING.md,     // 12px
  },
  
  containerUser: {
    flexDirection: 'row-reverse',
  },
  
  containerAssistant: {
    flexDirection: 'row',
  },
  
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GLASS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  
  bubble: {
    flex: 1,
    borderRadius: 18,
    padding: SPACING.md,          // 12px
    maxWidth: '75%',
  },
  
  bubbleUser: {
    backgroundColor: COLORS.gold,
    alignSelf: 'flex-end',
  },
  
  bubbleAssistant: {
    backgroundColor: GLASS.backgroundDark,
    borderWidth: 1,
    borderColor: GLASS.border,
    alignSelf: 'flex-start',
  },
  
  text: {
    fontFamily: TYPOGRAPHY.fontFamily.primary,
    fontSize: TYPOGRAPHY.fontSize.md,     // 14px
    lineHeight: 20,
  },
  
  textUser: {
    color: COLORS.navy,                   // Dark text on gold
  },
  
  textAssistant: {
    color: COLORS.textPrimary,
  },
  
  timestamp: {
    fontFamily: TYPOGRAPHY.fontFamily.primary,
    fontSize: TYPOGRAPHY.fontSize.xs,     // 10px
    color: COLORS.textMuted,
    marginTop: SPACING.xs,                // 4px
  },
});

const formatTime = (date) => {
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default MessageBubble;
```

═══════════════════════════════════════════════════════════
VALIDATION CHECKLIST
═══════════════════════════════════════════════════════════

**✅ Features:**
- [ ] Chat interface working
- [ ] Message bubbles styled correctly
- [ ] Send message working
- [ ] Claude API integrated
- [ ] Typing indicator
- [ ] I Ching screen implemented
- [ ] Tarot screen implemented
- [ ] Quick action buttons

**✅ Naming:**
- [ ] Tab title: "Gemral" ✅ (NOT Chatbot)
- [ ] Screen name: GemMasterScreen ✅
- [ ] Folder name: GemMaster/ ✅
- [ ] All references updated ✅

**✅ Design:**
- [ ] User messages: Gold bubbles
- [ ] Assistant messages: Glass bubbles
- [ ] Avatar icons present
- [ ] Timestamps visible
- [ ] Keyboard handling working

REPORT COMPLETION!
```

---

# 🔔 WEEK 7: NOTIFICATIONS TAB IMPLEMENTATION

## 📋 PROMPT - WEEK 7

```markdown
NHIỆM VỤ: Implement Notifications Tab
TUẦN: 7
MỤC TIÊU: Complete notification system với push notifications

═══════════════════════════════════════════════════════════
KEY FEATURES
═══════════════════════════════════════════════════════════

**1. Notification List:**
- Category tabs (All, Trading, Social, System)
- Notification cards
- Read/unread status
- Swipe to delete
- Mark as read
- Pull-to-refresh

**2. Push Notifications:**
- Expo Notifications
- FCM integration
- Local notifications
- Deep linking

**3. Notification Types:**
- Trading alerts (pattern detected)
- Social (post reply, like)
- System (tier renewal, updates)
- Messages (DM)

═══════════════════════════════════════════════════════════
SETUP EXPO NOTIFICATIONS
═══════════════════════════════════════════════════════════

```bash
# Install Expo Notifications
npx expo install expo-notifications expo-device

# Configure in app.json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#FFBD59"
        }
      ]
    ]
  }
}
```

═══════════════════════════════════════════════════════════
SCREEN STRUCTURE
═══════════════════════════════════════════════════════════

```
src/screens/Notifications/
├── NotificationsScreen.js    (Main screen)
├── NotificationDetailScreen.js (Detail if needed)
├── components/
│   ├── NotificationCard.js   (Notification item)
│   ├── CategoryTabs.js       (Filter tabs)
│   └── EmptyState.js         (No notifications)
└── services/
    └── notificationService.js (Push setup)
```

═══════════════════════════════════════════════════════════
MAIN SCREEN CODE
═══════════════════════════════════════════════════════════

```javascript
// src/screens/Notifications/NotificationsScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase } from '../../services/supabaseClient';
import NotificationCard from './components/NotificationCard';
import CategoryTabs from './components/CategoryTabs';
import { COLORS, SPACING } from '../../utils/designTokens';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [category, setCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    setupPushNotifications();
  }, [category]);

  const setupPushNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission not granted');
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync();
      console.log('Push token:', token.data);

      // Save token to database
      await supabase
        .from('user_devices')
        .upsert({
          user_id: supabase.auth.user().id,
          push_token: token.data,
        });

    } catch (error) {
      console.error('Error setting up push:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (id) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const renderNotification = ({ item }) => (
    <NotificationCard
      notification={item}
      onPress={() => {
        markAsRead(item.id);
        handleDeepLink(item);
      }}
      onDelete={() => deleteNotification(item.id)}
    />
  );

  const handleDeepLink = (notification) => {
    // Deep link based on type
    switch (notification.type) {
      case 'pattern_alert':
        navigation.navigate('Trading');
        break;
      case 'post_reply':
        navigation.navigate('PostDetail', { postId: notification.data.post_id });
        break;
      case 'message':
        navigation.navigate('Chat', { userId: notification.data.sender_id });
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <CategoryTabs
        selected={category}
        onSelect={setCategory}
      />

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gold}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgOffWhite,  // Light theme
  },
  list: {
    padding: SPACING.lg,                 // 16px
  },
});

export default NotificationsScreen;
```

═══════════════════════════════════════════════════════════
VALIDATION CHECKLIST
═══════════════════════════════════════════════════════════

**✅ Features:**
- [ ] Notification list working
- [ ] Category filter working
- [ ] Mark as read working
- [ ] Swipe to delete
- [ ] Pull-to-refresh
- [ ] Push notifications setup
- [ ] Deep linking working
- [ ] Badge count on tab

**✅ Push Setup:**
- [ ] Expo Notifications installed
- [ ] Permissions requested
- [ ] Token saved to database
- [ ] Test notification works
- [ ] Local notifications working

REPORT COMPLETION!
```

---

# 💰 WEEK 8: ACCOUNT TAB (TÀI SẢN) IMPLEMENTATION

## 📋 PROMPT - WEEK 8

```markdown
NHIỆM VỤ: Implement Account Tab (Tài Sản)
TUẦN: 8
MỤC TIÊU: Complete user profile + portfolio + tools access

═══════════════════════════════════════════════════════════
KEY FEATURES
═══════════════════════════════════════════════════════════

**1. Profile Section:**
- User avatar
- Display name
- Email
- TIER badge
- Level badge
- Edit profile button

**2. Stats Cards:**
- Trading stats (win rate, total trades)
- Portfolio value (P&L, today's change)
- Community stats (posts, followers)

**3. Quick Actions Grid:**
Row 1: Portfolio, Trading Journal, Tools
Row 2: Settings, Affiliate, Upgrade TIER
Row 3: Achievements, Events, Messages
Row 4: Analytics, My Courses, My Orders

**4. Screens:**
- Profile edit
- Settings
- Affiliate dashboard
- Tools list (18 tools)
- Trading journal

═══════════════════════════════════════════════════════════
SCREEN STRUCTURE
═══════════════════════════════════════════════════════════

```
src/screens/Account/
├── AccountScreen.js          (Main screen)
├── ProfileEditScreen.js      (Edit profile)
├── SettingsScreen.js         (Settings)
├── AffiliateScreen.js        (Affiliate dashboard)
├── ToolsScreen.js            (18 tools list)
├── TradingJournalScreen.js   (Journal)
├── components/
│   ├── ProfileCard.js        (User profile)
│   ├── StatsCard.js          (Stats display)
│   ├── QuickActionGrid.js    (Action buttons)
│   └── TierBadge.js          (TIER indicator)
└── styles/
    └── accountStyles.js
```

═══════════════════════════════════════════════════════════
MAIN SCREEN CODE
═══════════════════════════════════════════════════════════

```javascript
// src/screens/Account/AccountScreen.js

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
} from 'react-native';
import { supabase } from '../../services/supabaseClient';
import ProfileCard from './components/ProfileCard';
import StatsCard from './components/StatsCard';
import QuickActionGrid from './components/QuickActionGrid';
import { COLORS, SPACING } from '../../utils/designTokens';

const AccountScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    trading: { winRate: 0, totalTrades: 0 },
    portfolio: { value: 0, change: 0 },
    community: { posts: 0, followers: 0 },
  });

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Load trading stats
      const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', supabase.auth.user().id);

      const wins = trades?.filter(t => t.result === 'win').length || 0;
      const total = trades?.length || 0;
      const winRate = total > 0 ? (wins / total) * 100 : 0;

      // Load portfolio
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', supabase.auth.user().id)
        .single();

      // Load community stats
      const { count: postsCount } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', supabase.auth.user().id);

      const { count: followersCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', supabase.auth.user().id);

      setStats({
        trading: { winRate, totalTrades: total },
        portfolio: { 
          value: portfolio?.total_value || 0,
          change: portfolio?.today_change || 0,
        },
        community: { 
          posts: postsCount || 0,
          followers: followersCount || 0,
        },
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const quickActions = [
    { id: '1', icon: 'chart-bar', label: 'Portfolio', screen: 'Portfolio' },
    { id: '2', icon: 'book', label: 'Journal', screen: 'TradingJournal' },
    { id: '3', icon: 'tools', label: 'Tools', screen: 'Tools' },
    { id: '4', icon: 'cog', label: 'Settings', screen: 'Settings' },
    { id: '5', icon: 'users', label: 'Affiliate', screen: 'Affiliate' },
    { id: '6', icon: 'star', label: 'Upgrade', screen: 'Upgrade' },
    { id: '7', icon: 'trophy', label: 'Achievements', screen: 'Achievements' },
    { id: '8', icon: 'calendar', label: 'Events', screen: 'Events' },
    { id: '9', icon: 'message-circle', label: 'Messages', screen: 'Messages' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Profile */}
      <ProfileCard
        user={user}
        onEdit={() => navigation.navigate('ProfileEdit')}
      />

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatsCard
          title="Trading"
          stats={stats.trading}
        />
        <StatsCard
          title="Portfolio"
          stats={stats.portfolio}
        />
        <StatsCard
          title="Community"
          stats={stats.community}
        />
      </View>

      {/* Quick Actions */}
      <QuickActionGrid
        actions={quickActions}
        onPress={(screen) => navigation.navigate(screen)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  content: {
    padding: SPACING.lg,             // 16px
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,                 // 12px
    marginTop: SPACING.lg,           // 16px
  },
});

export default AccountScreen;
```

═══════════════════════════════════════════════════════════
VALIDATION CHECKLIST
═══════════════════════════════════════════════════════════

**✅ Features:**
- [ ] Profile display working
- [ ] Stats cards showing correct data
- [ ] Quick actions grid (3x3)
- [ ] Edit profile working
- [ ] Settings screen
- [ ] Affiliate dashboard
- [ ] Tools list (18 tools)
- [ ] Trading journal
- [ ] Logout working

**✅ Data:**
- [ ] User data loading
- [ ] Trading stats calculating
- [ ] Portfolio value updating
- [ ] Community stats accurate

**✅ Navigation:**
- [ ] All quick actions navigate correctly
- [ ] Back navigation working
- [ ] Tab bar hidden on sub-screens

REPORT COMPLETION WITH ALL WEEK 4-8 FEATURES!
```

---

# 🎯 FINAL SUMMARY

**Week 3:** ✅ Forum/Home
**Week 4:** ✅ Shop  
**Week 5:** ✅ Scanner/Trading
**Week 6:** ✅ Gemral (was Chatbot)
**Week 7:** ✅ Notifications
**Week 8:** ✅ Account/Tài Sản

**ALL PROMPTS READY FOR CLAUDE CODE! 🚀**
