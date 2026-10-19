/**
 * dangle.js — the rig.
 *
 * One `Dangle` owns one rope, one charm and one set of interactions. Everything
 * that makes the product feel alive lives here:
 *
 *   idle wind      a slow detuned current so the charm never sits still
 *   cursor lean    air pushed ahead of the pointer, so it leans away as you pass
 *   grab           press and hold, the tip follows on a spring
 *   flick          release with speed and the velocity is injected into the rope
 *   ritual         the charm's one small ceremony
 *
 * The same class runs on the marketing site and inside the native menu-bar app.
 */

import { Rope } from './verlet.js';
import { getCharm, renderArt } from './charms.js';
import { play } from './sound.js';

let uidCounter = 0;

const DEFAULTS = {
  charmId: 'slinger',
  length: 200, // cord length in px
  segments: 14,
  gravity: 0.62,
  damping: 0.988,
  stiffness: 1,
  scale: 0.62, // charm width as a fraction of stage width, clamped by `charmWidth`
  charmWidth: 116,
  anchorX: 0.5, // fraction across the stage
  anchorY: 0,
  interactive: true,
  showCord: true,
  cordColor: null,
  reducedMotion: false,
};

export class Dangle extends EventTarget {
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
    stage.classList.add('dangle-stage');
    if (getComputedStyle(stage).position === 'static') stage.style.position = 'relative';

    this.cord = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.cord.setAttribute('class', 'dangle-cord');
    this.cord.setAttribute('aria-hidden', 'true');

    // Transparent wide stroke for grabbing the cord anywhere along its length
    this.cordHit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.cordHit.setAttribute('class', 'dangle-cord-hit');
    this.cordHit.setAttribute('fill', 'none');
    this.cordHit.setAttribute('stroke', 'rgba(0, 0, 0, 0.001)');
    this.cordHit.setAttribute('stroke-width', '44');
    this.cordHit.setAttribute('stroke-linecap', 'round');
    this.cord.appendChild(this.cordHit);

    this.cordPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.cordPath.setAttribute('fill', 'none');
    this.cordPath.setAttribute('stroke-linecap', 'round');
    this.cord.appendChild(this.cordPath);

    // A faint second strand, offset, reads as a twisted cord rather than a wire.
    this.cordPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.cordPath2.setAttribute('fill', 'none');
    this.cordPath2.setAttribute('stroke-linecap', 'round');
    this.cordPath2.setAttribute('opacity', '0.35');
    this.cord.appendChild(this.cordPath2);

    this.el = document.createElement('div');
    this.el.className = 'dangle-charm';
    this.el.tabIndex = 0;
    this.el.setAttribute('role', 'button');

    this.floaterLayer = document.createElement('div');
    this.floaterLayer.className = 'dangle-floaters';

    stage.appendChild(this.cord);
    stage.appendChild(this.el);
    stage.appendChild(this.floaterLayer);

    this._paint();
  }

  _paint() {
    const c = this.charm;
    this.el.innerHTML = renderArt(c, this.uid);
    this.el.dataset.charm = c.id;
    this.el.setAttribute('aria-label', `${c.name}. ${c.hint}.`);
    this.el.style.setProperty('--charm-accent', c.accent || '#fff');
    const cordColor = this.opts.cordColor || c.cordColor || '#d49b42';
    this.cordPath.setAttribute('stroke', cordColor);
    this.cordPath2.setAttribute('stroke', '#f5c66e');
    this.stage.style.setProperty('--charm-accent', c.accent || '#fff');
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
    this.w = r.width || this.stage.offsetWidth || 220;
    this.h = r.height || this.stage.offsetHeight || 180;

    const base = this.charm.art.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
    this.vbW = base ? parseFloat(base[1]) : 120;
    this.vbH = base ? parseFloat(base[2]) : 180;

    // Charm art is authored at ~120 units wide. Scale so it occupies a sensible
    // slice of the stage without ever exceeding the requested pixel width.
    const byWidth = (this.w * this.opts.scale) / this.vbW;
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
        tipWeight: this._tipWeight(),
      });
    } else {
      this.rope.setAnchor(ax, ay);
      this.rope.gravity = this.opts.gravity;
      this.rope.damping = this.opts.damping;
      this.rope.stiffness = this.opts.stiffness;
      if (Math.abs(this.rope.length - length) > 0.5) this.rope.setLength(length);
    }
    this.rope.windStrength = (this.charm.sway ?? 1) * (this.opts.reducedMotion ? 0.25 : 1);

    this.cord.setAttribute('viewBox', `0 0 ${this.w} ${this.h}`);
    this.cord.setAttribute('width', this.w);
    this.cord.setAttribute('height', this.h);
  }

  /* ---------------------------------------------------------------- *
   * Events
   * ---------------------------------------------------------------- */

  _bind() {
    this._onResize = () => this._measure();
    this._ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(this._onResize) : null;
    this._ro?.observe(this.stage);
    window.addEventListener('resize', this._onResize);

    this._onPointerMoveWindow = (e) => this._pointerMove(e.clientX, e.clientY);
    this._onPointerUpWindow = (e) => this._pointerUp(e.clientX, e.clientY);

    this._onDown = (e) => {
      if (!this.opts.interactive) return;
      e.preventDefault();
      try {
        (e.currentTarget || this.el).setPointerCapture?.(e.pointerId);
      } catch (_) {}
      const rect = this.stage.getBoundingClientRect();
      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;
      const tip = this.rope.tip;
      const ax = this.rope.anchor.x;
      const ay = this.rope.anchor.y;

      this.grabbed = true;
      this.dragging = false;
      this._downAt = performance.now();
      this._moved = 0;

      // Distinguish cord grab vs charm body grab:
      const isCord = e.currentTarget === this.cordHit || ly < tip.y - 12;
      this._isCordGrab = isCord;

      if (isCord) {
        this._grabOffset = { x: 0, y: 0 };
        const clampedLy = Math.max(ay + 4, ly);
        const dx = lx - ax;
        const dy = clampedLy - ay;
        const d = Math.hypot(dx, dy) || 1;
        const reach = Math.max(this.rope.length, d);
        const tx = ax + (dx / d) * reach;
        const ty = ay + (dy / d) * reach;
        this.rope.dragTip(tx, ty, 1.0);
      } else {
        this._grabOffset = { x: tip.x - lx, y: tip.y - ly };
      }

      this.el.classList.add('is-grabbed');
      play('grab');
      window.addEventListener('pointermove', this._onPointerMoveWindow);
      window.addEventListener('pointerup', this._onPointerUpWindow);
    };

    this._onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.ritual();
      }
    };

    this.cordHit.addEventListener('pointerdown', this._onDown);
    this.cordHit.addEventListener('click', (e) => e.preventDefault());
    this.cordHit.addEventListener('dragstart', (e) => e.preventDefault());
    this.el.addEventListener('pointerdown', this._onDown);
    this.el.addEventListener('keydown', this._onKey);
    this.el.addEventListener('click', (e) => e.preventDefault());
    this.el.addEventListener('dragstart', (e) => e.preventDefault());
  }

  _pointerMove(cx, cy) {
    const rect = this.stage.getBoundingClientRect();
    const lx = cx - rect.left;
    const ly = cy - rect.top;

    if (this._pointer.x === -9999) {
      this._pointer.px = lx;
      this._pointer.py = ly;
      this._pointer.vx = 0;
      this._pointer.vy = 0;
    } else {
      this._pointer.px = this._pointer.x;
      this._pointer.py = this._pointer.y;
      const instVx = lx - this._pointer.px;
      const instVy = ly - this._pointer.py;
      // Exponential moving average filter prevents mouse velocity spikes
      this._pointer.vx = (this._pointer.vx || 0) * 0.75 + instVx * 0.25;
      this._pointer.vy = (this._pointer.vy || 0) * 0.75 + instVy * 0.25;
    }
    this._pointer.x = lx;
    this._pointer.y = ly;
    this._pointer.active = true;
    this._pointer.speed = Math.hypot(this._pointer.vx || 0, this._pointer.vy || 0);

    if (this.grabbed) {
      const tip = this.rope.tip;
      const ax = this.rope.anchor.x;
      const ay = this.rope.anchor.y;
      let tx, ty;

      if (this._isCordGrab) {
        const clampedLy = Math.max(ay + 4, ly);
        const dx = lx - ax;
        const dy = clampedLy - ay;
        const d = Math.hypot(dx, dy) || 1;
        const reach = Math.max(this.rope.length, d);
        tx = ax + (dx / d) * reach;
        ty = ay + (dy / d) * reach;
      } else {
        tx = lx + this._grabOffset.x;
        ty = ly + this._grabOffset.y;
      }

      this._moved = Math.max(this._moved, Math.hypot(tx - tip.x, ty - tip.y));
      if (this._moved > 6) this.dragging = true;
      this.rope.dragTip(tx, ty, 0.95);
    }
  }

  _pointerUp(cx, cy) {
    window.removeEventListener('pointermove', this._onPointerMoveWindow);
    window.removeEventListener('pointerup', this._onPointerUpWindow);
    if (!this.grabbed) return;

    const held = performance.now() - this._downAt;
    const tip = this.rope.tip;
    this.grabbed = false;
    this._isCordGrab = false;
    this.el.classList.remove('is-grabbed');
    this.rope.release();

    if (this.dragging) {
      // Release velocity comes from the smoothed pointer velocity
      const vx = (this._pointer.vx || (this._pointer.x - this._pointer.px)) * 1.5;
      const vy = (this._pointer.vy || (this._pointer.y - this._pointer.py)) * 1.5;
      const speed = Math.hypot(vx, vy);
      if (speed > 2) {
        this.rope.flick(vx, vy, 0.5);
        play('flick');
        this.dispatchEvent(new CustomEvent('flick', { detail: { speed } }));
      } else {
        // Elastic rebound if pulled down and released gently, matching Book My Luck
        const pull = Math.max(0, this._moved);
        if (pull > 18) {
          const jump = Math.min(6, 2.0 + pull * 0.025);
          const n = this.rope.nodes.length;
          for (let i = Math.max(1, n - 4); i < n; i++) {
            this.rope.nodes[i].py = this.rope.nodes[i].y + jump * ((i - (n - 4) + 1) / 4);
          }
        }
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
    const lx = cx - rect.left;
    const ly = cy - rect.top;
    if (this._pointer.x === -9999) {
      this._pointer.px = lx;
      this._pointer.py = ly;
      this._pointer.vx = 0;
      this._pointer.vy = 0;
    } else {
      this._pointer.px = this._pointer.x;
      this._pointer.py = this._pointer.y;
      const instVx = lx - this._pointer.px;
      const instVy = ly - this._pointer.py;
      // Exponential moving average filter prevents velocity spikes
      this._pointer.vx = (this._pointer.vx || 0) * 0.75 + instVx * 0.25;
      this._pointer.vy = (this._pointer.vy || 0) * 0.75 + instVy * 0.25;
    }
    this._pointer.x = lx;
    this._pointer.y = ly;
    this._pointer.active = true;
    this._pointer.speed = Math.hypot(this._pointer.vx || 0, this._pointer.vy || 0);
  }

  /** Attach a document-level hover tracker (used on the hero stage and the app). */
  trackCursor(target = window) {
    this._trackTarget = target;
    this._trackHandler = (e) => this._hoverMove(e.clientX, e.clientY);
    this._leaveHandler = () => {
      this._pointer.active = false;
      this._pointer.speed = 0;
      this._pointer.vx = 0;
      this._pointer.vy = 0;
      this._pointer.x = -9999;
      this._pointer.y = -9999;
    };
    target.addEventListener('pointermove', this._trackHandler, { passive: true });
    target.addEventListener('pointerleave', this._leaveHandler, { passive: true });
    if (target === window) {
      document.addEventListener('mouseleave', this._leaveHandler, { passive: true });
    }
    return this;
  }

  untrackCursor() {
    if (this._trackTarget && this._trackHandler) {
      this._trackTarget.removeEventListener('pointermove', this._trackHandler);
      if (this._leaveHandler) {
        this._trackTarget.removeEventListener('pointerleave', this._leaveHandler);
        if (this._trackTarget === window) {
          document.removeEventListener('mouseleave', this._leaveHandler);
        }
      }
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
      let dt = (now - this._last) / 1000;
      this._last = now;
      if (dt > 0.1) dt = 0.1; // tab was backgrounded — do not explode
      this._acc += dt;
      // Fixed 120Hz physics timestep matching Apple ProMotion displays and Book My Luck
      const step = 1 / 120;
      let n = 0;
      while (this._acc >= step && n < 8) {
        this._physics(0.5); // 0.5 normalized frame units per 1/120s step
        this._acc -= step;
        n++;
      }
      this._render(dt);
    };
    this._raf = requestAnimationFrame(tick);
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  _physics(dt = 0.5) {
    if (!this.rope || !this.visible) return;
    const p = this._pointer;

    if (p.active && !this.grabbed) {
      // 1. Soft proximity draught along upper cord nodes
      for (let i = 1; i < this.rope.nodes.length - 2; i++) {
        const q = this.rope.nodes[i];
        const kx = q.x - p.x;
        const ky = q.y - p.y;
        const dd = kx * kx + ky * ky;
        if (dd < 2500 && dd > 1) {
          const r = Math.sqrt(dd);
          const fCord = ((50 - r) / 50) * (this.opts.reducedMotion ? 0.3 : 1.0) * dt;
          q.x += (kx / r) * fCord;
          q.y += (ky / r) * fCord;
        }
      }

      // 2. Direct aerodynamic proximity against the charm body:
      // Measured from the charm's physical center of mass (like a hand brushing past), matching Book My Luck
      const tip = this.rope.tip;
      const angle = this._angle ?? 0;
      const armLen = this.charmH * 0.45;
      const charmCx = tip.x + Math.sin(angle) * armLen;
      const charmCy = tip.y + Math.cos(angle) * armLen;

      const cdx = charmCx - p.x;
      const cdy = charmCy - p.y;
      const dist = Math.hypot(cdx, cdy);
      const repelRad = armLen + 40;

      if (dist < repelRad && dist > 1) {
        const u = (repelRad - dist) / repelRad;
        const f = u * u * (this.opts.reducedMotion ? 0.35 : 1.1) * dt;
        const g = u * (this.opts.reducedMotion ? 0.05 : 0.16) * dt;
        const mvx = Math.max(-16, Math.min(16, p.vx || 0));
        const mvy = Math.max(-16, Math.min(16, p.vy || 0));

        tip.x += (cdx / dist) * f + mvx * g;
        tip.y += ((cdy / dist) * f + mvy * g) * 0.35;
      }
    }

    // Always step: while grabbed the rope runs its own grab spring, then lets the
    // cord's length constraints have the final say.
    this.rope.step(dt);

    // Sideways containment only. Nothing may hang past the edge of the stage.
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

  _render(dt = 1 / 60) {
    if (!this.rope) return;
    const path = this.rope.path();
    if (this.cordHit) this.cordHit.setAttribute('d', path);
    this.cordPath.setAttribute('d', path);
    this.cordPath.setAttribute('stroke-width', 1.8);

    // The second strand is the braided highlight. Taper smoothly to 0 at the anchor
    // and tip so it enters the bead hole cleanly without any displaced strand artifact.
    const tip = this.rope.tip;
    const n = this.rope.nodes.length;

    const pts2 = this.rope.nodes.map((p, i) => {
      if (i === 0 || i === n - 1) return { x: p.x, y: p.y };
      const pPrev = this.rope.nodes[i - 1];
      const pNext = this.rope.nodes[i + 1];
      const dx = pNext.x - pPrev.x;
      const dy = pNext.y - pPrev.y;
      const l = Math.hypot(dx, dy) || 1;
      const taper = Math.sin((i / (n - 1)) * Math.PI);
      return {
        x: p.x - (dy / l) * 1.3 * taper,
        y: p.y + (dx / l) * 1.3 * taper,
      };
    });
    this.cordPath2.setAttribute('d', this.rope.pathTo(pts2));
    this.cordPath2.setAttribute('stroke-width', 1.1);
    this.cordPath2.setAttribute('opacity', '0.45');

    // The charm aligns with the true tangent of the cord at the tip where it enters the bead
    const a = this.rope.angle;
    // Physical constraint: clamp rotation so the charm stays hanging downwards naturally
    const maxTilt = 1.05; // ~60 degrees
    const targetAngle = Math.max(-maxTilt, Math.min(maxTilt, a));

    // Rotational moment of inertia (exponential critically-damped low-pass filter):
    // Real solid jewelry does not twitch instantaneously with micro-vibrations in the cord.
    if (this._angle === undefined || this._angle === null) {
      this._angle = targetAngle;
    } else {
      const blend = 1 - Math.exp(-24 * Math.min(0.05, dt || (1 / 60)));
      this._angle += (targetAngle - this._angle) * blend;
    }

    this.el.style.transform =
      `translate3d(${(tip.x - this.charmW / 2).toFixed(2)}px, ${tip.y.toFixed(2)}px, 0) rotate(${this._angle.toFixed(4)}rad)`;
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
    // Give it a shove so the swap reads as a new object arriving.
    this.rope.nodes.forEach((n, i) => {
      if (i > 0) n.x += (Math.random() - 0.5) * 16;
    });
    if (animate) this.pulse();
    this.dispatchEvent(new CustomEvent('charmchange', { detail: { id: next.id } }));
    return this;
  }

  /** The charm's one small ceremony. */
  ritual() {
    if (!this.visible) this.setVisible(true);
    const api = this._ritualApi();
    try {
      this.charm.ritual?.(this.el, api);
    } catch (err) {
      console.warn('[webdangle] ritual failed', err);
    }
    this.dispatchEvent(new CustomEvent('ritual', { detail: { id: this.charm.id } }));
  }

  _ritualApi() {
    return {
      uid: this.uid,
      play,
      tick: () => play('tick'),
      floater: (text) => this.floater(text),
      aura: (n) => this.dispatchEvent(new CustomEvent('aura', { detail: { amount: n } })),
      ripple: (kind) => this.ripple(kind),
    };
  }

  /** Small text that rises off the charm. */
  floater(text) {
    const d = document.createElement('div');
    d.className = 'dangle-floater';
    d.textContent = text;
    const tip = this.rope.tip;
    d.style.left = `${tip.x}px`;
    d.style.top = `${tip.y + this.charmH * 0.42}px`;
    this.floaterLayer.appendChild(d);
    d.animate(
      [
        { opacity: 0, transform: 'translate(-50%, 0) scale(.8)' },
        { opacity: 1, transform: 'translate(-50%, -14px) scale(1)', offset: 0.22 },
        { opacity: 0, transform: 'translate(-50%, -58px) scale(1.04)' },
      ],
      { duration: 1500, easing: 'cubic-bezier(.2,.7,.3,1)' },
    ).onfinish = () => d.remove();
  }

  /** Sonar rings from the charm — the bell's ring, mostly. */
  ripple() {
    const tip = this.rope.tip;
    for (let i = 0; i < 2; i++) {
      const d = document.createElement('div');
      d.className = 'dangle-ripple';
      d.style.left = `${tip.x}px`;
      d.style.top = `${tip.y + this.charmH * 0.5}px`;
      this.floaterLayer.appendChild(d);
      d.animate(
        [
          { opacity: 0.7, transform: 'translate(-50%,-50%) scale(.3)' },
          { opacity: 0, transform: 'translate(-50%,-50%) scale(2.6)' },
        ],
        { duration: 1100, delay: i * 180, easing: 'ease-out' },
      ).onfinish = () => d.remove();
    }
  }

  pulse() {
    this.el.animate(
      [
        { filter: 'brightness(1)' },
        { filter: 'brightness(1.5)' },
        { filter: 'brightness(1)' },
      ],
      { duration: 520, easing: 'ease-out' },
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
    play('flick');
  }

  setVisible(on) {
    this.visible = !!on;
    this.stage.classList.toggle('is-hidden', !this.visible);
    this.el.setAttribute('aria-hidden', this.visible ? 'false' : 'true');
    return this;
  }

  /** Send it behind page content, keeping watch from the desktop. */
  setBehind(on) {
    this.behind = !!on;
    this.stage.classList.toggle('is-behind', this.behind);
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
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('pointermove', this._onPointerMoveWindow);
    window.removeEventListener('pointerup', this._onPointerUpWindow);
    this.el.remove();
    this.cord.remove();
    this.floaterLayer.remove();
    this.stage.classList.remove('dangle-stage');
  }
}
