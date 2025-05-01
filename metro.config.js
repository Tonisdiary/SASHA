// Simple metro config for Expo
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the default Metro configuration
const config = getDefaultConfig(__dirname);

// Add additional file extensions
config.resolver.sourceExts.push('mjs', 'cjs');

// Add custom transformer for handling JSX in react-native-maps
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('./customBabelTransformer.js'),
};

// Add polyfills and mocks for web compatibility
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-maps': path.resolve(__dirname, 'node_modules/react-native-maps'),
  // Node.js polyfills
  'fs': path.resolve(__dirname, 'app/emptyModule.js'),
  'path': path.resolve(__dirname, 'node_modules/path-browserify'),
  'stream': path.resolve(__dirname, 'node_modules/stream-browserify'),
  'crypto': path.resolve(__dirname, 'node_modules/crypto-browserify'),
  'buffer': path.resolve(__dirname, 'node_modules/buffer'),
  // Node.js mocks
  'vm': path.resolve(__dirname, 'app/mockVm.js'),
  'http': path.resolve(__dirname, 'app/emptyModule.js'),
  'https': path.resolve(__dirname, 'app/emptyModule.js'),
  'url': path.resolve(__dirname, 'app/emptyModule.js'),
  'net': path.resolve(__dirname, 'app/emptyModule.js'),
  'tls': path.resolve(__dirname, 'app/emptyModule.js'),
  // React Native mocks
  '@react-native/EventEmitter/NativeEventEmitter': path.resolve(__dirname, 'app/emptyModule.js'),
  'react-native/Libraries/EventEmitter/NativeEventEmitter': path.resolve(__dirname, 'app/emptyModule.js'),
};

// Add blocklist for problematic modules
config.resolver.blockList = [
  /node_modules\/webpack\/.*$/,
  /node_modules\/terser-webpack-plugin\/.*$/,
  /node_modules\/lightningcss\/node\/index.js/,
  /node_modules\/svgo\/lib\/svgo-node.js/,
  /node_modules\/graceful-fs\/polyfills.js/,
];

module.exports = config;