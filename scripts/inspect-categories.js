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

async function inspect() {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) {
    console.error('Error querying categories:', error);
    return;
  }
  console.log(`Found ${data.length} categories.`);
  if (data.length > 0) {
    console.log('Columns in categories table:', Object.keys(data[0]));
    console.log('Categories data:', JSON.stringify(data, null, 2));
  }
}

inspect();
