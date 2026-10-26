-- ============================================================================
-- SAI DEVEENA TRADERS: SUPABASE STORAGE BUCKET & RLS POLICIES
-- Target: Supabase Storage
-- Creates 'product-images' bucket for products and categories with hardened RLS
-- ============================================================================

-- 1. Create the bucket in storage.buckets if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[];

-- 2. Storage RLS Policies
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2A. Public Read Access: Anyone (anon and authenticated) can view/download category & product images
DROP POLICY IF EXISTS "Public can view product and category images" ON storage.objects;
CREATE POLICY "Public can view product and category images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- 2B. Admin Uploads: Only active administrators in public.admin_users can upload images
DROP POLICY IF EXISTS "Admins can upload product and category images" ON storage.objects;
CREATE POLICY "Admins can upload product and category images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.is_admin()
  );

-- 2C. Admin Updates: Only active administrators in public.admin_users can update/replace images
DROP POLICY IF EXISTS "Admins can update product and category images" ON storage.objects;
CREATE POLICY "Admins can update product and category images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.is_admin()
  );

-- 2D. Admin Deletions: Only active administrators in public.admin_users can delete images
DROP POLICY IF EXISTS "Admins can delete product and category images" ON storage.objects;
CREATE POLICY "Admins can delete product and category images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.is_admin()
  );
