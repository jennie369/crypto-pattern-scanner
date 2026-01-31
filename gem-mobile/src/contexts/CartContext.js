/**
 * Gemral - Cart Context
 * CLOUD SYNC: Cart synced via Shopify + Supabase for cross-device consistency
 * Updated: 2024-12-25
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shopifyService } from '../services/shopifyService';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

const CartContext = createContext(null);

const CART_STORAGE_KEY = '@gem_cart';
const CART_ID_KEY = '@gem_cart_id';
const LAST_ORDER_KEY = '@gem_last_order';

/**
 * Helper: Convert to Shopify Global ID format
 * Shopify GraphQL API requires: gid://shopify/ProductVariant/{id}
 */
const toGlobalId = (id, type = 'ProductVariant') => {
  if (!id) return null;
  const idStr = String(id);
  if (idStr.startsWith('gid://shopify/')) {
    return idStr;
  }
  return `gid://shopify/${type}/${idStr}`;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartId, setCartId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  // Calculate totals
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Load cart from storage on mount and when user changes
  useEffect(() => {
    loadCartFromStorage();
  }, [user?.id]);

  // Load cart - CLOUD FIRST for logged-in users
  const loadCartFromStorage = async () => {
    try {
      let cloudCartId = null;

      // Try cloud first if logged in
      if (user?.id) {
        const { data, error } = await supabase
          .from('user_cart_sync')
          .select('shopify_cart_id, items')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          cloudCartId = data.shopify_cart_id;
          if (data.items && Array.isArray(data.items)) {
            setItems(data.items);
          }
        }
      }

      // Load from local storage
      const [storedItems, storedCartId] = await Promise.all([
        AsyncStorage.getItem(CART_STORAGE_KEY),
        AsyncStorage.getItem(CART_ID_KEY),
      ]);

      // Use cloud cart ID if available, otherwise local
      const finalCartId = cloudCartId || storedCartId;

      if (storedItems && !cloudCartId) {
        setItems(JSON.parse(storedItems));
      }

      if (finalCartId) {
        setCartId(finalCartId);
        // Sync with Shopify
        const shopifyCart = await shopifyService.getCart(finalCartId);
        if (shopifyCart) {
          setCart(shopifyCart);
        }
      }
    } catch (err) {
      console.error('[Cart] Error loading from storage:', err);
    }
  };

  // Save cart - Local storage (fast) + Background cloud sync
  const saveCartToStorage = async (newItems, newCartId = null) => {
    try {
      // Local storage first (fast) - await this for data safety
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
      if (newCartId) {
        await AsyncStorage.setItem(CART_ID_KEY, newCartId);
      }

      // Cloud sync in background (don't await) - fire and forget
      if (user?.id) {
        supabase
          .from('user_cart_sync')
          .upsert({
            user_id: user.id,
            shopify_cart_id: newCartId || cartId,
            items: newItems,
            item_count: newItems.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          })
          .then(() => console.log('[Cart] Cloud sync completed'))
          .catch(err => console.warn('[Cart] Cloud sync failed:', err));
      }
    } catch (err) {
      console.error('[Cart] Error saving to storage:', err);
    }
  };

  // Add item to cart - OPTIMIZED for instant UI response
  const addItem = useCallback(async (product, variant = null, quantity = 1) => {
    setError(null);

    try {
      // Get raw variant ID and convert to Global ID format
      const rawVariantId = variant?.id || product.variants?.[0]?.id || product.id;
      const variantId = toGlobalId(rawVariantId, 'ProductVariant');
      const price = variant?.price || product.price || 0;
      const image = product.images?.[0]?.src || product.image || null;

      console.log('[Cart] Adding item with variantId:', variantId);

      // Check if item already exists (compare Global IDs)
      const existingIndex = items.findIndex(
        item => item.variantId === variantId
      );

      let newItems;
      if (existingIndex > -1) {
        // Update quantity
        newItems = items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item with Global ID format
        const newItem = {
          id: product.id,
          variantId, // Already in Global ID format
          title: product.title,
          variant: variant?.title || 'Default',
          price: parseFloat(price),
          quantity,
          image,
          handle: product.handle,
        };
        newItems = [...items, newItem];
      }

      // OPTIMISTIC UPDATE: Update UI immediately
      setItems(newItems);

      // Return success IMMEDIATELY for instant UI feedback
      const result = { success: true };

      // Background operations (don't block UI)
      // Use setTimeout to push to next tick, ensuring UI updates first
      setTimeout(async () => {
        try {
          // Save to local storage + cloud sync (background)
          await saveCartToStorage(newItems, cartId);

          // Sync with Shopify if we have a cart (background)
          if (cartId) {
            shopifyService.addToCart(cartId, [
              { merchandiseId: variantId, quantity }
            ])
              .then(updatedCart => setCart(updatedCart))
              .catch(err => console.warn('[Cart] Shopify sync failed:', err));
          }
        } catch (bgError) {
          console.warn('[Cart] Background sync error:', bgError);
        }
      }, 0);

      return result;
    } catch (err) {
      console.error('[Cart] addItem error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [items, cartId]);

  // Update item quantity - OPTIMIZED for instant UI response
  const updateQuantity = useCallback(async (variantId, quantity) => {
    try {
      if (quantity <= 0) {
        return removeItem(variantId);
      }

      const newItems = items.map(item =>
        item.variantId === variantId
          ? { ...item, quantity }
          : item
      );

      // OPTIMISTIC UPDATE: Update UI immediately
      setItems(newItems);

      // Background sync (don't block UI)
      setTimeout(() => {
        saveCartToStorage(newItems, cartId).catch(err =>
          console.warn('[Cart] Background save error:', err)
        );
      }, 0);

      return { success: true };
    } catch (err) {
      console.error('[Cart] updateQuantity error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [items, cartId]);

  // Remove item from cart - OPTIMIZED for instant UI response
  const removeItem = useCallback(async (variantId) => {
    try {
      const newItems = items.filter(item => item.variantId !== variantId);

      // OPTIMISTIC UPDATE: Update UI immediately
      setItems(newItems);

      // Background sync (don't block UI)
      setTimeout(() => {
        saveCartToStorage(newItems, cartId).catch(err =>
          console.warn('[Cart] Background save error:', err)
        );
      }, 0);

      return { success: true };
    } catch (err) {
      console.error('[Cart] removeItem error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [items, cartId]);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      console.log('[Cart] Clearing cart completely');
      setItems([]);
      setCart(null);
      setCartId(null);
      await AsyncStorage.multiRemove([CART_STORAGE_KEY, CART_ID_KEY]);
      return { success: true };
    } catch (err) {
      console.error('[Cart] clearCart error:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Complete checkout - Clear cart and save order reference
  const completeCheckout = useCallback(async (orderId, orderNumber = null) => {
    try {
      console.log('[Cart] Completing checkout, orderId:', orderId);

      // Save order ID for reference
      setLastOrderId(orderId);
      setCheckoutComplete(true);

      // Save to AsyncStorage
      await AsyncStorage.setItem(LAST_ORDER_KEY, JSON.stringify({
        orderId,
        orderNumber,
        completedAt: new Date().toISOString(),
      }));

      // Clear the cart
      await clearCart();

      console.log('[Cart] Checkout completed successfully');

      return { success: true, orderId, orderNumber };
    } catch (err) {
      console.error('[Cart] completeCheckout error:', err);
      return { success: false, error: err.message };
    }
  }, [clearCart]);

  // Reset checkout complete flag
  const resetCheckoutComplete = useCallback(() => {
    setCheckoutComplete(false);
  }, []);

  // Create checkout and get URL
  const createCheckout = useCallback(async () => {
    if (items.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    setLoading(true);

    try {
      // Ensure all merchandiseId are in Global ID format
      const lineItems = items.map(item => ({
        merchandiseId: toGlobalId(item.variantId, 'ProductVariant'),
        quantity: item.quantity,
      }));

      console.log('[Cart] Creating checkout with items:', lineItems);

      const newCart = await shopifyService.createCart(
        lineItems,
        user?.id || null
      );

      setCart(newCart);
      setCartId(newCart.id);
      await AsyncStorage.setItem(CART_ID_KEY, newCart.id);

      console.log('[Cart] Checkout created, URL:', newCart.checkoutUrl);

      return {
        success: true,
        checkoutUrl: newCart.checkoutUrl,
        cart: newCart,
      };
    } catch (err) {
      console.error('[Cart] createCheckout error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [items, user]);

  const value = {
    // State
    cart,
    items,
    itemCount,
    subtotal,
    loading,
    error,
    lastOrderId,
    checkoutComplete,

    // Actions
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    createCheckout,
    loadCartFromStorage,
    completeCheckout,
    resetCheckoutComplete,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
