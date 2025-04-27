// Mock implementation of fs/react-native-fs
module.exports = {
  // Basic fs functions
  readFile: () => Promise.resolve(''),
  writeFile: () => Promise.resolve(),
  unlink: () => Promise.resolve(),
  mkdir: () => Promise.resolve(),
  readdir: () => Promise.resolve([]),
  stat: () => Promise.resolve({ isFile: () => true, isDirectory: () => false }),
  exists: () => Promise.resolve(true),
  
  // React Native FS specific
  DocumentDirectoryPath: '/document-directory',
  ExternalDirectoryPath: '/external-directory',
  ExternalStorageDirectoryPath: '/external-storage',
  TemporaryDirectoryPath: '/temporary-directory',
  LibraryDirectoryPath: '/library-directory',
  PicturesDirectoryPath: '/pictures-directory',
  CachesDirectoryPath: '/caches-directory',
  
  // Additional methods
  copyFile: () => Promise.resolve(),
  moveFile: () => Promise.resolve(),
  downloadFile: () => ({ promise: Promise.resolve({ statusCode: 200, bytesWritten: 0 }) }),
  uploadFiles: () => ({ promise: Promise.resolve({ statusCode: 200 }) }),
  getFSInfo: () => Promise.resolve({ freeSpace: 1024, totalSpace: 2048 }),
  
  // Node fs compatibility
  promises: {
    readFile: () => Promise.resolve(''),
    writeFile: () => Promise.resolve(),
    unlink: () => Promise.resolve(),
    mkdir: () => Promise.resolve(),
    readdir: () => Promise.resolve([]),
    stat: () => Promise.resolve({ isFile: () => true, isDirectory: () => false }),
    access: () => Promise.resolve(),
  },
  
  // Sync versions
  readFileSync: () => '',
  writeFileSync: () => {},
  unlinkSync: () => {},
  mkdirSync: () => {},
  readdirSync: () => [],
  statSync: () => ({ isFile: () => true, isDirectory: () => false }),
  existsSync: () => true,
  
  // Stream support (minimal)
  createReadStream: () => ({
    on: () => {},
    pipe: (dest) => dest,
  }),
  createWriteStream: () => ({
    on: () => {},
    write: () => true,
    end: () => {},
  }),
};