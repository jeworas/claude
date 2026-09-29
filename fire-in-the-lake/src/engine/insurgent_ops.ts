// NVA / VC Operations (3.3) and Special Activities (4.4, 4.5).
//
// States registered (all pop with { done: true, spaces: string[] }):
//   op_rally, op_march, op_attack, op_terror            (faction: 'NVA' | 'VC')
//   sa_infiltrate, sa_bombard                             (NVA)
//   sa_tax, sa_subvert                                    (VC)
//   sa_ambush                                             (NVA or VC, standalone Ambush)
//   ins_remove                                            (internal helper: choose COIN pieces to remove)
//
// Common args: { faction, free?, limited?, spaces?, max? }.
// Extra args documented here:
//   op_attack: { ambush?: boolean }  Ambush may replace Attack in up to 2 spaces (1 if limited). Default true.
//              Pass ambush:false when the Special Activity is being taken separately (via sa_ambush).
//   sa_*:      cost no Resources. `free` is accepted and ignored.
//
// Simplifications (see also the report): removal of enemy pieces asks the attacker to pick
// among the legal piece kinds; Trail improvement is offered inside a Laos/Cambodia Rally space;
// Ambush during March is not modelled (use sa_ambush).

import { registerState, push, pop, log, rollDie } from '../core/framework';
import type { Prompt } from '../core/framework';
import type { Faction, Game, PieceKind, PoolKind } from '../core/types';
import { SPACE_IDS } from '../data/map';
import {
  space, count, countCOIN, countBases, place, remove, move, flip, addResources, setTrail, addPatronage,
  shiftSupport, isBase, PIECE_NAME, canHaveSupport,
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
const US_KINDS: PieceKind[] = ['us_troops', 'us_base', 'us_irreg_u', 'us_irreg_a'];

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
  pop(g, { done: true, spaces: a.done });
}

function selectPrompt(a: any, p: Prompt, cands: string[], text: string): void {
  p.text(text);
  p.select(a.done);
  for (const id of cands) p.space(id, nm(id));
  p.action('done', undefined, 'Done');
}

// After an act: back to selection, ending automatically if nothing more is possible.
function next(g: Game, a: any, cands: (g: Game, a: any) => string[]): void {
  a.cur = null;
  a.phase = 'select';
  a.pending = null;
  if (!roomLeft(a) || cands(g, a).length === 0) finish(g, a);
}

function spaceDone(g: Game, a: any, id: string, cands: (g: Game, a: any) => string[]): void {
  a.done.push(id);
  next(g, a, cands);
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

// ================================================================= RALLY (3.3.1)

const rallyCost = (g: Game, a: any, f: Ins, id: string) =>
  a.free ? 0 : (f === 'NVA' && g.trail >= 4 && isLaosCamb(id) ? 0 : 1);
const trailCost = (a: any) => (a.free ? 0 : 2);
const trailBlocked = (g: Game) => hasMomentum(g, 10) || hasMomentum(g, 38);

function manyCount(g: Game, f: Ins, id: string): number {
  const b = ownBases(g, id, f);
  return f === 'VC' ? space(id).pop + b : g.trail + b;
}

function rallyOpts(g: Game, a: any, f: Ins, id: string): { key: string; label: string }[] {
  const d = GK[f];
  const out: { key: string; label: string }[] = [];
  const c = rallyCost(g, a, f, id);
  const own = ownBases(g, id, f);
  if (canPay(g, f, c, a)) {
    if (g.available[d.pool] > 0) out.push({ key: 'guer', label: 'Place 1 Guerrilla' });
    const n = own > 0 ? manyCount(g, f, id) : 0;
    if (n > 1 && g.available[d.pool] > 0) out.push({ key: 'many', label: `Place up to ${n} Guerrillas (at Base)` });
    if (gTot(g, id, f) >= 2 && countBases(g, id) < 2 && g.available[d.bpool] > 0) {
      out.push({ key: 'base', label: 'Replace 2 Guerrillas with a Base' });
    }
    if (f === 'VC' && own > 0 && gA(g, id, f) > 0) out.push({ key: 'flip', label: 'Flip Guerrillas Underground (at Base)' });
  }
  if (f === 'NVA' && isLaosCamb(id) && g.trail < 4 && !trailBlocked(g) && canPay(g, f, trailCost(a), a)) {
    out.push({ key: 'trail', label: 'Improve the Trail' });
  }
  return out;
}

function rallyCands(g: Game, a: any): string[] {
  if (!roomLeft(a)) return [];
  const f = facOf(g, a);
  return SPACE_IDS.filter((id) => {
    const s = space(id);
    if (s.type === 'loc' || !openSpace(a, id)) return false;
    if (g.spaces[id].support > 0) return false;
    return rallyOpts(g, a, f, id).length > 0;
  });
}

registerState('op_rally', {
  faction: (g, a) => facOf(g, a),
  enter(g, a) {
    initArgs(a);
    if (rallyCands(g, a).length === 0) { log(g, 'No legal Rally spaces.'); finish(g, a); }
  },
  prompt(g, a, p) {
    const f = facOf(g, a);
    if (a.phase === 'select') {
      selectPrompt(a, p, rallyCands(g, a), `${f} Rally: select a space (${a.done.length} done).`);
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
      a.cur = String(arg);
      a.phase = 'space';
      return;
    }
    if (verb === 'back') { a.cur = null; a.phase = 'select'; return; }
    const id = a.cur as string;
    const d = GK[f];
    const c = rallyCost(g, a, f, id);
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
      case 'trail':
        pay(g, f, trailCost(a), a);
        setTrail(g, g.trail + 1);
        log(g, `NVA Rally: improves the Trail to ${g.trail}.`);
        break;
    }
    spaceDone(g, a, id, rallyCands);
  },
});

// ================================================================= MARCH (3.3.2)

const MOVERS: Record<Ins, PieceKind[]> = {
  NVA: ['nva_guer_u', 'nva_guer_a', 'nva_troops'],
  VC: ['vc_guer_u', 'vc_guer_a'],
};

const passable = (id: string) => {
  const s = space(id);
  return s.type !== 'loc' && (s.country === 'laos' || s.country === 'cambodia' || s.country === 'north_vietnam');
};

// Spaces whose pieces can reach dest: adjacent ones, plus (NVA, Trail > 0) chains through Laos/Cambodia/N. Vietnam.
export function marchSources(g: Game, f: Ins, dest: string): string[] {
  const res = new Set<string>();
  const q: string[] = [];
  for (const n of space(dest).adjacent) { res.add(n); q.push(n); }
  if (f === 'NVA' && g.trail > 0) {
    while (q.length) {
      const y = q.shift()!;
      if (y === dest || !passable(y)) continue;
      for (const n of space(y).adjacent) {
        if (n === dest || res.has(n)) continue;
        res.add(n);
        q.push(n);
      }
    }
  }
  res.delete(dest);
  return [...res];
}

const lockOf = (a: any, id: string, k: PieceKind): number => a.lock?.[id]?.[k] ?? 0;
const movable = (g: Game, a: any, id: string, k: PieceKind) => count(g, id, k) - lockOf(a, id, k);
const marchCost = (g: Game, a: any, f: Ins, id: string) =>
  a.free ? 0 : (f === 'NVA' && g.trail >= 4 && isLaosCamb(id) ? 0 : 1);

function marchCands(g: Game, a: any): string[] {
  if (!roomLeft(a)) return [];
  const f = facOf(g, a);
  return SPACE_IDS.filter((id) => {
    if (!openSpace(a, id) || !canPay(g, f, marchCost(g, a, f, id), a)) return false;
    return marchSources(g, f, id).some((s) => MOVERS[f].some((k) => movable(g, a, s, k) > 0));
  });
}

function lockAdd(a: any, id: string, k: PieceKind, n: number): void {
  if (n <= 0) return;
  a.lock = a.lock ?? {};
  a.lock[id] = a.lock[id] ?? {};
  a.lock[id][k] = (a.lock[id][k] ?? 0) + n;
}

function noteMoved(a: any, src: string, k: PieceKind, n: number): void {
  const c = a.cur;
  c.groups[src] = c.groups[src] ?? {};
  c.groups[src][k] = (c.groups[src][k] ?? 0) + n;
  c.count += n;
}

function finishDest(g: Game, a: any): void {
  const f = facOf(g, a);
  const d = GK[f];
  const D = a.cur.dest as string;
  const risky = space(D).type === 'loc' || g.spaces[D].support > 0;
  const coin = countCOIN(g, D);
  let mu = 0, ma = 0, mt = 0, fu = 0;
  for (const kinds of Object.values(a.cur.groups as Record<string, Partial<Record<PieceKind, number>>>)) {
    const gu = kinds[d.u] ?? 0, ga = kinds[d.a] ?? 0, tr = kinds['nva_troops'] ?? 0;
    const total = gu + ga + tr;
    mu += gu; ma += ga; mt += tr;
    if (risky && gu > 0 && total + coin > 3) fu += gu;
  }
  if (fu > 0) flip(g, D, d.u, d.a, fu);
  lockAdd(a, D, d.u, mu - fu);
  lockAdd(a, D, d.a, ma + fu);
  lockAdd(a, D, 'nva_troops', mt);
  pay(g, f, marchCost(g, a, f, D), a);
  log(g, `${f} March: ${a.cur.count} piece(s) into ${nm(D)}${fu > 0 ? ' (Guerrillas activated)' : ''}.`);
  a.done.push(D);
  next(g, a, marchCands);
}

registerState('op_march', {
  faction: (g, a) => facOf(g, a),
  enter(g, a) {
    initArgs(a);
    a.lock = {};
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
    p.text(`March into ${nm(D)}: click pieces to move (${a.cur.count} moved).`);
    p.select([D]);
    const srcs = marchSources(g, f, D);
    for (const s of srcs) {
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

const AMBUSH_MAX = (a: any) => (a.limited ? 1 : 2);

function ambushOk(g: Game, a: any, f: Ins, id: string): boolean {
  if (a.ambush === false && !a.saOnly) return false;
  if (hasMomentum(g, 17)) return false; // Claymores
  if ((a.ambushes ?? 0) >= AMBUSH_MAX(a)) return false;
  return gU(g, id, f) > 0 && countCOIN(g, id) > 0;
}

function attackOpts(g: Game, a: any, f: Ins, id: string): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  if (a.saOnly) {
    if (ambushOk(g, a, f, id)) out.push({ key: 'ambush', label: 'Ambush' });
    return out;
  }
  if (gTot(g, id, f) > 0) out.push({ key: 'attack', label: 'Attack with Guerrillas' });
  const need = f === 'NVA' && cap(g, 45) === 'shaded' ? 1 : 2;
  if (f === 'NVA' && count(g, id, 'nva_troops') >= need) out.push({ key: 'troops', label: 'Attack with NVA Troops' });
  if (ambushOk(g, a, f, id)) out.push({ key: 'ambush', label: 'Ambush (Special Activity)' });
  return out;
}

function attackCands(g: Game, a: any): string[] {
  if (!roomLeft(a)) return [];
  const f = facOf(g, a);
  const c = a.saOnly ? 0 : (a.free ? 0 : 1);
  return SPACE_IDS.filter((id) => {
    if (!openSpace(a, id) || countCOIN(g, id) === 0) return false;
    if (!canPay(g, f, c, a)) return false;
    return attackOpts(g, a, f, id).length > 0;
  });
}

function attackResume(g: Game, a: any, result: any): void {
  const pd = a.pending;
  if (!pd) return;
  const f = facOf(g, a);
  const d = GK[f];
  const removed: Record<string, number> = result?.removed ?? {};
  let us = 0;
  for (const k of US_KINDS) us += removed[k] ?? 0;
  if (us > 0) {
    // Attrition (3.3.3): one attacking piece is lost per US piece removed.
    let lose = us;
    const order: PieceKind[] = pd.type === 'troops' ? ['nva_troops'] : [d.a, d.u];
    for (const k of order) if (lose > 0) lose -= remove(g, pd.space, k, lose);
    log(g, `${f} suffers Attrition (${us - lose}) in ${nm(pd.space)}.`);
  }
  if (pd.type === 'troops' && cap(g, 45) === 'unshaded') remove(g, pd.space, 'nva_troops', 1); // PT-76 (unshaded): a Troop is lost
  if (pd.type === 'ambush') a.ambushes = (a.ambushes ?? 0) + 1;
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
  if (verb === 'back') { a.cur = null; a.phase = 'select'; return; }
  const id = a.cur as string;
  const c = a.saOnly ? 0 : (a.free ? 0 : 1);
  pay(g, f, c, a);
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
  if (arg === 'troops') {
    const per = f === 'NVA' && cap(g, 45) === 'shaded' ? 1 : 2;
    const n = Math.floor(count(g, id, 'nva_troops') / per);
    log(g, `NVA Troops Attack ${nm(id)}: ${n} removal(s).`);
    a.pending = { type: 'troops', space: id };
    return startRemove(g, f, id, n);
  }
  // Ambush
  flip(g, id, d.u, d.a, 1);
  log(g, `${f} Ambushes in ${nm(id)}.`);
  a.pending = { type: 'ambush', space: id };
  return startRemove(g, f, id, 2);
}

function attackDef(saOnly: boolean) {
  return {
    faction: (g: Game, a: any) => facOf(g, a),
    enter(g: Game, a: any) {
      initArgs(a);
      a.ambushes = 0;
      a.saOnly = saOnly;
      if (attackCands(g, a).length === 0) { log(g, saOnly ? 'No legal Ambush.' : 'No legal Attack.'); finish(g, a); }
    },
    prompt(g: Game, a: any, p: Prompt) {
      const f = facOf(g, a);
      const what = saOnly ? 'Ambush' : 'Attack';
      if (a.phase === 'select') {
        selectPrompt(a, p, attackCands(g, a), `${f} ${what}: select a space (${a.done.length} done).`);
        return;
      }
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

function terrorEffective(g: Game, id: string, f: Ins): boolean {
  return gU(g, id, f) > 0 || (f === 'NVA' && count(g, id, 'nva_troops') > 0);
}

function terrorCands(g: Game, a: any): string[] {
  if (!roomLeft(a)) return [];
  const f = facOf(g, a);
  if (!canPay(g, f, 1, a)) return [];
  return SPACE_IDS.filter((id) => {
    if (!openSpace(a, id) || !terrorEffective(g, id, f)) return false;
    return g.spaces[id].terror > 0 || totalTerror(g) < TERROR_MARKER_CAP;
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
    pay(g, f, 1, a);
    if (gU(g, id, f) > 0) flip(g, id, GK[f].u, GK[f].a, 1);
    const st = g.spaces[id];
    if (st.terror === 0) st.terror = 1;
    if (s.type !== 'loc' && canHaveSupport(id)) {
      if (f === 'VC') shiftSupport(g, id, -1);
      else if (st.support > 0) shiftSupport(g, id, -1);
    }
    log(g, `${f} Terror in ${s.name}${s.type === 'loc' ? ' (Sabotage)' : ''}.`);
    spaceDone(g, a, id, terrorCands);
  },
});

// ================================================================= INFILTRATE (4.4.1)

function infiltrateN(g: Game, id: string): number {
  return g.trail + ownBases(g, id, 'NVA');
}

function infiltrateCands(g: Game, a: any): string[] {
  if (!roomLeft(a)) return [];
  return SPACE_IDS.filter((id) => {
    if (space(id).type === 'loc' || !openSpace(a, id)) return false;
    if (ownBases(g, id, 'NVA') === 0) return false;
    return infiltrateN(g, id) > 0 && (g.available.nva_troops > 0 || g.available.nva_guer > 0 || vcTargets(g, id).length > 0);
  });
}

function vcTargets(g: Game, id: string): PieceKind[] {
  const gs = (['vc_guer_u', 'vc_guer_a'] as PieceKind[]).filter((k) => count(g, id, k) > 0);
  if (gs.length) return gs;
  return (['vc_base', 'vc_tunnel'] as PieceKind[]).filter((k) => count(g, id, k) > 0 && g.available.nva_base > 0);
}

registerState('sa_infiltrate', {
  faction: () => 'NVA',
  enter(g, a) {
    initArgs(a);
    a.faction = 'NVA';
    if (hasMomentum(g, 46)) a.max = Math.min(a.max ?? Infinity, 1); // 559th Transport Grp
    a.left = 0;
    if (infiltrateCands(g, a).length === 0) { log(g, 'No legal Infiltrate spaces.'); finish(g, a); }
  },
  prompt(g, a, p) {
    if (a.phase === 'select') return selectPrompt(a, p, infiltrateCands(g, a), `Infiltrate: select a space with an NVA Base (${a.done.length} done).`);
    const id = a.cur as string;
    p.select([id]);
    if (a.phase === 'mode') {
      p.text(`Infiltrate ${nm(id)}: up to ${infiltrateN(g, id)} pieces.`);
      if (g.available.nva_troops > 0 || g.available.nva_guer > 0) p.action('mode', 'build', 'Build up (place Troops/Guerrillas)', { space: id });
      if (vcTargets(g, id).length > 0) p.action('mode', 'takeover', 'Take over VC pieces', { space: id });
      p.action('back', undefined, 'Choose another space');
    } else if (a.phase === 'build') {
      p.text(`Place NVA pieces in ${nm(id)} (${a.left} left).`);
      if (a.left > 0 && g.available.nva_troops > 0) p.action('place', 'troop', 'Place NVA Troops', { space: id });
      if (a.left > 0 && g.available.nva_guer > 0) p.action('place', 'guer', 'Place NVA Guerrilla', { space: id });
      p.action('finish', undefined, 'Finish this space');
    } else {
      p.text(`Replace VC pieces in ${nm(id)} (${a.left} left).`);
      if (a.left > 0) for (const k of vcTargets(g, id)) p.piece(id, k, `Replace ${PIECE_NAME[k]}`);
      p.action('finish', undefined, 'Finish this space');
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
      a.phase = arg === 'build' ? 'build' : 'takeover';
      a.left = infiltrateN(g, id);
      a.acted = 0;
      return;
    }
    if (verb === 'finish') {
      if (a.acted > 0) return spaceDone(g, a, id, infiltrateCands);
      a.phase = 'mode';
      return;
    }
    if (a.phase === 'build') {
      if (arg === 'troop') place(g, id, 'nva_troops', 1);
      else place(g, id, 'nva_guer', 1);
      a.left--; a.acted++;
    } else {
      const k = String(arg).split(':')[1] as PieceKind;
      const wasBase = isBase(k);
      const side = k === 'vc_guer_a' ? 'nva_guer_a' : 'nva_guer_u';
      remove(g, id, k, 1);
      if (wasBase) place(g, id, 'nva_base', 1);
      else place(g, id, 'nva_guer', 1, side);
      a.left--; a.acted++;
    }
    if (a.left <= 0) {
      log(g, `NVA Infiltrates ${nm(id)}.`);
      spaceDone(g, a, id, infiltrateCands);
    }
  },
});

// ================================================================= BOMBARD (4.4.2)

function bombardSource(g: Game, a: any, t: string): string | null {
  const range = cap(g, 32) === 'shaded' ? 2 : 1;
  const used: string[] = a.usedSrc ?? [];
  const cand = new Set<string>([t]);
  let frontier = [t];
  for (let r = 0; r < range; r++) {
    const nf: string[] = [];
    for (const x of frontier) for (const y of space(x).adjacent) if (!cand.has(y)) { cand.add(y); nf.push(y); }
    frontier = nf;
  }
  for (const s of cand) if (!used.includes(s) && count(g, s, 'nva_troops') >= 3) return s;
  return null;
}

function bombardCands(g: Game, a: any): string[] {
  if (!roomLeft(a)) return [];
  return SPACE_IDS.filter((id) =>
    openSpace(a, id) && count(g, id, 'us_troops', 'arvn_troops') > 0 && bombardSource(g, a, id) !== null);
}

registerState('sa_bombard', {
  faction: () => 'NVA',
  enter(g, a) {
    initArgs(a);
    a.faction = 'NVA';
    a.usedSrc = [];
    const c32 = cap(g, 32);
    const dflt = c32 === 'unshaded' ? 1 : (c32 === 'shaded' ? 3 : 2);
    a.max = Math.min(a.max ?? Infinity, dflt);
    if (bombardCands(g, a).length === 0) { log(g, 'No legal Bombard targets.'); finish(g, a); }
  },
  prompt(g, a, p) { selectPrompt(a, p, bombardCands(g, a), `Bombard: select a target space (${a.done.length} done).`); },
  act(g, a, verb, arg) {
    if (verb === 'done') return finish(g, a);
    const id = String(arg);
    const src = bombardSource(g, a, id)!;
    a.usedSrc.push(src);
    a.pending = { space: id };
    log(g, `NVA Bombards ${nm(id)} from ${nm(src)}.`);
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
  return SPACE_IDS.filter((id) => openSpace(a, id) && gU(g, id, 'VC') > 0);
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
    const gain = s.type === 'loc' ? s.econ : 2;
    addResources(g, 'VC', gain);
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
        flip(g, id, 'vc_guer_u', 'vc_guer_a', 1);
        a.pending = { space: id };
        return startRemove(g, 'VC', id, 2, ARVN_CUBES);
      }
      a.phase = 'replace';
      return;
    }
    const k = String(arg).split(':')[1] as PieceKind;
    flip(g, id, 'vc_guer_u', 'vc_guer_a', 1);
    remove(g, id, k, 1);
    place(g, id, 'vc_guer', 1);
    addPatronage(g, -1);
    log(g, `VC Subverts ${nm(id)} (replaces an ARVN cube).`);
    spaceDone(g, a, id, subvertCands);
  },
  resume(g, a) {
    if (!a.pending) return;
    addPatronage(g, -1);
    log(g, `VC Subverts ${nm(a.pending.space)}: Patronage -1.`);
    spaceDone(g, a, a.pending.space, subvertCands);
  },
});
