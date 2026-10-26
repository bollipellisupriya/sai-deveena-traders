-- ============================================================================
-- SAI DEVEENA TRADERS: CUSTOMER PROFILES MIGRATION (HARDENED PRODUCTION VERSION)
-- Target: Supabase PostgreSQL
-- Features:
--   1. Strict preflight schema validation (fails clearly on unexpected conflicts)
--   2. Exact function signature verification (preserves existing is_admin / handle_updated_at)
--   3. Least-privilege access: SELECT and UPDATE only for authenticated users (no direct INSERT)
--   4. Immutable fields trigger: prevents non-admins from changing id, email, phone, status, created_at
--   5. Automatic SECURITY DEFINER trigger on auth.users for new phone OTP registrations
--   6. Protection against reactivation: repeated sign-ins never overwrite suspended status
--   7. Zero historical data backfill; existing admin/catalog/storage objects untouched
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. PREFLIGHT SCHEMA VALIDATION & COMPATIBILITY CHECK
-- Fails clearly if required prerequisites are missing or conflicting objects exist
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  -- 0A. Verify Supabase Auth core table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    RAISE EXCEPTION 'Preflight Failure: auth.users table not found. Supabase Auth must be enabled.';
  END IF;

  -- 0B. Verify admin_users table exists with required is_active column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'admin_users'
  ) THEN
    RAISE EXCEPTION 'Preflight Failure: public.admin_users table not found. Admin authentication schema required.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'is_active'
  ) THEN
    RAISE EXCEPTION 'Preflight Failure: Column is_active missing on public.admin_users.';
  END IF;

  -- 0C. Ensure customer_profiles does not exist as an incompatible object (e.g. view or sequence)
  IF EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND c.relname = 'customer_profiles' AND c.relkind <> 'r'
  ) THEN
    RAISE EXCEPTION 'Preflight Failure: public.customer_profiles exists but is not a regular table.';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 1. EXACT SIGNATURE VERIFICATION & PRESERVATION OF SHARED FUNCTIONS
-- Preserves existing implementations; fails clearly if signature is incompatible
-- ----------------------------------------------------------------------------
-- 1A. public.handle_updated_at() Verification: must have 0 arguments and return trigger
DO $$
DECLARE
  v_exists BOOLEAN;
  v_compatible BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_updated_at'
  ) INTO v_exists;

  IF v_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
        AND p.proname = 'handle_updated_at'
        AND p.pronargs = 0
        AND p.prorettype = 'pg_catalog.trigger'::regtype
    ) INTO v_compatible;

    IF NOT v_compatible THEN
      RAISE EXCEPTION 'Preflight Failure: public.handle_updated_at exists with an incompatible signature.';
    END IF;
  ELSE
    -- Safe creation only if absent
    EXECUTE $cmd$
      CREATE FUNCTION public.handle_updated_at()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $f$
      BEGIN
        new.updated_at = pg_catalog.now();
        RETURN new;
      END;
      $f$;
    $cmd$;
  END IF;
END $$;

-- 1B. public.is_admin() Verification: must have 0 arguments and return boolean
DO $$
DECLARE
  v_exists BOOLEAN;
  v_compatible BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'is_admin'
  ) INTO v_exists;

  IF v_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
        AND p.proname = 'is_admin'
        AND p.pronargs = 0
        AND p.prorettype = 'pg_catalog.bool'::regtype
    ) INTO v_compatible;

    IF NOT v_compatible THEN
      RAISE EXCEPTION 'Preflight Failure: public.is_admin exists with an incompatible signature.';
    END IF;
  ELSE
    -- Safe creation only if absent
    EXECUTE $cmd$
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
    $cmd$;

    REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. CUSTOMER PROFILES TABLE (Safe Creation & Schema Patches)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT, -- Nullable to fully support Phone OTP authentication without email
  phone TEXT,
  village_or_city TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'te')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now()
);

COMMENT ON TABLE public.customer_profiles IS 'Customer account profiles. Customers can view/update only their own profile; active admins can view all.';

-- Safe patch for pre-existing instances: Ensure email is nullable and status column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'customer_profiles' 
      AND column_name = 'email' 
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.customer_profiles ALTER COLUMN email DROP NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'customer_profiles' 
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.customer_profiles 
      ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive'));
  END IF;
END $$;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON public.customer_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_status ON public.customer_profiles(status);

-- ----------------------------------------------------------------------------
-- 3. TABLE PERMISSIONS & ROW LEVEL SECURITY (Least Privilege Model)
-- Profile creation is strictly handled by the SECURITY DEFINER Auth trigger.
-- Authenticated customers are granted SELECT and UPDATE only (no direct INSERT).
-- ----------------------------------------------------------------------------
REVOKE ALL ON public.customer_profiles FROM PUBLIC, anon;
GRANT SELECT, UPDATE ON public.customer_profiles TO authenticated;

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 4. RLS POLICIES
-- ----------------------------------------------------------------------------
-- SELECT: Customers view only their own profile; active admins can view all profiles
DROP POLICY IF EXISTS "Customers view own profile" ON public.customer_profiles;
DROP POLICY IF EXISTS "Customers view own profile or Admin view all" ON public.customer_profiles;
CREATE POLICY "Customers view own profile or Admin view all"
  ON public.customer_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR public.is_admin()
  );

-- Drop any legacy INSERT policy: Direct client INSERT is not permitted
DROP POLICY IF EXISTS "Customers insert own profile" ON public.customer_profiles;

-- UPDATE: Customers can update only their own profile; active admins can update any customer
DROP POLICY IF EXISTS "Customers update own profile" ON public.customer_profiles;
CREATE POLICY "Customers update own profile"
  ON public.customer_profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    id = (SELECT auth.uid())
    OR public.is_admin()
  );

-- ----------------------------------------------------------------------------
-- 5. PROFILE FIELD IMMUTABILITY TRIGGER
-- Blocks non-admins from changing id, email, phone, status, or created_at directly
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_customer_profile_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If invoked by an active admin, allow all mutations (status change, profile updates, etc.)
  IF public.is_admin() THEN
    RETURN new;
  END IF;

  -- For non-admin customers on UPDATE:
  -- Cannot modify profile ID
  IF new.id IS DISTINCT FROM old.id THEN
    RAISE EXCEPTION 'Profile ID cannot be modified';
  END IF;

  -- Cannot modify phone directly (verified via SMS OTP flow only)
  IF new.phone IS DISTINCT FROM old.phone THEN
    RAISE EXCEPTION 'Verified phone number cannot be modified directly. Phone updates must be verified via SMS OTP.';
  END IF;

  -- Cannot modify email directly
  IF new.email IS DISTINCT FROM old.email THEN
    RAISE EXCEPTION 'Customer profile email cannot be modified directly';
  END IF;

  -- Cannot modify account status (only active admins may change customer status)
  IF new.status IS DISTINCT FROM old.status THEN
    RAISE EXCEPTION 'Only active administrators can modify customer account status';
  END IF;

  -- Cannot modify created_at
  IF new.created_at IS DISTINCT FROM old.created_at THEN
    RAISE EXCEPTION 'Account creation timestamp cannot be modified';
  END IF;

  RETURN new;
END;
$$;

REVOKE ALL ON FUNCTION public.check_customer_profile_mutation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_customer_profiles_guard ON public.customer_profiles;
CREATE TRIGGER trg_customer_profiles_guard
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_customer_profile_mutation();

-- ----------------------------------------------------------------------------
-- 6. UPDATED_AT TRIGGER
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_customer_profiles_updated_at ON public.customer_profiles;
CREATE TRIGGER trg_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 7. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS SIGN-UP
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_lang TEXT;
  v_phone TEXT;
  v_name TEXT;
BEGIN
  -- Do not create customer profile for administrative accounts
  -- Check ONLY against public.admin_users (never trust client-supplied raw_user_meta_data)
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE id = new.id) THEN
    RETURN new;
  END IF;

  -- Validate preferred_language strictly against 'en' and 'te'
  v_lang := CASE 
    WHEN new.raw_user_meta_data->>'preferred_language' IN ('en', 'te') 
    THEN new.raw_user_meta_data->>'preferred_language' 
    ELSE 'en' 
  END;

  v_phone := COALESCE(new.phone, new.raw_user_meta_data->>'phone');
  v_name := COALESCE(NULLIF(TRIM(new.raw_user_meta_data->>'full_name'), ''), 'Customer');

  INSERT INTO public.customer_profiles (id, full_name, email, phone, village_or_city, preferred_language, status)
  VALUES (
    new.id,
    v_name,
    new.email,
    v_phone,
    new.raw_user_meta_data->>'village_or_city',
    v_lang,
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    -- Repeated authentication events NEVER overwrite administrator-managed status, created_at, or ID
    full_name = CASE 
      WHEN public.customer_profiles.full_name IS NULL OR public.customer_profiles.full_name = 'Customer' 
      THEN COALESCE(NULLIF(TRIM(EXCLUDED.full_name), 'Customer'), public.customer_profiles.full_name)
      ELSE public.customer_profiles.full_name 
    END,
    phone = COALESCE(public.customer_profiles.phone, EXCLUDED.phone),
    email = COALESCE(public.customer_profiles.email, EXCLUDED.email),
    village_or_city = COALESCE(public.customer_profiles.village_or_city, EXCLUDED.village_or_city),
    preferred_language = COALESCE(public.customer_profiles.preferred_language, EXCLUDED.preferred_language);

  RETURN new;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_customer() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_customer_created ON auth.users;
CREATE TRIGGER on_auth_customer_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_customer();
