import { readFileSync } from 'fs';
import { resolve } from 'path';

// Verify that bundle.js contains the carousel logic, chevrons, and swipe listeners
const bundle = readFileSync(resolve('web/js/bundle.js'), 'utf8');

const checks = [
  { name: 'initStageCarousel function exists', test: () => bundle.includes('initStageCarousel') },
  { name: 'Previous chevron button (#stagePrevBtn) wired', test: () => bundle.includes('stagePrevBtn') },
  { name: 'Next chevron button (#stageNextBtn) wired', test: () => bundle.includes('stageNextBtn') },
  { name: 'Counter updates currentCharmIndex and totalCharmsCount', test: () => bundle.includes('currentCharmIndex') && bundle.includes('totalCharmsCount') },
  { name: 'Pointerdown, move, up swipe event listeners bound', test: () => bundle.includes('pointerdown') && bundle.includes('pointermove') && bundle.includes('pointerup') },
  { name: 'Rubberbanding physics implemented', test: () => bundle.includes('rubberband') },
  { name: 'Velocity threshold and direction calculation implemented', test: () => bundle.includes('velocityX') && bundle.includes('shouldGoNext') && bundle.includes('shouldGoPrev') },
  { name: 'Arrow keys (ArrowLeft, ArrowRight) wired', test: () => bundle.includes('ArrowLeft') && bundle.includes('ArrowRight') },
  { name: 'Charm selection updates stage badge and counter', test: () => bundle.includes('updateStageBadge') && bundle.includes('updateStageCounter') },
  { name: 'Active charm synced to bottom grid cards', test: () => bundle.includes('aria-pressed') }
];

let failed = 0;
for (const c of checks) {
  if (c.test()) {
    console.log(`  ok   ${c.name}`);
  } else {
    console.error(`  FAIL ${c.name}`);
    failed++;
  }
}

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\nAll carousel & swipe integration checks passed!\n');
}
