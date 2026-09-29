// Step combinators used by the card files. Every combinator is called while a card is being defined (module
// load), so the lambdas it registers get deterministic keys and the resulting game state stays JSON.
import type { Faction, Game, PieceKind, PoolKind } from '../../core/types';
import { hasState, log, push } from '../../core/framework';
import { MAP } from '../../data/map';
import {
  ALL, K, choose, freeOp as freeOpHelper, movePieces, pickSpaces, placePieces, removePieces, setCapability, setMomentum, shiftSupportIn, track,
  pools as poolsHelper,
} from './helpers';
import type { Ctx, Step } from './helpers';

export type Where = (g: Game, id: string) => boolean;
export type Num = number | ((g: Game, c: Ctx) => number);
const num = (n: Num, g: Game, c: Ctx) => (typeof n === 'function' ? n(g, c) : n);
const wk = (w?: Where): string => (w ? K((g, a, id) => w(g, id)) : ALL);
const who = (by: Faction | undefined, c: Ctx): Faction => by ?? c.faction;

export const cap = (): Step => (g, c) => setCapability(g, c);
export const mom = (): Step => (g, c) => setMomentum(g, c);
export const run = (fn: (g: Game, c: Ctx) => void): Step => fn;
export const nothing: Step[] = [];

export const trail = (n: Num): Step => (g, c) => track(g, 'trail', num(n, g, c));
export const aid = (n: Num): Step => (g, c) => track(g, 'aid', num(n, g, c));
export const patronage = (n: Num): Step => (g, c) => track(g, 'patronage', num(n, g, c));
export const resources = (f: 'ARVN' | 'NVA' | 'VC', n: Num): Step => (g, c) => track(g, f, num(n, g, c));

export const stayEligible = (f?: Faction): Step => (g, c) => { const x = f ?? c.faction; if (!g.next_eligible.includes(x)) g.next_eligible.push(x); };
export const makeIneligible = (f: Faction): Step => (g) => { if (!g.next_ineligible.includes(f)) g.next_ineligible.push(f); };

export function placeIn(pool: PoolKind | ((f: Faction) => PoolKind), n: Num, o: { where?: Where; per?: number; as?: PieceKind; by?: Faction; src?: 'available' | 'casualties' | 'out_of_play'; label?: string } = {}): Step {
  const f = wk(o.where);
  return (g, c) => placePieces(g, c, { pool: typeof pool === 'function' ? pool(c.faction) : pool, n: num(n, g, c), filter: f, per: o.per, as: o.as, by: o.by, src: o.src, label: o.label });
}

export function removeUp(kinds: PieceKind[] | ((f: Faction) => PieceKind[]), n: Num, o: { where?: Where; pwhere?: (g: Game, id: string, k: PieceKind) => boolean; per?: number; dest?: 'std' | 'available' | 'casualties' | 'out_of_play'; by?: Faction; basesFirst?: boolean; label?: string } = {}): Step {
  const f = wk(o.where);
  const pf = o.pwhere ? K((g, a, id, k) => o.pwhere!(g, id, k)) : undefined;
  return (g, c) => removePieces(g, c, { n: num(n, g, c), kinds: typeof kinds === 'function' ? kinds(c.faction) : kinds, filter: f, pfilter: pf, per: o.per, dest: o.dest, by: o.by, basesFirst: o.basesFirst, label: o.label });
}

export function shift(n: Num, delta: number, o: { where?: Where; by?: Faction; label?: string } = {}): Step {
  const f = K((g, a, id) => MAP[id].type !== 'loc' && MAP[id].pop > 0 && (delta > 0 ? g.spaces[id].support < 2 : g.spaces[id].support > -2) && (!o.where || o.where(g, id)));
  return (g, c) => shiftSupportIn(g, c, { n: num(n, g, c), delta, by: o.by, label: o.label, filter: f });
}

// Choose up to n spaces and call apply on each. apply(g, a, id): a has card/faction/by/data and can push more states.
export function pick(n: Num, where: Where | undefined, apply: (g: Game, a: any, id: string) => void, o: { by?: Faction; label?: string; data?: any } = {}): Step {
  const f = wk(where);
  const ap = K((g, a, id) => apply(g, a, id));
  return (g, c) => pickSpaces(g, c, { n: num(n, g, c), filter: f, apply: ap, by: o.by, label: o.label, data: o.data });
}

export function movePcs(kinds: PieceKind[] | ((f: Faction) => PieceKind[]), n: Num, o: { from?: Where; to?: (g: Game, dst: string, src: string) => boolean; adjacent?: boolean; by?: Faction; label?: string } = {}): Step {
  const fk = wk(o.from);
  const tk = o.to ? K((g, a, dst, src) => o.to!(g, dst, src)) : ALL;
  return (g, c) => movePieces(g, c, { n: num(n, g, c), kinds: typeof kinds === 'function' ? kinds(c.faction) : kinds, from: fk, to: tk, adjacent: o.adjacent, by: o.by, label: o.label });
}

export function poolMove(pool: PoolKind, from: 'available' | 'casualties' | 'out_of_play', to: 'available' | 'casualties' | 'out_of_play', n: Num): Step {
  return (g, c) => { poolsHelper(g, pool, from, to, num(n, g, c)); };
}

// Grant a free Op / Special Activity.
export function freeOp(state: string, o: { faction?: Faction; extra?: any | ((g: Game, c: Ctx) => any) } = {}): Step {
  return (g, c) => {
    const extra = typeof o.extra === 'function' ? o.extra(g, c) : o.extra ?? {};
    freeOpHelper(g, state, o.faction ?? c.faction, extra);
  };
}

// One of several branches, chosen by the executing faction (or `by`).
export function either(labels: string[], branches: Step[], o: { by?: Faction; text?: string } = {}): Step {
  const fn = K((g, a, i) => branches[i](g, { card: a.card, shaded: a.shaded ?? false, faction: a.faction, last: null, d: {} }));
  return (g, c) => choose(g, c, { opts: labels, fn, by: o.by, text: o.text });
}

export function ifThen(cond: (g: Game, c: Ctx) => boolean, step: Step): Step {
  return (g, c) => { if (cond(g, c)) step(g, c); };
}

export { hasState, log, push };

// Pools/kinds that depend on who is executing an insurgent card.
export const insGuer = (f: Faction): PoolKind => (f === 'NVA' ? 'nva_guer' : 'vc_guer');
export const insBase = (f: Faction): PoolKind => (f === 'NVA' ? 'nva_base' : 'vc_base');
