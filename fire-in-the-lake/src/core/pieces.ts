// Shared piece / marker helpers. Engine, events and AI all use these.
// Every placement/removal of pieces MUST go through these functions so that
// pool bookkeeping (available / casualties / out of play) stays consistent.

import { MAP, SPACE_IDS } from '../data/map';
import type { Faction, Game, PieceKind, PoolKind, SpaceDef, SupportLevel } from './types';
import { log } from './framework';

export function space(id: string): SpaceDef {
  const s = MAP[id];
  if (!s) throw new Error(`Unknown space ${id}`);
  return s;
}

export const POOL_OF: Record<PieceKind, PoolKind> = {
  us_troops: 'us_troops', us_base: 'us_base', us_irreg_u: 'us_irreg', us_irreg_a: 'us_irreg',
  arvn_troops: 'arvn_troops', arvn_police: 'arvn_police', arvn_ranger_u: 'arvn_ranger', arvn_ranger_a: 'arvn_ranger', arvn_base: 'arvn_base',
  nva_troops: 'nva_troops', nva_guer_u: 'nva_guer', nva_guer_a: 'nva_guer', nva_base: 'nva_base', nva_tunnel: 'nva_base',
  vc_guer_u: 'vc_guer', vc_guer_a: 'vc_guer', vc_base: 'vc_base', vc_tunnel: 'vc_base',
};

// The piece state a pool piece takes when placed on the map (guerrillas etc. enter Underground).
export const PLACE_AS: Record<PoolKind, PieceKind> = {
  us_troops: 'us_troops', us_base: 'us_base', us_irreg: 'us_irreg_u',
  arvn_troops: 'arvn_troops', arvn_police: 'arvn_police', arvn_ranger: 'arvn_ranger_u', arvn_base: 'arvn_base',
  nva_troops: 'nva_troops', nva_guer: 'nva_guer_u', nva_base: 'nva_base',
  vc_guer: 'vc_guer_u', vc_base: 'vc_base',
};

export const FACTION_OF: Record<PieceKind, Faction> = {
  us_troops: 'US', us_base: 'US', us_irreg_u: 'US', us_irreg_a: 'US',
  arvn_troops: 'ARVN', arvn_police: 'ARVN', arvn_ranger_u: 'ARVN', arvn_ranger_a: 'ARVN', arvn_base: 'ARVN',
  nva_troops: 'NVA', nva_guer_u: 'NVA', nva_guer_a: 'NVA', nva_base: 'NVA', nva_tunnel: 'NVA',
  vc_guer_u: 'VC', vc_guer_a: 'VC', vc_base: 'VC', vc_tunnel: 'VC',
};

export const PIECE_NAME: Record<PieceKind, string> = {
  us_troops: 'US Troops', us_base: 'US Base', us_irreg_u: 'Irregular (U)', us_irreg_a: 'Irregular (A)',
  arvn_troops: 'ARVN Troops', arvn_police: 'Police', arvn_ranger_u: 'Ranger (U)', arvn_ranger_a: 'Ranger (A)', arvn_base: 'ARVN Base',
  nva_troops: 'NVA Troops', nva_guer_u: 'NVA Guerrilla (U)', nva_guer_a: 'NVA Guerrilla (A)', nva_base: 'NVA Base', nva_tunnel: 'NVA Tunneled Base',
  vc_guer_u: 'VC Guerrilla (U)', vc_guer_a: 'VC Guerrilla (A)', vc_base: 'VC Base', vc_tunnel: 'VC Tunneled Base',
};

export const FACTION_PIECES: Record<Faction, PieceKind[]> = {
  US: ['us_troops', 'us_base', 'us_irreg_u', 'us_irreg_a'],
  ARVN: ['arvn_troops', 'arvn_police', 'arvn_ranger_u', 'arvn_ranger_a', 'arvn_base'],
  NVA: ['nva_troops', 'nva_guer_u', 'nva_guer_a', 'nva_base', 'nva_tunnel'],
  VC: ['vc_guer_u', 'vc_guer_a', 'vc_base', 'vc_tunnel'],
};

export const BASES: PieceKind[] = ['us_base', 'arvn_base', 'nva_base', 'nva_tunnel', 'vc_base', 'vc_tunnel'];
export const GUERRILLAS: PieceKind[] = ['nva_guer_u', 'nva_guer_a', 'vc_guer_u', 'vc_guer_a'];

export function isBase(k: PieceKind): boolean { return BASES.includes(k); }
export function isUnderground(k: PieceKind): boolean { return k.endsWith('_u'); }
export function isActiveSide(k: PieceKind): boolean { return k.endsWith('_a'); }

// ---------------------------------------------------------------- counting

export function count(g: Game, sp: string, ...kinds: PieceKind[]): number {
  const p = g.spaces[sp].pieces;
  let n = 0;
  for (const k of kinds) n += p[k] ?? 0;
  return n;
}

export function countFaction(g: Game, sp: string, f: Faction): number {
  return count(g, sp, ...FACTION_PIECES[f]);
}

export function countCOIN(g: Game, sp: string): number {
  return countFaction(g, sp, 'US') + countFaction(g, sp, 'ARVN');
}

export function countInsurgent(g: Game, sp: string): number {
  return countFaction(g, sp, 'NVA') + countFaction(g, sp, 'VC');
}

export function countBases(g: Game, sp: string, f?: Faction): number {
  const kinds = f ? FACTION_PIECES[f].filter(isBase) : BASES;
  return count(g, sp, ...kinds);
}

export function countOnMap(g: Game, ...kinds: PieceKind[]): number {
  let n = 0;
  for (const id of SPACE_IDS) n += count(g, id, ...kinds);
  return n;
}

export function spacesWith(g: Game, ...kinds: PieceKind[]): string[] {
  return SPACE_IDS.filter((id) => count(g, id, ...kinds) > 0);
}

// ---------------------------------------------------------------- moving pieces

function add(g: Game, sp: string, k: PieceKind, n: number): void {
  const p = g.spaces[sp].pieces;
  const v = (p[k] ?? 0) + n;
  if (v < 0) throw new Error(`Negative piece count ${k} in ${sp}`);
  if (v === 0) delete p[k];
  else p[k] = v;
}

// Place up to n pieces from Available. Returns how many were actually placed.
// `as` lets you place e.g. an active guerrilla or tunnel directly (must match the pool).
export function place(g: Game, sp: string, pool: PoolKind, n = 1, as?: PieceKind): number {
  const k = as ?? PLACE_AS[pool];
  if (POOL_OF[k] !== pool) throw new Error(`Cannot place ${pool} as ${k}`);
  const m = Math.min(n, g.available[pool]);
  if (m <= 0) return 0;
  g.available[pool] -= m;
  add(g, sp, k, m);
  return m;
}

// Remove pieces from the map to a destination box.
export function removeTo(g: Game, sp: string, k: PieceKind, n: number, dest: 'available' | 'casualties' | 'out_of_play'): number {
  const m = Math.min(n, count(g, sp, k));
  if (m <= 0) return 0;
  add(g, sp, k, -m);
  g[dest][POOL_OF[k]] += m;
  return m;
}

// Standard removal: US pieces go to Casualties, everything else to Available (rules 3.3.3 / 4).
// US Bases removed go to Casualties too. Use removeTo() when an event specifies otherwise.
export function remove(g: Game, sp: string, k: PieceKind, n = 1): number {
  const dest = FACTION_OF[k] === 'US' ? 'casualties' : 'available';
  return removeTo(g, sp, k, n, dest);
}

export function move(g: Game, from: string, to: string, k: PieceKind, n = 1): number {
  const m = Math.min(n, count(g, from, k));
  if (m <= 0) return 0;
  add(g, from, k, -m);
  add(g, to, k, m);
  return m;
}

// Flip a piece in place (e.g. vc_guer_u -> vc_guer_a, vc_base -> vc_tunnel).
export function flip(g: Game, sp: string, from: PieceKind, to: PieceKind, n = 1): number {
  if (POOL_OF[from] !== POOL_OF[to]) throw new Error(`Cannot flip ${from} to ${to}`);
  const m = Math.min(n, count(g, sp, from));
  if (m <= 0) return 0;
  add(g, sp, from, -m);
  add(g, sp, to, m);
  return m;
}

// Move from Available/Casualties/Out-of-play pools to another pool (e.g. casualties -> available).
export function movePool(g: Game, pool: PoolKind, from: 'available' | 'casualties' | 'out_of_play', to: 'available' | 'casualties' | 'out_of_play', n: number): number {
  const m = Math.min(n, g[from][pool]);
  g[from][pool] -= m;
  g[to][pool] += m;
  return m;
}

// ---------------------------------------------------------------- control / support

export type Control = 'COIN' | 'NVA' | null;

// COIN Control: US+ARVN pieces exceed NVA+VC. NVA Control: NVA pieces exceed all others. (1.7)
export function control(g: Game, sp: string): Control {
  const s = space(sp);
  if (s.type === 'loc') return null;
  const coin = countCOIN(g, sp);
  const nva = countFaction(g, sp, 'NVA');
  const vc = countFaction(g, sp, 'VC');
  if (coin > nva + vc) return 'COIN';
  if (nva > coin + vc) return 'NVA';
  return null;
}

export function isCOINControlled(g: Game, sp: string): boolean { return control(g, sp) === 'COIN'; }
export function isNVAControlled(g: Game, sp: string): boolean { return control(g, sp) === 'NVA'; }

export function canHaveSupport(sp: string): boolean {
  const s = space(sp);
  return s.type !== 'loc' && s.pop > 0;
}

export function setSupport(g: Game, sp: string, level: number): void {
  if (!canHaveSupport(sp)) return;
  const v = Math.max(-2, Math.min(2, level)) as SupportLevel;
  g.spaces[sp].support = v;
}

export function shiftSupport(g: Game, sp: string, delta: number): void {
  setSupport(g, sp, g.spaces[sp].support + delta);
}

export const SUPPORT_NAME: Record<SupportLevel, string> = {
  [-2]: 'Active Opposition', [-1]: 'Passive Opposition', [0]: 'Neutral', [1]: 'Passive Support', [2]: 'Active Support',
};

// ---------------------------------------------------------------- tracks

export function addResources(g: Game, f: 'ARVN' | 'NVA' | 'VC', n: number): void {
  g.resources[f] = clamp(g.resources[f] + n, 0, 75);
}
export function addAid(g: Game, n: number): void { g.aid = clamp(g.aid + n, 0, 75); }
export function addPatronage(g: Game, n: number): void { g.patronage = clamp(g.patronage + n, 0, 75); }
export function setTrail(g: Game, n: number): void { g.trail = clamp(n, 0, 4); }

export function clamp(v: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, v)); }

// ---------------------------------------------------------------- victory scores (7.2)

// Total Support: sum of pop x 2 for Active Support, pop x 1 for Passive Support.
export function totalSupport(g: Game): number {
  let n = 0;
  for (const id of SPACE_IDS) {
    const s = g.spaces[id].support;
    if (s > 0) n += space(id).pop * s;
  }
  return n;
}

export function totalOpposition(g: Game): number {
  let n = 0;
  for (const id of SPACE_IDS) {
    const s = g.spaces[id].support;
    if (s < 0) n += space(id).pop * -s;
  }
  return n;
}

export function coinControlledPop(g: Game): number {
  let n = 0;
  for (const id of SPACE_IDS) if (control(g, id) === 'COIN') n += space(id).pop;
  return n;
}

export function nvaControlledPop(g: Game): number {
  let n = 0;
  for (const id of SPACE_IDS) if (control(g, id) === 'NVA') n += space(id).pop;
  return n;
}

// US: Total Support + US Troops/Bases Available. Threshold > 50.
// ARVN: COIN-controlled Pop + Patronage. Threshold > 50.
// NVA: NVA-controlled Pop + NVA Bases on map. Threshold > 18.
// VC: Total Opposition + VC Bases on map. Threshold > 35.
export function victoryScore(g: Game, f: Faction): number {
  switch (f) {
    case 'US': return totalSupport(g) + g.available.us_troops + g.available.us_base;
    case 'ARVN': return coinControlledPop(g) + g.patronage;
    case 'NVA': return nvaControlledPop(g) + countOnMap(g, 'nva_base', 'nva_tunnel');
    case 'VC': return totalOpposition(g) + countOnMap(g, 'vc_base', 'vc_tunnel');
  }
}

export const VICTORY_THRESHOLD: Record<Faction, number> = { US: 50, ARVN: 50, NVA: 18, VC: 35 };

export function victoryMargin(g: Game, f: Faction): number {
  return victoryScore(g, f) - VICTORY_THRESHOLD[f];
}

export function logPieces(g: Game, verb: string, n: number, k: PieceKind, sp: string): void {
  if (n > 0) log(g, `${verb} ${n} ${PIECE_NAME[k]} in ${space(sp).name}.`);
}
