// NVA / VC Operations (3.3) and Special Activities (4.4, 4.5), per the 2018 Rulebook.
//
// States registered (all pop with { done: true, spaces: string[] }):
//   op_rally, op_march, op_attack, op_terror            (faction: 'NVA' | 'VC')
//   sa_infiltrate, sa_bombard                             (NVA)
//   sa_tax, sa_subvert                                    (VC)
//   sa_ambush                                             (NVA or VC, standalone / free Ambush per an Event)
//   ins_remove                                            (internal helper: choose COIN pieces to remove)
//
// Common args: { faction, free?, limited?, spaces?, max? }.
//   op_attack / op_march: { ambush?: boolean } Ambush may modify an Attack space or follow a March destination
//              (max 2 spaces). Pass ambush:false when the Special Activity is taken separately or not allowed.
//   sa_*: cost no Resources; `free` is accepted and ignored.
// Exports: changeTrail (applies ADSID), agitateSpace (also used by the Coup Support Phase).

import { registerState, push, pop, log, rollDie } from '../core/framework';
import type { Prompt } from '../core/framework';
import type { Faction, Game, PieceKind, PoolKind } from '../core/types';
import { SPACE_IDS } from '../data/map';
import {
  space, count, countCOIN, countBases, countFaction, place, remove, move, flip, addResources, setTrail, addPatronage,
  shiftSupport, control, isBase, PIECE_NAME, canHaveSupport,
} from '../core/pieces';
import { isMonsoon } from './sequence';

type Ins = 'NVA' | 'VC';

interface GK { u: PieceKind; a: PieceKind; pool: PoolKind; base: PieceKind; tun: PieceKind; bpool: PoolKind }
const GK: Record<Ins, GK> = {
  NVA: { u: 'nva_guer_u', a: 'nva_guer_a', pool: 'nva_guer', base: 'nva_base', tun: 'nva_tunnel', bpool: 'nva_base' },
  VC: { u: 'vc_guer_u', a: 'vc_guer_a', pool: 'vc_guer', base: 'vc_base', tun: 'vc_tunnel', bpool: 'vc_base' },
};

const COIN_NONBASE: PieceKind[] = ['us_troops', 'arvn_troops', 'arvn_police', 'us_irreg_u', 'us_irreg_a', 'arvn_ranger_u', 'arvn_ranger_a'];
const COIN_BASE: PieceKind[] = ['us_base', 'arvn_base'];

export const TERROR_MARKER_CAP = 15;

// ---------------------------------------------------------------- helpers

function facOf(g: Game, a: any): Ins {
  const f: Faction | null = a.faction ?? g.active;
  return f === 'VC' ? 'VC' : 'NVA';
}
const gU = (g: Game, id: string, f: Ins) => count(g, id, GK[f].u);
const gA = (g: Game, id: string, f: Ins) => count(g, id, GK[f].a);
const gTot = (g: Game, id: string, f: Ins) => gU(g, id, f) + gA(g, id, f);
const ownBases = (g: Game, id: string, f: Ins) => count(g, id, GK[f].base, GK[f].tun);
const isLaosCamb = (id: string) => { const c = space(id).country; return c === 'laos' || c === 'cambodia'; };
const hasMomentum = (g: Game, n: number) => g.momentum.includes(n);
const momSide = (g: Game, n: number): string | undefined => (hasMomentum(g, n) ? g.tmp?.momentum_side?.[n] : undefined);
const cap = (g: Game, n: number) => g.capabilities[n];
const canPay = (g: Game, f: Ins, c: number, a: any) => !!a.free || g.resources[f] >= c;
function pay(g: Game, f: Ins, c: number, a: any): void {
  if (!a.free && c > 0) addResources(g, f, -c);
}
export function totalTerror(g: Game): number {
  let n = 0;
  for (const id of SPACE_IDS) n += g.spaces[id].terror;
  return n;
}
const nonBaseCOIN = (g: Game, id: string) => count(g, id, ...COIN_NONBASE);

// Changing the Trail value: ADSID (card 7, unshaded momentum) costs the NVA 6 Resources at any change.
export function changeTrail(g: Game, delta: number): void {
  const old = g.trail;
  setTrail(g, old + delta);
  if (g.trail !== old && momSide(g, 7) === 'unshaded') {
    addResources(g, 'NVA', -6);
    log(g, 'ADSID: NVA Resources -6.');
  }
}

function initArgs(a: any): void {
  a.done = [];
  a.cur = null;
  a.phase = 'select';
  a.pending = null;
}
const limitOf = (a: any) => Math.min(a.limited ? 1 : Infinity, a.max ?? Infinity);
const roomLeft = (a: any) => a.done.length < limitOf(a);
const openSpace = (a: any, id: string) => (!a.spaces || a.spaces.includes(id)) && !a.done.includes(id);
const nm = (id: string) => space(id).name;

function finish(g: Game, a: any): void {
  if (a.subPieces > 0) {
    const d = Math.floor(a.subPieces / 2);
    if (d > 0) { addPatronage(g, -d); log(g, `Subvert: Patronage -${d}.`); }
  }
  pop(g, { done: true, spaces: a.done });
}

function selectPrompt(a: any, p: Prompt, cands: string[], text: string): void {
  p.text(text);
  p.select(a.done);
  for (const id of cands) p.space(id, nm(id));
  p.action('done', undefined, 'Done');
}

type Cands = (g: Game, a: any) => string[];

// Back to selection, ending automatically if nothing more is possible.
function next(g: Game, a: any, cands: Cands, more?: (g: Game, a: any) => boolean): void {
  a.cur = null;
  a.phase = 'select';
  a.pending = null;
  if (!roomLeft(a) || (cands(g, a).length === 0 && !(more && more(g, a)))) finish(g, a);
}

function spaceDone(g: Game, a: any, id: string, cands: Cands, more?: (g: Game, a: any) => boolean): void {
  a.done.push(id);
  next(g, a, cands, more);
}

// ---------------------------------------------------------------- enemy removal helper state

function removable(g: Game, a: any): PieceKind[] {
  const pool: PieceKind[] = a.only ?? [...COIN_NONBASE, ...COIN_BASE];
  const nb = pool.filter((k) => !isBase(k) && count(g, a.space, k) > 0);
  if (nb.length) return nb;
  return pool.filter((k) => isBase(k) && count(g, a.space, k) > 0);
}

function removeStep(g: Game, a: any): void {
  while (a.n > 0) {
    const c = removable(g, a);
    if (c.length === 0) break;
    if (c.length > 1) return; // attacker must choose
    remove(g, a.space, c[0], 1);
    a.removed[c[0]] = (a.removed[c[0]] ?? 0) + 1;
    a.n--;
  }
  const total = Object.values(a.removed as Record<string, number>).reduce((s, n) => s + n, 0);
  if (total > 0) log(g, `${a.by} removes ${total} enemy piece(s) in ${nm(a.space)}.`);
  pop(g, { removed: a.removed });
}

registerState('ins_remove', {
  faction: (g, a) => a.by,
  enter(g, a) { a.removed = a.removed ?? {}; removeStep(g, a); },
  prompt(g, a, p) {
    p.text(`Remove ${a.n} enemy piece(s) in ${nm(a.space)}.`);
    for (const k of removable(g, a)) p.piece(a.space, k, `Remove ${PIECE_NAME[k]}`);
  },
  act(g, a, verb, arg) {
    const k = String(arg).split(':')[1] as PieceKind;
    remove(g, a.space, k, 1);
    a.removed[k] = (a.removed[k] ?? 0) + 1;
    a.n--;
    removeStep(g, a);
  },
});

function startRemove(g: Game, by: Ins, id: string, n: number, only?: PieceKind[]): void {
  push(g, 'ins_remove', { by, space: id, n, only, removed: {} });
}

// ---------------------------------------------------------------- Agitation step (Support Phase, Cadres)

export function agitateSteps(g: Game, id: string): { steps: number; shifts: number } {
  const st = g.spaces[id];
  let steps = 0, shifts = 0;
  if (g.resources.VC >= 1 && st.terror > 0) { st.terror = 0; addResources(g, 'VC', -1); steps++; }
  while (shifts < 2 && g.resources.VC >= 1 && st.terror === 0 && canHaveSupport(id) && st.support > -2) {
    shiftSupport(g, id, -1);
    addResources(g, 'VC', -1);
    shifts++; steps++;
  }
  return { steps, shifts };
}
export function agitateSpace(g: Game, id: string): number {
  if (cap(g, 116) === 'unshaded') remove(g, id, 'vc_guer_a', 2 - remove(g, id, 'vc_guer_u', 2));
  const r = agitateSteps(g, id);
  log(g, `VC Agitation in ${nm(id)} (${r.steps} Resource(s) spent).`);
  return r.steps;
}
// Cadres (116) unshaded: Terror or Agitate needs 2 VC Guerrillas in the space to remove.
export const agitateOk = (g: Game, id: string) => cap(g, 116) !== 'unshaded' || gTot(g, id, 'VC') >= 2;

// ================================================================= RALLY (3.3.1)

const rallyCost = (a: any) => (a.free ? 0 : 1);
const trailCostOf = () => 2; // costs 2 even if the Rally is free

function manyCount(g: Game, f: Ins, id: string): number {
  const b = ownBases(g, id, f);
  return f === 'VC' ? space(id).pop + b : g.trail + b;
}

function trailAllowed(g: Game, a: any, f: Ins): boolean {
  if (f !== 'NVA' || g.trail >= 4 || a.trailDone) return false;
  if (hasMomentum(g, 38)) return false;          // McNamara Line
  if (g.resources.NVA < trailCostOf()) return false;
  if (cap(g, 31) === 'unshaded' && a.done.length > 1) return false; // AAA: Rally that improves Trail selects 1 space only
  return true;
}

function rallyOpts(g: Game, a: any, f: Ins, id: string): { key: string; label: string }[] {
  const d = GK[f];
  const out: { key: string; label: string }[] = [];
  if (!canPay(g, f, rallyCost(a), a)) return out;
  const own = ownBases(g, id, f);
  if (g.available[d.pool] > 0) out.push({ key: 'guer', label: 'Place 1 Guerrilla' });
  const n = own > 0 ? manyCount(g, f, id) : 0;
  if (n > 1 && g.available[d.pool] > 0) out.push({ key: 'many', label: `Place up to ${n} Guerrillas (at Base)` });
  if (gTot(g, id, f) >= 2 && countBases(g, id) < 2 && g.available[d.bpool] > 0) {
    out.push({ key: 'base', label: 'Replace 2 Guerrillas with a Base' });
  }
  if (f === 'VC' && own > 0 && gA(g, id, f) > 0) out.push({ key: 'flip', label: 'Flip Guerrillas Underground (at Base)' });
  return out;
}

function rallyCands(g: Game, a: any): string[] {
  const lim = a.trailDone && cap(g, 31) === 'unshaded' ? 1 : limitOf(a);
  if (a.done.length >= lim) return [];
  const f = facOf(g, a);
  return SPACE_IDS.filter((id) => {
    const s = space(id);
    if (s.type === 'loc' || !openSpace(a, id)) return false;
    if (g.spaces[id].support > 0) return false;
    return rallyOpts(g, a, f, id).length > 0;
  });
}

const rallyMore = (g: Game, a: any) => trailAllowed(g, a, facOf(g, a));
const rallyNext = (g: Game, a: any) => next(g, a, rallyCands, rallyMore);

registerState('op_rally', {
  faction: (g, a) => facOf(g, a),
  enter(g, a) {
    initArgs(a);
    a.trailDone = false;
    if (rallyCands(g, a).length === 0 && !rallyMore(g, a)) { log(g, 'No legal Rally spaces.'); finish(g, a); }
  },
  prompt(g, a, p) {
    const f = facOf(g, a);
    if (a.phase === 'select') {
      p.text(`${f} Rally: select a space (${a.done.length} done).`);
      p.select(a.done);
      for (const id of rallyCands(g, a)) p.space(id, nm(id));
      if (trailAllowed(g, a, f)) p.action('trail', undefined, `Improve the Trail (${trailCostOf()} Resources${cap(g, 34) === 'shaded' ? ', 2 boxes' : ''})`);
      p.action('done', undefined, 'Done');
      return;
    }
    if (a.phase === 'agit') {
      p.text(`Cadres: Agitate in ${nm(a.cur)}?`);
      p.select([a.cur]);
      p.action('agit', 'yes', 'Agitate (VC Resources)', { space: a.cur });
      p.action('agit', 'no', 'No Agitation', { space: a.cur });
      return;
    }
    p.text(`Rally in ${nm(a.cur)}.`);
    p.select([a.cur]);
    for (const o of rallyOpts(g, a, f, a.cur)) p.action('opt', o.key, o.label, { space: a.cur });
    p.action('back', undefined, 'Choose another space');
  },
  act(g, a, verb, arg) {
    const f = facOf(g, a);
    if (a.phase === 'select') {
      if (verb === 'done') return finish(g, a);
      if (verb === 'trail') {
        pay(g, f, trailCostOf(), { free: false });
        changeTrail(g, cap(g, 34) === 'shaded' ? 2 : 1);
        a.trailDone = true;
        log(g, `NVA Rally: improves the Trail to ${g.trail}.`);
        return rallyNext(g, a);
      }
      a.cur = String(arg);
      a.phase = 'space';
      return;
    }
    if (a.phase === 'agit') {
      const id = a.cur as string;
      if (arg === 'yes') agitateSpace(g, id);
      return finish(g, a);
    }
    if (verb === 'back') { a.cur = null; a.phase = 'select'; return; }
    const id = a.cur as string;
    const d = GK[f];
    const c = rallyCost(a);
    const hadBase = ownBases(g, id, f) > 0;
    switch (arg) {
      case 'guer':
        pay(g, f, c, a);
        place(g, id, d.pool, 1);
        log(g, `${f} Rally: places a Guerrilla in ${nm(id)}.`);
        break;
      case 'many': {
        pay(g, f, c, a);
        const n = place(g, id, d.pool, manyCount(g, f, id));
        log(g, `${f} Rally: places ${n} Guerrillas in ${nm(id)}.`);
        break;
      }
      case 'base': {
        pay(g, f, c, a);
        let need = 2;
        for (const k of [d.a, d.u]) { const r = remove(g, id, k, need); need -= r; }
        place(g, id, d.bpool, 1);
        log(g, `${f} Rally: builds a Base in ${nm(id)}.`);
        break;
      }
      case 'flip':
        pay(g, f, c, a);
        flip(g, id, d.a, d.u, gA(g, id, f));
        log(g, `${f} Rally: flips Guerrillas Underground in ${nm(id)}.`);
        break;
    }
    a.done.push(id);
    // Cadres (116) shaded: VC Rally in 1 space where VC already had a Base may Agitate.
    if (f === 'VC' && hadBase && cap(g, 116) === 'shaded' && a.done.length === 1 && g.resources.VC >= 1 && agitateOk(g, id)) {
      a.phase = 'agit';
      return;
    }
    rallyNext(g, a);
  },
});

// ================================================================= MARCH (3.3.2)

const MOVERS: Record<Ins, PieceKind[]> = {
  NVA: ['nva_guer_u', 'nva_guer_a', 'nva_troops'],
  VC: ['vc_guer_u', 'vc_guer_a'],
};

// Marching pieces move only into adjacent spaces; the Trail lets NVA continue (see finishDest).
export function marchSources(_g: Game, _f: Ins, dest: string): string[] {
  return space(dest).adjacent.filter((n) => n !== dest);
}

const lockOf = (a: any, id: string, k: PieceKind): number => a.lock?.[id]?.[k] ?? 0;
const movable = (g: Game, a: any, id: string, k: PieceKind) => count(g, id, k) - lockOf(a, id, k);

function lockAdd(a: any, id: string, k: PieceKind, n: number): void {
  if (n === 0) return;
  a.lock = a.lock ?? {};
  a.lock[id] = a.lock[id] ?? {};
  a.lock[id][k] = (a.lock[id][k] ?? 0) + n;
}

// Sources the current Resources allow: with Trail 4 the NVA may leave Laos/Cambodia for free.
function allowedSources(g: Game, a: any, f: Ins, D: string): string[] {
  const all = marchSources(g, f, D);
  if (a.free || space(D).type === 'loc' || g.resources[f] >= 1) return all;
  if (f === 'NVA' && g.trail >= 4) return isLaosCamb(D) ? all : all.filter(isLaosCamb);
  return [];
}

function marchCands(g: Game, a: any): string[] {
  if (!roomLeft(a)) return [];
  const f = facOf(g, a);
  return SPACE_IDS.filter((id) => {
    if (!openSpace(a, id)) return false;
    return allowedSources(g, a, f, id).some((s) => MOVERS[f].some((k) => movable(g, a, s, k) > 0));
  });
}

function noteMoved(a: any, src: string, k: PieceKind, n: number): void {
  const c = a.cur;
  c.groups[src] = c.groups[src] ?? {};
  c.groups[src][k] = (c.groups[src][k] ?? 0) + n;
  c.count += n;
}

const ambushMax = (g: Game) => (cap(g, 101) === 'unshaded' ? 1 : 2);

// Enemy targets for an Ambush in `id`: the space itself, or (LoC) any adjacent space; Bases last is handled on removal.
function ambushTargets(g: Game, id: string): string[] {
  const out: string[] = [];
  if (countCOIN(g, id) > 0) out.push(id);
  if (space(id).type === 'loc') for (const n of space(id).adjacent) if (countCOIN(g, n) > 0) out.push(n);
  return out;
}

function ambushAllowed(g: Game, a: any, f: Ins, id: string): boolean {
  if (a.ambush === false && !a.saOnly) return false;
  if (momSide(g, 17) === 'unshaded') return false; // Claymores
  if ((a.ambushes ?? 0) >= ambushMax(g)) return false;
  if (gU(g, id, f) < 1) return false;
  return ambushTargets(g, id).length > 0;
}

function finishDest(g: Game, a: any): void {
  const f = facOf(g, a);
  const d = GK[f];
  const D = a.cur.dest as string;
  const s = space(D);
  const risky = s.type === 'loc' || g.spaces[D].support > 0;
  const coin = nonBaseCOIN(g, D);
  const thr = cap(g, 104) === 'unshaded' ? 1 : 3; // Main Force Bns
  let mu = 0, ma = 0, mt = 0, fu = 0, claymore = 0, allLC = true;
  for (const [src, kinds] of Object.entries(a.cur.groups as Record<string, Partial<Record<PieceKind, number>>>)) {
    const gu = kinds[d.u] ?? 0, ga = kinds[d.a] ?? 0, tr = kinds['nva_troops'] ?? 0;
    const total = gu + ga + tr;
    mu += gu; ma += ga; mt += tr;
    if (!isLaosCamb(src)) allLC = false;
    if (risky && gu + ga > 0 && total + coin > thr) {
      fu += gu;
      claymore++;
    }
  }
  if (fu > 0) flip(g, D, d.u, d.a, fu);
  let rem = 0;
  if (momSide(g, 17) === 'unshaded' && claymore > 0) {
    // Claymores: remove 1 Guerrilla from each Marching group that Activates.
    for (let i = 0; i < claymore; i++) rem += remove(g, D, d.a, 1);
    if (rem > 0) log(g, `Claymores remove ${rem} marching Guerrilla(s) in ${nm(D)}.`);
  }
  // Cost: 1 per Province/City moved into, 0 for LoCs; NVA with Trail 4 pays 0 into or out of Laos/Cambodia.
  let cost = a.free || s.type === 'loc' ? 0 : 1;
  if (cost === 1 && f === 'NVA' && g.trail >= 4 && (isLaosCamb(D) || allLC)) cost = 0;
  pay(g, f, cost, a);
  // The Trail: NVA groups that reached Laos/Cambodia may keep moving (not in a LimOp).
  const cont = f === 'NVA' && g.trail > 0 && !a.limited && isLaosCamb(D);
  if (!cont) {
    lockAdd(a, D, d.u, mu - fu);
    lockAdd(a, D, d.a, ma + fu - rem);
    lockAdd(a, D, 'nva_troops', mt);
  }
  log(g, `${f} March: ${a.cur.count} piece(s) into ${nm(D)}${fu > 0 ? ' (Guerrillas activated)' : ''}.`);
  a.done.push(D);
  a.cur = { dest: D, uMoved: mu - fu };
  if (a.ambush !== false && (mu - fu) > 0 && ambushAllowed(g, a, f, D)) {
    a.phase = 'ambushq';
    return;
  }
  next(g, a, marchCands);
}

// Begin an Ambush in `id` (an Underground Guerrilla is Activated; 1 enemy piece removed, no roll, no attrition).
function beginAmbush(g: Game, a: any, f: Ins, id: string, ctx: 'march' | 'attack'): void {
  const d = GK[f];
  ptFirst(g, a, f, id);
  flip(g, id, d.u, d.a, 1);
  a.ctx = ctx;
  a.ambushId = id;
  log(g, `${f} Ambushes in ${nm(id)}.`);
  const big = f === 'VC' && cap(g, 104) === 'shaded' && !a.bigUsed;
  a.ambN = big ? 2 : 1;
  if (big) a.bigUsed = true;
  const targets = ambushTargets(g, id);
  if (targets.length > 1) { a.phase = 'ambush_t'; return; }
  a.pending = { type: 'ambush', space: id };
  startRemove(g, f, targets[0], a.ambN);
}

// PT-76 (45) unshaded: in each NVA Attack space, first remove 1 NVA Troop cube.
function ptFirst(g: Game, a: any, f: Ins, id: string): void {
  if (f === 'NVA' && cap(g, 45) === 'unshaded' && count(g, id, 'nva_troops') > 0) {
    remove(g, id, 'nva_troops', 1);
    log(g, `PT-76: an NVA Troop is lost in ${nm(id)}.`);
  }
}

function applyAttrition(g: Game, a: any, pd: any, result: any): void {
  const f = facOf(g, a);
  const d = GK[f];
  const removed: Record<string, number> = result?.removed ?? {};
  if (pd.type === 'ambush') { a.ambushes = (a.ambushes ?? 0) + 1; return; } // no Attrition for Ambush
  const us = (removed['us_troops'] ?? 0) + (removed['us_base'] ?? 0);
  if (us > 0) {
    let lose = us;
    const order: PieceKind[] = pd.type === 'troops' ? ['nva_troops'] : [d.a, d.u];
    for (const k of order) if (lose > 0) lose -= remove(g, pd.space, k, lose);
    log(g, `${f} suffers Attrition (${us - lose}) in ${nm(pd.space)}.`);
  }
}

function ambushPrompt(g: Game, a: any, p: Prompt, id: string): void {
  p.text(`Ambush in ${nm(id)}: choose the space to remove an enemy piece from.`);
  p.select([id]);
  for (const t of ambushTargets(g, id)) p.space(t, nm(t));
}

registerState('op_march', {
  faction: (g, a) => facOf(g, a),
  resume(g, a, result) {
    const pd = a.pending;
    if (!pd) return;
    applyAttrition(g, a, pd, result);
    next(g, a, marchCands);
  },
  enter(g, a) {
    initArgs(a);
    a.lock = {};
    a.ambushes = 0;
    if (!a.free && isMonsoon(g)) { log(g, 'Monsoon: no March.'); return finish(g, a); }
    if (marchCands(g, a).length === 0) { log(g, 'No legal March.'); finish(g, a); }
  },
  prompt(g, a, p) {
    const f = facOf(g, a);
    if (a.phase === 'select') {
      selectPrompt(a, p, marchCands(g, a), `${f} March: select a destination (${a.done.length} done).`);
      return;
    }
    const D = a.cur.dest as string;
    if (a.phase === 'ambushq') {
      p.text(`Ambush from ${nm(D)}?`);
      p.select([D]);
      p.action('opt', 'ambush', 'Ambush (Special Activity)', { space: D });
      p.action('skip', undefined, 'No Ambush');
      return;
    }
    if (a.phase === 'ambush_t') return ambushPrompt(g, a, p, a.ambushId);
    p.text(`March into ${nm(D)}: click pieces to move (${a.cur.count} moved).`);
    p.select([D]);
    for (const s of allowedSources(g, a, f, D)) {
      let any = false;
      for (const k of MOVERS[f]) if (movable(g, a, s, k) > 0) { p.piece(s, k); any = true; }
      if (any) p.action('all', s, `Move all from ${nm(s)}`, { space: s });
    }
    if (a.cur.count > 0) p.action('done', undefined, 'Finish this destination');
    else p.action('back', undefined, 'Choose another destination');
  },
  act(g, a, verb, arg) {
    const f = facOf(g, a);
    if (a.phase === 'select') {
      if (verb === 'done') return finish(g, a);
      a.cur = { dest: String(arg), groups: {}, count: 0 };
      a.phase = 'move';
      return;
    }
    if (a.phase === 'ambush_t') {
      a.pending = { type: 'ambush', space: a.ambushId };
      return startRemove(g, f, String(arg), a.ambN);
    }
    if (a.phase === 'ambushq') {
      if (verb === 'skip') return next(g, a, marchCands);
      return beginAmbush(g, a, f, a.cur.dest, 'march');
    }
    const D = a.cur.dest as string;
    if (verb === 'back') { a.cur = null; a.phase = 'select'; return; }
    if (verb === 'done') return finishDest(g, a);
    if (verb === 'all') {
      const s = String(arg);
      for (const k of MOVERS[f]) {
        const n = movable(g, a, s, k);
        if (n > 0) { move(g, s, D, k, n); noteMoved(a, s, k, n); }
      }
      return;
    }
    const [s, k] = String(arg).split(':') as [string, PieceKind];
    move(g, s, D, k, 1);
    noteMoved(a, s, k, 1);
  },
});

// ================================================================= ATTACK (3.3.3) and AMBUSH (4.4.3 / 4.5.3)

function attackOpts(g: Game, a: any, f: Ins, id: string): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const coin = countCOIN(g, id) > 0;
  if (!a.saOnly && coin) {
    if (gTot(g, id, f) > 0) out.push({ key: 'attack', label: 'Attack with Guerrillas' });
    const per = f === 'NVA' && cap(g, 45) === 'shaded' && !a.ptUsed ? 1 : 2;
    if (f === 'NVA' && count(g, id, 'nva_troops') >= per) out.push({ key: 'troops', label: 'Attack with NVA Troops' });
  }
  if (ambushAllowed(g, a, f, id)) out.push({ key: 'ambush', label: a.saOnly ? 'Ambush' : 'Ambush (Special Activity)' });
  return out;
}

function attackCands(g: Game, a: any): string[] {
  if (!roomLeft(a)) return [];
  const f = facOf(g, a);
  const c = a.saOnly || a.free ? 0 : 1;
  return SPACE_IDS.filter((id) => {
    if (!openSpace(a, id) || !canPay(g, f, c, a)) return false;
    return attackOpts(g, a, f, id).length > 0;
  });
}

function attackResume(g: Game, a: any, result: any): void {
  const pd = a.pending;
  if (!pd) return;
  applyAttrition(g, a, pd, result);
  spaceDone(g, a, pd.space, attackCands);
}

function attackAct(g: Game, a: any, verb: string, arg: string | number | undefined): void {
  const f = facOf(g, a);
  const d = GK[f];
  if (a.phase === 'select') {
    if (verb === 'done') return finish(g, a);
    a.cur = String(arg);
    a.phase = 'mode';
    return;
  }
  if (a.phase === 'ambush_t') {
    a.pending = { type: 'ambush', space: a.ambushId };
    return startRemove(g, f, String(arg), a.ambN);
  }
  if (verb === 'back') { a.cur = null; a.phase = 'select'; return; }
  const id = a.cur as string;
  const c = a.saOnly || a.free ? 0 : 1;
  pay(g, f, c, a);
  if (arg === 'ambush') return beginAmbush(g, a, f, id, 'attack');
  ptFirst(g, a, f, id);
  if (arg === 'attack') {
    const n = gTot(g, id, f);
    flip(g, id, d.u, d.a, gU(g, id, f));
    const roll = rollDie(g);
    log(g, `${f} Attacks ${nm(id)} with ${n} Guerrilla(s): rolls ${roll}.`);
    if (roll <= n) {
      a.pending = { type: 'attack', space: id };
      return startRemove(g, f, id, 2);
    }
    return spaceDone(g, a, id, attackCands);
  }
  // NVA Troops: 1 enemy piece per 2 Troops (round down); no Guerrillas are Activated.
  const per = f === 'NVA' && cap(g, 45) === 'shaded' && !a.ptUsed ? 1 : 2; // PT-76 shaded: 1 space, 1 per Troop
  if (per === 1) a.ptUsed = true;
  const n = Math.floor(count(g, id, 'nva_troops') / per);
  log(g, `NVA Troops Attack ${nm(id)}: ${n} removal(s).`);
  if (n <= 0) return spaceDone(g, a, id, attackCands);
  a.pending = { type: 'troops', space: id };
  startRemove(g, f, id, n);
}

function attackDef(saOnly: boolean) {
  return {
    faction: (g: Game, a: any) => facOf(g, a),
    enter(g: Game, a: any) {
      initArgs(a);
      a.ambushes = 0;
      a.saOnly = saOnly;
      a.ctx = 'attack';
      if (saOnly) a.max = Math.min(a.max ?? Infinity, ambushMax(g));
      if (attackCands(g, a).length === 0) { log(g, saOnly ? 'No legal Ambush.' : 'No legal Attack.'); finish(g, a); }
    },
    prompt(g: Game, a: any, p: Prompt) {
      const f = facOf(g, a);
      const what = saOnly ? 'Ambush' : 'Attack';
      if (a.phase === 'select') {
        selectPrompt(a, p, attackCands(g, a), `${f} ${what}: select a space (${a.done.length} done).`);
        return;
      }
      if (a.phase === 'ambush_t') return ambushPrompt(g, a, p, a.ambushId);
      p.text(`${what} in ${nm(a.cur)}.`);
      p.select([a.cur]);
      for (const o of attackOpts(g, a, f, a.cur)) p.action('opt', o.key, o.label, { space: a.cur });
      p.action('back', undefined, 'Choose another space');
    },
    act: attackAct,
    resume: attackResume,
  };
}

registerState('op_attack', attackDef(false));
registerState('sa_ambush', attackDef(true));

// ================================================================= TERROR (3.3.4)

const terrorCost = (id: string) => (space(id).type === 'loc' ? 0 : 1);

function terrorCands(g: Game, a: any): string[] {
  if (!roomLeft(a)) return [];
  const f = facOf(g, a);
  return SPACE_IDS.filter((id) => {
    if (!openSpace(a, id)) return false;
    if (!(gU(g, id, f) > 0 || (f === 'NVA' && count(g, id, 'nva_troops') > 0))) return false;
    if (f === 'VC' && cap(g, 116) === 'unshaded' && gTot(g, id, 'VC') < 2) return false; // Cadres
    return canPay(g, f, terrorCost(id), a);
  });
}

registerState('op_terror', {
  faction: (g, a) => facOf(g, a),
  enter(g, a) {
    initArgs(a);
    if (terrorCands(g, a).length === 0) { log(g, 'No legal Terror spaces.'); finish(g, a); }
  },
  prompt(g, a, p) {
    selectPrompt(a, p, terrorCands(g, a), `${facOf(g, a)} Terror: select a space (${a.done.length} done).`);
  },
  act(g, a, verb, arg) {
    if (verb === 'done') return finish(g, a);
    const f = facOf(g, a);
    const id = String(arg);
    const s = space(id);
    pay(g, f, terrorCost(id), a);
    if (gU(g, id, f) > 0) flip(g, id, GK[f].u, GK[f].a, 1);
    if (f === 'VC' && cap(g, 116) === 'unshaded') remove(g, id, 'vc_guer_a', 2 - remove(g, id, 'vc_guer_u', 2));
    const st = g.spaces[id];
    if (st.terror === 0) {
      if (totalTerror(g) < TERROR_MARKER_CAP) st.terror = 1;
      if (s.type !== 'loc' && canHaveSupport(id)) {
        if (f === 'VC') shiftSupport(g, id, -1);
        else if (st.support > 0) shiftSupport(g, id, -1);
      }
    }
    log(g, `${f} Terror in ${s.name}${s.type === 'loc' ? ' (Sabotage)' : ''}.`);
    spaceDone(g, a, id, terrorCands);
  },
});

// ================================================================= INFILTRATE (4.4.1)

const nvaPieces = (g: Game, id: string) => countFaction(g, id, 'NVA');
const vcPieces = (g: Game, id: string) => countFaction(g, id, 'VC');
const infiltrateN = (g: Game, id: string) => g.trail + ownBases(g, id, 'NVA');

const VC_ALL: PieceKind[] = ['vc_guer_u', 'vc_guer_a', 'vc_base', 'vc_tunnel'];
const counterpart = (k: PieceKind): PieceKind =>
  k === 'vc_guer_u' ? 'nva_guer_u' : k === 'vc_guer_a' ? 'nva_guer_a' : k === 'vc_base' ? 'nva_base' : 'nva_tunnel';

function takeoverTargets(g: Game, id: string): PieceKind[] {
  if (nvaPieces(g, id) <= vcPieces(g, id)) return [];
  return VC_ALL.filter((k) => count(g, id, k) > 0 && g.available[k.endsWith('base') || k.endsWith('tunnel') ? 'nva_base' : 'nva_guer'] > 0);
}

function buildPossible(g: Game, id: string): boolean {
  if (ownBases(g, id, 'NVA') === 0 || g.available.nva_troops <= 0) return false;
  return infiltrateN(g, id) > 0 || gTot(g, id, 'NVA') > 0;
}

function infiltrateCands(g: Game, a: any): string[] {
  if (!roomLeft(a)) return [];
  return SPACE_IDS.filter((id) => {
    if (!openSpace(a, id)) return false;
    if (!(ownBases(g, id, 'NVA') > 0 || nvaPieces(g, id) > vcPieces(g, id))) return false;
    return buildPossible(g, id) || takeoverTargets(g, id).length > 0;
  });
}

registerState('sa_infiltrate', {
  faction: () => 'NVA',
  enter(g, a) {
    initArgs(a);
    a.faction = 'NVA';
    if (hasMomentum(g, 38)) { log(g, 'McNamara Line: no Infiltrate.'); return finish(g, a); }
    a.max = Math.min(a.max ?? Infinity, 2);
    if (momSide(g, 46) === 'unshaded') a.max = 1; // 559th Transport Grp
    a.left = 0;
    if (infiltrateCands(g, a).length === 0) { log(g, 'No legal Infiltrate spaces.'); finish(g, a); }
  },
  prompt(g, a, p) {
    if (a.phase === 'select') return selectPrompt(a, p, infiltrateCands(g, a), `Infiltrate: select a space (${a.done.length} done).`);
    const id = a.cur as string;
    p.select([id]);
    if (a.phase === 'mode') {
      p.text(`Infiltrate ${nm(id)}.`);
      if (buildPossible(g, id)) p.action('mode', 'build', `Build up: place up to ${infiltrateN(g, id)} NVA Troops`, { space: id });
      if (takeoverTargets(g, id).length > 0) p.action('mode', 'takeover', 'Erode Opposition and take over 1 VC piece', { space: id });
      p.action('back', undefined, 'Choose another space');
    } else if (a.phase === 'build') {
      p.text(`Place NVA Troops in ${nm(id)} (${a.left} left), or replace Guerrillas 1 for 1 with Troops.`);
      if (a.left > 0 && g.available.nva_troops > 0) p.action('place', 'troop', 'Place NVA Troops', { space: id });
      if (g.available.nva_troops > 0) for (const k of ['nva_guer_u', 'nva_guer_a'] as PieceKind[]) if (count(g, id, k) > 0) p.piece(id, k, `Replace ${PIECE_NAME[k]} with Troops`);
      p.action('finish', undefined, 'Finish this space');
    } else {
      p.text(`Replace 1 VC piece in ${nm(id)}.`);
      for (const k of takeoverTargets(g, id)) p.piece(id, k, `Replace ${PIECE_NAME[k]}`);
    }
  },
  act(g, a, verb, arg) {
    if (a.phase === 'select') {
      if (verb === 'done') return finish(g, a);
      a.cur = String(arg);
      a.phase = 'mode';
      return;
    }
    const id = a.cur as string;
    if (a.phase === 'mode') {
      if (verb === 'back') { a.cur = null; a.phase = 'select'; return; }
      a.acted = 0;
      if (arg === 'build') { a.phase = 'build'; a.left = infiltrateN(g, id); return; }
      // Takeover: shift Opposition 1 level toward Neutral, then replace 1 VC piece.
      if (g.spaces[id].support < 0 && canHaveSupport(id)) shiftSupport(g, id, 1);
      a.phase = 'takeover';
      return;
    }
    if (a.phase === 'build') {
      if (verb === 'finish') {
        if (a.acted > 0) { log(g, `NVA Infiltrates ${nm(id)}.`); return spaceDone(g, a, id, infiltrateCands); }
        a.phase = 'mode';
        return;
      }
      if (verb === 'place') {
        place(g, id, 'nva_troops', 1);
        a.left--;
      } else {
        const k = String(arg).split(':')[1] as PieceKind;
        remove(g, id, k, 1);
        place(g, id, 'nva_troops', 1);
      }
      a.acted++;
      return;
    }
    // takeover
    const k = String(arg).split(':')[1] as PieceKind;
    const cp = counterpart(k);
    remove(g, id, k, 1);
    if (cp === 'nva_base') place(g, id, 'nva_base', 1);
    else if (cp === 'nva_tunnel') place(g, id, 'nva_base', 1, 'nva_tunnel');
    else place(g, id, 'nva_guer', 1, cp);
    log(g, `NVA Infiltrate takes over a VC piece in ${nm(id)}.`);
    spaceDone(g, a, id, infiltrateCands);
  },
});

// ================================================================= BOMBARD (4.4.2)

function bombardCands(g: Game, a: any): string[] {
  if (!roomLeft(a)) return [];
  const lrg = cap(g, 32);
  void lrg;
  return SPACE_IDS.filter((id) => {
    if (!openSpace(a, id)) return false;
    if (count(g, id, 'us_troops', 'arvn_troops') < 1) return false;
    if (!(count(g, id, 'us_troops', 'arvn_troops') >= 3 || count(g, id, 'us_base', 'arvn_base') > 0)) return false;
    return count(g, id, 'nva_troops') >= 3 || space(id).adjacent.some((n) => count(g, n, 'nva_troops') >= 3);
  });
}

registerState('sa_bombard', {
  faction: () => 'NVA',
  enter(g, a) {
    initArgs(a);
    a.faction = 'NVA';
    a.max = Math.min(a.max ?? Infinity, 2);
    if (bombardCands(g, a).length === 0) { log(g, 'No legal Bombard targets.'); finish(g, a); }
  },
  prompt(g, a, p) { selectPrompt(a, p, bombardCands(g, a), `Bombard: select a target space (${a.done.length} done).`); },
  act(g, a, verb, arg) {
    if (verb === 'done') return finish(g, a);
    const id = String(arg);
    a.pending = { space: id };
    log(g, `NVA Bombards ${nm(id)}.`);
    startRemove(g, 'NVA', id, 1, ['us_troops', 'arvn_troops']);
  },
  resume(g, a) {
    if (!a.pending) return;
    spaceDone(g, a, a.pending.space, bombardCands);
  },
});

// ================================================================= TAX (4.5.1)

function taxCands(g: Game, a: any): string[] {
  if (!roomLeft(a)) return [];
  return SPACE_IDS.filter((id) => openSpace(a, id) && gU(g, id, 'VC') > 0 && control(g, id) !== 'COIN');
}

registerState('sa_tax', {
  faction: () => 'VC',
  enter(g, a) {
    initArgs(a);
    a.faction = 'VC';
    a.max = Math.min(a.max ?? Infinity, 4);
    if (taxCands(g, a).length === 0) { log(g, 'No legal Tax spaces.'); finish(g, a); }
  },
  prompt(g, a, p) { selectPrompt(a, p, taxCands(g, a), `Tax: select up to ${limitOf(a)} spaces (${a.done.length} done).`); },
  act(g, a, verb, arg) {
    if (verb === 'done') return finish(g, a);
    const id = String(arg);
    const s = space(id);
    flip(g, id, 'vc_guer_u', 'vc_guer_a', 1);
    const gain = s.type === 'loc' ? s.econ : 2 * s.pop;
    addResources(g, 'VC', gain);
    if (s.type !== 'loc') shiftSupport(g, id, 1); // toward Active Support
    log(g, `VC Taxes ${s.name}: +${gain} Resources.`);
    spaceDone(g, a, id, taxCands);
  },
});

// ================================================================= SUBVERT (4.5.2)

const ARVN_CUBES: PieceKind[] = ['arvn_troops', 'arvn_police'];

function subvertCands(g: Game, a: any): string[] {
  if (!roomLeft(a)) return [];
  return SPACE_IDS.filter((id) => openSpace(a, id) && gU(g, id, 'VC') > 0 && count(g, id, ...ARVN_CUBES) > 0);
}

registerState('sa_subvert', {
  faction: () => 'VC',
  enter(g, a) {
    initArgs(a);
    a.faction = 'VC';
    a.subPieces = 0;
    a.max = Math.min(a.max ?? Infinity, 2);
    if (subvertCands(g, a).length === 0) { log(g, 'No legal Subvert spaces.'); finish(g, a); }
  },
  prompt(g, a, p) {
    if (a.phase === 'select') return selectPrompt(a, p, subvertCands(g, a), `Subvert: select up to ${limitOf(a)} spaces (${a.done.length} done).`);
    const id = a.cur as string;
    p.select([id]);
    if (a.phase === 'mode') {
      p.text(`Subvert ${nm(id)}.`);
      p.action('mode', 'remove', 'Remove 2 ARVN cubes', { space: id });
      if (g.available.vc_guer > 0) p.action('mode', 'replace', 'Replace 1 ARVN cube with a VC Guerrilla', { space: id });
      p.action('back', undefined, 'Choose another space');
    } else {
      p.text(`Choose the ARVN cube to replace in ${nm(id)}.`);
      for (const k of ARVN_CUBES) if (count(g, id, k) > 0) p.piece(id, k, `Replace ${PIECE_NAME[k]}`);
    }
  },
  act(g, a, verb, arg) {
    if (a.phase === 'select') {
      if (verb === 'done') return finish(g, a);
      a.cur = String(arg);
      a.phase = 'mode';
      return;
    }
    const id = a.cur as string;
    if (a.phase === 'mode') {
      if (verb === 'back') { a.cur = null; a.phase = 'select'; return; }
      if (arg === 'remove') {
        a.pending = { space: id };
        return startRemove(g, 'VC', id, 2, ARVN_CUBES);
      }
      a.phase = 'replace';
      return;
    }
    const k = String(arg).split(':')[1] as PieceKind;
    remove(g, id, k, 1);
    place(g, id, 'vc_guer', 1);
    a.subPieces += 1;
    log(g, `VC Subverts ${nm(id)} (replaces an ARVN cube).`);
    spaceDone(g, a, id, subvertCands);
  },
  resume(g, a, result) {
    if (!a.pending) return;
    const n = Object.values((result?.removed ?? {}) as Record<string, number>).reduce((s, x) => s + x, 0);
    a.subPieces += n;
    spaceDone(g, a, a.pending.space, subvertCands);
  },
});
