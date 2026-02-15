/**
 * Gemral - Well-Known Files Service
 *
 * Serves Apple App Site Association (AASA) and Android assetlinks.json
 * for Universal Links and App Links verification.
 *
 * Endpoints:
 *   GET /well-known?file=apple-app-site-association
 *   GET /well-known?file=assetlinks.json
 *
 * NOTE: For Universal Links/App Links to work, these files must be served
 * from the SAME domain that's in app.json associatedDomains / intentFilters.
 * Since gemral.com is on Shopify, these files should be served from a subdomain
 * (e.g., go.gemral.com) that points to Supabase edge functions, OR the app.json
 * should reference the Supabase project URL directly.
 *
 * Setup instructions for go.gemral.com:
 * 1. Add CNAME record: go.gemral.com → pgfkbcnzqozzkohwbgbk.supabase.co
 * 2. Configure Supabase custom domain for edge functions
 * 3. Update app.json associatedDomains to include go.gemral.com
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// App identifiers
const IOS_BUNDLE_ID = 'com.gemral.mobile';
const IOS_TEAM_ID = 'XLB789JKY6';
const ANDROID_PACKAGE = 'com.gemral.mobile';
const ANDROID_SHA256 = 'DE:94:98:34:39:FC:59:F3:A0:52:74:BF:31:51:B7:64:79:2D:B5:D9:C8:9F:D0:1C:A2:C2:9E:E0:B5:02:17:9A';

/**
 * Apple App Site Association file
 * Tells iOS which paths should open in the Gemral app
 */
const AASA = {
  applinks: {
    details: [
      {
        appIDs: [`${IOS_TEAM_ID}.${IOS_BUNDLE_ID}`],
        components: [
          { '/': '/courses/*', comment: 'Course detail pages' },
          { '/': '/courses/*/lessons/*', comment: 'Lesson pages' },
          { '/': '/courses/*/modules/*', comment: 'Module pages' },
          { '/': '/forum/thread/*', comment: 'Forum post detail' },
          { '/': '/post/*', comment: 'Legacy post links' },
          { '/': '/shop/product/*', comment: 'Product detail' },
          { '/': '/products/*', comment: 'Shopify product handle' },
          { '/': '/p/*', comment: 'Short affiliate links' },
        ],
      },
    ],
  },
  webcredentials: {
    apps: [`${IOS_TEAM_ID}.${IOS_BUNDLE_ID}`],
  },
};

/**
 * Android Asset Links file
 * Tells Android which app should handle links from this domain
 */
const ASSET_LINKS = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: ANDROID_PACKAGE,
      sha256_cert_fingerprints: [ANDROID_SHA256],
    },
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const file = url.searchParams.get('file') || '';

    if (file === 'apple-app-site-association' || file === 'aasa') {
      return new Response(JSON.stringify(AASA), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    if (file === 'assetlinks.json' || file === 'assetlinks') {
      return new Response(JSON.stringify(ASSET_LINKS), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Default: return both as a diagnostic page
    return new Response(
      JSON.stringify({
        info: 'Gemral Well-Known Files Service',
        usage: {
          aasa: '/well-known?file=apple-app-site-association',
          assetlinks: '/well-known?file=assetlinks.json',
        },
        note: 'These files must be served from the domain listed in app.json associatedDomains. See setup instructions in the source code.',
        setup: {
          step1: 'Create DNS CNAME: go.gemral.com → pgfkbcnzqozzkohwbgbk.supabase.co',
          step2: 'Update app.json associatedDomains to include applinks:go.gemral.com',
          step3: 'Configure Supabase custom domain or use Vercel/Netlify proxy',
          step4: 'Replace IOS_TEAM_ID and ANDROID_SHA256 with real values',
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('[well-known] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
