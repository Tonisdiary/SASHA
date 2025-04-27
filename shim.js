// app/shim.js

// 1️⃣ navigator.userAgent polyfill (avoid undefined errors)
if (typeof global.navigator === 'undefined') {
  global.navigator = {};
}
global.navigator.userAgent =
  (typeof window !== 'undefined' && window.navigator?.userAgent) ||
  'react-native';

// 2️⃣ Node.js core globals
require('node-libs-react-native/globals');

// 3️⃣ URL & URLSearchParams
require('react-native-url-polyfill/auto');

// 4️⃣ Buffer
const { Buffer } = require('buffer');
global.Buffer = Buffer;

// 5️⃣ TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('fast-text-encoding');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Shim file for pnpapi and other Node.js modules
module.exports = {};
