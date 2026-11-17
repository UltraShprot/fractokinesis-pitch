/* Питч v4: язык карточек описания Steam (Tools/social/scenes_steam.js) в слайдах 1920×1080.
   canvas.pxt  — жирный шрифт шортсов: системный Arial Black мелко → порог → пиксели арта, чёрный контур + карминовая кайма, ×k без сглаживания.
                 data-t: строки через «|», *золото*, ^кармин^, ~голубой~; data-px — кегль в px арта; data-k — px экрана на px арта; data-al — left|center|right.
   canvas.dark — живая тьма: рваный край (крупные выступы, рвань, зубцы), гребень кармин/запёкшийся, полоса стали, перелив внутри, пепел, глаза.
                 data-side — где край (right: тьма слева, край справа; left; bottom; top), data-at — положение края 0…1, data-seed.
   canvas.sky  — звёзды и туманность на фоне слайда.  canvas.hat — Мистер Хэт (data-pose, data-k).
   ?only=N — один слайд для снимка, ?print=1 — PDF (без анимации). */
(function () {
  'use strict';
  const q = new URLSearchParams(location.search), STILL = !!(q.get('only') || q.get('print'));
  const R = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const n1 = (x, sd) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(R(sd * 131 + i), R(sd * 131 + i + 1), u); };
  const COL = { w: '#e9edf5', g: '#ffd84a', r: '#ff3b5c', b: '#7fd8ff', d: '#05060a' };
  const RIM = '#8e1a3a';

  // ---------- ПИКСЕЛЬНЫЙ ШРИФТ
  const FONT = (px) => '900 ' + px + 'px "Arial Black", "Segoe UI Black", Impact, sans-serif';
  const RING = []; for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) if (Math.abs(x) + Math.abs(y) < 4 && (x || y)) RING.push([x, y]); RING.push([0, 3], [1, 3], [-1, 3], [2, 3]);
  const RINGO = []; for (let y = -3; y <= 4; y++) for (let x = -3; x <= 3; x++) if (Math.abs(x) + Math.abs(y - (y > 0 ? 1 : 0)) <= 4 && !RING.some(([a, b]) => a === x && b === y) && (x || y)) RINGO.push([x, y]);
  const RING1 = [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [0, 2], [1, 2]];
  const RINGO1 = [[-2, 0], [2, 0], [0, -2], [-1, -1], [1, -1], [-1, 1], [2, 1], [-1, 2], [2, 2], [0, 3], [1, 3]];
  function parse(line) { // «*золото* ^кармин^ @голубой@» → [[текст, цвет]]
    const out = []; let cur = '', col = 'w';
    for (const ch of line) {
      const m = { '*': 'g', '^': 'r', '@': 'b' }[ch];
      if (m) { if (cur) out.push([cur, col]); cur = ''; col = col === m ? 'w' : m; } else cur += ch;
    }
    if (cur) out.push([cur, col]); return out;
  }
  function lineMask(segs, px) {
    const m = document.createElement('canvas'), x = m.getContext('2d', { willReadFrequently: true });
    x.font = FONT(px); const full = segs.map((s) => s[0]).join('');
    m.width = Math.ceil(x.measureText(full).width) + 4; m.height = Math.ceil(px * 1.45);
    x.font = FONT(px); x.textBaseline = 'alphabetic';
    let off = 2; for (const [t, c] of segs) { x.fillStyle = COL[c]; x.fillText(t, off, Math.round(px * 1.05)); off += x.measureText(t).width; }
    const d = x.getImageData(0, 0, m.width, m.height);
    for (let i = 0; i < d.data.length; i += 4) d.data[i + 3] = d.data[i + 3] > 118 ? 255 : 0;
    x.putImageData(d, 0, 0); return m;
  }
  function tint(m, col) { const c = document.createElement('canvas'); c.width = m.width; c.height = m.height; const x = c.getContext('2d');
    x.drawImage(m, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); return c; }
  function drawPxt(cv) {
    const px = +cv.dataset.px || 12, k = +cv.dataset.k || 4, al = cv.dataset.al || 'left', thin = px < 10, lead = +(cv.dataset.lead || 1.18);
    const rim = cv.dataset.rim === 'none' ? null : (cv.dataset.rim || RIM);
    const lines = cv.dataset.t.split('|').map((l) => lineMask(parse(l), px));
    const pad = 5, W = Math.max(...lines.map((m) => m.width)) + pad * 2, lh = Math.round(px * lead), H = lh * (lines.length - 1) + Math.ceil(px * 1.45) + pad * 2;
    cv.width = W; cv.height = H; cv.style.width = W * k + 'px'; cv.style.height = H * k + 'px';
    const c = cv.getContext('2d');
    lines.forEach((m, i) => {
      const x = al === 'center' ? Math.round((W - m.width) / 2) : al === 'right' ? W - pad - m.width : pad, y = pad + i * lh;
      if (rim) { const t = tint(m, rim); for (const [ox, oy] of thin ? RINGO1 : RINGO) c.drawImage(t, x + ox, y + oy); }
      const d = tint(m, COL.d); for (const [ox, oy] of thin ? RING1 : RING) c.drawImage(d, x + ox, y + oy);
      c.drawImage(m, x, y);
    });
    // поля холста не сдвигают вёрстку: якорь — левый верх букв
    cv.style.margin = (-pad * k) + 'px ' + (-pad * k) + 'px';
  }

  // ---------- ЖИВАЯ ТЬМА
  function ragW(y, T, seed) { const lump = n1(y / 46, seed), fine = n1(y / 6, seed + 3), spike = Math.pow(Math.max(0, Math.sin(y * 0.13 + lump * 5 + seed)), 8);
    return 15 * (lump - 0.5) * 2 + 3.5 * (fine - 0.5) * 2 + 10 * spike + 1.6 * Math.sin(T * 1.3 + y * 0.045 + seed) + 1.2 * Math.sin(T * 2.1 - y * 0.09 + seed); }
  const DARK = [];
  function initDark(cv) {
    const k = +cv.dataset.k || 4, W = Math.round(cv.offsetWidth / k), H = Math.round(cv.offsetHeight / k);
    cv.width = W; cv.height = H;
    DARK.push({ cv, c: cv.getContext('2d'), W, H, side: cv.dataset.side || 'right', at: +(cv.dataset.at || 0.5), seed: +(cv.dataset.seed || 1),
      eyes: +(cv.dataset.eyes || 0), op: +(cv.dataset.op || 1), pad: +(cv.dataset.pad || 30) });
  }
  // полоса тьмы с рваными краями сверху и снизу (сайт): холст на весь раздел с запасом pad, края не срезаются, шва с фоном нет
  function drawBand(d, T) {
    const { c, W, H, seed } = d, pad = d.pad;
    c.clearRect(0, 0, W, H);
    const top = [], bot = [];
    for (let i = -1; i <= W; i++) { top.push(Math.round(pad + ragW(i, T, seed))); bot.push(Math.round(H - pad - ragW(i, T, seed + 5))); }
    const t = (i) => top[clamp(i, -1, W) + 1], b = (i) => bot[clamp(i, -1, W) + 1];
    c.fillStyle = '#04050a';
    for (let i = 0; i < W; i++) c.fillRect(i, t(i), 1, b(i) - t(i));
    c.save(); c.beginPath(); for (let i = 0; i < W; i++) c.rect(i, t(i), 1, b(i) - t(i)); c.clip();
    c.globalCompositeOperation = 'lighter';
    const cols = ['212,24,61', '130,60,210', '50,90,210', '40,170,180', '212,24,61'];
    for (let j = 0; j < 5; j++) {
      const px = (0.5 + 0.45 * Math.sin(T * (0.21 + j * 0.05) + j * 1.7 + seed)) * W, py = (0.5 + 0.45 * Math.sin(T * (0.17 + j * 0.04) + j * 2.9 + seed * 2)) * H;
      const r = Math.max(W, H) * 0.3, g = c.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, 'rgba(' + cols[j] + ',0.10)'); g.addColorStop(1, 'rgba(' + cols[j] + ',0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
    c.globalCompositeOperation = 'source-over';
    for (let j = 0; j < 90; j++) { const sx = R(j + seed * 17) * W, sy = pad + ((R(j * 3 + seed) * (H - 2 * pad) - T * (3 + R(j) * 6)) % (H - 2 * pad) + (H - 2 * pad)) % (H - 2 * pad);
      c.fillStyle = R(j + 9) > 0.7 ? 'rgba(212,24,61,0.5)' : 'rgba(150,160,190,0.3)'; c.fillRect(Math.round(sx + Math.sin(T + j) * 2), Math.round(sy), 1, 1); }
    c.restore();
    for (let i = 0; i < W; i++) {
      const ti = t(i), tm = Math.min(ti, t(i - 1), t(i + 1)), bi = b(i), bm = Math.max(bi, b(i - 1), b(i + 1)), red = n1(i / 5, seed + 7) > 0.5 ? '#d4183d' : '#6e1229';
      c.fillStyle = '#272b3a'; c.fillRect(i, tm, 1, ti + 3 - tm); c.fillRect(i, bi - 3, 1, bm - bi + 3);
      c.fillStyle = red; c.fillRect(i, tm, 1, ti + 1 - tm); c.fillRect(i, bi - 1, 1, bm - bi + 1);
    }
  }
  function drawDark(d, T) {
    if (d.side === 'band') return drawBand(d, T);
    const { c, W, H, side, at, seed } = d, vert = side === 'right' || side === 'left', L = vert ? H : W, S = vert ? W : H;
    const x0 = Math.round(S * at), dir = side === 'right' || side === 'bottom' ? 1 : -1;
    c.clearRect(0, 0, W, H);
    const edge = []; for (let i = -2; i <= L + 2; i++) edge.push(Math.round(x0 + dir * ragW(i, T, seed)));
    const e = (i) => edge[clamp(i, -2, L + 2) + 2];
    const rect = (a, b, len) => { if (vert) c.fillRect(b, a, len, 1); else c.fillRect(a, b, 1, len); }; // a — вдоль края, b — поперёк
    c.globalAlpha = d.op;
    c.fillStyle = '#04050a';
    for (let i = 0; i < L; i++) { const x = e(i); if (dir > 0) rect(i, 0, x); else rect(i, x, S - x); }
    // перелив в теле
    c.save(); c.beginPath(); for (let i = 0; i < L; i++) { const x = e(i); if (vert) { if (dir > 0) c.rect(0, i, x, 1); else c.rect(x, i, S - x, 1); } else { if (dir > 0) c.rect(i, 0, 1, x); else c.rect(i, x, 1, S - x); } } c.clip();
    c.globalCompositeOperation = 'lighter';
    const cols = ['212,24,61', '130,60,210', '50,90,210', '40,170,180', '212,24,61'];
    for (let j = 0; j < 5; j++) {
      const px = (0.5 + 0.42 * Math.sin(T * (0.21 + j * 0.05) + j * 1.7 + seed)) * W, py = (0.5 + 0.42 * Math.sin(T * (0.17 + j * 0.04) + j * 2.9 + seed * 2)) * H;
      const r = Math.max(W, H) * (0.22 + 0.08 * Math.sin(T * 0.3 + j)), g = c.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, 'rgba(' + cols[j] + ',0.16)'); g.addColorStop(1, 'rgba(' + cols[j] + ',0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
    c.globalCompositeOperation = 'source-over';
    // пепел
    for (let j = 0; j < 70; j++) { const sx = R(j + seed * 17) * W, sy = ((R(j * 3 + seed) * H - T * (3 + R(j) * 6)) % H + H) % H;
      c.fillStyle = R(j + 9) > 0.7 ? 'rgba(212,24,61,0.55)' : 'rgba(150,160,190,0.35)'; c.fillRect(Math.round(sx + Math.sin(T + j) * 2), Math.round(sy), 1, 1); }
    // глаза во тьме
    for (let j = 0; j < d.eyes; j++) { const blink = Math.sin(T * 0.9 + j * 2.3) > -0.93, ex = Math.round(R(j * 7 + seed) * (W - 20) + 10), ey = Math.round(R(j * 11 + seed + 1) * (H - 20) + 10);
      const x = vert ? ex : ex, y = ey; const inside = vert ? (dir > 0 ? x < e(y) - 12 : x > e(y) + 12) : (dir > 0 ? y < e(x) - 12 : y > e(x) + 12);
      if (!inside || !blink) continue; c.fillStyle = '#d4183d'; c.fillRect(x, y, 2, 1); c.fillRect(x + 4, y, 2, 1); c.fillStyle = 'rgba(212,24,61,0.25)'; c.fillRect(x - 1, y - 1, 8, 3); }
    c.restore();
    // гребень: 1 px кармин/запёкшийся, за ним 2–3 px стали
    for (let i = 0; i < L; i++) {
      const x = e(i), a = e(i - 1), b = e(i + 1);
      const rim = dir > 0 ? Math.max(x + 1, a, b) - x : x - Math.min(x - 1, a, b), band = dir > 0 ? Math.max(x + 3, a + 2, b + 2) - x : x - Math.min(x - 3, a - 2, b - 2);
      c.fillStyle = '#272b3a'; if (dir > 0) rect(i, x, band); else rect(i, x - band, band);
      c.fillStyle = n1(i / 5, seed + 7) > 0.5 ? '#d4183d' : '#6e1229'; if (dir > 0) rect(i, x, rim); else rect(i, x - rim, rim);
    }
    c.globalAlpha = 1;
  }

  // ---------- НЕБО
  function drawSky(cv) {
    const k = 4, W = Math.round(cv.offsetWidth / k), H = Math.round(cv.offsetHeight / k), seed = +(cv.dataset.seed || 3);
    cv.width = W; cv.height = H; const c = cv.getContext('2d');
    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0a0b16'); g.addColorStop(1, '#07070d'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const neb = [['130,60,210', 0.25, 0.3], ['212,24,61', 0.8, 0.75], ['50,90,210', 0.6, 0.2]];
    neb.forEach(([col, fx, fy], j) => { const px = (fx + (R(seed + j) - 0.5) * 0.3) * W, py = (fy + (R(seed * 3 + j) - 0.5) * 0.3) * H, r = W * 0.45;
      const gg = c.createRadialGradient(px, py, 0, px, py, r); gg.addColorStop(0, 'rgba(' + col + ',0.13)'); gg.addColorStop(1, 'rgba(' + col + ',0)'); c.fillStyle = gg; c.fillRect(0, 0, W, H); });
    for (let j = 0, N = Math.max(260, Math.round(W * H / 500)); j < N; j++) { const x = Math.floor(R(j * 1.3 + seed) * W), y = Math.floor(R(j * 2.7 + seed + 5) * H), b = R(j + 77);
      c.fillStyle = b > 0.93 ? '#ffffff' : b > 0.7 ? 'rgba(200,210,240,0.7)' : 'rgba(140,150,190,0.45)'; c.fillRect(x, y, 1, 1);
      if (b > 0.985) { c.fillStyle = 'rgba(200,210,240,0.5)'; c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3); } }
  }

  // ---------- МИСТЕР ХЭТ
  const POSES = new Image(); POSES.src = 'assets/hat_poses.png';
  function drawHat(cv) { const k = +cv.dataset.k || 6, f = +cv.dataset.pose || 0, cell = 48;
    cv.width = cell; cv.height = cell; cv.style.width = cell * k + 'px'; cv.style.height = cell * k + 'px';
    const c = cv.getContext('2d'); c.clearRect(0, 0, cell, cell); c.drawImage(POSES, (f % 12) * cell, Math.floor(f / 12) * cell, cell, cell, 0, 0, cell, cell); }

  // ---------- рваный край пластины пузыря Хэта: ступеньки по 2 px, сид — номер пузыря (как в Tools/pitch v3)
  function ragPlates() {
    document.querySelectorAll('.gbub .plate').forEach((plate, n) => {
      let s = 1234567 + n * 7919;
      const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
      const w = plate.offsetWidth, h = plate.offsetHeight, step = 14, amp = 5;
      const side = (len) => { const a = []; for (let x = 0; x <= len; x += step) a.push([Math.min(x, len), Math.round(rnd() * amp / 2) * 2]); return a; };
      const top = side(w), right = side(h), bot = side(w), left = side(h);
      const poly = (k) => { const p = [];
        top.forEach(([x, d]) => p.push([x, d + k])); right.forEach(([y, d]) => p.push([w - d - k, y]));
        bot.slice().reverse().forEach(([x, d]) => p.push([x, h - d - k])); left.slice().reverse().forEach(([y, d]) => p.push([d + k, y]));
        return 'polygon(' + p.map(([x, y]) => x + 'px ' + y + 'px').join(',') + ')'; };
      plate.style.clipPath = poly(0);
      const fill = plate.querySelector('.fill');
      if (fill) fill.style.clipPath = poly(3).replace(/(-?\d+)px (-?\d+)px/g, (m, x, y) => (x - 3) + 'px ' + (y - 3) + 'px');
    });
  }
  window.PX_PLATES = ragPlates;

  // ---------- СБОРКА
  window.PX_SKY = drawSky;
  function start() {
    document.querySelectorAll('canvas.pxt').forEach(drawPxt);
    document.querySelectorAll('canvas.sky').forEach(drawSky);
    ragPlates();
    document.querySelectorAll('canvas.dark').forEach(initDark);
    const hats = () => document.querySelectorAll('canvas.hat').forEach(drawHat);
    if (POSES.complete) hats(); else POSES.onload = hats;
    DARK.forEach((d) => drawDark(d, 0));
    let rt = 0; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => DARK.forEach((d) => {
      const k = +d.cv.dataset.k || 4; d.W = d.cv.width = Math.round(d.cv.offsetWidth / k); d.H = d.cv.height = Math.round(d.cv.offsetHeight / k); drawDark(d, performance.now() / 1000); }), 150); });
    document.body.classList.add('ready');
    if (STILL) return;
    // логотип меню: 9 к/с, как в игре
    let lf = 0; setInterval(() => { lf = (lf + 1) % 12; document.querySelectorAll('.logoanim').forEach((el) => { el.style.backgroundPositionY = (-lf * 210) + 'px'; }); }, 1000 / 9);
    let last = 0; const tick = (ms) => { requestAnimationFrame(tick); if (ms - last < 80) return; last = ms; const T = ms / 1000;
      DARK.forEach((d) => { const r = d.cv.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) drawDark(d, T); }); };
    requestAnimationFrame(tick);
  }
  window.PX_START = start;
})();
