/**
 * Gemral - OG Meta Tag Service
 *
 * Serves dynamic Open Graph meta tags for shared URLs so that
 * social platforms (Facebook, Telegram, iMessage, etc.) render
 * rich link previews for courses, forum threads, products, and
 * affiliate links.
 *
 * Endpoint: GET /og-meta?path=/courses/123
 *
 * Returns: HTML page with OG meta tags + redirect to app/web.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const SITE_NAME = 'Gemral';
const DEFAULT_IMAGE = 'https://gemral.com/og-default.png';
const DEFAULT_DESCRIPTION = 'Nền tảng giao dịch & phát triển bản thân hàng đầu Việt Nam';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path') || url.pathname;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let og = {
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      image: DEFAULT_IMAGE,
      url: `https://gemral.com${path}`,
      type: 'website',
    };

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
        const author = data.profiles?.display_name || '';
        og.title = `${data.title} | ${SITE_NAME}`;
        og.description = (data.content || '').replace(/<[^>]*>/g, '').slice(0, 200);
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

    // Return HTML with OG tags
    const html = buildOGPage(og);
    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600',
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

function buildOGPage(og: {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
}) {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(og.title)}</title>

  <!-- Open Graph -->
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

  <!-- Redirect to actual page after bots have read OG tags -->
  <meta http-equiv="refresh" content="0;url=${esc(og.url)}" />
</head>
<body>
  <p>Redirecting to <a href="${esc(og.url)}">${esc(og.title)}</a>...</p>
</body>
</html>`;
}
