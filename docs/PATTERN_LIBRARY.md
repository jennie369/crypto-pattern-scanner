# GEM Mobile - UI Pattern Library

> **CRITICAL:** Copy các pattern đã work thay vì viết mới từ đầu.

---

## 1. Modal with Scrollable Content

### ❌ SAI - Pressable blocks scroll
```javascript
// Pressable chặn touch events của ScrollView
<Modal visible={visible}>
  <Pressable style={styles.overlay} onPress={onClose}>
    <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
      <ScrollView>  {/* BỊ CHẶN SCROLL! */}
        {content}
      </ScrollView>
    </Pressable>
  </Pressable>
</Modal>
```

### ✅ ĐÚNG - Tách backdrop và content
```javascript
import { Modal, View, TouchableOpacity, FlatList } from 'react-native';

<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
  <View style={styles.overlay}>
    {/* Backdrop - tap to close */}
    <TouchableOpacity
      style={styles.backdrop}
      activeOpacity={1}
      onPress={onClose}
    />

    {/* Content */}
    <View style={styles.content}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ItemCard item={item} />}
        ListHeaderComponent={HeaderComponent}
        ListFooterComponent={FooterComponent}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  </View>
</Modal>

// Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backdrop: {
    flex: 1,  // Chiếm không gian trên modal
  },
  content: {
    backgroundColor: 'rgba(15, 25, 45, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingTop: SPACING.lg,
  },
  flatListContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl + 40,  // Đủ padding cho bottom
  },
});
```

---

## 2. Bottom Sheet Modal (Slide Up)

### Pattern: ChatbotPricingModal
```javascript
import { Modal, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BottomSheetModal = ({ visible, onClose, data }) => {
  const ListHeader = () => (
    <>
      {/* Header with close button */}
      <View style={styles.header}>
        <Text style={styles.title}>Title</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Status/Info Box */}
      <View style={styles.infoBox}>
        <Text>Info content...</Text>
      </View>
    </>
  );

  const ListFooter = () => (
    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
      <Text style={styles.closeButtonText}>Đóng</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.content}>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <Card item={item} />}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backdrop: {
    flex: 1,
  },
  content: {
    backgroundColor: 'rgba(15, 25, 45, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingTop: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(100, 150, 200, 0.25)',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl + 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: SPACING.md,
    backgroundColor: 'rgba(245, 245, 245, 0.95)',
    borderRadius: 22,
  },
});
```

---

## 3. Full Screen Modal (MindsetCheckModal style)

### Pattern: Solid background modal
```javascript
import { Modal, View, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';

const FullScreenModal = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={90} style={styles.overlay} tint="dark">
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Content here */}
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'rgba(10, 12, 40, 0.98)',  // Solid dark background
    borderRadius: 24,
    padding: SPACING.lg,
    width: '90%',
    maxHeight: '85%',
    borderWidth: 1.5,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
});
```

---

## 4. Collapsible Card Pattern

### Pattern: PaperTradeHistoryScreen
```javascript
import { useState, useCallback } from 'react';
import { LayoutAnimation, Platform, UIManager, TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CollapsibleCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  }, [expanded]);

  return (
    <TouchableOpacity style={styles.card} onPress={toggleExpand} activeOpacity={0.8}>
      {/* Always visible header */}
      <View style={styles.cardHeader}>
        <Text>{item.title}</Text>
        {expanded ? (
          <ChevronUp size={20} color={COLORS.textMuted} />
        ) : (
          <ChevronDown size={20} color={COLORS.textMuted} />
        )}
      </View>

      {/* Expandable content */}
      {expanded && (
        <View style={styles.expandedContent}>
          <Text>{item.details}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
```

---

## 5. List with Sponsor Banner Footer

### Pattern: OpenPositionsScreen / PaperTradeHistoryScreen
```javascript
import SponsorBannerSection from '../components/SponsorBannerSection';

<FlatList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  ListFooterComponent={() => (
    <View style={styles.footerContainer}>
      {/* Optional action button */}
      <TouchableOpacity style={styles.actionButton} onPress={handleAction}>
        <Text>Action Button</Text>
      </TouchableOpacity>

      {/* Sponsor Banner */}
      <SponsorBannerSection
        screenName="screen_name"
        navigation={navigation}
        maxBanners={1}
      />

      {/* Bottom spacer for tab bar */}
      <View style={{ height: 150 }} />
    </View>
  )}
  contentContainerStyle={styles.listContent}
/>

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  footerContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
});
```

---

## 6. WebSocket Price Updates (Race Condition Fix)

### Pattern: ScannerScreen
```javascript
const wsRef = useRef(null);

const subscribeToPrice = (symbol) => {
  // Close existing WebSocket
  if (wsRef.current) {
    wsRef.current.close();
    wsRef.current = null;
  }

  // Reset price while switching
  setCurrentPrice(null);
  setPriceChange(null);

  const ws = new WebSocket(
    `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`
  );

  // Track the symbol this WebSocket is for (prevents race condition)
  const targetSymbol = symbol.toUpperCase();

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // Verify the message is for the correct symbol
      const messageSymbol = data.s?.toUpperCase();
      if (messageSymbol && messageSymbol !== targetSymbol) {
        console.log('Ignoring stale price from:', messageSymbol);
        return;
      }
      setCurrentPrice(parseFloat(data.c));
      setPriceChange(parseFloat(data.P));
    } catch (e) {
      console.error('WebSocket parse error:', e);
    }
  };

  wsRef.current = ws;
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };
}, []);
```

---

## 7. Direct Shopify URL Navigation

### Pattern: ChatbotPricingModal / UpgradeModal
```javascript
// ❌ SAI - API call có thể fail
const handleUpgrade = async (tier) => {
  const result = await shopifyService.createCheckoutForProduct(tier.handle);
  if (result?.checkoutUrl) {
    navigation.navigate('Shop', { screen: 'CheckoutWebView', params: { ... } });
  }
};

// ✅ ĐÚNG - URL trực tiếp, luôn work
const TIERS = [
  {
    id: 'pro',
    name: 'PRO',
    shopifyUrl: 'https://shop.gemcrypto.vn/products/gem-chatbot-pro',
  },
  // ...
];

const handleUpgrade = (tier) => {
  onClose();
  navigation.navigate('Shop', {
    screen: 'CheckoutWebView',
    params: {
      checkoutUrl: tier.shopifyUrl,
      title: `Nâng cấp ${tier.name}`,
      returnScreen: 'Home',
    },
  });
};
```

---

## 8. Number Formatting with Thousand Separators

### Pattern: formatters.js
```javascript
// In utils/formatters.js
const addThousandSeparators = (numStr) => {
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

export const formatPrice = (price, withSeparators = true) => {
  if (price === null || price === undefined || isNaN(price)) return '0';

  let formatted;
  if (price >= 1000) {
    formatted = price.toFixed(2);
  } else if (price >= 1) {
    formatted = price.toFixed(4);
  } else if (price >= 0.0001) {
    formatted = price.toFixed(6);
  } else {
    formatted = price.toFixed(8);
  }

  return withSeparators ? addThousandSeparators(formatted) : formatted;
};

export const formatCurrency = (amount, decimals = 2) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0.00';
  return addThousandSeparators(amount.toFixed(decimals));
};

// Usage
import { formatPrice, formatCurrency } from '../utils/formatters';

<Text>${formatPrice(90363.84)}</Text>     // $90,363.84
<Text>${formatCurrency(1000.50)}</Text>   // $1,000.50
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│                 PATTERN CHEAT SHEET                     │
├─────────────────────────────────────────────────────────┤
│ Modal Scroll    → FlatList + separate backdrop          │
│ Bottom Sheet    → animationType="slide" + flex backdrop │
│ Collapsible     → LayoutAnimation + TouchableOpacity    │
│ List Footer     → SponsorBannerSection + spacer View    │
│ WebSocket       → Track targetSymbol to prevent race    │
│ Shopify Nav     → Direct URL, not API call              │
│ Numbers         → formatPrice() / formatCurrency()      │
└─────────────────────────────────────────────────────────┘
```
