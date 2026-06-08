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

## Status — Phases 1–2 complete ✅

**Phase 1 — Shell & Navigation.** Home screen, Settings stub, and the main game
screen: a procedural regional gym background with four spatial room panels (My
Office, Calendar, My Gym, Locker Room) that open full-screen to labeled
placeholders, plus day/week time advancement and a real Continue save.

**Phase 2 — New Game Flow.**

- **Name your gym** — with a "Surprise me" composer.
- **Create your manager** — name + skin tone / hair color / hair style, with a
  live procedural portrait (layered base / skin / hair). Age fixed at 25.
  "Surprise me" draws from the real name database; "Randomize look" rolls the
  appearance.
- **Choose your city** — all 15 cities with full descriptions and style lines.
  Las Vegas is present but non-selectable, framed as a destination.
- **Opening scene** — deliberately unhurried. Black; the year and city surface
  and hold in silence; the gym fades in beneath; the city's own words settle;
  then a quiet "Step inside." Respects `prefers-reduced-motion`.

**No gameplay systems yet** (walk-ins, fighters, training, finances, fights) —
those arrive in Phases 3+ and are intentionally not built.

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
  data/            Provided databases (version-controlled assets)
    names.json       Fighter/coach name generation database
    gyms.json        Competing-gym database (used in Phase 6)
  game/            World data + rules (the procedural source of truth)
    regions.ts       4 regions + palettes that drive the gym backgrounds
    cities.ts        15 cities: region, archetype, descriptions (Vegas = destination)
    rooms.ts         The four rooms and what each will hold
    time.ts          The game clock (day-count since the 1975 epoch)
    appearance.ts    Skin/hair params that drive procedural portraits
    names.ts         Weighted name generation off names.json
    gymNames.ts      "Surprise me" gym-name composer
  state/
    GameContext.tsx  The shell state machine (screen, room, save)
    persistence.ts   Versioned localStorage save (one reader/writer)
  assets/
    backgrounds.tsx  Background REGISTRY — asset-replacement seam
    portraits.tsx    Portrait REGISTRY — asset-replacement seam
  components/        Button, TimeControls, RegionalGymBackground, Portrait, glyphs
  screens/
    HomeScreen, SettingsScreen, GymScreen
    newgame/         NewGameScreen + steps (gym, manager, city) + OpeningScene
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
