const metroTransformer = require('metro-react-native-babel-transformer');

module.exports.transform = async function({ src, filename, options }) {
  if (filename.includes('node_modules/react-native-maps')) {
    // Force JSX runtime to 'automatic' for react-native-maps
    const customOptions = {
      ...options,
      babel: {
        ...options.babel,
        plugins: [
          ...options.babel.plugins,
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    };
    return metroTransformer.transform({ src, filename, options: customOptions });
  }
  return metroTransformer.transform({ src, filename, options });
};