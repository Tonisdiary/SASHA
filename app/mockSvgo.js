// Mock implementation of svgo
module.exports = {
  extendDefaultPlugins: (plugins) => plugins || [],
  optimize: (svg, options) => ({ data: svg, info: {} }),
  createContentItem: (content) => ({ content, name: 'mock' }),
};