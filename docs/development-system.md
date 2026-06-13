# The Development System

*A design plan to fold into the Game Bible. Extends the Training System
(Phase 5). Voice and intent consistent with the bible. Nothing here contradicts
the existing build — it refines how fighters grow.*

---

## Principle

Development is not a guarantee that comes with a locker. It is the slow,
uncertain process of finding out what a man actually had in him — and it varies
enormously from one fighter to the next. Two prospects of equal apparent quality
can diverge completely over three years: one becomes a contender, the other
stalls into a club fighter, and you could not have known for certain which was
which on the day they walked in.

That uncertainty is the point. Development is one more thing the manager reads on
incomplete information — applied to the question that matters most: *is this one
worth my time?*

---

## Two Independent Axes

Every fighter carries two hidden developmental properties, and they are not the
same thing.

- **Ceiling (potential)** — how good he can ultimately become. The roof.
- **Development rate (feel)** — how quickly and how reliably he climbs toward
  that roof. The slope.

The cross-product is where the stories live:

- **High ceiling, fast feel** — the blue-chip who takes off the moment you
  focus on him. Rare. The reason you open the doors every day.
- **High ceiling, slow feel** — the project. The talent is real, but it surfaces
  over years, if it surfaces at all. You may run out of patience, money, or his
  prime before it does.
- **Low ceiling, fast feel** — maxes out quickly into a useful club fighter or
  gatekeeper. What you see at six months is most of what you will ever get.
- **Low ceiling, slow feel** — never gets there. He is not good enough, and he
  never becomes good enough, and that is a real and necessary outcome.

Neither axis raises the other. A natural with a low ceiling is just a man who
quickly becomes the best club fighter he was ever going to be. **Feel buys
speed, not greatness.**

---

## Raw Feel — The Developmental Trait

A fighter's development rate is drawn from a distribution that is mostly ordinary
with rare tails. Most men develop at a workmanlike pace. A few are blessed; a few
are cursed. The extremes read as discoverable developmental qualities — a dev
trait in all but name:

- **A Natural** *(rare)* — has a feel for the thing. Picks up in months what
  takes others years, wastes less of his prime, and keeps developing a little
  later than most. The kid who has been in the gym a year and already moves like
  he has been there five.
- **A Slow Study / Raw** *(uncommon, but more common than Naturals)* — the work
  goes in and barely comes out. Honest, willing, and stuck. He may have had a
  ceiling worth chasing; he will likely never reach it.
- **Most fighters** sit between, developing at a believable, unremarkable rate.

Naturals should be rare enough that finding one is an event. Slow studies should
be common enough that much of your early roster is made of them — because a new
gym in 1975 draws raw, unproven men, and most raw men stay raw.

---

## Age Is The Window, Not A Stat To Pump

Age governs the developmental window, and the window is a hard gate that feel
cannot override.

- Through the early twenties, development runs fastest.
- It tapers through the late twenties and is largely spent by the early thirties.
- Past the mid-thirties there is no development left to find — only decline, and
  reflexes (speed, footwork) go first.

A Natural at 33 is still a 33-year-old: his feel buys him a little more
late-career runway, not a second prime. A Slow Study at 19 has all the time in
the world and may squander every week of it.

This makes age a live pressure rather than a number to game. The project you are
developing is racing his own calendar, and the safe, patient path can run out of
road. It also closes the obvious exploit — you cannot simply grind an old fighter
into a good one.

---

## The Floor Is A Feature

A meaningful share of every walk-in pool — the majority, early — are men who will
never be more than club fighters: low ceilings, ordinary-to-poor feel, or both.
This is not a failure of generation. It is the ground everything else stands on.

- It makes the rare good one matter.
- It makes evaluation hard and the walk-in a genuine gamble — you cannot see
  ceiling or feel on the card.
- It supplies the journeymen, gatekeepers, and trial-horse opposition the world
  needs to feel real.
- It forces the manager's actual craft: deciding who is worth a locker, one of
  your scarce focused slots, and three years of your attention — on incomplete
  information, knowing most of them top out short.

You will give a locker to a man who never develops. You will cut a slow study a
year before he would have bloomed. Both are supposed to happen. A game where every
prospect pays off is a game with nothing at stake.

---

## Discovery — You Don't Get Told

Neither ceiling nor feel is ever shown as a number. The player infers them the
only way a real manager can: by watching development happen, or fail to, over
time.

- **The Development page** (attribute sparklines, gains since arrival) is the
  primary instrument. A fast riser hints at feel; flat lines hint at a low
  ceiling or a slow study — and for the first year you often cannot tell which,
  because they look identical.
- **The gym log** narrates the signs: the kid who is *"coming on,"* the man who
  *"works as hard as anyone and stands still."*
- Like hidden traits, a fighter's developmental nature reveals itself through
  time and pressure. Some you will read early. Some will surprise you in both
  directions — the late bloomer, the prospect who was a mirage.

This is the same incomplete-information contract the whole game runs on, pointed
at the most expensive decision you make.

---

## Implementation Notes *(extends Phase 5 — refinement, not rewrite)*

- **Generation** assigns each fighter a hidden **growth factor** alongside the
  existing hidden **potential (ceiling)**. Growth is a multiplier on development
  speed, drawn mostly near average with rare high (*Natural*) and low
  (*Slow Study*) tails. The two are rolled **independently**, so all four
  quadrants occur — then both are weighted by gym reputation, so a new gym mostly
  draws low-ceiling, ordinary-feel men.
- **Training** (`training.ts`) multiplies its per-week development by the growth
  factor, on top of the existing age, headroom, morale, locker, and focus terms.
  Age remains a hard gate — the age factor can zero out growth regardless of feel.
- **The extremes** (*Natural* / *Slow Study*) may be surfaced as discovered
  developmental descriptors, handled like trait reveals through the
  gym-observation system — never as raw numbers, and only after enough time has
  passed to have earned the read.
- **Decline** is unchanged: a function of age, not feel.
- **Event bus**: developmental reveals fire through the existing trait/event
  architecture, so they slot in beside hidden-trait reveals without new plumbing.

---

## Tuning Targets *(starting points — all tunable in play)*

- Growth distribution centered near average (≈1.0), with roughly: **Naturals** a
  small single-digit percentage of walk-ins; **Slow Studies** a larger minority;
  the bulk ordinary.
- A **Natural** develops on the order of ~1.5–2× the pace of an ordinary fighter;
  a **Slow Study** a fraction of it.
- Early-game pools skew heavily toward low ceiling and ordinary-or-worse feel, so
  genuine prospects are scarce and the floor stays well populated.
- A "natural feel" never moves the ceiling — only the speed of reaching it.
