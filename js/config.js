(function (global) {
  "use strict";
  global.TT = global.TT || {};
  global.TT.config = Object.freeze({
    appName: "TerraTrace",
    version: "0.1.0",
    dataMode: "sentinel-2-or-sample",
    isSynthetic: false,
    debugQueryParam: "debug",
    testQueryParam: "test",
    maxSiteNameLength: 80,
    modules: ["ClimateWatch", "AquaCycle", "SolarScope", "ClimateRisk"]
  });
})(window);