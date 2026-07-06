# THE RIVALRY BOOK

*Design consultation and implementation spec — how rivalries emerge from the simulation
without being scripted, including rivalries between two world fighters the player never
touches. Companion to the LIVING WORLD BIBLE.*

*Panel: a boxing historian and a simulation-systems designer, consulted independently
against the game's actual systems (world sim, fight engine, era triggers, the mail,
per-day seeded tick). Their full texts are preserved below, followed by the synthesis
that serves as the build spec.*

---

## THE QUESTION

What made the classic rivalries — Ali–Frazier, the Four Kings, Zale–Graziano,
Gatti–Ward, Pep–Saddler — feel like the most important things in the sport, and how
does this game create something like the Four Kings **naturally, without scripting it**?
Can those rivalries occur between AI fighters, even when the player isn't involved?

**The prerequisite fact:** as of this writing, world-vs-world bouts are *phantom* — a
fighter rolls a win or loss against nobody (`worldSim.ts`, `resolveOneFight`). The world
has no memory of who fought whom, so no rivalry can exist in it. Everything below
depends on replacing that phantom roll with cheap **real pairings**.

---

## SEAT ONE — THE BOXING HISTORIAN

### THE INGREDIENTS — SEVEN SEEDS A SIM CAN CHECK

1. **Succession dispute** (Ali–Frazier). Condition: a title vacated/stripped while its
holder is still active and unbeaten, AND a new claimant wins the vacant belt undefeated.
Two men, both with a legitimate claim, both 0 losses, #1 and #2 in the ratings for 12+
months without meeting. This is the hottest seed in the sport's history — Ali–Frazier I
did $2.5M per man in 1971 when a big purse was $500K. Escalated because the first result
(Frazier UD) was close and both stayed elite. Fizzles if either man loses to a third
party first.

2. **Disputed verdict** (Hagler–Leonard '87, Leonard–Hearns II). Condition:
split/majority decision or draw, small scorecard margin, in a bout with title or #1
stakes, where your engine can flag "press disagreed with the cards." The loser publicly
refuses the result. This is your single most mechanizable seed because your engine
already produces it. Escalates if the rematch is signed within 18 months; fizzles if the
winner ducks and the gap exceeds ~3 years (Hagler never got his rematch — that grievance
itself generated a decade of copy, which is also usable).

3. **Co-rising cohort** (Four Kings). Condition: 3–4 fighters rated 90+ (or top-3),
within two adjacent divisions, within ~5 years of age, emerging within ~3 years of each
other. Economics forces the round-robin: each pairing is the biggest available purse.
The Kings fought 9 times across 9 years (1980–89) — roughly one super-fight per year,
not a flood. Detect the cohort, then have the world's matchmaking prioritize
intra-cohort pairings at ~1/year/division. Escalates via crossed results (Durán beats
Leonard, Hearns beats Durán, Leonard beats Hearns-ish) — non-transitive outcomes are
gold. Fizzles if one man cleans out the others early.

4. **The war itself** (Zale–Graziano, Gatti–Ward). Condition: a violence score —
knockdowns scored by BOTH men, momentum reversals, late stoppage, both men hurt.
Zale–Graziano traded KO6/KO6/KO3 inside 21 months; Gatti–Ward went 3 fights in 13 months
with neither in the top 10. Key insight: this seed does not require greatness or stakes.
Two 8th-ranked sluggers can become the magazine's obsession purely on carnage. Escalates
automatically (the rematch demand is the violence); ends when a fight is one-sided.

5. **Stylistic antithesis turned bitter** (Pep–Saddler). Condition: opposed style tags
(pure boxer vs. mauler/puncher) plus a series reaching 3+ fights. Their four fights
(1948–51) degenerated into fouling, wrestling, a quit-on-stool, and license suspensions.
Mechanic: a "bitterness" value that accretes per fight — fouls, quits, injuries,
post-fight accusations feed it. Antithesis alone is a multiplier, never sufficient by
itself.

6. **Personal grievance** (Ali's taunts, Durán insulting Leonard's wife). Condition: a
trash-talk/insult event generated pre-fight, weighted by persona traits — you need a
talker archetype and a proud-stoic archetype. Critical: it's almost always asymmetric.
One man talks, the other seethes. Frazier's hatred outlived Ali's theater by 30 years —
grievance should persist after the rivalry ends and color retirement/legacy copy.

7. **Shame and redemption** (No Más, and every shocking KO upset). Condition: a heavy
favorite loses shockingly, or quits. The disgraced man's comeback arc points at one
name. Durán's 1980 quit took 9 years and a career rebuild to partially expiate. This
seed produces long-gap rematches, not immediate ones.

An eighth, local-scale seed: the **city derby** — two fighters from the same town
climbing the same ratings. Cheap to detect, great for the player's local paper.

### THE ARC

Canonical lifecycle: (1) Buildup 6–24 months — both men beat common opponents, press
runs comparison pieces, callouts printed. (2) Fight I at real stakes. (3) The verdict:
close/disputed/shocking → rematch demand; decisive-but-violent → rematch demand anyway;
decisive and dull → rivalry dies. (4) Rematch gap: 5–14 months was normal 1975–90 (No
Más was 5 months; Zale–Graziano II was 10; rematch clauses were standard). (5) The gap
years: series often pause 2–3 years while both men take other fights (Ali–Frazier I→II
was 34 months; II→III was 20). (6) Rubber match, frequently past both primes, elegiac.
(7) Shared legacy — neither name mentioned without the other, forever.

Frequency reality: 1975–90 champions defended 2–3 times/year, contenders fought 4–7
times/year, and top-10 men genuinely fought each other — the mandatory system forced #1
contenders onto champions roughly annually. Your world fighters should fight 3–6
times/year with real named opponents, and a champion should meet a top-5 man at least
once a year or get stripped (which triggers Seed 1 — stripping is a rivalry generator,
historically: Ali–Frazier exists because of a stripping).

Purse escalation: rematch 2–3x fight I; rubber match of a great series 3–5x; a cohort
super-fight 10x a routine defense (Hagler–Leonard: $23M combined vs. ~$1–2M for a normal
Hagler defense).

### THE AMPLIFIER — WHAT THE PRESS DOES

The press names things: the feud ("the Bitterest Feud in Boxing"), the fight (rhyme +
location — your headline generator should compose from fighter nickname/city/
superlative), the fight-within-the-fight (Hagler–Hearns round 1 got its own name).
Stage-by-stage copy: buildup = printed callouts and duck accusations ("X says Y is
hiding behind his manager"); signing = prediction columns with split expert picks; fight
week = training-camp dispatches, weigh-in incidents; aftermath = scorecard controversy,
letters page arguing for months; gap years = anniversary retrospectives ("One year ago
tonight...") and ratings-page footnotes ("#1 and #2 have not met — why?"). The letters
page is your cheapest heat engine: partisan readers keep a disputed verdict alive for a
year.

### WORLD-ONLY RIVALRIES

Neutral fans cared about Hagler–Hearns because the stakes were legible (two feared
champions), the styles guaranteed violence, and the press had spent three years asking
when. For the player to care about two AI men: (a) both names must recur — top-3 of the
same ratings page for 6+ consecutive monthly issues; (b) 4–6 discrete headlines across
the arc (callout, signing, prediction, result with round-by-round detail, controversy,
rematch demand); (c) gym talk — a sparring partner "was in camp with him, says his legs
are gone"; (d) consequence for the player: the winner is the throne the player's
contender must eventually take, the purse market in that division moves, and the winner
may call out the player's fighter — the offscreen feud is forging the final boss.
Requirement for pairing logic: real persistent head-to-head results with round/method/
scorecard detail, non-transitive outcomes allowed, rematch-clause probability ~60% after
close title fights, and reconcilable records.

### TRAPS

- Five fights in two years at top level never happened. Four is the historical ceiling
  (Pep–Saddler over 3 years); trilogies span 2–5 years. Cap series at 4, minimum 5
  months between meetings.
- Heat without stakes: unranked feuds get no ink unless the violence seed fired
  (Gatti–Ward is the licensed exception — frame it as the magazine's cult obsession,
  "Fight of the Year," not a title story).
- Feud inflation: at most ONE named live rivalry per division. Most title fights are
  just fights.
- Symmetric trash talk reads scripted — cast one talker, one stoic.
- A 2–0 sweep with decisive results ends the rivalry; don't force rubber matches without
  a disputed result or a war.
- Instant hatred is false — bitterness accretes across meetings (Pep–Saddler began
  respectful).
- Age mismatch >6 years isn't a rivalry, it's a passing-of-the-torch fight — one
  meeting, different (valuable) story pattern.
- Cross-division feuds require an actual weight move first.

---

## SEAT TWO — THE SIMULATION-SYSTEMS DESIGNER

### 1. ARCHITECTURE

Don't store a world bout log. Store **pair histories** — created lazily the first time
two men actually meet, keyed by sorted ids: `pairKey = [idA, idB].sort().join('|')`.

```ts
interface PairHistory {
  ids: [string, string];        // sorted
  wc: WeightClassKey;
  meetings: Meeting[];          // capped at 6; older ones collapse into tallies
  tally: [number, number, number]; // aWins, bWins, draws (full series)
  heat: number;                 // 0..100, hidden fuel
  stage: 0|1|2|3|4;             // acquainted, simmering, NAMED, legendary, settled
  name: string | null;          // press-coined, e.g. "Reyes–Cole"
  ducked?: 0|1;                 // which side declined a rematch, if any
  lastMeetingDay: number;
}
interface Meeting { day: number; winner: 0|1|2; method: 'KO'|'TKO'|'UD'|'SD'|'MD'|'D';
  disputed: boolean; stakes: 0|1|2 } // 0 none, 1 top-5, 2 for #1
```

**Heat vs. stages: both, with a strict division of labor.** Heat is engine fuel —
hidden, decaying, never narrated. Stage is the public state machine, and *only stage
transitions produce ink*. This is the fog rule applied to the system itself: the number
exists, the player only ever reads prose.

**Bounds.** A meeting serializes to ~30 bytes; a pair ~150 bytes. Cap the ledger at
**64 pairs** via pruning: stage-0 pairs where either man retired are dropped; stage ≥2
pairs whose men both retired collapse into an **annals list** — an array of ≤12 prose
strings ("Reyes–Cole, 1978–83, 2–1 Reyes, settled at the Garden") that costs ~1KB and
feeds anniversary pieces forever. Worst case ~10KB against the 64KB budget. Global
live-rivalry caps below make the realistic ledger far smaller.

One housekeeping note: `worldSim.ts` uses `Math.random` while the era/mail layers are
seeded. Move the pairing engine to the seeded rng — determinism is needed to tune rarity
by simulation (see §3), and it fixes an existing inconsistency.

### 2. THE PAIRING ENGINE

Replace `resolveOneFight` with a per-advance pass that keeps the cheap cadence roll but
resolves against a **real opponent**:

1. **Cadence**: each fighter rolls to fight, rate scaled by tier — journeymen `days/50`
   (~7/yr), contenders `days/75` (~5/yr), ranked elite `days/120` (~3/yr). The current
   flat `days/45` gives elites 8 fights a year; 1975–90 champions fought 2–3 times. This
   one constant does more for realism than anything else.
2. **Pool**: candidates = same weightClass, `|ratingDiff| ≤ 12`, not already fought this
   advance. If empty, fall back to today's phantom roll flavored as "unlisted
   opposition" — journeymen padding records against nobodies is period-accurate and
   keeps the engine total.
3. **Weighted pick** (this is where rivalries are born):
   - base weight 1
   - ×3 if both ranked and `|rankDiff| ≤ 3` (**ranked adjacency** — concentrates elite
     bouts in a small cohort)
   - ×6 **rematch gravity** if a PairHistory exists and the series is *unsettled* (1–1,
     or last meeting disputed), decaying to ×1 over 18 months
   - ×0.3 if they share a camp (stablemates don't fight)
4. **Resolve**: logistic on rating gap for winner; method sampled from the gap — close
   ratings (≤4) give 30% SD/MD, 10% draw. **SD/MD/D = `disputed: true`.** That's the
   whole trick: "disputed verdict" becomes a first-class world fact without running the
   round engine. Update records, Elo-ish rating nudge (±0.8/1.2), publicReputation, and
   — when rankings are real — swap ranks when #2 beats #1. That last line *is* "title
   changes between named men."

Cost: one filtered scan per fighting man per advance, O(n) with n≈140. Nothing here
threatens the tick.

Rematches, trilogies, and round-robins are not features; they are what ×6 rematch
gravity plus ranked adjacency **statistically produce**. A disputed SD between co-ranked
men makes the rematch the single most likely next booking for both; a 1–1 series keeps
gravity alive for the rubber match; ranked adjacency means the top five of a division
keep drawing each other.

### 3. EMERGENCE RECIPE

**Heat table** (applied per meeting, by the same consequence path for world and player
bouts):

| Event | Heat |
|---|---|
| any meeting | +10 |
| disputed verdict (SD/MD/D) | +15 |
| KO avenged (B stops A after A stopped B) | +20 |
| series reaches 1–1 or 2–2 | +10 |
| both top-5 at meeting time | +10 |
| for the #1 spot / title | +10 |
| style contrast (brawler↔slick, pressure↔counterpuncher table) | +5 |

Decay: −1/month idle; −50% on either retirement. **Stages**: heat ≥25 and 2 meetings →
simmering. **Naming** requires heat ≥45 AND (disputed result in series OR series tied)
AND both publicReputation ≥50 — *and* passes the global gate: **max 1 named rivalry per
division, 3 world-wide**, and naming fires through the era evaluator's existing pacing
budget (it's a trigger, subject to `TRIGGER_QUIET_DAYS` and a `oncePer` cooldown of ~2
years save-wide). Legendary: 3+ meetings, series within one win, and a title change or
6+ year span.

**Settlement is the anti-inflation valve**: a meeting won *decisively* (UD wide or KO,
not disputed) when the winner already leads the series → stage 4, heat halved, press
writes the epitaph ("closed the argument"). Settled pairs can't re-name for 3 years.
Without this, 25-year saves accrete heat everywhere; with it, the ledger self-cleans.

**The Four Kings pattern** needs no cohort mechanic — it needs 3–4 men co-ranked *for
years*. The local rules (adjacency + gravity) already cross them; the binding constraint
in the current code is `developmentDrift`'s −0.5/month after 32, which kills cohorts
before six crossing bouts accumulate. Soften decline for rating ≥85 (great ones age
slower) and the cohort window opens. Then add a pure **detector**, not a generator:
rolling 8-year window per division; if ≥3 named-or-simmering pairs share members with ≥6
total crossing meetings → "golden age" era event, `oncePer: 'save'`, a national-magazine
feature. Tuning target: with 3 fights/yr elite cadence, ×6 gravity, ×3 adjacency, expect
a 3-man triangle per division per ~15 years and the full 4-man web roughly once per
25-year save. Verify by headless sim over 500 seeded 25-year runs (this is why the rng
must be seeded) and expose exactly three constants: gravity multiplier, adjacency
multiplier, elite decline rate.

### 4. SPOTLIGHTING

The curation layer is a **rivalry desk**: a tick stage after world bouts that detects
stage transitions. Transitions are the *only* rivalry ink sources — that single rule
prevents spam.

- **Naming**: 1975 press named feuds by surname pair — canonical form "Reyes–Cole,"
  roman numerals per meeting ("REYES–COLE III"). Colorful epithets ("the Merchant
  Wars") only at legendary, drawn from a template pool seeded like `COINED_NICKNAMES`.
  The press coins it; the game never says "rivalry."
- **Privileges once named**: (a) results of the pair's meetings are *exempt from press
  cooldowns* — they always print, even in a quiet week; (b) a one-line note beside each
  man on the monthly ratings page ("owes Cole a third meeting"); (c) an anniversary
  piece trigger, `oncePer` pair, ~1 year after a legendary bout, drawing on the annals;
  (d) a `pursePremium` flag consumed by the offer generator.
- Channels by fidelity: local pairs → local paper clippings; ranked pairs → the national
  magazine; mail only when the player's man is a party. Never a toast.

### 5. PLAYER-SIDE INTEGRATION

Player bouts already emit real SD/MD verdicts and knockdowns — route them through the
*same* heat table from the consequence-applier in `fights.ts`, keying PairHistory on
`wf_`-prefixed ids so the structure is unified. Player rivalries will out-earn world
ones naturally because the round engine produces disputed cards and avenged KOs
organically.

New mail kinds: **the callout** (after a disputed result, the rival camp writes: accept
rematch at ×1.5–2 grudge purse; decline publicly; ignore) and **the challenge relayed**
(a named world rival's promoter offers the date). **Declining must cost**: set `ducked`
on the pair — for ~1 year the press mentions it whenever either man gets ink, small
publicReputation tax, and future rankings should discount duckers. Narrative and market
consequences, never stat damage.

**Build order: pairing engine → computed rankings → heat/stages → spotlight.** Rivalries
*with* the ladder, not before it — half the heat table ("both top-5," "for the #1 spot")
is stakes, and stakes are fake until rankings derive from real results. The pairing
engine is the prerequisite for both, so it pays for itself twice.

### 6. FAILURE MODES FROM SHIPPED GAMES

- **TEW / WWE 2K "rivalry meter"**: a visible bar the player pumps — a mechanic wearing
  a story's clothes. *Guard*: heat is hidden per the fog rules; the player only ever
  reads prose and the record book.
- **Football Manager media**: "There's no love lost between these two sides" fired
  identically every derby — repetition converted meaning to noise. *Guard*: ink only at
  stage transitions; templates must interpolate specific facts (the disputed card's
  scores, the avenged KO, the date) so no line can generically repeat.
- **Fight Night Champion / career-mode scripted rivals**: one authored nemesis per
  career; second playthrough kills it. *Guard*: zero authored pairs — everything from
  the heat table.
- **UFC/Madden "storylines" with no memory**: the game forgets the feud after the
  rematch sells. *Guard*: PairHistory persists, anniversaries fire, annals outlive
  retirement.
- **Crusader Kings rivals**: everyone has one, assigned by trait dice, so rivalry is
  wallpaper. *Guard*: global cap of 3 named world-wide; naming requires *witnessed
  events* (real bouts, real verdicts), never personality rolls.
- **Heat inflation (NBA 2K dynamic-anything)**: every save ends at maximum drama.
  *Guard*: settlement rule, monthly decay, retirement halving, once-per-save golden-age
  cap.

The through-line: the system's job is to make rivalries *rare enough to be believed*.
Ali–Frazier mattered because there was one of it. Cap hard, decay always, and let the
press — not the UI — do the noticing.

---

## SYNTHESIS — THE IMPLEMENTATION SPEC

Where the two seats converge, this is the spec; where they differ, the resolution is
noted.

### The answer to the founding question

Yes — a Four Kings can emerge naturally, between AI fighters, from local rules. The
mechanism is three-layered:

1. **Real pairings** give the world memory (the prerequisite — today's bouts are
   phantom).
2. **Two weights** — ranked adjacency (×3) and rematch gravity (×6 while a series is
   unsettled) — make rematches, trilogies, and cohort round-robins the *statistical
   consequence* of matchmaking, not a feature.
3. **A detector, not a generator** — the game notices when a division's top men have
   been crossing for years and lets the magazine write the golden-age feature, once per
   save.

The binding constraint neither seat expected: **aging**. World fighters currently
decline hard after 32, which disperses cohorts before six crossing bouts can accumulate.
Great fighters (rating ≥85) must age slower for the Four Kings window to exist.

### Laws (both seats, independently)

- **Rare enough to be believed**: max 1 named rivalry per division, 3 world-wide;
  settlement closes arguments; heat decays monthly; golden age once per save.
- **The press does the noticing, never the UI**: heat is hidden; only stage transitions
  produce ink; every line interpolates specific facts (scores, dates, methods); the
  word "rivalry" never appears in chrome.
- **Series shape**: cap at 4 meetings, ≥5 months apart, trilogies spanning 2–5 years;
  a decisive sweep ends it; a disputed verdict or a war extends it.
- **Player symmetry**: one heat table, one pair ledger, `wf_`-keyed ids — player bouts
  (already rich in SD/MD verdicts and knockdowns) feed the same system through the
  existing fight consequence applier.
- **Ducking costs**: declining a callout sets a public mark the press remembers for a
  year — market and narrative consequences, never stat damage.

### Build order (agreed, and it settles the roadmap question)

1. **Pairing engine** (replaces phantom bouts; seeded rng; realistic cadence by tier) —
   prerequisite for both rivalries and rankings, pays for itself twice.
2. **Computed rankings** (#4, the ladder) — ranks derive from real results; #2 beating
   #1 is a title change between named men.
3. **Heat + stages + pair ledger** — the heat table fires from the unified consequence
   path.
4. **The rivalry desk** (spotlight tick stage) + press privileges + mail callouts.
5. **Tuning pass**: 500 headless seeded 25-year runs; tune exactly three constants
   (gravity, adjacency, elite decline) to hit "one golden age per save, one named
   rivalry per division per era."

### Save impact

`rivalries: PairHistory[]` (capped 64 pairs, ~10KB worst case) + `annals: string[]`
(≤12) — one save version bump, empty backfill, fixture captured at the bump per the
migration contract.
