# GEM MOBILE - CODEBASE ANALYSIS

> Generated: 2026-01-28
> Framework: React Native + Expo (~54.0.25)
> Total Files: 1,165+ source files

---

## 1. PROJECT STRUCTURE

```
gem-mobile/
├── src/
│   ├── assets/
│   │   ├── avatars/
│   │   ├── backgrounds/
│   │   ├── fonts/
│   │   ├── iching/
│   │   ├── images/
│   │   ├── sounds/
│   │   └── tarot/
│   │       ├── major/
│   │       └── minor/
│   ├── components/     # 456 component files
│   ├── config/         # 9 config files
│   ├── contexts/       # 16 context providers
│   ├── hooks/          # 46 custom hooks
│   ├── navigation/     # 12 navigation files
│   ├── screens/        # 338 screen files
│   ├── services/       # 288 service files
│   └── utils/          # Utility functions
├── package.json
└── app.json
```

---

## 2. NAVIGATION STRUCTURE

### 2.1 Tab Navigator (6 Tabs)

| Tab | Name | Stack | Icon | Description |
|-----|------|-------|------|-------------|
| 1 | Home | HomeStack | Home | Forum/Social Feed |
| 2 | Shop | ShopStack | Shop | E-commerce |
| 3 | Trading | ScannerStack | Chart | Pattern Scanner |
| 4 | GemMaster | GemMasterStack | Bot | AI Chatbot |
| 5 | Notifications | NotificationsScreen | Bell | Alerts |
| 6 | Account | AccountStack | User | Profile/Settings |

### 2.2 Navigation Stacks

#### HomeStack (Forum)
| Screen | Route Name | Description |
|--------|------------|-------------|
| ForumScreen | ForumFeed | Main social feed |
| PostDetailScreen | PostDetail | Single post view |
| UserProfileScreen | UserProfile | User profile |
| CreatePostScreen | CreatePost | Create new post (modal) |
| EditPostScreen | EditPost | Edit post (modal) |
| HashtagFeedScreen | HashtagFeed | Posts by hashtag |
| SearchScreen | Search | Search posts |
| GlobalSearchScreen | GlobalSearch | Global search |
| PostAnalyticsScreen | PostAnalytics | Post stats |
| PostGiftsScreen | PostGifts | Gifts on post |
| FollowersListScreen | FollowersList | User followers |
| FollowingListScreen | FollowingList | User following |
| ProductDetailScreen | ProductDetailFromPost | Tagged product |

#### ShopStack (E-commerce)
| Screen | Route Name | Description |
|--------|------------|-------------|
| ShopScreen | ShopMain | Shop home |
| ProductSearchScreen | ProductSearch | Search products |
| ProductListScreen | ProductList | Product list |
| DigitalProductsScreen | DigitalProducts | Digital products |
| ProductDetailScreen | ProductDetail | Product detail |
| WishlistScreen | Wishlist | User wishlist |
| RecentlyViewedScreen | RecentlyViewedScreen | Recently viewed |
| AllCategoriesScreen | AllCategories | All categories |
| CartScreen | Cart | Shopping cart |
| CheckoutScreen | Checkout | Checkout (modal) |
| CheckoutWebView | CheckoutWebView | Shopify checkout |
| OrderSuccessScreen | OrderSuccess | Order success |
| OrdersScreen | Orders | Order history |
| OrderDetailScreen | OrderDetail | Order detail |
| PaymentStatusScreen | PaymentStatus | Bank transfer status |
| PaymentSuccessScreen | PaymentSuccess | Payment confirmed |
| PaymentExpiredScreen | PaymentExpired | Payment expired |
| GemPurchaseSuccessScreen | GemPurchaseSuccess | Gem purchase success |
| GemPurchasePendingScreen | GemPurchasePending | Gem purchase pending |
| CoursesScreen | CourseList | Course list |
| CourseDetailScreen | CourseDetail | Course detail |
| LessonPlayerScreen | LessonPlayer | Lesson player |
| QuizScreen | QuizScreen | Quiz |
| CertificateScreen | Certificate | Certificate |
| CourseCheckout | CourseCheckout | Course checkout |
| CourseAchievementsScreen | CourseAchievements | Course achievements |

#### ScannerStack (Trading)
| Screen | Route Name | Description |
|--------|------------|-------------|
| ScannerScreen | ScannerMain | Pattern scanner |
| PatternDetailScreen | PatternDetail | Pattern detail |
| OpenPositionsScreen | OpenPositions | Open positions |
| PaperTradeHistoryScreen | PaperTradeHistory | Paper trade history |
| MTFDashboardScreen | MTFDashboard | Multi-timeframe |
| ExchangeOnboardingScreen | ExchangeOnboarding | Exchange onboarding |
| ExchangeAccountsScreen | ExchangeAccounts | Exchange accounts |
| APIConnectionScreen | APIConnection | API connection |

#### GemMasterStack (AI Chatbot)
| Screen | Route Name | Description |
|--------|------------|-------------|
| GemMasterScreen | GemMasterMain | AI chatbot |
| IChingScreen | IChing | I Ching divination |
| SpreadSelectionScreen | Tarot | Tarot spread selection |
| TarotScreen | QuickTarot | Quick tarot |
| ChatHistoryScreen | ChatHistory | Chat history |
| TarotReadingScreen | TarotReading | Tarot reading |
| ReadingHistoryScreen | ReadingHistory | Reading history |
| ReadingDetailScreen | ReadingDetail | Reading detail |
| ProductDetailScreen | ProductDetail | Crystal recommendations |
| RitualsScreen | Rituals | Rituals list |
| GamificationScreen | Gamification | Gamification |

#### MessagesStack (Direct Messages)
| Screen | Route Name | Description |
|--------|------------|-------------|
| ConversationsListScreen | ConversationsList | Chat list |
| ChatScreen | Chat | Individual chat |
| NewConversationScreen | NewConversation | New chat (modal) |
| ConversationInfoScreen | ConversationInfo | Chat info |
| MediaGalleryScreen | MediaGallery | Media gallery |
| CreateGroupScreen | CreateGroup | Create group |
| MessageSearchScreen | MessageSearch | Search messages |
| ForwardMessageScreen | ForwardMessage | Forward message |
| BlockedUsersScreen | BlockedUsers | Blocked users |
| PinnedMessagesScreen | PinnedMessages | Pinned messages |
| ScheduledMessagesScreen | ScheduledMessages | Scheduled messages |
| StarredMessagesScreen | StarredMessages | Starred messages |
| ArchivedChatsScreen | ArchivedChats | Archived chats |
| MessageRequestsScreen | MessageRequests | Message requests |
| PrivacySettingsScreen | MessagePrivacySettings | Privacy settings |
| RestrictedUsersScreen | RestrictedUsers | Restricted users |
| SpamMessagesScreen | SpamMessages | Spam messages |
| CallHistoryScreen | CallHistory | Call history |

#### CallStack (Audio/Video Calls)
| Screen | Route Name | Description |
|--------|------------|-------------|
| OutgoingCallScreen | OutgoingCall | Initiating call |
| IncomingCallScreen | IncomingCall | Receiving call |
| InCallScreen | InCall | Active audio call |
| VideoCallScreen | VideoCall | Active video call |
| CallEndedScreen | CallEnded | Call ended |
| CallHistoryScreen | CallHistory | Call history |

#### CourseStack (LMS)
| Screen | Route Name | Description |
|--------|------------|-------------|
| CoursesScreen | CourseList | Course list |
| CourseDetailScreen | CourseDetail | Course detail |
| LessonPlayerScreen | LessonPlayer | Lesson player |
| QuizScreen | QuizScreen | Quiz |
| CertificateScreen | Certificate | Certificate |
| CourseCheckout | CourseCheckout | Course checkout |
| CourseAchievementsScreen | CourseAchievements | Achievements |
| DailyQuestsScreen | DailyQuests | Daily quests |
| LeaderboardScreen | Leaderboard | Leaderboard |

#### AccountStack (Profile & Settings)
| Screen | Route Name | Description |
|--------|------------|-------------|
| AccountScreen | AssetsHome | Account hub |
| AffiliateDetailScreen | AffiliateDetail | Affiliate detail |
| PortfolioScreen | Portfolio | Portfolio |
| TierUpgradeScreen | TierUpgrade | Tier upgrade |
| UpgradeScreen | UpgradeScreen | Upgrade flow |
| ProfileSettingsScreen | ProfileSettings | Profile settings |
| NotificationSettingsScreen | NotificationSettings | Notification settings |
| SettingsScreen | Settings | Settings |
| VisionBoardScreen | VisionBoard | Vision board |
| AchievementsScreen | Achievements | Achievements |
| CalendarScreen | VisionCalendar | Calendar |
| GoalDetailScreen | GoalDetail | Goal detail |
| WalletScreen | Wallet | Wallet |
| BuyGemsScreen | BuyGems | Buy gems |
| EarningsScreen | Earnings | Creator earnings |
| SoundLibraryScreen | SoundLibrary | Sound library |
| KarmaDashboardScreen | KarmaDashboard | Karma |
| ShadowModeScreen | ShadowMode | Shadow trading |
| LivestreamListScreen | LivestreamList | Livestreams |
| LivestreamViewerScreen | LivestreamViewer | Watch livestream |
| AdminDashboardScreen | AdminDashboard | Admin dashboard |

**Admin Screens in AccountStack:**
- AdminApplications, AdminWithdrawals, AdminUsers, AdminReports
- AdminNotifications, AdminSponsorBanners, AdminShopBanners
- ContentCalendar, ContentEditor, AutoPostLogs, PlatformSettings
- AdminSeedContent, AdminGiftCatalog, AdminCourseHighlights
- UserManagement, UserDetail, RevenueDashboard
- SupportTickets, TicketDetail, ContentDashboard, PushEditor
- AdminCourses, CourseBuilder, ModuleBuilder, LessonBuilder, QuizBuilder
- AdminExpiringUsers, AdminExpirationLogs, AdminStickerPacks
- AdminPartnershipDashboard, AdminPartners, AdminPartnerResources
- WaitlistLeads, AdminInstructors, AffiliateExchangeAdmin, AdminUpgrade

**Vision Board Ritual Screens:**
- HeartExpansionRitual, GratitudeFlowRitual, CleansingBreathRitual
- WaterManifestRitual, LetterToUniverseRitual, BurnReleaseRitual
- StarWishRitual, CrystalHealingRitual, RitualHistory, RitualPlayground

**Calendar Smart Journal Screens:**
- JournalEntryScreen, TradingJournalScreen, CalendarSettingsScreen

---

## 3. ALL SERVICES

| # | Service File | Key Functions | Tables Used |
|---|--------------|---------------|-------------|
| 1 | authService | login, logout, register | profiles |
| 2 | affiliateService | getProfile, trackReferral, getCommissions | affiliate_profiles, affiliate_commissions, affiliate_referrals, affiliate_sales, affiliate_codes |
| 3 | ritualService | completeRitual, getRitualHistory | vision_ritual_completions |
| 4 | tarotService | drawCards, saveReading | reading_history, tarot_readings |
| 5 | ichingService | castHexagram, saveReading | reading_history |
| 6 | shopifyService | getProducts, createCheckout | shopify_orders |
| 7 | courseService | getCourses, enrollCourse, getProgress | courses, course_modules, course_lessons, course_enrollments, lesson_progress |
| 8 | courseBuilderService | createCourse, addModule, addLesson | courses, course_modules, course_lessons |
| 9 | messagingService | sendMessage, getConversations | conversations, messages, conversation_participants |
| 10 | callService | initiateCall, answerCall, endCall | calls, call_participants, call_events |
| 11 | callSignalingService | sendSignal, handleSignal | WebRTC signaling |
| 12 | webrtcService | createPeerConnection, handleOffer | WebRTC |
| 13 | forumService | getPosts, createPost, likePost | forum_posts, forum_comments, forum_likes |
| 14 | commentService | getComments, addComment, deleteComment | forum_comments, forum_likes |
| 15 | followService | followUser, unfollowUser | user_follows |
| 16 | blockService | blockUser, hidePost | blocked_users, hidden_posts |
| 17 | notificationService | sendPush, getNotifications | forum_notifications, user_push_tokens |
| 18 | gamificationService | awardXP, checkAchievements | user_achievements, user_xp |
| 19 | karmaService | awardKarma, getKarmaHistory | user_karma, karma_transactions |
| 20 | walletService | getBalance, transferGems | user_wallets, wallet_transactions |
| 21 | giftService | sendGift, getGiftCatalog | gift_catalog, gift_transactions |
| 22 | boostService | boostPost, getBoostStats | post_boosts |
| 23 | paperTradeService | createTrade, closeTrade | paper_trades |
| 24 | scannerService | scanPatterns, detectZones | pattern_scans, zone_data |
| 25 | alertService | createAlert, checkAlerts | price_alerts |
| 26 | binanceApiService | getKlines, getPrice | user_exchange_connections |
| 27 | exchangeAffiliateService | trackClick, getStats | exchange_affiliate_clicks |
| 28 | livestreamService | startStream, endStream | livestream_sessions |
| 29 | divinationService | getTarotCards, getIChingHexagrams | tarot_cards, iching_hexagrams |
| 30 | affirmationService | getAffirmations, completeAffirmation | vision_affirmations, vision_affirmation_logs, affirmation_completions |
| 31 | goalService | getGoals, createGoal, updateProgress | vision_goals, vision_actions |
| 32 | habitService | getHabits, trackHabit | vision_habits |
| 33 | calendarService | getEvents, createEvent | calendar_events |
| 34 | calendarJournalService | getJournalEntries, saveEntry | calendar_journal_entries |
| 35 | tradingJournalService | getEntries, saveEntry | trading_journal_entries |
| 36 | moodTrackingService | trackMood, getMoodHistory | mood_logs |
| 37 | streakService | getStreak, updateStreak | user_streaks |
| 38 | achievementService | checkAchievements, unlockAchievement | user_unlocked_achievements |
| 39 | quotaService | getQuota, useQuota | chatbot_quota |
| 40 | geminiService | chat, generateResponse | Google Gemini AI |
| 41 | gemMasterService | processMessage, getHistory | chatbot_conversations, chatbot_messages |
| 42 | proactiveAIService | generateSuggestions | AI suggestions |
| 43 | settingsService | getSettings, updateSettings | user_preferences |
| 44 | privacyService | getPrivacySettings, updateSettings | profiles |
| 45 | tierService | getTierInfo, checkAccess | profiles, user_access |
| 46 | upgradeService | upgradeTier, checkEligibility | profiles |
| 47 | partnershipService | applyPartnership, getStatus | partnership_applications |
| 48 | withdrawService | requestWithdraw, getHistory | withdrawal_requests, affiliate_withdrawals |
| 49 | orderService | getOrders, trackOrder | shopify_orders |
| 50 | supportTicketService | createTicket, getTickets | support_tickets |
| 51 | helpService | getArticles, searchHelp | help_articles |
| 52 | feedService | getFeed, refreshFeed | forum_posts |
| 53 | hashtagService | getTrending, getPostsByTag | hashtags |
| 54 | searchService | search, getResults | search_index |
| 55 | imageService | uploadImage, processImage | Storage buckets |
| 56 | cacheService | get, set, invalidate | AsyncStorage |
| 57 | pushTokenService | registerToken, removeToken | user_push_tokens |
| 58 | deepLinkHandler | handleUrl, navigate | Deep linking |
| 59 | welcomeService | hasCompletedWelcome, setCompleted | AsyncStorage |
| 60 | biometricService | authenticate, isAvailable | Expo LocalAuth |

---

## 4. ALL COMPONENTS (Major Categories)

### 4.1 Core UI Components
| Component | Location | Description |
|-----------|----------|-------------|
| GlassBottomTab | /components/ | Custom tab bar with glass effect |
| CircularProgress | /Common/ | Circular progress indicator |
| OfflineBanner | /Common/ | Offline status banner |
| OptimizedImage | /Common/ | Image with caching |
| Tooltip | /Common/ | Tooltip component |
| DarkAlert | /UI/ | Dark themed alert |
| SafeFlatList | /UI/ | Safe area flat list |
| SafeScrollView | /UI/ | Safe area scroll view |

### 4.2 Scanner Components (47 files)
| Component | Description |
|-----------|-------------|
| PatternCard | Pattern detection card |
| TimeframeSelector | TF selection |
| ConfidenceBar | Confidence indicator |
| ZoneRectangle | Zone visualization |
| PaperTradeModal | Paper trading modal |
| AlertCard | Price alert card |
| FTRZoneCard | FTR zone card |
| QMPatternCard | Quasimodo pattern |
| ZoneHierarchyBadge | Zone hierarchy badge |

### 4.3 GemMaster/AI Components (47 files)
| Component | Description |
|-----------|-------------|
| MessageBubble | Chat message bubble |
| QuickActionBar | Quick action buttons |
| CardFlip | Tarot card flip animation |
| HexagramBuilder | I Ching hexagram builder |
| SpreadLayout | Tarot spread layout |
| StreakDisplay | Streak counter |
| QuotaIndicator | Usage quota indicator |
| VoiceInputButton | Voice input button |
| TypingIndicator | Typing animation |

### 4.4 VisionBoard Components (33 files)
| Component | Description |
|-----------|-------------|
| GoalCard | Goal display card |
| HabitGrid | Habit tracker grid |
| CalendarHeatMap | Activity heat map |
| StreakBadge | Streak badge |
| DailySummaryCard | Daily summary |
| MoodPicker | Mood selection |
| JournalEntryCard | Journal entry card |
| TradingEntryCard | Trading journal entry |
| RitualProgressBar | Ritual progress |
| CompletionModal | Completion celebration |

### 4.5 Ritual/Cosmic Components (16 files)
| Component | Description |
|-----------|-------------|
| CosmicBackground | Animated background |
| GlassCard | Glassmorphism card |
| GlowButton | Glowing button |
| ParticleField | Particle animation |
| RitualAnimation | Ritual animations |
| VideoBackground | Video background |
| CompletionCelebration | Completion effects |

### 4.6 Messages Components (23 files)
| Component | Description |
|-----------|-------------|
| MessageBubble | Chat bubble |
| ChatInput | Message input |
| VoiceRecorder | Voice message recorder |
| ReactionPicker | Message reactions |
| LinkPreviewCard | URL preview |
| OnlineStatusIndicator | Online status |
| TypingIndicator | Typing animation |

### 4.7 Call Components (11 files)
| Component | Description |
|-----------|-------------|
| CallAvatar | Caller avatar |
| CallControls | Call control buttons |
| CallTimer | Call duration timer |
| LocalVideoView | Local video stream |
| RemoteVideoView | Remote video stream |
| VideoControls | Video controls |
| MinimizedCallView | PiP call view |

### 4.8 Shop Components (17 files)
| Component | Description |
|-----------|-------------|
| ProductCard | Product display card |
| CategoryGrid | Category grid |
| HeroBannerCarousel | Hero banner slider |
| FlashSaleCard | Flash sale card |
| WishlistButton | Wishlist toggle |
| QuickAddButton | Quick add to cart |
| FilterSheet | Filter bottom sheet |

### 4.9 Course Components (9 files)
| Component | Description |
|-----------|-------------|
| CourseCardVertical | Course card |
| HeroBannerCarousel | Course banner |
| CourseFlashSaleSection | Flash sale courses |
| HighlightedCourseSection | Featured courses |
| CategoryChips | Category filter chips |

### 4.10 Forum Components (25 files)
| Component | Description |
|-----------|-------------|
| PostCard | Forum post card |
| CommentItem | Comment component |
| CommentThread | Threaded comments |
| ReactionButton | Post reactions |
| AdCard | Sponsored post card |
| TrendingBadge | Trending indicator |

---

## 5. CONTEXTS (State Management)

| # | Context | Purpose |
|---|---------|---------|
| 1 | AuthContext | Authentication state, user data, tier info |
| 2 | CartContext | Shopping cart state |
| 3 | CourseContext | Course enrollments, progress |
| 4 | ScannerContext | Scanner settings, patterns |
| 5 | SettingsContext | App settings, preferences |
| 6 | VisionBoardContext | Goals, habits, affirmations |
| 7 | RitualContext | Ritual completions, streaks |
| 8 | DivinationContext | Tarot/I Ching state |
| 9 | GoalContext | Goal tracking |
| 10 | HabitContext | Habit tracking |
| 11 | CalendarContext | Calendar events |
| 12 | CallContext | Call state, WebRTC |
| 13 | LivestreamContext | Livestream state |
| 14 | UpgradeContext | Upgrade flow state |
| 15 | TabBarContext | Tab bar visibility |
| 16 | InAppNotificationContext | In-app notifications |

---

## 6. CUSTOM HOOKS

| # | Hook | Purpose |
|---|------|---------|
| 1 | useAuth | Authentication state |
| 2 | useCache | Data caching |
| 3 | useCall | Voice/video calls |
| 4 | useVideoCall | Video call handling |
| 5 | useIncomingCall | Incoming call detection |
| 6 | useChatTheme | Chat theme customization |
| 7 | useComments | Comment handling |
| 8 | useCourseRealtime | Realtime course updates |
| 9 | useLessonRealtime | Realtime lesson updates |
| 10 | useFeed | Social feed data |
| 11 | useGamification | Gamification state |
| 12 | useLinkPreview | URL preview generation |
| 13 | useMentions | @mentions handling |
| 14 | usePostReactions | Post reactions |
| 15 | useReadReceipts | Message read receipts |
| 16 | useRitualHaptics | Ritual haptic feedback |
| 17 | useRitualVideo | Ritual video playback |
| 18 | useShopProducts | Shop products |
| 19 | useUpgrade | Upgrade flow |
| 20 | useVoiceSpeed | Voice playback speed |
| 21 | useWebSocketChat | WebSocket chat |
| 22 | useOrderLines | Trading order lines |
| 23 | useAITradeAnalysis | AI trade analysis |
| 24 | useDigitalProducts | Digital products |
| 25 | usePictureInPicture | PiP mode |

---

## 7. DATABASE TABLES USED

### User & Auth
- `profiles` - User profiles
- `user_preferences` - User settings
- `user_push_tokens` - Push notification tokens
- `user_access` - Access permissions
- `user_activities` - Activity tracking
- `user_wallets` - Gem wallets
- `user_follows` - Follow relationships
- `user_karma` - Karma points
- `user_unlocked_achievements` - Unlocked achievements

### Forum & Social
- `forum_posts` - Forum posts
- `forum_comments` - Post comments
- `forum_likes` - Post/comment likes
- `forum_notifications` - User notifications
- `hidden_posts` - Hidden posts
- `blocked_users` - Blocked users
- `hashtags` - Hashtag tracking
- `post_boosts` - Boosted posts

### Messaging
- `conversations` - Chat conversations
- `conversation_participants` - Conversation members
- `messages` - Chat messages
- `conversation_settings` - Chat settings
- `message_mentions` - @mentions

### Calls
- `calls` - Call records
- `call_participants` - Call participants
- `call_events` - Call events

### Shop & Orders
- `shopify_orders` - Shopify orders
- `user_cart_sync` - Cart sync
- `gems_transactions` - Gem transactions
- `wallet_transactions` - Wallet transactions
- `gift_catalog` - Gift items
- `gift_transactions` - Gift sends

### Courses
- `courses` - Courses
- `course_modules` - Course modules
- `course_lessons` - Lessons
- `course_enrollments` - Enrollments
- `lesson_progress` - Lesson progress
- `course_highlights` - Featured courses
- `lesson_attachments` - Lesson files

### Vision Board
- `vision_goals` - Goals
- `vision_habits` - Habits
- `vision_actions` - Goal actions
- `vision_action_logs` - Action logs
- `vision_affirmations` - Affirmations
- `vision_affirmation_logs` - Affirmation logs
- `vision_board_widgets` - Dashboard widgets
- `vision_ritual_completions` - Ritual completions

### Calendar
- `calendar_events` - Calendar events
- `calendar_journal_entries` - Journal entries
- `calendar_divination_logs` - Divination logs
- `calendar_goal_progress_logs` - Goal progress

### Divination
- `reading_history` - Reading history
- `tarot_readings` - Tarot readings
- `tarot_cards` - Tarot card data
- `iching_hexagrams` - I Ching hexagrams

### Affiliate
- `affiliate_profiles` - Affiliate profiles
- `affiliate_codes` - Affiliate codes
- `affiliate_referrals` - Referrals
- `affiliate_sales` - Sales tracking
- `affiliate_commissions` - Commissions
- `affiliate_withdrawals` - Withdrawals
- `affiliate_bonus_kpi` - Bonus KPIs

### Partnership
- `partnership_applications` - Applications
- `partnership_resources` - Partner resources
- `withdrawal_requests` - Withdrawal requests

### Trading
- `paper_trades` - Paper trades
- `real_trades` - Real trades (with API)
- `trading_journal_entries` - Trading journal
- `user_exchange_connections` - Exchange API connections
- `zone_visualization_preferences` - Zone display settings

### Livestream
- `livestream_sessions` - Livestream sessions
- `livestream_comments` - Stream comments
- `livestream_gifts` - Stream gifts

### Admin
- `instructor_applications` - Instructor apps
- `system_notifications` - System notifications
- `chatbot_quota` - AI quota usage
- `chatbot_analytics` - AI analytics

### Experiments
- `experiment_assignments` - A/B test assignments
- `experiment_conversions` - Conversion tracking

### Support
- `support_tickets` - Support tickets
- `beta_feedback` - Beta feedback

### Content
- `content_calendar` - Auto-post calendar
- `comment_reports` - Comment reports

---

## 8. FEATURES CHECKLIST

| Feature | Status | Screens | Services |
|---------|--------|---------|----------|
| Authentication | ✅ | Login, Signup, Welcome | authService |
| Forum/Social Feed | ✅ | 12 screens | forumService, commentService |
| Direct Messages | ✅ | 18 screens | messagingService |
| Voice/Video Calls | ✅ | 6 screens | callService, webrtcService |
| E-commerce (Shopify) | ✅ | 18 screens | shopifyService |
| Courses (LMS) | ✅ | 10 screens | courseService |
| Trading Scanner | ✅ | 6 screens | scannerService, binanceApiService |
| Paper Trading | ✅ | 2 screens | paperTradeService |
| AI Chatbot (Gemini) | ✅ | 4 screens | geminiService, gemMasterService |
| Tarot Reading | ✅ | 5 screens | tarotService, divinationService |
| I Ching Divination | ✅ | 2 screens | ichingService |
| Vision Board | ✅ | 12 screens | goalService, habitService |
| Ritual System | ✅ | 10 screens | ritualService |
| Calendar/Journal | ✅ | 4 screens | calendarService, calendarJournalService |
| Trading Journal | ✅ | 1 screen | tradingJournalService |
| Karma System | ✅ | 1 screen | karmaService |
| Gamification | ✅ | 3 screens | gamificationService |
| Achievements | ✅ | 1 screen | achievementService |
| Gem Economy | ✅ | 6 screens | walletService, giftService |
| Affiliate System | ✅ | 5 screens | affiliateService |
| Partnership | ✅ | 3 screens | partnershipService |
| Livestream | ✅ | 2 screens | livestreamService |
| Admin Dashboard | ✅ | 50+ screens | Various admin services |
| Push Notifications | ✅ | 1 screen | notificationService |
| User Profiles | ✅ | 3 screens | followService |
| Privacy Settings | ✅ | 3 screens | privacyService |
| Sound Library | ✅ | 3 screens | soundService |
| Post Boosting | ✅ | 3 screens | boostService |
| Shadow Trading | ✅ | 3 screens | shadowModeService |
| Exchange Affiliate | ✅ | 4 screens | exchangeAffiliateService |
| Help Center | ✅ | 4 screens | helpService |
| Support Tickets | ✅ | 2 screens | supportTicketService |

---

## 9. THIRD-PARTY INTEGRATIONS

| Integration | Purpose | Package/API |
|-------------|---------|-------------|
| Supabase | Auth, Database, Realtime | @supabase/supabase-js |
| Shopify | E-commerce, Checkout | Shopify Storefront API |
| Binance | Market Data, Trading | Binance API |
| Google Gemini | AI Chatbot | Google AI SDK |
| WebRTC | Voice/Video Calls | react-native-webrtc |
| Expo Notifications | Push Notifications | expo-notifications |
| Expo AV | Audio/Video Playback | expo-av |
| Expo Image Picker | Image Selection | expo-image-picker |
| Expo Local Auth | Biometric Auth | expo-local-authentication |
| Expo Haptics | Haptic Feedback | expo-haptics |
| Expo Speech | Text-to-Speech | expo-speech |
| Lottie | Animations | lottie-react-native |
| Lightweight Charts | Trading Charts | lightweight-charts |
| i18next | Internationalization | react-i18next |
| GIPHY | GIF Search | GIPHY API |
| Date-fns | Date Handling | date-fns |

---

## 10. UNIQUE MOBILE FEATURES

| Feature | Description | Implementation |
|---------|-------------|----------------|
| Push Notifications | Real-time alerts | expo-notifications |
| Biometric Auth | Face ID / Touch ID | expo-local-authentication |
| Offline Mode | Data caching | AsyncStorage, cacheService |
| Haptic Feedback | Ritual feedback | expo-haptics |
| Voice Input | Voice messages | @react-native-voice/voice |
| Picture-in-Picture | Minimized calls | Custom implementation |
| Deep Linking | URL handling | expo-linking |
| Image Capture | Camera access | expo-image-picker |
| Local Storage | Secure storage | expo-secure-store |
| Background Audio | Music playback | expo-av |
| Pull to Refresh | Feed refresh | FlatList |
| Swipe Gestures | Navigation | react-native-gesture-handler |
| Reanimated | Smooth animations | react-native-reanimated |
| Native Shadows | iOS/Android shadows | react-native-shadow-2 |
| Glass Effects | Blur effects | expo-blur |

---

## 11. STATISTICS SUMMARY

| Category | Count |
|----------|-------|
| Total Screens | 338 |
| Total Components | 456 |
| Total Services | 288 |
| Total Contexts | 16 |
| Total Hooks | 46 |
| Total Navigation Files | 12 |
| Total Config Files | 9 |
| **Total Source Files** | **1,165+** |
| Database Tables | 80+ |
| NPM Dependencies | 45+ |

---

## 12. KEY DEPENDENCIES

```json
{
  "expo": "~54.0.25",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "@supabase/supabase-js": "^2.84.0",
  "@react-navigation/native": "^7.1.21",
  "@react-navigation/native-stack": "^7.7.0",
  "@react-navigation/bottom-tabs": "^7.8.6",
  "react-native-webrtc": "^124.0.7",
  "react-native-reanimated": "~4.1.1",
  "react-native-gesture-handler": "~2.28.0",
  "lottie-react-native": "^7.3.5",
  "lightweight-charts": "^5.0.9",
  "expo-notifications": "^0.32.13",
  "expo-av": "~16.0.7",
  "expo-image": "^3.0.11",
  "i18next": "^25.7.3"
}
```

---

*This document provides a comprehensive overview of the GEM Mobile codebase structure, navigation, services, components, and features.*
