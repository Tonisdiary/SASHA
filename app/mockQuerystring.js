// Mock implementation of Node.js querystring module
module.exports = {
  stringify: function(obj) {
    return Object.keys(obj || {})
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&');
  },
  parse: function(str) {
    const result = {};
    (str || '').split('&').forEach(part => {
      const [key, value] = part.split('=');
      if (key) {
        result[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    });
    return result;
  },
  escape: encodeURIComponent,
  unescape: decodeURIComponent
};