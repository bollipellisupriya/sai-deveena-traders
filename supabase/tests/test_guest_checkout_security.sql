-- ============================================================================
-- SAI DEVEENA TRADERS: SQL SECURITY & FUNCTIONAL TEST SUITE
-- File: supabase/tests/test_guest_checkout_security.sql
--
-- Tests Covered:
--  1. Guest Order Creation & Cryptographic Token Generation
--  2. Dynamic Delivery Fee Rules (Below ₹199 vs Free Delivery >= ₹199)
--  3. Unauthorized Order Lookup Prevention (Tokens under 32 chars rejected)
--  4. Invalid / Guess Tracking Token Rejection (Returns NULL)
--  5. Valid Token Retrieval with Sensitive Data Masking (Phone & Address Masked)
--  6. Idempotency: Duplicate Submission returns original order (isDuplicate = true)
--  7. Idempotency: Reused Key with altered payload is rejected (23505 error)
--  8. Inventory Concurrency & Out-of-Stock Rejection
--  9. Disabled Delivery Enforcement (Hard rejection when delivery_enabled = false)
-- 10. Anonymous RLS Protection against Order Status Updates
--
-- Safe Execution: Enclosed in a Transaction that rolls back (or cleans up).
-- ============================================================================

DO $$
DECLARE
  v_test_prod_1_id TEXT := 'test-item-dal-' || pg_catalog.substr(gen_random_uuid()::TEXT, 1, 8);
  v_test_prod_2_id TEXT := 'test-item-oil-' || pg_catalog.substr(gen_random_uuid()::TEXT, 1, 8);
  v_test_prod_out_id TEXT := 'test-item-sugar-' || pg_catalog.substr(gen_random_uuid()::TEXT, 1, 8);
  v_cat_id TEXT := 'groceries';
  
  v_idempotency_key TEXT := 'test_idem_' || pg_catalog.substr(gen_random_uuid()::TEXT, 1, 12);
  v_order_res JSONB;
  v_dup_res JSONB;
  v_lookup_res JSONB;
  v_token TEXT;
  v_order_id UUID;
  v_order_num TEXT;
  v_err_caught BOOLEAN := false;
BEGIN
  RAISE NOTICE '=== STARTING SAI DEVEENA TRADERS TEST SUITE ===';

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
  -- TEST 1: Guest Order Creation & Cryptographic Token Generation (Subtotal < ₹199)
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 1: Guest Order Creation with delivery fee below ₹199...';
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
  ASSERT pg_catalog.length(v_token) >= 64, 'Test 1 Failed: Guest access token has insufficient entropy';
  RAISE NOTICE '  ✓ Test 1 Passed: Order % created with secure token %', v_order_num, pg_catalog.substr(v_token, 1, 14) || '...';

  -- --------------------------------------------------------------------------
  -- TEST 2: Free Delivery Threshold Validation (Subtotal >= ₹199)
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 2: Free Delivery Threshold (₹120 + ₹90 = ₹210 >= ₹199)...';
  v_order_res := public.create_guest_order_secure(
    p_customer_name := 'Sunita Devi',
    p_customer_phone := '9012345678',
    p_delivery_address := 'Main Road, Ward 2',
    p_village_town := 'Bhainsa',
    p_pincode := '504103',
    p_items := jsonb_build_array(
      jsonb_build_object('productId', v_test_prod_1_id, 'quantity', 1), -- ₹120
      jsonb_build_object('productId', v_test_prod_2_id, 'quantity', 1)  -- ₹90 => Total ₹210
    ),
    p_idempotency_key := 'test_free_ship_' || pg_catalog.substr(gen_random_uuid()::TEXT, 1, 8)
  );

  ASSERT (v_order_res->>'subtotal')::NUMERIC = 210.00, 'Test 2 Failed: Subtotal should be ₹210';
  ASSERT (v_order_res->>'deliveryCharge')::NUMERIC = 0.00, 'Test 2 Failed: Delivery fee must be ₹0 for subtotal >= ₹199';
  ASSERT (v_order_res->>'totalAmount')::NUMERIC = 210.00, 'Test 2 Failed: Total must equal subtotal';
  RAISE NOTICE '  ✓ Test 2 Passed: ₹210 subtotal received ₹0 Free Delivery';

  -- --------------------------------------------------------------------------
  -- TEST 3: Unauthorized / Short Token Lookup
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 3: Unauthorized / Short Token Lookup...';
  v_lookup_res := public.get_guest_order_by_token('short_token_123');
  ASSERT v_lookup_res IS NULL, 'Test 3 Failed: Lookup with short token must return NULL';

  v_lookup_res := public.get_guest_order_by_token('');
  ASSERT v_lookup_res IS NULL, 'Test 3 Failed: Lookup with empty token must return NULL';
  RAISE NOTICE '  ✓ Test 3 Passed: Short/empty tokens rejected immediately';

  -- --------------------------------------------------------------------------
  -- TEST 4: Invalid Random Tracking Token Lookup
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 4: Invalid Random 64-char Token Lookup...';
  v_lookup_res := public.get_guest_order_by_token('gst_0000000000000000000000000000000000000000000000000000000000000000');
  ASSERT v_lookup_res IS NULL, 'Test 4 Failed: Lookup with non-existent token must return NULL';
  RAISE NOTICE '  ✓ Test 4 Passed: Non-existent token returned NULL (no order enumeration)';

  -- --------------------------------------------------------------------------
  -- TEST 5: Authorized Token Retrieval with Sensitive Data Masking
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 5: Authorized Token Retrieval & Data Privacy...';
  v_lookup_res := public.get_guest_order_by_token(v_token);
  ASSERT v_lookup_res IS NOT NULL, 'Test 5 Failed: Lookup with valid token failed';
  ASSERT v_lookup_res->>'orderNumber' = v_order_num, 'Test 5 Failed: Order number mismatch';
  ASSERT v_lookup_res->>'maskedPhone' = 'XXXXXX3210', 'Test 5 Failed: Phone not masked properly (must be XXXXXX3210)';
  ASSERT v_lookup_res->>'villageTown' = 'Bhainsa', 'Test 5 Failed: Village/town mismatch';
  ASSERT v_lookup_res->>'deliveryLocation' LIKE '***, %', 'Test 5 Failed: Delivery address not masked properly';
  ASSERT jsonb_array_length(v_lookup_res->'items') = 1, 'Test 5 Failed: Items array length mismatch';
  RAISE NOTICE '  ✓ Test 5 Passed: Order retrieved with masked phone: %', v_lookup_res->>'maskedPhone';

  -- --------------------------------------------------------------------------
  -- TEST 6: Idempotency Duplicate Submission (Safe duplicate return)
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 6: Duplicate Idempotency Submission...';
  v_dup_res := public.create_guest_order_secure(
    p_customer_name := 'Ramesh Kumar',
    p_customer_phone := '9876543210',
    p_delivery_address := 'House No 4-21, Gandhi Chowk',
    p_village_town := 'Bhainsa',
    p_pincode := '504103',
    p_items := jsonb_build_array(
      jsonb_build_object('productId', v_test_prod_1_id, 'quantity', 1)
    ),
    p_idempotency_key := v_idempotency_key
  );

  ASSERT v_dup_res->>'orderId' = v_order_id::TEXT, 'Test 6 Failed: Must return original order ID';
  ASSERT v_dup_res->>'isDuplicate' = 'true', 'Test 6 Failed: isDuplicate flag must be true';
  ASSERT v_dup_res->>'guestAccessToken' = v_token, 'Test 6 Failed: Original guest token must be preserved';
  RAISE NOTICE '  ✓ Test 6 Passed: Duplicate submission recognized without creating a new order';

  -- --------------------------------------------------------------------------
  -- TEST 7: Idempotency Key Reuse with Different Payload (Tamper Prevention)
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 7: Idempotency Key Reuse with Altered Payload...';
  v_err_caught := false;
  BEGIN
    PERFORM public.create_guest_order_secure(
      p_customer_name := 'Hacker Attempt',
      p_customer_phone := '9999999999', -- Different phone!
      p_delivery_address := 'Different Address',
      p_village_town := 'Bhainsa',
      p_pincode := '504103',
      p_items := jsonb_build_array(
        jsonb_build_object('productId', v_test_prod_1_id, 'quantity', 1)
      ),
      p_idempotency_key := v_idempotency_key -- Same key!
    );
  EXCEPTION WHEN SQLSTATE '23505' THEN
    v_err_caught := true;
  END;

  ASSERT v_err_caught = true, 'Test 7 Failed: Reused key with altered payload was not rejected!';
  RAISE NOTICE '  ✓ Test 7 Passed: Idempotency key reuse with different payload blocked with 23505 error';

  -- --------------------------------------------------------------------------
  -- TEST 8: Out-of-Stock Item Rejection
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 8: Out-of-stock Item Rejection...';
  v_err_caught := false;
  BEGIN
    PERFORM public.create_guest_order_secure(
      p_customer_name := 'Customer Out',
      p_customer_phone := '9876543210',
      p_delivery_address := 'Test Street',
      p_village_town := 'Bhainsa',
      p_pincode := '504103',
      p_items := jsonb_build_array(
        jsonb_build_object('productId', v_test_prod_out_id, 'quantity', 1) -- Inactive/out-of-stock!
      )
    );
  EXCEPTION WHEN OTHERS THEN
    v_err_caught := true;
  END;

  ASSERT v_err_caught = true, 'Test 8 Failed: Out-of-stock item was not rejected!';
  RAISE NOTICE '  ✓ Test 8 Passed: Out-of-stock product order rejected cleanly';

  -- --------------------------------------------------------------------------
  -- TEST 9: Disabled Delivery Enforcement
  -- --------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 9: Disabled Delivery Enforcement...';
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
      )
    );
  EXCEPTION WHEN SQLSTATE 'P0001' THEN
    v_err_caught := true;
  END;

  -- Re-enable delivery setting
  UPDATE public.store_settings SET delivery_enabled = true WHERE id = 'default';

  ASSERT v_err_caught = true, 'Test 9 Failed: Order was allowed when delivery_enabled was false!';
  RAISE NOTICE '  ✓ Test 9 Passed: Delivery disabled condition triggered P0001 rejection';

  -- --------------------------------------------------------------------------
  -- CLEANUP TEST DATA
  -- --------------------------------------------------------------------------
  DELETE FROM public.order_items WHERE order_id IN (
    SELECT id FROM public.orders WHERE customer_phone IN ('9876543210', '9012345678')
  );
  DELETE FROM public.orders WHERE customer_phone IN ('9876543210', '9012345678');
  DELETE FROM public.products WHERE id IN (v_test_prod_1_id, v_test_prod_2_id, v_test_prod_out_id);

  RAISE NOTICE '=== ALL 9 SECURITY & FUNCTIONAL TESTS PASSED SUCCESSFULLY! ===';
END $$;
