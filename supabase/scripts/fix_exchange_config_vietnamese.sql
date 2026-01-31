-- ============================================================
-- FIX VIETNAMESE TEXT IN EXCHANGE_CONFIG
-- Sửa tiếng Việt không dấu thành có dấu
-- Run this in Supabase SQL Editor
-- ============================================================

-- Update Binance
UPDATE exchange_config SET
  description = 'Sàn giao dịch lớn nhất thế giới với thanh khoản cao nhất',
  features = '["Sàn lớn nhất thế giới", "Thanh khoản cao nhất", "Nhiều cặp giao dịch", "P2P hỗ trợ VND", "Giảm 20% phí khi đăng ký qua GEM"]'::jsonb
WHERE id = 'binance';

-- Update Nami
UPDATE exchange_config SET
  description = 'Sàn giao dịch Việt Nam, hỗ trợ tiếng Việt và nạp/rút VND trực tiếp',
  features = '["Sàn Việt Nam 100%", "Hỗ trợ tiếng Việt", "Nạp/rút VND trực tiếp", "Hỗ trợ 24/7 tiếng Việt", "Giảm 15% phí khi đăng ký qua GEM"]'::jsonb
WHERE id = 'nami';

-- Update OKX
UPDATE exchange_config SET
  description = 'Sàn giao dịch top 3 thế giới với công cụ giao dịch chuyên nghiệp',
  features = '["Top 3 thế giới", "Copy trading tốt", "Giao diện thân thiện", "P2P hỗ trợ VND", "Giảm 20% phí khi đăng ký qua GEM"]'::jsonb
WHERE id = 'okx';

-- Update Bybit
UPDATE exchange_config SET
  description = 'Sàn chuyên về Futures với leverage cao và thanh khoản tốt',
  features = '["Chuyên về Futures", "Leverage lên tới 100x", "Giao dịch nhanh", "P2P hỗ trợ VND", "Giảm 20% phí khi đăng ký qua GEM"]'::jsonb
WHERE id = 'bybit';

-- Verify updates
SELECT id, display_name, description, features FROM exchange_config ORDER BY display_order;
