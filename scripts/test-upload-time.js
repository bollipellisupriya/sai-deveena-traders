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

async function testUploadTime() {
  console.log('Testing upload timing...');
  const start = Date.now();
  const buffer = Buffer.from('test small image');
  
  try {
    const res = await supabase.storage.from('product-images').upload('test/test.png', buffer, {
      contentType: 'image/png'
    });
    console.log('Upload returned in:', Date.now() - start, 'ms');
    console.log('Result:', res);
  } catch (e) {
    console.log('Upload exception in:', Date.now() - start, 'ms', e);
  }
}

testUploadTime();
