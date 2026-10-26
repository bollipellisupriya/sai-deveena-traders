import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    value = value.trim().replace(/^['"](.*)['"]$/, '$1');
    env[match[1]] = value;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://ypeeiwlwegfnocvayxdv.supabase.co';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

const client = createClient(supabaseUrl, supabaseKey);

async function runCustomerAuthTests() {
  console.log('====================================================');
  console.log('SAI DEVEENA TRADERS: CUSTOMER AUTHENTICATION & RLS');
  console.log('Target URL:', supabaseUrl);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Sign up a random test customer
  const randomSuffix = Math.floor(Math.random() * 100000);
  const testEmail = `saideveena.farmer.${randomSuffix}@gmail.com`;
  const testPassword = `TestFarmerPass!${randomSuffix}`;
  const testName = `Farmer Test User ${randomSuffix}`;

  console.log(`1. Testing Customer Registration for: ${testEmail}`);
  const { data: signUpData, error: signUpError } = await client.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: testName,
        preferred_language: 'te'
      }
    }
  });

  assert(!signUpError, `Customer successfully registered via supabase.auth.signUp (${signUpError?.message || 'OK'})`);
  assert(signUpData?.user !== null, 'Customer Auth user record was created in auth.users');

  // If session is present or if auto-confirm is enabled:
  if (signUpData?.session) {
    console.log('\n2. Testing Authenticated Customer Authorization Boundaries:');
    const customerClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    await customerClient.auth.setSession({
      access_token: signUpData.session.access_token,
      refresh_token: signUpData.session.refresh_token
    });

    // 2A. Customer CANNOT insert into categories
    const catInsert = await customerClient.from('categories').insert({
      id: 'customer-fake-cat',
      name_en: 'Customer Category',
      name_te: 'కస్టమర్ విభాగం',
      display_order: 10,
      is_active: true
    });
    assert(catInsert.error !== null, `Authenticated customer BLOCKED from inserting category (${catInsert.error?.message || 'RLS denied'})`);

    // 2B. Customer CANNOT update product prices
    const prodUpdate = await customerClient.from('products').update({ price: 10 }).eq('id', 'some-product');
    assert(prodUpdate.error !== null || prodUpdate.count === 0, 'Authenticated customer cannot modify product prices');

    // 2C. Customer CANNOT insert into admin_users to self-promote
    const adminSelfPromote = await customerClient.from('admin_users').insert({
      id: signUpData.user.id,
      email: testEmail,
      role: 'super_admin',
      is_active: true
    });
    assert(adminSelfPromote.error !== null, `Authenticated customer BLOCKED from self-promoting to admin_users (${adminSelfPromote.error?.message || 'Permission denied'})`);

    // 2D. Admin check verification for customer account
    const { data: adminRecord } = await customerClient
      .from('admin_users')
      .select('id, is_active')
      .eq('id', signUpData.user.id)
      .eq('is_active', true)
      .maybeSingle();

    assert(!adminRecord, 'Customer is NOT an authorized administrator (admin_users record is null)');
  } else {
    console.log('[INFO] Email confirmation is enabled in this Supabase project. Session was withheld pending email verification.');
  }

  // 3. Test Password Reset request
  console.log('\n3. Testing Password Reset Request:');
  const { error: resetError } = await client.auth.resetPasswordForEmail(testEmail);
  assert(!resetError, `Password reset email trigger succeeded without error (${resetError?.message || 'OK'})`);

  console.log('\n====================================================');
  console.log(`CUSTOMER AUTH TEST COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runCustomerAuthTests().catch(err => {
  console.error('Customer Auth test failed:', err);
  process.exit(1);
});
