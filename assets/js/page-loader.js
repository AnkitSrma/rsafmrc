(function () {
  var loader = document.getElementById("page-loader");
  if (!loader) return;

  var MIN_VISIBLE_MS = 350;
  var FALLBACK_MS = 4000;
  var start = Date.now();
  var hidden = false;

  function hide() {
    if (hidden) return;
    hidden = true;
    var wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - start));
    setTimeout(function () {
      loader.classList.add("is-hidden");
      loader.addEventListener(
        "transitionend",
        function () {
          if (loader.parentNode) loader.parentNode.removeChild(loader);
        },
        { once: true }
      );
    }, wait);
  }

  if (document.readyState === "complete") {
    hide();
  } else {
    window.addEventListener("load", hide);
  }
  setTimeout(hide, FALLBACK_MS);
})();
