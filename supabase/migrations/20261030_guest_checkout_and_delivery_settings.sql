-- ============================================================================
-- SAI DEVEENA TRADERS: GUEST CHECKOUT, DELIVERY SETTINGS & ORDER MANAGEMENT
-- File: supabase/migrations/20261030_guest_checkout_and_delivery_settings.sql
-- Non-destructive, Idempotent, Hardened RLS, Server-Enforced Pricing
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. STORE & DELIVERY SETTINGS TABLE
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

COMMENT ON TABLE public.store_settings IS 'Global store configuration for delivery rules and business contacts. Publicly readable, admin editable.';

-- Insert default settings row if missing
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

-- Permissions on store_settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.store_settings TO authenticated;

-- RLS: Public / anon read-only; Active admins can update/insert
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

-- Updated_at trigger for store_settings
DROP TRIGGER IF EXISTS trg_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER trg_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ----------------------------------------------------------------------------
-- 2. ORDERS TABLE ENHANCEMENTS (SAFE BACKWARD-COMPATIBLE COLUMNS)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  -- Village / Town
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'village_town'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN village_town TEXT;
  END IF;

  -- PIN Code
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'pincode'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN pincode TEXT;
  END IF;

  -- Landmark
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'landmark'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN landmark TEXT;
  END IF;

  -- Delivery Instructions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'delivery_instructions'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN delivery_instructions TEXT;
  END IF;

  -- Idempotency Key (to prevent duplicate submissions)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'idempotency_key'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN idempotency_key TEXT;
  END IF;
END $$;

-- Idempotency unique partial index
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key 
  ON public.orders(idempotency_key) 
  WHERE idempotency_key IS NOT NULL;

-- Update status constraint safely to support all standard lifecycle statuses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN (
  'pending',
  'pending_confirmation',
  'confirmed',
  'processing',
  'ready_for_pickup',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled'
));

-- Sequence permissions for order numbering
GRANT USAGE, SELECT ON SEQUENCE public.order_number_seq TO anon, authenticated;


-- ----------------------------------------------------------------------------
-- 3. SECURE GUEST & AUTHENTICATED ORDER CREATION FUNCTION
-- Features:
--  - Validates all input fields
--  - Prevents duplicates via idempotency_key (returns existing order without error)
--  - Concurrency lock (FOR SHARE) on products to verify price, active & in_stock
--  - Calculates subtotal and fetches dynamic delivery rules from store_settings
--  - Free delivery if subtotal >= free_delivery_threshold (default 199)
--  - Atomically creates order header and item snapshots
--  - Available to anon (guest) and authenticated users
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_guest_order_secure(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_delivery_address TEXT,
  p_village_town TEXT,
  p_pincode TEXT,
  p_items JSONB,
  p_landmark TEXT DEFAULT NULL,
  p_delivery_instructions TEXT DEFAULT NULL,
  p_customer_email TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT 'cash_on_delivery',
  p_order_source TEXT DEFAULT 'web',
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_existing_order RECORD;
  v_order_id UUID;
  v_order_num TEXT;
  v_free_threshold NUMERIC(12,2) := 199.00;
  v_configured_fee NUMERIC(12,2) := 50.00;
  v_delivery_enabled BOOLEAN := true;
  v_calculated_delivery NUMERIC(12,2) := 0;
  v_subtotal NUMERIC(12,2) := 0;
  v_grand_total NUMERIC(12,2) := 0;
  v_item JSONB;
  v_prod_id TEXT;
  v_prod RECORD;
  v_qty INTEGER;
  v_unit_price NUMERIC(12,2);
  v_line_total NUMERIC(12,2);
  v_clean_phone TEXT;
  v_clean_pincode TEXT;
  v_payment_method TEXT;
  v_order_source TEXT;
  v_full_location TEXT;
  v_user_id UUID;
BEGIN
  -- 1. Idempotency Check: prevent duplicate orders if already submitted
  IF p_idempotency_key IS NOT NULL AND pg_catalog.btrim(p_idempotency_key) <> '' THEN
    SELECT id, order_number, subtotal, delivery_charge, total_amount, status
    INTO v_existing_order
    FROM public.orders
    WHERE idempotency_key = pg_catalog.btrim(p_idempotency_key)
    LIMIT 1;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'orderId', v_existing_order.id,
        'orderNumber', v_existing_order.order_number,
        'subtotal', v_existing_order.subtotal,
        'deliveryCharge', v_existing_order.delivery_charge,
        'totalAmount', v_existing_order.total_amount,
        'status', v_existing_order.status,
        'isDuplicate', true
      );
    END IF;
  END IF;

  -- 2. Validate Customer Details
  IF pg_catalog.btrim(COALESCE(p_customer_name, '')) = '' THEN
    RAISE EXCEPTION 'Customer full name is required.';
  END IF;

  v_clean_phone := pg_catalog.regexp_replace(COALESCE(p_customer_phone, ''), '[^0-9]', '', 'g');
  IF pg_catalog.length(v_clean_phone) < 10 THEN
    RAISE EXCEPTION 'A valid 10-digit mobile number is required.';
  END IF;

  IF pg_catalog.btrim(COALESCE(p_delivery_address, '')) = '' THEN
    RAISE EXCEPTION 'Complete delivery address is required.';
  END IF;

  IF pg_catalog.btrim(COALESCE(p_village_town, '')) = '' THEN
    RAISE EXCEPTION 'Village or town is required.';
  END IF;

  v_clean_pincode := pg_catalog.regexp_replace(COALESCE(p_pincode, ''), '[^0-9]', '', 'g');
  IF pg_catalog.length(v_clean_pincode) <> 6 THEN
    RAISE EXCEPTION 'A valid 6-digit PIN code is required.';
  END IF;

  -- Validate Items Array
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one valid product item.';
  END IF;

  -- Payment Method
  v_payment_method := pg_catalog.lower(pg_catalog.btrim(COALESCE(p_payment_method, 'cash_on_delivery')));
  IF v_payment_method NOT IN ('cash_on_delivery', 'upi', 'bank_transfer', 'in_store') THEN
    v_payment_method := 'cash_on_delivery';
  END IF;

  v_order_source := pg_catalog.lower(pg_catalog.btrim(COALESCE(p_order_source, 'web')));
  IF v_order_source NOT IN ('web', 'whatsapp', 'phone', 'in_store') THEN
    v_order_source := 'web';
  END IF;

  -- 3. Fetch Delivery Settings from store_settings
  SELECT 
    COALESCE(free_delivery_threshold, 199.00),
    COALESCE(delivery_fee, 50.00),
    COALESCE(delivery_enabled, true)
  INTO v_free_threshold, v_configured_fee, v_delivery_enabled
  FROM public.store_settings
  WHERE id = 'default'
  LIMIT 1;

  -- 4. Generate Unique Order Number (SDT-YYYYMMDD-SEQ)
  v_order_num := 'SDT-' || pg_catalog.to_char(pg_catalog.now(), 'YYYYMMDD') || '-' || pg_catalog.lpad(pg_catalog.nextval('public.order_number_seq')::TEXT, 4, '0');

  v_full_location := pg_catalog.btrim(p_delivery_address) || ', ' || pg_catalog.btrim(p_village_town) || ' - ' || v_clean_pincode;

  -- Attempt to capture auth uid if available, otherwise null for guest
  v_user_id := (SELECT auth.uid());

  -- 5. Insert initial Order row
  INSERT INTO public.orders (
    order_number,
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    delivery_location,
    village_town,
    pincode,
    landmark,
    delivery_instructions,
    idempotency_key,
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
    v_user_id,
    pg_catalog.btrim(p_customer_name),
    v_clean_phone,
    NULLIF(pg_catalog.btrim(COALESCE(p_customer_email, '')), ''),
    v_full_location,
    pg_catalog.btrim(p_village_town),
    v_clean_pincode,
    NULLIF(pg_catalog.btrim(COALESCE(p_landmark, '')), ''),
    NULLIF(pg_catalog.btrim(COALESCE(p_delivery_instructions, '')), ''),
    NULLIF(pg_catalog.btrim(COALESCE(p_idempotency_key, '')), ''),
    v_order_source,
    'pending',
    v_payment_method,
    'pending',
    0,
    0,
    0,
    0,
    NULLIF(pg_catalog.btrim(COALESCE(p_delivery_instructions, '')), '')
  ) RETURNING id INTO v_order_id;

  -- 6. Validate products, prices, and insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_prod_id := pg_catalog.btrim(COALESCE(v_item->>'productId', v_item->>'id', ''));
    IF v_prod_id = '' THEN
      RAISE EXCEPTION 'Order item is missing a valid product ID.';
    END IF;

    BEGIN
      v_qty := (v_item->>'quantity')::INTEGER;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Invalid quantity format for product "%".', v_prod_id;
    END;

    IF v_qty IS NULL OR v_qty <= 0 OR v_qty > 1000 THEN
      RAISE EXCEPTION 'Invalid quantity for product "%". Must be between 1 and 1000.', v_prod_id;
    END IF;

    -- Concurrency lock on product to verify real db state
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
      RAISE EXCEPTION 'Product "%" is discontinued or inactive.', v_prod.name_en;
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

  -- 7. Calculate server-verified delivery charge
  IF (v_subtotal >= v_free_threshold) OR (NOT v_delivery_enabled) THEN
    v_calculated_delivery := 0.00;
  ELSE
    v_calculated_delivery := v_configured_fee;
  END IF;

  v_grand_total := v_subtotal + v_calculated_delivery;

  -- 8. Finalize order totals
  UPDATE public.orders
  SET 
    subtotal = v_subtotal,
    delivery_charge = v_calculated_delivery,
    total_amount = v_grand_total
  WHERE id = v_order_id;

  RETURN jsonb_build_object(
    'orderId', v_order_id,
    'orderNumber', v_order_num,
    'subtotal', v_subtotal,
    'deliveryCharge', v_calculated_delivery,
    'totalAmount', v_grand_total,
    'status', 'pending',
    'isDuplicate', false
  );
END;
$$;

-- Grant execution to anon and authenticated
REVOKE ALL ON FUNCTION public.create_guest_order_secure(
  TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_guest_order_secure(
  TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO anon, authenticated;


-- ----------------------------------------------------------------------------
-- 4. SECURE ORDER LOOKUP FUNCTION (Guest Status Verification)
-- Allows a customer to verify their own order status using their orderNumber + last 4 phone digits
-- Prevents exposing other customers' data while allowing guest confirmation lookup.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_guest_order_status(
  p_order_number TEXT,
  p_phone_last4 TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order RECORD;
  v_items JSONB;
BEGIN
  IF pg_catalog.btrim(COALESCE(p_order_number, '')) = '' OR pg_catalog.btrim(COALESCE(p_phone_last4, '')) = '' THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE order_number = pg_catalog.btrim(p_order_number)
    AND customer_phone LIKE '%' || pg_catalog.btrim(p_phone_last4)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'productNameEn', product_name_en,
      'productNameTe', product_name_te,
      'quantity', quantity,
      'unitPrice', unit_price,
      'totalPrice', total_price
    )
  ) INTO v_items
  FROM public.order_items
  WHERE order_id = v_order.id;

  RETURN jsonb_build_object(
    'orderNumber', v_order.order_number,
    'customerName', v_order.customer_name,
    'deliveryLocation', v_order.delivery_location,
    'villageTown', v_order.village_town,
    'pincode', v_order.pincode,
    'landmark', v_order.landmark,
    'status', v_order.status,
    'subtotal', v_order.subtotal,
    'deliveryCharge', v_order.delivery_charge,
    'totalAmount', v_order.total_amount,
    'paymentMethod', v_order.payment_method,
    'paymentStatus', v_order.payment_status,
    'createdAt', v_order.created_at,
    'items', COALESCE(v_items, '[]'::jsonb)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_guest_order_status(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_guest_order_status(TEXT, TEXT) TO anon, authenticated;
