# KOL Intelligence — Phase 2: Platform Crawlers

## Architecture Overview

Each platform has its own edge function for isolation and independent deployment.
All crawlers output a **normalized structure** consumed by the scoring engine.

```
kol-intelligence-crawl (orchestrator)
  |
  ├── kol-crawl-tiktok
  ├── kol-crawl-instagram
  ├── kol-crawl-youtube
  ├── kol-crawl-facebook
  └── kol-crawl-twitter
```

---

## Normalized Output Structure (all crawlers)

```typescript
interface CrawlResult {
  platform: 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'twitter';
  success: boolean;
  error?: string;

  // Profile data
  profile: {
    username: string;
    display_name: string;
    bio: string;
    profile_url: string;
    avatar_url: string;
    is_verified: boolean; // platform blue check
    is_private: boolean;
    account_created?: string; // ISO date if available
  };

  // Follower metrics
  followers: number;
  following: number;

  // Content metrics (from last 12 posts)
  posts: {
    total_count: number; // total posts on profile
    recent_count: number; // posts in last 30 days
    analyzed_count: number; // how many we analyzed (max 12)
    avg_likes: number;
    avg_comments: number;
    avg_views: number; // 0 if not available
    avg_shares: number; // 0 if not available
    post_frequency_per_week: number;
    posts_data: PostData[]; // raw post data
  };

  // Metadata
  crawled_at: string; // ISO timestamp
  response_time_ms: number;
  crawler_version: string;
}

interface PostData {
  post_id: string;
  post_url: string;
  posted_at: string; // ISO date
  likes: number;
  comments: number;
  views: number;
  shares: number;
  type: 'image' | 'video' | 'carousel' | 'text' | 'reel' | 'short';
}
```

---

## Crawler 1: TikTok (`kol-crawl-tiktok/index.ts`)

### Data Source Strategy
1. **Primary**: TikTok Research API (requires approved application)
2. **Fallback**: RapidAPI TikTok scraper (paid, ~$10/month)
3. **Last resort**: Public embed endpoint parsing

### Implementation
```
Input: TikTok profile URL (e.g., https://tiktok.com/@username)
  |
  v
Extract username from URL (@username)
  |
  v
Call API: GET user info → followers, following, heart count, video count
  |
  v
Call API: GET user videos (last 12) → likes, comments, views, shares per video
  |
  v
Normalize to CrawlResult → return
```

### API Endpoints
- User info: `/api/user/info?unique_id={username}`
- User videos: `/api/user/posts?unique_id={username}&count=12`

### Rate Limits
- TikTok Research API: 1000 requests/day
- RapidAPI: Varies by plan (100-10000/month)

### Edge Cases
- Private account → `is_private: true`, followers=0
- Username changed → 404, try search by display name
- URL format variants: `tiktok.com/@user`, `vm.tiktok.com/XXXXX`
- Numeric follower display (1.2M) → parse to 1200000

---

## Crawler 2: Instagram (`kol-crawl-instagram/index.ts`)

### Data Source Strategy
1. **Primary**: Instagram Graph API (requires Business/Creator account + token)
2. **Fallback**: RapidAPI Instagram scraper
3. **Last resort**: Public profile JSON endpoint (`?__a=1&__d=1`)

### Implementation
```
Input: Instagram profile URL (e.g., https://instagram.com/username)
  |
  v
Extract username from URL
  |
  v
Call API: GET user profile → followers, following, media_count, biography
  |
  v
Call API: GET user media (last 12) → likes, comments per post
  |
  v
Normalize to CrawlResult → return
```

### Note on Instagram
Instagram aggressively blocks scraping. Recommended approach:
- Use a proxy service (Bright Data, SmartProxy)
- Rotate IP/User-Agent per request
- Cache results for 24h to minimize requests

### Edge Cases
- Private account → only basic info available
- Reels vs Posts vs Stories → only count posts + reels (not stories)
- Instagram Threads integration → separate platform, ignore

---

## Crawler 3: YouTube (`kol-crawl-youtube/index.ts`)

### Data Source Strategy
1. **Primary**: YouTube Data API v3 (FREE — 10,000 units/day)
2. This is the BEST supported platform API

### Implementation
```
Input: YouTube channel URL
  |
  v
Extract channel ID from URL (handle @username, /channel/ID, /c/name)
  |
  v
Call API: channels.list(part=statistics,snippet) → subscribers, views, videoCount
  |
  v
Call API: search.list(channelId, order=date, maxResults=12) → recent video IDs
  |
  v
Call API: videos.list(part=statistics, id=VIDEO_IDS) → views, likes, comments per video
  |
  v
Normalize to CrawlResult → return
```

### API Key
- Store `YOUTUBE_DATA_API_KEY` in Supabase Edge Function secrets
- 10,000 quota units/day (channels.list = 1 unit, search.list = 100 units, videos.list = 1 unit)
- ~90 KOL verifications per day with this quota

### URL Parsing
```typescript
function extractYouTubeChannelId(url: string): string | null {
  // Handle formats:
  // youtube.com/@username
  // youtube.com/channel/UCxxxx
  // youtube.com/c/ChannelName
  // youtube.com/user/Username
  const patterns = [
    /youtube\.com\/@([^\/\?]+)/,        // @handle
    /youtube\.com\/channel\/([^\/\?]+)/, // channel ID
    /youtube\.com\/c\/([^\/\?]+)/,       // custom URL
    /youtube\.com\/user\/([^\/\?]+)/,    // legacy username
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
```

### Edge Cases
- Channel has subscriber count hidden → API returns 0, flag as `hidden_subscribers`
- Mix of Shorts + regular videos → analyze both, note type
- Live streams count as videos → include in analysis
- Community posts → not counted (engagement metric different)

---

## Crawler 4: Facebook (`kol-crawl-facebook/index.ts`)

### Data Source Strategy
1. **Primary**: Facebook Graph API (requires Page Access Token)
2. **Fallback**: Public page info endpoint
3. **Note**: Personal profiles CANNOT be crawled (API limitation)

### Implementation
```
Input: Facebook Page URL (e.g., https://facebook.com/pagename)
  |
  v
Extract page ID or username from URL
  |
  v
Call API: GET /{page_id}?fields=fan_count,followers_count,posts.limit(12){...}
  |
  v
For each post: GET likes_count, comments_count, shares_count
  |
  v
Normalize to CrawlResult → return
```

### Important Notes
- Only **Facebook Pages** can be crawled (not personal profiles)
- Need Page Access Token with `pages_read_engagement` permission
- Or use app-level access with `page_public_content_access`

### Edge Cases
- Personal profile URL submitted → return error "Personal profiles not supported, please submit Page URL"
- Page has engagement restrictions → limited data available
- Facebook Groups → different API, not supported initially

---

## Crawler 5: Twitter/X (`kol-crawl-twitter/index.ts`)

### Data Source Strategy
1. **Primary**: Twitter API v2 (Basic tier: $100/month, 10K tweets/month read)
2. **Fallback**: RapidAPI Twitter scraper
3. **Note**: Free tier only allows 1500 tweets/month read

### Implementation
```
Input: Twitter/X profile URL (e.g., https://twitter.com/username or x.com/username)
  |
  v
Extract username from URL
  |
  v
Call API: GET /2/users/by/username/{username}?user.fields=public_metrics
  → followers_count, following_count, tweet_count
  |
  v
Call API: GET /2/users/{id}/tweets?max_results=12&tweet.fields=public_metrics
  → likes, replies, retweets, impressions per tweet
  |
  v
Normalize to CrawlResult → return
```

### URL Parsing
```typescript
function extractTwitterUsername(url: string): string | null {
  // Handle: twitter.com/user, x.com/user, twitter.com/@user
  const match = url.match(/(?:twitter|x)\.com\/@?([^\/\?\s]+)/);
  return match ? match[1] : null;
}
```

### Edge Cases
- Protected tweets → limited data, note `is_private: true`
- X rebrand → handle both `twitter.com` and `x.com` URLs
- Suspended account → API returns 403, mark as `error`

---

## Common Crawler Utilities

### Shared Helper Functions

```typescript
// Parse follower count strings (1.2M, 500K, etc.)
function parseFollowerCount(str: string): number {
  if (typeof str === 'number') return str;
  const cleaned = str.replace(/,/g, '').trim().toLowerCase();
  const multipliers: Record<string, number> = { k: 1000, m: 1000000, b: 1000000000 };
  const match = cleaned.match(/^([\d.]+)\s*([kmb])?$/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const multiplier = multipliers[match[2]] || 1;
  return Math.round(num * multiplier);
}

// Rate limit check (RPC call)
async function checkRateLimit(supabase: any, userId: string, platform: string): Promise<boolean> {
  const { data } = await supabase.rpc('check_kol_crawl_rate_limit', {
    p_user_id: userId,
    p_platform: platform
  });
  return data === true;
}

// Log crawl attempt
async function logCrawlAttempt(supabase: any, params: {
  userId: string;
  applicationId: string;
  platform: string;
  url: string;
  status: string;
  error?: string;
  responseTimeMs?: number;
}) {
  await supabase.from('kol_crawl_logs').insert({
    user_id: params.userId,
    application_id: params.applicationId,
    platform: params.platform,
    submitted_url: params.url,
    crawl_status: params.status,
    error_message: params.error,
    response_time_ms: params.responseTimeMs,
  });
}

// Timeout wrapper for fetch
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
```

---

## API Keys Required (Edge Function Secrets)

| Secret Name | Platform | Cost | Required |
|-------------|----------|------|----------|
| `YOUTUBE_DATA_API_KEY` | YouTube | Free (10K units/day) | Yes |
| `RAPIDAPI_KEY` | TikTok, Instagram | ~$10-50/month | Yes |
| `TWITTER_BEARER_TOKEN` | Twitter/X | $100/month (Basic) | Optional |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | Facebook | Free (with app) | Optional |
| `PROXY_URL` | All platforms | ~$10/month | Recommended |

### Priority Order (by API reliability)
1. YouTube (best API, free, reliable)
2. TikTok via RapidAPI (paid but works)
3. Twitter/X (expensive but official)
4. Instagram via RapidAPI (works but rate-limited)
5. Facebook (limited to Pages only)

---

## Error Handling Strategy

```
For each platform crawl:
  1. Check rate limit (1 per 24h per user per platform)
  2. Log crawl start
  3. Try primary data source
     → Success: normalize, store, log success
     → Fail: try fallback
       → Success: normalize, store, log success
       → Fail: log error, mark status='error'
  4. Timeout: 15 seconds per platform
  5. Retry: 3 attempts with exponential backoff (2s, 4s, 8s)
  6. If all retries fail: mark status='failed', schedule retry via next_check_at
```

---

## Edge Cases (20+)

1. URL has tracking parameters → strip `?utm_*`, `?ref=` before crawling
2. URL uses URL shortener → resolve redirect first
3. URL points to specific post, not profile → extract profile URL from post
4. Username has special characters (underscores, dots) → URL-encode
5. Platform returns cached/stale data → compare with previous crawl
6. API returns HTML instead of JSON (rate limited) → detect and retry with backoff
7. Follower count changes during crawl → use first value, note in metadata
8. Platform in maintenance → retry after 1 hour
9. Geo-restricted content → use proxy with appropriate region
10. User submitted wrong platform URL → detect platform from URL, warn if mismatch
11. Multiple redirects → follow up to 3 redirects, then fail
12. SSL certificate issues → log and skip
13. Empty response → treat as error, not zero followers
14. API returns partial data → store what's available, mark fields as null
15. Duplicate crawl requests → UNIQUE constraint + rate limit prevents doubles
16. Crawler IP banned → rotate to backup proxy
17. Post with paid promotion → engagement may be artificially high, note in metadata
18. Viral post skewing average → use median instead of mean for engagement
19. Platform API version deprecation → version field allows tracking
20. Response size > 1MB → truncate raw_snapshot to most relevant fields
21. Username doesn't match profile URL → log discrepancy
22. Account recently created (<30 days) → flag as potential disposable account
