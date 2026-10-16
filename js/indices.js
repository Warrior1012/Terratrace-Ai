(function (global) {
  "use strict";
  global.TT = global.TT || {};
  var util = global.TT.util;

  function normalizedDifference(a, b) {
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    var denominator = a + b;
    if (Math.abs(denominator) < 1e-12) return null;
    return util.clamp((a - b) / denominator, -1, 1);
  }

  function ndvi(bands) {
    if (!bands) return null;
    return normalizedDifference(bands.nir, bands.red);
  }

  function ndwi(bands) {
    if (!bands) return null;
    return normalizedDifference(bands.green, bands.nir);
  }

  function ndbi(bands) {
    if (!bands) return null;
    return normalizedDifference(bands.swir, bands.nir);
  }

  function calculate(bands) {
    return { ndvi: ndvi(bands), ndwi: ndwi(bands), ndbi: ndbi(bands), lstC: bands && Number.isFinite(bands.lstC) ? bands.lstC : null };
  }

  function addIndices(cell) {
    if (!cell || !cell.before || !cell.after) throw new TypeError("Cell must contain before and after observations");
    return Object.assign({}, cell, { indices: { before: calculate(cell.before), after: calculate(cell.after) } });
  }

  global.TT.idx = Object.freeze({ normalizedDifference: normalizedDifference, ndvi: ndvi, ndwi: ndwi, ndbi: ndbi, calculate: calculate, addIndices: addIndices });
})(window);