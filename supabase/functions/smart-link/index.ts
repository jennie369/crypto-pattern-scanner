/**
 * Gemral - Smart Link Redirect Service
 *
 * Handles affiliate links and redirects:
 * 1. Tries to open app via Universal Link / App Link
 * 2. Falls back to custom scheme (gem://)
 * 3. Redirects to App Store / Play Store if app not installed
 * 4. Tracks clicks in database
 *
 * URL Format: https://gemral.com/products/{handle}?ref={affiliateCode}&pid={productId}
 *
 * NOTE: This function requires a dedicated subdomain (e.g., go.gemral.com) that is NOT on Shopify,
 * since Shopify handles all traffic to gemral.com and doesn't allow custom server-side logic.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// App Store URLs
const APP_STORE_IOS = 'https://apps.apple.com/app/gemral/id6738421498';
const APP_STORE_ANDROID = 'https://play.google.com/store/apps/details?id=com.gemral.mobile';

// App scheme
const APP_SCHEME = 'gem';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // Extract short code from path: /p/{shortCode}
    const pathMatch = path.match(/^\/p\/([^/?]+)/);
    if (!pathMatch) {
      // Not a product link, show error page
      return new Response(getErrorPage(), {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        status: 404,
      });
    }

    const shortCode = pathMatch[1];

    // Get query params
    const affiliateCode = url.searchParams.get('ref') || url.searchParams.get('aff') || '';
    const productId = url.searchParams.get('pid') || '';
    const productHandle = url.searchParams.get('handle') || '';

    // Detect platform
    const userAgent = req.headers.get('user-agent') || '';
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isMobile = isIOS || isAndroid;

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Track click in database
    try {
      await trackClick(supabase, shortCode, affiliateCode, {
        platform: isIOS ? 'ios' : isAndroid ? 'android' : 'web',
        userAgent: userAgent.substring(0, 500),
      });
    } catch (error) {
      console.error('Error tracking click:', error);
      // Continue even if tracking fails
    }

    // Lookup product info if shortCode exists
    let productInfo = null;
    try {
      const { data } = await supabase
        .from('affiliate_codes')
        .select('product_id, product_name, product_handle, product_type')
        .eq('short_code', shortCode)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (data) {
        productInfo = data;
      }
    } catch (error) {
      console.log('Product lookup error:', error);
    }

    // Build deep link URL
    const deepLinkParams = new URLSearchParams();
    if (affiliateCode) deepLinkParams.set('ref', affiliateCode);
    if (productId || productInfo?.product_id) {
      deepLinkParams.set('pid', productId || productInfo.product_id);
    }
    if (productHandle || productInfo?.product_handle) {
      deepLinkParams.set('handle', productHandle || productInfo.product_handle);
    }

    const deepLink = `${APP_SCHEME}://product/${shortCode}?${deepLinkParams.toString()}`;
    const appStoreUrl = isIOS ? APP_STORE_IOS : APP_STORE_ANDROID;

    // For mobile, show smart redirect page
    if (isMobile) {
      return new Response(
        getSmartRedirectPage({
          shortCode,
          affiliateCode,
          productId: productId || productInfo?.product_id,
          productHandle: productHandle || productInfo?.product_handle,
          productName: productInfo?.product_name || 'Sản phẩm',
          deepLink,
          appStoreUrl,
          isIOS,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        }
      );
    }

    // For desktop, redirect to Shopify product page
    const shopifyUrl = productHandle || productInfo?.product_handle
      ? `https://gemral.com/products/${productHandle || productInfo.product_handle}?ref=${affiliateCode}`
      : 'https://gemral.com/collections/all';

    return Response.redirect(shopifyUrl, 302);
  } catch (error) {
    console.error('Smart link error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Track click in database
 */
async function trackClick(
  supabase: any,
  shortCode: string,
  affiliateCode: string,
  metadata: { platform: string; userAgent: string }
) {
  // Try to increment clicks on the affiliate_codes table
  if (affiliateCode) {
    await supabase.rpc('increment_affiliate_clicks', {
      code_param: affiliateCode,
    });
  }

  // Also try by short_code if we have it
  if (shortCode) {
    await supabase
      .from('affiliate_codes')
      .update({
        clicks: supabase.sql`COALESCE(clicks, 0) + 1`,
        last_clicked_at: new Date().toISOString(),
      })
      .eq('short_code', shortCode)
      .eq('is_active', true);
  }

  // Log the click for analytics
  console.log('Click tracked:', { shortCode, affiliateCode, ...metadata });
}

/**
 * Generate smart redirect HTML page
 */
function getSmartRedirectPage(params: {
  shortCode: string;
  affiliateCode: string;
  productId?: string;
  productHandle?: string;
  productName: string;
  deepLink: string;
  appStoreUrl: string;
  isIOS: boolean;
}) {
  const { shortCode, affiliateCode, productId, productName, deepLink, appStoreUrl, isIOS } = params;

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đang mở ${productName} - Gemral</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(180deg, #0F0F2B 0%, #05040B 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #fff;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #FFBD59 0%, #D4A03C 100%);
      border-radius: 20px;
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #FFBD59;
    }
    p {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 189, 89, 0.3);
      border-top-color: #FFBD59;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 24px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .btn {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #FFBD59 0%, #D4A03C 100%);
      color: #05040B;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      margin: 8px;
      transition: transform 0.2s, opacity 0.2s;
    }
    .btn:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .affiliate-badge {
      display: inline-block;
      padding: 6px 12px;
      background: rgba(106, 91, 255, 0.2);
      border: 1px solid rgba(106, 91, 255, 0.5);
      border-radius: 20px;
      font-size: 12px;
      color: #9D8CFF;
      margin-bottom: 16px;
    }
    .hidden { display: none !important; }
    #status { margin-top: 16px; font-size: 14px; color: rgba(255, 255, 255, 0.5); }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">💎</div>
    ${affiliateCode ? `<div class="affiliate-badge">Mã giới thiệu: ${affiliateCode}</div>` : ''}
    <h1>Đang mở ứng dụng...</h1>
    <p>Vui lòng chờ trong giây lát. Nếu ứng dụng không tự động mở, hãy nhấn nút bên dưới.</p>

    <div class="spinner" id="spinner"></div>

    <div id="buttons" class="hidden">
      <a href="${deepLink}" class="btn" id="openApp">Mở trong ứng dụng</a>
      <br>
      <a href="${appStoreUrl}" class="btn btn-secondary" id="getApp">
        ${isIOS ? 'Tải từ App Store' : 'Tải từ Google Play'}
      </a>
    </div>

    <p id="status"></p>
  </div>

  <script>
    // Configuration
    const deepLink = '${deepLink}';
    const appStoreUrl = '${appStoreUrl}';
    const affiliateCode = '${affiliateCode}';
    const productId = '${productId || ''}';

    let appOpened = false;

    // Store affiliate link data for deferred deep linking
    function storeAffiliateData() {
      try {
        const data = {
          shortCode: '${shortCode}',
          affiliateCode: affiliateCode,
          productId: productId,
          productHandle: '${params.productHandle || ''}',
          timestamp: Date.now(),
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
        };
        localStorage.setItem('gem_deferred_affiliate', JSON.stringify(data));
        console.log('Stored affiliate data for deferred deep linking');
      } catch (e) {
        console.log('Could not store affiliate data:', e);
      }
    }

    // Try to open app
    function tryOpenApp() {
      console.log('Attempting to open app with:', deepLink);

      // Track visibility change to detect if app opened
      let hidden = false;
      const visibilityHandler = () => {
        if (document.hidden) {
          hidden = true;
          appOpened = true;
          console.log('App likely opened (page hidden)');
        }
      };
      document.addEventListener('visibilitychange', visibilityHandler);

      // Try opening via iframe (for custom scheme)
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = deepLink;
      document.body.appendChild(iframe);

      // Also try window.location for Universal Links
      setTimeout(() => {
        if (!appOpened) {
          window.location.href = deepLink;
        }
      }, 100);

      // Show buttons after delay if app didn't open
      setTimeout(() => {
        document.removeEventListener('visibilitychange', visibilityHandler);

        if (!appOpened && !hidden) {
          document.getElementById('spinner').classList.add('hidden');
          document.getElementById('buttons').classList.remove('hidden');
          document.getElementById('status').textContent = 'Ứng dụng chưa được cài đặt? Tải ngay!';

          // Store data for deferred linking
          storeAffiliateData();
        }
      }, 2500);
    }

    // Start
    tryOpenApp();
  </script>
</body>
</html>
  `;
}

/**
 * Generate error page HTML
 */
function getErrorPage() {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link không hợp lệ - Gemral</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(180deg, #0F0F2B 0%, #05040B 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #fff;
    }
    .container { text-align: center; }
    h1 { font-size: 24px; color: #FF6B6B; margin-bottom: 16px; }
    p { color: rgba(255, 255, 255, 0.7); margin-bottom: 24px; }
    a {
      display: inline-block;
      padding: 12px 24px;
      background: #FFBD59;
      color: #05040B;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Link không hợp lệ</h1>
    <p>Đường dẫn này không tồn tại hoặc đã hết hạn.</p>
    <a href="https://gemral.com">Về trang chủ</a>
  </div>
</body>
</html>
  `;
}
