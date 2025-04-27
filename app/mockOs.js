// Mock implementation of Node.js 'os' module
module.exports = {
  cpus: () => [{ model: 'Mock CPU', speed: 2000 }],
  endianness: () => 'LE',
  freemem: () => 1024 * 1024 * 1024, // 1GB
  homedir: () => '/home/user',
  hostname: () => 'localhost',
  platform: () => 'mock',
  release: () => '1.0.0',
  tmpdir: () => '/tmp',
  totalmem: () => 4 * 1024 * 1024 * 1024, // 4GB
  type: () => 'Mock OS',
  userInfo: () => ({
    uid: -1,
    gid: -1,
    username: 'user',
    homedir: '/home/user',
    shell: null
  }),
  EOL: '\n',
  constants: {
    signals: {},
    errno: {},
    priority: {}
  }
};