// Step combinators used by the card files. Every combinator is called while a card is being defined (module
// load), so the lambdas it registers get deterministic keys and the resulting game state stays JSON.
//
// QUICK GUIDE
//   defCard(n, () => ({ u: [ ...steps ], s: [ ...steps ] }));
//   Tracks:      trail(±n) aid(±n) patronage(±n) resources('NVA'|'VC'|'ARVN', ±n)   (numbers or (g,c)=>number)
//   Markers:     cap() mom() stayEligible() makeIneligible(f)
//   Free ops:    freeOp('op_sweep', { faction: 'US', extra: { spaces: [...], max: 1 } | (g,c)=>extra | false to skip })
//   Choosing:    pick(n, where, apply)  placeIn(pool, n, o)  removeUp(kinds, n, o)  shift(n, delta, o)
//                xfer(rules, n)  (move pieces map / Available / Casualties / Out of Play; see XferRule in helpers.ts)
//                flipUp(kinds, n, mode)  either(labels, branches)  movePcs(...)
//   Sequencing:  selectInto('key', n, where) stores the chosen spaces in c.d.key for later steps;
//                eachOf(itemsFn, fn) runs fn(g, a, item) per item (each may push free ops)
//   Options common to placeIn/removeUp/shift/pick/xfer: `by` (Faction or (g,c)=>Faction) = who decides;
//   `ids: (g,c)=>string[]` restricts the candidate spaces to a list computed when the step runs.
//   Removal follows the Events rules: any piece may be removed EXCEPT Tunneled Bases (tunnels:true to allow);
//   Bases-last only when basesLast:true; air:true = Air Strike removal rules.
import type { Faction, Game, PieceKind, PoolKind } from '../../core/types';
import { hasState, log, push, rollDie } from '../../core/framework';
import { MAP, SPACE_IDS } from '../../data/map';
import {
  K, callFn, choose, eachOf as eachOfHelper, flipPieces, freeOp as freeOpHelper, movePieces, pickSpaces, placePieces, removePieces,
  setCapability, setMomentum, shiftSupportIn, track, transferPieces, pools as poolsHelper,
} from './helpers';
import type { Ctx, FlipMode, Step, XferRule } from './helpers';

export type Where = (g: Game, id: string) => boolean;
export type Num = number | ((g: Game, c: Ctx) => number);
export type By = Faction | ((g: Game, c: Ctx) => Faction);
export type Ids = (g: Game, c: Ctx) => string[];
const num = (n: Num, g: Game, c: Ctx) => (typeof n === 'function' ? n(g, c) : n);
const who = (by: By | undefined, g: Game, c: Ctx): Faction | undefined => (typeof by === 'function' ? by(g, c) : by);
// where-filter key that also honours a runtime id list (data.ids)
const wk = (w?: Where): string => K((g, a, id) => (!a.data?.ids || a.data.ids.includes(id)) && (!w || w(g, id)));
const dataOf = (o: { ids?: Ids } | undefined, g: Game, c: Ctx, extra: any = {}) => ({ ...extra, ids: o?.ids ? o.ids(g, c) : undefined });

export const cap = (): Step => (g, c) => setCapability(g, c);
export const mom = (): Step => (g, c) => setMomentum(g, c);
export const run = (fn: (g: Game, c: Ctx) => void): Step => fn;
export const nothing: Step[] = [];

export const trail = (n: Num): Step => (g, c) => track(g, 'trail', num(n, g, c));
export const aid = (n: Num): Step => (g, c) => track(g, 'aid', num(n, g, c));
export const patronage = (n: Num): Step => (g, c) => track(g, 'patronage', num(n, g, c));
export const resources = (f: 'ARVN' | 'NVA' | 'VC', n: Num): Step => (g, c) => track(g, f, num(n, g, c));

export const stayEligible = (f?: Faction): Step => (g, c) => { const x = f ?? c.faction; if (!g.next_eligible.includes(x)) g.next_eligible.push(x); g.next_ineligible = g.next_ineligible.filter((y) => y !== x); };
export const makeIneligible = (f: Faction): Step => (g) => { if (!g.next_ineligible.includes(f)) g.next_ineligible.push(f); g.next_eligible = g.next_eligible.filter((y) => y !== f); };

export function placeIn(pool: PoolKind | ((f: Faction) => PoolKind), n: Num, o: { where?: Where; ids?: Ids; per?: number; as?: PieceKind; by?: By; src?: 'available' | 'casualties' | 'out_of_play'; label?: string } = {}): Step {
  const f = wk(o.where);
  return (g, c) => placePieces(g, c, { pool: typeof pool === 'function' ? pool(c.faction) : pool, n: num(n, g, c), filter: f, per: o.per, as: o.as, by: who(o.by, g, c), src: o.src, label: o.label, data: dataOf(o, g, c) });
}

export function removeUp(kinds: PieceKind[] | ((f: Faction) => PieceKind[]), n: Num, o: {
  where?: Where; ids?: Ids; pwhere?: (g: Game, id: string, k: PieceKind) => boolean; per?: number;
  dest?: 'std' | 'available' | 'casualties' | 'out_of_play'; by?: By; basesLast?: boolean; air?: boolean; tunnels?: boolean;
  then?: (g: Game, a: any, res: { removed: number; spaces: string[] }) => void; label?: string;
} = {}): Step {
  const f = wk(o.where);
  const pf = o.pwhere ? K((g, a, id, k) => o.pwhere!(g, id, k)) : undefined;
  const th = o.then ? K((g, a, res) => o.then!(g, a, res)) : undefined;
  return (g, c) => removePieces(g, c, {
    n: num(n, g, c), kinds: typeof kinds === 'function' ? kinds(c.faction) : kinds, filter: f, pfilter: pf, per: o.per, dest: o.dest,
    by: who(o.by, g, c), basesLast: o.basesLast, air: o.air, tunnels: o.tunnels, then: th, label: o.label, data: dataOf(o, g, c),
  });
}

export function shift(n: Num, delta: number, o: { where?: Where; ids?: Ids; by?: By; label?: string } = {}): Step {
  const f = K((g, a, id) => MAP[id].type !== 'loc' && MAP[id].pop > 0 && (!a.data?.ids || a.data.ids.includes(id))
    && (delta > 0 ? g.spaces[id].support < 2 : g.spaces[id].support > -2) && (!o.where || o.where(g, id)));
  return (g, c) => shiftSupportIn(g, c, { n: num(n, g, c), delta, by: who(o.by, g, c), label: o.label, filter: f, data: dataOf(o, g, c) });
}

// Choose up to n spaces and call apply on each. apply(g, a, id): a has card/faction/by/data and can push more states.
export function pick(n: Num, where: Where | undefined, apply: (g: Game, a: any, id: string) => void, o: { by?: By; ids?: Ids; label?: string; data?: any | ((g: Game, c: Ctx) => any) } = {}): Step {
  const f = wk(where);
  const ap = K((g, a, id) => apply(g, a, id));
  return (g, c) => pickSpaces(g, c, { n: num(n, g, c), filter: f, apply: ap, by: who(o.by, g, c), label: o.label, data: dataOf(o, g, c, typeof o.data === 'function' ? o.data(g, c) : o.data) });
}

// pick + remember the chosen spaces in c.d[key] (an array) for later steps.
export function selectInto(key: string, n: Num, where: Where | undefined, o: { by?: By; ids?: Ids; label?: string } = {}): Step[] {
  return [
    pick(n, where, () => { /* selection only */ }, o),
    (g, c) => { c.d[key] = c.last?.spaces ?? []; },
  ];
}

export function movePcs(kinds: PieceKind[] | ((f: Faction) => PieceKind[]), n: Num, o: { from?: Where; to?: (g: Game, dst: string, src: string) => boolean; adjacent?: boolean; by?: By; label?: string } = {}): Step {
  const fk = wk(o.from);
  const tk = o.to ? K((g, a, dst, src) => o.to!(g, dst, src)) : wk();
  return (g, c) => movePieces(g, c, { n: num(n, g, c), kinds: typeof kinds === 'function' ? kinds(c.faction) : kinds, from: fk, to: tk, adjacent: o.adjacent, by: who(o.by, g, c), label: o.label });
}

export function poolMove(pool: PoolKind, from: 'available' | 'casualties' | 'out_of_play', to: 'available' | 'casualties' | 'out_of_play', n: Num): Step {
  return (g, c) => { poolsHelper(g, pool, from, to, num(n, g, c)); };
}

// ---- general piece transfer (map <-> Available / Casualties / Out of Play) ----
export interface XR extends Omit<XferRule, 'fromWhere' | 'toWhere' | 'toSpace'> {
  fromWhere?: Where;
  toWhere?: Where;
  toSpace?: string | ((g: Game, c: Ctx) => string | undefined | null);
  when?: (g: Game, c: Ctx) => boolean;   // rule only used when this holds (evaluated when the step runs)
}
export function xfer(rules: XR[], n: Num, o: { by?: By; label?: string } = {}): Step {
  const built = rules.map((r) => ({ ...r, fromWhere: r.fromWhere ? wk(r.fromWhere) : undefined, toWhere: r.toWhere ? wk(r.toWhere) : undefined }));
  return (g, c) => {
    const rs: XferRule[] = [];
    for (const r of built) {
      if (r.when && !r.when(g, c)) continue;
      let toSpace: string | undefined;
      if (typeof r.toSpace === 'function') {
        const v = r.toSpace(g, c);
        if (r.to === 'map' && !v) continue; // no destination chosen: rule unusable
        toSpace = v ?? undefined;
      } else toSpace = r.toSpace;
      const { when: _w, ...rr } = r;
      rs.push({ ...rr, toSpace } as XferRule);
    }
    transferPieces(g, c, { n: num(n, g, c), rules: rs, by: who(o.by, g, c), label: o.label });
  };
}
// All US / ARVN / NVA / VC pools
export const POOLS_OF: Record<Faction, PoolKind[]> = {
  US: ['us_troops', 'us_base', 'us_irreg'],
  ARVN: ['arvn_troops', 'arvn_police', 'arvn_ranger', 'arvn_base'],
  NVA: ['nva_troops', 'nva_guer', 'nva_base'],
  VC: ['vc_guer', 'vc_base'],
};
// Rules for "any of these pools" between two places (boxes or the map).
export function anyOf(pools: PoolKind[], from: XR['from'], to: XR['to'], extra: Partial<XR> = {}): XR[] {
  return pools.map((pool) => ({ pool, from, to, ...extra }));
}

// ---- flipping ----
export function flipUp(kinds: PieceKind[] | undefined, n: Num, mode: FlipMode, o: { where?: Where; ids?: Ids; by?: By; label?: string } = {}): Step {
  const f = wk(o.where);
  return (g, c) => flipPieces(g, c, { n: num(n, g, c), mode, kinds, filter: f, by: who(o.by, g, c), label: o.label, data: dataOf(o, g, c) });
}

// Grant a free Op / Special Activity. extra may return false to skip (nothing legal).
export function freeOp(state: string, o: { faction?: Faction | ((g: Game, c: Ctx) => Faction); extra?: any | ((g: Game, c: Ctx) => any) } = {}): Step {
  return (g, c) => {
    const extra = typeof o.extra === 'function' ? o.extra(g, c) : o.extra ?? {};
    const f = typeof o.faction === 'function' ? o.faction(g, c) : o.faction ?? c.faction;
    freeOpHelper(g, state, f, extra);
  };
}

// One of several branches, chosen by the executing faction (or `by`).
export function either(labels: string[], branches: Step[], o: { by?: By; text?: string } = {}): Step {
  const fn = K((g, a, i) => branches[i](g, { card: a.card, shaded: a.shaded ?? false, faction: a.faction, last: null, d: a.d ?? {} }));
  return (g, c) => choose(g, c, { opts: labels, fn, by: who(o.by, g, c), text: o.text });
}

// Choose one of several factions and remember it in c.d[key] (for later steps).
export function chooseFaction(key: string, factions: Faction[], o: { by?: By; text?: string } = {}): Step[] {
  const fn = K(() => { /* the choice comes back through c.last */ });
  return [
    (g, c) => choose(g, c, { opts: factions.map((f) => f as string), fn, by: who(o.by, g, c), text: o.text ?? 'Choose a Faction' }),
    (g, c) => { c.d[key] = factions[c.last?.choice ?? 0]; },
  ];
}

export function ifThen(cond: (g: Game, c: Ctx) => boolean, step: Step): Step {
  return (g, c) => { if (cond(g, c)) step(g, c); };
}

export function eachOf(items: (g: Game, c: Ctx) => string[], fn: (g: Game, a: any, item: string) => void, o: { by?: By } = {}): Step {
  const k = K((g, a, item) => fn(g, a, item));
  return (g, c) => eachOfHelper(g, c, { items: items(g, c), fn: k, by: who(o.by, g, c) });
}

// Pools/kinds that depend on who is executing an insurgent card.
export const insGuer = (f: Faction): PoolKind => (f === 'NVA' ? 'nva_guer' : 'vc_guer');
export const insBase = (f: Faction): PoolKind => (f === 'NVA' ? 'nva_base' : 'vc_base');

export { hasState, log, push, rollDie, callFn, SPACE_IDS };
