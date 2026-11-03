/* Stackly — 404 page (plain JavaScript, no libraries needed) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const fine = matchMedia('(hover:hover)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  /* logo falls back to a text wordmark if the image is missing */
  const logo = $('.nf-brand img');
  const wordmark = () => { const s = document.createElement('span'); s.className = 'wordmark'; s.textContent = 'STACKLY'; logo.replaceWith(s); };
  if (logo) { if (logo.complete && !logo.naturalWidth) wordmark(); else logo.addEventListener('error', wordmark, { once: true }); }

  /* show which address could not be found (text only, so it is always safe) */
  const pathEl = $('#path');
  try { pathEl.textContent = decodeURIComponent(location.pathname + location.search + location.hash) || '/'; }
  catch (e) { pathEl.textContent = location.pathname || '/'; }
  pathEl.title = pathEl.textContent;

  /* ---------- the two buttons ---------- */
  const HOME = 'index.html';
  const homeBtn = $('#homeBtn'), prevBtn = $('#prevBtn'), note = $('#prevNote');
  homeBtn.setAttribute('href', HOME);

  /* work out the page the visitor came from */
  let ref = null;
  try { if (document.referrer) ref = new URL(document.referrer); } catch (e) { ref = null; }
  if (ref && ref.href === location.href) ref = null;           /* refreshed the 404 page itself */
  const sameSite = !!ref && ref.origin === location.origin;
  const nice = p => {
    const seg = decodeURIComponent(p.split('/').filter(Boolean).pop() || '');
    const base = seg.replace(/\.html?$/i, '');
    if (!base || /^index$/i.test(base)) return 'Home';
    return base.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };
  let prevName = '';
  if (ref) prevName = sameSite ? nice(ref.pathname) : ref.hostname.replace(/^www\./, '');
  if (prevName) {
    $('span', prevBtn).textContent = 'Back to previous page';
    note.innerHTML = 'You came from <b></b>';
    $('b', note).textContent = prevName;
    note.hidden = false;
  }
  /* real address on the button so it also works with middle-click / "open in new tab" */
  prevBtn.setAttribute('href', ref ? ref.href : HOME);
  prevBtn.addEventListener('click', e => {
    e.preventDefault();
    if (history.length > 1) {
      history.back();                                         /* back to the exact previous page */
      setTimeout(() => { if (!document.hidden) location.href = ref ? ref.href : HOME; }, 700);  /* nothing happened (e.g. opened in a new tab) */
    } else {
      location.href = ref ? ref.href : HOME;                  /* no history: use the referrer, else home */
    }
  });

  /* ---------- twinkling stars ---------- */
  const stars = $('#stars');
  const count = innerWidth < 640 ? 26 : 50;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('i'), z = rand(1, 2.8);
    s.style.cssText = `left:${rand(0, 100).toFixed(1)}%;top:${rand(0, 100).toFixed(1)}%;width:${z.toFixed(1)}px;height:${z.toFixed(1)}px;opacity:${rand(.3, .9).toFixed(2)};animation-delay:${rand(-4, 0).toFixed(1)}s;animation-duration:${rand(2.4, 5).toFixed(1)}s`;
    stars.append(s);
  }

  /* ---------- the "0" is an eye that follows your cursor / finger ---------- */
  const ring = $('.ring'), pupil = $('#pupil'), lid = $('#lid'), shapes = $('.nf-shapes');
  let tx = 0, ty = 0, cx = 0, cy = 0, sx = 0, sy = 0, px = 0, py = 0, lastMove = 0, raf = 0, t0 = performance.now();
  const look = (clientX, clientY) => {
    const r = ring.getBoundingClientRect(), mx = r.left + r.width / 2, my = r.top + r.height / 2;
    const dx = clientX - mx, dy = clientY - my, d = Math.hypot(dx, dy) || 1, max = r.width * .17, k = Math.min(d / 160, 1);
    tx = dx / d * max * k; ty = dy / d * max * k;
    sx = (clientX / innerWidth - .5) * 40; sy = (clientY / innerHeight - .5) * 40;   /* parallax target */
    lastMove = performance.now();
  };
  addEventListener('pointermove', e => look(e.clientX, e.clientY), { passive: true });
  addEventListener('pointerdown', e => look(e.clientX, e.clientY), { passive: true });
  const loop = now => {
    raf = requestAnimationFrame(loop);
    if (document.hidden) return;
    if (now - lastMove > 2500) {                              /* nobody is moving: look around by itself */
      const t = (now - t0) / 1000, r = ring.getBoundingClientRect().width * .15;
      tx = Math.sin(t * .9) * r; ty = Math.cos(t * 1.3) * r * .7; sx = Math.sin(t * .4) * 18; sy = Math.cos(t * .5) * 14;
    }
    cx += (tx - cx) * .14; cy += (ty - cy) * .14; px += (sx - px) * .06; py += (sy - py) * .06;
    pupil.style.transform = `translate(${cx.toFixed(2)}px,${cy.toFixed(2)}px)`;
    shapes.style.setProperty('--px', px.toFixed(2)); shapes.style.setProperty('--py', py.toFixed(2));
  };
  if (!reduce) {
    raf = requestAnimationFrame(loop);
    const blink = () => { lid.classList.remove('blink'); void lid.offsetWidth; lid.classList.add('blink'); setTimeout(blink, rand(2200, 5200)); };
    setTimeout(blink, 2600);
    /* click or tap the eye to make it blink and look at you */
    ring.addEventListener('click', () => { lid.classList.remove('blink'); void lid.offsetWidth; lid.classList.add('blink'); });
  }

  /* ---------- start the entrance animation ---------- */
  const start = () => root.classList.add('go');
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 800))]).then(start); else start();
})();