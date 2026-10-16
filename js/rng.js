(function (global) {
  "use strict";
  global.TT = global.TT || {};

  function hashSeed(seed) {
    var text = String(seed == null ? "terratrace-demo" : seed);
    var hash = 2166136261;
    for (var i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function create(seed) {
    var state = hashSeed(seed);
    return function next() {
      state = (state + 0x6D2B79F5) | 0;
      var value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function between(random, min, max) {
    if (typeof random !== "function") throw new TypeError("A random function is required");
    if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) throw new RangeError("Expected finite bounds with max >= min");
    return min + random() * (max - min);
  }

  global.TT.rng = Object.freeze({ create: create, hashSeed: hashSeed, between: between });
})(window);