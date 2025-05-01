// metro.config.js - Compatible with newer Node.js versions
const { resolver: { sourceExts, assetExts } } = require('metro-config');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg', 'mjs', 'cjs'],
    extraNodeModules: {
      // Add any polyfills needed for web
      'crypto': require.resolve('crypto-browserify'),
      'stream': require.resolve('stream-browserify'),
      'buffer': require.resolve('buffer'),
      'path': require.resolve('path-browserify'),
    }
  },
};