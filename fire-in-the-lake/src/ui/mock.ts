// Fallback demo engine, used only if the real engine fails to load (or with ?mock in the URL).
import type { ActionOption, Faction, Game, PieceKind, PoolKind, View } from '../core/types';
import { PIECE_KINDS, POOL_KINDS } from '../core/types';
import { SPACES } from '../data/map';
import { SCENARIOS } from '../data/scenarios';

export interface EngineApi {
  newGame(scenario: string, humans: Faction[], seed: number): Game;
  getView(g: Game): View;
  doAction(g: Game, verb: string, arg?: string | number): void;
  currentFaction(g: Game): Faction | null;
  isLegal(g: Game, verb: string, arg?: string | number): boolean;
}

function rnd(seed: { v: number }) {
  seed.v = (seed.v * 1664525 + 1013904223) >>> 0;
  return seed.v / 4294967296;
}

const zero = () => Object.fromEntries(POOL_KINDS.map((k) => [k, 0])) as Record<PoolKind, number>;

function make(scenario: string, humans: Faction[], seed: number): Game {
  const s = { v: seed >>> 0 };
  const spaces: Game['spaces'] = {};
  for (const d of SPACES) {
    const pieces: Partial<Record<PieceKind, number>> = {};
    if (d.type !== 'loc' || rnd(s) < 0.4) {
      const n = Math.floor(rnd(s) * (d.type === 'city' ? 7 : 6));
      for (let i = 0; i < n; i++) { const k = PIECE_KINDS[Math.floor(rnd(s) * PIECE_KINDS.length)]; pieces[k] = (pieces[k] ?? 0) + 1; }
    }
    spaces[d.id] = { pieces, support: d.pop > 0 && d.type !== 'loc' ? (Math.floor(rnd(s) * 5) - 2) as any : 0, terror: rnd(s) < 0.15 ? 1 : 0 };
  }
  const av = zero(); for (const k of POOL_KINDS) av[k] = Math.floor(rnd(s) * 8);
  return {
    version: 1, seed, scenario, humans, log: ['Demo mode: the rules engine is not available.'], stack: [{ state: 'mock', args: {} }],
    active: 'US', over: false, result: null, spaces, available: av, casualties: zero(), out_of_play: zero(),
    resources: { ARVN: 30, NVA: 20, VC: 10 }, aid: 15, patronage: 20, econ: 10, trail: 2, deck: [], current: null, next: null, discard: [],
    coup_count: 0, final_coup: false, eligible: { US: true, ARVN: true, NVA: false, VC: true }, next_ineligible: [], next_eligible: [],
    first_faction: null, first_action: null, acted: [], capabilities: {}, momentum: [], leader: null, leader_box: [], pivotal_played: [],
    pivotal_available: [], undo: [], tmp: {},
  };
}

export const mockApi: EngineApi = {
  newGame: (sc, h, seed) => make(SCENARIOS[sc] ? sc : 'demo', h, seed),
  getView(g) {
    const actions: ActionOption[] = [{ verb: 'pass', label: 'Pass' }];
    for (const d of SPACES) if (d.pop > 0 || d.type === 'loc') actions.push({ verb: 'space', arg: d.id, label: d.name, space: d.id });
    actions.push({ verb: 'piece', arg: 'saigon:us_troops', label: 'Select US Troops', space: 'saigon', piece: 'us_troops' });
    if (g.undo.length) actions.push({ verb: 'undo', label: 'Undo' });
    return { active: g.active, prompt: 'Demo: click any highlighted space to add a random piece.', actions, selected: ['hue'] };
  },
  doAction(g, verb, arg) {
    g.undo.push(JSON.stringify({ ...g, undo: [] }));
    if (verb === 'space') {
      const s = { v: g.seed++ };
      const k = PIECE_KINDS[Math.floor(rnd(s) * PIECE_KINDS.length)];
      const p = g.spaces[arg as string].pieces; p[k] = (p[k] ?? 0) + 1;
      g.log.push(`Added ${k} to ${arg}.`);
    } else if (verb === 'undo') {
      g.undo.pop(); const u = g.undo; Object.assign(g, JSON.parse(g.undo.pop() ?? JSON.stringify(g))); g.undo = u;
    }
  },
  currentFaction: (g) => g.active,
  isLegal: () => true,
};
