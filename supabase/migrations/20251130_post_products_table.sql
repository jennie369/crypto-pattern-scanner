-- =====================================================
-- POST PRODUCTS TABLE
-- Links Shopify products to forum posts
-- Table: forum_posts (NOT posts)
-- =====================================================

-- Create post_products table
CREATE TABLE IF NOT EXISTS public.post_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_title TEXT,
    product_price TEXT,
    product_image TEXT,
    product_handle TEXT,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_post_products_post_id ON public.post_products(post_id);
CREATE INDEX IF NOT EXISTS idx_post_products_product_id ON public.post_products(product_id);

-- Enable RLS
ALTER TABLE public.post_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop existing first to allow re-run)
DROP POLICY IF EXISTS "Anyone can view post products" ON public.post_products;
DROP POLICY IF EXISTS "Post owner can insert products" ON public.post_products;
DROP POLICY IF EXISTS "Post owner can update products" ON public.post_products;
DROP POLICY IF EXISTS "Post owner can delete products" ON public.post_products;

-- Anyone can view post products
CREATE POLICY "Anyone can view post products"
    ON public.post_products
    FOR SELECT
    USING (true);

-- Post owner can insert products
CREATE POLICY "Post owner can insert products"
    ON public.post_products
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.forum_posts
            WHERE forum_posts.id = post_id
            AND forum_posts.user_id = auth.uid()
        )
    );

-- Post owner can update products
CREATE POLICY "Post owner can update products"
    ON public.post_products
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.forum_posts
            WHERE forum_posts.id = post_id
            AND forum_posts.user_id = auth.uid()
        )
    );

-- Post owner can delete products
CREATE POLICY "Post owner can delete products"
    ON public.post_products
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.forum_posts
            WHERE forum_posts.id = post_id
            AND forum_posts.user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON public.post_products TO authenticated;
GRANT SELECT ON public.post_products TO anon;

-- Add comment
COMMENT ON TABLE public.post_products IS 'Links Shopify products to forum posts for product tagging feature';
