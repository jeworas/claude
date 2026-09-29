// Bot: rollout-based card choice + greedy in-frame policy with cached plans.
//
// botStep(g) returns ONE legal action for the current faction.
//  * At a card_choice for a bot faction we simulate each option (Event unshaded/shaded, Op, Op+SA,
//    Limited Op, Pass) on a clone (with a perturbed RNG so the bot cannot peek at die rolls), run the
//    greedy policy to the end of that faction's action, and score the result. The winning line is
//    cached as a plan and replayed while it stays legal.
//  * Elsewhere a fast greedy policy is used: static space values for 'space' picks, one-step
//    lookahead on a clone for everything else.
//  * Loop safety: per-frame selection counter and per-option use counts force a finish verb.
import { cloneGame, currentFaction, doAction, getView, top } from '../core/framework';
import {
  victoryMargin, totalSupport, coinControlledPop, nvaControlledPop, countOnMap,
  countCOIN, countFaction, countBases, space,
} from '../core/pieces';
import type { ActionOption, Faction, Game } from '../core/types';
import { FACTIONS } from '../core/types';
import { CARD } from '../data/cards';

export interface BotAction { verb: string; arg?: string | number }

const MAX_SELECTIONS = 25;
const FINISH_VERBS = ['done', 'skip', 'pass', 'next', 'end', 'finish', 'ok', 'continue', 'none', 'no'];
const FINISH_ORDER = ['done', 'next', 'end', 'finish', 'skip', 'continue', 'ok', 'none', 'no', 'pass'];
const AVOID_VERBS = ['cancel', 'back', 'undo'];
const ROLLOUT_STEP_CAP = 160;

interface Ctx { key: string; n: number; used: Record<string, number> }
const counters = new WeakMap<Game, Ctx>();
interface Plan { faction: Faction; card: number | null; acts: BotAction[]; idx: number }
const plans = new WeakMap<Game, Plan>();

function hash(...n: number[]): number {
  let h = 2166136261;
  for (const v of n) { h ^= (v | 0) + 0x9e3779b9; h = Math.imul(h, 16777619); h ^= h >>> 13; }
  return (h >>> 0) / 4294967296;
}

// ------------------------------------------------------------------ evaluation

function nextIsCoup(g: Game): boolean {
  const n = g.next;
  return n !== null && !!CARD[n]?.coup;
}

// Heuristic evaluation of a game state from `f`'s viewpoint (higher is better).
export function evaluate(g: Game, f: Faction): number {
  let s = victoryMargin(g, f);
  // Deny the leading opponent; more urgently when a Coup (victory check) is next.
  const urgency = nextIsCoup(g) || (g.current !== null && !!CARD[g.current]?.coup) ? 1.6 : 1;
  let lead = -Infinity;
  for (const o of FACTIONS) if (o !== f) lead = Math.max(lead, victoryMargin(g, o));
  s -= 0.45 * urgency * lead;
  if (lead > -4) s -= 3 * urgency * (lead + 4) / 4; // threatening to win: extra penalty
  switch (f) {
    case 'US':
      s += 0.5 * totalSupport(g) + 0.3 * coinControlledPop(g) - 0.2 * g.casualties.us_troops - 0.2 * g.casualties.us_base;
      break;
    case 'ARVN':
      s += 0.4 * coinControlledPop(g) + 0.3 * g.patronage + 0.15 * g.resources.ARVN + 0.05 * g.aid;
      break;
    case 'NVA':
      s += 0.4 * nvaControlledPop(g) + 1.0 * countOnMap(g, 'nva_base', 'nva_tunnel') + 1.0 * g.trail + 0.2 * g.resources.NVA
        + 0.1 * countOnMap(g, 'nva_troops');
      break;
    case 'VC':
      s += 1.0 * countOnMap(g, 'vc_base', 'vc_tunnel') + 0.2 * g.resources.VC + 0.05 * countOnMap(g, 'vc_guer_u', 'vc_guer_a');
      break;
  }
  if (g.over && g.result) s += new RegExp(`\\b${f} wins\\b`).test(g.result) ? 1000 : -200;
  return s;
}

// ------------------------------------------------------------------ static space value

function spaceValue(g: Game, f: Faction, id: string): number {
  const sd = space(id);
  const st = g.spaces[id];
  const pop = sd.pop;
  const coin = countCOIN(g, id);
  const nva = countFaction(g, id, 'NVA');
  const vc = countFaction(g, id, 'VC');
  let v = 0;
  switch (f) {
    case 'US':
    case 'ARVN':
      v = 1.8 * (nva + vc) + 2.5 * countBases(g, id, 'NVA') + 2.5 * countBases(g, id, 'VC')
        + pop * (st.support < 2 ? 1.2 : 0.2) + 0.3 * coin + (sd.type === 'loc' ? sd.econ * 0.8 : 0);
      break;
    case 'NVA':
      v = 1.2 * coin + 0.7 * nva + pop * 0.8 + (nva > 0 ? 1 : 0) + (sd.country !== 'south_vietnam' ? 0.5 : 0) + (sd.type === 'loc' ? 0.3 : 0);
      break;
    case 'VC':
      v = pop * (st.support > -2 ? 1.5 : 0.1) + 0.9 * vc + 0.5 * coin + (vc > 0 ? 1 : 0) + (sd.type === 'loc' ? sd.econ * 0.6 : 0);
      break;
  }
  return v;
}

const VERB_PREF: Record<Faction, string[]> = {
  US: ['assault', 'sweep', 'air_strike', 'train', 'patrol', 'advise'],
  ARVN: ['train', 'govern', 'sweep', 'assault', 'raid', 'patrol'],
  NVA: ['rally', 'attack', 'march', 'infiltrate', 'bombard', 'ambush'],
  VC: ['rally', 'terror', 'tax', 'attack', 'subvert', 'ambush'],
};

function verbBonus(f: Faction, a: ActionOption): number {
  const key = `${a.verb} ${a.arg ?? ''}`.toLowerCase();
  const idx = VERB_PREF[f].findIndex((w) => key.includes(w));
  return idx < 0 ? 0 : 0.5 - idx * 0.05;
}

function isFinish(a: ActionOption): boolean { return FINISH_VERBS.includes(a.verb); }

// ------------------------------------------------------------------ cloning / lookahead

function fastClone(g: Game): Game {
  const u = g.undo; const l = g.log;
  g.undo = []; g.log = [];
  try { return cloneGame(g); } finally { g.undo = u; g.log = l; }
}

function lookahead(g: Game, f: Faction, a: ActionOption): number {
  const c = fastClone(g);
  try { doAction(c, a.verb, a.arg); return evaluate(c, f); } catch { return -Infinity; }
}

// ------------------------------------------------------------------ in-frame policy

// Picks an action for a non-card_choice frame. `ctx` tracks loop safety. `cap` bounds lookahead.
function decide(g: Game, ctx: Ctx, cap: number): ActionOption | null {
  const view = getView(g);
  const acts = view.actions.filter((a) => a.verb !== 'undo');
  if (!acts.length) return null;
  const f = currentFaction(g) ?? g.active ?? 'US';
  const fr = top(g);
  const key = `${g.stack.length}:${fr?.state ?? ''}`;
  if (ctx.key !== key) { ctx.key = key; ctx.n = 0; ctx.used = {}; }
  ctx.n++;
  const used = ctx.used;
  const sig = (a: ActionOption) => `${a.verb}|${a.arg ?? ''}`;
  const take = (a: ActionOption) => { used[sig(a)] = (used[sig(a)] ?? 0) + 1; return a; };

  const fresh = acts.filter((a) => (used[sig(a)] ?? 0) < 4);
  const live = fresh.length ? fresh : acts;
  const finish = live.filter(isFinish);
  const usable = live.filter((a) => !AVOID_VERBS.includes(a.verb) || (ctx.n > MAX_SELECTIONS && a.verb !== 'undo'));
  const pool = usable.length ? usable : live;

  if (ctx.n > MAX_SELECTIONS && !finish.length) {
    const exit = pool.find((a) => AVOID_VERBS.includes(a.verb));
    if (exit) return take(exit);
  }
  if (ctx.n > MAX_SELECTIONS && finish.length) {
    finish.sort((x, y) => FINISH_ORDER.indexOf(x.verb) - FINISH_ORDER.indexOf(y.verb));
    return take(finish[0]);
  }
  if (ctx.n > MAX_SELECTIONS * 3) return take(pool[Math.floor(hash(g.seed, ctx.n) * pool.length)]);
  if (pool.length === 1) return take(pool[0]);

  const nonFinish = pool.filter((a) => !isFinish(a));
  const spaces = nonFinish.filter((a) => a.verb === 'space' && typeof a.arg === 'string');
  // Pure space selection: static heuristic, no cloning.
  if (spaces.length && spaces.length === nonFinish.length) {
    let best = spaces[0]; let bs = -Infinity;
    spaces.forEach((a, i) => {
      const s = spaceValue(g, f, a.arg as string) + hash(g.seed, ctx.n, i) * 0.3;
      if (s > bs) { bs = s; best = a; }
    });
    // Stop picking spaces that are worthless once we have picked a few.
    if (finish.length && ctx.n > 1 && bs < 1.0) return take(finish[0]);
    return take(best);
  }
  // op_menu style verbs and others: lookahead over a bounded, pre-ranked candidate list.
  let cands = nonFinish;
  if (cands.length > cap) {
    cands = cands
      .map((a, i) => ({ a, r: (a.verb === 'space' ? spaceValue(g, f, a.arg as string) : 0) + hash(g.seed, ctx.n, i) }))
      .sort((x, y) => y.r - x.r).slice(0, cap).map((x) => x.a);
  }
  let best: ActionOption | null = null; let bestScore = -Infinity;
  cands.forEach((a, i) => {
    const s = lookahead(g, f, a) + verbBonus(f, a) + hash(g.seed, ctx.n, i) * 0.05;
    if (s > bestScore) { bestScore = s; best = a; }
  });
  if (finish.length) {
    const fa = finish[0];
    if (!best || bestScore === -Infinity) return take(fa);
    // Finish only if continuing clearly hurts (costs more than it gains).
    const fs = lookahead(g, f, fa);
    if (fs > bestScore + 1.0) return take(fa);
  }
  return take(best ?? pool[0]);
}

// ------------------------------------------------------------------ card-level rollouts

interface Line { first: ActionOption; acts: BotAction[]; score: number }

function toAct(a: ActionOption): BotAction { return a.arg === undefined ? { verb: a.verb } : { verb: a.verb, arg: a.arg }; }

function rollout(g: Game, f: Faction, first: ActionOption, salt: number): Line {
  const c = fastClone(g);
  c.seed = (c.seed ^ Math.floor(hash(salt, c.seed) * 0x7fffffff)) | 0; // do not peek at real dice
  const depth = c.stack.length;
  const acts: BotAction[] = [toAct(first)];
  const ctx: Ctx = { key: '', n: 0, used: {} };
  try {
    doAction(c, first.verb, first.arg);
    let steps = 0;
    while (!c.over && c.stack.length > depth && steps < ROLLOUT_STEP_CAP) {
      if (top(c)?.state === 'coup') break;
      const a = decide(c, ctx, 8);
      if (!a) break;
      acts.push(toAct(a));
      doAction(c, a.verb, a.arg);
      steps++;
    }
    return { first, acts, score: evaluate(c, f) };
  } catch {
    return { first, acts, score: -Infinity };
  }
}

function chooseLine(g: Game, f: Faction, acts: ActionOption[]): Line | null {
  const res = f === 'US' ? 99 : g.resources[f];
  const card = g.current !== null ? CARD[g.current] : undefined;
  let best: Line | null = null;
  acts.forEach((a, i) => {
    if (AVOID_VERBS.includes(a.verb)) return;
    const l = rollout(g, f, a, i + 1);
    let s = l.score;
    // Small tempo terms: acting makes us Ineligible next card; passing keeps us free and pays a bit.

    // Acting is generally better than passing (the game is a race), unless we cannot pay for it.
    const poor = f !== 'US' && res <= 2;
    if (a.verb === 'pass') s += poor ? 2.5 : 0;
    else if (a.verb === 'op' || a.verb === 'op_sa') s += poor ? 0 : 2.0;
    else if (a.verb === 'limited_op') s += poor ? 0 : 1.2;
    else if (a.verb === 'event') s += 1.0;
    if (a.verb === 'event' && card && card.order[0] === f) s += 0.1;
    s += hash(g.seed, g.current ?? 0, i) * 0.05;
    l.score = s;
    if (!best || s > best.score) best = l;
  });
  return best;
}

// ------------------------------------------------------------------ entry point

export function botStep(g: Game): BotAction {
  const view = getView(g);
  const acts = view.actions.filter((a) => a.verb !== 'undo');
  if (acts.length === 0) return { verb: 'done' };
  const f = currentFaction(g) ?? g.active ?? 'US';
  const fr = top(g);

  // 1. Replay a cached plan while it stays legal.
  const plan = plans.get(g);
  if (plan) {
    const nxt = plan.acts[plan.idx];
    if (nxt && plan.faction === f && plan.card === g.current
      && acts.some((a) => a.verb === nxt.verb && a.arg === nxt.arg)) {
      plan.idx++;
      if (plan.idx >= plan.acts.length) plans.delete(g);
      return nxt;
    }
    plans.delete(g);
  }

  // 2. Card-level decision: simulate each option.
  const isChoice = fr?.state === 'card_choice';
  if (isChoice && acts.length > 1 && acts.some((a) => a.verb === 'pass')) {
    const line = chooseLine(g, f, acts);
    if (line) {
      if (line.acts.length > 1) plans.set(g, { faction: f, card: g.current, acts: line.acts, idx: 1 });
      return line.acts[0];
    }
  }

  // 3. Greedy in-frame policy with loop guards.
  let ctx = counters.get(g);
  if (!ctx) { ctx = { key: '', n: 0, used: {} }; counters.set(g, ctx); }
  const a = decide(g, ctx, 40);
  return a ? toAct(a) : { verb: 'done' };
}
