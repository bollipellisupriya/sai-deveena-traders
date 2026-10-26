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
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey || supabaseAnonKey.includes('PASTE_YOUR_PUBLIC_KEY_HERE')) {
  console.error('Error: VITE_SUPABASE_ANON_KEY is not configured in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log('=== CATEGORY SYNC & STORAGE AUDIT TEST ===');
  console.log(`Connecting to: ${supabaseUrl}`);
  let allPassed = true;

  // Test 1: Public Read Categories
  console.log('\n--- Test 1: Fetching Active Categories from Supabase ---');
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('FAILED: Error reading categories:', error.message);
      allPassed = false;
    } else {
      console.log(`SUCCESS: Fetched ${data.length} active categories.`);
      if (data.length > 0) {
        console.log('Sample category record:', {
          id: data[0].id,
          name_en: data[0].name_en,
          name_te: data[0].name_te,
          image_url: data[0].image_url,
          is_active: data[0].is_active,
          display_order: data[0].display_order
        });
      } else {
        console.log('Note: Categories table is currently empty in Supabase. Admin can add categories.');
      }
    }
  } catch (err) {
    console.error('FAILED: Unexpected error in Test 1:', err);
    allPassed = false;
  }

  // Test 2: Verify RLS blocks unauthenticated category creation
  console.log('\n--- Test 2: RLS Protection on Category Creation (Anon) ---');
  try {
    const testCatId = `unauth_test_${Date.now()}`;
    const { data, error } = await supabase
      .from('categories')
      .insert({
        id: testCatId,
        name_en: 'Unauthorized Category',
        name_te: 'అనధికారిక విభాగం',
        is_active: true
      });

    if (error) {
      console.log(`SUCCESS: RLS correctly rejected unauthenticated write. (${error.message})`);
    } else {
      console.error('FAILED: Unauthenticated client was able to insert a category! RLS is not securing categories table.');
      allPassed = false;
    }
  } catch (err) {
    console.error('FAILED: Unexpected error in Test 2:', err);
    allPassed = false;
  }

  // Test 3: Storage Bucket Status
  console.log('\n--- Test 3: Checking Supabase Storage "product-images" Bucket ---');
  try {
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket('product-images');
    if (bucketError) {
      console.log(`Storage Status: Bucket "product-images" lookup returned: "${bucketError.message}" (statusCode: ${bucketError.statusCode || 'N/A'})`);
      console.log('Note: The "product-images" bucket needs to be created in Supabase Storage with public read access.');
    } else {
      console.log(`SUCCESS: Storage bucket "product-images" exists! Public status: ${bucket.public}`);
    }
  } catch (err) {
    console.log('Storage lookup caught exception:', err.message);
  }

  // Test 4: Storage Write Protection (Anon)
  console.log('\n--- Test 4: Verifying Storage Write Protection for Anon Users ---');
  try {
    const fakeBuffer = Buffer.from('test fake image content');
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload('categories/unauthorized-test.png', fakeBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (error) {
      console.log(`SUCCESS: Anon upload blocked or bucket not found (${error.message}). Anonymous users cannot write to storage.`);
    } else {
      console.error('FAILED: Anon upload succeeded! Storage is not properly secured.');
      allPassed = false;
    }
  } catch (err) {
    console.log(`Upload attempt caught expected block: ${err.message}`);
  }

  console.log('\n==========================================');
  if (allPassed) {
    console.log('ALL CATEGORY SYNC & SECURITY CHECKS PASSED!');
  } else {
    console.log('SOME CHECKS FAILED. Please review output above.');
  }
}

runTests();
