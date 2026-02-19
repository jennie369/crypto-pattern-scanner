# KOL Intelligence — Phase 3: Orchestrator + Job Queue

## Orchestrator Edge Function: `kol-intelligence-crawl`

### Purpose
Single entry point that receives an application_id, dispatches per-platform crawlers in parallel, aggregates results, triggers scoring.

### Flow

```
Trigger (any of):
  A) DB trigger on partnership_applications INSERT WHERE type='kol'
  B) Manual trigger from admin dashboard ("Re-verify" button)
  C) Cron job for scheduled re-verification
  |
  v
kol-intelligence-crawl edge function
  |
  v
1. Fetch kol_verification record → get all platform URLs + reported followers
2. For each platform with a URL:
   a. Check rate limit (1 per 24h per user per platform)
   b. If allowed, invoke platform-specific crawler edge function
3. Wait for all crawlers (Promise.allSettled, 30s max)
4. For each result:
   a. Store in kol_verification_results
   b. Log in kol_crawl_logs
5. Invoke kol-intelligence-score with application_id
6. Return summary
```

### Implementation

```typescript
// supabase/functions/kol-intelligence-crawl/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Platform URL field mapping from kol_verification table
const PLATFORM_CONFIG = [
  { platform: 'youtube',   urlField: 'youtube_url',   followersField: 'youtube_followers' },
  { platform: 'facebook',  urlField: 'facebook_url',  followersField: 'facebook_followers' },
  { platform: 'instagram', urlField: 'instagram_url', followersField: 'instagram_followers' },
  { platform: 'tiktok',    urlField: 'tiktok_url',    followersField: 'tiktok_followers' },
  { platform: 'twitter',   urlField: 'twitter_url',   followersField: 'twitter_followers' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { application_id, force = false } = await req.json();

    if (!application_id) {
      return new Response(
        JSON.stringify({ error: 'application_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Fetch KOL verification data
    const { data: verification, error: vError } = await supabase
      .from('kol_verification')
      .select('*')
      .eq('application_id', application_id)
      .single();

    if (vError || !verification) {
      return new Response(
        JSON.stringify({ error: 'KOL verification not found', details: vError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[KOL-Intel] Starting crawl for application ${application_id}, user ${verification.user_id}`);

    // 2. Dispatch crawlers for each platform with a URL
    const crawlPromises = [];

    for (const config of PLATFORM_CONFIG) {
      const url = verification[config.urlField];
      const reportedFollowers = verification[config.followersField] || 0;

      if (!url) continue; // Skip platforms with no URL

      // Rate limit check (skip if force=true from admin)
      if (!force) {
        const { data: canCrawl } = await supabase.rpc('check_kol_crawl_rate_limit', {
          p_user_id: verification.user_id,
          p_platform: config.platform,
        });

        if (!canCrawl) {
          console.log(`[KOL-Intel] Rate limited: ${config.platform} for user ${verification.user_id}`);
          continue;
        }
      }

      // Dispatch crawler
      crawlPromises.push(
        crawlPlatform(supabase, {
          userId: verification.user_id,
          applicationId: application_id,
          platform: config.platform,
          url,
          reportedFollowers,
        })
      );
    }

    if (crawlPromises.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No platforms to crawl (rate limited or no URLs)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Wait for all crawlers (30s timeout)
    const results = await Promise.race([
      Promise.allSettled(crawlPromises),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Global timeout')), 30000)),
    ]);

    // 4. Trigger scoring
    await supabase.functions.invoke('kol-intelligence-score', {
      body: { application_id },
    });

    const duration = Date.now() - startTime;
    const summary = {
      success: true,
      application_id,
      platforms_crawled: crawlPromises.length,
      duration_ms: duration,
      results: (results as PromiseSettledResult<any>[]).map(r => ({
        status: r.status,
        platform: r.status === 'fulfilled' ? r.value?.platform : 'unknown',
        error: r.status === 'rejected' ? r.reason?.message : undefined,
      })),
    };

    console.log(`[KOL-Intel] Complete: ${JSON.stringify(summary)}`);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[KOL-Intel] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function crawlPlatform(supabase: any, params: {
  userId: string;
  applicationId: string;
  platform: string;
  url: string;
  reportedFollowers: number;
}): Promise<any> {
  const startTime = Date.now();

  // Log crawl start
  await supabase.from('kol_crawl_logs').insert({
    user_id: params.userId,
    application_id: params.applicationId,
    platform: params.platform,
    submitted_url: params.url,
    crawl_status: 'started',
  });

  try {
    // Invoke platform-specific crawler
    const { data, error } = await supabase.functions.invoke(`kol-crawl-${params.platform}`, {
      body: {
        url: params.url,
        user_id: params.userId,
        application_id: params.applicationId,
      },
    });

    if (error) throw error;

    const responseTime = Date.now() - startTime;

    // Store result in kol_verification_results (upsert by application_id + platform)
    const { error: upsertError } = await supabase
      .from('kol_verification_results')
      .upsert({
        user_id: params.userId,
        application_id: params.applicationId,
        platform: params.platform,
        submitted_url: params.url,
        reported_followers: params.reportedFollowers,
        actual_followers: data.followers || null,
        following_count: data.following || null,
        avg_likes: data.posts?.avg_likes || null,
        avg_comments: data.posts?.avg_comments || null,
        avg_views: data.posts?.avg_views || null,
        avg_shares: data.posts?.avg_shares || null,
        post_count: data.posts?.total_count || null,
        recent_post_count: data.posts?.recent_count || null,
        post_frequency: data.posts?.post_frequency_per_week || null,
        raw_snapshot_json: data,
        crawl_metadata: {
          crawler_version: data.crawler_version || 'v1',
          response_time_ms: responseTime,
          crawled_at: new Date().toISOString(),
        },
        verification_status: data.success ? 'verified' : 'error',
        last_checked_at: new Date().toISOString(),
      }, {
        onConflict: 'application_id,platform',
      });

    if (upsertError) {
      console.error(`[KOL-Intel] Upsert error for ${params.platform}:`, upsertError);
    }

    // Log success
    await supabase.from('kol_crawl_logs').insert({
      user_id: params.userId,
      application_id: params.applicationId,
      platform: params.platform,
      submitted_url: params.url,
      crawl_status: data.success ? 'success' : 'failed',
      error_message: data.error,
      response_time_ms: responseTime,
    });

    return { platform: params.platform, ...data };

  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    // Log failure
    await supabase.from('kol_crawl_logs').insert({
      user_id: params.userId,
      application_id: params.applicationId,
      platform: params.platform,
      submitted_url: params.url,
      crawl_status: 'failed',
      error_message: error.message,
      response_time_ms: responseTime,
    });

    // Store error result
    await supabase
      .from('kol_verification_results')
      .upsert({
        user_id: params.userId,
        application_id: params.applicationId,
        platform: params.platform,
        submitted_url: params.url,
        reported_followers: params.reportedFollowers,
        verification_status: 'error',
        crawl_metadata: { error: error.message, response_time_ms: responseTime },
        last_checked_at: new Date().toISOString(),
      }, {
        onConflict: 'application_id,platform',
      });

    throw error;
  }
}
```

---

## DB Trigger: Auto-crawl on KOL application

```sql
-- Function to trigger crawl via edge function
CREATE OR REPLACE FUNCTION public.trigger_kol_intelligence_crawl()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for KOL applications
  IF NEW.application_type = 'kol' AND NEW.status = 'pending' THEN
    -- Use pg_net to call edge function async (non-blocking)
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/kol-intelligence-crawl',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object('application_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger requires pg_net extension.
-- Alternative: Use Supabase Database Webhooks instead.
```

### Alternative: Supabase Database Webhook
If `pg_net` is not available, use Supabase Database Webhooks:
- Table: `partnership_applications`
- Event: INSERT
- Filter: `application_type = 'kol'`
- Target: `kol-intelligence-crawl` edge function

---

## Partnership Cron Integration

```typescript
// Add to existing partnership-cron edge function:

case 'verify_kol':
  // Re-verify KOL profiles that haven't been checked in 30 days
  const { data: staleResults } = await supabase
    .from('kol_verification_results')
    .select('application_id')
    .lt('last_checked_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .eq('verification_status', 'verified')
    .limit(10); // Process 10 at a time

  for (const result of staleResults || []) {
    await supabase.functions.invoke('kol-intelligence-crawl', {
      body: { application_id: result.application_id, force: true },
    });
  }
  break;
```

---

## Retry Strategy

```
Attempt 1: Immediate
  → Fail? Wait 2 seconds
Attempt 2: After 2s
  → Fail? Wait 4 seconds
Attempt 3: After 4s
  → Fail? Mark as 'failed', set next_check_at = NOW() + 1 hour

Re-check (via cron):
  → next_check_at passed? Re-crawl
  → If still fails after 3 more attempts → Mark as 'error' permanently
```

---

## Edge Cases

1. **Application deleted mid-crawl** → ON DELETE SET NULL handles FK, crawl results orphaned but harmless
2. **User submits then immediately re-submits** → UNIQUE constraint prevents duplicate results per platform
3. **Edge function cold start** → First crawl may take 5-10s longer, timeout handles this
4. **Crawl succeeds but scoring fails** → Results stored, scoring can be re-triggered independently
5. **Admin triggers re-verify while crawl in progress** → `force=true` bypasses rate limit, upsert overwrites
6. **Platform URL changed after initial crawl** → New URL requires manual re-trigger from admin
7. **All platforms fail** → Mark overall status as 'error', notify admin
8. **Partial success** → Some platforms verified, others failed — show mixed status in admin
9. **Database connection lost during write** → Retry once, then fail gracefully
10. **Global timeout (30s) reached** → Cancel remaining crawlers, store partial results
11. **Concurrent crawl requests for same application** → UNIQUE constraint + upsert prevents duplicates
12. **Edge function memory limit** → Raw snapshots truncated to 100KB per platform
13. **Network split between edge functions** → Each crawler is independent, failures are isolated
14. **Supabase project paused** → All operations fail, cron retries on next run
15. **Invalid application_id** → 404 response, no crawl attempted
16. **kol_verification record doesn't exist yet** → 404, client should create verification first
17. **Rate limit bypass by admin** → `force=true` parameter, logged in crawl logs
18. **Crawl during platform outage** → Timeout + retry, results from last successful crawl retained
19. **Huge follower count (1B+)** → INTEGER handles up to 2.1B, BIGINT if needed later
20. **Multiple admins trigger re-verify simultaneously** → Upsert ensures only one result per platform
