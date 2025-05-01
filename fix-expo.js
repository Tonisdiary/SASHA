// fix-expo.js - Script to fix common Expo issues
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Expo Troubleshooter');
console.log('=====================');

// Clear Metro bundler cache
console.log('\n📋 Clearing Metro bundler cache...');
try {
  execSync('npx expo start --clear', { stdio: 'inherit' });
  console.log('✅ Metro bundler cache cleared');
} catch (error) {
  console.error('❌ Error clearing Metro bundler cache:', error.message);
}

// Install missing dependencies
console.log('\n📋 Installing missing dependencies...');
try {
  execSync('npm install --save-dev @types/react-native', { stdio: 'inherit' });
  console.log('✅ TypeScript dependencies installed');
} catch (error) {
  console.error('❌ Error installing TypeScript dependencies:', error.message);
}

// Fix node_modules issues
console.log('\n📋 Fixing node_modules issues...');
try {
  // Remove problematic node_modules
  if (fs.existsSync(path.join(__dirname, 'node_modules', '.cache'))) {
    fs.rmSync(path.join(__dirname, 'node_modules', '.cache'), { recursive: true, force: true });
    console.log('✅ Removed node_modules/.cache');
  }
  
  // Run npm install to fix any dependency issues
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies reinstalled');
} catch (error) {
  console.error('❌ Error fixing node_modules:', error.message);
}

console.log('\n🎉 Troubleshooting complete!');
console.log('\nNext steps:');
console.log('1. Try running the app again: npm run web');
console.log('2. If issues persist, try running: npx expo start --no-dev --web');
console.log('3. Check browser console (F12) for any errors');