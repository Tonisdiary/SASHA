/**
 * Web App Troubleshooting Script
 * 
 * This script helps fix common issues with the Study Buddy web app.
 * Run it with: node fix-web.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Study Buddy Web App Troubleshooter');
console.log('====================================');

// Check if .env file exists and has required variables
console.log('\n📋 Checking environment variables...');
try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
      'EXPO_PUBLIC_SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY'
    ];
    
    const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
    
    if (missingVars.length > 0) {
      console.log('❌ Missing required environment variables:', missingVars.join(', '));
    } else {
      console.log('✅ Environment variables look good');
    }
  } else {
    console.log('❌ .env file not found');
  }
} catch (error) {
  console.error('❌ Error checking environment variables:', error.message);
}

// Fix react-native-calendars pom.xml
console.log('\n📋 Fixing react-native-calendars Maven issue...');
try {
  const pomPath = path.resolve(__dirname, 'node_modules/react-native-calendars/pom.xml');
  if (fs.existsSync(pomPath)) {
    // Create a backup if it doesn't exist
    const backupPath = pomPath + '.backup';
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(pomPath, backupPath);
    }
    
    // Replace the content with a simplified version that doesn't require a parent POM
    const newContent = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.wixpress.hotels</groupId>
    <artifactId>wix-react-native-calendar</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    <name>Wix React Native Calendar</name>
    <description>WiX React Native Calendar</description>
    <!-- Removed parent reference that was causing build issues -->
    <developers>
        <developer>
            <name>Lev Vidrak</name>
            <email>levv@wix.com</email>
            <roles>
                <role>owner</role>
            </roles>
        </developer>
        <developer>
            <id>tautvilas@wix.com</id>
            <name>Tautvilas Mecinskas</name>
            <email>tautvilas@wix.com</email>
            <organization>Wix</organization>
            <organizationUrl>http://www.wix.com</organizationUrl>
            <roles>
                <role>owner</role>
            </roles>
            <timezone>-2</timezone>
        </developer>
    </developers>
</project>`;
    
    fs.writeFileSync(pomPath, newContent);
    console.log('✅ Fixed react-native-calendars Maven issue');
  } else {
    console.log('ℹ️ react-native-calendars pom.xml not found, no action needed');
  }
} catch (error) {
  console.error('❌ Error fixing react-native-calendars:', error.message);
}

// Check metro.config.js
console.log('\n📋 Checking metro.config.js...');
try {
  const metroConfigPath = path.resolve(__dirname, 'metro.config.js');
  if (fs.existsSync(metroConfigPath)) {
    const metroContent = fs.readFileSync(metroConfigPath, 'utf8');
    
    if (metroContent.includes('module.exports = getConfig();')) {
      console.log('❌ Found incorrect export in metro.config.js, fixing...');
      const fixedContent = metroContent.replace(
        'module.exports = getConfig();',
        'module.exports = getConfig;'
      );
      fs.writeFileSync(metroConfigPath, fixedContent);
      console.log('✅ Fixed metro.config.js');
    } else {
      console.log('✅ metro.config.js looks good');
    }
  }
} catch (error) {
  console.error('❌ Error checking metro.config.js:', error.message);
}

// Create patch for react-native-calendars
console.log('\n📋 Creating patch for react-native-calendars...');
try {
  execSync('npx patch-package react-native-calendars', { stdio: 'inherit' });
  console.log('✅ Created patch for react-native-calendars');
} catch (error) {
  console.error('❌ Error creating patch:', error.message);
}

console.log('\n🎉 Troubleshooting complete!');
console.log('\nNext steps:');
console.log('1. Try running the web app again: npm run web');
console.log('2. If issues persist, try accessing the debug page directly: http://localhost:8081/debug');
console.log('3. Check browser console (F12) for any errors');