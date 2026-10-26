import { createClient } from '@supabase/supabase-js';

// Primary project public credentials (used directly in production/Vercel without requiring local .env setup)
const DEFAULT_SUPABASE_URL = 'https://ypeeiwlwegfnocvayxdv.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_KqbSxte-ZIhzAKxtG8k1hQ_bshSTu12';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabaseUrl = (typeof rawUrl === 'string' ? rawUrl : DEFAULT_SUPABASE_URL).trim();
export const supabaseAnonKey = (typeof rawAnonKey === 'string' ? rawAnonKey : DEFAULT_SUPABASE_ANON_KEY).trim();

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasUrl: boolean;
  urlHost: string;
  hasKey: boolean;
  keyType: 'publishable' | 'jwt' | 'placeholder' | 'missing' | 'unknown';
  message: string;
}

/**
 * Safe inspection of Supabase configuration status without logging or exposing secrets.
 */
export const getSupabaseConfigStatus = (): SupabaseConfigStatus => {
  let urlHost = '';
  try {
    if (supabaseUrl) {
      urlHost = new URL(supabaseUrl).hostname;
    }
  } catch {
    urlHost = 'invalid-url';
  }

  const isPlaceholder = !supabaseAnonKey ||
    supabaseAnonKey.includes('PASTE_YOUR_PUBLIC_KEY_HERE') ||
    supabaseAnonKey.includes('your_supabase_anon_public_key_here') ||
    supabaseAnonKey.includes('dummy-anon-key');

  let keyType: SupabaseConfigStatus['keyType'] = 'missing';
  if (!supabaseAnonKey) {
    keyType = 'missing';
  } else if (isPlaceholder) {
    keyType = 'placeholder';
  } else if (supabaseAnonKey.startsWith('sb_publishable_')) {
    keyType = 'publishable';
  } else if (supabaseAnonKey.startsWith('eyJ')) {
    keyType = 'jwt';
  } else {
    keyType = 'unknown';
  }

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey &&
    !isPlaceholder &&
    (keyType === 'publishable' || keyType === 'jwt')
  );

  let message = 'Supabase client is configured and ready.';
  if (!supabaseUrl) {
    message = 'Missing VITE_SUPABASE_URL in .env.local';
  } else if (keyType === 'missing') {
    message = 'Missing VITE_SUPABASE_ANON_KEY in .env.local';
  } else if (keyType === 'placeholder') {
    message = 'VITE_SUPABASE_ANON_KEY contains a placeholder value. Please paste your actual public key into .env.local.';
  } else if (keyType === 'unknown') {
    message = 'VITE_SUPABASE_ANON_KEY format unrecognized (expected "sb_publishable_" or "eyJ").';
  }

  return {
    isConfigured,
    hasUrl: Boolean(supabaseUrl),
    urlHost,
    hasKey: Boolean(supabaseAnonKey),
    keyType,
    message
  };
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfigStatus().isConfigured;
};

// Fallback dummy key to prevent crash when module loads without environment variables
const effectiveKey = supabaseAnonKey && !supabaseAnonKey.includes('PASTE_YOUR_PUBLIC_KEY_HERE')
  ? supabaseAnonKey
  : 'placeholder-anon-key';

export const supabase = createClient(
  supabaseUrl || 'https://ypeeiwlwegfnocvayxdv.supabase.co',
  effectiveKey
);
