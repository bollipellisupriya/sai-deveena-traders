-- ============================================================================
-- SAI DEVEENA TRADERS: CUSTOMER & ORDER MANAGEMENT MIGRATION
-- File: supabase/migrations/20261025_customer_and_order_management.sql
-- Non-destructive, Idempotent, Hardened RLS, Server-Enforced Pricing
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. PREREQUISITE FUNCTIONS & SAFEGUARDS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  new.updated_at = pg_catalog.now();
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = (SELECT auth.uid())
      AND is_active = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ----------------------------------------------------------------------------
-- 1. CUSTOMER PROFILES TABLE (Safe Creation & Non-Destructive Alterations)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT, -- Nullable to safely support phone auth, social auth, or missing emails
  phone TEXT,
  village_or_city TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'te')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now()
);

COMMENT ON TABLE public.customer_profiles IS 'Customer account details. Customers can read and update only their own profile.';

-- Safe schema patch if customer_profiles already pre-existed from an earlier draft:
DO $$
BEGIN
  -- 1A. Make email nullable if it was previously created as NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'customer_profiles' 
      AND column_name = 'email' 
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.customer_profiles ALTER COLUMN email DROP NOT NULL;
  END IF;

  -- 1B. Add status column if it was not present in an earlier draft
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

-- Permissions on customer_profiles
REVOKE ALL ON public.customer_profiles FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE ON public.customer_profiles TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS: Customers can view only their own profile; active admins can view all
DROP POLICY IF EXISTS "Customers view own profile or Admin view all" ON public.customer_profiles;
CREATE POLICY "Customers view own profile or Admin view all"
  ON public.customer_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR public.is_admin()
  );

-- RLS: Customers can insert their own profile on registration with status = 'active' only
DROP POLICY IF EXISTS "Customers insert own profile" ON public.customer_profiles;
CREATE POLICY "Customers insert own profile"
  ON public.customer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (id = (SELECT auth.uid()) AND status = 'active')
    OR public.is_admin()
  );

-- RLS: Customers update own profile, Admins update any
DROP POLICY IF EXISTS "Customers update own profile or Admin update" ON public.customer_profiles;
CREATE POLICY "Customers update own profile or Admin update"
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

-- Guard trigger for customer profile mutation (INSERT & UPDATE)
-- Prevents customers from setting unauthorized status on INSERT, or altering id, email, status, created_at on UPDATE
CREATE OR REPLACE FUNCTION public.check_customer_profile_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If caller is not an active admin, enforce restrictions
  IF NOT public.is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.status IS DISTINCT FROM 'active' THEN
        RAISE EXCEPTION 'Customers can only create accounts with active status.';
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'Cannot change profile ID.';
      END IF;

      IF NEW.email IS DISTINCT FROM OLD.email THEN
        RAISE EXCEPTION 'Email cannot be changed directly in customer profile. Use Auth verification.';
      END IF;

      IF NEW.status IS DISTINCT FROM OLD.status THEN
        RAISE EXCEPTION 'Only administrators can change customer account status.';
      END IF;

      IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'Cannot modify profile creation timestamp.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.check_customer_profile_mutation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_customer_profiles_guard ON public.customer_profiles;
CREATE TRIGGER trg_customer_profiles_guard
  BEFORE INSERT OR UPDATE ON public.customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_customer_profile_mutation();

-- Updated_at Trigger for customer_profiles
DROP TRIGGER IF EXISTS trg_customer_profiles_updated_at ON public.customer_profiles;
CREATE TRIGGER trg_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Automatic Profile Creation on auth.users sign-up (Safe null-email handling)
-- Administrative users from public.admin_users are explicitly excluded to maintain accurate customer metrics
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Do not create customer profile for administrative accounts (in admin_users or role=admin)
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE id = new.id)
     OR (new.raw_user_meta_data->>'role' = 'admin') THEN
    RETURN new;
  END IF;

  INSERT INTO public.customer_profiles (id, full_name, email, phone, village_or_city, preferred_language, status)
  VALUES (
    new.id,
    COALESCE(NULLIF(TRIM(new.raw_user_meta_data->>'full_name'), ''), 'Customer'),
    new.email,
    COALESCE(new.phone, new.raw_user_meta_data->>'phone'),
    new.raw_user_meta_data->>'village_or_city',
    CASE 
      WHEN new.raw_user_meta_data->>'preferred_language' IN ('en', 'te') 
      THEN new.raw_user_meta_data->>'preferred_language' 
      ELSE 'en' 
    END,
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(NULLIF(TRIM(EXCLUDED.full_name), 'Customer'), public.customer_profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, public.customer_profiles.phone),
    email = COALESCE(EXCLUDED.email, public.customer_profiles.email),
    village_or_city = COALESCE(EXCLUDED.village_or_city, public.customer_profiles.village_or_city),
    preferred_language = COALESCE(EXCLUDED.preferred_language, public.customer_profiles.preferred_language);
  RETURN new;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_customer() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_customer_created ON auth.users;
CREATE TRIGGER on_auth_customer_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_customer();



-- ----------------------------------------------------------------------------
-- 2. ORDERS & ORDER ITEMS TABLES
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1001;
GRANT USAGE, SELECT ON SEQUENCE public.order_number_seq TO authenticated;

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for manual/guest phone & WhatsApp orders
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  delivery_location TEXT NOT NULL,
  order_source TEXT NOT NULL DEFAULT 'web' CHECK (order_source IN ('web', 'whatsapp', 'phone', 'in_store')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'confirmed',
    'processing',
    'ready_for_pickup',
    'shipped',
    'delivered',
    'cancelled'
  )),
  payment_method TEXT NOT NULL DEFAULT 'cash_on_delivery' CHECK (payment_method IN (
    'cash_on_delivery',
    'upi',
    'bank_transfer',
    'in_store'
  )),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
    'pending',
    'paid',
    'partially_paid',
    'refunded'
  )),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  delivery_charge NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
  discount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now()
);

COMMENT ON TABLE public.orders IS 'Customer order headers. Isolated by customer_id for customers; fully manageable by active administrators.';

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name_en TEXT NOT NULL,
  product_name_te TEXT,
  brand TEXT,
  pack_size TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 1000),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now()
);

COMMENT ON TABLE public.order_items IS 'Line items for orders, capturing verified historical product pricing and details.';

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Permissions
REVOKE ALL ON public.orders FROM PUBLIC, anon;
GRANT SELECT ON public.orders TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.orders TO authenticated;

REVOKE ALL ON public.order_items FROM PUBLIC, anon;
GRANT SELECT ON public.order_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.order_items TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. ORDERS RLS POLICIES (Strict Customer Isolation & Direct Insert Restriction)
-- ----------------------------------------------------------------------------
-- Customers see only their own orders. Active admins see all.
DROP POLICY IF EXISTS "Customers view own orders or Admin view all" ON public.orders;
CREATE POLICY "Customers view own orders or Admin view all"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id = (SELECT auth.uid())
    OR public.is_admin()
  );

-- Direct INSERT restricted to active admins ONLY.
-- Regular customers MUST use the secure server-side function create_order_secure().
-- This guarantees price validation and prevents bypassing server checks.
DROP POLICY IF EXISTS "Admins direct insert orders" ON public.orders;
CREATE POLICY "Admins direct insert orders"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Customers CANNOT alter placed orders; only active admins can update status or details
DROP POLICY IF EXISTS "Only Admins can update orders" ON public.orders;
CREATE POLICY "Only Admins can update orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Customers CANNOT delete orders; only active admins can delete
DROP POLICY IF EXISTS "Only Admins can delete orders" ON public.orders;
CREATE POLICY "Only Admins can delete orders"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. ORDER ITEMS RLS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "View order items if own order or admin" ON public.order_items;
CREATE POLICY "View order items if own order or admin"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.customer_id = (SELECT auth.uid()) OR public.is_admin())
    )
  );

-- Direct INSERT on order_items restricted to active admins ONLY.
DROP POLICY IF EXISTS "Admins direct insert order items" ON public.order_items;
CREATE POLICY "Admins direct insert order items"
  ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Direct UPDATE/DELETE on order_items restricted to active admins ONLY.
DROP POLICY IF EXISTS "Only Admins modify order items" ON public.order_items;
CREATE POLICY "Only Admins modify order items"
  ON public.order_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Updated_at Trigger for orders
DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ----------------------------------------------------------------------------
-- 5. SECURE SERVER-SIDE ORDER CREATION FUNCTION
-- Concurrency & Inventory Scope Documentation:
--  - Sai Deveena Traders tracks availability using a boolean flag (`in_stock: boolean`).
--  - It does NOT track numerical inventory counts, discrete warehouse quantities,
--    or automatically decrement inventory. It does NOT prevent overselling when
--    multiple concurrent orders are placed.
--  - It strictly enforces that items marked `in_stock = false` cannot be ordered.
--  - The FOR SHARE lock prevents concurrent price edits or in_stock changes
--    midway through active checkout execution.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_order_secure(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_email TEXT,
  p_delivery_location TEXT,
  p_payment_method TEXT,
  p_order_source TEXT,
  p_items JSONB,
  p_notes TEXT DEFAULT NULL,
  p_customer_id UUID DEFAULT NULL -- Admin override for manual phone/WhatsApp orders
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID;
  v_is_admin BOOLEAN;
  v_effective_cust_id UUID;
  v_cust_status TEXT;
  v_order_id UUID;
  v_order_num TEXT;
  v_item JSONB;
  v_prod_id TEXT;
  v_prod RECORD;
  v_qty INTEGER;
  v_unit_price NUMERIC(12,2);
  v_line_total NUMERIC(12,2);
  v_subtotal NUMERIC(12,2) := 0;
  v_delivery NUMERIC(12,2) := 0;
  v_total NUMERIC(12,2) := 0;
  v_payment_method TEXT;
  v_order_source TEXT;
BEGIN
  v_uid := (SELECT auth.uid());
  v_is_admin := public.is_admin();

  -- 1. Authorization check: MUST be an authenticated user (anon calls always rejected)
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create orders.';
  END IF;

  -- 2. Determine effective customer_id and validate account status
  IF v_is_admin THEN
    IF p_customer_id IS NOT NULL THEN
      -- Admin recording order for a registered customer: validate existence & active status
      SELECT status INTO v_cust_status 
      FROM public.customer_profiles 
      WHERE id = p_customer_id;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Specified customer account (ID: %) does not exist.', p_customer_id;
      END IF;

      IF v_cust_status IS DISTINCT FROM 'active' THEN
        IF v_cust_status = 'suspended' THEN
          RAISE EXCEPTION 'Customer account (ID: %) is suspended and cannot place orders.', p_customer_id;
        ELSE
          RAISE EXCEPTION 'Customer account (ID: %) is not active (status: %). Cannot place orders.', p_customer_id, v_cust_status;
        END IF;
      END IF;

      v_effective_cust_id := p_customer_id;
    ELSE
      -- Admin recording a manual offline order (Phone / WhatsApp / Walk-in) for an unregistered guest
      v_effective_cust_id := NULL;
    END IF;
  ELSE
    -- Non-admin customer can ONLY create orders for their own authenticated account
    -- (Any customer_id passed by non-admin is strictly overridden by v_uid)
    v_effective_cust_id := v_uid;

    -- Verify customer profile exists and status = 'active'
    -- Rejects missing profiles, suspended accounts, and inactive accounts
    SELECT status INTO v_cust_status 
    FROM public.customer_profiles 
    WHERE id = v_effective_cust_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Customer profile not found. Please complete profile registration before ordering.';
    END IF;

    IF v_cust_status IS DISTINCT FROM 'active' THEN
      IF v_cust_status = 'suspended' THEN
        RAISE EXCEPTION 'Your customer account has been suspended. Please contact store management.';
      ELSE
        RAISE EXCEPTION 'Your customer account is not active (status: %). Please contact store management.', v_cust_status;
      END IF;
    END IF;
  END IF;

  -- 3. Input Validation
  IF TRIM(COALESCE(p_customer_name, '')) = '' THEN
    RAISE EXCEPTION 'Customer name is required.';
  END IF;

  IF TRIM(COALESCE(p_delivery_location, '')) = '' THEN
    RAISE EXCEPTION 'Delivery location / village is required.';
  END IF;

  -- Validate Payment Method
  v_payment_method := pg_catalog.lower(TRIM(COALESCE(p_payment_method, 'cash_on_delivery')));
  IF v_payment_method NOT IN ('cash_on_delivery', 'upi', 'bank_transfer', 'in_store') THEN
    RAISE EXCEPTION 'Invalid payment method: "%". Allowed: cash_on_delivery, upi, bank_transfer, in_store.', v_payment_method;
  END IF;

  -- Validate Order Source (Customers restricted to 'web')
  IF v_is_admin THEN
    v_order_source := pg_catalog.lower(TRIM(COALESCE(p_order_source, 'web')));
    IF v_order_source NOT IN ('web', 'whatsapp', 'phone', 'in_store') THEN
      v_order_source := 'phone';
    END IF;
  ELSE
    v_order_source := 'web';
  END IF;

  -- 4. Validate Order Items array
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one valid product item.';
  END IF;

  -- Generate human-readable order number: SDT-YYYYMMDD-SEQ
  v_order_num := 'SDT-' || pg_catalog.to_char(pg_catalog.now(), 'YYYYMMDD') || '-' || pg_catalog.lpad(pg_catalog.nextval('public.order_number_seq')::TEXT, 4, '0');

  -- 5. Create Order Header record
  INSERT INTO public.orders (
    order_number,
    customer_id,
    customer_name,
    customer_email,
    customer_phone,
    delivery_location,
    order_source,
    status,
    payment_method,
    payment_status,
    subtotal,
    delivery_charge,
    discount,
    total_amount,
    notes
  ) VALUES (
    v_order_num,
    v_effective_cust_id,
    TRIM(p_customer_name),
    NULLIF(TRIM(COALESCE(p_customer_email, '')), ''),
    NULLIF(TRIM(COALESCE(p_customer_phone, '')), ''),
    TRIM(p_delivery_location),
    v_order_source,
    'pending',
    v_payment_method,
    'pending',
    0,
    v_delivery,
    0,
    0,
    NULLIF(TRIM(COALESCE(p_notes, '')), '')
  )
  RETURNING id INTO v_order_id;

  -- 6. Loop and validate each item against live database with row-level concurrency lock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_prod_id := TRIM(COALESCE(v_item->>'productId', v_item->>'id', ''));
    IF v_prod_id = '' THEN
      RAISE EXCEPTION 'Order item is missing a valid product ID.';
    END IF;

    -- Validate quantity
    BEGIN
      v_qty := (v_item->>'quantity')::INTEGER;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Invalid quantity format for product "%".', v_prod_id;
    END;

    IF v_qty IS NULL OR v_qty <= 0 OR v_qty > 1000 THEN
      RAISE EXCEPTION 'Invalid quantity % for product "%". Must be between 1 and 1000.', v_qty, v_prod_id;
    END IF;

    -- Query public.products with FOR SHARE concurrency lock to prevent mid-transaction alterations
    SELECT 
      id, name_en, name_te, brand, pack_size, price, active, in_stock
    INTO v_prod
    FROM public.products
    WHERE id = v_prod_id
    FOR SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID "%" does not exist in store catalog.', v_prod_id;
    END IF;

    IF v_prod.active IS NOT TRUE THEN
      RAISE EXCEPTION 'Product "%" is currently discontinued or inactive.', v_prod.name_en;
    END IF;

    IF v_prod.in_stock IS NOT TRUE THEN
      RAISE EXCEPTION 'Product "%" is currently out of stock.', v_prod.name_en;
    END IF;

    IF v_prod.price IS NULL OR v_prod.price < 0 THEN
      RAISE EXCEPTION 'Product "%" does not have a valid store price.', v_prod.name_en;
    END IF;

    v_unit_price := v_prod.price;
    v_line_total := v_unit_price * v_qty;
    v_subtotal := v_subtotal + v_line_total;

    -- Insert verified item
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name_en,
      product_name_te,
      brand,
      pack_size,
      quantity,
      unit_price,
      total_price
    ) VALUES (
      v_order_id,
      v_prod.id,
      v_prod.name_en,
      v_prod.name_te,
      v_prod.brand,
      v_prod.pack_size,
      v_qty,
      v_unit_price,
      v_line_total
    );
  END LOOP;

  v_total := v_subtotal + v_delivery;

  -- 7. Update final verified totals
  UPDATE public.orders
  SET 
    subtotal = v_subtotal, 
    total_amount = v_total
  WHERE id = v_order_id;

  RETURN jsonb_build_object(
    'orderId', v_order_id,
    'orderNumber', v_order_num,
    'subtotal', v_subtotal,
    'totalAmount', v_total,
    'status', 'pending'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_secure(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_order_secure(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, UUID) TO authenticated;
