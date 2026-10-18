/**
 * app.js — the site.
 *
 * Wires the rig up to the page: the hero stage, the gallery, the aura meter,
 * the photo charms, the keyboard shortcuts and the easter egg.
 */

import { Dangle } from './dangle.js';
import {
  CHARMS,
  CHARM_GROUPS,
  getCharm,
  registerCharm,
} from './charms.js';
import { Aura } from './aura.js';
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
 * Theme + sound
 * ------------------------------------------------------------------ */

const THEME_KEY = 'webdangle.theme';

function initTheme() {
  let theme = 'dark';
  try {
    theme = localStorage.getItem(THEME_KEY) || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  } catch {
    /* ignore */
  }
  document.documentElement.dataset.theme = theme;
  $('themeBtn')?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
    sound.play('tick');
  });
}

function initSound() {
  const btn = $('soundBtn');
  const on = sound.restorePreference();
  const sync = () => {
    btn?.setAttribute('aria-pressed', String(sound.isEnabled()));
    btn?.setAttribute('title', sound.isEnabled() ? 'Sound on' : 'Sound off (click for thwips)');
    const icon = $('soundIcon');
    if (icon) {
      icon.innerHTML = sound.isEnabled()
        ? '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M16 9.5a3.5 3.5 0 0 1 0 5"/><path d="M19 7a7 7 0 0 1 0 10"/>'
        : '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M17 9l4 6M21 9l-4 6"/>';
    }
  };
  sync();
  btn?.addEventListener('click', () => {
    sound.setEnabled(!sound.isEnabled());
    sync();
    if (sound.isEnabled()) sound.play('thwip');
  });
  // Browsers require a gesture before audio; the first click anywhere arms it.
  const arm = () => {
    if (sound.isEnabled()) sound.play('tick');
    window.removeEventListener('pointerdown', arm);
  };
  window.addEventListener('pointerdown', arm, { once: true });
  return on;
}

/* ------------------------------------------------------------------ *
 * Aura
 * ------------------------------------------------------------------ */

function initAura() {
  const meter = $('auraMeter');
  const num = $('auraNum');
  const rank = $('auraRank');
  const vibeNum = $('vibeAuraNum');
  const vibeThwips = $('vibeThwips');

  const aura = new Aura({
    onUpdate(s) {
      if (num) num.textContent = String(s.session);
      if (rank) rank.textContent = s.rank.label;
      if (vibeNum) vibeNum.textContent = `${s.session} aura`;
      if (vibeThwips) vibeThwips.textContent = String(s.thwips);
      if (meter) {
        meter.dataset.tone = s.rank.tone;
        if (s.reason === 'aura' || s.reason === 'thwip') {
          meter.classList.remove('aura-bump');
          void meter.offsetWidth;
          meter.classList.add('aura-bump');
        }
      }
    },
  });
  aura.onUpdate(aura.snapshot('init'));
  return aura;
}

/* ------------------------------------------------------------------ *
 * Hero
 * ------------------------------------------------------------------ */

function initHero(aura) {
  const stage = $('heroStage');
  if (!stage) return null;

  const dangle = new Dangle(stage, {
    charmId: 'slinger',
    length: 250,
    segments: 16,
    charmWidth: 196,
    scale: 0.55,
    anchorX: 0.5,
  });

  dangle.trackCursor(window);
  dangle.addEventListener('aura', (e) => aura.add(e.detail.amount));
  dangle.addEventListener('ritual', () => sound.play('tick'));
  dangle.addEventListener('flick', () => aura.thwip());

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

  $('heroHint')?.addEventListener('click', () => {});

  // First visit: one nudge so nobody misses that he is grabbable.
  setTimeout(() => {
    if (dangle.visible) dangle.floater('grab me');
  }, 1400);

  return dangle;
}

/* ------------------------------------------------------------------ *
 * Gallery
 * ------------------------------------------------------------------ */

const MAX_LIVE_CARDS = 12;

function buildCardArt() {
  // A "new" badge marks the charms that were built for this product.
  const NEW_IDS = new Set(['slinger', 'boba', 'capybara', 'disco', 'tamagotchi', 'esc', 'slime', 'aura']);
  return NEW_IDS;
}

function initGallery(hero, aura) {
  const grid = $('charmGrid');
  const filters = $('filters');
  const ritualBar = $('ritualBar');
  if (!grid) return;

  const NEW_IDS = buildCardArt();

  // Only the cards actually on screen get a live solver.
  //
  // The budget is spent in document order and recomputed on scroll, rather than
  // driven by an IntersectionObserver. An observer only fires on threshold
  // crossings, so a card that got evicted from the budget while it was still
  // visible would never be re-activated — which is exactly how the hero's own card
  // ended up rendering as an empty box.
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
    d.trackCursor(stageEl);
    d.addEventListener('aura', (e) => aura.add(e.detail.amount));
    live.set(id, d);
  };

  let syncQueued = false;
  function syncLive() {
    syncQueued = false;
    const vh = window.innerHeight || 800;
    const wanted = [];
    for (const [id, el] of stages) {
      const card = cards.get(id);
      if (card && card.style.display === 'none') continue;
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
  window.addEventListener('scroll', queueSync, { passive: true });
  window.addEventListener('resize', queueSync);


  for (const c of CHARMS) {
    const card = document.createElement('div');
    card.className = 'charm-card';
    card.dataset.charmId = c.id;
    card.dataset.group = CHARM_GROUPS.find((g) => g.ids.includes(c.id))?.title || 'World charms';
    card.style.setProperty('--charm-accent', c.accent || '#888');
    card.setAttribute('role', 'group');
    card.setAttribute('aria-label', `${c.name}, ${c.origin}`);

    const stage = document.createElement('div');
    stage.className = 'card-stage';
    stage.dataset.charmId = c.id;

    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = `
      <span class="card-name">${c.name}${NEW_IDS.has(c.id) ? '<span class="badge-new">New</span>' : ''}</span>
      <span class="card-origin">${c.origin}</span>
      <span class="card-plaque">${c.plaque}</span>
      <span class="card-ritual">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>
        ${c.ritualName}
      </span>
      <button class="btn btn-ghost btn-sm card-hang" type="button">Hang it</button>`;

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
    // Tapping the card body hangs it; tapping the charm itself performs its ritual,
    // which the Dangle handles on its own.
    body.addEventListener('click', hang);
  }

  function selectCharm(id) {
    const c = getCharm(id);
    if (hero) {
      hero.setCharm(id);
      hero.ritual();
    }
    for (const [cid, card] of cards) {
      card.setAttribute('aria-pressed', String(cid === id));
    }
    updateStageBadge(c);
    updateRitualBar(id);
    sound.play('tick');
    if (location.hash !== '#charms' && !selectCharm._announced) {
      selectCharm._announced = true;
      toast(`${c.name} is hanging on the stage. Flick him.`);
    }
  }
  selectCharm._announced = false;

  function updateStageBadge(c) {
    const b = $('stageBadge');
    if (!b) return;
    b.querySelector('.n').textContent = c.name;
    b.querySelector('.o').textContent = c.origin;
  }

  function updateRitualBar(activeId) {
    ritualBar?.querySelectorAll('.chip').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.charmId === activeId));
    });
  }

  /* --- filters --- */
  if (filters) {
    const groups = ['All', ...CHARM_GROUPS.map((g) => g.title)];
    groups.forEach((g, i) => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.type = 'button';
      b.textContent = g;
      b.setAttribute('aria-pressed', String(i === 0));
      b.addEventListener('click', () => {
        filters.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        for (const [, card] of cards) {
          const show = g === 'All' || card.dataset.group === g;
          card.style.display = show ? '' : 'none';
        }
        queueSync();
        sound.play('tick');
      });
      filters.appendChild(b);
    });
  }

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
        hero?.setCharm(c.id);
        updateStageBadge(c);
        updateRitualBar(c.id);
        for (const [cid, card] of cards) card.setAttribute('aria-pressed', String(cid === c.id));
        setTimeout(() => hero?.ritual(), 220);
        document.querySelector('.hero-stage-shell')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      ritualBar.appendChild(b);
    }
  }

  syncLive();

  // Hang the hero charm without announcing it — the stage already says
  // "grab him · flick him · tap him", so a toast on page load is just noise.
  selectCharm._announced = true;
  selectCharm('slinger');
  return { selectCharm };
}

/* ------------------------------------------------------------------ *
 * Photo + emoji charms
 * ------------------------------------------------------------------ */

const HANG = `
  <path d="M60 0 V14" stroke="#3b3f4a" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <circle cx="60" cy="17" r="4.6" fill="none" stroke="#c9ced9" stroke-width="2.4"/>`;

function photoArt(src, { round = false } = {}) {
  const clip = round
    ? `<clipPath id="ph-__ID__"><circle cx="60" cy="100" r="44"/></clipPath>`
    : `<clipPath id="ph-__ID__"><rect x="15" y="46" width="90" height="106" rx="9"/></clipPath>`;
  const inner = round
    ? `<image href="${src}" x="16" y="56" width="88" height="88" preserveAspectRatio="xMidYMid slice" clip-path="url(#ph-__ID__)"/>`
    : `<image href="${src}" x="15" y="46" width="90" height="106" preserveAspectRatio="xMidYMid slice" clip-path="url(#ph-__ID__)"/>`;
  const frame = round
    ? `<circle cx="60" cy="100" r="44" fill="none" stroke="#c9a227" stroke-width="5"/>
       <circle cx="60" cy="100" r="49" fill="none" stroke="#8a6d12" stroke-width="1.6"/>`
    : `<rect x="15" y="46" width="90" height="106" rx="9" fill="none" stroke="#ffffff" stroke-width="5"/>
       <rect x="11" y="42" width="98" height="114" rx="12" fill="none" stroke="#b9b1a4" stroke-width="2"/>`;

  return `<svg class="charm-art" viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>${clip}</defs>
    ${HANG}
    <path d="M60 22 V46" stroke="#c9ced9" stroke-width="2" fill="none"/>
    ${inner}
    ${frame}
    <ellipse cx="34" cy="66" rx="10" ry="6" fill="#fff" opacity=".22" transform="rotate(-24 34 66)"/>
  </svg>`;
}

function emojiArt(glyph) {
  return `<svg class="charm-art" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="em-__ID__" cx="34%" cy="26%" r="78%">
        <stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#cfd8ea"/><stop offset="1" stop-color="#8e9ab3"/>
      </radialGradient>
    </defs>
    ${HANG}
    <path d="M52 34 q8 -7 16 0" stroke="#c9ced9" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <circle cx="60" cy="96" r="46" fill="url(#em-__ID__)" opacity=".92"/>
    <circle cx="60" cy="96" r="46" fill="none" stroke="#7d8598" stroke-width="1.8"/>
    <text x="60" y="98" text-anchor="middle" dominant-baseline="central" font-size="58">${glyph}</text>
    <ellipse cx="42" cy="72" rx="14" ry="8" fill="#fff" opacity=".5" transform="rotate(-28 42 72)"/>
  </svg>`;
}

function initPhotoCharms(hero, gallery) {
  const wire = (inputId, frameId, opts) => {
    const input = $(inputId);
    const frame = $(frameId);
    if (!input || !frame) return;
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = String(reader.result);
        frame.innerHTML = `<img src="${src}" alt="">`;
        const id = opts.id;
        registerCharm({
          id,
          name: opts.name,
          origin: 'Yours',
          plaque: opts.plaque,
          ritualName: opts.ritual,
          hint: opts.hint,
          sound: 'chime',
          accent: opts.accent,
          sway: 0.85,
          weight: 8,
          art: photoArt(src, opts),
          ritual(root, api) {
            api.play('sparkle');
            const svg = root.querySelector('svg');
            svg?.animate(
              [
                { transform: 'rotate(0deg) scale(1)' },
                { transform: 'rotate(4deg) scale(1.06)' },
                { transform: 'rotate(-3deg) scale(1.02)' },
                { transform: 'rotate(0deg) scale(1)' },
              ],
              { duration: 1100, easing: 'cubic-bezier(.3,1.5,.4,1)', fill: 'both' },
            );
            api.floater(opts.float);
          },
        });
        hero?.setCharm(id);
        hero?.ritual();
        toast(`${opts.name} is hanging on the stage. Nobody else can see it — it never left your browser.`);
      };
      reader.readAsDataURL(file);
    });
  };

  wire('printInput', 'printFrame', {
    id: 'photo-print',
    name: 'Photo print',
    plaque: 'A memory on a cord, kept where you work.',
    ritual: 'Look at it',
    hint: 'Look at the photo',
    accent: '#f2c14e',
    float: 'hi you',
  });

  wire('locketInput', 'locketFrame', {
    id: 'photo-locket',
    name: 'Photo locket',
    round: true,
    plaque: 'Someone you carry close, even here.',
    ritual: 'Open it',
    hint: 'Open the locket',
    accent: '#c9a227',
    float: 'still here',
  });

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
        api.aura(5);
      },
    });
    hero?.setCharm(id);
    setTimeout(() => hero?.ritual(), 200);
  });
}

/* ------------------------------------------------------------------ *
 * Extras
 * ------------------------------------------------------------------ */

function initKeyboard(hero, aura) {
  window.addEventListener('keydown', (e) => {
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === 'r' || e.key === 'R') hero?.ritual();
    if (e.key === 'h' || e.key === 'H') hero?.setVisible(!hero.visible);
    if (e.key === 't' || e.key === 'T') {
      hero?.flick((Math.random() - 0.5) * 40, -12);
      aura.thwip();
    }
  });
}

function initKonami(hero) {
  const seq = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a',
  ];
  let i = 0;
  window.addEventListener('keydown', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    i = k === seq[i] ? i + 1 : k === seq[0] ? 1 : 0;
    if (i === seq.length) {
      i = 0;
      document.body.classList.toggle('sense');
      const on = document.body.classList.contains('sense');
      const flash = $('senseFlash');
      if (flash) {
        flash.classList.remove('on');
        void flash.offsetWidth;
        flash.classList.add('on');
      }
      sound.play(on ? 'thwip' : 'tick');
      hero?.setCharm('slinger');
      hero?.ritual();
      toast(on ? '🕸️ Spider-sense on. Everything is danger.' : 'Spider-sense off. Back to your quiet life.');
    }
  });
}

function initBuyButtons() {
  document.querySelectorAll('[data-buy]').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      toast(
        'Checkout is not live yet. Point this button at a Stripe payment link and it works as-is — no fake card form here.',
        5200,
      );
    });
  });
}

function initNav() {
  const nav = $('nav');
  const onScroll = () => nav?.classList.toggle('is-stuck', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initSecretRitual(hero) {
  // Clicking the brand mark three times does something small and pleasant.
  let n = 0;
  let t = null;
  document.querySelectorAll('.brand').forEach((b) =>
    b.addEventListener('click', () => {
      n++;
      clearTimeout(t);
      t = setTimeout(() => (n = 0), 900);
      if (n >= 3) {
        n = 0;
        hero?.flick((Math.random() - 0.5) * 60, -22);
        hero?.floater('thwip thwip thwip');
        sound.play('thwip');
      }
    }),
  );
}

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

function boot() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  initTheme();
  initSound();
  initNav();

  const aura = initAura();
  const stage = $('heroStage');
  if (stage) stage.dataset.reduced = String(reduced);

  const hero = initHero(aura);
  initGallery(hero, aura);
  initPhotoCharms(hero, null);
  initKeyboard(hero, aura);
  initKonami(hero);
  initBuyButtons();
  initSecretRitual(hero);

  document.documentElement.dataset.ready = '1';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
