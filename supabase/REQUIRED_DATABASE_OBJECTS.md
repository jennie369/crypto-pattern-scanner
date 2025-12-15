# GEM Mobile App - Required Database Objects

Generated: December 11, 2025

This document lists all tables and RPC functions that the GEM Mobile app actually uses.
Use this as a reference when running migrations to ensure nothing is missing.

---

## TABLES (80+ tables used by app)

### Core User Tables
| Table | Usage Count | Status |
|-------|-------------|--------|
| profiles | 78 | CRITICAL |
| user_follows | 34 | HIGH |
| blocked_users | 10 | MEDIUM |
| close_friends | 8 | LOW |

### Forum/Social Tables
| Table | Usage Count | Status |
|-------|-------------|--------|
| forum_posts | 70 | CRITICAL |
| forum_comments | 19 | HIGH |
| forum_likes | 15 | HIGH |
| forum_saved | 6 | MEDIUM |
| forum_notifications | 10 | MEDIUM |
| post_interactions | 10 | MEDIUM |
| post_boosts | 8 | MEDIUM |
| post_views | 4 | LOW |
| post_reports | 6 | MEDIUM |
| post_edit_history | 4 | LOW |
| reposts | 8 | MEDIUM |
| pinned_posts | 8 | MEDIUM |
| photo_tags | 8 | LOW |
| shopping_tags | 7 | LOW |
| stories | 5 | LOW |
| live_streams | 5 | LOW |
| scheduled_posts | 9 | MEDIUM |

### Seed Content (Fake Users/Posts)
| Table | Usage Count | Status |
|-------|-------------|--------|
| seed_posts | 21 | HIGH |
| seed_users | 14 | HIGH |
| seed_impressions | 7 | MEDIUM |
| bot_activity_log | 5 | LOW |

### Vision Board / Goals
| Table | Usage Count | Status |
|-------|-------------|--------|
| vision_board_widgets | 49 | CRITICAL |
| user_widgets | 14 | HIGH |
| vision_actions | 19 | HIGH |
| vision_goals | 9 | MEDIUM |
| vision_habits | 12 | HIGH |
| vision_habit_logs | 11 | MEDIUM |
| vision_affirmations | 9 | MEDIUM |
| vision_affirmation_logs | 6 | LOW |
| vision_rituals | 4 | LOW |
| vision_ritual_completions | 10 | MEDIUM |
| vision_ritual_streaks | 5 | LOW |
| vision_milestones | 6 | LOW |
| vision_daily_summary | 7 | MEDIUM |
| vision_user_stats | 9 | MEDIUM |
| calendar_events | 5 | MEDIUM |

### Courses / Learning
| Table | Usage Count | Status |
|-------|-------------|--------|
| courses | 18 | HIGH |
| course_modules | 21 | HIGH |
| course_lessons | 26 | HIGH |
| course_enrollments | 12 | HIGH |
| lesson_progress | 17 | HIGH |
| lesson_attachments | 7 | MEDIUM |
| quizzes | 6 | MEDIUM |
| quiz_questions | 4 | LOW |
| quiz_attempts | 7 | MEDIUM |

### Divination / Readings
| Table | Usage Count | Status |
|-------|-------------|--------|
| divination_readings | 24 | HIGH |

### Wallet / Payments
| Table | Usage Count | Status |
|-------|-------------|--------|
| user_wallets | 14 | HIGH |
| wallet_transactions | 7 | MEDIUM |
| sent_gifts | 6 | LOW |

### Affiliate / Partnership
| Table | Usage Count | Status |
|-------|-------------|--------|
| affiliate_profiles | 10 | MEDIUM |
| affiliate_codes | 10 | MEDIUM |
| affiliate_sales | 9 | MEDIUM |
| partnership_applications | 7 | MEDIUM |
| withdrawal_requests | 14 | HIGH |
| creator_earnings | 6 | MEDIUM |

### Shopify / E-commerce
| Table | Usage Count | Status |
|-------|-------------|--------|
| shopify_orders | 8 | MEDIUM |

### Feed System
| Table | Usage Count | Status |
|-------|-------------|--------|
| user_feed_preferences | 12 | HIGH |
| feed_impressions | 9 | MEDIUM |
| custom_feeds | 6 | LOW |

### Notifications
| Table | Usage Count | Status |
|-------|-------------|--------|
| notifications | 8 | MEDIUM |
| notification_settings | 4 | LOW |
| notification_preferences | 4 | LOW |
| system_notifications | 4 | LOW |
| user_push_tokens | 4 | LOW |

### Messaging
| Table | Usage Count | Status |
|-------|-------------|--------|
| messages | 5 | MEDIUM |
| conversations | 5 | MEDIUM |

### Sounds / Media
| Table | Usage Count | Status |
|-------|-------------|--------|
| sound_library | 8 | MEDIUM |
| sounds | 4 | LOW |
| saved_sounds | 5 | LOW |

### Sponsor / Ads
| Table | Usage Count | Status |
|-------|-------------|--------|
| sponsor_banners | 11 | HIGH |

### Other
| Table | Usage Count | Status |
|-------|-------------|--------|
| chatbot_quota | 6 | MEDIUM |
| voice_usage | 4 | LOW |
| portfolio_items | 4 | LOW |

---

## RPC FUNCTIONS (64 functions used by app)

### Partnership / Withdrawal Functions
```sql
admin_approve_withdrawal
admin_complete_withdrawal
admin_reject_withdrawal
approve_partnership_application
reject_partnership_application
submit_partnership_application
request_withdrawal
process_withdrawal
get_partnership_status
check_ctv_eligibility
get_user_courses
```

### Gamification / Vision Board Functions
```sql
track_daily_completion
get_daily_completion_status
get_habit_grid_data
get_user_streak
award_achievement
complete_widget_with_xp
complete_action_with_xp
uncomplete_action
get_action_stats
get_goal_actions_grouped
reset_user_actions
update_affirmation_streak
get_goals_with_progress
get_life_area_scores
get_weekly_progress
get_vision_today_overview
get_stats_overview
```

### Calendar Functions
```sql
get_calendar_events
complete_calendar_event
sync_calendar_event
delete_calendar_events_by_source
```

### GEM Economy Functions
```sql
get_gem_balance
get_checkin_status
perform_daily_checkin
claim_pending_gem_credits
claim_welcome_bonus
```

### Course Functions
```sql
check_course_access
grant_course_access
calculate_course_progress
increment_review_helpful
```

### Forum / Social Functions
```sql
increment_post_count
increment_comment_count
decrement_comment_count
increment_share_count
increment_repost_count
decrement_repost_count
get_trending_hashtags
```

### Boost Functions
```sql
increment_boost_impressions
increment_boost_clicks
```

### Affiliate Functions
```sql
increment_affiliate_clicks
```

### Notification Functions
```sql
send_broadcast_notification
send_notification_to_users
mark_messages_as_read
```

### Live Stream Functions
```sql
increment_stream_viewers
decrement_stream_viewers
increment_story_views
```

### Sound Functions
```sql
increment_sound_play_count
increment_sound_use_count
```

### Sponsor Banner Functions
```sql
increment_banner_view
increment_banner_click
```

### Seed Content Functions
```sql
delete_all_seed_content
check_bot_daily_limit
get_random_seed_users
```

---

## HOW TO USE THIS DOCUMENT

1. **Check what's already in your database:**
   ```sql
   -- Check tables
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' ORDER BY table_name;

   -- Check functions
   SELECT proname FROM pg_proc
   WHERE pronamespace = 'public'::regnamespace ORDER BY proname;
   ```

2. **Compare with this list** to find missing tables/functions

3. **Only run migrations for missing objects** - don't run everything!

4. **Priority order:**
   - CRITICAL tables first (profiles, forum_posts, vision_board_widgets)
   - HIGH usage tables next
   - RPC functions that are called by the app

---

## RECOMMENDED MIGRATION ORDER

1. **profiles** and extensions (uuid-ossp)
2. **Forum tables** (forum_categories, forum_posts, forum_comments, forum_likes)
3. **Vision Board tables** (vision_board_widgets, vision_goals, vision_habits, etc.)
4. **Course tables** (courses, course_modules, course_lessons, etc.)
5. **Wallet/Payment tables** (user_wallets, wallet_transactions)
6. **Partnership tables** (partnership_applications, withdrawal_requests)
7. **Feed system tables** (feed_impressions, post_interactions)
8. **All RPC functions**
9. **RLS policies**
10. **Triggers and indexes**
