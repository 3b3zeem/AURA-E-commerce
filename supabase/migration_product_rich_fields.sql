-- ========================================================
-- AURA E-Commerce: Supabase SQL Migration & Seed Script (Fixed Types)
-- Execute this SQL code in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Run
-- ========================================================

-- 1. Add new rich product data columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS bought_past_month INT DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS bank_promos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS protection_plans JSONB DEFAULT '[]'::jsonb;

-- 2. Populate rich data across existing products in Supabase
UPDATE public.products 
SET 
  brand = COALESCE(brand, CASE 
    WHEN LOWER(name) LIKE '%headphone%' OR LOWER(name) LIKE '%keyboard%' OR LOWER(name) LIKE '%mouse%' THEN 'Redragon'
    WHEN LOWER(name) LIKE '%watch%' THEN 'AURA Tech'
    ELSE 'AURA Premium'
  END),

  bought_past_month = CASE 
    WHEN bought_past_month IS NULL OR bought_past_month = 0 THEN (reviews_count * 3 + 50) 
    ELSE bought_past_month 
  END,

  highlights = '[
    "Official AURA flagship product with official 2-Year Manufacturer Warranty.",
    "Engineered with superior ergonomic precision and ultra-durable finish.",
    "Plug-and-play instant compatibility across all devices.",
    "Fast delivery & cash on delivery option available for all Egyptian governorates."
  ]'::jsonb,

  bank_promos = '[
    {"code": "NBEAUG500", "title": "10% off NBE Visa Signature Credit Cards", "discount": "Save up to 500 EGP"},
    {"code": "NBEAUG250", "title": "10% off NBE Visa Platinum Credit Cards", "discount": "Save up to 250 EGP"},
    {"code": "AAIB20", "title": "20% off with AAIB cards at checkout", "discount": "Save 20%"}
  ]'::jsonb,

  protection_plans = '[
    {"id": "ext-1yr", "name": "1-Year Extended Warranty by Boxi (Email delivery)", "price": 56},
    {"id": "ext-2yr", "name": "2-Year Extended Warranty by Boxi (Email delivery)", "price": 89},
    {"id": "damage-1yr", "name": "1-Year Accidental Damage Protection by Boxi", "price": 97}
  ]'::jsonb

WHERE brand IS NULL OR bought_past_month IS NULL OR bought_past_month = 0;
