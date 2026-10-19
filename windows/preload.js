const { ipcRenderer } = require('electron');

let isIgnoring = true;
let isGrabbed = false;

function hitTest(e) {
  if (!window.charmlet || typeof window.charmlet.hover !== 'function') return;
  const metrics = window.charmlet.hover(e.clientX, e.clientY);
  const hit = !!(metrics && (metrics.hit || metrics.grabbed));
  isGrabbed = !!(metrics && metrics.grabbed);

  if (hit && isIgnoring) {
    isIgnoring = false;
    ipcRenderer.send('set-ignore-mouse-events', false);
  } else if (!hit && !isIgnoring && !isGrabbed) {
    isIgnoring = true;
    ipcRenderer.send('set-ignore-mouse-events', true, { forward: true });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('mousemove', hitTest, { passive: true });
  window.addEventListener('pointerup', () => {
    isGrabbed = false;
    setTimeout(() => {
      if (window.charmlet && typeof window.charmlet.metrics === 'function') {
        const m = window.charmlet.metrics();
        if (!m?.grabbed && isIgnoring === false) {
          isIgnoring = true;
          ipcRenderer.send('set-ignore-mouse-events', true, { forward: true });
        }
      }
    }, 50);
  });
});
