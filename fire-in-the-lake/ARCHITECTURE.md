# Fire in the Lake: architecture and team contract

This is a browser implementation of GMT's *Fire in the Lake* (COIN series, vol. IV).
It uses Vite, TypeScript and three.js. It is a standalone project inside this repo;
the root Next.js app ignores this folder.

```
npm install
npm run dev        # play
npm run typecheck
npm test           # vitest (tests/**/*.test.ts)
npm run build
```

## Layers

| Layer | Files | Owner |
|---|---|---|
| Core contract (do not change shapes without coordination) | `src/core/types.ts`, `src/core/framework.ts`, `src/core/pieces.ts` | lead |
| Data | `src/data/map.ts`, `src/data/cards.ts`, `src/data/scenarios.ts` | agent A (data + AI) |
| AI bots | `src/ai/*` | agent A |
| Setup, sequence of play, op menu, US/ARVN ops & special activities | `src/engine/setup.ts`, `sequence.ts`, `opmenu.ts`, `coin_ops.ts` | agent B |
| NVA/VC ops & special activities, Coup Round, victory | `src/engine/insurgent_ops.ts`, `coup.ts` | agent C |
| Events (all 130 cards), capabilities, momentum | `src/engine/events/**` | agent D |
| 3D board, HUD, input, bot driving | `index.html`, `src/main.ts`, `src/ui/**` | agent E |

Each agent creates **only** its own files (plus tests under `tests/<area>*.test.ts`).
If you need something from another layer that does not exist yet, write your code
against the contract below. Do not edit other agents' files.

## Engine model

The engine is a state machine with an explicit stack (`src/core/framework.ts`).
The game object `Game` (`src/core/types.ts`) is plain JSON.

* `registerState(name, {faction?, enter?, prompt, act, resume?})` registers a decision point.
* `push(g, name, args)` enters a sub-state. `pop(g, result)` returns to the parent and calls
  its `resume(g, args, result)`. `goto` replaces the top frame.
* `prompt()` offers legal actions with `p.action(verb, arg, label)`,
  `p.space(id)` (verb `space`), and `p.piece(space, kind)` (verb `piece`, arg `"space:kind"`).
  Always offer a way forward, such as `done`, `skip` or `pass`, so the game can never deadlock.
* UI and AI only use `getView(g)`, `doAction(g, verb, arg)`, `currentFaction(g)` and
  `newGame(...)` from `src/engine/index.ts`.
* Every piece movement goes through `src/core/pieces.ts` (`place`, `remove`, `removeTo`,
  `move`, `flip`, `movePool`). Control and victory helpers also live there.
* Randomness only comes from `random`/`rollDie`/`shuffle` in the framework (seeded).
* Call `clearUndo(g)` whenever hidden information is revealed, such as when a card is drawn.
* `g.active` is the faction currently deciding. A state may override this with `faction()`.

### Well-known state names (the cross-agent contract)

Common args for every op/SA state: `{ faction: Faction, free?: boolean, limited?: boolean,
spaces?: string[] /* restrict to these spaces */, max?: number /* max spaces */ }` plus
anything else the owner documents at the top of its file. `free` means no Resource cost
(and for events, ignore normal restrictions the card says to ignore). When the op/SA is
finished it must `pop(g, { done: true, spaces: string[] })`.

| State | Owner | Meaning |
|---|---|---|
| `game` | B | Bottom frame. Draws cards, runs the sequence of play, and triggers `coup` when a Coup card is current. |
| `card_choice` | B | 1st/2nd eligible faction chooses Op / Op+SA / Limited Op / Event / Pass. |
| `op_menu` | B | args `{faction, limited, sa, free}`. Offers the faction's 4 Operations, and its Special Activity when `sa` is true. SA may be done before or after the op. Pushes the states below. |
| `op_train`, `op_patrol`, `op_sweep`, `op_assault` | B | US or ARVN Operations (`faction` arg). |
| `sa_advise`, `sa_air_lift`, `sa_air_strike` | B | US Special Activities |
| `sa_govern`, `sa_transport`, `sa_raid` | B | ARVN Special Activities |
| `op_rally`, `op_march`, `op_attack`, `op_terror` | C | NVA or VC Operations (`faction` arg). |
| `sa_infiltrate`, `sa_bombard` | C | NVA Special Activities |
| `sa_ambush` | C | NVA or VC Ambush (`faction` arg). Must accompany Attack or March per the rules; C decides how (an option inside `op_attack`/`op_march` is fine), but the state name must exist for free events. |
| `sa_tax`, `sa_subvert` | C | VC Special Activities |
| `coup` | C | Whole Coup Round (6.0): Victory, Resources, Support, Redeploy, Commitment, Reset. Sets `g.over`/`g.result` on victory or after the final Coup. Pops when done. |
| `event` | D | args `{card: number, shaded: boolean, faction: Faction}`. Executes the event, pushing its own helper states as needed, then pops. |
| `pivotal` | D | args `{card, faction}`. Plays a pivotal event (cards 121-124). |

Engine flags that other layers read or write:

* `g.capabilities[cardId] = 'unshaded' | 'shaded'`: set by D, read by B and C when
  resolving ops (for example cards 4 Top Gun, 8 Arc Light, 11 Abrams, 13 Cobras, 14 M-48 Patton,
  18 Combined Action Platoons, 19 CORDS, 20 Laser Guided Bombs, 28 Search & Destroy, 31 AAA,
  32 Long Range Guns, 33 MiGs, 34 SA-2s, 45 PT-76, 61 Armored Cavalry, 86 Mandate of Heaven,
  101 Booby Traps, 104 Main Force Bns, 116 Cadres).
* `g.momentum` (card ids): set by D, cleared by C at Coup Reset, read by B and C
  (for example 5 Wild Weasels, 7 ADSID, 10 Rolling Thunder, 15 Medevac, 16 Blowtorch Komer,
  17 Claymores, 22 Da Nang, 38 McNamara Line, 39 Oriskany, 41 Bombing Pause, 46 559th Transport Grp,
  72 Body Count, 78 General Lansdale, 115 Typhoon Kate).
* `g.next_eligible` and `g.next_ineligible`: set by D (events like "Executing faction stays
  Eligible"). B applies them when adjusting eligibility at the end of the card.
* `g.leader` and `g.leader_box`: set by B/C when a Coup card with a leader is resolved.
  Leader effects (Minh, Khanh, Young Turks, Ky, Thieu) are read by B/C.

## AI

`src/ai/bot.ts` exports `botStep(g: Game): { verb: string; arg?: string | number }`. It returns
one legal action for `currentFaction(g)`. It must always return a legal action and must avoid
loops. The UI calls it repeatedly while the current faction is not in `g.humans`.
