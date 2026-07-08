(function () {
  var current = document.body.getAttribute("data-nav-current");
  if (!current) return;
  var link = document.querySelector('.nav-links a[data-nav="' + current + '"]');
  if (link) link.classList.add("is-active");
})();
