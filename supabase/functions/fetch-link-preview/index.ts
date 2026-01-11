/**
 * Fetch Link Preview Edge Function
 * Server-side OG tag extraction for link previews
 * With database caching support
 *
 * Features:
 * - Fetch URL and extract OG metadata
 * - Database caching with 7-day expiration
 * - Handle redirects
 * - Timeout protection
 * - Error handling
 * - Twitter Cards support
 * - Video metadata extraction
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// User agent to use for fetching
const USER_AGENT = 'Mozilla/5.0 (compatible; GEM-LinkPreview/1.0; +https://gem.app)';

// Timeout for fetch requests
const FETCH_TIMEOUT = 8000; // 8 seconds

// Blocked domains (spam, adult content, etc.)
const BLOCKED_DOMAINS = [
  'bit.ly', 'goo.gl', 't.co', // URL shorteners often used for spam
];

interface LinkPreviewData {
  url: string;
  original_url?: string;
  domain: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  image_width?: number | null;
  image_height?: number | null;
  site_name: string | null;
  og_type: string | null;
  favicon_url: string | null;
  is_video: boolean;
  video_url?: string | null;
  twitter_card?: string | null;
  twitter_image?: string | null;
  status: 'success' | 'error' | 'timeout' | 'no_og' | 'blocked';
  error_message?: string | null;
  content_type?: string | null;
  cached?: boolean;
}

/**
 * Extract domain from URL
 */
function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Normalize URL (remove tracking params, etc.)
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove common tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    trackingParams.forEach(param => parsed.searchParams.delete(param));
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Check if domain is blocked
 */
function isDomainBlocked(url: string): boolean {
  const domain = getDomain(url);
  return BLOCKED_DOMAINS.some(blocked => domain.includes(blocked));
}

/**
 * Extract OG metadata from HTML
 */
function extractMetadata(html: string, url: string): LinkPreviewData {
  // OG tags
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)?.[1];

  const ogDescription = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i)?.[1];

  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)?.[1];

  const ogImageWidth = html.match(/<meta[^>]*property=["']og:image:width["'][^>]*content=["'](\d+)["']/i)?.[1];
  const ogImageHeight = html.match(/<meta[^>]*property=["']og:image:height["'][^>]*content=["'](\d+)["']/i)?.[1];

  const ogSiteName = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i)?.[1];

  const ogType = html.match(/<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:type["']/i)?.[1];

  // Video metadata (for YouTube, Vimeo, etc.)
  const ogVideo = html.match(/<meta[^>]*property=["']og:video(?::url)?["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:video(?::url)?["']/i)?.[1];

  // Twitter Cards
  const twitterCard = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:card["']/i)?.[1];

  const twitterImage = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i)?.[1];

  // Fallback meta tags
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  const description = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)?.[1];

  // Favicon
  let favicon = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)?.[1] ||
    html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i)?.[1] ||
    html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i)?.[1];

  // Make favicon absolute URL if needed
  if (favicon && !favicon.startsWith('http')) {
    try {
      const base = new URL(url);
      favicon = new URL(favicon, base.origin).href;
    } catch {
      favicon = null;
    }
  }

  // Make image absolute URL if needed
  let image = ogImage || twitterImage;
  if (image && !image.startsWith('http')) {
    try {
      const base = new URL(url);
      image = new URL(image, base.origin).href;
    } catch {
      image = null;
    }
  }

  // Decode HTML entities
  const decodeHtmlEntities = (text: string | null): string | null => {
    if (!text) return null;
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  };

  // Determine if this is video content
  const isVideo = ogType === 'video' || ogType === 'video.movie' ||
    ogType === 'video.episode' || ogType === 'video.other' ||
    twitterCard === 'player' || !!ogVideo;

  // Determine status
  const hasOgData = !!(ogTitle || ogDescription || ogImage);
  const status = hasOgData ? 'success' : 'no_og';

  return {
    url,
    domain: getDomain(url),
    title: decodeHtmlEntities(ogTitle || title) || getDomain(url),
    description: decodeHtmlEntities(ogDescription || description),
    image_url: image,
    image_width: ogImageWidth ? parseInt(ogImageWidth, 10) : null,
    image_height: ogImageHeight ? parseInt(ogImageHeight, 10) : null,
    site_name: decodeHtmlEntities(ogSiteName),
    og_type: ogType || 'website',
    favicon_url: favicon,
    is_video: isVideo,
    video_url: ogVideo || null,
    twitter_card: twitterCard || null,
    twitter_image: twitterImage || null,
    status,
  };
}

/**
 * Fetch URL with timeout
 */
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

/**
 * Get Supabase client
 */
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[LinkPreview] Supabase credentials not found, caching disabled');
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Check cache for existing preview
 */
async function getCachedPreview(supabase: any, url: string): Promise<LinkPreviewData | null> {
  try {
    const { data, error } = await supabase
      .from('link_previews')
      .select('*')
      .eq('url', url)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    // Update last_accessed_at and fetch_count
    await supabase
      .from('link_previews')
      .update({
        last_accessed_at: new Date().toISOString(),
        fetch_count: (data.fetch_count || 1) + 1,
      })
      .eq('id', data.id);

    return {
      url: data.url,
      domain: data.domain,
      title: data.title,
      description: data.description,
      image_url: data.image_url,
      image_width: data.image_width,
      image_height: data.image_height,
      site_name: data.site_name,
      og_type: data.og_type,
      favicon_url: data.favicon_url,
      is_video: data.is_video,
      video_url: data.video_url,
      twitter_card: data.twitter_card,
      twitter_image: data.twitter_image,
      status: data.status,
      cached: true,
    };
  } catch (error) {
    console.error('[LinkPreview] Cache lookup error:', error);
    return null;
  }
}

/**
 * Save preview to cache
 */
async function saveToCache(supabase: any, preview: LinkPreviewData, originalUrl: string): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await supabase
      .from('link_previews')
      .upsert({
        url: preview.url,
        original_url: originalUrl,
        domain: preview.domain,
        title: preview.title,
        description: preview.description,
        image_url: preview.image_url,
        image_width: preview.image_width,
        image_height: preview.image_height,
        site_name: preview.site_name,
        og_type: preview.og_type,
        favicon_url: preview.favicon_url,
        is_video: preview.is_video,
        video_url: preview.video_url,
        twitter_card: preview.twitter_card,
        twitter_image: preview.twitter_image,
        status: preview.status,
        error_message: preview.error_message,
        content_type: preview.content_type,
        fetched_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        last_accessed_at: new Date().toISOString(),
      }, {
        onConflict: 'url',
      });

    console.log('[LinkPreview] Saved to cache:', preview.url);
  } catch (error) {
    console.error('[LinkPreview] Cache save error:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url, force_refresh = false } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Add protocol if missing
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = 'https://' + url;
    }

    // Validate URL
    try {
      new URL(processedUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL', status: 'error' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if domain is blocked
    if (isDomainBlocked(processedUrl)) {
      return new Response(
        JSON.stringify({
          url: processedUrl,
          domain: getDomain(processedUrl),
          title: getDomain(processedUrl),
          description: null,
          image_url: null,
          site_name: null,
          og_type: null,
          favicon_url: null,
          is_video: false,
          status: 'blocked',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Normalize URL
    const normalizedUrl = normalizeUrl(processedUrl);

    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // Check cache (unless force_refresh)
    if (supabase && !force_refresh) {
      const cached = await getCachedPreview(supabase, normalizedUrl);
      if (cached) {
        console.log('[LinkPreview] Cache hit:', normalizedUrl);
        return new Response(
          JSON.stringify(cached),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    console.log('[LinkPreview] Fetching:', normalizedUrl);

    // Fetch the URL
    let response: Response;
    let metadata: LinkPreviewData;

    try {
      response = await fetchWithTimeout(normalizedUrl);
    } catch (error: any) {
      // Timeout or network error
      const isTimeout = error.name === 'AbortError';
      metadata = {
        url: normalizedUrl,
        domain: getDomain(normalizedUrl),
        title: getDomain(normalizedUrl),
        description: null,
        image_url: null,
        site_name: null,
        og_type: null,
        favicon_url: null,
        is_video: false,
        status: isTimeout ? 'timeout' : 'error',
        error_message: error.message,
      };

      // Save error to cache (with shorter expiration)
      if (supabase) {
        await saveToCache(supabase, metadata, url);
      }

      return new Response(
        JSON.stringify(metadata),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!response.ok) {
      console.error('[LinkPreview] Fetch failed:', response.status);
      metadata = {
        url: normalizedUrl,
        domain: getDomain(normalizedUrl),
        title: getDomain(normalizedUrl),
        description: null,
        image_url: null,
        site_name: null,
        og_type: null,
        favicon_url: null,
        is_video: false,
        status: 'error',
        error_message: `HTTP ${response.status}`,
      };

      if (supabase) {
        await saveToCache(supabase, metadata, url);
      }

      return new Response(
        JSON.stringify(metadata),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check content type
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      // Non-HTML content
      metadata = {
        url: normalizedUrl,
        domain: getDomain(normalizedUrl),
        title: getDomain(normalizedUrl),
        description: `${contentType.split(';')[0]} file`,
        image_url: null,
        site_name: null,
        og_type: 'file',
        favicon_url: null,
        is_video: contentType.includes('video'),
        status: 'success',
        content_type: contentType,
      };

      if (supabase) {
        await saveToCache(supabase, metadata, url);
      }

      return new Response(
        JSON.stringify(metadata),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get HTML content (limit to first 100KB for performance)
    const reader = response.body?.getReader();
    let html = '';
    let bytesRead = 0;
    const maxBytes = 100 * 1024; // 100KB

    if (reader) {
      const decoder = new TextDecoder();
      while (bytesRead < maxBytes) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
        bytesRead += value?.length || 0;

        // Stop if we've read the </head> tag
        if (html.includes('</head>')) break;
      }
      reader.releaseLock();
    } else {
      html = await response.text();
    }

    // Extract metadata
    const finalUrl = response.url || normalizedUrl;
    metadata = extractMetadata(html, finalUrl);
    metadata.content_type = contentType;

    // Save to cache
    if (supabase) {
      await saveToCache(supabase, metadata, url);
    }

    console.log('[LinkPreview] Success:', metadata.title);

    return new Response(
      JSON.stringify(metadata),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('[LinkPreview] Error:', error);

    // Return basic preview on error
    let url = '';
    try {
      const body = await req.clone().json();
      url = body.url || '';
    } catch {
      // Ignore parse error
    }

    return new Response(
      JSON.stringify({
        url,
        domain: url ? getDomain(url) : '',
        title: url ? getDomain(url) : 'Unknown',
        description: null,
        image_url: null,
        site_name: null,
        og_type: null,
        favicon_url: null,
        is_video: false,
        status: 'error',
        error_message: error.message,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
