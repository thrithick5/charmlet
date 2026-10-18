(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // web/js/verlet.js
  var Node = class {
    constructor(x, y, { pinned = false, invMass = 1 } = {}) {
      this.x = x;
      this.y = y;
      this.px = x;
      this.py = y;
      this.ax = 0;
      this.ay = 0;
      this.pinned = pinned;
      this.originX = x;
      this.originY = y;
      this.invMass = pinned ? 0 : invMass;
    }
    get vx() {
      return this.x - this.px;
    }
    get vy() {
      return this.y - this.py;
    }
    addForce(fx, fy) {
      if (this.pinned) return;
      this.ax += fx * this.invMass;
      this.ay += fy * this.invMass;
    }
    pinTo(x, y) {
      this.x = this.px = this.originX = x;
      this.y = this.py = this.originY = y;
    }
  };
  var Rope = class {
    /**
     * @param {object} opts
     * @param {number} opts.x          anchor x
     * @param {number} opts.y          anchor y
     * @param {number} opts.segments   node count above the tip
     * @param {number} opts.length     total cord length in px
     * @param {number} opts.gravity    downward acceleration per step
     * @param {number} opts.damping    0.9 = heavy air, 0.999 = none
     * @param {number} opts.iterations constraint relaxation passes
     * @param {number} opts.stiffness  0..1 cord elasticity (1 = inextensible)
     * @param {number} opts.tipWeight  inverse-mass weight of the charm node
     */
    constructor({
      x = 0,
      y = 0,
      segments = 14,
      length = 220,
      gravity = 0.62,
      damping = 0.988,
      iterations = 18,
      stiffness = 1,
      tipWeight = 7,
      windPhase = null
    } = {}) {
      this.segments = Math.max(2, segments | 0);
      this.gravity = gravity;
      this.damping = damping;
      this.iterations = iterations;
      this.stiffness = stiffness;
      this.tipWeight = tipWeight;
      this.time = 0;
      this.strainTolerance = 0.015;
      this.maxExtraIterations = 600;
      this.windAmp = 0.07;
      this.windStrength = 1;
      this.windPhase = windPhase !== null ? windPhase : Math.random() * Math.PI * 2;
      this.grabTarget = null;
      this.nodes = [];
      this.anchor = { x, y };
      this.setLength(length, { silent: true });
    }
    /** Lay the cord out straight down from the anchor. */
    setLength(length, { silent = false } = {}) {
      this.length = length;
      const n = this.segments;
      this.rest = length / n;
      if (silent || this.nodes.length !== n + 1) {
        this.nodes = [];
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          this.nodes.push(
            new Node(this.anchor.x, this.anchor.y + t * length, {
              pinned: i === 0,
              invMass: i === n ? 1 / this.tipWeight : 1
            })
          );
        }
      }
    }
    setAnchor(x, y) {
      this.anchor.x = x;
      this.anchor.y = y;
      const head = this.nodes[0];
      head.pinned = true;
      head.invMass = 0;
      head.pinTo(x, y);
    }
    get tip() {
      return this.nodes[this.nodes.length - 1];
    }
    /**
     * Rotation the charm should adopt, in radians.
     *
     * Measured over a multi-node baseline rather than the final segment alone. The
     * tip carries the charm's weight, so it lags the light nodes above it; taken from
     * one segment the tangent turns that lag into a hard kink and the charm hangs at
     * a visibly wrong angle (measured at 28 degrees before this was changed). Averaged
     * over the last few nodes it reads as the real direction of the cord.
     */
    get angle() {
      const n = this.nodes.length;
      if (n < 2) return 0;
      const tip = this.nodes[n - 1];
      const prev = this.nodes[n - 2];
      return Math.atan2(tip.y - prev.y, tip.x - prev.x) - Math.PI / 2;
    }
    get tipSpeed() {
      return Math.hypot(this.tip.vx, this.tip.vy);
    }
    /**
     * Advance one fixed step.
     * @param {number} dt  time scale, 1 = one 60 Hz frame
     */
    step(dt = 1) {
      this.time += dt;
      const w = this.time * 0.011 + this.windPhase;
      const windX = (Math.sin(w) * 0.62 + Math.sin(w * 2.37) * 0.24) * this.windAmp * this.windStrength * dt;
      const windY = Math.sin(w * 1.61) * 0.06 * this.windAmp * this.windStrength * dt;
      const nodes = this.nodes;
      for (let i = 1; i < nodes.length; i++) {
        const p = nodes[i];
        const t = i / (nodes.length - 1);
        const vx = (p.x - p.px) * this.damping;
        const vy = (p.y - p.py) * this.damping;
        p.px = p.x;
        p.py = p.y;
        p.x += vx + (p.ax + windX * t) * dt;
        p.y += vy + (this.gravity + p.ay + windY * t) * dt;
        p.ax = 0;
        p.ay = 0;
      }
      if (this.grabTarget) this._applyGrab();
      this._enforceReach();
      for (let k = 0; k < this.iterations; k++) this.solveConstraints();
      let extra = 0;
      while (extra < this.maxExtraIterations && this.maxStrain() > this.strainTolerance) {
        this.solveConstraints();
        extra++;
      }
      nodes[0].pinTo(this.anchor.x, this.anchor.y);
    }
    /** Worst segment strain as a fraction of rest length. */
    maxStrain() {
      const nodes = this.nodes;
      let worst = 0;
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        const s = Math.abs(d - this.rest) / this.rest;
        if (s > worst) worst = s;
      }
      return worst;
    }
    /**
     * Pull the tip toward the pointer — but toward a target that has already been
     * clamped to the cord's reach.
     *
     * Clamping the *target* rather than the result is the whole trick. If the tip
     * is allowed past the reachable disc, the constraint system becomes
     * infeasible and the solver resolves the conflict by stretching, which reads
     * as elastic. Clamping first means the cord simply goes taut and the charm
     * stops dead at the end of it, the way a real charm on a real string behaves.
     */
    _applyGrab() {
      const g = this.grabTarget;
      const tip = this.tip;
      const max = this.rest * (this.nodes.length - 1);
      let tx = g.x;
      let ty = g.y;
      const dx = tx - this.anchor.x;
      const dy = ty - this.anchor.y;
      const d = Math.hypot(dx, dy);
      if (d > max && d > 1e-6) {
        const k = max / d;
        tx = this.anchor.x + dx * k;
        ty = this.anchor.y + dy * k;
      }
      tip.px = tip.x;
      tip.py = tip.y;
      tip.x += (tx - tip.x) * g.lag;
      tip.y += (ty - tip.y) * g.lag;
    }
    /**
     * The cord has a fixed length, so the tip can never be further from the anchor
     * than that. Without this the constraint system becomes infeasible the moment
     * the pointer outruns the cord, and the solver resolves the conflict by
     * stretching — exactly the artefact this whole approach exists to avoid.
     */
    _enforceReach() {
      const tip = this.tip;
      const dx = tip.x - this.anchor.x;
      const dy = tip.y - this.anchor.y;
      const d = Math.hypot(dx, dy);
      const max = this.rest * (this.nodes.length - 1);
      if (d > max && d > 1e-6) {
        const k = max / d;
        tip.x = this.anchor.x + dx * k;
        tip.y = this.anchor.y + dy * k;
      }
    }
    /** Relax every distance constraint one pass, weighted by inverse mass. */
    solveConstraints() {
      const nodes = this.nodes;
      const rest = this.rest;
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        if (d < 1e-6) {
          dx = 1e-6;
          dy = 0;
          d = 1e-6;
        }
        const diff = (d - rest) / d * this.stiffness;
        const wa = a.pinned ? 0 : a.invMass;
        const wb = b.pinned ? 0 : b.invMass;
        const wsum = wa + wb;
        if (wsum === 0) continue;
        const ka = wa / wsum * diff;
        const kb = wb / wsum * diff;
        a.x += dx * ka;
        a.y += dy * ka;
        b.x -= dx * kb;
        b.y -= dy * kb;
      }
    }
    /**
     * Push nodes away from a point — this is what makes the charm lean away from a
     * passing cursor instead of sitting there like a sticker.
     */
    repel(x, y, radius = 150, strength = 2.4) {
      for (let i = 2; i < this.nodes.length; i++) {
        const p = this.nodes[i];
        const dx = p.x - x;
        const dy = p.y - y;
        const d = Math.hypot(dx, dy);
        if (d > radius || d < 1e-4) continue;
        const falloff = 1 - d / radius;
        const f = falloff * falloff * strength;
        p.addForce(dx / d * f, dy / d * f);
      }
    }
    /**
     * A fast pointer drags air with it. Applied along the whole cord so the swing
     * reads as one object rather than the tip twitching on its own.
     *
     * @param {number} vx  pointer velocity x, in px per frame
     * @param {number} vy  pointer velocity y
     */
    stir(x, y, vx, vy, radius = 130, strength = 0.06) {
      const speed = Math.hypot(vx, vy);
      if (speed < 1) return;
      for (let i = 1; i < this.nodes.length; i++) {
        const p = this.nodes[i];
        const d = Math.hypot(p.x - x, p.y - y);
        if (d > radius) continue;
        const falloff = (1 - d / radius) ** 2;
        const t = i / (this.nodes.length - 1);
        const k = falloff * strength * t;
        p.x += vx * k;
        p.y += vy * k;
      }
    }
    /**
     * Hold the tip under the pointer while grabbed. The pull is applied inside
     * `step()` so it is frame-rate independent and always runs before the cord's
     * own constraints get the final say.
     */
    dragTip(x, y, lag = 0.55) {
      this.grabTarget = { x, y, lag };
    }
    /** Let go. The tip keeps whatever velocity the drag gave it. */
    release() {
      this.grabTarget = null;
    }
    /** Inject release velocity so a flick throws the charm instead of dropping it. */
    flick(vx, vy, scale = 0.55) {
      const tip = this.tip;
      const prev = this.nodes[this.nodes.length - 2];
      const cvx = vx * scale;
      const cvy = vy * scale;
      tip.px = tip.x - cvx;
      tip.py = tip.y - cvy;
      prev.px = prev.x - cvx * 0.35;
      prev.py = prev.y - cvy * 0.35;
    }
    /** Keep the cord inside the stage. */
    clamp(width, height, pad = -20) {
      for (let i = 1; i < this.nodes.length; i++) {
        const p = this.nodes[i];
        if (p.x < pad) p.x = pad;
        if (p.x > width - pad) p.x = width - pad;
        if (p.y > height - pad) p.y = height - pad;
      }
    }
    /** Smooth spline through nodes — avoids angular polygonal kinks at joints. */
    path() {
      return this.pathTo(this.nodes);
    }
    pathTo(pts) {
      if (!pts || pts.length < 2) return "";
      if (pts.length === 2) {
        return `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)} L ${pts[1].x.toFixed(2)} ${pts[1].y.toFixed(2)}`;
      }
      let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
      }
      return d;
    }
  };

  // web/js/charms.js
  var anim = (el, frames, opts = {}) => el ? el.animate(frames, { easing: "ease-out", fill: "both", ...opts }) : null;
  var parts = (root, name) => Array.from(root.querySelectorAll(`[data-part="${name}"]`));
  var wait = (ms) => new Promise((r) => setTimeout(r, ms));
  var nazar = {
    id: "nazar",
    name: "Nazar boncu\u011Fu",
    origin: "T\xFCrkiye and the Mediterranean",
    plaque: "Blue glass that turns the evil eye away. Give it a flick.",
    ritualName: "Give it a flick",
    hint: "Give it a flick",
    sound: "glass",
    accent: "#1d4ed8",
    sway: 1,
    weight: 6,
    art: `
<svg class="charm-art" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="nz-1-__ID__" cx="32%" cy="24%" r="80%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="18%" stop-color="#1d4ed8"/>
      <stop offset="55%" stop-color="#0221ad"/>
      <stop offset="85%" stop-color="#02146e"/>
      <stop offset="100%" stop-color="#010a3d"/>
    </radialGradient>
    <radialGradient id="nz-2-__ID__" cx="36%" cy="28%" r="76%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="78%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="nz-3-__ID__" cx="36%" cy="28%" r="76%">
      <stop offset="0%" stop-color="#7dd3fc"/>
      <stop offset="30%" stop-color="#38bdf8"/>
      <stop offset="70%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>
    <radialGradient id="nz-4-__ID__" cx="38%" cy="30%" r="72%">
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
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
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
  <path d="M60 39.2 V48" stroke="#a16207" stroke-width="2.2" stroke-linecap="round"/>
  <g data-part="bead">
    <circle cx="60" cy="92" r="44" fill="url(#nz-1-__ID__)"/>
    <circle cx="60" cy="92" r="33" fill="url(#nz-2-__ID__)"/>
    <circle cx="60" cy="92" r="23" fill="url(#nz-3-__ID__)"/>
    <circle cx="60" cy="92" r="12" fill="url(#nz-4-__ID__)"/>
    <ellipse cx="43" cy="70" rx="14" ry="7" fill="#ffffff" opacity=".65" transform="rotate(-30 43 70)"/>
    <circle cx="40" cy="68" r="3.2" fill="#ffffff" opacity=".85"/>
    <ellipse cx="78" cy="112" rx="7" ry="4" fill="#ffffff" opacity=".25" transform="rotate(-30 78 112)"/>
    <circle cx="60" cy="92" r="44" fill="none" stroke="#020d40" stroke-width="1.8" opacity=".7"/>
  </g>
</svg>`,
    ritual(root, api) {
      const bead = parts(root, "bead")[0];
      api.play("glass");
      anim(bead, [
        { transform: "rotate(0deg) scale(1)" },
        { transform: "rotate(-9deg) scale(1.07)" },
        { transform: "rotate(7deg) scale(1.03)" },
        { transform: "rotate(0deg) scale(1)" }
      ], { duration: 780, easing: "cubic-bezier(.3,1.5,.4,1)" });
    }
  };
  var murugar = {
    id: "murugar",
    name: "Murugar",
    origin: "Tamil Nadu, South India",
    plaque: "Tamil Om with the vel inside, hung for courage before anything hard.",
    ritualName: "Raise the vel",
    hint: "Raise the vel",
    sound: "bell",
    accent: "#c9932f",
    sway: 0.9,
    weight: 9,
    art: `
<svg class="charm-art" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="mu-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7e2a4"/><stop offset=".45" stop-color="#d9a72c"/><stop offset="1" stop-color="#8a6510"/>
    </linearGradient>
    <linearGradient id="mu-steel-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f2f6fb"/><stop offset=".5" stop-color="#aab6c6"/><stop offset="1" stop-color="#6b7687"/>
    </linearGradient>
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
  <path d="M60 39.2 V54" stroke="#a16207" stroke-width="2" stroke-linecap="round"/>
  <circle cx="60" cy="56" r="4.2" fill="none" stroke="url(#mu-gold-__ID__)" stroke-width="2.4"/>
  <g data-part="medallion">
    <circle cx="60" cy="106" r="46" fill="url(#mu-gold-__ID__)" stroke="#7d5c14" stroke-width="2.6"/>
    <circle cx="60" cy="106" r="38.5" fill="none" stroke="#7d5c14" stroke-width="1.4" opacity=".65"/>
    <g data-part="peacock" style="transform-box:view-box;transform-origin:60px 138px">
      <g stroke="#1e6f5c" stroke-width="3" stroke-linecap="round" fill="none">
        <path d="M40 138 q-8 -22 2 -34"/><path d="M50 138 q-6 -24 2 -38"/><path d="M60 138 q0 -26 0 -40"/>
        <path d="M70 138 q6 -24 -2 -38"/><path d="M80 138 q8 -22 -2 -34"/>
      </g>
      <circle cx="42" cy="102" r="3" fill="#2f6bff"/><circle cx="52" cy="98" r="3" fill="#2f6bff"/>
      <circle cx="60" cy="96" r="3" fill="#e2603f"/><circle cx="68" cy="98" r="3" fill="#2f6bff"/>
      <circle cx="78" cy="102" r="3" fill="#2f6bff"/>
    </g>
    <text x="60" y="120" text-anchor="middle" font-size="52" font-family="'Noto Sans Tamil','Tamil Sangam MN',serif" fill="#6d4a10">\u0BD0</text>
    <g data-part="vel">
      <path d="M30 176 L88 64" stroke="url(#mu-steel-__ID__)" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="92" cy="66" rx="8" ry="19" fill="url(#mu-steel-__ID__)" stroke="#5a6472" stroke-width="1.6" transform="rotate(32 92 66)"/>
      <ellipse cx="88" cy="60" rx="2.6" ry="7" fill="#ffffff" opacity=".6" transform="rotate(32 88 60)"/>
      <circle cx="34" cy="172" r="5" fill="#d9a72c" stroke="#7d5c14" stroke-width="1.4"/>
    </g>
  </g>
</svg>`,
    ritual(root, api) {
      const vel = parts(root, "vel")[0];
      const fan = parts(root, "peacock")[0];
      api.play("bell");
      anim(vel, [
        { transform: "translateY(0)" },
        { transform: "translateY(-7px)" },
        { transform: "translateY(-2px)" },
        { transform: "translateY(0)" }
      ], { duration: 900, easing: "cubic-bezier(.3,1.5,.4,1)" });
      anim(fan, [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-6deg)" },
        { transform: "rotate(4deg)" },
        { transform: "rotate(0deg)" }
      ], { duration: 1e3, easing: "ease-in-out" });
      api.floater("vel raised");
    }
  };
  var karuppu = {
    id: "karuppu",
    name: "Karuppu",
    origin: "Tamil Nadu, South India",
    plaque: "A guardian of the crossroads, dark as his name, kept close.",
    ritualName: "Give it a gentle sway",
    hint: "Give it a gentle sway",
    sound: "chill",
    accent: "#6b6258",
    sway: 0.8,
    weight: 10,
    art: `
<svg class="charm-art" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="ka-skin-__ID__" cx="40%" cy="30%" r="80%">
      <stop offset="0" stop-color="#4a4038"/><stop offset="1" stop-color="#171310"/>
    </radialGradient>
    <linearGradient id="ka-steel-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e8edf5"/><stop offset="1" stop-color="#7d8598"/>
    </linearGradient>
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
    <linearGradient id="ka-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
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
  <g data-part="figure" style="transform-box:view-box;transform-origin:60px 30px">
    <path d="M60 40 q-26 4 -30 34 q-2 18 6 30 q10 14 24 14 t24 -14 q8 -12 6 -30 q-4 -30 -30 -34 Z" fill="url(#ka-skin-__ID__)" stroke="#0d0a08" stroke-width="2.4"/>
    <path d="M42 78 q18 8 36 0 l-4 34 q-14 7 -28 0 Z" fill="#211b15" stroke="#0d0a08" stroke-width="1.4"/>
    <path d="M36 60 h-14 M84 60 h14" stroke="#171310" stroke-width="8" stroke-linecap="round"/>
    <path d="M22 58 q10 9 22 4 M98 58 q-10 9 -22 4" stroke="#f2f0ea" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="45" cy="52" rx="5.5" ry="7.5" fill="#ffffff" stroke="#0d0a08" stroke-width="1.6"/>
    <ellipse cx="75" cy="52" rx="5.5" ry="7.5" fill="#ffffff" stroke="#0d0a08" stroke-width="1.6"/>
    <circle cx="45" cy="52" r="2.6" fill="#171310"/><circle cx="75" cy="52" r="2.6" fill="#171310"/>
    <path d="M56 45 q8 -8 20 0 q-10 10 -20 0 Z" fill="#c0392b" opacity=".9"/>
    <circle cx="60" cy="66" r="2.4" fill="none" stroke="#c9ced9" stroke-width="1.8"/>
    <path d="M52 120 q8 4 16 0 M52 128 q8 4 16 0" stroke="#0d0a08" stroke-width="2" fill="none" opacity=".5"/>
  </g>
  <g data-part="sickle" style="transform-box:view-box;transform-origin:100px 78px">
    <path d="M92 72 q20 -6 20 14 q0 14 -14 16 q-14 2 -20 -10 q5 -2 9 2 q7 7 17 4 q9 -2 9 -13 q0 -11 -13 -11 Z" fill="url(#ka-steel-__ID__)" stroke="#5a6472" stroke-width="1.6"/>
    <path d="M92 72 q-6 16 4 24" stroke="#8a5f36" stroke-width="5.5" stroke-linecap="round" fill="none"/>
  </g>
</svg>`,
    ritual(root, api) {
      const figure = parts(root, "figure")[0];
      const sickle = parts(root, "sickle")[0];
      api.play("chill");
      anim(figure, [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-5deg)" },
        { transform: "rotate(4deg)" },
        { transform: "rotate(-2deg)" },
        { transform: "rotate(0deg)" }
      ], { duration: 2200, easing: "ease-in-out" });
      anim(sickle, [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-9deg)" },
        { transform: "rotate(6deg)" },
        { transform: "rotate(0deg)" }
      ], { duration: 1500, easing: "ease-in-out" });
      api.floater("kept close");
    }
  };
  var nimbu = {
    id: "nimbu",
    name: "Nimbu-mirchi",
    origin: "India",
    plaque: "Seven chillies and a lime at the threshold, turning misfortune aside.",
    ritualName: "Hang a fresh garland",
    hint: "Hang a fresh garland",
    sound: "wish",
    accent: "#3d9e3a",
    sway: 1,
    weight: 7,
    art: `
<svg class="charm-art" viewBox="0 0 120 215" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="nm-chili-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5ec65e"/><stop offset="1" stop-color="#1c5e1e"/>
    </linearGradient>
    <linearGradient id="nm-wilt-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#9aa05a"/><stop offset="1" stop-color="#4a5520"/>
    </linearGradient>
    <radialGradient id="nm-lemon-__ID__" cx="35%" cy="28%" r="75%">
      <stop offset="0" stop-color="#fff3b0"/><stop offset="1" stop-color="#e8a820"/>
    </radialGradient>
    <radialGradient id="nm-wiltlemon-__ID__" cx="35%" cy="28%" r="75%">
      <stop offset="0" stop-color="#c9b46a"/><stop offset="1" stop-color="#8a7420"/>
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
  <path d="M60 39.2 V42" stroke="#a16207" stroke-width="2" stroke-linecap="round"/>
  <g data-part="garland" style="transform-box:view-box;transform-origin:60px 24px">
    <g transform="translate(60 34) rotate(-15)"><path d="M0 6 C8 4 12 -4 10 -13 C12 -4 4 2 0 4 Z" fill="url(#nm-chili-__ID__)" stroke="#145114" stroke-width="1"/><path d="M-1 6 L-3 14" stroke="#1c5e1e" stroke-width="2.4" stroke-linecap="round"/></g>
    <g transform="translate(60 51) rotate(14)"><path d="M0 6 C8 4 12 -4 10 -13 C12 -4 4 2 0 4 Z" fill="url(#nm-chili-__ID__)" stroke="#145114" stroke-width="1"/><path d="M1 6 L3 14" stroke="#1c5e1e" stroke-width="2.4" stroke-linecap="round"/></g>
    <g transform="translate(60 68) rotate(-12)"><path d="M0 6 C8 4 12 -4 10 -13 C12 -4 4 2 0 4 Z" fill="url(#nm-chili-__ID__)" stroke="#145114" stroke-width="1"/><path d="M-1 6 L-3 14" stroke="#1c5e1e" stroke-width="2.4" stroke-linecap="round"/></g>
    <g transform="translate(60 85) rotate(13)"><path d="M0 6 C8 4 12 -4 10 -13 C12 -4 4 2 0 4 Z" fill="url(#nm-chili-__ID__)" stroke="#145114" stroke-width="1"/><path d="M1 6 L3 14" stroke="#1c5e1e" stroke-width="2.4" stroke-linecap="round"/></g>
    <g transform="translate(60 102) rotate(-14)"><path d="M0 6 C8 4 12 -4 10 -13 C12 -4 4 2 0 4 Z" fill="url(#nm-chili-__ID__)" stroke="#145114" stroke-width="1"/><path d="M-1 6 L-3 14" stroke="#1c5e1e" stroke-width="2.4" stroke-linecap="round"/></g>
    <g transform="translate(60 119) rotate(12)"><path d="M0 6 C8 4 12 -4 10 -13 C12 -4 4 2 0 4 Z" fill="url(#nm-chili-__ID__)" stroke="#145114" stroke-width="1"/><path d="M1 6 L3 14" stroke="#1c5e1e" stroke-width="2.4" stroke-linecap="round"/></g>
    <g transform="translate(60 136) rotate(-11)"><path d="M0 6 C8 4 12 -4 10 -13 C12 -4 4 2 0 4 Z" fill="url(#nm-chili-__ID__)" stroke="#145114" stroke-width="1"/><path d="M-1 6 L-3 14" stroke="#1c5e1e" stroke-width="2.4" stroke-linecap="round"/></g>
    <path d="M60 148 V160 M60 186 V194" stroke="#1c5e1e" stroke-width="2.2" stroke-linecap="round"/>
    <ellipse cx="60" cy="172" rx="19" ry="15" fill="url(#nm-lemon-__ID__)" stroke="#a87810" stroke-width="1.8"/>
    <path d="M46 172 q-8 -6 -6 -14 M74 172 q8 -6 6 -14" stroke="#a87810" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="52" cy="166" rx="7" ry="4" fill="#ffffff" opacity=".5" transform="rotate(-28 52 166)"/>
    <ellipse cx="60" cy="201" rx="11" ry="9" fill="#2b2b2b"/>
    <ellipse cx="56" cy="197" rx="4" ry="2.6" fill="#4d4d4d"/>
  </g>
  <g data-part="wilt" opacity="0">
    <g transform="translate(60 34) rotate(-19)"><path d="M0 6 C8 4 12 -4 10 -13 C12 -4 4 2 0 4 Z" fill="url(#nm-wilt-__ID__)" stroke="#37401a" stroke-width="1"/><path d="M-1 6 L-3 14" stroke="#4a5520" stroke-width="2.4" stroke-linecap="round"/></g>
    <g transform="translate(60 51) rotate(18)"><path d="M0 6 C8 4 12 -4 10 -13 C12 -4 4 2 0 4 Z" fill="url(#nm-wilt-__ID__)" stroke="#37401a" stroke-width="1"/><path d="M1 6 L3 14" stroke="#4a5520" stroke-width="2.4" stroke-linecap="round"/></g>
    <g transform="translate(60 68) rotate(-16)"><path d="M0 6 C8 4 12 -4 10 -13 C12 -4 4 2 0 4 Z" fill="url(#nm-wilt-__ID__)" stroke="#37401a" stroke-width="1"/><path d="M-1 6 L-3 14" stroke="#4a5520" stroke-width="2.4" stroke-linecap="round"/></g>
    <g transform="translate(60 85) rotate(17)"><path d="M0 6 C8 4 12 -4 10 -13 C12 -4 4 2 0 4 Z" fill="url(#nm-wilt-__ID__)" stroke="#37401a" stroke-width="1"/><path d="M1 6 L3 14" stroke="#4a5520" stroke-width="2.4" stroke-linecap="round"/></g>
    <g transform="translate(60 102) rotate(-18)"><path d="M0 6 C8 4 12 -4 10 -13 C12 -4 4 2 0 4 Z" fill="url(#nm-wilt-__ID__)" stroke="#37401a" stroke-width="1"/><path d="M-1 6 L-3 14" stroke="#4a5520" stroke-width="2.4" stroke-linecap="round"/></g>
    <g transform="translate(60 119) rotate(16)"><path d="M0 6 C8 4 12 -4 10 -13 C12 -4 4 2 0 4 Z" fill="url(#nm-wilt-__ID__)" stroke="#37401a" stroke-width="1"/><path d="M1 6 L3 14" stroke="#4a5520" stroke-width="2.4" stroke-linecap="round"/></g>
    <g transform="translate(60 136) rotate(-15)"><path d="M0 6 C8 4 12 -4 10 -13 C12 -4 4 2 0 4 Z" fill="url(#nm-wilt-__ID__)" stroke="#37401a" stroke-width="1"/><path d="M-1 6 L-3 14" stroke="#4a5520" stroke-width="2.4" stroke-linecap="round"/></g>
    <path d="M60 148 V160 M60 186 V194" stroke="#4a5520" stroke-width="2.2" stroke-linecap="round"/>
    <ellipse cx="60" cy="172" rx="19" ry="15" fill="url(#nm-wiltlemon-__ID__)" stroke="#6d5a14" stroke-width="1.8"/>
    <path d="M46 172 q-8 -6 -6 -14 M74 172 q8 -6 6 -14" stroke="#6d5a14" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="60" cy="201" rx="11" ry="9" fill="#2b2b2b"/>
  </g>
</svg>`,
    ritual(root, api) {
      const garland = parts(root, "garland")[0];
      const wilt = parts(root, "wilt")[0];
      const wasFresh = root.dataset.fresh !== "0";
      root.dataset.fresh = wasFresh ? "0" : "1";
      api.play("wish");
      anim(garland, [{ opacity: 1 }, { opacity: wasFresh ? 0 : 1 }], { duration: 750, fill: "both" });
      anim(wilt, [{ opacity: 0 }, { opacity: wasFresh ? 1 : 0 }], { duration: 750, fill: "both" });
      api.floater(wasFresh ? "a week goes by" : "a fresh garland");
    }
  };
  var drishti = {
    id: "drishti",
    name: "Drishti bommai",
    origin: "South India",
    plaque: "A fierce guardian painted to meet the first bad glance.",
    ritualName: "Repaint it",
    hint: "Repaint the guardian",
    sound: "wish",
    accent: "#e2603f",
    sway: 0.9,
    weight: 9,
    art: `
<svg class="charm-art" viewBox="0 0 140 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="dr-1-__ID__" cx="38%" cy="26%" r="80%">
      <stop offset="0" stop-color="#ffd08a"/><stop offset="1" stop-color="#f0a04b"/>
    </radialGradient>
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
    <linearGradient id="dr-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
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
      const face = parts(root, "face")[0];
      const paints = ["#f0a04b", "#e2603f", "#c0392b", "#8e44ad", "#2e86c1", "#27ae60", "#f2c14e", "#f0a04b"];
      api.play("wish");
      for (const c of paints) {
        const grad = root.querySelector(`#dr-1-__ID__`.replace("__ID__", api.uid));
        if (grad) {
          grad.querySelectorAll("stop")[0].setAttribute("stop-color", lighten(c, 30));
          grad.querySelectorAll("stop")[1].setAttribute("stop-color", c);
        }
        anim(face, [{ transform: "scale(1)" }, { transform: "scale(1.045)" }, { transform: "scale(1)" }], { duration: 150 });
        api.tick();
        await wait(150);
      }
      api.floater("repainted \xD77");
    }
  };
  var om = {
    id: "om",
    name: "Om",
    origin: "India",
    plaque: "The first sound, cast in brass. Let it settle the room.",
    ritualName: "Let it glow",
    hint: "Let it glow",
    sound: "wish",
    accent: "#c9932f",
    sway: 0.85,
    weight: 9,
    art: `
<svg class="charm-art" viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="om-gold-__ID__" cx="36%" cy="24%" r="80%">
      <stop offset="0" stop-color="#fce9ad"/><stop offset=".5" stop-color="#d9a72c"/><stop offset="1" stop-color="#8a6510"/>
    </radialGradient>
    <filter id="om-blur-__ID__" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="11"/></filter>
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
  <path d="M60 39.2 V50" stroke="#a16207" stroke-width="2" stroke-linecap="round"/>
  <circle cx="60" cy="52" r="4" fill="none" stroke="url(#om-gold-__ID__)" stroke-width="2.2"/>
  <g data-part="glow" opacity="0">
    <circle cx="60" cy="102" r="54" fill="#f2c14e" filter="url(#om-blur-__ID__)"/>
  </g>
  <g data-part="medallion">
    <circle cx="60" cy="102" r="46" fill="url(#om-gold-__ID__)" stroke="#7d5c14" stroke-width="2.6"/>
    <circle cx="60" cy="102" r="39" fill="none" stroke="#7d5c14" stroke-width="1.2" opacity=".6"/>
    <text x="60" y="112" text-anchor="middle" font-size="58" font-family="serif" fill="#5f4309">\u0950</text>
    <ellipse cx="44" cy="80" rx="13" ry="7" fill="#ffffff" opacity=".35" transform="rotate(-28 44 80)"/>
  </g>
</svg>`,
    ritual(root, api) {
      const glow = parts(root, "glow")[0];
      api.play("wish");
      anim(glow, [
        { opacity: 0 },
        { opacity: 0.95, offset: 0.35 },
        { opacity: 0.5, offset: 0.62 },
        { opacity: 0.95, offset: 0.82 },
        { opacity: 0 }
      ], { duration: 2400, easing: "ease-in-out" });
      api.floater("let it glow");
    }
  };
  var ghanta = {
    id: "ghanta",
    name: "Ghanta",
    origin: "India",
    plaque: "A temple bell rung to clear the air before something matters.",
    ritualName: "Ring it",
    hint: "Ring the bell",
    sound: "bell",
    accent: "#c9932f",
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
  <g data-part="bell" style="transform-box:view-box;transform-origin:60px 38px">
    <circle cx="60" cy="40" r="3.5" fill="url(#gh-2-__ID__)"/>
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
      const bell2 = parts(root, "bell")[0];
      const clapper = parts(root, "clapper")[0];
      api.play("bell");
      api.ripple("ring");
      anim(bell2, [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-13deg)" },
        { transform: "rotate(11deg)" },
        { transform: "rotate(-8deg)" },
        { transform: "rotate(5deg)" },
        { transform: "rotate(-2deg)" },
        { transform: "rotate(0deg)" }
      ], { duration: 1500, easing: "ease-in-out" });
      anim(clapper, [
        { transform: "rotate(0deg) translateX(0)" },
        { transform: "rotate(-16deg) translateX(3px)" },
        { transform: "rotate(14deg) translateX(-3px)" },
        { transform: "rotate(-9deg)" },
        { transform: "rotate(4deg)" },
        { transform: "rotate(0deg)" }
      ], { duration: 1500, easing: "ease-in-out" });
    }
  };
  var peacock = {
    id: "peacock",
    name: "Peacock",
    origin: "India",
    plaque: "Feathers fanned against envy, a sign good news is on its way.",
    ritualName: "Fan the feathers",
    hint: "Fan the feathers",
    sound: "sparkle",
    accent: "#2f6bff",
    sway: 0.9,
    weight: 9,
    art: `
<svg class="charm-art" viewBox="0 0 140 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="pk-body-__ID__" cx="38%" cy="30%" r="80%">
      <stop offset="0" stop-color="#4a86ff"/><stop offset="1" stop-color="#12309b"/>
    </radialGradient>
    <linearGradient id="pk-teal-__ID__" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2fa8a0"/><stop offset="1" stop-color="#14706f"/>
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
    <linearGradient id="pk-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="35%" stop-color="#eab308"/>
      <stop offset="75%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
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
  <path d="M70 39.2 V44" stroke="#a16207" stroke-width="2" stroke-linecap="round"/>
  <circle cx="70" cy="46" r="3.8" fill="none" stroke="url(#pk-gold-__ID__)" stroke-width="2.2"/>
  <g transform="translate(0, -28)">
    <g data-part="fan" style="transform-box:view-box;transform-origin:70px 122px;transform:scale(1,.16)">
      <g stroke="url(#pk-teal-__ID__)" stroke-width="4" stroke-linecap="round" fill="none">
        <path d="M70 150 q-58 -26 -60 -96"/><path d="M70 150 q-48 -34 -44 -104"/>
        <path d="M70 150 q-30 -42 -24 -110"/><path d="M70 150 q0 -46 0 -114"/>
        <path d="M70 150 q30 -42 24 -110"/><path d="M70 150 q48 -34 44 -104"/>
        <path d="M70 150 q58 -26 60 -96"/>
      </g>
      <g fill="#2f6bff" stroke="#f2c14e" stroke-width="1.4">
        <ellipse cx="14" cy="46" rx="7" ry="10" transform="rotate(12 14 46)"/>
        <ellipse cx="28" cy="40" rx="7" ry="10" transform="rotate(8 28 40)"/>
        <ellipse cx="44" cy="36" rx="7" ry="10"/>
        <ellipse cx="70" cy="34" rx="7" ry="10"/>
        <ellipse cx="96" cy="36" rx="7" ry="10"/>
        <ellipse cx="112" cy="40" rx="7" ry="10" transform="rotate(-8 112 40)"/>
        <ellipse cx="126" cy="46" rx="7" ry="10" transform="rotate(-12 126 46)"/>
      </g>
      <g fill="#14706f">
        <ellipse cx="14" cy="46" rx="3" ry="5" transform="rotate(12 14 46)"/>
        <ellipse cx="28" cy="40" rx="3" ry="5" transform="rotate(8 28 40)"/>
        <ellipse cx="44" cy="36" rx="3" ry="5"/>
        <ellipse cx="70" cy="34" rx="3" ry="5"/>
        <ellipse cx="96" cy="36" rx="3" ry="5"/>
        <ellipse cx="112" cy="40" rx="3" ry="5" transform="rotate(-8 112 40)"/>
        <ellipse cx="126" cy="46" rx="3" ry="5" transform="rotate(-12 126 46)"/>
      </g>
    </g>
    <g data-part="body">
      <ellipse cx="70" cy="156" rx="20" ry="27" fill="url(#pk-body-__ID__)" stroke="#0a1747" stroke-width="2"/>
      <path d="M70 134 q-6 -22 0 -40" stroke="url(#pk-body-__ID__)" stroke-width="11" fill="none" stroke-linecap="round"/>
      <circle cx="70" cy="90" r="8.5" fill="url(#pk-body-__ID__)" stroke="#0a1747" stroke-width="2"/>
      <path d="M74 86 l7 -4 M72 85 l4 -7 M70 85 l0 -8" stroke="#12309b" stroke-width="1.6" stroke-linecap="round" fill="none"/>
      <path d="M66 88 l-5 3" stroke="#f2c14e" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="67" cy="89" r="1.6" fill="#ffffff"/>
      <ellipse cx="52" cy="150" rx="6" ry="16" fill="#12309b" opacity=".85"/>
      <ellipse cx="88" cy="150" rx="6" ry="16" fill="#12309b" opacity=".85"/>
      <ellipse cx="70" cy="177" rx="12" ry="4" fill="#0a1747" opacity=".3"/>
    </g>
  </g>
</svg>`,
    ritual(root, api) {
      const fan = parts(root, "fan")[0];
      const open = root.dataset.fanned !== "1";
      root.dataset.fanned = open ? "1" : "0";
      api.play("sparkle");
      anim(fan, [
        { transform: "scale(1,.16)" },
        { transform: "scale(1,1)" }
      ], {
        duration: open ? 900 : 620,
        easing: "cubic-bezier(.3,1.4,.4,1)",
        fill: "both",
        direction: open ? "normal" : "reverse"
      });
      api.floater(open ? "feathers fanned" : "feathers folded");
    }
  };
  var elephant = {
    id: "elephant",
    name: "Elephant",
    origin: "India and Southeast Asia",
    plaque: "Trunk raised, clearing obstacles at the start of every venture.",
    ritualName: "Give it a flick",
    hint: "Give it a flick",
    sound: "flick",
    accent: "#8b929e",
    sway: 0.85,
    weight: 10,
    art: `
<svg class="charm-art" viewBox="0 0 140 205" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="el-skin-__ID__" cx="36%" cy="28%" r="82%">
      <stop offset="0" stop-color="#c6ccd6"/><stop offset="1" stop-color="#7d848f"/>
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
    <linearGradient id="el-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
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
  <path d="M70 39.2 V46" stroke="#a16207" stroke-width="2" stroke-linecap="round"/>
  <g data-part="elephant">
    <ellipse cx="70" cy="132" rx="37" ry="42" fill="url(#el-skin-__ID__)" stroke="#5a616d" stroke-width="2.2"/>
    <path d="M44 96 q-16 4 -18 22 q-1 12 6 16 q14 -18 20 -34 Z" fill="url(#el-skin-__ID__)" stroke="#5a616d" stroke-width="2"/>
    <path d="M96 96 q16 4 18 22 q1 12 -6 16 q-14 -18 -20 -34 Z" fill="url(#el-skin-__ID__)" stroke="#5a616d" stroke-width="2"/>
    <path d="M52 96 q6 -6 14 -2 M88 96 q-6 -6 -14 -2" stroke="#5a616d" stroke-width="1.6" fill="none" opacity=".7"/>
    <circle cx="70" cy="98" r="27" fill="url(#el-skin-__ID__)" stroke="#5a616d" stroke-width="2.2"/>
    <path d="M60 96 q-12 -10 -8 -22 q6 -4 9 2 q-4 10 2 16 Z" fill="#ffffff" stroke="#d8dde4" stroke-width="1.2"/>
    <path d="M80 96 q12 -10 8 -22 q-6 -4 -9 2 q4 10 -2 16 Z" fill="#ffffff" stroke="#d8dde4" stroke-width="1.2"/>
    <g data-part="trunk" style="transform-box:view-box;transform-origin:70px 96px">
      <path d="M70 100 Q70 80 76 66 Q82 52 70 48" stroke="url(#el-skin-__ID__)" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M70 100 Q70 80 76 66 Q82 52 70 48" stroke="#5a616d" stroke-width="1.4" fill="none" opacity=".5"/>
    </g>
    <circle cx="62" cy="94" r="2.6" fill="#2b2f36"/>
    <circle cx="78" cy="94" r="2.6" fill="#2b2f36"/>
    <rect x="52" y="112" width="36" height="16" rx="6" fill="#c0392b" stroke="#7d0f0f" stroke-width="1.6"/>
    <circle cx="70" cy="123" r="3.4" fill="#f2c14e" stroke="#8a6d12" stroke-width="1.2"/>
    <rect x="46" y="160" width="17" height="26" rx="8" fill="url(#el-skin-__ID__)" stroke="#5a616d" stroke-width="2"/>
    <rect x="77" y="160" width="17" height="26" rx="8" fill="url(#el-skin-__ID__)" stroke="#5a616d" stroke-width="2"/>
    <ellipse cx="52" cy="172" rx="4" ry="2.6" fill="#5a616d"/>
    <ellipse cx="88" cy="172" rx="4" ry="2.6" fill="#5a616d"/>
    <ellipse cx="56" cy="110" rx="6" ry="3" fill="#ffffff" opacity=".35" transform="rotate(-24 56 110)"/>
  </g>
</svg>`,
    ritual(root, api) {
      const trunk = parts(root, "trunk")[0];
      api.play("flick");
      anim(trunk, [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-12deg)" },
        { transform: "rotate(8deg)" },
        { transform: "rotate(-4deg)" },
        { transform: "rotate(0deg)" }
      ], { duration: 1100, easing: "ease-in-out" });
      api.floater("trunk up");
    }
  };
  var hamsa = {
    id: "hamsa",
    name: "Hamsa",
    origin: "Middle East and North Africa",
    plaque: "The open hand, carried for protection. Flick bad luck away.",
    ritualName: "Give it a flick",
    hint: "Give it a flick",
    sound: "glass",
    accent: "#1552b8",
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
    <linearGradient id="hm-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
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
  <rect x="43" y="38" width="44" height="2.8" rx="1.4" fill="url(#hm-gold-__ID__)"/>
  <rect x="44.8" y="39.2" width="2.4" height="16" rx="1.2" fill="url(#hm-gold-__ID__)"/>
  <rect x="65.8" y="39.2" width="2.4" height="8" rx="1.2" fill="url(#hm-gold-__ID__)"/>
  <rect x="86.8" y="39.2" width="2.4" height="20" rx="1.2" fill="url(#hm-gold-__ID__)"/>
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
      const hand = parts(root, "hand")[0];
      api.play("glass");
      anim(hand, [
        { transform: "rotate(0deg)" },
        { transform: "rotate(10deg) translateX(3px)" },
        { transform: "rotate(-8deg)" },
        { transform: "rotate(0deg)" }
      ], { duration: 820, easing: "cubic-bezier(.3,1.5,.4,1)" });
    }
  };
  var panchang = {
    id: "panchang",
    name: "P\xE1nch\xE1ng ji\xE9",
    origin: "China",
    plaque: "One unbroken red cord, tied for luck without end.",
    ritualName: "Cinch it",
    hint: "Tie in good fortune",
    sound: "wish",
    accent: "#d42a2a",
    sway: 1.05,
    weight: 6,
    art: `
<svg class="charm-art" viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="pc-1-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ef4444"/><stop offset=".4" stop-color="#dc2626"/><stop offset="1" stop-color="#7f1d1d"/>
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
    <linearGradient id="pc-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
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
  <path d="M60 39.2 V42" stroke="#a16207" stroke-width="2" stroke-linecap="round"/>
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
      const knot = parts(root, "knot")[0];
      const tassel = parts(root, "tassel")[0];
      api.play("wish");
      anim(knot, [
        { transform: "scale(1,1)" },
        { transform: "scale(1.3,.72)" },
        { transform: "scale(.92,1.12)" },
        { transform: "scale(1,1)" }
      ], { duration: 620, easing: "cubic-bezier(.3,1.4,.4,1)" });
      anim(tassel, [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-12deg)" },
        { transform: "rotate(10deg)" },
        { transform: "rotate(-5deg)" },
        { transform: "rotate(0deg)" }
      ], { duration: 1200, easing: "ease-in-out" });
      api.floater("tied in");
    }
  };
  var horseshoe = {
    id: "horseshoe",
    name: "Horseshoe",
    origin: "Europe and the Americas",
    plaque: "Open end up, so the luck stays in and cannot pour out.",
    ritualName: "Give it a flick",
    hint: "Give it a flick",
    sound: "bonk",
    accent: "#8d93a1",
    sway: 0.9,
    weight: 10,
    art: `
<svg class="charm-art" viewBox="0 0 130 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="hs-1-__ID__" x1="0" y1="0" x2="1" y2=".3">
      <stop offset="0" stop-color="#4b505c"/><stop offset=".28" stop-color="#b9c0cc"/>
      <stop offset=".55" stop-color="#6e7481"/><stop offset=".8" stop-color="#d5dae2"/><stop offset="1" stop-color="#41454f"/>
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
  <path d="M56 39.2 q9 7 18 0" stroke="url(#hs-gold-__ID__)" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`,
    ritual(root, api) {
      const shoe = parts(root, "shoe")[0];
      api.play("bonk");
      anim(shoe, [
        { transform: "rotate(0deg)" },
        { transform: "rotate(16deg)" },
        { transform: "rotate(-14deg)" },
        { transform: "rotate(9deg)" },
        { transform: "rotate(-5deg)" },
        { transform: "rotate(0deg)" }
      ], { duration: 1300, easing: "ease-in-out" });
    }
  };
  var clover = {
    id: "clover",
    name: "Four-leaf clover",
    origin: "Ireland",
    plaque: "Found, never planted. A leaf for faith, hope, love and luck.",
    ritualName: "Give it a flick",
    hint: "Give it a flick",
    sound: "sparkle",
    accent: "#15803d",
    sway: 1.05,
    weight: 5,
    art: `
<svg class="charm-art" viewBox="0 0 120 175" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
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
    <linearGradient id="cv-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <radialGradient id="cv-leaf-__ID__" cx="35%" cy="26%" r="78%">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="20%" stop-color="#22c55e"/>
      <stop offset="55%" stop-color="#16a34a"/>
      <stop offset="82%" stop-color="#15803d"/>
      <stop offset="100%" stop-color="#0f3d1e"/>
    </radialGradient>
    <filter id="cv-shadow-__ID__" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="4.5" flood-color="#052e16" flood-opacity="0.25"/>
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
  <!-- Signature metallic gold jump-ring (clear open interior hole) -->
  <circle cx="60" cy="34" r="5.2" fill="none" stroke="url(#cv-gold-__ID__)" stroke-width="2.3"/>
  <!-- Four-leaf clover connected at the bottom rim of the gold ring -->
  <g data-part="clover" filter="url(#cv-shadow-__ID__)" style="transform-box:view-box;transform-origin:60px 71px">
    <!-- Natural curving stem tapering to bottom right -->
    <path d="M60 71 C60 92 64 108 67.5 118 C68 119.5 66 120.5 64.5 119 C60.5 107 56.5 91 57 71 Z" fill="#15803d" stroke="#14532d" stroke-width="1"/>
    <!-- Top leaf (meeting bottom of gold ring at y=39) -->
    <g transform="rotate(0 60 71)">
      <path d="M60 41 C51 25 35 28 35 43 C35 57 49 64 60 71 C71 64 85 57 85 43 C85 28 69 25 60 41 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.6"/>
      <path d="M60 42 C52 28 38 30 38 43 C38 55 50 62 60 69 C70 62 82 55 82 43 C82 30 68 28 60 42 Z" fill="url(#cv-leaf-__ID__)" stroke="#14532d" stroke-width="1.2"/>
      <path d="M60 67 C59.5 58 59.5 50 60 46" stroke="#bbf7d0" stroke-width="1.2" opacity=".8" stroke-linecap="round"/>
    </g>
    <!-- Right leaf -->
    <g transform="rotate(90 60 71)">
      <path d="M60 41 C51 25 35 28 35 43 C35 57 49 64 60 71 C71 64 85 57 85 43 C85 28 69 25 60 41 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.6"/>
      <path d="M60 42 C52 28 38 30 38 43 C38 55 50 62 60 69 C70 62 82 55 82 43 C82 30 68 28 60 42 Z" fill="url(#cv-leaf-__ID__)" stroke="#14532d" stroke-width="1.2"/>
      <path d="M60 67 C59.5 58 59.5 50 60 46" stroke="#bbf7d0" stroke-width="1.2" opacity=".8" stroke-linecap="round"/>
    </g>
    <!-- Bottom leaf -->
    <g transform="rotate(180 60 71)">
      <path d="M60 41 C51 25 35 28 35 43 C35 57 49 64 60 71 C71 64 85 57 85 43 C85 28 69 25 60 41 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.6"/>
      <path d="M60 42 C52 28 38 30 38 43 C38 55 50 62 60 69 C70 62 82 55 82 43 C82 30 68 28 60 42 Z" fill="url(#cv-leaf-__ID__)" stroke="#14532d" stroke-width="1.2"/>
      <path d="M60 67 C59.5 58 59.5 50 60 46" stroke="#bbf7d0" stroke-width="1.2" opacity=".8" stroke-linecap="round"/>
    </g>
    <!-- Left leaf -->
    <g transform="rotate(270 60 71)">
      <path d="M60 41 C51 25 35 28 35 43 C35 57 49 64 60 71 C71 64 85 57 85 43 C85 28 69 25 60 41 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.6"/>
      <path d="M60 42 C52 28 38 30 38 43 C38 55 50 62 60 69 C70 62 82 55 82 43 C82 30 68 28 60 42 Z" fill="url(#cv-leaf-__ID__)" stroke="#14532d" stroke-width="1.2"/>
      <path d="M60 67 C59.5 58 59.5 50 60 46" stroke="#bbf7d0" stroke-width="1.2" opacity=".8" stroke-linecap="round"/>
    </g>
    <!-- Center pip -->
    <circle cx="60" cy="71" r="3.8" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="60" cy="71" r="2.4" fill="url(#cv-gold-__ID__)"/>
    <circle cx="60" cy="71" r="1.2" fill="#15803d"/>
  </g>
</svg>`,
    ritual(root, api) {
      const clover2 = parts(root, "clover")[0];
      api.play("sparkle");
      anim(clover2, [
        { transform: "rotate(0deg) scale(1)" },
        { transform: "rotate(-11deg) scale(1.1)" },
        { transform: "rotate(8deg) scale(1.03)" },
        { transform: "rotate(0deg) scale(1)" }
      ], { duration: 900, easing: "cubic-bezier(.3,1.5,.4,1)" });
      api.floater("lucky find");
    }
  };
  var maneki = {
    id: "maneki",
    name: "Maneki-neko",
    origin: "Japan",
    plaque: "The beckoning cat, inviting good fortune through the door.",
    ritualName: "Beckon",
    hint: "Beckon good fortune",
    sound: "chirp",
    accent: "#e8b23a",
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
    <linearGradient id="mk-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
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
  <path d="M65 39.2 V48" stroke="#a16207" stroke-width="2" stroke-linecap="round"/>
  <ellipse cx="65" cy="146" rx="40" ry="8" fill="#000" opacity=".08"/>
  <path d="M40 96 q-6 40 4 52 q21 8 42 0 q10 -12 4 -52 Z" fill="url(#mk-1-__ID__)" stroke="#b9b1a4" stroke-width="2"/>
  <path d="M40 96 q-6 40 4 52 q10 4 21 4 v-56 Z" fill="#f0a04b" opacity=".55"/>
  <path d="M52 100 q-2 30 0 44 M78 100 q2 30 0 44" stroke="#c9c1b4" stroke-width="1.4" fill="none" opacity=".7"/>
  <ellipse cx="65" cy="128" rx="17" ry="14" fill="url(#mk-2-__ID__)" stroke="#9a7420" stroke-width="1.8"/>
  <text x="65" y="133" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="700" fill="#7d5c14">\u958B\u904B</text>
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
      const paw = parts(root, "paw")[0];
      api.play("chirp");
      const seq = [0, -26, -4, -22, -4, -15, -3, -8, 0];
      anim(
        paw,
        seq.map((r) => ({ transform: `rotate(${r}deg)` })),
        { duration: 2100, easing: "ease-in-out" }
      );
      api.floater("come here, luck");
    }
  };
  var daruma = {
    id: "daruma",
    name: "Daruma",
    origin: "Japan",
    plaque: "A wishing doll. One eye for the wish, one for the win.",
    ritualName: "Make a wish",
    hint: "Make a wish",
    sound: "wish",
    accent: "#cf2b2b",
    sway: 1.1,
    weight: 9,
    art: `
<svg class="charm-art" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="dm-1-__ID__" cx="35%" cy="24%" r="85%">
      <stop offset="0" stop-color="#ef4444"/><stop offset=".45" stop-color="#dc2626"/><stop offset="1" stop-color="#7f1d1d"/>
    </radialGradient>
    <clipPath id="dm-c-__ID__"><path d="M60 26 q38 4 42 62 q4 52 -42 56 q-46 -4 -42 -56 q4 -58 42 -62 Z"/></clipPath>
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
    <linearGradient id="dm-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
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
  <path d="M60 39.2 V42" stroke="#a16207" stroke-width="2" stroke-linecap="round"/>
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
      const doll = parts(root, "doll")[0];
      const pl = parts(root, "pupilL")[0];
      const pr = parts(root, "pupilR")[0];
      const wished = root.dataset.wished === "1";
      api.play("wish");
      const target = wished ? pr : pl;
      anim(target, [{ rx: 0, ry: 0 }, { rx: 5, ry: 6 }], { duration: 520, easing: "ease-out" });
      target.setAttribute("rx", 5);
      target.setAttribute("ry", 6);
      root.dataset.wished = wished ? "0" : "1";
      anim(doll, [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-7deg)" },
        { transform: "rotate(6deg)" },
        { transform: "rotate(-3deg)" },
        { transform: "rotate(0deg)" }
      ], { duration: 1e3, easing: "ease-in-out" });
      api.floater(wished ? "wish granted" : "wish made");
      api.aura(25);
    }
  };
  var scarab = {
    id: "scarab",
    name: "Scarab",
    origin: "Ancient Egypt",
    plaque: "The beetle of renewal, for beginnings that deserve a second dawn.",
    ritualName: "Catch the light",
    hint: "Catch the light",
    sound: "sparkle",
    accent: "#2fa8a0",
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
    <linearGradient id="sc-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
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
  <path d="M80 39.2 V48" stroke="#a16207" stroke-width="2" stroke-linecap="round"/>
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
      const wl = parts(root, "wingL")[0];
      const wr = parts(root, "wingR")[0];
      api.play("sparkle");
      const open = [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-13deg)" },
        { transform: "rotate(-4deg)" },
        { transform: "rotate(0deg)" }
      ];
      const openR = [
        { transform: "rotate(0deg)" },
        { transform: "rotate(13deg)" },
        { transform: "rotate(4deg)" },
        { transform: "rotate(0deg)" }
      ];
      anim(wl, open, { duration: 1700, easing: "cubic-bezier(.3,1.3,.4,1)" });
      anim(wr, openR, { duration: 1700, easing: "cubic-bezier(.3,1.3,.4,1)" });
      anim(parts(root, "body")[0], [
        { filter: "brightness(1)" },
        { filter: "brightness(2.1)" },
        { filter: "brightness(1.35)" },
        { filter: "brightness(1)" }
      ], { duration: 1300, easing: "ease-in-out" });
      api.floater("light caught");
    }
  };
  var ladybug = {
    id: "ladybug",
    name: "Ladybug",
    origin: "Europe",
    plaque: "Count the seven spots for the months until your wish arrives.",
    ritualName: "Give it a flick",
    hint: "Give it a flick",
    sound: "tick",
    accent: "#d42a2a",
    sway: 1.1,
    weight: 5,
    art: `
<svg class="charm-art" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="lb-red-__ID__" cx="36%" cy="24%" r="85%">
      <stop offset="0" stop-color="#ef4444"/><stop offset=".4" stop-color="#dc2626"/><stop offset="1" stop-color="#7f1d1d"/>
    </radialGradient>
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
    <linearGradient id="lb-gold-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
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
  <g data-part="bug" style="transform-box:view-box;transform-origin:60px 40px">
    <path d="M60 40 q-5 -14 0 -22 M60 18 q7 9 5 16" stroke="#1b1b1b" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="60" cy="52" r="9" fill="#1b1b1b"/>
    <circle cx="55.6" cy="50" r="1.8" fill="#ffffff"/><circle cx="64.4" cy="50" r="1.8" fill="#ffffff"/>
    <path d="M30 96 q0 -36 30 -36 t30 36 q0 6 -2 10 l-28 18 -28 -18 q-2 -4 -2 -10 Z" fill="url(#lb-red-__ID__)" stroke="#7d0f0f" stroke-width="2.4"/>
    <path d="M60 60 v46" stroke="#7d0f0f" stroke-width="2.4"/>
    <ellipse cx="60" cy="122" rx="30" ry="8" fill="#1b1b1b"/>
    <g fill="#1b1b1b">
      <circle cx="60" cy="68" r="3.4"/>
      <circle cx="47" cy="78" r="4"/><circle cx="73" cy="78" r="4"/>
      <circle cx="41" cy="94" r="4.6"/><circle cx="79" cy="94" r="4.6"/>
      <circle cx="51" cy="110" r="4.6"/><circle cx="69" cy="110" r="4.6"/>
    </g>
    <ellipse cx="42" cy="82" rx="7" ry="4" fill="#ffffff" opacity=".4" transform="rotate(-30 42 82)"/>
  </g>
</svg>`,
    ritual(root, api) {
      const bug = parts(root, "bug")[0];
      api.play("tick");
      anim(bug, [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-13deg)" },
        { transform: "rotate(10deg)" },
        { transform: "rotate(-5deg)" },
        { transform: "rotate(0deg)" }
      ], { duration: 950, easing: "ease-in-out" });
      api.floater("seven spots");
    }
  };
  var dreamcatcher = {
    id: "dreamcatcher",
    name: "Dreamcatcher",
    origin: "Ojibwe, North America",
    plaque: "A willow hoop and web that keeps the bad dreams by morning.",
    ritualName: "Give it a flick",
    hint: "Give it a flick",
    sound: "sway",
    accent: "#c9a26a",
    sway: 1,
    weight: 7,
    art: `
<svg class="charm-art" viewBox="0 0 120 215" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="dc-hoop-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d3ab72"/><stop offset="1" stop-color="#8a5f36"/>
    </linearGradient>
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
  <g data-part="web" style="transform-box:view-box;transform-origin:60px 80px">
    <circle cx="60" cy="80" r="40" fill="none" stroke="url(#dc-hoop-__ID__)" stroke-width="6"/>
    <circle cx="60" cy="80" r="40" fill="none" stroke="#6d4a29" stroke-width="1.4" opacity=".5"/>
    <g stroke="#e6d3b0" stroke-width="1.2" fill="none" opacity=".9">
      <circle cx="60" cy="80" r="30"/><circle cx="60" cy="80" r="21"/>
      <circle cx="60" cy="80" r="12"/><circle cx="60" cy="80" r="4"/>
      <path d="M60 80 L60 40 M60 80 L95 60 M60 80 L95 100 M60 80 L60 120 M60 80 L25 100 M60 80 L25 60 M60 80 L43 46 M60 80 L77 46 M60 80 L77 114 M60 80 L43 114"/>
      <path d="M47 48 q13 6 26 0 M35 65 q25 8 50 0 M35 95 q25 8 50 0 M47 112 q13 6 26 0"/>
    </g>
    <circle cx="28" cy="52" r="3.2" fill="#2fa8a0"/><circle cx="92" cy="52" r="3.2" fill="#2fa8a0"/>
    <circle cx="60" cy="120" r="3.2" fill="#2fa8a0"/>
  </g>
  <g data-part="feathers" style="transform-box:view-box;transform-origin:60px 122px">
    <path d="M42 122 v36 M60 122 v42 M78 122 v36" stroke="#8a5f36" stroke-width="2.2"/>
    <path d="M42 158 q-12 8 -10 24 q12 -8 14 -22 Z" fill="#f4efe6" stroke="#b9ab90" stroke-width="1.4"/>
    <path d="M42 158 q-11 8 -9 22" stroke="#b9ab90" stroke-width="1" fill="none"/>
    <path d="M60 164 q-12 10 -10 28 q13 -9 15 -26 Z" fill="#f4efe6" stroke="#b9ab90" stroke-width="1.4"/>
    <path d="M60 164 q-11 9 -9 26" stroke="#b9ab90" stroke-width="1" fill="none"/>
    <path d="M78 158 q-14 6 -12 22 q11 -8 15 -20 Z" fill="#f4efe6" stroke="#b9ab90" stroke-width="1.4"/>
    <circle cx="42" cy="150" r="2.6" fill="#e2603f"/>
    <circle cx="60" cy="156" r="2.6" fill="#2fa8a0"/>
    <circle cx="78" cy="150" r="2.6" fill="#e2603f"/>
  </g>
</svg>`,
    ritual(root, api) {
      const feathers = parts(root, "feathers")[0];
      const web = parts(root, "web")[0];
      api.play("sway");
      anim(feathers, [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-9deg)" },
        { transform: "rotate(7deg)" },
        { transform: "rotate(-3deg)" },
        { transform: "rotate(0deg)" }
      ], { duration: 1600, easing: "ease-in-out" });
      anim(web, [
        { transform: "rotate(0deg)" },
        { transform: "rotate(4deg)" },
        { transform: "rotate(-3deg)" },
        { transform: "rotate(0deg)" }
      ], { duration: 1600, easing: "ease-in-out" });
      api.floater("good dreams");
    }
  };
  var bamboo = {
    id: "bamboo",
    name: "Lucky bamboo",
    origin: "China",
    plaque: "Three stalks for happiness, wealth and long life. It grows anyway.",
    ritualName: "Give it a flick",
    hint: "Give it a flick",
    sound: "sway",
    accent: "#4a9e3a",
    sway: 1,
    weight: 7,
    art: `
<svg class="charm-art" viewBox="0 0 120 215" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="bm-stalk-__ID__" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#5faf47"/><stop offset=".55" stop-color="#8ccf5e"/><stop offset="1" stop-color="#3d7a2a"/>
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
  <g data-part="stalks" style="transform-box:view-box;transform-origin:60px 26px">
    <g>
      <rect x="42" y="34" width="10" height="150" rx="5" fill="url(#bm-stalk-__ID__)" stroke="#2f5e20" stroke-width="1.4"/>
      <path d="M42 66 h10 M42 98 h10 M42 130 h10 M42 162 h10" stroke="#2f5e20" stroke-width="1.6"/>
      <path d="M42 67 q5 3 10 0 M42 99 q5 3 10 0 M42 131 q5 3 10 0" stroke="#c9e8a8" stroke-width="1.2" fill="none"/>
    </g>
    <g>
      <rect x="57" y="26" width="12" height="158" rx="6" fill="url(#bm-stalk-__ID__)" stroke="#2f5e20" stroke-width="1.4"/>
      <path d="M57 60 h12 M57 94 h12 M57 128 h12 M57 162 h12" stroke="#2f5e20" stroke-width="1.6"/>
      <path d="M57 61 q6 3 12 0 M57 95 q6 3 12 0 M57 129 q6 3 12 0" stroke="#c9e8a8" stroke-width="1.2" fill="none"/>
    </g>
    <g>
      <rect x="74" y="42" width="9" height="142" rx="4.5" fill="url(#bm-stalk-__ID__)" stroke="#2f5e20" stroke-width="1.4"/>
      <path d="M74 72 h9 M74 102 h9 M74 132 h9 M74 162 h9" stroke="#2f5e20" stroke-width="1.6"/>
    </g>
    <g fill="#3d7a2a" stroke="#2f5e20" stroke-width="1">
      <path d="M52 58 q14 -12 22 0 q-12 8 -22 0 Z"/>
      <path d="M69 48 q-16 -10 -22 2 q14 6 22 -2 Z"/>
      <path d="M83 68 q12 -10 18 0 q-10 7 -18 0 Z"/>
      <path d="M63 96 q-14 -8 -18 2 q10 6 18 -2 Z"/>
      <path d="M78 118 q14 -8 20 2 q-12 6 -20 -2 Z"/>
    </g>
  </g>
  <g data-part="ribbon" style="transform-box:view-box;transform-origin:62px 88px">
    <path d="M40 84 h44 l-5 12 h-34 Z" fill="#c81e1e" stroke="#7d0f0f" stroke-width="1.6"/>
    <path d="M58 96 q4 10 12 8 q-6 -2 -6 -8 Z" fill="#c81e1e" stroke="#7d0f0f" stroke-width="1.4"/>
    <path d="M66 96 q-4 10 -12 8 q6 -2 6 -8 Z" fill="#a81218" stroke="#7d0f0f" stroke-width="1.4"/>
  </g>
</svg>`,
    ritual(root, api) {
      const stalks = parts(root, "stalks")[0];
      api.play("sway");
      anim(stalks, [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-6deg)" },
        { transform: "rotate(5deg)" },
        { transform: "rotate(-2deg)" },
        { transform: "rotate(0deg)" }
      ], { duration: 1400, easing: "ease-in-out" });
      api.floater("three stalks");
    }
  };
  var himmeli = {
    id: "himmeli",
    name: "Himmeli",
    origin: "Finland",
    plaque: "Rye-straw geometry, hung for a harvest of steady work.",
    ritualName: "Set it turning",
    hint: "Set it turning",
    sound: "sparkle",
    accent: "#d9b45a",
    sway: 1.2,
    weight: 6,
    art: `
<svg class="charm-art" viewBox="0 0 140 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="hi-1-__ID__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6e3a8"/><stop offset=".5" stop-color="#d9b45a"/><stop offset="1" stop-color="#96742a"/>
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
      const rig = parts(root, "rig")[0];
      api.play("sparkle");
      anim(rig, [
        { transform: "perspective(600px) rotateY(0deg)" },
        { transform: "perspective(600px) rotateY(360deg)" }
      ], { duration: 2400, easing: "cubic-bezier(.35,.05,.2,1)" });
      api.floater("abundance");
    }
  };
  var CHARMS = [
    nazar,
    murugar,
    karuppu,
    nimbu,
    drishti,
    om,
    ghanta,
    peacock,
    elephant,
    hamsa,
    panchang,
    horseshoe,
    clover,
    maneki,
    daruma,
    scarab,
    ladybug,
    dreamcatcher,
    bamboo,
    himmeli
  ];
  var CHARM_GROUPS = [
    { title: "The collection", ids: CHARMS.map((c) => c.id) }
  ];
  var BY_ID = new Map(CHARMS.map((c) => [c.id, c]));
  function registerCharm(charm) {
    if (BY_ID.has(charm.id)) {
      const i = CHARMS.findIndex((c) => c.id === charm.id);
      if (i >= 0) CHARMS[i] = charm;
    } else {
      CHARMS.unshift(charm);
    }
    BY_ID.set(charm.id, charm);
    return charm;
  }
  function getCharm(id) {
    return BY_ID.get(id) || slinger;
  }
  function renderArt(charm, uid) {
    return charm.art.replaceAll("__ID__", uid);
  }
  function lighten(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, (n >> 16 & 255) + amt);
    const g = Math.min(255, (n >> 8 & 255) + amt);
    const b = Math.min(255, (n & 255) + amt);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
  }

  // web/js/sound.js
  var sound_exports = {};
  __export(sound_exports, {
    SOUND_NAMES: () => SOUND_NAMES,
    isEnabled: () => isEnabled,
    play: () => play,
    restorePreference: () => restorePreference,
    setEnabled: () => setEnabled
  });
  var ctx = null;
  var master = null;
  var enabled = false;
  var MUTE_KEY = "webdangle.muted";
  function isEnabled() {
    return enabled;
  }
  function setEnabled(on) {
    enabled = !!on;
    try {
      localStorage.setItem(MUTE_KEY, enabled ? "0" : "1");
    } catch {
    }
    if (enabled) ensureContext();
  }
  function restorePreference() {
    let stored = "1";
    try {
      stored = localStorage.getItem(MUTE_KEY) ?? "1";
    } catch {
    }
    enabled = stored === "0";
    return enabled;
  }
  function ensureContext() {
    if (!enabled) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function noiseBuffer(seconds = 0.4) {
    const c = ensureContext();
    if (!c) return null;
    const len = Math.floor(c.sampleRate * seconds);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }
  function noiseSweep({ from = 4e3, to = 400, dur = 0.16, q = 2, gain = 0.35, type = "bandpass" }) {
    const c = ensureContext();
    if (!c) return;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(dur + 0.05);
    const filt = c.createBiquadFilter();
    filt.type = type;
    filt.Q.value = q;
    const t = c.currentTime;
    filt.frequency.setValueAtTime(from, t);
    filt.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 8e-3);
    g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
    src.connect(filt).connect(g).connect(master);
    src.start(t);
    src.stop(t + dur + 0.05);
  }
  function tone({ freq = 440, to = null, dur = 0.18, type = "sine", gain = 0.22, delay = 0 }) {
    const c = ensureContext();
    if (!c) return;
    const t = c.currentTime + delay;
    const osc = c.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  function bell({ freq = 880, dur = 1.1, gain = 0.2, ratio = 2.76 }) {
    const c = ensureContext();
    if (!c) return;
    const t = c.currentTime;
    const carrier = c.createOscillator();
    carrier.type = "sine";
    carrier.frequency.value = freq;
    const mod = c.createOscillator();
    mod.type = "sine";
    mod.frequency.value = freq * ratio;
    const modGain = c.createGain();
    modGain.gain.setValueAtTime(freq * 1.4, t);
    modGain.gain.exponentialRampToValueAtTime(1, t + dur * 0.5);
    mod.connect(modGain).connect(carrier.frequency);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 6e-3);
    g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
    carrier.connect(g).connect(master);
    carrier.start(t);
    mod.start(t);
    carrier.stop(t + dur + 0.05);
    mod.stop(t + dur + 0.05);
  }
  var SOUNDS = {
    /** Web-shooter. The signature noise of the whole product. */
    thwip() {
      noiseSweep({ from: 7e3, to: 900, dur: 0.11, q: 6, gain: 0.3 });
      tone({ freq: 1500, to: 320, dur: 0.09, type: "triangle", gain: 0.1 });
    },
    /** Cord creak on grab. */
    grab() {
      noiseSweep({ from: 900, to: 2400, dur: 0.07, q: 3, gain: 0.1, type: "bandpass" });
    },
    /** Whoosh as the charm is thrown. */
    flick() {
      noiseSweep({ from: 1800, to: 260, dur: 0.26, q: 1.2, gain: 0.16, type: "lowpass" });
    },
    /** Soft swing tick while the charm is in motion. */
    sway() {
      noiseSweep({ from: 600, to: 300, dur: 0.09, q: 2, gain: 0.045, type: "lowpass" });
    },
    /** Temple bell. */
    bell() {
      bell({ freq: 720, dur: 1.6, gain: 0.24 });
      bell({ freq: 1080, dur: 1.1, gain: 0.1, ratio: 3.1 });
    },
    /** Glass eye flicked. */
    glass() {
      tone({ freq: 2400, to: 1800, dur: 0.22, type: "sine", gain: 0.14 });
      tone({ freq: 3600, to: 2600, dur: 0.18, type: "sine", gain: 0.06 });
    },
    /** Keycap press. */
    clack() {
      noiseSweep({ from: 5200, to: 1200, dur: 0.035, q: 1, gain: 0.28, type: "highpass" });
      tone({ freq: 220, to: 140, dur: 0.05, type: "square", gain: 0.07 });
    },
    /** Slurp through a fat straw. */
    slurp() {
      noiseSweep({ from: 300, to: 1500, dur: 0.42, q: 5, gain: 0.14 });
      tone({ freq: 180, to: 420, dur: 0.4, type: "sine", gain: 0.07 });
    },
    /** Slime squish. */
    squish() {
      noiseSweep({ from: 1200, to: 180, dur: 0.3, q: 1.4, gain: 0.18, type: "lowpass" });
      tone({ freq: 320, to: 90, dur: 0.26, type: "sine", gain: 0.12 });
    },
    /** Capybara, unbothered. */
    chill() {
      noiseSweep({ from: 700, to: 220, dur: 0.9, q: 0.8, gain: 0.07, type: "lowpass" });
      tone({ freq: 300, to: 260, dur: 0.7, type: "sine", gain: 0.05 });
    },
    /** Sparkle burst. */
    sparkle() {
      for (let i = 0; i < 5; i++) {
        tone({
          freq: 1600 + i * 620,
          dur: 0.24,
          type: "sine",
          gain: 0.055,
          delay: i * 0.045
        });
      }
    },
    /** Tamagotchi happy chirp. */
    chirp() {
      tone({ freq: 1200, to: 1900, dur: 0.08, type: "square", gain: 0.07 });
      tone({ freq: 1900, to: 2400, dur: 0.09, type: "square", gain: 0.06, delay: 0.09 });
    },
    /** Rubber duck. */
    squeak() {
      tone({ freq: 900, to: 1500, dur: 0.14, type: "sawtooth", gain: 0.09 });
      tone({ freq: 1500, to: 700, dur: 0.16, type: "sawtooth", gain: 0.07, delay: 0.12 });
    },
    /** Aura absorbed. */
    aura() {
      for (let i = 0; i < 4; i++) {
        tone({ freq: 420 + i * 160, to: 900 + i * 200, dur: 0.5, type: "sine", gain: 0.07, delay: i * 0.06 });
      }
    },
    /** Wish granted. */
    wish() {
      bell({ freq: 1180, dur: 1.4, gain: 0.16 });
    },
    /** Something went delightfully wrong. */
    bonk() {
      tone({ freq: 180, to: 70, dur: 0.22, type: "square", gain: 0.14 });
      noiseSweep({ from: 2200, to: 400, dur: 0.12, q: 1, gain: 0.16 });
    },
    /** UI tick. */
    tick() {
      tone({ freq: 2100, dur: 0.045, type: "sine", gain: 0.05 });
    }
  };
  function play(name) {
    if (!enabled) return;
    const fn = SOUNDS[name];
    if (!fn) return;
    try {
      ensureContext();
      fn();
    } catch {
    }
  }
  var SOUND_NAMES = Object.keys(SOUNDS);

  // web/js/dangle.js
  var uidCounter = 0;
  var DEFAULTS = {
    charmId: "slinger",
    length: 200,
    // cord length in px
    segments: 14,
    gravity: 0.62,
    damping: 0.988,
    stiffness: 1,
    scale: 0.62,
    // charm width as a fraction of stage width, clamped by `charmWidth`
    charmWidth: 116,
    anchorX: 0.5,
    // fraction across the stage
    anchorY: 0,
    interactive: true,
    showCord: true,
    cordColor: null,
    reducedMotion: false
  };
  var Dangle = class extends EventTarget {
    constructor(stage, opts = {}) {
      super();
      this.opts = { ...DEFAULTS, ...opts };
      this.stage = stage;
      this.uid = `d${++uidCounter}`;
      this.charm = getCharm(this.opts.charmId);
      this.visible = true;
      this.behind = false;
      this.grabbed = false;
      this.dragging = false;
      this._raf = null;
      this._acc = 0;
      this._last = 0;
      this._pointer = { x: -9999, y: -9999, px: -9999, py: -9999, active: false, speed: 0 };
      this._grabOffset = { x: 0, y: 0 };
      this._downAt = 0;
      this._moved = 0;
      this._floaterLayer = null;
      this._buildDom();
      this._measure();
      this._bind();
      this.start();
    }
    /* ---------------------------------------------------------------- *
     * Construction
     * ---------------------------------------------------------------- */
    _buildDom() {
      const stage = this.stage;
      stage.classList.add("dangle-stage");
      if (getComputedStyle(stage).position === "static") stage.style.position = "relative";
      this.cord = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.cord.setAttribute("class", "dangle-cord");
      this.cord.setAttribute("aria-hidden", "true");
      this.cordPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      this.cordPath.setAttribute("fill", "none");
      this.cordPath.setAttribute("stroke-linecap", "round");
      this.cord.appendChild(this.cordPath);
      this.cordPath2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      this.cordPath2.setAttribute("fill", "none");
      this.cordPath2.setAttribute("stroke-linecap", "round");
      this.cordPath2.setAttribute("opacity", "0.35");
      this.cord.appendChild(this.cordPath2);
      this.el = document.createElement("div");
      this.el.className = "dangle-charm";
      this.el.tabIndex = 0;
      this.el.setAttribute("role", "button");
      this.floaterLayer = document.createElement("div");
      this.floaterLayer.className = "dangle-floaters";
      stage.appendChild(this.cord);
      stage.appendChild(this.el);
      stage.appendChild(this.floaterLayer);
      this._paint();
    }
    _paint() {
      const c = this.charm;
      this.el.innerHTML = renderArt(c, this.uid);
      this.el.dataset.charm = c.id;
      this.el.setAttribute("aria-label", `${c.name}. ${c.hint}.`);
      this.el.style.setProperty("--charm-accent", c.accent || "#fff");
      const cordColor = this.opts.cordColor || c.cordColor || "#d49b42";
      this.cordPath.setAttribute("stroke", cordColor);
      this.cordPath2.setAttribute("stroke", "#f5c66e");
      this.stage.style.setProperty("--charm-accent", c.accent || "#fff");
    }
    /**
     * How heavy the charm node is, relative to a cord node.
     *
     * The charm's own `weight` (6–10) is a feel dial, not an inverse mass. Used
     * directly it makes the tip so immovable that the light nodes above it take the
     * whole wind load and the cord bends sharply at the attachment point. Scaled into
     * a 2.7–4.5 range the charm still swings with real inertia, and the cord stays a
     * cord.
     */
    _tipWeight() {
      return Math.max(2, (this.charm.weight ?? 7) * 0.45);
    }
    _measure() {
      const r = this.stage.getBoundingClientRect();
      this.w = r.width;
      this.h = r.height;
      const base = this.charm.art.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
      this.vbW = base ? parseFloat(base[1]) : 120;
      this.vbH = base ? parseFloat(base[2]) : 180;
      const byWidth = this.w * this.opts.scale / this.vbW;
      const byMax = this.opts.charmWidth / this.vbW;
      this.charmScale = Math.max(0.28, Math.min(byWidth, byMax));
      this.charmW = this.vbW * this.charmScale;
      this.charmH = this.vbH * this.charmScale;
      this.el.style.width = `${this.charmW}px`;
      this.el.style.height = `${this.charmH}px`;
      const maxLen = Math.max(60, this.h - this.charmH - 8);
      const length = Math.min(this.opts.length, maxLen);
      const ax = this.w * this.opts.anchorX;
      const ay = this.opts.anchorY;
      if (!this.rope) {
        this.rope = new Rope({
          x: ax,
          y: ay,
          segments: this.opts.segments,
          length,
          gravity: this.opts.gravity,
          damping: this.opts.damping,
          stiffness: this.opts.stiffness,
          tipWeight: this._tipWeight()
        });
      } else {
        this.rope.setAnchor(ax, ay);
        this.rope.gravity = this.opts.gravity;
        this.rope.damping = this.opts.damping;
        this.rope.stiffness = this.opts.stiffness;
        if (Math.abs(this.rope.length - length) > 0.5) this.rope.setLength(length);
      }
      this.rope.windStrength = (this.charm.sway ?? 1) * (this.opts.reducedMotion ? 0.25 : 1);
      this.cord.setAttribute("viewBox", `0 0 ${this.w} ${this.h}`);
      this.cord.setAttribute("width", this.w);
      this.cord.setAttribute("height", this.h);
    }
    /* ---------------------------------------------------------------- *
     * Events
     * ---------------------------------------------------------------- */
    _bind() {
      this._onResize = () => this._measure();
      this._ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(this._onResize) : null;
      this._ro?.observe(this.stage);
      window.addEventListener("resize", this._onResize);
      this._onPointerMoveWindow = (e) => this._pointerMove(e.clientX, e.clientY);
      this._onPointerUpWindow = (e) => this._pointerUp(e.clientX, e.clientY);
      this._onDown = (e) => {
        if (!this.opts.interactive) return;
        e.preventDefault();
        this.el.setPointerCapture?.(e.pointerId);
        const rect = this.stage.getBoundingClientRect();
        const tip = this.rope.tip;
        this.grabbed = true;
        this.dragging = false;
        this._downAt = performance.now();
        this._moved = 0;
        this._grabOffset = { x: tip.x - (e.clientX - rect.left), y: tip.y - (e.clientY - rect.top) };
        this.el.classList.add("is-grabbed");
        play("grab");
        window.addEventListener("pointermove", this._onPointerMoveWindow);
        window.addEventListener("pointerup", this._onPointerUpWindow);
      };
      this._onKey = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.ritual();
        }
      };
      this.el.addEventListener("pointerdown", this._onDown);
      this.el.addEventListener("keydown", this._onKey);
      this.el.addEventListener("click", (e) => e.preventDefault());
      this.el.addEventListener("dragstart", (e) => e.preventDefault());
    }
    _pointerMove(cx, cy) {
      if (this.grabbed) {
        const rect = this.stage.getBoundingClientRect();
        const tx = cx - rect.left + this._grabOffset.x;
        const ty = cy - rect.top + this._grabOffset.y;
        const tip = this.rope.tip;
        this._moved = Math.max(this._moved, Math.hypot(tx - tip.x, ty - tip.y));
        if (this._moved > 6) this.dragging = true;
        this.rope.dragTip(tx, ty, 0.55);
      } else {
        this._hoverMove(cx, cy);
      }
    }
    _pointerUp(cx, cy) {
      window.removeEventListener("pointermove", this._onPointerMoveWindow);
      window.removeEventListener("pointerup", this._onPointerUpWindow);
      if (!this.grabbed) return;
      const held = performance.now() - this._downAt;
      const tip = this.rope.tip;
      this.grabbed = false;
      this.el.classList.remove("is-grabbed");
      this.rope.release();
      if (this.dragging) {
        const vx = (this._pointer.x - this._pointer.px) * 1.6;
        const vy = (this._pointer.y - this._pointer.py) * 1.6;
        const speed = Math.hypot(vx, vy);
        if (speed > 2) {
          this.rope.flick(vx, vy, 0.5);
          play("flick");
          this.dispatchEvent(new CustomEvent("flick", { detail: { speed } }));
        }
      } else if (held < 900) {
        this.ritual();
      }
      this.dragging = false;
      return tip;
    }
    /** Track the pointer globally so the charm leans away even outside the stage. */
    _hoverMove(cx, cy) {
      const rect = this.stage.getBoundingClientRect();
      this._pointer.px = this._pointer.x;
      this._pointer.py = this._pointer.y;
      this._pointer.x = cx - rect.left;
      this._pointer.y = cy - rect.top;
      this._pointer.active = true;
      this._pointer.speed = Math.hypot(this._pointer.x - this._pointer.px, this._pointer.y - this._pointer.py);
    }
    /** Attach a document-level hover tracker (used on the hero stage and the app). */
    trackCursor(target = window) {
      this._trackTarget = target;
      this._trackHandler = (e) => this._hoverMove(e.clientX, e.clientY);
      target.addEventListener("pointermove", this._trackHandler, { passive: true });
      return this;
    }
    untrackCursor() {
      if (this._trackTarget && this._trackHandler) {
        this._trackTarget.removeEventListener("pointermove", this._trackHandler);
      }
    }
    /* ---------------------------------------------------------------- *
     * Loop
     * ---------------------------------------------------------------- */
    start() {
      if (this._raf) return;
      this._last = performance.now();
      const tick = (now) => {
        this._raf = requestAnimationFrame(tick);
        let dt = (now - this._last) / 1e3;
        this._last = now;
        if (dt > 0.1) dt = 0.1;
        this._acc += dt;
        const step = 1 / 60;
        let n = 0;
        while (this._acc >= step && n < 4) {
          this._physics();
          this._acc -= step;
          n++;
        }
        this._render();
      };
      this._raf = requestAnimationFrame(tick);
    }
    stop() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = null;
    }
    _physics() {
      if (!this.rope || !this.visible) return;
      const p = this._pointer;
      if (p.active && !this.grabbed) {
        this.rope.repel(p.x, p.y, 140, this.opts.reducedMotion ? 0.6 : 2.8);
        const tip2 = this.rope.tip;
        const angle = this._angle ?? 0;
        const armLen = this.charmH * 0.45;
        const charmCx = tip2.x + Math.sin(angle) * armLen;
        const charmCy = tip2.y + Math.cos(angle) * armLen;
        const cdx = charmCx - p.x;
        const cdy = charmCy - p.y;
        const dist = Math.hypot(cdx, cdy);
        const repelDist = Math.max(this.charmW * 0.55 + 80, 145);
        if (dist < repelDist && dist > 1) {
          const falloff = 1 - dist / repelDist;
          const force = Math.pow(falloff, 1.6) * (this.opts.reducedMotion ? 2.5 : 9.5);
          const nx = cdx / dist;
          const ny = cdy / dist;
          const tw = this._tipWeight();
          tip2.addForce(nx * force * tw, ny * force * 0.35 * tw);
        }
        if (p.speed > 8) {
          const vx = p.x - p.px;
          const vy = p.y - p.py;
          this.rope.stir(p.x, p.y, vx, vy, 160, 0.12);
        }
      }
      this.rope.step(1);
      const tip = this.rope.tip;
      const half = this.charmW * 0.5;
      for (let i = 1; i < this.rope.nodes.length; i++) {
        const nd = this.rope.nodes[i];
        if (nd.x < half * 0.6) nd.x = half * 0.6;
        if (nd.x > this.w - half * 0.6) nd.x = this.w - half * 0.6;
        if (nd.y > this.h + 40) {
          nd.y = this.h + 40;
          nd.py = nd.y;
        }
      }
      if (tip.x < half) tip.x = half;
      if (tip.x > this.w - half) tip.x = this.w - half;
    }
    _render() {
      if (!this.rope) return;
      const path = this.rope.path();
      this.cordPath.setAttribute("d", path);
      this.cordPath.setAttribute("stroke-width", 1.8);
      const tip = this.rope.tip;
      const prev = this.rope.nodes[this.rope.nodes.length - 2];
      const n = this.rope.nodes.length;
      const pts2 = this.rope.nodes.map((p, i) => {
        if (i === 0 || i === n - 1) return { x: p.x, y: p.y };
        const pPrev = this.rope.nodes[i - 1];
        const pNext = this.rope.nodes[i + 1];
        const dx = pNext.x - pPrev.x;
        const dy = pNext.y - pPrev.y;
        const l = Math.hypot(dx, dy) || 1;
        const taper = Math.sin(i / (n - 1) * Math.PI);
        return {
          x: p.x - dy / l * 1.3 * taper,
          y: p.y + dx / l * 1.3 * taper
        };
      });
      this.cordPath2.setAttribute("d", this.rope.pathTo(pts2));
      this.cordPath2.setAttribute("stroke-width", 1.1);
      this.cordPath2.setAttribute("opacity", "0.45");
      const a = this.rope.angle;
      this._angle = a;
      this.el.style.transform = `translate(${(tip.x - this.charmW / 2).toFixed(2)}px, ${tip.y.toFixed(2)}px) rotate(${this._angle.toFixed(4)}rad)`;
    }
    /* ---------------------------------------------------------------- *
     * Public API
     * ---------------------------------------------------------------- */
    setCharm(id, { animate = true } = {}) {
      const next = getCharm(id);
      if (next.id === this.charm.id) return this;
      this.charm = next;
      this._paint();
      this._measure();
      const tw = this._tipWeight();
      this.rope.tipWeight = tw;
      this.rope.nodes[this.rope.nodes.length - 1].invMass = 1 / tw;
      this.rope.windStrength = (next.sway ?? 1) * (this.opts.reducedMotion ? 0.25 : 1);
      this.rope.nodes.forEach((n, i) => {
        if (i > 0) n.x += (Math.random() - 0.5) * 16;
      });
      if (animate) this.pulse();
      this.dispatchEvent(new CustomEvent("charmchange", { detail: { id: next.id } }));
      return this;
    }
    /** The charm's one small ceremony. */
    ritual() {
      if (!this.visible) this.setVisible(true);
      const api = this._ritualApi();
      try {
        this.charm.ritual?.(this.el, api);
      } catch (err) {
        console.warn("[webdangle] ritual failed", err);
      }
      this.dispatchEvent(new CustomEvent("ritual", { detail: { id: this.charm.id } }));
    }
    _ritualApi() {
      return {
        uid: this.uid,
        play,
        tick: () => play("tick"),
        floater: (text) => this.floater(text),
        aura: (n) => this.dispatchEvent(new CustomEvent("aura", { detail: { amount: n } })),
        ripple: (kind) => this.ripple(kind)
      };
    }
    /** Small text that rises off the charm. */
    floater(text) {
      const d = document.createElement("div");
      d.className = "dangle-floater";
      d.textContent = text;
      const tip = this.rope.tip;
      d.style.left = `${tip.x}px`;
      d.style.top = `${tip.y + this.charmH * 0.42}px`;
      this.floaterLayer.appendChild(d);
      d.animate(
        [
          { opacity: 0, transform: "translate(-50%, 0) scale(.8)" },
          { opacity: 1, transform: "translate(-50%, -14px) scale(1)", offset: 0.22 },
          { opacity: 0, transform: "translate(-50%, -58px) scale(1.04)" }
        ],
        { duration: 1500, easing: "cubic-bezier(.2,.7,.3,1)" }
      ).onfinish = () => d.remove();
    }
    /** Sonar rings from the charm — the bell's ring, mostly. */
    ripple() {
      const tip = this.rope.tip;
      for (let i = 0; i < 2; i++) {
        const d = document.createElement("div");
        d.className = "dangle-ripple";
        d.style.left = `${tip.x}px`;
        d.style.top = `${tip.y + this.charmH * 0.5}px`;
        this.floaterLayer.appendChild(d);
        d.animate(
          [
            { opacity: 0.7, transform: "translate(-50%,-50%) scale(.3)" },
            { opacity: 0, transform: "translate(-50%,-50%) scale(2.6)" }
          ],
          { duration: 1100, delay: i * 180, easing: "ease-out" }
        ).onfinish = () => d.remove();
      }
    }
    pulse() {
      this.el.animate(
        [
          { filter: "brightness(1)" },
          { filter: "brightness(1.5)" },
          { filter: "brightness(1)" }
        ],
        { duration: 520, easing: "ease-out" }
      );
    }
    /** Drop the charm in from above and perform its ritual — `webdangle://bless`. */
    async bless() {
      this.setVisible(true);
      const tip = this.rope.tip;
      tip.py -= 26;
      this.pulse();
      await new Promise((r) => setTimeout(r, 220));
      this.ritual();
    }
    flick(vx, vy) {
      this.rope.flick(vx, vy, 0.6);
      play("flick");
    }
    setVisible(on) {
      this.visible = !!on;
      this.stage.classList.toggle("is-hidden", !this.visible);
      this.el.setAttribute("aria-hidden", this.visible ? "false" : "true");
      return this;
    }
    /** Send it behind page content, keeping watch from the desktop. */
    setBehind(on) {
      this.behind = !!on;
      this.stage.classList.toggle("is-behind", this.behind);
      return this;
    }
    hover(cx, cy) {
      this._hoverMove(cx, cy);
      return this;
    }
    setSize(width) {
      if (!width) return this;
      this.opts.charmWidth = Number(width);
      this._measure();
      return this;
    }
    setLength(len) {
      if (!len) return this;
      this.opts.length = Number(len);
      this._measure();
      return this;
    }
    setAnchor(ax, ay = 0) {
      this.opts.anchorX = Number(ax);
      this.opts.anchorY = Number(ay);
      this._measure();
      return this;
    }
    resize() {
      this._measure();
    }
    destroy() {
      this.stop();
      this.untrackCursor();
      this._ro?.disconnect();
      window.removeEventListener("resize", this._onResize);
      window.removeEventListener("pointermove", this._onPointerMoveWindow);
      window.removeEventListener("pointerup", this._onPointerUpWindow);
      this.el.remove();
      this.cord.remove();
      this.floaterLayer.remove();
      this.stage.classList.remove("dangle-stage");
    }
  };

  // web/js/app.js
  var $ = (id) => document.getElementById(id);
  var toastTimer = null;
  function toast(msg, ms = 3200) {
    const el = $("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), ms);
  }
  function initHero() {
    const stage = $("heroStage");
    if (!stage) return null;
    const dangle = new Dangle(stage, {
      charmId: "clover",
      length: 250,
      segments: 16,
      charmWidth: 178,
      scale: 0.55,
      anchorX: 0.5
    });
    dangle.trackCursor(window);
    let hiddenOnce = false;
    $("ritualBtn")?.addEventListener("click", () => dangle.ritual());
    $("hideBtn")?.addEventListener("click", () => {
      const next = !dangle.visible;
      dangle.setVisible(next);
      if (!next && !hiddenOnce) {
        hiddenOnce = true;
        toast("Hidden. In the app that is \u2303D, and everything else keeps clicking through.");
      }
    });
    return dangle;
  }
  var MAX_LIVE_CARDS = 14;
  function initGallery(hero) {
    const grid = $("charmGrid");
    const ritualBar = $("ritualBar");
    if (!grid) return;
    const live = /* @__PURE__ */ new Map();
    const stages = /* @__PURE__ */ new Map();
    const cards = /* @__PURE__ */ new Map();
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
        gravity: 0.6
      });
      const cardEl = stageEl.closest(".charm-card") || stageEl;
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
    if (typeof IntersectionObserver === "undefined") {
      window.addEventListener("scroll", queueSync, { passive: true });
      window.addEventListener("resize", queueSync);
    }
    for (const c of CHARMS) {
      const card = document.createElement("div");
      card.className = "charm-card";
      card.dataset.charmId = c.id;
      card.style.setProperty("--charm-accent", c.accent || "#888");
      card.setAttribute("role", "group");
      card.setAttribute("aria-label", `${c.name}, ${c.origin}`);
      const stage = document.createElement("div");
      stage.className = "card-stage";
      stage.dataset.charmId = c.id;
      stage.innerHTML = `<div class="card-art-preview">${renderArt(c, "pv-" + c.id)}</div>`;
      const body = document.createElement("div");
      body.className = "card-body";
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
      body.querySelector(".card-hang").addEventListener("click", (e) => {
        e.stopPropagation();
        hang();
      });
      body.addEventListener("click", hang);
    }
    function updateStageBadge(c) {
      const b = $("stageBadge");
      if (!b) return;
      b.querySelector(".n").textContent = c.name;
      b.querySelector(".o").textContent = c.origin;
    }
    function updateRitualBar(activeId) {
      ritualBar?.querySelectorAll(".chip").forEach((chip) => {
        chip.setAttribute("aria-pressed", String(chip.dataset.charmId === activeId));
      });
    }
    function selectCharm(id) {
      const c = getCharm(id);
      if (hero) {
        hero.setCharm(id);
        hero.ritual();
      }
      for (const [cid, card] of cards) {
        card.setAttribute("aria-pressed", String(cid === id));
      }
      updateStageBadge(c);
      updateRitualBar(id);
      if (!selectCharm._announced) {
        selectCharm._announced = true;
        toast(`${c.name} is hanging on the stage. Flick it.`);
      }
    }
    selectCharm._announced = false;
    if (ritualBar) {
      for (const c of CHARMS) {
        const b = document.createElement("button");
        b.className = "chip";
        b.type = "button";
        b.dataset.charmId = c.id;
        b.setAttribute("aria-pressed", "false");
        b.innerHTML = `<span class="dot" style="background:${c.accent}"></span>${c.ritualName} \xB7 ${c.name}`;
        b.addEventListener("click", () => {
          hero?.setCharm(c.id);
          updateStageBadge(c);
          updateRitualBar(c.id);
          for (const [cid, card] of cards) card.setAttribute("aria-pressed", String(cid === c.id));
          setTimeout(() => hero?.ritual(), 220);
          document.querySelector(".hero-stage-shell")?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        ritualBar.appendChild(b);
      }
    }
    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const id = entry.target.dataset.charmId;
          if (entry.isIntersecting) {
            activate(id, entry.target);
          } else {
            retire(id);
          }
        }
      }, { rootMargin: "250px 0px" });
      for (const [, el] of stages) observer.observe(el);
    } else {
      syncLive();
    }
    selectCharm._announced = true;
    selectCharm("nazar");
    return { selectCharm };
  }
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
    $("emojiBtn")?.addEventListener("click", () => {
      const glyph = prompt("Pick an emoji \u2014 paste one, or type a few characters:", "\u{1F340}");
      if (!glyph) return;
      const id = "emoji-custom";
      registerCharm({
        id,
        name: "Your emoji",
        origin: "Yours",
        plaque: "Any glyph you like, hanging from the same cord.",
        ritualName: "Boop",
        hint: "Boop it",
        sound: "sparkle",
        accent: "#a06bff",
        sway: 1.1,
        weight: 6,
        art: emojiArt(glyph.slice(0, 4)),
        ritual(root, api) {
          api.play("sparkle");
          const svg = root.querySelector("svg");
          svg?.animate(
            [
              { transform: "scale(1) rotate(0deg)" },
              { transform: "scale(1.18) rotate(-8deg)" },
              { transform: "scale(1.05) rotate(6deg)" },
              { transform: "scale(1) rotate(0deg)" }
            ],
            { duration: 900, easing: "cubic-bezier(.3,1.7,.4,1)", fill: "both" }
          );
          api.floater("boop");
        }
      });
      hero?.setCharm(id);
      setTimeout(() => hero?.ritual(), 200);
    });
  }
  function initKeyboard(hero) {
    window.addEventListener("keydown", (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "r" || e.key === "R") hero?.ritual();
      if (e.key === "h" || e.key === "H") hero?.setVisible(!hero.visible);
      if (e.key === "t" || e.key === "T") hero?.flick((Math.random() - 0.5) * 40, -12);
    });
  }
  function initNav() {
    const nav = $("nav");
    const onScroll = () => nav?.classList.toggle("is-stuck", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  function initOsTabs() {
    const tabs = [
      { btn: $("tabBtnMac"), panel: $("panelMac"), id: "mac" },
      { btn: $("tabBtnWin"), panel: $("panelWin"), id: "win" },
      { btn: $("tabBtnWeb"), panel: $("panelWeb"), id: "web" }
    ];
    const setTab = (activeId) => {
      for (const { btn, panel, id } of tabs) {
        if (!btn || !panel) continue;
        const isActive = id === activeId;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
        panel.classList.toggle("active", isActive);
        panel.style.display = isActive ? "block" : "none";
      }
    };
    for (const { btn, id } of tabs) {
      btn?.addEventListener("click", () => setTab(id));
    }
    const userAgent = navigator.userAgent || "";
    const isWindows = /Windows|Win32|Win64/i.test(userAgent);
    if (isWindows) {
      setTab("win");
      const heroBtn = $("heroDownloadBtn");
      if (heroBtn) {
        heroBtn.textContent = "Download for Windows (.exe)";
        heroBtn.href = "downloads/Charmlet-Setup.exe";
        heroBtn.setAttribute("download", "");
      }
    }
  }
  function boot() {
    setEnabled(false);
    initNav();
    initOsTabs();
    const hero = initHero();
    initGallery(hero);
    initEmojiCharm(hero);
    initKeyboard(hero);
    document.documentElement.dataset.ready = "1";
  }
  if (typeof window !== "undefined") {
    window.Dangle = Dangle;
    window.CHARMS = CHARMS;
    window.getCharm = getCharm;
    window.sound = sound_exports;
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
