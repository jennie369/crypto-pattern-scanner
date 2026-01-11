/**
 * GEMRAL CART SERVICE
 * Quản lý giỏ hàng với localStorage
 * Checkout redirect sang yinyangmasters.com (Shopify)
 *
 * @version 1.0.0
 * @author Claude Code
 * @date 2026-01-09
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const SHOP_DOMAIN = 'yinyangmasters.com';
const STORAGE_KEY = 'gemral_cart';
const REFERRAL_KEY = 'gemral_referral';

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT CATALOG - All Shopify Variant IDs
// ═══════════════════════════════════════════════════════════════════════════

const PRODUCT_CATALOG = {
  // ─────────────────────────────────────────────────────────────────────────
  // KHÓA HỌC TRADING
  // ─────────────────────────────────────────────────────────────────────────
  'course-starter': {
    id: 'course-starter',
    name: 'Khóa Học Trading - Starter',
    description: 'Khóa học cơ bản cho người mới bắt đầu',
    price: 299000,
    priceDisplay: '299.000đ',
    variantId: '46448154050737',
    sku: 'gem-course-tierstarter',
    category: 'course',
    productType: 'digital',
    shopifyHandle: 'gem-trading-course-tier-starter',
    shopifyUrl: 'https://yinyangmasters.com/products/gem-trading-course-tier-starter',
    image: '/images/products/course-starter.jpg'
  },
  'course-tier1': {
    id: 'course-tier1',
    name: 'Khóa Học Trading - Tier 1',
    description: 'Frequency Pro - Trọn bộ kiến thức trading',
    price: 11000000,
    priceDisplay: '11.000.000đ',
    variantId: '46351707898033',
    sku: 'gem-course-tier1',
    category: 'course',
    productType: 'digital',
    shopifyHandle: 'gem-tier1',
    shopifyUrl: 'https://yinyangmasters.com/products/gem-tier1',
    image: '/images/products/course-tier1.jpg'
  },
  'course-tier2': {
    id: 'course-tier2',
    name: 'Khóa Học Trading - Tier 2',
    description: 'Frequency Premium - Kèm Scanner & Chatbot Premium',
    price: 21000000,
    priceDisplay: '21.000.000đ',
    variantId: '46351719235761',
    sku: 'gem-course-tier2',
    category: 'course',
    productType: 'digital',
    shopifyHandle: 'gem-tier2',
    shopifyUrl: 'https://yinyangmasters.com/products/gem-tier2',
    image: '/images/products/course-tier2.jpg'
  },
  'course-tier3': {
    id: 'course-tier3',
    name: 'Khóa Học Trading - Tier 3',
    description: 'Frequency VIP - Trọn đời + Mentoring 1:1',
    price: 68000000,
    priceDisplay: '68.000.000đ',
    variantId: '46351723331761',
    sku: 'gem-course-tier3',
    category: 'course',
    productType: 'digital',
    shopifyHandle: 'gem-tier3',
    shopifyUrl: 'https://yinyangmasters.com/products/gem-tier3',
    image: '/images/products/course-tier3.jpg'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // YINYANG CHATBOT AI
  // ─────────────────────────────────────────────────────────────────────────
  'chatbot-pro': {
    id: 'chatbot-pro',
    name: 'YinYang Chatbot - Pro',
    description: 'AI Chatbot hỗ trợ trading cơ bản',
    price: 39000,
    priceDisplay: '39.000đ/tháng',
    variantId: '46351763701937',
    sku: 'gem-chatbot-pro',
    category: 'chatbot',
    productType: 'digital',
    isSubscription: true,
    shopifyHandle: 'yinyang-chatbot-ai-pro',
    shopifyUrl: 'https://yinyangmasters.com/products/yinyang-chatbot-ai-pro',
    image: '/images/products/chatbot-pro.jpg'
  },
  'chatbot-premium': {
    id: 'chatbot-premium',
    name: 'YinYang Chatbot - Premium',
    description: 'AI Chatbot nâng cao với phân tích sâu',
    price: 59000,
    priceDisplay: '59.000đ/tháng',
    variantId: '46351771893937',
    sku: 'gem-chatbot-premium',
    category: 'chatbot',
    productType: 'digital',
    isSubscription: true,
    shopifyHandle: 'gem-chatbot-premium',
    shopifyUrl: 'https://yinyangmasters.com/products/gem-chatbot-premium',
    image: '/images/products/chatbot-premium.jpg'
  },
  'chatbot-vip': {
    id: 'chatbot-vip',
    name: 'YinYang Chatbot - VIP',
    description: 'AI Chatbot VIP với tất cả tính năng',
    price: 99000,
    priceDisplay: '99.000đ/tháng',
    variantId: '46421822832817',
    sku: 'gem-chatbot-vip',
    category: 'chatbot',
    productType: 'digital',
    isSubscription: true,
    shopifyHandle: 'yinyang-chatbot-ai-vip',
    shopifyUrl: 'https://yinyangmasters.com/products/yinyang-chatbot-ai-vip',
    image: '/images/products/chatbot-vip.jpg'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SCANNER DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────
  'scanner-pro': {
    id: 'scanner-pro',
    name: 'Scanner Dashboard - Pro',
    description: 'Công cụ quét tín hiệu trading cơ bản',
    price: 997000,
    priceDisplay: '997.000đ/tháng',
    variantId: '46351752069297',
    sku: 'gem-scanner-pro',
    category: 'scanner',
    productType: 'digital',
    isSubscription: true,
    shopifyHandle: 'gem-scanner-pro',
    shopifyUrl: 'https://yinyangmasters.com/products/gem-scanner-pro',
    image: '/images/products/scanner-pro.jpg'
  },
  'scanner-premium': {
    id: 'scanner-premium',
    name: 'Scanner Dashboard - Premium',
    description: 'Scanner nâng cao với nhiều timeframe',
    price: 1997000,
    priceDisplay: '1.997.000đ/tháng',
    variantId: '46351759507633',
    sku: 'gem-scanner-premium',
    category: 'scanner',
    productType: 'digital',
    isSubscription: true,
    shopifyHandle: 'scanner-dashboard-premium',
    shopifyUrl: 'https://yinyangmasters.com/products/scanner-dashboard-premium',
    image: '/images/products/scanner-premium.jpg'
  },
  'scanner-vip': {
    id: 'scanner-vip',
    name: 'Scanner Dashboard - VIP',
    description: 'Scanner VIP với tất cả tính năng',
    price: 5997000,
    priceDisplay: '5.997.000đ/tháng',
    variantId: '46351760294065',
    sku: 'gem-scanner-vip',
    category: 'scanner',
    productType: 'digital',
    isSubscription: true,
    shopifyHandle: 'scanner-dashboard-vip',
    shopifyUrl: 'https://yinyangmasters.com/products/scanner-dashboard-vip',
    image: '/images/products/scanner-vip.jpg'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // KHÓA HỌC TÂM LINH / TƯ DUY
  // ─────────────────────────────────────────────────────────────────────────
  'mindset-7days': {
    id: 'mindset-7days',
    name: '7 Ngày Khai Mở Tần Số Gốc',
    description: 'Khóa học 7 ngày chuyển hóa tư duy',
    price: 1990000,
    priceDisplay: '1.990.000đ',
    variantId: '46448176758961',
    sku: 'gem-mindset-7days',
    category: 'mindset',
    productType: 'digital',
    shopifyHandle: 'khoa-hoc-7-ngay-khai-mo-tan-so-goc',
    shopifyUrl: 'https://yinyangmasters.com/products/khoa-hoc-7-ngay-khai-mo-tan-so-goc',
    image: '/images/products/mindset-7days.jpg'
  },
  'mindset-love': {
    id: 'mindset-love',
    name: 'Kích Hoạt Tần Số Tình Yêu',
    description: 'Khóa học về năng lượng tình yêu',
    price: 399000,
    priceDisplay: '399.000đ',
    variantId: '46448180166833',
    sku: 'gem-mindset-love',
    category: 'mindset',
    productType: 'digital',
    shopifyHandle: 'khoa-hoc-kich-hoat-tan-so-tinh-yeu',
    shopifyUrl: 'https://yinyangmasters.com/products/khoa-hoc-kich-hoat-tan-so-tinh-yeu',
    image: '/images/products/mindset-love.jpg'
  },
  'mindset-wealth': {
    id: 'mindset-wealth',
    name: 'Tái Tạo Tư Duy Triệu Phú',
    description: 'Khóa học tư duy thịnh vượng',
    price: 499000,
    priceDisplay: '499.000đ',
    variantId: '46448192192689',
    sku: 'gem-mindset-wealth',
    category: 'mindset',
    productType: 'digital',
    shopifyHandle: 'khoa-hoc-tai-tao-tu-duy-trieu-phu',
    shopifyUrl: 'https://yinyangmasters.com/products/khoa-hoc-tai-tao-tu-duy-trieu-phu',
    image: '/images/products/mindset-wealth.jpg'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CART SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class CartService {
  constructor() {
    this.cart = this.loadCart();
    this.listeners = [];
    this.init();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────

  init() {
    // Update UI on load
    this.updateCartUI();

    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        this.cart = this.loadCart();
        this.updateCartUI();
      }
    });

    console.log('[CartService] Initialized with', this.cart.length, 'items');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STORAGE OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  loadCart() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('[CartService] Error loading cart:', error);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cart));
      this.updateCartUI();
      this.notifyListeners();
    } catch (error) {
      console.error('[CartService] Error saving cart:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CART OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Thêm sản phẩm vào giỏ
   * @param {string} productId - ID sản phẩm từ PRODUCT_CATALOG
   * @param {number} quantity - Số lượng (default: 1)
   * @returns {boolean} - Thành công hay không
   */
  addItem(productId, quantity = 1) {
    const product = PRODUCT_CATALOG[productId];

    if (!product) {
      console.error('[CartService] Product not found:', productId);
      this.showToast('Không tìm thấy sản phẩm', 'error');
      return false;
    }

    // Check if already in cart
    const existingIndex = this.cart.findIndex(item => item.id === productId);

    if (existingIndex >= 0) {
      // Update quantity
      this.cart[existingIndex].quantity += quantity;
    } else {
      // Add new item
      this.cart.push({
        id: productId,
        name: product.name,
        price: product.price,
        priceDisplay: product.priceDisplay,
        variantId: product.variantId,
        shopifyUrl: product.shopifyUrl,
        image: product.image || '/images/placeholder-product.jpg',
        quantity: quantity
      });
    }

    this.saveCart();
    this.showToast(`Đã thêm "${product.name}" vào giỏ hàng`, 'success');
    return true;
  }

  /**
   * Xóa sản phẩm khỏi giỏ
   * @param {string} productId - ID sản phẩm
   */
  removeItem(productId) {
    const item = this.cart.find(i => i.id === productId);
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();

    if (item) {
      this.showToast(`Đã xóa "${item.name}" khỏi giỏ hàng`, 'info');
    }
  }

  /**
   * Cập nhật số lượng
   * @param {string} productId - ID sản phẩm
   * @param {number} quantity - Số lượng mới
   */
  updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const item = this.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
    }
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  clearCart() {
    this.cart = [];
    this.saveCart();
    this.showToast('Đã xóa toàn bộ giỏ hàng', 'info');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Lấy tổng tiền
   * @returns {number}
   */
  getTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  /**
   * Lấy tổng số lượng sản phẩm
   * @returns {number}
   */
  getCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Lấy danh sách sản phẩm trong giỏ
   * @returns {Array}
   */
  getItems() {
    return [...this.cart];
  }

  /**
   * Kiểm tra giỏ hàng có trống không
   * @returns {boolean}
   */
  isEmpty() {
    return this.cart.length === 0;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHECKOUT
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Tạo URL checkout Shopify
   * Format: /cart/VARIANT_ID:QTY,VARIANT_ID:QTY?ref=CODE
   * @returns {string|null}
   */
  generateCheckoutURL() {
    if (this.cart.length === 0) {
      return null;
    }

    // Build cart items: variant_id:quantity,variant_id:quantity
    const items = this.cart
      .map(item => `${item.variantId}:${item.quantity}`)
      .join(',');

    // Get referral code if exists (from waitlist-form.js pattern)
    const refCode = sessionStorage.getItem(REFERRAL_KEY) ||
                    localStorage.getItem(REFERRAL_KEY) ||
                    localStorage.getItem('referral_code');

    // Build checkout URL
    let checkoutUrl = `https://${SHOP_DOMAIN}/cart/${items}`;

    // Add referral tracking
    if (refCode) {
      checkoutUrl += `?ref=${encodeURIComponent(refCode)}`;
    }

    return checkoutUrl;
  }

  /**
   * Redirect sang Shopify checkout
   */
  checkout() {
    const checkoutUrl = this.generateCheckoutURL();

    if (!checkoutUrl) {
      this.showToast('Giỏ hàng trống!', 'error');
      return;
    }

    console.log('[CartService] Redirecting to:', checkoutUrl);

    // Redirect to Shopify
    window.location.href = checkoutUrl;
  }

  /**
   * Mở checkout trong tab mới
   */
  checkoutNewTab() {
    const checkoutUrl = this.generateCheckoutURL();

    if (!checkoutUrl) {
      this.showToast('Giỏ hàng trống!', 'error');
      return;
    }

    console.log('[CartService] Opening in new tab:', checkoutUrl);
    window.open(checkoutUrl, '_blank');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UI UPDATES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Cập nhật UI giỏ hàng
   */
  updateCartUI() {
    this.updateCartBadge();
    this.renderCartDrawer();
  }

  /**
   * Cập nhật badge số lượng
   */
  updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if (badge) {
      const count = this.getCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  /**
   * Render nội dung Cart Drawer
   */
  renderCartDrawer() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartEmpty = document.getElementById('cart-empty');
    const cartContent = document.getElementById('cart-content');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!cartItems) return;

    // Toggle empty/content state
    if (this.cart.length === 0) {
      if (cartEmpty) cartEmpty.style.display = 'flex';
      if (cartContent) cartContent.style.display = 'none';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartContent) cartContent.style.display = 'flex';
    if (checkoutBtn) checkoutBtn.disabled = false;

    // Render items
    cartItems.innerHTML = this.cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='/images/placeholder-product.jpg'">
        </div>

        <div class="cart-item-details">
          <a href="${item.shopifyUrl}"
             target="_blank"
             rel="noopener noreferrer"
             class="cart-item-name"
             title="Xem chi tiết trên YinYangMasters">
            ${item.name}
            <svg class="external-link-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
          <span class="cart-item-price">${item.priceDisplay}</span>
        </div>

        <div class="cart-item-actions">
          <div class="quantity-control">
            <button class="qty-btn" onclick="cartService.updateQuantity('${item.id}', ${item.quantity - 1})" aria-label="Giảm số lượng">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="cartService.updateQuantity('${item.id}', ${item.quantity + 1})" aria-label="Tăng số lượng">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>

          <button class="remove-btn" onclick="cartService.removeItem('${item.id}')" aria-label="Xóa sản phẩm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');

    // Update total
    if (cartTotal) {
      cartTotal.textContent = this.formatPrice(this.getTotal());
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DRAWER CONTROL
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Mở/đóng Cart Drawer
   */
  toggleDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');

    if (drawer) {
      const isOpen = drawer.classList.toggle('open');
      if (overlay) {
        overlay.classList.toggle('active', isOpen);
      }

      // Prevent body scroll when drawer is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
  }

  /**
   * Đóng Cart Drawer
   */
  closeDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');

    if (drawer) {
      drawer.classList.remove('open');
    }
    if (overlay) {
      overlay.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Format giá tiền VND
   * @param {number} amount
   * @returns {string}
   */
  formatPrice(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Hiển thị toast notification
   * @param {string} message
   * @param {string} type - 'success' | 'error' | 'info'
   */
  showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.cart-toast');
    existingToasts.forEach(t => t.remove());

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `cart-toast cart-toast--${type}`;

    const icons = {
      success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Đăng ký listener cho cart changes
   * @param {Function} callback
   */
  subscribe(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.cart));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZE & GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Create global cart service instance
const cartService = new CartService();

// Global functions for HTML onclick handlers
function addToCart(productId, quantity = 1) {
  return cartService.addItem(productId, quantity);
}

function removeFromCart(productId) {
  return cartService.removeItem(productId);
}

function updateCartQuantity(productId, quantity) {
  return cartService.updateQuantity(productId, quantity);
}

function openCart() {
  cartService.toggleDrawer();
}

function closeCart() {
  cartService.closeDrawer();
}

function checkout() {
  cartService.checkout();
}

function checkoutNewTab() {
  cartService.checkoutNewTab();
}

function clearCart() {
  if (confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
    cartService.clearCart();
  }
}

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CartService, cartService, PRODUCT_CATALOG };
}
