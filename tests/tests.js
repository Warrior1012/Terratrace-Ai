(function (global) {
  "use strict";
  global.TT = global.TT || {};
  function run() {
    var results = [];
    function test(name, fn) {
      try { if (fn() !== true) throw new Error("Assertion returned false"); results.push({ name: name, pass: true }); }
      catch (error) { results.push({ name: name, pass: false, error: String(error && error.message || error) }); }
    }
    test("namespace exists", function () { return !!global.TT; });
    test("config identifies synthetic data", function () { return global.TT.config.isSynthetic === true; });
    test("clamp lower bound", function () { return global.TT.util.clamp(-1, 0, 5) === 0; });
    test("clamp upper bound", function () { return global.TT.util.clamp(9, 0, 5) === 5; });
    test("clamp keeps in-range values", function () { return global.TT.util.clamp(3, 0, 5) === 3; });
    test("escapeHTML escapes markup", function () { return global.TT.util.escapeHTML("<b>") === "&lt;b&gt;"; });
    test("normalizeLabel trims whitespace", function () { return global.TT.util.normalizeLabel("  Sample   area ") === "Sample area"; });
    test("normalizeLabel fallback", function () { return global.TT.util.normalizeLabel("  ", "Fallback") === "Fallback"; });
    test("formatNumber handles invalid values", function () { return global.TT.util.formatNumber(NaN) === "—"; });
    test("query parameter parser", function () { return global.TT.util.getQueryParam("test", "?test=1") === "1"; });
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