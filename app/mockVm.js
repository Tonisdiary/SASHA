// This is a mock module that replaces Node.js vm module
module.exports = {
  runInThisContext: function() { return {}; },
  runInNewContext: function() { return {}; },
  runInContext: function() { return {}; },
  createContext: function() { return {}; },
  createScript: function() { return { runInThisContext: function() { return {}; } }; }
};