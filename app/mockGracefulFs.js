// Mock implementation of graceful-fs
// This is a simplified version that just passes through to fs
const fs = require('fs');

// Copy all properties from fs
Object.keys(fs).forEach(key => {
  if (typeof fs[key] === 'function') {
    exports[key] = function() {
      return fs[key].apply(fs, arguments);
    };
  } else {
    exports[key] = fs[key];
  }
});

// Add graceful-fs specific properties
exports.gracefulify = function(fsModule) {
  return fsModule;
};

// Override problematic functions with safe versions
exports.createReadStream = function() {
  return {
    on: function() { return this; },
    pipe: function() { return this; },
    destroy: function() {}
  };
};

exports.createWriteStream = function() {
  return {
    on: function() { return this; },
    write: function() { return true; },
    end: function() {}
  };
};