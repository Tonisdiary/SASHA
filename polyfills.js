import { Buffer } from 'buffer';
import 'react-native-get-random-values';

// Polyfill Buffer
if (typeof global !== 'undefined') {
  global.Buffer = Buffer;
}

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Polyfill process
if (typeof process === 'undefined') {
  global.process = require('process');
} else if (typeof process !== 'undefined' && !process.env) {
  process.env = {};
}

// Ensure environment variables are available
if (typeof process !== 'undefined' && process.env) {
  // Set environment variables from .env file if they're not already set
  if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://filluppmbagrzugmcqzb.supabase.co';
  }
  
  if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpbGx1cHBtYmFncnp1Z21jcXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MzYyNDEsImV4cCI6MjA1ODExMjI0MX0.-kpwNA0qqv_Q1odhvO4DnTLGhEF4cXSXAhwJkhruuxk';
  }
  
  console.log('Environment variables in polyfills.js:');
  console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
  console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
}

// Explicitly handle Node.js modules that might cause issues
if (typeof global !== 'undefined') {
  // Mark fs as unavailable to prevent errors
  global.fs = false;
  
  // Provide empty implementations for other Node.js modules if needed
  global.path = global.path || { join: (...args) => args.join('/') };
  
  // Handle crypto for web environments
  if (typeof window !== 'undefined' && !global.crypto) {
    global.crypto = window.crypto;
  }
  
  // Add console.log polyfill for environments where it might be missing
  if (!global.console) {
    global.console = {
      log: function() {},
      error: function() {},
      warn: function() {},
      info: function() {},
      debug: function() {}
    };
  }
}