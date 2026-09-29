// US and ARVN Operations (rules 3.2) and Special Activities (4.2, 4.3), per the 2018 rulebook.
//
// States (all take {faction, free?, limited?, spaces?, max?, exclude?} and pop {done, spaces, used}):
//   op_train, op_patrol, op_sweep, op_assault           (faction 'US' or 'ARVN')
//   sa_advise, sa_air_lift, sa_air_strike                (US)
//   sa_govern, sa_transport, sa_raid                     (ARVN)
//   sf_strike (internal helper: an Underground Irregular/Ranger removes 2 enemy pieces)
// Extra args: op_sweep {noMove} (Advise), op_assault {noFollow, noShift} (Patrol/Advise/follow-up).
//
// Verbs offered: 'space' <id>, 'piece' <space:kind>, 'move_all' <space:kind>, 'mode', 'place'/'fill' <pool>,
// 'terror'/'shift'/'base'/'transfer', 'aid'/'patronage'/'patronage_keep', 'sweep'/'assault'/'strike'/'skip',
// 'degrade', 'activate', 'next', 'cancel', 'done'.

import { registerState, push, pop, log, rollDie } from '../core/framework';
import type { Faction, Game, PieceKind, PoolKind } from '../core/types';
import { SPACE_IDS } from '../data/map';
import {
  space, count, countBases, countFaction, countInsurgent, control, place, remove, move, flip, addResources,
  addAid, addPatronage, setTrail, shiftSupport, canHaveSupport, movePool, PIECE_NAME,
} from '../core/pieces';
import { isMonsoon } from './sequence';
import { leaderEffect } from './coup';

// ------------------------------------------------------------------ shared helpers

export function hasMomentum(g: Game, id: number): boolean { return g.momentum.includes(id); }
export function capability(g: Game, id: number): 'unshaded' | 'shaded' | undefined { return g.capabilities[id]; }
function momentumSide(g: Game, id: number): string | undefined { return g.tmp?.momentum_side?.[id]; }

// Can `f` spend n Resources? The US spends ARVN Resources but never below Total Econ (1.8.1).
export function canSpend(g: Game, f: Faction, n: number): boolean {
  if (n <= 0) return true;
  if (f === 'US') return g.resources.ARVN - n >= g.econ;
  return g.resources[f as 'ARVN' | 'NVA' | 'VC'] >= n;
}

export function spend(g: Game, f: Faction, n: number): void {
  if (n <= 0) return;
  const pool = f === 'US' ? 'ARVN' : (f as 'ARVN' | 'NVA' | 'VC');
  g.resources[pool] = Math.max(0, g.resources[pool] - n);
}

const UNDERGROUND_INS: PieceKind[] = ['nva_guer_u', 'vc_guer_u'];
const ACTIVE_INS: PieceKind[] = ['nva_guer_a', 'vc_guer_a'];
const GUER_INS: PieceKind[] = [...UNDERGROUND_INS, ...ACTIVE_INS];
const BASE_KINDS: PieceKind[] = ['nva_base', 'nva_tunnel', 'vc_base', 'vc_tunnel'];
const TUNNELS: PieceKind[] = ['nva_tunnel', 'vc_tunnel'];

function otherSideOf(k: PieceKind): PieceKind {
  return (k.slice(0, -2) + (k.endsWith('_u') ? '_a' : '_u')) as PieceKind;
}

function isLoc(id: string): boolean { return space(id).type === 'loc'; }
function isNV(id: string): boolean { return space(id).country === 'north_vietnam'; }
function name(id: string): string { return space(id).name; }
function stackOK(g: Game, sp: string): boolean { return !isLoc(sp) && countBases(g, sp) < 2; }
function guerCount(g: Game, sp: string): number { return count(g, sp, ...GUER_INS); }

function parsePiece(arg: string | number | undefined): { sp: string; kind: PieceKind } {
  const [sp, kind] = String(arg).split(':');
  return { sp, kind: kind as PieceKind };
}

function maxSel(a: any, dflt = Infinity): number {
  let m = a.limited ? 1 : dflt;
  if (a.max != null) m = Math.min(m, a.max);
  return m;
}
function allowed(a: any, id: string): boolean {
  return (!a.spaces || a.spaces.includes(id)) && !(a.exclude && a.exclude.includes(id));
}
function finish(g: Game, a: any): void {
  pop(g, { done: true, spaces: a.sel ?? [], used: (a.sel ?? []).length > 0 || !!a.used });
}

function selNote(g: Game, a: any, mx: number, cost: number): string {
  const c = cost > 0 ? `cost ${cost} each, ARVN Resources ${g.resources.ARVN}` : 'no cost';
  const m = mx === Infinity ? '' : ` of max ${mx}`;
  return `${a.sel.length} selected${m}, ${c}. Click highlighted spaces, then Done`;
}

// Trail changes (ADSID momentum costs NVA 6 Resources at any change, card 7).
function changeTrail(g: Game, delta: number, floor = 0): void {
  const before = g.trail;
  setTrail(g, Math.max(floor, Math.min(4, g.trail + delta)));
  if (g.trail !== before && hasMomentum(g, 7)) {
    addResources(g, 'NVA', -6);
    log(g, 'ADSID: NVA Resources -6.');
  }
}

// Resource cost of ARVN Assault/Patrol/Sweep. Body Count (card 72, momentum) makes Assault/Patrol free.
function copCost(g: Game, a: any, op: 'sweep' | 'assault' | 'patrol'): number {
  if (a.free || a.faction === 'US') return 0;
  if (op !== 'sweep' && hasMomentum(g, 72)) return 0;
  return 3;
}

// ---- targets and hits

// Assault targets (3.2.4): NVA Troops first, then Active Guerrillas (either Faction), then Bases only
// once no Guerrillas remain (Underground ones protect Bases).
export function assaultTargets(g: Game, sp: string): PieceKind[] {
  const c = (k: PieceKind) => count(g, sp, k);
  if (c('nva_troops') > 0) return ['nva_troops'];
  const act = ACTIVE_INS.filter((k) => c(k) > 0);
  if (act.length) return act;
  if (guerCount(g, sp) > 0) return [];
  return BASE_KINDS.filter((k) => c(k) > 0);
}

// Air Strike targets (4.2.3): NVA Troops before Guerrillas, Active Guerrillas only, Bases only when no
// other Insurgent pieces remain, never Tunneled Bases.
export function airTargets(g: Game, sp: string): PieceKind[] {
  const c = (k: PieceKind) => count(g, sp, k);
  if (c('nva_troops') > 0) return ['nva_troops'];
  const act = ACTIVE_INS.filter((k) => c(k) > 0);
  if (act.length) return act;
  if (guerCount(g, sp) > 0) return [];
  return BASE_KINDS.filter((k) => c(k) > 0 && !TUNNELS.includes(k));
}

// Targets for an Irregular/Ranger strike (Advise, Raid): any enemy piece incl. Underground Guerrillas;
// Bases only when no other enemy pieces remain; no Tunneled Bases.
export function strikeTargets(g: Game, sp: string): PieceKind[] {
  const c = (k: PieceKind) => count(g, sp, k);
  const other = (['nva_troops', ...GUER_INS] as PieceKind[]).filter((k) => c(k) > 0);
  if (other.length) return other;
  return BASE_KINDS.filter((k) => c(k) > 0 && !TUNNELS.includes(k));
}

interface HitCtx { faction?: Faction; assault?: boolean }

// Remove one enemy piece. A Tunneled Base is not removed: roll, 4-6 removes the marker (returns 'stop',
// since removal in that space ends). Assault side effects: +6 Aid per Base removed by an ARVN Assault,
// +3 Aid per Guerrilla under Body Count.
export function applyHit(g: Game, sp: string, k: PieceKind, ctx: HitCtx = {}): 'stop' | boolean {
  if (TUNNELS.includes(k)) {
    const r = rollDie(g);
    if (r >= 4) {
      flip(g, sp, k, k === 'nva_tunnel' ? 'nva_base' : 'vc_base', 1);
      log(g, `Tunnel marker removed from ${name(sp)} (roll ${r}).`);
    } else log(g, `Tunneled Base in ${name(sp)} survives (roll ${r}).`);
    return 'stop';
  }
  const n = remove(g, sp, k, 1);
  if (!n) return false;
  log(g, `Removed ${PIECE_NAME[k]} in ${name(sp)}.`);
  if (ctx.assault) {
    if (ctx.faction === 'ARVN' && BASE_KINDS.includes(k)) { addAid(g, 6); log(g, 'Base removed by ARVN Assault: Aid +6.'); }
    if (hasMomentum(g, 72) && GUER_INS.includes(k)) { addAid(g, 3); log(g, 'Body Count: Aid +3.'); }
  }
  return true;
}

// ---- generic sequential resolver: for each selected space apply `hits` hits (auto if only one choice)

interface Resolver {
  hits(g: Game, sp: string): number;
  kinds(g: Game, sp: string): PieceKind[];
  apply(g: Game, sp: string, k: PieceKind): void | 'stop';
  done(g: Game, a: any): void;
}

function runResolver(g: Game, a: any, r: Resolver): void {
  for (;;) {
    if (a.i >= a.sel.length) { r.done(g, a); return; }
    const sp = a.sel[a.i];
    if (a.hits == null) a.hits = r.hits(g, sp);
    if (a.hits <= 0) { a.i++; a.hits = null; continue; }
    const kinds = r.kinds(g, sp);
    if (!kinds.length) { a.i++; a.hits = null; continue; }
    if (kinds.length === 1) {
      const res = r.apply(g, sp, kinds[0]);
      a.hits = res === 'stop' ? 0 : a.hits - 1;
      continue;
    }
    return;
  }
}

function resolverPrompt(g: Game, a: any, p: any, r: Resolver, label: string): void {
  const sp = a.sel[a.i];
  p.text(`${label}: ${a.hits} hit(s) left in ${name(sp)}. Click an enemy piece to target it.`);
  for (const k of r.kinds(g, sp)) p.piece(sp, k, `${PIECE_NAME[k]} in ${name(sp)}`);
  p.select([sp]);
}

function resolverAct(g: Game, a: any, r: Resolver, arg: any): void {
  const { sp, kind } = parsePiece(arg);
  const res = r.apply(g, sp, kind);
  a.hits = res === 'stop' ? 0 : a.hits - 1;
  runResolver(g, a, r);
}

function beginResolve(g: Game, a: any, r: Resolver): void {
  a.phase = 'resolve';
  a.i = 0;
  a.hits = null;
  runResolver(g, a, r);
}

// ------------------------------------------------------------------ Assault (3.2.4)

export function assaultHits(g: Game, faction: Faction, sp: string): number {
  const s = space(sp);
  const c = (k: PieceKind) => count(g, sp, k);
  if (faction === 'US') {
    const t = c('us_troops');
    if (c('us_base') > 0) return t * 2;
    if (s.terrain === 'highland') return Math.floor(t / 2);
    return t;
  }
  let cubes = c('arvn_troops');
  if (s.type === 'city' || s.type === 'loc') cubes += c('arvn_police');
  return Math.floor(cubes / (s.terrain === 'highland' ? 3 : 2));
}

function assaultKinds(g: Game, a: any, sp: string): PieceKind[] {
  let kinds = assaultTargets(g, sp);
  if (a.faction === 'US') {
    if (capability(g, 11) === 'unshaded' && !a.abramsUsed) { // Abrams: 1 non-Tunnel Base first
      const b = BASE_KINDS.filter((k) => count(g, sp, k) > 0 && !TUNNELS.includes(k) && !kinds.includes(k));
      kinds = [...kinds, ...b];
    }
    if (capability(g, 28) === 'unshaded' && !(a.sdDone ?? []).includes(sp)) { // Search and Destroy
      const u = UNDERGROUND_INS.filter((k) => count(g, sp, k) > 0 && !kinds.includes(k));
      kinds = [...kinds, ...u];
    }
  }
  return kinds;
}

const assaultResolver = (a: any): Resolver => ({
  hits: (g, sp) => {
    let h = assaultHits(g, a.faction, sp);
    if (h <= 0) return 0;
    const s = space(sp);
    if (a.faction === 'US' && capability(g, 13) === 'shaded') { // Cobras (shaded)
      const r = rollDie(g);
      if (r <= 3) { remove(g, sp, 'us_troops', 1); log(g, `Cobras: a US Troop is lost in ${name(sp)} (roll ${r}).`); }
    }
    if (a.faction === 'US' && capability(g, 14) === 'unshaded' && (s.terrain === 'highland' || s.terrain === 'jungle') && (a.patton ?? 0) < 2) {
      a.patton = (a.patton ?? 0) + 1; h += 2; // M-48 Patton
    }
    if (capability(g, 28) === 'shaded' && s.type === 'province' && s.pop > 0 && !a.noShift) { // Search and Destroy (shaded)
      shiftSupport(g, sp, -1);
      log(g, `Search and Destroy: ${name(sp)} shifts toward Active Opposition.`);
    }
    return h;
  },
  kinds: (g, sp) => assaultKinds(g, a, sp),
  apply: (g, sp, k) => {
    if (UNDERGROUND_INS.includes(k)) { a.sdDone = [...(a.sdDone ?? []), sp]; }
    else if (BASE_KINDS.includes(k) && !TUNNELS.includes(k) && !assaultTargets(g, sp).includes(k)) a.abramsUsed = true;
    return applyHit(g, sp, k, { faction: a.faction, assault: true }) === 'stop' ? 'stop' : undefined;
  },
  done: (g, aa) => assaultDone(g, aa),
});

function arvnFollowCandidates(g: Game, a: any): string[] {
  return a.sel.filter((id: string) => assaultHits(g, 'ARVN', id) > 0 && countInsurgent(g, id) > 0);
}

function followCost(g: Game): number { return hasMomentum(g, 72) ? 0 : 3; }

function assaultDone(g: Game, a: any): void {
  // The US may pay 3 ARVN Resources to follow up with an ARVN Assault in 1 space (3.2.4).
  a.phase = 'follow';
  if (a.faction !== 'US' || a.noFollow || !canSpend(g, 'US', followCost(g)) || arvnFollowCandidates(g, a).length === 0) finish(g, a);
}

function assaultCandidates(g: Game, a: any): string[] {
  return SPACE_IDS.filter((id) => allowed(a, id) && !a.sel.includes(id) && assaultHits(g, a.faction, id) > 0 && countInsurgent(g, id) > 0);
}

function assaultMax(g: Game, a: any): number {
  return maxSel(a, a.faction === 'US' && capability(g, 11) === 'shaded' ? 2 : Infinity); // Abrams (shaded)
}

registerState('op_assault', {
  enter(g, a) {
    a.sel = []; a.phase = 'select'; a.i = 0; a.hits = null; a.sdDone = [];
    if (a.faction === 'US' && hasMomentum(g, 78)) { log(g, 'General Lansdale: no US Assault.'); finish(g, a); return; }
    const cost = copCost(g, a, 'assault');
    const cands = assaultCandidates(g, a).filter(() => canSpend(g, a.faction, cost));
    if (cands.length === 0) { finish(g, a); return; }
    if (a.spaces?.length === 1 && a.max === 1 && cands.includes(a.spaces[0])) {
      spend(g, a.faction, cost);
      a.sel.push(a.spaces[0]);
      log(g, `${a.faction} Assaults ${name(a.spaces[0])}.`);
      beginResolve(g, a, assaultResolver(a));
    }
  },
  prompt(g, a, p) {
    const cost = copCost(g, a, 'assault');
    if (a.phase === 'select') {
      const cands = assaultCandidates(g, a).filter(() => canSpend(g, a.faction, cost));
      const mx = assaultMax(g, a);
      p.text(`${a.faction} Assault: select spaces (${selNote(g, a, mx, cost)}).`);
      if (a.sel.length < mx) for (const id of cands) p.space(id, `${name(id)} (${assaultHits(g, a.faction, id)} hits)`);
      p.select(a.sel);
      if (a.sel.length > 0 || cands.length === 0) p.action('done', undefined, a.sel.length ? 'Done selecting spaces' : 'Done (nothing to do)');
    } else if (a.phase === 'follow') {
      p.text(`US Assault: pay ${followCost(g)} ARVN Resources to follow up with an ARVN Assault in one of these spaces? (ARVN Resources ${g.resources.ARVN})`);
      for (const id of arvnFollowCandidates(g, a)) p.space(id, `ARVN Assault in ${name(id)}`);
      p.action('done', undefined, 'No follow-up; finish');
    } else if (a.phase === 'resolve') {
      resolverPrompt(g, a, p, assaultResolver(a), `${a.faction} Assault`);
    }
  },
  act(g, a, verb, arg) {
    const r = assaultResolver(a);
    if (a.phase === 'select') {
      if (verb === 'space') {
        spend(g, a.faction, copCost(g, a, 'assault'));
        a.sel.push(String(arg));
        log(g, `${a.faction} Assaults ${name(String(arg))}.`);
        if (a.sel.length >= assaultMax(g, a)) beginResolve(g, a, r);
      } else if (a.sel.length === 0) finish(g, a);
      else beginResolve(g, a, r);
    } else if (a.phase === 'follow') {
      if (verb === 'space') {
        spend(g, 'US', followCost(g));
        a.phase = 'follow_done';
        push(g, 'op_assault', { faction: 'ARVN', free: true, spaces: [String(arg)], max: 1, noFollow: true, noShift: true });
      } else finish(g, a);
    } else if (a.phase === 'resolve' && verb === 'piece') resolverAct(g, a, r, arg);
  },
  resume(g, a) { if (a.phase === 'follow_done') finish(g, a); },
});

// ------------------------------------------------------------------ Sweep (3.2.3)

function sweepPieces(faction: Faction): PieceKind[] { return faction === 'US' ? ['us_troops'] : ['arvn_troops']; }

export function sweepPower(g: Game, faction: Faction, sp: string): number {
  const c = (k: PieceKind) => count(g, sp, k);
  const n = faction === 'US'
    ? c('us_troops') + c('us_irreg_u') + c('us_irreg_a')
    : c('arvn_troops') + c('arvn_police') + c('arvn_ranger_u') + c('arvn_ranger_a');
  return space(sp).terrain === 'jungle' ? Math.floor(n / 2) : n; // Jungle: 1 per 2; no Highland halving
}

function movable(g: Game, a: any, from: string, kind: PieceKind): number {
  return count(g, from, kind) - (a.moved?.[`${from}:${kind}`] ?? 0);
}

// Troops adjacent to `dest`, or 2 steps away via an adjacent LoC free of NVA/VC (3.2.3).
function sweepSources(g: Game, a: any, dest: string): { sp: string; kind: PieceKind }[] {
  if (a.noMove) return [];
  const from = new Set<string>();
  for (const n of space(dest).adjacent) {
    from.add(n);
    if (isLoc(n) && countInsurgent(g, n) === 0) for (const m of space(n).adjacent) if (m !== dest) from.add(m);
  }
  const out: { sp: string; kind: PieceKind }[] = [];
  for (const sp of from) for (const k of sweepPieces(a.faction)) if (movable(g, a, sp, k) > 0) out.push({ sp, kind: k });
  return out;
}

const sweepResolver = (a: any): Resolver => ({
  hits: (g, sp) => sweepPower(g, a.faction, sp),
  kinds: (g, sp) => UNDERGROUND_INS.filter((k) => count(g, sp, k) > 0),
  apply: (g, sp, k) => {
    flip(g, sp, k, otherSideOf(k), 1);
    log(g, `Activated ${PIECE_NAME[k]} in ${name(sp)}.`);
  },
  done: (g, aa) => sweepDone(g, aa),
});

// Cobras (unshaded): 2 Sweep spaces each remove 1 Active unTunneled enemy (Troops first, Bases last).
const cobraResolver = (): Resolver => ({
  hits: () => 1,
  kinds: (g, sp) => assaultTargets(g, sp).filter((k) => !TUNNELS.includes(k)),
  apply: (g, sp, k) => { applyHit(g, sp, k); },
  done: (g, aa) => { aa.sel = aa.sel0; finish(g, aa); },
});

function sweepDone(g: Game, a: any): void {
  if (capability(g, 13) === 'unshaded' && !a.cobras) {
    a.cobras = true;
    a.sel0 = a.sel;
    a.sel = a.sel0.slice(0, 2);
    beginResolve(g, a, cobraResolver());
    return;
  }
  finish(g, a);
}

const curSweep = (a: any): Resolver => (a.cobras ? cobraResolver() : sweepResolver(a));

function sweepCandidates(g: Game, a: any): string[] {
  return SPACE_IDS.filter((id) => {
    if (isLoc(id) || isNV(id) || !allowed(a, id) || a.sel.includes(id)) return false;
    return sweepPower(g, a.faction, id) > 0 || count(g, id, ...sweepPieces(a.faction)) > 0 || sweepSources(g, a, id).length > 0;
  });
}

function sweepMax(g: Game, a: any): number {
  return maxSel(a, a.faction === 'US' && capability(g, 18) === 'shaded' ? 2 : Infinity); // CAP (shaded)
}

function sweepAdvanceMove(g: Game, a: any): void {
  while (a.mi < a.sel.length && sweepSources(g, a, a.sel[a.mi]).length === 0) a.mi++;
  if (a.mi >= a.sel.length) beginResolve(g, a, sweepResolver(a));
}

registerState('op_sweep', {
  enter(g, a) {
    a.sel = []; a.phase = 'select'; a.mi = 0; a.moved = {}; a.i = 0; a.hits = null;
    if (isMonsoon(g)) { log(g, 'Monsoon: no Sweep.'); finish(g, a); return; }
    const cost = copCost(g, a, 'sweep');
    const cands = sweepCandidates(g, a).filter(() => canSpend(g, a.faction, cost));
    if (cands.length === 0) { finish(g, a); return; }
    if (a.spaces?.length === 1 && a.max === 1 && cands.includes(a.spaces[0])) {
      spend(g, a.faction, cost);
      a.sel.push(a.spaces[0]);
      log(g, `${a.faction} Sweeps ${name(a.spaces[0])}.`);
      a.phase = 'move'; a.mi = 0; sweepAdvanceMove(g, a);
    }
  },
  prompt(g, a, p) {
    const cost = copCost(g, a, 'sweep');
    if (a.phase === 'select') {
      const cands = sweepCandidates(g, a).filter(() => canSpend(g, a.faction, cost));
      const mx = sweepMax(g, a);
      p.text(`${a.faction} Sweep: select destination Provinces/Cities (${selNote(g, a, mx, cost)}).`);
      if (a.sel.length < mx) for (const id of cands) p.space(id, name(id));
      p.select(a.sel);
      if (a.sel.length > 0 || cands.length === 0) p.action('done', undefined, a.sel.length ? 'Done selecting spaces' : 'Done (nothing to do)');
    } else if (a.phase === 'move') {
      const dest = a.sel[a.mi];
      p.text(`Sweep into ${name(dest)}: move Troops from adjacent spaces (or via a free LoC), optional.`);
      for (const s of sweepSources(g, a, dest)) {
        p.piece(s.sp, s.kind, `Move 1 ${PIECE_NAME[s.kind]} from ${name(s.sp)}`);
        p.action('move_all', `${s.sp}:${s.kind}`, `Move all ${PIECE_NAME[s.kind]} from ${name(s.sp)}`, { space: s.sp, piece: s.kind });
      }
      p.select([dest]);
      p.action('next', undefined, 'Done moving; go to the next space');
    } else {
      resolverPrompt(g, a, p, curSweep(a), `${a.faction} Sweep`);
    }
  },
  act(g, a, verb, arg) {
    if (a.phase === 'select') {
      if (verb === 'space') {
        spend(g, a.faction, copCost(g, a, 'sweep'));
        a.sel.push(String(arg));
        log(g, `${a.faction} Sweeps ${name(String(arg))}.`);
        if (a.sel.length >= sweepMax(g, a)) { a.phase = 'move'; a.mi = 0; sweepAdvanceMove(g, a); }
      } else if (a.sel.length === 0) finish(g, a);
      else { a.phase = 'move'; a.mi = 0; sweepAdvanceMove(g, a); }
    } else if (a.phase === 'move') {
      const dest = a.sel[a.mi];
      if (verb === 'next') { a.mi++; sweepAdvanceMove(g, a); return; }
      const { sp, kind } = parsePiece(arg);
      const n = verb === 'move_all' ? movable(g, a, sp, kind) : 1;
      const m = move(g, sp, dest, kind, n);
      a.moved[`${dest}:${kind}`] = (a.moved[`${dest}:${kind}`] ?? 0) + m;
      log(g, `Moved ${m} ${PIECE_NAME[kind]} from ${name(sp)} to ${name(dest)}.`);
      if (sweepSources(g, a, dest).length === 0) { a.mi++; sweepAdvanceMove(g, a); }
    } else if (verb === 'piece') resolverAct(g, a, curSweep(a), arg);
  },
});

// ------------------------------------------------------------------ Patrol (3.2.2)

function patrolPieces(faction: Faction): PieceKind[] {
  return faction === 'US' ? ['us_troops'] : ['arvn_troops', 'arvn_police'];
}

// Spaces a cube can enter from `from`: adjacent LoCs or Cities, continuing through further LoCs/Cities;
// it must stop on entering a space with any NVA/VC piece (3.2.2).
export function patrolReach(g: Game, from: string): string[] {
  const seen = new Set<string>([from]);
  const out: string[] = [];
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const n of space(cur).adjacent) {
      if (seen.has(n)) continue;
      const s = space(n);
      if (s.type === 'province' || isNV(n)) continue;
      seen.add(n);
      out.push(n);
      if (countInsurgent(g, n) === 0) queue.push(n);
    }
  }
  return out;
}

function patrolMoves(g: Game, a: any): { sp: string; kind: PieceKind }[] {
  const out: { sp: string; kind: PieceKind }[] = [];
  for (const sp of SPACE_IDS) {
    for (const k of patrolPieces(a.faction)) {
      if (movable(g, a, sp, k) <= 0) continue;
      const reach = patrolReach(g, sp).filter((d) => !a.dest || d === a.dest);
      if (reach.length) out.push({ sp, kind: k });
    }
  }
  return out;
}

const patrolResolver = (): Resolver => ({
  hits: (g, sp) => count(g, sp, 'us_troops', 'arvn_troops', 'arvn_police'),
  kinds: (g, sp) => UNDERGROUND_INS.filter((k) => count(g, sp, k) > 0),
  apply: (g, sp, k) => {
    flip(g, sp, k, otherSideOf(k), 1);
    log(g, `Activated ${PIECE_NAME[k]} in ${name(sp)}.`);
  },
  done: (g, a) => patrolAssaultPhase(g, a),
});

function patrolAssaultCands(g: Game, a: any): string[] {
  const locs = SPACE_IDS.filter((id) => isLoc(id) && (!a.dest || id === a.dest));
  return locs.filter((id) => assaultHits(g, a.faction, id) > 0 && countInsurgent(g, id) > 0);
}

function patrolAssaultPhase(g: Game, a: any): void {
  a.phase = 'assault';
  if (a.faction === 'US' && hasMomentum(g, 78)) { patrolFinish(g, a); return; }
  if (patrolAssaultCands(g, a).length === 0) patrolFinish(g, a);
}

function payPatrol(g: Game, a: any): void {
  if (a.paid) return;
  a.paid = true;
  spend(g, a.faction, copCost(g, a, 'patrol'));
}

function patrolStartResolve(g: Game, a: any): void {
  payPatrol(g, a);
  // Activation happens in every LoC that holds the patrolling Faction's cubes.
  a.sel = SPACE_IDS.filter((id) => isLoc(id) && count(g, id, ...patrolPieces(a.faction)) > 0 && count(g, id, ...UNDERGROUND_INS) > 0);
  a.used = true;
  beginResolve(g, a, patrolResolver());
}

// M-48 Patton (shaded): after Patrol, NVA removes up to 2 of the moved cubes (US to Casualties).
function patrolFinish(g: Game, a: any): void {
  if (capability(g, 14) === 'shaded' && a.moved) {
    let n = 0;
    for (const key of Object.keys(a.moved)) {
      const [dest, kind] = key.split(':');
      while (n < 2 && a.moved[key] > 0 && count(g, dest, kind as PieceKind) > 0) {
        remove(g, dest, kind as PieceKind, 1); a.moved[key]--; n++;
        log(g, `M-48 Patton: NVA removes a moved ${PIECE_NAME[kind as PieceKind]} in ${name(dest)}.`);
      }
    }
  }
  a.sel = a.dest ? [a.dest] : (a.sel ?? []);
  pop(g, { done: true, spaces: a.sel0 ?? a.sel, used: true });
}

registerState('op_patrol', {
  enter(g, a) {
    a.sel = []; a.phase = 'move'; a.moved = {}; a.i = 0; a.hits = null; a.paid = false; a.src = null; a.all = false; a.dest = null;
    a.sel0 = [];
    if (!canSpend(g, a.faction, copCost(g, a, 'patrol'))) { pop(g, { done: true, spaces: [], used: false }); }
  },
  prompt(g, a, p) {
    if (a.phase === 'move') {
      if (a.src == null) {
        p.text(`${a.faction} Patrol: click a cube to move onto a LoC or City${a.limited ? ' (Limited: one destination only)' : ''}; when finished choose Done to activate Guerrillas. ${copCost(g, a, 'patrol') ? `Cost 3 (ARVN Resources ${g.resources.ARVN}).` : 'No cost.'}`);
        for (const s of patrolMoves(g, a)) p.piece(s.sp, s.kind, `${PIECE_NAME[s.kind]} in ${name(s.sp)}`);
        p.action('mode', undefined, a.all ? 'Moving ALL cubes of a kind per click (switch to one)' : 'Moving ONE cube per click (switch to all)');
        p.action('done', undefined, 'Done moving; activate Guerrillas');
      } else {
        const { sp, kind } = parsePiece(a.src);
        p.text(`Move ${a.all ? 'all' : 'a'} ${PIECE_NAME[kind]} from ${name(sp)}: click the destination.`);
        p.select([sp]);
        for (const d of patrolReach(g, sp)) if (!a.dest || d === a.dest) p.space(d, name(d));
        p.action('cancel', undefined, 'Choose another cube');
      }
    } else if (a.phase === 'resolve') {
      resolverPrompt(g, a, p, patrolResolver(), `${a.faction} Patrol activation`);
    } else {
      p.text(`${a.faction} Patrol: you may Assault free in 1 LoC${a.dest ? ' (the destination)' : ''}.`);
      for (const id of patrolAssaultCands(g, a)) p.space(id, `Assault ${name(id)}`);
      p.action('done', undefined, 'No Assault; finish');
    }
  },
  act(g, a, verb, arg) {
    if (a.phase === 'move') {
      if (verb === 'mode') { a.all = !a.all; return; }
      if (verb === 'cancel') { a.src = null; return; }
      if (verb === 'piece') { a.src = String(arg); return; }
      if (verb === 'space' && a.src) {
        const { sp, kind } = parsePiece(a.src);
        const dest = String(arg);
        payPatrol(g, a);
        const m = move(g, sp, dest, kind, a.all ? movable(g, a, sp, kind) : 1);
        a.moved[`${dest}:${kind}`] = (a.moved[`${dest}:${kind}`] ?? 0) + m;
        if (a.limited) a.dest = dest;
        a.sel0 = [...new Set([...(a.sel0 ?? []), dest])];
        a.src = null;
        log(g, `Patrol: ${m} ${PIECE_NAME[kind]} from ${name(sp)} to ${name(dest)}.`);
        return;
      }
      patrolStartResolve(g, a);
    } else if (a.phase === 'resolve') {
      if (verb === 'piece') resolverAct(g, a, patrolResolver(), arg);
    } else if (verb === 'space') {
      a.phase = 'assault_done';
      a.sel0 = [...new Set([...(a.sel0 ?? []), String(arg)])];
      push(g, 'op_assault', { faction: a.faction, free: true, spaces: [String(arg)], max: 1, noFollow: true });
    } else patrolFinish(g, a);
  },
  resume(g, a) { if (a.phase === 'assault_done') patrolFinish(g, a); },
});

// ------------------------------------------------------------------ Train (3.2.1)

function trainCandidates(g: Game, a: any): string[] {
  return SPACE_IDS.filter((id) => {
    const s = space(id);
    if (s.type === 'loc' || isNV(id) || !allowed(a, id) || a.sel.includes(id)) return false;
    if (a.faction === 'US') return countFaction(g, id, 'US') > 0;
    return control(g, id) !== 'NVA';
  });
}

function paidOrFree(a: any, sp: string): boolean { return !!a.free || a.paid.includes(sp); }

function mapCount(g: Game, pool: PoolKind, except: string): number {
  let n = 0;
  const kinds: Record<string, PieceKind[]> = {
    arvn_troops: ['arvn_troops'], arvn_police: ['arvn_police'], arvn_ranger: ['arvn_ranger_u', 'arvn_ranger_a'],
  };
  for (const id of SPACE_IDS) if (id !== except) n += count(g, id, ...(kinds[pool] ?? []));
  return n;
}

// Place an ARVN piece; if none is Available take one from the map (3.2.1).
function placeArvn(g: Game, sp: string, pool: PoolKind): boolean {
  if (g.available[pool] <= 0) {
    const kinds: PieceKind[] = pool === 'arvn_ranger' ? ['arvn_ranger_a', 'arvn_ranger_u'] : [pool as PieceKind];
    let best: { id: string; k: PieceKind; n: number } | null = null;
    for (const id of SPACE_IDS) {
      if (id === sp) continue;
      for (const k of kinds) {
        const n = count(g, id, k);
        if (n > 0 && (!best || n > best.n)) best = { id, k, n };
      }
    }
    if (!best) return false;
    remove(g, best.id, best.k, 1);
    log(g, `Took an ARVN piece from ${name(best.id)}.`);
  }
  return place(g, sp, pool, 1) > 0;
}

function trainOptions(g: Game, a: any): { pool: PoolKind; label: string }[] {
  const sp = a.sel[a.i];
  const cur = a.cur;
  const opts: { pool: PoolKind; label: string }[] = [];
  const hasUSBase = count(g, sp, 'us_base') > 0;
  const hasBase = hasUSBase || count(g, sp, 'arvn_base') > 0;
  const arvnOK = a.faction === 'US' ? hasUSBase : (space(sp).type === 'city' || hasBase);
  const payable = paidOrFree(a, sp) || canSpend(g, a.faction, 3);
  if (a.faction === 'US' && g.available.us_irreg > 0 && (cur.mode == null || cur.mode === 'sf') && cur.sfN < 2 && cur.cubes === 0 && !cur.rangers) {
    opts.push({ pool: 'us_irreg', label: 'Place an Irregular' });
  }
  if (arvnOK && payable) {
    if ((cur.mode == null || cur.mode === 'sf') && cur.sfN < 2 && cur.cubes === 0 && !cur.irregs
      && (g.available.arvn_ranger > 0 || mapCount(g, 'arvn_ranger', sp) > 0)) opts.push({ pool: 'arvn_ranger', label: 'Place a Ranger' });
    if ((cur.mode == null || cur.mode === 'cubes') && cur.cubes < 6 && cur.sfN === 0) {
      if (g.available.arvn_troops > 0 || mapCount(g, 'arvn_troops', sp) > 0) opts.push({ pool: 'arvn_troops', label: 'Place ARVN Troops' });
      if (g.available.arvn_police > 0 || mapCount(g, 'arvn_police', sp) > 0) opts.push({ pool: 'arvn_police', label: 'Place Police' });
    }
  }
  return opts;
}

function pacCostPer(g: Game): number { return leaderEffect(g).pacifyCost; }
function pacSupportCap(g: Game, a: any): number { return a.faction === 'US' && capability(g, 19) === 'shaded' ? 1 : 2; } // CORDS (shaded)

function canPacify(g: Game, a: any, sp: string): boolean {
  if (control(g, sp) !== 'COIN') return false;
  if (a.faction === 'ARVN') { if (count(g, sp, 'arvn_troops') < 1 || count(g, sp, 'arvn_police') < 1) return false; }
  else if (countFaction(g, sp, 'US') < 1) return false;
  const st = g.spaces[sp];
  const canShift = canHaveSupport(sp) && st.support < pacSupportCap(g, a);
  return (st.terror > 0 || canShift) && canSpend(g, a.faction, pacCostPer(g));
}

function canBase(g: Game, a: any, sp: string): boolean {
  return a.faction === 'ARVN' && count(g, sp, 'arvn_troops', 'arvn_police') >= 3 && g.available.arvn_base > 0
    && stackOK(g, sp) && (paidOrFree(a, sp) || canSpend(g, 'ARVN', 3));
}

function canTransfer(g: Game, a: any, sp: string): boolean {
  return a.faction === 'US' && sp === 'saigon' && g.patronage > 0;
}

function specialCandidates(g: Game, a: any): string[] {
  return a.sel.filter((sp: string) => {
    if (a.mode === 'pacify') return !a.pacDone.includes(sp) && canPacify(g, a, sp);
    if (a.mode) return false;
    return canPacify(g, a, sp) || canBase(g, a, sp) || canTransfer(g, a, sp);
  });
}

function pacifyMaxSpaces(g: Game, a: any): number { return a.faction === 'US' && capability(g, 19) === 'unshaded' ? 2 : 1; } // CORDS (unshaded)

function trainToSpecial(g: Game, a: any): void {
  a.phase = capability(g, 18) === 'unshaded' && a.faction === 'US' ? 'cap' : 'special';
  a.mode = null; a.spSp = null; a.steps = 0; a.pacDone = [];
  if (a.phase === 'cap' && !SPACE_IDS.some((id) => count(g, id, 'us_troops') > 0)) a.phase = 'special';
  if (a.phase === 'special' && specialCandidates(g, a).length === 0) finish(g, a);
}

function trainNextSpace(g: Game, a: any): void {
  a.i++;
  a.cur = { mode: null, sfN: 0, cubes: 0, irregs: 0, rangers: 0 };
  if (a.i >= a.sel.length) trainToSpecial(g, a);
}

registerState('op_train', {
  enter(g, a) {
    a.sel = []; a.phase = 'select'; a.i = 0; a.paid = []; a.mode = null; a.spSp = null; a.steps = 0; a.pacDone = []; a.used = false;
    a.cur = { mode: null, sfN: 0, cubes: 0, irregs: 0, rangers: 0 };
    if (trainCandidates(g, a).length === 0) finish(g, a);
  },
  prompt(g, a, p) {
    if (a.phase === 'select') {
      p.text(`${a.faction} Train: select Provinces/Cities (${a.sel.length} selected${maxSel(a) === Infinity ? '' : ` of max ${maxSel(a)}`}; 3 ARVN Resources per space only if ARVN pieces are placed, ARVN Resources ${g.resources.ARVN}). Click highlighted spaces, then Done`);
      if (a.sel.length < maxSel(a)) for (const id of trainCandidates(g, a)) p.space(id, name(id));
      p.select(a.sel);
      p.action('done', undefined, a.sel.length ? 'Done selecting spaces' : 'Done (nothing to do)');
    } else if (a.phase === 'place') {
      const sp = a.sel[a.i];
      p.text(`Train in ${name(sp)}: place forces (${a.cur.cubes} cubes, ${a.cur.sfN} Irregulars/Rangers so far). Rangers or up to 6 cubes need a City or a Base.`);
      for (const o of trainOptions(g, a)) {
        p.action('place', o.pool, o.label, { space: sp });
        p.action('fill', o.pool, `${o.label} (as many as allowed)`, { space: sp });
      }
      p.select([sp]);
      p.action('next', undefined, 'Done placing here; go on');
    } else if (a.phase === 'cap') {
      p.text('Combined Action Platoons: place or relocate 1 Police into a space with US Troops (free).');
      for (const id of SPACE_IDS) if (count(g, id, 'us_troops') > 0 && !isNV(id) && !isLoc(id)) p.space(id, name(id));
      p.action('done', undefined, 'Skip');
    } else {
      // special: Pacify OR replace cubes with a Base OR (US, Saigon) transfer Patronage
      const cost = pacCostPer(g);
      if (a.spSp == null) {
        p.text(`${a.faction} Train, one selected space: Pacify (${cost} ARVN Resources per Terror/level; ARVN Resources ${g.resources.ARVN}), ${a.faction === 'ARVN' ? 'replace 3 cubes with a Base, ' : 'or transfer Patronage in Saigon, '}or finish.`);
        for (const id of specialCandidates(g, a)) p.space(id, name(id));
        p.select(a.pacDone);
      } else {
        const sp = a.spSp;
        const st = g.spaces[sp];
        p.text(`${name(sp)}: choose an action (ARVN Resources ${g.resources.ARVN}).`);
        p.select([sp]);
        if (!a.mode || a.mode === 'pacify') {
          if (canPacify(g, a, sp) && a.steps < 2 + 99) {
            if (st.terror > 0) p.action('terror', undefined, `Remove a Terror marker (${cost} ARVN Resources)`);
            else if (canHaveSupport(sp) && st.support < pacSupportCap(g, a) && a.shifts < 2) p.action('shift', undefined, `Shift 1 level toward Active Support (${cost} ARVN Resources)`);
          }
        }
        if (!a.mode) {
          if (canBase(g, a, sp)) p.action('base', undefined, `Replace 3 ARVN cubes with an ARVN Base${paidOrFree(a, sp) ? '' : ' (3 ARVN Resources)'}`);
          if (canTransfer(g, a, sp)) for (let n = 1; n <= Math.min(3, g.patronage); n++) p.action('transfer', n, `Transfer ${n} Patronage to ARVN Resources`);
        }
      }
      p.action('done', undefined, 'Done (finish Train)');
    }
  },
  act(g, a, verb, arg) {
    if (a.phase === 'select') {
      if (verb === 'space') {
        a.sel.push(String(arg));
        log(g, `${a.faction} Trains in ${name(String(arg))}.`);
        if (a.sel.length < maxSel(a)) return;
      } else if (a.sel.length === 0) { finish(g, a); return; }
      if (a.faction === 'ARVN') {
        const aid = leaderEffect(g).trainAid;
        if (aid > 0) { addAid(g, aid); log(g, `Leader bonus: Aid +${aid}.`); }
      }
      a.phase = 'place';
      a.i = -1;
      a.used = true;
      trainNextSpace(g, a);
    } else if (a.phase === 'place') {
      const sp = a.sel[a.i];
      if (verb === 'next') { trainNextSpace(g, a); return; }
      const pool = String(arg) as PoolKind;
      const reps = verb === 'fill' ? 99 : 1;
      for (let i = 0; i < reps; i++) {
        if (!trainOptions(g, a).some((o) => o.pool === pool)) break;
        if (pool !== 'us_irreg' && !paidOrFree(a, sp)) { spend(g, a.faction, 3); a.paid.push(sp); }
        const ok = pool === 'us_irreg' ? place(g, sp, pool, 1) > 0 : placeArvn(g, sp, pool);
        if (!ok) break;
        if (pool === 'us_irreg') { a.cur.sfN++; a.cur.irregs++; a.cur.mode = 'sf'; }
        else if (pool === 'arvn_ranger') { a.cur.sfN++; a.cur.rangers++; a.cur.mode = 'sf'; }
        else { a.cur.cubes++; a.cur.mode = 'cubes'; }
        log(g, `Placed ${pool === 'us_irreg' ? 'an Irregular' : pool === 'arvn_ranger' ? 'a Ranger' : pool === 'arvn_police' ? 'Police' : 'ARVN Troops'} in ${name(sp)}.`);
      }
    } else if (a.phase === 'cap') {
      if (verb === 'space') {
        const sp = String(arg);
        placeArvn(g, sp, 'arvn_police');
        log(g, `Combined Action Platoons: Police in ${name(sp)}.`);
      }
      a.phase = 'special';
      trainToSpecial2(g, a);
    } else {
      if (verb === 'done') {
        if (a.mode === 'pacify' && a.spSp != null) {
          a.pacDone.push(a.spSp); a.spSp = null; a.steps = 0; a.shifts = 0;
          if (a.pacDone.length < pacifyMaxSpaces(g, a) && specialCandidates(g, a).length > 0) return;
        }
        finish(g, a);
        return;
      }
      if (verb === 'space') { a.spSp = String(arg); a.shifts = 0; return; }
      const sp = a.spSp;
      if (verb === 'terror' || verb === 'shift') {
        a.mode = 'pacify';
        spend(g, a.faction, pacCostPer(g));
        if (verb === 'terror') { g.spaces[sp].terror = Math.max(0, g.spaces[sp].terror - 1); log(g, `Pacification removes Terror in ${name(sp)}.`); }
        else { shiftSupport(g, sp, 1); a.shifts++; log(g, `Pacification shifts ${name(sp)} toward Active Support.`); }
        return;
      }
      if (verb === 'base') {
        let need = 3;
        if (!paidOrFree(a, sp)) { spend(g, 'ARVN', 3); a.paid.push(sp); }
        for (const k of ['arvn_troops', 'arvn_police'] as PieceKind[]) {
          const n = Math.min(need, count(g, sp, k));
          if (n) { remove(g, sp, k, n); need -= n; }
        }
        place(g, sp, 'arvn_base', 1);
        log(g, `Replaced 3 ARVN cubes with an ARVN Base in ${name(sp)}.`);
        finish(g, a);
        return;
      }
      if (verb === 'transfer') {
        const n = Number(arg);
        addPatronage(g, -n);
        addResources(g, 'ARVN', n);
        log(g, `Transferred ${n} Patronage to ARVN Resources.`);
        finish(g, a);
      }
    }
  },
});

function trainToSpecial2(g: Game, a: any): void {
  a.mode = null; a.spSp = null; a.steps = 0; a.pacDone = [];
  if (specialCandidates(g, a).length === 0) finish(g, a);
}

// ------------------------------------------------------------------ Irregular / Ranger strike (Advise, Raid)

registerState('sf_strike', {
  enter(g, a) {
    a.sel = [a.space]; a.i = 0; a.hits = null; a.phase = 'resolve';
    flip(g, a.space, a.kind, otherSideOf(a.kind), 1);
    log(g, `${PIECE_NAME[a.kind as PieceKind]} activates in ${name(a.space)} to remove 2 enemy pieces.`);
    runResolver(g, a, strikeResolver());
  },
  prompt(g, a, p) { resolverPrompt(g, a, p, strikeResolver(), 'Strike'); },
  act(g, a, verb, arg) { if (verb === 'piece') resolverAct(g, a, strikeResolver(), arg); },
});

const strikeResolver = (): Resolver => ({
  hits: () => 2,
  kinds: (g, sp) => strikeTargets(g, sp),
  apply: (g, sp, k) => { applyHit(g, sp, k); },
  done: (g, a) => pop(g, { done: true, spaces: [a.space], used: true }),
});

// ------------------------------------------------------------------ Advise (US, 4.2.1)

function advCandidates(g: Game, a: any): string[] {
  return SPACE_IDS.filter((id) => allowed(a, id) && !a.sel.includes(id) && !isNV(id)
    && count(g, id, 'arvn_troops', 'arvn_police', 'arvn_ranger_u', 'arvn_ranger_a', 'us_irreg_u') > 0);
}

function advOptions(g: Game, sp: string): string[] {
  const o: string[] = [];
  const ins = countInsurgent(g, sp) > 0;
  if (!isMonsoon(g) && !isLoc(sp) && !isNV(sp) && sweepPower(g, 'ARVN', sp) > 0 && count(g, sp, ...UNDERGROUND_INS) > 0) o.push('sweep');
  if (ins && assaultHits(g, 'ARVN', sp) > 0) o.push('assault');
  if (ins && count(g, sp, 'us_irreg_u', 'arvn_ranger_u') > 0 && strikeTargets(g, sp).length > 0) o.push('strike');
  return o;
}

registerState('sa_advise', {
  enter(g, a) {
    a.sel = []; a.phase = 'select'; a.i = 0; a.used = false;
    if (advCandidates(g, a).length === 0) finish(g, a);
  },
  prompt(g, a, p) {
    if (a.phase === 'select') {
      p.text(`US Advise: select up to ${maxSel(a, 2)} spaces not Trained (${a.sel.length} selected; click highlighted spaces, then Done).`);
      if (a.sel.length < maxSel(a, 2)) for (const id of advCandidates(g, a)) p.space(id, name(id));
      p.select(a.sel);
      if (a.sel.length > 0) p.action('done', undefined, 'Done selecting spaces');
    } else if (a.phase === 'do') {
      const sp = a.sel[a.i];
      p.text(`Advise in ${name(sp)}: choose one.`);
      p.select([sp]);
      const o = advOptions(g, sp);
      if (o.includes('sweep')) p.action('sweep', undefined, 'Sweep here with ARVN forces (no movement)');
      if (o.includes('assault')) p.action('assault', undefined, 'Assault here as ARVN');
      if (o.includes('strike')) p.action('strike', undefined, 'Activate an Irregular/Ranger to remove 2 enemy pieces');
      p.action('skip', undefined, 'Nothing here');
    } else {
      p.text('Advise: add +6 Aid?');
      p.action('aid', undefined, 'Add +6 Aid');
      p.action('done', undefined, 'No');
    }
  },
  act(g, a, verb, arg) {
    if (a.phase === 'select') {
      if (verb === 'space') {
        a.sel.push(String(arg));
        if (a.sel.length < maxSel(a, 2)) return;
      } else if (a.sel.length === 0) { finish(g, a); return; }
      a.phase = 'do'; a.i = 0;
      return;
    }
    if (a.phase === 'aid') {
      if (verb === 'aid') { addAid(g, 6); log(g, 'Advise: Aid +6.'); }
      finish(g, a);
      return;
    }
    const sp = a.sel[a.i];
    const nextOrAid = () => { a.i++; if (a.i >= a.sel.length) a.phase = 'aid'; };
    if (verb === 'skip') { nextOrAid(); return; }
    a.pendingNext = true;
    if (verb === 'strike') {
      const kind: PieceKind = count(g, sp, 'arvn_ranger_u') > 0 ? 'arvn_ranger_u' : 'us_irreg_u';
      nextOrAid();
      push(g, 'sf_strike', { faction: 'US', space: sp, kind });
      return;
    }
    log(g, `US Advise: ARVN ${verb === 'sweep' ? 'Sweep' : 'Assault'} in ${name(sp)}.`);
    nextOrAid();
    if (verb === 'sweep') push(g, 'op_sweep', { faction: 'ARVN', free: true, spaces: [sp], max: 1, noMove: true });
    else push(g, 'op_assault', { faction: 'ARVN', free: true, spaces: [sp], max: 1, noFollow: true });
  },
  resume() { /* the phase was advanced before pushing the sub-state */ },
});

// ------------------------------------------------------------------ Air Lift (US, 4.2.2)

function airLimit(g: Game, a: any, dflt: number): number {
  let m = isMonsoon(g) ? 2 : dflt;
  if (hasMomentum(g, 115)) m = Math.min(m, 1);
  if (a.max != null) m = Math.min(m, a.max);
  return m;
}

const LIFT_KINDS: PieceKind[] = ['us_troops', 'us_irreg_u', 'us_irreg_a', 'arvn_troops', 'arvn_ranger_u', 'arvn_ranger_a'];
const isUSTroop = (k: PieceKind) => k === 'us_troops';

registerState('sa_air_lift', {
  enter(g, a) {
    a.sel = []; a.phase = 'select'; a.src = null; a.lifted = 0; a.moved = [];
    if (hasMomentum(g, 115)) { log(g, 'Typhoon Kate: no Air Lift.'); finish(g, a); return; }
    if (hasMomentum(g, 15) && momentumSide(g, 15) === 'shaded') { log(g, 'Medevac: no Air Lift.'); finish(g, a); }
  },
  prompt(g, a, p) {
    const lim = airLimit(g, a, 4);
    if (a.phase === 'select') {
      p.text(`US Air Lift: select up to ${lim} spaces (${a.sel.length} selected; click spaces, then Done).`);
      if (a.sel.length < lim) for (const id of SPACE_IDS) if (!isNV(id) && allowed(a, id) && !a.sel.includes(id)) p.space(id, name(id));
      p.select(a.sel);
      p.action('done', undefined, a.sel.length >= 2 ? 'Done selecting spaces' : 'Cancel Air Lift');
    } else if (a.src == null) {
      p.text(`Air Lift: click a piece to move (any US Troops; up to 4 ARVN Troops/Rangers/Irregulars - ${a.lifted}/4 used).`);
      for (const sp of a.sel) {
        for (const k of LIFT_KINDS) {
          if (count(g, sp, k) === 0) continue;
          if (!isUSTroop(k) && a.lifted >= 4) continue;
          p.piece(sp, k, `${PIECE_NAME[k]} from ${name(sp)}`);
        }
      }
      p.select(a.sel);
      p.action('done', undefined, 'Done (finish Air Lift)');
    } else {
      const { sp, kind } = parsePiece(a.src);
      p.text(`Move ${PIECE_NAME[kind]} from ${name(sp)} to which selected space?`);
      p.select([sp]);
      for (const d of a.sel) if (d !== sp) p.space(d, name(d));
      p.action('cancel', undefined, 'Choose another piece');
    }
  },
  act(g, a, verb, arg) {
    if (a.phase === 'select') {
      if (verb === 'space') { a.sel.push(String(arg)); return; }
      if (a.sel.length < 2) { finish(g, { sel: [] }); return; }
      a.phase = 'move';
      return;
    }
    if (verb === 'done') { pop(g, { done: true, spaces: a.moved, used: a.moved.length > 0 }); return; }
    if (verb === 'cancel') { a.src = null; return; }
    if (verb === 'piece') { a.src = String(arg); return; }
    const { sp, kind } = parsePiece(a.src);
    const dest = String(arg);
    move(g, sp, dest, kind, 1);
    if (!isUSTroop(kind)) a.lifted++;
    for (const s of [sp, dest]) if (!a.moved.includes(s)) a.moved.push(s);
    log(g, `Air Lift: ${PIECE_NAME[kind]} from ${name(sp)} to ${name(dest)}.`);
    a.src = null;
  },
});

// ------------------------------------------------------------------ Air Strike (US, 4.2.3)

function hasCOINPiece(g: Game, id: string): boolean {
  return countFaction(g, id, 'US') + countFaction(g, id, 'ARVN') > 0;
}

function strikeCandidates(g: Game, a: any): string[] {
  const arcLight = capability(g, 8) === 'unshaded'; // 1 space may be a Province without COIN pieces
  const usedNoCoin = a.sel.filter((id: string) => !hasCOINPiece(g, id)).length;
  return SPACE_IDS.filter((id) => {
    if (!allowed(a, id) || a.sel.includes(id)) return false;
    if (hasCOINPiece(g, id)) return true;
    return arcLight && usedNoCoin < 1 && space(id).type === 'province';
  });
}

function strikePieceCap(g: Game): number { return capability(g, 20) === 'shaded' ? 2 : 6; } // Laser Guided Bombs (shaded)

function strikePieces(g: Game, a: any): { sp: string; k: PieceKind }[] {
  const out: { sp: string; k: PieceKind }[] = [];
  if (a.hits < 1 || a.removed >= strikePieceCap(g)) return out;
  for (const sp of a.sel) for (const k of airTargets(g, sp)) out.push({ sp, k });
  return out;
}

function canDegrade(g: Game, a: any): boolean {
  if (a.hits < 2 || a.degraded || hasMomentum(g, 39)) return false; // Oriskany: no Degrade
  if (g.trail <= 0) return false;
  if (capability(g, 31) === 'shaded' && g.trail <= 2) return false; // AAA: not below 2
  return true;
}

function strikeFinish(g: Game, a: any): void {
  const arcShaded = capability(g, 8) === 'shaded';
  const lgb = capability(g, 20) === 'unshaded';
  for (const sp of a.sel) {
    const n = a.by[sp] ?? 0;
    if (n <= 0 || !canHaveSupport(sp)) continue;
    if (lgb && n === 1) continue;
    const lv = arcShaded && n > 1 ? 2 : 1;
    shiftSupport(g, sp, -lv);
    log(g, `Air Strike shifts ${name(sp)} ${lv} level(s) toward Active Opposition.`);
  }
  finish(g, a);
}

function strikeCheck(g: Game, a: any): void {
  if (strikePieces(g, a).length === 0 && !canDegrade(g, a)) strikeFinish(g, a);
}

registerState('sa_air_strike', {
  enter(g, a) {
    a.sel = []; a.phase = 'select'; a.removed = 0; a.by = {}; a.degraded = false; a.roll = 0; a.hits = 0;
    if (hasMomentum(g, 41) || hasMomentum(g, 10) || hasMomentum(g, 22)) { log(g, 'No Air Strike (momentum in effect).'); finish(g, a); return; }
    if (strikeCandidates(g, a).length === 0) finish(g, a);
  },
  prompt(g, a, p) {
    const lim = airLimit(g, a, 6);
    if (a.phase === 'select') {
      p.text(`US Air Strike: select up to ${lim} spaces containing a US or ARVN piece (${a.sel.length} selected; then roll for hits).`);
      if (a.sel.length < lim) for (const id of strikeCandidates(g, a)) p.space(id, name(id));
      p.select(a.sel);
      if (a.sel.length > 0) p.action('done', undefined, 'Roll the die for Air Strike hits');
    } else {
      p.text(`Air Strike: die roll ${a.roll}, ${a.hits} hit(s) left, ${a.removed}/${strikePieceCap(g)} pieces removed. Click an enemy piece (1 hit) or degrade the Trail (2 hits).`);
      for (const t of strikePieces(g, a)) p.piece(t.sp, t.k, `${PIECE_NAME[t.k]} in ${name(t.sp)}`);
      p.select(a.sel);
      if (canDegrade(g, a)) p.action('degrade', undefined, `Degrade the Trail (2 hits${capability(g, 4) === 'unshaded' ? ', 2 boxes' : ''}${capability(g, 4) === 'shaded' ? ', works on a 4-6' : ''})`);
      p.action('done', undefined, 'Finish Air Strike');
    }
  },
  act(g, a, verb, arg) {
    if (a.phase === 'select') {
      if (verb === 'space') {
        a.sel.push(String(arg));
        if (a.sel.length < airLimit(g, a, 6)) return;
      } else if (a.sel.length === 0) { finish(g, a); return; }
      a.roll = rollDie(g);
      a.hits = a.roll;
      a.phase = 'alloc';
      log(g, `US Air Strike on ${a.sel.map(name).join(', ')}: die roll ${a.roll}.`);
      strikeCheck(g, a);
      return;
    }
    if (verb === 'piece') {
      const { sp, kind } = parsePiece(arg);
      applyHit(g, sp, kind);
      a.hits--; a.removed++; a.by[sp] = (a.by[sp] ?? 0) + 1;
      strikeCheck(g, a);
    } else if (verb === 'degrade') {
      a.hits -= 2; a.degraded = true;
      const ok = capability(g, 4) === 'shaded' ? rollDie(g) >= 4 : true; // Top Gun (shaded)
      if (!ok) log(g, 'Top Gun: the Trail degrade attempt fails.');
      else {
        const n = capability(g, 4) === 'unshaded' ? 2 : 1;
        changeTrail(g, -n, capability(g, 31) === 'shaded' ? 2 : 0);
        log(g, `Air Strike degrades the Trail to ${g.trail}.`);
        if (capability(g, 33) === 'shaded' && capability(g, 4) !== 'unshaded') { // MiGs
          if (movePool(g, 'us_troops', 'available', 'casualties', 1)) log(g, 'MiGs: a US Troop from Available goes to Casualties.');
        }
        if (capability(g, 34) === 'unshaded') { // SA-2s
          const order: PieceKind[] = ['nva_troops', 'nva_guer_a', 'nva_guer_u', 'nva_base'];
          outer: for (const k of order) for (const id of SPACE_IDS) {
            if (space(id).country !== 'south_vietnam' && count(g, id, k) > 0) { remove(g, id, k, 1); log(g, `SA-2s: US removes ${PIECE_NAME[k]} in ${name(id)}.`); break outer; }
          }
        }
      }
      strikeCheck(g, a);
    } else strikeFinish(g, a);
  },
});

// ------------------------------------------------------------------ Govern (ARVN, 4.3.1)

function governCandidates(g: Game, a: any): string[] {
  return SPACE_IDS.filter((id) => {
    if (id === 'saigon' || !allowed(a, id) || a.sel.includes(id) || isLoc(id) || !canHaveSupport(id)) return false;
    return control(g, id) === 'COIN' && g.spaces[id].support > 0;
  });
}

function governMax(g: Game, a: any): number {
  return maxSel(a, capability(g, 86) === 'shaded' ? 1 : 2); // Mandate of Heaven (shaded)
}

function governFinish(g: Game, a: any): void {
  const bonus = leaderEffect(g).governPatronage;
  if (bonus > 0 && a.sel.length > 0) { addPatronage(g, bonus); log(g, `Leader bonus: Patronage +${bonus}.`); }
  finish(g, a);
}

function canTransferGovern(g: Game, sp: string): boolean {
  return count(g, sp, 'arvn_troops', 'arvn_police') > count(g, sp, 'us_troops') && g.aid > 0;
}

registerState('sa_govern', {
  enter(g, a) {
    a.sel = []; a.pending = null; a.mandateUsed = false;
    if (governCandidates(g, a).length === 0) finish(g, a);
  },
  prompt(g, a, p) {
    if (a.pending) {
      const sp = a.pending;
      const pp = space(sp).pop;
      p.text(`Govern ${name(sp)}: add ${3 * pp} to Aid, or transfer ${pp} from Aid to Patronage.`);
      p.select([sp]);
      p.action('aid', undefined, `Aid +${3 * pp}`);
      if (canTransferGovern(g, sp)) {
        p.action('patronage', undefined, `Transfer ${Math.min(pp, g.aid)} Aid to Patronage and shift 1 level toward Neutral`);
        if (capability(g, 86) === 'unshaded' && !a.mandateUsed) p.action('patronage_keep', undefined, `Transfer ${Math.min(pp, g.aid)} Aid to Patronage without shifting Support`);
      }
      return;
    }
    const lim = governMax(g, a);
    p.text(`ARVN Govern: select up to ${lim} COIN-controlled spaces with Support, not Saigon (${a.sel.length} selected; click spaces, then Done).`);
    if (a.sel.length < lim) for (const id of governCandidates(g, a)) p.space(id, name(id));
    p.select(a.sel);
    if (a.sel.length > 0) p.action('done', undefined, 'Done (finish Govern)');
  },
  act(g, a, verb, arg) {
    if (a.pending) {
      const id = a.pending;
      const pp = space(id).pop;
      if (verb === 'aid') {
        addAid(g, 3 * pp);
        log(g, `Govern ${name(id)}: Aid +${3 * pp}.`);
      } else {
        const t = Math.min(pp, g.aid);
        addAid(g, -t);
        addPatronage(g, t);
        if (verb === 'patronage') shiftSupport(g, id, -1); else a.mandateUsed = true;
        log(g, `Govern ${name(id)}: Aid -${t}, Patronage +${t}${verb === 'patronage' ? ', Support shifts toward Neutral' : ''}.`);
      }
      a.sel.push(id);
      a.pending = null;
      if (a.sel.length >= governMax(g, a) || governCandidates(g, a).length === 0) governFinish(g, a);
      return;
    }
    if (verb === 'space') { a.pending = String(arg); return; }
    governFinish(g, a);
  },
});

// ------------------------------------------------------------------ Transport (ARVN, 4.3.2)

// Spaces reachable by Transport from `origin`: first onto adjacent LoCs, then along LoCs or through Cities,
// then into any adjacent space (never North Vietnam); movement stops at NVA/VC pieces; Khanh limits the
// string to 1 LoC (max LoCs from leaderEffect).
export function transportReach(g: Game, origin: string): string[] {
  const maxLocs = leaderEffect(g).transportMaxLocs;
  const out = new Set<string>();
  const best = new Map<string, number>();
  const queue: { node: string; locs: number }[] = [];
  const enter = (n: string, locs: number) => {
    if (isNV(n) || n === origin) return;
    if (best.has(n) && best.get(n)! <= locs) return;
    best.set(n, locs);
    out.add(n);
    if (countInsurgent(g, n) === 0) queue.push({ node: n, locs });
  };
  for (const n of space(origin).adjacent) if (isLoc(n) && 1 <= maxLocs) enter(n, 1);
  while (queue.length) {
    const { node, locs } = queue.shift()!;
    for (const n of space(node).adjacent) {
      if (isLoc(n)) { if (locs + 1 <= maxLocs) enter(n, locs + 1); }
      else if (space(n).type === 'city') enter(n, locs);
      if (!isNV(n) && n !== origin) out.add(n);
    }
  }
  return [...out];
}

function transportKinds(g: Game): PieceKind[] {
  return capability(g, 61) === 'shaded' ? ['arvn_ranger_u', 'arvn_ranger_a'] : ['arvn_troops', 'arvn_ranger_u', 'arvn_ranger_a']; // Armored Cavalry (shaded)
}

function transportOrigins(g: Game, a: any): string[] {
  return SPACE_IDS.filter((id) => allowed(a, id) && count(g, id, ...transportKinds(g)) > 0 && transportReach(g, id).length > 0);
}

function transportFinish(g: Game, a: any): void {
  // Flip all Rangers on the map to Underground.
  for (const id of SPACE_IDS) flip(g, id, 'arvn_ranger_a', 'arvn_ranger_u', count(g, id, 'arvn_ranger_a'));
  const cav = capability(g, 61) === 'unshaded'
    ? a.dests.filter((d: string) => assaultHits(g, 'ARVN', d) > 0 && countInsurgent(g, d) > 0) : [];
  pop(g, { done: true, spaces: a.moved, used: true, cav });
}

registerState('sa_transport', {
  enter(g, a) {
    a.sel = []; a.phase = 'origin'; a.src = null; a.n = 0; a.moved = []; a.dests = [];
    if (hasMomentum(g, 115)) { log(g, 'Typhoon Kate: no Transport.'); finish(g, a); return; }
    if (transportOrigins(g, a).length === 0) finish(g, a);
  },
  prompt(g, a, p) {
    if (a.phase === 'origin') {
      p.text('ARVN Transport: click the origin space (up to 6 ARVN Troops/Rangers move along LoCs, then Rangers flip Underground).');
      for (const id of transportOrigins(g, a)) p.space(id, name(id));
      return;
    }
    const origin = a.sel[0];
    p.select([origin]);
    if (a.src == null) {
      p.text(`Transport from ${name(origin)}: click a piece to move (${a.n}/6 moved).`);
      if (a.n < 6) for (const k of transportKinds(g)) if (count(g, origin, k) > 0) p.piece(origin, k, `Transport ${PIECE_NAME[k]} from ${name(origin)}`);
      p.action('done', undefined, 'Done (finish Transport)');
    } else {
      p.text('Click the destination.');
      for (const d of transportReach(g, origin)) p.space(d, name(d));
      p.action('cancel', undefined, 'Choose another piece');
    }
  },
  act(g, a, verb, arg) {
    if (a.phase === 'origin') { a.sel = [String(arg)]; a.phase = 'move'; return; }
    if (verb === 'done') { transportFinish(g, a); return; }
    if (verb === 'cancel') { a.src = null; return; }
    if (verb === 'piece') { a.src = parsePiece(arg).kind; return; }
    const origin = a.sel[0];
    const dest = String(arg);
    move(g, origin, dest, a.src as PieceKind, 1);
    a.n++;
    if (!a.moved.includes(origin)) a.moved.push(origin);
    if (!a.moved.includes(dest)) a.moved.push(dest);
    if (!a.dests.includes(dest)) a.dests.push(dest);
    log(g, `Transport: ${PIECE_NAME[a.src as PieceKind]} from ${name(origin)} to ${name(dest)}.`);
    a.src = null;
    if (a.n >= 6 || !transportKinds(g).some((k) => count(g, origin, k) > 0)) transportFinish(g, a);
  },
});

// ------------------------------------------------------------------ Raid (ARVN, 4.3.3)

function raidCandidates(g: Game, a: any): string[] {
  return SPACE_IDS.filter((id) => {
    if (!allowed(a, id) || a.sel.includes(id) || isNV(id) || countInsurgent(g, id) === 0) return false;
    if (count(g, id, 'arvn_ranger_u', 'arvn_ranger_a') > 0) return true;
    return space(id).adjacent.some((n) => count(g, n, 'arvn_ranger_u', 'arvn_ranger_a') > 0);
  });
}

function raidSources(g: Game, sp: string): { sp: string; kind: PieceKind }[] {
  const out: { sp: string; kind: PieceKind }[] = [];
  for (const n of space(sp).adjacent) for (const k of ['arvn_ranger_u', 'arvn_ranger_a'] as PieceKind[]) if (count(g, n, k) > 0) out.push({ sp: n, kind: k });
  return out;
}

registerState('sa_raid', {
  enter(g, a) {
    a.sel = []; a.phase = 'select'; a.i = 0; a.used = false;
    if (raidCandidates(g, a).length === 0) finish(g, a);
  },
  prompt(g, a, p) {
    if (a.phase === 'select') {
      p.text(`ARVN Raid: select up to ${maxSel(a, 2)} spaces with enemies and Rangers in or adjacent (${a.sel.length} selected; then Done).`);
      if (a.sel.length < maxSel(a, 2)) for (const id of raidCandidates(g, a)) p.space(id, name(id));
      p.select(a.sel);
      if (a.sel.length > 0) p.action('done', undefined, 'Done selecting spaces');
    } else if (a.phase === 'movein') {
      const sp = a.sel[a.i];
      p.text(`Raid ${name(sp)}: move in adjacent Rangers (optional).`);
      p.select([sp]);
      for (const s of raidSources(g, sp)) p.piece(s.sp, s.kind, `Move ${PIECE_NAME[s.kind]} from ${name(s.sp)}`);
      p.action('next', undefined, 'Done moving in');
    } else {
      const sp = a.sel[a.i];
      p.text(`Raid ${name(sp)}: activate an Underground Ranger to remove 2 enemy pieces?`);
      p.select([sp]);
      if (count(g, sp, 'arvn_ranger_u') > 0 && strikeTargets(g, sp).length > 0) p.action('activate', undefined, 'Activate a Ranger and remove 2 enemy pieces');
      p.action('skip', undefined, 'Do not remove anything here');
    }
  },
  act(g, a, verb, arg) {
    const nextSpace = () => { a.i++; a.phase = a.i >= a.sel.length ? 'end' : 'movein'; if (a.phase === 'end') finish(g, a); };
    if (a.phase === 'select') {
      if (verb === 'space') {
        a.sel.push(String(arg));
        if (a.sel.length < maxSel(a, 2)) return;
      } else if (a.sel.length === 0) { finish(g, a); return; }
      log(g, `ARVN Raid in ${a.sel.map(name).join(', ')}.`);
      a.phase = 'movein'; a.i = 0;
    } else if (a.phase === 'movein') {
      const sp = a.sel[a.i];
      if (verb === 'piece') {
        const { sp: from, kind } = parsePiece(arg);
        move(g, from, sp, kind, 1);
        log(g, `Raid: ${PIECE_NAME[kind]} moves from ${name(from)} to ${name(sp)}.`);
      } else a.phase = 'raid';
    } else {
      const sp = a.sel[a.i];
      if (verb === 'activate') {
        a.i++;
        a.phase = a.i >= a.sel.length ? 'end' : 'movein';
        push(g, 'sf_strike', { faction: 'ARVN', space: sp, kind: 'arvn_ranger_u' });
        return;
      }
      nextSpace();
    }
  },
  resume(g, a) { if (a.phase === 'end') finish(g, a); },
});
