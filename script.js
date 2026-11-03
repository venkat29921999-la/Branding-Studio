/* Stackly — GSAP + ScrollTrigger + AOS */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  /* footer newsletter: email is required + validated in JS, then goes to 404.html and comes back empty */
  function newsletter() {
    const f = $('#nl'), ok = $('#nlok'); if (!f) return;
    const inp = $('input', f), btn = $('button', f);
    f.noValidate = true;
    const er = document.createElement('span'); er.className = 'nl-err'; er.setAttribute('role', 'alert'); f.after(er);
    const check = () => {
      const v = inp.value.trim();
      const m = !v ? 'Please enter your email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? 'Enter a valid email like you@company.com.' : '';
      er.textContent = m; er.classList.toggle('show', !!m); f.classList.toggle('invalid', !!m); inp.setAttribute('aria-invalid', m ? 'true' : 'false');
      return !m;
    };
    inp.addEventListener('input', check);
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (!check()) { inp.focus(); return; }
      btn.disabled = true; ok.classList.add('show'); f.reset();
      setTimeout(() => { location.href = '404.html'; }, 1200);
    });
    /* coming back (or browser Back) always shows an empty field */
    addEventListener('pageshow', () => { f.reset(); btn.disabled = false; ok.classList.remove('show'); er.textContent = ''; er.classList.remove('show'); f.classList.remove('invalid'); });
  }

  /* images: every photo uses a direct https WEBP link (set in index.html). Hide any that fail to load. */
  $$('img[src^="https://"]').forEach(el => {
    const hide = () => { el.style.opacity = 0; };
    if (el.complete && !el.naturalWidth) hide(); else el.addEventListener('error', hide, { once: true });
  });

  /* logo: loaded from Assest/stackly-logo.webp (see index.html); shows a text wordmark only if that file is missing */
  const LOGO_PATH = 'Assest/stackly-logo.webp';
  $$(`img[src="${LOGO_PATH}"]`).forEach(i => {
    const fb = () => { const s = document.createElement('span'); s.className = 'wordmark'; s.textContent = 'STACKLY'; i.replaceWith(s); };
    if (i.complete && !i.naturalWidth) fb(); else i.addEventListener('error', fb, { once: true });
  });

  /* header, progress, back-to-top, active link */
  const header = $('#header'), bar = $('.progress'), top = $('#top');
  const links = $$('.nav a:not(.btn)');
  const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  /* sliding highlight under the nav links (desktop) */
  const ind = $('.nav .ind'), deskMQ = matchMedia('(min-width:901px)'); let hovering = false, lastCur = null;
  const setInd = a => { if (!a || !deskMQ.matches) return; ind.style.width = a.offsetWidth + 'px'; ind.style.transform = `translateX(${a.offsetLeft}px)`; links.forEach(l => l.classList.toggle('lit', l === a)); };
  const home = () => setInd($('.nav a.active') || links[0]);
  links.forEach(a => { a.addEventListener('mouseenter', () => { hovering = true; setInd(a); }); a.addEventListener('focus', () => setInd(a)); });
  $('#nav').addEventListener('mouseleave', () => { hovering = false; home(); });
  addEventListener('resize', home); if (document.fonts) document.fonts.ready.then(home);

  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('stuck', y > 40);
    top.classList.toggle('show', y > 700);
    bar.style.transform = `scaleX(${h ? y / h : 0})`;
    if (!secs.length) return; /* about page: links point to other pages, nothing to track */
    let cur = secs[0];
    secs.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .4) cur = s; });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur.id));
    if (cur !== lastCur) { lastCur = cur; if (!hovering) home(); }
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  top.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

  /* hamburger */
  const burger = $('#burger'), nav = $('#nav');
  const toggle = open => {
    burger.classList.toggle('open', open);
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) gsap.fromTo('#nav a', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, delay: .25, duration: .6, ease: 'power3.out' });
  };
  burger.onclick = () => toggle(!nav.classList.contains('open'));
  $$('#nav a').forEach(a => a.addEventListener('click', () => toggle(false)));
  addEventListener('keydown', e => e.key === 'Escape' && toggle(false));
  matchMedia('(min-width:901px)').addEventListener('change', e => e.matches && toggle(false));

  AOS.init({ duration: 800, once: true, offset: 60, easing: 'ease-out-cubic' });

  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (reduce) gsap.globalTimeline.timeScale(100); // finish animations instantly, keep everything functional
  if (document.body.classList.contains('page-about')) { initAbout(reduce); return; } /* about.html has its own animations (bottom of file) */
  if (document.body.classList.contains('page-blog')) { initBlog(reduce); return; } /* blog.html has its own animations (bottom of file) */
  if (document.body.classList.contains('page-services')) { initServices(reduce); return; } /* services.html has its own animations (bottom of file) */
  if (document.body.classList.contains('page-contact')) { initContact(reduce); return; } /* contact.html has its own animations (bottom of file) */

  /* hero intro: masked headline, floating collage, chips */
  /* page loader: logo + bar, then curtain lifts */
  gsap.timeline().to('.lbar i', { scaleX: 1, duration: 1, ease: 'power2.inOut' })
    .to('.loader img', { y: -24, opacity: 0, duration: .4 })
    .to('.loader', { yPercent: -100, duration: .9, ease: 'power4.inOut' }, '-=.1')
    .set('.loader', { display: 'none' });
  const tl = gsap.timeline({ delay: 1.8, defaults: { ease: 'power4.out' } });
  const sq = $('.squig path'); if (sq) { const L = sq.getTotalLength(); gsap.set(sq, { strokeDasharray: L, strokeDashoffset: L }); gsap.to(sq, { strokeDashoffset: 0, duration: 1.2, delay: 3.2, ease: 'power2.out' }); }
  tl.from('.header', { y: -80, opacity: 0, duration: .9, clearProps: 'transform,opacity' }, 0)
    .from('.hero h1 .split > span > span, .hero h1 > span > span', { yPercent: 115, duration: 1.2, stagger: .15 })
    .from('.pill, .lead, .cta', { y: 30, opacity: 0, stagger: .12, duration: .8 }, '-=.7')
    .from('.h1', { clipPath: 'inset(100% 0 0 0)', duration: 1.3 }, 0.2)
    .from('.h2', { clipPath: 'inset(0 0 0 100%)', duration: 1.1 }, 0.5)
    .from('.h3', { clipPath: 'inset(0 100% 0 0)', duration: 1.1 }, 0.7)
    .from('.badge, .chip', { scale: 0, rotation: -90, stagger: .15, duration: .9, ease: 'back.out(1.8)' }, 1);
  gsap.to('.h-img img', { scale: 1.12, duration: 6, yoyo: true, repeat: -1, ease: 'sine.inOut' });

  /* interactive hero: mouse parallax + custom cursor (desktop only) */
  const fine = matchMedia('(hover:hover) and (min-width:901px)').matches;
  if (fine) {
    const art = $('#heroArt'), depth = $$('[data-depth]', art);
    $('.hero').addEventListener('mousemove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      depth.forEach(el => gsap.to(el, { x: x * el.dataset.depth, y: y * el.dataset.depth, rotation: x * 3, duration: .9, ease: 'power3.out', overwrite: 'auto' }));
    });
    const c = $('.cursor'), mx = gsap.quickTo(c, 'x', { duration: .25 }), my = gsap.quickTo(c, 'y', { duration: .25 });
    addEventListener('mousemove', e => { c.style.opacity = 1; mx(e.clientX - c.offsetWidth / 2); my(e.clientY - c.offsetHeight / 2); });
    $$('a,button,.row,.member').forEach(el => {
      el.addEventListener('mouseenter', () => c.classList.add('big'));
      el.addEventListener('mouseleave', () => c.classList.remove('big'));
    });
    /* magnetic buttons */
    $$('.btn').forEach(b => {
      b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .3 }); });
      b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
    });
  }

  /* image mask reveals + parallax */
  $$('.reveal').forEach(el => {
    gsap.from(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.4, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
    gsap.to($('img', el), { scale: 1, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  gsap.to('.small', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.about', scrub: true } });
  gsap.to('.stats .bg', { yPercent: -15, ease: 'none', scrollTrigger: { trigger: '.stats', scrub: true, start: 'top bottom' } });
  $$('.tag').forEach(t => gsap.from(t, { x: -30, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: t, start: 'top 90%' } }));
  /* headings: word-by-word 3D rise */
  $$('h2').forEach(h => {
    h.innerHTML = h.textContent.trim().split(/\s+/).map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
    gsap.from($$('.w>span', h), { yPercent: 120, rotationZ: 8, opacity: 0, stagger: .07, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
  });
  gsap.from('.row', { x: -60, opacity: 0, stagger: .1, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.rows', start: 'top 80%' } });
  gsap.from('.member', { clipPath: 'inset(0 0 100% 0)', stagger: .12, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: '.team-grid', start: 'top 82%' } });

  /* counters */
  $$('[data-count]').forEach(el => {
    const o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: +el.dataset.count, duration: 2.2, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) }) });
  });

  /* services: image follows cursor */
  const peek = $('.peek'), pimg = $('img', peek);
  if (fine) {
    const px = gsap.quickTo(peek, 'x', { duration: .5, ease: 'power3' }), py = gsap.quickTo(peek, 'y', { duration: .5, ease: 'power3' });
    $$('.row').forEach(r => {
      r.addEventListener('mouseenter', () => { pimg.src = r.dataset.peek; peek.classList.add('on'); });
      r.addEventListener('mouseleave', () => peek.classList.remove('on'));
      r.addEventListener('mousemove', e => { px(e.clientX + 30); py(e.clientY - 160); gsap.to(peek, { rotation: (e.movementX || 0) * .6, duration: .4 }); });
    });
  }

  /* work: stacking cards — each card sinks, shrinks and dims as the next one slides over it */
  const projs = $$('.proj');
  projs.forEach((p, i) => {
    const inn = $('.proj-in', p), fig = $('.proj-img', p), im = $('img', fig), view = $('.view', fig);
    inn.insertAdjacentHTML('beforeend', '<i class="shade"></i>');
    gsap.from(fig, { clipPath: 'inset(0 0 0 100%)', duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: p, start: 'top 85%' } });
    gsap.from($$('.proj-txt > *', p), { y: 40, opacity: 0, stagger: .1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 80%' } });
    gsap.set(im, { scale: 1.2 });
    gsap.fromTo(im, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
    const next = projs[i + 1];
    if (next) {
      const st = { trigger: next, start: 'top 90%', end: () => 'top ' + (parseFloat(getComputedStyle(next).top) + 20), scrub: true };
      gsap.to(inn, { scale: .93, ease: 'none', scrollTrigger: st });
      gsap.to($('.shade', inn), { opacity: .6, ease: 'none', scrollTrigger: st });
    }
    if (fine) {
      fig.addEventListener('mouseenter', () => gsap.to(view, { scale: 1, duration: .4, ease: 'back.out(2)' }));
      fig.addEventListener('mouseleave', () => gsap.to(view, { scale: 0, duration: .3 }));
      fig.addEventListener('mousemove', e => { const r = fig.getBoundingClientRect(); gsap.to(view, { x: e.clientX - r.left, y: e.clientY - r.top, duration: .35, ease: 'power3.out' }); gsap.to(im, { scale: 1.28, duration: .8, overwrite: 'auto' }); });
      fig.addEventListener('mouseleave', () => gsap.to(im, { scale: 1.2, duration: .8 }));
    }
  });

  /* testimonials: swipeable photo deck + word-by-word quotes */
  const slides = $$('.slide'), cards = $$('.tcard'), dots = $('.dots'), N = slides.length;
  let n = 0, timer, busy = false;
  $$('.slide p').forEach(p => p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span class="w"><span>${w}</span></span>`).join(' '));
  const pos = [{ x: 0, y: 0, r: 0 }, { x: 26, y: -14, r: 5 }, { x: -26, y: -26, r: -6 }, { x: 44, y: -36, r: 9 }];
  slides.forEach((_, i) => { const d = document.createElement('i'); d.onclick = () => go(i, i > n ? 1 : -1); dots.append(d); });
  const place = () => {
    cards.forEach((c, idx) => { const k = (idx - n + N) % N, p = pos[Math.min(k, 3)];
      gsap.to(c, { x: p.x, y: p.y, xPercent: 0, rotation: p.r, scale: 1 - k * .05, zIndex: N - k, duration: .9, ease: 'power3.out' }); });
    busy = false;
  };
  const go = (i, dir = 1) => {
    if (busy) return; busy = true;
    const old = n; n = (i + N) % N;
    slides.forEach((s, k) => s.classList.toggle('on', k === n));
    $$('i', dots).forEach((d, k) => d.classList.toggle('on', k === n));
    gsap.fromTo($$('.w>span', slides[n]), { yPercent: 115 }, { yPercent: 0, stagger: .025, duration: .8, ease: 'power4.out' });
    gsap.fromTo($$('.stars,.res,.who', slides[n]), { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: .1, delay: .3, duration: .6, ease: 'power3.out' });
    gsap.fromTo('.qm', { rotation: -120, scale: .2 }, { rotation: 0, scale: 1, duration: .8, ease: 'back.out(2)' });
    if (dir > 0 && old !== n) { const c = cards[old]; gsap.to(c, { xPercent: 125, rotation: 18, duration: .45, ease: 'power2.in', onComplete: () => { gsap.set(c, { zIndex: 0 }); place(); } }); }
    else place();
    clearInterval(timer); timer = setInterval(() => go(n + 1, 1), 6000);
  };
  $('#prev').onclick = () => go(n - 1, -1); $('#next').onclick = () => go(n + 1, 1); go(0);
  let sx = null; const deck = $('#deck');
  deck.addEventListener('pointerdown', e => sx = e.clientX);
  addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (dx < -60) go(n + 1, 1); else if (dx > 60) go(n - 1, -1); });
  gsap.from(deck, { y: 60, opacity: 0, scale: .92, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: deck, start: 'top 85%' } });

  /* contact form: every field is required (validated in JS), then it goes to 404.html, which sends the visitor back to a fresh, empty form */
  const cForm = $('#form');
  cForm.noValidate = true; /* we show our own messages instead of the browser's */
  const cName = $('input[type="text"]', cForm), cMail = $('input[type="email"]', cForm), cProj = $('select', cForm), cMsg = $('textarea', cForm);
  /* placeholder option so "Project" must be chosen on purpose (remove these 2 lines if you want "Brand identity" pre-selected) */
  if (!$('option[value=""]', cProj)) cProj.insertBefore(new Option('Select a project type', '', true, true), cProj.firstChild);
  cProj.options[0].disabled = true; cProj.value = '';
  const setErr = (f, text) => {
    const lab = f.closest('label'); let er = $('.err', lab);
    if (!er) { er = document.createElement('small'); er.className = 'err'; lab.append(er); }
    er.textContent = text; f.classList.toggle('invalid', !!text); f.setAttribute('aria-invalid', text ? 'true' : 'false');
  };
  const rules = [
    [cName, v => !v.trim() ? 'Please enter your name.' : v.trim().length < 2 ? 'Name must be at least 2 characters.' : !/^[\p{L}][\p{L}\s.'-]*$/u.test(v.trim()) ? 'Name can only contain letters.' : ''],
    [cMail, v => !v.trim() ? 'Please enter your email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Enter a valid email like you@company.com.' : ''],
    [cProj, v => !v ? 'Please select a project type.' : ''],
    [cMsg, v => !v.trim() ? 'Please tell us about your project.' : v.trim().length < 10 ? 'Message must be at least 10 characters.' : '']
  ];
  const check = ([f, rule]) => { const m = rule(f.value); setErr(f, m); return !m; };
  rules.forEach(r => { r[0].addEventListener('input', () => check(r)); r[0].addEventListener('change', () => check(r)); });
  cForm.addEventListener('submit', e => {
    e.preventDefault();
    const results = rules.map(check); /* runs every rule so all errors show at once */
    if (results.includes(false)) { rules[results.indexOf(false)][0].focus(); return; }
    const ic = $('#form .btn i'), sendBtn = $('#form .btn');
    sendBtn.disabled = true;
    gsap.timeline().to(ic, { x: 90, y: -50, rotation: 25, opacity: 0, duration: .6, ease: 'power2.in' }).set(ic, { x: -60, y: 30 })
      .to(ic, { x: 0, y: 0, rotation: 0, opacity: 1, duration: .5, ease: 'back.out(2)' });
    $('#ok').classList.add('show'); cForm.reset();
    setTimeout(() => { location.href = '404.html'; }, 1400);
  });
  /* coming back (or using the browser Back button) always shows an empty form */
  addEventListener('pageshow', () => { cForm.reset(); $('#form .btn').disabled = false; $('#ok').classList.remove('show'); rules.forEach(r => setErr(r[0], '')); });
  newsletter();

  /* ===== v2 extras ===== */
  /* marquee reacts to scroll speed */
  const tw = $$('.marquee .track').map((t, i) => gsap.fromTo(t, { xPercent: i ? -50 : 0 }, { xPercent: i ? 0 : -50, duration: 30, ease: 'none', repeat: -1 }));
  ScrollTrigger.create({ onUpdate: s => { const k = 1 + Math.min(Math.abs(s.getVelocity()) / 220, 7); tw.forEach(t => gsap.to(t, { timeScale: k, duration: .2, overwrite: true, onComplete: () => gsap.to(t, { timeScale: 1, duration: 1.2 }) })); } });

  /* process line draws, stats pop, blog reveal, contact card morph, footer word */
  gsap.to('.line i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 60%', scrub: true } });
  gsap.from('.stat-grid b', { yPercent: 70, opacity: 0, stagger: .12, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: '.stat-grid', start: 'top 85%' } });
  gsap.from('.post .ph', { clipPath: 'inset(100% 0 0 0)', stagger: .15, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: '.blog-grid', start: 'top 82%' } });
  gsap.fromTo('.contact-card', { scale: .92, borderRadius: 90 }, { scale: 1, borderRadius: 32, ease: 'none', scrollTrigger: { trigger: '.contact-card', start: 'top 95%', end: 'top 35%', scrub: true } });
  gsap.from('.c-form > *', { y: 30, opacity: 0, stagger: .1, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.c-form', start: 'top 80%' } });
  const bw = $('.bigword'); bw.innerHTML = [...bw.textContent].map(c => `<span>${c}</span>`).join('');
  gsap.from('.bigword span', { yPercent: 110, stagger: .06, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top 85%', end: 'bottom bottom', scrub: true } });
  gsap.from('.f-top > div', { y: 40, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.f-top', start: 'top 90%' } });

  /* services: text scramble on hover */
  const abc = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
  $$('.row').forEach(row => {
    const h = $('h3', row), t = h.textContent; let iv;
    row.addEventListener('mouseenter', () => { let f = 0; clearInterval(iv); iv = setInterval(() => { h.textContent = [...t].map((c, i) => c === ' ' || i < f / 2 ? c : abc[Math.random() * abc.length | 0]).join(''); if (++f > t.length * 2) { clearInterval(iv); h.textContent = t; } }, 30); });
  });

  if (fine) {
    /* hero spotlight follows the mouse */
    const hero = $('.hero');
    hero.addEventListener('mousemove', e => { const r = hero.getBoundingClientRect(); hero.style.setProperty('--mx', e.clientX - r.left + 'px'); hero.style.setProperty('--my', e.clientY - r.top + 'px'); });
    /* 3D tilt + glare */
    const tilt = (els, max) => els.forEach(el => {
      el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        gsap.to(el, { rotationY: x * max, rotationX: -y * max, transformPerspective: 900, duration: .4, overwrite: 'auto' });
        el.style.setProperty('--gx', (x + .5) * 100 + '%'); el.style.setProperty('--gy', (y + .5) * 100 + '%'); });
      el.addEventListener('mouseleave', () => gsap.to(el, { rotationX: 0, rotationY: 0, duration: .8, ease: 'elastic.out(1,.5)' }));
    });
    tilt($$('.member'), 10); tilt($$('.reveal'), 8);
  }

  addEventListener('load', () => ScrollTrigger.refresh());

  /* =====================================================
     ABOUT PAGE — 7 sections, each with its own new animation
     ===================================================== */
  function initAbout(reduce) {
    const fine = matchMedia('(hover:hover) and (min-width:901px)').matches;
    const mm = gsap.matchMedia();

    /* shared: loader, header, cursor, magnetic buttons */
    gsap.timeline().to('.lbar i', { scaleX: 1, duration: .9, ease: 'power2.inOut' })
      .to('.loader img', { y: -24, opacity: 0, duration: .4 })
      .to('.loader', { yPercent: -100, duration: .9, ease: 'power4.inOut' }, '-=.1')
      .set('.loader', { display: 'none' });
    gsap.from('.header', { y: -80, opacity: 0, duration: .9, delay: 1.3, clearProps: 'transform,opacity' });
    if (fine) {
      const c = $('.cursor'), mx = gsap.quickTo(c, 'x', { duration: .25 }), my = gsap.quickTo(c, 'y', { duration: .25 });
      addEventListener('mousemove', e => { c.style.opacity = 1; mx(e.clientX - c.offsetWidth / 2); my(e.clientY - c.offsetHeight / 2); });
      $$('a,button,.val,.pol-in,.bt').forEach(el => {
        el.addEventListener('mouseenter', () => c.classList.add('big'));
        el.addEventListener('mouseleave', () => c.classList.remove('big'));
      });
      $$('.btn').forEach(b => {
        b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .3 }); });
        b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
      });
    }

    /* helpers */
    const splitChars = el => {
      const walk = n => [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) f.append(' ');
            else { const w = document.createElement('span'); w.className = 'cw'; [...t].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; w.append(s); }); f.append(w); }
          });
          c.replaceWith(f);
        } else if (c.nodeType === 1) walk(c);
      });
      walk(el); return $$('.ch', el);
    };
    const splitWords = el => {
      const walk = n => [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) f.append(' ');
            else { const s = document.createElement('span'); s.className = 'mw'; s.textContent = t; f.append(s); }
          });
          c.replaceWith(f);
        } else if (c.nodeType === 1 && !c.classList.contains('pimg')) walk(c);
      });
      walk(el); return $$('.mw', el);
    };

    /* shared: tags + headings rise word by word */
    $$('.tag').forEach(t => gsap.from(t, { x: -30, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: t, start: 'top 90%' } }));
    $$('main h2:not(.nosplit)').forEach(h => {
      h.innerHTML = h.textContent.trim().split(/\s+/).map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
      gsap.from($$('.w>span', h), { yPercent: 120, rotationZ: 8, opacity: 0, stagger: .07, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
    });

    /* 1 · HERO — letters flip up in random order, a slot machine cycles words, a sliced photo waves and fans out with the mouse */
    const chars = splitChars($('.ab-title'));
    const slats = $$('.slat');
    gsap.timeline({ delay: 1.5 })
      .from(chars, { rotationX: -100, yPercent: 70, opacity: 0, transformOrigin: '50% 100%', stagger: { each: .03, from: 'random' }, duration: 1, ease: 'back.out(1.6)' })
      .from('.crumb, .ab-lead', { y: 24, opacity: 0, stagger: .12, duration: .8, ease: 'power3.out' }, '-=.7')
      .from(slats, { yPercent: i => i % 2 ? -115 : 115, stagger: { each: .09, from: 'center' }, duration: 1.3, ease: 'power4.out' }, '-=.5')
      .from('.slats-tag', { scale: 0, rotation: -40, duration: .8, ease: 'back.out(2)' }, '-=.4')
      .add(() => { if (!reduce) gsap.to(slats, { yPercent: i => i % 2 ? 5 : -5, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: { each: .15, from: 'edges' } }); });
    if (!reduce) {
      const stl = gsap.timeline({ repeat: -1, delay: 3.4 });
      for (let k = 1; k <= 4; k++) stl.to('.slot-in', { yPercent: -20 * k, duration: .7, ease: 'power4.inOut' }, '+=1.4');
      stl.set('.slot-in', { yPercent: 0 });
    }
    gsap.to('.ghost', { xPercent: -30, ease: 'none', scrollTrigger: { trigger: '.ab-hero', start: 'top top', end: 'bottom top', scrub: true } });
    if (fine) {
      const sl = $('.slats');
      sl.addEventListener('mousemove', e => { const r = sl.getBoundingClientRect(), p = (e.clientX - r.left) / r.width - .5; gsap.to(slats, { x: i => p * (i - 3) * 14, duration: .6, ease: 'power3.out', overwrite: 'auto' }); });
      sl.addEventListener('mouseleave', () => gsap.to(slats, { x: 0, duration: .9, ease: 'elastic.out(1,.5)' }));
    }

    /* 2 · STORY - sticky stage: the year rolls and the photo wipes in as each chapter scrolls past (no side scrolling) */
    mm.add('(min-width:901px)', () => {
      const chs = $$('.st-ch'), figs = $$('.st-imgs figure'), roll = $('.st-roll'), cnt = $('.st-count b');
      let cur = -1, z = 1;
      gsap.set(figs.slice(1), { clipPath: 'inset(100% 0 0 0)' });
      const show = i => {
        if (i === cur) return;
        const dir = i > cur ? 1 : -1, first = cur === -1; cur = i;
        chs.forEach((c, k) => c.classList.toggle('on', k === i));
        gsap.to(roll, { yPercent: -20 * i, duration: first ? 0 : .9, ease: 'power4.inOut' });
        if (!first) {
          const f = figs[i];
          gsap.set(f, { zIndex: ++z });
          gsap.fromTo(f, { clipPath: dir > 0 ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 1.1, ease: 'power4.inOut' });
          gsap.fromTo($('img', f), { scale: 1.3 }, { scale: 1, duration: 1.6, ease: 'power3.out' });
        }
        cnt.textContent = '0' + (i + 1);
        gsap.fromTo($$('h3, p', chs[i]), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: .1, duration: .8, delay: .2, ease: 'power3.out' });
      };
      chs.forEach((c, k) => ScrollTrigger.create({ trigger: c, start: 'top 60%', end: 'bottom 60%', onToggle: s => s.isActive && show(k) }));
      show(0);
      gsap.to('.st-line i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.st-list', start: 'top 60%', end: 'bottom 60%', scrub: true } });
    });
    mm.add('(max-width:900px)', () => {
      $$('.st-ch').forEach(p => {
        gsap.from(p, { y: 60, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 90%' } });
        gsap.from($('.st-m', p), { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: p, start: 'top 75%' } });
      });
    });

    /* 3 · VALUES — panels expand on hover / tap / focus and cycle on their own until you touch them */
    const vals = $$('.val'); let vi = 0, auto;
    const act = i => { vi = i; vals.forEach((v, k) => v.classList.toggle('on', k === i)); };
    const stop = () => { clearInterval(auto); auto = null; };
    vals.forEach((v, i) => {
      v.addEventListener('click', () => { stop(); act(i); });
      v.addEventListener('focus', () => { stop(); act(i); });
      if (fine) v.addEventListener('mouseenter', () => { stop(); act(i); });
    });
    gsap.from(vals, { clipPath: 'inset(100% 0 0 0)', stagger: .12, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: '.vals', start: 'top 82%' } });
    ScrollTrigger.create({ trigger: '.vals', start: 'top 70%', end: 'bottom 20%',
      onToggle: s => { if (s.isActive && !auto && !reduce) auto = setInterval(() => act((vi + 1) % vals.length), 3600); else if (!s.isActive) stop(); } });

    /* 4 · MANIFESTO — words light up as you scroll, photo pills grow inside the sentence */
    const words = splitWords($('.mani'));
    gsap.to(words, { opacity: 1, stagger: .12, ease: 'none', scrollTrigger: { trigger: '.mani', start: 'top 78%', end: 'bottom 52%', scrub: true } });
    $$('.pimg').forEach(p => gsap.fromTo(p, { width: 0, borderWidth: 0 }, { width: '1.8em', borderWidth: 2, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'top 50%', scrub: true } }));

    /* 5 · TEAM — polaroids start as one pile and fly out to the grid on scroll */
    const pg = $('.pol-grid'), rots = [-14, 9, -8, 13];
    gsap.from('.pol', {
      x: (i, el) => pg.offsetWidth / 2 - (el.offsetLeft + el.offsetWidth / 2),
      y: (i, el) => pg.offsetHeight / 2 - (el.offsetTop + el.offsetHeight / 2),
      rotation: i => rots[i % 4] * 1.8, scale: .72, ease: 'none', stagger: .05,
      scrollTrigger: { trigger: pg, start: 'top 88%', end: 'top 30%', scrub: .8, invalidateOnRefresh: true }
    });

    /* 6 · BENTO — odometer digits roll into place, tiles pop in, cursor spotlight */
    $$('.od').forEach(o => {
      const v = o.dataset.od, rolls = [];
      o.setAttribute('aria-label', v);
      [...v].forEach(ch => {
        if (/\d/.test(ch)) {
          const col = document.createElement('span'), roll = document.createElement('span');
          col.className = 'od-col'; col.setAttribute('aria-hidden', 'true'); roll.className = 'od-roll';
          roll.innerHTML = Array.from({ length: 20 }, (_, k) => `<span>${k % 10}</span>`).join('');
          col.append(roll); o.append(col); rolls.push([roll, +ch]);
        } else {
          const s = document.createElement('span'); s.className = 'od-s' + (ch === '+' ? ' pl' : ''); s.textContent = ch; s.setAttribute('aria-hidden', 'true'); o.append(s);
        }
      });
      gsap.fromTo(rolls.map(r => r[0]), { yPercent: 0 }, { yPercent: i => -(10 + rolls[i][1]) * 5, duration: 2.2, stagger: { each: .18, from: 'end' }, ease: 'power4.inOut', scrollTrigger: { trigger: o, start: 'top 90%', once: true } });
    });
    gsap.from('.bt', { y: 60, scale: .9, opacity: 0, stagger: { each: .09, from: 'random' }, duration: .9, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.bento', start: 'top 85%' } });
    $$('.bt').forEach(t => t.addEventListener('pointermove', e => { const r = t.getBoundingClientRect(); t.style.setProperty('--mx', e.clientX - r.left + 'px'); t.style.setProperty('--my', e.clientY - r.top + 'px'); }));

    /* 7 · CTA — a small circle of photo grows until it floods the screen */
    gsap.timeline({ scrollTrigger: { trigger: '.ab-cta', start: 'top top', end: 'bottom bottom', scrub: true } })
      .fromTo('.cta-img', { clipPath: 'circle(11% at 50% 50%)' }, { clipPath: 'circle(82% at 50% 50%)', ease: 'none', duration: 1 }, 0)
      .fromTo('.cta-img img', { scale: 1.5 }, { scale: 1, ease: 'none', duration: 1 }, 0)
      .fromTo('.orbit-wrap', { scale: .45, opacity: 0 }, { scale: 1.15, opacity: 1, ease: 'none', duration: 1 }, 0)
      .fromTo('.cta-over h2', { scale: .8, opacity: .35 }, { scale: 1, opacity: 1, ease: 'none', duration: .6 }, 0)
      .fromTo('.cta-over .btn', { y: 30, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', duration: .3 }, .55);

    /* footer (same as home) */
    const bw = $('.bigword'); bw.innerHTML = [...bw.textContent].map(c => `<span>${c}</span>`).join('');
    gsap.from('.bigword span', { yPercent: 110, stagger: .06, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top 85%', end: 'bottom bottom', scrub: true } });
    gsap.from('.f-top > div', { y: 40, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.f-top', start: 'top 90%' } });
    newsletter();

    addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* =====================================================
     BLOG PAGE - 7 sections, each with its own new animation
     ===================================================== */
  function initBlog(reduce) {
    const fine = matchMedia('(hover:hover) and (min-width:901px)').matches;
    const mm = gsap.matchMedia();
    const rand = gsap.utils.random;

    /* shared: loader, header, cursor, magnetic buttons */
    gsap.timeline().to('.lbar i', { scaleX: 1, duration: .9, ease: 'power2.inOut' })
      .to('.loader img', { y: -24, opacity: 0, duration: .4 })
      .to('.loader', { yPercent: -100, duration: .9, ease: 'power4.inOut' }, '-=.1')
      .set('.loader', { display: 'none' });
    gsap.from('.header', { y: -80, opacity: 0, duration: .9, delay: 1.3, clearProps: 'transform,opacity' });
    if (fine) {
      const c = $('.cursor'), mx = gsap.quickTo(c, 'x', { duration: .25 }), my = gsap.quickTo(c, 'y', { duration: .25 });
      addEventListener('mousemove', e => { c.style.opacity = 1; mx(e.clientX - c.offsetWidth / 2); my(e.clientY - c.offsetHeight / 2); });
      $$('a,button,.bl-card,.bl-pick,.bl-sc,.bl-note,.bl-env').forEach(el => {
        el.addEventListener('mouseenter', () => c.classList.add('big'));
        el.addEventListener('mouseleave', () => c.classList.remove('big'));
      });
      $$('.btn').forEach(b => {
        b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .3 }); });
        b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
      });
    }

    /* shared: tags + headings rise word by word */
    $$('.tag').filter(t => !t.closest('.bl-book')).forEach(t => gsap.from(t, { x: -30, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: t, start: 'top 90%' } }));
    $$('main h2:not(.nosplit)').forEach(h => {
      h.innerHTML = h.textContent.trim().split(/\s+/).map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
      gsap.from($$('.w>span', h), { yPercent: 120, rotationZ: 8, opacity: 0, stagger: .07, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
    });

    /* 1 · HERO - the photo-filled word condenses out of liquid, then ripples with your pointer (or on its own on touch screens) */
    const disp = $('#blDisp'), turb = $('#blTurb'), L = { s: 0 }, BASE = 6;
    let liquidReady = false;
    const setS = () => disp.setAttribute('scale', L.s.toFixed(1));
    gsap.timeline({ delay: 1.5 })
      .fromTo(L, { s: 160 }, { s: BASE, duration: 2.6, ease: 'power3.out', onUpdate: setS, onComplete: () => { liquidReady = true; } }, 0)
      .from('#blWord', { opacity: 0, letterSpacing: '.16em', duration: 1.6, ease: 'power3.out' }, 0)
      .from('.bl-kicker, .bl-hero .crumb, .bl-sub, .bl-facts, .bl-jump', { y: 24, opacity: 0, stagger: .1, duration: .8, ease: 'power3.out' }, 1);
    if (!reduce) {
      gsap.to(turb, { attr: { baseFrequency: '0.011 0.026' }, duration: 7, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      if (!fine) gsap.timeline({ repeat: -1, repeatDelay: 3.5, delay: 5 })
        .to(L, { s: 36, duration: .9, ease: 'sine.inOut', onUpdate: setS })
        .to(L, { s: BASE, duration: 1.6, ease: 'elastic.out(1,.4)', onUpdate: setS });
    }
    let lx = 0, ly = 0;
    $('.bl-hero').addEventListener('pointermove', e => {
      const v = Math.min(Math.hypot(e.clientX - lx, e.clientY - ly) * 1.7, 64); lx = e.clientX; ly = e.clientY;
      if (!liquidReady || reduce || !fine) return;
      gsap.to(L, { s: BASE + v, duration: .25, overwrite: 'auto', onUpdate: setS,
        onComplete: () => gsap.to(L, { s: BASE, duration: 1.8, ease: 'elastic.out(1,.35)', onUpdate: setS }) });
    });

    /* 2 · FEATURED - a pinned book: the cover swings open (left page appears) as you scroll; on phones it lifts away like a flip-up cover */
    mm.add('(min-width:901px)', () => {
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.bl-feat', start: 'top top', end: 'bottom bottom', scrub: .7 } })
        .to('.bl-hint', { opacity: 0, duration: .12 }, 0)
        .to('.bl-book', { xPercent: 50, duration: .8 }, .05)
        .to('.bl-cover', { rotationY: -180, duration: .8 }, .05)
        .to('.bl-shade', { opacity: 0, duration: .6 }, .2)
        .from('.bl-rpage .bl-ftxt > *', { y: 14, opacity: 0, stagger: .05, duration: .2 }, .58)
        .from('.bl-points li', { x: -22, opacity: 0, stagger: .08, duration: .2 }, .6)
        .fromTo('.bl-readring .fg', { strokeDashoffset: 327 }, { strokeDashoffset: 0, duration: .3 }, .66)
        .to({}, { duration: .25 }, .85);
    });
    mm.add('(max-width:900px)', () => {
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.bl-feat', start: 'top top', end: 'bottom bottom', scrub: .7 } })
        .to('.bl-hint', { opacity: 0, duration: .12 }, 0)
        .to('.bl-cover', { rotationX: 92, duration: .7 }, .05)
        .to('.bl-cover', { opacity: 0, duration: .25 }, .45)
        .to('.bl-shade', { opacity: 0, duration: .6 }, .1)
        .from('.bl-rpage .bl-ftxt > *', { y: 14, opacity: 0, stagger: .05, duration: .2 }, .45)
        .to({}, { duration: .3 }, .7);
    });

    /* 3 · TOPICS - chips filter the grid; leaving cards shrink away, the rest glide to their new places (FLIP) */
    const cards = $$('.bl-card'), fbtns = $$('.bl-f-btn'), countEl = $('#blCount');
    let cat = 'all', dealt = false;
    const match = c => cat === 'all' || c.dataset.cat === cat;
    fbtns.forEach(b => { $('b', b).textContent = b.dataset.cat === 'all' ? cards.length : cards.filter(c => c.dataset.cat === b.dataset.cat).length; });
    function setFilter(next, animate) {
      if (next === cat) return; cat = next;
      fbtns.forEach(b => { const on = b.dataset.cat === cat; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      countEl.textContent = cards.filter(match).length;
      if (!animate || reduce || !dealt) { cards.forEach(c => { c.hidden = !match(c); }); return; }
      gsap.killTweensOf(cards); gsap.set(cards, { clearProps: 'transform,opacity' });
      const first = new Map(cards.filter(c => !c.hidden).map(c => [c, c.getBoundingClientRect()]));
      const leaving = cards.filter(c => !c.hidden && !match(c));
      const regroup = () => {
        leaving.forEach(c => { c.hidden = true; }); gsap.set(leaving, { clearProps: 'all' });
        cards.filter(c => c.hidden && match(c)).forEach(c => { c.hidden = false; });
        cards.filter(c => !c.hidden).forEach(c => {
          const f = first.get(c), r = c.getBoundingClientRect();
          if (f) gsap.from(c, { x: f.left - r.left, y: f.top - r.top, duration: .9, ease: 'power4.inOut', clearProps: 'transform' });
          else gsap.from(c, { scale: .6, opacity: 0, rotation: rand(-10, 10), y: 40, duration: .8, delay: .3, ease: 'back.out(1.6)', clearProps: 'transform,opacity' });
        });
        gsap.delayedCall(1.3, () => ScrollTrigger.refresh());
      };
      if (leaving.length) gsap.to(leaving, { scale: .6, opacity: 0, rotation: () => rand(-12, 12), duration: .35, ease: 'power2.in', onComplete: regroup });
      else regroup();
    }
    fbtns.forEach(b => b.addEventListener('click', () => setFilter(b.dataset.cat, true)));
    $$('.bl-jump a[data-topic]').forEach(a => a.addEventListener('click', () => setFilter(a.dataset.topic, false)));
    $$('.bl-card a[href="#"], .bl-ftxt a[href="#"], .bl-more a[href="#"], .bl-shelf-info a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
    gsap.from(cards, { rotationX: -85, y: -24, opacity: 0, transformPerspective: 900, transformOrigin: '50% 0', stagger: .09, duration: 1.1, ease: 'back.out(1.5)', clearProps: 'transform,opacity',
      scrollTrigger: { trigger: '.bl-grid', start: 'top 82%', once: true }, onComplete: () => { dealt = true; } });
    if (fine) $$('.bl-ph').forEach(p => p.addEventListener('pointermove', e => { const r = p.getBoundingClientRect(); p.style.setProperty('--lx', e.clientX - r.left + 'px'); p.style.setProperty('--ly', e.clientY - r.top + 'px'); }));

    /* 4 · PICKS - the blob keeps morphing; each new photo opens like an iris, a ring times the auto-play */
    const picks = $$('.bl-pick'), pimgs = $$('.bl-blob img'); let pi = 0, pz = 1;
    const act = (i, first) => {
      if (i === pi && !first) return;
      pi = i; picks.forEach((p, k) => { p.classList.toggle('on', k === i); p.setAttribute('aria-current', k === i); });
      if (first) return;
      const im = pimgs[i]; gsap.set(im, { zIndex: ++pz });
      gsap.fromTo(im, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1.2, ease: 'power3.inOut', clearProps: 'clipPath' });
      gsap.fromTo(im, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: 'power3.out' });
      gsap.fromTo('.bl-blob', { scale: .9 }, { scale: 1, duration: 1.4, ease: 'elastic.out(1,.45)' });
    };
    picks.forEach((p, i) => {
      p.addEventListener('click', () => act(i));
      p.addEventListener('focus', () => act(i));
      p.addEventListener('animationend', e => { if (e.animationName === 'blRing') act((pi + 1) % picks.length); });
    });
    gsap.from('.bl-blobwrap', { scale: .55, opacity: 0, rotation: -25, duration: 1.5, ease: 'elastic.out(1,.6)', scrollTrigger: { trigger: '.bl-blobwrap', start: 'top 85%' } });
    gsap.from(picks, { x: 70, opacity: 0, stagger: .14, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.bl-pk-list', start: 'top 85%' } });

    /* 5 · SERIES - a 3D ring of cards: it opens outward on entry, spins on its own, follows your drag with momentum and snaps with the arrows */
    const ring = $('#blRing'), stage = $('#blStage'), scs = $$('.bl-sc'), SN = scs.length, STEP = 360 / SN;
    const sTitle = $('#blSTitle'), sTxt = $('#blSTxt'), so = { r: 0 };
    let rot = 0, vel = 0, dragging = false, hov = false, lastX = 0, moved = 0, snap = null, sIn = false, cur = -1;
    const render = () => {
      gsap.set(ring, { rotationY: rot });
      scs.forEach((c, k) => { const a = (((k * STEP + rot) % 360) + 540) % 360 - 180; c.style.setProperty('--b', (.4 + .6 * Math.max(0, Math.cos(a * Math.PI / 180))).toFixed(2)); });
      const idx = ((Math.round(-rot / STEP) % SN) + SN) % SN;
      if (idx !== cur) {
        cur = idx; sTitle.textContent = scs[idx].dataset.title; sTxt.textContent = scs[idx].dataset.txt;
        gsap.fromTo([sTitle, sTxt], { y: 12, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .5, overwrite: true });
      }
    };
    const snapTo = target => {
      vel = 0; if (snap) snap.kill(); so.r = rot;
      snap = gsap.to(so, { r: target, duration: 1.1, ease: 'power3.inOut', onUpdate: () => { rot = so.r; render(); }, onComplete: () => { snap = null; } });
    };
    const step = d => snapTo(-(Math.round(-rot / STEP) + d) * STEP);
    gsap.ticker.add((t, dt) => {
      if (!sIn || snap) return;
      const d = dt / 16.667;
      if (!dragging && Math.abs(vel) > .01) { rot += vel * d; vel *= Math.pow(.94, d); }
      else if (!dragging && !hov && !reduce) rot -= .16 * d;
      else if (!dragging) return;
      render();
    });
    stage.addEventListener('pointerdown', e => { dragging = true; moved = 0; lastX = e.clientX; vel = 0; if (snap) { snap.kill(); snap = null; } });
    addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx); rot += dx * .35; vel = dx * .35; render(); });
    addEventListener('pointerup', () => { dragging = false; });
    if (fine) { stage.addEventListener('mouseenter', () => { hov = true; }); stage.addEventListener('mouseleave', () => { hov = false; }); }
    scs.forEach((c, k) => c.addEventListener('click', () => {
      if (moved > 6) return;
      let d = (((-k * STEP - rot) % 360) + 540) % 360 - 180; snapTo(rot + d);
    }));
    $('#blSPrev').addEventListener('click', () => step(-1));
    $('#blSNext').addEventListener('click', () => step(1));
    render();
    gsap.from(ring, { '--rad': '0px', duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: '#blShelf', start: 'top 80%', once: true } });
    ScrollTrigger.create({ trigger: '#blShelf', start: 'top 85%', once: true, onEnter: () => {
      sIn = true; so.r = rot - 240;
      snap = gsap.to(so, { r: rot, duration: 2, ease: 'power3.out', onStart: () => { rot -= 240; render(); }, onUpdate: () => { rot = so.r; render(); }, onComplete: () => { snap = null; } });
    } });

    /* 6 · NOTES - each sticky note drops from the ceiling in random order, bounces to rest, then pins pop in */
    const notes = $$('.bl-note');
    const ntl = gsap.timeline({ scrollTrigger: { trigger: '#blBoard', start: 'top 80%', once: true } });
    gsap.utils.shuffle(notes.map((_, i) => i)).forEach((idx, k) => {
      const n = notes[idx], at = k * .14;
      ntl.fromTo(n, { y: -(innerHeight * .7 + rand(0, 220)), rotation: rand(-28, 28) }, { y: 0, rotation: 0, duration: 1.4, ease: 'bounce.out', clearProps: 'transform' }, at)
        .fromTo(n, { opacity: 0 }, { opacity: 1, duration: .2, ease: 'none', clearProps: 'opacity' }, at)
        .from($('.bl-pin', n), { scale: 0, duration: .5, ease: 'back.out(3)' }, at + .6);
    });

    /* 7 · ENVELOPE - the flap folds back, the letter rises; sending tucks it in, seals it and posts the envelope away */
    const env = $('#blEnv'), wrap = $('#blEnvWrap'), flap = $('.bl-flap'), slot = $('.bl-slot'), letter = $('.bl-letter'), news = $('#blNews'), sent = $('#blSent');
    let isOpen = false;
    const riseY = () => -Math.max(0, letter.offsetHeight - env.offsetHeight * .54);
    const fit = () => { wrap.style.paddingTop = Math.round(Math.max(0, letter.offsetHeight - env.offsetHeight * .64) + 20) + 'px'; if (isOpen) gsap.set(letter, { y: riseY() }); };
    fit(); addEventListener('resize', fit); addEventListener('load', fit);
    ScrollTrigger.create({ trigger: env, start: 'top 78%', once: true, onEnter: () => {
      isOpen = true;
      gsap.timeline()
        .to(flap, { scaleY: -1, duration: .9, ease: 'power2.inOut' })
        .add(() => env.classList.add('open'), .42)
        .set(flap, { zIndex: 1 }, .42)
        .set(slot, { clipPath: 'inset(-140% -6% 0 -6%)' }, .85)
        .to(letter, { y: riseY(), duration: 1.15, ease: 'power3.out' }, .85)
        .from('.bl-letter > *', { y: 16, opacity: 0, stagger: .07, duration: .5, ease: 'power3.out' }, 1.3);
    } });
      /* email is required + validated in JS; after sealing, the envelope flies away and the page goes to 404.html */
    const mail = $('input[type=email]', news), sendBtn = $('button[type=submit], .btn', news);
    news.noValidate = true; /* we show our own message instead of the browser's */
    const mailErr = document.createElement('small');
    mailErr.className = 'bl-err'; mailErr.setAttribute('role', 'alert'); mail.after(mailErr);
    const checkMail = () => {
      const v = mail.value.trim();
      const m = !v ? 'Please enter your email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? 'Enter a valid email like you@company.com.' : '';
      mailErr.textContent = m; mailErr.classList.toggle('show', !!m);
      mail.classList.toggle('invalid', !!m); mail.setAttribute('aria-invalid', m ? 'true' : 'false');
      fit(); /* letter height changes when the message shows, keep the envelope layout correct */
      return !m;
    };
    mail.addEventListener('input', checkMail);
    news.addEventListener('submit', e => {
      e.preventDefault(); if (!isOpen) return;
      if (!checkMail()) {
        mail.focus();
        gsap.fromTo(env, { x: -10 }, { x: 0, duration: .7, ease: 'elastic.out(1,.25)' });
        return;
      }
      isOpen = false; if (sendBtn) sendBtn.disabled = true;
      gsap.timeline()
        .to(letter, { y: 0, duration: .8, ease: 'power3.inOut' })
        .set(slot, { clipPath: 'inset(0 -6% 0 -6%)' })
        .addLabel('close')
        .to(flap, { scaleY: 1, duration: .8, ease: 'power2.inOut' }, 'close')
        .add(() => env.classList.remove('open'), 'close+=.4')
        .set(flap, { zIndex: 4 }, 'close+=.4')
        .to(env, { x: '115%', rotation: 9, opacity: 0, duration: .9, ease: 'power3.in' }, 'close+=1.05')
        .add(() => { sent.classList.add('show'); news.reset(); })
        .from(sent.children, { y: 24, opacity: 0, stagger: .12, duration: .7, ease: 'power3.out' })
        .add(() => { setTimeout(() => { location.href = '404.html'; }, 1200); });
    });
    /* coming back (or browser Back) always shows a fresh envelope with an empty field */
    addEventListener('pageshow', ev => {
      if (ev.persisted) { location.reload(); return; } /* page restored from cache in its "sent" state: reload for a clean start */
      news.reset(); mailErr.textContent = ''; mailErr.classList.remove('show');
      mail.classList.remove('invalid'); if (sendBtn) sendBtn.disabled = false;
    });

    /* footer (same as home and about) */
    const bw = $('.bigword'); bw.innerHTML = [...bw.textContent].map(c => `<span>${c}</span>`).join('');
    gsap.from('.bigword span', { yPercent: 110, stagger: .06, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top 85%', end: 'bottom bottom', scrub: true } });
    gsap.from('.f-top > div', { y: 40, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.f-top', start: 'top 90%' } });
    newsletter();

    addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* =====================================================
     SERVICES PAGE - 7 sections, each with its own new animation
     ===================================================== */
  function initServices(reduce) {
    const fine = matchMedia('(hover:hover) and (min-width:901px)').matches;
    const rand = gsap.utils.random;

    /* shared: loader, header, cursor, magnetic buttons */
    gsap.timeline().to('.lbar i', { scaleX: 1, duration: .9, ease: 'power2.inOut' })
      .to('.loader img', { y: -24, opacity: 0, duration: .4 })
      .to('.loader', { yPercent: -100, duration: .9, ease: 'power4.inOut' }, '-=.1')
      .set('.loader', { display: 'none' });
    gsap.from('.header', { y: -80, opacity: 0, duration: .9, delay: 1.3, clearProps: 'transform,opacity' });
    if (fine) {
      const c = $('.cursor'), mx = gsap.quickTo(c, 'x', { duration: .25 }), my = gsap.quickTo(c, 'y', { duration: .25 });
      addEventListener('mousemove', e => { c.style.opacity = 1; mx(e.clientX - c.offsetWidth / 2); my(e.clientY - c.offsetHeight / 2); });
      $$('a,button,.sv-cmp,.sv-chip,.sv-face').forEach(el => {
        el.addEventListener('mouseenter', () => c.classList.add('big'));
        el.addEventListener('mouseleave', () => c.classList.remove('big'));
      });
      $$('.btn').forEach(b => {
        b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .3 }); });
        b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
      });
    }

    /* helper: split text into letters */
    const splitChars = el => {
      const out = [];
      const walk = n => [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) f.append(' ');
            else { const w = document.createElement('span'); w.className = 'cw'; [...t].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; w.append(s); out.push(s); }); f.append(w); }
          });
          c.replaceWith(f);
        } else if (c.nodeType === 1) walk(c);
      });
      walk(el); return out;
    };

    /* shared: tags + headings rise word by word */
    $$('.tag').forEach(t => gsap.from(t, { x: -30, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: t, start: 'top 90%' } }));
    $$('main h2:not(.nosplit)').forEach(h => {
      h.innerHTML = h.textContent.trim().split(/\s+/).map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
      gsap.from($$('.w>span', h), { yPercent: 120, rotationZ: 8, opacity: 0, stagger: .07, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
    });

    /* 1 · HERO - a torch lights the photo and fills the word; it follows a mouse or finger, and wanders on its own when idle */
    const hero = $('#svHero');
    const T = { x: 0, y: 0, r: 1 }, aim = { x: 0, y: 0, r: 160 };
    let W = 0, H = 0, R = 160, last = -1e9, started = false, heroIn = true, pressed = false;
    const measure = () => { const b = hero.getBoundingClientRect(); W = b.width; H = b.height; R = Math.max(110, Math.min(220, Math.min(W, H) * .22)); };
    measure(); addEventListener('resize', measure);
    T.x = aim.x = W * .5; T.y = aim.y = H * .55;
    const paint = () => { hero.style.setProperty('--tx', T.x.toFixed(1) + 'px'); hero.style.setProperty('--ty', T.y.toFixed(1) + 'px'); hero.style.setProperty('--tr', Math.max(1, T.r).toFixed(1) + 'px'); };
    paint();
    const dim = splitChars($('.sv-dim .sv-big')), lit = splitChars($('.sv-lit .sv-big'));
    const place = e => { const b = hero.getBoundingClientRect(); aim.x = e.clientX - b.left; aim.y = e.clientY - b.top; aim.r = R * (pressed ? 1.6 : e.pointerType === 'mouse' ? 1.15 : 1); last = performance.now(); };
    hero.addEventListener('pointermove', place);
    hero.addEventListener('pointerdown', e => { pressed = true; place(e); });
    addEventListener('pointerup', () => { pressed = false; aim.r = R; });
    hero.addEventListener('pointerleave', () => { last = performance.now() - 1400; });
    gsap.ticker.add(() => {
      if (!started || !heroIn) return;
      const now = performance.now(), idle = now - last > 2800;
      if (idle) {
        aim.r = R;
        if (reduce) { aim.x = W * .5; aim.y = H * .55; }
        else { const s = now / 1000; aim.x = W * (.5 + .34 * Math.sin(s * .7)); aim.y = H * (.54 + .24 * Math.sin(s * .93 + 1)); }
      }
      const k = idle ? .04 : .16;
      T.x += (aim.x - T.x) * k; T.y += (aim.y - T.y) * k; T.r += (aim.r - T.r) * .09;
      paint();
    });
    ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: s => { heroIn = s.isActive; } });
    const lettersIn = { rotationX: -100, yPercent: 60, opacity: 0, transformOrigin: '50% 100%', stagger: { each: .05, from: 'center' }, duration: 1, ease: 'back.out(1.6)' };
    gsap.timeline({ delay: 1.5 })
      .from(dim, lettersIn, 0).from(lit, lettersIn, 0)
      .from('.sv-front .crumb, .sv-kicker, .sv-sub, .sv-cta .btn, .sv-hint', { y: 26, opacity: 0, stagger: .1, duration: .8, ease: 'power3.out' }, .5)
      .add(() => { started = true; last = performance.now() - 5000; }, .35);

    /* 2 · DRUM - a six-sided prism rolls forward as you scroll, snapping one service at a time */
    const prism = $('#svPrism'), faces = $$('.sv-face'), N = faces.length, dots = $('#svDots');
    const nfo = { num: $('#svNum'), title: $('#svTitle'), txt: $('#svTxt'), tags: $('#svTags') };
    const rx = { v: 0 }; let cur = -1;
    const roll = () => prism.style.setProperty('--rx', rx.v.toFixed(2));
    faces.forEach((f, i) => {
      const li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.textContent = i + 1; b.setAttribute('aria-label', 'Show ' + f.dataset.title.replace('&amp;', '&'));
      b.addEventListener('click', () => { const s = drumST; scrollTo({ top: s.start + (s.end - s.start) * i / (N - 1) + 1, behavior: reduce ? 'auto' : 'smooth' }); });
      li.append(b); dots.append(li);
    });
    const showFace = (i, animate) => {
      if (i === cur) return; cur = i;
      const f = faces[i];
      faces.forEach((x, k) => x.classList.toggle('on', k === i));
      $$('button', dots).forEach((b, k) => b.classList.toggle('on', k === i));
      nfo.num.textContent = '0' + (i + 1);
      nfo.title.innerHTML = f.dataset.title;
      nfo.txt.textContent = f.dataset.txt;
      nfo.tags.innerHTML = f.dataset.tags.split(',').map(t => `<li>${t}</li>`).join('');
      if (animate) gsap.fromTo([nfo.num, nfo.title, nfo.txt, ...$$('li', nfo.tags)], { y: 26, opacity: 0 }, { y: 0, opacity: 1, stagger: .05, duration: .6, ease: 'power3.out', overwrite: true });
    };
    showFace(0, false); roll();
    const drumST = ScrollTrigger.create({
      trigger: '#svDrumTrack', start: 'top top', end: 'bottom bottom',
      snap: reduce ? false : { snapTo: 1 / (N - 1), duration: { min: .25, max: .7 }, delay: .08, ease: 'power2.inOut' },
      onUpdate: s => {
        gsap.to(rx, { v: -60 * s.progress * (N - 1), duration: .7, ease: 'power3.out', overwrite: true, onUpdate: roll });
        showFace(Math.round(s.progress * (N - 1)), true);
      }
    });
    ScrollTrigger.create({ trigger: '#svDrumTrack', start: 'top 85%', once: true, onEnter: () => { if (drumST.progress < .02) gsap.fromTo(rx, { v: 80 }, { v: 0, duration: 1.5, ease: 'power3.out', onUpdate: roll }); } });

    /* 3 · BEFORE / AFTER - drag, tap or use arrow keys; it demos itself once, and tabs wipe between brands */
    const cmp = $('#svCmp'), range = $('#svRange'), P = { v: 50 };
    const setP = v => { P.v = v; cmp.style.setProperty('--p', v.toFixed(1) + '%'); range.value = v; };
    let demo = null;
    const stopDemo = () => { if (demo) { demo.kill(); demo = null; } };
    range.addEventListener('input', () => { stopDemo(); P.v = +range.value; cmp.style.setProperty('--p', P.v + '%'); });
    cmp.addEventListener('pointerdown', stopDemo);
    const sweep = () => { stopDemo(); demo = gsap.timeline()
      .to(P, { v: 6, duration: 1.1, ease: 'power2.inOut', onUpdate: () => setP(P.v) })
      .to(P, { v: 94, duration: 1.7, ease: 'power2.inOut', onUpdate: () => setP(P.v) })
      .to(P, { v: 50, duration: 1.1, ease: 'power2.inOut', onUpdate: () => setP(P.v) }); };
    ScrollTrigger.create({ trigger: cmp, start: 'top 75%', once: true, onEnter: () => { if (!reduce) sweep(); } });
    gsap.from(cmp, { y: 60, opacity: 0, scale: .94, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: cmp, start: 'top 88%' } });
    const tabs = $$('.sv-tabs button'), bImg = $('#svBefore'), aImg = $('#svAfter');
    const baEls = [$('#svBaName'), $('#svBaText'), $('.sv-ba-stat')];
    tabs.forEach(t => t.addEventListener('click', () => {
      if (t.classList.contains('on')) return; stopDemo();
      tabs.forEach(x => { const on = x === t; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
      gsap.timeline()
        .to(P, { v: 100, duration: .55, ease: 'power3.in', onUpdate: () => setP(P.v) })
        .add(() => { bImg.src = aImg.src = t.dataset.img; $('#svBaName').textContent = t.dataset.name; $('#svBaText').textContent = t.dataset.text; $('#svBaStat').textContent = t.dataset.stat; $('#svBaLabel').textContent = t.dataset.label; gsap.fromTo(baEls, { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .6, ease: 'power3.out' }); })
        .to(P, { v: 0, duration: .01 })
        .to(P, { v: 50, duration: 1.3, ease: 'power4.out', onUpdate: () => setP(P.v) });
    }));

    /* 4 · JOURNEY - the line draws itself as you scroll and a rocket flies along it, lighting each stop */
    const track = $('#svTrack'), svg = $('#svSvg'), p0 = $('#svP0'), p1 = $('#svP1'), rocket = $('#svRocket');
    const stops = $$('.sv-stop'), pins = stops.map(s => $('.sv-pin', s)), pr = { v: 0 };
    let L = 1, marks = [];
    gsap.set(rocket, { xPercent: -50, yPercent: -50 });
    const draw = () => {
      const len = L * pr.v, pt = p1.getPointAtLength(len), a = p1.getPointAtLength(Math.max(0, len - 3)), b = p1.getPointAtLength(Math.min(L, len + 3));
      gsap.set(rocket, { x: pt.x, y: pt.y, rotation: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 45 });
      p1.style.strokeDashoffset = L - len;
      stops.forEach((s, i) => s.classList.toggle('on', i === 0 ? pr.v > .002 : len >= marks[i] - 2));
    };
    const build = () => {
      const tb = track.getBoundingClientRect(), w = tb.width, h = tb.height;
      svg.setAttribute('viewBox', `0 0 ${w.toFixed(1)} ${h.toFixed(1)}`);
      const pts = pins.map(p => { const r = p.getBoundingClientRect(); return { x: r.left - tb.left + r.width / 2, y: r.top - tb.top + r.height / 2 }; });
      const amp = w > 760 ? Math.min(w * .07, 76) : 20;
      const seg = (a, b, i) => { const s = i % 2 ? 1 : -1, dy = b.y - a.y; return ` C${(a.x + s * amp * 1.3).toFixed(1)} ${(a.y + dy * .35).toFixed(1)} ${(b.x + s * amp * 1.3).toFixed(1)} ${(b.y - dy * .35).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`; };
      let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`; const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      marks = [0];
      for (let i = 1; i < pts.length; i++) { d += seg(pts[i - 1], pts[i], i); tmp.setAttribute('d', d); marks.push(tmp.getTotalLength()); }
      p0.setAttribute('d', d); p1.setAttribute('d', d);
      L = p1.getTotalLength(); p1.style.strokeDasharray = L; draw();
    };
    build(); ScrollTrigger.addEventListener('refresh', build);
    ScrollTrigger.create({ trigger: track, start: 'top 68%', end: 'bottom 62%', onUpdate: s => gsap.to(pr, { v: s.progress, duration: .5, ease: 'power2.out', overwrite: true, onUpdate: draw }) });

    /* 5 · ESTIMATOR - choose services and a liquid tank rises to your budget, sloshing as it settles */
    const chips = $$('.sv-chip'), tank = $('#svTank'), w1 = $('#svW1'), w2 = $('#svW2'), pctEl = $('#svPct'), totEl = $('#svTotal');
    const MAX = chips.reduce((s, c) => s + +c.dataset.price, 0), fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');
    const S = { level: 0, amp: 5, phase: 0, total: 0 }; let tankIn = false, tier = -1;
    const wavePath = (y0, amp, ph, k) => { let d = `M0 ${(y0 + Math.sin(ph) * amp).toFixed(1)}`; for (let x = 10; x <= 400; x += 10) d += ` L${x} ${(y0 + Math.sin(x / 400 * Math.PI * 2 * k + ph) * amp).toFixed(1)}`; return d + ' L400 420 L0 420 Z'; };
    const wave = () => { const y0 = 412 - Math.min(1.04, Math.max(0, S.level)) * 440; w1.setAttribute('d', wavePath(y0, S.amp, S.phase, 1.5)); w2.setAttribute('d', wavePath(y0 - 8, S.amp * .8, S.phase * 1.3 + 1.6, 2)); };
    wave();
    ScrollTrigger.create({ trigger: tank, start: 'top bottom', end: 'bottom top', onToggle: s => { tankIn = s.isActive; } });
    gsap.ticker.add((t, dt) => { if (!tankIn || reduce) return; S.phase += dt * .0035; wave(); });
    const plans = [
      ['Pick a service', 'Choose what you need and we will suggest the right engagement.'],
      ['Spark', 'Focused work to launch one thing brilliantly, with a quick turnaround.'],
      ['Growth', 'A joined-up identity, site or campaign built by one small, senior team.'],
      ['Full studio', 'A complete brand, website and campaign built together, with a dedicated team.']
    ];
    const update = () => {
      const total = chips.reduce((s, c) => s + (c.getAttribute('aria-pressed') === 'true' ? +c.dataset.price : 0), 0);
      const lvl = total / MAX, ti = total === 0 ? 0 : total < 150000 ? 1 : total < 300000 ? 2 : 3;
      gsap.to(S, { level: lvl, duration: 1.7, ease: 'elastic.out(1,.6)', overwrite: 'auto', onUpdate: wave });
      gsap.fromTo(S, { amp: 24 }, { amp: 5, duration: 2.4, ease: 'power2.out', overwrite: 'auto', onUpdate: wave });
      gsap.to(S, { total, duration: 1, ease: 'power2.out', onUpdate: () => { totEl.textContent = fmt(S.total); pctEl.textContent = Math.round(S.total / MAX * 100); tank.classList.toggle('hi', S.total / MAX > .5); } });
      tank.classList.toggle('has', total > 0);
      if (ti !== tier) { tier = ti; $('#svPlanName').textContent = plans[ti][0]; $('#svPlanTxt').textContent = plans[ti][1]; gsap.fromTo('#svPlan > *', { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .5 }); }
    };
    chips.forEach(c => c.addEventListener('click', e => {
      c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') !== 'true');
      const r = c.getBoundingClientRect(), rip = document.createElement('span'); rip.className = 'sv-rip';
      rip.style.left = (e.clientX ? e.clientX - r.left : r.width / 2) + 'px'; rip.style.top = (e.clientX ? e.clientY - r.top : r.height / 2) + 'px'; c.append(rip); setTimeout(() => rip.remove(), 750);
      update();
    }));
    gsap.from(chips, { y: 40, opacity: 0, stagger: .08, duration: .8, ease: 'back.out(1.5)', scrollTrigger: { trigger: '#svChips', start: 'top 85%' } });
    gsap.from(tank, { scale: .6, opacity: 0, rotation: -20, duration: 1.3, ease: 'elastic.out(1,.6)', scrollTrigger: { trigger: tank, start: 'top 88%' } });
    ScrollTrigger.create({ trigger: tank, start: 'top 75%', once: true, onEnter: () => { if (!chips.some(c => c.getAttribute('aria-pressed') === 'true')) chips[0].click(); } });
    update();

    /* 6 · CHAT - questions become bubbles; a typing indicator shows, then the answer types itself out */
    const msgs = $('#svMsgs'), qs = $$('#svQs button'); let busy = false;
    const toEnd = () => { msgs.scrollTop = msgs.scrollHeight; };
    const addMsg = (cls, html) => { const b = document.createElement('div'); b.className = 'sv-b ' + cls; b.innerHTML = html; msgs.append(b); toEnd(); return b; };
    const botSay = (text, done) => {
      const b = addMsg('bot caret', `<span class="sr-only"></span><span class="tx" aria-hidden="true"></span>`);
      $('.sr-only', b).textContent = text; const tx = $('.tx', b);
      gsap.from(b, { y: 16, scale: .92, opacity: 0, transformOrigin: '0 100%', duration: .4, ease: 'back.out(1.6)' });
      if (reduce) { tx.textContent = text; b.classList.remove('caret'); done && done(); return; }
      let i = 0; const step = () => { i = Math.min(text.length, i + 2); tx.textContent = text.slice(0, i); toEnd(); if (i < text.length) setTimeout(step, 22); else { b.classList.remove('caret'); done && done(); } }; step();
    };
    const ask = btn => {
      if (busy || btn.classList.contains('done')) return; busy = true; btn.classList.add('done'); btn.disabled = true;
      const me = addMsg('me', ''); me.textContent = btn.dataset.q;
      gsap.from(me, { x: 40, scale: .9, opacity: 0, transformOrigin: '100% 100%', duration: .45, ease: 'back.out(1.6)' });
      setTimeout(() => {
        const w = addMsg('bot sv-wait', '<i></i><i></i><i></i>'); w.setAttribute('aria-hidden', 'true');
        gsap.from(w, { y: 12, opacity: 0, duration: .3 });
        setTimeout(() => { w.remove(); botSay(btn.dataset.a, () => {
          busy = false;
          if (qs.every(q => q.classList.contains('done'))) setTimeout(() => { const f = addMsg('bot', 'That is everything I had. <a href="index.html#contact">Send us a note</a> and a human replies within a day.'); gsap.from(f, { y: 14, opacity: 0, duration: .5 }); }, 500);
        }); }, reduce ? 0 : 1000);
      }, reduce ? 0 : 450);
    };
    qs.forEach(b => b.addEventListener('click', () => ask(b)));
    gsap.from('#svQs button', { x: -40, opacity: 0, stagger: .08, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: '#svQs', start: 'top 85%' } });
    gsap.from('.sv-phone', { y: 70, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.sv-phone', start: 'top 88%' } });
    ScrollTrigger.create({ trigger: '.sv-phone', start: 'top 70%', once: true, onEnter: () => {
      const g = addMsg('bot', 'Hi! Pick a question and I will answer straight away.'); gsap.from(g, { y: 14, opacity: 0, duration: .5 });
      setTimeout(() => ask(qs[0]), reduce ? 0 : 1100);
    } });

    /* 7 · DOORS - two barn doors slide apart as you scroll and reveal the call to action; the email button bursts confetti */
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#svDoors', start: 'top top', end: 'bottom bottom', scrub: .6 } })
      .to('.sv-door-hint', { opacity: 0, duration: .12 }, 0)
      .fromTo('.sv-room > img', { scale: 1.4 }, { scale: 1, duration: 1 }, 0)
      .to('.sv-dl', { xPercent: -100, ease: 'power2.inOut', duration: .9 }, .12)
      .to('.sv-dr', { xPercent: 100, ease: 'power2.inOut', duration: .9 }, .12)
      .fromTo('.sv-room-in', { scale: .85, opacity: 0 }, { scale: 1, opacity: 1, duration: .6 }, .4)
      .to({}, { duration: .3 });
    const copy = $('#svCopy'), cLabel = $('span', copy), MAIL = 'hello@stackly.studio';
    const burst = () => {
      const box = $('.sv-room-cta'), br = copy.getBoundingClientRect(), pr0 = box.getBoundingClientRect();
      const cx = br.left - pr0.left + br.width / 2, cy = br.top - pr0.top + br.height / 2, cols = ['#ffb02e', '#f1ebe0', '#ffd27d'];
      for (let i = 0; i < 28; i++) {
        const p = document.createElement('i'); p.className = 'sv-conf'; p.style.left = cx + 'px'; p.style.top = cy + 'px'; p.style.background = cols[i % 3]; box.append(p);
        gsap.timeline({ onComplete: () => p.remove() })
          .to(p, { x: rand(-170, 170), y: rand(-190, -60), rotation: rand(-360, 360), duration: .7, ease: 'power2.out' })
          .to(p, { y: '+=260', opacity: 0, rotation: '+=240', duration: 1, ease: 'power1.in' });
      }
    };
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(MAIL); }
      catch (e) { const ta = document.createElement('textarea'); ta.value = MAIL; ta.style.position = 'fixed'; ta.style.opacity = 0; document.body.append(ta); ta.select(); try { document.execCommand('copy'); } catch (_) {} ta.remove(); }
      cLabel.textContent = 'Copied!'; if (!reduce) burst(); setTimeout(() => { cLabel.textContent = MAIL; }, 2200);
    });

    /* footer (same as home, about and blog) */
    const bw = $('.bigword'); bw.innerHTML = [...bw.textContent].map(c => `<span>${c}</span>`).join('');
    gsap.from('.bigword span', { yPercent: 110, stagger: .06, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top 85%', end: 'bottom bottom', scrub: true } });
    gsap.from('.f-top > div', { y: 40, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.f-top', start: 'top 90%' } });
    newsletter();

    addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* =====================================================
     CONTACT PAGE (contact.html) - 7 new animations
     1 dot greetings + stamp  2 tear-off tickets  3 plane-route form
     4 split-flap board  5 orbit + calling  6 live sky + unfolding map  7 physics bubbles
     ===================================================== */
  function initContact(reduce) {
    const fine = matchMedia('(hover:hover) and (min-width:901px)').matches;
    const rand = gsap.utils.random, clamp = gsap.utils.clamp;
    const pad2 = n => String(n).padStart(2, '0');
    const copyText = async txt => {
      try { await navigator.clipboard.writeText(txt); }
      catch (e) { const ta = document.createElement('textarea'); ta.value = txt; ta.style.cssText = 'position:fixed;opacity:0'; document.body.append(ta); ta.select(); try { document.execCommand('copy'); } catch (_) { } ta.remove(); }
    };

    /* shared: loader, header, cursor, magnetic buttons */
    gsap.timeline().to('.lbar i', { scaleX: 1, duration: .9, ease: 'power2.inOut' })
      .to('.loader img', { y: -24, opacity: 0, duration: .4 })
      .to('.loader', { yPercent: -100, duration: .9, ease: 'power4.inOut' }, '-=.1')
      .set('.loader', { display: 'none' });
    gsap.from('.header', { y: -80, opacity: 0, duration: .9, delay: 1.3, clearProps: 'transform,opacity' });
    if (fine) {
      const c = $('.cursor'), mx = gsap.quickTo(c, 'x', { duration: .25 }), my = gsap.quickTo(c, 'y', { duration: .25 });
      addEventListener('mousemove', e => { c.style.opacity = 1; mx(e.clientX - c.offsetWidth / 2); my(e.clientY - c.offsetHeight / 2); });
      $$('a,button,.ct-tk,.ct-pbtn,.ct-bub,.ct-tile span').forEach(el => {
        el.addEventListener('mouseenter', () => c.classList.add('big'));
        el.addEventListener('mouseleave', () => c.classList.remove('big'));
      });
      $$('.btn').forEach(b => {
        b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .3 }); });
        b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
      });
    }

    /* headings: a "focus pull" (blurry and big, then sharp), different from every other page */
    $$('main .tag').forEach(t => gsap.from(t, { clipPath: 'inset(0 100% 0 0)', duration: .9, ease: 'power3.inOut', scrollTrigger: { trigger: t, start: 'top 90%' } }));
    $$('main h2').forEach(h => {
      h.innerHTML = h.textContent.trim().split(/\s+/).map(w => `<span class="ctw">${w}</span>`).join(' ');
      gsap.from($$('.ctw', h), { opacity: 0, filter: 'blur(14px)', scale: 1.3, transformOrigin: '50% 60%', stagger: .08, duration: 1.1, ease: 'power3.out', clearProps: 'filter,transform,opacity', scrollTrigger: { trigger: h, start: 'top 88%' } });
    });

    /* ------------------------------------------------------------------
       1 · HERO - greetings made of dots. They scatter from a cursor or finger,
       tap swaps the language. A postage stamp is slammed on and postmarked.
       ------------------------------------------------------------------ */
    const say = $('#ctSay'), cv = $('#ctCanvas'), cx = cv.getContext('2d');
    const WORDS = ['Hello', 'வணக்கம்', 'Hola', 'Bonjour', 'Namaste', 'Ciao', 'Hallo'];
    const FONT = s => `800 ${s}px "Bricolage Grotesque","Noto Sans Tamil","Nirmala UI","Latha","Tamil Sangam MN",sans-serif`;
    const off = document.createElement('canvas'), ox = off.getContext('2d', { willReadFrequently: true });
    let Cw = 0, Ch = 0, parts = [], wi = -1, lastSwap = 0, heroLive = true, started = false;
    const mouse = { x: -999, y: -999, on: false, press: false };

    const sizeCv = () => {
      const b = say.getBoundingClientRect();
      Cw = Math.max(200, Math.round(b.width)); Ch = Math.max(120, Math.round(b.height));
      const dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = Cw * dpr; cv.height = Ch * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      off.width = Cw; off.height = Ch;
    };
    const sample = (word, count) => {
      ox.clearRect(0, 0, Cw, Ch); ox.textAlign = 'center'; ox.textBaseline = 'middle';
      let fs = Ch * .78; ox.font = FONT(fs);
      const w = ox.measureText(word).width; if (w > Cw * .94) fs *= (Cw * .94) / w;
      ox.font = FONT(fs); ox.fillStyle = '#fff'; ox.fillText(word, Cw / 2, Ch / 2 + fs * .05);
      const d = ox.getImageData(0, 0, Cw, Ch).data; let px = 0;
      for (let i = 3; i < d.length; i += 16) if (d[i] > 128) px++;
      px *= 4; if (px < 40) return [];
      const g = Math.max(3, Math.round(Math.sqrt(px / count))), pts = [];
      for (let y = 0; y < Ch; y += g) for (let x = 0; x < Cw; x += g) if (d[(y * Cw + x) * 4 + 3] > 128) pts.push([x, y]);
      return pts;
    };
    const retarget = keep => {
      const n = Cw < 520 ? 750 : 1300; let pts = [], tries = 0;
      if (!keep) wi = (wi + 1) % WORDS.length;
      while (tries++ < WORDS.length) { pts = sample(WORDS[wi], n); if (pts.length > 30) break; wi = (wi + 1) % WORDS.length; }
      if (!pts.length) return;
      for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
      while (parts.length < n) parts.push({ x: rand(0, Cw), y: Ch + rand(10, 90), vx: 0, vy: 0, tx: 0, ty: 0, s: rand(1.5, 2.7), c: Math.random() < .16 ? 1 : 0 });
      if (parts.length > n) parts.length = n;
      const jit = pts.length < n;
      parts.forEach((p, i) => {
        const q = pts[i % pts.length]; p.tx = q[0] + (jit ? rand(-1.5, 1.5) : 0); p.ty = q[1] + (jit ? rand(-1.5, 1.5) : 0);
        if (!keep) { p.vx += rand(-4, 4); p.vy += rand(-4, 4); }
      });
      lastSwap = performance.now();
    };
    const frame = () => {
      if (!started || !heroLive || document.hidden) return;
      if (!reduce && performance.now() - lastSwap > 3800) retarget(false);
      const rr = Cw < 520 ? 64 : 96, k = mouse.press ? 7 : 4.2;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.vx += (p.tx - p.x) * .05; p.vy += (p.ty - p.y) * .05;
        if (mouse.on) { const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy; if (d2 < rr * rr) { const d = Math.sqrt(d2) || 1, f = 1 - d / rr; p.vx += dx / d * f * k; p.vy += dy / d * f * k; } }
        p.vx *= .85; p.vy *= .85; p.x += p.vx; p.y += p.vy;
      }
      cx.clearRect(0, 0, Cw, Ch);
      cx.fillStyle = '#ffb02e'; for (let i = 0; i < parts.length; i++) { const p = parts[i]; if (!p.c) cx.fillRect(p.x, p.y, p.s, p.s); }
      cx.fillStyle = '#f1ebe0'; for (let i = 0; i < parts.length; i++) { const p = parts[i]; if (p.c) cx.fillRect(p.x, p.y, p.s, p.s); }
    };
    const setMouse = e => { const b = say.getBoundingClientRect(); mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top; mouse.on = true; };
    say.addEventListener('pointermove', setMouse);
    say.addEventListener('pointerdown', e => { mouse.press = true; setMouse(e); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => say.addEventListener(ev, () => { mouse.press = false; mouse.on = false; }));
    say.addEventListener('click', () => { if (started) retarget(false); });
    new IntersectionObserver(([e]) => { heroLive = e.isIntersecting; }).observe(say);
    new ResizeObserver(() => { if (!started) return; sizeCv(); retarget(true); }).observe(say);
    gsap.ticker.add(frame);
    const begin = () => { sizeCv(); retarget(false); started = true; if (reduce) parts.forEach(p => { p.x = p.tx; p.y = p.ty; }); };
    Promise.all([document.fonts ? document.fonts.load('800 100px "Bricolage Grotesque"') : 0, document.fonts ? document.fonts.ready : 0]).catch(() => { }).then(() => gsap.delayedCall(1.3, begin));

    /* copy: each word of the headline is "stamped" down */
    const h1 = $('.ct-h1'); h1.innerHTML = h1.textContent.trim().split(/\s+/).map(w => `<span class="ctw">${w}</span>`).join(' ');
    gsap.timeline({ delay: 1.5, defaults: { ease: 'power3.out' } })
      .from('.ct-crumb', { opacity: 0, x: -20, duration: .7 })
      .from('.ct-h1 .ctw', { opacity: 0, scale: 1.7, y: -30, rotation: () => rand(-8, 8), stagger: .07, duration: .55, ease: 'back.out(2.2)' }, .1)
      .from('.ct-lead, .ct-hero .cta, .ct-hint', { y: 24, opacity: 0, stagger: .12, duration: .8 }, '-=.3');

    /* stamp: slam, thud, then the postmark inks itself in */
    const post = $('#ctPost'), hold = $('#ctHold');
    const strokes = [$('.mk-ring'), $('.mk-ring2'), ...$$('.mk-wave')];
    strokes.forEach(p => { const L = p.getTotalLength ? p.getTotalLength() : 300; gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.set('.mk-txt', { opacity: 0 });
    gsap.timeline({ delay: 1.55 })
      .from(hold, { scale: 2.6, rotation: -16, y: -170, opacity: 0, duration: .6, ease: 'power4.in' })
      .to(post, { keyframes: [{ y: 7, duration: .07 }, { y: -3, duration: .08 }, { y: 0, duration: .1 }] })
      .fromTo('.ct-thud', { scale: .5, opacity: .8 }, { scale: 2.2, opacity: 0, duration: .8, ease: 'power2.out' }, '<')
      .to(strokes.slice(0, 2), { strokeDashoffset: 0, duration: .7, stagger: .12, ease: 'power2.out' }, '-=.05')
      .to('.mk-txt', { opacity: 1, duration: .4 }, '-=.3')
      .to(strokes.slice(2), { strokeDashoffset: 0, duration: .5, stagger: .08, ease: 'power2.out' }, '-=.3');
    if (fine) {
      const ry = gsap.quickTo(hold, 'rotationY', { duration: .8, ease: 'power3.out' }), rx = gsap.quickTo(hold, 'rotationX', { duration: .8, ease: 'power3.out' });
      $('#ctHero').addEventListener('mousemove', e => { ry((e.clientX / innerWidth - .5) * 18); rx(-(e.clientY / innerHeight - .5) * 14); });
    }

    /* ------------------------------------------------------------------
       2 · TICKETS - printed out of a slot. Tear the stub: it flaps off, the address is copied.
       ------------------------------------------------------------------ */
    gsap.fromTo('.ct-slotbar i', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: '.ct-slotbar', start: 'top 88%' } });
    $$('.ct-tk').forEach((tk, i) => {
      const wrap = tk.parentElement; wrap.classList.add('printing');
      gsap.from(tk, { yPercent: -108, rotation: i % 2 ? 2.5 : -2.5, duration: 1.1, delay: i * .15, ease: 'back.out(1.25)', scrollTrigger: { trigger: '.ct-tix-grid', start: 'top 82%' }, onComplete: () => wrap.classList.remove('printing') });
      const stub = $('.ct-stub', tk), ok = $('.ct-tk-ok', tk); let busy = false;
      stub.addEventListener('click', () => {
        if (busy) return; busy = true; copyText(tk.dataset.copy);
        gsap.timeline({ onComplete: () => { busy = false; } })
          .set(stub, { transformOrigin: '0% 100%' })
          .to(stub, { rotation: 26, duration: .28, ease: 'power2.in' })
          .to(stub, { x: 70, y: 240, rotation: 72, opacity: 0, duration: .7, ease: 'power1.in' })
          .to(ok, { autoAlpha: 1, duration: .35 }, '-=.5')
          .to(ok, { autoAlpha: 0, duration: .4 }, '+=1.7')
          .set(stub, { x: 0, y: 0, rotation: 0 })
          .fromTo(stub, { opacity: 0, scale: .85 }, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(2)' }, '-=.3');
      });
    });

    /* ------------------------------------------------------------------
       3 · FORM - 4 steps. A paper plane flies along a dotted route, the photo changes with a
       diagonal light-leak wipe, and on send the plane loops out of the card.
       ------------------------------------------------------------------ */
    const form = $('#ctFormEl'), steps = $$('.ct-step', form), track = $('.ct-track', form), plane = $('.ct-plane', form), fly = $('.ct-fly', form);
    const stepNo = $('#ctStepNo'), back = $('#ctBack'), next = $('#ctNext'), photos = $$('#ctPhoto img'), cap = $('#ctCap'), done = $('#ctDone');
    const range = $('#ctRange'), bval = $('#ctBVal'), msg = $('#ctMsg'), ringF = $('#ctRingFill'), cnt = $('.ct-cnt');
    const CAPS = ['Step 1 · Say who you are', 'Step 2 · Pick what you need', 'Step 3 · Budget and timing', 'Step 4 · Tell us the story'];
    const BUDGETS = ['Under ₹50k', '₹50k – ₹1L', '₹1L – ₹2.5L', '₹2.5L – ₹5L', '₹5L and above'];
    let step = 0, busy = false, zi = 5, curPhoto = 0;

    const swapPhoto = n => {
      if (n === curPhoto) return; const img = photos[n]; img.style.zIndex = ++zi;
      gsap.fromTo(img, { '--m': -30 }, { '--m': 130, duration: 1.1, ease: 'power2.inOut', onComplete: () => photos.forEach((p, i) => { if (i !== n) gsap.set(p, { '--m': -30 }); }) });
      curPhoto = n;
    };
    const sum = () => {
      const s = $$('input[name="svc"]:checked', form).map(i => i.value), t = $('input[name="timing"]:checked', form);
      $('#ctSum').innerHTML = `<b>${s.join(', ') || 'Open brief'}</b> · ${BUDGETS[+range.value]} · ${t ? t.value : 'Flexible'}`;
    };
    const ui = n => {
      stepNo.textContent = `Step ${n + 1} of 4`; cap.textContent = CAPS[n];
      $$('.ct-dot', form).forEach((d, i) => d.classList.toggle('on', i <= n));
      gsap.to(track, { '--p': n / 3, duration: .9, ease: 'power2.inOut' });
      gsap.fromTo(plane, { rotation: -26 }, { rotation: 0, duration: .9, ease: 'power2.out' });
      back.style.visibility = n ? 'visible' : 'hidden';
      $('span', next).textContent = n === 3 ? 'Send message' : 'Next';
      $('i', next).className = n === 3 ? 'fa-solid fa-paper-plane' : 'fa-solid fa-arrow-right';
      swapPhoto(n); if (n === 3) sum();
    };
    const go = n => {
      if (busy || n === step) return; busy = true;
      const from = steps[step], to = steps[n], dir = n > step ? 1 : -1; step = n; ui(n);
      gsap.to(from, { x: -40 * dir, opacity: 0, duration: .28, ease: 'power2.in', onComplete: () => {
        from.classList.remove('on'); gsap.set(from, { clearProps: 'all' }); to.classList.add('on');
        gsap.fromTo(to, { clipPath: dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', x: 20 * dir, opacity: 0 }, { clipPath: 'inset(0 0 0 0%)', x: 0, opacity: 1, duration: .6, ease: 'power3.out', clearProps: 'clipPath,x,opacity', onComplete: () => { busy = false; const f = $('input:not([type=checkbox]):not([type=radio]),textarea', to); if (f && fine) f.focus({ preventScroll: true }); } });
      } });
    };
    const bad = fld => { fld.classList.add('bad'); gsap.fromTo(fld, { x: -9 }, { x: 0, duration: .6, ease: 'elastic.out(1,.3)' }); };
    const validate = s => {
      let ok = true;
      if (s === 0) {
        const n = $('#ctName'), e = $('#ctEmail');
        if (n.value.trim().length < 2) { bad(n.closest('.ct-fld')); ok = false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.value.trim())) { bad(e.closest('.ct-fld')); ok = false; }
      }
      if (s === 1 && !$$('input[name="svc"]:checked', form).length) { $('.ct-tiles-err').classList.add('show'); gsap.fromTo('.ct-tiles', { x: -9 }, { x: 0, duration: .6, ease: 'elastic.out(1,.3)' }); ok = false; }
      if (s === 3 && msg.value.trim().length < 10) { bad(msg.closest('.ct-fld')); ok = false; }
      return ok;
    };
    $$('.ct-fld input,.ct-fld textarea', form).forEach(i => i.addEventListener('input', () => i.closest('.ct-fld').classList.remove('bad')));
    $$('input[name="svc"]', form).forEach(i => i.addEventListener('change', () => $('.ct-tiles-err').classList.remove('show')));
    range.addEventListener('input', () => {
      range.style.setProperty('--fill', (range.value / 4 * 100) + '%'); bval.textContent = BUDGETS[+range.value];
      gsap.fromTo(bval, { scale: 1.12, transformOrigin: '0 50%' }, { scale: 1, duration: .45, ease: 'back.out(3)' });
    });
    msg.addEventListener('input', () => { const r = Math.min(1, msg.value.length / 400); ringF.style.strokeDashoffset = 88 * (1 - r); cnt.classList.toggle('hot', r > .9); });
    back.addEventListener('click', () => go(step - 1));
    next.addEventListener('click', () => { if (busy) return; if (step < 3) { if (validate(step)) go(step + 1); } else submit(); });
    form.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'range') { e.preventDefault(); next.click(); } });
    form.addEventListener('submit', e => e.preventDefault());

    const showDone = () => {
      $('#ctDoneH').textContent = `Thanks, ${$('#ctName').value.trim().split(/\s+/)[0] || 'friend'}! We have it.`;
      done.hidden = false;
      gsap.from(done, { opacity: 0, duration: .4 });
      gsap.from('.ct-seal', { scale: 2.6, rotation: -35, opacity: 0, duration: .5, ease: 'power4.in', delay: .15 });
      gsap.from('.ct-done > :not(.ct-seal)', { y: 20, opacity: 0, stagger: .1, duration: .6, delay: .55 });
    };
    const submit = async () => {
      if (!validate(3) || busy) return; busy = true; next.disabled = true; $('#ctFail').classList.remove('show');
      const endpoint = form.dataset.endpoint; let sent = true;
      if (endpoint) { try { const r = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } }); sent = r.ok; } catch (e) { sent = false; } }
      if (!sent) { $('#ctFail').classList.add('show'); next.disabled = false; busy = false; return; }
      try { /* hand the enquiry to the dashboards' shared inbox */
        const qk = 'stackly_contact_queue', q = JSON.parse(localStorage.getItem(qk) || '[]'), svc = $$('input[name="svc"]:checked', form).map(i => i.value), tm = $('input[name="timing"]:checked', form);
        q.push({ id: 'c' + Date.now().toString(36), to: 'admin', toName: 'Stackly Studio', from: $('#ctName').value.trim(), fromEmail: $('#ctEmail').value.trim().toLowerCase(), subject: 'New enquiry: ' + (svc.join(', ') || 'Project'), body: msg.value.trim(), ts: Date.now(), read: false, starred: false, meta: { services: svc, budget: BUDGETS[+range.value], timing: tm ? tm.value : '', company: $('#ctCompany').value.trim() } });
        localStorage.setItem(qk, JSON.stringify(q));
      } catch (e) { /* storage unavailable */ }
      const fb = form.getBoundingClientRect(), pb = plane.getBoundingClientRect();
      gsap.set(fly, { x: pb.left - fb.left, y: pb.top - fb.top, opacity: 1, rotation: 0, scale: 1 });
      gsap.timeline({ onComplete: () => { showDone(); setTimeout(() => { location.href = '404.html'; }, 1800); } })
        .to('.ct-steps,.ct-nav,.ct-stepno,.ct-track', { opacity: 0, duration: .5 }, .15)
        .set(plane, { opacity: 0 }, 0)
        .to(fly, { keyframes: [
          { x: fb.width * .5, y: fb.height * .12, rotation: -32, duration: .6, ease: 'power1.inOut' },
          { x: fb.width * .86, y: fb.height * .55, rotation: 70, duration: .55, ease: 'power1.inOut' },
          { x: fb.width + 90, y: -70, rotation: -25, scale: .5, duration: .7, ease: 'power2.in' }
        ] }, 0);
    };
    $('#ctAgain').addEventListener('click', () => {
      form.reset(); range.style.setProperty('--fill', '50%'); bval.textContent = BUDGETS[2]; ringF.style.strokeDashoffset = 88; cnt.classList.remove('hot');
      done.hidden = true; gsap.set(['.ct-steps', '.ct-nav', '.ct-stepno', '.ct-track', plane, fly], { clearProps: 'all' });
      steps.forEach((s, i) => s.classList.toggle('on', i === 0)); step = 0; busy = false; next.disabled = false; ui(0);
    });


    /* coming back (or browser Back) always shows a fresh, empty form on step 1 */
    const resetForm = () => {
      form.reset();
      range.style.setProperty('--fill', '50%'); bval.textContent = BUDGETS[2];
      ringF.style.strokeDashoffset = 88; cnt.classList.remove('hot');
      $$('.ct-fld', form).forEach(f => f.classList.remove('bad'));
      $('.ct-tiles-err').classList.remove('show'); $('#ctFail').classList.remove('show');
      done.hidden = true;
      gsap.killTweensOf([fly, plane, '.ct-steps', '.ct-nav', '.ct-stepno', '.ct-track']);
      gsap.set(['.ct-steps', '.ct-nav', '.ct-stepno', '.ct-track', plane, fly], { clearProps: 'all' });
      steps.forEach((s, i) => { s.classList.toggle('on', i === 0); gsap.set(s, { clearProps: 'all' }); });
      step = 0; busy = false; next.disabled = false; ui(0);
    };
    addEventListener('pageshow', resetForm);

    gsap.from('.ct-form', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.ct-form', start: 'top 88%' } });
    gsap.from('.ct-photo', { clipPath: 'inset(0 0 100% 0)', duration: 1.3, ease: 'power4.out', scrollTrigger: { trigger: '.ct-photo', start: 'top 88%' } });

    /* ------------------------------------------------------------------
       4 · BOARD - a split-flap departures board. Every tile flips through the alphabet to its letter.
       ------------------------------------------------------------------ */
    const SEQ = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-', SL = SEQ.length;
    const mkTile = () => {
      const el = document.createElement('span'); el.className = 'ct-t';
      el.innerHTML = '<b class="u"><i> </i></b><b class="d"><i> </i></b><b class="fu"><i> </i></b><b class="fd"><i> </i></b>';
      const [u, d, fu, fd] = $$('b i', el); return { el, u, d, fu, fd, cur: 0, tgt: 0, wait: 0, to: 0 };
    };
    const setNow = (t, idx) => { t.cur = idx; const c = SEQ[idx]; t.u.textContent = t.d.textContent = t.fu.textContent = t.fd.textContent = c; t.el.classList.remove('go'); };
    const flipOnce = t => {
      const old = SEQ[t.cur]; t.cur = (t.cur + 1) % SL; const nw = SEQ[t.cur];
      t.fu.textContent = old; t.fd.textContent = nw; t.u.textContent = nw;
      t.el.classList.remove('go'); void t.el.offsetWidth; t.el.classList.add('go');
      clearTimeout(t.to); t.to = setTimeout(() => { t.d.textContent = nw; }, 125);
    };
    const rows = $$('.ct-brow').map(el => {
      const data = { when: el.dataset.when || '', what: el.dataset.what || '', cycle: el.dataset.cycle ? el.dataset.cycle.split('|') : null };
      el.innerHTML = '<i class="ct-led"></i><div class="ct-trow ct-when"></div><div class="ct-trow ct-what"></div>';
      const wt = [], tt = [];
      for (let i = 0; i < 6; i++) { const t = mkTile(); $('.ct-when', el).append(t.el); wt.push(t); }
      for (let i = 0; i < 15; i++) { const t = mkTile(); $('.ct-what', el).append(t.el); tt.push(t); }
      return { el, wt, tt, ci: 0, ...data };
    });
    const setText = (tiles, str, mode, base) => {
      const s = str.toUpperCase().padEnd(tiles.length, ' ').slice(0, tiles.length);
      tiles.forEach((t, i) => {
        let idx = SEQ.indexOf(s[i]); if (idx < 0) idx = 0; t.tgt = idx;
        if (mode === 'scramble') { setNow(t, (idx - 3 - ((Math.random() * 9) | 0) + SL * 2) % SL); t.wait = base + Math.floor(i * .4); }
        else if (mode === 'flip') t.wait = Math.floor(i * .3);
        else setNow(t, idx);
      });
    };
    const setRow = (r, mode, base) => { setText(r.wt, r.when, mode, base); setText(r.tt, r.cycle ? r.cycle[r.ci] : r.what, mode, base); };
    let bTimer = 0, bTicks = 0, boardInit = false;
    const bTick = () => {
      bTicks++;
      rows.forEach(r => {
        let busyRow = false;
        [...r.wt, ...r.tt].forEach(t => { if (t.wait > 0) { t.wait--; busyRow = true; } else if (t.cur !== t.tgt) { flipOnce(t); busyRow = true; } });
        r.el.classList.toggle('busy', busyRow);
      });
      if (bTicks % 40 === 0) { const r = rows.find(x => x.cycle); r.ci = (r.ci + 1) % r.cycle.length; setText(r.tt, r.cycle[r.ci], 'flip', 0); }
    };
    if (reduce) rows.forEach(r => setRow(r, 'now', 0));
    ScrollTrigger.create({ trigger: '#ctBoardEl', start: 'top 85%', end: 'bottom top', onToggle: s => {
      if (s.isActive && !boardInit) { boardInit = true; if (!reduce) rows.forEach((r, i) => setRow(r, 'scramble', i * 4)); }
      clearInterval(bTimer); if (s.isActive && !reduce) bTimer = setInterval(bTick, 120);
    } });
    $('#ctReplay').addEventListener('click', () => { if (!reduce) rows.forEach((r, i) => setRow(r, 'scramble', i * 4)); });
    gsap.from('.ct-board-img', { clipPath: 'inset(0 0 0 100%)', duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: '.ct-board-img', start: 'top 88%' } });
    gsap.from('.ct-board', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.ct-board', start: 'top 92%' } });

    /* ------------------------------------------------------------------
       5 · ORBIT - faces circle a hub. Tap one: the hub rings, ripples, then connects.
       ------------------------------------------------------------------ */
    const stage = $('#ctStage'), pbs = $$('.ct-pbtn'), hub = $('#ctHub'), hubImg = $('#ctHubImg'), card = $('#ctCard'), stat = $('#ctSt'), wave = $('#ctWave');
    let holdT = 0, callT = 0;
    const fillCard = b => {
      const first = b.dataset.name.split(' ')[0];
      $('.ct-c-name', card).textContent = b.dataset.name; $('.ct-c-role', card).textContent = b.dataset.role; $('.ct-c-hi', card).textContent = b.dataset.hi;
      $('.ct-c-best', card).textContent = b.dataset.best; $('.ct-c-reply', card).textContent = b.dataset.reply;
      const m = $('.ct-c-mail', card); m.href = '404.html'; $('span', m).textContent = 'Email ' + first;
      return first;
    };
    const pick = (b, call) => {
      clearTimeout(holdT); clearTimeout(callT);
      pbs.forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-pressed', String(x === b)); x.classList.remove('calling'); });
      hubImg.src = $('img', b).src; hubImg.alt = b.dataset.name; hub.classList.add('has'); hub.classList.remove('ring');
      const first = fillCard(b);
      gsap.fromTo(['.ct-c-name', '.ct-c-role', '.ct-c-hi', '.ct-facts', '.ct-c-mail'].map(s => $(s, card)), { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .5, ease: 'power3.out', overwrite: true });
      const linked = `<i class="ct-live"></i> Connected · replies in about ${b.dataset.reply}`;
      if (call === 'init') { stat.innerHTML = '<i class="ct-live"></i> Tap another face to start a call'; wave.classList.remove('talk'); return; }
      if (reduce) { stat.innerHTML = linked; return; }
      stage.classList.add('hold'); b.classList.add('calling'); hub.classList.add('ring'); wave.classList.remove('talk');
      stat.innerHTML = `<i class="ct-live"></i> Calling ${first}…`;
      callT = setTimeout(() => {
        hub.classList.remove('ring'); b.classList.remove('calling'); stat.innerHTML = linked; wave.classList.add('talk');
        callT = setTimeout(() => wave.classList.remove('talk'), 2800);
      }, 1700);
      holdT = setTimeout(() => stage.classList.remove('hold'), 9000);
    };
    pbs.forEach(b => b.addEventListener('click', () => pick(b, 'call')));
    pick(pbs[0], 'init');
    gsap.from('.ct-ring', { opacity: 0, duration: 1.2, stagger: .2, scrollTrigger: { trigger: stage, start: 'top 80%' } });
    gsap.from('.ct-hubpos', { scale: 0, duration: 1, ease: 'elastic.out(1,.55)', scrollTrigger: { trigger: stage, start: 'top 80%' } });
    gsap.from('.ct-pbtn, .ct-chipo', { scale: 0, duration: .9, stagger: .1, delay: .3, ease: 'back.out(2)', scrollTrigger: { trigger: stage, start: 'top 80%' } });
    gsap.from('.ct-card', { x: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.ct-card', start: 'top 88%' } });

    /* ------------------------------------------------------------------
       6 · VISIT - the real sky over Salem (IST). Time-lapses from midnight to "now" when it
       scrolls in; the slider lets you scrub the whole day. The map unfolds like paper.
       ------------------------------------------------------------------ */
    const sky = $('#ctSky'), sun = $('#ctSun'), moon = $('#ctMoon'), stars = $('#ctStars'), tEl = $('#ctTime'), stEl = $('#ctState'), scrub = $('#ctScrub'), scrubOut = $('#ctScrubOut'), liveBtn = $('#ctLive');
    for (let i = 0; i < 46; i++) { const s = document.createElement('i'), z = rand(1, 2.8); s.style.cssText = `left:${rand(0, 100).toFixed(1)}%;top:${rand(0, 100).toFixed(1)}%;width:${z.toFixed(1)}px;height:${z.toFixed(1)}px;animation-delay:${rand(-3, 0).toFixed(1)}s;animation-duration:${rand(2, 4.5).toFixed(1)}s`; stars.append(s); }
    const KEYS = [[0, '#0c0716', '#1f1233'], [5, '#0c0716', '#261640'], [6.2, '#3d2260', '#ff9a4d'], [8, '#8a72e6', '#ffd29a'], [12, '#7a63d9', '#ffe3b0'], [16.5, '#8a6fe0', '#ffd9a0'], [18.3, '#4d2b6e', '#ff7a45'], [19.6, '#1b1030', '#4a2556'], [21, '#0c0716', '#1f1233'], [24, '#0c0716', '#1f1233']];
    const skyAt = t => { let i = KEYS.findIndex(k => k[0] > t); if (i < 1) i = KEYS.length - 1; const a = KEYS[i - 1], b = KEYS[i], p = (t - a[0]) / (b[0] - a[0]); return [gsap.utils.interpolate(a[1], b[1], p), gsap.utils.interpolate(a[2], b[2], p)]; };
    const nightAt = t => t < 5.2 || t > 20.5 ? 1 : t < 6.6 ? 1 - (t - 5.2) / 1.4 : t > 18.6 ? (t - 18.6) / 1.9 : 0;
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const HOURS = { 0: null, 1: [600, 1110], 2: [600, 1110], 3: [600, 1110], 4: [600, 1110], 5: [600, 1110], 6: [600, 840] };
    const f12 = (m, s) => { m = Math.floor(m) % 1440; const h = Math.floor(m / 60), mm = m % 60; return `${((h + 11) % 12) + 1}:${pad2(mm)}${s === undefined ? '' : ':' + pad2(s)} ${h >= 12 ? 'PM' : 'AM'}`; };
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, weekday: 'short' });
    const ist = () => { const p = {}; fmt.formatToParts(new Date()).forEach(x => { p[x.type] = x.value; }); return { d: Math.max(0, DAYS.indexOf(p.weekday)), m: (+p.hour % 24) * 60 + (+p.minute), s: +p.second }; };
    const statusFor = (d, m) => {
      const h = HOURS[d]; if (h && m >= h[0] && m < h[1]) return { open: true, txt: `Open now · closes ${f12(h[1])}` };
      for (let k = 0; k < 8; k++) { const dd = (d + k) % 7, hh = HOURS[dd]; if (!hh || (k === 0 && m >= hh[0])) continue; return { open: false, txt: `Closed · opens ${k === 0 ? 'today' : k === 1 ? 'tomorrow' : DAYS[dd]} at ${f12(hh[0])}` }; }
      return { open: false, txt: 'Closed' };
    };
    let live = true, lapse = true, today = ist().d, selDay = null;
    const FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const paint = (min, sec) => {
      const t = min / 60, [a, b] = skyAt(t);
      sky.style.setProperty('--st', a); sky.style.setProperty('--sb', b); sky.style.setProperty('--night', nightAt(t).toFixed(3));
      if (t >= 5.5 && t <= 18.5) { const p = (t - 5.5) / 13; sun.style.left = (p * 100) + '%'; sun.style.top = (88 - Math.sin(p * Math.PI) * 74) + '%'; sun.style.opacity = 1; } else sun.style.opacity = 0;
      const mp = ((t - 18 + 24) % 24) / 12; if (mp <= 1) { moon.style.left = (mp * 100) + '%'; moon.style.top = (88 - Math.sin(mp * Math.PI) * 70) + '%'; moon.style.opacity = 1; } else moon.style.opacity = 0;
      tEl.textContent = f12(min, sec); scrubOut.textContent = f12(min);
      scrub.value = Math.floor(min); scrub.style.setProperty('--fill', (Math.min(min, 1439) / 1439 * 100) + '%');
      const other = selDay !== null && selDay !== today, mi = Math.floor(min); let s;
      if (other) { const h = HOURS[selDay]; s = h ? { open: mi >= h[0] && mi < h[1], txt: `${FULL[selDay]} · ${f12(h[0])} – ${f12(h[1])}` } : { open: false, txt: `${FULL[selDay]} · closed all day` }; } else s = statusFor(today, mi);
      stEl.classList.toggle('open', s.open); stEl.innerHTML = `<i></i> ${(live && !lapse && !other) ? '' : 'Preview · '}${s.txt}`;
    };
    $$('#ctHours li').forEach(li => li.classList.toggle('today', +li.dataset.d === today));
    paint(0);
    /* every day in the list is clickable: shows that day's hours and slides the sky to its opening time */
    const markSel = () => $$('#ctHours li').forEach(li => { const on = +li.dataset.d === (selDay === null ? today : selDay); li.classList.toggle('sel', on); li.setAttribute('aria-pressed', String(on)); });
    $$('#ctHours li').forEach(li => {
      li.tabIndex = 0; li.setAttribute('role', 'button');
      const pickDay = () => {
        const d = +li.dataset.d; if (d === today) { liveBtn.click(); return; }
        selDay = d; live = false; lapse = true; markSel();
        const h = HOURS[d], o = { v: +scrub.value };
        gsap.to(o, { v: h ? h[0] + 90 : o.v, duration: h && !reduce ? 1.1 : .01, ease: 'power2.inOut', onUpdate: () => paint(o.v), onComplete: () => { lapse = false; paint(o.v); } });
      };
      li.addEventListener('click', pickDay);
      li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickDay(); } });
    });
    markSel();
    const liveTick = () => { if (!live || lapse) return; const n = ist(); today = n.d; paint(n.m + n.s / 60, n.s); };
    setInterval(liveTick, 1000);
    ScrollTrigger.create({ trigger: sky, start: 'top 82%', once: true, onEnter: () => {
      const n = ist(), o = { v: 0 }; today = n.d;
      gsap.to(o, { v: n.m, duration: reduce ? .01 : 3.2, ease: 'power2.inOut', onUpdate: () => paint(o.v), onComplete: () => { lapse = false; live = true; liveTick(); } });
    } });
    scrub.addEventListener('input', () => { live = false; lapse = false; paint(+scrub.value); });
    liveBtn.addEventListener('click', () => {
      const n = ist(), o = { v: +scrub.value }; lapse = true; live = true; today = n.d; selDay = null; markSel();
      gsap.to(o, { v: n.m + n.s / 60, duration: 1.3, ease: 'power2.inOut', onUpdate: () => paint(o.v), onComplete: () => { lapse = false; liveTick(); } });
    });
    /* map: paper panels unfold, then the pin drops */
    const mapEl = $('#ctMap'), folds = $$('.ct-fold');
    gsap.timeline({ scrollTrigger: { trigger: mapEl, start: 'top 78%', once: true } })
      .to(folds, { transformPerspective: 900, transformOrigin: '0% 50%', rotationY: -98, duration: 1.1, stagger: .18, ease: 'power3.inOut', onComplete: () => folds.forEach(f => f.remove()) })
      .from('.ct-pin', { y: -220, opacity: 0, duration: .8, ease: 'bounce.out' }, '-=.2')
      .from('.ct-addr, .ct-pola', { y: 30, opacity: 0, stagger: .15, duration: .7, ease: 'power3.out' }, '-=.5');
    $('#ctTap').addEventListener('click', () => mapEl.classList.add('live'));
    $('#ctLock').addEventListener('click', () => mapEl.classList.remove('live'));
    gsap.from('.ct-sky', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.ct-sky', start: 'top 90%' } });

    /* ------------------------------------------------------------------
       7 · BUBBLES - tiny physics engine (gravity, bounce, collisions, drag and throw).
       ------------------------------------------------------------------ */
    const pit = $('#ctPit'), B = $$('.ct-bub', pit).map(el => ({ el, r0: +el.dataset.r, r: 0, x: 0, y: 0, vx: 0, vy: 0, drag: false, moved: false, tx: 0, ty: 0 }));
    let PW = 0, PH = 0, simOn = false, spawned = false, vis = false, calm = 0;
    const G = 1500, REST = .55;
    const render = () => B.forEach(o => { o.el.style.transform = `translate3d(${(o.x - o.r).toFixed(1)}px,${(o.y - o.r).toFixed(1)}px,0)`; });
    const measure = () => {
      const b = pit.getBoundingClientRect(); PW = b.width; PH = b.height; const K = clamp(.72, 1.15, PW / 900);
      B.forEach(o => { o.r = o.r0 * K; o.el.style.width = o.el.style.height = (o.r * 2) + 'px'; o.el.style.setProperty('--d', (o.r * 2) + 'px'); if (spawned) { o.x = clamp(o.r, PW - o.r, o.x); o.y = Math.min(o.y, PH - o.r); } });
    };
    measure(); B.forEach(o => { o.el.style.opacity = 0; });
    const wake = () => { simOn = true; calm = 0; };
    const stepSim = dt => {
      B.forEach(o => {
        if (o.drag) { o.vx = clamp(-2600, 2600, (o.tx - o.x) * 22); o.vy = clamp(-2600, 2600, (o.ty - o.y) * 22); } else o.vy += G * dt;
        o.x += o.vx * dt; o.y += o.vy * dt; o.vx *= .9993; o.vy *= .9996;
        if (o.x < o.r) { o.x = o.r; o.vx = Math.abs(o.vx) * REST; } else if (o.x > PW - o.r) { o.x = PW - o.r; o.vx = -Math.abs(o.vx) * REST; }
        if (o.y > PH - o.r) { o.y = PH - o.r; o.vy = -Math.abs(o.vy) * REST; o.vx *= .985; if (Math.abs(o.vy) < 60) o.vy = 0; }
      });
      for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) {
        const a = B[i], b = B[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy, rs = a.r + b.r;
        if (d2 >= rs * rs || d2 < .0001) continue;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ov = rs - d;
        const ia = a.drag ? 0 : 1 / (a.r * a.r), ib = b.drag ? 0 : 1 / (b.r * b.r), is = ia + ib; if (!is) continue;
        a.x -= nx * ov * ia / is; a.y -= ny * ov * ia / is; b.x += nx * ov * ib / is; b.y += ny * ov * ib / is;
        const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (vn < 0) { const e = vn < -80 ? REST : 0, jm = -(1 + e) * vn / is; a.vx -= jm * ia * nx; a.vy -= jm * ia * ny; b.vx += jm * ib * nx; b.vy += jm * ib * ny; }
      }
    };
    const spawn = () => {
      if (spawned) return; spawned = true; measure();
      B.forEach((o, i) => { o.x = rand(o.r, Math.max(o.r + 1, PW - o.r)); o.y = -o.r - i * PH * .16; o.vx = rand(40, 140) * (Math.random() < .5 ? -1 : 1); o.vy = 0; o.el.style.opacity = 1; });
      if (reduce) { for (let i = 0; i < 700; i++) stepSim(1 / 180); render(); simOn = false; } else { render(); wake(); }
    };
    ScrollTrigger.create({ trigger: pit, start: 'top 78%', once: true, onEnter: spawn });
    ScrollTrigger.create({ trigger: pit, start: 'top bottom', end: 'bottom top', onToggle: s => { vis = s.isActive; } });
    gsap.ticker.add((time, dtms) => {
      if (!simOn || !vis) return;
      const dt = Math.min(dtms, 40) / 1000;
      for (let k = 0; k < 3; k++) stepSim(dt / 3);
      render();
      const e = B.reduce((s, o) => s + Math.abs(o.vx) + Math.abs(o.vy), 0) / B.length;
      calm = (!B.some(o => o.drag) && e < 12) ? calm + 1 : 0; if (calm > 90) simOn = false;
    });
    addEventListener('resize', () => { measure(); if (spawned) { render(); wake(); } });
    B.forEach(o => {
      const el = o.el; let sx = 0, sy = 0;
      const toLocal = e => { const b = pit.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
      el.addEventListener('pointerdown', e => { if (!spawned) return; e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (_) { } o.drag = true; o.moved = false; sx = e.clientX; sy = e.clientY; [o.tx, o.ty] = toLocal(e); el.classList.add('grab'); el.style.zIndex = 10; wake(); });
      el.addEventListener('pointermove', e => { if (!o.drag) return; const p = toLocal(e); o.tx = clamp(o.r, PW - o.r, p[0]); o.ty = clamp(-PH, PH - o.r, p[1]); if (Math.hypot(e.clientX - sx, e.clientY - sy) > 8) o.moved = true; });
      const end = () => { if (!o.drag) return; o.drag = false; el.classList.remove('grab'); el.style.zIndex = ''; wake(); };
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
      el.addEventListener('click', e => { if (o.moved || el.getAttribute('href') === '#') e.preventDefault(); });
      el.addEventListener('dragstart', e => e.preventDefault());
    });
    $('#ctShake').addEventListener('click', () => { if (!spawned) spawn(); B.forEach(o => { o.vx += rand(-1000, 1000); o.vy -= rand(600, 1300); }); wake(); });

    /* footer (same as the other pages) */
    const bw = $('.bigword'); bw.innerHTML = [...bw.textContent].map(c => `<span>${c}</span>`).join('');
    gsap.from('.bigword span', { yPercent: 110, stagger: .06, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top 85%', end: 'bottom bottom', scrub: true } });
    gsap.from('.f-top > div', { y: 40, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.f-top', start: 'top 90%' } });
    newsletter();

    addEventListener('load', () => ScrollTrigger.refresh());
  }
})();