# Web Dangle — Product & Engineering Plan

> A lucky charm for your screen. An original web-slinger hangs upside down from the top of
> your display, sways while you work, stays out of every click, and drops in when you call it.

This is the full plan from zero to a working product, plus a record of what was actually built.

---

## 1. Product definition

**One-liner.** Web Dangle hangs a lucky charm from the top edge of your screen. You can grab it,
flick it, and call it down before something that matters.

**The brief.** Build the Lucky Dangle product again, but swap the lemon-and-chilies charm
(*nimbu-mirchi*) for a hero hanging upside down, and add charms that a Gen-Z audience actually
wants on their screen.

**The IP decision (important).** Spider-Man is Marvel/Disney intellectual property — the name,
the suit design, and the web-shooter look are all protected. Shipping a paid product with them is
infringement and would be takedown-bait on day one. So:

- The hero is an **original character, "The Slinger"** — an upside-down masked web-slinger drawn
  from scratch as SVG in this repo (red mask, large white lenses, black webbing, blue limbs,
  chibi proportions). Nothing is traced, copied, or derived from Marvel artwork.
- The name **Spider-Man never appears** anywhere in the product, code, or copy.
- The charm is **swappable**: `web/js/charms.js` is a plain registry, so a licensed or
  commissioned character can be dropped in without touching the engine.

This gets the exact visual the brief asked for — a masked hero hanging upside down — while leaving
you a product you can legally sell.

**Pricing.** One-time, no subscription, no account, no license key: **$7.77 (Lucky)** and
**$11.11 (Delulu)**. Delulu jumps your charm suggestion to the front of the queue.

**Positioning.** A tiny museum, not a sticker pack. Every cultural charm is researched, gets a
one-sentence plaque of twelve words or fewer, and no deities or sacred objects are used.

---

## 2. The charm lineup

### The hero
| Charm | Origin | Ritual |
|---|---|---|
| **Web Slinger** | Yours | Thwip — he drops, swings, and shoots a web |

### World charms
| Charm | Origin | Ritual |
|---|---|---|
| Nazar boncuğu | Türkiye / Mediterranean | Flick it for cover |
| Hamsa | Middle East / North Africa | Flick to send bad luck on its way |
| Ghanta | India | Ring the bell on a wish |
| Drishti bommai | South India | Repaint it through seven colours |
| Páncháng jié | China | Cinch the red cord |
| Daruma | Japan | Paint one eye on the wish, the other when it comes true |
| Maneki-neko | Japan | Beckon, then wind down like a battery cat |
| Horseshoe | Europe / Americas | Flick it, points up |
| Scarab | Ancient Egypt | Spread the wings, then tuck them away |
| Himmeli | Finland | Set the geometry turning |

### Gen-Z drops
| Charm | Ritual |
|---|---|
| **Boba** | Slurp — the pearls jump, the straw dips |
| **Capybara** | Chill — steam rises, it sinks into the onsen |
| **Disco ball** | Spin it and throw sparkle |
| **Tamagotchi** | Feed the pixel pet, it grows and hearts fly |
| **ESC keycap** | Press it — clack, pop, *escaped* |
| **Slime** | Squish it |
| **Aura orb** | Absorb — the orb pulses and pays out aura |

**Design law: seven.** Seven chillies, seven nail holes, seven drishti repaints, seven boba pearls.
The app is about luck; the number soaks into its bones.

---

## 3. Architecture

Single engine, two hosts. The rope physics and the charm artwork are written **once** in
JavaScript and used by both the website and the native macOS app, so the charm can never drift
between the two.

```
Lucky Dangle/
├── PLAN.md                     this document
├── README.md                   how to run everything
├── web/                        zero-build static site (no npm install, no bundler)
│   ├── index.html              marketing site
│   ├── charm.html              transparent charm-only page, hosted by the Mac app
│   ├── styles.css
│   └── js/
│       ├── verlet.js           position-based rope solver
│       ├── dangle.js           the rig: anchor, rope, charm, wind, drag, flick, ritual
│       ├── charms.js           charm registry — SVG art + ritual animations
│       ├── sound.js            WebAudio synth (no audio files)
│       ├── aura.js             aura meter + thwip counter
│       └── app.js              site boot: theme, gallery, konami, photo charms
├── macos/
│   ├── Package.swift
│   ├── build.sh                compile + assemble WebDangle.app + register URL scheme
│   ├── Resources/              engine copied in at build time
│   └── Sources/WebDangle/
│       ├── main.swift          NSApplication bootstrap, .accessory (no Dock icon)
│       ├── AppDelegate.swift   status item, menu, wiring
│       ├── DangleWindow.swift  transparent borderless window + pass-through hit testing
│       ├── CharmWebView.swift  WKWebView hosting charm.html
│       ├── HotKeys.swift       Carbon RegisterEventHotKey (no Accessibility prompt)
│       ├── Preferences.swift   UserDefaults: charm, visibility, level, position
│       └── CharmCatalog.swift  charm list + ritual names shared with the menu
└── scripts/
    ├── serve.sh                local static server
    └── shot.sh                 headless screenshot for visual verification
```

### Why the engine is shared
The alternative — reimplementing each charm in SwiftUI — means drawing every charm twice and
maintaining two physics solvers. Hosting the identical JS engine in a transparent `WKWebView`
means **the app and the site are guaranteed to look and behave the same**, and a new charm is a
one-file change that ships to both. Swift keeps everything the web cannot do: menu bar presence,
click-through windows, global hotkeys, launch-at-login and the `webdangle://` URL scheme.

### The rope: position-based Verlet integration
Chosen over Euler integration because it is unconditionally stable under fast motion, needs no
velocity bookkeeping, and costs almost nothing per frame.

```
x(t+dt) = 2·x(t) − x(t−dt) + a(t)·dt²
```

Each node stores only its current and previous position; velocity is the displacement between
them. Constraints are then relaxed over N iterations, weighted by inverse mass, so the heavy charm
node pulls the light rope rather than the other way round.

| Property | Euler | Verlet (this build) |
|---|---|---|
| Stability under fast drags | springs stretch and explode | rigid, never stretches |
| Bookkeeping | velocity per node, damped every frame | one subtraction |
| Cost at 120 Hz | medium | negligible |

### The rig
`Dangle` owns one `Rope` plus one DOM node holding the inline SVG. Per frame it:

1. Steps the rope with gravity, air damping and a slow idle wind.
2. Pushes nodes away from the cursor so the charm **leans away from a passing pointer**.
3. Places the charm at the last node and rotates it to the rope's tangent.
4. Adds a small swing impulse when the pointer moves fast nearby, so the world feels physical.

Interaction model: only the charm catches the cursor. Press and hold to grab (the tip follows the
pointer on a spring), release with speed to flick, and the flick's velocity is injected into the
rope so it swings properly instead of snapping.

### Native click-through
The hard requirement is that the charm must be grabbable while **everything else clicks straight
through**. A window either takes clicks or it does not, and a full-screen overlay that takes clicks
would swallow the whole desktop.

The solution used here:
- The window is borderless, transparent, `level = .floating`, and
  `ignoresMouseEvents = true` by default, so every click passes to whatever is underneath.
- A **global mouse-moved monitor** (mouse events do not require Accessibility permission) tracks
  the cursor and feeds it to the physics even while the window is inert.
- When the cursor enters the charm's hit rectangle, the window flips `ignoresMouseEvents = false`
  so the charm becomes grabbable; the moment the cursor leaves, it flips back.

Net effect: the charm is the only pixel on screen that can consume a click.

Hotkeys use Carbon `RegisterEventHotKey` rather than an event monitor, because global key
monitors *do* require Accessibility permission and would greet the user with a scary prompt on
first launch.

---

## 4. Build order

| # | Step | Output | Status |
|---|---|---|---|
| 1 | Plan and lock decisions (IP, scope, stack, name, lineup) | this file | done |
| 2 | Rope solver | `web/js/verlet.js` | done |
| 3 | Sound synthesis, zero assets | `web/js/sound.js` | done |
| 4 | Charm art + rituals | `web/js/charms.js` | done |
| 5 | The rig | `web/js/dangle.js` | done |
| 6 | Site shell: layout, theme, typography | `web/index.html`, `web/styles.css` | done |
| 7 | Site behaviour: gallery, aura, konami, photo charms | `web/js/app.js`, `web/js/aura.js` | done |
| 8 | Transparent host page for the native app | `web/charm.html` | done |
| 9 | Serve and verify visually with headless screenshots | screenshots | done |
| 10 | macOS app: window, pass-through, menu, hotkeys, URL scheme | `macos/` | done |
| 11 | Compile and launch the app | `WebDangle.app` | done |
| 12 | Docs | `README.md` | done |

---

## 5. Verification — what was actually run, and what it caught

Two suites in `scripts/`, plus a self-portrait mode built into the app.

### `node scripts/test-physics.mjs` — 7 checks, all passing

Asserts the one property the whole approach exists for: the cord never stretches.
Also covers settling, gentle idle sway, adversarial input, anchor immutability, and
that a flick injects real velocity.

### `node scripts/test-charms.mjs` — ~95 checks, all passing

Parses every charm's artwork as XML with a real attribute parser, checks the cord
starts at the top edge, verifies every `data-part` a ritual animates exists in that
charm's own art, checks SVG ids are namespaced and unique, enforces the plaque
word-limit, and runs all eighteen rituals against a DOM stub.

### `WebDangle --snapshot` / `--probe` — real pixels, from the app itself

Headless Chromium could not render in this environment (no WindowServer access, so
every GPU path deadlocks). WebKit could, so the app photographs itself. Every image in
`shots/` came out of the shipping engine, and `--probe` prints the rig's live numbers.

### The bugs these caught

Worth recording, because none of them were visible from reading the code.

| # | What was wrong | Found by | Fix |
|---|---|---|---|
| 1 | Violent drags stretched the cord by **130%** | Physics test | Clamp the *grab target* to the cord's reach, plus a strain-triggered convergence guard → 1.5% |
| 2 | Idle wind was a windsock — **24° of sway** | Physics test | Wind retuned; measured at 2.5° |
| 3 | The charm hung at **28° off plumb** while the cord was vertical | `--probe` tilt | The heavy tip lagged the light nodes above it and kinked the cord. Tip weight rescaled, tangent measured over a multi-node baseline → 6–9° |
| 4 | A **visible gap** between the cord and all 18 charms | Snapshot | Every cord stub started at y≈10–16 instead of y=0. Anchored all 18 at the top edge; the test was tightened to catch it |
| 5 | **Every gallery card printed raw JavaScript source** as its caption | Snapshot | `ritual: 'Thwip'` (label) and `ritual(root, api) {}` (method) were the same key, so the method overwrote the label. Renamed the label to `ritualName`; added a collision test |
| 6 | The **hero's own card rendered as an empty box** | Snapshot | The live-solver budget evicted in insertion order, so the first card was always the first casualty, and an IntersectionObserver never re-fires for a card that stayed in the viewport. Budget rewritten to be visibility-driven |
| 7 | `charm.html` had **no stylesheet at all** | Snapshot | The app's surface was missing every rig positioning rule. Extracted `charm.css`, now shared by both pages |

Bugs 5 and 6 are why the snapshot mode exists. Neither would have been caught by a
unit test, and both would have shipped.

### End-to-end

The app was built, launched, and confirmed to boot the engine inside real WebKit — the
log line `charm catalogue loaded from the engine: 18 charms` proves the custom scheme
handler served the page, the ES modules executed, and all eighteen charms crossed the
JavaScript ↔ Swift bridge. All seven `webdangle://` routes were exercised and the app
handled every one without crashing.

### Honesty pass

No invented testimonials, download counts, press logos or case studies. The
social-proof section ships as a clearly-labelled empty state for the owner's own
content. The aura meter counts only the visitor's own session, locally. The checkout
buttons say they are not wired rather than faking a card form.

## 6. What is deliberately out of scope

- **Code signing and notarization.** Needs a paid Apple Developer account. `build.sh` produces a
  working unsigned app and documents the two commands to sign and notarize it.
- **Windows tray app.** Needs Win32/.NET and a Windows machine to compile and test on. The
  click-through recipe is documented in `README.md` but is deliberately not shipped untested.
- **Payments are wired but not live.** The pricing buttons point at placeholder Stripe links.
