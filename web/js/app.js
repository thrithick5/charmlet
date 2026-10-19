/**
 * app.js — the site.
 *
 * Matches Book My Luck's site beat for beat: a hero with the live charm, the
 * collection, and a "make it yours" emoji escape hatch. Deliberately absent:
 * pricing, accounts, licences, analytics — this is a free, personal, local build.
 */

import { Dangle } from './dangle.js';
import { CHARMS, getCharm, registerCharm, renderArt } from './charms.js';
import * as sound from './sound.js';

const $ = (id) => document.getElementById(id);

/* ------------------------------------------------------------------ *
 * Toast
 * ------------------------------------------------------------------ */

let toastTimer = null;
function toast(msg, ms = 3200) {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

/* ------------------------------------------------------------------ *
 * Hero
 * ------------------------------------------------------------------ */

function initHero() {
  const stage = $('heroStage');
  if (!stage) return null;

  const dangle = new Dangle(stage, {
    charmId: 'clover',
    length: 250,
    segments: 16,
    charmWidth: 178,
    scale: 0.55,
    anchorX: 0.5,
  });

  dangle.trackCursor(window);

  let hiddenOnce = false;
  $('ritualBtn')?.addEventListener('click', () => dangle.ritual());
  $('hideBtn')?.addEventListener('click', () => {
    const next = !dangle.visible;
    dangle.setVisible(next);
    if (!next && !hiddenOnce) {
      hiddenOnce = true;
      toast('Hidden. In the app that is ⌃D, and everything else keeps clicking through.');
    }
  });

  return dangle;
}

/* ------------------------------------------------------------------ *
 * Gallery
 * ------------------------------------------------------------------ */

// Only the cards actually on screen get a live solver. The budget is spent in
// document order and recomputed on scroll, rather than driven by an
// IntersectionObserver: an observer only fires on threshold crossings, so a card
// evicted from the budget while still visible would never come back.
const MAX_LIVE_CARDS = 14;

function initGallery(hero) {
  const grid = $('charmGrid');
  const ritualBar = $('ritualBar');
  if (!grid) return;

  const live = new Map(); // charmId -> Dangle
  const stages = new Map(); // charmId -> stage element
  const cards = new Map(); // charmId -> card element

  const retire = (id) => {
    const d = live.get(id);
    if (!d) return;
    d.destroy();
    live.delete(id);
  };

  const activate = (id, stageEl) => {
    if (live.has(id)) return;
    const d = new Dangle(stageEl, {
      charmId: id,
      length: 74,
      segments: 9,
      charmWidth: 76,
      scale: 0.4,
      gravity: 0.6,
    });
    const cardEl = stageEl.closest('.charm-card') || stageEl;
    d.trackCursor(cardEl);
    live.set(id, d);
  };

  let syncQueued = false;
  function syncLive() {
    syncQueued = false;
    const vh = window.innerHeight || 800;
    const wanted = [];
    for (const [id, el] of stages) {
      const r = el.getBoundingClientRect();
      if (r.bottom > -180 && r.top < vh + 180) wanted.push({ id, el });
      if (wanted.length >= MAX_LIVE_CARDS) break;
    }
    const keep = new Set(wanted.map((w) => w.id));
    for (const id of [...live.keys()]) if (!keep.has(id)) retire(id);
    for (const w of wanted) activate(w.id, w.el);
  }

  const queueSync = () => {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(syncLive);
  };
  if (typeof IntersectionObserver === 'undefined') {
    window.addEventListener('scroll', queueSync, { passive: true });
    window.addEventListener('resize', queueSync);
  }

  for (const c of CHARMS) {
    const card = document.createElement('div');
    card.className = 'charm-card';
    card.dataset.charmId = c.id;
    card.style.setProperty('--charm-accent', c.accent || '#888');
    card.setAttribute('role', 'group');
    card.setAttribute('aria-label', `${c.name}, ${c.origin}`);

    const stage = document.createElement('div');
    stage.className = 'card-stage';
    stage.dataset.charmId = c.id;
    stage.innerHTML = `<div class="card-art-preview">${renderArt(c, 'pv-' + c.id)}</div>`;

    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = `
      <span class="card-name">${c.name}</span>
      <span class="card-origin">${c.origin}</span>
      <span class="card-plaque">${c.plaque}</span>
      <span class="card-ritual">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>
        ${c.ritualName}
      </span>
      <button class="btn btn-line btn-sm card-hang" type="button">Hang it</button>`;

    card.appendChild(stage);
    card.appendChild(body);
    grid.appendChild(card);
    cards.set(c.id, card);
    stages.set(c.id, stage);

    const hang = () => selectCharm(c.id);
    body.querySelector('.card-hang').addEventListener('click', (e) => {
      e.stopPropagation();
      hang();
    });
    // Tapping the card body hangs it; tapping the charm itself performs its
    // ritual, which the Dangle handles on its own.
    body.addEventListener('click', hang);
  }

  let activeCharmId = 'nazar';

  function updateStageBadge(c) {
    const b = $('stageBadge');
    if (!b) return;
    b.animate(
      [
        { opacity: 0, transform: 'translateY(-3px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 250, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    );
    b.querySelector('.n').textContent = c.name;
    b.querySelector('.o').textContent = c.origin;
  }

  function updateStageCounter(id) {
    const idx = CHARMS.findIndex((c) => c.id === id);
    const cur = $('currentCharmIndex');
    const tot = $('totalCharmsCount');
    if (cur && idx !== -1) cur.textContent = String(idx + 1);
    if (tot) tot.textContent = String(CHARMS.length);
  }

  function updateRitualBar(activeId) {
    ritualBar?.querySelectorAll('.chip').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.charmId === activeId));
    });
  }

  function selectCharm(id, { direction = 'none', animate = true, scroll = false } = {}) {
    const c = getCharm(id);
    activeCharmId = id;

    if (hero) {
      hero.setCharm(id, { animate: false });
      if (animate) hero.ritual();
    }
    for (const [cid, card] of cards) {
      const isSel = cid === id;
      card.setAttribute('aria-pressed', String(isSel));
      if (isSel && scroll) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    updateStageBadge(c);
    updateStageCounter(id);
    updateRitualBar(id);

    const shell = $('heroStageShell');
    if (shell && c.accent) {
      shell.style.setProperty('--charm-accent', c.accent);
    }

    if (!selectCharm._announced) {
      selectCharm._announced = true;
      toast(`${c.name} is hanging on the stage. Flick it.`);
    }
  }
  selectCharm._announced = false;

  /* --- ritual bar --- */
  if (ritualBar) {
    for (const c of CHARMS) {
      const b = document.createElement('button');
      b.className = 'chip';
      b.type = 'button';
      b.dataset.charmId = c.id;
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="dot" style="background:${c.accent}"></span>${c.ritualName} · ${c.name}`;
      b.addEventListener('click', () => {
        selectCharm(c.id, { animate: true });
        document.querySelector('.hero-stage-shell')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      ritualBar.appendChild(b);
    }
  }

  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const id = entry.target.dataset.charmId;
        if (entry.isIntersecting) {
          activate(id, entry.target);
        } else {
          retire(id);
        }
      }
    }, { rootMargin: '250px 0px' });
    for (const [, el] of stages) observer.observe(el);
  } else {
    syncLive();
  }

  // Hang the first charm silently — the stage already says "grab it · flick it".
  selectCharm._announced = true;
  selectCharm('nazar');
  return { selectCharm, getActiveId: () => activeCharmId };
}

/* ------------------------------------------------------------------ *
 * Any emoji
 * ------------------------------------------------------------------ */

function emojiArt(glyph) {
  return `<svg class="charm-art" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="em-__ID__" cx="34%" cy="26%" r="78%">
        <stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#cfd8ea"/><stop offset="1" stop-color="#8e9ab3"/>
      </radialGradient>
      <radialGradient id="em-pearl-__ID__" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="60%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </radialGradient>
      <radialGradient id="em-bead-__ID__" cx="34%" cy="28%" r="78%">
        <stop offset="0%" stop-color="#93c5fd"/>
        <stop offset="22%" stop-color="#3b82f6"/>
        <stop offset="68%" stop-color="#1d4ed8"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </radialGradient>
      <linearGradient id="em-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="30%" stop-color="#f59e0b"/>
        <stop offset="70%" stop-color="#d97706"/>
        <stop offset="100%" stop-color="#78350f"/>
      </linearGradient>
    </defs>
    <!-- Warm silk cord stub -->
    <path d="M60 0 V6" stroke="#a16207" stroke-width="1.8" stroke-linecap="round"/>
    <!-- Top white pearl bead -->
    <circle cx="60" cy="9" r="2.6" fill="url(#em-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
    <!-- Middle royal-blue spherical bead -->
    <circle cx="60" cy="17.2" r="5.6" fill="url(#em-bead-__ID__)"/>
    <circle cx="58.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
    <circle cx="62.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
    <!-- Bottom white pearl bead -->
    <circle cx="60" cy="25.4" r="2.6" fill="url(#em-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
    <!-- Signature metallic gold jump-ring -->
    <circle cx="60" cy="34" r="5.2" fill="none" stroke="url(#em-gold-__ID__)" stroke-width="2.3"/>
    <path d="M60 39.2 V48" stroke="#a16207" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="60" cy="96" r="46" fill="url(#em-__ID__)" opacity=".92"/>
    <circle cx="60" cy="96" r="46" fill="none" stroke="#7d8598" stroke-width="1.8"/>
    <text x="60" y="98" text-anchor="middle" dominant-baseline="central" font-size="58">${glyph}</text>
    <ellipse cx="42" cy="72" rx="14" ry="8" fill="#fff" opacity=".5" transform="rotate(-28 42 72)"/>
  </svg>`;
}

function initEmojiCharm(hero) {
  $('emojiBtn')?.addEventListener('click', () => {
    const glyph = prompt('Pick an emoji — paste one, or type a few characters:', '🍀');
    if (!glyph) return;
    const id = 'emoji-custom';
    registerCharm({
      id,
      name: 'Your emoji',
      origin: 'Yours',
      plaque: 'Any glyph you like, hanging from the same cord.',
      ritualName: 'Boop',
      hint: 'Boop it',
      sound: 'sparkle',
      accent: '#a06bff',
      sway: 1.1,
      weight: 6,
      art: emojiArt(glyph.slice(0, 4)),
      ritual(root, api) {
        api.play('sparkle');
        const svg = root.querySelector('svg');
        svg?.animate(
          [
            { transform: 'scale(1) rotate(0deg)' },
            { transform: 'scale(1.18) rotate(-8deg)' },
            { transform: 'scale(1.05) rotate(6deg)' },
            { transform: 'scale(1) rotate(0deg)' },
          ],
          { duration: 900, easing: 'cubic-bezier(.3,1.7,.4,1)', fill: 'both' },
        );
        api.floater('boop');
      },
    });
    hero?.setCharm(id);
    setTimeout(() => hero?.ritual(), 200);
  });
}

/* ------------------------------------------------------------------ *
 * Extras
 * ------------------------------------------------------------------ */

function initStageCarousel(hero, selectCharm, getActiveId) {
  const shell = $('heroStageShell');
  const stage = $('heroStage');
  const prevBtn = $('stagePrevBtn');
  const nextBtn = $('stageNextBtn');

  if (!shell || !stage) return;

  const total = CHARMS.length;

  const navigate = (step, direction) => {
    const curId = getActiveId();
    let idx = CHARMS.findIndex((c) => c.id === curId);
    if (idx === -1) idx = 0;
    const nextIdx = (idx + step + total) % total;
    const targetCharm = CHARMS[nextIdx];

    const exitX = direction === 'left' ? -60 : 60;
    const enterX = direction === 'left' ? 60 : -60;

    // Fluid spring exit & entrance
    const anim = stage.animate(
      [
        { transform: 'translateX(0)', opacity: 1 },
        { transform: `translateX(${exitX}px)`, opacity: 0.15 },
      ],
      { duration: 160, easing: 'cubic-bezier(0.32, 1, 0.23, 1)', fill: 'forwards' }
    );

    anim.onfinish = () => {
      selectCharm(targetCharm.id, { direction, animate: true });
      stage.animate(
        [
          { transform: `translateX(${enterX}px)`, opacity: 0.15 },
          { transform: 'translateX(0)', opacity: 1 },
        ],
        { duration: 320, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
      );
    };
  };

  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    navigate(-1, 'right');
  });

  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    navigate(1, 'left');
  });

  // Swipe gesture handling with 1:1 direct tracking & Apple spring physics
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocityX = 0;
  let gestureCommitted = false;

  const rubberband = (overshoot, dimension, constant = 0.55) =>
    (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));

  const onPointerDown = (e) => {
    if (e.target.closest('button, a, .icon-btn, .stage-nav, .stage-actions')) return;
    if (e.target.closest('.dangle-charm')) return;

    startX = e.clientX;
    startY = e.clientY;
    currentX = startX;
    currentY = startY;
    lastX = startX;
    lastTime = performance.now();
    velocityX = 0;
    isDragging = true;
    gestureCommitted = false;
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    const now = performance.now();
    const dt = now - lastTime;
    currentX = e.clientX;
    currentY = e.clientY;
    const dx = currentX - startX;
    const dy = currentY - startY;

    if (dt > 0) {
      velocityX = (currentX - lastX) / dt;
    }
    lastX = currentX;
    lastTime = now;

    if (!gestureCommitted) {
      const dist = Math.hypot(dx, dy);
      if (dist > 8) {
        if (Math.abs(dx) > Math.abs(dy) * 1.1) {
          gestureCommitted = true;
          shell.classList.add('is-swiping');
          try { shell.setPointerCapture?.(e.pointerId); } catch (_) {}
        } else {
          isDragging = false;
          return;
        }
      }
    }

    if (gestureCommitted) {
      e.preventDefault();
      const damped = rubberband(dx, shell.offsetWidth || 600, 0.45);
      stage.style.transform = `translateX(${damped}px)`;
      stage.style.opacity = String(Math.max(0.3, 1 - Math.abs(damped) / 500));
      stage.style.transition = 'none';
    }
  };

  const onPointerUp = (e) => {
    if (!isDragging) return;
    isDragging = false;
    shell.classList.remove('is-swiping');

    if (!gestureCommitted) return;
    gestureCommitted = false;
    try { shell.releasePointerCapture?.(e.pointerId); } catch (_) {}

    const dx = currentX - startX;
    const width = shell.offsetWidth || 600;
    const threshold = Math.min(width * 0.15, 55);
    const velThreshold = 0.25;

    const shouldGoNext = dx < -threshold || (dx < -15 && velocityX < -velThreshold);
    const shouldGoPrev = dx > threshold || (dx > 15 && velocityX > velThreshold);

    if (shouldGoNext) {
      // Swiped Left -> Next charm
      stage.style.transition = 'transform 0.2s cubic-bezier(0.32, 1, 0.23, 1), opacity 0.2s ease';
      stage.style.transform = `translateX(-${width * 0.3}px)`;
      stage.style.opacity = '0';
      setTimeout(() => {
        stage.style.transition = '';
        stage.style.transform = '';
        stage.style.opacity = '';
        navigate(1, 'left');
      }, 190);
    } else if (shouldGoPrev) {
      // Swiped Right -> Prev charm
      stage.style.transition = 'transform 0.2s cubic-bezier(0.32, 1, 0.23, 1), opacity 0.2s ease';
      stage.style.transform = `translateX(${width * 0.3}px)`;
      stage.style.opacity = '0';
      setTimeout(() => {
        stage.style.transition = '';
        stage.style.transform = '';
        stage.style.opacity = '';
        navigate(-1, 'right');
      }, 190);
    } else {
      // Spring back to center
      stage.style.transition = 'transform 0.36s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.3s ease';
      stage.style.transform = 'translateX(0px)';
      stage.style.opacity = '1';
      setTimeout(() => {
        stage.style.transition = '';
        stage.style.transform = '';
        stage.style.opacity = '';
      }, 360);
    }
  };

  shell.addEventListener('pointerdown', onPointerDown);
  shell.addEventListener('pointermove', onPointerMove);
  shell.addEventListener('pointerup', onPointerUp);
  shell.addEventListener('pointercancel', onPointerUp);

  // Keyboard navigation: Left/Right arrows
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigate(-1, 'right');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigate(1, 'left');
    }
  });
}

function initKeyboard(hero) {
  window.addEventListener('keydown', (e) => {
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === 'r' || e.key === 'R') hero?.ritual();
    if (e.key === 'h' || e.key === 'H') hero?.setVisible(!hero.visible);
    if (e.key === 't' || e.key === 'T') hero?.flick((Math.random() - 0.5) * 40, -12);
  });
}

function initNav() {
  const nav = $('nav');
  const onScroll = () => nav?.classList.toggle('is-stuck', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

function initOsTabs() {
  const tabs = [
    { btn: $('tabBtnMac'), panel: $('panelMac'), id: 'mac' },
    { btn: $('tabBtnWin'), panel: $('panelWin'), id: 'win' },
    { btn: $('tabBtnWeb'), panel: $('panelWeb'), id: 'web' },
  ];

  const setTab = (activeId) => {
    for (const { btn, panel, id } of tabs) {
      if (!btn || !panel) continue;
      const isActive = id === activeId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      panel.classList.toggle('active', isActive);
      panel.style.display = isActive ? 'block' : 'none';
    }
  };

  for (const { btn, id } of tabs) {
    btn?.addEventListener('click', () => setTab(id));
  }

  // Auto-detect Windows: pre-select Windows tab and set Hero CTA
  const userAgent = navigator.userAgent || '';
  const isWindows = /Windows|Win32|Win64/i.test(userAgent);
  if (isWindows) {
    setTab('win');
    const heroBtn = $('heroDownloadBtn');
    if (heroBtn) {
      heroBtn.textContent = 'Download for Windows (.exe)';
      heroBtn.href = 'downloads/Charmlet-Setup.exe';
      heroBtn.setAttribute('download', '');
    }
  }
}

function boot() {
  // Sound stays off and there is no toggle, matching Book My Luck's silence.
  sound.setEnabled(false);

  initNav();
  initOsTabs();

  const hero = initHero();
  const gallery = initGallery(hero);
  if (gallery) {
    initStageCarousel(hero, gallery.selectCharm, gallery.getActiveId);
  }
  initEmojiCharm(hero);
  initKeyboard(hero);

  document.documentElement.dataset.ready = '1';
}

if (typeof window !== 'undefined') {
  window.Dangle = Dangle;
  window.CHARMS = CHARMS;
  window.getCharm = getCharm;
  window.sound = sound;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
