/**
 * Product Service
 * Manages Shopify product catalog and analytics tracking
 */

import { supabase } from '../lib/supabaseClient';

class ProductService {
  constructor() {
    this.products = this.loadProductCatalog();
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
          url: 'https://yinyang-master-crystals.myshopify.com/products/tier1',
          features: ['15 queries/day', 'I Ching + Tarot', 'Basic support'],
          shopifyId: 'gid://shopify/Product/tier1',
          gradient: 'linear-gradient(135deg, #00D9FF, #0099CC)'
        },
        {
          id: 'tier2',
          name: 'TIER 2 - Advanced',
          price: 299000,
          currency: 'VND',
          image: '/products/tier2.jpg',
          url: 'https://yinyang-master-crystals.myshopify.com/products/tier2',
          features: ['50 queries/day', 'Voice input', 'PDF export', 'Priority support'],
          shopifyId: 'gid://shopify/Product/tier2',
          gradient: 'linear-gradient(135deg, #FFBD59, #FFD700)'
        },
        {
          id: 'tier3',
          name: 'TIER 3 - Elite',
          price: 599000,
          currency: 'VND',
          image: '/products/tier3.jpg',
          url: 'https://yinyang-master-crystals.myshopify.com/products/tier3',
          features: ['Unlimited queries', 'All features', 'VIP support', 'Custom widgets'],
          shopifyId: 'gid://shopify/Product/tier3',
          gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)'
        }
      ],
      tools: [
        {
          id: 'chatbot-pro',
          name: 'Chatbot Pro (Standalone)',
          price: 199000,
          currency: 'VND',
          image: '/products/chatbot-pro.jpg',
          url: 'https://yinyang-master-crystals.myshopify.com/products/chatbot-pro',
          keywords: ['chatbot', 'advisor', 'ai', 'assistant'],
          category: 'tool',
          gradient: 'linear-gradient(135deg, #00D9FF, #8B5CF6)'
        },
        {
          id: 'scanner-basic',
          name: 'Pattern Scanner Basic',
          price: 149000,
          currency: 'VND',
          image: '/products/scanner.jpg',
          url: 'https://yinyang-master-crystals.myshopify.com/products/scanner',
          keywords: ['scanner', 'pattern', 'chart', 'analysis'],
          category: 'tool',
          gradient: 'linear-gradient(135deg, #FFBD59, #00D9FF)'
        },
        {
          id: 'crystal-set',
          name: 'Crystal Energy Set',
          price: 350000,
          currency: 'VND',
          image: '/products/crystal-set.jpg',
          url: 'https://yinyang-master-crystals.myshopify.com/products/crystal-set',
          keywords: ['crystal', 'energy', 'meditation', 'healing'],
          category: 'physical',
          gradient: 'linear-gradient(135deg, #8B5CF6, #FFBD59)'
        },
        {
          id: 'trading-course',
          name: 'GEM Trading Course',
          price: 1500000,
          currency: 'VND',
          image: '/products/trading-course.jpg',
          url: 'https://yinyang-master-crystals.myshopify.com/products/trading-course',
          keywords: ['course', 'learn', 'trading', 'education', 'class'],
          category: 'course',
          gradient: 'linear-gradient(135deg, #00FF88, #00D9FF)'
        },
        {
          id: 'tarot-deck',
          name: 'Premium Tarot Deck',
          price: 250000,
          currency: 'VND',
          image: '/products/tarot-deck.jpg',
          url: 'https://yinyang-master-crystals.myshopify.com/products/tarot-deck',
          keywords: ['tarot', 'cards', 'deck', 'divination'],
          category: 'physical',
          gradient: 'linear-gradient(135deg, #8B5CF6, #00D9FF)'
        },
        {
          id: 'iching-book',
          name: 'I Ching Wisdom Book',
          price: 180000,
          currency: 'VND',
          image: '/products/iching-book.jpg',
          url: 'https://yinyang-master-crystals.myshopify.com/products/iching-book',
          keywords: ['iching', 'book', 'wisdom', 'guide'],
          category: 'physical',
          gradient: 'linear-gradient(135deg, #FFBD59, #8B5CF6)'
        }
      ]
    };
  }

  /**
   * Get all products
   */
  getAllProducts() {
    return [...this.products.tiers, ...this.products.tools];
  }

  /**
   * Get product by ID
   */
  getProductById(id) {
    const allProducts = this.getAllProducts();
    return allProducts.find(p => p.id === id);
  }

  /**
   * Extract product mentions from AI response
   */
  detectProducts(message) {
    if (!message) return [];

    const detected = [];
    const lowerMessage = message.toLowerCase();

    // Check for tier mentions
    if (lowerMessage.includes('tier 1') || lowerMessage.includes('tier1') || lowerMessage.includes('starter')) {
      detected.push(this.products.tiers[0]);
    }
    if (lowerMessage.includes('tier 2') || lowerMessage.includes('tier2') || lowerMessage.includes('advanced')) {
      detected.push(this.products.tiers[1]);
    }
    if (lowerMessage.includes('tier 3') || lowerMessage.includes('tier3') || lowerMessage.includes('elite') || lowerMessage.includes('premium')) {
      detected.push(this.products.tiers[2]);
    }

    // Check for upgrade/nâng cấp mentions
    if (lowerMessage.includes('upgrade') || lowerMessage.includes('nâng cấp') || lowerMessage.includes('gói')) {
      // If no specific tier mentioned, suggest all tiers
      if (detected.length === 0) {
        detected.push(...this.products.tiers);
      }
    }

    // Check for tool mentions (only if not already suggesting tiers)
    if (detected.length === 0) {
      this.products.tools.forEach(tool => {
        if (tool.keywords.some(kw => lowerMessage.includes(kw))) {
          detected.push(tool);
        }
      });
    }

    // Remove duplicates
    return Array.from(new Set(detected.map(p => p.id)))
      .map(id => detected.find(p => p.id === id));
  }

  /**
   * Track product view
   */
  async trackProductView(productId, context = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('product_analytics').insert({
        user_id: user?.id || null,
        product_id: productId,
        event_type: 'view',
        context,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to track product view:', error);
    }
  }

  /**
   * Track product click
   */
  async trackProductClick(productId, context = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('product_analytics').insert({
        user_id: user?.id || null,
        product_id: productId,
        event_type: 'click',
        context,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to track product click:', error);
    }
  }

  /**
   * Get recommended tier based on current tier
   */
  getRecommendedTier(currentTier = 'FREE') {
    const tierMap = {
      'FREE': this.products.tiers[0], // Recommend TIER1
      'TIER1': this.products.tiers[1], // Recommend TIER2
      'TIER2': this.products.tiers[2], // Recommend TIER3
      'TIER3': null // Already at max
    };

    return tierMap[currentTier];
  }

  /**
   * Format price for display
   */
  formatPrice(price, currency = 'VND') {
    if (currency === 'VND') {
      return `${price.toLocaleString('vi-VN')}đ`;
    }
    return `${price} ${currency}`;
  }
}

// Export singleton instance
export const productService = new ProductService();
