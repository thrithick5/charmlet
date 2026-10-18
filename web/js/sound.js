/**
 * sound.js — every noise in the product, synthesised at runtime.
 *
 * Zero audio files: nothing to download, nothing to license, and no 404s. The
 * AudioContext is created lazily on the first real user gesture so browsers never
 * block it, and the whole engine is a no-op until sound is explicitly enabled.
 */

let ctx = null;
let master = null;
let enabled = false;

const MUTE_KEY = 'webdangle.muted';

export function isEnabled() {
  return enabled;
}

export function setEnabled(on) {
  enabled = !!on;
  try {
    localStorage.setItem(MUTE_KEY, enabled ? '0' : '1');
  } catch {
    /* private mode — sound just will not persist */
  }
  if (enabled) ensureContext();
}

export function restorePreference() {
  let stored = '1';
  try {
    stored = localStorage.getItem(MUTE_KEY) ?? '1';
  } catch {
    /* ignore */
  }
  enabled = stored === '0';
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
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/* ------------------------------------------------------------------ *
 * Primitives
 * ------------------------------------------------------------------ */

function noiseBuffer(seconds = 0.4) {
  const c = ensureContext();
  if (!c) return null;
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/** A burst of filtered noise sweeping in frequency — the backbone of thwips and whooshes. */
function noiseSweep({ from = 4000, to = 400, dur = 0.16, q = 2, gain = 0.35, type = 'bandpass' }) {
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
  g.gain.linearRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  src.connect(filt).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.05);
}

/** Single oscillator with an exponential pitch contour. */
function tone({ freq = 440, to = null, dur = 0.18, type = 'sine', gain = 0.22, delay = 0 }) {
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
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/** FM bell — one carrier, one modulator, used for the ghanta and sparkles. */
function bell({ freq = 880, dur = 1.1, gain = 0.2, ratio = 2.76 }) {
  const c = ensureContext();
  if (!c) return;
  const t = c.currentTime;

  const carrier = c.createOscillator();
  carrier.type = 'sine';
  carrier.frequency.value = freq;

  const mod = c.createOscillator();
  mod.type = 'sine';
  mod.frequency.value = freq * ratio;

  const modGain = c.createGain();
  modGain.gain.setValueAtTime(freq * 1.4, t);
  modGain.gain.exponentialRampToValueAtTime(1, t + dur * 0.5);

  mod.connect(modGain).connect(carrier.frequency);

  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  carrier.connect(g).connect(master);
  carrier.start(t);
  mod.start(t);
  carrier.stop(t + dur + 0.05);
  mod.stop(t + dur + 0.05);
}

/* ------------------------------------------------------------------ *
 * The sounds
 * ------------------------------------------------------------------ */

const SOUNDS = {
  /** Web-shooter. The signature noise of the whole product. */
  thwip() {
    noiseSweep({ from: 7000, to: 900, dur: 0.11, q: 6, gain: 0.3 });
    tone({ freq: 1500, to: 320, dur: 0.09, type: 'triangle', gain: 0.1 });
  },

  /** Cord creak on grab. */
  grab() {
    noiseSweep({ from: 900, to: 2400, dur: 0.07, q: 3, gain: 0.1, type: 'bandpass' });
  },

  /** Whoosh as the charm is thrown. */
  flick() {
    noiseSweep({ from: 1800, to: 260, dur: 0.26, q: 1.2, gain: 0.16, type: 'lowpass' });
  },

  /** Soft swing tick while the charm is in motion. */
  sway() {
    noiseSweep({ from: 600, to: 300, dur: 0.09, q: 2, gain: 0.045, type: 'lowpass' });
  },

  /** Temple bell. */
  bell() {
    bell({ freq: 720, dur: 1.6, gain: 0.24 });
    bell({ freq: 1080, dur: 1.1, gain: 0.1, ratio: 3.1 });
  },

  /** Glass eye flicked. */
  glass() {
    tone({ freq: 2400, to: 1800, dur: 0.22, type: 'sine', gain: 0.14 });
    tone({ freq: 3600, to: 2600, dur: 0.18, type: 'sine', gain: 0.06 });
  },

  /** Keycap press. */
  clack() {
    noiseSweep({ from: 5200, to: 1200, dur: 0.035, q: 1, gain: 0.28, type: 'highpass' });
    tone({ freq: 220, to: 140, dur: 0.05, type: 'square', gain: 0.07 });
  },

  /** Slurp through a fat straw. */
  slurp() {
    noiseSweep({ from: 300, to: 1500, dur: 0.42, q: 5, gain: 0.14 });
    tone({ freq: 180, to: 420, dur: 0.4, type: 'sine', gain: 0.07 });
  },

  /** Slime squish. */
  squish() {
    noiseSweep({ from: 1200, to: 180, dur: 0.3, q: 1.4, gain: 0.18, type: 'lowpass' });
    tone({ freq: 320, to: 90, dur: 0.26, type: 'sine', gain: 0.12 });
  },

  /** Capybara, unbothered. */
  chill() {
    noiseSweep({ from: 700, to: 220, dur: 0.9, q: 0.8, gain: 0.07, type: 'lowpass' });
    tone({ freq: 300, to: 260, dur: 0.7, type: 'sine', gain: 0.05 });
  },

  /** Sparkle burst. */
  sparkle() {
    for (let i = 0; i < 5; i++) {
      tone({
        freq: 1600 + i * 620,
        dur: 0.24,
        type: 'sine',
        gain: 0.055,
        delay: i * 0.045,
      });
    }
  },

  /** Tamagotchi happy chirp. */
  chirp() {
    tone({ freq: 1200, to: 1900, dur: 0.08, type: 'square', gain: 0.07 });
    tone({ freq: 1900, to: 2400, dur: 0.09, type: 'square', gain: 0.06, delay: 0.09 });
  },

  /** Rubber duck. */
  squeak() {
    tone({ freq: 900, to: 1500, dur: 0.14, type: 'sawtooth', gain: 0.09 });
    tone({ freq: 1500, to: 700, dur: 0.16, type: 'sawtooth', gain: 0.07, delay: 0.12 });
  },

  /** Aura absorbed. */
  aura() {
    for (let i = 0; i < 4; i++) {
      tone({ freq: 420 + i * 160, to: 900 + i * 200, dur: 0.5, type: 'sine', gain: 0.07, delay: i * 0.06 });
    }
  },

  /** Wish granted. */
  wish() {
    bell({ freq: 1180, dur: 1.4, gain: 0.16 });
  },

  /** Something went delightfully wrong. */
  bonk() {
    tone({ freq: 180, to: 70, dur: 0.22, type: 'square', gain: 0.14 });
    noiseSweep({ from: 2200, to: 400, dur: 0.12, q: 1, gain: 0.16 });
  },

  /** UI tick. */
  tick() {
    tone({ freq: 2100, dur: 0.045, type: 'sine', gain: 0.05 });
  },
};

/**
 * Play a named sound. Silently does nothing when sound is off, which is the
 * default — nobody wants a website that makes noise before they ask.
 */
export function play(name) {
  if (!enabled) return;
  const fn = SOUNDS[name];
  if (!fn) return;
  try {
    ensureContext();
    fn();
  } catch {
    /* audio is decoration; never let it break the charm */
  }
}

export const SOUND_NAMES = Object.keys(SOUNDS);
