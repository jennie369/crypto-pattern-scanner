# Phase 04: Product Integration

## Phase Information

- **Duration:** 2-3 days (6-8 hours)
- **Status:** ⏳ Pending
- **Progress:** 0%
- **Dependencies:** Phase 02 (Gemini must be working)
- **Priority:** 🔥🔥 HIGH

---

## Objectives

Integrate Shopify products into chatbot conversations:
1. Product cards with images in chat responses
2. Tier upgrade prompts after quota exceeded
3. CTA buttons for products mentioned in AI responses
4. Analytics tracking (views → clicks → purchases)
5. Smart product recommendations based on conversation

---

## Deliverables

- [ ] Product extraction from AI responses
- [ ] Product card component
- [ ] Tier upgrade modal with product CTAs
- [ ] Analytics tracking system
- [ ] 9 Shopify products configured

---

## Product Catalog

### TIER Upgrades
```javascript
const tierProducts = [
  {
    id: 'tier1',
    name: 'TIER 1 - Starter',
    price: 99000,
    currency: 'VND',
    image: 'https://cdn.shopify.com/s/files/1/0123/tier1.jpg',
    url: 'https://your-store.myshopify.com/products/tier1',
    features: ['15 queries/day', 'I Ching + Tarot', 'Basic support'],
    shopifyId: 'gid://shopify/Product/123456'
  },
  {
    id: 'tier2',
    name: 'TIER 2 - Advanced',
    price: 299000,
    currency: 'VND',
    image: 'https://cdn.shopify.com/s/files/1/0123/tier2.jpg',
    url: 'https://your-store.myshopify.com/products/tier2',
    features: ['50 queries/day', 'Voice input', 'PDF export', 'Priority support'],
    shopifyId: 'gid://shopify/Product/123457'
  },
  {
    id: 'tier3',
    name: 'TIER 3 - Elite',
    price: 599000,
    currency: 'VND',
    image: 'https://cdn.shopify.com/s/files/1/0123/tier3.jpg',
    url: 'https://your-store.myshopify.com/products/tier3',
    features: ['Unlimited queries', 'All features', 'VIP support', 'Custom widgets'],
    shopifyId: 'gid://shopify/Product/123458'
  }
]
```

### Tools & Courses
```javascript
const additionalProducts = [
  {
    id: 'chatbot-pro',
    name: 'Chatbot Pro (Standalone)',
    price: 199000,
    category: 'tool',
    keywords: ['chatbot', 'advisor', 'ai']
  },
  {
    id: 'scanner-basic',
    name: 'Pattern Scanner Basic',
    price: 149000,
    category: 'tool',
    keywords: ['scanner', 'pattern', 'chart']
  },
  {
    id: 'crystal-set',
    name: 'Crystal Energy Set',
    price: 350000,
    category: 'physical',
    keywords: ['crystal', 'energy', 'meditation']
  },
  {
    id: 'trading-course',
    name: 'GEM Trading Course',
    price: 1500000,
    category: 'course',
    keywords: ['course', 'learn', 'trading']
  }
]
```

---

## Step 1: Product Service

### Create Product Service

**File:** `frontend/src/services/products.js` (NEW)

```javascript
import { supabase } from '../config/supabase'

class ProductService {
  constructor() {
    this.products = this.loadProductCatalog()
  }

  loadProductCatalog() {
    return {
      tiers: [
        {
          id: 'tier1',
          name: 'TIER 1 - Starter',
          price: 99000,
          currency: 'VND',
          image: '/products/tier1.jpg',
          url: 'https://your-store.myshopify.com/products/tier1',
          features: ['15 queries/day', 'I Ching + Tarot', 'Basic support'],
          shopifyId: 'gid://shopify/Product/123456'
        },
        {
          id: 'tier2',
          name: 'TIER 2 - Advanced',
          price: 299000,
          currency: 'VND',
          image: '/products/tier2.jpg',
          url: 'https://your-store.myshopify.com/products/tier2',
          features: ['50 queries/day', 'Voice input', 'PDF export'],
          shopifyId: 'gid://shopify/Product/123457'
        },
        {
          id: 'tier3',
          name: 'TIER 3 - Elite',
          price: 599000,
          currency: 'VND',
          image: '/products/tier3.jpg',
          url: 'https://your-store.myshopify.com/products/tier3',
          features: ['Unlimited', 'All features', 'VIP support'],
          shopifyId: 'gid://shopify/Product/123458'
        }
      ],
      tools: [
        {
          id: 'chatbot-pro',
          name: 'Chatbot Pro',
          price: 199000,
          image: '/products/chatbot-pro.jpg',
          url: 'https://your-store.myshopify.com/products/chatbot-pro',
          keywords: ['chatbot', 'advisor', 'ai']
        },
        {
          id: 'scanner-basic',
          name: 'Pattern Scanner',
          price: 149000,
          image: '/products/scanner.jpg',
          url: 'https://your-store.myshopify.com/products/scanner',
          keywords: ['scanner', 'pattern', 'chart']
        }
      ]
    }
  }

  // Extract product mentions from AI response
  detectProducts(message) {
    const detected = []
    const lowerMessage = message.toLowerCase()

    // Check for tier mentions
    if (lowerMessage.includes('tier 1') || lowerMessage.includes('starter')) {
      detected.push(this.products.tiers[0])
    }
    if (lowerMessage.includes('tier 2') || lowerMessage.includes('advanced')) {
      detected.push(this.products.tiers[1])
    }
    if (lowerMessage.includes('tier 3') || lowerMessage.includes('elite')) {
      detected.push(this.products.tiers[2])
    }

    // Check for tool mentions
    this.products.tools.forEach(tool => {
      if (tool.keywords.some(kw => lowerMessage.includes(kw))) {
        detected.push(tool)
      }
    })

    return detected
  }

  // Track product view
  async trackProductView(productId, context = {}) {
    await supabase.from('product_analytics').insert({
      product_id: productId,
      event_type: 'view',
      context,
      timestamp: new Date().toISOString()
    })
  }

  // Track product click
  async trackProductClick(productId, context = {}) {
    await supabase.from('product_analytics').insert({
      product_id: productId,
      event_type: 'click',
      context,
      timestamp: new Date().toISOString()
    })
  }
}

export const productService = new ProductService()
```

---

## Step 2: Product Card Component

**File:** `frontend/src/components/Chatbot/ProductCard.jsx` (NEW)

```jsx
import React from 'react'
import './ProductCard.css'
import { productService } from '../../services/products'

export const ProductCard = ({ product, source = 'chat' }) => {
  const handleClick = () => {
    // Track click
    productService.trackProductClick(product.id, { source })

    // Open product URL
    window.open(product.url, '_blank')
  }

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="product-info">
        <h4 className="product-name">{product.name}</h4>

        {product.features && (
          <ul className="product-features">
            {product.features.slice(0, 3).map((feature, i) => (
              <li key={i}>✓ {feature}</li>
            ))}
          </ul>
        )}

        <div className="product-footer">
          <span className="product-price">
            {product.price.toLocaleString('vi-VN')} {product.currency}
          </span>
          <button onClick={handleClick} className="product-cta">
            Nâng cấp ngay →
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Style:** `ProductCard.css`

```css
.product-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg,
    rgba(139, 92, 246, 0.1) 0%,
    rgba(0, 217, 255, 0.1) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid transparent;
  border-image: linear-gradient(135deg, #8B5CF6, #00D9FF) 1;
  border-radius: 16px;
  margin: 12px 0;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(139, 92, 246, 0.3);
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #00D9FF, #8B5CF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.product-features {
  list-style: none;
  padding: 0;
  margin: 8px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.product-features li {
  margin: 4px 0;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: #00D9FF;
}

.product-cta {
  padding: 8px 16px;
  background: linear-gradient(135deg, #8B5CF6, #00D9FF);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-cta:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}
```

---

## Step 3: Integrate into Chatbot

**Modify:** `frontend/src/pages/Chatbot.jsx`

```jsx
import { ProductCard } from '../components/Chatbot/ProductCard'
import { productService } from '../services/products'

// After AI responds:
const handleSend = async () => {
  // ... existing code ...

  const aiResponse = await chatbotService.chatWithMaster(input, conversationHistory)

  // Detect products mentioned in response
  const mentionedProducts = productService.detectProducts(aiResponse)

  setMessages(prev => [
    ...prev,
    { role: 'assistant', content: aiResponse, products: mentionedProducts }
  ])

  // Track product views
  mentionedProducts.forEach(product => {
    productService.trackProductView(product.id, {
      source: 'ai_mention',
      query: input
    })
  })
}

// In message rendering:
{messages.map((msg, idx) => (
  <div key={idx} className={`message ${msg.role}`}>
    <div className="message-content">{msg.content}</div>

    {/* Show product cards if AI mentioned products */}
    {msg.products && msg.products.length > 0 && (
      <div className="message-products">
        {msg.products.map(product => (
          <ProductCard key={product.id} product={product} source="ai_mention" />
        ))}
      </div>
    )}
  </div>
))}
```

---

## Step 4: Quota Exceeded Upgrade Prompt

**Add to Chatbot.jsx:**

```jsx
const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

// When quota exceeded:
const handleQuotaExceeded = () => {
  setShowUpgradePrompt(true)
}

// Upgrade modal:
{showUpgradePrompt && (
  <div className="upgrade-modal-overlay">
    <div className="upgrade-modal">
      <h2>Bạn đã hết lượt hỏi hôm nay</h2>
      <p>Nâng cấp để tiếp tục trò chuyện với Master Jennie</p>

      <div className="tier-options">
        {productService.products.tiers.map(tier => (
          <ProductCard key={tier.id} product={tier} source="quota_exceeded" />
        ))}
      </div>

      <button onClick={() => setShowUpgradePrompt(false)} className="close-btn">
        Để sau
      </button>
    </div>
  </div>
)}
```

---

## Step 5: Analytics Table Migration

**File:** `supabase/migrations/20250121_product_analytics.sql`

```sql
CREATE TABLE IF NOT EXISTS product_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'purchase')),
  context JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_analytics_user ON product_analytics(user_id);
CREATE INDEX idx_product_analytics_product ON product_analytics(product_id);
CREATE INDEX idx_product_analytics_event ON product_analytics(event_type);
CREATE INDEX idx_product_analytics_timestamp ON product_analytics(timestamp DESC);

-- RLS Policies
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON product_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON product_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Analytics view for admins
CREATE OR REPLACE VIEW product_analytics_summary AS
SELECT
  product_id,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  DATE(timestamp) as date
FROM product_analytics
GROUP BY product_id, event_type, DATE(timestamp);
```

**Deploy:**
```bash
supabase migration up
```

---

## Step 6: Testing

### Test Cases

1. **Product mention detection:**
   - Ask: "Làm sao để nâng cấp lên TIER 2?"
   - Verify: AI mentions TIER 2, ProductCard displays

2. **Quota exceeded:**
   - Exhaust daily quota
   - Verify: Upgrade modal appears with all tier options

3. **Analytics tracking:**
   - View product card (check database)
   - Click product CTA (check database)
   - Verify: Events logged correctly

### Verification Checklist

- [ ] Product cards render correctly
- [ ] Images load properly
- [ ] CTA buttons open Shopify URLs
- [ ] Analytics track views + clicks
- [ ] Upgrade modal appears when quota exceeded
- [ ] No layout breaks on mobile

---

## Completion Criteria

- [ ] 9 products configured in product service
- [ ] ProductCard component styled with NFT design
- [ ] Product detection works in AI responses
- [ ] Analytics tracking functional
- [ ] Upgrade prompt triggers correctly
- [ ] Commit: `feat: complete phase-04 - product integration`

---

## Next Steps

Open `phase-05-voice-export.md`
