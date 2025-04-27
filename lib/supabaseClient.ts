import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Hardcoded fallback values in case environment variables are not loaded
const FALLBACK_SUPABASE_URL = 'https://filluppmbagrzugmcqzb.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpbGx1cHBtYmFncnp1Z21jcXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MzYyNDEsImV4cCI6MjA1ODExMjI0MX0.-kpwNA0qqv_Q1odhvO4DnTLGhEF4cXSXAhwJkhruuxk';

// Get environment variables with fallbacks
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 
                    process.env.VITE_SUPABASE_URL || 
                    FALLBACK_SUPABASE_URL;

const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                        process.env.VITE_SUPABASE_ANON_KEY || 
                        FALLBACK_SUPABASE_ANON_KEY;

// Log environment variables for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);
console.log('Using environment variables:', 
  !!process.env.EXPO_PUBLIC_SUPABASE_URL || !!process.env.VITE_SUPABASE_URL);
console.log('Using fallback values:', 
  !process.env.EXPO_PUBLIC_SUPABASE_URL && !process.env.VITE_SUPABASE_URL);

// Show warning if using fallback values
if (!process.env.EXPO_PUBLIC_SUPABASE_URL && !process.env.VITE_SUPABASE_URL) {
  console.warn('Using fallback Supabase URL and key because environment variables are not loaded');
  
  if (Platform.OS === 'web') {
    // Add a visible warning for web
    setTimeout(() => {
      if (typeof document !== 'undefined') {
        const warningDiv = document.createElement('div');
        warningDiv.style.position = 'fixed';
        warningDiv.style.bottom = '0';
        warningDiv.style.left = '0';
        warningDiv.style.right = '0';
        warningDiv.style.padding = '10px';
        warningDiv.style.backgroundColor = '#eab308';
        warningDiv.style.color = 'black';
        warningDiv.style.zIndex = '9999';
        warningDiv.style.textAlign = 'center';
        warningDiv.style.fontSize = '14px';
        warningDiv.innerText = 'Using fallback Supabase credentials. Environment variables not loaded.';
        document.body.appendChild(warningDiv);
      }
    }, 1000);
  }
}

const isServer = typeof window === 'undefined';

// Define a fallback client with more detailed error messages
const fallbackClient = {
  auth: {
    getSession: async () => {
      console.error('Using fallback Supabase client - original client failed to initialize');
      return { 
        data: { session: null }, 
        error: new Error('Supabase client failed to initialize properly. Check console for details.') 
      };
    },
    signOut: async () => {
      return { error: new Error('Supabase client failed to initialize properly. Check console for details.') };
    },
    onAuthStateChange: (callback: any) => {
      console.error('Auth state change listener not available - Supabase client failed');
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: async () => {
      return { 
        data: { user: null, session: null }, 
        error: new Error('Supabase client failed to initialize properly. Check console for details.') 
      };
    },
    signUp: async () => {
      return { 
        data: { user: null, session: null }, 
        error: new Error('Supabase client failed to initialize properly. Check console for details.') 
      };
    }
  },
  from: () => ({
    select: () => Promise.resolve({ 
      data: null, 
      error: new Error('Supabase client failed to initialize. Check console for details.') 
    }),
    insert: () => Promise.resolve({ 
      data: null, 
      error: new Error('Supabase client failed to initialize. Check console for details.') 
    }),
    update: () => Promise.resolve({ 
      data: null, 
      error: new Error('Supabase client failed to initialize. Check console for details.') 
    }),
    upsert: () => Promise.resolve({ 
      data: null, 
      error: new Error('Supabase client failed to initialize. Check console for details.') 
    }),
    delete: () => Promise.resolve({ 
      data: null, 
      error: new Error('Supabase client failed to initialize. Check console for details.') 
    }),
  })
};

// Create the Supabase client
let supabaseClient: any;

try {
  console.log('Creating Supabase client with URL:', supabaseUrl);
  
  // Create the client with the URL and key
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: isServer ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: !isServer
    }
  });
  
  // Test the client with a simple query to ensure it's working
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change event:', event);
  });
  
  console.log('Supabase client created successfully');
} catch (error) {
  console.error('Error creating Supabase client:', error);
  
  // Use the fallback client if there's an error
  supabaseClient = fallbackClient;
  
  // Show an error message on web
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    setTimeout(() => {
      const errorDiv = document.createElement('div');
      errorDiv.style.position = 'fixed';
      errorDiv.style.top = '0';
      errorDiv.style.left = '0';
      errorDiv.style.right = '0';
      errorDiv.style.padding = '20px';
      errorDiv.style.backgroundColor = '#ef4444';
      errorDiv.style.color = 'white';
      errorDiv.style.zIndex = '9999';
      errorDiv.style.textAlign = 'center';
      errorDiv.innerText = `Error creating Supabase client: ${error instanceof Error ? error.message : 'Unknown error'}`;
      document.body.appendChild(errorDiv);
    }, 1000);
  }
}

// Export the Supabase client
export { supabaseClient };
