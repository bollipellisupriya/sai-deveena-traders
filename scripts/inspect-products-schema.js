import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function inspectProductsSchema() {
  console.log('=== INSPECTING PUBLIC.PRODUCTS & PUBLIC.ADMIN_USERS SCHEMA ===');

  // Query products
  const { data: prods, error: prodErr } = await supabase.from('products').select('*').limit(1);
  if (prodErr) {
    console.error('Error querying products:', prodErr);
  } else {
    console.log('Products table exists!');
    if (prods.length > 0) {
      console.log('Product columns from live row:', Object.keys(prods[0]));
      console.log('Sample product:', prods[0]);
    } else {
      console.log('Products table is currently empty.');
    }
  }

  // Also query a non-existent row to see column error or select specific columns
  const testCols = [
    'id', 'category_id', 'sub_category', 'name_en', 'name_te', 
    'brand', 'pack_size', 'price', 'original_price', 'description_en', 
    'description_te', 'image', 'active', 'featured', 'in_stock', 
    'key_features', 'usage_en', 'usage_te', 'created_at', 'updated_at'
  ];

  const { data: colTest, error: colErr } = await supabase
    .from('products')
    .select(testCols.join(','))
    .limit(0);

  if (colErr) {
    console.error('Column test error:', colErr);
  } else {
    console.log('All expected product columns confirmed present in public.products!');
  }
}

inspectProductsSchema();
