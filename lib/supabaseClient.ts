import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Log Supabase configuration for debugging
console.log('Supabase URL exists:', !!supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

// Validate Supabase configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase configuration. Using fallback values if available.');
}

// Create and export the Supabase client
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Verify the client was created successfully
if (!supabaseClient) {
  console.error('Failed to create Supabase client');
} else {
  console.log('Supabase client created successfully');
}
