// Reusable event machinery.
//
// A card side is a list of Steps. The 'event' state runs the steps in order; a step may push helper
// states (ev_spaces, ev_place, ev_remove, ev_move, ev_choose, or a free Op/SA) and the event resumes with the
// next step when they pop. Everything that lives in game state is JSON: helper states refer to behaviour by
// string key. Keys are minted at module load by defCard()'s R() (`c<card>.<n>`) or regFn().
import type { Faction, Game, PieceKind, PoolKind } from '../../core/types';
import { hasState, log, pop, push, registerState, top } from '../../core/framework';
import { MAP, SPACE_IDS } from '../../data/map';
import { CARD } from '../../data/cards';
import {
  BASES, FACTION_OF, FACTION_PIECES, PIECE_NAME, addAid, addPatronage, addResources, count, countBases, countFaction,
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

export const TEXT: Record<number, { u: string; s: string }> = {};
export const CUR = { card: 0, n: 0 };
// Register a lambda under a deterministic key while a card definition is being built (at module load).
export function K(fn: Fn): string {
  return regFn(`c${CUR.card}.${CUR.n++}`, fn);
}
export function defCard(n: number, u: string, s: string, build: () => CardImpl): void {
  CUR.card = n;
  CUR.n = 0;
  TEXT[n] = { u, s };
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
export function track(g: Game, what: 'aid' | 'patronage' | 'trail' | 'ARVN' | 'NVA' | 'VC', n: number): void {
  if (what === 'aid') addAid(g, n);
  else if (what === 'patronage') addPatronage(g, n);
  else if (what === 'trail') g.trail = Math.max(0, Math.min(4, g.trail + n));
  else addResources(g, what, n);
}
export function effAid(g: Game): number { return g.aid; }

// Pool -> pool shuffles ("Out of Play to Available", ...). Returns number moved.
export function pools(g: Game, pool: PoolKind, from: 'available' | 'casualties' | 'out_of_play', to: 'available' | 'casualties' | 'out_of_play', n: number): number {
  return movePool(g, pool, from, to, n);
}

// Free op / special activity. Silently skips if that state is not registered yet.
export function freeOp(g: Game, state: string, faction: Faction, extra: any = {}): void {
  if (!hasState(state)) { log(g, `(free ${state} not available)`); return; }
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
  push(g, 'ev_spaces', { card: c.card, faction: c.faction, by: o.by ?? c.faction, n: o.n, filter: o.filter ?? ALL, apply: o.apply, data: o.data ?? {}, label: o.label ?? '', chosen: [] });
}
function spacesCands(g: Game, a: any): string[] {
  return SPACE_IDS.filter((id) => !a.chosen.includes(id) && callFn(a.filter, g, a, id));
}
function spacesSettle(g: Game, a: any): void {
  if (top(g)?.args !== a) return;
  if (a.chosen.length >= a.n || spacesCands(g, a).length === 0) pop(g, { spaces: a.chosen });
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
    if (verb === 'done') { pop(g, { spaces: a.chosen }); return; }
    a.chosen.push(arg as string);
    a.busy = true;
    if (a.apply) callFn(a.apply, g, a, arg as string);
    a.busy = false;
    spacesSettle(g, a);
  },
  resume(g, a) { if (!a.busy) spacesSettle(g, a); },
});

// Shift support in up to n spaces (delta > 0 toward Support, < 0 toward Opposition).
export function shiftSupportIn(g: Game, c: { card: number; faction: Faction }, o: { n: number; delta: number; by?: Faction; label?: string; filter?: string }): void {
  push(g, 'ev_spaces', { card: c.card, faction: c.faction, by: o.by ?? c.faction, n: o.n, filter: o.filter ?? 'shift.filter', apply: 'shift.apply', data: { delta: o.delta }, label: o.label ?? (o.delta > 0 ? 'shift toward Support' : 'shift toward Opposition'), chosen: [] });
}
regFn('shift.filter', (g, a, id) => canHaveSupport(id) && (a.data.delta > 0 ? g.spaces[id].support < 2 : g.spaces[id].support > -2));
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
  return SPACE_IDS.filter((id) => (!a.per || (a.counts[id] ?? 0) < a.per) && callFn(a.filter, g, a, id));
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
  basesFirst?: boolean;                             // allow removing bases while other pieces remain
  data?: any;
  label?: string;
}
export function removePieces(g: Game, c: { card: number; faction: Faction }, o: RemoveOpts): void {
  push(g, 'ev_remove', { card: c.card, faction: c.faction, by: o.by ?? c.faction, n: o.n, kinds: o.kinds, filter: o.filter ?? ALL, pfilter: o.pfilter, dest: o.dest ?? 'std', per: o.per ?? 0, basesFirst: !!o.basesFirst, data: o.data ?? {}, label: o.label ?? '', removed: 0, counts: {}, spaces: [] });
}
function removeCands(g: Game, a: any): [string, PieceKind][] {
  const out: [string, PieceKind][] = [];
  if (a.removed >= a.n) return out;
  for (const id of SPACE_IDS) {
    if (a.per && (a.counts[id] ?? 0) >= a.per) continue;
    if (!callFn(a.filter, g, a, id)) continue;
    for (const k of a.kinds as PieceKind[]) {
      if (count(g, id, k) <= 0) continue;
      if (!a.basesFirst && isBase(k)) {
        const f = FACTION_OF[k];
        if (FACTION_PIECES[f].some((k2) => !isBase(k2) && count(g, id, k2) > 0)) continue;
      }
      if (a.pfilter && !callFn(a.pfilter, g, a, id, k)) continue;
      out.push([id, k]);
    }
  }
  return out;
}
function removeSettle(g: Game, a: any): void {
  if (top(g)?.args !== a) return;
  if (removeCands(g, a).length === 0) pop(g, { removed: a.removed, spaces: a.spaces });
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
    if (verb === 'done') { pop(g, { removed: a.removed, spaces: a.spaces }); return; }
    const [id, k] = (arg as string).split(':') as [string, PieceKind];
    const m = doRemove(g, id, k, a.dest);
    a.removed += m;
    a.counts[id] = (a.counts[id] ?? 0) + m;
    ensure(a.spaces, id);
    if (m > 0) log(g, `Removed ${PIECE_NAME[k]} from ${MAP[id].name}.`);
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
    callFn(a.fn, g, a, arg as number);
    a.busy = false;
    if (top(g) === frame) pop(g, { choice: arg });
  },
  resume(g, a) { if (!a.busy && top(g)?.args === a) pop(g, { choice: -1 }); },
});

// ------------------------------------------------------------------ pieces convenience for steps

export function placeN(g: Game, id: string, pool: PoolKind, n: number, as?: PieceKind): number {
  return place(g, id, pool, n, as);
}
export { BASES, countBases, countFaction, movePiece, place, removeTo, removePiece, setSupport, shiftSup, count, isBase, FACTION_PIECES, log };
