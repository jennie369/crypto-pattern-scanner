# KOL Intelligence — Phase 1: Database Schema

## Table: `kol_verification_results`

### Purpose
Store server-side crawl results for each KOL social platform. One row per platform per application. Linked to existing `kol_verification` and `partnership_applications` tables.

### Schema

```sql
CREATE TABLE IF NOT EXISTS public.kol_verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links to existing system (DO NOT create new FK tables)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.partnership_applications(id) ON DELETE SET NULL,
  kol_verification_id UUID REFERENCES public.kol_verification(id) ON DELETE SET NULL,

  -- Platform identification
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'facebook', 'twitter', 'discord', 'telegram')),
  submitted_url TEXT,

  -- Self-reported vs actual
  reported_followers INTEGER DEFAULT 0,
  actual_followers INTEGER,
  follower_diff_percent NUMERIC(6,2), -- (actual - reported) / reported * 100

  -- Engagement metrics (crawled)
  following_count INTEGER,
  avg_likes NUMERIC(12,2),
  avg_comments NUMERIC(12,2),
  avg_views NUMERIC(12,2),
  avg_shares NUMERIC(12,2),
  engagement_rate NUMERIC(6,4), -- (avg_likes + avg_comments) / actual_followers
  post_count INTEGER, -- total posts on profile
  recent_post_count INTEGER, -- posts in last 30 days
  post_frequency NUMERIC(6,2), -- posts per week

  -- Fraud detection
  fraud_flag BOOLEAN DEFAULT false,
  fraud_reasons TEXT[], -- array of reasons
  fraud_score INTEGER DEFAULT 0, -- 0-100 (0=clean, 100=definitely fake)

  -- Quality scoring
  quality_score INTEGER DEFAULT 50, -- 0-100
  quality_category TEXT CHECK (quality_category IN ('premium', 'good', 'risky', 'reject')),

  -- Verification status
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'crawling', 'verified', 'suspicious', 'failed', 'error')),

  -- Raw data snapshot
  raw_snapshot_json JSONB, -- full crawl response for audit trail
  crawl_metadata JSONB, -- { crawler_version, proxy_used, response_time_ms, etc. }

  -- Timestamps
  last_checked_at TIMESTAMPTZ,
  next_check_at TIMESTAMPTZ, -- for re-verification scheduling
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one result per platform per application
  UNIQUE(application_id, platform)
);

-- Indexes for common queries
CREATE INDEX idx_kvr_user_id ON public.kol_verification_results(user_id);
CREATE INDEX idx_kvr_application_id ON public.kol_verification_results(application_id);
CREATE INDEX idx_kvr_status ON public.kol_verification_results(verification_status);
CREATE INDEX idx_kvr_fraud ON public.kol_verification_results(fraud_flag) WHERE fraud_flag = true;
CREATE INDEX idx_kvr_quality ON public.kol_verification_results(quality_score);
CREATE INDEX idx_kvr_next_check ON public.kol_verification_results(next_check_at) WHERE next_check_at IS NOT NULL;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_kol_verification_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kvr_updated_at
  BEFORE UPDATE ON public.kol_verification_results
  FOR EACH ROW
  EXECUTE FUNCTION update_kol_verification_results_updated_at();
```

### RLS Policies

```sql
-- Enable RLS
ALTER TABLE public.kol_verification_results ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own verification results
CREATE POLICY "Users can view own verification results"
  ON public.kol_verification_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Service role can do everything (for edge functions)
CREATE POLICY "Service role full access"
  ON public.kol_verification_results
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 3: Admins can view all results
CREATE POLICY "Admins can view all verification results"
  ON public.kol_verification_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- Policy 4: Admins can update results (manual override)
CREATE POLICY "Admins can update verification results"
  ON public.kol_verification_results
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- NO public INSERT/DELETE — only service_role can create/delete
```

### Aggregate Summary Table (Optional — for dashboard performance)

```sql
-- Aggregate view for quick dashboard queries
CREATE OR REPLACE VIEW public.kol_verification_summary AS
SELECT
  kvr.user_id,
  kvr.application_id,
  COUNT(*) as platforms_checked,
  COUNT(*) FILTER (WHERE kvr.verification_status = 'verified') as platforms_verified,
  COUNT(*) FILTER (WHERE kvr.fraud_flag = true) as fraud_flags_count,
  AVG(kvr.quality_score) as avg_quality_score,
  MIN(kvr.quality_score) as min_quality_score,
  MAX(kvr.quality_score) as max_quality_score,
  SUM(kvr.reported_followers) as total_reported_followers,
  SUM(kvr.actual_followers) as total_actual_followers,
  AVG(kvr.engagement_rate) as avg_engagement_rate,
  CASE
    WHEN AVG(kvr.quality_score) >= 80 THEN 'premium'
    WHEN AVG(kvr.quality_score) >= 60 THEN 'good'
    WHEN AVG(kvr.quality_score) >= 40 THEN 'risky'
    ELSE 'reject'
  END as overall_category,
  CASE
    WHEN COUNT(*) FILTER (WHERE kvr.fraud_flag = true) > 0 THEN 'suspicious'
    WHEN COUNT(*) FILTER (WHERE kvr.verification_status = 'verified') = COUNT(*) THEN 'verified'
    WHEN COUNT(*) FILTER (WHERE kvr.verification_status = 'error') > 0 THEN 'error'
    ELSE 'pending'
  END as overall_status,
  MAX(kvr.last_checked_at) as last_checked_at
FROM public.kol_verification_results kvr
GROUP BY kvr.user_id, kvr.application_id;
```

### Crawl Log Table (for rate limiting + audit)

```sql
CREATE TABLE IF NOT EXISTS public.kol_crawl_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.partnership_applications(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  submitted_url TEXT,
  crawl_status TEXT DEFAULT 'started' CHECK (crawl_status IN ('started', 'success', 'failed', 'rate_limited', 'blocked')),
  error_message TEXT,
  response_time_ms INTEGER,
  crawler_version TEXT DEFAULT 'v1',
  ip_address TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for rate limiting queries
CREATE INDEX idx_kcl_user_platform ON public.kol_crawl_logs(user_id, platform, created_at DESC);

-- RLS: Only service_role can access
ALTER TABLE public.kol_crawl_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON public.kol_crawl_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can read logs
CREATE POLICY "Admins can view crawl logs"
  ON public.kol_crawl_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );
```

### RPC Functions

```sql
-- Check rate limit: max 1 crawl per platform per 24h per user
CREATE OR REPLACE FUNCTION public.check_kol_crawl_rate_limit(
  p_user_id UUID,
  p_platform TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_crawl TIMESTAMPTZ;
BEGIN
  SELECT MAX(created_at) INTO last_crawl
  FROM public.kol_crawl_logs
  WHERE user_id = p_user_id
    AND platform = p_platform
    AND crawl_status IN ('started', 'success');

  -- Allow if no previous crawl or last crawl > 24h ago
  RETURN (last_crawl IS NULL OR last_crawl < NOW() - INTERVAL '24 hours');
END;
$$;

-- Get verification results for an application (admin use)
CREATE OR REPLACE FUNCTION public.get_kol_verification_results(
  p_application_id UUID
)
RETURNS SETOF public.kol_verification_results
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.kol_verification_results
  WHERE application_id = p_application_id
  ORDER BY platform;
$$;

-- Get overall KOL score summary for an application
CREATE OR REPLACE FUNCTION public.get_kol_score_summary(
  p_application_id UUID
)
RETURNS TABLE(
  platforms_checked INTEGER,
  platforms_verified INTEGER,
  fraud_flags INTEGER,
  avg_quality_score NUMERIC,
  total_reported INTEGER,
  total_actual INTEGER,
  follower_accuracy_percent NUMERIC,
  avg_engagement NUMERIC,
  overall_verdict TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE verification_status = 'verified')::INTEGER,
    COUNT(*) FILTER (WHERE fraud_flag = true)::INTEGER,
    ROUND(AVG(quality_score), 1),
    COALESCE(SUM(reported_followers), 0)::INTEGER,
    COALESCE(SUM(actual_followers), 0)::INTEGER,
    CASE
      WHEN SUM(reported_followers) > 0
      THEN ROUND((SUM(actual_followers)::NUMERIC / SUM(reported_followers)) * 100, 1)
      ELSE NULL
    END,
    ROUND(AVG(engagement_rate) * 100, 2),
    CASE
      WHEN COUNT(*) FILTER (WHERE fraud_flag = true) > 0 THEN 'SUSPICIOUS'
      WHEN AVG(quality_score) >= 80 THEN 'PREMIUM'
      WHEN AVG(quality_score) >= 60 THEN 'GOOD'
      WHEN AVG(quality_score) >= 40 THEN 'RISKY'
      ELSE 'REJECT'
    END
  FROM public.kol_verification_results
  WHERE application_id = p_application_id;
END;
$$;
```

---

## Edge Cases

1. **User submits no social URL** → Skip crawl for that platform, mark as `skipped`
2. **URL is invalid/404** → Mark platform as `error`, log reason, don't count against score
3. **Platform blocks crawler** → Mark as `blocked`, retry with different approach after 1h
4. **User changes social URL after submission** → Re-crawl on URL change, keep previous snapshot
5. **Same user submits multiple applications** → Each application gets its own results
6. **Platform API rate limited** → Queue for retry, mark as `rate_limited`
7. **Crawl takes too long** → 30s timeout per platform, mark as `error`
8. **User has private profile** → Mark as `error`, note "private profile" in fraud_reasons
9. **Follower count = 0 from crawl** → Likely error/private, don't flag as fraud
10. **Self-reported = 0 but actual > 0** → Not fraud, just incomplete form
11. **Platform API changes** → `crawler_version` field allows tracking which version crawled
12. **Concurrent crawl requests** → UNIQUE constraint prevents duplicate results
13. **Admin manually overrides score** → `updated_at` tracks when, RLS allows admin UPDATE
14. **Re-verification requested** → Update `next_check_at`, cron picks up and re-crawls
15. **User deletes account** → CASCADE delete on user_id removes all crawl data
16. **Application rejected then resubmitted** → New application_id, fresh crawl results
17. **Crawl succeeds but engagement calc fails** → Store raw data, mark quality as `pending`
18. **Platform follower count format varies** → Normalize in crawler (1.2M → 1200000)
19. **Discord/Telegram server count vs followers** → Different metric, normalize as `members`
20. **Multiple accounts on same platform** → Only crawl the submitted URL
