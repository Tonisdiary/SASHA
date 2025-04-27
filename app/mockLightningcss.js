// Mock implementation of lightningcss
module.exports = {
  transform: () => ({
    code: '',
    map: null,
    warnings: []
  }),
  bundle: () => ({
    code: '',
    map: null,
    warnings: []
  }),
  browserslistToTargets: () => ({}),
  composeVisitors: (...visitors) => visitors[0] || {},
  Features: {
    Nesting: 1 << 0,
    CustomMedia: 1 << 1,
    MediaQueries: 1 << 2,
    ColorFunction: 1 << 3,
    LogicalProperties: 1 << 4,
    AdvancedPseudos: 1 << 5,
    ClampFunction: 1 << 6,
    GlobalKeywords: 1 << 7,
    Selectors: 1 << 8,
    CustomSelectors: 1 << 9,
    CustomIdentifiers: 1 << 10,
    VendorPrefixes: 1 << 11,
    All: (1 << 12) - 1
  }
};