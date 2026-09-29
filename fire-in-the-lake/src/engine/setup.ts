// Game creation from a scenario definition.

import { push, shuffle, clearUndo, log } from '../core/framework';
import type { Faction, Game, PoolKind, SpaceState } from '../core/types';
import { FACTIONS, PIECE_TOTALS, POOL_KINDS } from '../core/types';
import { SCENARIOS } from '../data/scenarios';
import { CARDS } from '../data/cards';
import { SPACE_IDS } from '../data/map';
import { POOL_OF } from '../core/pieces';
import { computeEcon } from './coup';
import './sequence';

function zeroPools(): Record<PoolKind, number> {
  const r = {} as Record<PoolKind, number>;
  for (const k of POOL_KINDS) r[k] = 0;
  return r;
}

export function newGame(scenarioId: string, humans: Faction[], seed: number = Date.now()): Game {
  const sc = SCENARIOS[scenarioId];
  if (!sc) throw new Error(`Unknown scenario ${scenarioId}`);

  const spaces: Record<string, SpaceState> = {};
  for (const id of SPACE_IDS) {
    spaces[id] = { pieces: { ...(sc.pieces[id] ?? {}) }, support: sc.support[id] ?? 0, terror: 0 };
  }

  const casualties = { ...zeroPools(), ...sc.casualties };
  const out_of_play = { ...zeroPools(), ...sc.out_of_play };
  let available: Record<PoolKind, number>;
  if (sc.available) {
    available = { ...zeroPools(), ...sc.available };
  } else {
    const onMap = zeroPools();
    for (const id of SPACE_IDS) {
      for (const [k, n] of Object.entries(spaces[id].pieces)) onMap[POOL_OF[k as keyof typeof POOL_OF]] += n ?? 0;
    }
    available = zeroPools();
    for (const k of POOL_KINDS) available[k] = Math.max(0, PIECE_TOTALS[k] - onMap[k] - casualties[k] - out_of_play[k]);
  }

  const eligible = {} as Record<Faction, boolean>;
  for (const f of FACTIONS) eligible[f] = sc.eligible ? sc.eligible.includes(f) : true;

  const g: Game = {
    version: 1,
    seed: seed | 0,
    scenario: scenarioId,
    humans: [...humans],
    log: [],
    stack: [],
    active: null,
    over: false,
    result: null,
    spaces,
    available,
    casualties,
    out_of_play,
    resources: { ...sc.resources },
    aid: sc.aid,
    patronage: sc.patronage,
    econ: 0,
    trail: sc.trail,
    deck: [],
    current: null,
    next: null,
    discard: [],
    coup_count: 0,
    final_coup: false,
    eligible,
    next_ineligible: [],
    next_eligible: [],
    first_faction: null,
    first_action: null,
    acted: [],
    capabilities: { ...sc.capabilities },
    momentum: [],
    leader: sc.leader,
    leader_box: [...sc.leader_box],
    pivotal_played: [],
    pivotal_available: [],
    undo: [],
    tmp: {},
  };

  buildDeck(g, sc);

  g.current = g.deck.length ? g.deck.shift()! : null;
  g.next = g.deck.length ? g.deck.shift()! : null;
  log(g, `New game: ${sc.name}. Humans: ${humans.length ? humans.join(', ') : 'none'}.`);

  push(g, 'game', {});
  g.econ = computeEcon(g);
  clearUndo(g);
  return g;
}

function buildDeck(g: Game, sc: import('../core/types').ScenarioDef): void {
  const cfg = sc.deck;
  const exclude = new Set(cfg.exclude ?? []);
  const isCoup = (id: number) => { const c = CARDS.find((x) => x.id === id); return c ? c.coup : id >= 125 && id <= 130; };
  const isPivotal = (id: number) => { const c = CARDS.find((x) => x.id === id); return c ? !!c.pivotal : id >= 121 && id <= 124; };

  const events = CARDS.filter((c) => !c.coup && !c.pivotal && !exclude.has(c.id) && !isCoup(c.id) && !isPivotal(c.id)
    && c.id !== cfg.first_card).map((c) => c.id);
  shuffle(g, events);

  let coupPool = (cfg.coup_cards ?? CARDS.filter((c) => c.coup).map((c) => c.id))
    .filter((id) => !exclude.has(id) && id !== sc.leader && !sc.leader_box.includes(id));
  if (coupPool.length === 0) coupPool = cfg.coup_cards ?? [];
  coupPool = [...coupPool];
  shuffle(g, coupPool);

  const deck: number[] = [];
  for (let i = 0; i < cfg.piles; i++) {
    const n = cfg.events_per_pile - (i === 0 && cfg.first_card != null ? 1 : 0);
    const pile = events.splice(0, Math.max(0, n));
    const coup = coupPool[i] ?? coupPool[coupPool.length - 1];
    if (coup != null) pile.push(coup);
    shuffle(g, pile);
    if (i === 0 && cfg.first_card != null) pile.unshift(cfg.first_card);
    deck.push(...pile);
  }
  // The very first card is never a Coup card.
  if (deck.length && isCoup(deck[0])) {
    const j = deck.findIndex((id) => !isCoup(id));
    if (j > 0) [deck[0], deck[j]] = [deck[j], deck[0]];
  }
  g.deck = deck;
}
