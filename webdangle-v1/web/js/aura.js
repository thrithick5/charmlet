/**
 * aura.js — the scoreboard for a bit that has no score.
 *
 * Deliberately honest: this counts *your* interactions in *this* session. It is not
 * a fake global counter and it never pretends other people are on the site.
 */

const KEY = 'webdangle.aura';

export class Aura {
  constructor({ onUpdate } = {}) {
    this.onUpdate = onUpdate || (() => {});
    this.session = 0;
    this.thwips = 0;
    this.ritualCount = 0;
    this.best = this._load();
    this._flushTimer = null;
  }

  _load() {
    try {
      return Number(localStorage.getItem(KEY)) || 0;
    } catch {
      return 0;
    }
  }

  _save() {
    clearTimeout(this._flushTimer);
    this._flushTimer = setTimeout(() => {
      try {
        localStorage.setItem(KEY, String(this.best));
      } catch {
        /* private mode */
      }
    }, 400);
  }

  add(amount, reason = 'aura') {
    this.session += amount;
    this.ritualCount++;
    if (this.session > this.best) {
      this.best = this.session;
      this._save();
    }
    this.onUpdate(this.snapshot(reason));
    return amount;
  }

  thwip() {
    this.thwips++;
    this.onUpdate(this.snapshot('thwip'));
  }

  /** The rank escalates with session aura — pure vibes, clearly labelled as such. */
  get rank() {
    const a = this.session;
    if (a >= 300) return { label: 'Aura farmer', tone: 'max' };
    if (a >= 150) return { label: 'Main character', tone: 'high' };
    if (a >= 60) return { label: 'Locked in', tone: 'mid' };
    if (a >= 15) return { label: 'Warming up', tone: 'low' };
    return { label: 'NPC', tone: 'none' };
  }

  snapshot(reason) {
    return {
      session: this.session,
      thwips: this.thwips,
      rituals: this.ritualCount,
      best: this.best,
      rank: this.rank,
      reason,
    };
  }

  reset() {
    this.session = 0;
    this.thwips = 0;
    this.ritualCount = 0;
    this.onUpdate(this.snapshot('reset'));
  }
}
