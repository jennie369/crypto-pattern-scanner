# KOL Intelligence System — Master Implementation Plan

**Date**: 2026-02-17 | **Status**: PLANNING
**Objective**: Server-side KOL verification engine — crawl, score, detect fraud, automate

---

## EXISTING SYSTEM (DO NOT DUPLICATE)

| Component | Location | Purpose |
|-----------|----------|---------|
| `kol_verification` table | migration `20260216212612` | KYC docs + self-reported follower counts |
| `partnership_applications` table | migration `20251126` | Application intake (type='kol') |
| `affiliate_profiles` table | migration `20241228` | Active partner records (is_kol, role) |
| `partner_notifications` table | migration `20260216212556` | Partner notification history |
| `kolVerificationService.js` | `src/services/` | Client-side KOL registration flow |
| `adminPartnershipService.js` | `src/services/` | Admin CRUD for applications |
| `KOLRegistrationForm.js` | `src/components/Partnership/` | 3-step registration UI |
| `AdminApplicationsScreen.js` | `src/screens/Admin/` | Application review UI |
| `AdminPartnershipDashboard.js` | `src/screens/Admin/` | Dashboard stats |
| `notify-admins-partnership` | edge function | Push notification to admins |
| `partnership-cron` | edge function | Auto-approve CTV, tier eval |

---

## NEW SYSTEM ARCHITECTURE

```
KOL submits application (existing flow)
  |
  v
partnership_applications record created (existing)
kol_verification record created (existing)
  |
  v [NEW — TRIGGER]
kol-intelligence-crawl edge function triggered
  |
  v [NEW — CRAWLER ENGINE]
For each platform URL submitted:
  → Platform-specific crawler (TikTok, IG, YT, FB, Twitter)
  → Extract: followers, engagement, post frequency
  → Normalize to common structure
  |
  v [NEW — ANALYSIS ENGINE]
engagement_rate = (avg_likes + avg_comments) / followers
reported_vs_actual = compare self-reported vs crawled
growth_analysis = detect suspicious patterns
  |
  v [NEW — SCORING ENGINE]
quality_score = 100 - penalties + bonuses
fraud_flag = true/false based on heuristics
verification_status = pending | verified | suspicious
  |
  v [NEW — STORAGE]
kol_verification_results record created/updated
  |
  v [NEW — NOTIFICATION]
If suspicious → admin push notification
If verified → update admin dashboard badge
  |
  v [EXISTING — ADMIN REVIEW]
Admin sees crawl results in AdminApplicationDetail
Admin approves/rejects with data-backed confidence
```

---

## IMPLEMENTATION PHASES

### PHASE 1: Database Schema (`kol_verification_results` table)
**File**: `supabase/migrations/20260217_kol_verification_results.sql`
**Deploy via**: Supabase MCP `apply_migration`

### PHASE 2: Platform Crawlers (5 edge functions)
**Files**: `supabase/functions/kol-crawl-{platform}/index.ts`
**Platforms**: TikTok, Instagram, YouTube, Facebook, Twitter/X

### PHASE 3: Orchestrator Edge Function
**File**: `supabase/functions/kol-intelligence-crawl/index.ts`
**Purpose**: Receives application_id, dispatches per-platform crawlers, aggregates results

### PHASE 4: Analysis & Scoring Engine
**File**: `supabase/functions/kol-intelligence-score/index.ts`
**Purpose**: Engagement calculation, fraud detection, quality scoring

### PHASE 5: Background Job Integration
**Update**: `supabase/functions/partnership-cron/index.ts` — add `verify_kol` action
**New**: DB trigger on `partnership_applications` INSERT (type='kol') → invoke crawler

### PHASE 6: Admin Dashboard Integration
**Update**: `AdminApplicationDetail.js` — show crawl results card
**Update**: `adminPartnershipService.js` — fetch verification results
**New**: `KOLVerificationResultCard.js` component

### PHASE 7: Security & Rate Limiting
**RLS**: Policies for `kol_verification_results`
**Rate limit**: Cooldown per profile check (24h)
**Logging**: All crawl attempts logged

---

## DETAILED SPECS → See sub-plan files:

- `KOL_INTELLIGENCE_PLAN_PHASE1_DB.md` — Database schema + RLS + indexes
- `KOL_INTELLIGENCE_PLAN_PHASE2_CRAWLERS.md` — Crawler architecture per platform
- `KOL_INTELLIGENCE_PLAN_PHASE3_ORCHESTRATOR.md` — Orchestration + job queue
- `KOL_INTELLIGENCE_PLAN_PHASE4_SCORING.md` — Scoring algorithm + fraud heuristics
- `KOL_INTELLIGENCE_PLAN_PHASE5_INTEGRATION.md` — Admin UI + notifications + cron

---

## FILES TO CREATE (NEW)

| # | File | Type | Phase |
|---|------|------|-------|
| 1 | `supabase/migrations/20260217_kol_verification_results.sql` | Migration | 1 |
| 2 | `supabase/functions/kol-intelligence-crawl/index.ts` | Edge Function | 3 |
| 3 | `supabase/functions/kol-crawl-tiktok/index.ts` | Edge Function | 2 |
| 4 | `supabase/functions/kol-crawl-instagram/index.ts` | Edge Function | 2 |
| 5 | `supabase/functions/kol-crawl-youtube/index.ts` | Edge Function | 2 |
| 6 | `supabase/functions/kol-crawl-facebook/index.ts` | Edge Function | 2 |
| 7 | `supabase/functions/kol-crawl-twitter/index.ts` | Edge Function | 2 |
| 8 | `supabase/functions/kol-intelligence-score/index.ts` | Edge Function | 4 |
| 9 | `gem-mobile/src/services/kolIntelligenceService.js` | Service | 6 |
| 10 | `gem-mobile/src/components/Partnership/KOLVerificationResultCard.js` | Component | 6 |

## FILES TO UPDATE (EXISTING)

| # | File | Change | Phase |
|---|------|--------|-------|
| 1 | `adminPartnershipService.js` | Add `getKOLVerificationResults()` | 6 |
| 2 | `AdminApplicationDetail.js` | Show verification result card | 6 |
| 3 | `AdminPartnershipDashboard.js` | Add suspicious KOL counter badge | 6 |
| 4 | `kolVerificationService.js` | Trigger crawl after submission | 5 |
| 5 | `partnership-cron` edge function | Add `verify_kol` action | 5 |

---

## SUCCESS CRITERIA

Admin can:
- [ ] See ACTUAL follower count (crawled from platform)
- [ ] See engagement rate per platform
- [ ] See fraud risk level (LOW/MEDIUM/HIGH)
- [ ] See AI quality score (0-100)
- [ ] See discrepancy between reported vs actual followers
- [ ] Approve/reject with data-backed confidence
- [ ] Get push notification when suspicious KOL detected

System must:
- [ ] Run automatically on new KOL application
- [ ] Work async (non-blocking)
- [ ] Scale to thousands of KOL
- [ ] Retry failed crawls (3x with backoff)
- [ ] Rate limit crawl requests (1 per profile per 24h)
- [ ] Log all crawl attempts
- [ ] Never expose API keys to client
