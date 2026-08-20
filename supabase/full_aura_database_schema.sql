-- ====================================================================
-- AURA E-COMMERCE: COMPLETE CONSOLIDATED SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor to set up all tables,
-- columns, indexes, initial data, and Row Level Security (RLS) policies.
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BRANDS TABLE (Dynamic Product Manufacturer Brands)
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS TABLE (Full Specs, Highlights JSONB, SKU, Brand)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    specs JSONB DEFAULT '{}'::jsonb,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    images TEXT[] DEFAULT '{}',
    stock INT NOT NULL DEFAULT 10,
    badge TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_flash_deal BOOLEAN DEFAULT FALSE,
    brand TEXT DEFAULT 'AURA Official',
    bought_past_month INT DEFAULT 0,
    highlights JSONB DEFAULT '[]'::jsonb,
    sku TEXT,
    target_gender TEXT DEFAULT 'unisex',
    origin_country TEXT DEFAULT 'Egypt',
    shelf_life TEXT,
    key_benefits TEXT[] DEFAULT '{}',
    delivery_info TEXT,
    return_policy TEXT,
    variants JSONB DEFAULT '[]'::jsonb,
    ratings_count INT DEFAULT 0,
    average_rating NUMERIC DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix column type if highlights existed as text array previously
ALTER TABLE public.products ALTER COLUMN highlights TYPE JSONB USING to_jsonb(highlights);

-- 5. EGYPTIAN GOVERNORATES TABLE (Dynamic Shipping Rates & Timelines)
CREATE TABLE IF NOT EXISTS public.governorates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    fee NUMERIC NOT NULL DEFAULT 50,
    est_days TEXT NOT NULL DEFAULT '1-2 Business Days',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Governorates Data
INSERT INTO public.governorates (id, name, name_ar, fee, est_days) VALUES
('cairo', 'Cairo', 'القاهرة', 50, '1-2 Business Days'),
('giza', 'Giza', 'الجيزة', 50, '1-2 Business Days'),
('qalyubia', 'Qalyubia', 'القليوبية', 60, '1-2 Business Days'),
('alexandria', 'Alexandria', 'الإسكندرية', 75, '2 Business Days'),
('dakahlia', 'Dakahlia (Mansoura)', 'الدقهلية (المنصورة)', 90, '2-3 Business Days'),
('gharbia', 'Gharbia (Tanta)', 'الغربية (طنطا)', 90, '2-3 Business Days'),
('sharqia', 'Sharqia (Zagazig)', 'الشرقية (الزقازيق)', 90, '2-3 Business Days'),
('monufia', 'Monufia', 'المنوفية', 90, '2-3 Business Days'),
('beheira', 'Beheira', 'البحيرة', 90, '2-3 Business Days'),
('damietta', 'Damietta', 'دمياط', 90, '2-3 Business Days'),
('kafr_el_sheikh', 'Kafr El Sheikh', 'كفر الشيخ', 90, '2-3 Business Days'),
('port_said', 'Port Said', 'بورسعيد', 100, '2-3 Business Days'),
('ismailia', 'Ismailia', 'الإسماعيلية', 100, '2-3 Business Days'),
('suez', 'Suez', 'السويس', 100, '2-3 Business Days'),
('fayoum', 'Fayoum', 'الفيوم', 90, '2-3 Business Days'),
('beni_suef', 'Beni Suef', 'بني سويف', 100, '2-3 Business Days'),
('minya', 'Minya', 'المنيا', 110, '3-4 Business Days'),
('asyut', 'Asyut', 'أسيوط', 110, '3-4 Business Days'),
('sohag', 'Sohag', 'سوهاج', 120, '3-4 Business Days'),
('qena', 'Qena', 'قنا', 120, '3-4 Business Days'),
('luxor', 'Luxor', 'الأقصر', 120, '3-4 Business Days'),
('aswan', 'Aswan', 'أسوان', 130, '3-5 Business Days'),
('red_sea', 'Red Sea (Hurghada)', 'البحر الأحمر (الغردقة)', 140, '3-5 Business Days'),
('south_sinai', 'South Sinai (Sharm)', 'جنوب سيناء (شرم الشيخ)', 150, '3-5 Business Days')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    name_ar = EXCLUDED.name_ar,
    fee = EXCLUDED.fee,
    est_days = EXCLUDED.est_days;

-- Seed Default Brands Data
INSERT INTO public.brands (name) VALUES
('AURA Official'), ('Anker'), ('Sony'), ('Apple'), ('Samsung'),
('Logitech'), ('Razer'), ('Bose'), ('Asus'), ('Xiaomi'), ('Baseus'), ('JBL')
ON CONFLICT (name) DO NOTHING;

-- 6. CUSTOMER ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street_address TEXT NOT NULL,
    building_no TEXT,
    city TEXT NOT NULL,
    state_region TEXT NOT NULL,
    country TEXT DEFAULT 'Egypt',
    zip_code TEXT DEFAULT '11511',
    is_default BOOLEAN DEFAULT FALSE,
    delivery_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDERS & ORDER ITEMS TABLES
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount NUMERIC NOT NULL,
    shipping_address JSONB NOT NULL,
    payment_method TEXT DEFAULT 'cash_on_delivery',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    selected_variant JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. OFFERS / BUNDLES TABLE
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    badge TEXT DEFAULT 'SPECIAL BUNDLE',
    image_url TEXT NOT NULL,
    original_price NUMERIC NOT NULL,
    offer_price NUMERIC NOT NULL,
    product_ids UUID[] DEFAULT '{}',
    show_in_overlay BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. BLOGS & BLOG CATEGORIES TABLES
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT,
    author_name TEXT DEFAULT 'AURA Editorial',
    author_avatar TEXT,
    read_time_minutes INT DEFAULT 5,
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STORIES & BENTO CMS TABLES
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bento_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT,
    grid_span TEXT DEFAULT 'col-span-1',
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PROMO CODES & NEWSLETTER TABLES
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percent NUMERIC NOT NULL,
    max_discount_amount NUMERIC,
    min_order_amount NUMERIC DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR ALL TABLES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governorates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bento_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow Public READ for store content
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Governorates" ON public.governorates FOR SELECT USING (true);
CREATE POLICY "Public Read Addresses" ON public.addresses FOR SELECT USING (true);
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Read Order Items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Public Read Offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Public Read Blogs" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Public Read Blog Categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Public Read Stories" ON public.stories FOR SELECT USING (true);
CREATE POLICY "Public Read Bento Items" ON public.bento_items FOR SELECT USING (true);
CREATE POLICY "Public Read Promo Codes" ON public.promo_codes FOR SELECT USING (true);

-- Allow FULL MODIFICATION for Admin / Operations
CREATE POLICY "Full Access Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Brands" ON public.brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Governorates" ON public.governorates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Addresses" ON public.addresses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Order Items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Offers" ON public.offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Blogs" ON public.blogs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Blog Categories" ON public.blog_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Stories" ON public.stories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Bento Items" ON public.bento_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Promo Codes" ON public.promo_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Newsletter Subscribers" ON public.newsletter_subscribers FOR ALL USING (true) WITH CHECK (true);
