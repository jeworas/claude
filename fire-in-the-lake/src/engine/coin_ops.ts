// US and ARVN Operations (3.2) and Special Activities (4.2, 4.3).
//
// States (all take {faction, free?, limited?, spaces?, max?} and pop {done:true, spaces}):
//   op_train, op_patrol, op_sweep, op_assault           (faction 'US' or 'ARVN')
//   sa_advise, sa_air_lift, sa_air_strike                (US)
//   sa_govern, sa_transport, sa_raid                     (ARVN)
//
// Each op has phases kept in the frame args ('select' -> per-op work). Verbs offered:
//   'space' <id>     select a space (or destination)
//   'piece' <sp:kind> choose a piece (removal target, mover, ...)
//   'move_all' <sp:kind> move every available piece of that kind (Sweep / Patrol)
//   'place' <kind> / 'fill' <kind> / 'base' / 'next'   Train
//   'terror' / 'shift'                                   Pacification
//   'aid' / 'patronage'                                  Govern
//   'sweep' / 'assault' / 'skip'                         Advise
//   'done'
//
// Rule simplifications (see report): US Ops cost nothing except Train (placing Rangers) and
// Pacification, which are paid from ARVN Resources above Total Econ (g.econ). ARVN Train, Sweep
// and Assault cost 3 per space, ARVN Patrol 3 in total.

import { registerState, push, pop, log, rollDie } from '../core/framework';
import type { Faction, Game, PieceKind, PoolKind } from '../core/types';
import { SPACE_IDS } from '../data/map';
import {
  space, count, countBases, control, place, remove, move, flip, removeTo, addResources,
  addAid, addPatronage, setTrail, shiftSupport, canHaveSupport, PIECE_NAME,
} from '../core/pieces';
import { isMonsoon } from './sequence';
import { leaderEffect } from './coup';

// ------------------------------------------------------------------ shared helpers

export function hasMomentum(g: Game, id: number): boolean { return g.momentum.includes(id); }
export function capability(g: Game, id: number): 'unshaded' | 'shaded' | undefined { return g.capabilities[id]; }

// Can `f` spend n Resources? The US spends ARVN Resources but never below Total Econ (1.8 / 3.1).
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

const ALL_INS_GUER: PieceKind[] = ['nva_guer_u', 'nva_guer_a', 'vc_guer_u', 'vc_guer_a'];
const UNDERGROUND_INS: PieceKind[] = ['nva_guer_u', 'vc_guer_u'];
const ACTIVE_INS: PieceKind[] = ['nva_guer_a', 'vc_guer_a'];
const BASE_KINDS: PieceKind[] = ['nva_base', 'nva_tunnel', 'vc_base', 'vc_tunnel'];

function otherSideOf(k: PieceKind): PieceKind {
  if (k.endsWith('_u')) return (k.slice(0, -2) + '_a') as PieceKind;
  return (k.slice(0, -2) + '_u') as PieceKind;
}

// Enemy pieces that an Assault-type hit may remove now (3.2.4): NVA Troops first, then Active
// Guerrillas, then Bases (only if that faction has no Guerrillas left in the space). Underground
// Guerrillas are never targets unless `underground` is set (Raid), after Active Guerrillas.
export function assaultTargets(g: Game, sp: string, underground = false): PieceKind[] {
  const c = (k: PieceKind) => count(g, sp, k);
  if (c('nva_troops') > 0) return ['nva_troops'];
  const act = ACTIVE_INS.filter((k) => c(k) > 0);
  if (act.length) return act;
  if (underground) {
    const u = UNDERGROUND_INS.filter((k) => c(k) > 0);
    if (u.length) return u;
  }
  const out: PieceKind[] = [];
  for (const k of BASE_KINDS) {
    if (c(k) <= 0) continue;
    const nva = k.startsWith('nva');
    const guer = nva ? c('nva_guer_u') + c('nva_guer_a') : c('vc_guer_u') + c('vc_guer_a');
    if (guer === 0) out.push(k);
  }
  return out;
}

// Remove one enemy piece as a result of a hit. Tunneled Bases: roll a die, 4-6 removes the marker.
export function applyHit(g: Game, sp: string, k: PieceKind): boolean {
  if (k === 'nva_tunnel' || k === 'vc_tunnel') {
    const r = rollDie(g);
    if (r >= 4) {
      flip(g, sp, k, k === 'nva_tunnel' ? 'nva_base' : 'vc_base', 1);
      log(g, `Tunnel marker removed from ${space(sp).name} (roll ${r}).`);
      return true;
    }
    log(g, `Tunneled Base in ${space(sp).name} survives (roll ${r}).`);
    return false;
  }
  const n = remove(g, sp, k, 1);
  if (n) log(g, `Removed ${PIECE_NAME[k]} in ${space(sp).name}.`);
  return n > 0;
}

function parsePiece(arg: string | number | undefined): { sp: string; kind: PieceKind } {
  const [sp, kind] = String(arg).split(':');
  return { sp, kind: kind as PieceKind };
}

function isSV(id: string): boolean { return space(id).country === 'south_vietnam'; }
function isLoc(id: string): boolean { return space(id).type === 'loc'; }

function stackOK(g: Game, sp: string): boolean {
  return !isLoc(sp) && countBases(g, sp) < 2;
}

function maxSel(a: any, dflt = Infinity): number {
  let m = a.limited ? 1 : dflt;
  if (a.max != null) m = Math.min(m, a.max);
  return m;
}

function allowed(a: any, id: string): boolean {
  return !a.spaces || a.spaces.includes(id);
}

function finish(g: Game, a: any): void {
  pop(g, { done: true, spaces: a.sel ?? [] });
}

function name(id: string): string { return space(id).name; }

// ---- generic sequential resolver: for each selected space, apply `hits` hits (auto if one choice)

interface Resolver {
  hits(g: Game, sp: string): number;
  kinds(g: Game, sp: string): PieceKind[];
  apply(g: Game, sp: string, k: PieceKind): void;
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
    if (kinds.length === 1) { r.apply(g, sp, kinds[0]); a.hits--; continue; }
    return;
  }
}

function resolverPrompt(g: Game, a: any, p: any, r: Resolver, label: string): void {
  const sp = a.sel[a.i];
  p.text(`${label}: ${a.hits} left in ${name(sp)}. Choose a piece.`);
  for (const k of r.kinds(g, sp)) p.piece(sp, k, `${PIECE_NAME[k]} in ${name(sp)}`);
  p.select([sp]);
}

function resolverAct(g: Game, a: any, r: Resolver, arg: any): void {
  const { sp, kind } = parsePiece(arg);
  r.apply(g, sp, kind);
  a.hits--;
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
    let n = c('us_troops') + c('us_irreg_u') + c('us_irreg_a');
    if (s.terrain === 'highland') n = Math.floor(n / 2);
    if (c('us_base') > 0) n *= 2; // a US Base doubles hits (after any Highland halving)
    return n;
  }
  let cubes = c('arvn_troops') + c('arvn_ranger_u') + c('arvn_ranger_a');
  if (s.type === 'city' || s.type === 'loc') cubes += c('arvn_police');
  return Math.floor(cubes / (s.terrain === 'highland' ? 3 : 2));
}

// Enemy pieces removable by Air Strike: Active Troops/Guerrillas; Bases only when no other
// insurgent pieces remain in the space.
export function airTargets(g: Game, sp: string): PieceKind[] {
  const c = (k: PieceKind) => count(g, sp, k);
  const act = (['nva_troops', 'nva_guer_a', 'vc_guer_a'] as PieceKind[]).filter((k) => c(k) > 0);
  if (act.length) return act;
  if (UNDERGROUND_INS.some((k) => c(k) > 0)) return [];
  return BASE_KINDS.filter((k) => c(k) > 0);
}

function abramsKinds(g: Game, a: any, sp: string, normal: PieceKind[]): PieceKind[] {
  if (a.faction !== 'US' || capability(g, 11) !== 'unshaded') return normal;
  if (a.abramsSp != null && a.abramsSp !== sp) return normal;
  const bases = BASE_KINDS.filter((k) => count(g, sp, k) > 0);
  if (!bases.length) return normal;
  return [...new Set([...normal, ...bases])];
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
    if (capability(g, 14) === 'unshaded' && (s.terrain === 'highland' || s.terrain === 'jungle') && (a.patton ?? 0) < 2) {
      a.patton = (a.patton ?? 0) + 1; h += 2; // M-48 Patton
    }
    if (a.faction === 'US' && capability(g, 28) === 'unshaded' && !a.sd) { // Search and Destroy
      const u = UNDERGROUND_INS.find((k) => count(g, sp, k) > 0);
      if (u) { a.sd = true; remove(g, sp, u, 1); log(g, `Search and Destroy removes an Underground guerrilla in ${name(sp)}.`); }
    }
    if (capability(g, 28) === 'shaded' && canHaveSupport(sp)) shiftSupport(g, sp, -1);
    return h;
  },
  kinds: (g, sp) => abramsKinds(g, a, sp, assaultTargets(g, sp)),
  apply: (g, sp, k) => {
    if (BASE_KINDS.includes(k) && !assaultTargets(g, sp).includes(k)) a.abramsSp = sp;
    applyHit(g, sp, k);
  },
  done: (g, aa) => assaultDone(g, aa),
});

function assaultDone(g: Game, a: any): void {
  // US Assault may add an ARVN Assault in one of its spaces for 3 ARVN Resources.
  a.phase = 'arvn';
  if (a.faction !== 'US' || a.free || !canSpend(g, 'US', 3) || arvnAddCandidates(g, a).length === 0) finish(g, a);
}

function arvnAddCandidates(g: Game, a: any): string[] {
  return a.sel.filter((id: string) => assaultHits(g, 'ARVN', id) > 0 && assaultTargets(g, id).length > 0);
}

function assaultCandidates(g: Game, a: any): string[] {
  const out: string[] = [];
  for (const id of SPACE_IDS) {
    if (!allowed(a, id) || a.sel.includes(id)) continue;
    if (assaultHits(g, a.faction, id) <= 0) continue;
    const sd = a.faction === 'US' && capability(g, 28) === 'unshaded' && UNDERGROUND_INS.some((k) => count(g, id, k) > 0);
    if (!sd && abramsKinds(g, a, id, assaultTargets(g, id)).length === 0) continue;
    out.push(id);
  }
  return out;
}

function assaultCost(a: any): number { return a.free || a.faction === 'US' ? 0 : 3; }

function assaultMax(g: Game, a: any): number {
  return maxSel(a, a.faction === 'US' && capability(g, 11) === 'shaded' ? 2 : Infinity); // Abrams (shaded)
}

registerState('op_assault', {
  enter(g, a) {
    a.sel = []; a.phase = 'select'; a.i = 0; a.hits = null;
    const cands = assaultCandidates(g, a).filter((id) => canSpend(g, a.faction, assaultCost(a)));
    if (cands.length === 0) { finish(g, a); return; }
    if (a.spaces?.length === 1 && a.max === 1) { // single forced space: select it automatically
      spend(g, a.faction, assaultCost(a));
      a.sel.push(a.spaces[0]);
      log(g, `${a.faction} Assaults ${name(a.spaces[0])}.`);
      beginResolve(g, a, assaultResolver(a));
    }
  },
  prompt(g, a, p) {
    if (a.phase === 'select') {
      const cands = assaultCandidates(g, a).filter((id) => canSpend(g, a.faction, assaultCost(a)));
      const mx = assaultMax(g, a);
      p.text(`${a.faction} Assault: select spaces (${a.sel.length}/${mx === Infinity ? '-' : mx}).`);
      if (a.sel.length < mx) for (const id of cands) p.space(id, `${name(id)} (${assaultHits(g, a.faction, id)} hits)`);
      p.select(a.sel);
      if (a.sel.length > 0 || cands.length === 0) p.action('done', undefined, 'Done');
    } else if (a.phase === 'arvn') {
      p.text('US Assault: add an ARVN Assault in one of these spaces for 3 ARVN Resources?');
      for (const id of arvnAddCandidates(g, a)) p.space(id, `ARVN Assault in ${name(id)}`);
      p.action('done', undefined, 'No');
    } else {
      resolverPrompt(g, a, p, assaultResolver(a), `${a.faction} Assault`);
    }
  },
  act(g, a, verb, arg) {
    const r = assaultResolver(a);
    if (a.phase === 'select') {
      if (verb === 'space') {
        const id = String(arg);
        spend(g, a.faction, assaultCost(a));
        a.sel.push(id);
        log(g, `${a.faction} Assaults ${name(id)}.`);
        if (a.sel.length >= assaultMax(g, a)) beginResolve(g, a, r);
      } else if (a.sel.length === 0) finish(g, a);
      else beginResolve(g, a, r);
    } else if (a.phase === 'arvn') {
      if (verb === 'space') {
        spend(g, 'US', 3);
        a.phase = 'arvn_done';
        push(g, 'op_assault', { faction: 'ARVN', free: true, spaces: [String(arg)], max: 1 });
      } else finish(g, a);
    } else if (verb === 'piece') resolverAct(g, a, r, arg);
  },
  resume(g, a) { if (a.phase === 'arvn_done') finish(g, a); },
});

// ------------------------------------------------------------------ Sweep (3.2.3)

function sweepPieces(faction: Faction): PieceKind[] {
  return faction === 'US' ? ['us_troops'] : ['arvn_troops'];
}

export function sweepPower(g: Game, faction: Faction, sp: string): number {
  const s = space(sp);
  const c = (k: PieceKind) => count(g, sp, k);
  let n: number;
  if (faction === 'US') {
    n = c('us_troops') + c('us_irreg_u') + c('us_irreg_a');
    if (capability(g, 18) === 'unshaded') n += c('arvn_police'); // Combined Action Platoons
  } else {
    n = c('arvn_troops') + c('arvn_police') + c('arvn_ranger_u') + c('arvn_ranger_a');
  }
  if (s.terrain === 'jungle') n = Math.floor(n / 2); // no halving in Highland
  return n;
}

function movable(g: Game, a: any, from: string, kind: PieceKind): number {
  return count(g, from, kind) - (a.moved?.[`${from}:${kind}`] ?? 0);
}

function sweepSources(g: Game, a: any, dest: string): { sp: string; kind: PieceKind }[] {
  const out: { sp: string; kind: PieceKind }[] = [];
  for (const from of space(dest).adjacent) {
    for (const k of sweepPieces(a.faction)) if (movable(g, a, from, k) > 0) out.push({ sp: from, kind: k });
  }
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

// Cobras (unshaded): the first 2 Sweep spaces each remove 1 Active enemy piece.
const cobraResolver = (a: any): Resolver => ({
  hits: () => 1,
  kinds: (g, sp) => (['nva_troops', 'nva_guer_a', 'vc_guer_a'] as PieceKind[]).filter((k) => count(g, sp, k) > 0),
  apply: (g, sp, k) => { applyHit(g, sp, k); },
  done: (g, aa) => { aa.sel = aa.sel0; finish(g, aa); },
});

function sweepDone(g: Game, a: any): void {
  if (capability(g, 13) === 'unshaded' && !a.cobras) {
    a.cobras = true;
    a.sel0 = a.sel;
    a.sel = a.sel0.slice(0, 2);
    beginResolve(g, a, cobraResolver(a));
    return;
  }
  finish(g, a);
}

const curSweep = (a: any): Resolver => (a.cobras ? cobraResolver(a) : sweepResolver(a));

function sweepCost(a: any): number { return a.free || a.faction === 'US' ? 0 : 3; }

function sweepCandidates(g: Game, a: any): string[] {
  const out: string[] = [];
  for (const id of SPACE_IDS) {
    if (isLoc(id) || space(id).country === 'north_vietnam' || !allowed(a, id) || a.sel.includes(id)) continue;
    if (!UNDERGROUND_INS.some((k) => count(g, id, k) > 0)) continue;
    const here = sweepPower(g, a.faction, id) > 0;
    const adj = space(id).adjacent.some((n) => sweepPieces(a.faction).some((k) => count(g, n, k) > 0));
    if (here || adj) out.push(id);
  }
  return out;
}

function sweepAdvanceMove(g: Game, a: any): void {
  while (a.mi < a.sel.length && sweepSources(g, a, a.sel[a.mi]).length === 0) a.mi++;
  if (a.mi >= a.sel.length) beginResolve(g, a, sweepResolver(a));
}

registerState('op_sweep', {
  enter(g, a) {
    a.sel = []; a.phase = 'select'; a.mi = 0; a.moved = {}; a.i = 0; a.hits = null;
    if (isMonsoon(g)) { log(g, 'Monsoon: no Sweep.'); finish(g, a); return; }
    const cands = sweepCandidates(g, a).filter(() => canSpend(g, a.faction, sweepCost(a)));
    if (cands.length === 0) { finish(g, a); return; }
    if (a.spaces?.length === 1 && a.max === 1) {
      spend(g, a.faction, sweepCost(a));
      a.sel.push(a.spaces[0]);
      log(g, `${a.faction} Sweeps ${name(a.spaces[0])}.`);
      a.phase = 'move'; a.mi = 0; sweepAdvanceMove(g, a);
    }
  },
  prompt(g, a, p) {
    if (a.phase === 'select') {
      const cands = sweepCandidates(g, a).filter(() => canSpend(g, a.faction, sweepCost(a)));
      p.text(`${a.faction} Sweep: select spaces (${a.sel.length}/${maxSel(a) === Infinity ? '-' : maxSel(a)}).`);
      if (a.sel.length < maxSel(a)) for (const id of cands) p.space(id);
      p.select(a.sel);
      if (a.sel.length > 0 || cands.length === 0) p.action('done', undefined, 'Done');
    } else if (a.phase === 'move') {
      const dest = a.sel[a.mi];
      p.text(`Sweep into ${name(dest)}: move Troops from adjacent spaces (optional).`);
      for (const s of sweepSources(g, a, dest)) {
        p.piece(s.sp, s.kind, `Move 1 ${PIECE_NAME[s.kind]} from ${name(s.sp)}`);
        p.action('move_all', `${s.sp}:${s.kind}`, `Move all ${PIECE_NAME[s.kind]} from ${name(s.sp)}`, { space: s.sp, piece: s.kind });
      }
      p.select([dest]);
      p.action('next', undefined, 'Next space');
    } else {
      resolverPrompt(g, a, p, curSweep(a), `${a.faction} Sweep`);
    }
  },
  act(g, a, verb, arg) {
    if (a.phase === 'select') {
      if (verb === 'space') {
        const id = String(arg);
        spend(g, a.faction, sweepCost(a));
        a.sel.push(id);
        log(g, `${a.faction} Sweeps ${name(id)}.`);
        if (a.sel.length >= maxSel(a)) { a.phase = 'move'; a.mi = 0; sweepAdvanceMove(g, a); }
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

// Spaces from which cubes can reach `dest` by travelling along LoCs (each LoC-to-LoC hop is free).
export function patrolSourceSpaces(dest: string): string[] {
  const seen = new Set<string>([dest]);
  const out: string[] = [];
  const queue = [dest];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const n of space(cur).adjacent) {
      if (seen.has(n)) continue;
      seen.add(n);
      out.push(n);
      if (isLoc(n)) queue.push(n);
    }
  }
  return out;
}

function patrolSources(g: Game, a: any, dest: string): { sp: string; kind: PieceKind }[] {
  const out: { sp: string; kind: PieceKind }[] = [];
  for (const from of patrolSourceSpaces(dest)) {
    for (const k of patrolPieces(a.faction)) if (movable(g, a, from, k) > 0) out.push({ sp: from, kind: k });
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

function patrolAssaultPhase(g: Game, a: any): void {
  a.phase = 'assault';
  if (a.sel.filter((id: string) => assaultTargets(g, id).length > 0 && assaultHits(g, a.faction, id) > 0).length === 0) patrolFinish(g, a);
}

function patrolAdvanceMove(g: Game, a: any): void {
  while (a.mi < a.sel.length && patrolSources(g, a, a.sel[a.mi]).length === 0) a.mi++;
  if (a.mi >= a.sel.length) beginResolve(g, a, patrolResolver());
}

function patrolCandidates(g: Game, a: any): string[] {
  const out: string[] = [];
  for (const id of SPACE_IDS) {
    if (!isLoc(id) || !allowed(a, id) || a.sel.includes(id)) continue;
    const here = count(g, id, ...patrolPieces(a.faction)) > 0;
    if (here || patrolSources(g, a, id).length > 0) out.push(id);
  }
  return out;
}

// M-48 Patton (shaded): after Patrol, NVA removes up to 2 of the moved cubes.
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
  finish(g, a);
}

registerState('op_patrol', {
  enter(g, a) {
    a.sel = []; a.phase = 'select'; a.mi = 0; a.moved = {}; a.i = 0; a.hits = null; a.paid = false;
    const cost = a.free || a.faction === 'US' ? 0 : 3;
    if (patrolCandidates(g, a).length === 0 || !canSpend(g, a.faction, cost)) patrolFinish(g, a);
  },
  prompt(g, a, p) {
    if (a.phase === 'select') {
      p.text(`${a.faction} Patrol: select LoCs (${a.sel.length}/${maxSel(a) === Infinity ? '-' : maxSel(a)}).`);
      if (a.sel.length < maxSel(a)) for (const id of patrolCandidates(g, a)) p.space(id);
      p.select(a.sel);
      if (a.sel.length > 0) p.action('done', undefined, 'Done');
    } else if (a.phase === 'move') {
      const dest = a.sel[a.mi];
      p.text(`Patrol ${name(dest)}: move cubes along LoCs (optional).`);
      for (const s of patrolSources(g, a, dest)) {
        p.piece(s.sp, s.kind, `Move 1 ${PIECE_NAME[s.kind]} from ${name(s.sp)}`);
        p.action('move_all', `${s.sp}:${s.kind}`, `Move all ${PIECE_NAME[s.kind]} from ${name(s.sp)}`, { space: s.sp, piece: s.kind });
      }
      p.select([dest]);
      p.action('next', undefined, 'Next LoC');
    } else if (a.phase === 'resolve') {
      resolverPrompt(g, a, p, patrolResolver(), `${a.faction} Patrol activation`);
    } else {
      p.text(`${a.faction} Patrol: you may conduct a free Assault in one patrolled LoC.`);
      for (const id of a.sel) {
        if (assaultTargets(g, id).length > 0 && assaultHits(g, a.faction, id) > 0) p.space(id, `Assault ${name(id)}`);
      }
      p.action('done', undefined, 'No Assault');
    }
  },
  act(g, a, verb, arg) {
    if (a.phase === 'select') {
      if (verb === 'space') {
        const id = String(arg);
        if (!a.paid) { spend(g, a.faction, a.free || a.faction === 'US' ? 0 : 3); a.paid = true; }
        a.sel.push(id);
        log(g, `${a.faction} Patrols ${name(id)}.`);
        if (a.sel.length >= maxSel(a)) { a.phase = 'move'; a.mi = 0; patrolAdvanceMove(g, a); }
      } else { a.phase = 'move'; a.mi = 0; patrolAdvanceMove(g, a); }
    } else if (a.phase === 'move') {
      const dest = a.sel[a.mi];
      if (verb === 'next') { a.mi++; patrolAdvanceMove(g, a); return; }
      const { sp, kind } = parsePiece(arg);
      const n = verb === 'move_all' ? movable(g, a, sp, kind) : 1;
      const m = move(g, sp, dest, kind, n);
      a.moved[`${dest}:${kind}`] = (a.moved[`${dest}:${kind}`] ?? 0) + m;
      log(g, `Moved ${m} ${PIECE_NAME[kind]} from ${name(sp)} to ${name(dest)}.`);
      if (patrolSources(g, a, dest).length === 0) { a.mi++; patrolAdvanceMove(g, a); }
    } else if (a.phase === 'resolve') {
      if (verb === 'piece') resolverAct(g, a, patrolResolver(), arg);
    } else if (verb === 'space') {
      a.phase = 'done';
      push(g, 'op_assault', { faction: a.faction, free: true, spaces: [String(arg)], max: 1 });
    } else patrolFinish(g, a);
  },
  resume(g, a) { if (a.phase === 'done') patrolFinish(g, a); },
});

// ------------------------------------------------------------------ Train (3.2.1)

function trainCandidates(g: Game, a: any): string[] {
  const out: string[] = [];
  for (const id of SPACE_IDS) {
    const s = space(id);
    if (s.type === 'loc' || s.country !== 'south_vietnam' || !allowed(a, id) || a.sel.includes(id)) continue;
    if (s.type === 'city') { out.push(id); continue; }
    if (count(g, id, 'us_base', 'arvn_base') > 0 || (a.faction === 'US' && count(g, id, 'us_troops') > 0)) out.push(id);
  }
  return out;
}

function trainSelectCost(a: any): number { return a.free || a.faction === 'US' ? 0 : 3; }

function trainOptions(g: Game, a: any): { verb: string; kind: string; label: string }[] {
  const sp = a.sel[a.i];
  const cur = a.cur;
  const opts: { verb: string; kind: string; label: string }[] = [];
  const av = g.available;
  const rangerOK = av.arvn_ranger > 0 && cur.sf < 2 && cur.cubes === 0
    && (a.faction === 'ARVN' || a.free || cur.paid || canSpend(g, 'US', 3));
  if (a.faction === 'US') {
    if (av.us_irreg > 0 && cur.sf < 2 && cur.cubes === 0) opts.push({ verb: 'place', kind: 'us_irreg', label: 'Place an Irregular' });
  } else {
    if (cur.sf === 0 && cur.cubes < 6) {
      if (av.arvn_troops > 0) opts.push({ verb: 'place', kind: 'arvn_troops', label: 'Place ARVN Troops' });
      if (av.arvn_police > 0) opts.push({ verb: 'place', kind: 'arvn_police', label: 'Place Police' });
    }
  }
  if (rangerOK) opts.push({ verb: 'place', kind: 'arvn_ranger', label: 'Place a Ranger' });
  if (a.faction === 'ARVN' && !cur.base && av.arvn_base > 0 && stackOK(g, sp)
    && count(g, sp, 'arvn_troops', 'arvn_police') >= 3) {
    opts.push({ verb: 'base', kind: 'arvn_base', label: 'Replace 3 ARVN cubes with an ARVN Base' });
  }
  return opts;
}

function pacifyCandidates(g: Game, a: any): string[] {
  const out: string[] = [];
  for (const id of a.sel) {
    if (!canHaveSupport(id) || control(g, id) !== 'COIN') continue;
    const troops = a.faction === 'US' ? count(g, id, 'us_troops') : count(g, id, 'arvn_troops');
    if (troops < 1 || count(g, id, 'arvn_police') < 1) continue;
    const st = g.spaces[id];
    if (st.terror === 0 && st.support >= 2) continue;
    out.push(id);
  }
  return out;
}

function pacCost(g: Game, a: any): number {
  if (a.free) return 0;
  if (hasMomentum(g, 16)) return 1; // Blowtorch Komer
  return leaderEffect(g).pacifyCost;
}

function pacifyMaxSteps(g: Game): number {
  return capability(g, 19) === 'unshaded' ? 3 : 2; // CORDS
}

function trainNextSpace(g: Game, a: any): void {
  a.i++;
  a.cur = { cubes: 0, sf: 0, base: false, paid: false };
  if (a.i >= a.sel.length) {
    a.phase = 'pacify';
    a.pac = null;
    a.steps = 0;
    if (pacifyCandidates(g, a).length === 0) finish(g, a);
  }
}

registerState('op_train', {
  enter(g, a) {
    a.sel = []; a.phase = 'select'; a.i = 0; a.pac = null; a.steps = 0;
    a.cur = { cubes: 0, sf: 0, base: false, paid: false };
    if (trainCandidates(g, a).filter(() => canSpend(g, a.faction, trainSelectCost(a))).length === 0) finish(g, a);
  },
  prompt(g, a, p) {
    if (a.phase === 'select') {
      p.text(`${a.faction} Train: select Cities/Provinces (${a.sel.length}/${maxSel(a) === Infinity ? '-' : maxSel(a)}).`);
      if (a.sel.length < maxSel(a)) {
        for (const id of trainCandidates(g, a)) if (canSpend(g, a.faction, trainSelectCost(a))) p.space(id);
      }
      p.select(a.sel);
      if (a.sel.length > 0) p.action('done', undefined, 'Done selecting');
    } else if (a.phase === 'place') {
      const sp = a.sel[a.i];
      p.text(`Train in ${name(sp)}: place forces (${a.cur.cubes} cubes, ${a.cur.sf} special forces placed).`);
      for (const o of trainOptions(g, a)) {
        if (o.verb === 'place') {
          p.action('place', o.kind, o.label, { space: sp });
          p.action('fill', o.kind, `${o.label} (max)`, { space: sp });
        } else p.action(o.verb, o.kind, o.label, { space: sp });
      }
      p.select([sp]);
      p.action('next', undefined, 'Done with this space');
    } else {
      p.text(`${a.faction} Pacification: choose a Train space with COIN Control (${a.steps}/${pacifyMaxSteps(g)} steps).`);
      if (a.pac == null) {
        for (const id of pacifyCandidates(g, a)) p.space(id, `Pacify ${name(id)}`);
      } else {
        const st = g.spaces[a.pac];
        const cost = pacCost(g, a);
        if (a.steps < pacifyMaxSteps(g) && canSpend(g, a.faction, cost)) {
          if (st.terror > 0) p.action('terror', undefined, `Remove a Terror marker (${cost})`);
          else if (st.support < 2) p.action('shift', undefined, `Shift toward Active Support (${cost})`);
        }
        p.select([a.pac]);
      }
      p.action('done', undefined, 'Done');
    }
  },
  act(g, a, verb, arg) {
    if (a.phase === 'select') {
      if (verb === 'space') {
        const id = String(arg);
        spend(g, a.faction, trainSelectCost(a));
        a.sel.push(id);
        log(g, `${a.faction} Trains in ${name(id)}.`);
        if (a.sel.length < maxSel(a)) return;
      } else if (a.sel.length === 0) { finish(g, a); return; }
      if (a.faction === 'ARVN') {
        const aid = leaderEffect(g).trainAid;
        if (aid > 0) { addAid(g, aid); log(g, `Leader bonus: Aid +${aid}.`); }
      }
      a.phase = 'place';
      a.i = -1;
      trainNextSpace(g, a);
      if (a.phase === 'pacify') return;
      a.phase = 'place';
    } else if (a.phase === 'place') {
      const sp = a.sel[a.i];
      if (verb === 'next') { trainNextSpace(g, a); if (a.phase === 'pacify') return; return; }
      if (verb === 'base') {
        let need = 3;
        for (const k of ['arvn_troops', 'arvn_police'] as PieceKind[]) {
          const n = removeTo(g, sp, k, need, 'available');
          need -= n;
        }
        place(g, sp, 'arvn_base', 1);
        a.cur.base = true;
        log(g, `Built an ARVN Base in ${name(sp)}.`);
        return;
      }
      const kind = String(arg) as PoolKind;
      const reps = verb === 'fill' ? 99 : 1;
      for (let i = 0; i < reps; i++) {
        const ok = trainOptions(g, a).some((o) => o.verb === 'place' && o.kind === kind);
        if (!ok) break;
        if (kind === 'arvn_ranger' && a.faction === 'US' && !a.cur.paid) { spend(g, 'US', a.free ? 0 : 3); a.cur.paid = true; }
        if (place(g, sp, kind, 1) === 0) break;
        if (kind === 'us_irreg' || kind === 'arvn_ranger') a.cur.sf++; else a.cur.cubes++;
        log(g, `Placed ${kind === 'us_irreg' ? 'an Irregular' : kind === 'arvn_ranger' ? 'a Ranger' : kind === 'arvn_police' ? 'Police' : 'ARVN Troops'} in ${name(sp)}.`);
      }
    } else {
      if (verb === 'space') { a.pac = String(arg); return; }
      if (verb === 'done') { finish(g, a); return; }
      const cost = pacCost(g, a);
      spend(g, a.faction, cost);
      const st = g.spaces[a.pac];
      if (verb === 'terror') { st.terror = Math.max(0, st.terror - 1); log(g, `Pacification removes Terror in ${name(a.pac)}.`); }
      else { shiftSupport(g, a.pac, 1); log(g, `Pacification shifts ${name(a.pac)} to support level ${g.spaces[a.pac].support}.`); }
      a.steps++;
      if (a.steps >= pacifyMaxSteps(g)) finish(g, a);
    }
  },
});

// ------------------------------------------------------------------ Special Activities: Advise (US)

registerState('sa_advise', {
  enter(g, a) {
    a.sel = []; a.phase = 'select'; a.cur = null; a.n = 0;
    if (advCandidates(g, a).length === 0) finish(g, a);
  },
  prompt(g, a, p) {
    if (a.phase === 'select') {
      p.text(`US Advise: select up to ${maxSel(a, 2)} spaces with ARVN forces (${a.sel.length} selected).`);
      if (a.sel.length < maxSel(a, 2)) for (const id of advCandidates(g, a)) p.space(id);
      p.select(a.sel);
      if (a.sel.length > 0) p.action('done', undefined, 'Done selecting');
    } else {
      const sp = a.sel[a.i];
      p.text(`Advise in ${name(sp)}: order a free ARVN Sweep or Assault.`);
      if (!isMonsoon(g)) p.action('sweep', undefined, 'Free ARVN Sweep');
      p.action('assault', undefined, 'Free ARVN Assault');
      p.action('skip', undefined, 'Nothing here');
      p.select([sp]);
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
    const sp = a.sel[a.i];
    a.i++;
    const last = a.i >= a.sel.length;
    if (verb === 'skip') { if (last) finish(g, a); return; }
    log(g, `US Advise: free ARVN ${verb === 'sweep' ? 'Sweep' : 'Assault'} in ${name(sp)}.`);
    a.pendingLast = last;
    push(g, verb === 'sweep' ? 'op_sweep' : 'op_assault', { faction: 'ARVN', free: true, spaces: [sp], max: 1 });
  },
  resume(g, a) { if (a.pendingLast) finish(g, a); },
});

function advCandidates(g: Game, a: any): string[] {
  return SPACE_IDS.filter((id) => allowed(a, id) && !a.sel.includes(id)
    && count(g, id, 'arvn_troops', 'arvn_police', 'arvn_ranger_u', 'arvn_ranger_a') > 0);
}

// ------------------------------------------------------------------ Air Lift (US)

const LIFT_KINDS: PieceKind[] = ['us_troops', 'us_irreg_u', 'us_irreg_a', 'arvn_troops', 'arvn_ranger_u', 'arvn_ranger_a'];

function airLimit(g: Game, a: any, dflt: number): number {
  let m = isMonsoon(g) ? 2 : dflt;
  if (a.max != null) m = Math.min(m, a.max);
  return m;
}

registerState('sa_air_lift', {
  enter(g, a) {
    a.sel = []; a.phase = 'select'; a.src = null; a.arvnMoved = 0; a.moved = [];
    if (g.momentum.includes(115)) { log(g, 'Typhoon Kate: no Air Lift.'); finish(g, a); }
  },
  prompt(g, a, p) {
    const lim = airLimit(g, a, 4);
    if (a.phase === 'select') {
      p.text(`US Air Lift: select up to ${lim} spaces (${a.sel.length} selected).`);
      if (a.sel.length < lim) {
        for (const id of SPACE_IDS) if (!isLoc(id) && allowed(a, id) && !a.sel.includes(id)) p.space(id);
      }
      p.select(a.sel);
      p.action('done', undefined, a.sel.length ? 'Done selecting' : 'Cancel');
    } else if (a.src == null) {
      p.text('Air Lift: choose a piece to move (any number of US Troops/Irregulars; up to 4 ARVN Troops/Rangers).');
      for (const sp of a.sel) {
        for (const k of LIFT_KINDS) {
          if (count(g, sp, k) === 0) continue;
          if (k.startsWith('arvn') && a.arvnMoved >= 4) continue;
          p.piece(sp, k, `${PIECE_NAME[k]} from ${name(sp)}`);
        }
      }
      p.select(a.sel);
      p.action('done', undefined, 'Done');
    } else {
      const { sp, kind } = parsePiece(a.src);
      p.text(`Move ${PIECE_NAME[kind]} from ${name(sp)} to which selected space?`);
      for (const d of a.sel) if (d !== sp) p.space(d);
      p.action('cancel', undefined, 'Choose another piece');
    }
  },
  act(g, a, verb, arg) {
    if (a.phase === 'select') {
      if (verb === 'space') { a.sel.push(String(arg)); return; }
      if (a.sel.length < 2) { finish(g, a); return; }
      a.phase = 'move';
      return;
    }
    if (verb === 'done') { finish(g, { sel: a.moved }); return; }
    if (verb === 'cancel') { a.src = null; return; }
    if (verb === 'piece') { a.src = String(arg); return; }
    const { sp, kind } = parsePiece(a.src);
    const dest = String(arg);
    move(g, sp, dest, kind, 1);
    if (kind.startsWith('arvn')) a.arvnMoved++;
    for (const s of [sp, dest]) if (!a.moved.includes(s)) a.moved.push(s);
    log(g, `Air Lift: ${PIECE_NAME[kind]} from ${name(sp)} to ${name(dest)}.`);
    a.src = null;
  },
});

// ------------------------------------------------------------------ Air Strike (US)

function hasCOIN(g: Game, id: string): boolean {
  return count(g, id, 'us_troops', 'us_base', 'us_irreg_u', 'us_irreg_a', 'arvn_troops', 'arvn_police',
    'arvn_ranger_u', 'arvn_ranger_a', 'arvn_base') > 0;
}

function strikeMaxSpaces(g: Game, a: any): number {
  let m = airLimit(g, a, 6);
  if (capability(g, 20) === 'shaded') m = Math.min(m, 2); // Laser Guided Bombs (shaded)
  return m;
}

function strikeCandidates(g: Game, a: any): string[] {
  const arcLight = capability(g, 8) === 'unshaded'; // one space may lack COIN pieces
  const noCoinUsed = a.sel.filter((id: string) => !hasCOIN(g, id)).length;
  return SPACE_IDS.filter((id) => {
    if (!allowed(a, id) || a.sel.includes(id) || airTargets(g, id).length === 0) return false;
    if (hasCOIN(g, id)) return true;
    return arcLight && noCoinUsed < 1;
  });
}

function strikeTrailBlocked(g: Game): boolean {
  return hasMomentum(g, 10) || hasMomentum(g, 39) || g.trail <= 0;
}

function strikeFinishShift(g: Game, a: any): void {
  const shaded8 = capability(g, 8) === 'shaded' && a.sel.length > 1;
  const lgb = capability(g, 20) === 'unshaded' && a.removed === 1;
  if (!lgb) {
    const lv = shaded8 ? 2 : 1;
    for (const id of a.sel) if (canHaveSupport(id)) shiftSupport(g, id, -lv);
    if (a.sel.some((id: string) => canHaveSupport(id))) log(g, `Air Strike shifts Support ${lv} level(s) toward Opposition in struck spaces with Pop.`);
  }
  a.phase = 'trail';
  if (strikeTrailBlocked(g)) finish(g, a);
}

function strikePieces(g: Game, a: any): { sp: string; k: PieceKind }[] {
  const out: { sp: string; k: PieceKind }[] = [];
  for (const sp of a.sel) for (const k of airTargets(g, sp)) out.push({ sp, k });
  return out;
}

function strikeResolveCheck(g: Game, a: any): void {
  if (a.removed >= 6 || strikePieces(g, a).length === 0) strikeFinishShift(g, a);
}

registerState('sa_air_strike', {
  enter(g, a) {
    a.sel = []; a.phase = 'select'; a.removed = 0;
    if (hasMomentum(g, 41)) { log(g, 'Bombing Pause: no Air Strike.'); finish(g, a); return; }
    if (strikeCandidates(g, a).length === 0) finish(g, a);
  },
  prompt(g, a, p) {
    const lim = strikeMaxSpaces(g, a);
    if (a.phase === 'select') {
      p.text(`US Air Strike: select up to ${lim} spaces; up to 6 Active enemy pieces are removed in total (${a.sel.length} selected).`);
      if (a.sel.length < lim) for (const id of strikeCandidates(g, a)) p.space(id);
      p.select(a.sel);
      if (a.sel.length > 0) p.action('done', undefined, 'Strike');
    } else if (a.phase === 'resolve') {
      p.text(`Air Strike: remove enemy pieces (${a.removed}/6).`);
      for (const t of strikePieces(g, a)) p.piece(t.sp, t.k, `${PIECE_NAME[t.k]} in ${name(t.sp)}`);
      p.select(a.sel);
      p.action('done', undefined, 'Done removing');
    } else {
      const two = capability(g, 4) === 'unshaded';
      const need = capability(g, 4) === 'shaded';
      p.text(`Air Strike: degrade the Trail${two ? ' by up to 2' : ' by 1'}${need ? ' (needs a die roll of 4-6)' : ''}?`);
      p.action('degrade', undefined, 'Degrade the Trail');
      p.action('done', undefined, 'No');
    }
  },
  act(g, a, verb, arg) {
    if (a.phase === 'select') {
      if (verb === 'space') {
        a.sel.push(String(arg));
        if (a.sel.length < strikeMaxSpaces(g, a)) return;
      } else if (a.sel.length === 0) { finish(g, a); return; }
      log(g, `US Air Strike on ${a.sel.map(name).join(', ')}.`);
      a.phase = 'resolve';
      strikeResolveCheck(g, a);
    } else if (a.phase === 'resolve') {
      if (verb === 'piece') {
        const { sp, kind } = parsePiece(arg);
        applyHit(g, sp, kind);
        a.removed++;
        strikeResolveCheck(g, a);
      } else strikeFinishShift(g, a);
    } else {
      if (verb === 'degrade') {
        const r = capability(g, 4) === 'shaded' ? rollDie(g) : 6; // Top Gun (shaded)
        if (r >= 4) {
          const n = capability(g, 4) === 'unshaded' ? 2 : 1;
          setTrail(g, g.trail - n);
          log(g, `Trail degraded to ${g.trail}.`);
        } else log(g, `Top Gun: Trail degrade fails (roll ${r}).`);
      }
      finish(g, a);
    }
  },
});

// ------------------------------------------------------------------ Govern (ARVN)

function governCandidates(g: Game, a: any): string[] {
  return SPACE_IDS.filter((id) => {
    if (id === 'saigon' || !allowed(a, id) || a.sel.includes(id) || isLoc(id) || !canHaveSupport(id)) return false;
    if (control(g, id) !== 'COIN' || g.spaces[id].support <= 0) return false;
    return count(g, id, 'arvn_troops', 'arvn_police') > 0;
  });
}

function governMax(g: Game, a: any): number {
  const dflt = capability(g, 86) === 'shaded' ? 1 : 2; // Mandate of Heaven (shaded): 1 space
  return maxSel(a, dflt);
}

function governFinish(g: Game, a: any): void {
  const bonus = leaderEffect(g).governPatronage;
  if (bonus > 0 && a.sel.length > 0) { addPatronage(g, bonus); log(g, `Leader bonus: Patronage +${bonus}.`); }
  finish(g, a);
}

registerState('sa_govern', {
  enter(g, a) {
    a.sel = []; a.pending = null; a.bonus = false;
    if (governCandidates(g, a).length === 0) finish(g, a);
  },
  prompt(g, a, p) {
    if (a.pending) {
      const pop = space(a.pending).pop;
      p.text(`Govern ${name(a.pending)}: Aid +${3 * pop}, or transfer ${pop} from Aid to Patronage.`);
      p.action('aid', undefined, `Aid +${3 * pop}`);
      if (g.aid > 0) p.action('patronage', undefined, `Transfer ${Math.min(pop, g.aid)} Aid to Patronage`);
      p.select([a.pending]);
      return;
    }
    const lim = governMax(g, a);
    p.text(`ARVN Govern: select up to ${lim} COIN-controlled spaces with ARVN cubes (${a.sel.length}).`);
    if (a.sel.length < lim) for (const id of governCandidates(g, a)) p.space(id);
    p.select(a.sel);
    if (a.sel.length > 0) p.action('done', undefined, 'Done');
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
        log(g, `Govern ${name(id)}: Aid -${t}, Patronage +${t}.`);
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

// ------------------------------------------------------------------ Transport (ARVN)

export function transportDestinations(g: Game, origin: string): string[] {
  const maxLocs = Math.min(2, leaderEffect(g).transportMaxLocs); // LoCs traversed en route
  const out = new Set<string>();
  let frontier = [origin];
  const seen = new Set<string>([origin]);
  for (let hop = 1; hop <= maxLocs + 1; hop++) {
    const next: string[] = [];
    for (const cur of frontier) {
      for (const n of space(cur).adjacent) {
        if (seen.has(n)) continue;
        if (isLoc(n)) { if (hop <= maxLocs) { seen.add(n); next.push(n); } }
        else out.add(n);
      }
    }
    frontier = next;
  }
  out.delete(origin);
  return [...out];
}

const TRANSPORT_KINDS: PieceKind[] = ['arvn_troops', 'arvn_ranger_u', 'arvn_ranger_a'];

registerState('sa_transport', {
  enter(g, a) {
    a.sel = []; a.phase = 'origin'; a.src = null; a.n = 0; a.moved = []; a.dests = [];
    if (transportOrigins(g, a).length === 0) finish(g, a);
  },
  prompt(g, a, p) {
    if (a.phase === 'cav') {
      p.text('Armored Cavalry: free ARVN Assault in one Transport destination?');
      for (const d of a.dests) if (assaultHits(g, 'ARVN', d) > 0 && assaultTargets(g, d).length > 0) p.space(d);
      p.action('done', undefined, 'No');
      return;
    }
    if (a.phase === 'origin') {
      p.text('ARVN Transport: choose the origin space (up to 6 Troops/Rangers move along LoCs).');
      for (const id of transportOrigins(g, a)) p.space(id);
      return;
    }
    const origin = a.sel[0];
    if (a.src == null) {
      p.text(`Transport from ${name(origin)}: choose a piece (${a.n}/6 moved).`);
      if (a.n < 6) for (const k of TRANSPORT_KINDS) if (count(g, origin, k) > 0) p.piece(origin, k);
      p.select([origin]);
      p.action('done', undefined, 'Done');
    } else {
      p.text('Choose the destination.');
      for (const d of transportDestinations(g, origin)) p.space(d);
      p.action('cancel', undefined, 'Choose another piece');
    }
  },
  act(g, a, verb, arg) {
    if (a.phase === 'cav') {
      if (verb === 'space') { a.phase = 'cav_done'; push(g, 'op_assault', { faction: 'ARVN', free: true, spaces: [String(arg)], max: 1 }); }
      else finish(g, { sel: a.moved });
      return;
    }
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
    if (String(a.src).startsWith('arvn_ranger') && capability(g, 61) === 'shaded') { // Armored Cavalry (shaded)
      flip(g, dest, 'arvn_ranger_u', 'arvn_ranger_a', 1);
    }
    log(g, `Transport: ${PIECE_NAME[a.src as PieceKind]} from ${name(origin)} to ${name(dest)}.`);
    a.src = null;
    if (a.n >= 6 || !TRANSPORT_KINDS.some((k) => count(g, origin, k) > 0)) transportFinish(g, a);
  },
  resume(g, a) { if (a.phase === 'cav_done') finish(g, { sel: a.moved }); },
});

function transportFinish(g: Game, a: any): void {
  if (capability(g, 61) === 'unshaded' && a.dests.some((d: string) => assaultHits(g, 'ARVN', d) > 0 && assaultTargets(g, d).length > 0)) {
    a.phase = 'cav';
    return;
  }
  finish(g, { sel: a.moved });
}

function transportOrigins(g: Game, a: any): string[] {
  return SPACE_IDS.filter((id) => !isLoc(id) && allowed(a, id) && count(g, id, ...TRANSPORT_KINDS) > 0);
}

// ------------------------------------------------------------------ Raid (ARVN)

function raidHits(g: Game, sp: string): number {
  return Math.min(2, count(g, sp, 'arvn_ranger_u', 'arvn_ranger_a'));
}

const raidResolver = (): Resolver => ({
  hits: (g, sp) => raidHits(g, sp),
  kinds: (g, sp) => assaultTargets(g, sp, true),
  apply: (g, sp, k) => {
    applyHit(g, sp, k);
    if (count(g, sp, 'arvn_ranger_u') > 0) flip(g, sp, 'arvn_ranger_u', 'arvn_ranger_a', 1);
  },
  done: (g, a) => finish(g, a),
});

function raidCandidates(g: Game, a: any): string[] {
  return SPACE_IDS.filter((id) => allowed(a, id) && !a.sel.includes(id) && raidHits(g, id) > 0
    && assaultTargets(g, id, true).length > 0);
}

registerState('sa_raid', {
  enter(g, a) {
    a.sel = []; a.phase = 'select'; a.i = 0; a.hits = null;
    if (raidCandidates(g, a).length === 0) finish(g, a);
  },
  prompt(g, a, p) {
    if (a.phase === 'select') {
      p.text(`ARVN Raid: select up to ${maxSel(a, 2)} spaces with Rangers (${a.sel.length}).`);
      if (a.sel.length < maxSel(a, 2)) for (const id of raidCandidates(g, a)) p.space(id);
      p.select(a.sel);
      if (a.sel.length > 0) p.action('done', undefined, 'Raid');
    } else resolverPrompt(g, a, p, raidResolver(), 'ARVN Raid');
  },
  act(g, a, verb, arg) {
    const r = raidResolver();
    if (a.phase === 'select') {
      if (verb === 'space') {
        a.sel.push(String(arg));
        if (a.sel.length < maxSel(a, 2)) return;
      } else if (a.sel.length === 0) { finish(g, a); return; }
      log(g, `ARVN Raid in ${a.sel.map(name).join(', ')}.`);
      beginResolve(g, a, r);
    } else if (verb === 'piece') resolverAct(g, a, r, arg);
  },
});

// Exported for other layers (events, bots).
export { addAid, isSV };
