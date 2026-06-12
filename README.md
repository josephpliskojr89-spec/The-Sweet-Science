# The Sweet Science

A boxing gym management simulation set in 1975 America. You open a gym, wait
for fighters to walk through the door, and try to build something real out of
whoever shows up.

**Fully procedural.** No historical fighters, no pre-authored prospects, no
fixed champions. Every save generates a unique boxing ecosystem. This is the
foundational commitment of the project — every system serves it.

> Built from the Game Bible v2.8. This repository is being implemented in the
> bible's 9-phase build order. The v2.8 architectural commitments — fighter
> public reputation and an event-driven trait bus — are in place ahead of the
> systems that use them.

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

**Phase 3 — Walk-In System.** The heartbeat.

- **Procedural fighter generation** off the name database: names that cohere
  with the city, coherent appearance, attributes + hidden/visible traits,
  physique, weight class (skewed by city archetype), a voiced written
  statement, and a gut-read First Impression. Concealable traits (Lionheart)
  stay hidden; a new gym mostly draws raw prospects, with room for surprises.
- **The walk-in card** — the reference clipboard: leather border, oxblood
  banner, framed portrait, name + nickname, vitals, typewritten statement,
  First Impression.
- **Notification** after advancing time → View Now / View Later; later cards
  queue in **My Office** (door badge shows the count). Walk-ins carry
  **patience** — ignore one too long and he finds another gym.
- **Frequency** follows a novelty curve: an opening-weeks bump (~1.2/wk) that
  tapers to a quiet baseline (~1 every 2.4 wks) for an unknown gym. A
  reputation term is wired in and zeroed until Phase 6, where it scales the
  rate back up as the gym earns a name.
- **The decision** — give a locker (respects the 20-locker cap), train without
  one, or turn him away. Accepted fighters join a roster the Locker Room shows
  a live count of.

**Phase 4 — Locker Room & Fighter Management.**

- **Fighter profiles** — portrait, vitals, attribute gauges, and the traits
  you've learned. Hidden traits stay hidden; the profile only hints there's
  more to a man than you've seen.
- **Locker allocation** — the 20-locker cap bites: give and pull lockers, and
  you can't exceed twenty without freeing one first. A separate **no-locker
  cap** (6) limits hangers-on, so you can't stockpile fighters in limbo just to
  scout their attributes.
- **Hierarchy** — Must Keep / Watch List / Chopping Block, set per fighter.
- **Departures** — fighters quit when neglected (no locker, on the block);
  genuine talent left lockerless may leave for a better opportunity; cutting a
  man plays out two ways — some vanish, some stay to earn it back. The
  post-advance notice reports who left and why.
- **Relationship (morale + trust)** — each fighter has a mood that recovers
  fast and a trust in you that breaks easily and heals slowly. Pulling a locker
  hurts; giving it back helps less; doing it repeatedly compounds and craters
  trust, which feeds quit risk — so a fighter can leave even with a locker if
  you've churned him. A one-off demotion is forgivable; yo-yoing is not.
  Surfaced as a one-word mood (Settled … On the brink), never a raw number.

Deferred to upcoming phases: the 3-exchange interview, training (Phase 5), the
rest of My Office (Phase 6), the Calendar (Phase 7), and the fight engine
(Phase 8).

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
    press_clippings.json  Press template database (used in Phase 9)
  game/            World data + rules (the procedural source of truth)
    regions.ts       4 regions + palettes that drive the gym backgrounds
    cities.ts        15 cities: region, archetype, descriptions (Vegas = destination)
    rooms.ts         The four rooms and what each will hold
    time.ts          The game clock (day-count since the 1975 epoch)
    appearance.ts    Skin/hair params that drive procedural portraits
    names.ts         Weighted name generation off names.json
    gymNames.ts      "Surprise me" gym-name composer
    weightClasses.ts The five launch divisions; class derived from weight
    traits.ts        The nine personality traits (with conceal bias)
    statements.ts    Voiced walk-in statements + First Impressions
    fighters.ts      Fighter generation — the procedural heart
    walkins.ts       Walk-in scheduling, patience, expiry
    roster.ts        Roster entries + the three hierarchy tiers
    relationship.ts  Per-fighter morale + trust; locker-decision fallout
    departures.ts    Quit / leave-for-opportunity / cut logic
    events.ts        Game event bus + trait-response stub (bible v2.8)
  state/
    GameContext.tsx  The shell state machine (screen, room, save)
    persistence.ts   Versioned localStorage save (one reader/writer)
  assets/
    backgrounds.tsx  Background REGISTRY — asset-replacement seam
    portraits.tsx    Portrait REGISTRY — asset-replacement seam
  components/        Button, TimeControls, RegionalGymBackground, Portrait,
                     WalkInCard, ArrivalNotice, Toast, AttributeBar, TraitChip
  screens/
    HomeScreen, SettingsScreen, GymScreen, WalkInViewer, FighterProfile
    newgame/         NewGameScreen + steps (gym, manager, city) + OpeningScene
  rooms/             RoomRouter, OfficeRoom (walk-in desk),
                     LockerRoom (roster + hierarchy), RoomPlaceholder
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
