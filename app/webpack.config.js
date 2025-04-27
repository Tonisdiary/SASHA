const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Prevent webpack from trying to polyfill or include Node.js core modules like 'fs'
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: false,
    os: false,
    crypto: false,
    stream: false,
    buffer: false,
    util: false,
    assert: false,
    constants: false,
    module: false,
    net: false,
    tls: false,
    child_process: false,
  };

  // Fix the resolution issue
  config.resolve.modules = [
    path.resolve(__dirname, '..'),
    path.resolve(__dirname, '../node_modules'),
    'node_modules'
  ];

  // Add alias for SyncModuleIdsPlugin to empty module
  config.resolve.alias = {
    ...config.resolve.alias,
    'node_modules/webpack/lib/ids/SyncModuleIdsPlugin.js': path.resolve(__dirname, 'emptyModule.js'),
  };

  // Ensure SyncModuleIdsPlugin can resolve paths correctly
  config.resolve.symlinks = false;

  return config;
};
