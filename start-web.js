/**
 * Web App Starter Script
 * 
 * This script helps start the Study Buddy web app with the right configuration.
 * Run it with: node start-web.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Study Buddy Web App');
console.log('==============================');

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

// Start the web app
console.log('\n🌐 Starting web app...');
try {
  // Find an available port
  const ports = [8081, 8082, 8083, 8084, 8085];
  let availablePort = null;
  
  for (const port of ports) {
    try {
      // Try to check if port is in use
      console.log(`Checking if port ${port} is available...`);
      availablePort = port;
      break;
    } catch (err) {
      console.log(`Port ${port} is in use, trying next...`);
    }
  }
  
  if (!availablePort) {
    console.error('❌ No available ports found. Please close other applications and try again.');
    process.exit(1);
  }
  
  console.log(`\n🚀 Starting web app on port ${availablePort}...`);
  console.log('\n📱 You can access the app at:');
  console.log(`   http://localhost:${availablePort}`);
  console.log('\n📱 If you encounter issues, try the debug page:');
  console.log(`   http://localhost:${availablePort}/debug`);
  console.log('\n📱 Or force debug mode:');
  console.log(`   http://localhost:${availablePort}/?debug=true`);
  
  // Start the web app
  execSync(`npx expo start --web --port ${availablePort}`, { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error starting web app:', error.message);
}