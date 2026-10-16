(function (global) {
  "use strict";
  global.TT = global.TT || {};
  var rng = global.TT.rng;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function generate(options) {
    options = options || {};
    var seed = options.seed == null ? "yamuna-floodplain-demo" : options.seed;
    var size = Math.floor(Number(options.size == null ? 12 : options.size));
    if (!Number.isFinite(size) || size < 2 || size > 50) throw new RangeError("Grid size must be between 2 and 50");
    var random = rng.create(seed);
    var cells = [];
    var rows = [];
    var cols = [];
    var beforeDate = "2025-04";
    var afterDate = "2026-04";

    for (var row = 0; row < size; row += 1) {
      for (var col = 0; col < size; col += 1) {
        var spatial = Math.sin((row + 1) * 0.55) * 0.08 + Math.cos((col + 2) * 0.41) * 0.07;
        var vegetation = clamp(0.52 + spatial + (random() - 0.5) * 0.16, 0.08, 0.88);
        var water = clamp(0.24 + Math.cos(row * 0.62) * 0.1 + (random() - 0.5) * 0.16, 0.02, 0.72);
        var built = clamp(0.22 + Math.sin(col * 0.37) * 0.08 + (random() - 0.5) * 0.18, 0.02, 0.78);
        var lst = clamp(31 + built * 8 - vegetation * 5 + (random() - 0.5) * 4, 18, 48);
        var rainfall = clamp(620 + (random() - 0.5) * 360 + Math.cos(row * 0.3) * 80, 120, 1500);
        var elevation = clamp(205 + row * 1.4 + col * 0.6 + (random() - 0.5) * 9, 180, 290);
        var change = ((row * 7 + col * 11) % 17 === 0) ? -0.19 : ((row * 5 + col * 3) % 19 === 0 ? 0.12 : (random() - 0.5) * 0.06);
        var afterVegetation = clamp(vegetation + change, 0.02, 0.92);
        var afterWater = clamp(water + ((row + col) % 9 === 0 ? 0.16 : (random() - 0.5) * 0.08), 0.01, 0.85);
        var afterBuilt = clamp(built + ((row * 3 + col) % 13 === 0 ? 0.12 : (random() - 0.5) * 0.035), 0.01, 0.9);
        var afterLst = clamp(lst + (vegetation - afterVegetation) * 10 + (afterBuilt - built) * 7 + (random() - 0.5) * 1.8, 16, 50);
        var cell = {
          id: "cell-" + row + "-" + col,
          row: row,
          col: col,
          x: (col + 0.5) / size,
          y: (row + 0.5) / size,
          before: { date: beforeDate, nir: clamp(0.48 + vegetation * 0.4, 0.02, 0.98), red: clamp(0.42 - vegetation * 0.26, 0.02, 0.9), green: clamp(0.3 + water * 0.12, 0.02, 0.9), swir: clamp(0.36 + built * 0.2 - water * 0.08, 0.02, 0.95), lstC: lst, rainfallMm: rainfall, elevationM: elevation },
          after: { date: afterDate, nir: clamp(0.48 + afterVegetation * 0.4, 0.02, 0.98), red: clamp(0.42 - afterVegetation * 0.26, 0.02, 0.9), green: clamp(0.3 + afterWater * 0.12, 0.02, 0.9), swir: clamp(0.36 + afterBuilt * 0.2 - afterWater * 0.08, 0.02, 0.95), lstC: afterLst, rainfallMm: rainfall * clamp(0.82 + random() * 0.36, 0.5, 1.3), elevationM: elevation },
          provenance: "SYNTHETIC"
        };
        cells.push(cell);
        cols.push(col);
        rows.push(row);
      }
    }
    return {
      meta: { seed: String(seed), size: size, cellCount: cells.length, beforeDate: beforeDate, afterDate: afterDate, dataMode: "synthetic", synthetic: true, generatedAt: null },
      cells: cells
    };
  }

  function monthlySeries(options) {
    options = options || {};
    var random = rng.create(options.seed == null ? "monthly-demo" : options.seed);
    var values = [];
    var start = Number(options.startYear || 2025);
    var base = Number(options.base == null ? 0.5 : options.base);
    var amplitude = Number(options.amplitude == null ? 0.12 : options.amplitude);
    for (var i = 0; i < 12; i += 1) {
      values.push({ month: i + 1, year: start, value: clamp(base + Math.sin((i / 12) * Math.PI * 2 - 0.7) * amplitude + (random() - 0.5) * amplitude * 0.35, 0, 1) });
    }
    return values;
  }

  global.TT.sim = Object.freeze({ generate: generate, monthlySeries: monthlySeries });
})(window);