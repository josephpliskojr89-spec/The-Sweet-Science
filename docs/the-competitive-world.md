# The Competitive World — Rival Gyms as Active Participants

*A design plan to fold into the Game Bible. Expands "Other Gyms" and the Rival
Gyms tab from a static intelligence view into a living ecosystem. Touches
Phase 6 (rival rosters, opponents, walk-in competition) and Phase 8 (results,
rankings). Voice/intent consistent with the bible's procedural-world commitment.*

---

## The shift

Today the only fighters that exist are yours and the walk-ins at your door.
gyms.json is a wall of names. That makes the world a backdrop.

The world should instead be **populated and active**: rival gyms have real
rosters they grow by signing fighters; some of the best fighters answer to no
gym at all; and all of them move whether or not you're watching — signing,
developing, fighting, rising, fading. The bible already asks for this ("the
world is alive whether you're paying attention to it or not"); this makes it
literal for the competition.

Three concrete commitments drive it:

1. **Rivals sign fighters.** Every rival gym has a roster that fills and turns
   over. The world generates talent; the gyms compete for it — including the
   man standing at your door.
2. **Rivals provide opponents.** When you book a fight, the other man comes from
   this population — a rival's stable, or an independent.
3. **Rivals are real competition for walk-ins.** Waffle on signing someone and a
   rival may take him. The cost of delay stops being "he found another gym" and
   becomes "Kensington signed the kid you sat on" — and you may meet him later,
   in their corner.

And one new (thin) category:

4. **A few fighters who answer to no gym.** Rare in 1975 — aging veterans past
   needing a gym's connections, isolated rural men with no access to one, and a
   handful of stars who deal straight with a promoter. Not a faction that rivals
   the gyms; a thin, characterful layer, a few of them genuinely good.

---

## The fighter population

Three affiliations share one world:

- **Player gym fighters** — full fidelity, as today.
- **Rival gym fighters** — each gym in gyms.json carries a roster sized and
  graded by its reputation tier (an established gym fields more and better men
  than a local one). They are the bulk of the local and regional scene.
- **Independents** — attached to no gym, and deliberately rare in 1975. Three
  kinds, and not many of each:
  - *Grizzled veterans* — old pros who no longer need a gym's connections; they
    train where they like and answer to themselves.
  - *Rural / isolated fighters* — men without access to a real gym, self-made,
    who occasionally walk out of nowhere with something real.
  - *A handful of promoter-managed stars* — a few elite names who deal directly
    with a promoter rather than a gym.
  Independents are a thin layer, not a category rivaling the gyms. The top of the
  sport is mostly gym-affiliated, with a few independent stars among them.

This population is the single source of truth for opponents, rankings, "fighters
of note" in the Rival Gyms tab, the press's other-gym items, and poaching.

---

## Fidelity by relevance (the scale solution)

A fully-simulated world of hundreds of full fighters across fifteen cities is too
expensive in compute and save size — and unnecessary. Fidelity scales with how
close a fighter is to the player:

- **Local (your city)** — higher fidelity. Real fighter objects (attributes,
  traits, age, development), because you will scout them, face them, and lose
  walk-ins to their gyms. This is the scene you live in.
- **Regional** — medium. Enough to matchmake and rank: a rating, record, age,
  style, gym. Detail is generated on demand when one becomes your opponent.
- **National / rankings** — light. Mostly names, records, divisions, and a
  ranking number — fleshed out only if and when they intersect your career.

A fighter is **promoted in fidelity when he becomes relevant** (you book him,
scout his city, he climbs into view). This keeps the world bounded while letting
any corner of it sharpen into focus the moment it matters.

---

## The rival threat — what the player feels

Two pressures from the gyms in your city, and you should feel both:

- **Competition for walk-ins.** Sit too long on a man at your door and a local
  rival signs him. The better the prospect, the faster they move. He enters their
  roster and can return as their contender, your opponent, or your regret.
  Indecision has a named winner.
- **Poaching your talent.** The sharp one. A genuinely talented fighter who is
  unhappy with you — low morale, broken trust — becomes a flight risk, and the
  rival gyms are the destination. *"There are other gyms in this town."* The
  chance scales with his talent (they want the good ones), his unhappiness (the
  relationship layer drives it), and how competitive your city is. It runs
  through the *"leaves for a better opportunity"* departure we already have — now
  with a named rival's door, and a reason that is on you.

**City competitiveness.** How real these threats feel scales with the local
scene, drawn from gyms.json: New York and Philadelphia are dense with strong
gyms and the pressure is constant; Memphis or Cincinnati have two or three and
it's quieter — present, but not breathing down your neck. The city you chose
shapes how hard you fight to keep what you build.

**Awareness — you should see it coming.** The threat must be legible, never a
random theft. A talented, unhappy fighter shows as a flight risk on his profile;
the gym log and press drop warnings (*"a trainer from a rival gym was seen
talking to your kid after hours"*); the mood read already tells you he's
unsettled. Losing him should feel like a consequence you could have prevented —
not a dice roll.

## The world moves on its own

Beneath the threats, the scene lives: rivals sign and cut, fighters age and
develop on a light model, they fight each other and build records, gyms rise and
fade with results. The player feels this through the press and the Rival Gyms
tab — the world reports itself. The full dynamism (results → rankings →
reputation) matures with the Phase 8 fight engine; before then it is lightly
approximated.

---

## What it feeds

- **Opponents (Phase 6 booking).** Matchmaking pulls from rivals + independents
  filtered by division, level, location, and ranking — each with name, record,
  gym (or "Independent"), style, and ranking if applicable.
- **The Rival Gyms tab (Phase 6).** Sortable Local / Regional / National, each
  gym showing its real fighters of note (champions, ranked contenders) with
  weight class and record — drawn live from the population, not static text.
- **Rankings (Phase 8).** The official top 15 per division is computed across the
  whole population — your fighters, rival fighters, and the thin independent
  layer together. The elite is mostly gym-affiliated, with a few independent
  stars among them.
- **Poaching (later).** Rivals with money and momentum come for your developed
  fighters and coaches — the population gives that pressure a source.
- **The press.** other_gym_results, prospect, rumor, and rankings clippings now
  describe real fighters and real movement.

---

## Phase 6 structure

Phase 6 is large; it breaks into sub-phases. The competitive world is the big
one and stands on its own.

- **6A — Gym Upgrades** (My Gym · Facilities). Spend money on more lockers,
  equipment, capacity. Small, self-contained, rides the economy.
- **6B — Coaches** (My Gym). Procedural coaches: hiring, salaries (into the
  books), expanded focused-training capacity and assignment, chemistry.
- **6C — The Competitive World** (the big sub-phase). The fighter population
  (rival rosters + the thin independent layer), city competitiveness, walk-in
  competition, the poaching threat and its awareness surfacing, and the Rival
  Gyms tab reading it all live.
- **6D — Fight Booking** (My Office). Opponent provision from the population;
  matchmaking and scheduling. Fights resolve once the Phase 8 engine lands.

6A and 6B are gym-internal and independent; 6C is the substrate for 6D. The full
result → ranking → reputation dynamism completes in Phase 8.

---

## Tuning (starting points)

- **Independents** — a thin layer: single digits in a city's orbit, a few of
  them genuinely good. Skewed to veterans, rural men, and the rare promoter star.
- **Rival roster sizes** scale with reputation tier; local scene density comes
  from the per-city gym count in gyms.json.
- **Poaching pressure** = fighter talent × unhappiness × city competitiveness —
  gated so it only threatens genuinely good, genuinely unsettled men, and always
  with a warning first.
