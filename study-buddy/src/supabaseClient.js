import { createClient } from '@supabase/supabase-js'

// Ensure your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Basic validation and logging
if (!supabaseUrl) {
  console.error("Warning: VITE_SUPABASE_URL is not defined. Please check your .env file.");
}
if (!supabaseAnonKey) {
  console.error("Warning: VITE_SUPABASE_ANON_KEY is not defined. Please check your .env file.");
}

// Initialize Supabase client
// It's okay if the variables are initially undefined; Supabase methods will fail if called without proper init.
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// You can add a simple function to test the connection if needed,
// but typically, the first auth or database call will reveal connection issues.
// async function checkSupabaseConnection() {
//   try {
//     // Attempt a simple query that requires authentication config but not necessarily a logged-in user
//     const { error } = await supabase.from('profiles').select('id').limit(1);
//     if (error && error.message !== 'relation "public.profiles" does not exist') { // Ignore if table just doesn't exist yet
//        console.error('Supabase connection check failed:', error.message);
//     } else {
//        console.log('Supabase client initialized potentially successfully.');
//     }
//   } catch (e) {
//     console.error('Error during Supabase connection check:', e);
//   }
// }
// checkSupabaseConnection(); // Call check on load
