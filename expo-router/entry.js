// Import polyfills first
import '../polyfills';
import '../app/shim';

// Then import runtime and components
import '@expo/metro-runtime';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import React from 'react';

// Safely check environment variables
const checkEnvVars = () => {
  try {
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Missing Supabase environment variables. Please check your .env file.');
    }
  } catch (error) {
    console.warn('Error checking environment variables:', error);
  }
};

// Check environment variables but don't throw (which would break the app)
checkEnvVars();

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('../app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
