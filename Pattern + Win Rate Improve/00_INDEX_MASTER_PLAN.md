# 📋 GEM SCANNER ADVANCED IMPLEMENTATION - MASTER INDEX
## Tổng Quan Tất Cả Phases & Prompts

**Tổng thời gian:** ~230 giờ (6-7 tuần)  
**Tổng số issues:** 28  
**Target:** Nâng win rate từ 38% → 68%

---

## 🗂️ DANH SÁCH FILES

```
IMPLEMENTATION_PROMPTS/
├── 00_INDEX_MASTER_PLAN.md          ← Bạn đang đây
├── 01_PHASE_1A_PATTERN_ZONE.md      ← Pattern Strength + Zone Object
├── 02_PHASE_1B_QM_FTR.md            ← Quasimodo + FTR Detection
├── 03_PHASE_1C_ODDS_FRESHNESS.md    ← Odds Enhancers + Freshness
├── 04_PHASE_2A_FL_DP_HIERARCHY.md   ← Flag Limit + Decision Point
├── 05_PHASE_2B_STACKED_HIDDEN.md    ← Stacked Zones + Hidden FTR
├── 06_PHASE_2C_COMPRESSION_INDUCE.md← Compression + Inducement
├── 07_PHASE_3A_CONFIRMATION.md      ← Confirmation Patterns
├── 08_PHASE_3B_EXTENDED_MPL.md      ← Extended Zones + MPL
├── 09_PHASE_3C_ALERTS_UI.md         ← Alert System + UI Polish
└── 10_DATABASE_MIGRATIONS_ALL.md    ← Tất cả SQL migrations
```

---

## 📊 TIMELINE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         IMPLEMENTATION TIMELINE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TUẦN 1: PHASE 1A - Pattern Strength + Zone Object                         │
│  ════════════════════════════════════════════════                          │
│  • Fix PATTERN_WIN_RATES ranking                                           │
│  • Implement Zone object (entry + stop prices)                             │
│  • Fix zone boundary calculation                                           │
│  • Update Scanner UI                                                       │
│  • Thời gian: 24 giờ                                                       │
│  • Expected impact: +5-8% win rate                                         │
│                                                                             │
│  TUẦN 2: PHASE 1B - Quasimodo + FTR Detection                              │
│  ════════════════════════════════════════════════                          │
│  • Implement QM pattern detection                                          │
│  • Implement FTR zone detection                                            │
│  • BOS (Break of Structure) detection                                      │
│  • QML/MPL level calculation                                               │
│  • Thời gian: 30 giờ                                                       │
│  • Expected impact: +5-7% win rate                                         │
│                                                                             │
│  TUẦN 3: PHASE 1C - Odds Enhancers + Freshness                             │
│  ════════════════════════════════════════════════                          │
│  • 8 Odds Enhancers scoring system                                         │
│  • Freshness tracking (zone test history)                                  │
│  • Order absorption concept                                                │
│  • Score UI (A+/B/C grades)                                                │
│  • Thời gian: 38 giờ                                                       │
│  • Expected impact: +10-12% win rate                                       │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────     │
│  END OF PHASE 1: Expected Win Rate 55-65%                                  │
│  ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│  TUẦN 4: PHASE 2A - Flag Limit + Decision Point + Hierarchy                │
│  ════════════════════════════════════════════════════════════              │
│  • Flag Limit (FL) pattern detection                                       │
│  • Decision Point (DP) identification                                      │
│  • Zone Hierarchy system (DP > FTR > FL > Regular)                        │
│  • Thời gian: 26 giờ                                                       │
│                                                                             │
│  TUẦN 5: PHASE 2B - Stacked Zones + Hidden FTR + Zone-in-Zone              │
│  ════════════════════════════════════════════════════════════              │
│  • Stacked Zones confluence detection                                      │
│  • Hidden FTR (LTF zone refinement)                                        │
│  • Zone-in-Zone nested detection                                           │
│  • FTB (First Time Back) tracking                                          │
│  • Thời gian: 28 giờ                                                       │
│                                                                             │
│  TUẦN 5-6: PHASE 2C - Compression + Inducement + Look Right                │
│  ════════════════════════════════════════════════════════════              │
│  • Compression detection (triangle/wedge into zone)                        │
│  • Inducement/Stop Hunt detection                                          │
│  • Look To The Right rule                                                  │
│  • Thời gian: 22 giờ                                                       │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────     │
│  END OF PHASE 2: Expected Win Rate 62-73%                                  │
│  ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│  TUẦN 6: PHASE 3A - Confirmation Patterns                                  │
│  ════════════════════════════════════════                                  │
│  • 8 Confirmation patterns detection                                       │
│  • Entry methods (Set & Forget vs Confirmation)                            │
│  • R:R validation (min 2:1)                                                │
│  • Thời gian: 22 giờ                                                       │
│                                                                             │
│  TUẦN 6-7: PHASE 3B - Extended Zones + Pin & Engulf + MPL                  │
│  ════════════════════════════════════════════════════════                  │
│  • Extended Zone handling                                                  │
│  • Pin & Engulf strategy                                                   │
│  • MPL (Maximum Pain Level)                                                │
│  • Engulf validation                                                       │
│  • Thời gian: 20 giờ                                                       │
│                                                                             │
│  TUẦN 7: PHASE 3C - Alert System + UI Polish                               │
│  ════════════════════════════════════════════                              │
│  • Push notifications for zone approach                                    │
│  • Price alerts system                                                     │
│  • UI enhancements                                                         │
│  • Onboarding for new features                                             │
│  • Thời gian: 20 giờ                                                       │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────     │
│  END OF PHASE 3: Expected Win Rate 65-78%                                  │
│  ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE CHANGES SUMMARY

### New Tables

| Table | Purpose | Phase |
|-------|---------|-------|
| `zone_history` | Track zone tests, freshness | 1C |
| `pattern_scores` | Store odds enhancers scores | 1C |
| `user_alerts` | Price alerts configuration | 3C |
| `alert_notifications` | Sent notification history | 3C |

### Table Modifications

| Table | Changes | Phase |
|-------|---------|-------|
| `patterns` | Add 20+ new columns for scoring | 1A, 1C |
| `user_preferences` | Add scanner settings | 3C |

---

## 📁 NEW FILES SUMMARY

### Services (10 files)

| File | Purpose | Phase |
|------|---------|-------|
| `zoneObject.js` | Zone with entry + stop prices | 1A |
| `quasimodoDetector.js` | QM pattern detection | 1B |
| `ftrDetector.js` | FTR zone detection | 1B |
| `oddsEnhancers.js` | 8 scoring criteria | 1C |
| `freshnessTracker.js` | Zone test tracking | 1C |
| `flagLimitDetector.js` | FL pattern detection | 2A |
| `decisionPointDetector.js` | DP identification | 2A |
| `compressionDetector.js` | Compression patterns | 2C |
| `inducementDetector.js` | Stop hunt detection | 2C |
| `confirmationPatterns.js` | Entry patterns | 3A |

### Components (15 files)

| Component | Purpose | Phase |
|-----------|---------|-------|
| `ZoneBoundaryDisplay.js` | Show entry + stop zone | 1A |
| `PatternStrengthBadge.js` | Visual strength indicator | 1A |
| `QMPatternCard.js` | Quasimodo pattern display | 1B |
| `FTRZoneCard.js` | FTR zone display | 1B |
| `OddsEnhancerScorecard.js` | 8 criteria scores | 1C |
| `FreshnessIndicator.js` | Fresh/Tested/Stale badge | 1C |
| `ZoneHierarchyBadge.js` | DP/FTR/FL/Regular label | 2A |
| `StackedZonesIndicator.js` | Multi-zone confluence | 2B |
| `HiddenFTRPanel.js` | LTF zone refinement | 2B |
| `CompressionAlert.js` | Compression detection | 2C |
| `InducementWarning.js` | Stop hunt warning | 2C |
| `ConfirmationPatternCard.js` | Entry pattern display | 3A |
| `EntryMethodSelector.js` | Set&Forget vs Confirm | 3A |
| `PriceAlertModal.js` | Create price alerts | 3C |
| `ScannerOnboarding.js` | Feature introduction | 3C |

### Screens (3 files)

| Screen | Purpose | Phase |
|--------|---------|-------|
| `ZoneDetailScreen.js` | Enhanced zone details | 1B |
| `OddsAnalysisScreen.js` | Full odds breakdown | 1C |
| `AlertsManagementScreen.js` | Manage price alerts | 3C |

---

## ⚠️ ENFORCEMENT RULES (ÁP DỤNG TẤT CẢ PHASES)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CRITICAL RULES                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🔴 TRƯỚC KHI CODE:                                                         │
│  ─────────────────                                                          │
│  □ Đọc file 10_DATABASE_MIGRATIONS_ALL.md TRƯỚC                            │
│  □ Chạy migrations TRƯỚC khi code query                                    │
│  □ Grep tất cả files liên quan                                             │
│  □ Đọc existing code TRƯỚC khi modify                                      │
│                                                                             │
│  🔴 KHI VIẾT CODE:                                                          │
│  ─────────────────                                                          │
│  □ Complete file (không snippet)                                           │
│  □ Tất cả states (loading/error/empty/success)                             │
│  □ Optional chaining (?.) cho tất cả property access                       │
│  □ Fallback values cho arrays: items || []                                 │
│  □ Design tokens từ theme/designTokens.js                                  │
│  □ Vietnamese text có dấu đầy đủ                                           │
│  □ Lucide icons (không emoji)                                              │
│                                                                             │
│  🔴 KHI NAVIGATE:                                                           │
│  ─────────────────                                                          │
│  □ Validate data !== null/undefined                                        │
│  □ Build FULL object với tất cả required props                             │
│  □ Include arrays: variants: [], images: []                                │
│  □ Register screen trong Navigator TRƯỚC                                   │
│                                                                             │
│  🔴 TESTING:                                                                │
│  ──────────                                                                 │
│  □ Test happy path                                                         │
│  □ Test error cases                                                        │
│  □ Test empty states                                                       │
│  □ Test edge cases (10+ per feature)                                       │
│  □ Test trên mobile responsive                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 CÁCH SỬ DỤNG

### Bước 1: Chạy Database Migrations
```bash
# Đọc file 10_DATABASE_MIGRATIONS_ALL.md
# Chạy SQL trong Supabase Dashboard theo thứ tự
```

### Bước 2: Implement theo Phase
```bash
# Đọc từng file Phase theo thứ tự:
# 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09

# Mỗi file chứa:
# - Overview & Goals
# - Database changes (nếu có)
# - Service implementations
# - Component implementations
# - Screen implementations
# - Onboarding & Tooltips
# - Edge Cases (10+)
# - Testing Checklist
```

### Bước 3: Test sau mỗi Phase
```bash
# Chạy testing checklist trong mỗi file
# Verify win rate improvement
# Fix bugs trước khi chuyển phase tiếp
```

---

## 📈 SUCCESS METRICS

| Metric | Current | After Phase 1 | After Phase 2 | After Phase 3 |
|--------|---------|---------------|---------------|---------------|
| Win Rate | 38% | 55-65% | 62-73% | 65-78% |
| Patterns Detected | 4 | 6 | 10 | 12 |
| Scoring Criteria | 1 | 9 | 15 | 20 |
| Zone Types | 2 | 4 | 7 | 8 |
| Alerts | 0 | 0 | 0 | Full |

---

## 📝 NOTES

- Mỗi Phase có thể chạy độc lập nhưng NÊN theo thứ tự
- Phase 1 là CRITICAL - phải hoàn thành trước
- Database migrations phải chạy TRƯỚC code
- Test kỹ sau mỗi Phase trước khi tiếp tục

---

**Bắt đầu với:** `01_PHASE_1A_PATTERN_ZONE.md`
