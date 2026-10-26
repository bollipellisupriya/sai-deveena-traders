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

async function inspectSchema() {
  console.log('=== INSPECTING EXISTING DATABASE SCHEMA ===');

  // Check customer_profiles
  const { data: profiles, error: profError } = await supabase.from('customer_profiles').select('*').limit(5);
  console.log('1. customer_profiles:', {
    exists: !profError || profError.code !== '42P01',
    count: profiles ? profiles.length : null,
    error: profError ? { message: profError.message, code: profError.code } : null
  });

  // Check orders
  const { data: orders, error: orderError } = await supabase.from('orders').select('*').limit(5);
  console.log('2. orders:', {
    exists: !orderError || orderError.code !== '42P01',
    count: orders ? orders.length : null,
    error: orderError ? { message: orderError.message, code: orderError.code } : null
  });

  // Check order_items
  const { data: items, error: itemError } = await supabase.from('order_items').select('*').limit(5);
  console.log('3. order_items:', {
    exists: !itemError || itemError.code !== '42P01',
    count: items ? items.length : null,
    error: itemError ? { message: itemError.message, code: itemError.code } : null
  });
}

inspectSchema();
