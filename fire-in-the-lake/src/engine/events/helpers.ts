// Reusable event machinery.
//
// USAGE GUIDE (see also dsl.ts, which wraps these in one-liner Step combinators):
//   defCard(n, () => ({ u: [step, ...], s: [step, ...] }));      // (the 4-arg form with text strings still works)
//   A Step is (g, c) => void, c = {card, shaded, faction, last, d}. c.last is what the previous helper state
//   popped with; c.d is scratch that persists across the steps of one event (use it to remember a chosen space).
//   Helper states (all take `by` = who decides, default the executing faction; all always offer 'done'):
//     ev_spaces   choose up to n spaces, call an apply fn on each (pop {spaces, touched})
//     ev_place    place n pieces of one pool one at a time (respects stacking)
//     ev_remove   remove n pieces one at a time. Options: kinds, filter, pfilter, dest, per, basesLast, air, tunnels, then
//                 Events may remove any piece EXCEPT Tunneled Bases (unless tunnels:true). air:true = Air Strike rules
//                 (NVA Troops first, Active Guerrillas only, Bases only when no other Insurgents remain).
//     ev_transfer general "move pieces between map / Available / Casualties / Out of Play" (rules list)
//     ev_flip     flip Guerrillas/Irregulars/Rangers Active<->Underground or Bases Tunneled<->not
//     ev_move     move pieces between map spaces (optionally to adjacent)
//     ev_choose   pick one of several labelled options
//     ev_each     run a fn once per item (used to sequence free ops)
//   Lambdas cannot live in game state: register them with K(fn) while a card is being defined (defCard's build
//   function runs at module load) and pass the returned string key.
//
// A card side is a list of Steps. The 'event' state runs the steps in order; a step may push helper
// states (ev_spaces, ev_place, ev_remove, ev_move, ev_choose, or a free Op/SA) and the event resumes with the
// next step when they pop. Everything that lives in game state is JSON: helper states refer to behaviour by
// string key. Keys are minted at module load by defCard()'s R() (`c<card>.<n>`) or regFn().
import type { Faction, Game, PieceKind, PoolKind } from '../../core/types';
import { hasState, log, pop, push, registerState, rollDie, top } from '../../core/framework';
import { MAP, SPACE_IDS } from '../../data/map';
import { CARD } from '../../data/cards';
import {
  BASES, FACTION_OF, FACTION_PIECES, PIECE_NAME, POOL_OF, PLACE_AS, flip as flipPiece, addAid, addPatronage, addResources, count, countBases, countFaction,
  isBase, movePool, move as movePiece, place, removeTo, remove as removePiece, shiftSupport as shiftSup, setSupport,
  canHaveSupport,
} from '../../core/pieces';

export type Fn = (g: Game, a: any, x?: any, y?: any) => any;
const FN: Record<string, Fn> = {};
export function regFn(key: string, fn: Fn): string {
  FN[key] = fn;
  return key;
}
export function callFn(key: string | undefined, g: Game, a: any, x?: any, y?: any): any {
  if (!key) return true;
  const f = FN[key];
  if (!f) throw new Error(`Unknown event fn ${key}`);
  return f(g, a, x, y);
}

export interface Ctx {
  card: number;
  shaded: boolean;
  faction: Faction;
  last: any;   // result of the last helper state that popped
  d: any;      // mutable scratch that persists across steps of this event
}
export type Step = (g: Game, c: Ctx) => void;
export interface CardImpl {
  u: Step[];
  s: Step[];
  // optional cheap "is there any effect" override; if absent a dry run is used
  uOk?: (g: Game) => boolean;
  sOk?: (g: Game) => boolean;
}
export const IMPL: Record<number, CardImpl> = {};

// Card text lives in src/data/cards.ts; TEXT is a read-only view of it kept for older callers.
export const TEXT: Record<number, { u: string; s: string }> = new Proxy({} as Record<number, { u: string; s: string }>, {
  get: (_t, k) => { const c = CARD[Number(k)]; return c ? { u: c.unshaded, s: c.shaded } : undefined; },
  has: (_t, k) => !!CARD[Number(k)],
});
export const CUR = { card: 0, n: 0 };
// Register a lambda under a deterministic key while a card definition is being built (at module load).
export function K(fn: Fn): string {
  return regFn(`c${CUR.card}.${CUR.n++}`, fn);
}
export function defCard(n: number, build: () => CardImpl): void;
export function defCard(n: number, u: string, s: string, build: () => CardImpl): void;
export function defCard(n: number, ...rest: any[]): void {
  const build = rest[rest.length - 1] as () => CardImpl;
  CUR.card = n;
  CUR.n = 0;
  IMPL[n] = build();
}

export function cardTitle(n: number): string {
  return CARD[n]?.title ?? `Card ${n}`;
}

// ------------------------------------------------------------------ small utilities

export const ALL = regFn('all', () => true);
export const sp = (id: string) => MAP[id];
export const inSV = (id: string) => MAP[id].country === 'south_vietnam';
export const isLoc = (id: string) => MAP[id].type === 'loc';
export const isCity = (id: string) => MAP[id].type === 'city';
export const isProv = (id: string) => MAP[id].type === 'province';
export const isPop = (id: string) => MAP[id].pop > 0;
export const inOutside = (id: string) => MAP[id].country !== 'south_vietnam';
export const inLC = (id: string) => MAP[id].country === 'laos' || MAP[id].country === 'cambodia';
export const inLaos = (id: string) => MAP[id].country === 'laos';
export const inCambodia = (id: string) => MAP[id].country === 'cambodia';
export const inNV = (id: string) => MAP[id].country === 'north_vietnam';
export const support = (g: Game, id: string) => g.spaces[id].support;
export const pieceKinds = (f: Faction) => FACTION_PIECES[f];
export const nonBase = (f: Faction) => FACTION_PIECES[f].filter((k) => !isBase(k));
export const ALL_KINDS = Object.keys(PIECE_NAME) as PieceKind[];
export const POOLS: Record<Faction, PoolKind[]> = {
  US: ['us_troops', 'us_base', 'us_irreg'],
  ARVN: ['arvn_troops', 'arvn_police', 'arvn_ranger', 'arvn_base'],
  NVA: ['nva_troops', 'nva_guer', 'nva_base'],
  VC: ['vc_guer', 'vc_base'],
};
export const INS_KINDS: PieceKind[] = [...FACTION_PIECES.NVA, ...FACTION_PIECES.VC];
export const COIN_KINDS: PieceKind[] = [...FACTION_PIECES.US, ...FACTION_PIECES.ARVN];
export const GUER_KINDS: PieceKind[] = ['nva_guer_u', 'nva_guer_a', 'vc_guer_u', 'vc_guer_a'];
export const ENEMY_OF = (f: Faction): PieceKind[] =>
  f === 'US' || f === 'ARVN' ? INS_KINDS : f === 'NVA' ? [...COIN_KINDS, ...FACTION_PIECES.VC] : [...COIN_KINDS, ...FACTION_PIECES.NVA];

export function spacesWhere(g: Game, pred: (id: string) => boolean): string[] {
  return SPACE_IDS.filter(pred);
}
export function countIn(g: Game, id: string, kinds: PieceKind[]): number {
  return count(g, id, ...kinds);
}
export function totalOnMap(g: Game, kinds: PieceKind[]): number {
  let n = 0;
  for (const id of SPACE_IDS) n += count(g, id, ...kinds);
  return n;
}

export function ensure<T>(arr: T[], v: T): void {
  if (!arr.includes(v)) arr.push(v);
}
export function setCapability(g: Game, c: Ctx): void {
  g.capabilities[c.card] = c.shaded ? 'shaded' : 'unshaded';
  log(g, `${cardTitle(c.card)}: ${c.shaded ? 'shaded' : 'unshaded'} capability in effect.`);
}
export function setMomentum(g: Game, c: Ctx): void {
  g.tmp = g.tmp ?? {};
  ensure(g.momentum, c.card);
  g.tmp.momentum_side = { ...(g.tmp.momentum_side ?? {}), [c.card]: c.shaded ? 'shaded' : 'unshaded' };
  log(g, `${cardTitle(c.card)}: momentum until Coup.`);
}
export function stayEligible(g: Game, f: Faction): void {
  ensure(g.next_eligible, f);
}
export function makeIneligible(g: Game, f: Faction): void {
  ensure(g.next_ineligible, f);
}
// Change the Trail by delta (clamped 0-4). Momentum ADSID (7, unshaded) costs NVA 6 Resources at any Trail change.
export function changeTrail(g: Game, delta: number): number {
  const before = g.trail;
  g.trail = Math.max(0, Math.min(4, before + delta));
  const d = g.trail - before;
  if (d !== 0) {
    log(g, `Trail ${d > 0 ? 'improves' : 'degrades'} to ${g.trail}.`);
    if (g.momentum.includes(7)) { addResources(g, 'NVA', -6); log(g, 'ADSID: NVA Resources -6.'); }
  }
  return d;
}
export function setTrailTo(g: Game, v: number): number { return changeTrail(g, v - g.trail); }
export function track(g: Game, what: 'aid' | 'patronage' | 'trail' | 'ARVN' | 'NVA' | 'VC', n: number): void {
  if (what === 'aid') addAid(g, n);
  else if (what === 'patronage') addPatronage(g, n);
  else if (what === 'trail') changeTrail(g, n);
  else addResources(g, what, n);
}
export function momentumSide(g: Game, id: number): 'unshaded' | 'shaded' | undefined {
  return g.momentum.includes(id) ? g.tmp?.momentum_side?.[id] : undefined;
}
// Would placing/moving a piece of this kind into this space violate stacking (1.4.2)?
export function canHold(g: Game, id: string, k: PieceKind): boolean {
  const m = MAP[id];
  if (isBase(k)) return m.type !== 'loc' && countBases(g, id) < 2;
  if (m.country === 'north_vietnam' && FACTION_OF[k] !== 'NVA' && FACTION_OF[k] !== 'VC') return false;
  return true;
}
export const KINDS_OF_POOL: Record<PoolKind, PieceKind[]> = (() => {
  const out = {} as Record<PoolKind, PieceKind[]>;
  for (const k of Object.keys(POOL_OF) as PieceKind[]) (out[POOL_OF[k]] ??= []).push(k);
  return out;
})();
export const isTunnel = (k: PieceKind) => k === 'nva_tunnel' || k === 'vc_tunnel';
export function effAid(g: Game): number { return g.aid; }

// Pool -> pool shuffles ("Out of Play to Available", ...). Returns number moved.
export function pools(g: Game, pool: PoolKind, from: 'available' | 'casualties' | 'out_of_play', to: 'available' | 'casualties' | 'out_of_play', n: number): number {
  return movePool(g, pool, from, to, n);
}

// Free op / special activity. Silently skips if that state is not registered yet.
export function freeOp(g: Game, state: string, faction: Faction, extra: any = {}): void {
  if (!hasState(state)) { log(g, `(free ${state} not available)`); return; }
  if (extra === false || extra === null) return; // nothing legal to do
  push(g, state, { faction, free: true, ...extra });
}

// ------------------------------------------------------------------ the 'event' state

function ctxOf(a: any): Ctx {
  return { card: a.card, shaded: a.shaded, faction: a.faction, last: a.last, d: a.d };
}

function run(g: Game, a: any): void {
  const impl = IMPL[a.card];
  const steps = impl ? (a.shaded ? impl.s : impl.u) : [];
  a.busy = true;
  try {
    for (;;) {
      if (top(g)?.args !== a) return;
      if (a.i >= steps.length) { a.busy = false; pop(g, { done: true }); return; }
      const step = steps[a.i++];
      step(g, ctxOf(a));
    }
  } finally {
    a.busy = false;
  }
}

registerState('event', {
  faction: (g, a) => a.faction,
  enter(g, a) {
    a.i = 0;
    a.d = {};
    a.last = null;
    log(g, `${a.faction} plays event ${cardTitle(a.card)} (${a.shaded ? 'shaded' : 'unshaded'}).`);
    run(g, a);
  },
  prompt(g, a, p) {
    p.text('Event in progress');
    p.action('done', undefined, 'Continue');
  },
  act(g, a) {
    run(g, a);
  },
  resume(g, a, result) {
    a.last = result ?? null;
    if (!a.busy) run(g, a);
  },
});

// ------------------------------------------------------------------ helper: choose spaces and apply

export interface PickOpts {
  by?: Faction;
  n: number;
  filter?: string;          // fn key (g, a, spaceId) => boolean
  apply?: string;           // fn key (g, a, spaceId)
  data?: any;
  label?: string;
}
export function pickSpaces(g: Game, c: { card: number; faction: Faction }, o: PickOpts): void {
  push(g, 'ev_spaces', { card: c.card, faction: c.faction, by: o.by ?? c.faction, n: o.n, filter: o.filter ?? ALL, apply: o.apply, data: o.data ?? {}, label: o.label ?? '', chosen: [], touched: [] });
}
function spacesCands(g: Game, a: any): string[] {
  return SPACE_IDS.filter((id) => !a.chosen.includes(id) && callFn(a.filter, g, a, id));
}
function spacesSettle(g: Game, a: any): void {
  if (top(g)?.args !== a) return;
  if (a.chosen.length >= a.n || spacesCands(g, a).length === 0) pop(g, { spaces: a.chosen, touched: a.touched });
}
registerState('ev_spaces', {
  faction: (g, a) => a.by,
  enter(g, a) { spacesSettle(g, a); },
  prompt(g, a, p) {
    p.text(`${cardTitle(a.card)}: ${a.label || 'choose a space'} (${a.chosen.length}/${a.n})`);
    for (const id of spacesCands(g, a)) p.space(id, MAP[id].name);
    p.select(a.chosen);
    p.action('done', undefined, 'Done');
  },
  act(g, a, verb, arg) {
    if (verb === 'done') { pop(g, { spaces: a.chosen, touched: a.touched }); return; }
    a.chosen.push(arg as string);
    a.busy = true;
    if (a.apply) callFn(a.apply, g, a, arg as string);
    a.busy = false;
    spacesSettle(g, a);
  },
  resume(g, a, result) {
    for (const id of result?.spaces ?? []) ensure(a.touched, id);
    if (!a.busy) spacesSettle(g, a);
  },
});

// Shift support in up to n spaces (delta > 0 toward Support, < 0 toward Opposition).
export function shiftSupportIn(g: Game, c: { card: number; faction: Faction }, o: { n: number; delta: number; by?: Faction; label?: string; filter?: string; data?: any }): void {
  push(g, 'ev_spaces', { card: c.card, faction: c.faction, by: o.by ?? c.faction, n: o.n, filter: o.filter ?? 'shift.filter', apply: 'shift.apply', data: { ...(o.data ?? {}), delta: o.delta }, label: o.label ?? (o.delta > 0 ? 'shift toward Support' : 'shift toward Opposition'), chosen: [], touched: [] });
}
regFn('shift.filter', (g, a, id) => canHaveSupport(id) && (!a.data.ids || a.data.ids.includes(id)) && (a.data.delta > 0 ? g.spaces[id].support < 2 : g.spaces[id].support > -2));
regFn('shift.apply', (g, a, id) => {
  shiftSup(g, id, a.data.delta);
  log(g, `Support shifted ${a.data.delta > 0 ? '+' : ''}${a.data.delta} in ${MAP[id].name}.`);
});

// ------------------------------------------------------------------ helper: place pieces

export interface PlaceOpts {
  by?: Faction;
  pool: PoolKind;
  n: number;
  filter?: string;
  per?: number;                 // max pieces per space
  as?: PieceKind;
  src?: 'available' | 'casualties' | 'out_of_play';
  data?: any;
  label?: string;
}
export function placePieces(g: Game, c: { card: number; faction: Faction }, o: PlaceOpts): void {
  push(g, 'ev_place', { card: c.card, faction: c.faction, by: o.by ?? c.faction, pool: o.pool, n: o.n, filter: o.filter ?? ALL, per: o.per ?? 0, as: o.as, src: o.src ?? 'available', data: o.data ?? {}, label: o.label ?? '', placed: 0, counts: {} });
}
function placeCands(g: Game, a: any): string[] {
  if (a.placed >= a.n || g[a.src as 'available'][a.pool as PoolKind] <= 0) return [];
  const k = (a.as ?? PLACE_AS[a.pool as PoolKind]) as PieceKind;
  return SPACE_IDS.filter((id) => (!a.per || (a.counts[id] ?? 0) < a.per) && canHold(g, id, k) && callFn(a.filter, g, a, id));
}
function placeSettle(g: Game, a: any): void {
  if (top(g)?.args !== a) return;
  if (placeCands(g, a).length === 0) pop(g, { placed: a.placed });
}
registerState('ev_place', {
  faction: (g, a) => a.by,
  enter(g, a) { placeSettle(g, a); },
  prompt(g, a, p) {
    p.text(`${cardTitle(a.card)}: ${a.label || `place ${a.pool}`} (${a.placed}/${a.n})`);
    for (const id of placeCands(g, a)) p.space(id, MAP[id].name);
    p.action('done', undefined, 'Done');
  },
  act(g, a, verb, arg) {
    if (verb === 'done') { pop(g, { placed: a.placed }); return; }
    const id = arg as string;
    if (a.src !== 'available') movePool(g, a.pool, a.src, 'available', 1);
    const m = place(g, id, a.pool, 1, a.as);
    if (m === 0 && a.src !== 'available') movePool(g, a.pool, 'available', a.src, 1);
    a.placed += m;
    a.counts[id] = (a.counts[id] ?? 0) + m;
    if (m > 0) log(g, `Placed ${a.as ? PIECE_NAME[a.as as PieceKind] : a.pool} in ${MAP[id].name}.`);
    placeSettle(g, a);
  },
  resume(g, a) { placeSettle(g, a); },
});

// ------------------------------------------------------------------ helper: remove pieces

export interface RemoveOpts {
  by?: Faction;
  n: number;
  kinds: PieceKind[];
  filter?: string;                                  // space filter
  pfilter?: string;                                 // (g, a, spaceId, kind) => boolean
  dest?: 'std' | 'available' | 'casualties' | 'out_of_play';
  per?: number;                                     // max per space
  basesLast?: boolean;                              // a Base is only removable once its Faction has no other pieces there
  basesFirst?: boolean;                             // (ignored; kept for old callers - events have no Bases-last rule)
  air?: boolean;                                    // Air Strike removal rules (4.2.3)
  tunnels?: boolean;                                // allow removing Tunneled Bases (only when the card says so)
  then?: string;                                    // fn key (g, a, {removed, spaces}) run synchronously when finished
  data?: any;
  label?: string;
}
export function removePieces(g: Game, c: { card: number; faction: Faction }, o: RemoveOpts): void {
  push(g, 'ev_remove', { card: c.card, faction: c.faction, by: o.by ?? c.faction, n: o.n, kinds: o.kinds, filter: o.filter ?? ALL, pfilter: o.pfilter, dest: o.dest ?? 'std', per: o.per ?? 0, basesLast: !!o.basesLast, air: !!o.air, tunnels: !!o.tunnels, then: o.then, data: o.data ?? {}, label: o.label ?? '', removed: 0, counts: {}, spaces: [] });
}
const AIR_KINDS: PieceKind[] = ['nva_troops', 'nva_guer_a', 'vc_guer_a'];
function removeCands(g: Game, a: any): [string, PieceKind][] {
  const out: [string, PieceKind][] = [];
  if (a.removed >= a.n) return out;
  for (const id of SPACE_IDS) {
    if (a.per && (a.counts[id] ?? 0) >= a.per) continue;
    if (!callFn(a.filter, g, a, id)) continue;
    let airPhase: 'troops' | 'guer' | 'base' | null = null;
    if (a.air) {
      if (count(g, id, 'nva_troops') > 0) airPhase = 'troops';
      else if (count(g, id, 'nva_guer_a', 'vc_guer_a') > 0) airPhase = 'guer';
      else if (count(g, id, 'nva_guer_u', 'vc_guer_u') === 0) airPhase = 'base';
      else continue;
    }
    for (const k of a.kinds as PieceKind[]) {
      if (count(g, id, k) <= 0) continue;
      if (isTunnel(k) && !a.tunnels) continue;
      if (a.air) {
        if (airPhase === 'troops' && k !== 'nva_troops') continue;
        if (airPhase === 'guer' && k !== 'nva_guer_a' && k !== 'vc_guer_a') continue;
        if (airPhase === 'base' && !isBase(k)) continue;
      }
      if (a.basesLast && isBase(k)) {
        const f = FACTION_OF[k];
        if (FACTION_PIECES[f].some((k2) => !isBase(k2) && count(g, id, k2) > 0)) continue;
      }
      if (a.pfilter && !callFn(a.pfilter, g, a, id, k)) continue;
      out.push([id, k]);
    }
  }
  return out;
}
function removeEnd(g: Game, a: any): void {
  const res = { removed: a.removed, spaces: a.spaces };
  if (a.then) callFn(a.then, g, a, res);
  pop(g, res);
}
function removeSettle(g: Game, a: any): void {
  if (top(g)?.args !== a) return;
  if (removeCands(g, a).length === 0) removeEnd(g, a);
}
export function doRemove(g: Game, id: string, k: PieceKind, dest: string = 'std', n = 1): number {
  if (dest === 'std') return removePiece(g, id, k, n);
  return removeTo(g, id, k, n, dest as 'available');
}
registerState('ev_remove', {
  faction: (g, a) => a.by,
  enter(g, a) { removeSettle(g, a); },
  prompt(g, a, p) {
    p.text(`${cardTitle(a.card)}: ${a.label || 'remove pieces'} (${a.removed}/${a.n})`);
    for (const [id, k] of removeCands(g, a)) p.piece(id, k, `${PIECE_NAME[k]} in ${MAP[id].name}`);
    p.action('done', undefined, 'Done');
  },
  act(g, a, verb, arg) {
    if (verb === 'done') { removeEnd(g, a); return; }
    const [id, k] = (arg as string).split(':') as [string, PieceKind];
    const m = doRemove(g, id, k, a.dest);
    a.removed += m;
    a.counts[id] = (a.counts[id] ?? 0) + m;
    if (m > 0) { ensure(a.spaces, id); log(g, `Removed ${PIECE_NAME[k]} from ${MAP[id].name}.`); }
    removeSettle(g, a);
  },
  resume(g, a) { removeSettle(g, a); },
});

// ------------------------------------------------------------------ helper: move pieces

export interface MoveOpts {
  by?: Faction;
  n: number;
  kinds: PieceKind[];
  from?: string;               // fn key (g,a,id) => boolean : source spaces
  to?: string;                 // fn key (g,a,dst,src) => boolean : legal destinations
  adjacent?: boolean;          // destination must be adjacent to source
  data?: any;
  label?: string;
}
export function movePieces(g: Game, c: { card: number; faction: Faction }, o: MoveOpts): void {
  push(g, 'ev_move', { card: c.card, faction: c.faction, by: o.by ?? c.faction, n: o.n, kinds: o.kinds, from: o.from ?? ALL, to: o.to ?? ALL, adjacent: !!o.adjacent, data: o.data ?? {}, label: o.label ?? '', moved: 0, sel: null });
}
function moveDsts(g: Game, a: any, src: string): string[] {
  return SPACE_IDS.filter((id) => id !== src && (!a.adjacent || MAP[src].adjacent.includes(id)) && callFn(a.to, g, a, id, src));
}
function moveSrcs(g: Game, a: any): [string, PieceKind][] {
  const out: [string, PieceKind][] = [];
  if (a.moved >= a.n) return out;
  for (const id of SPACE_IDS) {
    if (!callFn(a.from, g, a, id)) continue;
    for (const k of a.kinds as PieceKind[]) {
      if (count(g, id, k) > 0 && moveDsts(g, a, id).length > 0) out.push([id, k]);
    }
  }
  return out;
}
registerState('ev_move', {
  faction: (g, a) => a.by,
  enter(g, a) { if (moveSrcs(g, a).length === 0) pop(g, { moved: 0 }); },
  prompt(g, a, p) {
    if (!a.sel) {
      p.text(`${cardTitle(a.card)}: ${a.label || 'choose a piece to move'} (${a.moved}/${a.n})`);
      for (const [id, k] of moveSrcs(g, a)) p.piece(id, k, `${PIECE_NAME[k]} in ${MAP[id].name}`);
    } else {
      p.text(`${cardTitle(a.card)}: choose destination`);
      for (const id of moveDsts(g, a, a.sel[0])) p.space(id, MAP[id].name);
      p.action('cancel', undefined, 'Cancel');
    }
    p.action('done', undefined, 'Done');
  },
  act(g, a, verb, arg) {
    if (verb === 'done') { pop(g, { moved: a.moved }); return; }
    if (verb === 'cancel') { a.sel = null; return; }
    if (verb === 'piece') { a.sel = (arg as string).split(':'); return; }
    const [from, k] = a.sel as [string, PieceKind];
    a.sel = null;
    a.moved += movePiece(g, from, arg as string, k, 1);
    log(g, `Moved ${PIECE_NAME[k]} from ${MAP[from].name} to ${MAP[arg as string].name}.`);
    if (a.moved >= a.n || moveSrcs(g, a).length === 0) pop(g, { moved: a.moved });
  },
});

// ------------------------------------------------------------------ helper: choose an option

export function choose(g: Game, c: { card: number; faction: Faction }, o: { by?: Faction; opts: string[]; fn: string; data?: any; text?: string }): void {
  push(g, 'ev_choose', { card: c.card, faction: c.faction, by: o.by ?? c.faction, opts: o.opts, fn: o.fn, data: o.data ?? {}, text: o.text ?? '' });
}
registerState('ev_choose', {
  faction: (g, a) => a.by,
  enter(g, a) { if (a.opts.length === 0) pop(g, { choice: -1 }); },
  prompt(g, a, p) {
    p.text(`${cardTitle(a.card)}: ${a.text || 'choose'}`);
    (a.opts as string[]).forEach((o, i) => p.action('choose', i, o));
  },
  act(g, a, verb, arg) {
    const frame = top(g)!;
    a.busy = true;
    a.choice = arg;
    callFn(a.fn, g, a, arg as number);
    a.busy = false;
    if (top(g) === frame) pop(g, { choice: arg });
  },
  resume(g, a) { if (!a.busy && top(g)?.args === a) pop(g, { choice: a.choice ?? -1 }); },
});

// ------------------------------------------------------------------ helper: transfer pieces (general)

export type Box = 'available' | 'casualties' | 'out_of_play';
export interface XferRule {
  pool: PoolKind;
  from: Box | 'map';
  to: Box | 'map';
  kinds?: PieceKind[];        // map source: which piece states (default: every state of the pool; Tunneled Bases excluded unless tunnels)
  fromWhere?: string;         // fn key (g, a, spaceId) for map sources
  toWhere?: string;           // fn key (g, a, spaceId) for map destinations
  toSpace?: string;           // fixed map destination
  max?: number;               // at most this many pieces through this rule
  asKind?: PieceKind;         // state a piece takes when it is placed on the map
  tunnels?: boolean;
  label?: string;
}
export function transferPieces(g: Game, c: { card: number; faction: Faction }, o: { by?: Faction; n: number; rules: XferRule[]; label?: string; data?: any }): void {
  push(g, 'ev_transfer', { card: c.card, faction: c.faction, by: o.by ?? c.faction, n: o.n, rules: o.rules, label: o.label ?? '', data: o.data ?? {}, moved: 0, used: o.rules.map(() => 0), sel: null, spaces: [] });
}
function xferPlaceKind(rule: XferRule, srcKind?: PieceKind): PieceKind {
  return srcKind ?? rule.asKind ?? PLACE_AS[rule.pool];
}
function xferDests(g: Game, a: any, rule: XferRule, src: string | null, kind?: PieceKind): string[] {
  const k = xferPlaceKind(rule, kind);
  if (rule.toSpace) return canHold(g, rule.toSpace, k) && rule.toSpace !== src ? [rule.toSpace] : [];
  return SPACE_IDS.filter((id) => id !== src && canHold(g, id, k) && callFn(rule.toWhere, g, a, id));
}
interface XOpt { ri: number; src: string | null; kind?: PieceKind }
function xferOpts(g: Game, a: any): XOpt[] {
  const out: XOpt[] = [];
  if (a.moved >= a.n) return out;
  (a.rules as XferRule[]).forEach((rule, ri) => {
    if (rule.max != null && a.used[ri] >= rule.max) return;
    if (rule.from === 'map') {
      for (const id of SPACE_IDS) {
        if (!callFn(rule.fromWhere, g, a, id)) continue;
        for (const k of rule.kinds ?? KINDS_OF_POOL[rule.pool]) {
          if (count(g, id, k) <= 0 || (isTunnel(k) && !rule.tunnels)) continue;
          if (rule.to === 'map' && xferDests(g, a, rule, id, k).length === 0) continue;
          out.push({ ri, src: id, kind: k });
        }
      }
    } else {
      if (g[rule.from][rule.pool] <= 0) return;
      if (rule.to === 'map' && xferDests(g, a, rule, null).length === 0) return;
      out.push({ ri, src: null });
    }
  });
  return out;
}
const BOX_NAME: Record<string, string> = { available: 'Available', casualties: 'Casualties', out_of_play: 'Out of Play', map: 'the map' };
function xferLabel(a: any, o: XOpt): string {
  const r = a.rules[o.ri] as XferRule;
  if (r.label) return `${r.label}${o.src ? ` (${MAP[o.src].name})` : ''}`;
  const what = o.kind ? PIECE_NAME[o.kind] : r.pool;
  return `${what}: ${o.src ? MAP[o.src].name : BOX_NAME[r.from]} -> ${BOX_NAME[r.to]}`;
}
function xferSettle(g: Game, a: any): void {
  if (top(g)?.args !== a) return;
  if (a.sel) return;
  if (xferOpts(g, a).length === 0) pop(g, { moved: a.moved, spaces: a.spaces });
}
function xferExec(g: Game, a: any, ri: number, src: string | null, kind: PieceKind | undefined, dst: string | null): void {
  const r = a.rules[ri] as XferRule;
  let ok = 0;
  if (r.from === 'map' && r.to === 'map') ok = movePiece(g, src!, dst!, kind!, 1);
  else if (r.from === 'map') ok = removeTo(g, src!, kind!, 1, r.to as Box);
  else if (r.to === 'map') {
    if (r.from !== 'available') movePool(g, r.pool, r.from as Box, 'available', 1);
    ok = place(g, dst!, r.pool, 1, r.asKind);
    if (!ok && r.from !== 'available') movePool(g, r.pool, 'available', r.from as Box, 1);
  } else ok = movePool(g, r.pool, r.from as Box, r.to as Box, 1);
  if (ok > 0) {
    a.used[ri]++;
    a.moved++;
    if (src) ensure(a.spaces, src);
    if (dst) ensure(a.spaces, dst);
    log(g, `${kind ? PIECE_NAME[kind] : r.pool}: ${src ? MAP[src].name : BOX_NAME[r.from]} to ${dst ? MAP[dst].name : BOX_NAME[r.to]}.`);
  }
}
registerState('ev_transfer', {
  faction: (g, a) => a.by,
  enter(g, a) { xferSettle(g, a); },
  prompt(g, a, p) {
    if (!a.sel) {
      p.text(`${cardTitle(a.card)}: ${a.label || 'move pieces'} (${a.moved}/${a.n})`);
      for (const o of xferOpts(g, a)) p.action('mv', `${o.ri}|${o.src ?? ''}|${o.kind ?? ''}`, xferLabel(a, o), { space: o.src ?? undefined, piece: o.kind });
    } else {
      p.text(`${cardTitle(a.card)}: choose the destination`);
      const r = a.rules[a.sel.ri] as XferRule;
      for (const id of xferDests(g, a, r, a.sel.src, a.sel.kind)) p.space(id, MAP[id].name);
      p.action('cancel', undefined, 'Cancel');
    }
    p.action('done', undefined, 'Done');
  },
  act(g, a, verb, arg) {
    if (verb === 'done') { pop(g, { moved: a.moved, spaces: a.spaces }); return; }
    if (verb === 'cancel') { a.sel = null; return; }
    if (verb === 'mv') {
      const [ris, src, kind] = String(arg).split('|');
      const ri = Number(ris);
      const r = a.rules[ri] as XferRule;
      const sk = (kind || undefined) as PieceKind | undefined;
      if (r.to !== 'map') { xferExec(g, a, ri, src || null, sk, null); xferSettle(g, a); return; }
      const dests = xferDests(g, a, r, src || null, sk);
      if (dests.length === 1) { xferExec(g, a, ri, src || null, sk, dests[0]); xferSettle(g, a); return; }
      a.sel = { ri, src: src || null, kind: sk };
      return;
    }
    const sel = a.sel;
    a.sel = null;
    xferExec(g, a, sel.ri, sel.src, sel.kind, arg as string);
    xferSettle(g, a);
  },
});

// ------------------------------------------------------------------ helper: flip pieces

export type FlipMode = 'underground' | 'active' | 'tunnel' | 'untunnel';
export const FLIP_KINDS: Record<FlipMode, [PieceKind, PieceKind][]> = {
  underground: [['nva_guer_a', 'nva_guer_u'], ['vc_guer_a', 'vc_guer_u'], ['us_irreg_a', 'us_irreg_u'], ['arvn_ranger_a', 'arvn_ranger_u']],
  active: [['nva_guer_u', 'nva_guer_a'], ['vc_guer_u', 'vc_guer_a'], ['us_irreg_u', 'us_irreg_a'], ['arvn_ranger_u', 'arvn_ranger_a']],
  tunnel: [['nva_base', 'nva_tunnel'], ['vc_base', 'vc_tunnel']],
  untunnel: [['nva_tunnel', 'nva_base'], ['vc_tunnel', 'vc_base']],
};
export function flipAll(g: Game, id: string, mode: FlipMode, only?: PieceKind[]): number {
  let n = 0;
  for (const [f, t] of FLIP_KINDS[mode]) if (!only || only.includes(f)) n += flipPiece(g, id, f, t, count(g, id, f));
  return n;
}
export function flipPieces(g: Game, c: { card: number; faction: Faction }, o: { by?: Faction; n: number; mode: FlipMode; kinds?: PieceKind[]; filter?: string; data?: any; label?: string }): void {
  push(g, 'ev_flip', { card: c.card, faction: c.faction, by: o.by ?? c.faction, n: o.n, mode: o.mode, kinds: o.kinds ?? null, filter: o.filter ?? ALL, data: o.data ?? {}, label: o.label ?? '', flipped: 0 });
}
function flipCands(g: Game, a: any): [string, PieceKind, PieceKind][] {
  const out: [string, PieceKind, PieceKind][] = [];
  if (a.flipped >= a.n) return out;
  for (const id of SPACE_IDS) {
    if (!callFn(a.filter, g, a, id)) continue;
    for (const [f, t] of FLIP_KINDS[a.mode as FlipMode]) {
      if (a.kinds && !a.kinds.includes(f)) continue;
      if (count(g, id, f) > 0) out.push([id, f, t]);
    }
  }
  return out;
}
registerState('ev_flip', {
  faction: (g, a) => a.by,
  enter(g, a) { if (flipCands(g, a).length === 0) pop(g, { flipped: 0 }); },
  prompt(g, a, p) {
    p.text(`${cardTitle(a.card)}: ${a.label || `flip pieces to ${a.mode}`} (${a.flipped}/${a.n})`);
    for (const [id, f] of flipCands(g, a)) p.piece(id, f, `${PIECE_NAME[f]} in ${MAP[id].name}`);
    p.action('done', undefined, 'Done');
  },
  act(g, a, verb, arg) {
    if (verb === 'done') { pop(g, { flipped: a.flipped }); return; }
    const [id, f] = (arg as string).split(':') as [string, PieceKind];
    const t = FLIP_KINDS[a.mode as FlipMode].find(([x]) => x === f)![1];
    a.flipped += flipPiece(g, id, f, t, 1);
    if (a.flipped >= a.n || flipCands(g, a).length === 0) pop(g, { flipped: a.flipped });
  },
});

// ------------------------------------------------------------------ helper: run a fn once per item, in order

export function eachOf(g: Game, c: { card: number; faction: Faction }, o: { items: string[]; fn: string; by?: Faction; data?: any }): void {
  push(g, 'ev_each', { card: c.card, faction: c.faction, by: o.by ?? c.faction, items: o.items, fn: o.fn, data: o.data ?? {}, i: 0 });
}
function eachAdvance(g: Game, a: any): void {
  a.busy = true;
  try {
    while (top(g)?.args === a) {
      if (a.i >= a.items.length) { a.busy = false; pop(g, { done: true }); return; }
      const item = a.items[a.i++];
      callFn(a.fn, g, a, item);
    }
  } finally {
    a.busy = false;
  }
}
registerState('ev_each', {
  faction: (g, a) => a.by,
  enter(g, a) { eachAdvance(g, a); },
  prompt(g, a, p) { p.text(`${cardTitle(a.card)}: continue`); p.action('done', undefined, 'Continue'); },
  act(g, a) { eachAdvance(g, a); },
  resume(g, a) { if (!a.busy) eachAdvance(g, a); },
});

// ------------------------------------------------------------------ pieces convenience for steps

export function placeN(g: Game, id: string, pool: PoolKind, n: number, as?: PieceKind): number {
  return place(g, id, pool, n, as);
}
export { rollDie, BASES, countBases, countFaction, movePiece, place, removeTo, removePiece, setSupport, shiftSup, count, isBase, FACTION_PIECES, log };
