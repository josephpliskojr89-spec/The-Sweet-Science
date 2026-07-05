# THE SWEET SCIENCE — Living World Bible

*Scripted history and the lives of fighters, 1975 onward*

How this was made: four veterans — a boxing historian, a retired boxing journalist, a retired fighter (62 bouts), and a retired promoter — worked in isolation and submitted 149 events grounded in the game's actual systems. A Creative Lead with full veto ruled on every submission and every declared hill; the verdict ledger is reproduced in full below. Raw submissions: `docs/design/team-output/living-world-panel.json`; the ruling: `living-world-ruling.json`.

## The Vision

The living world exists so a twenty-year save reads, in memory, like a shoebox of clippings — proof the sport went on around you, moved its money where you couldn't follow, killed its own farm system one obituary at a time, and once stood on your gym floor doing tricks for the flyweights. It is not content; it is weather with a ledger. Every event must clear four bars at once: it arrives only as the period allows (clipping, letter, invoice, phone call, note on cork — never an announcement); it is grounded in numbers the game already keeps (traits, trust, morale, record, rank, publicReputation, purse, age, year, city); it leaves a mark a system can show later (a ledger line, a missing venue, a changed offer sheet, a framed clipping); and it keeps the paper's manners — understatement, no system-speak, the dry sentence that lets the reader feel what the writer wouldn't say. The test applied to all 149: would the player tell somebody about it a week later in the event's own words, and does the save still remember it in 1992.

## The Hill Rulings

Each seat staked hills — ideas they declared they would fight for. The Lead ruled on all twelve:

**[UPHELD] Boxing Historian** — The club-circuit death must be mechanical, not decorative — venues leave the offer pool, club purse bases stop tracking inflation after ~1979.

> This is the timeline's economic spine and the reason every new money tier matters; the ledger squeeze is the story, and fights-on-tuesday is already the designed escape rung, so no softening is needed.

**[UPHELD-WITH-CONDITIONS] Boxing Historian** — Reputation is rented; the wrecking ball and every era star run on the same fighter model with traits seeded at generation, never special-case script.

> Upheld — trait-as-destiny is the procedural-first commitment made visible; condition: landmark outcomes (the upset month, the implosion window) are pre-seeded at save creation so the era composes, but every beat must be expressible as his generated traits playing out through the normal reputation and fight systems.

**[UPHELD-WITH-CONDITIONS] Boxing Historian** — The timeline arrives only through paper and phone, with per-save variance windows and generated names.

> Upheld as the voice law; condition: real-calendar anchors (Olympic summers) stay fixed because the calendar is scenery, while every authored beat's date, cast, and name rolls per save.

**[UPHELD] Retired boxing journalist** — The beat writer is a character, not a string — per-byline memory (clippings-per-fighter, warmth, adoption) attached to the existing persistent bylines.

> One counter and two flags convert the press from wallpaper into the game's best recurring NPC, and a dozen kept events (adoption, cold-shoulder, farewell column) are load-bearing on it.

**[UPHELD] Retired boxing journalist** — Reputation moves through ink — a press-context multiplier scales resolveFight's rep swing (adopted writer, televised date, skeptical year, frozen-out desk).

> One multiplier field on the existing repSwing makes every press event mechanical instead of decorative, and it is the truest sentence in the submissions: fighters get famous for being written about winning.

**[UPHELD-WITH-CONDITIONS] Retired boxing journalist** — The ring-death beat ships in every save, unsoftened, and breaks the sports-page frame once.

> Non-negotiable — a 1975-1990 save without the sport on trial has the hardest page torn out; condition: the frame-break is reserved for the one scripted death, and the historian's rare decade-scale recurrences stay inside the sports page at smaller type.

**[UPHELD] Retired fighter** — Trust must have events that raise its ceiling — the engraved watch lifts TRUST_HEAL_CAP from 65 to 80 for one fighter, once, earned.

> The exception is what makes the cap mean something the other 99% of the time; once-per-fighter, never purchasable, exactly as submitted.

**[UPHELD] Retired fighter** — The dementia arc (the-fog, the-doctor-said-stop, benefit-night) ships uncut, 'say nothing' stays selectable, and it can happen to YOUR man.

> The punch-drunk old man is the central moral fact of managing fighters in this era, and a game that only lets it happen to world fighters is lying; the ledger remembering that you looked away is the design.

**[UPHELD] Retired fighter** — Joyful events (washing machine, watercolors, cigars, the watch) fire with no choices and no optimization angle.

> Witnessed-not-played is what keeps a fifteen-year save from curdling into a spreadsheet; no rewards or decisions may be bolted on in implementation, ever.

**[UPHELD-WITH-CONDITIONS] Retired Promoter** — Money always costs control — buyouts, option contracts, retainers, and B-side offers ship as one connected strings system with real, quiet refusal costs.

> Upheld as a system — freeze-outs, option taxes, and arranged opponents are the era's true texture; condition: casino-b-side survives merged inside opponent-for-hire, so the lattice ships whole even though one of its four doors changed frames.

**[UPHELD] Retired Promoter** — The accommodation (the fixer's dive offer) stays in with teeth both ways — arrives when broke, traits decide if the fighter will even do it, consequence is a years-later fuse.

> The genre's defining values choice, correctly designed: no morality meter, no warning text, a lionheart who walks out on you, and a fuse the ledger holds — sand this down and we lose the one event players will tell each other about.

**[UPHELD] Retired Promoter** — The venue economy must die and be reborn under the player's feet — club collapse, casino rise, and cable revival as one physical arc.

> Same spine as the historian's first hill, merged into club-circuit-withers/desert-city-ascendant/fights-on-tuesday; the venue list, offer frequencies, and purse tiers must actually change or the decades are 1975 with 6% bigger numbers.

## The Verdict Ledger

149 submissions: **119 kept**, **28 merged into kept events**, 0 vetoed. The merges:

- `games-class-gold-rush` → `bicentennial-olympic-class` — Same 1976 class from the press desk — its oxygen-tax and cover-story beats fold into the surviving event.
- `network-fight-nights` → `network-boxing-boom` — Both seats' submissions of this id are the same boom — the journalist's churn math and the promoter's spoken clean-record condition carry into the survivor.
- `ratings-scandal` → `network-tournament-scandal` — Same scandal; its skeptical-press year, exposé byline, and honest-record dividend are adopted into the survivor.
- `fading-king` → `poet-kings-last-reign` — The same king told from the press box — the tribute edition, the split columnists, and the who-inherits-the-language feature distribute across the kept three-beat arc.
- `casino-decade` → `desert-city-ascendant` — Same migration west; its area-code-702 rumor item and family_man travel morale cost carry over.
- `ring-death-reckoning` → `ring-death-fifteen-rounds` — The four seats wrote one event; the journalist's month of dueling columns and the six-month pall are adopted wholesale.
- `cable-buys-the-top` → `premium-cable-arrives` — Same era from the same direction; its farewell-card offer moves under club-circuit-withers/last-card-at-the-old-hall and its rankings-with-purse-figures detail survives.
- `poet-kings-long-goodbye` → `poet-kings-last-reign` — Same arc from ringside; its stool-stoppage corkboard note and the age-33+ retirement-pressure rider distribute across the kept king beats.
- `boy-with-the-medal` → `bicentennial-olympic-class` — Same class; its walk-in inspiration wave and the medalist-lands-in-your-region grudge seed carry into the survivor.
- `desert-money` → `desert-city-ascendant` — Both seats' submissions of this id are the same casino migration — the telegram arrival and the promoter's honest B-side pitch line carry over.
- `the-boy-who-died` → `ring-death-fifteen-rounds` — Same tragedy; its commission-physical booking gate, forced-retirement wave, and 2x weighting of the medical events are adopted into the survivor.
- `alphabet-belts` → `alphabet-fracture-one` — Same schism compressed; its dues invoice and dueling-rankings flavor distribute across the two kept alphabet beats.
- `fading-king-farewell` → `poet-kings-last-reign` — Same king from the money side; its superfight-week purse bump and post-retirement heavyweight crater (softened to the historian's numbers) carry into the arc.
- `tournament-scandal` → `network-tournament-scandal` — Same scandal; its crooked-promoter NPC and fat-envelope invitation carry, but its network-TV-dies consequence is rejected — the boom survives to die later.
- `club-show-collapse` → `club-circuit-withers` — Same death of the small hall; its travel-expense line, novice-offer halving, and taped-up-fight-bill gym-log line carry into the survivor.
- `golden-middles` → `four-kings-era` — Same four kings; its beat-a-king's-camp-fighter double swing and undercard B-side profile carry into the survivor.
- `ring-tragedy-reform` → `ring-death-fifteen-rounds` — Same reform; its typed medical/licensing deduction line and careful-sparring gym-log note are adopted into the survivor.
- `cable-money` → `premium-cable-arrives` — Its prestige tier merges here and its weeknight series is the same show as fights-on-tuesday; the style-as-economics pitch ('my audience likes guys who come forward') carries.
- `young-destroyer` → `teen-wrecking-ball-rise` — Same teenager; the sparring-partner contract, tripled site fees, and big-kid walk-in surge carry, while the reign-or-upset fork is already owned by teen-implosion.
- `belt-inflation` → `alphabet-soup-complete` — Same proliferation; per-body rankings, fee-escape-valve, and unification prestige carry into the survivor.
- `ppv-arrives` → `ppv-in-the-home` — Same transition; its guarantee-plus-percentage contract structure and middle-class-is-gone framing carry into the survivor.
- `the-camera-test` → `television-audition` — Same TV door — the blazer-scout scene survives as the audition's arrival texture and the permanent purse flag dies.
- `saturday-night-in-print` → `saturday-in-the-tank` — Same Saturday from two desks — the rep>=30 press layer, get-ahead-of-it statement, and tabloid-era doubling bolt onto the fighter seat's bail event.
- `the-payday-item` → `twelve-guys-named-cousin` — Same first-money moment — the printed purse becomes the cousin event's arrival vector, and its trait drifts fold into the survivor.
- `comeback-collect-call` → `comeback-itch` — Same returning man from two seats — its collect-call staging and corner-work ending survive inside the kept event.
- `casino-b-side` → `opponent-for-hire` — Same B-side phone call — its prospect band, rematch-clause counter, and polite-is-the-tell staging survive inside the kept event.
- `ratings-assessment` → `sanctioning-invoice` — Same ornate letterhead from two seats — the haggle branch, quarterly recurrence, and daylight escape survive in the kept event.
- `commission-flag` → `the-doctor-said-stop` — Same commission doctor from two seats — its specialist workup, looser-state dodge, and trait-branched retirement endings survive in the kept event.

---

## Part I — The Scripted Timeline

Guaranteed era beats, chronological, with per-save variance windows. The eras compose economically: the club circuit dies as casino and television money rises; every purse tier and venue list actually changes.

### The Poet-King Holds Court

*`poet-kings-last-reign` · window: 1975-1976 (opening state, defenses seeded quarterly) · analog of: Ali's late title reign — the third Frazier fight, the Manila-era defenses, the closed-circuit machine at full power · from: Boxing Historian*

**Lead's edit:** Adopt the promoter's annual superfight-week offer bump from fading-king-farewell; era multiplier stays at the historian's x1.2, not x1.6.

**Beats:**
- At save start, the heavyweight champion is generated as a 33-35 year old with publicReputation 95+, a poet's mouth, and eroding speed/reflexes (rating already drifting down under developmentDrift)
- He makes 2-3 title defenses across 1975-76, each a closed-circuit theatre event; the paper runs a week of copy before and after each
- One defense is a brutal, career-shortening war against his generational rival — both men's ratings take a permanent step down after it
- Between defenses he is everywhere: exhibition tours, television panel shows, a visit to a city near yours the paper covers

**World effects:**
- Heavyweight division publicReputation ceiling +15 while he reigns — heavyweight purses at every level carry a x1.2 era multiplier
- His defenses fire 'closed-circuit night' clippings naming local theatres — establishes the theatres later beats will kill
- His WorldFighter record accrues real defenses; rankings page in the magazine lists him at 1 with genuine challengers beneath

**Player-facing:** Front-page clippings before and after each defense; a rumor-column item about what the local theatre charged; your fighters talk about him in the gym log ('half the gym skipped roadwork to argue about the fight')

*Absorbs: `fading-king`, `poet-kings-long-goodbye`, `fading-king-farewell`*

### The Flag-Draped Class Turns Pro

*`bicentennial-olympic-class` · window: 1976 Olympics fixed; pro debuts Jan-Jun 1977 (composition seeded per save) · analog of: The 1976 Montreal team — Leonard, the Spinks brothers — network TV minting instant professional stars · from: Boxing Historian*

**Lead's edit:** Absorb the journalist's press-oxygen tax (club wins earn ~25% less ink for 18 months) and the fighter's post-Games walk-in inspiration wave.

**Beats:**
- The summer Games produce 3-5 gold-medal fictional stars, seeded across divisions (always at least one welterweight-or-lighter and one heavyweight)
- They turn pro on network television for four-round purses bigger than most main events — the paper prints the numbers with a raised eyebrow
- Within 24 months at least one is a legitimate contender on an accelerated schedule; at least one busts, exposed by the first club fighter with a real jab
- The golden welterweight of this class is generated as a future member of the four-kings era

**World effects:**
- 3-5 high-rating WorldFighters injected with publicReputation 60-75 at ZERO professional fights — the first time reputation decouples from record
- Their televised debuts set a new purse ceiling for novices, which quietly devalues every un-televised novice — a 4-round club purse loses ~10% real value against them
- Establishes the recurring Olympic-cycle machinery (repeats 1980-boycott, 1984, 1988, 1992 with varying class strength)

**Player-facing:** Olympics arrive as a summer of clippings; the pro-debut purse figures land as rumor items your broke fighters read aloud; if any medalist shares a division with your ranked man, offers referencing him begin appearing

*Absorbs: `games-class-gold-rush`, `boy-with-the-medal`*

### Gambling Comes to the Boardwalk

*`boardwalk-city-opens` · window: Referendum 1976-77; first casino 1978-79; first major fight card 1979-80 (each step seeded) · analog of: New Jersey's 1976 referendum and Atlantic City's rise to a fight town · from: Boxing Historian*

**Beats:**
- A faded eastern boardwalk resort votes to legalize casino gambling — the paper covers it as a curiosity, one column, page nine
- The first casino opens; within a year its ballroom hosts a fight card, and the site fee it pays makes club promoters ill
- Casinos multiply; by the early 80s the boardwalk city hosts more title fights than any city but the desert
- Old-line eastern club promoters either get a casino contract or get out

**World effects:**
- New venue tier enters the offer pool: 'casino ballroom' venues with purse x2-3 over club equivalents, gated by fighter publicReputation>=45 or nationalRank
- Eastern-region club venue closures accelerate (feeds club-circuit-withers) — casino money doesn't trickle down, it drains up
- Casino cards prefer crowd-pleasers: offer generation there weights power/KO-percentage and reckless_brave-style records over careful boxers

**Player-facing:** The referendum is a small clipping most players will skim — the design intent; two years later the first casino-card purse figures land as front-page numbers; eastern-city players start hearing promoters say 'the boardwalk' on the phone

### Fights With the Sound of Home

*`network-boxing-boom` · window: 1976-1981 boom (peak year seeded) · analog of: The late-70s network era — boxing on all three networks on weekend afternoons · from: Boxing Historian*

**Lead's edit:** Absorb the promoter's matchmaker call that states the clean-record condition out loud and the journalist's accelerated world reputation churn.

**Beats:**
- All three networks carry weekend-afternoon boxing; the sport is free, national, and everywhere
- Network matchmakers want prospects with clean records and faces that photograph well — a new kind of gatekeeping
- A generation of fighters becomes famous between commercials; the closed-circuit theatres keep only the biggest events
- The boom quietly builds the audience the casinos and cable will later buy

**World effects:**
- New offer type: the network date — purse x3-4 a club equivalent, requires publicReputation>=40, record no worse than 2 losses, and a 'television-friendly' read (KO rate or an unbeaten number)
- A won network date grants publicReputation +10-15 (versus +2-4 for a club win) — television is now the reputation machine
- A DULL win on television (long decision, low action) grants nothing and blacklists the fighter from network offers for 12 months

**Player-facing:** The first network offer arrives as a phone call the game frames as different — the promoter mentions the camera before he mentions the opponent; the paper prints ratings figures after; the gym log notes strangers recognizing your fighter at the diner

*Absorbs: `network-fight-nights`*

### The Tournament With the Doctored Book

*`network-tournament-scandal` · window: 1977-1978 (seeded per save) · analog of: The 1977 U.S. Championships scandal — falsified records, kickbacks, a network tournament cancelled mid-run · from: Boxing Historian*

**Lead's edit:** Absorb the journalist's skeptical-press year (rep from wins over losing records halved, honest-record sidebar) and the promoter's permanently-marked crooked promoter NPC who later feeds bounced-check.

**Beats:**
- A national network announces a United States championship tournament, all divisions, televised — for a few months it is the biggest thing in the sport
- Invitations track a private ratings book; a reporter discovers fighters with invented records and camps that paid to get in
- The network cancels mid-tournament on the air; hearings follow; two matchmakers are quietly finished in the sport
- The magazine, whose ratings were bypassed, runs its most self-righteous editorial of the decade

**World effects:**
- During the tournament: a burst of one-off televised offers reaching down to fighters with 8-12 bouts (purse x2.5 normal)
- After the collapse: televised offers to sub-top-20 fighters vanish for 18 months — a boom-and-bust the player's books feel
- 2-3 WorldFighters with inflated records are exposed; their publicReputation halves overnight — precedent that records can lie

**Player-facing:** If the player has an eligible fighter (10+ bouts, winning record), a phone call invites him in — the purse is wonderful and the paperwork asks no questions; taking it risks his name appearing in the scandal coverage (reputation -8, one bad clipping) against the fat purse he keeps either way

*Absorbs: `ratings-scandal`, `tournament-scandal`*

### The Armory Goes Dark

*`club-circuit-withers` · window: Rolling 1977-1990: one local venue closes every 2-4 years (order and dates seeded per save, per city) · analog of: The death of the weekly club show — the small-hall circuit that made fighters, killed by television and casino concentration · from: Boxing Historian*

**Lead's edit:** Absorb club-show-collapse's travel expense line and novice-offer thinning; seed 5-6 venues per city at world-gen so the cadence works and at least one hall always survives.

**Beats:**
- The oldest venue in the press state's venue list announces its last card — 'forty-one years of Tuesday fights' — and the paper gives it a proper obituary
- Every few years another goes: the ballroom becomes a discount furniture showroom, the athletic hall a church
- Each closure thins the local offer pool; the promoters who survive consolidate and cut purses because where else will you go
- By the late 80s a city that held four fight venues holds one, and it's dark most months

**World effects:**
- THE central player-economy pressure: each closure permanently removes a venue from the offer pool and cuts local offer frequency ~20%
- Club purse BASES stop tracking inflation after 1979 — a 4-rounder pays $150 in 1975 and $200 in 1985 while the player's rent has doubled; staying local is a slow bankruptcy by design
- Rival gyms feel it too: worldSim retires local-tier gyms' fighters faster in cities with fewer venues; some rival gyms fold outright (roster dispersal events)
- Escape routes are exactly the era's new money: network dates, casino cards, cable series — all gated by reputation the club circuit can no longer build efficiently

**Player-facing:** Each closure is a full elegiac clipping naming the venue where your own fighters may have fought; the ledger shows the squeeze without commentary; a promoter on the phone says it plainly once — 'There's no money in the neighborhoods anymore, kid. The money moved.'

*Absorbs: `club-show-collapse`*

### The Night the King Got Old

*`poet-king-upset-and-redemption` · window: 1977-1979 (upset seeded to one specific month per save; rematch 6-9 months later) · analog of: Ali losing to Leon Spinks (Feb 1978) and winning the rematch — the third reign nobody should have cheered for · from: Boxing Historian*

**Beats:**
- A seven-fight novice — a generated Olympic-class kid with a gap-toothed grin — takes the title on a split decision nobody scored the same way
- Three months of circus: the new champ misses press dates, gets arrested driving the wrong way down a one-way street, defends nothing
- The old king wins the rematch on legs that aren't there, becomes the first three-time champion, and the paper's tone is half celebration, half elegy
- The magazine runs a piece asking the question out loud for the first time: how does a man like this end?

**World effects:**
- Champion WorldFighter swaps twice; both fights are the year's biggest closed-circuit gates (purse-scale reference points printed in clippings)
- The novice's publicReputation spikes to 80 then decays 3/month — the game's first demonstration that reputation is rented
- Heavyweight era multiplier holds at x1.2 through the rematch, then begins a slow decline to x1.0 as the king fades

**Player-facing:** The upset arrives as a stop-press clipping; the rumor column tracks the new champion's misadventures weekly; gym log — your older fighters take the upset personally, your young ones take it as proof anybody can be gotten

### The Champion Nobody Cheers

*`heir-in-the-shadow` · window: 1978-1985 reign (starts within a year of the king's decline; ends when the teenager's shadow falls) · analog of: Larry Holmes — a great champion doomed to be measured against the man before him · from: Boxing Historian*

**Beats:**
- A technically flawless heavyweight — a former sparring partner of the king — takes a version of the title and defends it 15+ times
- Every defense clipping carries the same undertone: fine fighter, wrong era; the magazine ranks him high and the public stays home
- He chases the record of an old-time unbeaten champion, falls one fight short in a decision loss the paper calls a robbery
- He retires bitter, unretires twice — the second comeback lands inside the 90s circus era

**World effects:**
- Sustains a legitimate heavyweight lineage between the two superstar eras so rankings stay coherent
- His defenses are steady mid-size purse reference points — heavyweight money exists but doesn't boom (era multiplier x0.9-1.0)
- One defense per year is a network-television date rather than closed circuit — feeds the network-boxing-boom beat

**Player-facing:** Rankings-page constancy — the same name at the top for years; rumor items about his resentment of the old king; if the player has a ranked heavyweight in this window, offers reference 'the only division where the ladder still leads somewhere'

### Two Men Wearing One Crown

*`alphabet-fracture-one` · window: 1978-1983 (seeded) — the first rival sanctioning body crowns its own champions · analog of: The WBA/WBC schism hardening, then the IBF's founding (1983) — one champion per division becoming two · from: Boxing Historian*

**Lead's edit:** Absorb alphabet-belts' dues-invoice-as-office-mail texture and its titles-easier-worth-less purse curve.

**Beats:**
- A dispute over a mandatory defense ends with the established council stripping a champion; a rival federation immediately recognizes him — now there are two heavyweight champions and the paper needs a style guide
- The rival body, run out of a hotel suite by a former ratings chairman passed over for the top job, begins sanctioning 'world title' fights of its own
- The magazine refuses to recognize the new belts for two years, then surrenders to reality and prints both ratings columns
- Promoters learn the schism's real use: if your fighter can't get one body's title shot, buy the other's ranking

**World effects:**
- World state now tracks 2 title claims per division; the rankings page doubles; 'undisputed' enters the vocabulary as a rare and marketable condition
- SANCTIONING FEES appear: any player fighter in a body's top 10 who fights a ranked bout owes 2-3% of the purse to the body — a new recurring ledger line
- Title-shot availability roughly doubles while title MEANING halves: championship purse multipliers per belt drop from x8 to x5 over the era
- Mandatory-defense politics enter offer generation: ranked fighters receive 'fight him or lose your ranking' letters

**Player-facing:** The schism is a running month of confused clippings the paper itself finds absurd; the player's first sanctioning-fee invoice arrives as a typed letter with a letterhead slightly too ornate — the game's voice lets the document indict itself

*Absorbs: `alphabet-belts`*

### One Fight Too Many

*`poet-king-sad-ending` · window: 1980-1981 (the bad loss seeded per save; a second, worse farewell fight 12-14 months later) · analog of: Holmes-Ali (Oct 1980) and Ali-Berbick (Dec 1981) — the saddest fights ever sold · from: Boxing Historian*

**Lead's edit:** Absorb poet-kings-long-goodbye's rider: retirement-pressure events fire at 2x weight for 18 months for any roster fighter age 33+.

**Beats:**
- The retired king, broke and unable to say no, announces a comeback against his own former sparring partner — now the champion (see heir-in-the-shadow)
- The buildup is huge; the fight is one-sided and hard to read about; the corner stops it and the paper prints the round-by-round like an autopsy
- Fourteen months later he fights once more, in a foreign ring with folding chairs, loses a dreary decision to a nobody, and it is finally over
- For years after, small items surface: his hands shake at a card show; his voice is slower on television; the magazine never quite says it plainly

**World effects:**
- Heavyweight era purse multiplier drops to x0.9 for 2-3 years — the division's shine is gone until the teenager arrives
- The 'aging great fights on' precedent is set: retired WorldFighters with publicReputation>75 gain a small comeback probability, each comeback generating sad-toned clippings
- The heir who beat him takes a permanent publicReputation penalty of -10 despite winning — the world never forgives him for it

**Player-facing:** A full week of pre-fight clippings, then the grim report; gym-log line if you have any fighter age 33+ ('He read the account twice and put the paper down without a word'); this beat arms the player-side comeback-itch triggered event

### Nobody's Buying Tickets

*`recession-bite` · window: 1980-1982, repeats 1990-1992 (milder) · analog of: The 1980-82 recession (and the early-90s dip) hitting gate-driven small boxing hardest while inflation kept running. · from: Retired Promoter*

**Lead's edit:** The recession freeze supersedes (never stacks with) the club-tier base freeze; rival-gym folds route through the existing worldSim churn with roster-dispersal clippings.

**Beats:**
- Clippings turn economic: layoffs at the plant, a promoter quoted saying 'the ten-dollar seat is dead here.'
- Purse offers stop keeping pace with inflation for ~24 months — the numbers look the same as last year, which means they're smaller.
- Gate-percentage deals vanish; flat purses only. A couple of world-sim rival gyms fold outright (rosters scatter, a few fighters go independent).
- Recovery is quiet: one spring the offers are just better again.

**World effects:**
- Purse inflation term frozen for the window (pursefor uses inflationFactor(windowStart) while active) — a real ~12% pay cut by the end
- Offer frequency −25%; 'reach' offers become relatively more common (desperate matchmakers pay for danger, not names)
- 1-2 rival gyms in the region fold; their best men hit the independent pool (a poaching opportunity, if the player's gym has room and reputation)
- Fighter dues: broke-fighter rate rises from 15% to 25% among walk-ins during the window

**Player-facing:** Felt in the ledger before it's read in the paper. One phone call makes it explicit: a promoter offering last year's number, and when pressed — 'That's the purse. Take it or I'll find somebody hungrier. There's a lot of hungry right now.'

### Four Men, One Crown's Worth of Glory

*`four-kings-era` · window: First collision 1980-81; era runs to a disputed final verdict 1987-89 (all pairings seeded, 5-7 total meetings) · analog of: Leonard, Durán, Hagler, Hearns — the golden welterweight/middleweight generation, nine fights among them · from: Boxing Historian*

**Lead's edit:** Absorb golden-middles' double-reputation swing for beating a king's camp fighter and its walk-in skew.

**Beats:**
- Four generated stars converge on welterweight/middleweight: the Olympic golden boy (showman archetype, publicReputation-rich), the snarling brawler from the slums of somewhere (hot_tempered, pressure), the shaven-skulled avoided champion (chip_on_shoulder, southpaw, undervalued for years), and the lanky one-punch assassin (power outlier)
- First superfight: golden boy vs. brawler — the brawler wins ugly, the rematch produces the era's scandal (see the-surrender)
- Mid-era: assassin vs. golden boy in the year's biggest closed-circuit gate; assassin vs. skull in a three-round war the magazine calls the greatest short fight ever printed (analog of Hagler-Hearns '85)
- Final verdict: the golden boy returns from a long absence to steal a decision from the avoided champion — half the press calls it larceny, the loser leaves the country and never fights again
- Every meeting is a closed-circuit or early-PPV benchmark; among them they hold the middleweight title in some form for nearly a decade

**World effects:**
- Welterweight and middleweight era purse multipliers climb to x1.5 at peak — for once the glamour division is NOT heavyweight
- Player fighters in these divisions ride the tide: offer frequency +25%, and any player fighter who cracks the top 10 draws an eliminator offer to face a king's mandatory challenger
- The four kings occupy 2 of a division's top-5 slots for years — a HARD ceiling on player middleweights that is historically honest: the room at the top is full
- Each superfight fires undercard offers 2-4 weeks prior: casino/arena dates for ranked player fighters at x2 purse

**Player-facing:** Years of front pages; the rankings page of the magazine tells the story numerically; if the player manages a top-10 middleweight, the phone call they've waited a decade for is an UNDERCARD slot — the era's greatness and its gatekeeping in one offer

*Absorbs: `golden-middles`*

### The Night He Turned Away

*`the-surrender` · window: 1980-1982, inside the four-kings arc (fires in the golden boy/brawler rematch) · analog of: No Más — Durán quitting in the New Orleans rematch, November 1980 · from: Boxing Historian*

**Beats:**
- In the rematch of the era's first superfight, the brawler — humiliated by a showboating opponent — turns his back in the eighth round and waves it off
- No injury, no knockdown; the phrase he muttered runs in every paper in the country for a month
- His publicReputation collapses from 90 to 40 overnight; his own country's press disowns him
- Over YEARS he claws it back — wins a title in a third division, and by the 90s the surrender is a footnote to a great career; the redemption is part of the analog

**World effects:**
- Demonstrates the reputation system's full range in a single world event: -50 publicReputation in one night, rebuilt over a decade
- Introduces 'quit' as a fight-engine outcome the world remembers: any fighter who retires on his stool in a fight he isn't losing takes an outsized reputation penalty forever after — the world now has a name for it
- The brawler's later redemption arc generates comeback clippings that keep the era's memory alive into the 90s

**Player-facing:** The scandal is a week of clippings; forever after, when a player fighter quits on the stool, the press invokes the famous surrender by name — the world's history becomes the measuring stick for your men

### The Money Moves to the Desert

*`desert-city-ascendant` · window: 1980-1984 (crossover year seeded — the year the desert hosts more title fights than the rest of the country combined) · analog of: Las Vegas becoming boxing's capital — Caesars' outdoor lots, casino site fees replacing gate economics · from: Boxing Historian*

**Lead's edit:** Absorb the promoter's A-side/B-side skew: below rep ~40 casino offers arrive as reach (you're the opponent), above ~55 as soft (you're the attraction).

**Beats:**
- The desert gambling city (present in the game as the non-selectable destination) starts outbidding everyone: casinos pay site fees for the privilege of the crowd the fight brings to the tables
- Purses detach from ticket sales entirely — a fight can 'lose money' at the gate and everyone gets rich
- The four-kings superfights and heavyweight title fights migrate there almost totally by mid-decade
- The magazine begins datelining half its coverage from one city

**World effects:**
- Desert venue tier tops the offer pool: purse x3-4, gated by publicReputation>=60 or nationalRank top 15
- Fighting there grants a publicReputation bonus (+3 beyond the result) — the dateline itself confers standing
- Accelerates club-circuit-withers: every title fight the desert takes is a card some regional city lost; regional venue closures tick faster after crossover year
- Rival-gym elite fighters begin listing desert results in their records — the ladder now physically runs through one city

**Player-facing:** Dateline creep in the clippings; the first desert offer for a player fighter is staged as an event — a long-distance call, a purse with a comma in it, and travel the game notes ('He has never been west of the river'); comfort_seeker fighters are flagged risky for the trip

*Absorbs: `casino-decade`, `desert-money`*

### The Wire That Pays

*`premium-cable-arrives` · window: 1980-1984 (first big-fight cable contract seeded); cable becomes the prestige tier by 1986 · analog of: HBO's rise from novelty to boxing's bank — the network that paid for the 80s · from: Boxing Historian*

**Lead's edit:** Take cable-buys-the-top's detail of the magazine printing purse figures beside the rankings; multi-fight approved-opponent contracts carry as written.

**Beats:**
- A subscription cable service — young, flush, in need of programming nobody else has — buys the rights to a heavyweight title fight and pays more than the closed-circuit projection
- It signs multi-fight deals with the four kings and the heavyweight lineage; its announcing team becomes the sport's voice of record
- Closed-circuit theatres are squeezed from below (free network TV) and above (cable) — their crowds thin through the decade
- By mid-decade a cable date is worth more than a network date and carries more prestige than any venue

**World effects:**
- New top offer tier: the cable date — purse x5-6 club equivalent, gated by publicReputation>=65 or nationalRank top 10, 2-3 available per year across the whole world
- Cable prefers narrative: fighters with unbeaten records, title claims, or a famous rivalry get priority — reputation compounding accelerates at the top
- Closed-circuit revenue references in clippings decline yearly, setting up ppv-in-the-home
- Multi-fight contracts appear: a cable deal can lock a player fighter's next 3 opponents to approved lists — money against matchmaking freedom

**Player-facing:** The first cable purse figure lands in the paper like a misprint; if the player develops a top-10 man, the cable call is a distinct phone event — a lawyer on the line instead of a promoter, and the game notes the difference

*Absorbs: `cable-buys-the-top`, `cable-money`*

### The Paper Gets Thinner

*`death-of-the-afternoon-paper` · window: 1981-1986 (fires once, seeded) · analog of: The 1980s death of the American afternoon daily — mergers, folded papers, retired bylines, and the shrinking of the boxing beat from a daily column to a weekly roundup. · from: Retired boxing journalist*

**Beats:**
- A front-page notice: the city's paper is merging editions; the veteran boxing writer — one of the save's 2-4 persistent bylines, the one with the most player-gym stories to his name — takes the buyout.
- His farewell column names the ten best fighters he covered; if any player fighter earned 5+ clippings under his byline, that fighter makes the list.
- A young replacement byline is generated: faster, hungrier, less patient — different template voice, shorter cooldowns on rumor items, longer on tributes.
- The boxing column moves from daily to weekly; club results start running as agate.

**World effects:**
- The retiring byline is permanently removed; a new persistent byline is generated (the paper stays authored, but the voice changes mid-save — decade-long saves feel the era turn).
- A player fighter named in the farewell list: publicReputation +8, morale +10, milestone in the ledger.
- Post-merger: ambient press cycle produces ~20% fewer items; rep gains from ordinary local wins -1 (less ink to go around) but feature-driven rep events unchanged — press attention becomes scarcer and therefore more valuable.
- One-time: the old writer's rolodex letter — he mails the gym a note naming one hidden trait of a current roster fighter he noticed over the years (a free trait reveal, journalist's parting gift).

**Player-facing:** The merger notice, the farewell column (a full clipping, the longest the paper ever runs), the letter in the office mail, and a noticeably thinner Monday paper forever after.

### Fourteen Rounds Too Many

*`ring-death-fifteen-rounds` · window: Death 1982-1984 (seeded); 15-round title fights abolished over the following 24-36 months, body by body · analog of: Duk-koo Kim's death (Nov 1982) and the abolition of 15-round championship fights · from: Boxing Historian*

**Lead's edit:** Absorb the journalist's six-month pall (KO rep bonus suspended, brutal-KO hostile column), the fighter's commission-physical gate and forced-retirement wave, and the promoter's typed medical-and-license fee line on every settlement after.

**Beats:**
- A lightweight title challenger — a generated foreign fighter, brave past all sense — collapses after a 14th-round stoppage on national television and dies four days later
- The coverage is unlike anything before it: the paper prints the round-by-round and then, days later, the hospital bulletin, and then the funeral
- The referee and the winner are both, in different ways, never the same; the winner's later career is shadowed (his subsequent clippings carry it)
- Within two years the sanctioning bodies cut championship fights from 15 rounds to 12; standing eight counts and same-day weigh-in reforms follow; old-timers grumble that they are softening the sport, and are wrong

**World effects:**
- HARD RULE CHANGE: title fights become 12 rounds permanently; the fight engine's championship distance changes mid-save
- Stamina's value in title fights drops a notch (the 13th-15th round graveyard is gone) — an honest mechanical echo of the reform
- Ringside insurance and medical requirements enter fight expenses: title-level and 10-round bouts carry a new flat cost line on the player's settlement sheet
- Roughly one world-level ring tragedy may recur per decade at low probability — the sport's dark constant — each firing smaller reform clippings

**Player-facing:** The most somber week the paper will ever deliver; arms the triggered event the-long-count-home (your fighters react by trait); a small ledger line appears on subsequent fight settlements: 'physician & insurance — required'

*Absorbs: `ring-death-reckoning`, `the-boy-who-died`, `ring-tragedy-reform`*

### The Voice Walks Away

*`voice-quits-the-sport` · window: 1982-1984 (chained 2-8 months after ring-death-reckoning) · analog of: The most famous broadcast voice in boxing publicly renouncing the sport after calling one mismatch too many (Cosell after Holmes-Cobb, 1982). · from: Retired boxing journalist*

**Lead's edit:** Its televised-offer halving lasts the pall (~12-18 months) and recovers into the cable era; permanent removal of the network tier belongs to networks-abandon-ship alone.

**Beats:**
- The nation's best-known fight broadcaster — a generated name the paper has quoted since the network boom — calls a one-sided televised beating and says on the air he is done with professional boxing.
- A week of reaction columns; the Monthly runs 'He Needed Us More Than We Needed Him' and gets 400 letters.
- Network television quietly cuts its fight dates by half over the following year.

**World effects:**
- Televised-offer frequency halves permanently (bridges the network era into the cable era beat).
- Publicity economy tilts back to print for 18 months: newspaper-driven rep events (features, feuds, columns) produce +25% rep, television x2 multiplier drops to x1.5.
- Mismatch policing: 'soft' offers against opponents 20+ rating points below your man become rarer for ranked/contender fighters (matchmakers fear the columns).

**Player-facing:** The on-air-quote clipping, the letters column, and — if your man was on television that year — a writer phoning to ask whether the sport can be defended. Your answer is a choice: defend it (gym reputation +2 with the trade, one hostile letter to the gym) or decline comment (nothing).

### The Tuesday Habit

*`fights-on-tuesday` · window: Launches 1982-1985 (seeded); runs into the late 90s · analog of: USA's Tuesday Night Fights (1982-98) — cable's weekly series as the new club circuit · from: Boxing Historian*

**Lead's edit:** Absorb cable-money's weeknight-series loss-tolerance (a great losing effort can gain rep) and unify its matchmaker with the grown-up matchmakers-apprentice NPC.

**Beats:**
- A basic-cable channel launches a weekly Tuesday fight series from small arenas and casino ballrooms — modest money, national reach
- It becomes the proving ground the dying club circuit used to be: matchmakers watch it, rankings respond to it, and a good Tuesday war can make a career
- Its matchmaker — a persistent generated character — becomes one of the most quietly powerful men in the sport
- When it finally goes off the air in the late 90s, the paper's obituary for it reads like the club-circuit elegies of fifteen years before: the sport keeps killing its own farm system

**World effects:**
- New standing offer tier: the Tuesday date — purse x1.5-2 club equivalent, reachable at publicReputation>=30, available roughly monthly somewhere in the world
- This is the era's designed answer to club-circuit-withers for the player: a functioning ladder rung between the dead armory and the unreachable cable tier
- Exciting fights on the series grant +6-8 publicReputation; dull ones grant +1 and a cooldown — the series wants action and the incentive is explicit in the offers
- The series matchmaker is a repeatable relationship: deliver him action fighters over the years and offer frequency for the whole gym improves

**Player-facing:** The first Tuesday offer's pitch names the reality: 'It's not the Garden, but it's four hundred thousand living rooms'; the series becomes the workhorse of a mid-tier gym's economy for a decade — and its cancellation clipping in the late 90s should genuinely frighten a player who built on it

### A Belt for Every Suitcase

*`alphabet-soup-complete` · window: Third body 1983-1986; a fourth 1988-1991 (each seeded); by 1992 'undisputed' is nearly extinct · analog of: IBF (1983) and WBO (1988) completing the four-belt fragmentation · from: Boxing Historian*

**Lead's edit:** Absorb belt-inflation's per-body rankings (a fighter holds 1-4 rankings, each invoiced separately) and unification's double-swing prestige.

**Beats:**
- A third federation launches from a U.S. state athletic office, then a fourth from overseas; each crowns full slates of champions within 18 months
- By the late 80s the game's five divisions hold 12-15 simultaneous 'world champions'; the magazine's editor writes an annual column counting them the way other men count national debts
- Interim titles, super champions, and champions 'in recess' appear — the vocabulary itself becomes a joke the paper is in on
- Unification fights become the rare prestige events precisely because the alphabet made them scarce

**World effects:**
- 3-4 title claims per division in world state; per-belt championship purse multiplier settles at x4 (versus x8 for the unified crown of 1975)
- Fringe-body title shots become genuinely accessible: a player fighter at nationalRank 8-15 can receive one — the shot is real, the glory is discounted (title win grants +15 publicReputation versus +35 for the historic lineage belt)
- Sanctioning fees stack per belt in unification fights — the paperwork cost of glory rises with the glory
- The magazine maintains its own single lineal ranking — the save's persistent measuring stick against which the alphabet is judged

**Player-facing:** The fourth body's launch clipping is openly comic in the paper's dry voice; when the player's fighter is offered a fringe belt, the pitch on the phone oversells it and the press coverage afterward undersells it — the gap IS the design

*Absorbs: `belt-inflation`*

### The Home-Soil Harvest

*`olympic-class-84` · window: 1984 fixed (home Olympics); signings and debuts through 1985; NOTE: 1980 fires a small counter-beat — a boycott strands a class of amateurs who turn pro unknown and angry · analog of: The 1984 LA team (9 golds) turning pro with record contracts; the 1980 Moscow boycott class as its shadow · from: Boxing Historian*

**Beats:**
- 1980 first: a boycott keeps the amateur class home from the Games; a handful of should-have-been stars turn pro without the medal or the money — several are generated with chip_on_shoulder, and the magazine tracks them as the 'stolen class'
- 1984: home-soil Games produce the deepest medal class ever; the biggest names sign with networks and casinos for signing bonuses the paper prints in disbelief
- The class's stars get built on television at a forced-march pace: title shots inside 15 fights
- At least one 84 star and one stolen-class veteran eventually meet — the era writes its own grudge fight

**World effects:**
- 1984 injects 4-6 WorldFighters with publicReputation 65-80 at zero pro fights, weighted toward the lighter divisions — feeding the later lighter-weight ascendancy
- The stolen class of 1980 injects 3-4 high-rating LOW-reputation fighters — dangerous, avoided, underpaid: exactly the opponents matchmakers feed to prospects, and exactly the fighters a sharp player gym could sign or match against
- Amateur pedigree becomes a permanent pricing input: Olympic-medal WorldFighters command purse premiums their records don't justify — and the gap is visible in the offers

**Player-facing:** A summer of Games clippings with a hometown angle if the player's city produced a medalist; arms the decorated-amateur-at-the-door triggered event; a rumor item notes what the gold medalist's DEBUT paid versus what your main-eventer made last month

### The Kid From the Reform School

*`teen-wrecking-ball-rise` · window: Pro debut 1984-1986 (seeded); the streak runs 18-24 months · analog of: Tyson's rise — 15 fights in year one, the knockout reel, the old trainer who dies before the coronation · from: Boxing Historian*

**Lead's edit:** Absorb young-destroyer's sparring-partner contract offer (camp work for a player heavyweight with a chin) and its walk-in surge of big kids throwing the right hand first.

**Beats:**
- An 18-year-old heavyweight — squat, terrifying hand speed, a reform-school biography the press cannot resist — debuts under an old-school trainer of the classic peek-a-boo lineage
- He fights monthly, a pace nobody has kept since the 40s; the knockouts get shorter as the opponents get better
- The old trainer — the only voice he listens to — dies before the title shot; the paper marks it as the hinge of the story it will later prove to be
- The buzz becomes national before he is ranked: highlight clips run on the evening news, not the sports segment

**World effects:**
- A generated heavyweight with outlier power/speed and hidden hot_tempered + insecure traits (the implosion is seeded in his generation, not scripted ad hoc)
- Heavyweight era purse multiplier climbs back from x0.9 toward x1.5 as he rises — the division's pulse returns
- His monthly schedule floods the undercard economy: 6-10 dated cards over two years, each with undercard slots player heavyweights and light-heavies can be offered
- Opponents who last rounds with him gain survival-reputation — a new clipping flavor ('lasted into the fourth, and proud of it')

**Player-facing:** First a small prospect-notice clipping any attentive player will remember later; then escalating coverage; player heavyweights start getting asked about him by the paper; an offer to be ON one of his undercards — or, for a brave player with a ranked heavyweight, eventually IN one — is the era's defining phone call

*Absorbs: `young-destroyer`*

### All the Belts on One Nightstand

*`teen-unification` · window: Title 1986-87; full unification by 1988-89 (compressed sequence, seeded) · analog of: Tyson unifying WBC/WBA/IBF 1986-88 — youngest heavyweight champion ever, the 91-second title defense · from: Boxing Historian*

**Lead's edit:** Strip the electric-hair identifier — the predatory promoter is an archetype (honeyed, litigious, everywhere) with a per-save generated name and look.

**Beats:**
- He takes his first belt at 20 — youngest heavyweight champion in the record book, and the record book is quoted in every clipping
- A unification series against the other claim-holders follows inside 18 months; one defense lasts 91 seconds and the paper prints the timeline of the evening minute by minute to fill the column
- For one moment the alphabet soup is beaten: ONE heavyweight champion, undisputed, and the word matters again
- Around him the money men circle — his old management dies/departs and a flamboyant promoter with electric hair takes the whole operation; the clippings' tone about his camp turns quietly ominous

**World effects:**
- Heavyweight purse multiplier peaks at x2.0 — the biggest numbers of the save so far print in his settlements
- 'Undisputed' demonstrates its market value: his PPV/site-fee references become the scale every later negotiation quotes
- His title-fight cards are the era's premium undercard market for player fighters (desert venues, x2-3 undercard purses)
- The unification collapses 3-4 title claims into 1, briefly simplifying the rankings page before the alphabet refills the vacancies with interim champions

**Player-facing:** Front pages, and the specific texture of the 91-second defense clipping — the paper's dry voice at its best; the promoter-with-electric-hair becomes a recurring byline presence whose calls to the player (if the player has ranked heavyweights) are honeyed and dangerous

### The Tabloid Turn

*`tabloid-turn` · window: 1986-1990 (ramps; permanent) · analog of: Late-80s tabloid-era fight coverage — the personality replaces the fight; arrests, entourages, and marriages get more column inches than the boxing (the Tyson-coverage model). · from: Retired boxing journalist*

**Beats:**
- A new kind of item appears in the paper: a ranked fighter's nightclub incident runs bigger than his title defense.
- The Monthly adds a front-of-book gossip page ('Between Rounds') with its own template pool.
- Writers begin calling gyms asking about fighters' private lives; the first time it happens to the player is a scripted phone call.
- An old byline (or the Monthly's lead columnist) publishes the era's defining lament: 'We used to cover fights. Now we cover fighters, and only the parts that bleed outside the ring.'

**World effects:**
- Trait-driven press exposure activates at rep >= 40 (was 55): hot_tempered, reckless_brave, and comfort_seeker fighters generate press incidents at double rate — each incident is publicReputation +3 (fame) but morale/trust consequences per the event.
- Scandal downside doubles: any negative life event that makes print costs 2x the rep it would have cost pre-1986.
- Fame economics: publicReputation now feeds purse size more steeply (name multiplier in purse calc strengthened ~30%) — notoriety literally pays, which is the era's trap.
- family_man and quiet fighters get a compensating niche: the 'last decent man in boxing' feature (see triggered events) becomes more valuable, +50% rep effect in this era.

**Player-facing:** The gossip-page clippings, the intrusive phone call (choice: give the writer something harmless / hang up — hang up seeds a cold byline who covers your gym 20% less favorably for 2 years), the lament column.

### What the Game Takes

*`what-the-game-takes` · window: 1986-1990 (seeded per save) · analog of: The late-80s punch-drunk reckoning — a beloved retired champion's visible decline making dementia pugilistica a public story · from: Retired fighter*

**Beats:**
- A retired champion everyone loved appears at a televised tribute and can barely say his own name. The footage runs everywhere.
- A newspaper series follows: old fighters found in rooming houses, men who made fortunes counting out their days broke and foggy. Pulitzer talk.
- Commissions add neurological screening to license renewals for fighters over 32.
- For a while, every mother in America has an opinion about her son coming to your gym.

**World effects:**
- Annual license physical for roster fighters age>=32: a failing result forces retirement (world fighters churn on the same rule)
- Walk-in rate dips ~15% for a year (the mothers); rebounds with a skew toward kids with nothing to lose
- family_man fighters age>=30 get retirement-pressure events at 2x weight
- Opens the 'benefit night' triggered event (below) and gives it press coverage worth gym reputation

**Player-facing:** The tribute clipping is unavoidable. Letters arrive: one from a fighter's wife, one from the commission with a screening date. The gym log notes which of your old-timers watched the footage and which one turned the television off.

### Free Television Hangs Up

*`networks-abandon-ship` · window: 1986-1992 rolling (each network exits in a seeded year) · analog of: The broadcast networks abandoning boxing in the late 80s — the sport trading reach for money · from: Boxing Historian*

**Beats:**
- One by one the networks stop buying fights: the ratings are fine but the sport's stars are all under exclusive cable and PPV contracts, and what's left isn't worth the trouble
- The weekend-afternoon fight, a fixture since the 70s boom, disappears; a generation of casual fans simply loses the habit
- The magazine's circulation peaks and begins its long decline in the same years — the paper notes its rival's troubles with unseemly relish
- Boxing becomes a sport you must pay to see, and the consequences compound for decades

**World effects:**
- The network-date offer tier is REMOVED from the pool — the mid-level reputation ladder loses its best rung
- New-fighter publicReputation growth rates drop ~30% era-wide: without free TV, nobody gets famous by accident anymore
- The cable weekly series (fights-on-tuesday) becomes the ONLY televised path below stardom — its gatekeepers gain power accordingly
- Walk-in quality at boxing gyms subtly declines through the 90s (the sport's visibility feeds the pipeline) — a slow pressure on the player's recruiting

**Player-facing:** No single dramatic clipping — the design is absence: the TV listings item the paper used to run stops appearing, and one rumor-column line marks it ('No fights on the networks this fall for the first autumn since anyone can remember'); the player feels it as vanished offer flavor

### The Fight Comes to the Living Room

*`ppv-in-the-home` · window: 1988-1991 (first big-fight PPV seeded); closed-circuit theatres extinct within 3 years of it · analog of: The shift from closed-circuit to residential pay-per-view (Tyson-Spinks 1988 through the early-90s PPV standard) · from: Boxing Historian*

**Lead's edit:** Take ppv-arrives' two-column contract (GUARANTEE / UPSIDE) as the surfacing for percentage offers.

**Beats:**
- A heavyweight superfight is offered directly into homes for a fee, through the cable box — the buy figures make the front page of the business section, a first
- Within three years the closed-circuit theatre — the sport's cathedral since the 50s — is dead; the paper runs an elegy for the local house that showed every big fight since the poet-king was young
- PPV percentage points replace flat purses in top-fight negotiations: the biggest fighters become business partners, and their purses detach from everything below them
- The gap between the sport's top 20 and everyone else becomes a canyon: the era of the middle class of boxing ends

**World effects:**
- Top-tier purses inflate x3-5 above trend for reputation>=80 fighters; ALL other tiers stagnate — the save's income curve visibly bends into winner-take-all
- Closed-circuit venue references removed from the world; the theatre-hosting income option (triggered event fight-night-at-the-bijou) dies permanently
- PPV points appear in top offers: a percentage upside/downside on buy performance — the first player income with variance attached
- Undercard slots on PPV cards pay well but exist to fill air: reputation gain from PPV undercards is HALVED (nobody's watching the prelims at home)

**Player-facing:** The buy-figure clippings; the theatre elegy; and the ledger's quiet testimony — a player gym that hasn't pushed someone toward the top 20 by now watches the sport's money recede toward a horizon it can see and not reach

*Absorbs: `ppv-arrives`*

### The Fall Is Longer Than the Rise

*`teen-implosion` · window: Upset loss 1990 +/- 1 year; scandal and prison 1991-92; all seeded off his rise dates · analog of: Tyson: the Tokyo upset to a 40-1 shot, the collapse of the camp, the conviction · from: Boxing Historian*

**Lead's edit:** Do not script the conviction's nature or the scandal specifics — the unraveling is composed from generated clippings; only the arc shape (upset, collapse, prison, countdown) is seeded.

**Beats:**
- Defending in a foreign ring against a 40-1 opponent fighting the night of his life, the wrecking ball — bloated, distracted, cornered by yes-men since the old trainer died — is knocked out; the paper's account reads like a report of a natural disaster
- The undisputed crown shatters back into the alphabet within a year (vacations, strippings, interim champions)
- His life outside the ring unravels in clippings: entourage lawsuits, a divorce, and finally a conviction that sends him to prison mid-career
- The 40-1 winner loses the title in his first defense and is never the same — the paper notes that some men's whole purpose is one night

**World effects:**
- Heavyweight titles refragment to 3+ claims; heavyweight purse multiplier crashes from x2.0 to x1.1 within 18 months
- His generated traits (hot_tempered, insecure) are retroactively legible in every beat — the world's biggest demonstration that the game's trait system is destiny
- The upset winner gets the full reputation-is-rented treatment: +45 publicReputation, then -4/month decay after losing the belt
- Undercard/attention economy attached to his cards vanishes — player fighters who rode that tide feel the ebb in offer flow

**Player-facing:** The upset arrives as the save's single most stunning clipping (the paper holds the front page); the slow-motion scandal coverage runs for two years; his prison sentence sets a countdown the whole sport — and the player — can feel ticking toward the 90s circus

### The Old Man and the Right Hand

*`old-lion-miracle` · window: Comeback begins 1990-92; the miracle night 1993-95 (seeded) · analog of: George Foreman — the 45-year-old former champion regaining the heavyweight title (Nov 1994) · from: Boxing Historian*

**Lead's edit:** Generate the elder's civilian second life per save (preacher, publican, pitchman) instead of fixing the biography; keep the one-time reversed-decline modeling era-flagged.

**Beats:**
- A heavyweight champion of the poet-king's era — retired 15+ years, now a preacher with a famous appetite — comes back at 40+, fat and cheerful and selling more tickets than men half his age
- The press covers it as a joke for two years; the joke keeps winning (nobody had noticed the right hand never left)
- At 45 he knocks out the reigning champion with one punch in the tenth, wearing the same trunks he lost in twenty years before — the single most sentimental clipping the save will ever print
- He milks the reign shamelessly, defends selectively, and retires rich, beloved, and smiling

**World effects:**
- The retirement wall becomes officially breachable: retired WorldFighters with publicReputation>70 can return, and the world's aging model must show his decline REVERSED partially by layoff (fresh tissue, old reflexes) — one modeled exception, era-flagged
- His comeback fights are big-purse events that briefly re-inflate heavyweight interest between the implosion and the circus
- Directly arms the player-side comeback-itch event with an irresistible precedent: 'HE did it' is now in every old fighter's mouth
- Age-40+ licensing scrutiny appears: comebacks now carry a commission-physical event step

**Player-facing:** Two years of comic-then-astonished clippings climaxing in the sentimental front page; every retired fighter in the player's orbit gets one gym-log line reacting to it; the phone starts ringing for the player's OWN retired names if any were ever ranked

### The Kid With the Television Smile

*`olympic-class-92-golden-boy` · window: 1992 Olympics fixed; stardom 1994-1997; first mega-PPV below middleweight 1996-97 (seeded) · analog of: Oscar De La Hoya — the 1992 gold medalist who made the lighter weights boxing's box office · from: Boxing Historian*

**Lead's edit:** Generate his human hook per save (the promise, the face, the hometown) rather than scripting the dead-mother biography.

**Beats:**
- A lightweight gold medalist with a dead mother's promise, a movie face, and a promotional machine turns pro to network-special fanfare — the game generates him into the lightweight/welterweight lane
- He sells out arenas in his hometown market immediately; the paper notes, with anthropological fascination, the number of women at the fights
- He climbs through two divisions collecting alphabet belts and dance partners: the aging legends of the 80s lighter-weight generation line up for their richest-ever paydays against him
- By the late 90s his PPV numbers beat the heavyweights': the sport's economic center of gravity has formally moved down in weight

**World effects:**
- Lightweight/welterweight era purse multipliers climb to x1.6-1.8 by the late 90s while heavyweight sags — a full inversion of 1975's hierarchy
- Crossover appeal becomes a modeled quality: fighters with showman-archetype styles and high publicReputation draw offers disproportionate to rank
- His climb generates rich 'legend's last payday' fights — aging 80s stars get one seeded big-money bout each against him
- Player fighters in the lighter divisions get the era tide the four kings once gave middleweights: offer frequency +25%, TV interest reaching down to publicReputation>=50

**Player-facing:** The Games clippings, then the debut hype the paper is half-embarrassed by; if the player's gym has a good lightweight or welterweight in the mid-90s, the offers audibly warm up — and an eliminator toward HIS orbit is the richest path in the endgame decade

### The Circus Comes Back to Town

*`nineties-heavyweight-circus` · window: 1995-1999 (comeback tour seeded to prison-release date; the disgrace fight 1996-98) · analog of: Tyson's comeback era — the mismatch paydays, the Holyfield fights, the ear bite, the revoked license · from: Boxing Historian*

**Lead's edit:** The grotesque disgrace foul is generated per save (never scripted as an ear); the license-revocation mechanism and era hangover stay as written.

**Beats:**
- Released, the wrecking ball returns to the richest schedule of mismatches ever assembled: PPV records against opponents the paper refuses to rank, and the public pays anyway
- He regains alphabet belts without beating anyone the magazine's lineal rankings respect; the alphabet's absurdity peaks here (a title stripped by fax is a seeded clipping)
- A genuine rival — a pious, granite-chinned survivor of his own generation who never got the credit (lionheart archetype) — beats him honestly; the rematch ends in disgrace when the wrecking ball, losing again, fouls so grotesquely (an ear, in the analog) the fight is stopped and his license revoked
- The paper's coverage completes the arc it began with a reform-school kid in 1985: the sport's greatest rise and its most complete self-destruction, one career

**World effects:**
- Heavyweight purses go bimodal: his cards break records (PPV x4) while the division's non-circus purses stagnate — spectacle economy fully detached from merit
- The disgrace fight: license revocation introduces commission discipline as a real world mechanism (suspensions now exist and can, rarely, touch player fighters who foul catastrophically)
- The pious rival's arc pays off the lionheart trait at world scale — hidden-trait vindication as front-page history
- After the disgrace, casual-fan interest metrics dip era-wide: late-90s offer quality softens for everyone, a hangover the player's books register

**Player-facing:** The comeback-tour purse figures land as obscene rumor items; the disgrace fight is a front page the paper writes in its flattest, most damning deadpan; player heavyweights near the top in this window can be offered circus money for circus roles — the purses are real and the press treats the takers accordingly

### The Little Men Own the Marquee

*`lighter-weights-inherit` · window: 1995-1999 consolidation (pound-for-pound era peaks; specific superfights seeded) · analog of: The late-90s lighter-weight ascendancy — Chávez's long reign ending, Whitaker's artistry, the golden boy's box office; pound-for-pound as the sport's real rankings · from: Boxing Historian*

**Beats:**
- The magazine's pound-for-pound list — once a parlor game — becomes the sport's true hierarchy, and its top five are all under 160 pounds
- A long-reigning lighter-weight god of the 80s (90+ fight record, a nation's flag on his trunks) finally ages into beatable, and his losing fights are national days of mourning somewhere
- A defensive genius the casual fan never loved is vindicated by the list even as promoters struggle to sell him — the paper runs the debate for years
- The decade closes with the sport's biggest purse belonging to a welterweight fight, a sentence that would have read as a typo in 1975

**World effects:**
- Permanent era rebalance: division purse multipliers close the 90s at lightweight x1.6 / welterweight x1.8 / middleweight x1.3 / heavyweight x1.1 — the mirror image of the save's opening state
- Pound-for-pound list joins the magazine's furniture: a cross-division publicReputation leaderboard player fighters can crack, with offer-quality bonuses for appearing on it
- The aging lighter-weight god generates 2-3 seeded farewell fights, each a big-money opportunity slot for rising world or player fighters
- Skill-forward styles (high ringIq/defense/footwork) gain era reputation-growth parity with punchers for the first time — the Whitaker correction

**Player-facing:** The pound-for-pound column becomes a monthly clipping the player learns to read the way 1975's player read the ratings page; a player's great small fighter — unsellable in 1978 — is, by 1997, the most valuable thing a gym can own, and the offers finally say so

---

## Part II — The Triggered Event Database

Events that fire off your fighters — their personalities, records, and lives. Triggers reference live save data; frequency caps prevent repetition.

## Category: business (17 events)

### The Opponent Business

*`opponent-for-hire` · uncommon, repeatable (this was a living for hundreds of real men) · from: Boxing Historian*

**Trigger:** era>=1980 AND fighter has losses>=wins AND chin>=65 AND publicReputation<25 AND gym cash < 2 months' overhead

A matchmaker calls with short money and shorter notice: a casino undercard needs a durable body for a television prospect, ten days out. He says the word 'opponent' the way other men say 'furniture.' The purse is real and everyone on the phone knows what the night is for.

**Choices:**
- Take the fight (purse x1.5 the fighter's normal rate, opponent is a soft-favored TV prospect)
- Decline and keep his record honest

**Effects:**
- Take: guaranteed money into the ledger; likely L on his record; -4 morale if stopped; small chance (rating-based) of the historic upset — beating a TV prospect fires a big clipping, +15 publicReputation, and the prospect's promoter never calls again
- Take, and lionheart or chip_on_shoulder: +4 morale regardless of result — he knows what he was hired for and went anyway
- Decline: no cost, but this matchmaker's offer frequency to the gym drops for 6 months — the opponent circuit remembers who's available

**Lead's edit:** Absorb casino-b-side: a prospect-band variant (rep 15-45, record required) with the rematch-clause counter-offer; both variants share the matchmaker-remembers-refusals cost.

*Absorbs: `casino-b-side`*

### One Camera, One Chance

*`television-audition` · uncommon, once-per-fighter per era window · from: Boxing Historian*

**Trigger:** network-boxing-boom or fights-on-tuesday era active AND fighter publicReputation 35-55 AND (power>=70 OR reckless_brave trait) AND no losses in last 3 bouts

The television people want an audition — that's not the word they use, but it's the word. A six-rounder on the undercard of the broadcast, and if the fight is good, the fight after it happens on the air. 'Good' does not mean 'won.' Everyone understands this except, possibly, your fighter.

**Choices:**
- Take it and tell him to fight his fight
- Take it and tell him the truth — they're buying action, not wins
- Pass — he's not ready for what television does to a man's price

**Effects:**
- Exciting win (KO or high-action decision): next offer is a televised date, publicReputation +12, purse tier jumps permanently
- Dull win: W on the record, +2 reputation, and the television door closes for 12 months — the historically true heartbreak
- Tell him the truth + insecure trait: -6 morale going in (he hears 'you're not good enough, be entertaining instead'); + glory_hunter: +6 morale (lights, at last)
- Pass: nothing lost, but the gym log notes him reading the TV listings that Saturday

**Lead's edit:** Absorb the-camera-test's man-in-a-blazer scout scene as its arrival texture; drop that event's permanent +15% purse flag — television pay flows through reputation, not a flag.

*Absorbs: `the-camera-test`*

### A Letter With a Gold Seal

*`sanctioning-invoice` · common (fires reliably at rank), once per fighter per body · from: Boxing Historian*

**Trigger:** alphabet-fracture-one has fired AND player fighter enters any body's top 10 (nationalRank<=10)

A letter arrives on letterhead a shade too ornate, congratulating you on your fighter's rating and enclosing a schedule of fees: sanctioning, ratings maintenance, an invitation to the annual convention in a resort city. The percentage is small. The principle is enormous.

**Choices:**
- Pay the fees and stay rated
- Refuse on principle

**Effects:**
- Pay: recurring ledger line (2-3% of ranked-bout purses); ranking preserved; mandatory-defense letters follow within the year
- Refuse: dropped from that body's ratings inside 2 issues of the magazine; title path through that belt closed until you relent; +6 morale to a chip_on_shoulder fighter who hears about it ('good'), -6 to a glory_hunter (you just narrowed his road to a belt)
- Either way: a dry rumor-column clipping about the body's convention expenses may run — the paper is on your side and it changes nothing

**Lead's edit:** Absorb ratings-assessment's haggle branch (pay 60%, ranking slips 1-2 places a year) and its refusal-hates-daylight press escape; fees recur quarterly per body.

*Absorbs: `ratings-assessment`*

### A Title, of a Kind

*`hollow-crown` · uncommon, once-per-fighter, late-80s onward · from: Boxing Historian*

**Trigger:** alphabet-soup-complete active (3+ bodies) AND player fighter nationalRank 8-15 AND publicReputation 40-60

A federation you'd struggled to spell last year is offering your man a world-title fight — their world, their title — against a champion from a country the sport barely covers, in a casino ballroom, for real money. The belt is genuine leather. The magazine will put the word champion in quotation marks.

**Choices:**
- Take the shot — a belt is a belt on a poster
- Hold out for a real ranking fight

**Effects:**
- Take + win: 'world champion' enters his record and press treatment; publicReputation +15 (not +35 — the discount IS the history); purse tier up; sanctioning fees now stack; the magazine's dry clipping about quotation marks runs regardless
- Take + win + glory_hunter: +10 morale, but 6 months later a gym-log line shows him reading the LINEAL rankings — he knows
- Take + chip_on_shoulder: +8 morale either way; a strap someone sneers at is his favorite kind
- Hold out: nothing now; if he later cracks the lineal top 5 the paper remembers he waited ('never took the shortcut') — permanent +5 publicReputation rider on his eventual title coverage

### Fight Night at the Bijou

*`fight-night-at-the-bijou` · common in-era (2-3 chances/year), extinct after PPV arrives · from: Boxing Historian*

**Trigger:** closed-circuit era only (1975 until ppv-in-the-home fires) AND a poet-king/four-kings/unification superfight is 2-4 weeks out AND gym cash < 3 months' overhead OR player opts in via office

The manager of the movie house four blocks over wants to split the take on closed-circuit night — your gym's name on the marquee brings the boxing crowd, his theatre has the screen. Folding chairs, cigar smoke, and the biggest fight of the year piped in by wire.

**Choices:**
- Partner on the night
- Pass

**Effects:**
- Partner: one-time income scaled to the superfight's magnitude and your gym's local reputation ($150-900 in 1975 dollars, inflating); +5 morale gym-wide (the roster attends free, gym log covers the night); small gym-reputation gain in the neighborhood
- Partner during a fight that turns out to be a stinker (seeded outcome): the take halves and the gym log records the crowd's verdict in one line
- Pass: nothing — but the option itself DIES permanently when ppv-in-the-home fires, and the theatre's closure clipping will name the nights you shared or didn't
- This event is deliberately era-mortal: an income stream the timeline takes away, so the player FEELS the closed-circuit extinction in their own ledger

### The Network Likes the Zero

*`tv-clean-record` · uncommon, repeatable while eligible · from: Retired Promoter*

**Trigger:** network-fight-nights or cable-money (prestige tier) active + fighter losses = 0 + wins ≥ 6 + publicReputation ≥ 20

The television matchmaker wants your unbeaten kid for a date two months out — against an opponent of your choosing, he says, so long as the record stays pretty. He doesn't say 'stiff.' He says 'suitable.'

**Choices:**
- Feed him a suitable opponent (auto-generates a 'soft' bout at TV purse ×2.5)
- Match him honest (player picks a 'fair' offer from the pool at the same TV purse)
- Turn the date down

**Effects:**
- Suitable: near-certain win, purse ×2.5, publicReputation +5 — but a beat writer keeps a private 'protected' tally; at 3 protected TV wins, a column runs ('Who Has He Fought?'), publicReputation −8 and future reputation gains ×0.8 until he beats a 'fair' or 'reach' opponent
- Honest: fair bout at ×2.5; a win pays publicReputation +9 and the writer's respect (one-time +3, clears any protected tally)
- Decline: no cost; if the fighter is glory_hunter, morale +4 (he'd rather earn it) — if comfort_seeker, morale −4

### The Man Wants to Buy Your Man

*`contract-buyout` · rare, once per fighter · from: Retired Promoter*

**Trigger:** fighter publicReputation ≥ 55 OR nationally ranked + gym reputation below 'established' tier (the big fish circles small ponds)

A promoter you know by reputation — everyone does — invites you to lunch you didn't ask for. He wants your contender outright: a check for you, a signing bonus for the kid, and his machine behind the career. 'You've done fine work,' he says, the way a man compliments a house he's about to buy.

**Choices:**
- Sell (fighter leaves roster)
- Refuse politely
- Refuse and let the paper know he came sniffing

**Effects:**
- Sell: cash = $4,000 base-1975 × (publicReputation/50), inflated — the biggest single check available before a champion; fighter leaves, continues in world-sim under the promoter's banner (his clippings keep coming, a permanent might-have-been); every roster fighter with trust < 50 loses 8 more (they saw you sell a man); gym log goes quiet for a week
- Refuse: fighter trust +10 if he learns of it (60% chance he does); the promoter's venues (2 casino names) stop offering that fighter dates for 24 months — the freeze-out is real and typed nowhere
- Refuse loudly: fighter trust +12, gym reputation +small, clipping runs — but the promoter's freeze-out extends to your whole roster for 12 months

### The Shot Comes With Strings

*`options-for-the-shot` · rare, once per title opportunity · from: Retired Promoter*

**Trigger:** fighter nationally ranked top-10 + a champion in his division controlled by a promoter NPC (world-sim affiliation)

The title shot is available. The contract is eleven pages, and page nine is the one that matters: options on your man's next three fights, win or lose, at purses the champion's promoter sets. Sign it and the shot is real. Don't and the champion stays busy elsewhere — the rankings are patient and your fighter isn't.

**Choices:**
- Sign the options (book the title fight)
- Hold out for a purse bid / cleaner deal
- Walk away from the shot

**Effects:**
- Sign: title fight books at ×4 current purse scale. If he WINS: the next 3 defenses pay ×0.6 of open-market value (the option tax, itemized on each purse sheet) and the promoter picks the opponents; if he LOSES: options usually go quietly unexercised — the machine only wants winners. Fighter learns the terms: trust −5 now, +15 if he wins the belt anyway
- Hold out: 6-12 month delay; 40% chance a cleaner shot materializes at ×3.5 (sanctioning politics from belt-inflation can force it); 35% chance the champion loses the belt or retires and the shot evaporates; fighter age ticks and if age ≥ 30, morale −10 during the wait
- Walk: nothing now; glory_hunter morale −15 and a real quit-risk conversation; the ranking decays 2 places over the next year without marquee wins

### An Arrangement

*`the-accommodation` · rare, at most twice per save · from: Retired Promoter*

**Trigger:** fighter age ≥ 29 + losses > wins + careerEarnings low for his age + a purse offer already on the table + gym cash < 3 months' overhead (it comes when you're weak)

A man you've seen at the weigh-ins — always at the edge of the photograph — catches you outside the gym. The purse for Tuesday could be four times bigger, he says, if your old-timer finds the canvas in the third and stays there. 'Nobody gets hurt. That's the whole point of it, friend. Nobody gets hurt.'

**Choices:**
- Throw him out
- Hear the number, then throw him out
- Take the arrangement

**Effects:**
- Throw him out: nothing visible. A ledger memory. Years later (if gym reputation ever crosses 'established'), an old beat writer's retrospective mentions the gym 'was never once mentioned in the wrong conversations' — permanent small reputation floor
- Hear the number: same as above, but the fixer marks you as reachable — the event can fire again in a future squeeze, and the second offer is bigger
- Take it: purse ×4. The fighter must be told: if lionheart or chip_on_shoulder or glory_hunter he REFUSES (trust craters −30, 50% he quits the gym and the story may surface). If he accepts (family_man + broke, or comfort_seeker, most likely): bout auto-resolves L/KO3, purse paid; his morale −20 and it never fully recovers (permanent baseline −5); 15% chance per subsequent year a commission investigator or writer resurfaces it — if it surfaces: license hearing, fine of the purse ×2 in that year's dollars, gym reputation −40%, every clean fighter with trust < 60 leaves

### A Piece of the Gate

*`percentage-or-flat` · uncommon, repeatable at main-event level · from: Retired Promoter*

**Trigger:** fighter publicReputation ≥ 60 + main-event offer at a casino or (post-ppv-arrives) PPV date

Two numbers on the contract, side by side. The guarantee, which is good. And the percentage, which is either half of that or three times it, depending on a snowstorm, the other guy's mouth, and whether the town shows up. The promoter slides it across like it's nothing. It is not nothing.

**Choices:**
- Take the flat guarantee
- Take the smaller guarantee plus percentage

**Effects:**
- Flat: purse as offered, done
- Percentage: guarantee ×0.5 up front; resolve multiplier from (combined publicReputation of both men /100) × era term × hype roll 0.6-1.8; final take ranges ×0.5 to ×4 of the flat number. A KO win in a percentage fight adds +4 extra publicReputation (the business notices a man who bets on himself and cashes); a dull decision in an empty house prints a brutal clipping

### Promote It Yourself

*`hometown-ballpark` · rare, once or twice per save · from: Retired Promoter*

**Trigger:** fighter is a champion OR ranked top-3 + fighter homeCityId = gym city + gym reputation 'established' tier

The ballpark's general manager calls YOU for once. The champ defending at home, under the lights, twenty thousand seats — but nobody's putting up the money except the man in your mirror. Site rental, undercard, insurance, the sanctioning invoice. You'd be the promoter of record. Everything the last thirty years taught you says don't. Everything else says this is the whole point.

**Choices:**
- Promote it (stake gym cash: $8,000 base-1975, inflated)
- Sell the fight to a real promoter instead (safe purse)
- Pass

**Effects:**
- Promote: outcome = base gate × weather roll (0.7-1.15) × combined reputation term × win/loss of the bout itself. Range: lose a third of the stake to clearing ×3. A WIN at home: fighter morale +20, permanent trust +10, gym reputation jumps a tier step, a full-page clipping, and a framed fight bill appears in the office forever; a LOSS at home still sells tickets but the paper is unkind. Rain plus a loss is the worst financial night available in the game
- Sell: standard title purse ×1.2 (hometown premium), no risk, no fight bill on the wall
- Pass: glory_hunter or chip_on_shoulder fighter morale −10; the GM books a concert instead and the clipping mentions it

### The Kid With the Notebook

*`matchmakers-apprentice` · once per save (the relationship itself is permanent) · from: Retired Promoter*

**Trigger:** gym has ≥ 2 fighters with bout records + gym reputation still small + year ≤ 1980 (he has to start young to grow old with you)

A matchmaker's assistant, maybe twenty-five, calls with a four-rounder that pays fair and matches honest. No angle you can find. When you take it and don't complain about the dressing room, he calls again the next month. Some men in this business you grow with.

**Choices:**
- Take his fights when they're right (relationship builds passively)
- Squeeze him on a purse once (test the relationship)

**Effects:**
- Build: a hidden relationship counter rises each honest booking completed without a purse dispute. At counter ≥ 5: his offers arrive 20% above pool frequency and always 'fair' risk with accurate pitches. When cable-money fires, he surfaces as the weeknight-series matchmaker — your gym gets first call on the era's best working-fighter dates, worth years of steady purses. If a fighter of yours is ever stranded by a bounced-check event, he covers the date within 30 days
- Squeeze: one-time +15% on that purse; counter resets to zero and caps at 3 forever ('he pays now, but he remembers'); the cable-era first-call never happens

### The Purse That Wasn't There

*`bounced-check` · rare, repeatable · from: Retired Promoter*

**Trigger:** purse ≥ $800 base-1975 (inflated) + promoter is small/unflagged OR the tournament-scandal 'crooked' NPC (20% chance on his offers)

The fight happened. The check didn't clear. The promoter's office phone rings eight times and then it doesn't ring at all — disconnected Thursday. Your fighter fought six hard rounds for a piece of paper.

**Choices:**
- Eat it and pay the fighter's share from gym cash
- Eat it together (fighter takes the loss too)
- Lawyer and commission complaint

**Effects:**
- Pay him yourself: gym cash −(fighter's 50% share); fighter trust +12 permanent ('he paid me out of his own pocket' — travels through the grapevine, all roster trust +3); the debt is memorialized in the ledger
- Share the loss: fighter morale −15, trust −10; family_man or broke fighters −5 further; possible quit-risk if trust was already low
- Lawyer: costs $150 base-1975 (inflated), 6-month process; 55% recovers the full purse plus the story printing as a clipping (gym reputation +small, 'a manager who collects'); 45% recovers nothing and the fee is gone

### Selling Your Own Tickets

*`paper-the-house` · common in the first era, once per fighter's early career; extinct after club-show-collapse completes · from: Retired Promoter*

**Trigger:** fighter record ≤ 4 fights + club-show offer in home city + pre-club-show-collapse era (this is how it actually worked)

The club promoter's terms come with a rubber band around them: fifty tickets at four dollars. Your kid fights if the tickets move. 'He's got a neighborhood, don't he?' the promoter says. Every four-round fighter in America is also a ticket salesman, and now so are you.

**Choices:**
- Take the tickets and hustle them (fighter sells)
- Buy the allotment yourself
- Refuse the terms

**Effects:**
- Hustle: success scales with fighter's publicReputation + chip_on_shoulder/family_man bonus (neighborhood roots) — full sale nets the purse plus $40 walking-around money and morale +6 ('the whole block was there'); a failed sale (reputation < 8, insecure trait) cuts the purse 40% and morale −8
- Buy them: gym cash −$200 base-1975 (inflated), purse intact, fight proceeds; a quiet trust +4 (he knows)
- Refuse: offer lost; club promoters in the city tag the gym 'difficult' for 6 months (−15% novice offer frequency)

### Ten Days' Notice

*`short-notice-call` · uncommon, repeatable · from: Retired Promoter*

**Trigger:** a TV-era active + fighter not booked + restUntil passed + record ≥ 10 fights + morale ≥ 40 (they call men who are in the gym)

The phone at 11 p.m., which is never good news or is the best news: the co-feature fell out, the date is in ten days, and the purse is double because everyone else already said no. The opponent is better than anything your man has seen. That's why the purse is double.

**Choices:**
- Take it
- Take it, but negotiate a no-cut clause (purse ×1.7 instead of ×2)
- Let it go

**Effects:**
- Take: bout books in 10 days at ×2 purse against a 'reach'-window opponent; conditionOf capped at 0.78 (no camp); a WIN here is the single biggest reputation event below a title (+16, 'the kid who said yes') and TV matchmakers flag him 'reliable' (+1 TV offer frequency permanently); a bad KO loss on short notice: normal damage +ring-tragedy-era scrutiny if active
- No-cut: same but a stoppage-on-cuts converts to a technical draw (protects the record at a price)
- Pass: no penalty — but if the fighter is reckless_brave or glory_hunter and hears about it (50%): morale −8 and one gym-log line of him hitting the bag after hours

### The Casino Wants Him Steady

*`house-fighter-retainer` · rare, once per eligible fighter · from: Retired Promoter*

**Trigger:** desert-money era + fighter wins ≥ 12 + publicReputation 40-65 + crowd-pleasing profile (kos/wins ≥ 0.5 OR showman/pressure style)

The casino's entertainment director offers a retainer: four fights a year on their cards, guaranteed money, his face on the little easel by the sports book. The catch is in the passive voice: opponents 'will be arranged.' Your man becomes furniture — well-paid, well-lit furniture.

**Choices:**
- Sign the retainer (2 years)
- Decline and stay independent

**Effects:**
- Sign: 4 guaranteed bouts/year at ×1.8 club scale each, paid even if a date scratches; opponents chosen by the house — mostly 'soft,' occasionally a 'reach' when they need him to lose to a rising name (1 in 6, unannounced); publicReputation gains capped at +3 per win (beating arranged men impresses nobody); comfort_seeker fighter: morale +10 and training effort sags; glory_hunter: morale −6 per soft bout, will eventually demand out (trust −10 if refused)
- Decline: normal offer flow continues; the entertainment director shrugs — no freeze-out, casinos are businesslike about no

### The Medalist Comes to Town

*`olympic-kid-auction` · every Olympic cycle, one kid per cycle · from: Retired Promoter*

**Trigger:** Olympic-summer years (1976, 1980, 1984, 1988, 1992...) + gym reputation ≥ regional tier + gym cash ≥ $1,000 base-1975 (inflated)

The Games end and the amateurs turn over. One of them — a medal, a smile the cameras liked — is touring gyms with his father and a lawyer. Every promoter in the country has already mailed the family something. Yours is the smallest operation on the list, which is either an insult or the only honest option he's got.

**Choices:**
- Bid for him: signing money ($1,500 base-1975, inflated) + a locker + a focused-training slot promised
- Court him cheap: no money, just the pitch (gym's development record does the talking)
- Stay out of it

**Effects:**
- Bid: 35% he signs (higher if gym has produced a ranked fighter — the record is the pitch); arrives as a generated fighter with quality ≥ 0.75, publicReputation 25 (a known amateur), and a hidden trait rolled normally — medals don't tell you who a man is; if outbid, money returned but the clipping notes your gym 'was in the conversation' (+small reputation)
- Court: 10% base, but 40% if any current roster fighter is ranked AND trusts you ≥ 70 (the kid calls him and asks what you're really like — the roster is the recruiter)
- Out: nothing; he signs with a promoter's stable and becomes a world-sim name you read about for a decade

## Category: era (2 events)

### The Champ Comes Through Town

*`the-great-mans-visit` · rare, once per save · from: Boxing Historian*

**Trigger:** during poet-king farewell window (1979-1982) OR his later ambassador years AND gym reputation quality >= 0.45 AND player city on his promotional tour (seeded)

No warning. A long car outside, and then the most famous face on earth is standing on your gym floor doing card tricks for your flyweights, talking that talk, older and slower than television lets on. He stays forty minutes. The gym will be retelling it for years.

**Effects:**
- +10 morale gym-wide, decays over a month
- glory_hunter fighters: additional +6 and a training-intensity bump for 6 weeks (the gym log shows them first through the door)
- A named clipping puts your gym in the paper; walk-in frequency +15% for 8 weeks
- In the LATER window (post-1984, his decline visible): the visit is quieter — the morale bonus halves, and the gym log line is one sentence about how his hands looked; family_man fighters -3 morale instead

### Men of the Fifteenth Round

*`fifteenth-round-men` · fires once, automatically, at the rule change · from: Boxing Historian*

**Trigger:** within 24 months AFTER ring-death-fifteen-rounds abolishes 15-round title fights AND player has a fighter age>=30 with stamina>=75 OR a coach whose generated background predates 1970

The twelve-round rule lands in the gym like a weather change. Your old campaigner built his whole style to own the championship rounds that no longer exist — and your oldest coach says, to no one in particular, that they have finally made the marathon a sprint.

**Effects:**
- The high-stamina veteran: -6 morale (his edge was legislated away) and a gym-log line worth keeping; his effective rating in title-distance bouts loses the late-rounds bonus he used to enjoy
- Young high-speed fighters: gym log notes the opposite reaction — twelve rounds favors them, and they know it
- Old-school coach: one typed note left on your desk arguing the change, in character; no mechanical effect — pure period texture the paper's coverage corroborates
- This is the timeline's rule change made personal: the same clipping means opposite things at two lockers

**Lead's edit:** Gate on existing data only: veteran with stamina>=75 and age>=30; the old coach's typed note fires if any hired coach is old enough to remember fifteen.

## Category: fighter-life (30 events)

### A Week in the Desert

*`week-under-the-lights` · uncommon, repeatable — casinos never stop being casinos · from: Boxing Historian*

**Trigger:** fighter accepts a desert-city or boardwalk casino offer AND has comfort_seeker or unfocused trait (hidden traits count — this event can REVEAL them)

Fight week in a gambling town: the room is free, the food is free, the floor of the casino is between the elevator and everywhere else, and nothing in his life has prepared him for any of it. Your fighter has stopped answering the phone in his room by Wednesday.

**Choices:**
- Fly out early and sit on him yourself (costs travel money, pulls your focused-training attention for the week)
- Trust him and stay with the gym

**Effects:**
- Sit on him: fight proceeds at normal condition; +4 trust (he noticed you came); the trait, if hidden, is revealed to you quietly
- Trust him + comfort_seeker/unfocused: 50% he arrives at the weigh-in soft — stamina and speed effectively -10% for the bout, and if he loses, the press notes his condition (publicReputation -5 extra); if hidden, the trait reveals PUBLICLY, the worst way
- Trust him + neither trait actually present (you feared wrongly): no effect; gym log gives you one wry line about the minibar receipts being for orange juice

### Bad Company, Good Suits

*`the-powder-decade` · rare, once-per-fighter — the era's signature temptation · from: Boxing Historian*

**Trigger:** era 1980-1992 AND fighter received a purse >= 4x his previous best within last 6 months AND (comfort_seeker OR unfocused OR insecure trait) AND morale > 60

Success has introduced your fighter to a set of new friends with good suits and no visible employment. He's bought two cars. He's missed a Monday. The 1980s are doing to him what they are doing to half the sport, and the gym can smell it coming.

**Choices:**
- Confront him now, hard, in the office
- Put the word out quietly and watch
- His money, his life — stay out of it

**Effects:**
- Confront + trust>=55: he comes back to work; -5 morale short-term, +8 trust long-term; crisis averted (event chain ends)
- Confront + trust<55: -12 morale, -8 trust; 40% he drifts anyway — you had the fight without the standing to win it
- Watch: 60% he steadies on his own; 40% escalation — training effectiveness -20% for 3 months, attribute decay ticks early, and a police-blotter clipping risk that costs publicReputation -10 and fires a milestone ledger entry
- Stay out: escalation odds rise to 65%; if the worst happens the gym log line is about what you didn't do

### The Itch

*`comeback-itch` · rare, once per eligible retired fighter, 90s era · from: Boxing Historian*

**Trigger:** old-lion-miracle has fired AND a RETIRED former player fighter exists with peak nationalRank<=10 AND age 34-44 AND (glory_hunter OR chip_on_shoulder OR his post-boxing finances flagged poor)

He comes by the gym on a Tuesday, in a suit now, watching the heavy bags a little too long. The old preacher on television did it at forty-five, he says. He's not asking your permission. He's asking whether his locker is still his.

**Choices:**
- Train him — do it right if it's happening anyway
- Refuse and tell him why
- Refuse, but make some calls to keep promoters away from him (spend gym reputation)

**Effects:**
- Train him: he returns at reduced attributes (reflexes-first decline modeled honestly, chin often intact); comeback fights draw nostalgia purses (x1.5); every bout risks the sad-clipping outcome that echoes the poet-king coverage; if he wins a few, the paper's tone turns astonished and gym reputation rises
- Refuse: -15 trust with him (if still tracked), and 55% he signs elsewhere anyway — you read about his decline in another gym's corner, one clipping at a time; gym log marks the day each one runs
- Make calls: costs gym reputation standing with 2 promoters (offer frequency -10% for a year); 70% it works and he stays retired — years later, one line in the ledger says he thanked you
- family_man variant: his wife calls YOU first; handling it well is +trust with every family_man in the gym (word travels)

**Lead's edit:** Absorb comeback-collect-call: can fire rarely in any era 18+ months after retirement (at 2x weight with the 'HE did it' line post-miracle), and add its corner-work third choice — the best ending the event has.

*Absorbs: `comeback-collect-call`*

### Nothing, Just Banged It

*`hairline` · uncommon, repeatable (bad hands stay bad — second occurrence on the same fighter doubles the break chance) · from: Retired fighter*

**Trigger:** Fighter has booked fight within 21 days AND (reckless_brave OR lionheart OR chip_on_shoulder); rolled after a sparring-heavy week. Uncommon in that window.

Your cutman pulls you aside by the sink. The kid hurt his left hand Tuesday on a sparring partner's elbow and has been wrapping it himself before anyone gets in. He'll tell you it's nothing. It is not nothing.

**Choices:**
- Pull him from the bout — call the promoter, eat the date
- Get it looked at quietly ($40, inflated) and decide off the X-ray
- Let him fight — he says he can go

**Effects:**
- Pull: fight canceled, no purse, promoter offer frequency -20% for 90 days, fighter morale -12 (he wanted it), trust +6 (he knows what you did for him), restUntil +21
- X-ray: 50% it's a bruise (fight proceeds, no penalty, $40 spent); 50% hairline fracture — you choose again knowing the truth, and hiding a known break the commission would fail him for costs gym reputation if it comes out
- Fight: power and effective condition penalized in the bout; on any outcome, 40% the hand breaks fully — restUntil +75, power -1 permanent, milestone in the ledger; if he wins anyway and is lionheart, the trait reveals and publicReputation +4

### The Scale Don't Lie

*`the-scale-dont-lie` · common, repeatable (this is the comfort seeker's whole career) · from: Retired fighter*

**Trigger:** comfort_seeker AND no bout in 75+ days AND morale>60 AND hasLocker. Common among comfort seekers.

He came back from his layoff moving like a man carrying groceries. The scale in the corner says nine pounds over, and he laughs about it, which is the part that should worry you.

**Choices:**
- Hard camp — four weeks of roadwork before you'll book him
- Book him a fight anyway — a deadline is the only alarm clock he respects
- Move him up a weight class and stop fighting his appetite

**Effects:**
- Hard camp: weight returns, morale -10 during, stamina +1 at the end; delays any booking 28 days
- Book anyway: enters the bout with stamina and speed penalized ~10%; a loss this way is a lesson — morale -15 but the comfort_seeker pattern eases for 6 months (flag)
- Move up: weightClass recalculated; his speed edge shrinks against bigger men (effective rating -3) but the weight battles end; morale +8 — he's grateful even if he shouldn't be

### Twelve Guys Named Cousin

*`twelve-guys-named-cousin` · uncommon, once-per-fighter (the follow-up theft is its own roll) · from: Retired fighter*

**Trigger:** glory_hunter AND most recent purse >= $500 × inflationFactor(year) AND careerEarnings crossed that threshold for the first time. Once per fighter.

He won money and now he has friends. Four of them came to watch him train Thursday, one in a suit calling himself a business advisor. They laugh at everything he says. Nobody laughed at anything he said in February.

**Choices:**
- Bar them from the gym — training floor is for fighters
- Let them stay — it's his life and his money
- Talk to him alone about who was around before the money

**Effects:**
- Bar: morale -8, trust -5 short-term; training quality protected; 60 days later a gym-log line lands — he saw one of them wearing a jacket bought with his purse money, and trust +10, permanent
- Let stay: development drag (as unfocused) while entourage flag active; 25%/quarter one of them costs him — money gone from his cut, morale -12, entourage flag clears the hard way
- Talk: trust check — trust>=55 he hears you (entourage thins, flag clears, trust +4); trust<55 he hears jealousy (morale -6, flag persists)

**Lead's edit:** Absorb the-payday-item: the printed purse figure in the paper is how the cousins found him; carry its family_man envelope-home line and unfocused missed-days roll.

*Absorbs: `the-payday-item`*

### She Asked Me to Ask You

*`she-asked-me-to-ask-you` · uncommon, once-per-fighter · from: Retired fighter*

**Trigger:** family_man AND (age>=29 OR bouts.length>=18 OR lost last bout by KO/TKO). Uncommon.

His wife waited outside the gym until you locked up. She didn't raise her voice. She asked how many more fights, and whether you'd tell her the truth if you knew the answer.

**Choices:**
- Give her a real number and hold yourself to it
- Tell her that's between you and him
- Say what managers say — 'he's got plenty left' — whether or not it's true

**Effects:**
- Real number: a fight-count clock starts (e.g. 4 more); honoring it → he retires settled (morale 80 at exit, ledger milestone, gym reputation +2 'a straight-dealing house'); breaking it → trust -25, quit risk spikes, and she never waits outside again
- Between us: no clock; trust unchanged; his home-trouble life events fire at 2x weight from now on
- Managers' answer: morale +4 now; if he takes a beating in any later bout, trust -15 retroactive and a milestone: 'You told his wife he had plenty left.'

### The Doctor Said Stop

*`the-doctor-said-stop` · rare, repeatable until resolved · from: Retired fighter*

**Trigger:** (reckless_brave OR lionheart) AND age>=33 AND 3+ stoppage losses on record; fires at 2x weight after scripted event 'the-boy-who-died'. Rare.

The commission doctor took you into the hallway after the physical and said the word 'accumulation.' Your man was already re-wrapping his hands when you came back in. He said he feels great. He always says he feels great.

**Choices:**
- Retire him — take the gloves, keep the locker for a month, do it right
- Keep booking him — soft touches only, small rooms
- Send him for the full workup ($120, inflated) and let the paper decide

**Effects:**
- Retire: leaves roster with morale intact; ledger milestone; gym reputation +3 after 'the-boy-who-died' era (-1 before it — soft, some will say); opens 'old-head' coach-conversion event for him
- Keep booking: only soft offers generate; each further bout rolls +8% cumulative toward the 'the-fog' event firing on him; press begins asking why; gym reputation -2 per fight after the medical era begins
- Workup: 60% 'no fresh findings' — he fights on with your conscience half-clean and the roll above at +4%; 40% the paper says stop, and now refusing to retire him is a named decision the ledger remembers

**Lead's edit:** Absorb commission-flag: the specialist-clearance cost, the looser-state dodge with its two-strikes column, and the trait-branched retirement endings become this event's post-reform escalation.

*Absorbs: `commission-flag`*

### The Fog

*`the-fog` · rare, once-per-fighter escalating · from: Retired fighter*

**Trigger:** Fighter age>=34 AND 35+ total pro bouts (record + bouts.length) AND chin was ever below 55, OR accumulated via 'the-doctor-said-stop'. Rare; weight rises with each additional bout.

He called the double-end bag by the wrong name Tuesday. Wednesday he told the same story twice inside ten minutes, word for word, same laugh in the same place. The young ones didn't notice. You did.

**Choices:**
- Retire him today and say the words to his face
- One farewell fight in his hometown, then done
- Say nothing — maybe you imagined it

**Effects:**
- Retire: roster exit, morale 60 at departure (he half-knew), ledger milestone in full; unlocks 'benefit-night' later; roster-wide morale -4 for a week then a slow +6 — the gym respects it
- Farewell: a soft offer generates in his homeCityId at a warm purse; win or lose, he retires after with morale 85 and the paper writes something kind; 15% the farewell goes wrong (stopped late) and the ledger entry is one you re-read for years
- Say nothing: event refires within 6 months, worse — a lost bout where he held the ropes to find his corner; gym-wide morale -8, trust in you across the roster -4, gym reputation -3

### The Man in the Camel Coat

*`the-camel-coat` · uncommon, repeatable (broke fighters and easy money find each other) · from: Retired fighter*

**Trigger:** Fighter with baseDues==0 (broke) AND a booked fight with purse >= $300 × inflationFactor(year). Uncommon.

A man you've never seen sat in his car across from the gym for two days, then came in smiling like the landlord. Your fighter owes him $200 against a purse he hasn't earned yet, at arithmetic that would embarrass a casino.

**Choices:**
- Pay it off yourself and let the kid owe you instead
- Let the purse be garnished — he made the debt, he pays it
- Tell the camel coat to collect somewhere else

**Effects:**
- Pay: -$200 (inflated) from cash; trust +14, morale +8; a debt-to-you ledger line — 70% he repays from future purses, 30% he can't and never quite looks at you the same
- Garnish: fighter takes home a fraction of the purse; morale -14, and he enters the bout distracted (condition penalty); the camel coat comes back — this event repeats at 2x weight
- Run him off: 60% it works (trust +8, gym log: 'nobody parked across the street this week'); 40% your gym's windows meet a brick — $60 repairs, roster-wide morale -3, and the fighter's shame doubles: morale -10

### His Brother's in County

*`county-lockup` · rare, once-per-fighter · from: Retired fighter*

**Trigger:** (family_man OR chip_on_shoulder) AND careerEarnings > $400 × inflationFactor(year). Rare.

The phone rings at the gym because his mother doesn't have your home number. His brother is in county lockup and bail is $150. Your fighter is standing next to you while you hold the receiver, already reaching for his jacket.

**Choices:**
- Front the bail from gym cash
- Let him handle it from his own money
- Drive him down there yourself and sort it in person

**Effects:**
- Front it: -$150 (inflated); trust +12; 65% repaid within 3 months; family_man fighters gain a permanent +2 morale baseline in your gym — you showed up for his people
- His money: careerEarnings memory only, but he misses 4 days of camp; if a fight is within 14 days, condition penalty; morale -6 (not at you — at everything)
- Drive him: costs you a day (no other event that advance); trust +16, the strongest single trust gain in this list, because 62 fights taught me the corner that shows up at the jail is the corner that gets believed on the stool

### The Light Was On

*`two-a-m` · common for the trait, repeatable · from: Retired fighter*

**Trigger:** chip_on_shoulder AND lost last bout AND morale<40. Common for the trait.

You came by at seven and the heavy bag was still swinging. The night man says he's been in since two, working the same combination he got countered on Saturday, over and over, like he's arguing with it.

**Choices:**
- Sit with him — say nothing, hold the bag
- Send him home to sleep
- Leave him be and watch from the office

**Effects:**
- Sit: trust +10, morale recovers at 2x rate for two weeks; ringIq +1 (someone finally watched the counter with him); gym-log line the whole roster reads
- Send home: morale -4 (he hears 'stop caring'), but injury/overtraining risk cleared; trust unchanged — it was still you who came at seven
- Leave be: 70% he works it out alone — ringIq +1, morale recovers normally, self-made; 30% he grinds into a hole — stamina dips for a month, morale stays low

### The Quiet One

*`watercolors` · rare, once-per-fighter — joyful · from: Retired fighter*

**Trigger:** Fighter with NO hot_tempered, glory_hunter, or chip_on_shoulder among all traits; tenure > 180 days; hasLocker. Rare, once per fighter.

Cleaning behind the lockers you find a sketchbook: the ring from above, the old-timers on the apron, your own office door with the light on. He's been drawing the gym for a year. Every page is signed with just his initials, small, bottom corner.

**Choices:**
- Ask him about it
- Put it back exactly where it was

**Effects:**
- Ask: morale +10, trust +8; a drawing appears framed by the office door (permanent set dressing, ledger milestone); if his publicReputation later exceeds 40, the paper runs 'The Fighter Who Paints' — publicReputation +5, the rare clipping that makes a mother proud
- Put it back: nothing visible; a hidden +4 trust lands anyway two weeks later — he noticed the book had been moved and put back with care, and that told him everything he needed to know about you

### He Found Something Sunday

*`sawdust-trail` · uncommon, once-per-fighter (the follow-ups are the arc) · from: Retired fighter*

**Trigger:** Any fighter, morale<35 after a loss, tenure>90 days. Uncommon.

He lost bad two weeks ago and this Monday he came in different — calm, early, carrying a small Bible in his bag next to the wraps. He found a church Sunday, or it found him. Either way something in him stopped rattling.

**Effects:**
- morale +18, trust +5, immediately
- If unfocused: the discipline holds — missed-day life events suppressed for 6 months, development drag lifted
- If comfort_seeker: 50% the peace dulls the edge — a soft -1 effective aggression in his next bout ('he fights like a man who's already forgiven his opponent')
- Follow-up seeded: if he loses his NEXT bout, 40% a quiet crisis-of-faith gym-log line and morale -12 — and if he then wins the one after, it comes back deeper: morale baseline +3 permanent. Faith in a fighter is a road, not a switch

### A Letter With Far-Off Postage

*`letter-from-home` · common for out-of-town men, repeatable at long interval · from: Retired fighter*

**Trigger:** Fighter whose homeCityId != gym city, tenure > 150 days, morale<50. Common for transplants.

A letter came for him care of the gym, his mother's handwriting, and he read it three times sitting on the ring apron. He's been eating alone and calling long-distance on paydays. The city never did learn his name the way his block knew it.

**Choices:**
- Buy him a bus ticket home for a week ($35, inflated)
- Tell him homesick is part of the price — work through it
- Promise him a fight in his hometown and mean it

**Effects:**
- Bus ticket: 7 days off training; returns with morale +20 and something settled; trust +8; 10% he doesn't come back — his block reclaimed him, ledger departure, and honestly you'd rather lose a man that way than most ways
- Work through: quit risk +daily for 60 days; if he stays, chip_on_shoulder-style hardening — morale baseline -3 but a hidden +2 to how he handles hostile crowds
- Hometown fight: a flag on offer generation — next matchable offer sourced to his homeCityId's venues; when it lands he fights above himself (+condition) and the clipping runs in two cities; break the promise past 12 months and trust -18

### Saturday Night, Sunday Morning

*`saturday-in-the-tank` · common for the trait, repeatable · from: Retired fighter*

**Trigger:** hot_tempered AND (morale<45 OR lost last bout) — the trait's signature. Common; escalates the existing skinned-knuckles life event into a booking.

The precinct called at six Sunday morning, which is never a social call. Disorderly, one punch thrown at a man who by all accounts deserved half of it. Bail is $75 and arraignment is Tuesday.

**Choices:**
- Bail him out Sunday, stand with him Tuesday
- Let him sit until arraignment — two nights to think
- Bail him but dock it from his next purse

**Effects:**
- Stand with him: -$75 (inflated); trust +12; publicReputation -3 (the item makes the paper's police blotter); if a fight is booked within 10 days it proceeds at slight condition cost
- Let him sit: morale -16, trust -10; 30% something in him actually cools — hot_tempered life events at 0.5x weight for a year; 70% he comes out harder to reach
- Dock it: trust -4 but a boundary drawn; the docking line appears in the ledger and he never argues it; repeat offenses auto-dock and he knows the tariff

**Lead's edit:** Absorb saturday-night-in-print as its rep>=30 press layer: blotter item, get-ahead statement option, commission suspension, tabloid-era doubling.

*Absorbs: `saturday-night-in-print`*

### The Room Got Big

*`big-room-small-voice` · common for the trait, repeatable with rising thresholds · from: Retired fighter*

**Trigger:** insecure AND booked fight whose purse exceeds his previous career-best purse, OR first fight at 8+ rounds. Common for the trait.

Weigh-in morning he's in the stairwell, suit still on the hanger, telling you his stomach's bad. His stomach is fine. The room got big on him overnight and he's looking for a door out that isn't shaped like quitting.

**Choices:**
- Walk him through it yourself — an hour, just you two
- Send his coach — that's what the man's paid for
- Tell him fighters fight and leave him to find his feet

**Effects:**
- Yourself: costs your day (one focused-training slot's attention that advance); he enters at full condition; trust +8; win or lose, the stairwell never happens again for THIS size of room — the threshold resets upward
- The coach: outcome rides chemistry — Clicking coach: as good as going yourself; Friction: condition penalty ~8% and morale -6, wrong voice at the wrong hour
- Leave him: condition -12%; if he loses, insecure deepens (trust -8, morale floor drops); if he somehow wins, morale +20 and a real brick gets laid — but 62 fights say don't bet a man's night on a lesson

### I Didn't Come Here to Beat Cab Drivers

*`cab-drivers` · uncommon, repeatable · from: Retired fighter*

**Trigger:** glory_hunter AND an open offer with risk=='soft' on his desk AND his record shows 3+ straight wins. Uncommon.

He read the offer sheet over your shoulder, saw the opponent's record, and put his cap back on. 'Book it if you want,' he said from the door. 'But I didn't come here to beat cab drivers.'

**Choices:**
- Decline the offer — hold out for a real one
- Book it anyway — wins are wins and rent is rent
- Make him a deal: this one, then you'll chase the step-up yourself

**Effects:**
- Decline: trust +8, morale +6; no purse; flag: offer generation for him skews toward fair/reach for 90 days — the grapevine hears he wants live ones
- Book anyway: he fights flat (condition -10%, the danger nobody prices: bored glory hunters get caught); win: morale -4 anyway; lose to a cab driver: morale -20, publicReputation -6, and the clipping stings for months
- The deal: fight proceeds at normal condition, trust +4 now; the promise is tracked — deliver a fair/reach booking within 120 days or trust -14 and he starts listening when rival gyms talk

### Nobody's Seen Him Since Tuesday

*`gone-in-fight-week` · uncommon for the trait, repeatable · from: Retired fighter*

**Trigger:** unfocused AND booked fight within 7 days. The trait's masterpiece. Uncommon.

Fight's Saturday and his locker's been shut since Tuesday. His landlady hasn't seen him. The kid who runs with him says try his aunt's in the old neighborhood, or the track, in that order.

**Choices:**
- Go find him yourself — burn the day
- Send a stablemate who knows his streets
- Pull the fight before the promoter pulls it for you

**Effects:**
- Yourself: you find him (aunt's porch, or the rail at the track, seeded); he fights at partial condition (-8%); trust +10 — you came, that's the entire message; the story becomes gym legend either way
- Stablemate: 70% found (condition -12%, no trust change); 30% not found — fight forfeited, purse lost, promoter offers -25% for 120 days, publicReputation -4 ('no-show' follows a name around)
- Pull it: purse lost, promoter relations dinged but honestly told; when he surfaces Monday, morale -10 and one honest conversation: 20% the vanishing pattern eases (he scared himself), 80% this is just who he is and you now price it into every booking

### The Washing Machine

*`washing-machine` · uncommon, once-per-fighter — joyful, no choice needed, it just happens and the game is better for it · from: Retired fighter*

**Trigger:** family_man AND first career win AND purse >= $100 × inflationFactor(year). Once per fighter.

He didn't buy a jacket or a single round for anybody. Monday a delivery truck double-parked outside his mother's building and two men carried a new washing machine up three flights. He watched from the sidewalk with his hands in his pockets, grinning like the night he won.

**Effects:**
- morale +15, trust +6
- Ledger milestone written in full — this is the kind the player rereads in 1988
- Gym-log line; roster-wide morale +2 for a week (everyone heard, everyone's happy for him, even the ones who'd never admit it)
- Permanent flag: his family_man retirement-pressure events land softer — a man whose boxing already bought the washing machine has less to prove and less to flee

### It's a Girl

*`cigars-on-the-corkboard` · follows the expecting event — joyful · from: Retired fighter*

**Trigger:** family_man with the 'expecting' life event previously fired; ~8 months later. Follows automatically.

He burst in at ten past nine having not slept, handing out drugstore cigars to men who don't smoke, and put a photograph of a red-faced newborn on the corkboard with four pins, dead center, over everything else.

**Effects:**
- His morale +20, trust +5; roster-wide morale +3
- Photograph stays on the corkboard permanently (set dressing keyed to his tenure)
- Ledger milestone; a training dip for two weeks (nobody trains well on no sleep) then a lift — men with new daughters run their roadwork
- Seeds his later 'she-asked-me-to-ask-you' event with a harder edge and his farewell events with a warmer one

### Ask Me No Questions About the Eyebrow

*`the-cut-that-never-healed` · uncommon, repeatable · from: Retired fighter*

**Trigger:** reckless_brave AND last bout ended with a cut (stoppage or blood noted in report) AND new fight booked within 25 days. Uncommon.

The cut over his left eye is closed the way a screen door is closed. He wants to tape it, powder it, and walk it past the commission doctor, and he's done it before at some gym that wasn't yours.

**Choices:**
- Postpone — call the promoter, move the date
- Show the commission and let them rule
- Powder it and go

**Effects:**
- Postpone: onDay pushed 30 days, purse intact, promoter mildly sour; the cut heals true; trust +6 — reckless men secretly keep score of who protects them
- Show: 50% cleared (fight proceeds, all clean, small commission goodwill flag — future physicals lenient); 50% scratched — purse lost, morale -8, but gym reputation +1 among the men who matter
- Powder: fight proceeds; 45% the cut reopens by round 3 — TKO loss on cuts, restUntil +40, publicReputation -3, and a commission inquiry flag: next physical is hostile; 55% he gets away with it and learns exactly the wrong lesson (event refires at 2x)

### The Graveyard Shift

*`graveyard-shift` · common for broke fighters, once active at a time · from: Retired fighter*

**Trigger:** Fighter with baseDues==0, tenure>90 days, no bout in 60 days. Common among broke fighters.

He's been coming in with plaster dust on his boots and eyes like bad plumbing. Nights at the freight dock, days at your gym, sleep somewhere in between if it fits. A man can do both for about six weeks. This is week seven.

**Choices:**
- Pay him a small weekly draw ($10, inflated) against future purses so he can quit the dock
- Find him hours at the gym — keys, mopping, the pads with beginners
- Let him carry it — the dock is honest work and so is boxing

**Effects:**
- Draw: -$10/week until his next purse (auto-recouped); training returns to full; trust +12 — nobody ever paid him to become something before
- Gym hours: -$6/week; training near-full; morale +8, he belongs somewhere now; small chance (10%/yr) this seeds an old-head/cornerman path
- Carry it: development drag (limited training); stamina +1 over 6 months (the dock builds something too); 25% within a year the dock wins — he drifts off the roster, a departure ledger line that reads like weather: nobody's fault, everybody's loss

### He Kept the Clipping

*`wrote-the-name-down` · common for the trait, repeatable per byline · from: Retired fighter*

**Trigger:** chip_on_shoulder AND a press clipping about him used a dismissive frame (loss coverage, 'club fighter', 'opponent') AND publicReputation between 20 and 50. Common for the trait.

The paper called him 'a durable opponent,' which in this business is what you write on a man's headstone while he's still using it. He cut the item out, taped it inside his locker door, and hasn't mentioned it once. He doesn't have to.

**Choices:**
- Feed it — get the writer on the phone, start a little fire
- Say nothing and point the anger at the next opponent

**Effects:**
- Feed: press feud flag with that byline — his clippings double in frequency (any coverage is coverage: publicReputation +4 over the feud) but the byline's frame stays hostile until he wins big; morale +8, he loves it
- Point it: his next bout gets +condition and +effective aggression; if he wins inside the distance, the same byline writes the correction and publicReputation +7 — the sweetest single clipping this trait can earn; if he loses, the taped clipping stays up another year

### Ask You Something Straight

*`do-you-believe` · uncommon, repeatable · from: Retired fighter*

**Trigger:** insecure AND trust<45 AND booked fight with risk=='reach'. Uncommon.

Locking up, just you two, he asks it with his back half-turned: 'You think I win Saturday? Straight answer.' A man only asks that question when he already fears one of the answers, and only asks YOU when yours is the answer that counts.

**Choices:**
- The truth: it's a hard fight, and you took it because he's ready for hard
- Pump him full: he walks through this guy
- Deflect: what matters is the game plan

**Effects:**
- Truth: trust +10 regardless of the result — the answer survives Saturday either way; condition normal; if he WINS the reach fight after a straight answer, insecure softens permanently (event weights for the trait × 0.6 hereafter)
- Pump: condition +8% Saturday; if he wins, fine; if he loses, trust -16 — you lied and the loss proved it, and insecure men keep the receipts
- Deflect: condition -6%; trust -4; the question doesn't go away, it just stops being asked out loud

### Broken Since the Third

*`never-said-a-word` · uncommon, once-per-fighter (the reveal), injuries themselves repeatable · from: Retired fighter*

**Trigger:** lionheart (hidden) AND lost or won a bout that went 6+ rounds AND post-fight rest roll flags a hand/rib injury. Uncommon; the trait's reveal.

The hospital called with the X-ray: the right hand broke in the third round. He fought seven more with it, never grimaced, never told his corner, threw it when he had to. The doctor asked what kind of man does that. You now know exactly what kind.

**Effects:**
- lionheart moves from hiddenTraits to visibleTraits — the canonical reveal moment
- restUntil +50 (the hand must set right); morale +6 despite everything — men like this are strange about pain
- publicReputation +5 when the paper gets the X-ray story (it always gets the X-ray story)
- Roster-wide morale +4: the gym walks taller knowing what trains beside them; ledger milestone written in full

### The Hands Go First

*`the-hands-go-first` · uncommon, once-per-fighter arc · from: Retired fighter*

**Trigger:** Fighter age>=30 AND attributes.power>=70 AND 25+ career bouts AND 2+ prior hand-injury events (or seeded 'brittle' at generation). Uncommon.

You've watched it for three fights without naming it: he touches where he used to hurt. The right hand that built his record now gets thrown a beat late and pulled a shade short. Sixty-two fights gave me hands like a bag of gravel, so believe me when I say he already knows.

**Choices:**
- The specialist in the city ($250, inflated) — surgery and six months
- Rebuild him as a boxer — move his focus to ringIq/defense and stop asking the hands for knockouts
- Let him spend what's left of them

**Effects:**
- Specialist: -$250; restUntil +180; 70% the power returns whole (flag cleared); 30% it doesn't and the money bought certainty, which is worth something too
- Rebuild: his focus locks to ringIq or defense for 6 months; power effective -8 permanently but his KO-loss risk drops and his career gains ~2 years of runway; morale -6 then +10 when the new style wins one
- Spend them: each bout, 20% escalating hand break (restUntil +60, power -2 permanent per break); the knockouts keep coming until they don't; his retirement, when it arrives, arrives all at once

### Open It Later, He Said

*`the-engraved-watch` · rare, once-per-fighter — joyful · from: Retired fighter*

**Trigger:** Fighter with trust>=60 AND careerEarnings crossing $2,500 × inflationFactor(year) AND 2+ years tenure. Rare, once per fighter.

After Friday's purse settled he left a small box on your desk and was gone before you opened it. A watch — not flashy, a good one — engraved on the back with the date he first walked into your gym. He never mentioned it again and neither, you understand, are you supposed to.

**Effects:**
- Ledger milestone; the watch appears on the office desk permanently (set dressing)
- His trust ceiling lifts: TRUST_HEAL_CAP for this fighter rises from 65 to 80 — the rare mechanic where a relationship gets to finish healing
- No morale numbers move and that's correct: this event exists so the player feels, once a decade, what the job was actually for

### The Government Reads the Sports Page Too

*`taxman` · rare, once-per-fighter · from: Retired fighter*

**Trigger:** Fighter careerEarnings > $3,000 × inflationFactor(year) AND baseDues was 0 at signing (a man who never handled money). Rare.

A government envelope, forwarded twice, with his name spelled wrong and a number spelled exactly right. He never filed on any of it — nobody ever told him purses were the kind of money the government could see.

**Choices:**
- Get him an accountant ($75, inflated) and square it clean
- Let him work it out himself — he's a grown man
- Advance him the back taxes against future purses

**Effects:**
- Accountant: -$75; settled; trust +10; a permanent flag — his future purses are filed right, and years later that's a paragraph in his retirement clipping instead of a scandal
- Himself: 50% he manages; 50% a purse gets garnished at the worst moment — morale -14 fight week, condition penalty, and the paper's police-blotter column gets a small mean item (publicReputation -2)
- Advance: -$180 (inflated), auto-recouped from purses; trust +8; the debt line in the ledger closes itself over three fights, quietly satisfying

### He Found Out What the Other Guy Made

*`purse-envy` · uncommon, repeatable · from: Retired Promoter*

**Trigger:** post-fight + fighter's purse < opponent's known purse × 0.5 + fighter has insecure OR chip_on_shoulder trait

Somebody at the weigh-in talked, the way somebody always does. Your man fought the same eight rounds in the same ring and made a third of the money, and he's been doing arithmetic on the bus home ever since.

**Choices:**
- Level with him — show him the books and the plan
- Give him a bonus from the gym's share
- Tell him that's the business

**Effects:**
- Level: trust check — if trust ≥ 55, he accepts it (trust +5, morale −3, 'at least he's straight with me'); if trust < 55, morale −10 and the doubt lingers (small recurring morale drag for 3 months)
- Bonus: gym cash −20% of the purse; morale +8; but a precedent counter starts — every future underpaid fight expects it, and skipping one later costs double the trust
- The business: chip_on_shoulder channels it (training effort +10% for 2 months, morale −5); insecure spirals (morale −15, trust −8, quit-risk if morale < 30)

## Category: gym (9 events)

### Ten Years on the Corner

*`the-anniversary-piece` · rare, once per decade of tenure (repeats at 20 years with a heavier piece) · from: Retired boxing journalist*

**Trigger:** Gym tenure reaches 10 years (dayCount since founding); gym reputation >= 0.4; at least one fighter developed from walk-in to 15+ wins in-house

A decade to the week since the sign went up, the paper sent someone to write the anniversary piece, and the writer did the thing good ones do: ignored the trophies and interviewed the broom. The last line quoted the oldest man in your gym on what the place smells like at 6 a.m., and it was better than anything they ever wrote about a fight.

**Effects:**
- gym reputation +0.06
- all roster morale +6, trust +4
- walk-in rate +30% for 8 weeks
- coach applicant quality raised one tier for 6 months (good coaches read the paper too)
- framed clipping on the office wall; the ledger gets a decade-line

### The Kid With the Medal

*`decorated-amateur-at-the-door` · rare, at most once per Olympic cycle · from: Boxing Historian*

**Trigger:** within 18 months after any Olympic-class beat AND gym reputation quality >= 0.5; probability scales with gym reputation and city

The walk-in this week is different: a national-team amateur — a Games alternate, or a trials finalist the big signing money passed over — with 90 amateur fights and a duffel bag. The networks wanted his teammate. He wants a gym that will actually train him, and he heard about yours.

**Choices:**
- Standard walk-in decision: locker / no locker / turn away

**Effects:**
- Generated with elevated attributes (ringIq/speed/footwork skew), publicReputation 20-30 (a walk-in with a NAME, unprecedented), and elevated hidden-trait odds of chip_on_shoulder (the money passed him over) or insecure (he watched lesser men get rich)
- Signing him fires a prospect-notice clipping naming YOUR gym — for a small gym, its first appearance in the paper
- His patience is short (walkins system) — a man with a medal has other doors

### After the News From the Coast

*`the-long-count-home` · fires once at the beat; the response pattern reruns on any later ring tragedy · from: Boxing Historian*

**Trigger:** ring-death-fifteen-rounds beat fires (or the rare later recurrence) AND player roster non-empty — checks each fighter's traits

The week the papers carry the death, the gym is quieter than rent day. Every man in the place has done the arithmetic of what he does for a living, some of them for the first time.

**Choices:**
- Call a gym meeting and talk about it straight
- Say nothing and let the work answer it

**Effects:**
- All fighters: -5 morale baseline for the month
- family_man: additional -8 morale; small chance he asks for a meeting about quitting (departures system hook) — trust determines whether he can be talked through it
- insecure: -10 morale, sparring intensity drops (training effectiveness -15% for 6 weeks)
- lionheart / reckless_brave: unmoved; gym log gives each one flat line ('He read it, folded the paper, and got on the bag')
- Meeting called + average trust>=60: recovers half the morale losses; + average trust<40: makes it worse — they hear management covering itself

### Last Card at the Old Hall

*`last-card-at-the-old-hall` · rare, tied to venue closures — at most 2-3 per save · from: Boxing Historian*

**Trigger:** club-circuit-withers closes a venue in the player's city AND player has a fighter with 3+ career bouts in that venue's offer history

The promoter's last card at the hall, before the fixtures are sold. He wants local names on it — men the regulars watched come up — and your man qualifies. The purse is what club purses are now, which is to say an insult. That isn't why anyone will be there.

**Choices:**
- Take the farewell bout
- Decline — sentiment doesn't pay February's rent

**Effects:**
- Take: modest purse; +8 morale to the fighter (win or lose — the ovation is in the gym log); a warm named clipping about your gym's place in the neighborhood: gym reputation +1 tier progress and walk-in frequency +10% for 6 months (the neighborhood remembers)
- Take + family_man or glory_hunter: +12 morale instead
- Decline: nothing immediate; the closure elegy clipping runs without your gym's name in it, and a single gym-log line notes he asked why you said no (-3 trust, that fighter only)

### Somebody in This Room

*`somebody-in-this-room` · rare, repeatable · from: Retired fighter*

**Trigger:** Roster size >= 6, at least one fighter with baseDues==0, random rare roll. Rare.

Forty dollars gone from a locker while everyone was doing roadwork. By afternoon the whole gym knows, and by evening every man is watching every other man wrap his hands. A gym runs on the door being safe. Yours isn't, today.

**Choices:**
- Search every locker with everyone present
- Cover the loss from the till and say nothing
- Call the men together and let the room deal with it

**Effects:**
- Search: roster-wide trust -6 (you searched THEM); 55% you find it — the culprit is generated from the broke/low-trust end of the roster, and you choose cut-or-forgive (forgive: his trust +20 permanent, 20% he steals again; cut: standard cut ripples); 45% you find nothing and the -6 bought you nothing
- Cover: -$40; morale steadies; 40% it happens again within 6 months because nothing was answered
- The room: hot_tempered fighters may start something (their morale -8, possible sparring incident); 60% the man comes to you alone after — private confession, trust between you two only, the gym never learns; 40% silence and a slow -2 morale drain gym-wide for a month, the poison of an unanswered thing

### The Hired Jaw

*`the-hired-jaw` · uncommon, escalating · from: Retired fighter*

**Trigger:** A lockerless or chopping-tier fighter has been in the gym 120+ days while a must_keep stablemate in his weight class holds publicReputation>=35; sparring rounds between them logged. Uncommon.

Everyone saw it Thursday. The kid you keep as a moving target boxed your star's ears off for three rounds, clean, patient, no luck about it. He racked his gear quiet as always. The gym was not quiet.

**Choices:**
- Get him his own fight — he's earned a real night
- Keep him where he is — good partners are worth more than good prospects
- Raise what you pay him and call it fair

**Effects:**
- His fight: an offer generates for HIM within 30 days; morale +16, trust +12; if he wins, promote-worthy — his hidden growth may reveal; the star (if insecure) takes morale -8 watching the gym cheer someone else
- Keep as is: trust -10, quit risk rises; 35% within 6 months a rival gym signs him and the clipping — 'local spoiler upsets ranked man' — names YOUR gym as the place that couldn't see it
- Raise pay: morale +6, buys 6 months; the event refires, and second time the only answers that hold are the first two

### The Professor's Corner

*`old-head` · uncommon, once per qualifying elder · from: Retired fighter*

**Trigger:** Roster fighter age>=31 with 22+ total pro bouts AND at least two roster fighters age<=22. Uncommon.

You noticed it before you understood it: the old man stays late, and the kids stay when he stays. He teaches with two words and a raised eyebrow — feet first, hands lie, watch the chest not the eyes. Nobody assigned him this. Some men just have it.

**Choices:**
- Let it grow on its own
- Make it official — an hour of his time, a few dollars a week
- Tell him when he hangs them up there's a cornerman's job with his name on it

**Effects:**
- Let grow: every roster fighter under 23 gains +ringIq drip (small monthly tick) while he's on the roster; his morale +6
- Official: same drip, stronger; -$8/week (inflated); his trust +10; gym-log lines about 'the professor's corner' become recurring texture
- The promise: his retirement (whenever it comes) converts to a coach-applicant with high chemistry pre-loaded for your roster; the single best pipeline this game can give you, because the best trainer I ever had was a man with 71 fights and no belts

### A Night for the Old Man

*`benefit-night` · rare, once per eligible old-timer · from: Retired fighter*

**Trigger:** A fighter who retired from your roster via 'the-fog' or medical retirement, 2+ years gone; a rumor reaches the gym he's in a bad way. Fires at 2x weight after scripted event 'what-the-game-takes'. Rare.

Word came back that the old man is in a rooming house on the east side, behind on everything, forgetting more than he keeps. He held your gym up for six years and never once complained about the check. The men are already talking about it in the low voices they save for things that matter.

**Choices:**
- Throw the benefit — open the gym for a night, exhibition rounds, pass the hat
- Send money quietly and spare him the spectacle
- It's a hard world — the gym isn't a charity

**Effects:**
- Benefit: -$150 costs, raises little net, but: roster-wide morale +10 and trust +6, gym reputation +4, and the paper covers it warm ('the sweet science remembers its own'); after 'what-the-game-takes' era the clipping runs statewide; the single best morale event in this list and it costs almost nothing but heart
- Quietly: -$100; a private ledger milestone; one gym-log line months later — the old man mailed back an envelope with two dollars in it and a note that said thanks and nothing else
- Hard world: no cost; roster fighters with family_man or lionheart take morale -6 and trust -4; the gym remembers what you are when the answer costs money

### The Fight Nobody in This Gym Wants

*`stablemate-purse` · rare, repeatable if conditions persist · from: Retired fighter*

**Trigger:** Two roster fighters, same weightClass, both publicReputation>=35, both with winning records; a promoter offers them EACH OTHER at the best purse either has seen. Rare.

The promoter said it plain: the two best men at the weight in this city train in the same room, and the city will pay to see it settled. The purse is real. The two of them heard about the call before you'd hung up the phone, and the gym has been too quiet since.

**Choices:**
- Refuse — stablemates don't fight, not in my house
- Take it — put it to both men straight and split the gate fair
- Stall — tell the promoter one of them moves up a class soon

**Effects:**
- Refuse: promoter offers -20% for 120 days; both fighters trust +6 (the house protected the house); the question hangs in the gym forever as texture
- Take it: the richest purse either has earned; the winner: morale +15, publicReputation +8; the loser: morale -20, trust -12, and 40% he asks for his release within 6 months — you traded a stable for a gate, which is a real trade some years
- Stall: buys 90 days; if neither actually changes class, the offer returns richer and both men now know you dodge hard questions (both trust -4)

## Category: press (29 events)

### First Ink

*`first-ink` · common, once per fighter · from: Retired boxing journalist*

**Trigger:** Player fighter records his 3rd career win, publicReputation < 12, has never appeared in a clipping

Four lines of agate at the bottom of the Monday roundup, his name spelled right, his record after it in parentheses. He bought six copies of the paper and gave five away.

**Effects:**
- publicReputation +3
- morale +8
- insecure: additional morale +4 (proof he exists)
- clipping generated under a persistent byline; ledger milestone 'first time in the paper'

### The Christening

*`the-christening` · uncommon, once per fighter · from: Retired boxing journalist*

**Trigger:** Fighter with nickname === null, 5+ wins with 3+ KOs, publicReputation >= 15, after a KO win

The writer needed a name for the headline and made one up on deadline. By Friday the men at the lunch counter were using it, and by the next card the ring announcer was too. Nobody asked the kid.

**Choices:**
- Let it ride — the name is his now
- The kid hates it — call the desk and ask them to drop it

**Effects:**
- Let it ride: permanent nickname assigned from the style-appropriate pool; publicReputation +4; insecure: morale -5 (it isn't him, and he knows it); glory_hunter/chip_on_shoulder: morale +6
- Call the desk: no nickname; trust +5 (you went to bat over something small, which is how he learns you'd go over something big); the byline runs a wry item about 'the fighter with no name' — publicReputation +1 anyway

### Local Boy

*`hometown-hero-front-page` · uncommon, once per fighter · from: Retired boxing journalist*

**Trigger:** Fighter's homeCityId === gym city, record 8-0 or better OR publicReputation >= 30, after a win at a local venue

Sunday feature, above the fold of the sports section: the block he grew up on, the church his mother cleans, the gym with your name on the glass. The photographer shot him holding his wraps like they were something holy.

**Effects:**
- publicReputation +8
- morale +10
- gym reputation quality +0.03
- walk-in rate +40% for 8 weeks (kids from his neighborhood at the door — clipping and gym-log lines note it)
- comfort_seeker: begins a -1 morale/month drift for 3 months (he has arrived, and arriving is the danger)

### The Morning After

*`the-hit-piece` · common, repeatable (per qualifying KO loss) · from: Retired boxing journalist*

**Trigger:** Fighter with publicReputation >= 35 loses by KO or TKO

The column ran under the word EXPOSED and never used his first name once. It quoted two unnamed trainers and a matchmaker who owed the writer a favor, and it was 40 percent fair, which is the cruelest percentage there is.

**Choices:**
- Say nothing — clippings yellow
- Phone the writer and give him both barrels

**Effects:**
- Base: publicReputation -6 (on top of the loss), morale -10; insecure: morale -18, trust -5 unless trust >= 60 already; chip_on_shoulder: morale +6 instead (he tapes it inside his locker door); lionheart: no morale effect
- Say nothing: no further effect; the story dies in two weeks
- Phone the writer: 50% he prints your best line (publicReputation +3 back, fighter trust +6 — you defended him in public); 50% he prints your worst one (gym reputation -0.02, a feud byline is flagged: that writer covers your gym 20% more harshly for a year)

### The Writer's Boy

*`the-adoption` · uncommon, once per fighter (max 1 adopted fighter per byline) · from: Retired boxing journalist*

**Trigger:** Fighter age <= 24, current win streak >= 4, publicReputation 18-40; one persistent byline has authored 2+ clippings about him

There's a moment when a writer stops covering a fighter and starts believing in him, and it shows up in the verbs. This one has started driving out to the gym on Tuesdays, unpaid, watching the kid skip rope like it's news.

**Effects:**
- Byline flagged as this fighter's chronicler for the rest of both careers
- publicReputation gains from all wins +50% while adopted
- each loss triggers a wounded-faith column: rep loss from defeats +50% too — a made man falls harder
- the chronicler's items reveal one of the fighter's hidden traits to the player within a year (writers see things trainers are too close to see)
- if the fighter ever leaves the gym or is cut, the chronicler writes the where-did-it-go-wrong piece: gym reputation -0.02

### Called Out

*`called-out-in-print` · uncommon, repeatable with 1-year cooldown per fighter · from: Retired boxing journalist*

**Trigger:** Player fighter publicReputation >= 50; a WorldFighter with nationalRank !== null in the same weightClass exists; fires within 6 weeks of the player fighter's latest win

The ranked man did it the old way — through a writer, casually, three paragraphs down: 'Tell him if he wants a real education, my people answer the phone.' It's already on the corkboard when you get in. Someone circled it in grease pencil.

**Choices:**
- Answer in print — give the writer a line back
- Silence — let the record talk

**Effects:**
- Answer: publicReputation +5; within 8 weeks a 'reach' offer against that ranked man arrives at purse x1.6; hot_tempered fighters answer THEMSELVES before you can decide (line is worse, rep +5 but the ranked man's camp is now hostile: the eventual offer's purse drops 15%)
- Silence: publicReputation -3 (the paper reads it as fear); glory_hunter: morale -8; comfort_seeker: morale +4 (suits him fine)

### The Quote

*`the-quote` · common, repeatable (10-week cooldown per fighter) · from: Retired boxing journalist*

**Trigger:** hot_tempered OR chip_on_shoulder fighter wins; publicReputation >= 25; post-fight writer scrum (any venue)

He said it with his gloves still on and the writer wrote it with his coat still on, and by morning it was a headline with your gym's name in the second sentence. It was a hell of a line. It usually is, right before it costs something.

**Effects:**
- publicReputation +5
- next offer purse +10% (quotable men sell tickets)
- the insulted party (last opponent's camp or a named local rival) is flagged: any future bout against that camp gets a grudge frame — both purses +20%, loser's rep -2 extra
- 15% chance the commission fines him $50 (inflation-adjusted) for conduct; the fine makes the paper too — rep +1, because this business is what it is

### Four Plates on the Table

*`kitchen-table-profile` · uncommon, once per fighter · from: Retired boxing journalist*

**Trigger:** family_man (visible or revealed), 6+ career wins, publicReputation >= 25, morale >= 55

The profile ran with a photograph of him drying dishes, still marked up around the eyes from Saturday. 'I fight so they never have to know what it costs,' he said, and the writer had the sense to end the piece right there.

**Effects:**
- publicReputation +8 (+12 during the tabloid-turn era — the last decent man in boxing)
- morale +8, trust +4
- fan-favorite flag: hometown-venue offers gain a permanent +10% purse floor (he sells tickets to people who don't like boxing)
- walk-in rate +15% for 4 weeks, skewed toward family-man-statement prospects

### Six Rounds of Waltz

*`the-fixed-fight-expose` · rare, once per save per city · from: Retired boxing journalist*

**Trigger:** Gym-wide/world event: fires when a local rival gym's journeyman (losses/fights > 0.45, age >= 30) wins by KO over a betting-favorite opponent; requires city with 2+ rival gyms; year any

The paper spent five weeks on it and named the venue, the matchmaker, and the referee, and stopped one carefully-worded sentence short of naming the gym. Everyone in town filled the sentence in anyway.

**Effects:**
- One persistent local venue goes dark for 6 months (removed from the offer venue pool; offers -20% frequency while dark)
- the implicated rival gym's fighters lose 20% publicReputation across the board
- clean-hands dividend: if the player has never taken a 'soft' offer for a fighter with 10+ wins, the follow-up column names your gym as 'one of the rooms in this town where the water runs clear' — gym reputation +0.04, walk-in rate +25% for 6 weeks
- a commission letter arrives asking (rhetorically) for cooperation; flavor, filed in the ledger

### The One Who Got Away

*`where-are-they-now-made-good` · rare, repeatable (one per departed fighter) · from: Retired boxing journalist*

**Trigger:** 3+ years after the player cut or lost a fighter who then signed with a rival gym; that WorldFighter now has publicReputation >= 45 or a national rank

The magazine found him, of course. Ranked now, married, fighting out of the other side of town. Asked about his first gym he paused long enough for the writer to describe the pause, and then said only: 'They taught me plenty.'

**Effects:**
- gym reputation -0.02 (the trade remembers who let him walk)
- player-facing only: ledger cross-reference to the original cut entry — the game's memory made cruel
- any current roster fighter on the Chopping Block: morale -4 the week the piece runs (they can read)

### Whatever Happened To

*`where-are-they-now-fell-apart` · rare, one per qualifying departed fighter · from: Retired boxing journalist*

**Trigger:** 3+ years after the player cut a fighter with potential >= 60 who never signed elsewhere (left the world population)

The where-are-they-now column found him loading trucks on the east side, good-humored about all of it, his hands still fast when he demonstrated on the loading dock for the photographer. 'The gym part I miss,' he said. 'Not the getting hit.'

**Effects:**
- No mechanical penalty — this one is for the player
- ledger milestone appended to his old entry
- 5% chance he turns up at the gym door the following week, age +3 years, asking for nothing, and the gym log gets its best line of the season

### Thirty Column Inches

*`retirement-tribute` · uncommon, once per qualifying fighter · from: Retired boxing journalist*

**Trigger:** Player fighter retires (age/decline departure or player-managed exit) with 20+ career bouts OR publicReputation >= 50

The paper gave him the full send-off — the record, the nights, the quote from the man he beat in his best win. The last paragraph was about the gym, and it said the thing you'd never say about yourself, which is why God made writers.

**Effects:**
- gym reputation +0.05
- all roster fighters trust +5 (they saw how a career ends in your house)
- walk-in rate +30% for 6 weeks ('men want to finish where finishing is done right' — the clipping says so)
- framed clipping added permanently to the office wall (bible principle 8: memory lives in objects)
- if he had an adopted chronicler byline, the tribute is that writer's and runs double length; gym reputation +0.07 instead

### The List

*`prospects-to-watch` · uncommon, once per fighter · from: Retired boxing journalist*

**Trigger:** Fighter reaches 10-0 (any KO count), age <= 26

The Monthly's February issue does it every year: ten names, one paragraph each, the kiss and the curse in the same column of type. His paragraph used the word 'ceiling' twice, once each way.

**Effects:**
- publicReputation set to max(current, 40)
- offer quality shifts: 'reach' offers +50% frequency, televised/casino offers unlocked if era permits
- the zero becomes a character: insecure or comfort_seeker fighters take -2 morale/month while undefeated past 10-0 (the number owns them); lionheart/glory_hunter unaffected
- rival attention: 10% chance per year a rival gym makes a poach approach at contract time while he's listed

### How the Zero Dies

*`how-the-zero-dies` · common, once per fighter · from: Retired boxing journalist*

**Trigger:** First career loss of a fighter with 10+ wins; branches on method

There are two first losses. There's the one where the paper writes that the book on him is out and the ceiling was a floor, and there's the one where he went out on his shield in a fight people will lie about having seen, and the writer typed 'made a believer of every man in the building.'

**Effects:**
- KO/TKO loss: publicReputation -10 (on top of standard loss swing), 'exposed' framing, next 2 offers skew soft
- Decision loss with fight going the distance and 2+ knockdowns scored BY him or endRound === scheduledRounds in a close card: publicReputation +3 despite the L, morale -4 only, and any hidden lionheart trait is revealed to the player AND to the paper simultaneously — the clipping names what he is before you do
- either branch: ledger milestone; his chronicler byline (if adopted) sets the tone city-wide

### Crosstown

*`crosstown-feud` · uncommon, repeatable with 2-year cooldown · from: Retired boxing journalist*

**Trigger:** Player fighter and a local rival gym's WorldFighter, same weightClass, both publicReputation >= 30, neither has fought the other; both won their last bout

Nobody said anything. The paper just started running their results in the same column, week after week, one name always a paragraph above the other, until the whole east side had an opinion. That's how a writer builds a fight without leaving his desk.

**Choices:**
- Feed it — give the writer a line every few weeks
- Starve it — no comment, ever

**Effects:**
- Feed it: both fighters +2 publicReputation per month for up to 4 months; then a showdown offer arrives at the biggest local venue — purse x2, winner takes +10 rep, loser -6; hot_tempered fighters escalate uncontrollably (a gym-front confrontation clipping, morale +5, 25% chance of a $75 commission fine)
- Starve it: feud dies in 6 weeks; no rep movement; the writer runs a sour item ('some fights die of shyness') — publicReputation -1 each
- either way: chip_on_shoulder fighter gains +4 morale for the feud's duration — being measured against somebody is his native weather

### The Fifty-Cent Story

*`sleeps-in-the-gym` · uncommon, once per fighter · from: Retired boxing journalist*

**Trigger:** Fighter with baseDues === 0 (broke), 4+ wins, wins on a local card; gym has carried him 1+ year

The writer found out he'd been working nights at the fish market and training at dawn, and that the gym never asked him for a dime. The piece ran Sunday. Monday there was an envelope under the door with no name on it and forty dollars in it.

**Effects:**
- cash +$40-$120 (inflation-adjusted; anonymous envelopes, two or three over a month)
- fighter morale +12, trust +8 (the piece says the gym carried him — now it's public and permanent)
- publicReputation +6
- gym reputation +0.03
- walk-in rate +20% for 4 weeks, skewed toward broke prospects — generosity advertises to the men who need it

### They Spelled It Wrong

*`the-misprint` · common, once per fighter · from: Retired boxing journalist*

**Trigger:** Fighter's first or second clipping (publicReputation < 15); 40% chance on any early mention

The paper ran his name with two letters swapped and his record a fight short. He didn't say anything about it, but the corrected clipping he cut out himself and the wrong one both went up inside his locker, one above the other.

**Effects:**
- chip_on_shoulder: morale +6, and a permanent gym-log flavor flag (the two clippings) — the cheapest fuel he'll ever run on
- insecure: morale -4 (even the paper can't see him)
- all others: gym-log line only
- no rep change — nobody important read it either

### Agate Type, Page 61

*`enters-the-ratings` · rare, once per fighter · from: Retired boxing journalist*

**Trigger:** Fighter publicReputation >= 55 AND 12+ wins AND win over an opponent with rep >= 40 in his last 3 bouts

No phone call, no ceremony. The new issue of the Monthly simply had his name at number ten in the divisional ratings, in type smaller than a matchbook, and nothing in the gym got done that day.

**Effects:**
- Fighter enters the ranked ecosystem: nationalRank assigned at the tail (10th)
- publicReputation +5
- all future offers are 10-rounders; ranked-opponent offers unlocked
- morale +12 roster-wide (a ranked man in the house lifts every heavy bag)
- glory_hunter: morale +15 and a permanent hunger flag — he will push you (via calls/notes) toward reach fights from now on
- gym reputation +0.05; the weekly paper runs the local angle two days after the magazine

**Lead's edit:** Requires the ranked elite deepened to ten per division; entry assigns the tail slot through the existing churn machinery.

### The Book Man

*`the-ghost-writer` · rare, once per fighter · from: Retired boxing journalist*

**Trigger:** Fighter publicReputation >= 65, age >= 28, 25+ career bouts

A writer from out of town wants to do the life story — six months of Tuesdays and a tape recorder. The advance is real money. The questions, he warns you, will not all be about boxing.

**Choices:**
- Do the book
- No book — fights only

**Effects:**
- Do the book: fighter receives $2,500 (inflated) — careerEarnings, not gym cash; publicReputation +8 on publication (a year later); comfort_seeker: training effectiveness -15% during the interview months (a man retelling his life starts believing it's over); family_man: morale +6 (something to leave the kids); the finished book reveals ALL his remaining hidden traits to the player — the tape recorder gets what the corner never did
- No book: glory_hunter morale -6; everyone else, nothing — most fighters distrust a man who writes down what you say

### The Locker Room Door

*`locker-room-door` · common, repeatable (per qualifying loss, 15-week cooldown) · from: Retired boxing journalist*

**Trigger:** After any loss by a fighter with publicReputation >= 30, a persistent byline asks for locker-room access that night

The writer is at the door with his hat literally in his hands. Whatever you decide, he has a Tuesday deadline and column inches that will get filled with something.

**Choices:**
- Let him in
- Bar the door

**Effects:**
- Let him in: an honest, humane piece — publicReputation +2 despite the loss; fighter morale -4 that week (grief has a witness) but the byline is flagged warm toward your gym (+10% favorable framing for a year); insecure: morale -8, do not let him in for this one and the game should hint it
- Bar the door: column runs anyway, colder — 'the gym with the bolted door' — publicReputation -3; fighter trust +5 (he watched you choose him over ink); the byline is flagged cool for a year

### Robbed on the Cards

*`hometown-robbery` · uncommon, repeatable · from: Retired boxing journalist*

**Trigger:** Fighter loses or draws by split/majority decision at a venue in his home city, publicReputation >= 30

The paper scored it seven rounds to three for the local kid and said so in the second sentence, and the letters column ran hot for two weeks. There is no promoter alive who can't smell a rematch in weather like that.

**Effects:**
- publicReputation +4 (the sympathetic loss — rarer than a win and worth almost as much)
- morale -6 but trust +3 if you're recorded as protesting the decision (automatic gym-log line)
- rematch offer arrives within 10 weeks at purse x1.4
- hot_tempered: 30% chance he says something about the judges that costs $50 and gains +2 rep

### Face on the Bill

*`face-on-the-bill` · uncommon, repeatable (1-year cooldown) · from: Retired boxing journalist*

**Trigger:** Fighter publicReputation >= 35 with 3+ KOs in his last 5 wins; next local offer

The printer's boy delivered a stack of fight bills to the gym and there he was, top third of the sheet, bigger than the main event's letters. Somebody taped one up by the ring before he arrived. Somebody else watched his face when he saw it.

**Effects:**
- Attached offer purse +25% (his face sells the room)
- glory_hunter: morale +10; insecure: morale -6 and condition -0.04 for that bout (the face on the poster has to deliver); comfort_seeker: morale +8, training drag next month
- a WIN under his own face: publicReputation +3 extra; a LOSS under it: rep -3 extra and the paper mentions the poster, because writers are like that

### The Long Piece

*`week-in-the-gym` · rare, repeatable (3-year cooldown) · from: Retired boxing journalist*

**Trigger:** Gym reputation quality >= 0.5 AND roster contains a fighter with publicReputation >= 40; a magazine writer proposes a week embedded in the gym

The magazine man sat on the ring apron for six days and wrote down the sound the speed bag makes at seven in the morning. The piece that ran was about the featured fighter, nominally, but every man in the room found himself in a sentence somewhere, and kept the issue.

**Choices:**
- Open the doors
- Not this year

**Effects:**
- Open: all roster morale +4; featured fighter publicReputation +10; gym reputation +0.05; the writer's eye reveals one hidden trait of ANY random roster fighter to the player (published in the piece — you learn it with the rest of the city); 15% chance the piece also prints something you'd rather it hadn't (a low-trust fighter's grievance, verbatim): that fighter must be reconciled (trust -10) or he becomes a departure risk
- Not this year: nothing; the magazine goes and embeds across town instead — the rival gym gets the +rep version

### Talking Him Into a Fight

*`rumor-column-linkage` · common, repeatable (12-week cooldown per fighter) · from: Retired boxing journalist*

**Trigger:** Fighter publicReputation >= 30, idle (no booked fight, no open offer) for 8+ weeks

The rumor column had him 'in talks' for a fight you have never discussed with anyone living. This is how the business asks a question: in print, deniably, with your phone number implied.

**Effects:**
- 30% chance a real offer matching the rumor arrives within 4 weeks (the column was the promoter flying a kite)
- glory_hunter: morale +5 (people are talking); family_man: morale -3 (his wife read it before he did); comfort_seeker: no effect, he didn't read the paper
- if no offer materializes, a follow-up item notes the fight 'fell apart' — publicReputation -1 for a fight that never existed, which is the purest press mechanic there is

### Somebody Should Tell Him

*`somebody-should-tell-him` · uncommon, once per fighter · from: Retired boxing journalist*

**Trigger:** Fighter age >= 34 with 3 losses in his last 4 bouts, publicReputation >= 40 at his peak (career-high rep tracked)

The column was gentle, which made it worse. It listed what he used to be in the past tense, praised his chin twice, and ended with a sentence addressed not to him but to you: 'Someone in that gym holds the towel, and ought to remember what it's for.'

**Choices:**
- Retire him — call the paper first, do it right
- He goes on — a fighter decides when a fighter's done

**Effects:**
- Retire him: triggers retirement-tribute if he qualifies; trust +8 roster-wide (every aging fighter in your room watched what you did); his own trust +10 or -15 depending on morale (above 50 he's relieved; below, betrayed); ledger milestone
- He goes on: publicReputation -4 now and -2 per further loss; morale -8 (he read it too); lionheart: morale +4 instead and one genuinely dangerous last run is statistically live — the engine's trait system means the column can be wrong, and when it is, the vindication clipping ('EVERYBODY OWES HIM AN APOLOGY') pays rep +12
- either way the columnist follows the thread to the end — this byline owns this story now

### The Old Man's List

*`old-mans-list` · rare, once per save (fires with the scripted beat) · from: Retired boxing journalist*

**Trigger:** Chained to death-of-the-afternoon-paper scripted beat: the retiring byline's farewell column; requires any player fighter with 5+ clippings under that byline

Forty years of Fridays and he got one last column to spend. He spent a paragraph of it on your fighter — not the best man he ever covered, he wrote, but the one who reminded him why he kept coming. You will never get better ink than ink that owes you nothing.

**Effects:**
- Named fighter: publicReputation +8, morale +10, trust +5
- gym reputation +0.03
- the clipping is auto-framed on the office wall (permanent object)
- if the named fighter was the byline's adopted 'writer's boy', double all effects and the whole roster gets morale +4 the week it runs

### A Town That Reads One Paper

*`the-cold-shoulder-beat` · uncommon, repeatable — the standing consequence of treating the press as furniture · from: Retired boxing journalist*

**Trigger:** Player declines/ignores 3+ press interactions (locker-room door, quotes, feud feeds) within 2 years; gym reputation >= 0.3

Nothing dramatic happens. The results still run. But the adjectives leave — your men win 'efficiently' where the other gym's win 'thrillingly' — and after a while you notice your fighters' names are always in the second half of the column, and you can't prove a thing.

**Choices:**
- Mend it — invite the boxing desk to a fight-night dinner ($60, inflated)
- Let them sulk

**Effects:**
- Base state while cold: all publicReputation gains for roster fighters -25%; feature-class events (profiles, adoptions, lists) suppressed
- Mend it: cold state cleared; one warm item runs within a month ('a good room over on [street]'); costs the cash
- Let them sulk: cold state persists until any roster fighter forces the issue with a rep-50+ win — press can be frozen out, but not forever, and the thaw item admits nothing

### The Fight Nobody Wanted

*`two-bums-classic` · rare, repeatable · from: Retired boxing journalist*

**Trigger:** Fighter with publicReputation < 20 wins a bout where both men entered with losing or short records, and the fight goes 90%+ of scheduled rounds with 3+ knockdowns total (engine narrative data)

Four-round swing bout, two names nobody came to see, and they tried to kill each other with such honest fury that the crowd stood through the last round and a writer tore up his lead. 'The best fight of the year happened at 8:15,' the piece began, 'before most of the crowd sat down.'

**Effects:**
- Both fighters publicReputation +6 — the war IS the credential
- morale +10
- a rematch offer at purse x1.5 arrives within 12 weeks regardless of records
- hidden lionheart or reckless_brave on the player's man: 60% chance the fight reveals it to player and press at once
- ledger milestone: fights like this are why the ledger exists

**Lead's edit:** Expose knockdown counts and round-completion on FightResult so the trigger reads structured data, not narrative strings.

### The Angle

*`sold-on-the-wrong-angle` · uncommon, repeatable with different promoters · from: Boxing Historian*

**Trigger:** player fighter booked against an opponent from the same city AND either fighter has publicReputation>=45 AND promoter archetype is the shameless kind (seeded per promoter)

The promoter has decided what sells this fight, and it isn't boxing — it's neighborhood against neighborhood, his people against yours, an ugliness dressed up as a story line. The papers are running with it. Your fighter is being asked questions at the deli that have nothing to do with his jab.

**Choices:**
- Ride the angle — controversy sells tickets and his purse has a gate percentage
- Shut it down publicly — one statement to the paper, above the noise
- Say nothing and keep him in camp

**Effects:**
- Ride: gate/purse +30%; hot_tempered fighter: 35% weigh-in incident (fine from the commission, -8 publicReputation, one ugly clipping); chip_on_shoulder: +8 morale, he fights better angry (small bout bonus)
- Shut it down: purse unchanged; +6 trust from the fighter; the beat writer marks you as quotable — future press coverage of your gym warms slightly (a persistent byline relationship)
- Say nothing + insecure fighter: -8 morale, the noise gets into him; the fight-engine morale input carries it into the ring
- Historically grounded in every decade's promotion — the machinery that sold a hundred real fights on everything but the fighting

---

## Part III — Integration Notes

Era state. Add `era` to the save: `{ seed, schedule, flags, purseMultipliers, titleClaims, venueLifecycle, npcs }`. At new-game, a mulberry32 stream off the save seed rolls every kept scripted beat's dates inside its window, its generated cast (names, divisions, traits — the wrecking ball's hot_tempered+insecure set at generation, per the upheld hill), and per-save outcomes the beats need (the upset month, which venue dies when). Store as a flat dated list of sub-beats `{ eventId, beatIndex, day, payload }`. The schedule never re-rolls; in-the-moment dice stay Math.random in handlers per house rule; bouts stay on the seeded fightEngine.

Evaluator. In advanceTime, after worldSim and before the press cycle: (1) fire scripted sub-beats whose day has passed — they mutate world state (multipliers, venue list, titleClaims, WorldFighter injections via makeWorldFighter/makeNationalElite) and emit surfacing payloads; (2) evaluate triggered events against roster/world using the lifeEvents pattern — at most ONE player-facing choice event per advance gym-wide, and a weekly surfacing budget (~2 world clippings + 1 player item) so a crowded year never floods a Tuesday. Once-per-fighter/save flags persist on roster entries and era.flags. Choice events land as paper in the office — generalize the offer card into `Correspondence` (phone slip, letter, invoice, contract) with walk-in-style patience/expiry. Never a modal.

Surfacing. Clippings via pressItem/runPressCycle with new template categories in press_clippings.json; the ring death is the single frame-breaking front page, flagged unrepeatable; commission notices, sanctioning invoices, and contracts are typed office mail; corkboard via gymLog; milestones via the ledger. Byline memory: PressState.writers becomes `{ name, warmth, clipsByFighter, adoptedFighterId? }` (migrate from string[]).

Economy. pursefor gains `eraPurseMultiplier(weightClass, year, era)` and an offer-tier enum {club, tuesday, network, casino, cable, ppv} with gates (publicReputation/nationalRank/record) and itemized expense lines (travel, medical & license, sanctioning %) on the settlement sheet. Club purse BASES freeze nominally after 1979; recession windows freeze the inflation term on all tiers and supersede (never stack with) the club freeze. Multiplier arc per the kept beats: heavyweight 1.2 → 0.9 (post-king) → 1.5–2.0 (teen) → 1.1 (implosion) → bimodal (circus); welter/middle to 1.5 (kings) then lighter divisions 1.6–1.8 by the late 90s.

Venues/rankings. Seed 5–6 press venues per city so closures every 2–4 years leave at least one hall alive in 1990. Deepen the national elite to ten per division (worldSim churn already refills vacancies); era.titleClaims tracks 1–4 belts per division with per-belt purse multipliers; the magazine keeps one lineal column as the save's measuring stick.

NPCs. era.npcs registers persistent business characters — the crooked promoter, the apprentice who becomes the Tuesday matchmaker, the buyout shark, the fixer — generated once, referenced by every event needing a recurring voice.

Trait reveals. Adoption, ghost-writer, week-in-the-gym, week-under-the-lights, and the rolodex letter all route through the existing reveal pacing (~one secret a year per man); a reveal event consumes that budget, never adds to it.

Migration. Saves without `era` synthesize one on load, seeded from save id; beats already past fire silently (state only, no clipping flood) — except the ring death, which if past sets the rules without printing the front page. Bump the persistence version.

## Part IV — Naming Rules for Fictional Analogs

Every person, gym, sanctioning body, network, casino, venue, and TV series is generated per save from names.json subpools and small composers. No real names, no near-homophones, no acronym collisions with real bodies (WBC/WBA/IBF/WBO banned as strings). Archetype roles carry code ids (poet_king, heir, brawler_king, teen_hw); display names roll per save — a veteran of three saves never meets the same name twice. Sanctioning bodies compose as [World/International/National/United] + Boxing + [Council/Federation/Association/Union]. Broadcast stays generic in copy ("a national network," "the cable people") or uses generated fictional brands; the magazine remains The American Boxing Monthly. Casinos and halls extend the existing venue composer with a resort table and a ban-list of real casino/arena names. Nicknames come from existing pools via the-christening machinery; famous real nicknames (The Greatest, Iron —, Hands of Stone, Hitman, Marvelous, Sugar, Golden Boy) are banned on analog roles. Signature behavior may echo an archetype, but biographical identifiers — specific crimes, body parts, religions, dead relatives, exact famous dates — must be generalized or rolled from per-save variant tables. Foreign fighters roll nationality and name subpool per save.

## Part V — Gaps for a Future Pass

- No coach seat: the player's own trainers have no life events, poaching, aging, or mortality — the teen arc scripts a trainer's death for the world while yours are immortal.
- The world model is US-only: foreign champions, the lighter-weight god's home country, and overseas farewell/foreign-ring fights need a thin international layer.
- Five weight classes vs the 147/154/160 texture the four-kings and alphabet math assume — reconcile divisions or map the band onto welterweight/middleweight explicitly.
- Endgame past ~1999 undefined: the Tuesday series dies, the PPV bimodal economy hardens, and nothing replaces the ladder — a 2000s pass or a designed sunset is needed.
- The player never ages: 25 in 1975 is 50 in 2000; manager health, succession, and legacy events are missing entirely.
- Rivalry memory: rematch clauses, trilogies, and specific player-vs-world grudges are implied by several kept events but have no system of record.
- Women exist only as wives and mothers; the era-true beat (the first woman in the press box, the credential fights of the late 70s) deserves a deliberate pass.
- Race and neighborhood politics are touched only obliquely (sold-on-the-wrong-angle); decide in one deliberate, sensitivity-reviewed pass how far the game goes rather than by accretion.
- Gym relocation: Vegas is framed as a destination city but no event path ever takes the player there.
- The amateur pipeline (Golden Gloves, the gym's own amateur nights) is unmodeled though the Olympic beats lean on it for texture and walk-ins.
- FightResult needs first-class knockdown counts and round-completion data for two-bums-classic and how-the-zero-dies; expose structured fields, not narrative parsing.
- Pacing rehearsal: build a 1975-2000 dry-run harness that prints the year-by-year clipping/event density before shipping — 32 era beats plus 88 triggered events must be proven quiet enough.
