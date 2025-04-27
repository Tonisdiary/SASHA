// Mock implementation of globby
module.exports = function globby(patterns, options) {
  return Promise.resolve([]);
};

module.exports.globbySync = function globbySync(patterns, options) {
  return [];
};

module.exports.globbyStream = function globbyStream(patterns, options) {
  const { Readable } = require('stream');
  const readable = new Readable({ objectMode: true });
  readable._read = () => {};
  readable.push(null);
  return readable;
};

module.exports.isDynamicPattern = function isDynamicPattern(pattern, options) {
  return false;
};

module.exports.generateGlobTasks = function generateGlobTasks(patterns, options) {
  return [];
};

module.exports.default = module.exports;// Mock implementation of globby
module.exports = function globby(patterns, options) {
  return Promise.resolve([]);
};

module.exports.globbySync = function globbySync(patterns, options) {
  return [];
};

module.exports.globbyStream = function globbyStream(patterns, options) {
  const { Readable } = require('stream');
  const readable = new Readable({ objectMode: true });
  readable._read = () => {};
  readable.push(null);
  return readable;
};

module.exports.isDynamicPattern = function isDynamicPattern(pattern, options) {
  return false;
};

module.exports.generateGlobTasks = function generateGlobTasks(patterns, options) {
  return [];
};

module.exports.default = module.exports;