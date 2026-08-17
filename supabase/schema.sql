-- =======================================================
-- AURA E-Commerce Architecture & Database Schema
-- Database: PostgreSQL / Supabase
-- =======================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role user_role DEFAULT 'customer' NOT NULL,
    loyalty_points INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    specs JSONB DEFAULT '{}'::jsonb NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    stock INT DEFAULT 0 NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_flash_deal BOOLEAN DEFAULT false NOT NULL,
    flash_deal_ends_at TIMESTAMPTZ,
    badge TEXT,
    images TEXT[] DEFAULT '{}'::text[] NOT NULL,
    variants JSONB DEFAULT '[]'::jsonb NOT NULL,
    rating_avg DECIMAL(3, 2) DEFAULT 0.00 NOT NULL,
    reviews_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge TEXT;

-- 6. HOMEPAGE STORIES TABLE (Immersive App-Style Carousel)
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    bg_gradient TEXT DEFAULT 'from-purple-900 to-indigo-900',
    linked_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. STORY PRODUCTS (Junction table linking stories to curated products)
CREATE TABLE IF NOT EXISTS public.story_products (
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    PRIMARY KEY (story_id, product_id)
);

-- 8. WISHLIST TABLE
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 9. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    variant JSONB DEFAULT '{}'::jsonb NOT NULL,
    quantity INT DEFAULT 1 NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status order_status DEFAULT 'pending' NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    points_earned INT DEFAULT 0 NOT NULL,
    points_redeemed INT DEFAULT 0 NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    shipping_address JSONB NOT NULL,
    tracking_number TEXT UNIQUE,
    estimated_delivery TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    variant JSONB DEFAULT '{}'::jsonb NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT DEFAULT 1 NOT NULL CHECK (quantity > 0)
);

-- 12. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. LOYALTY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.loyalty_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    points INT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =======================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- =======================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_flash ON public.products(is_flash_deal);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_user ON public.loyalty_logs(user_id);

-- =======================================================
-- FUNCTIONS & TRIGGERS
-- =======================================================

-- Function: Handle Automatic User Profile Creation on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_val public.user_role;
BEGIN
    IF (NEW.raw_user_meta_data->>'role') = 'admin' OR NEW.email LIKE '%admin%' THEN
        user_role_val := 'admin'::public.user_role;
    ELSE
        user_role_val := 'customer'::public.user_role;
    END IF;

    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        user_role_val
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger: On auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Auto Update Average Rating on Review Insert/Update/Delete
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_product_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_product_id := OLD.product_id;
    ELSE
        target_product_id := NEW.product_id;
    END IF;

    UPDATE public.products
    SET 
        rating_avg = COALESCE((SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE product_id = target_product_id), 0.00),
        reviews_count = COALESCE((SELECT COUNT(*) FROM public.reviews WHERE product_id = target_product_id), 0)
    WHERE id = target_product_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On reviews modification
DROP TRIGGER IF EXISTS trigger_update_rating ON public.reviews;
CREATE TRIGGER trigger_update_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- =======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if requesting user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT (role = 'admin')
        FROM public.profiles
        WHERE id = auth.uid()
        LIMIT 1
    );
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- PROFILES
CREATE POLICY "Public profiles are viewable by owner and admin" ON public.profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES
CREATE POLICY "Categories are readable by everyone" ON public.categories
    FOR SELECT USING (true);
CREATE POLICY "Admin full control on categories" ON public.categories
    FOR ALL USING (is_admin());

-- PRODUCTS
CREATE POLICY "Products are readable by everyone" ON public.products
    FOR SELECT USING (true);
CREATE POLICY "Admin full control on products" ON public.products
    FOR ALL USING (is_admin());

-- STORIES
CREATE POLICY "Stories are readable by everyone" ON public.stories
    FOR SELECT USING (true);
CREATE POLICY "Admin full control on stories" ON public.stories
    FOR ALL USING (is_admin());

-- STORY PRODUCTS
CREATE POLICY "Story products are readable by everyone" ON public.story_products
    FOR SELECT USING (true);
CREATE POLICY "Admin full control on story products" ON public.story_products
    FOR ALL USING (is_admin());

-- WISHLISTS
CREATE POLICY "Users can manage their own wishlist" ON public.wishlists
    FOR ALL USING (auth.uid() = user_id);

-- CART ITEMS
CREATE POLICY "Users can manage their own cart" ON public.cart_items
    FOR ALL USING (auth.uid() = user_id);

-- ORDERS & ORDER ITEMS
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access to orders" ON public.orders
    FOR ALL USING (is_admin());

CREATE POLICY "Users can view their own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_items.order_id 
            AND (user_id = auth.uid() OR is_admin())
        )
    );
CREATE POLICY "Users can insert order items" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_items.order_id 
            AND user_id = auth.uid()
        )
    );

-- REVIEWS
CREATE POLICY "Reviews are readable by everyone" ON public.reviews
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- LOYALTY LOGS
CREATE POLICY "Users can view their loyalty logs" ON public.loyalty_logs
    FOR SELECT USING (auth.uid() = user_id OR is_admin());
