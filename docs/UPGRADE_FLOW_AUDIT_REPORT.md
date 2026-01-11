# UPGRADE FLOW AUDIT REPORT

## 1. Existing Upgrade Code Found

| File | Type | Status | Notes |
|------|------|--------|-------|
| `screens/Account/TierUpgradeScreen.js` | Full Screen | Working | Shows tier options, Shopify checkout |
| `components/TierGuard.js` | Guard | Working | Blocks content by tier, shows prompt |
| `components/TierUpgradePrompt.js` | Components | Working | Banner, Modal, LockBadge, TierBadge |
| `components/GemMaster/UpgradeModal.js` | Modal | Working | GemMaster quota exhausted modal |
| `services/tierService.js` | Service | Working | Tier limits, quota management |
| `constants/tierFeatures.js` | Config | Working | Feature flags per tier |
| `config/tierAccess.js` | Config | Working | Tier access configuration |

## 2. Screens Analysis

| Screen | Has Upgrade? | Type | Trigger | Notes |
|--------|-------------|------|---------|-------|
| HomeScreen | NO | - | - | No upgrade prompts |
| ScannerScreen | PARTIAL | TierGuard | Feature locked | Only uses TierGuard |
| GemMasterScreen | YES | UpgradeModal | Quota exhausted | Custom modal |
| CoursesScreen | PARTIAL | TierGuard | Course locked | Uses TierGuard |
| AccountScreen | NO | - | - | Has link to TierUpgradeScreen |
| ShopScreen | NO | - | - | No upgrade prompts |

## 3. Components Inventory

### Already Exist:
- `TierGuard` - Blocks content, shows basic prompt
- `TierUpgradeBanner` - Inline banner
- `TierUpgradeModal` - Full modal
- `FeatureLockBadge` - Small lock icon
- `TierBadge` - Shows current tier
- `UpgradeModal` - GemMaster specific

### Missing:
- Centralized UpgradeContext
- Database-driven banners
- Analytics tracking
- Admin dashboard
- Consistent trigger system

## 4. Issues Identified

### 4.1 Hardcoded Data
- Shopify URLs hardcoded in components
- Tier pricing hardcoded
- Features list hardcoded

### 4.2 Inconsistent Styling
- Some use `Ionicons`, some use `lucide-react-native`
- Different color schemes
- No unified design tokens usage

### 4.3 No Analytics
- No tracking of banner impressions
- No tracking of upgrade clicks
- No conversion tracking

### 4.4 No Admin Control
- Cannot change banners without code deploy
- Cannot A/B test different messages
- No way to enable/disable banners

## 5. Recommendations

### Keep:
- `TierGuard` - Works well for blocking content
- `tierService.js` - Good tier limit logic
- `tierFeatures.js` - Good feature flags

### Replace/Enhance:
- Create centralized `upgradeService.js`
- Create `UpgradeContext` for global state
- Create database tables for tiers/banners
- Add analytics tracking

### New Components Needed:
- `UpgradePopup` - Animated popup (replaces UpgradeModal)
- `UpgradeBanner` - Inline banner (enhance existing)
- `FeatureLockOverlay` - Blur overlay for locked content

## 6. Implementation Priority

1. **Database Schema** - Create tables for dynamic content
2. **upgradeService.js** - Centralized API
3. **UpgradeContext** - Global state management
4. **Components** - New/enhanced components
5. **Integration** - Add triggers to screens
6. **Admin Dashboard** - Web admin for management
