/* Питч v4: вписывание слайдов в окно, видео играют только на видимом слайде, стрелки — к соседнему слайду.
   ?only=N — один слайд (съёмка), ?print=1 — PDF. Рисование пиксельных слоёв — px.js (PX_START). */
(function () {
  const frames = Array.from(document.querySelectorAll('.frame'));
  const q = new URLSearchParams(location.search);
  const go = () => window.PX_START && window.PX_START();
  if (q.get('only')) {
    document.body.classList.add('only');
    frames.forEach((f, i) => { if (i !== +q.get('only') - 1) f.remove(); else f.classList.add('show'); });
    document.querySelectorAll('video').forEach((v) => { v.removeAttribute('src'); v.preload = 'none'; });
    return go();
  }
  if (q.get('print')) { document.body.classList.add('print'); document.querySelectorAll('video').forEach((v) => { v.preload = 'none'; }); return go(); }

  const fit = () => document.documentElement.style.setProperty('--k', Math.min(1, (innerWidth - 24) / 1920, (innerHeight - 24) / 1080));
  addEventListener('resize', fit); fit();
  go();
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.querySelectorAll('video').forEach((v) => {
    if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; const p = v.play(); if (p) p.catch(() => {}); } else v.pause();
  })), { threshold: 0.35 });
  frames.forEach((f) => io.observe(f));
  document.addEventListener('keydown', (e) => {
    const k = e.key; if (!['ArrowDown', 'ArrowRight', 'PageDown', ' ', 'ArrowUp', 'ArrowLeft', 'PageUp'].includes(k)) return;
    e.preventDefault();
    const mid = innerHeight / 2;
    let i = frames.findIndex((f) => { const r = f.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
    if (i < 0) i = 0;
    i += ['ArrowUp', 'ArrowLeft', 'PageUp'].includes(k) ? -1 : 1;
    if (frames[i]) frames[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
