// This file is only needed for web builds. If you are building for iOS/Android, this file should not be loaded.
// If you need to customize the web build, rename this file to webpack.config.web.js
// Otherwise, you can safely remove or ignore this file for native builds.

const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@rneui/base', '@rneui/themed']
    }
  }, argv);

  // Remove pnp-webpack-plugin if it exists
  if (config.resolve.plugins) {
    config.resolve.plugins = config.resolve.plugins.filter(plugin => 
      !plugin || (plugin.constructor && plugin.constructor.name !== 'PnpWebpackPlugin')
    );
  }

  // Configure module resolution and polyfills
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      'react-native-maps': 'react-native-web-maps',
      'pnpapi': false,
      // Fix SyncModuleIdsPlugin resolution issue
      'node_modules/webpack/lib/ids/SyncModuleIdsPlugin.js': path.resolve(__dirname, 'emptyModule.js'),
      // Fix JavascriptModulesPlugin resolution issue
      'node_modules/webpack/lib/javascript/JavascriptModulesPlugin.js': path.resolve(__dirname, 'emptyModule.js'),
      // Mock Node.js built-in modules
      'vm': path.resolve(__dirname, 'mockVm.js'),
      // Handle relative path resolution issues
      '../../../../../': path.resolve(__dirname, '..'),
      '../../../../..': path.resolve(__dirname, '..'),
      '../../../..': path.resolve(__dirname, '..'),
      '../../..': path.resolve(__dirname, '..'),
      '../..': path.resolve(__dirname, '..'),
      '..': path.resolve(__dirname, '..'),
    },
    fallback: {
      'fs': false,
      'path': false,
      'crypto': false,
      'stream': false,
      'buffer': false,
      'process': false,
      'util': false,
      'assert': false,
      'http': false,
      'https': false,
      'os': false,
      'url': false,
      'zlib': false,
      'vm': path.resolve(__dirname, 'mockVm.js')
    },
    modules: [
      path.resolve(__dirname, '..'),
      path.resolve(__dirname, '../node_modules'),
      'node_modules'
    ],
    symlinks: false
  };
  // Add necessary plugins
  config.plugins = [
    // Filter out problematic plugins
    ...config.plugins.filter(plugin => 
      !plugin || (plugin.constructor && plugin.constructor.name !== 'SyncModuleIdsPlugin')
    ),
    // Ignore Node.js built-in modules
    new webpack.IgnorePlugin({ 
      resourceRegExp: /^(fs|path|crypto|stream|buffer|process|util|assert|http|https|os|url|zlib)$/ 
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      '__DEV__': env.mode === 'development'
    })
  ];

  return config;
}
