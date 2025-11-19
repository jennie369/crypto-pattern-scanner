import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { shopifyService } from '../services/shopify';

export const useShopStore = create(
  persist(
    (set, get) => ({
      // State
      products: [],
      cart: [],
      checkoutId: null,
      loading: false,
      error: null,
      filters: {
        category: 'all',
        priceRange: 'all',
        sortBy: 'featured'
      },

      // Actions
      fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
          console.log('📦 Fetching products from Edge Function...');
          const products = await shopifyService.getProducts(50, true);
          console.log(`✅ Fetched ${products.length} products`);

          // Transform products to match old format for UI compatibility
          const transformedProducts = products.map(p => ({
            id: p.shopify_product_id,
            title: p.title,
            description: p.description,
            handle: p.handle,
            priceRange: {
              minVariantPrice: {
                amount: p.price.toString(),
                currencyCode: p.currency || 'VND'
              }
            },
            images: {
              edges: p.images.map(img => ({
                node: {
                  url: img.src || img.url,
                  altText: img.alt || img.altText || p.title
                }
              }))
            },
            variants: {
              edges: p.variants.map(v => ({
                node: {
                  id: v.id,
                  title: v.title || 'Default',
                  priceV2: {
                    amount: v.price.toString(),
                    currencyCode: p.currency || 'VND'
                  },
                  availableForSale: true
                }
              }))
            },
            tags: p.tags || [],
            productType: p.product_type
          }));

          set({ products: transformedProducts, loading: false });
        } catch (error) {
          console.error('❌ Error fetching products:', error);
          set({ error: error.message, loading: false });
        }
      },

      addToCart: (product, variantId, quantity = 1) => {
        const cart = get().cart;
        const existingItem = cart.find(item => item.variantId === variantId);

        if (existingItem) {
          set({
            cart: cart.map(item =>
              item.variantId === variantId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          set({
            cart: [...cart, { product, variantId, quantity }]
          });
        }
      },

      removeFromCart: (variantId) => {
        set({
          cart: get().cart.filter(item => item.variantId !== variantId)
        });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(variantId);
          return;
        }

        set({
          cart: get().cart.map(item =>
            item.variantId === variantId
              ? { ...item, quantity }
              : item
          )
        });
      },

      clearCart: () => {
        set({ cart: [], checkoutId: null });
      },

      checkout: async () => {
        const cart = get().cart;

        if (cart.length === 0) {
          set({ error: 'Cart is empty' });
          return;
        }

        // Format line items for Shopify Cart API
        const lineItems = cart.map(item => ({
          merchandiseId: item.variantId,
          quantity: item.quantity
        }));

        try {
          console.log('🛒 Creating Shopify cart for checkout...');

          // Get user/session ID if available
          const userId = localStorage.getItem('userId') || null;
          const sessionId = localStorage.getItem('sessionId') || `session-${Date.now()}`;

          if (!localStorage.getItem('sessionId')) {
            localStorage.setItem('sessionId', sessionId);
          }

          const shopifyCart = await shopifyService.createCart(lineItems, userId, sessionId);

          console.log('✅ Cart created:', shopifyCart);

          set({ checkoutId: shopifyCart.id });

          // Redirect to Shopify checkout
          if (shopifyCart.checkoutUrl) {
            console.log('🔗 Redirecting to checkout:', shopifyCart.checkoutUrl);
            window.location.href = shopifyCart.checkoutUrl;
          } else {
            throw new Error('No checkout URL returned from Shopify');
          }
        } catch (error) {
          console.error('❌ Checkout error:', error);
          set({ error: error.message });
        }
      },

      setFilter: (filterType, value) => {
        set(state => ({
          filters: {
            ...state.filters,
            [filterType]: value
          }
        }));
      },

      getFilteredProducts: () => {
        const { products, filters } = get();
        let filtered = [...products];

        // Category tag mapping (multiple tags per category)
        const categoryTagMap = {
          'crystals': [
            'crystal', 'đá', 'pha lê', 'quý',
            'gem', 'stone', 'ngọc', 'jade',
            'amethyst', 'quartz', 'ruby', 'sapphire',
            'energy', 'năng lượng', 'spiritual', 'tâm linh'
          ],
          'courses': ['course', 'khóa học', 'trading'],
          'tools': [
            'tool', 'công cụ', 'scanner', 'ai',
            'bot', 'indicator', 'strategy', 'signal',
            'chart', 'analysis', 'script', 'automation',
            'phân tích', 'chiến lược', 'tín hiệu'
          ],
          'books': [
            'book', 'sách', 'tài liệu', 'ebook',
            'guide', 'manual', 'pdf', 'documentation',
            'reading', 'textbook', 'hướng dẫn', 'giáo trình'
          ]
        };

        // Category filter
        if (filters.category !== 'all') {
          const categoryTags = categoryTagMap[filters.category] || [filters.category];

          filtered = filtered.filter(p => {
            // Check if product has any matching tags (case-insensitive)
            const productTags = (p.tags || []).map(tag => tag.toLowerCase());
            const productType = (p.productType || '').toLowerCase();

            return categoryTags.some(catTag =>
              productTags.some(pTag => pTag.includes(catTag.toLowerCase())) ||
              productType.includes(catTag.toLowerCase())
            );
          });
        }

        // Price range filter
        if (filters.priceRange !== 'all') {
          const [min, max] = filters.priceRange.split('-').map(Number);
          filtered = filtered.filter(p => {
            const price = parseFloat(p.priceRange.minVariantPrice.amount);
            return price >= min && (max ? price <= max : true);
          });
        }

        // Sort
        switch (filters.sortBy) {
          case 'price-asc':
            filtered.sort((a, b) =>
              parseFloat(a.priceRange.minVariantPrice.amount) -
              parseFloat(b.priceRange.minVariantPrice.amount)
            );
            break;
          case 'price-desc':
            filtered.sort((a, b) =>
              parseFloat(b.priceRange.minVariantPrice.amount) -
              parseFloat(a.priceRange.minVariantPrice.amount)
            );
            break;
          case 'name':
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
          default:
            // Keep original order for 'featured'
            break;
        }

        return filtered;
      },

      getCartTotal: () => {
        return get().cart.reduce((total, item) => {
          const variant = item.product.variants.edges
            .find(v => v.node.id === item.variantId);
          const price = parseFloat(variant?.node.priceV2.amount || 0);
          return total + (price * item.quantity);
        }, 0);
      },

      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'gem-shop-storage',
      partialize: (state) => ({
        cart: state.cart,
        checkoutId: state.checkoutId
      })
    }
  )
);
