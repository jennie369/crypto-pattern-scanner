# 📚 SERVICE REGISTRY

> **AUTO-GENERATED FROM PROJECT SCAN**
> **Last Updated:** 2025-12-11
> **Project:** Gemral Mobile App (gem-mobile)
> **Services Directory:** `gem-mobile/src/services/`

---

## 📋 SUMMARY

| Metric | Count |
|--------|-------|
| Total Services | 101 |
| Total Exported Functions | 353+ |
| Key Service Categories | 12 |

---

## 🔑 KEY SERVICES (Must Know)

### 1. gemEconomyService.js ⭐
**Purpose:** Gem economy - balance, packages, transactions, checkout

**Key Functions:**
```javascript
getGemBalance(userId)              → number    // Get user's gem balance
getGemPacks()                      → array     // Get available gem packages
buildCheckoutUrl(pack, userId)     → string    // Build Shopify checkout URL
getGemTransactions(userId, limit)  → array     // Get transaction history
performDailyCheckin(userId)        → object    // Daily check-in reward
claimWelcomeBonus(userId)          → object    // Claim 50 gems welcome bonus
formatGemAmount(amount)            → string    // Format: "1.2K"
calculateVndValue(gems)            → number    // Convert gems to VND
```

**Data Sources:**
- `profiles.gems` (PRIMARY)
- `gem_packs`
- `gems_transactions`

**Example:**
```javascript
import gemEconomyService from '../services/gemEconomyService';

const balance = await gemEconomyService.getGemBalance(userId);
const packs = await gemEconomyService.getGemPacks();
```

---

### 2. walletService.js
**Purpose:** Wallet operations (now reads from profiles.gems)

**Key Functions:**
```javascript
getBalance()                       → { gems, diamonds, totalEarned, totalSpent }
getWallet()                        → wallet object
getTransactions(limit, offset)     → array
sendGift(recipientId, giftId)      → object
formatGems(amount)                 → string
```

**Data Sources:**
- `profiles.gems` (PRIMARY - via walletService update)
- `user_wallets` (secondary stats)

---

### 3. courseService.js
**Purpose:** Course management, enrollment, progress

**Key Functions:**
```javascript
getCourses(filters)                → array     // Get all courses
getCourseById(courseId)            → course    // Get single course with modules
isEnrolled(userId, courseId)       → boolean   // Check enrollment
enrollUser(userId, courseId)       → object    // Enroll user
markLessonComplete(userId, courseId, lessonId) → object
getProgress(userId, courseId)      → progress object
generateCertificate(userId, courseId, userName) → certificate
```

**Data Sources:**
- `courses`
- `course_modules`
- `course_lessons`
- `course_enrollments`
- `lesson_progress`
- `course_certificates`

---

### 4. forumService.js
**Purpose:** Forum posts, comments, likes, interactions

**Key Functions:**
```javascript
getPosts(options)                  → { posts, hasMore }
getPostById(postId)                → post object
createPost(postData)               → post
deletePost(postId)                 → boolean
toggleLike(postId)                 → { liked, likesCount }
savePost(postId)                   → boolean
getComments(postId)                → array
addComment(postId, content)        → comment
```

**Data Sources:**
- `forum_posts`
- `forum_comments`
- `forum_likes`
- `forum_saved`
- `profiles`

---

### 5. feedService.js
**Purpose:** Home feed generation, personalization

**Key Functions:**
```javascript
generateFeed(userId, options)      → { posts, cursor }
getNextFeedPage(cursor)            → { posts, cursor }
trackInteraction(postId, type)     → void
trackVisibleImpressions(postIds)   → void
updateFeedPreferences(prefs)       → void
```

**Data Sources:**
- `forum_posts`
- `feed_impressions`
- `user_feed_preferences`
- `post_interactions`

---

### 6. affiliateService.js
**Purpose:** Affiliate system - codes, referrals, commissions

**Key Functions:**
```javascript
getAffiliateProfile()              → profile object
createAffiliateCode(code)          → code object
getMyReferrals()                   → array
getCommissions()                   → array
requestWithdrawal(amount)          → withdrawal object
getProductAffiliateLink(productId) → link string
```

**Data Sources:**
- `affiliate_profiles`
- `affiliate_codes`
- `affiliate_referrals`
- `affiliate_sales`
- `affiliate_commissions`
- `affiliate_withdrawals`

---

### 7. visionBoardService.js
**Purpose:** Vision board, goals, affirmations

**Key Functions:**
```javascript
getGoals(userId)                   → array
createGoal(goalData)               → goal
updateGoalProgress(goalId, progress) → goal
getAffirmations(userId)            → array
getWidgets(userId)                 → array
getDailySummary(userId)            → summary object
```

**Data Sources:**
- `vision_goals`
- `vision_actions`
- `vision_affirmations`
- `vision_habits`
- `vision_board_widgets`
- `vision_daily_summary`

---

### 8. gamificationService.js
**Purpose:** Gamification - achievements, streaks, XP

**Key Functions:**
```javascript
getUserAchievements(userId)        → array
checkAndAwardAchievements(userId)  → awarded array
addXPToUser(userId, amount, reason) → { newXP, levelUp }
getStreak(userId)                  → streak object
updateStreak(userId)               → streak object
```

**Data Sources:**
- `user_achievements`
- `user_streaks`
- `profiles`

---

### 9. notificationService.js
**Purpose:** Push notifications, in-app notifications

**Key Functions:**
```javascript
registerPushToken(token)           → void
sendPushNotification(userId, title, body) → void
getNotifications(userId)           → array
markAsRead(notificationId)         → void
```

**Data Sources:**
- `notifications`
- `notification_preferences`
- `user_push_tokens`

---

### 10. binanceService.js
**Purpose:** Crypto price data from Binance API

**Key Functions:**
```javascript
getKlines(symbol, interval, limit) → candle array
getTicker24h(symbol)               → ticker object
getExchangeInfo()                  → exchange info
getAllSymbols()                    → symbol array
```

**Data Sources:**
- Binance API (external)
- No database tables

---

## 📂 ALL SERVICES BY CATEGORY

### 💎 Gem Economy
| Service | Purpose |
|---------|---------|
| `gemEconomyService.js` | Gem balance, packages, checkout |
| `walletService.js` | Wallet operations |
| `giftService.js` | Gift sending/receiving |
| `boostService.js` | Post boost with gems |
| `earningsService.js` | Creator earnings |
| `withdrawService.js` | Withdrawal requests |

### 📚 Courses
| Service | Purpose |
|---------|---------|
| `courseService.js` | Course CRUD, enrollment |
| `courseBuilderService.js` | Admin course builder |
| `courseAccessService.js` | Access control |
| `progressService.js` | Lesson progress |
| `quizService.js` | Quiz management |

### 🏠 Forum & Feed
| Service | Purpose |
|---------|---------|
| `forumService.js` | Posts, comments, likes |
| `feedService.js` | Home feed generation |
| `repostService.js` | Repost functionality |
| `hashtagService.js` | Hashtag management |
| `searchService.js` | Search functionality |
| `forumRecommendationService.js` | Post recommendations |

### 🎯 Vision Board
| Service | Purpose |
|---------|---------|
| `visionBoardService.js` | Main vision board |
| `goalService.js` | Goal management |
| `actionService.js` | Action items |
| `habitService.js` | Habit tracking |
| `affirmationService.js` | Affirmations |
| `ritualService.js` | Daily rituals |
| `calendarService.js` | Calendar events |

### 🤝 Affiliate
| Service | Purpose |
|---------|---------|
| `affiliateService.js` | Affiliate management |
| `partnershipService.js` | Partnership applications |

### 🔔 Notifications
| Service | Purpose |
|---------|---------|
| `notificationService.js` | Push notifications |
| `notificationScheduler.js` | Scheduled notifications |
| `notificationPreferenceService.js` | User preferences |

### 💬 Messaging
| Service | Purpose |
|---------|---------|
| `messagingService.js` | Direct messages |
| `presenceService.js` | Online status |

### 📊 Analytics
| Service | Purpose |
|---------|---------|
| `analyticsService.js` | Post analytics |
| `engagementService.js` | Engagement metrics |
| `statsService.js` | User statistics |

### 🛒 Shop
| Service | Purpose |
|---------|---------|
| `shopifyService.js` | Shopify integration |
| `shopifyProductService.js` | Product management |
| `orderService.js` | Order management |
| `orderTrackingService.js` | Order tracking |
| `shopRecommendationService.js` | Product recommendations |

### 📈 Trading
| Service | Purpose |
|---------|---------|
| `binanceService.js` | Crypto prices |
| `patternDetection.js` | Chart pattern detection |
| `multiTimeframeScanner.js` | Multi-TF scanning |
| `paperTradeService.js` | Paper trading |
| `portfolioService.js` | Portfolio management |

### 🔮 Divination
| Service | Purpose |
|---------|---------|
| `tarotService.js` | Tarot readings |
| `ichingService.js` | I-Ching readings |
| `divinationService.js` | General divination |
| `gemMasterService.js` | Gem Master chatbot |

### 🎮 Gamification
| Service | Purpose |
|---------|---------|
| `gamificationService.js` | Achievements, XP |
| `badgeService.js` | User badges |

### 🛡️ User Management
| Service | Purpose |
|---------|---------|
| `tierService.js` | Tier management |
| `tierAccessService.js` | Access control |
| `quotaService.js` | Usage quotas |
| `privacyService.js` | Privacy settings |
| `blockService.js` | Block users |
| `followService.js` | Follow system |
| `biometricService.js` | Biometric auth |

### 🔧 Utilities
| Service | Purpose |
|---------|---------|
| `supabase.js` | Supabase client |
| `deepLinkHandler.js` | Deep link handling |
| `shareService.js` | Share functionality |
| `imageService.js` | Image processing |
| `exportService.js` | Data export |
| `helpService.js` | Help center |

---

## 🔍 FUNCTION QUICK REFERENCE

### Gem Operations
| Function | Service | Returns |
|----------|---------|---------|
| `getGemBalance(userId)` | gemEconomyService | number |
| `getGemPacks()` | gemEconomyService | array |
| `performDailyCheckin(userId)` | gemEconomyService | object |
| `getBalance()` | walletService | object |
| `sendGift(recipientId, giftId)` | giftService | object |

### User Operations
| Function | Service | Returns |
|----------|---------|---------|
| `followUser(userId)` | followService | boolean |
| `unfollowUser(userId)` | followService | boolean |
| `isFollowing(userId)` | followService | boolean |
| `blockUser(userId)` | blockService | boolean |
| `checkQuota(type)` | quotaService | { allowed, remaining } |

### Content Operations
| Function | Service | Returns |
|----------|---------|---------|
| `getPosts(options)` | forumService | { posts, hasMore } |
| `createPost(data)` | forumService | post |
| `toggleLike(postId)` | forumService | { liked, count } |
| `getCourses(filters)` | courseService | array |
| `enrollUser(userId, courseId)` | courseService | object |

### Trading Operations
| Function | Service | Returns |
|----------|---------|---------|
| `getKlines(symbol, interval)` | binanceService | array |
| `detectPatterns(candles)` | patternDetection | array |
| `openPaperTrade(data)` | paperTradeService | trade |

---

## 📝 USAGE GUIDELINES

### Importing Services
```javascript
// Default export (class instance)
import courseService from '../services/courseService';

// Named exports
import { getGemBalance, getGemPacks } from '../services/gemEconomyService';

// Or default with named
import gemEconomyService, { GEM_CONFIG } from '../services/gemEconomyService';
```

### Error Handling
```javascript
try {
  const balance = await gemEconomyService.getGemBalance(userId);
  if (balance === null) {
    // Handle error
  }
} catch (error) {
  console.error('Error:', error);
}
```

### Service Dependencies
Some services depend on others:
- `feedService` → `forumService`
- `boostService` → `gemEconomyService`
- `courseAccessService` → `courseService`

---

## ⚠️ IMPORTANT NOTES

1. **Always use gemEconomyService for gem operations** - not walletService directly
2. **Check tier access** before allowing premium features
3. **Handle offline gracefully** - especially for trading services
4. **Use proper error handling** - services may return null/undefined on error
5. **Cache when appropriate** - binanceService calls are rate-limited
