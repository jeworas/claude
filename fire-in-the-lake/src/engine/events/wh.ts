// Space predicates ("where" filters) shared by the card files.
import type { Game, PieceKind, Faction } from '../../core/types';
import { MAP } from '../../data/map';
import { control, count, countBases, countCOIN, countFaction, countInsurgent } from '../../core/pieces';
import type { Where } from './dsl';

export const sv: Where = (g, id) => MAP[id].country === 'south_vietnam';
export const prov: Where = (g, id) => MAP[id].type === 'province';
export const city: Where = (g, id) => MAP[id].type === 'city';
export const loc: Where = (g, id) => MAP[id].type === 'loc';
export const notLoc: Where = (g, id) => MAP[id].type !== 'loc';
export const popd: Where = (g, id) => MAP[id].pop > 0;
export const coastal: Where = (g, id) => MAP[id].coastal;
export const lc: Where = (g, id) => MAP[id].country === 'laos' || MAP[id].country === 'cambodia';
export const laos: Where = (g, id) => MAP[id].country === 'laos';
export const cambodia: Where = (g, id) => MAP[id].country === 'cambodia';
export const nvn: Where = (g, id) => MAP[id].country === 'north_vietnam';
export const outside: Where = (g, id) => MAP[id].country !== 'south_vietnam';
export const highland: Where = (g, id) => MAP[id].terrain === 'highland';
export const jungle: Where = (g, id) => MAP[id].terrain === 'jungle';
export const lowland: Where = (g, id) => MAP[id].terrain === 'lowland';
export const anySpace: Where = () => true;
export const mekong: Where = (g, id) => MAP[id].mekong;
export const highway: Where = (g, id) => MAP[id].highway;
export const support: Where = (g, id) => g.spaces[id].support > 0;
export const oppose: Where = (g, id) => g.spaces[id].support < 0;
export const neutral: Where = (g, id) => g.spaces[id].support === 0 && MAP[id].pop > 0 && MAP[id].type !== 'loc';
export const activeSupport: Where = (g, id) => g.spaces[id].support === 2;
export const activeOpp: Where = (g, id) => g.spaces[id].support === -2;
export const coinCtl: Where = (g, id) => control(g, id) === 'COIN';
export const nvaCtl: Where = (g, id) => control(g, id) === 'NVA';
export const noCtl: Where = (g, id) => control(g, id) === null && MAP[id].type !== 'loc';
export const terror: Where = (g, id) => g.spaces[id].terror > 0;

export const has = (...kinds: PieceKind[]): Where => (g, id) => count(g, id, ...kinds) > 0;
export const hasFaction = (f: Faction): Where => (g, id) => countFaction(g, id, f) > 0;
export const hasCOIN: Where = (g, id) => countCOIN(g, id) > 0;
export const hasIns: Where = (g, id) => countInsurgent(g, id) > 0;
export const hasBase = (f?: Faction): Where => (g, id) => countBases(g, id, f) > 0;
export const and = (...ws: Where[]): Where => (g, id) => ws.every((w) => w(g, id));
export const or = (...ws: Where[]): Where => (g, id) => ws.some((w) => w(g, id));
export const not = (w: Where): Where => (g, id) => !w(g, id);
export const adjacentTo = (ids: string[]): Where => (g, id) => ids.some((i) => MAP[i].adjacent.includes(id));
export const isId = (...ids: string[]): Where => (g, id) => ids.includes(id);
export const adjacentToWhere = (w: Where): Where => (g, id) => MAP[id].adjacent.some((a) => w(g, a));
export const popAtLeast = (n: number): Where => (g, id) => MAP[id].pop >= n;

export function sum(g: Game, w: Where, f: (id: string) => number, ids: string[]): number {
  let n = 0;
  for (const id of ids) if (w(g, id)) n += f(id);
  return n;
}

export const outsideSouth: Where = (g, id) => MAP[id].country !== 'south_vietnam';
export const near = (id: string): string[] => [id, ...MAP[id].adjacent];
export const withinOneOf = (ids: string[]): Where => (g, id) => ids.some((i) => i === id || MAP[i].adjacent.includes(id));
export const coinBase: Where = (g, id) => count(g, id, 'us_base', 'arvn_base') > 0;
export const tunneled: Where = (g, id) => count(g, id, 'nva_tunnel', 'vc_tunnel') > 0;
export const hasNVA: Where = (g, id) => countFaction(g, id, 'NVA') > 0;
export const hasVC: Where = (g, id) => countFaction(g, id, 'VC') > 0;
export const hasUS: Where = (g, id) => countFaction(g, id, 'US') > 0;
