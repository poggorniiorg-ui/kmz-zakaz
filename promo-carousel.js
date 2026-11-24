(function () {
  'use strict';

  var carousel = document.querySelector('.promo-carousel');
  if (!carousel) return;
  var slides = carousel.querySelectorAll('.cheese-promo');
  var current = 0;
  var keyboardFocus = false;
  var timer;
  var touchStart;
  var discardClick = false;

  function schedule() {
    window.clearTimeout(timer);
    if (document.hidden || keyboardFocus || touchStart) return;
    timer = window.setTimeout(function () { show(current + 1); }, 3000);
  }

  function show(index) {
    current = (index + slides.length) % slides.length;
    for (var i = 0; i < slides.length; i++) {
      slides[i].hidden = i !== current;
    }
    schedule();
  }

  carousel.addEventListener('focusin', function (event) {
    if (window.CSS && CSS.supports('selector(:focus-visible)')) {
      keyboardFocus = event.target.matches(':focus-visible');
      schedule();
    }
  });
  carousel.addEventListener('focusout', function () { keyboardFocus = false; schedule(); });
  carousel.addEventListener('keydown', function (event) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
    slides[current].focus();
  });
  carousel.addEventListener('touchstart', function (event) {
    touchStart = event.touches.length === 1 ? event.touches[0] : null;
    discardClick = false;
    if (touchStart) window.clearTimeout(timer);
  }, {passive:true});
  carousel.addEventListener('touchcancel', function () { touchStart = null; schedule(); });
  carousel.addEventListener('touchend', function (event) {
    if (!touchStart) return;
    var end = event.changedTouches[0];
    var dx = end.clientX - touchStart.clientX;
    var dy = end.clientY - touchStart.clientY;
    touchStart = null;
    if (Math.abs(dx) >= 45 && Math.abs(dx) > 1.5 * Math.abs(dy)) {
      discardClick = true;
      show(current + (dx < 0 ? 1 : -1));
      window.setTimeout(function () { discardClick = false; }, 500);
    } else schedule();
  }, {passive:true});
  carousel.addEventListener('click', function (event) {
    if (discardClick) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  document.addEventListener('visibilitychange', schedule);
  schedule();
})();
