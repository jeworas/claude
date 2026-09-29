# Fire in the Lake (3D)

A browser implementation of GMT Games' *Fire in the Lake* (COIN Series vol. IV) for 1–4 players, with AI opponents, built with TypeScript, Vite and three.js.

```
cd fire-in-the-lake
npm install
npm run dev        # open the printed URL
npm test           # 512 engine, event, AI and soak tests
npm run build      # static build in dist/
```

## Playing

1. On the start screen, pick a scenario: Short 1965–67, Medium 1968–72 or Full 1964–72.
2. Set each faction (US, ARVN, NVA, VC) to Human or AI. Choose a seed if you want.
3. Legal spaces pulse on the 3D map. Click them, or click pieces, to make choices. Buttons in the bottom prompt cover everything else, and **Undo** is always there.
4. **?** opens the rules help: sequence of play, faction goals, Operations and Special Activities, and the piece legend.
5. The game autosaves after every action. **Save** and **Load** also work with JSON files. Use the speed slider and **Fast** to control how fast the AI plays.

Debug URL: `?auto=short&seed=7&humans=US,VC` starts a game straight away.

## What's implemented

- The full map: 47 spaces with population, econ, terrain and adjacency.
- Three scenarios, and a deck built from piles with Coup cards.
- The sequence of play: eligibility, 1st/2nd Eligible options, Pass rewards, Monsoon, and Pivotal Events with their preconditions.
- All Operations and Special Activities for all four factions, including capability and momentum modifiers.
- The full Coup Round: Victory, Resources, Support, Redeploy, Commitment and Reset. It also handles RVN leaders, Failed Attempts and Final Coup scoring.
- All 130 cards: 120 events with both sides, 4 pivotal events and 6 Coup cards.
- AI bots for every faction. They use rollout lookahead and deny the leading opponent.

## Sources and caveats

- **Sources.** Card text, faction orders, periods and tips are copied from the 2018 GMT Playbook. Rules, scenario setups and non-player priorities come from the 2018 Rulebook. Each scenario's starting victory scores match the rulebook checkpoints. The extracted PDF text sits in `reference/` locally and is not committed.
- **AI.** The non-player AI follows the rulebook's section 8 priorities. It doesn't use the Random Spaces tables or the detailed per-space priority foldouts, which are not in the rulebook text; it uses heuristics there instead. In AI-only games the VC still wins most often.
- **Map.** Population and Econ were fitted to the rulebook's victory checkpoints, and adjacency comes from the rules and playbook. A few province-to-province borders may still differ from the printed board.

See `ARCHITECTURE.md` for the engine design and module layout.
