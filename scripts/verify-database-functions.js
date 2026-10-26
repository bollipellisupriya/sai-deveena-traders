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

async function verifyFunctions() {
  console.log('=== VERIFYING DATABASE FUNCTIONS & SCHEMAS ===');

  // Test admin_users
  const { data: adminData, error: adminErr } = await supabase.from('admin_users').select('id, email, is_active').limit(1);
  console.log('1. admin_users query (anon):', {
    blocked: !!adminErr,
    message: adminErr ? adminErr.message : 'Accessible (should be restricted)'
  });

  // Test is_admin RPC
  const { data: rpcData, error: rpcErr } = await supabase.rpc('is_admin');
  console.log('2. is_admin() function check:', {
    exists: !rpcErr || !rpcErr.message.includes('Could not find the function'),
    result: rpcData,
    error: rpcErr ? rpcErr.message : null
  });
}

verifyFunctions();
