(function (global) {
  "use strict";
  function init() {
    var TT = global.TT;
    if (!TT || !TT.config || !TT.util) return;
    if (TT.debug) TT.debug.init();
    var runButton = document.getElementById("run-analysis");
    if (runButton) runButton.addEventListener("click", function () {
      var nameField = document.getElementById("site-name");
      var periodField = document.getElementById("analysis-period");
      var focusField = document.getElementById("analysis-focus");
      var siteName = TT.util.normalizeLabel(nameField && nameField.value, "Untitled study area");
      var period = periodField ? periodField.value : "seasonal";
      var focus = focusField ? focusField.value : "all";
      if (nameField) nameField.value = siteName;
      TT.state = { siteName: siteName, period: period, focus: focus, dataMode: "synthetic" };
      TT.ui.toast("Workspace prepared for " + siteName + ". Synthetic analysis will be added in a later stage.");
    });
    if (TT.util.getQueryParam("test") === "1" && TT.tests) TT.tests.run();
    document.documentElement.dataset.appReady = "true";
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window);