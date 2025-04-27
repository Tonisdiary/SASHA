// app/shim.js

// 1️⃣ Polyfill Node.js globals (process, Buffer, atob/btoa, etc.)
import 'node-libs-react-native/globals';

// 2️⃣ Polyfill URL & URLSearchParams
import 'react-native-url-polyfill/auto';

// 3️⃣ Polyfill TextEncoder/TextDecoder
import 'fast-text-encoding';

// 4️⃣ Additional polyfills for Node.js modules
if (typeof window !== 'undefined') {
  // Browser environment
  window.Buffer = window.Buffer || require('buffer').Buffer;
  window.process = window.process || require('process');
  
  // Explicitly handle fs module
  if (!global.fs) {
    global.fs = false; // Prevent attempts to use fs in web environment
  }
}
