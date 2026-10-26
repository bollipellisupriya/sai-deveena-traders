-- ============================================================================
-- SAI DEVEENA TRADERS: CUSTOMER ENQUIRIES MIGRATION
-- Target: Supabase PostgreSQL
-- Description:
--   Creates a dedicated, hardened `customer_enquiries` table for product
--   and general inquiries via Call & WhatsApp without requiring customer
--   login, registration, email auth, or SMS OTP.
--
-- Security:
--   1. Strict Row Level Security (RLS) enabled.
--   2. Public (anon and authenticated) can ONLY INSERT valid enquiries with status='new'.
--   3. Public (anon) cannot SELECT, UPDATE, or DELETE any enquiries.
--   4. Only verified administrators (public.is_admin()) can SELECT, UPDATE status, or DELETE.
--   5. Input validation constraints on name, phone, email, village_city, preferred_contact, status.
--
-- Important: Do not execute without explicit user approval.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. PREFLIGHT CHECKS & FUNCTION VERIFICATION
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  -- Verify public.admin_users exists for admin authorization
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'admin_users'
  ) THEN
    RAISE EXCEPTION 'Preflight Failure: public.admin_users table not found.';
  END IF;

  -- Ensure customer_enquiries does not exist as an incompatible object (e.g. view)
  IF EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND c.relname = 'customer_enquiries' AND c.relkind <> 'r'
  ) THEN
    RAISE EXCEPTION 'Preflight Failure: public.customer_enquiries exists but is not a regular table.';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 1. VERIFY OR CREATE SHARED HELPER FUNCTIONS
-- ----------------------------------------------------------------------------
-- Ensure handle_updated_at() trigger function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_updated_at'
  ) THEN
    CREATE FUNCTION public.handle_updated_at()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $f$
    BEGIN
      new.updated_at = pg_catalog.now();
      RETURN new;
    END;
    $f$;
  END IF;
END $$;

-- Ensure is_admin() function exists and checks active admin status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'is_admin'
  ) THEN
    CREATE FUNCTION public.is_admin()
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    STABLE
    SET search_path = ''
    AS $f$
      SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = (SELECT auth.uid())
          AND is_active = true
      );
    $f$;

    REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. CREATE CUSTOMER_ENQUIRIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) >= 2 AND length(name) <= 120),
  phone TEXT NOT NULL CHECK (length(trim(phone)) >= 10 AND length(phone) <= 20),
  email TEXT NULL CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  village_city TEXT NOT NULL CHECK (length(trim(village_city)) >= 2 AND length(village_city) <= 120),
  address TEXT NULL CHECK (address IS NULL OR length(address) <= 500),
  preferred_contact TEXT NOT NULL DEFAULT 'whatsapp' CHECK (preferred_contact IN ('whatsapp', 'call')),
  product_id TEXT NULL REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NULL CHECK (product_name IS NULL OR length(product_name) <= 250),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'order_confirmed', 'closed')),
  notes TEXT NULL CHECK (notes IS NULL OR length(notes) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table Comment
COMMENT ON TABLE public.customer_enquiries IS 
  'Direct customer enquiries for products/store from Call and WhatsApp actions. No customer login required.';

-- ----------------------------------------------------------------------------
-- 3. PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_customer_enquiries_status 
  ON public.customer_enquiries(status);

CREATE INDEX IF NOT EXISTS idx_customer_enquiries_created_at 
  ON public.customer_enquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_enquiries_phone 
  ON public.customer_enquiries(phone);

CREATE INDEX IF NOT EXISTS idx_customer_enquiries_product_id 
  ON public.customer_enquiries(product_id);

-- ----------------------------------------------------------------------------
-- 4. ATTACH UPDATED_AT TRIGGER
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_customer_enquiries_updated_at ON public.customer_enquiries;
CREATE TRIGGER trg_customer_enquiries_updated_at
  BEFORE UPDATE ON public.customer_enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;

-- 5A. INSERT Policy: Anyone (anon or authenticated visitor) can submit a new enquiry
-- Enforces status must be 'new' and required fields have valid length
DROP POLICY IF EXISTS "Allow visitors to submit customer enquiries" ON public.customer_enquiries;
CREATE POLICY "Allow visitors to submit customer enquiries"
  ON public.customer_enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'new'
    AND length(trim(name)) >= 2
    AND length(trim(phone)) >= 10
    AND length(trim(village_city)) >= 2
    AND preferred_contact IN ('whatsapp', 'call')
  );

-- 5B. SELECT Policy: Only verified active administrators can view enquiries
DROP POLICY IF EXISTS "Allow active admins to read customer enquiries" ON public.customer_enquiries;
CREATE POLICY "Allow active admins to read customer enquiries"
  ON public.customer_enquiries
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 5C. UPDATE Policy: Only verified active administrators can update enquiry status or notes
DROP POLICY IF EXISTS "Allow active admins to update customer enquiries" ON public.customer_enquiries;
CREATE POLICY "Allow active admins to update customer enquiries"
  ON public.customer_enquiries
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5D. DELETE Policy: Only verified active administrators can delete enquiries
DROP POLICY IF EXISTS "Allow active admins to delete customer enquiries" ON public.customer_enquiries;
CREATE POLICY "Allow active admins to delete customer enquiries"
  ON public.customer_enquiries
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. LEAST-PRIVILEGE GRANTS & COLUMN-LEVEL ACCESS CONTROL
-- ----------------------------------------------------------------------------
-- 6A. Explicitly revoke all privileges from PUBLIC, anon, and authenticated
REVOKE ALL ON TABLE public.customer_enquiries FROM PUBLIC, anon, authenticated;

-- 6B. Grant column-level INSERT permission to anonymous visitors
-- Only permit submitting identity, contact, location, and product inquiry fields.
-- `status`, `created_at`, and `updated_at` MUST use database defaults.
-- Anonymous visitors CANNOT insert or set `notes`.
GRANT INSERT (
  name,
  phone,
  email,
  village_city,
  address,
  preferred_contact,
  product_id,
  product_name
) ON TABLE public.customer_enquiries TO anon;

-- 6C. Grant column-level INSERT permission to authenticated visitors
-- Permits visitors with an authenticated session to also submit enquiries with the same restricted columns.
GRANT INSERT (
  name,
  phone,
  email,
  village_city,
  address,
  preferred_contact,
  product_id,
  product_name
) ON TABLE public.customer_enquiries TO authenticated;

-- 6D. Grant SELECT and DELETE permissions to authenticated role
-- Row-level access is strictly gated by RLS requiring public.is_admin() = true.
-- Ordinary authenticated users (is_admin() = false) cannot read or delete any rows.
GRANT SELECT, DELETE ON TABLE public.customer_enquiries TO authenticated;

-- 6E. Grant column-level UPDATE permission on status and notes only
-- Customer details (name, phone, email, village_city, address, product, timestamps) are immutable.
-- Row-level access is strictly gated by RLS requiring public.is_admin() = true.
-- Ordinary authenticated users cannot update status, notes, or any customer details.
GRANT UPDATE (status, notes) ON TABLE public.customer_enquiries TO authenticated;
