-- =====================================================
-- ADD MISSING RITUALS TO DATABASE
-- Created: January 20, 2026
--
-- Adds 'letter-to-universe' and 'burn-release' rituals
-- that were missing from the original migration
-- =====================================================

-- Insert missing rituals
INSERT INTO vision_rituals (id, name, name_vi, description, category, duration_minutes, icon, color, xp_per_completion, sort_order, is_active)
VALUES
  ('letter-to-universe', 'Letter to Universe', 'Thư Gửi Vũ Trụ', 'Viết thư gửi điều ước lên bầu trời để vũ trụ nhận được', 'manifest', 5, 'mail', '#9D4EDD', 25, 6, TRUE),
  ('burn-release', 'Burn & Release', 'Đốt & Giải Phóng', 'Viết ra điều muốn buông bỏ và đốt cháy để giải phóng năng lượng tiêu cực', 'release', 4, 'flame', '#FF6B6B', 20, 7, TRUE),
  ('crystal-healing', 'Crystal Healing', 'Chữa Lành Bằng Pha Lê', 'Sử dụng năng lượng pha lê để chữa lành và cân bằng', 'healing', 5, 'gem', '#00CED1', 25, 8, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_vi = EXCLUDED.name_vi,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  duration_minutes = EXCLUDED.duration_minutes,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  xp_per_completion = EXCLUDED.xp_per_completion,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- Verify all rituals exist
-- SELECT id, name, name_vi FROM vision_rituals ORDER BY sort_order;
