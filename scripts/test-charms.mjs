/**
 * test-charms.mjs — makes sure all eighteen charms actually work.
 *
 * Rendering could not be verified with pixels in this environment (the sandbox has
 * no WindowServer access, so every Chromium GPU path deadlocks). These tests cover
 * the bug classes that a screenshot would have caught anyway:
 *
 *   1. An SVG that does not parse — the charm silently renders as nothing.
 *   2. A ritual that animates a `data-part` which does not exist in its own art,
 *      so the ritual does nothing and nobody notices.
 *   3. A duplicate SVG id, which makes every copy of a charm share one gradient.
 *   4. A ritual that throws, taking the whole page's event handler with it.
 *
 *   node scripts/test-charms.mjs
 */

import { CHARMS, CHARM_GROUPS, renderArt, getCharm } from '../web/js/charms.js';

let failures = 0;
const check = (name, pass, detail = '') => {
  console.log(`${pass ? '  ok  ' : ' FAIL '} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!pass) failures++;
};

/* ------------------------------------------------------------------ *
 * 1. Every charm's SVG is well-formed XML with balanced tags
 * ------------------------------------------------------------------ */

/** Minimal well-formedness check: tag balance + a real attribute parser. */
function xmlIssues(svg) {
  const issues = [];
  const stack = [];
  const tagRe = /<(\/?)([a-zA-Z][\w:.-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m;
  let last = 0;

  while ((m = tagRe.exec(svg))) {
    const [full, closing, name, attrs, selfClose] = m;
    if (closing && !selfClose) {
      const top = stack.pop();
      if (top !== name) issues.push(`</${name}> closes <${top ?? 'nothing'}>`);
    } else {
      const attrIssue = attrIssues(attrs);
      if (attrIssue) issues.push(`<${name}>: ${attrIssue}`);
      if (!selfClose) stack.push(name);
    }
    last = m.index + full.length;
  }
  if (stack.length) issues.push(`unclosed: ${stack.join(', ')}`);
  if (svg.slice(last).includes('<')) issues.push('content after the final tag');
  return issues;
}

/**
 * Consume a tag's attribute list the way an XML parser would. Anything left over
 * that is not `name="value"` is a genuine malformed attribute — which is the bug
 * class worth catching, because a stray quote silently swallows the next attribute.
 */
function attrIssues(tagBody) {
  let rest = tagBody;
  let guard = 0;
  const re = /^\s*([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/;

  while (rest.trim().length) {
    if (guard++ > 80) return 'attribute list never terminates';
    const m = rest.match(re);
    if (!m) return `malformed attribute near "${rest.trim().slice(0, 56)}"`;
    const value = m[2] ?? m[3] ?? '';
    if (value.includes('<')) return `unescaped "<" inside ${m[1]}="${value.slice(0, 24)}"`;
    rest = rest.slice(m[0].length);
  }
  return null;
}

for (const c of CHARMS) {
  const issues = xmlIssues(c.art);
  check(`svg parses · ${c.name}`, issues.length === 0, issues.slice(0, 2).join('; '));
}

/* ------------------------------------------------------------------ *
 * 2. Ritual parts all exist in the charm's own artwork
 * ------------------------------------------------------------------ */

function partsInArt(art) {
  const set = new Set();
  for (const m of art.matchAll(/data-part="([^"]+)"/g)) set.add(m[1]);
  return set;
}

/** Pull every `parts(root, 'x')` name out of a ritual function's source. */
function partsUsedBy(fn) {
  const used = new Set();
  if (!fn) return used;
  for (const m of fn.toString().matchAll(/parts\(\s*root\s*,\s*['"]([^'"]+)['"]\s*\)/g)) used.add(m[1]);
  return used;
}

for (const c of CHARMS) {
  const have = partsInArt(c.art);
  const used = partsUsedBy(c.ritual);
  const missing = [...used].filter((p) => !have.has(p));
  check(
    `ritual parts exist · ${c.name}`,
    missing.length === 0,
    missing.length ? `ritual animates [${missing}] but art only has [${[...have].join(', ')}]` : `${used.size} part(s) wired`,
  );
}

/* ------------------------------------------------------------------ *
 * 3. Art actually has a hanger and a viewBox
 * ------------------------------------------------------------------ */

for (const c of CHARMS) {
  // The cord must start at y=0, the very top of the viewBox. If a charm's stub
  // starts lower, the rope ends in mid-air and you get a visible gap between the
  // cord and the artwork — which is exactly the bug this assertion was added for.
  const ok =
    /viewBox="0 0 [\d.]+ [\d.]+"/.test(c.art) &&
    /M\s*\d+(?:\.\d+)?\s+0\s+V/.test(c.art);
  check(`cord starts at the top edge · ${c.name}`, ok);
}

/* ------------------------------------------------------------------ *
 * 4. Ids are namespaced, never duplicated
 * ------------------------------------------------------------------ */

{
  let bad = [];
  for (const c of CHARMS) {
    const ids = [...c.art.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length) bad.push(`${c.name}: ${dupes.join(', ')}`);
    const unnamespaced = ids.filter((id) => !id.includes('__ID__'));
    if (unnamespaced.length) bad.push(`${c.name}: un-namespaced ${unnamespaced.join(', ')}`);
  }
  check('every svg id is __ID__-namespaced and unique', bad.length === 0, bad.slice(0, 3).join(' | '));
}

{
  // The same charm rendered twice must not collide.
  const a = renderArt(getCharm('nazar'), 'u1');
  const b = renderArt(getCharm('nazar'), 'u2');
  const idA = [...a.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  const idB = [...b.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  check(
    'two copies of one charm get different ids',
    idA.length > 0 && idA.every((id) => !idB.includes(id)),
    `${idA.length} ids, all distinct across copies`,
  );
  check('no __ID__ token survives rendering', !a.includes('__ID__') && !a.includes('url(#__ID__)'));
}

/* ------------------------------------------------------------------ *
 * 5. Registry consistency
 * ------------------------------------------------------------------ */

{
  const ids = CHARMS.map((c) => c.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  check('charm ids are unique', dupes.length === 0, dupes.join(', '));

  const grouped = CHARM_GROUPS.flatMap((g) => g.ids);
  const ungrouped = ids.filter((id) => !grouped.includes(id));
  const phantom = grouped.filter((id) => !ids.includes(id));
  check('every charm is in exactly one group', ungrouped.length === 0 && phantom.length === 0,
    ungrouped.length ? `ungrouped: ${ungrouped}` : phantom.length ? `group references missing: ${phantom}` : '18 charms, 3 groups');

  const missingMeta = CHARMS.filter(
    (c) =>
      !c.name ||
      !c.origin ||
      !c.plaque ||
      !c.accent ||
      !c.hint ||
      typeof c.ritualName !== 'string' ||
      c.ritualName.length === 0 ||
      typeof c.ritual !== 'function',
  );
  check(
    'every charm has name, origin, plaque, accent, hint, a ritual label and a ritual method',
    missingMeta.length === 0,
    missingMeta.map((c) => c.name || c.id).join(', '),
  );

  // The bug this exists for: giving the string label and the method the same key
  // means the method silently overwrites the label, and every card in the gallery
  // renders the function's source code as its caption.
  const collided = CHARMS.filter(
    (c) => typeof c.ritual === 'string' || typeof c.ritualName === 'function',
  );
  check(
    'ritual label and ritual method are not the same key',
    collided.length === 0,
    collided.length ? `collided on ${collided.map((c) => c.id).join(', ')}` : '18 labels, 18 methods, distinct',
  );

  // The one-sentence museum plaque rule: twelve words at most.
  const longPlaques = CHARMS.filter((c) => c.plaque.trim().split(/\s+/).length > 12);
  check('plaques stay within twelve words', longPlaques.length === 0,
    longPlaques.map((c) => `${c.name} (${c.plaque.split(/\s+/).length})`).join(', '));
}

/* ------------------------------------------------------------------ *
 * 6. Every ritual runs without throwing
 * ------------------------------------------------------------------ */

/** A DOM stub that knows which data-parts actually exist, and records misses. */
function makeStubRoot(art) {
  const available = partsInArt(art);
  const misses = [];
  const animated = [];

  const mkEl = (tag = 'g', attrs = {}) => ({
    tagName: tag.toUpperCase(),
    dataset: {},
    attrs,
    style: { setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute(k, v) { this.attrs[k] = v; },
    getAttribute(k) { return this.attrs[k]; },
    addEventListener() {},
    removeEventListener() {},
    animate(frames, opts) {
      animated.push({ tag: this.tagName, frames: Array.isArray(frames) ? frames.length : 1, opts });
      return { onfinish: null, cancel() {}, finish() {} };
    },
    querySelectorAll(sel) {
      if (sel.startsWith('[data-part=')) {
        const name = sel.match(/\[data-part="([^"]+)"\]/)?.[1];
        if (!available.has(name)) {
          misses.push(name);
          return [];
        }
        return [mkEl('g')];
      }
      if (sel === 'stop') return [mkEl('stop'), mkEl('stop')];
      return [];
    },
    querySelector(sel) {
      if (sel.startsWith('#')) return mkEl('linearGradient');
      if (sel === 'svg') return mkEl('svg');
      return mkEl('g');
    },
  });

  const root = mkEl('div');
  root.art = art;
  Object.defineProperty(root, '_misses', { value: misses });
  Object.defineProperty(root, '_animated', { value: animated });
  return root;
}

for (const c of CHARMS) {
  const root = makeStubRoot(c.art);
  const calls = [];
  const api = {
    uid: 'test1',
    play: (n) => calls.push(`play:${n}`),
    tick: () => calls.push('tick'),
    floater: (t) => calls.push(`floater:${t}`),
    aura: (n) => calls.push(`aura:${n}`),
    ripple: () => calls.push('ripple'),
  };
  let threw = null;
  try {
    c.ritual?.(root, api);
  } catch (err) {
    threw = err.message;
  }
  check(`ritual runs · ${c.name}`, !threw, threw || `${root._animated.length} animation(s), ${calls.length} effect(s)`);
  check(
    `ritual found its parts · ${c.name}`,
    root._misses.length === 0,
    root._misses.length ? `looked for missing part(s): ${[...new Set(root._misses)].join(', ')}` : '',
  );
  check(`ritual does something · ${c.name}`, root._animated.length > 0 || calls.some((k) => k.startsWith('play') || k.startsWith('floater')));
}

/* ------------------------------------------------------------------ *
 * 7. Sound names referenced by charms actually exist
 * ------------------------------------------------------------------ */

{
  const soundSrc = await import('node:fs').then((fs) =>
    fs.readFileSync(new URL('../web/js/sound.js', import.meta.url), 'utf8'),
  );
  const known = new Set([...soundSrc.matchAll(/^\s{2}(\w+)\(\)\s*\{/gm)].map((m) => m[1]));
  const bad = CHARMS.filter((c) => c.sound && !known.has(c.sound));
  check('every charm asks for a sound that exists', bad.length === 0,
    bad.length ? bad.map((c) => `${c.name}→${c.sound}`).join(', ') : `${known.size} sounds available`);
}

console.log('');
if (failures) {
  console.error(`${failures} check(s) failed`);
  process.exit(1);
}
console.log(`all charm checks passed — ${CHARMS.length} charms, ${CHARM_GROUPS.length} groups`);
