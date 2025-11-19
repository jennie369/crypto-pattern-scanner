// =====================================================
// SHOPIFY CART EDGE FUNCTION
// =====================================================
// Purpose: Manage shopping cart via Shopify Storefront API (no CORS!)
// Endpoint: POST /functions/v1/shopify-cart
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Environment variables
const SHOPIFY_DOMAIN = Deno.env.get('SHOPIFY_DOMAIN')!;
const SHOPIFY_STOREFRONT_TOKEN = Deno.env.get('SHOPIFY_STOREFRONT_TOKEN')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const SHOPIFY_GRAPHQL_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
};

// Helper: Make GraphQL query to Shopify
async function shopifyQuery(query: string, variables: any = {}) {
  console.log('📡 Calling Shopify Storefront API...');

  const response = await fetch(SHOPIFY_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Shopify API error: ${response.status} - ${error}`);
  }

  const { data, errors } = await response.json();

  if (errors && errors.length > 0) {
    throw new Error(`Shopify GraphQL error: ${errors[0].message}`);
  }

  return data;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🛒 Shopify Cart API called');

    const requestBody = await req.json();
    const { action, cartId, lineItems, lines, userId, sessionId } = requestBody;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ==============================================
    // ACTION: CREATE CART
    // ==============================================
    if (action === 'createCart') {
      console.log('🆕 Creating new cart...');

      const query = `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
              totalQuantity
              cost {
                subtotalAmount {
                  amount
                  currencyCode
                }
                totalAmount {
                  amount
                  currencyCode
                }
              }
              lines(first: 50) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                        product {
                          id
                          title
                          handle
                        }
                        priceV2 {
                          amount
                          currencyCode
                        }
                        image {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        input: {
          lines: lineItems || [],
        },
      };

      const data = await shopifyQuery(query, variables);

      if (data.cartCreate.userErrors.length > 0) {
        throw new Error(data.cartCreate.userErrors[0].message);
      }

      const cart = data.cartCreate.cart;

      console.log(`✅ Cart created: ${cart.id}`);

      // Save cart to database
      const { data: savedCart, error: saveError } = await supabase
        .from('shopping_carts')
        .insert({
          user_id: userId || null,
          session_id: sessionId || null,
          shopify_cart_id: cart.id,
          checkout_url: cart.checkoutUrl,
          items: cart.lines.edges.map((e: any) => e.node),
          subtotal: parseFloat(cart.cost.subtotalAmount.amount),
          total: parseFloat(cart.cost.totalAmount.amount),
          currency: cart.cost.totalAmount.currencyCode,
        })
        .select()
        .single();

      if (saveError) {
        console.warn('⚠️ Failed to save cart to database:', saveError.message);
      }

      return new Response(JSON.stringify({
        success: true,
        cart: {
          id: cart.id,
          checkoutUrl: cart.checkoutUrl,
          totalQuantity: cart.totalQuantity,
          subtotal: cart.cost.subtotalAmount.amount,
          total: cart.cost.totalAmount.amount,
          currency: cart.cost.totalAmount.currencyCode,
          lines: cart.lines.edges,
        },
        dbCartId: savedCart?.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ==============================================
    // ACTION: ADD TO CART
    // ==============================================
    else if (action === 'addToCart' && cartId) {
      console.log(`➕ Adding items to cart: ${cartId}`);

      const query = `
        mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
              id
              checkoutUrl
              totalQuantity
              cost {
                subtotalAmount {
                  amount
                  currencyCode
                }
                totalAmount {
                  amount
                  currencyCode
                }
              }
              lines(first: 50) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                        priceV2 {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        cartId,
        lines: lines || lineItems || [],
      };

      const data = await shopifyQuery(query, variables);

      if (data.cartLinesAdd.userErrors.length > 0) {
        throw new Error(data.cartLinesAdd.userErrors[0].message);
      }

      const cart = data.cartLinesAdd.cart;

      console.log(`✅ Items added. Total quantity: ${cart.totalQuantity}`);

      // Update database
      await supabase
        .from('shopping_carts')
        .update({
          items: cart.lines.edges.map((e: any) => e.node),
          subtotal: parseFloat(cart.cost.subtotalAmount.amount),
          total: parseFloat(cart.cost.totalAmount.amount),
          updated_at: new Date().toISOString(),
        })
        .eq('shopify_cart_id', cartId);

      return new Response(JSON.stringify({
        success: true,
        cart: {
          id: cart.id,
          checkoutUrl: cart.checkoutUrl,
          totalQuantity: cart.totalQuantity,
          subtotal: cart.cost.subtotalAmount.amount,
          total: cart.cost.totalAmount.amount,
          lines: cart.lines.edges,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ==============================================
    // ACTION: UPDATE CART LINE
    // ==============================================
    else if (action === 'updateCart' && cartId) {
      console.log(`✏️ Updating cart: ${cartId}`);

      const query = `
        mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
          cartLinesUpdate(cartId: $cartId, lines: $lines) {
            cart {
              id
              totalQuantity
              cost {
                subtotalAmount {
                  amount
                }
                totalAmount {
                  amount
                }
              }
              lines(first: 50) {
                edges {
                  node {
                    id
                    quantity
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const data = await shopifyQuery(query, { cartId, lines });

      if (data.cartLinesUpdate.userErrors.length > 0) {
        throw new Error(data.cartLinesUpdate.userErrors[0].message);
      }

      console.log('✅ Cart updated');

      return new Response(JSON.stringify({
        success: true,
        cart: data.cartLinesUpdate.cart,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ==============================================
    // ACTION: REMOVE FROM CART
    // ==============================================
    else if (action === 'removeFromCart' && cartId) {
      console.log(`🗑️ Removing items from cart: ${cartId}`);

      const { lineIds } = requestBody;

      const query = `
        mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
          cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
            cart {
              id
              totalQuantity
              cost {
                subtotalAmount {
                  amount
                }
                totalAmount {
                  amount
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const data = await shopifyQuery(query, { cartId, lineIds });

      if (data.cartLinesRemove.userErrors.length > 0) {
        throw new Error(data.cartLinesRemove.userErrors[0].message);
      }

      console.log('✅ Items removed from cart');

      return new Response(JSON.stringify({
        success: true,
        cart: data.cartLinesRemove.cart,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ==============================================
    // ACTION: GET CART
    // ==============================================
    else if (action === 'getCart' && cartId) {
      console.log(`📦 Fetching cart: ${cartId}`);

      const query = `
        query getCart($cartId: ID!) {
          cart(id: $cartId) {
            id
            checkoutUrl
            totalQuantity
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
            }
            lines(first: 50) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product {
                        title
                        handle
                      }
                      priceV2 {
                        amount
                        currencyCode
                      }
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const data = await shopifyQuery(query, { cartId });

      console.log('✅ Cart fetched');

      return new Response(JSON.stringify({
        success: true,
        cart: data.cart,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ==============================================
    // INVALID ACTION
    // ==============================================
    else {
      throw new Error(
        `Invalid action: ${action}. Valid actions: createCart, addToCart, updateCart, removeFromCart, getCart`
      );
    }

  } catch (error) {
    console.error('❌ Error:', error.message);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.toString(),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/* ==============================================
   USAGE EXAMPLES
   ==============================================

   1. Create cart:
   POST /functions/v1/shopify-cart
   {
     "action": "createCart",
     "lineItems": [
       {
         "merchandiseId": "gid://shopify/ProductVariant/123",
         "quantity": 1
       }
     ],
     "userId": "uuid-here",
     "sessionId": "session-id-here"
   }

   2. Add to existing cart:
   POST /functions/v1/shopify-cart
   {
     "action": "addToCart",
     "cartId": "gid://shopify/Cart/abc123",
     "lines": [
       {
         "merchandiseId": "gid://shopify/ProductVariant/456",
         "quantity": 2
       }
     ]
   }

   3. Update cart line:
   POST /functions/v1/shopify-cart
   {
     "action": "updateCart",
     "cartId": "gid://shopify/Cart/abc123",
     "lines": [
       {
         "id": "gid://shopify/CartLine/xyz",
         "quantity": 3
       }
     ]
   }

   4. Remove from cart:
   POST /functions/v1/shopify-cart
   {
     "action": "removeFromCart",
     "cartId": "gid://shopify/Cart/abc123",
     "lineIds": ["gid://shopify/CartLine/xyz"]
   }

   5. Get cart:
   POST /functions/v1/shopify-cart
   {
     "action": "getCart",
     "cartId": "gid://shopify/Cart/abc123"
   }
   ============================================== */
