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

if (!supabaseKey || supabaseKey.includes('PASTE_YOUR_PUBLIC_KEY_HERE')) {
  console.error('Error: VITE_SUPABASE_ANON_KEY is not configured in .env.local');
  process.exit(1);
}

const anonClient = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log('====================================================');
  console.log('SAI DEVEENA TRADERS: AUTH & RLS SECURITY VERIFICATION');
  console.log('Target URL:', supabaseUrl);
  console.log('Key Prefix:', supabaseKey.substring(0, 15) + '...');
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

  // ---------------------------------------------------------------
  // 1. ANONYMOUS VISITOR TESTS
  // ---------------------------------------------------------------
  console.log('--- TEST SUITE 1: Anonymous Access & Hardened RLS ---');

  // 1A. Anon can read active categories
  const catRead = await anonClient.from('categories').select('*');
  assert(!catRead.error, 'Anon can query active categories without error');

  // 1B. Anon can read active products
  const prodRead = await anonClient.from('products').select('*');
  assert(!prodRead.error, 'Anon can query active products without error');

  // 1C. Anon CANNOT insert into categories
  const catInsert = await anonClient.from('categories').insert({
    id: 'hacker-cat',
    name_en: 'Hacker Dept',
    name_te: 'హాకర్',
    display_order: 99,
    is_active: true
  });
  assert(catInsert.error !== null, `Anon blocked from inserting category (${catInsert.error?.message || 'RLS denied'})`);

  // 1D. Anon CANNOT insert into products
  const prodInsert = await anonClient.from('products').insert({
    id: 'hacker-prod',
    category_id: 'seeds',
    name_en: 'Illegal Product',
    name_te: 'అక్రమ ఉత్పత్తి',
    price: 1,
    description_en: 'Exploit attempt',
    description_te: 'దాడి',
    active: true,
    featured: false,
    in_stock: true,
    key_features: []
  });
  assert(prodInsert.error !== null, `Anon blocked from inserting product (${prodInsert.error?.message || 'RLS denied'})`);

  // 1E. Anon CANNOT read or insert into admin_users
  const adminRead = await anonClient.from('admin_users').select('*');
  assert(adminRead.error !== null, `Anon blocked from reading admin_users table (${adminRead.error?.message || 'RLS denied'})`);

  const adminInsert = await anonClient.from('admin_users').insert({
    id: '00000000-0000-0000-0000-000000000000',
    email: 'hacker@example.com',
    role: 'super_admin',
    is_active: true
  });
  assert(adminInsert.error !== null, `Anon blocked from inserting into admin_users (${adminInsert.error?.message || 'RLS denied'})`);

  // 1F. Anon CANNOT upload files to storage
  const fakeBlob = Buffer.from('test');
  const storageUpload = await anonClient.storage.from('product-images').upload('test.png', fakeBlob);
  assert(storageUpload.error !== null, `Anon blocked from unauthorized image upload (${storageUpload.error?.message || 'RLS denied'})`);

  // ---------------------------------------------------------------
  // 2. VALIDATION TESTS
  // ---------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: Customer Input Validation ---');

  // Manual inline validation test matching customerAuthService.validateRegistration
  function validateRegistration(fullName, email, password, confirmPassword) {
    if (!fullName || fullName.trim().length < 2) {
      return { isValid: false, error: 'Please enter your full name (at least 2 characters).' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return { isValid: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters long.' };
    }
    if (password !== confirmPassword) {
      return { isValid: false, error: 'Passwords do not match. Please re-enter.' };
    }
    return { isValid: true, error: null };
  }

  const v1 = validateRegistration('', 'test@example.com', 'pass123', 'pass123');
  assert(!v1.isValid && v1.error.includes('full name'), 'Rejects empty full name');

  const v2 = validateRegistration('Ramesh Kumar', 'invalid-email', 'pass123', 'pass123');
  assert(!v2.isValid && v2.error.includes('valid email'), 'Rejects invalid email');

  const v3 = validateRegistration('Ramesh Kumar', 'ramesh@example.com', '123', '123');
  assert(!v3.isValid && v3.error.includes('at least 6 characters'), 'Rejects short password');

  const v4 = validateRegistration('Ramesh Kumar', 'ramesh@example.com', 'password123', 'mismatch456');
  assert(!v4.isValid && v4.error.includes('do not match'), 'Rejects mismatched passwords');

  const v5 = validateRegistration('Ramesh Kumar', 'ramesh@example.com', 'password123', 'password123');
  assert(v5.isValid, 'Accepts valid registration inputs');

  // ---------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------
  console.log('\n====================================================');
  console.log(`TEST RUN COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
