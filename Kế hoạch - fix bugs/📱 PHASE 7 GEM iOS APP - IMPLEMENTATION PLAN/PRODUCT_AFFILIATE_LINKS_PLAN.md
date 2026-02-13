# GEMRAL PRODUCT AFFILIATE LINKS - IMPLEMENTATION PLAN
## Extend Existing System with Shopee-Style Product Sharing

**Based on:** Existing 90% complete affiliate system  
**Goal:** Add product-specific affiliate links (like Shopee)  
**Strategy:** EXTEND existing tables & services, NO duplication

---

## 📊 GAP ANALYSIS

### ✅ WHAT WE HAVE (90%)

```
✅ affiliate_profiles - User affiliate accounts
✅ affiliate_codes - Referral codes (user-based)
✅ affiliate_referrals - User signup tracking
✅ affiliate_sales - Sales tracking
✅ affiliate_commissions - Commission calculation
✅ affiliate_withdrawals - Payout system
✅ creator_earnings - Multi-source earnings
✅ user_wallets - Gem/Diamond balance
✅ AffiliateScreen.js - Dashboard
✅ Commission rates & tier upgrades
```

### ❌ WHAT'S MISSING (10%)

```
❌ PRODUCT-SPECIFIC affiliate links
   Current: affiliate_codes = USER referral only (jennie_abc123)
   Need: PRODUCT links (gemral.com/p/RQ123?aff=jennie_abc123)

❌ Click tracking for product links
   Current: affiliate_codes.clicks (general)
   Need: Per-product click tracking

❌ Product sharing UI in mobile
   Current: Can share referral code
   Need: "Get Affiliate Link" button on product pages
```

---

## 🎯 IMPLEMENTATION STRATEGY

### Option A: Extend affiliate_codes (RECOMMENDED ⭐)

**Rationale:** Reuse existing structure, minimal changes

**Changes:**
1. Add columns to `affiliate_codes`:
   - `product_id` (nullable) - null = user referral, non-null = product link
   - `product_type` (nullable) - 'crystal', 'course', 'subscription'
   - `short_code` - for pretty URLs (RQ123)

2. Extend existing services with product methods

3. Add product sharing UI components

**Pros:**
- ✅ Minimal database changes
- ✅ Reuse existing click tracking
- ✅ Single code table for both user & product links
- ✅ Existing dashboard shows all links

**Cons:**
- One affiliate_codes table handles two purposes (acceptable)

---

### Option B: New product_affiliate_links table

**Rationale:** Separate concerns

**Pros:**
- Clear separation of user vs product links
- More specific product tracking

**Cons:**
- ❌ Duplicate logic (clicks, commissions already in affiliate_codes)
- ❌ Two dashboards to maintain
- ❌ More complex queries

**Decision:** ❌ NOT recommended - avoid duplication

---

## 📋 DETAILED PLAN - EXTEND AFFILIATE_CODES

### STEP 1: Database Migration (Extend Existing)

```sql
-- File: supabase/migrations/20241127_extend_affiliate_codes_for_products.sql

-- Add product-related columns to existing affiliate_codes table
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS product_type TEXT CHECK (product_type IN ('crystal', 'course', 'subscription', 'book'));
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS short_code TEXT; -- RQ123, TB456
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS product_price NUMERIC(10, 2);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_product ON affiliate_codes(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_short_code ON affiliate_codes(short_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_codes_user_product ON affiliate_codes(user_id, product_id) WHERE product_id IS NOT NULL;

-- Update existing codes to be "user referral" type (no product_id)
-- All existing codes are user referrals, so they naturally have product_id = NULL ✅

COMMENT ON COLUMN affiliate_codes.product_id IS 'NULL = user referral code, NOT NULL = product affiliate link';
COMMENT ON COLUMN affiliate_codes.short_code IS 'Short code for product links (RQ123, TB456)';

-- Add tracking for product link performance
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS sales_amount NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE affiliate_codes ADD COLUMN IF NOT EXISTS commission_earned NUMERIC(12, 2) DEFAULT 0;
```

**Key Decision:** 
- `product_id = NULL` → User referral code (existing behavior)
- `product_id = NOT NULL` → Product affiliate link (new feature)

This way, **NO breaking changes** to existing system! ✅

---

### STEP 2: Extend Mobile Services

**File:** `gem-mobile/src/services/affiliateService.js`

```javascript
// If file doesn't exist, create it by porting from frontend/src/services/affiliate.js
// If exists, ADD these new functions:

/**
 * Generate product affiliate link
 * Extends existing affiliate code system with product-specific links
 */
export async function generateProductAffiliateLink(userId, productId) {
  try {
    // 1. Check if user is affiliate
    const { data: affiliateProfile } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!affiliateProfile || !affiliateProfile.is_active) {
      throw new Error('User is not an active affiliate');
    }

    // 2. Get product details
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (!product) {
      throw new Error('Product not found');
    }

    // 3. Check if link already exists
    const { data: existingLink } = await supabase
      .from('affiliate_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existingLink && existingLink.is_active) {
      return {
        success: true,
        link: existingLink,
        url: generateProductUrl(existingLink.short_code, existingLink.code),
      };
    }

    // 4. Generate short code for product
    const shortCode = generateShortCode(product.name);

    // 5. Get user's main referral code (or create if not exists)
    let { data: userCode } = await supabase
      .from('affiliate_codes')
      .select('code')
      .eq('user_id', userId)
      .is('product_id', null)
      .single();

    if (!userCode) {
      // Create main referral code first
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      const newCode = `${profile.username}_${randomString(6)}`.toLowerCase();
      
      const { data: created } = await supabase
        .from('affiliate_codes')
        .insert({
          user_id: userId,
          code: newCode,
          is_active: true,
        })
        .select()
        .single();

      userCode = created;
    }

    // 6. Create product affiliate link (extends affiliate_codes table)
    const { data: productLink, error } = await supabase
      .from('affiliate_codes')
      .insert({
        user_id: userId,
        code: userCode.code, // Same base code as user's referral
        product_id: productId,
        product_type: product.product_type,
        product_name: product.name,
        product_price: product.price,
        short_code: shortCode,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    // 7. Determine commission rate
    const commissionRate = calculateCommissionRate(
      product.product_type,
      affiliateProfile.ctv_tier
    );

    return {
      success: true,
      link: productLink,
      url: generateProductUrl(shortCode, userCode.code),
      commissionRate,
      estimatedCommission: (product.price * commissionRate) / 100,
    };
  } catch (error) {
    console.error('Error generating product link:', error);
    throw error;
  }
}

/**
 * Generate short code for product
 */
function generateShortCode(productName) {
  // Extract initials
  const words = productName.split(' ');
  let code = '';
  
  for (let i = 0; i < Math.min(3, words.length); i++) {
    code += words[i].charAt(0).toUpperCase();
  }
  
  // Add random numbers
  const randomNum = Math.floor(Math.random() * 999) + 100;
  code += randomNum;
  
  return code; // e.g., "RQC456"
}

/**
 * Generate product URL
 */
function generateProductUrl(shortCode, affiliateCode) {
  return `https://gemral.com/p/${shortCode}?aff=${affiliateCode}`;
}

/**
 * Calculate commission rate based on product type and tier
 * Uses existing COMMISSION_RATES from your system
 */
function calculateCommissionRate(productType, ctvTier) {
  // Your existing rates
  const COMMISSION_RATES = {
    affiliate: 0.03, // 3% for regular affiliate
    
    // CTV tiers (from your system)
    beginner: 0.10,  // 10%
    growing: 0.15,   // 15%
    master: 0.20,    // 20%
    grand: 0.30,     // 30%
  };

  // Product type specific rates (if needed)
  const PRODUCT_MULTIPLIERS = {
    crystal: 1.0,
    course: 1.2,      // Courses get 20% higher commission
    subscription: 1.5, // Subscriptions get 50% higher
    book: 0.8,        // Books get 20% lower
  };

  const baseRate = ctvTier ? COMMISSION_RATES[ctvTier] : COMMISSION_RATES.affiliate;
  const multiplier = PRODUCT_MULTIPLIERS[productType] || 1.0;
  
  return (baseRate * multiplier * 100).toFixed(2); // Return as percentage
}

/**
 * Track click on product affiliate link
 * Extends existing click tracking
 */
export async function trackProductClick(shortCode, affiliateCode, clickData) {
  try {
    // Find the product affiliate link
    const { data: link } = await supabase
      .from('affiliate_codes')
      .select('*')
      .eq('short_code', shortCode)
      .eq('code', affiliateCode)
      .eq('is_active', true)
      .single();

    if (!link) {
      return { success: false, error: 'Invalid link' };
    }

    // Increment click count (reuse existing column)
    await supabase.rpc('increment_affiliate_clicks', {
      code_id: link.id,
    });

    // Store click details if needed (optional - use existing analytics)
    // Your system might already track this in analytics tables

    return {
      success: true,
      productId: link.product_id,
      redirectUrl: getProductUrl(link.product_id),
    };
  } catch (error) {
    console.error('Error tracking click:', error);
    throw error;
  }
}

/**
 * Get all affiliate links (both user & product) for dashboard
 * Extends existing dashboard query
 */
export async function getUserAffiliateLinks(userId) {
  try {
    const { data: links, error } = await supabase
      .from('affiliate_codes')
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          product_type
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Separate user referral vs product links
    const userReferral = links.find(l => l.product_id === null);
    const productLinks = links.filter(l => l.product_id !== null);

    return {
      success: true,
      userReferral,
      productLinks,
      totalLinks: links.length,
    };
  } catch (error) {
    console.error('Error getting links:', error);
    throw error;
  }
}

/**
 * Random string generator
 */
function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```

---

### STEP 3: Add UI Components

#### A. Product Detail Screen - Add "Get Affiliate Link" Button

**File:** `gem-mobile/src/screens/Products/ProductDetailScreen.js`

```javascript
import { generateProductAffiliateLink } from '../../services/affiliateService';
import ProductAffiliateLinkSheet from '../../components/Affiliate/ProductAffiliateLinkSheet';

export default function ProductDetailScreen({ route }) {
  const { productId } = route.params;
  const [linkSheetVisible, setLinkSheetVisible] = useState(false);
  const [affiliateLink, setAffiliateLink] = useState(null);
  const currentUserId = useAuth().user?.id;

  // Check if user is affiliate
  const { data: isAffiliate } = useQuery(['isAffiliate', currentUserId], async () => {
    const { data } = await supabase
      .from('affiliate_profiles')
      .select('is_active')
      .eq('user_id', currentUserId)
      .single();
    return data?.is_active || false;
  });

  const handleGetAffiliateLink = async () => {
    try {
      const result = await generateProductAffiliateLink(currentUserId, productId);
      setAffiliateLink(result);
      setLinkSheetVisible(true);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView>
      {/* Existing product content */}
      
      {/* NEW: Affiliate Link Button (only for affiliates) */}
      {isAffiliate && (
        <TouchableOpacity 
          style={styles.affiliateLinkButton}
          onPress={handleGetAffiliateLink}
        >
          <Icon name="link" size={20} color="#FFBD59" />
          <Text style={styles.affiliateLinkText}>Get Affiliate Link</Text>
        </TouchableOpacity>
      )}

      {/* Existing buttons */}
      <Button title="Add to Cart" />
      <Button title="Buy Now" />

      {/* NEW: Affiliate Link Sheet */}
      <ProductAffiliateLinkSheet
        visible={linkSheetVisible}
        onClose={() => setLinkSheetVisible(false)}
        link={affiliateLink}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  affiliateLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  affiliateLinkText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#FFBD59',
    marginLeft: 8,
  },
});
```

---

#### B. Product Affiliate Link Sheet Component (NEW)

**File:** `gem-mobile/src/components/Affiliate/ProductAffiliateLinkSheet.js`

```javascript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Clipboard } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Lucide';
import { DESIGN_TOKENS } from '../../constants/designTokens';

export default function ProductAffiliateLinkSheet({ visible, onClose, link }) {
  if (!link) return null;

  const { url, commissionRate, estimatedCommission, link: linkData } = link;

  const handleCopyLink = () => {
    Clipboard.setString(url);
    // Show toast
    Alert.alert('Copied!', 'Affiliate link copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${linkData.product_name}! 🔮\n\nPrice: ${formatPrice(linkData.product_price)} VNĐ\nI earn ${commissionRate}% commission if you buy through my link 💰\n\n${url}`,
        url: url,
        title: linkData.product_name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <BottomSheet
      index={visible ? 0 : -1}
      snapPoints={['70%']}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.bottomSheet}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Affiliate Link</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="x" size={24} color={DESIGN_TOKENS.colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.productCard}>
          <Text style={styles.productName}>{linkData.product_name}</Text>
          <Text style={styles.productPrice}>
            💰 {formatPrice(linkData.product_price)} VNĐ
          </Text>
        </View>

        {/* Commission Info */}
        <View style={styles.commissionCard}>
          <View style={styles.commissionRow}>
            <Text style={styles.label}>Your Commission:</Text>
            <Text style={styles.commissionRate}>{commissionRate}%</Text>
          </View>
          <View style={styles.commissionRow}>
            <Text style={styles.label}>You'll Earn:</Text>
            <Text style={styles.commissionAmount}>
              {formatPrice(estimatedCommission)} VNĐ
            </Text>
          </View>
        </View>

        {/* Link Display */}
        <View style={styles.linkCard}>
          <Text style={styles.linkLabel}>Affiliate Link:</Text>
          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1}>
              {url}
            </Text>
            <TouchableOpacity onPress={handleCopyLink}>
              <Icon name="copy" size={20} color={DESIGN_TOKENS.colors.accent.gold} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCopyLink}>
            <Icon name="copy" size={20} color="#FFF" />
            <Text style={styles.actionText}>Copy Link</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="share-2" size={20} color="#FFF" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tips}>
          <Icon name="lightbulb" size={16} color={DESIGN_TOKENS.colors.accent.gold} />
          <Text style={styles.tipsText}>
            💡 Tip: Share on social media to maximize your earnings!
          </Text>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: DESIGN_TOKENS.colors.background.glass,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    color: DESIGN_TOKENS.colors.text.primary,
  },
  productCard: {
    backgroundColor: 'rgba(156, 6, 18, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  productName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: DESIGN_TOKENS.colors.text.primary,
    marginBottom: 8,
  },
  productPrice: {
    fontFamily: 'NotoSansDisplay-Medium',
    fontSize: 18,
    color: DESIGN_TOKENS.colors.accent.gold,
  },
  commissionCard: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontFamily: 'NotoSansDisplay-Regular',
    fontSize: 14,
    color: DESIGN_TOKENS.colors.text.secondary,
  },
  commissionRate: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: DESIGN_TOKENS.colors.accent.gold,
  },
  commissionAmount: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: DESIGN_TOKENS.colors.success,
  },
  linkCard: {
    marginBottom: 20,
  },
  linkLabel: {
    fontFamily: 'NotoSansDisplay-Medium',
    fontSize: 13,
    color: DESIGN_TOKENS.colors.text.secondary,
    marginBottom: 8,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 34, 80, 0.6)',
    padding: 12,
    borderRadius: 8,
  },
  linkText: {
    flex: 1,
    fontFamily: 'NotoSansDisplay-Regular',
    fontSize: 13,
    color: DESIGN_TOKENS.colors.text.primary,
    marginRight: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DESIGN_TOKENS.colors.primary.burgundy,
    padding: 14,
    borderRadius: 12,
  },
  actionText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  tips: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  tipsText: {
    flex: 1,
    fontFamily: 'NotoSansDisplay-Regular',
    fontSize: 12,
    color: DESIGN_TOKENS.colors.text.secondary,
    marginLeft: 8,
    lineHeight: 18,
  },
});

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price);
}
```

---

#### C. Extend Existing Affiliate Dashboard

**File:** `gem-mobile/src/screens/Affiliate/AffiliateScreen.js`

```javascript
// ADD new section to existing dashboard

import { getUserAffiliateLinks } from '../../services/affiliateService';

export default function AffiliateScreen() {
  // Existing code...

  // NEW: Fetch product links
  const { data: affiliateLinks } = useQuery(
    ['affiliateLinks', userId],
    () => getUserAffiliateLinks(userId)
  );

  return (
    <ScrollView>
      {/* Existing dashboard stats */}
      
      {/* NEW: My Product Links Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Product Links</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Products')}>
            <Text style={styles.sectionLink}>Browse Products →</Text>
          </TouchableOpacity>
        </View>

        {affiliateLinks?.productLinks.length > 0 ? (
          affiliateLinks.productLinks.map(link => (
            <ProductLinkCard key={link.id} link={link} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="link-2" size={48} color="#666" />
            <Text style={styles.emptyText}>No product links yet</Text>
            <Text style={styles.emptySubtext}>
              Go to any product page and tap "Get Affiliate Link"
            </Text>
          </View>
        )}
      </View>

      {/* Existing sections: stats, recent sales, etc. */}
    </ScrollView>
  );
}

// NEW: Product Link Card Component
function ProductLinkCard({ link }) {
  const url = `https://gemral.com/p/${link.short_code}?aff=${link.code}`;

  const handleCopy = () => {
    Clipboard.setString(url);
    Alert.alert('Copied!', 'Link copied to clipboard');
  };

  return (
    <View style={styles.linkCard}>
      <Image 
        source={{ uri: link.products?.image_url }} 
        style={styles.linkImage}
      />
      <View style={styles.linkInfo}>
        <Text style={styles.linkTitle}>{link.product_name}</Text>
        <Text style={styles.linkStats}>
          👁️ {link.clicks} clicks • 🛒 {link.sales_count} sales
        </Text>
        <Text style={styles.linkEarnings}>
          💰 {formatPrice(link.commission_earned)} VNĐ earned
        </Text>
      </View>
      <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
        <Icon name="copy" size={20} color="#FFBD59" />
      </TouchableOpacity>
    </View>
  );
}
```

---

### STEP 4: Product Redirect Handler (Backend/Edge Function)

**File:** `supabase/functions/product-redirect/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const shortCode = url.searchParams.get('p'); // /p/RQ123
    const affiliateCode = url.searchParams.get('aff'); // ?aff=jennie_abc123

    if (!shortCode || !affiliateCode) {
      return new Response('Invalid parameters', { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Find affiliate link
    const { data: link } = await supabase
      .from('affiliate_codes')
      .select('*, products(*)')
      .eq('short_code', shortCode)
      .eq('code', affiliateCode)
      .eq('is_active', true)
      .single();

    if (!link) {
      return Response.redirect('https://gemral.com/404', 302);
    }

    // Track click (increment existing clicks column)
    await supabase.rpc('increment_affiliate_clicks', {
      code_id: link.id,
    });

    // Set cookie for attribution (30 days)
    const cookieExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const cookies = [
      `aff_link_id=${link.id}; Expires=${cookieExpiry.toUTCString()}; Path=/; SameSite=Lax`,
      `aff_user_id=${link.user_id}; Expires=${cookieExpiry.toUTCString()}; Path=/; SameSite=Lax`,
    ];

    // Redirect to product page
    const productUrl = `https://gemral.com/products/${link.product_id}`;
    
    return Response.redirect(productUrl, 302, {
      headers: {
        'Set-Cookie': cookies.join(', '),
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.redirect('https://gemral.com', 302);
  }
});
```

---

### STEP 5: Database Functions (Extend Existing)

```sql
-- File: supabase/migrations/20241127_product_affiliate_functions.sql

-- Function to increment clicks (if doesn't exist)
CREATE OR REPLACE FUNCTION increment_affiliate_clicks(code_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE affiliate_codes
  SET clicks = clicks + 1
  WHERE id = code_id;
END;
$$ LANGUAGE plpgsql;

-- Function to record product sale with affiliate attribution
CREATE OR REPLACE FUNCTION record_product_affiliate_sale(
  p_affiliate_link_id UUID,
  p_buyer_id UUID,
  p_product_id UUID,
  p_sale_amount NUMERIC,
  p_quantity INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  v_affiliate_id UUID;
  v_commission_rate NUMERIC;
  v_commission_amount NUMERIC;
  v_sale_id UUID;
  v_commission_id UUID;
  v_product_type TEXT;
BEGIN
  -- Get affiliate user and product type
  SELECT ac.user_id, ac.product_type INTO v_affiliate_id, v_product_type
  FROM affiliate_codes ac
  WHERE ac.id = p_affiliate_link_id;

  -- Calculate commission (reuse existing calculate_commission function)
  v_commission_rate := calculate_commission(v_affiliate_id, v_product_type);
  v_commission_amount := (p_sale_amount * v_commission_rate * p_quantity);

  -- Insert into affiliate_sales (existing table)
  INSERT INTO affiliate_sales (
    affiliate_id,
    product_type,
    product_name,
    sale_amount,
    buyer_id,
    quantity,
    status
  )
  SELECT 
    v_affiliate_id,
    v_product_type,
    p.name,
    p_sale_amount,
    p_buyer_id,
    p_quantity,
    'completed'
  FROM products p
  WHERE p.id = p_product_id
  RETURNING id INTO v_sale_id;

  -- Insert into affiliate_commissions (existing table)
  INSERT INTO affiliate_commissions (
    affiliate_id,
    sale_id,
    commission_rate,
    commission_amount,
    status
  ) VALUES (
    v_affiliate_id,
    v_sale_id,
    v_commission_rate,
    v_commission_amount,
    'pending'
  ) RETURNING id INTO v_commission_id;

  -- Update affiliate_codes stats
  UPDATE affiliate_codes
  SET 
    sales_count = sales_count + p_quantity,
    sales_amount = sales_amount + p_sale_amount,
    commission_earned = commission_earned + v_commission_amount
  WHERE id = p_affiliate_link_id;

  -- Update affiliate_profiles total_sales
  UPDATE affiliate_profiles
  SET total_sales = total_sales + p_sale_amount
  WHERE user_id = v_affiliate_id;

  -- Check for tier upgrade
  PERFORM check_tier_upgrade(v_affiliate_id);

  RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql;

-- Extend existing dashboard function to include product links
CREATE OR REPLACE FUNCTION get_affiliate_dashboard_summary(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    -- Existing fields from your function
    'total_sales', ap.total_sales,
    'ctv_tier', ap.ctv_tier,
    'total_referrals', (SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = p_user_id),
    'total_commissions', (SELECT COALESCE(SUM(commission_amount), 0) FROM affiliate_commissions WHERE affiliate_id = p_user_id),
    
    -- NEW: Product links stats
    'total_product_links', (
      SELECT COUNT(*) 
      FROM affiliate_codes 
      WHERE user_id = p_user_id AND product_id IS NOT NULL
    ),
    'product_links_clicks', (
      SELECT COALESCE(SUM(clicks), 0) 
      FROM affiliate_codes 
      WHERE user_id = p_user_id AND product_id IS NOT NULL
    ),
    'product_links_sales', (
      SELECT COALESCE(SUM(sales_count), 0) 
      FROM affiliate_codes 
      WHERE user_id = p_user_id AND product_id IS NOT NULL
    ),
    'product_links_earnings', (
      SELECT COALESCE(SUM(commission_earned), 0) 
      FROM affiliate_codes 
      WHERE user_id = p_user_id AND product_id IS NOT NULL
    )
  ) INTO v_result
  FROM affiliate_profiles ap
  WHERE ap.user_id = p_user_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 SUMMARY - WHAT WE'RE ADDING

### Database (1 migration):
```
✅ ALTER affiliate_codes - Add 5 columns
   - product_id (nullable)
   - product_type
   - short_code
   - product_name
   - product_price
   - sales_count
   - sales_amount
   - commission_earned

✅ 3 new indexes
✅ 2 new/updated functions
```

### Services (1 file):
```
✅ affiliateService.js (extend or create)
   - generateProductAffiliateLink()
   - trackProductClick()
   - getUserAffiliateLinks()
   - Helper functions
```

### Components (1 new):
```
✅ ProductAffiliateLinkSheet.js (NEW)
   - Bottom sheet UI
   - Copy/Share functionality
   - Commission display
```

### Screens (2 updates):
```
✅ ProductDetailScreen.js (ADD button)
   - "Get Affiliate Link" button
   - Only for affiliates
   
✅ AffiliateScreen.js (EXTEND)
   - "My Product Links" section
   - ProductLinkCard component
```

### Backend (1 edge function):
```
✅ product-redirect (NEW)
   - Handle /p/{shortCode}?aff={code}
   - Track clicks
   - Set cookies
   - Redirect to product
```

---

## 🎯 IMPLEMENTATION CHECKLIST

```
Phase 1: Database (30 mins)
□ Run migration to extend affiliate_codes
□ Add indexes
□ Create/update RPC functions
□ Test with sample data

Phase 2: Services (1 hour)
□ Create/extend affiliateService.js
□ Implement generateProductAffiliateLink()
□ Implement trackProductClick()
□ Implement getUserAffiliateLinks()
□ Test all functions

Phase 3: Components (1 hour)
□ Create ProductAffiliateLinkSheet.js
□ Style with DESIGN_TOKENS
□ Test copy & share functionality

Phase 4: Screens (1 hour)
□ Update ProductDetailScreen with button
□ Extend AffiliateScreen with product links section
□ Test UI flow

Phase 5: Backend (1 hour)
□ Deploy product-redirect edge function
□ Test redirect flow
□ Verify cookie setting

Phase 6: Testing (1 hour)
□ End-to-end test: Generate link → Share → Click → Purchase → Commission
□ Test with different product types
□ Verify commission calculations
□ Check dashboard updates

Total: ~5.5 hours
```

---

## ✅ ADVANTAGES OF THIS APPROACH

```
✅ Reuse 90% existing system
✅ Single source of truth (affiliate_codes)
✅ Existing dashboard shows all links
✅ Same commission/payout flow
✅ Same withdrawal system
✅ No duplicate logic
✅ Clean database structure
✅ Easy to maintain
```

---

## 📝 KEY DECISIONS

1. **Extend affiliate_codes vs new table**
   - ✅ DECISION: Extend (add nullable product_id)
   - ✅ REASON: Reuse clicks, commissions, dashboard

2. **User referral vs product links**
   - ✅ LOGIC: product_id = NULL → user referral
   - ✅ LOGIC: product_id != NULL → product link
   - ✅ BENEFIT: Same table, different purposes

3. **Commission calculation**
   - ✅ REUSE: Existing calculate_commission() function
   - ✅ EXTEND: Add product type multipliers

4. **Dashboard display**
   - ✅ REUSE: Existing AffiliateScreen
   - ✅ ADD: New "Product Links" section

---

**End of Implementation Plan**

Total effort: ~5.5 hours to add Shopee-style product affiliate links! 🚀
