-- ============================================================================
-- SAI DEVEENA TRADERS & GENERAL STORE
-- File: supabase/migrations/20261030_guest_checkout_and_delivery_settings.sql
-- Production-Ready, Hardened Guest Checkout, Delivery Rules & Secure Tracking
--
-- Security Audit & Compatibility Hardening:
--  1. pgcrypto failure halts migration with clear exception (no silent ignore).
--  2. Dynamic resolution of pgcrypto schema: search_path locked to strictly
--     the extension's namespace + pg_catalog, preventing object substitution.
--  3. Internal crypto helpers: created via separate dynamic format statements;
--     REVOKED from PUBLIC, anon, and authenticated. Callable internally by
--     SECURITY DEFINER order creation function under function owner.
--  4. Idempotency hash: Deterministic Normalized JSONB payload with SHA-256,
--     including normalized order_source and all customer and line item fields.
--  5. Two-phase verification: Validates all products, active status, in_stock,
--     and prices BEFORE inserting order header. Fully atomic transaction.
--  6. Production orders.status constraint preserves all 7 existing valid statuses:
--     'pending', 'confirmed', 'processing', 'ready_for_pickup', 'shipped',
--     'delivered', 'cancelled', plus 'pending_confirmation' and 'out_for_delivery'.
--  7. public.categories, category images, and admin authentication remain untouched.
--  8. Strict RLS and privilege lockdown: anon cannot read, write, or delete orders.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. CRYPTOGRAPHIC EXTENSION SETUP & HARDENED WRAPPERS
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_ext_schema TEXT;
BEGIN
  -- 0A. Verify or install pgcrypto extension; fail loudly if unavailable
  SELECT n.nspname INTO v_ext_schema
  FROM pg_catalog.pg_extension e
  JOIN pg_catalog.pg_namespace n ON e.extnamespace = n.oid
  WHERE e.extname = 'pgcrypto';

  IF v_ext_schema IS NULL THEN
    BEGIN
      CREATE EXTENSION pgcrypto WITH SCHEMA extensions;
      v_ext_schema := 'extensions';
    EXCEPTION WHEN OTHERS THEN
      BEGIN
        CREATE EXTENSION pgcrypto WITH SCHEMA public;
        v_ext_schema := 'public';
      EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Prerequisite Failure: pgcrypto extension is required but could not be installed: %', SQLERRM;
      END;
    END;
  END IF;

  -- 0B. Dynamically define crypto_gen_random_bytes with search_path restricted
  -- EXCLUSIVELY to the extension namespace and pg_catalog (prevents object substitution)
  EXECUTE pg_catalog.format($func$
    CREATE OR REPLACE FUNCTION public.crypto_gen_random_bytes(p_len INTEGER)
    RETURNS BYTEA
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = %I, pg_catalog
    AS $f$
    BEGIN
      RETURN gen_random_bytes(p_len);
    END;
    $f$;
  $func$, v_ext_schema);

  -- 0C. Dynamically define crypto_sha256_hex with search_path restricted
  -- EXCLUSIVELY to the extension namespace and pg_catalog (prevents object substitution)
  EXECUTE pg_catalog.format($func$
    CREATE OR REPLACE FUNCTION public.crypto_sha256_hex(p_input TEXT)
    RETURNS TEXT
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = %I, pg_catalog
    AS $f$
    BEGIN
      RETURN encode(digest(p_input, 'sha256'), 'hex');
    END;
    $f$;
  $func$, v_ext_schema);
END $$;

-- Revoke execute from external API roles so they cannot be invoked via PostgREST RPC.
-- Usable internally by SECURITY DEFINER order creation.
REVOKE ALL ON FUNCTION public.crypto_gen_random_bytes(INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.crypto_sha256_hex(TEXT) FROM PUBLIC, anon, authenticated;


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

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.store_settings FROM PUBLIC, anon;
REVOKE DELETE ON public.store_settings FROM authenticated;
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.store_settings TO authenticated;

-- Dynamically drop any pre-existing policies on store_settings so no permissive policy allows non-admin writes
DO $$
DECLARE
  v_pol RECORD;
BEGIN
  FOR v_pol IN
    SELECT policyname
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'store_settings'
  LOOP
    EXECUTE pg_catalog.format('DROP POLICY IF EXISTS %I ON public.store_settings', v_pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Public can view store settings"
  ON public.store_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update store settings"
  ON public.store_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can insert store settings"
  ON public.store_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

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
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'village_town'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN village_town TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'pincode'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN pincode TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'landmark'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN landmark TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'delivery_instructions'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN delivery_instructions TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'idempotency_key'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN idempotency_key TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'idempotency_hash'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN idempotency_hash TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'guest_access_token'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN guest_access_token TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'retry_secret_hash'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN retry_secret_hash TEXT;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key 
  ON public.orders(idempotency_key) 
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_guest_access_token 
  ON public.orders(guest_access_token) 
  WHERE guest_access_token IS NOT NULL;


-- ----------------------------------------------------------------------------
-- 3. STATUS CONSTRAINT SAFE PRESERVATION
-- Dynamically finds and drops any pre-existing CHECK constraints on public.orders
-- that evaluate the order 'status' column (e.g. orders_status_check, etc.)
-- without touching unrelated constraints such as 'payment_status'.
-- Preserves ALL 7 historical statuses:
--   'pending', 'confirmed', 'processing', 'ready_for_pickup', 'shipped', 'delivered', 'cancelled'
-- And adds new statuses:
--   'pending_confirmation', 'out_for_delivery'
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_con RECORD;
BEGIN
  FOR v_con IN
    SELECT con.conname
    FROM pg_catalog.pg_constraint con
    JOIN pg_catalog.pg_class rel ON con.conrelid = rel.oid
    JOIN pg_catalog.pg_namespace nsp ON rel.relnamespace = nsp.oid
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'orders'
      AND con.contype = 'c'
      AND (
        con.conname = 'orders_status_check'
        OR (
          pg_catalog.pg_get_constraintdef(con.oid) ~* '\mstatus\M'
          AND NOT (pg_catalog.pg_get_constraintdef(con.oid) ~* '\mpayment_status\M')
        )
      )
  LOOP
    EXECUTE pg_catalog.format('ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS %I', v_con.conname);
  END LOOP;
END $$;

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
-- 4. SEQUENCE & TABLE SECURITY LOCKDOWN
-- ----------------------------------------------------------------------------
REVOKE ALL ON SEQUENCE public.order_number_seq FROM PUBLIC, anon;
GRANT USAGE, SELECT ON SEQUENCE public.order_number_seq TO authenticated;

REVOKE ALL ON public.orders FROM PUBLIC, anon;
REVOKE ALL ON public.order_items FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;


-- ----------------------------------------------------------------------------
-- 5. SECURE GUEST & AUTHENTICATED ORDER CREATION FUNCTION
-- Features:
--  - Validates mandatory idempotency key
--  - Normalizes customer details and validates formats
--  - Aggregates duplicate product IDs in submitted cart before checks
--  - Locks products (FOR SHARE ORDER BY id ASC) to verify stock and price
--  - Rolls back completely if any item validation or stock check fails
--  - Computes deterministic normalized JSONB hash with SHA-256 (including order_source)
--  - Handles simultaneous duplicates via unique index conflict handling
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.create_guest_order_secure(
  TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
);
DROP FUNCTION IF EXISTS public.create_guest_order_secure(
  TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
);

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
  p_idempotency_key TEXT DEFAULT NULL,
  p_retry_secret TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
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
  v_prod RECORD;
  v_unit_price NUMERIC(12,2);
  v_line_total NUMERIC(12,2);
  v_clean_phone TEXT;
  v_clean_pincode TEXT;
  v_norm_name TEXT;
  v_norm_address TEXT;
  v_norm_village TEXT;
  v_norm_landmark TEXT;
  v_norm_instructions TEXT;
  v_norm_payment TEXT;
  v_norm_email TEXT;
  v_order_source TEXT;
  v_full_location TEXT;
  v_canonical_json JSONB;
  v_payload_hash TEXT;
  v_clean_idempotency_key TEXT;
  v_clean_retry_secret TEXT;
  v_retry_secret_hash TEXT;
  v_normalized_items JSONB;
  v_validated_items JSONB := '[]'::jsonb;
BEGIN
  -- 0. Identify Caller Identity Immediately (BEFORE any lookup or authorization check)
  v_user_id := (SELECT auth.uid());

  -- 1. Validate Mandatory Non-Empty Idempotency Key & Guest Retry Secret
  v_clean_idempotency_key := pg_catalog.btrim(COALESCE(p_idempotency_key, ''));
  IF v_clean_idempotency_key = '' OR pg_catalog.length(v_clean_idempotency_key) < 8 OR pg_catalog.length(v_clean_idempotency_key) > 128 THEN
    RAISE EXCEPTION 'A valid, non-empty idempotency key (between 8 and 128 characters) is required to place an order.'
      USING ERRCODE = 'P0002';
  END IF;

  v_clean_retry_secret := pg_catalog.btrim(COALESCE(p_retry_secret, ''));

  -- For guest orders (unauthenticated), a high-entropy client retry secret is required
  -- to prevent unauthorized third parties from obtaining the order tracking token via idempotency reuse.
  IF v_user_id IS NULL THEN
    IF v_clean_retry_secret = '' OR pg_catalog.length(v_clean_retry_secret) < 16 OR pg_catalog.length(v_clean_retry_secret) > 128 THEN
      RAISE EXCEPTION 'A secure guest retry secret (between 16 and 128 characters) is required for guest orders.'
        USING ERRCODE = 'P0002';
    END IF;
    v_retry_secret_hash := public.crypto_sha256_hex('guest_retry:' || v_clean_retry_secret);
  ELSE
    IF v_clean_retry_secret <> '' THEN
      v_retry_secret_hash := public.crypto_sha256_hex('guest_retry:' || v_clean_retry_secret);
    ELSE
      v_retry_secret_hash := NULL;
    END IF;
  END IF;

  -- 2. Validate and Normalize Customer Details
  v_norm_name := pg_catalog.lower(pg_catalog.regexp_replace(pg_catalog.btrim(COALESCE(p_customer_name, '')), '\s+', ' ', 'g'));
  IF v_norm_name = '' THEN
    RAISE EXCEPTION 'Customer full name is required.' USING ERRCODE = 'P0002';
  END IF;

  v_clean_phone := pg_catalog.regexp_replace(COALESCE(p_customer_phone, ''), '[^0-9]', '', 'g');
  IF pg_catalog.length(v_clean_phone) < 10 THEN
    RAISE EXCEPTION 'A valid 10-digit mobile number is required.' USING ERRCODE = 'P0002';
  END IF;

  v_norm_address := pg_catalog.lower(pg_catalog.regexp_replace(pg_catalog.btrim(COALESCE(p_delivery_address, '')), '\s+', ' ', 'g'));
  IF v_norm_address = '' THEN
    RAISE EXCEPTION 'Complete delivery address is required.' USING ERRCODE = 'P0002';
  END IF;

  v_norm_village := pg_catalog.lower(pg_catalog.regexp_replace(pg_catalog.btrim(COALESCE(p_village_town, '')), '\s+', ' ', 'g'));
  IF v_norm_village = '' THEN
    RAISE EXCEPTION 'Village or town is required.' USING ERRCODE = 'P0002';
  END IF;

  v_clean_pincode := pg_catalog.regexp_replace(COALESCE(p_pincode, ''), '[^0-9]', '', 'g');
  IF pg_catalog.length(v_clean_pincode) <> 6 THEN
    RAISE EXCEPTION 'A valid 6-digit PIN code is required.' USING ERRCODE = 'P0002';
  END IF;

  v_norm_landmark := pg_catalog.lower(pg_catalog.regexp_replace(pg_catalog.btrim(COALESCE(p_landmark, '')), '\s+', ' ', 'g'));
  v_norm_instructions := pg_catalog.lower(pg_catalog.regexp_replace(pg_catalog.btrim(COALESCE(p_delivery_instructions, '')), '\s+', ' ', 'g'));
  v_norm_payment := pg_catalog.lower(pg_catalog.btrim(COALESCE(p_payment_method, 'cash_on_delivery')));
  IF v_norm_payment NOT IN ('cash_on_delivery', 'upi', 'bank_transfer', 'in_store') THEN
    v_norm_payment := 'cash_on_delivery';
  END IF;

  v_norm_email := pg_catalog.lower(pg_catalog.btrim(COALESCE(p_customer_email, '')));

  v_order_source := pg_catalog.lower(pg_catalog.btrim(COALESCE(p_order_source, 'web')));
  IF v_order_source NOT IN ('web', 'whatsapp', 'phone', 'in_store') THEN
    v_order_source := 'web';
  END IF;

  -- 3. Validate and Aggregate Cart Items
  IF p_items IS NULL OR pg_catalog.jsonb_typeof(p_items) <> 'array' OR pg_catalog.jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one valid product item.' USING ERRCODE = 'P0002';
  END IF;

  SELECT 
    pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object(
        'productId', agg.prod_id,
        'quantity', agg.total_qty
      )
      ORDER BY agg.prod_id ASC
    )
  INTO v_normalized_items
  FROM (
    SELECT 
      pg_catalog.btrim(COALESCE(elem->>'productId', elem->>'id', '')) AS prod_id,
      SUM(
        CASE 
          WHEN (elem->>'quantity') ~ '^[0-9]+$' THEN (elem->>'quantity')::INTEGER 
          ELSE -1 
        END
      ) AS total_qty
    FROM pg_catalog.jsonb_array_elements(p_items) AS elem
    GROUP BY pg_catalog.btrim(COALESCE(elem->>'productId', elem->>'id', ''))
  ) agg;

  -- 4. Calculate Deterministic Normalized JSONB SHA-256 Payload Hash
  -- Includes normalized order_source and all customer and line item data
  v_canonical_json := pg_catalog.jsonb_build_object(
    'customer_name', v_norm_name,
    'customer_phone', v_clean_phone,
    'customer_email', v_norm_email,
    'delivery_address', v_norm_address,
    'village_town', v_norm_village,
    'pincode', v_clean_pincode,
    'landmark', v_norm_landmark,
    'delivery_instructions', v_norm_instructions,
    'payment_method', v_norm_payment,
    'order_source', v_order_source,
    'items', COALESCE(v_normalized_items, '[]'::jsonb)
  );

  v_payload_hash := public.crypto_sha256_hex(v_canonical_json::TEXT);

  -- 5. Safe Idempotency Check: Return existing order if identical request already submitted
  SELECT id, order_number, customer_id, subtotal, delivery_charge, total_amount, status, guest_access_token, idempotency_hash, retry_secret_hash
  INTO v_existing_order
  FROM public.orders
  WHERE idempotency_key = v_clean_idempotency_key
  LIMIT 1;

  IF FOUND THEN
    -- Check A: Payload integrity
    IF v_existing_order.idempotency_hash IS NOT NULL AND v_existing_order.idempotency_hash <> v_payload_hash THEN
      RAISE EXCEPTION 'Idempotency key "%" has already been used for a different order payload.'
        USING ERRCODE = '23505';
    END IF;

    -- Check B: Authorization verification
    IF v_existing_order.customer_id IS NOT NULL THEN
      -- Authenticated order: caller must be the exact same authenticated user
      IF v_user_id IS NULL OR v_user_id <> v_existing_order.customer_id THEN
        RAISE EXCEPTION 'Idempotency key "%" has already been used by another user account.'
          USING ERRCODE = '42501';
      END IF;
    ELSE
      -- Guest order: caller must supply the matching high-entropy retry secret
      IF v_existing_order.retry_secret_hash IS NULL 
         OR v_clean_retry_secret = '' 
         OR public.crypto_sha256_hex('guest_retry:' || v_clean_retry_secret) <> v_existing_order.retry_secret_hash THEN
        RAISE EXCEPTION 'Access denied: valid guest retry secret is required to retrieve an existing guest order.'
          USING ERRCODE = '42501';
      END IF;
    END IF;

    RETURN pg_catalog.jsonb_build_object(
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

  -- 6. Fetch Delivery Settings with Strict Fallbacks
  SELECT 
    COALESCE(free_delivery_threshold, 199.00),
    COALESCE(delivery_fee, 50.00),
    COALESCE(delivery_enabled, true)
  INTO v_free_threshold, v_configured_fee, v_delivery_enabled
  FROM public.store_settings
  WHERE id = 'default'
  LIMIT 1;

  IF NOT FOUND OR v_free_threshold IS NULL OR v_configured_fee IS NULL OR v_delivery_enabled IS NULL THEN
    v_free_threshold := 199.00;
    v_configured_fee := 50.00;
    v_delivery_enabled := true;
  END IF;

  IF NOT v_delivery_enabled THEN
    RAISE EXCEPTION 'Online delivery is currently disabled. Please contact the store directly via WhatsApp or phone.'
      USING ERRCODE = 'P0001';
  END IF;

  -- 7. Pre-Validation of Products & Prices with Deadlock-Safe Row Locking
  -- Validates all items, active status, and real DB prices BEFORE touching public.orders
  FOR v_item IN 
    SELECT 
      (elem->>'productId')::TEXT AS prod_id,
      (elem->>'quantity')::INTEGER AS qty
    FROM pg_catalog.jsonb_array_elements(v_normalized_items) AS elem
    ORDER BY (elem->>'productId')::TEXT ASC
  LOOP
    IF v_item.prod_id = '' THEN
      RAISE EXCEPTION 'Order item is missing a valid product ID.' USING ERRCODE = 'P0002';
    END IF;

    IF v_item.qty IS NULL OR v_item.qty <= 0 OR v_item.qty > 1000 THEN
      RAISE EXCEPTION 'Invalid quantity % for product "%". Must be between 1 and 1000.', v_item.qty, v_item.prod_id USING ERRCODE = 'P0002';
    END IF;

    SELECT 
      id, name_en, name_te, brand, pack_size, price, active, in_stock
    INTO v_prod
    FROM public.products
    WHERE id = v_item.prod_id
    FOR SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID "%" does not exist in store catalog.', v_item.prod_id USING ERRCODE = 'P0002';
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
    v_line_total := v_unit_price * v_item.qty;
    v_subtotal := v_subtotal + v_line_total;

    -- Accumulate validated item details in memory
    v_validated_items := v_validated_items || pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'product_id', v_prod.id,
        'product_name_en', v_prod.name_en,
        'product_name_te', v_prod.name_te,
        'brand', v_prod.brand,
        'pack_size', v_prod.pack_size,
        'quantity', v_item.qty,
        'unit_price', v_unit_price,
        'total_price', v_line_total
      )
    );
  END LOOP;

  -- 8. Calculate Final Verified Delivery Charge & Grand Total
  IF v_subtotal >= v_free_threshold THEN
    v_calculated_delivery := 0.00;
  ELSE
    v_calculated_delivery := v_configured_fee;
  END IF;

  v_calculated_delivery := COALESCE(v_calculated_delivery, 50.00);
  v_grand_total := COALESCE(v_subtotal, 0.00) + v_calculated_delivery;

  -- 9. Generate Cryptographic 256-bit Guest Access Token (32 CSPRNG bytes => 64 hex chars)
  v_guest_token := 'gst_' || pg_catalog.encode(public.crypto_gen_random_bytes(32), 'hex');

  -- Generate Unique Order Number (SDT-YYYYMMDD-SEQ)
  v_order_num := 'SDT-' || pg_catalog.to_char(pg_catalog.now(), 'YYYYMMDD') || '-' || pg_catalog.lpad(pg_catalog.nextval('public.order_number_seq')::TEXT, 4, '0');

  v_full_location := pg_catalog.btrim(p_delivery_address) || ', ' || pg_catalog.btrim(p_village_town) || ' - ' || v_clean_pincode;

  -- 10. Atomic Insertion of Order Header with race-condition handling
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
      retry_secret_hash,
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
      v_retry_secret_hash,
      v_guest_token,
      v_order_source,
      'pending',
      v_norm_payment,
      'pending',
      v_subtotal,
      v_calculated_delivery,
      0,
      v_grand_total,
      NULLIF(pg_catalog.btrim(COALESCE(p_delivery_instructions, '')), '')
    ) RETURNING id INTO v_order_id;

  EXCEPTION WHEN unique_violation THEN
    SELECT id, order_number, customer_id, subtotal, delivery_charge, total_amount, status, guest_access_token, idempotency_hash, retry_secret_hash
    INTO v_existing_order
    FROM public.orders
    WHERE idempotency_key = v_clean_idempotency_key
    LIMIT 1;

    IF FOUND THEN
      IF v_existing_order.idempotency_hash IS NOT NULL AND v_existing_order.idempotency_hash <> v_payload_hash THEN
        RAISE EXCEPTION 'Idempotency key "%" has already been used for a different order payload.'
          USING ERRCODE = '23505';
      END IF;

      -- Check authorization on duplicate race resolution
      IF v_existing_order.customer_id IS NOT NULL THEN
        IF v_user_id IS NULL OR v_user_id <> v_existing_order.customer_id THEN
          RAISE EXCEPTION 'Idempotency key "%" has already been used by another user account.'
            USING ERRCODE = '42501';
        END IF;
      ELSE
        IF v_existing_order.retry_secret_hash IS NULL 
           OR v_clean_retry_secret = '' 
           OR public.crypto_sha256_hex('guest_retry:' || v_clean_retry_secret) <> v_existing_order.retry_secret_hash THEN
          RAISE EXCEPTION 'Access denied: valid guest retry secret is required to retrieve an existing guest order.'
            USING ERRCODE = '42501';
        END IF;
      END IF;

      RETURN pg_catalog.jsonb_build_object(
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
    RAISE;
  END;

  -- 11. Insert Verified Line Items Atomically
  FOR v_item IN SELECT * FROM pg_catalog.jsonb_to_recordset(v_validated_items) AS x(
    product_id TEXT,
    product_name_en TEXT,
    product_name_te TEXT,
    brand TEXT,
    pack_size TEXT,
    quantity INTEGER,
    unit_price NUMERIC(12,2),
    total_price NUMERIC(12,2)
  )
  LOOP
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
      v_item.product_id,
      v_item.product_name_en,
      v_item.product_name_te,
      v_item.brand,
      v_item.pack_size,
      v_item.quantity,
      v_item.unit_price,
      v_item.total_price
    );
  END LOOP;

  RETURN pg_catalog.jsonb_build_object(
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

REVOKE ALL ON FUNCTION public.create_guest_order_secure(
  TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_guest_order_secure(
  TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO anon, authenticated;

-- Explicitly ensure that whichever role owns create_guest_order_secure has EXECUTE permission
-- on both internal crypto helper functions (handling cases where CREATE OR REPLACE preserved a pre-existing owner).
DO $$
DECLARE
  v_rpc_owner TEXT;
BEGIN
  SELECT r.rolname INTO v_rpc_owner
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_roles r ON p.proowner = r.oid
  JOIN pg_catalog.pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' 
    AND p.proname = 'create_guest_order_secure'
  LIMIT 1;

  IF v_rpc_owner IS NOT NULL THEN
    EXECUTE pg_catalog.format('GRANT EXECUTE ON FUNCTION public.crypto_gen_random_bytes(INTEGER) TO %I', v_rpc_owner);
    EXECUTE pg_catalog.format('GRANT EXECUTE ON FUNCTION public.crypto_sha256_hex(TEXT) TO %I', v_rpc_owner);
  END IF;

  IF CURRENT_USER <> COALESCE(v_rpc_owner, '') THEN
    EXECUTE pg_catalog.format('GRANT EXECUTE ON FUNCTION public.crypto_gen_random_bytes(INTEGER) TO %I', CURRENT_USER);
    EXECUTE pg_catalog.format('GRANT EXECUTE ON FUNCTION public.crypto_sha256_hex(TEXT) TO %I', CURRENT_USER);
  END IF;
END $$;


-- ----------------------------------------------------------------------------
-- 6. SECURE GUEST ORDER LOOKUP VIA CRYPTOGRAPHIC TOKEN
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

  IF pg_catalog.length(v_order.customer_phone) >= 4 THEN
    v_masked_phone := 'XXXXXX' || pg_catalog.right(v_order.customer_phone, 4);
  ELSE
    v_masked_phone := 'XXXXXX';
  END IF;

  v_masked_location := '***, ' || COALESCE(v_order.village_town, '') || ' - ' || COALESCE(v_order.pincode, '');

  SELECT pg_catalog.jsonb_agg(
    pg_catalog.jsonb_build_object(
      'productNameEn', product_name_en,
      'productNameTe', product_name_te,
      'quantity', quantity,
      'unitPrice', unit_price,
      'totalPrice', total_price
    )
  ) INTO v_items
  FROM public.order_items
  WHERE order_id = v_order.id;

  RETURN pg_catalog.jsonb_build_object(
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

REVOKE SELECT, INSERT, UPDATE, DELETE ON public.orders FROM PUBLIC, anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.order_items FROM PUBLIC, anon;
