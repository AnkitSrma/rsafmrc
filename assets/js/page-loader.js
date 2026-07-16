(function () {
  var loader = document.getElementById("page-loader");
  if (!loader) return;

  var MIN_VISIBLE_MS = 1500;
  var FALLBACK_MS = 4000;
  var start = Date.now();
  var hidden = false;
  var stopEmbers = startEmbers();

  function hide() {
    if (hidden) return;
    hidden = true;
    var wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - start));
    setTimeout(function () {
      loader.classList.add("is-hidden");
      document.body.classList.add("is-loaded");
      loader.addEventListener(
        "transitionend",
        function () {
          stopEmbers();
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

  function startEmbers() {
    var canvas = loader.querySelector(".page-loader-embers");
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return function () {};
    }

    var ctx = canvas.getContext("2d");
    var W, H, cx, cy;
    var embers = [];
    var COLORS = ["#d92b1c", "#f5722a", "#ffb347", "#ff8c42"];
    var rafId = null;
    var stopped = false;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cx = W / 2;
      cy = H / 2 - 40;
    }
    window.addEventListener("resize", resize);
    resize();

    function spawn() {
      var angle = Math.random() * Math.PI;
      var radius = 110 + Math.random() * 60;
      return {
        x: cx + Math.cos(angle + Math.PI) * radius * (Math.random() < 0.5 ? 1 : -1),
        y: cy + 60 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(0.6 + Math.random() * 1.3),
        size: 1.5 + Math.random() * 2.8,
        life: 0,
        maxLife: 90 + Math.random() * 110,
        wobble: Math.random() * Math.PI * 2,
        color: COLORS[(Math.random() * COLORS.length) | 0],
      };
    }

    function tick() {
      if (stopped) return;
      ctx.clearRect(0, 0, W, H);

      if (embers.length < 46 && Math.random() < 0.5) embers.push(spawn());

      for (var i = embers.length - 1; i >= 0; i--) {
        var e = embers[i];
        e.life++;
        e.wobble += 0.06;
        e.x += e.vx + Math.sin(e.wobble) * 0.45;
        e.y += e.vy;

        var t = e.life / e.maxLife;
        var alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;

        ctx.globalAlpha = Math.max(alpha, 0) * 0.85;
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * (1 - t * 0.4), 0, Math.PI * 2);
        ctx.fill();

        if (e.life >= e.maxLife) embers.splice(i, 1);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return function stop() {
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }
})();
