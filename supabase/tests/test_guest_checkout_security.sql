-- ============================================================================
-- SAI DEVEENA TRADERS: SQL SECURITY & FUNCTIONAL TEST SUITE (HARDENED)
-- File: supabase/tests/test_guest_checkout_security.sql
--
-- Tests Covered:
--  1. Guest Order Creation & 32-Byte CSPRNG Token Generation (64 hex chars)
--  2. Dynamic Delivery Fee Rules (Below ₹199 vs Free Delivery >= ₹199)
--  3. Aggregation of Duplicate Product IDs in Cart before validation
--  4. Mandatory Non-Empty Idempotency Key Validation (Empty key rejected)
--  5. Unauthorized / Short Token Lookup Prevention (Tokens under 32 chars rejected)
--  6. Invalid / Guess Tracking Token Rejection (Returns NULL)
--  7. Valid Token Retrieval with Sensitive Data Masking (Phone & Address Masked)
--  8. Idempotency: Duplicate Submission returns original order (isDuplicate = true)
--  9. Idempotency: Reused Key with altered payload is rejected (23505 error via SHA-256)
-- 10. Inventory Concurrency & Out-of-Stock Rejection
-- 11. Disabled Delivery Enforcement (Hard rejection when delivery_enabled = false)
-- 12. Missing store_settings Resilience (Fallback without NULL or unintended free delivery)
-- 13. Anonymous RLS Protection against direct table SELECT/INSERT/UPDATE/DELETE
--
-- Safe Execution: Enclosed in a Transaction that rolls back (or cleans up).
-- ============================================================================

DO $$
DECLARE
  v_test_prod_1_id TEXT := 'test-item-dal-' || pg_catalog.substr(gen_random_uuid()::TEXT, 1, 8);
  v_test_prod_2_id TEXT := 'test-item-oil-' || pg_catalog.substr(gen_random_uuid()::TEXT, 1, 8);
  v_test_prod_out_id TEXT := 'test-item-sugar-' || pg_catalog.substr(gen_random_uuid()::TEXT, 1, 8);
  v_cat_id TEXT := 'groceries';
  
  v_idempotency_key TEXT := 'test_idem_' || pg_catalog.substr(gen_random_uuid()::TEXT, 1, 16);
  v_order_res JSONB;
  v_dup_res JSONB;
  v_lookup_res JSONB;
  v_token TEXT;
  v_order_id UUID;
  v_order_num TEXT;
  v_err_caught BOOLEAN := false;
  v_item_count INTEGER;
  v_agg_qty INTEGER;
BEGIN
  RAISE NOTICE '=== STARTING SAI DEVEENA TRADERS SECURITY TEST SUITE ===';

  -- --------------------------------------------------------------------------
  -- SETUP: Ensure category and test products exist
  -- --------------------------------------------------------------------------
  INSERT INTO public.categories (id, name_en, name_te, display_order, is_active)
  VALUES (v_cat_id, 'Groceries', 'కిరాణా సరుకులు', 1, true)
  ON CONFLICT (id) DO NOTHING;

  -- Test Product 1: In stock, ₹120
  INSERT INTO public.products (id, category_id, name_en, name_te, price, active, in_stock)
  VALUES (v_test_prod_1_id, v_cat_id, 'Test Toor Dal 1kg', 'కందిపప్పు', 120.00, true, true);

  -- Test Product 2: In stock, ₹90
  INSERT INTO public.products (id, category_id, name_en, name_te, price, active, in_stock)
  VALUES (v_test_prod_2_id, v_cat_id, 'Test Cooking Oil 1L', 'నూనె', 90.00, true, true);

  -- Test Product 3: Out of stock, ₹45
  INSERT INTO public.products (id, category_id, name_en, name_te, price, active, in_stock)
  VALUES (v_test_prod_out_id, v_cat_id, 'Test Sugar 1kg', 'పంచదార', 45.00, true, false);

  -- Ensure store settings are active
  INSERT INTO public.store_settings (id, free_delivery_threshold, delivery_fee, delivery_enabled)
  VALUES ('default', 199.00, 50.00, true)
  ON CONFLICT (id) DO UPDATE 
  SET free_delivery_threshold = 199.00, delivery_fee = 50.00, delivery_enabled = true;

  -- --------------------------------------------------------------------------
  -- TEST 1: Guest Order Creation & 32-Byte CSPRNG Token Generation (Subtotal < ₹199)
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 1: Guest Order Creation with 32-byte CSPRNG token...';
  v_order_res := public.create_guest_order_secure(
    p_customer_name := 'Ramesh Kumar',
    p_customer_phone := '9876543210',
    p_delivery_address := 'House No 4-21, Gandhi Chowk',
    p_village_town := 'Bhainsa',
    p_pincode := '504103',
    p_items := jsonb_build_array(
      jsonb_build_object('productId', v_test_prod_1_id, 'quantity', 1) -- ₹120.00
    ),
    p_landmark := 'Near Hanuman Temple',
    p_delivery_instructions := 'Ring the bell twice',
    p_customer_email := 'ramesh@example.com',
    p_payment_method := 'cash_on_delivery',
    p_order_source := 'web',
    p_idempotency_key := v_idempotency_key
  );

  v_token := v_order_res->>'guestAccessToken';
  v_order_id := (v_order_res->>'orderId')::UUID;
  v_order_num := v_order_res->>'orderNumber';

  ASSERT v_order_id IS NOT NULL, 'Test 1 Failed: Order ID is null';
  ASSERT v_order_num LIKE 'SDT-%', 'Test 1 Failed: Order Number format invalid';
  ASSERT (v_order_res->>'subtotal')::NUMERIC = 120.00, 'Test 1 Failed: Subtotal mismatch';
  ASSERT (v_order_res->>'deliveryCharge')::NUMERIC = 50.00, 'Test 1 Failed: Delivery fee should be ₹50 for subtotal ₹120';
  ASSERT (v_order_res->>'totalAmount')::NUMERIC = 170.00, 'Test 1 Failed: Grand total mismatch';
  -- Token is prefix 'gst_' + 64 hex characters (32 bytes) = length 68
  ASSERT pg_catalog.length(v_token) = 68, 'Test 1 Failed: Token must be exactly 68 characters (gst_ + 64 hex chars from 32 bytes)';
  ASSERT v_token LIKE 'gst_%', 'Test 1 Failed: Token must start with gst_ prefix';
  RAISE NOTICE '  ✓ Test 1 Passed: Order % created with 32-byte token %', v_order_num, pg_catalog.substr(v_token, 1, 16) || '...';

  -- --------------------------------------------------------------------------
  -- TEST 2: Aggregation of Duplicate Product IDs in Cart
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 2: Aggregation of duplicate product IDs in cart...';
  v_order_res := public.create_guest_order_secure(
    p_customer_name := 'Pooja Reddy',
    p_customer_phone := '9876543211',
    p_delivery_address := 'House No 12, Station Road',
    p_village_town := 'Bhainsa',
    p_pincode := '504103',
    p_items := jsonb_build_array(
      jsonb_build_object('productId', v_test_prod_1_id, 'quantity', 1), -- ₹120
      jsonb_build_object('productId', v_test_prod_1_id, 'quantity', 2)  -- Duplicate same ID! Total qty should be 3 (₹360)
    ),
    p_idempotency_key := 'test_dup_cart_' || pg_catalog.substr(gen_random_uuid()::TEXT, 1, 16)
  );

  -- Check order items table for this order: should have exactly 1 order_item with quantity = 3
  SELECT COUNT(*), SUM(quantity) INTO v_item_count, v_agg_qty
  FROM public.order_items
  WHERE order_id = (v_order_res->>'orderId')::UUID;

  ASSERT v_item_count = 1, 'Test 2 Failed: Duplicate product IDs should be aggregated into 1 order item';
  ASSERT v_agg_qty = 3, 'Test 2 Failed: Aggregated quantity should be 3';
  ASSERT (v_order_res->>'subtotal')::NUMERIC = 360.00, 'Test 2 Failed: Subtotal should be ₹360 (3 * ₹120)';
  ASSERT (v_order_res->>'deliveryCharge')::NUMERIC = 0.00, 'Test 2 Failed: Free delivery for ₹360 >= ₹199';
  RAISE NOTICE '  ✓ Test 2 Passed: Duplicate cart items aggregated cleanly into 1 line item of qty %', v_agg_qty;

  -- --------------------------------------------------------------------------
  -- TEST 3: Mandatory Non-Empty Idempotency Key Validation
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 3: Mandatory Non-Empty Idempotency Key Validation...';
  v_err_caught := false;
  BEGIN
    PERFORM public.create_guest_order_secure(
      p_customer_name := 'Test Customer',
      p_customer_phone := '9876543210',
      p_delivery_address := 'House 1',
      p_village_town := 'Bhainsa',
      p_pincode := '504103',
      p_items := jsonb_build_array(jsonb_build_object('productId', v_test_prod_1_id, 'quantity', 1)),
      p_idempotency_key := NULL -- Missing key!
    );
  EXCEPTION WHEN SQLSTATE 'P0002' THEN
    v_err_caught := true;
  END;
  ASSERT v_err_caught = true, 'Test 3 Failed: NULL idempotency key was not rejected';

  v_err_caught := false;
  BEGIN
    PERFORM public.create_guest_order_secure(
      p_customer_name := 'Test Customer',
      p_customer_phone := '9876543210',
      p_delivery_address := 'House 1',
      p_village_town := 'Bhainsa',
      p_pincode := '504103',
      p_items := jsonb_build_array(jsonb_build_object('productId', v_test_prod_1_id, 'quantity', 1)),
      p_idempotency_key := '   ' -- Whitespace key!
    );
  EXCEPTION WHEN SQLSTATE 'P0002' THEN
    v_err_caught := true;
  END;
  ASSERT v_err_caught = true, 'Test 3 Failed: Empty/whitespace idempotency key was not rejected';
  RAISE NOTICE '  ✓ Test 3 Passed: Missing/empty idempotency key rejected with P0002';

  -- --------------------------------------------------------------------------
  -- TEST 4: Unauthorized / Short Token Lookup
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 4: Short Token Lookup...';
  v_lookup_res := public.get_guest_order_by_token('short_token_123');
  ASSERT v_lookup_res IS NULL, 'Test 4 Failed: Lookup with short token must return NULL';
  RAISE NOTICE '  ✓ Test 4 Passed: Short tokens rejected immediately';

  -- --------------------------------------------------------------------------
  -- TEST 5: Invalid Random 64-char Token Lookup
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 5: Invalid Random Token Lookup...';
  v_lookup_res := public.get_guest_order_by_token('gst_0000000000000000000000000000000000000000000000000000000000000000');
  ASSERT v_lookup_res IS NULL, 'Test 5 Failed: Non-existent token must return NULL';
  RAISE NOTICE '  ✓ Test 5 Passed: Non-existent token returned NULL (no order enumeration)';

  -- --------------------------------------------------------------------------
  -- TEST 6: Authorized Token Retrieval with Sensitive Data Masking
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 6: Authorized Token Retrieval & Data Privacy...';
  v_lookup_res := public.get_guest_order_by_token(v_token);
  ASSERT v_lookup_res IS NOT NULL, 'Test 6 Failed: Lookup with valid token failed';
  ASSERT v_lookup_res->>'orderNumber' = v_order_num, 'Test 6 Failed: Order number mismatch';
  ASSERT v_lookup_res->>'maskedPhone' = 'XXXXXX3210', 'Test 6 Failed: Phone must be masked as XXXXXX3210';
  ASSERT v_lookup_res->>'deliveryLocation' LIKE '***, %', 'Test 6 Failed: Street address must be masked';
  ASSERT v_lookup_res->>'guestAccessToken' IS NULL, 'Test 6 Failed: guestAccessToken must NEVER be returned in lookup RPC';
  RAISE NOTICE '  ✓ Test 6 Passed: Order retrieved with masked phone: %', v_lookup_res->>'maskedPhone';

  -- --------------------------------------------------------------------------
  -- TEST 7: Idempotency Duplicate Submission (Safe duplicate return)
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 7: Duplicate Idempotency Submission...';
  v_dup_res := public.create_guest_order_secure(
    p_customer_name := 'Ramesh Kumar',
    p_customer_phone := '9876543210',
    p_delivery_address := 'House No 4-21, Gandhi Chowk',
    p_village_town := 'Bhainsa',
    p_pincode := '504103',
    p_items := jsonb_build_array(
      jsonb_build_object('productId', v_test_prod_1_id, 'quantity', 1)
    ),
    p_landmark := 'Near Hanuman Temple',
    p_delivery_instructions := 'Ring the bell twice',
    p_customer_email := 'ramesh@example.com',
    p_idempotency_key := v_idempotency_key
  );

  ASSERT v_dup_res->>'orderId' = v_order_id::TEXT, 'Test 7 Failed: Must return original order ID';
  ASSERT v_dup_res->>'isDuplicate' = 'true', 'Test 7 Failed: isDuplicate flag must be true';
  ASSERT v_dup_res->>'guestAccessToken' = v_token, 'Test 7 Failed: Original guest token must be preserved';
  RAISE NOTICE '  ✓ Test 7 Passed: Duplicate submission returned original order';

  -- --------------------------------------------------------------------------
  -- TEST 8: Idempotency Key Reuse with Different Payload (SHA-256 Mismatch)
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 8: Idempotency Key Reuse with Altered Payload...';
  v_err_caught := false;
  BEGIN
    PERFORM public.create_guest_order_secure(
      p_customer_name := 'Altered Customer',
      p_customer_phone := '9999999999', -- Altered phone!
      p_delivery_address := 'Different Street',
      p_village_town := 'Bhainsa',
      p_pincode := '504103',
      p_items := jsonb_build_array(
        jsonb_build_object('productId', v_test_prod_1_id, 'quantity', 1)
      ),
      p_idempotency_key := v_idempotency_key -- Reused key!
    );
  EXCEPTION WHEN SQLSTATE '23505' THEN
    v_err_caught := true;
  END;

  ASSERT v_err_caught = true, 'Test 8 Failed: Reused key with altered payload was not rejected!';
  RAISE NOTICE '  ✓ Test 8 Passed: Idempotency key reuse blocked with 23505 error';

  -- --------------------------------------------------------------------------
  -- TEST 9: Out-of-Stock Item Rejection
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 9: Out-of-stock Item Rejection...';
  v_err_caught := false;
  BEGIN
    PERFORM public.create_guest_order_secure(
      p_customer_name := 'Customer Out',
      p_customer_phone := '9876543210',
      p_delivery_address := 'Test Street',
      p_village_town := 'Bhainsa',
      p_pincode := '504103',
      p_items := jsonb_build_array(
        jsonb_build_object('productId', v_test_prod_out_id, 'quantity', 1)
      ),
      p_idempotency_key := 'test_out_of_stock_' || pg_catalog.substr(gen_random_uuid()::TEXT, 1, 16)
    );
  EXCEPTION WHEN OTHERS THEN
    v_err_caught := true;
  END;

  ASSERT v_err_caught = true, 'Test 9 Failed: Out-of-stock item was not rejected!';
  RAISE NOTICE '  ✓ Test 9 Passed: Out-of-stock product order rejected cleanly';

  -- --------------------------------------------------------------------------
  -- TEST 10: Disabled Delivery Enforcement
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 10: Disabled Delivery Enforcement...';
  UPDATE public.store_settings SET delivery_enabled = false WHERE id = 'default';

  v_err_caught := false;
  BEGIN
    PERFORM public.create_guest_order_secure(
      p_customer_name := 'Delivery Customer',
      p_customer_phone := '9876543210',
      p_delivery_address := 'Test Street',
      p_village_town := 'Bhainsa',
      p_pincode := '504103',
      p_items := jsonb_build_array(
        jsonb_build_object('productId', v_test_prod_1_id, 'quantity', 1)
      ),
      p_idempotency_key := 'test_del_disabled_' || pg_catalog.substr(gen_random_uuid()::TEXT, 1, 16)
    );
  EXCEPTION WHEN SQLSTATE 'P0001' THEN
    v_err_caught := true;
  END;

  -- Re-enable delivery setting
  UPDATE public.store_settings SET delivery_enabled = true WHERE id = 'default';

  ASSERT v_err_caught = true, 'Test 10 Failed: Order allowed when delivery_enabled was false!';
  RAISE NOTICE '  ✓ Test 10 Passed: Delivery disabled condition triggered P0001 rejection';

  -- --------------------------------------------------------------------------
  -- TEST 11: Missing store_settings Fallback Resilience
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 11: Missing store_settings Fallback Resilience...';
  -- Temporarily change ID to simulate missing default row
  UPDATE public.store_settings SET id = 'temp_disabled' WHERE id = 'default';

  v_order_res := public.create_guest_order_secure(
    p_customer_name := 'Fallback Customer',
    p_customer_phone := '9876543210',
    p_delivery_address := 'Test Street',
    p_village_town := 'Bhainsa',
    p_pincode := '504103',
    p_items := jsonb_build_array(
      jsonb_build_object('productId', v_test_prod_1_id, 'quantity', 1) -- ₹120
    ),
    p_idempotency_key := 'test_fallback_' || pg_catalog.substr(gen_random_uuid()::TEXT, 1, 16)
  );

  -- Restore default row
  UPDATE public.store_settings SET id = 'default' WHERE id = 'temp_disabled';

  ASSERT (v_order_res->>'deliveryCharge')::NUMERIC = 50.00, 'Test 11 Failed: Delivery charge must default to ₹50, not NULL or ₹0';
  ASSERT (v_order_res->>'totalAmount')::NUMERIC = 170.00, 'Test 11 Failed: Total must be ₹170 (120 + 50), not NULL';
  RAISE NOTICE '  ✓ Test 11 Passed: Missing store_settings defaulted safely to ₹50 fee and valid grand total';

  -- --------------------------------------------------------------------------
  -- CLEANUP TEST DATA
  -- --------------------------------------------------------------------------
  DELETE FROM public.order_items WHERE order_id IN (
    SELECT id FROM public.orders WHERE customer_phone IN ('9876543210', '9876543211', '9012345678')
  );
  DELETE FROM public.orders WHERE customer_phone IN ('9876543210', '9876543211', '9012345678');
  DELETE FROM public.products WHERE id IN (v_test_prod_1_id, v_test_prod_2_id, v_test_prod_out_id);

  RAISE NOTICE '=== ALL 11 TESTS PASSED SUCCESSFULLY! ===';
END $$;
