(function () {
  var carousel = document.getElementById("featuredCarousel");
  var btn = document.getElementById("featuredNextBtn");
  if (!carousel || !btn) return;

  var slides = Array.prototype.slice.call(carousel.querySelectorAll(".spotlight-featured-slide"));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll(".spotlight-featured-dot"));
  if (slides.length < 2) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var current = 0;
  var intervalId = null;
  var AUTO_MS = 4500;
  var count = slides.length;
  var TRANSITION = "transform 700ms cubic-bezier(0.65, 0, 0.35, 1)";

  function offsetFor(i, from) {
    var offset = i - from;
    if (offset > count / 2) offset -= count;
    if (offset < -count / 2) offset += count;
    return offset;
  }

  function layout(animate, prevIndex) {
    slides.forEach(function (slide, i) {
      var offset = offsetFor(i, current);
      slide.style.transition = animate && (i === current || i === prevIndex) ? TRANSITION : "none";
      slide.style.transform = "translateX(" + offset * 100 + "%)";
      slide.classList.toggle("is-active", offset === 0);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === current);
    });
  }

  function show(index) {
    var prevIndex = current;
    current = (index + count) % count;
    layout(true, prevIndex);
  }

  function next() {
    show(current + 1);
  }

  function start() {
    if (reduceMotion || intervalId) return;
    intervalId = window.setInterval(next, AUTO_MS);
  }

  function stop() {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  }

  layout(false, null);
  start();

  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);

  btn.addEventListener("click", function () {
    stop();
    next();
    start();
  });

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      stop();
      show(i);
      start();
    });
  });
})();
