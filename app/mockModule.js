// Mock implementation of Node.js 'module' module
module.exports = {
  _extensions: {},
  _cache: {},
  _pathCache: {},
  _resolveFilename: () => '',
  createRequire: () => function mockRequire() { return {}; },
  builtinModules: [],
  syncBuiltinESMExports: () => {},
  Module: {
    _extensions: {},
    _cache: {},
    _pathCache: {},
    _resolveFilename: () => '',
    createRequire: () => function mockRequire() { return {}; },
    builtinModules: [],
    syncBuiltinESMExports: () => {}
  }
};