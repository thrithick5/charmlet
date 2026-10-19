/**
 * verlet.js — position-based rope solver.
 *
 * The whole product hangs off this file. One solver drives the marketing site and the
 * native menu-bar app, so a charm can never feel different in one than the other.
 *
 * Why Verlet: each node stores only its current and previous position. Velocity is the
 * displacement between them, so there is no velocity state to damp, and distance
 * constraints stay rigid no matter how violently the pointer drags the tip. Euler
 * integration explodes under exactly the motion this product is built around.
 */

export class Node {
  constructor(x, y, { pinned = false, invMass = 1 } = {}) {
    this.x = x;
    this.y = y;
    // previous position — velocity is implicit in (x - px)
    this.px = x;
    this.py = y;
    // acceleration accumulated by forces for the next step only
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
}

export class Rope {
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
    windPhase = null,
  } = {}) {
    this.segments = Math.max(2, segments | 0);
    this.gravity = gravity;
    this.damping = damping;
    this.iterations = iterations;
    this.stiffness = stiffness;
    this.tipWeight = tipWeight;
    this.time = 0;

    // See `step()`: the guard that keeps the cord from ever reading as elastic.
    // The cap is generous because extra passes only ever run on frames where a
    // hard drag has genuinely left the cord strained; a resting cord exits the
    // loop immediately.
    this.strainTolerance = 0.015;
    this.maxExtraIterations = 600;

    // Wind is a slow two-axis current, retuned per charm so a heavy scarab and a
    // light boba cup do not sway identically. `windAmp` is deliberately small:
    // the charm should sway like something hanging on a thread, not like a
    // windsock. Verified by scripts/test-physics.mjs.
    this.windAmp = 0.07;
    this.windStrength = 1;
    this.windPhase = windPhase !== null ? windPhase : Math.random() * Math.PI * 2;

    // Where the pointer is holding the tip, when grabbed.
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
            invMass: i === n ? 1 / this.tipWeight : 1,
          }),
        );
      }
    }
  }

  setAnchor(x, y, { shiftNodes = true } = {}) {
    const dx = x - this.anchor.x;
    const dy = y - this.anchor.y;
    this.anchor.x = x;
    this.anchor.y = y;
    const head = this.nodes[0];
    if (head) {
      head.pinned = true;
      head.invMass = 0;
      head.pinTo(x, y);
    }
    if (shiftNodes && (dx !== 0 || dy !== 0)) {
      for (let i = 1; i < this.nodes.length; i++) {
        const n = this.nodes[i];
        n.x += dx;
        n.px += dx;
        n.y += dy;
        n.py += dy;
        n.originX += dx;
        n.originY += dy;
      }
    }
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
   * over the upper/middle cord it reads as the real plumb direction of the cord.
   */
  get angle() {
    const n = this.nodes.length;
    if (n < 2) return 0;
    const tip = this.nodes[n - 1];
    const prev = this.nodes[n - 2];
    if (n >= 3) {
      const prev2 = this.nodes[n - 3];
      // Weighted baseline across the bottom two segments eliminates single-joint twitch
      const dx = (tip.x - prev.x) * 0.7 + (prev.x - prev2.x) * 0.3;
      const dy = (tip.y - prev.y) * 0.7 + (prev.y - prev2.y) * 0.3;
      if (Math.abs(dx) < 1e-4 && Math.abs(dy) < 1e-4) return 0;
      return Math.atan2(dy, dx) - Math.PI / 2;
    }
    const dx = tip.x - prev.x;
    const dy = tip.y - prev.y;
    if (Math.abs(dx) < 1e-4 && Math.abs(dy) < 1e-4) return 0;
    return Math.atan2(dy, dx) - Math.PI / 2;
  }

  get tipSpeed() {
    return Math.hypot(this.tip.vx, this.tip.vy);
  }

  /**
   * Advance one fixed step.
   * @param {number} dt  time scale, 1 = one 60 Hz frame, 0.5 = one 120 Hz frame
   */
  step(dt = 1) {
    this.time += dt;

    // --- idle wind: two detuned sines so the sway never visibly loops ---
    const w = this.time * 0.011 + this.windPhase;
    const windX = (Math.sin(w) * 0.62 + Math.sin(w * 2.37) * 0.24) * this.windAmp * this.windStrength * dt;
    const windY = Math.sin(w * 1.61) * 0.06 * this.windAmp * this.windStrength * dt;

    const nodes = this.nodes;
    // Scale damping precisely by time step so physics behaves identically regardless of dt
    const d = Math.pow(this.damping, dt);

    for (let i = 1; i < nodes.length; i++) {
      const p = nodes[i];
      const t = i / (nodes.length - 1); // wind bites harder near the free end

      const vx = (p.x - p.px) * d;
      const vy = (p.y - p.py) * d;

      p.px = p.x;
      p.py = p.y;

      p.x += vx + (p.ax + windX * t) * dt;
      p.y += vy + (this.gravity + p.ay + windY * t) * dt;

      p.ax = 0;
      p.ay = 0;
    }

    // --- the grab, then reach clamp active only when grabbed ---
    if (this.grabTarget) {
      this._applyGrab();
      this._enforceReach();
    }

    for (let k = 0; k < this.iterations; k++) this.solveConstraints();

    // Convergence guard. Gauss-Seidel relaxation gets the cord almost rigid in
    // the fixed pass count, but a hard drag can leave a visible few percent of
    // strain. Rather than let that show up as elastic, keep relaxing until the
    // worst segment is within tolerance. Cheap: usually zero extra passes.
    let extra = 0;
    while (extra < this.maxExtraIterations && this.maxStrain() > this.strainTolerance) {
      this.solveConstraints();
      extra++;
    }

    // Anchor is absolute; nothing may move it.
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
    if (!this.grabTarget) return;
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
    const n = nodes.length;

    for (let i = 0; i < n - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];

      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let d = Math.hypot(dx, dy);
      if (d < 1e-6) {
        // Degenerate: nudge apart rather than divide by zero.
        dx = 1e-6;
        dy = 0;
        d = 1e-6;
      }

      const diff = ((d - rest) / d) * this.stiffness;

      if (this.grabTarget && i === n - 2) {
        // While grabbed, the tip is pinned to the target. Relax node above it
        // so the entire cord stretches taut towards the target without buckling.
        a.x += dx * diff;
        a.y += dy * diff;
        continue;
      }

      const wa = a.pinned ? 0 : a.invMass;
      const wb = b.pinned ? 0 : b.invMass;
      const wsum = wa + wb;
      if (wsum === 0) continue;

      const ka = (wa / wsum) * diff;
      const kb = (wb / wsum) * diff;

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
      p.addForce((dx / d) * f, (dy / d) * f);
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
    const clampedVx = Math.max(-25, Math.min(25, vx));
    const clampedVy = Math.max(-25, Math.min(25, vy));
    for (let i = 1; i < this.nodes.length; i++) {
      const p = this.nodes[i];
      const d = Math.hypot(p.x - x, p.y - y);
      if (d > radius) continue;
      const falloff = (1 - d / radius) ** 2;
      // Nodes nearer the free end catch more of the draught.
      const t = i / (this.nodes.length - 1);
      const k = falloff * strength * t;
      p.x += clampedVx * k;
      p.y += clampedVy * k;
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
    // Bleed some into the node above so the cord curves rather than kinking.
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
    if (!pts || pts.length < 2) return '';
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
}

/**
 * Catenary-ish resting curve, used to draw hanging cords (photo prints, locket chains)
 * that do not need a live solver.
 */
export function restingCurve(x, y, length, sag = 0.35, segments = 10) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    pts.push([x, y + t * length + Math.sin(t * Math.PI) * length * sag * 0.1]);
  }
  return pts;
}
