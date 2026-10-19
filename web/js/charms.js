/**
 * charms.js — the collection.
 *
 * A free, personal, local build with Book My Luck's exact charm lineup and ritual
 * set — drawn as original SVG and described in original words. Functionality is
 * matched one-for-one; nobody's artwork or copy is reproduced.
 *
 * Two rules hold this file together:
 *
 *  1. Artwork is original. Nothing here is traced, copied or derived from any
 *     existing product's assets.
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

/* ===================================================================== *
 * 1. NAZAR BONCUĞU — Hand-blown Mediterranean Cobalt Glass
 * ===================================================================== */
const nazar = {
  id: 'nazar',
  name: 'Nazar boncuğu',
  origin: 'Türkiye and the Mediterranean',
  plaque: 'Blue glass that turns the evil eye away. Give it a flick.',
  ritualName: 'Give it a flick',
  hint: 'Give it a flick',
  sound: 'glass',
  accent: '#1d4ed8',
  sway: 1,
  weight: 6,
  art: `
<svg class="charm-art" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="nz-cobalt-__ID__" cx="34%" cy="28%" r="76%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="14%" stop-color="#1d4ed8"/>
      <stop offset="48%" stop-color="#09218c"/>
      <stop offset="82%" stop-color="#041154"/>
      <stop offset="100%" stop-color="#020826"/>
    </radialGradient>
    <radialGradient id="nz-white-__ID__" cx="36%" cy="28%" r="74%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="72%" stop-color="#f8fafc"/>
      <stop offset="92%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="nz-iris-__ID__" cx="36%" cy="28%" r="74%">
      <stop offset="0%" stop-color="#bae6fd"/>
      <stop offset="28%" stop-color="#38bdf8"/>
      <stop offset="68%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>
    <radialGradient id="nz-pupil-__ID__" cx="38%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="65%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <radialGradient id="nz-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="nz-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <linearGradient id="nz-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="22%" stop-color="#fde047"/>
      <stop offset="52%" stop-color="#d97706"/>
      <stop offset="82%" stop-color="#92400e"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <filter id="nz-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="5.5" flood-color="#020826" flood-opacity="0.32"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M60 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="60" cy="9" r="2.6" fill="url(#nz-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="60" cy="17.2" r="5.6" fill="url(#nz-bead-__ID__)"/>
  <circle cx="58.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="62.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="60" cy="25.4" r="2.6" fill="url(#nz-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="60" cy="34" r="5.2" fill="none" stroke="url(#nz-gold-__ID__)" stroke-width="2.3"/>
  <!-- Polished jewelry bail mounting -->
  <path d="M56 38.5 Q60 41 64 38.5 L63 47 Q60 48.5 57 47 Z" fill="url(#nz-gold-__ID__)" stroke="#92400e" stroke-width="0.6"/>
  <circle cx="60" cy="44" r="1.2" fill="#fffbeb"/>
  <!-- The Nazar Evil Eye Glass Pendant -->
  <g data-part="bead" filter="url(#nz-shadow-__ID__)">
    <!-- Outer cobalt artisan blown-glass disc -->
    <circle cx="60" cy="98" r="45" fill="url(#nz-cobalt-__ID__)"/>
    <circle cx="60" cy="98" r="44.2" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.9"/>
    <!-- Opaque white enamel ring -->
    <circle cx="60" cy="98" r="33.5" fill="url(#nz-white-__ID__)"/>
    <!-- Aegean blue iris ring -->
    <circle cx="60" cy="98" r="23" fill="url(#nz-iris-__ID__)"/>
    <!-- Obsidian black pupil -->
    <circle cx="60" cy="98" r="11.5" fill="url(#nz-pupil-__ID__)"/>
    <!-- Specular light reflections (arched window glass glare) -->
    <path d="M40 76 C43 68 55 63 68 64 C64 68 54 71 47 77 C44 79 41 78 40 76 Z" fill="#ffffff" opacity="0.8"/>
    <circle cx="43" cy="74" r="2.4" fill="#ffffff" opacity="0.95"/>
    <ellipse cx="76" cy="120" rx="9" ry="4" fill="#60a5fa" opacity="0.3" transform="rotate(-30 76 120)"/>
    <!-- Outer glass rim bevel -->
    <circle cx="60" cy="98" r="45" fill="none" stroke="#041154" stroke-width="1.4" opacity="0.6"/>
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

/* ===================================================================== *
 * 2. MURUGAR — 24K Gold Temple Medallion with Sacred Vel & Peacock
 * ===================================================================== */
const murugar = {
  id: 'murugar',
  name: 'Murugar',
  origin: 'Tamil Nadu, South India',
  plaque: 'Tamil Om with the vel inside, hung for courage before anything hard.',
  ritualName: 'Raise the vel',
  hint: 'Raise the vel',
  sound: 'bell',
  accent: '#c9932f',
  sway: 0.9,
  weight: 9,
  art: `
<svg class="charm-art" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="mu-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="18%" stop-color="#fef08a"/>
      <stop offset="42%" stop-color="#eab308"/>
      <stop offset="70%" stop-color="#ca8a04"/>
      <stop offset="88%" stop-color="#854d0e"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <radialGradient id="mu-radial-gold-__ID__" cx="42%" cy="36%" r="72%">
      <stop offset="0%" stop-color="#fef9c3"/>
      <stop offset="40%" stop-color="#eab308"/>
      <stop offset="78%" stop-color="#a16207"/>
      <stop offset="100%" stop-color="#713f12"/>
    </radialGradient>
    <linearGradient id="mu-steel-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#f1f5f9"/>
      <stop offset="60%" stop-color="#cbd5e1"/>
      <stop offset="85%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <radialGradient id="mu-ruby-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#fca5a5"/>
      <stop offset="30%" stop-color="#ef4444"/>
      <stop offset="75%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#450a0a"/>
    </radialGradient>
    <radialGradient id="mu-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="mu-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <filter id="mu-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#451a03" flood-opacity="0.32"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M60 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="60" cy="9" r="2.6" fill="url(#mu-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="60" cy="17.2" r="5.6" fill="url(#mu-bead-__ID__)"/>
  <circle cx="58.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="62.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="60" cy="25.4" r="2.6" fill="url(#mu-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="60" cy="34" r="5.2" fill="none" stroke="url(#mu-gold-__ID__)" stroke-width="2.3"/>
  <!-- Ornate golden link -->
  <path d="M60 39.2 V49" stroke="url(#mu-gold-__ID__)" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="60" cy="51" r="3.6" fill="none" stroke="url(#mu-gold-__ID__)" stroke-width="2"/>
  <!-- Temple Medallion -->
  <g data-part="medallion" filter="url(#mu-shadow-__ID__)">
    <!-- Heavy cast gold rim with beaded milgrain relief -->
    <circle cx="60" cy="112" r="46" fill="url(#mu-gold-__ID__)" stroke="#78350f" stroke-width="1.5"/>
    <circle cx="60" cy="112" r="42.5" fill="none" stroke="#fffbeb" stroke-width="0.8" opacity="0.75"/>
    <circle cx="60" cy="112" r="39.5" fill="url(#mu-radial-gold-__ID__)"/>
    <!-- Beaded border ring -->
    <circle cx="60" cy="112" r="41" fill="none" stroke="#78350f" stroke-width="1.6" stroke-dasharray="1.8 2.8"/>
    <!-- Sunburst radial engravings on medallion face -->
    <path d="M60 76 V82 M60 142 V148 M24 112 H30 M90 112 H96 M34 86 L39 90 M81 134 L86 138 M34 138 L39 134 M81 90 L86 86" stroke="#92400e" stroke-width="0.9" opacity="0.4" stroke-linecap="round"/>
    <!-- Peacock feathers behind Vel -->
    <g data-part="peacock" style="transform-box:view-box;transform-origin:60px 145px">
      <!-- Emerald & sapphire feather fans -->
      <path d="M38 142 Q30 115 40 100" stroke="#059669" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      <path d="M48 144 Q44 110 50 94" stroke="#059669" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      <path d="M60 145 Q60 108 60 90" stroke="#059669" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M72 144 Q76 110 70 94" stroke="#059669" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      <path d="M82 142 Q90 115 80 100" stroke="#059669" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      <!-- Iridescent peacock feather eye cabochons -->
      <ellipse cx="40" cy="100" rx="3.5" ry="4.5" fill="#1d4ed8" stroke="#fde047" stroke-width="0.9"/>
      <ellipse cx="50" cy="94" rx="3.5" ry="4.5" fill="#1d4ed8" stroke="#fde047" stroke-width="0.9"/>
      <ellipse cx="60" cy="90" rx="4" ry="5.2" fill="#ef4444" stroke="#fde047" stroke-width="1"/>
      <ellipse cx="70" cy="94" rx="3.5" ry="4.5" fill="#1d4ed8" stroke="#fde047" stroke-width="0.9"/>
      <ellipse cx="80" cy="100" rx="3.5" ry="4.5" fill="#1d4ed8" stroke="#fde047" stroke-width="0.9"/>
    </g>
    <!-- Sacred Tamil Om Glyph (sculpted vector relief, immune to missing fonts) -->
    <g transform="translate(60, 116) scale(0.72) translate(-60, -116)">
      <!-- Deep shadow relief -->
      <path d="M43 125 C39 122 37 117 37 111 C37 101 44 94 53 94 C61 94 67 98 70 104 C73 99 79 96 85 96 C93 96 98 101 98 108 C98 116 91 123 81 128 C74 132 64 135 55 135 C45 135 39 130 39 123 C39 119 42 116 46 116 C50 116 53 119 53 123 C53 125 51 127 49 128 C51 129 53 129 56 129 C65 129 74 125 79 120 C85 115 88 111 88 107 C88 103 85 101 81 101 C76 101 72 104 69 109 L64 116 L61 110 C58 104 54 100 49 100 C43 100 39 105 39 112 C39 117 41 121 44 123 Z" fill="#713f12"/>
      <!-- Golden highlighted face of Tamil Om -->
      <path d="M44 123 C40 120 38 116 38 110 C38 102 44 95 52 95 C59 95 65 99 68 105 C71 100 77 97 83 97 C90 97 95 101 95 107 C95 114 89 121 80 126 C73 130 64 133 55 133 C46 133 41 128 41 122 C41 118 44 115 48 115 C51 115 54 118 54 121 C54 123 53 125 51 126 C53 127 55 127 57 127 C65 127 73 123 78 119 C84 114 86 110 86 106 C86 103 84 101 80 101 C76 101 72 104 70 108 L64 115 L62 109 C59 104 55 101 50 101 C44 101 41 105 41 111 C41 115 43 119 45 121 Z" fill="url(#mu-gold-__ID__)"/>
      <circle cx="78" cy="90" r="3.2" fill="url(#mu-gold-__ID__)" stroke="#713f12" stroke-width="0.8"/>
    </g>
    <!-- Sacred Vel (Spear of Courage) -->
    <g data-part="vel">
      <!-- Steel spear shaft with golden reflections -->
      <path d="M28 178 L88 64" stroke="url(#mu-steel-__ID__)" stroke-width="4.2" stroke-linecap="round"/>
      <path d="M28 178 L88 64" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
      <!-- Vel Leaf-shaped Spearhead -->
      <g transform="translate(90, 60) rotate(32)">
        <!-- Outer double-edged blade -->
        <path d="M0 -24 C9 -14 13 -4 13 8 C13 14 10 18 0 20 C-10 18 -13 14 -13 8 C-13 -4 -9 -14 0 -24 Z" fill="url(#mu-steel-__ID__)" stroke="#334155" stroke-width="1.2"/>
        <!-- Inner chamfered facet highlight -->
        <path d="M0 -22 C6 -13 9 -4 9 7 C9 12 7 15 0 17 Z" fill="#ffffff" opacity="0.45"/>
        <!-- Central spine ridge -->
        <path d="M0 -22 V18" stroke="#475569" stroke-width="1.2"/>
        <!-- 24K Gold filigree ferrule -->
        <ellipse cx="0" cy="18" rx="7" ry="2.8" fill="url(#mu-gold-__ID__)" stroke="#78350f" stroke-width="0.8"/>
        <!-- Faceted ruby gemstone cabochon -->
        <circle cx="0" cy="6" r="3.4" fill="url(#mu-ruby-__ID__)" stroke="#78350f" stroke-width="0.8"/>
        <circle cx="-1" cy="4.8" r="1.1" fill="#ffffff" opacity="0.9"/>
      </g>
      <!-- Vel Golden Lotus Pommel Base -->
      <circle cx="28" cy="178" r="5.2" fill="url(#mu-gold-__ID__)" stroke="#78350f" stroke-width="1.2"/>
      <circle cx="27" cy="176.5" r="1.6" fill="#fffbeb" opacity="0.8"/>
    </g>
  </g>
</svg>`,
  ritual(root, api) {
    const vel = parts(root, 'vel')[0];
    const fan = parts(root, 'peacock')[0];
    api.play('bell');
    anim(vel, [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-7px)' },
      { transform: 'translateY(-2px)' },
      { transform: 'translateY(0)' },
    ], { duration: 900, easing: 'cubic-bezier(.3,1.5,.4,1)' });
    anim(fan, [
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-6deg)' },
      { transform: 'rotate(4deg)' }, { transform: 'rotate(0deg)' },
    ], { duration: 1000, easing: 'ease-in-out' });
    api.floater('vel raised');
  },
};

/* ===================================================================== *
 * 3. KARUPPU — Antique Black Bronze Guardian with Damascus Aruval
 * ===================================================================== */
const karuppu = {
  id: 'karuppu',
  name: 'Karuppu',
  origin: 'Tamil Nadu, South India',
  plaque: 'A guardian of the crossroads, dark as his name, kept close.',
  ritualName: 'Give it a gentle sway',
  hint: 'Give it a gentle sway',
  sound: 'chill',
  accent: '#6b6258',
  sway: 0.8,
  weight: 10,
  art: `
<svg class="charm-art" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="ka-bronze-__ID__" cx="38%" cy="26%" r="80%">
      <stop offset="0%" stop-color="#4a3f35"/>
      <stop offset="38%" stop-color="#2a221b"/>
      <stop offset="78%" stop-color="#17120e"/>
      <stop offset="100%" stop-color="#080605"/>
    </radialGradient>
    <linearGradient id="ka-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="25%" stop-color="#fde047"/>
      <stop offset="58%" stop-color="#d97706"/>
      <stop offset="85%" stop-color="#92400e"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <linearGradient id="ka-steel-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="28%" stop-color="#e2e8f0"/>
      <stop offset="62%" stop-color="#94a3b8"/>
      <stop offset="90%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <radialGradient id="ka-ruby-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="50%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </radialGradient>
    <radialGradient id="ka-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="ka-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <filter id="ka-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="5.5" flood-color="#080605" flood-opacity="0.38"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M60 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="60" cy="9" r="2.6" fill="url(#ka-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="60" cy="17.2" r="5.6" fill="url(#ka-bead-__ID__)"/>
  <circle cx="58.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="62.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="60" cy="25.4" r="2.6" fill="url(#ka-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="60" cy="34" r="5.2" fill="none" stroke="url(#ka-gold-__ID__)" stroke-width="2.3"/>
  <!-- Guardian Figure in Antique Panchaloha Bronze -->
  <g data-part="figure" filter="url(#ka-shadow-__ID__)" style="transform-box:view-box;transform-origin:60px 42px">
    <!-- Golden Kireetam (Warrior Crown) -->
    <path d="M42 45 L50 34 L60 28 L70 34 L78 45 Z" fill="url(#ka-gold-__ID__)" stroke="#78350f" stroke-width="1.2"/>
    <ellipse cx="60" cy="38" rx="3.2" ry="4" fill="url(#ka-ruby-__ID__)"/>
    <rect x="40" y="44" width="40" height="3.5" rx="1.5" fill="url(#ka-gold-__ID__)" stroke="#78350f" stroke-width="0.8"/>
    <!-- Head in antique panchaloha bronze -->
    <path d="M60 46 C36 46 32 64 32 82 C32 104 46 122 60 122 C74 122 88 104 88 82 C88 64 84 46 60 46 Z" fill="url(#ka-bronze-__ID__)" stroke="#080605" stroke-width="1.6"/>
    <!-- Kundalam (Heavy Gold Hoop Earrings) -->
    <circle cx="31" cy="78" r="6" fill="none" stroke="url(#ka-gold-__ID__)" stroke-width="2"/>
    <circle cx="89" cy="78" r="6" fill="none" stroke="url(#ka-gold-__ID__)" stroke-width="2"/>
    <!-- Forehead Vibhuti & Kumkum Tilak -->
    <path d="M48 54 H72 M49 57 H71" stroke="#f1f5f9" stroke-width="1.4" stroke-linecap="round" opacity="0.85"/>
    <ellipse cx="60" cy="62" rx="2.5" ry="3.5" fill="#dc2626"/>
    <circle cx="60" cy="62" r="1" fill="#fde047"/>
    <!-- Piercing Silver-White Eyes -->
    <ellipse cx="46" cy="69" rx="6.5" ry="5.5" fill="#ffffff" stroke="#080605" stroke-width="1.2"/>
    <ellipse cx="74" cy="69" rx="6.5" ry="5.5" fill="#ffffff" stroke="#080605" stroke-width="1.2"/>
    <circle cx="47" cy="69" r="2.8" fill="#080605"/>
    <circle cx="73" cy="69" r="2.8" fill="#080605"/>
    <circle cx="48" cy="68" r="0.9" fill="#ffffff"/>
    <circle cx="74" cy="68" r="0.9" fill="#ffffff"/>
    <!-- Majestic Curling Warrior Mustache -->
    <path d="M60 84 C52 79 38 78 28 88 C36 93 48 88 60 86 C72 88 84 93 92 88 C82 78 68 79 60 84 Z" fill="#080605" stroke="#26201b" stroke-width="1"/>
    <path d="M30 87 Q45 83 60 85 Q75 83 90 87" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" fill="none"/>
    <!-- Full Black Beard & Chin Contour -->
    <path d="M42 94 C46 112 54 118 60 118 C66 118 74 112 78 94 Z" fill="#120e0c" stroke="#080605" stroke-width="1"/>
    <!-- Golden Royal Neck Torque / Armor -->
    <path d="M38 120 Q60 134 82 120 L84 134 Q60 152 36 134 Z" fill="url(#ka-gold-__ID__)" stroke="#78350f" stroke-width="1.2"/>
    <circle cx="60" cy="134" r="2.8" fill="url(#ka-ruby-__ID__)"/>
  </g>
  <!-- The Sacred Aruval (Damascus Curved Machete) -->
  <g data-part="sickle" style="transform-box:view-box;transform-origin:94px 80px">
    <!-- Forged Steel Curved Blade -->
    <path d="M92 70 C114 62 118 84 112 96 C105 110 88 112 78 100 C86 98 94 94 98 84 C100 78 96 74 92 70 Z" fill="url(#ka-steel-__ID__)" stroke="#334155" stroke-width="1.2"/>
    <path d="M94 72 C110 66 115 82 110 93" stroke="#ffffff" stroke-width="1" fill="none" opacity="0.7"/>
    <!-- Turned Rosewood Hilt with Brass Ferrule -->
    <path d="M92 70 Q84 84 92 94" stroke="#713f12" stroke-width="5.5" stroke-linecap="round" fill="none"/>
    <circle cx="92" cy="72" r="3.2" fill="url(#ka-gold-__ID__)"/>
    <circle cx="92" cy="94" r="3.6" fill="url(#ka-gold-__ID__)"/>
  </g>
</svg>`,
  ritual(root, api) {
    const figure = parts(root, 'figure')[0];
    const sickle = parts(root, 'sickle')[0];
    api.play('chill');
    anim(figure, [
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-5deg)' },
      { transform: 'rotate(4deg)' }, { transform: 'rotate(-2deg)' },
      { transform: 'rotate(0deg)' },
    ], { duration: 2200, easing: 'ease-in-out' });
    anim(sickle, [
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-9deg)' },
      { transform: 'rotate(6deg)' }, { transform: 'rotate(0deg)' },
    ], { duration: 1500, easing: 'ease-in-out' });
    api.floater('kept close');
  },
};

/* ===================================================================== *
 * 4. NIMBU-MIRCHI — 7 Glossy Chillies & Fresh Lemon Garland
 * ===================================================================== */
const nimbu = {
  id: 'nimbu',
  name: 'Nimbu-mirchi',
  origin: 'India',
  plaque: 'Seven chillies and a lime at the threshold, turning misfortune aside.',
  ritualName: 'Hang a fresh garland',
  hint: 'Hang a fresh garland',
  sound: 'wish',
  accent: '#3d9e3a',
  sway: 1,
  weight: 7,
  art: `
<svg class="charm-art" viewBox="0 0 120 215" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="nm-chili-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="20%" stop-color="#22c55e"/>
      <stop offset="60%" stop-color="#15803d"/>
      <stop offset="100%" stop-color="#052e16"/>
    </linearGradient>
    <linearGradient id="nm-wilt-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#a3a375"/>
      <stop offset="50%" stop-color="#73733c"/>
      <stop offset="100%" stop-color="#3d3d14"/>
    </linearGradient>
    <radialGradient id="nm-lemon-__ID__" cx="36%" cy="30%" r="76%">
      <stop offset="0%" stop-color="#fef9c3"/>
      <stop offset="28%" stop-color="#fde047"/>
      <stop offset="70%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </radialGradient>
    <radialGradient id="nm-wiltlemon-__ID__" cx="36%" cy="30%" r="76%">
      <stop offset="0%" stop-color="#d4c986"/>
      <stop offset="60%" stop-color="#8c7d34"/>
      <stop offset="100%" stop-color="#4d4416"/>
    </radialGradient>
    <radialGradient id="nm-coal-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#4b5563"/>
      <stop offset="50%" stop-color="#1f2937"/>
      <stop offset="100%" stop-color="#030712"/>
    </radialGradient>
    <radialGradient id="nm-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="nm-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <linearGradient id="nm-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <filter id="nm-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="4.5" flood-color="#052e16" flood-opacity="0.25"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M60 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="60" cy="9" r="2.6" fill="url(#nm-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="60" cy="17.2" r="5.6" fill="url(#nm-bead-__ID__)"/>
  <circle cx="58.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="62.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="60" cy="25.4" r="2.6" fill="url(#nm-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="60" cy="34" r="5.2" fill="none" stroke="url(#nm-gold-__ID__)" stroke-width="2.3"/>
  <!-- Central braided black cotton thread holding the garland -->
  <path d="M60 39 V170" stroke="#18181b" stroke-width="1.6" stroke-linecap="round"/>
  <!-- Fresh Garland (7 crisp chillies + plump lemon + charcoal) -->
  <g data-part="garland" filter="url(#nm-shadow-__ID__)" style="transform-box:view-box;transform-origin:60px 34px">
    <!-- Chili 1 (tilt left) -->
    <g transform="translate(60, 42) rotate(-16)">
      <path d="M0 0 C10 4 15 16 12 24 C10 18 4 12 0 4 Z" fill="url(#nm-chili-__ID__)" stroke="#052e16" stroke-width="0.8"/>
      <path d="M1 2 C6 5 9 12 7 17" stroke="rgba(255,255,255,0.55)" stroke-width="0.8" fill="none" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="2" fill="#14532d"/>
    </g>
    <!-- Chili 2 (tilt right) -->
    <g transform="translate(60, 58) rotate(15)">
      <path d="M0 0 C10 4 15 16 12 24 C10 18 4 12 0 4 Z" fill="url(#nm-chili-__ID__)" stroke="#052e16" stroke-width="0.8"/>
      <path d="M1 2 C6 5 9 12 7 17" stroke="rgba(255,255,255,0.55)" stroke-width="0.8" fill="none" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="2" fill="#14532d"/>
    </g>
    <!-- Chili 3 (tilt left) -->
    <g transform="translate(60, 74) rotate(-14)">
      <path d="M0 0 C10 4 15 16 12 24 C10 18 4 12 0 4 Z" fill="url(#nm-chili-__ID__)" stroke="#052e16" stroke-width="0.8"/>
      <path d="M1 2 C6 5 9 12 7 17" stroke="rgba(255,255,255,0.55)" stroke-width="0.8" fill="none" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="2" fill="#14532d"/>
    </g>
    <!-- Chili 4 (tilt right) -->
    <g transform="translate(60, 90) rotate(16)">
      <path d="M0 0 C10 4 15 16 12 24 C10 18 4 12 0 4 Z" fill="url(#nm-chili-__ID__)" stroke="#052e16" stroke-width="0.8"/>
      <path d="M1 2 C6 5 9 12 7 17" stroke="rgba(255,255,255,0.55)" stroke-width="0.8" fill="none" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="2" fill="#14532d"/>
    </g>
    <!-- Chili 5 (tilt left) -->
    <g transform="translate(60, 106) rotate(-15)">
      <path d="M0 0 C10 4 15 16 12 24 C10 18 4 12 0 4 Z" fill="url(#nm-chili-__ID__)" stroke="#052e16" stroke-width="0.8"/>
      <path d="M1 2 C6 5 9 12 7 17" stroke="rgba(255,255,255,0.55)" stroke-width="0.8" fill="none" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="2" fill="#14532d"/>
    </g>
    <!-- Chili 6 (tilt right) -->
    <g transform="translate(60, 122) rotate(14)">
      <path d="M0 0 C10 4 15 16 12 24 C10 18 4 12 0 4 Z" fill="url(#nm-chili-__ID__)" stroke="#052e16" stroke-width="0.8"/>
      <path d="M1 2 C6 5 9 12 7 17" stroke="rgba(255,255,255,0.55)" stroke-width="0.8" fill="none" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="2" fill="#14532d"/>
    </g>
    <!-- Chili 7 (tilt left) -->
    <g transform="translate(60, 138) rotate(-13)">
      <path d="M0 0 C10 4 15 16 12 24 C10 18 4 12 0 4 Z" fill="url(#nm-chili-__ID__)" stroke="#052e16" stroke-width="0.8"/>
      <path d="M1 2 C6 5 9 12 7 17" stroke="rgba(255,255,255,0.55)" stroke-width="0.8" fill="none" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="2" fill="#14532d"/>
    </g>
    <!-- Fresh Ripe Lemon (Nimbu) -->
    <ellipse cx="60" cy="172" rx="20" ry="16" fill="url(#nm-lemon-__ID__)" stroke="#854d0e" stroke-width="1.2"/>
    <ellipse cx="54" cy="167" rx="8" ry="4.5" fill="#ffffff" opacity="0.45" transform="rotate(-25 54 167)"/>
    <circle cx="41" cy="172" r="1.5" fill="#ca8a04"/>
    <circle cx="79" cy="172" r="1.5" fill="#ca8a04"/>
    <!-- Protective Charcoal Bead at Base -->
    <path d="M60 188 V194" stroke="#18181b" stroke-width="1.8"/>
    <ellipse cx="60" cy="201" rx="11" ry="9" fill="url(#nm-coal-__ID__)" stroke="#030712" stroke-width="0.9"/>
    <ellipse cx="57" cy="198" rx="4" ry="2.5" fill="#6b7280" opacity="0.45"/>
  </g>
  <!-- Wilted Garland (for weekly aging ritual) -->
  <g data-part="wilt" opacity="0" style="transform-box:view-box;transform-origin:60px 34px">
    <g transform="translate(60, 42) rotate(-19)"><path d="M0 0 C10 4 15 16 12 24 C10 18 4 12 0 4 Z" fill="url(#nm-wilt-__ID__)" stroke="#3d3d14" stroke-width="0.8"/></g>
    <g transform="translate(60, 58) rotate(18)"><path d="M0 0 C10 4 15 16 12 24 C10 18 4 12 0 4 Z" fill="url(#nm-wilt-__ID__)" stroke="#3d3d14" stroke-width="0.8"/></g>
    <g transform="translate(60, 74) rotate(-16)"><path d="M0 0 C10 4 15 16 12 24 C10 18 4 12 0 4 Z" fill="url(#nm-wilt-__ID__)" stroke="#3d3d14" stroke-width="0.8"/></g>
    <g transform="translate(60, 90) rotate(17)"><path d="M0 0 C10 4 15 16 12 24 C10 18 4 12 0 4 Z" fill="url(#nm-wilt-__ID__)" stroke="#3d3d14" stroke-width="0.8"/></g>
    <g transform="translate(60, 106) rotate(-18)"><path d="M0 0 C10 4 15 16 12 24 C10 18 4 12 0 4 Z" fill="url(#nm-wilt-__ID__)" stroke="#3d3d14" stroke-width="0.8"/></g>
    <g transform="translate(60, 122) rotate(16)"><path d="M0 0 C10 4 15 16 12 24 C10 18 4 12 0 4 Z" fill="url(#nm-wilt-__ID__)" stroke="#3d3d14" stroke-width="0.8"/></g>
    <g transform="translate(60, 138) rotate(-15)"><path d="M0 0 C10 4 15 16 12 24 C10 18 4 12 0 4 Z" fill="url(#nm-wilt-__ID__)" stroke="#3d3d14" stroke-width="0.8"/></g>
    <ellipse cx="60" cy="172" rx="20" ry="16" fill="url(#nm-wiltlemon-__ID__)" stroke="#4d4416" stroke-width="1.2"/>
    <ellipse cx="60" cy="201" rx="11" ry="9" fill="url(#nm-coal-__ID__)"/>
  </g>
</svg>`,
  ritual(root, api) {
    const garland = parts(root, 'garland')[0];
    const wilt = parts(root, 'wilt')[0];
    const wasFresh = root.dataset.fresh !== '0';
    root.dataset.fresh = wasFresh ? '0' : '1';
    api.play('wish');
    anim(garland, [{ opacity: 1 }, { opacity: wasFresh ? 0 : 1 }], { duration: 750, fill: 'both' });
    anim(wilt, [{ opacity: 0 }, { opacity: wasFresh ? 1 : 0 }], { duration: 750, fill: 'both' });
    api.floater(wasFresh ? 'a week goes by' : 'a fresh garland');
  },
};

/* ===================================================================== *
 * 5. DRISHTI BOMMAI — Traditional Glazed Terracotta Mask
 * ===================================================================== */
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
    <radialGradient id="dr-1-__ID__" cx="40%" cy="28%" r="80%">
      <stop offset="0%" stop-color="#ffd08a"/>
      <stop offset="60%" stop-color="#f0a04b"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </radialGradient>
    <linearGradient id="dr-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="35%" stop-color="#f59e0b"/>
      <stop offset="75%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <radialGradient id="dr-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="dr-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <filter id="dr-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#7c2d12" flood-opacity="0.32"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M70 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="70" cy="9" r="2.6" fill="url(#dr-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="70" cy="17.2" r="5.6" fill="url(#dr-bead-__ID__)"/>
  <circle cx="68.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="72.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="70" cy="25.4" r="2.6" fill="url(#dr-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="70" cy="34" r="5.2" fill="none" stroke="url(#dr-gold-__ID__)" stroke-width="2.3"/>
  <!-- Terracotta Fierce Face Mask -->
  <g data-part="face" filter="url(#dr-shadow-__ID__)">
    <!-- Sculpted mask base -->
    <path d="M34 46 C50 36 90 36 106 46 C114 74 104 106 70 128 C36 106 26 74 34 46 Z" fill="url(#dr-1-__ID__)" stroke="#7c2d12" stroke-width="2"/>
    <!-- Glaze specular highlight -->
    <path d="M42 54 C55 46 85 46 98 54 C85 58 55 58 42 54 Z" fill="#ffffff" opacity="0.3"/>
    <!-- 3-Tier Ornate Golden Crown -->
    <g data-part="crown">
      <path d="M36 42 L50 28 L70 20 L90 28 L104 42 Z" fill="url(#dr-gold-__ID__)" stroke="#78350f" stroke-width="1.2"/>
      <circle cx="70" cy="28" r="4.2" fill="#ef4444" stroke="#78350f" stroke-width="0.8"/>
      <circle cx="52" cy="34" r="3.2" fill="#0284c7" stroke="#78350f" stroke-width="0.8"/>
      <circle cx="88" cy="34" r="3.2" fill="#16a34a" stroke="#78350f" stroke-width="0.8"/>
    </g>
    <!-- Bulging Eyes with Concentric Rings -->
    <ellipse cx="50" cy="74" rx="14" ry="10" fill="#ffffff" stroke="#7c2d12" stroke-width="1.6"/>
    <ellipse cx="90" cy="74" rx="14" ry="10" fill="#ffffff" stroke="#7c2d12" stroke-width="1.6"/>
    <circle cx="50" cy="74" r="6" fill="#18181b"/>
    <circle cx="90" cy="74" r="6" fill="#18181b"/>
    <circle cx="48" cy="72" r="1.8" fill="#ffffff"/>
    <circle cx="88" cy="72" r="1.8" fill="#ffffff"/>
    <!-- Fierce Curling Obsidian Mustache -->
    <path d="M70 86 C62 82 48 80 34 92 C44 95 56 90 70 88 C84 90 96 95 106 92 C92 80 78 82 70 86 Z" fill="#18181b" stroke="#7c2d12" stroke-width="1"/>
    <!-- Protruding White Ivory Fangs -->
    <path d="M48 94 C46 104 48 112 52 114 C54 108 54 100 52 94 Z" fill="#ffffff" stroke="#7c2d12" stroke-width="1"/>
    <path d="M92 94 C94 104 92 112 88 114 C86 108 86 100 88 94 Z" fill="#ffffff" stroke="#7c2d12" stroke-width="1"/>
    <!-- Red Tongue with Gold Median Line -->
    <path d="M62 94 C62 108 65 116 70 118 C75 116 78 108 78 94 Z" fill="#dc2626" stroke="#7c2d12" stroke-width="1.2"/>
    <path d="M70 94 V116" stroke="#fde047" stroke-width="1.2"/>
    <!-- Protective Black Drishti Pottu (Dots) -->
    <circle cx="40" cy="104" r="2.4" fill="#18181b"/>
    <circle cx="100" cy="104" r="2.4" fill="#18181b"/>
    <circle cx="70" cy="122" r="2.2" fill="#18181b"/>
  </g>
</svg>`,
  async ritual(root, api) {
    const face = parts(root, 'face')[0];
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

/* ===================================================================== *
 * 6. OM — Heavy Cast Temple Brass & Lotus Medallion
 * ===================================================================== */
const om = {
  id: 'om',
  name: 'Om',
  origin: 'India',
  plaque: 'The first sound, cast in brass. Let it settle the room.',
  ritualName: 'Let it glow',
  hint: 'Let it glow',
  sound: 'wish',
  accent: '#c9932f',
  sway: 0.85,
  weight: 9,
  art: `
<svg class="charm-art" viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="om-gold-__ID__" cx="38%" cy="32%" r="75%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="55%" stop-color="#eab308"/>
      <stop offset="85%" stop-color="#a16207"/>
      <stop offset="100%" stop-color="#713f12"/>
    </radialGradient>
    <linearGradient id="om-bevel-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#fef08a"/>
      <stop offset="80%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <filter id="om-blur-__ID__" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="11"/>
    </filter>
    <radialGradient id="om-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="om-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <linearGradient id="om-ringgold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <filter id="om-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#713f12" flood-opacity="0.32"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M60 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="60" cy="9" r="2.6" fill="url(#om-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="60" cy="17.2" r="5.6" fill="url(#om-bead-__ID__)"/>
  <circle cx="58.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="62.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="60" cy="25.4" r="2.6" fill="url(#om-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="60" cy="34" r="5.2" fill="none" stroke="url(#om-ringgold-__ID__)" stroke-width="2.3"/>
  <path d="M60 39.2 V48" stroke="#a16207" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="60" cy="50" r="3.6" fill="none" stroke="url(#om-gold-__ID__)" stroke-width="2"/>
  <!-- Golden aura halo on ritual trigger -->
  <g data-part="glow" opacity="0">
    <circle cx="60" cy="108" r="52" fill="#fbbf24" filter="url(#om-blur-__ID__)"/>
  </g>
  <!-- Cast Brass Lotus Medallion -->
  <g data-part="medallion" filter="url(#om-shadow-__ID__)">
    <circle cx="60" cy="108" r="46" fill="url(#om-gold-__ID__)" stroke="#713f12" stroke-width="1.4"/>
    <circle cx="60" cy="108" r="42" fill="none" stroke="#fffbeb" stroke-width="0.8" opacity="0.7"/>
    <circle cx="60" cy="108" r="39.5" fill="none" stroke="#713f12" stroke-width="1.4" stroke-dasharray="2 3"/>
    <circle cx="60" cy="108" r="38" fill="url(#om-gold-__ID__)"/>
    <!-- Sculpted Sacred ॐ Vector Glyph with 3D chiseled facets -->
    <g transform="translate(60, 110) scale(0.85) translate(-60, -110)">
      <!-- Deep 3D drop facet -->
      <path d="M48 93 C42 93 38 98 38 104 C38 109 42 113 47 114 C40 116 36 122 36 128 C36 136 43 141 53 141 C64 141 73 134 76 126 C79 133 86 137 94 137 C97 137 99 136 101 134 L98 128 C97 129 95 129 94 129 C88 129 84 124 84 117 C84 107 92 101 100 101 L100 95 C90 95 82 101 78 109 C75 102 68 97 59 97 C57 97 54 97 52 98 C53 96 54 94 54 93 C54 87 49 84 45 84 L44 90 C46 90 48 91 48 93 Z" fill="#713f12"/>
      <!-- Gleaming golden face of ॐ -->
      <path d="M49 92 C43 92 39 97 39 103 C39 108 43 112 48 113 C41 115 37 121 37 127 C37 135 44 140 54 140 C65 140 74 133 77 125 C80 132 87 136 95 136 C98 136 100 135 102 133 L99 127 C98 128 96 128 95 128 C89 128 85 123 85 116 C85 106 93 100 101 100 L101 94 C91 94 83 100 79 108 C76 101 69 96 60 96 C58 96 55 96 53 97 C54 95 55 93 55 92 C55 86 50 83 46 83 L45 89 C47 89 49 90 49 92 Z" fill="url(#om-bevel-__ID__)"/>
      <!-- Chandrabindu (crescent and pearl bindu) -->
      <path d="M72 84 C77 89 87 89 92 84 C88 86 76 86 72 84 Z" fill="url(#om-bevel-__ID__)" stroke="#713f12" stroke-width="0.8"/>
      <circle cx="82" cy="79" r="2.8" fill="#fffbeb" stroke="#713f12" stroke-width="0.8"/>
    </g>
    <!-- Glass/mirror shine arc -->
    <path d="M40 84 C48 76 72 76 80 84" stroke="#ffffff" stroke-width="1.8" fill="none" opacity="0.4" stroke-linecap="round"/>
  </g>
</svg>`,
  ritual(root, api) {
    const glow = parts(root, 'glow')[0];
    api.play('wish');
    anim(glow, [
      { opacity: 0 }, { opacity: 0.95, offset: 0.35 },
      { opacity: 0.5, offset: 0.62 }, { opacity: 0.95, offset: 0.82 },
      { opacity: 0 },
    ], { duration: 2400, easing: 'ease-in-out' });
    api.floater('let it glow');
  },
};

/* ===================================================================== *
 * 7. GHANTA — Polished Bell Metal Temple Bell with Solid Clapper
 * ===================================================================== */
const ghanta = {
  id: 'ghanta',
  name: 'Ghanta',
  origin: 'India',
  plaque: 'A temple bell rung to clear the air before something matters.',
  ritualName: 'Ring it',
  hint: 'Ring the bell',
  sound: 'bell',
  accent: '#c9932f',
  sway: 0.85,
  weight: 8,
  art: `
<svg class="charm-art" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="gh-brass-1-__ID__" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#713f12"/>
      <stop offset="18%" stop-color="#fde047"/>
      <stop offset="48%" stop-color="#ca8a04"/>
      <stop offset="78%" stop-color="#fffbeb"/>
      <stop offset="100%" stop-color="#713f12"/>
    </linearGradient>
    <linearGradient id="gh-brass-2-__ID__" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="25%" stop-color="#eab308"/>
      <stop offset="70%" stop-color="#a16207"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <radialGradient id="gh-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="gh-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <linearGradient id="gh-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <filter id="gh-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="4.5" flood-color="#451a03" flood-opacity="0.3"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M60 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="60" cy="9" r="2.6" fill="url(#gh-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="60" cy="17.2" r="5.6" fill="url(#gh-bead-__ID__)"/>
  <circle cx="58.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="62.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="60" cy="25.4" r="2.6" fill="url(#gh-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="60" cy="34" r="5.2" fill="none" stroke="url(#gh-gold-__ID__)" stroke-width="2.3"/>
  <!-- Temple Bell Body -->
  <g data-part="bell" filter="url(#gh-shadow-__ID__)" style="transform-box:view-box;transform-origin:60px 38px">
    <!-- Sacred Lotus/Chakra Finial Handle -->
    <path d="M60 38 V48" stroke="url(#gh-brass-1-__ID__)" stroke-width="5" stroke-linecap="round"/>
    <circle cx="60" cy="42" r="3.8" fill="url(#gh-brass-2-__ID__)"/>
    <!-- Bell Waist & Dome -->
    <path d="M60 48 C44 50 36 72 32 86 C28 98 22 104 22 108 C42 114 78 114 98 108 C98 104 92 98 88 86 C84 72 76 50 60 48 Z" fill="url(#gh-brass-1-__ID__)" stroke="#713f12" stroke-width="1.2"/>
    <!-- Molding Rings & Decorative Grooves -->
    <ellipse cx="60" cy="62" rx="14" ry="2.2" fill="none" stroke="#451a03" stroke-width="1.2"/>
    <ellipse cx="60" cy="74" rx="20" ry="2.8" fill="none" stroke="#451a03" stroke-width="1.2"/>
    <!-- Heavy Cast Bell Mouth Rim -->
    <ellipse cx="60" cy="108" rx="38" ry="7" fill="url(#gh-brass-2-__ID__)" stroke="#451a03" stroke-width="1.2"/>
    <ellipse cx="60" cy="107" rx="36.5" ry="5.5" fill="none" stroke="#fffbeb" stroke-width="1" opacity="0.75"/>
    <ellipse cx="60" cy="109" rx="32" ry="4.5" fill="#451a03" opacity="0.65"/>
  </g>
  <!-- Solid Cast Brass Clapper -->
  <g data-part="clapper" style="transform-box:view-box;transform-origin:60px 108px">
    <path d="M60 108 V120" stroke="url(#gh-brass-2-__ID__)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="60" cy="124" r="7.5" fill="url(#gh-brass-1-__ID__)" stroke="#451a03" stroke-width="1"/>
    <circle cx="58" cy="122" r="2" fill="#fffbeb" opacity="0.8"/>
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

/* ===================================================================== *
 * 8. PEACOCK — Royal Cloisonné Enamel Peacock with Fan
 * ===================================================================== */
const peacock = {
  id: 'peacock',
  name: 'Peacock',
  origin: 'India',
  plaque: 'Feathers fanned against envy, a sign good news is on its way.',
  ritualName: 'Fan the feathers',
  hint: 'Fan the feathers',
  sound: 'sparkle',
  accent: '#2f6bff',
  sway: 0.9,
  weight: 9,
  art: `
<svg class="charm-art" viewBox="0 0 140 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="pk-sapphire-__ID__" cx="36%" cy="28%" r="76%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="25%" stop-color="#2563eb"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <linearGradient id="pk-teal-__ID__" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="40%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
    <linearGradient id="pk-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="35%" stop-color="#eab308"/>
      <stop offset="75%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
    <radialGradient id="pk-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="65%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="pk-bead-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="25%" stop-color="#3b82f6"/>
      <stop offset="70%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <filter id="pk-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#064e3b" flood-opacity="0.32"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M70 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="70" cy="9" r="2.6" fill="url(#pk-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="70" cy="17.2" r="5.6" fill="url(#pk-bead-__ID__)"/>
  <circle cx="68.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="72.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="70" cy="25.4" r="2.6" fill="url(#pk-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="70" cy="34" r="5.2" fill="none" stroke="url(#pk-gold-__ID__)" stroke-width="2.3"/>
  <!-- Cloisonné Enamel Peacock -->
  <g transform="translate(0, -22)" filter="url(#pk-shadow-__ID__)">
    <!-- Fanned Out Iridescent Plumage -->
    <g data-part="fan" style="transform-box:view-box;transform-origin:70px 126px;transform:scale(1,0.18)">
      <!-- Radiating golden feather shafts -->
      <g stroke="url(#pk-gold-__ID__)" stroke-width="2.6" stroke-linecap="round" fill="none">
        <path d="M70 152 Q20 120 16 54"/>
        <path d="M70 152 Q32 108 32 46"/>
        <path d="M70 152 Q48 102 50 40"/>
        <path d="M70 152 V36"/>
        <path d="M70 152 Q92 102 90 40"/>
        <path d="M70 152 Q108 108 108 46"/>
        <path d="M70 152 Q120 120 124 54"/>
      </g>
      <!-- Cloisonné Ocelli (Eyes of the Peacock) -->
      <g stroke="url(#pk-gold-__ID__)" stroke-width="1.2">
        <ellipse cx="16" cy="54" rx="8" ry="11" fill="url(#pk-teal-__ID__)" transform="rotate(18 16 54)"/>
        <ellipse cx="32" cy="46" rx="8" ry="11" fill="url(#pk-teal-__ID__)" transform="rotate(10 32 46)"/>
        <ellipse cx="50" cy="40" rx="8" ry="11" fill="url(#pk-teal-__ID__)" transform="rotate(5 50 40)"/>
        <ellipse cx="70" cy="36" rx="8.5" ry="11.5" fill="url(#pk-teal-__ID__)"/>
        <ellipse cx="90" cy="40" rx="8" ry="11" fill="url(#pk-teal-__ID__)" transform="rotate(-5 90 40)"/>
        <ellipse cx="108" cy="46" rx="8" ry="11" fill="url(#pk-teal-__ID__)" transform="rotate(-10 108 46)"/>
        <ellipse cx="124" cy="54" rx="8" ry="11" fill="url(#pk-teal-__ID__)" transform="rotate(-18 124 54)"/>
      </g>
      <!-- Inner Sapphire & Violet centers -->
      <g fill="url(#pk-sapphire-__ID__)">
        <ellipse cx="16" cy="55" rx="4" ry="5.5" transform="rotate(18 16 55)"/>
        <ellipse cx="32" cy="47" rx="4" ry="5.5" transform="rotate(10 32 47)"/>
        <ellipse cx="50" cy="41" rx="4" ry="5.5" transform="rotate(5 50 41)"/>
        <ellipse cx="70" cy="37" rx="4.5" ry="6"/>
        <ellipse cx="90" cy="41" rx="4" ry="5.5" transform="rotate(-5 90 41)"/>
        <ellipse cx="108" cy="47" rx="4" ry="5.5" transform="rotate(-10 108 47)"/>
        <ellipse cx="124" cy="55" rx="4" ry="5.5" transform="rotate(-18 124 55)"/>
      </g>
    </g>
    <!-- Peacock Sculpted Body & Graceful S-Neck -->
    <g data-part="body">
      <!-- Breast & Tail -->
      <ellipse cx="70" cy="154" rx="19" ry="25" fill="url(#pk-sapphire-__ID__)" stroke="#0f172a" stroke-width="1.4"/>
      <!-- S-Neck -->
      <path d="M70 134 C64 116 66 102 70 92" stroke="url(#pk-sapphire-__ID__)" stroke-width="10" stroke-linecap="round" fill="none"/>
      <!-- Noble Head & Crown Crest -->
      <circle cx="70" cy="88" r="8" fill="url(#pk-sapphire-__ID__)" stroke="#0f172a" stroke-width="1.2"/>
      <path d="M68 82 L65 74 M70 81 L70 73 M72 82 L75 74" stroke="url(#pk-gold-__ID__)" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="65" cy="74" r="1.4" fill="url(#pk-teal-__ID__)"/>
      <circle cx="70" cy="73" r="1.4" fill="url(#pk-teal-__ID__)"/>
      <circle cx="75" cy="74" r="1.4" fill="url(#pk-teal-__ID__)"/>
      <!-- Golden Beak & Sparkle Eye -->
      <path d="M64 88 L58 90 L64 92 Z" fill="url(#pk-gold-__ID__)"/>
      <circle cx="67" cy="87" r="1.4" fill="#ffffff"/>
      <circle cx="67.5" cy="87" r="0.7" fill="#0f172a"/>
    </g>
  </g>
</svg>`,
  ritual(root, api) {
    const fan = parts(root, 'fan')[0];
    const open = root.dataset.fanned !== '1';
    root.dataset.fanned = open ? '1' : '0';
    api.play('sparkle');
    anim(fan, [
      { transform: 'scale(1,0.18)' },
      { transform: 'scale(1,1)' },
    ], {
      duration: open ? 900 : 620,
      easing: 'cubic-bezier(.3,1.4,.4,1)',
      fill: 'both',
      direction: open ? 'normal' : 'reverse',
    });
    api.floater(open ? 'feathers fanned' : 'feathers folded');
  },
};

/* ===================================================================== *
 * 9. ELEPHANT — Royal Temple Elephant with Raised Blessing Trunk
 * ===================================================================== */
const elephant = {
  id: 'elephant',
  name: 'Elephant',
  origin: 'India and Southeast Asia',
  plaque: 'Trunk raised, clearing obstacles at the start of every venture.',
  ritualName: 'Give it a flick',
  hint: 'Give it a flick',
  sound: 'flick',
  accent: '#8b929e',
  sway: 0.85,
  weight: 10,
  art: `
<svg class="charm-art" viewBox="0 0 140 205" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="el-silver-__ID__" cx="36%" cy="28%" r="80%">
      <stop offset="0%" stop-color="#f1f5f9"/>
      <stop offset="35%" stop-color="#cbd5e1"/>
      <stop offset="70%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#475569"/>
    </radialGradient>
    <linearGradient id="el-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="35%" stop-color="#fde047"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <radialGradient id="el-ruby-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#fca5a5"/>
      <stop offset="50%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </radialGradient>
    <radialGradient id="el-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="el-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <filter id="el-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#334155" flood-opacity="0.3"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M70 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="70" cy="9" r="2.6" fill="url(#el-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="70" cy="17.2" r="5.6" fill="url(#el-bead-__ID__)"/>
  <circle cx="68.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="72.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="70" cy="25.4" r="2.6" fill="url(#el-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="70" cy="34" r="5.2" fill="none" stroke="url(#el-gold-__ID__)" stroke-width="2.3"/>
  <!-- Royal Elephant Sculpture in Antique Silver -->
  <g data-part="elephant" filter="url(#el-shadow-__ID__)">
    <!-- Flared Ears with Interior Shading -->
    <path d="M48 94 C30 96 24 114 26 128 C28 136 34 140 46 130 C48 116 52 104 48 94 Z" fill="url(#el-silver-__ID__)" stroke="#475569" stroke-width="1.4"/>
    <path d="M92 94 C110 96 116 114 114 128 C112 136 106 140 94 130 C92 116 88 104 92 94 Z" fill="url(#el-silver-__ID__)" stroke="#475569" stroke-width="1.4"/>
    <!-- Noble Elephant Head & Body -->
    <ellipse cx="70" cy="134" rx="36" ry="40" fill="url(#el-silver-__ID__)" stroke="#475569" stroke-width="1.6"/>
    <circle cx="70" cy="98" r="26" fill="url(#el-silver-__ID__)" stroke="#475569" stroke-width="1.6"/>
    <!-- Royal Velvet Howdah Jhool Cloth -->
    <path d="M48 116 H92 V138 Q70 144 48 138 Z" fill="url(#el-ruby-__ID__)" stroke="#78350f" stroke-width="1.2"/>
    <circle cx="70" cy="128" r="3.6" fill="url(#el-gold-__ID__)"/>
    <path d="M48 138 Q70 146 92 138" stroke="url(#el-gold-__ID__)" stroke-width="2" fill="none"/>
    <!-- Golden Nettipattam Temple Forehead Crown -->
    <path d="M60 84 Q70 78 80 84 L76 100 Q70 104 64 100 Z" fill="url(#el-gold-__ID__)" stroke="#78350f" stroke-width="1"/>
    <circle cx="70" cy="92" r="2.2" fill="url(#el-ruby-__ID__)"/>
    <!-- Polished Ivory Tusks with Gold Tips -->
    <path d="M56 104 C46 102 44 88 48 80 C50 86 54 94 58 100 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <path d="M84 104 C94 102 96 88 92 80 C90 86 86 94 82 100 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <path d="M47 84 L49 80" stroke="url(#el-gold-__ID__)" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M93 84 L91 80" stroke="url(#el-gold-__ID__)" stroke-width="2.2" stroke-linecap="round"/>
    <!-- Raised Trunk of Blessing -->
    <g data-part="trunk" style="transform-box:view-box;transform-origin:70px 102px">
      <path d="M70 102 Q70 76 78 60 Q86 42 72 38 Q64 42 70 54 Q72 74 70 102" fill="url(#el-silver-__ID__)" stroke="#475569" stroke-width="1.4"/>
      <path d="M72 44 Q80 44 76 56" stroke="rgba(255,255,255,0.6)" stroke-width="1" fill="none"/>
    </g>
    <!-- Eyes -->
    <circle cx="60" cy="94" r="2.2" fill="#0f172a"/>
    <circle cx="80" cy="94" r="2.2" fill="#0f172a"/>
    <circle cx="59.5" cy="93.5" r="0.8" fill="#ffffff"/>
    <circle cx="79.5" cy="93.5" r="0.8" fill="#ffffff"/>
  </g>
</svg>`,
  ritual(root, api) {
    const trunk = parts(root, 'trunk')[0];
    api.play('flick');
    anim(trunk, [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-12deg)' }, { transform: 'rotate(8deg)' },
      { transform: 'rotate(-4deg)' }, { transform: 'rotate(0deg)' },
    ], { duration: 1100, easing: 'ease-in-out' });
    api.floater('trunk up');
  },
};

/* ===================================================================== *
 * 10. HAMSA — Luxury Gold & Cobalt Vitreous Enamel Hand
 * ===================================================================== */
const hamsa = {
  id: 'hamsa',
  name: 'Hamsa',
  origin: 'Middle East and North Africa',
  plaque: 'The open hand, carried for protection. Flick bad luck away.',
  ritualName: 'Give it a flick',
  hint: 'Give it a flick',
  sound: 'glass',
  accent: '#1552b8',
  sway: 0.95,
  weight: 6.5,
  art: `
<svg class="charm-art" viewBox="0 0 130 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="hm-cobalt-__ID__" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="45%" stop-color="#1d4ed8"/>
      <stop offset="85%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="hm-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="28%" stop-color="#fde047"/>
      <stop offset="60%" stop-color="#d97706"/>
      <stop offset="85%" stop-color="#92400e"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <radialGradient id="hm-eye-__ID__" cx="40%" cy="35%" r="72%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </radialGradient>
    <radialGradient id="hm-iris-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="60%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <radialGradient id="hm-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="hm-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <filter id="hm-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.3"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M65 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="65" cy="9" r="2.6" fill="url(#hm-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="65" cy="17.2" r="5.6" fill="url(#hm-bead-__ID__)"/>
  <circle cx="63.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="67.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="65" cy="25.4" r="2.6" fill="url(#hm-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="65" cy="34" r="5.2" fill="none" stroke="url(#hm-gold-__ID__)" stroke-width="2.3"/>
  <!-- Ornate Golden Suspension Bar -->
  <rect x="42" y="38" width="46" height="3" rx="1.5" fill="url(#hm-gold-__ID__)"/>
  <path d="M45 40 V54 M65 40 V50 M85 40 V54" stroke="url(#hm-gold-__ID__)" stroke-width="2"/>
  <!-- Symmetrical Filigree Hamsa Hand -->
  <g data-part="hand" filter="url(#hm-shadow-__ID__)">
    <!-- Outer Heavy Gold Rim with Beveled Edge -->
    <path d="M38 60 C38 52 46 52 46 60 V84 H52 V54 C52 46 60 46 60 54 V84 H70 V54 C70 46 78 46 78 54 V84 H84 V60 C84 52 92 52 92 60 V84 C98 80 108 84 104 96 C100 106 90 110 84 114 C82 134 65 146 65 146 C65 146 48 134 46 114 C40 110 30 106 26 96 C22 84 32 80 38 84 Z" fill="url(#hm-cobalt-__ID__)" stroke="url(#hm-gold-__ID__)" stroke-width="2.6" stroke-linejoin="round"/>
    <!-- Golden Filigree Inlay & Arabesque Vines -->
    <path d="M65 58 V78 M56 60 V78 M74 60 V78" stroke="url(#hm-gold-__ID__)" stroke-width="1.2" opacity="0.8"/>
    <!-- Bezel-Set Central Evil Eye -->
    <ellipse cx="65" cy="108" rx="17" ry="11.5" fill="url(#hm-eye-__ID__)" stroke="url(#hm-gold-__ID__)" stroke-width="2.2"/>
    <circle cx="65" cy="108" r="6" fill="url(#hm-iris-__ID__)"/>
    <circle cx="65" cy="108" r="2.8" fill="#020617"/>
    <circle cx="63.2" cy="106.2" r="1.4" fill="#ffffff"/>
    <path d="M65 92 Q72 98 65 102 Q58 98 65 92" fill="#ef4444" opacity="0.85"/>
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

/* ===================================================================== *
 * 11. PÁNCHÁNG JIÉ — Endless Crimson Silk Mystic Knot & Tassel
 * ===================================================================== */
const panchang = {
  id: 'panchang',
  name: 'Páncháng jié',
  origin: 'China',
  plaque: 'One unbroken red cord, tied for luck without end.',
  ritualName: 'Cinch it',
  hint: 'Tie in good fortune',
  sound: 'wish',
  accent: '#d42a2a',
  sway: 1.05,
  weight: 6,
  art: `
<svg class="charm-art" viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="pc-silk-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="28%" stop-color="#ef4444"/>
      <stop offset="68%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#450a0a"/>
    </linearGradient>
    <linearGradient id="pc-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="30%" stop-color="#fde047"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <radialGradient id="pc-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="pc-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <filter id="pc-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="4.5" flood-color="#450a0a" flood-opacity="0.32"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M60 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="60" cy="9" r="2.6" fill="url(#pc-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="60" cy="17.2" r="5.6" fill="url(#pc-bead-__ID__)"/>
  <circle cx="58.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="62.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="60" cy="25.4" r="2.6" fill="url(#pc-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="60" cy="34" r="5.2" fill="none" stroke="url(#pc-gold-__ID__)" stroke-width="2.3"/>
  <!-- Chinese Mystic Knot in Cylindrical Silk Cord -->
  <g data-part="knot" filter="url(#pc-shadow-__ID__)" style="transform-box:view-box;transform-origin:60px 58px">
    <path d="M60 38 V44" stroke="#b91c1c" stroke-width="3" stroke-linecap="round"/>
    <!-- Outer loop ears -->
    <path d="M42 42 C26 42 26 62 42 62" fill="none" stroke="url(#pc-silk-__ID__)" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M78 42 C94 42 94 62 78 62" fill="none" stroke="url(#pc-silk-__ID__)" stroke-width="4.5" stroke-linecap="round"/>
    <!-- Woven grid body -->
    <rect x="42" y="44" width="36" height="36" rx="6" fill="url(#pc-silk-__ID__)" stroke="#7f1d1d" stroke-width="1.4"/>
    <path d="M48 44 V80 M54 44 V80 M66 44 V80 M72 44 V80" stroke="#7f1d1d" stroke-width="1.2"/>
    <path d="M42 50 H78 M42 56 H78 M42 68 H78 M42 74 H78" stroke="#7f1d1d" stroke-width="1.2"/>
    <!-- Highlights along the weave -->
    <path d="M48 46 V78 M66 46 V78" stroke="#fca5a5" stroke-width="0.9" opacity="0.7"/>
    <!-- Bottom loops -->
    <path d="M46 80 C46 94 56 94 56 80" fill="none" stroke="url(#pc-silk-__ID__)" stroke-width="4" stroke-linecap="round"/>
    <path d="M64 80 C64 94 74 94 74 80" fill="none" stroke="url(#pc-silk-__ID__)" stroke-width="4" stroke-linecap="round"/>
  </g>
  <!-- Gold Spacer Bead & Lush Silk Tassel -->
  <g data-part="tassel" style="transform-box:view-box;transform-origin:60px 88px">
    <!-- Heavy 24K Gold Cylinder Cap -->
    <rect x="52" y="86" width="16" height="8" rx="3.5" fill="url(#pc-gold-__ID__)" stroke="#78350f" stroke-width="1"/>
    <!-- Silky Crimson Strands with Natural Hang -->
    <g stroke="url(#pc-silk-__ID__)" stroke-width="2.6" stroke-linecap="round">
      <path d="M54 94 Q50 120 52 144"/>
      <path d="M57 94 Q56 122 56 148"/>
      <path d="M60 94 V152"/>
      <path d="M63 94 Q64 122 64 148"/>
      <path d="M66 94 Q70 120 68 144"/>
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

/* ===================================================================== *
 * 12. HORSESHOE — Hand-Forged Burnished Steel with Fullered Groove
 * ===================================================================== */
const horseshoe = {
  id: 'horseshoe',
  name: 'Horseshoe',
  origin: 'Europe and the Americas',
  plaque: 'Open end up, so the luck stays in and cannot pour out.',
  ritualName: 'Give it a flick',
  hint: 'Give it a flick',
  sound: 'bonk',
  accent: '#8d93a1',
  sway: 0.9,
  weight: 10,
  art: `
<svg class="charm-art" viewBox="0 0 130 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="hs-steel-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#cbd5e1"/>
      <stop offset="60%" stop-color="#64748b"/>
      <stop offset="90%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <radialGradient id="hs-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="hs-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <linearGradient id="hs-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <filter id="hs-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#1e293b" flood-opacity="0.3"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M65 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="65" cy="9" r="2.6" fill="url(#hs-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="65" cy="17.2" r="5.6" fill="url(#hs-bead-__ID__)"/>
  <circle cx="63.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="67.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="65" cy="25.4" r="2.6" fill="url(#hs-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="65" cy="34" r="5.2" fill="none" stroke="url(#hs-gold-__ID__)" stroke-width="2.3"/>
  <!-- Gold suspension bracket -->
  <path d="M58 39 Q65 44 72 39" stroke="url(#hs-gold-__ID__)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <!-- Hand-Forged Burnished Steel Horseshoe (Open End Up) -->
  <g data-part="shoe" filter="url(#hs-shadow-__ID__)">
    <!-- Solid horseshoe forged arc -->
    <path d="M28 54 C28 98 44 130 65 130 C86 130 102 98 102 54" fill="none" stroke="url(#hs-steel-__ID__)" stroke-width="17" stroke-linecap="round"/>
    <!-- Deep fullered inner center groove -->
    <path d="M28 56 C28 96 44 124 65 124 C86 124 102 96 102 56" fill="none" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
    <!-- 7 Square Countersunk Nail Holes with Steel Rivets -->
    <g fill="#0f172a" stroke="#cbd5e1" stroke-width="0.6">
      <rect x="25" y="66" width="3.5" height="3.5" rx="0.8"/>
      <rect x="30" y="86" width="3.5" height="3.5" rx="0.8"/>
      <rect x="42" y="104" width="3.5" height="3.5" rx="0.8"/>
      <circle cx="65" cy="124" r="2"/>
      <rect x="85" y="104" width="3.5" height="3.5" rx="0.8"/>
      <rect x="97" y="86" width="3.5" height="3.5" rx="0.8"/>
      <rect x="102" y="66" width="3.5" height="3.5" rx="0.8"/>
    </g>
    <!-- Light-catching metallic chamfer highlights -->
    <path d="M20 54 C20 102 42 138 65 138" stroke="#ffffff" stroke-width="1.2" fill="none" opacity="0.65" stroke-linecap="round"/>
  </g>
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

/* ===================================================================== *
 * 13. FOUR-LEAF CLOVER — Emerald Enamel with 24K Gold Cloisonné
 * ===================================================================== */
const clover = {
  id: 'clover',
  name: 'Four-leaf clover',
  origin: 'Ireland',
  plaque: 'Found, never planted. A leaf for faith, hope, love and luck.',
  ritualName: 'Give it a flick',
  hint: 'Give it a flick',
  sound: 'sparkle',
  accent: '#15803d',
  sway: 1.05,
  weight: 5,
  art: `
<svg class="charm-art" viewBox="0 0 120 175" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="cv-leaf-__ID__" cx="35%" cy="26%" r="78%">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="20%" stop-color="#22c55e"/>
      <stop offset="55%" stop-color="#16a34a"/>
      <stop offset="85%" stop-color="#15803d"/>
      <stop offset="100%" stop-color="#052e16"/>
    </radialGradient>
    <linearGradient id="cv-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="30%" stop-color="#fde047"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <radialGradient id="cv-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="cv-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <filter id="cv-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="4.5" flood-color="#052e16" flood-opacity="0.28"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M60 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="60" cy="9" r="2.6" fill="url(#cv-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="60" cy="17.2" r="5.6" fill="url(#cv-bead-__ID__)"/>
  <circle cx="58.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="62.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="60" cy="25.4" r="2.6" fill="url(#cv-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="60" cy="34" r="5.2" fill="none" stroke="url(#cv-gold-__ID__)" stroke-width="2.3"/>
  <!-- Four-Leaf Clover in Luxury Cloisonné Gold Setting -->
  <g data-part="clover" filter="url(#cv-shadow-__ID__)" style="transform-box:view-box;transform-origin:60px 72px">
    <!-- Natural curving stem -->
    <path d="M60 72 C60 96 66 114 70 124 C69 125 66 126 65 124 C60 112 56 94 57 72 Z" fill="#15803d" stroke="#052e16" stroke-width="0.8"/>
    <!-- Top Leaf -->
    <g transform="rotate(0 60 72)">
      <path d="M60 41 C51 25 35 28 35 43 C35 57 49 64 60 71 C71 64 85 57 85 43 C85 28 69 25 60 41 Z" fill="url(#cv-gold-__ID__)" stroke="#78350f" stroke-width="0.6"/>
      <path d="M60 43 C52 29 38 31 38 43 C38 55 50 62 60 69 C70 62 82 55 82 43 C82 31 68 29 60 43 Z" fill="url(#cv-leaf-__ID__)"/>
      <path d="M60 67 V48" stroke="#fde047" stroke-width="0.9" opacity="0.8"/>
    </g>
    <!-- Right Leaf -->
    <g transform="rotate(90 60 72)">
      <path d="M60 41 C51 25 35 28 35 43 C35 57 49 64 60 71 C71 64 85 57 85 43 C85 28 69 25 60 41 Z" fill="url(#cv-gold-__ID__)" stroke="#78350f" stroke-width="0.6"/>
      <path d="M60 43 C52 29 38 31 38 43 C38 55 50 62 60 69 C70 62 82 55 82 43 C82 31 68 29 60 43 Z" fill="url(#cv-leaf-__ID__)"/>
      <path d="M60 67 V48" stroke="#fde047" stroke-width="0.9" opacity="0.8"/>
    </g>
    <!-- Bottom Leaf -->
    <g transform="rotate(180 60 72)">
      <path d="M60 41 C51 25 35 28 35 43 C35 57 49 64 60 71 C71 64 85 57 85 43 C85 28 69 25 60 41 Z" fill="url(#cv-gold-__ID__)" stroke="#78350f" stroke-width="0.6"/>
      <path d="M60 43 C52 29 38 31 38 43 C38 55 50 62 60 69 C70 62 82 55 82 43 C82 31 68 29 60 43 Z" fill="url(#cv-leaf-__ID__)"/>
      <path d="M60 67 V48" stroke="#fde047" stroke-width="0.9" opacity="0.8"/>
    </g>
    <!-- Left Leaf -->
    <g transform="rotate(270 60 72)">
      <path d="M60 41 C51 25 35 28 35 43 C35 57 49 64 60 71 C71 64 85 57 85 43 C85 28 69 25 60 41 Z" fill="url(#cv-gold-__ID__)" stroke="#78350f" stroke-width="0.6"/>
      <path d="M60 43 C52 29 38 31 38 43 C38 55 50 62 60 69 C70 62 82 55 82 43 C82 31 68 29 60 43 Z" fill="url(#cv-leaf-__ID__)"/>
      <path d="M60 67 V48" stroke="#fde047" stroke-width="0.9" opacity="0.8"/>
    </g>
    <!-- Center Bezel with Micro-Diamond Sparkle -->
    <circle cx="60" cy="72" r="3.2" fill="url(#cv-gold-__ID__)" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="60" cy="72" r="1.4" fill="#ffffff"/>
  </g>
</svg>`,
  ritual(root, api) {
    const clv = parts(root, 'clover')[0];
    api.play('sparkle');
    anim(clv, [
      { transform: 'rotate(0deg) scale(1)' },
      { transform: 'rotate(-11deg) scale(1.1)' },
      { transform: 'rotate(8deg) scale(1.03)' },
      { transform: 'rotate(0deg) scale(1)' },
    ], { duration: 900, easing: 'cubic-bezier(.3,1.5,.4,1)' });
    api.floater('lucky find');
  },
};

/* ===================================================================== *
 * 14. MANEKI-NEKO — High-Gloss Japanese Porcelain Lucky Cat
 * ===================================================================== */
const maneki = {
  id: 'maneki',
  name: 'Maneki-neko',
  origin: 'Japan',
  plaque: 'The beckoning cat, inviting good fortune through the door.',
  ritualName: 'Beckon',
  hint: 'Beckon good fortune',
  sound: 'chirp',
  accent: '#e8b23a',
  sway: 0.95,
  weight: 9,
  art: `
<svg class="charm-art" viewBox="0 0 130 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="mk-porcelain-__ID__" cx="36%" cy="26%" r="80%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="65%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <linearGradient id="mk-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="30%" stop-color="#fde047"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <radialGradient id="mk-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="mk-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <filter id="mk-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#475569" flood-opacity="0.25"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M65 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="65" cy="9" r="2.6" fill="url(#mk-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="65" cy="17.2" r="5.6" fill="url(#mk-bead-__ID__)"/>
  <circle cx="63.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="67.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="65" cy="25.4" r="2.6" fill="url(#mk-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="65" cy="34" r="5.2" fill="none" stroke="url(#mk-gold-__ID__)" stroke-width="2.3"/>
  <!-- High-Gloss Porcelain Lucky Cat -->
  <g filter="url(#mk-shadow-__ID__)">
    <!-- Porcelain Body -->
    <path d="M42 98 C36 138 46 150 65 150 C84 150 94 138 88 98 Z" fill="url(#mk-porcelain-__ID__)" stroke="#94a3b8" stroke-width="1.2"/>
    <!-- Calico russet & sumi patches -->
    <path d="M42 98 C36 124 40 138 52 146 V98 Z" fill="#ea580c" opacity="0.75"/>
    <!-- Solid Gold Koban Coin (千万両) -->
    <ellipse cx="65" cy="128" rx="17" ry="14" fill="url(#mk-gold-__ID__)" stroke="#78350f" stroke-width="1.2"/>
    <text x="65" y="133" text-anchor="middle" font-family="serif" font-size="12" font-weight="700" fill="#78350f">千万両</text>
    <!-- Porcelain Head & Pointed Ears -->
    <circle cx="65" cy="88" r="28" fill="url(#mk-porcelain-__ID__)" stroke="#94a3b8" stroke-width="1.2"/>
    <path d="M42 68 L50 56 Q56 64 54 72 Z" fill="url(#mk-porcelain-__ID__)" stroke="#94a3b8" stroke-width="1"/>
    <path d="M88 68 L80 56 Q74 64 76 72 Z" fill="url(#mk-porcelain-__ID__)" stroke="#94a3b8" stroke-width="1"/>
    <path d="M45 66 L50 59 L52 68 Z" fill="#f87171"/>
    <path d="M85 66 L80 59 L78 68 Z" fill="#f87171"/>
    <!-- Smiling Eyes, Nose & Whiskers -->
    <path d="M52 82 Q56 78 60 82 M70 82 Q74 78 78 82" stroke="#1e293b" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="65" cy="86" r="1.8" fill="#f87171"/>
    <path d="M65 88 Q62 92 58 90 M65 88 Q68 92 72 90" stroke="#1e293b" stroke-width="1.2" fill="none"/>
    <path d="M44 86 H34 M44 90 H32 M86 86 H96 M86 90 H98" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round"/>
    <!-- Vermilion Collar with Jingling Golden Bell -->
    <path d="M42 100 Q65 110 88 100" stroke="#dc2626" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="65" cy="106" r="5" fill="url(#mk-gold-__ID__)" stroke="#78350f" stroke-width="0.8"/>
    <!-- Beckoning Paw with Pink Pads -->
    <g data-part="paw" style="transform-box:view-box;transform-origin:46px 94px">
      <path d="M46 94 Q36 78 42 62 Q50 56 56 66 Q52 82 46 94 Z" fill="url(#mk-porcelain-__ID__)" stroke="#94a3b8" stroke-width="1.2"/>
      <circle cx="45" cy="62" r="9" fill="url(#mk-porcelain-__ID__)" stroke="#94a3b8" stroke-width="1.2"/>
      <ellipse cx="45" cy="63" rx="4" ry="3" fill="#f87171" opacity="0.8"/>
    </g>
  </g>
</svg>`,
  ritual(root, api) {
    const paw = parts(root, 'paw')[0];
    api.play('chirp');
    const seq = [0, -26, -4, -22, -4, -15, -3, -8, 0];
    anim(paw, seq.map((r) => ({ transform: `rotate(${r}deg)` })),
      { duration: 2100, easing: 'ease-in-out' });
    api.floater('come here, luck');
  },
};

/* ===================================================================== *
 * 15. DARUMA — Deep Vermilion Japanese Lacquer Wishing Doll
 * ===================================================================== */
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
    <radialGradient id="dm-lacquer-__ID__" cx="36%" cy="26%" r="85%">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="35%" stop-color="#dc2626"/>
      <stop offset="75%" stop-color="#991b1b"/>
      <stop offset="100%" stop-color="#450a0a"/>
    </radialGradient>
    <linearGradient id="dm-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="35%" stop-color="#fde047"/>
      <stop offset="75%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <radialGradient id="dm-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="dm-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <filter id="dm-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#450a0a" flood-opacity="0.32"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M60 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="60" cy="9" r="2.6" fill="url(#dm-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="60" cy="17.2" r="5.6" fill="url(#dm-bead-__ID__)"/>
  <circle cx="58.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="62.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="60" cy="25.4" r="2.6" fill="url(#dm-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="60" cy="34" r="5.2" fill="none" stroke="url(#dm-gold-__ID__)" stroke-width="2.3"/>
  <!-- Traditional Takasaki Daruma Doll -->
  <g data-part="doll" filter="url(#dm-shadow-__ID__)">
    <!-- Plump roly-poly lacquer body -->
    <path d="M60 40 C34 40 20 62 20 102 C20 138 36 154 60 154 C84 154 100 138 100 102 C100 62 86 40 60 40 Z" fill="url(#dm-lacquer-__ID__)" stroke="#450a0a" stroke-width="1.4"/>
    <!-- Gold leaf cloud swirls on sides -->
    <path d="M24 108 Q32 100 36 112" stroke="url(#dm-gold-__ID__)" stroke-width="2" fill="none" opacity="0.8"/>
    <path d="M96 108 Q88 100 84 112" stroke="url(#dm-gold-__ID__)" stroke-width="2" fill="none" opacity="0.8"/>
    <!-- White Parchment Face Medallion -->
    <ellipse cx="60" cy="96" rx="30" ry="28" fill="#f8fafc" stroke="url(#dm-gold-__ID__)" stroke-width="1.6"/>
    <!-- Crane-Wing Eyebrows & Tortoise-Shell Whiskers -->
    <path d="M38 78 Q48 70 56 76 M82 78 Q72 70 64 76" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M42 108 Q50 114 60 110 Q70 114 78 108" stroke="#1e293b" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <!-- Left & Right Eye Medallions -->
    <ellipse cx="46" cy="88" rx="8.5" ry="10" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
    <ellipse cx="74" cy="88" rx="8.5" ry="10" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
    <!-- Left & Right Dynamic Pupils for Ritual -->
    <ellipse data-part="pupilL" cx="46" cy="88" rx="0" ry="0" fill="#020617"/>
    <ellipse data-part="pupilR" cx="74" cy="88" rx="0" ry="0" fill="#020617"/>
    <!-- Gold Kanji '福' (Fortune) on Chest -->
    <text x="60" y="142" text-anchor="middle" font-family="serif" font-size="14" font-weight="700" fill="url(#dm-gold-__ID__)">福</text>
  </g>
</svg>`,
  ritual(root, api) {
    const doll = parts(root, 'doll')[0];
    const pl = parts(root, 'pupilL')[0];
    const pr = parts(root, 'pupilR')[0];
    const wished = root.dataset.wished === '1';
    api.play('wish');
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

/* ===================================================================== *
 * 16. SCARAB — Pharaonic Lapis Lazuli & Chiseled Gold Amulet
 * ===================================================================== */
const scarab = {
  id: 'scarab',
  name: 'Scarab',
  origin: 'Ancient Egypt',
  plaque: 'The beetle of renewal, for beginnings that deserve a second dawn.',
  ritualName: 'Catch the light',
  hint: 'Catch the light',
  sound: 'sparkle',
  accent: '#2fa8a0',
  sway: 0.85,
  weight: 9,
  art: `
<svg class="charm-art" viewBox="0 0 160 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="sc-lapis-__ID__" cx="36%" cy="28%" r="76%">
      <stop offset="0%" stop-color="#5eead4"/>
      <stop offset="35%" stop-color="#0d9488"/>
      <stop offset="75%" stop-color="#115e59"/>
      <stop offset="100%" stop-color="#042f2e"/>
    </radialGradient>
    <linearGradient id="sc-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="30%" stop-color="#fde047"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <radialGradient id="sc-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="sc-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <filter id="sc-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#042f2e" flood-opacity="0.32"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M80 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="80" cy="9" r="2.6" fill="url(#sc-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="80" cy="17.2" r="5.6" fill="url(#sc-bead-__ID__)"/>
  <circle cx="78.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="82.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="80" cy="25.4" r="2.6" fill="url(#sc-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="80" cy="34" r="5.2" fill="none" stroke="url(#sc-gold-__ID__)" stroke-width="2.3"/>
  <!-- Golden Solar Disc of Ra held at apex -->
  <circle cx="80" cy="46" r="7" fill="url(#sc-gold-__ID__)" stroke="#78350f" stroke-width="1"/>
  <circle cx="78" cy="44" r="2" fill="#fffbeb"/>
  <!-- Left Chiseled Falcon Wing -->
  <g data-part="wingL" style="transform-box:view-box;transform-origin:80px 86px">
    <path d="M80 78 C52 56 24 64 16 80 C26 94 56 94 80 88 Z" fill="url(#sc-gold-__ID__)" stroke="#78350f" stroke-width="1.2"/>
    <path d="M74 80 C54 68 32 74 24 82 M70 86 C50 78 36 84 30 88" stroke="#0d9488" stroke-width="1.4" fill="none"/>
  </g>
  <!-- Right Chiseled Falcon Wing -->
  <g data-part="wingR" style="transform-box:view-box;transform-origin:80px 86px">
    <path d="M80 78 C108 56 136 64 144 80 C134 94 104 94 80 88 Z" fill="url(#sc-gold-__ID__)" stroke="#78350f" stroke-width="1.2"/>
    <path d="M86 80 C106 68 128 74 136 82 M90 86 C110 78 124 84 130 88" stroke="#0d9488" stroke-width="1.4" fill="none"/>
  </g>
  <!-- Lapis & Gold Beetle Body -->
  <g data-part="body" filter="url(#sc-shadow-__ID__)">
    <!-- Sculpted Elytra (Wingshield) -->
    <ellipse cx="80" cy="98" rx="24" ry="32" fill="url(#sc-lapis-__ID__)" stroke="#78350f" stroke-width="1.4"/>
    <path d="M80 66 V130" stroke="url(#sc-gold-__ID__)" stroke-width="1.8"/>
    <!-- Thorax & Clypeus Head in Chiseled Gold -->
    <ellipse cx="80" cy="68" rx="15" ry="9" fill="url(#sc-gold-__ID__)" stroke="#78350f" stroke-width="1.2"/>
    <path d="M72 60 L66 54 M88 60 L94 54" stroke="url(#sc-gold-__ID__)" stroke-width="2.4" stroke-linecap="round"/>
    <!-- Specular gemstone gleam -->
    <ellipse cx="72" cy="86" rx="6" ry="10" fill="#ffffff" opacity="0.35" transform="rotate(-20 72 86)"/>
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
    anim(parts(root, 'body')[0], [
      { filter: 'brightness(1)' },
      { filter: 'brightness(2.1)' },
      { filter: 'brightness(1.35)' },
      { filter: 'brightness(1)' },
    ], { duration: 1300, easing: 'ease-in-out' });
    api.floater('light caught');
  },
};

/* ===================================================================== *
 * 17. LADYBUG — High-Jewelry Carmine Red Vitreous Enamel Brooch
 * ===================================================================== */
const ladybug = {
  id: 'ladybug',
  name: 'Ladybug',
  origin: 'Europe',
  plaque: 'Count the seven spots for the months until your wish arrives.',
  ritualName: 'Give it a flick',
  hint: 'Give it a flick',
  sound: 'tick',
  accent: '#d42a2a',
  sway: 1.1,
  weight: 5,
  art: `
<svg class="charm-art" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="lb-red-__ID__" cx="36%" cy="24%" r="85%">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="35%" stop-color="#dc2626"/>
      <stop offset="75%" stop-color="#991b1b"/>
      <stop offset="100%" stop-color="#450a0a"/>
    </radialGradient>
    <linearGradient id="lb-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="30%" stop-color="#fde047"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <radialGradient id="lb-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="lb-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <filter id="lb-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#450a0a" flood-opacity="0.32"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M60 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="60" cy="9" r="2.6" fill="url(#lb-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="60" cy="17.2" r="5.6" fill="url(#lb-bead-__ID__)"/>
  <circle cx="58.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="62.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="60" cy="25.4" r="2.6" fill="url(#lb-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="60" cy="34" r="5.2" fill="none" stroke="url(#lb-gold-__ID__)" stroke-width="2.3"/>
  <!-- High-Jewelry Ladybug Brooch -->
  <g data-part="bug" filter="url(#lb-shadow-__ID__)" style="transform-box:view-box;transform-origin:60px 42px">
    <!-- Delicate Gold Antennae -->
    <path d="M56 46 Q52 32 46 30 M64 46 Q68 32 74 30" stroke="url(#lb-gold-__ID__)" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <circle cx="46" cy="30" r="1.6" fill="url(#lb-gold-__ID__)"/>
    <circle cx="74" cy="30" r="1.6" fill="url(#lb-gold-__ID__)"/>
    <!-- Jet-Black Head with Diamond Eyes -->
    <ellipse cx="60" cy="52" rx="10" ry="8" fill="#020617"/>
    <circle cx="55.5" cy="50" r="1.8" fill="#ffffff"/>
    <circle cx="64.5" cy="50" r="1.8" fill="#ffffff"/>
    <!-- Domed Carmine Red Vitreous Enamel Shell -->
    <path d="M30 96 C30 62 60 62 60 62 C60 62 90 62 90 96 C90 126 76 136 60 136 C44 136 30 126 30 96 Z" fill="url(#lb-red-__ID__)" stroke="#450a0a" stroke-width="1.4"/>
    <!-- Polished Gold Wing Separation Line -->
    <path d="M60 62 V136" stroke="url(#lb-gold-__ID__)" stroke-width="2"/>
    <!-- 7 Onyx Spots in Gold Bezels -->
    <circle cx="60" cy="72" r="3.6" fill="#020617" stroke="url(#lb-gold-__ID__)" stroke-width="0.6"/>
    <circle cx="46" cy="80" r="4.2" fill="#020617" stroke="url(#lb-gold-__ID__)" stroke-width="0.6"/>
    <circle cx="74" cy="80" r="4.2" fill="#020617" stroke="url(#lb-gold-__ID__)" stroke-width="0.6"/>
    <circle cx="40" cy="98" r="4.6" fill="#020617" stroke="url(#lb-gold-__ID__)" stroke-width="0.6"/>
    <circle cx="80" cy="98" r="4.6" fill="#020617" stroke="url(#lb-gold-__ID__)" stroke-width="0.6"/>
    <circle cx="50" cy="116" r="4.4" fill="#020617" stroke="url(#lb-gold-__ID__)" stroke-width="0.6"/>
    <circle cx="70" cy="116" r="4.4" fill="#020617" stroke="url(#lb-gold-__ID__)" stroke-width="0.6"/>
    <!-- Curved Specular Dome Light Glare -->
    <ellipse cx="44" cy="82" rx="8" ry="4.5" fill="#ffffff" opacity="0.45" transform="rotate(-30 44 82)"/>
  </g>
</svg>`,
  ritual(root, api) {
    const bug = parts(root, 'bug')[0];
    api.play('tick');
    anim(bug, [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-13deg)' }, { transform: 'rotate(10deg)' },
      { transform: 'rotate(-5deg)' }, { transform: 'rotate(0deg)' },
    ], { duration: 950, easing: 'ease-in-out' });
    api.floater('seven spots');
  },
};

/* ===================================================================== *
 * 18. DREAMCATCHER — Leather-Wrapped Willow Hoop & Sacred Turquoise
 * ===================================================================== */
const dreamcatcher = {
  id: 'dreamcatcher',
  name: 'Dreamcatcher',
  origin: 'Ojibwe, North America',
  plaque: 'A willow hoop and web that keeps the bad dreams by morning.',
  ritualName: 'Give it a flick',
  hint: 'Give it a flick',
  sound: 'sway',
  accent: '#c9a26a',
  sway: 1,
  weight: 7,
  art: `
<svg class="charm-art" viewBox="0 0 120 215" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="dc-leather-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d4b483"/>
      <stop offset="50%" stop-color="#9a7342"/>
      <stop offset="100%" stop-color="#5c3f1d"/>
    </linearGradient>
    <radialGradient id="dc-turquoise-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#5eead4"/>
      <stop offset="45%" stop-color="#0d9488"/>
      <stop offset="100%" stop-color="#115e59"/>
    </radialGradient>
    <radialGradient id="dc-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="dc-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <linearGradient id="dc-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <filter id="dc-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="4.5" flood-color="#5c3f1d" flood-opacity="0.25"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M60 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="60" cy="9" r="2.6" fill="url(#dc-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="60" cy="17.2" r="5.6" fill="url(#dc-bead-__ID__)"/>
  <circle cx="58.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="62.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="60" cy="25.4" r="2.6" fill="url(#dc-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="60" cy="34" r="5.2" fill="none" stroke="url(#dc-gold-__ID__)" stroke-width="2.3"/>
  <!-- Willow Hoop & Sacred Spiderweb -->
  <g data-part="web" filter="url(#dc-shadow-__ID__)" style="transform-box:view-box;transform-origin:60px 80px">
    <!-- Buckskin-wrapped hoop -->
    <circle cx="60" cy="80" r="40" fill="none" stroke="url(#dc-leather-__ID__)" stroke-width="6"/>
    <circle cx="60" cy="80" r="40" fill="none" stroke="#5c3f1d" stroke-width="1.2" opacity="0.6"/>
    <!-- Sacred Geometric Web with Silver Sinew -->
    <g stroke="#fef3c7" stroke-width="1.2" fill="none" opacity="0.85">
      <circle cx="60" cy="80" r="30"/>
      <circle cx="60" cy="80" r="20"/>
      <circle cx="60" cy="80" r="10"/>
      <path d="M60 40 L60 120 M20 80 L100 80 M32 52 L88 108 M32 108 L88 52"/>
    </g>
    <!-- Central Genuine Turquoise Gemstone -->
    <circle cx="60" cy="80" r="4.2" fill="url(#dc-turquoise-__ID__)" stroke="#115e59" stroke-width="0.8"/>
    <circle cx="59" cy="79" r="1.2" fill="#ffffff" opacity="0.8"/>
  </g>
  <!-- Sacred Shaded Plumage Feathers -->
  <g data-part="feathers" style="transform-box:view-box;transform-origin:60px 122px">
    <path d="M42 120 V156 M60 120 V162 M78 120 V156" stroke="#9a7342" stroke-width="2" stroke-linecap="round"/>
    <!-- Turquoise & Carnelian bead wraps -->
    <circle cx="42" cy="148" r="2.8" fill="url(#dc-turquoise-__ID__)"/>
    <circle cx="60" cy="154" r="3" fill="#dc2626"/>
    <circle cx="78" cy="148" r="2.8" fill="url(#dc-turquoise-__ID__)"/>
    <!-- Left Feather -->
    <path d="M42 156 C32 166 34 184 42 192 C46 182 46 166 42 156 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
    <path d="M42 156 V190" stroke="#94a3b8" stroke-width="0.8"/>
    <!-- Center Long Feather -->
    <path d="M60 162 C48 174 50 196 60 206 C66 194 66 174 60 162 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2"/>
    <path d="M60 162 V204" stroke="#94a3b8" stroke-width="0.9"/>
    <!-- Right Feather -->
    <path d="M78 156 C74 166 74 182 78 192 C86 184 88 166 78 156 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
    <path d="M78 156 V190" stroke="#94a3b8" stroke-width="0.8"/>
  </g>
</svg>`,
  ritual(root, api) {
    const feathers = parts(root, 'feathers')[0];
    const web = parts(root, 'web')[0];
    api.play('sway');
    anim(feathers, [
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-9deg)' },
      { transform: 'rotate(7deg)' }, { transform: 'rotate(-3deg)' },
      { transform: 'rotate(0deg)' },
    ], { duration: 1600, easing: 'ease-in-out' });
    anim(web, [
      { transform: 'rotate(0deg)' }, { transform: 'rotate(4deg)' },
      { transform: 'rotate(-3deg)' }, { transform: 'rotate(0deg)' },
    ], { duration: 1600, easing: 'ease-in-out' });
    api.floater('good dreams');
  },
};

/* ===================================================================== *
 * 19. LUCKY BAMBOO — Cylindrical Jade Stalks & Scarlet Silk Ribbon
 * ===================================================================== */
const bamboo = {
  id: 'bamboo',
  name: 'Lucky bamboo',
  origin: 'China',
  plaque: 'Three stalks for happiness, wealth and long life. It grows anyway.',
  ritualName: 'Give it a flick',
  hint: 'Give it a flick',
  sound: 'sway',
  accent: '#4a9e3a',
  sway: 1,
  weight: 7,
  art: `
<svg class="charm-art" viewBox="0 0 120 215" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="bm-stalk-__ID__" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="30%" stop-color="#86efac"/>
      <stop offset="70%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
    <linearGradient id="bm-silk-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="40%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>
    <radialGradient id="bm-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="bm-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <linearGradient id="bm-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <filter id="bm-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="4.5" flood-color="#14532d" flood-opacity="0.28"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M60 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="60" cy="9" r="2.6" fill="url(#bm-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="60" cy="17.2" r="5.6" fill="url(#bm-bead-__ID__)"/>
  <circle cx="58.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="62.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="60" cy="25.4" r="2.6" fill="url(#bm-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="60" cy="34" r="5.2" fill="none" stroke="url(#bm-gold-__ID__)" stroke-width="2.3"/>
  <!-- Sculpted Jade-Green Bamboo Stalks -->
  <g data-part="stalks" filter="url(#bm-shadow-__ID__)" style="transform-box:view-box;transform-origin:60px 36px">
    <!-- Left Stalk -->
    <rect x="42" y="44" width="10" height="136" rx="5" fill="url(#bm-stalk-__ID__)" stroke="#14532d" stroke-width="1"/>
    <ellipse cx="47" cy="74" rx="5" ry="1.6" fill="none" stroke="#14532d" stroke-width="1.4"/>
    <ellipse cx="47" cy="108" rx="5" ry="1.6" fill="none" stroke="#14532d" stroke-width="1.4"/>
    <ellipse cx="47" cy="142" rx="5" ry="1.6" fill="none" stroke="#14532d" stroke-width="1.4"/>
    <!-- Center Long Stalk -->
    <rect x="55" y="36" width="12" height="150" rx="6" fill="url(#bm-stalk-__ID__)" stroke="#14532d" stroke-width="1"/>
    <ellipse cx="61" cy="68" rx="6" ry="1.8" fill="none" stroke="#14532d" stroke-width="1.4"/>
    <ellipse cx="61" cy="104" rx="6" ry="1.8" fill="none" stroke="#14532d" stroke-width="1.4"/>
    <ellipse cx="61" cy="140" rx="6" ry="1.8" fill="none" stroke="#14532d" stroke-width="1.4"/>
    <!-- Right Stalk -->
    <rect x="70" y="48" width="10" height="132" rx="5" fill="url(#bm-stalk-__ID__)" stroke="#14532d" stroke-width="1"/>
    <ellipse cx="75" cy="78" rx="5" ry="1.6" fill="none" stroke="#14532d" stroke-width="1.4"/>
    <ellipse cx="75" cy="112" rx="5" ry="1.6" fill="none" stroke="#14532d" stroke-width="1.4"/>
    <ellipse cx="75" cy="146" rx="5" ry="1.6" fill="none" stroke="#14532d" stroke-width="1.4"/>
    <!-- Delicate Arching Leaf Shoots -->
    <path d="M52 68 C40 60 36 50 48 54 C54 58 52 66 52 68 Z" fill="#22c55e" stroke="#14532d" stroke-width="0.8"/>
    <path d="M70 60 C82 52 88 44 76 48 C70 52 70 58 70 60 Z" fill="#22c55e" stroke="#14532d" stroke-width="0.8"/>
    <path d="M78 100 C90 92 94 82 84 86 C78 90 78 98 78 100 Z" fill="#22c55e" stroke="#14532d" stroke-width="0.8"/>
  </g>
  <!-- Scarlet Silk Ribbon with Gold Borders -->
  <g data-part="ribbon" style="transform-box:view-box;transform-origin:61px 96px">
    <rect x="38" y="92" width="46" height="11" rx="3" fill="url(#bm-silk-__ID__)" stroke="url(#bm-gold-__ID__)" stroke-width="1.2"/>
    <path d="M56 103 Q52 118 48 126 M66 103 Q70 118 74 126" stroke="url(#bm-silk-__ID__)" stroke-width="3.5" stroke-linecap="round"/>
  </g>
</svg>`,
  ritual(root, api) {
    const stalks = parts(root, 'stalks')[0];
    api.play('sway');
    anim(stalks, [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-6deg)' }, { transform: 'rotate(5deg)' },
      { transform: 'rotate(-2deg)' }, { transform: 'rotate(0deg)' },
    ], { duration: 1400, easing: 'ease-in-out' });
    api.floater('three stalks');
  },
};

/* ===================================================================== *
 * 20. HIMMELI — Precision Polished Brass Geometric Octahedron
 * ===================================================================== */
const himmeli = {
  id: 'himmeli',
  name: 'Himmeli',
  origin: 'Finland',
  plaque: 'Rye-straw geometry, hung for a harvest of steady work.',
  ritualName: 'Set it turning',
  hint: 'Set it turning',
  sound: 'sparkle',
  accent: '#d9b45a',
  sway: 1.2,
  weight: 6,
  art: `
<svg class="charm-art" viewBox="0 0 140 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="hi-brass-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="30%" stop-color="#fde047"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <radialGradient id="hi-pearl-__ID__" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="hi-bead-__ID__" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="22%" stop-color="#3b82f6"/>
      <stop offset="68%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <linearGradient id="hi-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <filter id="hi-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#78350f" flood-opacity="0.25"/>
    </filter>
  </defs>
  <!-- Warm silk cord stub -->
  <path d="M70 0 V6" stroke="#d49b42" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Top white pearl bead -->
  <circle cx="70" cy="9" r="2.6" fill="url(#hi-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Middle royal-blue spherical bead -->
  <circle cx="70" cy="17.2" r="5.6" fill="url(#hi-bead-__ID__)"/>
  <circle cx="68.0" cy="15.2" r="1.6" fill="#ffffff" opacity="0.95"/>
  <circle cx="72.2" cy="19.2" r="0.8" fill="#93c5fd" opacity="0.4"/>
  <!-- Bottom white pearl bead -->
  <circle cx="70" cy="25.4" r="2.6" fill="url(#hi-pearl-__ID__)" stroke="#94a3b8" stroke-width="0.3"/>
  <!-- Signature metallic gold jump-ring -->
  <circle cx="70" cy="34" r="5.2" fill="none" stroke="url(#hi-gold-__ID__)" stroke-width="2.3"/>
  <!-- Modern Geometric Polished Brass Mobile Rig -->
  <g data-part="rig" filter="url(#hi-shadow-__ID__)" style="transform-box:view-box;transform-origin:70px 100px">
    <!-- Outer Octahedron Struts -->
    <g stroke="url(#hi-brass-__ID__)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M70 42 L32 82 L70 110 L108 82 Z" fill="#fde047" fill-opacity="0.08"/>
      <path d="M70 42 L32 82 L70 162 L108 82 Z" fill="#fde047" fill-opacity="0.05"/>
      <path d="M70 42 V162 M32 82 H108 M70 110 V42 M70 110 V162 M32 82 L70 110 L108 82"/>
      <path d="M32 82 L70 42 L108 82 L70 162 Z"/>
    </g>
    <!-- Inner Floating Diamond Octahedron -->
    <path d="M70 78 L58 94 L70 110 L82 94 Z" fill="#fef08a" fill-opacity="0.22" stroke="url(#hi-brass-__ID__)" stroke-width="2"/>
    <!-- Polished Gold Sphere Vertices -->
    <circle cx="70" cy="42" r="3.6" fill="url(#hi-brass-__ID__)"/>
    <circle cx="32" cy="82" r="3.6" fill="url(#hi-brass-__ID__)"/>
    <circle cx="108" cy="82" r="3.6" fill="url(#hi-brass-__ID__)"/>
    <circle cx="70" cy="162" r="3.6" fill="url(#hi-brass-__ID__)"/>
    <circle cx="70" cy="110" r="3.2" fill="url(#hi-brass-__ID__)"/>
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

export const CHARMS = [
  nazar, murugar, karuppu, nimbu, drishti, om, ghanta, peacock, elephant,
  hamsa, panchang, horseshoe, clover, maneki, daruma, scarab, ladybug,
  dreamcatcher, bamboo, himmeli,
];

export const CHARM_GROUPS = [
  { title: 'The collection', ids: CHARMS.map((c) => c.id) },
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
  return BY_ID.get(id) || nazar;
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
