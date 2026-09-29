// Bot: Non-Player rules (Rulebook section 8) on top of a fast greedy in-frame policy.
//
// botStep(g) returns ONE legal action for the current faction.
//  * card_choice follows 8.1/8.4-8.8: Capability pass/play rolls (d6 vs Coup cards in the RVN Leader box),
//    Event only if it is effective (verified on a clone), dual-use events use unshaded for US/ARVN and
//    shaded for NVA/VC, then the faction's Operation priorities (VC Terror/Rally/March/Attack, NVA
//    Attack/Terror/Rally/March, ARVN Train/Patrol/Assault/Sweep, US Assault/Sweep/...). Each priority is
//    tested by simulating the Operation on a clone ("if none, instead ...").
//  * op_menu picks the Operation by those priorities and then a Special Activity by faction priority.
//  * In-frame choices: static space values for 'space' picks, one-step lookahead on a clone otherwise.
//  * Loop safety: per-frame selection counter and per-option use counts force a finish verb.
import { cloneGame, currentFaction, doAction, getView, top } from '../core/framework';
import {
  victoryMargin, totalSupport, totalOpposition, coinControlledPop, nvaControlledPop, countOnMap,
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
const rolls = new WeakMap<Game, { card: number; roll: number }>();

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
      s += 0.5 * totalSupport(g) - 0.4 * totalOpposition(g) - 0.6 * countOnMap(g, 'vc_base', 'vc_tunnel') + 0.3 * coinControlledPop(g) - 0.2 * g.casualties.us_troops - 0.2 * g.casualties.us_base;
      break;
    case 'ARVN':
      s += 0.4 * coinControlledPop(g) - 0.3 * totalOpposition(g) - 0.5 * countOnMap(g, 'vc_base', 'vc_tunnel', 'nva_base', 'nva_tunnel') + 0.3 * g.patronage + 0.15 * g.resources.ARVN + 0.05 * g.aid;
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

// ------------------------------------------------------------------ Non-player machinery

function toAct(a: ActionOption): BotAction { return a.arg === undefined ? { verb: a.verb } : { verb: a.verb, arg: a.arg }; }

function die(g: Game, salt: number): number { return 1 + Math.floor(hash(g.seed, g.log.length, g.current ?? 0, salt) * 6); }

// Run a sub-frame on a clone until the stack drops back to `depth` (or a step cap is hit).
function runFrame(c: Game, depth: number, cap = 90): void {
  const ctx: Ctx = { key: '', n: 0, used: {} };
  let steps = 0;
  while (!c.over && c.stack.length > depth && steps < cap) {
    if (top(c)?.state === 'coup') break;
    const a = decide(c, ctx, 4);
    if (!a) break;
    doAction(c, a.verb, a.arg);
    steps++;
  }
}

function signature(g: Game): string {
  return JSON.stringify([g.spaces, g.available, g.casualties, g.out_of_play, g.aid, g.patronage, g.trail, g.capabilities, g.momentum]);
}

const COIN_KINDS = ['us_troops', 'us_base', 'us_irreg_u', 'us_irreg_a', 'arvn_troops', 'arvn_police', 'arvn_ranger_u', 'arvn_ranger_a', 'arvn_base'] as const;
const INS_KINDS = ['nva_troops', 'nva_guer_u', 'nva_guer_a', 'nva_base', 'nva_tunnel', 'vc_guer_u', 'vc_guer_a', 'vc_base', 'vc_tunnel'] as const;

function metrics(g: Game) {
  return {
    coin: countOnMap(g, ...COIN_KINDS), ins: countOnMap(g, ...INS_KINDS),
    coinBases: countOnMap(g, 'us_base', 'arvn_base'), insBases: countOnMap(g, 'nva_base', 'nva_tunnel', 'vc_base', 'vc_tunnel'),
    vcBases: countOnMap(g, 'vc_base', 'vc_tunnel'), nvaBases: countOnMap(g, 'nva_base', 'nva_tunnel'),
    nvaTroops: countOnMap(g, 'nva_troops'),
    sup: totalSupport(g), opp: totalOpposition(g), trail: g.trail,
  };
}
type M = ReturnType<typeof metrics>;
interface Probe { changed: boolean; before: M; after: M }

function probe(g: Game, act: { verb: string; arg?: string | number }, depth: number): Probe | null {
  const c = fastClone(g);
  try {
    const before = metrics(c); const sig = signature(c);
    doAction(c, act.verb, act.arg);
    runFrame(c, depth);
    return { changed: signature(c) !== sig, before, after: metrics(c) };
  } catch { return null; }
}

// Position a clone at op_menu from a card_choice (or return a clone of the op_menu itself).
function menuClone(g: Game, acts: ActionOption[]): Game | null {
  if (top(g)?.state === 'op_menu') return g;
  const pick = ['op_sa', 'op', 'limited_op'].map((v) => acts.find((a) => a.verb === v)).find((a) => a);
  if (!pick) return null;
  const c = fastClone(g);
  try { doAction(c, pick.verb, pick.arg); } catch { return null; }
  return top(c)?.state === 'op_menu' ? c : null;
}

class OpProbes {
  private cache = new Map<string, Probe | null>();
  constructor(private menu: Game) {}
  get(state: string): Probe | null {
    if (this.cache.has(state)) return this.cache.get(state)!;
    const acts = getView(this.menu).actions;
    let r: Probe | null = null;
    if (acts.some((a) => a.verb === 'op' && a.arg === state)) r = probe(this.menu, { verb: 'op', arg: state }, this.menu.stack.length);
    this.cache.set(state, r);
    return r;
  }
  can(state: string): boolean { const p = this.get(state); return !!p && p.changed; }
}

function coupsInBox(g: Game): number { return g.leader_box.length + (g.leader !== null ? 1 : 0); }

function isCapability(id: number | null): boolean { return id !== null && !!CARD[id]?.capability; }

// Ordered Operation candidates for `f`, following 8.5-8.8. `pre` = the checks made before the Event decision.
function preEventOp(f: Faction, P: OpProbes, g: Game): string | null {
  if (f === 'NVA') {
    const p = P.get('op_attack');
    if (p && g.resources.NVA > 0 && p.changed) {
      const removed = p.before.coin - p.after.coin;
      if (p.before.coinBases > p.after.coinBases || removed >= die(g, 11)) return 'op_attack';
    }
  } else if (f === 'VC') {
    const p = P.get('op_terror');
    if (p && g.resources.VC > 0 && p.changed) {
      const supLoss = p.before.sup - p.after.sup; const oppGain = p.after.opp - p.before.opp;
      if (supLoss > 0 || supLoss + oppGain >= die(g, 12) + die(g, 13)) return 'op_terror';
    }
  } else if (f === 'US') {
    const p = P.get('op_assault');
    if (p && p.changed && (p.before.insBases > p.after.insBases || nvaWithUS(g) > 0)) return 'op_assault';
  }
  return null;
}

function nvaWithUS(g: Game): number {
  let n = 0;
  for (const id of Object.keys(g.spaces)) {
    const pc = g.spaces[id].pieces;
    if ((pc.nva_troops ?? 0) > 0 && ((pc.us_troops ?? 0) > 0 || (pc.us_base ?? 0) > 0)) n++;
  }
  return n;
}

function postEventOp(f: Faction, P: OpProbes, g: Game): string | null {
  const first = (...st: string[]) => st.find((s) => P.can(s)) ?? null;
  switch (f) {
    case 'VC': {
      const r = P.get('op_rally');
      const guerAvail = g.available.vc_guer;
      const placedBase = r && r.after.vcBases > r.before.vcBases + 1;
      if (r && r.changed && (placedBase || die(g, 1) + die(g, 2) + die(g, 3) < guerAvail)) return 'op_rally';
      return first('op_march', 'op_attack', 'op_rally', 'op_terror');
    }
    case 'NVA': {
      const t = P.get('op_terror');
      if (t && t.changed && t.before.sup - t.after.sup >= die(g, 4) && g.resources.NVA > 0) return 'op_terror';
      const r = P.get('op_rally');
      if (r && r.changed) {
        const baseSpaceThin = Object.keys(g.spaces).some((id) => {
          const pc = g.spaces[id].pieces;
          return ((pc.nva_base ?? 0) + (pc.nva_tunnel ?? 0)) > 0 && ((pc.nva_troops ?? 0) + (pc.nva_guer_u ?? 0) + (pc.nva_guer_a ?? 0)) < 2;
        });
        if (g.trail <= 1 || baseSpaceThin || die(g, 5) + die(g, 6) > g.available.nva_guer || r.after.nvaBases > r.before.nvaBases) return 'op_rally';
      }
      return first('op_march', 'op_rally', 'op_attack');
    }
    case 'ARVN': {
      const tr = P.get('op_train');
      const avail = g.available.arvn_troops + g.available.arvn_police + g.available.arvn_ranger + g.available.arvn_base;
      if (tr && tr.changed && (avail >= 12 || tr.after.coinBases > tr.before.coinBases)) return 'op_train';
      if (locHasInsurgents(g) && P.can('op_patrol')) return 'op_patrol';
      const as = P.get('op_assault');
      if (as && as.changed && (as.before.nvaTroops > as.after.nvaTroops || as.before.insBases > as.after.insBases)) return 'op_assault';
      return first('op_sweep', 'op_assault', 'op_patrol', 'op_train');
    }
    case 'US':
      return first('op_sweep', 'op_assault', 'op_train', 'op_patrol');
  }
}

function locHasInsurgents(g: Game): boolean {
  for (const id of Object.keys(g.spaces)) {
    if (!id.startsWith('loc_')) continue;
    const pc = g.spaces[id].pieces;
    for (const k of INS_KINDS) if ((pc[k] ?? 0) > 0) return true;
  }
  return false;
}

const SA_CHAIN: Record<Faction, (op: string, g: Game) => string[]> = {
  US: (op) => (op === 'op_assault' || op === 'op_sweep' ? ['sa_air_lift', 'sa_air_strike'] : ['sa_advise', 'sa_air_strike', 'sa_air_lift']),
  ARVN: (op) => (op === 'op_train' || op === 'op_patrol' ? ['sa_govern', 'sa_transport'] : ['sa_raid', 'sa_transport']),
  NVA: (op) => (op === 'op_attack' ? ['sa_ambush', 'sa_bombard'] : op === 'op_march' ? ['sa_ambush', 'sa_infiltrate', 'sa_bombard'] : ['sa_infiltrate', 'sa_bombard']),
  VC: (op, g) => (op === 'op_attack' || op === 'op_march' ? ['sa_ambush', 'sa_tax', 'sa_subvert'] : g.resources.VC <= 9 ? ['sa_tax', 'sa_subvert'] : ['sa_subvert', 'sa_tax']),
};

// Event side per 8.4.2: US/ARVN unshaded, NVA/VC shaded (dual-use has one side only).
function eventSide(f: Faction, acts: ActionOption[]): ActionOption | null {
  const evs = acts.filter((a) => a.verb === 'event');
  if (!evs.length) return null;
  const want = f === 'US' || f === 'ARVN' ? 'unshaded' : 'shaded';
  return evs.find((a) => a.arg === want) ?? evs[0];
}

function eventEffective(g: Game, ev: ActionOption): boolean {
  const c = fastClone(g);
  try {
    const sig = signature(c);
    const depth = c.stack.length;
    doAction(c, ev.verb, ev.arg);
    runFrame(c, depth, 120);
    return signature(c) !== sig;
  } catch { return false; }
}

function npCardChoice(g: Game, f: Faction, acts: ActionOption[]): ActionOption | null {
  const byVerb = (v: string) => acts.find((a) => a.verb === v);
  const pass = byVerb('pass');
  const opVerb = byVerb('op_sa') ?? byVerb('op') ?? byVerb('limited_op');
  const ev = eventSide(f, acts);
  const boxed = coupsInBox(g);
  const cur = g.current;
  const nxt = g.next;
  const cardOf = (id: number | null) => (id !== null ? CARD[id] : undefined);
  const capOf = (id: number | null) => (cardOf(id) as any)?.cap_faction as Faction | undefined;

  // Roll memory: a d6 rolled on the previous card counts for this one too.
  const prev = rolls.get(g);
  const now = die(g, 21);
  const prevRoll = prev && prev.card !== cur ? prev.roll : 0;
  rolls.set(g, { card: cur ?? -1, roll: now });

  const P = (() => { const m = opVerb ? menuClone(g, acts) : null; return m ? new OpProbes(m) : null; })();

  // 1. Capability handling (8.5.2 / 8.6.2 / 8.7.1 / 8.8.2).
  const curCap = isCapability(cur) && cur !== null && g.capabilities[cur] === undefined;
  const nextIsMine = isCapability(nxt) && capOf(nxt) === f && !(isCapability(cur) && capOf(cur) === f);
  if (pass && nextIsMine && !isCapability(cur) && now > boxed) return pass;
  if (curCap && ev) {
    if (now > boxed || prevRoll > boxed) return ev;
    // fall through to Operations
  } else if (P && opVerb) {
    // 2. Conditions checked before the Event: NVA Attack, VC Terror, US Assault.
    if (preEventOp(f, P, g)) return opVerb;
    // 3. Event if it has an effect.
    if (ev && !curCap && eventEffective(g, ev)) return ev;
  } else if (ev && !curCap && eventEffective(g, ev)) return ev;

  // 4. Pass conditions.
  if (pass) {
    if (f === 'ARVN' && g.resources.ARVN < 3) return pass;
    if (f === 'NVA' && g.resources.NVA === 0) return pass;
    if (f === 'VC' && g.resources.VC === 0 && !(P && P.can('op_rally'))) return pass;
  }
  // 5. Operations: only if at least one Operation would do something.
  if (opVerb && P) {
    if (postEventOp(f, P, g)) return opVerb;
    return pass ?? opVerb;
  }
  return pass ?? opVerb ?? null;
}

function npOpMenu(g: Game, f: Faction, acts: ActionOption[]): ActionOption | null {
  const fr = top(g)!; const a = fr.args;
  const done = acts.find((x) => x.verb === 'done');
  const P = new OpProbes(g);
  const ops = acts.filter((x) => x.verb === 'op');
  if (ops.length && !a.used_op) {
    let st = preEventOp(f, P, g) ?? postEventOp(f, P, g);
    // Prefer the flowchart choice when it is on the menu; otherwise the first legal Operation.
    const pick = ops.find((x) => x.arg === st);
    if (pick) return pick;
    if (st === null && done && a.attempts > 0) return done;
    return ops.find((x) => P.can(String(x.arg))) ?? (done && a.attempts > 0 ? done : ops[0]);
  }
  const sas = acts.filter((x) => x.verb === 'sa');
  if (sas.length && a.used_op && !a.used_sa) {
    for (const s of SA_CHAIN[f](String(a.opState ?? ''), g)) {
      const cand = sas.find((x) => x.arg === s);
      if (!cand) continue;
      const p = probe(g, { verb: 'sa', arg: s }, g.stack.length);
      if (p && p.changed) return cand;
    }
    return done ?? sas[0];
  }
  return done ?? null;
}

// ------------------------------------------------------------------ entry point

export function botStep(g: Game): BotAction {
  const view = getView(g);
  const acts = view.actions.filter((a) => a.verb !== 'undo');
  if (acts.length === 0) return { verb: 'done' };
  const f = currentFaction(g) ?? g.active ?? 'US';
  const fr = top(g);
  const legal = (a: ActionOption | null | undefined): BotAction | null =>
    a && acts.some((x) => x.verb === a.verb && x.arg === a.arg) ? toAct(a) : null;

  // Non-player structure (frames that decide the shape of the turn). Failures fall back to greedy play.
  try {
    if (fr?.state === 'pivotal_offer') {
      const play = acts.find((a) => a.verb === 'play');
      if (play) return toAct(play);
    } else if (fr?.state === 'card_choice' && acts.length > 1) {
      const r = legal(npCardChoice(g, f, acts));
      if (r) return r;
    } else if (fr?.state === 'op_menu') {
      const c0 = counters.get(g);
      if (!c0 || c0.key !== `${g.stack.length}:op_menu` || c0.n < MAX_SELECTIONS) {
        const r = legal(npOpMenu(g, f, acts));
        if (r) {
          let c = c0;
          if (!c || c.key !== `${g.stack.length}:op_menu`) { c = { key: `${g.stack.length}:op_menu`, n: 0, used: {} }; counters.set(g, c); }
          c.n++;
          const k = `${r.verb}|${r.arg ?? ''}`;
          c.used[k] = (c.used[k] ?? 0) + 1;
          if (c.used[k] <= 3) return r;
        }
      }
    }
  } catch { /* fall through to greedy */ }

  // Greedy in-frame policy with loop guards.
  let ctx = counters.get(g);
  if (!ctx) { ctx = { key: '', n: 0, used: {} }; counters.set(g, ctx); }
  const a = decide(g, ctx, 40);
  return a ? toAct(a) : { verb: 'done' };
}
