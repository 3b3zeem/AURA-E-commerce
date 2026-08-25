-- ====================================================================
-- AURA E-COMMERCE: Enterprise Roles & Permissions (RBAC) Migration
-- Run this script in your Supabase SQL Editor
-- ====================================================================

-- 0. FIX EXISTING USER_ROLE ENUM TYPE IF PRESENT
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
    EXCEPTION WHEN OTHERS THEN END;
    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'seller';
    EXCEPTION WHEN OTHERS THEN END;
  END IF;
END $$;

-- Safely convert profiles.role column to TEXT to avoid ENUM type mismatch
ALTER TABLE IF EXISTS public.profiles ALTER COLUMN role TYPE TEXT USING role::text;

-- 1. UPDATE PROFILES TABLE ROLE CONSTRAINT
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE IF EXISTS public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('super_admin', 'admin', 'seller', 'user', 'customer'));

-- Update any null or old roles to standard default 'user'
UPDATE public.profiles SET role = 'user' WHERE role IS NULL OR role = 'customer';

-- Add seller business profile columns if not present
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS store_name TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS business_phone TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS store_description TEXT;

-- 2. CREATE ROLES TABLE
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  module VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE ROLE_PERMISSIONS JOIN TABLE
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_code VARCHAR(50) NOT NULL REFERENCES public.roles(code) ON DELETE CASCADE ON UPDATE CASCADE,
  permission_code VARCHAR(100) NOT NULL REFERENCES public.permissions(code) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role_code, permission_code)
);

-- 5. CREATE SELLER_REQUESTS TABLE (For user -> seller upgrades)
CREATE TABLE IF NOT EXISTS public.seller_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name VARCHAR(150) NOT NULL,
  store_description TEXT,
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow read roles for authenticated users" ON public.roles;
DROP POLICY IF EXISTS "Allow read permissions for authenticated users" ON public.permissions;
DROP POLICY IF EXISTS "Allow read role_permissions for authenticated users" ON public.role_permissions;
DROP POLICY IF EXISTS "Full access roles for all" ON public.roles;
DROP POLICY IF EXISTS "Full access permissions for all" ON public.permissions;
DROP POLICY IF EXISTS "Full access role_permissions for all" ON public.role_permissions;
DROP POLICY IF EXISTS "Full access seller_requests for all" ON public.seller_requests;

-- Allow full access for anon/service role or admins
CREATE POLICY "Full access roles for all" ON public.roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access permissions for all" ON public.permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access role_permissions for all" ON public.role_permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access seller_requests for all" ON public.seller_requests FOR ALL USING (true) WITH CHECK (true);

-- 6. SEED DEFAULT SYSTEM ROLES
INSERT INTO public.roles (code, name, description, is_system)
VALUES 
  ('super_admin', 'Super Administrator', 'Full control over system, roles, permissions, users & global settings.', true),
  ('admin', 'Administrator', 'Operational admin managing catalog, orders, categories, offers & support.', true),
  ('seller', 'Seller / Vendor', 'Vendor partner with access to list products, view store sales & manage orders.', true),
  ('user', 'Customer / Buyer', 'Standard customer profile capable of browsing, buying & reviewing products.', true)
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_system = EXCLUDED.is_system;

-- 7. SEED GRANULAR PERMISSIONS
INSERT INTO public.permissions (code, name, module, description)
VALUES
  -- Roles & Security
  ('roles.read', 'View Roles & Permissions', 'Security & Roles', 'Permission to view available roles and permission assignments.'),
  ('roles.manage', 'Manage Roles & Permissions', 'Security & Roles', 'Permission to CRUD roles, permissions, and assign privileges to users (Super Admin only).'),
  ('users.read', 'View Users List', 'User Management', 'Permission to list registered platform users.'),
  ('users.manage', 'Manage User Accounts', 'User Management', 'Permission to edit, create, or ban customer accounts.'),
  
  -- Seller & Vendors
  ('sellers.manage', 'Approve & Manage Sellers', 'Seller Portal', 'Permission to verify vendor registration requests.'),
  ('seller.apply', 'Apply for Seller Account', 'Seller Portal', 'Permission for customers to submit store application.'),
  
  -- Catalog & Products
  ('products.read', 'View Catalog Products', 'Products Catalog', 'Permission to view published products.'),
  ('products.create', 'Create Platform Products', 'Products Catalog', 'Permission to publish new items catalog-wide.'),
  ('products.edit', 'Edit Platform Products', 'Products Catalog', 'Permission to modify any product details.'),
  ('products.delete', 'Delete Platform Products', 'Products Catalog', 'Permission to delete products.'),
  ('products.own_manage', 'Manage Own Seller Products', 'Products Catalog', 'Permission for sellers to manage their store items.'),
  
  -- Categories & Brands
  ('categories.manage', 'Manage Categories', 'Catalog Structure', 'Permission to add, edit, or delete categories.'),
  ('brands.manage', 'Manage Brands', 'Catalog Structure', 'Permission to add, edit, or delete brands.'),
  
  -- Orders & Sales
  ('orders.read_all', 'View All Orders', 'Order Management', 'Permission to inspect all customer orders.'),
  ('orders.manage', 'Manage Order Status', 'Order Management', 'Permission to update shipping status & process returns.'),
  ('orders.seller_view', 'View Seller Store Orders', 'Order Management', 'Permission for sellers to view orders for their products.'),
  
  -- Marketing & CMS
  ('offers.manage', 'Manage Offers & Deals', 'Marketing', 'Permission to create flash sales and bundle offers.'),
  ('bento.manage', 'Manage Bento Home Layout', 'Marketing', 'Permission to edit home page spotlight grids.'),
  ('stories.manage', 'Manage Stories', 'Marketing', 'Permission to publish brand campaign stories.'),
  ('blogs.manage', 'Manage Blog Articles', 'Content', 'Permission to create and publish blog posts.'),
  
  -- Support & Reviews
  ('support.manage', 'Customer Support Desk', 'Support', 'Permission to access customer support and tickets.'),
  ('reviews.manage', 'Moderate Customer Reviews', 'Support', 'Permission to approve or remove product reviews.'),
  ('reviews.submit', 'Write Product Review', 'Customer', 'Permission to submit rating and review for purchased items.')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  module = EXCLUDED.module,
  description = EXCLUDED.description;

-- 8. MAP PERMISSIONS TO ROLES
DELETE FROM public.role_permissions;

-- Super Admin: ALL Permissions
INSERT INTO public.role_permissions (role_code, permission_code)
SELECT 'super_admin', code FROM public.permissions;

-- Admin: All permissions except roles.manage
INSERT INTO public.role_permissions (role_code, permission_code)
SELECT 'admin', code FROM public.permissions 
WHERE code NOT IN ('roles.manage');

-- Seller: Seller portal permissions & own products/orders
INSERT INTO public.role_permissions (role_code, permission_code)
VALUES 
  ('seller', 'products.read'),
  ('seller', 'products.own_manage'),
  ('seller', 'orders.seller_view'),
  ('seller', 'reviews.submit');

-- User (Customer): Standard buyer permissions
INSERT INTO public.role_permissions (role_code, permission_code)
VALUES 
  ('user', 'products.read'),
  ('user', 'seller.apply'),
  ('user', 'reviews.submit');

-- 9. PROFILES TRIGGER FOR DEFAULT ROLE ON NEW SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS NULL OR NEW.role = '' OR NEW.role = 'customer' THEN
    NEW.role := 'user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_user_role_trigger ON public.profiles;
CREATE TRIGGER ensure_user_role_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();
