// Polyfill the global `self` for `isomorphic-fetch`.
if (typeof global.self === 'undefined') {
  global.self = global;
}
