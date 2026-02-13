# 🛍️ SUPPLEMENT: SHOPIFY PRODUCT INTEGRATION & MARKETING LOGIC

**Bổ sung cho:** KẾ HOẠCH MERGE INTERACTIVE DASHBOARD  
**Version:** 1.1  
**Date:** 19 November 2025

---

## 🎯 NGUYÊN TẮC MARKETING QUAN TRỌNG

### **1. Luôn Recommend Sản Phẩm Thực**
```
❌ KHÔNG BAO GIỜ:
- Recommend crystals không có trong shop
- Suggest courses không có sẵn
- Link đến competitor products

✅ LUÔN LUÔN:
- Chỉ recommend products từ YinYangMasters + GEM shop
- Link trực tiếp đến Shopify product pages
- Show real prices, real inventory
- Track affiliate commissions
```

### **2. Marketing Opportunity**
```
AI responses = Sales opportunities!

Mọi context đều có thể recommend:
- 💎 Crystals (YinYangMasters shop)
- 📚 Courses (GEM Academy)
- 🔍 Scanner upgrade (if user FREE/TIER1)
- 🤝 Affiliate program
```

---

## 📦 SHOPIFY PRODUCT DATABASE

### **New Tables for Products**

```sql
-- File: supabase/migrations/20250121_shopify_products.sql

-- ============================================
-- SHOPIFY PRODUCTS SYNC
-- ============================================

-- Crystals from YinYangMasters
CREATE TABLE shopify_crystals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Shopify data
  shopify_product_id TEXT UNIQUE NOT NULL,
  shopify_variant_id TEXT,
  
  -- Product info
  name_vi TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  short_description TEXT,
  
  -- Crystal properties
  crystal_type TEXT, -- AMETHYST, CITRINE, ROSE_QUARTZ, etc.
  chakra TEXT[], -- ['ROOT', 'SACRAL', 'SOLAR_PLEXUS']
  properties TEXT[], -- ['stress_relief', 'abundance', 'love']
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  currency TEXT DEFAULT 'VND',
  
  -- Availability
  in_stock BOOLEAN DEFAULT TRUE,
  inventory_quantity INTEGER DEFAULT 0,
  
  -- URLs
  product_url TEXT NOT NULL,
  image_url TEXT,
  
  -- Metadata
  vendor TEXT DEFAULT 'YinYangMasters',
  tags TEXT[],
  
  -- Sync
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses from GEM Academy
CREATE TABLE shopify_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Shopify data
  shopify_product_id TEXT UNIQUE NOT NULL,
  
  -- Course info
  title_vi TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  instructor TEXT DEFAULT 'Jennie Chu',
  
  -- Course category
  category TEXT, -- FREQUENCY_TRADING, MANIFESTATION, MINDSET
  level TEXT, -- BEGINNER, INTERMEDIATE, ADVANCED
  duration_days INTEGER,
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  currency TEXT DEFAULT 'VND',
  
  -- URLs
  course_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Tevello LMS data (if applicable)
  tevello_course_id TEXT,
  
  -- Metadata
  tags TEXT[],
  
  -- Sync
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bundle offers
CREATE TABLE bundle_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Bundle info
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT, -- TIER1, TIER2, TIER3
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  savings DECIMAL(10,2),
  currency TEXT DEFAULT 'VND',
  
  -- What's included
  scanner_access TEXT, -- 'PRO_12_MONTHS', 'PREMIUM_12_MONTHS'
  chatbot_access TEXT, -- 'PRO_12_MONTHS', 'UNLIMITED_24_MONTHS'
  courses_included TEXT[], -- Array of course IDs
  
  -- URLs
  purchase_url TEXT NOT NULL,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0, -- Higher = show first
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_crystals_type ON shopify_crystals(crystal_type);
CREATE INDEX idx_crystals_properties ON shopify_crystals USING gin(properties);
CREATE INDEX idx_crystals_in_stock ON shopify_crystals(in_stock);

CREATE INDEX idx_courses_category ON shopify_courses(category);
CREATE INDEX idx_courses_price ON shopify_courses(price);

CREATE INDEX idx_bundles_tier ON bundle_offers(tier);
CREATE INDEX idx_bundles_active ON bundle_offers(is_active, priority);

-- ============================================
-- PRODUCT RECOMMENDATIONS TRACKING
-- ============================================

CREATE TABLE product_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Source
  recommended_in_chat_id UUID REFERENCES chatbot_history(id),
  recommendation_context TEXT, -- What AI was talking about
  
  -- Product
  product_type TEXT NOT NULL, -- CRYSTAL, COURSE, BUNDLE, SCANNER_UPGRADE
  product_id UUID,
  shopify_product_id TEXT,
  
  -- User action
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ,
  purchased BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ,
  
  -- Affiliate tracking
  affiliate_code TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendations_user ON product_recommendations(user_id);
CREATE INDEX idx_recommendations_product ON product_recommendations(product_type, product_id);
CREATE INDEX idx_recommendations_conversion ON product_recommendations(clicked, purchased);

-- RLS Policies
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON product_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON product_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🔄 SHOPIFY SYNC SERVICE

### **Auto-sync Products from Shopify**

```javascript
// File: src/services/shopifySync.js

import { supabase } from '../config/supabaseClient';

const SHOPIFY_STORE_URL = process.env.VITE_SHOPIFY_STORE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.VITE_SHOPIFY_ACCESS_TOKEN;

export class ShopifySync {
  
  /**
   * Sync all crystals from YinYangMasters collection
   */
  static async syncCrystals() {
    try {
      // Fetch products from Shopify
      const response = await fetch(
        `${SHOPIFY_STORE_URL}/admin/api/2024-01/products.json?collection_id=${YINYANG_COLLECTION_ID}`,
        {
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
          }
        }
      );
      
      const { products } = await response.json();
      
      // Process each product
      for (const product of products) {
        const crystalData = this.parseCrystalProduct(product);
        
        // Upsert to database
        await supabase
          .from('shopify_crystals')
          .upsert({
            shopify_product_id: product.id.toString(),
            ...crystalData,
            last_synced_at: new Date().toISOString()
          }, {
            onConflict: 'shopify_product_id'
          });
      }
      
      console.log(`✅ Synced ${products.length} crystals`);
      return { success: true, count: products.length };
      
    } catch (error) {
      console.error('Error syncing crystals:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Parse Shopify product to crystal data
   */
  static parseCrystalProduct(product) {
    // Extract crystal properties from tags
    const tags = product.tags.split(',').map(t => t.trim());
    
    // Detect crystal type
    const crystalType = this.detectCrystalType(product.title);
    
    // Extract chakras from tags
    const chakras = tags.filter(tag => 
      ['ROOT', 'SACRAL', 'SOLAR_PLEXUS', 'HEART', 'THROAT', 'THIRD_EYE', 'CROWN']
        .includes(tag.toUpperCase())
    );
    
    // Extract properties from tags
    const properties = tags.filter(tag =>
      ['stress_relief', 'abundance', 'love', 'protection', 'healing', 'confidence']
        .includes(tag.toLowerCase().replace(/\s+/g, '_'))
    );
    
    return {
      name_vi: product.title,
      name_en: product.variants[0]?.title || product.title,
      description: product.body_html || '',
      short_description: this.extractShortDescription(product.body_html),
      crystal_type: crystalType,
      chakra: chakras,
      properties: properties,
      price: parseFloat(product.variants[0]?.price || 0),
      compare_at_price: parseFloat(product.variants[0]?.compare_at_price || 0),
      in_stock: product.variants[0]?.inventory_quantity > 0,
      inventory_quantity: product.variants[0]?.inventory_quantity || 0,
      product_url: `${SHOPIFY_STORE_URL}/products/${product.handle}`,
      image_url: product.images[0]?.src || null,
      vendor: product.vendor,
      tags: tags
    };
  }
  
  /**
   * Detect crystal type from product title
   */
  static detectCrystalType(title) {
    const titleLower = title.toLowerCase();
    
    const crystalTypes = {
      'amethyst': 'AMETHYST',
      'thạch anh tím': 'AMETHYST',
      'citrine': 'CITRINE',
      'thạch anh vàng': 'CITRINE',
      'rose quartz': 'ROSE_QUARTZ',
      'thạch anh hồng': 'ROSE_QUARTZ',
      'black tourmaline': 'BLACK_TOURMALINE',
      'mã não đen': 'BLACK_TOURMALINE',
      'clear quartz': 'CLEAR_QUARTZ',
      'thạch anh trắng': 'CLEAR_QUARTZ',
      'tiger': 'TIGERS_EYE',
      'mắt hổ': 'TIGERS_EYE',
      'pyrite': 'PYRITE',
      'vàng giả': 'PYRITE',
      'selenite': 'SELENITE',
      'thạch cao': 'SELENITE'
    };
    
    for (const [keyword, type] of Object.entries(crystalTypes)) {
      if (titleLower.includes(keyword)) {
        return type;
      }
    }
    
    return 'OTHER';
  }
  
  /**
   * Sync courses from GEM Academy
   */
  static async syncCourses() {
    try {
      const response = await fetch(
        `${SHOPIFY_STORE_URL}/admin/api/2024-01/products.json?collection_id=${GEM_COURSES_COLLECTION_ID}`,
        {
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
          }
        }
      );
      
      const { products } = await response.json();
      
      for (const product of products) {
        const courseData = this.parseCourseProduct(product);
        
        await supabase
          .from('shopify_courses')
          .upsert({
            shopify_product_id: product.id.toString(),
            ...courseData,
            last_synced_at: new Date().toISOString()
          }, {
            onConflict: 'shopify_product_id'
          });
      }
      
      console.log(`✅ Synced ${products.length} courses`);
      return { success: true, count: products.length };
      
    } catch (error) {
      console.error('Error syncing courses:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Parse Shopify product to course data
   */
  static parseCourseProduct(product) {
    const tags = product.tags.split(',').map(t => t.trim());
    
    // Detect category from tags
    let category = 'OTHER';
    if (tags.some(t => t.toLowerCase().includes('frequency') || t.toLowerCase().includes('tần số'))) {
      category = 'FREQUENCY_TRADING';
    } else if (tags.some(t => t.toLowerCase().includes('manifestation') || t.toLowerCase().includes('hiện thực'))) {
      category = 'MANIFESTATION';
    } else if (tags.some(t => t.toLowerCase().includes('mindset') || t.toLowerCase().includes('tư duy'))) {
      category = 'MINDSET';
    }
    
    // Detect level
    let level = 'BEGINNER';
    if (tags.some(t => t.toLowerCase().includes('advanced') || t.toLowerCase().includes('nâng cao'))) {
      level = 'ADVANCED';
    } else if (tags.some(t => t.toLowerCase().includes('intermediate'))) {
      level = 'INTERMEDIATE';
    }
    
    return {
      title_vi: product.title,
      description: product.body_html || '',
      instructor: 'Jennie Chu',
      category: category,
      level: level,
      duration_days: this.extractDurationFromTitle(product.title),
      price: parseFloat(product.variants[0]?.price || 0),
      compare_at_price: parseFloat(product.variants[0]?.compare_at_price || 0),
      course_url: `${SHOPIFY_STORE_URL}/products/${product.handle}`,
      thumbnail_url: product.images[0]?.src || null,
      tags: tags
    };
  }
  
  /**
   * Extract duration from course title (e.g., "7 NGÀY..." → 7)
   */
  static extractDurationFromTitle(title) {
    const match = title.match(/(\d+)\s*(ngày|day)/i);
    return match ? parseInt(match[1]) : null;
  }
  
  /**
   * Populate bundle offers (hardcoded as per pricing structure)
   */
  static async populateBundles() {
    const bundles = [
      {
        name: 'TIER 1 Bundle',
        description: 'Scanner PRO 12 tháng + Chatbot PRO 12 tháng miễn phí',
        tier: 'TIER1',
        price: 11000000,
        original_price: 11964000,
        savings: 964000,
        scanner_access: 'PRO_12_MONTHS',
        chatbot_access: 'PRO_12_MONTHS',
        courses_included: [],
        purchase_url: `${SHOPIFY_STORE_URL}/products/tier-1-bundle`,
        is_active: true,
        priority: 3
      },
      {
        name: 'TIER 2 Bundle',
        description: 'Scanner PREMIUM 12 tháng + Chatbot PREMIUM 12 tháng miễn phí',
        tier: 'TIER2',
        price: 21000000,
        original_price: 25152000,
        savings: 4152000,
        scanner_access: 'PREMIUM_12_MONTHS',
        chatbot_access: 'PREMIUM_12_MONTHS',
        courses_included: [],
        purchase_url: `${SHOPIFY_STORE_URL}/products/tier-2-bundle`,
        is_active: true,
        priority: 2
      },
      {
        name: 'TIER 3 VIP Bundle',
        description: 'Scanner VIP 24 tháng + Chatbot UNLIMITED 24 tháng',
        tier: 'TIER3',
        price: 68000000,
        original_price: 143928000,
        savings: 75928000,
        scanner_access: 'VIP_24_MONTHS',
        chatbot_access: 'UNLIMITED_24_MONTHS',
        courses_included: [],
        purchase_url: `${SHOPIFY_STORE_URL}/products/tier-3-vip-bundle`,
        is_active: true,
        priority: 1
      }
    ];
    
    for (const bundle of bundles) {
      await supabase
        .from('bundle_offers')
        .upsert(bundle, {
          onConflict: 'tier'
        });
    }
    
    console.log('✅ Populated bundle offers');
  }
  
  /**
   * Run full sync (crystals + courses + bundles)
   */
  static async syncAll() {
    console.log('🔄 Starting Shopify sync...');
    
    await this.syncCrystals();
    await this.syncCourses();
    await this.populateBundles();
    
    console.log('✅ Shopify sync complete!');
  }
}

// Sync every 6 hours
setInterval(() => {
  ShopifySync.syncAll();
}, 6 * 60 * 60 * 1000);
```

---

## 🧠 SMART PRODUCT RECOMMENDATION ENGINE

### **AI Always Recommends Real Products**

```javascript
// File: src/services/productRecommendation.js

import { supabase } from '../config/supabaseClient';

export class ProductRecommendationEngine {
  
  /**
   * Get crystal recommendations based on user's needs
   */
  static async getCrystalRecommendations(context) {
    // Determine what properties user needs
    const neededProperties = this.analyzeUserNeeds(context);
    
    // Query database for matching crystals
    const { data: crystals } = await supabase
      .from('shopify_crystals')
      .select('*')
      .eq('in_stock', true)
      .overlaps('properties', neededProperties)
      .order('price', { ascending: true })
      .limit(3);
    
    return crystals || [];
  }
  
  /**
   * Analyze user needs from context
   */
  static analyzeUserNeeds(context) {
    const { userMessage, detectedIssues } = context;
    const messageLower = userMessage.toLowerCase();
    
    const needsMap = {
      stress: ['stress_relief', 'calming'],
      anxiety: ['stress_relief', 'calming', 'protection'],
      money: ['abundance', 'prosperity'],
      income: ['abundance', 'prosperity'],
      passive: ['abundance', 'prosperity'],
      love: ['love', 'relationships'],
      relationship: ['love', 'relationships'],
      health: ['healing', 'vitality'],
      confidence: ['confidence', 'self_esteem'],
      focus: ['focus', 'clarity'],
      protection: ['protection', 'grounding'],
      energy: ['vitality', 'energy_boost']
    };
    
    let neededProperties = [];
    
    for (const [keyword, properties] of Object.entries(needsMap)) {
      if (messageLower.includes(keyword)) {
        neededProperties.push(...properties);
      }
    }
    
    // Default: abundance (always good to suggest!)
    if (neededProperties.length === 0) {
      neededProperties = ['abundance', 'prosperity'];
    }
    
    return [...new Set(neededProperties)]; // Remove duplicates
  }
  
  /**
   * Get course recommendations based on user tier & interests
   */
  static async getCourseRecommendations(userTier, context) {
    let recommendedCategories = [];
    
    // Based on what user is talking about
    if (context.includes('trading') || context.includes('trade')) {
      recommendedCategories.push('FREQUENCY_TRADING');
    }
    if (context.includes('manifest') || context.includes('mục tiêu')) {
      recommendedCategories.push('MANIFESTATION');
    }
    if (context.includes('mindset') || context.includes('tư duy')) {
      recommendedCategories.push('MINDSET');
    }
    
    // Default: Show all
    if (recommendedCategories.length === 0) {
      recommendedCategories = ['FREQUENCY_TRADING', 'MANIFESTATION', 'MINDSET'];
    }
    
    const { data: courses } = await supabase
      .from('shopify_courses')
      .select('*')
      .in('category', recommendedCategories)
      .order('price', { ascending: true })
      .limit(3);
    
    return courses || [];
  }
  
  /**
   * Check if user should see scanner upgrade offer
   */
  static shouldShowScannerUpgrade(userTier) {
    // Only show to FREE and TIER1 users
    return ['FREE', 'TIER1'].includes(userTier);
  }
  
  /**
   * Get appropriate bundle offer for user
   */
  static async getBundleOffer(userCurrentTier) {
    // Suggest next tier up
    const suggestedTier = {
      'FREE': 'TIER1',
      'TIER1': 'TIER2',
      'TIER2': 'TIER3',
      'TIER3': null // Already at max
    }[userCurrentTier];
    
    if (!suggestedTier) return null;
    
    const { data: bundle } = await supabase
      .from('bundle_offers')
      .select('*')
      .eq('tier', suggestedTier)
      .eq('is_active', true)
      .single();
    
    return bundle;
  }
  
  /**
   * Format crystal recommendation for AI response
   */
  static formatCrystalRecommendation(crystals) {
    if (!crystals || crystals.length === 0) {
      return '';
    }
    
    let text = '\n\n💎 **CRYSTAL RECOMMENDATIONS:**\n\n';
    
    crystals.forEach((crystal, index) => {
      const label = ['Primary', 'Secondary', 'Support'][index] || `Option ${index + 1}`;
      
      text += `**${label}: ${crystal.name_vi}**\n`;
      text += `• Purpose: ${crystal.properties.join(', ')}\n`;
      text += `• Price: ${this.formatPrice(crystal.price)}\n`;
      text += `• [Xem sản phẩm](${crystal.product_url})\n\n`;
    });
    
    text += '🛍️ *Shop YinYangMasters - Chất lượng đảm bảo từ Gemral*\n';
    
    return text;
  }
  
  /**
   * Format course recommendation for AI response
   */
  static formatCourseRecommendation(courses) {
    if (!courses || courses.length === 0) {
      return '';
    }
    
    let text = '\n\n📚 **KHÓA HỌC ĐỀ XUẤT:**\n\n';
    
    courses.forEach((course) => {
      text += `**${course.title_vi}**\n`;
      text += `• Level: ${course.level}\n`;
      if (course.duration_days) {
        text += `• Duration: ${course.duration_days} ngày\n`;
      }
      text += `• Price: ${this.formatPrice(course.price)}\n`;
      text += `• [Đăng ký ngay](${course.course_url})\n\n`;
    });
    
    text += '🎓 *GEM Academy - Phương pháp trading độc quyền*\n';
    
    return text;
  }
  
  /**
   * Format bundle offer for AI response
   */
  static formatBundleOffer(bundle) {
    if (!bundle) return '';
    
    const savingsPercent = ((bundle.savings / bundle.original_price) * 100).toFixed(0);
    
    let text = '\n\n🎁 **ƯU ĐÃI ĐẶC BIỆT CHO BẠN:**\n\n';
    text += `**${bundle.name}**\n`;
    text += `${bundle.description}\n\n`;
    text += `• Giá gốc: ~~${this.formatPrice(bundle.original_price)}~~\n`;
    text += `• Giá ưu đãi: **${this.formatPrice(bundle.price)}**\n`;
    text += `• 🎉 Tiết kiệm: ${this.formatPrice(bundle.savings)} (${savingsPercent}%)\n\n`;
    text += `[🚀 Nâng cấp ngay](${bundle.purchase_url})\n`;
    
    return text;
  }
  
  /**
   * Format affiliate program info
   */
  static formatAffiliateInfo() {
    return `\n\n🤝 **CHƯƠNG TRÌNH ĐỐI TÁC:**\n\n` +
           `Tham gia ngay để nhận hoa hồng:\n` +
           `• Cấp 1 (Beginner): 10% hoa hồng\n` +
           `• Cấp 2 (Growing): 15% hoa hồng\n` +
           `• Cấp 3 (Master): 20% hoa hồng\n` +
           `• Cấp 4 (Grand): 30% hoa hồng\n\n` +
           `💰 Thu nhập thụ động từ mỗi học viên mới!\n` +
           `[Đăng ký Partnership](${process.env.VITE_AFFILIATE_SIGNUP_URL})\n`;
  }
  
  /**
   * Helper: Format price
   */
  static formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  }
  
  /**
   * Track recommendation (for analytics)
   */
  static async trackRecommendation(userId, chatId, productType, productId) {
    await supabase
      .from('product_recommendations')
      .insert({
        user_id: userId,
        recommended_in_chat_id: chatId,
        product_type: productType,
        product_id: productId,
        recommendation_context: 'AI_CHAT'
      });
  }
}
```

---

## 🎯 UPDATED SYSTEM PROMPT

### **AI với Product Recommendations**

```javascript
// File: src/config/systemPrompts.js (UPDATED)

export const ENHANCED_SYSTEM_PROMPT = `
Bạn là Gemral - hệ thống hỗ trợ manifestation, trading và wellness toàn diện.

## QUAN TRỌNG: PRODUCT RECOMMENDATIONS

### 1. LUÔN RECOMMEND CRYSTALS
Trong MỌI context phù hợp, bạn PHẢI recommend crystals từ shop YinYangMasters.

**Khi nào recommend:**
- User mention stress, anxiety, worry → Stress relief crystals
- User mention money, income, financial goals → Abundance crystals
- User mention love, relationships → Love crystals
- User mention confidence, self-esteem → Confidence crystals
- User mention protection, safety → Protection crystals
- DEFAULT: Always suggest abundance crystals (Citrine, Pyrite)

**Format:**
💎 CRYSTAL RECOMMENDATIONS:
- Primary: [Crystal Name]
  • Purpose: [Properties]
  • Price: [Price]
  • Link: [Product URL]

[Repeat for 2-3 crystals]

🛍️ Shop YinYangMasters - Chất lượng đảm bảo từ Gemral

### 2. RECOMMEND COURSES (Khi phù hợp)
**Frequency Trading Courses:**
- User hỏi về trading strategy
- User muốn học pattern
- User có loss streak

**Manifestation Courses:**
- User có big goals
- User muốn improve mindset
- User hỏi về law of attraction

**Mindset Courses:**
- User mention limiting beliefs
- User có confidence issues
- User muốn mindset shift

**Available Courses:**
1. Khóa Frequency Trading - 1.990.000đ
2. Kích Hoạt Tần Số Tình Yêu - 399.000đ
3. Tái Tạo Tư Duy Triệu Phú - 499.000đ

### 3. BUNDLE OFFERS (Khi user chưa ở tier cao)
**Nếu user là FREE:**
→ Suggest TIER 1 Bundle (11 triệu)
- Scanner PRO 12 tháng
- Chatbot PRO 12 tháng miễn phí
- Tiết kiệm 964.000đ

**Nếu user là TIER1:**
→ Suggest TIER 2 Bundle (21 triệu)
- Scanner PREMIUM 12 tháng
- Chatbot PREMIUM 12 tháng
- Tiết kiệm 4.152.000đ

**Nếu user là TIER2:**
→ Suggest TIER 3 VIP (68 triệu)
- Scanner VIP 24 tháng
- Chatbot UNLIMITED 24 tháng
- Tiết kiệm 75.928.000đ

### 4. AFFILIATE PROGRAM
**Khi mention:**
- User hỏi về kiếm tiền
- User hỏi về passive income
- User có network/influence

**Info:**
🤝 CHƯƠNG TRÌNH ĐỐI TÁC:
- Cấp 1: 10% hoa hồng
- Cấp 2: 15% hoa hồng
- Cấp 3: 20% hoa hồng
- Cấp 4: 30% hoa hồng

💰 Thu nhập thụ động từ mỗi học viên mới!

## TONE & STYLE
- Không bao giờ nói "AI", "tôi là AI", "Claude"
- Luôn nói: "Gemral phân tích...", "Dựa trên data..."
- Natural, không pushy
- Authentic recommendations (chỉ suggest khi relevant)

## RESPONSE STRUCTURE
1. Answer user's question directly
2. Add relevant product recommendations
3. Include call-to-action links
4. Track recommendations for analytics

Remember: Every response is a sales opportunity, but maintain authenticity!
`;
```

---

## 🔄 UPDATED DATA EXTRACTOR

### **Extract Products from AI Response**

```javascript
// File: src/services/dataExtractor.js (ADD THIS METHOD)

/**
 * Extract recommended products from AI response
 */
extractRecommendedProducts(aiResponse) {
  const products = {
    crystals: [],
    courses: [],
    bundles: [],
    scannerUpgrade: false,
    affiliateProgram: false
  };
  
  // Extract crystal recommendations
  const crystalSection = aiResponse.match(/💎.*?CRYSTAL RECOMMENDATIONS:.*?(?=\n\n|$)/s);
  if (crystalSection) {
    // Parse crystal links
    const crystalLinks = aiResponse.match(/\[Xem sản phẩm\]\((.*?)\)/g);
    if (crystalLinks) {
      products.crystals = crystalLinks.map(link => {
        const url = link.match(/\((.*?)\)/)[1];
        return { type: 'CRYSTAL', url };
      });
    }
  }
  
  // Extract course recommendations
  const courseSection = aiResponse.match(/📚.*?KHÓA HỌC.*?(?=\n\n|$)/s);
  if (courseSection) {
    const courseLinks = aiResponse.match(/\[Đăng ký ngay\]\((.*?)\)/g);
    if (courseLinks) {
      products.courses = courseLinks.map(link => {
        const url = link.match(/\((.*?)\)/)[1];
        return { type: 'COURSE', url };
      });
    }
  }
  
  // Check for bundle offer
  if (aiResponse.includes('ƯU ĐÃI ĐẶC BIỆT') || aiResponse.includes('Bundle')) {
    products.bundles = [{
      type: 'BUNDLE',
      url: aiResponse.match(/\[🚀 Nâng cấp ngay\]\((.*?)\)/)?.[1]
    }];
  }
  
  // Check for scanner upgrade
  if (aiResponse.includes('Scanner') && aiResponse.includes('Nâng cấp')) {
    products.scannerUpgrade = true;
  }
  
  // Check for affiliate program
  if (aiResponse.includes('ĐỐI TÁC') || aiResponse.includes('hoa hồng')) {
    products.affiliateProgram = true;
  }
  
  return products;
}
```

---

## 📊 ANALYTICS & TRACKING

### **Track Product Recommendations Performance**

```javascript
// File: src/services/analytics.js

export class ProductAnalytics {
  
  /**
   * Track when product is recommended
   */
  static async trackRecommendation(userId, chatId, products) {
    // Track each product type
    for (const crystal of products.crystals) {
      await supabase.from('product_recommendations').insert({
        user_id: userId,
        recommended_in_chat_id: chatId,
        product_type: 'CRYSTAL',
        product_id: this.extractProductIdFromUrl(crystal.url)
      });
    }
    
    for (const course of products.courses) {
      await supabase.from('product_recommendations').insert({
        user_id: userId,
        recommended_in_chat_id: chatId,
        product_type: 'COURSE',
        product_id: this.extractProductIdFromUrl(course.url)
      });
    }
    
    // Track bundle recommendations
    if (products.bundles.length > 0) {
      await supabase.from('product_recommendations').insert({
        user_id: userId,
        recommended_in_chat_id: chatId,
        product_type: 'BUNDLE'
      });
    }
  }
  
  /**
   * Track when user clicks product link
   */
  static async trackClick(recommendationId) {
    await supabase
      .from('product_recommendations')
      .update({
        clicked: true,
        clicked_at: new Date().toISOString()
      })
      .eq('id', recommendationId);
  }
  
  /**
   * Track purchase (webhook from Shopify)
   */
  static async trackPurchase(userId, shopifyProductId) {
    await supabase
      .from('product_recommendations')
      .update({
        purchased: true,
        purchased_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('shopify_product_id', shopifyProductId)
      .is('purchased', false);
  }
  
  /**
   * Get conversion metrics
   */
  static async getConversionMetrics(timeframe = '30 days') {
    const { data } = await supabase
      .from('product_recommendations')
      .select('product_type, clicked, purchased')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    const metrics = {
      CRYSTAL: { recommended: 0, clicked: 0, purchased: 0 },
      COURSE: { recommended: 0, clicked: 0, purchased: 0 },
      BUNDLE: { recommended: 0, clicked: 0, purchased: 0 }
    };
    
    data.forEach(rec => {
      const type = rec.product_type;
      metrics[type].recommended++;
      if (rec.clicked) metrics[type].clicked++;
      if (rec.purchased) metrics[type].purchased++;
    });
    
    // Calculate rates
    Object.keys(metrics).forEach(type => {
      const m = metrics[type];
      m.clickRate = m.recommended > 0 ? (m.clicked / m.recommended * 100).toFixed(1) : 0;
      m.conversionRate = m.clicked > 0 ? (m.purchased / m.clicked * 100).toFixed(1) : 0;
    });
    
    return metrics;
  }
}
```

---

## 🎯 UPDATED IMPLEMENTATION TIMELINE

### **Add to Week 2 (Day 3-4):**

**New Tasks:**
1. **Shopify Integration**
   - Setup Shopify API credentials
   - Create sync service
   - Run initial sync (crystals + courses)
   - Populate bundle offers

2. **Product Recommendation Engine**
   - Smart crystal matching
   - Course recommendations
   - Bundle offer logic
   - Affiliate program insertion

3. **Updated System Prompts**
   - Add product recommendation rules
   - Marketing guidelines
   - Format templates

4. **Analytics Setup**
   - Product recommendation tracking
   - Click tracking
   - Purchase attribution

---

## ✅ UPDATED DELIVERABLES

### Additional Files:
- ✅ `shopify_crystals` table
- ✅ `shopify_courses` table
- ✅ `bundle_offers` table
- ✅ `product_recommendations` table
- ✅ `src/services/shopifySync.js`
- ✅ `src/services/productRecommendation.js`
- ✅ `src/services/analytics.js`

### Cron Jobs:
- ✅ Sync Shopify products every 6 hours
- ✅ Track click-through rates daily
- ✅ Generate weekly conversion reports

---

## 📈 EXPECTED BUSINESS IMPACT

### Revenue Streams:
1. **Crystal Sales** (YinYangMasters)
   - Conservative: 50 crystals/month × ₫300k avg = ₫15M/month
   - Optimistic: 150 crystals/month × ₫400k avg = ₫60M/month

2. **Course Sales** (GEM Academy)
   - Conservative: 20 courses/month × ₫1M avg = ₫20M/month
   - Optimistic: 60 courses/month × ₫1.5M avg = ₫90M/month

3. **Bundle Upgrades**
   - Conservative: 10 upgrades/month × ₫20M avg = ₫200M/month
   - Optimistic: 30 upgrades/month × ₫30M avg = ₫900M/month

4. **Affiliate Commissions**
   - Conservative: 5 new affiliates/month × ₫2M revenue = ₫10M/month
   - Optimistic: 20 new affiliates/month × ₫5M revenue = ₫100M/month

### Total Monthly Revenue Potential:
- **Conservative:** ₫245M/month (₫2.94B/year)
- **Optimistic:** ₫1.15B/month (₫13.8B/year)

### Conversion Targets:
- Click-through rate: 15-25%
- Purchase rate: 3-8%
- Average order value: ₫800k-2M

---

**Status:** ✅ Ready to Implement  
**Priority:** CRITICAL (Revenue driver!)  
**Integration Time:** +3 days to Week 2

