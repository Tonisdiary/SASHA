// Mock implementation of expo-router/node/render.js
module.exports = {
  getStaticContent: async () => {
    return {
      html: '',
      head: [],
      body: []
    };
  },
  getManifest: async () => {
    return {
      routes: {}
    };
  },
  getBuildTimeServerManifestAsync: async () => {
    return {
      routes: {}
    };
  }
};