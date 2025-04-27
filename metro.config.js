const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

async function getConfig() {
  const config = await getDefaultConfig(__dirname);

  config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve('./customBabelTransformer.js'),
    experimentalImportSupport: false,
    inlineRequires: true,
  };

  config.resolver = {
    ...config.resolver,
    sourceExts: [...config.resolver.sourceExts, 'mjs', 'cjs'],
    // Add blocklist for problematic webpack modules
    blockList: [
      /node_modules\/webpack\/lib\/ids\/SyncModuleIdsPlugin.js/,
      /node_modules\/webpack\/lib\/javascript\/JavascriptModulesPlugin.js/,
      /node_modules\/webpack\/lib\/NormalModule.js/,
      /node_modules\/webpack\/lib\/schemes\/HttpUriPlugin.js/,
      /node_modules\/webpack\/lib\/FileSystemInfo.js/,
      /node_modules\/terser-webpack-plugin\/dist\/utils.js/,
      /node_modules\/terser-webpack-plugin\/dist\/index.js/,
      /node_modules\/lightningcss\/node\/index.js/,
      /node_modules\/svgo\/lib\/svgo-node.js/,
      /node_modules\/graceful-fs\/polyfills.js/,
      /node_modules\/globby\/index.js/,
      /node_modules\/expo-router\/node\/render.js/,
      /node_modules\/react-native-fs/,
    ],
    extraNodeModules: {
      ...config.resolver.extraNodeModules,
      'react-native-maps': path.resolve(__dirname, 'node_modules/react-native-maps'),
      // Add polyfills for Node.js modules
      'fs': path.resolve(__dirname, 'app/mockFs.js'),
      'path': path.resolve(__dirname, 'node_modules/path-browserify'),
      'stream': path.resolve(__dirname, 'node_modules/stream-browserify'),
      'crypto': path.resolve(__dirname, 'node_modules/crypto-browserify'),
      'buffer': path.resolve(__dirname, 'node_modules/buffer'),
      // Add mocks for Node.js modules
      'vm': path.resolve(__dirname, 'app/mockVm.js'),
      'querystring': path.resolve(__dirname, 'app/mockQuerystring.js'),
      'zlib': path.resolve(__dirname, 'app/emptyModule.js'),
      'http': path.resolve(__dirname, 'app/emptyModule.js'),
      'https': path.resolve(__dirname, 'app/emptyModule.js'),
      'url': path.resolve(__dirname, 'app/emptyModule.js'),
      'net': path.resolve(__dirname, 'app/emptyModule.js'),
      'tls': path.resolve(__dirname, 'app/emptyModule.js'),
      'assert': path.resolve(__dirname, 'app/emptyModule.js'),
      'util': path.resolve(__dirname, 'app/emptyModule.js'),
      'os': path.resolve(__dirname, 'app/mockOs.js'),
      'module': path.resolve(__dirname, 'app/mockModule.js'),
      'constants': path.resolve(__dirname, 'app/mockConstants.js'),
      // Add mocks for npm modules
      'uglify-js': path.resolve(__dirname, 'app/emptyModule.js'),
      '@swc/core': path.resolve(__dirname, 'app/emptyModule.js'),
      'esbuild': path.resolve(__dirname, 'app/emptyModule.js'),
      'svgo': path.resolve(__dirname, 'app/mockSvgo.js'),
      'graceful-fs': path.resolve(__dirname, 'app/mockGracefulFs.js'),
      'globby': path.resolve(__dirname, 'app/mockGlobby.js'),
      // Mock for expo-router
      'expo-router/node/render': path.resolve(__dirname, 'app/mockExpoRouterRender.js'),
      'react-native-fs': path.resolve(__dirname, 'app/mockFs.js'),
      // Mock for lightningcss
      'lightningcss': path.resolve(__dirname, 'app/mockLightningcss.js'),
      '../pkg': path.resolve(__dirname, 'app/emptyModule.js'),
      'node:fs': path.resolve(__dirname, 'app/mockFs.js'),
    },
    resolverMainFields: ['browser', 'main'],
  };

  // Custom resolver for problematic modules
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    // Handle webpack modules
    if (moduleName.includes('webpack') || 
        (context.originModulePath && context.originModulePath.includes('webpack'))) {
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, 'app/emptyModule.js'),
      };
    }
    
    // Handle lightningcss pkg directory issue
    if (moduleName === '../pkg' && context.originModulePath.includes('lightningcss/node/index.js')) {
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, 'app/emptyModule.js'),
      };
    }
    
    // Handle lightningcss module
    if (moduleName === 'lightningcss' || 
        (context.originModulePath && context.originModulePath.includes('lightningcss'))) {
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, 'app/mockLightningcss.js'),
      };
    }
    
    // Handle relative path resolution issues
    if (moduleName.startsWith('../../../../../') || 
        moduleName.startsWith('../../../../..') || 
        moduleName.startsWith('../../../..') || 
        moduleName.startsWith('../../..') || 
        moduleName.startsWith('../..') || 
        moduleName === '..') {
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, 'app/emptyModule.js'),
      };
    }
    
    return context.resolveRequest(context, moduleName, platform);
  };

  return config;
}

module.exports = getConfig;