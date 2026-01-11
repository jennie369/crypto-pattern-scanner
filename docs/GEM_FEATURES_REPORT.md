# BÁO CÁO TÍNH NĂNG APP GEM MOBILE

**Ngày:** 2025-12-23
**Platform:** React Native (Expo)
**Codebase:** gem-mobile/src/

---

## TỔNG QUAN

| # | Tính năng | Trạng thái | Files chính |
|---|-----------|------------|-------------|
| 1 | Scanner & Pattern Detection | ✅ Hoạt động | patternDetection.js (2,202 lines) |
| 2 | Paper Trade | ✅ Hoạt động | paperTradeService.js |
| 3 | GEM Master (AI Chatbot) | ✅ Hoạt động | gemMasterAIService.js |
| 4 | Vision Board | ✅ Hoạt động | visionBoardService.js |
| 5 | Trader Ritual | ✅ Hoạt động | RitualPlaygroundScreen.js |
| 6 | Partnership/Affiliate | ✅ Hoạt động | affiliateService.js |
| 7 | Tier System | ✅ Hoạt động | tierAccess.js (278 lines) |
| 8 | Shop (Crystal Shop) | ✅ Hoạt động | shopifyService.js (677 lines) |
| 9 | Tarot | ✅ Hoạt động | TarotScreen.js |
| 10 | I Ching | ✅ Hoạt động | IChingScreen.js |
| 11 | Community/Forum | ✅ Hoạt động | ForumScreen.js |
| 12 | Courses | ✅ Hoạt động | CoursesScreen.js |
| 13 | Alerts/Notifications | ✅ Hoạt động | alertManager.js (574 lines) |
| 14 | Market Data | ✅ Hoạt động | binanceService.js |

**Tổng cộng: 14/14 tính năng đã implement đầy đủ**

---

## 1. SCANNER & PATTERN DETECTION

### Trạng thái: ✅ Hoạt động (Production Ready)

### Files liên quan:
- `gem-mobile/src/services/patternDetection.js` (2,202 lines) - Engine phát hiện pattern
- `gem-mobile/src/services/multiTimeframeScanner.js` (364 lines) - Multi-TF scanning
- `gem-mobile/src/services/confirmationPatterns.js` (432 lines) - Zone confirmation
- `gem-mobile/src/screens/Scanner/ScannerScreen.js` (1,259 lines) - Main UI
- `gem-mobile/src/screens/Scanner/PatternDetailScreen.js` - Chi tiết pattern
- `gem-mobile/src/screens/Scanner/components/CoinSelector.js` - Chọn coin
- `gem-mobile/src/screens/Scanner/components/TradingChart.js` - Chart
- `gem-mobile/src/screens/Scanner/components/ScanResultsSection.js` - Kết quả scan
- `gem-mobile/src/screens/Scanner/components/PatternCard.js` - Card pattern

### 24 Patterns đã implement:

| Tier | Pattern | Win Rate | Mô tả |
|------|---------|----------|-------|
| **FREE** | DPD | 65% | Down-Peak-Down - Tiếp diễn giảm |
| **FREE** | UPU | 68% | Up-Peak-Up - Tiếp diễn tăng |
| **FREE** | Head & Shoulders | 72% | Đảo chiều giảm |
| **TIER1** | DPU | 62% | Down-Peak-Up - Đảo chiều tăng |
| **TIER1** | UPD | 60% | Up-Peak-Down - Đảo chiều giảm |
| **TIER1** | Double Top | 67% | Hai đỉnh - Đảo chiều giảm |
| **TIER1** | Double Bottom | 68% | Hai đáy - Đảo chiều tăng |
| **TIER2** | Inverse H&S | 70% | Vai đầu vai ngược - Đảo chiều tăng |
| **TIER2** | Ascending Triangle | 70% | Tam giác tăng |
| **TIER2** | Descending Triangle | 68% | Tam giác giảm |
| **TIER2** | Symmetrical Triangle | 65% | Tam giác cân |
| **TIER2** | HFZ | 72% | High Frequency Zone - Vùng kháng cự |
| **TIER2** | LFZ | 72% | Low Frequency Zone - Vùng hỗ trợ |
| **TIER2** | Rounding Bottom | 68% | Đáy tròn |
| **TIER2** | Rounding Top | 66% | Đỉnh tròn |
| **TIER3** | Bull Flag | 72% | Cờ tăng |
| **TIER3** | Bear Flag | 71% | Cờ giảm |
| **TIER3** | Wedge | 68% | Nêm |
| **TIER3** | Engulfing | 75% | Nhấn chìm |
| **TIER3** | Morning Star | 73% | Sao mai |
| **TIER3** | Evening Star | 72% | Sao hôm |
| **TIER3** | Cup & Handle | 70% | Tách và tay cầm |
| **TIER3** | Three Methods | 68% | Ba phương pháp |
| **TIER3** | Hammer | 70% | Búa |

### Timeframes hỗ trợ:
`1m` `3m` `5m` `15m` `30m` `1h` `2h` `4h` `8h` `1d` `1w` `1M`

### Coins hỗ trợ:
- **437+ cặp** Binance USDT Perpetual Futures
- Giới hạn theo tier: FREE=20, TIER1=50, TIER2=200, TIER3=unlimited

### Cách sử dụng:
1. User mở Scanner tab
2. Chọn coins từ CoinSelector (có search, favorites)
3. Chọn timeframe
4. Bấm "Quét" để scan
5. Kết quả hiển thị theo coin với pattern cards
6. Tap pattern để xem chi tiết hoặc Paper Trade

---

## 2. PAPER TRADE (GIAO DỊCH MÔ PHỎNG)

### Trạng thái: ✅ Hoạt động

### Files liên quan:
- `gem-mobile/src/services/paperTradeService.js` - Logic giao dịch
- `gem-mobile/src/services/pendingOrderService.js` - Lệnh chờ
- `gem-mobile/src/screens/Scanner/OpenPositionsScreen.js` - Quản lý lệnh
- `gem-mobile/src/screens/Account/PaperTradeHistoryScreen.js` - Lịch sử
- `gem-mobile/src/components/Trading/PaperTradeModalV2.js` - Modal đặt lệnh
- `gem-mobile/src/screens/Scanner/components/PaperTradeModal.js` - Modal từ scanner

### Chi tiết tính năng:

| Tính năng | Mô tả |
|-----------|-------|
| **Số dư khởi điểm** | $10,000 (có thể tùy chỉnh $100 - $10,000,000) |
| **Loại lệnh** | MARKET (khớp ngay), LIMIT (lệnh chờ) |
| **Mode giao dịch** | Pattern Mode (từ scanner), Custom Mode (tự nhập) |
| **Đòn bẩy** | 1x đến 125x (Binance Futures style) |
| **Stop Loss** | Có, tự động đóng khi chạm |
| **Take Profit** | Có, hỗ trợ TP1, TP2 |
| **P&L realtime** | Tính toán theo giá thực tế từ Binance |
| **Lịch sử** | Lưu 100 giao dịch gần nhất |
| **Thống kê** | Win rate, Best/Worst trade, Profit factor, ROE |

### Dual Mode:
- **Pattern Mode**: Tự động từ kết quả scan, không chỉnh sửa TP/SL
- **Custom Mode**: User tự nhập, có thể chỉnh TP/SL sau khi mở lệnh

---

## 3. GEM MASTER (AI CHATBOT)

### Trạng thái: ✅ Hoạt động

### Files liên quan:
- `gem-mobile/src/screens/GemMaster/GemMasterScreen.js` - Chat UI
- `gem-mobile/src/services/gemMasterAIService.js` - AI logic
- `gem-mobile/src/services/gemMasterService.js` - Response generation
- `gem-mobile/src/services/geminiService.js` - Gemini API integration
- `gem-mobile/src/components/GemMaster/QuickActionBar.js` - Quick actions
- `gem-mobile/src/components/GemMaster/FAQPanel.js` - FAQ panel

### Chi tiết tính năng:

| Tính năng | Mô tả |
|-----------|-------|
| **AI Engine** | Google Gemini API |
| **Mood System** | Calm, Warning, Angry, Proud, Silent |
| **Karma System** | Điểm karma, block/unlock trading |
| **Voice Input** | Nhập giọng nói (quota theo tier) |
| **Widget Suggestions** | Tạo widget từ AI response |
| **Product Recommendations** | Gợi ý Crystal/Course |
| **FAQ Panel** | Binance-style FAQ topics |

### 14 Trading Scenarios:
1. FOMO_BUY - RSI overbought hoặc pump lớn
2. FOMO_RETRY - Retry sau FOMO loss
3. REVENGE_TRADE - 3+ consecutive losses
4. NO_STOPLOSS - Không có SL (CRITICAL - luôn block)
5. SL_MOVED_WIDER - Dời SL xa hơn
6. BIG_WIN - Win >20% P&L
7. DISCIPLINE_WIN - Win với SL đúng
8. DISCIPLINE_LOSS - Loss với SL đúng
9. ACCOUNT_FROZEN - Karma = 0
10. OVERTRADE - 10+ trades/ngày
11. STREAK_BROKEN - Mất win streak
12. DAILY_LIMIT - Vượt daily limit
13. BLOCKED - User bị block
14. ACCOUNT_FROZEN - Cần recovery quest

### Unlock Options:
- **Meditation** (5 min) - Karma +5
- **Journal** (10 min) - Karma +10
- **Rest** (15 min) - Karma +0
- **Wait** (time-based) - Karma +0

---

## 4. VISION BOARD

### Trạng thái: ✅ Hoạt động

### Files liên quan:
- `gem-mobile/src/services/visionBoardService.js` - Core service
- `gem-mobile/src/screens/VisionBoard/VisionBoardScreen.js` - Dashboard
- `gem-mobile/src/screens/VisionBoard/GoalDetailScreen.js` - Chi tiết goal
- `gem-mobile/src/screens/VisionBoard/DailyRecapScreen.js` - Daily summary
- `gem-mobile/src/screens/VisionBoard/CalendarScreen.js` - Calendar view
- `gem-mobile/src/screens/VisionBoard/AchievementsScreen.js` - Achievements
- `gem-mobile/src/contexts/VisionBoardContext.js` - State management

### Widget Types:
| Type | Icon | Mô tả |
|------|------|-------|
| GOAL | Target | Mục tiêu dài hạn với milestones |
| ACTION | CheckSquare | Tasks/to-dos với due date |
| AFFIRMATION | Heart | Affirmations hàng ngày |
| HABIT | Repeat | Thói quen định kỳ |

### Life Areas (6):
| Area | Color | Icon |
|------|-------|------|
| Finance | Gold | Wallet |
| Career | Purple | Briefcase |
| Health | Green | Heart |
| Relationships | Pink | Users |
| Personal | Cyan | User |
| Spiritual | Red | Sparkles |

### Gamification:
- **XP System**: Earn XP khi complete tasks
- **Level System**: Level up based on XP
- **Streaks**: Daily completion streaks
- **Achievements**: Badges unlock

---

## 5. TRADER RITUAL

### Trạng thái: ✅ Hoạt động

### Files liên quan:
- `gem-mobile/src/screens/VisionBoard/RitualPlaygroundScreen.js` - Interactive rituals
- `gem-mobile/src/screens/VisionBoard/RitualHistoryScreen.js` - Lịch sử ritual

### Chi tiết tính năng:
| Ritual | Mô tả |
|--------|-------|
| Letter to Universe | Viết thư gửi vũ trụ |
| Meditation | Guided meditation sessions |
| Gratitude Log | Ghi nhật ký biết ơn |
| Ritual Calendar | Lịch ritual đã hoàn thành |

---

## 6. PARTNERSHIP/AFFILIATE

### Trạng thái: ✅ Hoạt động

### Files liên quan:
- `gem-mobile/src/services/affiliateService.js` - Affiliate logic
- `supabase/migrations/20251214_affiliate_system_complete.sql` - Database schema

### Chi tiết tính năng:
| Tính năng | Mô tả |
|-----------|-------|
| Referral Links | Tạo link giới thiệu unique |
| Commission Tracking | Theo dõi hoa hồng |
| Partner Dashboard | Dashboard cho partner |
| Withdrawal | Rút tiền hoa hồng |

---

## 7. TIER SYSTEM

### Trạng thái: ✅ Hoạt động

### Files liên quan:
- `gem-mobile/src/config/tierAccess.js` (278 lines) - Tier definitions
- `gem-mobile/src/constants/tierFeatures.js` (421 lines) - Feature matrix
- `gem-mobile/src/services/tierService.js` (798 lines) - Tier logic
- `gem-mobile/src/services/tierAccessService.js` - Access control
- `gem-mobile/src/services/subscriptionExpirationService.js` - Expiration

### Bảng so sánh Tier:

| Tính năng | FREE | TIER1 | TIER2 | TIER3 |
|-----------|------|-------|-------|-------|
| **Giá** | Miễn phí | 11M VND | 21M VND | 68M VND |
| **Số coin** | 20 | 50 | 200 | 437+ |
| **Số pattern** | 3 | 7 | 15 | 24 |
| **Scans/ngày** | 10 | 50 | Unlimited | Unlimited |
| **Multi-TF Scan** | ❌ | ❌ | 3 TF | 5 TF |
| **Alerts** | ❌ | 3/coin | 10/coin | Unlimited |
| **Paper Trade** | ❌ | ✅ | ✅ | ✅ |
| **Advanced Stats** | ❌ | ❌ | ✅ | ✅ |
| **AI Signals** | ❌ | ❌ | ❌ | ✅ |
| **Whale Tracking** | ❌ | ❌ | ❌ | ✅ |

### TIER2+ Enhancements:
- Volume Confirmation (+8-10% win rate)
- Trend Analysis (+5-7% win rate)
- Retest Validation (+8-12% win rate)
- Quality Filtering (+5-8% win rate)
- Support/Resistance Confluence (+4-6%)
- RSI Divergence Detection (+5-8%)
- Dynamic R:R Optimization (+2-4%)

---

## 8. SHOP (CRYSTAL SHOP)

### Trạng thái: ✅ Hoạt động

### Files liên quan:
- `gem-mobile/src/services/shopifyService.js` (677 lines) - Shopify integration
- `gem-mobile/src/config/shopConfig.js` (427 lines) - Shop config
- `gem-mobile/src/screens/Shop/ShopScreen.js` - Main shop
- `gem-mobile/src/screens/Shop/ProductDetailScreen.js` - Chi tiết sản phẩm
- `gem-mobile/src/screens/Shop/ProductListScreen.js` - Danh sách
- `gem-mobile/src/contexts/CartContext.js` - Cart state

### Categories:
| Category | Mô tả |
|----------|-------|
| Crystals & Spiritual | Thạch anh, đá năng lượng |
| Khóa học | Trading courses, Ebooks |
| GemMaster | Chatbot subscriptions |
| Scanner | Pattern scanner tiers |
| Gem Pack | Virtual gems |

### Shopify Integration:
- GraphQL API via Supabase Edge Functions
- Cart system (add, update, remove)
- Checkout URLs
- Product filtering by tags
- Recommendations

---

## 9. TAROT

### Trạng thái: ✅ Hoạt động

### Files liên quan:
- `gem-mobile/src/screens/GemMaster/TarotScreen.js` - Main screen
- `gem-mobile/src/services/tarotInterpretationService.js` - AI interpretation
- `gem-mobile/src/services/readingHistoryService.js` - History
- `gem-mobile/src/data/tarot/` - Card data

### Chi tiết tính năng:
| Tính năng | Mô tả |
|-----------|-------|
| Deck | 78 cards (Major + Minor Arcana) |
| Spread | 3-card spread (Past, Present, Future) |
| Shuffle | Fisher-Yates algorithm |
| Interpretation | AI-powered |
| Reversed Cards | Có hỗ trợ |
| Crystal Link | Gợi ý crystal phù hợp |
| History | Lưu lại readings |

---

## 10. I CHING

### Trạng thái: ✅ Hoạt động

### Files liên quan:
- `gem-mobile/src/screens/GemMaster/IChingScreen.js` - Main screen
- `gem-mobile/src/components/GemMaster/CoinCastAnimation.js` - Coin animation
- `gem-mobile/src/components/GemMaster/HexagramBuilder.js` - Build hexagram
- `gem-mobile/src/data/iching/hexagrams.js` - 64 hexagrams data

### Chi tiết tính năng:
| Tính năng | Mô tả |
|-----------|-------|
| Quick Mode | Hexagram ngẫu nhiên ngay lập tức |
| Traditional Mode | Tung 6 đồng xu tạo 6 hào |
| Hexagrams | 64 quẻ Kinh Dịch |
| Line Interpretation | Giải thích từng hào |
| Crystal Link | Gợi ý crystal phù hợp |

---

## 11. COMMUNITY/FORUM

### Trạng thái: ✅ Hoạt động

### Files liên quan:
- `gem-mobile/src/screens/Forum/ForumScreen.js` - Main feed
- `gem-mobile/src/services/forumService.js` - Forum logic
- `gem-mobile/src/services/repostService.js` - Repost logic
- `gem-mobile/src/components/RepostSheet.js` - Repost UI

### Chi tiết tính năng:
| Tính năng | Mô tả |
|-----------|-------|
| Posting | Đăng bài với text, images |
| Comments | Bình luận, reply |
| Likes | Like bài viết |
| Reposts | Share bài người khác |
| Feeds | Explore, Following, News, Popular |
| Categories | Trading, Spiritual, Balance, Market, News |

---

## 12. COURSES

### Trạng thái: ✅ Hoạt động

### Files liên quan:
- `gem-mobile/src/screens/Courses/CoursesScreen.js` - Course catalog
- `gem-mobile/src/screens/Courses/CourseDetailScreen.js` - Chi tiết khóa học
- `gem-mobile/src/screens/Courses/CertificateScreen.js` - Chứng chỉ
- `gem-mobile/src/services/courseService.js` - Course logic
- `gem-mobile/src/contexts/CourseContext.js` - State management
- `gem-mobile/src/screens/Admin/Courses/` - Admin screens

### Chi tiết tính năng:
| Tính năng | Mô tả |
|-----------|-------|
| Catalog | Danh sách khóa học với filter |
| Modules | Cấu trúc module/lesson |
| Video Lessons | YouTube embeds |
| Quiz System | Câu hỏi sau bài học |
| Certificates | Chứng chỉ hoàn thành |
| Progress | Theo dõi tiến độ |

### Filter Tabs:
- Tất cả (All)
- Đang học (In Progress)
- Hoàn thành (Completed)

---

## 13. ALERTS/NOTIFICATIONS

### Trạng thái: ✅ Hoạt động

### Files liên quan:
- `gem-mobile/src/services/alertService.js` (86 lines) - Alert provider
- `gem-mobile/src/services/alertManager.js` (574 lines) - Alert orchestration
- `gem-mobile/src/services/alertConditions.js` - Trigger logic
- `gem-mobile/src/services/notificationService.js` - Notifications
- `gem-mobile/src/constants/alertConfig.js` - Alert types
- `gem-mobile/src/components/Scanner/AlertCard.js` - Alert UI
- `gem-mobile/src/components/Scanner/PriceAlertModal.js` - Price alert modal

### Alert Types:
| Type | Mô tả |
|------|-------|
| price_alert | Giá chạm mức đặt |
| pattern_detected | Scan phát hiện pattern |
| breakout | Phá vỡ hỗ trợ/kháng cự |
| stop_loss | Chạm stop loss |
| take_profit | Chạm take profit |
| limit_order_filled | Lệnh limit khớp |
| position_opened | Mở lệnh market |

### Tier Limits:
| Tier | Alerts/Coin |
|------|-------------|
| FREE | 0 (disabled) |
| TIER1 | 3 |
| TIER2 | 10 |
| TIER3 | Unlimited |

### Notification Categories:
- **TRADING**: pattern_detected, price_alert, trade_executed
- **SOCIAL**: forum_like, comment, follow, mention
- **SYSTEM**: order, promotion, reminder

---

## 14. MARKET DATA

### Trạng thái: ✅ Hoạt động

### Files liên quan:
- `gem-mobile/src/services/binanceService.js` - Main service
- `gem-mobile/src/services/binanceApiService.js` - API wrapper

### Chi tiết tính năng:
| Tính năng | Mô tả |
|-----------|-------|
| REST API | Binance Spot + Futures |
| WebSocket | Real-time price streaming |
| Candle Data | OHLCV all timeframes |
| Coins | 437+ USDT Perpetual pairs |
| Caching | 5-minute cache |
| Volume | Total + USDT volume |

### API Endpoints:
- `https://api.binance.com/api/v3` - Spot
- `https://fapi.binance.com/fapi/v1` - Futures

---

## TỔNG HỢP THEO TIER

### FREE TIER (Miễn phí)
| Tính năng | Giới hạn |
|-----------|----------|
| Scanner | 10 scans/ngày, 20 coins, 3 patterns |
| GEM Master | Quota limited |
| Vision Board | Basic features |
| Forum | Read only |
| Tarot/I Ching | Limited readings |

### TIER 1 (11M VND)
| Tính năng | Giới hạn |
|-----------|----------|
| Scanner | 50 scans/ngày, 50 coins, 7 patterns |
| Paper Trade | Full access |
| Alerts | 3 alerts/coin |
| GEM Master | Extended quota |

### TIER 2 (21M VND)
| Tính năng | Giới hạn |
|-----------|----------|
| Scanner | Unlimited, 200 coins, 15 patterns, 3 TF |
| Advanced Stats | Volume, Trend, RSI analysis |
| Alerts | 10 alerts/coin |
| Quality Grades | A+, A, B+, B, C, D |

### TIER 3 (68M VND)
| Tính năng | Giới hạn |
|-----------|----------|
| Scanner | Unlimited, 437+ coins, 24 patterns, 5 TF |
| AI Signals | Real-time AI signals |
| Whale Tracking | Large order detection |
| Alerts | Unlimited |
| Priority Support | Personal mentoring |

---

## GỢI Ý NỘI DUNG KHÓA HỌC

### Tier 1 - Cơ Bản (11M VND)
1. **Giới thiệu App GEM**
   - Cài đặt và setup
   - Tour các tính năng chính
   - Cách đọc giao diện Scanner

2. **3 Pattern Cơ Bản**
   - DPD (Down-Peak-Down) - Khi nào bán
   - UPU (Up-Peak-Up) - Khi nào mua
   - Head & Shoulders - Đảo chiều

3. **Paper Trade Cơ Bản**
   - Cách đặt lệnh từ pattern
   - Hiểu Stop Loss và Take Profit
   - Đọc P&L và thống kê

4. **Quản Lý Rủi Ro**
   - Tính toán position size
   - Risk/Reward ratio
   - Không trade khi FOMO

5. **GEM Master AI**
   - Cách hỏi AI về trading
   - Karma system
   - Trading psychology

### Tier 2 - Nâng Cao (21M VND)
1. **Master 15 Patterns**
   - Triangles (Ascending, Descending, Symmetrical)
   - HFZ/LFZ - Frequency Zones
   - Double Top/Bottom
   - Inverse Head & Shoulders

2. **Multi-Timeframe Analysis**
   - Scan 3 timeframe cùng lúc
   - Confluence detection
   - Higher timeframe confirmation

3. **Advanced Enhancements**
   - Volume confirmation
   - Trend context analysis
   - RSI divergence

4. **Quality Grading System**
   - A+ trades vs D trades
   - Chọn lọc pattern chất lượng
   - Backtest results

5. **Vision Board Integration**
   - Đặt mục tiêu trading
   - Tracking progress
   - Trading journal

### Tier 3 - Chuyên Gia (68M VND)
1. **All 24 Patterns Mastery**
   - Candlestick patterns (Engulfing, Stars, Hammer)
   - Continuation patterns (Flags, Wedge)
   - Advanced reversal patterns

2. **AI Signals & Whale Tracking**
   - Real-time AI signals
   - Large order detection
   - Market manipulation awareness

3. **Advanced Risk Management**
   - Portfolio management
   - Correlation analysis
   - Drawdown control

4. **Trading Psychology Deep Dive**
   - Karma system mastery
   - Emotional control
   - Meditation & rituals

5. **Personal Mentoring**
   - 1-on-1 coaching
   - Trade review sessions
   - Custom strategy development

---

## LƯU Ý

- Tất cả 14 tính năng đã được implement đầy đủ trong codebase
- Báo cáo dựa trên code thực tế, không bịa thêm
- Database sử dụng Supabase với 161+ migrations
- Real-time data từ Binance WebSocket
- AI chatbot sử dụng Google Gemini API
- Shop tích hợp Shopify GraphQL API
