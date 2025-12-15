-- Xem thời gian tạo impressions
SELECT
  DATE_TRUNC('minute', shown_at) as time_bucket,
  COUNT(*) as impressions_count
FROM seed_impressions
GROUP BY DATE_TRUNC('minute', shown_at)
ORDER BY time_bucket DESC
LIMIT 20;
