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

async function runAudit() {
  console.log('--- 1. Testing live customer_enquiries table presence ---');
  const { data: enqData, error: enqErr } = await supabase.from('customer_enquiries').select('*').limit(1);
  console.log('Live customer_enquiries query result:', {
    exists: !enqErr,
    errorCode: enqErr ? enqErr.code : null,
    errorMessage: enqErr ? enqErr.message : 'Table exists'
  });

  console.log('\n--- 2. Testing existing products and categories tables ---');
  const { count: prodCount, error: prodErr } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log('Products check:', { count: prodCount, error: prodErr ? prodErr.message : null });

  const { count: catCount, error: catErr } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  console.log('Categories check:', { count: catCount, error: catErr ? catErr.message : null });

  console.log('\n--- 3. Testing admin_users and is_admin() RPC ---');
  const { data: adminData, error: adminErr } = await supabase.from('admin_users').select('id').limit(1);
  console.log('Direct anon select on admin_users:', {
    blocked: !!adminErr,
    error: adminErr ? adminErr.message : 'UNPROTECTED'
  });

  const { data: isAdm, error: isAdmErr } = await supabase.rpc('is_admin');
  console.log('Anon is_admin() call result:', {
    result: isAdm,
    error: isAdmErr ? isAdmErr.message : null
  });
}

runAudit();
