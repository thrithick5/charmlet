/**
 * test-physics.mjs — proves the solver does the one thing it exists to do.
 *
 * The claim on the site is that the cord never stretches, however hard you fling
 * it. That is the property Euler integration fails and Verlet keeps. This test
 * drags the tip around violently for thousands of steps and measures the worst
 * segment-length error across the whole run.
 *
 *   node scripts/test-physics.mjs
 */

import { Rope } from '../web/js/verlet.js';

let failures = 0;
const check = (name, pass, detail = '') => {
  console.log(`${pass ? '  ok  ' : ' FAIL '} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!pass) failures++;
};

/* ---------------------------------------------------------------- *
 * 1. Rest lengths hold under sustained violent dragging
 * ---------------------------------------------------------------- */

{
  const rope = new Rope({ x: 300, y: 0, segments: 15, length: 240, tipWeight: 8 });
  let worst = 0;
  let worstPct = 0;

  for (let i = 0; i < 3000; i++) {
    // Whip the tip around a circle far faster than any real pointer could.
    const t = i * 0.09;
    const tx = 300 + Math.cos(t) * 260;
    const ty = 220 + Math.sin(t * 1.7) * 200;
    rope.dragTip(tx, ty, 0.9);
    rope.step(1);
    rope.repel(300 + Math.cos(-t) * 120, 120 + Math.sin(-t) * 90, 150, 3);

    for (let k = 0; k < rope.nodes.length - 1; k++) {
      const a = rope.nodes[k];
      const b = rope.nodes[k + 1];
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      const err = Math.abs(d - rope.rest) / rope.rest;
      if (err > worstPct) {
        worstPct = err;
        worst = d;
      }
    }
  }

  const pct = (worstPct * 100).toFixed(2);
  check(
    'cord never stretches more than 8% under violent drag',
    worstPct < 0.08,
    `worst segment ${worst.toFixed(2)}px vs rest ${rope.rest.toFixed(2)}px (${pct}%)`,
  );
}

/* ---------------------------------------------------------------- *
 * 2. A free-hanging cord comes to rest at roughly its own length
 * ---------------------------------------------------------------- */

{
  const rope = new Rope({ x: 200, y: 0, segments: 14, length: 200, windPhase: 0 });
  let maxDrift = 0;
  for (let i = 0; i < 900; i++) {
    rope.step(1);
    if (i > 600) maxDrift = Math.max(maxDrift, Math.abs(rope.tip.x - 200));
  }

  const tip = rope.tip;
  const drop = tip.y;
  const drift = maxDrift;
  const speed = Math.hypot(tip.vx, tip.vy);

  check('a free cord settles, it does not swing forever', speed < 0.9, `tip speed ${speed.toFixed(3)}px/frame`);
  check(
    'a settled cord hangs at close to its rest length',
    drop > 200 * 0.9 && drop < 200 * 1.12,
    `dropped ${drop.toFixed(1)}px of 200px`,
  );
  // The idle wind is a product decision: visible, but never a windsock.
  check(
    'idle sway is gentle — a few degrees, not a windsock',
    drift > 3 && drift < 45,
    `drifted ${drift.toFixed(1)}px off vertical on a 200px cord (~${((Math.asin(Math.min(1, drift / 200)) * 180) / Math.PI).toFixed(1)}°)`,
  );
}

/* ---------------------------------------------------------------- *
 * 3. Instability guard: no NaN, no escape
 * ---------------------------------------------------------------- */

{
  const rope = new Rope({ x: 100, y: 0, segments: 12, length: 180 });
  let bad = null;
  for (let i = 0; i < 2000; i++) {
    rope.dragTip(Math.random() * 4000 - 2000, Math.random() * 4000 - 2000, 1);
    rope.step(1);
    for (const n of rope.nodes) {
      if (!Number.isFinite(n.x) || !Number.isFinite(n.y)) bad = `node at step ${i}`;
    }
  }
  check('no NaN or Infinity under adversarial input', !bad, bad || '2000 randomised yanks, all finite');
}

/* ---------------------------------------------------------------- *
 * 4. The anchor never moves
 * ---------------------------------------------------------------- */

{
  const rope = new Rope({ x: 50, y: 0, segments: 10, length: 160 });
  rope.setAnchor(50, 0);
  for (let i = 0; i < 500; i++) {
    rope.dragTip(900, 900, 1);
    rope.step(1);
  }
  const head = rope.nodes[0];
  check('the anchor is absolute', head.x === 50 && head.y === 0, `anchor at (${head.x}, ${head.y})`);
}

/* ---------------------------------------------------------------- *
 * 5. Flick injects real velocity
 * ---------------------------------------------------------------- */

{
  const rope = new Rope({ x: 200, y: 0, segments: 14, length: 200 });
  for (let i = 0; i < 400; i++) rope.step(1);
  const before = Math.hypot(rope.tip.vx, rope.tip.vy);
  rope.flick(40, -18, 0.55);
  const after = Math.hypot(rope.tip.vx, rope.tip.vy);
  check('a flick actually throws the charm', after > before + 5, `${before.toFixed(2)} → ${after.toFixed(2)} px/frame`);
}

console.log('');
if (failures) {
  console.error(`${failures} check(s) failed`);
  process.exit(1);
}
console.log('all physics checks passed');
