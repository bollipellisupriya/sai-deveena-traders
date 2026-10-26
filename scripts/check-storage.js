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

async function checkStorage() {
  console.log('=== SUPABASE STORAGE DIAGNOSTIC ===');
  console.log('Supabase URL:', env.VITE_SUPABASE_URL);

  // 1. List buckets
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  console.log('1. List Buckets:', { buckets, listError });

  // 2. Get specific bucket
  const { data: bucket, error: getError } = await supabase.storage.getBucket('product-images');
  console.log('2. Get "product-images" Bucket:', { bucket, getError });

  // 3. Test upload attempt and capture full error object
  const sampleData = Buffer.from('test small png file content');
  const uploadPath = `categories/${Date.now()}_test.png`;
  
  const uploadResult = await supabase.storage
    .from('product-images')
    .upload(uploadPath, sampleData, {
      contentType: 'image/png',
      upsert: false
    });

  console.log('3. Upload Attempt Result:');
  if (uploadResult.error) {
    console.log('Error message:', uploadResult.error.message);
    console.log('Error details:', JSON.stringify(uploadResult.error, null, 2));
    console.log('Error status:', uploadResult.error.status);
    console.log('Error statusCode:', uploadResult.error.statusCode);
  } else {
    console.log('Upload succeeded:', uploadResult.data);
  }
}

checkStorage();
