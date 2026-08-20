-- ====================================================================
-- AURA E-COMMERCE: GOVERNORATES & BRANDS DYNAMIC INFRASTRUCTURE
-- ====================================================================

-- 1. Create Governorates Table for Dynamic Shipping Control
CREATE TABLE IF NOT EXISTS public.governorates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    fee NUMERIC NOT NULL DEFAULT 50,
    est_days TEXT NOT NULL DEFAULT '1-2 Business Days',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Egyptian Governorates Data
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

-- 2. Create Brands Table for Dynamic Product Brand Management
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Product Brands
INSERT INTO public.brands (name) VALUES
('AURA Official'),
('Anker'),
('Sony'),
('Apple'),
('Samsung'),
('Logitech'),
('Razer'),
('Bose'),
('Asus'),
('Xiaomi'),
('Baseus'),
('JBL')
ON CONFLICT (name) DO NOTHING;

-- 3. Row Level Security Policies
ALTER TABLE public.governorates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read governorates" ON public.governorates;
CREATE POLICY "Allow public read governorates" ON public.governorates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all governorates modification" ON public.governorates;
CREATE POLICY "Allow all governorates modification" ON public.governorates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read brands" ON public.brands;
CREATE POLICY "Allow public read brands" ON public.brands FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all brands modification" ON public.brands;
CREATE POLICY "Allow all brands modification" ON public.brands FOR ALL USING (true) WITH CHECK (true);
