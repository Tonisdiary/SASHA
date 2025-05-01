// start.js - Helper script to start the app
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Study Buddy App...');

// Check if .env file exists
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('⚠️ .env file not found, creating one with default values...');
  const envContent = `EXPO_PUBLIC_SUPABASE_URL=https://filluppmbagrzugmcqzb.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpbGx1cHBtYmFncnp1Z21jcXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MzYyNDEsImV4cCI6MjA1ODExMjI0MX0.-kpwNA0qqv_Q1odhvO4DnTLGhEF4cXSXAhwJkhruuxk
EXPO_PUBLIC_SERPAPI_KEY=f0526884d28af42151e18ad79e70f0e87363ac728c1c067a4c15ef805ac0126c
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCtZRfFVGUDgl47DSFP1YL2p5WdO3uKODA
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dGlkeS1jb3lvdGUtODcuY2xlcmsuYWNjb3VudHMuZGV2JA
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpbGx1cHBtYmFncnp1Z21jcXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MzYyNDEsImV4cCI6MjA1ODExMjI0MX0.-kpwNA0qqv_Q1odhvO4DnTLGhEF4cXSXAhwJkhruuxk
VITE_SUPABASE_URL=https://filluppmbagrzugmcqzb.supabase.co

# Skip Android build if adb is not available
EXPO_NO_ANDROID_DEVICE_CHECK=1`;
  fs.writeFileSync(path.join(__dirname, '.env'), envContent);
}

// Check if node_modules exists
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Install TypeScript dependencies if needed
console.log('📦 Installing TypeScript dependencies...');
try {
  execSync('npm install --save-dev @types/react-native', { stdio: 'inherit' });
} catch (error) {
  console.warn('⚠️ Failed to install TypeScript dependencies:', error.message);
}

// Start the app
console.log('🌐 Starting the app in web mode...');
try {
  execSync('npx expo start --web', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to start the app:', error.message);
  
  // Try to fix common issues
  console.log('🔧 Attempting to fix common issues...');
  
  // Run the fix-web.js script if it exists
  if (fs.existsSync(path.join(__dirname, 'fix-web.js'))) {
    console.log('🔧 Running fix-web.js...');
    try {
      execSync('node fix-web.js', { stdio: 'inherit' });
      
      // Try starting the app again
      console.log('🌐 Trying to start the app again...');
      execSync('npm run web', { stdio: 'inherit' });
    } catch (fixError) {
      console.error('❌ Failed to fix and restart the app:', fixError.message);
    }
  }
}