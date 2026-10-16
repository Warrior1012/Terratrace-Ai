(function (global) {
  "use strict";
  global.TT = global.TT || {};
  var util = {
    clamp: function (value, min, max) { return Math.min(max, Math.max(min, value)); },
    isFiniteNumber: function (value) { return typeof value === "number" && Number.isFinite(value); },
    escapeHTML: function (value) {
      return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
      });
    },
    getQueryParam: function (name, search) {
      var params = new URLSearchParams(search == null ? global.location.search : search);
      return params.get(name);
    },
    normalizeLabel: function (value, fallback) {
      var text = String(value == null ? "" : value).trim().replace(/\s+/g, " ");
      return text ? text.slice(0, 80) : (fallback || "Untitled study area");
    },
    formatNumber: function (value, digits) {
      if (!Number.isFinite(Number(value))) return "—";
      return Number(value).toLocaleString("en-IN", { maximumFractionDigits: digits == null ? 2 : digits });
    }
  };
  global.TT.util = Object.freeze(util);
})(window);