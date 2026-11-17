/* Питч-сайт: рисование пиксельных слоёв (px.js), анимированный логотип, видео грузятся и играют только в кадре. */
(function () {
  // ?heroh=900 — высота первого экрана для проверочных снимков во всю страницу (там окно высотой со страницу)
  const hh = new URLSearchParams(location.search).get('heroh'); if (hh) document.documentElement.style.setProperty('--heroH', hh + 'px');
  if (window.PX_START) window.PX_START();
  // логотип меню игры: 12 кадров в ленте, 9 к/с
  let f = 0;
  setInterval(() => { f = (f + 1) % 12; document.querySelectorAll('.logosite').forEach((el) => { el.style.backgroundPositionY = (f * 100 / 11) + '%'; }); }, 1000 / 9);
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; const p = v.play(); if (p) p.catch(() => {}); } else v.pause();
  }), { rootMargin: '200px 0px', threshold: 0.01 });
  document.querySelectorAll('video[data-src]').forEach((v) => io.observe(v));
})();
