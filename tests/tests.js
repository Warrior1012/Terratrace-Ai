(function (global) {
  "use strict";
  global.TT = global.TT || {};
  function run() {
    var results = [];
    function test(name, fn) {
      try { if (fn() !== true) throw new Error("Assertion returned false"); results.push({ name: name, pass: true }); }
      catch (error) { results.push({ name: name, pass: false, error: String(error && error.message || error) }); }
    }
    function equal(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
    var TT = global.TT;
    test("namespace exists", function () { return !!TT; });
    test("config identifies synthetic data", function () { return TT.config.isSynthetic === true; });
    test("clamp lower bound", function () { return TT.util.clamp(-1, 0, 5) === 0; });
    test("clamp upper bound", function () { return TT.util.clamp(9, 0, 5) === 5; });
    test("clamp keeps in-range values", function () { return TT.util.clamp(3, 0, 5) === 3; });
    test("escapeHTML escapes markup", function () { return TT.util.escapeHTML("<b>") === "&lt;b&gt;"; });
    test("normalizeLabel trims whitespace", function () { return TT.util.normalizeLabel("  Sample   area ") === "Sample area"; });
    test("normalizeLabel fallback", function () { return TT.util.normalizeLabel("  ", "Fallback") === "Fallback"; });
    test("formatNumber handles invalid values", function () { return TT.util.formatNumber(NaN) === "—"; });
    test("query parameter parser", function () { return TT.util.getQueryParam("test", "?test=1") === "1"; });
    test("seed hashing is deterministic", function () { return TT.rng.hashSeed("abc") === TT.rng.hashSeed("abc"); });
    test("seed hashing distinguishes common seeds", function () { return TT.rng.hashSeed("abc") !== TT.rng.hashSeed("xyz"); });
    test("seeded random stream repeats", function () { var a = TT.rng.create("repeat"); var b = TT.rng.create("repeat"); return a() === b() && a() === b(); });
    test("seeded random values stay below one", function () { var v = TT.rng.create("range")(); return v >= 0 && v < 1; });
    test("random between respects bounds", function () { var v = TT.rng.between(TT.rng.create("between"), 3, 7); return v >= 3 && v <= 7; });
    test("random between supports equal bounds", function () { return TT.rng.between(function () { return 0.5; }, 2, 2) === 2; });
    test("random between rejects reversed bounds", function () { try { TT.rng.between(Math.random, 4, 2); return false; } catch (e) { return e instanceof RangeError; } });
    test("default simulation returns dataset", function () { var d = TT.sim.generate(); return Array.isArray(d.cells) && d.cells.length > 0; });
    test("simulation explicitly marks synthetic data", function () { return TT.sim.generate().meta.synthetic === true; });
    test("simulation default grid has 144 cells", function () { return TT.sim.generate().cells.length === 144; });
    test("simulation grid size option works", function () { return TT.sim.generate({ size: 3 }).cells.length === 9; });
    test("simulation is deterministic for same seed", function () { return equal(TT.sim.generate({ seed: "same" }).cells, TT.sim.generate({ seed: "same" }).cells); });
    test("simulation changes for different seeds", function () { return !equal(TT.sim.generate({ seed: "one" }).cells, TT.sim.generate({ seed: "two" }).cells); });
    test("simulation rejects too-small grid", function () { try { TT.sim.generate({ size: 1 }); return false; } catch (e) { return e instanceof RangeError; } });
    test("simulation rejects too-large grid", function () { try { TT.sim.generate({ size: 51 }); return false; } catch (e) { return e instanceof RangeError; } });
    test("cells have stable IDs", function () { return TT.sim.generate({ size: 2 }).cells[0].id === "cell-0-0"; });
    test("cell observations include spectral bands", function () { var c = TT.sim.generate({ size: 2 }).cells[0]; return Number.isFinite(c.before.nir) && Number.isFinite(c.after.red) && Number.isFinite(c.before.swir); });
    test("cell observations include context values", function () { var c = TT.sim.generate({ size: 2 }).cells[0]; return Number.isFinite(c.before.lstC) && Number.isFinite(c.before.rainfallMm) && Number.isFinite(c.before.elevationM); });
    test("monthly series has twelve months", function () { return TT.sim.monthlySeries().length === 12; });
    test("monthly series is deterministic", function () { return equal(TT.sim.monthlySeries({ seed: "x" }), TT.sim.monthlySeries({ seed: "x" })); });
    test("monthly series values are bounded", function () { return TT.sim.monthlySeries().every(function (x) { return x.value >= 0 && x.value <= 1; }); });
    test("normalized difference computes expected ratio", function () { return Math.abs(TT.idx.normalizedDifference(0.8, 0.2) - 0.6) < 1e-10; });
    test("normalized difference supports negative results", function () { return Math.abs(TT.idx.normalizedDifference(0.2, 0.8) + 0.6) < 1e-10; });
    test("normalized difference handles zero denominator", function () { return TT.idx.normalizedDifference(0, 0) === null; });
    test("normalized difference handles missing inputs", function () { return TT.idx.normalizedDifference(NaN, 1) === null; });
    test("normalized difference is bounded", function () { var v = TT.idx.normalizedDifference(3, -1); return v >= -1 && v <= 1; });
    test("NDVI uses NIR and red bands", function () { return Math.abs(TT.idx.ndvi({ nir: 0.8, red: 0.2 }) - 0.6) < 1e-10; });
    test("NDWI uses green and NIR bands", function () { return Math.abs(TT.idx.ndwi({ green: 0.6, nir: 0.4 }) - 0.2) < 1e-10; });
    test("NDBI uses SWIR and NIR bands", function () { return Math.abs(TT.idx.ndbi({ swir: 0.6, nir: 0.4 }) - 0.2) < 1e-10; });
    test("indices handle absent bands", function () { return TT.idx.ndvi(null) === null; });
    test("calculate preserves LST", function () { return TT.idx.calculate({ nir: 0.8, red: 0.2, green: 0.4, swir: 0.5, lstC: 30 }).lstC === 30; });
    test("addIndices attaches before and after indices", function () { var c = TT.idx.addIndices(TT.sim.generate({ size: 2 }).cells[0]); return Number.isFinite(c.indices.before.ndvi) && Number.isFinite(c.indices.after.ndwi); });
    test("addIndices rejects malformed cell", function () { try { TT.idx.addIndices({}); return false; } catch (e) { return e instanceof TypeError; } });
    test("classify labels small changes stable", function () { return TT.detect.classify(0.02) === "stable"; });
    test("classify labels moderate decrease", function () { return TT.detect.classify(-0.1) === "decrease"; });
    test("classify labels strong decrease", function () { return TT.detect.classify(-0.2) === "strong-decrease"; });
    test("classify labels moderate increase", function () { return TT.detect.classify(0.1) === "increase"; });
    test("classify labels strong increase", function () { return TT.detect.classify(0.2) === "strong-increase"; });
    test("classify labels missing values unknown", function () { return TT.detect.classify(null) === "unknown"; });
    test("classify custom threshold works", function () { return TT.detect.classify(0.06, { significant: 0.05, strong: 0.2 }) === "increase"; });
    test("detectCell attaches change deltas", function () { var c = TT.detect.detectCell(TT.sim.generate({ size: 2 }).cells[0]); return Number.isFinite(c.change.deltas.ndvi) && c.change.provenance === "SIMULATED_COMPARISON"; });
    test("detectCell provides classification for each index", function () { var c = TT.detect.detectCell(TT.sim.generate({ size: 2 }).cells[0]); return ["ndvi", "ndwi", "ndbi", "lstC"].every(function (k) { return typeof c.change.classes[k] === "string"; }); });
    test("detectCell flags are booleans", function () { var f = TT.detect.detectCell(TT.sim.generate({ size: 2 }).cells[0]).change.flags; return typeof f.vegetationDecline === "boolean" && typeof f.surfaceWaterSignal === "boolean"; });
    test("detectAll returns same cell count", function () { var d = TT.sim.generate({ size: 4 }); return TT.detect.detectAll(d).cells.length === d.cells.length; });
    test("detectAll keeps synthetic provenance", function () { return TT.detect.detectAll(TT.sim.generate({ size: 2 })).meta.dataMode === "synthetic"; });
    test("detectAll rejects malformed dataset", function () { try { TT.detect.detectAll({}); return false; } catch (e) { return e instanceof TypeError; } });
    test("all generated spectral values are finite", function () { return TT.sim.generate({ size: 5 }).cells.every(function (c) { return [c.before.nir,c.before.red,c.before.green,c.before.swir,c.after.nir,c.after.red,c.after.green,c.after.swir].every(Number.isFinite); }); });
    test("all generated LST values are plausible bounds", function () { return TT.sim.generate({ size: 5 }).cells.every(function (c) { return c.before.lstC >= 18 && c.before.lstC <= 48 && c.after.lstC >= 16 && c.after.lstC <= 50; }); });
    test("all generated cells carry synthetic provenance", function () { return TT.sim.generate({ size: 3 }).cells.every(function (c) { return c.provenance === "SYNTHETIC"; }); });
    var failed = results.filter(function (result) { return !result.pass; }).length;
    var summary = { total: results.length, passed: results.length - failed, failed: failed, results: results };
    global.TT.testResults = summary;
    var output = document.getElementById("debug-output");
    if (output) output.textContent = JSON.stringify(summary, null, 2);
    if (global.console && typeof global.console.info === "function") global.console.info("[TerraTrace tests]", summary);
    return summary;
  }
  global.TT.tests = Object.freeze({ run: run });
})(window);