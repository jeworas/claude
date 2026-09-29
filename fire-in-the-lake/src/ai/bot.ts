// Greedy one-step-lookahead bot. botStep() returns ONE legal action for the current faction.
import { cloneGame, currentFaction, doAction, getView, top } from '../core/framework';
import { victoryMargin, totalSupport, coinControlledPop, nvaControlledPop, countOnMap } from '../core/pieces';
import type { ActionOption, Faction, Game } from '../core/types';
import { FACTIONS, POOL_KINDS } from '../core/types';
import { CARD } from '../data/cards';

export interface BotAction { verb: string; arg?: string | number }

const MAX_SELECTIONS = 25;      // selections in one frame before we push to finish it
const MAX_CANDIDATES = 40;      // lookahead budget per step
const FINISH_VERBS = ['done', 'skip', 'pass', 'next', 'end', 'finish', 'ok', 'continue', 'none', 'no'];
const AVOID_VERBS = ['cancel', 'back', 'undo'];

// Per-game frame counter: key = stack depth + top state name.
const counters = new WeakMap<Game, { key: string; n: number }>();

function hash(...n: number[]): number {
  let h = 2166136261;
  for (const v of n) { h ^= (v | 0) + 0x9e3779b9; h = Math.imul(h, 16777619); h ^= h >>> 13; }
  return (h >>> 0) / 4294967296;
}


// Heuristic evaluation of a game state from `f`'s viewpoint.
export function evaluate(g: Game, f: Faction): number {
  let s = victoryMargin(g, f);
  const others = FACTIONS.filter((x) => x !== f);
  let opp = 0;
  for (const o of others) opp = Math.max(opp, victoryMargin(g, o));
  s -= 0.2 * opp;
  switch (f) {
    case 'US':
      s += 0.5 * totalSupport(g) + 0.3 * coinControlledPop(g) - 0.4 * g.casualties.us_troops - 0.4 * g.casualties.us_base;
      break;
    case 'ARVN':
      s += 0.4 * coinControlledPop(g) + 0.3 * g.patronage + 0.12 * g.resources.ARVN + 0.05 * g.aid;
      break;
    case 'NVA':
      s += 0.4 * nvaControlledPop(g) + 1.0 * countOnMap(g, 'nva_base', 'nva_tunnel') + 1.0 * g.trail + 0.12 * g.resources.NVA;
      break;
    case 'VC':
      s += 1.0 * countOnMap(g, 'vc_base', 'vc_tunnel') + 0.12 * g.resources.VC;
      break;
  }
  if (g.over) s += g.result && g.result.includes(f) ? 1000 : 0;
  return s;
}

const VERB_PREF: Record<Faction, string[]> = {
  US: ['assault', 'sweep', 'air_strike', 'train', 'patrol', 'advise'],
  ARVN: ['train', 'govern', 'sweep', 'assault', 'raid', 'patrol'],
  NVA: ['rally', 'march', 'attack', 'infiltrate', 'bombard', 'ambush'],
  VC: ['rally', 'terror', 'tax', 'attack', 'subvert', 'ambush'],
};

function verbBonus(f: Faction, a: ActionOption): number {
  const key = `${a.verb} ${a.arg ?? ''}`.toLowerCase();
  const idx = VERB_PREF[f].findIndex((w) => key.includes(w));
  return idx < 0 ? 0 : 0.5 - idx * 0.05;
}

function isFinish(a: ActionOption): boolean { return FINISH_VERBS.includes(a.verb); }

// Evaluate one action on a clone; returns -Infinity if it throws.
function lookahead(g: Game, f: Faction, a: ActionOption): number {
  const savedUndo = g.undo; const savedLog = g.log;
  g.undo = []; g.log = [];
  let c: Game;
  try { c = cloneGame(g); } finally { g.undo = savedUndo; g.log = savedLog; }
  try {
    doAction(c, a.verb, a.arg);
    return evaluate(c, f);
  } catch {
    return -Infinity;
  }
}

function pickCardChoice(g: Game, f: Faction, acts: ActionOption[]): ActionOption {
  const res = f === 'US' ? 99 : g.resources[f];
  const card = g.current !== null ? CARD[g.current] : undefined;
  const first = g.first_action === null; // we are the first eligible faction
  let best = acts[0]; let bestW = -Infinity;
  for (const a of acts) {
    let w = 0;
    switch (a.verb) {
      case 'op_sa': w = 3; break;
      case 'op': w = 2.6; break;
      case 'event': w = 2.2; break;
      case 'limited_op': w = 1.4; break;
      case 'pass': w = 0.5; break;
      default: w = 1; break;
    }
    if (a.verb === 'event' && card) {
      if (card.order[0] === f) w += 0.6;
      if (card.capability || card.momentum) w += 0.3;
      // only take events likely to help: favour our own faction-order slots
      const slot = card.order.indexOf(f);
      w += (3 - slot) * 0.1;
    }
    if (a.verb === 'pass') { if (res <= 2) w += 2.5; if (!first) w += 0.2; }
    if ((a.verb === 'op' || a.verb === 'op_sa' || a.verb === 'limited_op') && res <= 1 && f !== 'US') w -= 1.5;
    if (a.verb === 'op_sa' && res <= 3 && f !== 'US') w -= 1;
    w += hash(g.seed, g.log.length, g.current ?? 0, a.verb.length, a.verb.charCodeAt(0)) * 0.8;
    if (w > bestW) { bestW = w; best = a; }
  }
  return best;
}

export function botStep(g: Game): BotAction {
  const view = getView(g);
  const acts = view.actions.filter((a) => a.verb !== 'undo');
  if (acts.length === 0) return { verb: 'done' };
  const f = currentFaction(g) ?? g.active ?? 'US';
  const fr = top(g);
  const key = `${g.stack.length}:${fr?.state ?? ''}`;

  let c = counters.get(g);
  if (!c || c.key !== key) { c = { key, n: 0 }; counters.set(g, c); }
  c.n++;

  const out = (a: ActionOption): BotAction => (a.arg === undefined ? { verb: a.verb } : { verb: a.verb, arg: a.arg });

  const finish = acts.filter(isFinish);
  const usable = acts.filter((a) => !AVOID_VERBS.includes(a.verb));
  const pool = usable.length ? usable : acts;

  // Loop breaker: after many selections in the same frame, finish it.
  if (c.n > MAX_SELECTIONS && finish.length) {
    // Prefer 'done' style over 'pass' where both exist.
    const order = ['done', 'next', 'end', 'finish', 'skip', 'continue', 'ok', 'none', 'no', 'pass'];
    finish.sort((x, y) => order.indexOf(x.verb) - order.indexOf(y.verb));
    return out(finish[0]);
  }
  if (c.n > MAX_SELECTIONS * 3) return out(pool[Math.floor(hash(g.seed, c.n) * pool.length)]);

  if (pool.length === 1) return out(pool[0]);

  // Top-level card choice.
  if (fr?.state === 'card_choice' || pool.some((a) => a.verb === 'event') && pool.some((a) => a.verb === 'pass' || a.verb === 'limited_op')) {
    return out(pickCardChoice(g, f, pool));
  }

  // Greedy lookahead among a bounded candidate set.
  const nonFinish = pool.filter((a) => !isFinish(a));
  let cands = nonFinish;
  if (cands.length > MAX_CANDIDATES) {
    cands = cands
      .map((a, i) => ({ a, r: hash(g.seed, g.log.length, c!.n, i) }))
      .sort((x, y) => x.r - y.r).slice(0, MAX_CANDIDATES).map((x) => x.a);
  }
  let best: ActionOption | null = null; let bestScore = -Infinity;
  for (let i = 0; i < cands.length; i++) {
    const a = cands[i];
    const s = lookahead(g, f, a) + verbBonus(f, a) + hash(g.seed, g.log.length, c.n, i) * 0.05;
    if (s > bestScore) { bestScore = s; best = a; }
  }
  if (finish.length) {
    const fa = finish[0];
    const fs = lookahead(g, f, fa);
    // Finish early only if continuing clearly hurts (e.g. costs more than it gains).
    if (!best || bestScore === -Infinity || fs > bestScore + 1.0) return out(fa);
  }
  if (best) return out(best);
  return out(pool[0]);
}
