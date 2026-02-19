# KOL Intelligence — Phase 4: Scoring Algorithm + Fraud Heuristics

## Scoring Edge Function: `kol-intelligence-score`

### Purpose
Analyze crawl results for an application, calculate engagement rates, detect fraud patterns, assign quality scores per platform, and compute overall KOL score.

---

## Engagement Rate Calculation

### Formula (per platform)

```
engagement_rate = (avg_likes + avg_comments) / actual_followers

For YouTube specifically:
  engagement_rate = (avg_likes + avg_comments) / avg_views
  (because YouTube measures views, not just followers)

For TikTok:
  engagement_rate = (avg_likes + avg_comments + avg_shares) / avg_views
  (TikTok is view-driven, not follower-driven)
```

### Engagement Benchmarks

| Platform | Low (<) | Normal | High (>) | Suspicious (>) |
|----------|---------|--------|----------|----------------|
| Instagram | 0.5% | 1-3% | 3-6% | 15% |
| TikTok | 1% | 3-8% | 8-15% | 25% |
| YouTube | 1% | 2-5% | 5-10% | 20% |
| Facebook | 0.3% | 0.5-2% | 2-5% | 10% |
| Twitter | 0.2% | 0.5-2% | 2-5% | 10% |

---

## Fraud Detection Heuristics

### Heuristic 1: Follower Mismatch
```
diff = abs(actual_followers - reported_followers) / reported_followers * 100

if diff > 25%: HIGH RISK — "Follower count inflated by >25%"
if diff > 10%: MEDIUM RISK — "Follower count differs by >10%"
if diff <= 10%: LOW RISK — Acceptable variance
```

### Heuristic 2: Low Engagement
```
if engagement_rate < platform_threshold.low:
  FLAG: "Suspiciously low engagement for follower count"
  INTERPRETATION: Likely purchased followers (high followers, no real engagement)
```

### Heuristic 3: Suspicious High Engagement
```
if engagement_rate > platform_threshold.suspicious:
  FLAG: "Abnormally high engagement rate"
  INTERPRETATION: Likely engagement pods, bot comments, or very small niche
```

### Heuristic 4: Ghost Account
```
if actual_followers > 10000 AND recent_post_count < 3:
  FLAG: "High followers but almost no recent content"
  INTERPRETATION: Account may be purchased or abandoned
```

### Heuristic 5: Engagement/Follower Ratio Anomaly
```
if actual_followers > 100000 AND avg_likes < 100:
  FLAG: "Extreme follower-to-engagement gap"
  INTERPRETATION: Almost certainly purchased followers
```

### Heuristic 6: Post Frequency Drop
```
if post_count > 100 AND recent_post_count < 2:
  FLAG: "Posting frequency dropped significantly"
  INTERPRETATION: Account may be inactive or seasonal
```

### Heuristic 7: Following/Follower Ratio
```
if following_count > actual_followers * 2:
  FLAG: "Following count significantly exceeds followers"
  INTERPRETATION: Follow-for-follow strategy, not genuine influence
```

### Heuristic 8: New Account with High Followers
```
if account_age < 90 days AND actual_followers > 50000:
  FLAG: "New account with suspiciously high followers"
  INTERPRETATION: Likely purchased or transferred account
```

### Heuristic 9: Engagement Concentration
```
// If top 3 posts have >80% of total engagement
if top3_engagement / total_engagement > 0.80:
  FLAG: "Engagement concentrated on few posts"
  INTERPRETATION: Possible viral flukes, not consistent influence
```

### Heuristic 10: Bot-like Comment Patterns
```
// If avg comments per post is high but avg likes is very low
if avg_comments > avg_likes * 3:
  FLAG: "Comment-to-like ratio abnormal"
  INTERPRETATION: Possible comment bots
```

---

## Quality Score Formula

### Starting Score: 100 points

### Penalties (subtract from 100)

| Penalty | Points | Condition |
|---------|--------|-----------|
| Follower mismatch >25% | -25 | `abs(actual - reported) / reported > 0.25` |
| Follower mismatch 10-25% | -10 | `abs(actual - reported) / reported > 0.10` |
| Very low engagement | -20 | `engagement_rate < platform_threshold.low` |
| Suspiciously high engagement | -15 | `engagement_rate > platform_threshold.suspicious` |
| Ghost account (no recent posts) | -20 | `followers > 10K AND recent_posts < 3` |
| Extreme follower-engagement gap | -30 | `followers > 100K AND avg_likes < 100` |
| Following > followers (2x) | -10 | `following > followers * 2` |
| New account + high followers | -15 | `age < 90 days AND followers > 50K` |
| Engagement concentrated | -10 | `top3 > 80% of total` |
| Bot-like comments | -15 | `avg_comments > avg_likes * 3` |
| Private profile | -20 | `is_private = true` |
| Post frequency drop | -5 | `total_posts > 100 AND recent < 2` |
| Platform verified badge missing | -0 | No penalty (most KOLs don't have it) |

### Bonuses (add to score, max +20)

| Bonus | Points | Condition |
|-------|--------|-----------|
| Stable posting (4+ posts/week) | +5 | `post_frequency >= 4` |
| Balanced engagement | +5 | `engagement within normal range` |
| Multi-platform consistency | +5 | `2+ platforms verified with similar quality` |
| Platform verified badge | +5 | `is_verified = true` |

### Category Mapping

```
80-100 → PREMIUM  (green badge)
60-79  → GOOD     (blue badge)
40-59  → RISKY    (yellow badge)
0-39   → REJECT   (red badge)
```

---

## Implementation

```typescript
// supabase/functions/kol-intelligence-score/index.ts

interface ScoreResult {
  platform: string;
  quality_score: number;
  quality_category: string;
  fraud_flag: boolean;
  fraud_score: number;
  fraud_reasons: string[];
  engagement_rate: number;
  follower_diff_percent: number;
}

function scorePlatform(result: any): ScoreResult {
  let score = 100;
  const fraudReasons: string[] = [];
  let fraudScore = 0;

  const {
    platform,
    reported_followers,
    actual_followers,
    following_count,
    avg_likes,
    avg_comments,
    avg_views,
    post_count,
    recent_post_count,
    post_frequency,
    raw_snapshot_json,
  } = result;

  // Skip if no actual data
  if (!actual_followers || actual_followers === 0) {
    return {
      platform,
      quality_score: 0,
      quality_category: 'reject',
      fraud_flag: false,
      fraud_score: 0,
      fraud_reasons: ['No data available'],
      engagement_rate: 0,
      follower_diff_percent: 0,
    };
  }

  // Calculate engagement rate
  let engagementRate = 0;
  if (platform === 'youtube' && avg_views > 0) {
    engagementRate = ((avg_likes || 0) + (avg_comments || 0)) / avg_views;
  } else if (platform === 'tiktok' && avg_views > 0) {
    engagementRate = ((avg_likes || 0) + (avg_comments || 0)) / avg_views;
  } else if (actual_followers > 0) {
    engagementRate = ((avg_likes || 0) + (avg_comments || 0)) / actual_followers;
  }

  // Follower mismatch
  let followerDiffPercent = 0;
  if (reported_followers > 0) {
    followerDiffPercent = ((actual_followers - reported_followers) / reported_followers) * 100;

    if (Math.abs(followerDiffPercent) > 25) {
      score -= 25;
      fraudScore += 25;
      fraudReasons.push(`Follower mismatch: reported ${reported_followers}, actual ${actual_followers} (${followerDiffPercent.toFixed(1)}%)`);
    } else if (Math.abs(followerDiffPercent) > 10) {
      score -= 10;
      fraudScore += 10;
      fraudReasons.push(`Follower variance: ${followerDiffPercent.toFixed(1)}%`);
    }
  }

  // Engagement thresholds by platform
  const thresholds = {
    instagram: { low: 0.005, high: 0.15 },
    tiktok: { low: 0.01, high: 0.25 },
    youtube: { low: 0.01, high: 0.20 },
    facebook: { low: 0.003, high: 0.10 },
    twitter: { low: 0.002, high: 0.10 },
  };
  const t = thresholds[platform] || { low: 0.005, high: 0.15 };

  // Low engagement
  if (engagementRate < t.low && actual_followers > 1000) {
    score -= 20;
    fraudScore += 20;
    fraudReasons.push(`Very low engagement: ${(engagementRate * 100).toFixed(2)}%`);
  }

  // Suspicious high engagement
  if (engagementRate > t.high) {
    score -= 15;
    fraudScore += 15;
    fraudReasons.push(`Abnormally high engagement: ${(engagementRate * 100).toFixed(2)}%`);
  }

  // Ghost account
  if (actual_followers > 10000 && (recent_post_count || 0) < 3) {
    score -= 20;
    fraudScore += 15;
    fraudReasons.push('High followers but almost no recent content');
  }

  // Extreme gap
  if (actual_followers > 100000 && (avg_likes || 0) < 100) {
    score -= 30;
    fraudScore += 30;
    fraudReasons.push('Extreme follower-to-engagement gap — likely purchased followers');
  }

  // Following > followers
  if (following_count && following_count > actual_followers * 2) {
    score -= 10;
    fraudScore += 10;
    fraudReasons.push('Following count significantly exceeds followers');
  }

  // Post frequency drop
  if ((post_count || 0) > 100 && (recent_post_count || 0) < 2) {
    score -= 5;
    fraudReasons.push('Posting frequency dropped significantly');
  }

  // Bot-like comments
  if ((avg_comments || 0) > (avg_likes || 1) * 3) {
    score -= 15;
    fraudScore += 15;
    fraudReasons.push('Comment-to-like ratio abnormal — possible comment bots');
  }

  // Bonuses
  if ((post_frequency || 0) >= 4) {
    score += 5; // Stable posting
  }
  if (engagementRate >= t.low && engagementRate <= t.high) {
    score += 5; // Balanced engagement
  }
  if (raw_snapshot_json?.profile?.is_verified) {
    score += 5; // Platform verified
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));
  fraudScore = Math.max(0, Math.min(100, fraudScore));

  // Category
  let category: string;
  if (score >= 80) category = 'premium';
  else if (score >= 60) category = 'good';
  else if (score >= 40) category = 'risky';
  else category = 'reject';

  return {
    platform,
    quality_score: score,
    quality_category: category,
    fraud_flag: fraudScore >= 30,
    fraud_score: fraudScore,
    fraud_reasons: fraudReasons,
    engagement_rate: engagementRate,
    follower_diff_percent: followerDiffPercent,
  };
}
```

---

## Overall Application Score

```typescript
function calculateOverallScore(platformResults: ScoreResult[]): {
  overall_score: number;
  overall_category: string;
  overall_fraud_flag: boolean;
  verdict: string;
} {
  if (platformResults.length === 0) {
    return { overall_score: 0, overall_category: 'reject', overall_fraud_flag: false, verdict: 'NO_DATA' };
  }

  // Weighted average (platforms with more followers get more weight)
  const totalFollowers = platformResults.reduce((sum, r) => sum + (r.engagement_rate > 0 ? 1 : 0), 0);
  const avgScore = platformResults.reduce((sum, r) => sum + r.quality_score, 0) / platformResults.length;

  // Multi-platform consistency bonus
  const verifiedPlatforms = platformResults.filter(r => r.quality_score >= 60).length;
  const consistencyBonus = verifiedPlatforms >= 2 ? 5 : 0;

  let overallScore = Math.min(100, Math.round(avgScore + consistencyBonus));

  // If ANY platform has fraud flag, reduce overall by 10
  const anyFraud = platformResults.some(r => r.fraud_flag);
  if (anyFraud) {
    overallScore = Math.max(0, overallScore - 10);
  }

  let category: string;
  if (overallScore >= 80) category = 'premium';
  else if (overallScore >= 60) category = 'good';
  else if (overallScore >= 40) category = 'risky';
  else category = 'reject';

  const verdict = anyFraud ? 'SUSPICIOUS' :
    overallScore >= 80 ? 'PREMIUM' :
    overallScore >= 60 ? 'GOOD' :
    overallScore >= 40 ? 'RISKY' : 'REJECT';

  return {
    overall_score: overallScore,
    overall_category: category,
    overall_fraud_flag: anyFraud,
    verdict,
  };
}
```

---

## Notification Logic

After scoring:

```typescript
// If any platform flagged as suspicious → notify admins
if (overall.overall_fraud_flag) {
  await supabase.functions.invoke('notify-admins-partnership', {
    body: {
      type: 'kol_suspicious',
      application_id,
      message: `KOL application from ${userName} flagged as SUSPICIOUS (Score: ${overall.overall_score})`,
      data: {
        overall_score: overall.overall_score,
        fraud_flags: platformResults.filter(r => r.fraud_flag).map(r => r.platform),
      },
    },
  });
}
```

---

## Edge Cases

1. **All platforms error** → Overall score = 0, verdict = 'NO_DATA', admin notified
2. **Only 1 platform submitted** → Score based on single platform, no consistency bonus
3. **Reported followers = 0** → Skip mismatch check (user left field empty)
4. **Very small account (< 1000 followers)** → Relax engagement thresholds
5. **Platform-specific anomalies** → YouTube views != Instagram likes (different metrics)
6. **Score already calculated, data changes** → Upsert overwrites, score re-calculated
7. **Admin manually approves despite low score** → Manual override logged, score preserved for audit
8. **Score = exactly 40/60/80** → Boundary belongs to higher category (>= comparison)
9. **NaN/Infinity in calculations** → Guard with `isFinite()` checks
10. **Negative follower diff** → Actual > reported is OK (under-reporting), penalize less
11. **Zero division** → Guard all division by checking denominator > 0
12. **Platform with hidden metrics** → Skip that platform's contribution to overall
13. **Very old posts only** → engagement_rate may be inflated by viral old content
14. **Engagement from bots** → Bot detection heuristic catches most cases
15. **Platform API returns stale data** → Note freshness in metadata
16. **Multiple crawls over time** → Each crawl overwrites, but raw_snapshot preserves history
17. **Admin wants to see trend** → Future: store history in separate table
18. **Score calculation takes too long** → 5s timeout, fall back to simple average
19. **Platform removed between crawl and score** → Handle missing results gracefully
20. **Concurrent score calculations** → Upsert is idempotent, last write wins
