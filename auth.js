/* Stackly — login, signup and dashboards (GSAP)
   Front-end demo: accounts, sessions and emails live in the browser (localStorage).
   Replace the store helpers with real API calls when you add a backend. */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const fine = matchMedia('(hover:hover) and (min-width:901px)').matches;
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);
  const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  /* Set to true only if you want sample/automatic emails for a demo. false = only real mail (contact form, compose, replies). */
  const DEMO_MAIL = false;
  /* true = every account gets a few fixed example emails the first time its dashboard opens (nothing arrives automatically). */
  const SAMPLE_MAIL = true;
  const HOME = { admin: 'admin-dashboard.html', user: 'user-dashboard.html' };

  /* images: hide any that fail; logo falls back to a wordmark */
  $$('img[src^="https://"]').forEach(el => { const h = () => { el.style.opacity = 0; }; if (el.complete && !el.naturalWidth) h(); else el.addEventListener('error', h, { once: true }); });
  $$('img[src="Assest/stackly-logo.webp"]').forEach(i => {
    const fb = () => { const s = document.createElement('span'); s.className = 'wordmark'; s.textContent = 'STACKLY'; i.replaceWith(s); };
    if (i.complete && !i.naturalWidth) fb(); else i.addEventListener('error', fb, { once: true });
  });
  if (window.gsap && reduce) gsap.globalTimeline.timeScale(100);

  /* ---------------- storage + accounts ---------------- */
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage full or blocked */ } }
  };
  const sha = async s => {
    try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('stackly:' + s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
    catch (e) { return 'p:' + btoa(unescape(encodeURIComponent(s))); }
  };
  const ensureUsers = async () => {
    let u = store.get('stackly_users', null);
    if (!Array.isArray(u) || !u.length) {
      u = [
        { name: 'Maya Rao', email: 'admin@stackly.studio', role: 'admin', pw: await sha('Admin@123'), joined: Date.now() - 86400000 * 210, seed: true },
        { name: 'Nina Verma', email: 'user@stackly.studio', role: 'user', pw: await sha('User@123'), joined: Date.now() - 86400000 * 64, seed: true },
        { name: 'Tom Becker', email: 'tom@orbit.app', role: 'user', pw: await sha('Orbit@123'), joined: Date.now() - 86400000 * 31, seed: true },
        { name: 'Priya Nair', email: 'priya@atlas.studio', role: 'user', pw: await sha('Atlas@123'), joined: Date.now() - 86400000 * 12, seed: true }
      ];
      store.set('stackly_users', u);
    }
    return u;
  };
  const getSession = () => { try { return JSON.parse(sessionStorage.getItem('stackly_session') || localStorage.getItem('stackly_session') || 'null'); } catch (e) { return null; } };
  const setSession = (u, remember) => {
    const s = JSON.stringify({ name: u.name, email: u.email, role: u.role });
    try { sessionStorage.removeItem('stackly_session'); localStorage.removeItem('stackly_session'); (remember ? localStorage : sessionStorage).setItem('stackly_session', s); } catch (e) { /* storage blocked */ }
  };
  const clearSession = () => { try { sessionStorage.removeItem('stackly_session'); localStorage.removeItem('stackly_session'); } catch (e) { /* ignore */ } };
  const initials = n => (String(n).trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('') || '?').toUpperCase();
  const hue = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };

  /* ====================================================================
     LOGIN + SIGNUP
     ==================================================================== */
  const isLogin = body.classList.contains('page-login'), isSignup = body.classList.contains('page-signup');
  if (isLogin || isSignup) initAuth();

  function initAuth() {
    const g = window.gsap;
    /* entrance: curtain opens, then everything arrives in sequence */
    if (g) {
      const tl = g.timeline({ defaults: { ease: 'power3.out' } });
      tl.to('.au-curtain i:first-child', { xPercent: -101, duration: 1, ease: 'power4.inOut' }, .1)
        .to('.au-curtain i:last-child', { xPercent: 101, duration: 1, ease: 'power4.inOut' }, .1)
        .set('.au-curtain', { display: 'none' })
        .from('.au-backbtn', { x: -30, opacity: 0, duration: .8 }, '-=.5')
        .from('.au-eyebrow', { y: 20, opacity: 0, duration: .7 }, '-=.6')
        .from('.au-h1 .w>span', { yPercent: 115, duration: 1, stagger: .08 }, '-=.5')
        .from('.au-h1 em', { opacity: 0, y: 14, duration: .8 }, '-=.6')
        .from('.au-lead', { y: 20, opacity: 0, duration: .7 }, '-=.6')
        .from('.au-arch', { clipPath: 'inset(100% 0 0 0)', duration: 1.2, ease: 'power4.out' }, '-=.9')
        .from('.au-fc, .au-badge', { scale: 0, rotation: -12, stagger: .15, duration: .8, ease: 'back.out(1.8)' }, '-=.6')
        .from('.au-card', { y: 60, opacity: 0, scale: .96, duration: 1 }, 0.9)
        .from('.au-card h2, .au-card .au-sub', { y: 18, opacity: 0, stagger: .08, duration: .7 }, '-=.6')
        .from('.au-form > *', { y: 22, opacity: 0, stagger: .07, duration: .7, clearProps: 'transform,opacity' }, '-=.5');
    }
    if (g && fine) {
      const st = $('.au-stage');
      if (st) $('.au-wrap').addEventListener('mousemove', e => {
        const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
        g.to('.au-arch img', { x: x * -24, y: y * -18, duration: .9, ease: 'power3.out', overwrite: 'auto' });
        g.to('.au-fc', { x: i => x * (i + 1) * 12, y: i => y * (i + 1) * 9, duration: 1, ease: 'power3.out', overwrite: 'auto' });
      });
    }
    /* light follows the pointer inside the card */
    const card = $('.au-card');
    card.addEventListener('pointermove', e => { const r = card.getBoundingClientRect(); card.style.setProperty('--mx', (e.clientX - r.left) + 'px'); card.style.setProperty('--my', (e.clientY - r.top) + 'px'); });

    /* show / hide password */
    $$('.au-eye').forEach(b => b.addEventListener('click', () => {
      const inp = $('input', b.parentElement), show = inp.type === 'password';
      inp.type = show ? 'text' : 'password'; $('i', b).className = show ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
      b.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); b.setAttribute('aria-pressed', String(show));
    }));
    /* ripple on the main button */
    const btn = $('.au-btn');
    btn.addEventListener('pointerdown', e => {
      const r = btn.getBoundingClientRect(), d = Math.max(r.width, r.height) * 1.6, s = document.createElement('i'); s.className = 'au-rip';
      s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`; btn.append(s);
      if (g) g.to(s, { scale: 1, opacity: 0, duration: .7, ease: 'power2.out', onComplete: () => s.remove() }); else s.remove();
    });

    const form = $('.au-form'), msg = $('#auMsg'), roleHint = $('#roleHint');
    const ROLE_TXT = { admin: 'Admins manage clients, projects and the shared inbox.', user: 'Users track their project and message the studio.' };
    const showMsg = (txt, kind) => {
      msg.className = 'au-msg show ' + kind; msg.innerHTML = `<i class="fa-solid ${kind === 'ok' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i><span></span>`; $('span', msg).textContent = txt;
      if (g) g.fromTo(msg, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: 'power3.out' });
      if (g && kind === 'err') g.fromTo(card, { x: -10 }, { x: 0, duration: .7, ease: 'elastic.out(1,.25)' });
    };
    const clearMsg = () => { msg.className = 'au-msg'; };
    const bad = (inp, txt) => { const f = inp.closest('.au-fld'); f.classList.add('bad'); if (txt) $('.au-err', f).textContent = txt; };
    $$('.au-fld input', form).forEach(i => i.addEventListener('input', () => { i.closest('.au-fld').classList.remove('bad'); clearMsg(); }));
    const setLoad = on => { btn.classList.toggle('load', on); btn.disabled = on; };
    const roleVal = () => $('input[name="role"]:checked', form).value;
    const syncHint = () => { if (!roleHint) return; const t = ROLE_TXT[roleVal()]; if (g) g.fromTo(roleHint, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .4 }); roleHint.textContent = t; };
    $$('input[name="role"]', form).forEach(r => r.addEventListener('change', () => { syncHint(); clearMsg(); }));
    if (roleHint) roleHint.textContent = ROLE_TXT[roleVal()];

    const celebrate = async (text, go) => {
      const box = $('.au-done'); $('p', box).textContent = text; box.hidden = false;
      const c = $('circle', box), p = $('path', box), L1 = c.getTotalLength(), L2 = p.getTotalLength();
      if (g) {
        g.set(c, { strokeDasharray: L1, strokeDashoffset: L1 }); g.set(p, { strokeDasharray: L2, strokeDashoffset: L2 });
        g.from(box, { opacity: 0, duration: .4 });
        g.timeline().to(c, { strokeDashoffset: 0, duration: .7, ease: 'power2.inOut' }).to(p, { strokeDashoffset: 0, duration: .45, ease: 'power2.out' }, '-=.15');
        g.from('.au-done h3, .au-done p', { y: 16, opacity: 0, stagger: .1, duration: .6, delay: .5 });
      }
      await delay(reduce ? 200 : 1700); location.href = go;
    };

    if (isLogin) {
      const params = new URLSearchParams(location.search), em = $('#lgEmail'), pw = $('#lgPass');
      if (params.get('registered')) {
        showMsg('Account created. Log in with your new details.', 'ok');
        const e = params.get('email'); if (e) { em.value = e; setTimeout(() => pw.focus({ preventScroll: true }), 1500); }
        try { history.replaceState(null, '', location.pathname); } catch (_) { /* ignore */ }
      }
      $$('[data-demo]').forEach(b => b.addEventListener('click', () => {
        const d = b.dataset.demo, admin = d === 'admin';
        em.value = admin ? 'admin@stackly.studio' : 'user@stackly.studio'; pw.value = admin ? 'Admin@123' : 'User@123';
        $(admin ? '#roleAdmin' : '#roleUser').checked = true; syncHint(); clearMsg();
        $$('.au-fld', form).forEach(f => f.classList.remove('bad'));
        if (g) g.fromTo('.au-fld', { x: 0, scale: .98 }, { scale: 1, duration: .5, stagger: .06, ease: 'back.out(3)' });
        em.dispatchEvent(new Event('input')); pw.dispatchEvent(new Event('input'));
      }));
      /* Any email + password opens the dashboard of the selected role (no credential check). */
      form.addEventListener('submit', async e => {
        e.preventDefault(); clearMsg(); let ok = true;
        if (!em.value.trim()) { bad(em, 'Enter your email.'); ok = false; }
        if (!pw.value) { bad(pw, 'Enter your password.'); ok = false; }
        if (!ok) { if (g) g.fromTo(card, { x: -10 }, { x: 0, duration: .7, ease: 'elastic.out(1,.25)' }); return; }
        setLoad(true); await delay(reduce ? 50 : 700);
        const email = em.value.trim().toLowerCase(), users = await ensureUsers(), known = users.find(x => x.email === email), r = roleVal();
        const guess = email.split('@')[0].replace(/[._-]+/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase()) || 'Guest';
        const u = { name: known ? known.name : guess, email, role: r };
        setSession(u, $('#lgRemember').checked); setLoad(false);
        celebrate(`Welcome, ${u.name.split(' ')[0]}. Opening your ${r === 'admin' ? 'admin' : 'user'} dashboard…`, HOME[r]);
      });
    }

    if (isSignup) {
      const f = { name: $('#suName'), email: $('#suEmail'), pw: $('#suPass'), pw2: $('#suPass2') }, terms = $('#suTerms'), meter = $('.au-meter'), mt = $('.au-meter-t');
      const score = v => { let s = 0; if (v.length >= 8) s++; if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) s++; return v ? Math.max(1, s) : 0; };
      f.pw.addEventListener('input', () => { const s = score(f.pw.value); meter.dataset.s = s; mt.textContent = ['Use 8+ characters with a number.', 'Weak: add more characters.', 'Fair: add upper case and a number.', 'Good: almost there.', 'Strong password.'][s]; });
      terms.addEventListener('change', () => $('.au-check', form).classList.remove('bad'));
      form.addEventListener('submit', async e => {
        e.preventDefault(); clearMsg(); let ok = true;
        if (f.name.value.trim().length < 2) { bad(f.name, 'Enter your full name.'); ok = false; }
        if (!EMAIL_RE.test(f.email.value.trim())) { bad(f.email, 'Enter a valid email address.'); ok = false; }
        if (!f.pw.value) { bad(f.pw, 'Enter a password.'); ok = false; } /* any password is accepted: no length / letter / number rule */
        if (f.pw2.value !== f.pw.value || !f.pw2.value) { bad(f.pw2, 'Passwords do not match.'); ok = false; }
        if (!terms.checked) { $('.au-check', form).classList.add('bad'); ok = false; }
        if (!ok) { showMsg('Please fix the highlighted fields.', 'err'); return; }
        setLoad(true); await delay(reduce ? 50 : 900);
        const users = await ensureUsers(), email = f.email.value.trim().toLowerCase();
        const dup = users.findIndex(x => x.email === email); if (dup > -1) users.splice(dup, 1); /* an already-used email is allowed: the new details replace the old entry */
        users.push({ name: f.name.value.trim(), email, role: roleVal(), pw: await sha(f.pw.value), joined: Date.now() });
        store.set('stackly_users', users); setLoad(false);
        celebrate('Your account is ready. Taking you to the login page…', 'login.html?registered=1&email=' + encodeURIComponent(email));
      });
    }
    return;
  }

  /* ====================================================================
     DASHBOARDS
     ==================================================================== */
  const role = body.classList.contains('page-admin') ? 'admin' : body.classList.contains('page-user') ? 'user' : null;
  if (!role) return;
  let me = getSession();
  if (!me || me.role !== role) { location.replace('login.html'); return; }
  addEventListener('pageshow', e => { const s = getSession(); if (e.persisted && (!s || s.role !== role)) location.replace('login.html'); });
  ensureUsers().then(() => initDash());

  function initDash() {
    const g = window.gsap, isAdmin = role === 'admin';
    const KEY = { mail: 'stackly_mail', queue: 'stackly_contact_queue', act: 'stackly_act_' + role, ms: 'stackly_ms_' + me.email, proj: 'stackly_projects', prefs: 'stackly_prefs_' + me.email };
    const fmtDate = ts => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const fmtDT = ts => new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const rel = ts => { const m = Math.floor((Date.now() - ts) / 60000); if (m < 1) return 'Just now'; if (m < 60) return m + 'm ago'; const h = Math.floor(m / 60); if (h < 24) return h + 'h ago'; if (h < 48) return 'Yesterday'; return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); };
    const uid = () => 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    /* ---------- identity ---------- */
    const paintMe = () => {
      $$('.js-name').forEach(e => { e.textContent = me.name; });
      $$('.js-first').forEach(e => { e.textContent = me.name.split(' ')[0]; });
      $$('.js-email').forEach(e => { e.textContent = me.email; });
      $$('.js-init').forEach(e => { e.textContent = initials(me.name); });
    };
    paintMe();
    const hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    $('#dbGreet').textContent = `${greet}, ${me.name.split(' ')[0]}`;

    /* ---------- toasts ---------- */
    const toast = (txt, icon = 'fa-circle-check', onClick) => {
      const t = document.createElement('div'); t.className = 'db-toast' + (onClick ? ' mail' : ''); t.setAttribute('role', 'status');
      t.innerHTML = `<i class="fa-solid ${icon}"></i><span></span>`; $('span', t).textContent = txt; $('#toasts').append(t);
      if (onClick) t.addEventListener('click', () => { onClick(); t.remove(); });
      if (g) { g.from(t, { x: 60, opacity: 0, duration: .5, ease: 'back.out(1.8)' }); g.to(t, { opacity: 0, y: 10, duration: .4, delay: 3.6, onComplete: () => t.remove() }); } else setTimeout(() => t.remove(), 4000);
    };

    /* ---------- activity feed ---------- */
    const seedAct = () => isAdmin
      ? [{ t: 'Atlas Studio approved the guidelines draft', i: 'fa-circle-check', ts: Date.now() - 36e5 * 2 }, { t: 'Northwind Bank moved to the review stage', i: 'fa-eye', ts: Date.now() - 36e5 * 7 }, { t: 'New client account created: Tom Becker', i: 'fa-user-plus', ts: Date.now() - 36e5 * 26 }, { t: 'Invoice #1042 paid by Lumen Coffee', i: 'fa-indian-rupee-sign', ts: Date.now() - 36e5 * 50 }]
      : [{ t: 'Workshop notes were shared with you', i: 'fa-file-lines', ts: Date.now() - 36e5 * 5 }, { t: 'Audience research was marked complete', i: 'fa-circle-check', ts: Date.now() - 36e5 * 30 }, { t: 'Your project kickoff call was held', i: 'fa-video', ts: Date.now() - 36e5 * 90 }];
    let acts = store.get(KEY.act, null); if (!acts) { acts = seedAct(); store.set(KEY.act, acts); }
    const renderActs = fresh => {
      const ul = $('#actList'); if (!ul) return;
      ul.innerHTML = acts.slice(0, 6).map((a, i) => `<li class="${fresh && i === 0 ? 'fresh' : ''}"><span class="fi"><i class="fa-solid ${esc(a.i)}"></i></span><p>${esc(a.t)}</p><time>${rel(a.ts)}</time></li>`).join('');
    };
    const pushAct = (t, i = 'fa-bolt') => { acts.unshift({ t, i, ts: Date.now() }); acts = acts.slice(0, 30); store.set(KEY.act, acts); renderActs(true); };

    /* ---------- mail store ---------- */
    const ago = h => Date.now() - 36e5 * h;
    const seedMail = () => [
      { id: 'a1', to: 'admin', toName: 'Stackly Studio', from: 'Priya Nair', fromEmail: 'priya@atlas.studio', subject: 'Rebrand scope for Atlas Studio', body: 'Hi team,\nThanks for the workshop yesterday. We would like to extend the scope to include signage and a short brand film.\nCould you share an updated proposal and timeline this week?\nPriya', ts: ago(1.2), read: false, starred: true, meta: { services: ['Brand identity', 'Motion'], budget: '₹5L and above', timing: 'In 1–2 months' } },
      { id: 'a2', to: 'admin', toName: 'Stackly Studio', from: 'Tom Becker', fromEmail: 'tom@orbit.app', subject: 'Landing page feedback', body: 'The new hero feels great. Two small notes: the pricing section needs more contrast on mobile, and can we try a shorter headline?\nThanks!\nTom', ts: ago(3.5), read: false, starred: false },
      { id: 'a3', to: 'admin', toName: 'Stackly Studio', from: 'Karan Shah', fromEmail: 'karan@pulsefit.in', subject: 'Launch week social calendar', body: 'Sharing the draft calendar for launch week. Please check the Thursday reel slot, it clashes with the studio tour.\nKaran', ts: ago(9), read: true, starred: false },
      { id: 'a4', to: 'admin', toName: 'Stackly Studio', from: 'Nina Verma', fromEmail: 'user@stackly.studio', subject: 'Packaging sleeves: final colours', body: 'Hello Maya,\nThe cup sleeves look lovely in warm saffron. We approve the final colours. Can you send print-ready files?\nNina', ts: ago(27), read: true, starred: true },
      { id: 'a5', to: 'admin', toName: 'Stackly Studio', from: 'Rohit Menon', fromEmail: 'rohit@greenleaf.co', subject: 'New enquiry: Website', body: 'We are a small organic grocery brand in Salem and need a fresh website with online ordering. Do you take on projects of this size?\nRohit', ts: ago(52), read: true, starred: false, meta: { services: ['Website'], budget: '₹1L – ₹2.5L', timing: 'As soon as possible' } },
      { id: 'a6', to: 'admin', toName: 'Stackly Studio', from: 'Ayesha Khan', fromEmail: 'ayesha@bloomcafe.in', subject: 'Menu design quote', body: 'Could you quote for a printed menu and table cards for our new cafe? Photos attached in the shared folder.\nAyesha', ts: ago(80), read: true, starred: false }
    ];
    const seedUserMail = () => [
      { id: 'u1', to: 'user@stackly.studio', toName: 'Nina Verma', from: 'Maya Rao', fromEmail: 'maya@stackly.studio', subject: 'Your logo concepts are ready', body: 'Hi Nina,\nThree logo concepts are now in your project folder. Take a look and tell us which direction feels most like Lumen.\nWe can walk through them on a call on Friday.\nMaya', ts: ago(2), read: false, starred: true },
      { id: 'u2', to: 'user@stackly.studio', toName: 'Nina Verma', from: 'Arjun Mehta', fromEmail: 'arjun@stackly.studio', subject: 'Workshop notes and next steps', body: 'Thanks for the great workshop. The notes are attached to your project. Next step is positioning, which we will draft by Wednesday.\nArjun', ts: ago(30), read: true, starred: false },
      { id: 'u3', to: 'user@stackly.studio', toName: 'Nina Verma', from: 'Stackly Billing', fromEmail: 'billing@stackly.studio', subject: 'Invoice #1042 received, thank you', body: 'We have received your payment for milestone 2. A receipt is saved in your account.\nThank you!', ts: ago(70), read: true, starred: false }
    ];
    const welcomeMail = () => ({ id: uid(), to: me.email, toName: me.name, from: 'Maya Rao', fromEmail: 'maya@stackly.studio', subject: 'Welcome to Stackly, ' + me.name.split(' ')[0], body: 'Hi ' + me.name.split(' ')[0] + ',\nYour dashboard is ready. You can follow project progress, tick off milestones and message the team right here.\nSay hello whenever you like.\nMaya', ts: Date.now() - 6e4, read: false, starred: false });
    const sampleUserMail = () => {
      const k = me.email, n = me.name, f = n.split(' ')[0], pid = uid();
      return [
        { id: 'su1' + pid, to: k, toName: n, from: 'Maya Rao', fromEmail: 'maya@stackly.studio', subject: 'Your logo concepts are ready', body: 'Hi ' + f + ',\nThree logo concepts are now in your project folder. Take a look and tell us which direction feels most like your brand.\nWe can walk through them together on a call on Friday.\nMaya', ts: ago(2), read: false, starred: true, sample: true },
        { id: 'su2' + pid, to: k, toName: n, from: 'Arjun Mehta', fromEmail: 'arjun@stackly.studio', subject: 'Workshop notes and next steps', body: 'Hi ' + f + ',\nThanks for the great workshop. The notes are attached to your project. Next up is positioning, which we will draft by Wednesday.\nArjun', ts: ago(30), read: true, starred: false, sample: true },
        { id: 'su3' + pid, to: k, toName: n, from: 'Stackly Billing', fromEmail: 'billing@stackly.studio', subject: 'Invoice #1042 received, thank you', body: 'We have received your payment for milestone 2. A receipt is saved in your account.\nThank you!', ts: ago(70), read: true, starred: false, sample: true },
        { id: 'su4' + pid, to: 'admin', toName: 'Stackly Studio', toEmail: 'hello@stackly.studio', from: n, fromEmail: k, subject: 'Packaging sleeves: colour question', body: 'Hello team,\nCould we try a warmer shade of gold on the cup sleeves? I have attached a reference photo.\nThanks,\n' + f, ts: ago(5), read: true, starred: false, sample: true },
        { id: 'su5' + pid, to: k, toName: n, from: 'Maya Rao', fromEmail: 'maya@stackly.studio', subject: 'Re: Packaging sleeves: colour question', body: 'Hi ' + f + ',\nGreat idea. We will send two warmer gold options by tomorrow so you can compare them on a real sleeve mock-up.\nMaya', ts: ago(4), read: false, starred: false, sample: true, re: 'su4' + pid }
      ];
    };
    let mail = store.get(KEY.mail, null);
    if (!Array.isArray(mail)) { mail = DEMO_MAIL ? [...seedMail(), ...seedUserMail()] : []; store.set(KEY.mail, mail); }
    const saveMail = () => store.set(KEY.mail, mail);
    if (!DEMO_MAIL) { /* remove sample + automatic emails left over from earlier visits */
      const DEMO_IDS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'u1', 'u2', 'u3'];
      const auto = m => DEMO_IDS.includes(m.id) || (m.fromEmail === 'maya@stackly.studio' && /^Welcome to Stackly,/.test(m.subject)) || (m.fromEmail === 'sara@stackly.studio' && m.subject === 'Your launch motion preview') || (m.fromEmail === 'meera@kaveri.in' && /tea brand/.test(m.subject));
      const gone = new Set(mail.filter(auto).map(m => m.id));
      if (gone.size) { mail = mail.filter(m => !gone.has(m.id) && !gone.has(m.re)); saveMail(); }
    }
    const consumeQueue = () => {
      const q = store.get(KEY.queue, []); if (!q.length) return false;
      q.forEach(m => { if (!mail.some(x => x.id === m.id)) mail.push(m); }); store.set(KEY.queue, []); saveMail(); return true;
    };
    consumeQueue();
    if (DEMO_MAIL && !isAdmin && !mail.some(m => m.to === me.email)) { mail.push(welcomeMail()); saveMail(); }
    if (SAMPLE_MAIL) { /* example emails, added once per account (deleting them keeps them deleted) */
      const fk = isAdmin ? 'stackly_sample_admin' : 'stackly_sample_' + me.email;
      if (!store.get(fk, false)) { mail.push(...(isAdmin ? seedMail().map(m => ({ ...m, id: 's' + m.id, sample: true })) : sampleUserMail())); store.set(fk, true); saveMail(); }
    }
    const myKey = isAdmin ? 'admin' : me.email;
    const inboxOf = () => mail.filter(m => m.to === myKey);
    const sentOf = () => mail.filter(m => m.fromEmail === me.email);
    const unread = () => inboxOf().filter(m => !m.read).length;

    /* ---------- counters + badges ---------- */
    const countUp = root => $$('[data-count]', root).forEach(el => {
      const end = +el.dataset.count || 0, dec = +el.dataset.dec || 0, pre = el.dataset.pre || '', suf = el.dataset.suf || '', o = { v: 0 };
      const put = v => { el.textContent = pre + v.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; };
      if (g) g.to(o, { v: end, duration: 1.5, ease: 'power2.out', onUpdate: () => put(o.v) }); else put(end);
    });
    const refreshCounts = pulse => {
      const n = unread();
      $$('.js-unread').forEach(e => { e.textContent = n; e.classList.toggle('zero', !n); });
      const k = $('#kpiUnread'); if (k) { k.dataset.count = n; k.textContent = n; }
      const tab = $('.mail-tab[data-f="inbox"] b'); if (tab) { tab.textContent = n; tab.classList.toggle('zero', !n); }
      if (pulse && g) $$('.db-badge, .db-ib .dot').forEach(b => { b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); });
      renderMini(); renderBell();
    };

    /* ---------- shell: panels, drawer, menus ---------- */
    const panels = $$('.db-panel'), links = $$('.db-link[data-panel]'), ind = $('.db-ind'), title = $('#dbTitle');
    const TITLES = { overview: 'Overview', emails: 'Emails', users: 'Users', projects: isAdmin ? 'Projects' : 'My project', settings: 'Settings' };
    const side = $('#dbSide'), scrim = $('#dbScrim'), burger = $('#dbBurger');
    const setDrawer = open => { side.classList.toggle('open', open); scrim.classList.toggle('show', open); burger.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)); if (innerWidth <= 1024) body.style.overflow = open ? 'hidden' : ''; };
    burger.addEventListener('click', () => setDrawer(!side.classList.contains('open')));
    scrim.addEventListener('click', () => setDrawer(false));
    matchMedia('(min-width:1025px)').addEventListener('change', e => { if (e.matches) { setDrawer(false); body.style.overflow = ''; } moveInd(); });
    const moveInd = () => { const a = $('.db-link.on'); if (!a) return; ind.style.height = a.offsetHeight + 'px'; ind.style.transform = `translateY(${a.offsetTop}px)`; };
    addEventListener('resize', moveInd);
    const hooks = {};
    let cur = null;
    const enter = (p, id) => {
      p.classList.add('on'); moveInd();
      if (g) g.fromTo(p, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out', clearProps: 'transform,opacity' });
      if (hooks[id]) hooks[id]();
    };
    const show = (id, replace) => {
      if (!$('#p-' + id)) id = 'overview';
      if (id === cur) { setDrawer(false); return; }
      const prev = cur && $('#p-' + cur), next = $('#p-' + id);
      links.forEach(l => { const on = l.dataset.panel === id; l.classList.toggle('on', on); l.setAttribute('aria-current', on ? 'page' : 'false'); });
      moveInd(); title.textContent = TITLES[id] || 'Overview'; cur = id;
      try { history.replaceState(null, '', '#' + id); } catch (_) { /* ignore */ }
      closeMenus(); setDrawer(false); if (!replace) scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      if (prev && g) g.to(prev, { opacity: 0, y: 14, duration: .22, onComplete: () => { prev.classList.remove('on'); g.set(prev, { clearProps: 'all' }); enter(next, id); } });
      else { if (prev) prev.classList.remove('on'); enter(next, id); }
    };
    links.forEach(l => l.addEventListener('click', () => show(l.dataset.panel)));
    $$('[data-go]').forEach(b => b.addEventListener('click', () => show(b.dataset.go)));
    addEventListener('hashchange', () => show(location.hash.slice(1) || 'overview'));

    /* dropdowns */
    const dds = { bell: $('#ddBell'), me: $('#ddMe') };
    const closeMenus = () => { Object.values(dds).forEach(d => { d.hidden = true; }); $('#btnBell').setAttribute('aria-expanded', 'false'); $('#btnMe').setAttribute('aria-expanded', 'false'); };
    const toggleMenu = (key, btn) => { const open = dds[key].hidden; closeMenus(); dds[key].hidden = !open; btn.setAttribute('aria-expanded', String(open)); if (open && g) g.from(dds[key], { y: -10, opacity: 0, scale: .97, duration: .35, ease: 'power3.out', transformOrigin: 'top right' }); };
    $('#btnBell').addEventListener('click', e => { e.stopPropagation(); toggleMenu('bell', e.currentTarget); });
    $('#btnMe').addEventListener('click', e => { e.stopPropagation(); toggleMenu('me', e.currentTarget); });
    document.addEventListener('click', e => { if (!e.target.closest('.db-pos')) closeMenus(); });
    const logout = () => { clearSession(); location.href = 'login.html'; };
    $$('.js-logout').forEach(b => b.addEventListener('click', logout));
    const renderBell = () => {
      const box = $('#bellList'); if (!box) return;
      const items = inboxOf().filter(m => !m.read).sort((a, b) => b.ts - a.ts).slice(0, 4);
      box.innerHTML = items.length ? items.map(m => `<button class="row" type="button" data-open="${esc(m.id)}"><span class="mail-av" style="--h:${hue(m.from)}">${esc(initials(m.from))}</span><span class="txt"><b>${esc(m.from)}</b><small>${esc(m.subject)}</small></span></button>`).join('') : '<p class="none">You are all caught up.</p>';
      $$('[data-open]', box).forEach(b => b.addEventListener('click', () => { closeMenus(); goMail(b.dataset.open); }));
    };
    $$('.db-card').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }, { passive: true }));

    /* ---------- overview: chart ---------- */
    const CH = isAdmin ? {
      '7d': { l: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], v: [4, 7, 5, 9, 12, 8, 11], u: 'enquiries' },
      '30d': { l: ['W1', 'W2', 'W3', 'W4', 'W5'], v: [22, 31, 27, 38, 44], u: 'enquiries' },
      '12m': { l: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'], v: [48, 52, 61, 58, 72, 80, 77, 91, 96, 104, 118, 126], u: 'enquiries' }
    } : {
      '7d': { l: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], v: [1, 2, 2, 4, 5, 5, 6], u: 'tasks done' },
      '30d': { l: ['W1', 'W2', 'W3', 'W4'], v: [2, 5, 9, 14], u: 'tasks done' },
      '12m': { l: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'], v: [3, 8, 15, 24, 33, 42], u: 'tasks done' }
    };
    const smooth = p => p.reduce((s, q, i, a) => {
      if (!i) return `M${q[0].toFixed(1)},${q[1].toFixed(1)}`;
      const p0 = a[i - 2] || a[i - 1], p1 = a[i - 1], p3 = a[i + 1] || q;
      const c1 = [p1[0] + (q[0] - p0[0]) / 6, p1[1] + (q[1] - p0[1]) / 6], c2 = [q[0] - (p3[0] - p1[0]) / 6, q[1] - (p3[1] - p1[1]) / 6];
      return s + ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${q[0].toFixed(1)},${q[1].toFixed(1)}`;
    }, '');
    const svg = $('#chart'), tip = $('#chartTip');
    const drawChart = key => {
      if (!svg) return; const d = CH[key], W = 600, H = 240, P = { l: 34, r: 14, t: 18, b: 30 }, n = d.v.length, max = Math.ceil(Math.max(...d.v) * 1.15);
      const X = i => P.l + i * (W - P.l - P.r) / (n - 1), Y = v => H - P.b - v / max * (H - P.t - P.b), pts = d.v.map((v, i) => [X(i), Y(v)]), line = smooth(pts);
      let h = '<defs><linearGradient id="chg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb02e" stop-opacity=".35"/><stop offset="1" stop-color="#ffb02e" stop-opacity="0"/></linearGradient></defs>';
      for (let k = 0; k <= 4; k++) { const v = max * k / 4, y = Y(v); h += `<line class="gl" x1="${P.l}" x2="${W - P.r}" y1="${y}" y2="${y}"/><text x="${P.l - 8}" y="${y + 4}" text-anchor="end">${Math.round(v)}</text>`; }
      d.l.forEach((t, i) => { h += `<text x="${X(i)}" y="${H - 8}" text-anchor="middle">${esc(t)}</text>`; });
      h += `<path class="ch-area" d="${line} L${X(n - 1)},${H - P.b} L${X(0)},${H - P.b}Z" fill="url(#chg)"/><path class="ch-line" d="${line}"/><line class="ch-hl" y1="${P.t}" y2="${H - P.b}"/>`;
      pts.forEach(q => { h += `<circle class="ch-dot" cx="${q[0]}" cy="${q[1]}" r="5"/>`; });
      svg.innerHTML = h;
      const ln = $('.ch-line', svg), L = ln.getTotalLength ? ln.getTotalLength() : 800;
      if (g) {
        g.set(ln, { strokeDasharray: L, strokeDashoffset: L }); g.to(ln, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' });
        g.from($('.ch-area', svg), { opacity: 0, duration: 1.2, delay: .4 }); g.from($$('.ch-dot', svg), { scale: 0, transformOrigin: '50% 50%', stagger: .08, duration: .5, delay: .5, ease: 'back.out(3)' });
      }
      const hl = $('.ch-hl', svg), dots = $$('.ch-dot', svg);
      const move = e => {
        const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, i = clampN(Math.round((x - P.l) / ((W - P.l - P.r) / (n - 1))), 0, n - 1);
        hl.setAttribute('x1', X(i)); hl.setAttribute('x2', X(i)); hl.style.opacity = 1; dots.forEach((c, k) => c.setAttribute('r', k === i ? 8 : 5));
        tip.textContent = `${d.l[i]}: ${d.v[i]} ${d.u}`; tip.style.left = (X(i) / W * 100) + '%'; tip.style.top = (Y(d.v[i]) / H * 100) + '%'; tip.style.opacity = 1;
      };
      const out = () => { hl.style.opacity = 0; tip.style.opacity = 0; dots.forEach(c => c.setAttribute('r', 5)); };
      svg.onpointermove = move; svg.onpointerdown = move; svg.onpointerleave = out;
    };
    $$('.db-seg button[data-range]').forEach(b => b.addEventListener('click', () => { $$('.db-seg button[data-range]').forEach(x => x.classList.toggle('on', x === b)); drawChart(b.dataset.range); }));

    /* ---------- overview: latest emails ---------- */
    const mailItemMini = m => `<button class="row" type="button" data-open="${esc(m.id)}" style="border-radius:14px"><span class="mail-av" style="--h:${hue(m.from)}">${esc(initials(m.from))}</span><span class="txt"><b>${esc(m.from)}${m.read ? '' : ' •'}</b><small>${esc(m.subject)}</small></span><time class="mail-time">${rel(m.ts)}</time></button>`;
    const renderMini = () => {
      const box = $('#miniMail'); if (!box) return;
      const items = inboxOf().sort((a, b) => b.ts - a.ts).slice(0, 4);
      box.innerHTML = items.length ? items.map(mailItemMini).join('') : '<div class="db-empty"><i class="fa-regular fa-envelope-open"></i><span>No emails yet.</span></div>';
      $$('[data-open]', box).forEach(b => b.addEventListener('click', () => goMail(b.dataset.open)));
    };

    /* ---------- milestones (user) + projects (admin) ---------- */
    const MS_DEFAULT = [['Kickoff call', 1], ['Brand workshop', 1], ['Audience research', 1], ['Positioning approved', 0], ['Logo concepts review', 0], ['Colour and type system', 0], ['Guidelines sign-off', 0], ['Launch assets delivered', 0]];
    let ms = store.get(KEY.ms, null); if (!ms) { ms = MS_DEFAULT.map(([t, d]) => ({ t, d: !!d })); store.set(KEY.ms, ms); }
    const msPct = () => Math.round(ms.filter(x => x.d).length / ms.length * 100);
    const paintProgress = (animate = true) => {
      const p = msPct(); $$('.js-pct').forEach(e => { e.textContent = p + '%'; });
      const k = $('#kpiPct'); if (k) { k.dataset.count = p; k.textContent = p + '%'; }
      $$('.js-bar').forEach(b => { if (g && animate) g.to(b, { width: p + '%', duration: 1.1, ease: 'power3.out' }); else b.style.width = p + '%'; });
      const ring = $('#ringFill'); if (ring) { const off = 289 * (1 - p / 100); if (g && animate) g.to(ring, { strokeDashoffset: off, duration: 1.4, ease: 'power3.out' }); else ring.style.strokeDashoffset = off; }
      const stage = clampN(Math.floor(p / 25), 0, 3), st = $('.db-steps');
      if (st) { st.style.setProperty('--sp', clampN(p / 100 * 4 - .5, 0, 3) / 3 * 1); $$('.db-st', st).forEach((s, i) => { s.classList.toggle('done', p >= (i + 1) * 25 || (i < stage)); s.classList.toggle('now', i === stage && p < 100); }); }
      const next = ms.find(x => !x.d); const nx = $('#kpiNext'); if (nx) nx.textContent = next ? next.t : 'All done';
    };
    const renderTasks = () => {
      const ul = $('#taskList'); if (!ul) return;
      ul.innerHTML = ms.map((x, i) => `<li class="db-task"><label><input type="checkbox" data-i="${i}" ${x.d ? 'checked' : ''}><i class="fa-solid fa-check bx"></i><span>${esc(x.t)}</span></label></li>`).join('');
      $$('input', ul).forEach(c => c.addEventListener('change', () => {
        const x = ms[+c.dataset.i]; x.d = c.checked; store.set(KEY.ms, ms); paintProgress();
        pushAct(`${c.checked ? 'Completed' : 'Reopened'}: ${x.t}`, c.checked ? 'fa-circle-check' : 'fa-rotate-left'); toast(`${msPct()}% complete`, 'fa-bars-progress');
      }));
    };
    const PROJ_SEED = [
      { id: 'p1', n: 'Lumen Coffee', c: 'Identity · Packaging', o: 'Maya Rao', p: 92, due: '12 Nov', s: 'good' }, { id: 'p2', n: 'Northwind Bank', c: 'Web · Strategy', o: 'Arjun Mehta', p: 64, due: '28 Nov', s: 'warn' },
      { id: 'p3', n: 'Atlas Studio', c: 'Rebrand', o: 'Sara Khan', p: 78, due: '05 Dec', s: 'good' }, { id: 'p4', n: 'Pulse Fitness', c: 'Campaign · Motion', o: 'Sara Khan', p: 41, due: '19 Dec', s: 'risk' },
      { id: 'p5', n: 'Orbit SaaS', c: 'Web · Identity', o: 'Dev Patel', p: 23, due: '14 Jan', s: 'good' }
    ];
    let projs = store.get(KEY.proj, null); if (!projs) { projs = PROJ_SEED; store.set(KEY.proj, projs); }
    const SLBL = { good: 'On track', warn: 'In review', risk: 'At risk' };
    const renderProjs = animate => {
      const box = $('#projGrid'); if (!box) return;
      box.innerHTML = projs.map(p => `<article class="db-card db-proj" data-id="${esc(p.id)}"><div class="top"><div><h3>${esc(p.n)}</h3><small style="color:var(--mute)">${esc(p.c)}</small></div><span class="db-chip ${esc(p.s)}">${SLBL[p.s] || 'On track'}</span></div><div class="meta"><span><i class="fa-regular fa-user"></i> ${esc(p.o)}</span><span><i class="fa-regular fa-calendar"></i> Due ${esc(p.due)}</span></div><div class="db-bar"><i data-w="${p.p}"></i></div><div class="db-pr"><b>${p.p}% complete</b><button type="button" class="btn btn-ghost btn-sm" data-bump="${esc(p.id)}" ${p.p >= 100 ? 'disabled' : ''}><i class="fa-solid fa-plus"></i> 10%</button></div></article>`).join('');
      $$('.db-bar i', box).forEach(b => { if (g && animate) g.to(b, { width: b.dataset.w + '%', duration: 1.2, ease: 'power3.out', delay: .15 }); else b.style.width = b.dataset.w + '%'; });
      $$('[data-bump]', box).forEach(b => b.addEventListener('click', () => {
        const p = projs.find(x => x.id === b.dataset.bump); p.p = Math.min(100, p.p + 10); if (p.p >= 100) p.s = 'good'; store.set(KEY.proj, projs);
        pushAct(`${p.n} progress updated to ${p.p}%`, 'fa-bars-progress'); toast(`${p.n}: ${p.p}% complete`, 'fa-bars-progress'); renderProjs(false);
        const card = $(`[data-id="${p.id}"]`, box); if (g && card) g.from(card, { scale: .97, duration: .5, ease: 'back.out(3)' });
        const kp = $('#kpiProj'); if (kp) kp.textContent = projs.filter(x => x.p < 100).length;
      }));
    };

    /* ---------- users (admin) ---------- */
    let uf = 'all', uq = '';
    const renderUsers = animate => {
      const body_ = $('#userRows'); if (!body_) return;
      const all = store.get('stackly_users', []), list = all.filter(u => (uf === 'all' || u.role === uf) && (!uq || (u.name + ' ' + u.email).toLowerCase().includes(uq))).sort((a, b) => b.joined - a.joined);
      $('#userCount').textContent = `${list.length} of ${all.length} accounts`;
      body_.innerHTML = list.length ? list.map(u => `<tr data-e="${esc(u.email)}"><td class="who-td"><div class="db-who"><span class="db-av" style="background:hsl(${hue(u.name)} 50% 40%);color:#fff">${esc(initials(u.name))}</span><b>${esc(u.name)}</b></div></td><td data-l="Email">${esc(u.email)}</td><td data-l="Role"><span class="db-chip ${u.role === 'admin' ? 'admin' : ''}">${u.role === 'admin' ? 'Admin' : 'User'}</span></td><td data-l="Joined">${fmtDate(u.joined)}</td><td data-l="Remove"><button class="db-x" type="button" aria-label="Remove ${esc(u.name)}" data-del="${esc(u.email)}" ${u.email === me.email || u.seed ? 'disabled title="Protected account"' : ''}><i class="fa-solid fa-trash"></i></button></td></tr>`).join('') : '<tr><td colspan="5"><div class="db-empty"><i class="fa-regular fa-face-meh"></i><span>No accounts match.</span></div></td></tr>';
      if (g && animate) g.from($$('#userRows tr'), { opacity: 0, y: 18, stagger: .05, duration: .5, ease: 'power3.out', clearProps: 'all' });
      $$('[data-del]', body_).forEach(b => b.addEventListener('click', () => {
        const email = b.dataset.del, row = b.closest('tr'), done = () => { store.set('stackly_users', store.get('stackly_users', []).filter(u => u.email !== email)); pushAct('Removed account ' + email, 'fa-user-minus'); toast('Account removed', 'fa-user-minus'); renderUsers(false); };
        if (g) g.to(row, { opacity: 0, x: 40, duration: .4, onComplete: done }); else done();
      }));
    };
    $$('.db-seg button[data-uf]').forEach(b => b.addEventListener('click', () => { uf = b.dataset.uf; $$('.db-seg button[data-uf]').forEach(x => x.classList.toggle('on', x === b)); renderUsers(true); }));
    const us = $('#userSearch'); if (us) us.addEventListener('input', () => { uq = us.value.trim().toLowerCase(); renderUsers(false); });

    /* ---------- email centre ---------- */
    const mailEl = $('#mail'), listEl = $('#mailList'), readerEl = $('#mailReader'), searchEl = $('#mailSearch');
    let folder = 'all', mq = '', sel = null;
    const isMine = m => m.to === myKey, mineSent = m => m.fromEmail === me.email;
    const persona = m => folder === 'sent' || mineSent(m) ? { n: 'To: ' + (m.toName || m.to), s: m.toName || m.to } : { n: m.from, s: m.from };
    const itemHTML = (m, i, fresh) => { const p = persona(m); return `<li class="mail-item ${m.read || !isMine(m) ? '' : 'unread'} ${sel === m.id ? 'sel' : ''} ${fresh ? 'fresh' : ''}" data-id="${esc(m.id)}" style="--i:${i}" tabindex="0" role="button" aria-label="Open email: ${esc(m.subject)}"><span class="mail-av" style="--h:${hue(p.s)}">${esc(initials(p.s))}</span><div class="mail-from"><b>${esc(p.n)}</b></div><time class="mail-time">${rel(m.ts)}</time><div class="mail-sub">${esc(m.subject)}</div><div class="mail-pre">${esc(m.body.replace(/\s+/g, ' ').slice(0, 90))}</div><button class="mail-star ${m.starred ? 'on' : ''}" type="button" aria-label="Star email" data-star="${esc(m.id)}"><i class="fa-${m.starred ? 'solid' : 'regular'} fa-star"></i></button></li>`; };
    const visible = () => {
      let items = folder === 'inbox' ? inboxOf() : folder === 'sent' ? sentOf() : folder === 'all' ? [...inboxOf(), ...sentOf()] : [...inboxOf(), ...sentOf()].filter(m => m.starred);
      items = items.filter((m, i, a) => a.findIndex(x => x.id === m.id) === i);
      if (mq) items = items.filter(m => (m.from + ' ' + m.subject + ' ' + m.body).toLowerCase().includes(mq));
      return items.sort((a, b) => b.ts - a.ts);
    };
    const renderList = (stag, freshId) => {
      if (!listEl) return;
      const items = visible();
      listEl.innerHTML = items.length ? items.map((m, i) => itemHTML(m, i, m.id === freshId)).join('') : `<li class="db-empty"><i class="fa-regular fa-envelope-open"></i><span>${mq ? 'No emails match your search.' : folder === 'sent' ? 'You have not sent anything yet.' : folder === 'starred' ? 'Star an email to find it here.' : isAdmin ? 'No emails yet. Enquiries from the contact form and messages from users appear here.' : 'No emails yet. Replies from the studio appear here. Use Compose to write to us.'}</span></li>`;
      if (stag && !reduce) $$('.mail-item', listEl).forEach(e => e.classList.add('stag'));
      $$('.mail-tab', mailEl).forEach(t => t.classList.toggle('on', t.dataset.f === folder));
    };
    const lockScroll = on => { if (innerWidth <= 1180) body.style.overflow = on ? 'hidden' : (side.classList.contains('open') ? 'hidden' : ''); };
    const none = () => { readerEl.innerHTML = '<div class="mail-none"><i class="fa-regular fa-envelope-open"></i><b>Select an email to read it</b><span>Your messages open here.</span></div>'; };
    const bubble = m => `<div class="mail-bub ${mineSent(m) ? 'mine' : ''}">${esc(m.body).replace(/\n/g, '<br>')}<small>${esc(mineSent(m) ? 'You' : m.from)} · ${fmtDT(m.ts)}</small></div>`;
    const renderReader = (m, animate) => {
      const p = persona(m), thread = mail.filter(x => x.re === m.id).sort((a, b) => a.ts - b.ts), meta = m.meta || {};
      const chips = [...(meta.services || []).map(s => `<span class="db-chip admin">${esc(s)}</span>`), meta.budget ? `<span class="db-chip">${esc(meta.budget)}</span>` : '', meta.timing ? `<span class="db-chip">${esc(meta.timing)}</span>` : '', meta.company ? `<span class="db-chip">${esc(meta.company)}</span>` : ''].join('');
      const fromLine = mineSent(m) ? `To ${esc(m.toName || m.to)}` : esc(m.from);
      readerEl.innerHTML = `<div class="mail-rh"><button class="mail-back" type="button" data-act="back"><i class="fa-solid fa-arrow-left"></i> Inbox</button><div class="mail-acts"><button type="button" data-act="reply" aria-label="Reply"><i class="fa-solid fa-reply"></i></button><button type="button" data-act="star" class="${m.starred ? 'on' : ''}" aria-label="Star"><i class="fa-${m.starred ? 'solid' : 'regular'} fa-star"></i></button>${isMine(m) ? '<button type="button" data-act="unread" aria-label="Mark as unread"><i class="fa-regular fa-envelope"></i></button>' : ''}<button type="button" data-act="del" aria-label="Delete"><i class="fa-solid fa-trash"></i></button></div></div>
        <div class="mail-rb"><h3>${esc(m.subject)}</h3><div class="mail-rf"><span class="mail-av" style="--h:${hue(p.s)}">${esc(initials(p.s))}</span><div><b>${fromLine}</b><small>${esc(mineSent(m) ? (m.toEmail || '') : m.fromEmail)} · ${fmtDT(m.ts)}</small></div></div>${chips ? `<div class="mail-meta">${chips}</div>` : ''}<div class="mail-body">${esc(m.body).split(/\n+/).map(l => `<p>${l}</p>`).join('')}</div>${thread.length ? `<div class="mail-thread" id="thread">${thread.map(bubble).join('')}</div>` : '<div class="mail-thread" id="thread" hidden></div>'}</div>
        <form class="mail-reply" id="replyForm"><textarea rows="1" placeholder="Write a reply…" aria-label="Reply" required></textarea><button class="btn" type="submit"><i class="fa-solid fa-paper-plane"></i> Send</button><i class="fa-solid fa-paper-plane mail-fly" aria-hidden="true"></i></form>`;
      if (g && animate) g.from([...$$('.mail-rb > *', readerEl)], { y: 18, opacity: 0, stagger: .07, duration: .5, ease: 'power3.out' });
      $('#replyForm', readerEl).addEventListener('submit', e => { e.preventDefault(); sendReply(m); });
    };
    const openMail = (id, animate = true) => {
      const m = mail.find(x => x.id === id); if (!m) return; sel = id;
      if (isMine(m) && !m.read) { m.read = true; saveMail(); refreshCounts(); }
      $$('.mail-item', listEl).forEach(e => { e.classList.toggle('sel', e.dataset.id === id); if (e.dataset.id === id) e.classList.remove('unread'); });
      renderReader(m, animate); mailEl.classList.add('reading'); lockScroll(true);
    };
    const closeReader = () => { mailEl.classList.remove('reading'); lockScroll(false); };
    const goMail = id => { show('emails'); setTimeout(() => { folder = 'all'; mq = ''; if (searchEl) searchEl.value = ''; renderList(false); openMail(id); }, reduce ? 30 : 450); };
    const delMail = id => {
      const done = () => { mail = mail.filter(x => x.id !== id); saveMail(); if (sel === id) { sel = null; none(); closeReader(); } renderList(false); refreshCounts(); toast('Email deleted', 'fa-trash'); };
      const li = $(`.mail-item[data-id="${id}"]`, listEl);
      if (li && g) g.to(li, { opacity: 0, x: -40, height: 0, paddingBlock: 0, duration: .4, onComplete: done }); else done();
    };
    const sendReply = m => {
      const ta = $('textarea', readerEl), txt = ta.value.trim(); if (!txt) { ta.focus(); return; }
      const toEmail = mineSent(m) ? m.toEmail || m.to : m.fromEmail;
      const msg = { id: uid(), to: isAdmin ? toEmail : 'admin', toName: mineSent(m) ? m.toName : m.from, toEmail, from: me.name, fromEmail: me.email, subject: /^re:/i.test(m.subject) ? m.subject : 'Re: ' + m.subject, body: txt, ts: Date.now(), read: false, starred: false, re: m.id };
      mail.push(msg); saveMail(); ta.value = '';
      const th = $('#thread', readerEl); th.hidden = false; th.insertAdjacentHTML('beforeend', bubble(msg));
      const nb = th.lastElementChild; if (g) { g.from(nb, { y: 26, opacity: 0, scale: .96, duration: .55, ease: 'back.out(1.6)' }); const fly = $('.mail-fly', readerEl), b = $('.btn', readerEl); fly.style.left = b.offsetLeft + 'px'; fly.style.top = b.offsetTop + 'px'; g.fromTo(fly, { x: 0, y: 0, opacity: 1, rotation: 0 }, { x: 160, y: -120, opacity: 0, rotation: -30, duration: .8, ease: 'power2.in' }); g.to(th.parentElement, { scrollTop: th.parentElement.scrollHeight, duration: .5 }); }
      pushAct(`Replied to ${msg.toName || 'a message'}: ${m.subject}`, 'fa-reply'); toast('Reply sent', 'fa-paper-plane'); refreshCounts();
    };
    if (mailEl) {
      none(); renderList(true);
      listEl.addEventListener('click', e => {
        const st = e.target.closest('[data-star]');
        if (st) { e.stopPropagation(); const m = mail.find(x => x.id === st.dataset.star); m.starred = !m.starred; saveMail(); st.classList.toggle('on', m.starred); $('i', st).className = `fa-${m.starred ? 'solid' : 'regular'} fa-star`; st.classList.add('pop'); setTimeout(() => st.classList.remove('pop'), 220); if (folder === 'starred' && !m.starred) renderList(false); if (sel === m.id) renderReader(m, false); return; }
        const li = e.target.closest('.mail-item'); if (li) openMail(li.dataset.id);
      });
      listEl.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('mail-item')) { e.preventDefault(); openMail(e.target.dataset.id); } });
      readerEl.addEventListener('click', e => {
        const b = e.target.closest('[data-act]'); if (!b) return; const m = mail.find(x => x.id === sel); if (!m) return;
        const a = b.dataset.act;
        if (a === 'back') closeReader();
        if (a === 'reply') { const ta = $('textarea', readerEl); ta.focus(); if (g) g.fromTo(ta, { scale: .98 }, { scale: 1, duration: .4, ease: 'back.out(3)' }); }
        if (a === 'star') { m.starred = !m.starred; saveMail(); renderReader(m, false); renderList(false); }
        if (a === 'unread') { m.read = false; saveMail(); sel = null; none(); closeReader(); renderList(false); refreshCounts(); toast('Marked as unread', 'fa-envelope'); }
        if (a === 'del') delMail(m.id);
      });
      $$('.mail-tab[data-f]', mailEl).forEach(t => t.addEventListener('click', () => { folder = t.dataset.f; sel = null; none(); closeReader(); renderList(true); }));
      searchEl.addEventListener('input', () => { mq = searchEl.value.trim().toLowerCase(); renderList(false); });
      $('#markAll').addEventListener('click', () => { const n = unread(); inboxOf().forEach(m => { m.read = true; }); saveMail(); renderList(false); refreshCounts(); toast(n ? `${n} email${n > 1 ? 's' : ''} marked as read` : 'Nothing to mark', 'fa-check-double'); });
      addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#composeModal').hidden) closeCompose(); else if (mailEl.classList.contains('reading') && innerWidth <= 1180) closeReader(); closeMenus(); setDrawer(false); } });
    }
    /* compose */
    const cm = $('#composeModal'), cf = $('#composeForm'); let lastFocus = null;
    const openCompose = (prefill = {}) => {
      lastFocus = document.activeElement; cm.hidden = false; $('#cmErr').className = 'au-msg';
      if (isAdmin) $('#cmTo').value = prefill.to || ''; $('#cmSub').value = prefill.sub || ''; $('#cmBody').value = '';
      if (g) { g.from('.db-dialog', { y: 50, opacity: 0, scale: .95, duration: .5, ease: 'power3.out' }); g.from(cm, { opacity: 0, duration: .3 }); }
      setTimeout(() => $(isAdmin ? '#cmTo' : '#cmSub').focus(), 60);
    };
    const closeCompose = () => { cm.hidden = true; if (lastFocus) lastFocus.focus(); };
    $$('.js-compose').forEach(b => b.addEventListener('click', () => openCompose()));
    $$('[data-close]', cm).forEach(b => b.addEventListener('click', closeCompose));
    cm.addEventListener('click', e => { if (e.target === cm) closeCompose(); });
    cf.addEventListener('submit', e => {
      e.preventDefault(); const to = isAdmin ? $('#cmTo').value.trim().toLowerCase() : 'admin', sub = $('#cmSub').value.trim(), txt = $('#cmBody').value.trim(), er = $('#cmErr');
      const fail = t => { er.className = 'au-msg err show'; er.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i><span></span>'; $('span', er).textContent = t; };
      if (isAdmin && !EMAIL_RE.test(to)) return fail('Enter a valid recipient email.');
      if (sub.length < 3) return fail('Add a short subject.'); if (txt.length < 5) return fail('Write a message first.');
      const users = store.get('stackly_users', []), rcp = users.find(u => u.email === to);
      mail.push({ id: uid(), to, toName: isAdmin ? (rcp ? rcp.name : to) : 'Stackly Studio', toEmail: to, from: me.name, fromEmail: me.email, subject: sub, body: txt, ts: Date.now(), read: false, starred: false }); saveMail();
      closeCompose(); pushAct(`Sent “${sub}”`, 'fa-paper-plane'); toast(isAdmin ? 'Email sent' : 'Message sent to the studio', 'fa-paper-plane'); if (mailEl) { folder = 'sent'; renderList(true); } refreshCounts();
    });

    /* simulated arrivals + live updates from other tabs (contact form) */
    const arrive = m => { mail.push(m); saveMail(); refreshCounts(true); toast(`New email from ${m.from}`, 'fa-envelope', () => goMail(m.id)); if (mailEl && cur === 'emails' && (folder === 'inbox' || folder === 'all') && !mq) renderList(false, m.id); };
    if (DEMO_MAIL && !sessionStorage.getItem('stackly_sim_' + role) && !reduce) {
      sessionStorage.setItem('stackly_sim_' + role, '1');
      setTimeout(() => arrive(isAdmin ? { id: uid(), to: 'admin', toName: 'Stackly Studio', from: 'Meera Joshi', fromEmail: 'meera@kaveri.in', subject: 'New enquiry: Packaging for a tea brand', body: 'We are launching a premium tea range from the Yercaud hills and need packaging and a small identity. Can we book a call this week?\nMeera', ts: Date.now(), read: false, starred: false, meta: { services: ['Packaging', 'Brand identity'], budget: '₹2.5L – ₹5L', timing: 'In 1–2 months' } } : { id: uid(), to: me.email, toName: me.name, from: 'Sara Khan', fromEmail: 'sara@stackly.studio', subject: 'Your launch motion preview', body: 'Hi ' + me.name.split(' ')[0] + ',\nA first preview of your logo reveal is ready. Take a look and tell us if the timing feels right.\nSara', ts: Date.now(), read: false, starred: false }), 14000);
    }
    addEventListener('storage', e => { if (e.key === KEY.mail || e.key === KEY.queue) { mail = store.get(KEY.mail, mail); const had = consumeQueue(); refreshCounts(had); if (mailEl && cur === 'emails') renderList(false); } if (e.key === 'stackly_users' && isAdmin) renderUsers(false); });
    setInterval(() => { if (document.hidden) return; if (consumeQueue()) { refreshCounts(true); if (mailEl && cur === 'emails') renderList(false); toast('New enquiry received', 'fa-envelope'); } }, 5000);

    /* ---------- settings ---------- */
    const pf = $('#profileForm'), pwf = $('#passForm');
    const note = (el, txt, kind) => { el.className = 'au-msg show ' + kind; el.innerHTML = `<i class="fa-solid ${kind === 'ok' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i><span></span>`; $('span', el).textContent = txt; if (g) g.from(el, { y: -8, opacity: 0, duration: .4 }); };
    $('#setName').value = me.name; $('#setEmail').value = me.email;
    pf.addEventListener('submit', e => {
      e.preventDefault(); const n = $('#setName').value.trim(), out = $('#profMsg');
      if (n.length < 2) return note(out, 'Enter your full name.', 'err');
      const users = store.get('stackly_users', []), u = users.find(x => x.email === me.email); if (u) { u.name = n; store.set('stackly_users', users); }
      me = { ...me, name: n }; const rem = !!localStorage.getItem('stackly_session'); setSession(me, rem); paintMe(); $('#dbGreet').textContent = `${greet}, ${n.split(' ')[0]}`;
      note(out, 'Profile saved.', 'ok'); toast('Profile updated', 'fa-user-check'); pushAct('Updated profile details', 'fa-user-pen');
    });
    pwf.addEventListener('submit', async e => {
      e.preventDefault(); const out = $('#passMsg'), cu = $('#curPass').value, np = $('#newPass').value, np2 = $('#newPass2').value;
      const users = store.get('stackly_users', []), u = users.find(x => x.email === me.email);
      if (!u || u.pw !== await sha(cu)) return note(out, 'Current password is incorrect.', 'err');
      if (np.length < 8 || !/\d/.test(np) || !/[A-Za-z]/.test(np)) return note(out, 'New password needs 8+ characters with a letter and a number.', 'err');
      if (np !== np2) return note(out, 'New passwords do not match.', 'err');
      u.pw = await sha(np); store.set('stackly_users', users); pwf.reset(); note(out, 'Password updated.', 'ok'); toast('Password updated', 'fa-key');
    });
    const prefs = store.get(KEY.prefs, { notify: true, digest: false, sound: true });
    $$('[data-pref]').forEach(c => { c.checked = !!prefs[c.dataset.pref]; c.addEventListener('change', () => { prefs[c.dataset.pref] = c.checked; store.set(KEY.prefs, prefs); toast(c.checked ? 'Preference turned on' : 'Preference turned off', 'fa-sliders'); }); });

    /* ---------- panel hooks (run every time a panel opens) ---------- */
    hooks.overview = () => {
      countUp($('#p-overview')); renderActs(false); renderMini(); drawChart($('.db-seg button[data-range].on').dataset.range);
      if (!isAdmin) paintProgress(true);
      if (g) g.from('#p-overview .db-card, #p-overview .db-welcome', { y: 30, opacity: 0, stagger: .07, duration: .7, ease: 'power3.out', clearProps: 'transform,opacity' });
    };
    hooks.emails = () => { renderList(true); if (g) g.from('.mail', { scale: .98, duration: .6, ease: 'power3.out', clearProps: 'transform' }); };
    hooks.users = () => renderUsers(true);
    hooks.projects = () => { if (isAdmin) renderProjs(true); else { paintProgress(true); renderTasks(); } };
    hooks.settings = () => { if (g) g.from('#p-settings .db-card', { y: 26, opacity: 0, stagger: .1, duration: .6, ease: 'power3.out', clearProps: 'transform,opacity' }); };

    /* ---------- first paint ---------- */
    if (!isAdmin) { renderTasks(); paintProgress(false); }
    refreshCounts(); renderActs(false);
    const kp = $('#kpiProj'); if (kp && isAdmin) kp.textContent = projs.filter(x => x.p < 100).length;
    const boot = () => { show(location.hash.slice(1) || 'overview', true); };
    if (g) {
      const tl = g.timeline({ defaults: { ease: 'power3.out' } });
      tl.to('.au-curtain i:first-child', { yPercent: -101, duration: .9, ease: 'power4.inOut' }, 0).to('.au-curtain i:last-child', { yPercent: 101, duration: .9, ease: 'power4.inOut' }, 0).set('.au-curtain', { display: 'none' })
        .from('.db-side', { x: -60, opacity: 0, duration: .8, clearProps: 'transform,opacity' }, .5)
        .from('.db-link', { x: -26, opacity: 0, stagger: .07, duration: .6, clearProps: 'transform,opacity' }, .7)
        .from('.db-top', { y: -40, opacity: 0, duration: .7, clearProps: 'transform,opacity' }, .6);
      setTimeout(boot, reduce ? 0 : 700);
    } else { $('.au-curtain') && $('.au-curtain').remove(); boot(); }
  }
})();