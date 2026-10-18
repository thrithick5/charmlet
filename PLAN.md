# Lucky Dangle — a free, personal, local desktop charm

## The brief

A personal, free, local-only version of the Book My Luck app: the same 20-charm lineup,
the same rituals, the same rope physics, the same click-through behaviour, the same
menu-bar controls — running entirely on this laptop. No payments, no licence server, no
accounts, no App Store, no internet.

## The one boundary (stated once)

The **functionality** is cloned exactly. The **assets are not**. Book My Luck's charm
images are its copyrighted assets, and its charm descriptions are themselves copied
verbatim from Lucky Dangle (verified in the previous session: nine plaques word-for-word
identical). Reproducing either would be copying someone else's copyrighted work, so:

- Every charm is drawn **from scratch as original SVG** — same charm, same ritual,
  different pixels.
- Every plaque is **written fresh** — same meaning, same twelve-word limit, no copied
  sentences.
- Ritual *labels* ("Ring the bell", "Repaint the guardian") are kept as-is: they are
  short functional affordances, not creative text.

Everything else — charm lineup, order, rituals, physics, interactions, menu controls,
emoji charm, click-through, "send behind windows" — matches Book My Luck.

## Charm lineup (identical to Book My Luck, in their order)

| # | Charm | Origin | Ritual |
|---|---|---|---|
| 1 | Nazar boncuğu | Türkiye & the Mediterranean | Give it a flick |
| 2 | Murugar | Tamil Nadu, South India | Raise the vel |
| 3 | Karuppu | Tamil Nadu, South India | Give it a gentle sway |
| 4 | Nimbu-mirchi | India | Hang a fresh garland |
| 5 | Drishti bommai | South India | Repaint the guardian |
| 6 | Om | India | Let it glow |
| 7 | Ghanta | India | Ring the bell |
| 8 | Peacock | India | Fan the feathers |
| 9 | Elephant | India & Southeast Asia | Give it a flick |
| 10 | Hamsa | Middle East & North Africa | Give it a flick |
| 11 | Páncháng jié | China | Tie in good fortune |
| 12 | Horseshoe | Europe & the Americas | Give it a flick |
| 13 | Four-leaf clover | Ireland | Give it a flick |
| 14 | Maneki-neko | Japan | Beckon good fortune |
| 15 | Daruma | Japan | Make a wish |
| 16 | Scarab | Ancient Egypt | Catch the light |
| 17 | Ladybug | Europe | Give it a flick |
| 18 | Dreamcatcher | Ojibwe, North America | Give it a flick |
| 19 | Lucky bamboo | China | Give it a flick |
| 20 | Himmeli | Finland | Set it turning |

Plus the **any-emoji** charm, exactly like Book My Luck's "hang your favourite emoji".

Ten charms carry over from the previous build (original art, verified): nazar, drishti,
ghanta, hamsa, panchang, horseshoe, maneki, daruma, scarab, himmeli. Ten are new original
drawings: murugar, karuppu, nimbu-mirchi, om, peacock, elephant, clover, ladybug,
dreamcatcher, bamboo.

## Architecture — reused, not rewritten

The previous build's engine is already tested (100+ checks) and already does everything
this app needs: Verlet rope, idle wind, cursor-lean, grab, flick, rituals, pass-through
click handling, hotkeys, URL scheme. So this build **reuses it wholesale** and only swaps
what changes:

```
Lucky Dangle/
├── PLAN.md                  this document
├── README.md
├── web/                     site + engine (BML lineup, free, no payments)
│   ├── index.html           rewritten — BML-style sections, no pricing
│   ├── charm.html           unchanged — the app's transparent surface
│   ├── charm.css            unchanged
│   ├── styles.css           edited — removed aura/konami chrome
│   └── js/
│       ├── verlet.js        unchanged
│       ├── dangle.js        unchanged
│       ├── charms.js        REWRITTEN — the 20 charms
│       ├── sound.js         unchanged
│       ├── aura.js          dropped
│       └── app.js           REWRITTEN — flat gallery, emoji charm, no payments
├── macos/                   renamed to LuckyDangle, scheme luckydangle://
└── webdangle-v1/            the previous build, archived intact
```

## Build order

1. Archive v1, scaffold the new tree.
2. `charms.js` — 20 charms: 10 carried over with reworded plaques, 10 new original SVGs.
3. `index.html` — "A little luck. Always close." hero with live rope, desktop features,
   the gallery, "Make it yours", install instructions, honest FAQ. No pricing anywhere.
4. `app.js` — flat gallery in BML order, emoji charm, rituals. Aura/konami/filters/photos
   removed to match BML's feature set.
5. Swift — rename to LuckyDangle, `luckydangle://` scheme, 20-charm menu.
6. Test suites, build, launch, URL routes, screenshots.

## Verification

- `scripts/test-physics.mjs` — the rope (7 checks).
- `scripts/test-charms.mjs` — all 20 charms: XML-valid SVG, top-edge cord, ritual parts
  exist, namespaced ids, ≤12-word plaques, label/method collision, rituals run, sounds
  exist.
- `LuckyDangle --snapshot` — real renders of the site, gallery, and individual charms.
- `--probe` — live rope/tilt numbers.
- App launch log must read `charm catalogue loaded from the engine: 20 charms`, and all
  `luckydangle://` routes must be handled.

## Deliberately out of scope

- Windows build (this laptop is a Mac; the personal build targets it alone).
- Code signing / notarization / App Store (personal, local use).
- Payments, licences, activation, gift packs, affiliate, admin panel — removed by design.
- Any network calls: the app and site work fully offline.
