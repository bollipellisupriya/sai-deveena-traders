import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables
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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

function testFilenameSanitization() {
  console.log('=== TEST 1: Filename Sanitization & Extension Handling ===');
  const testCases = [
    'category_fertilizer.png',
    'seeds.photo.jpg',
    'my-pesticide.PNG',
    'organic fertilizer (best).webp',
    'noextension'
  ];

  for (const name of testCases) {
    const dotIndex = name.lastIndexOf('.');
    const rawBaseName = dotIndex !== -1 ? name.substring(0, dotIndex) : name;
    const fileExt = (dotIndex !== -1 ? name.substring(dotIndex + 1) : 'jpg').toLowerCase();
    const sanitizedBase = rawBaseName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase().slice(0, 50) || 'image';
    const finalFilename = `123456789_${sanitizedBase}.${fileExt}`;
    
    console.log(`Original: "${name}" -> Output: "${finalFilename}"`);
    if (finalFilename.endsWith('.png.png') || finalFilename.endsWith('.jpg.jpg') || finalFilename.endsWith('.webp.webp')) {
      throw new Error(`Double extension detected in: ${finalFilename}`);
    }
  }
  console.log('[PASS] Filename sanitization generates clean single extensions.');
}

async function testCustomerCategorySync() {
  console.log('\n=== TEST 2: Customer App Category Sync Query ===');
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[FAIL] Category query failed:', error.message);
  } else {
    console.log(`[PASS] Customer app will receive ${data.length} active categories:`);
    data.forEach((cat, i) => {
      console.log(`  ${i + 1}. [${cat.id}] EN: "${cat.name_en}" | TE: "${cat.name_te}" | Order: ${cat.display_order} | Image: ${cat.image || '(none)'}`);
    });
  }
}

async function run() {
  testFilenameSanitization();
  await testCustomerCategorySync();
}

run();
