(function () {
  var REVEAL_SELECTOR =
    ".card, .info-card, .spotlight-card, .carousel-card, .two-column > *, " +
    ".contact-box > *, .section > .container > .eyebrow, .section > .container > h2";
  var IMAGE_SELECTOR = ".post-hero-image, .carousel-card-image, .spotlight-card-image";
  var STAGGER_STEP_MS = 60;
  var STAGGER_CAP_MS = 300;

  initImageFade();

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  var groupCounts = new Map();
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(REVEAL_SELECTOR));

  revealEls.forEach(function (el) {
    var parent = el.parentElement;
    var index = groupCounts.get(parent) || 0;
    groupCounts.set(parent, index + 1);
    el.style.animationDelay = Math.min(index * STAGGER_STEP_MS, STAGGER_CAP_MS) + "ms";
    el.classList.add("reveal");
  });

  if (location.hash) {
    var hashTarget = document.getElementById(location.hash.slice(1));
    if (hashTarget) {
      hashTarget.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  var io = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
  );

  document.querySelectorAll(".reveal").forEach(function (el) {
    if (el.classList.contains("is-visible")) return;
    io.observe(el);
  });

  function initImageFade() {
    document.querySelectorAll(IMAGE_SELECTOR).forEach(function (img) {
      if (img.complete && img.naturalWidth) {
        img.classList.add("is-loaded");
        return;
      }
      img.classList.add("img-fade");
      img.addEventListener(
        "load",
        function () {
          img.classList.add("is-loaded");
        },
        { once: true }
      );
    });
  }
})();
