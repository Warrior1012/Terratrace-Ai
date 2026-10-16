(function (global) {
  "use strict";
  global.TT = global.TT || {};
  var ui = {
    toast: function (message) {
      var region = document.getElementById("toast-region");
      if (!region) return;
      var item = document.createElement("div");
      item.className = "toast";
      item.textContent = String(message);
      region.replaceChildren(item);
    },
    clearToast: function () {
      var region = document.getElementById("toast-region");
      if (region) region.replaceChildren();
    }
  };
  global.TT.ui = Object.freeze(ui);
})(window);