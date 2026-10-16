(function (global) {
  "use strict";
  global.TT = global.TT || {};

  var INDEX_KEYS = ["ndvi", "ndwi", "ndbi", "lstC"];
  var LABELS = { ndvi: "Vegetation signal (NDVI)", ndwi: "Surface-water signal (NDWI)", ndbi: "Built-surface signal (NDBI)", lstC: "Land-surface temperature (LST)" };

  function finiteValues(values) {
    return values.filter(function (value) { return Number.isFinite(value); });
  }
  function mean(values) {
    var valid = finiteValues(values);
    return valid.length ? valid.reduce(function (sum, value) { return sum + value; }, 0) / valid.length : null;
  }
  function median(values) {
    var valid = finiteValues(values).slice().sort(function (a, b) { return a - b; });
    if (!valid.length) return null;
    var middle = Math.floor(valid.length / 2);
    return valid.length % 2 ? valid[middle] : (valid[middle - 1] + valid[middle]) / 2;
  }
  function percent(part, whole) {
    return whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;
  }
  function countClass(cells, key, matcher) {
    return cells.filter(function (cell) { return matcher(cell.change.classes[key], cell); }).length;
  }
  function isDecrease(value) { return value === "decrease" || value === "strong-decrease"; }
  function isIncrease(value) { return value === "increase" || value === "strong-increase"; }
  function summarize(dataset, options) {
    options = options || {};
    if (!dataset || !Array.isArray(dataset.cells) || dataset.cells.length === 0) throw new TypeError("Analysis requires a non-empty detected dataset");
    var cells = dataset.cells;
    if (!cells.every(function (cell) { return cell && cell.change && cell.change.deltas && cell.change.classes; })) {
      throw new TypeError("Analysis requires cells processed by change detection");
    }
    var total = cells.length;
    var metrics = {};
    INDEX_KEYS.forEach(function (key) {
      var deltas = cells.map(function (cell) { return cell.change.deltas[key]; });
      var classes = cells.map(function (cell) { return cell.change.classes[key]; });
      var valid = finiteValues(deltas);
      metrics[key] = {
        label: LABELS[key],
        validCount: valid.length,
        missingCount: total - valid.length,
        meanDelta: mean(valid),
        medianDelta: median(valid),
        minDelta: valid.length ? Math.min.apply(null, valid) : null,
        maxDelta: valid.length ? Math.max.apply(null, valid) : null,
        stableCount: classes.filter(function (value) { return value === "stable"; }).length,
        increaseCount: classes.filter(isIncrease).length,
        decreaseCount: classes.filter(isDecrease).length,
        unknownCount: classes.filter(function (value) { return value === "unknown"; }).length
      };
      metrics[key].changedCount = metrics[key].increaseCount + metrics[key].decreaseCount;
      metrics[key].changedPercent = percent(metrics[key].changedCount, total);
      metrics[key].increasePercent = percent(metrics[key].increaseCount, total);
      metrics[key].decreasePercent = percent(metrics[key].decreaseCount, total);
    });
    var vegetationDeclines = cells.filter(function (cell) { return cell.change.flags.vegetationDecline; }).length;
    var waterSignals = cells.filter(function (cell) { return cell.change.flags.surfaceWaterSignal; }).length;
    var builtSignals = cells.filter(function (cell) { return cell.change.flags.builtSurfaceSignal; }).length;
    var temperatureSignals = cells.filter(function (cell) { return cell.change.flags.surfaceTemperatureShift; }).length;
    var hotspotThreshold = Number.isFinite(options.hotspotThreshold) ? Math.max(0, options.hotspotThreshold) : 0.12;
    var hotspots = cells.map(function (cell) {
      var severity = Math.max(
        Number.isFinite(cell.change.deltas.ndvi) ? Math.max(0, -cell.change.deltas.ndvi) : 0,
        Number.isFinite(cell.change.deltas.ndwi) ? Math.abs(cell.change.deltas.ndwi) * 0.65 : 0,
        Number.isFinite(cell.change.deltas.ndbi) ? Math.max(0, cell.change.deltas.ndbi) * 0.7 : 0,
        Number.isFinite(cell.change.deltas.lstC) ? Math.abs(cell.change.deltas.lstC) / 25 : 0
      );
      return { id: cell.id, row: cell.row, col: cell.col, x: cell.x, y: cell.y, severity: Math.round(severity * 1000) / 1000, vegetationDelta: cell.change.deltas.ndvi, waterDelta: cell.change.deltas.ndwi, builtDelta: cell.change.deltas.ndbi, lstDeltaC: cell.change.deltas.lstC };
    }).filter(function (hotspot) { return hotspot.severity >= hotspotThreshold; }).sort(function (a, b) { return b.severity - a.severity; });
    var dataCompleteness = percent(cells.reduce(function (sum, cell) {
      return sum + INDEX_KEYS.filter(function (key) { return Number.isFinite(cell.change.deltas[key]); }).length;
    }, 0), total * INDEX_KEYS.length);
    var observed = [
      { id: "vegetation-decline", type: "OBSERVED_SIMULATED_SIGNAL", label: "Cells with a vegetation-index decline", count: vegetationDeclines, percent: percent(vegetationDeclines, total), metric: "ndvi" },
      { id: "surface-water-change", type: "OBSERVED_SIMULATED_SIGNAL", label: "Cells with a surface-water-index change", count: waterSignals, percent: percent(waterSignals, total), metric: "ndwi" },
      { id: "built-surface-change", type: "OBSERVED_SIMULATED_SIGNAL", label: "Cells with a built-surface-index change", count: builtSignals, percent: percent(builtSignals, total), metric: "ndbi" },
      { id: "surface-temperature-change", type: "OBSERVED_SIMULATED_SIGNAL", label: "Cells with a land-surface-temperature shift", count: temperatureSignals, percent: percent(temperatureSignals, total), metric: "lstC" }
    ];
    var interpretations = [];
    if (vegetationDeclines > 0) interpretations.push({ id: "vegetation-stress-hypothesis", type: "RULE_BASED_INTERPRETATION", label: "Possible vegetation stress", rationale: "A decline in the synthetic vegetation index may be consistent with stress, seasonal effects, land management, or data artefacts.", evidenceMetrics: ["ndvi"], confidence: "low", requiresValidation: true });
    if (waterSignals > 0) interpretations.push({ id: "surface-water-variability-hypothesis", type: "RULE_BASED_INTERPRETATION", label: "Possible surface-water variability", rationale: "A change in the synthetic water index may reflect surface-water variation, seasonality, or observation differences; it says nothing about groundwater or water quality.", evidenceMetrics: ["ndwi"], confidence: "low", requiresValidation: true });
    if (builtSignals > 0) interpretations.push({ id: "built-surface-change-hypothesis", type: "RULE_BASED_INTERPRETATION", label: "Possible built-surface change", rationale: "A built-surface-index change can motivate review, but it does not prove construction or land-use conversion.", evidenceMetrics: ["ndbi"], confidence: "low", requiresValidation: true });
    if (temperatureSignals > 0) interpretations.push({ id: "surface-heat-hypothesis", type: "RULE_BASED_INTERPRETATION", label: "Possible surface-heat pattern", rationale: "A land-surface-temperature shift may warrant contextual review; LST is not air temperature and does not establish climate causation.", evidenceMetrics: ["lstC"], confidence: "low", requiresValidation: true });
    return {
      meta: { analysisMode: "synthetic-change-analysis", synthetic: true, seed: dataset.meta && dataset.meta.seed || null, cellCount: total, dataCompletenessPercent: dataCompleteness, caveat: "Synthetic demo only. Not validated for scientific, operational, financial, or safety decisions." },
      metrics: metrics,
      overview: { cellCount: total, dataCompletenessPercent: dataCompleteness, vegetationDeclineCount: vegetationDeclines, surfaceWaterSignalCount: waterSignals, builtSurfaceSignalCount: builtSignals, surfaceTemperatureShiftCount: temperatureSignals, hotspotCount: hotspots.length, meanNdviDelta: metrics.ndvi.meanDelta, meanNdwiDelta: metrics.ndwi.meanDelta, meanNdbiDelta: metrics.ndbi.meanDelta, meanLstDeltaC: metrics.lstC.meanDelta },
      observedSignals: observed,
      ruleBasedInterpretations: interpretations,
      hotspots: hotspots.slice(0, Math.max(1, Math.min(100, Number(options.maxHotspots) || 20))),
      limitations: [
        "All input observations are synthetic and are not satellite measurements.",
        "A surface-water index does not measure groundwater availability or water quality.",
        "Land-surface temperature is not air temperature.",
        "A local index change does not prove global warming or establish causation.",
        "Rule-based interpretations require independent evidence and expert review."
      ]
    };
  }

  function run(options) {
    options = options || {};
    var dataset = options.dataset || global.TT.sim.generate({ seed: options.seed, size: options.size });
    var detected = global.TT.detect.detectAll(dataset, options.detection || {});
    return summarize(detected, options);
  }

  global.TT.analysis = Object.freeze({ mean: mean, median: median, summarize: summarize, run: run });
})(window);