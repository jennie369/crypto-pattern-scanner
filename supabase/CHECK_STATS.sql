-- Kiểm tra tổng số posts và impressions
SELECT 'Total seed_posts' as metric, count(*) as value FROM seed_posts WHERE status = 'published'
UNION ALL
SELECT 'Total forum_posts' as metric, count(*) as value FROM forum_posts WHERE status = 'published'
UNION ALL
SELECT 'Seed impressions' as metric, count(*) as value FROM seed_impressions
UNION ALL
SELECT 'Feed impressions' as metric, count(*) as value FROM feed_impressions
UNION ALL
SELECT 'Unseen seed posts' as metric,
  (SELECT count(*) FROM seed_posts WHERE status = 'published') -
  (SELECT count(DISTINCT post_id) FROM seed_impressions) as value
UNION ALL
SELECT 'Unseen forum posts' as metric,
  (SELECT count(*) FROM forum_posts WHERE status = 'published') -
  (SELECT count(DISTINCT post_id) FROM feed_impressions) as value;
