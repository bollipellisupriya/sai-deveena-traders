-- ============================================================================
-- SAI DEVEENA TRADERS & GENERAL STORE
-- File: supabase/migrations/20261029_foundational_orders_and_store_settings.sql
-- Foundational Migration: Orders, Order Items, Store Settings, and Sequences
--
-- Target Database: Production (sai-deveena-traders)
-- Existing Tables Preserved:
--   - admin_users (preserved, admin authentication untouched)
--   - categories (preserved, product categories untouched)
--   - customer_enquiries (preserved, enquiries untouched)
--   - customer_profiles (preserved, registered accounts untouched)
--   - products (preserved, catalog records untouched)
--
-- Objects Established by this Foundational Migration:
--   1. Sequence: public.order_number_seq
--   2. Table: public.store_settings (Threshold: ₹199, Delivery Fee: ₹50)
--   3. Table: public.orders (All columns for customer, guest & admin workflows)
--   4. Table: public.order_items (Line items with snapshot prices & product keys)
--   5. Indexes: Unique idempotency, guest token, status, and performance indexes
--   6. RLS Policies: Customer isolation, admin management, zero anon table access
--   7. RPC: public.create_order_secure() for authenticated customers & admin orders
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

-- Ensure is_admin() function exists and uses existing admin_users table
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
-- 1. ORDER NUMBER SEQUENCE
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1001;
REVOKE ALL ON SEQUENCE public.order_number_seq FROM PUBLIC, anon;
GRANT USAGE, SELECT ON SEQUENCE public.order_number_seq TO authenticated;


-- ----------------------------------------------------------------------------
-- 2. STORE SETTINGS TABLE (Configurable Delivery Fee & Threshold)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  free_delivery_threshold NUMERIC(12,2) NOT NULL DEFAULT 199.00 CHECK (free_delivery_threshold >= 0),
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 50.00 CHECK (delivery_fee >= 0),
  delivery_enabled BOOLEAN NOT NULL DEFAULT true,
  business_whatsapp_number TEXT NOT NULL DEFAULT '919010454541',
  created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now()
);

COMMENT ON TABLE public.store_settings IS 'Global store settings for delivery rules and business WhatsApp contact. Publicly readable, admin editable.';

-- Seed default store configuration (free delivery at ₹199, fee ₹50, enabled)
INSERT INTO public.store_settings (
  id,
  free_delivery_threshold,
  delivery_fee,
  delivery_enabled,
  business_whatsapp_number
) VALUES (
  'default',
  199.00,
  50.00,
  true,
  '919010454541'
) ON CONFLICT (id) DO NOTHING;

-- Trigger to maintain updated_at on store_settings
DROP TRIGGER IF EXISTS trg_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER trg_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS & Permissions for store_settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.store_settings FROM PUBLIC, anon;
REVOKE DELETE ON public.store_settings FROM authenticated;
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.store_settings TO authenticated;

DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings"
  ON public.store_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can update store settings" ON public.store_settings;
CREATE POLICY "Admins can update store settings"
  ON public.store_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert store settings" ON public.store_settings;
CREATE POLICY "Admins can insert store settings"
  ON public.store_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());


-- ----------------------------------------------------------------------------
-- 3. ORDERS TABLE (Full Schema Matching Frontend & Guest Checkout)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for guest checkouts & offline orders
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  delivery_location TEXT NOT NULL,
  village_town TEXT,
  pincode TEXT,
  landmark TEXT,
  delivery_instructions TEXT,
  idempotency_key TEXT,
  idempotency_hash TEXT,
  retry_secret_hash TEXT,
  guest_access_token TEXT,
  order_source TEXT NOT NULL DEFAULT 'web' CHECK (order_source IN ('web', 'whatsapp', 'phone', 'in_store')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'pending_confirmation',
    'confirmed',
    'processing',
    'ready_for_pickup',
    'shipped',
    'out_for_delivery',
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
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  delivery_charge NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (delivery_charge >= 0),
  discount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now()
);

COMMENT ON TABLE public.orders IS 'Master order records supporting registered customers, guest checkout, and admin orders.';

-- Trigger to maintain updated_at on orders
DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for performance & idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key 
  ON public.orders(idempotency_key) 
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_guest_access_token 
  ON public.orders(guest_access_token) 
  WHERE guest_access_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);


-- ----------------------------------------------------------------------------
-- 4. ORDER ITEMS TABLE (Snapshot Product Pricing & Foreign Key)
-- ----------------------------------------------------------------------------
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

COMMENT ON TABLE public.order_items IS 'Line items for orders capturing verified historical product pricing and details.';

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);


-- ----------------------------------------------------------------------------
-- 5. PERMISSIONS & ROW LEVEL SECURITY LOCKDOWN
-- ----------------------------------------------------------------------------
-- Strictly revoke direct access from PUBLIC and anonymous users
REVOKE ALL ON public.orders FROM PUBLIC, anon;
REVOKE ALL ON public.order_items FROM PUBLIC, anon;

-- Grant access to authenticated users (governed by RLS policies below)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 5A. Orders RLS Policies
-- Registered customers can view only their own orders (customer_id = auth.uid()).
-- Active administrators can view all orders.
-- Guest orders (customer_id IS NULL) are protected from all direct table access.
DROP POLICY IF EXISTS "Customers view own orders or Admin view all" ON public.orders;
CREATE POLICY "Customers view own orders or Admin view all"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id = (SELECT auth.uid())
    OR public.is_admin()
  );

-- Direct table INSERT is restricted to admins only.
-- Regular customers and guests must use secure RPC functions (create_order_secure / create_guest_order_secure).
DROP POLICY IF EXISTS "Admins direct insert orders" ON public.orders;
CREATE POLICY "Admins direct insert orders"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admins can modify existing order records
DROP POLICY IF EXISTS "Only Admins can update orders" ON public.orders;
CREATE POLICY "Only Admins can update orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete order records
DROP POLICY IF EXISTS "Only Admins can delete orders" ON public.orders;
CREATE POLICY "Only Admins can delete orders"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 5B. Order Items RLS Policies
-- Customers can view order items belonging to their own orders. Admins can view all.
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

DROP POLICY IF EXISTS "Admins insert order items" ON public.order_items;
CREATE POLICY "Admins insert order items"
  ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins update order items" ON public.order_items;
CREATE POLICY "Admins update order items"
  ON public.order_items
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins delete order items" ON public.order_items;
CREATE POLICY "Admins delete order items"
  ON public.order_items
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ----------------------------------------------------------------------------
-- 6. AUTHENTICATED SECURE ORDER CREATION FUNCTION
-- Used by orderService.createOrderSecure() for registered customers & admin orders
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
  p_customer_id UUID DEFAULT NULL
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
  v_free_threshold NUMERIC(12,2) := 199.00;
  v_configured_fee NUMERIC(12,2) := 50.00;
  v_delivery_enabled BOOLEAN := true;
BEGIN
  v_uid := (SELECT auth.uid());
  v_is_admin := public.is_admin();

  -- 1. Authorization: caller must be authenticated
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create orders.' USING ERRCODE = '42501';
  END IF;

  -- 2. Determine effective customer_id and validate account status
  IF v_is_admin THEN
    IF p_customer_id IS NOT NULL THEN
      SELECT status INTO v_cust_status 
      FROM public.customer_profiles 
      WHERE id = p_customer_id;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Specified customer account (ID: %) does not exist.', p_customer_id USING ERRCODE = 'P0002';
      END IF;

      IF v_cust_status IS DISTINCT FROM 'active' THEN
        RAISE EXCEPTION 'Customer account (ID: %) is not active (status: %). Cannot place orders.', p_customer_id, v_cust_status USING ERRCODE = 'P0002';
      END IF;

      v_effective_cust_id := p_customer_id;
    ELSE
      v_effective_cust_id := NULL;
    END IF;
  ELSE
    v_effective_cust_id := v_uid;

    SELECT status INTO v_cust_status 
    FROM public.customer_profiles 
    WHERE id = v_effective_cust_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Customer profile not found. Please complete profile registration before ordering.' USING ERRCODE = 'P0002';
    END IF;

    IF v_cust_status IS DISTINCT FROM 'active' THEN
      RAISE EXCEPTION 'Your customer account is not active (status: %). Please contact store management.', v_cust_status USING ERRCODE = 'P0002';
    END IF;
  END IF;

  -- 3. Input Validation
  IF pg_catalog.btrim(COALESCE(p_customer_name, '')) = '' THEN
    RAISE EXCEPTION 'Customer name is required.' USING ERRCODE = 'P0002';
  END IF;

  IF pg_catalog.btrim(COALESCE(p_delivery_location, '')) = '' THEN
    RAISE EXCEPTION 'Delivery location is required.' USING ERRCODE = 'P0002';
  END IF;

  v_payment_method := pg_catalog.lower(pg_catalog.btrim(COALESCE(p_payment_method, 'cash_on_delivery')));
  IF v_payment_method NOT IN ('cash_on_delivery', 'upi', 'bank_transfer', 'in_store') THEN
    RAISE EXCEPTION 'Invalid payment method: "%".', v_payment_method USING ERRCODE = 'P0002';
  END IF;

  IF v_is_admin THEN
    v_order_source := pg_catalog.lower(pg_catalog.btrim(COALESCE(p_order_source, 'web')));
    IF v_order_source NOT IN ('web', 'whatsapp', 'phone', 'in_store') THEN
      v_order_source := 'phone';
    END IF;
  ELSE
    v_order_source := 'web';
  END IF;

  -- 4. Check Store Delivery Settings
  SELECT 
    COALESCE(free_delivery_threshold, 199.00),
    COALESCE(delivery_fee, 50.00),
    COALESCE(delivery_enabled, true)
  INTO v_free_threshold, v_configured_fee, v_delivery_enabled
  FROM public.store_settings
  WHERE id = 'default'
  LIMIT 1;

  IF NOT FOUND OR v_delivery_enabled IS NULL THEN
    v_free_threshold := 199.00;
    v_configured_fee := 50.00;
    v_delivery_enabled := true;
  END IF;

  IF NOT v_delivery_enabled AND NOT v_is_admin THEN
    RAISE EXCEPTION 'Online delivery is currently disabled. Please contact the store directly via WhatsApp or phone.' USING ERRCODE = 'P0001';
  END IF;

  -- 5. Validate Order Items Array
  IF p_items IS NULL OR pg_catalog.jsonb_typeof(p_items) <> 'array' OR pg_catalog.jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one valid product item.' USING ERRCODE = 'P0002';
  END IF;

  -- Generate human-readable order number: SDT-YYYYMMDD-SEQ
  v_order_num := 'SDT-' || pg_catalog.to_char(pg_catalog.now(), 'YYYYMMDD') || '-' || pg_catalog.lpad(pg_catalog.nextval('public.order_number_seq')::TEXT, 4, '0');

  -- 6. Insert Order Header
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
    pg_catalog.btrim(p_customer_name),
    NULLIF(pg_catalog.btrim(COALESCE(p_customer_email, '')), ''),
    NULLIF(pg_catalog.btrim(COALESCE(p_customer_phone, '')), ''),
    pg_catalog.btrim(p_delivery_location),
    v_order_source,
    'pending',
    v_payment_method,
    'pending',
    0,
    0,
    0,
    0,
    NULLIF(pg_catalog.btrim(COALESCE(p_notes, '')), '')
  ) RETURNING id INTO v_order_id;

  -- 7. Validate Items & Insert Order Items with FOR SHARE Lock
  FOR v_item IN SELECT * FROM pg_catalog.jsonb_array_elements(p_items)
  LOOP
    v_prod_id := pg_catalog.btrim(COALESCE(v_item->>'productId', v_item->>'id', ''));
    IF v_prod_id = '' THEN
      RAISE EXCEPTION 'Order item is missing a valid product ID.' USING ERRCODE = 'P0002';
    END IF;

    BEGIN
      v_qty := (v_item->>'quantity')::INTEGER;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Invalid quantity format for product "%".', v_prod_id USING ERRCODE = 'P0002';
    END;

    IF v_qty IS NULL OR v_qty <= 0 OR v_qty > 1000 THEN
      RAISE EXCEPTION 'Invalid quantity % for product "%". Must be between 1 and 1000.', v_qty, v_prod_id USING ERRCODE = 'P0002';
    END IF;

    SELECT 
      id, name_en, name_te, brand, pack_size, price, active, in_stock
    INTO v_prod
    FROM public.products
    WHERE id = v_prod_id
    FOR SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID "%" does not exist in store catalog.', v_prod_id USING ERRCODE = 'P0002';
    END IF;

    IF v_prod.active IS NOT TRUE THEN
      RAISE EXCEPTION 'Product "%" is currently discontinued or inactive.', v_prod.name_en USING ERRCODE = 'P0002';
    END IF;

    IF v_prod.in_stock IS NOT TRUE THEN
      RAISE EXCEPTION 'Product "%" is currently out of stock.', v_prod.name_en USING ERRCODE = 'P0002';
    END IF;

    IF v_prod.price IS NULL OR v_prod.price < 0 THEN
      RAISE EXCEPTION 'Product "%" does not have a valid store price.', v_prod.name_en USING ERRCODE = 'P0002';
    END IF;

    v_unit_price := v_prod.price;
    v_line_total := v_unit_price * v_qty;
    v_subtotal := v_subtotal + v_line_total;

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

  -- 8. Calculate Final Delivery Charge & Update Order Header
  IF v_subtotal >= v_free_threshold THEN
    v_delivery := 0.00;
  ELSE
    v_delivery := v_configured_fee;
  END IF;

  v_total := v_subtotal + v_delivery;

  UPDATE public.orders
  SET 
    subtotal = v_subtotal,
    delivery_charge = v_delivery,
    total_amount = v_total
  WHERE id = v_order_id;

  RETURN pg_catalog.jsonb_build_object(
    'orderId', v_order_id,
    'orderNumber', v_order_num,
    'subtotal', v_subtotal,
    'deliveryCharge', v_delivery,
    'totalAmount', v_total,
    'status', 'pending'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_secure(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_order_secure(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, UUID) TO authenticated;
