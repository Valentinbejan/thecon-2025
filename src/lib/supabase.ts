import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Log for debugging (remove in production)
console.log('Supabase URL configured:', supabaseUrl ? 'Yes' : 'No');
console.log('Supabase Key configured:', supabaseAnonKey ? 'Yes' : 'No');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
