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

And one new category:

4. **Top fighters who fight out of no gym.** The apex of the sport isn't owned by
   gyms. Independents — free agents, managed men, stars who transcend a single
   room — populate the upper ranks, and the best of them are gym-less.

---

## The fighter population

Three affiliations share one world:

- **Player gym fighters** — full fidelity, as today.
- **Rival gym fighters** — each gym in gyms.json carries a roster sized and
  graded by its reputation tier (an established gym fields more and better men
  than a local one). They are the bulk of the local and regional scene.
- **Independents** — attached to no gym. Two flavors:
  - *Journeymen / free agents* — the trial-horse pool, available opponents who
    make prospects look good or foolish.
  - *Top independents* — elite contenders and champions who answer to no gym.
    The summit of the rankings skews here. The path to a title runs partly
    through men no gym owns.

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

## Active behaviors (the world moves)

Each runs on time advancement, cheaply, mostly abstracted:

- **Signing & turnover.** Rival gyms periodically sign fighters from the world's
  generated talent and cut or lose others, sized to their reputation. Rosters
  breathe.
- **Stealing your walk-ins.** When a walk-in's patience runs out, he doesn't just
  vanish — a local rival may sign him (the better the prospect, the likelier a
  rival pounces). He enters that gym's roster and can resurface later as a fighter
  of note, an opponent, or a regret. *This is the headline mechanic: indecision
  has a named winner.*
- **Developing & aging.** Rival and independent fighters age and develop on a
  light model (a rating drifting with age and results), so the scene isn't
  frozen — last year's prospect is this year's contender, or this year's
  cautionary tale.
- **Fighting & records.** The world's fighters fight each other (abstractly
  simulated when the Phase 8 engine exists; lightly approximated before then),
  building records and feeding rankings and the press's other-gym clippings.
- **Reputation drift.** A gym whose fighter wins a regional title rises; a gym
  bleeding talent fades. The pecking order you entered is not the one you'll
  leave.

The player feels all of this primarily through the **press** (the world section
we already built) and the **Rival Gyms tab** — the world reports itself.

---

## What it feeds

- **Opponents (Phase 6 booking).** Matchmaking pulls from rivals + independents
  filtered by division, level, location, and ranking — each with name, record,
  gym (or "Independent"), style, and ranking if applicable.
- **The Rival Gyms tab (Phase 6).** Sortable Local / Regional / National, each
  gym showing its real fighters of note (champions, ranked contenders) with
  weight class and record — drawn live from the population, not static text.
- **Rankings (Phase 8).** The official top 15 per division is computed across the
  whole population — your fighters, rival fighters, and independents together.
  Independents hold much of the summit.
- **Poaching (later).** Rivals with money and momentum come for your developed
  fighters and coaches — the population gives that pressure a source.
- **The press.** other_gym_results, prospect, rumor, and rankings clippings now
  describe real fighters and real movement.

---

## Sequencing

This is the substrate for the rest of Phase 6's competitive systems, so it slots
in before them:

1. *(Gym-internal, independent of this — can go first)* Gym upgrades, coaches.
2. **The world population** — generate rival rosters + independents at world
   creation, sized by reputation; the fidelity-by-relevance model.
3. **Walk-in competition** — reroute walk-in expiry into rival signings; the
   "Kensington signed your kid" mechanic.
4. **Rival Gyms tab** — reads the live population (fighters of note).
5. **Fight booking + opponent provision** — matchmaking against the population.
6. *(Phase 8)* Rivals fight, records and rankings move, reputation drifts —
   becomes fully dynamic once the fight engine can generate believable results.

So Phase 6 builds the population, the competition for walk-ins, the rival tab,
and opponent provision; the full dynamism (results → rankings → reputation)
matures with the Phase 8 engine.

---

## Open questions (for tuning / direction)

- **How dominant are independents at the top?** Is the world champion usually a
  gym-less independent, or a mix of gym stars and independents? (Affects how the
  title path reads.)
- **Roster sizes by tier** — how many fighters does a local vs established gym
  field? (Tunable; affects scene density and save size.)
- **How aggressively do rivals poach your walk-ins?** Always a risk past
  patience, or only for promising prospects, or scaled by your reputation vs
  theirs? (The bible: gym reputation relative to rivals determines who gets the
  best prospects.)
