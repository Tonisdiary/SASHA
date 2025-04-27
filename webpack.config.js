const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Fix the resolution issue with SyncModuleIdsPlugin
  config.resolve = {
    ...config.resolve,
    fallback: {
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
      vm: path.resolve(__dirname, 'app/mockVm.js'),
    },
    modules: [
      path.resolve(__dirname),
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ],
    symlinks: false,
    // Add alias for problematic paths
    alias: {
      ...config.resolve.alias,
      // Handle relative path resolution issues
      '../../../../../': path.resolve(__dirname),
      '../../../../..': path.resolve(__dirname),
      '../../../..': path.resolve(__dirname),
      '../../..': path.resolve(__dirname),
      '../..': path.resolve(__dirname),
      '..': path.resolve(__dirname),
      // Replace problematic webpack modules with empty modules
      'node_modules/webpack/lib/ids/SyncModuleIdsPlugin.js': path.resolve(__dirname, 'app/emptyModule.js'),
      'node_modules/webpack/lib/javascript/JavascriptModulesPlugin.js': path.resolve(__dirname, 'app/emptyModule.js'),
      // Mock Node.js built-in modules
      'vm': path.resolve(__dirname, 'app/mockVm.js'),
      // Prevent Maven build for react-native-calendars
      'react-native-calendars/pom.xml': path.resolve(__dirname, 'app/mockMaven.js'),
    }
  };

  // Add plugins to handle Node.js modules
  config.plugins = [
    ...config.plugins,
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      '__DEV__': env.mode === 'development',
      // Explicitly define environment variables for web
      'process.env.EXPO_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.EXPO_PUBLIC_SUPABASE_URL),
      'process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
      'process.env.EXPO_PUBLIC_SERPAPI_KEY': JSON.stringify(process.env.EXPO_PUBLIC_SERPAPI_KEY),
      'process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY)
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^(fs|path|os|crypto|stream|buffer|util|assert|constants|module|net|tls|child_process)$/
    })
  ];

  // Remove SyncModuleIdsPlugin if it's causing issues
  config.plugins = config.plugins.filter(plugin => 
    !plugin || plugin.constructor.name !== 'SyncModuleIdsPlugin'
  );

  // Fix SyncModuleIdsPlugin issue
  config.output = {
    ...config.output,
    // Ensure webpack doesn't try to resolve outside the project
    path: path.resolve(__dirname, 'web-build')
  };

  return config;
};