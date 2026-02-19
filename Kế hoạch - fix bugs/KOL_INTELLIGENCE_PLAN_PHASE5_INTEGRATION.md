# KOL Intelligence — Phase 5: Admin UI + Notifications + Cron

## Overview
This phase integrates the KOL Intelligence backend into the existing admin dashboard.
All changes are UPDATES to existing files or NEW components. No duplication of existing flows.

---

## 1. New Service: `kolIntelligenceService.js`

**Location**: `gem-mobile/src/services/kolIntelligenceService.js`
**Purpose**: Client-side service for fetching KOL verification results (read-only)

### Methods

```javascript
const kolIntelligenceService = {
  /**
   * Get verification results for a specific application
   * @param {string} applicationId
   * @returns {Promise<Array>} Array of kol_verification_results rows
   */
  async getVerificationResults(applicationId) {
    const { data, error } = await supabase
      .rpc('get_kol_verification_results', { p_application_id: applicationId });
    if (error) throw error;
    return data || [];
  },

  /**
   * Get score summary for a specific application
   * @param {string} applicationId
   * @returns {Promise<Object>} Summary object with overall score, verdict, etc.
   */
  async getScoreSummary(applicationId) {
    const { data, error } = await supabase
      .rpc('get_kol_score_summary', { p_application_id: applicationId });
    if (error) throw error;
    return data?.[0] || null;
  },

  /**
   * Admin: Trigger re-verification for an application
   * @param {string} applicationId
   * @returns {Promise<Object>} Crawl result summary
   */
  async triggerReverification(applicationId) {
    const { data, error } = await supabase.functions.invoke('kol-intelligence-crawl', {
      body: { application_id: applicationId, force: true },
    });
    if (error) throw error;
    return data;
  },

  /**
   * Get all suspicious applications (for admin dashboard badge)
   * @returns {Promise<number>} Count of suspicious applications
   */
  async getSuspiciousCount() {
    const { count, error } = await supabase
      .from('kol_verification_results')
      .select('application_id', { count: 'exact', head: true })
      .eq('fraud_flag', true);
    if (error) throw error;
    return count || 0;
  },

  /**
   * Get crawl logs for an application (admin audit)
   * @param {string} applicationId
   * @returns {Promise<Array>}
   */
  async getCrawlLogs(applicationId) {
    const { data, error } = await supabase
      .from('kol_crawl_logs')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  },
};
```

---

## 2. New Component: `KOLVerificationResultCard.js`

**Location**: `gem-mobile/src/components/Partnership/KOLVerificationResultCard.js`
**Purpose**: Display crawl results, engagement, fraud risk, quality score per platform

### UI Structure

```
┌─────────────────────────────────────────────────┐
│ KOL Intelligence Report                    [Re-verify] │
│                                                         │
│ Overall Score: ██████████ 78/100  GOOD                  │
│ Verdict: GOOD  |  Fraud Flags: 0  |  Platforms: 3/5    │
│                                                         │
│ ┌─ YouTube ──────────────────────────────────────┐      │
│ │ Reported: 50,000  |  Actual: 48,230  ✓ (-3.5%) │     │
│ │ Engagement: 3.2%  |  Posts/week: 2.5            │     │
│ │ Score: 85/100  PREMIUM  |  Fraud: NONE          │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ ┌─ Instagram ────────────────────────────────────┐      │
│ │ Reported: 30,000  |  Actual: 28,100  ✓ (-6.3%) │     │
│ │ Engagement: 2.1%  |  Posts/week: 4.0            │     │
│ │ Score: 75/100  GOOD  |  Fraud: NONE             │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ ┌─ TikTok ───────────────────────────────────────┐      │
│ │ Reported: 100,000  |  Actual: 65,200  ⚠ (-34.8%) │   │
│ │ Engagement: 0.3%  |  Posts/week: 0.5            │     │
│ │ Score: 35/100  REJECT  |  Fraud: YES            │     │
│ │ Reasons:                                        │     │
│ │  - Follower count inflated by >25%              │     │
│ │  - Very low engagement: 0.30%                   │     │
│ │  - High followers but almost no recent content  │     │
│ └─────────────────────────────────────────────────┘     │
│                                                         │
│ Last checked: 2 hours ago                               │
└─────────────────────────────────────────────────────────┘
```

### Color Coding

| Category | Color | Badge |
|----------|-------|-------|
| PREMIUM (80-100) | `#4CAF50` (green) | Green shield |
| GOOD (60-79) | `#2196F3` (blue) | Blue check |
| RISKY (40-59) | `#FF9800` (orange) | Yellow warning |
| REJECT (0-39) | `#F44336` (red) | Red X |
| ERROR | `#9E9E9E` (gray) | Gray question mark |

### Follower Diff Display

```
Within 10%:  ✓ green text
10-25%:      ⚠ orange text
>25%:        ✗ red text
```

### Tooltips

| Element | Tooltip Text |
|---------|-------------|
| Overall Score | "AI-calculated score based on follower accuracy, engagement rate, posting frequency, and fraud detection. 80-100=Premium, 60-79=Good, 40-59=Risky, 0-39=Reject" |
| Engagement Rate | "Average (likes + comments) / followers. Normal range varies by platform. Too low = fake followers. Too high = engagement pods." |
| Fraud Flag | "Automated fraud detection checks follower inflation, engagement anomalies, bot patterns, and posting consistency." |
| Re-verify Button | "Trigger a fresh crawl of all platforms. Results will update automatically." |
| Follower Diff | "Compares the follower count the applicant reported with the actual count from the platform." |

---

## 3. Update: `AdminApplicationDetail.js`

### Changes Required

```javascript
// Add import
import KOLVerificationResultCard from '../../components/Partnership/KOLVerificationResultCard';
import kolIntelligenceService from '../../services/kolIntelligenceService';

// In component state
const [verificationResults, setVerificationResults] = useState(null);
const [scoreSummary, setScoreSummary] = useState(null);
const [loadingIntelligence, setLoadingIntelligence] = useState(false);

// Fetch on mount (only for KOL applications)
useEffect(() => {
  if (application?.application_type === 'kol') {
    loadIntelligenceData();
  }
}, [application]);

async function loadIntelligenceData() {
  setLoadingIntelligence(true);
  try {
    const [results, summary] = await Promise.all([
      kolIntelligenceService.getVerificationResults(application.id),
      kolIntelligenceService.getScoreSummary(application.id),
    ]);
    setVerificationResults(results);
    setScoreSummary(summary);
  } catch (err) {
    console.error('Failed to load KOL intelligence:', err);
  } finally {
    setLoadingIntelligence(false);
  }
}

// In render, after existing KOL verification section
{application?.application_type === 'kol' && (
  <KOLVerificationResultCard
    results={verificationResults}
    summary={scoreSummary}
    loading={loadingIntelligence}
    onReverify={async () => {
      await kolIntelligenceService.triggerReverification(application.id);
      // Reload after 5s (crawler needs time)
      setTimeout(loadIntelligenceData, 5000);
    }}
  />
)}
```

---

## 4. Update: `AdminPartnershipDashboard.js`

### Changes Required

Add suspicious KOL counter badge:

```javascript
// Add to dashboard stats section
const [suspiciousCount, setSuspiciousCount] = useState(0);

useEffect(() => {
  kolIntelligenceService.getSuspiciousCount().then(setSuspiciousCount).catch(() => {});
}, []);

// In render, add badge to KOL stats section:
// "Suspicious KOLs: {suspiciousCount}" with red badge
```

---

## 5. Update: `partnership-cron` Edge Function

### Add `verify_kol` action

```typescript
// Add to existing switch statement in partnership-cron/index.ts

case 'verify_kol': {
  // Re-verify KOL profiles that haven't been checked in 30 days
  const { data: staleResults } = await supabase
    .from('kol_verification_results')
    .select('DISTINCT application_id')
    .lt('last_checked_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .eq('verification_status', 'verified')
    .limit(10);

  let reverifiedCount = 0;
  for (const result of staleResults || []) {
    try {
      await supabase.functions.invoke('kol-intelligence-crawl', {
        body: { application_id: result.application_id, force: true },
      });
      reverifiedCount++;
    } catch (err) {
      console.error(`[Cron] Re-verify failed for ${result.application_id}:`, err);
    }
  }

  return new Response(JSON.stringify({
    success: true,
    action: 'verify_kol',
    reverified: reverifiedCount,
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
```

---

## 6. Update: `kolVerificationService.js`

### Trigger crawl after KOL submission

```javascript
// In createVerification() method, after creating partnership_application:
// The DB trigger will auto-invoke kol-intelligence-crawl
// But we also set initial kol_verification_results rows as 'pending'

// Add after: const { data: application, error: appError } = ...
if (application) {
  // Pre-create pending rows for each platform with a URL
  const platformResults = [];
  const platforms = [
    { platform: 'youtube', url: data.youtube_url, followers: data.youtube_followers },
    { platform: 'facebook', url: data.facebook_url, followers: data.facebook_followers },
    { platform: 'instagram', url: data.instagram_url, followers: data.instagram_followers },
    { platform: 'tiktok', url: data.tiktok_url, followers: data.tiktok_followers },
    { platform: 'twitter', url: data.twitter_url, followers: data.twitter_followers },
  ];

  for (const p of platforms) {
    if (p.url) {
      platformResults.push({
        user_id: data.user_id,
        application_id: application.id,
        platform: p.platform,
        submitted_url: p.url,
        reported_followers: p.followers || 0,
        verification_status: 'pending',
      });
    }
  }

  if (platformResults.length > 0) {
    await supabase.from('kol_verification_results').insert(platformResults);
  }
}
```

---

## 7. Notification Integration

### New notification type for `notify-admins-partnership`

Add to existing edge function:

```typescript
case 'kol_suspicious':
  title = '⚠️ KOL đáng ngờ được phát hiện!';
  body = `${event.message}`;
  screen = 'AdminApplicationDetail';
  break;
```

---

## 8. Full Flow Test Scenarios

### Happy Path
- [ ] User submits KOL application with 3 platform URLs
- [ ] System auto-creates pending kol_verification_results rows
- [ ] DB trigger invokes kol-intelligence-crawl
- [ ] Crawlers run for each platform (YouTube, Instagram, TikTok)
- [ ] Results stored in kol_verification_results
- [ ] Scoring engine calculates per-platform + overall score
- [ ] Admin opens application detail → sees intelligence report card
- [ ] Admin approves/rejects with confidence

### Error Paths
- [ ] Crawler fails for 1 platform → other platforms still scored
- [ ] All crawlers fail → overall score = 0, admin sees "No data"
- [ ] Rate limited → status stays "pending", cron retries later
- [ ] Admin triggers re-verify → fresh crawl, results update in real-time
- [ ] User submits invalid URL → crawler returns error, flagged in results
- [ ] Platform API down → timeout after 15s, logged, retry scheduled

### Fraud Detection
- [ ] Inflated followers (reported 100K, actual 30K) → HIGH RISK flag
- [ ] Purchased followers (100K followers, 10 likes/post) → REJECT
- [ ] Engagement pods (15% engagement rate) → SUSPICIOUS flag
- [ ] Ghost account (50K followers, 0 posts in 30 days) → SUSPICIOUS
- [ ] Legitimate KOL (balanced engagement, consistent posting) → PREMIUM

### Edge Cases
- [ ] No social URLs submitted → no crawl triggered, no results
- [ ] Only 1 platform submitted → score based on single platform
- [ ] User changes URL after submission → admin re-triggers verify
- [ ] Concurrent admin views same application → both see same results
- [ ] Application deleted → CASCADE removes all results
- [ ] Private Instagram profile → error status, noted in UI
- [ ] YouTube subscriber count hidden → error for that platform
- [ ] Very large follower count (1M+) → renders correctly
- [ ] Score exactly at boundary (40, 60, 80) → correct category
- [ ] Re-verification while crawl in progress → upsert handles gracefully

---

## 9. Access Control

| Action | Who Can Do It | How |
|--------|---------------|-----|
| View own results | KOL applicant | RLS: `auth.uid() = user_id` |
| View all results | Admin | RLS: `profiles.is_admin = true` |
| Trigger re-verify | Admin only | Edge function checks admin role |
| View crawl logs | Admin only | RLS: `profiles.is_admin = true` |
| Modify results | Service role only | RLS: `TO service_role` |
| Delete results | CASCADE on user/application delete | Automatic |

---

## 10. Deployment Checklist

1. [ ] Apply migration: `kol_verification_results` + `kol_crawl_logs` tables
2. [ ] Apply RLS policies for both tables
3. [ ] Create RPC functions: `check_kol_crawl_rate_limit`, `get_kol_verification_results`, `get_kol_score_summary`
4. [ ] Create view: `kol_verification_summary`
5. [ ] Deploy edge function: `kol-intelligence-crawl`
6. [ ] Deploy edge function: `kol-intelligence-score`
7. [ ] Deploy edge function: `kol-crawl-youtube` (start with YouTube — best API)
8. [ ] Deploy edge function: `kol-crawl-tiktok`
9. [ ] Deploy edge function: `kol-crawl-instagram`
10. [ ] Deploy edge function: `kol-crawl-facebook`
11. [ ] Deploy edge function: `kol-crawl-twitter`
12. [ ] Set edge function secrets: `YOUTUBE_DATA_API_KEY`, `RAPIDAPI_KEY`
13. [ ] Update `partnership-cron` with `verify_kol` action
14. [ ] Update `notify-admins-partnership` with `kol_suspicious` type
15. [ ] Create `kolIntelligenceService.js`
16. [ ] Create `KOLVerificationResultCard.js`
17. [ ] Update `AdminApplicationDetail.js`
18. [ ] Update `AdminPartnershipDashboard.js`
19. [ ] Update `kolVerificationService.js` (pre-create pending rows)
20. [ ] Set up DB trigger or Database Webhook for auto-crawl
21. [ ] Add `verify_kol` to cron schedule (daily or weekly)
22. [ ] Test full flow end-to-end
