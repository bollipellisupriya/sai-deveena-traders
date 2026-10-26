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

async function testTiming() {
  console.log('Testing network latency to Supabase...');
  
  const t0 = Date.now();
  const { data: catData, error: catErr } = await supabase.from('categories').select('*');
  console.log(`SELECT categories took: ${Date.now() - t0}ms`);

  const t1 = Date.now();
  const { data: prodData, error: prodErr } = await supabase.from('products').select('*');
  console.log(`SELECT products took: ${Date.now() - t1}ms`);
}

testTiming();
