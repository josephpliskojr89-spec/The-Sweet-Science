# The Sweet Science

A boxing gym management simulation set in 1975 America. You open a gym, wait
for fighters to walk through the door, and try to build something real out of
whoever shows up.

**Fully procedural.** No historical fighters, no pre-authored prospects, no
fixed champions. Every save generates a unique boxing ecosystem. This is the
foundational commitment of the project — every system serves it.

> Built from the Game Bible v2.7. This repository is being implemented in the
> bible's 8-phase build order.

---

## Status — Phase 1: Shell & Navigation ✅

The home screen and main navigation shell. **No gameplay systems yet** — those
arrive in later phases and are intentionally not built.

What's here:

- **Home screen** — title placeholder, Continue / New Game / Settings.
- **Settings** — styled stub (difficulty + volume land later).
- **Main game screen** — a procedural regional gym background with four spatial
  room panels (My Office, Calendar, My Gym, Locker Room), each opening to a
  labeled placeholder describing what will live there.
- **Time advancement** — Advance Day / Advance Week move the 1975 game clock.
- **Save/Continue** — a minimal localStorage save so Continue is real.

Two pieces are temporary Phase-1 scaffolding, clearly marked in the UI, and get
replaced in Phase 2 by the real New Game flow (gym naming, manager creation,
city selection, opening scene):

- The **region picker** on New Game.
- The **`[dev] region`** switcher in the gym's top bar.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check + production build
npm run preview    # serve the production build
npm run typecheck  # types only
```

> Vintage type (Big Shoulders, Oswald, Special Elite, Roboto Slab) loads from
> Google Fonts. If your network blocks it, the UI falls back to system fonts
> gracefully — but the intended look needs the web fonts.

---

## Architecture

Stack: **React + TypeScript + Vite**.

```
src/
  game/            World data + rules (the procedural source of truth)
    regions.ts       4 regions + palettes that drive the gym backgrounds
    cities.ts        15 cities: region, archetype, descriptions (Vegas = destination)
    rooms.ts         The four rooms and what each will hold
    time.ts          The game clock (day-count since the 1975 epoch)
  state/
    GameContext.tsx  The shell state machine (screen, room, save)
    persistence.ts   Versioned localStorage save (one reader/writer)
  assets/
    backgrounds.tsx  Background REGISTRY — the asset-replacement seam
  components/        Button, TimeControls, RegionalGymBackground, glyphs
  screens/           HomeScreen, SettingsScreen, GymScreen
  rooms/             RoomPlaceholder (the interior a room opens into)
  styles/            theme.css (design tokens) + global.css
```

### Two architectural commitments from the bible

**1. Procedural-first.** `game/` holds the world as data. Phase 1 doesn't
generate fighters yet, but the databases (names, gyms) and generators slot into
this layer without disturbing the UI.

**2. Asset replacement without rebuilds.** Visual placeholders are
parameter-driven (CSS/SVG). The clearest example is `assets/backgrounds.tsx`:
the whole app asks the registry for a region's gym background and never knows
whether it gets a procedural SVG or a commissioned painting. Drop a file in
`/public`, point the region's entry at it — nothing else changes. The same
pattern will host the title art and the procedural fighter portraits.

### Visual direction

Dark, worn, amber and brown — a gym that's been there since the fifties. All
colors live as tokens in `src/styles/theme.css`; the walk-in card reference is
the aesthetic target.
```
