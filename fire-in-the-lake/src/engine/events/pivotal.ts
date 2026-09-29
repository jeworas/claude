// Pivotal events 121-124 (playbook text). Common precondition: 2+ cards in the RVN Leader box (Minh does not count;
// Failed Attempts do) and the next card is not a Coup card. Extra flags passed to the free Ops:
//   op_march: none.   op_attack: troopsOnly / mandatory (122), mandatory / includeNVA / vcFirst (124).
//   op_terror: spaces, mandatory, oneGuerrillaPerSpace, noFlip (124).
import type { Game } from '../../core/types';
import { count, countOnMap, victoryScore } from '../../core/pieces';
import { CARD } from '../../data/cards';
import { MAP, SPACE_IDS } from '../../data/map';
import { anyOf, aid, freeOp, makeIneligible, movePcs, removeUp, resources, run, xfer } from './dsl';
import { CUR, log, track } from './helpers';
import type { Step } from './helpers';
import * as W from './wh';

export const PIVOTAL: Record<number, Step[]> = {};
function def(n: number, build: () => Step[]): void {
  CUR.card = n;
  CUR.n = 0;
  PIVOTAL[n] = build();
}

const US_POOLS = ['us_troops', 'us_base', 'us_irreg'] as const;

def(121, () => [
  removeUp(['nva_base', 'nva_tunnel'], 2, { by: 'NVA', tunnels: true, label: 'NVA removes 2 of its Bases' }),
  run((g) => { const half = Math.floor(g.resources.NVA / 2); g.resources.NVA -= half; log(g, `NVA Resources reduced to ${g.resources.NVA}.`); }),
  makeIneligible('NVA'),
  xfer(anyOf([...US_POOLS], 'casualties', 'available'), 3, { by: 'US', label: 'US Casualties to Available' }),
]);

def(122, () => [
  freeOp('op_march', { faction: 'NVA' }),
  movePcs(['nva_troops'], 99, { from: (g, id) => MAP[id].type === 'loc' && count(g, id, 'us_troops', 'us_irreg_u', 'us_irreg_a', 'arvn_troops', 'arvn_police', 'arvn_ranger_u', 'arvn_ranger_a') === 0, adjacent: true, by: 'NVA', label: 'NVA Troops on LoCs may move 1 space' }),
  freeOp('op_attack', { faction: 'NVA', extra: { troopsOnly: true, mandatory: true } }),
]);

def(123, () => [
  resources('ARVN', 12),
  aid(12),
  run((g) => {
    for (const p of ['arvn_troops', 'arvn_police', 'arvn_ranger', 'arvn_base'] as const) { g.available[p] += g.out_of_play[p]; g.out_of_play[p] = 0; }
    log(g, 'All Out-of-Play ARVN forces are Available.');
  }),
  xfer(anyOf(['arvn_troops', 'arvn_police'], 'available', 'map'), 4, { by: 'ARVN', label: 'Place ARVN cubes anywhere' }),
]);

def(124, () => [
  freeOp('op_terror', {
    faction: 'VC',
    extra: (g) => {
      const spaces = SPACE_IDS.filter((id) => count(g, id, 'vc_guer_u') > 0);
      return spaces.length ? { spaces, mandatory: true, oneGuerrillaPerSpace: true } : false;
    },
  }),
  xfer(anyOf(['vc_guer', 'vc_base'], 'available', 'map', { toWhere: W.city }), 6, { by: 'VC', label: 'Place VC pieces in Cities' }),
  freeOp('op_attack', { faction: 'VC', extra: { mandatory: true, includeNVA: true, vcFirst: true } }),
]);

void track;

export function leaderBoxCards(g: Game): number {
  return g.leader_box.length + (g.leader !== null ? 1 : 0);
}

export function pivotalPrecondition(g: Game, card: number): boolean {
  if (leaderBoxCards(g) < 2) return false;
  if (g.next != null && CARD[g.next]?.coup) return false;
  switch (card) {
    case 121: return victoryScore(g, 'US') > (g.tmp?.peace_talks ? 25 : 40);
    case 122: return countOnMap(g, 'nva_troops') > countOnMap(g, 'us_troops');
    case 123: return countOnMap(g, 'us_troops') < 20;
    case 124: return SPACE_IDS.filter((id) => MAP[id].country === 'south_vietnam').reduce((n, id) => n + count(g, id, 'vc_guer_u', 'vc_guer_a'), 0) > 20;
    default: return false;
  }
}
