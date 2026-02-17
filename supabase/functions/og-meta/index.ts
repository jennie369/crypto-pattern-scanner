/**
 * Gemral - OG Meta Tag + Smart Link Service
 *
 * Serves dynamic Open Graph meta tags for social platform previews
 * AND handles smart redirect for human visitors (try app → fallback landing page).
 *
 * Endpoint: GET /og-meta?path=/courses/123
 *
 * Flow:
 * 1. Crawler (Facebook, Telegram, etc.) → Returns HTML with OG tags only
 * 2. Human visitor on mobile → Returns smart redirect page (try app → app store)
 * 3. Human visitor on desktop → Returns landing page with app download CTA
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const SITE_NAME = 'Gemral';
const DEFAULT_IMAGE = 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/assets/og-default.png';
const DEFAULT_DESCRIPTION = 'Nền tảng giao dịch & phát triển bản thân hàng đầu Việt Nam';
const APP_SCHEME = 'gem';
const APP_STORE_IOS = 'https://apps.apple.com/app/gemral/id6738421498';
const APP_STORE_ANDROID = 'https://play.google.com/store/apps/details?id=com.gemral.mobile';

// Bot/crawler user-agent patterns
const CRAWLER_REGEX = /facebookexternalhit|Facebot|Twitterbot|TelegramBot|LinkedInBot|WhatsApp|Slackbot|Discordbot|Googlebot|bingbot|yandex|pinterest|Applebot|bot|crawl|spider|preview/i;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path') || '/';
    const userAgent = req.headers.get('user-agent') || '';
    const isCrawler = CRAWLER_REGEX.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isMobile = isIOS || isAndroid;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build OG metadata from path
    const og = await buildOGData(supabase, path);

    // For crawlers: return minimal HTML with just OG tags (no redirect)
    if (isCrawler) {
      const html = buildCrawlerPage(og);
      return new Response(html, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300, s-maxage=600',
        },
      });
    }

    // For human visitors: return smart redirect + fallback landing page
    const deepLink = buildDeepLink(path);
    const appStoreUrl = isIOS ? APP_STORE_IOS : APP_STORE_ANDROID;

    const html = buildSmartLandingPage(og, {
      deepLink,
      appStoreUrl,
      isIOS,
      isMobile,
      path,
    });

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('[og-meta] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

/**
 * Build OG metadata by looking up content from the database
 */
async function buildOGData(
  supabase: any,
  path: string,
): Promise<{ title: string; description: string; image: string; url: string; type: string }> {
  const og = {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    image: DEFAULT_IMAGE,
    url: `https://gemral.com${path}`,
    type: 'website',
  };

  try {
    // --- Course detail: /courses/{id} ---
    const courseMatch = path.match(/^\/courses\/([a-f0-9-]+)/i);
    if (courseMatch) {
      const { data } = await supabase
        .from('courses')
        .select('title, description, thumbnail_url')
        .eq('id', courseMatch[1])
        .limit(1)
        .single();
      if (data) {
        og.title = `${data.title} | ${SITE_NAME}`;
        og.description = (data.description || '').slice(0, 200);
        og.image = data.thumbnail_url || DEFAULT_IMAGE;
        og.type = 'article';
      }
    }

    // --- Forum thread: /forum/thread/{id} or legacy /post/{id} ---
    const threadMatch = path.match(/^\/(?:forum\/thread|post)\/([a-f0-9-]+)/i);
    if (threadMatch) {
      const { data } = await supabase
        .from('forum_posts')
        .select('title, content, profiles!inner(display_name)')
        .eq('id', threadMatch[1])
        .limit(1)
        .single();
      if (data) {
        const author = (data as any).profiles?.display_name || '';
        og.title = `${(data as any).title || 'Bài viết'} | ${SITE_NAME}`;
        og.description = ((data as any).content || '').replace(/<[^>]*>/g, '').slice(0, 200);
        if (author) og.description = `Bởi ${author} — ${og.description}`;
        og.type = 'article';
      }
    }

    // --- Shop product: /products/{handle} ---
    const productMatch = path.match(/^\/products\/([^/?]+)/i);
    if (productMatch) {
      const { data } = await supabase
        .from('shopify_products')
        .select('title, body_html, image_url, price')
        .eq('handle', productMatch[1])
        .limit(1)
        .single();
      if (data) {
        og.title = `${data.title} | ${SITE_NAME}`;
        og.description = (data.body_html || '').replace(/<[^>]*>/g, '').slice(0, 200);
        og.image = data.image_url || DEFAULT_IMAGE;
        og.type = 'product';
      }
    }

    // --- Shop collection: /shop ---
    if (path === '/shop' || path === '/shop/') {
      og.title = `Cửa Hàng | ${SITE_NAME}`;
      og.description = 'Khám phá các sản phẩm và khóa học tại Gemral';
    }

    // --- Courses listing: /courses ---
    if (path === '/courses' || path === '/courses/') {
      og.title = `Khóa Học | ${SITE_NAME}`;
      og.description = 'Khám phá các khóa học phát triển bản thân tại Gemral';
    }

    // --- Forum: /forum ---
    if (path === '/forum' || path === '/forum/') {
      og.title = `Diễn Đàn | ${SITE_NAME}`;
      og.description = 'Cộng đồng chia sẻ kiến thức và kinh nghiệm tại Gemral';
    }
  } catch (error) {
    console.error('[og-meta] Error building OG data:', error);
    // Return defaults on error
  }

  return og;
}

/**
 * Build deep link from path
 */
function buildDeepLink(path: string): string {
  // Map web paths to app deep link paths
  return `${APP_SCHEME}:/${path}`;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Build minimal HTML page for crawlers (OG tags only, no JS redirect)
 */
function buildCrawlerPage(og: { title: string; description: string; image: string; url: string; type: string }) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${esc(og.title)}</title>

  <!-- Open Graph -->
  <meta property="og:type" content="${esc(og.type)}" />
  <meta property="og:site_name" content="${esc(SITE_NAME)}" />
  <meta property="og:title" content="${esc(og.title)}" />
  <meta property="og:description" content="${esc(og.description)}" />
  <meta property="og:image" content="${esc(og.image)}" />
  <meta property="og:url" content="${esc(og.url)}" />
  <meta property="fb:app_id" content="gemral" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(og.title)}" />
  <meta name="twitter:description" content="${esc(og.description)}" />
  <meta name="twitter:image" content="${esc(og.image)}" />

  <!-- iOS Smart Banner -->
  <meta name="apple-itunes-app" content="app-id=6738421498, app-argument=${esc(og.url)}" />
</head>
<body>
  <h1>${esc(og.title)}</h1>
  <p>${esc(og.description)}</p>
</body>
</html>`;
}

/**
 * Build smart landing page for human visitors
 * - Mobile: tries to open app, falls back to app store buttons
 * - Desktop: shows content preview + app download CTAs
 */
function buildSmartLandingPage(
  og: { title: string; description: string; image: string; url: string; type: string },
  opts: { deepLink: string; appStoreUrl: string; isIOS: boolean; isMobile: boolean; path: string },
) {
  const { deepLink, appStoreUrl, isIOS, isMobile, path } = opts;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(og.title)}</title>

  <!-- Open Graph (for re-sharing from browser) -->
  <meta property="og:type" content="${esc(og.type)}" />
  <meta property="og:site_name" content="${esc(SITE_NAME)}" />
  <meta property="og:title" content="${esc(og.title)}" />
  <meta property="og:description" content="${esc(og.description)}" />
  <meta property="og:image" content="${esc(og.image)}" />
  <meta property="og:url" content="${esc(og.url)}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(og.title)}" />
  <meta name="twitter:description" content="${esc(og.description)}" />
  <meta name="twitter:image" content="${esc(og.image)}" />

  <!-- iOS Smart Banner -->
  <meta name="apple-itunes-app" content="app-id=6738421498, app-argument=${esc(og.url)}" />

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
      padding: 24px;
      color: #fff;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 32px 24px;
      max-width: 420px;
      width: 100%;
      text-align: center;
    }
    .logo {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #FFBD59 0%, #D4A03C 100%);
      border-radius: 18px;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: bold;
      color: #05040B;
    }
    .preview-image {
      width: 100%;
      max-height: 200px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 10px;
      color: #FFBD59;
      line-height: 1.3;
    }
    .description {
      font-size: 15px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(255, 189, 89, 0.2);
      border-top-color: #FFBD59;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .status {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 20px;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 14px 24px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      text-decoration: none;
      text-align: center;
      cursor: pointer;
      margin-bottom: 10px;
      transition: transform 0.15s, opacity 0.15s;
    }
    .btn:active { transform: scale(0.98); opacity: 0.9; }
    .btn-primary {
      background: linear-gradient(135deg, #FFBD59 0%, #D4A03C 100%);
      color: #05040B;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .btn-store {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .store-row {
      display: flex;
      gap: 10px;
      margin-top: 12px;
    }
    .store-row .btn { flex: 1; }
    .divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 20px 0;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.3);
    }
    .hidden { display: none !important; }
    #phase-redirect { display: block; }
    #phase-fallback { display: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">G</div>

    ${og.image !== DEFAULT_IMAGE ? `<img src="${esc(og.image)}" alt="" class="preview-image" onerror="this.style.display='none'" />` : ''}

    <h1>${esc(og.title)}</h1>
    <p class="description">${esc(og.description)}</p>

    <!-- Phase 1: Trying to open app -->
    <div id="phase-redirect">
      <div class="spinner"></div>
      <p class="status">${isMobile ? 'Đang mở ứng dụng Gemral...' : 'Xem nội dung trong ứng dụng Gemral'}</p>
    </div>

    <!-- Phase 2: Fallback buttons -->
    <div id="phase-fallback" class="hidden">
      <a href="${esc(deepLink)}" class="btn btn-primary" id="btn-open-app">Mở trong ứng dụng Gemral</a>

      <div class="divider"></div>

      <p class="status">Chưa cài ứng dụng?</p>
      <div class="store-row">
        <a href="${esc(APP_STORE_IOS)}" class="btn btn-store">App Store</a>
        <a href="${esc(APP_STORE_ANDROID)}" class="btn btn-store">Google Play</a>
      </div>
    </div>

    <p class="footer">gemral.com</p>
  </div>

  <script>
    (function() {
      var deepLink = '${esc(deepLink)}';
      var isMobile = ${isMobile ? 'true' : 'false'};
      var appOpened = false;

      function showFallback() {
        if (appOpened) return;
        document.getElementById('phase-redirect').classList.add('hidden');
        document.getElementById('phase-fallback').classList.remove('hidden');
      }

      if (!isMobile) {
        // Desktop: show fallback immediately
        showFallback();
        return;
      }

      // Mobile: try to open app
      var hidden = false;
      document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
          hidden = true;
          appOpened = true;
        }
      });

      // Try opening via intent/universal link
      window.location.href = deepLink;

      // Show fallback buttons after 2.5s if app didn't open
      setTimeout(function() {
        if (!appOpened && !hidden) {
          showFallback();
        }
      }, 2500);
    })();
  </script>
</body>
</html>`;
}
