(function (global) {
  "use strict";
  global.TT = global.TT || {};
  var idx = global.TT.idx;

  function classify(delta, thresholds) {
    thresholds = thresholds || {};
    if (!Number.isFinite(delta)) return "unknown";
    var significant = Number.isFinite(thresholds.significant) ? Math.abs(thresholds.significant) : 0.08;
    var strong = Number.isFinite(thresholds.strong) ? Math.abs(thresholds.strong) : 0.18;
    if (Math.abs(delta) < significant) return "stable";
    if (delta <= -strong) return "strong-decrease";
    if (delta < 0) return "decrease";
    if (delta >= strong) return "strong-increase";
    return "increase";
  }

  function detectCell(cell, options) {
    options = options || {};
    var withIndices = cell && cell.indices ? cell : idx.addIndices(cell);
    var before = withIndices.indices.before;
    var after = withIndices.indices.after;
    var deltas = {
      ndvi: before.ndvi == null || after.ndvi == null ? null : after.ndvi - before.ndvi,
      ndwi: before.ndwi == null || after.ndwi == null ? null : after.ndwi - before.ndwi,
      ndbi: before.ndbi == null || after.ndbi == null ? null : after.ndbi - before.ndbi,
      lstC: before.lstC == null || after.lstC == null ? null : after.lstC - before.lstC
    };
    var vegetationClass = classify(deltas.ndvi, options.ndviThresholds);
    var waterClass = classify(deltas.ndwi, options.ndwiThresholds);
    var builtClass = classify(deltas.ndbi, options.ndbiThresholds);
    var temperatureClass = classify(deltas.lstC, options.lstThresholds || { significant: 1.5, strong: 4 });
    return Object.assign({}, withIndices, {
      change: {
        deltas: deltas,
        classes: { ndvi: vegetationClass, ndwi: waterClass, ndbi: builtClass, lstC: temperatureClass },
        flags: {
          vegetationDecline: vegetationClass === "decrease" || vegetationClass === "strong-decrease",
          surfaceWaterSignal: waterClass !== "stable" && waterClass !== "unknown",
          builtSurfaceSignal: builtClass !== "stable" && builtClass !== "unknown",
          surfaceTemperatureShift: temperatureClass !== "stable" && temperatureClass !== "unknown"
        },
        provenance: "SIMULATED_COMPARISON"
      }
    });
  }

  function detectAll(dataset, options) {
    if (!dataset || !Array.isArray(dataset.cells)) throw new TypeError("Expected a dataset with a cells array");
    return { meta: Object.assign({}, dataset.meta, { analysisMode: "synthetic-change-detection" }), cells: dataset.cells.map(function (cell) { return detectCell(cell, options); }) };
  }

  global.TT.detect = Object.freeze({ classify: classify, detectCell: detectCell, detectAll: detectAll });
})(window);