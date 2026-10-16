(function (global) {
  "use strict";
  global.TT = global.TT || {};
  var panel, output;
  function render() {
    if (!output) return;
    var summary = {
      app: global.TT.config.appName,
      version: global.TT.config.version,
      dataMode: global.TT.config.dataMode,
      query: global.location.search,
      scripts: Object.keys(global.TT).sort()
    };
    output.textContent = JSON.stringify(summary, null, 2);
  }
  function init() {
    panel = document.getElementById("debug-panel");
    output = document.getElementById("debug-output");
    var enabled = global.TT.util.getQueryParam("debug") === "1" || global.TT.util.getQueryParam("test") === "1";
    if (panel && enabled) { panel.hidden = false; render(); }
    var close = document.getElementById("debug-close");
    if (close && panel) close.addEventListener("click", function () { panel.hidden = true; });
  }
  global.TT.debug = Object.freeze({ init: init, refresh: render });
})(window);