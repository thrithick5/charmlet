/**
 * charms.js — the collection.
 *
 * Every charm is a plain object: a name, a museum plaque, and inline SVG whose
 * animatable pieces are tagged with `data-part`. Rituals animate those parts.
 *
 * Two rules hold this file together:
 *
 *  1. Artwork is original. Nothing here is traced, copied or derived from any
 *     existing character. The hero is "The Slinger" — an original web-slinger
 *     drawn for this product — because shipping someone else's character would
 *     make the whole thing unsellable.
 *
 *  2. Every gradient and clipPath id contains the token `__ID__`, replaced with a
 *     unique string at render time. The same charm is on screen several times at
 *     once (hero stage plus gallery card), and duplicated SVG ids would make them
 *     all share one gradient.
 */

const anim = (el, frames, opts = {}) =>
  el ? el.animate(frames, { easing: 'ease-out', fill: 'both', ...opts }) : null;

const parts = (root, name) => Array.from(root.querySelectorAll(`[data-part="${name}"]`));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Small loop + cord stub every charm shares, so they all hang identically. */
const HANGER = `
  <path d="M60 0 V14" stroke="#3b3f4a" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <circle cx="60" cy="17" r="4.6" fill="none" stroke="#c9ced9" stroke-width="2.4"/>
  <circle cx="60" cy="17" r="4.6" fill="none" stroke="#ffffff" stroke-width="1" opacity=".55"/>`;

/* ================================================================== *
 * 1. THE HERO
 * ================================================================== */

const slinger = {
  id: 'slinger',
  name: 'Web Slinger',
  origin: 'Yours',
  featured: true,
  plaque: 'An original masked hero, hung upside down from his own line.',
  ritualName: 'Thwip',
  hint: 'Give it a thwip',
  sound: 'thwip',
  accent: '#e62429',
  sway: 1.15,
  weight: 8,
  art: `
<svg class="charm-art" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="sl-red-__ID__" cx="34%" cy="22%" r="84%">
      <stop offset="0" stop-color="#ff7163"/><stop offset=".5" stop-color="#e01f2b"/><stop offset="1" stop-color="#8c0c17"/>
    </radialGradient>
    <linearGradient id="sl-blue-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4d89ff"/><stop offset="1" stop-color="#0f2a88"/>
    </linearGradient>
    <clipPath id="sl-head-__ID__"><ellipse cx="60" cy="150" rx="27" ry="29"/></clipPath>
    <clipPath id="sl-torso-__ID__"><rect x="37" y="78" width="46" height="50" rx="16"/></clipPath>
  </defs>

  <!-- the line he hangs from, and the little web burst at his ankles -->
  <g data-part="web">
    <path d="M60 0 V30" stroke="#eef2f8" stroke-width="2.6" stroke-linecap="round"/>
    <g stroke="#eef2f8" stroke-width="1" opacity=".5" fill="none">
      <path d="M60 26 L45 13"/><path d="M60 26 L75 13"/><path d="M60 26 L60 9"/>
      <path d="M60 26 L51 19"/><path d="M60 26 L69 19"/>
      <path d="M48 16 q12 7 24 0"/>
    </g>
  </g>

  <!-- legs going up, two boots crossed at the top -->
  <g data-part="legs">
    <path d="M53 76 L51 38" stroke="url(#sl-blue-__ID__)" stroke-width="13.5" stroke-linecap="round" fill="none"/>
    <path d="M67 76 L69 38" stroke="url(#sl-blue-__ID__)" stroke-width="13.5" stroke-linecap="round" fill="none"/>
    <path d="M53 76 L51 38" stroke="#0b1f63" stroke-width="1" opacity=".25" fill="none"/>
    <path d="M67 76 L69 38" stroke="#0b1f63" stroke-width="1" opacity=".25" fill="none"/>
    <ellipse cx="50" cy="27" rx="9.5" ry="11.5" fill="url(#sl-red-__ID__)" stroke="#7d0a15" stroke-width="1.7"/>
    <ellipse cx="70" cy="27" rx="9.5" ry="11.5" fill="url(#sl-red-__ID__)" stroke="#7d0a15" stroke-width="1.7"/>
    <path d="M41 29 q9 5.5 18 0" stroke="#7d0a15" stroke-width="1.6" fill="none"/>
    <path d="M61 29 q9 5.5 18 0" stroke="#7d0a15" stroke-width="1.6" fill="none"/>
    <ellipse cx="50" cy="18" rx="6" ry="2.6" fill="#ffb0a6" opacity=".45"/>
    <ellipse cx="70" cy="18" rx="6" ry="2.6" fill="#ffb0a6" opacity=".45"/>
  </g>

  <!-- torso -->
  <g data-part="body">
    <rect x="37" y="78" width="46" height="50" rx="16" fill="url(#sl-blue-__ID__)"/>
    <g clip-path="url(#sl-torso-__ID__)">
      <path d="M60 72 L92 112 L92 72 Z" fill="url(#sl-red-__ID__)"/>
      <path d="M60 72 L28 112 L28 72 Z" fill="url(#sl-red-__ID__)"/>
      <path d="M60 85 l3.3 6.5 7.1 1 -5.2 5 1.2 7.1 -6.4-3.4 -6.4 3.4 1.2-7.1 -5.2-5 7.1-1 Z" fill="#0b1b57" opacity=".5"/>
      <path d="M60 78 v52" stroke="#0b1b57" stroke-width="1" opacity=".25"/>
    </g>
    <rect x="37" y="78" width="46" height="50" rx="16" fill="none" stroke="#0a1747" stroke-width="1.6" opacity=".45"/>
  </g>

  <!-- arms, hanging loose beside him -->
  <g data-part="armL" style="transform-box:view-box;transform-origin:43px 90px">
    <path d="M44 90 Q31 104 29 121" stroke="url(#sl-blue-__ID__)" stroke-width="11" stroke-linecap="round" fill="none"/>
    <circle cx="28" cy="124" r="7.5" fill="url(#sl-red-__ID__)" stroke="#7d0a15" stroke-width="1.5"/>
    <ellipse cx="26" cy="121" rx="3" ry="1.8" fill="#ffb0a6" opacity=".4"/>
  </g>
  <g data-part="armR" style="transform-box:view-box;transform-origin:77px 90px">
    <path d="M76 90 Q89 104 91 121" stroke="url(#sl-blue-__ID__)" stroke-width="11" stroke-linecap="round" fill="none"/>
    <circle cx="92" cy="124" r="7.5" fill="url(#sl-red-__ID__)" stroke="#7d0a15" stroke-width="1.5"/>
    <ellipse cx="90" cy="121" rx="3" ry="1.8" fill="#ffb0a6" opacity=".4"/>
  </g>

  <!-- head: red mask, black webbing, big lenses -->
  <g data-part="head">
    <ellipse cx="60" cy="150" rx="27" ry="29" fill="url(#sl-red-__ID__)"/>
    <g clip-path="url(#sl-head-__ID__)" stroke="#8c0c17" stroke-width="1.2" fill="none" opacity=".8">
      <path d="M60 150 L60 121 M60 150 L87 133 M60 150 L87 167 M60 150 L60 179 M60 150 L33 167 M60 150 L33 133"/>
      <path d="M60 124 q21 0 26 13 M60 176 q21 0 26 -13 M60 124 q-21 0 -26 13 M60 176 q-21 0 -26 -13"/>
      <ellipse cx="60" cy="150" rx="12" ry="13"/>
      <path d="M47 129 q13 21 0 42 M73 129 q-13 21 0 42"/>
    </g>
    <ellipse cx="60" cy="150" rx="27" ry="29" fill="none" stroke="#7d0a15" stroke-width="2"/>
    <path d="M44 138 q13 -6.5 16.5 5 q-5.5 10 -15.5 6 q-6 -6 -1 -11 Z" fill="#f6faff" stroke="#0a1747" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M76 138 q-13 -6.5 -16.5 5 q5.5 10 15.5 6 q6 -6 1 -11 Z" fill="#f6faff" stroke="#0a1747" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M47.5 141 q5 -3 8 1" stroke="#94aac9" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M72.5 141 q-5 -3 -8 1" stroke="#94aac9" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <ellipse cx="49" cy="161" rx="7" ry="4" fill="#ff9182" opacity=".26"/>
  </g>
</svg>`,
  ritual(root, api) {
    const head = parts(root, 'head')[0];
    const web = parts(root, 'web')[0];
    const arms = [...parts(root, 'armL'), ...parts(root, 'armR')];
    api.play('thwip');
    // He drops, snaps taut, and swings out.
    anim(root.querySelector('svg'), [
      { transform: 'translateY(0)' },
      { transform: 'translateY(9px)' },
      { transform: 'translateY(-3px)' },
      { transform: 'translateY(0)' },
    ], { duration: 900, easing: 'cubic-bezier(.3,1.6,.4,1)' });
    anim(head, [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-11deg)' },
      { transform: 'rotate(8deg)' },
      { transform: 'rotate(0deg)' },
    ], { duration: 1000, easing: 'ease-in-out' });
    arms.forEach((a, i) =>
      anim(a, [
        { transform: 'rotate(0deg)' },
        { transform: `rotate(${i ? 34 : -34}deg)` },
        { transform: `rotate(${i ? -8 : 8}deg)` },
        { transform: 'rotate(0deg)' },
      ], { duration: 950, easing: 'ease-in-out' }),
    );
    anim(web, [{ opacity: 1 }, { opacity: 0.35 }, { opacity: 1 }], { duration: 420 });
    api.floater('THWIP!');
  },
};

/* ================================================================== *
 * WORLD CHARMS
 * ================================================================== */

const nazar = {
  id: 'nazar',
  name: 'Nazar boncuğu',
  origin: 'Türkiye and the Mediterranean',
  plaque: 'A glass eye worn against the evil eye. Flick it for cover.',
  ritualName: 'Flick it',
  hint: 'Give it a flick',
  sound: 'glass',
  accent: '#1d6fd0',
  sway: 1,
  weight: 6,
  art: `
<svg class="charm-art" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="nz-1-__ID__" cx="34%" cy="26%" r="78%">
      <stop offset="0" stop-color="#63b6ff"/><stop offset=".45" stop-color="#1f6fd4"/><stop offset="1" stop-color="#0a2f70"/>
    </radialGradient>
    <radialGradient id="nz-2-__ID__" cx="36%" cy="28%" r="76%">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe2f7"/>
    </radialGradient>
    <radialGradient id="nz-3-__ID__" cx="38%" cy="30%" r="74%">
      <stop offset="0" stop-color="#8fd0ff"/><stop offset="1" stop-color="#1a63c4"/>
    </radialGradient>
    <radialGradient id="nz-4-__ID__" cx="40%" cy="32%" r="70%">
      <stop offset="0" stop-color="#3a3f52"/><stop offset="1" stop-color="#05070d"/>
    </radialGradient>
  </defs>
  <path d="M60 0 V34" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M52 34 q8 -7 16 0" stroke="#c9ced9" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <g data-part="bead">
    <circle cx="60" cy="92" r="44" fill="url(#nz-1-__ID__)"/>
    <circle cx="60" cy="92" r="33" fill="url(#nz-2-__ID__)"/>
    <circle cx="60" cy="92" r="23" fill="url(#nz-3-__ID__)"/>
    <circle cx="60" cy="92" r="12" fill="url(#nz-4-__ID__)"/>
    <ellipse cx="45" cy="72" rx="13" ry="8" fill="#ffffff" opacity=".55" transform="rotate(-28 45 72)"/>
    <ellipse cx="78" cy="112" rx="7" ry="4" fill="#ffffff" opacity=".22" transform="rotate(-28 78 112)"/>
    <circle cx="60" cy="92" r="44" fill="none" stroke="#08234f" stroke-width="1.6" opacity=".55"/>
  </g>
</svg>`,
  ritual(root, api) {
    const bead = parts(root, 'bead')[0];
    api.play('glass');
    anim(bead, [
      { transform: 'rotate(0deg) scale(1)' },
      { transform: 'rotate(-9deg) scale(1.07)' },
      { transform: 'rotate(7deg) scale(1.03)' },
      { transform: 'rotate(0deg) scale(1)' },
    ], { duration: 780, easing: 'cubic-bezier(.3,1.5,.4,1)' });
  },
};

const hamsa = {
  id: 'hamsa',
  name: 'Hamsa',
  origin: 'Middle East and North Africa',
  plaque: 'An open hand carried for protection. Flick bad luck away.',
  ritualName: 'Flick it',
  hint: 'Give it a flick',
  sound: 'glass',
  accent: '#1552b8',
  sway: 0.95,
  weight: 6.5,
  art: `
<svg class="charm-art" viewBox="0 0 130 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="hm-1-__ID__" x1="0" y1="0" x2=".6" y2="1">
      <stop offset="0" stop-color="#3f8dff"/><stop offset=".5" stop-color="#1548b4"/><stop offset="1" stop-color="#0a2a72"/>
    </linearGradient>
    <radialGradient id="hm-eye-__ID__" cx="40%" cy="35%" r="70%">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d6e4fb"/>
    </radialGradient>
  </defs>
  <path d="M65 0 V28" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <line x1="43" y1="28" x2="87" y2="28" stroke="#c9a227" stroke-width="3" stroke-linecap="round"/>
  <g data-part="hand" stroke="#c9a227" stroke-width="2.6" stroke-linejoin="round">
    <path d="M38 62 q0 -9 8 -9 t8 9 l0 26 l5 0 l0 -34 q0 -9 8 -9 t8 9 l0 34 l5 0 l0 -22 q0 -9 8 -9 t8 9 l0 24 q0 34 -18 45 q-10 5 -22 0 q-18 -11 -18 -45 Z" fill="url(#hm-1-__ID__)"/>
    <path d="M38 88 q-13 -5 -19 4 q-5 9 4 17 q7 6 15 2" fill="url(#hm-1-__ID__)"/>
    <path d="M92 88 q13 -5 19 4 q5 9 -4 17 q-7 6 -15 2" fill="url(#hm-1-__ID__)"/>
  </g>
  <path d="M38 88 q-13 -5 -19 4 q-5 9 4 17 q7 6 15 2" fill="none" stroke="#c9a227" stroke-width="2.6"/>
  <path d="M92 88 q13 -5 19 4 q5 9 -4 17 q-7 6 -15 2" fill="none" stroke="#c9a227" stroke-width="2.6"/>
  <g>
    <ellipse cx="65" cy="104" rx="15" ry="10.5" fill="url(#hm-eye-__ID__)" stroke="#c9a227" stroke-width="2.2"/>
    <circle cx="65" cy="104" r="5.4" fill="#0e3a8f"/>
    <circle cx="63.4" cy="102.4" r="1.8" fill="#ffffff" opacity=".9"/>
    <path d="M65 90 q8 8 0 14 q-8 -6 0 -14" fill="#e2603f" opacity=".85"/>
  </g>
</svg>`,
  ritual(root, api) {
    const hand = parts(root, 'hand')[0];
    api.play('glass');
    anim(hand, [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(10deg) translateX(3px)' },
      { transform: 'rotate(-8deg)' },
      { transform: 'rotate(0deg)' },
    ], { duration: 820, easing: 'cubic-bezier(.3,1.5,.4,1)' });
  },
};

const ghanta = {
  id: 'ghanta',
  name: 'Ghanta',
  origin: 'India',
  plaque: 'A bell rung to clear the air and mark a beginning.',
  ritualName: 'Ring it',
  hint: 'Ring the bell',
  sound: 'bell',
  accent: '#c9932f',
  sway: 0.85,
  weight: 8,
  art: `
<svg class="charm-art" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="gh-1-__ID__" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#8a6218"/><stop offset=".22" stop-color="#f3d27a"/>
      <stop offset=".5" stop-color="#c9992f"/><stop offset=".78" stop-color="#f7e2a4"/><stop offset="1" stop-color="#7d5713"/>
    </linearGradient>
    <linearGradient id="gh-2-__ID__" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6d4b10"/><stop offset=".3" stop-color="#e6c165"/><stop offset=".7" stop-color="#b98c26"/><stop offset="1" stop-color="#5e400d"/>
    </linearGradient>
  </defs>
  <path d="M60 0 V26" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <g data-part="bell" style="transform-box:view-box;transform-origin:60px 30px">
    <path d="M60 26 q4 0 4 5 v5 q0 3 3 5 q4 3 4 8" stroke="url(#gh-2-__ID__)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="60" cy="28" r="6" fill="url(#gh-2-__ID__)"/>
    <circle cx="60" cy="28" r="2.4" fill="#f7e2a4"/>
    <path d="M60 40 q6 0 7 7 l0 6" stroke="url(#gh-2-__ID__)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M60 46 q-19 3 -26 30 q-4 16 -8 22 q28 9 68 0 q-4 -6 -8 -22 q-7 -27 -26 -30 Z" fill="url(#gh-1-__ID__)"/>
    <path d="M60 50 q-12 4 -17 26" stroke="#fff4cf" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>
    <ellipse cx="60" cy="99" rx="34" ry="6.5" fill="#6b4a12" opacity=".55"/>
    <ellipse cx="60" cy="97" rx="34" ry="6" fill="url(#gh-2-__ID__)"/>
    <path d="M26 96 q34 8 68 0" stroke="#6b4a12" stroke-width="1.4" fill="none" opacity=".6"/>
    <circle cx="60" cy="58" r="7" fill="none" stroke="#f7e2a4" stroke-width="1.6" opacity=".7"/>
  </g>
  <g data-part="clapper" style="transform-box:view-box;transform-origin:60px 100px">
    <path d="M60 100 v10" stroke="#8a6218" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="60" cy="115" r="7.5" fill="url(#gh-2-__ID__)"/>
  </g>
</svg>`,
  ritual(root, api) {
    const bell = parts(root, 'bell')[0];
    const clapper = parts(root, 'clapper')[0];
    api.play('bell');
    api.ripple('ring');
    anim(bell, [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-13deg)' }, { transform: 'rotate(11deg)' },
      { transform: 'rotate(-8deg)' }, { transform: 'rotate(5deg)' },
      { transform: 'rotate(-2deg)' }, { transform: 'rotate(0deg)' },
    ], { duration: 1500, easing: 'ease-in-out' });
    anim(clapper, [
      { transform: 'rotate(0deg) translateX(0)' },
      { transform: 'rotate(-16deg) translateX(3px)' }, { transform: 'rotate(14deg) translateX(-3px)' },
      { transform: 'rotate(-9deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0deg)' },
    ], { duration: 1500, easing: 'ease-in-out' });
  },
};

const drishti = {
  id: 'drishti',
  name: 'Drishti bommai',
  origin: 'South India',
  plaque: 'A fierce guardian painted to meet the first bad glance.',
  ritualName: 'Repaint it',
  hint: 'Repaint the guardian',
  sound: 'wish',
  accent: '#e2603f',
  sway: 0.9,
  weight: 9,
  art: `
<svg class="charm-art" viewBox="0 0 140 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="dr-1-__ID__" cx="38%" cy="26%" r="80%">
      <stop offset="0" stop-color="#ffd08a"/><stop offset="1" stop-color="#f0a04b"/>
    </radialGradient>
  </defs>
  <path d="M70 0 V24" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <g data-part="face">
    <path d="M34 44 q36 -20 72 0 q6 30 -6 54 q-16 26 -30 30 q-14 -4 -30 -30 q-12 -24 -6 -54 Z" fill="url(#dr-1-__ID__)" stroke="#7a2f14" stroke-width="2.4"/>
    <path d="M28 46 q10 -30 42 -30 t42 30 q-10 12 -42 12 t-42 -12 Z" fill="#fff3dd" stroke="#7a2f14" stroke-width="2.2"/>
    <g data-part="crown">
      <path d="M36 34 q34 -16 68 0 q-8 10 -34 10 t-34 -10 Z" fill="#c0392b" stroke="#7a2f14" stroke-width="1.8"/>
      <circle cx="70" cy="28" r="5" fill="#f2c14e" stroke="#7a2f14" stroke-width="1.6"/>
      <circle cx="50" cy="32" r="3.6" fill="#2e86c1" stroke="#7a2f14" stroke-width="1.4"/>
      <circle cx="90" cy="32" r="3.6" fill="#27ae60" stroke="#7a2f14" stroke-width="1.4"/>
    </g>
    <path d="M40 74 q14 -10 28 0 q-14 8 -28 0 Z" fill="#ffffff" stroke="#7a2f14" stroke-width="2"/>
    <path d="M72 74 q14 -10 28 0 q-14 8 -28 0 Z" fill="#ffffff" stroke="#7a2f14" stroke-width="2"/>
    <circle cx="54" cy="75" r="4.6" fill="#1b1b1b"/><circle cx="86" cy="75" r="4.6" fill="#1b1b1b"/>
    <path d="M46 64 q10 -6 17 -1 M94 64 q-10 -6 -17 -1" stroke="#7a2f14" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M64 88 q6 -4 12 0 q-6 5 -12 0 Z" fill="#e2603f" stroke="#7a2f14" stroke-width="1.6"/>
    <path d="M56 96 q14 6 28 0 q-4 12 -14 12 t-14 -12 Z" fill="#a8281c" stroke="#7a2f14" stroke-width="2"/>
    <path d="M62 100 q4 12 8 12 M78 100 q-4 12 -8 12" stroke="#ffffff" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M42 118 q-9 10 -4 20 q4 7 12 4 q-8 -10 -8 -24 Z" fill="#fff3dd" stroke="#7a2f14" stroke-width="2"/>
    <path d="M98 118 q9 10 4 20 q-4 7 -12 4 q8 -10 8 -24 Z" fill="#fff3dd" stroke="#7a2f14" stroke-width="2"/>
    <path d="M46 122 q-6 8 -2 16 M94 122 q6 8 2 16" stroke="#7a2f14" stroke-width="1.6" fill="none"/>
  </g>
</svg>`,
  async ritual(root, api) {
    const face = parts(root, 'face')[0];
    // Seven repaints — the design-law number, straight from the tradition.
    const paints = ['#f0a04b', '#e2603f', '#c0392b', '#8e44ad', '#2e86c1', '#27ae60', '#f2c14e', '#f0a04b'];
    api.play('wish');
    for (const c of paints) {
      const grad = root.querySelector(`#dr-1-__ID__`.replace('__ID__', api.uid));
      if (grad) {
        grad.querySelectorAll('stop')[0].setAttribute('stop-color', lighten(c, 30));
        grad.querySelectorAll('stop')[1].setAttribute('stop-color', c);
      }
      anim(face, [{ transform: 'scale(1)' }, { transform: 'scale(1.045)' }, { transform: 'scale(1)' }], { duration: 150 });
      api.tick();
      await wait(150);
    }
    api.floater('repainted ×7');
  },
};

const panchang = {
  id: 'panchang',
  name: 'Páncháng jié',
  origin: 'China',
  plaque: 'One unbroken red cord, tied for fortune without end.',
  ritualName: 'Cinch it',
  hint: 'Tie in good fortune',
  sound: 'wish',
  accent: '#d42a2a',
  sway: 1.05,
  weight: 6,
  art: `
<svg class="charm-art" viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="pc-1-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff5a5a"/><stop offset="1" stop-color="#a81616"/>
    </linearGradient>
  </defs>
  <path d="M60 0 V26" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <g data-part="knot" style="transform-box:view-box;transform-origin:60px 52px">
    <path d="M44 30 q16 12 0 24 q-14 -12 0 -24 Z" fill="url(#pc-1-__ID__)" stroke="#7d0f0f" stroke-width="1.8"/>
    <path d="M76 30 q-16 12 0 24 q14 -12 0 -24 Z" fill="url(#pc-1-__ID__)" stroke="#7d0f0f" stroke-width="1.8"/>
    <path d="M46 42 q14 -6 28 0 q-14 8 -28 0 Z" fill="url(#pc-1-__ID__)" stroke="#7d0f0f" stroke-width="1.8"/>
    <rect x="52" y="42" width="16" height="20" rx="5" fill="url(#pc-1-__ID__)" stroke="#7d0f0f" stroke-width="1.8"/>
    <path d="M60 46 v14" stroke="#ffb3b3" stroke-width="1.6" opacity=".7"/>
    <path d="M30 34 q14 8 16 20 M90 34 q-14 8 -16 20" stroke="#c41f1f" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  </g>
  <g data-part="tassel" style="transform-box:view-box;transform-origin:60px 64px">
    <path d="M52 64 h16 l2 14 h-20 Z" fill="#c9a227" stroke="#8a6d12" stroke-width="1.4"/>
    <path d="M50 78 q10 6 20 0" stroke="#8a6d12" stroke-width="1.4" fill="none"/>
    <g stroke="url(#pc-1-__ID__)" stroke-width="2.4" stroke-linecap="round">
      <path d="M52 80 q-4 22 -2 34"/><path d="M56 80 q-2 24 0 38"/><path d="M60 80 q0 24 0 40"/>
      <path d="M64 80 q2 24 0 38"/><path d="M68 80 q4 22 2 34"/>
    </g>
  </g>
</svg>`,
  ritual(root, api) {
    const knot = parts(root, 'knot')[0];
    const tassel = parts(root, 'tassel')[0];
    api.play('wish');
    anim(knot, [
      { transform: 'scale(1,1)' },
      { transform: 'scale(1.3,.72)' },
      { transform: 'scale(.92,1.12)' },
      { transform: 'scale(1,1)' },
    ], { duration: 620, easing: 'cubic-bezier(.3,1.4,.4,1)' });
    anim(tassel, [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-12deg)' }, { transform: 'rotate(10deg)' },
      { transform: 'rotate(-5deg)' }, { transform: 'rotate(0deg)' },
    ], { duration: 1200, easing: 'ease-in-out' });
    api.floater('tied in');
  },
};

const daruma = {
  id: 'daruma',
  name: 'Daruma',
  origin: 'Japan',
  plaque: 'A wishing doll. One eye for the wish, one for the win.',
  ritualName: 'Make a wish',
  hint: 'Make a wish',
  sound: 'wish',
  accent: '#cf2b2b',
  sway: 1.1,
  weight: 9,
  art: `
<svg class="charm-art" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="dm-1-__ID__" cx="35%" cy="24%" r="85%">
      <stop offset="0" stop-color="#f2635a"/><stop offset=".5" stop-color="#cf2b2b"/><stop offset="1" stop-color="#8d1414"/>
    </radialGradient>
    <clipPath id="dm-c-__ID__"><path d="M60 26 q38 4 42 62 q4 52 -42 56 q-46 -4 -42 -56 q4 -58 42 -62 Z"/></clipPath>
  </defs>
  <path d="M60 0 V26" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <g data-part="doll">
    <path d="M60 26 q38 4 42 62 q4 52 -42 56 q-46 -4 -42 -56 q4 -58 42 -62 Z" fill="url(#dm-1-__ID__)" stroke="#6d0f0f" stroke-width="2.4"/>
    <g clip-path="url(#dm-c-__ID__)">
      <ellipse cx="60" cy="46" rx="18" ry="10" fill="#f7d9a0" opacity=".5"/>
      <path d="M18 118 q42 14 84 0 v32 q-42 12 -84 0 Z" fill="#a81f1f" opacity=".5"/>
      <path d="M20 132 q40 12 80 0" stroke="#f2c14e" stroke-width="3" fill="none"/>
      <ellipse cx="44" cy="62" rx="16" ry="11" fill="#ffffff" opacity=".16" transform="rotate(-22 44 62)"/>
    </g>
    <ellipse cx="60" cy="96" rx="30" ry="30" fill="#f7e3c2" opacity=".92"/>
    <ellipse cx="60" cy="96" rx="30" ry="30" fill="none" stroke="#c9a227" stroke-width="1.6" opacity=".7"/>
    <ellipse cx="46" cy="88" rx="9.5" ry="11.5" fill="#ffffff" stroke="#b8b8b8" stroke-width="1.2"/>
    <ellipse cx="74" cy="88" rx="9.5" ry="11.5" fill="#ffffff" stroke="#b8b8b8" stroke-width="1.2"/>
    <ellipse data-part="pupilL" cx="46" cy="88" rx="0" ry="0" fill="#141414"/>
    <ellipse data-part="pupilR" cx="74" cy="88" rx="0" ry="0" fill="#141414"/>
    <path d="M36 74 q10 -6 19 -2 M84 74 q-10 -6 -19 -2" stroke="#2b2b2b" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M60 96 q-7 6 0 10 q7 -4 0 -10" fill="#2b2b2b" opacity=".55"/>
    <path d="M52 110 q8 5 16 0" stroke="#2b2b2b" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".6"/>
    <path d="M60 26 q-4 -8 2 -12 q6 4 2 12" fill="#c9a227"/>
  </g>
</svg>`,
  ritual(root, api) {
    const doll = parts(root, 'doll')[0];
    const pl = parts(root, 'pupilL')[0];
    const pr = parts(root, 'pupilR')[0];
    const wished = root.dataset.wished === '1';
    api.play('wish');
    // First press makes the wish, second one grants it. Exactly the real ritual.
    const target = wished ? pr : pl;
    anim(target, [{ rx: 0, ry: 0 }, { rx: 5, ry: 6 }], { duration: 520, easing: 'ease-out' });
    target.setAttribute('rx', 5);
    target.setAttribute('ry', 6);
    root.dataset.wished = wished ? '0' : '1';
    anim(doll, [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-7deg)' }, { transform: 'rotate(6deg)' },
      { transform: 'rotate(-3deg)' }, { transform: 'rotate(0deg)' },
    ], { duration: 1000, easing: 'ease-in-out' });
    api.floater(wished ? 'wish granted' : 'wish made');
    api.aura(25);
  },
};

const maneki = {
  id: 'maneki',
  name: 'Maneki-neko',
  origin: 'Japan',
  plaque: 'A beckoning cat that invites good fortune in.',
  ritualName: 'Beckon',
  hint: 'Beckon good fortune',
  sound: 'chirp',
  accent: '#e8b23a',
  sway: 0.95,
  weight: 9,
  art: `
<svg class="charm-art" viewBox="0 0 130 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="mk-1-__ID__" cx="36%" cy="26%" r="80%">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dcd6cc"/>
    </radialGradient>
    <linearGradient id="mk-2-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#c9932f"/>
    </linearGradient>
  </defs>
  <path d="M65 0 V24" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <ellipse cx="65" cy="146" rx="40" ry="8" fill="#000" opacity=".08"/>
  <path d="M40 96 q-6 40 4 52 q21 8 42 0 q10 -12 4 -52 Z" fill="url(#mk-1-__ID__)" stroke="#b9b1a4" stroke-width="2"/>
  <path d="M40 96 q-6 40 4 52 q10 4 21 4 v-56 Z" fill="#f0a04b" opacity=".55"/>
  <path d="M52 100 q-2 30 0 44 M78 100 q2 30 0 44" stroke="#c9c1b4" stroke-width="1.4" fill="none" opacity=".7"/>
  <ellipse cx="65" cy="128" rx="17" ry="14" fill="url(#mk-2-__ID__)" stroke="#9a7420" stroke-width="1.8"/>
  <text x="65" y="133" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="700" fill="#7d5c14">開運</text>
  <g data-part="paw" style="transform-box:view-box;transform-origin:44px 96px">
    <path d="M44 96 q-12 -18 -6 -34 q9 -8 17 2 q3 18 -2 32 Z" fill="url(#mk-1-__ID__)" stroke="#b9b1a4" stroke-width="2"/>
    <circle cx="46" cy="60" r="10" fill="url(#mk-1-__ID__)" stroke="#b9b1a4" stroke-width="2"/>
    <path d="M41 53 v6 M46 52 v7 M51 54 v5" stroke="#c9c1b4" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="49" cy="66" rx="5" ry="3.6" fill="#f0a04b" opacity=".7"/>
  </g>
  <path d="M38 138 q27 10 54 0 q-4 12 -27 12 t-27 -12 Z" fill="url(#mk-1-__ID__)" stroke="#b9b1a4" stroke-width="2"/>
  <circle cx="65" cy="92" r="30" fill="url(#mk-1-__ID__)" stroke="#b9b1a4" stroke-width="2"/>
  <path d="M65 62 l-13 -12 q-3 14 3 18 Z" fill="url(#mk-1-__ID__)" stroke="#b9b1a4" stroke-width="2"/>
  <path d="M65 62 l13 -12 q3 14 -3 18 Z" fill="url(#mk-1-__ID__)" stroke="#b9b1a4" stroke-width="2"/>
  <path d="M56 66 l-8 -10 q-2 9 2 12 Z" fill="#e8a0a0"/>
  <path d="M74 66 l8 -10 q2 9 -2 12 Z" fill="#e8a0a0"/>
  <path d="M40 78 q14 -12 25 -4 q-6 14 -25 4 Z" fill="#f0a04b" opacity=".75"/>
  <path d="M90 78 q-14 -12 -25 -4 q6 14 25 4 Z" fill="#4a4a4a" opacity=".55"/>
  <path d="M51 84 q5 -4 9 0" stroke="#2b2b2b" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M70 84 q5 -4 9 0" stroke="#2b2b2b" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M65 90 q-4 3 0 5 q4 -2 0 -5" fill="#d97b7b"/>
  <path d="M65 95 q-6 6 -11 2 M65 95 q6 6 11 2" stroke="#2b2b2b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M40 92 h-12 M40 97 h-13 M90 92 h12 M90 97 h13" stroke="#c9c1b4" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M37 104 q28 8 56 0" stroke="#c0392b" stroke-width="6" fill="none" stroke-linecap="round"/>
  <circle cx="65" cy="110" r="6" fill="url(#mk-2-__ID__)" stroke="#9a7420" stroke-width="1.4"/>
  <path d="M62 110 h6" stroke="#9a7420" stroke-width="1.2"/>
</svg>`,
  ritual(root, api) {
    const paw = parts(root, 'paw')[0];
    api.play('chirp');
    // Three beckons, each a little weaker — like a battery cat winding down.
    const seq = [0, -26, -4, -22, -4, -15, -3, -8, 0];
    anim(paw, seq.map((r) => ({ transform: `rotate(${r}deg)` })),
      { duration: 2100, easing: 'ease-in-out' });
    api.floater('come here, luck');
  },
};

const horseshoe = {
  id: 'horseshoe',
  name: 'Horseshoe',
  origin: 'Europe and the Americas',
  plaque: 'Hung points up so the luck stays put.',
  ritualName: 'Flick it',
  hint: 'Give it a flick',
  sound: 'bonk',
  accent: '#8d93a1',
  sway: 0.9,
  weight: 10,
  art: `
<svg class="charm-art" viewBox="0 0 130 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="hs-1-__ID__" x1="0" y1="0" x2="1" y2=".3">
      <stop offset="0" stop-color="#4b505c"/><stop offset=".28" stop-color="#b9c0cc"/>
      <stop offset=".55" stop-color="#6e7481"/><stop offset=".8" stop-color="#d5dae2"/><stop offset="1" stop-color="#41454f"/>
    </linearGradient>
  </defs>
  <path d="M65 0 V30" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <g data-part="shoe">
    <path d="M30 66 q0 -34 35 -34 t35 34 q0 20 -8 38 q-6 14 -8 22 q-9 4 -19 4 t-19 -4 q-2 -8 -8 -22 q-8 -18 -8 -38 Z"
          fill="none" stroke="url(#hs-1-__ID__)" stroke-width="15" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M30 66 q0 -34 35 -34 t35 34 q0 20 -8 38 q-6 14 -8 22 q-9 4 -19 4 t-19 -4 q-2 -8 -8 -22 q-8 -18 -8 -38 Z"
          fill="none" stroke="#2f333c" stroke-width="1.4" stroke-linejoin="round" opacity=".45"/>
    <g fill="#20242c">
      <circle cx="34" cy="62" r="2.4"/><circle cx="41" cy="44" r="2.4"/><circle cx="57" cy="34" r="2.4"/>
      <circle cx="73" cy="34" r="2.4"/><circle cx="89" cy="44" r="2.4"/><circle cx="96" cy="62" r="2.4"/>
      <circle cx="65" cy="120" r="2.4"/>
    </g>
    <circle cx="46" cy="50" r="4" fill="#ffffff" opacity=".25"/>
    <path d="M52 36 q16 -5 26 2" stroke="#ffffff" stroke-width="3" fill="none" opacity=".3" stroke-linecap="round"/>
  </g>
  <path d="M56 30 q9 7 18 0" stroke="#c9ced9" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`,
  ritual(root, api) {
    const shoe = parts(root, 'shoe')[0];
    api.play('bonk');
    anim(shoe, [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(16deg)' }, { transform: 'rotate(-14deg)' },
      { transform: 'rotate(9deg)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(0deg)' },
    ], { duration: 1300, easing: 'ease-in-out' });
  },
};

const scarab = {
  id: 'scarab',
  name: 'Scarab',
  origin: 'Ancient Egypt',
  plaque: 'An amulet for renewal and new beginnings.',
  ritualName: 'Spread wings',
  hint: 'Spread the wings',
  sound: 'sparkle',
  accent: '#2fa8a0',
  sway: 0.85,
  weight: 9,
  art: `
<svg class="charm-art" viewBox="0 0 160 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="sc-1-__ID__" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7fe3d4"/><stop offset=".5" stop-color="#2fa8a0"/><stop offset="1" stop-color="#14706f"/>
    </linearGradient>
    <linearGradient id="sc-2-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffe9a3"/><stop offset=".5" stop-color="#d9a72c"/><stop offset="1" stop-color="#8a6510"/>
    </linearGradient>
  </defs>
  <path d="M80 0 V26" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <g data-part="wingL" style="transform-box:view-box;transform-origin:80px 80px">
    <path d="M80 76 q-34 -22 -62 -6 q-8 20 4 34 q30 12 58 -8 Z" fill="url(#sc-2-__ID__)" stroke="#7d5c14" stroke-width="2"/>
    <path d="M74 80 q-26 -12 -48 -2 M72 92 q-24 4 -44 -4 M76 104 q-20 10 -38 6" stroke="#7d5c14" stroke-width="1.5" fill="none" opacity=".7"/>
    <circle cx="34" cy="78" r="4" fill="#2fa8a0" stroke="#7d5c14" stroke-width="1.2"/>
    <circle cx="46" cy="94" r="4" fill="#c0392b" stroke="#7d5c14" stroke-width="1.2"/>
  </g>
  <g data-part="wingR" style="transform-box:view-box;transform-origin:80px 80px">
    <path d="M80 76 q34 -22 62 -6 q8 20 -4 34 q-30 12 -58 -8 Z" fill="url(#sc-2-__ID__)" stroke="#7d5c14" stroke-width="2"/>
    <path d="M86 80 q26 -12 48 -2 M88 92 q24 4 44 -4 M84 104 q20 10 38 6" stroke="#7d5c14" stroke-width="1.5" fill="none" opacity=".7"/>
    <circle cx="126" cy="78" r="4" fill="#2fa8a0" stroke="#7d5c14" stroke-width="1.2"/>
    <circle cx="114" cy="94" r="4" fill="#c0392b" stroke="#7d5c14" stroke-width="1.2"/>
  </g>
  <g data-part="body">
    <ellipse cx="80" cy="92" rx="26" ry="34" fill="url(#sc-1-__ID__)" stroke="#0d4f4f" stroke-width="2.2"/>
    <path d="M80 60 v66" stroke="#0d4f4f" stroke-width="1.6" opacity=".55"/>
    <path d="M58 78 q22 6 44 0 M56 96 q24 6 48 0" stroke="#0d4f4f" stroke-width="1.3" fill="none" opacity=".45"/>
    <ellipse cx="80" cy="62" rx="16" ry="12" fill="url(#sc-1-__ID__)" stroke="#0d4f4f" stroke-width="2"/>
    <path d="M68 54 q-10 -8 -14 -4 M92 54 q10 -8 14 -4" stroke="#0d4f4f" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="70" cy="80" rx="7" ry="9" fill="#ffffff" opacity=".2"/>
    <path d="M64 118 l-6 12 M80 122 v12 M96 118 l6 12" stroke="url(#sc-1-__ID__)" stroke-width="4" stroke-linecap="round"/>
    <circle cx="80" cy="74" r="5" fill="#d9a72c" stroke="#7d5c14" stroke-width="1.2"/>
  </g>
</svg>`,
  ritual(root, api) {
    const wl = parts(root, 'wingL')[0];
    const wr = parts(root, 'wingR')[0];
    api.play('sparkle');
    const open = [
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-13deg)' },
      { transform: 'rotate(-4deg)' }, { transform: 'rotate(0deg)' },
    ];
    const openR = [
      { transform: 'rotate(0deg)' }, { transform: 'rotate(13deg)' },
      { transform: 'rotate(4deg)' }, { transform: 'rotate(0deg)' },
    ];
    anim(wl, open, { duration: 1700, easing: 'cubic-bezier(.3,1.3,.4,1)' });
    anim(wr, openR, { duration: 1700, easing: 'cubic-bezier(.3,1.3,.4,1)' });
    api.floater('renewed');
  },
};

const himmeli = {
  id: 'himmeli',
  name: 'Himmeli',
  origin: 'Finland',
  plaque: 'A rye-straw geometry for abundance and a fruitful flow of work.',
  ritualName: 'Set it turning',
  hint: 'Set it turning',
  sound: 'sparkle',
  accent: '#d9b45a',
  sway: 1.2,
  weight: 6,
  art: `
<svg class="charm-art" viewBox="0 0 140 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="hi-1-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6e3a8"/><stop offset=".5" stop-color="#d9b45a"/><stop offset="1" stop-color="#96742a"/>
    </linearGradient>
  </defs>
  <path d="M70 0 V34" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <g data-part="rig" style="transform-box:view-box;transform-origin:70px 100px" stroke="url(#hi-1-__ID__)" stroke-width="3.4" stroke-linejoin="round" fill="none" stroke-linecap="round">
    <path d="M70 40 L34 76 L70 100 L106 76 Z" fill="#f6e3a8" fill-opacity=".13"/>
    <path d="M70 40 L34 76 L70 156 L106 76 Z" fill="#f6e3a8" fill-opacity=".1"/>
    <path d="M34 76 L70 100 L106 76 L70 156 Z" fill="#d9b45a" fill-opacity=".1"/>
    <path d="M70 100 L34 76 M70 100 L106 76 M70 100 L70 40 M70 100 L70 156"/>
    <path d="M70 40 L70 100 M34 76 L70 100 M106 76 L70 100 M70 156 L70 100"/>
    <path d="M34 76 L70 156 M106 76 L70 156 M34 76 L106 76"/>
    <path d="M70 40 L34 76 L70 156 L106 76 Z" stroke-width="2.6"/>
    <path d="M70 40 L106 76 L70 156 L34 76 Z" stroke-width="2.6"/>
    <path d="M70 76 L58 92 L70 108 L82 92 Z" fill="#f6e3a8" fill-opacity=".22" stroke-width="2.2"/>
    <circle cx="70" cy="40" r="4.5" fill="#f6e3a8" stroke="none"/>
    <circle cx="34" cy="76" r="3.6" fill="#f6e3a8" stroke="none"/>
    <circle cx="106" cy="76" r="3.6" fill="#f6e3a8" stroke="none"/>
    <circle cx="70" cy="156" r="3.6" fill="#f6e3a8" stroke="none"/>
    <circle cx="70" cy="100" r="3" fill="#fff6d8" stroke="none"/>
  </g>
</svg>`,
  ritual(root, api) {
    const rig = parts(root, 'rig')[0];
    api.play('sparkle');
    anim(rig, [
      { transform: 'perspective(600px) rotateY(0deg)' },
      { transform: 'perspective(600px) rotateY(360deg)' },
    ], { duration: 2400, easing: 'cubic-bezier(.35,.05,.2,1)' });
    api.floater('abundance');
  },
};

/* ================================================================== *
 * GEN-Z DROPS
 * ================================================================== */

const boba = {
  id: 'boba',
  name: 'Boba',
  origin: 'Taiwan, by way of everywhere',
  plaque: 'Milk tea with seven pearls. Slurp it for a small reset.',
  ritualName: 'Slurp',
  hint: 'Take a slurp',
  sound: 'slurp',
  accent: '#c99a6e',
  sway: 0.95,
  weight: 8,
  art: `
<svg class="charm-art" viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="bb-1-__ID__" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f3e6d4" stop-opacity=".55"/><stop offset=".45" stop-color="#ffffff" stop-opacity=".32"/><stop offset="1" stop-color="#d9c3a5" stop-opacity=".5"/>
    </linearGradient>
    <linearGradient id="bb-2-__ID__" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e8d3b6"/><stop offset=".45" stop-color="#c99a6e"/><stop offset="1" stop-color="#8b5e3c"/>
    </linearGradient>
    <clipPath id="bb-c-__ID__"><path d="M30 52 h60 l-7 112 q-1 8 -9 8 h-28 q-8 0 -9 -8 Z"/></clipPath>
  </defs>
  <path d="M60 0 V22" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <g data-part="straw" style="transform-box:view-box;transform-origin:64px 46px">
    <path d="M62 22 h12 l-4 44 h-12 Z" fill="#e2603f" stroke="#9c3a20" stroke-width="1.8"/>
    <path d="M64 30 h8 M63 40 h9" stroke="#ffffff" stroke-width="2" opacity=".55"/>
    <ellipse cx="68" cy="22" rx="6" ry="2.6" fill="#9c3a20"/>
  </g>
  <rect x="26" y="44" width="68" height="14" rx="7" fill="#f0e2cd" stroke="#b99a78" stroke-width="1.8"/>
  <path d="M30 52 h60 l-7 112 q-1 8 -9 8 h-28 q-8 0 -9 -8 Z" fill="url(#bb-1-__ID__)" stroke="#b99a78" stroke-width="2"/>
  <g clip-path="url(#bb-c-__ID__)">
    <path d="M28 74 h64 v90 h-64 Z" fill="url(#bb-2-__ID__)"/>
    <path d="M28 74 q30 8 64 0 v10 q-34 8 -64 0 Z" fill="#f0e2cd" opacity=".85"/>
    <ellipse cx="42" cy="88" rx="9" ry="4" fill="#ffffff" opacity=".25"/>
    <g data-part="pearl" fill="#2b1d16">
      <circle cx="44" cy="146" r="7.5"/><circle cx="60" cy="150" r="7.5"/><circle cx="76" cy="146" r="7.5"/>
      <circle cx="52" cy="160" r="7.5"/><circle cx="68" cy="160" r="7.5"/>
      <circle cx="38" cy="160" r="6.5"/><circle cx="82" cy="160" r="6.5"/>
    </g>
    <circle cx="42" cy="144" r="2.4" fill="#ffffff" opacity=".35"/>
    <circle cx="58" cy="148" r="2.4" fill="#ffffff" opacity=".3"/>
  </g>
  <path d="M36 62 q-3 46 -3 78" stroke="#ffffff" stroke-width="5" fill="none" opacity=".28" stroke-linecap="round"/>
  <path d="M84 62 q3 46 3 78" stroke="#8b5e3c" stroke-width="4" fill="none" opacity=".2" stroke-linecap="round"/>
</svg>`,
  ritual(root, api) {
    const straw = parts(root, 'straw')[0];
    const pearls = parts(root, 'pearl');
    api.play('slurp');
    anim(straw, [{ transform: 'translateY(0)' }, { transform: 'translateY(4px)' }, { transform: 'translateY(0)' }],
      { duration: 700, easing: 'ease-in-out' });
    pearls.forEach((p, i) => {
      anim(p, [
        { transform: 'translateY(0)' },
        { transform: `translateY(${-12 - (i % 3) * 5}px) translateX(${(i % 2 ? 4 : -4)}px)` },
        { transform: 'translateY(0)' },
      ], { duration: 760, delay: i * 45, easing: 'cubic-bezier(.3,1.5,.4,1)' });
    });
    api.floater('+1 serotonin');
    api.aura(10);
  },
};

const capybara = {
  id: 'capybara',
  name: 'Capybara',
  origin: 'South America, on the internet',
  plaque: 'In the onsen, unbothered. Nothing is that deep.',
  ritualName: 'Chill',
  hint: 'Just chill',
  sound: 'chill',
  accent: '#a9805a',
  sway: 0.8,
  weight: 10,
  art: `
<svg class="charm-art" viewBox="0 0 150 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="cp-1-__ID__" cx="38%" cy="26%" r="80%">
      <stop offset="0" stop-color="#c79a72"/><stop offset=".6" stop-color="#a9805a"/><stop offset="1" stop-color="#7a5636"/>
    </radialGradient>
    <linearGradient id="cp-2-__ID__" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8fd6e8"/><stop offset="1" stop-color="#3f9fbe"/>
    </linearGradient>
    <clipPath id="cp-tub-__ID__"><path d="M22 118 h106 l-9 44 q-1 6 -7 6 h-74 q-6 0 -7 -6 Z"/></clipPath>
  </defs>
  <path d="M75 0 V24" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <g data-part="steam" stroke="#dfe9f0" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".8">
    <path d="M48 96 q-7 -12 0 -22 q7 -10 0 -20"/>
    <path d="M75 86 q-8 -14 0 -26 q8 -12 0 -22"/>
    <path d="M102 96 q7 -12 0 -22 q-7 -10 0 -20"/>
  </g>
  <g data-part="capy">
    <ellipse cx="75" cy="88" rx="42" ry="34" fill="url(#cp-1-__ID__)" stroke="#5f4227" stroke-width="2.2"/>
    <path d="M40 60 q-8 -14 2 -18 q10 -3 12 12 Z" fill="url(#cp-1-__ID__)" stroke="#5f4227" stroke-width="2"/>
    <path d="M110 60 q8 -14 -2 -18 q-10 -3 -12 12 Z" fill="url(#cp-1-__ID__)" stroke="#5f4227" stroke-width="2"/>
    <ellipse cx="75" cy="104" rx="30" ry="22" fill="#c79a72" opacity=".55"/>
    <ellipse cx="60" cy="84" rx="5" ry="4" fill="#3b2a19"/>
    <ellipse cx="90" cy="84" rx="5" ry="4" fill="#3b2a19"/>
    <path d="M55 76 q6 -4 11 -1 M95 76 q-6 -4 -11 -1" stroke="#5f4227" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="75" cy="98" rx="9" ry="6.5" fill="#6f4c2c"/>
    <path d="M75 100 q-5 5 -9 1 M75 100 q5 5 9 1" stroke="#3b2a19" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="50" cy="96" rx="7" ry="4.5" fill="#e8a0a0" opacity=".4"/>
    <ellipse cx="100" cy="96" rx="7" ry="4.5" fill="#e8a0a0" opacity=".4"/>
    <circle cx="75" cy="52" r="11" fill="#f0b429" stroke="#b57f14" stroke-width="1.8"/>
    <path d="M75 43 q4 9 0 18" stroke="#b57f14" stroke-width="1.2" fill="none"/>
    <path d="M71 46 q8 4 8 12" stroke="#b57f14" stroke-width="1.2" fill="none"/>
  </g>
  <path d="M22 118 h106 l-9 44 q-1 6 -7 6 h-74 q-6 0 -7 -6 Z" fill="none" stroke="#8a5f36" stroke-width="7" stroke-linejoin="round"/>
  <g clip-path="url(#cp-tub-__ID__)">
    <rect x="20" y="116" width="110" height="52" fill="url(#cp-2-__ID__)"/>
    <path d="M20 124 q27 7 55 0 t55 0 v10 q-27 7 -55 0 t-55 0 Z" fill="#ffffff" opacity=".4"/>
    <path d="M32 136 q10 4 20 0 M92 140 q10 4 20 0" stroke="#ffffff" stroke-width="2" fill="none" opacity=".45"/>
  </g>
  <path d="M22 118 h106" stroke="#8a5f36" stroke-width="7" stroke-linecap="round"/>
  <path d="M28 148 h94" stroke="#6d4a29" stroke-width="4" stroke-linecap="round" opacity=".6"/>
</svg>`,
  ritual(root, api) {
    const capy = parts(root, 'capy')[0];
    const steam = parts(root, 'steam');
    api.play('chill');
    anim(capy, [
      { transform: 'translateY(0)' }, { transform: 'translateY(7px)' },
      { transform: 'translateY(5px)' },
    ], { duration: 1600, easing: 'ease-in-out' });
    steam.forEach((s, i) =>
      anim(s, [
        { opacity: 0.75, transform: 'translateY(0) scale(1)' },
        { opacity: 0, transform: 'translateY(-26px) scale(1.3)' },
      ], { duration: 1800, delay: i * 160, easing: 'ease-out' }),
    );
    api.floater('it is what it is');
  },
};

const disco = {
  id: 'disco',
  name: 'Disco ball',
  origin: 'The dancefloor',
  plaque: 'A mirrorball for the main character. Spin it and throw sparkle.',
  ritualName: 'Spin it',
  hint: 'Spin it',
  sound: 'sparkle',
  accent: '#b9c6de',
  sway: 1.15,
  weight: 9,
  art: `
<svg class="charm-art" viewBox="0 0 160 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <clipPath id="dc-c-__ID__"><circle cx="80" cy="106" r="46"/></clipPath>
    <linearGradient id="dc-1-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8f9cb5"/><stop offset="1" stop-color="#3c4459"/>
    </linearGradient>
  </defs>
  <path d="M80 0 V42" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="80" cy="46" r="6" fill="none" stroke="#c9ced9" stroke-width="2.6"/>
  <g data-part="rays" opacity="0">
    <g stroke="#fff3b0" stroke-width="2.6" stroke-linecap="round">
      <path d="M80 46 L80 12"/><path d="M80 46 L136 30"/><path d="M80 46 L24 30"/>
      <path d="M80 46 L152 74"/><path d="M80 46 L8 74"/>
      <path d="M80 46 L150 130"/><path d="M80 46 L10 130"/>
      <path d="M80 46 L118 168"/><path d="M80 46 L42 168"/><path d="M80 46 L80 182"/>
    </g>
  </g>
  <circle cx="80" cy="106" r="46" fill="url(#dc-1-__ID__)"/>
  <g clip-path="url(#dc-c-__ID__)" data-part="facets">
    <g fill="#e8eef8">
      <rect x="34" y="60" width="11" height="11"/><rect x="56" y="60" width="11" height="11"/>
      <rect x="78" y="60" width="11" height="11"/><rect x="100" y="60" width="11" height="11"/>
      <rect x="45" y="71" width="11" height="11"/><rect x="67" y="71" width="11" height="11"/>
      <rect x="89" y="71" width="11" height="11"/><rect x="111" y="71" width="11" height="11"/>
      <rect x="34" y="82" width="11" height="11"/><rect x="56" y="82" width="11" height="11"/>
      <rect x="78" y="82" width="11" height="11"/><rect x="100" y="82" width="11" height="11"/>
      <rect x="45" y="93" width="11" height="11"/><rect x="67" y="93" width="11" height="11"/>
      <rect x="89" y="93" width="11" height="11"/><rect x="111" y="93" width="11" height="11"/>
      <rect x="34" y="104" width="11" height="11"/><rect x="56" y="104" width="11" height="11"/>
      <rect x="78" y="104" width="11" height="11"/><rect x="100" y="104" width="11" height="11"/>
      <rect x="45" y="115" width="11" height="11"/><rect x="67" y="115" width="11" height="11"/>
      <rect x="89" y="115" width="11" height="11"/><rect x="111" y="115" width="11" height="11"/>
      <rect x="34" y="126" width="11" height="11"/><rect x="56" y="126" width="11" height="11"/>
      <rect x="78" y="126" width="11" height="11"/><rect x="100" y="126" width="11" height="11"/>
      <rect x="45" y="137" width="11" height="11"/><rect x="67" y="137" width="11" height="11"/>
      <rect x="89" y="137" width="11" height="11"/><rect x="111" y="137" width="11" height="11"/>
    </g>
    <g fill="#5b6b8c">
      <rect x="45" y="60" width="11" height="11"/><rect x="67" y="60" width="11" height="11"/>
      <rect x="89" y="60" width="11" height="11"/><rect x="111" y="60" width="11" height="11"/>
      <rect x="34" y="71" width="11" height="11"/><rect x="56" y="71" width="11" height="11"/>
      <rect x="78" y="71" width="11" height="11"/><rect x="100" y="71" width="11" height="11"/>
      <rect x="45" y="82" width="11" height="11"/><rect x="67" y="82" width="11" height="11"/>
      <rect x="89" y="82" width="11" height="11"/><rect x="111" y="82" width="11" height="11"/>
      <rect x="34" y="93" width="11" height="11"/><rect x="56" y="93" width="11" height="11"/>
      <rect x="78" y="93" width="11" height="11"/><rect x="100" y="93" width="11" height="11"/>
      <rect x="45" y="104" width="11" height="11"/><rect x="67" y="104" width="11" height="11"/>
      <rect x="89" y="104" width="11" height="11"/><rect x="111" y="104" width="11" height="11"/>
      <rect x="34" y="115" width="11" height="11"/><rect x="56" y="115" width="11" height="11"/>
      <rect x="78" y="115" width="11" height="11"/><rect x="100" y="115" width="11" height="11"/>
      <rect x="45" y="126" width="11" height="11"/><rect x="67" y="126" width="11" height="11"/>
      <rect x="89" y="126" width="11" height="11"/><rect x="111" y="126" width="11" height="11"/>
      <rect x="34" y="137" width="11" height="11"/><rect x="56" y="137" width="11" height="11"/>
      <rect x="78" y="137" width="11" height="11"/><rect x="100" y="137" width="11" height="11"/>
    </g>
    <rect x="34" y="93" width="11" height="11" fill="#fff3b0"/>
    <rect x="89" y="115" width="11" height="11" fill="#ffd6f0"/>
    <rect x="45" y="137" width="11" height="11" fill="#b0f0ff"/>
  </g>
  <circle cx="80" cy="106" r="46" fill="none" stroke="#232a3a" stroke-width="2"/>
  <ellipse cx="62" cy="84" rx="15" ry="10" fill="#ffffff" opacity=".22" transform="rotate(-32 62 84)"/>
  <circle cx="80" cy="106" r="46" fill="none" stroke="#ffffff" stroke-width="1" opacity=".25"/>
</svg>`,
  ritual(root, api) {
    const facets = parts(root, 'facets')[0];
    const rays = parts(root, 'rays')[0];
    api.play('sparkle');
    anim(facets, [
      { transform: 'rotate(0deg) scale(1)' },
      { transform: 'rotate(180deg) scale(1.02)' },
      { transform: 'rotate(360deg) scale(1)' },
    ], { duration: 1500, easing: 'cubic-bezier(.3,.1,.2,1)' });
    anim(rays, [
      { opacity: 0, transform: 'rotate(0deg) scale(.75)' },
      { opacity: 0.95, transform: 'rotate(24deg) scale(1)', offset: 0.25 },
      { opacity: 0.5, transform: 'rotate(48deg) scale(1.02)', offset: 0.55 },
      { opacity: 0, transform: 'rotate(80deg) scale(1.05)' },
    ], { duration: 1600, easing: 'ease-out' });
    api.floater('main character');
  },
};

const tamagotchi = {
  id: 'tamagotchi',
  name: 'Pixel pet',
  origin: '1996, and again now',
  plaque: 'A pocket creature that needs you. Feed it and it grows.',
  ritualName: 'Feed it',
  hint: 'Feed the pet',
  sound: 'chirp',
  accent: '#7ad4e8',
  sway: 1,
  weight: 8,
  art: `
<svg class="charm-art" viewBox="0 0 130 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="tg-1-__ID__" cx="36%" cy="24%" r="82%">
      <stop offset="0" stop-color="#a8e6f2"/><stop offset=".55" stop-color="#5cc4dd"/><stop offset="1" stop-color="#2b7f96"/>
    </radialGradient>
    <linearGradient id="tg-2-__ID__" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#cfe8a8"/><stop offset="1" stop-color="#9dc16a"/>
    </linearGradient>
  </defs>
  <path d="M65 0 V26" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="65" cy="30" r="5" fill="none" stroke="#c9ced9" stroke-width="2.4"/>
  <g data-part="device">
    <path d="M65 30 q42 0 42 76 q0 62 -42 62 t-42 -62 q0 -76 42 -76 Z" fill="url(#tg-1-__ID__)" stroke="#1c5f73" stroke-width="2.6"/>
    <ellipse cx="46" cy="66" rx="13" ry="22" fill="#ffffff" opacity=".3" transform="rotate(-18 46 66)"/>
    <rect x="33" y="82" width="64" height="52" rx="10" fill="#1f3d33" stroke="#16443a" stroke-width="2"/>
    <rect x="38" y="87" width="54" height="42" rx="6" fill="url(#tg-2-__ID__)"/>
    <g data-part="pet" style="transform-box:view-box;transform-origin:65px 118px">
      <g fill="#2c4a1e">
        <rect x="55" y="96" width="6" height="6"/><rect x="69" y="96" width="6" height="6"/>
        <rect x="49" y="102" width="32" height="6"/>
        <rect x="55" y="108" width="20" height="6"/>
        <rect x="61" y="114" width="8" height="6"/>
        <rect x="49" y="114" width="6" height="6"/><rect x="75" y="114" width="6" height="6"/>
      </g>
    </g>
    <g data-part="hearts" opacity="0">
      <g fill="#e2603f">
        <rect x="40" y="70" width="6" height="6"/><rect x="48" y="70" width="6" height="6"/>
        <rect x="38" y="76" width="18" height="6"/><rect x="44" y="82" width="6" height="6"/>
      </g>
      <g fill="#e2603f">
        <rect x="76" y="62" width="5" height="5"/><rect x="83" y="62" width="5" height="5"/>
        <rect x="74" y="67" width="15" height="5"/><rect x="79" y="72" width="5" height="5"/>
      </g>
    </g>
    <circle cx="48" cy="146" r="6.5" fill="#f0f4f8" stroke="#1c5f73" stroke-width="1.8"/>
    <circle cx="65" cy="149" r="6.5" fill="#f0f4f8" stroke="#1c5f73" stroke-width="1.8"/>
    <circle cx="82" cy="146" r="6.5" fill="#f0f4f8" stroke="#1c5f73" stroke-width="1.8"/>
    <path d="M65 44 q-8 6 0 12 q8 -6 0 -12" fill="#e2603f" opacity=".7"/>
  </g>
</svg>`,
  ritual(root, api) {
    const pet = parts(root, 'pet')[0];
    const hearts = parts(root, 'hearts')[0];
    const device = parts(root, 'device')[0];
    api.play('chirp');
    anim(pet, [
      { transform: 'scale(1)' }, { transform: 'scale(1.35)' },
      { transform: 'scale(1.2)' }, { transform: 'scale(1.25)' },
    ], { duration: 1400, easing: 'cubic-bezier(.3,1.7,.4,1)' });
    anim(hearts, [
      { opacity: 0, transform: 'translateY(6px) scale(.7)' },
      { opacity: 1, transform: 'translateY(0) scale(1)', offset: 0.3 },
      { opacity: 0, transform: 'translateY(-24px) scale(1.1)' },
    ], { duration: 1500, easing: 'ease-out' });
    anim(device, [
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-4deg)' },
      { transform: 'rotate(4deg)' }, { transform: 'rotate(0deg)' },
    ], { duration: 900, easing: 'ease-in-out' });
    api.floater('it grew!');
    api.aura(15);
  },
};

const esc = {
  id: 'esc',
  name: 'ESC key',
  origin: 'Every keyboard you own',
  plaque: 'The only key that has ever really helped. Press it.',
  ritualName: 'Press it',
  hint: 'Press ESC',
  sound: 'clack',
  accent: '#e8e4dc',
  sway: 1.05,
  weight: 7,
  art: `
<svg class="charm-art" viewBox="0 0 140 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="es-1-__ID__" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fdfcf9"/><stop offset="1" stop-color="#ddd8ce"/>
    </linearGradient>
    <linearGradient id="es-2-__ID__" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c9c3b7"/><stop offset="1" stop-color="#9c968a"/>
    </linearGradient>
  </defs>
  <path d="M70 0 V26" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="70" cy="30" r="5.5" fill="none" stroke="#c9ced9" stroke-width="2.4"/>
  <circle cx="70" cy="30" r="5.5" fill="none" stroke="#ffffff" stroke-width="1" opacity=".6"/>
  <g data-part="cap" style="transform-box:view-box;transform-origin:70px 60px">
    <path d="M72 34 l30 14 v16 l-62 0 v-16 Z" fill="url(#es-2-__ID__)" stroke="#7d776c" stroke-width="2" stroke-linejoin="round"/>
    <path d="M40 48 h62 v56 q0 8 -8 8 h-46 q-8 0 -8 -8 Z" fill="url(#es-2-__ID__)" stroke="#7d776c" stroke-width="2"/>
    <path d="M26 58 h88 q6 0 6 6 v50 q0 10 -10 10 h-80 q-10 0 -10 -10 v-50 q0 -6 6 -6 Z" fill="url(#es-1-__ID__)" stroke="#a39c8f" stroke-width="2"/>
    <rect x="34" y="66" width="72" height="50" rx="6" fill="none" stroke="#c9c3b7" stroke-width="2"/>
    <text x="70" y="102" text-anchor="middle" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="26" font-weight="700" fill="#6b665c" letter-spacing="1">ESC</text>
    <ellipse cx="46" cy="72" rx="12" ry="5" fill="#ffffff" opacity=".75" transform="rotate(-10 46 72)"/>
  </g>
</svg>`,
  ritual(root, api) {
    const cap = parts(root, 'cap')[0];
    api.play('clack');
    anim(cap, [
      { transform: 'translateY(0) scale(1,1)' },
      { transform: 'translateY(5px) scale(1.02,.94)' },
      { transform: 'translateY(-6px) scale(.97,1.06)' },
      { transform: 'translateY(0) scale(1,1)' },
    ], { duration: 620, easing: 'cubic-bezier(.3,1.6,.4,1)' });
    api.floater('escaped 🫡');
    api.aura(20);
  },
};

const slime = {
  id: 'slime',
  name: 'Slime',
  origin: 'The internet',
  plaque: 'A blob with no thoughts. Squish it anyway.',
  ritualName: 'Squish',
  hint: 'Squish the blob',
  sound: 'squish',
  accent: '#7fe07a',
  sway: 1.25,
  weight: 7,
  art: `
<svg class="charm-art" viewBox="0 0 140 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="sm-1-__ID__" cx="36%" cy="26%" r="82%">
      <stop offset="0" stop-color="#c8ffb8" stop-opacity=".95"/>
      <stop offset=".55" stop-color="#7fe07a" stop-opacity=".9"/>
      <stop offset="1" stop-color="#2f9c52" stop-opacity=".92"/>
    </radialGradient>
  </defs>
  <path d="M70 0 V22" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <g data-part="blob" style="transform-box:view-box;transform-origin:70px 140px">
    <path d="M70 30 q16 0 20 14 q22 6 24 40 q2 34 -12 48 q-14 12 -32 12 t-32 -12 q-14 -14 -12 -48 q2 -34 24 -40 q4 -14 20 -14 Z"
          fill="url(#sm-1-__ID__)" stroke="#256b3c" stroke-width="2.4"/>
    <ellipse cx="50" cy="72" rx="14" ry="9" fill="#ffffff" opacity=".55" transform="rotate(-24 50 72)"/>
    <ellipse cx="92" cy="98" rx="7" ry="5" fill="#ffffff" opacity=".28"/>
    <ellipse cx="56" cy="96" rx="6" ry="7" fill="#1d3a26"/>
    <ellipse cx="86" cy="96" rx="6" ry="7" fill="#1d3a26"/>
    <circle cx="58" cy="93" r="2.2" fill="#ffffff"/>
    <circle cx="88" cy="93" r="2.2" fill="#ffffff"/>
    <path d="M60 112 q10 9 21 0" stroke="#1d3a26" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="47" cy="108" rx="6" ry="4" fill="#ff9ec4" opacity=".45"/>
    <ellipse cx="95" cy="108" rx="6" ry="4" fill="#ff9ec4" opacity=".45"/>
    <path d="M22 118 q-6 12 2 16 M118 118 q6 12 -2 16" stroke="#2f9c52" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
  </g>
</svg>`,
  ritual(root, api) {
    const blob = parts(root, 'blob')[0];
    api.play('squish');
    anim(blob, [
      { transform: 'scale(1,1)' },
      { transform: 'scale(1.28,.7)' },
      { transform: 'scale(.86,1.16)' },
      { transform: 'scale(1.06,.96)' },
      { transform: 'scale(1,1)' },
    ], { duration: 760, easing: 'cubic-bezier(.3,1.5,.4,1)' });
    api.floater('squish');
  },
};

const aura = {
  id: 'aura',
  name: 'Aura orb',
  origin: 'Nowhere, everywhere',
  plaque: 'You either have it or you farm it. Absorb some.',
  ritualName: 'Absorb',
  hint: 'Absorb the aura',
  sound: 'aura',
  accent: '#a06bff',
  sway: 1.1,
  weight: 6,
  art: `
<svg class="charm-art" viewBox="0 0 140 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="au-1-__ID__" cx="34%" cy="28%" r="80%">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".28" stop-color="#e3b8ff"/>
      <stop offset=".62" stop-color="#a06bff"/><stop offset="1" stop-color="#3d1a8f"/>
    </radialGradient>
    <filter id="au-g-__ID__" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="7" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <path d="M70 0 V30" stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round"/>
  <g data-part="ring2" style="transform-box:view-box;transform-origin:70px 100px">
    <ellipse cx="70" cy="100" rx="50" ry="15" fill="none" stroke="#e3b8ff" stroke-width="2" opacity=".55"/>
  </g>
  <g data-part="ring1" style="transform-box:view-box;transform-origin:70px 100px">
    <ellipse cx="70" cy="100" rx="34" ry="52" fill="none" stroke="#ffffff" stroke-width="2" opacity=".4"/>
  </g>
  <g data-part="orb">
    <circle cx="70" cy="102" r="34" fill="url(#au-1-__ID__)" filter="url(#au-g-__ID__)"/>
    <circle cx="70" cy="102" r="34" fill="none" stroke="#2a0f6b" stroke-width="1.6" opacity=".5"/>
    <ellipse cx="58" cy="86" rx="11" ry="7" fill="#ffffff" opacity=".8" transform="rotate(-28 58 86)"/>
    <circle cx="84" cy="118" r="4" fill="#ffffff" opacity=".5"/>
  </g>
  <g data-part="sparks" fill="#ffffff">
    <circle cx="30" cy="62" r="2.6"/><circle cx="112" cy="72" r="2.2"/>
    <circle cx="40" cy="146" r="2"/><circle cx="104" cy="142" r="2.6"/>
  </g>
</svg>`,
  ritual(root, api) {
    const orb = parts(root, 'orb')[0];
    const r1 = parts(root, 'ring1')[0];
    const r2 = parts(root, 'ring2')[0];
    const sparks = parts(root, 'sparks')[0];
    api.play('aura');
    const gain = [15, 25, 40, 60, 100][Math.floor(Math.random() * 5)];
    api.aura(gain);
    anim(orb, [
      { transform: 'scale(1)' }, { transform: 'scale(1.32)' },
      { transform: 'scale(1.12)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' },
    ], { duration: 1300, easing: 'cubic-bezier(.3,1.6,.4,1)' });
    anim(r1, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(200deg)' }], { duration: 1300, easing: 'ease-out' });
    anim(r2, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-260deg)' }], { duration: 1300, easing: 'ease-out' });
    anim(sparks, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(2.4)' }], { duration: 1000 });
    api.floater(`+${gain} aura`);
  },
};

/* ================================================================== *
 * Registry
 * ================================================================== */

export const CHARMS = [
  slinger,
  boba,
  capybara,
  disco,
  tamagotchi,
  esc,
  slime,
  aura,
  nazar,
  hamsa,
  daruma,
  maneki,
  drishti,
  scarab,
  horseshoe,
  himmeli,
  ghanta,
  panchang,
];

export const CHARM_GROUPS = [
  { title: 'The hero', ids: ['slinger'] },
  { title: 'Gen-Z drops', ids: ['boba', 'capybara', 'disco', 'tamagotchi', 'esc', 'slime', 'aura'] },
  { title: 'World charms', ids: ['nazar', 'hamsa', 'daruma', 'maneki', 'drishti', 'scarab', 'horseshoe', 'himmeli', 'ghanta', 'panchang'] },
];

const BY_ID = new Map(CHARMS.map((c) => [c.id, c]));

/**
 * Add a charm at runtime. Used by the site for the any-emoji and photo charms,
 * where the artwork cannot exist until the visitor provides one.
 */
export function registerCharm(charm) {
  if (BY_ID.has(charm.id)) {
    const i = CHARMS.findIndex((c) => c.id === charm.id);
    if (i >= 0) CHARMS[i] = charm;
  } else {
    CHARMS.unshift(charm);
  }
  BY_ID.set(charm.id, charm);
  return charm;
}

export function getCharm(id) {
  return BY_ID.get(id) || slinger;
}

/** Replace the `__ID__` token so several copies of one charm never share SVG ids. */
export function renderArt(charm, uid) {
  return charm.art.replaceAll('__ID__', uid);
}

/** Lighten a hex colour by `amt` percent — used by the drishti repaint ritual. */
export function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 255) + amt);
  const g = Math.min(255, ((n >> 8) & 255) + amt);
  const b = Math.min(255, (n & 255) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
