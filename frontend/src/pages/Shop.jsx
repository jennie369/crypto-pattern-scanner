import React, { useEffect, useState, useRef } from 'react';
import { useShopStore } from '../stores/shopStore';
import { ShoppingCart, ShoppingBag, Gem, BookOpen, TrendingUp, FileText } from 'lucide-react';
import CompactSidebar from '../components/CompactSidebar/CompactSidebar';

// Import all new components
import Section1_Hero from './Shop/components/Section1_Hero';
import Section2_Quiz from './Shop/components/Section2_Quiz';
import Section4_Lifestyle from './Shop/components/Section4_Lifestyle';
import Section5_Unboxing from './Shop/components/Section5_Unboxing';
import Section7_BeforeAfter from './Shop/components/Section7_BeforeAfter';
import Section8_SocialProof from './Shop/components/Section8_SocialProof';
import Section9_FAQ from './Shop/components/Section9_FAQ';
import Section10_FinalCTA from './Shop/components/Section10_FinalCTA';
import CategoryGrid from './Shop/components/CategoryGrid';
import ProductFilters from './Shop/components/ProductFilters';
import ProductGrid from './Shop/components/ProductGrid';
import ProductDetailModal from './Shop/components/ProductDetailModal';
import FeaturedCollection from './Shop/components/FeaturedCollection';
import Testimonials from './Shop/components/Testimonials';
import NewsletterSignup from './Shop/components/NewsletterSignup';
import MiniCartDropdown from '../components/Shop/MiniCartDropdown';
import CommunityWidget from '../components/Shop/CommunityWidget';

// Import CSS
import './Shop/ShopPage.css';

export default function Shop() {
  const {
    products,
    cart,
    loading,
    error,
    filters,
    fetchProducts,
    addToCart,
    setFilter,
    getFilteredProducts,
    getCartCount
  } = useShopStore();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);

  // Prevent double fetch
  const hasFetchedRef = useRef(false);

  // Fetch products once on mount
  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchProducts();
      hasFetchedRef.current = true;
    }
  }, []); // Empty dependency array - only run once

  // Prevent unwanted refresh on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[Shop] Page visible - data already loaded');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Categories for filters
  const categories = [
    { id: 'all', label: 'Tất Cả Sản Phẩm', icon: ShoppingBag },
    { id: 'crystals', label: 'Đá Quý & Pha Lê', icon: Gem },
    { id: 'courses', label: 'Khóa Học', icon: BookOpen },
    { id: 'tools', label: 'Công Cụ Trading', icon: TrendingUp },
    { id: 'books', label: 'Sách & Tài Liệu', icon: FileText }
  ];

  const priceRanges = [
    { id: 'all', label: 'Tất Cả Giá' },
    { id: '0-500000', label: 'Dưới 500K' },
    { id: '500000-2000000', label: '500K - 2M' },
    { id: '2000000-5000000', label: '2M - 5M' },
    { id: '5000000', label: 'Trên 5M' }
  ];

  // Get filtered products
  const filteredProducts = getFilteredProducts().filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle add to cart with mini cart notification
  const handleAddToCart = (product, variantId, quantity) => {
    // Add to cart
    addToCart(product, variantId, quantity);

    // Get variant info
    const variant = product.variants.edges.find(v => v.node.id === variantId)?.node;
    const image = product.images.edges[0]?.node;

    // Set last added item for mini cart
    setLastAddedItem({
      name: product.title,
      price: parseFloat(variant?.priceV2.amount || 0),
      image: image?.url || '',
      variant: variant?.title !== 'Default Title' ? variant?.title : null,
      quantity
    });

    // Show mini cart
    setShowMiniCart(true);
  };

  return (
    <>
      <CompactSidebar />
      <div className="page-container">
        <div className="page-content">
          {/* Fixed Cart Button */}
          <button
            className="btn-primary"
            style={{
              position: 'fixed',
              top: '100px',
              right: '20px',
              zIndex: 100,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}
          onClick={() => window.location.href = '/cart'}
        >
          <ShoppingCart size={20} />
          <span>Giỏ Hàng</span>
          {getCartCount() > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#EF4444',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700
            }}>
              {getCartCount()}
            </span>
          )}
        </button>

        {/* PHASE 1: Hero - Opening Story */}
        <Section1_Hero />

        {/* PHASE 2: Interactive Quiz */}
        <Section2_Quiz />

        {/* Category Grid */}
        <CategoryGrid
          selectedCategory={filters.category}
          onSelectCategory={(categoryId) => setFilter('category', categoryId)}
        />

        {/* Product Filters */}
        <ProductFilters
          categories={categories}
          selectedCategory={filters.category}
          onSelectCategory={(categoryId) => setFilter('category', categoryId)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={filters.sortBy}
          onSortChange={(sortBy) => setFilter('sortBy', sortBy)}
          priceRanges={{
            options: priceRanges,
            selected: filters.priceRange,
            onChange: (priceRange) => setFilter('priceRange', priceRange)
          }}
        />

        {/* Product Grid - EXISTING SHOPIFY INTEGRATION */}
        <ProductGrid
          products={filteredProducts}
          loading={loading}
          error={error}
          onAddToCart={handleAddToCart}
          onProductClick={setSelectedProduct}
        />

        {/* PHASE 3: Lifestyle - Instagram Aesthetic */}
        <Section4_Lifestyle />

        {/* PHASE 4: Unboxing Experience */}
        <Section5_Unboxing />

        {/* Featured Collection */}
        <FeaturedCollection />

        {/* PHASE 5: Before/After + 90 Days Journey */}
        <Section7_BeforeAfter />

        {/* PHASE 6: Social Proof */}
        <Section8_SocialProof />

        {/* Testimonials */}
        <Testimonials />

        {/* PHASE 7: FAQ */}
        <Section9_FAQ />

        {/* PHASE 8: Final CTA */}
        <Section10_FinalCTA />

        {/* Newsletter Signup */}
        <NewsletterSignup />

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Mini Cart Dropdown */}
        <MiniCartDropdown
          isOpen={showMiniCart}
          onClose={() => setShowMiniCart(false)}
          lastAddedItem={lastAddedItem}
          cart={cart}
        />

        {/* Community Widget - Floating Bottom Right */}
        <CommunityWidget />
      </div>
    </div>
    </>
  );
}
