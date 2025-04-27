module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-transform-react-jsx', {
        runtime: 'automatic'
      }],
      '@babel/plugin-transform-modules-commonjs',
      '@babel/plugin-transform-runtime',
      ['module-resolver', {
        root: ['.'],
        alias: {
          '@': '.',
          'react-native-maps': './node_modules/react-native-maps/lib/commonjs'
        },
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.ts',
          '.tsx',
          '.json',
          '.png'
        ]
      }],
      'react-native-reanimated/plugin'
    ]
  };
};
