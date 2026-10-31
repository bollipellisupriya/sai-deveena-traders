-- ============================================================================
-- SAI DEVEENA TRADERS & GENERAL STORE
-- File: supabase/migrations/20261031_dynamic_banners_management.sql
-- Complete Dynamic Banner Management System & Storage Configuration
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. BANNERS TABLE DEFINITION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL DEFAULT '',
  title_te TEXT NOT NULL DEFAULT '',
  subtitle_en TEXT NOT NULL DEFAULT '',
  subtitle_te TEXT NOT NULL DEFAULT '',
  image_desktop TEXT NOT NULL,
  image_mobile TEXT,
  button_text_en TEXT NOT NULL DEFAULT 'Shop Now',
  button_text_te TEXT NOT NULL DEFAULT 'ఇప్పుడు చూడండి',
  button_link TEXT NOT NULL DEFAULT '#categories',
  is_active BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now()
);

COMMENT ON TABLE public.banners IS 'Dynamic promotional and category banners displayed on the customer storefront. Admin-managed with scheduling.';

-- ----------------------------------------------------------------------------
-- 2. INDEXES FOR PERFORMANCE & SCHEDULING
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_banners_active_sort
  ON public.banners (is_active, sort_order ASC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_banners_scheduling
  ON public.banners (start_at, end_at)
  WHERE is_active = true;

-- ----------------------------------------------------------------------------
-- 3. UPDATED_AT TRIGGER
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_banners_updated_at ON public.banners;
CREATE TRIGGER trg_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) & ACCESS CONTROL
-- ----------------------------------------------------------------------------
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Revoke dangerous direct permissions from public / anon
REVOKE ALL ON public.banners FROM PUBLIC, anon;

-- Grant selective permissions
GRANT SELECT ON public.banners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.banners TO authenticated;

-- Dynamically drop any pre-existing policies on banners
DO $$
DECLARE
  v_pol RECORD;
BEGIN
  FOR v_pol IN
    SELECT policyname
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'banners'
  LOOP
    EXECUTE pg_catalog.format('DROP POLICY IF EXISTS %I ON public.banners', v_pol.policyname);
  END LOOP;
END $$;

-- Explicitly drop table policies before recreation to prevent duplicate-policy errors
DROP POLICY IF EXISTS "Public can view active scheduled banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can view all banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can insert banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can update banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can delete banners" ON public.banners;

-- Policy 1: Public Storefront can view only active and currently scheduled banners
CREATE POLICY "Public can view active scheduled banners"
  ON public.banners
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND (start_at IS NULL OR start_at <= pg_catalog.now())
    AND (end_at IS NULL OR end_at >= pg_catalog.now())
  );

-- Policy 2: Active Admins can view all banners (including inactive, draft, and expired)
CREATE POLICY "Admins can view all banners"
  ON public.banners
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy 3: Active Admins can create new banners
CREATE POLICY "Admins can insert banners"
  ON public.banners
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Policy 4: Active Admins can update banners
CREATE POLICY "Admins can update banners"
  ON public.banners
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policy 5: Active Admins can delete banners
CREATE POLICY "Admins can delete banners"
  ON public.banners
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. STORAGE BUCKET & POLICIES FOR BANNERS
-- ----------------------------------------------------------------------------
-- Ensure 'banners' bucket exists in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners',
  'banners',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Storage policies for the 'banners' bucket:
-- Match any policies containing 'banner' (singular or plural, case-insensitive)
DO $$
DECLARE
  v_pol RECORD;
BEGIN
  FOR v_pol IN
    SELECT policyname
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname ILIKE '%banner%'
  LOOP
    EXECUTE pg_catalog.format('DROP POLICY IF EXISTS %I ON storage.objects', v_pol.policyname);
  END LOOP;
END $$;

-- Explicitly drop the four storage policies before recreating them
DROP POLICY IF EXISTS "Public can view banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete banner images" ON storage.objects;

-- Anyone can view public banner images
CREATE POLICY "Public can view banner images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'banners');

-- Only admins can upload banner images
CREATE POLICY "Admins can upload banner images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'banners'
    AND public.is_admin()
  );

-- Only admins can update banner images
CREATE POLICY "Admins can update banner images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'banners'
    AND public.is_admin()
  );

-- Only admins can delete banner images
CREATE POLICY "Admins can delete banner images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'banners'
    AND public.is_admin()
  );
