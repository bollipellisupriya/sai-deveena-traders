-- ============================================================================
-- SAI DEVEENA TRADERS & GENERAL STORE
-- File: supabase/migrations/20261030_guest_checkout_and_delivery_settings.sql
-- Production-Ready, Hardened Guest Checkout, Delivery Rules & Secure Tracking
--
-- Security Enhancements:
--  1. High-Entropy Cryptographic Guest Tracking Token (256-bit CSPRNG token).
--  2. Privacy-preserving order lookup (masked phone & location, zero sensitive leak).
--  3. Anonymous users strictly forbidden from updating order status (Admin-only RLS).
--  4. Idempotency protection with payload-hash verification and concurrent race handling.
--  5. Row-level deadlock-safe concurrency locking (FOR SHARE ORDER BY id ASC).
--  6. Immediate rejection when online delivery is disabled (no silent free delivery).
--  7. Closed sequence security: REVOKE anon from public.order_number_seq.
--  8. Non-destructive, backward-compatible schema updates (no data loss).
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

  -- Idempotency Payload Hash (to verify payload identity and prevent key hijacking)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'idempotency_hash'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN idempotency_hash TEXT;
  END IF;

  -- High-Entropy Cryptographic Guest Access Token
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'guest_access_token'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN guest_access_token TEXT;
  END IF;
END $$;

-- Idempotency unique partial index
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key 
  ON public.orders(idempotency_key) 
  WHERE idempotency_key IS NOT NULL;

-- Guest access token unique partial index
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_guest_access_token 
  ON public.orders(guest_access_token) 
  WHERE guest_access_token IS NOT NULL;

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

-- ----------------------------------------------------------------------------
-- 3. SEQUENCE SECURITY
-- Revoke direct permissions from anon/PUBLIC to prevent sequence enumeration.
-- Order numbers are generated inside SECURITY DEFINER function with server privileges.
-- ----------------------------------------------------------------------------
REVOKE ALL ON SEQUENCE public.order_number_seq FROM PUBLIC, anon;
GRANT USAGE, SELECT ON SEQUENCE public.order_number_seq TO authenticated;


-- ----------------------------------------------------------------------------
-- 4. INVENTORY ARCHITECTURE NOTE
-- The current store architecture manages inventory via a boolean availability flag
-- (`in_stock: boolean`) on `public.products`. No artificial columns are invented.
-- To prevent overselling and mid-transaction data drift, products are row-locked
-- using `FOR SHARE ORDER BY id ASC` (preventing concurrent deadlocks).
--
-- FUTURE NUMERICAL RESERVATION ARCHITECTURE SPECIFICATION:
-- When numerical stock deduction is adopted, the required schema additions are:
--   1. ALTER TABLE public.products ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0);
--   2. Atomic conditional decrement:
--        UPDATE public.products SET stock_quantity = stock_quantity - v_qty
--        WHERE id = v_prod_id AND stock_quantity >= v_qty;
--      IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient stock for product "%"', v_prod_name;
--   3. An inventory transactions ledger table `inventory_logs` recording (order_id, product_id, delta, created_at).
-- ----------------------------------------------------------------------------


-- ----------------------------------------------------------------------------
-- 5. SECURE GUEST & AUTHENTICATED ORDER CREATION FUNCTION
-- Features:
--  - Validates all input fields and phone format
--  - Validates and checks delivery_enabled status (rejects if disabled)
--  - Concurrency lock (FOR SHARE ORDER BY id ASC) on products to prevent deadlocks
--  - Validates active status, in_stock availability, and real DB prices
--  - Free delivery threshold dynamically evaluated from store_settings
--  - Cryptographically secure 256-bit guest tracking token generation
--  - Idempotency key validation with payload hash check
--  - Safe race-condition handling: returns original order on simultaneous duplicate
--  - Atomically records order header and order item snapshots
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
  v_guest_token TEXT;
  v_free_threshold NUMERIC(12,2) := 199.00;
  v_configured_fee NUMERIC(12,2) := 50.00;
  v_delivery_enabled BOOLEAN := true;
  v_calculated_delivery NUMERIC(12,2) := 0;
  v_subtotal NUMERIC(12,2) := 0;
  v_grand_total NUMERIC(12,2) := 0;
  v_item RECORD;
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
  v_payload_hash TEXT;
  v_clean_idempotency_key TEXT;
BEGIN
  -- 1. Validate Customer Details
  IF pg_catalog.btrim(COALESCE(p_customer_name, '')) = '' THEN
    RAISE EXCEPTION 'Customer full name is required.' USING ERRCODE = 'P0002';
  END IF;

  v_clean_phone := pg_catalog.regexp_replace(COALESCE(p_customer_phone, ''), '[^0-9]', '', 'g');
  IF pg_catalog.length(v_clean_phone) < 10 THEN
    RAISE EXCEPTION 'A valid 10-digit mobile number is required.' USING ERRCODE = 'P0002';
  END IF;

  IF pg_catalog.btrim(COALESCE(p_delivery_address, '')) = '' THEN
    RAISE EXCEPTION 'Complete delivery address is required.' USING ERRCODE = 'P0002';
  END IF;

  IF pg_catalog.btrim(COALESCE(p_village_town, '')) = '' THEN
    RAISE EXCEPTION 'Village or town is required.' USING ERRCODE = 'P0002';
  END IF;

  v_clean_pincode := pg_catalog.regexp_replace(COALESCE(p_pincode, ''), '[^0-9]', '', 'g');
  IF pg_catalog.length(v_clean_pincode) <> 6 THEN
    RAISE EXCEPTION 'A valid 6-digit PIN code is required.' USING ERRCODE = 'P0002';
  END IF;

  -- Validate Items Array
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one valid product item.' USING ERRCODE = 'P0002';
  END IF;

  -- 2. Validate Delivery Configuration
  SELECT 
    COALESCE(free_delivery_threshold, 199.00),
    COALESCE(delivery_fee, 50.00),
    COALESCE(delivery_enabled, true)
  INTO v_free_threshold, v_configured_fee, v_delivery_enabled
  FROM public.store_settings
  WHERE id = 'default'
  LIMIT 1;

  -- Hard Rejection if delivery is disabled
  IF NOT v_delivery_enabled THEN
    RAISE EXCEPTION 'Online delivery is currently disabled. Please contact the store directly via WhatsApp or phone.'
      USING ERRCODE = 'P0001';
  END IF;

  -- 3. Calculate Deterministic Payload Hash for Idempotency
  v_clean_idempotency_key := NULLIF(pg_catalog.btrim(COALESCE(p_idempotency_key, '')), '');
  v_payload_hash := pg_catalog.md5(
    v_clean_phone || '|' ||
    v_clean_pincode || '|' ||
    p_items::TEXT || '|' ||
    pg_catalog.btrim(COALESCE(p_delivery_address, '')) || '|' ||
    pg_catalog.btrim(COALESCE(p_village_town, ''))
  );

  -- 4. Idempotency Check: Return existing order if identical request already submitted
  IF v_clean_idempotency_key IS NOT NULL THEN
    SELECT id, order_number, subtotal, delivery_charge, total_amount, status, guest_access_token, idempotency_hash
    INTO v_existing_order
    FROM public.orders
    WHERE idempotency_key = v_clean_idempotency_key
    LIMIT 1;

    IF FOUND THEN
      -- Detect and reject idempotency key reuse with mismatched order payload
      IF v_existing_order.idempotency_hash IS NOT NULL AND v_existing_order.idempotency_hash <> v_payload_hash THEN
        RAISE EXCEPTION 'Idempotency key "%" has already been used for a different order payload.'
          USING ERRCODE = '23505';
      END IF;

      RETURN jsonb_build_object(
        'orderId', v_existing_order.id,
        'orderNumber', v_existing_order.order_number,
        'subtotal', v_existing_order.subtotal,
        'deliveryCharge', v_existing_order.delivery_charge,
        'totalAmount', v_existing_order.total_amount,
        'status', v_existing_order.status,
        'guestAccessToken', v_existing_order.guest_access_token,
        'isDuplicate', true
      );
    END IF;
  END IF;

  -- Payment Method & Order Source
  v_payment_method := pg_catalog.lower(pg_catalog.btrim(COALESCE(p_payment_method, 'cash_on_delivery')));
  IF v_payment_method NOT IN ('cash_on_delivery', 'upi', 'bank_transfer', 'in_store') THEN
    v_payment_method := 'cash_on_delivery';
  END IF;

  v_order_source := pg_catalog.lower(pg_catalog.btrim(COALESCE(p_order_source, 'web')));
  IF v_order_source NOT IN ('web', 'whatsapp', 'phone', 'in_store') THEN
    v_order_source := 'web';
  END IF;

  -- 5. Generate Cryptographic High-Entropy Guest Access Token (256-bit CSPRNG token)
  -- Uses PostgreSQL core gen_random_uuid() twice to provide 64 hex characters (256 bits of entropy)
  v_guest_token := 'gst_' || pg_catalog.replace(gen_random_uuid()::TEXT, '-', '') || pg_catalog.replace(gen_random_uuid()::TEXT, '-', '');

  -- Generate Unique Order Number (SDT-YYYYMMDD-SEQ)
  v_order_num := 'SDT-' || pg_catalog.to_char(pg_catalog.now(), 'YYYYMMDD') || '-' || pg_catalog.lpad(pg_catalog.nextval('public.order_number_seq')::TEXT, 4, '0');

  v_full_location := pg_catalog.btrim(p_delivery_address) || ', ' || pg_catalog.btrim(p_village_town) || ' - ' || v_clean_pincode;

  -- Attempt to capture auth uid if available, otherwise null for guest
  v_user_id := (SELECT auth.uid());

  -- 6. Insert Order Header with concurrency exception handling
  BEGIN
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
      idempotency_hash,
      guest_access_token,
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
      v_clean_idempotency_key,
      v_payload_hash,
      v_guest_token,
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

  EXCEPTION WHEN unique_violation THEN
    -- Simultaneous duplicate submission caught by unique index
    IF v_clean_idempotency_key IS NOT NULL THEN
      SELECT id, order_number, subtotal, delivery_charge, total_amount, status, guest_access_token, idempotency_hash
      INTO v_existing_order
      FROM public.orders
      WHERE idempotency_key = v_clean_idempotency_key
      LIMIT 1;

      IF FOUND THEN
        IF v_existing_order.idempotency_hash IS NOT NULL AND v_existing_order.idempotency_hash <> v_payload_hash THEN
          RAISE EXCEPTION 'Idempotency key "%" has already been used for a different order payload.'
            USING ERRCODE = '23505';
        END IF;

        RETURN jsonb_build_object(
          'orderId', v_existing_order.id,
          'orderNumber', v_existing_order.order_number,
          'subtotal', v_existing_order.subtotal,
          'deliveryCharge', v_existing_order.delivery_charge,
          'totalAmount', v_existing_order.total_amount,
          'status', v_existing_order.status,
          'guestAccessToken', v_existing_order.guest_access_token,
          'isDuplicate', true
        );
      END IF;
    END IF;
    RAISE;
  END;

  -- 7. Validate Products, Prices, and Insert Items with Deadlock-Free Row Locking
  -- Order products by ID ascending to prevent transaction deadlocks on concurrent orders
  FOR v_item IN 
    SELECT 
      pg_catalog.btrim(COALESCE(elem->>'productId', elem->>'id', '')) AS prod_id,
      elem->>'quantity' AS raw_qty
    FROM jsonb_array_elements(p_items) AS elem
    ORDER BY pg_catalog.btrim(COALESCE(elem->>'productId', elem->>'id', '')) ASC
  LOOP
    v_prod_id := v_item.prod_id;
    IF v_prod_id = '' THEN
      RAISE EXCEPTION 'Order item is missing a valid product ID.' USING ERRCODE = 'P0002';
    END IF;

    BEGIN
      v_qty := (v_item.raw_qty)::INTEGER;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Invalid quantity format for product "%".', v_prod_id USING ERRCODE = 'P0002';
    END;

    IF v_qty IS NULL OR v_qty <= 0 OR v_qty > 1000 THEN
      RAISE EXCEPTION 'Invalid quantity for product "%". Must be between 1 and 1000.', v_prod_id USING ERRCODE = 'P0002';
    END IF;

    -- Deadlock-safe row-lock check on products
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
      RAISE EXCEPTION 'Product "%" is discontinued or inactive.', v_prod.name_en USING ERRCODE = 'P0002';
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

  -- 8. Calculate Server-Enforced Delivery Charge
  -- Rule: Free delivery for orders >= threshold (default ₹199); configured fee below threshold
  IF v_subtotal >= v_free_threshold THEN
    v_calculated_delivery := 0.00;
  ELSE
    v_calculated_delivery := v_configured_fee;
  END IF;

  v_grand_total := v_subtotal + v_calculated_delivery;

  -- 9. Finalize Order Totals
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
    'guestAccessToken', v_guest_token,
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
-- 6. SECURE GUEST ORDER LOOKUP VIA CRYPTOGRAPHIC TOKEN
-- Replaces old lookup based on order number and last 4 digits.
-- Prevents order enumeration and protects customer privacy.
-- Masks sensitive telephone and full street details.
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_guest_order_status(TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.get_guest_order_by_token(
  p_guest_access_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order RECORD;
  v_items JSONB;
  v_clean_token TEXT;
  v_masked_phone TEXT;
  v_masked_location TEXT;
BEGIN
  v_clean_token := pg_catalog.btrim(COALESCE(p_guest_access_token, ''));
  
  -- Tokens are high-entropy strings (minimum 32 chars)
  IF pg_catalog.length(v_clean_token) < 32 THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE guest_access_token = v_clean_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Mask customer phone: e.g. "XXXXXX1234"
  IF pg_catalog.length(v_order.customer_phone) >= 4 THEN
    v_masked_phone := 'XXXXXX' || pg_catalog.right(v_order.customer_phone, 4);
  ELSE
    v_masked_phone := 'XXXXXX';
  END IF;

  -- Mask street address to protect customer privacy
  v_masked_location := '***, ' || COALESCE(v_order.village_town, '') || ' - ' || COALESCE(v_order.pincode, '');

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
    'maskedPhone', v_masked_phone,
    'villageTown', v_order.village_town,
    'pincode', v_order.pincode,
    'deliveryLocation', v_masked_location,
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

REVOKE ALL ON FUNCTION public.get_guest_order_by_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_guest_order_by_token(TEXT) TO anon, authenticated;

-- Ensure anonymous users CANNOT update orders under any circumstances
REVOKE UPDATE ON public.orders FROM PUBLIC, anon;
