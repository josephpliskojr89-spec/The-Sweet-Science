# Lockerless Fighters — Closing the Free-Scouting Exploit

*A design plan to fold into the bible. Source: the design doc on lockerless
fighters. The core principle: a fighter without a locker is not yet "your"
fighter — he shouldn't be fully controllable, perfectly legible, or freely
exploitable. The goal is not to prevent scouting, but to prevent **risk-free**
scouting.*

> **Status (save v16): the core fix + the light morale ripple are built.**
> Lockerless men now read as scouting bands (#1, `game/scouting.ts`), the
> Development tab and dev-feel are locked for them, "Stop Considering" replaces
> Cut (#2), a hidden trialist's-patience clock drives departures (#3,
> `game/departures.ts` — a content man waits ~5 months, a "stop considering"
> signal clears him out in ~2 weeks), the locker-request event fires after ~3
> months (#4), and cutting a fighter sends a small morale ripple through the
> room — worse for a Family Man, shrugged off by the ruthless (the light slice
> of #7). Still deferred: reputation hit for ruthless cuts (#6) and the
> friendship/sparring-specific reactions (the rest of #7).

---

## Where the code already stands

Some of the spec is in place; this keeps the plan honest about what's new.

- **Slower development (#2)** — done. Lockerless fighters already train at 25%
  (`lockerMult = 0.25` in training.ts) and cannot receive focused training or a
  coach (focus requires a locker). The locker is already a real development gate.
- **Slower discovery** — partly done. Hidden *traits* and *developmental feel*
  already reveal more slowly for lockerless men (the gym-observation rates are
  lower without a locker). What is NOT gated yet is the thing the exploit
  abuses: precise **attribute numbers** are fully visible immediately.
- **Leaving on their own (#5)** — partly done. The departures system already
  makes neglected lockerless men quit over weeks. It just isn't framed as a
  trialist's patience, and it can be short-circuited by cutting them.
- **The no-locker cap (6)** stays — it's a separate, physical floor-space
  constraint (and gym upgrades raise it). The new system below is the real
  anti-exploit layer; the cap is complementary, not the mechanism.

---

## Buildable now — the core fix

### 1. Lockerless attributes are scouting bands, not numbers (the key fix)

A lockerless fighter's profile shows **vague bands**, never precise values:

- Qualitative reads per attribute — *Raw / Below average / Average / Promising /
  Impressive / Exceptional* — with the gauge drawn as a coarse, hedged fill
  rather than an exact width, and **no number**.
- Some attributes read *"Too early to tell"* when confidence is low.
- The **Development tab** (sparklines, exact gains) and the **dev-feel** read are
  locked for lockerless men — you can't chart a trialist you haven't committed to.

Precise ratings unlock when you **give him a locker** (the commitment). Time,
sparring, and personally cornering his fights tighten the read further — those
hooks come with their phases; for now, locker = precise.

This is what actually kills "accept everyone lockerless, read exact stats, keep
the good ones."

### 2. You can't cut a lockerless fighter — you stop considering him

He isn't on your roster; you can't eject him. The action becomes **"Stop
Considering"** (don't offer a locker). It doesn't force him out — it signals you
won't be offering a spot, which **drains his patience** so he moves on soon. The
hard **"Cut from the gym"** stays for lockered fighters only (men you actually
committed to).

### 3. Lockerless men run on a hidden trialist's patience (#4, #5)

Each lockerless fighter carries a hidden patience clock (never a meter, never a
number). It drains faster from: no locker offered as time passes, others getting
lockers ahead of him, low morale, being told you're not considering him, and
ambition-leaning traits (Glory Hunter, Chip on His Shoulder). It holds longer
with: good morale/relationship, patient temperament, gym reputation (Phase 6C).
When it runs out he leaves — *"He stopped waiting for a gym that wanted him."*

Risk is communicated only through **flavor**, on the profile and in the gym log:

> *"He seems content to keep working for now."*
> *"He's started asking about a locker."*
> *"He watches the lockered men with something in his eyes."*
> *"He may not wait much longer."*

Mechanically this replaces the per-day quit roll for *lockerless* men with the
patience clock; lockered men keep the relationship-driven departures.

### 4. The locker request (#8)

A lockerless man who's stuck around long enough forces the decision himself:

> *"Coach, I've been here every night for four months. Do you see a future for me
> here, or am I wasting my time?"*

Choices, each with consequences: **give him a locker** (commitment — and now you
see who he really is), **ask him to keep waiting** (a patience and morale cost;
he may or may not accept), or **be honest there's no room** (he'll likely move
on, but respects the straight answer — which matters for reputation later). This
is the pressure beat that turns the fog into a real gamble.

---

## Deferred — needs systems not yet built

These are designed now, built when their substrate exists:

- **Reputation hit for ruthless cuts (#6)** — needs gym reputation (Phase 6C).
  The *context* is what matters (cutting just after giving a locker, churning
  several quickly, dumping a loyal man, cutting after a bad loss) vs. the
  *protections* (discipline issues, a requested release, a farewell fight). We'll
  track the signals now (recent-cut history) and couple them to reputation in 6C.
- **Gym morale reactions via friendships & sparring respect (#7)** — needs
  inter-fighter relationships and sparring, neither of which exists yet. A
  **light version is buildable now**: a cut sends a small morale ripple through
  the gym, worse when a Family Man or Loyalist is watching, shrugged off by the
  ruthless. The friend-specific version waits for relationships.

---

## Intended experience (unchanged from the source)

Lockers are meaningful. Walk-ins are uncertain. Patience matters. Good prospects
get missed, bad signings happen, and cutting people costs something. The gym is a
room full of people you're reading on incomplete information — not a spreadsheet
you farm.

---

## Tuning notes

- Band thresholds and the "too early to tell" confidence are tunable; start
  coarse enough that you genuinely can't tell a 62 from a 70.
- Lockerless patience should let a *valued* trialist wait a few months, while a
  "stop considering" signal moves him out within weeks.
- The locker-request event should fire rarely and feel earned — months in, not
  weeks.
