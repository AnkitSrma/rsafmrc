(function () {
  var current = document.body.getAttribute("data-nav-current");
  if (current) {
    var link = document.querySelector('.nav-links a[data-nav="' + current + '"]');
    if (link) link.classList.add("is-active");
  }

  // Expose the sticky header's real rendered height as a CSS variable so
  // anything that needs to stick right below it (e.g. the marquee) can
  // offset accurately without a fragile hardcoded pixel guess.
  var stickyHeader = document.querySelector(".site-header");
  if (stickyHeader) {
    var setHeaderHeightVar = function () {
      document.documentElement.style.setProperty("--header-height", stickyHeader.offsetHeight + "px");
    };
    setHeaderHeightVar();
    window.addEventListener("resize", setHeaderHeightVar);
  }

  // The sticky nav bar never changes size — only the small compact logo's
  // opacity crossfades in once the big hero logo has scrolled out of view.
  // Because nothing resizes, there's no layout shift to cause a jump/glitch.
  var hero = document.querySelector(".hero-brand");
  var header = document.querySelector(".site-header");
  if (hero && header) {
    var enterThreshold = Math.max(hero.offsetHeight - 20, 40);
    var exitThreshold = Math.max(hero.offsetHeight - 60, 20);
    var ticking = false;

    var applyScrollState = function () {
      var y = window.scrollY;
      if (y > enterThreshold) {
        header.classList.add("is-scrolled");
      } else if (y < exitThreshold) {
        header.classList.remove("is-scrolled");
      }
      ticking = false;
    };

    var onScroll = function () {
      if (!ticking) {
        window.requestAnimationFrame(applyScrollState);
        ticking = true;
      }
    };

    applyScrollState();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var navToggle = document.querySelector(".nav-toggle");
  if (navToggle && stickyHeader) {
    var closeMenu = function () {
      stickyHeader.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = stickyHeader.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (e) {
      if (!stickyHeader.contains(e.target)) closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }
})();
