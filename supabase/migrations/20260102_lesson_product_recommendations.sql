-- =====================================================
-- LESSON PRODUCT RECOMMENDATIONS
-- Allows embedding product recommendations in lessons
-- =====================================================

-- Table: lesson_product_recommendations
-- Stores product recommendations embedded in lessons
CREATE TABLE IF NOT EXISTS lesson_product_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- Shopify product ID
  product_handle TEXT NOT NULL, -- Shopify product handle for URL
  product_title TEXT NOT NULL,
  product_image_url TEXT,
  product_price DECIMAL(10,2),
  product_compare_price DECIMAL(10,2), -- Original price for discount display
  product_currency TEXT DEFAULT 'VND',
  product_vendor TEXT,
  product_type TEXT,
  display_order INTEGER DEFAULT 0,
  display_style TEXT DEFAULT 'card' CHECK (display_style IN ('card', 'inline', 'banner', 'grid')),
  custom_cta_text TEXT, -- Custom call-to-action text
  custom_description TEXT, -- Custom description override
  show_price BOOLEAN DEFAULT true,
  show_discount_badge BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  position_in_content TEXT, -- HTML position marker
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: product_recommendation_clicks
-- Tracks clicks on product recommendations for analytics
CREATE TABLE IF NOT EXISTS product_recommendation_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID REFERENCES lesson_product_recommendations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lesson_id TEXT REFERENCES course_lessons(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  click_source TEXT DEFAULT 'lesson' CHECK (click_source IN ('lesson', 'mobile_app', 'email', 'push')),
  device_type TEXT,
  session_id TEXT,
  converted_to_purchase BOOLEAN DEFAULT false,
  conversion_amount DECIMAL(10,2),
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: product_recommendation_templates
-- Predefined templates for product recommendation displays
CREATE TABLE IF NOT EXISTS product_recommendation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  html_template TEXT NOT NULL,
  css_styles TEXT,
  preview_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_product_recs_lesson ON lesson_product_recommendations(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_product_recs_product ON lesson_product_recommendations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_rec_clicks_user ON product_recommendation_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_product_rec_clicks_product ON product_recommendation_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_product_rec_clicks_date ON product_recommendation_clicks(clicked_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE lesson_product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendation_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendation_templates ENABLE ROW LEVEL SECURITY;

-- lesson_product_recommendations policies
-- Anyone can view recommendations (public for lessons)
CREATE POLICY "Anyone can view lesson product recommendations"
  ON lesson_product_recommendations FOR SELECT
  USING (true);

-- Only admins/creators can insert recommendations
CREATE POLICY "Admins can insert product recommendations"
  ON lesson_product_recommendations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'creator')
    )
  );

-- Only admins/creators can update recommendations
CREATE POLICY "Admins can update product recommendations"
  ON lesson_product_recommendations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'creator')
    )
  );

-- Only admins can delete recommendations
CREATE POLICY "Admins can delete product recommendations"
  ON lesson_product_recommendations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- product_recommendation_clicks policies
-- Users can insert their own clicks
CREATE POLICY "Users can insert own clicks"
  ON product_recommendation_clicks FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can view their own clicks, admins can view all
CREATE POLICY "Users can view own clicks"
  ON product_recommendation_clicks FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- product_recommendation_templates policies
-- Anyone can view active templates
CREATE POLICY "Anyone can view active templates"
  ON product_recommendation_templates FOR SELECT
  USING (is_active = true);

-- Only admins can manage templates
CREATE POLICY "Admins can manage templates"
  ON product_recommendation_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Track product recommendation click
CREATE OR REPLACE FUNCTION track_product_recommendation_click(
  p_recommendation_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_device_type TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_click_source TEXT DEFAULT 'lesson'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_click_id UUID;
  v_rec RECORD;
BEGIN
  -- Get recommendation details
  SELECT lesson_id, product_id INTO v_rec
  FROM lesson_product_recommendations
  WHERE id = p_recommendation_id;

  IF v_rec IS NULL THEN
    RAISE EXCEPTION 'Recommendation not found';
  END IF;

  -- Insert click record
  INSERT INTO product_recommendation_clicks (
    recommendation_id,
    user_id,
    lesson_id,
    product_id,
    click_source,
    device_type,
    session_id
  ) VALUES (
    p_recommendation_id,
    COALESCE(p_user_id, auth.uid()),
    v_rec.lesson_id,
    v_rec.product_id,
    p_click_source,
    p_device_type,
    p_session_id
  )
  RETURNING id INTO v_click_id;

  RETURN v_click_id;
END;
$$;

-- Function: Get product recommendation analytics
CREATE OR REPLACE FUNCTION get_product_recommendation_analytics(
  p_lesson_id TEXT DEFAULT NULL,
  p_product_id TEXT DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_clicks BIGINT,
  unique_users BIGINT,
  conversion_count BIGINT,
  conversion_rate DECIMAL,
  total_revenue DECIMAL,
  top_products JSONB,
  clicks_by_day JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH click_stats AS (
    SELECT
      COUNT(*) as clicks,
      COUNT(DISTINCT user_id) as users,
      COUNT(*) FILTER (WHERE converted_to_purchase) as conversions,
      SUM(conversion_amount) FILTER (WHERE converted_to_purchase) as revenue
    FROM product_recommendation_clicks
    WHERE clicked_at BETWEEN p_start_date AND p_end_date
      AND (p_lesson_id IS NULL OR lesson_id = p_lesson_id)
      AND (p_product_id IS NULL OR product_id = p_product_id)
  ),
  top_prods AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'product_id', product_id,
        'clicks', click_count
      ) ORDER BY click_count DESC
    ) as products
    FROM (
      SELECT product_id, COUNT(*) as click_count
      FROM product_recommendation_clicks
      WHERE clicked_at BETWEEN p_start_date AND p_end_date
        AND (p_lesson_id IS NULL OR lesson_id = p_lesson_id)
      GROUP BY product_id
      LIMIT 10
    ) t
  ),
  daily_clicks AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'date', click_date,
        'clicks', click_count
      ) ORDER BY click_date
    ) as by_day
    FROM (
      SELECT DATE(clicked_at) as click_date, COUNT(*) as click_count
      FROM product_recommendation_clicks
      WHERE clicked_at BETWEEN p_start_date AND p_end_date
        AND (p_lesson_id IS NULL OR lesson_id = p_lesson_id)
      GROUP BY DATE(clicked_at)
    ) t
  )
  SELECT
    cs.clicks,
    cs.users,
    cs.conversions,
    CASE WHEN cs.clicks > 0
      THEN ROUND((cs.conversions::DECIMAL / cs.clicks) * 100, 2)
      ELSE 0
    END,
    COALESCE(cs.revenue, 0),
    COALESCE(tp.products, '[]'::jsonb),
    COALESCE(dc.by_day, '[]'::jsonb)
  FROM click_stats cs
  CROSS JOIN top_prods tp
  CROSS JOIN daily_clicks dc;
END;
$$;

-- Function: Mark recommendation click as converted
CREATE OR REPLACE FUNCTION mark_recommendation_converted(
  p_click_id UUID,
  p_order_amount DECIMAL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE product_recommendation_clicks
  SET
    converted_to_purchase = true,
    conversion_amount = p_order_amount
  WHERE id = p_click_id;

  RETURN FOUND;
END;
$$;

-- =====================================================
-- INSERT DEFAULT TEMPLATES
-- =====================================================

INSERT INTO product_recommendation_templates (name, description, html_template, is_default, is_active)
VALUES
(
  'Card Style',
  'Product card with image, title, and price',
  '<div class="product-recommend-card" data-product-id="{{product_id}}" data-deeplink="gem://shop/product/{{product_handle}}" style="background: linear-gradient(135deg, rgba(106, 91, 255, 0.1), rgba(0, 240, 255, 0.05)); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; margin: 12px 0; cursor: pointer; transition: all 0.2s ease;">
  <div style="display: flex; gap: 12px; align-items: center;">
    <img src="{{product_image}}" alt="{{product_title}}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" />
    <div style="flex: 1; min-width: 0;">
      <div style="font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{product_title}}</div>
      <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 6px;">{{product_vendor}}</div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px; font-weight: 700; color: #FFBD59;">{{product_price}}</span>
        {{#if compare_price}}<span style="font-size: 12px; color: rgba(255,255,255,0.4); text-decoration: line-through;">{{compare_price}}</span>{{/if}}
      </div>
    </div>
    <div style="color: #00F0FF; font-size: 20px;">→</div>
  </div>
</div>',
  true,
  true
),
(
  'Banner Style',
  'Full-width promotional banner',
  '<div class="product-recommend-banner" data-product-id="{{product_id}}" data-deeplink="gem://shop/product/{{product_handle}}" style="background: linear-gradient(135deg, #6A5BFF, #00F0FF); border-radius: 16px; padding: 16px; margin: 16px 0; cursor: pointer; position: relative; overflow: hidden;">
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div style="flex: 1;">
      <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.8); margin-bottom: 4px;">🛍️ SẢN PHẨM KHUYÊN DÙNG</div>
      <div style="font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px;">{{product_title}}</div>
      <div style="display: inline-block; background: rgba(0,0,0,0.3); padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; color: #FFBD59;">{{product_price}}</div>
    </div>
    <img src="{{product_image}}" alt="{{product_title}}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" />
  </div>
</div>',
  false,
  true
),
(
  'Inline Style',
  'Compact inline product mention',
  '<span class="product-recommend-inline" data-product-id="{{product_id}}" data-deeplink="gem://shop/product/{{product_handle}}" style="display: inline-flex; align-items: center; gap: 6px; background: rgba(106, 91, 255, 0.2); padding: 4px 10px; border-radius: 20px; cursor: pointer; color: #00F0FF; font-weight: 500;">
  🛍️ {{product_title}} <span style="color: #FFBD59; font-weight: 600;">{{product_price}}</span>
</span>',
  false,
  true
),
(
  'Grid Item',
  'For product grid layouts',
  '<div class="product-recommend-grid-item" data-product-id="{{product_id}}" data-deeplink="gem://shop/product/{{product_handle}}" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.2s ease;">
  <img src="{{product_image}}" alt="{{product_title}}" style="width: 100%; aspect-ratio: 1; object-fit: cover;" />
  <div style="padding: 10px;">
    <div style="font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{product_title}}</div>
    <div style="font-size: 15px; font-weight: 700; color: #FFBD59;">{{product_price}}</div>
  </div>
</div>',
  false,
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update timestamp on recommendation update
CREATE OR REPLACE FUNCTION update_recommendation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_recommendation_timestamp
  BEFORE UPDATE ON lesson_product_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_recommendation_timestamp();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION track_product_recommendation_click TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_recommendation_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION mark_recommendation_converted TO authenticated;
